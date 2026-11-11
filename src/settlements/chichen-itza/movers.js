// Chichén Itzá c. 1000 — the moving life (docs/settlements/chichen-itza.md §14): Maya men in loincloth and cape, women in the long
// white cotton dress, priests in long cloaks and caps, bearers with jars and baskets on the head, pilgrims on the sacbe, boys. Data
// for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js: the Great Plaza, the sacbe to
// the Sacred Cenote, and the lanes between the house lots (the 34 m grid's gaps). No boats.

import { RADIUS, PLAZA, SACBE, CENOTE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 4, rain: 0.5, reach: 170, spawnMin: 26, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: CENOTE.water,
};

/** The ways: the plaza (busiest), the sacbe, and the lanes in the gaps between the lots, from the plaza's edges outward. */
export function walkways() {
  const rects = [], links = [], clip = RADIUS - 14;
  rects.push({ r: [PLAZA[0] + 4, PLAZA[1] + 4, PLAZA[2] - 4, PLAZA[3] - 4], weight: 2.4, market: 2.0, kind: 'street' });
  rects.push({ r: [SACBE.a[0] - SACBE.w / 2 + 0.6, SACBE.b[1] + 2, SACBE.a[0] + SACBE.w / 2 - 0.6, SACBE.a[1] + 4], weight: 1.6, market: 0.6, kind: 'street' });
  // the lots stand on a 34 m grid from −330; their gaps (4–6 m) lie centred at −296.5 + 34 i
  for (let i = 0; i < 18; i++) {
    const c = -296.5 + 34 * i;
    if (Math.abs(c) > clip - 20) continue;
    const reach = Math.sqrt(Math.max(0, clip * clip - c * c));
    // north/south lanes beyond the plaza (and short of the cenote), east/west lanes beyond its sides
    if (c > PLAZA[0] + 6 && c < PLAZA[2] - 6) {
      const north = Math.abs(c) < CENOTE.r + 16 ? -236 : -reach;
      rects.push({ r: [c - 1.5, north, c + 1.5, PLAZA[1] + 6], weight: 0.5, market: 0.2, kind: 'lane' });
      rects.push({ r: [c - 1.5, PLAZA[3] - 6, c + 1.5, reach], weight: 0.6, market: 0.3, kind: 'lane' });
    } else if (Math.abs(c) < clip - 20) {
      rects.push({ r: [c - 1.5, -reach, c + 1.5, reach], weight: 0.4, market: 0.1, kind: 'lane' });
    }
    if (c > PLAZA[1] + 6 && c < PLAZA[3] - 6) {
      rects.push({ r: [-reach, c - 1.5, PLAZA[0] - 6, c + 1.5], weight: 0.5, market: 0.2, kind: 'lane' });
      rects.push({ r: [PLAZA[2] + 6, c - 1.5, reach, c + 1.5], weight: 0.5, market: 0.2, kind: 'lane' });
    }
  }
  return { rects, links, clip };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', blue: 'cloth_blue', brown: 'cloth_brown', indigo: 'cloth_indigo' };
export const WALKERS = [
  // the man: the loincloth (ex) with its long ends, a cape of cotton, long hair tied up
  { id: 'man', weight: 2.0, market: 1.6, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'cape', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.white, CL.ochre, CL.red], c2: [CL.white, CL.ochre, CL.blue, CL.red], c3: [CL.brown], speed: [0.9, 1.2], stride: 1.4 },
  // the workman: the loincloth alone
  { id: 'workman', weight: 1.1, market: 1.0, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.red, CL.brown], c3: [CL.brown], speed: [1.0, 1.3], stride: 1.4 },
  // the woman: the long white cotton dress, the hair in a bun or long
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.white, CL.white, CL.white, CL.ochre], c2: [CL.red, CL.blue, CL.ochre, CL.white], c3: [CL.white], speed: [0.8, 1.05], stride: 1.2, h: [0.9, 0.97] },
  // the bearer: a jar or basket on the head
  { id: 'jar', weight: 1.5, market: 1.6, el: { dress: 'robe', hat: 'none', over: 'sash', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.white, CL.white, CL.ochre], c2: [CL.red, CL.white], c3: [CL.white], speed: [0.75, 0.98], stride: 1.15, h: [0.9, 0.97] },
  // the porter / pilgrim: a loaded sack on the shoulder
  { id: 'porter', weight: 1.2, market: 1.2, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.brown, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  // the priest: a long cloak and cap, a staff
  { id: 'priest', weight: 0.7, market: 0.4, el: { dress: 'robe', hat: 'cap', hatMat: 'stucco_leaf', over: 'cloak', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.white], c2: [CL.red, CL.blue, CL.red], c3: [CL.red, CL.blue], speed: [0.75, 0.95], stride: 1.25 },
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
