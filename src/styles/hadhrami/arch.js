// Pointed arches for the Hadhrami builders (docs/settlements/shibam.md §12): a two-centred arch of lime-plastered mudbrick, as the wall above an opening
// between two piers (a spandrel), as a moulding ring round an opening, or as the shape of a recess. Built in the wall's own frame (u along the wall,
// y up, w through it) and put in the world by a mapper; every triangle faces the way its face should (no reliance on a convex solid).
import { fromTriangles } from '../../core/geom.js';

/** The wall's frame to the world: axis 'z' — a wall running along z (thickness along x): (u, y, w) -> [w, y, u]; 'x' — along x: [u, y, w]. */
export const mapper = (axis) => (axis === 'z' ? (u, y, w) => [w, y, u] : (u, y, w) => [u, y, w]);

/** The curve of a two-centred arch from its left spring (u0, yS) to its right (u1, yS), 2n+1 points; rise above the spring line (rise = 0.866 span is the equilateral arch). */
export function archCurve(u0, u1, yS, rise, n = 7) {
  const s = u1 - u0, R = (s * s / 4 + rise * rise) / s, cl = u0 + R, cr = u1 - R, um = (u0 + u1) / 2;
  const a = Math.atan2(rise, um - cl), a2 = Math.atan2(rise, um - cr), pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, g = Math.PI + (a - Math.PI) * t; pts.push([cl + R * Math.cos(g), yS + R * Math.sin(g)]); }
  for (let i = 1; i <= n; i++) { const t = i / n, g = a2 * (1 - t); pts.push([cr + R * Math.cos(g), yS + R * Math.sin(g)]); }
  return pts;
}
// a triangle oriented so that its normal (as fromTriangles takes it) has a non-negative dot with the hint
function tri(out, a, b, c, h) {
  const ux = c[0] - b[0], uy = c[1] - b[1], uz = c[2] - b[2], vx = a[0] - b[0], vy = a[1] - b[1], vz = a[2] - b[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * h[0] + ny * h[1] + nz * h[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
const quadO = (out, a, b, c, d, h) => { tri(out, a, b, c, h); tri(out, a, c, d, h); };

/**
 * The wall above an arch between two supports: from the arch up to the level yTop, thickness w0..w1, both faces and the soffit (the arch's underside).
 * { u0, u1, yS, rise, yTop, w0, w1, axis, n }. Returns a geometry.
 */
export function archSpandrel({ u0, u1, yS, rise, yTop, w0, w1, axis = 'z', n = 6 }) {
  const M = mapper(axis), P = archCurve(u0, u1, yS, rise, n), out = [], wm = (w0 + w1) / 2, um = (u0 + u1) / 2;
  const hf = M(0, 0, 1).map((v, i) => v - M(0, 0, 0)[i]), hb = hf.map((v) => -v);
  for (let i = 0; i + 1 < P.length; i++) {
    const [ua, ya] = P[i], [ub, yb] = P[i + 1];
    quadO(out, M(ua, ya, w1), M(ub, yb, w1), M(ub, yTop, w1), M(ua, yTop, w1), hf);
    quadO(out, M(ua, ya, w0), M(ub, yb, w0), M(ub, yTop, w0), M(ua, yTop, w0), hb);
    // the soffit faces down into the opening
    const q = [M(ua, ya, w0), M(ub, yb, w0), M(ub, yb, w1), M(ua, ya, w1)], c = M((ua + ub) / 2, (ya + yb) / 2, wm), t = M(um, yS, wm);
    quadO(out, q[0], q[1], q[2], q[3], [t[0] - c[0], t[1] - c[1], t[2] - c[2]]);
  }
  return fromTriangles(out);
}

/** The flat shape of an arched opening (rectangle from y0 to the spring, arch above), one face at depth w facing the way `dir` (+1 / −1 along w). */
export function archFill({ u0, u1, y0, yS, rise, w, dir = 1, axis = 'x', n = 6 }) {
  const M = mapper(axis), P = archCurve(u0, u1, yS, rise, n), out = [], cu = (u0 + u1) / 2, cy = (y0 + yS + rise) / 2, h = M(0, 0, dir).map((v, i) => v - M(0, 0, 0)[i]);
  const ring = [[u0, y0], [u1, y0], ...P.slice().reverse()];
  for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; tri(out, M(cu, cy, w), M(a[0], a[1], w), M(b[0], b[1], w), h); }
  return fromTriangles(out);
}

/** A moulding: the band between an arch (u0, u1, yS, rise) and the same arch grown outward by d, one face at depth w facing `dir`, with the ring's edge on the outside (side faces w0..w1 if w0 differs). */
export function archRing({ u0, u1, yS, rise, d, w0, w1, axis = 'x', n = 6 }) {
  const M = mapper(axis), I = archCurve(u0, u1, yS, rise, n), O = archCurve(u0 - d, u1 + d, yS, rise + d * 0.9, n), out = [];
  const hf = M(0, 0, 1).map((v, i) => v - M(0, 0, 0)[i]);
  for (let i = 0; i + 1 < I.length; i++) {
    quadO(out, M(I[i][0], I[i][1], w1), M(I[i + 1][0], I[i + 1][1], w1), M(O[i + 1][0], O[i + 1][1], w1), M(O[i][0], O[i][1], w1), hf);
    // the outer edge, facing out of the ring
    const c = M((O[i][0] + O[i + 1][0]) / 2, (O[i][1] + O[i + 1][1]) / 2, (w0 + w1) / 2), t = M((u0 + u1) / 2, yS, (w0 + w1) / 2);
    if (w1 - w0 > 1e-4) quadO(out, M(O[i][0], O[i][1], w0), M(O[i + 1][0], O[i + 1][1], w0), M(O[i + 1][0], O[i + 1][1], w1), M(O[i][0], O[i][1], w1), [c[0] - t[0], c[1] - t[1], c[2] - t[2]]);
  }
  return fromTriangles(out);
}
