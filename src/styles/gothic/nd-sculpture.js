// Notre-Dame's carved figures seen from two metres (docs/settlements/paris.md §1a3): the column-statues of the
// portals and the Gallery of Kings as modelled volumes — a robe lofted from rings with pleats that slant and
// gather over the free leg, a diagonal mantle across the chest, round limbs with elbows, hands, a head with
// brow, eye sockets, nose, lips, hair, beard and crown — and the gargoyles as crouching beasts with haunches,
// joints, jaws and teeth. Everything is lofted into per-material accumulators and handed to the bag as one
// geometry per material; nothing is random: each piece's variation comes from a hash of its own position.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

// ── a hash of a piece's own place (never a counter or a shared generator) ─────────────────────────
export function hash3(a, b, c) {
  let h = Math.imul(Math.round(a * 1000) ^ 0x9e3779b1, 0x85ebca6b) ^ Math.imul(Math.round(b * 1000) + 7, 0xc2b2ae35) ^ Math.imul(Math.round(c * 1000) + 13, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the accumulator: triangles with normals, per material ───────────────────────────────────────────
export class Acc {
  constructor() { this.m = new Map(); }
  get(mat) { let e = this.m.get(mat); if (!e) this.m.set(mat, (e = { p: [], n: [] })); return e; }
  flush(bag) {
    for (const [mat, e] of this.m) {
      if (!e.p.length) continue;
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(e.p, 3));
      g.setAttribute('normal', new Float32BufferAttribute(e.n, 3));
      bag.add(mat, g);
    }
    this.m.clear();
  }
  tris() { let n = 0; for (const e of this.m.values()) n += e.p.length / 9; return n; }
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const centroid = (r) => { const c = [0, 0, 0]; for (const p of r) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; } return [c[0] / r.length, c[1] / r.length, c[2] / r.length]; };
const gauss = (x, w) => Math.exp(-(x * x) / (w * w));
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Loft closed rings (rings[i][j] = [x, y, z]) into a smooth surface; caps close the first / last ring with a fan. */
export function loft(acc, mat, rings, { capA = false, capB = false } = {}) {
  const R = rings.length, n = rings[0].length, e = acc.get(mat);
  const N = rings.map((ring, i) => {
    const c = centroid(ring);
    return ring.map((p, j) => {
      const pa = rings[Math.max(0, i - 1)][j], pb = rings[Math.min(R - 1, i + 1)][j];
      let v = nrm(cross(sub(pb, pa), sub(ring[(j + 1) % n], ring[(j + n - 1) % n])));
      const out = sub(p, c);
      if (Math.hypot(...out) > 1e-6 ? dot(v, out) < 0 : false) v = [-v[0], -v[1], -v[2]];
      return v;
    });
  });
  const T = (pa, na, pb, nb, pc, nc) => {
    const g = cross(sub(pb, pa), sub(pc, pa));
    if (g[0] * g[0] + g[1] * g[1] + g[2] * g[2] < 1e-14) return;
    const avg = [na[0] + nb[0] + nc[0], na[1] + nb[1] + nc[1], na[2] + nb[2] + nc[2]];
    if (dot(g, avg) < 0) { [pb, pc] = [pc, pb]; [nb, nc] = [nc, nb]; }
    e.p.push(...pa, ...pb, ...pc); e.n.push(...na, ...nb, ...nc);
  };
  for (let i = 0; i < R - 1; i++) for (let j = 0; j < n; j++) {
    const k = (j + 1) % n;
    T(rings[i][j], N[i][j], rings[i][k], N[i][k], rings[i + 1][k], N[i + 1][k]);
    T(rings[i][j], N[i][j], rings[i + 1][k], N[i + 1][k], rings[i + 1][j], N[i + 1][j]);
  }
  const cap = (ring, other, sgn) => {
    const c = centroid(ring), ax = nrm(sub(c, centroid(other))), nn = [ax[0] * sgn, ax[1] * sgn, ax[2] * sgn];
    for (let j = 0; j < n; j++) {
      const a = ring[j], b = ring[(j + 1) % n], g = cross(sub(b, a), sub(c, a));
      if (dot(g, nn) < 0) { e.p.push(...a, ...c, ...b); } else { e.p.push(...a, ...b, ...c); }
      e.n.push(...nn, ...nn, ...nn);
    }
  };
  if (capA) cap(rings[0], rings[1], 1);
  if (capB) cap(rings[R - 1], rings[R - 2], 1);
}

/** An elliptical ring: centre c, unit axes ax (angle 0) and bx (angle 90°), radii ra, rb; fn(th) a radius multiplier. */
function ringE(c, ax, bx, ra, rb, n, fn) {
  const out = [];
  for (let j = 0; j < n; j++) {
    const th = 2 * Math.PI * j / n, m = fn ? fn(th) : 1, ca = Math.cos(th) * ra * m, sb = Math.sin(th) * rb * m;
    out.push([c[0] + ax[0] * ca + bx[0] * sb, c[1] + ax[1] * ca + bx[1] * sb, c[2] + ax[2] * ca + bx[2] * sb]);
  }
  return out;
}

/** A tube through points (radii per point, optional second radius for a flattened section), ends capped. */
export function tube(acc, mat, pts, radii, n = 8, flat = null, ref0 = [0, 1, 0]) {
  const rings = [];
  let prevU = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], d = nrm(sub(b, a));
    let u1;
    if (prevU) { const k = dot(prevU, d); u1 = [prevU[0] - d[0] * k, prevU[1] - d[1] * k, prevU[2] - d[2] * k]; if (Math.hypot(...u1) < 1e-4) u1 = cross(d, [0, 0, 1]); }
    else { const ref = Math.abs(dot(d, ref0)) > 0.92 ? [1, 0, 0] : ref0; u1 = cross(d, ref); }
    u1 = nrm(u1);
    const u2 = nrm(cross(d, u1)); prevU = u1;
    const r = radii[i], rf = flat ? flat[i] : r;
    rings.push(ringE(pts[i], u1, u2, r, rf, n));
  }
  loft(acc, mat, rings, { capA: true, capB: true });
}

