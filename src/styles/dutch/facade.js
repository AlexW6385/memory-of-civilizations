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

/** A bar of square section t from point a to point b ([x, y, z]); `up` keeps one face level where it can. */
export function bar(a, b, t, t2 = t) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d) || 1, e = d.map((v) => v / L);
  let s = [e[2], 0, -e[0]]; if (Math.hypot(...s) < 1e-3) s = [1, 0, 0];
  const sl = Math.hypot(...s); s = s.map((v) => v / sl);
  const u = [e[1] * s[2] - e[2] * s[1], e[2] * s[0] - e[0] * s[2], e[0] * s[1] - e[1] * s[0]];
  const C = (p, i, j) => [p[0] + s[0] * i * t / 2 + u[0] * j * t2 / 2, p[1] + s[1] * i * t / 2 + u[1] * j * t2 / 2, p[2] + s[2] * i * t / 2 + u[2] * j * t2 / 2];
  const A = [C(a, -1, -1), C(a, 1, -1), C(a, 1, 1), C(a, -1, 1)], B = [C(b, -1, -1), C(b, 1, -1), C(b, 1, 1), C(b, -1, 1)], T = [];
  const q = (p0, p1, p2, p3) => T.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  q(A[0], A[1], A[2], A[3]); q(B[0], B[3], B[2], B[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(A[i], B[i], B[j], A[j]); }
  return fromTriangles(orientOutward(T));
}
/** A slab under four top corners ([x, y, z], in order round it), th thick (straight down). */
export function slab4(P, th) {
  const D = P.map(([x, y, z]) => [x, y - th, z]), T = [];
  const q = (p0, p1, p2, p3) => T.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  q(P[0], P[1], P[2], P[3]); q(D[0], D[3], D[2], D[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(P[i], D[i], D[j], P[j]); }
  return fromTriangles(orientOutward(T));
}

/** A polygon `pts` ([[d, v], …]) in the plane across a front, extruded along it from u0 to u1 (the end walls of a lean-to). */
export function sideprism(F, y, pts, u0, u1) {
  const P = (u, d, v) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const a = pts.map(([d, v]) => P(u0, d, v)), b = pts.map(([d, v]) => P(u1, d, v)), n = pts.length, t = [];
  for (let i = 1; i < n - 1; i++) { t.push(...a[0], ...a[i], ...a[i + 1]); t.push(...b[0], ...b[i + 1], ...b[i]); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...a[i], ...b[i], ...b[j], ...a[i], ...b[j], ...a[j]); }
  return fromTriangles(orientOutward(t));
}
