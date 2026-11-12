// Manueline Lisbon about 1520 — the moving life (docs/settlements/manueline-lisbon.md §8): merchants, porters, sailors and
// shipwrights on the quay, the Terreiro do Paço and the Rua Nova, fishwives and washerwomen in the lanes, Hieronymite monks before
// the Jerónimos, nobles in doublet and cape; small lateen boats on the Tagus. Data for the engine's movers (src/engine/movers.js,
// read in its worker); the format is Alexandria's and Suzhou's. The ways come from layout.js.

import { SEA, SHIPS, RADIUS, QUAY, RUA_NOVA, TERREIRO, PLAZA, SQUARE, YARD, PALACE, ZS, ALLEYS, CLOISTER, CHURCH, shore, wet, inLot, inRect } from './layout.js';
import '../../styles/manueline/index.js';
import { shipParts } from '../../styles/manueline/ships.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 60, night: 6, rain: 0.6, reach: 160, spawnMin: 28, far: 46 },
  boats: { count: 8, reach: 260, spawnMin: 60, far: 95, speed: [0.9, 1.5], bridgeSpeed: 0.7 },
  water: SEA,
};

// ── the ways ─────────────────────────────────────────────────────────────────
const free = (x, z) => wet(x, z) > 2 && !inLot(x, z, 0.5) && !inRect(PALACE, x, z, 0) && Math.hypot(x, z) < RADIUS - 75;
/** The runs along a line (x or z varying) where the street is free of houses and water: [[a, b], …]. */
function runs(fixed, alongX, from, to) {
  const out = []; let a = null;
  for (let t = from; t <= to; t += 3) {
    const ok = alongX ? free(t, fixed) : free(fixed, t);
    if (ok && a === null) a = t;
    if ((!ok || t + 3 > to) && a !== null) { if (t - a >= 12) out.push([a, t - 3]); a = null; }
  }
  return out;
}
export function walkways() {
  const rects = [
    { r: [QUAY[0] + 6, QUAY[1] - 3, QUAY[2] - 8, QUAY[1] + 1.5], weight: 2.2, market: 1.4, kind: 'street', quay: 1 },
    { r: [RUA_NOVA[0] + 4, RUA_NOVA[1] + 1, RUA_NOVA[2] - 4, RUA_NOVA[3] - 1], weight: 3.4, market: 2.2, kind: 'street' },
    { r: [TERREIRO[0] + 4, TERREIRO[1] + 6, TERREIRO[2] - 4, TERREIRO[3] - 6], weight: 2.4, market: 1.2, kind: 'street' },
    { r: [YARD[0] + 6, YARD[1] + 6, YARD[2] - 10, YARD[3] - 8], weight: 1.4, market: 0.3, kind: 'street', yard: 1 },
    { r: [PLAZA[0] + 6, PLAZA[1] + 4, -170, PLAZA[3] - 6], weight: 1.8, market: 0.8, kind: 'street', monk: 1 },
    { r: [SQUARE[0] + 3, SQUARE[1] + 3, SQUARE[2] - 3, SQUARE[3] - 3], weight: 1.6, market: 1.2, kind: 'street' },
    { r: [-260, shore(-200) - 14, -118, shore(-130) - 3], weight: 1.4, market: 0.6, kind: 'street', quay: 1.6 },
    // the cloister's four galleries: the friars walk them
    { r: [CLOISTER[0] + 1.5, CLOISTER[1] + 1.2, CLOISTER[2] - 1.5, CLOISTER[1] + 5.8], weight: 1.0, market: 0, kind: 'street', monk: 5 },
    { r: [CLOISTER[0] + 1.5, CLOISTER[3] - 5.8, CLOISTER[2] - 1.5, CLOISTER[3] - 1.2], weight: 1.0, market: 0, kind: 'street', monk: 5 },
    { r: [CLOISTER[0] + 1.2, CLOISTER[1] + 6, CLOISTER[0] + 5.8, CLOISTER[3] - 6], weight: 1.0, market: 0, kind: 'street', monk: 5 },
    { r: [CLOISTER[2] - 5.8, CLOISTER[1] + 6, CLOISTER[2] - 1.2, CLOISTER[3] - 6], weight: 1.0, market: 0, kind: 'street', monk: 5 },
  ];
  for (const z of ZS) for (const [a, b] of runs(z, true, -300, 290)) rects.push({ r: [a, z - 1.8, b, z + 1.8], weight: 1.0, market: 0.6, kind: 'street' });
  for (const x of ALLEYS) for (const [a, b] of runs(x, false, -250, 95)) rects.push({ r: [x - 1.6, a, x + 1.6, b], weight: 0.8, market: 0.5, kind: 'street' });
  return { rects, links: [], clip: RADIUS - 60 };
}
/** The water the boats keep to: the Tagus along the whole waterfront, clear of the carracks' anchorage by staticBoats. */
export function waterways() {
  const rects = [
    { r: [-170, 106, 290, 150], weight: 2 },
    { r: [-290, 138, 120, 230], weight: 1.4 },
    { r: [120, 150, 290, 236], weight: 1 },
  ];
  return { rects: rects.map((q) => ({ r: q.r, weight: q.weight, horiz: q.r[2] - q.r[0] > q.r[3] - q.r[1] })), bridges: [], clip: RADIUS - 30 };
}
export async function staticBoats() {
  return SHIPS.map((s) => ({ c: s.at, u: [Math.sin(s.rot), -Math.cos(s.rot)], hl: s.len / 2 + 0.6, hw: s.len * 0.16 + 0.8 }));
}

