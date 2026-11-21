// A Balinese temple village, c. 1900, by night — what lit the compounds, the street, the trades, the banjar's hall and the temple, and the light it throws
// (docs/settlements/bali-village.md §13.2). Lit by little oil lamps (*pelita*: a coconut-shell or clay bowl of coconut oil with a wick; *damar* resin torches (*obor*) at
// the temple's gates and the market of the festival), the hearths of the kitchens and the forge, a lamp in each sleeping house seen through its open door, a lamp at the
// gates and the family shrines, rows of pelita on the temple's steps for the festival [all inferred: ethnographic Bali; no source describes the light of this village].
// Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the day
// view is unchanged and the lamps read as lit at the low preset. Each piece's shape is carried by its normals (y: 1 at a disc's middle, 0 at its rim). The balinese style's
// elements are wrapped from here (the style files stay as they were); the method is that of the Suzhou reference, nothing of Suzhou's is imported. Each light is a function
// of its own place: no counters, no Math.random.
import '../../styles/balinese/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { compoundParts } from '../../styles/balinese/compound.js';

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
  /** A disc lying flat at height y (a floor or the ground), rx by rz across, k its strength. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { const j = 0.92 + 0.16 * hashAt(x, z, 17); this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r * j, rz * j, null, segs, [k, 0.42 * k, 0]); }   // (each a hair different in size, so the pieces merge rather than become shared copies)
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    const h = hashAt(x, z, 13); r *= 0.92 + 0.16 * h;
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37 + h, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit doorway) of brightness f, facing n = [x, z]. */
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
/** Wrap a bag: the `flame` pieces added through it (the forge's and the warung's hearths) are gathered, clustered within 0.4 m. */
function spy(real) {
  const F = new Map();
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'flame' && g?.attributes?.position) {
          const b = bounds(g), x = (b[0] + b[3]) / 2, y = (b[1] + b[4]) / 2, z = (b[2] + b[5]) / 2, key = Math.round(x / 0.4) + ',' + Math.round(y / 0.4) + ',' + Math.round(z / 0.4);
          const c = F.get(key) || F.set(key, { n: 0, x: 0, y: 0, z: 0 }).get(key);
          c.n++; c.x += x; c.y += y; c.z += z;
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { bag, flames: () => [...F.values()].map((c) => ({ n: c.n, at: [c.x / c.n, c.y / c.n, c.z / c.n] })) };
}
/** The glow of the flames gathered: a ball and a pool on the surface under a low fire (`floor`: the height of the floor the element stands on). */
function flameHalos(H, flames, floor) {
  for (const { n, at: [x, y, z] } of flames) {
    const r = Math.min(0.78, 0.35 + 0.07 * n) * (0.9 + 0.2 * hashAt(x, z, 3));
    H.ball(x, y + 0.06, z, r, 0.66);
    if (y - floor < 1.2) H.floor(x, floor + 0.04, z, 1.2 + 0.2 * n, 1.2 + 0.2 * n, 10, 0.6);
  }
}

