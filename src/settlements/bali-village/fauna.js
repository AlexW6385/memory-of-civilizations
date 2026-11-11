// A Balinese village — the animals (src/engine/fauna.js; docs/settlements/bali-village.md §8): swallows over the paddies and the village street, crows over the temple's
// merus, egrets standing in the flooded paddies (the Bali white heron of the rice fields), sparrows on the walls' copings and the bale roofs' edges.
import { PURA, height } from './layout.js';

const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 60], a: [90, 70], rot: 0.2 }, y: [2, 12], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-130, 90], a: [60, 40], rot: 0.5 }, y: [0.8, 4], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [130, -60], a: [60, 40], rot: -0.4 }, y: [0.8, 4], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [0, -140], a: [45, 30], rot: 0.1 }, y: [26, 14], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-33, -100], [33, -120], [-20, -72], [20, -72], [-5.8, 20], [5.8, 50], [-5.8, 80], [5.8, 100], [60, 5.8], [-60, 13.8]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + (Math.abs(x) >= 33 ? 3.4 : 2.5), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z, rot] of [[-120, 40, 0.4], [125, 70, 2.0], [60, 160, 1.1], [-70, 165, 0.2], [150, -30, 2.6], [-140, -60, 1.7]]) perches.push({ kind: 'egret', x, z, y: height(x, z), rot, stay: [80, 240], gone: [40, 150], alert: 10 });
void PURA;
export default { fish: [], flights, perches };
