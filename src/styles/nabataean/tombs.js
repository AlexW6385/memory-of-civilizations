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

import { fromTriangles } from '../../core/geom.js';
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

export function crowTomb(el, { bag, col: C }) {
  const [x, z] = el.at, y0 = el.y ?? 0, { P, B } = frame(x, z, el.dir, y0), W = el.w, H = el.h, back = el.back ?? 12, fl = el.flank ?? 1.5;
  const kind = el.kind === 'crowstep' ? 'step' : el.kind, fv = 0.35;                       // the façade stands 0.35 proud of the dressed rock
  const boxTop = el.boxTop ?? H * 0.68, yc = boxTop - 1.3;                                // the cornice's foot
  // the dressed rock the tomb is cut from, its foot below the ground
  bag.add(R, B(-W / 2 - fl, -back, W / 2 + fl, 0, -2, boxTop));
  C.segment(P(-W / 2 - fl, (fv - back) / 2), P(W / 2 + fl, (fv - back) / 2), back + fv, y0 - 2, y0 + H);
  // standing alone (not under a built cliff): the rock above, set back behind the crow-steps
  if (el.top) bag.add(R, B(-W / 2 - fl, -back, W / 2 + fl, -1.4, boxTop, el.top));
  // the plinth and the front, the door's recess left open in it
  const dw = Math.max(1.3, Math.min(2.3, W * 0.2)), dh = Math.min(4.4, Math.max(2.6, H * 0.3)), pl = 0.4;
  bag.add(R, B(-W / 2 - 0.25, 0, W / 2 + 0.25, fv + 0.25, -0.4, pl));
  const front = kind === 'hegr' ? yc - 1.1 : yc;
  bag.add(R, B(-W / 2, 0, -dw / 2, fv, pl, front)); bag.add(R, B(dw / 2, 0, W / 2, fv, pl, front));
  bag.add(R, B(-dw / 2, 0, dw / 2, fv, pl + dh, front));
  bag.add(R, B(-dw / 2, 0, dw / 2, 0.06, pl, pl + dh));                                   // the recess's back, the door in it
  bag.add(O, B(-dw / 2 + 0.12, 0.06, dw / 2 - 0.12, 0.09, pl, pl + dh - 0.12));
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
