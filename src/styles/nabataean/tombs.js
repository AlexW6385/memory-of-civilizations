// The tombs of the Street of Façades (docs/settlements/petra.md §10): façades cut in the cliff in
// the "Assyrian" manner — a plain front on a plinth, a simple rectangular door in its framed
// recess, the Egyptian cornice (a torus under a flaring gorge) and above it the crow-steps:
//   'pylon' — one row of stepped merlons;
//   'step'  — two rows, the lower before a plain attic, the upper on the attic's fillet;
//   'hegr'  — corner pilasters with Nabataean (horned) capitals, a classical architrave and frieze
//             under the gorge, an attic with its own pilasters, and two great half-merlons
//             stepping down toward the middle.
// rock_tomb { at, dir ('e' … or [nx, nz], the way it faces), w, h, kind, back (rock behind),
// boxTop (how high the dressed rock behind the façade rises; the cliff is built above it),
// flank (the dressed rock either side), y (its foot) }

import { fromTriangles, lathe } from '../../core/geom.js';
import { floralCapital } from './khazneh.js';
import { orientedBox } from '../../core/build.js';

const R = 'sandstone_rose', O = 'opening';
function frame(x, z, dir, y0) {
  const [nx, nz] = Array.isArray(dir) ? dir : { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] }[dir], ux = -nz, uz = nx;
  const P = (u, v) => [x + ux * u + nx * v, z + uz * u + nz * v];
  // a box from (u0, v0) to (u1, v1) in the façade's frame, from y0 to y1 above the foot
  const B = (u0, v0, u1, v1, ya, yb) => orientedBox(P(Math.min(u0, u1), (v0 + v1) / 2), P(Math.max(u0, u1), (v0 + v1) / 2), Math.abs(v1 - v0), y0 + ya, y0 + yb);
  return { P, B };
}
/** A moulding: the profile [[v, y], …] (from the back, v0, round its front and back to v0, monotone in y), run along u from u0 to u1. */
function moulding(bag, P, y0, prof, u0, u1, v0, mat = R) {
  const T = [], V = (u, [v, y]) => { const [x, z] = P(u, v); return [x, y0 + y, z]; };
  for (let i = 0; i + 1 < prof.length; i++) {
    const a = prof[i], b = prof[i + 1];
    // the front strip, wound to face out of the façade (toward +v)
    T.push(...V(u0, a), ...V(u1, a), ...V(u1, b), ...V(u0, a), ...V(u1, b), ...V(u0, b));
    // the end caps: the strip between the profile and the back line
    const a0 = [v0, a[1]], b0 = [v0, b[1]];
    T.push(...V(u0, a0), ...V(u0, a), ...V(u0, b), ...V(u0, a0), ...V(u0, b), ...V(u0, b0));
    T.push(...V(u1, a0), ...V(u1, b), ...V(u1, a), ...V(u1, a0), ...V(u1, b0), ...V(u1, b));
  }
  // the top
  const t = prof[prof.length - 1], t0 = [v0, t[1]];
  T.push(...V(u0, t0), ...V(u0, t), ...V(u1, t), ...V(u0, t0), ...V(u1, t), ...V(u1, t0));
  bag.add(mat, fromTriangles(fixWinding(T, P, y0, u0, u1, v0)));
}
/** Turn every triangle to face away from the moulding's core (a line at v0 − 0.3, mid-height). */
function fixWinding(T, P, y0, u0, u1, v0) {
  const out = [];
  for (let i = 0; i < T.length; i += 9) {
    const a = T.slice(i, i + 3), b = T.slice(i + 3, i + 6), c = T.slice(i + 6, i + 9);
    const n = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
    // the core: the nearest point on the axis line at v0 − 0.3 (same height as the triangle; ends pushed in)
    const ux = P(1, 0)[0] - P(0, 0)[0], uz = P(1, 0)[1] - P(0, 0)[1], o = P(0, v0 - 0.3);
    let u = (m[0] - o[0]) * ux + (m[2] - o[1]) * uz; u = Math.max(Math.min(u0, u1) + 0.05, Math.min(Math.max(u0, u1) - 0.05, u));
    const cx = o[0] + ux * u, cz = o[1] + uz * u, cy = m[1];
    let dx = m[0] - cx, dy = m[1] - cy, dz = m[2] - cz;
    if (Math.abs(n[1]) > 0.7 * Math.hypot(...n)) { dx = 0; dz = 0; dy = n[1]; }             // a top or underside: up or down as it lies
    const end = u <= Math.min(u0, u1) + 0.051 || u >= Math.max(u0, u1) - 0.051;
    if (end && Math.abs(n[0] * ux + n[2] * uz) > 0.7 * Math.hypot(...n)) { const s = u < (u0 + u1) / 2 ? -1 : 1; dx = ux * s; dz = uz * s; dy = 0; }
    if (n[0] * dx + n[1] * dy + n[2] * dz < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
  }
  return out;
}
/** A stepped merlon in the façade plane: tiers from y0, each th high, stepping in from both sides (or, half, only from `half` side: −1 left, +1 right stays vertical on the other). */
function merlon(bag, B, u0, u1, y0, tiers, th, v0, v1, half = 0) {
  const w = u1 - u0, st = half ? w / tiers : w / (2 * tiers);
  for (let k = 0; k < tiers; k++) {
    let a = u0, b = u1;
    if (half < 0) b = u1 - st * k; else if (half > 0) a = u0 + st * k; else { a = u0 + st * k; b = u1 - st * k; }
    bag.add(R, B(a, v0, b, v1, y0 + th * k, y0 + th * (k + 1)));
  }
}
/** A pilaster with its base and Nabataean capital (a plain block flaring out, two horns at its upper corners). */
function pilaster(bag, B, u, w, y0, y1, v0, v1) {
  bag.add(R, B(u - w / 2 - 0.06, v0, u + w / 2 + 0.06, v1 + 0.06, y0, y0 + 0.3));
  bag.add(R, B(u - w / 2, v0, u + w / 2, v1, y0 + 0.3, y1 - 0.55));
  bag.add(R, B(u - w / 2 + 0.03, v0, u + w / 2 - 0.03, v1 + 0.02, y1 - 0.55, y1 - 0.3));
  bag.add(R, B(u - w / 2 - 0.08, v0, u + w / 2 + 0.08, v1 + 0.08, y1 - 0.3, y1));
  for (const s of [-1, 1]) bag.add(R, B(u + s * (w / 2 - 0.02), v0, u + s * (w / 2 + 0.16), v1 + 0.1, y1 - 0.22, y1 - 0.02));
}

// the Egyptian cornice: fillet, torus, the gorge flaring out, the crowning fillet (v from the façade's face, y from its foot)
const GORGE = [[0, 0], [0.12, 0.03], [0.16, 0.12], [0.12, 0.22], [0.1, 0.27], [0.22, 0.5], [0.42, 0.78], [0.66, 1.02], [0.7, 1.08], [0.7, 1.3]];

export function crowTomb(el, { bag, col: C, lights }) {
  const [x, z] = el.at, y0 = el.y ?? 0, { P, B } = frame(x, z, el.dir, y0), W = el.w, H = el.h, back = el.back ?? 12, fl = el.flank ?? 1.5;
  const kind = el.kind === 'crowstep' ? 'step' : el.kind, fv = 0.35;                       // the façade stands 0.35 proud of the dressed rock
  const boxTop = el.boxTop ?? H * 0.68, yc = boxTop - 1.3;                                // the cornice's foot
  // the dressed rock the tomb is cut from, its foot below the ground
  // (hollowed: the door's passage and the chamber behind it, docs §16)
  const dw0 = Math.max(1.3, Math.min(2.3, W * 0.2)), dh0 = Math.min(4.4, Math.max(2.6, H * 0.3)), cw = Math.max(3.2, Math.min(5.0, W * 0.55)), cd = 4.0, chc = 0.4 + dh0 + 0.7;
  const voids = [{ u0: -dw0 / 2, v0: -1.2, u1: dw0 / 2, v1: 0, c: 0.4 + dh0 }, { u0: -cw / 2, v0: -cd, u1: cw / 2, v1: -1.2, c: chc }];
  {
    const U = [...new Set([-W / 2 - fl, W / 2 + fl, ...voids.flatMap((q) => [q.u0, q.u1])])].sort((a, b) => a - b), V = [...new Set([-back, 0, ...voids.flatMap((q) => [q.v0, q.v1])])].sort((a, b) => a - b);
    for (let i = 0; i + 1 < U.length; i++) for (let j = 0; j + 1 < V.length; j++) {
      const cu = (U[i] + U[i + 1]) / 2, cv = (V[j] + V[j + 1]) / 2, q = voids.find((w) => cu > w.u0 && cu < w.u1 && cv > w.v0 && cv < w.v1), ya = q ? q.c : -2;
      bag.add(R, B(U[i], V[j], U[i + 1], V[j + 1], ya, boxTop));
      // (the cell's thick segment: its centre line across the cell, its thickness along v; the façade's 0.35 on the front row)
      const vm = (V[j] + V[j + 1]) / 2 + (V[j + 1] === 0 ? fv / 2 : 0), th = V[j + 1] - V[j] + (V[j + 1] === 0 ? fv : 0);
      C.segment(P(U[i], vm), P(U[i + 1], vm), th, y0 + ya, y0 + H);
    }
  }
  // standing alone (not under a built cliff): the rock above, set back behind the crow-steps
  if (el.top) bag.add(R, B(-W / 2 - fl, -back, W / 2 + fl, -1.4, boxTop, el.top - y0));
  // the plinth and the front, the door's recess left open in it
  const dw = Math.max(1.3, Math.min(2.3, W * 0.2)), dh = Math.min(4.4, Math.max(2.6, H * 0.3)), pl = 0.4;
  for (const [a, b] of [[-W / 2 - 0.25, -dw / 2], [dw / 2, W / 2 + 0.25]]) bag.add(R, B(a, 0, b, fv + 0.25, -0.4, pl));
  const front = kind === 'hegr' ? yc - 1.1 : yc;
  bag.add(R, B(-W / 2, 0, -dw / 2, fv, pl, front)); bag.add(R, B(dw / 2, 0, W / 2, fv, pl, front));
  bag.add(R, B(-dw / 2, 0, dw / 2, fv, pl + dh, front));
  // the chamber's floor, a bench along its back and sides, a stone slab on a plinth (a burial), a lamp
  { const cu = cw / 2, cv = -cd;
    bag.add('flagstone', B(-cu, cv, cu, -1.2, -0.3, 0.04)); bag.add('flagstone', B(-dw / 2, -1.2, dw / 2, fv + 0.25, -0.3, 0.04));
    bag.add(R, B(-cu, cv, cu, cv + 0.55, 0.04, 0.42));
    for (const s of [-1, 1]) bag.add(R, B(s > 0 ? cu - 0.5 : -cu, cv + 0.55, s > 0 ? cu : -cu + 0.5, -1.7, 0.04, 0.42));
    // loculi: three low rectangular slots in the back wall above the bench, each in a plain frame
    for (let k = -1; k <= 1; k++) { const u = k * (cw / 3.2); bag.add('opening', B(u - 0.45, cv + 0.55 + 0.01, u + 0.45, cv + 0.55 + 0.03, 0.9, 1.6)); bag.add(R, B(u - 0.6, cv + 0.55, u - 0.45, cv + 0.62, 0.9, 1.7)); bag.add(R, B(u + 0.45, cv + 0.55, u + 0.6, cv + 0.62, 0.9, 1.7)); bag.add(R, B(u - 0.6, cv + 0.55, u + 0.6, cv + 0.62, 1.6, 1.7)); }
    const [lx, lz] = P(0, cv + 1.0); bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.005], [0.06, 0.025], [0.03, 0.04], [0.001, 0.035]], 10, null, lx, y0 + 0.42, lz)); bag.add('flame', B(-0.01 + 0, cv + 0.97, 0.01, cv + 1.03, 0.45, 0.49));
    lights.push({ at: [lx, y0 + 0.9, lz], color: '#ffb46b', intensity: 2.2, distance: 8 });
  }
  // the door's frame: jambs and lintel standing out a little, a sill
  for (const s of [-1, 1]) bag.add(R, B(s * dw / 2, fv, s * (dw / 2 + 0.32), fv + 0.1, pl, pl + dh + 0.32));
  bag.add(R, B(-dw / 2 - 0.32, fv, dw / 2 + 0.32, fv + 0.1, pl + dh, pl + dh + 0.32));
  if (kind === 'hegr') {
    // the door's own entablature, a little cornice on it
    bag.add(R, B(-dw / 2 - 0.5, fv, dw / 2 + 0.5, fv + 0.16, pl + dh + 0.32, pl + dh + 0.62));
    bag.add(R, B(-dw / 2 - 0.65, fv, dw / 2 + 0.65, fv + 0.3, pl + dh + 0.62, pl + dh + 0.8));
    // the corner pilasters, the architrave in two fasciae and the plain frieze over them
    for (const s of [-1, 1]) pilaster(bag, B, s * (W / 2 - 0.35), 0.7, pl, yc - 1.1, fv, fv + 0.22);
    bag.add(R, B(-W / 2 - 0.05, 0, W / 2 + 0.05, fv + 0.2, yc - 1.1, yc - 0.85));
    bag.add(R, B(-W / 2 - 0.08, 0, W / 2 + 0.08, fv + 0.27, yc - 0.85, yc - 0.6));
    bag.add(R, B(-W / 2, 0, W / 2, fv + 0.12, yc - 0.6, yc));
  } else if (kind === 'step') {
    // plain corner pilasters, their capitals simple blocks
    for (const s of [-1, 1]) { bag.add(R, B(s * (W / 2 - 0.6), fv, s * W / 2, fv + 0.14, pl, yc - 0.3)); bag.add(R, B(s * (W / 2 - 0.68), fv, s * (W / 2 + 0.05), fv + 0.22, yc - 0.3, yc)); }
  }
  // the Egyptian cornice
  moulding(bag, P, y0 + yc, GORGE.map(([v, y]) => [fv + v, y]), -W / 2 - 0.12, W / 2 + 0.12, 0);
  // the crow-steps
  const zone = H - boxTop, mv0 = 0.1, mv1 = 0.62;
  if (kind === 'pylon') {
    const n = Math.max(3, Math.round(W / 2.4)), mw = W / n;
    for (let i = 0; i < n; i++) merlon(bag, B, -W / 2 + i * mw + 0.06, -W / 2 + (i + 1) * mw - 0.06, boxTop, 3, zone / 3, mv0, mv1);
  } else if (kind === 'step') {
    // the lower row before a plain attic; the attic's fillet; the upper row on it
    const n = Math.max(3, Math.round(W / 2.4)), mw = W / n, h1 = zone * 0.42, ya = boxTop + h1 + 0.3;
    bag.add(R, B(-W / 2 + 0.3, -0.4, W / 2 - 0.3, mv0 - 0.02, boxTop, ya));
    for (let i = 0; i < n; i++) merlon(bag, B, -W / 2 + i * mw + 0.05, -W / 2 + (i + 1) * mw - 0.05, boxTop, 2, h1 / 2, mv0, mv1);
    bag.add(R, B(-W / 2 + 0.2, -0.4, W / 2 - 0.2, mv0 + 0.18, ya, ya + 0.22));
    const m = n - 1, w2 = (W - 1.2) / m;
    for (let i = 0; i < m; i++) merlon(bag, B, -W / 2 + 0.6 + i * w2 + 0.05, -W / 2 + 0.6 + (i + 1) * w2 - 0.05, ya + 0.22, 2, (H - ya - 0.22) / 2, mv0 - 0.05, mv1 - 0.1);
  } else {
    // the attic: its corner pilasters and fillet; the two great half-merlons on it, stepping down to the middle
    const ya = boxTop + zone * 0.38;
    bag.add(R, B(-W / 2 + 0.1, -0.4, W / 2 - 0.1, mv0, boxTop, ya));
    for (const s of [-1, 1]) bag.add(R, B(s * (W / 2 - 0.65), mv0, s * (W / 2 - 0.1), mv0 + 0.16, boxTop, ya - 0.2));
    bag.add(R, B(-W / 2, -0.4, W / 2, mv0 + 0.24, ya - 0.2, ya));
    const hw = Math.min(W * 0.32, 3.6);
    merlon(bag, B, -W / 2, -W / 2 + hw, ya, 4, (H - ya) / 4, mv0 - 0.1, mv1, -1);
    merlon(bag, B, W / 2 - hw, W / 2, ya, 4, (H - ya) / 4, mv0 - 0.1, mv1, 1);
  }
}

