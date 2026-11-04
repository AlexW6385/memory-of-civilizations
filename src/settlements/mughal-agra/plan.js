// The Taj Mahal complex as completed under Shah Jahan, 1632–1653 (docs/settlements/mughal-agra.md
// §4): the riverfront terrace with the mausoleum on its marble plinth, the four minarets, the
// mosque (west) and its twin (east); the charbagh with its raised channels, walks and central
// pool; the walls and their octagonal towers; the great gate; the forecourt.

import { TERRACE, PLINTH, GARDEN, GATE, FORECOURT, POOL } from './layout.js';

const E = [];
const [tx0, tz0, tx1, tz1] = TERRACE.rect, ty = TERRACE.y;
// the riverfront terrace of red sandstone, the plinth of marble, stairs up to it
E.push({ t: 'block', walk: true, rect: TERRACE.rect, y0: -4, y1: ty, mat: 'sandstone_red' });
E.push({ t: 'block', walk: true, rect: [PLINTH.c[0] - PLINTH.a, PLINTH.c[1] - PLINTH.a, PLINTH.c[0] + PLINTH.a, PLINTH.c[1] + PLINTH.a], y0: ty, y1: PLINTH.y, mat: 'marble' });
E.push({ t: 'stairs', rect: [-6, PLINTH.c[1] + PLINTH.a, 6, PLINTH.c[1] + PLINTH.a + 9], y0: ty, y1: PLINTH.y, dir: 'n', mat: 'marble' });
E.push({ t: 'stairs', rect: [-10, tz1, 10, tz1 + 4], y0: 0, y1: ty, dir: 'n', mat: 'sandstone_red' });
// the mausoleum: 56.6 m square with chamfered corners, its dome rising 73 m above the plinth
E.push({ t: 'mausoleum', c: PLINTH.c, y: PLINTH.y, a: 28.3, chamfer: 8.5, h: 33, dome: { r: 17.7, h: 28, drum: 7 } });
for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) E.push({ t: 'minaret', c: [PLINTH.c[0] + sx * (PLINTH.a - 3), PLINTH.c[1] + sz * (PLINTH.a - 3)], y: PLINTH.y, h: 40, r: 2.6 });
// the mosque (west, facing east) and its twin (east, facing west), on the terrace
E.push({ t: 'red_hall', rect: [-138, -232, -115, -174], y: ty, h: 12, front: 'e' });
E.push({ t: 'red_hall', rect: [115, -232, 138, -174], y: ty, h: 12, front: 'w' });
// the garden: walks of red sandstone along the axes and round the quarters, raised channels of
// marble along the axes, the central pool on its platform
const [gx0, gz0, gx1, gz1] = GARDEN;
for (const r of [[-12, gz0, -3.6, gz1], [3.6, gz0, 12, gz1], [gx0, -12, -3.6, -3.6], [3.6, -12, gx1, -3.6], [gx0, 3.6, -3.6, 12], [3.6, 3.6, gx1, 12], [-3.6, -12, 3.6, -3.6], [-3.6, 3.6, 3.6, 12]]) E.push({ t: 'lane', rect: r, y: 0.35, mat: 'sandstone_red' });
E.push({ t: 'water_rect', rect: [-3, gz0 + 2, 3, gz1 - 2], y: 0.25 });
E.push({ t: 'water_rect', rect: [gx0 + 2, -3, gx1 - 2, 3], y: 0.25 });
for (const r of [[-3.6, gz0 + 2, -3, gz1 - 2], [3, gz0 + 2, 3.6, gz1 - 2], [gx0 + 2, -3.6, gx1 - 2, -3], [gx0 + 2, 3, gx1 - 2, 3.6]]) E.push({ t: 'block', walk: true, rect: r, y0: 0, y1: 0.55, mat: 'marble_smooth' });
for (const r of [[-77, gz0, -73, gz1], [73, gz0, 77, gz1], [gx0, -77, gx1, -73], [gx0, 73, gx1, 77]]) E.push({ t: 'lane', rect: r, y: 0.2, mat: 'sandstone_red' });
E.push({ t: 'block', walk: true, rect: [-POOL.a - 3, -POOL.a - 3, POOL.a + 3, POOL.a + 3], y0: 0, y1: 1.1, mat: 'marble' });
E.push({ t: 'water_rect', rect: [-POOL.a, -POOL.a, POOL.a, POOL.a], y: 1.0 });
// the walls round the garden and the forecourt, their octagonal towers, the pavilions on the east and west walls
const wall = (a, b) => E.push({ t: 'mughal_wall', a, b, h: 7 });
wall([gx0, gz0], [gx0, gz1]); wall([gx1, gz0], [gx1, gz1]);
wall([gx0, gz1], [-GATE.w / 2, gz1]); wall([GATE.w / 2, gz1], [gx1, gz1]);
for (const [x, z] of [[gx0, gz1], [gx1, gz1], [tx0, tz0], [tx1, tz0]]) E.push({ t: 'octa_tower', c: [x, z], h: 12, r: 4 });
for (const s of [-1, 1]) E.push({ t: 'red_hall', rect: s < 0 ? [gx0 - 10, -14, gx0 + 2, 14] : [gx1 - 2, -14, gx1 + 10, 14], y: 0.2, h: 9, front: s < 0 ? 'e' : 'w' });
E.push({ t: 'great_gate', c: GATE.c, y: 0, w: GATE.w, d: GATE.d, h: GATE.h });
const [fx0, fz0, fx1, fz1] = FORECOURT;
E.push({ t: 'lane', rect: FORECOURT, y: 0.05, mat: 'sandstone_red' });
wall([fx0, fz0], [fx0, fz1]); wall([fx1, fz0], [fx1, fz1]);
wall([fx0, fz1], [-8, fz1]); wall([8, fz1], [fx1, fz1]);

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('plinth', [-47.5, -250.5, 47.5, -155.5], PLINTH.y, 'open'), room('garden', GARDEN, 0, 'open')];
const walks = [[[0, 240], [0, 200], [0, 172], [0, 140], [0, 18], [0, -18], [0, -146], [0, -152], [0, -158]]];
walks[0].y0 = 0;

export const taj = {
  id: 'mughal-agra-taj',
  name: { en: 'The Taj Mahal', zh: '泰姬陵' },
  era: { en: 'Mughal, 1632–1653', zh: '莫卧儿，1632–1653年' },
  style: 'mughal',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 245], facing: 'n' },
  bounds: [-160, -262, 160, 232],
  bakeBounds: [-48, -251, 48, -155],
  view: [-30, -232, 30, -174],
  bakeTop: 80,
  elements: E,
  rooms,
  walks,
};
export default taj;
