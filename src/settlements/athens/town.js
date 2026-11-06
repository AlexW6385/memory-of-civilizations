// The town of Athens (docs/settlements/athens.md §5): courtyard houses in blocks round the hills.
import { RADIUS, lots, pathAt, WAY, RAMP, inRect, SLOPE, AGORA } from './layout.js';
// the houses along the ways, round the Agora and below the theatre are seen close: their herms, altars and wells
const near = ([x0, z0, x1, z1]) => { const x = (x0 + x1) / 2, z = (z0 + z1) / 2; return pathAt(x, z, WAY)[0] < 40 || pathAt(x, z, RAMP)[0] < 40 || inRect(SLOPE, x, z, 30) || inRect(AGORA, x, z, 40); };
const base = (id, elements) => ({ id, style: 'greek', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-300, 70], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`athens-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'greek_house', simple: true, near: near(l.rect), ...l }))));
  return plans;
}
