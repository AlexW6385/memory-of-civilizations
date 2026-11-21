// Safavid Isfahan by night (docs/settlements/isfahan.md §26). What lit the place then — the oil lamps of the shops under the Maidan's arcades
// and of the bazaar, the lamps hung in the rooms, the talar and the coffeehouse, the hearth's fire, a candle behind the lattice of a room — is
// made as the Suzhou reference makes it: geometry in the engine's one additive `halo` material (palette.js, materials.js 'halo': light added
// over what lies behind it at night only, no light, no shadow, no collision; invisible by day), so that the lamps and the lit rooms read at the
// low preset, where the pool of real lamps is off. The shape of each piece is carried by its normals: a glow round each flame (three crossed
// discs), a pool on the paving or the floor, a pane in front of a window's or a door's opening.
// The Halo class and the slab finder are the pattern of src/settlements/ming-suzhou/nightlight.js (copied: that file reads Suzhou's data), as
// src/settlements/ottoman-istanbul/nightlight.js has them. Everything is a function of the thing's own place (hash): no counters, no Math.random.
//
// The style's hanging lamps put a real light into `lights` (src/styles/safavid/index.js hangingLamp): the wrapper below turns each into a glow, so
// every lamp the builders already hang has its halo without a line of their code changed.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TAU = Math.PI * 2;
const MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc at c spanned by the unit axes U and V (semi-axes su, sv) in rings R (fractions of the radius) of brightness F, carried by the normals' y. */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving, a floor) at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8) { const s = Math.sin(yaw), c = Math.cos(yaw); this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs); }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]. */
  wall(x, y, z, nh, rw, rh, segs = 8) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9, 0], [0, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60°. */
  ball(x, y, z, r) { for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); } }
  /** A flat sheet (a window's or a door's lamp-lit pane) of brightness f (0..1), facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  /** Into the bag, one geometry. */
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

// ── the lit windows: the thin upright slabs of the window materials ──────────────────────────────────────
/** The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab at least 0.3 m wide and high. Each: { x0, y0, z0, x1, y1, z1 }. */
function slabsOf(g, thick = 0.2) {
  const gg = g.index ? g.toNonIndexed() : g, P = gg.attributes.position.array, n = P.length / 9;
  const par = new Int32Array(n).map((_, i) => i), find = (i) => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  const seen = new Map();
  for (let t = 0; t < n; t++) for (let v = 0; v < 3; v++) {
    const k = `${Math.round(P[t * 9 + v * 3] * 400)},${Math.round(P[t * 9 + v * 3 + 1] * 400)},${Math.round(P[t * 9 + v * 3 + 2] * 400)}`;
    const o = seen.get(k);
    if (o === undefined) seen.set(k, t); else { const a = find(o), b = find(t); if (a !== b) par[b] = a; }
  }
  const box = new Map();
  for (let t = 0; t < n; t++) {
    const r = find(t);
    let b = box.get(r);
    if (!b) box.set(r, (b = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity }));
    for (let v = 0; v < 3; v++) {
      const x = P[t * 9 + v * 3], y = P[t * 9 + v * 3 + 1], z = P[t * 9 + v * 3 + 2];
      if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; if (z < b.z0) b.z0 = z; if (z > b.z1) b.z1 = z;
    }
  }
  const out = [];
  for (const b of box.values()) {
    const dx = b.x1 - b.x0, dz = b.z1 - b.z0, dy = b.y1 - b.y0, th = Math.min(dx, dz), w = Math.max(dx, dz);
    if (th > thick || w < 0.3 || dy < 0.3 || th < 0.002) continue;
    if (dy > 4.4 || w > 2.4) continue;                // a gate or a door's niche, not a window
    out.push(b);
  }
  return out;
}
/** The lit panes for one slab: a sheet a hair off each of its two faces (the leaf less a frame's width), each room its own strength. */
function panesOf(H, b, off, k) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = k * (0.6 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5)));
  if (thinX) { const z0 = b.z0 + m, z1 = b.z1 - m; for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f); }
  else { const x0 = b.x0 + m, x1 = b.x1 - m; for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f); }
}
const bbox = (g) => { const p = g.attributes.position.array; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < p.length; i += 3) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); z0 = Math.min(z0, p[i + 2]); z1 = Math.max(z1, p[i + 2]); } return { x0, x1, y0, y1, z0, z1 }; };
/** Isfahan's windows: the lattice (a room's screen on its court, a transom over a shop door) and the dark opening of a shut door. */
const WINDOW_MATS = new Set(['lattice', 'daylight']);

/**
 * Wrap a builder context so that what it makes glows at night: each lattice window (a room, a cell of the settlement by hash, 4 m x 3 m storeys, one
 * of the lit `share`) gets a pane of lamp-light on each face at strength `k`; each real light the style hangs (`lights.push`) gets its glow; each
 * small `flame` (a hearth's fire, a wick) its glow. Returns { ctx, finish }; call finish() once the element is built.
 */
