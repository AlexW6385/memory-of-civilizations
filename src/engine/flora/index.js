// Vegetation in the viewer. Plants are scattered cell by cell in a worker (trees and shrubs in
// cells of 128 m out to the far view, grass in cells of 16 m around the viewer), then drawn as
// instanced meshes per species, variant and level of detail, swaying in the wind.

import * as THREE from 'three/webgpu';
import { uniform, texture, uv, positionLocal, time, sin, cos, vec3, vec4, float, attribute, instanceIndex, hash, mix, normalWorld, max, dot, normalize, faceDirection, cameraViewMatrix } from 'three/tsl';
import { SPECIES, VARIANTS, speciesGeometry } from './species.js';
import { foliageTexture } from './textures.js';
import { MAX_DENSITY, NEAR_ONLY } from '../../world/flora-rules.js';
import { material as paletteMaterial } from '../materials.js';
import { ENV } from '../env.js';
import { HITCH } from '../hitch.js';

const BIG = 128, SMALL = 16, NEAR_R = 64;

const FOLIAGE_TEX = { acacia: 'acacia', broad: 'broad', broad_dark: 'broad', tamarisk: 'tamarisk', reed: 'reed', grass: 'grass', grass_dry: 'grass', needles: 'needles', scale: 'scale', olive: 'olive', oleander: 'oleander', sugi: 'scale', maple: 'maple', bamboo: 'bamboo', teak: 'broad' };
const FOLIAGE_TINT = { teak: '#c4c48a', sugi: '#a8b29a', broad_dark: '#9aa58f', grass_dry: '#e2cf96', grass: '#ffffff' };

/** The wind: a sway of the upper parts, stronger in a windy weather, each plant with its own phase. */
function swayNode(amount) {
  const ph = hash(instanceIndex).mul(6.28);
  const s = attribute('sway', 'float');
  const gust = sin(time.mul(0.37).add(ph.mul(0.3))).mul(0.5).add(0.8);
  const amp = uniform(amount).mul(ENV.wind.length().mul(0.6).add(0.4)).mul(gust).mul(s);
  return positionLocal.add(vec3(sin(time.mul(1.7).add(ph)).mul(amp).add(ENV.wind.x.mul(amp).mul(0.6)), 0, cos(time.mul(1.3).add(ph)).mul(amp).add(ENV.wind.y.mul(amp).mul(0.6))));
}

const mats = new Map();
export function foliageMaterial(kind, amount) {
  const key = `f:${kind}`;
  if (mats.has(key)) return mats.get(key);
  const tex = foliageTexture(FOLIAGE_TEX[kind] || kind);
  const m = new THREE.MeshStandardNodeMaterial({ side: THREE.DoubleSide, alphaTest: 0.5, transparent: false });
  const t = texture(tex, uv());
  const tint = new THREE.Color(FOLIAGE_TINT[kind] || '#ffffff');
  m.colorNode = t.rgb.mul(uniform(tint));
  m.opacityNode = t.a;
  m.roughness = 0.8;
  // light through the leaves: a little of the sun's colour on the side away from it
  const back = max(dot(normalWorld, ENV.sunDir).negate(), 0).mul(0.18);
  m.emissiveNode = t.rgb.mul(ENV.sunColor).mul(back).mul(0.25);
  m.positionNode = swayNode(amount);
  // a crown or a tuft is lit as a whole, not card by card: bend the cards' normals up toward the
  // sky, so that cards seen from behind are not black
  const nW = normalize(normalWorld.mul(faceDirection).mul(0.4).add(vec3(0, 0.6, 0)));
  m.normalNode = normalize(cameraViewMatrix.mul(vec4(nW, 0)).xyz);
  mats.set(key, m);
  return m;
}
export function solidMaterial(key, amount) {
  const k = `s:${key}:${amount}`;
  if (mats.has(k)) return mats.get(k);
  const m = paletteMaterial(key).clone();
  m.positionNode = swayNode(amount);
  mats.set(k, m);
  return m;
}

