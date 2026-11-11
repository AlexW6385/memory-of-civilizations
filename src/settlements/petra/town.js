// The city in the valley (docs/settlements/petra.md §5): flat-roofed houses of rose ashlar on the slopes.
import { RADIUS, lots } from './layout.js';
import { people } from './people.js';
import { shopLife, houseLife } from './shops.js';
const base = (id, elements) => ({ id, style: 'nabataean', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 12], facing: 'w' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`petra-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'nabataean_house', ...l }))));
  plans.push({ ...base('petra-people', people()), style: 'life', center: [-20, -40], near: 320 });
  plans.push({ ...base('petra-life', [...shopLife(), ...houseLife()]), style: 'life', center: [-70, 15], near: 280 });
  return plans;
}
