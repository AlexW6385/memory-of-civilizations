// The shapes of the garden-and-street animals (src/engine/fauna-critters.js draws them): each a
// low-poly model of a few hundred triangles, built from tubes along a path, ellipsoids and flat
// leaves, in metres, +x forward (the beak), +y up, +z across. Every vertex carries its colour, its
// normal, the PART of the animal it belongs to and that part's pivot, so that the shader can turn a
// neck, a head, a wing or a leg about its joint:
//   0 body (fixed)   1 neck   2 head (turns about its pivot, then with the neck)   3 tail
//   4 5 front legs (a biped's left and right)   6 7 hind legs   8 9 wings (left −z, right +z)
//   10 a prop that stays at the place (nest, cage, boat)   11 an eye (as the head; blinks shut)
//   12 nestlings' heads (rise when the parent comes)   13 a thing that shows only at times (a fish in the bill, a dog's forepaws lying)
// Nothing here is random: the speckles are hashes of the position.

const TAU = Math.PI * 2;
const v3 = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
};
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash3 = (p, s = 0) => { const k = Math.sin(p[0] * 127.1 + p[1] * 311.7 + p[2] * 74.7 + s * 19.19) * 43758.5453; return k - Math.floor(k); };
const shade = (c, k) => c.map((v) => Math.max(0, Math.min(1, v * k)));

export class Model {
  constructor() { this.pos = []; this.nrm = []; this.col = []; this.part = []; this.pv = []; this.pv2 = []; this.pv3 = []; this.idx = []; this.def = { part: 0, pv: [0, 0, 0], pv2: null, pv3: null }; }
  get n() { return this.part.length; }
  get tris() { return this.idx.length / 3; }
  /** Run fn with the part and pivots given (pv2: the parent's pivot, default the own). */
  as(part, pv = [0, 0, 0], pv2 = null, fn, pv3 = null) { const o = this.def; this.def = { part, pv, pv2, pv3 }; fn(); this.def = o; return this; }
  vert(p, n, c) { const d = this.def; this.pos.push(...p); this.nrm.push(...n); this.col.push(...c); this.part.push(d.part); this.pv.push(...d.pv); this.pv2.push(...(d.pv2 || d.pv)); this.pv3.push(...(d.pv3 || d.pv2 || d.pv)); return this.part.length - 1; }
  /** A triangle, wound so that its face normal agrees with the vertices' normals. */
  tri(a, b, c) {
    const P = (i) => [this.pos[i * 3], this.pos[i * 3 + 1], this.pos[i * 3 + 2]], N = (i) => [this.nrm[i * 3], this.nrm[i * 3 + 1], this.nrm[i * 3 + 2]];
    const fn = v3.cross(v3.sub(P(b), P(a)), v3.sub(P(c), P(a))), nn = v3.add(v3.add(N(a), N(b)), N(c));
    if (v3.dot(fn, nn) < 0) this.idx.push(a, c, b); else this.idx.push(a, b, c);
  }
  /**
   * A tube along `path` (points), radii per point as [ry, rz] or a number, `sides` round; `ref` the direction that
   * is "up" for the ring's frame. col: an rgb or a function ({ p, n, t }) → rgb.
   */
  tube(path, rad, { sides = 7, ref = [0, 1, 0], col = [0.5, 0.5, 0.5], cap = true } = {}) {
    const rings = [], L = path.length, cf = typeof col === 'function' ? col : () => col;
    if (typeof rad === 'number') rad = path.map(() => rad);
    for (let i = 0; i < L; i++) {
      const T = v3.norm(v3.sub(path[Math.min(i + 1, L - 1)], path[Math.max(i - 1, 0)]));
      let u = v3.sub(ref, v3.mul(T, v3.dot(ref, T)));
      if (v3.len(u) < 1e-3) u = v3.sub([1, 0, 0], v3.mul(T, T[0]));
      u = v3.norm(u); const s = v3.cross(T, u);
      const [ry, rz] = Array.isArray(rad[i]) ? rad[i] : [rad[i], rad[i]], ring = [];
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * TAU, sn = Math.sin(a), cs = Math.cos(a);
        const p = v3.add(path[i], v3.add(v3.mul(u, ry * sn), v3.mul(s, rz * cs)));
        const nn = v3.norm(v3.add(v3.mul(u, sn / Math.max(ry, 1e-3)), v3.mul(s, cs / Math.max(rz, 1e-3))));
        ring.push(this.vert(p, nn, cf({ p, n: nn, t: i / Math.max(1, L - 1) })));
      }
      rings.push(ring);
    }
    for (let i = 0; i + 1 < L; i++) for (let k = 0; k < sides; k++) {
      const k2 = (k + 1) % sides;
      this.tri(rings[i][k], rings[i][k2], rings[i + 1][k2]); this.tri(rings[i][k], rings[i + 1][k2], rings[i + 1][k]);
    }
    if (cap) for (const [i, sg] of [[0, -1], [L - 1, 1]]) {
      const T = v3.mul(v3.norm(v3.sub(path[Math.min(i + 1, L - 1)], path[Math.max(i - 1, 0)])), sg);
      const c = this.vert(path[i], T, cf({ p: path[i], n: T, t: i / Math.max(1, L - 1) }));
      for (let k = 0; k < sides; k++) this.tri(c, rings[i][k], rings[i][(k + 1) % sides]);
    }
  }
  /** An ellipsoid at c with radii r = [rx, ry, rz], its long axis along x. */
  ball(c, r, col = [0.5, 0.5, 0.5], { nu = 6, nv = 6 } = {}) {
    const cf = typeof col === 'function' ? col : () => col, rows = [];
    for (let i = 0; i <= nu; i++) {
      const a = (i / nu) * Math.PI, row = [];
      for (let k = 0; k < (i === 0 || i === nu ? 1 : nv); k++) {
        const b = (k / nv) * TAU, ca = Math.cos(a), sa = Math.sin(a);
        const p = [c[0] + r[0] * ca, c[1] + r[1] * sa * Math.sin(b), c[2] + r[2] * sa * Math.cos(b)];
        const nn = v3.norm([ca / r[0], (sa * Math.sin(b)) / r[1], (sa * Math.cos(b)) / r[2]]);
        row.push(this.vert(p, nn, cf({ p, n: nn, t: i / nu })));
      }
      rows.push(row);
    }
    for (let i = 0; i < nu; i++) for (let k = 0; k < nv; k++) {
      const k2 = (k + 1) % nv, A = rows[i], B = rows[i + 1];
      const a0 = A.length === 1 ? A[0] : A[k], a1 = A.length === 1 ? A[0] : A[k2], b0 = B.length === 1 ? B[0] : B[k], b1 = B.length === 1 ? B[0] : B[k2];
      if (A.length !== 1) this.tri(a0, a1, b1);
      if (B.length !== 1) this.tri(a0, b1, b0);
      else if (A.length !== 1) { /* the last row's pole: the triangle above is enough */ }
    }
  }
  /** A flat polygon (a leaf, a comb, a feather): points in order, an rgb or one rgb per point. Seen from both sides. */
  poly(pts, col = [0.5, 0.5, 0.5]) {
    const c = pts.reduce((a, p) => v3.add(a, p), [0, 0, 0]).map((v) => v / pts.length), cols = Array.isArray(col[0]) ? col : pts.map(() => col);
    const nn = v3.norm(v3.cross(v3.sub(pts[1], pts[0]), v3.sub(pts[2], pts[0]))), ids = pts.map((p, i) => this.vert(p, nn, cols[i]));
    const cc = pts.length > 3 ? this.vert(c, nn, cols[0].map((_, j) => cols.reduce((a, q) => a + q[j], 0) / cols.length)) : -1;
    if (pts.length === 3) this.idx.push(ids[0], ids[1], ids[2]);
    else for (let i = 0; i < pts.length; i++) this.idx.push(cc, ids[i], ids[(i + 1) % pts.length]);
  }
  /** A thin flat strip along a curve: path points with half-widths, in the plane given by `side` (the direction it widens in). */
  ribbon(path, half, side, col) {
    const cf = typeof col === 'function' ? col : () => col, up = v3.norm(v3.cross(side, v3.sub(path[path.length - 1], path[0])));
    const L = [], R = [];
    path.forEach((p, i) => { const h = half[i]; L.push(this.vert(v3.add(p, v3.mul(side, h)), up, cf({ p, t: i / (path.length - 1) }))); R.push(this.vert(v3.sub(p, v3.mul(side, h)), up, cf({ p, t: i / (path.length - 1) }))); });
    for (let i = 0; i + 1 < path.length; i++) { this.tri(L[i], R[i], R[i + 1]); this.tri(L[i], R[i + 1], L[i + 1]); }
  }
  scale(k) { for (const a of [this.pos, this.pv, this.pv2, this.pv3]) for (let i = 0; i < a.length; i++) a[i] *= k; return this; }
  /** Rotate everything (positions, normals, pivots) about y by a (a model turned to another heading). */
  yaw(a) {
    const c = Math.cos(a), s = Math.sin(a);
    for (const arr of [this.pos, this.nrm, this.pv, this.pv2, this.pv3]) for (let i = 0; i < arr.length; i += 3) { const x = arr[i], z = arr[i + 2]; arr[i] = x * c - z * s; arr[i + 2] = x * s + z * c; }
    return this;
  }
  /** Append another model's vertices, moved by d. */
  add(o, d = [0, 0, 0]) {
    const base = this.n;
    for (let i = 0; i < o.n; i++) {
      this.pos.push(o.pos[i * 3] + d[0], o.pos[i * 3 + 1] + d[1], o.pos[i * 3 + 2] + d[2]); this.nrm.push(o.nrm[i * 3], o.nrm[i * 3 + 1], o.nrm[i * 3 + 2]);
      this.col.push(o.col[i * 3], o.col[i * 3 + 1], o.col[i * 3 + 2]); this.part.push(o.part[i]);
      this.pv.push(o.pv[i * 3] + d[0], o.pv[i * 3 + 1] + d[1], o.pv[i * 3 + 2] + d[2]); this.pv2.push(o.pv2[i * 3] + d[0], o.pv2[i * 3 + 1] + d[1], o.pv2[i * 3 + 2] + d[2]); this.pv3.push(o.pv3[i * 3] + d[0], o.pv3[i * 3 + 1] + d[1], o.pv3[i * 3 + 2] + d[2]);
    }
    for (const i of o.idx) this.idx.push(base + i);
    return this;
  }
}

