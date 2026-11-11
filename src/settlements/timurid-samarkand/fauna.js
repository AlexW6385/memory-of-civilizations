// Timurid Samarkand — the animals (src/engine/fauna.js draws them; docs/settlements/timurid-samarkand.md §11): doves and swallows
// over the Registan and the madrasa's court, house sparrows on the paving and the roofs' parapets, rooks high over the
// orchards; a little fish in the aryk is left out (the channel is too narrow). [inferred]
import { SQUARE, MADRASA, BIBI } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [48, 34], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-83, 0], a: [26, 18], rot: 0 }, y: [6, 24], speed: 8 },
  { kind: 'swallow', n: 4, lane: { a: [-200, 58], b: [260, 58] }, y: [1, 5], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [60, -150], a: [120, 70], rot: 0.5 }, y: [30, 55], speed: 8 },
];
flights[2].a = [26, 3];
const perches = [];
for (const [x, z] of [[-30, -30], [-20, 20], [0, 10], [25, 30], [30, -10], [-8, -36], [40, 8], [-90, 12], [-75, -10], [-100, 3], [100, 50], [140, 58], [60, 58], [-150, 160], [-120, 150]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// ...and on the parapets of the madrasa's east wings (their roof at 13.5 m, parapet coping)
for (const [x, z] of [[-50, -24], [-50, 24], [-70, 25], [-70, -25]]) perches.push({ kind: 'sparrow', x, z, y: 14.6, rot: 0, range: [1.2, 0], alert: 5 });
void SQUARE; void MADRASA; void BIBI;
export default { fish, flights, perches };
