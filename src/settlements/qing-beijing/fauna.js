// Ming–Qing Beijing — the animals (src/engine/fauna.js draws them; docs/settlements/qing-beijing.md §18):
// carp in the moat, house swallows over the lanes and the moat (late summer: few), tree sparrows on
// the paving of the lanes and the copings of the courtyard walls, crows circling the palace's roofs
// at dusk. Pigeons (the whistled flocks of the lanes) are wanted by the engine: it has no pigeon yet
// (see the report); they stand in the sound, music.js.
import { LEVEL, MOAT, RING, AVENUE, WALL, inForecourt, NOTCH } from './layout.js';

const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
/** Negative inside the moat's water (its distance from either bank), positive outside. */
const moatDistance = (x, z) => {
  if (inForecourt(x, z)) return 8;
  const o = Math.min(x - a0, a1 - x, z - b0, b1 - z);
  const i = Math.max(c0 - x, x - c1, d0 - z, z - d1);
  return -Math.min(o, i);
};

const fish = [];
// dark carp (li) lazing along the four sides of the moat, in the middle of the water
// (the south side is two reaches, either side of the Meridian Gate's forecourt)
for (const [x0, z0, x1, z1] of [[a0, b0, a1, d0], [a0, d1, -NOTCH.x - 2, b1], [NOTCH.x + 2, d1, a1, b1], [a0, d0, c0, d1], [c1, d0, a1, d1]]) {
  const alongX = x1 - x0 > z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < 3; i++) fish.push({
    n: 2, size: [0.6, 0.85], palette: 'carp', y: LEVEL.moat, dist: moatDistance, margin: 1.4, k: 1, rot: alongX ? 0 : Math.PI / 2,
    area: alongX ? [x0 + Math.min(30, (x1 - x0) / 3), cz - 0.5, x1 - Math.min(30, (x1 - x0) / 3), cz + 0.5] : [cx - 0.5, z0 + 30, cx + 0.5, z1 - 30], a: [20, 2.6], ratio: 0.15, minA: 1.5, speed: 0.3, rise: 0.1,
  });
}

const flights = [
  // swallows over the avenue and the ring street's south side, and along the moat
  { kind: 'swallow', n: 3, lane: { a: [-130, 212], b: [130, 212] }, y: [1.5, 9], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [0, 215], b: [0, 370] }, y: [2, 10], speed: 9 },
  { kind: 'swallow', n: 2, lane: { a: [-127, -200], b: [-127, 190] }, y: [-0.5, 3], speed: 8 },
  // swallows hawking over the great court
  { kind: 'swallow', n: 3, lane: { a: [-88, 60], b: [88, 60] }, y: [2.5, 11], speed: 9 },
  { kind: 'swallow', n: 2, lane: { a: [-60, 100], b: [60, 100] }, y: [3, 12], speed: 9 },
  // crows at dusk, wheeling over the Hall of Supreme Harmony and the courts
  { kind: 'crow', n: 9, loop: { c: [0, -10], a: [70, 55], rot: 0.3 }, y: [38, 16], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [-50, 90], a: [45, 30], rot: -0.4 }, y: [26, 12], speed: 8 },
];
flights[0].a = flights[1].a = flights[2].a = [30, 4];
flights[3].a = flights[4].a = [30, 4];

const perches = [];
// tree sparrows on the paving of the lanes and the avenue
for (const [x, z] of [[-60, 202], [-20, 201], [40, 202], [100, 203], [-180, 118], [-90, 60], [90, 60], [-160, 175], [160, 175], [-8, 250], [8, 300], [-8, 340], [-214, 40], [214, -40], [-290, 90], [290, 10]])
  perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.3 + (x * 7 % 3), range: [1.4, 1.3] });
// ...and in the great court's brick, in its corners and along the galleries' feet, hopping off before the visitor
for (const [x, z] of [[-24, 56], [26, 58], [-46, 74], [50, 70], [-30, 96], [34, 94], [-84, 58], [84, 78], [-8, 132], [10, 150], [-40, 150], [44, 156]])
  perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.6 + (x * 5 % 3), range: [1.6, 1.4], alert: 6 });
// ...and on the red wall's yellow coping, 8.5 m up, hopping along it
for (const [x, z, rot] of [[-40, WALL.rect[3], 0], [60, WALL.rect[3], 0], [WALL.rect[0], 20, Math.PI / 2], [WALL.rect[2], -80, Math.PI / 2], [-60, WALL.rect[1], 0]])
  perches.push({ kind: 'sparrow', x, z, y: WALL.h + 0.9, rot, range: [2.6, 0], alert: 5 });
// herons standing at the moat's edge (the coping of the walls is 0.05 above the street), watching for the carp
for (const [x, z, rot] of [[a0 - 0.6, -60, 0], [a1 + 0.6, 30, 0], [-50, b0 - 0.6, 1.5], [60, b1 + 0.6, 1.5]])
  perches.push({ kind: 'heron', x, z, y: 0.05, rot, range: [1.0, 0.5], stay: [60, 150], gone: [40, 120] });
void RING; void AVENUE;
export default { fish, flights, perches };
