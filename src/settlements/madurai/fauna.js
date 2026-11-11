// Madurai about 1650 — the animals (src/engine/fauna.js draws them; docs/settlements/madurai.md §13): rock pigeons
// round the gopurams, house crows over the roofs, swifts high over the great towers, house sparrows on the
// paving of the streets and the temple courts. (No fish: the Golden Lotus tank holds none, the dossier says.)
import { WALL, GATES, TANK, RADIUS } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [GATES.s[0], 140], a: [40, 28], rot: 0 }, y: [30, 52], speed: 10 },          // swifts and pigeons about the south gopuram
  { kind: 'swallow', n: 5, loop: { c: [GATES.e[0] + 10, GATES.e[1]], a: [34, 26], rot: 0.4 }, y: [26, 46], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [(TANK[0] + TANK[2]) / 2, (TANK[1] + TANK[3]) / 2], a: [24, 18], rot: 0 }, y: [4, 12], speed: 8 },   // over the tank
  { kind: 'crow', n: 6, loop: { c: [-60, 60], a: [90, 60], rot: 0.5 }, y: [14, 30], speed: 8 },                          // house crows over the town
  { kind: 'crow', n: 5, loop: { c: [120, 180], a: [80, 50], rot: -0.4 }, y: [12, 26], speed: 8 },
];
const perches = [];
const spar = (x, z, y = 0.02) => perches.push({ kind: 'sparrow', x, z, y, rot: 0.4 + (Math.abs(x * 7 + z) % 3), range: [1.4, 1.3] });
for (const [x, z] of [[-60, WALL[3] + 19], [-12, WALL[3] + 18], [30, WALL[3] + 20], [70, WALL[3] + 18], [WALL[2] + 19, -60], [WALL[2] + 20, 30], [WALL[0] - 19, 20], [WALL[0] - 20, -70], [-80, WALL[1] - 19], [20, WALL[1] - 19]]) spar(x, z);
for (const [x, z] of [[-40, 128], [-15, 140], [-30, 100], [10, 95], [-70, 112], [60, 108]]) spar(x, z);
for (const x of [-110, -50, 20, 90]) spar(x, WALL[3] + 76);
// sparrows on the thinnais' edge and the paving of the first rings, in the lanes between the axial streets
for (let i = 0; i < 16; i++) { const o = [14, 20, 75, 31][i % 4], a = i * 0.39 + 0.2; spar(Math.cos(a) * (WALL[2] + o + (i % 3)) * 1.0, Math.sin(a) * (WALL[3] + o + (i % 3)) * 1.0); }
void RADIUS;
export default { fish, flights, perches };
