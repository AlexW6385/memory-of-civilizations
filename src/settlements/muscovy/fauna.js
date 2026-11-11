// Muscovy about 1600 — the animals (src/engine/fauna.js draws them): carp and pike-perch in the Moskva's shallows, swifts
// and swallows over the river and the squares, jackdaws and rooks round the bell towers and domes of the churches (the crow
// flights circle the Kremlin's cathedrals and St Basil's), sparrows on the log paving and the fence tops.
import { RIVER, RADIUS, CATHEDRALS, BASIL, SQUARE, riverZ, height } from './layout.js';

const fish = [];
for (let i = 0; i < 6; i++) {
  const x = -230 + i * 85;
  fish.push({ n: 3, size: [0.5, 0.8], palette: 'carp', y: RIVER.level, dist: (px, pz) => Math.abs(pz - riverZ(px)) - (RIVER.w / 2 - 3), margin: 2, area: [x - 25, riverZ(x) - 12, x + 25, riverZ(x) + 12], a: [18, 6], ratio: 0.3, speed: 0.3, rise: 0 });
}
const [ix, iz] = CATHEDRALS.ivan;
const flights = [
  { kind: 'crow', n: 9, loop: { c: [ix, iz], a: [34, 30], rot: 0.3 }, y: [48, 20], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [BASIL[0], BASIL[1]], a: [26, 22], rot: 0 }, y: [32, 14], speed: 8 },
  { kind: 'swallow', n: 5, lane: { a: [-300, riverZ(-300) - 4], b: [300, riverZ(300) - 4] }, y: [RIVER.level + 1.5, RIVER.level + 4.5], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [30, 20], a: [40, 70], rot: 0 }, y: [4, 12], speed: 8 },
];
flights[2].a = [30, 3];
const perches = [];
for (const [x, z] of [[40, -100], [38, -30], [44, 40], [36, 90], [-90, 230 - 0], [120, 35], [-60, -120], [150, -35]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: (x * 7) % 3, range: [1.5, 1.3] });
void RADIUS; void SQUARE;
export default { fish, flights, perches };
