// Petra — the animals (src/engine/fauna.js draws them; docs/settlements/petra.md §17): rock doves (drawn as sparrows) on the
// street's paving, the temple steps and the Khazneh's forecourt, house sparrows at the shop fronts, swifts and swallows over the
// valley and along the Siq's cliffs, brown-necked ravens and kites circling over the massif. No water: no fish, no herons.
import { STREET, PLAZA, TEMENOS, QASR, yards } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [-60, 10], a: [150, 70], rot: 0.1 }, y: [12, 40], speed: 11 },
  { kind: 'swallow', n: 4, loop: { c: [115, -120], a: [40, 70], rot: 0.9 }, y: [10, 35], speed: 10 },
  { kind: 'swallow', n: 4, lane: { a: [320, -150], b: [150, -160] }, y: [5, 30], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [60, -90], a: [120, 90], rot: 0.5 }, y: [60, 95], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-150, 20], a: [60, 50], rot: 0 }, y: [35, 70], speed: 8 },
];
const perches = [];
const spots = [];
for (let x = -100; x <= 56; x += 22) spots.push([x, STREET.a[1] + 0.4 * ((x * 7) % 3 - 1)], [x + 8, STREET.a[1] + 6.5]);
spots.push([PLAZA.c[0] - 4, PLAZA.c[1] + 3], [PLAZA.c[0] - 2, PLAZA.c[1] - 5], [PLAZA.c[0] + 4, PLAZA.c[1] + 7]);
spots.push([QASR.altar[0], QASR.altar[1] + 3], [TEMENOS[0] + 30, QASR.altar[1] + 8], [-60, 17], [-40, 17.5]);
spots.push([62, STREET.a[1] - 2.5], [62.5, STREET.a[1] + 2.5], [PLAZA.c[0] + 1, PLAZA.c[1] + 12.8], [PLAZA.c[0] - 8, PLAZA.c[1] + 11]);
for (const y of yards()) spots.push([(y.rect[0] + y.rect[2]) / 2 + 2, (y.rect[1] + y.rect[3]) / 2 + 1.5]);
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.5] });
export default { fish, flights, perches };
