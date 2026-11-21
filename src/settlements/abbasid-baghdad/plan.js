// Abbasid Baghdad about 800 (docs/settlements/abbasid-baghdad.md §5, §6): the landmark: the Palace of the Golden Gate with its Green
// Dome, the Great Mosque of al-Mansur beside it, and the House of Wisdom on the esplanade. The walls, the houses, the markets and the
// river are the townscape (town.js).

import { C, PALACE, MOSQUE, LIBRARY, ESPLANADE } from './layout.js';
import { workshopWalk } from '../../styles/abbasid/khan.js';
import { palaceRooms } from '../../styles/abbasid/palace.js';
import '../../styles/abbasid/index.js';
import { bayRoutes, roomRoutes } from './walk.js';

const E = [
  { t: 'golden_palace', rect: PALACE, face: 's', y: 0, seed: 762 },
  { t: 'great_mosque', rect: MOSQUE, face: 's', y: 0, seed: 763 },
  { t: 'golden_wear', rect: PALACE, face: 's', y: 0, seed: 762 },
  { t: 'house_of_wisdom', rect: LIBRARY, face: 's', y: 0, seed: 786 },
];
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const [px, pz] = C, [mx, mz] = [(MOSQUE[0] + MOSQUE[2]) / 2, (MOSQUE[1] + MOSQUE[3]) / 2], [lx, lz] = [(LIBRARY[0] + LIBRARY[2]) / 2, (LIBRARY[1] + LIBRARY[3]) / 2];
const rooms = [
  room('great iwan', [px - 4.5, pz - 2, px + 4.5, pz + 16], 0.05, 'hall'),
  room('audience chamber', [px - 5, pz - 14, px + 5, pz - 4], 0.4, 'hall'),
  room('forecourt', [px - 36, pz + 17, px + 36, pz + 36], 0, 'open'),
  room('mosque hall', [mx - 25, mz + 2, mx + 25, mz + 24.7], 0, 'hall'),
  room('mosque sahn', [mx - 24, mz - 24, mx + 24, mz + 2], 0, 'open'),
  room('house of wisdom hall', [lx - 19, lz - 16.5, lx + 19, lz - 5.8], 0.03, 'hall'),
  room('house of wisdom court', [lx - 12, lz - 4.6, lx + 12, lz + 12.8], 0, 'open'),
];
for (const r of palaceRooms((PALACE[2] - PALACE[0]) / 2)) rooms.push(room(`palace ${r.id}`, [px + r.rect[0], pz + r.rect[1], px + r.rect[2], pz + r.rect[3]], 0.03, 'hall'));
const walks = [[[px, pz + 150], [px, pz + 40], [px, pz + 35], [px + 8.5, pz + 31], [px + 8.5, pz + 21], [px, pz + 17], [px, pz - 2], [px, pz - 12]]];
walks[0].y0 = 0;
// the stairs of the esplanade's dwellings, walked from the street to the balcony (docs §15)
ESPLANADE.forEach((b, i) => { if (!b.upper) return; const r = workshopWalk({ t: 'abbasid_workshop', rect: b.rect, face: b.face, front: b.front, seed: 120 + i * 7 }); r.y0 = 0; walks.push(r); });
// the open bays of the suq rows (docs §19)
walks.push(...bayRoutes());
// the single rooms, the workshops, the bookshop, the khan and the hammam (docs §20)
walks.push(...roomRoutes());
export const baghdad = {
  id: 'abbasid-baghdad',
  name: { en: 'The Palace of the Golden Gate and the Round City', zh: '金门宫与圆城' },
  era: { en: 'Abbasid Baghdad, about 800', zh: '阿拔斯王朝巴格达，约800年' },
  style: 'abbasid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [px, pz + 60], facing: 'n' },
  bounds: [MOSQUE[0] - 10, PALACE[1] - 12, LIBRARY[2] + 10, PALACE[3] + 14],
  bakeBounds: [MOSQUE[0] - 4, LIBRARY[1] - 4, LIBRARY[2] + 4, PALACE[3] + 4],
  view: [px - 6, pz + 29, px + 6, pz + 39],                // the Golden Gate and its hall (the compound's walls close the rest of the palace to the eye)
  bakeTop: 50,
  elements: E,
  rooms,
  walks,
};
export default baghdad;
