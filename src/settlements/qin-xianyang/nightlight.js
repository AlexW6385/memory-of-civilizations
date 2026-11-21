// Qin Xianyang by night — what lit the pit, the palace and the town, and the light it throws (docs/settlements/qin-xianyang.md §11).
// The light of the time is the oil lamp of bronze or pottery (the pit's hanging lamps, the palace's lamp trees and lamp-posts), the fire basket (the ramps' braziers, the
// watch tower's beacon), the forge and the kiln; a household lit one lamp. Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light
// ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the day view is unchanged and the lamps read as lit at the low preset,
// where the pool of real lights is off. A glow round every flame the style draws (found by the flame geometry itself, whichever element makes it), a pool on the floor under
// a standing one, a glow at each lamp of a lit house, a pane of light at the lattice windows of a lit house, the kiln's mouth and its chimney, and a lamp on each ward gate
// and at the market tower's stair head (the only new objects: `qin`'s elements are wrapped here, the style files stay as they were). A household is lit or dark by the hash
// of its own place; the lamps of a dark one are taken out of the plan's lights too. Each light is a function of its own place: no counters, no Math.random. The method is
// that of the Han and Suzhou settlements, written here for Qin's lamps; nothing of theirs is imported.

import '../../styles/qin/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { TOWER } from './layout.js';

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
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit window or a kiln's mouth) of brightness f, facing n = [x, z]. */
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

/** The glow of one lamp of a plan's lights (`{ at, distance, intensity }`); `floor` the floor it stands over. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

/** How far a flame of an element stands over the floor it lights (null: hung or on a tower, no pool), by the flame's bounds b. */
const DROP = {
  qin_hall: () => 2.0, qin_court: () => 2.9,                                                // the hall's lamp trees (2.0 m), the forecourt's lamp-posts (2.9 m)
  qin_yard: (b) => (b[1] < 1.6 ? 1.0 : null),                                                // the ramps' braziers; the watch tower's beacon has none
  qin_court_house: () => 1.58, qin_official: () => 1.58,                                     // a bronze lamp stand in an official's hall (1.5 m)
  qin_workshop: (b) => (b[3] - b[0] > 0.3 ? 0.86 : null),                                    // the smith's forge (its hearth 0.86 m)
  qin_row_house: (b) => (b[3] - b[0] > 0.3 ? 0.86 : null),
  qin_shop: (b) => (b[3] - b[0] > 0.3 ? 0.86 : null),
  qin_ward_gate: () => null, qin_market: () => null,
};
/** Where the floor lies for the pool of a plain lamp (the room's floor): an official's hall floor, else the ground. */
const FLOOR = { qin_official: 0.9, qin_court_house: 0.01, qin_row_house: 0.01, qin_workshop: 0.01 };
/** Share of the households (open houses lit by the plan) that burn a lamp tonight. */
const HOUSEHOLD = { qin_row_house: 0.8, qin_court_house: 0.8, qin_official: 0.9, qin_workshop: 0.85 };

