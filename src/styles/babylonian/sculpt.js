// Modelled relief of the glazed brick (docs/settlements/babylon.md §16): the lions, bulls (aurochs) and mushhushshu
// dragons of the Ishtar Gate and the Processional Way, the rosettes, the palmettes and the volutes of the throne room's
// facade. A relief is a height field over the wall's plane (u along, v up, w out of it): a list of primitives (capsules
// with a round section, one per limb, muscle, horn, lock of mane), their heights united by a maximum so that the
// shoulder stands out of the flank, the thigh out of the belly and the jaws out of the head; a cut carves the open
// mouth; the field is cut into a grid and the grid becomes smooth triangles with its own normals, the rim sinking into
// the wall so that the figure rises out of it 5–10 cm proud with a rounded edge and no gap. Three levels: 0 full (a
// grid of 2.5 cm, the mane in rows of locks, the scales, eyes, fangs, claws), 1 reduced (5 cm, the masses only), 2 far (9 cm).
// Everything a build puts on a wall goes into one soup of triangles per material (Soup), one piece in each, so that
// the viewer merges it into the material's mesh instead of instancing hundreds of small shapes (each a draw).
// Variation (a few per cent in length and relief, a tenth of a millimetre in the surface) comes from a hash of the
// figure's own place, never from a counter, so the same plan builds the same geometry every time.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const W = 'glaze_white', Y = 'glaze_yellow', K = 'lacquer_black', R = 'glaze_red', BL = 'glaze_blue';

/** A soup of triangles per material, added to the bag as one piece each when flushed; `proxy` stands for the bag. */
export class Soup {
  constructor(bag) {
    this.bag = bag; this.m = new Map();
    const me = this;
    this.proxy = Object.create(bag);
    this.proxy.add = (mat, g) => me.add(mat, g);
    this.proxy.soup = me;
  }
  slot(mat) { let s = this.m.get(mat); if (!s) this.m.set(mat, (s = { p: [], n: [] })); return s; }
  add(mat, g0) {
    if (!g0) return;
    const g = g0.index ? g0.toNonIndexed() : g0, s = this.slot(mat), P = g.attributes.position.array, N = g.attributes.normal.array;
    for (let i = 0; i < P.length; i++) { s.p.push(P[i]); s.n.push(N[i]); }
  }
  flush() {
    for (const [mat, s] of this.m) {
      if (!s.p.length) continue;
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(s.p, 3));
      g.setAttribute('normal', new Float32BufferAttribute(s.n, 3));
      this.bag.add(mat, g);
    }
    this.m.clear();
  }
}
/** Wrap an element builder so that all it puts on the bag is gathered into one piece per material. */
export const soupy = (fn) => (el, ctx) => { const S = new Soup(ctx.bag); fn(el, { ...ctx, bag: S.proxy }); S.flush(); };
export const soupOfBag = (bag) => bag.soup;