// ---- the Royal Tombs in the east cliff (docs/settlements/petra.md §10)

/** An engaged column at u standing at v (its axis; half sunk in the façade), with base, shaft and capital (floral, or the plain Nabataean block). */
function halfColumn(bag, P, y0, u, v, ya, yb, r, floral) {
  const [x, z] = P(u, v), capH = Math.min(1.4, (yb - ya) * 0.1);
  bag.add(R, lathe([[r * 1.35, 0], [r * 1.35, 0.15], [r * 1.12, 0.3], [r * 1.2, 0.42], [r, 0.55]], 12, null, x, y0 + ya, z));
  bag.add(R, lathe([[r, 0], [r * 0.9, yb - ya - 0.55 - capH]], 12, null, x, y0 + ya + 0.55, z));
  if (floral) floralCapital(bag, R, x, y0 + yb - capH, z, r * 0.9, capH);
  else { bag.add(R, lathe([[r * 0.9, 0], [r * 1.0, capH * 0.5], [r * 1.25, capH * 0.6], [r * 1.25, capH]], 12, null, x, y0 + yb - capH, z)); }
}
/** An entablature across the façade from u0 to u1 at y: architrave (two fasciae), frieze, cornice on a cyma. */
function entablature(bag, P, B, y0, u0, u1, y, fv, frieze = 0.9) {
  bag.add(R, B(u0 - 0.05, 0, u1 + 0.05, fv + 0.32, y, y + 0.35));
  bag.add(R, B(u0 - 0.08, 0, u1 + 0.08, fv + 0.4, y + 0.35, y + 0.7));
  bag.add(R, B(u0, 0, u1, fv + 0.3, y + 0.7, y + 0.7 + frieze));
  moulding(bag, P, y0 + y + 0.7 + frieze, [[fv + 0.3, 0], [fv + 0.45, 0.1], [fv + 0.62, 0.28], [fv + 0.95, 0.42], [fv + 0.95, 0.62]], u0 - 0.3, u1 + 0.3, 0);
  return y + 0.7 + frieze + 0.62;
}
/** A triangular pediment from u0 to u1 on y, rising rise: the tympanum and its two raking cornices. */
function pedimentU(bag, P, y0, u0, u1, y, rise, fv) {
  const T = [], V = (u, yy, v) => { const [x, z] = P(u, v); return [x, y0 + yy, z]; }, m = (u0 + u1) / 2;
  const tri = (v) => [V(u0, y, v), V(u1, y, v), V(m, y + rise, v)];
  const f = tri(fv + 0.2), b = tri(0);
  T.push(...f[0], ...f[1], ...f[2], ...b[0], ...b[2], ...b[1]);
  for (const [i, j] of [[0, 1], [1, 2], [2, 0]]) T.push(...f[i], ...b[i], ...b[j], ...f[i], ...b[j], ...f[j]);
  bag.add(R, fromTriangles(orientOut(T)));
  // the raking cornices: bars along each slope, standing out further
  const L = Math.hypot(m - u0, rise), th = 0.45;
  for (const s of [-1, 1]) {
    const ua = s < 0 ? u0 - 0.35 : m, ya = s < 0 ? y - 0.1 : y + rise + 0.05, ub = s < 0 ? m : u1 + 0.35, yb = s < 0 ? y + rise + 0.05 : y - 0.1;
    const nu = -(yb - ya) / L * th * (s < 0 ? 1 : 1), ny = Math.abs((ub - ua) / L * th);
    const q = [[ua, ya], [ub, yb], [ub + (s < 0 ? -nu : nu) * 0, yb + ny], [ua, ya + ny]], C = [];
    for (const v of [0, fv + 0.55]) C.push(q.map(([u, yy]) => V(u, yy, v)));
    const [a, c] = C, Tq = [];
    Tq.push(...c[0], ...c[1], ...c[2], ...c[0], ...c[2], ...c[3], ...a[0], ...a[2], ...a[1], ...a[0], ...a[3], ...a[2]);
    for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; Tq.push(...c[k], ...a[k], ...a[k2], ...c[k], ...a[k2], ...c[k2]); }
    bag.add(R, fromTriangles(orientOut(Tq)));
  }
}
function orientOut(T) {
  let cx = 0, cy = 0, cz = 0; const n = T.length / 3;
  for (let i = 0; i < T.length; i += 3) { cx += T[i] / n; cy += T[i + 1] / n; cz += T[i + 2] / n; }
  const out = [];
  for (let i = 0; i < T.length; i += 9) {
    const a = T.slice(i, i + 3), b = T.slice(i + 3, i + 6), c = T.slice(i + 6, i + 9);
    const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const mx = (a[0] + b[0] + c[0]) / 3 - cx, my = (a[1] + b[1] + c[1]) / 3 - cy, mz = (a[2] + b[2] + c[2]) / 3 - cz;
    if (nx * mx + ny * my + nz * mz < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
  }
  return out;
}
/** A framed door at u (width dw, height dh) from y: the recess with the dark door, jambs and lintel, and a crown (pediment, arch or flat cornice). */
function door(bag, P, B, y0, u, dw, dh, y, fv, crown) {
  bag.add(O, B(u - dw / 2, fv - 0.02, u + dw / 2, fv + 0.01, y, y + dh));
  for (const s of [-1, 1]) bag.add(R, B(u + s * dw / 2, fv, u + s * (dw / 2 + 0.35), fv + 0.14, y, y + dh + 0.35));
  bag.add(R, B(u - dw / 2 - 0.35, fv, u + dw / 2 + 0.35, fv + 0.14, y + dh, y + dh + 0.35));
  if (crown === 'pediment') { bag.add(R, B(u - dw / 2 - 0.6, fv, u + dw / 2 + 0.6, fv + 0.28, y + dh + 0.35, y + dh + 0.6)); pedimentU(bag, P, y0, u - dw / 2 - 0.6, u + dw / 2 + 0.6, y + dh + 0.6, dw * 0.28, fv); }
  else if (crown === 'arch') {
    const cy = y + dh + 0.35, r = dw / 2 + 0.6;
    for (let k = 0; k < 7; k++) { const a0 = Math.PI * k / 7, a1 = Math.PI * (k + 1) / 7, [ua, ya] = [u + Math.cos(a0) * r, cy + Math.sin(a0) * r], [ub, yb] = [u + Math.cos(a1) * r, cy + Math.sin(a1) * r], c = P((ua + ub) / 2, fv + 0.12); bag.add(R, orientedBox(P(ua, fv + 0.12), P(ub, fv + 0.12), 0.28, y0 + Math.min(ya, yb), y0 + Math.max(ya, yb) + 0.3)); void c; }
  } else bag.add(R, B(u - dw / 2 - 0.55, fv, u + dw / 2 + 0.55, fv + 0.3, y + dh + 0.35, y + dh + 0.6));
}

export function royalTomb(el, { bag, col: C }) {
  const [x, z] = el.at, y0 = el.y ?? 0, { P, B } = frame(x, z, el.dir, y0), W = el.w, H = el.h, back = el.back ?? 20, fl = el.flank ?? 6, top = (el.top ?? H + 15) - y0, fv = 0.4;
  bag.add(R, B(-W / 2 - fl, -back, W / 2 + fl, 0, -2, top));
  C.segment(P(-W / 2 - fl, (fv - back) / 2), P(W / 2 + fl, (fv - back) / 2), back + fv, y0 - 2, y0 + top);
  bag.add(R, B(-W / 2 - 0.3, 0, W / 2 + 0.3, fv + 0.4, -0.5, 0.5));                    // the plinth
  const kind = el.kind;
  if (kind === 'urn') {
    // the Urn Tomb: corner pilasters and two engaged columns, the frieze with four busts, the attic, the pediment and its urn
    const y1 = H * 0.55, dw = Math.min(3, W * 0.17), dh = Math.min(6.5, y1 * 0.45);
    bag.add(R, B(-W / 2, 0, W / 2, fv, 0.5, y1));
    for (const s of [-1, 1]) { pilaster(bag, B, s * (W / 2 - 0.5), 1.0, 0.5, y1, fv, fv + 0.3); halfColumn(bag, P, y0, s * W * 0.17, fv, 0.5, y1, 0.6, false); }
    door(bag, P, B, y0, 0, dw, dh, 0.5, fv, 'pediment');
    const ye = entablature(bag, P, B, y0, -W / 2, W / 2, y1, fv, 1.4);
    for (let i = 0; i < 4; i++) { const u = -W / 2 + W * (i + 0.5) / 4; bag.add(R, B(u - 0.6, fv + 0.3, u + 0.6, fv + 0.42, y1 + 0.85, y1 + 1.95)); const [bx, bz] = P(u, fv + 0.42); bag.add(R, lathe([[0.3, 0], [0.38, 0.25], [0.28, 0.55], [0.18, 0.6], [0.22, 0.8], [0.15, 0.95], [0.001, 1.0]], 8, null, bx, y0 + y1 + 0.9, bz)); }
    // the attic with its short pilasters
    const ya = ye + H * 0.12;
    bag.add(R, B(-W / 2 + 0.2, 0, W / 2 - 0.2, fv, ye, ya));
    for (let i = 0; i <= 6; i++) { const u = -W / 2 + 0.6 + i * (W - 1.2) / 6; bag.add(R, B(u - 0.3, fv, u + 0.3, fv + 0.18, ye, ya - 0.25)); }
    bag.add(R, B(-W / 2, 0, W / 2, fv + 0.35, ya - 0.25, ya));
    const rise = Math.min(H - ya - 2.2, W * 0.2);
    pedimentU(bag, P, y0, -W / 2 + 0.3, W / 2 - 0.3, ya, rise, fv);
    const [ux, uz] = P(0, fv * 0.5);
    bag.add(R, lathe([[0.7, 0], [0.5, 0.3], [0.95, 0.9], [1.0, 1.5], [0.7, 1.9], [0.4, 2.0], [0.5, 2.15], [0.001, 2.35]], 14, null, ux, y0 + ya + rise - 0.2, uz));
  } else if (kind === 'corinthian') {
    // the Corinthian Tomb: eight engaged columns below with a pediment over the middle; above, after the Khazneh, a tholos between two half-pediments
    const y1 = H * 0.42, dw = 2.4, dh = Math.min(5.5, y1 * 0.5);
    bag.add(R, B(-W / 2, 0, W / 2, fv, 0.5, y1));
    for (let i = 0; i < 8; i++) halfColumn(bag, P, y0, -W / 2 + 0.8 + i * (W - 1.6) / 7, fv, 0.5, y1, 0.48, true);
    for (const u of [-W * 0.32, 0, W * 0.32]) door(bag, P, B, y0, u, u ? 1.5 : dw, u ? dh * 0.7 : dh, 0.5, fv, u ? 'flat' : 'pediment');
    let ye = entablature(bag, P, B, y0, -W / 2, W / 2, y1, fv, 0.9);
    pedimentU(bag, P, y0, -W * 0.22, W * 0.22, ye, 2.4, fv);
    const yu = ye + 2.6, yt = H - 7;
    bag.add(R, B(-W / 2 + 0.4, 0, W / 2 - 0.4, fv, ye, yu));
    for (const s of [-1, 1]) {
      const uo = s * (W / 2 - 0.6), ui = s * (W / 2 - 7);
      for (const u of [uo, ui]) halfColumn(bag, P, y0, u, fv, yu, yt, 0.42, true);
      bag.add(R, B(Math.min(uo, ui) - 0.5, 0, Math.max(uo, ui) + 0.5, fv, yu, yt));
      entablature(bag, P, B, y0, Math.min(uo, ui) - 0.5, Math.max(uo, ui) + 0.5, yt, fv, 0.6);
      bag.add(R, B(Math.min(uo, ui), -0.2, Math.max(uo, ui), fv * 0.6, yt + 1.9, yt + 3.4));
    }
    const [tx, tz] = P(0, -0.2);
    bag.add(R, lathe([[2.6, 0], [2.6, yt - yu]], 20, null, tx, y0 + yu, tz));
    for (const a of [-80, -40, 0, 40, 80]) { const t = a * Math.PI / 180; halfColumn(bag, P, y0, Math.sin(t) * 3.2, -0.2 + Math.cos(t) * 3.2, yu, yt, 0.38, true); }
    bag.add(R, lathe([[3.7, 0], [3.7, 1.2], [0.001, 1.2]], 20, null, tx, y0 + yt, tz));
    bag.add(R, lathe([[3.4, 0], [0.8, 3.2], [0.001, 3.3]], 20, null, tx, y0 + yt + 1.2, tz));
    bag.add(R, lathe([[0.5, 0], [0.75, 0.8], [0.6, 1.5], [0.3, 1.7], [0.001, 1.9]], 12, null, tx, y0 + yt + 4.4, tz));
  } else {
    // the Palace Tomb: four doors in the lowest storey between engaged pilasters, the two in the middle twice as wide and under
    // pediments, the outer two under arches; above, a storey of eighteen engaged columns, and a third of pilasters, its upper left
    // corner built of masonry where the rock gave out
    const s1 = H * 0.36, s2 = H * 0.68, ys = [0.5, s1, s2, H - 1.2];
    bag.add(R, B(-W / 2, 0, W / 2, fv, 0.5, s1));
    for (let i = 0; i <= 12; i++) pilaster(bag, B, -W / 2 + 0.6 + i * (W - 1.2) / 12, 0.9, 0.5, s1 - 0.1, fv, fv + 0.28);
    const dh = Math.min(7, s1 * 0.5);
    for (const [u, crown, dw] of [[-W * 0.34, 'arch', 1.8], [-W * 0.115, 'pediment', 3.4], [W * 0.115, 'pediment', 3.4], [W * 0.34, 'arch', 1.8]]) door(bag, P, B, y0, u, dw, crown === 'arch' ? dh * 0.8 : dh, 0.5, fv + 0.28, crown);
    for (let s = 1; s < 3; s++) {
      const ya = entablature(bag, P, B, y0, -W / 2, W / 2, ys[s] - 1.6, fv, 0.3), yb = ys[s + 1] - (s === 2 ? 0 : 1.6), n = s === 1 ? 18 : 18;
      bag.add(R, B(-W / 2 + 0.3, 0, W / 2 - 0.3, fv, ya, yb));
      for (let i = 0; i < n; i++) { const u = -W / 2 + 1.2 + i * (W - 2.4) / (n - 1); if (s === 1) halfColumn(bag, P, y0, u, fv, ya, yb, 0.42, false); else pilaster(bag, B, u, 0.7, ya, yb - 0.1, fv, fv + 0.24); }
    }
    // the masonry at the upper left (as seen): coursed ashlar instead of the living rock (+u is the viewer's left)
    bag.add('sandstone_rose_ashlar', B(W / 2 - W * 0.28, -0.5, W / 2 + 0.02, fv + 0.27, s2 + 1, H - 1.25));
    bag.add(R, B(-W / 2 - 0.2, 0, W / 2 + 0.2, fv + 0.5, H - 1.2, H));
  }
}
