// Khajuraho about 1050 — the animals (src/engine/fauna.js draws them; docs/settlements/khajuraho.md §12): carp in
// the Shivsagar tank, swallows over its water, crows about the village, sparrows on the temple terraces,
// an egret and a heron at the tank's margin.
import { TANK, TEMPLES, tankD, height, lots } from './layout.js';
import { porchOf } from './life.js';

const area = [TANK.c[0] - TANK.r[0], TANK.c[1] - TANK.r[1], TANK.c[0] + TANK.r[0], TANK.c[1] + TANK.r[1]];
const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 3, size: [0.5, 0.75], palette: 'carp', y: TANK.level, area, dist: tankD, margin: 2.5, a: [26, 12], ratio: 0.5, speed: 0.3, rise: 0.15 });

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [TANK.c[0], TANK.c[1]], a: [48, 22], rot: 0, dist: tankD, margin: 3 }, y: [0.4, 2.2], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [TANK.c[0] + 10, TANK.c[1] - 4], a: [30, 14], rot: 0.4, dist: tankD, margin: 3 }, y: [0.5, 3], speed: 7 },
  { kind: 'crow', n: 6, loop: { c: [150, 10], a: [70, 50], rot: 0.3 }, y: [28, 10], speed: 9 },
];
const perches = [];
for (const t of TEMPLES) {
  const T = t.terrace || [t.c[0] - t.w * 0.85, t.c[1] - t.w * 0.95, t.c[0] + t.len + 4, t.c[1] + t.w * 0.95];
  perches.push({ kind: 'sparrow', x: (T[0] + T[2]) / 2 - 2, z: T[3] - 1.2, y: t.jagati + (t.y ?? 0), rot: 0, range: [2.4, 0], alert: 5 });
}
// the rock pigeons of the temples: on the first ledge of the porch roofs (Kandariya, Jagadambi, Chitragupta) and in the air about the tower;
// black kites turning high over the village
for (const t of TEMPLES.slice(0, 3)) {
  const { r, ceil, cz } = porchOf(t);
  for (const sz of [-1, 1]) perches.push({ kind: 'pigeon', x: (r[0] + r[2]) / 2 + sz * 0.8, z: cz + sz * ((r[3] - r[1]) / 2 + 0.3), y: ceil + 0.45 + (t.y ?? 0), rot: sz > 0 ? 1.6 : 4.7, range: [3, 0], alert: 6 });
}
flights.push({ kind: 'pigeon', n: 5, loop: { c: [TEMPLES[0].c[0] + 6, TEMPLES[0].c[1]], a: [30, 22], rot: 0.2 }, y: [18, 10], speed: 8 });
flights.push({ kind: 'kite', n: 2, loop: { c: [120, 20], a: [110, 70], rot: 0.5 }, y: [60, 20], speed: 7 });
// sparrows and crows on the ridges and parapets along the bazaar road, a share of the houses
{
  let n = 0;
  for (const l of lots()) {
    if (!l.main || n > 26 || (l.seed % 3)) continue;
    const [x0, z0, x1, z1] = l.rect, flat = l.kind === 'mud' || l.kind === 'haveli';
    perches.push({ kind: n % 4 === 3 ? 'crow' : 'sparrow', x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: flat ? (l.kind === 'haveli' ? 6.9 : 3.95) : 4.7, rot: l.seed % 6, range: [2.4, 0], alert: 6 });
    n++;
  }
}
for (const [kind, a] of [['egret', -0.6], ['heron', 2.2]]) {
  let best = null;
  for (let d = 1; d < 4 && !best; d += 0.5) { const x = TANK.c[0] + Math.cos(a) * (TANK.r[0] + d), z = TANK.c[1] + Math.sin(a) * (TANK.r[1] + d); if (Math.abs(tankD(x, z) - 0.5) < 3.5) best = [x, z]; }
  if (best) { const [x, z] = best; perches.push({ kind, x, z, y: height(x, z), rot: Math.atan2(TANK.c[1] - z, TANK.c[0] - x), stay: [80, 240], gone: [40, 150], alert: 10 }); }
}
export default { fish, flights, perches };