export class Flora {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'flora';
    scene.add(this.group);
    this.cells = new Map();          // key → Float32Array of instances (or 'pending')
    this.species = null;
    this.batches = new Map();        // `${sp}/${v}/${lod}` → { trunk, leaves, cap }
    this.dirty = true;
    this.last = null;
    this.queue = [];
    this.workers = Array.from({ length: 2 }, () => {
      const w = new Worker(new URL('./scatter-worker.js', import.meta.url), { type: 'module' });
      w.idle = true;
      w.onmessage = (e) => {
        if (e.data.species) { this.species = e.data.species; this.pump(); return; }
        w.idle = true;
        const { id, gen, data } = e.data, c = this.cells.get(id);
        // (a cell of the arrival made ahead and taken over by setSite: its job's own gen)
        if (c && c.state === 'pending' && (gen === this.gen || gen === c.job)) { c.data = data; c.state = 'done'; c.job = undefined; this.dirty = true; }
        else if (c && c.state === 'pending' && c.job === undefined) { c.state = 'queued'; this.queue.push(id); }   // (made for a settlement left meanwhile: again)
        else { const a = this.ahead?.cells.get(id); if (a && a.state === 'pending' && gen === this.ahead.gen) { a.data = data; a.state = 'done'; this.aheadStep(); } }
        this.pump();
      };
      return w;
    });
    this.maxLod = Math.max(...Object.values(SPECIES).map((s) => s.lod[1]));
    this.focus = null;               // the settlement whose plants these are (src/world/regions.js focus)
    this.ahead = null;               // the plants round the next settlement's arrival, made ahead (prefetch)
    this.scale = 1;                 // view distance of plants, by picture quality
  }

  /** The trees within r of (x, z) as { x, z, r } (r: a crown's half-width, roughly), for keeping the view clear. */
  trees(x, z, r) {
    const out = [];
    if (!this.species) return out;
    for (const c of this.cells.values()) {
      if (c.state !== 'done' || !c.data) continue;
      const d = c.data;
      for (let i = 0; i < d.length; i += 8) {
        const S = SPECIES[this.species[d[i]]];
        if (!S || S.lod[1] < 900) continue;                    // grass, reeds and shrubs do not hide a building
        if (Math.hypot(d[i + 2] - x, d[i + 4] - z) > r) continue;
        out.push({ x: d[i + 2], z: d[i + 4], r: 2.6 * (S.scale[0] + (S.scale[1] - S.scale[0]) * d[i + 6]) });
      }
    }
    return out;
  }

  /** Plant the settlement with this focus ({ region, center, radius }), or none (null). */
  setSite(focus) {
    this.focus = focus;
    for (const [k, c] of this.cells) if (c.state !== 'pending') this.cells.delete(k);
    this.gen = (this.gen || 0) + 1;
    // arriving where the plants were made ahead: those cells taken over as they are (done, or still
    // in a worker: its answer is taken by the job's gen)
    const A = this.ahead;
    if (A && focus && A.focus === focus) {
      this.ahead = null;
      for (const [k, a] of A.cells) {
        if (a.state === 'done') this.cells.set(k, { state: 'done', rect: a.rect, near: a.near, d: 0, data: a.data, prep: a.prep });
        else if (a.state === 'pending') this.cells.set(k, { state: 'pending', rect: a.rect, near: a.near, d: 0, job: A.gen });
      }
    }
    this.wantAt = null;
    this.dirty = true;
  }

  /** The cells wanted round (x, z) for the settlement `focus`: key → { rect, near, d } (d: from (x, z) to the cell's centre). */
  wanted(x, z, focus = this.focus) {
    const out = new Map();
    const [fx, fz] = focus.center, fr = focus.radius;
    const [X0, Z0, X1, Z1] = [fx - fr + 400, fz - fr + 400, fx + fr - 400, fz + fr - 400];
    const R = this.maxLod;
    const add = (kind, cx, cz, size) => out.set(`${kind}:${cx},${cz}`, { rect: [cx, cz, cx + size, cz + size], near: kind === 'S', d: Math.hypot(cx + size / 2 - x, cz + size / 2 - z) });
    for (let cx = Math.floor((x - R) / BIG) * BIG; cx < x + R; cx += BIG) for (let cz = Math.floor((z - R) / BIG) * BIG; cz < z + R; cz += BIG) {
      if (cx + BIG < X0 - 400 || cx > X1 + 400 || cz + BIG < Z0 - 400 || cz > Z1 + 400) continue;
      const d = Math.hypot(Math.max(cx - x, 0, x - cx - BIG), Math.max(cz - z, 0, z - cz - BIG));
      if (d < R) add('B', cx, cz, BIG);
    }
    for (let cx = Math.floor((x - NEAR_R) / SMALL) * SMALL; cx < x + NEAR_R; cx += SMALL) for (let cz = Math.floor((z - NEAR_R) / SMALL) * SMALL; cz < z + NEAR_R; cz += SMALL) {
      const d = Math.hypot(Math.max(cx - x, 0, x - cx - SMALL), Math.max(cz - z, 0, z - cz - SMALL));
      if (d < NEAR_R) add('S', cx, cz, SMALL);
    }
    return out;
  }

  /**
   * Make ahead, in the background, the plants within `near` metres of (x, z) in the settlement
   * `focus` (the next one to be visited), without touching the present view's: scattered by the
   * workers when they have nothing of the view's to do, made ready to be drawn, and their meshes'
   * shaders compiled. setSite(focus) takes them over. One such set is kept (a new call replaces it).
   */
  prefetch(focus, x, z, near = 200) {
    if (!focus) { this.ahead = null; return; }
    if (this.ahead && this.ahead.focus === focus && Math.hypot(this.ahead.x - x, this.ahead.z - z) < 4) return;
    if (focus === this.focus) { this.ahead = null; return; }
    const cells = new Map();
    for (const [k, c] of this.wanted(x, z, focus)) if (c.d < near) cells.set(k, { ...c, state: 'queued' });
    this.ahead = { focus, x, z, cells, gen: `ahead:${(this.aheadN = (this.aheadN || 0) + 1)}`, queue: [...cells.entries()].sort((a, b) => a[1].d - b[1].d).map(([k]) => k), readied: false };
    this.pump();
  }

  /** A cell made ahead came back: once all have, they are made ready to be drawn and their meshes compiled. */
  aheadStep() {
    const A = this.ahead;
    if (!A || A.readied || !this.species) return;
    for (const a of A.cells.values()) if (a.state !== 'done') return;
    A.readied = true;
    const counts = new Map();                // kv → plants, for the meshes' size
    const work = [...A.cells.values()];
    const step = () => {
      if (this.ahead !== A) return;
      const t0 = performance.now();
      while (work.length && performance.now() - t0 < 4) {
        const a = work.pop();
        if (!a.data?.length) continue;
        this.prepare(a); a.prep.src = a.data;
        for (const k of a.prep.kv) counts.set(k, (counts.get(k) || 0) + 1);
      }
      if (work.length) { setTimeout(step, 0); return; }
      // then the meshes of the species and variants there (either level of detail), a few at a time:
      // their shaders compiled off the frame (batch → precompile), ready to be filled on arrival
      if (!meshes) meshes = [...counts].flatMap(([k, n]) => [[k, 0, n], [k, 1, n]]);
      while (meshes.length && performance.now() - t0 < 4) { const [k, lod, n] = meshes.pop(), [sp, v] = this.kvList[k]; if (!this.batches.has(`${sp}/${v}/${lod}`)) this.batch(sp, v, lod, n); }   // (one drawn now is left as it is: made again, it would be empty until the next rebuild)
      if (meshes.length) setTimeout(step, 0);
    };
    let meshes = null;
    step();
  }

  /** Cells wanted around (x, z): far cells for trees, near cells for grass. */
  update(x, z) {
    if (!this.focus) { if (this.dirty) { this.rebuild(x, z); this.dirty = false; } return 0; }
    // the cells wanted, again only when the viewer has moved a few metres (or the site changed)
    if (!this.wantAt || this.wantGen !== this.gen || Math.hypot(x - this.wantAt[0], z - this.wantAt[1]) > 4) {
      this.wantAt = [x, z]; this.wantGen = this.gen;
      const want = this.wanted(x, z);
      for (const [k, c] of want) if (!this.cells.has(k)) this.cells.set(k, { state: 'queued', rect: c.rect, near: c.near, d: 0 });
      for (const [k, c] of this.cells) if (!want.has(k) && c.state !== 'pending') { this.cells.delete(k); this.dirty = true; }
      for (const c of this.cells.values()) c.d = Math.hypot((c.rect[0] + c.rect[2]) / 2 - x, (c.rect[1] + c.rect[3]) / 2 - z);
      this.queue = [...this.cells.entries()].filter(([, c]) => c.state === 'queued').sort((a, b) => a[1].d - b[1].d).map(([k]) => k);
    }
    this.pump();
    const moved = !this.last || Math.hypot(x - this.last[0], z - this.last[1]) > 12;
    if (this.dirty || moved) { this.last = [x, z]; this.dirty = !this.rebuild(x, z, 4); }
    return this.queue.length;
  }

  /** Resolve when the plants within `near` metres are placed; farther ones follow. onProgress(0…1). */
  async ready(x, z, onProgress, near = 260, alive = () => true) {
    let total = 0;
    for (;;) {
      if (!alive()) return;                 // (the travel that waits is over: nothing more to report)
      this.update(x, z);
      let left = 0;
      for (const c of this.cells.values()) if (c.state !== 'done' && c.d < near) left++;
      total = Math.max(total, left);
      onProgress?.(total ? 1 - left / total : 1);
      if (!left && this.species) { this.rebuild(x, z); return; }
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  pump() {
    if (!this.species) return;
    const A = this.ahead;
    for (const w of this.workers) {
      if (!w.idle) continue;
      // the view's cells first; the arrival's made ahead only by a worker with nothing else to do
      let k = null, c = null;
      while (this.queue.length && !c) { k = this.queue.shift(); c = this.cells.get(k); if (c && c.state !== 'queued') c = null; }
      if (c) {
        c.state = 'pending'; c.job = undefined; w.idle = false;
        w.postMessage({ id: k, rect: c.rect, near: c.near, focus: this.focus, gen: this.gen });
        continue;
      }
      while (A?.queue.length && !c) { k = A.queue.shift(); c = A.cells.get(k); }
      if (!c) continue;
      c.state = 'pending'; w.idle = false;
      w.postMessage({ id: k, rect: c.rect, near: c.near, focus: A.focus, gen: A.gen });
    }
    if (A && !A.queue.length) this.aheadStep();
  }

  /**
   * A cell's plants made ready to be drawn, once (when it arrives): each plant's matrix, colour
   * and species-and-variant number, so that a rebuild only sorts and copies.
   */
  prepare(c) {
    const d = c.data, n = d.length / 8;
    const M = new Float32Array(n * 16), col = new Float32Array(n * 3), kv = new Int32Array(n), reach0 = new Float32Array(n), reach1 = new Float32Array(n), px = new Float32Array(n), pz = new Float32Array(n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const kvs = this.kvs ??= new Map(), kvList = this.kvList ??= [];
    for (let j = 0, i = 0; j < n; j++, i += 8) {
      const sp = this.species[d[i]], S = SPECIES[sp], v = d[i + 1] % VARIANTS, key = `${sp}/${v}`;
      let k = kvs.get(key);
      if (k === undefined) { k = kvList.length; kvs.set(key, k); kvList.push([sp, v]); }
      kv[j] = k;
      reach0[j] = S.lod[0]; reach1[j] = S.lod[1];
      px[j] = d[i + 2]; pz[j] = d[i + 4];
      const sc = S.scale[0] + (S.scale[1] - S.scale[0]) * d[i + 6];
      p.set(d[i + 2], d[i + 3], d[i + 4]); q.setFromAxisAngle(up, d[i + 5]); s.setScalar(sc);
      m.compose(p, q, s).toArray(M, j * 16);
      col[j * 3] = 0.88 + 0.24 * d[i + 7]; col[j * 3 + 1] = 0.9 + 0.2 * d[i + 7]; col[j * 3 + 2] = 0.86 + 0.2 * ((d[i + 7] * 7) % 1);
    }
    c.prep = { n, M, col, kv, reach0, reach1, px, pz, cid: (this.cellIds = (this.cellIds || 0) + 1) };
  }

  /**
   * Sort every plant into its species, variant and level of detail, and fill the instanced meshes:
   * only the meshes whose plants changed are written, and only their used part is sent to the GPU.
   * New cells are made ready within `budget` ms (the rest at the next call); returns whether all were.
   */
  rebuild(x, z, budget = Infinity) {
    if (!this.species) return true;
    const t0 = performance.now(), tH = HITCH.mark();
    let all = true;
    const buckets = new Map();             // kv * 2 + lod → [prep, j, prep, j, …]
    const sc = this.scale;
    for (const c of this.cells.values()) {
      if (c.state !== 'done') continue;
      if (!c.prep || c.prep.src !== c.data) {
        if (performance.now() - t0 > budget) { all = false; continue; }
        this.prepare(c); c.prep.src = c.data;
      }
      const P = c.prep, { n, kv, reach0, reach1, px, pz } = P;
      // (a whole cell beyond every plant's reach skipped)
      const r = c.rect, cdx = Math.max(r[0] - x, 0, x - r[2]), cdz = Math.max(r[1] - z, 0, z - r[3]);
      if (cdx * cdx + cdz * cdz > (this.maxLod * sc) ** 2) continue;
      const sc2 = sc * sc;
      for (let j = 0; j < n; j++) {
        const dx = px[j] - x, dz = pz[j] - z, d2 = dx * dx + dz * dz;
        const lod = d2 < reach0[j] * reach0[j] * sc2 ? 0 : d2 < reach1[j] * reach1[j] * sc2 ? 1 : -1;
        if (lod < 0) continue;
        const b = kv[j] * 2 + lod;
        let list = buckets.get(b);
        if (!list) buckets.set(b, (list = []));
        list.push(P, j);
      }
    }
    // hide what is no longer used
    for (const [key, b] of this.batches) if (!buckets.has(b.id)) { for (const mesh of b.meshes) mesh.count = 0; b.sig = 0; }
    for (const [id, list] of buckets) {
      const [sp, v] = this.kvList[id >> 1], lod = id & 1;
      const n = list.length / 2;
      const b = this.batch(sp, v, lod, n);
      b.id = id;
      // (written only if its plants changed)
      let sig = n;
      for (let j = 0; j < list.length; j += 2) sig = (Math.imul(sig, 31) + list[j].cid * 65537 + list[j + 1]) | 0;
      if (sig === b.sig && b.meshes[0]?.count === n) continue;
      b.sig = sig;
      for (const mesh of b.meshes) {
        const M = mesh.instanceMatrix.array, C = mesh.instanceColor?.array;
        for (let j = 0, k = 0; j < list.length; j += 2, k++) {
          const P = list[j], i = list[j + 1];
          M.set(P.M.subarray(i * 16, i * 16 + 16), k * 16);
          if (C) { C[k * 3] = P.col[i * 3]; C[k * 3 + 1] = P.col[i * 3 + 1]; C[k * 3 + 2] = P.col[i * 3 + 2]; }
        }
        mesh.count = n;
        mesh.instanceMatrix.clearUpdateRanges(); mesh.instanceMatrix.addUpdateRange(0, n * 16); mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) { mesh.instanceColor.clearUpdateRanges(); mesh.instanceColor.addUpdateRange(0, n * 3); mesh.instanceColor.needsUpdate = true; }
      }
    }
    HITCH.since('flora rebuild', tH);
    return all;
  }

  batch(sp, v, lod, n) {
    const key = `${sp}/${v}/${lod}`;
    let b = this.batches.get(key);
    if (b && b.cap >= n) return b;
    if (b) for (const mesh of b.meshes) { this.group.remove(mesh); mesh.dispose(); }
    const S = SPECIES[sp], geo = speciesGeometry(sp, v, lod), cap = Math.max(1100, Math.ceil(n * 1.5));   // above the uniform-buffer limit: matrices go in an instanced attribute, so every batch shares one shader
    const meshes = [];
    const sway = NEAR_ONLY.has(sp) ? 0.05 : sp.includes('palm') ? 0.12 : 0.08;
    if (geo.trunk) {
      const mt = S.bark === 'rock_boulder' ? paletteMaterial('rock_boulder') : solidMaterial(S.bark, sway * 0.3);
      const mesh = new THREE.InstancedMesh(geo.trunk, mt, cap);
      meshes.push(mesh);
    }
    if (geo.leaves) {
      const mt = geo.solidLeaves ? solidMaterial(S.leafMat, sway) : foliageMaterial(S.foliage, sway);
      const mesh = new THREE.InstancedMesh(geo.leaves, mt, cap);
      mesh.userData.tinted = true;
      mesh.setColorAt(0, new THREE.Color(1, 1, 1));
      meshes.push(mesh);
    }
    for (const mesh of meshes) {
      mesh.count = 0;
      mesh.frustumCulled = false;
      mesh.castShadow = S.shadow && lod === 0;
      mesh.receiveShadow = true;
      mesh.name = `flora:${key}`;
      this.group.add(mesh);
    }
    // its shaders compiled off the frame before it shows (src/engine/renderer.js precompile)
    if (this.precompile) {
      for (const mesh of meshes) mesh.visible = false;
      this.precompile(meshes).then(() => { for (const mesh of meshes) mesh.visible = true; });
    }
    b = { meshes, cap };
    this.batches.set(key, b);
    return b;
  }
}

export { MAX_DENSITY };
