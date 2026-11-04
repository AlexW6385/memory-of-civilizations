// The daga houses (docs/settlements/great-zimbabwe.md §5).
import { RADIUS, huts } from './layout.js';
export async function town() {
  return [{ id: 'great-zimbabwe-huts', style: 'zimbabwe', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: huts().map((h) => ({ t: 'daga_hut', ...h })), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } }];
}
