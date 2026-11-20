// The visitor's walk in Muscovy about 1600 and which shops of the trading rows stand open on it (docs/settlements/muscovy.md §12).
// Pure data and functions of layout.js and the style's rowsgeo.js (no three.js): plan.js gives the rows the opened shops' keys, town.js builds
// their contents near the visitor (lavki.js), soundmap.js and nightlight.js read the same shops, the walk check follows `walkRoutes`.
//
// The walk: from the arrival in Red Square (40, 20), south past the Lobnoye Mesto and the Tsar Cannon to St Basil's; east to the lane before the
// trading rows and along the rows' square front; through the cross passages into the two inner lanes; west across the square to the moat and
// the Spassky bridge, and through the gate into the Kremlin.
import { ROWS, SQUARE, LOBNOYE, BASIL, SPASSKY, MOAT, wallX, gateZ, height } from './layout.js';
import { shopList, DOOR_OPEN } from '../../styles/muscovite/rowsgeo.js';

export const ARRIVAL = [40, 20];
const zs = gateZ(SPASSKY[1]), xb = wallX(zs) + MOAT.d1 + 2;
/** The walk's lines [x, z]. */
export const WALK = [
  [[40, 20], [40, 96], [BASIL[0] + 8, BASIL[1] - 24]],      // down the square to St Basil's platform stair
  [[68, -100], [68, 85]],                                   // the lane before the rows' square front
  [[68, 52.6], [90, 52.6]],                                 // a cross passage into the inner lanes
  [[77.5, -25], [77.5, 85]], [[87.5, -25], [87.5, 85]],     // the two inner lanes (3 m between the ranges)
  [[40, 20], [xb + 3, zs]],                                 // across the square to the Spassky bridge's end
];

// ── the trades: the rows (ryady) of Moscow kept shops of one trade side by side ──
export const TRADES = ['cloth', 'hats', 'boots', 'candles', 'icons', 'pots', 'iron', 'furs', 'fish', 'flour', 'bread', 'saddles'];
const H3 = (a, b, c) => { let h = Math.imul(a * 73856093 ^ b * 19349663 ^ c * 83492791, 0x5bd1e995); h ^= h >>> 15; return (h >>> 0) % 4096; };
/** The trade of a shop: runs of four neighbours in a front share one (a row), the run's trade by the hash of its place. */
export const tradeOf = (s) => TRADES[(H3(s.b + 3, s.r * 2 + (s.sg > 0 ? 1 : 0) + 1, s.q >> 2) >> 2) % TRADES.length];

let SET = null;
/**
 * The opened shops: Map key → { ...shop, trade }. The square front's shops of blocks 2–5 (the four nearest the arrival; the first and last shop of a
 * block keep their end walls), every second shop of the first inner lane's west fronts and every third of the second lane's east fronts in blocks 3–5.
 */
export function openShops() {
  if (SET) return SET;
  SET = new Map();
  for (const s of shopList(ROWS)) {
    if (s.q < 1 || s.q > 10) continue;
    const ok = (s.r === 0 && s.b >= 2) || (s.r === 1 && s.sg < 0 && s.b >= 3 && s.q % 2 === 0) || (s.r === 1 && s.sg > 0 && s.b >= 3 && s.q % 3 === 1);
    if (ok) SET.set(s.key, { ...s, trade: tradeOf(s) });
  }
  return SET;
}
export const openKeys = () => [...openShops().keys()];

/** Routes into opened shops for the walk check: from the lane at the front, in at the door and one and a half metres into the room. */
export function walkRoutes(n = 10) {
  const out = [], all = [...openShops().values()], pick = [];
  // the nearest to the arrival of each front, then spread along the rows
  for (const f of [[0, -1], [1, -1], [1, 1]]) pick.push(...all.filter((s) => s.r === f[0] && s.sg === f[1]).sort((a, b) => Math.hypot(a.fx - 68, a.zc - 20) - Math.hypot(b.fx - 68, b.zc - 20)).filter((_, i) => i % 3 === 0).slice(0, Math.ceil(n / 3)));
  for (const s of pick) {
    const d = -s.sg, y = height(s.fx, s.zc);
    const r = [[s.fx - d * 1.5, s.zc], [s.fx + d * 0.4, s.zc], [s.fx + d * 2.0, s.zc]];
    r.y0 = y; out.push(r);
  }
  return out;
}
void SQUARE; void LOBNOYE; void DOOR_OPEN;