/** A hash of integers to [0, 1). */
export function hash(a, b = 0, c = 0, d = 0) {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1) ^ Math.imul(d | 0, 0x85ebca6b);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ---- the height field ------------------------------------------------------------------------------------------------
/** A capsule of round section from a to b, radii r0 → r1, heights h0 → h1 (st: 0 united, 1 cut, 2 laid over; fine: left out below level 0). */
const C = (a, b, r0, r1, h0, h1, m, o = {}) => ({ ax: a[0], ay: a[1], bx: b[0], by: b[1], r0, r1: r1 ?? r0, h0, h1: h1 ?? h0, m, st: 0, ...o, L2: (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 });
const D = (a, r, h, m, o = {}) => C(a, a, r, r, h, h, m, o);
const cl = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
function hOf(p, u, v) {
  if (p.fn) return p.fn(u, v);
  const L2 = p.L2, dx = p.bx - p.ax, dy = p.by - p.ay;
  const t = L2 > 1e-9 ? cl(((u - p.ax) * dx + (v - p.ay) * dy) / L2) : 0;
  const qx = p.ax + t * dx - u, qy = p.ay + t * dy - v, d2 = qx * qx + qy * qy, r = p.r0 + (p.r1 - p.r0) * t;
  if (d2 >= r * r) return 0;
  const s2 = d2 / (r * r);
  let h = (p.h0 + (p.h1 - p.h0) * t) * Math.pow(1 - s2, p.e ?? 0.5);
  if (p.bump) h *= p.bump(u, v, t, s2);
  return h;
}
/** The height at (u, v) of the primitives (sorted by stage), and which one owns it (out.own). */
function field(S, u, v, out) {
  let h = 0, own = -1, sd = 1;
  for (const i of S.s0) {
    const p = S.p[i], hi = hOf(p, u, v);
    if (hi > h) { h = hi; own = i; }
    if (!p.fn) { const L2 = p.L2, t = L2 > 1e-9 ? cl(((u - p.ax) * (p.bx - p.ax) + (v - p.ay) * (p.by - p.ay)) / L2) : 0, d = Math.hypot(p.ax + t * (p.bx - p.ax) - u, p.ay + t * (p.by - p.ay) - v) - (p.r0 + (p.r1 - p.r0) * t); if (d < sd) sd = d; }
  }
  for (const i of S.s1) {
    const p = S.p[i], L2 = p.L2, dx = p.bx - p.ax, dy = p.by - p.ay, t = L2 > 1e-9 ? cl(((u - p.ax) * dx + (v - p.ay) * dy) / L2) : 0;
    const qx = p.ax + t * dx - u, qy = p.ay + t * dy - v, r = p.r0 + (p.r1 - p.r0) * t, d2 = qx * qx + qy * qy;
    if (d2 < r * r && h > 0) { const s = Math.sqrt(d2) / r, f = s < 0.55 ? 0 : (s - 0.55) / 0.45, hh = p.h0 + (h - p.h0) * f * f; if (hh < h) { h = hh; if (s < 0.8) own = i; } }
  }
  for (const i of S.s2) {
    const p = S.p[i], hi = hOf(p, u, v);
    if (hi > h) { h = hi; own = i; }
    if (!p.fn) { const L2 = p.L2, t = L2 > 1e-9 ? cl(((u - p.ax) * (p.bx - p.ax) + (v - p.ay) * (p.by - p.ay)) / L2) : 0, d = Math.hypot(p.ax + t * (p.bx - p.ax) - u, p.ay + t * (p.by - p.ay) - v) - (p.r0 + (p.r1 - p.r0) * t); if (d < sd) sd = d; }
  }
  out.sd = h > 0 ? 0 : sd < 0 ? 0 : sd;
  out.own = own;
  return h;
}
const RIM = 0.012;
const FIELDS = new Map();
/** The sampled field of a figure: { nx, ny, u0, v0, g, H, own, p }. */
function sampled(key, prims, g, level) {
  const k = `${key}|${level}`;
  let F = FIELDS.get(k);
  if (F) return F;
  const p = prims.filter((q) => !(q.fine && level > 0));
  const S = { p, s0: [], s1: [], s2: [] };
  p.forEach((q, i) => S['s' + q.st].push(i));
  let u0 = Infinity, v0 = Infinity, u1 = -Infinity, v1 = -Infinity;
  for (const q of p) {
    if (q.fn) { const b = q.box; u0 = Math.min(u0, b[0]); v0 = Math.min(v0, b[1]); u1 = Math.max(u1, b[2]); v1 = Math.max(v1, b[3]); continue; }
    const r = Math.max(q.r0, q.r1); u0 = Math.min(u0, q.ax - r, q.bx - r); u1 = Math.max(u1, q.ax + r, q.bx + r); v0 = Math.min(v0, q.ay - r, q.by - r); v1 = Math.max(v1, q.ay + r, q.by + r);
  }
  u0 -= 2 * g; v0 -= 2 * g; u1 += 2 * g; v1 += 2 * g;
  const nx = Math.ceil((u1 - u0) / g) + 1, ny = Math.ceil((v1 - v0) / g) + 1, H = new Float32Array(nx * ny), own = new Int16Array(nx * ny), o = { own: -1 };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const h = field(S, u0 + i * g, v0 + j * g, o);
    H[j * nx + i] = h > 0.0005 ? h : -Math.min(0.03, 0.004 + 2.2 * o.sd); own[j * nx + i] = h > 0.0005 ? o.own : -1;
  }
  F = { nx, ny, u0, v0, g, H, own, p };
  FIELDS.set(k, F);
  return F;
}

/**
 * Put a sampled field onto a face as triangles into the soup. `T`: { O, U, V, N } the face's origin and unit axes
 * (u along, v up, N out), size (the scale of the figure), su, sw (its stretch along and out), seed (for the hair of
 * a millimetre), mats (slot → material).
 */
