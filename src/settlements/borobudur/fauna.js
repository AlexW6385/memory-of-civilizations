// Sailendra Java — the animals (src/engine/fauna.js draws them; docs/settlements/borobudur.md §15): little egrets
// standing in the paddies, swallows over the paddies and about the monument's terraces, crows over the monastery,
// sparrows on the monument's balustrades and the monastery's roofs-edge, an egret at the paddies' edge.
import { MONUMENT, SQUARES, MONASTERY, HAMLETS } from './layout.js';
import { ground } from './ground.js';

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [95, 95], rot: 0 }, y: [3, 24], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-170, 150], a: [80, 40], rot: 0.5 }, y: [0.8, 4], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [180, -140], a: [70, 40], rot: -0.4 }, y: [0.8, 4], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [(MONASTERY[0] + MONASTERY[2]) / 2, (MONASTERY[1] + MONASTERY[3]) / 2], a: [40, 30], rot: 0.2 }, y: [26, 10], speed: 9 },
];
// more swallows low over the way's paddies where the visitor arrives, and sparrows on the roofs of its stalls
flights.push({ kind: 'swallow', n: 5, loop: { c: [170, 0], a: [90, 45], rot: 0 }, y: [0.8, 5], speed: 8 });
const perches = [];
// sparrows on the first balustrade's coping and the lower terraces, hopping along them
const B = MONUMENT.base;
for (const [x, z, rot, y] of [[0, -(SQUARES[0].a + 0.2), 0, SQUARES[0].y + 1.7 + 0.2], [0, SQUARES[1].a, 0, SQUARES[1].y + 1.5 + 0.2], [-(SQUARES[2].a), 0, Math.PI / 2, SQUARES[2].y + 1.5 + 0.2], [B.a + 0.2, 20, Math.PI / 2, B.h + 1.7 + 0.2]]) perches.push({ kind: 'sparrow', x: x + (x === 0 ? 14 : 0), z: z + (z === 0 ? 14 : 0), y, rot, range: [2.6, 0], alert: 5 });
// egrets in the paddies, on the bunds between them (the ground's own height there)
for (const [x, z, rot] of [[120, 120, 0.4], [-200, 120, 2.0], [100, -190, 1.1], [-180, -60, 0.2], [210, 40, 2.6]]) {
  perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot, stay: [80, 240], gone: [40, 150], alert: 10 });
}
// egrets by the way, in the paddies on its either hand (the ground's height there is the way's, level)
for (const [x, z, rot] of [[112, 24, 0.5], [150, -26, 1.8], [190, 28, 2.4], [235, -28, 0.9], [95, -30, 3.0], [260, 30, 1.2]]) perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot, stay: [80, 240], gone: [40, 150], alert: 9 });
for (const [x, z, rot] of [[-176, -150, 0.3], [-182, -162, 1.1], [-150, -118, 2.0]]) perches.push({ kind: 'sparrow', x, z, y: 3.1, rot, range: [3, 0], alert: 5 });
void HAMLETS;
export default { fish: [], flights, perches };
