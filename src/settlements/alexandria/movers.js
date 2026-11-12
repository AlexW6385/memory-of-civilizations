// Alexandria about 250 BC — the moving life (docs/settlements/alexandria.md §9–§10): people on the Canopic Way, the street of the
// Soma, the agora, the quays, the Heptastadion, the Museion's garden and the streets between the houses; coasters under their
// square sail and lighters on the Great Harbour and the Eunostos. Data for the engine's movers (src/engine/movers.js), read in its
// worker; the format is Suzhou's (src/settlements/ming-suzhou/movers.js) and Venice's.

import { SEA, RADIUS, CANOPIC, SOMA, QUAY, AGORA, MOLE, ROYAL, GYMZONE, SEROUTE, MUSEION, STREETS_Z, ALLEYS_X, SHIPS, wet, inLot, inRect, lots } from './layout.js';
import '../../styles/ptolemaic/index.js';
import { shipParts } from '../../styles/ptolemaic/harbour.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 50, night: 6, rain: 0.7, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 8, reach: 260, spawnMin: 60, far: 95, speed: [0.9, 1.4], bridgeSpeed: 0.7 },
  water: SEA,
};

// ── the ways ─────────────────────────────────────────────────────────────────
const free = (x, z) => wet(x, z) > 2 && !inLot(x, z, 0.5) && !inRect(GYMZONE, x, z, 1) && !inRect(AGORA, x, z, 0) && !inRect(ROYAL, x, z, 0) && !inRect(SEROUTE.rect, x, z, 6) && Math.hypot(x, z) < RADIUS - 75;
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
    { r: [CANOPIC[0] + 12, CANOPIC[1] + 3, CANOPIC[2] - 20, CANOPIC[3] - 3], weight: 3.4, market: 1.2, kind: 'street' },
    { r: [SOMA[0] + 3, SOMA[1] + 8, SOMA[2] - 3, SOMA[3] - 6], weight: 2.8, market: 1.0, kind: 'street' },
    { r: [QUAY[0] + 4, QUAY[1] + 1, QUAY[2] - 6, QUAY[3] - 0.5], weight: 1.8, market: 1.4, kind: 'street' },
    { r: [AGORA[0] + 3, AGORA[1] + 12, AGORA[2] - 3, AGORA[3] - 12], weight: 2.6, market: 3, kind: 'street' },
    { r: [MOLE[0] + 4, -255, MOLE[2] - 4, -92], weight: 1.3, market: 1.0, kind: 'street' },
    { r: [201, -64, 291, -39], weight: 1.8, market: 0.3, kind: 'street', scholar: true },
    { r: [MUSEION[0] - 22, -88.5, 440, -84.5], weight: 1.5, market: 0.5, kind: 'street' },
  ];
  for (const z of STREETS_Z) for (const [a, b] of runs(z, true, -430, 430)) rects.push({ r: [a, z - 1.8, b, z + 1.8], weight: 1.1, market: 0.7, kind: 'street' });
  for (const x of ALLEYS_X) for (const [a, b] of runs(x, false, -82, 250)) rects.push({ r: [x - 1.8, a, x + 1.8, b], weight: 0.9, market: 0.6, kind: 'street' });
  return { rects, links: [], clip: RADIUS - 70 };
}
/** The water the boats keep to: the Great Harbour between the quay and the island, its mouth, the Eunostos. */
export function waterways() {
  const rects = [
    { r: [-224, -232, 420, -120], weight: 2 },
    { r: [-60, -300, 330, -232], weight: 1 },
    { r: [-390, -236, -252, -118], weight: 1.5 },
  ];
  return { rects: rects.map((q) => ({ r: q.r, weight: q.weight, horiz: q.r[2] - q.r[0] > q.r[3] - q.r[1] })), bridges: [], clip: RADIUS - 30 };
}
/** The ships at their moorings, as rectangles the moving boats keep clear of. */
export async function staticBoats() {
  return SHIPS.map((s) => ({ c: s.at, u: Math.abs(Math.sin(s.rot)) > 0.5 ? [1, 0] : [0, 1], hl: s.len / 2 + 0.6, hw: s.len * 0.15 + 0.6 }));   // (along x, or along z for those rotated)
}

