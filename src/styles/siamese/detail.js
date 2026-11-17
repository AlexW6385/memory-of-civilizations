// Small ornament builders of the Siamese style (docs/settlements/ayutthaya.md §12.1–12.2): the lotus-petal band, the sao han pillars of a
// chedi's spire, corner pinnacles, the curved chofa horn, the patterned gable, the framed slit and the door leaves of a hall.
// Each takes the bag (and the collider where it stands in the way) and adds only to existing palette materials.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

/** A ring of lotus petals (bua khlum) round the foot of a bell: n kite-shaped petals leaning out from radius r0 at y, height h, each double-sided. */
export function lotusRing(bag, mat, cx, y, cz, r0, h, n = 24, lean = 0.22) {
  const t = [];
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5) / n * Math.PI * 2, w = Math.PI * 2 / n * 0.46, tip = [Math.cos(a), Math.sin(a)];
    const P = (r, aa, yy) => [cx + Math.cos(aa) * r, y + yy, cz + Math.sin(aa) * r];
    const b0 = P(r0, a - w, 0), b1 = P(r0, a + w, 0), m0 = P(r0 + lean * 0.5, a - w * 1.1, h * 0.45), m1 = P(r0 + lean * 0.5, a + w * 1.1, h * 0.45), tp = [cx + tip[0] * (r0 + lean), y + h, cz + tip[1] * (r0 + lean)];
    t.push(...b0, ...b1, ...m1, ...b0, ...m1, ...m0, ...m0, ...m1, ...tp);
    t.push(...b0, ...m1, ...b1, ...b0, ...m0, ...m1, ...m0, ...tp, ...m1);
  }
  bag.add(mat, fromTriangles(t));
}

/** A tiny four-sided pinnacle (a stupika's cap) at (x, y, z): base half-width a, height h. */
export function pinnacle(bag, mat, x, y, z, a, h) {
  bag.add(mat, lathe([[a * 1.414, 0], [a * 0.8 * 1.414, h * 0.35], [a * 0.35 * 1.414, h * 0.75], [0.001, h]], 4, null, 0, 0, 0).rotateY(Math.PI / 4).translate(x, y, z));
}

/**
 * The sao han: `n` slender pillars standing round the neck of the spire on the harmika's cornice at s0, radius R, height hh, a gilt collar on
 * their heads from which the spire rises. The pillars are small lathes (a base, a shaft, a capital).
 */
export function saoHan(bag, cx, s0, cz, R, hh, n = 12, pr = 0.11) {
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + Math.PI / n;
    bag.add('lime_plaster', lathe([[pr * 1.7, 0], [pr * 1.7, pr * 1.4], [pr * 1.05, pr * 2], [pr, hh - pr * 3], [pr * 1.5, hh - pr * 1.6], [pr * 1.7, hh]], 6, null, cx + Math.cos(a) * R, s0, cz + Math.sin(a) * R));
  }
  bag.add('gold', lathe([[R + pr * 2.2, hh], [R + pr * 2.2, hh + pr * 1.4], [R * 0.62, hh + pr * 2.6], [R * 0.5, hh + pr * 2.6], [R * 0.5, hh]], n * 2, null, cx, s0, cz));
}

/** The chofa: a curved horn rising from `p` along `d` (unit [dx, dz] in plan, toward the ridge's end) and curling up, as a chain of tapering rods. */
export function chofa(bag, mat, p, d, s = 1) {
  const pts = [[0, 0], [0.12, 0.5], [0.4, 0.95], [0.78, 1.2], [1.08, 1.12], [1.2, 0.9]].map(([u, v]) => [p[0] + d[0] * u * s, p[1] + v * s, p[2] + d[1] * u * s]);
  for (let i = 0; i + 1 < pts.length; i++) bag.add(mat, rod(pts[i], pts[i + 1], 0.1 * s * (1 - i * 0.14), 5));
  bag.add(mat, lathe([[0.001, 0], [0.07 * s, 0.05 * s], [0.001, 0.22 * s]], 5, null, pts[5][0], pts[5][1], pts[5][2]));
}

/**
 * The pattern of a gable board (na ban): rays fanning from a point under the apex and a central flame-leaf (lai kranok) row, all gilt, drawn
 * on the board's face at `u` (the ridge axis' coordinate) facing `dir` (+1/-1 along the axis). P(u, v, h) maps to the world.
 */
