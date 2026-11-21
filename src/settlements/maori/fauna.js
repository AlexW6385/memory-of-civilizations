// The pā — the animals (src/engine/fauna.js draws them; docs/settlements/maori.md §4d): eels and small fish in the lake's
// shallows, (no welcome swallows: they reached Aotearoa only in the 1950s) and a white-faced heron by the shore
// (the kōtuku, the white heron, stands as the egret). No crows or sparrows: neither lived in Aotearoa before the Europeans
// [stated: Te Ara "Birds"; inferred: the exclusion]. The kurī are in the town's people (town.js).
import { LAKE, HILL, shoreZ, height, inLake, village } from './layout.js';

const fish = [];
for (const x of [-250, -210, -180, -150, -120, -90, -60, -30, 10, 40, 70, 100, 130, 160, 190, 210, 240]) {
  const sz = shoreZ(x);
  fish.push({ n: 3, size: [0.25, 0.45], palette: 'carp', y: LAKE.level - 0.5, area: [x - 14, sz - 12, x + 14, sz - 4], dist: (px, pz) => Math.abs(pz - (shoreZ(px) - 8)) - 3, margin: 1.5, a: [10, 3], ratio: 0.3, speed: 0.4, rise: 0.2 });
}
const [hx, hz] = HILL.c;
const flights = [
];
const perches = [];
for (const [x, kind] of [[-60, 'egret'], [130, 'heron'], [-195, 'egret'], [40, 'egret'], [205, 'heron']]) {
  const z = shoreZ(x) + 4.5;
  if (!inLake(x, z)) perches.push({ kind, x, z, y: height(x, z), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
}

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/maori.md §4k) ──
// Only what Aotearoa had before the Europeans: the kurī (the Polynesian dog, on the dog's rig: it lies, lifts its head, stands as the visitor nears) and the grey duck
// (parera) on the lake. No cat, goat, hen, rooster or pig: they came with Cook and after [stated: Te Ara "Kurī"; inferred: the exclusion].
const critters = [];
{
  const V = village(), ARR = [0, 33], d2 = (c) => Math.hypot(c[0] - ARR[0], c[1] - ARR[1]);
  // kurī lying in the porch of six of the houses nearest the arrival, at the side of the door's lane (the door at about x −0.5 of the house, the dog at x +w/2 −0.6)
  const near = V.houses.slice(1).filter((h) => (h.rank || 0) <= 1 && h.w >= 3).sort((p, q) => d2(p.c) - d2(q.c));
  near.filter((_, i) => i % 2 === 1).slice(0, 6).forEach((h, k) => {
    const ca = Math.cos(h.yaw), sa = Math.sin(h.yaw), zf = -h.l / 2 + 1.6, u = h.w / 2 - 0.55, q = zf - 0.7;
    critters.push({ model: 'dog', at: [h.c[0] + u * ca + q * sa, (h.y ?? height(h.c[0], h.c[1])) + 0.02, h.c[1] - u * sa + q * ca], rot: h.yaw + Math.PI / 2 + k, range: [9, 3.5] });
  });
  // and at the cooking places of the nearest whānau yards, on the side away from the houses' doors
  V.compounds.filter((c) => Math.hypot(c.c[0], c.c[1]) < 250).sort((p, q) => d2(p.c) - d2(q.c)).slice(0, 5).forEach((c, k) => {
    const a = 0.9 + k * 1.7, at = [c.c[0] + Math.cos(a) * 5.0, c.c[1] + Math.sin(a) * 5.0];
    if (!inLake(at[0], at[1])) critters.push({ model: 'dog', at: [at[0], height(at[0], at[1]) + 0.02, at[1]], rot: a + 1.2, range: [9, 3.5] });
  });
}
// grey ducks (parera) on the lake in the shallows, in two flocks off the beach, clear of the canoes out on the water
for (const x of [-125, 150]) {
  const band = (px, pz) => Math.abs(pz - (shoreZ(px) - 10)) - 4;
  critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_brown'], area: [x - 14, shoreZ(x) - 15, x + 14, shoreZ(x) - 5], dist: band, margin: 0.6, a: [12, 2.5], ratio: 0.2, minA: 1.5, y: LAKE.level, speed: 0.3, cycle: [18, 24] });
}
export default { fish, flights, perches, critters };
