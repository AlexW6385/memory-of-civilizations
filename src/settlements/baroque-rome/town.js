import { lodTiles } from '../lod.js';
// The Borgo's houses and the palaces across the river (docs/settlements/baroque-rome.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [125, 0], facing: 'w' } });
export async function houses() {
  const all = lots(), plans = [];
  plans.push(...lodTiles('baroque-rome-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'roman', ...l })), { R: RADIUS }));
  return plans;
}
