// Mughal Agra about 1650 — the moving life of the Taj Ganj and the forecourt (docs/settlements/mughal-agra.md §12): men
// in the jama (a long robe tied at the chest) with a turban, merchants with a shoulder cloth, craftsmen and porters
// in a short tunic and a wrapped cloth, women in long robes with the head veiled, water carriers with a pot,
// walking the bazaar streets, the town's streets and the forecourt. Data for the engine's movers
// (src/engine/movers.js); format as Madurai's (src/settlements/madurai/movers.js). No moving boats: the Yamuna's
// boats stand at the bank (life.js). The coordinator registers it in src/engine/movers-sites.js.

import { STREETS, FORECOURT, RADIUS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 5, rain: 0.7, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/** The ways: the streets of the town (the bazaar streets busy), the forecourt, the bazaar streets inside its gates. */
export function walkways() {
  const R = RADIUS - 28, lim = (v) => Math.max(-R, Math.min(R, v)), rects = [];
  for (const s of STREETS) {
    const [x0, z0, x1, z1] = s.rect, w = Math.min(x1 - x0, z1 - z0);
    rects.push({ r: [lim(x0 + 1), lim(z0 + 1), lim(x1 - 1), lim(z1 - 1)], weight: s.bazaar ? 2.2 : 0.8, market: s.bazaar ? 1 : 0.2, kind: w > 6 ? 'street' : 'lane' });
  }
  const [fx0, fz0, fx1, fz1] = FORECOURT;
  rects.push({ r: [fx0 + 3, fz0 + 8, fx1 - 3, fz1 - 3], weight: 1.4, market: 0.3, kind: 'street' });
  for (const [a, b] of [[fx0 + 5, -50], [50, fx1 - 5]]) rects.push({ r: [a, 196.5, b, 203.5], weight: 1.8, market: 1, kind: 'lane' });
  return { rects: rects.filter(({ r }) => r[2] > r[0] && r[3] > r[1]), links: [], clip: RADIUS - 12 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', green: 'cloth_green', indigo: 'cloth_indigo', ochre: 'cloth_ochre', maroon: 'cloth_maroon', blue: 'cloth_blue', brown: 'cloth_brown' };
export const WALKERS = [
  { id: 'jama', weight: 1.6, market: 1.2, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'sash', beard: true, arms: 'hang' },
    c1: [CL.white, CL.white, CL.ochre, CL.indigo], c2: [CL.red, CL.green, CL.ochre, CL.white], c3: [CL.white, CL.red, CL.ochre], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'merchant', weight: 1.0, market: 1.8, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'shawl', beard: true, arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.blue, CL.green], c2: [CL.white, CL.maroon], c3: [CL.maroon, CL.red, CL.ochre], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'craftsman', weight: 0.9, market: 1.0, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', over: 'sash', arms: 'hang' },
    c1: [CL.white, CL.brown, CL.ochre], c2: [CL.white, CL.ochre], c3: [CL.white, CL.red], speed: [1.05, 1.3], stride: 1.4 },
  { id: 'woman', weight: 1.6, market: 1.4, el: { dress: 'robe', hair: 'long', hat: 'veil', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.ochre, CL.indigo, CL.white, CL.maroon], c2: [CL.ochre, CL.white, CL.red], c3: [CL.ochre, CL.red], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'water', weight: 0.7, market: 0.4, el: { dress: 'robe', hair: 'long', hat: 'veil', carry: 'pot', arms: 'hang' }, swing: 0.7,
    c1: [CL.green, CL.ochre, CL.red], c2: [CL.white], c3: [CL.white], speed: [0.85, 1.05], stride: 1.25, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.9, market: 1.1, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', carry: 'basket', arms: 'hang' },
    c1: [CL.white, CL.brown], c2: [CL.white], c3: [CL.red, CL.white, CL.ochre], speed: [1.0, 1.25], stride: 1.3 },
];
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'pull' }, c1: [CL.white], c2: [CL.white], c3: [CL.white] },
  passenger: { el: { dress: 'robe', hair: 'short', hat: 'turban', pose: 'cross' }, c1: [CL.white], c2: [CL.white], c3: [CL.white] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none */ }