export function gablePattern(bag, P, u, dir, vm, half, rise) {
  const o = dir * 0.07, apx = rise * 0.62;
  for (let i = -3; i <= 3; i++) {
    const f = i / 3, top = [vm + f * half * 0.12, apx], bot = [vm + f * half * 0.62, rise * 0.12 + (1 - Math.abs(f)) * rise * 0.16];
    bag.add('gold', rod(P(u + o, top[0], top[1]), P(u + o, bot[0], bot[1]), 0.028, 4));
  }
  for (let k = 0; k < 4; k++) {
    const yy = rise * (0.7 + k * 0.07), w = half * (0.2 - k * 0.04);
    bag.add('gold', rod(P(u + o, vm - w, yy - w * 0.35), P(u + o, vm, yy + w * 0.6), 0.03, 4)); bag.add('gold', rod(P(u + o, vm + w, yy - w * 0.35), P(u + o, vm, yy + w * 0.6), 0.03, 4));
  }
  const base = P(u + o, vm, rise * 0.1), top = P(u + o, vm, rise * 0.62);
  bag.add('gold', rod(base, top, 0.04, 4));
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const hh = rise * (0.2 + k * 0.12), ww = half * (0.2 - k * 0.04);
    bag.add('gold', rod(P(u + o, vm, hh), P(u + o, vm + s * ww, hh + ww * 0.45), 0.025, 4));
  }
}

/**
 * A slit window's frame on a wall face: the wall runs along x (axis 'x') or z; the slit at coordinate c along it, on the face at coordinate f
 * facing `side` (+1 / -1), from y0 to y1. Stucco jambs, a header, a pointed pediment of gilt-edged stucco, a sill. The slit itself stays open.
 */
export function slitFrame(bag, axis, c, f, side, y0, y1, hw = 0.14, ped = true) {
  const R = (u0, u1, d0, d1, ya, yb) => (axis === 'x' ? box(c + u0, ya, f + Math.min(d0, d1) * side, c + u1, yb, f + Math.max(d0, d1) * side) : box(f + Math.min(d0, d1) * side, ya, c + u0, f + Math.max(d0, d1) * side, yb, c + u1));
  const j = 0.17, d = 0.09;
  bag.add('lime_plaster', R(-hw - j, -hw, 0, d, y0 - 0.1, y1 + 0.1)); bag.add('lime_plaster', R(hw, hw + j, 0, d, y0 - 0.1, y1 + 0.1));
  bag.add('lime_plaster', R(-hw - j - 0.08, hw + j + 0.08, 0, d + 0.04, y1 + 0.1, y1 + 0.26));
  bag.add('lime_plaster', R(-hw - j - 0.1, hw + j + 0.1, 0, d + 0.06, y0 - 0.26, y0 - 0.1));
  const P = (u, h, dd) => (axis === 'x' ? [c + u, h, f + dd * side] : [f + dd * side, h, c + u]);
  if (!ped) return;
  const w = hw + j + 0.08, t = [], tri = (a, b, e) => t.push(...a, ...b, ...e, ...a, ...e, ...b);
  tri(P(-w, y1 + 0.26, 0), P(w, y1 + 0.26, 0), P(0, y1 + 0.26 + w * 1.5, 0)); // a thin pediment: both faces, so it shows from either side
  const g = fromTriangles(t); bag.add('lime_plaster', g);
  bag.add('gold', rod(P(-w, y1 + 0.26, d), P(0, y1 + 0.26 + w * 1.5, d), 0.02, 4)); bag.add('gold', rod(P(w, y1 + 0.26, d), P(0, y1 + 0.26 + w * 1.5, d), 0.02, 4));
}

/** A pair of lacquered door leaves swung open against the jambs of a door in a wall along z at x = wx, centre z, width dw, height dh, opened toward `inward` (+1/-1 along x). */
export function doorLeaves(bag, wx, zc, dw, dh, f, inward) {
  for (const s of [-1, 1]) {
    const z0 = zc + s * (dw / 2 - 0.02), z1 = z0 + s * 0.11, xa = wx + inward * 0.5, xb = wx + inward * (0.5 + dw / 2 - 0.1);
    const lo = Math.min(z0, z1), hi = Math.max(z0, z1);
    bag.add('lacquer_red', box(Math.min(xa, xb), f, lo, Math.max(xa, xb), f + dh - 0.1, hi));
    for (let k = 0; k < 3; k++) { const y = f + 0.6 + k * (dh - 1.4) / 2.0; bag.add('gold', box(Math.min(xa, xb) + 0.1, y, s > 0 ? hi : lo - 0.02, Math.max(xa, xb) - 0.1, y + 0.32, s > 0 ? hi + 0.02 : lo)); }
  }
}
