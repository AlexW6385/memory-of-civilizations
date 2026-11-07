#!/usr/bin/env node
// Draw calls of a frame, counted in Node (DESIGN §8: ≤ 800): a settlement built as the viewer
// builds it, its meshes made as the viewer makes them (src/engine/world.js, life-instances.js) and
// shown and hidden by the same rules (tiles' near / far, fine detail within reach, street life's
// copies by distance), then culled against the camera's frustum and the three shadow cascades'
// boxes as three.js culls them. Headless Chromium draws WebGPU in software and its renderer.info
// is of a trimmed scene (tools/showroom.mjs --site); this counts the whole settlement exactly
// (the cascades' boxes are approximated as CSMShadowNode fits them). Ground, plants, sky and the
// post-processing passes are not counted (about 60–120 more draws).
//
// usage: node tools/draw-count.mjs <id>... [--at x,y,z,yaw,pitch] [--sun azimuthDeg,elevationDeg]
//        [--nomerge] [--json out.json]   (--nomerge: plans' meshes kept apart, as before src/engine/merge.js; default pose: the settlement's arrival, src/planet/arrivals.js)

import * as THREE from '../src/vendor/three/build/three.core.js';
import { writeFile } from 'node:fs/promises';
import { MODULES } from '../src/settlements/grounds.js';
import { buildPlan } from '../src/core/build.js';
import { ARRIVALS } from '../src/planet/arrivals.js';
import { MATERIALS } from '../src/core/palette.js';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const ids = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));

// the viewer's rules (src/engine/world.js, life-instances.js)
const DETAIL_REACH = 160, DETAIL_SHADOW = 50, LIFE_SHADOW = 120;
const NO_SHADOW = new Set(['water', 'glass_outer', 'glass_topaz', 'opening', 'daylight', 'daylight_plain']);
const NO_SHADOW_KINDS = new Set(['glow', 'water', 'foam']);
const castsShadow = (mat) => !NO_SHADOW.has(mat) && !NO_SHADOW_KINDS.has(MATERIALS[mat]?.kind);
const { LIFE_MIN } = await import('../src/engine/life-instances.js').catch(() => ({ LIFE_MIN: 13 }));

/** A frame's draws: the meshes of a settlement (with the viewer's options), and the counts at a pose. */
export async function drawCount(id, { at = null, sun = [135, 40], build = null, merge = true } = {}) {
  let meshes = build ?? await sceneOf(id);
  if (merge) meshes = mergeScene(meshes);
  const pose = at ?? ARRIVALS[id] ?? [0, 0, 0, 0, 0.1];
  const [x, y0, z, yaw, pitch] = pose;
  const eye = new THREE.Vector3(x, (y0 ?? 0) + 1.6, z);
  const cam = new THREE.PerspectiveCamera(68, 16 / 9, 0.08, 4000);
  cam.position.copy(eye); cam.rotation.order = 'YXZ'; cam.rotation.set(pitch, yaw, 0);
  cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
  const vis = visibleSet(meshes, eye);
  const S = new THREE.Sphere();
  const inFr = (f, m) => f.intersectsSphere(S.copy(m.sphere));
  const main = { all: 0 };
  let tris = 0;
  for (const m of vis) if (inFr(fr, m)) { main.all++; tris += m.tris || 0; main[m.kind] = (main[m.kind] || 0) + 1; }
  // the cascades (CSMShadowNode 'practical', maxFar 320, lightMargin 200): each an orthographic box
  // round the sphere of its slice of the view, reaching 200 m toward the sun
  const n = 3, near = cam.near, far = 320, splits = [near];
  for (let i = 1; i < n; i++) splits.push(((near * (far / near) ** (i / n)) + (near + (far - near) * i / n)) / 2);
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
    const lc = new THREE.OrthographicCamera(-radius, radius, radius, -radius, 0, 2 * radius + 200);
    lc.position.copy(center).addScaledVector(sd, radius + 200); lc.lookAt(center); lc.updateMatrixWorld(); lc.updateProjectionMatrix();
    const lf = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(lc.projectionMatrix, lc.matrixWorldInverse));
    let k = 0, kt = 0;
    const kinds = {};
    for (const m of vis) if (m.cast && (c === 0 || !m.small) && inFr(lf, m)) { k++; kt += m.tris || 0; kinds[m.kind] = (kinds[m.kind] || 0) + 1; }
    (shadow.kinds ??= []).push(kinds);
    shadow.tris = (shadow.tris || 0) + kt / (c + 1);
    shadow.cascades.push(k); shadow.all += k; shadow.perFrame += k / (c + 1);
  }
  shadow.perFrame = Math.round(shadow.perFrame);
  const objects = meshes.length;
  return { id, pose, objects, visible: vis.length, main, shadow, frame: main.all + shadow.perFrame, tris: { main: Math.round(tris), shadow: Math.round(shadow.tris) } };
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
    const pts = [[]];
    for (let i = 0; i < m.n; i++) {
      const dx = m.pos[i * 3] - eye.x, dy = (m.pos[i * 3 + 1] - eye.y) * 0.7, dz = m.pos[i * 3 + 2] - eye.z, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > m.reach[i] ** 2) continue;
      pts[0].push(new THREE.Vector3(m.pos[i * 3], m.pos[i * 3 + 1], m.pos[i * 3 + 2]));
    }
    pts.forEach((p, w) => {
      if (!p.length) return;
      const s = new THREE.Sphere().setFromPoints(p); s.radius += m.r;
      out.push({ kind: m.kind, tris: (m.tri || 0) * p.length, mat: m.mat, sphere: s, cast: w === 0 && m.cast, small: true });
    });
  }
  return out;
}

