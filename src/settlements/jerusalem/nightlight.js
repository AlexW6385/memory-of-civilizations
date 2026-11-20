// Jerusalem about 700 by night (docs/settlements/jerusalem.md §12.2). What lit the city then: the clay and glass oil lamps in the shops of the
// Cardo and the market street and in the porticoes before them, the lamp burning in a niche of every house's main room, the glass lamps on
// their chains in the Dome of the Rock, the Aqsa and the Holy Sepulchre, the censers' coals, the candle stands at the Tomb, the furnace of the
// glass-lamp makers, the guards' braziers at the gates. All of it is made as the reference makes it (src/settlements/ming-suzhou/nightlight.js):
// geometry in the engine's one additive `halo` material (palette.js, materials.js 'halo': light added over what lies behind it at night only,
// no light, no shadow, no collision, invisible by day), so that the lamps and lit rooms read at the low preset, where the pool of real lamps
// is off. The shape of each piece is carried by its normals: a glow round each flame (three crossed discs), a pool on the paving or the floor,
// a pane of lamp-light in front of an opening.
// The Halo class and the slab finder are the pattern of src/settlements/isfahan/nightlight.js (copied: that file reads Isfahan's data). The
// builders of the shared `islamic` style already put a glass lamp (`lamp_glass`), a `flame` or a real light wherever a lamp burns; the
// wrapper below turns each into a glow, so that no builder of the shared style is changed: it is applied to copies of the styles registered
// from this folder (`jerusalem-lit`, `jerusalem-dome`, and the settlement's own `islamic-houses`).
// Everything is a function of the thing's own place (hash): no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, rod } from '../../core/geom.js';
import { HARAM, GATES, SEPULCHRE, SEP_Y, SEP_STAIR, height } from './layout.js';
import { stairWear, colonnadeWear } from './wear.js';

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
  /** A disc lying on a horizontal plane (the paving, a floor) at height y; k its strength. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) { const s = Math.sin(yaw), c = Math.cos(yaw); this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60°. */
  ball(x, y, z, r, k = 0.62) { for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); } }
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

