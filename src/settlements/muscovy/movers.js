// Muscovy about 1600 — the moving life (docs/settlements/muscovy.md §10): Muscovites on the log-paved streets of the posad,
// the market crowd of Red Square and the lane before the trading rows. Data for the engine's movers (src/engine/movers.js),
// read in its worker: the ways (derived from layout.js), who walks. The Moskva is not floated on. Format as Suzhou's.

import { RADIUS, SQUARE, ROWS, streetSegments } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 5, rain: 0.6, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/** The ways: the log-paved middle of every street (5 m), Red Square's open ground (the market's end busier), the lane before the rows. */
export function walkways() {
  const rects = [];
  for (const { a, b } of streetSegments()) {
    const alongZ = a[0] === b[0];
    rects.push({ r: alongZ ? [a[0] - 2.5, a[1], a[0] + 2.5, b[1]] : [a[0], a[1] - 2.5, b[0], a[1] + 2.5], weight: 0.6, market: 0.2, kind: 'street' });
  }
  // Red Square: the strip between the Kremlin's moat and the stalls, and the lane between the stalls and the rows
  rects.push({ r: [29, SQUARE[1] + 14, 41, SQUARE[3] - 40], weight: 2.2, market: 1.0, kind: 'street' });
  rects.push({ r: [(ROWS[0] + SQUARE[2]) / 2 - 2.6, SQUARE[1] + 10, (ROWS[0] + SQUARE[2]) / 2 + 0.2, SQUARE[3] - 40], weight: 2.4, market: 1.4, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 60 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Dress after the 17th-century travellers' and Olearius's descriptions (the long kaftan, the fur-trimmed hat, the sheepskin
// coat, the monk's black cassock and kamilavka, the woman's long sarafan and headcloth); colours of home-dyed cloth: red, green,
// indigo, ochre, brown, undyed linen.
const CL = { red: 'cloth_red', green: 'cloth_green', indigo: 'cloth_indigo', ochre: 'cloth_ochre', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', grey: 'cloth_grey', linen: 'linen' };
export const WALKERS = [
  { id: 'boyar', weight: 0.5, market: 0.7, el: { dress: 'robe', hair: 'long', beard: 1, hat: 'cap', hatMat: 'hide_brown', over: 'sash', arms: 'hang' },
    c1: [CL.red, CL.green, CL.indigo, CL.ochre], c2: [CL.red, CL.ochre, CL.white], c3: [CL.brown, CL.black], speed: [0.8, 1.0], stride: 1.35 },
  { id: 'merchant', weight: 1.4, market: 1.7, el: { dress: 'robe', hair: 'short', beard: 1, hat: 'cap', hatMat: 'cloth_red', over: 'sash', arms: 'hang' },
    c1: [CL.indigo, CL.brown, CL.green, CL.grey], c2: [CL.red, CL.brown, CL.white], c3: [CL.black, CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'peasant', weight: 1.5, market: 0.8, el: { dress: 'robe', hair: 'short', beard: 1, hat: 'cap', hatMat: 'hide_tan', over: 'sash', arms: 'hang' },
    c1: [CL.linen, CL.brown, CL.grey, CL.ochre], c2: [CL.white, CL.brown, CL.grey], c3: [CL.brown], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'monk', weight: 0.5, market: 0.4, el: { dress: 'robe', hair: 'long', beard: 1, hat: 'cap', hatMat: 'cloth_black', over: 'cloak', arms: 'hang' },
    c1: [CL.black], c2: [CL.black], c3: [CL.black], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'woman', weight: 1.0, market: 1.1, el: { dress: 'robe', hair: 'bun', over: 'shawl', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.indigo, CL.ochre, CL.linen], c2: [CL.white, CL.red, CL.linen], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  // the streltsy (musketeers of the guard), in coats of one colour by regiment, a staff (the berdysh stands in for the halberd), a black-trimmed cap; thick at the gates and the square
  { id: 'strelets', weight: 0.5, market: 1.2, el: { dress: 'robe', hair: 'short', beard: 1, hat: 'cap', hatMat: 'hide_black', over: 'sash', carry: 'staff', arms: 'staff' },
    c1: [CL.red, CL.indigo, CL.green, CL.red], c2: [CL.white, CL.brown], c3: [CL.black, CL.brown], speed: [0.85, 1.05], stride: 1.4 },
  // the water carrier with her yoke and two pails, from the wells and the river's stages
  { id: 'carrier', weight: 0.5, market: 0.3, el: { dress: 'robe', hair: 'bun', over: 'shawl', carry: 'yoke', arms: 'yoke' }, swing: 0.7,
    c1: [CL.red, CL.linen, CL.green, CL.indigo], c2: [CL.white, CL.linen], c3: [CL.black], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.7, market: 1.0, el: { dress: 'trousers', hair: 'short', beard: 1, hat: 'cap', hatMat: 'hide_brown', carry: 'pole', arms: 'pole' }, swing: 0.75, pole: true,
    c1: [CL.linen, CL.brown, CL.grey], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
];
export const CREW = {
  boatman: { el: { dress: 'trousers', hair: 'short', arms: 'hang' }, c1: [CL.linen], c2: [CL.brown], c3: [CL.black] },
  passenger: { el: { dress: 'robe', hair: 'short', pose: 'cross' }, c1: [CL.brown], c2: [CL.white], c3: [CL.black] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none */ }
