// The sculptor's kit of the East Hall's painted clay figures (docs/settlements/tang-wutai.md §18): rings lofted into
// smooth skins, a head with brow, nose, lips and ears, a hand with fingers, a lotus petal, a hash of a piece's own
// position (never a counter or an RNG object: the same plan builds the same geometry every time).
// Units are metres of the figure's own frame (+z forward, +y up); the caller places and scales it.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { skin, tube, blob, strap } from '../../styles/chinese/statues.js';

export { skin, tube, blob, strap };
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/** A number in [0, 1) from three numbers (a piece's own position or index). */
export function hash(a, b = 0, c = 0) {
  let h = (Math.imul(Math.round(a * 1000) | 0, 73856093) ^ Math.imul(Math.round(b * 1000) | 0, 19349663) ^ Math.imul(Math.round(c * 1000) | 0, 83492791)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Pieces gathered by material and put out as ONE geometry per material (so repeated shapes never instance). */
export class Acc {
  constructor() { this.m = new Map(); }
  add(mat, ...gs) { let l = this.m.get(mat); if (!l) this.m.set(mat, (l = [])); for (const g of gs) if (g) l.push(g); }
  tris() { let n = 0; for (const l of this.m.values()) for (const g of l) n += g.attributes.position.count / 3; return n; }
  emit(bag, xf) {
    for (const [mat, l] of this.m) {
      let n = 0;
      const gs = l.map((g) => { if (g.index) g = g.toNonIndexed(); xf(g); n += g.attributes.position.count; return g; });
      const P = new Float32Array(n * 3), N = new Float32Array(n * 3);
      let o = 0;
      for (const g of gs) { P.set(g.attributes.position.array, o); N.set(g.attributes.normal.array, o); o += g.attributes.position.count * 3; }
      const out = new BufferGeometry();
      out.setAttribute('position', new Float32BufferAttribute(P, 3)); out.setAttribute('normal', new Float32BufferAttribute(N, 3));
      bag.add(mat, out);
    }
  }
}

/** n points round an ellipse at height y, centre (cx, cz), radii rx (across) and rz (front-back; +z the front), scaled by f(θ). */
export function ring(cx, y, cz, rx, rz, n, f = null) {
  const r = [];
  for (let i = 0; i < n; i++) { const th = (i / n) * Math.PI * 2, k = f ? f(th) : 1; r.push([cx + Math.cos(th) * rx * k, y, cz + Math.sin(th) * rz * k]); }
  return r;
}
/** A closed surface through rows [{ y, cx, cz, rx, rz, f }] (a body, a skirt, a limb of the robe). */
export function body(rows, n = 24, cap = true) { return skin(rows.map((r) => ring(r.cx ?? 0, r.y, r.cz ?? 0, r.rx, r.rz ?? r.rx, n, r.f)), true, cap); }

/** A lotus petal: a shell with a midrib that rises from radius r0 at height y0, curls outward, ends in a point. */
export function petal(th, r0, y0, len, w, lift, thick = 0.03, N = 6) {
  const rings = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, half = w * Math.sqrt(Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.88))) * (1 - 0.15 * t), out = r0 + len * Math.sin(lift * t * 0.9 + 0.2) * 0.9 * (0.4 + 0.6 * t), up = y0 + len * Math.sin(lift * t) * 0.95 - 0.05 * len * t * t * t;
    const bulge = thick * Math.sin(Math.PI * Math.min(1, t * 1.1)) + 0.01, rib = 0.018 * (1 - t);
    const P = (a, d, yy) => [Math.cos(th) * (out + d) - Math.sin(th) * a, yy, Math.sin(th) * (out + d) + Math.cos(th) * a];
    rings.push([P(-half, -0.015, up - 0.012 * (1 - t)), P(-half * 0.5, bulge * 0.7, up + 0.004), P(0, bulge + rib, up + 0.008), P(half * 0.5, bulge * 0.7, up + 0.004), P(half, -0.015, up - 0.012 * (1 - t)), P(0, -0.03, up - 0.02)]);
  }
  return skin(rings, true, false);
}

