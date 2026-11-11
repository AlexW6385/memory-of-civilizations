// Shared helpers of the Mongol style.
import { fromTriangles, orientOutward, box, rod, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const TAU = Math.PI * 2;

/** One wedge of a thick ring about (cx, cz): radii rI..rO, angles a0..a1, heights y0..y1 (a closed convex solid). */
export function wedge(cx, cz, rI, rO, a0, a1, y0, y1) {
  const P = (r, a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
  const b = [P(rI, a0, y0), P(rO, a0, y0), P(rO, a1, y0), P(rI, a1, y0)], t = [P(rI, a0, y1), P(rO, a0, y1), P(rO, a1, y1), P(rI, a1, y1)];
  const out = [];
  const q = (a, b2, c, d) => out.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[1], t[2], t[3]);
  for (let k = 0; k < 4; k++) q(b[k], b[(k + 1) % 4], t[(k + 1) % 4], t[k]);
  return fromTriangles(orientOutward(out));
}
/** A ring wall about (cx, cz) from a0 to a0 + span, in n pieces, each given to put(g, i, aMid) (and walls with a gap). */
export function ringPieces(cx, cz, rI, rO, y0, y1, n, skip, put) {
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
    if (skip && skip(am, a0, a1)) continue;
    put(wedge(cx, cz, rI, rO, a0, a1, y0, y1), i, am);
  }
}
/** Angular distance between two angles. */
export const angDist = (a, b) => Math.abs(((a - b + Math.PI * 3) % TAU) - Math.PI);
/** A box oriented along a→b (plan), width th, heights y0..y1. */
export function obox(a, b, th, y0, y1) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * th / 2, nz = dx / L * th / 2;
  const p = [[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]], out = [];
  const q = (A, B, C, D) => out.push(...A, ...B, ...C, ...A, ...C, ...D);
  q([p[0][0], y0, p[0][1]], [p[1][0], y0, p[1][1]], [p[2][0], y0, p[2][1]], [p[3][0], y0, p[3][1]]);
  q([p[0][0], y1, p[0][1]], [p[1][0], y1, p[1][1]], [p[2][0], y1, p[2][1]], [p[3][0], y1, p[3][1]]);
  for (let k = 0; k < 4; k++) { const A = p[k], B = p[(k + 1) % 4]; q([A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]); }
  return fromTriangles(orientOutward(out));
}
/** A spoked wheel (axis along x) of radius r at (x, y, z): rim, hub, spokes; wood material for all. */
export function wheel(bag, x, y, z, r, mat = 'wood_dark', spokes = 10, w = 0.1) {
  const rim = lathe([[r, -w / 2], [r, w / 2], [r - 0.09, w / 2], [r - 0.09, -w / 2], [r, -w / 2]], 20); rim.rotateZ(Math.PI / 2).translate(x, y, z); bag.add(mat, rim);
  const hub = lathe([[0.001, -w * 0.9], [0.1, -w * 0.9], [0.1, w * 0.9], [0.001, w * 0.9]], 8); hub.rotateZ(Math.PI / 2).translate(x, y, z); bag.add(mat, hub);
  for (let k = 0; k < spokes; k++) { const a = k / spokes * TAU; bag.add(mat, rod([x, y + Math.cos(a) * 0.08, z + Math.sin(a) * 0.08], [x, y + Math.cos(a) * (r - 0.08), z + Math.sin(a) * (r - 0.08)], 0.028, 5)); }
}
export { box, rod, lathe, Matrix4 };
