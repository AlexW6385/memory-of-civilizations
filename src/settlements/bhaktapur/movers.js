// Bhaktapur c. 1710 — the moving life (docs/settlements/bhaktapur.md §6): Newar townspeople in the lanes and the squares — men in the
// wrapped tunic and tight trousers with the topi, women in the black patasi with the red shawl, water-bearers with a pot on the head, porters
// with a basket on the back, elders, children. No boats. Data for the engine's movers (src/engine/movers.js, read in its worker); the
// ways come from layout.js (the streets, the squares' open ground, the aisles of the drying ground).

import { RADIUS, PAVED, POT } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 3, rain: 0.4, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -50,
};

/** Taumadhi's open ground between the temples and the market (clear of the plinths, the stalls, the shrines and the seats of the trees). */
const SQUARE = [[-30, -5, 18, 3.5], [18, 0.5, 42, 3.5], [-16, 8, 0.5, 22.5], [4.5, 8, 21, 22.5], [-14, -33, 6, -23.5], [9, -25, 19.5, -0.5], [39, -30, 41.8, 22], [-29.5, -27, -17, 4]];
/** The drying ground's aisles: the way down its middle and the rows left free every fifth row. */
function aisles() {
  const out = [[-80, POT[1] + 1, -76, POT[3] - 1], [POT[0] + 1, POT[1] + 1, POT[2] - 1, POT[1] + 3.2]];
  for (let row = 0, z = POT[1] + 3.2 + 1.2; z < POT[3] - 2.5 - 0.8; z += 1.05, row++) if (row % 5 === 4) out.push([POT[0] + 2, z - 0.5, POT[2] - 2, z + 0.5]);
  return out;
}
/** The ways: the brick streets (to the rim), the square's open ground, the potters' aisles. */
export function walkways() {
  const rects = [];
  for (const r of PAVED) {
    const wide = Math.min(r[2] - r[0], r[3] - r[1]) > 5.5;
    rects.push({ r: [r[0] + 0.5, r[1] + 0.5, r[2] - 0.5, r[3] - 0.5], weight: wide ? 1.5 : 1.0, market: wide ? 1.2 : 0.6, kind: wide ? 'street' : 'lane' });
  }
  for (const r of SQUARE) rects.push({ r, weight: 1.8, market: 1.8, kind: 'street' });
  for (const r of aisles()) rects.push({ r, weight: 0.7, market: 0.8, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', black: 'cloth_black', grey: 'cloth_grey', indigo: 'cloth_indigo', maroon: 'cloth_maroon', brown: 'cloth_brown' };
export const WALKERS = [
  { id: 'man', weight: 2.0, market: 1.6, el: { dress: 'trousers', hat: 'cap', over: 'sash', arms: 'hang', hair: 'short', beard: false, feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.grey, CL.white], c2: [CL.black, CL.indigo, CL.red], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'wrap', hat: 'none', over: 'shawl', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.black, CL.black, CL.red, CL.indigo, CL.maroon], c2: [CL.red, CL.red, CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.5, market: 1.0, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.black, CL.red, CL.indigo], c2: [CL.red, CL.ochre], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.1, market: 0.6, el: { dress: 'trousers', hat: 'cap', over: 'belt', carry: 'sack', arms: 'sack', hair: 'short', beard: false, feet: 'bare' },
    c1: [CL.ochre, CL.grey, CL.white], c2: [CL.grey, CL.black], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'elder', weight: 0.8, market: 0.8, el: { dress: 'trousers', hat: 'cap', over: 'cloak', arms: 'hang', hair: 'short', beard: false, feet: 'bare' },
    c1: [CL.white, CL.ochre], c2: [CL.white, CL.grey], c3: [CL.black], speed: [0.7, 0.9], stride: 1.1 },
  { id: 'boy', weight: 0.7, market: 0.8, el: { dress: 'trousers', hat: 'cap', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'bare' },
    c1: [CL.white, CL.ochre], c2: [CL.red, CL.indigo], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
