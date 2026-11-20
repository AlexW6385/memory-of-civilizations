// Timurid Samarkand by night (docs/settlements/timurid-samarkand.md §20): the light the lamps and the lit rooms throw, readable at the low
// preset. The oil lamps, braziers and hanging lamps of the style's rooms already push real lights (that the engine uses for the nearest few);
// here every one of them also gets its light made of geometry in the one added-light material, `halo` (palette.js, materials.js 'halo'): light
// ADDED over what is behind it, at night only, with no light, no shadow and no collision. The shape of each piece is carried by its normals: a
// glow round the flame (three crossed discs), a pool of light on the floor under it, a sheet in front of a latticed window (the lamp of the room
// within). Plus the things of the night that are not in the rooms: the lamps hung at the shop fronts and in the bazaar's bays, the iron
// lamp stands of the Registan, the watchmen's brazier at the caravan's camp, the lamp on each tea-house platform, the lamp in the niche by a
// house door. Everything is a function of its own place (no counters, no Math.random).

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { SHOPS_N, SHOPS_S, TAPCHANS, BAZAAR, CHORSU, houseGeom, inRect, SQUARE } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2;
const MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material (the pieces as the reference makes them: the normal's y is the brightness). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F_ = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F_[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A pool of light lying on a horizontal plane at height y. */
  floor(x, y, z, r, k = 1, segs = 8) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, r, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A wash on a wall at (x, y, z), the wall's outward normal nh = [x, z]. */
  wall(x, y, z, nh, rw, rh, k = 0.6) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, 8, [0.9 * k, 0], [0, 1]); }
  /** A flat sheet of brightness f facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

/**
 * The halo of one real light { at: [x, y, z], distance, intensity, color }: the glow ball sized by its reach (an oil lamp's 4 m: 0.5 m; a mosque lamp's
 * 16 m: 1.4 m), the pool on the floor `fy` below it. A fire (an orange light) glows bigger and lower.
 */
export function lightHalo(H, l, fy) {
  const [x, y, z] = l.at, d = l.distance ?? 4, fire = (l.color || '').toLowerCase() === '#ff8a40';
  const r = Math.min(1.6, 0.34 + 0.07 * d) * (fire ? 1.25 : 1);
  H.ball(x, y, z, r, fire ? 0.7 : 0.62);
  const pool = Math.min(5, 1.0 + 0.3 * d), h = Math.max(0.1, y - fy);
  if (h < 12) H.floor(x, fy + 0.11, z, pool * (fire ? 0.8 : 0.9), 0.8 * (h > 4 ? 0.8 : 1), 10);
}

// ── the lit windows: a sheet of lamp-light before each latticed leaf of a lit room ─────────────────────────
/** The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab, at least 0.3 m wide and high. */
function slabsOf(g, thick = 0.6) {
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
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = 0.42 + 0.36 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}
const LIT = Symbol('lit windows');

/**
 * Wrap a builder context so that the lamps it lights and the latticed windows it makes glow at night: each `lattice` slab (a lit share of them, by the hash of
 * its room's cell) gets a pane of lamp-light on each face, each real light pushed into ctx.lights gets its halo. `floorOf(y)` gives the floor under a light at y.
 * Returns { ctx, finish } — call finish() once the element has been built.
 */
export function litCtx(ctx, { share = 0.4, floorOf = (y) => Math.max(0.03, y - 1.5) } = {}) {
  if (ctx.bag?.[LIT]) return { ctx, finish: () => {} };
  const H = new Halo(), real = ctx.bag, n0 = ctx.lights?.length ?? 0;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 6) * 4, Math.floor((b.z0 + b.z1) / 6) * 4, 11 + Math.floor((b.y0 + b.y1) / 5)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === LIT) return true;
      if (k === 'add') return (mat, g) => {
        if (mat === 'lattice' && g?.attributes?.position) for (const b of slabsOf(g)) if (lit(b)) panesOf(H, b, 0.03);
        return t.add(mat, g);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => { for (const l of (ctx.lights ?? []).slice(n0)) lightHalo(H, l, floorOf(l.at[1], l)); H.flush(real); } };
}

/** Wrap a style's element so that its lamps and windows glow at night: STYLES.timurid.elements[name]. `floor(el)` is the floor the element stands on. */
function wrapElement(name, o = {}) {
  const S = STYLES.timurid;
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => {
    const fl = o.floor ? o.floor(el) : 0, house = !!o.house;
    const L = litCtx(ctx, { share: o.share ?? 0.4, floorOf: (y) => (house ? Math.max(0.03, y - 1.5) : y - fl > 2.3 ? fl + 0.04 : Math.max(fl + 0.03, y - 1.5)) });
    base(el, L.ctx); L.finish();
    if (o.extra) o.extra(el, ctx);
  };
  f.__lit = true;
  S.elements[name] = f;
}

