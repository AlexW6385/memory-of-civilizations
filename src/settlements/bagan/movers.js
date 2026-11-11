// Pagan c. 1200 — the moving life (docs/settlements/bagan.md §10): monks in maroon robes on the alms round with their bowls, women in the htamein (a wrapped skirt) with a pot or
// basket on the head, farmers and porters, boys, along the roads, the lanes and the precincts. Boats are moored (the river lies at the disc's edge). Data for the engine's movers
// (src/engine/movers.js); the ways come from layout.js.
import { RADIUS, PRECINCT, SHWE_PREC, SULA_PREC, MAIN_ROAD, streets, bankX } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 2, rain: 0.4, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -2.4,
};

/** The ways: the streets of layout.js (the main road and the cross street with more traffic), the precincts' courts, and the road down to the ghat. */
export function walkways() {
  const rects = [], links = [];
  for (const s of streets()) {
    const main = s === MAIN_ROAD || s[2] - s[0] < 10 && s[3] - s[1] > 100;
    rects.push({ r: [s[0], s[1], s[2], s[3]], weight: main ? 1.5 : 0.9, market: main ? 1.3 : 0.5, kind: 'street' });
  }
  for (const [p, w] of [[PRECINCT, 1.2], [SHWE_PREC, 0.7], [SULA_PREC, 0.7]]) rects.push({ r: [p[0] + 3, p[1] + 3, p[2] - 3, p[3] - 3], weight: w, market: w, kind: 'street' });
  rects.push({ r: [bankX(0) + 1, -3, -290 + 40, 3], weight: 0.8, market: 0.8, kind: 'lane' });
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', green: 'cloth_green', black: 'cloth_black' };
export const WALKERS = [
  // the monk: the maroon robe over one shoulder, the head shaven, barefoot, an alms bowl
  { id: 'monk', weight: 1.4, market: 1.0, el: { dress: 'wrap', hat: 'none', over: 'shawl', arms: 'hang', hair: 'shaven', feet: 'bare', top: undefined }, swing: 0.6,
    c1: [CL.red, CL.red, CL.ochre], c2: [CL.red], c3: [CL.black], speed: [0.8, 1.0], stride: 1.1 },
  // the woman: a wrapped skirt and a short jacket, a pot on the head
  { id: 'jar', weight: 1.6, market: 1.2, el: { dress: 'wrap', hat: 'none', over: 'none', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.green, CL.red, CL.ochre, CL.brown, CL.white], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.75, 1.0], stride: 1.1, h: [0.9, 0.97] },
  { id: 'woman', weight: 1.8, market: 1.5, el: { dress: 'wrap', hat: 'none', over: 'none', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.green, CL.red, CL.ochre, CL.white, CL.brown], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  // the man: the longyi (a wrapped sarong) and a jacket, a head-cloth
  { id: 'man', weight: 1.7, market: 1.3, el: { dress: 'wrap', hat: 'none', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'bare' },
    c1: [CL.brown, CL.green, CL.black, CL.red], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'porter', weight: 0.9, market: 0.7, el: { dress: 'wrap', hat: 'none', over: 'none', arms: 'sack', carry: 'sack', hair: 'short', beard: false, feet: 'bare' },
    c1: [CL.brown, CL.ochre, CL.black], c2: [CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'boy', weight: 0.7, market: 0.8, el: { dress: 'wrap', hat: 'none', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'bare' },
    c1: [CL.white, CL.green, CL.brown], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
