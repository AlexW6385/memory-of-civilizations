// Ubirr — the animals (src/engine/fauna.js; docs/settlements/kakadu.md §4): wood swallows over the plain, kites high over the rock (crow
// stand-ins), small birds in the grass and on the rock, egrets (the white egrets of the billabong) at its margin, barramundi and catfish
// (carp stand-ins) in the water. Magpie geese are standing figures in town.js.
import { POOL, poolD, CAMPS, height, rng } from './layout.js';

const fish = [];
fish.push({ n: 4, size: [0.3, 0.55], palette: 'carp', y: POOL.water - 0.2, dist: (x, z) => (poolD(x, z) - 1) * 24, margin: 1.2, k: 1, rot: 0, area: [POOL.c[0] - 20, POOL.c[1] - 8, POOL.c[0] + 20, POOL.c[1] + 8], a: [9, 4], ratio: 0.2, minA: 2, speed: 0.5, rise: 0.15 });
fish.push({ n: 5, size: [0.25, 0.45], palette: 'carp', y: POOL.water - 0.25, dist: (x, z) => (poolD(x, z) - 1) * 24, margin: 1.2, k: 1, rot: 1, area: [POOL.c[0] - 38, POOL.c[1] + 2, POOL.c[0] - 8, POOL.c[1] + 18], a: [8, 4], ratio: 0.2, minA: 2, speed: 0.4, rise: 0.12 });
fish.push({ n: 4, size: [0.3, 0.5], palette: 'carp', y: POOL.water - 0.2, dist: (x, z) => (poolD(x, z) - 1) * 24, margin: 1.2, k: 1, rot: 2, area: [POOL.c[0] + 10, POOL.c[1] - 14, POOL.c[0] + 36, POOL.c[1] + 4], a: [8, 4], ratio: 0.2, minA: 2, speed: 0.5, rise: 0.12 });
const flights = [
  { kind: 'swallow', n: 7, lane: { a: [-90, 20], b: [90, 20] }, y: [1, 5], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [10, 35], a: [50, 25], rot: 0.2 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-30, 5], a: [30, 14], rot: 0.5 }, y: [2, 9], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [50, 30], a: [26, 18], rot: -0.3 }, y: [3, 10], speed: 9 },
  { kind: 'goose', n: 9, loop: { c: [20, 30], a: [55, 22], rot: 0.1 }, y: [9, 22], speed: 11 },
  { kind: 'goose', n: 6, loop: { c: [-40, 40], a: [40, 20], rot: -0.4 }, y: [6, 16], speed: 10 },
  { kind: 'parrot', n: 4, loop: { c: [0, -24], a: [24, 8], rot: 0 }, y: [2, 8], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [0, -55], a: [70, 25], rot: 0 }, y: [28, 45], speed: 8 },
];
flights[0].a = [28, 6];
const perches = [], r = rng(31);
for (let k = 0; k < 22; k++) { const x = -80 + r() * 140, z = -20 + r() * 80; if (poolD(x, z) > 1.3) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.05, rot: r() * 3, range: [1.8, 1.6] }); }
for (const [x, z, y] of [[-12, -33, 4.2], [20, -34, 4.2], [-50, -35, 3.8], [0, -33, 3.0], [-6, -33.6, 3.3], [-54, -35, 3.3]]) perches.push({ kind: 'sparrow', x, z, y, rot: 0, range: [1.5, 0], alert: 5 });
for (const [a, rot] of [[0.6, 1.0], [2.4, 4.0], [4.2, 2.0], [1.4, 0.5], [3.3, 2.5], [5.2, 3.5], [5.9, 1.2]]) { const x = POOL.c[0] + Math.cos(a) * POOL.a * 1.08, z = POOL.c[1] + Math.sin(a) * POOL.b * 1.08; perches.push({ kind: 'egret', x, z, y: height(x, z), rot, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void CAMPS;
export default { fish, flights, perches };
