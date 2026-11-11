// Shaolin — the animals (src/engine/fauna.js draws them; docs/settlements/shaolin.md §7): swallows over the courts and the village, sparrows
// on the paving and the wall copings, crows and a few doves high over the pagodas and the slopes of Mount Song. No water, so no fish.
import { WALL } from './layout.js';
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
export default { fish, flights, perches };
