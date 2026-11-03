// The planet's ground in the viewer: a quadtree of tiles on the six faces of a cube blown up to
// the sphere. Tiles near the visitor are small and fine (about 1.5 m between vertices at the
// deepest level), far ones large and coarse; tiles beyond the horizon are not drawn. Tiles are
// built in workers (src/planet/chunk.js) and swapped in when ready, the coarser tile staying in
// place until every finer one that replaces it is there.

import * as THREE from 'three/webgpu';
import { PLANET_RADIUS as R } from './relief.js';
import { faceDir, tileRect } from './chunk.js';
import { groundMaterial, seaMaterial } from './materials.js';
import { climateAt } from './land.js';

const MAX_LEVEL = 8, N = 32, SPLIT = 2.1;

const key = (f, L, i, j) => `${f}/${L}/${i}/${j}`;
const parentKey = (f, L, i, j) => (L ? key(f, L - 1, i >> 1, j >> 1) : null);

export class PlanetTerrain {
  constructor(group, land) {
    this.group = group;                  // the planet's group (planet coordinates)
    this.mat = groundMaterial();
    this.seaMat = seaMaterial();
    this.tiles = new Map();              // key → { mesh, sea, minH, maxH, f, L, i, j, used }
    this.pending = new Set();
    this.queue = [];
    this.heights = new Map();            // key → [minH, maxH] of built tiles (kept after they go)
    this.shown = new Set();
    this.frame = 0;
    const n = Math.min(4, Math.max(1, (navigator.hardwareConcurrency || 2) - 1));
    this.workerList = [];
    this.ready = Promise.all(Array.from({ length: n }, () => new Promise((ok) => {
      const w = new Worker(new URL('./terrain-worker.js', import.meta.url), { type: 'module' });
      w.idle = false;
      w.onmessage = (e) => {
        if (e.data.ready) { w.idle = true; ok(); this.pump(); return; }
        w.idle = true;
        this.receive(e.data);
        this.pump();
      };
      w.postMessage({ land });
      this.workerList.push(w);
    })));
  }

  /** Node geometry: centre direction, arc size (m). */
  static node(f, L, i, j) {
    const [s0, t0, size] = tileRect(L, i, j);
    return { c: faceDir(f, s0 + size / 2, t0 + size / 2), size: size * Math.PI / 4 * R * 1.15 };
  }

  /** The height range a tile can have, before it is built: from the mountains under it (the land map). */
  guess(f, L, i, j, k) {
    this.guesses ??= new Map();
    let g = this.guesses.get(k);
    if (g) return g;
    const [s0, t0, size] = tileRect(L, i, j);
    let m = 0;
    for (const [a, b] of [[0.5, 0.5], [0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0], [0, 0.5], [1, 0.5], [0.5, 1]]) m = Math.max(m, climateAt(faceDir(f, s0 + size * a, t0 + size * b))[0]);
    // hills, the settlements' rocks and the coarseness of the samples on top
    g = [-30, m * 1.1 + 45 + (L < 4 ? 60 : 0)];
    this.guesses.set(k, g);
    return g;
  }

