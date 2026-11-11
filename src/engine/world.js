// The world: the planet's ground and sea, the settlements on it (loaded when near), and the frame
// in which the scene is drawn. DESIGN §4, docs/world.md.
//
// The scene is always drawn in a local frame round the visitor (an "anchor"): +y the local up.
// In or near a settlement the anchor is that settlement's own frame — its coordinates are those its
// plans, collision, baked light and plants are made in (for the ten settlements of the previous
// design, the old city's coordinates), and everything of it works unchanged. In the open country
// the anchor follows the visitor, re-centred under the feet every frame. Between the two, over the
// settlement's blend, the view is turned little by little from the settlement's up to the true up
// of the place, so that the switch from one frame to the other cannot be seen.

import { SYSTEMS } from './systems.js';
import './systems-list.js';
import * as THREE from 'three/webgpu';
import { BUILDINGS } from '../buildings/index.js';
import { buildPlanAsync, toWorld, flatParts } from '../core/build.js';
import { CollisionWorld, topField } from '../core/collide.js';
import { Flora } from './flora/index.js';
import { material, flameMaterial } from './materials.js';
import { MATERIALS } from '../core/palette.js';
import { releaseAfterUpload } from './release.js';
import { markMergeable, mergeParts, mergeDetail } from './merge.js';
import { LifeInstances } from './life-instances.js';
import { SMALL } from './layers.js';
import { Builder } from './builder.js';
import { ARRIVALS } from '../planet/arrivals.js';
import { HITCH } from './hitch.js';
import { ENV } from './env.js';
import { lampsOf, hazeOf } from './air.js';
import { loadLand } from '../planet/land.js';
import { BUILT, BUILT_BY_ID, initRelief, surface, groundInFrame, seaInFrame, PLANET_RADIUS as R, BLEND } from '../planet/relief.js';
import { PlanetTerrain } from '../planet/terrain.js';
import { OpenFlora } from '../planet/open-flora.js';
import { toPlanet, toLocal, dirToPlanet, dirToLocal, transportFrame, enuFrame, norm, dot, unit } from '../planet/geo.js';
import { withFocus } from '../world/regions.js';
import { MODULES } from '../settlements/grounds.js';

/** A settlement is built when the visitor comes within LOAD of its rim and let go beyond UNLOAD. */
export const LOAD = 350, UNLOAD = 800;
/** At most this many settlements are built at once (the nearest); from the air the reach grows, the count does not. */
export const MAX_BUILT = 4;
/** How long after arriving the next settlement starts being built ahead (ms). */
const PRELOAD_AFTER = 10000;

/** Beyond the horizon by this much (m: the tallest buildings' own horizon), a built settlement is not drawn. */
const BEYOND = 1200;
/** A settlement built (not the one visited) further than this past its edge shows its far view instead (m). */
const FULL_BEYOND = 600;
const _pc = new THREE.Vector3(), _sc = new THREE.Vector3(), _vd = new THREE.Vector3(), _ld = new THREE.Vector3(), _li = new THREE.Vector3(), _inv = new THREE.Matrix4();

/**
 * Every mesh of a building is an instanced mesh with instance colours — a merged part is one copy
 * at its place, white — so that each material is compiled once, in one form: plain and instanced
 * meshes of one material are two shaders and two pipelines (doubling the start-up's compiling).
 */
const IDENTITY = new THREE.Matrix4().elements, WHITE = [1, 1, 1];
export function buildingMesh(geometry, mat, matrices = IDENTITY, colors = null) {
  const n = matrices.length / 16;
  const m = new THREE.InstancedMesh(geometry, material(mat), n);
  m.instanceMatrix.array.set(matrices);
  m.instanceMatrix.needsUpdate = true;
  if (!colors) { colors = new Float32Array(n * 3); for (let i = 0; i < n; i++) colors.set(WHITE, i * 3); }
  m.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  m.computeBoundingSphere();
  // (before its shaders are compiled: whether a mesh receives shadows is part of three's key for
  // its build, and merged meshes were set to receive them only after being compiled — each built a
  // second time in the frame that first drew it, 5–13 ms each, the hitches of turning round)
  m.receiveShadow = true;
  return m;
}

/**
 * Materials whose shadow cannot be seen, or that should let the light through: window voids (dark
 * panels in the wall's thickness), clear glass, water, lamps. Fewer things to draw in each cascade.
 */
/** Fine detail is drawn within this distance (m) of its part's bounds, and casts shadows within the second. */
const DETAIL_REACH = 160, DETAIL_SHADOW = 50;
/** How far (m) past its sealed rooms a building's surroundings are still drawn from inside them (World.seal). */
const SEALED_MARGIN = 40;
/** A layer nothing draws: meshes hidden from a sealed room (World.seal). */
const SEALED_OUT = 9;
/** Placed pieces of a plan whose reach is under this (m) are drawn only within it (merge.js LodSet 'near'). */
const NEAR_REACH = 200;
/** How far (m) past a closed room of a plan one may stand, under a roof, and still be in it (world.locate). */
const GAP = 5;
/** New geometry let into the scene per frame (bytes): its upload to the GPU happens in the frame
 *  that first draws it, so a settlement's parts and merged meshes come in spread over frames. */
const UPLOAD_BUDGET = 8 << 20;
/** The bytes a group's meshes will send to the GPU. */
export function bytesOf(root) {
  let n = 0;
  const seen = new Set();
  const add = (a) => { if (a?.array && !seen.has(a)) { seen.add(a); n += a.array.byteLength; } };
  root.traverse((o) => {
    if (!o.geometry) return;
    for (const a of Object.values(o.geometry.attributes)) add(a);
    add(o.geometry.index); add(o.instanceMatrix); add(o.instanceColor);
  });
  return n;
}
/** Static meshes merged across a settlement's plans (src/engine/merge.js); `?merge=0` keeps them per plan, to compare. */
const MERGE = new URLSearchParams(globalThis.location?.search ?? '').get('merge') !== '0';
const NO_SHADOW = new Set(['water', 'glass_outer', 'glass_topaz', 'opening', 'daylight', 'daylight_plain']);
const NO_SHADOW_KINDS = new Set(['glow', 'water', 'foam']);
const castsShadow = (mat) => !NO_SHADOW.has(mat) && !NO_SHADOW_KINDS.has(MATERIALS[mat]?.kind);

/**
 * A module fetched on demand, tried again if its download fails (a dropped connection, or the site
 * being redeployed at that moment): one failed fetch used to stop the loading for good.
 */
