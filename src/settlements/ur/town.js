// The town round the temenos (docs/settlements/ur.md §5): courtyard houses of plastered mud brick, three of them
// open and furnished on the market square before the north gate (§5.1); the square itself (a market: the
// generic life pass sets out its stalls) and the life of the streets and the quay (§5.2).
import { RADIUS, MARKET, houses } from './layout.js';
import { urLife } from './life.js';
const base = (id, elements) => ({ id, style: 'sumerian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -110], facing: 's' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`ur-houses-${i / 150}`, all.slice(i, i + 150).map((h) => ({ t: 'ur_house', ...h }))));
  const { figures, gear } = urLife();
  plans.push({ ...base('ur-square', gear), rooms: [{ id: 'market square west', rect: [MARKET[0], MARKET[1], -9, MARKET[3]], y: 0, kind: 'open', market: true }, { id: 'market square east', rect: [9, MARKET[1], MARKET[2], MARKET[3]], y: 0, kind: 'open', market: true }] });   // (the way from the north street to the gate kept clear)
  plans.push({ ...base('ur-people', figures), style: 'life', center: [-60, -180], near: 320 });
  return plans;
}
