// A settlement's static meshes merged across its plans (DESIGN §8: draw calls). Each plan is built
// into a mesh per material and an instanced mesh per repeated shape (src/core/geom.js, GeoBag), so
// a settlement of forty plans drew the same brick forty times, each a draw in the scene pass and in
// every shadow cascade that saw it: most of the CPU's ~12–18 ms a frame went to submitting them.
// Once a settlement is built, the meshes of its plans that are always shown (not the town's tiles,
// not the street life, not fine detail) are merged: per material one mesh, per repeated shape one
// instanced mesh with every plan's copies. The town's tiles, shown and hidden by distance, are
// merged per material and version too, and drawn by an index of the tiles shown (TileBatch). The picture is the same (the same triangles, the same
// stand-off per material); what is lost is culling per plan, which in a settlement seen from inside
// it culled little (counted by tools/draw-count.mjs).
//
// Merged meshes as wide as the settlement were never outside the view (src/engine/cells.js): the
// big ones are cut into cells of the ground, each culled on its own, and the instanced shapes that
// are rods and bars or fine carved pieces are drawn by distance (LodSet): the bars only near, the
// fine pieces in full near and coarse beyond, their shadows the coarse ones'.
//
// The merge is time-sliced (DESIGN §8: ≤ 4 ms a frame): the merged arrays are filled a member at a
// time, and each merged mesh replaces its members in one step, so nothing is ever drawn twice or not
// at all.

import * as THREE from 'three/webgpu';
import { releaseAfterUpload } from './release.js';
import { SPLIT_TRIS, LOD_NEAR, FINE_SHADOW, THIN_FAR, SHADOW_IOU, cellKey, lodKind, coarse, trianglesByCell, subGeometry } from './cells.js';
import { SMALL, SHADOW } from './layers.js';

/** Time a merge may take before it gives the frame back (ms). */
const SLICE = 4;

/**
 * Mark a plan's meshes that may be merged (before their arrays are let go of): they keep their
 * arrays until the merge; instanced meshes are told apart by a hash of their prototype.
 */
export function markMergeable(plan, group) {
  if (plan.style === 'life') return;
  for (const o of group.children) {
    if (!o.isInstancedMesh || !o.material?.name || !o.geometry.index || o.userData.detail) continue;
    const g = o.geometry, mat = o.material.name;
    // a tile of the town (its near or far version, src/settlements/lod.js): its parts batched per
    // material with the other tiles' of the same version, the tiles shown chosen
    if (plan.near || plan.far) { if (o.count === 1 && o.name.endsWith(':' + mat)) o.userData.merge = { kind: 'tile', mat, key: `t|${plan.near ? 'near' : 'far'}|${mat}|${formatOf(g)}` }; continue; }
    if (o.count === 1 && o.name.endsWith(':' + mat)) o.userData.merge = { kind: 'part', mat, key: `p|${mat}|${formatOf(g)}` };
    else if (o.name.endsWith(':inst')) o.userData.merge = { kind: 'inst', mat, key: `i|${mat}|${hashGeometry(g)}` };
  }
}

/** The attribute formats of a merged part (meshes of other formats are other pipelines). */
const formatOf = (g) => Object.keys(g.attributes).sort().map((k) => `${k}:${g.attributes[k].array.constructor.name}${g.attributes[k].normalized ? 'n' : ''}`).join();

/** A prototype's identity: its vertices, normals and index. */
function hashGeometry(g) {
  let h = 2166136261 >>> 0;
  // floats by their bits, other arrays by their values
  const mix = (arr) => {
    const u = arr instanceof Float32Array ? new Uint32Array(arr.buffer, arr.byteOffset, arr.length) : arr;
    h = Math.imul(h ^ u.length, 16777619);
    for (let i = 0; i < u.length; i++) h = Math.imul(h ^ u[i], 16777619);
  };
  const I = g.index.array;
  mix(g.attributes.position.array); mix(g.attributes.normal.array); mix(I);
  return `${g.attributes.position.count}:${I.length}:${(h >>> 0).toString(36)}`;
}

