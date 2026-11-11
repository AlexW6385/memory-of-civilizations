// Versailles — the animals (src/engine/fauna.js draws them; docs/settlements/versailles.md §10): carp in the Grand Canal's
// reach and the Latona basin's frogs' water, swallows and swifts over the parterres and the canal, pigeons (drawn as sparrows)
// on the Place d'Armes, the terrace and the stables' courts, crows round the chapel's roof at twilight, a heron on the quay.
import { CANAL, LATONA, LATONA_Y, PLACE, CHAPEL, STABLES, RISE, inCanal, height, lots, houseH } from './layout.js';

const fish = [];
for (let i = 0; i < 4; i++) fish.push({ n: 3, size: [0.5, 0.8], palette: 'carp', y: -1.4, dist: (x, z) => (inCanal(x, z) ? -3 : 3), margin: 1.5, area: [CANAL.end + 6, -14 + i * 6, CANAL.x0 - 6, -8 + i * 6], a: [8, 3], ratio: 0.3, speed: 0.3, rise: 0.05 });
fish.push({ n: 4, size: [0.2, 0.3], palette: 'goldfish', y: LATONA_Y + 0.15, dist: (x, z) => Math.hypot(x - LATONA[0], z - LATONA[1]) - 12, margin: 1, area: [LATONA[0] - 11, LATONA[1] - 11, LATONA[0] + 11, LATONA[1] + 11], a: [8, 8], ratio: 1, speed: 0.3, rise: 0.1 });

const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-330, 0], b: [-20, 0] }, y: [3, 14], speed: 10, half: 40 },
  { kind: 'swallow', n: 4, loop: { c: [-35, 0], a: [40, 50], rot: 0 }, y: [4, 16], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [180, 0], a: [40, 30], rot: 0.4 }, y: [6, 20], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [280, 0], a: [60, 40], rot: 0.2 }, y: [10, 26], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-200, 0], a: [50, 30], rot: 0 }, y: [3, 12], speed: 10 },
  { kind: 'crow', n: 7, loop: { c: [(CHAPEL[0] + CHAPEL[2]) / 2, (CHAPEL[1] + CHAPEL[3]) / 2], a: [30, 24], rot: 0.5 }, y: [RISE + 48, RISE + 30], speed: 9 },
];
const perches = [];
for (const [x, z] of [[-9, -30], [-8, 5], [-9, 30], [-40, 9.2], [-90, -9], [120, -30], [150, 14], [180, -20], [190, 36], [PLACE[0] + 30, -40]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.04, rot: x * 0.07, range: [1.5, 1.3] });
for (const s of STABLES) for (const dx of [20, 34]) perches.push({ kind: 'sparrow', x: s.x + dx, z: s.z + 3, y: RISE + 0.05, rot: dx, range: [2.0, 1.5] });
// the town: sparrows at the shop steps and on the kerbs, pigeons along the roof ridges, nearest the Place first
const near = lots().filter((l) => l.rect[0] < 330).sort((a, b) => a.rect[0] - b.rect[0] || a.rect[1] - b.rect[1]);
near.filter((l, i) => i % 5 === 0).slice(0, 26).forEach((l, i) => {
  const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, fz = l.front === 'n' ? z0 : z1, out = l.front === 'n' ? -1 : 1;
  perches.push({ kind: 'sparrow', x: cx + (i % 3 - 1) * 1.5, z: fz + out * 1.0, y: RISE + 0.06, rot: i, range: [1.4, 1.2] });
  if (i % 2 === 0) perches.push({ kind: 'sparrow', x: x0 + 1.2, z: (z0 + z1) / 2, y: RISE + houseH(l) + 4.75, rot: i * 0.7, range: [2.0, 0.2] });
});
perches.push({ kind: 'heron', x: CANAL.end - 2.2, z: 7, y: 0.12, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
