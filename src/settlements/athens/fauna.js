// Athens — the animals (src/engine/fauna.js draws them; docs/settlements/athens.md §12): the little owl of Athena that the coins show
// perched on the Agora's stoas and the Acropolis walls (drawn as a crow at dusk), crows and ravens over the rock, swifts and swallows over
// the roofs and the Agora, sparrows on the paving of the Way, the stoas' steps and the Kerameikos lane, pigeons at the fountain.
import { WAY, AGORA, ACRO } from './layout.js';
import { WORKSHOPS } from './quarters.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 5, loop: { c: [0, 0], a: [150, 80], rot: 0.2 }, y: [60, 110], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-175, -95], a: [60, 40], rot: 0.5 }, y: [30, 60], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-230, -170], a: [90, 55], rot: 0.3 }, y: [8, 30], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [-40, -90], a: [80, 40], rot: 0 }, y: [75, 100], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-180, -275], a: [50, 25], rot: 0.8 }, y: [8, 24], speed: 9 },
];
const perches = [];
// sparrows on the Way, in the Agora, by the fountain, in the Kerameikos lane, on the summit
const spots = [[-255, -210], [-240, -215], [-225, -195], [-250, -170], [-262, -150], [-210, -160], [-195, -180], [-190, -128], [-176, -121], [-236, -118], [-200, -108], [-215, 20], [-290, 62], [-148, 2], [-120, 4], [-60, -10], [-12, 4]];
for (const w of WORKSHOPS) spots.push([w.yardMid[0], w.yardMid[1]]);
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
void WAY; void AGORA; void ACRO;
export default { fish, flights, perches };
