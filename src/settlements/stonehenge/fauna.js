// Stonehenge — the animals (src/engine/fauna.js draws them; docs/settlements/stonehenge.md §10b): rooks and crows (corvids
// followed the feasts and the herds) circling the camp and the Southern Circle, a few over the stones; swallows (summer visitors
// to the down) low over the grass; sparrows (the engine's small bird, standing in for the larks and pipits of the down) on the
// bare trodden chalk of the Avenue and the Durrington avenue. The down has no water: no fish, no egret.
import { AXIS, DURR, VILLAGE, HEEL, height } from './layout.js';

const ax = Math.cos(AXIS), az = Math.sin(AXIS), A = (s, t) => [s * ax - t * az, s * az + t * ax];
const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [60, 45], rot: 0.3 }, y: [3, 16], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: A(160, 0), a: [90, 40], rot: AXIS }, y: [2, 10], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [VILLAGE.c[0], VILLAGE.c[1]], a: [80, 60], rot: 0.5 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: A(125, -40), a: [50, 35], rot: 0.2 }, y: [14, 30], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [DURR.c[0], DURR.c[1]], a: [70, 55], rot: 0.9 }, y: [18, 40], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [0, 0], a: [40, 40], rot: 0 }, y: [10, 20], speed: 7 },
];
const perches = [];
// on the trodden chalk of the Avenue and the avenue at Durrington, hopping about a spot
for (const [s, t] of [[70, 4], [96, -5], [130, 3], [165, -4], [200, 5], [240, -3], [290, 2]]) { const [x, z] = A(s, t); perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: AXIS + 1.2 + s % 3, range: [1.6, 1.4] }); }
for (const s of [40, 70, 100]) { const x = DURR.c[0] + DURR.dir[0] * s + 3, z = DURR.c[1] + DURR.dir[1] * s - 3; perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: s % 3, range: [1.8, 1.6] }); }
// on the ground by the Heel Stone's ring ditch
{ const [x, z] = A(HEEL.d + 6, -5); perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: 0.8, range: [1.4, 1.2] }); }
export default { fish, flights, perches };
