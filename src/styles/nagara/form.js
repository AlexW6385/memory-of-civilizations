// A small kit for modelled sculpture (docs/settlements/khajuraho.md §17): smooth rounded solids — tubes along
// a curve with their own radii, ellipsoids — built in a figure's own frame (u along the wall, v up, d out of the
// wall, in metres at scale 1) and emitted as ONE geometry per figure, with smooth normals taken from the surface.
// Triangles wholly behind the wall (d < clip) are dropped, so a figure standing against its niche costs only its
// front. Pure arrays; everything is a function of the arguments (no counters, no random state), so the same plan
// builds the same geometry every time.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** An integer hash of three numbers (to the millimetre) → [0, 1): the piece's own position decides, nothing else. */
export function hash3(x, y, z, salt = 0) {
  let h = Math.imul(Math.round(x * 1000) | 0, 73856093) ^ Math.imul(Math.round(y * 1000) | 0, 19349663) ^ Math.imul(Math.round(z * 1000) | 0, 83492791) ^ Math.imul(salt | 0, 2654435761);
  h ^= h >>> 15; h = Math.imul(h, 2246822519); h ^= h >>> 13; h = Math.imul(h, 3266489917); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** A small generator seeded from a number (one per figure, never shared). */
export function seeded(s) { let a = (s * 4294967296) >>> 0 || 1; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; }

/** Frame from a tangent T and a preferred 'depth' direction: [B1, B2] perpendicular to T. */
function frameOf(T, dref = [0, 0, 1]) {
  let B1 = cross(T, dref);
  if (len(B1) < 0.2) B1 = cross(T, [0, 1, 0]);
  if (len(B1) < 0.2) B1 = cross(T, [1, 0, 0]);
  B1 = norm(B1);
  return [B1, norm(cross(B1, T))];
}
const smooth = (t) => t * t * (3 - 2 * t);
/** Catmull-Rom point between p1 and p2 (p0, p3 the neighbours) at t. */
function cr(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return p1.map((_, k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
}

export class Form {
  /** fr: { x, y, z, nx, nz, s } — the world position of the local origin, the wall's outward normal, the scale. */
  constructor(fr, o = {}) { this.fr = fr; this.clip = o.clip ?? 0.004; this.P = []; this.N = []; }
  w(p) { const { x, y, z, nx, nz, s } = this.fr; return [x - nz * p[0] * s + nx * p[2] * s, y + p[1] * s, z + nx * p[0] * s + nz * p[2] * s]; }
  wn(n) { const { nx, nz } = this.fr; return [-nz * n[0] + nx * n[2], n[1], nx * n[0] + nz * n[2]]; }
  /** Emit triangles for a grid of local points G[i][j] (i along the path, j round it), their ring centres C[i]. */
  grid(G, C, wrapJ = true, wrapI = false) {
    const ni = G.length, nj = G[0].length, Nn = [];
    for (let i = 0; i < ni; i++) {
      const row = [];
      for (let j = 0; j < nj; j++) {
        const jp = wrapJ ? (j + 1) % nj : Math.min(nj - 1, j + 1), jm = wrapJ ? (j + nj - 1) % nj : Math.max(0, j - 1);
        const ip = wrapI ? (i + 1) % ni : Math.min(ni - 1, i + 1), im = wrapI ? (i + ni - 1) % ni : Math.max(0, i - 1);
        const du = sub(G[i][jp], G[i][jm]), dv = sub(G[ip][j], G[im][j]);
        let n = cross(dv, du);
        const r = sub(G[i][j], C[i]);
        if (len(n) < 1e-9) n = r; else if (dot(n, r) < 0) n = [-n[0], -n[1], -n[2]];
        row.push(norm(n));
      }
      Nn.push(row);
    }
    const emit = (a, b, c) => {
      const pa = G[a[0]][a[1]], pb = G[b[0]][b[1]], pc = G[c[0]][c[1]];
      if (Math.max(pa[2], pb[2], pc[2]) < this.clip) return;
      const wa = this.w(pa), wb = this.w(pb), wc = this.w(pc), g = cross(sub(wb, wa), sub(wc, wa));
      if (len(g) < 1e-12) return;
      const na = this.wn(Nn[a[0]][a[1]]), nb = this.wn(Nn[b[0]][b[1]]), nc = this.wn(Nn[c[0]][c[1]]);
      const flip = dot(g, [na[0] + nb[0] + nc[0], na[1] + nb[1] + nc[1], na[2] + nb[2] + nc[2]]) < 0;
      if (flip) this.P.push(...wa, ...wc, ...wb, ); else this.P.push(...wa, ...wb, ...wc);
      if (flip) this.N.push(...na, ...nc, ...nb); else this.N.push(...na, ...nb, ...nc);
    };
    const mi = wrapI ? ni : ni - 1, mj = wrapJ ? nj : nj - 1;
    for (let i = 0; i < mi; i++) for (let j = 0; j < mj; j++) {
      const i1 = (i + 1) % ni, j1 = (j + 1) % nj;
      emit([i, j], [i1, j], [i1, j1]); emit([i, j], [i1, j1], [i, j1]);
    }
  }
  /**
   * A tube along a path of [u, v, d, a, b] points (a, b the semi-axes across and along the depth direction): Catmull-Rom
   * smoothed `sub` times a segment, `sides` round, closed at both ends with a rounded cap (o.caps = [start, end]).
   * o.fold(θ, t): a multiplier of the radius (pleats, scales); o.lift(θ, t): a rise of the ring (an uneven hem);
   * o.closed: a ring (torus); o.dref: the direction the section's second axis prefers.
   */
  tube(path, o = {}) {
    const sides = o.sides ?? 8, sb = o.sub ?? 2, closed = !!o.closed, dref = o.dref ?? [0, 0, 1], caps = o.caps ?? [true, true], capRings = o.capRings ?? [1.0, Math.PI / 2];
    const n = path.length, pts = [];
    const at = (k) => path[closed ? ((k % n) + n) % n : Math.max(0, Math.min(n - 1, k))];
    const segs = closed ? n : n - 1;
    for (let k = 0; k < segs; k++) {
      for (let s = 0; s < sb; s++) {
        const t = s / sb, p = cr(at(k - 1), at(k), at(k + 1), at(k + 2), t), q = at(k), r = at(k + 1), m = smooth(t);
        p[3] = q[3] + (r[3] - q[3]) * m; p[4] = q[4] + (r[4] - q[4]) * m;
        pts.push(p);
      }
    }
    if (!closed) pts.push([...at(n - 1)]);
    const m = pts.length, G = [], C = [], tan = [];
    for (let i = 0; i < m; i++) {
      const a = closed ? pts[(i + m - 1) % m] : pts[Math.max(0, i - 1)], b = closed ? pts[(i + 1) % m] : pts[Math.min(m - 1, i + 1)];
      tan.push(norm(sub(b, a)));
    }
    const ringAt = (c, T, a, b, i, t) => {
      const [B1, B2] = frameOf(T, dref), row = [];
      for (let j = 0; j < sides; j++) {
        const th = (j / sides) * Math.PI * 2, f = o.fold ? o.fold(th, t, i) : 1, lf = o.lift ? o.lift(th, t, i) : 0;
        const ca = Math.cos(th) * a * f, sa = Math.sin(th) * b * f;
        row.push([c[0] + B1[0] * ca + B2[0] * sa, c[1] + B1[1] * ca + B2[1] * sa + lf, c[2] + B1[2] * ca + B2[2] * sa]);
      }
      return row;
    };
    const cap = (idx, dir) => {
      const c = pts[idx], T = tan[idx].map((v) => v * dir), rm = (c[3] + c[4]) / 2, out = [];
      for (const ph of capRings) {
        const k = Math.cos(ph), off = Math.sin(ph) * rm, cc = [c[0] + T[0] * off, c[1] + T[1] * off, c[2] + T[2] * off];
        out.push({ cc: c, row: ringAt(cc, tan[idx], c[3] * k, c[4] * k, idx, idx / (m - 1)) });
      }
      return out;
    };
    if (!closed && caps[0]) { const cs = cap(0, -1).reverse(); for (const { cc, row } of cs) { G.push(row); C.push(cc); } }
    for (let i = 0; i < m; i++) { G.push(ringAt(pts[i], tan[i], pts[i][3], pts[i][4], i, i / Math.max(1, m - 1))); C.push(pts[i]); }
    if (!closed && caps[1]) for (const { cc, row } of cap(m - 1, 1)) { G.push(row); C.push(cc); }
    this.grid(G, C, true, closed);
  }
  /** An ellipsoid at c with semi-axes r = [across, along `axis`, depth], its long axis `axis`. */
  ell(c, r, o = {}) {
    const rings = o.rings ?? 6, sides = o.sides ?? 8, T = norm(o.axis ?? [0, 1, 0]), [B1, B2] = frameOf(T, o.dref ?? [0, 0, 1]), G = [], C = [];
    for (let i = 0; i <= rings; i++) {
      const ph = Math.PI * i / rings, sn = Math.sin(ph), cs = Math.cos(ph), cc = [c[0] + T[0] * r[1] * cs, c[1] + T[1] * r[1] * cs, c[2] + T[2] * r[1] * cs], row = [];
      for (let j = 0; j < sides; j++) {
        const th = (j / sides) * Math.PI * 2, ca = Math.cos(th) * r[0] * sn, sa = Math.sin(th) * r[2] * sn;
        row.push([cc[0] + B1[0] * ca + B2[0] * sa, cc[1] + B1[1] * ca + B2[1] * sa, cc[2] + B1[2] * ca + B2[2] * sa]);
      }
      G.push(row); C.push(c);
    }
    this.grid(G, C, true, false);
  }
  /** A ring (a torus) of radius R about c in the plane spanned by e1 and e2, tube radius r. */
  ring(c, R, r, e1, e2, o = {}) {
    const n = o.segs ?? 12, path = [];
    for (let k = 0; k < n; k++) { const th = (k / n) * Math.PI * 2, ca = Math.cos(th) * R, sa = Math.sin(th) * R; path.push([c[0] + e1[0] * ca + e2[0] * sa, c[1] + e1[1] * ca + e2[1] * sa, c[2] + e1[2] * ca + e2[2] * sa, r, r]); }
    this.tube(path, { sides: o.sides ?? 5, sub: 1, closed: true, dref: o.dref ?? cross(e1, e2) });
  }
  get empty() { return this.P.length === 0; }
  geometry() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(this.P), 3));
    g.setAttribute('normal', new Float32BufferAttribute(new Float32Array(this.N), 3));
    return g;
  }
  get triangles() { return this.P.length / 9; }
}

/** F0 seen in a mirror (u → −u) when sw is −1: every point, axis and direction passed in is mirrored, the section folds with it. */
export function mirrored(F0, sw) {
  if (sw === 1) return F0;
  const mp = (p) => p && [p[0] * sw, ...p.slice(1)];
  const wo = (o = {}) => ({ ...o, dref: mp(o.dref), axis: mp(o.axis), fold: o.fold && ((th, t, i) => o.fold(Math.PI - th, t, i)), lift: o.lift && ((th, t, i) => o.lift(Math.PI - th, t, i)) });
  return {
    tube: (path, o) => F0.tube(path.map(mp), wo(o)),
    ell: (c, r, o) => F0.ell(mp(c), r, wo(o)),
    ring: (c, R, r, e1, e2, o) => F0.ring(mp(c), R, r, mp(e1), mp(e2), wo(o)),
  };
}
