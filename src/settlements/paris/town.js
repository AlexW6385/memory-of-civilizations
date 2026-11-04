// The houses of the Cité and the banks (docs/settlements/paris.md §5): timber-framed, jettied, gabled.
import { RADIUS, RIVER, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -60], facing: 'w' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`paris-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_timber', y: RIVER.ground, foot: RIVER.ground, ...l }))));
  return plans;
}
