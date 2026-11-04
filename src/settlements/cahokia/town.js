// The town's houses (docs/settlements/cahokia.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'mississippian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-25, -5], facing: 'n' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 250) plans.push(base(`cahokia-houses-${i / 250}`, all.slice(i, i + 250).map((l) => ({ t: 'miss_house', ...l }))));
  return plans;
}
