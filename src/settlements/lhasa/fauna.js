// Lhasa — the animals (src/engine/fauna.js draws them; docs/settlements/lhasa.md §14): choughs and ravens
// (drawn as crows) over the palace's walls and roofs, swifts (swallows) in the valley's light, sparrows
// (and the town's pigeons) on the paving of Shöl's street and the pilgrims' circuit.
import { SHOL, STREET, POND } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 5, loop: { c: [-20, -40], a: [150, 40], rot: 0 }, y: [30, 130], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [120, -60], a: [50, 30], rot: 0.4 }, y: [60, 120], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [0, 120], a: [90, 60], rot: 0 }, y: [8, 40], speed: 11 },
  { kind: 'swallow', n: 4, loop: { c: [POND.c[0], POND.c[1]], a: [70, 30], rot: 0 }, y: [4, 20], speed: 10 },
];
const perches = [];
for (const [x, z] of [[-2, 80], [-1, 100], [0, 120], [-2, 150], [1, 175], [-6, 136], [5, 138], [-1, 200], [-30, 142], [30, 142], [-60, 141], [60, 141], [-95, 142.5], [95, 141.5], [-140, 142], [140, 142], [-180, 142], [180, 142], [-4, 58], [-12, 56], [-1, 236], [-150, 222], [100, 222], [-213, 100], [213, 100]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
void SHOL; void STREET;
export default { fish, flights, perches };
