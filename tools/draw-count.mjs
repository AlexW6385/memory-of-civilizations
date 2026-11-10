#!/usr/bin/env node
// Draw calls and triangles of a frame, counted in Node (DESIGN §8: ≤ 800 draws, ≤ 3 M visible
// triangles): a settlement built as the viewer builds it, its meshes made as the viewer makes them
// (src/engine/world.js, merge.js, life-instances.js) and shown and hidden by the same rules (tiles'
// near / far, fine detail within reach, street life's copies by distance, merged meshes cut into
// cells, thin and fine shapes chosen by distance: src/engine/cells.js), then culled against the
// camera's frustum and the three shadow cascades' boxes as three.js culls them. Headless Chromium
// draws WebGPU in software and its renderer.info is of a trimmed scene (tools/showroom.mjs --site);
// this counts the whole settlement exactly (the cascades' boxes are approximated as CSMShadowNode
// fits them). Ground, plants, sky and the post-processing passes are not counted (about 60–120 more
// draws). "A frame" counts the scene pass, the first cascade, half the second and a third of the
// third (as they are drawn, src/engine/renderer.js); "worst frame" all three cascades.
//
// usage: node tools/draw-count.mjs [<id>...] [--at x,y,z,yaw,pitch] [--views] [--top [n]]
//        [--sun azimuthDeg,elevationDeg] [--before] [--nomerge] [--cell m] [--split tris] [--json out.json]
//   no ids: every settlement; default pose: its arrival (src/planet/arrivals.js)
//   --views    also the interiors and heavy places of VIEWS (each the worst of four ways)
//   --top      the largest meshes' triangles in the view and in each cascade
//   --before   as before cells and distance detail (merged meshes whole, every copy in full)
//   --nomerge  plans' meshes kept apart, as before src/engine/merge.js
//   --cell, --split   try other cell sizes and thresholds (src/engine/cells.js CELL, SPLIT_TRIS)

import * as THREE from '../src/vendor/three/build/three.core.js';
import { writeFile } from 'node:fs/promises';
import { MODULES } from '../src/settlements/grounds.js';
import { buildPlan, toWorld } from '../src/core/build.js';
import { ARRIVALS } from '../src/planet/arrivals.js';
import { MATERIALS } from '../src/core/palette.js';
import { CELL, SPLIT_TRIS, SPLIT_INST, LOD_NEAR, LOD_FAR, FINE_SHADOW, THIN_FAR, OPEN_FAR, LIFE_FULL, cellKey, lodKind, coarse, coarseSet } from '../src/engine/cells.js';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const ids = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));

// the viewer's rules (src/engine/world.js, life-instances.js)
const DETAIL_REACH = 160, DETAIL_SHADOW = 50, LIFE_SHADOW = 120;
const NO_SHADOW = new Set(['water', 'glass_outer', 'glass_topaz', 'opening', 'daylight', 'daylight_plain']);
const NO_SHADOW_KINDS = new Set(['glow', 'water', 'foam']);
const castsShadow = (mat) => !NO_SHADOW.has(mat) && !NO_SHADOW_KINDS.has(MATERIALS[mat]?.kind);
const { LIFE_MIN, lifeInstanced } = await import('../src/engine/life-instances.js').catch(() => ({ LIFE_MIN: 13, lifeInstanced: (n) => n >= 13 }));

