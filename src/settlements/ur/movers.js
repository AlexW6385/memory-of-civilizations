// Ur c. 2050 BC — the moving life (docs/settlements/ur.md §10): men in the fleece-tufted kilt or the plain wrap, bare above
// the belt, heads and faces shaven; priests and scribes in the long wrap with a shawl; women in the shawled robe with the
// hair in a bun; porters with jars and baskets on the quay and the north street; boys. Data for the engine's movers
// (src/engine/movers.js, read in its worker); the ways come from layout.js: the north street to the temenos's gate, the
// market square, the way through the temenos to the Court of Nanna, the east street, the quay. No boats move (the reed
// boats of the harbour lie moored: plan.js).

import { RADIUS, TEMENOS, COURT, MARKET, HARBOUR } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 4, rain: 0.5, reach: 170, spawnMin: 24, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: HARBOUR.water,
};

export function walkways() {
  const links = [], L = (a, b, w, weight, extra = {}) => links.push({ a, b, w, kind: 'street', weight, ...extra });
  const [qx, qz0, , qz1] = [HARBOUR.rect[2], HARBOUR.rect[1] + 8, 0, HARBOUR.rect[3] - 8];
  L([0, MARKET[1] - 40], [0, MARKET[1]], 5, 2.2);                                // the north street
  L([0, MARKET[1]], [0, MARKET[3]], 4, 3.0);                                     // the way across the square to the gate
  L([0, MARKET[3]], [0, TEMENOS[1] + 6], 4, 2.4);                                // through the gate
  L([0, TEMENOS[1] + 6], [0, COURT[3] + 4], 6, 2.0);                             // on to the Court of Nanna
  L([TEMENOS[2], -20], [TEMENOS[2] + 120, -20], 4, 1.6);                         // the east street
  L([0, -155], [62, -155], 5, 1.3); L([62, -155], [62, -111], 4, 1.1); L([62, -111], [100, -111], 4, 0.9);   // to the palace's gate and court
  L([qx, qz0], [qx, qz1], 2.4, 2.4);                                             // the quay's top
  const rects = [
    { r: [MARKET[0] + 2, MARKET[1] + 2, MARKET[2] - 2, MARKET[3] - 2], weight: 1.6, market: 1.8, kind: 'street' },
    { r: [COURT[0] + 2, COURT[1] + 2, COURT[2] - 2, COURT[3] - 2], weight: 2.6, market: 0.6, kind: 'street' },
  ];
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', linen: 'linen', black: 'cloth_black' };
export const WALKERS = [
  // the man in the wrap or kilt, bare chest, shaven head, often bearded
  { id: 'man', weight: 2.2, market: 1.6, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', hair: 'shaven', beard: 0.4, feet: 'bare' },
    c1: [CL.white, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.9, 1.2], stride: 1.4 },
  // the priest or scribe: the long robe with a shawl over one shoulder
  { id: 'priest', weight: 1.0, market: 1.0, el: { dress: 'robe', hat: 'none', over: 'shawl', arms: 'hang', hair: 'shaven', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.linen], c2: [CL.white, CL.ochre], c3: [CL.brown], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'shawl', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.white, CL.ochre, CL.linen], c2: [CL.brown, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.5, market: 1.5, el: { dress: 'robe', hat: 'none', over: 'shawl', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.white, CL.ochre], c2: [CL.brown], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.4, market: 1.4, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'belt', carry: 'basket', arms: 'hang', hair: 'shaven', beard: 0.2, feet: 'bare' },
    c1: [CL.linen, CL.ochre, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'shaven', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.linen], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
