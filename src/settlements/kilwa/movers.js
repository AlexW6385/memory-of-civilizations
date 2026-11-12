// Kilwa about 1330 — the moving life (docs/settlements/kilwa.md §17): people in the streets of the stone town and the market,
// mtepe under their mat sails working the harbour. Data for the engine's movers (src/engine/movers.js, read in its worker);
// the format is Suzhou's (src/settlements/ming-suzhou/movers.js). The ways come from layout.js (STREETS, HARBOUR).

import { RADIUS, SEA, SOKO, MOSQUE_STREET, SPINE, LANES, ALLEYS, HARBOUR } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/swahili/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 46, night: 6, rain: 0.6, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 5, reach: 260, spawnMin: 70, far: 110, speed: [0.9, 1.4], bridgeSpeed: 0.8 },
  water: SEA,
};

// ── the ways ─────────────────────────────────────────────────────────────────
/** The market street, the street before the mosque, the spine and the lanes (kept free of houses in layout.js). */
export function walkways() {
  const rects = [
    { r: [SOKO[0] + 6, SOKO[1] + 1.2, SOKO[2] - 6, SOKO[3] - 1.2], weight: 3.0, market: 2.4, kind: 'street' },
    { r: [MOSQUE_STREET[0] + 6, MOSQUE_STREET[1] + 1.2, MOSQUE_STREET[2] - 6, MOSQUE_STREET[3] - 1.2], weight: 2.0, market: 1.4, kind: 'street' },
    { r: [SPINE[0] + 1.2, SPINE[1], SPINE[2] - 1.2, SPINE[3]], weight: 2.4, market: 1.0, kind: 'street' },
    ...ALLEYS.filter((r) => r[1] < 100).map((r) => ({ r: [r[0] + 6, r[1] + 0.3, r[2] - 6, r[3] - 0.3], weight: 0.7, market: 0.5, kind: 'lane' })),
    ...LANES.map((r) => ({ r: [r[0] + 0.8, r[1], r[2] - 0.8, r[3]], weight: 1.0, market: 0.8, kind: 'lane' })),
  ];
  return { rects, links: [], clip: RADIUS - 20 };
}

/** The harbour: the open water north of the beach, worked by the boats along its length. */
export function waterways() { return { rects: [{ r: HARBOUR, weight: 1 }], bridges: [], clip: RADIUS - 12 }; }

/** The dhows at anchor in the harbour (life.js) as rectangles the moving boats keep clear of. */
export async function staticBoats() {
  const { town } = await import('./town.js');
  const out = [];
  for (const p of await town()) for (const e of p.elements) {
    if (e.t !== 'boat') continue;
    const L = e.len ?? 18, r = e.rot ?? 0;
    out.push({ c: e.at, u: [Math.sin(r), Math.cos(r)], hl: L / 2 + 1, hw: 2.4 });
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// Swahili townsmen and women about 1330 (dossier §17): men in the long white robe (kanzu) or the wrapped waist-cloth (kikoi-like)
// with the embroidered cap (kofia) or a turban, merchants from Arabia, Persia and India in coloured robes and turbans, women in
// wrapped cloths with a head-cloth, water-carriers with the jar on the head, porters bare-chested with loads on the head,
// boys. Bare feet.
const CL = { white: 'cloth_white', indigo: 'cloth_indigo', ochre: 'cloth_ochre', red: 'cloth_red', brown: 'cloth_brown', green: 'cloth_green', maroon: 'cloth_maroon', black: 'cloth_black' };
export const WALKERS = [
  { id: 'townsman', weight: 2.0, market: 1.6, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', hair: 'short', feet: 'bare' },
    c1: [CL.white, CL.white, CL.white, CL.indigo, CL.ochre], c2: [CL.white, CL.indigo], c3: [CL.white], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'wrapped', weight: 1.2, market: 1.2, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'short', feet: 'bare' },
    c1: [CL.indigo, CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.white], speed: [1.0, 1.3], stride: 1.35 },
  { id: 'trader', weight: 0.8, market: 2.0, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang', hair: 'short', beard: true, feet: 'bare' },
    c1: [CL.green, CL.maroon, CL.ochre, CL.white, CL.indigo], c2: [CL.white, CL.ochre], c3: [CL.white, CL.red], speed: [0.9, 1.15], stride: 1.35 },
  { id: 'woman', weight: 1.6, market: 1.6, el: { dress: 'wrap', hat: 'veil', over: 'shawl', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.indigo, CL.red, CL.ochre, CL.green, CL.maroon, CL.white], c2: [CL.white, CL.indigo], c3: [CL.indigo, CL.white, CL.red], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.1, market: 0.9, el: { dress: 'wrap', hat: 'veil', over: 'shawl', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.indigo, CL.ochre, CL.red], c2: [CL.white], c3: [CL.indigo, CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.4, market: 1.6, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'belt', carry: 'basket', arms: 'hang', hair: 'short', feet: 'bare' },
    c1: [CL.white, CL.indigo, CL.brown, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'boy', weight: 0.5, market: 0.6, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'short', feet: 'bare' },
    c1: [CL.white, CL.ochre], c2: [CL.white], c3: [CL.white], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
/** The sailor at the steering oar and the merchant sitting amidships. */
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hat: 'cap', arms: 'pull', hair: 'short', feet: 'bare' }, c1: [CL.white, CL.indigo, CL.ochre], c2: [CL.white], c3: [CL.white] },
  passenger: { el: { dress: 'robe', hat: 'turban', over: 'sash', pose: 'cross', hair: 'short', beard: true, feet: 'bare' }, c1: [CL.white, CL.green, CL.maroon], c2: [CL.white], c3: [CL.white] },
};

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far, cape: null });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The mtepe under sail (variant `covered`: with the merchant amidships) and loaded (`cargo`: sacks and jars), and the steering
 * sweep. Built at 12 m from the swahili style's mtepe (afloat: the hoisted mat sail, no props), the bow toward −z, the keel
 * 0.2 m under the waterline at y 0.
 */
