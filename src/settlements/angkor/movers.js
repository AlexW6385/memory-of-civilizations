// Angkor — the moving life of the moat road, the market and the village (docs/settlements/angkor.md §16):
// people walking the road round the moat and the market's aisles in the dress Zhou Daguan saw in 1296
// (men and women alike in a wrapped cloth, the breast bare, the hair in a knot): women with water pots
// and baskets on the head, farmers with the shoulder pole and its two baskets and the conical straw
// hat, men going to the temple, a Brahmin in white. Data for the engine's movers (src/engine/movers.js),
// read in its worker: the ways (from layout.js), who walks. No boats (the moat is the temple's), no
// beasts among the walkers (the elephants and the ox-cart stand in town.js).

import { RADIUS, MOAT, ROAD, MARKET } from './layout.js';
import '../../styles/khmer/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 30, night: 4, rain: 0.6, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: MOAT ? -1.2 : 0,
};

/** The road round the moat (its four sides) and the market's aisles; the market busy by day ("every day from six in the morning until midday"). */
export function walkways() {
  const [r0, s0, r1, s1] = ROAD, [a0, b0, a1, b1] = MOAT.outer, rects = [];
  for (const r of [[r0, s0, r1, b0], [r0, b1, r1, s1], [r0, b0, a0, b1], [a1, b0, r1, b1]]) rects.push({ r, weight: 1.0, market: 0, kind: 'street' });
  const [x0, z0, x1, z1] = MARKET;
  for (const z of [z0 + 6.2, z0 + 12.3, z0 + 18.2, z0 + 24.3]) rects.push({ r: [x0 + 1, z - 0.8, x1 - 1, z + 0.8], weight: 0.6, market: 1.0, kind: 'lane' });
  // the way from the road into the market
  rects.push({ r: [x1, z0 + 5, r0, z0 + 8], weight: 0.8, market: 0.5, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

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
  // the child
  { id: 'child', weight: 0.4, market: 0.3, el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'hang', feet: 'bare' },
    c1: [CL.red, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.white], speed: [1.2, 1.7], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
export const CREW = {};

/** The walkers' set (variants `${id}|${dry|wet}|${near|far}`): in the rain the palm-leaf cape over the straw hat. */
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    if (wet && k.wet === 'cape' && !el.carry) el.hat = 'straw';
    addFigure(sb, v, figure, el, { far, cape: wet && k.wet === 'cape' ? 'thatch_palm' : null });
  }
}

export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* the moat carries none */ }
