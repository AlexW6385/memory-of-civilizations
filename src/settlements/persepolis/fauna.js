// Persepolis — the animals (src/engine/fauna.js draws them; docs/settlements/persepolis.md §15): swallows over the plain and the
// terrace, sparrows on the paving of the road, the market and the workshops' yard, crows over the mountain's foot. No water: no fish.
import { MARKET, ROAD, WORKSHOPS, TERRACE } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [-250, 0], a: [110, 150], rot: 0.2 }, y: [4, 22], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -60], a: [90, 70], rot: 0.1 }, y: [16, 34], speed: 10 },
  { kind: 'swallow', n: 3, loop: { c: [-210, -95], a: [30, 26], rot: 0.3 }, y: [3, 9], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [230, -40], a: [60, 110], rot: 0.4 }, y: [60, 95], speed: 8 },
];
const perches = [];
const rz = (ROAD[1] + ROAD[3]) / 2;
const spots = [[-340, rz + 3], [-300, rz - 4], [-260, rz + 3], [-215, rz - 3], [-190, rz + 2], [-285, (MARKET[1] + MARKET[3]) / 2], [-260, (MARKET[1] + MARKET[3]) / 2 + 3], [(WORKSHOPS[0] + WORKSHOPS[2]) / 2, WORKSHOPS[1] - 6],
  [-350, -30], [-350, 70], [-304, 100], [-248, -20], [-248, 200], [-190, 20], [-190, 130]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
// on the terrace: sparrows on the paving before the Apadana's stairway and at the gate
for (const [x, z] of [[-70, -128], [-20, -126], [10, -132], [-130, -128]]) perches.push({ kind: 'sparrow', x, z, y: TERRACE.h, rot: (x * 5) % 3, range: [1.8, 1.4] });
export default { fish, flights, perches };