/**
 * The viewer's merge (src/engine/merge.js): the meshes of plans always shown (no near / far, not
 * street life), fine detail apart, merged settlement-wide per material and per repeated shape.
 */
export function mergeScene(ms) {
  const out = [], groups = new Map(), far = new Map();
  for (const m of ms) {
    const P = m.plan;
    // the town's tiles: batched per material and version, the tiles shown chosen (merge.js TileBatch)
    if (P && (m.kind === 'tileFar' || m.kind === 'tileNear')) { const k = m.kind + m.mat; (far.get(k) || far.set(k, []).get(k)).push(m); continue; }
    if (!P || P.near || P.far || P.style === 'life' || (m.kind !== 'landmark' && m.kind !== 'instanced')) { out.push(m); continue; }
    const k = `${m.kind}|${m.mat}|${m.key ?? ''}`, g = groups.get(k);
    if (!g) groups.set(k, { ...m, sphere: m.sphere.clone() }); else { g.sphere.union(m.sphere); g.tris += m.tris; }
  }
  for (const list of far.values()) {
    if (list.length < 2) out.push(...list); else out.push({ kind: list[0].kind, batch: list, mat: list[0].mat, cast: list[0].cast });
  }
  return [...out, ...groups.values()];
}

/** A prototype's identity (its key and its vertices, rounded). */
function protoKey(p) {
  const A = p.geometry.attributes.position.array;
  let h = 0;
  for (let i = 0; i < A.length; i++) h = (h * 31 + Math.round(A[i] * 1e4)) | 0;
  return `${p.key ?? ''}|${A.length}|${p.geometry.index?.count}|${h}`;
}

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
    for (const p of b.parts) out.push({ tris: (p.geometry.index ? p.geometry.index.count : p.geometry.attributes.position.count) / 3, kind: p.detail ? 'detail' : isLife ? 'lifeTile' : plan.near ? 'tileNear' : plan.far ? 'tileFar' : 'landmark', mat: p.mat, plan, sphere: sphereOf(p.geometry), cast: castsShadow(p.mat), small: !!p.detail || isLife, detail: !!p.detail });
    for (const p of b.instanced) {
      if (isLife) {
        const k = `${p.key}|${p.mat}`, e = life.get(k) || life.set(k, { mat: p.mat, chunks: [], n: 0 }).get(k);
        p.__plan = plan; e.chunks.push(p); e.n += p.matrices.length / 16; continue;
      }
      out.push({ tris: p.geometry.index.count / 3 * p.matrices.length / 16, kind: p.detail ? 'detail' : 'instanced', mat: p.mat, plan, key: protoKey(p), sphere: sphereOf(p.geometry, p.matrices), cast: castsShadow(p.mat), small: !!p.detail, detail: !!p.detail });
    }
    if (b.lights.length) out.push({ kind: 'flames', mat: 'flame', plan, sphere: new THREE.Sphere().setFromPoints(b.lights.map((l) => new THREE.Vector3(...l.at))), cast: false });
  }
  // life: settlement-wide instanced shapes, or merged into their tiles by real material
  const rare = new Map();
  for (const e of life.values()) {
    if (e.n >= LIFE_MIN) {
      const pos = new Float32Array(e.n * 3), reach = new Float32Array(e.n);
      let o = 0, r = 0;
      for (const p of e.chunks) {
        const k = p.matrices.length / 16;
        for (let i = 0; i < k; i++) { pos.set([p.matrices[i * 16 + 12], p.matrices[i * 16 + 13], p.matrices[i * 16 + 14]], (o + i) * 3); }
        reach.set(p.reach, o); o += k;
        if (!p.geometry.boundingSphere) p.geometry.computeBoundingSphere();
        r = Math.max(r, p.geometry.boundingSphere.radius * 2);
      }
      out.push({ kind: 'life', tri: e.chunks[0].geometry.index.count / 3, mat: e.mat, n: e.n, pos, reach, r, cast: castsShadow(e.mat) });
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
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const at = opt('at') ? opt('at').split(',').map((v) => (v === '' || v === 'g' ? null : +v)) : null;
  const sun = opt('sun', '135,40').split(',').map(Number), merge = !args.includes('--nomerge');
  const rows = [];
  for (const id of ids) {
    const R = await drawCount(id, { at, sun, merge });
    rows.push(R);
    const f = (o) => Object.entries(o).filter(([k]) => k !== 'all').map(([k, v]) => `${k} ${v}`).join(', ');
    console.log(`${id}: frame ≈ ${R.frame} draws (main ${R.main.all}: ${f(R.main)}; shadow ${R.shadow.cascades.join('/')} per cascade, ${R.shadow.perFrame} a frame); ${R.objects} meshes made, ${R.visible} shown`);
  }
  if (opt('json')) await writeFile(opt('json'), JSON.stringify(rows, null, 1));
}
