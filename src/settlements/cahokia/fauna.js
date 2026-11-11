// Mississippian Cahokia — the animals (src/engine/fauna.js; docs/settlements/cahokia.md §5.6): fish
// (carp, buffalo and catfish) in Cahokia Creek, swallows over the plaza and the creek, crows about the
// fields and the town at dusk, an egret and a heron on the creek's bank, sparrows on the packed clay.
import { RADIUS, CREEK, creekZ, PLAZA, height } from './layout.js';

const inCreekDist = (x, z) => Math.abs(z - creekZ(x)) - (CREEK.w / 2 - 2);
const fish = [];
for (let i = 0; i < 6; i++) {
  const x = -300 + i * 120;
  fish.push({ n: 3, size: [0.5, 0.8], palette: 'carp', y: CREEK.level, dist: inCreekDist, margin: 1.2, k: 1, rot: 0, area: [x - 40, creekZ(x) - 0.5, x + 40, creekZ(x) + 0.5], a: [20, 3], ratio: 0.15, minA: 1.5, speed: 0.3, rise: 0.2 });
}
const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, -360], b: [200, -360] }, y: [0.5, 4], speed: 9, a: [30, 8] },
  { kind: 'swallow', n: 3, loop: { c: [0, 60], a: [60, 40], rot: 0 }, y: [3, 9], speed: 8 },
  { kind: 'crow', n: 7, loop: { c: [-60, 100], a: [90, 60], rot: 0.4 }, y: [26, 12], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [200, -60], a: [70, 50], rot: 1.1 }, y: [24, 10], speed: 9 },
];
const perches = [];
for (const [x, z] of [[-60, 60], [20, 90], [-20, -10], [70, 40], [-90, 120], [50, 130]]) perches.push({ kind: 'sparrow', x, z, y: 0.02, rot: 0, range: [2.4, 0], alert: 5 });
perches.push({ kind: 'heron', x: -40, z: creekZ(-40) + CREEK.w / 2 + 0.8, y: height(-40, creekZ(-40) + CREEK.w / 2 + 0.8), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: 90, z: creekZ(90) + CREEK.w / 2 + 0.8, y: height(90, creekZ(90) + CREEK.w / 2 + 0.8), rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void RADIUS; void PLAZA;
export default { fish, flights, perches };
