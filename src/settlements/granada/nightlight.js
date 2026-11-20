// Nasrid Granada by night (docs/settlements/granada.md §21). What lit the place about 1390: oil lamps of glass or bronze (hung on chains, set in wall niches, carried
// "on a long handle"), candles, the braziers and hearths of the houses, the baker's oven and the coppersmith's forge, the lamp on its iron bracket beside a door, the
// large bronze lamps of the mosque; no street lighting, the lanes dark between the lit doors. Made as the Suzhou reference makes it: geometry in the engine's one additive
// `halo` material (palette.js, materials.js 'halo': light added over what lies behind it at night only; no light, no shadow, no collision; invisible by day), so that the
// lamps and the lit rooms read at the low preset, where the pool of real lamps is off. The shape of each piece is carried by its normals: a glow round each flame (three
// crossed discs), a pool on the paving or the floor, a pane in front of a window's opening. The Halo class and the slab finder are the pattern of
// src/settlements/ming-suzhou/nightlight.js (copied: that file reads Suzhou's data), as isfahan/nightlight.js has them. A function of the thing's own place (hash): no
// counters, no Math.random.
//
// The builders already make the town's lamps (`lamp_glass` in the houses' rooms, the lane's bracket lamps, the Albaicín's halls) and its fires (`flame`: the hearth, the
// oven's mouth, the forge): the wrapper below turns each into a glow, so that every lamp the style builds has its halo without a line of its code changed. The palaces
// had no lamps: `gr_night` hangs them (lamps.js lists where), in the materials the landmark already has (gilt bronze, glass).

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { palaceLamps, townLamps } from './lamps.js';

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
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60°. */
  ball(x, y, z, r) { for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); } }
  /** A flat sheet (a window's lamp-lit pane) of brightness f (0..1), facing n = [x, z]. */
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
  const bx = new Map();
  for (let t = 0; t < n; t++) {
    const r = find(t);
    let b = bx.get(r);
    if (!b) bx.set(r, (b = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity }));
    for (let v = 0; v < 3; v++) {
      const x = P[t * 9 + v * 3], y = P[t * 9 + v * 3 + 1], z = P[t * 9 + v * 3 + 2];
      if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; if (z < b.z0) b.z0 = z; if (z > b.z1) b.z1 = z;
    }
  }
  const out = [];
  for (const b of bx.values()) {
    const dx = b.x1 - b.x0, dz = b.z1 - b.z0, dy = b.y1 - b.y0, th = Math.min(dx, dz), w = Math.max(dx, dz);
    if (th > thick || w < 0.3 || dy < 0.3 || th < 0.002) continue;
    if (dy > 4.4 || w > 2.4) continue;
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

/**
 * Wrap a builder context so that what it makes glows at night. Each lattice window (a room: a cell of the settlement by hash, 4 m x 3 m storeys, one of the lit `share`) gets a
 * pane of lamp-light on each face at strength `k`; each `lamp_glass` lamp (lit by hash, `lampShare`) a glow, and with `pool` (the height of the lamp over the street) a pool of
 * light on the street under it; each small `flame` (a hearth's fire, the oven's mouth, the forge: always lit) its glow. `win(b)` may refuse a window. Returns { ctx, finish }.
 */
export function lit(ctx, { share = 0.3, k = 0.7, windows = true, lamps = true, flames = true, lampShare = 0.5, pool = 0, s = 1, mats = ['lattice'], win = null } = {}) {
  const H = new Halo(), real = ctx.bag, WM = new Set(mats);
  const room = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const add = (mat, g, ...rest) => {
    if (typeof mat === 'string' && g?.attributes?.position) {
      if (windows && WM.has(mat)) { for (const b of slabsOf(g)) if (room(b) && (!win || win(b))) panesOf(H, b, 0.004, k); }
      else if (lamps && mat === 'lamp_glass') {
        const b = bbox(g), cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
        if (Math.max(b.x1 - b.x0, b.z1 - b.z0) < 0.6 && hashAt(cx, cz, 17) < lampShare) {
          H.ball(cx, (b.y0 + b.y1) / 2 + 0.02, cz, (0.62 + 0.18 * hashAt(cx, cz, 33)) * s);
          if (pool) H.floor(cx, b.y0 - pool + 0.05, cz, 2.1 + 0.4 * hashAt(cx, cz, 5), 1.6, 0, 8);
        }
      } else if (flames && mat === 'flame') {
        const b = bbox(g), w = Math.max(b.x1 - b.x0, b.z1 - b.z0, b.y1 - b.y0);
        if (w < 1.2) H.ball((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2 + 0.12, (b.z0 + b.z1) / 2, 0.55 + 0.5 * w);
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
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real) };
}
/** Wrap an element of a style's table so that it glows at night; `o` are lit()'s options. */
function wrapElement(S, name, o) {
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => { if (el.simple || el.solid) return base(el, ctx); const L = lit(ctx, o); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}

// ── the lamps hung where the palaces had none (lamps.js: where) ──────────────────────────────────────────
const GB = 'gilt_bronze', GL = 'glaze_yellow';   // (the amber vessel: a material the palaces' fine meshes already have, not a draw of its own)
/** A hanging lamp: three chains to a ring of bronze, a glass vessel of oil in it with its wick, its top at yt; bottom at yb. Returns the glow's centre. */
function hang(bag, x, z, yt, yb) {
  const r = 0.13;
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3; bag.add(GB, rod([x, yt, z], [x + Math.cos(a) * r, yb + 0.3, z + Math.sin(a) * r], 0.007, 3)); }
  bag.add(GB, lathe([[0.001, 0], [r * 0.85, 0.02], [r + 0.01, 0.1], [r * 0.9, 0.12], [0.001, 0.12]], 10, null, x, yb, z));       // the bronze cup
  bag.add(GL, lathe([[0.001, 0.02], [r * 0.7, 0.04], [r * 0.82, 0.14], [r * 0.6, 0.26], [r * 0.45, 0.3], [0.001, 0.3]], 10, null, x, yb + 0.08, z));      // the glass vessel
  bag.add(GB, rod([x, yb + 0.12, z], [x, yb + 0.36, z], 0.006, 3));
  return [x, yb + 0.26, z];
}
/** A lamp on a bracket from a wall: the iron arm (bronze) from the wall at (x, z) out along the unit n, the lamp hung under its end at height y. */
function wall(bag, x, y, z, n) {
  const ex = x + n[0] * 0.5, ez = z + n[1] * 0.5;
  bag.add(GB, rod([x, y + 0.1, z], [ex, y + 0.1, ez], 0.014, 4)); bag.add(GB, rod([x, y - 0.2, z], [ex - n[0] * 0.05, y + 0.1, ez - n[1] * 0.05], 0.012, 4));
  return hang(bag, ex, ez, y + 0.1, y - 0.42);
}
/** A lamp on a stand: a foot, a stem, a dish, the glass vessel; 1.4 m high. */
function stand(bag, x, y, z) {
  const j = 0.94 + 0.12 * hashAt(x, z, 7), s = (p) => p.map(([r, h]) => [r * j, h * (2 - j)]);       // (each its own height: alike, they would be an instanced draw)
  bag.add(GB, lathe(s([[0.2, 0], [0.19, 0.04], [0.1, 0.09], [0.05, 0.14], [0.035, 0.5], [0.05, 0.54], [0.035, 0.6], [0.035, 1.25], [0.14, 1.3], [0.16, 1.36], [0.001, 1.36]]), 10, null, x, y, z));
  bag.add(GL, lathe(s([[0.001, 1.34], [0.1, 1.36], [0.12, 1.46], [0.08, 1.56], [0.001, 1.58]]), 9, null, x, y, z));
  return [x, y + 1.5 * (2 - j), z];
}
/** A corona: a ring of bronze with twelve small lamps hung on three long chains from the ceiling's crown at yt, the ring at yb. */
function corona(bag, x, z, yt, yb) {
  const R = 0.7;
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.4; bag.add(GB, rod([x, yt, z], [x + Math.cos(a) * R, yb, z + Math.sin(a) * R], 0.01, 3)); }
  const ring = []; for (let k = 0; k <= 24; k++) { const a = k * TAU / 24; ring.push([x + Math.cos(a) * R, yb, z + Math.sin(a) * R]); }
  for (let k = 0; k < 24; k++) bag.add(GB, rod(ring[k], ring[k + 1], 0.016, 4));
  for (let k = 0; k < 12; k++) { const a = k * TAU / 12, px = x + Math.cos(a) * R, pz = z + Math.sin(a) * R; bag.add(GL, lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.1], [0.03, 0.14], [0.001, 0.15]], 7, null, px, yb + 0.02, pz)); }
}

