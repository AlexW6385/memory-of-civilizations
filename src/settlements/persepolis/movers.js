// Persepolis about 480 BC — the moving life (docs/settlements/persepolis.md §15): Persians in the long robe and the
// cap, Medes and the peoples of the empire in tunic and trousers, women veiled or with the hair bound, bearers with jars
// on the head, porters with sacks, masons and carpenters of the royal workshops, spearmen of the guard. Data for the
// engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js: the road to the stair, the
// cross streets of Parsa, the market and the workshops' forecourt, the stair itself and the terrace's avenue from the
// Gate of All Nations toward the Apadana. No boats.

import { RADIUS, ROAD, MARKET, WORKSHOPS, STREETS, STAIR, TERRACE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 4, rain: 0.5, reach: 160, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the road, the streets, the market, the workshops' forecourt, the stair and the terrace's avenue. */
export function walkways() {
  const rects = [], links = [];
  rects.push({ r: ROAD, weight: 3.2, market: 1.2, kind: 'street' });
  STREETS.slice(0, -1).forEach((r, i) => rects.push({ r, weight: i < 4 ? 0.9 : 0.7, market: 0.3, kind: 'lane' }));
  rects.push({ r: [MARKET[0], MARKET[1] + 14, MARKET[2], MARKET[3] - 14], weight: 2.4, market: 3, kind: 'street' });
  rects.push({ r: [WORKSHOPS[0], WORKSHOPS[1] - 10, WORKSHOPS[2] + 4, WORKSHOPS[1] - 3], weight: 1.4, market: 1, kind: 'street' });
  // up the stair: along the lower flight, the landing, back down the upper flight to the terrace
  const z = STAIR.z, up = (a, b) => links.push({ a, b, w: 2.6, kind: 'street', weight: 2.2 });
  up([-166, z], [-162.5, z]); up([-162.5, z], [-162.5, z - 54]); up([-162.5, z - 54], [-154, z - 54]); up([-154, z - 54], [-154, z - 6]); up([-154, z - 6], [-140, z]);
  // through the Gate of All Nations, then the terrace's avenue before the Apadana's north stairway
  up([-140, z], [-84, z]);
  rects.push({ r: [-90, -150, 38, -121], weight: 1.8, market: 1, kind: 'street' });
  void TERRACE;
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', linen: 'linen', green: 'cloth_green', maroon: 'cloth_maroon', grey: 'cloth_grey' };
export const WALKERS = [
  // the Persian: the long robe, the sash, the beard, a soft cap
  { id: 'persian', weight: 1.5, market: 1.4, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', beard: 1 },
    c1: [CL.white, CL.ochre, CL.maroon, CL.indigo, CL.linen], c2: [CL.red, CL.indigo, CL.ochre], c3: [CL.brown], speed: [0.95, 1.2], stride: 1.4 },
  // the Mede and the peoples: the belted tunic over trousers, the round cap
  { id: 'mede', weight: 1.5, market: 1.5, el: { dress: 'trousers', hat: 'cap', over: 'belt', arms: 'hang', beard: 1 },
    c1: [CL.brown, CL.ochre, CL.green, CL.red, CL.indigo], c2: [CL.brown, CL.indigo, CL.grey], c3: [CL.brown], speed: [1.0, 1.3], stride: 1.45 },
  { id: 'woman', weight: 1.1, market: 1.5, el: { dress: 'robe', hat: 'veil', over: 'sash', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.red, CL.ochre, CL.white, CL.green], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.85, 1.05], stride: 1.2, h: [0.9, 0.97] },
  // the bearer: a jar on the head
  { id: 'jar', weight: 1.2, market: 1.4, el: { dress: 'robe', hat: 'none', over: 'sash', carry: 'pot', arms: 'head', hair: 'bun' }, swing: 0.5,
    c1: [CL.indigo, CL.ochre, CL.brown, CL.red], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the porter: a sack on the shoulder
  { id: 'porter', weight: 1.3, market: 1.3, el: { dress: 'trousers', hat: 'cap', over: 'belt', arms: 'sack', carry: 'sack', beard: 1 },
    c1: [CL.brown, CL.ochre, CL.white, CL.grey], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  // the mason and the carpenter of the workshops: trousers, a leather apron, bare-headed or capped
  { id: 'craftsman', weight: 1.0, market: 0.8, el: { dress: 'trousers', hat: 'none', over: 'apron', arms: 'hang', beard: 1, hair: 'short' },
    c1: [CL.brown, CL.white, CL.ochre, CL.grey], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  // the spearman of the guard: the long robe, a staff upright at his side
  { id: 'guard', weight: 0.6, market: 0.5, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'staff', carry: 'staff', beard: 1 },
    c1: [CL.white, CL.ochre], c2: [CL.red], c3: [CL.brown], speed: [0.9, 1.1], stride: 1.4 },
  { id: 'boy', weight: 0.5, market: 0.7, el: { dress: 'robe', hat: 'none', over: 'none', arms: 'hang', hair: 'short' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    addFigure(sb, v, figure, { ...k.el }, { far, cape: null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