/** A frame's draws: the meshes of a settlement (with the viewer's options), and the counts at a pose. */
export async function drawCount(id, { at = null, sun = [135, 40], build = null, merge = true, cells = true } = {}) {
  let meshes = build ?? await sceneOf(id);
  const plans = meshes.plans;
  if (merge) meshes = mergeScene(meshes, { cells });
  const pose = at ?? ARRIVALS[id] ?? [0, 0, 0, 0, 0.1];
  const [x, y0, z, yaw, pitch] = pose;
  const eye = new THREE.Vector3(x, (y0 ?? 0) + 1.6, z);
  const cam = new THREE.PerspectiveCamera(68, 16 / 9, 0.08, 4000);
  cam.position.copy(eye); cam.rotation.order = 'YXZ'; cam.rotation.set(pitch, yaw, 0);
  cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
  let vis = visibleSet(meshes, eye);
  // in a sealed room, what lies wholly away from the building's sealed rooms is not drawn (world.js seal)
  const box = sealedBox(plans, x, y0 ?? 0, z);
  if (box) vis = vis.filter((m) => { const c = m.sphere.center; return Math.hypot(Math.max(box[0] - c.x, 0, c.x - box[2]), Math.max(box[1] - c.z, 0, c.z - box[3])) <= m.sphere.radius; });
  const S = new THREE.Sphere();
  const inFr = (f, m) => f.intersectsSphere(S.copy(m.sphere));
  const main = { all: 0 };
  let tris = 0;
  const top = [];
  for (const m of vis) if (!m.shadowOnly && inFr(fr, m)) { main.all++; tris += m.tris || 0; main[m.kind] = (main[m.kind] || 0) + 1; top.push({ kind: m.kind, mat: m.mat, plan: m.plan?.id ?? m.batch?.[0]?.plan?.id, tris: Math.round(m.tris || 0), r: Math.round(m.sphere.radius), lod: m.lod, tri: m.tri }); }
  top.sort((a, b) => b.tris - a.tris);
  // the cascades (CSMShadowNode 'practical', maxFar 320, lightMargin 200): each an orthographic box
  // round the sphere of its slice of the view, reaching 200 m toward the sun
  const n = 3, near = cam.near, far = 320, splits = [near];
  const lam = +opt('lambda', 0.5), margin = +opt('margin', 200);
  for (let i = 1; i < n; i++) splits.push(lam * (near * (far / near) ** (i / n)) + (1 - lam) * (near + (far - near) * i / n));
  splits.push(far);
  const [az, el] = sun.map((v) => (v * Math.PI) / 180);
  const sd = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
  const shadow = { all: 0, perFrame: 0, cascades: [] };
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  const tanY = Math.tan((34 * Math.PI) / 180), tanX = tanY * 16 / 9;
  for (let c = 0; c < n; c++) {
    const a = splits[c], b = splits[c + 1];
    // the slice's bounding sphere (as three's CSM does: centred on the slice's axis)
    const rb = b * Math.hypot(1, tanX, tanY), mid = (a + b) / 2;
    const center = eye.clone().addScaledVector(fwd, mid);
    const radius = Math.hypot((b - a) / 2, rb * Math.sin(Math.atan(Math.hypot(tanX, tanY))));
    const lc = new THREE.OrthographicCamera(-radius, radius, radius, -radius, 0, 2 * radius + margin);
    lc.position.copy(center).addScaledVector(sd, radius + margin); lc.lookAt(center); lc.updateMatrixWorld(); lc.updateProjectionMatrix();
    const lf = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(lc.projectionMatrix, lc.matrixWorldInverse));
    let k = 0, kt = 0;
    const kinds = {};
    const ctop = [];
    // casters by size (src/engine/layers.js): small ones in the first cascade, middle-sized and the
    // fine pieces' shadow copies in the first two, the third only the big (a mesh's bigTris)
    for (const m of vis) {
      if (!m.cast || (c > 0 && m.small) || (c > 1 && (m.near || m.bigTris === 0)) || !inFr(lf, m)) continue;
      const mt = c > 1 && m.bigTris !== undefined ? m.bigTris : m.tris || 0;
      k++; kt += mt; kinds[m.kind] = (kinds[m.kind] || 0) + 1; ctop.push({ kind: m.kind, mat: m.mat, plan: m.plan?.id ?? m.batch?.[0]?.plan?.id, tris: Math.round(mt), r: Math.round(m.sphere.radius), lod: m.lod, tri: m.tri });
    }
    (shadow.top ??= []).push(ctop.sort((a, b) => b.tris - a.tris));
    (shadow.kinds ??= []).push(kinds);
    shadow.tris = (shadow.tris || 0) + kt / (c + 1);
    (shadow.ctris ??= []).push(Math.round(kt));
    shadow.cascades.push(k); shadow.all += k; shadow.perFrame += k / (c + 1);
  }
  shadow.perFrame = Math.round(shadow.perFrame);
  const objects = meshes.length;
  return { id, pose, objects, visible: vis.length, main, shadow, frame: main.all + shadow.perFrame, tris: { main: Math.round(tris), shadow: Math.round(shadow.tris), cascades: shadow.ctris, frame: Math.round(tris + shadow.tris), worst: Math.round(tris + shadow.ctris.reduce((a, b) => a + b, 0)) }, top };
}

