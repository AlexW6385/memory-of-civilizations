// Nasrid Granada — the animals (src/engine/fauna.js draws them; docs/settlements/granada.md §13): swifts and house martins
// screaming round the Alhambra's towers and over the Darro, jackdaws and choughs over the Albaicín's roofs, house sparrows
// on the paving of the lanes, the courts and the souk. (No fish: the Darro's water is drawn but not swum in.)
import { gardens } from './layout.js';
import { HILL, MYRTLES, LIONS, COMARES, SOUK, GREAT_MOSQUE, SITES, DARRO, height } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [20, -30], a: [70, 30], rot: 0.1 }, y: [22, 40], speed: 11 },               // swifts round the palaces' towers
  { kind: 'swallow', n: 4, loop: { c: [-150, 0], a: [34, 24], rot: -0.3 }, y: [24, 36], speed: 11 },              // round the Alcazaba
  { kind: 'swallow', n: 4, lane: { a: [-300, DARRO.z], b: [300, DARRO.z] }, y: [-3, 3], speed: 9 },               // house martins low along the river
  { kind: 'swallow', n: 3, loop: { c: [(SOUK[0] + SOUK[2]) / 2, (SOUK[1] + SOUK[3]) / 2], a: [30, 18], rot: 0 }, y: [7, 14], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [0, -230], a: [70, 40], rot: 0.4 }, y: [28, 44], speed: 9 },                   // jackdaws over the Albaicín
  { kind: 'crow', n: 4, loop: { c: [-20, 135], a: [50, 34], rot: -0.4 }, y: [14, 26], speed: 9 },                  // over the Great Mosque and the south town
];
const perches = [];
const sparrow = (x, z, y = height(x, z), rot = 0.3 + (Math.abs(x) * 7 % 3)) => perches.push({ kind: 'sparrow', x, z, y, rot, range: [1.4, 1.3] });
const [mx0, mz0] = MYRTLES, [lx0, lz0, lx1, lz1] = LIONS;
for (const [x, z] of [[mx0 + 3, mz0 + 20], [mx0 + 18, mz0 + 8], [(lx0 + lx1) / 2 - 6, (lz0 + lz1) / 2 + 3], [lx0 + 5, lz1 - 2.5]]) sparrow(x, z, HILL.top + 0.05);
for (const x of [-120, -60, 0, 60, 120, 200]) { sparrow(x, DARRO.z - 5.5); sparrow(x + 20, DARRO.z + 5.5); }
for (const [x, z] of [[-90, 125.8], [-70, 133.2], [-60, 125.8], [-50, 133.4], [-20, 118], [-20, 150], [-30, 100], [0, 105]]) sparrow(x, z, 0.04);
for (const [x, z] of [[-30, -150], [20, -176], [60, -210], [-60, -240], [90, -160], [-100, -200], [140, -190]]) sparrow(x, z);
for (const g of gardens().slice(0, 8)) sparrow((g.rect[0] + g.rect[2]) / 2 + 1.5, (g.rect[1] + g.rect[3]) / 2, g.y + 0.08);   // in the huertas
for (const x of [-60, -20, 20, 60, 100, 140]) for (const z of [-23.75, 1.25, 26.25]) sparrow(x + z / 10, z, HILL.top + 0.1);   // on the medina's lanes
void COMARES; void GREAT_MOSQUE; void SITES;
export default { fish, flights, perches };