// a pair of leaves for a wing, folded along the body: [x, y, z] points for the −z wing; the +z wing mirrors it
function wingLeaf(m, pts, col, sgn) {
  const q = pts.map((p) => [p[0], p[1], p[2] * sgn]);
  m.poly(q, Array.isArray(col[0]) ? col : q.map(() => col));
}
const EYE = [0.03, 0.03, 0.03];
/** An eye either side of the head at (x, y) with half-spread z. */
function eyes(m, x, y, z, r, col = EYE) { const hp = m.def.pv, np = m.def.pv2 || m.def.pv; for (const s of [-1, 1]) m.as(11, [x, y, s * z], hp, () => m.ball([x, y, s * z], [r, r * 1.05, r], col, { nu: 4, nv: 5 }), np); }

// ═════════════ ducks ═════════════
/** A duck afloat (the waterline at y = 0): the mandarin drake or hen, or a farm duck, white or brown. */
export function duck(variant) {
  const m = new Model(), drake = variant === 'drake', hen = variant === 'hen', white = variant === 'white', big = white || variant === 'brown';
  const body = ({ p, n }) => {
    if (drake) {
      const top = sm(0.35, 0.7, n[1]), under = sm(-0.35, -0.6, n[1]), front = sm(0.07, 0.12, p[0]) * (1 - sm(0.2, 0.7, n[1]) * 0.7);
      let c = lerp([0.8, 0.5, 0.24], [0.22, 0.18, 0.1], top); c = lerp(c, [0.88, 0.84, 0.72], under); c = lerp(c, [0.34, 0.1, 0.22], front * (1 - under));
      const bar = sm(0.115, 0.125, p[0]) * (1 - sm(0.135, 0.145, p[0])) + sm(0.085, 0.095, p[0]) * (1 - sm(0.105, 0.115, p[0])); return lerp(c, p[0] > 0.1 ? [0.92, 0.9, 0.86] : [0.05, 0.05, 0.05], bar * 0.8 * (1 - under) * (n[1] < 0.6 ? 1 : 0));
    }
    if (hen) {
      const top = sm(0.3, 0.7, n[1]), under = sm(-0.3, -0.6, n[1]); let c = lerp([0.5, 0.44, 0.37], [0.3, 0.26, 0.22], top); c = lerp(c, [0.86, 0.82, 0.74], under);
      return hash3(p, 3) > 0.84 && n[1] < 0.5 ? [0.82, 0.8, 0.74] : c;
    }
    if (white) return lerp([0.94, 0.93, 0.89], [0.99, 0.98, 0.95], sm(0.2, 0.8, n[1]));
    const top = sm(0.25, 0.7, n[1]), under = sm(-0.3, -0.6, n[1]); let c = lerp([0.5, 0.38, 0.24], [0.3, 0.22, 0.14], top); c = lerp(c, [0.78, 0.7, 0.55], under);
    return hash3(p, 4) > 0.8 ? shade(c, 1.35) : c;
  };
  const S = [[0.165, 0.045, 0.018], [0.13, 0.05, 0.062], [0.07, 0.052, 0.082], [0.0, 0.054, 0.086], [-0.07, 0.05, 0.08], [-0.14, 0.046, 0.058], [-0.2, 0.06, 0.03], [-0.235, 0.07, 0.006]];
  m.tube(S.map((s) => [s[0], s[1], 0]), S.map((s) => [s[2], s[2] * 0.93]), { sides: 8, col: body });
  // the folded wing's tip over the tail, a darker shape on each flank
  for (const s of [-1, 1]) m.ball([-0.03, 0.085, s * 0.062], [0.12, 0.03, 0.022], ({ n }) => (drake ? lerp([0.2, 0.2, 0.28], [0.5, 0.3, 0.12], sm(0.2, 0.8, n[1])) : white ? [0.96, 0.95, 0.92] : [0.28, 0.24, 0.2]), { nu: 5, nv: 5 });
  if (drake) for (const s of [-1, 1]) {   // the orange "sail" feathers standing up from the back
    m.poly([[-0.0, 0.105, s * 0.05], [-0.09, 0.115, s * 0.052], [-0.115, 0.2, s * 0.05], [-0.075, 0.215, s * 0.048], [-0.03, 0.17, s * 0.05]], [[0.55, 0.2, 0.06], [0.7, 0.28, 0.07], [0.95, 0.5, 0.12], [0.98, 0.58, 0.16], [0.85, 0.4, 0.1]]);
  }
  const bill = drake ? [0.82, 0.15, 0.1] : hen ? [0.3, 0.3, 0.3] : white ? [0.96, 0.6, 0.14] : [0.45, 0.4, 0.2];
  const NP = [0.115, 0.095, 0], HP = [0.17, 0.15, 0];
  // tail
  m.as(3, [-0.2, 0.065, 0], null, () => m.tube([[-0.19, 0.066, 0], [-0.26, 0.078, 0], [-0.3, 0.09, 0]], [[0.022, 0.034], [0.012, 0.03], [0.002, 0.004]], { sides: 5, col: drake ? [0.1, 0.1, 0.12] : hen ? [0.25, 0.22, 0.2] : white ? [0.95, 0.94, 0.9] : [0.25, 0.2, 0.15], cap: true }));
  // neck, then head
  m.as(1, NP, null, () => m.tube([[0.115, 0.09, 0], [0.145, 0.13, 0], [0.175, 0.17, 0]], [0.034, 0.03, 0.026], { sides: 6, ref: [1, 0, 0], col: ({ p }) => (drake ? lerp([0.34, 0.1, 0.22], [0.8, 0.4, 0.12], sm(0.1, 0.17, p[1])) : hen ? [0.46, 0.42, 0.4] : white ? [0.96, 0.95, 0.92] : [0.3, 0.24, 0.16]) }));
  m.as(2, HP, NP, () => {
    m.ball([0.19, 0.185, 0], [0.043, 0.04, 0.036], ({ n }) => (drake ? lerp([0.1, 0.34, 0.26], [0.8, 0.4, 0.12], sm(0.2, -0.3, n[1])) : hen ? lerp([0.5, 0.48, 0.46], [0.7, 0.68, 0.64], sm(0.2, -0.5, n[1])) : white ? [0.97, 0.96, 0.93] : [0.28, 0.32, 0.2]));
    m.tube([[0.222, 0.178, 0], [0.245, 0.174, 0], [0.265, 0.168, 0]], [[0.012, 0.015], [0.011, 0.014], [0.007, 0.009]], { sides: 5, col: ({ t }) => (t > 0.9 ? [0.9, 0.88, 0.8] : bill) });
    if (drake) {
      for (const s of [-1, 1]) {
        m.ball([0.17, 0.168, s * 0.03], [0.04, 0.026, 0.014], [0.92, 0.5, 0.14], { nu: 5, nv: 5 });       // the cheek ruff
        m.tube([[0.15, 0.165, s * 0.034], [0.1, 0.155, s * 0.04], [0.075, 0.15, s * 0.034]], [0.012, 0.01, 0.002], { sides: 4, col: [0.95, 0.55, 0.15] });
        m.ribbon([[0.222, 0.205, s * 0.03], [0.19, 0.208, s * 0.039], [0.15, 0.2, s * 0.037]], [0.003, 0.006, 0.002], [0, 1, 0], [0.97, 0.95, 0.9]);   // the white brow
      }
      m.tube([[0.175, 0.218, 0], [0.12, 0.222, 0], [0.085, 0.2, 0]], [[0.008, 0.012], [0.012, 0.014], [0.002, 0.003]], { sides: 5, col: ({ t }) => lerp([0.1, 0.34, 0.26], [0.46, 0.2, 0.5], t) });   // the crest
    } else if (hen) {
      for (const s of [-1, 1]) m.ribbon([[0.222, 0.19, s * 0.034], [0.19, 0.195, s * 0.041], [0.155, 0.19, s * 0.038]], [0.004, 0.005, 0.002], [0, 1, 0], [0.95, 0.94, 0.9]);
    }
    eyes(m, 0.205, 0.19, 0.032, 0.007, [0.03, 0.02, 0.02]);
  });
  return big ? m.scale(1.3) : m;
}

