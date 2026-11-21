// Ye, c. AD 215, by night — what lit the city and the light it throws (docs/settlements/wei-ye.md §16).
// The light of the time is the oil lamp of bronze or pottery (the lamp trees of the court, the lamp on a household's low table), the torch and the fire basket (the
// bronze braziers of the terraces' stairs and of the wall, the watch fires of the gates), the hearth and the forge through a door; the market was shut at dusk, the
// wards' gates were shut by the drum at night and the households lit one lamp and put it out early; the court and the Sparrow's poets sat late by lamplight. Ye was a
// military capital: the guards' barracks, the watch-house and the gates kept fires all night.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and
// no collision, so the day view is unchanged and it reads at the low preset where the pools of real light are off. The shape of each piece is carried by its normals
// (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane before a lit window. The elements of the style `wei`
// that put a light into their plan, and the lattice windows of its houses and halls, are wrapped here (the style files stay as they were); a household is lit or dark
// by the hash of its own place (a dark household's lamps are taken out of the plan's lights too). Each light is a function of its own place: no counters, no
// Math.random. The method is that of the Suzhou reference, written for Ye's lamps; nothing of Suzhou's is imported.

import '../../styles/wei/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
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
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * Wrap an element's bag so that its lattice windows (a 'lattice' slab under 0.14 m thick, 0.45–1.6 m high, over 0.3 m wide) glow with the lamp behind them in
 * `share` of the cases (by the hash of the window's own place), on the outward face only (away from the element's middle `c`). Returns { ctx, H }.
 */
function litWindows(ctx, share, c) {
  const H = new Halo(), real = ctx.bag, [cx, cz] = c;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'lattice' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.14 && dy > 0.45 && dy < 1.6 && w > 0.3) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 31 + Math.floor(b[1] / 2)) < share) {
              const f = 0.42 + 0.34 * hashAt(mx, mz, 7), m = 0.04, o = 0.12;
              if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
              else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H };
}

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The middle of an element (to tell which face of a window looks out). */
const centreOf = (el) => (el.rect ? mid(el.rect) : el.c ? el.c : el.at ? el.at : el.cx !== undefined ? [el.cx, (el.z1 ?? 0) - ((el.depth ?? 2) * (el.depthW ?? 6)) / 2] : [0, 0]);
const rectHash = (el, s) => hashAt((el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2, s);
/** Is the household of this element lit tonight (the whole of a house: its lamps and its windows)? The garden's people (lodgings with a `room`) and the offices keep late hours. */
const LIT = {
  wei_house: (el) => rectHash(el, 3) < (el.room ? 0.92 : 0.4),
  wei_office: (el) => rectHash(el, 3) < 0.7,
};
/** Share of the windows lit, by element, once it is lit. */
const SHARE = { wei_house: (el) => (el.room ? 0.9 : 0.55), wei_office: () => 0.7, han_hall: () => 0.8, wei_tower: () => 0.9, wei_terrace: () => 0.7, han_pavilion: () => 0.5, han_ship: () => 0.8 };
/** Where the floor lies for the pool of a lamp (the room's floor): a house's hall floor 0.33, a hall's own floor, the terraces' storerooms at the ground, the tower's. */
const floorOf = (name, el) => (name === 'wei_house' ? 0.33 : name === 'wei_office' ? 0.6 : name === 'wei_terrace' ? 0 : name === 'wei_tower' ? el.floor : el.floor);

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, the lit windows. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const lit = LIT[name] ? LIT[name](el) : true, share = SHARE[name] ? (lit ? SHARE[name](el) : 0) : 0;
  const L = share > 0 ? litWindows(ctx, share, centreOf(el)) : null;
  depth++;
  try { var r = fn.call(this, el, L ? L.ctx : ctx); } finally { depth--; }
  const H = L ? L.H : new Halo();
  if (!lit) lights.length = n;                                 // a dark household: its lamps are out (the real lights too)
  else { const floor = floorOf(name, el); for (const l of lights.slice(n)) lightHalo(H, l, floor); }
  H.flush(ctx.bag);
  return r;
};

// ── the props that burn: the bronze brazier of a stair or the wall, the lamp tree ──────────────────────────────────────────────────────────────
/** Halos of a prop of fire (the flame is in the prop; here the light it throws): brazier, lamp tree, censer's coals. */
const FIRE = {
  brazier: (H, x, y, z) => { H.ball(x, y + 1.05, z, 1.05, 0.7); H.floor(x, y + 0.04, z, 2.8, 2.8, 10, 0.55); },
  lamp: (H, x, y, z) => { H.ball(x, y + 1.18, z, 0.72, 0.6); H.floor(x, y + 0.04, z, 2.3, 2.3, 8, 0.45); },
};
const wrapProp = (fn) => function propHaloed(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth > 0 || !ctx?.lights || el.simple || !FIRE[el.kind]) return r;
  const H = new Halo();
  FIRE[el.kind](H, el.at[0], el.y ?? 0, el.at[1]);
  H.flush(ctx.bag);
  return r;
};

