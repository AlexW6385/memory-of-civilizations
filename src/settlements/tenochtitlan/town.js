// The calpulli round the precinct (docs/settlements/tenochtitlan.md §5): house compounds of plastered adobe on low stone platforms round their patios.
import { RADIUS, houses } from './layout.js';
const base = (id, elements) => ({ id, style: 'aztec', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-60, 0], facing: 'e' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`tenochtitlan-houses-${i / 150}`, all.slice(i, i + 150).map((h) => ({ t: 'calli', ...h }))));
  return plans;
}
