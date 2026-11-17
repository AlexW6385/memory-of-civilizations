// The bracket sets of a Nara-period hall (docs/settlements/nara.md §18): the Japanese three-step set (mitesaki) on every
// column — a great block on the column head, three steps of arms projecting one after another from the wall plane, each step
// carrying its small bearing blocks, a tail rafter (odaruki) passing through the second step and carrying a long tie arm
// (tooshi-hijiki) with the blocks of the third step under the eave purlin [stated: JAANUS "mitesaki-tokyo"] — and between the
// columns the A-shaped splayed strut (hitoji-warizuka) of the 8th century standing on the beam, carrying a two-step set
// [inferred: the Nara type, after Tōshōdai-ji's Golden Hall]. The arms are plain flat timbers with the lower corners cut round, the blocks
// tapered below (the Tang set's flowery cantilevers are gone). Everything is in units of K, the hall's scale.

import { fromTriangles, orientOutward } from '../../core/geom.js';
import { hexa } from '../chinese/index.js';

/** A convex polygon pts [[a, y]…] extruded ±hw along the third axis; P(a, y, t) maps to the world. */
function prism(out, pts, hw, P) {
  const tris = [], n = pts.length;
  const F = pts.map(([a, y]) => P(a, y, -hw)), B = pts.map(([a, y]) => P(a, y, hw));
  for (let i = 1; i < n - 1; i++) tris.push(...F[0], ...F[i], ...F[i + 1], ...B[0], ...B[i + 1], ...B[i]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; tris.push(...F[i], ...B[i], ...B[j], ...F[i], ...B[j], ...F[j]); }
  out.push(...orientOutward(tris));
}
/** An arm from a0 to a1, bottom y0, height h, its lower corners cut round by r. */
function arm(a0, a1, y0, h, r) {
  const pts = [[a0, y0 + h]];
  for (let i = 0; i <= 3; i++) { const a = i / 3 * Math.PI / 2; pts.push([a0 + r * (1 - Math.cos(a)), y0 + r * (1 - Math.sin(a))]); }
  for (let i = 3; i >= 0; i--) { const a = i / 3 * Math.PI / 2; pts.push([a1 - r * (1 - Math.cos(a)), y0 + r * (1 - Math.sin(a))]); }
  pts.push([a1, y0 + h]);
  return pts;
}

