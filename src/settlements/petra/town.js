// The city in the valley (docs/settlements/petra.md §5): flat-roofed houses of rose ashlar on the slopes.
import { RADIUS, lots, floorY } from './layout.js';
const base = (id, elements) => ({ id, style: 'nabataean', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 12], facing: 'w' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`petra-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'nabataean_house', y: Math.min(...[[l.rect[0], l.rect[1]], [l.rect[2], l.rect[3]], [l.rect[0], l.rect[3]], [l.rect[2], l.rect[1]]].map(([x, z]) => floorY(x, z))), ...l }))));
  return plans;
}
