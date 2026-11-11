// Shang Yinxu — the animals (src/engine/fauna.js draws them; docs/settlements/shang-yinxu.md §7): swallows over the river and the court,
// crows over the halls and the fields, kites high over the plain, sparrows on the court's earth and the halls' platforms, an egret
// standing at the river's edge, carp in the Huan.
import { RIVER, riverDist, riverZ, riverX, HALL, COURT } from './layout.js';
import { ground } from './ground.js';

const bank = (x, z) => riverDist(x, z) - RIVER.half;
const fish = [];
for (const x of [-250, -190, -120, -30, 40]) { const z = riverZ(x); fish.push({ n: 3, size: [0.16, 0.3], palette: 'carp', y: RIVER.water, dist: bank, margin: 0.6, k: 1, rot: 0, area: [x - 12, z - 0.3, x + 12, z + 0.3], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 }); }
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-300, -150], b: [160, -130] }, y: [0.6, 4], speed: 9, half: 18 },
  { kind: 'swallow', n: 5, loop: { c: [20, -20], a: [50, 40], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [20, -92], a: [50, 30], rot: 0.2 }, y: [14, 34], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-60, 140], a: [90, 40], rot: 0.5 }, y: [20, 45], speed: 8 },
  { kind: 'kite', n: 2, loop: { c: [60, 60], a: [140, 90], rot: 0 }, y: [50, 90], speed: 6 },
];
const perches = [];
const spots = [[-4, -60], [44, -60], [10, -20], [30, 20], [20, 40], [-30, 20], [70, -20], [-60, -60], [110, -40], [-100, -40], [-60, 60], [90, 70], [130, 20], [-130, 40]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.1, rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[0, -98], [40, -98], [20, -77]]) perches.push({ kind: 'sparrow', x, z, y: HALL.h + 0.1, rot: 0, range: [1.2, 0], alert: 5 });
{ const x = -150, z = riverZ(x) + 15.5; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void riverX; void COURT;
export default { fish, flights, perches };
