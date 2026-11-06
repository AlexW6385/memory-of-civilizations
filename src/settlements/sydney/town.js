// The city's buildings (docs/settlements/sydney.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'modern', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [100, -96], facing: 'n' } });
export async function buildings() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`sydney-city-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'skyscraper', ...l, t: l.t ?? 'skyscraper' }))));
  return plans;
}
