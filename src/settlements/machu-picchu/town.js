// The houses of Machu Picchu in their kanchas (docs/settlements/machu-picchu.md §5).
import { RADIUS, houses } from './layout.js';
import { ground } from './ground.js';

const base = (id, elements) => ({ id, style: 'inca', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [2, 110], facing: 'n' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 50) plans.push(base(`machu-picchu-houses-${i / 50}`, all.slice(i, i + 50).map((h) => {
    const [x0, z0, x1, z1] = h.rect, y = Math.min(ground.height(x0, z0), ground.height(x1, z0), ground.height(x0, z1), ground.height(x1, z1));
    return { t: 'inca_house', ...h, y };
  })));
  return plans;
}
