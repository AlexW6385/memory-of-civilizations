// Small solids for the Haida style: prisms from convex outlines, flat ellipses, boards, posts.
import { box, lathe, fromTriangles, orientOutward, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

export { box, lathe, rod, fromTriangles, Matrix4 };
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A convex solid from its corner points: the first n the near face, the next n the far face, each a convex polygon in order. */
export function hull(pts) {
  const n = pts.length / 2, t = [];
  for (let i = 1; i < n - 1; i++) t.push(...pts[0], ...pts[i], ...pts[i + 1], ...pts[n], ...pts[n + i + 1], ...pts[n + i]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...pts[i], ...pts[n + i], ...pts[n + j], ...pts[i], ...pts[n + j], ...pts[j]); }
  return fromTriangles(orientOutward(t));
}
/** A prism of a convex polygon [[x, y], …] in the x–y plane, from z0 to z1. */
export const prism = (poly, z0, z1) => hull([...poly.map(([x, y]) => [x, y, z0]), ...poly.map(([x, y]) => [x, y, z1])]);
/** A prism of a convex polygon [[z, y], …] in the z–y plane, from x0 to x1. */
export const sideprism = (poly, x0, x1) => hull([...poly.map(([z, y]) => [x0, y, z]), ...poly.map(([z, y]) => [x1, y, z])]);
/** A flat ellipse (x radius rx, y radius ry) at (cx, cy), thick from z0 to z1, in the x–y plane. */
export function ellipse(cx, cy, rx, ry, z0, z1, n = 12) {
  const poly = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; poly.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return prism(poly, z0, z1);
}
/** A board in the x–y plane from a to b (its centre line), wd wide, from z0 to z1. */
export function board(a, b, wd, z0, z1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L * wd / 2, ny = dx / L * wd / 2;
  return prism([[a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny], [b[0] + nx, b[1] + ny], [a[0] + nx, a[1] + ny]], z0, z1);
}
/** A round post, tapering a little. */
export const post = (r, h, x = 0, y = 0, z = 0, n = 10) => lathe([[r, 0], [r * 0.92, h], [0.001, h + 0.001]], n, null, x, y, z);
/** A transform for placing pieces built in a local frame: yaw about y, then the position. */
export const frame = (x, y, z, yaw = 0) => new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
/** add(mat, geometry) that places the geometry by M. */
export const placer = (bag, M) => (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
/** An instanced copy (or a merged one where the bag cannot instance) of a shared shape, placed by m. */
export function inst(bag, mat, g, m, reach = 140) {
  if (bag.addInstance) bag.addInstance(mat, g, m.clone(), { reach });
  else bag.add(mat, g.clone().applyMatrix4(m));
}
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
