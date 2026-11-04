// The terraces of Westminster and Lambeth (docs/settlements/london.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'victorian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -180], facing: 'e' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`london-terraces-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'terrace_house', ...l }))));
  return plans;
}