/**
 * Merge the marked meshes of a settlement's parts (recs: { group }) into `into`. make(geometry, mat,
 * matrices, colors) makes a mesh as the world does (src/engine/world.js buildingMesh); stale() says
 * the settlement was let go of meanwhile. Returns the merged meshes, each with userData.recs (the
 * parts it holds).
 */
export async function mergeParts(recs, into, make, { castsShadow, stale = () => false, lods = [] } = {}) {
  const groups = new Map();
  for (const rec of recs) {
    for (const o of rec.group.children) {
      const u = o.userData.merge;
      if (!u) continue;
      let G = groups.get(u.key);
      if (!G) groups.set(u.key, (G = { ...u, list: [] }));
      G.list.push({ o, rec });
    }
  }
  const out = [];
  let t = performance.now();
  const breathe = async () => { if (performance.now() - t > SLICE) { await new Promise((r) => setTimeout(r, 0)); t = performance.now(); } };
  // a member left as it is (a shape or material of one plan only, not worth cutting or choosing)
  const keep = (G) => { for (const { o } of G.list) { delete o.userData.merge; releaseAfterUpload(o); } };
  for (const G of groups.values()) {
    if (stale()) return out;
    const recSet = new Set(G.list.map(({ rec }) => rec));
    if (G.kind === 'tile') {
      if (G.list.length < 2) { keep(G); continue; }
      const geometry = await mergeGeometries(G.list.map(({ o }) => o.geometry), breathe, stale);
      if (!geometry) return out;
      const B = new TileBatch(geometry, G.list, G.mat, make);
      if (stale()) { B.mesh.geometry.dispose(); B.mesh.dispose(); return out; }
      B.mesh.castShadow = castsShadow(G.mat);
      B.mesh.userData.cast = B.mesh.castShadow;
      B.mesh.userData.recs = recSet;
      B.choose();
      into.add(B.mesh);
      for (const { o } of G.list) letGo(o);
      releaseAfterUpload(B.mesh, { keepIndex: true });
      out.push(B.mesh);
      await breathe();
      continue;
    }
    let meshes;
    if (G.kind === 'part') {
      let tris = 0;
      for (const { o } of G.list) tris += o.geometry.index.count / 3;
      if (G.list.length < 2 && tris < SPLIT_TRIS) { keep(G); continue; }
      const geometry = await mergeGeometries(G.list.map(({ o }) => o.geometry), breathe, stale);
      if (!geometry) return out;
      meshes = tris >= SPLIT_TRIS ? await cutIntoCells(geometry, G.mat, make, breathe) : [make(geometry, G.mat)];
      for (const m of meshes) { m.castShadow = castsShadow(G.mat); m.name = `merged:${G.mat}`; }
    } else {
      let n = 0;
      for (const { o } of G.list) n += o.count;
      const proto = G.list[0].o.geometry;
      if (!proto.boundingBox) proto.computeBoundingBox();
      const tri = proto.index.count / 3, bb = proto.boundingBox;
      const M0 = G.list[0].o.instanceMatrix.array;
      let lod = lodKind(tri, [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z], M0);
      const P = proto.attributes.position.array, N = proto.attributes.normal.array, I = proto.index.array;
      const low = lod === 'fine' ? coarse(P, N, I) : null;
      if (lod === 'fine' && !low) lod = null;
      const lowShadow = low ? coarse(P, N, I, SHADOW_IOU) ?? low : null;
      if (G.list.length < 2 && !lod && n * tri < SPLIT_TRIS) { keep(G); continue; }
      const matrices = new Float32Array(n * 16), colors = new Float32Array(n * 3);
      let k = 0;
      for (const { o } of G.list) {
        matrices.set(o.instanceMatrix.array.subarray(0, o.count * 16), k * 16);
        colors.set(o.instanceColor.array.subarray(0, o.count * 3), k * 3);
        k += o.count;
      }
      // (a copy of the prototype: one still used by a mesh let go of (its render objects disposed)
      // took its buffers with it, and the GPU process crashed drawing the merged mesh)
      if (lod) {
        const L = new LodSet(lod, proto, low && lowGeometry(proto, low), lowShadow && lowGeometry(proto, lowShadow), G.mat, matrices, colors, make, castsShadow(G.mat));
        lods.push(L);
        meshes = L.meshes;
      } else if (n * tri >= SPLIT_TRIS) {
        meshes = [];
        for (const idx of copiesByCell(proto, matrices)) {
          const Mc = new Float32Array(idx.length * 16), Cc = new Float32Array(idx.length * 3);
          idx.forEach((i, j) => { Mc.set(matrices.subarray(i * 16, i * 16 + 16), j * 16); Cc.set(colors.subarray(i * 3, i * 3 + 3), j * 3); });
          meshes.push(make(proto.clone(), G.mat, Mc, Cc));
        }
      } else meshes = [make(proto.clone(), G.mat, matrices, colors)];
      for (const m of meshes) {
        if (!m.userData.lod) m.castShadow = castsShadow(G.mat);
        m.name = `merged:${G.mat}:inst`;
      }
    }
    if (stale()) { for (const m of meshes) { m.geometry.dispose(); m.dispose(); } return out; }
    // the swap, in one step: the merged meshes in, their members out
    for (const m of meshes) {
      m.receiveShadow = true;
      m.userData.recs = recSet;
      m.userData.cast = m.castShadow;
      releaseAfterUpload(m);
      into.add(m);
      out.push(m);
    }
    for (const { o } of G.list) letGo(o);
    await breathe();
  }
  return out;
}