/** Extra halos for elements that carry a lamp the style does not put into its lights: [name]: (el) => [[x, y, z, r, k]]. */
const LAMPS = {
  // the lamp in the crowning pavilion of the que at the palace's gate (the que was a gate beacon: lit at night)
  han_que: (el) => [[el.at[0], (el.h ?? 11) + 1.7, el.at[1], 1.5, 0.7]],
  // the market officer's lamp in the tower's upper floor (the market was shut at dusk; the tower kept its watch)
  han_market: (el) => { const c = mid(el.rect); return [[c[0], 2.6 + 4.1 + 1.6, c[1], 1.3, 0.65]]; },
  // the tower-ship's lamps in its two cabins and at the stern
  han_ship: (el) => { const [x, z] = el.at, y = el.y; return [[x, y + 2.3, z, 1.0, 0.55], [x, y + 4.3, z, 0.9, 0.55]]; },
};
const wrapLamps = (name, fn) => function lamped(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth > 0 || !ctx?.lights || el.simple) return r;
  const H = new Halo();
  for (const [x, y, z, rr, k] of LAMPS[name](el)) H.ball(x, y, z, rr, k);
  H.flush(ctx.bag);
  return r;
};

// ── the new light: the watch fire of a gate ────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * wei_cresset: { at: [x, z], y? } — the iron fire basket on a stand at a gate (the watch fire of the city's and the palace's gates, kept all night): a broad foot, a post, a
 * bowl of iron bars with the logs in it, the flame (present at night only: 'flame+night'), the glow and its pool on the ground. Heights and widths vary by the hash of the place.
 */
function cresset({ at, y = 0 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = 0.94 + 0.12 * q, w = 0.92 + 0.16 * hashAt(x, z, 6);
  bag.add('iron', lathe([[0.001, 0], [0.26 * w, 0], [0.26 * w, 0.07], [0.07, 0.12], [0.05, 0.95 * s], [0.09, 1.0 * s], [0.14, 1.04 * s]], 8, null, x, y, z));
  bag.add('iron', lathe([[0.15, 1.02 * s], [0.3 * w, 1.22 * s], [0.34 * w, 1.36 * s], [0.3 * w, 1.37 * s], [0.26 * w, 1.24 * s], [0.12, 1.1 * s], [0.001, 1.08 * s]], 9, null, x, y, z));
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + q * 2, c = Math.cos(a), sn = Math.sin(a); bag.add('wood_dark', box(x + c * 0.1 - 0.05, y + 1.1 * s, z + sn * 0.1 - 0.05, x + c * 0.1 + 0.05, y + 1.42 * s, z + sn * 0.1 + 0.05)); }
  bag.add('flame+night', lathe([[0.001, 1.34 * s], [0.2 * w, 1.34 * s], [0.12 * w, 1.62 * s], [0.001, 1.85 * s]], 7, null, x, y, z));
  col.circle(x, z, 0.3, y, y + 1.4 * s);
  const l = { at: [x, y + 1.9 * s, z], color: '#ff9440', intensity: 4.2, distance: 12 };
  lights?.push(l);
  lightHalo(H, l, y);
  H.flush(bag);
}

let done = false;
/** Wraps the elements of the style `wei` that make lights (once, after the style has registered). */
export function registerNight() {
  if (done) return; done = true;
  const reg = STYLES.wei;
  if (!reg) return;
  const E = reg.elements, wrapped = new Set(['haloed', 'lamped', 'trees', 'propHaloed']);
  for (const k of Object.keys(E)) {
    let f = E[k];
    if (typeof f !== 'function' || wrapped.has(f.name) || k === 'wei_cresset' || k === 'wei_keepers') continue;     // (a Han element already wrapped by Han Chang'an's own night is left as it is)
    if (k === 'wei_prop') { E[k] = wrapProp(f); continue; }
    if (SHARE[k] || LIT[k] || /hall|house|office|que|market|ship|tower|terrace/.test(k)) f = wrap(k, f);
    if (LAMPS[k]) f = wrapLamps(k, f);
    E[k] = f;
  }
  E.wei_cresset = cresset;
}
registerNight();
