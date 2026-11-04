// The village at the hill's foot (docs/settlements/sanchi.md §5): mud-walled houses under tiled roofs.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -180], facing: 's' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`sanchi-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_india', ...l }))));
  return plans;
}
