// Mycenae — the animals (docs/settlements/mycenae.md §9): swifts and swallows over the ridge and the palace, a pair of ravens riding the ravine's air,
// sparrows about the houses of the lower town. No fish.
import { LANES, PALACE, lots, PAL_Y, GATE_Y } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 3, loop: { c: [10, -70], a: [130, 60], rot: 0.15 }, y: [30, 60], speed: 9 },
  { kind: 'swallow', n: 6, loop: { c: [60, 5], a: [60, 40], rot: 0.1 }, y: [26, 40], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-140, 30], a: [40, 40], rot: 0.4 }, y: [4, 12], speed: 9 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const lane of LANES) for (let i = 1; i < lane.length; i += 1) sp(lane[i][0] + 3, lane[i][1] + 3);
sp(PALACE.court[0] + 12, PALACE.court[1] + 6); sp(PALACE.court[0] + 4, PALACE.court[1] + 12, PAL_Y); sp(PALACE.court[0] + 20, PALACE.court[1] + 4, PAL_Y);
// on the parapets and in the lanes before the houses: sparrows at the doors, more near the arrival
let k = 0;
for (const l of lots()) {
  if (l.kind === 'granary' || (k++ % 2)) continue;
  const [x0, z0, x1, z1] = l.rect, st = l.kind === 'house' ? l.storeys : 1, x = x0 + (x1 - x0) * (0.3 + 0.4 * ((l.seed % 7) / 7)), z = z0 + (z1 - z0) * (0.3 + 0.4 * ((l.seed % 11) / 11));
  sp(x, z, l.y + st * 2.95 + 0.42);
}
sp(-100, 7, GATE_Y + 6.2); sp(-96, -7, GATE_Y + 7.0);
flights.push({ kind: 'swallow', n: 6, loop: { c: [-120, 0], a: [50, 30], rot: 0.05 }, y: [6, 14], speed: 9 }, { kind: 'crow', n: 2, loop: { c: [-150, -40], a: [60, 40], rot: 0.5 }, y: [25, 45], speed: 8 });
export default { fish, flights, perches };
