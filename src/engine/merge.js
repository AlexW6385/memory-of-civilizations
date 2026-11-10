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
import { SPLIT_TRIS, SPLIT_INST, LOD_NEAR, LOD_FAR, FINE_SHADOW, THIN_FAR, OPEN_FAR, cellKey, lodKind, coarseSet, trianglesByCell, subGeometry } from './cells.js';
import { SMALL, MID, NEAR_SHADOW, FAR_SHADOW } from './layers.js';
import { MATERIALS } from '../core/palette.js';
import { HITCH } from './hitch.js';

/** The fine pieces' copies drawn within this angle of the view's direction (the view's half
 *  diagonal, about 52°, and a margin for the turn between two choices), chosen again each VIEW_TURN. */
const COS_VIEW = Math.cos(THREE.MathUtils.degToRad(80)), COS_TURN = Math.cos(THREE.MathUtils.degToRad(10));

/** An instanced shape of at most this many triangles in all is baked into its material's merged part. */
const BAKE_TRIS = 6000;

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
  // (cloth in the wind: two shapes alike but hung differently are two)
  if (g.attributes.hang) mix(g.attributes.hang.array);
  return `${g.attributes.position.count}:${I.length}:${(h >>> 0).toString(36)}`;
}

/**
 * Merge the marked meshes of a settlement's parts (recs: { group }) into `into`. make(geometry, mat,
 * matrices, colors) makes a mesh as the world does (src/engine/world.js buildingMesh); stale() says
 * the settlement was let go of meanwhile. Returns the merged meshes, each with userData.recs (the
 * parts it holds).
 */