// ── who walks ────────────────────────────────────────────────────────────────
// The three peoples the early Ptolemies kept apart (docs/settlements/alexandria.md §9): Greeks in the chiton and himation with the
// broad petasos, Egyptians in the linen kilt and the sheath dress, the Jews of the Delta quarter in Greek dress with the beard
// and a tasselled mantle; sailors, porters and the scholars of the Museion with their scrolls.
const CL = { white: 'cloth_white', linen: 'linen', ochre: 'cloth_ochre', brown: 'cloth_brown', red: 'cloth_red', indigo: 'cloth_indigo', green: 'cloth_green', grey: 'cloth_grey', maroon: 'cloth_maroon', blue: 'cloth_blue', black: 'cloth_black' };
export const WALKERS = [
  { id: 'greek', weight: 1.4, market: 1.3, el: { dress: 'robe', hair: 'short', over: 'cape', arms: 'hang', beard: true }, c1: [CL.white, CL.linen, CL.ochre, CL.white, CL.brown], c2: [CL.white, CL.ochre, CL.maroon, CL.indigo], c3: [CL.white], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'greek_woman', weight: 0.9, market: 1.5, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'shawl', arms: 'hang' }, swing: 0.7, c1: [CL.white, CL.red, CL.ochre, CL.indigo, CL.green], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'scholar', weight: 0.6, market: 0.5, scholar: 2.5, el: { dress: 'robe', hair: 'short', over: 'cape', arms: 'hang', beard: true }, c1: [CL.white, CL.linen, CL.grey], c2: [CL.white, CL.grey, CL.brown], c3: [CL.white], speed: [0.8, 1.0], stride: 1.3 },
  { id: 'egyptian', weight: 1.4, market: 1.2, el: { dress: 'shendyt', hair: 'shaven', arms: 'hang' }, c1: [CL.linen, CL.white, CL.linen], c2: [CL.linen, CL.ochre], c3: [CL.white], speed: [1.0, 1.25], stride: 1.4 },
  { id: 'egyptian_woman', weight: 1.0, market: 1.4, el: { dress: 'sheath', hair: 'long', arms: 'hang' }, swing: 0.7, c1: [CL.linen, CL.white, CL.red, CL.linen], c2: [CL.linen], c3: [CL.white], speed: [0.9, 1.15], stride: 1.2, h: [0.9, 0.97] },
  { id: 'labourer', weight: 1.2, market: 0.9, el: { dress: 'loincloth', hair: 'shaven', arms: 'hang' }, c1: [CL.linen, CL.white], c2: [CL.linen], c3: [CL.white], speed: [1.1, 1.35], stride: 1.45 },
  { id: 'jew', weight: 0.7, market: 1.4, quarter: 'jewish', el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'shawl', arms: 'hang', beard: true }, c1: [CL.white, CL.blue, CL.ochre, CL.linen], c2: [CL.white, CL.blue], c3: [CL.white], speed: [0.9, 1.15], stride: 1.35 },
  { id: 'sailor', weight: 1.0, market: 1.6, quay: 2.5, el: { dress: 'tunic', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, c1: [CL.white, CL.brown, CL.ochre, CL.linen], c2: [CL.brown, CL.red], c3: [CL.red, CL.brown], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'porter', weight: 1.0, market: 1.6, quay: 2.0, el: { dress: 'tunic', hair: 'short', carry: 'sack', over: 'belt' }, c1: [CL.brown, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.95, 1.2], stride: 1.15 },
  { id: 'water_carrier', weight: 0.8, market: 0.8, el: { dress: 'sheath', hair: 'long', carry: 'pot', arms: 'hang' }, swing: 0.7, c1: [CL.linen, CL.white, CL.red], c2: [CL.linen], c3: [CL.white], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'basket_woman', weight: 0.7, market: 1.8, el: { dress: 'robe', hair: 'bun', hat: 'veil', carry: 'basket', over: 'shawl' }, swing: 0.7, c1: [CL.white, CL.ochre, CL.red, CL.green], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'priest', weight: 0.4, market: 0.3, el: { dress: 'robe', hair: 'shaven', arms: 'hang', over: 'sash' }, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.8, 0.95], stride: 1.3 },
  { id: 'soldier', weight: 0.5, market: 0.7, el: { dress: 'tunic', hair: 'short', hat: 'brim', over: 'cape', carry: 'staff', beard: false }, c1: [CL.red, CL.maroon, CL.white], c2: [CL.maroon, CL.red], c3: [CL.brown], speed: [1.0, 1.2], stride: 1.4 },
];
/** The sailor at the steering oar on the stern, and the passenger on the deck. */
export const CREW = {
  boatman: { el: { dress: 'tunic', hair: 'short', hat: 'cap', over: 'belt', arms: 'pull' }, c1: [CL.white, CL.brown, CL.linen], c2: [CL.brown, CL.red], c3: [CL.red, CL.brown] },
  passenger: { el: { dress: 'robe', hair: 'short', over: 'cape', pose: 'sit_ground', beard: true }, c1: [CL.white, CL.linen], c2: [CL.white, CL.maroon], c3: [CL.white] },
};
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/** The coaster (a small round-hulled boat under its square sail: variant `covered`) and the lighter (`cargo`), near and far, and the steering oar. Built at 10.8 m, the bow toward −z, the waterline at y 0. */
export const BOAT = { L: 10.8, pin: [0.62, 1.15, 4.7], deck: 1.0, stern: 4.5, passenger: [0, 0.74, 0.5], hull: [1.65, 5.5] };
const group = (m) => (/cloth|linen|wicker|sacking/.test(m) ? 'fibre' : 'wood');
export function boatShapes(sb) {
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of shipParts(kind === 'covered' ? 'merchant' : 'lighter', 10.8, kind === 'covered' ? 3 : 4)) {
      if (far && (m === 'bronze' || m === 'opening')) continue;
      const mat = m === 'wood_dark' || m === 'pottery_dark' ? 'wood_dark' : m, gr = group(mat);
      const ng = g.index ? g.toNonIndexed() : g;
      sb.addPiece(v, gr, ng, { col: factor(gr, mat) });
    }
  }
  // the steering oar: the loom on its pin, the long blade running aft and down into the water
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
void lots;
