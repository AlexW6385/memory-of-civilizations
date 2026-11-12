// Mississippian Cahokia — the animals (src/engine/fauna.js; docs/settlements/cahokia.md §5.6): fish
// (carp, buffalo and catfish) in Cahokia Creek, swallows over the plaza and the creek, crows about the
// fields and the town at dusk, an egret and a heron on the creek's bank, sparrows on the packed clay.
import { RADIUS, CREEK, PONDS, creekZ, PLAZA, height, lots, inPond } from './layout.js';
import { fieldRects } from './town.js';

const inCreekDist = (x, z) => Math.abs(z - creekZ(x)) - (CREEK.w / 2 - 2);
const fish = [];
for (let i = 0; i < 6; i++) {
  const x = -300 + i * 120;
  fish.push({ n: 3, size: [0.5, 0.8], palette: 'carp', y: CREEK.level, dist: inCreekDist, margin: 1.2, k: 1, rot: 0, area: [x - 40, creekZ(x) - 0.5, x + 40, creekZ(x) + 0.5], a: [20, 3], ratio: 0.15, minA: 1.5, speed: 0.3, rise: 0.2 });
}
// carp in the borrow pits
for (const [cx, cz, rx, rz] of PONDS) fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: CREEK.level, dist: (x, z) => 0.8 * Math.min(rx, rz) * (0.8 - Math.hypot((x - cx) / rx, (z - cz) / rz)), margin: 1.0, k: 1, rot: 0, area: [cx - rx * 0.7, cz - rz * 0.7, cx + rx * 0.7, cz + rz * 0.7], a: [5, 4], ratio: 0.4, minA: 1.2, speed: 0.25, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 4, loop: { c: PONDS[0].slice(0, 2), a: [40, 25], rot: 0.3 }, y: [0.5, 4], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: PONDS[1].slice(0, 2), a: [36, 22], rot: 1.0 }, y: [0.5, 4], speed: 8 },
  ...fieldRects().filter((_, i) => i % 5 === 0).slice(0, 3).map((r, i) => ({ kind: 'crow', n: 4, loop: { c: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], a: [30, 22], rot: i }, y: [10, 5], speed: 8 })),
  { kind: 'swallow', n: 4, lane: { a: [-200, -360], b: [200, -360] }, y: [0.5, 4], speed: 9, a: [30, 8] },
  { kind: 'swallow', n: 3, loop: { c: [0, 60], a: [60, 40], rot: 0 }, y: [3, 9], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [-25, -85], a: [70, 45], rot: 0.2 }, y: [6, 22], speed: 8.5 },
  { kind: 'crow', n: 7, loop: { c: [-60, 100], a: [90, 60], rot: 0.4 }, y: [26, 12], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [200, -60], a: [70, 50], rot: 1.1 }, y: [24, 10], speed: 9 },
];
const perches = [];
for (const [x, z] of [[-60, 60], [20, 90], [-30, -30], [70, 40], [-90, 120], [50, 130]]) perches.push({ kind: 'sparrow', x, z, y: 0.02, rot: 0, range: [2.4, 0], alert: 5 });
perches.push({ kind: 'heron', x: -40, z: creekZ(-40) + CREEK.w / 2 + 0.8, y: height(-40, creekZ(-40) + CREEK.w / 2 + 0.8), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: 90, z: creekZ(90) + CREEK.w / 2 + 0.8, y: height(90, creekZ(90) + CREEK.w / 2 + 0.8), rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
// sparrows about the houses and the traders' mats; herons and egrets at the pits
const L = lots().filter((l) => Math.hypot(l.rect[0], l.rect[1]) < 200);
for (let i = 0; i < 14; i++) { const l = L[(i * 53) % L.length], x = l.rect[2] + 1.5, z = (l.rect[1] + l.rect[3]) / 2; if (!inPond(x, z)) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.02, rot: 0, range: [2.0, 0], alert: 5 }); }
for (const [x, z] of [[-105, 20], [105, 60], [-105, 100], [60, 142], [-60, 142]]) perches.push({ kind: 'sparrow', x, z, y: 0.02, rot: 0, range: [2.4, 0], alert: 5 });
for (const [i, kind] of [[0, 'heron'], [1, 'egret'], [3, 'heron']]) { const [cx, cz, rx, rz] = PONDS[i], x = cx + rx * 0.95, z = cz; perches.push({ kind, x, z, y: height(x, z), rot: Math.PI, stay: [80, 240], gone: [40, 150], alert: 10 }); void rz; }
void RADIUS; void PLAZA;
export default { fish, flights, perches };