/** An ellipsoid with the axes ax, bx (horizontal-ish) and up, radii (ra, rb, ru). */
export function blob(acc, mat, c, ax, bx, up, ra, rb, ru, n = 8, K = 6) {
  const rings = [];
  for (let k = 1; k < K; k++) {
    const ph = Math.PI * k / K, s = Math.sin(ph), y = Math.cos(ph) * ru;
    rings.push(ringE([c[0] + up[0] * y, c[1] + up[1] * y, c[2] + up[2] * y], ax, bx, ra * s, rb * s, n));
  }
  loft(acc, mat, rings, { capA: true, capB: true });
}
const UP = [0, 1, 0];

// ── the column figure ──────────────────────────────────────────────────────────────────────────
// profile of the robe: t (height / h), lateral half-width b, depth half a (both / h)
const PT = [0, 0.012, 0.04, 0.10, 0.18, 0.26, 0.34, 0.42, 0.50, 0.535, 0.55, 0.565, 0.60, 0.66, 0.72, 0.77, 0.80, 0.815, 0.83, 0.845, 0.865];
const PB = [0.108, 0.106, 0.102, 0.099, 0.095, 0.092, 0.089, 0.085, 0.078, 0.075, 0.081, 0.075, 0.079, 0.088, 0.096, 0.102, 0.104, 0.086, 0.054, 0.034, 0.030];
const PA = [0.098, 0.097, 0.090, 0.085, 0.079, 0.075, 0.071, 0.067, 0.061, 0.059, 0.065, 0.059, 0.061, 0.065, 0.067, 0.065, 0.060, 0.050, 0.040, 0.032, 0.029];

/**
 * A standing statue h tall, its feet at (x, y, z), facing f (a horizontal unit [fx, fz]).
 * o: mat (the robe's painted colour), skin, hair, beard (bool), crown, attr ('book' 'scroll' 'key' 'sword' 'staff' 'cross' 'palm' 'scepter'),
 *    long (long hair), lod (1: reduced, for the kings and the far ones), seed.
 */
