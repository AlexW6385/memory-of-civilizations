// The life of the streets, settlement-wide (DESIGN §8): the objects of use, the animals and the
// figures of every life tile of a settlement are gathered by shape. A shape found often enough in
// the settlement is one instanced mesh for the whole settlement — one prototype, one draw — whose
// copies are chosen every quarter second by distance (each object has its reach: a pot ~120 m, a
// figure ~170 m, a cart ~230 m). Rarer shapes are merged back into their tile's meshes (by their
// real materials), which the world shows and hides with the tile as before.

import * as THREE from 'three/webgpu';
import { material } from './materials.js';

/** A shape is instanced settlement-wide from this many copies; rarer ones are merged per tile. */
export const LIFE_MIN = 16;
/** Copies nearer than this cast shadows (as the life tiles did before). */
const SHADOW_NEAR = 120;

const samePrototype = (a, b) => {
  const A = a.attributes.position.array, B = b.attributes.position.array;
  if (A.length !== B.length || a.index.count !== b.index.count) return false;
  for (let i = 0; i < A.length; i++) if (Math.abs(A[i] - B[i]) > 1e-4) return false;
  return true;
};

export class LifeInstances {
  constructor(parent, castsShadow) {
    this.group = new THREE.Group();
    this.group.name = 'life';
    parent.add(this.group);
    this.castsShadow = castsShadow;
    this.meshes = [];                     // { mesh, all (16/copy), colors, pos (3/copy), reach, n }
    this.last = null;
  }

  /**
   * Build from the life tiles' instanced pieces: parts = [{ rec, list }] (list: GeoBag.instanced).
   * Returns, per tile record, the merged geometries of its rarer shapes: Map rec → [{ mat, geometry }].
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
    const perTile = new Map();
    const M = new THREE.Matrix4();
    for (const alts of shapes.values()) {
      for (const s of alts) {
        if (s.n < LIFE_MIN) {
          // rare: merged into its tile, by real material
          const local = s.geometry.toNonIndexed();
          for (const { rec, p } of s.chunks) {
            const byMat = perTile.get(rec) || perTile.set(rec, new Map()).get(rec);
            for (let i = 0; i < p.reals.length; i++) {
              const g = local.clone().applyMatrix4(M.fromArray(p.matrices, i * 16));
              (byMat.get(p.reals[i]) || byMat.set(p.reals[i], []).get(p.reals[i])).push(g);
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
        // two meshes of one prototype: the copies near the viewer, which cast shadows, and those
        // farther off, whose shadows would be a few texels of the outer cascades
        const make = (cast) => {
          const mesh = new THREE.InstancedMesh(s.geometry, material(s.mat), s.n);
          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          // always with instance colours (white where untinted): one form of each material (world.js buildingMesh)
          mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(s.n * 3).fill(1), 3); mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
          mesh.count = 0; mesh.visible = false;
          mesh.castShadow = cast && this.castsShadow(s.mat);
          mesh.receiveShadow = true;
          mesh.name = `life:${s.mat}${cast ? '' : ':far'}`;
          this.group.add(mesh);
          return mesh;
        };
        this.meshes.push({ near: make(true), far: make(false), all, colors, pos, reach, n: s.n });
      }
    }
    // the merged geometries of the rare shapes, per tile
    const out = new Map();
    for (const [rec, byMat] of perTile) {
      const list = [];
      for (const [mat, gs] of byMat) list.push({ mat, geometry: mergeList(gs) });
      out.set(rec, list);
    }
    return out;
  }

  /** Choose the copies within reach of the viewer (x, y, z in the settlement's frame). */
  update(x, y, z, force = false) {
    if (!force && this.last && Math.hypot(x - this.last[0], y - this.last[1], z - this.last[2]) < 4) return;
    this.last = [x, y, z];
    for (const L of this.meshes) {
      const { near, far, all, colors, pos, reach, n } = L;
      const fill = [0, 0];
      for (let i = 0; i < n; i++) {
        const dx = pos[i * 3] - x, dy = (pos[i * 3 + 1] - y) * 0.7, dz = pos[i * 3 + 2] - z, r = reach[i], d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > r * r) continue;
        const w = d2 < SHADOW_NEAR * SHADOW_NEAR ? 0 : 1, mesh = w ? far : near, c = fill[w]++;
        mesh.instanceMatrix.array.set(all.subarray(i * 16, i * 16 + 16), c * 16);
        if (colors) { const cd = mesh.instanceColor.array; cd[c * 3] = colors[i * 3]; cd[c * 3 + 1] = colors[i * 3 + 1]; cd[c * 3 + 2] = colors[i * 3 + 2]; }
      }
      [near, far].forEach((mesh, w) => {
        const c = fill[w];
        if (c === 0 && mesh.count === 0) return;
        mesh.count = c;
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.visible = c > 0;
        if (c) mesh.computeBoundingSphere();
      });
    }
  }

  dispose() {
    for (const { near, far } of this.meshes) { near.geometry.dispose(); near.dispose(); far.dispose(); }
    this.meshes = [];
    this.group.removeFromParent();
  }
}

function mergeList(gs) {
  let n = 0;
  for (const g of gs) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of gs) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; g.dispose(); }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  m.computeBoundingBox(); m.computeBoundingSphere();
  return m;
}