// ═════════════ crane ═════════════
/** The red-crowned crane (about 1.5 m with the neck up): white, black neck and secondaries, red crown, black legs. */
export function crane() {
  const m = new Model(), W = [0.96, 0.96, 0.94], BK = [0.07, 0.07, 0.08];
  const S = [[0.3, 0.93, 0.08, 0.06], [0.22, 0.92, 0.15, 0.11], [0.07, 0.9, 0.2, 0.14], [-0.1, 0.89, 0.2, 0.14], [-0.27, 0.9, 0.15, 0.11], [-0.4, 0.92, 0.07, 0.06], [-0.46, 0.93, 0.012, 0.012]];
  m.tube(S.map((s) => [s[0], s[1], 0]), S.map((s) => [s[2], s[3]]), { sides: 9, col: ({ n }) => lerp([0.9, 0.9, 0.88], W, sm(-0.5, 0.6, n[1])) });
  for (const s of [-1, 1]) {   // folded wings, and the black secondaries that lie over the rump
    m.ball([0.0, 0.965, s * 0.13], [0.34, 0.1, 0.045], ({ p }) => lerp(W, BK, sm(-0.12, -0.3, p[0])), { nu: 6, nv: 6 });
  }
  m.ball([-0.26, 0.97, 0], [0.3, 0.07, 0.12], BK, { nu: 6, nv: 6 });
  m.tube([[-0.28, 0.955, 0], [-0.45, 0.935, 0], [-0.6, 0.9, 0]], [[0.05, 0.1], [0.04, 0.07], [0.004, 0.008]], { sides: 6, col: BK });
  const NP = [0.25, 0.95, 0], NM = [0.37, 1.31, 0];
  m.as(1, NP, null, () => {
    m.tube([[0.25, 0.95, 0], [0.31, 1.08, 0], [0.37, 1.2, 0], [0.37, 1.31, 0]], [0.052, 0.042, 0.036, 0.032], { sides: 7, ref: [1, 0, 0], col: BK });
    m.ball([0.27, 0.95, 0], [0.08, 0.07, 0.06], W, { nu: 4, nv: 5 });
  });
  m.as(2, NM, NP, () => {
    m.tube([[0.37, 1.31, 0], [0.385, 1.42, 0], [0.4, 1.52, 0], [0.42, 1.585, 0]], [0.032, 0.03, 0.03, 0.035], { sides: 7, ref: [1, 0, 0], col: BK });
    m.ball([0.43, 1.6, 0], [0.065, 0.04, 0.04], ({ n, p }) => (n[0] < -0.2 || (p[1] > 1.6 && p[0] < 0.42) ? W : BK), { nu: 5, nv: 6 });
    m.ball([0.4, 1.607, 0], [0.032, 0.026, 0.033], [0.98, 0.97, 0.96], { nu: 4, nv: 5 });                    // the white ear patch and nape
    m.tube([[0.375, 1.45, 0], [0.385, 1.52, 0], [0.4, 1.585, 0]], [[0.014, 0.02], [0.012, 0.022], [0.012, 0.02]], { sides: 4, col: W });
    m.ball([0.445, 1.635, 0], [0.034, 0.009, 0.026], [0.85, 0.08, 0.06], { nu: 3, nv: 5 });              // the red crown
    m.tube([[0.485, 1.592, 0], [0.575, 1.57, 0], [0.68, 1.545, 0]], [[0.024, 0.02], [0.015, 0.014], [0.004, 0.005]], { sides: 5, col: ({ t }) => lerp([0.5, 0.52, 0.4], [0.62, 0.62, 0.52], t) });
    eyes(m, 0.462, 1.608, 0.036, 0.008, [0.25, 0.12, 0.05]);
  });
  const LEG = [0.06, 0.06, 0.07];
  for (const [part, s] of [[4, -1], [5, 1]]) {
    const hip = [0.0, 0.8, s * 0.075];
    m.as(part, hip, null, () => {
      m.tube([hip, [-0.03, 0.62, s * 0.075], [-0.045, 0.5, s * 0.075]], [0.026, 0.017, 0.013], { sides: 5, col: BK });                     // the feathered thigh, then the tibia to the heel
      m.tube([[-0.045, 0.5, s * 0.075], [-0.02, 0.26, s * 0.075], [0.005, 0.03, s * 0.075]], [0.013, 0.01, 0.009], { sides: 5, col: LEG });  // the tarsus
      for (const a of [-0.28, 0, 0.28]) m.tube([[0.0, 0.03, s * 0.075], [0.05, 0.02, s * 0.075 + a * 0.12], [0.12, 0.008, s * 0.075 + a * 0.3]], [0.008, 0.007, 0.004], { sides: 4, col: LEG });
    });
  }
  return m;
}

// ═════════════ hens and the cock ═════════════
export function fowl(variant) {
  const m = new Model(), rooster = variant === 'rooster', white = variant === 'white';
  const C = rooster ? { back: [0.62, 0.22, 0.08], breast: [0.1, 0.09, 0.08], tail: [0.05, 0.14, 0.12], hackle: [0.88, 0.5, 0.12] } : white ? { back: [0.94, 0.93, 0.9], breast: [0.96, 0.95, 0.92], tail: [0.9, 0.89, 0.85], hackle: [0.96, 0.95, 0.92] } : { back: [0.5, 0.33, 0.18], breast: [0.6, 0.44, 0.26], tail: [0.2, 0.15, 0.1], hackle: [0.58, 0.4, 0.2] };
  const s = rooster ? 1.12 : 1;
  const S = [[0.15, 0.25, 0.04, 0.035], [0.1, 0.25, 0.085, 0.07], [0.0, 0.23, 0.1, 0.082], [-0.1, 0.22, 0.09, 0.07], [-0.17, 0.25, 0.05, 0.045], [-0.2, 0.28, 0.01, 0.01]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 8, col: ({ p, n }) => { const c = lerp(C.back, C.breast, sm(0.4, -0.3, n[1]) * (1 - sm(-0.1, 0.12, -p[0]) * 0.3)); return hash3(p, 5) > 0.88 && !white ? shade(c, rooster ? 1.5 : 1.6) : c; } });
  for (const z of [-1, 1]) m.ball([-0.02, 0.255, z * 0.07], [0.1, 0.045, 0.03], ({ p }) => lerp(shade(C.back, 0.9), shade(C.tail, 1.3), sm(-0.05, -0.12, p[0]) * (rooster ? 1 : 0.5)), { nu: 5, nv: 5 });
  m.as(3, [-0.17, 0.26, 0], null, () => {
    if (rooster) {
      m.tube([[-0.17, 0.27, 0], [-0.26, 0.38, 0], [-0.34, 0.47, 0], [-0.42, 0.45, 0], [-0.46, 0.38, 0]], [[0.015, 0.04], [0.016, 0.05], [0.014, 0.04], [0.012, 0.03], [0.002, 0.004]], { sides: 5, col: ({ t }) => lerp(C.tail, [0.1, 0.35, 0.2], t) });
      m.tube([[-0.16, 0.27, 0.0], [-0.22, 0.34, 0.02], [-0.3, 0.38, 0.05], [-0.36, 0.34, 0.05]], [[0.01, 0.03], [0.01, 0.03], [0.008, 0.02], [0.002, 0.004]], { sides: 4, col: [0.6, 0.2, 0.07] });
    } else m.poly([[-0.17, 0.25, -0.02], [-0.17, 0.25, 0.02], [-0.26, 0.37, 0.05], [-0.28, 0.4, 0], [-0.26, 0.37, -0.05]], [C.back, C.back, shade(C.tail, 1.2), C.tail, shade(C.tail, 1.2)]);
  });
  const NP = [0.11, 0.27, 0], HP = [0.15, 0.37, 0], hd = rooster ? 0.01 : 0;
  m.as(1, NP, null, () => m.tube([[0.1, 0.27, 0], [0.13, 0.33, 0], [0.16, 0.395 + hd, 0]], [0.04, 0.03, 0.026], { sides: 6, ref: [1, 0, 0], col: ({ t }) => lerp(C.breast, C.hackle, t) }));
  m.as(2, HP, NP, () => {
    m.ball([0.18, 0.415 + hd, 0], [0.032, 0.03, 0.025], ({ n }) => (white ? C.back : n[1] > 0.5 ? shade(C.back, 0.8) : lerp([0.6, 0.45, 0.3], [0.85, 0.2, 0.15], sm(0.3, -0.3, n[1]) * 0.4)));
    m.tube([[0.205, 0.41 + hd, 0], [0.225, 0.405 + hd, 0]], [[0.011, 0.013], [0.002, 0.003]], { sides: 4, col: [0.85, 0.65, 0.2] });
    const RED = [0.85, 0.1, 0.08];
    if (rooster) m.poly([[0.17, 0.43, 0], [0.17, 0.465, 0.0], [0.185, 0.46, 0.0], [0.19, 0.48, 0], [0.2, 0.455, 0], [0.205, 0.465, 0], [0.205, 0.42, 0]], RED);
    else m.poly([[0.17, 0.435, 0], [0.18, 0.455, 0.0], [0.195, 0.43, 0]], RED);
    m.ball([0.2, 0.388 + hd, 0], [0.008, rooster ? 0.022 : 0.012, 0.009], RED, { nu: 3, nv: 4 });
    eyes(m, 0.19, 0.422 + hd, 0.022, 0.006, [0.3, 0.12, 0.03]);
  });
  for (const [part, z] of [[4, -1], [5, 1]]) {
    const hip = [0.0, 0.17, z * 0.045];
    m.as(part, hip, null, () => {
      m.tube([hip, [0.0, 0.08, z * 0.045], [0.005, 0.012, z * 0.045]], [0.017, 0.009, 0.007], { sides: 4, col: ({ t }) => (t < 0.2 ? C.back : [0.8, 0.65, 0.3]) });
      for (const a of [-0.5, 0, 0.5]) m.tube([[0.005, 0.012, z * 0.045], [0.04, 0.006, z * 0.045 + a * 0.02], [0.07, 0.003, z * 0.045 + a * 0.045]], [0.005, 0.004, 0.003], { sides: 3, col: [0.8, 0.65, 0.3] });
    });
  }
  return m.scale(s);
}

