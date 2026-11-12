// Çatalhöyük — the animals (src/engine/fauna.js draws them; docs/settlements/catalhoyuk.md §8): swallows over the roofs and the marsh,
// cranes and herons in the shallows [inferred: the Konya Plain's wetland birds], ducks on the pools, sparrow stand-ins on the roof lips,
// small fish in the pools, crows high over the plain.
import { POOLS, MARSH, CLUSTER, TOP, KIND, colX, rowZ, CW, CD } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (const [cx, cz, a, b] of POOLS.slice(0, 5)) fish.push({ n: 4, size: [0.12, 0.3], palette: 'carp', y: MARSH.water, dist: (x, z) => Math.max(0.5, (1 - Math.sqrt(((x - cx) / a) ** 2 + ((z - cz) / b) ** 2)) * Math.min(a, b)), margin: 0.5, k: 1, rot: 0, area: [cx - a * 0.7, cz - b * 0.7, cx + a * 0.7, cz + b * 0.7], a: [a * 0.5, b * 0.5], ratio: 0.5, minA: 2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, -4], a: [50, 38], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [-80, 0], b: [80, 0] }, y: [0.8, 4], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [10, 20], a: [70, 40], rot: 0.5 }, y: [26, 50], speed: 8 },
];
flights[1].a = [26, 3];
const perches = [];
for (const [cx, cz, a, b] of POOLS.slice(0, 4)) perches.push({ kind: 'egret', x: cx + a * 0.8, z: cz, y: ground.height(cx + a * 0.8, cz), rot: 1.2, stay: [60, 200], gone: [60, 160], alert: 10 });
for (let i = 0; i < KIND.length; i++) for (let j = 0; j < KIND[0].length; j++) {
  if ((i * 3 + j * 5) % 3 !== 0) continue;
  if (KIND[i][j] !== 'h') continue;
  perches.push({ kind: 'sparrow', x: colX(j) + CW[j] * 0.7, z: rowZ(i) + CD[i] * 0.2, y: TOP[i][j] + 0.3, rot: 0, range: [1.2, 0], alert: 5 });
}
// herons in the shallows of the further pools, swallows hawking over the pens and the marsh, a loop of crows over the middens
for (const [cx, cz, a, b] of POOLS.slice(4, 7)) perches.push({ kind: 'heron', x: cx + a * 0.6, z: cz - b * 0.4, y: ground.height(cx + a * 0.6, cz - b * 0.4), rot: 2.2, stay: [80, 240], gone: [60, 160], alert: 12 });
for (const [cx, cz, a, b] of POOLS.slice(0, 4)) flights.push({ kind: 'swallow', n: 3, loop: { c: [cx, cz], a: [a * 0.9, b * 0.9], rot: 0.3 }, y: [0.6, 2.2], speed: 8 });
flights.push({ kind: 'crow', n: 3, loop: { c: [0, 0], a: [34, 28], rot: 1.2 }, y: [9, 18], speed: 7 });
void CLUSTER;
export default { fish, flights, perches };