export function lit(ctx, { share = 0.3, k = 0.7, windows = true, lamps = true, flames = true, s = 1 } = {}) {
  const H = new Halo(), real = ctx.bag, rl = ctx.lights;
  const room = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const add = (mat, g, ...rest) => {
    if (typeof mat === 'string' && g?.attributes?.position) {
      if (windows && WINDOW_MATS.has(mat)) { for (const b of slabsOf(g)) if (room(b)) panesOf(H, b, 0.004, k); }
      else if (flames && mat === 'flame') {
        const b = bbox(g), w = Math.max(b.x1 - b.x0, b.z1 - b.z0, b.y1 - b.y0);
        if (w < 0.9) H.ball((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2 + 0.05, (b.z0 + b.z1) / 2, 0.42 + 0.5 * w);
      }
    }
    return real.add(mat, g, ...rest);
  };
  const bag = new Proxy(real, {
    get(t, key) {
      if (key === 'add') return add;
      const v = t[key];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  const lights = !lamps || !rl ? rl : new Proxy(rl, {
    get(t, key) {
      if (key === 'push') return (...a) => { for (const l of a) if (l?.at) H.ball(l.at[0], l.at[1], l.at[2], (0.62 + 0.07 * (l.intensity ?? 5)) * s * (0.92 + 0.16 * hashAt(l.at[0], l.at[2], 33))); return t.push(...a); };
      const v = t[key];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag, lights }, finish: () => H.flush(real) };
}
/** Wrap a style's element so that it glows at night: STYLES[style].elements[name]; `o` are lit()'s options. */
function wrapElement(name, o) {
  const S = STYLES.safavid;
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => { if (el.simple) return base(el, ctx); const L = lit(ctx, o); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}

/**
 * isf_night: { shops: [{ c, u, n, w, lit, open }], bazaar: { x, z0, z1, w, n }, iwans: [[x, y, z]] } — light only, one geometry:
 * the oil lamp of each lit shop under the arcades (a pane of light in the shut door's opening, or a glow inside the open one; a pool on the
 * arcade's passage and another on the square before the arch), the lamps of the bazaar's shops (a glow in the shop, a pool in the street),
 * the lamps hung in the court's four iwans.
 */
function night(el, { bag }) {
  const H = new Halo();
  for (const b of el.shops || []) {
    if (!b.lit) continue;
    const at = (s, d) => [b.c[0] + b.u[0] * s + b.n[0] * d, b.c[1] + b.u[1] * s + b.n[1] * d];
    const dw = Math.min(1.25, b.w * 0.18), df = 3.7, y = el.y ?? 0, jit = 0.85 + 0.3 * hashAt(b.c[0], b.c[1], 5);
    if (!b.open) {                                   // a pane of light in the shut door's opening, the lamp's glow just behind it
      const a = at(-dw, df - 0.01), c = at(dw, df - 0.01), nrm = [-b.n[0], -b.n[1]];
      H.quad([a[0], y + 0.05, a[1]], [c[0], y + 0.05, c[1]], [c[0], y + 2.65, c[1]], [a[0], y + 2.65, a[1]], nrm, 0.42 * jit);
    } else { const p = at(0, df + 1.1); H.ball(p[0], y + 2.05, p[1], 0.8 * jit); }
    const p1 = at(0, df - 1.7), p2 = at(0, -1.9);
    H.floor(p1[0], y + 0.12, p1[1], Math.min(2.3, b.w * 0.32) * jit, Math.min(1.5, b.w * 0.22) * jit, Math.atan2(b.u[0], b.u[1]));
    H.floor(p2[0], y + 0.07, p2[1], Math.min(2.6, b.w * 0.34) * jit, 1.3 * jit, Math.atan2(b.u[0], b.u[1]));
  }
  const z = el.bazaar;
  if (z) {
    const len = z.z0 - z.z1, n = Math.max(1, Math.round(len / 5)), bw = len / n;
    for (const sd of [-1, 1]) for (let i = 0; i < n; i++) {
      const zc = z.z0 - (i + 0.5) * bw;
      if (hashAt(sd * 7, zc, 41) > 0.85) continue;
      H.ball(z.x + sd * (z.w / 2 + 1.4), 1.9, zc, 0.8);
      H.floor(z.x + sd * (z.w / 2 - 0.9), 0.1, zc, 2.4, 1.9);
      if (sd < 0 && i % 2 === 0) { H.ball(z.x, 3.6, zc, 1.3); H.floor(z.x, 0.08, zc, 3.2, 2.6); }   // a lamp hung on a chain from the vault over the street [inferred]
    }
  }
  // the market's stalls on the square and along the walks, the goods mats and the storyteller's circle: an oil lamp hung under each awning (a glow
  // and a pool on the ground before it), a small lamp set by a seller's mat [inferred: Isfahan.ir §5 has the square lit by oil lamps at night]
  for (const s of el.stalls || []) {
    const [x, zz] = s.at, h = hashAt(x, zz, 61);
    if (h > (s.mat ? 0.7 : 0.9)) continue;
    if (s.mat) { H.ball(x, 0.55, zz, 0.55); H.floor(x, 0.07, zz, 2.0, 1.7); }
    else { H.ball(x, 1.95, zz - 0.2, 0.85 + 0.2 * h); H.floor(x, 0.07, zz - 0.6, 2.9, 2.4); }
  }
  for (const [x, y, zz] of el.iwans || []) H.ball(x, y, zz, 1.0);
  H.flush(bag);
}
let DONE = false;
/** Register the lit forms: the rooms' lamps, lattices and fires of the landmark and the houses, the coffeehouse, and the night element. Called once by the settlement's index. */
export function registerNight() {
  if (DONE || !STYLES.safavid) return;
  DONE = true;
  for (const [name, o] of [
    ['khaneh_open', { share: 0.45, k: 0.55 }],        // the talar's lamp, the kitchen's fire, a candle behind a lattice
    ['qahveh_khaneh', { share: 1, k: 0.7 }],           // the coffeehouse open into the evening, its four hanging lamps
    ['ali_qapu', { share: 0.35, k: 0.55 }],            // the palace's rooms, the music hall
    ['talar', { windows: false }],                     // the lamps hung in the talar
    ['dome_chamber', { windows: false, s: 1.15 }],     // the lamps on chains in the two sanctuaries
    ['square_arcade', { share: 0.25, k: 0.45 }],       // the lamps of the shops that are entered, the lattices over their doors
  ]) wrapElement(name, o);
  STYLES.safavid.elements.isf_night = night;
}
