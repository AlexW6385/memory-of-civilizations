// A small sculptor's kit for the Nabataean carvings (docs/settlements/petra.md §22): smooth, modelled volumes
// instead of stacked plates. Every shape is a grid of points (a ring of points per step along a spine, or a
// sphere's parallels) whose vertex normals are averaged over the grid, so that limbs, torsos, heads, wings and
// the folds of cloth read as rounded solids in the light. All the pieces of one carving go into one Sculpt and
// come out as ONE geometry (so a figure is one piece, never instanced and never a swarm of small details).
//
// The figure's own frame: x to the viewer's right, y up, w out of the wall toward the viewer. The Sculpt maps it
// to the world by `xf` and, for a relief, flattens w by `flat` and drops what lies behind the wall (w < 0).
// Everything is deterministic: no random numbers; any variety comes from a hash of the piece's position.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** A repeatable number in [0, 1) from a position (so that copies of a shape differ by a hair, the same on every build). */
export function hash3(x, y, z, k = 0) {
  let h = Math.imul(Math.round(x * 997) | 0, 374761393) + Math.imul(Math.round(y * 991) | 0, 668265263) + Math.imul(Math.round(z * 983) | 0, 2147483647) + Math.imul(k | 0, 40503) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class Sculpt {
  /** xf: figure frame → world; flat: the factor on w; clip: drop what lies behind the wall (w < 0). */
  constructor(xf = (p) => p, { flat = 1, clip = false } = {}) { this.xf = xf; this.flat = flat; this.clip = clip; this.shift = 0; this.pre = null; this.pos = []; this.nor = []; }
  get triangles() { return this.pos.length / 9; }
  /** A grid of local points rows[i][j] (j wraps when `wrap`); out: normals outward from the grid's middle, or toward `face`. */
  grid(rows, { wrap = true, face = null, facet = false } = {}) {
    const nI = rows.length, nJ = rows[0].length, F = this.flat, sh = this.shift;
    if (this.pre) rows = rows.map((r) => r.map((p) => this.pre(p)));
    const W = rows.map((r) => r.map((p) => this.xf([p[0], p[1], (p[2] + sh) * F]))), keep = this.clip ? rows.map((r) => r.map((p) => (p[2] + sh) * F > -0.002)) : null;
    const Nn = W.map((r) => r.map(() => [0, 0, 0])), quads = [], jn = wrap ? nJ : nJ - 1;
    let cx = 0, cy = 0, cz = 0;
    for (const r of W) for (const p of r) { cx += p[0]; cy += p[1]; cz += p[2]; }
    const m = nI * nJ; cx /= m; cy /= m; cz /= m;
    let sgn = 0;
    for (let i = 0; i + 1 < nI; i++) for (let j = 0; j < jn; j++) {
      const j1 = (j + 1) % nJ;
      if (keep && !(keep[i][j] || keep[i][j1] || keep[i + 1][j] || keep[i + 1][j1])) continue;
      const a = W[i][j], b = W[i][j1], c = W[i + 1][j1], d = W[i + 1][j], n = cross(sub(c, a), sub(d, b));
      quads.push([i, j, j1]);
      for (const [ii, jj] of [[i, j], [i, j1], [i + 1, j1], [i + 1, j]]) { const q = Nn[ii][jj]; q[0] += n[0]; q[1] += n[1]; q[2] += n[2]; }
      sgn += face ? dot(n, face) : dot(n, [(a[0] + c[0]) / 2 - cx, (a[1] + c[1]) / 2 - cy, (a[2] + c[2]) / 2 - cz]);
    }
    const flip = sgn < 0, P = this.pos, N = this.nor;
    const emit = (p, q, r) => { const fn = facet ? norm(cross(sub(q[0], p[0]), sub(r[0], p[0]))) : null; for (const v of [p, q, r]) { P.push(v[0][0], v[0][1], v[0][2]); const n = facet ? (flip ? mul(fn, -1) : fn) : norm(flip ? mul(v[1], -1) : v[1]); N.push(n[0], n[1], n[2]); } };
    for (const [i, j, j1] of quads) {
      const a = [W[i][j], Nn[i][j]], b = [W[i][j1], Nn[i][j1]], c = [W[i + 1][j1], Nn[i + 1][j1]], d = [W[i + 1][j], Nn[i + 1][j]];
      const tri = (p, q, r) => { const n = cross(sub(q[0], p[0]), sub(r[0], p[0])); if (len(n) < 1e-10) return; if (flip) emit(p, r, q); else emit(p, q, r); };
      tri(a, b, c); tri(a, c, d);
    }
  }
  /** A convex solid given as local triangles [x, y, w, …] (flat normals, every face turned outward). */
  solid(tris) {
    const F = this.flat, sh = this.shift, W = [];
    for (let i = 0; i < tris.length; i += 3) { const p = this.pre ? this.pre([tris[i], tris[i + 1], tris[i + 2]]) : [tris[i], tris[i + 1], tris[i + 2]]; W.push(...this.xf([p[0], p[1], (p[2] + sh) * F])); }
    let cx = 0, cy = 0, cz = 0; const m = W.length / 3;
    for (let i = 0; i < W.length; i += 3) { cx += W[i]; cy += W[i + 1]; cz += W[i + 2]; }
    cx /= m; cy /= m; cz /= m;
    for (let i = 0; i < W.length; i += 9) {
      let a = W.slice(i, i + 3), b = W.slice(i + 3, i + 6), c = W.slice(i + 6, i + 9), n = cross(sub(b, a), sub(c, a));
      const l = len(n); if (l < 1e-12) continue;
      if (dot(n, sub([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3], [cx, cy, cz])) < 0) { [b, c] = [c, b]; n = mul(n, -1); }
      const u = mul(n, 1 / l); this.pos.push(...a, ...b, ...c); this.nor.push(...u, ...u, ...u);
    }
  }
  /** A box between (x0, y0, w0) and (x1, y1, w1), crisp. */
  box(x0, y0, w0, x1, y1, w1) { this.solid(boxTris(x0, y0, w0, x1, y1, w1)); }
  /** A prism: the convex polygon pts [[x, y], …] extruded from w0 to w1. */
  prism(pts, w0, w1) { this.solid(prismTris(pts, w0, w1)); }
  geometry() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute('normal', new Float32BufferAttribute(new Float32Array(this.nor), 3));
    return g;
  }
}

