// Muscovy about 1600 by night (docs/settlements/muscovy.md §13): what lit the town, and the light it throws.
// Moscow had no street lamps before the 1730s: it was lit only by the candles and splinters that people set in their windows, the gates of the
// city closed after dark and anyone abroad carried a light, the night watch stopping those without one [stated: see the dossier §13]. So: the
// small mica windows of the log houses lit here and there (a splinter in its holder, a candle, the lamp before the icons), the vigil lamps behind
// the churches' slit windows, the iron fire-baskets (cressets) of the guards at the gates and bridges, the lamp under the Saviour's icon over the
// Spassky gate. Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night
// only, no light, no shadow, no collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by its
// normals (y: 1 at a disc's middle, 0 at its rim). Each light is a function of its own place (hashAt): no counters, no Math.random.
// The method is that of the Suzhou reference (the same material), written here for Muscovy; nothing of Suzhou's is imported.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe, rod } from '../../core/geom.js';
import { STYLES, registerStyle } from '../../core/build.js';
import '../../styles/muscovite/index.js';
import { KITAI, KITAI_GATES, SPASSKY, NIKOLSKY, MOAT, wallX, gateZ, height } from './layout.js';

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
    if (th > thick || w < 0.3 || dy < 0.3 || th < 0.002 || w > 2.6 || dy > 3.4) continue;
    out.push(b);
  }
  return out;
}
/** The lit panes for one slab: a sheet a hair off each face (the leaf less a frame's width), each room its own strength by the hash of its place (oil is dear: 0.4 to 0.8). */
function panesOf(H, b, off, k = 1) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = Math.min(0.85, k * (0.4 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5))));
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}

// ── the cresset: an iron fire-basket on a pole, the guards' light at a gate or a bridge head ─────────
/** A pole 1.9 m high carrying an iron basket of burning splinters; the glow and its pool on the ground. { at, y } */
export function cresset(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = new Halo(), q = hashAt(x, z, 41), h = 1.8 + 0.2 * q, tw = 0.04 + 0.01 * hashAt(x, z, 42);
  // (each cresset differs a little by the hash of its place: twelve identical rods would be drawn instanced, a draw more)
  bag.add('iron', rod([x, y, z], [x, y + h, z], tw, 5));
  bag.add('iron', box(x - 0.12 - 0.03 * q, y, z - 0.12 - 0.03 * q, x + 0.12 + 0.03 * q, y + 0.07, z + 0.12 + 0.03 * q));
  bag.add('iron', lathe([[0.001, 0], [0.1, 0], [0.24 + 0.02 * q, 0.16], [0.28, 0.3 + 0.03 * q], [0.25, 0.32 + 0.03 * q], [0.22, 0.3], [0.09, 0.04], [0.001, 0.04]], 8, null, x, y + h - 0.05, z));
  for (let k = 0; k < 4; k++) bag.add('iron', rod([x + Math.cos(k * 1.57) * 0.1, y + h, z + Math.sin(k * 1.57) * 0.1], [x + Math.cos(k * 1.57) * (0.27 + 0.02 * q), y + h + 0.28 + 0.04 * q, z + Math.sin(k * 1.57) * (0.27 + 0.02 * q)], 0.012, 4));
  for (let k = 0; k < 5; k++) { const a = k * 1.26 + 0.3 + q, c = Math.cos(a), s = Math.sin(a); bag.add('iron', rod([x + c * 0.12, y + h + 0.05, z + s * 0.12], [x - c * 0.04 + s * 0.04, y + h + 0.38 + (k % 2) * 0.06 + 0.05 * q, z - s * 0.04 - c * 0.04], 0.035, 4)); }
  H.ball(x, y + h + 0.3, z, 1.2, 0.7); H.floor(x, y + 0.04, z, 3.4, 3.4, 0, 10, 0.8);
  H.flush(bag);
  col.rect([x - 0.3, z - 0.3, x + 0.3, z + 0.3], y, y + h);
}

// ── the lit windows of what a builder makes ─────────────────────────────────────────────────────
const WINDOW = { opening: 0.03, glass_lamp: 0.03 };
/** One flame (the bounds of its geometry) into H: a small candle or lamp flame lights its own glow, and a pool on what it stands on when it is low (a stand on the floor). */
function flameLight(H, b, base) {
  const cx = (b[0] + b[3]) / 2, cz = (b[2] + b[5]) / 2, cy = (b[1] + b[4]) / 2, h = cy - base;
  H.ball(cx, cy, cz, 0.7, 0.6);
  if (h < 1.0) H.floor(cx, b[1] - 0.05 + 0.03, cz, 1.2, 1.2, 0, 8, 0.45);
}
/**
 * Wrap a builder context so that what it makes glows at night: each window slab (a pane of the mica, the churches' slit lights) gets a sheet of light on
 * each face if its room is lit (`lit(b)` decides), `k` its strength; each flame gets its glow. A very thin slab 0.55 to 0.7 m wide (the stove's mouth) is the fire's
 * and burns brighter with a pool before it. Returns { ctx, H, finish }: call finish() once the element is built.
 */
