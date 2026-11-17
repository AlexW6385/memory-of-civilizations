// Çatalhöyük — hand-shaped mud and plaster (docs/settlements/catalhoyuk.md §13): soft relief blobs, rolled beads and tubes, so that
// edges are rounded and slightly uneven where a box would be sharp. Pure geometry (flat-shaded triangles), merged by the caller's bag.
import { fromTriangles } from '../../core/geom.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
/** push a triangle wound so that its normal (as three.js fromTriangles takes it) points away from `inside` */
function tri(T, a, b, c, inside) {
  const n = cross(sub(c, b), sub(a, b)), m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
  if (dot(n, sub(m, inside)) < 0) T.push(...a, ...c, ...b); else T.push(...a, ...b, ...c);
}

/**
 * A soft relief: the polygon `pts` ([u, v], star-shaped round its centre) swelling to height h out of the plane z = z0 (local +z out of
 * the wall), a quarter-round in `rings` steps; `wob` makes the swell uneven. Open at the foot (it stands in the wall).
 */
export function blob(pts, h, { rings = 3, z0 = 0, wob = 0, seed = 1 } = {}) {
  const n = pts.length, cu = pts.reduce((s, p) => s + p[0], 0) / n, cv = pts.reduce((s, p) => s + p[1], 0) / n, T = [], R = [];
  for (let k = 0; k < rings; k++) {
    const th = (k / rings) * Math.PI / 2, s = Math.cos(th), z = z0 + h * Math.sin(th);
    R.push(pts.map((p, i) => { const w = k ? 1 + wob * Math.sin(i * 2.3 + seed * 1.7 + k) : 1; return [cu + (p[0] - cu) * s * w, cv + (p[1] - cv) * s * w, z]; }));
  }
  const top = [cu, cv, z0 + h], inside = [cu, cv, z0 + h * 0.2];
  for (let k = 0; k < rings - 1; k++) for (let i = 0; i < n; i++) {
    const j = (i + 1) % n; tri(T, R[k][i], R[k][j], R[k + 1][j], inside); tri(T, R[k][i], R[k + 1][j], R[k + 1][i], inside);
  }
  for (let i = 0; i < n; i++) tri(T, R[rings - 1][i], R[rings - 1][(i + 1) % n], top, inside);
  return fromTriangles(T);
}
/** An ellipse outline for blob(): centre (cx, cy), radii, rotated by rot. */
export const oval = (cx, cy, rx, ry, n = 10, rot = 0) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2, X = Math.cos(a) * rx, Y = Math.sin(a) * ry; return [cx + X * Math.cos(rot) - Y * Math.sin(rot), cy + X * Math.sin(rot) + Y * Math.cos(rot)]; });
/** A rounded rectangle outline for blob(). */
export function roundRect(u0, v0, u1, v1, r, n = 3) {
  const P = [];
  for (const [cx, cy, a0] of [[u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI / 2], [u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5]]) for (let k = 0; k <= n; k++) { const a = a0 + k / n * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return P;
}

/**
 * A tube along `path` ([x, y, z] points), radius r (a number, or a function of t in 0…1), `sides` round; the ends closed. Parallel-transported,
 * so it follows bends; uneven radii make it look rolled by hand.
 */
export function tube(path, r, sides = 6, caps = true) {
  const m = path.length, rad = typeof r === 'function' ? r : () => r, T = [], C = [];
  let nrm = null;
  for (let k = 0; k < m; k++) {
    const a = path[Math.max(0, k - 1)], b = path[Math.min(m - 1, k + 1)], t = norm(sub(b, a));
    if (!nrm) { const up = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; nrm = norm(cross(t, up)); }
    else { const d = dot(nrm, t); nrm = norm([nrm[0] - t[0] * d, nrm[1] - t[1] * d, nrm[2] - t[2] * d]); }
    const bn = cross(t, nrm), rr = rad(k / (m - 1)), ring = [];
    for (let s = 0; s < sides; s++) { const an = s / sides * Math.PI * 2, c = Math.cos(an) * rr, d = Math.sin(an) * rr; ring.push([path[k][0] + nrm[0] * c + bn[0] * d, path[k][1] + nrm[1] * c + bn[1] * d, path[k][2] + nrm[2] * c + bn[2] * d]); }
    C.push(ring);
  }
  for (let k = 0; k < m - 1; k++) for (let s = 0; s < sides; s++) {
    const s2 = (s + 1) % sides, c0 = path[k], c1 = path[k + 1], mid = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2, (c0[2] + c1[2]) / 2];
    tri(T, C[k][s], C[k][s2], C[k + 1][s2], mid); tri(T, C[k][s], C[k + 1][s2], C[k + 1][s], mid);
  }
  if (caps) for (const [k, o] of [[0, path[Math.min(1, m - 1)]], [m - 1, path[Math.max(0, m - 2)]]]) for (let s = 0; s < sides; s++) tri(T, C[k][s], C[k][(s + 1) % sides], path[k], o);
  return fromTriangles(T);
}
/** A rolled bead of mud or plaster along a straight run a→b ([x, z]) at height y, steps of about `step`, uneven by `seed`; radius r. */
export function bead(a, b, y, r, seed = 1, step = 1.4, sides = 5) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)), P = [];
  for (let k = 0; k <= n; k++) { const t = k / n, w = Math.sin(seed * 12.9 + k * 1.9); P.push([a[0] + (b[0] - a[0]) * t, y + w * 0.012, a[1] + (b[1] - a[1]) * t + Math.cos(seed * 7.1 + k * 2.3) * 0.012]); }
  return tube(P, (t) => r * (1 + 0.12 * Math.sin(seed * 5 + t * 9)), sides);
}
