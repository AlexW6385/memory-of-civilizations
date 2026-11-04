// The town round the temenos (docs/settlements/ur.md §5): courtyard houses of plastered mud brick.
import { RADIUS, houses } from './layout.js';
const base = (id, elements) => ({ id, style: 'sumerian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -110], facing: 's' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`ur-houses-${i / 150}`, all.slice(i, i + 150).map((h) => ({ t: 'ur_house', ...h }))));
  return plans;
}
