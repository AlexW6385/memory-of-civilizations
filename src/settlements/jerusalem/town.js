// The houses of the city (docs/settlements/jerusalem.md §5, §5a): every lot a courtyard house; four of them
// near the street from the west gate to the Haram open, their rooms walkable and furnished, with the life of
// the house (life.js).
import { RADIUS, HARAM, LODGES, lots, height } from './layout.js';
import { openLots, upLots, tradeOf } from './openlots.js';
export { openLots, upLots };
import { upperLayout } from './house-up.js';
import { frontClass } from './houses.js';
import { houseLife, pilgrims, lodgeLife, lodgeFront, domeLife } from './life.js';
const base = (id, elements, style = 'islamic-houses') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-180, 0], facing: 'e' } });
const UPMAP = () => new Map(upLots().map((u) => [u.lot, u.up]));
/** Walk routes (local to the Dome's plan, whose origin is at z = -20 and base y): from the lane through the house door and up the court stair to the terrace and its balcony, through the west chamber and the partition's door to the east chamber and its gallery. */
export function upWalks(planOrigin, planBase) {
  const out = [];
  for (const { lot } of upLots()) {
    const el = { rect: lot.rect, y: lot.y, y1: Math.max(...[[lot.rect[0], lot.rect[1]], [lot.rect[2], lot.rect[1]], [lot.rect[0], lot.rect[3]], [lot.rect[2], lot.rect[3]]].map(([a, b]) => height(a, b))), lane: lot.gs };
    const U = upperLayout(el), [sx0, sz0, sx1, sz1] = U.stair, dc = (U.xc0 + U.xc1) / 2, zd = U.ri[3] - 1.15, L = (x, z) => [x, z - planOrigin[1]];
    const ys = height((lot.rect[0] + lot.rect[2]) / 2, lot.rect[3] + 0.8);
    const r = [L(dc, U.z1 + 1.5), L(dc, U.zc1 - 1.4), L(sx1 + 0.7, sz1 - 0.35), L(sx0 + 0.42, sz1 - 0.35), L(sx0 + 0.42, sz0 + 0.25), L(U.xc0 - 0.7, sz0 + 0.25), L(U.xdA, U.zc0 + 1.0), L(U.xdA, U.ri[3] - 0.6), L(U.xp, zd), L(U.xb, zd), L(U.xb, U.zc0 + 0.7)];
    r.y0 = ys - planBase;
    out.push(r);
    if (U.proj > 0) { const q = [L(dc, U.z1 + 1.5), L(dc, U.zc1 - 1.4), L(sx1 + 0.7, sz1 - 0.35), L(sx0 + 0.42, sz1 - 0.35), L(sx0 + 0.42, sz0 + 0.25), L(U.xc0 - 0.7, sz0 + 0.25), L((U.x0 + U.xc0) / 2, U.z1 - 1.2), L((U.x0 + U.xc0) / 2, U.z1 + 0.5)]; q.y0 = ys - planBase; out.push(q); }
  }
  return out;
}
export async function houses() {
  const all = lots(), open = new Set(openLots()), plans = [], upm = UPMAP();
  const el = (l) => {
    const [x0, z0, x1, z1] = l.rect, ys = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([a, b]) => height(a, b));
    const up = upm.get(l) ?? null, trade = tradeOf(l, open, up);
    return { t: 'levant_house', ...l, y1: Math.max(...ys), ys: height((x0 + x1) / 2, z1 + 0.8), open: open.has(l), front: frontClass(l), trade, up, lane: l.gs };
  };
  for (let i = 0; i < all.length; i += 150) plans.push(base(`jerusalem-houses-${i / 150}`, all.slice(i, i + 150).map(el)));
  // the lodges of the Haram's servants on the esplanade: open, furnished by use (layout.js LODGES)
  plans.push(base('jerusalem-lodges', [...LODGES.map((l) => ({ t: 'levant_house', rect: l.rect, seed: l.seed, y: HARAM.top, y1: HARAM.top, ys: HARAM.top, open: true })), ...lodgeFront()]));
  plans.push(base('jerusalem-lodge-life', lodgeLife(), 'life'));
  plans.push(base('jerusalem-house-life', [...houseLife([...open].map(el)), ...pilgrims(), ...domeLife()], 'life'));
  return plans;
}
