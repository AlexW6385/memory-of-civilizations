#!/usr/bin/env node
// Surface check: faces that would flicker.
//
// Coplanar faces: two faces of different materials lying in the same plane, facing the same way
// and overlapping, whose materials also share a depth rank (src/core/geom.js: each material
// stands off its faces by its rank; two of the same rank would fight in the depth buffer and
// flicker). Horizontal and axis-aligned vertical faces are checked, on a grid of CELL metres.
//
// Elements whose builder throws are reported too (they would be missing from the settlement).
//
// Reported by element type and material, with the area.
// usage: node tools/surface-check.mjs [settlement-or-building-id …]      (default: all)
// Exit code 1 when anything is found.
//
// It works one plan at a time and one element at a time: each element is built alone, only its
// faces lying along the axes are kept (packed in typed arrays) and its geometry let go. The faces
// are then sorted into planes (same axis, same facing, depths within EPS); only planes holding two
// materials of one rank are looked at, and in them only pairs of faces whose bounds overlap.

import { MODULES } from '../src/settlements/grounds.js';
import { BUILDINGS } from '../src/buildings/index.js';
import { buildPlan } from '../src/core/build.js';
import { depthRank } from '../src/core/geom.js';

const CELL = 0.25, EPS = 0.012, SKIP = new Set(['opening', 'water', 'glass_outer', 'flame', 'glass_lamp']);
let failed = 0;

/** The faces of a plan lying along the axes, packed: 9 floats each, and their material, element, axis and facing. */
class Faces {
  constructor() { this.n = 0; this.P = new Float32Array(9 * 4096); this.M = new Int32Array(4096 * 4); }
  push(P, k, mat, el, axis, sign) {
    if (this.n * 9 + 9 > this.P.length) {
      const P2 = new Float32Array(this.P.length * 2); P2.set(this.P); this.P = P2;
      const M2 = new Int32Array(this.M.length * 2); M2.set(this.M); this.M = M2;
    }
    const n = this.n++;
    for (let q = 0; q < 9; q++) this.P[n * 9 + q] = P[k + q];
    this.M[n * 4] = mat; this.M[n * 4 + 1] = el; this.M[n * 4 + 2] = axis; this.M[n * 4 + 3] = sign;
  }
}

/** Build each element alone and keep its axis-aligned faces. errors: elements that do not build. */
function collect(plan, mats, errors) {
  const F = new Faces();
  plan.elements.forEach((el, i) => {
    let built;
    try { built = buildPlan({ ...plan, elements: [el] }); } catch (e) { errors.push(`element ${i} (${el.t}) does not build: ${e.message.split('\n')[0]}`); return; }
    for (const { mat, geometry } of built.parts) {
      if (!SKIP.has(mat)) {
        let m = mats.id.get(mat);
        if (m === undefined) { m = mats.name.length; mats.id.set(mat, m); mats.name.push(mat); mats.rank.push(depthRank(mat)); }
        const g = geometry.index ? geometry.toNonIndexed() : geometry, P = g.attributes.position.array;
        for (let k = 0; k < P.length; k += 9) {
          const ux = P[k + 3] - P[k], uy = P[k + 4] - P[k + 1], uz = P[k + 5] - P[k + 2], vx = P[k + 6] - P[k], vy = P[k + 7] - P[k + 1], vz = P[k + 8] - P[k + 2];
          const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, L = Math.hypot(nx, ny, nz);
          if (L < 1e-9) continue;
          // axis-aligned planes: horizontal (y), or vertical facing x or z
          if (Math.abs(ny) / L > 0.9999) F.push(P, k, m, i, 1, Math.sign(ny));
          else if (Math.abs(nx) / L > 0.9999) F.push(P, k, m, i, 0, Math.sign(nx));
          else if (Math.abs(nz) / L > 0.9999) F.push(P, k, m, i, 2, Math.sign(nz));
        }
        if (g !== geometry) g.dispose();
      }
      geometry.dispose();
    }
  });
  return F;
}

// the projection of each axis: [a, b] the plane's coordinates (as the cells are laid), the axis the depth
const PROJ = [[2, 1], [0, 2], [0, 1]];

/** A face projected on its plane, ready to be sampled at cell centres (null: too large or degenerate). */
function prep(F, t) {
  const P = F.P, o = t * 9, axis = F.M[t * 4 + 2], [a, b] = PROJ[axis];
  const A0 = P[o + a], A1 = P[o + b], A2 = P[o + axis];
  const ux = P[o + 3 + a] - A0, uy = P[o + 3 + b] - A1, vx = P[o + 6 + a] - A0, vy = P[o + 6 + b] - A1, det = ux * vy - uy * vx;
  if (Math.abs(det) < 1e-6) return null;
  const pa = [P[o + a], P[o + 3 + a], P[o + 6 + a]], pb = [P[o + b], P[o + 3 + b], P[o + 6 + b]];
  const i0 = Math.ceil(Math.min(...pa) / CELL - 0.5), i1 = Math.floor(Math.max(...pa) / CELL - 0.5);
  const j0 = Math.ceil(Math.min(...pb) / CELL - 0.5), j1 = Math.floor(Math.max(...pb) / CELL - 0.5);
  if ((i1 - i0) * (j1 - j0) > 4e6) return null;
  const pd = [P[o + axis], P[o + 3 + axis], P[o + 6 + axis]];
  return { t, A0, A1, A2, ux, uy, vx, vy, det, du: pd[1] - A2, dv: pd[2] - A2, i0, i1, j0, j1, d0: Math.min(...pd), d1: Math.max(...pd) };
}
/** Depth of face f at the centre of cell (i, j), or NaN when the centre is not strictly inside it. */
function depth(f, i, j) {
  const px = (i + 0.5) * CELL - f.A0, py = (j + 0.5) * CELL - f.A1;
  const s = (px * f.vy - py * f.vx) / f.det, q = (f.ux * py - f.uy * px) / f.det;
  if (s <= 0.002 || q <= 0.002 || s + q >= 0.998) return NaN;
  return f.A2 + f.du * s + f.dv * q;
}