/** The sealed box [x0, z0, x1, z1] round the sealed rooms of the building whose sealed room holds the feet (world.js seal), or null. */
function sealedBox(plans, x, y, z) {
  for (const P of plans ?? []) {
    const rooms = P.rooms?.filter((r) => r.sealed);
    if (!rooms?.length) continue;
    const rect = (r, m) => { const a = toWorld(P, r.rect[0], r.rect[1]), b = toWorld(P, r.rect[2], r.rect[3]); return [Math.min(a[0], b[0]) - m, Math.min(a[2], b[2]) - m, Math.max(a[0], b[0]) + m, Math.max(a[2], b[2]) + m]; };
    if (!rooms.some((r) => { const q = rect(r, 0.6); return x >= q[0] && x <= q[2] && z >= q[1] && z <= q[3] && Math.abs(y - (r.y + (P.base || 0))) < 3; })) continue;
    const box = [Infinity, Infinity, -Infinity, -Infinity];
    for (const r of rooms) { const q = rect(r, r.sealed === true ? 40 : r.sealed); box[0] = Math.min(box[0], q[0]); box[1] = Math.min(box[1], q[1]); box[2] = Math.max(box[2], q[2]); box[3] = Math.max(box[3], q[3]); }
    return box;
  }
  return null;
}

/** The meshes shown at eye (with their shadow flags), by the viewer's rules. */
function visibleSet(meshes, eye) {
  const out = [];
  for (const m of meshes) {
    if (m.n) continue;
    if (m.batch) {
      // a batch of tiles: one mesh of the tiles shown, its bounds theirs
      let s = null, t = 0;
      for (const p of m.batch) {
        const P = p.plan, d = Math.hypot(eye.x - P.center[0], eye.z - P.center[1], Math.max(0, eye.y - 1.6) * 0.7);
        if (P.near ? d >= P.near : d < P.far) continue;
        s = s ? s.union(p.sphere) : p.sphere.clone(); t += p.tris;
      }
      if (s) out.push({ kind: m.kind, mat: m.mat, sphere: s, tris: t, cast: m.cast });
      continue;
    }
    const P = m.plan;
    if (P.near || P.far) {
      const d = Math.hypot(eye.x - P.center[0], eye.z - P.center[1], Math.max(0, eye.y - 1.6) * 0.7);
      if (P.near ? d >= P.near : d < P.far) continue;
      if (P.style === 'life') { out.push({ ...m, cast: m.cast && d < LIFE_SHADOW }); continue; }
    }
    if (m.lod && m.centers) {
      // thin and fine shapes (src/engine/cells.js, merge.js LodSet): the copies by distance
      const C = m.centers, sets = { near: [], mid: [], far: [], shadow: [] };
      const open = m.lod === 'thin' || m.lod === 'open' || m.lod === 'near', r1 = m.lod === 'thin' ? THIN_FAR : m.lod === 'open' ? OPEN_FAR : m.lod === 'near' ? m.reach : m.coarseTri ? LOD_NEAR : LOD_FAR, r2 = m.farTri ? LOD_FAR : Infinity;
      for (let i = 0; i < C.length; i += 3) {
        const d = Math.hypot(C[i] - eye.x, C[i + 1] - eye.y, C[i + 2] - eye.z), p = [C[i], C[i + 1], C[i + 2]];
        if (d < r1) sets.near.push(p);
        else if (open) continue;
        else if (m.coarseTri && d < r2) sets.mid.push(p);
        else sets.far.push(p);
        if (!open && d < FINE_SHADOW) sets.shadow.push(p);
      }
      const sph = (pts) => { const s = new THREE.Sphere().setFromPoints(pts.map((p) => new THREE.Vector3(...p))); s.radius += m.r; return s; };
      if (open) { if (sets.near.length) out.push({ ...m, tris: sets.near.length * m.tri, sphere: sph(sets.near), small: true, bigTris: undefined }); continue; }
      if (sets.near.length) out.push({ ...m, tris: sets.near.length * m.tri, sphere: sph(sets.near), cast: false });
      if (sets.mid.length) out.push({ ...m, tris: sets.mid.length * m.coarseTri, sphere: sph(sets.mid), cast: false });
      if (sets.far.length) out.push({ ...m, tris: sets.far.length * (m.farTri || m.coarseTri), sphere: sph(sets.far), cast: false });
      if (sets.shadow.length && m.cast) out.push({ ...m, tris: sets.shadow.length * m.shadowTri, sphere: sph(sets.shadow), shadowOnly: true, near: true, bigTris: undefined });
      continue;
    }
    if (m.detail) {
      const d = eye.distanceTo(m.sphere.center) - m.sphere.radius;
      if (d >= DETAIL_REACH) continue;
      out.push({ ...m, cast: m.cast && d < DETAIL_SHADOW });
      continue;
    }
    out.push(m);
  }
  // street life (instanced shapes and the rare ones by material): one mesh each, of the copies within reach
  for (const m of meshes) {
    if (!m.n) continue;
    // (the copies beyond LIFE_FULL coarse, where the shape has a coarse version: life-instances.js)
    const pts = [[], []];
    for (let i = 0; i < m.n; i++) {
      const dx = m.pos[i * 3] - eye.x, dy = (m.pos[i * 3 + 1] - eye.y) * 0.7, dz = m.pos[i * 3 + 2] - eye.z, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > m.reach[i] ** 2) continue;
      pts[m.lowTri && d2 > LIFE_FULL ** 2 ? 1 : 0].push(new THREE.Vector3(m.pos[i * 3], m.pos[i * 3 + 1], m.pos[i * 3 + 2]));
    }
    pts.forEach((p, w) => {
      if (!p.length) return;
      const s = new THREE.Sphere().setFromPoints(p); s.radius += m.r;
      out.push({ kind: m.kind, tris: (w ? m.lowTri : m.tri || 0) * p.length, mat: m.mat, sphere: s, cast: m.cast, small: true });
    });
  }
  return out;
}

