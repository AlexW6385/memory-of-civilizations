// The Qarawiyyin's hall (docs/settlements/fez.md §4.2 and §13): piers with moulded capitals, horseshoe arcades with carved spandrels and a
// string course, the great transverse arch and the muqarnas cupola before the mihrab, the bell chandeliers of the central nave.
import { box, lathe, rod } from '../../core/geom.js';
import { q4, dbl, poly } from './kit.js';
import * as F from '../mughal/furnish.js';

/** A pier of the hall at (x, z), floor y: plinth, shaft, necking, moulded abacus (it carries the springing at y + 4.2). */
export function pier(bag, col, x, z, y) {
  bag.add('stucco_cream', box(x - 0.45, y, z - 0.45, x + 0.45, y + 3.7, z + 0.45)); col.rect([x - 0.45, z - 0.45, x + 0.45, z + 0.45], y, y + 4.4);
  bag.add('tile_cream', box(x - 0.47, y + 0.02, z - 0.47, x + 0.47, y + 1.3, z + 0.47));            // the tiled dado round the foot
  bag.add('tile_turquoise', box(x - 0.48, y + 1.3, z - 0.48, x + 0.48, y + 1.36, z + 0.48));
  bag.add('stucco_warm', box(x - 0.5, y + 3.7, z - 0.5, x + 0.5, y + 3.82, z + 0.5));                // the necking
  bag.add('stucco_cream', box(x - 0.54, y + 3.82, z - 0.54, x + 0.54, y + 3.96, z + 0.54));          // the echinus
  bag.add('stucco_warm', box(x - 0.58, y + 3.96, z - 0.58, x + 0.58, y + 4.22, z + 0.58));           // the abacus
  bag.add('stucco_cream', box(x - 0.5, y + 4.22, z - 0.5, x + 0.5, y + 4.3, z + 0.5));
}

/**
 * An arcade along z at X from za to zb on piers at the stations zs: the wall 0.5 thick, horseshoe arches between the piers,
 * a rim of moulding round each arch, a carved lozenge in each spandrel, a string course under the top. Faces: both sides.
 */
/** 1 ± 3 % from a place: the hand-cut mouldings are not one shape repeated (identical pieces would be instanced, a draw each; varied ones merge into one fine-detail mesh). */
const jit = (x, y) => { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return 1 + 0.06 * (h - Math.floor(h) - 0.5); };
export function arcade(bag, X, za, zb, zs, y, hc = 4.2, top = 6.4) {
  const th = 0.5, t2 = th / 2, ys = y + hc, yt = y + top, tri = [], deco = [], rods = [], L = zb - za;
  const P = (u, yy, o) => [X + o, yy, za + u];
  const q = (a, b, c, d) => q4(tri, a, b, c, d);
  const strip = (ua, ya, ub, yb) => { for (const o of [-t2, t2]) q(P(ua, ya, o), P(ub, yb, o), P(ub, yt, o), P(ua, yt, o)); };
  const under = (ua, ya, ub, yb) => q(P(ua, ya, t2), P(ub, yb, t2), P(ub, yb, -t2), P(ua, ya, -t2));
  const us = zs.map((z) => z - za), spans = [];
  let s = 0; for (const u of us) { spans.push([s, u - 0.45]); s = u + 0.45; } spans.push([s, L]);
  q(P(0, yt, -t2), P(L, yt, -t2), P(L, yt, t2), P(0, yt, t2));
  for (const [ua, ub] of spans) {
    if (ub - ua < 1.4) { if (ub > ua) strip(ua, y, ub, y); continue; }
    const r = (ub - ua) / 2, uc = (ua + ub) / 2, K = 16, pts = [[ua, ys]];
    for (let k = 0; k <= K; k++) { const t = Math.PI - Math.PI * k / K; pts.push([uc + Math.cos(t) * r * (1 + 0.06 * Math.sin(t)), ys + 0.25 + Math.sin(t) * r * 0.95]); }
    pts.push([ub, ys]);
    for (let k = 0; k + 1 < pts.length; k++) { strip(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]); under(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]); }
    // the moulding round the extrados: a rod a little proud of the face, and a second, lighter one behind it
    for (let k = 0; k < K; k++) { const a = pts[k + 1], b = pts[k + 2]; for (const o of [-t2 - 0.012, t2 + 0.012]) { rods.push([P(a[0], a[1] + 0.1, o), P(b[0], b[1] + 0.1, o), 0.032 * jit(X + o, a[0] + k)]); rods.push([P(a[0], a[1] + 0.22, o), P(b[0], b[1] + 0.22, o), 0.016 * jit(X - o, a[0] - k)]); } }
  }
  // the spandrels: a carved lozenge over each pier (the darj wa ktaf of the stucco), two faces
  for (const u of us) {
    const cy = ys + 1.25, h = 0.42, w = 0.3;
    for (const o of [-t2 - 0.02, t2 + 0.02]) {
      const d = [P(u - w, cy, o), P(u, cy - h, o), P(u + w, cy, o), P(u, cy + h, o)], c = P(u, cy, o), n = [[0, 1], [1, 2], [2, 3], [3, 0]];
      for (const [i, j] of n) (o < 0 ? deco.push(...c, ...d[j], ...d[i]) : deco.push(...c, ...d[i], ...d[j]));
      const r2 = 0.5, d2 = [P(u - w * r2, cy, o * 1.0 + (o < 0 ? -0.012 : 0.012)), P(u, cy - h * r2, o + (o < 0 ? -0.012 : 0.012)), P(u + w * r2, cy, o + (o < 0 ? -0.012 : 0.012)), P(u, cy + h * r2, o + (o < 0 ? -0.012 : 0.012))], c2 = P(u, cy, o + (o < 0 ? -0.012 : 0.012));
      for (const [i, j] of n) (o < 0 ? bag.add('stucco_cream', dbl([...c2, ...d2[j], ...d2[i]])) : bag.add('stucco_cream', dbl([...c2, ...d2[i], ...d2[j]])));
    }
  }
  bag.add('stucco_cream', dbl(tri));
  if (deco.length) bag.add('stucco_warm', dbl(deco));
  for (const [a, b, rr] of rods) bag.add('stucco_warm', rod(a, b, rr, 4));
  // the string course: a band of moulding along both faces just under the top, with a cornice on its upper edge
  bag.add('stucco_warm', box(X - t2 - 0.04, yt - 0.34, za, X + t2 + 0.04, yt - 0.2, zb));
  bag.add('stucco_cream', box(X - t2 - 0.07, yt - 0.2, za, X + t2 + 0.07, yt, zb));
}

