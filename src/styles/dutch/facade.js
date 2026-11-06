// Facade geometry: shapes laid on the front of a building in its own coordinates — u along the front
// (metres from its left end as one faces it), v up from the building's foot, d outward from the
// face — so that a gable, a window or a stoop is written once whichever way the house fronts.
// Convex prisms only (anything curved is built of strips); used by the Dutch and Victorian styles.

import { fromTriangles, orientOutward } from '../../core/geom.js';

/** The frame of a rect's face `f` ('n','s','e','w'): { w (face width), D (depth), at(u, d) → [x, z] }. */
export function faceFrame(rect, f) {
  const [x0, z0, x1, z1] = rect, along = f === 'n' || f === 's';
  const at = f === 's' ? (u, d) => [x0 + u, z1 + d] : f === 'n' ? (u, d) => [x1 - u, z0 - d] : f === 'e' ? (u, d) => [x1 + d, z1 - u] : (u, d) => [x0 - d, z0 + u];
  return { w: along ? x1 - x0 : z1 - z0, D: along ? z1 - z0 : x1 - x0, at };
}

/** A convex polygon `pts` ([[u, v], …]) extruded from d0 to d1 on frame F at base height y. */
export function prism(F, y, pts, d0, d1) {
  const P = (u, v, d) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const front = pts.map(([u, v]) => P(u, v, d1)), back = pts.map(([u, v]) => P(u, v, d0)), n = pts.length, t = [];
  for (let i = 1; i < n - 1; i++) { t.push(...front[0], ...front[i], ...front[i + 1]); t.push(...back[0], ...back[i + 1], ...back[i]); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...front[i], ...back[i], ...back[j], ...front[i], ...back[j], ...front[j]); }
  return fromTriangles(orientOutward(t));
}

/** A facade box: u0..u1, v0..v1, d0..d1. */
export const fbox = (F, y, u0, u1, v0, v1, d0, d1) => prism(F, y, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], d0, d1);

/**
 * A symmetric outline round u = uc, half-width hw(v) from v0 to v1 in `n` strips (trapezoids):
 * returns the strips' corner lists, ready for prism(). `edge` > 0 gives instead the thin bands
 * just outside the outline's two sides (copings), `edge` wide.
 */
export function outline(uc, hw, v0, v1, n, edge = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = v0 + (v1 - v0) * i / n, b = v0 + (v1 - v0) * (i + 1) / n, ha = hw(a), hb = hw(b);
    if (!edge) out.push([[uc - ha, a], [uc + ha, a], [uc + hb, b], [uc - hb, b]]);
    else for (const s of [-1, 1]) out.push([[uc + s * ha, a], [uc + s * (ha + edge), a], [uc + s * (hb + edge), b], [uc + s * hb, b]]);
  }
  return out;
}

/** A regular polygon of `k` sides (a disc, a boss, a scroll's eye) centred at (u, v), radius r. */
export const ngon = (u, v, r, k = 10) => Array.from({ length: k }, (_, i) => [u + Math.cos(i * 2 * Math.PI / k) * r, v + Math.sin(i * 2 * Math.PI / k) * r]);

/**
 * An arched opening's strips: a rectangle from v0 to the springing, then a round (or, `pointed`,
 * an equilateral pointed) head, total height hh, width wid, centred at u. `grow` widens it all (for
 * a surround drawn behind the opening).
 */
export function arch(u, v0, wid, hh, pointed = false, grow = 0) {
  const r = wid / 2, rise = pointed ? wid * 0.866 : r, vs = v0 + hh - rise, out = [];
  if (vs > v0) out.push([[u - r - grow, v0 - grow], [u + r + grow, v0 - grow], [u + r + grow, vs], [u - r - grow, vs]]);
  const hw = pointed ? (v) => Math.max(0.02, Math.sqrt(Math.max(0, wid * wid - (v - vs) ** 2)) - r) + grow : (v) => Math.max(0.02, Math.sqrt(Math.max(0, r * r - (v - vs) ** 2))) + grow;
  out.push(...outline(u, hw, vs, vs + rise + grow * 0.8, pointed ? 6 : 5));
  return out;
}

/** A convex polygon in plan ([[x, z]…]) extruded upward from y0 to y1 (piers, cutwaters, pedestals). */
export function vprism(pts, y0, y1) {
  const top = pts.map(([x, z]) => [x, y1, z]), bot = pts.map(([x, z]) => [x, y0, z]), n = pts.length, t = [];
  for (let i = 1; i < n - 1; i++) { t.push(...top[0], ...top[i], ...top[i + 1]); t.push(...bot[0], ...bot[i + 1], ...bot[i]); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...top[i], ...bot[i], ...bot[j], ...top[i], ...bot[j], ...top[j]); }
  return fromTriangles(orientOutward(t));
}