/**
 * The viewer's merge (src/engine/merge.js): the meshes of plans always shown (no near / far, not
 * street life), fine detail apart, merged settlement-wide per material and per repeated shape.
 */
export function mergeScene(ms, { cells = true } = {}) {
  const out = [], groups = new Map(), far = new Map();
  for (const m of ms) {
    const P = m.plan;
    // the town's tiles: batched per material and version, the tiles shown chosen (merge.js TileBatch)
    if (P && (m.kind === 'tileFar' || m.kind === 'tileNear')) { const k = m.kind + m.mat; (far.get(k) || far.set(k, []).get(k)).push(m); continue; }
    if (!P || P.near || P.far || P.style === 'life' || (m.kind !== 'landmark' && m.kind !== 'instanced')) { out.push(!cells && m.lowTri ? { ...m, lowTri: 0 } : m); continue; }
    const k = `${m.kind}|${m.mat}|${m.key ?? ''}`;
    let g = groups.get(k);
    if (!g) groups.set(k, (g = { ...m, sphere: m.sphere.clone(), cells: new Map(), n: 0, plans: [], centerList: [], bigTris: m.bigTris ?? m.tris }));
    else { g.sphere.union(m.sphere); g.tris += m.tris; g.bigTris += m.bigTris ?? m.tris; g.r = Math.max(g.r, m.r); }
    if (m.centers) g.centerList.push(m.centers);
    g.n++; g.plans.push(P.id);
    for (const [ck, e] of m.cells ?? []) {
      const c = g.cells.get(ck);
      if (!c) g.cells.set(ck, { tris: e.tris, big: e.big, n: e.n ?? 0, box: e.box.slice() });
      else { c.tris += e.tris; c.big += e.big; c.n += e.n ?? 0; grow(c.box, e.box); }
    }
  }
  for (const list of far.values()) {
    if (list.length < 2) out.push(...list); else out.push({ kind: list[0].kind, batch: list, mat: list[0].mat, cast: list[0].cast });
  }
  for (const g of groups.values()) {
    const { cells: C, n, plans, centerList, centers, ...base } = g;
    // (a single plan's mesh is kept as it is, on layer 0: merge.js keep)
    if (g.n < 2 && g.tris < (g.kind === 'instanced' ? SPLITI : SPLIT)) base.bigTris = undefined;
    else if (base.bigTris >= base.tris) base.bigTris = undefined;
    if (!cells || !C.size) { out.push(base); continue; }
    if (g.lod) {
      // thin and fine shapes: their copies chosen by distance (merge.js LodSet)
      const all = new Float32Array(centerList.reduce((s, a) => s + a.length, 0));
      let o = 0;
      for (const a of centerList) { all.set(a, o); o += a.length; }
      out.push({ ...base, centers: all });
      continue;
    }
    const all = [...C.values()];
    if (g.tris < (g.kind === 'instanced' ? SPLITI : SPLIT)) { out.push(base); continue; }
    for (const c of all) out.push({ ...base, tris: c.tris, bigTris: c.big < c.tris ? c.big : undefined, sphere: sphereOfBox(c.box), box: c.box });
  }
  return out;
}

