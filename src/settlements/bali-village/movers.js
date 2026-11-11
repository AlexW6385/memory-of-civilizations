// A Balinese village, c. 1900 — the moving life (docs/settlements/bali-village.md §7): women carrying offerings on their heads, men in the headcloth (udeng) and sash,
// farmers with the hoe and the straw hat, porters with the carrying pole, children, a priest in white; on the village street, the cross lane and the temple's forecourt.
// Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js. No boats.
import { RADIUS, STREET, LANE, FORECOURT } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 3, rain: 0.45, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -100,
};

export function walkways() {
  const rects = [], R = (r, weight, market = 0.3, kind = 'street') => rects.push({ r, weight, market, kind });
  R([STREET[0] + 0.4, STREET[1] + 2, STREET[2] - 0.4, STREET[3] - 4], 2.6, 0.5);                   // the village street, west bank clear of the channel
  R([LANE[0] + 6, LANE[1] + 0.4, LANE[2] - 6, LANE[3] - 0.4], 1.8, 0.5, 'lane');                  // the cross lane
  R([FORECOURT[0] + 1, FORECOURT[1] + 1, FORECOURT[2] - 1, FORECOURT[3]], 1.6, 0.4);              // the temple's forecourt
  R([-14, -4, 14, 22], 1.5, 0.6);                                                                  // the crossing
  return { rects, links: [], clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', indigo: 'cloth_indigo', black: 'cloth_black', grey: 'cloth_grey' };
export const WALKERS = [
  // the woman with the offering tower (banten) on her head: the kain to the ankle, a sash, the hair in a bun
  { id: 'offering', weight: 2.0, market: 1.6, el: { dress: 'wrap', hair: 'bun', hat: 'none', over: 'sash', carry: 'basket', arms: 'head', feet: 'bare' }, swing: 0.7,
    c1: [CL.red, CL.ochre, CL.white, CL.indigo], c2: [CL.ochre, CL.white], c3: [CL.black], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'woman', weight: 1.2, market: 1.0, el: { dress: 'wrap', hair: 'bun', hat: 'none', over: 'sash', arms: 'hang', feet: 'bare' }, swing: 0.7,
    c1: [CL.brown, CL.indigo, CL.red, CL.ochre], c2: [CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  // the man in the udeng (a cloth knotted round the head), a sash over the kain, bare to the waist or in a white jacket
  { id: 'man', weight: 1.6, market: 1.0, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', hatMat: 'cloth_ochre', over: 'sash', arms: 'hang', feet: 'bare' },
    c1: [CL.brown, CL.white, CL.indigo], c2: [CL.ochre, CL.white], c3: [CL.black], speed: [0.95, 1.25], stride: 1.35 },
  { id: 'devotee', weight: 1.3, market: 1.4, el: { dress: 'wrap', hair: 'short', hat: 'turban', hatMat: 'cloth_white', over: 'sash', arms: 'hang', feet: 'bare' },
    c1: [CL.white], c2: [CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.25 },
  { id: 'farmer', weight: 1.4, market: 0.1, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'straw', carry: 'hoe', arms: 'hoe', feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.brown], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'porter', weight: 0.9, market: 0.8, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'none', carry: 'pole', arms: 'pole', feet: 'bare' }, swing: 0.75, pole: true,
    c1: [CL.brown, CL.white], c2: [CL.brown, CL.white], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
  { id: 'child', weight: 0.7, market: 0.8, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'none', arms: 'hang', feet: 'bare' },
    c1: [CL.red, CL.white, CL.indigo], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) addFigure(sb, sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far, cape: null });
}
export function boatShapes() { /* none */ }
