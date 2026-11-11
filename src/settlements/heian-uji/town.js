import { openLots, lodTiles } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The village of Uji (docs/settlements/heian-uji.md §11): houses of the commoners — stone-weighted board roofs, thatch,
// cypress bark — in two levels of detail, with their yards, granaries and drying racks.
import { RADIUS, lots } from './layout.js';
export async function houses() {
  const all = lots(), open = openLots(all, [ARRIVALS['heian-uji'][0], ARRIVALS['heian-uji'][2]]);
  return lodTiles('heian-uji-houses', 'japanese', all.map((l) => ({ t: 'heian_house', ...l, ...(open.has(l) ? { open: true } : {}) })), { near: 200, R: RADIUS + 100, entrance: { at: [-60, 72], facing: 'n' } });
}
