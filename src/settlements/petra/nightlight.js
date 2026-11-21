// Petra, about AD 50, by night — what was lit and the light it threw (docs/settlements/petra.md §24).
// The lights of the time are oil lamps (the Nabataean mould-made clay lamp, in niches and hung in rooms), the hearth fires of the tents and houses,
// the bronze lampstands and braziers of the temples, the fire on the great altar before Qasr al-Bint, the potter's kiln, a caravan's fire.
// Everything is geometry of one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light,
// no shadow and no collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. Each piece's shape is
// carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor or paving, a wash
// on a wall, a pane in a lit window or door. Every element of the nabataean style that puts a light into its plan, and the props, houses, shops,
// yards and the altar, are wrapped here (the style's files stay as they were). Each light is a function of its own place: no counters, no
// Math.random. The method is that of the Suzhou reference, written for Petra's lamps; nothing of Suzhou's is imported.

import '../../styles/nabataean/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseLayout } from '../../styles/nabataean/house.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the valley's houses with a lamp burning, of the shops open into the evening (the rest shuttered: dear oil) [inferred]. */
export const HOUSE_LIT = 0.42, SHOP_LIT = 0.4;

const TAU = Math.PI * 2, MAT = 'halo';
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
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high. */
  wall(x, y, z, nh, rw, rh, k = 0.6) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, 8, [0.9 * k, 0], [0, 1]); }
  /** A flat sheet (a lit window or door) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  get empty() { return !this.pos.length; }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor under it, if known. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

/** A frame at (x, z) turned by rot (a local +z toward (sin rot, cos rot), as the style's own): world point of (u, v) and the outward unit vector. */
const frameAt = (at, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return { P: (u, v) => [at[0] + u * c + v * s, at[1] - u * s + v * c], n: [s, c] }; };

/** A lit opening in a wall plane: the pane of width `w` from `y0` to `y1` at P(u, v), facing out along n. */
function pane(H, P, n, u, v, w, y0, y1, f) {
  const a = P(u - w / 2, v), b = P(u + w / 2, v);
  H.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], n, f);
}

// ── houses ───────────────────────────────────────────────────────────────────
/** The glow of a house's lamp: through the door, the windows of the front, the spill on the step; the court house's court and range door. */
function houseGlow(el, H) {
  const L = houseLayout(el), { P, y, W: Wd, D, rand } = L, hc = L.range.hc, [x0, z0, x1, z1] = el.rect;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (!(el.lit || hashAt(cx, cz, 3) < HOUSE_LIT)) return;
  const [ox, oz] = P(0, -1), [px, pz] = P(0, 0), nl = Math.hypot(ox - px, oz - pz) || 1, n = [(ox - px) / nl, (oz - pz) / nl];
  const f = () => 0.45 + 0.35 * hashAt(cx, cz, 7);
  if (!L.court) {
    // the room: the hanging lamp's glow under the beams, its pool on the floor, the door and the front's windows lit, the spill on the step
    const ri = L.room.rect, lu = (ri[0] + ri[2]) / 2, lv = (ri[1] + ri[3]) / 2, [lx, lz] = P(lu, lv);
    H.ball(lx, y + hc - 0.45, lz, 0.8);
    H.floor(lx, y + 0.06, lz, 1.9, 1.9, 10, 0.8);
    const d = L.door;
    pane(H, P, n, d.u, 0.35, d.w - 0.1, y + 0.1, y + 1.9, 0.5);
    const [sx, sz] = P(d.u, -1.2); H.floor(sx, y + 0.1, sz, 2.2, 1.7, 8, 0.7);
    // the windows of the front, as house.js lays them (the same draws, in the same order)
    rand();                                                                        // (the colour of the cornice band)
    const nWin = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < nWin; i++) { const u = (i + 0.5) / nWin * (Wd - 1.6) + 0.8; if (Math.abs(u - d.u) > 1.4) pane(H, P, n, u, -0.05, 0.52, y + 1.6, y + 2.4, f()); }
  } else {
    // the court house: the lamp in the range's room seen through its court door, the glow on the court's flags
    const R0 = L.range.v0, d = L.doorIn, ri = L.room.rect, [lx, lz] = P(Wd * 0.5, (ri[1] + ri[3]) / 2);
    H.ball(lx, y + hc - 0.45, lz, 0.8);
    H.floor(lx, y + 0.06, lz, 1.9, 1.9, 10, 0.8);
    pane(H, P, n, d.u, R0 - 0.05, d.w - 0.1, y + 0.1, y + 1.9, 0.5);                // (the range's court wall faces the gate: the way n points)
    const [sx, sz] = P(d.u, R0 - 1.4); H.floor(sx, y + 0.07, sz, 2.2, 1.7, 8, 0.7);
  }
}