  /**
   * The tiles wanted for a camera at planet position cam (metres from the centre): returns them,
   * nearest first, as [{ k, f, L, i, j, d }].
   */
  layout(cam) {
    const rc = Math.hypot(cam[0], cam[1], cam[2]), cu = [cam[0] / rc, cam[1] / rc, cam[2] / rc];
    const alt = Math.max(0.5, rc - R);
    const horizonCam = Math.acos(Math.min(1, R / (R + alt)));
    const want = [];
    const visit = (f, L, i, j) => {
      const { c, size } = PlanetTerrain.node(f, L, i, j);
      const k = key(f, L, i, j);
      const hm = this.heights.get(k) || this.heights.get(parentKey(f, L, i, j)) || this.guess(f, L, i, j, k);
      const th = Math.acos(Math.max(-1, Math.min(1, c[0] * cu[0] + c[1] * cu[1] + c[2] * cu[2])));
      const half = size / R * 0.75;
      if (th - half > horizonCam + Math.acos(Math.min(1, R / (R + Math.max(1, hm[1]))))) return;   // beyond the horizon
      // distance from the camera to the nearest point of the tile, roughly
      const surf = R + Math.max(hm[0], Math.min(hm[1], alt));
      const p = [c[0] * surf, c[1] * surf, c[2] * surf];
      const d = Math.max(0, Math.hypot(p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]) - size * 0.75);
      if (L < MAX_LEVEL && d < SPLIT * size) {
        for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) visit(f, L + 1, i * 2 + a, j * 2 + b);
      } else want.push({ k, f, L, i, j, d });
    };
    for (let f = 0; f < 6; f++) visit(f, 0, 0, 0);
    return want.sort((a, b) => a.d - b.d);
  }

  /** Bring the ground up to date for a camera at planet position cam. Returns how many tiles are still to come. */
  update(cam) {
    this.frame++;
    const want = this.layout(cam);
    this.wantKeys = new Set(want.map((w) => w.k));
    // what to build: the wanted tiles not built, nearest first
    this.queue = want.filter((w) => !this.tiles.has(w.k) && !this.pending.has(w.k));
    this.pump();
    // what to show: each wanted tile if built; otherwise its nearest built ancestor (which then
    // stands for all its wanted descendants), or else its built descendants
    const show = new Set();
    const fallback = new Set();
    for (const w of want) {
      if (this.tiles.has(w.k)) { show.add(w.k); continue; }
      let f = w.f, L = w.L, i = w.i, j = w.j, found = null;
      while (L > 0) { L--; i >>= 1; j >>= 1; const k = key(f, L, i, j); if (this.tiles.has(k)) { found = k; break; } }
      if (found) fallback.add(found);
      else for (const [k, t] of this.tiles) if (t.f === w.f && t.L > w.L && (t.i >> (t.L - w.L)) === w.i && (t.j >> (t.L - w.L)) === w.j) show.add(k);
    }
    for (const a of fallback) {
      const [f, L, i, j] = a.split('/').map(Number);
      for (const k of [...show]) {
        const [f2, L2, i2, j2] = k.split('/').map(Number);
        if (f2 === f && L2 > L && (i2 >> (L2 - L)) === i && (j2 >> (L2 - L)) === j) show.delete(k);
      }
      show.add(a);
    }
    for (const [k, t] of this.tiles) {
      const on = show.has(k);
      t.mesh.visible = on;
      if (t.sea) t.sea.visible = on;
      if (on) t.used = this.frame;
    }
    // let go of tiles unused for a while (beyond a reserve)
    if (this.tiles.size > 700) {
      const old = [...this.tiles.entries()].filter(([k, t]) => !show.has(k) && !this.wantKeys.has(k)).sort((a, b) => a[1].used - b[1].used);
      for (const [k, t] of old.slice(0, this.tiles.size - 600)) this.drop(k, t);
    }
    return this.queue.length + this.pending.size;
  }

  drop(k, t) {
    this.group.remove(t.mesh); t.mesh.geometry.dispose();
    if (t.sea) { this.group.remove(t.sea); t.sea.geometry.dispose(); }
    this.tiles.delete(k);
  }

  /** Resolve when the tiles wanted near the camera are built (start, travel); onProgress(0…1). */
  async readyAt(camFn, onProgress) {
    await this.ready;
    let total = 0;
    for (;;) {
      const left = this.update(camFn());
      total = Math.max(total, left);
      onProgress?.(total ? 1 - left / total : 1);
      if (!left) return;
      await new Promise((r) => setTimeout(r, 40));
    }
  }

  pump() {
    if (!this.workerList) return;
    for (const w of this.workerList) {
      if (!w.idle || !this.queue.length) continue;
      const job = this.queue.shift();
      if (this.pending.has(job.k) || this.tiles.has(job.k)) continue;
      this.pending.add(job.k);
      w.idle = false;
      w.postMessage({ key: job.k, f: job.f, L: job.L, i: job.i, j: job.j, n: N });
    }
  }

  receive(d) {
    this.pending.delete(d.key);
    const [f, L, i, j] = d.key.split('/').map(Number);
    this.heights.set(d.key, [d.minH, d.maxH]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(d.position, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(d.normal, 3));
    g.setAttribute('ground', new THREE.BufferAttribute(d.ground, 4));
    g.setAttribute('ground2', new THREE.BufferAttribute(d.ground2, 4));
    g.setAttribute('ground3', new THREE.BufferAttribute(d.ground3, 4));
    g.setIndex(new THREE.BufferAttribute(d.index, 1));
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, this.mat);
    mesh.receiveShadow = true;
    mesh.castShadow = L >= 6;
    mesh.name = 'ground:' + d.key;
    mesh.visible = false;
    mesh.matrixAutoUpdate = false;
    this.group.add(mesh);
    let sea = null;
    if (d.water) {
      const w = new THREE.BufferGeometry();
      w.setAttribute('position', new THREE.BufferAttribute(d.water.position, 3));
      w.setAttribute('depth', new THREE.BufferAttribute(d.water.depth, 1));
      w.setIndex(new THREE.BufferAttribute(d.water.index, 1));
      w.computeBoundingSphere();
      sea = new THREE.Mesh(w, this.seaMat);
      sea.receiveShadow = true;
      sea.name = 'sea:' + d.key;
      sea.visible = false;
      sea.matrixAutoUpdate = false;
      this.group.add(sea);
    }
    this.tiles.set(d.key, { mesh, sea, minH: d.minH, maxH: d.maxH, f, L, i, j, used: this.frame });
  }
}