export function statue(acc, x, y, z, h, o = {}) {
  const f = o.face || [-1, 0], mat = o.mat || 'limestone_carved', skin = o.skin || 'ivory', lod = o.lod || 0;
  const sd = [-f[1], f[0]], F = [f[0], 0, f[1]], S = [sd[0], 0, sd[1]];
  const hs = o.seed ?? hash3(x, y, z);
  const r1 = hash3(hs, 1, 2), r2 = hash3(hs, 3, 4), r3 = hash3(hs, 5, 6), r4 = hash3(hs, 7, 8);
  const side = r1 < 0.5 ? 1 : -1;                       // which leg carries the weight, which arm holds the attribute
  const hair = o.hair || (r2 < 0.25 ? 'paint_white' : r2 < 0.45 ? 'paint_ochre' : 'wood_dark');
  const bearded = o.beard ?? (r3 < 0.62);
  const nSeg = lod ? 8 : 15, pleats = 6 + Math.floor(r4 * 3), ph0 = r2 * 6.283, sc = 0.97 + 0.06 * r3;
  // ── the robe, lofted ──
  const body = [];
  for (let i = 0; i < PT.length; i++) {
    const t = PT[i], sway = side * h * 0.012 * Math.sin(Math.PI * Math.min(1, t / 0.85)) - side * h * 0.01 * sstep(0.6, 0.85, t);
    const c = [x + S[0] * sway, y + t * h, z + S[1] * sway];
    const A = (0.12 * (1 - sstep(0.30, 0.64, t)) + 0.022) * (t < 0.01 ? 0.5 : 1);
    const hemY = t < 0.02 ? 0.006 * h : 0;
    body.push(ringE([c[0], c[1] + 0, c[2]], F, S, PA[i] * h * sc, PB[i] * h * sc, nSeg, (th) => {
      const slant = side * 2.4 * Math.max(0, 0.56 - t) * Math.sin(th) + 0.5 * Math.sin(th * 2 + hs * 9);
      let p = Math.cos(pleats * th + ph0 + slant); p = Math.sign(p) * Math.pow(Math.abs(p), 0.55);
      let m = 1 + A * p;
      // the himation: a ridge across the chest from the shoulder to the opposite hip
      const tc = 0.52 + 0.24 * Math.sin(th) * side * 1.2;
      m *= 1 + 0.07 * gauss((t - tc) / 0.05, 1) * Math.max(0, Math.cos(th) + 0.3) * sstep(0.3, 0.45, t);
      // the free knee pushes the robe forward
      m *= 1 + 0.08 * gauss((t - 0.27) / 0.13, 1) * Math.max(0, Math.cos(th - 0.5 * side));
      // the mantle's mass at the back
      m *= 1 + 0.15 * sstep(0.1, 0.3, t) * (1 - sstep(0.72, 0.82, t)) * Math.pow(Math.max(0, -Math.cos(th)), 1.4);
      return m * (1 + (t < 0.05 ? 0.03 * Math.cos(pleats * 2 * th + ph0) : 0)) + (hemY ? 0 : 0);
    }));
  }
  loft(acc, mat, body, { capA: true, capB: true });
  // feet in shoes, showing under the hem
  if (!lod) for (const sg of [-1, 1]) blob(acc, skin, [x + F[0] * 0.1 * h + S[0] * sg * 0.04 * h, y + 0.012 * h, z + F[1] * 0.1 * h + S[1] * sg * 0.04 * h], F, S, UP, 0.045 * h, 0.021 * h, 0.014 * h, lod ? 6 : 8, 4);
  // the girdle's knot
  if (!lod) blob(acc, 'paint_ochre', [x + F[0] * 0.07 * h + S[0] * side * 0.0 * h, y + 0.545 * h, z + F[1] * 0.07 * h], F, S, UP, 0.012 * h, 0.02 * h, 0.03 * h, 6, 4);
  // ── the arms ──
  const P = (a, yy, b) => [x + F[0] * a * h + S[0] * b * h, y + yy * h, z + F[1] * a * h + S[1] * b * h];
  const hold = side, free = -side;
  const sleeve = mat, armN = lod ? 5 : 7;
  { // the holding arm: bent up, the hand at the chest, a sleeve widening to the wrist
    const pts = [P(0, 0.795, hold * 0.1), P(0.04, 0.70, hold * 0.118), P(0.075, 0.655, hold * 0.085), P(0.10, 0.665, hold * 0.04)];
    tube(acc, sleeve, pts, [0.028 * h, 0.025 * h, 0.03 * h, 0.034 * h], armN);
    const hp = P(0.115, 0.675, hold * 0.03);
    blob(acc, skin, hp, F, S, UP, 0.016 * h, 0.026 * h, 0.02 * h, 6, 4);
    attribute(acc, o.attr || 'book', hp, F, S, h, { mat, hold, r: r2 });
  }
  { // the free arm: hanging, the hand gathering the mantle
    const pts = [P(0, 0.795, free * 0.1), P(-0.005, 0.69, free * 0.118), P(0.025, 0.58, free * 0.112), P(0.05, 0.51, free * 0.104)];
    tube(acc, sleeve, pts, [0.028 * h, 0.024 * h, 0.026 * h, 0.032 * h], armN);
    const hp = P(0.062, 0.495, free * 0.1);
    blob(acc, skin, hp, F, S, UP, 0.018 * h, 0.014 * h, 0.028 * h, 6, 4);
    // the mantle's edge gathered in that hand, falling in a swag to the hem
    if (!lod) tube(acc, mat, [P(0.06, 0.5, free * 0.1), P(0.1, 0.34, free * 0.09), P(0.1, 0.18, free * 0.07), P(0.09, 0.03, free * 0.05)], [0.02 * h, 0.03 * h, 0.034 * h, 0.03 * h], 6, [0.01 * h, 0.014 * h, 0.014 * h, 0.012 * h]);
  }
  // ── the head ──
  const hh = 0.155 * h, hc = P(0.004, 1 - 0.155 / 2, 0), hcY = y + h - hh / 2;
  head(acc, [x + F[0] * 0.004 * h, hcY, z + F[1] * 0.004 * h], F, S, hh, { skin, hair, bearded, lod, long: o.long ?? (r4 < 0.35), seed: hs, crown: o.crown, crownMat: o.crownMat || 'paint_ochre', hairH: o.hairH });
  void hc;
}

