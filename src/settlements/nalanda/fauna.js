// Nalanda — the animals (src/engine/fauna.js draws them; docs/settlements/nalanda.md §9–§10): carp in the tanks, swallows over the water and
// round the temple's top, doves on the library's roofs, crows over the groves, sparrows on the courts and terraces, egrets at the tanks' margins.
import { TANKS, LEVEL, T3, M1, LIBRARY, tankD, height } from './layout.js';

const tk = TANKS[0], area = [tk.rect[0], tk.rect[1], tk.rect[2], tk.rect[3]];
const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: LEVEL, area, dist: tankD, margin: 2.5, a: [10, 60], ratio: 0.3, speed: 0.3, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [T3.c[0], T3.c[1]], a: [34, 30], rot: 0.2 }, y: [22, 38], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [106, 0], a: [16, 70], rot: 0, dist: tankD, margin: 3 }, y: [0.5, 3], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [LIBRARY.c[0], LIBRARY.c[1]], a: [30, 20], rot: 0.3 }, y: [14, 40], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [0, 20], a: [150, 110], rot: 0.4 }, y: [45, 80], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [150, 100], a: [50, 40], rot: 0.9 }, y: [10, 24], speed: 8 },
];
const perches = [];
const [mx0, mz0, mx1, mz1] = M1.rect, mzc = (mz0 + mz1) / 2;
for (const [x, z, y] of [[mx0 + 24, mzc - 8, 0.04], [mx0 + 30, mzc + 8, 0.04], [mx0 + 14, mzc + 2, 0.04], [T3.c[0] + T3.half + 3, 12, 0.04], [T3.c[0] + T3.half + 8, -9, 0.04], [4, 20, 0.04], [-3, -40, 0.04], [30, 100, 0.04], [30, -100, 0.04], [-90, -80, 0.04], [T3.c[0], T3.c[1] + 8, 20.04], [T3.c[0] + 7, T3.c[1] - 5, 20.04]]) perches.push({ kind: 'sparrow', x, z, y, rot: (x * 7) % 3, range: [1.8, 1.6] });
for (const [x, z] of [[tk.rect[0] - 4.5, 40], [tk.rect[2] + 3, -30], [TANKS[1].rect[0] + 12, TANKS[1].rect[1] - 3.5]]) perches.push({ kind: 'egret', x, z, y: height(x, z), rot: 0.8, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
