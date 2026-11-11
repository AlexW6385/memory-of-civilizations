// Thebes about 1250 BC — the moving life (docs/settlements/thebes.md §8): workmen and porters in the white kilt, women in the sheath
// with bread and beer jars on the head, shaven priests in white with the sash, scribes and officials with the staff, boys; on the
// streets and lanes of the town, the workshop street, the market and quay, the avenue and the forecourt, the nave of the hall. On
// the river the cargo barges under their square sails and the papyrus skiffs work the water along the quay.
// Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js.

import { RADIUS, RIVER, QUAY, MARKET, AVENUE, WORKSHOP_Z, streets } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { boatFloat } from '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 58, night: 5, rain: 0.2, reach: 170, spawnMin: 26, far: 46 },
  boats: { count: 6, reach: 280, spawnMin: 70, far: 120, speed: [0.9, 1.5], bridgeSpeed: 0.8 },
  water: RIVER.level,
};

export function walkways() {
  const rects = [], r = (a, weight, market, kind = 'street') => rects.push({ r: a, weight, market, kind });
  for (const s of streets()) { const w = s[3] - s[2]; r(s, s[2] - s[0] > s[3] - s[1] ? 1.6 : 1.1, 0.8, w < 3.4 ? 'lane' : 'street'); void w; }
  // the workshop street carries more, the avenue to the gate carries the processions
  r([-166, WORKSHOP_Z - 2, 110, WORKSHOP_Z + 2], 2.4, 1.2);
  r([AVENUE.x0 + 4, -3.6, AVENUE.x1, 3.6], 2.6, 0.6);
  r([-170, -3, -14, 3], 2.2, 0.3);                                   // the gateway, the forecourt, the hall's nave, the pylons' gates, the court of the obelisks
  r([-163, -40, -114, 40], 1.0, 0.2);
  // the market and the quay's promenade
  r([MARKET[0] + 1, 28.8, MARKET[2] - 1, 31.8], 2.8, 3, 'street'); r([MARKET[0] + 1, 41.2, MARKET[2] - 1, 44.4], 2.8, 3, 'street');
  r([QUAY.x + 0.8, QUAY.z0 + 4, QUAY.x + 6.5, QUAY.z1 - 4], 2.6, 1.4);
  return { rects, links: [], clip: RADIUS - 20 };
}
/** The river along the quay, worked by the boats along its length (clear of the stairs' foot). */
export function waterways() { return { rects: [{ r: [RIVER.x - 28, -RADIUS + 20, QUAY.x - 8, RADIUS - 20], weight: 1 }], bridges: [], clip: RADIUS - 12 }; }
/** The moored boats (town.js) as rectangles the moving boats keep clear of. */
export async function staticBoats() {
  const { town } = await import('./town.js');
  const out = [];
  for (const p of await town()) for (const e of p.elements) {
    if (e.t !== 'boat') continue;
    const L = e.len ?? 8, r = e.rot ?? 0;
    out.push({ c: e.at, u: [Math.sin(r), Math.cos(r)], hl: L / 2 + 1, hw: 2.4 });
  }
  return out;
}

// ── who walks ──
const CL = { white: 'cloth_white', linen: 'linen', brown: 'cloth_brown', ochre: 'cloth_ochre', black: 'cloth_black' };
const KILT = { dress: 'shendyt', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', feet: 'bare', beard: 0 };
export const WALKERS = [
  { id: 'worker', weight: 2.6, market: 2.0, el: { ...KILT, hair: 'short' }, c1: [CL.white, CL.linen, CL.ochre], c2: [CL.white], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'porter', weight: 1.4, market: 1.8, el: { ...KILT, hair: 'short', arms: 'sack', carry: 'sack' }, c1: [CL.white, CL.linen, CL.brown], c2: [CL.white], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'bearer', weight: 1.8, market: 1.2, el: { dress: 'sheath', hat: 'none', over: 'none', arms: 'head', carry: 'pot', hair: 'long', feet: 'bare' }, swing: 0.5, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'woman', weight: 1.3, market: 1.5, el: { dress: 'sheath', hat: 'none', over: 'none', arms: 'hang', hair: 'long', feet: 'bare' }, swing: 0.7, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.8, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'priest', weight: 1.1, market: 0.4, el: { ...KILT, top: 'bare', hair: 'shaven', over: 'sash' }, c1: [CL.white], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.3 },
  { id: 'official', weight: 0.8, market: 0.8, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'sash', arms: 'staff', carry: 'staff', hair: 'long', feet: 'bare', beard: 0 }, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.8, el: { ...KILT, dress: 'loincloth', over: 'none', hair: 'short' }, c1: [CL.white], c2: [CL.white], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
/** The steersman at the stern and the merchant or scribe seated amidships. */
export const CREW = {
  boatman: { el: { ...KILT, arms: 'pull', hair: 'short' }, c1: [CL.white, CL.linen, CL.ochre], c2: [CL.white], c3: [CL.white] },
  passenger: { el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'sash', pose: 'cross', hair: 'long', feet: 'bare', beard: 0 }, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white] },
};
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far, cape: null });
  }
}

