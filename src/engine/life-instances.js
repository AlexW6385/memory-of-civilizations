// The life of the streets, settlement-wide (DESIGN §8): the objects of use, the animals and the
// figures of every life tile of a settlement are gathered by shape. A shape found often enough in
// the settlement is one instanced mesh for the whole settlement — one prototype, one draw — whose
// copies are chosen every quarter second by distance (each object has its reach: a pot ~120 m, a
// figure ~170 m, a cart ~230 m). Rarer shapes are merged settlement-wide by their real material:
// one geometry of all their copies, of which the copies within reach are drawn (their index ranges
// gathered into the front of the index, as the instanced copies are chosen) — a draw or two per
// material, not one per tile and material.

import * as THREE from 'three/webgpu';
import { material } from './materials.js';
import { SMALL } from './layers.js';
import { releaseAfterUpload } from './release.js';
import { coarse, LIFE_FULL } from './cells.js';
import { placeHanging } from '../core/geom.js';

/** The view culling of the copies: drawn within 110° of the view, chosen again each 35° of turn; all within 6 m.
 *  (Each choice changes the first shadow cascade's casters, which is then drawn again in full: at 80° and
 *  every 10°, as merge.js does for fine pieces, a turn redrew it eight times a second.) */
const COS_VIEW = Math.cos(110 * Math.PI / 180), COS_TURN = Math.cos(35 * Math.PI / 180), NEAR_ALL2 = 36;

/** A shape is instanced settlement-wide from this many copies; rarer ones are merged per tile. */
export const LIFE_MIN = 13;
/** ...and only if its copies hold more than this many triangles in all: a small shape with few
 *  copies (a cord, a lid, a cup: 13 copies of 12 triangles) cost a draw call of its own, and Suzhou's
 *  street life had 124 of them; merged by material, 88 of them cost about 6 MB and no draw. Raised
 *  to 30 000 when the shops' goods came: Suzhou's canal street 73 life draws → 7.) */
