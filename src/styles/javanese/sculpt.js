// A small sculptor for low relief and carved figures (docs/settlements/borobudur.md §20): smooth solids built as
// grids of points with their own vertex normals, so that a body, a limb, a face or a leaf mass reads as a rounded
// volume and not as stacked plates. Everything is made in the frame of a panel (u across, v up, w out of the
// wall) and placed by `frame`; the faces are turned to look away from the inside by a reference point, so the
// frame's handedness does not matter. Pure arithmetic, no randomness: a figure is the same every time it is built.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const TAU = Math.PI * 2;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** A Catmull–Rom curve through the points P (each [u, v, w]), `seg` steps between neighbours; R (numbers or arrays) interpolated alongside. */
export function curve(P, R, seg = 3) {
  const n = P.length, out = [], rad = [];
  const at = (i) => P[Math.max(0, Math.min(n - 1, i))];
  const rr = (i) => R[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < seg + (i === n - 2 ? 1 : 0); k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t, p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      out.push([0, 1, 2].map((c) => 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      const a = rr(i), b = rr(i + 1);
      rad.push(Array.isArray(a) ? a.map((x, c) => x + (b[c] - x) * t) : a + (b - a) * t);
    }
  }
  return [out, rad];
}

export class Sculpt {
  /** frame: { O: [x, y, z] (the panel's v = 0 at its u = 0, w = 0), U: [x, z] (unit along u), N: [x, z] (unit along w, out of the wall) }. */
  constructor(frame, coarse = false) { this.f = frame; this.pos = []; this.nor = []; this.sink = -0.003; this.coarse = coarse; }
  /** The ring counts of a primitive, fewer in a coarse sculpture (the reduced level of detail). */
  rings(n, m) { return this.coarse ? [Math.max(4, Math.round(n * 0.62)), Math.max(2, Math.round(m * 0.6))] : [n, m]; }
  map(p) { const { O, U, N } = this.f; return [O[0] + U[0] * p[0] + N[0] * p[2], O[1] + p[1], O[2] + U[1] * p[0] + N[1] * p[2]]; }
  get tris() { return this.pos.length / 9; }

  /** One triangle with its three normals, wound to face along the sum of them. */
  tri(a, b, c, na, nb, nc) {
    const g = cross(sub(b, a), sub(c, a));
    if (len(g) < 1e-12) return;
    if (dot(g, [na[0] + nb[0] + nc[0], na[1] + nb[1] + nc[1], na[2] + nb[2] + nc[2]]) < 0) { [b, c] = [c, b]; [nb, nc] = [nc, nb]; }
    this.pos.push(...a, ...b, ...c); this.nor.push(...na, ...nb, ...nc);
  }

  /** A surface through the grid G (rows of points), smooth: its normals from the grid, pointing away from ref(i, j). wrap: the columns close. */
  surf(G, ref, wrap = false) {
    const R = G.length, C = G[0].length, W = G.map((row) => row.map((p) => this.map(p)));
    const Nn = W.map((row, i) => row.map((p, j) => {
      const i0 = Math.max(0, i - 1), i1 = Math.min(R - 1, i + 1), j0 = wrap ? (j + C - 1) % C : Math.max(0, j - 1), j1 = wrap ? (j + 1) % C : Math.min(C - 1, j + 1);
      let n = cross(sub(W[i1][j], W[i0][j]), sub(W[i][j1], W[i][j0]));
      const d = sub(p, this.map(ref(i, j)));
      if (len(n) < 1e-10) n = d; else if (dot(n, d) < 0) n = [-n[0], -n[1], -n[2]];
      return unit(n);
    }));
    const Cj = wrap ? C : C - 1;
    for (let i = 0; i + 1 < R; i++) for (let j = 0; j < Cj; j++) {
      const k = (j + 1) % C;
      this.tri(W[i][j], W[i + 1][j], W[i + 1][k], Nn[i][j], Nn[i + 1][j], Nn[i + 1][k]);
      this.tri(W[i][j], W[i + 1][k], W[i][k], Nn[i][j], Nn[i + 1][k], Nn[i][k]);
    }
  }

  /**
   * A dome standing out of the field: the front half of an ellipsoid with radii r = [u, v, w] about c (its base ring at c's w),
   * turned by rot in the plane of the wall; n round, m rings; `mod(phi, theta)` scales the radius (lobes, grooves).
   */
  blob(c, r, { n = 8, m = 3, rot = 0, mod = null, base = 0 } = {}) {
    [n, m] = this.rings(n, m);
    const cs = Math.cos(rot), sn = Math.sin(rot), G = [];
    for (let i = 0; i <= m; i++) {
      const th = (i / m) * Math.PI / 2, row = [];
      for (let j = 0; j < n; j++) {
        const ph = (j / n) * TAU, k = mod ? mod(ph, th) : 1;
        const x = r[0] * Math.sin(th) * Math.cos(ph) * k, y = r[1] * Math.sin(th) * Math.sin(ph) * k, z = r[2] * Math.cos(th) * k + base * Math.sin(th);
        row.push([c[0] + x * cs - y * sn, c[1] + x * sn + y * cs, c[2] + z]);
      }
      G.push(row);
    }
    this.surf(G, () => c, true);
  }

  /**
   * A rod along a curve: P the control points [u, v, w], R their sections [half-width across, depth] (or one number for a round rod),
   * its front half only (it lies on the field), ends rounded (cap). fold(t, a) multiplies the width (drapery), a running 0..π across.
   */
  tube(P, R, { seg = 3, n = 6, cap = 2, fold = null, flat = false } = {}) {
    if (this.coarse) { n = this.rings(n, 2)[0]; seg = Math.max(1, seg - 1); cap = Math.min(cap, 1); }
    const [S, Q] = curve(P, R.map((x) => (Array.isArray(x) ? x : [x, x])), seg), L = S.length, G = [], refs = [];
    const dirs = S.map((p, i) => unit(sub(S[Math.min(L - 1, i + 1)], S[Math.max(0, i - 1)])));
    const section = (i, t, f = 1, d = 0) => {
      const p = S[i], tg = dirs[i], pr = [-tg[1], tg[0], 0], row = [];
      for (let j = 0; j <= n; j++) {
        const a = (j / n) * Math.PI, fm = fold ? fold(t, a) : 1;
        row.push([p[0] + tg[0] * d + pr[0] * Math.cos(a) * Q[i][0] * f * fm, p[1] + tg[1] * d + pr[1] * Math.cos(a) * Q[i][0] * f * fm, p[2] + Math.sin(a) * Q[i][1] * f * (flat ? 1 : fm)]);
      }
      G.push(row); refs.push([p[0] + tg[0] * d, p[1] + tg[1] * d, p[2]]);
    };
    for (let k = 0; k < cap; k++) { const ph = (k / cap) * Math.PI / 2; section(0, 0, Math.sin(ph) * 0.999 + 0.001, -Math.cos(ph) * Q[0][0]); }
    for (let i = 0; i < L; i++) section(i, i / (L - 1));
    for (let k = cap - 1; k >= 0; k--) { const ph = (k / cap) * Math.PI / 2; section(L - 1, 1, Math.sin(ph) * 0.999 + 0.001, Math.cos(ph) * Q[L - 1][0]); }
    this.surf(G, (i) => refs[i]);
  }

  /** A straight rod a→b of one or two radii (round or [across, depth]). */
  rod(a, b, r0, r1 = r0, o = {}) { this.tube([a, b], [r0, r1], { seg: 1, ...o }); }

  /** A turned form on a vertical axis through (cu, cw), its front half only: profile [[radius, v]] from the bottom up; kw: depth over width. */
  turn(profile, cu, cw, { n = 8, kw = 1 } = {}) {
    n = this.rings(n, 2)[0];
    const G = profile.map(([r, v]) => Array.from({ length: n + 1 }, (_, j) => { const a = (j / n) * Math.PI; return [cu + Math.cos(a) * r, v, cw + Math.sin(a) * r * kw]; }));
    this.surf(G, (i) => [cu, profile[i][1], cw]);
  }


  /** A whole ellipsoid (radii r about c), turned by rot about the vertical axis and then tilt about the x axis: the free sculpture (a Buddha, a lion). */
  solid(c, r, { n = 8, m = 4, mod = null, yaw = 0, tilt = 0, roll = 0 } = {}) {
    [n, m] = this.rings(n, m);
    const G = [], cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(roll), sr = Math.sin(roll);
    for (let i = 0; i <= m; i++) {
      const th = (i / m) * Math.PI, row = [];
      for (let j = 0; j < n; j++) {
        const ph = (j / n) * TAU, k = mod ? mod(ph, th) : 1;
        let x = r[0] * Math.sin(th) * Math.cos(ph) * k, y = r[1] * Math.cos(th) * k, z = r[2] * Math.sin(th) * Math.sin(ph) * k;
        [x, y] = [x * cr - y * sr, x * sr + y * cr];
        [y, z] = [y * ct - z * st, y * st + z * ct];
        [x, z] = [x * cy + z * sy, -x * sy + z * cy];
        row.push([c[0] + x, c[1] + y, c[2] + z]);
      }
      G.push(row);
    }
    this.surf(G, () => c, true);
  }

  /** A rod in space along a curve through P, its sections [ra, rb] (or one radius) round it, rb along the horizontal across the rod; ends closed. */
  pipe(P, R, { seg = 3, n = 8, cap = 2, fold = null, capLen = null } = {}) {
    if (this.coarse) { n = this.rings(n, 2)[0]; seg = Math.max(1, seg - 1); cap = Math.min(cap, 1); }
    const [S, Q] = curve(P, R.map((x) => (Array.isArray(x) ? x : [x, x])), seg), L = S.length, G = [], refs = [];
    const dirs = S.map((p, i) => unit(sub(S[Math.min(L - 1, i + 1)], S[Math.max(0, i - 1)])));
    const section = (i, t, f = 1, d = 0) => {
      const p = S[i], tg = dirs[i];
      const a = Math.abs(tg[1]) > 0.95 ? [1, 0, 0] : unit(cross([0, 1, 0], tg));
      const b = unit(cross(tg, a)), row = [];
      for (let j = 0; j < n; j++) {
        const ph = (j / n) * TAU, fm = fold ? fold(t, ph) : 1;
        row.push([0, 1, 2].map((c) => p[c] + tg[c] * d + (a[c] * Math.cos(ph) * Q[i][0] + b[c] * Math.sin(ph) * Q[i][1]) * f * fm));
      }
      G.push(row); refs.push([p[0] + tg[0] * d, p[1] + tg[1] * d, p[2] + tg[2] * d]);
    };
    for (let k = 0; k < cap; k++) { const ph = (k / cap) * Math.PI / 2; section(0, 0, Math.sin(ph) * 0.999 + 0.001, -Math.cos(ph) * (capLen ?? Math.min(...Q[0]))); }
    for (let i = 0; i < L; i++) section(i, i / (L - 1));
    for (let k = cap - 1; k >= 0; k--) { const ph = (k / cap) * Math.PI / 2; section(L - 1, 1, Math.sin(ph) * 0.999 + 0.001, Math.cos(ph) * (capLen ?? Math.min(...Q[L - 1]))); }
    this.surf(G, (i) => refs[i], true);
  }

  /** A faceted slab on a convex outline [[u, v]] from w0 to w1, its top drawn in by d (a bevel); flat shaded, the back left out. */
  plate(outline, w0, w1, d = 0.006) {
    const m = outline.length, cu = outline.reduce((s, q) => s + q[0], 0) / m, cv = outline.reduce((s, q) => s + q[1], 0) / m;
    const top = outline.map(([u, v]) => { const r = Math.hypot(u - cu, v - cv) || 1, f = Math.min(0.45, d / r); return [u + (cu - u) * f, v + (cv - v) * f]; });
    const ref = this.map([cu, cv, (w0 + w1) / 2]), flat = (a, b, c) => { const g = cross(sub(b, a), sub(c, a)), l = len(g); if (l < 1e-12) return; let n = [g[0] / l, g[1] / l, g[2] / l]; const q = [(a[0] + b[0] + c[0]) / 3 - ref[0], (a[1] + b[1] + c[1]) / 3 - ref[1], (a[2] + b[2] + c[2]) / 3 - ref[2]]; if (dot(n, q) < 0) { n = [-n[0], -n[1], -n[2]]; [b, c] = [c, b]; } this.pos.push(...a, ...b, ...c); this.nor.push(...n, ...n, ...n); };
    const P = (q, w) => this.map([q[0], q[1], w]);
    for (let i = 1; i + 1 < m; i++) flat(P(top[0], w1), P(top[i], w1), P(top[i + 1], w1));
    for (let i = 0; i < m; i++) { const j = (i + 1) % m; flat(P(outline[i], w0), P(outline[j], w0), P(top[j], w1)); flat(P(outline[i], w0), P(top[j], w1), P(top[i], w1)); }
  }

  /** The sculpture as one geometry (non-indexed). */
  geometry() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute('normal', new Float32BufferAttribute(new Float32Array(this.nor), 3));
    return g;
  }
}
