// Constantinople — the animals (src/engine/fauna.js draws them; docs/settlements/constantinople.md §13): crows and gulls (drawn as crows) over
// the hill from the sea, pigeons (drawn as sparrows) on the paving of the Augustaion, the Mese and the
// Hippodrome, swifts over the roofs, sparrows at the shop fronts.
import { AUGUSTAION, HIPPODROME, FORUM, MESE } from './layout.js';
import { ground } from './ground.js';
import { lots } from './layout.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 6, loop: { c: [60, 120], a: [200, 110], rot: 0.3 }, y: [40, 110], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-40, 260], a: [150, 70], rot: 0 }, y: [25, 80], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-120, 90], a: [120, 60], rot: 0.5 }, y: [10, 40], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [-10, 140], a: [60, 30], rot: 0 }, y: [14, 40], speed: 7 },
  { kind: 'swallow', n: 4, loop: { c: [-240, 200], a: [70, 40], rot: 0.8 }, y: [14, 40], speed: 7 },
];
const perches = [];
const spots = [[-30, 150], [-14, 160], [0, 135], [-45, 170], [-10, 120], [-80, 108], [-120, 112], [-175, 90], [-182, 60], [-230, 40], [-280, 36], [FORUM.c[0] + 10, FORUM.c[1] + 12], [FORUM.c[0] - 12, FORUM.c[1] - 10], [-140, 20], [-20, 60], [-12, 48], [6, 64], [-30, 72], [14, 86], [-24, 94], [4, 100], [24, 62], [-8, 58], [32, 80], [-40, 90]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// pigeons and sparrows on the lanes' paving at the row ends near the core, and on the garden walls
{ let n = 0; for (const l of lots()) { if (l.abut.e || Math.hypot(l.rect[2], l.rect[3]) > 260 || (l.seed % 3)) continue; const x = l.rect[2] + 2.5, z = (l.rect[1] + l.rect[3]) / 2 + (l.seed % 5) - 2; perches.push({ kind: l.seed % 2 ? 'sparrow' : 'sparrow', x, z, y: ground.height(x, z), rot: (l.seed % 7) / 2, range: [2.2, 1.2] }); if (++n > 40) break; } }
void AUGUSTAION; void HIPPODROME; void MESE;
export default { fish, flights, perches };