// ═════════════ the cat ═════════════
/** A cat lying in a loaf (brown tabby, or orange), the head up on a short neck, the paws under the chest, the tail along its flank. */
export function cat(variant) {
  const m = new Model(), orange = variant === 'orange';
  const base = orange ? [0.78, 0.45, 0.18] : [0.42, 0.34, 0.26], dark = orange ? [0.55, 0.28, 0.08] : [0.14, 0.11, 0.09], pale = orange ? [0.92, 0.82, 0.66] : [0.68, 0.62, 0.52];
  const fur = ({ p, n }) => { const st = Math.sin(p[0] * 70 + p[2] * 8) * 0.5 + 0.5, band = sm(0.55, 0.75, st) * sm(-0.2, 0.3, n[1]); return lerp(lerp(base, pale, sm(-0.2, -0.8, n[1])), dark, band * 0.8); };
  const S = [[0.16, 0.07, 0.04, 0.05], [0.1, 0.095, 0.09, 0.1], [0.0, 0.105, 0.105, 0.115], [-0.1, 0.1, 0.105, 0.115], [-0.18, 0.075, 0.075, 0.085], [-0.22, 0.05, 0.03, 0.04]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 8, col: fur });
  for (const z of [-1, 1]) m.ball([-0.12, 0.085, z * 0.065], [0.075, 0.08, 0.04], fur, { nu: 5, nv: 6 });          // the haunches
  for (const z of [-1, 1]) m.ball([0.16, 0.022, z * 0.05], [0.05, 0.022, 0.024], ({ n }) => lerp(pale, base, sm(0, 0.8, n[1])), { nu: 4, nv: 5 });   // the paws, tucked under
  const NP = [0.12, 0.1, 0], HP = [0.19, 0.13, 0];
  m.as(1, NP, null, () => m.tube([[0.11, 0.1, 0], [0.15, 0.135, 0], [0.185, 0.16, 0]], [[0.06, 0.06], [0.05, 0.05], [0.045, 0.045]], { sides: 7, ref: [1, 0, 0], col: fur }));
  m.as(2, HP, NP, () => {
    m.ball([0.2, 0.17, 0], [0.058, 0.05, 0.055], ({ p, n }) => lerp(fur({ p, n }), pale, sm(0.05, 0.2, p[0]) * sm(0.2, -0.3, n[1])), { nu: 6, nv: 7 });
    m.ball([0.255, 0.155, 0], [0.018, 0.014, 0.02], pale, { nu: 4, nv: 5 });                                  // the muzzle
    m.ball([0.268, 0.16, 0], [0.006, 0.005, 0.009], [0.75, 0.4, 0.4], { nu: 3, nv: 4 });                       // the nose
    for (const s of [-1, 1]) {
      m.tube([[0.185, 0.2, s * 0.034], [0.178, 0.228, s * 0.04], [0.172, 0.248, s * 0.046]], [[0.012, 0.022], [0.009, 0.016], [0.002, 0.003]], { sides: 4, col: ({ t }) => lerp(fur({ p: [0.18, 0.22, s], n: [0, 1, 0] }), [0.65, 0.4, 0.4], t * 0.4) });  // the ears
    }
    eyes(m, 0.243, 0.18, 0.027, 0.0095, orange ? [0.5, 0.6, 0.15] : [0.55, 0.62, 0.2]);
  });
  m.as(3, [-0.2, 0.06, 0.02], null, () => m.tube([[-0.2, 0.06, 0.03], [-0.27, 0.05, 0.1], [-0.2, 0.04, 0.16], [-0.1, 0.035, 0.17], [0.05, 0.03, 0.15], [0.12, 0.03, 0.13]], [0.02, 0.02, 0.019, 0.018, 0.017, 0.012], { sides: 5, col: ({ t, p }) => (t > 0.85 ? dark : fur({ p, n: [0, 1, 0] })) }));
  return m;
}

// ═════════════ the dog ═════════════
/** A yellow village dog, standing (the shader folds the legs and drops it to lie down, the forepaws laid out in front). */
export function dog() {
  const m = new Model(), tan = [0.7, 0.5, 0.26], pale = [0.9, 0.82, 0.66], dark = [0.35, 0.22, 0.1];
  const fur = ({ p, n }) => lerp(lerp(tan, pale, sm(-0.1, -0.7, n[1])), dark, sm(0.6, 0.9, n[1]) * sm(-0.2, 0.1, p[0]) * 0.5 + hash3(p, 8) * 0.06);
  const S = [[0.3, 0.33, 0.07, 0.075], [0.22, 0.35, 0.12, 0.1], [0.1, 0.36, 0.13, 0.105], [-0.05, 0.35, 0.12, 0.1], [-0.2, 0.35, 0.115, 0.095], [-0.3, 0.34, 0.08, 0.07], [-0.34, 0.33, 0.02, 0.02]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 9, col: fur });
  const NP = [0.26, 0.4, 0], HP = [0.4, 0.55, 0];
  m.as(1, NP, null, () => m.tube([[0.24, 0.39, 0], [0.31, 0.46, 0], [0.37, 0.52, 0]], [[0.08, 0.075], [0.065, 0.06], [0.055, 0.052]], { sides: 7, ref: [1, 0, 0], col: fur }));
  m.as(2, HP, NP, () => {
    m.ball([0.4, 0.555, 0], [0.065, 0.055, 0.05], fur, { nu: 6, nv: 7 });
    m.tube([[0.43, 0.54, 0], [0.5, 0.525, 0], [0.545, 0.515, 0]], [[0.034, 0.034], [0.028, 0.03], [0.022, 0.026]], { sides: 6, col: ({ t }) => lerp(pale, pale, t) });
    m.ball([0.552, 0.52, 0], [0.012, 0.011, 0.016], [0.05, 0.04, 0.04], { nu: 3, nv: 5 });
    for (const s of [-1, 1]) m.tube([[0.385, 0.6, s * 0.035], [0.375, 0.64, s * 0.05], [0.395, 0.665, s * 0.06]], [[0.012, 0.03], [0.01, 0.026], [0.002, 0.004]], { sides: 4, col: dark });
    eyes(m, 0.45, 0.575, 0.034, 0.008, [0.1, 0.06, 0.03]);
  });
  m.as(3, [-0.32, 0.34, 0], null, () => m.tube([[-0.32, 0.34, 0], [-0.4, 0.42, 0], [-0.43, 0.5, 0], [-0.4, 0.55, 0]], [0.02, 0.018, 0.014, 0.004], { sides: 5, col: ({ t }) => lerp(tan, pale, t) }));
  const legs = [[4, 1, -1, 0.2], [5, 1, 1, 0.2], [6, 0, -1, -0.22], [7, 0, 1, -0.22]];
  for (const [part, front, z, x] of legs) {
    const hip = [x, 0.3, z * 0.075];
    m.as(part, hip, null, () => {
      m.tube([hip, [x - (front ? 0 : 0.03), 0.17, z * 0.075], [x - (front ? 0 : 0.02), 0.07, z * 0.075], [x + 0.01, 0.015, z * 0.075]], [[0.04, 0.035], [0.022, 0.02], [0.016, 0.015], [0.02, 0.022]], { sides: 5, col: ({ t }) => lerp(tan, pale, sm(0.3, 0.8, t)) });
      m.ball([x + 0.025, 0.012, z * 0.075], [0.04, 0.014, 0.022], pale, { nu: 4, nv: 5 });
    });
  }
  m.as(13, [0.5, 0.04, 0], null, () => { for (const z of [-1, 1]) { m.tube([[0.28, 0.07, z * 0.07], [0.42, 0.04, z * 0.07], [0.5, 0.025, z * 0.07]], [[0.04, 0.03], [0.026, 0.026], [0.024, 0.028]], { sides: 5, col: ({ t }) => lerp(tan, pale, t) }); } });
  return m;
}

