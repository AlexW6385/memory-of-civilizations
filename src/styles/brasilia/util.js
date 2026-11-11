// Brasília style — shared helpers: surfaces of revolution with smooth normals and cut sectors, wedges, quads.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { fromTriangles, orientOutward, box } from '../../core/geom.js';

export const TAU = Math.PI * 2;
/** Both faces of a triangle. */
export const tri2 = (t, a, b, c) => t.push(...a, ...b, ...c, ...a, ...c, ...b);
export const quad2 = (t, a, b, c, d) => { tri2(t, a, b, c); tri2(t, a, c, d); };
/**
 * A surface of revolution about the vertical axis through (cx, cz): profile [[r, y], ...] from bottom to top; its normal
 * outward (to the profile's right going up) or, with `flip`, inward. `skip(th, y0, y1, r)` drops a quad (a doorway).
 */
export function revSurf(profile, N, { cx = 0, cz = 0, y = 0, flip = false, skip = null } = {}) {
  const P = [], Nn = [], sgn = flip ? -1 : 1, n = profile.length;
  const segN = [];
  for (let i = 0; i < n - 1; i++) { const dr = profile[i + 1][0] - profile[i][0], dy = profile[i + 1][1] - profile[i][1], l = Math.hypot(dr, dy) || 1; segN.push([dy / l * sgn, -dr / l * sgn]); }
  const vN = (i) => { const a = segN[Math.max(0, i - 1)], b = segN[Math.min(n - 2, i)], x = a[0] + b[0], q = a[1] + b[1], l = Math.hypot(x, q) || 1; return [x / l, q / l]; };
  const V = (i, s) => { const th = s / N * TAU, [r, yy] = profile[i], nn = vN(i); return { p: [cx + Math.cos(th) * r, y + yy, cz + Math.sin(th) * r], n: [nn[0] * Math.cos(th), nn[1], nn[0] * Math.sin(th)] }; };
  for (let i = 0; i < n - 1; i++) for (let s = 0; s < N; s++) {
    if (skip && skip(((s + 0.5) / N) * TAU, profile[i][1], profile[i + 1][1], profile[i][0])) continue;
    const a = V(i, s), b = V(i, s + 1), c = V(i + 1, s + 1), d = V(i + 1, s);
    const order = flip ? [a, b, c, a, c, d] : [a, c, b, a, d, c];
    for (const v of order) { P.push(...v.p); Nn.push(...v.n); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new Float32BufferAttribute(Nn, 3));
  return g;
}
/** A flat ring (annulus) between r0 and r1 at height y, facing up or down. */
export function ring(r0, r1, y, N, cx, cz, up = true) {
  const t = [];
  for (let s = 0; s < N; s++) {
    const a = s / N * TAU, b = (s + 1) / N * TAU;
    const A = [cx + Math.cos(a) * r0, y, cz + Math.sin(a) * r0], B = [cx + Math.cos(b) * r0, y, cz + Math.sin(b) * r0], C = [cx + Math.cos(b) * r1, y, cz + Math.sin(b) * r1], D = [cx + Math.cos(a) * r1, y, cz + Math.sin(a) * r1];
    if (up) t.push(...A, ...D, ...C, ...A, ...C, ...B); else t.push(...A, ...C, ...D, ...A, ...B, ...C);
  }
  return fromTriangles(t);
}
/** A convex prism from a list of points, outward-oriented. */
export const solid = (tris) => fromTriangles(orientOutward(tris));
/** A wedge: the box x0..x1 × z0..z1 under a top that rises from yA at x0 to yB at x1 (a ramp), foot at yf. */
export function wedgeX(x0, x1, z0, z1, yA, yB, yf = -0.5) {
  const t = [], p = (x, y, z) => [x, y, z], q = (...v) => { t.push(...v[0], ...v[1], ...v[2], ...v[0], ...v[2], ...v[3]); };
  q(p(x0, yA, z0), p(x0, yA, z1), p(x1, yB, z1), p(x1, yB, z0));
  q(p(x0, yf, z0), p(x1, yf, z0), p(x1, yf, z1), p(x0, yf, z1));
  q(p(x0, yf, z0), p(x0, yA, z0), p(x1, yB, z0), p(x1, yf, z0));
  q(p(x0, yf, z1), p(x1, yf, z1), p(x1, yB, z1), p(x0, yA, z1));
  q(p(x0, yf, z0), p(x0, yf, z1), p(x0, yA, z1), p(x0, yA, z0));
  q(p(x1, yf, z0), p(x1, yB, z0), p(x1, yB, z1), p(x1, yf, z1));
  return solid(t);
}
/** The same, rising along z (from yA at z0 to yB at z1). */
export function wedgeZ(x0, x1, z0, z1, yA, yB, yf = -0.5) {
  const t = [], p = (x, y, z) => [x, y, z], q = (...v) => { t.push(...v[0], ...v[1], ...v[2], ...v[0], ...v[2], ...v[3]); };
  q(p(x0, yA, z0), p(x0, yB, z1), p(x1, yB, z1), p(x1, yA, z0));
  q(p(x0, yf, z0), p(x1, yf, z0), p(x1, yf, z1), p(x0, yf, z1));
  q(p(x0, yf, z0), p(x0, yA, z0), p(x1, yA, z0), p(x1, yf, z0));
  q(p(x0, yf, z1), p(x1, yf, z1), p(x1, yB, z1), p(x0, yB, z1));
  q(p(x0, yf, z0), p(x0, yf, z1), p(x0, yB, z1), p(x0, yA, z0));
  q(p(x1, yf, z0), p(x1, yA, z0), p(x1, yB, z1), p(x1, yf, z1));
  return solid(t);
}
/** A box standing on end, turned about y by `yaw` about its own centre (cx, cz): w along its x, d along its z. */
export function turnedBox(cx, cz, w, d, y0, y1, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw), H = (a, b) => [cx + a * c - b * s, cz + a * s + b * c];
  const pts = [H(-w / 2, -d / 2), H(w / 2, -d / 2), H(w / 2, d / 2), H(-w / 2, d / 2)], t = [];
  const q = (a, b, c2, d2) => t.push(...a, ...b, ...c2, ...a, ...c2, ...d2);
  const B = pts.map(([x, z]) => [x, y0, z]), T = pts.map(([x, z]) => [x, y1, z]);
  q(T[0], T[3], T[2], T[1]); q(B[0], B[1], B[2], B[3]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(B[i], T[i], T[j], B[j]); }
  return solid(t);
}
export { box };
/** Rectangle polygon sample: the rim of a circle as chord segments for colliders (skips the angles in `gap`). */
export function ringSegments(col, cx, cz, r, th, y0, y1, n = 48, gap = null) {
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, b = (i + 1) / n * TAU, m = (a + b) / 2;
    if (gap && gap(m)) continue;
    col.segment([cx + Math.cos(a) * r, cz + Math.sin(a) * r], [cx + Math.cos(b) * r, cz + Math.sin(b) * r], th, y0, y1);
  }
}
/** The angle difference wrapped to −π…π. */
export const dAng = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
