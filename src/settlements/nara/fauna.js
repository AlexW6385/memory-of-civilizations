// Nara in 752 — the animals (src/engine/fauna.js draws them; docs/settlements/nara.md §13): house swallows over the
// temple's courts and the capital's avenues, crows over the cedar hills and Wakakusa, tree sparrows hopping on the
// paving and in the market. (The deer are figures of the nara style, placed in town.js/index.js.) No water, so no fish.
import { COURT, MARKET } from './layout.js';

const fish = [];
const [mx0, mz0, mx1, mz1] = MARKET.block, mc = [(mx0 + mx1) / 2, (mz0 + mz1) / 2];
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, -50], a: [60, 40], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [mc[0], mc[1]], a: [40, 28], rot: 0.2 }, y: [3, 10], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-120, 40], a: [50, 30], rot: -0.3 }, y: [3, 9], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [-200, 120], a: [40, 40], rot: 0.5 }, y: [3, 9], speed: 8 },
  { kind: 'crow', n: 7, loop: { c: [230, -40], a: [60, 50], rot: 0.5 }, y: [40, 70], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [120, -150], a: [50, 30], rot: -0.4 }, y: [26, 44], speed: 9 },
];
const perches = [];
const sparrow = (x, z, y = 0, rot = 0.3 + (Math.abs(x) * 7 % 3)) => perches.push({ kind: 'sparrow', x, z, y, rot, range: [1.4, 1.3] });
for (const [x, z] of [[-4, 168], [5, 190], [-6, 250], [-84, 160], [-84, 210], [-170, 80], [-170, -40], [-200, 160], [-6, 60], [4, 100], [30, 200], [50, 205], [66, 198], [18, 197]]) sparrow(x, z);
for (const [x, z] of [[-60, -36], [40, -36], [-70, 20], [70, 20]]) sparrow(x, z);          // the court's gravel
void COURT; void mz1; void mz0;
export default { fish, flights, perches };
