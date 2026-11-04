// The village east of the temples (docs/settlements/khajuraho.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'w' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`khajuraho-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_india', ...l }))));
  return plans;
}
