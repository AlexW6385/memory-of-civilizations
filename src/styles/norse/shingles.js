// Roof shingles of the stave church (docs/settlements/norse-borgund.md "Round 2: the roofs' shingles"): every roof
// of Borgund is clad in courses of overlapping tarred pine shingles whose lower ends are cut to a point, each course
// shifted half a shingle against the one below. Here each shingle is a real plate (a pointed pentagon) lying on the
// roof's plane, its point standing a little off the boards and its upper end laid down on them, so the courses read
// as steps with a shadow under every point. Three triangles a shingle; all of one material, so they merge with the
// roof's own mesh.

import { fromTriangles } from '../../core/geom.js';

const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/**
 * Shingles over a surface. P(s, t) → [x, y, z] maps s (along the eave, 0..1) and t (up the slope, 0..1) onto the roof's
 * top surface; N(s, t) → unit outward normal; sw, sl the shingle's exposed width and the slope's length in metres
 * (their ratio fixes the columns and the courses). Options: w (shingle width), e (exposure per course), L (plate
 * length), tip (the point's length), hi, lo (how far the point and the upper end stand off the surface), closed
 * (s wraps round: a cone), seed.
 */
export function shingleSurface(bag, mat, P, N, width, slopeLen, { w = 0.15, e = 0.17, L = 0.36, tip = 0.08, hi = 0.09, lo = 0.008, closed = false, seed = 1, tMax = 1 } = {}) {
  const rand = rng(seed), tris = [];
  const rows = Math.max(1, Math.ceil(slopeLen * tMax / e - 0.3));
  const put = (a, b, c, n) => {                                  // a triangle, wound to face along n
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const dot = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
    if (dot >= 0) tris.push(...a, ...b, ...c); else tris.push(...a, ...c, ...b);
  };
  for (let r = 0; r < rows; r++) {
    const t0 = Math.min(1, r * e / slopeLen), tT = Math.min(tMax, t0 + L / slopeLen), tS = Math.min(tT, t0 + tip / slopeLen);
    if (tT - t0 < 0.04 / slopeLen) continue;
    const nc = Math.max(1, Math.round(width(Math.min(1, t0 + 0.5 * e / slopeLen)) / w)), shift = r % 2 ? 0.5 : 0;
    for (let c = closed ? 0 : -1; c < nc; c++) {
      let s0 = (c + shift) / nc + 0.0015, s1 = (c + 1 + shift) / nc - 0.0015;
      if (!closed) { s0 = Math.max(0, s0); s1 = Math.min(1, s1); if (s1 - s0 < 0.18 / nc) continue; }
      const sm = (s0 + s1) / 2, j = (rand() - 0.5) * 0.01, ph = hi + j, tipJ = (rand() - 0.5) * 0.4 * tip / slopeLen;
      const off = (t) => ph - (ph - lo) * Math.min(1, (t - t0) / (L / slopeLen));
      const at = (s, t, d) => { const p = P(s, t), n = N(s, t); return [p[0] + n[0] * d, p[1] + n[1] * d, p[2] + n[2] * d]; };
      const nm = N(sm, tS), tp = at(sm, Math.max(0, t0 + tipJ), ph), sl = at(s0, tS, off(tS)), sr = at(s1, tS, off(tS)), tl = at(s0, tT, off(tT)), tr = at(s1, tT, off(tT));
      put(sl, sr, tr, nm); put(sl, tr, tl, nm); put(tp, sr, sl, nm);
    }
  }
  if (tris.length) bag.add(mat, fromTriangles(tris));
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const len = (a, b) => Math.hypot(...sub(a, b));

/**
 * A plane (or trapezoid, or triangle where R0 = R1) roof face: E0 E1 along the eave, R0 R1 along the ridge, E0 under R0,
 * these the top surface's corners. `out` is a direction the face looks towards (the roof's outside). The courses are
 * clipped to the face; the shingles' points are at the eave.
 */
export function shinglePlane(bag, mat, E0, E1, R1, R0, out = [0, 1, 0], opt = {}) {
  let n = norm(cross(sub(E1, E0), sub(R0, E0)));
  if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) n = [-n[0], -n[1], -n[2]];
  const eave = (s) => lerp(E0, E1, s), ridge = (s) => lerp(R0, R1, s);
  const P = (s, t) => lerp(eave(s), ridge(s), t);
  shingleSurface(bag, mat, P, () => n, (t) => (1 - t) * len(E0, E1) + t * len(R0, R1), (len(E0, R0) + len(E1, R1)) / 2, opt);
}

/** The four faces of a square pyramid or frustum with its sides on the axes (as `pyr`): half-widths a0 at y0, a1 at y1. */
export function shinglePyramid(bag, mat, x, z, a0, y0, a1, y1, opt = {}) {
  const c = (sx, sz, a, y) => [x + sx * a, y, z + sz * a], c0 = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let k = 0; k < 4; k++) {
    const [ax, az] = c0[k], [bx, bz] = c0[(k + 1) % 4], mx = (ax + bx) / 2, mz = (az + bz) / 2;
    shinglePlane(bag, mat, c(ax, az, a0, y0), c(bx, bz, a0, y0), c(bx, bz, a1, y1), c(ax, az, a1, y1), [mx, 0.5, mz], { seed: 7 + k, ...opt });
  }
}

/** A cone (or the half of one: a0 the first angle, span its sweep) from radius r0 at y0 to r1 at y1, centred (cx, cz). */
export function shingleCone(bag, mat, cx, cz, r0, y0, r1, y1, a0 = 0, span = Math.PI * 2, opt = {}) {
  const dy = y1 - y0, dr = r0 - r1, nl = Math.hypot(dy, dr), slopeLen = Math.hypot(dy, dr);
  const ang = (s) => a0 + span * s;
  const P = (s, t) => [cx + Math.cos(ang(s)) * (r0 + (r1 - r0) * t), y0 + dy * t, cz + Math.sin(ang(s)) * (r0 + (r1 - r0) * t)];
  const N = (s) => [Math.cos(ang(s)) * dy / nl, dr / nl, Math.sin(ang(s)) * dy / nl];
  shingleSurface(bag, mat, P, N, (t) => Math.abs(span) * (r0 + (r1 - r0) * t), slopeLen, { closed: Math.abs(span) > 6.2, ...opt });
}