function emit(S, F, T, size, su, sw, seed, mats) {
  const { nx, ny, u0, v0, g, H, own, p } = F, { O, U, V, N } = T;
  const det = U[0] * (V[1] * N[2] - V[2] * N[1]) - U[1] * (V[0] * N[2] - V[2] * N[0]) + U[2] * (V[0] * N[1] - V[1] * N[0]);
  const flip = det < 0;
  const px = new Float32Array(nx * ny * 3), nr = new Float32Array(nx * ny * 3);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, u = (u0 + i * g) * size * su, v = (v0 + j * g) * size, h = H[k];
    const w = h * size * sw + (h > 0 ? (hash(seed, k) - 0.5) * 0.0006 : 0);
    const hl = H[j * nx + Math.max(0, i - 1)], hr = H[j * nx + Math.min(nx - 1, i + 1)], hd = H[Math.max(0, j - 1) * nx + i], hu = H[Math.min(ny - 1, j + 1) * nx + i];
    const gu = (hr - hl) / ((Math.min(nx - 1, i + 1) - Math.max(0, i - 1)) * g), gv = (hu - hd) / ((Math.min(ny - 1, j + 1) - Math.max(0, j - 1)) * g);
    let a = -gu / su, b = -gv, c = 1 / sw; const l = Math.hypot(a, b, c); a /= l; b /= l; c /= l;
    for (let q = 0; q < 3; q++) { px[k * 3 + q] = O[q] + U[q] * u + V[q] * v + N[q] * w; nr[k * 3 + q] = U[q] * a + V[q] * b + N[q] * c; }
  }
  const tri = (i0, i1, i2) => {
    const hs = [H[i0], H[i1], H[i2]];
    if (hs[0] <= 0 && hs[1] <= 0 && hs[2] <= 0) return;
    let m = 0; for (let q = 1; q < 3; q++) if (hs[q] > hs[m]) m = q;
    const o = own[[i0, i1, i2][m]], slot = p[o]?.m ?? 'b', mat = mats[slot] ?? mats.b;
    if (!mat) return;
    const s = S.slot(mat), idx = flip ? [i0, i2, i1] : [i0, i1, i2];
    for (const q of idx) for (let c = 0; c < 3; c++) { s.p.push(px[q * 3 + c]); s.n.push(nr[q * 3 + c]); }
  };
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    if (H[a] <= 0 && H[b] <= 0 && H[c] <= 0 && H[d] <= 0) continue;
    if ((i + j) & 1) { tri(a, b, d); tri(a, d, c); } else { tri(a, b, c); tri(b, d, c); }
  }
}

