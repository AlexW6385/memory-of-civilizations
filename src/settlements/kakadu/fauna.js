// Ubirr — the animals (src/engine/fauna.js; docs/settlements/kakadu.md §4): wood swallows over the plain, kites high over the rock (crow
// stand-ins), small birds in the grass and on the rock, egrets (the white egrets of the billabong) at its margin, barramundi and catfish
// (carp stand-ins) in the water. Magpie geese are standing figures in town.js.
import { POOL, poolD, CAMPS, height, rng } from './layout.js';

const fish = [];
fish.push({ n: 4, size: [0.3, 0.55], palette: 'carp', y: POOL.water - 0.2, dist: (x, z) => (poolD(x, z) - 1) * 24, margin: 1.2, k: 1, rot: 0, area: [POOL.c[0] - 20, POOL.c[1] - 8, POOL.c[0] + 20, POOL.c[1] + 8], a: [9, 4], ratio: 0.2, minA: 2, speed: 0.5, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 7, lane: { a: [-90, 20], b: [90, 20] }, y: [1, 5], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [10, 35], a: [50, 25], rot: 0.2 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [0, -55], a: [70, 25], rot: 0 }, y: [28, 45], speed: 8 },
];
flights[0].a = [28, 6];
const perches = [], r = rng(31);
for (let k = 0; k < 10; k++) { const x = -70 + r() * 140, z = -20 + r() * 80; if (poolD(x, z) > 1.3) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.05, rot: r() * 3, range: [1.8, 1.6] }); }
for (const [x, z, y] of [[-12, -33, 4.2], [20, -34, 4.2], [-50, -35, 3.8]]) perches.push({ kind: 'sparrow', x, z, y, rot: 0, range: [1.5, 0], alert: 5 });
for (const [a, rot] of [[0.6, 1.0], [2.4, 4.0], [4.2, 2.0]]) { const x = POOL.c[0] + Math.cos(a) * POOL.a * 1.08, z = POOL.c[1] + Math.sin(a) * POOL.b * 1.08; perches.push({ kind: 'egret', x, z, y: height(x, z), rot, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void CAMPS;
export default { fish, flights, perches };
