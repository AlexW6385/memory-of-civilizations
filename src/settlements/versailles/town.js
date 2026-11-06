import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The town (docs/settlements/versailles.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [180, 0], facing: 'w' } });
export async function houses() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['versailles'][0], ARRIVALS['versailles'][2]]);
  plans.push(...lodTiles('versailles-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'french', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  return plans;
}