/** A prototype's identity (its key and its vertices, rounded). */
function protoKey(p) {
  const A = p.geometry.attributes.position.array;
  let h = 0;
  for (let i = 0; i < A.length; i++) h = (h * 31 + Math.round(A[i] * 1e4)) | 0;
  return `${p.key ?? ''}|${A.length}|${p.geometry.index?.count}|${h}`;
}

/** A box grown by another [x0, y0, z0, x1, y1, z1]. */
const grow = (a, b) => { for (let c = 0; c < 3; c++) { a[c] = Math.min(a[c], b[c]); a[c + 3] = Math.max(a[c + 3], b[c + 3]); } return a; };
const sphereOfBox = (b) => new THREE.Sphere(new THREE.Vector3((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2), Math.hypot(b[3] - b[0], b[4] - b[1], b[5] - b[2]) / 2);

/** A merged part's triangles by cell (src/engine/cells.js): key → { tris, box }. */
function partCells(g, shadowBig) {
  const P = g.attributes.position.array, I = g.index.array, out = new Map(), nb = (shadowBig ?? Infinity) * 3;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const k = cellKey((P[a] + P[b] + P[c]) / 3, (P[a + 2] + P[b + 2] + P[c + 2]) / 3, SIZE);
    let e = out.get(k);
    if (!e) out.set(k, (e = { tris: 0, big: 0, box: [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity] }));
    e.tris++; if (t < nb) e.big++;
    for (const v of [a, b, c]) for (let q = 0; q < 3; q++) { if (P[v + q] < e.box[q]) e.box[q] = P[v + q]; if (P[v + q] > e.box[q + 3]) e.box[q + 3] = P[v + q]; }
  }
  return out;
}

/**
 * An instanced shape's copies (merge.js): by cell, or (thin and fine shapes, chosen by distance)
 * their centres: { cells: key → { tris, n, box }, lod, centers, r, tri, coarseTri }.
 */
function instCells(p) {
  const g = p.geometry;
  if (!g.boundingBox) g.computeBoundingBox();
  const bb = g.boundingBox, tri = g.index.count / 3, M = p.matrices, T = new THREE.Matrix4(), B = new THREE.Box3();
  const ext = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z];
  const f0 = p.first ?? 0;
  let lod = lodKind(tri, ext, M.subarray(f0 * 16, f0 * 16 + 16));
  // (pieces placed to be seen only near: world.js NEAR_REACH, merge.js)
  let reach = 0;
  if (p.reach?.length) { for (const v of p.reach) reach = Math.max(reach, v); if (reach < 200 && lod !== 'thin') lod = 'near'; }
  let set = null;
  if (lod === 'fine') {
    const ck = protoKey(p) + p.mat;
    set = COARSE.get(ck);
    if (!set) COARSE.set(ck, (set = coarseSet(g.attributes.position.array, g.attributes.normal.array, g.index.array, MATERIALS[p.mat]?.kind === 'metal')));
    if (set.open) lod = 'open'; else if (!set.low && !set.far) lod = null;
  }
  const nbig = lod ? Infinity : p.big ?? Infinity;
  const cells = new Map(), centers = new Float32Array(M.length / 16 * 3);
  let r = 0;
  for (let i = 0; i < M.length; i += 16) {
    T.fromArray(M, i); B.copy(bb).applyMatrix4(T);
    const cx = (B.min.x + B.max.x) / 2, cy = (B.min.y + B.max.y) / 2, cz = (B.min.z + B.max.z) / 2;
    centers.set([cx, cy, cz], i / 16 * 3);
    r = Math.max(r, B.max.distanceTo(B.min) / 2);
    const k = cellKey(cx, cz, ISIZE);
    let e = cells.get(k);
    if (!e) cells.set(k, (e = { tris: 0, n: 0, box: [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity] }));
    e.n++; e.tris += tri; e.big = (e.big || 0) + (i / 16 < nbig ? tri : 0);
    grow(e.box, [B.min.x, B.min.y, B.min.z, B.max.x, B.max.y, B.max.z]);
  }
  const n3 = (v) => (v ? v.index.length / 3 : 0);
  return { cells, lod, reach, centers, r, tri, coarseTri: n3(set?.low), farTri: n3(set?.far), shadowTri: n3(set?.shadow), bigTris: lod || p.big === undefined ? undefined : p.big * tri };
}