// ── what floats ──
/** The river barge under its square sail (variant `covered`: a seated passenger under the awning) and loaded (`cargo`: sacks and jars), and the steering sweep. The bow toward −z. */
export const BOAT = { L: 11, pin: [0.3, 0.55, 4.3], deck: -0.3, stern: 3.7, passenger: [0, -0.2, 0.9], hull: [1.8, 5.9] };
const beam = (out, p, q, r, n = 6) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
export function boatShapes(sb) {
  const grab = (fn, el) => { const got = []; fn(el, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {}, segment() {}, floor() {}, ramp() {} } }); return got; };
  const group = (m) => (/cloth|wicker|sacking|reed_mat|hide|thatch|rope/.test(m) ? 'fibre' : 'wood');
  const life = STYLES.life.elements, y = boatFloat('barge');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of grab(life.boat, { t: 'boat', kind: 'barge', at: [0, 0], y, rot: 0, len: BOAT.L, seed: 5 })) sb.addPiece(v, group(m), g, { slot: SLOT.none, col: factor(group(m), m) });
    // the mast and the square sail on its yard (the boat under way), the rope to the stern
    const w = [], mz = -0.9;
    beam(w, [0, -0.4, mz], [0, 6.0, mz], 0.1, 6); beam(w, [-2.3, 5.4, mz], [2.3, 5.4, mz], 0.05, 5); beam(w, [-2.0, 2.0, mz + 0.05], [2.0, 2.0, mz + 0.05], 0.04, 5);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.none, col: factor('wood', 'timber', 0.9) });
    const sail = [], X = 2.1, Y0 = 2.0, Y1 = 5.4, bz = (x, yy) => mz + 0.12 + 0.35 * Math.sin(Math.PI * (x / X + 1) / 2) * Math.sin(Math.PI * (yy - Y0) / (Y1 - Y0));
    const N = 6, Q = (i, j) => { const x = -X + 2 * X * i / N, yy = Y0 + (Y1 - Y0) * j / N; return [x, yy, bz(x, yy)]; };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const p = Q(i, j), q = Q(i + 1, j), r = Q(i + 1, j + 1), s = Q(i, j + 1); sail.push(...p, ...q, ...r, ...p, ...r, ...s, ...p, ...r, ...q, ...p, ...s, ...r); }
    sb.addPiece(v, 'fibre', flat(sail), { slot: SLOT.c3, col: factor('fibre', 'cloth_white') });
    if (kind === 'cargo') {
      const put = (fn, el) => { for (const [m, g] of grab(fn, el)) sb.addPiece(v, /wicker|sacking/.test(m) ? 'fibre' : 'wood', g, { slot: SLOT.none, col: factor(/wicker|sacking/.test(m) ? 'fibre' : 'wood', m) }); };
      put(life.sacks, { t: 'sacks', at: [0, 1.4], y: -0.3, rot: 0, n: 6, seed: 31 });
      put(life.pot, { t: 'pot', kind: 'water_pot', n: 4, at: [0.1, -2.2], y: -0.3, seed: 32 });
      put(life.basket, { t: 'basket', at: [-0.2, -3.8], y: -0.3, rot: 0, n: 2, seed: 33 });
    }
  }
  // the steering sweep: a long oar over the stern, its blade trailing aft into the water
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.2, 0.55, -0.8], K = [0, 0.02, 0.2], B0 = [0, -0.5, 2.0], B1 = [0, -0.9, 3.0];
  beam(w, H, [0, 0.07, -0.02], 0.03, 6); beam(w, [0, 0.07, -0.02], K, 0.036, 6); beam(w, K, B0, 0.034, 6);
  const hw = 0.12, th = 0.02, d = [B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]], dl = Math.hypot(...d), du = d.map((x) => x / dl), side = [1, 0, 0];
  const upv = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const C = (p, s, t) => [0, 1, 2].map((i) => p[i] + side[i] * s + upv[i] * t);
  const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
  bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
}
