// The Süleymaniye about 1560 (docs/settlements/ottoman-istanbul.md §2–§4): the mosque, its outer
// court's wall, the four madrasas, Süleyman's tomb, the terrace's retaining wall to the north.

import { MOSQUE, PRECINCT, MADRASAS, TERRACE, TOP, TOMB, GRAVES, ROSES } from './layout.js';

const E = [];
E.push({ t: 'sinan_mosque', c: MOSQUE.c, d: MOSQUE.d, h: MOSQUE.h, y: TOP, court: 38.1 });
const [p0, q0, p1, q1] = PRECINCT;
for (const r of [[p0, q0, -6, q0 + 1.2], [6, q0, p1, q0 + 1.2], [p0, q1 - 1.2, p1, q1], [p0, q0, p0 + 1.2, q1], [p1 - 1.2, q0, p1, q1]]) E.push({ t: 'block', rect: r, y0: TOP - 0.5, y1: TOP + 4, mat: 'limestone' });
for (const r of MADRASAS) E.push({ t: 'madrasa', rect: r, y: TOP });
E.push({ t: 'turbe', c: TOMB.c, r: TOMB.r, h: 7.6, y: TOP, door: 'n' });
E.push({ t: 'graves', list: GRAVES, roses: ROSES, y: TOP });
const [t0, u0, t1, u1] = TERRACE;
E.push({ t: 'block', rect: [t0, u0 - 2, t1, u0], y0: 0, y1: TOP + 1, mat: 'limestone' });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const hw = MOSQUE.d * 1.1 - 2.6, hd = MOSQUE.d - 2.6;
const rooms = [room('prayer hall', [MOSQUE.c[0] - hw, MOSQUE.c[1] - hd, MOSQUE.c[0] + hw, MOSQUE.c[1] + hd], TOP + 0.05, 'hall'), room('outer court', PRECINCT, TOP, 'open'), room('tomb of hurrem sultan', [TOMB.c[0] - TOMB.r, TOMB.c[1] - TOMB.r, TOMB.c[0] + TOMB.r, TOMB.c[1] + TOMB.r], TOP + 0.26, 'hall')];
const walks = [[[0, -100], [0, -80], [0, -40]]];
walks[0].y0 = TOP;

export const suleymaniye = {
  id: 'ottoman-istanbul-suleymaniye',
  name: { en: 'The Süleymaniye', zh: '苏莱曼尼耶清真寺' },
  era: { en: 'Ottoman Istanbul, about 1560', zh: '奥斯曼伊斯坦布尔，约1560年' },
  style: 'ottoman',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -100], facing: 's' },
  bounds: [t0 - 2, u0 - 3, t1 + 2, u1 + 2],
  view: [-66, -8, 66, 48],
  viewY: TOP,
  bakeTop: 80,
  elements: E,
  rooms,
  walks,
};
export default suleymaniye;
