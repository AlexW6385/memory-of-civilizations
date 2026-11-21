// Khajuraho about 1050 by night — what lit the temples and the village, and the light it throws (docs/settlements/khajuraho.md §19).
// The light of the place and date is the clay lamp (dīpa) of sesame, mustard or ghee oil with a cotton wick; the bronze lamp stands and the lamp columns before the
// temples; the lamp in the niche of a house and the hearth's glow through its door; the potter's kiln; the shop's hanging lamp. No electric light, no glass.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and
// no collision, so the day view is unchanged and the glow reads at the low preset too. The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0
// at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane in a lit window. The style's own `flame` pieces are the lights: the elements of
// the style are wrapped here (the style files stay as they were) and each flame piece added gets its halo; windows and doors glow by the hash of their own place.
// Each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou reference and of Nalanda, written for Khajuraho's lamps.

import '../../styles/nagara/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { frame, homeDoorU, isOpenFront } from './doors.js';

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

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/** The floor a lamp of element `el` stands on, from its height: a temple's own floors (the jagati, the hall plinth with its 0.9 m of steps) or the element's y. */
function floorOf(el, y) {
  if (el.t === 'nagara_temple') {
    const J = el.jagati ?? 0, F = J + el.h * 0.12 + 0.9;
    return y >= F - 0.1 ? F : J;
  }
  return (el.y ?? 0) + (el.open ? 0.42 : 0);
}
/** The glow of one lit piece (its bounds b) at height `floor` above the ground or floor it stands on. */
function lightOf(H, b, floor) {
  const x = (b[0] + b[3]) / 2, y = (b[1] + b[4]) / 2, z = (b[2] + b[5]) / 2, h = y - floor;
  if (h > 3) H.ball(x, y + 0.08, z, 0.7);                                                                   // the head of a lamp column, a lamp high on a temple
  else if (h > 1.4) { H.ball(x, y + 0.08, z, 0.8); H.floor(x, floor + 0.04, z, 1.9, 1.9, 10, 0.5); }       // a bronze lamp stand's flames, a lamp on a high beam
  else { H.ball(x, y + 0.05, z, 0.45); if (h > 0.2) H.floor(x, floor + 0.03, z, 1.2, 1.2, 8, 0.55); }
}

/**
 * Wrap a bag so that every `flame` piece added through it gets its halo, and every window slab of a house's walls (a slab under 0.05 m thick, 0.3–1.3 m high, in a
 * wall's plane, above the sill) glows with the lamp behind it in `share` of the cases, on the outward face only.
 */
