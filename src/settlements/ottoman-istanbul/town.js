import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The timber houses of the slopes (docs/settlements/ottoman-istanbul.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -100], facing: 's' } });
export async function town() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['ottoman-istanbul'][0], ARRIVALS['ottoman-istanbul'][2]]);
  plans.push(...lodTiles('ottoman-istanbul-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'ottoman', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  return plans;
}
