// SG̱ang Gwaay — the animals (src/engine/fauna.js draws them; docs/settlements/sgang-gwaay.md §9): ravens (crows) over the village and
// the forest edge, more of them about the poles, small birds (sparrow stand-ins: wrens and juncos) on the drying racks and the
// logs of the beach, a heron (the great blue) on the rocks at the shore's end, small dark fish in the bay.
import { SEA, height, shoreX, houses, village } from './layout.js';

const fish = [];
for (const z of [-90, -30, 40, 100]) fish.push({ n: 3, size: [0.25, 0.45], palette: 'carp', y: SEA, dist: (x, zz) => height(x, zz) - SEA + 1.2, margin: 0.5, k: 1, rot: 0, area: [shoreX(z) + 16, z - 6, shoreX(z) + 30, z + 6], a: [9, 4], ratio: 0.3, minA: 1.5, speed: 0.5, rise: 0.12 });
const flights = [
  { kind: 'crow', n: 5, loop: { c: [10, 0], a: [60, 90], rot: 0.2 }, y: [14, 40], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [30, 60], a: [40, 30], rot: 0.6 }, y: [8, 22], speed: 7 },
  { kind: 'swallow', n: 4, lane: { a: [40, -150], b: [40, 150] }, y: [0.8, 4], speed: 9 },
];
flights[2].a = [30, 4];
const perches = [];
const v = village();
for (const r of v.racks) perches.push({ kind: 'sparrow', x: r.c[0], z: r.c[1] + 0.4, y: height(...r.c) + 2.85, rot: r.yaw, range: [r.w * 0.4, 0] , alert: 6 });
for (const l of v.logs.slice(0, 6)) perches.push({ kind: 'sparrow', x: l.c[0], z: l.c[1], y: height(...l.c) + 0.5, rot: l.yaw, range: [1.5, 0.3] });
for (const h of houses().slice(0, 8)) perches.push({ kind: 'sparrow', x: h.c[0], z: h.c[1], y: 1 + h.ridge + 0.2, rot: h.yaw, range: [0, 2], alert: 6 });
{ const z = 150, x = shoreX(z) + 1.5; perches.push({ kind: 'heron', x, z, y: height(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 12 }); }
export default { fish, flights, perches };
