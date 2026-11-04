// The Albaicín and the town (docs/settlements/granada.md §5): whitewashed houses under tiled roofs.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, 30], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`granada-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_tiled', ...l }))));
  return plans;
}
