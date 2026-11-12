// A Dogon village c. 1930 — the moving life (docs/settlements/dogon.md §7): women in wraps and head-cloths of indigo or white cotton
// carrying water jars and baskets of millet on the head, men in tunics and wide trousers with a cap, elders in white, farmers going out
// to the fields with a hoe, boys. No boats. Data for the engine's movers (src/engine/movers.js); the ways come from layout.js.

import { RADIUS, PLACE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 28, night: 2, rain: 0.5, reach: 110, spawnMin: 22, far: 40 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/**
 * The ways: the middle lane up from the place through the three rows, the lanes between the rows (east–west), the place with the toguna,
 * the track down to the fields and the plain.
 */
export function walkways() {
  const rects = [];
  // the middle lane in two strips, the middle left clear: people stand and walk along its sides, the visitor's own route (plan.js walks) goes up the middle
  rects.push({ r: [-2, -34, -0.95, 34], weight: 0.8, market: 0.6, kind: 'lane' }, { r: [0.95, -34, 2, 34], weight: 0.8, market: 0.6, kind: 'lane' });
  for (const [z0, z1] of [[-5.8, -0.6], [-21.8, -17.6], [11.8, 16.5]]) rects.push({ r: [-60, z0, 60, z1], weight: 1.0, market: 0.9, kind: 'lane' });
  // the place: the band along its south edge and the one along its north edge, clear of the trees, the pits, the threshing floors and the toguna
  rects.push({ r: [PLACE[0] + 1, 30.7, PLACE[2] - 1, 33], weight: 1.4, market: 1.6, kind: 'street' });
  rects.push({ r: [PLACE[0] + 4, PLACE[1] + 6.8, PLACE[2] - 3, PLACE[1] + 8], weight: 0.8, market: 1.0, kind: 'lane' });
  rects.push({ r: [-46, 31, -26, 34], weight: 0.6, market: 0.4, kind: 'lane' });
  rects.push({ r: [-5, 32, 5, RADIUS - 14], weight: 0.9, market: 0.3, kind: 'lane' });
  rects.push({ r: [-60, 33, 60, 37], weight: 0.5, market: 0.2, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 12 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', indigo: 'cloth_indigo', blue: 'cloth_blue', ochre: 'cloth_ochre', brown: 'cloth_brown', red: 'cloth_red', black: 'cloth_black' };
const SKIN = { skin: 'skin_dark', hairMat: 'hair_dark' };
export const WALKERS = [
  { id: 'woman', weight: 1.8, market: 1.5, el: { dress: 'wrap', over: 'shawl', hat: 'none', arms: 'hang', hair: 'bun', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.7,
    c1: [CL.indigo, CL.white, CL.blue, CL.ochre], c2: [CL.white, CL.indigo, CL.red], c3: [CL.indigo], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.7, market: 1.4, el: { dress: 'wrap', over: 'shawl', carry: 'pot', arms: 'head', hair: 'bun', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.5,
    c1: [CL.indigo, CL.white, CL.blue], c2: [CL.white, CL.indigo], c3: [CL.indigo], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'basket', weight: 1.4, market: 1.4, el: { dress: 'wrap', over: 'shawl', carry: 'basket', arms: 'head', hair: 'bun', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.5,
    c1: [CL.indigo, CL.ochre, CL.white], c2: [CL.white, CL.indigo], c3: [CL.indigo], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'man', weight: 1.6, market: 1.2, el: { dress: 'tunic', legs: 'hose', over: 'belt', hat: 'cap', arms: 'hang', hair: 'short', beard: false, feet: 'bare', ...SKIN },
    c1: [CL.indigo, CL.white, CL.blue, CL.brown], c2: [CL.indigo, CL.white], c3: [CL.black], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'elder', weight: 0.8, market: 0.8, el: { dress: 'robe', over: 'none', hat: 'cap', carry: 'staff', arms: 'staff', hair: 'short', feet: 'shod', ...SKIN },
    c1: [CL.white], c2: [CL.white], c3: [CL.black], speed: [0.65, 0.85], stride: 1.0 },
  { id: 'farmer', weight: 1.0, market: 0.3, el: { dress: 'tunic', legs: 'hose', over: 'belt', hat: 'cap', carry: 'staff', arms: 'staff', hair: 'short', feet: 'bare', ...SKIN },
    c1: [CL.indigo, CL.brown, CL.white], c2: [CL.indigo], c3: [CL.black], speed: [0.95, 1.2], stride: 1.35 },
  { id: 'boy', weight: 0.8, market: 0.8, el: { dress: 'tunic', legs: 'bare', over: 'none', hat: 'none', arms: 'hang', hair: 'short', feet: 'bare', ...SKIN },
    c1: [CL.white, CL.ochre, CL.indigo], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