function attribute(acc, kind, hp, F, S, h, { mat, hold, r }) {
  const at = (a, yy, b) => [hp[0] + F[0] * a * h + S[0] * b * h, hp[1] + yy * h, hp[2] + F[1] * a * h + S[1] * b * h];
  if (kind === 'book') {
    const c = at(0.012, 0.03, 0.0), pg = 'paint_white';
    tube(acc, 'paint_ochre', [at(0.004, -0.04, -0.005), at(0.012, 0.045, -0.005)], [0.012 * h, 0.012 * h], 4, [0.052 * h, 0.052 * h]);
    tube(acc, pg, [at(0.016, -0.036, 0.0), at(0.022, 0.04, 0.0)], [0.004 * h, 0.004 * h], 4, [0.045 * h, 0.045 * h]);
    void c;
  } else if (kind === 'scroll') {
    tube(acc, 'paint_white', [at(0.0, -0.045, 0.0), at(0.0, 0.07, 0.0)], [0.016 * h, 0.016 * h], 8);
    tube(acc, 'paint_white', [at(0.0, 0.03, 0.0), at(0.06, 0.0, 0.0)], [0.005 * h, 0.012 * h], 4, [0.04 * h, 0.04 * h]);
  } else if (kind === 'key') {
    tube(acc, 'iron', [at(0, -0.13, 0), at(0, 0.1, 0)], [0.006 * h, 0.006 * h], 5);
    tube(acc, 'iron', [at(0, 0.1, -0.025), at(0, 0.1, 0.025)], [0.007 * h, 0.007 * h], 4);
    tube(acc, 'iron', [at(0, -0.13, 0), at(0, -0.13, 0.04)], [0.008 * h, 0.008 * h], 4);
    tube(acc, 'iron', [at(0, -0.1, 0.03), at(0, -0.1, 0.05)], [0.008 * h, 0.008 * h], 4);
  } else if (kind === 'sword') {
    tube(acc, 'iron', [at(0, -0.34, 0), at(0, 0.02, 0)], [0.007 * h, 0.01 * h], 4, [0.003 * h, 0.003 * h]);
    tube(acc, 'iron', [at(0, 0.02, -0.04), at(0, 0.02, 0.04)], [0.006 * h, 0.006 * h], 4);
    tube(acc, 'paint_ochre', [at(0, 0.02, 0), at(0, 0.09, 0)], [0.008 * h, 0.008 * h], 5);
  } else if (kind === 'staff' || kind === 'cross' || kind === 'scepter') {
    const top = kind === 'scepter' ? 0.2 : 0.55;
    tube(acc, kind === 'scepter' ? 'paint_ochre' : 'wood_dark', [at(0, -0.62 + (kind === 'scepter' ? 0.3 : 0), 0.0), at(0, top, 0)], [0.008 * h, 0.007 * h], 5);
    if (kind === 'cross') tube(acc, 'wood_dark', [at(0, top - 0.06, -0.035), at(0, top - 0.06, 0.035)], [0.006 * h, 0.006 * h], 4);
    if (kind === 'scepter') blob(acc, 'paint_ochre', at(0, top + 0.015, 0), F, S, UP, 0.018 * h, 0.018 * h, 0.02 * h, 6, 4);
  } else if (kind === 'palm') {
    tube(acc, 'cloth_green', [at(0, -0.1, 0), at(0.01, 0.12, 0.0), at(0.03, 0.3, 0.02)], [0.006 * h, 0.006 * h, 0.003 * h], 4, [0.03 * h, 0.04 * h, 0.01 * h]);
  }
}

