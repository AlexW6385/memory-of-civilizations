// Nara in 752 — the animals (src/engine/fauna.js draws them; docs/settlements/nara.md §13): house swallows over the
// temple's courts and the capital's avenues, crows over the cedar hills and Wakakusa, tree sparrows hopping on the
// paving and in the market. (The deer are figures of the nara style, placed in town.js/index.js.) No water, so no fish.
import { COURT, MARKET, yards, lots, serviceLots, inRect } from './layout.js';
import { openedLots, doorOf } from './walk.js';

const fish = [];
const [mx0, mz0, mx1, mz1] = MARKET.block, mc = [(mx0 + mx1) / 2, (mz0 + mz1) / 2];
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, -50], a: [60, 40], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [mc[0], mc[1]], a: [40, 28], rot: 0.2 }, y: [3, 10], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-120, 40], a: [50, 30], rot: -0.3 }, y: [3, 9], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [-200, 120], a: [40, 40], rot: 0.5 }, y: [3, 9], speed: 8 },
  { kind: 'crow', n: 7, loop: { c: [230, -40], a: [60, 50], rot: 0.5 }, y: [40, 70], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [120, -150], a: [50, 30], rot: -0.4 }, y: [26, 44], speed: 9 },
  { kind: 'kite', n: 2, loop: { c: [60, -20], a: [120, 80], rot: 0.6 }, y: [70, 30], speed: 7 },           // black kites over the temple and the hills (tobi) [inferred: the commonest raptor of the plain]
];
const perches = [];
const sparrow = (x, z, y = 0, rot = 0.3 + (Math.abs(x) * 7 % 3)) => perches.push({ kind: 'sparrow', x, z, y, rot, range: [1.4, 1.3] });
for (const [x, z] of [[-4, 168], [5, 190], [-6, 250], [-84, 160], [-84, 210], [-170, 80], [-170, -40], [-200, 160], [-6, 60], [4, 100], [30, 200], [50, 205], [66, 198], [18, 197]]) sparrow(x, z);
for (const [x, z] of [[-60, -36], [40, -36], [-70, 20], [70, 20]]) sparrow(x, z);          // the court's gravel
void COURT; void mz1; void mz0;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/nara.md §19.4) ──
const critters = [];
const open = [...openedLots().keys()];
// a cock and two hens in the free ground beside the well of each of the three yards nearest the avenue (the households kept fowl [inferred])
for (const [yx, yz] of yards().map(([x, z]) => [x, z]).sort((a, b) => Math.hypot(a[0], a[1] - 190) - Math.hypot(b[0], b[1] - 190)).slice(0, 3))
  for (const [model, dx, dz, size] of [['rooster', 2.6, 0, 1], ['hen_brown', 3.4, 0.5, 1], ['hen_white', 2.2, -0.8, 0.96]]) critters.push({ model, at: [yx + dx, 0.02, yz + dz], rot: 0.5 + dx, range: [1.2, 0.8], size });
// a dog lying at the wardens' lodge's door and one at the market's corner (dogs lived with the townspeople [inferred])
{ const l = serviceLots().find((q) => q.use === 'lodge'), d = doorOf(l);
  critters.push({ model: 'dog', at: [d.x - 1.5, 0.02, d.z + d.out[1] * 1.0], rot: 1.2, range: [9, 3.5] });
  critters.push({ model: 'dog', at: [7.6, 0.02, 172], rot: -0.5, range: [9, 3.5] }); }
// cats: on the scriptorium's step (cats came to Japan with the sutras, to keep rats from the scrolls [stated in popular histories; not re-sourced]) and at the foot of the storehouse
{ const l = serviceLots().find((q) => q.use === 'scriptorium'), d = doorOf(l);
  critters.push({ model: 'cat_tabby', at: [d.x + 1.9, 0.05, d.z + d.out[1] * 0.8], rot: 0.6, range: [7, 2.5] });
  critters.push({ model: 'cat_orange', at: [-118, 0.02, -89.3], rot: 2.4, range: [7, 2.5] }); }
// house swallows' nests (tsubame) on the wall under the eave of the open houses on the avenue's service and market stretch, away from the doors
{ let k = 0;
  for (const l of open.filter((q) => q.rect[1] > 92 && Math.abs((q.rect[0] + q.rect[2]) / 2) < 120).sort((a, b) => Math.abs(a.rect[0] + a.rect[2]) - Math.abs(b.rect[0] + b.rect[2]))) {
    if (k > 7) break;
    const f = l.front || 's', sg = f === 's' ? 1 : -1, fz = f === 's' ? l.rect[3] : l.rect[1], d = doorOf(l), x = d.x + (k % 2 ? 1 : -1) * ((l.rect[2] - l.rect[0]) / 2 - 0.6);
    if (!inRect(l.rect, x, fz + (f === 's' ? -0.05 : 0.05)) || critters.some((c) => c.model === 'swallow_nest' && Math.abs(c.at[0] - x) < 12 && Math.abs(c.at[2] - fz) < 12)) continue;
    critters.push({ model: 'swallow_nest', at: [x, 2.5, fz + sg * 0.14], rot: f === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
  } }
void lots;
export default { fish, flights, perches, critters };
