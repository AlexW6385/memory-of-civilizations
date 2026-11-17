// Helpers of the Ur town style (docs/settlements/ur.md §5.8–§5.10): a seeded stream, a convex prism in any frame, a
// rectangle with rectangles cut out of it.

import { box, fromTriangles, orientOutward } from '../../core/geom.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * A convex polygon poly = [[a, b], ...] extruded between c0 and c1, placed by P(a, b, c) -> [x, y, z]; its triangles are
 * turned to face outward (the polygon must be convex).
 */
export function prism(P, poly, c0, c1) {
  const T = [], n = poly.length, A = poly.map(([a, b]) => P(a, b, c0)), B = poly.map(([a, b]) => P(a, b, c1));
  for (let i = 1; i < n - 1; i++) T.push(...A[0], ...A[i], ...A[i + 1], ...B[0], ...B[i], ...B[i + 1]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; T.push(...A[i], ...A[j], ...B[j], ...A[i], ...B[j], ...B[i]); }
  return fromTriangles(orientOutward(T));
}

/** The rectangles of base = [x0, z0, x1, z1] left when the rectangles of voids are cut out of it. */
export function cutRects(base, voids) {
  const xs = new Set([base[0], base[2]]), zs = new Set([base[1], base[3]]);
  for (const v of voids) { for (const x of [v[0], v[2]]) if (x > base[0] && x < base[2]) xs.add(x); for (const z of [v[1], v[3]]) if (z > base[1] && z < base[3]) zs.add(z); }
  const X = [...xs].sort((a, b) => a - b), Z = [...zs].sort((a, b) => a - b), out = [];
  for (let i = 0; i + 1 < X.length; i++) for (let j = 0; j + 1 < Z.length; j++) {
    const cx = (X[i] + X[i + 1]) / 2, cz = (Z[j] + Z[j + 1]) / 2;
    if (voids.some((v) => cx > v[0] && cx < v[2] && cz > v[1] && cz < v[3])) continue;
    // run the cell on in x while the next cell is also solid (fewer boxes)
    out.push([X[i], Z[j], X[i + 1], Z[j + 1]]);
  }
  // merge neighbours in x that share a z-range
  out.sort((a, b) => a[1] - b[1] || a[3] - b[3] || a[0] - b[0]);
  const merged = [];
  for (const r of out) { const m = merged[merged.length - 1]; if (m && m[1] === r[1] && m[3] === r[3] && Math.abs(m[2] - r[0]) < 1e-9) m[2] = r[2]; else merged.push([...r]); }
  return merged;
}

/** A face frame of the rectangle r on its side f: P(u, v, w) with u along the side (world x or z), v up, w into the wall from its outer face. */
export function sideFrame([x0, z0, x1, z1], f) {
  return f === 'n' ? (u, v, w) => [u, v, z0 + w] : f === 's' ? (u, v, w) => [u, v, z1 - w] : f === 'w' ? (u, v, w) => [x0 + w, v, u] : (u, v, w) => [x1 - w, v, u];
}

/** A solid box on the side's frame: u0..u1 along it, v0..v1 up, w0..w1 into the wall. */
export function sideBox(P, u0, v0, u1, v1, w0, w1) {
  const a = P(u0, v0, w0), b = P(u1, v1, w1);
  return box(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2]));
}
