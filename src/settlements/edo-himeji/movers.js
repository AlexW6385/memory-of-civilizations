// Edo Himeji — the moving life of the avenue, the lanes of the samurai quarter and the merchants' street
// (docs/settlements/edo-himeji.md §5.4): townsmen in kimono and obi, women with the hair in a bun, samurai with the two
// swords and the shaven crown, porters and pedlars with straw hats (kasa), labourers; in the rain the rush-straw raincape
// (mino) over the straw hat. No boats on the moats. Data for the engine's movers (src/engine/movers.js).
import { RADIUS, streets, lots } from './layout.js';
import '../../styles/edo/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 5, rain: 0.7, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: 0,
};

/** The share of shop fronts on the merchants' street's stretch (the crowd goes there by day). */
const shopShare = (r) => (r[1] > 325 ? 1 : 0);
/** The ways: the avenue from the main gate, the lanes between the samurai blocks, the merchants' street (the busiest). */
export function walkways() {
  const rects = streets().map((r) => {
    const w = Math.min(r[2] - r[0], r[3] - r[1]), shops = shopShare(r);
    return { r, weight: (w > 7 ? 1.3 : 0.7) * (1 + 3 * shops), market: shops, kind: w > 7 ? 'street' : 'lane' };
  });
  void lots;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red' };
export const WALKERS = [
  // the townsman: kimono with the obi, the topknot
  { id: 'townsman', weight: 1.6, market: 1.6, el: { dress: 'robe', hair: 'topknot', hairMat: 'hair_dark', over: 'sash', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.indigo, CL.indigo, CL.grey, CL.brown, CL.green], c2: [CL.grey, CL.black, CL.brown], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  // the samurai: dark kimono with the hakama, shaven crown and topknot, the two swords at the left hip
  { id: 'samurai', weight: 0.9, market: 0.7, el: { dress: 'robe', hair: 'topknot', hairMat: 'hair_dark', over: 'collar', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.black, CL.indigo, CL.grey, CL.brown], c2: [CL.grey, CL.black], c3: [CL.black], speed: [1.0, 1.25], stride: 1.5 },
  // the woman: kimono with a wide obi, the hair up
  { id: 'woman', weight: 1.1, market: 1.3, el: { dress: 'robe', hair: 'bun', hairMat: 'hair_dark', over: 'sash', arms: 'hang', feet: 'shod' }, wet: 'cape', swing: 0.6,
    c1: [CL.indigo, CL.maroon, CL.ochre, CL.green, CL.grey], c2: [CL.red, CL.ochre, CL.indigo, CL.white], c3: [CL.black], speed: [0.9, 1.15], stride: 1.1, h: [0.9, 0.96] },
  // the pedlar and the porter: the carrying pole with its two loads, the straw hat
  { id: 'pedlar', weight: 0.9, market: 1.3, el: { dress: 'wrap', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole', feet: 'bare' }, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.white, CL.indigo], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1, pole: true },
  { id: 'labourer', weight: 0.8, market: 0.6, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'hang', feet: 'bare' }, wet: 'cape',
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.grey], c3: [CL.black], speed: [1.15, 1.45], stride: 1.4 },
  { id: 'child', weight: 0.35, market: 0.3, el: { dress: 'robe', hair: 'topknot', arms: 'hang' }, c1: [CL.ochre, CL.indigo, CL.red], c2: [CL.white], c3: [CL.black], speed: [1.2, 1.7], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet) { el.over = 'cloak'; cape = 'thatch_palm'; if (!el.hat || el.hat === 'none') { el.hat = 'straw'; el.hatMat = 'thatch'; } }
    addFigure(sb, v, figure, el, { far, cape });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
