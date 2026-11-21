// The routes walk-check follows into the open shops of the visitor's walk (walk.js): in off the street at the way in, past the end of the counter, to the middle of the
// front room. A pure function of the layout and of the shop style's own rule for where the way in is (styles/mongol/shops.js: bayLeft). The palace plan carries them as `walks`.
import { SHOPS, SHOP_W, shopRect } from './layout.js';
import { ARRIVAL, WALK_REACH, walkDistance } from './walk.js';
import { frontFrame } from '../../styles/mongol/local.js';
import { bayLeft, rowTrades } from '../../styles/mongol/shops.js';

/** Every bay of every row: { row, i, trade, at: [x, z] (the middle of the front), route: [[x, z], …] (in from the street), left (the counter's side) }. */
export function bays() {
  const out = [];
  for (const s of SHOPS) {
    const F = frontFrame(shopRect(s), s.face), P = (u, v) => [F.O[0] + F.U[0] * u + F.V[0] * v, F.O[1] + F.U[1] * u + F.V[1] * v], trades = rowTrades(s.seed || 9);
    for (let i = 0; i < s.n; i++) {
      const left = bayLeft(s.seed || 9, i), ul = left ? i * SHOP_W + 2.55 : i * SHOP_W + 1.05;   // the way in: the 1.7 m between the end of the counter and the party wall
      out.push({ row: s, i, trade: trades[i % trades.length], left, at: P((i + 0.5) * SHOP_W, 0), route: [P(ul, 4.6), P(ul, 2.8), P(ul, 0.7), P(ul, -1.5)] });
    }
  }
  return out;
}
/** The bays on the walk, nearest the arrival first: the routes of the plan. */
export function walkRoutes(n = 16) {
  const near = bays().filter((b) => walkDistance(b.at) <= WALK_REACH + 0.5);
  near.sort((a, b) => Math.hypot(a.at[0] - ARRIVAL[0], a.at[1] - ARRIVAL[1]) - Math.hypot(b.at[0] - ARRIVAL[0], b.at[1] - ARRIVAL[1]));
  // spread the choice over the rows (one in three, so that the east rows, the west rows and the cross-street all show)
  const pick = [];
  for (let k = 0; k < near.length && pick.length < n; k += 3) pick.push(near[k]);
  return pick;
}
