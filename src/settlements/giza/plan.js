// The Great Pyramid of Khufu and its complex, as completed c. 2560 BC (docs/settlements/giza.md §4):
// the pyramid in its white casing, 230.3 m square and 146.6 m high, its enclosure wall and court,
// the mortuary temple on the east with its basalt court and granite pillars, the queens' pyramids,
// the top of the causeway.

import { PYRAMID, ENCLOSURE, TEMPLE, QUEENS, CAUSEWAY, VALLEY } from './layout.js';
import { pyramidGeometry } from '../../styles/oldkingdom/interior.js';

const E = [];
const [ex0, ez0, ex1, ez1] = ENCLOSURE;
// the court round the pyramid, paved with limestone, its enclosure wall
E.push({ t: 'lane', rect: [ex0 + 1, ez0 + 1, ex1 - 1, ez1 - 1], y: 0.05, mat: 'tura_limestone' });
const wall = (a, b, gates = []) => { E.push({ t: 'ming_wall', a, b, y: 0, h: 8, th: 3, gates, pal: { plaster: 'limestone_core', roof: 'limestone_core', plinth: 'limestone_core' } }); E.push({ t: 'ok_wall_dress', a, b, h: 8, th: 3 }); };
wall([ex0, ez0], [ex1, ez0]); wall([ex0, ez1], [ex1, ez1]); wall([ex0, ez0], [ex0, ez1]);
wall([ex1, ez0], [ex1, -66]); wall([ex1, -14], [ex1, ez1]);
// the entrance left open in the north face for the burial (§4.6): the passages and chambers are a plan of their own (town.js)
E.push({ t: 'ok_pyramid', c: PYRAMID.c, a: PYRAMID.a, h: PYRAMID.h, door: pyramidGeometry(PYRAMID.a, PYRAMID.h).hole });
// its east door takes the causeway; the west door opens into the pyramid's court
E.push({ t: 'ok_temple', rect: TEMPLE, h: 7.5, court: [133, -58, 160, -22], pillars: 6, door: 'e', backDoor: true });
E.push({ t: 'ok_temple_dress', rect: TEMPLE, h: 7.5, door: 'e', backDoor: true });
for (const [x, z, a, h] of QUEENS) {
  E.push({ t: 'ok_pyramid', c: [x, z], a, h });
  E.push({ t: 'ok_temple', rect: [x + a + 2, z - 6, x + a + 12, z + 6], h: 4, court: [x + a + 4, z - 3, x + a + 10, z + 3], pillars: 2, door: 'e' });
  E.push({ t: 'ok_temple_dress', rect: [x + a + 2, z - 6, x + a + 12, z + 6], h: 4, door: 'e' });
}
// the causeway: level on the plateau, down its edge with the ground, level again into the valley temple
{
  const [ax, az] = CAUSEWAY.a, [bx, bz] = CAUSEWAY.b, at = (x) => [x, az + (bz - az) * (x - ax) / (bx - ax)];
  const [d0, d1] = CAUSEWAY.down, p = at(d0), q = at(d1);
  // the straight reach from the temple's east door, with a doorway in its north wall onto the plateau (the way in from the arrival), then the long run down
  E.push({ t: 'causeway', a: [168, -40], b: CAUSEWAY.a, w: 4.6, h: 5, ya: 0, yb: 0, gap: { side: -1, from: 1, to: 2 } });
  E.push({ t: 'ok_causeway_dress', a: [168, -40], b: CAUSEWAY.a, w: 4.6, h: 5, ya: 0, yb: 0, gap: { side: -1, from: 1, to: 2 } });
  E.push({ t: 'ok_causeway_dress', a: CAUSEWAY.a, b: p, w: 4.6, h: 5, ya: 0, yb: 0 });
  E.push({ t: 'ok_causeway_dress', a: p, b: q, w: 4.6, h: 5, ya: 0, yb: VALLEY });
  E.push({ t: 'causeway', a: CAUSEWAY.a, b: p, w: 4.6, h: 5, ya: 0, yb: 0 });
  E.push({ t: 'causeway', a: p, b: q, w: 4.6, h: 5, ya: 0, yb: VALLEY });
  E.push({ t: 'causeway', a: q, b: CAUSEWAY.b, w: 4.6, h: 5, ya: VALLEY, yb: VALLEY });
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('court', ENCLOSURE, 0, 'open'), room('temple', TEMPLE, 0.12, 'hall')];
// the King's Chamber, reached by the entrance in the north face, the passages and the Grand Gallery (§4.6)
{
  const g = pyramidGeometry(PYRAMID.a, PYRAMID.h), [cx, cz] = PYRAMID.c;
  rooms.push(room('kings-chamber', [cx + g.roomX[0] + 0.4, cz + g.room[0] + 0.4, cx + g.roomX[1] - 0.4, cz + g.room[1] - 0.4], g.F, 'hall'));
}
const walks = [[[200, -40], [196, -46], [177, -46.5], [177, -40], [170, -40], [165, -43], [135, -43], [129, -40], [127, -40], [117, -40]]];
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
  // the bake traces the passages and chambers with the pyramid (they are a plan of their own, town.js), in boxes
  // round them: the descending passage, the ascending passage with the gallery's foot, the Grand Gallery, and the
  // antechamber and the King's Chamber with the gallery's head (the boxes overlap so that the light bounced from a
  // neighbouring space is looked up in the bake, not taken from the open sky)
  bakeElements: [{ t: 'ok_pyramid_interior', c: PYRAMID.c, a: PYRAMID.a, h: PYRAMID.h }],
  bakeBoxes: (() => {
    const g = pyramidGeometry(PYRAMID.a, PYRAMID.h), [cx, cz] = PYRAMID.c, x = cx + g.X;
    const yA = (dz) => g.A.Y + dz * Math.tan(g.be);                     // the gallery's floor dz north of its foot
    // (where boxes overlap the viewer takes the first: the chamber's, then the passages', then the gallery's)
    return [
      [cx + g.roomX[0] - 0.8, cz + g.G.Z - 9, x + 2.5, cz + g.room[1] + 0.8, yA(g.G.Z - 9 - g.A.Z) - 1, g.F + 9],
      [x - 2, cz + g.E.Z - 1.5, x + 2, cz + g.J.Z + 2, g.J.Y - 0.8, g.E.Y + g.hd + 2.5],
      [x - 2, cz + g.J.Z - 1, x + 2, cz + g.A.Z + 8, g.J.Y - 0.8, yA(8) + 9],
      [x - 2.5, cz + g.A.Z - 0.8, x + 2.5, cz + g.ante[1] + 0.5, g.A.Y - 1, g.F + 9],
    ];
  })(),
  bakeSpacing: 0.6,
  elements: E,
  rooms,
  walks,
};
export default pyramid;
