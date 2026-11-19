// Ottoman Istanbul about 1560 by night (docs/settlements/ottoman-istanbul.md §20). What lit the place then — the oil lamps of the mosque, the lamps
// at the gates of its court, a candle or a lamp behind the lattice of a room, the lamp by a house's door, the coffee house's — is made as the
// Suzhou reference makes it: geometry in the engine's one additive `halo` material (palette.js, materials.js 'halo': light added over what lies
// behind it at night only, no light, no shadow, no collision; invisible by day), so that the lamps and the lit rooms read at the low preset,
// where the pool of real lamps is off. The shape of each piece is carried by its normals: a glow round each flame (three crossed discs), a pool
// on the lane or the floor, a wash on the wall behind, a pane in front of a window's opening.
// The Halo class and the slab finder are the pattern of src/settlements/ming-suzhou/nightlight.js, copied (that file reads Suzhou's layout).
// Everything is a function of the thing's own place (hash), no counters, no Math.random.

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
/** The light of one lamp into H: the glow at (x, cy, z), and (outdoors) the pool on the ground gy below and the wash on a wall behind it. */
export function lampLight(H, x, z, cy, gy, s, pool = 0, wall = null) {
  H.ball(x, cy, z, 0.95 * s);
  if (pool) H.floor(x, gy + 0.03, z, pool * s);
  if (wall) H.wall(x - wall.n[0] * wall.d, cy, z - wall.n[1] * wall.d, wall.n, 1.9 * s, 1.5 * s);
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
const FACE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const WINDOW_MATS = new Set(['opening', 'daylight']);

/**
 * Wrap a builder context so that what it makes glows at night: each window slab (of `opening`, and the `daylight` pane inside it) whose room (a cell of
 * the settlement by hash, 4 m × 3 m storeys) is one of the lit `share` of them gets a pane of lamp-light on each face at strength `k`; each small
 * `lamp_glass` (a lamp, its flame inside) gets its glow, and, if `outdoor` (the lamp by a door, on a post: `pool` m of light on the ground below it), a pool.
 * Returns { ctx, finish }; call finish() once the element is built. `keep: false` makes the real geometry vanish (the night plan builds nothing but light).
 */
export function lit(ctx, { share = 0.3, k = 0.8, outdoor = 0, pool = 2.4, drop = 2.55, front = null, keep = true, lamps = true, windows = true } = {}) {
  const H = new Halo(), real = ctx.bag;
  const room = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const add = (mat, g, ...rest) => {
    if (typeof mat === 'string' && g?.attributes?.position) {
      if (windows && WINDOW_MATS.has(mat)) { for (const b of slabsOf(g)) if (room(b)) panesOf(H, b, 0.004, k); }
      else if (lamps && mat === 'lamp_glass') {
        const b = bbox(g), w = Math.max(b.x1 - b.x0, b.z1 - b.z0);
        if (w < 0.8 && b.y1 - b.y0 < 0.9) {
          const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, cy = (b.y0 + b.y1) / 2;
          if (hashAt(cx, cz, 31) < (outdoor ? 0.75 : 1)) lampLight(H, cx, cz, cy, cy - (outdoor ? drop : 0), 0.8 + 0.3 * hashAt(cx, cz, 32), outdoor ? pool : 0, front ? { n: front, d: 0.25 } : null);
        }
      }
    }
    return keep ? real.add(mat, g, ...rest) : undefined;
  };
  const bag = new Proxy(real, {
    get(t, key) {
      if (key === 'add') return add;
      if (!keep && key === 'addInstance') return () => {};
      const v = t[key];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real) };
}
/** Wrap a style's element so that it glows at night: STYLES[style].elements[name]; `o` are lit()'s options (or a function of the element giving them). */
function wrapElement(style, name, o) {
  const S = STYLES[style];
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => { if (el.simple) return base(el, ctx); const L = lit(ctx, typeof o === 'function' ? o(el) : o); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}
const NOP = { rect() {}, floor() {}, ramp() {}, circle() {}, segment() {} };
/**
 * night_houses: { list } — the houses of one tile, built into a context that keeps only the light, all of it into one geometry (a single mesh, and
 * no copies of a shape for the engine to instance): the lit windows of their rooms (a share of them: a candle or a lamp behind the lattice), the
 * lamp by each door with its pool on the lane. Used by near plans of their own (town.js), so that it costs nothing in the first view.
 */
function nightHouses(el, { bag }) {
  const build = STYLES.ottoman.elements.ottoman_house, parts = [];
  const sink = { add: (mat, g) => { if (mat === MAT) parts.push(g); }, addInstance() {} };
  for (const h of el.list) {
    const L = lit({ bag: sink, col: NOP, lights: [] }, { share: 0.3, k: 0.6, outdoor: 1, pool: 2.2, front: FACE[h.front], keep: false });
    build({ ...h }, { ...L.ctx, col: NOP, lights: [] });
    L.finish();
  }
  const pos = [], nor = [];
  for (const g of parts) { pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); }
  if (!pos.length) return;
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  bag.add(MAT, g);
}
let DONE = false;
/** Register the lit forms: the landmark's windows and lamps, the coffee house, and the night plan's element. Called once by the settlement's index. */
export function registerNight() {
  if (DONE || !STYLES.ottoman) return;
  DONE = true;
  for (const [name, o] of [
    ['sinan_mosque', { share: 1, k: 0.85 }],          // the hall lit by hundreds of lamps: every window of it glows, and the ring of 64 glass lamps
    ['turbe', { share: 1, k: 0.5 }],                  // the lamp by Hürrem's cenotaph
    ['kulliye_medrese', { share: 0.3, k: 0.55 }],     // a cell here and there: a student at his book
    ['darussifa', { share: 0.4, k: 0.55 }],           // the hospital kept its lamps
    ['imaret', { share: 0.5, k: 0.7 }],               // the kitchens and the bakery work in the night
    ['hamam', { share: 0.25, k: 0.5 }],
    ['darulhadis', { share: 0.3, k: 0.55 }],
    ['mescit', { share: 1, k: 0.6 }],
    ['court_dress', { windows: false, outdoor: 1, pool: 3.2, drop: 3.8 }],     // the iron lamp posts at the court's gates
    ['kahvehane', { share: 1, k: 0.75, outdoor: 0 }],               // the coffee house open into the evening, its hanging lamp
  ]) wrapElement('ottoman', name, o);
  const S = STYLES.ottoman;
  S.elements.night_houses = nightHouses;
}
