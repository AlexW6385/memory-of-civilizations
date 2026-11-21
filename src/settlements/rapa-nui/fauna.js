// Rapa Nui — the animals (src/engine/fauna.js; docs/settlements/rapa-nui.md §4e): the island's seabirds — terns and
// noddies (drawn as the swallow's shape) wheeling over the shore and the plaza, frigatebirds (the crow's dark shape,
// high) soaring over Rano Raraku's crater. No fresh-water fish are shown (none native).

import { RARAKU } from './layout.js';
const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [30, 135], a: [110, 26], rot: 0.05 }, y: [4, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-40, 80], a: [60, 30], rot: 0.3 }, y: [6, 22], speed: 9 },
  { kind: 'swallow', n: 6, loop: { c: [-10, 150], a: [150, 20], rot: 0.0 }, y: [2, 9], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [90, 60], a: [90, 40], rot: 0.4 }, y: [3, 12], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [20, 230], a: [120, 40], rot: 0.1 }, y: [40, 70], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [RARAKU.c[0], RARAKU.c[1]], a: [70, 50], rot: 0.2 }, y: [88, 118], speed: 8 },
];
const perches = [];
// terns resting (drawn as the small perching bird) on the heads of some of the ahu's statues and along its platform's back, on the stones of the shore and the canoes' sterns
import tongariki from './plan.js';
import { AHU, COAST, height, village } from './layout.js';
let sd = 1500; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
tongariki.elements.filter((e) => e.t === 'moai' && e.kind === 'ahu').forEach((m, i) => { if (i % 3 === 1) perches.push({ kind: 'sparrow', x: m.at[0] + (rnd() - 0.5) * 0.3, z: m.at[1], y: m.y + m.h * (m.pukao ? 1.22 : 1.0), rot: rnd() * 6, range: [0.1, 0.1], alert: 7 }); });
for (let x = AHU.rect[0] + 4; x < AHU.rect[2]; x += 9 + rnd() * 8) perches.push({ kind: 'sparrow', x, z: AHU.rect[3] + 0.3, y: AHU.h + 0.05, rot: rnd() * 6, range: [2.2, 0.2], alert: 6 });
for (const [x, z] of [[58, 148], [66, 150], [74, 151], [86, 152], [106, 149]]) perches.push({ kind: 'sparrow', x: x + 1.6, z: z + 0.4, y: height(x + 1.6, z + 0.4) + 0.5, rot: rnd() * 6, range: [1.2, 0.8], alert: 5 });
for (let k = 0; k < 9; k++) { const x = 40 + rnd() * 100, z = 146 + rnd() * 8; perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.15, rot: rnd() * 6, range: [2.5, 1.5], alert: 6 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §10.4) ──
// Only what the island had about 1500: chickens (its one domestic animal), the rats that came with the settlers, and sea birds on the shore's stones.
// No dog, cat, pig, goat or horse: none reached the island before the Europeans.
const critters = [];
const near = (c) => Math.hypot(c[0], c[1] - 50);
{
  const moa = village().moa.slice().sort((p, q) => near(p.c) - near(q.c)).slice(0, 7);
  // a cockerel and two hens scratching at each of the seven nearest chicken houses, to the side of its small openings (the chickens' own house, §4i)
  moa.forEach((m, i) => {
    const [x, z] = m.c, side = i % 2 ? 1 : -1;
    critters.push({ model: 'rooster', at: [x + side * 3.2, height(x + side * 3.2, z + 1.2) + 0.02, z + 1.2], rot: i * 1.7, range: [3.0, 1.4] });
    critters.push({ model: i % 3 ? 'hen_brown' : 'hen_white', at: [x + side * 2.4, height(x + side * 2.4, z + 2.3) + 0.02, z + 2.3], rot: i * 2.3 + 1, range: [3.0, 1.4], size: 0.96 });
    critters.push({ model: 'hen_brown', at: [x + side * 4.1, height(x + side * 4.1, z + 0.2) + 0.02, z + 0.2], rot: i * 0.9 + 2, range: [3.0, 1.4], size: 0.94 });
  });
  // a rat (kiore) at the foot of the three nearest chicken houses and at the sweet potato store of two houses, out most at dusk and night
  moa.slice(0, 3).forEach((m, i) => { const x = m.c[0] - 1.6 + i * 0.4, z = m.c[1] - 1.3; critters.push({ model: 'kiore', at: [x, height(x, z) + 0.01, z], rot: i * 2.1, range: [5, 2] }); });
  village().houses.filter((h) => h.inside && h.kind === 'cook').slice(0, 2).forEach((h, i) => {
    const u = 3.2 + i, v = h.w / 2 + 0.7, x = h.c[0] + u * Math.cos(h.yaw) + v * Math.sin(h.yaw), z = h.c[1] - u * Math.sin(h.yaw) + v * Math.cos(h.yaw);
    critters.push({ model: 'kiore', at: [x, height(x, z) + 0.01, z], rot: i * 1.4 + 0.5, range: [5, 2] });
  });
}
// noddies (the dark sea bird with the pale cap) and a few more on the black stones of the shore east of the ahu and by the canoes
{
  const coastZ = (x) => COAST + 18 * Math.sin(x / 47) + 9 * Math.sin(x / 19 + 1);
  for (const [x, dz] of [[52, -4], [64, -3], [70, -5], [92, -4], [100, -3], [112, -5], [-30, -3], [-8, -4]]) {
    const z = coastZ(x) + dz;
    critters.push({ model: 'noddy', at: [x, height(x, z) + 0.12, z], rot: x * 0.31, range: [3.4, 1.4], size: 1.0 });
  }
}
export default { fish, flights, perches, critters };