/** One horseshoe arch across x from x0 to x1 at z in a wall 0.5 thick, springing at ys, the wall rising to yt (the great arch before the cupola). */
export function greatArch(bag, x0, x1, z, ys, yt) {
  const th = 0.6, t2 = th / 2, r = (x1 - x0) / 2, uc = (x0 + x1) / 2, K = 22, tri = [], pts = [[x0, ys]], rods = [];
  for (let k = 0; k <= K; k++) { const t = Math.PI - Math.PI * k / K; pts.push([uc + Math.cos(t) * r * (1 + 0.06 * Math.sin(t)), ys + 0.3 + Math.sin(t) * r * 0.93]); }
  pts.push([x1, ys]);
  const P = (u, yy, o) => [u, yy, z + o];
  for (let k = 0; k + 1 < pts.length; k++) {
    const [ua, ya] = pts[k], [ub, yb] = pts[k + 1];
    for (const o of [-t2, t2]) q4(tri, P(ua, ya, o), P(ub, yb, o), P(ub, yt, o), P(ua, yt, o));
    q4(tri, P(ua, ya, t2), P(ub, yb, t2), P(ub, yb, -t2), P(ua, ya, -t2));
  }
  bag.add('stucco_cream', dbl(tri));
  // the archivolt: three mouldings in steps round the extrados, a rectangular alfiz of tile over them
  for (let k = 1; k + 2 < pts.length; k++) { const a = pts[k], b = pts[k + 1]; for (const o of [-t2 - 0.015, t2 + 0.015]) { bag.add('stucco_warm', rod(P(a[0], a[1] + 0.12, o), P(b[0], b[1] + 0.12, o), 0.05, 4)); bag.add('tile_green', rod(P(a[0], a[1] + 0.3, o), P(b[0], b[1] + 0.3, o), 0.028, 4)); } }
  for (const o of [-t2 - 0.02, t2 + 0.02]) {
    const ya = ys + 0.3 + r * 0.93 + 0.55;
    bag.add('tile_turquoise', box(x0 - 0.35, ys, o < 0 ? z + o - 0.02 : z + o, x0 - 0.2, yt - 0.1, o < 0 ? z + o : z + o + 0.02));
    bag.add('tile_turquoise', box(x1 + 0.2, ys, o < 0 ? z + o - 0.02 : z + o, x1 + 0.35, yt - 0.1, o < 0 ? z + o : z + o + 0.02));
    if (ya < yt) bag.add('tile_turquoise', box(x0 - 0.35, ya, o < 0 ? z + o - 0.02 : z + o, x1 + 0.35, ya + 0.14, o < 0 ? z + o : z + o + 0.02));
  }
  bag.add('stucco_warm', box(x0 - 0.5, yt - 0.34, z - t2 - 0.04, x1 + 0.5, yt - 0.2, z + t2 + 0.04));
  bag.add('stucco_cream', box(x0 - 0.5, yt - 0.2, z - t2 - 0.07, x1 + 0.5, yt, z + t2 + 0.07));
  void rods;
}

