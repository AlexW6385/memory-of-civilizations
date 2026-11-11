// Wat Phra Si Sanphet and the palace beside it (docs/settlements/ayutthaya.md §4): the compound's brick wall with its south gate; the
// platform inside a cloister with the three bell chedis in a row, the mandapas between them and a small chedi at each corner; west the
// cross-shaped prasat of Narai's reign; east the royal wihan with the gilded image, the ubosot and the bell tower; the little chapels
// along the wall; the palace's halls and wall west of it.

import { WAT, PLATFORM, WIHAN, BELL, PRASAT, UBOSOT, PALACE } from './layout.js';

const E = [];
const [wx0, wz0, wx1, wz1] = WAT.wall, gx = WAT.gate[0];
const w = (a, b, ops = [], th = 1.1, h = 3.6) => E.push({ t: 'wall', a, b, th, y0: 0, y1: h, mat: 'plaster_white', openings: ops });
// the compound wall, the gate in its south side on the axis of the chedis
w([wx0, wz1], [wx1, wz1], [{ at: gx - wx0, w: 7, h: 5.2 }], 1.1, 5.2); w([wx0, wz0], [wx1, wz0]); w([wx0, wz0], [wx0, wz1]); w([wx1, wz0], [wx1, wz1]);
E.push({ t: 'floor', rect: [gx - 3.5, wz1 - 0.6, gx + 3.5, wz1 + 0.6], y: 0.02, th: 0.2, mat: 'flagstone' });
// the gate's lintel and roof: a pavilion's gable over the opening
E.push({ t: 'wall', a: [gx - 3.5, wz1], b: [gx + 3.5, wz1], th: 1.3, y0: 5.2, y1: 6.2, mat: 'timber_red' });
// the platform
E.push({ t: 'cloister', rect: PLATFORM.cloister, y: 0, gate: gx, platform: PLATFORM.y });
for (const [x, z] of PLATFORM.chedis) E.push({ t: 'chedi', c: [x, z], y: PLATFORM.y, w: PLATFORM.w, h: PLATFORM.h });
for (const [x, z] of PLATFORM.mandapa) E.push({ t: 'mandapa', c: [x, z], y: PLATFORM.y, w: 5 });
{ const [a, b, c, d] = PLATFORM.cloister; for (const [x, z] of [[a + 4, b + 4], [c - 4, b + 4], [a + 4, d - 4], [c - 4, d - 4]]) E.push({ t: 'chedi', c: [x, z], y: PLATFORM.y, w: 4, h: 13 }); }
// west: the cross-shaped prasat; east: the royal wihan, the ubosot, the bell tower
E.push({ t: 'prasat', rect: PRASAT, y: 0 });
E.push({ t: 'wihan', rect: WIHAN, front: 'e', y: 0, seed: 7, image: true, imageH: 6.4 });
E.push({ t: 'wihan', rect: UBOSOT, front: 'e', y: 0, seed: 9, image: true, imageH: 3.6, wallH: 6.4, eave: 3.6, porch: 3.2, aisle: 2.2 });
E.push({ t: 'bell_tower', rect: BELL, y: 0 });
// the chapels of the royal family's ashes: small bell chedis along the inside of the wall
for (let x = wx0 + 8; x < wx1 - 6; x += 15) if (Math.abs(x - gx) > 6) E.push({ t: 'chedi', c: [x, wz1 - 5], y: 0, w: 2.6, h: 8 });
for (let x = wx0 + 8; x < wx1 - 6; x += 15) E.push({ t: 'chedi', c: [x, wz0 + 5], y: 0, w: 2.6, h: 8 });
// the palace: its wall, the halls, the gate toward the wat
{
  const [px0, pz0, px1, pz1] = PALACE.wall, pw = (a, b, ops = []) => E.push({ t: 'wall', a, b, th: 1.0, y0: 0, y1: 3.4, mat: 'plaster_white', openings: ops });
  pw([px0, pz0], [px1, pz0]); pw([px0, pz1], [px1, pz1]); pw([px0, pz0], [px0, pz1]);
  pw([px1, pz0], [px1, -150]); pw([px1, -130], [px1, pz1]);
  PALACE.halls.forEach((r, i) => E.push({ t: 'wihan', rect: r, front: i === 1 ? 'e' : 'e', y: 0, seed: 20 + i, throne: true, wallH: 7.4, eave: 4.0, porch: 4.0 }));
  // a sala at the gate and a few pavilions in the palace garden
  E.push({ t: 'k_sala', rect: [-150, -120, -140, -112], y: 0, front: 'e', seed: 3 });
}
const f = 1.2;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('forecourt', [wx0 + 2, -178, wx1 - 2, wz1 - 2], 0, 'open'),
  room('platform', [PLATFORM.cloister[0] + 1, PLATFORM.cloister[1] + 1, PLATFORM.cloister[2] - 1, PLATFORM.cloister[3] - 1], PLATFORM.y, 'open'),
  room('royal wihan', [WIHAN[0] + 4.2, WIHAN[1] + 3.8, WIHAN[2] - 5.6, WIHAN[3] - 3.8], f, 'hall'),
  room('ubosot', [UBOSOT[0] + 3.4, UBOSOT[1] + 3.2, UBOSOT[2] - 4.2, UBOSOT[3] - 3.2], f, 'hall'),
  room('throne hall', [PALACE.halls[1][0] + 4.2, PALACE.halls[1][1] + 3.8, PALACE.halls[1][2] - 5, PALACE.halls[1][3] - 3.8], f, 'hall'),
];
const walks = [
  Object.assign([[gx, -100], [gx, -118], [gx, -127], [-2, -128]], { y0: 0 }),
  Object.assign([[gx, -100], [gx, -108], [60, -108], [60, -125], [100, -125], [100, -140], [86, -140], [72, -140]], { y0: 0 }),
];
export const wat = {
  id: 'ayutthaya-wat',
  name: { en: 'Wat Phra Si Sanphet', zh: '帕西桑碧寺' },
  era: { en: 'Ayutthaya, about 1687', zh: '大城，约1687年' },
  style: 'siamese',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [gx, -100], facing: 'n' },
  bounds: [-232, -245, 135, -90],
  view: [PLATFORM.cloister[0], PLATFORM.cloister[1], PLATFORM.cloister[2], PLATFORM.cloister[3]],
  bakeTop: 40,
  elements: E,
  rooms,
  walks,
};
export default wat;