/** A merged geometry cut into cells of the ground (src/engine/cells.js): a mesh each. */
async function cutIntoCells(geometry, mat, make, breathe) {
  const names = Object.keys(geometry.attributes), I = geometry.index.array;
  const attrs = names.map((k) => ({ array: geometry.attributes[k].array, size: geometry.attributes[k].itemSize }));
  const byCell = trianglesByCell(geometry.attributes.position.array, I);
  if (byCell.size < 2) return [make(geometry, mat)];
  const out = [];
  for (const { tri } of byCell.values()) {
    const sub = subGeometry(attrs, I, tri, names.indexOf('position'));
    const g = new THREE.BufferGeometry();
    names.forEach((k, a) => g.setAttribute(k, new THREE.BufferAttribute(sub.arrays[a], attrs[a].size, geometry.attributes[k].normalized)));
    // a Uint16 index flagged normalized stays 16-bit on the GPU (src/core/geom.js, indexAttribute)
    g.setIndex(new THREE.BufferAttribute(sub.index, 1, sub.index instanceof Uint16Array));
    const b = sub.box;
    g.boundingBox = new THREE.Box3(new THREE.Vector3(b[0], b[1], b[2]), new THREE.Vector3(b[3], b[4], b[5]));
    g.boundingSphere = g.boundingBox.getBoundingSphere(new THREE.Sphere());
    out.push(make(g, mat));
    await breathe();
  }
  geometry.dispose();
  return out;
}

/** The copies of an instanced shape by cell of their centres: lists of copy numbers. */
function copiesByCell(proto, matrices) {
  const c = proto.boundingBox.getCenter(new THREE.Vector3()), v = new THREE.Vector3(), M = new THREE.Matrix4(), cells = new Map();
  for (let i = 0; i < matrices.length / 16; i++) {
    v.copy(c).applyMatrix4(M.fromArray(matrices, i * 16));
    const k = cellKey(v.x, v.z);
    (cells.get(k) || cells.set(k, []).get(k)).push(i);
  }
  return [...cells.values()];
}