/**
 * The muqarnas cupola over the bay rect R = [x0, z0, x1, z1] from y0: seven corbelled tiers of plaster, each stepping in 0.6 m and carrying
 * a row of stalactite cells under its inner edge, closed by a painted cap. Returns the cap's height.
 */
export function muqarnas(bag, R, y0, tiers = 7) {
  const step = 0.6, hh = 0.36, th = 2 * step, cells = [], cream = [];
  for (let j = 0; j < tiers; j++) {
    const i0 = j * step, [xa, za, xb, zb] = [R[0] + i0, R[1] + i0, R[2] - i0, R[3] - i0], ya = y0 + j * (hh + 0.004), yb = ya + hh;
    const d = Math.min(th, (xb - xa) / 2 - 0.01);
    cream.push([xa, ya, za, xb, yb, za + d], [xa, ya, zb - d, xb, yb, zb], [xa, ya, za + d, xa + d, yb, zb - d], [xb - d, ya, za + d, xb, yb, zb - d]);
    // the cells hang under the tier's inner half (the band the tier below does not cover), staggered tier by tier
    const ia = i0 + step, [ca, cb, cc, cd] = [R[0] + ia, R[1] + ia, R[2] - ia, R[3] - ia], pitch = 0.5, off = (j % 2) * pitch / 2;
    for (let u = ca + 0.2 + off; u < cc - 0.2; u += pitch) { cells.push([u - 0.15, ya - 0.26, cb - 0.02, u + 0.15, ya, cb + 0.3 - 0.02]); cells.push([u - 0.15, ya - 0.26, cd - 0.28, u + 0.15, ya, cd + 0.02]); }
    for (let u = cb + 0.2 + off; u < cd - 0.2; u += pitch) { cells.push([ca - 0.02, ya - 0.26, u - 0.15, ca + 0.28, ya, u + 0.15]); cells.push([cc - 0.28, ya - 0.26, u - 0.15, cc + 0.02, ya, u + 0.15]); }
  }
  for (const c of cream) bag.add('stucco_cream', box(c[0], c[1], c[2], c[3], c[4], c[5]));
  cells.forEach((c, i) => bag.add(i % 3 ? 'stucco_warm' : 'stucco_cream', box(...c)));
  const i0 = tiers * step, yc = y0 + tiers * (hh + 0.004);
  bag.add('ceiling_painted', box(R[0] + i0 - 0.05, yc, R[1] + i0 - 0.05, R[2] - i0 + 0.05, yc + 0.1, R[3] - i0 + 0.05));
  return yc + 0.1;
}

/**
 * A chandelier cast from a bell (the Qarawiyyin's of 1337 is the bell of a church, hung as a lamp): a chain, a bronze bell mouth-down, two rings
 * of oil-lamp cups under it, a bronze boss. x, z the axis; yTop the ceiling it hangs from, yLow the lowest point; r the large ring's radius.
 */
