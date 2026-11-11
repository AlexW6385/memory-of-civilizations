// Mughal Agra about 1650 — the animals (src/engine/fauna.js draws them; docs/settlements/mughal-agra.md §12): house crows over
// the town's roofs, blue rock pigeons about the Taj's domes and the gate, swifts and swallows low over the Yamuna and the
// garden's channels, house sparrows on the paving of the forecourt and the streets, a little egret and a grey heron
// on the river's sandy bank (the Yamuna's bank is the Taj's north edge).
import { RIVER_Z, FORECOURT } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, -170], a: [40, 30], rot: 0 }, y: [36, 70], speed: 10 },            // pigeons and swifts round the dome
  { kind: 'swallow', n: 5, loop: { c: [0, 150], a: [34, 20], rot: 0.3 }, y: [24, 38], speed: 10 },           // about the great gate
  { kind: 'swallow', n: 4, lane: { a: [-150, RIVER_Z + 14], b: [150, RIVER_Z + 14] }, y: [-0.5, 3], speed: 9 },   // over the river's edge
  { kind: 'crow', n: 7, loop: { c: [-160, 290], a: [90, 40], rot: 0.4 }, y: [14, 30], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [150, 285], a: [80, 40], rot: -0.3 }, y: [12, 26], speed: 8 },
];
const perches = [];
const spar = (x, z, y = 0.04) => perches.push({ kind: 'sparrow', x, z, y, rot: 0.4 + (Math.abs(x * 7 + z) % 3), range: [1.4, 1.3] });
for (const [x, z] of [[-30, 185], [-12, 200], [25, 190], [40, 215], [-50, 218], [60, 183], [0, 246], [-5, 280], [6, 300], [-90, 270], [90, 272], [-40, 270], [45, 270], [-200, 100], [200, -40]]) spar(x, z);
// the bank of the Yamuna below the terrace's face
perches.push({ kind: 'egret', x: -60, z: RIVER_Z + 6, y: -2.2, rot: -1.57, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'heron', x: 110, z: RIVER_Z + 7, y: -2.3, rot: -1.57, stay: [80, 240], gone: [40, 150], alert: 11 });
void FORECOURT;
export default { fish, flights, perches };
