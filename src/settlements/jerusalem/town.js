// The houses of the city (docs/settlements/jerusalem.md §5, §5a): every lot a courtyard house; four of them
// near the street from the west gate to the Haram open, their rooms walkable and furnished, with the life of
// the house (life.js).
import { RADIUS, lots, height } from './layout.js';
import { houseLife, pilgrims } from './life.js';
const base = (id, elements, style = 'islamic') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-180, 0], facing: 'e' } });
/** The lots of the open houses: north of the street to the Haram (their doors to the south, toward it), nearest its stair. */
export function openLots() {
  return lots().filter((l) => l.rect[3] < -4 && l.rect[3] > -40 && l.rect[2] - l.rect[0] > 12.5 && l.rect[3] - l.rect[1] > 12.5)
    .sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 + 185, a.rect[3]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 + 185, b.rect[3])).slice(0, 4);
}
export async function houses() {
  const all = lots(), open = new Set(openLots()), plans = [];
  const el = (l) => {
    const [x0, z0, x1, z1] = l.rect, ys = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([a, b]) => height(a, b));
    return { t: 'levant_house', ...l, y1: Math.max(...ys), ys: height((x0 + x1) / 2, z1 + 0.8), open: open.has(l) };
  };
  for (let i = 0; i < all.length; i += 150) plans.push(base(`jerusalem-houses-${i / 150}`, all.slice(i, i + 150).map(el)));
  plans.push(base('jerusalem-house-life', [...houseLife([...open].map(el)), ...pilgrims()], 'life'));
  return plans;
}
