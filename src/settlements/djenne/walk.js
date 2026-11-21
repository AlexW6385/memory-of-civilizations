// Djenné, 14th c. — the visitor's walk (docs/settlements/djenne.md §20.1). Pure data and a few functions of layout.js, no three.js.
// From the arrival (the market's south-east, looking west to the qibla front) along the clear strip toward the mosque, north up the
// aisle at x 59 to the shop row on the market's north edge, east along the shop fronts to the court house at the row's east end, and
// west again along the foot of the platform to the north stair: the shops, the court house and the wells stand on it.
import { SHOPS, COURT, MARKET, MOSQUE } from './layout.js';

export const ARRIVAL = [95, 30];
export const WALK = [
  [[95, 30], [75, 22], [55, 22]],           // west across the market toward the qibla front
  [[55, 22], [55, -43.2]],                // the aisle between the first and second rows of stalls, north to the shops
  [[55, -43.2], [110.5, -43.2]],          // along the shop fronts, to the court house's door
  [[55, -43.2], [40, -43.2], [38, -48], [0, -48]],     // west along the platform's foot to the north stair
];
export const SHOP_N = 8;
/** Shop i of the row: its middle c, and the middle of its entry on the east side of the counter. */
export function shopAt(i) {
  const W = (SHOPS[2] - SHOPS[0]) / SHOP_N, a = SHOPS[0] + i * W, c = a + W / 2;
  return { a, c, W, entry: c + 0.675, zFront: SHOPS[3], zBack: SHOPS[1] + 0.5 };
}
/** The court house's measures (interiors.js courtHouse): front on the south. */
export function courtAt() {
  const [x0, z0, x1, z1] = COURT, xm = (x0 + x1) / 2, zf = z1 - 0.5, zp = z1 - 5, zq = z0 + 4, xw = x0 + 3.5, xe = x1 - 3.5;
  return { x0, z0, x1, z1, xm, zf, zp, zq, xw, xe, west: x0 + 6.4, east: x1 - 6.4 };
}
/** The wells of the walk: open ground clear of the market's stalls and the houses (a woman draws water at each). */
export const WELLS = [[105.5, -36.8], [42.5, 29], [50.5, -47.5]];
void MARKET; void MOSQUE;