export function bellLamp(bag, lights, x, z, yTop, yLow, r = 1.1) {
  const yb = yLow + 0.55, ring = (rr, yy, n) => {
    bag.add('bronze', lathe([[rr - 0.04, 0], [rr + 0.04, 0], [rr + 0.04, 0.05], [rr - 0.04, 0.05], [rr - 0.04, 0]], 16, null, x, yy, z));
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr; bag.add('glass_lamp', lathe([[0.001, 0.05], [0.03, 0.05], [0.04, 0.1], [0.032, 0.13], [0.001, 0.13]], 6, null, px, yy, pz)); }
  };
  bag.add('iron', rod([x, yb + 0.5, z], [x, yTop, z], 0.012, 3));
  bag.add('bronze', lathe([[0.001, 0.5], [0.07, 0.5], [0.16, 0.42], [0.3, 0.22], [0.36, 0.06], [0.38, 0], [0.3, 0], [0.24, 0.1], [0.12, 0.3], [0.001, 0.42]], 14, null, x, yb, z));
  ring(r, yLow, 20); ring(r * 0.62, yLow + 0.32, 12);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; bag.add('bronze', rod([x + Math.cos(a) * 0.3, yb + 0.05, z + Math.sin(a) * 0.3], [x + Math.cos(a) * r, yLow + 0.05, z + Math.sin(a) * r], 0.01, 3)); }
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.1], [0.001, 0.14]], 8, null, x, yLow - 0.14, z));
  F.mosqueLamp(bag, lights, x, yLow + 0.1, z, yLow + 0.4, { k: 1.0, glow: 4, reach: 14 });
}

/** A minbar of cedar: seven steps against the qibla wall, side panels with inlaid lozenges, a door arch at the foot, a small canopy over the seat. */
export function minbar(bag, col, x0, x1, zw, y) {
  const n = 7, rise = 0.24, run = 0.3, zf = zw - run * n;
  for (let k = 0; k < n; k++) bag.add('timber', box(x0, y + k * rise, zw - run * (n - k), x1, y + (k + 1) * rise, zw - 0.01));
  const seat = y + n * rise;
  bag.add('timber', box(x0, seat, zw - 1.1, x1, seat + 1.3, zw - 0.01));                  // the seat's block
  col.rect([x0, zf, x1, zw], y, seat + 1.3);
  for (const [a, b] of [[x0 - 0.06, x0], [x1, x1 + 0.06]]) {
    // the side panels follow the steps' slope: a board of cedar and a carved lozenge field
    const t = []; q4(t, [a, y + 0.1, zf], [a, y + 0.1, zw], [a, seat + 1.0, zw - 0.2], [a, seat + 0.5, zf + 0.5]);
    bag.add('cedar', box(a, y, zf, b, y + 0.12, zw)); bag.add('cedar', box(a, y + 0.12, zw - 1.2, b, seat + 1.4, zw - 0.01));
    for (let k = 0; k < n; k++) bag.add('cedar', box(a, y + k * rise + 0.12, zw - run * (n - k), b, y + (k + 1) * rise + 0.5, zw - run * (n - k) + 0.06));
    // a rail along the slope (as stepped posts and a sloping rod) and the inlaid lozenges
    bag.add('cedar', rod([(a + b) / 2, y + 0.9, zf], [(a + b) / 2, seat + 1.1, zw - 1.2], 0.035, 4));
    for (let k = 1; k < n; k += 2) { const zc = zw - run * (n - k) + 0.1, yc = y + k * rise + 0.3, d = [[a, yc, zc - 0.1], [a, yc + 0.1, zc], [a, yc, zc + 0.1], [a, yc - 0.1, zc]]; void d; bag.add('ivory', box(a - 0.005, yc - 0.06, zc - 0.06, a, yc + 0.06, zc + 0.06)); }
  }
  // the door arch at the foot and the canopy
  bag.add('cedar', box(x0 + 0.1, y + 0.1, zf - 0.04, x1 - 0.1, y + 1.5, zf)); bag.add('wood_dark', box(x0 + 0.25, y + 0.2, zf - 0.07, x1 - 0.25, y + 1.3, zf - 0.04));
  for (const xx of [x0 + 0.04, x1 - 0.04]) bag.add('cedar', box(xx - 0.04, seat + 1.3, zw - 1.0, xx + 0.04, seat + 2.4, zw - 0.9));
  bag.add('cedar', box(x0 - 0.06, seat + 2.4, zw - 1.1, x1 + 0.06, seat + 2.5, zw - 0.01));
  const t = [], xm = (x0 + x1) / 2;
  q4(t, [x0 - 0.1, seat + 2.5, zw - 1.15], [x1 + 0.1, seat + 2.5, zw - 1.15], [x1 + 0.1, seat + 2.95, zw - 0.6], [x0 - 0.1, seat + 2.95, zw - 0.6]);
  bag.add('tile_green', dbl(t)); void xm; void poly;
}
