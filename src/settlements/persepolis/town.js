// Parsa on the plain (docs/settlements/persepolis.md §5): flat-roofed mudbrick houses round small courts.
import { RADIUS, lots } from './layout.js';
import { people } from './people.js';
const base = (id, elements) => ({ id, style: 'achaemenid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-200, -140], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`persepolis-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'persian_house', ...l }))));
  plans.push({ ...base('persepolis-people', people().figures), style: 'life', center: [-60, -125], near: 320 });
  return plans;
}
