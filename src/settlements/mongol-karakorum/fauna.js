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
// sparrows hopping on the paving of the main street and the cross-street among the stalls, and on the flat roofs of the shop rows and houses
for (let x = -120; x < 125; x += 21) perches.push({ kind: 'sparrow', x, z: (Math.round(x / 21) % 2 ? 1 : -1) * 4.6, y: 0.02, rot: 0, range: [1.8, 0.6], alert: 4.5 });
for (let z = -88; z < 90; z += 22) if (Math.abs(z) > 12) perches.push({ kind: 'sparrow', x: (Math.round(z / 22) % 2 ? 1 : -1) * 3.0, z, y: 0.02, rot: 1.57, range: [0.6, 1.8], alert: 4.5 });
for (const [x, z] of [[-100, -9.4], [-60, -9.4], [-30, 10], [30, 10], [60, 10], [-7.4, -40], [7.4, -70], [7.4, 40], [-7.4, 70]]) perches.push({ kind: 'sparrow', x, z, y: 3.5 + 0.9, rot: 0.3, range: [1.6, 0.4], alert: 6 });
for (const m of MOSQUES) perches.push({ kind: 'sparrow', x: (m[0] + m[2]) / 2, z: m[1] + 8, y: 6.5, rot: 0.2, range: [2.2, 0.6], alert: 7 });
flights.push({ kind: 'swallow', n: 5, lane: { a: [-130, 0], b: [130, 0] }, y: [2, 6], speed: 9 }, { kind: 'swallow', n: 4, loop: { c: [-70, 30], a: [40, 20], rot: 0.3 }, y: [3, 9], speed: 9 }, { kind: 'crow', n: 5, loop: { c: [60, -50], a: [50, 40], rot: 0.2 }, y: [12, 30], speed: 8 }, { kind: 'crow', n: 4, loop: { c: [-80, 60], a: [50, 30], rot: 1.1 }, y: [10, 26], speed: 8 });
// ravens on the tops of the nine-tailed banners' staves and the great hall's ridge, a falcon and a kite working over the court, doves round the gate hall
for (const [x, z] of [[58, -22], [82, -22]]) perches.push({ kind: 'raven', x, z, y: 7.7, rot: 0.9, range: [0.1, 0.1], alert: 7 });
for (const z of [-62, -53]) perches.push({ kind: 'raven', x: 70, z, y: 12.55, rot: 0.2, range: [0.1, 3.0], alert: 9 });
for (const [x, z] of [[63.5, -6.4], [76.2, -6.2], [70, -6.0]]) perches.push({ kind: 'dove', x, z, y: 6.5, rot: 0.4, range: [1.2, 0.3], alert: 6 });
flights.push({ kind: 'falcon', n: 1, loop: { c: [70, -34], a: [38, 22], rot: 0.2 }, y: [18, 36], speed: 11 }, { kind: 'kite', n: 2, loop: { c: [60, 10], a: [70, 40], rot: 0.7 }, y: [24, 46], speed: 9 }, { kind: 'swallow', n: 5, loop: { c: [70, -20], a: [24, 14], rot: 0 }, y: [2, 7], speed: 9 });
void WALL; void PALACE;
export default { fish, flights, perches };
