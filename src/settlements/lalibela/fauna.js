// Lalibela — the animals (src/engine/fauna.js; docs/settlements/lalibela.md §14): swallows hawking over the
// pits and the village (they nest in the hewn rock), thick-billed ravens high over the plateau, house
// sparrows on the rims of the pits and the roofs of the churches. All places come from layout.js.
import { PITS, PRECINCT } from './layout.js';

const c = (p) => [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2];
const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: c(PITS.giyorgis), a: [34, 30], rot: 0.3 }, y: [2, 14], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: c(PITS.medhane), a: [46, 34], rot: 0 }, y: [3, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [60, 40], a: [60, 40], rot: 0.5 }, y: [4, 18], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-120, 40], a: [60, 50], rot: 0.2 }, y: [6, 22], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [0, 0], a: [190, 140], rot: 0.4 }, y: [38, 70], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [-140, 90], a: [90, 70], rot: 1.1 }, y: [30, 55], speed: 8 },
];
const perches = [];
const rim = (p, k, o = 1.2) => { const [x0, z0, x1, z1] = p.rect; return [[x0 + (x1 - x0) * k, z0 - o], [x0 + (x1 - x0) * (1 - k), z1 + o], [x0 - o, z0 + (z1 - z0) * k], [x1 + o, z0 + (z1 - z0) * (1 - k)]]; };
for (const [id, k] of [['giyorgis', 0.3], ['medhane', 0.25], ['maryam', 0.4], ['golgotha', 0.3], ['amanuel', 0.4], ['gabriel', 0.5]]) for (const [x, z] of rim(PITS[id], k)) perches.push({ kind: 'sparrow', x, z, y: 0.12, rot: x * 3 % 3, range: [1.6, 1.4] });
// on Medhane Alem's roof (its ridge at the precinct's level less a hand) and Maryam's
for (const [x, z] of [[-4, -90], [24, -92], [8, -100]]) perches.push({ kind: 'sparrow', x, z, y: -0.35, rot: 0.4, range: [1.2, 0.8] });
// in the village, by the houses at the edge of the level ground
for (const [x, z] of [[-250, 40], [250, -60], [150, 200], [-120, -210], [60, 215], [-180, -150]]) perches.push({ kind: 'sparrow', x, z, y: 0.05 + Math.max(0, Math.hypot(x, z) - PRECINCT) * 0.16, rot: x % 3, range: [1.6, 1.4] });
export default { fish, flights, perches };
