// Heian Uji — the moving life (docs/settlements/heian-uji.md §13): on the lanes of the village, the road to the Uji
// Bridge, the bridge itself and the east bank of the Aji pond walk courtiers in the black cap and robe, ladies in
// layered robes under the veiled hat (ichime-gasa), monks with a staff, villagers in the short jacket and trousers
// with the soft cap or the straw hat, porters with a pole, children. No boats (the river's boats stand, plan.js).
// In rain the villagers wear the straw hat and the palm-fibre cape (mino). Data for src/engine/movers.js.

import { RADIUS, RIVER, BRIDGE, COMPOUNDS, lots, inRect } from './layout.js';
import '../../styles/japanese/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 30, night: 4, rain: 0.6, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: 0,
};

const rx = RIVER.x + 15 * Math.sin(BRIDGE.z / 110);
/** The lanes (the gaps of the house grid, layout.js lots), the road to the bridge, the bank path, the bridge. */
export function walkways() {
  const rects = [], keep = (r) => !COMPOUNDS.some((c) => inRect(c, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 2)) && Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) < RADIUS - 60;
  const L = lots();
  const busy = (r) => L.some((l) => l.rect[0] < r[2] + 8 && l.rect[2] > r[0] - 8 && l.rect[1] < r[3] + 8 && l.rect[3] > r[1] - 8);
  // lanes along x between the rows of houses, and along z between the columns
  for (let z = -300; z < 280; z += 14) { const r = [-300, z + 10.6, 120, z + 13.4]; for (let x = -300; x < 120; x += 60) { const s = [x, r[1], x + 60, r[3]]; if (keep(s) && busy(s)) rects.push({ r: s, weight: 0.7, market: 0.3, kind: 'lane' }); } }
  for (let x = -300; x < 120; x += 15) { for (let z = -300; z < 280; z += 60) { const s = [x + 12.4, z, x + 14.6, z + 60]; if (keep(s) && busy(s)) rects.push({ r: s, weight: 0.5, market: 0.3, kind: 'lane' }); } }
  rects.push({ r: [-300, BRIDGE.z - 1.5, rx - 40, BRIDGE.z + 1.5], weight: 1.4, market: 0.3, kind: 'street' });           // the road to the bridge
  rects.push({ r: [47, -70, 52, 38], weight: 1.2, market: 0, kind: 'street' });                                      // the east bank of the pond
  rects.push({ r: [-100, 72, 48, 76], weight: 0.8, market: 0, kind: 'street' });                                     // the south shore path
  const links = [{ a: [rx - 41, BRIDGE.z], b: [rx + 41, BRIDGE.z], w: 2.6, kind: 'bridge', weight: 1.4 }];
  return { rects, links, clip: RADIUS - 12 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red' };
export const WALKERS = [
  // the courtier: robe of black or dark green over white, the lacquered cap (eboshi)
  { id: 'courtier', weight: 0.7, market: 0.6, el: { dress: 'robe', hair: 'topknot', hat: 'cap', hatMat: 'lacquer_black', over: 'collar', arms: 'hang' }, wet: 'cape',
    c1: [CL.black, CL.black, CL.green, CL.indigo, CL.maroon], c2: [CL.white, CL.white], c3: [CL.black], speed: [0.95, 1.2], stride: 1.5 },
  // the lady: layered robes of red, green, ochre or maroon, long hair, the veiled hat
  { id: 'lady', weight: 0.7, market: 0.6, el: { dress: 'robe', hair: 'long', hat: 'veil', over: 'collar', arms: 'hang' }, wet: 'cape', swing: 0.7,
    c1: [CL.red, CL.green, CL.maroon, CL.ochre, '#7a5a8a'], c2: [CL.white, CL.green, CL.red], c3: [CL.white], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.96] },
  // the monk with his staff, grey or black robe, shaven head
  { id: 'monk', weight: 0.7, market: 0.5, el: { dress: 'robe', hair: 'shaven', over: 'sash', carry: 'staff', arms: 'staff' }, wet: 'cape',
    c1: [CL.grey, CL.black, CL.ochre], c2: [CL.ochre, CL.white], c3: [CL.black], speed: [0.85, 1.1], stride: 1.4 },
  // the villager: short hemp jacket and trousers, the soft cap (tate-eboshi) or bare topknot
  { id: 'villager', weight: 1.6, market: 1.0, el: { dress: 'trousers', hair: 'topknot', hat: 'cap', hatMat: 'cloth_black', arms: 'hang' }, wet: 'cape',
    c1: [CL.brown, CL.indigo, CL.grey, 'linen', CL.white], c2: [CL.brown, CL.grey, CL.indigo], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'farmer', weight: 1.2, market: 0.6, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'hang' }, wet: 'cape',
    c1: [CL.brown, 'linen', CL.grey], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'porter', weight: 0.9, market: 0.8, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole' }, wet: 'cape', swing: 0.75, pole: true,
    c1: [CL.brown, CL.grey, 'linen'], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
  { id: 'woman', weight: 0.9, market: 0.8, el: { dress: 'robe', hair: 'long', over: 'sash', arms: 'hang' }, wet: 'cape', swing: 0.7,
    c1: [CL.indigo, CL.brown, CL.grey, CL.ochre], c2: [CL.white, CL.brown], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.88, 0.95] },
  { id: 'child', weight: 0.5, market: 0.3, el: { dress: 'trousers', hair: 'long', arms: 'hang' },
    c1: [CL.brown, CL.ochre, CL.red], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.2, 1.7], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet) { el.over = 'cloak'; cape = 'thatch_palm'; if (el.hat === 'veil' || el.hat === 'cap') { el.hat = 'straw'; el.hatMat = 'thatch'; } }
    addFigure(sb, v, figure, el, { far, cape });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
