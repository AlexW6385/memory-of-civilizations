// The landmark of the Hakka tulou (docs/settlements/hakka-tulou.md §4.1): the round tulou after Chengqi Lou —
// the ring of four storeys with its galleries and stair bays, the second ring of two storeys, the ancestral hall
// in the court, two wells, the life of the lane (drying, washing, hens).
import { T, FURNISH, polar, rng } from './layout.js';

const E = [];
E.push({
  t: 'tulou_round', c: T.c, R: T.R, n: T.n, floors: T.floors, wallIn: T.wallIn, front: T.front, rail: T.rail, full: true,
  gates: [90, 270], bays: [0, 180], furnish: FURNISH, hall: T.hall,
  ring2: T.ring2,
});
E.push({ t: 'tulou_hall', c: T.c });
for (const [x, z] of T.wells) E.push({ t: 'well', kind: 'windlass', mat: 'bluestone', at: [x, z], y: 0, rot: Math.atan2(x, z) });
{
  // the lane between the rings and the inner court: trays of peppers and greens drying, washing on lines, hens, baskets, benches
  const rand = rng(1710);
  const angs = [14, 27, 41, 55, 68, 112, 126, 140, 154, 167, 193, 207, 221, 235, 248, 292, 305, 319, 333, 346];
  angs.forEach((a, q) => {
    const [x, z] = polar(21 + (rand() - 0.5) * 1.5, a), rot = (a + 90) * Math.PI / 180;
    const r = q % 5;
    if (r === 0) E.push({ t: 'drying_tray', at: [x, z], y: 0, rot, seed: q });
    else if (r === 1) E.push({ t: 'chickens', n: 5, kind: 'hen', at: [x, z], y: 0, seed: q });
    else if (r === 2) E.push({ t: 'laundry', at: [x, z], y: 0, rot, len: 3.6, seed: q });
    else if (r === 3) E.push({ t: 'basket', n: 2, at: [x, z], y: 0, seed: q });
    else E.push({ t: 'bench', at: [x, z], y: 0, rot, len: 1.6 });
  });
  for (const [x, z, k] of [[-10, 8.5, 0], [10, -8.8, 1], [-11.8, -3, 2], [11.5, 4, 0]]) {
    if (k === 0) E.push({ t: 'drying_tray', at: [x, z], y: 0, rot: 0.4, seed: 40 + x });
    else if (k === 1) E.push({ t: 'tea_table', at: [x, z], y: 0, rot: 0.3 });
    else E.push({ t: 'chickens', n: 4, kind: 'hen', at: [x, z], y: 0, seed: 7 });
  }
}

const rooms = [
  { id: 'court', rect: [-13, -13, 13, 13], y: 0, kind: 'open' },
  { id: 'lane', rect: [-24, -24, 24, 24], y: 0, kind: 'open' },
  { id: 'hall', rect: [-5, -4.5, 5, 4], y: 0.35, kind: 'hall' },
  { id: 'gallery-2', rect: [-26, -26, 26, 26], y: T.floors[1], kind: 'open' },
  { id: 'gallery-3', rect: [-26, -26, 26, 26], y: T.floors[2], kind: 'open' },
  { id: 'gallery-4', rect: [-26, -26, 26, 26], y: T.floors[3], kind: 'open' },
];
for (const f of FURNISH) {
  const [x, z] = polar(27.8, f.i * 360 / T.n);
  rooms.push({ id: `${f.kind}-${f.k}-${f.i}`, rect: [x - 0.4, z - 0.4, x + 0.4, z + 0.4], y: T.floors[f.k], kind: 'open' });
}
const walks = [[[0, 72], [0, 52], [0, 36], [0, 22], [0, 8], [0, 3]]];
walks[0].y0 = 0;

export const tulou = {
  id: 'hakka-tulou',
  name: { en: 'Hakka tulou', zh: '客家土楼' },
  era: { en: 'Qing, c. 1710', zh: '清，约1710年' },
  style: 'tulou',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 40], facing: 'n' },
  bounds: [-40, -40, 40, 70],
  bakeBounds: [-36, -36, 36, 60],
  view: [-36, -36, 36, 36],
  bakeTop: 17,
  elements: E,
  rooms,
  walks,
};
export default tulou;