// ── the lamp in the niche by a house's street door ───────────────────────────────────────────────────────
/** The light of a clay oil lamp in a niche beside the street door of a rich house, and of one in three of the others: its glow, a wash on the wall, the pool on the lane (no lamp body: the flame sits in a niche, and a fine piece of a new material in every plan would be a draw of its own). */
function doorLamp(el, { bag }) {
  const h = el.h;
  if (!h || el.simple || h.garden || (!h.rich && hashAt(h.seed, 5, 41) > 0.34)) return;
  const G = houseGeom(h), side = hashAt(h.seed, 3, 7) < 0.5 ? -1 : 1, u = Math.max(-G.W / 2 + 3.2, Math.min(G.W / 2 - 3.2, h.xd)) + side * 1.45, v = G.D / 2;
  const p = G.toWorld(u, v), q = G.toWorld(u, v + 1), nx = q[0] - p[0], nz = q[1] - p[1];
  const H = new Halo(), y = 1.95;
  H.ball(p[0] + nx * 0.22, y + 0.1, p[1] + nz * 0.22, 0.55);
  H.floor(p[0] + nx * 1.1, 0.04, p[1] + nz * 1.1, 1.7, 0.7);
  H.wall(p[0] + nx * 0.03, y + 0.1, p[1] + nz * 0.03, [nx, nz], 0.9, 0.8, 0.5);
  H.flush(bag);
}

// ── the night of the square, the shop rows and the bazaar ───────────────────────────────────────────────
// (every piece of these is 0.4 m or more in its largest side, so that it joins the plan's main mesh of its material: a fine piece of a material not yet there
// would be a mesh, and a draw, of its own: dossier §20.1)
/** A brass lantern hung on a short chain at (x, y, z) (its hook): one bronze piece (chain, cap, a column inside the glass, the base), the 0.42 m body of glow-glass. */
function hungLantern(bag, x, y, z) {
  // (the shape varies by the hash of its own place, so that no twelve are alike and none is drawn instanced: a radius in four steps, six to nine sides)
  const k = 0.88 + 0.12 * Math.floor(hashAt(x, z, 61) * 4), n = 6 + Math.floor(hashAt(z, x, 62) * 4), w = (r, h) => [r * k, h];
  bag.add('bronze', lathe([[0.003, 0], [0.003, -0.16], [0.05 * k, -0.17], [0.12 * k, -0.24], [0.1 * k, -0.265], [0.012, -0.28], [0.012, -0.68], [0.09 * k, -0.69], [0.11 * k, -0.72], [0.001, -0.74]], n, null, x, y, z));
  bag.add('lamp_glass', lathe([w(0.1, -0.265), w(0.12, -0.34), w(0.12, -0.55), w(0.1, -0.69)], n, null, x, y, z));
}
/** An iron lamp stand 1.7 m tall (in bronze, the style's metal): three legs, a pole, a broad dish of oil (the flame is the halo's glow). */
function lampStand(bag, x, z, y0 = 0) {
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.4; bag.add('bronze', rod([x + Math.cos(a) * 0.3, y0, z + Math.sin(a) * 0.3], [x, y0 + 0.5, z], 0.014, 4)); }
  bag.add('bronze', rod([x, y0 + 0.45, z], [x, y0 + 1.62, z], 0.018, 5));
  bag.add('bronze', lathe([[0.001, 1.6], [0.08, 1.62], [0.2, 1.72], [0.22, 1.78], [0.19, 1.76], [0.001, 1.68]], 10, null, x, y0, z));
}
/** A fire basket 0.84 m across on its foot, one bronze piece. */
function fireBasket(bag, x, z) {
  bag.add('bronze', lathe([[0.001, 0], [0.14, 0], [0.06, 0.12], [0.05, 0.4], [0.3, 0.52], [0.42, 0.62], [0.4, 0.66], [0.34, 0.64], [0.2, 0.56], [0.001, 0.52]], 14, null, x, 0, z));
}