/**
 * The head at c (centre of the skull), scale k (1 = a head 0.28 m high); returns pieces into acc: F flesh, K black paint, R red paint, H hair.
 * kind: 'buddha' (full, calm, heavy lids, long lobes, the urna), 'bodhi' (full cheeks, half-closed eyes), 'old' (brow, cheekbones, shaven),
 * 'fierce' (the king's wide eyes and open mouth), 'lady' (a round young face), 'bar' (the groom's nose and beard). `lod` 1 leaves out the small parts.
 */
export function head(acc, c, k, o = {}) {
  const kind = o.kind || 'bodhi', lod = o.lod ?? 2, mats = { F: o.flesh || 'skin_light', K: 'lacquer_black', R: 'lacquer_red', H: 'lacquer_black' };
  const fierce = kind === 'fierce', old = kind === 'old', buddha = kind === 'buddha', lady = kind === 'lady', bar = kind === 'bar';
  const turn = o.turn || 0, tilt = o.tilt || 0;
  const mk = (g) => { if (tilt) g.rotateX(tilt); if (turn) g.rotateY(turn); g.translate(c[0], c[1], c[2]); return g; };
  const bl = (x, y, z, rx, ry, rz, seg = 8, rows = 4) => mk(blob([x * k, y * k, z * k], rx * k, ry * k, rz * k, seg, rows));
  const prof = [[0.001, -0.14], [0.03, -0.133], [0.058, -0.112], [0.083, -0.07], [0.095, -0.025], [0.099, 0.02], [0.097, 0.06], [0.088, 0.1], [0.066, 0.128], [0.034, 0.142], [0.001, 0.148]];
  const jaw = fierce ? 1.1 : old ? 0.94 : lady ? 0.9 : 1.0, N = lod > 1 ? 20 : 12;
  const rows = prof.map(([r, y]) => { const rr = []; for (let s = 0; s < N; s++) { const th = (s / N) * Math.PI * 2, fr = Math.max(0, Math.sin(th)); rr.push([Math.cos(th) * r * (y < -0.04 ? jaw : 1) * k, y * k, Math.sin(th) * r * (1.05 + 0.1 * fr) * k]); } return rr; });
  acc.add(mats.F, mk(skin(rows, true, true)));
  if (lod < 2) { acc.add(mats.K, bl(0.04, 0.02, 0.1, 0.028, 0.009, 0.01, 6, 3), bl(-0.04, 0.02, 0.1, 0.028, 0.009, 0.01, 6, 3)); acc.add(mats.R, bl(0, -0.072, 0.107, 0.026, 0.01, 0.012, 6, 3)); acc.add(mats.F, bl(0, -0.02, 0.122, 0.016, 0.04, 0.02, 6, 3)); return; }
  // brow ridge, cheeks, chin
  acc.add(mats.F, bl(0, 0.047, 0.098, 0.09, old || fierce ? 0.02 : 0.013, 0.024, 10, 3), bl(0, -0.118, 0.07, 0.036, 0.024, 0.03, 8, 4));
  for (const s of [-1, 1]) acc.add(mats.F, bl(s * 0.058, -0.04, 0.085, 0.038, 0.04, 0.03, 8, 4));
  // the nose: the bridge, the tip, the wings and the nostrils
  acc.add(mats.F, bl(0, -0.005, 0.116, 0.013, 0.042, 0.02, 8, 4), bl(0, -0.035, 0.128, bar ? 0.025 : 0.019, 0.018, 0.02, 8, 4));
  for (const s of [-1, 1]) acc.add(mats.F, bl(s * 0.021, -0.039, 0.115, 0.011, 0.013, 0.013, 6, 3));
  acc.add('lacquer_black', ...[-1, 1].map((s) => bl(s * 0.011, -0.046, 0.134, 0.005, 0.004, 0.004, 4, 2)));
  // the eyes: almond, with an upper lid of flesh drawn down (the heavy-lidded calm of a Buddha), a black line and brow
  for (const s of [-1, 1]) {
    const ew = fierce ? 0.025 : 0.027, eh = fierce ? 0.016 : buddha ? 0.006 : 0.009;
    acc.add(mats.K, bl(s * 0.04, 0.021, 0.1, ew, eh, 0.01, 8, 3));
    if (!fierce) acc.add(mats.F, bl(s * 0.04, 0.021 + eh * 1.1, 0.102, ew * 1.05, eh * 1.1, 0.01, 8, 3));
    const brow = [], by0 = fierce ? 0.058 : 0.05;
    for (let i = 0; i <= 5; i++) {
      const t = i / 5, bx = s * (0.012 + 0.06 * t), by = by0 + (fierce ? -0.02 * t + 0.012 * Math.sin(Math.PI * t) : 0.012 * Math.sin(Math.PI * t) - 0.009 * t), bz = 0.104 - 0.03 * t * t;
      const q = [bx * k, by * k, bz * k]; const tq = [q[0], q[1], q[2]]; brow.push([tq[0], tq[1], tq[2], (fierce ? 0.008 : 0.0045) * k]);
    }
    acc.add(mats.K, mk(tube(brow, 5, 0.8)));
    if (old) acc.add(mats.F, bl(s * 0.04, 0.036, 0.099, 0.03, 0.007, 0.012, 6, 3));
  }
  // the lips: the upper thinner than the lower, red; a dimple above; the mouth open and dark for the king
  if (fierce) { acc.add(mats.K, bl(0, -0.078, 0.1, 0.03, 0.017, 0.012, 8, 3)); acc.add(mats.R, bl(0, -0.063, 0.106, 0.033, 0.008, 0.012, 8, 3), bl(0, -0.092, 0.1, 0.03, 0.009, 0.012, 8, 3)); }
  else {
    const sm = buddha || lady ? 1.0 : 0.9;
    acc.add(mats.R, bl(0, -0.068, 0.107, 0.025 * sm, 0.0065, 0.012, 8, 3), bl(0, -0.081, 0.104, 0.021 * sm, 0.008, 0.012, 8, 3));
    acc.add(mats.F, bl(0, -0.057, 0.115, 0.012, 0.005, 0.008, 6, 3));
  }
  if (buddha || kind === 'bodhi') acc.add(mats.R, bl(0, 0.07, 0.113, 0.006, 0.006, 0.004, 5, 3));      // the urna
  // the ears, with long lobes (longest on the Buddha)
  const lobe = buddha ? 0.075 : 0.045;
  for (const s of [-1, 1]) acc.add(mats.F, bl(s * 0.099, 0.0, -0.002, 0.012, 0.04, 0.028, 6, 4), bl(s * 0.101, -0.04 - lobe * 0.4, 0.0, 0.008, lobe * 0.8, 0.014, 6, 3));
  if (bar || fierce) { for (const s of [-1, 1]) acc.add(mats.H, bl(s * 0.03, -0.054, 0.108, 0.034, 0.011, 0.012, 7, 3)); if (bar) acc.add(mats.H, bl(0, -0.105, 0.075, 0.07, 0.07, 0.05, 10, 5)); }
}

