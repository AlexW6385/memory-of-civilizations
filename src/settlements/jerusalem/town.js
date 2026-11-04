// The houses of the city (docs/settlements/jerusalem.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'islamic', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-180, 0], facing: 'e' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`jerusalem-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'levant_house', simple: true, ...l }))));
  return plans;
}
