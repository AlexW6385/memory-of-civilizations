// Mohenjo-daro — the animals (src/engine/fauna.js; docs/settlements/mohenjo-daro.md §8): river fish in the Indus, swallows over the water and the streets,
// kites over the Citadel (drawn as crows), sparrows on the paving, a heron and an egret on the bank and at the quay.
import { RIVER, QUAY, MOUND, PLAZA, riverX, height } from './layout.js';

const inWater = (x, z) => Math.abs(x - riverX(z)) - (RIVER.hw - 3);
const fish = [];
for (let z = -280; z < 280; z += 70) fish.push({ n: 4, size: [0.3, 0.8], palette: 'carp', y: RIVER.level, area: [riverX(z) - 14, z, riverX(z) + 14, z + 70], dist: inWater, margin: 3, a: [6, 26], ratio: 0.3, speed: 0.4, rise: 0.2 });
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [62, -40], a: [40, 30], rot: 0.2 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [QUAY.x1 + 6, -90], b: [QUAY.x1 + 6, 70] }, y: [0.8, 6], speed: 10, half: 14 },
  { kind: 'swallow', n: 6, lane: { a: [RIVER.x - 8, -250], b: [RIVER.x - 8, 250] }, y: [1.5, 14], speed: 10, half: 26 },
  { kind: 'swallow', n: 4, loop: { c: [60, 0], a: [90, 80], rot: 0.3 }, y: [4, 22], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [(MOUND[0] + MOUND[2]) / 2, (MOUND[1] + MOUND[3]) / 2], a: [90, 70], rot: 0.2 }, y: [34, 22], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [130, -120], a: [60, 40], rot: 0.9 }, y: [26, 14], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [100, 150], a: [70, 40], rot: 0.1 }, y: [25, 14], speed: 8 },
];
const perches = [];
const spots = [[-150, -50], [-120, -60], [-60, -44], [-20, -40], [62, -80], [62, 10], [62, 100], [154, -80], [154, 30], [154, 110], [48, -40], [76, -30], [30, 48], [100, 48], [-30, -100], [-30, 120], [240, -60], [250, 20], [-160, 70], [-200, -150]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[-121, -97], [-178, -80]]) perches.push({ kind: 'crow', x: x + 1.5, z: z + 1, y: 7 + 7.4, rot: x % 3, range: [2, 1.6], stay: [30, 120], gone: [30, 90], alert: 12 });
for (const [x, z] of [[-124, -71], [-192, -80.5], [-72, -92], [-150, -18]]) perches.push({ kind: 'sparrow', x: x + 1.4, z: z - 1.1, y: 7.1, rot: (x * 3) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'sparrow', x: -160, z: -72, y: 7.1, rot: 1, range: [1.6, 1.4] }, { kind: 'sparrow', x: -145, z: -50, y: 7.1, rot: 2, range: [1.6, 1.4] });
// sparrows on the market's stalls and the quay's sheds, crows on the Citadel's parapet and the granary roof, egrets at the weirs
for (const [x, z, y] of [[44, -62, 2.3], [58, -62, 2.3], [78, -62, 2.3], [44, -18, 2.3], [70, -18, 2.3], [255, -98, 3.4], [255, -50, 3.4], [255, -8, 3.4], [255, 22, 3.4]]) perches.push({ kind: 'sparrow', x, z, y, rot: (x * 5) % 3, range: [1.8, 1.4] });
for (const [x, z, y] of [[-208, -92, 7 + 6.2], [-190, -108, 7 + 6.2], [MOUND[2] - 4, MOUND[1] + 6, 8.4], [MOUND[0] + 6, MOUND[3] - 6, 8.4]]) perches.push({ kind: 'crow', x, z, y, rot: (z * 3) % 3, range: [2, 1.6], stay: [30, 120], gone: [60, 160], alert: 9 });
for (const [x, z] of [[286, -125], [288, 128]]) perches.push({ kind: 'egret', x: x + 1, z: z + 2, y: RIVER.level + 0.95, rot: 1, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: riverX(-170) - RIVER.hw + 3, z: -170, y: -1.9, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: QUAY.x1 - 0.9, z: 25, y: 0.5, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void PLAZA;
export default { fish, flights, perches };