// ═════════════ cormorant ═════════════
/** A great cormorant perched upright (the feet at y = 0): black with a bronze sheen, the hooked bill, the yellow throat, a straw ring at the neck base. */
export function cormorant() {
  const m = new Model(), BK = [0.06, 0.06, 0.055], BR = [0.2, 0.15, 0.09];
  const sheen = ({ n }) => lerp(BK, BR, sm(0.3, 0.9, n[1]) * 0.7);
  const S = [[0.15, 0.4, 0.05, 0.045], [0.1, 0.38, 0.1, 0.085], [0.0, 0.31, 0.115, 0.095], [-0.1, 0.23, 0.09, 0.08], [-0.17, 0.17, 0.04, 0.04], [-0.2, 0.14, 0.01, 0.01]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 8, col: sheen });
  const NP = [0.12, 0.43, 0], NM = [0.1, 0.62, 0];
  m.as(1, NP, null, () => m.tube([[0.12, 0.43, 0], [0.15, 0.5, 0], [0.12, 0.58, 0], [0.1, 0.65, 0], [0.14, 0.71, 0]], [0.05, 0.034, 0.03, 0.03, 0.03], { sides: 6, ref: [1, 0, 0], col: sheen }));
  m.as(1, NP, null, () => m.tube(Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * TAU; return [0.135 + Math.cos(a) * 0.02, 0.47, Math.sin(a) * 0.04]; }), 0.006, { sides: 4, col: [0.62, 0.5, 0.28], cap: false }));   // the straw ring
  m.as(2, NM, NP, () => {
    m.ball([0.17, 0.735, 0], [0.046, 0.03, 0.028], sheen);
    m.tube([[0.205, 0.735, 0], [0.26, 0.732, 0], [0.31, 0.725, 0], [0.335, 0.705, 0]], [[0.016, 0.014], [0.014, 0.012], [0.01, 0.01], [0.002, 0.003]], { sides: 5, col: ({ t }) => lerp([0.5, 0.48, 0.4], [0.2, 0.2, 0.18], t) });
    m.ball([0.215, 0.712, 0], [0.026, 0.018, 0.022], [0.92, 0.66, 0.1], { nu: 4, nv: 5 });
    m.ball([0.19, 0.725, 0], [0.026, 0.02, 0.03], [0.95, 0.94, 0.9], { nu: 4, nv: 5 });
    eyes(m, 0.19, 0.74, 0.024, 0.0075, [0.2, 0.5, 0.45]);
  });
  m.as(3, [-0.15, 0.18, 0], null, () => m.tube([[-0.15, 0.18, 0], [-0.24, 0.09, 0], [-0.3, 0.03, 0]], [[0.02, 0.05], [0.014, 0.04], [0.003, 0.012]], { sides: 5, col: BK }));
  for (const [part, z, sg] of [[8, -1, -1], [9, 1, 1]]) m.as(part, [0.05, 0.4, z * 0.1], null, () => wingLeaf(m, [[0.07, 0.41, 0.09], [-0.08, 0.38, 0.12], [-0.25, 0.22, 0.13], [-0.13, 0.22, 0.11], [-0.02, 0.27, 0.09]], [[0.06, 0.06, 0.055], [0.1, 0.08, 0.05], [0.04, 0.04, 0.04], [0.07, 0.06, 0.05], [0.06, 0.055, 0.05]], sg));
  for (const [part, z] of [[4, -1], [5, 1]]) {
    const hip = [-0.04, 0.2, z * 0.05];
    m.as(part, hip, null, () => {
      m.tube([hip, [-0.03, 0.1, z * 0.05], [0.0, 0.02, z * 0.05]], [0.026, 0.014, 0.011], { sides: 5, col: BK });
      m.poly([[0.0, 0.015, z * 0.05], [0.1, 0.01, z * 0.05 - z * 0.05], [0.1, 0.01, z * 0.05 + z * 0.045], [0.02, 0.012, z * 0.09]], [0.15, 0.13, 0.1]);
    });
  }
  return m;
}

// ═════════════ the fishing craft (a prop; the cormorants stand on its rails) ═════════════
/** A narrow cormorant-fishing punt of the Taihu country, 5.4 m long, the waterline at y = 0, a plank rail along each side at y 0.3. */
export function craft() {
  const m = new Model(), wood = [0.4, 0.3, 0.19], pitch = [0.16, 0.12, 0.09], deck = [0.5, 0.4, 0.26], bamboo = [0.55, 0.5, 0.25];
  m.as(10, [0, 0, 0], null, () => {
    const hull = [[-2.7, 0.3, 0], [-2.2, 0.1, 0], [-1.0, 0.0, 0], [1.0, 0.0, 0], [2.2, 0.1, 0], [2.75, 0.34, 0]];
    m.tube(hull, [[0.0, 0.0], [0.2, 0.3], [0.3, 0.42], [0.3, 0.42], [0.2, 0.3], [0.0, 0.0]], { sides: 10, col: ({ n }) => lerp(pitch, wood, sm(0.1, 0.9, n[1])) });
    for (const z of [-1, 1]) {
      m.tube([[-2.3, 0.3, z * 0.18], [-1.2, 0.255, z * 0.29], [1.2, 0.255, z * 0.29], [2.3, 0.3, z * 0.18]], [[0.02, 0.04], [0.02, 0.04], [0.02, 0.04], [0.02, 0.04]], { sides: 4, col: ({ p }) => lerp(wood, shade(wood, 0.8), hash3([Math.round(p[0] * 4), 0, 0], 2)) });   // the rail plank
    }
    for (const x of [-1.6, -0.2, 1.3]) m.tube([[x, 0.225, -0.29], [x, 0.225, 0.29]], [[0.02, 0.04], [0.02, 0.04]], { sides: 4, col: wood });   // thwarts
    m.poly([[-2.1, 0.205, -0.2], [-2.1, 0.205, 0.2], [2.0, 0.215, 0.28], [2.0, 0.215, -0.28]], [deck, deck, shade(deck, 0.9), shade(deck, 0.9)]);
    m.tube([[-2.7, 0.34, 0.05], [-2.6, 0.9, 0.05]], [0.03, 0.02], { sides: 5, col: wood });                    // the stem post, a pole standing at the stern
    m.tube([[2.9, 0.36, 0.03], [-1.6, 0.34, 0.3], [-3.4, 0.8, 0.2]], [0.018, 0.018, 0.012], { sides: 5, col: bamboo });      // the punt pole
    m.ball([0.6, 0.4, 0.15], [0.17, 0.14, 0.15], ({ p }) => lerp([0.5, 0.4, 0.2], [0.35, 0.27, 0.12], hash3(p, 6)), { nu: 5, nv: 7 });   // the fish basket
  });
  return m;
}

