// Shöl and the valley's farmsteads (docs/settlements/lhasa.md §5): whitewashed flat-roofed houses.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'tibetan', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-4, 60], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 130) plans.push(base(`lhasa-houses-${i / 130}`, all.slice(i, i + 130).map((l) => ({ t: 'tibetan_house', ...l }))));
  return plans;
}