/** The hair's cap over a head, c as for head(): a bowl, with `chignon` a high knot in two coils and locks falling to the shoulders. */
export function hair(acc, c, k, o = {}) {
  const mat = o.mat || 'lacquer_black';
  acc.add(mat, blob([c[0], c[1] + 0.05 * k, c[2] - 0.012 * k], 0.103 * k, 0.1 * k, 0.108 * k, 14, 6));
  if (o.chignon) {
    acc.add(mat, blob([c[0], c[1] + 0.19 * k, c[2] - 0.02 * k], 0.07 * k, 0.07 * k, 0.065 * k, 10, 5), blob([c[0], c[1] + 0.27 * k, c[2] - 0.02 * k], 0.045 * k, 0.05 * k, 0.04 * k, 8, 4));
    if (o.locks !== false) for (const s of [-1, 1]) acc.add(mat, tube([[c[0] + s * 0.098 * k, c[1], c[2] - 0.02 * k, 0.014 * k], [c[0] + s * 0.11 * k, c[1] - 0.12 * k, c[2] - 0.03 * k, 0.014 * k], [c[0] + s * 0.14 * k, c[1] - 0.24 * k, c[2] - 0.04 * k, 0.012 * k], [c[0] + s * 0.2 * k, c[1] - 0.34 * k, c[2] - 0.03 * k, 0.01 * k]], 6));
  }
}