/** The surface problems of one plan: { coplanar: Map(key → { area m², at }), errors: [message], faces }. */
export function check(plan) {
  const mats = { id: new Map(), name: [], rank: [] }, errors = [];
  const F = collect(plan, mats, errors), coplanar = new Map();
  const n = F.n, M = F.M;
  // the faces by axis and facing, then in planes: runs of faces whose depth ranges lie within EPS
  const groups = new Map();
  const D0 = new Float32Array(n), D1 = new Float32Array(n);
  for (let t = 0; t < n; t++) {
    const axis = M[t * 4 + 2], o = t * 9 + axis;
    D0[t] = Math.min(F.P[o], F.P[o + 3], F.P[o + 6]); D1[t] = Math.max(F.P[o], F.P[o + 3], F.P[o + 6]);
    const k = axis * 3 + M[t * 4 + 3] + 1;
    (groups.get(k) || groups.set(k, []).get(k)).push(t);
  }
  const plane = (list) => {
    // only a rank shared by two materials can fight
    const byRank = new Map();
    for (const t of list) { const m = M[t * 4], r = mats.rank[m]; (byRank.get(r) || byRank.set(r, []).get(r)).push(t); }
    for (const ts of byRank.values()) {
      if (ts.length < 2 || ts.every((t) => M[t * 4] === M[ts[0] * 4])) continue;
      // sweep along a: each face against the faces before it whose bounds still reach it
      const fs = ts.map((t) => prep(F, t)).filter(Boolean).sort((p, q) => p.i0 - q.i0 || p.t - q.t);
      let active = [];
      for (const f of fs) {
        active = active.filter((o) => o.i1 >= f.i0);
        for (const o of active) {
          if (M[o.t * 4] === M[f.t * 4] || o.j1 < f.j0 || f.j1 < o.j0 || o.d0 > f.d1 + EPS || f.d0 > o.d1 + EPS) continue;
          let cells = 0, ci = 0, cj = 0, cd = 0;
          for (let j = Math.max(o.j0, f.j0), j1 = Math.min(o.j1, f.j1); j <= j1; j++) {
            for (let i = f.i0, i1 = Math.min(o.i1, f.i1); i <= i1; i++) {
              const a = depth(o, i, j);
              if (a !== a) continue;
              const b = depth(f, i, j);
              if (b === b && Math.abs(a - b) <= EPS && !cells++) { ci = i; cj = j; cd = b; }
            }
          }
          if (!cells) continue;
          const tag = (t) => `${plan.elements[M[t * 4 + 1]].t}:${mats.name[M[t * 4]]}`;
          const key = [tag(o.t), tag(f.t)].sort().join(' × ');
          let r = coplanar.get(key);
          if (!r) {
            // where: the first cell found of the first pair found
            const axis = M[f.t * 4 + 2], [a, b] = PROJ[axis], at = [0, 0, 0];
            at[a] = (ci + 0.5) * CELL; at[b] = (cj + 0.5) * CELL; at[axis] = cd;
            coplanar.set(key, (r = { area: 0, at }));
          }
          r.area += cells * CELL * CELL;
        }
        active.push(f);
      }
    }
  };
  for (const list of groups.values()) {
    list.sort((p, q) => D0[p] - D0[q]);
    let run = [list[0]], hi = D1[list[0]];
    for (let x = 1; x <= list.length; x++) {
      const t = list[x];
      if (x < list.length && D0[t] <= hi + EPS) { run.push(t); hi = Math.max(hi, D1[t]); continue; }
      if (run.length > 1) plane(run);
      if (x < list.length) { run = [t]; hi = D1[t]; }
    }
  }
  return { coplanar, errors, faces: n };
}

function report(id, plan) {
  const { coplanar, errors } = check(plan);
  const bad = [...coplanar].filter(([, r]) => r.area >= 0.25);
  if (!bad.length && !errors.length) return;
  failed++;
  console.log(`${id} / ${plan.id}:`);
  for (const e of errors.slice(0, 20)) console.log(`  ${e}`);
  if (errors.length > 20) console.log(`  … ${errors.length - 20} more elements that do not build`);
  for (const [k, r] of bad.sort((x, y) => y[1].area - x[1].area).slice(0, 12)) console.log(`  coplanar  ${k}  ${r.area.toFixed(1)} m²  near (${r.at.map((v) => v.toFixed(1)).join(', ')})`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  for (const id of only) if (!MODULES[id] && !BUILDINGS.some((b) => b.id === id)) { console.log(`${id}: no such settlement or building`); process.exit(2); }
  // one settlement at a time, one plan at a time
  for (const [id, load] of Object.entries(MODULES)) {
    if (only.length && !only.includes(id)) continue;
    const m = await load();
    for (const l of m.landmarks || []) report(id, l.plan);
    if (m.town) for (const p of await m.town()) report(id, p);
  }
  for (const b of BUILDINGS) if (!only.length || only.includes(b.id)) report(b.id, (await b.load()).plan);

  console.log(failed ? `${failed} plan(s) with surface problems` : 'surfaces ok');
  process.exit(failed ? 1 : 0);
}