// ── the lit windows: the thin upright slabs of the window material ───────────────────────────────────────
/** The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab at least 0.85 m wide and 0.8 m high (a shop-oven mouth is smaller). Each: { x0, y0, z0, x1, y1, z1 }. */
export function slabsOf(g, thick = 0.2) {
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
    if (th > thick || w < 0.85 || dy < 0.8 || th < 0.002) continue;
    if (dy > 2.6 || w > 2.4) continue;                // a doorway or a gate, not a window
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
/** Jerusalem's windows: the dark openings of the houses' walls (a room's window on its court, a slit to the lane) and the transom over a shop door. */
const WINDOW_MATS = new Set(['opening']);

/**
 * Wrap a builder context so that what it makes glows at night. Each glass lamp (`lamp_glass`) gets a glow (and, with `pool`, a pool on the floor under
 * it at floor height `floor`), each small `flame` (a censer's coals, a wick, a furnace) its glow, each real light the style hangs (`lights.push`) its
 * glow, and each opening that is a window (a room, a cell of the settlement by hash, 4 m x 3 m storeys, one in `share` lit) a pane of lamp-light on each
 * face at strength `k`. Returns { ctx, finish }; call finish() once the element is built.
 */
export function lit(ctx, { share = 0.3, k = 0.7, windows = true, lamps = true, flames = true, pool = false, floor = null, s = 1, rate = 1 } = {}) {
  const H = new Halo(), real = ctx.bag, rl = ctx.lights;
  const room = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const add = (mat, g, ...rest) => {
    if (typeof mat === 'string' && g?.attributes?.position) {
      if (windows && WINDOW_MATS.has(mat)) { for (const b of slabsOf(g)) if (room(b)) panesOf(H, b, 0.023, k); }
      else if (lamps && mat === 'lamp_glass') {
        const b = bbox(g), cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, cy = (b.y0 + b.y1) / 2;
        if (hashAt(cx, cz, 7) < rate) {
          const j = 0.9 + 0.2 * hashAt(cx, cz, 9);
          H.ball(cx, cy, cz, 0.62 * s * j);
          if (pool && floor !== null) H.floor(cx, floor, cz, 1.5 * s * j, 1.5 * s * j, 0, 8, 0.7);
        }
      } else if (flames && mat === 'flame') {
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
/** Wrap element `name` of style object `S` so that it glows at night: `o` are lit()'s options (a function of the element, when they depend on it). */
function wrapElement(S, name, o) {
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => { const L = lit(ctx, typeof o === 'function' ? o(el) : o); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}

// ── the guards' braziers ─────────────────────────────────────────────────────────────────────────────────
/**
 * jer_brazier: { at: [x, z], y } — an iron basket on three legs with a ring of staves, the embers heaped in it and a low flame, the glow of a guard's
 * fire (a watch fire at a gate, at the head of a stair, in a church's atrium). 1.0 m high, 0.7 m across; collision of its footprint.
 */
function brazier(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.5, lx = x + Math.cos(a) * 0.26, lz = z + Math.sin(a) * 0.26; bag.add('iron', rod([lx, y, lz], [x + Math.cos(a) * 0.14, y + 0.62, z + Math.sin(a) * 0.14], 0.022, 4)); }
  bag.add('iron', lathe([[0.001, 0], [0.16, 0], [0.3, 0.12], [0.33, 0.2], [0.31, 0.2], [0.001, 0.05]], 10, null, x, y + 0.62, z));
  bag.add('iron', lathe([[0.3, 0], [0.34, 0], [0.34, 0.025], [0.3, 0.025]], 10, null, x, y + 0.8, z));
  bag.add('terracotta', lathe([[0.001, 0], [0.28, 0], [0.18, 0.07], [0.001, 0.1]], 10, null, x, y + 0.72, z));
  bag.add('flame', lathe([[0.001, 0], [0.12, 0.01], [0.07, 0.17], [0.001, 0.3]], 7, null, x, y + 0.8, z));
  bag.add('flame', lathe([[0.001, 0], [0.09, 0.01], [0.001, 0.2]], 7, null, x + 0.13, y + 0.78, z - 0.08));
  col.circle(x, z, 0.38, y, y + 1.0);
}
/** The braziers of the watch: inside each city gate, at the head of the Haram's west stair, in the Holy Sepulchre's atrium before its doors [inferred]. */
export function braziers() {
  const E = [], at = (x, z, y = height(x, z)) => E.push({ t: 'jer_brazier', at: [x, z], y });
  for (const g of GATES) {
    const a = Math.atan2(g.at[1], g.at[0]), u = [-Math.sin(a), Math.cos(a)], inn = [-Math.cos(a), -Math.sin(a)], d = g.kind === 'triple' ? 8.4 : 6.2;
    for (const s of [-1, 1]) at(g.at[0] + inn[0] * 7.5 + u[0] * s * d, g.at[1] + inn[1] * 7.5 + u[1] * s * d);
  }
  for (const s of [-1, 1]) at(HARAM.rect[0] + 2.2, s * 7.4, HARAM.top);
  const zc = (SEPULCHRE[1] + SEPULCHRE[3]) / 2, xa = SEPULCHRE[2] - SEP_STAIR - 2.6;
  for (const dz of [-5, 5]) at(xa, zc + dz, SEP_Y);
  return E;
}

let DONE = false;
/** Register the lit forms: the styles that carry the lamps of the Cardo, the Haram and the Holy Sepulchre, the houses and the Dome. Called once by the settlement's index. */
export function registerNight() {
  if (DONE || !STYLES.islamic) return;
  DONE = true;
  // the shared styles stay as they are: copies, registered here, carry the lit elements
  const I = { ...STYLES.islamic, elements: { ...STYLES.islamic.elements } };
  I.elements.jer_brazier = brazier;
  for (const [name, o] of [
    ['colonnade', (el) => ({ share: 0.3, k: 0.55, rate: 0.85, s: 1.15 })],       // the shops' hanging lamps, the bracket lamps on the piers, the portico's lamps, the transoms over the doors
    ['lamp_chain', { windows: false }],                                                                  // the glass lamps on their chains in the Aqsa and the Holy Sepulchre
    ['censer', { windows: false, s: 0.8 }],                                                              // the coals
    ['jer_brazier', { windows: false, s: 1.5 }],                                                         // the guards' fires
    ['candelabrum', { windows: false }],                                                                 // the candle stands at the Tomb
    ['bracket_lamp', { windows: false, pool: true, floor: null }],
  ]) wrapElement(I, name, o);
  // the worn stone (wear.js): the stairs' middles and the porticoes' floors
  I.elements.jer_stair_wear = stairWear;
  I.elements.colonnade = colonnadeWear(I.elements.colonnade);
  registerStyle('jerusalem-lit', I);
  // the Dome of the Rock's own style (src/buildings/dome-of-the-rock/style.js): the crown of lamps, the lamps in the arcades, the censers, the cave's lamp
  const D = STYLES['islamic-dotr'];
  if (D) {
    const J = { ...D, elements: { ...D.elements } };
    for (const [name, o] of [['dotr_corona', { windows: false, s: 1.15 }], ['lamp_chain', { windows: false }], ['censer', { windows: false, s: 0.8 }], ['sakhra', { windows: false }], ['lamp', { windows: false }]]) wrapElement(J, name, o);
    registerStyle('jerusalem-dome', J);
  }
  // the houses: the lamp in the niche of the main room, the furnace, the lit windows
  const H = STYLES['islamic-houses'];
  if (H) wrapElement(H, 'levant_house', { share: 0.28, k: 0.5 });
}
