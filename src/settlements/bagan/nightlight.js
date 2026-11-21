// Pagan c. 1200 by night — what lit the city and the temples, and the light it throws (docs/settlements/bagan.md §15.2).
// What there was to see by: the sesame- or peanut-oil lamp of clay or bronze in the house and the shop, a hanging lamp from the tie beam; the hearth's embers; the oil lamps
// before the images and the lamp pillars of the precincts; the torches and fire-baskets at the gates; the fishermen's lamps on the river. No glass, no street lamps, no wax
// candles in lanterns as the Chinese had them: the glow in a doorway, the lit slit of a shutter, the pool of a lamp on the beaten sand [inferred throughout; see the dossier].
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no
// collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. The shape of each piece is carried by its normals (y: 1 at a
// disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the ground, and a pane before a lit doorway or window. Every element of the burmese
// style that puts a light into its plan is wrapped here (the style files keep their own work), the houses' shutter openings glow by the hash of their own place, and the new
// torches are `bgn_torch` elements. Each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou reference, written for
// Pagan's lamps; nothing of Suzhou's is imported.

import '../../styles/burmese/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { rng } from '../../styles/burmese/kit.js';
import { houseSpots, lotFrame } from '../../styles/burmese/houses.js';

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
  /** A flat sheet (a lit doorway or window) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); a pool on the ground only where `floor` is given (outdoors: indoors a pool would poke through the walls). */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.0, d * 0.4)), Math.max(1.3, Math.min(3.0, d * 0.4)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * Wrap a house's bag so that its shutter openings (the dark slab under a propped shutter: `wood_dark`, under 0.05 m thick, 0.5–1.3 m high, in a wall's plane) glow with the lamp
 * behind them in `share` of the cases (by the hash of the window's own place: oil is dear), on the outward face only. Returns { ctx, H }.
 */
function litWindows(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'wood_dark' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.05 && dy > 0.5 && dy < 1.3 && w > 0.3 && b[1] > 1.8) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 41) < share) {
              const f = 0.4 + 0.35 * hashAt(mx, mz, 7), m = 0.04, o = 0.012;
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

/** The lit doorway of a house (the lamp inside seen through the door ajar), the embers of the hearth, and the spill of the lamp over the stair's foot onto the beaten sand. */
function houseGlow(H, sp) {
  const { F, fl, du, v0, big, u0, u1 } = sp, dh = 0.45;
  const [dx, dz] = F.pt(du, v0 - 0.02), fx = -F.V[0], fz = -F.V[1];                    // the door's centre on the front face, and the way it faces (out of the lot)
  const y0 = fl + 0.06, y1 = fl + 1.7, f = 0.5 + 0.2 * hashAt(dx, dz, 3);
  if (Math.abs(fz) > 0.5) H.quad([dx - dh, y0, dz], [dx + dh, y0, dz], [dx + dh, y1, dz], [dx - dh, y1, dz], [0, Math.sign(fz)], f);
  else H.quad([dx, y0, dz - dh], [dx, y0, dz + dh], [dx, y1, dz + dh], [dx, y1, dz - dh], [Math.sign(fx), 0], f);
  const [hx, hz] = sp.hearth;
  H.ball(hx, fl + 0.5, hz, 0.34, 0.42);                                                  // the embers
  const [px, pz] = F.pt(big ? (u0 + u1) / 2 + 1.95 : du, v0 - (big ? 3.4 : 3.3));
  H.floor(px, 0.05, pz, 1.9, 1.5, 10, 0.5);
}

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, the lit windows and doorway of a house, the glow of a shop front, a stall's lamp, a boat's lamp. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const house = name === 'bgn_house', L = house ? litWindows(ctx, el, 0.4) : null;
  depth++;
  try { var r = fn.call(this, el, L ? L.ctx : ctx); } finally { depth--; }
  const H = L ? L.H : new Halo();
  for (const l of lights.slice(n)) lightHalo(H, l, undefined);
  if (house) { const sp = houseSpots(el); if (sp) houseGlow(H, sp); }
  else if (name === 'bgn_shop') {
    // the shop's front lit by its lamp and the counter's: the pool of light over the step and the road's edge, a glow at the counter
    const F = lotFrame({}, el.rect, el.front), W = F.W, [px, pz] = F.pt(W / 2 + (hashAt(el.rect[0], el.rect[1], 5) - 0.5) * 2, -1.5);
    H.floor(px, 0.05, pz, Math.min(4.2, W * 0.36), 2.8, 10, 0.95);
    const [cx, cz] = F.pt(W / 2, 0.2); H.ball(cx, 0.55 + 1.7, cz, 0.8, 0.7);
    // the lit room seen through the open front: a pane of lamplight behind the counter, and a hanging lamp under the eave at each end of the front
    const nn = [-F.V[0], -F.V[1]], q0 = F.pt(W * 0.14, 0.35), q1 = F.pt(W * 0.86, 0.35);
    H.quad([q0[0], 1.0, q0[1]], [q1[0], 1.0, q1[1]], [q1[0], 2.1, q1[1]], [q0[0], 2.1, q0[1]], nn, 0.38);
    for (const u of [0.9, W - 0.9]) { const [ex, ez] = F.pt(u, -0.6); H.ball(ex, 2.35, ez, 0.42, 0.6); }
  } else if (name === 'bgn_stall') {
    // the candle-seller's lamp on the counter and its pool
    const rot = el.rot ?? 0, [x, z] = el.c, vx = Math.sin(rot), vz = Math.cos(rot), y = el.y ?? 0;
    H.ball(x + vx * 0.95, y + 1.15, z + vz * 0.95, 0.45, 0.55); H.floor(x + vx * 1.8, y + 0.05, z + vz * 1.8, 1.7, 1.3, 8, 0.55);
  } else if (name === 'bgn_boat') {
    // the fisherman's lamp at the stern, in seven boats of ten
    if (hashAt(el.at[0], el.at[1], 9) < 0.7) { const c = Math.cos(el.yaw ?? 0), s = Math.sin(el.yaw ?? 0), q = (el.len ?? 10) / 2 - 1.3; H.ball(el.at[0] - s * q, (el.y ?? 0) + 1.3, el.at[1] + c * q, 0.4, 0.5); }
  }
  H.flush(ctx.bag);
  return r;
};

