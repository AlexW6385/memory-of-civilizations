// Knossos about 1600 BC — the moving life (docs/settlements/knossos.md §11): men in the kilt or the loincloth, bare above the
// belt, long-haired; women in the flounced skirt and open bodice with the hair bound; bearers with jars on the head or on the
// shoulder and sacks on the Royal Road; boys. Data for the engine's movers (src/engine/movers.js, read in its worker); the
// ways come from layout.js (the Royal Road, the West Court, the Central Court, the ring lane round the palace). No boats.

import { RADIUS, ROAD, COURT, PALACE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 48, night: 4, rain: 0.5, reach: 170, spawnMin: 24, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the Royal Road to the theatral court and the West Court, the road round the palace's north to the North Entrance and down into the Central Court, the south passage, the ring lane. */
export function walkways() {
  const rects = [], links = [], L = (a, b, w, weight, extra = {}) => links.push({ a, b, w, kind: 'street', weight, ...extra });
  const rz = ROAD.z, [m0, m1, m2, m3] = [PALACE[0] - 20, PALACE[1] - 17, PALACE[2] + 20, PALACE[3] + 24];
  L([ROAD.x0 + 14, rz], [ROAD.x1 + 4, rz], ROAD.w - 0.6, 3.4);                    // the Royal Road
  L([ROAD.x1 + 4, rz], [-92, -87], 3, 2.4);                                        // into the theatral court
  L([-92, -87], [-92, -60], 3, 1.6); L([-92, -60], [-100, 0], 3, 1.6);               // down the West Court's edge
  L([-92, rz], [-60, rz], 3, 2.0); L([-60, rz], [0, rz], 3, 2.0);                    // the lane along the north front
  L([0, rz], [0, -62], 2.6, 2.0); L([0, -62], [0, -24], 2.6, 2.0);                   // the North Entrance passage into the court
  L([0, 25], [0, 66], 2.4, 1.2); L([0, 66], [0, m3], 2.6, 1.0);                      // the south passage
  // the ring lane round the palace, joined to the north front and the West Court
  L([m2, rz], [m2, m3], 3, 0.8); L([m2, m3], [m0, m3], 3, 0.8); L([m0, m3], [-100, 50], 3, 0.8); L([0, rz], [m2, rz], 3, 0.8);
  void m1;
  rects.push({ r: [-118, -48, -66, 48], weight: 1.4, market: 1.5, kind: 'street' });  // the West Court
  rects.push({ r: [COURT[0] + 2, COURT[1] + 2, COURT[2] - 2, COURT[3] - 2], weight: 1.0, market: 0.8, kind: 'street' });
  rects.push({ r: [-99, -91, -87, -83], weight: 1.2, market: 0.6, kind: 'street' }); // the theatral court
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', linen: 'linen' };
export const WALKERS = [
  // the man: the kilt (the belt pinching the waist), bare chest, long hair
  { id: 'man', weight: 2.2, market: 1.6, el: { dress: 'shendyt', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.red, CL.ochre, CL.indigo], c2: [CL.red, CL.indigo, CL.ochre], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.4 },
  // the workman: the loincloth alone
  { id: 'workman', weight: 1.2, market: 1.2, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [0.9, 1.2], stride: 1.4 },
  // the woman: the long flounced skirt, the bodice open at the breast, the hair in a bun or long
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'bun' }, swing: 0.7,
    c1: [CL.indigo, CL.red, CL.ochre, CL.blue], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  // the bearer: a jar on the head
  { id: 'jar', weight: 1.5, market: 1.5, el: { dress: 'robe', hat: 'none', over: 'sash', carry: 'pot', arms: 'head', hair: 'bun' }, swing: 0.5,
    c1: [CL.indigo, CL.red, CL.ochre], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the porter: a sack or a jar on the shoulder, the loincloth
  { id: 'porter', weight: 1.4, market: 1.4, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.brown, CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
