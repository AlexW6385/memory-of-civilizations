// Machu Picchu — the animals (src/engine/fauna.js; docs/settlements/machu-picchu.md §10): Andean swifts and swallows over the
// terraces and the canyon, condors turning high over the peaks (the crow's black form stands in), rufous-collared sparrows
// on the plaza's paving and the terraces' walls. No water in the disc: no fish.
import { PLAZA, SITE, HILL, KALLANKA } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [SITE.a + 30, SITE.b], rot: 0 }, y: [4, 30], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [0, -20], a: [40, 55], rot: 0.2 }, y: [3, 12], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [0, 120], a: [50, 60], rot: 0.1 }, y: [4, 20], speed: 9 },
  { kind: 'crow', n: 2, loop: { c: [-10, -200], a: [120, 90], rot: 0.4 }, y: [120, 200], speed: 11 },
  { kind: 'crow', n: 1, loop: { c: [30, 180], a: [140, 100], rot: 1.1 }, y: [140, 220], speed: 11 },
];
const perches = [];
// sparrows hopping on the plaza's grass, the lanes and the walls' heads
const spots = [[-8, -40], [4, -22], [12, -4], [-4, 2], [2, 60], [3, 100], [-10, -90], [8, -110], [-34, -37], [-24, -37], [-45, -62]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.03, rot: (x * 7) % 3, range: [1.6, 1.4] });
// ...and on the kallanka's wall-head
for (const z of [-40, -20, -6]) perches.push({ kind: 'sparrow', x: KALLANKA[0] + 0.3, z, y: 3.3, rot: Math.PI / 2, range: [2.2, 0], alert: 5 });
void PLAZA; void HILL;
export default { fish, flights, perches };