/** An ellipsoid: centre c, three axis vectors (their lengths the radii); nlat parallels, nlon meridians. */
export function ellipsoid(S, c, ax, ay, az, nlat = 5, nlon = 8) {
  const rows = [];
  for (let i = 0; i <= nlat; i++) {
    const ph = Math.PI * i / nlat, y = Math.cos(ph), r = Math.sin(ph), row = [];
    for (let j = 0; j < nlon; j++) { const th = j / nlon * Math.PI * 2, x = r * Math.cos(th), z = r * Math.sin(th); row.push([c[0] + ax[0] * x + ay[0] * y + az[0] * z, c[1] + ax[1] * x + ay[1] * y + az[1] * z, c[2] + ax[2] * x + ay[2] * y + az[2] * z]); }
    rows.push(row);
  }
  S.grid(rows);
}
/** An axis-aligned ellipsoid of radii r = [rx, ry, rz]. */
export const blob = (S, c, r, nlat = 5, nlon = 8) => ellipsoid(S, c, [r[0], 0, 0], [0, r[1], 0], [0, 0, r[2]], nlat, nlon);
/** An ellipsoid whose long axis runs along `dir` (radius rl), the other two radii ra (along `up`'s side) and rb. */
export function blobDir(S, c, dir, rl, ra, rb, up = [0, 0, 1], nlat = 5, nlon = 8) {
  const d = norm(dir); let a = sub(up, mul(d, dot(up, d))); if (len(a) < 1e-4) a = sub([1, 0, 0], mul(d, d[0])); a = norm(a);
  ellipsoid(S, c, mul(a, ra), mul(d, rl), mul(cross(d, a), rb), nlat, nlon);
}

