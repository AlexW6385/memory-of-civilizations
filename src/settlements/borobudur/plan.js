// Borobudur as finished about 825 (docs/settlements/borobudur.md §2–§4): the plinth and base, five
// redented square terraces with their galleries, balustrades, niches and small stupas, the stairs on
// the four sides, three circular terraces of 72 latticed stupas, the crowning stupa 35 m above the
// ground; the monastery to the north-west.

import { MONUMENT, SQUARES, CIRCLES, MONASTERY, CELLS, cellRect, cellRoom, houses, floorOf } from './layout.js';

const E = [];
E.push({ t: 'borobudur', c: MONUMENT.c, base: MONUMENT.base, squares: SQUARES, circles: CIRCLES, crown: { r: 5 } });
// the stairs go on up through the round terraces on all four sides, to the top
{
  const [cx, cz] = MONUMENT.c, w = 1.0;   // 2 m wide, through the 2.2 m left between the stupas on the axes
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
// offerings (docs/settlements/borobudur.md §13): flowers on leaves and clay lamps at the foot of each ground
// flight between its lions, and round the crowning stupa on the four axes
{
  const B = MONUMENT.base, d = B.a + B.p + Math.max(2.4, B.h) + 0.6, top = CIRCLES[CIRCLES.length - 1].y, fl = [['cloth_white', 'cloth_red'], ['cloth_white']];
  for (const [i, [nx, nz]] of [[0, -1], [0, 1], [-1, 0], [1, 0]].entries()) {
    const ux = -nz, uz = nx, at = (a, u) => [nx * a + ux * u, nz * a + uz * u];
    const gy = nx > 0 ? 0.03 : 0.002;                  // on the paved way from the east, else on the ground
    E.push({ t: 'rite', kind: 'lamps', at: at(d + 0.2, -1.2), to: at(d + 0.2, 1.2), y: gy, count: 5 });
    for (const k of [-1, 1]) E.push({ t: 'rite', kind: 'plate', at: at(d + 0.5, k * 1.45), y: gy, mats: fl[i % 2] });
    E.push({ t: 'rite', kind: 'offering', at: at(nz > 0 ? 7.1 : 6.7, 0), y: top, n: [nx, nz], seed: i, mats: fl[(i + 1) % 2] });
  }
}
// the monastery: a walled compound with open pavilions and houses for the monks
const [mx0, mz0, mx1, mz1] = MONASTERY, wall = (a, b) => E.push({ t: 'pagar', a, b, h: 2.2 });
wall([mx0, mz0], [mx1, mz0]); wall([mx0, mz1], [mx1, mz1]); wall([mx0, mz0], [mx0, mz1]);
wall([mx1, mz0], [mx1, (mz0 + mz1) / 2 - 3]); wall([mx1, (mz0 + mz1) / 2 + 3], [mx1, mz1]);
// the great hall (a plinth, two-tier roof, the stone Buddha at its west end, the teacher's dais, the monks' mats) and the
// small pavilion; the monks' houses on posts round the yard (three furnished, with their doors on the yard)
const HALL = [-182, -150, -158, -132];
E.push({ t: 'pendopo', rect: HALL, tiers: true, steps: ['e', 's'], h: 3.6 });
E.push({ t: 'hallfit', rect: HALL, y: 0.8 });
{
  const zc = (HALL[1] + HALL[3]) / 2, y = 0.8 + 0.5;
  E.push({ t: 'rite', kind: 'lamps', at: [HALL[0] + 2.42, zc - 0.9], to: [HALL[0] + 2.42, zc + 0.9], y, count: 5 });
  E.push({ t: 'rite', kind: 'plate', at: [HALL[0] + 2.4, zc - 1.1], y, mats: ['cloth_white', 'cloth_red'] }, { t: 'rite', kind: 'plate', at: [HALL[0] + 2.4, zc + 1.1], y, mats: ['cloth_white'] });
}
E.push({ t: 'pendopo', rect: [-202, -126, -188, -114], h: 3, steps: ['e', 's'] });
for (const c of CELLS) E.push({ t: 'rumah', rect: cellRect(c), seed: c[0] * 7 + c[1], front: c[2], interior: !!c[3], variant: c[3] ? (c[0] + c[1]) & 1 : -1 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const inset = (r, m) => [r[0] + m, r[1] + m, r[2] - m, r[3] - m];
const rooms = [
  room('summit', [-34, -34, 34, 34], CIRCLES[2].y, 'open'),
  room('great-hall', HALL, 0.8, 'hall'),
  ...CELLS.filter((c) => c[3]).map((c, i) => room(`monks-house-${i}`, cellRoom(c), floorOf(c[0] * 7 + c[1]), 'hall')),
  ...houses().filter((h) => h.interior).map((h, i) => room(`house-${i}`, inset(h.rect, 0.5), floorOf(h.seed), 'hall')),
  room('monastery', MONASTERY, 0, 'open'),
];
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
