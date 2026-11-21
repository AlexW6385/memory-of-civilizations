// Karakorum, 1254, by night — what lit the town and the court, and the light it throws (docs/settlements/mongol-karakorum.md §14.2).
// What burned at night here: the hearth of every ger, fed with dung cakes and sheep's fat, its glow seen from outside at the crown ring and under the door-flap
// (Rubruck's gers all have a fire in the middle under the smoke-ring); lamps of tallow or oil in the shops, the mosques and the temples (the idol temples' butter and oil
// lamps, the mosques' brass lamps, the Nestorian altar's candles: the dossier's furnishing); the kilns, which are fired for days together, and the forges' embers; the guards'
// watch fires at the gate of the palace and the braziers at the town's four gates [all inferred: no source says what stood at the gates by night]; the paper lanterns of
// the Chinese rows and of the flagged way to the hall (the dossier's lanterns, §3b and the court).
// Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the
// day view is unchanged and the glow shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each
// flame (three crossed discs), a pool on the floor, a pane before a lit window. Every element of the mongol style that puts a light into its plan is wrapped here (the
// style files stay as they were); each light is a function of its own place (no counters, no Math.random). The method is that of the Suzhou reference, written for
// Karakorum's lamps; nothing of Suzhou's is imported.
import '../../styles/mongol/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { GATE_W, WALL, WALL_TH, PALACE_GATE, BANNERS } from './layout.js';

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
  /** A flat sheet (a lit window) of brightness f, facing n = [x, z]. */
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
  H.ball(x, y, z, Math.max(0.42, Math.min(1.1, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.075, z, Math.max(1.3, Math.min(3.6, d * 0.42)), Math.max(1.3, Math.min(3.6, d * 0.42)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/** The middle of an element's footprint, for telling the outer face of a wall from the inner one. */
function centreOf(el) {
  if (el.rect) return [(el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2];
  if (el.t === 'shop_row') {
    const w = 3.6, d = el.d ?? 5, n = el.n ?? 4, ns = el.face === 'n' || el.face === 's';
    return ns ? [el.a[0] + n * w / 2, el.a[1] + d / 2] : [el.a[0] + d / 2, el.a[1] + n * w / 2];
  }
  if (el.t === 'palace_hall') return [el.c[0], el.c[1] - 16.8];
  return el.c;
}

/**
 * Wrap an element's bag so that its latticed windows (a slab under 0.08 m thick in a wall's plane, 0.5–2.5 m high, over 0.5 m wide, of lattice or red lattice) glow with the lamp
 * behind them in `share` of the cases (by the hash of the window's own place: tallow is dear), on the outward face only. Returns { ctx, H }.
 */
function litWindows(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, [cx, cz] = centreOf(el);
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if ((mat === 'lattice' || mat === 'lattice_red') && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.08 && dy > 0.5 && dy < 2.5 && w > 0.5 && w < 2.6) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 31 + Math.floor(b[1] / 2.5)) < share) {
              const f = 0.45 + 0.35 * hashAt(mx, mz, 7), m = 0.04, o = 0.012;
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

/** How much of its windows an element's lamps light, by kind of building (the ger has windows of none: its lattice is a wall). */
const WINDOWS = { mud_compound: 0.42, mosque: 0.5, tile_hall: 0.6, great_hall: 1, palace_hall: 0.8, shop_row: 0.55 };

/** The glow of the hearth of a ger through its crown ring and the spill of its door: lit gers by the hash of their place (a fire is kept in most). */
function gerGlow(H, el) {
  const [cx, cz] = el.c, r = el.r ?? 3.2, y = el.y ?? 0, open = !!el.open, cart = !!el.cart, da = el.door ?? Math.PI / 2;
  if (!open && hashAt(cx, cz, 3) > 0.78) return;                       // the fire out: a ger asleep
  const wh = open ? 2.05 : (r > 3.6 ? 1.6 : 1.4), rise = r * 0.3 + 0.5, Y = cart ? y + 1.32 : y, top = Y + wh + rise;
  H.ball(cx, top + 0.15, cz, 1.0 + 0.25 * hashAt(cx, cz, 4), 0.55);      // the glow and the lit smoke over the ring
  if (!cart) H.floor(cx + Math.cos(da) * (r + 1.25), y + 0.03, cz + Math.sin(da) * (r + 1.25), 1.6 + 0.5 * hashAt(cx, cz, 5), 1.3, 8, 0.6);   // the light under the door-flap
  else H.floor(cx + Math.cos(da) * (r + 0.6), y + 0.03, cz + Math.sin(da) * (r + 0.6), 1.4, 1.2, 8, 0.45);
}

/** The shop rows' paper lanterns (one at every bay, hung from the front beam: shops.js) glow, with a little light on the street before the bay. */
function rowLanterns(el, ctx) {
  const H = new Halo(), w = 3.6, d = el.d ?? 5, n = el.n ?? 4, face = el.face ?? 's';
  // the frame of the row's front (as styles/mongol/local.js frontFrame): O the corner at the front, U along it, V out of it
  const r0 = face === 's' || face === 'n' ? [el.a[0], el.a[1], el.a[0] + n * w, el.a[1] + d] : [el.a[0], el.a[1], el.a[0] + d, el.a[1] + n * w];
  const [x0, z0, x1, z1] = r0, F = face === 's' ? { O: [x0, z1], U: [1, 0], V: [0, 1] } : face === 'n' ? { O: [x0, z0], U: [1, 0], V: [0, -1] } : face === 'e' ? { O: [x1, z0], U: [0, 1], V: [1, 0] } : { O: [x0, z0], U: [0, 1], V: [-1, 0] };
  const P = (u, v) => [F.O[0] + F.U[0] * u + F.V[0] * v, F.O[1] + F.U[1] * u + F.V[1] * v];
  for (let i = 0; i < n; i++) {
    const [px, pz] = P(i * w + 1.8 + (hashAt(el.a[0] + i, el.a[1], 9) < 0.5 ? 1 : -1) * 1.15, 0.3);
    if (hashAt(px, pz, 11) < 0.82) { H.ball(px, 2.05, pz, 0.5, 0.55); const [fx, fz] = P(i * w + 1.8, 2.4); H.floor(fx, 0.03, fz, 1.5, 1.2, 8, 0.3); }
  }
  H.flush(ctx.bag);
}

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, its lit windows, and the glow of the fires the style does not light (gers, kilns, the church's candles, the gate). */
const wrap = (name, fn, after) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const share = WINDOWS[name], L = share ? litWindows(ctx, el, share) : null;
  depth++;
  try { var r = fn.call(this, el, L ? L.ctx : ctx); } finally { depth--; }
  const H = L ? L.H : new Halo(), floor = el.y ?? 0;
  for (const l of lights.slice(n)) lightHalo(H, l, floor);
  after?.(H, el, ctx);
  H.flush(ctx.bag);
  return r;
};

const AFTER = {
  ger: (H, el) => gerGlow(H, el),
  shop_row: (H, el, ctx) => rowLanterns(el, ctx),
  kiln: (H, el) => {
    // a kiln is fired for days together: the glow at its stoke-hole and over its vent, the pool on the ground before it
    const [x, z] = el.at, y = el.y ?? 0, rr = el.r ?? 2.1, yaw = el.yaw ?? 0, s = Math.sin(yaw), c = Math.cos(yaw), sx = x + s * (rr + 0.5), sz = z + c * (rr + 0.5);
    H.ball(sx, y + 0.45, sz, 0.9, 0.7); H.floor(sx, y + 0.03, sz, 2.6, 2.2, 10, 0.8); H.ball(x, y + 3.15, z, 0.9, 0.45);
  },
  church: (H, el) => {
    const [x0, z0, x1, z1] = el.rect, cz = (z0 + z1) / 2;
    for (const dz of [-0.6, 0.6]) H.ball(x1 - 1.5, 1.28, cz + dz, 0.38, 0.6);     // the candles on the altar [inferred]
    H.floor(x1 - 2.2, 0.06, cz, 1.7, 1.4, 8, 0.45); void x0; void z0;
  },
  gate_hall: (H, el) => {
    // the guards' watch fire before each side of the palace's gate hall and the light of its passage [inferred]
    const [cx, zc] = el.c, Y = el.y ?? 0.9;
    for (const sd of [-1, 1]) { H.ball(cx + sd * 6.2, Y + 0.95, zc + 5.6, 0.9, 0.7); H.floor(cx + sd * 6.2, 0.04, zc + 5.6, 2.8, 2.4, 10, 0.7); }
    H.floor(cx, Y + 0.08, zc, 2.6, 2.4, 10, 0.4);
  },
};

/**
 * kk_brazier: { at: [x, z], y?, r? } — an iron basket on three legs with burning dung and wood in it (the watch fire at a gate [inferred]): the legs, the basket, the flame, its glow
 * and the pool of light on the ground round it; a collider so that nobody walks into it.
 */
function brazier({ at, y = 0, r = 0.34 }, { bag, col }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = 0.92 + 0.16 * q;
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + q * 2; bag.add('iron', rod([x + Math.cos(a) * r * 0.9, y, z + Math.sin(a) * r * 0.9], [x + Math.cos(a) * r * 0.45, y + 0.78 * s, z + Math.sin(a) * r * 0.45], 0.022, 5)); }
  bag.add('iron', lathe([[0.001, 0], [r * 0.5, 0.01], [r, 0.2 * s], [r * 1.06, 0.3 * s], [r * 0.96, 0.3 * s], [r * 0.9, 0.2 * s], [0.001, 0.05]], 10, null, x, y + 0.72 * s, z));
  bag.add('flame', lathe([[r * 0.7, 0], [r * 0.55, 0.14], [r * 0.25, 0.4], [0.001, 0.58 + 0.1 * q]], 8, (th) => 1 + 0.25 * Math.sin(th * 3 + q * 6), x, y + 1.0 * s, z));
  col.circle(x, z, r * 1.1, y, y + 1.05 * s);
  H.ball(x, y + 1.35 * s, z, 0.95, 0.7); H.floor(x, y + 0.03, z, 3.0, 2.6, 10, 0.75);
  H.flush(bag);
}

/**
 * kk_nightfire: { box: [x0, z0, x1, z1], spots: [[x, y, z, r, k, pool?], …] } — glows that belong to no building of the style: the lanterns on posts along the flagged way to the
 * hall, the guards' fire at the gate. `box` (not `rect`: a helper with a rect is read as a house and gets street life round it).
 */
function nightfire({ spots }, { bag }) {
  const H = new Halo();
  for (const [x, y, z, r, k, pool] of spots) { H.ball(x, y, z, r, k ?? 0.6); if (pool) H.floor(x, 0.04, z, pool, pool * 0.9, 8, 0.55); }
  H.flush(bag);
}

/** The elements the town plan adds for the night: braziers at the four gates, the guards' fire at the palace, the lanterns on the flagged way (town.js's `lantern` posts). */
export function nightElements() {
  const E = [], [w0, n0, e0, s0] = WALL, off = GATE_W / 2 + 2.2, ins = WALL_TH / 2 + 1.6;
  // the braziers stand just inside each gate, either side of the way through
  E.push({ t: 'kk_brazier', at: [-off, n0 + ins] }, { t: 'kk_brazier', at: [off, n0 + ins] }, { t: 'kk_brazier', at: [-off, s0 - ins] }, { t: 'kk_brazier', at: [off, s0 - ins] });
  E.push({ t: 'kk_brazier', at: [w0 + ins, -off] }, { t: 'kk_brazier', at: [w0 + ins, off] }, { t: 'kk_brazier', at: [e0 - ins, -off] }, { t: 'kk_brazier', at: [e0 - ins, off] });
  const spots = [];
  for (const z of [-17, -24, -31, -37]) for (const sd of [-1, 1]) spots.push([70 + sd * 4.7, 2.5, z, 0.55, 0.6, 1.8]);                    // the paper lanterns of the way to the hall
  for (const [x, z] of [[63.4, -6.4], [76.6, -6.4]]) spots.push([x + (x < 70 ? -1.2 : 1.2), PALACE_GATE.y + 0.5, z + 0.6, 1.0, 0.7, 2.8]);          // the gate guards' firewood, lit
  for (const [x, z] of BANNERS) spots.push([x, 1.2, z + 1.6, 0.5, 0.4, 1.4]);                                                                      // a small fire at each standard's foot (the standards keep a watch) [inferred]
  E.push({ t: 'kk_nightfire', box: [50, -40, 90, -4], spots });
  return E;
}

let done = false;
/** Wraps the mongol style's elements that make lights (once, after the style has registered them). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.mongol.elements;
  for (const k of ['ger', 'palace_hall', 'tile_hall', 'great_hall', 'forge', 'mosque', 'mud_compound', 'church', 'gate_hall', 'kiln', 'shop_row']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k], AFTER[k]);
  E.kk_brazier = brazier; E.kk_nightfire = nightfire;
}
registerNight();
