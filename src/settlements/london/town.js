import { lodTiles } from '../lod.js';
// The terraces of Westminster and Lambeth (docs/settlements/london.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'victorian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -180], facing: 'e' } });
export async function houses() {
  const all = lots(), plans = [];
  plans.push(...lodTiles('london-terraces', 'victorian', all.map((l) => ({ t: 'terrace_house', ...l })), { R: RADIUS }));
  return plans;
}
