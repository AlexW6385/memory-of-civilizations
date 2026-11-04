// The castle town (docs/settlements/edo-himeji.md §5): samurai compounds round the inner moat, the merchants' machiya beyond the middle moat.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'edo', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 240], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 60) plans.push(base(`edo-himeji-town-${i / 60}`, all.slice(i, i + 60).map((l) => ({ ...l, simple: true }))));
  return plans;
}
