// The builders' houses (docs/settlements/stonehenge.md §5).
import { RADIUS, houses } from './layout.js';
export async function town() {
  return [{ id: 'stonehenge-houses', style: 'neolithic', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: houses().map((h) => ({ t: 'neolithic_house', ...h })), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, -40], facing: 'w' } }];
}