// ── who walks ────────────────────────────────────────────────────────────────
const CL = { white: 'cloth_white', ochre: 'cloth_ochre', brown: 'cloth_brown', red: 'cloth_red', indigo: 'cloth_indigo', green: 'cloth_green', grey: 'cloth_grey', maroon: 'cloth_maroon', blue: 'cloth_blue', black: 'cloth_black' };
export const WALKERS = [
  { id: 'merchant', weight: 1.4, market: 2.2, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'cape', arms: 'hang', beard: true }, c1: [CL.black, CL.maroon, CL.indigo, CL.green, CL.brown], c2: [CL.black, CL.maroon, CL.grey], c3: [CL.black], speed: [0.9, 1.15], stride: 1.35 },
  { id: 'noble', weight: 0.5, market: 1.0, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'brim', over: 'cape', arms: 'hang', beard: false }, c1: [CL.red, CL.blue, CL.black, CL.green, CL.maroon], c2: [CL.black, CL.maroon, CL.ochre], c3: [CL.black], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'woman', weight: 1.2, market: 1.7, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'shawl', arms: 'hang' }, swing: 0.7, c1: [CL.brown, CL.ochre, CL.red, CL.indigo, CL.green, CL.white], c2: [CL.white, CL.black, CL.ochre], c3: [CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'fishwife', weight: 0.7, market: 1.6, quay: 1.8, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'apron', carry: 'basket', arms: 'head' }, swing: 0.5, c1: [CL.brown, CL.indigo, CL.ochre], c2: [CL.white, CL.grey], c3: [CL.white], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'sailor', weight: 1.2, market: 1.4, quay: 2.8, yard: 1.2, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, c1: [CL.white, CL.brown, CL.ochre, CL.blue], c2: [CL.red, CL.brown, CL.grey], c3: [CL.red, CL.brown], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'porter', weight: 1.1, market: 1.5, quay: 2.4, yard: 1.0, el: { dress: 'tunic', hair: 'short', carry: 'sack', over: 'belt' }, c1: [CL.brown, CL.ochre, CL.grey], c2: [CL.brown], c3: [CL.brown], speed: [0.95, 1.2], stride: 1.15 },
  { id: 'shipwright', weight: 0.9, market: 0.3, yard: 4.0, el: { dress: 'tunic', hair: 'short', hat: 'cap', over: 'apron', arms: 'hang' }, c1: [CL.brown, CL.ochre, CL.white], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [0.9, 1.15], stride: 1.3 },
  { id: 'child', weight: 0.5, market: 1.0, el: { dress: 'tunic', child: true, hair: 'short', hat: 'none', over: 'none' }, c1: [CL.brown, CL.ochre, CL.white, CL.red], c2: [CL.brown], c3: [CL.brown], speed: [1.0, 1.5], stride: 1.0 },
  { id: 'friar_brown', weight: 0.3, market: 0.5, el: { dress: 'robe', hair: 'shaven', over: 'cape', arms: 'hang' }, c1: [CL.brown, CL.grey], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.0], stride: 1.2 },
  { id: 'monk', weight: 0.5, market: 0.4, monk: 4.0, el: { dress: 'robe', hair: 'shaven', over: 'cape', arms: 'hang' }, c1: [CL.white], c2: [CL.black], c3: [CL.white], speed: [0.7, 0.9], stride: 1.2 },
  { id: 'slave', weight: 0.6, market: 1.0, quay: 1.4, el: { dress: 'tunic', hair: 'short', carry: 'sack', over: 'none' }, c1: [CL.grey, CL.brown, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.95, 1.2], stride: 1.2 },
  { id: 'soldier', weight: 0.4, market: 0.7, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'brim', over: 'cape', carry: 'staff', beard: false }, c1: [CL.red, CL.maroon, CL.white], c2: [CL.maroon, CL.red], c3: [CL.brown], speed: [1.0, 1.2], stride: 1.4 },
];
export const CREW = {
  boatman: { el: { dress: 'tunic', hair: 'short', hat: 'cap', over: 'belt', arms: 'pull' }, c1: [CL.white, CL.brown, CL.blue], c2: [CL.brown, CL.red], c3: [CL.red, CL.brown] },
  passenger: { el: { dress: 'robe', hair: 'short', over: 'cape', pose: 'sit_ground', beard: true }, c1: [CL.black, CL.maroon, CL.indigo], c2: [CL.black, CL.grey], c3: [CL.black] },
};
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/** The barca (a small lateen boat of the river: variants `covered` with a passenger, `cargo`), near and far, and the steering oar. Built at 9 m, the bow toward −z, the waterline at y 0. */
export const BOAT = { L: 9, pin: [0.5, 1.0, 4.0], deck: 0.8, stern: 3.8, passenger: [0, 0.7, 0.8], hull: [1.5, 4.6] };
const group = (m) => (/cloth|linen|wicker|sacking/.test(m) ? 'fibre' : 'wood');
export function boatShapes(sb) {
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of shipParts('barca', 9, kind === 'covered' ? 3 : 4)) {
      if (far && m === 'opening') continue;
      const gr = group(m), ng = g.index ? g.toNonIndexed() : g;
      sb.addPiece(v, gr, ng, { col: factor(gr, m) });
    }
  }
  const v = sb.variant('oar'), w = [], bl = [];
  const beam = (out, p, q, r, n = 6) => {
    const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((x) => x / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (t) => { const m = Math.hypot(...t) || 1; return t.map((x) => x / m); };
    const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
    const A = ring(p), B = ring(q);
    for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  };
  const H = [-0.2, 1.05, -0.8], K = [0, 0.05, 0.1], B0 = [0.1, -0.5, 2.4], B1 = [0.2, -1.0, 3.5];
  beam(w, H, [0, 0.12, -0.05], 0.035, 6); beam(w, [0, 0.12, -0.05], K, 0.04, 6); beam(w, K, B0, 0.035, 6);
  const hw = 0.11, th = 0.02, d = [B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]], dl = Math.hypot(...d), du = d.map((x) => x / dl), side = [1, 0, 0], upv = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const C = (p, s, t) => [0, 1, 2].map((i) => p[i] + side[i] * s + upv[i] * t);
  const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
  bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'wood_dark', 1.2) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'wood_dark', 1.0) });
}
