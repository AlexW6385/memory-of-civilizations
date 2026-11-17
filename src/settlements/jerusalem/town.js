// The houses of the city (docs/settlements/jerusalem.md §5, §5a): every lot a courtyard house; four of them
// near the street from the west gate to the Haram open, their rooms walkable and furnished, with the life of
// the house (life.js).
import { RADIUS, HARAM, LODGES, CARDO, STREET, lots, height } from './layout.js';
import { frontClass, TRADES } from './houses.js';
import { houseLife, pilgrims, lodgeLife, lodgeFront, domeLife } from './life.js';
const base = (id, elements, style = 'islamic-houses') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-180, 0], facing: 'e' } });
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
export async function houses() {
  const all = lots(), open = new Set(openLots()), plans = [];
  const el = (l) => {
    const [x0, z0, x1, z1] = l.rect, ys = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([a, b]) => height(a, b));
    return { t: 'levant_house', ...l, y1: Math.max(...ys), ys: height((x0 + x1) / 2, z1 + 0.8), open: open.has(l), front: frontClass(l), trade: open.has(l) && l.seed % 3 ? TRADES[l.seed % TRADES.length] : null };
  };
  for (let i = 0; i < all.length; i += 150) plans.push(base(`jerusalem-houses-${i / 150}`, all.slice(i, i + 150).map(el)));
  // the lodges of the Haram's servants on the esplanade: open, furnished by use (layout.js LODGES)
  plans.push(base('jerusalem-lodges', [...LODGES.map((l) => ({ t: 'levant_house', rect: l.rect, seed: l.seed, y: HARAM.top, y1: HARAM.top, ys: HARAM.top, open: true })), ...lodgeFront()]));
  plans.push(base('jerusalem-lodge-life', lodgeLife(), 'life'));
  plans.push(base('jerusalem-house-life', [...houseLife([...open].map(el)), ...pilgrims(), ...domeLife()], 'life'));
  return plans;
}