// ── shops ────────────────────────────────────────────────────────────────────
/** A shop kept open into the evening: the lamp on the back wall seen through the door, its spill on the portico's floor. */
function shopGlow(el, H) {
  const [x, z] = el.at;
  if (hashAt(x, z, 11) >= SHOP_LIT) return;
  const { P, n } = frameAt(el.at, el.rot ?? 0), y = el.y ?? 0.45, dw = el.dw ?? 2.2;
  pane(H, P, n, 0, -0.4, dw - 0.3, y + 0.1, y + 2.0, 0.55);
  const [lx, lz] = P(0.7, -2.2); H.ball(lx, y + 1.9, lz, 0.8);
  const [fx, fz] = P(0, 1.1); H.floor(fx, y + 0.07, fz, 2.0, 1.5, 8, 0.7);
}

// ── props: lampstands, braziers, the baetyl shrine's lamps, the niches' votive lamps ──
function propGlow(el, H) {
  const k = el.kind, y = el.y ?? 0, [x, z] = el.at, { P, n } = frameAt(el.at, el.rot ?? 0);
  if (k === 'lampstand') { H.ball(x, y + 1.55, z, 0.5); H.floor(x, y + 0.05, z, 2.2, 2.2, 10, 0.75); }
  else if (k === 'brazier') { H.ball(x, y + 1.0, z, 0.85, 0.7); H.floor(x, y + 0.05, z, 2.6, 2.6, 10, 0.8); }
  else if (k === 'shrine') { const [bx, bz] = P(0, 0.6); H.ball(bx, y + 1.0, bz, 0.6); H.floor(bx, y + 0.34, bz, 1.9, 1.5, 8, 0.7); }
  else if (k === 'niche' && hashAt(x, z, 13) < 0.55) {
    const [lx, lz] = P(0.38, 0.22); H.ball(lx, y + 0.78, lz, 0.4);
    const [wx, wz] = P(0, 0.16); H.wall(wx, y + 1.5, wz, n, 0.9, 1.25, 0.55);
  }
}

// ── yards: a tent's hearth and the black cloth lit from within; the potter's kiln mouth ──
/** Wrap a context's bag so that the small hearth stones and the openings the yard builder adds can be told from where they are. */
function yardGlow(el, build, ctx) {
  const stones = [], opens = [], bounds = (g) => {
    const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
    return b;
  };
  const real = ctx.bag, bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          const b = bounds(g);
          if (mat === 'schist_rubble' && b[3] - b[0] < 0.25 && b[4] - b[1] < 0.15) stones.push([(b[0] + b[3]) / 2, b[1], (b[2] + b[5]) / 2]);
          else if (mat === 'opening') opens.push(b);
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  const r = build({ ...ctx, bag });
  const H = new Halo(), y = el.y;
  if (el.kind === 'tents') {
    // the hearths: the stones come six to a ring
    for (let i = 0; i + 5 < stones.length; i += 6) {
      let hx = 0, hz = 0; for (let q = 0; q < 6; q++) { hx += stones[i + q][0] / 6; hz += stones[i + q][2] / 6; }
      H.ball(hx, y + 0.3, hz, 0.75, 0.7); H.floor(hx, y + 0.06, hz, 2.4, 2.4, 10, 0.75);
      // the tent's door, the black cloth lit from within by the fire (the opening nearest the ring, its pane facing the ring)
      let best = null; for (const b of opens) { const d = Math.hypot((b[0] + b[3]) / 2 - hx, (b[2] + b[5]) / 2 - hz); if (b[4] - b[1] > 1.3 && (!best || d < best[0])) best = [d, b]; }
      if (best) { const b = best[1], mz = (b[2] + b[5]) / 2, s = hz > mz ? 1 : -1, zz = (s > 0 ? b[5] : b[2]) + s * 0.045; H.quad([b[0] + 0.05, y + 0.1, zz], [b[3] - 0.05, y + 0.1, zz], [b[3] - 0.05, b[4] - 0.1, zz], [b[0] + 0.05, b[4] - 0.1, zz], [0, s], 0.5); }
    }
  } else if (el.kind === 'potter') {
    // the kiln's firing mouth, the dome's foot lit
    const b = opens.find((q) => q[4] - q[1] > 0.7 && q[4] - q[1] < 0.9 && q[3] - q[0] > 0.6);
    if (b) { const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2, kz = el.gate === 's' ? el.rect[1] + 0.6 + 3.2 : el.rect[3] - 0.6 - 3.2, s = mz > kz ? 1 : -1, zz = (s > 0 ? b[5] : b[2]) + s * 0.012;
      H.quad([b[0] + 0.04, b[1] + 0.04, zz], [b[3] - 0.04, b[1] + 0.04, zz], [b[3] - 0.04, b[4] - 0.04, zz], [b[0] + 0.04, b[4] - 0.04, zz], [0, s], 0.85);
      H.ball(mx, y + 0.5, mz + s * 0.5, 0.9, 0.7); H.floor(mx, y + 0.06, mz + s * 1.1, 2.4, 2.0, 10, 0.8); }
  }
  H.flush(ctx.bag);
  return r;
}

