// Shaolin — the animals (src/engine/fauna.js draws them; docs/settlements/shaolin.md §7): swallows over the courts and the village, sparrows
// on the paving and the wall copings, crows and a few doves high over the pagodas and the slopes of Mount Song. No water, so no fish.
import { WALL, HOUSES, rng } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, 60], a: [40, 30], rot: 0 }, y: [4, 14], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, 150], a: [70, 14], rot: 0 }, y: [3, 11], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [-140, 70], a: [40, 40], rot: 0.3 }, y: [14, 34], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [20, -150], a: [70, 30], rot: 0.5 }, y: [40, 80], speed: 8 },
];
const perches = [];
const sp = (x, z, y, rot = 0, range = [1.8, 1.6]) => perches.push({ kind: 'sparrow', x, z, y, rot, range, alert: 5 });
for (const [x, z] of [[8, 110], [-9, 100], [12, 70], [-14, 60], [7, 28], [-8, 14], [10, -18], [-10, -40], [6, -70], [-12, -76], [0, 140], [20, 143]]) sp(x, z, ground.height(x, z) + 0.06);
// on the copings of the compound's walls (4.6 m high with the tiles' rise)
for (const [x, z, rot] of [[WALL[0], 20, Math.PI / 2], [WALL[2], -30, Math.PI / 2], [-40, WALL[1], 0], [40, WALL[1], 0], [WALL[2], 90, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: 4.6 + 0.62, rot, range: [2.6, 0], alert: 5 });
// on the ridges of the village houses (the roof's ridge stands about 1.9 m over the eave line) and on the street's stones
{
  const r = rng(404);
  HOUSES.forEach((h, i) => {
    if (i % 3) return;
    const q = h.rect, along = q[2] - q[0] >= q[3] - q[1], cx = (q[0] + q[2]) / 2, cz = (q[1] + q[3]) / 2;
    perches.push({ kind: 'sparrow', x: cx + (along ? (r() - 0.5) * 3 : 0), z: cz + (along ? 0 : (r() - 0.5) * 3), y: 0.25 + h.H + (h.Hu || 0) + 1.75, rot: along ? 0 : Math.PI / 2, range: [2.2, 0], alert: 6 });
  });
  for (const [x, z] of [[-30, 155], [-12, 153], [22, 157], [48, 155], [-60, 156], [70, 154], [3, 170], [-3, 182], [8, 141], [-9, 136]]) sp(x, z, ground.height(x, z) + 0.06);
}
flights.push({ kind: 'swallow', n: 5, loop: { c: [0, 158], a: [80, 12], rot: 0 }, y: [3, 9], speed: 9 }, { kind: 'crow', n: 4, loop: { c: [60, 90], a: [30, 30], rot: 0 }, y: [18, 40], speed: 8 });
export default { fish, flights, perches };
