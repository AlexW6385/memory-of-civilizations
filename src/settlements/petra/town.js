// The city in the valley (docs/settlements/petra.md §5): flat-roofed houses of rose ashlar on the slopes.
import { RADIUS, lots, outerLots } from './layout.js';
import { people } from './people.js';
import { shopLife, houseLife } from './shops.js';
import { fronts, life } from './dressing.js';
import { houseLayout } from '../../styles/nabataean/house.js';
const base = (id, elements) => ({ id, style: 'nabataean', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 12], facing: 'w' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) {
    const p = base(`petra-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'nabataean_house', ...l })));
    // each house's room is a room of the plan (kind 'house': the muffled sound, the quiet music of the houses)
    p.rooms = all.slice(i, i + 160).map((l, j) => { const H = houseLayout(l), r = H.Rc(...H.room.rect); return { id: `house ${i + j}`, rect: r.map((v) => +v.toFixed(2)), y: l.y, kind: 'house' }; });
    plans.push(p);
  }
  // the houses of the Outer Siq's east edge, in a plan turned 90° so that their doors face the way (layout.js outerLots)
  { const ol = outerLots().map((l) => ({ ...l, rect: l.local })), yawed = (id, elements) => ({ ...base(id, elements), yaw: 90, bounds: [-150, -150, -80, -100] });
    const p = yawed('petra-outer-houses', ol.map((l) => ({ t: 'nabataean_house', ...l })));
    p.rooms = ol.map((l, j) => { const H = houseLayout(l), r = H.Rc(...H.room.rect); return { id: `outer house ${j}`, rect: r.map((v) => +v.toFixed(2)), y: 0, kind: 'house' }; });
    plans.push(p, { ...yawed('petra-outer-life', houseLife(ol, 200)), style: 'life', center: [115, -110], near: 200 }); }
  plans.push(base('petra-fronts', fronts()));
  plans.push({ ...base('petra-people', people()), style: 'life', center: [-20, -40], near: 320 });
  plans.push({ ...base('petra-dressing', life()), style: 'life', center: [-20, -30], near: 330 });
  plans.push({ ...base('petra-life', [...shopLife(), ...houseLife()]), style: 'life', center: [-70, 15], near: 280 });
  return plans;
}