/** A head h tall centred at c: lofted skull with brow, eye sockets, cheeks, chin; nose, lips, eyes, ears; hair, beard, crown. */
export function head(acc, c, F, S, hs, o) {
  const { skin, hair, bearded, lod } = o, n = lod ? 8 : 16, K = lod ? 6 : 9;
  const rn = hash3(o.seed ?? 0, 11, 12), rm = hash3(o.seed ?? 0, 13, 14);
  const Ha = 0.46 * hs, Hb = 0.38 * hs;
  const skull = (y01, th, extra = 0) => {
    // y01 in -0.5 (chin) … 0.5 (crown)
    const y = y01, e = Math.sqrt(Math.max(0, 1 - 4 * y * y));
    const tap = 1 - 0.3 * sstep(-0.1, -0.5, y);
    const cf = Math.max(0, Math.cos(th)), sf = Math.abs(Math.sin(th));
    let ra = Ha * e, rb = Hb * e * tap;
    let m = 1;
    m += 0.075 * gauss((y - 0.16) / 0.075, 1) * cf * cf;                                   // the brow
    m += 0.05 * gauss((y + 0.42) / 0.07, 1) * Math.pow(cf, 3);                              // the chin
    m += 0.035 * gauss((y + 0.02) / 0.09, 1) * gauss((Math.abs(th) - 0.95) / 0.3, 1);       // the cheekbones
    m -= 0.05 * gauss((y - 0.1) / 0.06, 1) * gauss((Math.abs(th) - 0.55) / 0.22, 1);         // the eye sockets
    m -= 0.025 * gauss((y + 0.18) / 0.09, 1) * gauss((Math.abs(th) - 0.7) / 0.3, 1);         // the hollow of the cheek
    void sf;
    return [ra * m + extra, rb * m + extra];
  };
  const rings = [];
  for (let k = 0; k <= K; k++) {
    const y = -0.5 + k / K, yy = Math.min(0.495, Math.max(-0.495, y));
    rings.push(ringE([c[0], c[1] + yy * hs, c[2]], F, S, 1, 1, n, null).map((_, j) => {
      const th = 2 * Math.PI * j / n, [ra, rb] = skull(yy, th), ca = Math.cos(th) * ra, sb = Math.sin(th) * rb;
      return [c[0] + F[0] * ca + S[0] * sb, c[1] + yy * hs, c[2] + F[1] * ca + S[1] * sb];
    }));
  }
  loft(acc, skin, rings, { capA: true, capB: true });
  // the nose: a wedge from the brow to the tip, two wings
  const P = (a, yy, b) => [c[0] + F[0] * a + S[0] * b, c[1] + yy, c[2] + F[1] * a + S[1] * b];
  tube(acc, skin, [P(0.43 * hs, 0.11 * hs, 0), P(0.5 * hs, -0.02 * hs, 0), P(0.575 * hs, -0.1 * hs, 0)], [0.022 * hs, 0.036 * hs, 0.045 * hs], 5, [0.05 * hs, 0.05 * hs, 0.055 * hs]);
  if (!lod) {
    for (const sg of [-1, 1]) blob(acc, skin, P(0.52 * hs, -0.1 * hs, sg * 0.038 * hs), F, S, UP, 0.03 * hs, 0.026 * hs, 0.024 * hs, 5, 4);
    // lips, eyes, ears
    blob(acc, 'paint_robe', P(0.465 * hs, -0.2 * hs, 0), F, S, UP, 0.034 * hs, 0.1 * hs, 0.03 * hs, 8, 4);
    for (const sg of [-1, 1]) {
      blob(acc, 'wood_dark', P(0.4 * hs, 0.085 * hs, sg * 0.145 * hs), F, S, UP, 0.02 * hs, 0.04 * hs, 0.02 * hs, 5, 4);
      blob(acc, skin, P(-0.02 * hs, -0.02 * hs, sg * 0.372 * hs), F, S, UP, 0.03 * hs, 0.02 * hs, 0.07 * hs, 6, 4);
    }
  }
  // the hair: over the crown and down the nape, a hairline over the brow, curls
  { const hr = [], KH = lod ? 4 : 8, nh = n, top = 0.5, bottom = o.long ? -0.62 : -0.12;
    for (let k = 0; k <= KH; k++) {
      const y = top - (top - bottom) * k / KH, yy = Math.min(0.495, y);
      hr.push(Array.from({ length: nh }, (_, j) => {
        const th = 2 * Math.PI * j / nh, cf = Math.max(0, Math.cos(th));
        const lineY = 0.30 - 0.14 * Math.abs(Math.sin(th)) + 0.03 * Math.cos(th * 5 + rn * 6);
        let [ra, rb] = y < -0.5 ? [Ha * 0.5, Hb * 0.6] : skull(yy, th);
        if (y < -0.5) { const q = (-0.5 - y); ra = Ha * 0.62 + q * hs * 0.06; rb = Hb * 0.7 + q * hs * 0.1; }
        let m = 1.07 + 0.045 * Math.cos(th * 7 + y * 18 + rm * 6) * (lod ? 0.4 : 1) + (y > 0.3 ? 0.02 : 0);
        if (y < lineY && cf > 0.15 && y > -0.5) m = 0.96;
        if (o.long && y < -0.2 && cf > 0.35) m = 0.9;
        const ca = Math.cos(th) * ra * m, sb = Math.sin(th) * rb * m;
        return [c[0] + F[0] * ca + S[0] * sb, c[1] + y * hs, c[2] + F[1] * ca + S[1] * sb];
      }));
    }
    loft(acc, hair, hr, { capA: true });
  }
  // the beard and moustache
  if (bearded && !lod) {
    const fork = rn < 0.5 ? 0.025 : 0;
    for (const sg of fork ? [-1, 1] : [0]) tube(acc, hair, [P(0.38 * hs, -0.23 * hs, sg * fork * hs), P(0.46 * hs, -0.36 * hs, sg * fork * hs), P(0.5 * hs, -0.52 * hs, sg * fork * hs), P(0.47 * hs, -0.72 * hs, sg * fork * 0.6 * hs)], [0.06 * hs, 0.075 * hs, 0.06 * hs, 0.02 * hs], 7, [0.17 * hs, 0.16 * hs, 0.12 * hs, 0.05 * hs]);
    for (const sg of [-1, 1]) tube(acc, hair, [P(0.465 * hs, -0.15 * hs, 0.01 * hs * sg), P(0.47 * hs, -0.17 * hs, sg * 0.1 * hs), P(0.42 * hs, -0.22 * hs, sg * 0.17 * hs)], [0.018 * hs, 0.02 * hs, 0.012 * hs], 5);
  } else if (bearded) {
    tube(acc, hair, [P(0.4 * hs, -0.25 * hs, 0), P(0.48 * hs, -0.5 * hs, 0), P(0.46 * hs, -0.68 * hs, 0)], [0.08 * hs, 0.08 * hs, 0.03 * hs], 5, [0.16 * hs, 0.12 * hs, 0.05 * hs]);
  }
  // long hair falling behind the neck to the shoulders
  if (o.long && !lod) tube(acc, hair, [P(-0.34 * hs, -0.3 * hs, 0), P(-0.4 * hs, -0.8 * hs, 0), P(-0.38 * hs, -1.2 * hs, 0)], [0.1 * hs, 0.12 * hs, 0.1 * hs], 6, [0.3 * hs, 0.36 * hs, 0.34 * hs]);
  // the crown: a band with fleurons
  if (o.crown) {
    const cm = o.crownMat, [sa, sb] = skull(0.3, 0), [, sb2] = skull(0.3, Math.PI / 2), kra = sa * 1.16, krb = sb2 * 1.16, nc = lod ? 10 : 16;
    void sb;
    const cr = (yy, w) => ringE([c[0] - F[0] * 0.01 * hs, c[1] + yy * hs, c[2] - F[1] * 0.01 * hs], F, S, kra * w, krb * w, nc, null);
    loft(acc, cm, [cr(0.27, 1.0), cr(0.34, 1.02), cr(0.4, 1.06)]);
    const np = lod ? 5 : 7;
    for (let k = 0; k < np; k++) {
      const th = 2 * Math.PI * k / np + rn, b = [c[0] - F[0] * 0.01 * hs + F[0] * Math.cos(th) * kra * 1.06 + S[0] * Math.sin(th) * krb * 1.06, c[1] + 0.4 * hs, c[2] - F[1] * 0.01 * hs + F[1] * Math.cos(th) * kra * 1.06 + S[1] * Math.sin(th) * krb * 1.06];
      tube(acc, cm, [b, [b[0], b[1] + 0.17 * hs, b[2]]], [0.07 * hs, 0.02 * hs], 4);
    }
  }
}

