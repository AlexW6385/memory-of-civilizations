// Parsa on the plain (docs/settlements/persepolis.md §5): flat-roofed mudbrick houses round small courts.
import { RADIUS, MARKET, WORKSHOPS, lots } from './layout.js';
import { people } from './people.js';
const base = (id, elements) => ({ id, style: 'achaemenid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-200, -140], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`persepolis-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'persian_house', ...l }))));
  plans.push({ ...base('persepolis-workshops', [{ t: 'royal_workshops', rect: WORKSHOPS, y: 0 }]), rooms: [{ id: 'workshops', rect: [WORKSHOPS[0] + 2.2, WORKSHOPS[3] - 23.1, WORKSHOPS[2] - 2.2, WORKSHOPS[3] - 1.1], y: 0.12, kind: 'hall' }] });
  plans.push({ ...base('persepolis-people', people().figures), style: 'life', center: [-60, -125], near: 320 });
  plans.push({ ...base('persepolis-market', []), rooms: [{ id: 'market', rect: MARKET, y: 0, kind: 'open', market: true }] });
  return plans;
}
