// Khajuraho about 1050 — the moving life (docs/settlements/khajuraho.md §12): pilgrims, priests and villagers on the
// paths between the temples, the village lanes and the tank. Data for the engine's movers (src/engine/movers.js), read
// in its worker: the ways (derived from layout.js), who walks. The tank's water is not floated on: the boats' parts are empty.
// Format as Suzhou's (src/settlements/ming-suzhou/movers.js).

import { TEMPLES, TANK, RADIUS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 4, rain: 0.7, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/**
 * The ways: the road from the temples east to the village (the free band between two rows of lots, z 8–12 — layout.js
 * lots() lays rows 12 m apart and at most 8 deep), a path along the temples' stairs, the way down to the tank, the village's
 * cross lanes in the gaps between the columns of houses, and the paths round the terraces' feet.
 */
export function walkways() {
  const rects = [];
  const R = (r, weight, kind = 'lane', market = 0) => rects.push({ r, weight, market, kind });
  const K = TEMPLES[0], Kx = K.c[0] + K.len + 4 + K.jagati * 2.2 + 2;     // before the stair of Kandariya's terrace
  R([Kx - 2, 8, 330, 12], 2.2, 'street', 0.5);                            // the main road east, through the village
  R([-31.5, -75, -28.5, 12], 1.6, 'street', 0.2);                         // along the stairs of the western temples
  R([-45, 8, -28, 12], 1.2);                                              // …to the road
  R([84, -100, 87, 112], 1.4, 'street', 0.2);                             // down to the tank, up to Lakshmana and the Varaha
  R([50, -84.5, 87, -81.5], 1.0);                                         // to Lakshmana's platform
  R([TANK.c[0] - 30, TANK.c[1] - TANK.r[1] - 9, TANK.c[0] + 30, TANK.c[1] - TANK.r[1] - 6], 1.0);   // the ghat on the tank's north margin
  R([TANK.c[0] - 3, 12, TANK.c[0] + 3, TANK.c[1] - TANK.r[1] - 6], 0.8);                              // from the road to the tank
  for (let j = 14; j <= 30; j += 4) R([96, -300 + 12 * j + 8.6, 322, -300 + 12 * j + 11.6], 0.5);     // village lanes between the rows of houses
  for (let k = 0; k < 15; k += 3) R([111 + 13 * k, -250, 112.8 + 13 * k, 250], 0.4);                  // …and the gaps between the columns
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Dress after the temple sculpture (the dhoti and the uttariya of the men, the sari of the women, the topknot, the turban),
// the colours of the plain cotton of the time: white, undyed, ochre, red, green, indigo.
const CL = { white: 'cloth_white', ochre: 'cloth_ochre', red: 'cloth_red', green: 'cloth_green', indigo: 'cloth_indigo', brown: 'cloth_brown', grey: 'cloth_grey', black: 'cloth_black' };
const SK = ['skin_medium', 'skin_dark'];
export const WALKERS = [
  { id: 'priest', weight: 0.5, market: 0.2, el: { dress: 'wrap', top: 'bare', hair: 'topknot', over: 'sash', arms: 'hang', feet: 'bare', skin: SK[0] },
    c1: [CL.white], c2: [CL.white], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'pilgrim', weight: 1.3, market: 1.5, el: { dress: 'wrap', hair: 'short', hat: 'turban', over: 'sash', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.white, CL.ochre, CL.brown], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'woman', weight: 1.4, market: 1.2, el: { dress: 'wrap', hair: 'bun', arms: 'hang', feet: 'bare' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.indigo, CL.ochre, CL.white], c2: [CL.ochre, CL.red, CL.white], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'villager', weight: 1.2, market: 0.4, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.grey, CL.ochre], c2: [CL.white, CL.brown], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'farmer', weight: 1.0, market: 0.1, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'none', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.grey, CL.brown], c2: [CL.white, CL.grey], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'porter', weight: 0.6, market: 0.5, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', carry: 'pole', arms: 'pole', feet: 'bare' }, swing: 0.75, pole: true,
    c1: [CL.white, CL.ochre], c2: [CL.white, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
];
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'pull', feet: 'bare' }, c1: [CL.white], c2: [CL.white], c3: [CL.black] },
  passenger: { el: { dress: 'wrap', hair: 'short', hat: 'turban', pose: 'cross', feet: 'bare' }, c1: [CL.white], c2: [CL.white], c3: [CL.black] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none: the tank is for bathing */ }
