// Constantinople by night, the light of its lamps and fires (docs/settlements/constantinople.md §16.2).
// The flames of the plans' lights are small cones; what they lack, where the real lights are off (the low preset), is the light they give to what is
// round them. It is made of geometry in the one material `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only,
// with no light, no shadow and no collision; the shape of each piece is carried by its normals (a glow round a flame: three crossed discs; a pool of
// light on the floor; a pane of lamp-lit window). The same construction as Athens' and Suzhou's (their files are not imported). Everything here is
// a function of the light's own place: no counters, no Math.random.
//  - every element of the styles that puts a light into its plan (the shops' lamps, the houses' and chapel's, the bath's, the Baths' halls, the
//    procession's candles, the polykandela of Hagia Sophia) gains its halo, in Constantinople's plans only (the styles' tables are shared);
//  - the lamps hung in the porticoes of the Mese and the forecourt (`cn_lamps`), the light spilling from the church's south door (`cn_flame`);
//  - the windows of the houses of the lanes, a part of them lit from within (`cn_house` wrapped, its windows read as they are made);
//  - the forty windows of the dome's ring, lit from the lamps within.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import '../../styles/roman/town.js';
import { STYLES } from '../../core/build.js';
import { lathe, rod } from '../../core/geom.js';
import { MESE_STOAS } from './stoas.js';
import { height } from './layout.js';

const TAU = Math.PI * 2;
const MAT = 'halo';
const hashAt = (x, z, s = 0) => { let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc at c spanned by the unit axes U and V (semi-axes su, sv), in rings R of brightness F; the vertex normals carry the brightness in their y. */
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
  /** A disc lying on the floor at height y. */
  floor(x, y, z, r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, r, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees, each a cone of light from its middle. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit shutter or glass) of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
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

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }) over the ground `g` (the element's floor, if it has one). */
function lightHalo(H, l, g, scale = 1) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  const j = 0.88 + 0.24 * hashAt(x, z, 3);                         // (each light its own size: identical shapes would be gathered into an instanced draw of their own)
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k) * scale * j);
  const fy = Math.min(g ?? y - 0.5, y - 0.2);
  if (y - fy < 3.2) H.floor(x, fy + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)) * (2 - j), 10);
}

const MINE = /^(constantinople|cn-|hagia-sophia$)/;
const mine = (ctx) => MINE.test(ctx?.plan?.id ?? '');
let depth = 0;
/** An element's builder wrapped: what lights it pushes into the plan gain their halo (Constantinople's plans only; nested builders count once, in the outermost). */
const wrap = (fn, scale = 1) => function haloed(el, ctx) {
  const lights = mine(ctx) ? ctx.lights : null, n = lights ? lights.length : 0;
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  if (depth === 0 && lights && lights.length > n) {
    const H = new Halo();
    for (const l of lights.slice(n)) lightHalo(H, l, el.y, scale);
    H.flush(ctx.bag);
  }
  return r;
};

/** cn_flame: { at: [x, y, z], intensity?, distance?, floor?, r? } — a light already modelled (or of a door): the light and its halo, no body. */
function flame(el, { lights, bag }) {
  const [x, y, z] = el.at, l = { at: [x, y, z], color: el.color ?? '#ffb46b', intensity: el.intensity ?? 3, distance: el.distance ?? 8 };
  lights.push(l);
  const H = new Halo();
  lightHalo(H, l, el.floor, el.r ?? 1);
  H.flush(bag);
}

// ── the lamps of the porticoes ───────────────────────────────────────────────
/** The lamps hung from the architrave of every portico, one between every second pair of columns: [{ x, z, y (the hook), fy (the floor) }]. [inferred, after the lit streets of Antioch] */
export function porticoLamps() {
  const out = [];
  for (const st of MESE_STOAS) {
    const [ax, az] = st.a, [bx, bz] = st.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = Math.max(1, Math.round(L / 3.8)), step = L / n, y0 = height(ax, az), fy = y0 + 0.18;
    for (let k = 0; k < n; k++) {
      if ((k + (hashAt(ax, az) < 0.5 ? 0 : 1)) % 2) continue;                                 // one gap in two
      const s = (k + 0.5) * step, x = ax + u[0] * s, z = az + u[1] * s;
      out.push({ x, z, y: fy + 6 - 0.15, fy });                                                // the columns are 6 m, the architrave's soffit at fy + 6
    }
  }
  return out;
}
/** cn_lamps: { list: [{ x, z, y, fy }] } — a clay lamp on an iron chain from the architrave, its halo and a light (the flame is the halo's). */
function lamps(el, { bag, lights }) {
  const H = new Halo();
  for (const { x, z, y, fy } of el.list) {
    const drop = 0.95 + 0.12 * hashAt(x, z), yb = y - drop, q = 0.94 + 0.12 * hashAt(x, z, 5);          // (each lamp a little its own: twelve alike would be one instanced draw)
    bag.add('iron', rod([x, y, z], [x, yb + 0.16, z], 0.008, 4));
    bag.add('terracotta', lathe([[0.001, 0], [0.11 * q, 0.04], [0.2 * q, 0.15], [0.23 * q, 0.23], [0.19 * q, 0.2], [0.001, 0.07]], 8, null, x, yb, z));
    const l = { at: [x, yb + 0.22, z], color: '#ffb46b', intensity: 2.2, distance: 9 };
    lights.push(l);
    H.ball(x, yb + 0.22, z, 0.62);
    H.floor(x, fy + 0.03, z, 2.7, 10, 0.85);
  }
  H.flush(bag);
}

