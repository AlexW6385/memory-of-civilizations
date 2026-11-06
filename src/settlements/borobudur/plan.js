// Borobudur as finished about 825 (docs/settlements/borobudur.md §2–§4): the plinth and base, five
// redented square terraces with their galleries, balustrades, niches and small stupas, the stairs on
// the four sides, three circular terraces of 72 latticed stupas, the crowning stupa 35 m above the
// ground; the monastery to the north-west.

import { MONUMENT, SQUARES, CIRCLES, MONASTERY } from './layout.js';

const E = [];
E.push({ t: 'borobudur', c: MONUMENT.c, base: MONUMENT.base, squares: SQUARES, circles: CIRCLES, crown: { r: 5 } });
// the stairs go on up through the round terraces on all four sides, to the top
{
  const [cx, cz] = MONUMENT.c, w = 1.4;
  let y0 = SQUARES[SQUARES.length - 1].y;
  for (const c of CIRCLES) {
    const e0 = c.r + 1.6 - 0.06, e1 = c.r + 1.6 + 1.9;
    for (const [dir, rect] of [['s', [cx - w, cz - e1, cx + w, cz - e0]], ['n', [cx - w, cz + e0, cx + w, cz + e1]], ['e', [cx - e1, cz - w, cx - e0, cz + w]], ['w', [cx + e0, cz - w, cx + e1, cz + w]]]) {
      E.push({ t: 'stair', rect, y0, y1: c.y, dir, mat: 'andesite' });
    }
    y0 = c.y;
  }
}
E.push({ t: 'lane', rect: [64, -2, 300, 2], y: 0.03, mat: 'andesite' });
// the monastery: a walled compound with open pavilions and houses for the monks
const [mx0, mz0, mx1, mz1] = MONASTERY, wall = (a, b) => E.push({ t: 'pagar', a, b, h: 2.2 });
wall([mx0, mz0], [mx1, mz0]); wall([mx0, mz1], [mx1, mz1]); wall([mx0, mz0], [mx0, mz1]);
wall([mx1, mz0], [mx1, (mz0 + mz1) / 2 - 3]); wall([mx1, (mz0 + mz1) / 2 + 3], [mx1, mz1]);
E.push({ t: 'pendopo', rect: [-182, -150, -158, -132] });
E.push({ t: 'pendopo', rect: [-202, -126, -188, -114], h: 3 });
for (const [x, z] of [[-204, -164], [-196, -164], [-150, -164], [-142, -164], [-150, -116], [-142, -116]]) E.push({ t: 'rumah', rect: [x - 3, z - 2.4, x + 3, z + 2.4], seed: x * 7 + z });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('summit', [-34, -34, 34, 34], CIRCLES[2].y, 'open'), room('monastery', MONASTERY, 0, 'open')];
const walks = [[[150, 0], [66, 0], [40, 0], [0, 0]]];
walks[0].y0 = 0;

export const monument = {
  id: 'borobudur-temple',
  name: { en: 'Borobudur', zh: '婆罗浮屠' },
  era: { en: 'Sailendra Java, c. 825', zh: '夏连特拉王朝，约825年' },
  style: 'javanese',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [90, 0], facing: 'w' },
  bounds: [-70, -70, 70, 70],
  bakeBounds: [-66, -66, 66, 66],
  view: [-62, -62, 62, 62],
  bakeTop: 36,
  elements: E,
  rooms,
  walks,
};
export default monument;