function litWindows(ctx, lit, k, base = 0) {
  const H = new Halo(), real = ctx.bag;
  const bag = new Proxy(real, {
    get(t, key) {
      if (key === 'add') return (mat, g, ...r) => {
        if (typeof mat === 'string' && g?.attributes?.position) {
          const off = WINDOW[mat];
          if (off !== undefined) {
            for (const b of slabsOf(g, 0.2)) {
              const w = Math.max(b.x1 - b.x0, b.z1 - b.z0), th = Math.min(b.x1 - b.x0, b.z1 - b.z0);
              if (mat === 'opening' && th < 0.0045 && w > 0.5 && w < 0.75 && b.y0 - base > 0.5 && b.y0 - base < 1.6 && b.y1 - b.y0 < 0.5) {      // the stove's mouth
                const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, cy = (b.y0 + b.y1) / 2; panesOf(H, b, off, 1.6); H.ball(cx, cy, cz, 0.9, 0.55); H.floor(cx, b.y0 - 0.5 + 0.04, cz, 1.5, 1.2, 0, 8, 0.45);
              } else if (lit(b)) panesOf(H, b, off, k);
            }
          } else if (mat === 'flame') flameLight(H, bounds(g), base);
        }
        return t.add(mat, g, ...r);
      };
      const v = t[key];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H, finish: () => H.flush(real) };
}
const centreOf = (b) => [(b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2];
/** A log house: one house in two lit in its mica windows and flames at night if open and lived in (the stove, the icon lamp, the splinter), one in three of the rest; no light in a storehouse. */
function litIzba(base) {
  const f = (el, ctx) => {
    const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, barn = el.variant === 'barn' || el.kind === 'barn';
    const home = !barn && hashAt(cx, cz, 3) < (el.open ? 0.62 : 0.3);
    const L = litWindows(ctx, (b) => home && hashAt(...centreOf(b), 9) < 0.8, el.open ? 0.9 : 0.7, el.y ?? 0);
    base(el, L.ctx);
    L.finish();
  };
  f.__lit = true;
  return f;
}
/** A church, palace or shrine: the windows lit by `share` (the vigil lamps and candles), by the hash of each window's own place. */
function litHall(share, k = 1) {
  return (base) => {
    const f = (el, ctx) => {
      const L = litWindows(ctx, (b) => hashAt(...centreOf(b), 17 + Math.floor(b.y0 / 3)) < share, k, el.y ?? 0);
      base(el, L.ctx);
      L.finish();
    };
    f.__lit = true;
    return f;
  };
}
/** The Kremlin's wall: at each gate the lamp before the Saviour's icon over each mouth (an icon lamp, lampada) and the glow of the guards' fire in the vaulted passage. */
function litWall(base) {
  const f = (el, ctx) => {
    base(el, ctx);
    const H = new Halo(), pts = el.pts, yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0;
    for (const [i, t] of el.gates ?? []) {
      const a = pts[i], b = pts[(i + 1) % pts.length], x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, yy = yf(x, z), ax = Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]), r = 5.5;
      for (const e of [-1, 1]) { const p = ax ? [x + e * (r + 0.9), z] : [x, z + e * (r + 0.9)]; H.ball(p[0], yy + 5.2, p[1], 1.5, 0.62); }
      H.ball(x, yy + 1.8, z, 2.6, 0.5);                                                    // the passage: the guards' fire seen through the vault
    }
    H.flush(ctx.bag);
  };
  f.__lit = true;
  return f;
}

/** Register the lights of Muscovy: the cresset as an element; the lit houses, churches, palace and wall as wrappers of the builders that make them. */
export function registerNight() {
  const S = STYLES.muscovite;
  if (!S || S.elements.cresset) return;
  const E = { ...S.elements, cresset };
  const wrap = (name, make) => { const base = E[name]; if (base && !base.__lit) E[name] = make(base); };
  wrap('izba', litIzba);
  wrap('russian_church', litHall(0.8, 1)); wrap('archangel', litHall(0.7, 1)); wrap('annunciation', litHall(0.7, 1)); wrap('pokrov', litHall(0.8, 1));
  wrap('facets_palace', litHall(0.45, 0.9)); wrap('log_church', litHall(0.7, 0.9)); wrap('wayside', litHall(1, 0.8));
  wrap('kremlin_wall', litWall);
  registerStyle('muscovite', { ...S, elements: E });
}
registerNight();

/** The guards' cressets: before each Kremlin gate's bridge (a pair at the bridge head), the Kitai-gorod gates (a pair inside each). [inferred: the guard at the gates by night, see the dossier §13] */
export function cressets() {
  const E = [], put = (x, z) => E.push({ t: 'cresset', at: [x, z], y: height(x, z) });
  for (const t of [SPASSKY[1], NIKOLSKY[1]]) { const zb = gateZ(t), xb = wallX(zb) + MOAT.d1 + 5.4; put(xb, zb - 5.4); put(xb, zb + 5.4); }
  KITAI_GATES.forEach(([i, t]) => {
    const a = KITAI[i], b = KITAI[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
    let nx = -uz, nz = ux; if (nx * (150 - x) + nz * (0 - z) < 0) { nx = -nx; nz = -nz; }        // toward the middle of the town: inside
    for (const s of [-1, 1]) put(x + ux * 5.5 * s + nx * 4, z + uz * 5.5 * s + nz * 4);
  });
  return E;
}
