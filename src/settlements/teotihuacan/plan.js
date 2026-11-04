// Teotihuacan about 400 (docs/settlements/teotihuacan.md §2–§4): the Pyramid of the Sun at true size
// with its Adosada, the Pyramid of the Moon on its rise and the plaza's platform temples, the avenue
// and its cross walls, the Ciudadela's banks with the Feathered Serpent Pyramid and its Adosada.

import { AVENUE, MOON, PLAZA, SUN, CIUD } from './layout.js';

const E = [];
E.push({ t: 'tt_pyramid', c: SUN.c, w: SUN.w, d: SUN.d, tw: SUN.tw, td: SUN.td, h: SUN.h, levels: 5, tablero: 0, stair: 'w', stairW: 14, temple: { w: 16, d: 16, h: 5 } });
E.push({ t: 'tt_pyramid', c: [SUN.c[0] - SUN.w / 2 - 22, SUN.c[1]], w: 44, d: 70, tw: 32, td: 58, h: 12, levels: 2, tablero: 0.4, stair: 'w', stairW: 12 });
E.push({ t: 'tt_pyramid', c: MOON.c, y: MOON.rise, w: MOON.w, d: MOON.d, tw: MOON.tw, td: MOON.td, h: MOON.h, levels: 4, tablero: 0.3, stair: 's', stairW: 12, temple: { w: 14, d: 12, h: 4.5 } });
E.push({ t: 'tt_pyramid', c: [0, MOON.c[1] + MOON.d / 2 + 14], y: MOON.rise * 0.6, w: 46, d: 30, tw: 36, td: 22, h: 10, levels: 3, tablero: 0.45, stair: 's', stairW: 10 });
// the Moon Plaza's platform temples
const [qx0, qz0, qx1, qz1] = PLAZA;
for (const [x, z, f] of [[qx0, qz0 + 14, 'e'], [qx0, qz0 + 44, 'e'], [qx1, qz0 + 14, 'w'], [qx1, qz0 + 44, 'w'], [-34, qz1 + 6, 'n'], [34, qz1 + 6, 'n']]) E.push({ t: 'tt_pyramid', c: [x + (f === 'e' ? -8 : f === 'w' ? 8 : 0), z], w: 20, d: 20, tw: 12, td: 12, h: 9, levels: 3, tablero: 0.45, stair: f, stairW: 6, temple: { w: 7, d: 7, h: 3 } });
E.push({ t: 'lane', rect: [AVENUE[0], AVENUE[1], AVENUE[2], AVENUE[3]], y: 0.03, mat: 'stucco' });
// the avenue's cross walls with stairs over them
for (const z of [-140, -10, 110, 240]) {
  E.push({ t: 'tt_wall', rect: [AVENUE[0] - 6, z, AVENUE[2] + 6, z + 5], h: 2.4 });
  E.push({ t: 'stairs', rect: [-6, z - 4, 6, z], y0: 0, y1: 2.4, dir: 's', mat: 'stucco_ochre' });
  E.push({ t: 'stairs', rect: [-6, z + 5, 6, z + 9], y0: 0, y1: 2.4, dir: 'n', mat: 'stucco_ochre' });
}
// the Ciudadela: four banks, platform temples on them, the Feathered Serpent Pyramid and its Adosada
const [cx0, cz0, cx1, cz1] = CIUD, bw = 22;
for (const r of [[cx0, cz0, cx1, cz0 + bw], [cx0, cz1 - bw, cx1, cz1], [cx1 - bw, cz0 + bw, cx1, cz1 - bw], [cx0, cz0 + bw, cx0 + bw, (cz0 + cz1) / 2 - 12], [cx0, (cz0 + cz1) / 2 + 12, cx0 + bw, cz1 - bw]]) E.push({ t: 'tt_wall', rect: r, h: 7 });
for (const [x, z] of [[cx0 + 40, cz0 + 11], [cx0 + 90, cz0 + 11], [cx0 + 140, cz0 + 11], [cx0 + 40, cz1 - 11], [cx0 + 90, cz1 - 11], [cx0 + 140, cz1 - 11], [cx1 - 11, cz0 + 60], [cx1 - 11, cz1 - 60]]) E.push({ t: 'tt_pyramid', c: [x, z], y: 7, w: 16, d: 16, tw: 9, td: 9, h: 5, levels: 2, tablero: 0.5, stair: z < (cz0 + cz1) / 2 && x < cx1 - 20 ? 's' : z > (cz0 + cz1) / 2 && x < cx1 - 20 ? 'n' : 'w', stairW: 5 });
E.push({ t: 'tt_pyramid', c: [150, 260], w: 65, d: 65, tw: 36, td: 36, h: 20, levels: 6, tablero: 0.5, stair: 'w', stairW: 10, temple: { w: 14, d: 14, h: 4 } });
E.push({ t: 'tt_pyramid', c: [104, 260], w: 30, d: 46, tw: 22, td: 36, h: 9, levels: 3, tablero: 0.5, stair: 'w', stairW: 8 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('avenue', AVENUE, 0, 'open'), room('plaza', PLAZA, 0, 'open')];
const walks = [[[0, 300], [0, 100], [0, -80], [0, -230]]];
walks[0].y0 = 0;

export const city = {
  id: 'teotihuacan-centre',
  name: { en: 'The Pyramid of the Sun and the Avenue of the Dead', zh: '太阳金字塔与亡者大道' },
  era: { en: 'Teotihuacan, c. 400', zh: '特奥蒂瓦坎，约400年' },
  style: 'teotihuacano',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -80], facing: 'e' },
  bounds: [-90, -400, 300, 400],
  bakeBounds: [-80, -400, 300, 360],
  view: [62, -140, 200, -20],
  bakeTop: 72,
  elements: E,
  rooms,
  walks,
};
export default city;
