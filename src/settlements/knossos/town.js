// The town round the palace (docs/settlements/knossos.md §5, §4b): two- and three-storey flat-roofed houses after the
// Town Mosaic, each turned with its door toward the palace; the Royal Road paved from the west to the theatral area.
import { RADIUS, ROAD, lots, height } from './layout.js';
import { YARD, lifePlan } from './life.js';
const base = (id, elements) => ({ id, style: 'minoan', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-100, 0], facing: 'e' } });
const front = ([x0, z0, x1, z1]) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; return Math.abs(cx) > Math.abs(cz) ? (cx > 0 ? 'w' : 'e') : (cz > 0 ? 'n' : 's'); };
function road() {
  const pts = [];
  for (let x = ROAD.x0 + 12; x <= ROAD.x1 + 0.01; x += 4) pts.push([x, height(x, ROAD.z), ROAD.z]);
  return base('knossos-royal-road', [{ t: 'royal_road', pts, w: ROAD.w }]);
}
export async function town() {
  const all = lots(), plans = [];
  const low = (r) => Math.min(height(r[0], r[1]), height(r[2], r[1]), height(r[0], r[3]), height(r[2], r[3]));
  for (let i = 0; i < all.length; i += 160) plans.push(base(`knossos-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'town_house', y: low(l.rect), front: front(l.rect), ...l }))));
  // the potter's yard by the Royal Road (§10), on the ground of its highest corner
  const yy = Math.max(...[[YARD[0], YARD[1]], [YARD[2], YARD[3]], [YARD[0], YARD[3]], [YARD[2], YARD[1]]].map(([x, z]) => height(x, z)));
  return [...plans, road(), base('knossos-potter', [{ t: 'potter_yard', rect: YARD, y: yy, seed: 7 }]), lifePlan()];
}
