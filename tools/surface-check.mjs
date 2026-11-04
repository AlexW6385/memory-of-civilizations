#!/usr/bin/env node
// Surface check: faces that would flicker or let a walker fall through.
//
// Coplanar faces: two faces of different materials lying in the same plane, facing the same way
// and overlapping, whose materials also share a depth rank (src/core/geom.js: each material
// stands off its faces by its rank; two of the same rank would fight in the depth buffer and
// flicker). Horizontal and axis-aligned vertical faces are checked, on a grid of CELL metres.
// (Faces wound downward no longer matter to the walker: the top field takes either side.)
//
// Reported by element type and material, with the area. usage: node tools/surface-check.mjs [settlement-id …]
// Exit code 1 when anything is found (tests/plan.test.mjs runs it).

import { MODULES } from '../src/settlements/grounds.js';
import { BUILDINGS } from '../src/buildings/index.js';
import { buildPlan } from '../src/core/build.js';
import { depthRank } from '../src/core/geom.js';

const CELL = 0.25, EPS = 0.012, SKIP = new Set(['opening', 'water', 'glass_outer', 'flame', 'glass_lamp']);
const only = process.argv.slice(2);
let failed = 0;

function triangles(plan) {
  const out = [];
  plan.elements.forEach((el, i) => {
    let built;
    try { built = buildPlan({ ...plan, elements: [el] }); } catch { return; }
    for (const { mat, geometry } of built.parts) {
      if (SKIP.has(mat)) continue;
      const g = geometry.index ? geometry.toNonIndexed() : geometry, P = g.attributes.position.array;
      for (let k = 0; k < P.length; k += 9) out.push({ p: P.subarray(k, k + 9), mat, el: i, t: el.t });
    }
  });
  return out;
}
/** Cells (centres) strictly inside the triangle projected on axes (a, b): yields [ca, cb, depth]. */
function* raster(p, a, b, c) {
  const A = [p[a], p[b], p[c]], B = [p[3 + a], p[3 + b], p[3 + c]], C = [p[6 + a], p[6 + b], p[6 + c]];
  const ux = B[0] - A[0], uy = B[1] - A[1], vx = C[0] - A[0], vy = C[1] - A[1], det = ux * vy - uy * vx;
  if (Math.abs(det) < 1e-6) return;
  const i0 = Math.ceil(Math.min(A[0], B[0], C[0]) / CELL - 0.5), i1 = Math.floor(Math.max(A[0], B[0], C[0]) / CELL - 0.5);
  const j0 = Math.ceil(Math.min(A[1], B[1], C[1]) / CELL - 0.5), j1 = Math.floor(Math.max(A[1], B[1], C[1]) / CELL - 0.5);
  if ((i1 - i0) * (j1 - j0) > 4e6) return;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const px = (i + 0.5) * CELL - A[0], py = (j + 0.5) * CELL - A[1];
    const s = (px * vy - py * vx) / det, q = (ux * py - uy * px) / det;
    if (s <= 0.002 || q <= 0.002 || s + q >= 0.998) continue;
    yield [i, j, A[2] + (B[2] - A[2]) * s + (C[2] - A[2]) * q];
  }
}
function check(plan) {
  const tris = triangles(plan), planes = new Map(), tops = new Map(), coplanar = new Map(), upside = new Map();
  for (const T of tris) {
    const p = T.p, ux = p[3] - p[0], uy = p[4] - p[1], uz = p[5] - p[2], vx = p[6] - p[0], vy = p[7] - p[1], vz = p[8] - p[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, L = Math.hypot(nx, ny, nz);
    if (L < 1e-9) continue;
    const ax = Math.abs(nx) / L, ay = Math.abs(ny) / L, az = Math.abs(nz) / L;
    // the highest face over each spot (any face less steep than ~72°)
    // axis-aligned planes: horizontal (y), or vertical facing x or z
    let axis = -1, a, b, sign;
    if (ay > 0.9999) { axis = 1; a = 0; b = 2; sign = Math.sign(ny); }
    else if (ax > 0.9999) { axis = 0; a = 2; b = 1; sign = Math.sign(nx); }
    else if (az > 0.9999) { axis = 2; a = 0; b = 1; sign = Math.sign(nz); }
    if (axis < 0) continue;
    for (const [i, j, d] of raster(p, a, b, axis)) {
      const k = axis + ':' + sign + ':' + i + ',' + j;
      let list = planes.get(k);
      if (!list) planes.set(k, (list = []));
      for (const o of list) {
        if (o.T.mat === T.mat || depthRank(o.T.mat) !== depthRank(T.mat) || Math.abs(o.d - d) > EPS) continue;
        const key = [`${o.T.t}:${o.T.mat}`, `${T.t}:${T.mat}`].sort().join(' × ');
        const r = coplanar.get(key) || { area: 0, at: [p[0], p[1], p[2]] };
        r.area += CELL * CELL; coplanar.set(key, r);
      }
      list.push({ d, T });
    }
  }
  return { coplanar, upside };
}

const plans = [];
for (const [id, load] of Object.entries(MODULES)) {
  if (only.length && !only.includes(id)) continue;
  const m = await load();
  for (const l of m.landmarks || []) plans.push([id, l.plan]);
  if (m.town) for (const p of await m.town()) plans.push([id, p]);
}
for (const b of BUILDINGS) if (!only.length || only.includes(b.id)) plans.push([b.id, (await b.load()).plan]);

for (const [id, plan] of plans) {
  const { coplanar, upside } = check(plan);
  const bad = [...coplanar].filter(([, r]) => r.area >= 0.25), inv = [...upside].filter(([, r]) => r.area >= 0.5);
  if (!bad.length && !inv.length) continue;
  failed++;
  console.log(`${id} / ${plan.id}:`);
  for (const [k, r] of bad.sort((x, y) => y[1].area - x[1].area).slice(0, 12)) console.log(`  coplanar  ${k}  ${r.area.toFixed(1)} m²  near (${r.at.map((v) => v.toFixed(1)).join(', ')})`);
  for (const [k, r] of inv.sort((x, y) => y[1].area - x[1].area).slice(0, 8)) console.log(`  upside-down top  ${k}  ${r.area.toFixed(1)} m²  near (${r.at.map((v) => v.toFixed(1)).join(', ')})`);
}
console.log(failed ? `${failed} plan(s) with surface problems` : 'surfaces ok');
process.exit(failed ? 1 : 0);
