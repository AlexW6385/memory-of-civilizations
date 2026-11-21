// Shaolin by night, c. 1600 — what lit the monastery and the village, and the light it throws (docs/settlements/shaolin.md §11.2).
// Lit: the ever-burning oil lamps (changming deng) and the candles before the Buddhas in the halls, the lamps of the Abbot's hall, the Dharma hall and the cells,
// the range of the kitchen, the stone lamps of the courts (a wick in oil, in the four-sided box under the little roof), the paper lanterns at the eaves and at the
// gate, and in the village the lamp and the stove of the few houses still awake behind lattice windows covered with paper (a shop that serves the pilgrims,
// a home at supper). Nothing electric, no neon: a lamp is a wick in vegetable oil [inferred: the common picture of Ming China; nothing here is from a fetched page].
// All of it is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no
// collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. A glow round each flame (three crossed discs),
// a pool on the floor or the paving, a pane of lamp-light before a lit window, and the spill of a lit doorway across the step. Each light is a function of its own
// place (a hash): no counters, no Math.random. The method is that of the Suzhou reference and of Knossos; nothing of theirs is imported.

import '../../styles/shaolin/index.js';
import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { assembly } from '../../objects/kit.js';
import { frontOf } from './walk.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
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
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]. */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62, segs = 8) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], segs, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit window) of brightness f, facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor or ground under it, if known. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  // (the number of sides varies with the lamp's own place: the lamps of twelve rooms alike would be scaled copies of one shape, an instanced draw of their own)
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k), 0.62, 6 + Math.floor(hashAt(x, z, 11) * 4));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) { const r = Math.max(1.3, Math.min(3.4, d * 0.42)); H.floor(x, floor + 0.03, z, r, r, 8 + Math.floor(hashAt(x, z, 12) * 5), 0.8); }
}

// ── the lit windows: the leaves of lattice over paper ───────────────────────────────────────────────────
/** The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab in a plane along x or z, at least 0.3 m wide and high. */
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
    out.push(b);
  }
  return out;
}
/** The lit panes for one slab: a sheet a hair off each of its two faces. */
function panesOf(H, b, off, strength) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = strength * (0.42 + 0.36 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5)));
  if (thinX) { const z0 = b.z0 + m, z1 = b.z1 - m; for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f); }
  else { const x0 = b.x0 + m, x1 = b.x1 - m; for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f); }
}
const LATTICE = (m) => typeof m === 'string' && m.startsWith('lattice');
/**
 * Wrap a builder context so that the windows it makes glow: each lattice leaf gets a pane of lamp-light on each face when `lit(b)` says so.
 * Returns { ctx, H, finish }.
 */
function litWindows(ctx, lit, strength) {
  const H = new Halo(), real = ctx.bag;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (LATTICE(mat) && g?.attributes?.position) for (const b of slabsOf(g, 0.2)) if (lit(b)) panesOf(H, b, 0.03, strength);
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H, finish: () => H.flush(real) };
}

