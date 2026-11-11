// Tang Chang'an — the moving life (docs/settlements/tang-changan.md §10, §13): officials in round-collared robes and the black
// soft cap, women in the high-waisted dress with the shawl, Sogdian and Persian merchants in belted caftans with felt or turbaned
// heads, porters with the carrying pole, commoners in short tunics, monks, soldiers of the ward guard. They walk the avenue, the cross
// streets, the wards' lanes and the market's lanes (busiest by day; at night the ward gates are shut and the streets nearly empty).
// Data for the engine's movers (src/engine/movers.js), read in its worker; every way is read from layout.js. No boats.
import { RADIUS, STREETS, AVE, laneRects, MARKET_LANE_RECTS, MARKET_INNER, MARKET, DACI } from './layout.js';
import '../../styles/tang/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 80, night: 5, rain: 0.6, reach: 140, spawnMin: 22, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: 0,
};

/** The ways: the avenue's roadway (clear of the ditches and trees), the cross streets, the wards' lanes, the market's lanes; clipped to the disc. */
export function walkways() {
  const rects = [], mk = (r, weight, kind, market = 0) => rects.push({ r, weight, market, kind });
  mk([-40, -RADIUS + 14, 40, RADIUS - 14], 1.6, 'street');
  for (const s of STREETS.slice(1)) {
    const horiz = s[2] - s[0] > s[3] - s[1];
    const r = horiz ? [-RADIUS + 14, s[1] + 2, -AVE - 2, s[3] - 2] : [s[0] + 2, -RADIUS + 14, s[2] - 2, RADIUS - 14];
    mk(r, horiz && s[3] - s[1] > 40 ? 1.3 : 0.8, 'street');
    if (horiz) mk([AVE + 2, s[1] + 2, RADIUS - 14, s[3] - 2], s[3] - s[1] > 40 ? 1.3 : 0.8, 'street');
  }
  for (const r of laneRects()) mk(r, 0.35, 'lane');
  for (const r of MARKET_LANE_RECTS) mk(r, 3.2, 'street', 1);
  void MARKET_INNER; void MARKET; void DACI;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red', blue: 'cloth_blue' };
export const WALKERS = [
  // the official: the round-collared robe belted, colour by rank (purple, red, green, blue), the black soft cap
  { id: 'official', weight: 1.0, market: 0.5, el: { dress: 'robe', hair: 'topknot', hat: 'cap', hatMat: 'cloth_black', over: 'sash', arms: 'hang', beard: true }, wet: 'cape',
    c1: [CL.maroon, CL.red, CL.green, CL.blue, CL.maroon], c2: [CL.white, CL.black], c3: [CL.black], speed: [0.95, 1.2], stride: 1.5 },
  // the woman: the high-waisted dress under the breast, short jacket, the shawl, the high bun
  { id: 'woman', weight: 1.2, market: 1.4, el: { dress: 'robe', hair: 'bun', over: 'shawl', arms: 'hang' }, wet: 'cape', swing: 0.7,
    c1: [CL.red, CL.green, CL.ochre, CL.blue, CL.white, CL.maroon], c2: [CL.white, CL.ochre, CL.red, CL.green], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  // the Sogdian or Persian merchant: belted caftan, felt cap or turban, a beard, dark skin
  { id: 'sogdian', weight: 1.1, market: 2.4, el: { dress: 'robe', hair: 'short', hat: 'brim', over: 'belt', skin: 'skin_medium', beard: true, arms: 'hang' }, wet: 'cape',
    c1: [CL.indigo, CL.green, CL.maroon, CL.ochre, CL.brown], c2: [CL.white, CL.white, CL.ochre], c3: [CL.brown, CL.black], speed: [1.0, 1.3], stride: 1.45 },
  { id: 'persian', weight: 0.5, market: 1.8, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'sash', skin: 'skin_dark', beard: true, arms: 'hang' }, wet: 'cape',
    c1: [CL.white, CL.green, CL.blue, CL.ochre], c2: [CL.red, CL.indigo], c3: [CL.white, CL.ochre], speed: [0.95, 1.25], stride: 1.45 },
  // the porter with the pole and two loads, the sacker
  { id: 'porter', weight: 0.9, market: 1.3, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole' }, wet: 'cape', swing: 0.75, pole: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
  { id: 'commoner', weight: 1.3, market: 1.0, el: { dress: 'trousers', hair: 'topknot', hat: 'cap', hatMat: 'cloth_black', arms: 'hang' }, wet: 'cape',
    c1: [CL.brown, CL.grey, CL.white, CL.indigo, CL.ochre], c2: [CL.white, CL.brown, CL.grey], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  // the drover: the camel driver or groom in Hu dress, a staff
  { id: 'drover', weight: 0.6, market: 1.0, el: { dress: 'trousers', hair: 'short', hat: 'brim', carry: 'staff', arms: 'staff', skin: 'skin_medium', beard: true }, wet: 'cape',
    c1: [CL.brown, CL.indigo, CL.ochre, CL.green], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [1.0, 1.25], stride: 1.4 },
  { id: 'monk', weight: 0.5, market: 0.5, el: { dress: 'robe', hair: 'shaven', over: 'shawl', arms: 'hang' },
    c1: [CL.grey, CL.brown, CL.ochre], c2: [CL.ochre, CL.maroon, CL.brown], c3: [CL.black], speed: [0.9, 1.1], stride: 1.5 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) {
    for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
      const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
      const el = { ...k.el };
      let cape = null;
      if (wet) { el.over = 'cloak'; cape = 'thatch_palm'; if (el.hat === 'cap' || el.hat === 'brim' || el.hat === 'turban') { el.hat = 'straw'; el.hatMat = 'thatch'; } }
      addFigure(sb, v, figure, el, { far, cape });
    }
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