export async function mergeParts(recs, into, make, { castsShadow, stale = () => false, lods = [], precompile = null } = {}) {
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
  let baked = 0;
  // small instanced shapes (a few thousand triangles in all, untinted, not chosen by distance) baked
  // into their material's merged part: each was a draw call of its own (Suzhou's garden: a dozen
  // groups of Taihu stones, six of lattice, nine of lotus leaves...)
  for (const [key, G] of [...groups]) {
    if (G.kind !== 'inst') continue;
    const proto = G.list[0].o.geometry, tri = proto.index.count / 3;
    let n = 0;
    for (const { o } of G.list) n += o.count;
    if (!n || n * tri > BAKE_TRIS || G.list.some(({ o }) => o.userData.reach !== undefined)) continue;
    const white = G.list.every(({ o }) => { const c = o.instanceColor?.array; if (!c) return true; for (let i = 0; i < o.count * 3; i++) if (Math.abs(c[i] - 1) > 0.004) return false; return true; });
    if (!white) continue;
    const pk = `p|${G.mat}|${formatOf(proto)}`;
    let P = groups.get(pk);
    if (!P) groups.set(pk, (P = { kind: 'part', mat: G.mat, key: pk, list: [] }));
    const M = new THREE.Matrix4();
    for (const { o, rec } of G.list) {
      for (let i = 0; i < o.count; i++) {
        const g = proto.clone().applyMatrix4(M.fromArray(o.instanceMatrix.array, i * 16));
        // (a hanging cloth's hang grows with the copy's scale: src/core/geom.js placeHanging)
        if (g.attributes.hang) { const e = M.elements, k = Math.hypot(e[4], e[5], e[6]), H = g.attributes.hang.array; if (Math.abs(k - 1) > 1e-6) for (let j = 0; j < H.length; j++) H[j] *= k; }
        // (the copies beyond the mesh's first `big` are small for the shadows: no big triangles)
        P.list.push({ o: { geometry: g, userData: { shadowBig: o.userData.big !== undefined && i >= o.userData.big ? 0 : undefined }, baked: o }, rec });
        baked++;
      }
    }
    groups.delete(key);
  }
  const out = [];
  out.baked = baked;                     // (the copies baked into parts, for tests/cells.test.mjs)
  let t = performance.now();
  const breathe = async () => { if (performance.now() - t > SLICE) { HITCH.add('merge', performance.now() - t); await new Promise((r) => setTimeout(r, 0)); t = performance.now(); } };
  // a member left as it is (a shape or material of one plan only, not worth cutting or choosing)
  // the merged meshes' shaders compiled off the frame before they are swapped in (a coarse version
  // has other attributes than its prototype: a new pipeline, compiled in the frame that first drew it)
  const ready = async (meshes) => {
    if (!precompile) return;
    const t0 = performance.now();
    await precompile(meshes);
    t += performance.now() - t0;             // (the wait is not this slice's work)
  };
  // without workers the coarse versions are made here: when the page is idle, a shape at a time
  const idle = () => new Promise((r) => (globalThis.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 1000 }) : setTimeout(r, 0)));
  const keep = (G) => { for (const { o } of G.list) { const m = o.baked ?? o; if (m.userData.released || m.userData.kept) continue; delete m.userData.merge; m.userData.kept = true; releaseAfterUpload(m); } };
  for (const G of groups.values()) {
    if (stale()) return out;
    const recSet = new Set(G.list.map(({ rec }) => rec));
    if (G.kind === 'tile') {
      if (G.list.length < 2) { keep(G); continue; }
      const geometry = await mergeGeometries(G.list.map(({ o }) => o.geometry), breathe, stale);
      if (!geometry) return out;
      const B = new TileBatch(geometry, G.list, G.mat, make);
      await ready([B.mesh]);
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
      // which triangles are of pieces big for the shadows (src/core/geom.js MID_SIZE): each member's first shadowBig
      let big = null;
      if (G.list.some(({ o }) => o.userData.shadowBig !== undefined)) {
        big = new Uint8Array(tris).fill(1);
        let t = 0;
        for (const { o } of G.list) { const n = o.geometry.index.count / 3, b = o.userData.shadowBig ?? n; big.fill(0, t + b, t + n); t += n; }
      }
      const geometry = await mergeGeometries(G.list.map(({ o }) => o.geometry), breathe, stale);
      if (!geometry) return out;
      meshes = tris >= SPLIT_TRIS ? await cutIntoCells(geometry, G.mat, make, breathe, big) : [wholePart(geometry, G.mat, make, big)];
      meshes = farSiblings(meshes, G.mat, make, false);
      for (const m of meshes) { m.castShadow = castsShadow(G.mat); m.name = `merged:${G.mat}${m.userData.farOf ? ':far' : ''}`; }
    } else {
      let n = 0;
      for (const { o } of G.list) n += o.count;
      const proto = G.list[0].o.geometry;
      if (!proto.boundingBox) proto.computeBoundingBox();
      const tri = proto.index.count / 3, bb = proto.boundingBox;
      // (the shape judged by its first copy as its plan found it: src/core/geom.js `first`)
      const f0 = G.list[0].o.userData.first ?? 0, M0 = G.list[0].o.instanceMatrix.array.subarray(f0 * 16, f0 * 16 + 16);
      let lod = lodKind(tri, [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z], M0);
      // cloth in the wind has no coarse versions (they would have no hang): drawn as it is
      if (lod === 'fine' && proto.attributes.hang) lod = null;
      // pieces their plan places to be seen only near (a plant's spines: their reach)
      const reach = G.list.every(({ o }) => o.userData.reach !== undefined) ? Math.max(...G.list.map(({ o }) => o.userData.reach)) : null;
      if (reach !== null && lod !== 'thin') lod = 'near';
      let set = null;
      if (lod === 'fine') {
        // its coarse versions, made in the build worker (build-worker.js); made here only when the
        // plans were built in the page
        set = G.list.map(({ o }) => o.geometry.userData.coarse).find((c) => c !== undefined) ?? null;
        if (!set) {
          HITCH.add('merge', performance.now() - t);
          await idle();
          const P = proto.attributes.position.array, N = proto.attributes.normal.array, I = proto.index.array;
          const tC = performance.now();
          set = coarseSet(P, N, I, MATERIALS[G.mat]?.kind === 'metal');
          HITCH.add('coarse', performance.now() - tC);
          t = performance.now();
        }
        if (set.open) lod = 'open';
        else if (!set.low && !set.far) lod = null;
      }
      if (G.list.length < 2 && !lod && n * tri < SPLIT_INST) { keep(G); continue; }
      const matrices = new Float32Array(n * 16), colors = new Float32Array(n * 3);
      // the copies big for the shadows (src/core/geom.js MID_SIZE): each member's first `big`
      let big = null;
      if (!lod && G.list.some(({ o }) => o.userData.big !== undefined)) big = new Uint8Array(n).fill(1);
      let k = 0;
      for (const { o } of G.list) {
        matrices.set(o.instanceMatrix.array.subarray(0, o.count * 16), k * 16);
        colors.set(o.instanceColor.array.subarray(0, o.count * 3), k * 3);
        if (big && o.userData.big !== undefined) big.fill(0, k + o.userData.big, k + o.count);
        k += o.count;
      }
      // (a copy of the prototype: one still used by a mesh let go of (its render objects disposed)
      // took its buffers with it, and the GPU process crashed drawing the merged mesh)
      if (lod) {
        const made = new Map(), geo = (v) => v && (made.get(v) || made.set(v, lowGeometry(proto, v)).get(v));
        const L = new LodSet(lod, proto, { low: geo(set?.low), far: geo(set?.far), shadow: geo(set?.shadow) }, G.mat, matrices, colors, make, castsShadow(G.mat));
        L.reach = reach ?? 0;
        lods.push(L);
        meshes = L.meshes;
      } else {
        // the copies by cell (or all as one), the big ones first in each
        const lists = n * tri >= SPLIT_INST ? copiesByCell(proto, matrices) : [[...Array(n).keys()]];
        meshes = [];
        for (const idx of lists) {
          if (big) idx.sort((a, b) => big[b] - big[a] || a - b);
          const Mc = new Float32Array(idx.length * 16), Cc = new Float32Array(idx.length * 3);
          idx.forEach((i, j) => { Mc.set(matrices.subarray(i * 16, i * 16 + 16), j * 16); Cc.set(colors.subarray(i * 3, i * 3 + 3), j * 3); });
          const m = make(proto.clone(), G.mat, Mc, Cc);
          if (big) { let nb = 0; for (const i of idx) nb += big[i]; if (nb < idx.length) m.userData.big = nb; }
          meshes.push(m);
        }
        meshes = farSiblings(meshes, G.mat, make, true);
      }
      for (const m of meshes) {
        if (!m.userData.lod) m.castShadow = castsShadow(G.mat);
        m.name = `merged:${G.mat}:inst${m.userData.farOf ? ':far' : ''}`;
      }
    }
    await ready(meshes);
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
    for (const { o } of G.list) letGo(o.baked ?? o);
    await breathe();
  }
  return out;
}

