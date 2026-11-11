// Nalanda about 640 (docs/settlements/nalanda.md §3–§6): the landmark is Monastery 1 (enterable: cells on two storeys round a
// court with the well, the lecture platform and the shrine), the great temple (Temple 3, Śāriputra's) and the library; the rest of the
// row of monasteries and temples, the tanks and the village are the town (town.js).
import { M1, T3, TEMPLES, LIBRARY, WAY } from './layout.js';
import '../../styles/nalanda/index.js';

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const [mx0, mz0, mx1, mz1] = M1.rect, mzc = (mz0 + mz1) / 2;
const cxm = (mx0 + 7.6 + mx1 - 7.6) / 2;                          // the court's middle
const L = LIBRARY.c;
export const TOWERS = [
  { c: [L[0], L[1] - 4], half: [7, 7], storeys: 9 },                  // Ratnodadhi, nine storeys
  { c: [L[0] - 23, L[1] - 3], half: [6, 8], storeys: 6 },             // Ratnasagara
  { c: [L[0] + 21, L[1]], half: [9, 7], storeys: 4, hall: true },     // Ratnarañjaka, its ground hall open to readers
];
export const HALL = TOWERS[2];

/** The brick wall of the library's yard, its gate on the east. */
export function yardWalls() {
  const [x0, z0, x1, z1] = LIBRARY.yard, h = 2.8, W = [];
  const w = (a, b, holes) => W.push({ t: 'brick_wall', a, b, h, holes, th: 0.8 });
  w([x0, z0], [x1, z0]); w([x0, z1], [x1, z1]); w([x0, z1], [x0, z0]);
  const gz = (z0 + z1) / 2;
  W.push({ t: 'brick_wall', a: [x1, z0], b: [x1, z1], h, th: 0.8, holes: [{ s0: gz - z0 - 2, s1: gz - z0 + 2, y0: -0.2, y1: 2.5 }] });
  return W;
}

const E = [];
E.push({ t: 'monastery', rect: M1.rect, enter: true, seed: M1.seed });
E.push({ t: 'temple', ...T3, y: 0 });
for (const t of TOWERS) E.push({ t: 'tower', ...t });
E.push(...yardWalls());

export const landmark = {
  id: 'nalanda-mahavihara',
  name: { en: 'Nalanda: Monastery 1 and the Great Temple', zh: '那烂陀：一号僧院与大塔' },
  era: { en: 'c. 640', zh: '约640年' },
  style: 'nalanda',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 40], facing: 'n' },
  bounds: [-140, -125, 70, 125],
  view: [T3.c[0] - T3.half - 6, -34, M1.rect[2], 34],
  elements: E,
  rooms: [
    room('court', [mx0 + 8.5, mzc - 14, mx1 - 8.5, mzc + 14], 0, 'open'),
    room('shrine', [mx1 - 7.6 - 11.0, mzc - 2.5, mx1 - 7.6 - 5.2, mzc + 2.5], 0.35, 'hall'),
    room('lower cell', [cxm - 1.5, mz0 + 1.5, cxm + 1.5, mz0 + 3.5], 0, 'hall'),
    room('upper gallery', [mx0 + 18, mz0 + 5.0, mx1 - 18, mz0 + 7.2], 3.7, 'hall'),
    room('temple top', [T3.c[0] - 8, -8, T3.c[0] + 8, 8], 20, 'open'),
    room('temple shrine', [T3.c[0] - 3, -2, T3.c[0] + 1, 2], 20, 'hall'),
    room('library hall', [HALL.c[0] - 5, HALL.c[1] - 1.2, HALL.c[0] + 5, HALL.c[1] + 1.2], 0, 'hall'),
  ],
  walks: [
    Object.assign([[0, 40], [0, mzc], [mx0 - 2, mzc], [mx0 + 12, mzc], [cxm, mzc], [mx1 - 14, mzc]], { y0: 0 }),
    Object.assign([[WAY.x1, 0], [T3.c[0] + T3.half + 8, 0]], { y0: 0 }),
  ],
};
export default landmark;