/** Geometries (position and normal, not indexed) joined into one: a pole with its head is one piece, not a fine one. */
function joined(list) {
  const P = [], N = [];
  for (const g of list) { P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
  return g;
}

/** A pelita on the floor or a ledge at (x, y, z): its bowl (coconut shell, clay) and its glow; `k` the glow's reach. */
function pelita(H, bag, x, y, z, k = 1) {
  // the bowl stands on a little woven tray (one piece with it: a bowl alone would be a fine piece of its own)
  const q = hashAt(x, z, 19), a = 0.2 + 0.07 * q, b = 0.2 + 0.07 * hashAt(x, z, 23), r = 0.05 + 0.02 * q;
  bag.add('wicker', joined([box(x - a, y, z - b, x + a, y + 0.025, z + b), lathe([[0.001, 0], [r * 0.75, 0.004], [r, 0.03], [r * 0.85, 0.05], [0.001, 0.05]], 8, null, x, y + 0.025, z)]));
  H.ball(x, y + 0.1, z, 0.12 * k, 1.0); H.ball(x, y + 0.13, z, 0.42 * k, 0.6); H.floor(x, y + 0.06, z, 0.9 * k, 0.9 * k, 8, 0.42);
}

// ── the compounds: wrap bali_compound (it calls its own sleeping house, kitchen, stall and gate directly) ──────────────────────────────────────────────────────────
/** The compound's frame, as compound.js builds it (canonical u from the sanggah's side). */
function frameOf(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front, alongX = f === 'n' || f === 's', W = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const cL = P(0, D), cR = P(W, D), left = cL[0] - cL[1] >= cR[0] - cR[1];
  return { P, W, D, alongX, M: (u) => (left ? u : W - u), out: { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f] };
}

let depth = 0;
function lit(name, fn) {
  return function haloed(el, ctx) {
    if (depth > 0) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
    const H = new Halo(), S = spy(ctx.bag), y = el.y ?? 0;
    depth++;
    let r;
    try { r = fn.call(this, el, { ...ctx, bag: S.bag }); } finally { depth--; }
    flameHalos(H, S.flames(), y + 0.3);
    if (name === 'bali_compound') compoundLights(H, ctx.bag, el);
    H.flush(ctx.bag);
    return r;
  };
}

function compoundLights(H, bag, el) {
  const y = el.y ?? 0, { P, W, D, alongX, M, out } = frameOf(el), parts = compoundParts(el), gateU = W * (el.gateF ?? 0.5);
  const [ox, oz] = out, along = alongX ? [1, 0] : [0, 1];
  const R = (u0, v0, u1, v1) => { const a = P(M(u0), v0), b = P(M(u1), v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const rich = el.rich !== false;
  // the lamp at the gate: a little stone niche on the left pier's street face, with its pelita
  {
    const g = P(gateU, 0.25), px = g[0] + ox * 0.5 - along[0] * 1.55, pz = g[1] + oz * 0.5 - along[1] * 1.55;
    if (hashAt(px, pz, 1) < 0.8) {
      bag.add('tuff_hewn', box(px - 0.12, y + 1.42, pz - 0.12, px + 0.12, y + 1.5, pz + 0.12));
      pelita(H, bag, px, y + 1.5, pz, 0.8);
      H.floor(g[0] + ox * 1.6, y + 0.04, g[1] + oz * 1.6, 2.2, 2.2, 8, 0.38);
    }
  }
  // the sleeping house: a lamp inside seen through the open door: a sheet of light in the doorway, its pool over the veranda and on the ground
  if (parts.house && hashAt(el.rect[0], el.rect[1], 2) < 0.7) {
    const [x0, z0, x1, z1] = parts.house.rect, d = parts.house.door, f = y + 0.45, t = 0.3, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const xi0 = x0 + t, xi1 = x1 - t, zi0 = z0 + t, zi1 = z1 - t, Pi = (lu, lv) => (d === 'n' ? [xi0 + lu, zi1 - lv] : d === 's' ? [xi1 - lu, zi0 + lv] : d === 'e' ? [xi0 + lv, zi1 - lu] : [xi1 - lv, zi0 + lu]);
    const lp = Pi(0.9, 0.15), n = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[d], tg = [-n[1], n[0]];
    H.ball(lp[0], f + 1.25, lp[1], 0.5, 0.62); H.floor(cx, f + 0.04, cz, 1.9, 1.5, 10, 0.5);
    const dp = d === 's' ? [cx, z1] : d === 'n' ? [cx, z0] : d === 'e' ? [x1, cz] : [x0, cz], e = 0.02, w = 0.75;
    const a = [dp[0] + n[0] * e - tg[0] * w, dp[1] + n[1] * e - tg[1] * w], b = [dp[0] + n[0] * e + tg[0] * w, dp[1] + n[1] * e + tg[1] * w];
    H.quad([a[0], f + 0.05, a[1]], [b[0], f + 0.05, b[1]], [b[0], f + 1.95, b[1]], [a[0], f + 1.95, a[1]], n, 0.5);
    H.floor(dp[0] + n[0] * 0.9, f + 0.04, dp[1] + n[1] * 0.9, 1.4, 1.1, 8, 0.45); H.floor(dp[0] + n[0] * 2.8, y + 0.04, dp[1] + n[1] * 2.8, 2.0, 2.0, 8, 0.32);
  }
  // the kitchen's hearth: three stones with a fire, a glow in the thatch above, a pool on the floor
  {
    const pr = R(0.9, 3.4, 4.7, 6.6), cx = (pr[0] + pr[2]) / 2, cz = (pr[1] + pr[3]) / 2, f = y + 0.35;
    if (hashAt(cx, cz, 4) < 0.85) { H.ball(cx, f + 0.55, cz, 0.62, 0.64); H.floor(cx, f + 0.04, cz, 1.6, 1.4, 10, 0.58); H.ball(cx, f + 1.5, cz, 0.9, 0.3); }
  }
  // the family shrine's pelita before the rong tiga, in the north-east yard
  {
    const D2 = D, sv1 = D2 - 0.6, a = P(M(0.6 + 3.5), sv1 - 2.2);
    if (hashAt(a[0], a[1], 5) < 0.8) pelita(H, bag, a[0], y + 0.02, a[1], 0.9);
  }
  // a stall's lamp, hung over the aisle (on its cord from the front beam), its pool on the floor and out on the street
  if (el.shop) {
    const { u0, u1, d } = el.shop, um = (u0 + u1) / 2, fl = y + 0.3, p = P(um + 0.3, 1.0), q = P(um, -1.5);
    if (hashAt(p[0], p[1], 6) < 0.9) {
      bag.add('wood_dark', box(p[0] - 0.008, fl + 2.0, p[1] - 0.008, p[0] + 0.008, fl + 2.2, p[1] + 0.008));
      bag.add('wood_dark', lathe([[0.001, 0], [0.05, 0.01], [0.075, 0.07], [0.05, 0.14], [0.001, 0.15]], 8, null, p[0], fl + 1.85, p[1]));
      H.ball(p[0], fl + 1.97, p[1], 0.14, 1.0); H.ball(p[0], fl + 1.97, p[1], 0.7, 0.62);
      H.floor(p[0], fl + 0.04, p[1], 2.2, 1.6, 10, 0.55); H.floor(q[0], y + 0.04, q[1], 2.6, 1.9, 8, 0.42);
    }
    void d;
  }
  // the street-side pavilion's pelita on its mat
  if (parts.pav) {
    const [x0, z0, x1, z1] = parts.pav.rect;
    if (hashAt(x0, z0, 7) < 0.8) pelita(H, bag, (x0 + x1) / 2, y + 0.5, (z0 + z1) / 2, 0.9);
  }
  void rich;
}

// ── a lamp stand and the torch (new elements) ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** bali_obor: { at: [x, z], y?, h?, seed? } — the resin torch of the festival: a bamboo pole with a head of damar-soaked fibre bound to it, the flame as a glow; its pool on the ground. */
function obor({ at, y = 0, h = 2.2, seed = 0 }, { bag, col }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 21 + seed), hh = h * (0.94 + 0.1 * q), lean = (q - 0.5) * 0.06;
  bag.add('timber', joined([box(x - 0.035 + lean, y, z - 0.035, x + 0.035 + lean, y + hh, z + 0.035),
    lathe([[0.001, 0], [0.07, 0.01], [0.085, 0.08], [0.075, 0.16], [0.045, 0.2], [0.001, 0.2]], 8, null, x + lean, y + hh - 0.08, z)]));
  col.circle(x, z, 0.12, y, y + hh);
  H.ball(x + lean, y + hh + 0.14, z, 0.2, 1.0);
  H.ball(x + lean, y + hh + 0.2, z, 0.95 + 0.15 * q, 0.7); H.floor(x, y + 0.04, z, 2.8 + 0.5 * q, 2.8 + 0.5 * q, 10, 0.6);
  H.flush(bag);
}
/** bali_stand: { at: [x, z], y?, h? } — a pelita on a bamboo stand (a pole with a shelf and its bowl), for a hall or a pavilion's corner. */
function stand({ at, y = 0, h = 1.5 }, { bag, col }) {
  const [x, z] = at, H = new Halo();
  bag.add('timber', joined([box(x - 0.03, y, z - 0.03, x + 0.03, y + h, z + 0.03), box(x - 0.1, y + h, z - 0.1, x + 0.1, y + h + 0.02, z + 0.1)]));
  col.circle(x, z, 0.1, y, y + h);
  pelita(H, bag, x, y + h + 0.02, z, 1.15);
  H.floor(x, y + 0.04, z, 2.2, 2.2, 10, 0.4);
  H.flush(bag);
}
/** bali_pelita_row: { list: [[x, y, z], ...] } — a row of pelita set on the steps and ledges, as for the festival. */
function pelitaRow({ list }, { bag }) {
  const H = new Halo();
  for (const [x, y, z] of list) pelita(H, bag, x, y, z, 0.9);
  H.flush(bag);
}

// ── the open halls, the temple's pavilions and shrines: a stand at the corners, a pelita on the offering step ─────────────────────────────────────────────────────────
function hallLit(name, fn) {
  return function haloed(el, ctx) {
    const r = fn.call(this, el, ctx);
    if (!el.rect) return r;
    const [x0, z0, x1, z1] = el.rect, f = (el.y ?? 0) + (el.floor ?? (name === 'bali_wantilan' ? 0.5 : 0.6)), w = x1 - x0, d = z1 - z0;
    if (w < 6 || d < 4) { const H = new Halo(); if (hashAt(x0, z0, 8) < 0.7) pelita(H, ctx.bag, (x0 + x1) / 2, f, (z0 + z1) / 2, 0.9); H.flush(ctx.bag); return r; }
    const H = new Halo();
    // the big halls: a stand at each of the four inner corners, a row of pelita along the front
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) if (hashAt(x0 + sx, z0 + sz, 9) < 0.9) stand({ at: [sx > 0 ? x0 + 1.0 : x1 - 1.0, sz > 0 ? z0 + 1.0 : z1 - 1.0], y: f }, { bag: ctx.bag, col: ctx.col });
    H.ball((x0 + x1) / 2, f + 1.6, (z0 + z1) / 2, 2.0, 0.34);          // the hall's lamps together: a glow under the roof
    H.floor((x0 + x1) / 2, f + 0.04, (z0 + z1) / 2, w * 0.45, d * 0.45, 12, 0.45);
    H.flush(ctx.bag);
    return r;
  };
}

/** The dalem is turned: local (dx, dz) is world (cx − dz, cz + dx). Torches at its split gate and pelita before the gedong. */
function dalemLit(fn) {
  return function haloed(el, ctx) {
    const r = fn.call(this, el, ctx);
    const [cx, cz] = el.c, y = el.y ?? 0, W2 = (dx, dz) => [cx - dz, cz + dx], H = new Halo();
    for (const dx of [-3.2, 3.2]) obor({ at: W2(dx, 12.6 - 1.0), y, h: 2.0, seed: 3 }, ctx);
    for (const [dx, dz] of [[-0.8, -8.6], [0.8, -8.6], [-5.4, -4.4], [5.6, -9.6]]) { const p = W2(dx, dz); pelita(H, ctx.bag, p[0], y + 0.4 + 0.02, p[1], 0.9); }
    H.flush(ctx.bag);
    return r;
  };
}

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.balinese.elements;
  E.bali_compound = lit('bali_compound', E.bali_compound);
  E.bali_wantilan = hallLit('bali_wantilan', E.bali_wantilan);
  E.bali_bale = hallLit('bali_bale', E.bali_bale);
  E.bali_dalem = dalemLit(E.bali_dalem);
  E.bali_obor = obor; E.bali_stand = stand; E.bali_pelita_row = pelitaRow;
}
registerNight();
