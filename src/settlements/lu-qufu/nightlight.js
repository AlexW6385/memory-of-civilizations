// Qufu, c. 1730, by night — what lit the temple and the town, and the light it throws (docs/settlements/lu-qufu.md §15).
// The light of the place and date: the oil lamp of a household (a dish of rapeseed or bean oil with a wick, or a tallow candle), the red paper lantern at the gate, the paper
// lantern of a shop and of a hawker's pole, the stone lamp of the street with its candle, the iron fire basket of the guards at the gates, the stove's fire under the iron pot of the
// kitchen, the lamps and tall candles before the tablets of the temple's halls. Paper windows (lattice covered with paper) glow with the lamp behind them. [inferred throughout]
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no
// collision, so the day view is unchanged and the real point lights (off at the low preset) are not needed. The shape of each piece is carried by its normals (y: 1 at a disc's
// middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane before a lit doorway or window. The style's elements that make light are
// wrapped here (the style files stay as they were) by what they build: every paper lantern (`lamp_paper`) they add gets its glow, every window lattice (`lattice_red`) its pane
// (on the side that looks into the court), the kitchen's great iron pot its hearth glow. A household is lit or dark by the hash of its own place (the lamps of a dark house are
// taken out of the plan's lights too). Each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou reference, written for
// Qufu's lamps; nothing of Suzhou's is imported.

import '../../styles/lu/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { lotFrame } from '../../styles/lu/kit.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material; the brightness is the normal's y (1 at a disc's middle, 0 at its rim). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
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
  /** A disc lying flat at height y (the ground or a floor), rx by rz across, k its strength. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit window or doorway) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor or ground it stands over, if known. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.2 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * A proxy of the element's context whose bag watches what is added: `on(mat, bounds)` is called for each piece of the materials in `watch` (the piece is added as usual).
 * Returns the ctx to build with.
 */
function watching(ctx, watch, on) {
  const real = ctx.bag;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => { if (watch.has(mat) && g?.attributes?.position) on(mat, bounds(g)); return t.add(mat, g, ...r); };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ...ctx, bag };
}
const midOf = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const NOOPCTX = { bag: new Proxy({}, { get: () => () => {} }), col: new Proxy({}, { get: () => () => {} }) };

