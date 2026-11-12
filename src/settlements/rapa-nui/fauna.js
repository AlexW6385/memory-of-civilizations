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
export default { fish, flights, perches };
