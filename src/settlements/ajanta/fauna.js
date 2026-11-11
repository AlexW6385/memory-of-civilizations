// Ajanta — the animals (src/engine/fauna.js; docs/settlements/ajanta.md §9): swifts and swallows over the river and the pocket
// [inferred: cliff-nesting birds], kites and ravens high along the rim, sparrows at the village and on the ledge, an egret
// in the shallows, small fish in the Waghora.
import { RIVER, riverX, XF, VILLAGE, FALL } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (let z = -60; z <= 60; z += 40) fish.push({ n: 3, size: [0.12, 0.2], palette: 'carp', y: RIVER.water, dist: (x, zz) => Math.abs(x - riverX(zz)) - RIVER.w / 2, margin: 0.5, k: 1, rot: 0, area: [riverX(z) - 0.4, z - 12, riverX(z) + 0.4, z + 12], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 7, loop: { c: [XF + 30, 0], a: [34, 40], rot: 0 }, y: [3, 24], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [XF + 10, -50], b: [XF + 10, 50] }, y: [8, 26], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [XF - 10, 0], a: [40, 110], rot: 0 }, y: [38, 62], speed: 8 },
];
flights[1].a = [26, 3];
const perches = [];
for (const [x, z] of [[VILLAGE[0] + 8, 30], [VILLAGE[0] + 20, 36], [VILLAGE[0] + 30, 22], [XF + 3, -20], [XF + 3.5, 10], [XF + 4, 40], [-48, -30], [-48, 20]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// the egret in the shallows of the waterfall's pool, facing the water
{ const x = FALL.pool[0] + 3.5, z = FALL.pool[1] + 2; perches.push({ kind: 'egret', x, z, y: -0.6, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
export default { fish, flights, perches };
