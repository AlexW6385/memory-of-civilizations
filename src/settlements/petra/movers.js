// Petra about AD 50 — the moving life (docs/settlements/petra.md §17): Nabataean townsmen in the long tunic and the cloak with
// the headcloth or the turban, women in the robe with the shawl over the hair, merchants and caravan men with their staffs,
// porters with sacks and baskets, women and boys with water jars; on the colonnaded street and its porticoes, the Outer Siq
// and the little square before the Khazneh, the temenos of Qasr al-Bint. Data for the engine's movers (src/engine/movers.js,
// read in its worker); the ways come from layout.js. No boats, no rain.

import { RADIUS, STREET, PLAZA, OUTER, TEMENOS, SIQ_LINE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 66, night: 4, rain: 0.6, reach: 180, spawnMin: 26, far: 48 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the street between its porticoes, the Outer Siq from the square into the valley, the square, the Siq's last stretch, the temenos. */
export function walkways() {
  const rects = [], links = [], z = STREET.a[1];
  rects.push({ r: [STREET.b[0] + 2, z - STREET.w / 2 - 3.6, STREET.a[0] - 2, z + STREET.w / 2 + 3.6], weight: 5, market: 3, kind: 'street' });
  rects.push({ r: [PLAZA.c[0] - 12, PLAZA.c[1] - 12, PLAZA.c[0] + 8, PLAZA.c[1] + 12], weight: 1.2, market: 0.2, kind: 'street' });
  rects.push({ r: [TEMENOS[0] + 8, TEMENOS[1] + 6, TEMENOS[2] - 4, TEMENOS[3] - 6], weight: 1.0, market: 0.3, kind: 'street' });
  // the Outer Siq's line, and the way across the valley's floor from its end to the street
  const P = OUTER.path;
  for (let i = 0; i + 1 < P.length; i++) links.push({ a: P[i], b: P[i + 1], w: 6.5, kind: 'street', weight: 2.2 });
  links.push({ a: P[P.length - 1], b: [STREET.a[0] - 2, z - 4], w: 5, kind: 'street', weight: 2.2 });
  // the Siq's last stretch before the square (a few pass through it)
  links.push({ a: [PLAZA.c[0] + 10, PLAZA.c[1]], b: [SIQ_LINE[SIQ_LINE.length - 1][0] + 40, SIQ_LINE[SIQ_LINE.length - 1][1]], w: 3, kind: 'street', weight: 0.7 });
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon', linen: 'linen' };
export const WALKERS = [
  // the townsman: the long tunic with the cloak over a shoulder, bare-headed or in the headcloth, bearded
  { id: 'townsman', weight: 2.2, market: 1.7, el: { dress: 'robe', hat: 'none', over: 'cape', arms: 'hang', hair: 'short', beard: 1 },
    c1: [CL.white, CL.linen, CL.ochre, CL.brown], c2: [CL.white, CL.red, CL.indigo, CL.brown, CL.ochre], c3: [CL.white], speed: [0.9, 1.25], stride: 1.4 },
  { id: 'headcloth', weight: 1.5, market: 1.3, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang', beard: 1 },
    c1: [CL.white, CL.linen, CL.brown, CL.grey], c2: [CL.white, CL.ochre, CL.red], c3: [CL.white, CL.white, CL.red], speed: [0.9, 1.2], stride: 1.4 },
  // the caravan man: a dark cloak, the turban wound close, a staff
  { id: 'caravaneer', weight: 1.0, market: 0.7, el: { dress: 'robe', hat: 'turban', over: 'cape', arms: 'staff', carry: 'staff', beard: 1 },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.black, CL.indigo], c3: [CL.white, CL.brown], speed: [0.95, 1.2], stride: 1.45 },
  // the woman: the robe with a shawl over the hair
  { id: 'woman', weight: 1.4, market: 1.5, el: { dress: 'robe', hat: 'veil', over: 'shawl', arms: 'hang', hair: 'bun' }, swing: 0.7,
    c1: [CL.white, CL.red, CL.ochre, CL.indigo, CL.linen, CL.maroon], c2: [CL.white, CL.ochre], c3: [CL.white, CL.indigo, CL.red], speed: [0.8, 1.05], stride: 1.2, h: [0.9, 0.97] },
  // the woman or boy with the water jar on the head
  { id: 'jar', weight: 0.9, market: 1.1, el: { dress: 'robe', hat: 'veil', over: 'shawl', hair: 'bun', carry: 'pot', arms: 'head' }, swing: 0.5,
    c1: [CL.white, CL.ochre, CL.red, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the porter: a short tunic belted, the headcloth, a sack or a basket
  { id: 'porter', weight: 1.1, market: 1.6, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'sack', carry: 'sack', hair: 'short', beard: 0.5, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.ochre, CL.linen], c2: [CL.brown], c3: [CL.brown, CL.white], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'basket', weight: 0.8, market: 1.4, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'hang', carry: 'basket', hair: 'short', beard: 0.3, feet: 'bare' },
    c1: [CL.brown, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'tunic', legs: 'bare', hat: 'none', arms: 'hang', hair: 'short', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
