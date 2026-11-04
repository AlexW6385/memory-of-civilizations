// The city round the temple (docs/settlements/madurai.md §5): single-storey houses with verandahs
// and tiled roofs in the blocks between the ring streets.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'dravidian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-20, 200], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`madurai-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'tamil_house', simple: true, ...l }))));
  return plans;
}
