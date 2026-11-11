// Nan Madol c. 1300 — the moving life (docs/settlements/nan-madol.md §7): people on the islets' paths and over the causeways (the
// loincloth and the wrap of mats and hibiscus fibre, bare feet, hair long or in a bun; baskets of breadfruit and yams on the back),
// priests in white mats in the courts of Nandauwas, and outrigger canoes paddled along the tidal canals. Data for the engine's
// movers (src/engine/movers.js, read in its worker); the format is Suzhou's. The ways come from layout.js.

import { RADIUS, WATER, CANALS, FORDS, walkPaths } from './layout.js';
import { subtractRects, STYLES } from '../../core/build.js';
import '../../styles/nanmadol/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 30, night: 3, rain: 0.4, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 6, reach: 250, spawnMin: 60, far: 100, speed: [0.9, 1.3], bridgeSpeed: 0.8 },
  water: WATER,
};

/** The ways: the paths along and across each islet, the causeways as links, and Nandauwas's gate and courts. */
export function walkways() {
  const { rects, links } = walkPaths();
  const R = rects.map((r) => ({ r, weight: 1.0, market: 0.8, kind: 'lane' }));
  R.push({ r: [-11.5, -17.5, -8.5, -2], weight: 1.4, market: 1.0, kind: 'street' });                      // from the causeway to the gate
  R.push({ r: [-11.5, -17.5, 2, -14.5], weight: 1.0, market: 0.8, kind: 'lane' });                        // the outer court, to the inner gate
  R.push({ r: [-0.5, -23.2, 2, -14.5], weight: 0.9, market: 0.6, kind: 'lane' });
  R.push({ r: [-20, -27.6, 1.5, -24.6], weight: 0.8, market: 0.4, kind: 'lane' });                        // the inner court's south strip
  return { rects: R, links: links.map((l) => ({ ...l, weight: 1.0 })), clip: RADIUS - 22 };
}

/** The canals as reaches cut at the causeways (a canoe does not pass one). */
export function waterways() {
  const cuts = FORDS.map((f) => (f.axis === 'x'
    ? [f.c[0] - f.len / 2 - 3.5, f.c[1] - f.w / 2 - 3.5, f.c[0] + f.len / 2 + 3.5, f.c[1] + f.w / 2 + 3.5]
    : [f.c[0] - f.w / 2 - 3.5, f.c[1] - f.len / 2 - 3.5, f.c[0] + f.w / 2 + 3.5, f.c[1] + f.len / 2 + 3.5]));
  const rects = [];
  for (const c of CANALS) {
    const w = Math.min(c[2] - c[0], c[3] - c[1]);
    if (w < 6.5 || w > 30) continue;
    for (const p of subtractRects(c, cuts)) if (Math.max(p[2] - p[0], p[3] - p[1]) >= 16 && Math.min(p[2] - p[0], p[3] - p[1]) >= 6.5) rects.push({ r: p, weight: 1 });
  }
  return { rects, bridges: [], clip: RADIUS - 14 };
}

/** The canoes at rest at the landings (town.js) as rectangles the moving boats keep clear of. */
export async function staticBoats() {
  const { moored } = await import('./town.js');
  return moored().map((m) => ({ c: m.at, u: [Math.sin(m.yaw), Math.cos(m.yaw)], hl: m.len / 2 + 1, hw: 2.1 }));
}

const CL = { white: 'cloth_white', ochre: 'cloth_ochre', brown: 'cloth_brown', tan: 'hide_tan', black: 'cloth_black' };
export const WALKERS = [
  { id: 'man', weight: 2.0, market: 1.6, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'hang', hair: 'bun', beard: false, feet: 'bare' },
    c1: [CL.brown, CL.ochre, CL.tan, CL.white], c2: [CL.brown], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'woman', weight: 1.8, market: 1.5, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'long', feet: 'bare' }, swing: 0.7,
    c1: [CL.brown, CL.ochre, CL.tan, CL.white], c2: [CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.6, market: 1.4, el: { dress: 'loincloth', hat: 'none', over: 'none', carry: 'basket', arms: 'hang', hair: 'bun', feet: 'bare' },
    c1: [CL.brown, CL.tan, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'carrier', weight: 1.0, market: 0.8, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', carry: 'basket', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.brown, CL.ochre, CL.white], c2: [CL.ochre], c3: [CL.black], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'priest', weight: 0.7, market: 0.5, el: { dress: 'wrap', hat: 'none', over: 'cloak', arms: 'hang', hair: 'bun', beard: true, feet: 'bare' },
    c1: [CL.white, CL.white, CL.tan], c2: [CL.white, CL.white], c3: [CL.black], speed: [0.65, 0.85], stride: 1.05 },
  { id: 'boy', weight: 0.6, market: 0.8, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: false, feet: 'bare' },
    c1: [CL.tan, CL.brown], c2: [CL.brown], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {
  boatman: { el: { dress: 'loincloth', hat: 'none', arms: 'pull', hair: 'bun', feet: 'bare' }, c1: [CL.brown, CL.tan, CL.ochre], c2: [CL.brown], c3: [CL.black] },
  passenger: { el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', pose: 'cross', hair: 'long', feet: 'bare' }, c1: [CL.white, CL.brown, CL.ochre], c2: [CL.white], c3: [CL.black] },
};
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far, cape: null });
  }
}

/**
 * The outrigger canoe (the nanmadol style's), 7 m, afloat: variant `covered` (a woman sitting amidships comes with it) and `cargo`
 * (baskets of breadfruit and yams), and the paddle that steers at the stern. The bow toward −z, the keel 0.22 m under the water at y 0.
 */
export const BOAT = { L: 7, pin: [0.2, 0.62, 2.3], deck: 0.12, stern: 2.0, passenger: [0.0, 0.12, 0.2], hull: [1.3, 3.6] };
const beam = (out, p, q, r, n = 6) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
export function boatShapes(sb) {
  const grab = (fn, el) => { const got = []; fn(el, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {}, segment() {}, floor() {}, ramp() {} } }); return got; };
  const group = (m) => (/cloth|wicker|reed_mat|hide|rope/.test(m) ? 'fibre' : 'wood');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of grab(STYLES.nanmadol.elements.canoe, { t: 'canoe', at: [0, 0], yaw: 0, len: BOAT.L, y: -0.22, side: 1, afloat: true })) {
      if (far && m === 'rope_fibre') continue;
      sb.addPiece(v, group(m), g, { slot: SLOT.none, col: factor(group(m), m) });
    }
    if (kind === 'cargo') {
      const life = STYLES.life.elements;
      for (const [m, g] of grab(life.basket, { t: 'basket', n: 4, at: [0.1, -0.5], y: 0.08, seed: 41, goods: 'cloth_green' })) if (!far || m !== 'hide_tan') sb.addPiece(v, 'fibre', g, { slot: SLOT.none, col: factor('fibre', m) });
    }
  }
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.1, 0.45, -0.5], K = [0, 0.02, 0.1], B0 = [0, -0.4, 1.4], B1 = [0, -0.62, 2.1];
  beam(w, H, [0, 0.05, -0.02], 0.022, 6); beam(w, [0, 0.05, -0.02], K, 0.026, 6); beam(w, K, B0, 0.024, 6);
  const hw = 0.09, th = 0.015, d = [B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]], dl = Math.hypot(...d), du = d.map((x) => x / dl), side = [1, 0, 0];
  const upv = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const C = (p, s, t) => [0, 1, 2].map((i) => p[i] + side[i] * s + upv[i] * t);
  const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
  bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
}
