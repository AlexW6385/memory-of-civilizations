// Abu Simbel about 1255 BC (docs/settlements/abu-simbel.md §9): the people of the temples' terrace, the priests' lane, the workmen's camp and the quay:
// priests with shaven heads in white linen, workmen and porters in the short kilt, the officials and scribes, women bearing bread and water, boys.
// Data for the engine's movers; the ways come from layout.js. The boats stand moored at the quay; none are poled on the river.

import { RADIUS, TERRACE, WAY, SMALL_TERRACE, PRIESTS, CAMP, QUAY, WALL, GATE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 26, night: 2, rain: 0.2, reach: 150, spawnMin: 22, far: 40 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -8.0,
};

const way = (a, b, w, weight, market = 0.6, kind = 'street') => ({ r: [Math.min(a[0], b[0]) - (a[0] === b[0] ? w / 2 : 0), Math.min(a[1], b[1]) - (a[1] === b[1] ? w / 2 : 0), Math.max(a[0], b[0]) + (a[0] === b[0] ? w / 2 : 0), Math.max(a[1], b[1]) + (a[1] === b[1] ? w / 2 : 0)], weight, market, kind });

export function walkways() {
  const rects = [];
  // the terrace before the Great Temple: the way along the façade, the way from the gate to the quay ramp
  rects.push(way([TERRACE[0] + 8, 0], [TERRACE[2] - 2, 0], 6, 1.4, 0.6));
  rects.push(way([TERRACE[0] + 8, -24], [TERRACE[0] + 8, 24], 4.5, 1.0, 0.5));
  rects.push(way([GATE.x, -30], [GATE.x, -22], GATE.w, 0.8, 0.4));
  // the way north to the Small Temple, its terrace
  rects.push(way([(WAY[0] + WAY[2]) / 2, WAY[1] + 2], [(WAY[0] + WAY[2]) / 2, WAY[3] - 2], 3.4, 0.9, 0.4));
  rects.push(way([SMALL_TERRACE[0] + 6, (SMALL_TERRACE[1] + SMALL_TERRACE[3]) / 2], [SMALL_TERRACE[2] - 2, (SMALL_TERRACE[1] + SMALL_TERRACE[3]) / 2], 5, 0.7, 0.3));
  // the priests' lane and the camp's lanes
  rects.push(way([PRIESTS[0] + 11, PRIESTS[1] + 2], [PRIESTS[0] + 11, PRIESTS[3] - 2], 2.4, 1.2, 0.5));
  for (let c = 0; c < 4; c++) rects.push(way([CAMP[0] + c * 11.4 + 10.2, CAMP[1] + 2], [CAMP[0] + c * 11.4 + 10.2, CAMP[3] - 4], 1.8, 1.6, 1.0));
  rects.push(way([CAMP[0] + 2, CAMP[1] + 90 - 4], [CAMP[2] + 4, CAMP[1] + 90 - 4], 2.2, 1.6, 1.0));
  // the quay
  rects.push(way([QUAY[0] + 4, QUAY[1] + 2], [QUAY[0] + 4, QUAY[3] - 2], 5, 1.4, 1.2));
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', linen: 'linen', brown: 'cloth_brown', ochre: 'cloth_ochre', black: 'cloth_black' };
const KILT = { dress: 'shendyt', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', feet: 'bare', beard: 0 };
export const WALKERS = [
  // the workman: the short white kilt, bare above, close-cropped
  { id: 'worker', weight: 2.6, market: 2.0, el: { ...KILT, hair: 'short' }, c1: [CL.white, CL.linen, CL.ochre], c2: [CL.white], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  // the porter: a basket or a sack on the shoulder, the kilt
  { id: 'porter', weight: 1.4, market: 1.8, el: { ...KILT, hair: 'short', arms: 'sack', carry: 'sack' }, c1: [CL.white, CL.linen, CL.brown], c2: [CL.white], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  // the bearer: a woman in the sheath with bread and beer in a jar on her head
  { id: 'bearer', weight: 1.8, market: 1.2, el: { dress: 'sheath', hat: 'none', over: 'none', arms: 'head', carry: 'pot', hair: 'long', feet: 'bare' }, swing: 0.5, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'woman', weight: 1.3, market: 1.5, el: { dress: 'sheath', hat: 'none', over: 'none', arms: 'hang', hair: 'long', feet: 'bare' }, swing: 0.7, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.8, 1.05], stride: 1.2, h: [0.9, 0.97] },
  // the funerary priest: the shaven head, the white kilt, the sash across the chest
  { id: 'priest', weight: 1.0, market: 0.5, el: { ...KILT, top: 'bare', hair: 'shaven', over: 'sash' }, c1: [CL.white], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.3 },
  // the official: the long kilt over the belly, the wig, the staff in his hand
  { id: 'official', weight: 0.7, market: 0.8, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'sash', arms: 'staff', carry: 'staff', hair: 'long', feet: 'bare', beard: 0 }, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.brown], speed: [0.7, 0.9], stride: 1.25 },
  { id: 'boy', weight: 0.6, market: 0.8, el: { ...KILT, dress: 'loincloth', over: 'none', hair: 'short' }, c1: [CL.white], c2: [CL.white], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
