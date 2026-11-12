// Delphi about 400 BC — the moving life (docs/settlements/delphi.md §8): pilgrims and consultants of many cities on the Sacred Way and
// the terrace in chiton and himation, the chlamys and the broad petasos; priests in white linen; women in the peplos and veil, some
// with the hydria going to the Castalian spring; slaves and porters with sacks, baskets and the gifts; goatherds; boys; athletes
// going up to the stadium. Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js.
// No boats.

import { RADIUS, WAY, WAY2, TT, FC, SPRING, STADIUM, STOA, lanes, alleys } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 85, night: 5, rain: 0.6, reach: 170, spawnMin: 20, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -40,
};

/** The ways: the Sacred Way and the path to the stadium as links; the terrace east and about the temple, the forecourt, the spring's court, the stoa's front, the stadium's track. */
export function walkways() {
  const rects = [], links = [];
  for (let i = 0; i < WAY.length - 1; i++) links.push({ a: WAY[i], b: WAY[i + 1], w: 3.0, kind: 'street', weight: 3.4 });
  for (let i = 0; i < WAY2.length - 1; i++) links.push({ a: WAY2[i], b: WAY2[i + 1], w: 2.0, kind: 'street', weight: 1.4 });
  // the village: along each lane, and down the alleys' stairs
  for (const r of lanes()) links.push({ a: [r.x0, r.z - 0.3], b: [r.x1, r.z - 0.3], w: 2.2, kind: 'lane', weight: 0.9 });
  for (const q of alleys()) if (q.up && q.dn) links.push({ a: [(q.x0 + q.x1) / 2, q.up.z + 1.4], b: [(q.x0 + q.x1) / 2, q.dn.z - 0.3], w: 1.6, kind: 'lane', weight: 0.5 });
  rects.push({ r: [33, -20, 90, 24], weight: 2.2, market: 1.2, kind: 'street' });
  rects.push({ r: [-34, 13.6, 33, 24], weight: 1.0, market: 0.6, kind: 'street' });
  rects.push({ r: [-34, -21, 33, -13.8], weight: 0.6, market: 0.3, kind: 'street' });
  rects.push({ r: [92, 108, 150, 130], weight: 1.8, market: 2.4, kind: 'street' });
  rects.push({ r: [SPRING[0] - 9, SPRING[1] + 1, SPRING[0] - 1, SPRING[3] - 1], weight: 1.4, market: 0.6, kind: 'street' });
  rects.push({ r: [-14, 38.5, 90, 41.5], weight: 1.4, market: 0.6, kind: 'street' });
  rects.push({ r: [STADIUM[0] + 6, STADIUM[1] + 3, STADIUM[2] - 6, STADIUM[3] - 3], weight: 1.0, market: 0.2, kind: 'lane' });
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon', linen: 'linen' };
export const WALKERS = [
  // the citizen: the chiton under the himation thrown over the left shoulder, a beard, bare-headed
  { id: 'citizen', weight: 2.4, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'cloak', arms: 'hang', hair: 'short', beard: 1 },
    c1: [CL.white, CL.linen, CL.ochre, CL.white], c2: [CL.white, CL.brown, CL.indigo, CL.red, CL.grey], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.4 },
  // the philosopher or the poor old citizen: the himation alone over the bare chest, barefoot
  { id: 'philosopher', weight: 0.8, market: 0.8, el: { dress: 'wrap', top: 'bare', hat: 'none', arms: 'hang', hair: 'short', beard: 1, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.65, 0.85], stride: 1.3 },
  // the priest of Apollo: the long white robe, the laurel in the hair, barefoot
  { id: 'priest', weight: 0.9, market: 0.8, el: { dress: 'robe', hat: 'none', over: 'cloak', arms: 'hang', hair: 'short', beard: 1, feet: 'bare' },
    c1: [CL.white, CL.white, CL.linen], c2: [CL.white], c3: [CL.brown], speed: [0.6, 0.8], stride: 1.2 },
  // the ephebe or young horseman: the short chiton, the chlamys at the shoulder, the broad petasos
  { id: 'young', weight: 1.0, market: 0.8, el: { dress: 'tunic', legs: 'bare', hat: 'brim', over: 'cloak', arms: 'hang', hair: 'short', beard: 0 },
    c1: [CL.white, CL.ochre, CL.linen], c2: [CL.red, CL.indigo, CL.green, CL.brown], c3: [CL.brown, CL.ochre], speed: [1.1, 1.45], stride: 1.5 },
  // the woman: the peplos pinned at the shoulders, a shawl, the hair bound, often veiled
  { id: 'woman', weight: 1.3, market: 1.6, el: { dress: 'robe', hat: 'veil', over: 'shawl', arms: 'hang', hair: 'bun' }, swing: 0.7,
    c1: [CL.white, CL.red, CL.ochre, CL.indigo, CL.linen], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  // the woman with the hydria on her head, going to or from the fountain
  { id: 'hydria', weight: 1.1, market: 1.3, el: { dress: 'robe', hat: 'none', over: 'shawl', hair: 'bun', carry: 'pot', arms: 'head' }, swing: 0.5,
    c1: [CL.white, CL.red, CL.ochre, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the slave or workman: the short tunic belted, the felt cap, bare legs, a sack or a basket
  { id: 'slave', weight: 1.6, market: 1.5, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'hang', hair: 'short', beard: 0.4, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown, CL.grey], speed: [0.9, 1.2], stride: 1.3 },
  { id: 'porter', weight: 1.0, market: 1.6, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'hang', carry: 'basket', hair: 'short', beard: 0.3, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'sacker', weight: 0.8, market: 1.3, el: { dress: 'tunic', legs: 'bare', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'short', beard: 0.5, feet: 'bare' },
    c1: [CL.brown, CL.linen, CL.grey], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  // the athlete: the loincloth, oiled bare skin, going up to the stadium or back from it
  { id: 'athlete', weight: 0.7, market: 0.2, el: { dress: 'loincloth', hat: 'none', arms: 'hang', hair: 'short', beard: 0, feet: 'bare' },
    c1: [CL.linen, CL.white], c2: [CL.white], c3: [CL.brown], speed: [1.3, 1.9], stride: 1.6 },
  // the goatherd with his staff and the old woman at the lane's door
  { id: 'goatherd', weight: 0.6, market: 0.3, el: { dress: 'tunic', legs: 'bare', hat: 'brim', over: 'cloak', arms: 'hang', carry: 'staff', hair: 'short', beard: 0.8, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [0.7, 0.95], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'tunic', legs: 'bare', hat: 'none', arms: 'hang', hair: 'short', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
