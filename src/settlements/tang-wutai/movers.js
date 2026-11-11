// Mount Wutai in 857 — the moving life (docs/settlements/tang-wutai.md §12): monks, pilgrims and villagers walking the
// monastery's axis and terraces and the village lanes. Data for the engine's movers (src/engine/movers.js), read in its
// worker: the ways (layout.js), who walks. There is no water to float on: the boats' parts are empty.
// Format as Suzhou's (src/settlements/ming-suzhou/movers.js).

import { LANES, GATE_X, RADIUS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 4, rain: 0.7, reach: 150, spawnMin: 22, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/** The lanes of the village, the monastery's axis through the gate, the courtyard's and the terraces' cross walks. */
export function walkways() {
  const rects = [
    // the main lane to the gate, then the monastery's axis up the stairs to the hall's platform
    { r: [-232, -2.5, GATE_X - 2, 2.5], weight: 2.0, market: 0, kind: 'street' },
    { r: [GATE_X - 2, -1.6, 46, 1.6], weight: 2.6, market: 0.6, kind: 'street' },
    { r: [-31.2, -33, -28.8, 33], weight: 1.0, market: 0.6, kind: 'lane' },       // the lower courtyard's cross walk
    { r: [12.8, -34, 15.2, 34], weight: 1.0, market: 0.6, kind: 'lane' },          // the middle terrace's
    { r: [32.8, -34, 35.2, 34], weight: 0.8, market: 0.6, kind: 'lane' },          // the upper terrace's, before the pillar
    ...LANES.slice(1).map((r) => ({ r, weight: 0.8, market: 0, kind: 'lane' })),
  ];
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Monks: the Tang "black-robed", the kasaya of reddish brown over a dark robe, the head shaven. Villagers: robes of
// undyed hemp and indigo, the topknot under a cloth cap or a brimmed hat; women with the hair in a bun; farmers in jackets
// and trousers with straw hats, some with shoulder poles and baskets.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', green: 'cloth_green' };
export const WALKERS = [
  { id: 'monk', weight: 0.35, market: 3.4, el: { dress: 'robe', hair: 'shaven', over: 'sash', arms: 'hang' },
    c1: [CL.black, CL.grey, CL.black], c2: [CL.brown, CL.brown, CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'pilgrim', weight: 0.5, market: 1.6, el: { dress: 'robe', hair: 'topknot', hat: 'brim', over: 'collar', arms: 'hang' },
    c1: [CL.indigo, CL.white, CL.grey, CL.brown], c2: [CL.white, CL.grey], c3: [CL.black], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'villager', weight: 1.4, market: 0.2, el: { dress: 'robe', hair: 'topknot', hat: 'brim', over: 'sash', arms: 'hang' },
    c1: [CL.indigo, CL.brown, CL.grey, CL.white], c2: [CL.black, CL.indigo, CL.brown], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'woman', weight: 1.0, market: 0.2, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.white, CL.grey, CL.green, CL.ochre], c2: [CL.white, CL.indigo, CL.black], c3: [CL.black], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.97] },
  { id: 'farmer', weight: 1.1, market: 0.1, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'hang' },
    c1: [CL.indigo, CL.grey, CL.brown, CL.white, CL.ochre], c2: [CL.indigo, CL.black, CL.grey, CL.brown], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'porter', weight: 0.7, market: 0.2, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole' }, swing: 0.75, pole: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
];
export const CREW = {
  boatman: { el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'pull' }, c1: [CL.indigo], c2: [CL.indigo], c3: [CL.black] },
  passenger: { el: { dress: 'robe', hair: 'topknot', hat: 'brim', pose: 'cross' }, c1: [CL.indigo], c2: [CL.white], c3: [CL.black] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none: no water */ }
