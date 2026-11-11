// Angkor — the moving life of the moat road, the market and the village (docs/settlements/angkor.md §16):
// people walking the road round the moat and the market's aisles in the dress Zhou Daguan saw in 1296
// (men and women alike in a wrapped cloth, the breast bare, the hair in a knot): women with water pots
// and baskets on the head, farmers with the shoulder pole and its two baskets and the conical straw
// hat, men going to the temple, a Brahmin in white. Data for the engine's movers (src/engine/movers.js),
// read in its worker: the ways (from layout.js), who walks. No boats (the moat is the temple's), no
// beasts among the walkers (the elephants and the ox-cart stand in town.js).

import { RADIUS, MOAT, ROAD, MARKET, ENC_PATHS, CAUSEWAY, moatLanes } from './layout.js';
import { mooredBoats } from './yards.js';
import '../../styles/khmer/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import '../../styles/siamese/index.js';
import { boatParts } from '../../styles/siamese/index.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 5, rain: 0.6, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 6, reach: 240, spawnMin: 50, far: 95, speed: [0.6, 1.0], bridgeSpeed: 0.6 },
  water: -1.2,
};

/** The road round the moat (its four sides) and the market's aisles; the market busy by day ("every day from six in the morning until midday"). */
export function walkways() {
  const [r0, s0, r1, s1] = ROAD, [a0, b0, a1, b1] = MOAT.outer, rects = [];
  for (const r of [[r0, s0, r1, b0], [r0, b1, r1, s1], [r0, b0, a0, b1], [a1, b0, r1, b1]]) rects.push({ r, weight: 1.0, market: 0, kind: 'street' });
  const [x0, z0, x1, z1] = MARKET;
  for (const z of [z0 + 6.2, z0 + 12.3, z0 + 18.2, z0 + 24.3]) rects.push({ r: [x0 + 1, z - 0.8, x1 - 1, z + 0.8], weight: 0.6, market: 1.0, kind: 'lane' });
  // the way from the road into the market
  rects.push({ r: [x1, z0 + 5, r0, z0 + 8], weight: 0.8, market: 0.5, kind: 'lane' });
  // the causeways (devotees and pilgrims go in to the temple) and the enclosure's paths between the quarters of its servants
  rects.push({ r: [CAUSEWAY.outer[0] + 2, -2.4, CAUSEWAY.outer[2] - 2, 2.4], weight: 0.9, market: 0, kind: 'lane' });
  for (const r of ENC_PATHS) rects.push({ r, weight: 0.5, market: 0, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 14 };
}
/** The moat: its four reaches' middle lines (the causeway's bridge cuts the west reaches). */
export function waterways() { return { rects: moatLanes().map((r) => ({ r, weight: 1 })), bridges: [], clip: RADIUS - 18 }; }
/** The canoes moored at the banks (yards.js): hulls the moving boats keep clear of. */
export async function staticBoats() { return mooredBoats(); }

const CL = { red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', white: 'cloth_white', indigo: 'cloth_indigo', maroon: 'cloth_maroon', green: 'cloth_green' };
export const WALKERS = [
  // the woman: the wrapped cloth (sampot), the breast bare or a shawl, the knot of hair
  { id: 'woman', weight: 1.4, market: 1.6, el: { dress: 'wrap', top: 'bare', hair: 'bun', over: 'none', arms: 'hang', feet: 'bare' }, wet: 'cape', swing: 0.7,
    c1: [CL.red, CL.ochre, CL.brown, CL.indigo, CL.maroon, CL.green], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  // the woman with a water pot on her head
  { id: 'potwoman', weight: 0.9, market: 0.5, el: { dress: 'wrap', top: 'bare', hair: 'bun', over: 'none', arms: 'hang', carry: 'pot', feet: 'bare' }, wet: 'cape', swing: 0.5,
    c1: [CL.red, CL.ochre, CL.brown, CL.indigo], c2: [CL.white], c3: [CL.white], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.96] },
  // the woman with a basket of goods on her head, bound for the market
  { id: 'basketwoman', weight: 0.9, market: 1.5, el: { dress: 'wrap', top: 'bare', hair: 'bun', over: 'shawl', arms: 'hang', carry: 'basket', feet: 'bare' }, wet: 'cape', swing: 0.5,
    c1: [CL.ochre, CL.brown, CL.green, CL.red], c2: [CL.white], c3: [CL.white], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.96] },
  // the man: the wrapped cloth, the breast bare, the hair in a knot
  { id: 'man', weight: 1.2, market: 1.0, el: { dress: 'wrap', top: 'bare', hair: 'bun', arms: 'hang', feet: 'bare' }, wet: 'cape',
    c1: [CL.indigo, CL.brown, CL.ochre, CL.red, CL.maroon], c2: [CL.white, CL.brown], c3: [CL.white], speed: [1.05, 1.35], stride: 1.45 },
  // the farmer with the pole and two baskets, the conical hat of straw
  { id: 'farmer', weight: 1.0, market: 0.9, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'straw', carry: 'pole', arms: 'pole', feet: 'bare' }, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.brown, CL.ochre], c2: [CL.white, CL.brown], c3: [CL.white], speed: [1.0, 1.25], stride: 1.1, pole: true },
  // the Brahmin: white cloth, the breast bare, the knot, the sacred cord
  { id: 'brahmin', weight: 0.35, market: 0.2, el: { dress: 'wrap', top: 'bare', hair: 'bun', over: 'sash', arms: 'hang', feet: 'bare' },
    c1: [CL.white], c2: [CL.white], c3: [CL.white], speed: [0.9, 1.1], stride: 1.4 },
  // the fisher: the shoulder pole with a net and a fish basket, the straw hat; the carrier of a headload of firewood or cloth; the man with a sack of rice
  { id: 'fisher', weight: 0.5, market: 0.2, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'straw', carry: 'pole', arms: 'pole', feet: 'bare' }, wet: 'cape', swing: 0.75,
    c1: [CL.brown, CL.indigo], c2: [CL.white], c3: [CL.white], speed: [1.0, 1.25], stride: 1.1, pole: true },
  { id: 'headload', weight: 0.7, market: 0.8, el: { dress: 'wrap', top: 'bare', hair: 'bun', over: 'none', arms: 'hang', carry: 'headload', feet: 'bare' }, wet: 'cape', swing: 0.5,
    c1: [CL.ochre, CL.brown, CL.red, CL.green], c2: [CL.white], c3: [CL.white], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.96] },
  { id: 'sackman', weight: 0.5, market: 0.7, el: { dress: 'wrap', top: 'bare', hair: 'bun', arms: 'sack', carry: 'sack', feet: 'bare' }, wet: 'cape',
    c1: [CL.indigo, CL.brown, CL.maroon], c2: [CL.white], c3: [CL.white], speed: [0.95, 1.2], stride: 1.3 },
  // the child
  { id: 'child', weight: 0.4, market: 0.3, el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'hang', feet: 'bare' },
    c1: [CL.red, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.white], speed: [1.2, 1.7], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
