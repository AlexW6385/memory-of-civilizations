// Bauhaus Dessau — the animals (src/engine/fauna.js; docs/settlements/bauhaus-dessau.md §7): swifts and house martins over the streets, jackdaws
// and crows over the roofs, house sparrows on the paving and the roofs' edges, a blackbird in the pines of the Masters' grove.
import { ground } from './ground.js';
import { B, MASTERS, RADIUS } from './layout.js';

const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-180, 40], b: [180, 40] }, y: [4, 14], speed: 10, half: 18 },
  { kind: 'swallow', n: 5, loop: { c: [0, -2], a: [50, 24], rot: 0 }, y: [5, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-60, 100], a: [70, 40], rot: 0.4 }, y: [4, 12], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [20, -80], a: [90, 50], rot: 0.2 }, y: [32, 55], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [110, 60], a: [70, 40], rot: 0.5 }, y: [24, 40], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-30, -40], [-27, 20], [-28, 70], [10, 2], [30, -4], [60, 0], [100, 2], [3, 40], [-60, 80], [-38, 110], [-95, -40], [-95, 40], [70, 78], [120, 80], [20, 50], [140, 40], [-110, 120]])
  perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
// on the school's flat roofs and parapets
for (const [x, z, y] of [[-12, 10, 12.9], [20, -20, 12.9], [30, -12, 12.9], [44, 12, 16.3], [20, 18, 4.5]]) perches.push({ kind: 'sparrow', x, z, y, rot: 0, range: [1.2, 0], alert: 5 });
void B; void MASTERS; void RADIUS;
export default { fish: [], flights, perches };
