// Three Kingdoms Ye — the animals (src/engine/fauna.js; docs/settlements/wei-ye.md §8): carp in the Xuanwu pond, swallows over the pond, the garden and the
// avenue, crows over the terraces, sparrows on the paving, an egret and a heron at the water.
import { POND, POND_Y, RIVER, riverZ, SPARROW, height } from './layout.js';

const pondDist = (x, z) => Math.min(x - POND[0], POND[2] - x, z - POND[1], POND[3] - z) - 1.5;
const fish = [];
for (let i = 0; i < 3; i++) fish.push({ n: 4, size: [0.3, 0.6], palette: i ? 'redcarp' : 'carp', y: POND_Y, area: [POND[0] + 3, POND[1] + 3, POND[2] - 3, POND[3] - 3], dist: pondDist, margin: 1.5, a: [12, 10], ratio: 0.5, speed: 0.35, rise: 0.3 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [-110, -100], a: [60, 40], rot: 0.2 }, y: [1.5, 9], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [-230, 25], b: [230, 25] }, y: [2, 12], speed: 9, half: 20 },
  { kind: 'swallow', n: 4, loop: { c: [0, 100], a: [90, 50], rot: 0.5 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [-196, -88], a: [70, 60], rot: 0 }, y: [48, 30], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, -90], a: [60, 40], rot: 0.5 }, y: [34, 22], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-100, -60], [-120, -40], [-110, -108], [-20, 0], [20, -20], [0, -33], [-60, 30], [60, 30], [-100, 40], [100, 40], [-180, 30], [180, 10], [0, 100], [60, 120], [-60, 120], [-190, 100], [-200, -150], [150, -110], [170, 100]])
  perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'egret', x: POND[2] - 2, z: POND[1] + 10, y: POND_Y + 0.3, rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: 60, z: riverZ(60) + RIVER.w / 2 + 3, y: height(60, riverZ(60) + RIVER.w / 2 + 3) + 0.1, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void SPARROW;
export default { fish, flights, perches };
