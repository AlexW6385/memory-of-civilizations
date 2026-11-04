// The town round the square (docs/settlements/isfahan.md §6): courtyard houses of straw-mud plaster.
import { RADIUS, houses } from './layout.js';
const base = (id, elements) => ({ id, style: 'safavid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -150], facing: 's' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`isfahan-houses-${i / 120}`, all.slice(i, i + 120).map((h) => ({ t: 'khaneh', ...h }))));
  return plans;
}