/** The places of the night's lamps on the square and along the shop rows and bazaar streets: { hang: [[x, y, z, nx, nz]], stands: [[x, z]], fire: [[x, z]], tray: [[x, y, z]] }. */
export function nightSpots() {
  const hang = [], stands = [], fire = [], tray = [];
  // the shop rows: a lantern hung from the lintel of about every third shop (the rest shut their fronts with the dusk), light spilling over the sill
  for (const [r, sg] of [[SHOPS_N, 1], [SHOPS_S, -1]]) {
    const nU = Math.max(1, Math.round((r[2] - r[0]) / 3.6)), w = (r[2] - r[0]) / nU, fz = sg > 0 ? r[3] : r[1];
    for (let i = 0; i < nU; i++) { const xc = r[0] + (i + 0.5) * w; if (hashAt(xc, fz, 17) < 0.36) hang.push([xc, 2.95, fz + sg * 0.6, 0, sg]); }
  }
  // the bazaar's streets: a lantern in every second bay's opening, toward the street's middle (the bays are 5 m: the vault's domes let a little sky in, not enough)
  for (const { a, b } of BAZAAR) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.max(1, Math.round(L / 5)), bw = L / n;
    for (let i = 0; i < n; i++) {
      if (i % 2) continue;
      const t = (i + 0.5) * bw, side = hashAt(a[0] + ux * t, a[1] + uz * t, 3) < 0.5 ? -1 : 1, px = a[0] + ux * t - uz * side * 1.55, pz = a[1] + uz * t + ux * side * 1.55;
      if (Math.hypot(px - CHORSU.c[0], pz - CHORSU.c[1]) < CHORSU.r + 3) continue;
      hang.push([px, 3.3, pz, uz * side, -ux * side]);
    }
  }
  // the iron stands before the pishtaq's apron (a lamp each side of the way in), two more where the aisle meets the shop rows
  for (const z of [-10.5, 10.5]) stands.push([-43.5, z]);
  for (const x of [-30, 30]) for (const z of [-20.5, 20.5]) stands.push([x, z]);
  // the watchmen's and cameleers' brazier at the caravan's camp on the east side, and one by the khanqah's portal
  fire.push([29, -14.5], [29, 5.5], [44.5, 11]);
  // the lamp on each tea-house platform's tray (the tray stands at the platform's middle, 0.66 m up)
  for (const [x, z] of TAPCHANS) tray.push([x, 0.66, z]);
  return { hang, stands, fire, tray };
}

/** tim_night: { part: 'square' | 'bazaar' } — the night lamps that stand in the open: hung lanterns, stands, braziers, tray lamps, each with its halo. */
function timNight(el, { bag, col }) {
  const S = nightSpots(), H = new Halo(), part = el.part;
  const inSq = (x, z) => inRect([SQUARE[0] - 3, SQUARE[1] - 12, SQUARE[2] + 3, SQUARE[3] + 12], x, z);
  for (const [x, y, z, nx, nz] of S.hang) {
    if ((part === 'square') !== inSq(x, z)) continue;
    hungLantern(bag, x, y, z);
    H.ball(x, y - 0.3, z, 0.72);
    H.floor(x + nx * 0.4, 0.04, z + nz * 0.4, 2.3, 0.7, 10);
    if (part === 'square') H.floor(x + nx * 2.2, 0.04, z + nz * 2.2, 2.0, 0.45, 8);
  }
  if (part !== 'square') { H.flush(bag); return; }
  for (const [x, z] of S.stands) { lampStand(bag, x, z); col?.circle(x, z, 0.3, 0, 1.8); H.ball(x, 2.0, z, 1.0, 0.66); H.floor(x, 0.04, z, 3.4, 0.8, 12); }
  for (const [x, z] of S.fire) { fireBasket(bag, x, z); col?.circle(x, z, 0.45, 0, 0.7); H.ball(x, 0.75, z, 1.1, 0.72); H.floor(x, 0.04, z, 3.0, 0.85, 12); }
  for (const [x, y, z] of S.tray) { H.ball(x + 0.1, y + 0.3, z + 0.18, 0.6); H.floor(x, 0.69, z, 1.8, 0.7, 10); }
  H.flush(bag);
}

let done = false;
/** Register the night's element and wrap the style's elements (idempotent; after the style's own registration). */
export function registerNight() {
  if (done) return; done = true;
  const S = STYLES.timurid;
  if (!S) return;
  S.elements.tim_night = timNight;
  for (const name of ['tim_madrasa', 'khanqah', 'shop_row', 'tim_tapchan', 'bibi_khanym', 'gur_e_amir', 'chorsu']) wrapElement(name, { share: name === 'tim_madrasa' ? 0.45 : 0.3 });
  wrapElement('observatory', { floor: (el) => el.y ?? 0, share: 0.3 });
  wrapElement('tim_house', { house: true, share: 0.4, extra: doorLamp });
  wrapElement('tim_garden', { house: true, share: 0.3 });
}