/** The coarse version of a prototype (cells.js coarse) as a geometry of the same attribute formats. */
function lowGeometry(proto, low) {
  const g = new THREE.BufferGeometry(), N = proto.attributes.normal;
  g.setAttribute('position', new THREE.BufferAttribute(low.pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(low.nor, 3, N.normalized));
  g.setIndex(new THREE.BufferAttribute(low.index, 1, low.index instanceof Uint16Array));
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

/**
 * An instanced shape drawn by distance (src/engine/cells.js): 'thin' — the copies within THIN_FAR
 * of the eye, shadowed in the first cascade only (layer SMALL); 'fine' — the copies within LOD_NEAR
 * in full, the others coarse, and the copies within FINE_SHADOW, coarser still, drawn into every shadow
 * cascade (layer SHADOW: not seen by the camera) as the shadows of both. The copies are chosen as
 * the street life's are (life-instances.js), when the eye has moved a few metres.
 */
export class LodSet {
  constructor(kind, proto, low, lowShadow, mat, matrices, colors, make, cast) {
    this.kind = kind;
    const n = this.n = matrices.length / 16;
    this.all = matrices; this.colors = colors;
    const pos = this.pos = new Float32Array(n * 3), c = proto.boundingBox.getCenter(new THREE.Vector3()), v = new THREE.Vector3(), M = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { v.copy(c).applyMatrix4(M.fromArray(matrices, i * 16)); pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z; }
    const mk = (g) => {
      const m = make(g, mat, matrices, colors);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
      m.count = 0; m.visible = false; m.userData.lod = this; m.userData.sig = -1;
      return m;
    };
    this.full = mk(proto.clone());
    // until its first choice (a quarter second at most), every copy in full: the picture as before
    this.full.count = n; this.full.visible = true;
    this.meshes = [this.full];
    if (kind === 'thin') { this.full.layers.set(SMALL); this.full.castShadow = cast; return; }
    this.full.castShadow = false;
    this.far = mk(low); this.far.castShadow = false;
    this.shadow = mk(lowShadow); this.shadow.castShadow = cast; this.shadow.layers.set(SHADOW);
    this.meshes.push(this.far, this.shadow);
    this.last = null;
  }

  /** Choose the copies for an eye at x, y, z (the settlement's frame). */
  update(x, y, z, force = false) {
    if (!force && this.last && Math.hypot(x - this.last[0], y - this.last[1], z - this.last[2]) < 3) return;
    this.last = [x, y, z];
    const { n, pos } = this, thin = this.kind === 'thin';
    const near = this._near ??= new Uint32Array(n), far = this._far ??= new Uint32Array(n), sh = this._sh ??= new Uint32Array(n);
    let a = 0, b = 0, c = 0;
    const r1 = (thin ? THIN_FAR : LOD_NEAR) ** 2, r2 = FINE_SHADOW ** 2;
    for (let i = 0; i < n; i++) {
      const dx = pos[i * 3] - x, dy = pos[i * 3 + 1] - y, dz = pos[i * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < r1) near[a++] = i; else if (!thin) far[b++] = i;
      if (!thin && d2 < r2) sh[c++] = i;
    }
    this.fill(this.full, near, a);
    if (!thin) { this.fill(this.far, far, b); this.fill(this.shadow, sh, c); }
  }

  /** A mesh's copies: those listed (written only if the list changed). */
  fill(mesh, list, k) {
    let sig = k;
    for (let j = 0; j < k; j++) sig = (Math.imul(sig, 31) + list[j]) | 0;
    if (sig === mesh.userData.sig) return;
    mesh.userData.sig = sig;
    const M = mesh.instanceMatrix.array, C = mesh.instanceColor.array, A = this.all, B = this.colors;
    for (let j = 0; j < k; j++) {
      const i = list[j];
      M.set(A.subarray(i * 16, i * 16 + 16), j * 16);
      C[j * 3] = B[i * 3]; C[j * 3 + 1] = B[i * 3 + 1]; C[j * 3 + 2] = B[i * 3 + 2];
    }
    mesh.count = k;
    mesh.visible = k > 0;
    if (!k) return;
    mesh.instanceMatrix.clearUpdateRanges(); mesh.instanceMatrix.addUpdateRange(0, k * 16); mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.clearUpdateRanges(); mesh.instanceColor.addUpdateRange(0, k * 3); mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }
}

/** A merged mesh's member let go of: off the scene, its GPU data freed, its arrays emptied (the
 *  part's record still holds its geometry, src/engine/world.js). */
function letGo(o) {
  o.removeFromParent();
  o.geometry.dispose();
  o.dispose();
  const g = o.geometry;
  for (const a of [...Object.values(g.attributes), g.index]) if (a?.array?.length) a.array = new a.array.constructor(0);
  o.userData.released = true;
}

/** Indexed geometries of the same attributes as one (bounds from theirs); null if stale meanwhile. */
async function mergeGeometries(gs, breathe, stale) {
  let nv = 0, ni = 0;
  for (const g of gs) { nv += g.attributes.position.count; ni += g.index.count; }
  const names = Object.keys(gs[0].attributes);
  const attrs = {};
  for (const k of names) { const a = gs[0].attributes[k]; attrs[k] = { arr: new a.array.constructor(nv * a.itemSize), size: a.itemSize, normalized: a.normalized }; }
  const index = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  const box = new THREE.Box3();
  let v = 0, o = 0;
  for (const g of gs) {
    for (const k of names) attrs[k].arr.set(g.attributes[k].array, v * attrs[k].size);
    const I = g.index.array;
    if (v === 0) index.set(I, o); else for (let i = 0; i < I.length; i++) index[o + i] = I[i] + v;
    v += g.attributes.position.count; o += I.length;
    if (!g.boundingBox) g.computeBoundingBox();
    box.union(g.boundingBox);
    await breathe();
    if (stale()) return null;
  }
  const m = new THREE.BufferGeometry();
  for (const k of names) m.setAttribute(k, new THREE.BufferAttribute(attrs[k].arr, attrs[k].size, attrs[k].normalized));
  // a Uint16 index flagged normalized stays 16-bit on the GPU (src/core/geom.js, indexAttribute)
  m.setIndex(new THREE.BufferAttribute(index, 1, index instanceof Uint16Array));
  m.boundingBox = box;
  m.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
  return m;
}

/**
 * A town's tiles (src/settlements/lod.js), one material's parts of one version (near or far) merged:
 * the index ranges of the tiles shown (their groups visible, src/engine/world.js) gathered at the
 * front of the index, drawn as one mesh. The index is written again only when the tiles shown
 * change (a settlement's tiles hold ~0.2 M indices in all, measured with tools/draw-count.mjs).
 */
export class TileBatch {
  constructor(geometry, list, mat, make) {
    this.index = geometry.index.array;
    this.members = [];
    let o = 0;
    for (const { o: m, rec } of list) {
      const g = m.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      this.members.push({ rec, start: o, count: g.index.count, box: g.boundingBox.clone(), shown: false });
      o += g.index.count;
    }
    // (of even length: a 16-bit index is written to the GPU in whole 4-byte words)
    const index = new THREE.BufferAttribute(new this.index.constructor(this.index.length + (this.index.length & 1)), 1, geometry.index.normalized);
    index.setUsage(THREE.DynamicDrawUsage);
    const g = new THREE.BufferGeometry();
    for (const [k, a] of Object.entries(geometry.attributes)) g.setAttribute(k, a);
    g.setIndex(index);
    g.setDrawRange(0, 0);
    g.boundingBox = new THREE.Box3(); g.boundingSphere = new THREE.Sphere();
    this.mesh = make(g, mat);
    this.mesh.name = `merged:${mat}:tiles`;
    this.mesh.receiveShadow = true;
    this.mesh.visible = false;
    this.mesh.userData.batch = this;
    this.dirty = true;
  }

  /** Draw the tiles whose groups are shown (an index written only if that changed). */
  choose() {
    let changed = this.dirty;
    for (const m of this.members) { const v = m.rec.group.visible; if (v !== m.shown) { m.shown = v; changed = true; } }
    if (!changed) return;
    this.dirty = false;
    const g = this.mesh.geometry, dst = g.index.array, src = this.index;
    let n = 0;
    g.boundingBox.makeEmpty();
    for (const m of this.members) {
      if (!m.shown) continue;
      dst.set(src.subarray(m.start, m.start + m.count), n); n += m.count;
      g.boundingBox.union(m.box);
    }
    g.setDrawRange(0, n);
    this.mesh.visible = n > 0;
    if (!n) return;
    g.boundingBox.getBoundingSphere(g.boundingSphere);
    this.mesh.boundingSphere = null;
    g.index.clearUpdateRanges();
    g.index.addUpdateRange(0, dst instanceof Uint16Array ? n + (n & 1) : n);
    g.index.needsUpdate = true;
  }
}