let depth = 0;
/** The pane of a lit window: a window lattice (a thin slab) glows on the side that looks into the court (toward `c`, the lot's middle). */
function windowPane(H, b, c, share) {
  const dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
  if (!(th < 0.2 && dy > 0.45 && dy < 2.6 && w > 0.3)) return;
  const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
  if (hashAt(mx, mz, 31 + Math.floor(b[1] / 2)) >= share) return;
  const f = 0.4 + 0.3 * hashAt(mx, mz, 7), m = 0.05, o = 0.012;
  if (dx < dz) { const s = mx > c[0] ? -1 : 1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
  else { const s = mz > c[1] ? -1 : 1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
}

// ── the courtyard house ─────────────────────────────────────────────────────────
/** The household's rank, as the style decides it (house.js luHouse): 2 grey brick, 1 mud plaster, 0 mud brick and thatch. */
const tierOf = (el) => { const luck = rngOf((el.seed || 1) * 7919 + 13)(), score = (el.wealth ?? 0) + (luck - 0.5) * 0.26; return score > 0.55 ? 2 : score > 0.3 ? 1 : 0; };
const LITSHARE = [0.22, 0.5, 0.72];
function houseWrap(fn) {
  return function lit(el, ctx) {
    const lights = ctx?.lights;
    if (depth > 0 || !lights || el.simple || (el.lod ?? 0) >= 2) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
    const [x0, z0, x1, z1] = el.rect, c = midOf(el.rect), tier = tierOf(el), on = hashAt(c[0], c[1], 3) < LITSHARE[tier], H = new Halo();
    const first = rngOf(el.seed || 1)(), W = x1 - x0, shopOn = !!el.shop && tier > 0, gx = x0 + 3.6 + (shopOn ? (first < 0.5 ? 0.25 : 0.7) : first) * Math.max(0, W - 7.2), zf = z1 - 0.21;
    const n = lights.length, wctx = watching(ctx, new Set(['lamp_paper', 'lattice_red', 'iron']), (mat, b) => {
      if (!on) return;
      const mx = (b[0] + b[3]) / 2, my = (b[1] + b[4]) / 2, mz = (b[2] + b[5]) / 2, dx = b[3] - b[0], dy = b[4] - b[1];
      if (mat === 'lamp_paper' && dx < 0.5) {
        H.ball(mx, my, mz, 0.46, 0.6);
        if (mz > zf - 0.1 && my > 1.8) H.floor(mx, 0.04, mz + 0.9, 1.7, 1.5, 8, 0.5);          // the lantern at the gate: a pool on the lane
        else if (my < 3.3) H.floor(mx, 0.04 + (mz > z0 + 8 ? 0.4 : 0.6), mz, 1.4, 1.4, 8, 0.4);   // a lantern in a room
      } else if (mat === 'lattice_red') windowPane(H, b, c, 0.55);
      else if (mat === 'iron' && dx > 1.0 && dx < 1.3 && dy > 0.18 && dy < 0.28) { H.ball(mx, b[4] + 0.15, mz, 0.55, 0.5); H.floor(mx, 0.43, mz + 0.5, 1.5, 1.2, 8, 0.45); }   // the stove's fire under the pot
    });
    depth++;
    try { var r = fn.call(this, el, wctx); } finally { depth--; }
    if (!on) lights.length = n;
    else {
      // a lit gate: the pool of the lanterns and a warm sheet across a gate's open leaves are carried by the lanterns above; rank 1 and 2 have the door's lamp in the passage
      if (tier) H.floor(gx, 0.05, zf + 1.4, 2.0, 1.6, 8, 0.35);
    }
    H.flush(ctx.bag);
    return r;
  };
}

// ── the shops ───────────────────────────────────────────────────────────────────
function shopWrap(fn) {
  return function shops(el, ctx) {
    const lights = ctx?.lights;
    if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
    const F = lotFrame(NOOPCTX, el.rect, el.front), W = F.W, n = el.n ?? Math.max(1, Math.round(W / 5.6)), sw = W / n, H = new Halo();
    const shopOf = (mx, mz) => Math.max(0, Math.min(n - 1, Math.floor(((mx - F.o[0]) * F.U[0] + (mz - F.o[1]) * F.U[1]) / sw)));
    const litAt = (i) => { const q = F.pt(i * sw + sw / 2, 0); return hashAt(q[0], q[1], 3) < 0.72; };
    const wctx = watching(ctx, new Set(['lamp_paper']), (mat, b) => {
      const mx = (b[0] + b[3]) / 2, my = (b[1] + b[4]) / 2, mz = (b[2] + b[5]) / 2;
      if (b[3] - b[0] > 0.5 || !litAt(shopOf(mx, mz))) return;
      H.ball(mx, my, mz, 0.5, 0.6);
    });
    depth++;
    try { var r = fn.call(this, el, wctx); } finally { depth--; }
    for (let i = 0; i < n; i++) {
      if (!litAt(i)) continue;
      const g = i * sw + sw * (i % 2 ? 0.34 : 0.66), a = F.pt(g - 0.62, 0.22), b = F.pt(g + 0.62, 0.22), q = F.pt(g, -1.5);
      // the warm sheet across the shop's open doorway and its pool on the street
      H.quad([a[0], 0.25, a[1]], [b[0], 0.25, b[1]], [b[0], 2.6, b[1]], [a[0], 2.6, a[1]], [-F.V[0], -F.V[1]], 0.38 + 0.2 * hashAt(q[0], q[1], 9));
      H.floor(q[0], 0.06, q[1], 2.2, 1.8, 8, 0.55);
    }
    H.flush(ctx.bag);
    return r;
  };
}

// ── the street furniture ───────────────────────────────────────────────────────
/** The stone lamp (lu_lamp: the paper box on its stone post at 2.28–2.78 m): the candle's glow and a pool on the street. */
function lampWrap(fn) {
  return function lamp(el, ctx) {
    const r = fn.call(this, el, ctx);
    if (depth > 0 || !ctx?.lights || el.simple) return r;
    const [x, z] = el.at, H = new Halo();
    H.ball(x, 2.53, z, 0.62, 0.66); H.floor(x, 0.05, z, 2.6, 2.6, 10, 0.55);
    H.flush(ctx.bag);
    return r;
  };
}
/** The hawker's stall (lu_stall): a paper lantern on the umbrella's pole (at 2.3 m, 0.56 m behind the table), in half the stalls (the noodle and bun sellers sold into the evening). */
function stallWrap(fn) {
  return function stall(el, ctx) {
    const r = fn.call(this, el, ctx);
    if (depth > 0 || !ctx?.lights || el.simple) return r;
    const [x, z] = el.at;
    if (hashAt(x, z, 5) >= 0.55) return r;
    const rot = Math.round((el.rot ?? 0) / (Math.PI / 2)) * (Math.PI / 2), c = Math.cos(rot), s = Math.sin(rot), H = new Halo();
    const px = x - 0.56 * s, pz = z - 0.56 * c, fx = x + 0.2 * s, fz = z + 0.2 * c;
    H.ball(px, 2.3, pz, 0.5, 0.58); H.floor(fx, 0.05, fz, 1.9, 1.9, 8, 0.5);
    H.flush(ctx.bag);
    return r;
  };
}
/** Any element that adds lights to the plan (the halls' lamps and candles: lu_inside, lu_dacheng): the halo of each. */
function lightsWrap(fn) {
  return function lamps(el, ctx) {
    const lights = ctx?.lights, n = lights ? lights.length : 0;
    if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
    depth++;
    try { var r = fn.call(this, el, ctx); } finally { depth--; }
    const H = new Halo(), floor = el.y ?? 0;
    for (const l of lights.slice(n)) lightHalo(H, l, floor);
    H.flush(ctx.bag);
    return r;
  };
}

// ── the new lights ──────────────────────────────────────────────────────────────

/**
 * lu_cresset: { at: [x, z], y? } — the iron fire basket of the guards at a gate, on a stand: a broad foot, a post, a bowl of iron bars with the logs in it, the glow and its pool on the
 * ground. Heights and widths vary by the hash of the place. [inferred: the watch fires of the gates; the temple's and the Duke's gates were guarded, §7]
 */
function cresset({ at, y = 0 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = 0.94 + 0.12 * q, w = 0.92 + 0.16 * hashAt(x, z, 6);
  bag.add('iron', lathe([[0.001, 0], [0.26 * w, 0], [0.26 * w, 0.07], [0.07, 0.12], [0.05, 0.95 * s], [0.09, 1.0 * s], [0.14, 1.04 * s]], 8, null, x, y, z));
  bag.add('iron', lathe([[0.15, 1.02 * s], [0.3 * w, 1.22 * s], [0.34 * w, 1.36 * s], [0.3 * w, 1.37 * s], [0.26 * w, 1.24 * s], [0.12, 1.1 * s], [0.001, 1.08 * s]], 9, null, x, y, z));
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + q * 2, c = Math.cos(a), sn = Math.sin(a); bag.add('wood_dark', box(x + c * 0.1 - 0.05, y + 1.1 * s, z + sn * 0.1 - 0.05, x + c * 0.1 + 0.05, y + 1.42 * s, z + sn * 0.1 + 0.05)); }
  col.circle(x, z, 0.3, y, y + 1.4 * s);
  const l = { at: [x, y + 1.9 * s, z], color: '#ff9440', intensity: 4.2, distance: 12 };
  lights?.push(l);
  lightHalo(H, l, y);
  H.flush(bag);
}

let done = false;
/** Wraps the Qufu style's elements that make light (once, after the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.lu?.elements;
  if (!E) return;
  if (E.lu_house) E.lu_house = houseWrap(E.lu_house);
  if (E.lu_shop_row) E.lu_shop_row = shopWrap(E.lu_shop_row);
  if (E.lu_lamp) E.lu_lamp = lampWrap(E.lu_lamp);
  if (E.lu_stall) E.lu_stall = stallWrap(E.lu_stall);
  for (const k of ['lu_inside', 'lu_dacheng']) if (E[k]) E[k] = lightsWrap(E[k]);
  E.lu_cresset = cresset;
}
registerNight();
