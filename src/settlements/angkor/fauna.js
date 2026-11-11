// Angkor — the animals (src/engine/fauna.js draws them; docs/settlements/angkor.md §17): carp in the
// moat and the village ponds, swallows over the moat, the road and the paddies, egrets standing at the
// pond edges and the moat's bank, crows over the temple's towers at dusk, sparrows on the road.
import { LEVEL, MOAT, CAUSEWAY, ponds, ROAD } from './layout.js';

const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
/** Negative inside the moat's water, positive outside. */
const moatDistance = (x, z) => {
  if (x > CAUSEWAY.outer[0] - 1 && x < CAUSEWAY.outer[2] + 1 && Math.abs(z) < 5.6) return 8;
  const o = Math.min(x - a0, a1 - x, z - b0, b1 - z), i = Math.max(c0 - x, x - c1, d0 - z, z - d1);
  return -Math.min(o, i);
};
const fish = [];
for (const [x0, z0, x1, z1] of [[a0, b0, a1, d0], [a0, d1, a1, b1], [a0, d0, c0, -6], [a0, 6, c0, d1], [c1, d0, a1, d1]]) {
  const alongX = x1 - x0 > z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.5, 0.8], palette: 'carp', y: LEVEL.moat, dist: moatDistance, margin: 1.4, k: 1, rot: alongX ? 0 : Math.PI / 2,
    area: alongX ? [x0 + 20, cz - 0.5, x1 - 20, cz + 0.5] : [cx - 0.5, z0 + 10, cx + 0.5, z1 - 10], a: [20, 2.6], ratio: 0.15, minA: 1.5, speed: 0.3, rise: 0.1 });
}
// the village ponds: small dark fish about the lotus
ponds().forEach((p) => {
  const [x0, z0, x1, z1] = p.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  fish.push({ n: 3, size: [0.25, 0.4], palette: 'carp', y: -0.7, area: [x0 + 1.5, z0 + 1.5, x1 - 1.5, z1 - 1.5], dist: (x, z) => -Math.min(x - x0, x1 - x, z - z0, z1 - z), margin: 1.0, a: [(x1 - x0) / 2 - 2, (z1 - z0) / 2 - 2], ratio: 0.7, speed: 0.25, rise: 0.3 });
  void cx; void cz;
});
const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, -8], b: [-200, 8] }, y: [1.5, 8], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-193, -200], b: [-193, 200] }, y: [-0.5, 6], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-190, 203], b: [243, 203] }, y: [-0.5, 6], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-190, -203], b: [243, -203] }, y: [-0.5, 6], speed: 9 },
  { kind: 'crow', n: 8, loop: { c: [25, 0], a: [70, 60], rot: 0.2 }, y: [70, 40], speed: 8 },
];
flights[0].a = flights[1].a = flights[2].a = flights[3].a = [30, 4];
const perches = [];
// sparrows on the beaten earth of the road
for (const [x, z] of [[-193, -120], [-193, -60], [-193, 70], [-193, 130], [-100, 203], [60, 203], [-80, -203], [120, -203], [243, 20], [243, -90]]) perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.4 + (x * 7 % 3), range: [1.4, 1.3] });
// egrets at the edges of the ponds, facing the water
ponds().forEach((p, i) => { if (i % 2) return; const [x0, z0, x1, z1] = p.rect; perches.push({ kind: 'egret', x: (x0 + x1) / 2, z: z0 - 0.4, y: 0, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); });
void ROAD;
export default { fish, flights, perches };
