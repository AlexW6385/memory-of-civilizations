// Han Chang'an, c. 100 BC, by night — what lit the palace and the city, and the light it throws (docs/settlements/han-changan.md §14).
// The light of the time is the oil lamp of bronze or pottery (the palace's bronze lamps, the branched lamp trees), the torch and the fire basket;
// the court assembled before dawn by the light of the courtyard torches (the "tingliao", Shijing 庭燎); the gates and the ward gates had their watch fires; the
// markets were shut at dusk; the households lit one lamp and put it out early.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow
// and no collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. The shape of each piece is carried by its normals
// (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane before a lit window or door. The elements of
// the Han styles that put a light into their plan, and the windows of their halls and houses, are wrapped here (the style files stay as they were); a household is lit
// or dark by the hash of its own place (a dark house's lamps are taken out of the plan's lights too); the few new lights are `han_cresset` and `han_tingliao`
// elements. Each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou reference, written for Han Chang'an's lamps;
// nothing of Suzhou's is imported.

import '../../styles/han/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { DOORS, doorKey } from '../../styles/hanlodge/index.js';
import { lotFrame } from '../../styles/han/kit.js';

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
 * `share` of the cases (by the hash of the window's own place), on the outward face only (away from the element's middle `c`). Returns { ctx, H, finish }.
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
              const f = 0.42 + 0.34 * hashAt(mx, mz, 7), m = 0.04, o = 0.012;
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

