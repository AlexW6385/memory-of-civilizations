// The daga houses (docs/settlements/great-zimbabwe.md §5).
import { RADIUS, huts } from './layout.js';
import { people } from './life.js';
export async function town() {
  return [{ id: 'great-zimbabwe-huts', style: 'zimbabwe', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: huts().map((h, i) => ({ t: 'daga_hut', ...h, open: i % 6 === 0 })), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } },
    { id: 'great-zimbabwe-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: people(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } }];
}
