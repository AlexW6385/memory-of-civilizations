import { lodTiles } from '../lod.js';
// The houses of the islands (docs/settlements/venice.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-120, -5], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [];
  plans.push(...lodTiles('venice-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'venetian', ...l })), { R: RADIUS }));
  return plans;
}