// ── the windows of the lanes' houses ─────────────────────────────────────────
const LIT = 0.3;                                  // the share of the upper windows with a lamp behind them
/** cn_house wrapped: a spy on the bag reads each 'opening' piece as it is made; a lit part of them get a pane of halo in front. */
function litHouse(fn) {
  return function litHouses(el, ctx) {
    if (!mine(ctx) || el.simple) return fn.call(this, el, ctx);
    const seen = [], target = ctx.bag;
    const spy = new Proxy(target, { get(t, k) { const v = Reflect.get(t, k); if (k === 'add') return (mat, g) => { if (mat === 'opening' && g?.attributes?.position) seen.push(g); return v.call(t, mat, g); }; return typeof v === 'function' ? v.bind(t) : v; } });
    const r = fn.call(this, el, { ...ctx, bag: spy });
    const H = new Halo(), cx = (el.rect[0] + el.rect[2]) / 2, cz = (el.rect[1] + el.rect[3]) / 2;
    for (const g of seen) {
      const p = g.attributes.position.array;
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (let i = 0; i < p.length; i += 3) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); z0 = Math.min(z0, p[i + 2]); z1 = Math.max(z1, p[i + 2]); }
      const h = y1 - y0, dx = x1 - x0, dz = z1 - z0;
      if (y0 < (el.y ?? 0) + 3.2 || h < 0.95 || h > 1.5 || Math.min(dx, dz) > 0.2 || Math.max(dx, dz) > 1.4 || Math.max(dx, dz) < 0.55) continue;      // an upper window, not a door, an arch's head or a mezzanine light (the ground floor's damp patches lie on the wall there)
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      if (hashAt(mx, mz, 7) > LIT) continue;
      const alongX = dx > dz, out = alongX ? (mz > cz ? 1 : -1) : (mx > cx ? 1 : -1), n = alongX ? [0, out] : [out, 0], f = 0.42 + 0.36 * hashAt(mx, mz, 11), w = Math.max(dx, dz) / 2 - 0.04;
      const off = (alongX ? (out > 0 ? z1 : z0) : (out > 0 ? x1 : x0)) + out * 0.03, ya = y0 + 0.06, yb = y1 - 0.06;
      const P = (u, y) => (alongX ? [mx + u, y, off] : [off, y, mz + u]);
      H.quad(P(-w, ya), P(w, ya), P(w, yb), P(-w, yb), n, f);
    }
    H.flush(ctx.bag);
    return r;
  };
}

// ── Hagia Sophia: the ring of the dome's windows, lit by the lamps ────────────────
/** hs_dome_windows wrapped (in the church's plan): behind each of the forty windows the glow of the lamps of the ring, a pane just proud of the window's jambs. */
function litDome(fn) {
  return function litDomeWindows(el, ctx) {
    fn.call(this, el, ctx);
    if (!mine(ctx)) return;
    const [cx, cz] = el.c, n = el.n || 40, hw = (el.w || 1.25) / 2 - 0.1, H = new Halo();
    for (let k = 0; k < n; k++) {
      const a = k * TAU / n, e = [Math.cos(a), Math.sin(a)], t = [-e[1], e[0]], R = el.R + 0.18, ya = el.y0 + 0.08, yb = el.y1 - hw - 0.02;
      const P = (u, y) => [cx + e[0] * R + t[0] * u, y, cz + e[1] * R + t[1] * u];
      H.quad(P(-hw, ya), P(hw, ya), P(hw, yb), P(-hw, yb), e, 0.62 + 0.14 * hashAt(e[0] * 9, e[1] * 9));
      H.quad(P(-hw, yb), P(hw, yb), P(hw * 0.7, yb + hw * 0.7), P(-hw * 0.7, yb + hw * 0.7), e, 0.5);
    }
    H.flush(ctx.bag);
  };
}

/**
 * The few fires of the night that no style element makes: the light of the church's open south door falling on the paving and the steps, where the
 * pilgrims sleep in the porch on the great feasts [inferred: the lamps within, the door open; the porch-sleepers are not built].
 */
export function fires() {
  const [dx, dz] = [-10, 36], y = height(dx, dz);
  return [
    { t: 'cn_flame', at: [dx, y + 2.4, dz - 1.2], intensity: 3, distance: 12, floor: y, r: 1.8 },
    { t: 'cn_flame', at: [dx, y + 0.9, dz + 3.4], intensity: 2.4, distance: 12, floor: y, r: 0.2 },
  ];
}


let done = false;
/** Wraps the styles' elements that make lights (once, after every file of the settlement has put its own into its style). */
export function registerNight() {
  if (done) return; done = true;
  const R = STYLES.roman?.elements;
  if (!R) return;
  for (const k of ['byz_shopfit', 'byz_home', 'cn_home', 'byz_chapel', 'byz_bath', 'thermae']) if (!NO.includes(k) && typeof R[k] === 'function') R[k] = wrap(R[k]);
  if (typeof R.cn_house === 'function') R.cn_house = litHouse(R.cn_house);
  const S = STYLES['constantinople-site']?.elements;
  if (S && typeof S.candle === 'function') S.candle = wrap(S.candle);
  const HS = STYLES['byzantine-hs'];
  if (HS?.objects?.polykandelon) HS.objects.polykandelon = wrap(HS.objects.polykandelon, 1.6);
  if (HS?.elements?.hs_dome_windows) HS.elements.hs_dome_windows = litDome(HS.elements.hs_dome_windows);
}
Object.assign(STYLES.roman.elements, { cn_flame: flame, cn_lamps: lamps });
