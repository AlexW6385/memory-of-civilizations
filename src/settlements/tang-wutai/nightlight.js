// Mount Wutai by night, 857 — what lit the monastery and the village, and the light it throws (docs/settlements/tang-wutai.md §20).
// Lit: the oil lamps on their bronze stands before the three Buddhas and the Manjusri hall's altar (they burn all night), the lamps of the monks'
// rooms behind their paper windows, the stone lamp pillars of the three levels (a wick in oil in the box under the little roof), the red paper lanterns
// of the gate and of the lane's trades, the forge's coals and the hearths, the embers of the incense burners, and in the village the lamp and the stove
// of the few houses still awake behind lattice windows covered with paper; the open houses and trades keep a lamp lit for the visitor. No electric
// light, nothing from a later age: a lamp is a wick in vegetable oil, the fires are wood and charcoal [inferred: the common picture of a Tang
// monastery and a north Shanxi village; no source describes 857 Wutai's nights].
// All of it is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light,
// no shadow and no collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed: a glow round each flame
// (three crossed discs), a pool on the floor or the ground, a pane of lamp-light before a lit window, the spill of a lit doorway across the step. Each
// light is a function of its own place (a hash): no counters, no Math.random. The method is that of the Suzhou reference and of Shaolin; nothing of
// theirs is imported.

import './style.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/chinese/village.js';
import { HALL, height } from './layout.js';
import { CENSERS } from './monastery.js';

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

// ── the lit windows: the leaves of lattice over paper ────────────────────────────────────────────────────
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
/** Wrap a builder context so that the windows it makes glow: each lattice leaf gets a pane of lamp-light on each face when `lit(b)` says so. Returns { ctx, H, finish }. */
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

// ── the village's houses: the open ones keep a lamp for the visitor, a few of the others are awake ───────────
/** The share of the closed houses with a lamp still burning behind the paper. */
const AWAKE = 0.18;
let depth = 0;
/** Wrap a house builder: the lit windows and the lit doorway of an open house or dwelling, or of one of the awake. */
const wrapHouse = (fn, dwelling) => function lit(el, ctx) {
  if (depth > 0 || !ctx?.bag || !el.rect || el.bare) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const awake = dwelling || el.open || hashAt(cx, cz, 3) < AWAKE;
  if (!awake) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const L = litWindows(ctx, (b) => hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 41) < 0.85, 0.9);
  depth++;
  let r;
  try { r = fn.call(this, el, L.ctx); } finally { depth--; }
  // the lit doorway: lamp-light spilling over the step into the yard (each pool its own size and number of sides by the hash of its place)
  const F = frame(el.rect, el.front), [px, pz] = F.P(F.L / 2, -1.1), gy = height(px, pz);
  L.H.floor(px, gy + 0.04, pz, 1.6 + 0.6 * hashAt(px, pz, 5), 1.2 + 0.4 * hashAt(px, pz, 6), 7 + Math.floor(hashAt(px, pz, 8) * 5), 0.55 + 0.2 * hashAt(px, pz, 7));
  L.finish();
  return r;
};

let done = false;
/** Wraps the wutai-site style's houses (once, after the style has registered). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES['wutai-site'].elements;
  E.wutai_house = wrapHouse(E.wutai_house, false);
  E.wutai_dwelling = wrapHouse(E.wutai_dwelling, true);
  E.wutai_halo = haloElement;
}

// ── the lights that are data: lamps, lanterns, stone lamps, fires ────────────────────────────────────────────
/** One light: { k: kind, at: [x, z], y, d (reach), ... } → halo pieces. */
function lightHalo(H, l) {
  const [x, z] = l.at, y = l.y, g = height(x, z);
  switch (l.k) {
    case 'lamp': {                                   // an oil lamp (a bronze stand, or a dish on a table, a kang or a counter)
      const d = l.d ?? 6, k = Math.min(1, (l.i ?? 2) / 2.4), top = y + (l.h ?? 0.3) + 0.06;
      H.ball(x + 0.07, top, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k), 0.62, 6 + Math.floor(hashAt(x, z, 11) * 4));
      if (y - l.floor < 0.1) { const r = Math.max(1.3, Math.min(3.4, d * 0.42)); H.floor(x, y + 0.03, z, r, r, 8 + Math.floor(hashAt(x, z, 12) * 5), 0.8); }
      break;
    }
    case 'hang': {                                   // a paper lantern hung from an eave (the lantern's middle 0.63 under its hook)
      const cy = l.y - 0.63;
      H.ball(x, cy, z, 0.8, 0.62, 6 + Math.floor(hashAt(x, z, 13) * 4));
      H.floor(x, l.floor + 0.03, z, 1.6 + 0.5 * hashAt(x, z, 14), 1.6 + 0.5 * hashAt(x, z, 15), 8 + Math.floor(hashAt(x, z, 16) * 4), 0.7);
      break;
    }
    case 'post': {                                   // a paper lantern on its post (h tall)
      H.ball(x, y + (l.h ?? 2.2) - 0.1, z, 0.85, 0.62, 6 + Math.floor(hashAt(x, z, 17) * 4));
      H.floor(x, g + 0.03, z, 1.9 + 0.5 * hashAt(x, z, 18), 1.9 + 0.5 * hashAt(x, z, 19), 8 + Math.floor(hashAt(x, z, 20) * 4), 0.7);
      break;
    }
    case 'stone': {                                  // a stone lamp pillar: the wick's box at 1.9 over its base
      H.ball(x, y + 1.9, z, 0.62, 0.62, 6 + Math.floor(hashAt(x, z, 21) * 4));
      H.floor(x, y + 0.04, z, 1.5, 1.5, 7 + Math.floor(hashAt(x, z, 22) * 5), 0.6);
      break;
    }
    case 'ember': {                                  // the embers of an incense burner: a small red glow
      H.ball(x, y, z, 0.32, 0.4, 6);
      break;
    }
    case 'pane': {                                   // a paper window lit from behind: a sheet in the wall's plane, facing n
      const [nx, nz] = l.n, hw = l.w / 2, a = nx === 0 ? [1, 0] : [0, 1], f = 0.5 + 0.3 * hashAt(x, z, 24), off = 0.04;
      const px = x + nx * off, pz = z + nz * off;
      H.quad([px - a[0] * hw, y, pz - a[1] * hw], [px + a[0] * hw, y, pz + a[1] * hw], [px + a[0] * hw, y + l.h, pz + a[1] * hw], [px - a[0] * hw, y + l.h, pz - a[1] * hw], l.n, f);
      break;
    }
    case 'spill': {                                  // lamp-light from the hall's open doors lying over the platform
      H.floor(x, y + 0.04, z, l.r, l.r * 0.8, 9, 0.5);
      break;
    }
    default:
  }
}
/** wutai_halo { lights: [...] }: the lights of a part of the settlement as halo geometry (one element in a plan of its own, not a house: no `rect`). */
function haloElement({ lights }, { bag }) {
  const H = new Halo();
  for (const l of lights) lightHalo(H, l);
  H.flush(bag);
}

