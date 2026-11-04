import { lodTiles } from '../lod.js';
// The Albaicín and the town (docs/settlements/granada.md §5): whitewashed houses under tiled roofs.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, 30], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  plans.push(...lodTiles('granada-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'moorish', ...l })), { R: RADIUS }));
  return plans;
}
