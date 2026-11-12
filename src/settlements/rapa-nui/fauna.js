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
import { AHU, height } from './layout.js';
let sd = 1500; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
tongariki.elements.filter((e) => e.t === 'moai' && e.kind === 'ahu').forEach((m, i) => { if (i % 3 === 1) perches.push({ kind: 'sparrow', x: m.at[0] + (rnd() - 0.5) * 0.3, z: m.at[1], y: m.y + m.h * (m.pukao ? 1.22 : 1.0), rot: rnd() * 6, range: [0.1, 0.1], alert: 7 }); });
for (let x = AHU.rect[0] + 4; x < AHU.rect[2]; x += 9 + rnd() * 8) perches.push({ kind: 'sparrow', x, z: AHU.rect[3] + 0.3, y: AHU.h + 0.05, rot: rnd() * 6, range: [2.2, 0.2], alert: 6 });
for (const [x, z] of [[58, 148], [66, 150], [74, 151], [86, 152], [106, 149]]) perches.push({ kind: 'sparrow', x: x + 1.6, z: z + 0.4, y: height(x + 1.6, z + 0.4) + 0.5, rot: rnd() * 6, range: [1.2, 0.8], alert: 5 });
for (let k = 0; k < 9; k++) { const x = 40 + rnd() * 100, z = 146 + rnd() * 8; perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.15, rot: rnd() * 6, range: [2.5, 1.5], alert: 6 }); }
export default { fish, flights, perches };
