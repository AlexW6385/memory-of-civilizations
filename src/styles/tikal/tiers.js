// The terraces of a Tikal pyramid (docs/settlements/maya-tikal.md §14): each tier is a battered face on a cross-shaped plan (the four corners
// inset, as on Temple I and the other Late Classic pyramids), crowned by an apron moulding (a flaring cove under a vertical fillet),
// with a painted band proud of the face. Closed solids on the plan's axes.

import { fromTriangles } from '../../core/geom.js';

/** The 12 corners of the cross plan: half-sizes (a, b), corner notch n; the order runs round so that edge normals point outward. */
export function crossPoly(a, b, n) {
  return [[-(a - n), -b], [a - n, -b], [a - n, -(b - n)], [a, -(b - n)], [a, b - n], [a - n, b - n], [a - n, b], [-(a - n), b], [-(a - n), b - n], [-a, b - n], [-a, -(b - n)], [-(a - n), -(b - n)]];
}
/** The cross plan's three rectangles [x0, z0, x1, z1] about (cx, cz): a tiling, for the colliders. */
export function crossRects(cx, cz, a, b, n) {
  return [[cx - a, cz - (b - n), cx + a, cz + (b - n)], [cx - (a - n), cz - b, cx + (a - n), cz - (b - n)], [cx - (a - n), cz + (b - n), cx + (a - n), cz + b]];
}
function tri(t, A, B, C, nrm) {
  const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
  const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (c[0] * nrm[0] + c[1] * nrm[1] + c[2] * nrm[2] >= 0) t.push(...A, ...B, ...C); else t.push(...A, ...C, ...B);
}
/** A cross-plan solid from (a0, b0, n0) at y0 to (a1, b1, n1) at y1 about (cx, cz): its sides and its top (and bottom if asked). */
export function crossPrism(bag, mat, cx, cz, a0, b0, n0, a1, b1, n1, y0, y1, bottom = false) {
  const P0 = crossPoly(a0, b0, n0), P1 = crossPoly(a1, b1, n1), t = [];
  for (let i = 0; i < 12; i++) {
    const j = (i + 1) % 12, A = [cx + P0[i][0], y0, cz + P0[i][1]], B = [cx + P0[j][0], y0, cz + P0[j][1]], C = [cx + P1[j][0], y1, cz + P1[j][1]], D = [cx + P1[i][0], y1, cz + P1[i][1]];
    const ex = P0[j][0] - P0[i][0], ez = P0[j][1] - P0[i][1], l = Math.hypot(ex, ez) || 1, slope = (a0 - a1) / Math.max(1e-6, y1 - y0), nrm = [ez / l, slope * 0.0 + 0.0001, -ex / l];
    tri(t, A, B, C, nrm); tri(t, A, C, D, nrm);
  }
  const cap = (a, b, n, y, up) => {
    for (const r of crossRects(cx, cz, a, b, n)) { const q = [[r[0], y, r[1]], [r[2], y, r[1]], [r[2], y, r[3]], [r[0], y, r[3]]]; tri(t, q[0], q[1], q[2], [0, up, 0]); tri(t, q[0], q[2], q[3], [0, up, 0]); }
  };
  cap(a1, b1, n1, y1, 1); if (bottom) cap(a0, b0, n0, y0, -1);
  bag.add(mat, fromTriangles(t));
}
