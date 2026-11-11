// Renaissance Florence — the animals (src/engine/fauna.js draws them; docs/settlements/florence.md §10):
// carp and barbel in the Arno, swifts screaming over the roofs and the river, sparrows (and the town's
// pigeons, drawn as sparrows) on the paving of the squares, crows over the dome at twilight, a heron
// on the river's bank.
import { ARNO, PIAZZA_DUOMO, SIGNORIA, MERCATO, DUOMO, arnoZ, height } from './layout.js';

/** Negative inside the Arno's water (its middle line is arnoZ). */
const riverDist = (x, z) => Math.abs(z - arnoZ(x)) - (ARNO.w / 2 - 3);
const area = [-250, 0, 250, 0];

const fish = [];
for (let i = 0; i < 6; i++) {
  const x = -200 + i * 70, z = arnoZ(x);
  fish.push({ n: 2, size: [0.5, 0.75], palette: 'carp', y: ARNO.level, dist: riverDist, margin: 2, k: 1, rot: 0, area: [x - 20, z - 8, x + 20, z + 8], a: [18, 4], ratio: 0.2, minA: 1.5, speed: 0.35, rise: 0.1 });
}
void area;

const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-250, arnoZ(-250)], b: [250, arnoZ(250)] }, half: 22, y: [6, 24], speed: 11 },
  { kind: 'swallow', n: 4, loop: { c: [(SIGNORIA[0] + SIGNORIA[2]) / 2, (SIGNORIA[1] + SIGNORIA[3]) / 2], a: [50, 40], rot: 0.3 }, y: [14, 40], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [DUOMO.c[0] - 20, DUOMO.c[1]], a: [60, 40], rot: 0 }, y: [20, 60], speed: 10 },
  { kind: 'crow', n: 6, loop: { c: [DUOMO.c[0], DUOMO.c[1]], a: [50, 35], rot: 0.4 }, y: [45, 20], speed: 8 },
];

const perches = [];
const spots = [[-140, -20], [-100, -16], [-30, -16], [60, -12], [90, -18], [-150, -90], [20, 130], [20, 195], [70, 196], [100, 198], [-60, 50], [-40, 44], [-34, 62], [-70, 20], [-250, -130], [-230, -125]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: (x * 7 % 3), range: [1.8, 1.6] });
void PIAZZA_DUOMO; void MERCATO;
// a heron on the north bank of the Arno
{ const x = -90, z = arnoZ(x) - 36.5; perches.push({ kind: 'heron', x, z, y: height(x, z) + 0.0, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 }); }

export default { fish, flights, perches };
