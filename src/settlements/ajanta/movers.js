// Ajanta c. 480 — the moving life (docs/settlements/ajanta.md §7): monks in ochre-red robes going to the caves and the river,
// lay worshippers in white with shawls and turbans, women in saris with pots and baskets, masons and labourers with
// baskets of rubble and bare torsos, goatherds; along the paths of the gorge floor, over the ford, round the village
// yard. No boats. Data for src/engine/movers.js; the ways come from layout.js.
import { RADIUS, PATHS, FORD, RIVER, riverX, VILLAGE, WELL, XF } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 30, night: 3, rain: 0.4, reach: 150, spawnMin: 24, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: RIVER.water,
};

/** The ways: the paths along the gorge floor (west bank, from the north gap to the south gap), the ford, the way to the village, the village's yard and lanes. */
export function walkways() {
  const rects = [], links = [], L = (a, b, w, weight, kind = 'street') => links.push({ a, b, w, kind, weight });
  PATHS.forEach((P, k) => { for (let i = 0; i < P.length - 1; i++) L(P[i], P[i + 1], k === 1 ? 1.4 : 1.7, k === 0 ? 1.4 : k === 2 ? 1.6 : 1.0); });
  const xr = riverX(FORD.z);
  links.push({ a: [xr - 6.8, FORD.z], b: [xr + 6.8, FORD.z], w: 1.2, kind: 'bridge', weight: 1.0 });
  // the village yard, round the well, and the lanes between the rows of huts
  rects.push({ r: [VILLAGE[0] + 4, 18, VILLAGE[2] - 4, 40], weight: 1.0, market: 0.8, kind: 'street' });
  for (const z of [30]) rects.push({ r: [VILLAGE[0] - 6, z - 1.0, VILLAGE[0] + 6, z + 1.0], weight: 0.8, market: 0.3, kind: 'lane' });
  // the foot of the cliff before the stair, and the pocket's bank
  rects.push({ r: [XF + 9.5, -56, XF + 13.5, -44.4], weight: 0.9, market: 0.2, kind: 'street' });
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', maroon: 'cloth_maroon' };
export const WALKERS = [
  // the monk: the ochre-red robe over one shoulder, shaven, barefoot
  { id: 'monk', weight: 3.0, market: 0.6, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'shaven', feet: 'bare', beard: 0 },
    c1: [CL.ochre, CL.ochre, CL.maroon], c2: [CL.ochre], c3: [CL.ochre], speed: [0.7, 0.95], stride: 1.1 },
  // the lay worshipper: the white wrap, a shawl, sometimes a turban
  { id: 'man', weight: 2.0, market: 1.4, el: { dress: 'wrap', hat: 'turban', over: 'shawl', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.white, CL.ochre], c2: [CL.white, CL.red], c3: [CL.white], speed: [0.85, 1.1], stride: 1.35 },
  // the woman with an offering basket on the arm
  { id: 'woman', weight: 1.8, market: 1.6, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'basket', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.red, CL.indigo, CL.ochre, CL.blue], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.92, 0.98] },
  // the water bearer: a pot on the head
  { id: 'jar', weight: 1.4, market: 1.4, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.red, CL.indigo, CL.brown], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the mason or labourer: bare to the waist, a pole across the shoulder with two loads of rubble
  { id: 'porter', weight: 1.6, market: 1.0, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', carry: 'pole', arms: 'sack', feet: 'bare' },
    c1: [CL.white, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', feet: 'bare' },
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
void WELL;
