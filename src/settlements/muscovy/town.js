// The log houses of the boyars' courts and the posad (docs/settlements/muscovy.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'muscovite', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, 20], facing: 's' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`muscovy-houses-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'log_house', ...l }))));
  return plans;
}