// ── small figures of the archivolts: a draped robe, a head with hair and a nose, arms ─────────────
export function smallFigure(acc, x, y, z, h, o = {}) {
  const f = o.face || [-1, 0], mat = o.mat || 'limestone_carved', sd = [-f[1], f[0]], F = [f[0], 0, f[1]], S = [sd[0], 0, sd[1]];
  const hs = hash3(x, y, z), r1 = hash3(hs, 1, 1), r2 = hash3(hs, 2, 2), r3 = hash3(hs, 3, 3);
  const skin = o.skin || 'ivory', hair = r2 < 0.3 ? 'paint_ochre' : 'wood_dark';
  const prof = o.seat ? [[0, 0.15, 0.11], [0.2, 0.13, 0.1], [0.45, 0.1, 0.075], [0.62, 0.115, 0.09], [0.76, 0.1, 0.07], [0.84, 0.05, 0.04]] : [[0, 0.11, 0.1], [0.2, 0.098, 0.08], [0.5, 0.082, 0.062], [0.72, 0.098, 0.06], [0.8, 0.08, 0.05], [0.86, 0.034, 0.03]];
  const pl = 4 + Math.floor(r1 * 3), ph = r3 * 6.28, seg = 6, rings = [];
  for (const [t, b, a] of prof) {
    const A = 0.07 * (1 - sstep(0.2, 0.6, t)) + 0.012;
    rings.push(ringE([x + (o.seat ? F[0] * 0.07 * h : 0), y + t * h, z + (o.seat ? F[1] * 0.07 * h : 0)], F, S, a * h, b * h, seg, (th) => 1 + A * Math.cos(pl * th + ph + 0.9 * Math.sin(th) * (0.6 - t))));
  }
  loft(acc, mat, rings, { capA: true, capB: true });
  const hh = 0.15 * h, hy = y + h - hh / 2, hx = x + (o.seat ? F[0] * 0.07 * h : 0), hz = z + (o.seat ? F[1] * 0.07 * h : 0);
  const P = (a, yy, b) => [hx + F[0] * a + S[0] * b, hy + yy, hz + F[1] * a + S[1] * b];
  blob(acc, skin, [hx, hy, hz], F, S, UP, 0.055 * h, 0.05 * h, 0.075 * h, 6, 4);
  blob(acc, hair, [hx - F[0] * 0.006 * h, hy + 0.012 * h, hz - F[1] * 0.006 * h], F, S, UP, 0.06 * h, 0.056 * h, 0.073 * h, 6, 4);
  // arms: one holding a scroll before the chest, one on the knee or at the side
  const sg = r1 < 0.5 ? 1 : -1, sy = y + (o.seat ? 0.7 : 0.72) * h, sx = o.seat ? 0.07 * h : 0;
  const Q = (a, yy, b) => [x + F[0] * (a * h + sx) + S[0] * b * h, y + yy * h, z + F[1] * (a * h + sx) + S[1] * b * h];
  void sy;
  tube(acc, mat, [Q(0, 0.7, sg * 0.09), Q(0.05, 0.6, sg * 0.1), Q(0.09, 0.62, sg * 0.04)], [0.022 * h, 0.02 * h, 0.022 * h], 4);
  tube(acc, 'paint_white', [Q(0.1, 0.57, sg * 0.04), Q(0.1, 0.67, sg * 0.04)], [0.012 * h, 0.012 * h], 4);
  if (o.seat) tube(acc, mat, [Q(0.1, 0.42, 0), Q(0.2, 0.36, 0)], [0.07 * h, 0.06 * h], 5, [0.09 * h, 0.08 * h]);
  if (o.crown) {
    const rr = [0, 1].map((k) => ringE([hx, hy + (0.3 + 0.12 * k) * hh, hz], F, S, 0.06 * h, 0.055 * h, 8, null));
    loft(acc, 'paint_ochre', rr);
  }
}