function lit(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, y0 = el.y ?? 0, [x0, z0, x1, z1] = el.rect || [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          if (mat === 'flame') { const b = bounds(g); lightOf(H, b, floorOf(el, (b[1] + b[4]) / 2)); }
          else if (share > 0 && mat === 'opening') {
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
            if (th < 0.05 && dy > 0.3 && dy < 1.3 && w > 0.14 && b[1] > y0 + 0.9) {
              const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
              if (hashAt(mx, mz, 31) < share) {
                const f = 0.45 + 0.35 * hashAt(mx, mz, 7), m = 0.03, o = 0.012;
                if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
                else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
              }
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

// ── what the village's buildings add: the hanging lamp of a shop, the hearth through a door, the spill of a door onto the lane ──────────────────────────────────────
/** A shop's own lamp: a clay lamp on a hook under the verandah's eave by the keeper (oil is dear: most of the shops of the pilgrims' lane burn one, fewer elsewhere), and the pool of it on the platform and the lane. */
function shopLamp(H, el) {
  const { L, P } = frame(el), seed = el.seed || 0, share = el.open ? 0.9 : 0.55;
  if (hashAt(el.rect[0], el.rect[1], 3) > share) return;
  const u = L * (0.25 + 0.5 * hashAt(el.rect[0], el.rect[1], 5)), p = P(u, -0.95), y = (el.y ?? 0) + 0.42;
  H.ball(p[0], y + 1.95, p[1], 0.62, 0.6); H.floor(p[0], y + 0.03, p[1], 2.0, 1.5, 10, 0.5);
  const q = P(u, -2.1); H.floor(q[0], (el.y ?? 0) + 0.04, q[1], 2.2, 1.9, 10, 0.4);                                // on the lane's dust
  if (el.open && el.trade === 'sweets') { const h = P(L - 0.85, 0.8); H.ball(h[0], y + 0.65, h[1], 0.7, 0.55); }                // the sweet-maker's fire under his pan
  if (el.open && el.trade === 'smith') { const h = P(0.95, 1.05); H.ball(h[0], y + 0.85, h[1], 0.7, 0.6); }
  void seed;
}
/** The hearth of an open home (the chulha by the back wall: a red glow at its mouth) and the door's spill onto the step and the lane. */
function homeGlow(H, el) {
  const { L, D, P } = frame(el), y = (el.y ?? 0) + 0.42, u = homeDoorU(el);
  const hp = P(L - 0.85, D - 0.65);
  H.ball(hp[0], y + 0.45, hp[1], 0.55, 0.5); H.floor(hp[0], y + 0.03, hp[1], 1.3, 1.1, 8, 0.45);
  const d = P(u, -0.8); H.floor(d[0], y + 0.03, d[1], 1.5, 1.3, 8, 0.7);
}
/** A closed house or hut: the lamp or the hearth through the door ajar, on the step only. */
function doorGlow(H, el) {
  if (el.kind === 'hut' || el.kind === 'mud' || el.kind === 'home' || el.kind === 'haveli') {
    if (hashAt(el.rect[0], el.rect[1], 9) > (el.kind === 'haveli' ? 0.75 : 0.35)) return;
    const { P } = frame(el), d = P(homeDoorU(el), -0.9); H.floor(d[0], (el.y ?? 0) + 0.45, d[1], 1.3, 1.1, 8, 0.5);
  }
}
/** The potter's kiln glows at its stoke-hole (a third of the kilns are fired at any time) and the heap of fuel by it. */
function kilnGlow(H, el) {
  if (hashAt(el.c[0], el.c[1], 13) > 0.5) return;
  const co = Math.cos(el.rot ?? 0), si = Math.sin(el.rot ?? 0), Q = (u, v) => [el.c[0] + u * co + v * si, el.c[1] - u * si + v * co], m = Q(0, 1.55), y = el.y ?? 0;
  H.ball(m[0], y + 0.3, m[1], 0.95, 0.6); H.floor(m[0], y + 0.04, m[1], 2.4, 2.0, 10, 0.55);
}
/** The pilgrims' rest house: two lamps hung from its beams, a pool on the plinth under each. */
function restGlow(H, el) {
  const [x0, z0, x1, z1] = el.rect, pl = el.plinth ?? 0.7, cz = (z0 + z1) / 2;
  for (const x of [x0 + (x1 - x0) * 0.3, x0 + (x1 - x0) * 0.72]) { H.ball(x, pl + 2.1, cz, 0.7, 0.55); H.floor(x, pl + 0.03, cz, 2.6, 2.2, 10, 0.5); }
}
/** Before each temple's porch door the light of the sanctum's lamps comes out: a pool on the porch floor on the axis, the glow of the doorway (the porch of life.js `porchOf`). */
function porchGlow(H, el) {
  const t = el, W = t.w, Lh = (t.len - W / 2) / 0.84, J = t.jagati, plinth = t.h * 0.12;
  const x0 = t.c[0] + W / 2 + Lh * 0.66, x1 = x0 + Lh * 0.18, fl = J + plinth + 0.9, cz = t.c[1];
  H.floor((x0 + x1) / 2 - 0.4, fl + 0.04, cz, 2.6, 1.7, 12, 0.55); H.ball(x0 + 0.6, fl + 1.5, cz, 1.2, 0.4);
}

let depth = 0;
const OPEN = new Set(['nagara_temple', 'sub_shrine', 'varaha_mandapa', 'rite', 'lamp_pillar', 'wayside_shrine', 'bazaar_house', 'kiln', 'rest_house']);
/** Wrap one element builder of the style: the halo of every lamp it makes, the lit windows, the shops' lamps, the glow of a door. */
const wrap = (name, fn) => function haloed(el, ctx) {
  if (depth > 0 || !ctx?.bag || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const house = name === 'bazaar_house', L = lit(ctx, el, house ? (el.open ? 0.5 : 0.3) : 0);
  depth++;
  try { var r = fn.call(this, el, L.ctx); } finally { depth--; }
  const H = L.H;
  if (house) {
    if (el.kind === 'shop' || el.kind === 'shed') { if (el.kind === 'shop') shopLamp(H, el); }
    else if (el.open) homeGlow(H, el); else doorGlow(H, el);
    void isOpenFront;
  }
  if (name === 'kiln') kilnGlow(H, el);
  if (name === 'rest_house') restGlow(H, el);
  if (name === 'nagara_temple') porchGlow(H, el);
  H.flush(ctx.bag);
  return r;
};

let done = false;
/** Wraps the nagara style's elements that make lights (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.nagara.elements;
  for (const k of Object.keys(E)) if (OPEN.has(k) && typeof E[k] === 'function') E[k] = wrap(k, E[k]);
}
registerNight();
