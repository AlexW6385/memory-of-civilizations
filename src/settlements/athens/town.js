// The town of Athens (docs/settlements/athens.md §5): courtyard houses in blocks round the hills.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'greek', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-300, 70], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`athens-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'greek_house', simple: true, ...l }))));
  return plans;
}