let depth = 0;
/** Wrap a builder that pushes lights (the Khazneh, the tombs, the triclinium): a halo for each. */
const wrapLights = (fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  const H = new Halo();
  for (const l of lights.slice(n)) lightHalo(H, l, l.at[1] - 0.3);
  H.flush(ctx.bag);
  return r;
};
/** Wrap a builder: after it, the glow that `glow(el, H)` adds. */
const wrapGlow = (fn, glow) => function glowing(el, ctx) {
  const r = fn.call(this, el, ctx), H = new Halo();
  glow(el, H); H.flush(ctx.bag);
  return r;
};

/**
 * petra_fire: { at: [x, z], y, seed } — a hearth fire in the open (the caravans' halts in the forecourt and the Outer Siq, the Siq's wayfarers): a ring of
 * stones, three burning logs, the flame, its glow and its pool on the ground.
 */
function fire({ at, y = 0, seed = 0 }, { bag }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 21), n = 7 + Math.floor(q * 3);
  for (let i = 0; i < n; i++) { const a = i / n * TAU + q, r = 0.34 + 0.05 * hashAt(x + i, z, 22); bag.add('schist_rubble', lathe([[0.001, 0], [0.11 + 0.03 * hashAt(x, z + i, 23), 0], [0.09, 0.14], [0.001, 0.17]], 6, null, x + Math.cos(a) * r, y, z + Math.sin(a) * r)); }
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + q * 3; bag.add('timber', box(x + Math.cos(a) * 0.1 - 0.04, y + 0.03, z + Math.sin(a) * 0.1 - 0.04, x + Math.cos(a) * 0.1 + 0.04, y + 0.09, z + Math.sin(a) * 0.1 + 0.04)); }
  bag.add('flame', lathe([[0.001, 0], [0.16 + 0.04 * q, 0.04], [0.09, 0.26 + 0.1 * q], [0.001, 0.46 + 0.14 * q]], 7, null, x, y + 0.1, z));
  H.ball(x, y + 0.45, z, 0.85, 0.7); H.floor(x, y + 0.05, z, 2.8, 2.8, 10, 0.8);
  H.flush(bag);
  void seed;
}

let done = false;
/** Wraps the nabataean style's elements that make light (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.nabataean.elements;
  for (const k of ['khazneh', 'rock_tomb', 'triclinium']) if (typeof E[k] === 'function') E[k] = wrapLights(E[k]);
  E.nabataean_house = wrapGlow(E.nabataean_house, houseGlow);
  E.petra_front = wrapGlow(E.petra_front, shopGlow);
  E.petra_prop = wrapGlow(E.petra_prop, propGlow);
  { const base = E.petra_yard; E.petra_yard = function lit(el, ctx) { return el.kind === 'tents' || el.kind === 'potter' ? yardGlow(el, (c) => base.call(this, el, c), ctx) : base.call(this, el, ctx); }; }
  // the great altar before Qasr al-Bint: the fire on its hearth and the glow on the platform
  { const base = E.qasr; E.qasr = function altar(el, ctx) {
    const r = base.call(this, el, ctx);
    if (el.altar) { const [ax, az] = el.altar, H = new Halo(); H.ball(ax, 3.0 + 1.5, az, 1.5, 0.8); H.floor(ax, 3.08, az, 5.0, 4.2, 12, 0.8); H.flush(ctx.bag); }
    return r;
  }; }
  E.petra_fire = fire;
}
registerNight();
