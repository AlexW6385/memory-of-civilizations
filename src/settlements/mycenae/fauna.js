// Mycenae — the animals (docs/settlements/mycenae.md §9): swifts and swallows over the ridge and the palace, a pair of ravens riding the ravine's air,
// sparrows about the houses of the lower town. No fish.
import { LANES, PALACE } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 3, loop: { c: [10, -70], a: [130, 60], rot: 0.15 }, y: [30, 60], speed: 9 },
  { kind: 'swallow', n: 6, loop: { c: [60, 5], a: [60, 40], rot: 0.1 }, y: [26, 40], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-140, 30], a: [40, 40], rot: 0.4 }, y: [4, 12], speed: 9 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const lane of LANES) for (let i = 1; i < lane.length; i += 1) sp(lane[i][0] + 3, lane[i][1] + 3);
sp(PALACE.court[0] + 12, PALACE.court[1] + 6);
export default { fish, flights, perches };
