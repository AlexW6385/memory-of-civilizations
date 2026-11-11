// Lhasa, 1694 — the moving life of the street (docs/settlements/lhasa.md §14): pilgrims walking sunwise round
// the palace and Shöl, monks, traders and women with the load on their backs on the street between the shops
// and across the lane. Data for the engine's movers (src/engine/movers.js), read in its worker: the ways (from
// layout.js), who walks (figures of src/objects/figures.js). No boats.

import { STREET, SHOL, LANE, RADIUS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 3, rain: 0.7, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the street up to the palace, the lane across Shöl, the open ground below the stairs, the circuit. */
export function walkways() {
  const [sx0, , sx1, sz1] = SHOL, S = STREET;
  const rects = [
    { r: [S[0], 60, S[2], sz1 + 22], weight: 4, market: 3, kind: 'street' },
    { r: [sx0 + 8, LANE[0] + 0.3, sx1 - 8, LANE[1] - 0.3], weight: 1.5, market: 1.5, kind: 'street' },
    { r: [sx0 + 8, 46, sx1 - 8, 60], weight: 1.5, market: 1, kind: 'street' },
    // the circuit: south leg outside the gate, west leg, east leg (the north leg is the walkers' in the hills)
    { r: [-190, 220, 150, 224], weight: 1.5, market: 0.3, kind: 'street' },
    { r: [-215, 40, -211, 222], weight: 1.5, market: 0.3, kind: 'street' },
    { r: [211, 40, 215, 222], weight: 1.5, market: 0.3, kind: 'street' },
  ];
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// Dress (dossier §12): monks in the maroon skirt and shawl; lay men in the chuba of wool or sheepskin belted
// with a sash, felt hats and fur caps; women in the chuba with the striped apron, braided hair, the load in a
// basket on the back; children.
const CL = { black: 'cloth_black', red: 'cloth_red', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', maroon: 'cloth_maroon', blue: 'paint_blue', hide: 'hide_tan' };
export const WALKERS = [
  { id: 'monk', weight: 1.3, market: 0.5, el: { dress: 'robe', hair: 'shaven', hat: 'none', over: 'cape', arms: 'hang' },
    c1: [CL.maroon], c2: [CL.maroon, CL.ochre], c3: [CL.maroon], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'pilgrim', weight: 2.0, market: 1.0, el: { dress: 'robe', hair: 'long', hat: 'brim', over: 'sash', arms: 'hang' },
    c1: [CL.brown, CL.black, CL.grey, CL.hide], c2: [CL.red, CL.green, CL.ochre, CL.blue], c3: [CL.brown, CL.black, CL.red], speed: [0.85, 1.1], stride: 1.35 },
  { id: 'trader', weight: 1.2, market: 2.0, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang' },
    c1: [CL.brown, CL.maroon, CL.black, CL.green], c2: [CL.red, CL.ochre, CL.blue], c3: [CL.red, CL.brown], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'woman', weight: 1.5, market: 1.8, el: { dress: 'robe', hair: 'bun', over: 'apron', arms: 'hang', carry: 'basket' }, swing: 0.7,
    c1: [CL.black, CL.brown, CL.grey, CL.maroon], c2: [CL.red, CL.green, CL.ochre, CL.blue], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'elder', weight: 0.6, market: 0.6, el: { dress: 'robe', hair: 'short', hat: 'none', over: 'sash', arms: 'hang' },
    c1: [CL.brown, CL.grey], c2: [CL.ochre, CL.red], c3: [CL.black], speed: [0.65, 0.85], stride: 1.1 },
  { id: 'boy', weight: 0.5, market: 0.7, el: { dress: 'robe', hair: 'short', arms: 'hang' },
    c1: [CL.brown, CL.red, CL.maroon], c2: [CL.green, CL.ochre], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
