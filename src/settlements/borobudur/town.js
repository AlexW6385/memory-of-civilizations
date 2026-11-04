// The hamlets round the monument (docs/settlements/borobudur.md §5): houses on posts in their groves.
import { RADIUS, houses } from './layout.js';
const base = (id, elements) => ({ id, style: 'javanese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [90, 0], facing: 'w' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`borobudur-hamlets-${i / 120}`, all.slice(i, i + 120).map((h) => ({ t: 'rumah', ...h }))));
  return plans;
}