/** A merged geometry cut into cells of the ground (src/engine/cells.js): a mesh each. */
async function cutIntoCells(geometry, mat, make, breathe, big = null) {
  const names = Object.keys(geometry.attributes), I = geometry.index.array;
  const attrs = names.map((k) => ({ array: geometry.attributes[k].array, size: geometry.attributes[k].itemSize }));
  const byCell = trianglesByCell(geometry.attributes.position.array, I);
  if (byCell.size < 2) return [wholePart(geometry, mat, make, big)];
  const out = [];
  for (const e of byCell.values()) {
    // (the triangles of big pieces first: farSiblings)
    const nb = big ? bigFirst(e.tri, big) : e.tri.length;
    const sub = subGeometry(attrs, I, e.tri, names.indexOf('position'));
    const g = new THREE.BufferGeometry();
    names.forEach((k, a) => g.setAttribute(k, new THREE.BufferAttribute(sub.arrays[a], attrs[a].size, geometry.attributes[k].normalized)));
    // a Uint16 index flagged normalized stays 16-bit on the GPU (src/core/geom.js, indexAttribute)
    g.setIndex(new THREE.BufferAttribute(sub.index, 1, sub.index instanceof Uint16Array));
    const b = sub.box;
    g.boundingBox = new THREE.Box3(new THREE.Vector3(b[0], b[1], b[2]), new THREE.Vector3(b[3], b[4], b[5]));
    g.boundingSphere = g.boundingBox.getBoundingSphere(new THREE.Sphere());
    const m = make(g, mat);
    if (nb < e.tri.length) m.userData.big = nb;
    out.push(m);
    await breathe();
  }
  geometry.dispose();
  return out;
}

/** A list of triangle numbers, those of big pieces (big[t]) first, in place; returns how many. */
function bigFirst(tri, big) {
  const a = [], b = [];
  for (let i = 0; i < tri.length; i++) (big[tri[i]] ? a : b).push(tri[i]);
  tri.set(a, 0); tri.set(b, a.length);
  return a.length;
}

/** A merged part as one mesh, its index reordered so that the triangles of big pieces come first. */
function wholePart(geometry, mat, make, big) {
  if (!big) return make(geometry, mat);
  const I = geometry.index.array, nt = I.length / 3, tri = new Uint32Array(nt);
  for (let t = 0; t < nt; t++) tri[t] = t;
  const nb = bigFirst(tri, big);
  if (nb < nt) {
    const J = new I.constructor(I.length);
    for (let i = 0; i < nt; i++) { const t = tri[i] * 3; J[i * 3] = I[t]; J[i * 3 + 1] = I[t + 1]; J[i * 3 + 2] = I[t + 2]; }
    I.set(J);
  }
  const m = make(geometry, mat);
  if (nb < nt) m.userData.big = nb;
  return m;
}

/**
 * Shadow casters by size (src/engine/layers.js): a merged mesh holding middle-sized pieces as well
 * as big ones (userData.big: its first triangles, or copies, that are big) is put on MID — seen,
 * and casting into the first two cascades — and given a sibling the camera does not see that casts
 * the big ones alone into the third (FAR_SHADOW): the same vertices and index (or copies) drawn to
 * a shorter range, so it costs no memory. They are made, shown and let go of together.
 */
