// Muromachi Kyoto — the animals (src/engine/fauna.js; docs/settlements/muromachi-kyoto.md §6): carp in the pond of Ginkaku-ji and
// in Ryōan-ji's Kyōyōchi, in the stream small fish; swallows over the streets and the stream, crows over the hills, sparrows on
// the gravel and the roofs' ridges, a heron standing at the stream.
import { STREAM, GINKAKU, RYOAN, RADIUS } from './layout.js';

const pondDist = (P) => (x, z) => (Math.hypot((x - P.c[0]) / P.r[0], (z - P.c[1]) / P.r[1]) - 1) * Math.min(P.r[0], P.r[1]);
const streamDist = (x) => Math.min(x - STREAM.x0, STREAM.x1 - x);
const fish = [];
const G = GINKAKU.pond, R = RYOAN.pond;
for (let i = 0; i < 4; i++) fish.push({ n: 2, size: [0.45, 0.75], palette: i % 2 ? 'redcarp' : 'carp', y: G.level, dist: pondDist(G), margin: 1.2, k: 1, rot: 0, area: [G.c[0] - G.r[0] + 6, G.c[1] - G.r[1] + 5, G.c[0] + G.r[0] - 6, G.c[1] + G.r[1] - 5], a: [14, 2.5], ratio: 0.16, minA: 1.6, speed: 0.5, rise: 0.12 });
for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.4, 0.7], palette: 'carp', y: R.level, dist: pondDist(R), margin: 1.2, k: 1, rot: 0, area: [R.c[0] - R.r[0] + 6, R.c[1] - R.r[1] + 4, R.c[0] + R.r[0] - 6, R.c[1] + R.r[1] - 4], a: [12, 2.2], ratio: 0.16, minA: 1.4, speed: 0.5, rise: 0.12 });
for (let z = -200; z <= 200; z += 100) fish.push({ n: 3, size: [0.12, 0.2], palette: 'carp', y: STREAM.level, dist: (x) => streamDist(x), margin: 0.4, k: 1, rot: Math.PI / 2, area: [STREAM.x0, z - 20, STREAM.x1, z + 20], a: [18, 0.9], ratio: 0.1, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [-120, 0], a: [110, 90], rot: 0.1 }, y: [3, 12], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-30, 130], a: [80, 60], rot: 0.3 }, y: [3, 10], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [99, -250], b: [99, 250] }, y: [0.3, 3], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [250, 0], a: [70, 70], rot: 0.4 }, y: [30, 60], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-170, -170], a: [50, 40], rot: -0.3 }, y: [24, 44], speed: 8 },
];
flights[2].a = [26, 3];
const perches = [];
for (const [x, z] of [[-165, -128], [-170, -108], [-160, -112], [190, 70], [175, 74], [160, 20], [-6, 175], [4, 205], [-45, 100], [10, -30], [-110, 60], [-180, -20], [60, 170]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: (x * 7) % 3, range: [1.6, 1.4] });
{ const x = 99.2, z = 60; perches.push({ kind: 'egret', x: STREAM.x0 - 1.1, z, y: 0.15, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void RADIUS;
export default { fish, flights, perches };