// ═════════════ the caged songbird ═════════════
/** A bamboo cage hanging from its hook (the origin) with a hwamei-like thrush inside it. */
export function cagebird() {
  const m = new Model(), bam = [0.72, 0.55, 0.26], dk = [0.3, 0.2, 0.1], R = 0.17, top = -0.3, bot = -0.58;
  m.as(10, [0, 0, 0], null, () => {
    m.tube([[0, 0, 0], [0, -0.14, 0], [0, -0.27, 0]], [0.004, 0.004, 0.004], { sides: 3, col: dk });             // the cord
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * TAU, c = Math.cos(a), s = Math.sin(a);
      m.tube([[c * R, bot + 0.02, s * R], [c * R * 1.04, (top + bot) / 2, s * R * 1.04], [c * R * 0.5, top + 0.06, s * R * 0.5], [0, top + 0.015, 0]], [0.0035, 0.0035, 0.0035, 0.0035], { sides: 3, col: bam, cap: false });
    }
    for (const [y, r] of [[bot + 0.03, R * 1.0], [(top + bot) / 2, R * 1.04], [top + 0.075, R * 0.6]]) m.tube(Array.from({ length: 15 }, (_, i) => { const a = (i / 14) * TAU; return [Math.cos(a) * r, y, Math.sin(a) * r]; }), 0.0045, { sides: 3, col: bam, cap: false });
    m.tube([[0, bot, 0], [0, bot - 0.03, 0]], [[R * 1.05, R * 1.05], [R * 1.0, R * 1.0]], { sides: 12, col: dk });                        // the wooden base
    m.tube([[0, top + 0.02, 0], [0, top + 0.05, 0]], [[0.03, 0.03], [0.012, 0.012]], { sides: 8, col: dk });
    for (const x of [-0.07, 0.07]) m.tube([[x, bot + 0.1, -R * 0.9], [x, bot + 0.1, R * 0.9]], 0.0055, { sides: 4, col: [0.5, 0.35, 0.18] });  // the two perches
    for (const z of [-1, 1]) m.ball([0, bot + 0.05, z * 0.12], [0.022, 0.016, 0.022], [0.8, 0.85, 0.9], { nu: 4, nv: 6 });   // the porcelain cups
  });
  // the bird, perched at the perch (x = −0.07), facing +x, its feet at y = bot + 0.1
  const y0 = bot + 0.104, B = [0.45, 0.32, 0.18], BL = [0.7, 0.55, 0.36];
  const body = ({ n }) => lerp(BL, B, sm(-0.3, 0.6, n[1]));
  m.tube([[0.045, y0 + 0.045, 0], [0.02, y0 + 0.055, 0], [-0.02, y0 + 0.05, 0], [-0.06, y0 + 0.04, 0], [-0.09, y0 + 0.03, 0]], [[0.01, 0.01], [0.028, 0.026], [0.03, 0.028], [0.022, 0.02], [0.004, 0.004]], { sides: 7, col: body });
  m.as(3, [-0.06, y0 + 0.045, 0], null, () => m.tube([[-0.06, y0 + 0.042, 0], [-0.12, y0 + 0.03, 0], [-0.17, y0 + 0.015, 0]], [[0.006, 0.014], [0.005, 0.014], [0.002, 0.008]], { sides: 4, col: B }));
  const NP = [0.04, y0 + 0.07, 0];
  m.as(1, NP, null, () => m.tube([[0.03, y0 + 0.055, 0], [0.045, y0 + 0.075, 0]], [0.016, 0.014], { sides: 5, ref: [1, 0, 0], col: ({ t }) => lerp(body({ n: [0, 0, 0] }), B, t) }));
  m.as(2, [0.05, y0 + 0.085, 0], NP, () => {
    m.ball([0.056, y0 + 0.093, 0], [0.022, 0.02, 0.018], ({ n }) => lerp(B, BL, sm(0.1, -0.5, n[1])));
    m.tube([[0.074, y0 + 0.09, 0], [0.092, y0 + 0.087, 0]], [[0.006, 0.007], [0.001, 0.002]], { sides: 4, col: [0.85, 0.7, 0.3] });
    for (const s of [-1, 1]) m.ribbon([[0.07, y0 + 0.1, s * 0.0155], [0.05, y0 + 0.103, s * 0.02], [0.02, y0 + 0.098, s * 0.024]], [0.003, 0.0035, 0.0015], [0, 1, 0], [0.96, 0.95, 0.9]);   // the white eye-ring running back
    eyes(m, 0.067, y0 + 0.098, 0.0165, 0.004, [0.1, 0.07, 0.02]);
  });
  for (const [part, z] of [[4, -1], [5, 1]]) m.as(part, [0.0, y0 + 0.02, z * 0.012], null, () => m.tube([[0.0, y0 + 0.025, z * 0.012], [0.0, y0 + 0.002, z * 0.012]], 0.0025, { sides: 3, col: [0.7, 0.5, 0.4] }));
  for (const [part, sg] of [[8, -1], [9, 1]]) m.as(part, [0.015, y0 + 0.06, sg * 0.02], null, () => wingLeaf(m, [[0.02, y0 + 0.065, 0.026], [-0.04, y0 + 0.065, 0.034], [-0.11, y0 + 0.04, 0.03], [-0.05, y0 + 0.03, 0.028]], [[0.4, 0.28, 0.15], [0.38, 0.26, 0.14], [0.3, 0.2, 0.1], [0.36, 0.25, 0.13]], sg));
  return m;
}

// ═════════════ the swallow's nest and the swallow ═════════════
function swallowParts(m, y0, { perched = true } = {}) {
  const BK = [0.05, 0.09, 0.24], RD = [0.58, 0.2, 0.12], BL = [0.86, 0.78, 0.64];
  const S = [[0.07, 0.0, 0.01], [0.05, 0.0, 0.02], [0.03, 0.0, 0.034], [0.0, 0.0, 0.04], [-0.04, 0.0, 0.035], [-0.075, 0.0, 0.02], [-0.095, 0.0, 0.006]];
  m.tube(S.map((s, i) => [s[0], y0 + 0.06 - i * 0.004, 0]), S.map((s) => [s[2] * 1.05, s[2]]), { sides: 7, col: ({ n }) => lerp(BL, BK, sm(0.1, 0.6, n[1])) });
  const NP = [0.05, y0 + 0.065, 0];
  m.as(2, NP, null, () => {
    m.ball([0.075, y0 + 0.07, 0], [0.026, 0.024, 0.022], ({ n }) => lerp(RD, BK, sm(0.2, 0.7, n[1])), { nu: 5, nv: 6 });
    m.tube([[0.098, y0 + 0.066, 0], [0.11, y0 + 0.065, 0]], [[0.004, 0.009], [0.001, 0.002]], { sides: 4, col: [0.08, 0.07, 0.06] });
    eyes(m, 0.09, y0 + 0.076, 0.016, 0.0036, [0.03, 0.02, 0.02]);
  });
  m.as(3, [-0.08, y0 + 0.03, 0], null, () => {
    m.poly([[-0.07, y0 + 0.032, -0.012], [-0.07, y0 + 0.032, 0.012], [-0.15, y0 + 0.026, 0.026], [-0.12, y0 + 0.03, 0.004], [-0.15, y0 + 0.026, -0.026]], [BK, BK, [0.04, 0.07, 0.18], [0.07, 0.1, 0.2], [0.04, 0.07, 0.18]]);
    m.tube([[-0.1, y0 + 0.03, 0.02], [-0.19, y0 + 0.024, 0.03]], [[0.002, 0.006], [0.0008, 0.002]], { sides: 3, col: BK });
    m.tube([[-0.1, y0 + 0.03, -0.02], [-0.19, y0 + 0.024, -0.03]], [[0.002, 0.006], [0.0008, 0.002]], { sides: 3, col: BK });   // the long outer feathers
  });
  for (const [part, sg] of [[8, -1], [9, 1]]) m.as(part, [0.03, y0 + 0.068, sg * 0.025], null, () => wingLeaf(m, [[0.04, y0 + 0.072, 0.03], [-0.02, y0 + 0.074, 0.05], [-0.16, y0 + 0.052, 0.08], [-0.07, y0 + 0.052, 0.04], [-0.01, y0 + 0.06, 0.024]], [BK, [0.07, 0.11, 0.26], [0.03, 0.05, 0.15], [0.05, 0.08, 0.2], BK], sg));
  for (const [part, z] of [[4, -1], [5, 1]]) m.as(part, [0.0, y0 + 0.04, z * 0.016], null, () => m.tube([[0.0, y0 + 0.04, z * 0.016], [0.0, y0 + 0.004, z * 0.016]], 0.0022, { sides: 3, col: [0.2, 0.15, 0.12] }));
}
/** The nest of mud pellets on a beam (the origin at the foot of its cup, its open side facing +x) with a swallow on its rim and two nestlings in it. */
export function swallowNest() {
  const m = new Model(), mud = ({ p }) => lerp([0.4, 0.32, 0.22], [0.28, 0.22, 0.15], hash3(p, 9));
  m.as(10, [0, 0, 0], null, () => {
    m.tube([[0, 0.0, 0], [0, 0.02, 0], [0, 0.05, 0], [0, 0.08, 0]], [[0.01, 0.01], [0.075, 0.085], [0.088, 0.1], [0.07, 0.085]], { sides: 11, ref: [1, 0, 0], col: mud, cap: true });
    m.tube(Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * TAU; return [Math.cos(a) * 0.076, 0.082, Math.sin(a) * 0.088]; }), 0.011, { sides: 5, col: mud, cap: false });   // the rim
    m.ball([0, 0.07, 0], [0.065, 0.004, 0.075], [0.55, 0.5, 0.35], { nu: 2, nv: 9 });                          // the lining of grass and feathers
  });
  for (const z of [-1, 1]) m.as(12, [0, 0.075, z * 0.025], null, () => {
    m.ball([0.01, 0.092, z * 0.025], [0.014, 0.013, 0.012], [0.35, 0.3, 0.25], { nu: 4, nv: 5 });
    m.poly([[0.02, 0.095, z * 0.025 - 0.008], [0.036, 0.096, z * 0.025], [0.02, 0.092, z * 0.025 + 0.008], [0.022, 0.093, z * 0.025]], [0.95, 0.75, 0.2]);
  });
  m.as(0, [0, 0, 0], null, () => swallowParts(m, 0.09));
  return m;
}