// ── the wrapped elements ─────────────────────────────────────────────────────────────────────────────────
/** The share of the village's houses with a lamp still burning: shops serve the pilgrims late, homes sup and sleep. */
const AWAKE = { shop: 0.5, home: 0.22 };
let depth = 0;
/** Wrap one element builder: the halo of every light it adds, the lit windows and the lit doorway of a village house or a hall. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights;
  if (depth > 0 || !ctx || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const n = lights ? lights.length : 0, isHall = name === 'ming_hall' && el.rect, village = isHall && el.vk;
  const [x0, z0, x1, z1] = el.rect ?? [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  let L = null, awake = false;
  if (village) { awake = hashAt(cx, cz, 3) < (AWAKE[el.vk] ?? 0.2); if (awake) L = litWindows(ctx, (b) => hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 41) < 0.8, 0.9); }
  else if (isHall && el.H >= 5) L = litWindows(ctx, (b) => hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 43) < 0.62, 0.8);          // a main hall: the lamps before the Buddhas burn all night
  depth++;
  let r;
  try { r = fn.call(this, el, L ? L.ctx : ctx); } finally { depth--; }
  const H = L ? L.H : new Halo();
  if (lights) for (const l of lights.slice(n)) lightHalo(H, l, el.y ?? undefined);
  if (awake) {
    // the lit doorway: lamp-light spilling over the step into the street
    const F = frontOf({ rect: el.rect, front: el.front }), [px, pz] = F.P(0.5, 1.2);
    // (each pool its own size and number of sides by the hash of its place: twelve like shapes in a plan, scaled copies of one another, would be an instanced draw of their own)
    H.floor(px, (el.y ?? 0) + 0.04, pz, 1.7 + 0.7 * hashAt(px, pz, 5), 1.3 + 0.45 * hashAt(px, pz, 6), 7 + Math.floor(hashAt(px, pz, 8) * 5), 0.6 + 0.2 * hashAt(px, pz, 7));
  }
  if (name === 'shaolin_gear' && el.kind === 'lamp' && hashAt(el.at[0], el.at[1], 9) < 0.7) {
    // a stone lamp with its wick lit (the flame is at 1.7 of its height)
    const [x, z] = el.at, s = el.s ?? 1, y = el.y ?? 0;
    H.ball(x, y + 1.72 * s, z, 0.62 * s); H.floor(x, y + 0.04, z, 1.5 * s, 1.5 * s, 8, 0.6);
  }
  if (name === 'court_censer' && el.at) {
    // the bowl of a court's great censer holds a bed of embers under the sticks: a low red glow and a pool on the stone round it
    const [x, z] = el.at, s = el.s ?? 1, y = el.y ?? 0;
    H.ball(x, y + 1.85 * s, z, 0.5 * s, 0.5, 6 + Math.floor(hashAt(x, z, 14) * 4)); H.floor(x, y + 0.04, z, 1.9 * s, 1.9 * s, 8, 0.5);
  }
  if (name === 'shaolin_gear' && el.kind === 'wayshrine') {
    // the little lamp in the shrine's niche, and the sill's offerings lit by it
    const [x, z] = el.at, s = el.s ?? 1, y = el.y ?? 0, rot = el.rot ?? 0, ox = Math.sin(rot) * 0.6 * s, oz = Math.cos(rot) * 0.6 * s;
    H.ball(x + ox, y + 0.62 * s, z + oz, 0.5 * s, 0.55); H.floor(x + ox * 1.6, y + 0.04, z + oz * 1.6, 1.3 * s, 1.1 * s, 7, 0.5);
  }
  H.flush(ctx.bag);
  return r;
};

// ── the street's lanterns: one element of the street life per lantern ───────────────────────────────────
// { t: 'sl_halo', at, y (the ground), rot (+z out, the wall behind at −z), kind: 'hang' | 'post' }
const KINDS = {
  hang: { cy: 2.1, s: 0.9, wall: 0.2, pool: 2.3, gy: 0.1 },       // a paper lantern hung from an eave (objects: hang_lantern: hook 0.63 over the lantern's middle)
  hall: { cy: 2.1, s: 0.9, wall: 0.2, pool: 0, gy: 0.1 },        // the same under the high eaves of a hall (no pool: the floor is far below)
  post: { cy: 2.55, s: 1.0, wall: 0, pool: 3.0, gy: 0.03, z: 0.42 }, // a paper lantern on its post, h 2.6 (objects: lantern)
};
function unitOf(kind) {
  return assembly(`shaolin-halo|${kind}`, (a) => {
    const H = new Halo(), K = KINDS[kind];
    H.ball(0, K.cy, K.z ?? 0, 0.95 * K.s);
    if (K.pool) H.floor(0, K.gy + 0.03, K.z ?? 0, K.pool * 0.55, K.pool * 0.55, 8, 0.8);
    if (K.wall) H.wall(0, K.cy, -K.wall, [0, 1], 1.25 * K.s, 1.0 * K.s, 8, 0.6);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
const HALO_REACH = 60;
function slHalo(el, { bag }) {
  const U = unitOf(el.kind), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}
/** The halo element for a street element that carries a lantern (a list of street-life elements in; the elements to add out). */
export function streetHalo(e) {
  if (!e.at) return null;
  if (e.t === 'hang_lantern') return { t: 'sl_halo', kind: e.y > 3.6 ? 'hall' : 'hang', at: e.at, y: e.y - 2.73, rot: e.rot ?? 0 };
  if (e.t === 'lantern' && (e.kind === 'paper' || e.kind === 'white')) return { t: 'sl_halo', kind: 'post', at: e.at, y: e.y ?? 0, rot: e.rot ?? 0 };
  return null;
}

let done = false;
/** Wraps the shaolin style's elements that make light (once, after the style has registered) and adds the street life's halo element. */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.shaolin.elements;
  for (const k of ['ming_hall', 'shaolin_room', 'shaolin_interior', 'hall_furniture', 'shaolin_gear', 'court_censer']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  if (STYLES.life) STYLES.life.elements.sl_halo = slHalo;
}
registerNight();
