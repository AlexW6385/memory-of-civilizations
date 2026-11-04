// The blocks' buildings (docs/settlements/new-york.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'artdeco', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [4, 176], facing: 's' } });
export async function buildings() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`new-york-blocks-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'skyscraper', ...l }))));
  return plans;
}
