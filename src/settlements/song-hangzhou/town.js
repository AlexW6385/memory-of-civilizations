// The riverside quarter (docs/settlements/song-hangzhou.md §5): shophouses and tea houses of the Jiangnan type.
import { RADIUS, LEVEL, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'song', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-110, 136], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`song-hangzhou-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'house_jiangnan', y: LEVEL.street, ...l }))));
  return plans;
}
