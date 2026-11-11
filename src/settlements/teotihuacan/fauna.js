// Teotihuacan — the animals (src/engine/fauna.js; docs/settlements/teotihuacan.md §14): swallows over the plazas and the
// market, crows over the pyramids, sparrows on the plaza floors and the market's paving. No water: no fish, no egret.
import { AVENUE, MARKET, PLAZA, SUN } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 120], a: [18, 150], rot: 0 }, y: [10, 30], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], a: [60, 80], rot: 0.2 }, y: [8, 20], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -300], a: [70, 50], rot: 0.1 }, y: [12, 40], speed: 10 },
  { kind: 'crow', n: 6, loop: { c: [SUN.c[0], SUN.c[1]], a: [160, 130], rot: 0.5 }, y: [60, 100], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, -330], a: [90, 70], rot: 0.9 }, y: [45, 80], speed: 8 },
];
const perches = [];
const spots = [[6, 60], [-6, 90], [4, 150], [-5, 210], [6, 290], [-4, 340], [8, -40], [-8, -120], [-20, -240], [20, -230], [-128, 200], [-100, 230], [-150, 290], [-90, 320], [-170, 210], [-110, 280]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
void AVENUE; void PLAZA;
export default { fish, flights, perches };
