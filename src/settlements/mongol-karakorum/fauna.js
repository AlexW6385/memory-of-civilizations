// Mongol Karakorum — the animals (src/engine/fauna.js draws them; docs/settlements/mongol-karakorum.md §9): ravens and a kite high over the town, larks
// over the steppe outside the wall, swallows about the court, sparrows on the roofs and walls, doves at the mosques [inferred]; no fish.
import { ground } from './ground.js';
import { WALL, PALACE, MOSQUES, WALL_H } from './layout.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 6, loop: { c: [-10, -20], a: [120, 70], rot: 0.1 }, y: [14, 40], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [60, 60], a: [60, 40], rot: 0.5 }, y: [10, 28], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [70, -30], a: [40, 20], rot: 0 }, y: [3, 12], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [-180, 0], b: [180, 0] }, y: [3, 9], speed: 9 },
];
const perches = [];
// sparrows on the town wall's top and the palace wall's coping, a few in the lanes
for (const [x, z] of [[-90, -97], [-30, -97], [40, -97], [100, -97], [-132, -40], [-132, 40], [132, -40], [132, 40], [-60, 97], [60, 97]]) perches.push({ kind: 'sparrow', x, z, y: WALL_H + 0.1, rot: (x * 7) % 3, range: [2.0, 0.3], alert: 6 });
for (const [x, z] of [[30, -92], [90, -92], [126, -50]]) perches.push({ kind: 'sparrow', x, z, y: 4.4, rot: 1, range: [1.6, 0.3], alert: 5 });
for (const [x, z] of [[-49, -80], [-100, 32]]) perches.push({ kind: 'sparrow', x, z, y: 3.5, rot: 0.4, range: [1.2, 1.2], alert: 7 });
for (const [x, z] of [[-62, 128], [66, 126]]) perches.push({ kind: 'sparrow', x: x + 8, z: z + 4, y: ground.height(x + 8, z + 4), rot: 2, range: [3, 2], alert: 10 });
void WALL; void PALACE; void MOSQUES;
export default { fish, flights, perches };
