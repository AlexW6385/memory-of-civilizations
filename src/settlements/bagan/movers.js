// Pagan c. 1200 — the moving life (docs/settlements/bagan.md §10): monks in maroon robes on the alms round with their bowls, women in the htamein (a wrapped skirt) with a pot or
// basket on the head, farmers and porters, boys, along the roads, the lanes and the precincts. Boats are moored (the river lies at the disc's edge). Data for the engine's movers
// (src/engine/movers.js); the ways come from layout.js.
import { RADIUS, PRECINCT, SHWE_PREC, SULA_PREC, THAT_ENC, PALACE, MAIN_ROAD, streets, bankX, lots } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 46, night: 3, rain: 0.4, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -2.4,
};

/** The ways: the streets of layout.js (the main road and the cross street with more traffic), the precincts' courts, and the road down to the ghat. */
export function walkways() {
  const rects = [], links = [];
  // the share of shop lots by a street: the market roads (the main road between the river and the Ananda) get the crowd by day
  const shopShare = (q) => {
    let n = 0, sh = 0;
    for (const l of lots()) {
      const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (cx < q[0] - 24 || cx > q[2] + 24 || cz < q[1] - 24 || cz > q[3] + 24) continue;
      n++; if (l.shop) sh++;
    }
    return n ? sh / n : 0;
  };
  for (const s of streets()) {
    const main = s === MAIN_ROAD || s[2] - s[0] < 10 && s[3] - s[1] > 100, sh = shopShare(s);
    rects.push({ r: [s[0], s[1], s[2], s[3]], weight: (main ? 1.5 : 0.9) * (1 + 1.5 * sh), market: (main ? 1.3 : 0.5) + 1.8 * sh, kind: 'street' });
  }
  for (const [p, w] of [[PRECINCT, 1.6], [SHWE_PREC, 0.9], [SULA_PREC, 0.9], [THAT_ENC, 0.8], [PALACE, 0.6]]) rects.push({ r: [p[0] + 3, p[1] + 3, p[2] - 3, p[3] - 3], weight: w, market: w, kind: 'street' });
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
  // the novice: a boy in the maroon robe, head shaven, on the alms round with an older monk
  { id: 'novice', weight: 0.8, market: 0.6, el: { dress: 'wrap', hat: 'none', over: 'shawl', arms: 'hang', hair: 'shaven', feet: 'bare', top: undefined }, swing: 0.7,
    c1: [CL.red, CL.ochre], c2: [CL.red], c3: [CL.black], speed: [0.85, 1.1], stride: 1.0, h: [0.62, 0.74] },
  // the nun (thilashin): a pink-brown robe, head shaven, a basket
  { id: 'nun', weight: 0.5, market: 0.4, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'basket', arms: 'hang', hair: 'shaven', feet: 'bare' }, swing: 0.5,
    c1: ['#c98f86', CL.brown], c2: ['#c98f86'], c3: [CL.white], speed: [0.75, 1.0], stride: 1.1, h: [0.88, 0.95] },
  // the pilgrim with an offering: flowers and candles in a basket, a white jacket
  { id: 'pilgrim', weight: 1.2, market: 1.0, el: { dress: 'wrap', hat: 'none', over: 'none', carry: 'basket', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.6,
    c1: [CL.white, CL.green, CL.red, CL.ochre], c2: [CL.white], c3: [CL.black], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  // the vendor with a loaded pole (a yoke of two baskets)
  { id: 'vendor', weight: 0.9, market: 1.6, el: { dress: 'wrap', hat: 'straw', carry: 'pole', arms: 'pole', hair: 'short', beard: false, feet: 'bare' }, swing: 0.75,
    c1: [CL.brown, CL.green, CL.black], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.95, 1.2], stride: 1.1, pole: true },
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
