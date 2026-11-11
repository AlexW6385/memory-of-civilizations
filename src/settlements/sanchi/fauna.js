// Sanchi — the animals (src/engine/fauna.js draws them; docs/settlements/sanchi.md §12): swifts and swallows circling the dome and
// the gateways, crows over the hill, sparrows on the paving and the terraces, egrets in the fields of the plain by the village.
import { TEMPLE40 } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 0], a: [34, 30], rot: 0.2 }, y: [26, 38], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [20, 10], a: [70, 40], rot: 0.5 }, y: [24, 34], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-140, 0], a: [30, 24], rot: 0.1 }, y: [4, 12], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [0, 20], a: [140, 100], rot: 0.4 }, y: [55, 85], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [60, 170], a: [70, 40], rot: 0.9 }, y: [12, 26], speed: 8 },
];
const perches = [];
// sparrows on the paving: round the stupa's ground walk, at the south gate, the monastery court, the temple platform's steps
const spots = [[-17, 8], [16, -10], [3, -22], [-4, 25], [10, 30], [-10, 40], [30, 8], [49, 8], [44, 24], [TEMPLE40.c[0] - 25, 62], [-60, 20], [60, -60], [-30, -50], [5, -90], [-140, -30], [-120, 10], [-60, 150], [20, 140], [90, 160], [-20, 190]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.04, rot: (x * 7) % 3, range: [1.8, 1.6] });
// a little egret in the plain's fields south-west of the village
for (const [x, z] of [[-60, 245], [40, 262]]) perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: 0.8, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
