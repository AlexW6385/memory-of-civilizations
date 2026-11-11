// Nara in 752 — the moving life (docs/settlements/nara.md §13): monks, officials, townspeople and porters walking the
// avenues and lanes of the capital, the East Market's aisle and the court of Tōdai-ji. Data for the engine's movers
// (src/engine/movers.js), read in its worker: the ways (layout.js), who walks. There is no water to float on.
// Format as Suzhou's (src/settlements/ming-suzhou/movers.js).

import { RADIUS, COURT, MARKET, streets } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 4, rain: 0.6, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/** The avenues and lanes of the capital, the market's aisle, the temple's court: { rects, links, clip }. */
export function walkways() {
  const [mx0, mz0, mx1, mz1] = MARKET.block, cz = (mz0 + mz1) / 2;
  const rects = streets().map((r) => {
    const w = Math.min(r[2] - r[0], r[3] - r[1]);
    return { r, weight: w > 12 ? 1.8 : 0.9, market: 0.3, kind: w > 12 ? 'street' : 'lane' };
  });
  rects.push({ r: [mx0 + 1, cz - 3.2, mx1 - 1, cz + 3.2], weight: 4.5, market: 1, kind: 'street' });          // the market's aisle
  rects.push({ r: [mx0 + 1, mz0 + 0.5, mx0 + 4, mz1 - 0.5], weight: 1.2, market: 1, kind: 'lane' });
  rects.push({ r: [COURT[0] + 8, COURT[1] + 6, COURT[2] - 8, -38], weight: 0.6, market: 0, kind: 'street', temple: true });   // before the hall (the ceremony's rows stand on it)
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Monks in robes of ochre, brown and grey with the kesa, the head shaven; officials in the robes of their ranks (the
// Yōrō code's colours: purple, red, green, blue) with the black gauze cap; townsmen in a short robe and trousers,
// hair in a topknot, some in a hat of woven reed; women in a long robe with a high-waisted skirt, the hair in a bun;
// farmers and porters in short jackets, with shoulder poles and baskets.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', green: 'cloth_green', red: 'cloth_red', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'monk', weight: 0.9, market: 0.5, el: { dress: 'robe', hair: 'shaven', over: 'sash', arms: 'hang' },
    c1: [CL.ochre, CL.brown, CL.grey, CL.ochre], c2: [CL.maroon, CL.ochre, CL.brown], c3: [CL.black], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'official', weight: 0.5, market: 0.3, el: { dress: 'robe', hair: 'topknot', hat: 'cap', over: 'sash', arms: 'hang' },
    c1: [CL.maroon, CL.red, CL.green, CL.indigo, '#5a4a78'], c2: [CL.white, CL.white, CL.grey], c3: [CL.black], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'townsman', weight: 1.4, market: 1.4, el: { dress: 'robe', hair: 'topknot', over: 'sash', arms: 'hang' },
    c1: [CL.indigo, CL.brown, CL.grey, CL.white, CL.ochre], c2: [CL.black, CL.indigo, CL.brown, CL.white], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'woman', weight: 1.1, market: 1.3, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.white, CL.grey, CL.green, CL.ochre, CL.red], c2: [CL.white, CL.indigo, CL.black], c3: [CL.black], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.97] },
  { id: 'farmer', weight: 0.9, market: 0.8, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'hang' },
    c1: [CL.indigo, CL.grey, CL.brown, CL.white, CL.ochre], c2: [CL.indigo, CL.black, CL.grey, CL.brown], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'porter', weight: 1.0, market: 1.6, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole' }, swing: 0.75, pole: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
];
export const CREW = {
  boatman: { el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'pull' }, c1: [CL.indigo], c2: [CL.indigo], c3: [CL.black] },
  passenger: { el: { dress: 'robe', hair: 'topknot', pose: 'cross' }, c1: [CL.indigo], c2: [CL.white], c3: [CL.black] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none: no water */ }
