// The houses of the first hill (docs/settlements/constantinople.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-150, 150], facing: 'e' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`constantinople-houses-${i / 120}`, all.slice(i, i + 120).map((l) => ({ t: 'insula', simple: true, ...l }))));
  return plans;
}
