// Giza — the animals (src/engine/fauna.js draws them; docs/settlements/giza.md §12): black kites and ravens over the plateau
// (drawn as crows), swallows over the harbour and the town's roofs, sparrows on the cemetery avenues, the court and the town's
// streets, a little egret on the quay and one on the valley temple's terrace. No fish are drawn in the harbour.
import { WEST_FIELD, EAST_FIELD, HARBOUR, ENCLOSURE, KHAFRE_VT, KV_Y, VALLEY } from './layout.js';
import { ground } from './ground.js';
import { CAMP_ITEMS } from './camps.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 4, loop: { c: [0, -40], a: [190, 150], rot: 0.3 }, y: [70, 120], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [-240, -60], a: [90, 70], rot: 0.8 }, y: [35, 70], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [208, -66], a: [44, 30], rot: 0.1 }, y: [8, 22], speed: 7 },         // ravens over the works, after the crumbs of the masons' bread
  { kind: 'swallow', n: 5, loop: { c: [373, 57], a: [40, 30], rot: 0.1 }, y: [VALLEY + 1, VALLEY + 8], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [40, 250], a: [150, 60], rot: 0 }, y: [-3, 6], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [327, 133], a: [40, 28], rot: 0.2 }, y: [KV_Y + 2, KV_Y + 12], speed: 9 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const F of [WEST_FIELD, EAST_FIELD]) for (let x = F[0] + 22; x < F[2] - 20; x += 63) for (const z of [F[1] + 40, F[1] + 104, F[1] + 168]) if (z < F[3] - 20) sp(x + 2, z);
for (const [x, z] of [[-60, 162], [20, 162], [100, 162], [-94, 200], [-42, 200], [10, 205], [62, 200], [-100, 234], [0, 234], [100, 234], [180, 234]]) sp(x, z);
for (const [x, z] of [[-30, 255], [30, 270], [90, 250], [150, 262], [-80, 300], [20, 320], [120, 330], [-120, 270], [60, 200], [130, 205]]) sp(x, z);
for (const [x, z] of [[-60, ENCLOSURE[1] + 10], [60, ENCLOSURE[1] + 10], [-60, ENCLOSURE[3] - 10], [60, ENCLOSURE[3] - 10]]) sp(x, z);
for (const [x, z] of [[214, -77.8], [205.4, -55.9], [199, -72.6], [211, -83.6]]) sp(x, z);   // the works' stacks of stone
for (const i of CAMP_ITEMS) if (i.kind === 'sacks' || i.kind === 'jars') sp(i.x + 1.5, i.z + 1.5);   // sparrows after the grain and at the water
sp(349, 30, VALLEY + 0.04); sp(349.5, 80, VALLEY + 0.04);
sp(ENCLOSURE[2] - 6.5, -60); sp(ENCLOSURE[2] - 6.5, 10); sp(KHAFRE_VT[2] + 3, 140, KV_Y + 0.04);
// a little egret at the quay's edge, facing the water
perches.push({ kind: 'egret', x: HARBOUR[0] + 1.2, z: 30, y: 0.02 + (VALLEY), rot: 0, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
