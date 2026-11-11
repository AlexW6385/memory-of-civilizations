// Qufu — the animals (src/engine/fauna.js; docs/settlements/lu-qufu.md §8): the crows and magpies of the temple's old cypresses over the roofs, swallows over
// the Bishui pool and Queli Street, sparrows on the paving of the courts and the lanes, a heron at the pool's edge, carp in the pool.
import { POOL, POOL_Y, ALTAR, MX } from './layout.js';

const poolDist = (x, z) => Math.min(x - POOL[0], POOL[2] - x, z - POOL[1], POOL[3] - z) - 1.5;
const fish = [];
for (let i = 0; i < 3; i++) fish.push({ n: 4, size: [0.3, 0.7], palette: i ? 'redcarp' : 'carp', y: POOL_Y, area: [POOL[0] + 3, POOL[1] + 3, POOL[2] - 3, POOL[3] - 3], dist: poolDist, margin: 1.5, a: [12, 10], ratio: 0.5, speed: 0.35, rise: 0.3 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 98], a: [34, 22], rot: 0 }, y: [1.5, 8], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [0, 150], b: [0, 255] }, y: [2, 11], speed: 9, half: 12 },
  { kind: 'crow', n: 7, loop: { c: [0, -130], a: [80, 60], rot: 0 }, y: [40, 24], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [0, 60], a: [80, 50], rot: 0.3 }, y: [30, 18], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [MX, -40], a: [60, 70], rot: 0.5 }, y: [26, 16], speed: 8 },
];
const perches = [];
for (const [x, z] of [[8, -60], [-8, -92], [12, 40], [-14, 70], [4, 110], [-30, 20], [20, -20], [0, 150], [-12, 200], [12, 225], [ALTAR.c[0] + 9, ALTAR.c[1] + 8], [-60, -30], [50, 90], [MX, 90], [MX - 20, 0], [-130, 60], [-130, -100], [-60, 200]])
  perches.push({ kind: 'sparrow', x, z, y: 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'heron', x: POOL[2] + 1.5, z: POOL[1] + 8, y: 0.1, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
