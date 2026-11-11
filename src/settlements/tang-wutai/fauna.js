// Mount Wutai in 857 — the animals (src/engine/fauna.js draws them; docs/settlements/tang-wutai.md §12): house swallows over the
// village, the courtyard and the terraces, crows over the pines of the hill, tree sparrows hopping on the paving and the lanes.
// No water, so no fish.
import { height } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [-85, 0], a: [34, 22], rot: 0.2 }, y: [2.5, 8], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-150, 30], a: [40, 20], rot: -0.3 }, y: [2.5, 7], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-30, 0], a: [22, 20], rot: 0 }, y: [3, 9], speed: 8 },
  { kind: 'swallow', n: 2, loop: { c: [62, 0], a: [26, 22], rot: 0.4 }, y: [16.5, 23], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [135, -20], a: [48, 36], rot: 0.5 }, y: [40, 58], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [60, 60], a: [40, 24], rot: -0.4 }, y: [26, 40], speed: 9 },
];
const perches = [];
const sparrow = (x, z, y = height(x, z), rot = 0.3 + (Math.abs(x) * 7 % 3)) => perches.push({ kind: 'sparrow', x, z, y, rot, range: [1.4, 1.3] });
for (const [x, z] of [[-48, 1], [-30, -9], [-30, 14], [-20, 28], [-70, 3.5], [-95, -3], [-120, 2], [-140, 40], [-100, -44], [-176, 0], [-180, 44], [-66, -9]]) sparrow(x, z);
sparrow(8, -20, 6.5); sparrow(20, 20, 6.5); sparrow(40, 10, 13); sparrow(45, -16, 13);
export default { fish, flights, perches };