/**
 * The lights from the settlement's plans: lamps (`tang_lamp`) of every plan, the paper lanterns of the trades and the gate, the stone lamp pillars, the
 * censers' embers, the paper windows of the monks' rooms. `plans` = { hall, sengfang, monastery, village, dress }.
 */
export function lightsOf({ hall, sengfang, monastery, village, dress }) {
  const out = [], [ox, oz] = HALL.origin;
  const lamp = (e, dx = 0, dz = 0, dy = 0) => { const x = e.at[0] + dx, z = e.at[1] + dz, y = e.y + dy; out.push({ k: 'lamp', at: [x, z], y, h: e.h ?? 1.3, i: e.intensity ?? 2.2, d: e.distance ?? 7, floor: height(x, z) }); };
  for (const e of hall.elements) if (e.t === 'tang_lamp') lamp({ ...e, y: (e.y ?? 0) + (hall.base || 0) }, ox, oz);
  for (const p of [sengfang, monastery]) for (const e of p.elements) if (e.t === 'tang_lamp') lamp(e);
  for (const e of village.chinese) if (e.t === 'tang_lamp') lamp(e);
  for (const e of [...village.life, ...dress.life]) {
    if (e.t === 'hang_lantern' && e.kind === 'paper') out.push({ k: 'hang', at: e.at, y: e.y, floor: height(...e.at) + 0.34 });
    else if (e.t === 'lantern' && e.kind === 'paper') out.push({ k: 'post', at: e.at, y: e.y ?? 0, h: e.h ?? 2.2 });
  }
  for (const e of dress.chinese) if (e.t === 'wutai_lamp' && hashAt(e.at[0], e.at[1], 9) < 0.85) out.push({ k: 'stone', at: e.at, y: e.y });
  for (const [x, z, y] of CENSERS) out.push({ k: 'ember', at: [x, z], y: y + 0.35 + 1.0 });
  // the barred paper windows of the monks' rooms (plan.js quarters: seven bays of 3.9 m from x0 = −103, windows in the even bays, the front wall at z = ±35.5,
  // facing the courtyard's axis); the rooms hold bays 0–1, 2–3, 4–5, and the lamp of each burns behind the window of its first bay
  for (const s of [-1, 1]) for (const k of [0, 2, 4]) out.push({ k: 'pane', at: [ox - 103 + (k + 0.5) * 3.9, s * 35.5 - s * 0.22], y: 0.45 + 1.1, h: 1.1, w: 1.8, n: [0, -s] });
  // the Great East Hall's five open doors (hall plan x −8.83, the bays' middles between the column lines ZS), floor 14.0: the lamps within spill out over the platform
  for (const z of [-10.08, -5.04, 0, 5.04, 10.08]) out.push({ k: 'spill', at: [ox - 8.83 - 1.9, oz + z], y: 14.0, r: 3.0 });
  return out;
}

/** The plan of the settlement's night lights (a plan of its own: halo geometry only). */
export function nightPlan(parts) {
  const L = lightsOf(parts), N = 60, els = [];
  for (let i = 0; i < L.length; i += N) els.push({ t: 'wutai_halo', lights: L.slice(i, i + N) });
  return { id: 'tang-wutai-night', style: 'wutai-site', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: els, rooms: [], bounds: [-250, -250, 250, 250], entrance: { at: [-80, 0], facing: 'e' }, nocollide: true };
}
registerNight();