/** A set { at [x, z], dir (outward, unit), kind 'column' | 'corner' | 'between', y (the beam's top) } at scale K. */
export function naraBracket(el, { bag }, K) {
  const [x, z] = el.at, n = el.dir, u = [-n[1], n[0]], y = el.y, kind = el.kind || 'column';
  const A = [], B = [];
  const along = (s, yy, t) => [x + n[0] * s + u[0] * t, yy, z + n[1] * s + u[1] * t];       // the world point
  const alongS = (a, yy, t) => along(a * K, y + yy * K, t * K);                              // an outline along s (the wall's normal), width in t
  const alongT = (a, yy, s) => along(s * K, y + yy * K, a * K);                              // an outline along t (the wall), at s
  /** an arm along s from a0 to a1 at tier bottom y0, thickness 2hw, centred on t = 0 */
  const armS = (a0, a1, y0, h, hw, r = 0.1) => prism(A, arm(a0, a1, y0, h, r), hw * K, alongS);
  /** an arm along t (a lateral arm) at s, from a0 to a1 */
  const armT = (a0, a1, y0, h, s, hw, r = 0.1) => prism(A, arm(a0, a1, y0, h, r), hw * K, (a, yy, t) => alongT(a, yy, s * K + t));
  /** a block at (s, t), bottom y0, height h, half-width hw: tapered in its lower part */
  const blk = (s, t, y0, h, hw) => {
    const q = h * 0.4, b = hw * 0.72, P = (a, c, yy) => along(s * K + a * K, y + yy * K, t * K + c * K);
    hexa(B, [P(-b, -b, y0), P(b, -b, y0), P(b, b, y0), P(-b, b, y0)], [P(-hw, -hw, y0 + q), P(hw, -hw, y0 + q), P(hw, hw, y0 + q), P(-hw, hw, y0 + q)]);
    hexa(B, [P(-hw, -hw, y0 + q), P(hw, -hw, y0 + q), P(hw, hw, y0 + q), P(-hw, hw, y0 + q)], [P(-hw, -hw, y0 + h), P(hw, -hw, y0 + h), P(hw, hw, y0 + h), P(-hw, hw, y0 + h)]);
  };
  const T = 0.34, st = 0.62;                               // arm height, the step of the projection
  if (kind !== 'between') {
    // the great block on the column's head, the long arm along the wall over it with a block at each end
    blk(0, 0, 0, 0.5, 0.56);
    armT(-1.35, 1.35, 0.5, T, 0, 0.1);
    for (const t of [-1.05, 1.05]) blk(0, t, 0.5 + T, 0.3, 0.24);
    blk(0, 0, 0.5 + T, 0.3, 0.26);
    // first step: the arm out from the column, its tail inside; a block at its tip, with a lateral arm across it
    armS(-st, st, 0.5 + T + 0.3, T, 0.1);
    armT(-0.62, 0.62, 0.5 + T + 0.3, T - 0.02, st, 0.09);
    for (const t of [-0.5, 0, 0.5]) blk(st, t, 0.5 + 2 * T + 0.3, 0.3, 0.22);
    // second step: out another step, with blocks at its tip and at its inner end
    const y2 = 0.5 + 2 * T + 0.6;
    armS(-2 * st, 2 * st, y2, T, 0.1);
    for (const s of [-2 * st, 2 * st]) blk(s, 0, y2 + T, 0.3, 0.24);
    armT(-0.8, 0.8, y2, T - 0.02, 2 * st, 0.09);
    for (const t of [-0.62, 0.62]) blk(2 * st, t, y2 + T, 0.3, 0.2);
    // the tail rafter: from deep inside, resting on the second step's tip block, sloping down toward its end
    const yb0 = y2 + T + 0.3, slope = 0.12, tip = 3 * st + 0.32;
    prism(A, [[-2.4, yb0 + slope * (2 * st + 2.4)], [tip, yb0 - slope * (tip - 2 * st)], [tip, yb0 - slope * (tip - 2 * st) + T], [-2.4, yb0 + slope * (2 * st + 2.4) + T]], 0.11 * K, alongS);
    // third step: the long tie arm on the rafter's end, its three blocks under the eave purlin
    const y3 = yb0 - slope * (3 * st - 2 * st) + T;
    armT(-1.3, 1.3, y3, T * 0.9, 3 * st, 0.1);
    for (const t of [-1.0, 0, 1.0]) blk(3 * st, t, y3 + T * 0.9, 0.3, 0.25);
    // the narrow arms along the third step joining the blocks to the second (shirin)
    armS(2 * st, 3 * st + 0.2, y3 + T * 0.9 + 0.02, 0.18, 0.06, 0.05);
  } else {
    // between the columns: the A-shaped strut on the beam, a flat plank under its feet, a two-step set on its head
    prism(A, [[-0.95, 0], [0.95, 0], [0.95, 0.16], [-0.95, 0.16]], 0.2 * K, alongT);
    for (const sd of [-1, 1]) prism(A, [[sd * 0.78, 0.16], [sd * 0.5, 0.16], [sd * 0.05, 0.92], [sd * 0.2, 0.92]], 0.15 * K, alongT);
    armT(-0.85, 0.85, 0.92, T, 0, 0.1);
    for (const t of [-0.6, 0, 0.6]) blk(0, t, 0.92 + T, 0.3, 0.22);
    armS(-st, st, 0.92 + T + 0.3, T, 0.1);
    for (const s of [st]) blk(s, 0, 0.92 + 2 * T + 0.3, 0.3, 0.22);
    armS(-2 * st, 2 * st, 0.92 + 2 * T + 0.6, T, 0.1);
    for (const s of [2 * st, -2 * st]) blk(s, 0, 0.92 + 3 * T + 0.6, 0.3, 0.24);
  }
  bag.add('timber_red', fromTriangles(A));
  bag.add('timber_red', fromTriangles(B));
}
