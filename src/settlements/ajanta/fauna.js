// Ajanta — the animals (src/engine/fauna.js; docs/settlements/ajanta.md §9): swifts and swallows over the river and the pocket
// [inferred: cliff-nesting birds], kites and ravens high along the rim, sparrows at the village and on the ledge, an egret
// in the shallows, small fish in the Waghora.
import { RIVER, riverX, XF, VILLAGE, FALL, FLOOR, GHATS } from './layout.js';
import { ground } from './ground.js';
import { lots } from './town.js';

const fish = [];
for (let z = -60; z <= 60; z += 40) fish.push({ n: 3, size: [0.12, 0.2], palette: 'carp', y: RIVER.water, dist: (x, zz) => Math.abs(x - riverX(zz)) - RIVER.w / 2, margin: 0.5, k: 1, rot: 0, area: [riverX(z) - 0.4, z - 12, riverX(z) + 0.4, z + 12], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 7, loop: { c: [XF + 30, 0], a: [34, 40], rot: 0 }, y: [3, 24], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [XF + 10, -50], b: [XF + 10, 50] }, y: [8, 26], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [XF - 10, 0], a: [40, 110], rot: 0 }, y: [38, 62], speed: 8 },
];
flights[1].a = [26, 3];
flights.push({ kind: 'swallow', n: 6, lane: { a: [XF + 20, -50], b: [XF + 20, 50] }, y: [1, 6], speed: 8 });
flights.push({ kind: 'swallow', n: 5, loop: { c: [VILLAGE[0] + 30, 40], a: [28, 30], rot: 0.4 }, y: [4, 14], speed: 8 });
flights.push({ kind: 'crow', n: 4, loop: { c: [VILLAGE[0] + 30, 40], a: [40, 36], rot: 0.2 }, y: [16, 30], speed: 7 });
const perches = [];
// sparrows on the ledge's kerb and the shelves of the niches, on the huts' ridges and by the washing places
for (const z of [-40, -12, 6, 22, 33, 44, 52]) perches.push({ kind: 'sparrow', x: XF + 5.7, z, y: FLOOR[1] + 0.52, rot: z % 3, range: [1.6, 0] });
lots().forEach((l, k) => { if (k % 3 === 0) perches.push({ kind: 'sparrow', x: (l.rect[0] + l.rect[2]) / 2, z: (l.rect[1] + l.rect[3]) / 2, y: 8 + (l.variant === 3 ? 3.2 : 3.85), rot: k, range: [l.variant === 3 ? 1.6 : 0.8, 0], alert: 5 }); });
for (const gz of GHATS) perches.push({ kind: 'sparrow', x: riverX(gz) - 6.0, z: gz + 2.8, y: 0.12, rot: gz % 3, range: [1.2, 1.2] });
// herons and egrets in the Waghora's shallows
perches.push({ kind: 'egret', x: riverX(-5) + 3.8, z: -5, y: -0.6, rot: 1.2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: riverX(55) - 3.5, z: 55, y: -0.6, rot: -1.0, stay: [90, 260], gone: [80, 200], alert: 12 });
for (const [x, z] of [[VILLAGE[0] + 8, 30], [VILLAGE[0] + 20, 36], [VILLAGE[0] + 30, 22], [XF + 3, -20], [XF + 3.5, 10], [XF + 4, 40], [-48, -30], [-48, 20]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// the egret in the shallows of the waterfall's pool, facing the water
{ const x = FALL.pool[0] + 3.5, z = FALL.pool[1] + 2; perches.push({ kind: 'egret', x, z, y: -0.6, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
export default { fish, flights, perches };
