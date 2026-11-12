// Wat Phra Si Sanphet and the palace beside it (docs/settlements/ayutthaya.md §4): the compound's brick wall with its south gate; the
// platform inside a cloister with the three bell chedis in a row, the mandapas between them and a small chedi at each corner; west the
// cross-shaped prasat of Narai's reign; east the royal wihan with the gilded image, the ubosot and the bell tower; the little chapels
// along the wall; the palace's halls and wall west of it.

import { WAT, PLATFORM, WIHAN, BELL, PRASAT, UBOSOT, PALACE } from './layout.js';

const E = [];
const [wx0, wz0, wx1, wz1] = WAT.wall, gx = WAT.gate[0];
const w = (a, b, ops = [], th = 1.1, h = 3.6) => E.push({ t: 'wat_wall', a, b, th, h, ops });
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
  pw([px1, pz0], [px1, -146]); pw([px1, -134], [px1, pz1]);
  E.push({ t: 'palace_gate', c: [px1, -140], open: 4 });
  PALACE.halls.forEach((r, i) => E.push({ t: 'wihan', rect: r, front: i === 1 ? 'e' : 'e', y: 0, seed: 20 + i, throne: true, wallH: 7.4, eave: 4.0, porch: 4.0 }));
  // a sala at the gate and a few pavilions in the palace garden
  E.push({ t: 'k_sala', rect: [-150, -120, -140, -112], y: 0, front: 'e', seed: 3 });
}

// the court's brick ways, boundary stones, pennants, offering tables, candle stands; monks' huts and rest houses in the far corners
{
  const [a, b, c, d] = PLATFORM.cloister;
  E.push({
    t: 'wat_court', y: 0, seed: 5,
    paths: [[gx - 1.8, wz1 - 0.6, gx + 1.8, wz1 + 0.6], [gx - 1.8, d + 2.4, gx + 1.8, wz1 - 0.6], [gx - 1.8, -113, 66, -111], [64, -125.5, 66, -111], [64, -127, 104, -125], [100, -140, 102, -125], [UBOSOT[0] - 3, -111, UBOSOT[0] - 1, -110]].map((r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])]),
    sema: [UBOSOT],
    flags: [[gx - 6, wz1 - 12], [gx + 6, wz1 - 12], [gx - 6, wz1 - 22], [gx + 6, wz1 - 22], [WIHAN[0] - 5, WIHAN[1] - 6], [BELL[0] - 2, BELL[3] + 8]],
    tables: [[gx - 4.5, d + 6, 0], [gx + 4.5, d + 6, 0], [WIHAN[2] + 6, -138, Math.PI / 2], [UBOSOT[2] + 6, -110, Math.PI / 2]],
    candles: [[gx - 7, d + 6], [gx + 7, d + 6], [WIHAN[2] + 6, -144], [WIHAN[2] + 6, -132]],
  });
  // rest houses (sala) for the faithful in the forecourt, huts of the monks in the north-east corner
  E.push({ t: 'k_sala', rect: [gx - 24, -112, gx - 18, -107], y: 0, front: 's', seed: 11 }, { t: 'k_sala', rect: [gx + 34, -112, gx + 40, -107], y: 0, front: 's', seed: 12 });
  for (let k = 0; k < 5; k++) E.push({ t: 'thai_house', rect: [wx1 - 40 + k * 7.5, wz0 + 12, wx1 - 34 + k * 7.5, wz0 + 19], front: 's', seed: 90 + k, kind: 'plain' });
  for (let k = 0; k < 4; k++) E.push({ t: 'thai_house', rect: [wx0 + 8 + k * 8, wz0 + 12, wx0 + 14 + k * 8, wz0 + 19], front: 's', seed: 70 + k, kind: 'small' });
}
// the palace court: the processional way from the gate to the throne hall, palms and umbrella stands
{
  const hall = PALACE.halls[1], [px1] = [PALACE.wall[2]];
  const way = [[-125, -141.5, px1 - 3.6, -138.5], [-123.5, hall[1] + 4, -120.5, -138.5]];
  const palms = [], stands = [[-119, -143.5], [-119, -136.5]];
  for (let z = hall[1] + 6; z < -128; z += 7) if (Math.abs(z + 140) > 4) palms.push([-116, z]);
  for (let x = -122; x < -105; x += 6) palms.push([x, -147], [x, -133]);
  E.push({ t: 'court_way', paths: way, stands });
  for (const [x, z] of palms) E.push({ t: 'sugar_palm', at: [x, z], y: 0, s: 0.9, rot: x * 3.1 });
  E.push({ t: 'k_sala', rect: [-112, -162, -106, -156], y: 0, front: 'w', seed: 31 }, { t: 'k_sala', rect: [-112, -122, -106, -116], y: 0, front: 'w', seed: 32 });
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