/** The boatman standing at the stern with the paddle, and the passenger sitting on the bottom of the boat. */
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'straw', arms: 'pull', feet: 'bare' }, wet: 'cape', c1: [CL.indigo, CL.brown, CL.red], c2: [CL.white], c3: [CL.white] },
  passenger: { el: { dress: 'wrap', top: 'bare', hair: 'bun', over: 'shawl', pose: 'sit_ground', legs: 'cross', feet: 'bare' }, c1: [CL.red, CL.green, CL.ochre], c2: [CL.white], c3: [CL.white] },
};

/** The walkers' set (variants `${id}|${dry|wet}|${near|far}`): in the rain the palm-leaf cape over the straw hat. */
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    if (wet && k.wet === 'cape' && !el.carry) el.hat = 'straw';
    addFigure(sb, v, figure, el, { far, cape: wet && k.wet === 'cape' ? 'thatch_palm' : null });
  }
}

/** The sampan paddled from the stern (6 m, the bow toward −z, the waterline at y 0): the covered one with an awning of atap over a passenger, the loaded one with fruit. */
export const BOAT = { L: 6, pin: [0.5, 0.6, 2.3], deck: 0.42, stern: 2.3, passenger: [0, 0.1, -0.2], hull: [0.75, 3.1] };
const beam = (out, p, q, r, n = 5) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
const fibre = /thatch|cloth|wicker|sacking|reed|glaze|terracotta|silver/;
export function boatShapes(sb) {
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    const parts = boatParts(kind === 'covered' ? { kind: 'sampan', len: 6, awning: 'atap', load: 'empty', seed: 3 } : { kind: 'sampan', len: 6, load: 'fruit', seed: 5 });
    for (const [m, g] of parts) { const grp = fibre.test(m) ? 'fibre' : 'wood'; sb.addPiece(v, grp, g, { slot: SLOT.none, col: factor(grp, m) }); }
  }
  // the paddle: held at the stern, the shaft down and aft to a leaf-shaped blade in the water
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.2, 0.95, -0.7], K = [0, 0.0, 0.0], B0 = [0.1, -0.4, 1.7], B1 = [0.14, -0.95, 2.45];
  beam(w, H, K, 0.026, 6); beam(w, K, B0, 0.026, 6);
  for (let k = 0; k < 6; k++) {
    const t0 = k / 6, t1 = (k + 1) / 6, wd = (t) => 0.02 + 0.09 * Math.sin(Math.PI * Math.min(1, t * 1.25 + 0.1));
    const P = (t, s) => [B0[0] + (B1[0] - B0[0]) * t + s, B0[1] + (B1[1] - B0[1]) * t, B0[2] + (B1[2] - B0[2]) * t];
    const a = P(t0, -wd(t0)), b = P(t0, wd(t0)), c = P(t1, wd(t1)), e = P(t1, -wd(t1));
    bl.push(...a, ...b, ...c, ...a, ...c, ...e, ...a, ...c, ...b, ...a, ...e, ...c);
  }
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.8) });
}
