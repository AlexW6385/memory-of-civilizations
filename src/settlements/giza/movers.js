// Giza about 2500 BC — the moving life (docs/settlements/giza.md §12): the people of the plateau and the town: workmen and
// porters in the white linen kilt, bare above the belt and bare-headed or close-cropped; women in the plain sheath carrying
// bread and beer to the tombs; funerary priests with shaven heads in white; officials in the long kilt with a sash and a
// staff; boys. Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js: the
// cemeteries' avenues and cross streets, the pyramid's court, the workers' town's streets, the harbour quay, the Sphinx's
// pit and the way down to Khafre's valley temple. No boats on the water (the ships stand moored).

import { RADIUS, CROW_WALL, ENCLOSURE, WEST_FIELD, EAST_FIELD, HARBOUR, SPHINX_PIT, KHAFRE_VT, TOWN } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 4, rain: 0.5, reach: 170, spawnMin: 26, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -13.7,
};

/** A street of width w along the line a→b (as a rectangle). */
const way = (a, b, w, weight, market = 0.6, kind = 'street') => ({ r: [Math.min(a[0], b[0]) - (a[0] === b[0] ? w / 2 : 0), Math.min(a[1], b[1]) - (a[1] === b[1] ? w / 2 : 0), Math.max(a[0], b[0]) + (a[0] === b[0] ? w / 2 : 0), Math.max(a[1], b[1]) + (a[1] === b[1] ? w / 2 : 0)], weight, market, kind });

export function walkways() {
  const rects = [];
  // the cemeteries: the avenues (north–south) east of each column of tombs, between the chapels' doors and the next column, and the cross streets between the rows
  for (const F of [WEST_FIELD, EAST_FIELD]) {
    for (let x = F[0] + 10; x < F[2] - 14; x += 21) rects.push(way([x + 12.2, F[1] + 8], [x + 12.2, F[3] - 8], 3.6, 1.0, 0.5));
    for (let z = F[1] + 32; z < F[3] - 16; z += 32) rects.push(way([F[0] + 6, z], [F[2] - 6, z], 3.4, 0.8, 0.4));
  }
  // the court round the pyramid, the way along the east side to the temple
  rects.push(way([ENCLOSURE[2] - 6.5, ENCLOSURE[1] + 12], [ENCLOSURE[2] - 6.5, ENCLOSURE[3] - 10], 4.5, 0.9, 0.5));
  rects.push(way([ENCLOSURE[0] + 12, -100], [ENCLOSURE[2] - 6.5, -100], 3.4, 0.5, 0.3));
  // the workers' town: the street along the Wall of the Crow, the lanes between the gallery blocks, the street before the bakeries
  rects.push(way([TOWN[0] + 8, 162], [TOWN[2] - 10, 162], 2.8, 2.2, 1.2));
  for (let b = 0; b < 4; b++) rects.push(way([-94 + b * 52, 160], [-94 + b * 52, 234], 3.6, 2.0, 1.2));
  rects.push(way([TOWN[0] + 8, 234.2], [TOWN[2] - 14, 234.2], 2.8, 2.4, 1.4));
  // the storerooms' fronts along the court's north and south walls
  rects.push(way([ENCLOSURE[0] + 16, ENCLOSURE[1] + 10], [ENCLOSURE[2] - 16, ENCLOSURE[1] + 10], 3.0, 0.6, 0.3), way([ENCLOSURE[0] + 16, ENCLOSURE[3] - 10], [ENCLOSURE[2] - 16, ENCLOSURE[3] - 10], 3.0, 0.6, 0.3));
  // the stretch under the Wall of the Crow's south face
  rects.push(way([TOWN[0] + 10, 158.6], [CROW_WALL.b[0], 158.6], 2.4, 1.0, 0.8));
  // the harbour: the quay along the temple's front, and the way south of it to Khafre's valley temple
  rects.push(way([HARBOUR[0] + 2.2, HARBOUR[1] + 5], [HARBOUR[0] + 2.2, HARBOUR[3] - 4], 3.2, 1.2, 0.8));
  rects.push(way([KHAFRE_VT[2] + 3, 100], [KHAFRE_VT[2] + 3, KHAFRE_VT[3] + 10], 3.6, 1.0, 0.6));
  // the Sphinx's pit: the way south of the body to the pit's open end, and up the east side to the temple
  rects.push(way([SPHINX_PIT[0] + 30, 182], [SPHINX_PIT[2] + 3, 182], 3.4, 0.9, 0.5));
  rects.push(way([SPHINX_PIT[2] + 3, 142], [SPHINX_PIT[2] + 3, 186], 3.6, 1.0, 0.5));
  rects.push(way([SPHINX_PIT[2] + 3, 130], [KHAFRE_VT[2] + 3, 130], 3.0, 0.8, 0.4));
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
