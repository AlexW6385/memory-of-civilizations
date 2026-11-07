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
// The merge is time-sliced (DESIGN §8: ≤ 4 ms a frame): the merged arrays are filled a member at a
// time, and each merged mesh replaces its members in one step, so nothing is ever drawn twice or not
// at all.

import * as THREE from 'three/webgpu';
import { releaseAfterUpload } from './release.js';

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
export async function mergeParts(recs, into, make, { castsShadow, stale = () => false } = {}) {
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
  for (const G of groups.values()) {
    if (stale()) return out;
    if (G.list.length < 2) { for (const { o } of G.list) { delete o.userData.merge; releaseAfterUpload(o); } continue; }
    if (G.kind === 'tile') {
      const geometry = await mergeGeometries(G.list.map(({ o }) => o.geometry), breathe, stale);
      if (!geometry) return out;
      const B = new TileBatch(geometry, G.list, G.mat, make);
      if (stale()) { B.mesh.geometry.dispose(); B.mesh.dispose(); return out; }
      B.mesh.castShadow = castsShadow(G.mat);
      B.mesh.userData.cast = B.mesh.castShadow;
      B.mesh.userData.recs = new Set(G.list.map(({ rec }) => rec));
      B.choose();
      into.add(B.mesh);
      for (const { o } of G.list) letGo(o);
      releaseAfterUpload(B.mesh, { keepIndex: true });
      out.push(B.mesh);
      await breathe();
      continue;
    }
    let mesh;
    if (G.kind === 'part') {
      const geometry = await mergeGeometries(G.list.map(({ o }) => o.geometry), breathe, stale);
      if (!geometry) return out;
      mesh = make(geometry, G.mat);
    } else {
      let n = 0;
      for (const { o } of G.list) n += o.count;
      const matrices = new Float32Array(n * 16), colors = new Float32Array(n * 3);
      let k = 0;
      for (const { o } of G.list) {
        matrices.set(o.instanceMatrix.array.subarray(0, o.count * 16), k * 16);
        colors.set(o.instanceColor.array.subarray(0, o.count * 3), k * 3);
        k += o.count;
      }
      // a copy of the prototype: one still used by a mesh let go of (its render objects disposed)
      // took its buffers with it, and the GPU process crashed drawing the merged mesh
      mesh = make(G.list[0].o.geometry.clone(), G.mat, matrices, colors);
    }
    if (stale()) { mesh.geometry.dispose(); mesh.dispose(); return out; }
    mesh.castShadow = castsShadow(G.mat);
    mesh.receiveShadow = true;
    mesh.name = `merged:${G.mat}${G.kind === 'inst' ? ':inst' : ''}`;
    mesh.userData.recs = new Set(G.list.map(({ rec }) => rec));
    mesh.userData.cast = mesh.castShadow;
    releaseAfterUpload(mesh);
    // the swap, in one step: the merged mesh in, its members out
    into.add(mesh);
    for (const { o } of G.list) letGo(o);
    out.push(mesh);
    await breathe();
  }
  return out;
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
