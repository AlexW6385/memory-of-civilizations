// Borgund — the animals (src/engine/fauna.js draws them; docs/settlements/norse-borgund.md §10): trout (dark fish) in the
// river's pools, swallows over the meadows, the farms and the river, crows over the church and the slopes, sparrows
// in the farm yards and the churchyard, a grey heron on the river's bank.
import { LANDING, FARMS, YARD, RIVER, riverZ, height, buildings } from './layout.js';

const fish = [];
for (const x of [-290, -250, -190, -130, -60, 20, 70, 110, 160, 200, 260]) {
  const rz = riverZ(x);
  fish.push({ n: 3, size: [0.3, 0.5], palette: 'carp', y: RIVER.level, area: [x - 12, rz - 2, x + 12, rz + 2], dist: (px, pz) => Math.abs(pz - riverZ(px)) - (RIVER.w / 2 - 2), margin: 1.5, a: [8, 3], ratio: 0.3, speed: 0.4, rise: 0.4 });
}
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, 20], a: [120, 60], rot: 0.1 }, y: [1.5, 6], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [LANDING.x, LANDING.rz], a: [30, 12], rot: 0 }, y: [0.5, 3], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [120, 0], a: [60, 40], rot: 0.5 }, y: [2, 8], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [0, -30], a: [40, 30], rot: 0.3 }, y: [24, 14], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [-120, -100], a: [90, 50], rot: 0.9 }, y: [45, 30], speed: 8 },
];
// the swallows nest in the barns: each farm has a pair about its yard
FARMS.forEach(([fx, fz], i) => { if (i % 2 === 0) flights.push({ kind: 'swallow', n: 2, loop: { c: [fx, fz], a: [24, 18], rot: i * 0.7 }, y: [1.2, 5], speed: 8 }); });
flights.push({ kind: 'crow', n: 3, loop: { c: [140, -130], a: [70, 40], rot: 0.2 }, y: [40, 28], speed: 8 });
const perches = [];
// sparrows on the barn doorsteps and the yards' woodpiles
buildings().filter((b) => b.kind === 'barn' && b.farm % 2 === 1).forEach((b) => { const x = (b.rect[0] + b.rect[2]) / 2, z = b.rect[3] + 1.4; perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.04, rot: b.seed % 3, range: [1.6, 1.4] }); });
for (const [fx, fz] of FARMS) perches.push({ kind: 'sparrow', x: fx + 4, z: fz + 14, y: height(fx + 4, fz + 14) + 0.04, rot: (fx * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[-10, YARD[3] + 3], [10, YARD[3] + 2], [0, YARD[1] - 3]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.04, rot: x % 3, range: [1.6, 1.4] });
// a grey heron on the stony bank east of the quay
{ const x = LANDING.x + 22, z = riverZ(x) - 12.5; perches.push({ kind: 'heron', x, z, y: height(x, z), rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 }); }
{ const x = LANDING.x - 40, z = riverZ(x) - 12.5; perches.push({ kind: 'heron', x, z, y: height(x, z), rot: 1.2, stay: [60, 200], gone: [60, 180], alert: 10 }); }
export default { fish, flights, perches };
