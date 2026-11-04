import { lodTiles } from '../lod.js';
// The houses and palaces of the streets (docs/settlements/florence.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-150, -60], facing: 'e' } });
export async function houses() {
  const all = lots(), plans = [];
  plans.push(...lodTiles('florence-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'tuscan', ...l })), { R: RADIUS }));
  return plans;
}
