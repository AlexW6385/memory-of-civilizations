// Nalanda about 640 by night — what lit the monastery and the way, and the light it throws (docs/settlements/nalanda.md §19).
// The lamp of the place and time is a small dish of oil (ghee or sesame oil) with a cotton wick: clay dishes in the lamp niches of the cells and shrines, on
// the brick lamp pillars of the way and before the Buddha, hung in the annexes, in the niche beside a village door; the kitchens and the hearths glow red; there is
// no electric light and no glass. Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at
// night only, with no light, no shadow and no collision, so the day view is unchanged and the glow reads at the low preset too. The shape of each piece is carried
// by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane in a lit window.
// The style's own `flame` and `lamp_glass` pieces are the lights: every element of the style is wrapped here (the style files stay as they were), each piece
// added in those two materials gets its halo, the cells of the monasteries and the windows of the houses glow by the hash of their own place (oil is dear: not all).
// Each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou reference, written for Nalanda's lamps.

import '../../styles/nalanda/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { houseDoor } from '../../styles/nalanda/houses.js';
import { niches, burns } from './templework.js';

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
  if (h > 3) H.ball(x, y + 0.08, z, 0.7);                                                                   // on a terrace of the temple or an upper floor
  else if (h > 1.8) { H.ball(x, y + 0.08, z, 0.95); H.floor(x, floor + 0.04, z, 3.8, 3.8, 12, 0.7); }       // a lamp pillar's dish, or one on a high beam
  else { H.ball(x, y + 0.05, z, 0.55); if (h > 0.2) H.floor(x, floor + 0.03, z, 1.4, 1.4, 8, 0.6); }
}

/**
 * Wrap a bag so that every `flame` and `lamp_glass` piece added through it gets its halo, and (for houses) every window slab of the walls (a slab under 0.05 m
 * thick, 0.3–1.3 m high, in a wall's plane, above the sill) glows with the lamp behind it in `share` of the cases, on the outward face only.
 */
