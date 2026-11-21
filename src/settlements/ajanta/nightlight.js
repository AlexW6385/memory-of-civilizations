// Ajanta about 480 by night — what lit the monastery and its gorge, and the light it throws (docs/settlements/ajanta.md §17).
// The lamp of the place and time is a small dish of sesame oil (or ghee) with a cotton wick: bronze lamp stands before the Buddhas of the caves, clay lamps in the
// shrine niches and on the ledge's stands, in the pilgrims' booths and the shelter, at the door-post of a village hut; the smith's forge and the potter's kiln glow
// red, the hearth shows through the open door of a hut; no electric light, no glass. Everything here is geometry in one material, `halo` (palette.js,
// materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the day view is unchanged and the
// glow reads at the low preset too. The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim). The style's own `flame` pieces are
// the lights: every element that makes one is wrapped here (the style files stay as they were) and each flame gets its halo; the huts get the hearth's glow and
// the door lamp by the hash of their own place (oil is dear: not every house burns a lamp). Each light is a function of its own place: no counters, no
// Math.random. The method is that of the Suzhou reference, written for Ajanta's lamps.

import '../../styles/ajanta/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { FLOOR, rng } from './layout.js';

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

/** The glow of one lit piece (bounds b): a ball round the flame and a pool on the floor under it; the forge's and kiln's fire (a wide piece) glows larger and redder. `floors` the heights a lamp may stand on. */
function lightOf(H, b, floors, G = 1) {
  const x = (b[0] + b[3]) / 2, y = (b[1] + b[4]) / 2, z = (b[2] + b[5]) / 2, wide = Math.max(b[3] - b[0], b[5] - b[2]) > 0.2;
  const fl = floors.filter((f) => f <= y + 0.2).pop() ?? floors[0], h = y - fl;
  if (wide) { H.ball(x, y + 0.2, z, 1.2, 0.7); H.floor(x, fl + 0.03, z, 3.0, 3.0, 10, 0.7); return; }
  if (h > 1.4) { H.ball(x, y + 0.08, z, 0.8, 0.6); return; }
  if (h > 0.6) { H.ball(x, y + 0.08, z, 0.85 * G, 0.62); H.floor(x, fl + 0.03, z, 2.3 * G, 2.3 * G, 10, 0.5); }
  else { H.ball(x, y + 0.05, z, 0.5 * G); if (h > 0.2) H.floor(x, fl + 0.03, z, 1.3 * G, 1.3 * G, 8, 0.55); }
}

/** Wrap a bag so that every `flame` piece added through it gets its halo (heights of the floors a lamp stands on: `floors`). */
function lit(ctx, floors, G = 1) {
  const H = new Halo(), bag = new Proxy(ctx.bag, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => { if (g?.attributes?.position && mat === 'flame') lightOf(H, bounds(g), floors, G); return t.add(mat, g, ...r); };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H };
}

/** A hut's night: the hearth's red glow seen through the door (a ball inside and a floor pool), the clay lamp at the door-post, and in some the glow in the front window.
 * Numbers follow styles/ajanta/houses.js: the door at uc (from the house's own dice), the hearth in the back corner on the side `left`, the lamp shelf at uc + dw + 0.28. */
function hutLight(H, el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's', W = f === 's' || f === 'n' ? x1 - x0 : z1 - z0, D = f === 's' || f === 'n' ? z1 - z0 : x1 - x0;
  const xz = (u, v) => (f === 's' ? [x0 + u, z1 - v] : f === 'n' ? [x1 - u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const r = rng(el.seed ?? 1), uc = W * (0.38 + r() * 0.24), win = r() < 0.8, left = uc > W / 2, t = 0.35, dw = el.open ? 0.82 : 0.52;
  const [sx, sz] = xz(uc, 0);
  if (!el.open && hashAt(sx, sz, 5) > 0.62) return;                                                      // a house asleep: no light
  const [hx, hz] = xz((left ? t + 0.15 : W - t - 0.85) + 0.35, D - t - 0.38);
  H.ball(hx, 0.55, hz, 0.95, 0.6); H.floor(hx, 0.05, hz, 1.8, 1.4, 8, 0.45);
  const [px, pz] = xz(uc + dw + 0.28, -0.06);
  H.ball(px, 1.56, pz, 0.55, 0.62);
  const [dx, dz] = xz(uc, -0.9);                                                                          // the lamp's light on the ground before the door
  H.floor(dx, 0.04, dz, 1.9, 1.5, 8, 0.5);
  if (win && hashAt(sx, sz, 9) < 0.5) {                                                                   // the front window (u = wf, y 1.15–1.6, 0.44 wide), the glow in it facing out
    const wf = W * (left ? 0.2 : 0.8), a = xz(wf - 0.18, -0.03), b = xz(wf + 0.18, -0.03), n = f === 's' ? [0, 1] : f === 'n' ? [0, -1] : f === 'e' ? [1, 0] : [-1, 0];
    H.quad([a[0], 1.2, a[1]], [b[0], 1.2, b[1]], [b[0], 1.55, b[1]], [a[0], 1.55, a[1]], n, 0.5);
  }
}
/** The potter's kiln (styles/ajanta/crafts.js: at u W + 1.3, v -2.6, the fire-mouth 1 m behind it at v -1.55): a low red glow at the mouth. */
function kilnLight(H, el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's', W = x1 - x0;
  const xz = (u, v) => (f === 's' ? [x0 + u, z1 - v] : f === 'n' ? [x1 - u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const [kx, kz] = xz(W + 1.3, -1.55);
  H.ball(kx, 0.3, kz, 0.9, 0.65); H.floor(kx, 0.04, kz, 2.2, 1.8, 8, 0.6);
}

let depth = 0;
const FLOORS = { aj_cliff: FLOOR, aj_ledge: FLOOR };
const NAMES = ['aj_cliff', 'aj_ledge', 'aj_house', 'aj_smithy', 'aj_potter', 'aj_offerstall', 'aj_wayshrine', 'aj_shelter', 'aj_workyard'];
/** Wrap one element builder of the style: the halo of every lamp it makes, the hut's hearth and door lamp, the kiln's mouth. */
const wrap = (name, fn) => function haloed(el, ctx) {
  if (depth > 0 || !ctx?.bag || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const y0 = el.y ?? 0, L = lit(ctx, FLOORS[name] ?? [y0, y0 + 0.1, y0 + 0.32], FLOORS[name] ? 1.8 : 1);
  depth++;
  try { var r = fn.call(this, el, L.ctx); } finally { depth--; }
  if (name === 'aj_house') hutLight(L.H, el);
  if (name === 'aj_potter') kilnLight(L.H, el);
  L.H.flush(ctx.bag);
  return r;
};

let done = false;
/** Wraps the ajanta style's elements that make lights (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.ajanta.elements;
  for (const k of NAMES) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
}
registerNight();
