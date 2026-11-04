// The canal houses (docs/settlements/amsterdam.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'dutch', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, -195], facing: 'n' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`amsterdam-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'canal_house', ...l }))));
  return plans;
}
