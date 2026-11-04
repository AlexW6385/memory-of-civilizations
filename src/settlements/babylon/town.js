// The houses of the inner city (docs/settlements/babylon.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'babylonian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, -370], facing: 's' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`babylon-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'ur_house', ...l }))));
  return plans;
}