// ═════════════ the kingfisher ═════════════
/** A common kingfisher perched (feet at y = 0): blue back, orange belly, the dagger bill; a small fish (part 13) that shows when it carries one. */
export function kingfisher() {
  const m = new Model(), BL = [0.1, 0.5, 0.68], OR = [0.88, 0.46, 0.16], WH = [0.94, 0.92, 0.85];
  const S = [[0.05, 0.1, 0.012, 0.012], [0.03, 0.11, 0.03, 0.028], [0.0, 0.1, 0.037, 0.034], [-0.04, 0.085, 0.03, 0.028], [-0.075, 0.065, 0.014, 0.014], [-0.09, 0.055, 0.006, 0.006]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 7, col: ({ n }) => lerp(OR, BL, sm(0.0, 0.55, n[1])) });
  const NP = [0.035, 0.12, 0];
  m.as(2, NP, null, () => {
    m.ball([0.05, 0.138, 0], [0.032, 0.03, 0.028], ({ n, p }) => (n[1] > 0.3 ? lerp(BL, [0.1, 0.6, 0.55], hash3(p, 2) * 0.6) : lerp(OR, WH, sm(0.1, 0.5, -n[0] + 0.2) * 0.2)));
    m.tube([[0.075, 0.137, 0], [0.105, 0.134, 0], [0.135, 0.13, 0]], [[0.011, 0.0105], [0.008, 0.008], [0.0015, 0.002]], { sides: 4, col: [0.06, 0.06, 0.06] });
    m.ball([0.032, 0.122, 0.0], [0.014, 0.016, 0.03], WH, { nu: 4, nv: 5 });
    for (const s of [-1, 1]) m.ball([0.045, 0.14, s * 0.026], [0.012, 0.009, 0.005], OR, { nu: 3, nv: 4 });
    eyes(m, 0.062, 0.145, 0.026, 0.0055, [0.02, 0.02, 0.02]);
  });
  m.as(13, [0.135, 0.13, 0], null, () => m.tube([[0.13, 0.131, 0], [0.16, 0.128, 0], [0.19, 0.12, 0]], [[0.012, 0.004], [0.01, 0.004], [0.002, 0.003]], { sides: 4, col: [0.75, 0.78, 0.78] }));
  m.as(3, [-0.07, 0.06, 0], null, () => m.poly([[-0.07, 0.06, -0.01], [-0.07, 0.06, 0.01], [-0.12, 0.04, 0.012], [-0.12, 0.04, -0.012]], [[0.1, 0.4, 0.55], [0.1, 0.4, 0.55], [0.1, 0.45, 0.6], [0.1, 0.45, 0.6]]));
  for (const [part, sg] of [[8, -1], [9, 1]]) m.as(part, [0.02, 0.11, sg * 0.03], null, () => wingLeaf(m, [[0.03, 0.115, 0.034], [-0.02, 0.118, 0.05], [-0.09, 0.09, 0.062], [-0.04, 0.08, 0.036]], [BL, [0.08, 0.45, 0.62], [0.05, 0.3, 0.5], [0.08, 0.4, 0.58]], sg));
  for (const [part, z] of [[4, -1], [5, 1]]) m.as(part, [0.0, 0.06, z * 0.018], null, () => m.tube([[0.0, 0.065, z * 0.018], [0.005, 0.0, z * 0.018]], 0.0028, { sides: 3, col: [0.8, 0.2, 0.15] }));
  return m;
}

