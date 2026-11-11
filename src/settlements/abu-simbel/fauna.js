// Abu Simbel — the animals (docs/settlements/abu-simbel.md §9): black kites over the cliff, swallows over the river and the terrace,
// sparrows in the camp's lanes, an egret at the quay's edge. No fish are drawn.
import { QUAY, CAMP, PRIESTS, TERRACE } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 3, loop: { c: [-30, -40], a: [120, 90], rot: 0.3 }, y: [40, 80], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [40, 0], a: [60, 50], rot: 0.1 }, y: [-5, 6], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-10, 70], a: [30, 24], rot: 0.4 }, y: [2, 8], speed: 9 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[PRIESTS[0] + 11, PRIESTS[1] + 14], [PRIESTS[0] + 11, PRIESTS[1] + 34], [CAMP[0] + 10, CAMP[1] + 20], [CAMP[0] + 21, CAMP[1] + 52], [CAMP[0] + 32, CAMP[1] + 30], [TERRACE[0] + 10, 18]]) sp(x, z);
perches.push({ kind: 'egret', x: QUAY[2] - 0.6, z: QUAY[3] - 2, y: -6.3, rot: 0, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