export const LIFE_MIN_TRIS = 30000;
/** Is a shape of n copies of this geometry instanced (else merged by real material)? */
export const lifeInstanced = (n, geometry) => n >= LIFE_MIN && n * ((geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3) > LIFE_MIN_TRIS;

const samePrototype = (a, b) => {
  const A = a.attributes.position.array, B = b.attributes.position.array;
  if (A.length !== B.length || a.index.count !== b.index.count) return false;
  for (let i = 0; i < A.length; i++) if (Math.abs(A[i] - B[i]) > 1e-4) return false;
  // (cloth in the wind: hung the same too)
  const HA = a.attributes.hang?.array, HB = b.attributes.hang?.array;
  if (!HA !== !HB) return false;
  if (HA) for (let i = 0; i < HA.length; i++) if (Math.abs(HA[i] - HB[i]) > 1e-4) return false;
  return true;
};

export class LifeInstances {
  constructor(parent, castsShadow, precompile = null) {
    this.precompile = precompile;          // compiles a mesh's shaders off the frame (renderer.js precompile)
    this.group = new THREE.Group();
    this.group.name = 'life';
    parent.add(this.group);
    this.castsShadow = castsShadow;
    this.meshes = [];                     // { near (the mesh), all (16/copy), colors, pos (3/copy), reach, n }
    this.rare = [];                       // { near (the mesh), index (all copies), ranges (start, count / copy), pos, reach, n, size }
    this.last = null;
  }

  /**
   * Build from the life tiles' instanced pieces: parts = [{ rec, list }] (list: GeoBag.instanced).
   * The rarer shapes are merged settlement-wide by real material (this.rare).
   */
  build(parts) {
    // shapes by key, each checked against the prototype (two tiles may give one key two shapes)
    const shapes = new Map();
    for (const { rec, list } of parts) {
      for (const p of list) {
        let alts = shapes.get(p.key);
        if (!alts) shapes.set(p.key, (alts = []));
        let s = alts.find((x) => x.mat === p.mat && samePrototype(x.geometry, p.geometry));
        if (!s) { s = { mat: p.mat, geometry: p.geometry, chunks: [], n: 0 }; alts.push(s); }
        else if (s.geometry !== p.geometry) p.geometry.dispose();
        s.chunks.push({ rec, p });
        s.n += p.matrices.length / 16;
      }
    }
    const rareByMat = new Map();          // real material → [{ g, x, y, z, reach }]
    const M = new THREE.Matrix4();
    for (const alts of shapes.values()) {
      for (const s of alts) {
        if (!lifeInstanced(s.n, s.geometry)) {
          // rare: merged into its tile, by real material (indexed: a lathe's vertices are shared by
          // about six triangle corners, so a copy kept indexed costs a fraction of an unrolled one)
          const local = s.geometry.clone();
          for (const { p } of s.chunks) {
            for (let i = 0; i < p.reals.length; i++) {
              const g = placeHanging(local.clone(), M.fromArray(p.matrices, i * 16));
              const list = rareByMat.get(p.reals[i]) || rareByMat.set(p.reals[i], []).get(p.reals[i]);
              list.push({ g, x: p.matrices[i * 16 + 12], y: p.matrices[i * 16 + 13], z: p.matrices[i * 16 + 14], reach: p.reach[i] });
            }
          }
          local.dispose(); s.geometry.dispose();
          continue;
        }
        const all = new Float32Array(s.n * 16), pos = new Float32Array(s.n * 3), reach = new Float32Array(s.n);
        const tinted = s.chunks.some(({ p }) => p.colors);
        const colors = tinted ? new Float32Array(s.n * 3).fill(1) : null;
        let o = 0;
        for (const { p } of s.chunks) {
          const k = p.matrices.length / 16;
          all.set(p.matrices, o * 16);
          reach.set(p.reach, o);
          if (colors && p.colors) colors.set(p.colors, o * 3);
          for (let i = 0; i < k; i++) { pos[(o + i) * 3] = p.matrices[i * 16 + 12]; pos[(o + i) * 3 + 1] = p.matrices[i * 16 + 13]; pos[(o + i) * 3 + 2] = p.matrices[i * 16 + 14]; }
          o += k;
        }
        // one mesh of all the copies chosen. (They were two, the copies within 120 m casting shadows
        // and those beyond not; but the small things cast into the first cascade only, which ends
        // well within 120 m (src/engine/renderer.js), so the far ones' shadows fell nowhere and the
        // second mesh was only a second draw.)
        const make = (cast, geometry = s.geometry) => {
          const mesh = new THREE.InstancedMesh(geometry, material(s.mat), s.n);
          // always with instance colours (white where untinted): one form of each material (world.js buildingMesh)
          mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(s.n * 3).fill(1), 3);
          mesh.count = 0; mesh.visible = false;
          mesh.castShadow = cast && this.castsShadow(s.mat);
          mesh.receiveShadow = true;
          mesh.name = `life:${s.mat}`;
          mesh.layers.set(SMALL);
          this.group.add(mesh);
          return mesh;
        };
        // beyond LIFE_FULL the copies are drawn coarse (src/engine/cells.js), where the shape has a
        // faithful coarse version: made later, a shape at a time (a few ms each, update())
        const near = make(true), shape = { near, far: null, all, colors, pos, reach, n: s.n };
        const g = s.geometry, P = g.attributes.position.array, N = g.attributes.normal.array, I = g.index.array;
        // (made in the build worker where the tiles were built there: build-worker.js)
        const pre = s.chunks.map(({ p }) => p.geometry.userData.coarse).find((c) => c !== undefined);
        // (cloth in the wind: no coarse version, which would have no hang)
        if (!g.attributes.hang) shape.makeFar = () => {
          const low = pre ? pre.low : coarse(P, N, I);
          if (!low) return;
          const lg = new THREE.BufferGeometry();
          lg.setAttribute('position', new THREE.BufferAttribute(low.pos, 3));
          lg.setAttribute('normal', new THREE.BufferAttribute(low.nor, 3, g.attributes.normal.normalized));
          lg.setIndex(new THREE.BufferAttribute(low.index, 1, low.index instanceof Uint16Array));
          lg.computeBoundingBox(); lg.computeBoundingSphere();
          const far = make(true, lg);
          far.castShadow = near.castShadow;
          // (a coarse version has other attributes than its shape: its shaders compiled before it is used)
          if (!this.precompile) { shape.far = far; this.last = null; return; }
          this.precompile(far).then(() => { if (!this.disposed) { shape.far = far; this.last = null; } });
        };
        shape.pre = !!pre;
        this.meshes.push(shape);
      }
    }
    // the rare shapes, per real material: one geometry, drawn by an index of the copies chosen
    for (const [mat, list] of rareByMat) {
      const n = list.length, pos = new Float32Array(n * 3), reach = new Float32Array(n), ranges = new Uint32Array(n * 2);
      let o = 0, size = 0;
      list.forEach((c, i) => {
        c.g.computeBoundingBox();
        const b = c.g.boundingBox;
        size = Math.max(size, Math.hypot(Math.max(b.max.x - c.x, c.x - b.min.x), Math.max(b.max.y - c.y, c.y - b.min.y), Math.max(b.max.z - c.z, c.z - b.min.z)));
        pos[i * 3] = c.x; pos[i * 3 + 1] = c.y; pos[i * 3 + 2] = c.z; reach[i] = c.reach;
        const k = c.g.index ? c.g.index.count : c.g.attributes.position.count;
        ranges[i * 2] = o; ranges[i * 2 + 1] = k; o += k;
      });
      const merged = mergeList(list.map((c) => c.g));
      const index = merged.index.array;
      const make = (cast) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', merged.attributes.position);
        g.setAttribute('normal', merged.attributes.normal);
        if (merged.attributes.hang) g.setAttribute('hang', merged.attributes.hang);
        // (of even length: a 16-bit index is written to the GPU in whole 4-byte words, below)
        g.setIndex(new THREE.BufferAttribute(new index.constructor(index.length + (index.length & 1)), 1, merged.index.normalized));
        g.setDrawRange(0, 0);
        g.boundingBox = merged.boundingBox.clone(); g.boundingSphere = merged.boundingSphere.clone();
        const mesh = new THREE.InstancedMesh(g, material(mat), 1);
        mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(3).fill(1), 3);
        mesh.visible = false;
        mesh.castShadow = cast && this.castsShadow(mat);
        mesh.receiveShadow = true;
        mesh.name = `life:${mat}:rare`;
        mesh.layers.set(SMALL);
        // its vertices let go of once on the GPU; the index is written again as the copies change
        releaseAfterUpload(mesh, { keepIndex: true });
        this.group.add(mesh);
        return mesh;
      };
      this.rare.push({ near: make(true), index, ranges, pos, reach, n, size });
    }
  }

  /** Choose the copies within reach of the viewer (x, y, z in the settlement's frame). */
  update(x, y, z, force = false, dir = null) {
    // the shapes' coarse versions made a few at each call (~3 ms), until all are (src/engine/cells.js)
    if (!this.lowDone) {
      // those made in the build worker, ~3 ms of them a call; those to be made here (coarse(), a
      // few ms each, more for a large shape) when the page is idle, one at a time
      const t0 = performance.now();
      for (const L of this.meshes) {
        if (!L.makeFar || !L.pre) continue;
        if (performance.now() - t0 > 3) break;
        const f = L.makeFar; L.makeFar = null; f();
      }
      if (!this.idling && this.meshes.some((L) => L.makeFar && !L.pre)) this.idleLow();
      this.lowDone = !this.meshes.some((L) => L.makeFar);
    }
    // chosen again after a step of 4 m or a turn of 35° (dir: the view's direction, in the
    // settlement's frame); the copies well behind the view are left out, as merge.js LodSet does
    // (those within NEAR_ALL kept: their shadows may fall into the view)
    const turned = dir && (!this.lastDir || dir[0] * this.lastDir[0] + dir[1] * this.lastDir[1] + dir[2] * this.lastDir[2] < COS_TURN);
    if (!force && !turned && this.last && Math.hypot(x - this.last[0], y - this.last[1], z - this.last[2]) < 4) return;
    this.last = [x, y, z];
    if (dir) this.lastDir = [dir[0], dir[1], dir[2]];
    const vx = dir ? dir[0] : 0, vy = dir ? dir[1] : 0, vz = dir ? dir[2] : 0;
    const behind = (dx, dy, dz, d2, r) => dir && d2 > NEAR_ALL2 && dx * vx + dy * vy + dz * vz < Math.sqrt(d2) * COS_VIEW - r;
    const full2 = LIFE_FULL * LIFE_FULL;
    for (const L of this.meshes) {
      const { near, far, all, colors, pos, reach, n } = L;
      const Mn = near.instanceMatrix.array, Cn = near.instanceColor.array, Mf = far?.instanceMatrix.array, Cf = far?.instanceColor.array;
      let c = 0, f = 0;
      for (let i = 0; i < n; i++) {
        const dx = pos[i * 3] - x, dy = (pos[i * 3 + 1] - y) * 0.7, dz = pos[i * 3 + 2] - z, r = reach[i], d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > r * r) continue;
        if (behind(dx, pos[i * 3 + 1] - y, dz, d2, 3)) continue;
        // (the coarse copies beyond LIFE_FULL, where the shape has a coarse version)
        const toFar = far && d2 > full2, M = toFar ? Mf : Mn, C = toFar ? Cf : Cn, k = toFar ? f++ : c++;
        M.set(all.subarray(i * 16, i * 16 + 16), k * 16);
        if (colors) { C[k * 3] = colors[i * 3]; C[k * 3 + 1] = colors[i * 3 + 1]; C[k * 3 + 2] = colors[i * 3 + 2]; }
      }
      const put = (mesh, k) => {
        if (k === 0 && mesh.count === 0) return;
        mesh.count = k;
        mesh.instanceMatrix.clearUpdateRanges(); mesh.instanceMatrix.addUpdateRange(0, k * 16); mesh.instanceMatrix.needsUpdate = true;
        if (colors) { mesh.instanceColor.clearUpdateRanges(); mesh.instanceColor.addUpdateRange(0, k * 3); mesh.instanceColor.needsUpdate = true; }
        mesh.visible = k > 0;
        if (k) mesh.computeBoundingSphere();
      };
      put(near, c);
      if (far) put(far, f);
    }
    // the rare shapes: the index ranges of the copies within reach, gathered at the front of the
    // mesh's index; the bounds those of the copies chosen
    for (const B of this.rare) {
      const { near: mesh, index, ranges, pos, reach, n, size } = B;
      const g = mesh.geometry, dst = g.index.array;
      let fill = 0, x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
      for (let i = 0; i < n; i++) {
        const px = pos[i * 3], py = pos[i * 3 + 1], pz = pos[i * 3 + 2];
        const dx = px - x, dy = (py - y) * 0.7, dz = pz - z, r = reach[i];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > r * r) continue;
        if (behind(dx, py - y, dz, d2, size)) continue;
        const s0 = ranges[i * 2], k = ranges[i * 2 + 1];
        dst.set(index.subarray(s0, s0 + k), fill); fill += k;
        if (px < x0) x0 = px; if (py < y0) y0 = py; if (pz < z0) z0 = pz;
        if (px > x1) x1 = px; if (py > y1) y1 = py; if (pz > z1) z1 = pz;
      }
      if (fill === 0 && g.drawRange.count === 0) continue;
      g.setDrawRange(0, fill);
      mesh.visible = fill > 0;
      if (!fill) continue;
      // only the front of the index is written (WebGPU writes whole 4-byte words: an even count of 16-bit indices)
      g.index.clearUpdateRanges(); g.index.addUpdateRange(0, dst instanceof Uint16Array ? fill + (fill & 1) : fill); g.index.needsUpdate = true;
      // the copies' bounds: their places, grown by the largest copy's reach from its place
      g.boundingSphere.center.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      g.boundingSphere.radius = Math.hypot(x1 - x0, y1 - y0, z1 - z0) / 2 + size;
      mesh.boundingSphere = null;
    }
  }

  /** The coarse versions to be made here, in the page's idle time (a shape per idle period). */
  idleLow() {
    this.idling = true;
    const step = (deadline) => {
      if (this.disposed) return;
      const L = this.meshes.find((x) => x.makeFar && !x.pre);
      if (!L) { this.idling = false; return; }
      // a shape when the idle period has room (or after a second's wait at most)
      if (!deadline || deadline.didTimeout || deadline.timeRemaining() > 6) { const f = L.makeFar; L.makeFar = null; f(); }
      schedule();
    };
    const schedule = () => (globalThis.requestIdleCallback ? requestIdleCallback(step, { timeout: 1000 }) : setTimeout(step, 50));
    schedule();
  }

  dispose() {
    this.disposed = true;
    for (const { near, far } of [...this.meshes, ...this.rare]) { near.geometry.dispose(); near.dispose(); if (far) { far.geometry.dispose(); far.dispose(); } }
    this.meshes = []; this.rare = [];
    this.group.removeFromParent();
  }
}

function mergeList(gs) {
  let n = 0, ni = 0;
  for (const g of gs) { n += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), idx = n > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  // (cloth in the wind keeps its hang: src/core/geom.js hangFrom)
  const hang = gs.some((g) => g.attributes.hang) ? new Float32Array(n) : null;
  let o = 0, oi = 0;
  for (const g of gs) {
    const v = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    if (hang && g.attributes.hang) hang.set(g.attributes.hang.array, o);
    if (g.index) { const I = g.index.array; for (let k = 0; k < I.length; k++) idx[oi + k] = I[k] + o; oi += I.length; }
    else { for (let k = 0; k < v; k++) idx[oi + k] = o + k; oi += v; }
    o += v; g.dispose();
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (hang) m.setAttribute('hang', new THREE.Float32BufferAttribute(hang, 1));
  // a Uint16 index flagged normalized stays 16-bit on the GPU (src/core/geom.js, indexAttribute)
  m.setIndex(new THREE.BufferAttribute(idx, 1, idx instanceof Uint16Array));
  m.computeBoundingBox(); m.computeBoundingSphere();
  return m;
}