/**
 * A hand at p, the fingers along f, the palm facing n: a palm that tapers to the wrist, four fingers of three joints curled by `curl`
 * (0 straight … 1 closed) and fanned by `spread`, a thumb; `s` 1 is a bodhisattva's hand (0.16 m), `thumb` how far it folds in.
 */
export function hand(acc, mat, p, f, n, o = {}) {
  const { curl = 0.3, spread = 0.1, s = 1, thumb = 0.4, curls = null } = o;
  f = norm(f); n = norm(sub(n, [f[0] * dot(n, f), f[1] * dot(n, f), f[2] * dot(n, f)]));
  const sd = norm(cross(f, n));
  acc.add(mat, tube([[...add3(p, f, -0.012 * s), 0.019 * s], [...add3(p, f, 0.03 * s), 0.036 * s], [...add3(p, f, 0.075 * s), 0.031 * s]], 7, 0.45));
  for (let i = 0; i < 4; i++) {
    const off = (i - 1.5) * 0.019 * s, base = add3(add3(p, f, 0.075 * s), sd, off), L = [0.034, 0.028, 0.022].map((v) => v * s * (i === 0 || i === 3 ? 0.88 : i === 1 ? 1.06 : 1));
    const cu = curls ? curls[i] : curl * (i === 0 ? 1.1 : 1);
    let d = norm(add3(f, sd, (i - 1.5) * spread)), q = base;
    const path = [[...q, 0.0094 * s]];
    for (let j = 0; j < 3; j++) { const a = cu * (0.4 + j * 0.5) * 0.9; d = norm(add3(d, n, -Math.sin(a) * 0.9)); q = add3(q, d, L[j]); path.push([...q, (0.0094 - 0.0015 * (j + 1)) * s]); }
    acc.add(mat, tube(path, 5));
  }
  const tb = add3(add3(p, f, 0.03 * s), sd, -0.03 * s), td = norm(add3(add3(f, sd, -0.4 + thumb), n, -0.3 * thumb));
  acc.add(mat, tube([[...tb, 0.0115 * s], [...add3(tb, td, 0.03 * s), 0.0099 * s], [...add3(add3(tb, td, 0.055 * s), n, -0.01 * s), 0.0082 * s]], 5));
}

/** A tube of rounded radius along a path of [x, y, z] with one radius (a bangle, a hem rope, a sash). */
export const rope = (pts, r, seg = 6) => tube(pts.map((p) => [p[0], p[1], p[2], r]), seg);
/** A closed band round a vertical axis at height y: a belt, a bracelet, a hem edge (x, z the centre, rx, rz radii, r the rope's radius). */
export function band(cx, y, cz, rx, rz, r, n = 18, seg = 5) {
  const pts = []; for (let i = 0; i <= n; i++) { const th = (i / n) * Math.PI * 2; pts.push([cx + Math.cos(th) * rx, y, cz + Math.sin(th) * rz, r]); }
  return tube(pts, seg);
}

/**
 * A limb or a sleeve along path [[x, y, z, r]…]: rings square to the path, n round, the radius scaled by f(θ, t, i) (folds along a sleeve,
 * a muscle's swell): flat ends capped.
 */
