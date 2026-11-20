// The visitor's walk in Abbasid Baghdad (docs/settlements/abbasid-baghdad.md §19): the routes walk-check follows into the opened places.
// An open bay of a suq row (market.js openBay: every fourth bay, k % 4 === 1) has a counter 0.85 m long on its xa side and an aisle 1.65 m clear beside
// it: the route goes in from the middle of the street, across the front line, to the back of the aisle. Pure data (no three.js).
import { ALL_SUQS } from './layout.js';
import { OPEN_AT } from '../../styles/abbasid/market.js';

const S = 6;                                       // the street's width (market.js suqRow)
/** The world points of a route into bay k on side s (−1 | 1) of the suq row `row` (an index of ALL_SUQS), or null if the row has no such bay. */
export function bayRoute(row, k, s) {
  const r = ALL_SUQS[row].rect, horiz = r[2] - r[0] > r[3] - r[1], L = horiz ? r[2] - r[0] : r[3] - r[1], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
  const nb = Math.max(1, Math.floor((L - 4) / 3.2)), bw = (L - 4) / nb;
  if (k >= nb || k % 4 !== 1) return null;
  const u = -L / 2 + 2 + k * bw + 0.22 + OPEN_AT + (bw - 0.44 - OPEN_AT) / 2;
  const w = ([uu, v]) => (horiz ? [cx + uu, cz + v] : [cx + v, cz - uu]);
  const out = [[u, 0], [u, s * (S / 2 + 0.5)], [u, s * (S / 2 + 1.5)], [u, s * (S / 2 + 2.5)]].map(w);
  out.y0 = 0;
  return out;
}
/** The routes into open bays: the south avenue (on the way from the gate), the paper, cloth and money-changers' rows, the other avenues and the cross suqs. */
export function bayRoutes() {
  return [[10, 1, 1], [10, 5, -1], [0, 1, 1], [2, 1, -1], [3, 5, 1], [8, 1, 1], [9, 1, -1], [4, 1, 1], [5, 5, -1]].map(([row, k, s]) => bayRoute(row, k, s)).filter(Boolean);
}
