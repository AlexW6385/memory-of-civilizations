// The village in the valley (docs/settlements/tang-wutai.md §5): earth- and brick-walled houses under grey-tiled gables.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-80, 0], facing: 'e' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`tang-wutai-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_china', ...l }))));
  return plans;
}
