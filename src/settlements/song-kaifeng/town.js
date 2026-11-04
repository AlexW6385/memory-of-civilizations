// Bianjing's streets (docs/settlements/song-kaifeng.md §5): shops, inns and houses.
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'song', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [160, -130], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`song-kaifeng-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'house_jiangnan', y: 0, ...l }))));
  return plans;
}
