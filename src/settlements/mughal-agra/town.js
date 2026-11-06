// Taj Ganj and the riverside (docs/settlements/mughal-agra.md §6): the town's houses with their balconies.
import { RADIUS, houses } from './layout.js';
import { lifePlan } from './life.js';
const base = (id, elements) => ({ id, style: 'mughal', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 245], facing: 'n' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`mughal-agra-houses-${i / 120}`, all.slice(i, i + 120).map((h) => ({ t: 'haveli', ...h }))));
  return [...plans, lifePlan()];
}