// ---- the figures ----------------------------------------------------------------------------------------------------------
// (u forward, v up, metres; feet at v = 0; slots: b body, m mane / hair, t accents (fangs, claws, tuft), k black, e eye, n neck)
function lionPrims() {
  const P = [];
  const mane = (u, v) => {   // the mane: a disc round the face, its edge scalloped, in rows of locks
    const dx = u - 0.46, dy = v - 0.7, ang = Math.atan2(dy, dx);
    const s = Math.hypot(dx / 0.31, dy / 0.3) * (1 + 0.055 * Math.sin(ang * 11 + 1.3) + 0.025 * Math.sin(ang * 23));
    if (s >= 1) return 0;
    const fx = u - 0.8, fy = v - 0.84, d = Math.hypot(fx, fy), row = d / 0.075, q = row - Math.floor(row);
    const ridge = 0.5 + 0.5 * Math.cos(2 * Math.PI * q), lock = 0.5 + 0.5 * Math.cos(Math.atan2(fy, fx) * 9 + Math.floor(row) * 1.7);
    return 0.092 * Math.pow(1 - s * s, 0.4) * (0.8 + 0.2 * ridge) * (0.92 + 0.08 * lock);
  };
  const maneRough = (u, v) => {   // (reduced) the same without the rows
    const dx = u - 0.46, dy = v - 0.7, s = Math.hypot(dx / 0.31, dy / 0.3) * (1 + 0.05 * Math.sin(Math.atan2(dy, dx) * 11 + 1.3));
    return s >= 1 ? 0 : 0.09 * Math.pow(1 - s * s, 0.4);
  };
  P.push(C([-0.62, 0.58], [0.18, 0.56], 0.18, 0.2, 0.062, 0.062, 'b'));                                     // the body
  P.push(C([0.14, 0.52], [0.3, 0.46], 0.2, 0.19, 0.088, 0.088, 'b'));                                       // the shoulder
  P.push(C([-0.5, 0.5], [-0.56, 0.4], 0.19, 0.17, 0.09, 0.09, 'b'));                                        // the haunch
  P.push(C([-0.7, 0.62], [-0.72, 0.55], 0.13, 0.12, 0.075, 0.075, 'b'));                                    // the rump
  // hind legs: the rear one thrust back, the front one under the body
  P.push(C([-0.56, 0.42], [-0.68, 0.24], 0.15, 0.085, 0.085, 0.065, 'b'), C([-0.68, 0.24], [-0.76, 0.06], 0.075, 0.05, 0.062, 0.05, 'b'), C([-0.78, 0.035], [-0.6, 0.035], 0.042, 0.042, 0.055, 0.055, 'b'));
  P.push(C([-0.42, 0.42], [-0.36, 0.22], 0.14, 0.08, 0.08, 0.065, 'b'), C([-0.36, 0.22], [-0.33, 0.05], 0.07, 0.05, 0.06, 0.05, 'b'), C([-0.38, 0.035], [-0.2, 0.035], 0.042, 0.042, 0.055, 0.055, 'b'));
  // forelegs: the near one reaching forward
  P.push(C([0.3, 0.48], [0.4, 0.22], 0.1, 0.065, 0.075, 0.06, 'b'), C([0.4, 0.22], [0.46, 0.05], 0.06, 0.05, 0.058, 0.05, 'b'), C([0.42, 0.035], [0.58, 0.035], 0.045, 0.045, 0.055, 0.055, 'b'));
  P.push(C([0.4, 0.5], [0.6, 0.28], 0.11, 0.07, 0.08, 0.065, 'b'), C([0.6, 0.28], [0.74, 0.06], 0.065, 0.05, 0.062, 0.05, 'b'), C([0.7, 0.035], [0.88, 0.035], 0.045, 0.045, 0.058, 0.058, 'b'));
  for (const x of [0.86, 0.9, 0.94]) P.push(D([x, 0.032], 0.012, 0.07, 't', { st: 2, fine: true }));                    // claws
  for (const x of [0.56, 0.6]) P.push(D([x, 0.032], 0.011, 0.065, 't', { st: 2, fine: true }));
  // the tail with its tuft
  P.push(C([-0.76, 0.7], [-0.9, 0.76], 0.032, 0.03, 0.035, 0.035, 'b'), C([-0.9, 0.76], [-0.97, 0.9], 0.03, 0.028, 0.034, 0.034, 'b'), C([-0.97, 0.9], [-0.98, 1.0], 0.028, 0.03, 0.033, 0.033, 'b'));
  P.push(C([-0.98, 1.0], [-1.0, 1.12], 0.055, 0.04, 0.05, 0.045, 't', { bump: (u, v, t) => 0.85 + 0.15 * Math.cos((v - 1.0) * 80 + u * 20) }));
  // the mane
  P.push({ fn: mane, box: [0.1, 0.35, 0.8, 1.05], m: 'm', st: 0, fine: false, rough: maneRough });
  // the head: skull, brow, upper jaw, nose, ear, lower jaw dropped; the mouth carved between, the fangs in it
  P.push(C([0.66, 0.84], [0.82, 0.84], 0.125, 0.11, 0.1, 0.1, 'b', { st: 2 }));
  P.push(C([0.82, 0.93], [0.92, 0.9], 0.035, 0.032, 0.112, 0.11, 'b', { st: 2 }));
  P.push(C([0.86, 0.82], [0.98, 0.8], 0.07, 0.055, 0.09, 0.08, 'b', { st: 2 }));
  P.push(D([0.995, 0.815], 0.028, 0.09, 'k', { st: 2 }));
  P.push(C([0.72, 0.96], [0.7, 1.0], 0.035, 0.03, 0.1, 0.095, 'b', { st: 2 }));
  P.push(C([0.82, 0.66], [0.93, 0.64], 0.05, 0.04, 0.078, 0.07, 'b', { st: 2 }));
  P.push(C([0.84, 0.725], [1.0, 0.725], 0.026, 0.026, 0.008, 0.008, 'k', { st: 1 }));
  P.push(C([0.95, 0.752], [0.955, 0.705], 0.012, 0.008, 0.045, 0.045, 't', { st: 2, fine: true }), C([0.93, 0.7], [0.935, 0.742], 0.011, 0.008, 0.04, 0.04, 't', { st: 2, fine: true }));
  P.push(D([0.835, 0.895], 0.018, 0.125, 'e', { st: 2, fine: true }));
  return P;
}
function bullPrims() {
  const P = [];
  P.push(C([-0.62, 0.64], [0.26, 0.66], 0.25, 0.27, 0.07, 0.07, 'b'));                                      // the body
  P.push(C([0.3, 0.72], [0.42, 0.7], 0.2, 0.19, 0.1, 0.1, 'b'));                                             // the hump of the shoulders
  P.push(C([-0.6, 0.56], [-0.64, 0.46], 0.22, 0.2, 0.09, 0.09, 'b'));                                        // the haunch
  P.push(C([0.45, 0.78], [0.7, 0.76], 0.2, 0.15, 0.09, 0.085, 'b'));                                         // the neck
  P.push(C([0.48, 0.58], [0.62, 0.5], 0.09, 0.06, 0.075, 0.07, 'b'));                                        // the dewlap
  // head carried low, the muzzle, nostril, eye, ear
  P.push(C([0.74, 0.74], [0.9, 0.62], 0.13, 0.075, 0.09, 0.08, 'b'), C([0.9, 0.62], [0.95, 0.6], 0.07, 0.06, 0.078, 0.075, 'b'));
  P.push(D([0.95, 0.62], 0.014, 0.092, 'k', { st: 2, fine: true }), D([0.82, 0.77], 0.017, 0.105, 'e', { st: 2, fine: true }));
  P.push(C([0.68, 0.88], [0.6, 0.9], 0.04, 0.03, 0.078, 0.07, 'b'));
  // the horns of the aurochs: out, up and forward
  P.push(C([0.7, 0.9], [0.66, 1.05], 0.04, 0.03, 0.07, 0.06, 't'), C([0.66, 1.05], [0.7, 1.18], 0.03, 0.022, 0.06, 0.055, 't'), C([0.7, 1.18], [0.82, 1.24], 0.022, 0.012, 0.055, 0.05, 't'));
  // the legs: fore straight, hind with the hock; hooves
  P.push(C([0.52, 0.5], [0.56, 0.2], 0.1, 0.06, 0.08, 0.065, 'b'), C([0.56, 0.2], [0.56, 0.05], 0.055, 0.05, 0.062, 0.058, 'b'), C([0.54, 0.025], [0.62, 0.025], 0.03, 0.03, 0.06, 0.06, 'k'));
  P.push(C([0.4, 0.5], [0.36, 0.2], 0.1, 0.06, 0.08, 0.065, 'b'), C([0.36, 0.2], [0.36, 0.05], 0.055, 0.05, 0.062, 0.058, 'b'), C([0.34, 0.025], [0.42, 0.025], 0.03, 0.03, 0.06, 0.06, 'k'));
  P.push(C([-0.4, 0.5], [-0.34, 0.28], 0.17, 0.08, 0.09, 0.07, 'b'), C([-0.34, 0.28], [-0.4, 0.14], 0.07, 0.05, 0.065, 0.06, 'b'), C([-0.4, 0.14], [-0.38, 0.05], 0.05, 0.045, 0.058, 0.055, 'b'), C([-0.4, 0.025], [-0.32, 0.025], 0.03, 0.03, 0.06, 0.06, 'k'));
  P.push(C([-0.6, 0.48], [-0.66, 0.26], 0.17, 0.08, 0.09, 0.07, 'b'), C([-0.66, 0.26], [-0.76, 0.1], 0.07, 0.05, 0.065, 0.06, 'b'), C([-0.76, 0.1], [-0.72, 0.05], 0.05, 0.045, 0.058, 0.055, 'b'), C([-0.76, 0.025], [-0.68, 0.025], 0.03, 0.03, 0.06, 0.06, 'k'));
  // the row of curled hair along the belly in blue-green glaze
  P.push(C([-0.28, 0.43], [0.36, 0.43], 0.045, 0.045, 0.075, 0.075, 'm', { bump: (u) => 0.82 + 0.18 * Math.cos(u * 70) }));
  // the tail with its tuft
  P.push(C([-0.86, 0.88], [-0.94, 0.66], 0.03, 0.028, 0.034, 0.034, 'b'), C([-0.94, 0.66], [-0.95, 0.4], 0.028, 0.028, 0.034, 0.034, 'b'), C([-0.95, 0.4], [-0.95, 0.2], 0.052, 0.04, 0.05, 0.045, 'm', { bump: (u, v) => 0.85 + 0.15 * Math.cos(v * 70) }));
  return P;
}
function dragonPrims() {
  const P = [];
  const scales = (u, v) => {   // overlapping scales in rows
    const rv = 0.055, cv = Math.floor(v / rv), fu = (u / 0.07 + (cv & 1) * 0.5), fv = v / rv - cv;
    const x = fu - Math.floor(fu) - 0.5, d = Math.hypot(x * 1.0, (fv - 0.25) * 0.85);
    return 0.86 + 0.14 * cl(1.15 - d * 1.5);
  };
  P.push(C([-0.62, 0.48], [0.22, 0.5], 0.13, 0.15, 0.06, 0.06, 'b', { bump: scales }));                       // the long slender body
  P.push(C([0.22, 0.54], [0.34, 0.76], 0.15, 0.12, 0.075, 0.07, 'n', { bump: scales }));
  // the long upright neck (yellow, scaled), the head
  P.push(C([0.34, 0.74], [0.44, 1.02], 0.115, 0.09, 0.075, 0.065, 'n', { bump: scales }), C([0.44, 1.02], [0.5, 1.24], 0.09, 0.06, 0.065, 0.055, 'n', { bump: scales }), C([0.5, 1.24], [0.52, 1.32], 0.06, 0.055, 0.055, 0.055, 'n'));
  P.push(C([0.52, 1.33], [0.68, 1.32], 0.06, 0.05, 0.075, 0.07, 'b'), C([0.68, 1.31], [0.84, 1.29], 0.05, 0.035, 0.07, 0.06, 'b'), C([0.62, 1.26], [0.8, 1.25], 0.028, 0.02, 0.055, 0.05, 'b'));
  P.push(C([0.7, 1.272], [0.86, 1.268], 0.011, 0.011, 0.006, 0.006, 'k', { st: 1 }));
  P.push(C([0.84, 1.272], [0.93, 1.28], 0.008, 0.007, 0.03, 0.028, 'r', { st: 2, fine: true }), C([0.93, 1.28], [0.985, 1.312], 0.006, 0.005, 0.028, 0.026, 'r', { st: 2, fine: true }), C([0.93, 1.28], [0.985, 1.25], 0.006, 0.005, 0.028, 0.026, 'r', { st: 2, fine: true }));   // the forked tongue
  P.push(D([0.625, 1.345], 0.013, 0.095, 'e', { st: 2, fine: true }));
  P.push(C([0.56, 1.37], [0.5, 1.48], 0.016, 0.01, 0.05, 0.045, 't', { st: 2 }), C([0.61, 1.38], [0.6, 1.5], 0.014, 0.008, 0.05, 0.045, 't', { st: 2 }));   // the horns
  // forelegs of a lion
  P.push(C([0.4, 0.5], [0.58, 0.26], 0.09, 0.06, 0.07, 0.06, 'b'), C([0.58, 0.26], [0.66, 0.06], 0.06, 0.045, 0.06, 0.05, 'b'), C([0.62, 0.03], [0.76, 0.03], 0.04, 0.04, 0.052, 0.052, 'b'));
  P.push(C([0.3, 0.48], [0.4, 0.26], 0.09, 0.06, 0.07, 0.06, 'b'), C([0.4, 0.26], [0.44, 0.06], 0.06, 0.045, 0.06, 0.05, 'b'), C([0.4, 0.03], [0.54, 0.03], 0.04, 0.04, 0.052, 0.052, 'b'));
  // hind legs of an eagle: thigh, the backward hock, the slender shank, three toes forward and one back with talons
  for (const [x, f] of [[-0.42, 0], [-0.56, 1]]) {
    const hx = x + (f ? -0.08 : 0.06), sx = x + (f ? -0.1 : 0.02);
    P.push(C([x, 0.48], [hx, 0.34], 0.13, 0.07, 0.075, 0.06, 'b', { bump: scales }), C([hx, 0.34], [sx - 0.1, 0.19], 0.05, 0.035, 0.055, 0.05, 'b'), C([sx - 0.1, 0.2], [sx - 0.06, 0.04], 0.03, 0.028, 0.05, 0.048, 'b'));
    P.push(C([sx - 0.06, 0.035], [sx + 0.1, 0.035], 0.018, 0.012, 0.05, 0.045, 't', { fine: false }), C([sx - 0.06, 0.04], [sx + 0.07, 0.085], 0.015, 0.01, 0.048, 0.044, 't', { fine: true }), C([sx - 0.06, 0.035], [sx - 0.16, 0.035], 0.016, 0.01, 0.048, 0.044, 't', { fine: true }));
  }
  // the scorpion's tail: a curve of rings ending in the sting
  const ring = (u, v) => 0.9 + 0.1 * Math.cos((u + v) * 90);
  P.push(C([-0.64, 0.5], [-0.85, 0.54], 0.045, 0.04, 0.04, 0.04, 'b', { bump: ring }), C([-0.85, 0.54], [-0.97, 0.72], 0.04, 0.036, 0.04, 0.04, 'b', { bump: ring }), C([-0.97, 0.72], [-0.99, 0.95], 0.036, 0.034, 0.04, 0.04, 'b', { bump: ring }), C([-0.99, 0.95], [-0.92, 1.08], 0.034, 0.03, 0.04, 0.038, 'b', { bump: ring }));
  P.push(C([-0.92, 1.08], [-0.82, 1.1], 0.03, 0.01, 0.036, 0.03, 't', { st: 2 }));
  return P;
}
/** Stouten the primitives f(p) selects: radius × k (and height × kh). */
function stout(prims, f) { for (const p of prims) { const k = f(p); if (k) { p.r0 *= k[0]; p.r1 *= k[0]; if (k[1]) { p.h0 *= k[1]; p.h1 *= k[1]; } } } return prims; }
const KINDS = {
  lion: { prims: lionPrims(), g: [0.03, 0.06, 0.11], pitch: 1.0 },
  bull: { prims: stout(bullPrims(), (p) => (p.m === 't' && p.ay > 0.85 ? [1.5, 1.2] : p.m !== 'm' && p.m !== 'k' && Math.max(p.ay, p.by) < 0.52 ? [1.2, 1] : p.ay > 0.7 && p.ax > 0.6 && p.m === 'b' ? [1.15, 1] : null)), g: [0.03, 0.06, 0.11] },
  dragon: { prims: stout(dragonPrims(), (p) => (p.m === 'n' ? [1.35, 1] : p.ay > 1.2 && p.m === 'b' ? [1.4, 1.15] : p.m === 'b' && Math.max(p.ay, p.by) < 0.5 ? [1.2, 1] : null)), g: [0.025, 0.06, 0.11] },
};
// (the reduced and far levels use the mane without rows)
for (const k of Object.values(KINDS)) k.rough = k.prims.map((p) => (p.rough ? { ...p, fn: p.rough } : p));
const material = (kind, alt) => kind === 'lion'
  ? { b: alt ? Y : W, m: alt ? R : Y, t: alt ? W : Y, k: K, e: BL }
  : kind === 'bull' ? { b: Y, m: BL, t: W, k: K, e: K }
    : { b: W, n: Y, t: Y, k: K, e: BL, r: R };

