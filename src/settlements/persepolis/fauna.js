// Persepolis — the animals (src/engine/fauna.js draws them; docs/settlements/persepolis.md §15): swallows over the plain and the
// terrace, sparrows on the paving of the road, the market and the workshops' yard, crows over the mountain's foot. No water: no fish.
import { MARKET, ROAD, WORKSHOPS, TERRACE } from './layout.js';
import { ground } from './ground.js';
import { lots, STREETS, ARRIVAL, wells } from './layout.js';
import { houseDoor } from '../../styles/achaemenid/houses-data.js';

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
for (const [x, z] of [[-70, -128], [-20, -126], [10, -132], [-130, -128], [-116, -66.8], [-108, -53.2], [-100, -66.5], [-96, -53.5], [-118, -61], [-104, -96.8], [-125, -50]]) perches.push({ kind: 'sparrow', x, z, y: TERRACE.h, rot: (x * 5) % 3, range: [1.8, 1.4] });
// more of them, on every street near the arrival (at the doors, by the wells), on the roofs' parapets and along the workshops' wall top
{
  let k = 0;
  for (const l of lots()) {
    if (Math.hypot(l.rect[0] - ARRIVAL[0], l.rect[1] - ARRIVAL[1]) > 190 || (k++ % 3)) continue;
    const d = houseDoor(l), [px, pz] = d.p, o = d.out, along = Math.atan2(o[0], -o[1]) + Math.PI / 2;
    perches.push({ kind: 'sparrow', x: px + o[0] * 2.2 + (l.seed % 5 - 2), z: pz + o[1] * 2.2, y: ground.height(px, pz), rot: along, range: [2.2, 0.8], alert: 5 });
    if (k % 2) perches.push({ kind: 'sparrow', x: px - o[0] * 0.5 + (l.seed % 7 - 3) * 0.6, z: pz - o[1] * 0.5, y: d.h + 0.54, rot: along, range: [2.6, 0], alert: 5 });   // on the parapet
  }
  for (const [x, z] of wells()) perches.push({ kind: 'sparrow', x: x + 1.5, z: z + 1, y: 0, rot: 0.5, range: [1.6, 1.4] });
  const wx = (WORKSHOPS[0] + WORKSHOPS[2]) / 2;
  for (const dx of [-20, -8, 10, 22]) perches.push({ kind: 'sparrow', x: wx + dx, z: WORKSHOPS[1] + 0.45, y: 3.9, rot: Math.PI / 2, range: [3, 0], alert: 5 });
  void STREETS;
}
// swallows low over the streets, following the visitor along the road and the cross streets
flights.push({ kind: 'swallow', n: 4, loop: { c: [-110, -60], a: [40, 30], rot: 0.1 }, y: [6, 16], speed: 9 });
flights.push({ kind: 'swallow', n: 4, loop: { c: [-290, -140], a: [60, 16], rot: 0, y: [3, 8] }, y: [3, 9], speed: 9 });
flights.push({ kind: 'swallow', n: 3, loop: { c: [-250, 20], a: [14, 90], rot: 0.1 }, y: [4, 11], speed: 8 });
export default { fish, flights, perches };