/** The oil lamps and candles of the generic props (lamp pillars, offering tables, wayside shrines, spirit houses): the glow of each where the style puts its flame. */
function propLights(items) {
  const H = new Halo();
  for (const it of items) {
    const rot = it.rot ?? 0, [x, z] = it.c, ux = Math.cos(rot), uz = -Math.sin(rot), vx = Math.sin(rot), vz = Math.cos(rot), y = it.y ?? 0;
    const at = (u, v) => [x + ux * u + vx * v, z + uz * u + vz * v];
    if (it.k === 'lamp') {
      const h = 1.7 + rng(it.seed ?? 1)() * 0.4, [px, pz] = at(0, -0.3);
      H.ball(px, y + h - 0.35, pz, 0.5, 0.62); H.floor(px, y + 0.04, pz, 2.2, 2.2, 10, 0.7);
    } else if (it.k === 'offering') {
      const w = it.w ?? 1.4, [px, pz] = at(w / 2 - 0.15, -0.15);
      H.ball(px, y + 0.9, pz, 0.38, 0.5);
    } else if (it.k === 'shrine') {
      const [px, pz] = at(0, 0.95);
      H.ball(px, y + 0.7, pz, 0.34, 0.45);
    } else if (it.k === 'spirit' && hashAt(x, z, 12) < 0.6) {
      const [px, pz] = at(0.2, 0.38);
      H.ball(px, y + 1.75, pz, 0.28, 0.42);
    }
  }
  return H;
}

/**
 * bgn_torch: { c: [x, z], y?, h? } — a torch stand of the gates: a post of teak 2.1 m high with an iron basket holding a bundle of resin-soaked reeds, burning (a flame, its glow and its pool on the
 * sand). [inferred: the Burmese gate's night guard keeps a fire; the form is a cresset on a post]
 */
function torch({ c, y = 0, h = 2.1 }, { bag, col }) {
  const [x, z] = c, H = new Halo(), q = hashAt(x, z, 5), s = h / 2.1 * (0.96 + 0.08 * q);
  bag.add('timber', lathe([[0.001, 0], [0.09, 0], [0.07, 0.15], [0.05, 0.6], [0.05, 1.7 * s], [0.07, 1.82 * s], [0.001, 1.82 * s]], 8, null, x, y, z));
  bag.add('iron', lathe([[0.001, 1.78 * s], [0.1, 1.82 * s], [0.2, 1.98 * s], [0.22, 2.04 * s], [0.18, 2.04 * s], [0.12, 1.9 * s], [0.001, 1.86 * s]], 10, null, x, y, z));
  bag.add('flame', lathe([[0.001, 2.0 * s], [0.09 * (0.9 + 0.2 * q), 2.04 * s], [0.12, 2.2 * s], [0.06, 2.42 * s], [0.001, (2.55 + 0.1 * q) * s]], 7, null, x, y, z));
  col.circle(x, z, 0.12, y, y + 2.1);
  H.ball(x, y + 2.2 * s, z, 0.62, 0.66); H.floor(x, y + 0.04, z, 2.6, 2.6, 10, 0.75);
  H.flush(bag);
}

/** The gates that keep a torch either side: [x, z, outward direction ('n' | 's' | 'e' | 'w')]. The Ananda's four, the Tharabar Gate, the other courts'. Pure data. */
export const GATES = {
  ananda: [[105, -95, 'n'], [105, 95, 's'], [15, 0, 'w'], [195, 0, 'e']],
  tharabar: [[-100, 0, 'e']],
  courts: [[140, -148, 'n'], [98, -190, 'w'], [155, 160, 'n'], [112, 198, 'w'], [-198, 30, 'n'], [-146, 82, 'e'], [-198, -30, 's']],
};
const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** The torch stands of a list of gates: the stand either side of the way, 3.2 m off its axis and 2.2 m out from the wall's face. */
export function torchEls(list) {
  const E = [];
  for (const [x, z, d] of list) {
    const [ox, oz] = OUT[d], lx = -oz, lz = ox;
    for (const sd of [-1, 1]) E.push({ t: 'bgn_torch', c: [Math.round((x + ox * 2.2 + lx * sd * 3.2) * 10) / 10, Math.round((z + oz * 2.2 + lz * sd * 3.2) * 10) / 10] });
  }
  return E;
}

let done = false;
/** Wraps the burmese style's elements that make lights (once, after the style has registered). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.burmese.elements;
  for (const k of ['bgn_ananda', 'bgn_tower', 'bgn_cella', 'bgn_house', 'bgn_shop', 'bgn_library', 'bgn_kyaung', 'bgn_okkyaung', 'bgn_stall', 'bgn_boat', 'bgn_zayat']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  const props = E.bgn_props;
  E.bgn_props = function lit(el, ctx) {
    props.call(this, el, ctx);
    if (ctx?.lights && !el.simple) propLights(el.items).flush(ctx.bag);
  };
  E.bgn_torch = torch;
}
registerNight();