const catmull = (p0, p1, p2, p3, t) => {
  const t2 = t * t, t3 = t2 * t;
  return p1.map((_, k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
};
/**
 * A tube along a spine of [x, y, z, ra, rb] (rb defaults to ra), a smooth section of ra along its frame's N and rb along its B,
 * rounded off at the ends by a hemisphere (cap [start, end]). ref: a vector that N leans toward; fold(t, th) scales the section
 * (folds of cloth, muscle); sub: rings per span; seg: points round.
 */
export function tube(S, pts, { seg = 8, sub: sb = 2, cap = [1, 1], ref = [0, 0, 1], fold = null, capN = 2, capLen = 1 } = {}) {
  const P = pts.map((p) => [p[0], p[1], p[2], p[3], p[4] ?? p[3]]), n = P.length;
  const spl = [];
  for (let i = 0; i + 1 < n; i++) for (let s = 0; s < sb; s++) spl.push(catmull(P[Math.max(0, i - 1)], P[i], P[i + 1], P[Math.min(n - 1, i + 2)], s / sb));
  spl.push(P[n - 1]);
  const m = spl.length, T = [], Nf = [], Bf = [];
  for (let k = 0; k < m; k++) T.push(norm(sub(spl[Math.min(m - 1, k + 1)], spl[Math.max(0, k - 1)])));
  let N0 = sub(ref, mul(T[0], dot(ref, T[0]))); if (len(N0) < 1e-4) N0 = sub([1, 0, 0], mul(T[0], T[0][0])); N0 = norm(N0);
  for (let k = 0; k < m; k++) { if (k) { const t = T[k]; N0 = sub(N0, mul(t, dot(N0, t))); N0 = len(N0) < 1e-6 ? [1, 0, 0] : norm(N0); } Nf.push(N0); Bf.push(cross(T[k], N0)); }
  const ring = (k, sc, off, tt) => {
    const c = add(spl[k], mul(T[k], off)), row = [];
    for (let j = 0; j < seg; j++) {
      const th = j / seg * Math.PI * 2, f = (fold ? fold(tt, th) : 1) * sc, a = spl[k][3] * f * Math.cos(th), b = spl[k][4] * f * Math.sin(th);
      row.push([c[0] + Nf[k][0] * a + Bf[k][0] * b, c[1] + Nf[k][1] * a + Bf[k][1] * b, c[2] + Nf[k][2] * a + Bf[k][2] * b]);
    }
    return row;
  };
  const rows = [];
  if (cap[0]) { const e = (spl[0][3] + spl[0][4]) / 2 * capLen; for (let q = capN; q >= 1; q--) { const ph = Math.PI / 2 * q / capN; rows.push(ring(0, q === capN ? 1e-3 : Math.cos(ph), -e * Math.sin(ph), 0)); } }
  for (let k = 0; k < m; k++) rows.push(ring(k, 1, 0, k / (m - 1)));
  if (cap[1]) { const e = (spl[m - 1][3] + spl[m - 1][4]) / 2 * capLen; for (let q = 1; q <= capN; q++) { const ph = Math.PI / 2 * q / capN; rows.push(ring(m - 1, q === capN ? 1e-3 : Math.cos(ph), e * Math.sin(ph), 1)); } }
  S.grid(rows);
}
/** A tube from a to b of radii ra → rb (a rod, a finger, a spear). */
export const rodT = (S, a, b, ra, rb = ra, o = {}) => tube(S, [[a[0], a[1], a[2], ra], [b[0], b[1], b[2], rb]], { seg: 6, sub: 1, capN: 1, ...o });
/** An open sheet: fn(u, v) → point for u, v in [0, 1] (nu × nv), its front toward `face`. */
export function sheet(S, fn, nu, nv, face) {
  const rows = [];
  for (let i = 0; i <= nu; i++) { const r = []; for (let j = 0; j <= nv; j++) r.push(fn(i / nu, j / nv)); rows.push(r); }
  S.grid(rows, { wrap: false, face });
}
/** A ring (torus) of centre c in the plane spanned by e1, e2, radius R, section radius r (sa along the plane's normal-wise, sb in the plane). */
export function torus(S, c, e1, e2, R, r, { seg = 14, sec = 6, arc = Math.PI * 2, from = 0, rb = r } = {}) {
  const pts = [];
  const full = arc >= Math.PI * 2 - 1e-6, n = Math.max(4, Math.round(seg * arc / (Math.PI * 2)));
  for (let k = 0; k <= n; k++) { const a = from + arc * k / n, d = add(mul(e1, Math.cos(a) * R), mul(e2, Math.sin(a) * R)); pts.push([c[0] + d[0], c[1] + d[1], c[2] + d[2], r, rb]); }
  const ref = cross(e1, e2);
  if (full) { pts.pop(); pts.push(pts[0].slice()); }
  tube(S, pts, { seg: sec, sub: 1, cap: full ? [0, 0] : [1, 1], ref, capN: 1 });
}

/** The twelve triangles of a box. */
export function boxTris(x0, y0, w0, x1, y1, w1) {
  const V = [[x0, y0, w0], [x1, y0, w0], [x1, y1, w0], [x0, y1, w0], [x0, y0, w1], [x1, y0, w1], [x1, y1, w1], [x0, y1, w1]], T = [];
  for (const [a, b, c, d] of [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]]) T.push(...V[a], ...V[b], ...V[c], ...V[a], ...V[c], ...V[d]);
  return T;
}
/** The triangles of a convex prism: polygon pts [[x, y], …] from w0 to w1. */
export function prismTris(pts, w0, w1) {
  const T = [], n = pts.length, V = ([x, y], w) => [x, y, w];
  for (let k = 0; k < n; k++) { const p = pts[k], q = pts[(k + 1) % n]; T.push(...V(p, w0), ...V(q, w0), ...V(q, w1), ...V(p, w0), ...V(q, w1), ...V(p, w1)); }
  for (let k = 1; k < n - 1; k++) { T.push(...V(pts[0], w0), ...V(pts[k], w0), ...V(pts[k + 1], w0)); T.push(...V(pts[0], w1), ...V(pts[k], w1), ...V(pts[k + 1], w1)); }
  return T;
}

/** Turn the figure about the vertical by `ang` (so that one built facing the viewer walks along the wall); 0 clears it. */
export function turned(S, ang) { const c = Math.cos(ang), s = Math.sin(ang); S.pre = ang ? ([x, y, w]) => [x * c + w * s, y, -x * s + w * c] : null; }
