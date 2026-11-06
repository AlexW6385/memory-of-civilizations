import { openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The village (docs/settlements/conques.md §5): schist and limestone houses with lauze roofs on the slope.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, 0], facing: 'e' } });
export async function houses() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['conques'][0], ARRIVALS['conques'][2]]);
  for (let i = 0; i < all.length; i += 160) plans.push(base(`conques-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_rouergue', ...l, ...(open.has(l) ? { open: true } : {}) }))));
  return plans;
}
