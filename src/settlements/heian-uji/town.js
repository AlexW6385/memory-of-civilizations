// The village of Uji (docs/settlements/heian-uji.md §5): timber houses with bark or thatch roofs.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-60, 72], facing: 'n' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`heian-uji-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_japan', ...l }))));
  return plans;
}