export async function retry(load, tries = 4) {
  for (let i = 0; ; i++) {
    try { return await load(); } catch (e) {
      if (i >= tries - 1) {
        // a module that cannot be fetched at all: most likely the site was deployed again since this
        // page opened and its folder is gone (the last versions are kept, src/../pages.yml): say so
        if (/dynamically imported module|Importing a module script failed|error loading dynamically/i.test(e.message)) globalThis.dispatchEvent?.(new Event('mp-stale'));
        throw e;
      }
      console.warn('retrying a module:', e.message);
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
}

const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** Matrix taking planet coordinates to a frame's local ones. */
function sceneFromPlanet(f, m = new THREE.Matrix4()) {
  const { x, y, z, o } = f;
  return m.set(
    x[0], x[1], x[2], -(x[0] * o[0] + x[1] * o[1] + x[2] * o[2]),
    y[0], y[1], y[2], -(y[0] * o[0] + y[1] * o[1] + y[2] * o[2]),
    z[0], z[1], z[2], -(z[0] * o[0] + z[1] * o[1] + z[2] * o[2]),
    0, 0, 0, 1);
}
/** Matrix taking a frame's local coordinates to planet ones. */
function planetFromFrame(f, m = new THREE.Matrix4()) {
  const { x, y, z, o } = f;
  return m.set(x[0], y[0], z[0], o[0], x[1], y[1], z[1], o[1], x[2], y[2], z[2], o[2], 0, 0, 0, 1);
}

/** Where u stands relative to a settlement: { r (m from the disc's centre, on its plane), x, z (local), uy }. */
function relTo(S, u) {
  const uy = dot(S.enu.y, u);
  if (uy <= 0.5) return { r: Infinity };
  const k = (R + S.base) / uy, x = dot(S.enu.x, u) * k, z = dot(S.enu.z, u) * k;
  return { r: Math.hypot(x, z), x, z, uy };
}

/** One settlement in the viewer: its group, its collision world, its buildings and houses. */
/** The most triangles of a small instanced detail shape baked into the merged detail (merge.js mergeDetail). */
const DETAIL_BAKE = 8000;
/** An instanced mesh whose copies are not tinted (none, or all white). */
function untinted(o) {
  const c = o.instanceColor?.array;
  if (!c) return true;
  for (let i = 0; i < o.count * 3; i++) if (Math.abs(c[i] - 1) > 0.004) return false;
  return true;
}

class Settlement {
  constructor(S, world) {
    this.S = S; this.world = world;
    this.id = S.id;
    this.group = new THREE.Group();
    this.group.name = 'settlement:' + S.id;
    this.group.matrixAutoUpdate = false;
    this.parts = [];                       // { id, plan, music, group, built, gi }
    this.state = 'idle';
    this.gen = 0;                          // bumped by unload(): a load begun before it stops adding parts
    const C = this.collide = new CollisionWorld();
    const [cx, cz] = S.local.center, L = S.local;
    // the ground: the settlement's own on its disc, the planet's beyond (in the settlement's frame)
    const on = (x, z) => Math.hypot(x - cx, z - cz) < S.radius;
    C.terrain = (x, z) => (on(x, z) ? L.height(x, z) : groundInFrame(S.frame, x, z));
    C.water = (x, z, y) => (on(x, z) ? L.water(x, z, y) : (groundInFrame(S.frame, x, z) < seaInFrame(S.frame, x, z) - 0.3 && y < seaInFrame(S.frame, x, z) + 0.3));
    C.waterLevel = (x, z) => (on(x, z) ? L.waterLevel(x, z) : (groundInFrame(S.frame, x, z) < seaInFrame(S.frame, x, z) ? seaInFrame(S.frame, x, z) : -Infinity));
    this.music = null;                     // the settlement's own music, in its streets (its module's)
    // true while it is built ahead of a visit (World.preload), not visited: its shaders compiled in
    // the page's idle moments only (renderer.js precompile)
    this.ahead = () => this.world.kept === this && this !== this.world.anchor?.site;
  }

  /** How much of the settlement is built (0…1), while it loads. */
  get fraction() { return this.state === 'ready' ? 1 : this.state === 'idle' ? 0 : Math.min(0.99, (this.done || 0) / (this.expected || 1)); }

  load() {
    if (this.loading) return this.loading;
    this.state = 'loading';
    this.world.scene.add(this.group);
    this.done = 0; this.expected = 1;
    this.lifeParts = [];
    const gen = this.gen;
    const stale = () => gen !== this.gen;
    this.loading = (async () => {
      const S = this.S;
      if (S.focus.region) {
        const entries = BUILDINGS.filter((b) => b.district === S.focus.region);
        this.expected = entries.length + 1.5;
        for (const entry of entries) {
          const mod = await retry(entry.load);
          if (stale()) return this;
          await this.addPart(entry.id, mod.plan, mod.music, gen);
        }
        // the houses of the settlement, of its own time (src/world/city.js), on its disc
        await import('../styles/vernacular/index.js');
        const city = await import('../world/city.js');
        if (stale()) return this;
        const plan = withFocus(S.focus, () => city.plan(S.focus.region));
        plan.id = `${S.id}-town`;
        await this.addPart(plan.id, plan, null, gen);
      } else {
        // a settlement of its own: its landmarks, then its townscape (src/settlements/<id>/)
        const mod = await retry(MODULES[S.id]);
        this.music = mod.music;
        const B = this.world.builder;
        let inWorker = false;
        if (B?.ok) {
          // laid out and built in a worker (src/engine/build-worker.js); the main thread only makes
          // the meshes. A failure falls back to building here, from what is not yet built.
          const got = new Set();
          // (sent again when the workers were started again: builder.js restart; the plans already
          // in are skipped)
          for (let attempt = 0; attempt < 3 && B.ok && !inWorker; attempt++) {
            const job = B.settlement(S.id,
              (count, nl) => { this.expected = nl * 3 + (count - nl); },
              async (i, header, built) => {
                if (stale() || got.has(i)) return;
                got.add(i);
                const L = mod.landmarks[i];
                await this.addPart((L ? L.plan : header).id, L ? L.plan : header, L ? L.music : null, gen, built);
                if (L) this.done += 2;
              });
            this.job = job;
            try { await job.done; inWorker = true; } catch (e) { console.warn('building', S.id, e.restart ? 'again' : 'in the page', ':', e.message); if (!e.restart) break; }
            this.job = null;
            if (stale()) return this;
          }
          this.job = null;
          if (stale()) return this;
          if (!inWorker) this.got = got;
        }
        if (!inWorker) {
          const town = await mod.town();
          if (stale()) return this;
          // the landmarks weigh more than a block of houses
          this.expected = mod.landmarks.length * 3 + town.length;
          const all = [...mod.landmarks.map((p) => [p.plan, p.music]), ...town.map((p) => [p, null])];
          for (let i = 0; i < all.length; i++) {
            if (stale()) return this;
            if (this.got?.has(i)) continue;            // built by a worker before it failed
            const [plan, music] = all[i];
            await this.addPart(plan.id, plan, music, gen);
            if (i < mod.landmarks.length) this.done += 2;
          }
          this.got = null;
        }
      }
      // let go of while it was being built (the visitor moved away): unload() has cleaned up
      if (stale()) return this;
      this.buildLife();
      this.done = this.expected;
      this.state = 'ready';
      // the living additions (src/engine/systems.js): boats, walkers, birds, smoke...
      for (const Sy of SYSTEMS) { try { Sy.attach?.(this, this.world); } catch (e) { console.warn('system attach', e); } }
      // the plans' static meshes merged per material and shape, in the background (src/engine/merge.js)
      this.mergingNow = true;
      this.merging = this.mergeStatic(gen).finally(() => { this.mergingNow = false; });
      return this;
    })();
    return this.loading;
  }

  async addPart(id, plan, music, gen = this.gen, prebuilt = null) {
    const built = prebuilt ?? await buildPlanAsync(plan, undefined, { instancing: true, detail: true });
    const rec0 = {};
    let tS = HITCH.mark();
    if (gen !== this.gen) { for (const { geometry } of [...built.parts, ...built.instanced]) geometry.dispose(); return null; }
    const group = new THREE.Group();
    group.name = plan.id;
    for (const { mat, geometry, detail, shadowBig } of built.parts) {
      const m = buildingMesh(geometry, mat);
      // (how many of its first triangles are big for the shadows: merge.js, src/core/geom.js MID_SIZE)
      if (shadowBig !== undefined) m.userData.shadowBig = shadowBig;
      m.castShadow = castsShadow(mat);
      m.receiveShadow = true;
      if (detail) { m.userData.detail = true; m.layers.set(SMALL); }
      m.name = `${plan.id}:${mat}`;
      group.add(m);
    }
    // repeated pieces: one prototype, a matrix per copy (src/core/geom.js, GeoBag); the life of the
    // streets is gathered settlement-wide once all its tiles are built (buildLife)
    const lifeList = plan.style === 'life' ? built.instanced : [];
    for (const { mat, geometry, matrices, colors, detail, big, first, reach } of plan.style === 'life' ? [] : built.instanced) {
      const m = buildingMesh(geometry, mat, matrices, colors);
      if (big !== undefined) m.userData.big = big;
      if (first) m.userData.first = first;
      // placed pieces meant to be seen only near (their reach, src/core/geom.js addInstance): merge.js
      if (reach?.length) { let r = 0; for (const v of reach) r = Math.max(r, v); if (r < NEAR_REACH) m.userData.reach = r; }
      m.castShadow = castsShadow(mat);
      m.receiveShadow = true;
      m.name = `${plan.id}:${mat}:inst`;
      if (detail) { m.userData.detail = true; m.layers.set(SMALL); }
      group.add(m);
    }
    // the lamps of the part (its plan's lamps, the shades of its glow materials), for the lamps' pool
    rec0.lamps = lampsOf(built, [...built.parts, ...(plan.style === 'life' ? [] : built.instanced)]);
    if (built.lights.length) {
      const flame = new THREE.ConeGeometry(0.035, 0.13, 8);
      const inst = new THREE.InstancedMesh(flame, flameMaterial(), built.lights.length);
      const m4 = new THREE.Matrix4();
      built.lights.forEach((l, i) => inst.setMatrixAt(i, m4.makeTranslation(l.at[0], l.at[1] + 0.02, l.at[2])));
      group.add(inst);
    }
    HITCH.since('stream meshes', tS);
    // its shaders compiled before it shows, not in the frame that first draws it (a hitch)
    await this.world.r.precompile?.(group, { background: this.ahead });
    // and its buffers sent to the GPU in a frame with room for them
    await this.world.uploadSlot(bytesOf(group));
    tS = HITCH.mark();
    if (gen !== this.gen) { for (const { geometry } of [...built.parts, ...built.instanced]) geometry.dispose(); return null; }
    this.group.add(group);
    // the upper surfaces, to land and walk on (roofs, wall tops)
    if (!plan.nocollide) {
      if (!prebuilt) { HITCH.since('stream add', tS); built.colliders.tops = await topField(flatParts(built)); tS = HITCH.mark(); }
      this.collide.add(built.colliders);
    }
    HITCH.since('stream add', tS);
    const rec = { id, plan, music, group, built, settlement: this, lamps: rec0.lamps, detail: group.children.filter((o) => o.userData.detail) };
    for (const o of rec.detail) { o.visible = false; o.castShadow = false; }
    if (!plan.feature) try { rec.gi = await this.world.r.gi.fetch(plan.id, `data/gi/${plan.id}.gi`); } catch (e) { console.warn(e); }
    // unloaded while the collision or the light was being made: unload() already cleared the group
    if (gen !== this.gen) { this.world.r.gi.release?.(plan.id); return null; }
    // the collision and the bounds are made: the vertex arrays are not needed once on the GPU
    // (the meshes to be merged once the settlement is built keep their arrays until then)
    tS = HITCH.mark();
    if (MERGE) markMergeable(plan, group);
    // (the fine detail merged across the plans once all are in: merge.js mergeDetail)
    if (MERGE) for (const o of rec.detail) {
      if (!o.geometry.index || !o.material?.name) continue;
      if (o.count === 1 && o.name.endsWith(':' + o.material.name)) o.userData.detailMerge = true;
      // (a small instanced shape untinted: baked in too, at most DETAIL_BAKE triangles in all)
      else if (o.name.endsWith(':inst') && o.count * o.geometry.index.count / 3 <= DETAIL_BAKE && untinted(o)) o.userData.detailMerge = true;
    }
    group.traverse((o) => { if (!o.userData.merge && !o.userData.detailMerge) releaseAfterUpload(o); });
    HITCH.since('stream add', tS);
    if (lifeList.length) this.lifeParts.push({ rec, list: lifeList });
    this.parts.push(rec);
    this.done = (this.done || 0) + 1;
    return rec;
  }

  /** The static meshes of all its plans, merged per material and per repeated shape (src/engine/merge.js). */
  async mergeStatic(gen) {
    if (!MERGE || gen !== this.gen) return;
    const into = this.merged = new THREE.Group();
    into.name = 'merged';
    this.group.add(into);
    // the shapes drawn by distance (merge.js LodSet), their copies chosen with the street life's
    const lods = this.lods = [];
    const precompile = async (list) => { await this.world.r.precompile?.(list, { background: this.ahead }); let b = 0; for (const m of list) b += bytesOf(m); await this.world.uploadSlot(b); };
    try { await mergeParts(this.parts, into, buildingMesh, { castsShadow, stale: () => gen !== this.gen, lods, precompile }); } catch (e) { console.warn('merging', this.id, e); }
    try { await mergeDetail(this.parts, buildingMesh, { stale: () => gen !== this.gen, precompile: (list) => this.world.r.precompile?.(list, { background: this.ahead }) }); } catch (e) { console.warn('merging detail', this.id, e); }
    this.quietFor = undefined;             // the indoor shadows (World.update) set again
  }

  /** The life of the streets, settlement-wide (src/engine/life-instances.js). */
  buildLife() {
    if (!this.lifeParts?.length) return;
    const t0 = HITCH.mark();
    this.life = new LifeInstances(this.group, castsShadow, (o) => this.world.r.precompile?.(o) ?? Promise.resolve());
    // (the rarer shapes are merged settlement-wide by material, their copies chosen by distance)
    this.life.build(this.lifeParts);
    // shown once its shaders are compiled (off the frame)
    const life = this.life;
    life.ready = false; life.group.visible = false;
    Promise.resolve(this.world.r.precompile?.(life.group)).then(() => { life.ready = true; });
    // the lanterns among the street's things: one lamp per copy of a glow shape, and per piece of the rarer ones
    this.lifeLamps = lampsOf({}, this.life.meshes.map((L) => ({ mat: L.near.name.split(":")[1], geometry: L.near.geometry, matrices: L.all })));
    this.lifeLamps.push(...lampsOf({}, this.life.rare.map((B) => ({ mat: B.near.name.split(":")[1], geometry: B.near.geometry }))));
    this.lifeParts = [];
    HITCH.since('life build', t0);
  }

  /** The far view (tools/impostors.mjs): the settlement simplified, shown until it is built in full. */
  async loadImpostor() {
    if (this.impostor !== undefined) return;
    this.impostor = null;
    try {
      const res = await fetch(`data/impostors/${this.id}.bin`);
      if (!res.ok) return;
      const buf = await res.arrayBuffer();
      const h = new DataView(buf), n = h.getUint32(8, true), ni = h.getUint32(12, true);
      const min = [h.getFloat32(16, true), h.getFloat32(20, true), h.getFloat32(24, true)], sc = h.getFloat32(28, true);
      const bytes = await new Response(new Blob([buf.slice(32)]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      const P = new Uint16Array(bytes, 0, n * 3), C = new Uint8Array(bytes, n * 6, n * 3);
      const off = n * 9 + ((4 - ((n * 9) % 4)) % 4), I = new Uint32Array(bytes, off, ni);
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      for (let i = 0; i < n * 3; i++) { pos[i] = min[i % 3] + P[i] * sc; col[i] = lin(C[i]); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      g.setIndex(new THREE.BufferAttribute(I, 1));
      g.computeBoundingSphere();
      const m = new THREE.MeshStandardNodeMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(g, m);
      mesh.name = 'impostor:' + this.id;
      // a far view lies beyond the shadow cascades' reach (it is shown only until the settlement is built)
      mesh.castShadow = false; mesh.receiveShadow = true;
      releaseAfterUpload(mesh);
      this.impostor = new THREE.Group();
      this.impostor.matrixAutoUpdate = false;
      this.impostor.add(mesh);
      this.world.scene.add(this.impostor);
    } catch (e) { console.warn('no far view for', this.id, e); }
  }

  unload() {
    if (this.state === 'idle') return;
    if (this.state === 'ready') for (const Sy of SYSTEMS) { try { Sy.detach?.(this, this.world); } catch (e) { console.warn('system detach', e); } }
    this.gen++;                            // a load still running stops adding parts
    this.job?.cancel(); this.job = null;
    this.world.scene.remove(this.group);
    // (an instanced mesh's dispose() leaves its geometry: both are let go of)
    this.group.traverse((o) => { o.geometry?.dispose(); if (o.isInstancedMesh) o.dispose(); });
    this.merged = null; this.merging = null; this.mergingNow = false; this.quietFor = undefined; this.lods = null;
    this.group.clear();
    this.life?.dispose(); this.life = null; this.lifeParts = []; this.lifeLamps = null;
    for (const rec of this.parts) this.world.r.gi.release?.(rec.plan.id);
    this.parts = [];
    this.collide = Object.assign(new CollisionWorld(), { terrain: this.collide.terrain, water: this.collide.water, waterLevel: this.collide.waterLevel });
    this.loading = null;
    this.state = 'idle';
  }
}

export class World {
  constructor(renderer) {
    this.r = renderer;
    this.scene = renderer.scene;
    this.plans = new Map();               // building id → { id, entry, plan, music, site }
    this.anchor = null;                   // { frame, site (a Settlement or null) }
    this.tilt = new THREE.Quaternion();
    this._m = new THREE.Matrix4();
    this._m2 = new THREE.Matrix4();
  }

  /**
   * Resolves in a frame with room for `bytes` more of new geometry (UPLOAD_BUDGET a frame; one
   * larger than that alone in its frame). Without frames running (the start, behind the loading
   * screen) at once.
   */
  uploadSlot(bytes) {
    if (!(performance.now() - (this._updatedAt ?? -1e9) < 150)) return Promise.resolve();
    return new Promise((r) => (this._uploads ??= []).push([bytes, r]));
  }

  /** The uploads let in this frame (called at the start of update). */
  letUploadsIn() {
    const Q = this._uploads;
    this._updatedAt = performance.now();
    if (!Q?.length) return;
    let room = UPLOAD_BUDGET, k = 0;
    while (k < Q.length && (room === UPLOAD_BUDGET || Q[k][0] <= room)) { room -= Q[k][0]; Q[k][1](); k++; }
    Q.splice(0, k);
    HITCH.count('uploads', k);
  }

  /** onStep(label, fraction): the loading bar's detail (src/main.js Progress). */
  async init(onStep = () => {}) {
    this.builder = new Builder(2);
    onStep('map', 0);
    const land = await loadLand('data/planet/land.bin');
    onStep('map', 1);
    initRelief();
    this.planet = new THREE.Group();
    this.planet.name = 'planet';
    this.planet.matrixAutoUpdate = false;
    this.scene.add(this.planet);
    this.terrain = new PlanetTerrain(this.planet, land);
    this.openFlora = new OpenFlora(this.planet, land);
    this.openFlora.precompile = (o) => this.r.precompile(o);
    this.settlements = BUILT.map((S) => new Settlement(S, this));
    this.byId = Object.fromEntries(this.settlements.map((s) => [s.id, s]));
    // the plants of the settlement the visitor is in (src/engine/flora), drawn in its frame
    this.legacy = new THREE.Group();
    this.legacy.name = 'flora-frame';
    this.legacy.matrixAutoUpdate = false;
    this.scene.add(this.legacy);
    this.flora = new Flora(this.legacy);
    this.flora.precompile = (o) => this.r.precompile(o);
    // the open country's collision: the planet's ground and the sea in the current frame
    this.open = new CollisionWorld();
    this.open.terrain = (x, z) => groundInFrame(this.anchor.frame, x, z);
    this.open.water = (x, z, y) => { const s = seaInFrame(this.anchor.frame, x, z); return groundInFrame(this.anchor.frame, x, z) < s - 0.3 && y < s + 0.3; };
    this.open.waterLevel = (x, z) => { const s = seaInFrame(this.anchor.frame, x, z); return groundInFrame(this.anchor.frame, x, z) < s ? s : -Infinity; };
    // every building's plan (small modules), to know where its entrance is
    // only the starting settlement's module now (the ten buildings of the old city, src/buildings,
    // are fetched by the settlements that use them); the others' come after the start: fetched by
    // the build workers when they are idle, nearest first (warm), so that the page never evaluates
    // them while one walks and a click on the map finds them in the cache
    this.setAnchor(this.byId['ming-suzhou'].S.frame, this.byId['ming-suzhou']);
    await this.plansOf(this.byId['ming-suzhou']);
    onStep('plans', 1);
  }

  /** The landmark plans of a settlement of its own (fetched once). */
  async plansOf(site) {
    if (!MODULES[site.id]) return;
    site.plansLoaded ??= (async () => {
      const mod = await retry(MODULES[site.id]);
      for (const p of mod.landmarks) this.plans.set(p.plan.id, { id: p.plan.id, plan: p.plan, music: p.music, site });
    })().catch((e) => { site.plansLoaded = null; throw e; });   // a failed fetch is tried again next time
    return site.plansLoaded;
  }

  /** Every settlement's landmark plans, a few at a time (after the start). */
  async loadPlans(start = null) {
    if (start) await this.plansOf(start);
    const queue = this.settlements.filter((s) => MODULES[s.id]);
    await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) { try { await this.plansOf(queue.shift()); } catch (e) { console.warn(e); } } }));
  }

  /**
   * After the start: the other settlements' modules fetched ahead, nearest to u first — by the
   * build workers when they are idle (into the browser's cache, evaluated off the main thread), or
   * without workers by the page when it is idle.
   */
  prefetch(u) {
    const order = this.settlements.filter((s) => MODULES[s.id] && !s.plansLoaded).map((s) => [World.rimDistance(s, u), s]).sort((a, b) => a[0] - b[0]).map(([, s]) => s);
    if (this.builder?.ok) this.builder.warm(order.map((s) => s.id));
    else this.loadPlansIdle(order);
  }

  /** The page's own prefetch, one module at a time when the page is idle. */
  async loadPlansIdle(order = this.settlements) {
    const idle = () => new Promise((r) => (globalThis.requestIdleCallback ? requestIdleCallback(r, { timeout: 2000 }) : setTimeout(r, 200)));
    for (const s of order) {
      if (!MODULES[s.id] || s.plansLoaded) continue;
      await idle();
      try { await this.plansOf(s); } catch (e) { console.warn(e); }
    }
  }

  /**
   * Keep the settlement S (a map settlement of src/planet/relief.js, or null) built ahead of a visit: its
   * plans fetched, then built in the background when the page is idle (the load is time-sliced like all
   * streaming) and kept from the far-unload; the plants round its arrival view scattered ahead (without
   * touching the present view's: src/engine/flora prefetch), the ground there built ahead, and, once its
   * merging is done, its meshes' shaders compiled off the frame, so that arriving there has nothing left
   * to make or compile. At most one besides the current one: a stale one is let go (and its plants).
   * A jump there before this is done still works: the arrival takes over what is made and waits for the rest.
   */
  async preload(S, { now = false } = {}) {
    const site = S ? this.settlements.find((s) => s.S === S) : null;
    const old = this.kept;
    if (old && old !== site && old !== this.anchor?.site) old.unload();
    this.kept = site;
    if (!site || site === this.anchor?.site) { this.flora.prefetch(null); return; }
    const idle = () => new Promise((r) => (globalThis.requestIdleCallback ? requestIdleCallback(r, { timeout: 3000 }) : setTimeout(r, 300)));
    const still = () => this.kept === site && site !== this.anchor?.site;
    const A = ARRIVALS[S.id] || [0, null, 0];
    try {
      // (only once the settlement one is in and its neighbours are built and merged: a settlement
      // built ahead took the build workers from the one being visited, which then came in slowly)
      // and not in the first ten seconds there (its building, merging and compiling on this thread
      // made the first look round after arriving heavy: about 100 frames over 50 ms in 12 s)
      // (a settlement whose card is open on the map is built at once: the map is up, nothing to spare)
      if (!now) await new Promise((r) => setTimeout(r, PRELOAD_AFTER));
      for (let k = 0; k < 600 && !now && still() && this.settlements.some((s) => s !== site && (s.state === 'loading' || s.mergingNow)); k++) await new Promise((r) => setTimeout(r, 500));
      await idle();
      if (!still()) return;
      await this.plansOf(site);
      // the plants round the arrival (by the plant workers when they are idle: no wait on the buildings)
      if (still()) this.flora.prefetch(S.focus, A[0], A[2]);
      await idle();
      if (still() && site.state === 'idle') await site.load();
      // and the ground round its arrival view, built ahead the same way (after the present view's tiles)
      if (still() && this.terrain) this.terrain.prefetch(toPlanet(S.frame, [A[0], (A[1] ?? 0) + 1.7, A[2]]));
      // the merged meshes made: whatever of the settlement was not compiled yet (its parts and merged
      // meshes are compiled as they come; this catches the rest, a no-op for what was) compiled now
      if (still()) await site.merging;
      if (still()) { await idle(); if (still() && site.state === 'ready') await this.r.precompile?.(site.group, { background: site.ahead }); }
    } catch (e) { console.warn('preload', S.id, e); }
  }

  /** The entrance record of a settlement's first landmark, its module fetched if need be. */
  async recordFor(S) {
    const find = () => [...this.plans.values()].find((r) => r.site?.S === S);
    if (find()) return find();
    const site = this.settlements.find((s) => s.S === S);
    if (site) await this.plansOf(site);
    return find();
  }

  /** The collision world in force (the settlement's in its frame, the open country's elsewhere). */
  get collide() { return this.anchor?.site ? this.anchor.site.collide : this.open; }

  setAnchor(frame, site) {
    this.anchor = { frame, site };
    const f = frame;
    ENV.planetO.value.set(f.o[0], f.o[1], f.o[2]);
    ENV.planetM.value.set(f.x[0], f.y[0], f.z[0], f.x[1], f.y[1], f.z[1], f.x[2], f.y[2], f.z[2]);
    this.r.gi.clear?.();
    this.onCollide?.(this.collide);
  }

  /** Planet coordinates of a scene point (and back). */
  toPlanet(p) { return toPlanet(this.anchor.frame, p); }
  toScene(P) { return toLocal(this.anchor.frame, P); }

  /** The settlement whose zone (disc and blend) a planet direction is in: { s, r } or null. */
  zoneOf(u) {
    for (const s of this.settlements) {
      const q = relTo(s.S, u);
      if (q.r < s.S.radius + BLEND) return { s, r: q.r };
    }
    return null;
  }

  /** The nearest settlement within `reach` metres beyond its zone: { s, r } or null. */
  nearestSite(u, reach = 260) {
    let best = null;
    for (const s of this.settlements) {
      const q = relTo(s.S, u);
      if (q.r < s.S.radius + BLEND + reach && (!best || q.r - s.S.radius < best.r - best.s.S.radius)) best = { s, r: q.r };
    }
    return best;
  }

  /** Tilt of the view in a settlement's frame toward the true up at u (none on the disc, all at the zone's edge). */
  tiltFor(site, u, out = new THREE.Quaternion()) {
    if (!site) return out.identity();
    const q = relTo(site.S, u), w = sm(site.S.radius, site.S.radius + BLEND, q.r);
    const up = dirToLocal(site.S.frame, u);
    out.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(up[0], up[1], up[2]).normalize());
    return out.slerp(new THREE.Quaternion(), 1 - w);
  }

  /**
   * Keep the anchor right for the visitor (controls: feet, yaw, pitch): the settlement's frame in
   * its zone, else a frame under the feet; the pose is carried over so that nothing moves.
   */
  reanchor(controls) {
    const F = controls.feet;
    const P = toPlanet(this.anchor.frame, [F.x, F.y, F.z]);
    const u = norm(P);
    const z = this.zoneOf(u);
    const site = z ? z.s : null;
    if (site && site === this.anchor.site) { this.tiltFor(site, u, this.tilt); return; }
    const frame = site ? site.S.frame : transportFrame(this.anchor.frame, u, R);
    const newTilt = this.tiltFor(site, u, new THREE.Quaternion());
    this.carry(controls, frame, newTilt);
    this.setAnchor(frame, site);
    this.tilt.copy(newTilt);
  }

  /** Carry the visitor's pose over to another frame (with the view's tilt there). */
  carry(controls, frame, newTilt) {
    const F = controls.feet;
    const P = toPlanet(this.anchor.frame, [F.x, F.y, F.z]);
    const fwd = new THREE.Vector3(-Math.sin(controls.yaw) * Math.cos(controls.pitch), Math.sin(controls.pitch), -Math.cos(controls.yaw) * Math.cos(controls.pitch)).applyQuaternion(this.tilt);
    const fp = dirToPlanet(this.anchor.frame, [fwd.x, fwd.y, fwd.z]);
    const fl = dirToLocal(frame, fp);
    const f2 = new THREE.Vector3(fl[0], fl[1], fl[2]).applyQuaternion(newTilt.clone().invert());
    const L = toLocal(frame, P);
    F.x = L[0]; F.y = L[1]; F.z = L[2];
    controls.yaw = Math.atan2(-f2.x, -f2.z);
    controls.pitch = Math.asin(Math.max(-1, Math.min(1, f2.y)));
  }

  /** Put the scene's objects where the anchor says, and the camera's tilt. */
  place(camera, tilt = true) {
    const S = sceneFromPlanet(this.anchor.frame, this._m);
    this.planet.matrix.copy(S);
    this.planet.matrixWorldNeedsUpdate = true;
    // a settlement built but beyond the horizon (one built ahead for the next journey, half the
    // planet away) is not drawn: the view's far plane reaches round the planet, and every one of its
    // meshes was drawn, and its shaders built, as if in sight; its far view stands for it
    const pc = _pc.setFromMatrixPosition(this.planet.matrix), cam = camera.position;
    const alt = Math.max(0, cam.distanceTo(pc) - R);
    const sight = Math.sqrt(2 * R * alt + alt * alt) + BEYOND;
    for (const s of this.settlements) {
      if (s.state === 'idle') continue;
      s.group.matrix.multiplyMatrices(S, planetFromFrame(s.S.frame, this._m2));
      s.group.matrixWorldNeedsUpdate = true;
      // (and one with a far view standing more than FULL_BEYOND past its edge, not the one visited:
      // Edo, built ahead 1.6 km from Suzhou on this small planet, was drawn whole from Suzhou's garden)
      const d = _sc.setFromMatrixPosition(s.group.matrix).distanceTo(cam), r = s.S.radius || 200;
      const far = d > sight + r || (s.impostor && s !== this.anchor?.site && d > r + FULL_BEYOND);
      s.group.visible = !far;
      s.hiddenFar = far;
    }
    for (const s of this.settlements) {
      if (!s.impostor) continue;
      // the far view too is drawn only within sight (Beijing's, 1000 km off, was drawn from Suzhou)
      if (s.state === 'ready' && !s.hiddenFar) { s.impostor.visible = false; continue; }
      s.impostor.matrix.multiplyMatrices(S, planetFromFrame(s.S.frame, this._m2));
      s.impostor.visible = _sc.setFromMatrixPosition(s.impostor.matrix).distanceTo(cam) < sight + (s.S.radius || 200);
      if (s.impostor.visible) s.impostor.matrixWorldNeedsUpdate = true;
    }
    const fs = this.floraSite;
    if (fs) { this.legacy.matrix.multiplyMatrices(S, planetFromFrame(fs.S.frame, this._m2)); this.legacy.matrixWorldNeedsUpdate = true; }
    if (tilt) camera.quaternion.premultiply(this.tilt);
    camera.updateMatrixWorld();
  }

  /** The building the visitor is near (in the anchor's settlement) and the room the point is in. */
  locate(x, y, z) {
    const site = this.anchor?.site;
    if (!site) return { building: null, room: null, distance: Infinity };
    let best = null, bd = Infinity;
    for (const rec of site.parts) {
      if (rec.plan.feature) continue;
      // (called every frame: the bounds and rooms in the settlement's frame are kept on the part)
      const [x0, z0, x1, z1] = rec.wb ??= World.worldBounds(rec.plan);
      const d = Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1));
      if (d < bd) { bd = d; best = rec; }
    }
    if (!best) return { building: null, room: null, distance: Infinity };
    let room = null;
    best.roomBoxes ??= best.plan.rooms.map((r) => {
      const a = toWorld(best.plan, r.rect[0], r.rect[1]), b = toWorld(best.plan, r.rect[2], r.rect[3]);
      return [r, Math.min(a[0], b[0]) - 0.6, Math.max(a[0], b[0]) + 0.6, Math.min(a[2], b[2]) - 0.6, Math.max(a[2], b[2]) + 0.6, r.y + (best.plan.base || 0)];
    });
    for (const [r, x0, x1, z0, z1, ry] of best.roomBoxes) {
      if (x >= x0 && x <= x1 && z >= z0 && z <= z1 && Math.abs(y - ry) < 3) { room = r; break; }
    }
    // the plans' room lists have gaps (a crossing between two rooms, the end of a chapel): within
    // GAP metres of a closed room on this level and under a roof all round, one is still in it
    if (!room && bd === 0) {
      let near = Infinity;
      for (const [r, x0, x1, z0, z1, ry] of best.roomBoxes) {
        if (r.kind === 'open' || Math.abs(y - ry) >= 3) continue;
        const d = Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1));
        if (d < GAP && d < near) { near = d; room = r; }
      }
      if (room && !this.roofed(site, x, y, z)) room = null;
    }
    return { building: best, room, distance: bd };
  }

  /**
   * Standing in a sealed room of a building (rooms with `sealed`: their openings glazed or small,
   * DESIGN §8), the meshes that lie wholly away from the building's sealed rooms — by more than
   * the room's `sealed` metres (true: SEALED_MARGIN), enough for what its doors show — are drawn
   * neither by the camera nor into the shadows (whose light comes in through the building's own
   * windows: World.update quiets them indoors already); the other settlements built are not drawn.
   * Called again every half second while sealed (merged meshes and tiles come and go); null lets go.
   */
  seal(rec) {
    this.sealedIn = rec;
    let box = null;
    if (rec) {
      const P = rec.plan, rooms = P.rooms.filter((r) => r.sealed);
      box = [Infinity, Infinity, -Infinity, -Infinity];
      for (const r of rooms) {
        const m = r.sealed === true ? SEALED_MARGIN : r.sealed;
        const a = toWorld(P, r.rect[0], r.rect[1]), b = toWorld(P, r.rect[2], r.rect[3]);
        box[0] = Math.min(box[0], a[0] - m, b[0] - m); box[1] = Math.min(box[1], a[2] - m, b[2] - m);
        box[2] = Math.max(box[2], a[0] + m, b[0] + m); box[3] = Math.max(box[3], a[2] + m, b[2] + m);
      }
    }
    for (const s of this.settlements) {
      if (s.state === 'idle') continue;
      const own = rec && rec.settlement === s;
      s.group.traverse((o) => {
        if (!o.isMesh) return;
        let hide = !!rec && !own;
        if (own) {
          // (an instanced mesh's bounds are its copies'; one not yet bounded is kept)
          const S = o.isInstancedMesh ? o.boundingSphere : o.geometry.boundingSphere;
          if (S) { const c = S.center, d = Math.hypot(Math.max(box[0] - c.x, 0, c.x - box[2]), Math.max(box[1] - c.z, 0, c.z - box[3])); hide = d > S.radius; }
        }
        const u = o.userData;
        if (hide && u.mask0 === undefined) { u.mask0 = o.layers.mask; o.layers.mask = 1 << SEALED_OUT; }
        else if (!hide && u.mask0 !== undefined) { o.layers.mask = u.mask0; delete u.mask0; }
      });
    }
  }

  /** Is there a roof (a building's upper surface) over (x, z) above y, and 1.5 m round it on every side? */
  roofed(site, x, y, z) {
    const tops = site.collide?.tops || [];
    const over = (px, pz) => tops.some((T) => {
      const i = Math.floor((px - T.x0) / T.res), j = Math.floor((pz - T.z0) / T.res);
      return i >= 0 && j >= 0 && i < T.w && j < T.h && T.data[j * T.w + i] > y + 0.5;
    });
    return [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]].every(([dx, dz]) => over(x + dx, z + dz));
  }

  static worldBounds(plan) {
    const a = toWorld(plan, plan.bounds[0], plan.bounds[1]), b = toWorld(plan, plan.bounds[2], plan.bounds[3]);
    return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
  }

  /** A building's entrance in its settlement's frame: [x, y, z, yaw]. */
  entrance(plan) {
    const e = plan.entrance;
    const p = toWorld(plan, e.at[0], e.at[1], e.y || 0);
    const yaws = { n: 0, w: Math.PI / 2, s: Math.PI, e: -Math.PI / 2 };
    return [p[0], p[1], p[2], (yaws[e.facing] ?? 0) - (plan.yaw || 0) * Math.PI / 180];
  }

  /** Planet direction of the visitor's feet. */
  here(controls) { const F = controls.feet; return norm(toPlanet(this.anchor.frame, [F.x, F.y, F.z])); }

  /** Distance (m, along the ground) from u to a settlement's rim. */
  static rimDistance(s, u) { return Math.max(0, Math.acos(Math.max(-1, Math.min(1, dot(s.S.u, u)))) * R - s.S.radius); }

  /** Load the settlements near u, let go of those far; resolves when the near ones are built. */
  async ensureNear(u, radius = LOAD) {
    // from the air one sees farther: the reach grows with the height
    const lift = Math.min(1700, Math.max(0, (this.camAlt || 0) - 60) * 1.3);
    const wanted = [];
    // nearest first: only the MAX_BUILT nearest are built; one more is kept if already built
    // (so a settlement at the edge of the count does not flicker), the rest let go
    const near = this.settlements.map((s) => [World.rimDistance(s, u), s]).sort((a, b) => a[0] - b[0]);
    // inside a settlement (within its disc) nothing else is built: the neighbours stand as their
    // impostors until one leaves it, so that a visit is never interrupted by another's building
    const inside = near[0] && near[0][0] === 0;
    near.forEach(([d, s], i) => {
      if (d < radius + lift && (i < MAX_BUILT || s === this.anchor?.site) && (!inside || d === 0)) wanted.push(s.load());
      else if (d > UNLOAD + lift || i > MAX_BUILT) { if (s !== this.anchor?.site && s !== this.kept) s.unload(); }
      if (d < 6000) s.loadImpostor();
    });
    await Promise.all(wanted);
  }

  /**
   * Arrive at a settlement's building entrance (or a pose in its frame): the anchor becomes the
   * settlement's frame, and the settlement, the ground and the plants round are made ready.
   */
  async arriveAt(site, report) {
    await site.load();
    report?.('build', 1);
  }

  /** Called every frame: load and unload by distance, the ground's detail, the plants, the baked light. */
  update(camera, controls) {
    const now = performance.now();
    const dtS = Math.min(0.1, (now - (this._lastUpdate ?? now)) / 1000); this._lastUpdate = now;
    { const t = HITCH.mark(); for (const Sy of SYSTEMS) Sy.update?.(dtS, camera, this); HITCH.since('systems', t); }
    this.letUploadsIn();
    const u = this.here(controls);
    const camP = toPlanet(this.anchor.frame, camera.position.toArray());
    let t0 = HITCH.mark();
    if (!this._next || now > this._next) { this._next = now + 400; this.ensureNear(u); HITCH.since('ensureNear', t0); t0 = HITCH.mark(); }
    if (!this._nextT || now > this._nextT) { this._nextT = now + 120; this.terrain.update(camP); HITCH.since('terrain', t0); t0 = HITCH.mark(); }
    if (!this._nextF || now > this._nextF) { this._nextF = now + 300; this.openFlora.update(camP, Math.hypot(camP[0], camP[1], camP[2]) - R); HITCH.since('open flora', t0); }
    this.camAlt = Math.hypot(camP[0], camP[1], camP[2]) - R;
    ENV.camAlt.value = this.camAlt;
    // the plants: of the settlement whose zone the visitor is in, or the nearest within reach
    let fs = this.anchor.site;
    if (!fs) { let bd = 900; for (const s of this.settlements) { const d = World.rimDistance(s, u); if (d < bd) { bd = d; fs = s; } } }
    if (fs !== this.floraSite) { this.floraSite = fs; this.flora.setSite(fs ? fs.S.focus : null); }
    if (fs) {
      const L = toLocal(fs.S.frame, camP);
      t0 = HITCH.mark();
      this.flora.update(L[0], L[2]);
      HITCH.since('flora', t0);
    }
    // small things (the life of the streets) are drawn only near: each tile within its plan's reach,
    // in every settlement built (a neighbour's too: its streets' small things were all drawn, from
    // kilometres off, a draw call each)
    t0 = HITCH.mark();
    if (!this._nextN || now > this._nextN) {
      this._nextN = now + 250;
      for (const st of this.settlements) {
        if (st.state === 'idle' || !st.parts.length) continue;
        const L = toLocal(st.S.frame, camP);
        const alt = Math.max(0, this.camAlt - (st.S.base ?? 0));
        for (const rec of st.parts) {
          const P = rec.plan;
          if (!P.near && !P.far) continue;
          const d = Math.hypot(L[0] - P.center[0], L[2] - P.center[1], alt * 0.7);
          rec.group.visible = P.near ? d < P.near : d >= P.far;
          // the small things of the streets cast shadows only in the tiles round the visitor: farther
          // off their shadows are a few texels in the outer cascades but cost a draw each
          if (P.style === 'life') {
            const cast = d < 120;
            if (rec.cast !== cast) { rec.cast = cast; rec.group.traverse((o) => { if (o.isMesh) o.castShadow = cast; }); }
          }
        }
        // the tiles merged per material (src/engine/merge.js): the tiles shown, as their groups
        if (st.merged) for (const m of st.merged.children) m.userData.batch?.choose();
      }
    }
    HITCH.since('tiles', t0); t0 = HITCH.mark();
    // fine detail (pieces under 0.4 m, src/core/geom.js): drawn within DETAIL_REACH of the part's
    // bounds, casting shadows within DETAIL_SHADOW; indoors, only the building one is in casts
    if (!this._nextD || now > this._nextD) {
      this._nextD = now + 250;
      const inside = this.indoorsIn;
      for (const s of this.settlements) {
        if (s.state === 'idle' || !s.parts.length) continue;
        const L = toLocal(s.S.frame, camP);
        for (const rec of s.parts) {
          for (const o of rec.detail) {
            const b = o.boundingSphere || o.geometry.boundingSphere;
            const d = Math.hypot(L[0] - b.center.x, L[1] - b.center.y, L[2] - b.center.z) - b.radius;
            const vis = d < DETAIL_REACH, cast = vis && d < DETAIL_SHADOW && castsShadow(o.material.name);
            if (o.visible !== vis) o.visible = vis;
            if (o.castShadow !== cast) o.castShadow = cast;
          }
          // indoors in a landmark: the other parts' shadows cannot reach in (their light comes
          // through the building's own openings, which its own walls frame)
          const quiet = inside && rec !== inside && rec.settlement === inside.settlement;
          if (rec.quiet !== quiet) {
            rec.quiet = quiet;
            rec.group.traverse((o) => { if (o.isMesh && !o.userData.detail) o.castShadow = quiet ? false : (rec.plan.style === 'life' ? rec.cast !== false : castsShadow(o.material.name)); });
            if (s.life) for (const L2 of [...s.life.meshes, ...s.life.rare]) for (const m of [L2.near, L2.far]) if (m) m.castShadow = !quiet && castsShadow(m.material.name);
          }
        }
        // the merged meshes: indoors, those that hold no part of the building one is in cast no shadow
        const q = inside && inside.settlement === s ? inside : null;
        if (s.merged && s.quietFor !== q) {
          s.quietFor = q;
          for (const m of s.merged.children) m.castShadow = m.userData.cast && (!q || m.userData.recs.has(q));
        }
      }
    }
    HITCH.since('detail', t0); t0 = HITCH.mark();
    // the fine pieces' copies chosen again as the view turns (merge.js LodSet: those well behind
    // the view are not drawn), every frame — the choosing itself only after a turn of 10°
    camera.getWorldDirection(_vd);
    for (const s of this.settlements) {
      if (!s.lods?.length || s.state !== 'ready' || s.hiddenFar) continue;
      _inv.copy(s.group.matrixWorld).invert();
      _ld.copy(_vd).transformDirection(_inv);
      const L = _li.copy(camera.position).applyMatrix4(_inv), dir = [_ld.x, _ld.y, _ld.z];
      for (const D of s.lods) if (D.kind === 'fine') D.update(L.x, L.y, L.z, false, dir);
      // the street life too: its copies well behind the view are not drawn
      if (s.life && s.life.group.visible) s.life.update(L.x, L.y, L.z, false, dir);
    }
    // the life of the streets: the copies within reach, chosen four times a second
    if (!this._nextL || now > this._nextL) {
      this._nextL = now + 250;
      for (const s of this.settlements) {
        if (!s.life && !s.lods?.length) continue;
        const L = toLocal(s.S.frame, camP);
        // the shapes drawn by distance (merge.js LodSet)
        if (s.lods) for (const D of s.lods) if (D.kind !== 'fine' || s.hiddenFar) D.update(L[0], L[1], L[2]);
        if (!s.life) continue;
        s.life.group.visible = !this.lifeHidden && s.life.ready !== false;
        if (!s.lods?.length || s.hiddenFar) s.life.update(L[0], L[1], L[2]);
      }
    }
    HITCH.since('lod+life', t0); t0 = HITCH.mark();
    const here = this.locate(camera.position.x, camera.position.y, camera.position.z);
    this.indoorsIn = here.room && here.room.kind !== 'open' && here.distance === 0 ? here.building : null;
    // in a sealed room (its openings glazed or small) the town outside is not drawn (World.seal)
    const sealed = this.indoorsIn && here.room.sealed ? this.indoorsIn : null;
    if (sealed !== this.sealedIn || (sealed && now > (this._nextSeal || 0))) { this._nextSeal = now + 500; this.seal(sealed); }
    HITCH.since('locate+seal', t0); t0 = HITCH.mark();
    // the air of the room one is in (its building's haze) and the lamps nearest the eye (src/engine/air.js)
    if (this.indoorsIn) this.r.haze = hazeOf(this.indoorsIn.plan.style);
    if (this.r.lamps && (!this._nextLamp || now > this._nextLamp)) {
      this._nextLamp = now + 250;
      const src = [];
      for (const s of this.settlements) {
        if (s.state === 'idle' || !s.parts.length) continue;
        s.group.updateMatrixWorld();
        for (const rec of s.parts) if (rec.lamps?.length && rec.group.visible !== false) src.push({ list: rec.lamps, matrix: s.group.matrixWorld });
        if (s.lifeLamps?.length) src.push({ list: s.lifeLamps, matrix: s.group.matrixWorld });
      }
      this.r.lamps.choose(camera.position, src, ENV.night.value);
    }
    // the baked light of the landmark's rooms the viewer stands in (src/engine/gi.js)
    if (here.building?.gi) this.r.gi.use(here.building.gi, camera.position); else this.r.gi.clear?.();
    HITCH.since('lamps+gi', t0);
    return here;
  }
}
