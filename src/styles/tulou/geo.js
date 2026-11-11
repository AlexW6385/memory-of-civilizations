// Geometry helpers of the tulou style: convex solids from corner rings (wall sectors, roof slabs),
// boxes in a local frame, chords of a circle.
import { fromTriangles, orientOutward, box } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

export const DEG = Math.PI / 180;
export const P = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];

/** A convex hexahedron from its top ring (4 points, in order round) and bottom ring (the same points below), oriented outward. */
export function hexa(top, bot) {
  const q = [];
  const quad = (a, b, c, d) => q.push(...a, ...b, ...c, ...a, ...c, ...d);
  quad(top[0], top[1], top[2], top[3]); quad(bot[0], bot[1], bot[2], bot[3]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(top[i], top[j], bot[j], bot[i]); }
  return fromTriangles(orientOutward(q));
}
/**
 * A sector of a conical wall: between angles a0 and a1, its outer radius rO0 → rO1 and inner radius rI0 → rI1 from y0 to y1.
 */
export function sector(c, rO0, rI0, rO1, rI1, y0, y1, a0, a1) {
  const p = (r, a, y) => { const [x, z] = P(c, r, a); return [x, y, z]; };
  const [yo, yi] = Array.isArray(y1) ? y1 : [y1, y1];      // the top may slope: [outer, inner]
  return hexa([p(rO1, a0, yo), p(rO1, a1, yo), p(rI1, a1, yi), p(rI1, a0, yi)], [p(rO0, a0, y0), p(rO0, a1, y0), p(rI0, a1, y0), p(rI0, a0, y0)]);
}
/** A slab sloping in the radial direction: from radius ra (height ya) to rb (height yb), thickness t (down), between angles a0, a1. */
export function slope(c, ra, ya, rb, yb, t, a0, a1) {
  const p = (r, a, y) => { const [x, z] = P(c, r, a); return [x, y, z]; };
  return hexa([p(ra, a0, ya), p(rb, a0, yb), p(rb, a1, yb), p(ra, a1, ya)], [p(ra, a0, ya - t), p(rb, a0, yb - t), p(rb, a1, yb - t), p(ra, a1, ya - t)]);
}
/** A box in the frame at centre (cx, cz) turned about y by phi (local +z → (sin phi, cos phi)): local x∈[x0,x1], y∈[y0,y1], z∈[z0,z1]. */
export function lbox(cx, cz, phi, x0, y0, z0, x1, y1, z1) {
  const g = box(x0, y0, z0, x1, y1, z1);
  g.applyMatrix4(new Matrix4().makeRotationY(phi).setPosition(cx, 0, cz));
  return g;
}
/** A frame helper: local (u across, v along) → world xz at (cx, cz) turned by phi. */
export const frameOf = (cx, cz, phi) => { const c = Math.cos(phi), s = Math.sin(phi); return (x, z) => [cx + x * c + z * s, cz - x * s + z * c]; };
/** Collider/box along a chord between two polar points at radius r. */
export const chord = (c, r, a0, a1) => [P(c, r, a0), P(c, r, a1)];
/** The same box built from a convex 4-corner plan polygon: (pts: [x,z]×4 in order), y0…y1. */
export function prism(pts, y0, y1) {
  return hexa(pts.map(([x, z]) => [x, y1, z]), pts.map(([x, z]) => [x, y0, z]));
}
/** A thin vertical wall (thickness th) between two plan points p and q, from y0 to y1. */
export function plank(p, q, y0, y1, th = 0.08) {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, nx = -(q[1] - p[1]) / L * th / 2, nz = (q[0] - p[0]) / L * th / 2;
  const t = (y) => [[p[0] - nx, y, p[1] - nz], [p[0] + nx, y, p[1] + nz], [q[0] + nx, y, q[1] + nz], [q[0] - nx, y, q[1] - nz]];
  return hexa(t(y1), t(y0));
}
