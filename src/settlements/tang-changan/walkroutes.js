// The routes walk-check follows (walk.js): the whole way from the arrival to the wine shop, and into each opened place on it.
import { WALK, ARRIVAL, shopUnits, shopRoute, walkedShops, walkedHouses, houseRoute } from './walk.js';
import { DACI_AX, MARKET_LANES, MARKET } from './layout.js';
import { WINE } from './layout.js';

export function mainRoute() {
  const LX = MARKET_LANES.x[0], LZ = MARKET_LANES.z[0], wx = (WINE.foot[0] + WINE.foot[2]) / 2;
  const r = [ARRIVAL, [120, 128], [120, 172], [DACI_AX, 172], [DACI_AX, 192], [DACI_AX, 210], [28, 210], [28, 10], [LX, 10], [LX, LZ], [wx, LZ]];
  r.y0 = 0; r.kind = 'main'; r.id = 'main';
  return r;
}
export function walkRoutes() {
  const out = [...walkedShops().map(shopRoute), ...walkedHouses().map(houseRoute)];
  { const wx = (WINE.foot[0] + WINE.foot[2]) / 2 + 1.2, z1 = WINE.foot[3], r = [[wx, z1 + 3.5], [wx, z1 + 0.4], [wx, z1 - 3], [wx, z1 - 7]]; r.y0 = 0; r.kind = 'wine-shop'; r.id = 'wine'; out.push(r); }
  void WALK; void shopUnits; void MARKET;
  return out;
}
