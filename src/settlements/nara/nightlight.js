// Nara in 752 by night (docs/settlements/nara.md §19.2): what lit the capital, and the light it throws.
// A lamp of the time is a dish of plant oil with a rush-pith wick; at the temple there are iron fire baskets in the courts,
// torches at the gates, the lamps of the altar and the lantern of bronze. The houses' lamps show through their lattice windows.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night
// only, no light, no shadow, no collision: so the day view is unchanged, and the real-light pool (off at the low preset) is not needed.
// The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed
// discs), a pool on the ground or the floor under it, and a sheet before a lattice window.
// Each light is a function of its own place (hashAt): no counters, no Math.random.
// The method is that of the Suzhou reference (the same material), written here for the lamps of Nara; nothing of Suzhou's is imported.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

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
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0]);
  }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit lattice) of brightness f, facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

// ── the fire basket (kagaribi): an iron basket on a tripod, pine billets in it ─────────────────────
/** A basket of iron straps on three legs, pine billets in it, the glow and its pool on the ground. Cold by day; the fire is the halo, at night only. { at, y } */
export function kagaribi(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = new Halo();
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.5, c = Math.cos(a), s = Math.sin(a); bag.add('iron', rod([x + c * 0.5, y, z + s * 0.5], [x + c * 0.22, y + 0.95, z + s * 0.22], 0.025, 5)); }
  bag.add('iron', lathe([[0.001, 0], [0.14, 0], [0.3, 0.2], [0.34, 0.34], [0.32, 0.36], [0.28, 0.34], [0.12, 0.05], [0.001, 0.05]], 8, null, x, y + 0.93, z));
  for (let k = 0; k < 4; k++) bag.add('iron', rod([x + Math.cos(k * 1.57) * 0.16, y + 0.98, z + Math.sin(k * 1.57) * 0.16], [x + Math.cos(k * 1.57) * 0.33, y + 1.27, z + Math.sin(k * 1.57) * 0.33], 0.014, 4));
  for (let k = 0; k < 5; k++) { const a = k * 1.26 + 0.3, c = Math.cos(a), s = Math.sin(a); bag.add('wood_dark', rod([x + c * 0.15, y + 1.04, z + s * 0.15], [x - c * 0.05 + s * 0.05, y + 1.4 + (k % 2) * 0.06, z - s * 0.05 - c * 0.05], 0.045, 5)); }
  bag.add('iron', box(x - 0.2, y + 1.0, z - 0.2, x + 0.2, y + 1.07, z + 0.2));
  H.ball(x, y + 1.5, z, 1.3, 0.7); H.floor(x, y + 0.04, z, 3.6, 3.6, 0, 10, 0.85);
  H.flush(bag);
  col.rect([x - 0.45, z - 0.45, x + 0.45, z + 0.45], y, y + 1.4);
}

// ── the lamp stand (tōmyō): a post with a dish of oil and a little wooden shade ───────────────────
/** A wooden post 1.5 m high carrying a dish of oil with its wick and a four-post shade of slats; the glow and its pool. { at, y, h } */
export function tomyo(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.5, H = new Halo();
  bag.add('wood_dark', box(x - 0.06, y, z - 0.06, x + 0.06, y + h, z + 0.06));
  bag.add('wood_dark', box(x - 0.2, y, z - 0.2, x + 0.2, y + 0.07, z + 0.2));
  bag.add('bronze', lathe([[0.001, 0], [0.1, 0.01], [0.14, 0.05], [0.12, 0.055], [0.001, 0.03]], 10, null, x, y + h, z));
  bag.add('flame', lathe([[0.001, 0.04], [0.015, 0.07], [0.01, 0.12], [0.001, 0.16]], 6, null, x, y + h, z));
  for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) bag.add('wood_dark', box(x + dx * 0.15 - 0.012, y + h + 0.0, z + dz * 0.15 - 0.012, x + dx * 0.15 + 0.012, y + h + 0.3, z + dz * 0.15 + 0.012));
  bag.add('wood_dark', box(x - 0.2, y + h + 0.3, z - 0.2, x + 0.2, y + h + 0.33, z + 0.2));
  H.ball(x, y + h + 0.1, z, 0.75, 0.62); H.floor(x, y + 0.04, z, 2.2, 2.2, 0, 8, 0.6);
  H.flush(bag);
  col.rect([x - 0.2, z - 0.2, x + 0.2, z + 0.2], y, y + h + 0.33);
}

// ── the torch post (taimatsu): a bundle of pine splints on a pole ─────────────────────────────────
/** A pole 2.1 m high with a bundle of resinous pine splints bound at the top, burning; the glow and its pool. { at, y } */
export function taimatsu(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = new Halo(), h = 2.1;
  bag.add('wood_dark', rod([x, y, z], [x, y + h, z], 0.045, 5));
  bag.add('iron', box(x - 0.12, y, z - 0.12, x + 0.12, y + 0.06, z + 0.12));
  for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.2, c = Math.cos(a), s = Math.sin(a); bag.add('log_pine', rod([x + c * 0.05, y + h - 0.2, z + s * 0.05], [x + c * 0.1, y + h + 0.42 + (k % 2) * 0.08, z + s * 0.1], 0.025, 4)); }
  bag.add('iron', box(x - 0.07, y + h - 0.02, z - 0.07, x + 0.07, y + h + 0.05, z + 0.07));
  H.ball(x, y + h + 0.5, z, 1.1, 0.66); H.floor(x, y + 0.04, z, 3.0, 3.0, 0, 8, 0.7);
  H.flush(bag);
  col.rect([x - 0.15, z - 0.15, x + 0.15, z + 0.15], y, y + h);
}

