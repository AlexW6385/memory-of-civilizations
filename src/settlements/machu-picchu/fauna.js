// Machu Picchu — the animals (src/engine/fauna.js; docs/settlements/machu-picchu.md §10): Andean swifts and swallows over the
// terraces and the canyon, condors turning high over the peaks (the crow's black form stands in), rufous-collared sparrows
// on the plaza's paving and the terraces' walls. No water in the disc: no fish.
import { PLAZA, SITE, HILL, KALLANKA, kanchas } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [SITE.a + 30, SITE.b], rot: 0 }, y: [4, 30], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [0, -20], a: [40, 55], rot: 0.2 }, y: [3, 12], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-15, 110], a: [55, 50], rot: 0.1 }, y: [4, 22], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-20, 125], a: [70, 40], rot: -0.3 }, y: [10, 40], speed: 10 },
  { kind: 'crow', n: 2, loop: { c: [-10, -200], a: [120, 90], rot: 0.4 }, y: [120, 200], speed: 11 },
  { kind: 'crow', n: 1, loop: { c: [30, 180], a: [140, 100], rot: 1.1 }, y: [140, 220], speed: 11 },
];
const perches = [];
// sparrows hopping on the plaza's grass, the lanes and the walls' heads
const spots = [[-8, -40], [4, -22], [12, -4], [-4, 2], [2, 60], [3, 100], [-10, -90], [8, -110], [-34, -37], [-24, -37], [-45, -62], [-30, 103], [-14, 106], [8.5, 103], [-3, 126], [-31, 132.5], [-19, 141]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.03, rot: (x * 7) % 3, range: [1.6, 1.4] });
// ...and on the kallanka's wall-head
for (const z of [-40, -20, -6]) perches.push({ kind: 'sparrow', x: KALLANKA[0] + 0.3, z, y: 3.3, rot: Math.PI / 2, range: [2.2, 0], alert: 5 });
// ...and in the kanchas' patios and on their gate walls, one pair to every third kancha
for (const [i, K] of kanchas().entries()) {
  if (i % 3) continue;
  const p = K.at(K.A / 2 + (i % 2 ? 3 : -3), 2.2), g = K.at(K.A / 2 + 1.2, 0);
  perches.push({ kind: 'sparrow', x: p[0], z: p[1], y: ground.height(p[0], p[1]) + 0.03, rot: i * 1.3, range: [1.4, 1.2] });
  perches.push({ kind: 'sparrow', x: g[0], z: g[1], y: ground.height(g[0], g[1]) + 2.4, rot: Math.PI / 2, range: [2.0, 0], alert: 5 });
}
void PLAZA; void HILL;
export default { fish, flights, perches };
