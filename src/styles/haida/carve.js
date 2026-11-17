// Carving solids for the Haida style: swept tubes, relief ribbons, domes and blobs with real depth, so that
// eyes, brows, lips, beaks and formline bands stand out of the log as rounded forms, not as flat patches.
// All return flat-shaded geometry (core/geom fromTriangles); triangles are wound outward from the section centres.
import { fromTriangles } from '../../core/geom.js';

/** Detail factor of the pieces being built (1 full, less for what is seen from afar): fewer sides and rings. */
let Q = 1;
export const setQ = (q) => { Q = q; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]) || 1;
const unit = (a) => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const mad = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

/** push triangle a, b, c wound so that its normal points along `out`. */
function emit(t, a, b, c, out) {
  if (dot(cross(sub(b, a), sub(c, a)), out) < 0) t.push(...a, ...c, ...b); else t.push(...a, ...b, ...c);
}
/** squircle point: angle th, exponent e (1 = ellipse, <1 = boxier) */
const sq = (th, e) => { const c = Math.cos(th), s = Math.sin(th); return [Math.sign(c) * Math.pow(Math.abs(c), e), Math.sign(s) * Math.pow(Math.abs(s), e)]; };

/**
 * A tube along `path` (points [x, y, z]) with an elliptical section: rx across (along the side axis), ry through (along the
 * normal), either numbers or arrays per point; `hint` gives a normal per point (the section's ry axis lies near it), else
 * the side axis is the world x axis. opts: n (sides), closed (a loop, no caps), e (squircle exponent).
 */
export function tube(path, rx, ry, opts = {}) {
  const { closed = false, hint = null, e = 1 } = opts, n = Math.max(4, Math.round((opts.n ?? 6) * Q)), m = path.length, rings = [], cen = [], tans = [];
  const R = (a, i) => (Array.isArray(a) ? a[i] : a);
  for (let i = 0; i < m; i++) {
    let T;
    if (closed) T = unit(sub(path[(i + 1) % m], path[(i + m - 1) % m]));
    else T = unit(sub(path[Math.min(m - 1, i + 1)], path[Math.max(0, i - 1)]));
    let Nn;
    if (hint) { const h = Array.isArray(hint[0]) ? hint[i] : hint; Nn = unit(mad(h, T, -dot(h, T))); }
    else { const H = Math.abs(T[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; const S0 = unit(mad(H, T, -dot(H, T))); Nn = unit(cross(T, S0)); }
    const S = unit(cross(T, Nn)), a = R(rx, i), b = R(ry, i), ring = [];
    for (let j = 0; j < n; j++) { const [c, s] = sq(j / n * Math.PI * 2, e); ring.push(mad(mad(path[i], S, a * c), Nn, b * s)); }
    rings.push(ring); cen.push(path[i]); tans.push(T);
  }
  const t = [], top = closed ? m : m - 1;
  for (let i = 0; i < top; i++) {
    const i2 = (i + 1) % m;
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n, a = rings[i][j], b = rings[i][j2], c = rings[i2][j2], d = rings[i2][j];
      const mid = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4], c0 = [(cen[i][0] + cen[i2][0]) / 2, (cen[i][1] + cen[i2][1]) / 2, (cen[i][2] + cen[i2][2]) / 2];
      const o = sub(mid, c0); emit(t, a, b, c, o); emit(t, a, c, d, o);
    }
  }
  if (!closed) for (const [i, sg] of [[0, -1], [m - 1, 1]]) for (let j = 0; j < n; j++) emit(t, cen[i], rings[i][j], rings[i][(j + 1) % n], [tans[i][0] * sg, tans[i][1] * sg, tans[i][2] * sg]);
  return fromTriangles(t);
}

/** A relief ribbon: a flat-backed tube lying on a surface, w wide and h high (half of it buried in the surface). */
export const ribbon = (path, normals, w, h, opts = {}) => tube(path, w / 2, h, { n: 6, hint: normals, ...opts });

/** An ellipsoid (a dome when `dome`: its base at the centre plane, rising toward `dir` (+1 or −1 along z)): radii rx, ry, rz. */
export function blob(c, rx, ry, rz, opts = {}) {
  const { dome = false, dir = -1, e = 1 } = opts, n = Math.max(5, Math.round((opts.n ?? 8) * Q)), K = Q < 1 ? Math.max(1, Math.min(opts.K ?? 3, 2) - 1) : (opts.K ?? 3), rings = [], t = [];
  const p0 = dome ? 0 : -Math.PI / 2;
  for (let k = 0; k <= K; k++) {
    const ph = p0 + (Math.PI / 2 - p0) * k / K, sc = Math.max(0.0, Math.cos(ph)), z = c[2] + dir * rz * Math.sin(ph), ring = [];
    for (let j = 0; j < n; j++) { const [co, si] = sq(j / n * Math.PI * 2, e); ring.push([c[0] + co * rx * sc, c[1] + si * ry * sc, z]); }
    rings.push(ring);
  }
  for (let k = 0; k < K; k++) for (let j = 0; j < n; j++) {
    const j2 = (j + 1) % n, a = rings[k][j], b = rings[k][j2], cc = rings[k + 1][j2], d = rings[k + 1][j];
    const o = sub([(a[0] + b[0] + cc[0] + d[0]) / 4, (a[1] + b[1] + cc[1] + d[1]) / 4, (a[2] + b[2] + cc[2] + d[2]) / 4], [c[0], c[1], dome ? c[2] - dir * rz * 0.3 : c[2]]);
    emit(t, a, b, cc, o); emit(t, a, cc, d, o);
  }
  return fromTriangles(t);
}

/** A convex prism of a polygon in the x–z plane [[x, z], …], from y0 to y1 (the plan). */
export function yprism(poly, y0, y1) {
  const t = [], n = poly.length, cx = poly.reduce((s, p) => s + p[0], 0) / n, cz = poly.reduce((s, p) => s + p[1], 0) / n, cy = (y0 + y1) / 2, C = [cx, cy, cz];
  for (let i = 1; i < n - 1; i++) { emit(t, [poly[0][0], y0, poly[0][1]], [poly[i][0], y0, poly[i][1]], [poly[i + 1][0], y0, poly[i + 1][1]], [0, -1, 0]); emit(t, [poly[0][0], y1, poly[0][1]], [poly[i][0], y1, poly[i][1]], [poly[i + 1][0], y1, poly[i + 1][1]], [0, 1, 0]); }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = [poly[i][0], y0, poly[i][1]], b = [poly[j][0], y0, poly[j][1]], c = [poly[j][0], y1, poly[j][1]], d = [poly[i][0], y1, poly[i][1]];
    const o = sub([(a[0] + c[0]) / 2, cy, (a[2] + c[2]) / 2], C); emit(t, a, b, c, o); emit(t, a, c, d, o);
  }
  return fromTriangles(t);
}
