// Bhaktapur — the animals (src/engine/fauna.js draws them; docs/settlements/bhaktapur.md §7): swallows over the squares and the lanes, crows over the
// roofs at twilight, sparrows on the paving, the plinth and the eaves of the market's houses. No fish (no open water in the town).
import { SQ, POT, NYA } from './layout.js';

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [5, -5], a: [40, 24], rot: 0.1 }, y: [4, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-78, 70], a: [34, 20], rot: 0.5 }, y: [3, 10], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [0, 0], a: [120, 90], rot: 0.3 }, y: [28, 55], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-26, -20], [-26, 12], [0, 2], [20, -20], [40, -10], [-5, 20], [12, 14], [30, 21], [-5, -30], [18, 3], [-60, 60], [-90, 75], [-70, 88]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// on the Nyatapola's plinth: the west treads of the second, third and fourth stages (tops at 2, 3 and 4 m)
for (const [k, u] of [[1, 6.85], [2, 5.95], [3, 5.05]]) perches.push({ kind: 'sparrow', x: NYA.c[0] - u, z: NYA.c[1], y: (k + 1) * 1.0 + 0.05, rot: 0, range: [0.3, 3], alert: 5 });
void SQ; void POT;
export default { fish: [], flights, perches };
