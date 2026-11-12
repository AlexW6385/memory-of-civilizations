// Vienna in spring 1902 — the animals (src/engine/fauna.js; docs/settlements/vienna.md §9): swallows and swifts over the Ring and the
// Wien, crows round the Karlskirche's dome and the Opera's roof, sparrows and pigeons on the paving and the Karlsplatz's lawns, a
// grey heron on the Wien's wall (carp lie in the channel).
import { WIEN, KARLSKIRCHE, OPERA, GROUND, yards } from './layout.js';

const inWater = (x, z) => (x > WIEN.x0 + 3 && x < WIEN.x1 - 3 ? Math.max(WIEN.z0 - z, z - WIEN.z1) : 20);
const fish = [];
for (let i = 0; i < 4; i++) fish.push({ n: 3, size: [0.25, 0.4], palette: 'carp', y: WIEN.water, area: [-240 + i * 120, WIEN.z0 + 1, -150 + i * 120, WIEN.z1 - 1], dist: inWater, margin: 1.2, a: [12, 3], ratio: 0.3, speed: 0.4, rise: 0.2 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-250, -230], b: [250, -230] }, y: [3, 20], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, lane: { a: [-260, 70], b: [260, 70] }, y: [2, 12], speed: 8, half: 10 },
  { kind: 'swallow', n: 4, lane: { a: [60, -140], b: [60, 200] }, y: [6, 20], speed: 8, half: 8 },
  { kind: 'crow', n: 4, loop: { c: [KARLSKIRCHE[0] - 20, KARLSKIRCHE[1]], a: [28, 26], rot: 0.3 }, y: [75, 45], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [(OPERA[0] + OPERA[2]) / 2, (OPERA[1] + OPERA[3]) / 2], a: [60, 30], rot: 0.1 }, y: [45, 28], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-30, -57], [30, -57], [-10, -37], [10, 6], [-20, 8], [90, -12], [140, -2], [170, 14], [-80, 52], [-160, 52], [0, -212], [60, -244]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.07, range: [1.5, 1.3] });
for (const y of yards().slice(0, 9)) perches.push({ kind: 'sparrow', x: (y.rect[0] + y.rect[2]) / 2 + 2, z: (y.rect[1] + y.rect[3]) / 2 + 1.5, y: GROUND + 0.1, rot: y.rect[0] * 0.05, range: [2, 1.6] });
flights.push({ kind: 'swallow', n: 3, lane: { a: [-200, -100], b: [200, -100] }, y: [8, 22], speed: 9, half: 12 });
perches.push({ kind: 'heron', x: -120, z: WIEN.z0 - 1.3, y: GROUND + 0.2, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
