// Tikal's masonry: shared helpers of the style (docs/settlements/maya-tikal.md §4). Everything is built as closed solids on the
// plan's axes; a "frame" maps depth u (from a building's front) and breadth v to the plan's x and z for any of the four fronts.

import { box, fromTriangles, orientOutward } from '../../core/geom.js';
import { flipTris } from '../ming/index.js';

export const L = 'limestone_maya', RED = 'stucco_red', LIME = 'lime_plaster';

/** A frame: the point (fx, fz) the middle of a front, face 'w'|'e'|'n'|'s' = the way the front looks; u runs into the building. */
export function frame(face, fx, fz) {
  const U = { w: [1, 0], e: [-1, 0], n: [0, 1], s: [0, -1] }[face], V = face === 'w' || face === 'e' ? [0, 1] : [1, 0];
  const P = (u, v) => [fx + U[0] * u + V[0] * v, fz + U[1] * u + V[1] * v];
  const R = (u0, u1, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { P, R, U, V };
}
/** A box over a rect [x0, z0, x1, z1] from y0 to y1 (and its obstacle, if col). */
export function slab(bag, mat, r, y0, y1, col, c0 = y0, c1 = y1) { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (col) col.rect(r, c0, c1); }
/** A frustum over a rectangle: half-sizes (a0, b0) at y0 to (a1, b1) at y1 about (cx, cz); the top and sides only. */
export function frust(bag, mat, cx, cz, a0, b0, a1, b1, y0, y1, bottom = false) {
  const B = [[-a0, -b0], [a0, -b0], [a0, b0], [-a0, b0]], T = [[-a1, -b1], [a1, -b1], [a1, b1], [-a1, b1]], t = [];
  const P = (q, y) => [cx + q[0], y, cz + q[1]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...P(B[i], y0), ...P(T[i], y1), ...P(T[j], y1), ...P(B[i], y0), ...P(T[j], y1), ...P(B[j], y0)); }
  t.push(...P(T[0], y1), ...P(T[3], y1), ...P(T[2], y1), ...P(T[0], y1), ...P(T[2], y1), ...P(T[1], y1));
  if (bottom) t.push(...P(B[0], y0), ...P(B[1], y0), ...P(B[2], y0), ...P(B[0], y0), ...P(B[2], y0), ...P(B[3], y0));
  bag.add(mat, fromTriangles(t.concat(flipTris(t))));
}
/** A geometry's faces turned the other way (the underside of a thatch). */
export function flipGeo(g) {
  const p = g.attributes.position.array, t = [];
  for (let i = 0; i < p.length; i += 9) t.push(p[i], p[i + 1], p[i + 2], p[i + 6], p[i + 7], p[i + 8], p[i + 3], p[i + 4], p[i + 5]);
  return fromTriangles(t);
}
/** A solid with the hull of eight corners (bottom four, top four) turned outward. */
export function hex(bag, mat, P) {
  const t = [], q = (a, b, c, d) => t.push(...P[a], ...P[b], ...P[c], ...P[a], ...P[c], ...P[d]);
  q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
  bag.add(mat, fromTriangles(orientOutward(t)));
}
/**
 * A steep stair up a face: { foot [x, z] (the middle of the lowest step's front), dir [dx, dz] (the way up, an axis), w, H, Lr (the run
 * along dir), steps, y0 }: a solid mass under the stair's line, closed wedge steps on it, sloped balustrades either side with a
 * stone at their foot. Walked as a ramp.
 */
export function flight(bag, col, o) {
  const { foot, dir: [dx, dz], w, H, Lr, steps, y0 = 0 } = o, nx = -dz, nz = dx, hw = w / 2, bw = 0.7, back = o.back ?? 1.2, mat = o.mat ?? RED, bmat = o.bmat ?? L;
  const P = (d, off, y) => [foot[0] + dx * d + nx * off, y0 + y, foot[1] + dz * d + nz * off];
  const prism = (m, poly, o0, o1) => {
    const t = [], q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
    for (let i = 1; i + 1 < poly.length; i++) { t.push(...P(poly[0][0], o0, poly[0][1]), ...P(poly[i][0], o0, poly[i][1]), ...P(poly[i + 1][0], o0, poly[i + 1][1])); t.push(...P(poly[0][0], o1, poly[0][1]), ...P(poly[i][0], o1, poly[i][1]), ...P(poly[i + 1][0], o1, poly[i + 1][1])); }
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; q(P(a[0], o0, a[1]), P(b[0], o0, b[1]), P(b[0], o1, b[1]), P(a[0], o1, a[1])); }
    bag.add(m, fromTriangles(orientOutward(t)));
  };
  prism(mat, [[0, -0.3], [0, 0], [Lr, H - 0.02], [Lr + back, H - 0.02], [Lr + back, -0.3]], -hw - bw, hw + bw);
  const t = [];
  for (let i = 0; i < steps; i++) {
    const d0 = Lr * i / steps, d1 = Lr * (i + 1) / steps, ya = H * i / steps, yb = H * (i + 1) / steps, e = hw + 0.02;
    const A = P(d0, -e, ya), B = P(d0, -e, yb), C = P(d1, -e, yb), A2 = P(d0, e, ya), B2 = P(d0, e, yb), C2 = P(d1, e, yb), w6 = [];
    w6.push(...A, ...B, ...C, ...A2, ...C2, ...B2, ...B, ...B2, ...C2, ...B, ...C2, ...C, ...A, ...A2, ...B2, ...A, ...B2, ...B);
    t.push(...orientOutward(w6));
  }
  bag.add(bmat, fromTriangles(t));
  for (const s of [-1, 1]) prism(bmat, [[0, 0], [-0.4, 0], [-0.4, 1.0], [Lr, H + 0.9], [Lr, H - 0.02]], s < 0 ? -(hw + bw) : hw, s < 0 ? -hw : hw + bw);
  const ex = foot[0] + dx * Lr, ez = foot[1] + dz * Lr;
  const r = [Math.min(foot[0], ex) - (dx ? 0 : hw), Math.min(foot[1], ez) - (dz ? 0 : hw), Math.max(foot[0], ex) + (dx ? 0 : hw), Math.max(foot[1], ez) + (dz ? 0 : hw)];
  col.ramp(r, y0, y0 + H, dx > 0 ? 'e' : dx < 0 ? 'w' : dz > 0 ? 's' : 'n');
  // the balustrades are walls: strips of 1.5 m, each solid up to the balustrade's top at the strip's upper end
  const nb = Math.max(1, Math.ceil((Lr + 0.4) / 1.5));
  for (const sg of [-1, 1]) for (let k = 0; k < nb; k++) {
    const d0 = -0.4 + (Lr + 0.4) * k / nb, d1 = -0.4 + (Lr + 0.4) * (k + 1) / nb;
    const a = P(d0, sg * hw, 0), b = P(d1, sg * (hw + bw), 0);
    col.rect([a[0], a[2], b[0], b[2]], y0 - 0.3, y0 + 1.0 + (H - 0.1) * (d1 + 0.4) / (Lr + 0.4));
  }
  return r;
}
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
