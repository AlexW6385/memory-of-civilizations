import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The houses of the islands (docs/settlements/venice.md §5).
import { RADIUS, SEA, lots, inWater } from './layout.js';
import { molo, doge, iconostasis } from './plan.js';
import { canalPlans } from './rialto.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-120, -5], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [molo, doge, iconostasis, ...canalPlans()], open = openLots(all, [ARRIVALS['venice'][0], ARRIVALS['venice'][2]]);
  plans.push(...lodTiles('venice-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'venetian', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  // the water of the canals, the basin and the lagoon (the planet's sea lies far below the islands' level here)
  plans.push({ ...base('venice-water', [{ t: 'water_cells', rect: [-(RADIUS - 30), -(RADIUS - 30), RADIUS - 30, RADIUS - 30], y: SEA, cell: 1.5, inside: (x, z) => inWater(x, z) && Math.hypot(x, z) < RADIUS - 32 }]), style: 'ming' });
  return plans;
}
