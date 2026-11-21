// Sanchi in the 1st century by night — what lit the hill and the village, and the light it throws (docs/settlements/sanchi.md §21).
// The lamp of the place and time is a small clay dish of oil (ghee or sesame oil) with a cotton wick, the dīpa: set at the gateways' posts and at the foot of
// the stairway, in a row before the altar of Temple 40's hall, in the monks' cells, on the lamp pillars of the stair and of the way, in the niche beside a house's
// door, on the stalls' counters, and in the shops; the hearth glows red through a door; no electric light and no glass (the windows are barred openings with a
// shutter). Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no
// light, no shadow and no collision, so the day view is unchanged and the glow reads at the low preset too. The shape of each piece is carried by its normals
// (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane in a lit window. The style's own `flame`
// pieces are the lights: the style's elements are wrapped here (the style files stay as they were), each piece added in that material gets its halo; the cells of
// the monasteries and the windows of the houses glow by the hash of their own place (oil is dear: not all). Each light is a function of its own place: no
// counters, no Math.random. The method is that of the Suzhou reference (and of Nalanda's, copied and adapted).

import '../../styles/indian/index.js';
import '../../buildings/sanchi-great-stupa/style.js';
import './style.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { diya } from '../../styles/indian/rites.js';
import { houseDoor } from '../../styles/indian/village.js';
import { box } from '../../core/geom.js';

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

/** The glow of one lit piece (its bounds b) at height `floor` above the ground or floor it stands on. */
function lightOf(H, b, floor) {
  const x = (b[0] + b[3]) / 2, y = (b[1] + b[4]) / 2, z = (b[2] + b[5]) / 2, h = y - floor;
  if (h > 3) H.ball(x, y + 0.08, z, 0.7);                                                                   // on an upper floor or Temple 40's platform
  else if (h > 1.4) { H.ball(x, y + 0.08, z, 0.95); H.floor(x, floor + 0.04, z, 2.4, 2.4, 10, 0.55); }       // a lamp pillar's dish, or one in a high niche
  else if (h > 0.2) { H.ball(x, y + 0.05, z, 0.55); H.floor(x, floor + 0.03, z, 1.4, 1.4, 8, 0.6); }
  else { H.ball(x, y + 0.05, z, 0.5); H.floor(x, floor + 0.03, z, 1.2, 1.2, 8, 0.5); }                       // a lamp on the floor: its pool
}

/**
 * Wrap a bag so that every `flame` piece added through it gets its halo (a share of them, by the hash of its place, when `share` < 1: the monks' cells), and
 * (for houses) every window slab of the walls (a slab under 0.05 m thick, 0.3–1.3 m high, in a wall's plane, above the sill) glows with the lamp behind it in
 * `wshare` of the cases, on the outward face only.
 */
function lit(ctx, el, share, wshare) {
  const H = new Halo(), real = ctx.bag, y0 = el.y ?? 0, [x0, z0, x1, z1] = el.rect || [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          if (mat === 'flame') { const b = bounds(g); if (share >= 1 || hashAt((b[0] + b[3]) / 2, (b[2] + b[5]) / 2, 5) < share) lightOf(H, b, el.pool ?? (y0 + (el.open ? 0.42 : 0))); }
          else if (wshare > 0 && mat === 'opening') {
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
            if (th < 0.05 && dy > 0.3 && dy < 1.3 && w > 0.14 && b[1] > y0 + 0.9) {
              const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
              if (hashAt(mx, mz, 31) < wshare) {
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

/** The lamp of a stall: a clay lamp at the counter's near end (the lamp-sellers set out their stock of unlit ones). */
function stallLamp(el, bag) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's', y = el.y ?? 0, along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const p = P(L - 0.5, 0.36);
  diya(bag, p[0], y + 0.85, p[1], 1.2);
}

/** The lamp of an open shop or merchant's store: a clay lamp on a timber bracket on the side wall just inside the front room, and its spill over the platform. */
function shopLamp(el, bag, H) {
  const F = houseDoor(el), y = (el.y ?? 0) + 0.42, T = F.T, sd = F.stairLeft ? 1 : 0;
  const u = sd ? F.L - T : T, dir = sd ? -1 : 1, q = F.P(u, 1.0), q2 = F.P(u + dir * 0.28, 1.2), r = [q, q2];
  bag.add('wood_dark', box(Math.min(...r.map((p) => p[0])) - 0.02, y + 1.5, Math.min(...r.map((p) => p[1])) - 0.02, Math.max(...r.map((p) => p[0])) + 0.02, y + 1.55, Math.max(...r.map((p) => p[1])) + 0.02));
  const c = F.P(u + dir * 0.14, 1.1);
  diya(bag, c[0], y + 1.55, c[1], 1.2);
  const m = F.P(F.du, -1.2);
  H.floor(m[0], y - 0.02, m[1], 2.6, 1.7, 10, 0.55);                                                    // the spill of the room's lamp over the platform and into the lane
}

let depth = 0;
const OPEN = new Set(['village_house', 'stall', 'rite', 'pilgrim_hall', 'tree_shrine']);
/** Wrap one element builder of the style: the halo of every lamp it makes, the lit windows, the spill of an opened door, a stall's lamp, a shop's. */
const wrap = (name, fn, share = 1) => function haloed(el, ctx) {
  if (depth > 0 || !ctx?.bag || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const house = name === 'village_house', L = lit(ctx, el, share, house ? 0.3 : 0);
  depth++;
  let r;
  try {
    r = fn.call(this, el, L.ctx);
    if (name === 'stall') stallLamp(el, L.ctx.bag);
  } finally { depth--; }
  const H = L.H;
  if (name === 'rite' && el.pool !== undefined && el.kind === 'lamp') { const [x, z] = el.at; H.floor(x, el.pool + 0.04, z, 2.8, 2.8, 10, 0.6); }
  if (house && el.open) {
    const F = houseDoor(el), y = (el.y ?? 0) + 0.42;
    if (F.open0 || el.kind === 'merchant') { depth++; try { shopLamp(el, L.ctx.bag, H); } finally { depth--; } }
    else {
      // the door ajar: the lamp's light spilling over the step into the lane, the hearth glowing red at the back of the room
      const [px, pz] = F.P(F.du, -1.0), s = F.P(F.L - F.T - 0.55, F.D - F.T - 0.33);
      H.floor(px, y - 0.02, pz, 2.2, 1.6, 8, 0.7);
      H.ball(s[0], y + 0.5, s[1], 0.6, 0.5); H.floor(s[0], y + 0.03, s[1], 1.6, 1.6, 8, 0.45);
    }
  }
  H.flush(ctx.bag);
  return r;
};

let done = false;
const wrapped = new Map(), made = new Set();
/** Wraps the elements that make lights in every style of Sanchi's plans (once, after every file of the styles has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  for (const name of ['indian', 'indian-sanchi', 'sanchi-site']) {
    const E = STYLES[name].elements;
    for (const k of Object.keys(E)) if (OPEN.has(k) && typeof E[k] === 'function') { if (made.has(E[k])) continue; if (!wrapped.has(E[k])) { const w = wrap(k, E[k]); wrapped.set(E[k], w); made.add(w); } E[k] = wrapped.get(E[k]); }
    const O = STYLES[name].objects;
    if (O && typeof O.vihara === 'function' && !made.has(O.vihara)) { const w = wrap('vihara', O.vihara, 0.55); made.add(w); O.vihara = w; }
  }
}
registerNight();
