// The visitor's walk in Ottoman Istanbul about 1560 (docs/settlements/ottoman-istanbul.md §18): from the arrival at the outer court's
// north gate through the court to the mosque, out of the gate and round the court's wall into the two avenues, where the vaulted
// shops (arasta) stand open before the medreses, and down the terrace's gate to the lanes of the quarter with their open shops
// and houses (konak.js). Pure data and functions: the arasta's elements and shops, their keepers, and the routes walk-check follows.

import { arastaShops } from '../../styles/ottoman/index.js';
import { MEDRESES, ARASTA, TOP, PRECINCT } from './layout.js';

/** The two rows of vaulted shops as plan elements (west: cloth, the Tiryaki Çarşısı; east: copper, the Dökmeciler: §4.9). */
export function arastaEls() {
  return ['w', 'e'].map((f) => {
    const gates = MEDRESES.filter((q) => (q.out === 'w') === (f === 'w')).map((q) => [q.rect[1] + 5 * 4.2 - 1.6, q.rect[1] + 6 * 4.2 + 1.6]);
    return { t: 'arasta', x: ARASTA[f], z0: ARASTA.z0, z1: ARASTA.z1, face: f === 'w' ? 'e' : 'w', d: ARASTA.d, y: TOP, gaps: [...gates, [-9.8, -6.8]], goods: f === 'w' ? 'cloth' : 'copper' };
  });
}
/** A hash in [0, 1) of a position alone (the builder's own, so that the keeper sits where the goods leave room). */
const hashAt = (x, z, s = 0) => { let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
let SHOPS = null;
/**
 * Every shop of both rows in world metres: { sg (the way its front looks: +1 east, −1 west), xb (the back wall), X(v) (a point v in from the
 * back), zc, hw, goods, sk (the side of the keeper) }. The order is the west row from the north, then the east.
 */
export function arastaList() {
  if (SHOPS) return SHOPS;
  SHOPS = [];
  for (const el of arastaEls()) {
    const sg = el.face === 'w' ? -1 : 1;
    for (const s of arastaShops(el)) SHOPS.push({ ...s, sg, xb: el.x, d: el.d, goods: el.goods, sk: hashAt(el.x, s.zc, 4) < 0.5 ? -1 : 1, X: (v) => el.x + sg * v });
  }
  return SHOPS;
}
/** The keeper of each shop, sitting cross-legged on the plank floor at the back on his side (the street life's figure). */
export function keepers() {
  const out = [];
  for (const s of arastaList()) {
    const cloth = s.goods === 'cloth', h = hashAt(s.xb, s.zc, 21);
    out.push({
      t: 'figure', at: [s.X(2.9), s.zc + s.sk * 0.95], y: TOP + 0.61, rot: -s.sg * Math.PI / 2, seed: Math.floor(h * 1e9), skin: h < 0.7 ? 'skin_light' : 'skin_medium', dress: 'robe',
      cloth: cloth ? ['cloth_green', 'cloth_indigo', 'cloth_maroon', 'cloth_ochre'][Math.floor(hashAt(s.xb, s.zc, 22) * 4)] : 'cloth_brown', cloth2: 'cloth_white',
      over: cloth ? 'sash' : 'apron', hat: 'turban', hatMat: 'cloth_white', hair: 'short', beard: true, pose: 'cross',
    });
  }
  return out;
}
/** Routes into every shop: from the avenue in at the gap in the counter, over the two steps, along the aisle (the keeper's and the goods' sides are off it). */
export function arastaRoutes() {
  return arastaList().map((s) => { const w = [[s.X(s.d + 2.2), s.zc], [s.X(s.d + 0.35), s.zc], [s.X(s.d - 1.0), s.zc], [s.X(1.7), s.zc]]; w.y0 = TOP; return w; });
}
/** A z near a shop's door lane moved to the pier beside it (goods and benches standing before the shops keep the way in clear). */
export function offLane(row, z, half = 0.9) {
  for (const s of arastaList()) {
    if (s.sg !== row) continue;
    if (Math.abs(z - s.zc) < 0.95 + half) return s.zc + (z >= s.zc ? 1 : -1) * (0.95 + half + 0.05 > 1.65 ? 1.65 : 0.95 + half + 0.05);
  }
  return z;
}
export { PRECINCT };