/**
 * gr_night: { lamps: [{ k: 'wall' | 'hang' | 'stand' | 'corona', x, z, y, n?, yt? }] } — the lamps the palaces and the town's great rooms were lit by, with their glow in the
 * halo material (and a pool on the floor under a stand).
 */
function night(el, { bag }) {
  const H = new Halo();
  for (const l of el.lamps || []) {
    const j = 0.9 + 0.2 * hashAt(l.x, l.z, 3);
    if (l.k === 'wall') { const c = wall(bag, l.x, l.y, l.z, l.n); H.ball(c[0], c[1], c[2], 0.8 * j); }
    else if (l.k === 'hang') { const c = hang(bag, l.x, l.z, l.yt, l.y); H.ball(c[0], c[1], c[2], 0.95 * j); }
    else if (l.k === 'stand') { const c = stand(bag, l.x, l.y, l.z); H.ball(c[0], c[1], c[2], 0.9 * j); H.floor(l.x, l.y + 0.06, l.z, 1.9 * j, 1.9 * j); }
    else if (l.k === 'corona') { corona(bag, l.x, l.z, l.yt, l.y); H.ball(l.x, l.y + 0.1, l.z, 2.3 * j); H.ball(l.x, l.y + 0.1, l.z, 1.4 * j); }
  }
  H.flush(bag);
}
void box;

let DONE = false;
/** Register the lit forms in the Nasrid style and its wrapped twin: the lamps, fires and lattices the builders make, and the `gr_night` element. Called once by the settlement's index. */
export function registerNight() {
  if (DONE || !STYLES.nasrid || !STYLES['nasrid-g']) return;
  DONE = true;
  for (const S of [STYLES.nasrid, STYLES['nasrid-g']]) {
    for (const [name, o] of [
      ['andalusi_house', { share: 0.3, k: 0.5, lampShare: 0.45 }],      // a lamp in a room seen through its door, the oven's mouth, the hearth and the forge, a candle behind a lattice
      ['lane_dress', { windows: false, flames: false, lampShare: 0.8, pool: 2.1 }],     // the lamp on its bracket beside a door, its pool on the lane
      ['patio_house', { share: 0.35, k: 0.5, lampShare: 0.6 }],         // the lamps of the Albaicín's halls, the lattices of their rooms
      ['comares', { lamps: false, flames: false, share: 1, k: 0.55, mats: ['opening'], win: (b) => b.y0 > 39.9 && b.y1 < 41.3 }],      // the hall of the Ambassadors lit: its small upper windows, seen from outside
    ]) wrapElement(S, name, o);
    S.elements.gr_night = night;
  }
}
export { palaceLamps, townLamps };
