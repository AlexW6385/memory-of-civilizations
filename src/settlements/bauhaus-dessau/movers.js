// Bauhaus Dessau c. 1927 — the moving life (docs/settlements/bauhaus-dessau.md §7): students of both sexes in plain work dress (women with
// bobbed hair in knee-length dresses, men in jackets and trousers), townspeople in hats and coats, workers in caps, women with shopping baskets,
// children; on the streets and pavements round the school and along Ebertallee. No boats. Data for the engine's movers; the ways come from layout.js.
import { RADIUS, walkRects, TORTEN, TORTEN_FRONT, KONSUM } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 64, night: 3, rain: 0.4, reach: 150, spawnMin: 24, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -1,
};

/** The ways: both pavements of every street, the school's forecourt, the paths between the Masters' Houses. */
export function walkways() {
  const rects = walkRects().map((w) => ({ ...w, market: 0.3 }));
  rects.push({ r: [-12, -9, 44, 3], weight: 1.6, market: 0.5, kind: 'street' });          // Kothener Strasse's roadway under the bridge, the court
  rects.push({ r: [1.5, 3, 8, 14], weight: 1.2, market: 0.3, kind: 'street' });           // the main door
  rects.push({ r: [-20, 36, 52, 42], weight: 0.8, market: 0.2, kind: 'lane' });           // the sports field's edge
  rects.push({ r: [44, 40, 170, 46], weight: 0.6, market: 0.1, kind: 'lane' });           // the path before the Masters' Houses
  // Törten: the lanes before the houses and between the rows, the Konsum's forecourt; the school's sports field
  TORTEN.forEach((r, i) => rects.push({ r: TORTEN_FRONT[i] === 's' ? [r[0], r[3] + 0.4, r[2], r[3] + 2.4] : [r[0], r[1] - 2.4, r[2], r[1] - 0.4], weight: 0.9, market: 0.2, kind: 'lane' }));
  rects.push({ r: [-12, 130.7, 62, 135.3], weight: 1.0, market: 0.3, kind: 'lane' }, { r: [KONSUM[0] - 4, KONSUM[3] + 0.4, KONSUM[2], KONSUM[3] + 3.5], weight: 1.0, market: 1.0, kind: 'street' });
  rects.push({ r: [52, 4, 140, 40], weight: 0.5, market: 0.1, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 20 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', blue: 'cloth_blue', indigo: 'cloth_indigo', green: 'cloth_green' };
export const WALKERS = [
  // the student: bobbed hair, a plain dress to the knee
  { id: 'student-w', weight: 2.0, market: 0.6, el: { dress: 'robe', hat: 'none', over: 'none', arms: 'hang', hair: 'short', feet: 'shod' }, swing: 0.8,
    c1: [CL.blue, CL.ochre, CL.grey, CL.red, CL.green, CL.white], c2: [CL.white, CL.grey], c3: [CL.black], speed: [1.0, 1.35], stride: 1.3, h: [0.93, 1.0] },
  // the student: jacket and trousers, no hat, some with a portfolio under the arm
  { id: 'student-m', weight: 2.2, market: 0.6, el: { dress: 'trousers', hat: 'none', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'shod' }, swing: 0.8,
    c1: [CL.grey, CL.brown, CL.indigo, CL.black, CL.ochre], c2: [CL.grey, CL.brown, CL.black], c3: [CL.black], speed: [1.1, 1.5], stride: 1.5 },
  // the townsman: a felt hat, a dark coat
  { id: 'townsman', weight: 1.5, market: 1.0, el: { dress: 'trousers', hat: 'brim', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'shod' },
    c1: [CL.black, CL.grey, CL.brown, CL.indigo], c2: [CL.black, CL.grey], c3: [CL.black], speed: [0.9, 1.25], stride: 1.4 },
  // the worker of the Junkers works: a cap, work clothes
  { id: 'worker', weight: 1.4, market: 0.3, el: { dress: 'trousers', hat: 'cap', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'shod' },
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.black], c3: [CL.black], speed: [1.0, 1.4], stride: 1.5 },
  // the woman with her shopping basket, a coat and a small hat
  { id: 'shopper', weight: 1.4, market: 1.4, el: { dress: 'robe', hat: 'cap', over: 'none', carry: 'basket', arms: 'hang', hair: 'bun', feet: 'shod' }, swing: 0.5,
    c1: [CL.brown, CL.grey, CL.green, CL.black, CL.indigo], c2: [CL.red, CL.grey], c3: [CL.black], speed: [0.8, 1.1], stride: 1.2, h: [0.92, 0.98] },
  // the postman: a peaked cap, a dark-blue coat, a leather bag
  { id: 'postman', weight: 0.5, market: 0.8, el: { dress: 'trousers', hat: 'cap', over: 'none', carry: 'basket', arms: 'hang', hair: 'short', beard: false, feet: 'shod' },
    c1: [CL.indigo], c2: [CL.indigo, CL.black], c3: [CL.black], speed: [1.1, 1.4], stride: 1.5 },
  // the baker's or grocer's boy with a basket, an apron of white
  { id: 'shop-boy', weight: 0.6, market: 1.2, el: { dress: 'trousers', hat: 'cap', over: 'none', carry: 'basket', arms: 'hang', hair: 'short', beard: false, feet: 'shod' },
    c1: [CL.white, CL.grey], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.2, 1.6], stride: 1.5, h: [0.8, 0.9] },
  { id: 'child', weight: 0.7, market: 0.6, el: { dress: 'trousers', hat: 'cap', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'shod' },
    c1: [CL.blue, CL.brown, CL.grey, CL.red], c2: [CL.grey, CL.brown], c3: [CL.black], speed: [1.1, 1.6], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
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
