// Which lots are the open houses, which of them have an open upper storey and which trade works in their main room (pure data and functions of
// layout.js, so that the sound map and the night can read them without three.js). town.js builds the plans from it.
import { STREET, CARDO, lots } from './layout.js';

/** The trades of the open houses, in the order the rule hands them out (houses.js builds each). */
export const TRADES = ['weaver', 'potter', 'dyer', 'oil', 'copper'];
/** The lots of the open houses: north of the street to the Haram (their doors to the south, toward it), nearest its stair. */
export function openLots() {
  const big = lots().filter((l) => l.rect[2] - l.rect[0] > 12.5 && l.rect[3] - l.rect[1] > 12.5 && l.gs >= 1.2);
  const near = lots().filter((l) => l.rect[2] - l.rect[0] > 12.5 && l.rect[3] - l.rect[1] > 12.5).filter((l) => l.rect[3] < -14 && l.rect[3] > -52).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 + 185, a.rect[3]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 + 185, b.rect[3])).slice(0, 8);
  // beyond: every fifth big lot in a strip along the market street's south side, every sixth on the Cardo's flanks, every ninth elsewhere
  const rest = big.filter((l) => !near.includes(l)), pick = [];
  rest.forEach((l, i) => {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    const rule = cz > STREET.half && cz < 60 && cx < STREET.x1 ? 4 : Math.abs(cx - CARDO.x) < 60 ? 5 : 7;
    if (i % rule === 0) pick.push(l);
  });
  return [...near, ...pick];
}
/** The use of the upper chambers, in the order the rule hands them out (upstairs.js). */
const UP_KINDS = ['inn', 'merchant', 'craftsman', 'family', 'granary', 'tenement'];
/**
 * The open houses whose upper storey is open (docs/settlements/jerusalem.md §5d): the eight nearest the Haram's stair, and the four others
 * nearest the market street's axis; each with its use. Pilgrims' guest houses and merchants' houses keep no trade's work on the ground floor.
 */
export function upLots() {
  const open = openLots(), near = open.slice(0, 8), rest = open.slice(8).sort((a, b) => Math.abs((a.rect[1] + a.rect[3]) / 2) - Math.abs((b.rect[1] + b.rect[3]) / 2)).slice(0, 4);
  return [...near, ...rest].map((l, i) => ({ lot: l, up: UP_KINDS[i % UP_KINDS.length] }));
}
/** The trade of an open lot's main room: two in three of the open houses, the guest houses and merchants' houses excepted (town.js, houses.js). */
export function tradeOf(l, open, up) { return open.has(l) && l.seed % 3 && up !== 'inn' && up !== 'merchant' ? TRADES[l.seed % TRADES.length] : null; }
