// Joseon Hanyang — the moving life of the lanes, the avenue and Jongno (docs/settlements/joseon-seoul.md
// §14): men in the white coat (durumagi) and the black horsehair gat, the scholar-officials in blue
// or grey over white, women in the short jacket and full skirt with the green cloak (jangot) held over
// the head, porters with the A-frame, labourers in straw hats, boys with the braid. No boats. Data
// for the engine's movers (src/engine/movers.js), read in its worker.
// (The porter walks with a staff as the engine's figures cannot carry the A-frame on the move; his
// frame stands resting in town.js.) In rain everyone wears the straw rain-hat and cape.

import { RADIUS, lanes, AVENUE, JONGNO, SHOPS, PALACE } from './layout.js';
import '../../styles/joseon/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 6, rain: 0.7, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: 0,
};

const shopShare = (r) => {
  let n = 0;
  for (const s of SHOPS) { const ov = Math.max(0, Math.min(r[2], s[2]) - Math.max(r[0], s[0])), ovz = Math.max(0, Math.min(r[3], s[3] + 8) - Math.max(r[1], s[1] - 8)); if (ov > 0 && ovz > 0) n += ov; }
  return Math.min(1, n / Math.max(1, r[2] - r[0], r[3] - r[1]));
};
/** The ways: the avenue and Jongno (the market), the lanes between the hanok lots; not the palace's courts. */
export function walkways() {
  const rects = [];
  const push = (r, weight, kind) => rects.push({ r, weight, market: shopShare(r), kind });
  push([AVENUE[0] + 3, AVENUE[1] + 4, AVENUE[2] - 3, AVENUE[3] - 2], 1.5, 'street');
  push([JONGNO[0] + 6, JONGNO[1] + 0.5, JONGNO[2] - 6, JONGNO[3] - 0.5], 2.2, 'street');
  for (const l of lanes()) {
    if (l[0] > PALACE[0] - 6 && l[2] < PALACE[2] + 6 && l[3] < PALACE[3] + 6 && l[1] > PALACE[1] - 6) continue;
    push(l, 0.6, 'lane');
  }
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red', blue: 'cloth_blue' };
export const WALKERS = [
  // the commoner man: white coat, the black gat (a brimmed hat of horsehair), the topknot under it
  { id: 'man', weight: 1.7, market: 1.5, el: { dress: 'robe', hair: 'topknot', hat: 'brim', hatMat: 'lacquer_black', over: 'none', arms: 'hang' }, wet: 'cape',
    c1: [CL.white, CL.white, CL.white, 'linen', CL.grey], c2: [CL.white, CL.white], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  // the scholar: blue or grey outer coat over white, the gat
  { id: 'scholar', weight: 0.9, market: 1.1, el: { dress: 'robe', hair: 'topknot', hat: 'brim', hatMat: 'lacquer_black', over: 'sash', arms: 'hang' }, wet: 'cape',
    c1: [CL.blue, CL.indigo, CL.grey, CL.white], c2: [CL.white], c3: [CL.black], speed: [0.95, 1.2], stride: 1.5 },
  // the woman: short jacket and skirt, the green cloak over the head
  { id: 'woman', weight: 1.3, market: 1.3, el: { dress: 'robe', hair: 'bun', hat: 'veil', hatMat: 'cloth_green', over: 'none', arms: 'hang' }, wet: 'cape', swing: 0.7,
    c1: [CL.white, CL.indigo, CL.white, CL.maroon, CL.ochre], c2: [CL.white, CL.indigo, CL.red], c3: [CL.green], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.96] },
  // the labourer: jacket and trousers, the straw hat
  { id: 'labourer', weight: 0.9, market: 0.7, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', hatMat: 'thatch', arms: 'hang' }, wet: 'cape',
    c1: [CL.white, 'linen', CL.grey], c2: [CL.white, 'linen', CL.grey], c3: [CL.black], speed: [1.15, 1.4], stride: 1.4 },
  // the porter, the staff at the hand
  { id: 'porter', weight: 0.8, market: 1.1, el: { dress: 'trousers', hair: 'topknot', hat: 'none', carry: 'staff', arms: 'staff', staffMat: 'timber', len: 1.0 }, wet: 'cape',
    c1: [CL.white, 'linen'], c2: [CL.white, 'linen', CL.grey], c3: [CL.black], speed: [1.0, 1.25], stride: 1.15 },
  // the boy: white coat, the braid hanging
  { id: 'boy', weight: 0.4, market: 0.3, el: { dress: 'trousers', hair: 'long', arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.red], c2: [CL.white], c3: [CL.black], speed: [1.2, 1.7], stride: 1.0, h: [0.62, 0.72], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) {
    for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
      const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
      const el = { ...k.el };
      let cape = null;
      if (wet) { el.over = 'cloak'; cape = 'thatch_palm'; if (el.hat === 'brim' || el.hat === 'veil') { el.hat = 'straw'; el.hatMat = 'thatch'; } }
      addFigure(sb, v, figure, el, { far, cape });
    }
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
