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
const perches = [];
// sparrows on the first balustrade's coping and the lower terraces, hopping along them
const B = MONUMENT.base;
for (const [x, z, rot, y] of [[0, -(SQUARES[0].a + 0.2), 0, SQUARES[0].y + 1.7 + 0.2], [0, SQUARES[1].a, 0, SQUARES[1].y + 1.5 + 0.2], [-(SQUARES[2].a), 0, Math.PI / 2, SQUARES[2].y + 1.5 + 0.2], [B.a + 0.2, 20, Math.PI / 2, B.h + 1.7 + 0.2]]) perches.push({ kind: 'sparrow', x: x + (x === 0 ? 14 : 0), z: z + (z === 0 ? 14 : 0), y, rot, range: [2.6, 0], alert: 5 });
// egrets in the paddies, on the bunds between them (the ground's own height there)
for (const [x, z, rot] of [[120, 120, 0.4], [-200, 120, 2.0], [100, -190, 1.1], [-180, -60, 0.2], [210, 40, 2.6]]) {
  perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot, stay: [80, 240], gone: [40, 150], alert: 10 });
}
void HAMLETS;
export default { fish: [], flights, perches };