export const BOAT = { L: 12, pin: [0.4, 0.78, 4.0], deck: 0.2, stern: 3.2, passenger: [-0.05, 0.2, -0.3], hull: [1.9, 6.2] };
const beam = (out, p, q, r, n = 6) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
export function boatShapes(sb) {
  const grab = (fn, el) => { const got = []; fn(el, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {}, segment() {}, floor() {}, ramp() {} } }); return got; };
  const group = (m) => (/cloth|wicker|sacking|reed_mat|hide/.test(m) ? 'fibre' : 'wood');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of grab(STYLES.swahili.elements.mtepe, { t: 'mtepe', at: [0, 0], dir: [0, -1], len: BOAT.L, y: -0.2, seed: 5, afloat: true })) {
      if (far && m === 'hide_brown') continue;
      sb.addPiece(v, group(m), g, { slot: m === 'reed_mat' ? SLOT.c3 : SLOT.none, col: factor(group(m), m === 'wood_dark' ? 'wood_dark' : m) });
    }
    if (kind === 'cargo') {
      const life = STYLES.life.elements;
      const put = (fn, el) => { for (const [m, g] of grab(fn, el)) if (!far || m !== 'hide_tan') sb.addPiece(v, /wicker|sacking/.test(m) ? 'fibre' : 'wood', g, { slot: SLOT.none, col: factor(/wicker|sacking/.test(m) ? 'fibre' : 'wood', m) }); };
      put(life.sacks, { t: 'sacks', at: [0, 0.8], y: 0.12, rot: 0, n: 5, seed: 31 });
      put(life.pot, { t: 'pot', kind: 'water_pot', n: 3, at: [0.1, 1.8], y: 0.12, seed: 32 });
      put(life.basket, { t: 'basket', at: [-0.2, -2.6], y: 0.12, rot: 0, n: 2, seed: 33 });
    }
  }
  // the steering oar: a long sweep over the stern, its handle forward to the steersman's hands, the blade trailing aft into the water
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.2, 0.7, -0.8], K = [0, 0.02, 0.18], B0 = [0, -0.6, 2.4], B1 = [0, -0.98, 3.4];
  beam(w, H, [0, 0.07, -0.02], 0.028, 6); beam(w, [0, 0.07, -0.02], K, 0.034, 6); beam(w, K, B0, 0.032, 6);
  const hw = 0.11, th = 0.02, d = [B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]], dl = Math.hypot(...d), du = d.map((x) => x / dl), side = [1, 0, 0];
  const upv = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const C = (p, s, t) => [0, 1, 2].map((i) => p[i] + side[i] * s + upv[i] * t);
  const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
  bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
}
