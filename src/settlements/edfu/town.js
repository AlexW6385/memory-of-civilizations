// The town on its mound (docs/settlements/edfu.md §5): mudbrick houses round little courts.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'oldkingdom', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 170], facing: 'n' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`edfu-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'mud_house', ...l }))));
  return plans;
}