// ── gargoyles: a crouching beast run out from the wall along d, its jaws open to spout the rain ──
/**
 * x, y, z the point of the cornice; d the horizontal unit vector the beast looks along; len its length.
 * full: haunches, joints, jaws with teeth, brow, ears, spine and tail; otherwise a reduced beast.
 */
export function gargoyle(acc, mat, x, y, z, d, len = 1.6, full = false) {
  const hs = hash3(x, y, z), r1 = hash3(hs, 1, 5), r2 = hash3(hs, 2, 5), r3 = hash3(hs, 3, 5);
  const F = [d[0], 0, d[1]], S = [-d[1], 0, d[0]], sc = len / 1.6;
  const P = (t, s, v) => [x + F[0] * t * sc + S[0] * s * sc, y + v * sc, z + F[2] * t * sc + S[2] * s * sc];
  const n = full ? 10 : 6, side = r1 < 0.5 ? 1 : -1;
  // the trunk, from inside the wall over the haunches to the chest: elliptical rings, deeper at the shoulders
  const tr = [[-0.35, 0.22, 0.22, -0.2], [-0.1, 0.3, 0.3, -0.2], [0.2, 0.28, 0.26, -0.17], [0.5, 0.2, 0.22, -0.15], [0.75, 0.26, 0.28, -0.08], [0.98, 0.2, 0.24, 0.0]];
  const rings = tr.map(([t, w, hgt, v]) => ringE(P(t, 0, v), S, UP, w * sc, hgt * sc, n, (th) => 1 + 0.06 * Math.sin(3 * th + r2 * 6)));
  loft(acc, mat, rings, { capA: true });
  // the neck rising, the head with its brow, the upper jaw and the dropped lower jaw
  const nk = [P(0.9, 0, -0.04), P(1.08, 0, 0.12), P(1.26, 0, 0.26), P(1.4, 0, 0.27)];
  tube(acc, mat, nk, [0.2 * sc, 0.17 * sc, 0.16 * sc, 0.17 * sc], n, [0.22 * sc, 0.2 * sc, 0.19 * sc, 0.17 * sc]);
  tube(acc, mat, [P(1.38, 0, 0.3), P(1.58, 0, 0.3), P(1.78, 0, 0.26)], [0.16 * sc, 0.12 * sc, 0.075 * sc], n, [0.13 * sc, 0.09 * sc, 0.06 * sc]);          // the upper jaw: a long muzzle
  tube(acc, mat, [P(1.36, 0, 0.14), P(1.58, 0, 0.07), P(1.76, 0, 0.06)], [0.1 * sc, 0.085 * sc, 0.05 * sc], 6, [0.06 * sc, 0.04 * sc, 0.03 * sc]);          // the lower jaw, hanging
  blob(acc, mat, P(1.34, 0, 0.36), F, S, UP, 0.16 * sc, 0.2 * sc, 0.09 * sc, 8, 5);                                                                          // the brow
  if (full) {
    for (const s of [-1, 1]) {
      blob(acc, mat, P(1.42, s * 0.13, 0.33), F, S, UP, 0.045 * sc, 0.05 * sc, 0.05 * sc, 6, 4);                                                            // the eyes
      tube(acc, mat, [P(1.22, s * 0.13, 0.4), P(1.1, s * 0.2, 0.62), P(1.0, s * 0.2, 0.74)], [0.04 * sc, 0.03 * sc, 0.008 * sc], 5);                         // the horns / ears
    }
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) {                                                                                                   // the teeth
      const t = 1.52 + k * 0.07;
      tube(acc, mat, [P(t, s * 0.075, 0.2), P(t, s * 0.08, 0.1 + 0.0)], [0.018 * sc, 0.004 * sc], 4);
      tube(acc, mat, [P(t + 0.02, s * 0.05, 0.075), P(t + 0.02, s * 0.055, 0.15)], [0.014 * sc, 0.004 * sc], 4);
    }
    // the haunches: a thigh over the hip, the shank folded back, the paw flat on the cornice
    for (const s of [-1, 1]) {
      blob(acc, mat, P(-0.02, s * 0.3, -0.1), F, S, UP, 0.3 * sc, 0.12 * sc, 0.26 * sc, 8, 6);
      tube(acc, mat, [P(0.0, s * 0.33, -0.2), P(0.18, s * 0.33, -0.36), P(0.02, s * 0.31, -0.42)], [0.1 * sc, 0.07 * sc, 0.06 * sc], 6);
      blob(acc, mat, P(0.15, s * 0.31, -0.47), F, S, UP, 0.14 * sc, 0.07 * sc, 0.04 * sc, 6, 4);
    }
    // the forelegs: shoulder, elbow, wrist, paws gripping the cornice's edge
    for (const s of [-1, 1]) {
      blob(acc, mat, P(0.78, s * 0.3, -0.1), F, S, UP, 0.17 * sc, 0.1 * sc, 0.2 * sc, 8, 5);
      tube(acc, mat, [P(0.8, s * 0.3, -0.15), P(0.72, s * 0.32, -0.34), P(0.98, s * 0.28, -0.44)], [0.09 * sc, 0.065 * sc, 0.05 * sc], 6);
      blob(acc, mat, P(1.08, s * 0.28, -0.46), F, S, UP, 0.12 * sc, 0.065 * sc, 0.04 * sc, 6, 4);
      for (const k of [-1, 0, 1]) tube(acc, mat, [P(1.14, s * 0.28 + k * 0.035, -0.46), P(1.22, s * 0.28 + k * 0.04, -0.5)], [0.016 * sc, 0.01 * sc], 4);
    }
    // the spine: a ridge of small plates from the neck to the tail; the tail curling along the wall
    for (let k = 0; k < 7; k++) { const t = 0.9 - k * 0.17; tube(acc, mat, [P(t, 0, 0.1 + 0.02 * Math.sin(k + r3 * 5)), P(t - 0.06, 0, 0.1 + 0.2 + 0.03 * ((k * 7 + Math.floor(r3 * 9)) % 3))], [0.04 * sc, 0.006 * sc], 4); }
    tube(acc, mat, [P(-0.4, 0, -0.18), P(-0.45, side * 0.28, -0.2), P(-0.32, side * 0.5, -0.18), P(-0.12, side * 0.55, -0.1)], [0.07 * sc, 0.055 * sc, 0.04 * sc, 0.02 * sc], 5);
  }
  // the folded wings: a membrane on a fingered bone along each flank
  for (const s of [-1, 1]) {
    tube(acc, mat, [P(0.55, s * 0.24, 0.1), P(0.3, s * 0.36, 0.42), P(-0.1, s * 0.34, 0.5)], [0.04 * sc, 0.03 * sc, 0.02 * sc], 5);
    tube(acc, mat, [P(0.3, s * 0.36, 0.42), P(0.0, s * 0.32, 0.12), P(0.1, s * 0.3, -0.04)], [0.015 * sc, 0.012 * sc, 0.01 * sc], 4, [0.15 * sc, 0.15 * sc, 0.1 * sc]);
  }
}