// ═════════════ the town's birds on the ground (Paris 1248: pigeons on the parvis, geese at the strand; both walk and peck as the fowl do) ═════════════
/** A rock dove (or a white one) walking, 0.3 m long: grey with two dark wing bars, the neck's green and violet sheen, a dark tail band, pink legs. */
export function pigeon(variant) {
  const m = new Model(), white = variant === 'white', dark = variant === 'dark';
  const C = white ? { back: [0.93, 0.92, 0.9], breast: [0.96, 0.95, 0.93], tail: [0.86, 0.85, 0.82], bar: [0.85, 0.84, 0.8], neck: [0.9, 0.89, 0.86] }
    : dark ? { back: [0.3, 0.3, 0.33], breast: [0.34, 0.34, 0.37], tail: [0.12, 0.12, 0.14], bar: [0.1, 0.1, 0.12], neck: [0.2, 0.34, 0.3] }
    : { back: [0.5, 0.52, 0.56], breast: [0.56, 0.58, 0.62], tail: [0.17, 0.18, 0.21], bar: [0.12, 0.12, 0.15], neck: [0.26, 0.44, 0.4] };
  const S = [[0.1, 0.135, 0.03, 0.027], [0.06, 0.14, 0.05, 0.046], [0.0, 0.13, 0.055, 0.05], [-0.07, 0.12, 0.044, 0.04], [-0.12, 0.115, 0.018, 0.018]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 7, col: ({ p, n }) => lerp(C.back, C.breast, sm(0.3, -0.4, n[1]) * (1 - sm(-0.04, 0.0, -p[0]) * 0.2)) });
  for (const z of [-1, 1]) {
    m.ball([-0.015, 0.152, z * 0.046], [0.085, 0.026, 0.022], ({ p }) => (hash3(p, 3) > 0.5 ? C.bar : C.back), { nu: 5, nv: 5 });
    m.ball([-0.05, 0.14, z * 0.044], [0.07, 0.022, 0.02], ({ p }) => lerp(C.back, C.bar, sm(-0.08, -0.02, p[0]) * 0.8), { nu: 4, nv: 5 });
  }
  m.as(3, [-0.12, 0.12, 0], null, () => m.poly([[-0.1, 0.118, -0.02], [-0.1, 0.118, 0.02], [-0.2, 0.1, 0.035], [-0.22, 0.095, 0], [-0.2, 0.1, -0.035]], [C.back, C.back, C.tail, C.tail, C.tail]));
  const NP = [0.085, 0.14, 0], HP = [0.12, 0.185, 0];
  m.as(1, NP, null, () => m.tube([[0.08, 0.14, 0], [0.105, 0.17, 0], [0.12, 0.19, 0]], [0.03, 0.026, 0.021], { sides: 6, ref: [1, 0, 0], col: ({ t }) => lerp(C.breast, C.neck, 0.4 + 0.6 * Math.sin(Math.PI * t)) }));
  m.as(2, HP, NP, () => {
    m.ball([0.14, 0.205, 0], [0.026, 0.024, 0.021], ({ n }) => (white ? C.back : lerp(C.back, C.neck, 0.3 * sm(0, 0.6, -n[1]))));
    m.tube([[0.162, 0.2, 0], [0.188, 0.195, 0]], [[0.007, 0.008], [0.002, 0.003]], { sides: 4, col: [0.18, 0.17, 0.17] });
    m.ball([0.163, 0.206, 0], [0.007, 0.006, 0.008], [0.92, 0.9, 0.86], { nu: 3, nv: 4 });
    eyes(m, 0.15, 0.212, 0.017, 0.0055, [0.85, 0.4, 0.08]);
  });
  for (const [part, z] of [[4, -1], [5, 1]]) {
    const hip = [0.0, 0.1, z * 0.03];
    m.as(part, hip, null, () => {
      m.tube([hip, [0.0, 0.05, z * 0.03], [0.004, 0.008, z * 0.03]], [0.011, 0.007, 0.005], { sides: 4, col: [0.78, 0.3, 0.36] });
      for (const a of [-0.5, 0, 0.5]) m.tube([[0.004, 0.008, z * 0.03], [0.03, 0.004, z * 0.03 + a * 0.015], [0.05, 0.002, z * 0.03 + a * 0.03]], [0.0035, 0.003, 0.002], { sides: 3, col: [0.78, 0.3, 0.36] });
    });
  }
  return m;
}
/** A goose on its feet, 0.75 m to the crown: white (or grey), orange bill and feet, the long neck that rises, turns and lowers to graze. */
export function goose(variant) {
  const m = new Model(), grey = variant === 'grey';
  const C = grey ? { back: [0.52, 0.5, 0.46], breast: [0.7, 0.68, 0.64], tail: [0.4, 0.38, 0.35] } : { back: [0.95, 0.94, 0.9], breast: [0.97, 0.96, 0.93], tail: [0.9, 0.89, 0.85] };
  const ORANGE = [0.9, 0.5, 0.12];
  const S = [[0.24, 0.32, 0.07, 0.065], [0.14, 0.33, 0.115, 0.1], [0.0, 0.30, 0.13, 0.115], [-0.14, 0.29, 0.11, 0.095], [-0.27, 0.32, 0.05, 0.05], [-0.31, 0.34, 0.012, 0.012]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 8, col: ({ p, n }) => lerp(C.back, C.breast, sm(0.4, -0.4, n[1])) });
  for (const z of [-1, 1]) m.ball([-0.05, 0.37, z * 0.1], [0.2, 0.06, 0.04], ({ p }) => lerp(C.back, shade(C.back, 0.88), sm(0.1, -0.2, p[0])), { nu: 5, nv: 6 });
  m.as(3, [-0.27, 0.34, 0], null, () => m.poly([[-0.26, 0.33, -0.04], [-0.26, 0.33, 0.04], [-0.37, 0.36, 0.05], [-0.4, 0.37, 0], [-0.37, 0.36, -0.05]], [C.back, C.back, C.tail, C.tail, C.tail]));
  const NP = [0.22, 0.36, 0], HP = [0.3, 0.68, 0];
  m.as(1, NP, null, () => m.tube([[0.2, 0.36, 0], [0.25, 0.46, 0], [0.28, 0.58, 0], [0.3, 0.68, 0]], [0.06, 0.04, 0.032, 0.03], { sides: 6, ref: [1, 0, 0], col: ({ t }) => lerp(C.breast, C.back, t * 0.3) }));
  m.as(2, HP, NP, () => {
    m.ball([0.32, 0.7, 0], [0.05, 0.04, 0.035], C.back);
    m.tube([[0.36, 0.695, 0], [0.42, 0.685, 0]], [[0.022, 0.026], [0.012, 0.016]], { sides: 5, col: ORANGE });
    m.ball([0.375, 0.72, 0], [0.012, 0.008, 0.012], [0.9, 0.5, 0.12], { nu: 3, nv: 4 });
    eyes(m, 0.33, 0.715, 0.032, 0.008, [0.12, 0.08, 0.04]);
  });
  for (const [part, z] of [[4, -1], [5, 1]]) {
    const hip = [0.0, 0.2, z * 0.07];
    m.as(part, hip, null, () => {
      m.tube([hip, [0.0, 0.1, z * 0.07], [0.01, 0.02, z * 0.07]], [0.03, 0.016, 0.012], { sides: 5, col: ({ t }) => (t < 0.25 ? C.breast : ORANGE) });
      m.poly([[0.0, 0.02, z * 0.07 - 0.03], [0.0, 0.02, z * 0.07 + 0.03], [0.14, 0.005, z * 0.07 + 0.05], [0.16, 0.005, z * 0.07], [0.14, 0.005, z * 0.07 - 0.05]], ORANGE);
    });
  }
  return m;
}
export const MODELS = {
  mandarin_drake: () => duck('drake'), mandarin_hen: () => duck('hen'), duck_white: () => duck('white'), duck_brown: () => duck('brown'),
  crane, hen_brown: () => fowl('brown'), hen_white: () => fowl('white'), rooster: () => fowl('rooster'),
  cat_tabby: () => cat('tabby'), cat_orange: () => cat('orange'), dog, cormorant, fishing_craft: craft, cagebird, swallow_nest: swallowNest, kingfisher,
};
Object.assign(MODELS, { pigeon_grey: () => pigeon('grey'), pigeon_white: () => pigeon('white'), pigeon_dark: () => pigeon('dark'), goose_white: () => goose('white'), goose_grey: () => goose('grey') });

// ═════════════ the domestic turkey (Tenochtitlan's yards) ═════════════
/** A domestic turkey, standing (feet at y = 0; Mexican breeds were dark, bronze-sheened): a stout body, the fan of the tail half spread, the bare blue head with its red snood and wattle; parts as the fowl's (1 neck, 2 head, 3 tail, 4 5 legs). */
export function turkey() {
  const m = new Model(), C = { back: [0.2, 0.14, 0.09], breast: [0.42, 0.28, 0.12], tail: [0.17, 0.12, 0.08], band: [0.55, 0.42, 0.25], skin: [0.52, 0.6, 0.78], red: [0.82, 0.14, 0.1] };
  const S = [[0.3, 0.34, 0.07, 0.06], [0.2, 0.37, 0.17, 0.13], [0.05, 0.37, 0.23, 0.18], [-0.1, 0.36, 0.21, 0.16], [-0.25, 0.37, 0.12, 0.1], [-0.33, 0.39, 0.03, 0.03]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 8, col: ({ p, n }) => { const c = lerp(C.back, C.breast, sm(0.4, -0.4, n[1]) * (0.5 + 0.5 * sm(-0.2, 0.2, p[0]))); return shade(c, 0.9 + 0.2 * hash3(p)); } });
  for (const z of [-1, 1]) m.ball([-0.02, 0.38, z * 0.17], [0.22, 0.07, 0.04], ({ p }) => shade(lerp(C.back, C.band, sm(-0.1, -0.2, p[0]) * 0.6), 0.9 + 0.2 * hash3(p, 2)), { nu: 5, nv: 5 });
  m.as(3, [-0.3, 0.38, 0], null, () => {
    // the fan, half spread: a vertical sheet behind the rump, its feathers' tips banded
    m.poly([[-0.3, 0.36, -0.05], [-0.3, 0.36, 0.05], [-0.46, 0.5, 0.22], [-0.52, 0.62, 0.1], [-0.54, 0.64, 0], [-0.52, 0.62, -0.1], [-0.46, 0.5, -0.22]], [C.tail, C.tail, C.band, C.tail, shade(C.tail, 1.2), C.tail, C.band]);
  });
  const NP = [0.24, 0.4, 0], HP = [0.31, 0.62, 0];
  m.as(1, NP, null, () => m.tube([[0.22, 0.4, 0], [0.28, 0.52, 0], [0.31, 0.62, 0]], [0.075, 0.05, 0.036], { sides: 6, ref: [1, 0, 0], col: ({ t }) => lerp(C.breast, C.skin, sm(0.5, 1, t)) }));
  m.as(2, HP, NP, () => {
    m.ball([0.335, 0.655, 0], [0.05, 0.045, 0.038], ({ n }) => lerp(C.skin, C.red, sm(0.2, -0.6, n[1]) * 0.5), { nu: 5, nv: 5 });
    m.tube([[0.38, 0.65, 0], [0.415, 0.64, 0]], [[0.014, 0.017], [0.002, 0.003]], { sides: 4, col: [0.8, 0.7, 0.5] });
    m.tube([[0.372, 0.68, 0], [0.392, 0.655, 0], [0.397, 0.61, 0]], [0.011, 0.01, 0.004], { sides: 4, col: C.red });    // the snood
    m.ball([0.335, 0.6, 0], [0.022, 0.04, 0.016], C.red, { nu: 4, nv: 4 });                                              // the wattle
    eyes(m, 0.355, 0.665, 0.032, 0.008, [0.3, 0.12, 0.03]);
  });
  for (const [part, z] of [[4, -1], [5, 1]]) {
    const hip = [0.0, 0.27, z * 0.08];
    m.as(part, hip, null, () => {
      m.tube([hip, [0.0, 0.14, z * 0.08], [0.01, 0.02, z * 0.08]], [0.036, 0.02, 0.015], { sides: 4, col: ({ t }) => (t < 0.3 ? C.back : [0.7, 0.5, 0.48]) });
      for (const a of [-0.5, 0, 0.5]) m.tube([[0.01, 0.02, z * 0.08], [0.06, 0.008, z * 0.08 + a * 0.03], [0.11, 0.004, z * 0.08 + a * 0.075]], [0.008, 0.006, 0.004], { sides: 3, col: [0.7, 0.5, 0.48] });
    });
  }
  return m;
}
MODELS.turkey = turkey;
