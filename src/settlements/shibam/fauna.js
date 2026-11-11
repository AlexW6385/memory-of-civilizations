// Shibam — the animals (docs/settlements/shibam.md §8): swifts and swallows between the towers, pigeons on the roof terraces and in the square,
// sparrows in the streets, kites over the wadi. No water, no fish.
import { SQUARE, WALL, LM } from './layout.js';
import { topOf } from '../../styles/hadhrami/dims.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, -10], a: [120, 60], rot: 0.1 }, y: [14, 34], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [80, 40], a: [50, 40], rot: 0.4 }, y: [10, 28], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [0, 60], a: [200, 120], rot: 0.2 }, y: [50, 90], speed: 8 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[-20, -10], [10, 2], [25, -15], [-9, 70], [-9, 40], [-60, -8], [50, 20], [0, 5]]) sp(x, z);
// pigeons on the parapet of the enterable house, whose roof terrace can be stood on
perches.push({ kind: 'sparrow', x: LM.rect[0] + 2, z: LM.rect[1] + 0.3, y: topOf(LM.storeys) + 1.0, rot: 0, range: [1.2, 0], alert: 5 });
void SQUARE; void WALL;
export default { fish, flights, perches };