/** Wrap an element's bag: it records the flames (for their glow) and, in a lit house, the lattice windows (a top bar and a bottom bar of timber over a gap of 0.5–1.1 m). */
function watch(ctx, windows) {
  const real = ctx.bag, flames = [], bars = [], wins = [];
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          if (mat === 'flame') flames.push(bounds(g));
          else if (windows && mat === 'timber') {
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
            if (th < 0.13 && dy > 0.05 && dy < 0.1 && w > 0.7 && w < 2.2) {
              const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
              for (const o of bars) {
                if (Math.abs(o.mx - mx) > 0.05 || Math.abs(o.mz - mz) > 0.05 || Math.abs(o.w - w) > 0.02) continue;
                const lo = o.b[1] < b[1] ? o.b : b, hi = o.b[1] < b[1] ? b : o.b, gap = hi[1] - lo[4];
                if (gap > 0.5 && gap < 1.1) wins.push({ b, lo: lo[4], hi: hi[1], dx, dz, mx, mz });
              }
              bars.push({ b, mx, mz, w });
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, flames, wins };
}

let depth = 0;
/** Wrap one element builder: the glow of every flame it draws and of every light it adds, the lit windows of a lit house, and its household's lamp being out or lit. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const house = HOUSEHOLD[name] !== undefined && el.rect;
  const dark = house && hashAt((el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2, 3) >= HOUSEHOLD[name];
  const W = watch(ctx, !!house && !dark && !!el.lit);
  depth++;
  try { var r = fn.call(this, el, W.ctx); } finally { depth--; }
  const H = new Halo(), mine = lights.slice(n);
  if (dark) lights.length = n;                                  // a dark household: its lamps are out (the real lights too)
  const drop = DROP[name], put = (b, k = 0.62) => {
    const ext = Math.max(b[3] - b[0], b[4] - b[1], b[5] - b[2]), x = (b[0] + b[3]) / 2, y = (b[1] + b[4]) / 2, z = (b[2] + b[5]) / 2, rr = Math.max(0.45, Math.min(1.6, 0.35 + ext * 1.6));
    H.ball(x, y, z, rr, k);
    const dr = drop ? drop(b) : null;
    if (dr !== null && dr !== undefined) H.floor(x, y - dr + 0.03, z, 2.0, 2.0, 8, 0.5);
  };
  if (!dark) {
    for (const b of W.flames) put(b);
    // the lamps of a house or a yard that are not a flame the style draws
    for (const l of mine) {
      if (W.flames.some((b) => Math.abs((b[0] + b[3]) / 2 - l.at[0]) < 0.9 && Math.abs((b[2] + b[5]) / 2 - l.at[2]) < 0.9 && Math.abs((b[1] + b[4]) / 2 - l.at[1]) < 0.7)) continue;
      lightHalo(H, l, FLOOR[name]);
    }
    // a pane of light at each lattice window of a lit house, on the face away from the lamp
    for (const w of W.wins) {
      const l = mine.reduce((a, c) => (!a || Math.hypot(c.at[0] - w.mx, c.at[2] - w.mz) < Math.hypot(a.at[0] - w.mx, a.at[2] - w.mz) ? c : a), null);
      if (!l) continue;
      const b = w.b, f = 0.4 + 0.3 * hashAt(w.mx, w.mz, 7), m = 0.05, o = 0.012, y0 = w.lo + 0.03, y1 = w.hi - 0.03;
      if (w.dx < w.dz) { const s = w.mx > l.at[0] ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, y0, b[2] + m], [x, y0, b[5] - m], [x, y1, b[5] - m], [x, y1, b[2] + m], [s, 0], f); }
      else { const s = w.mz > l.at[2] ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, y0, z], [b[3] - m, y0, z], [b[3] - m, y1, z], [b[0] + m, y1, z], [0, s], f); }
    }
  }
  if (name === 'qin_workshop' && el.trade === 'kiln' && el.rect) kilnGlow(H, el);
  H.flush(ctx.bag);
  return r;
};

/** The kiln's fire: the glow of the firing mouth on the yard (a sheet over the dark opening and a pool before it) and the hot gases at the chimney hole (scenery.js: round kiln at u = W/2, v = 12, r 2.7, mouth at v 9.25, top 3.8 m). */
function kilnGlow(H, el) {
  const [x0, z0, x1, z1] = el.rect, s = el.front === 's', W = x1 - x0, Z = (v) => (s ? z1 - v : z0 + v), sg = s ? -1 : 1, ux = x0 + W / 2;
  const f = 0.8 + 0.12 * hashAt(ux, z0, 8);
  H.quad([ux - 0.55, 0.12, Z(9.2)], [ux + 0.55, 0.12, Z(9.2)], [ux + 0.55, 1.15, Z(9.2)], [ux - 0.55, 1.15, Z(9.2)], [0, -sg], f);
  H.ball(ux, 0.75, Z(9.0), 1.4, 0.85);
  H.floor(ux, 0.04, Z(8.0), 3.0, 2.4, 10, 1);
  H.ball(ux, 4.1, Z(12), 0.9, 0.55);
}

// ── the new lamps ────────────────────────────────────────────────────────────────────────────────────────────────

/** A hanging lamp (bronze bowl, its flame) under the point (x, y, z), on an iron hook. */
function hangLamp(bag, x, y, z) {
  bag.add('iron', box(x - 0.012, y - 0.3, z - 0.012, x + 0.012, y, z + 0.012));
  bag.add('bronze', lathe([[0.001, -0.12], [0.1, -0.08], [0.13, 0], [0.001, 0.01]], 8, null, x, y - 0.3, z));
  bag.add('flame', lathe([[0.001, 0], [0.035, 0.05], [0.001, 0.2]], 6, null, x, y - 0.29, z));
}
/** A lamp stand of bronze, 1.3 m, with a bowl and its flame, standing on y. */
function stand(bag, x, y, z) {
  bag.add('bronze', lathe([[0.2, 0], [0.16, 0.08], [0.04, 0.25], [0.04, 1.15], [0.17, 1.22], [0.001, 1.3]], 9, null, x, y, z));
  bag.add('flame', lathe([[0.001, 1.3], [0.07, 1.36], [0.001, 1.6]], 6, null, x, y, z));
}

/** Elements that gain a lamp of their own: [name]: (el, bag) => void. The ward gate keeps a lamp at its lintel (the keeper closed the lane at dusk [inferred]); the market tower a lamp at each end of its stair head. */
const NEW = {
  qin_ward_gate: (el, bag) => { const [x, z] = el.at; hangLamp(bag, x, 3.05, z - 0.45); },
  qin_market: (el, bag) => { const { x, z, w } = TOWER, hw = w / 2, uy = 4.28; for (const s of [-1, 1]) stand(bag, x + s * (hw - 0.55), uy, z + hw - 0.4); },
};
const wrapNew = (name, fn) => function lamped(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth > 0 || !ctx?.lights || el.simple) return r;
  NEW[name](el, ctx.bag);
  return r;
};

let done = false;
/** Wraps the Qin style's elements that make light (once, after the style has registered them). */
export function registerNight() {
  if (done) return; done = true;
  const reg = STYLES.qin;
  if (!reg) return;
  const E = reg.elements;
  for (const k of Object.keys(E)) {
    if (typeof E[k] !== 'function' || !/^(qin_(pit|hall|court|yard|row_house|court_house|official|workshop|ward_gate|market|terrace_detail))$/.test(k)) continue;
    let f = E[k];
    if (NEW[k]) f = wrapNew(k, f);
    E[k] = wrap(k, f);
  }
}
registerNight();
