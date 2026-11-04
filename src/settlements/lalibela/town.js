// The village round the churches (docs/settlements/lalibela.md §5): round stone houses with conical thatch.
import { RADIUS, houses, slope } from './layout.js';
const base = (id, elements) => ({ id, style: 'zagwe', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-240, 100], facing: 's' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 140) plans.push(base(`lalibela-village-${i / 140}`, all.slice(i, i + 140).map((h) => ({ t: 'tukul', ...h, y: slope(h.c[0], h.c[1]) }))));
  return plans;
}
