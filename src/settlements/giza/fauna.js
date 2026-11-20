// Giza — the animals (src/engine/fauna.js draws them; docs/settlements/giza.md §12): black kites and ravens over the plateau
// (drawn as crows), swallows over the harbour and the town's roofs, sparrows on the cemetery avenues, the court and the town's
// streets, a little egret on the quay and one on the valley temple's terrace. No fish are drawn in the harbour.
import { WEST_FIELD, EAST_FIELD, HARBOUR, ENCLOSURE, KHAFRE_VT, KV_Y, VALLEY, CROW_WALL, town as townLots, furnished } from './layout.js';
import { LODGES } from './lodges.js';
import { plan as housePlan } from '../../styles/oldkingdom-giza/walkhouse.js';
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

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/giza.md §21) ──
// What lived at Giza c. 2560 BC and no more: dogs (at the camps' doors, the lodgings' and the houses'), goats in the town's pens, geese and a crane at the
// quay, ducks afloat in the harbour, a kingfisher at the quay's edge, cats at two houses. No hens (the fowl came to Egypt in the New Kingdom), no pigeons.
const critters = [];
const gateX = CROW_WALL.a[0] + CROW_WALL.gate.at, gd = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - gateX, (l.rect[1] + l.rect[3]) / 2 - 200);
const lots = townLots().slice().sort((a, b) => gd(a) - gd(b));
const H = (x, z) => ground.height(x, z), QY = VALLEY + 0.02;
// dogs: at the lodgings' doors and by the camps' fires
for (const l of LODGES) if (l.t === 'ok_lodge' && l.seed % 2) {
  const [x0, z0, x1, z1] = l.rect, d = { w: [x0 - 1.6, (z0 + z1) / 2 + 1.4], e: [x1 + 1.6, (z0 + z1) / 2 + 1.4], n: [(x0 + x1) / 2 + 1.4, z0 - 1.6], s: [(x0 + x1) / 2 + 1.4, z1 + 1.6] }[l.door];
  critters.push({ model: 'dog', at: [d[0], H(...d), d[1]], rot: l.seed, range: [9, 3.5] });
}
for (const [x, z] of [[240.5, -72.5], [233, -24.5]]) critters.push({ model: 'dog', at: [x, H(x, z), z], rot: x, range: [9, 3.5] });
// dogs and two cats at the houses nearest the gate street
{ let dogs = 0, cats = 0;
  for (const l of lots) {
    if (l.kind !== 'house' || !furnished(l)) continue;
    const P = housePlan(l), x = P.xd + (l.seed % 2 ? 1.9 : -1.9), z = l.rect[3] + 0.9;
    if (dogs < 4 && l.seed % 3 !== 0) { critters.push({ model: 'dog', at: [x, H(x, z), z], rot: Math.PI, range: [9, 3.5] }); dogs++; }
    else if (cats < 2 && l.seed % 3 === 0) { critters.push({ model: l.seed % 2 ? 'cat_tabby' : 'cat_orange', at: [x, H(x, z) + 0.0, z], rot: 0.4, range: [7, 2.5] }); cats++; }
    if (dogs >= 4 && cats >= 2) break;
  } }
// goats in the pens (the pen's wall is hip-high; the beasts stand inside it)
{ let n = 0;
  for (const l of lots) if (l.kind === 'yard' && l.yk === 'pen' && n < 5) {
    const [x0, z0, x1, z1] = l.rect, x = (x0 + x1) / 2 - 0.8, z = (z0 + z1) / 2 + 0.4;
    critters.push({ model: n % 2 ? 'goat_white' : 'goat_black', at: [x, H(x, z), z], rot: n * 1.7, range: [9, 3.2] }); n++;
  } }
// the quay: geese on the stone behind the landing's stair, a crane stalking the south quay, ducks afloat in the basin, the kingfisher at the edge
for (const [z, rot] of [[34, 0.3], [35.2, 1.1], [33.2, 2.0], [74, 0.8], [75.4, 4.0]]) critters.push({ model: z > 50 ? 'goose_white' : 'goose_grey', at: [HARBOUR[0] + 3.2, QY, z], rot, range: [3, 1.8], size: 1 });
critters.push({ model: 'crane', at: [HARBOUR[0] + 2.4, QY, 84], rot: 1.57, range: [3, 1.2], tau: 50, speed: 0.4 });
critters.push({ model: 'kingfisher', at: [HARBOUR[0] + 4.6, QY + 0.05, 41], rot: Math.PI / 2, water: [HARBOUR[0] + 7, 41, VALLEY - 1.2], cycle: 34 });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown'], area: [HARBOUR[0] + 8, 62, HARBOUR[2] - 3, HARBOUR[3] - 3], dist: (x, z) => -Math.min(x - HARBOUR[0], HARBOUR[2] - x, z - HARBOUR[1], HARBOUR[3] - z), margin: 1.6, a: [10, 8], ratio: 0.5, speed: 0.5, y: VALLEY - 1.2 });
export default { fish, flights, perches, critters };
