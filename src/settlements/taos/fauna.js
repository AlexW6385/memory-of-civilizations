// Taos Pueblo — the animals (src/engine/fauna.js draws them; docs/settlements/taos.md §4.4): swallows over the creek and the
// plaza, ravens high over the terraces, small birds (sparrow stand-ins) on the plaza's earth and the roofs' parapets, an egret
// standing in for a heron at the creek's edge, small dark trout in Red Willow Creek [inferred: a snowmelt stream of the valley].
import { CREEK, creekZ, NORTH, SOUTH, CELL } from './layout.js';
import { ground } from './ground.js';

const creekDist = (x, z) => Math.abs(z - creekZ(x)) - CREEK.w / 2;
const fish = [];
for (let x = -50; x <= 50; x += 25) fish.push({ n: 3, size: [0.14, 0.24], palette: 'carp', y: CREEK.water, dist: creekDist, margin: 0.5, k: 1, rot: 0, area: [x - 12, creekZ(x) - 0.3, x + 12, creekZ(x) + 0.3], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-200, 0], b: [200, 0] }, y: [0.4, 3.2], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -20], a: [60, 26], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [-20, -90], a: [90, 40], rot: 0.3 }, y: [28, 55], speed: 8 },
];
flights[0].a = [26, 3];
const perches = [];
for (const [x, z] of [[-55, -30], [-30, -35], [-5, -20], [20, -30], [45, -35], [-45, 28], [-15, 30], [15, 36], [40, 30], [60, 12], [-60, 12], [0, -50]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// ...and on the parapet of a low roof of the North House (the roofs of the first storey stand at 2.7 m)
for (const [x, z] of [[-12.5, -55.5], [4, -54], [-46, -62]]) perches.push({ kind: 'sparrow', x, z, y: 2.7 + 0.5, rot: 0, range: [1.2, 0], alert: 5 });
// a small egret on the creek's bank, facing the water
{ const x = -22, z = creekZ(x) - 2.7; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void NORTH; void SOUTH; void CELL;
export default { fish, flights, perches };