const NOOPCTX = { bag: new Proxy({}, { get: () => () => {} }), col: new Proxy({}, { get: () => () => {} }) };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The middle of an element (to tell which face of a window looks out). */
const centreOf = (el) => (el.rect ? mid(el.rect) : el.at ? el.at : el.c ? el.c : el.cx !== undefined ? [el.cx, (el.z1 ?? 0) - ((el.depth ?? 2) * (el.depthW ?? 6)) / 2] : [0, 0]);
/** Share of the windows lit, by element; a household (house, office) is lit or dark as a whole (LIT). */
const RANKLIT = [0.3, 0.5, 0.7];
const SHARE = {
  hanl_hall: () => 0.85, han_hall: () => 0.7, hanl_house: (el) => 0.8 * RANKLIT[el.rank ?? 1], han_house: () => 0.22, han_office: () => 0.6,
  han_ship: () => 0.85, han_market: () => 0.7, han_pavilion: () => 0.6,
};
/** Is the household of this element lit tonight (the whole of a house: its lamps, its windows and its door's light)? */
const LIT = {
  hanl_house: (el) => hashAt((el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2, 3) < (el.rank === undefined ? 0.65 : RANKLIT[el.rank] + 0.1),
  han_house: (el) => hashAt((el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2, 3) < 0.3,
  han_office: (el) => hashAt((el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2, 3) < 0.6,
};
/** Where the floor lies for the pool of a lamp (the room's floor): a house's hall floor 0.33, a hall's own floor, an office's hall 0.6. */
const floorOf = (name, el) => (name === 'hanl_house' || name === 'han_house' ? 0.33 : name === 'han_office' ? 0.6 : el.floor);

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, the lit windows and the light of a house's door. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const lit = LIT[name] ? LIT[name](el) : true, share = SHARE[name] ? (lit ? SHARE[name](el) : 0) : 0;
  const L = share > 0 ? litWindows(ctx, share, centreOf(el)) : null;
  depth++;
  try { var r = fn.call(this, el, L ? L.ctx : ctx); } finally { depth--; }
  const H = L ? L.H : new Halo();
  if (!lit) lights.length = n;                                 // a dark household: its lamps are out (the real lights too)
  else {
    const floor = floorOf(name, el);
    for (const l of lights.slice(n)) lightHalo(H, l, floor);
    const D = name === 'hanl_house' ? DOORS.get(doorKey(el)) : null;
    if (D && D.du !== undefined) {
      // the lamp's light at the hall's door: a pool on the step and a warm sheet across the doorway
      const F = lotFrame(NOOPCTX, el.rect, el.front), p = F.pt(D.du, D.v0 - 1.1), a = F.pt(D.du - D.dw / 2 + 0.12, D.v0 + 0.12), b = F.pt(D.du + D.dw / 2 - 0.12, D.v0 + 0.12), y = D.P ?? 0.3;
      H.floor(p[0], y + 0.04, p[1], 2.2, 1.7, 8, 0.7);
      H.quad([a[0], y + 0.1, a[1]], [b[0], y + 0.1, b[1]], [b[0], y + 2.0, b[1]], [a[0], y + 2.0, a[1]], [-F.V[0], -F.V[1]], 0.42 + 0.2 * hashAt(p[0], p[1], 9));
    }
  }
  H.flush(ctx.bag);
  return r;
};

// ── the new lights ───────────────────────────────────────────────────────────────────────────────────────────────

/**
 * han_cresset: { at: [x, z], y? } — the iron fire basket of a gate or a lane's end on a stand (a watch fire): a broad foot, a post, a bowl of iron bars with the logs in it,
 * the flame (present at night only: 'flame+night') and the glow and its pool on the ground. Heights and widths vary by the hash of the place.
 */
function cresset({ at, y = 0 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = 0.94 + 0.12 * q, w = 0.92 + 0.16 * hashAt(x, z, 6);
  bag.add('iron', lathe([[0.001, 0], [0.26 * w, 0], [0.26 * w, 0.07], [0.07, 0.12], [0.05, 0.95 * s], [0.09, 1.0 * s], [0.14, 1.04 * s]], 8, null, x, y, z));
  bag.add('iron', lathe([[0.15, 1.02 * s], [0.3 * w, 1.22 * s], [0.34 * w, 1.36 * s], [0.3 * w, 1.37 * s], [0.26 * w, 1.24 * s], [0.12, 1.1 * s], [0.001, 1.08 * s]], 9, null, x, y, z));
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + q * 2, c = Math.cos(a), sn = Math.sin(a); bag.add('wood_dark', box(x + c * 0.1 - 0.05, y + 1.1 * s, z + sn * 0.1 - 0.05, x + c * 0.1 + 0.05, y + 1.42 * s, z + sn * 0.1 + 0.05)); }
  col.circle(x, z, 0.3, y, y + 1.4 * s);
  const l = { at: [x, y + 1.9 * s, z], color: '#ff9440', intensity: 4.2, distance: 12 };
  lights.push(l);
  lightHalo(H, l, y);
  H.flush(bag);
}

/**
 * han_tingliao: { at: [x, z], y? } — the courtyard torch (庭燎) before the hall: a stone block, a tall post of timber bound with bronze, at its head a bowl with the bundle of
 * burning reeds; the flame at night only. The court's audience was held before dawn by their light.
 */
function tingliao({ at, y = 0 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 15), s = 0.95 + 0.1 * q;
  bag.add('bluestone', box(x - 0.34, y, z - 0.34, x + 0.34, y + 0.42, z + 0.34));
  bag.add('timber', lathe([[0.001, 0.42], [0.11, 0.42], [0.09, 2.1 * s], [0.12, 2.2 * s]], 8, null, x, y, z));
  for (const h of [0.9, 1.5, 2.05]) bag.add('bronze', lathe([[0.1, h * s - 0.04], [0.125, h * s - 0.02], [0.125, h * s + 0.03], [0.1, h * s + 0.05]], 8, null, x, y, z));
  bag.add('bronze', lathe([[0.001, 2.2 * s], [0.34, 2.28 * s], [0.4, 2.46 * s], [0.34, 2.48 * s], [0.24, 2.32 * s], [0.001, 2.26 * s]], 9, null, x, y, z));
  bag.add('reed_mat', lathe([[0.001, 2.4 * s], [0.2, 2.44 * s], [0.18, 2.62 * s], [0.001, 2.66 * s]], 7, null, x, y, z));
  col.circle(x, z, 0.38, y, y + 2.2 * s);
  const l = { at: [x, y + 3.05 * s, z], color: '#ff9a4c', intensity: 4.6, distance: 14 };
  lights.push(l);
  lightHalo(H, l, y);
  H.flush(bag);
}

// ── lights of places the styles build: the que's pavilion, the market's tower, the tower-ship ────────────────────────

/** Extra halos for elements that carry a lamp the style does not put into its lights: [name]: (el) => [[x, y, z, r, k]]. */
const LAMPS = {
  // the lamp in the que's crowning pavilion (the que was a gate beacon: the pavilion lit at night [inferred])
  hanl_que: (el) => [[el.at[0], (el.h ?? 11) + 1.7, el.at[1], 1.5, 0.7]],
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

/** The bronze lamp trees of the forecourt and the crown (han/court.js: three gilt cups on branches of a post 1.7 m high): a small flame in each cup (night only), a glow and its pool. */
const TREES = {
  han_court: (el) => { const o = []; for (const s of [-1, 1]) for (let z = el.z0 + 18; z < el.z1 - 6; z += 14) o.push([el.ax + s * 7.5, 0.03, z]); return o; },
  han_crown: (el) => { const o = []; for (const s of [-1, 1]) { let k = 0; for (let z = el.z0 - 12; z > el.z1 + 8; z -= 11, k++) o.push([el.ax + s * 9.5, el.top + 0.03, z + 5.5]); } return o; },
};
const wrapTrees = (name, fn) => function trees(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth > 0 || !ctx?.lights || el.simple) return r;
  const H = new Halo();
  for (const [x, y, z] of TREES[name](el)) {
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094, fx = x + Math.cos(a) * 0.45, fz = z + Math.sin(a) * 0.45, fy = y + 1.7 * (0.55 + k * 0.15) + 0.18, q = hashAt(fx, fz, 4);
    }
    H.ball(x, y + 1.45, z, 0.8, 0.58);
    H.floor(x, y + 0.04, z, 2.4, 2.4, 8, 0.6);
  }
  H.flush(ctx.bag);
  return r;
};

let done = false;
/** Wraps the Han styles' elements that make lights (once, after every file of the styles has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  for (const key of ['han', 'hanlodge']) {
    const reg = STYLES[key];
    if (!reg) continue;
    const E = reg.elements;
    for (const k of Object.keys(E)) {
      if (typeof E[k] !== 'function') continue;
      if (/^(han_cresset|han_tingliao)$/.test(k)) continue;
      let f = E[k];
      if (SHARE[k] || LIT[k] || /hall|house|office|que|market|ship|pavilion/.test(k)) f = wrap(k, f);
      if (LAMPS[k]) f = wrapLamps(k, f);
      if (TREES[k]) f = wrapTrees(k, f);
      E[k] = f;
    }
    E.han_cresset = cresset; E.han_tingliao = tingliao;
  }
}
registerNight();