/**
 * One figure of `kind` ('lion' | 'bull' | 'dragon') put on a face: `place(du, dv, w)` gives the world point of a place
 * on the face (u along, v up, w out of it), `dir` its walking direction (+1 along u), `size` its scale, `level` 0, 1 or 2.
 */
export function figure(S, kind, place, { size = 1, dir = 1, level = 0, alt = false, seed = 0 } = {}) {
  const K0 = KINDS[kind], F = sampled(kind, level > 0 ? K0.rough : K0.prims, K0.g[level], level);
  const O = place(0, 0, 0), a = place(1, 0, 0), b = place(0, 1, 0), c = place(0, 0, 1);
  const U = [(a[0] - O[0]) * dir, (a[1] - O[1]) * dir, (a[2] - O[2]) * dir], V = [b[0] - O[0], b[1] - O[1], b[2] - O[2]], N = [c[0] - O[0], c[1] - O[1], c[2] - O[2]];
  const su = 1 + 0.07 * (hash(seed, 1) - 0.5), sw = 1 + 0.2 * (hash(seed, 2) - 0.5);
  emit(S, F, { O, U, V, N }, size, su, sw, seed, material(kind, alt));
}

// ---- rosettes -----------------------------------------------------------------------------------------------------------
// (built facing +z at the origin, radius r: petals of a white glaze round a yellow boss, standing 3 cm proud)
const ROS = new Map();
function rosetteTris(level) {
  if (ROS.has(level)) return ROS.get(level);
  const out = { w: [], y: [] };
  const tri = (arr, a, b, c) => {   // a, b, c counter-clockwise seen from +z
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    arr.push([a, b, c, [nx, ny, nz]]);
  };
  const np = level === 0 ? 12 : level === 1 ? 8 : 6, bh = level === 0 ? 0.075 : 0.06;
  const pol = (ro, th, z) => [ro * Math.cos(th), ro * Math.sin(th), z];
  const lens = (arr, th, r0, r1, wd, z0, z1) => {   // a petal: a lens from r0 to r1 with a ridge down it
    const m = (r0 + r1) / 2, p0 = pol(r0, th, 0), tip = pol(r1, th, z0 * 0.3), cl0 = pol(m, th - wd, 0), cr0 = pol(m, th + wd, 0), ridge = pol(m, th, z1), base = pol(r0 + (r1 - r0) * 0.12, th, z0);
    tri(arr, p0, cl0, base); tri(arr, p0, base, cr0);
    tri(arr, cl0, ridge, base); tri(arr, base, ridge, cr0);
    tri(arr, cl0, tip, ridge); tri(arr, ridge, tip, cr0);
  };
  for (let i = 0; i < np; i++) {
    const th = 2 * Math.PI * i / np;
    lens(out.w, th, 0.34, 1.0, Math.PI / np * 0.92, 0.03, 0.045);
    if (level === 0) lens(out.y, th + Math.PI / np, 0.3, 0.62, Math.PI / np * 0.55, 0.05, 0.065);
  }
  const nb = level === 0 ? 12 : 6;                                         // the boss: a dome of two rings
  for (let i = 0; i < nb; i++) {
    const a0 = 2 * Math.PI * i / nb, a1 = 2 * Math.PI * (i + 1) / nb;
    if (level === 0) { tri(out.y, pol(0.3, a0, 0.05), pol(0.3, a1, 0.05), pol(0.17, a1, 0.085)); tri(out.y, pol(0.3, a0, 0.05), pol(0.17, a1, 0.085), pol(0.17, a0, 0.085)); tri(out.y, pol(0.17, a0, 0.085), pol(0.17, a1, 0.085), [0, 0, bh + 0.035]); }
    else tri(out.y, pol(0.3, a0, 0.04), pol(0.3, a1, 0.04), [0, 0, bh]);
  }
  ROS.set(level, out);
  return out;
}
/** One rosette of radius `rad` at world point `at` facing out of a face whose axes are U (along), V (up), N (out). */
export function rosette(S, at, U, V, N, rad, level) {
  const T = rosetteTris(level);
  for (const [arr, mat] of [[T.w, W], [T.y, Y]]) {
    const s = S.slot(mat);
    for (const [a, b, c, n] of arr) {
      const det = U[0] * (V[1] * N[2] - V[2] * N[1]) - U[1] * (V[0] * N[2] - V[2] * N[0]) + U[2] * (V[0] * N[1] - V[1] * N[0]);
      for (const q of det < 0 ? [a, c, b] : [a, b, c]) for (let k = 0; k < 3; k++) { s.p.push(at[k] + (U[k] * q[0] + V[k] * q[1]) * rad + N[k] * q[2] * rad * 1.5); s.n.push(U[k] * n[0] + V[k] * n[1] + N[k] * n[2]); }
    }
  }
}

