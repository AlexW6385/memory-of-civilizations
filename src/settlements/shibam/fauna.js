// Shibam — the animals (docs/settlements/shibam.md §8): swifts and swallows between the towers, pigeons on the roof terraces and in the square,
// sparrows in the streets, kites over the wadi. No water, no fish.
import { SQUARE, WALL, LM, shops, doorOf, lots, heightOf } from './layout.js';
import { topOf } from '../../styles/hadhrami/dims.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, -10], a: [120, 60], rot: 0.1 }, y: [14, 34], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [80, 40], a: [50, 40], rot: 0.4 }, y: [10, 28], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [0, 135], a: [120, 20], rot: 0, }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-70, -20], a: [40, 30], rot: 0.9 }, y: [12, 30], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [60, -140], a: [60, 30], rot: 0.3 }, y: [6, 25], speed: 7 },
  { kind: 'crow', n: 3, loop: { c: [0, 60], a: [200, 120], rot: 0.2 }, y: [50, 90], speed: 8 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[-20, -10], [10, 2], [25, -15], [-9, 70], [-9, 40], [-60, -8], [50, 20], [0, 5]]) sp(x, z);
// pigeons on the parapet of the enterable house, whose roof terrace can be stood on
perches.push({ kind: 'sparrow', x: LM.rect[0] + 2, z: LM.rect[1] + 0.3, y: topOf(LM.storeys) + 1.0, rot: 0, range: [1.2, 0], alert: 5 });
// sparrows on the mastabas at the shops' doors and pigeons on the parapets of the houses round the square
for (const l of shops()) { const u = doorOf(l), z = l.front === 'n' ? l.rect[1] - 0.6 : l.rect[3] + 0.6; sp(u + 1.4, z, 0.45); }
let k = 0;
for (const l of lots()) if (l.rect[0] > SQUARE[0] - 10 && l.rect[2] < SQUARE[2] + 10 && Math.abs(l.rect[1] + 7) < 40 && (k++ % 3 === 0)) perches.push({ kind: 'sparrow', x: (l.rect[0] + l.rect[2]) / 2, z: l.rect[1] + 0.4, y: heightOf(l) + 1.0, rot: 0, range: [1.8, 0], alert: 6 });
void WALL;
export default { fish, flights, perches };