const COARSE = new Map();

/** Every mesh the viewer makes for a settlement: { kind, mat, plan, sphere, cast, small, detail }. */
export async function sceneOf(id) {
  const mod = await MODULES[id]();
  const town = await mod.town();
  const plans = [...mod.landmarks.map((p) => p.plan), ...town];
  const out = [], life = new Map();
  const sphereOf = (g, M = null) => {
    if (!g.boundingSphere) g.computeBoundingSphere();
    if (!M) return g.boundingSphere.clone();
    const pts = [], c = g.boundingSphere.center, r = g.boundingSphere.radius, T = new THREE.Matrix4();
    let s = 0;
    for (let i = 0; i < M.length; i += 16) { T.fromArray(M, i); pts.push(c.clone().applyMatrix4(T)); s = Math.max(s, T.getMaxScaleOnAxis()); }
    const S = new THREE.Sphere().setFromPoints(pts); S.radius += r * s; return S;
  };
  for (const plan of plans) {
    const b = buildPlan(plan, { instancing: true, detail: true });
    const isLife = plan.style === 'life';
    const always = !isLife && !plan.near && !plan.far;
    for (const p of b.parts) out.push({ tris: (p.geometry.index ? p.geometry.index.count : p.geometry.attributes.position.count) / 3, kind: p.detail ? 'detail' : isLife ? 'lifeTile' : plan.near ? 'tileNear' : plan.far ? 'tileFar' : 'landmark', mat: p.mat, plan, sphere: sphereOf(p.geometry), cast: castsShadow(p.mat), small: !!p.detail || isLife, detail: !!p.detail, cells: always && !p.detail && p.geometry.index ? partCells(p.geometry, p.shadowBig) : null, bigTris: always && !p.detail ? p.shadowBig : undefined });
    for (const p of b.instanced) {
      if (isLife) {
        const k = `${p.key}|${p.mat}`, e = life.get(k) || life.set(k, { mat: p.mat, chunks: [], n: 0 }).get(k);
        p.__plan = plan; e.chunks.push(p); e.n += p.matrices.length / 16; continue;
      }
      out.push({ tris: p.geometry.index.count / 3 * p.matrices.length / 16, kind: p.detail ? 'detail' : 'instanced', mat: p.mat, plan, key: protoKey(p), sphere: sphereOf(p.geometry, p.matrices), cast: castsShadow(p.mat), small: !!p.detail, detail: !!p.detail, ...(always && !p.detail ? instCells(p) : {}) });
    }
    if (b.lights.length) out.push({ kind: 'flames', mat: 'flame', plan, sphere: new THREE.Sphere().setFromPoints(b.lights.map((l) => new THREE.Vector3(...l.at))), cast: false });
  }
  // life: settlement-wide instanced shapes, or merged into their tiles by real material
  const rare = new Map();
  for (const e of life.values()) {
    if (lifeInstanced(e.n, e.chunks[0].geometry)) {
      const pos = new Float32Array(e.n * 3), reach = new Float32Array(e.n);
      let o = 0, r = 0;
      for (const p of e.chunks) {
        const k = p.matrices.length / 16;
        for (let i = 0; i < k; i++) { pos.set([p.matrices[i * 16 + 12], p.matrices[i * 16 + 13], p.matrices[i * 16 + 14]], (o + i) * 3); }
        reach.set(p.reach, o); o += k;
        if (!p.geometry.boundingSphere) p.geometry.computeBoundingSphere();
        r = Math.max(r, p.geometry.boundingSphere.radius * 2);
      }
      const g = e.chunks[0].geometry, low = coarse(g.attributes.position.array, g.attributes.normal.array, g.index.array);
      out.push({ kind: 'life', tri: g.index.count / 3, lowTri: low ? low.index.length / 3 : 0, mat: e.mat, n: e.n, pos, reach, r, cast: castsShadow(e.mat) });
    } else {
      for (const p of e.chunks) {
        if (!p.geometry.boundingSphere) p.geometry.computeBoundingSphere();
        for (let i = 0; i < p.reals.length; i++) {
          const s = rare.get(p.reals[i]) || rare.set(p.reals[i], { mat: p.reals[i], pos: [], reach: [], r: 0 }).get(p.reals[i]);
          s.pos.push(p.matrices[i * 16 + 12], p.matrices[i * 16 + 13], p.matrices[i * 16 + 14]); s.reach.push(p.reach[i]);
          s.r = Math.max(s.r, p.geometry.boundingSphere.radius * 2);
        }
      }
    }
  }
  // the rare shapes, settlement-wide per real material, their copies chosen by distance (life-instances.js)
  for (const s of rare.values()) out.push({ kind: 'lifeRare', mat: s.mat, n: s.reach.length, pos: s.pos, reach: s.reach, r: s.r, cast: castsShadow(s.mat) });
  out.plans = plans;
  return out;
}

