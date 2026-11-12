// Delphi — the animals (src/engine/fauna.js draws them; docs/settlements/delphi.md §8): choughs and ravens (drawn as crows) wheeling
// before the Phaedriades' cliffs, swifts and swallows over the temple's terrace and the Sacred Way, sparrows on the paving and the
// treasuries' steps; no fish (no pool in the disc).
import { lanes, WAY, TT_Y, SPRING, STADIUM, STADIUM_Y, TREASURIES } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 6, loop: { c: [10, -150], a: [120, 40], rot: 0.1 }, y: [75, 120], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [150, -20], a: [34, 40], rot: 0.5 }, y: [45, 80], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [30, 5], a: [70, 40], rot: 0 }, y: [24, 38], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [70, 70], a: [60, 40], rot: 0.3 }, y: [14, 26], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-34, -52], a: [40, 30], rot: 0 }, y: [38, 52], speed: 9 },
];
flights.push({ kind: 'swallow', n: 5, loop: { c: [-120, 40], a: [60, 50], rot: 0.2 }, y: [10, 26], speed: 10 }, { kind: 'swallow', n: 4, loop: { c: [125, 70], a: [30, 40], rot: 0 }, y: [10, 22], speed: 10 }, { kind: 'crow', n: 5, loop: { c: [-60, -140], a: [70, 30], rot: -0.3 }, y: [70, 110], speed: 8 }, { kind: 'swallow', n: 4, loop: { c: [118, 116], a: [30, 14], rot: 0 }, y: [6, 14], speed: 9 });
const perches = [];
const spots = [[60, 98], [88, 99], [52, 77], [80, 76], [70, 57], [20, 57], [0, 43], [40, 43], [70, 43], [-20, 5], [20, 18], [50, 14], [66, -12], [30, -18], [-10, -17], [135, 0], [128, 8], [100, 120], [112, 118]];
for (const r of lanes()) for (let x = r.x0 + 6; x < r.x1 - 3; x += 17 + (Math.round(r.z) % 5)) spots.push([x, r.z - 0.2]);
for (const t of TREASURIES) spots.push([(t.rect[0] + t.rect[2]) / 2 + 2.5, t.rect[3] + 0.4]);
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
void WAY; void TT_Y; void SPRING; void STADIUM; void STADIUM_Y;
export default { fish, flights, perches };