function lit(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, y0 = el.y ?? 0, [x0, z0, x1, z1] = el.rect || [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          if (mat === 'flame' || mat === 'lamp_glass') lightOf(H, bounds(g), y0 + (el.enter || el.open ? 0.45 : 0));
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

// the cell block's numbers (src/styles/nalanda/index.js: CELL, BLOCK, H1)
const OUT = 1.0, CLEAR = 3.0, INNER = 0.5, H1 = 3.7;
/** The lamp of each lit cell of an opened monastery (a dish on its stand by the bed's head, seen through the doorway from the verandah) and the glow in its slit window. */
function cells(H, el) {
  const [x0, z0, x1, z1] = el.rect, BLOCK = OUT + CLEAR + INNER;
  const sides = [
    { A: [x0, z0], B: [x1, z0], n: [0, 1] }, { A: [x1, z0 + BLOCK], B: [x1, z1 - BLOCK], n: [-1, 0] },
    { A: [x1, z1], B: [x0, z1], n: [0, -1] }, { A: [x0, z1 - BLOCK], B: [x0, z0 + BLOCK], n: [1, 0] },
  ];
  sides.forEach((sd, si) => {
    const { A, B, n } = sd, L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
    const P = (s, d) => [A[0] + u[0] * s + n[0] * d, A[1] + u[1] * s + n[1] * d];
    const nc = si % 2 === 0 ? 15 : 11, pitch = L / nc, gate = si === 3 ? (nc - 1) / 2 : -1;
    for (let k = 0; k < nc; k++) {
      if (k === gate) continue;
      const c = (k + 0.5) * pitch, s0 = c - pitch / 2 + 0.3;
      for (const yb of [0, H1]) {
        const q = P(s0 + 1.15, OUT + 0.3);
        if (hashAt(q[0], q[1], 11 + yb) >= (yb ? 0.22 : 0.3)) continue;
        H.ball(q[0], yb + 0.55, q[1], 0.5, 0.55);
        const w = P(c, 0.25);                                              // the slit of the outer wall: the cell's glow in it, facing out
        const a = P(c - 0.24, 0.25), b = P(c + 0.24, 0.25), sy = yb ? 5.4 : 1.7;
        H.quad([a[0], sy + 0.04, a[1]], [b[0], sy + 0.04, b[1]], [b[0], sy + 0.81, b[1]], [a[0], sy + 0.81, a[1]], [-n[0], -n[1]], 0.55);
        void w;
      }
    }
  });
}

/** One lamp for each booth of the way and bazaar (a clay dish hung from the awning's post by the seller; the lamp-sellers' stock glows more). */
function booths(H, el) {
  const M = { w: [[0, 1], [1, 0]], e: [[0, 1], [-1, 0]], n: [[1, 0], [0, 1]], s: [[-1, 0], [0, -1]] };
  for (const [x, z, face, kind, seed] of el.at) {
    const m = M[face || 'w'], P = (a, b) => [x + m[0][0] * a + m[1][0] * b, z + m[0][1] * a + m[1][1] * b];
    if (hashAt(x, z, 3) > 0.85) continue;
    const p = P(1.2, 0.2);
    H.ball(p[0], 1.75, p[1], 0.6, 0.62); H.floor(p[0], 0.05, p[1], 2.3, 2.3, 10, 0.5);
    if (kind === 'lamps') { const q = P(0, 0.4); H.ball(q[0], 1.0, q[1], 0.9, 0.5); H.floor(q[0], 0.05, q[1], 2.2, 1.8, 10, 0.55); }
    void seed;
  }
}

/** The lamps of the temples' niches (a dish of oil on the throne before the Buddha): a glow in the recess, a pane of light on its back, a pool on the ledge — the faces of the great temple lit tier by tier. */
function templeLamps(H, el) {
  for (const q of niches(el)) {
    if (!burns(q)) continue;
    const { p, o, tg, by, ah } = q, P = (t, d, y) => [p[0] + o[0] * d + tg[0] * t, y, p[1] + o[1] * d + tg[1] * t];
    const c = P(0, 0.34, by + 0.5);
    H.ball(c[0], c[1], c[2], 0.5, 0.6);
    const a = P(-0.36, 0.075, by + 0.2), b = P(0.36, 0.075, by + 0.2), d = P(0.36, 0.075, by + ah - 0.75), e = P(-0.36, 0.075, by + ah - 0.75);
    H.quad(a, b, d, e, o, 0.5);
    const g = P(0, 0.9, by - 0.6); H.floor(g[0], by + 0.0, g[2], 0.9, 0.9, 8, 0.35);
  }
}
let depth = 0;
const OPEN = new Set(['monastery', 'temple', 'tower', 'lamps', 'booth', 'annex', 'gate', 'house_bihar']);
/** Wrap one element builder of the style: the halo of every lamp it makes, the lit cells and windows, the spill of an opened door. */
const wrap = (name, fn) => function haloed(el, ctx) {
  if (depth > 0 || !ctx?.bag || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const house = name === 'house_bihar', L = lit(ctx, el, house ? 0.3 : 0);
  depth++;
  try { var r = fn.call(this, el, L.ctx); } finally { depth--; }
  const H = L.H;
  if (name === 'monastery' && el.enter) cells(H, el);
  if (name === 'booth') booths(H, el);
  if (name === 'temple' && !el.simple) templeLamps(H, el);
  if (house && el.open) {
    // the door ajar: the lamp's light spilling over the step into the lane
    const F = houseDoor(el), [px, pz] = F.P(F.du, -1.0);
    H.floor(px, (el.y ?? 0) + 0.3, pz, 2.2, 1.6, 8, 0.7);
  }
  H.flush(ctx.bag);
  return r;
};

let done = false;
/** Wraps the nalanda style's elements that make lights (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.nalanda.elements;
  for (const k of Object.keys(E)) if (OPEN.has(k) && typeof E[k] === 'function') E[k] = wrap(k, E[k]);
}
registerNight();