// ── the lit rooms and windows of what a builder makes ────────────────────────────────────────────
const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};
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
    out.push(b);
  }
  return out;
}
/** The lit panes for one slab: a sheet a hair off each face (the leaf less a frame's width), each room its own strength by the hash of its place (oil is dear: 0.4 to 0.8). */
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = 0.4 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}
const WINDOW = { koshi: 0.11 };
const LAMP = new Set(['lamp_paper', 'lamp_white']);
const LIT = Symbol('lit');
/**
 * One lamp (the bounds of its shade) or flame into H: `base` the ground of the element. A lamp hung under an eave (1.9 to 3.1 m up) lights the
 * ground below it; a lamp or flame in a room or on the ground: its glow and the pool on what it stands on.
 */
function lampLight(H, b, base, flame) {
  const cx = (b[0] + b[3]) / 2, cz = (b[2] + b[5]) / 2, cy = (b[1] + b[4]) / 2, h = cy - base;
  if (!flame && h > 1.9 && h < 3.1) { H.ball(cx, cy, cz, 0.85); H.floor(cx, base + 0.04, cz, 1.9, 1.9, 0, 8, 0.7); return; }
  H.ball(cx, cy, cz, flame ? 0.8 : 0.9, 0.6);
  if (h < 1.9) H.floor(cx, b[1] - (flame ? 0.1 : 0.2) + 0.03, cz, 1.9, 1.9, 0, 8, 0.5);
}
/**
 * Wrap a builder context so that what it makes glows at night: each leaf of lattice (koshi) gets a pane of lamp-light on each face if its room (a
 * cell of the town by hash: 8 m squares, by storey) is one of those lit, `share` of them; each lamp and flame (a glow shade, or `flame`) gets its glow.
 * Returns { ctx, H, finish }: call finish() once the element is built.
 */
function litWindows(ctx, share, base = 0) {
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (typeof mat === 'string' && g?.attributes?.position) {
          const off = WINDOW[mat];
          if (off !== undefined) { for (const b of slabsOf(g, 0.2)) if (lit(b)) panesOf(H, b, off); }
          else if (LAMP.has(mat)) lampLight(H, bounds(g), base, false);
          else if (mat === 'flame') lampLight(H, bounds(g), base, true);
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H, finish: () => H.flush(real) };
}

/** The house: lit lattice windows (the service quarter's more than the ordinary houses'), its lamps and flames, and, in an open house, the sunken hearth's glow and its pool on the street before the door. */
function litHouse(base) {
  const f = (el, ctx) => {
    const L = litWindows(ctx, el.use ? 0.6 : 0.25, el.y ?? 0);
    base(el, L.ctx);
    if (el.open && !el.use && !el.simple) {
      const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, fr = el.front || 's', Lw = x1 - x0, D = z1 - z0, nb = Math.max(2, Math.floor(Lw / 3.2)), du = (Math.floor(nb / 2) + 0.5) * Lw / nb;
      const P = (u, v) => (fr === 's' ? [x1 - u, z1 - v] : [x0 + u, z0 + v]), hv = (0.3 + 1.2 + D - 0.3) / 2, hp = P(Lw / 2, hv), dp = P(du, -1.5);
      L.H.ball(hp[0], y + 1.25, hp[1], 1.1, 0.55); L.H.floor(hp[0], y + 0.9, hp[1], 1.9, 1.5, 0, 8, 0.55);
      L.H.floor(dp[0], y + 0.07, dp[1], 1.9, 1.9, 0, 8, 0.35);
    }
    L.finish();
  };
  f.__lit = true;
  return f;
}
/** The altar's two lamps (their flames at the ends of the altar) and the glow of the altar between them on the dais. */
function litAltar(base) {
  const f = (el, ctx) => {
    base(el, ctx);
    const [x, z] = el.at, y = el.y, w = el.w ?? 6.0, H = new Halo();
    for (const s of [-1, 1]) { const lx = x + s * w * 0.43; H.ball(lx, y + 0.75, z, 1.1, 0.62); }
    H.floor(x, y + 0.03, z, w * 0.55, 1.3, 0, 10, 0.4);
    H.flush(ctx.bag);
  };
  f.__lit = true;
  return f;
}
/** The octagonal lantern's lamp: the glow in the fire box (at its middle, 2.95 m above its base) and the pool it throws before the hall. */
function litToro(base) {
  const f = (el, ctx) => {
    base(el, ctx);
    if (el.fig === 'only') return;
    const [x, z] = el.at, y = el.y ?? 0, H = new Halo();
    H.ball(x, y + 2.95, z, 1.5, 0.7); H.floor(x, y + 0.34, z, 4.5, 4.5, 0, 10, 0.5);
    H.flush(ctx.bag);
  };
  f.__lit = true;
  return f;
}

/** Register the lamps of Nara: the fire basket, the lamp stand and the torch post as elements; the lit houses, the altar lamps and the lantern as wrappers of the builders that make them. */
export function registerNight() {
  const S = STYLES.nara;
  if (!S) return;
  S.elements.kagaribi = kagaribi; S.elements.tomyo = tomyo; S.elements.taimatsu = taimatsu;
  const wrap = (tbl, name, make) => { const base = tbl?.[name]; if (base && !base.__lit) tbl[name] = make(base); };
  wrap(S.elements, 'nara_house', litHouse);
  wrap(S.elements, 'nara_altar_set', litAltar);
  wrap(S.objects, 'hakkaku_toro', litToro);
}
registerNight();
