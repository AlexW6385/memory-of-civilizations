// Brasília about 1970 — the moving life (docs/settlements/brasilia.md §10): civil servants in short-sleeved shirts, women in the dresses
// of the sixties, students in their school uniform, workers (candangos) in hats and work shirts, nuns and priests near the
// Cathedral, the soldiers of the guard. Data for the engine's movers (src/engine/movers.js, read in its worker), in Suzhou's
// format; the ways come from layout.js. No boats; the cars and buses stand as placed things (town.js).
import { RADIUS, LAWN, SQ, SQ2, SQS, AVENUE, SHOPS, CATH, PRACA, ALL_BLOCKS, RAMP, TUNNEL, ROAD_N, ROAD_S, MINISTRIES, MUSEU } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 52, night: 4, rain: 0.5, reach: 160, spawnMin: 26, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/**
 * The ways: the lawn's central path and its two edges along the carriageways, the apron at the foot of the Congress ramp, the
 * Three Powers Square, the Cathedral's plaza, the avenue's pavements, the commercial strip, the superquadra's lanes between the
 * block rows and the strips between the blocks' ends.
 */
export function walkways() {
  const rects = [], links = [];
  const R = (r, weight, market, kind = 'street') => rects.push({ r, weight, market, kind });
  R([LAWN[0] + 30, -3, RAMP.x0 - 2, 3], 1.4, 0.4);
  R([LAWN[0] + 30, -113, LAWN[2] - 70, -108], 1.0, 0.3);
  R([LAWN[0] + 30, 108, LAWN[2] - 70, 113], 1.0, 0.3);
  R([RAMP.x0 - 16, -30, RAMP.x0, 30], 1.6, 0.6, 'court');
  R([PRACA[0] + 6, -40, PRACA[2] - 6, 40], 1.2, 0.5, 'court');
  R([PRACA[0] + 6, -130, PRACA[2] - 6, -112], 0.8, 0.2, 'court');
  R([PRACA[0] + 6, 112, PRACA[2] - 6, 130], 0.8, 0.2, 'court');
  const [cx, cz] = CATH.c;
  R([cx - 62, 140.5, cx - 8, 146], 0.9, 0.4); R([cx + 8, 140.5, cx + 62, 146], 0.9, 0.4);
  R([cx + CATH.pool + 2, cz - 30, cx + CATH.pool + 12, cz + 40], 0.9, 0.3); R([cx - CATH.pool - 12, cz - 30, cx - CATH.pool - 2, cz + 40], 0.9, 0.3);
  R([cx - 30, cz + CATH.pool + 2, cx + 30, cz + CATH.pool + 12], 0.8, 0.3);
  R([AVENUE[0] - 5, AVENUE[1] + 10, AVENUE[0] - 1, AVENUE[3] - 20], 1.0, 0.8); R([AVENUE[2] + 1, AVENUE[1] + 10, AVENUE[2] + 5, AVENUE[3] - 20], 1.0, 0.8);
  R([SHOPS[0] - 3.3, SHOPS[1], SHOPS[0], SHOPS[3]], 1.6, 2.0);
  // the superquadra: the lanes between the block rows, the strips beyond the blocks' ends, the lawns' diagonals
  // the ministries' pavements along the carriageways' outer kerbs, and the bus-stop strips on the lawn side
  R([LAWN[0] + 30, ROAD_N[1] - 3.2, LAWN[2] - 70, ROAD_N[1] - 0.3], 0.8, 0.3); R([LAWN[0] + 30, ROAD_S[3] + 0.3, LAWN[2] - 70, ROAD_S[3] + 3.2], 0.8, 0.3);
  R([MUSEU[0] - 6, MUSEU[3] + 1, MUSEU[2] + 6, MUSEU[3] + 6], 0.9, 0.5, 'court');
  const rows = ALL_BLOCKS.map((b) => (b.rect[1] + b.rect[3]) / 2).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  for (const q of SQS) {
    for (let i = 0; i + 1 < rows.length; i++) R([q[0] + 6, (rows[i] + rows[i + 1]) / 2 - 1.5, q[2] - 6, (rows[i] + rows[i + 1]) / 2 + 1.5], 0.9, 0.4, 'lane');
    for (const x of [q[0] + 89, q[0] + 168, q[0] + 9]) R([x - 1.5, q[1] + 6, x + 1.5, q[3] - 6], 0.8, 0.4, 'lane');
    R([q[0] + 6, q[1] + 6, q[2] - 6, q[1] + 9], 0.6, 0.2, 'lane');
  }
  void TUNNEL; void SQ; void SQ2; void MINISTRIES;
  return { rects, links, clip: RADIUS - 20 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// After the dress of about 1970 (dossier §10): men in short-sleeved white or pale shirts, dark trousers; women in simple dresses,
// the hair short or tied; students in white shirt and blue skirt or trousers; candangos in work shirts and straw hats or caps; a nun
// in white and black; a priest in black; the guard in dark blue.
const CL = { grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', indigo: 'cloth_indigo', maroon: 'cloth_maroon', ochre: 'cloth_ochre' };
export const WALKERS = [
  { id: 'servant', weight: 2.2, market: 1.0, el: { dress: 'trousers', hair: 'short', hat: 'none', over: 'collar', arms: 'hang' },
    c1: [CL.white, CL.white, CL.blue, CL.ochre, CL.grey], c2: [CL.grey, CL.black, CL.indigo], c3: [CL.black, CL.brown], speed: [1.2, 1.55], stride: 1.5 },
  { id: 'briefcase', weight: 1.0, market: 0.6, el: { dress: 'trousers', hair: 'short', hat: 'none', over: 'collar', carry: 'bundle', arms: 'hang' },
    c1: [CL.white, CL.blue, CL.grey], c2: [CL.black, CL.indigo, CL.grey], c3: [CL.black, CL.brown], speed: [1.25, 1.6], stride: 1.5 },
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'robe', hair: 'bun', hat: 'none', over: 'belt', arms: 'hang' }, swing: 0.6,
    c1: [CL.red, CL.green, CL.ochre, CL.blue, CL.maroon, CL.white, CL.indigo], c2: [CL.white, CL.black, CL.brown], c3: [CL.black, CL.brown, CL.white], speed: [1.05, 1.4], stride: 1.3, h: [0.9, 0.96] },
  { id: 'shopper', weight: 1.0, market: 2.2, el: { dress: 'robe', hair: 'short', hat: 'none', over: 'none', carry: 'basket', arms: 'hang' }, swing: 0.5,
    c1: [CL.red, CL.green, CL.blue, CL.ochre], c2: [CL.white], c3: [CL.black, CL.brown], speed: [0.9, 1.2], stride: 1.2, h: [0.88, 0.95] },
  { id: 'student', weight: 1.4, market: 1.0, el: { dress: 'trousers', hair: 'short', hat: 'none', over: 'none', arms: 'hang' },
    c1: [CL.white], c2: [CL.blue, CL.indigo], c3: [CL.black, CL.brown], speed: [1.3, 1.8], stride: 1.3, h: [0.78, 0.9], swing: 1.1 },
  { id: 'schoolgirl', weight: 1.0, market: 1.0, el: { dress: 'robe', hair: 'bun', hat: 'none', over: 'none', arms: 'hang' }, swing: 0.8,
    c1: [CL.white], c2: [CL.blue], c3: [CL.white, CL.black], speed: [1.2, 1.7], stride: 1.2, h: [0.78, 0.88] },
  { id: 'candango', weight: 1.2, market: 0.6, el: { dress: 'trousers', hair: 'short', hat: 'straw', over: 'belt', arms: 'hang' },
    c1: [CL.ochre, CL.brown, CL.grey, CL.green], c2: [CL.brown, CL.indigo], c3: [CL.brown, CL.black], speed: [1.0, 1.35], stride: 1.5 },
  { id: 'nun', weight: 0.35, market: 0.5, el: { dress: 'robe', hair: 'short', hat: 'veil', over: 'none', arms: 'hang' },
    c1: [CL.white], c2: [CL.black], c3: [CL.black], speed: [0.9, 1.1], stride: 1.2, h: [0.9, 0.95] },
  { id: 'priest', weight: 0.3, market: 0.4, el: { dress: 'robe', hair: 'short', hat: 'none', over: 'none', arms: 'hang' },
    c1: [CL.black], c2: [CL.black], c3: [CL.black], speed: [0.9, 1.15], stride: 1.3 },
  { id: 'guard', weight: 0.4, market: 0.2, el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' },
    c1: ['prussian_blue'], c2: ['prussian_blue'], c3: [CL.black], speed: [0.95, 1.2], stride: 1.55 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    addFigure(sb, v, figure, { ...k.el }, { far });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
