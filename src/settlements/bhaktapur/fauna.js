// Bhaktapur — the animals (src/engine/fauna.js draws them; docs/settlements/bhaktapur.md §7): swallows over the squares and the lanes, crows over the
// roofs at twilight, sparrows on the paving, the plinth and the eaves of the market's houses. No fish (no open water in the town).
import { SQ, POT, NYA, BHA, lots, fp } from './layout.js';

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [5, -5], a: [40, 24], rot: 0.1 }, y: [4, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-78, 70], a: [34, 20], rot: 0.5 }, y: [3, 10], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [0, 0], a: [120, 90], rot: 0.3 }, y: [28, 55], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-26, -20], [-26, 12], [0, 2], [20, -20], [40, -10], [-5, 20], [12, 14], [30, 21], [-5, -30], [18, 3], [-60, 60], [-90, 75], [-70, 88]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// on the Nyatapola's plinth: the west treads of the second, third and fourth stages (tops at 2, 3 and 4 m)
for (const [k, u] of [[1, 6.85], [2, 5.95], [3, 5.05]]) perches.push({ kind: 'sparrow', x: NYA.c[0] - u, z: NYA.c[1], y: (k + 1) * 1.0 + 0.05, rot: 0, range: [0.3, 3], alert: 5 });
// sparrows on the steps and the pidha of the houses nearest the square, and on the Bhairabnath's plinth treads (tops at 0.9, 1.8, 2.7)
{
  let k = 0;
  for (const l of lots()) {
    if (l.use || Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) > 80 || k > 22 || (l.seed % 3) !== 0) continue;
    const W = l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], p = fp(l, l.dx ?? W / 2, -0.7);
    perches.push({ kind: 'sparrow', x: p[0], z: p[1], y: l.pid ? 0.5 : 0.07, rot: (l.seed % 7) * 0.9, range: [1.6, 1.4] }); k++;
  }
  for (const [j, u] of [[1, 5.0], [2, 4.2]]) perches.push({ kind: 'sparrow', x: BHA.c[0] - u - 1.5, z: BHA.c[1] + 2.6, y: j * 0.9 + 0.05, rot: 0, range: [0.3, 2.5], alert: 5 });
}
void SQ; void POT;
export default { fish: [], flights, perches };
