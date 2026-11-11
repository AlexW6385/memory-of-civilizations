// Sanchi — the animals (src/engine/fauna.js draws them; docs/settlements/sanchi.md §12–13): swifts and swallows circling the dome and
// the gateways and skimming the tank, crows over the hill and the village, sparrows on the paving, the stalls' awnings and the
// ridges and parapets along the streets, carp in the tank, egrets and a heron at its margin and in the plain's fields.
import { TEMPLE40, TANK, tankD, lots } from './layout.js';
import { SUMMIT_STALLS } from './summit.js';
import { ground } from './ground.js';

const area = [TANK.c[0] - TANK.r[0], TANK.c[1] - TANK.r[1], TANK.c[0] + TANK.r[0], TANK.c[1] + TANK.r[1]];
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 3, size: [0.45, 0.7], palette: 'carp', y: TANK.level, area, dist: tankD, margin: 2.5, a: [24, 11], ratio: 0.5, speed: 0.3, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 0], a: [34, 30], rot: 0.2 }, y: [26, 38], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [20, 10], a: [70, 40], rot: 0.5 }, y: [24, 34], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-140, 0], a: [30, 24], rot: 0.1 }, y: [4, 12], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [TANK.c[0], TANK.c[1]], a: [44, 20], rot: 0, dist: tankD, margin: 3 }, y: [0.4, 2.2], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [0, 20], a: [140, 100], rot: 0.4 }, y: [55, 85], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, 175], a: [90, 40], rot: 0.2 }, y: [10, 24], speed: 8 },
];
const perches = [];
// sparrows on the paving: round the stupa's ground walk, at the south gate, the monastery court, the temple platform's steps, along the way and its stalls
const spots = [[-17, 8], [16, -10], [3, -22], [-4, 25], [10, 30], [-10, 40], [30, 8], [49, 8], [44, 24], [TEMPLE40.c[0] - 25, 62], [-60, 20], [60, -60], [-30, -50], [5, -90], [-140, -30], [-120, 10], [-60, 150], [20, 140], [90, 160], [-20, 190], [2, 54], [-3, 69], [3, 85], [0, 100], [4, 131], [-5, 146]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.04, rot: (x * 7) % 3, range: [1.8, 1.6], alert: 5 });
// on the stalls' ridges
for (const [x, z] of SUMMIT_STALLS.filter((_, i) => i % 3 === 0)) perches.push({ kind: 'sparrow', x, z, y: 22 + 3.4, rot: 1.57, range: [2.6, 0], alert: 6 });
// sparrows and crows on the ridges and parapets along the streets, a share of the houses
{
  let n = 0;
  for (const l of lots()) {
    if (!l.main || n > 34 || (l.seed % 3) || l.farm) continue;
    const [x0, z0, x1, z1] = l.rect;
    perches.push({ kind: n % 4 === 3 ? 'crow' : 'sparrow', x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: l.kind === 'mud' ? 3.95 : l.kind === 'merchant' ? 7.2 : 4.7, rot: l.seed % 6, range: [2.4, 0], alert: 6 });
    n++;
  }
}
// egrets in the plain's fields south-west of the village; an egret and a heron at the tank's margin
for (const [x, z] of [[-60, 255], [40, 268]]) perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: 0.8, stay: [80, 240], gone: [40, 150], alert: 10 });
for (const [kind, a] of [['egret', -0.6], ['heron', 2.4]]) {
  let best = null;
  for (let d = 1; d < 4 && !best; d += 0.5) { const x = TANK.c[0] + Math.cos(a) * (TANK.r[0] + d), z = TANK.c[1] + Math.sin(a) * (TANK.r[1] + d); if (Math.abs(tankD(x, z) - 0.5) < 3.5) best = [x, z]; }
  if (best) { const [x, z] = best; perches.push({ kind, x, z, y: ground.height(x, z), rot: Math.atan2(TANK.c[1] - z, TANK.c[0] - x), stay: [80, 240], gone: [40, 150], alert: 10 }); }
}
export default { fish, flights, perches };