function farSiblings(meshes, mat, make, copies) {
  const out = [];
  for (const m of meshes) {
    out.push(m);
    const nb = m.userData.big;
    if (nb === undefined) continue;
    m.layers.set(MID);
    if (!nb) continue;
    let s;
    if (copies) {
      s = make(m.geometry, mat, m.instanceMatrix.array.subarray(0, nb * 16), m.instanceColor.array.subarray(0, nb * 3));
      s.instanceMatrix = m.instanceMatrix; s.instanceColor = m.instanceColor; s.count = nb;
    } else {
      const src = m.geometry, g = new THREE.BufferGeometry();
      for (const [k, a] of Object.entries(src.attributes)) g.setAttribute(k, a);
      g.setIndex(src.index);
      g.setDrawRange(0, nb * 3);
      // its bounds those of the big triangles
      const P = src.attributes.position.array, I = src.index.array, b = new THREE.Box3(), v = new THREE.Vector3();
      for (let i = 0; i < nb * 3; i++) b.expandByPoint(v.fromArray(P, I[i] * 3));
      g.boundingBox = b; g.boundingSphere = b.getBoundingSphere(new THREE.Sphere());
      s = make(g, mat);
    }
    s.layers.set(FAR_SHADOW);
    s.userData.farOf = m;
    out.push(s);
  }
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
 * The fine detail (pieces under 0.4 m, drawn only near: src/engine/world.js DETAIL_REACH) merged
 * across the plans, per material in cells of `cell` metres: each plan's detail was a draw call per
 * material — a street of shops, its goods, two dozen draws a plan within reach. The merged pieces
 * take the originals' place in their first plan's detail list (shown and hidden by distance as
 * they were). Pieces marked userData.detailMerge (world.js addPart) keep their arrays until then.
 */
export async function mergeDetail(recs, make, { stale = () => false, precompile = null, cell = 32 } = {}) {
  const groups = new Map();
  const add = (key, mat, e) => { let G = groups.get(key); if (!G) groups.set(key, (G = { mat, list: [] })); G.list.push(e); };
  const M = new THREE.Matrix4(), P = new THREE.Vector3();
  for (const rec of recs) for (const o of rec.detail || []) {
    if (!o.userData.detailMerge || o.userData.released) continue;
    const g = o.geometry;
    if (o.count === 1) {
      const b = g.boundingSphere || (g.computeBoundingSphere(), g.boundingSphere);
      add(`${o.material.name}|${formatOf(g)}|${Math.floor(b.center.x / cell)},${Math.floor(b.center.z / cell)}`, o.material.name, { o, rec, geometry: g });
    } else {
      // a small instanced shape, untinted: its copies baked, each into its own cell's piece
      for (let i = 0; i < o.count; i++) {
        M.fromArray(o.instanceMatrix.array, i * 16); P.setFromMatrixPosition(M);
        add(`${o.material.name}|${formatOf(g)}|${Math.floor(P.x / cell)},${Math.floor(P.z / cell)}`, o.material.name, { o, rec, geometry: g.clone().applyMatrix4(M), copy: true });
      }
    }
  }
  let t = performance.now();
  const breathe = async () => { if (performance.now() - t > SLICE) { await new Promise((r) => setTimeout(r, 0)); t = performance.now(); } };
  let n = 0;
  for (const G of groups.values()) {
    if (G.list.length < 2 && !G.list[0].copy) { for (const { o } of G.list) { delete o.userData.detailMerge; releaseAfterUpload(o); } continue; }
    const g = await mergeGeometries(G.list.map((x) => x.geometry), breathe, stale);
    if (!g || stale()) return n;
    const first = G.list[0].o, m = make(g, G.mat);
    m.userData.detail = true; m.layers.mask = first.layers.mask;
    m.visible = false; m.castShadow = false;
    const host = G.list[0].rec;
    host.group.add(m);
    if (precompile) await precompile([m]);
    if (stale()) return n;
    host.detail.push(m);
    for (const { o, rec } of G.list) { const k = rec.detail.indexOf(o); if (k >= 0) rec.detail.splice(k, 1); letGo(o); }
    for (const x of G.list) if (x.copy) x.geometry.dispose();
    releaseAfterUpload(m);
    n++;
    await breathe();
  }
  return n;
}

/**
 * An instanced shape drawn by distance (src/engine/cells.js): 'thin' (rods and bars), 'open'
 * (metal openwork) and 'near' (pieces their plan gives a short reach) — the copies within
 * THIN_FAR / OPEN_FAR / their reach of the eye, shadowed in the first
 * cascade only (layer SMALL); 'fine' — the copies within LOD_NEAR in full, to LOD_FAR coarse (v.low),
 * beyond coarser still (v.far; where a version is missing the one before it goes on), and the
 * copies within FINE_SHADOW drawn as v.shadow into the first two shadow cascades (layer
 * NEAR_SHADOW: not seen by the camera) as the shadows of all. The copies are chosen as the street
 * life's are (life-instances.js), when the eye has moved a few metres.
 */
export class LodSet {
  constructor(kind, proto, v, mat, matrices, colors, make, cast) {
    this.kind = kind;
    const n = this.n = matrices.length / 16;
    this.all = matrices; this.colors = colors;
    const pos = this.pos = new Float32Array(n * 3), c = proto.boundingBox.getCenter(new THREE.Vector3()), w = new THREE.Vector3(), M = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { w.copy(c).applyMatrix4(M.fromArray(matrices, i * 16)); pos[i * 3] = w.x; pos[i * 3 + 1] = w.y; pos[i * 3 + 2] = w.z; }
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
    if (kind !== 'fine') { this.full.layers.set(SMALL); this.full.castShadow = cast; return; }
    this.full.castShadow = false;
    this.mid = v.low ? mk(v.low) : null;
    this.far = v.far ? mk(v.far) : null;
    for (const m of [this.mid, this.far]) if (m) { m.castShadow = false; this.meshes.push(m); }
    this.shadow = mk(v.shadow); this.shadow.castShadow = cast; this.shadow.layers.set(NEAR_SHADOW);
    this.meshes.push(this.shadow);
    this.last = null;
  }

  /**
   * Choose the copies for an eye at x, y, z (the settlement's frame); `dir`, the view's direction
   * in that frame: the fine pieces' copies well behind the view are left out of what is drawn (not
   * of their shadows, drawn apart). A merged set of copies spans the whole settlement, so its bounds
   * were in view whichever way one looked, and the GPU took every copy's vertices every frame —
   * looking straight up at Suzhou, 2.6 M triangles. Chosen again as the view turns by VIEW_TURN.
   */
  update(x, y, z, force = false, dir = null) {
    const turned = dir && (!this.lastDir || dir[0] * this.lastDir[0] + dir[1] * this.lastDir[1] + dir[2] * this.lastDir[2] < COS_TURN);
    if (!force && !turned && this.last && Math.hypot(x - this.last[0], y - this.last[1], z - this.last[2]) < 3) return;
    this.last = [x, y, z];
    const { n, pos, kind, mid, far } = this, fine = kind === 'fine';
    const view = fine && dir;
    if (dir) this.lastDir = [dir[0], dir[1], dir[2]];
    const R = this.radius ??= (this.full.geometry.boundingSphere || (this.full.geometry.computeBoundingSphere(), this.full.geometry.boundingSphere)).radius + 1;
    const A = this._a ??= new Uint32Array(n), B = fine ? this._b ??= new Uint32Array(n) : null, C = fine ? this._c ??= new Uint32Array(n) : null, S = fine ? this._s ??= new Uint32Array(n) : null;
    let a = 0, b = 0, c = 0, sh = 0;
    // full within r1 (to LOD_FAR where there is no coarse version), coarse to r2 (all the rest
    // where there is no coarser one), coarser beyond
    const r1 = (kind === 'thin' ? THIN_FAR : kind === 'open' ? OPEN_FAR : kind === 'near' ? this.reach : mid ? LOD_NEAR : LOD_FAR) ** 2, r2 = far ? LOD_FAR ** 2 : Infinity, rs = FINE_SHADOW ** 2;
    for (let i = 0; i < n; i++) {
      const dx = pos[i * 3] - x, dy = pos[i * 3 + 1] - y, dz = pos[i * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz;
      if (view && d2 > R * R && dx * dir[0] + dy * dir[1] + dz * dir[2] < Math.sqrt(d2) * COS_VIEW - R) { if (d2 < rs) S[sh++] = i; continue; }
      if (d2 < r1) A[a++] = i;
      else if (!fine) continue;
      else if (mid && d2 < r2) B[b++] = i;
      else C[c++] = i;
      if (fine && d2 < rs) S[sh++] = i;
    }
    this.fill(this.full, A, a);
    if (!fine) return;
    if (mid) this.fill(mid, B, b);
    if (far) this.fill(far, C, c);
    this.fill(this.shadow, S, sh);
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
  if (o.userData.released) return;
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
