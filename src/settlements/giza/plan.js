// The Great Pyramid of Khufu and its complex, as completed c. 2560 BC (docs/settlements/giza.md §4):
// the pyramid in its white casing, 230.3 m square and 146.6 m high, its enclosure wall and court,
// the mortuary temple on the east with its basalt court and granite pillars, the queens' pyramids,
// the top of the causeway.

import { PYRAMID, ENCLOSURE, TEMPLE, QUEENS, CAUSEWAY, VALLEY } from './layout.js';

const E = [];
const [ex0, ez0, ex1, ez1] = ENCLOSURE;
// the court round the pyramid, paved with limestone, its enclosure wall
E.push({ t: 'lane', rect: [ex0 + 1, ez0 + 1, ex1 - 1, ez1 - 1], y: 0.05, mat: 'tura_limestone' });
const wall = (a, b, gates = []) => E.push({ t: 'ming_wall', a, b, y: 0, h: 8, th: 3, gates, pal: { plaster: 'limestone_core', roof: 'limestone_core', plinth: 'limestone_core' } });
wall([ex0, ez0], [ex1, ez0]); wall([ex0, ez1], [ex1, ez1]); wall([ex0, ez0], [ex0, ez1]);
wall([ex1, ez0], [ex1, -66]); wall([ex1, -14], [ex1, ez1]);
E.push({ t: 'ok_pyramid', c: PYRAMID.c, a: PYRAMID.a, h: PYRAMID.h });
// its east door takes the causeway; the west door opens into the pyramid's court
E.push({ t: 'ok_temple', rect: TEMPLE, h: 7.5, court: [133, -58, 160, -22], pillars: 6, door: 'e', backDoor: true });
for (const [x, z, a, h] of QUEENS) {
  E.push({ t: 'ok_pyramid', c: [x, z], a, h });
  E.push({ t: 'ok_temple', rect: [x + a + 2, z - 6, x + a + 12, z + 6], h: 4, court: [x + a + 4, z - 3, x + a + 10, z + 3], pillars: 2, door: 'e' });
}
// the causeway: level on the plateau, down its edge with the ground, level again into the valley temple
{
  const [ax, az] = CAUSEWAY.a, [bx, bz] = CAUSEWAY.b, at = (x) => [x, az + (bz - az) * (x - ax) / (bx - ax)];
  const [d0, d1] = CAUSEWAY.down, p = at(d0), q = at(d1);
  E.push({ t: 'causeway', a: CAUSEWAY.a, b: p, w: 4.6, h: 5, ya: 0, yb: 0 });
  E.push({ t: 'causeway', a: p, b: q, w: 4.6, h: 5, ya: 0, yb: VALLEY });
  E.push({ t: 'causeway', a: q, b: CAUSEWAY.b, w: 4.6, h: 5, ya: VALLEY, yb: VALLEY });
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('court', ENCLOSURE, 0, 'open'), room('temple', TEMPLE, 0.12, 'hall')];
const walks = [[[200, -40], [170, -40], [150, -40], [127, -40], [117, -40]]];
walks[0].y0 = 0;

export const pyramid = {
  id: 'giza-great-pyramid',
  name: { en: 'The Great Pyramid of Khufu', zh: '胡夫大金字塔' },
  era: { en: '4th dynasty, c. 2560 BC', zh: '第四王朝，约公元前2560年' },
  style: 'oldkingdom',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [200, -40], facing: 'w' },
  bounds: [ex0, ez0, 200, ez1 + 60],
  bakeBounds: [-116, -156, 116, 76],
  view: [-116, -156, 116, 76],
  bakeTop: 147,
  elements: E,
  rooms,
  walks,
};
export default pyramid;