/**
 * Views measured with --views (besides each settlement's arrival): dense interiors and heavy
 * places, [x, feet y, z] in the settlement's frame; the frame counted looking each of four ways
 * (the worst reported), level.
 */
export const VIEWS = {
  paris: [['sainte-chapelle upper chapel', [-192, 8.6, -10]]],
  florence: [['duomo nave', [-30, 0, -60]], ['duomo crossing', [50, 0, -60]]],
  'new-york': [['fifth avenue', [4, 0.1, 176]]],
  'qing-beijing': [['taihe terrace', [40, 8.15, 20]]],
  constantinople: [['hagia sophia nave', [0, 0, 0]]],
  'baroque-rome': [['st peter crossing', [-210, 3, 0]]],
};

const M = (v) => (v / 1e6).toFixed(2);
const SIZE = +opt('cell', CELL), SPLIT = +opt('split', SPLIT_TRIS), SPLITI = +opt('splitinst', SPLIT_INST), ISIZE = +opt('icell', CELL);

if (import.meta.url === `file://${process.argv[1]}`) {
  const at = opt('at') ? opt('at').split(',').map((v) => (v === '' || v === 'g' ? null : +v)) : null;
  const sun = opt('sun', '135,40').split(',').map(Number), merge = !args.includes('--nomerge'), cells = !args.includes('--before');
  const rows = [];
  for (const id of ids.length ? ids : Object.keys(ARRIVALS)) {
    const build = await sceneOf(id);
    const poses = [['arrival', at ?? ARRIVALS[id]]];
    if (args.includes('--views')) for (const [name, [x, y, z]] of VIEWS[id] ?? []) poses.push([name, [x, y, z, 0, 0.05]]);
    for (const [name, pose] of poses) {
      let R = null;
      // an interior: the worst of four ways
      const yaws = name === 'arrival' ? [pose[3]] : [0, 1, 2, 3].map((k) => k * Math.PI / 2);
      for (const yaw of yaws) {
        const r = await drawCount(id, { at: [pose[0], pose[1], pose[2], yaw, pose[4] ?? 0.1], sun, build, merge, cells });
        if (!R || r.tris.frame > R.tris.frame) R = r;
      }
      R.view = name;
      rows.push(R);
      const f = (o) => Object.entries(o).filter(([k]) => k !== 'all').map(([k, v]) => `${k} ${v}`).join(', ');
      console.log(`${id} [${name}]: ${M(R.tris.frame)} M tris a frame (main ${M(R.tris.main)}, shadow ${R.tris.cascades.map(M).join('/')} per cascade; worst frame ${M(R.tris.worst)}); ≈ ${R.frame} draws (main ${R.main.all}: ${f(R.main)}; shadow ${R.shadow.cascades.join('/')} per cascade, ${R.shadow.perFrame} a frame); ${R.objects} meshes made, ${R.visible} shown`);
      if (args.includes('--top')) {
        const sum = (list) => { const m = new Map(); for (const t of list) { const k = `${t.kind}${t.lod ? '/' + t.lod : ''} ${t.mat} ${t.plan}${process.env.DC_TRI && t.tri ? ' @' + t.tri : ''}`; m.set(k, (m.get(k) || 0) + t.tris); } return [...m].sort((a, b) => b[1] - a[1]).slice(0, +opt('top', 10) || 10); };
        console.log('   main:', sum(R.top).map(([k, v]) => `${k} ${Math.round(v / 1000)}k`).join('; '));
        R.shadow.top.forEach((l, c) => console.log(`   cascade ${c}:`, sum(l).map(([k, v]) => `${k} ${Math.round(v / 1000)}k`).join('; ')));
      }
    }
  }
  if (opt('json')) await writeFile(opt('json'), JSON.stringify(rows.map(({ top, ...r }) => r), null, 1));
}
