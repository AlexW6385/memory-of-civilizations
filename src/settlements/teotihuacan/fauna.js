// Teotihuacan — the animals (src/engine/fauna.js; docs/settlements/teotihuacan.md §14): swallows over the plazas and the
// market, crows over the pyramids, sparrows on the plaza floors and the market's paving. No water: no fish, no egret.
import { AVENUE, MARKET, PLAZA, SUN, RADIUS } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 120], a: [18, 150], rot: 0 }, y: [10, 30], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], a: [60, 80], rot: 0.2 }, y: [8, 20], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -300], a: [70, 50], rot: 0.1 }, y: [12, 40], speed: 10 },
  { kind: 'crow', n: 6, loop: { c: [SUN.c[0], SUN.c[1]], a: [160, 130], rot: 0.5 }, y: [60, 100], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, -330], a: [90, 70], rot: 0.9 }, y: [45, 80], speed: 8 },
];
// swallows over the grid's streets, low between the compounds' walls
for (const line of [-RADIUS + 64 * 3, -RADIUS + 64 * 9]) flights.push({ kind: 'swallow', n: 3, lane: { a: [line - 3, -150], b: [line - 3, 180] }, y: [3, 11], speed: 9, a: [20, 3] });
for (const line of [-RADIUS + 64 * 8, -RADIUS + 64 * 9]) flights.push({ kind: 'swallow', n: 3, lane: { a: [-300, line - 3], b: [-90, line - 3] }, y: [3, 11], speed: 9, a: [20, 3] });
const perches = [];
const spots = [[6, 60], [-6, 90], [4, 150], [-5, 210], [6, 290], [-4, 340], [8, -40], [-8, -120], [-20, -240], [20, -230], [-128, 200], [-100, 230], [-150, 290], [-90, 320], [-170, 210], [-110, 280]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// sparrows at the street crossings, about the grid's middle
for (let i = 0; i < 14; i++) for (let j = 0; j < 14; j++) {
  const x = -RADIUS + 64 * i + 1.5, z = -RADIUS + 64 * j + 1.5;
  if (Math.hypot(x, z) > 300 || Math.abs(x) < 60 || (i * 7 + j * 3) % 4) continue;
  perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (i * 5 + j) % 6, range: [1.6, 1.4] });
}
void AVENUE; void PLAZA;
export default { fish, flights, perches };
