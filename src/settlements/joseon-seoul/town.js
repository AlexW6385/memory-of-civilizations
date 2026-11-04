// Hanyang's hanok quarters round the palace (docs/settlements/joseon-seoul.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'joseon', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 70], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 80) plans.push(base(`joseon-seoul-hanok-${i / 80}`, all.slice(i, i + 80).map((l) => ({ t: 'hanok', ...l, simple: true }))));
  return plans;
}
