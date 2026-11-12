// The pā — the animals (src/engine/fauna.js draws them; docs/settlements/maori.md §4d): eels and small fish in the lake's
// shallows, welcome swallows (warou) over the lake, the gardens and the terraces, and a white-faced heron by the shore
// (the kōtuku, the white heron, stands as the egret). No crows or sparrows: neither lived in Aotearoa before the Europeans
// [stated: Te Ara "Birds"; inferred: the exclusion]. The kurī are in the town's people (town.js).
import { LAKE, HILL, shoreZ, height, inLake } from './layout.js';

const fish = [];
for (const x of [-250, -210, -180, -150, -120, -90, -60, -30, 10, 40, 70, 100, 130, 160, 190, 210, 240]) {
  const sz = shoreZ(x);
  fish.push({ n: 3, size: [0.25, 0.45], palette: 'carp', y: LAKE.level - 0.5, area: [x - 14, sz - 12, x + 14, sz - 4], dist: (px, pz) => Math.abs(pz - (shoreZ(px) - 8)) - 3, margin: 1.5, a: [10, 3], ratio: 0.3, speed: 0.4, rise: 0.2 });
}
const [hx, hz] = HILL.c;
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, -130], a: [200, 30], rot: 0 }, y: [0.8, 6], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, 200], a: [100, 60], rot: 0.2 }, y: [0.6, 4], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [hx, hz], a: [90, 90], rot: 0.5 }, y: [14, 40], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [hx, hz + 6], a: [26, 20], rot: 0.4 }, y: [3, 11], speed: 8 },        // low over the summit, above the marae
  { kind: 'swallow', n: 4, loop: { c: [0, 175], a: [60, 22], rot: 0.1 }, y: [0.8, 3], speed: 8 },          // low over the gardens, where one arrives
  { kind: 'swallow', n: 3, loop: { c: [-170, 40], a: [60, 40], rot: 0.3 }, y: [1, 5], speed: 8 },          // the western and eastern kāinga
  { kind: 'swallow', n: 3, loop: { c: [170, 40], a: [60, 40], rot: -0.3 }, y: [1, 5], speed: 8 },
];
const perches = [];
for (const [x, kind] of [[-60, 'egret'], [130, 'heron'], [-195, 'egret'], [40, 'egret'], [205, 'heron']]) {
  const z = shoreZ(x) + 4.5;
  if (!inLake(x, z)) perches.push({ kind, x, z, y: height(x, z), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
}
export default { fish, flights, perches };
