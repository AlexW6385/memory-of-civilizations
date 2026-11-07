import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The Albaicín and the town (docs/settlements/granada.md §5): whitewashed houses under tiled roofs.
import { RADIUS, lots } from './layout.js';
import { lifePlan } from './life.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, 30], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['granada'][0], ARRIVALS['granada'][2]]);
  plans.push(...lodTiles('granada-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'moorish', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  return [...plans, lifePlan()];
}