export function limb(path, n = 10, f = null) {
  const rings = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], T = norm(sub(b, a)), ref = Math.abs(T[1]) > 0.92 ? [1, 0, 0] : [0, 1, 0];
    const Nn = norm(cross(ref, T)), B = norm(cross(T, Nn)), r = p[3], t = i / (path.length - 1), rr = [];
    for (let s = 0; s < n; s++) { const th = (s / n) * Math.PI * 2, k = f ? f(th, t, i) : 1; rr.push(add3(add3([p[0], p[1], p[2]], Nn, Math.cos(th) * r * k), B, Math.sin(th) * r * k)); }
    return rr;
  });
  return skin(rings);
}
/** Interpolate a row table [{ y, … }] (sorted by y) at height y for a key. */
export function at(rows, y, key) {
  if (y <= rows[0].y) return rows[0][key] ?? 0;
  for (let i = 1; i < rows.length; i++) if (y <= rows[i].y) { const a = rows[i - 1], b = rows[i], t = (y - a.y) / (b.y - a.y); return (a[key] ?? 0) * (1 - t) + (b[key] ?? 0) * t; }
  return rows[rows.length - 1][key] ?? 0;
}
/** A raised panel: a shallow box on a face — centre c, tangent u, outward normal v (unit vectors), half-width w, y0..y1, depth d, with its rim sloped. */
export function raised(c, u, v, w, y0, y1, d) {
  const P = (s, y, o) => [c[0] + u[0] * s + v[0] * o, y, c[2] + u[2] * s + v[2] * o];
  const ringOf = (m, o) => [P(-w * m, y0 + (1 - m) * 0.0, o), P(w * m, y0, o), P(w * m, y1, o), P(-w * m, y1, o)];
  return skin([ringOf(1, 0), ringOf(0.96, d * 0.6), ringOf(0.9, d)], true, true);
}

/** A flat hanging band (a scarf, a sash) along path [[x, y, z, width]…], its face turned toward `nrm` (unit; where the cloth faces), thickness t. */
export function sash(path, nrm, t = 0.008, wob = 0) {
  const rings = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], T = norm(sub(b, a)), sd = norm(cross(T, nrm)), nn = norm(cross(sd, T)), w = p[3] / 2, rp = Math.sin(i * 1.9 + wob) * 0.012;
    const P = (s, d) => [p[0] + sd[0] * s + nn[0] * d, p[1] + sd[1] * s + nn[1] * d, p[2] + sd[2] * s + nn[2] * d];
    return [P(-w, rp - t), P(0, rp + t * 2.2), P(w, rp - t), P(0, rp - t * 3)];
  });
  return skin(rings, true, true);
}

/** A Catmull-Rom curve through control points [[x, y, z, r…]…], m samples (every number interpolated). */
export function curve(P, m) {
  const out = [], g = (i) => P[Math.max(0, Math.min(P.length - 1, i))];
  for (let k = 0; k <= m; k++) {
    const u = (k / m) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(u)), t = u - i, a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
    out.push(b.map((_, j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t * t * t)));
  }
  return out;
}
/** n points round an ellipse in the plane z (x across, y up), centre (cx, cy), radii rx, ry, scaled by f(θ): the θ = 90° point is the top. */
export function ringZ(z, cx, cy, rx, ry, n, f = null) {
  const r = [];
  for (let i = 0; i < n; i++) { const th = (i / n) * Math.PI * 2, k = f ? f(th) : 1; r.push([cx + Math.cos(th) * rx * k, cy + Math.sin(th) * ry * k, z]); }
  return r;
}

/** The same geometry with a flat normal to every triangle (crisp timber, stone); the geometry must be non-indexed. */
export function flat(g) {
  const P = g.attributes.position.array, N = new Float32Array(P.length);
  for (let i = 0; i < P.length; i += 9) {
    const a = [P[i], P[i + 1], P[i + 2]], b = [P[i + 3], P[i + 4], P[i + 5]], c = [P[i + 6], P[i + 7], P[i + 8]], n = norm(cross(sub(c, b), sub(a, b)));
    for (let k = 0; k < 3; k++) { N[i + 3 * k] = n[0]; N[i + 3 * k + 1] = n[1]; N[i + 3 * k + 2] = n[2]; }
  }
  g.setAttribute('normal', new Float32BufferAttribute(N, 3));
  return g;
}
