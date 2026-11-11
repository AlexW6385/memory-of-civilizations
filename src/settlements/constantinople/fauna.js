// Constantinople — the animals (src/engine/fauna.js draws them; docs/settlements/constantinople.md §13): crows and gulls (drawn as crows) over
// the hill from the sea, pigeons (drawn as sparrows) on the paving of the Augustaion, the Mese and the
// Hippodrome, swifts over the roofs, sparrows at the shop fronts.
import { AUGUSTAION, HIPPODROME, FORUM, MESE } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 6, loop: { c: [60, 120], a: [200, 110], rot: 0.3 }, y: [40, 110], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-40, 260], a: [150, 70], rot: 0 }, y: [25, 80], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-120, 90], a: [120, 60], rot: 0.5 }, y: [10, 40], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [-10, 140], a: [60, 30], rot: 0 }, y: [14, 40], speed: 7 },
  { kind: 'swallow', n: 4, loop: { c: [-240, 200], a: [70, 40], rot: 0.8 }, y: [14, 40], speed: 7 },
];
const perches = [];
const spots = [[-30, 150], [-14, 160], [0, 135], [-45, 170], [-10, 120], [-80, 108], [-120, 112], [-175, 90], [-182, 60], [-230, 40], [-280, 36], [FORUM.c[0] + 10, FORUM.c[1] + 12], [FORUM.c[0] - 12, FORUM.c[1] - 10], [-140, 20], [-20, 60]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
void AUGUSTAION; void HIPPODROME; void MESE;
export default { fish, flights, perches };