// ---- the throne room's facade: palmette column, volutes, palmettes ---------------------------------------------------
// (a column's capital: two tiers of volutes on a palm trunk, each volute a spiral of round section; a palmette: a fan of
// leaves on a stem; all with the same field)
function spiral(cx, cy, r0, turns, sgn, n, th, h, m, out) {
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = sgn * (Math.PI * 0.2 + turns * 2 * Math.PI * t), r = r0 * (1 - 0.85 * t) , p = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    if (prev) out.push(C(prev, p, th, th * (1 - 0.3 * t), h, h, m));
    prev = p;
  }
}
function voluteSet() {
  const P = [];
  for (const sgn of [1, -1]) {
    // the band: two arms leaving the shaft's top and curling outward and down
    const cx = sgn * 0.34, cy = 0.0;
    spiral(cx, cy, 0.3, 1.5, -sgn, 11, 0.06, 0.09, 'b', P);
    P.push(D([cx, cy], 0.05, 0.09, 'e', { st: 2 }));
  }
  P.push(C([-0.34, 0.3], [0.34, 0.3], 0.045, 0.045, 0.05, 0.05, 'b'));
  return P;
}
function palmettePrims() {
  const P = [], N = 7;
  for (let i = 0; i < N; i++) {
    const a = Math.PI * (0.1 + 0.8 * i / (N - 1)), c = [0, 0.3];
    P.push(C([c[0] + 0.2 * Math.cos(a), c[1] + 0.2 * Math.sin(a)], [c[0] + 0.62 * Math.cos(a), c[1] + 0.62 * Math.sin(a)], 0.055, 0.085, 0.038, 0.05, 'b', { e: 0.6 }));
  }
  P.push(C([0, 0], [0, 0.28], 0.06, 0.07, 0.04, 0.05, 'b'), D([0, 0.3], 0.1, 0.06, 'b'));
  return P;
}
// (a palm trunk: a column 0.4 m broad and 3.6 m high with its scales in diamonds and a ring at every 0.9 m)
function trunkPrims() {
  const dia = (u, v) => 0.7 + 0.3 * Math.max(0, Math.cos((v + u * 1.6) * 30) * Math.cos((v - u * 1.6) * 30)) + (Math.abs(((v + 0.45) % 0.9) - 0.45) < 0.04 ? 0.15 : 0);
  return [C([0, 0.05], [0, 3.6], 0.2, 0.18, 0.1, 0.09, 'b', { e: 0.45, bump: dia })];
}
const FREE = { volute: { prims: voluteSet(), g: 0.025 }, palmette: { prims: palmettePrims(), g: 0.06 }, trunk: { prims: trunkPrims(), g: 0.04 } };
/** A free relief (`name`: 'volute' | 'palmette') with its origin at `place(0, 0, 0)`, `mat` for its body slot, `eye` for the boss. */
export function freeRelief(S, name, place, { size = 1, dir = 1, mat = W, eye = Y, level = 0, seed = 0 } = {}) {
  const K0 = FREE[name], F = sampled('free:' + name, K0.prims, K0.g, level);
  const O = place(0, 0, 0), a = place(1, 0, 0), b = place(0, 1, 0), c = place(0, 0, 1);
  const U = [(a[0] - O[0]) * dir, (a[1] - O[1]) * dir, (a[2] - O[2]) * dir], V = [b[0] - O[0], b[1] - O[1], b[2] - O[2]], N = [c[0] - O[0], c[1] - O[1], c[2] - O[2]];
  emit(S, F, { O, U, V, N }, size, 1 + 0.04 * (hash(seed, 1) - 0.5), 1, seed, { b: mat, e: eye });
}
