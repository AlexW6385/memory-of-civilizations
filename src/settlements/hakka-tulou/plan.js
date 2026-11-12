// The landmark of the Hakka tulou (docs/settlements/hakka-tulou.md §4.1): the round tulou after Chengqi Lou —
// the ring of four storeys with its galleries and stair bays, the second ring of two storeys, the ancestral hall
// in the court, two wells, the life of the lane (drying, washing, hens).
import { T, FURNISH, polar, rng } from './layout.js';

const E = [];
E.push({
  t: 'tulou_ring', c: T.c, R: T.R, n: T.n, floors: T.floors, wallIn: T.wallIn, front: T.front, rail: T.rail, full: true,
  gates: [90, 270], bays: [0, 180], furnish: FURNISH, hall: T.hall,
  ring2: T.ring2,
});
E.push({ t: 'tulou_hall', c: T.c, rect: [-7.5, -6, 7.5, 6.9] });
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

{
  // the foot of the great wall (eye level for the first approach): the households' own goods stand against it — wood for the stoves,
  // baskets, trays of drying greens, benches in the shade, rain tubs, hens, stools, a stone mortar's barrel [inferred: lane life, NatGeo/Chinese sources]
  const rand = rng(1712), kinds = ['firewood', 'basket', 'drying_tray', 'bench', 'rain_tub', 'chickens', 'stool', 'barrel', 'sacks', 'firewood'];
  for (let q = 0; q < 56; q++) {
    const a = q * 360 / 56 + (rand() - 0.5) * 3, ad = ((a % 360) + 360) % 360;
    if (Math.abs(ad - 90) < 7 || Math.abs(ad - 270) < 5) continue;
    const r = T.R + 1.0 + rand() * 1.2, [x, z] = polar(r, a), rot = (a + 90) * Math.PI / 180, kd = kinds[q % kinds.length];
    if (kd === 'chickens') E.push({ t: kd, n: 4, kind: 'hen', at: [x, z], y: 0, seed: q });
    else if (kd === 'firewood') E.push({ t: kd, at: [x, z], y: 0, rot: rot + Math.PI / 2, len: 1.4, seed: q });
    else if (kd === 'bench') E.push({ t: kd, at: [x, z], y: 0, rot, len: 1.7 });
    else if (kd === 'drying_tray') E.push({ t: kd, at: [x, z], y: 0, rot, seed: q });
    else if (kd === 'basket' || kd === 'sacks') E.push({ t: kd, at: [x, z], y: 0, n: 3, seed: q });
    else E.push({ t: kd, at: [x, z], y: 0, rot, seed: q });
  }
  for (const a of [20, 60, 120, 160, 200, 240, 300, 340]) { const [x, z] = polar(T.R + 2.6, a); E.push({ t: 'laundry', at: [x, z], y: 0, rot: (a + 90) * Math.PI / 180, len: 3.6, seed: a }); }
}

// (kind 'open' places are strolled by the engine's street life; the rooms and galleries here are 'hall': their own people are in town.js)
const rooms = [
  { id: 'hall', rect: [-5, -4.5, 5, 4], y: 0.35, kind: 'hall' },
  { id: 'gallery-2', rect: [-26, -26, 26, 26], y: T.floors[1], kind: 'hall' },
  { id: 'gallery-3', rect: [-26, -26, 26, 26], y: T.floors[2], kind: 'hall' },
  { id: 'gallery-4', rect: [-26, -26, 26, 26], y: T.floors[3], kind: 'hall' },
];
for (const f of FURNISH) {
  const [x, z] = polar(26.4, f.i * 360 / T.n);
  rooms.push({ id: `${f.kind}-${f.k}-${f.i}`, rect: [x - 0.3, z - 0.3, x + 0.3, z + 0.3], y: T.floors[f.k], kind: 'hall' });
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
