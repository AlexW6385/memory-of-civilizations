// Shibam — the animals (docs/settlements/shibam.md §8): swifts and swallows between the towers, pigeons on the roof terraces and in the square,
// sparrows in the streets, kites over the wadi. No water, no fish.
import { SQUARE, WALL, LM, GATE, shops, doorOf, lots, heightOf } from './layout.js';
import { topOf } from '../../styles/hadhrami/dims.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, -10], a: [120, 60], rot: 0.1 }, y: [14, 34], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [80, 40], a: [50, 40], rot: 0.4 }, y: [10, 28], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [0, 135], a: [120, 20], rot: 0, }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-70, -20], a: [40, 30], rot: 0.9 }, y: [12, 30], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [60, -140], a: [60, 30], rot: 0.3 }, y: [6, 25], speed: 7 },
  { kind: 'crow', n: 3, loop: { c: [0, 60], a: [200, 120], rot: 0.2 }, y: [50, 90], speed: 8 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[-20, -10], [10, 2], [25, -15], [-9, 70], [-9, 40], [-60, -8], [50, 20], [0, 5]]) sp(x, z);
// pigeons on the parapet of the enterable house, whose roof terrace can be stood on
perches.push({ kind: 'sparrow', x: LM.rect[0] + 2, z: LM.rect[1] + 0.3, y: topOf(LM.storeys) + 1.0, rot: 0, range: [1.2, 0], alert: 5 });
// sparrows on the mastabas at the shops' doors and pigeons on the parapets of the houses round the square
for (const l of shops()) { const u = doorOf(l), z = l.front === 'n' ? l.rect[1] - 0.6 : l.rect[3] + 0.6; sp(u + 1.4, z, 0.45); }
let k = 0;
for (const l of lots()) if (l.rect[0] > SQUARE[0] - 10 && l.rect[2] < SQUARE[2] + 10 && Math.abs(l.rect[1] + 7) < 40 && (k++ % 3 === 0)) perches.push({ kind: 'sparrow', x: (l.rect[0] + l.rect[2]) / 2, z: l.rect[1] + 0.4, y: heightOf(l) + 1.0, rot: 0, range: [1.8, 0], alert: 6 });
void WALL;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §19) ──
// Dogs lying in the shade at the gate and at a corner of the main street (the town's watch-dogs [inferred]), cats on the doorsteps of the shops along the
// square's south edge (the grain stores' cats [inferred]), goats tethered at the foot of tower houses in the south alleys (livestock at the foot of the
// houses: stated, Aramco World), hens and a cock scratching by the doors of the ordinary houses of the south rows (kept on the ground floors with the
// beasts [inferred]), pigeons on the merchant's roof terrace beside the parapet (pigeon cotes on the roofs: dossier §11).
const critters = [];
const sh = shops();
const side = (l) => (l.seed % 2 ? 1 : -1);
// cats on the doorsteps of the square's shops, off the door's lane (the door is reserved 1.4 m either side)
{ let k = 0; for (const l of sh.filter((q) => q.sq)) { if (k >= 3) break; const u = doorOf(l), z = l.front === 'n' ? l.rect[1] - 0.45 : l.rect[3] + 0.45; critters.push({ model: k % 2 ? 'cat_orange' : 'cat_tabby', at: [u + side(l) * 2.6, 0.05, z], rot: l.seed % 6, range: [7, 2.5] }); k++; } }
// dogs: at the gate, on the shaded side of the passage's outer wall, and in the main street's shade
critters.push({ model: 'dog', at: [GATE.x + 6.2, ground.height(GATE.x + 6.2, 101.2) + 0.02, 101.2], rot: 1.1, range: [9, 3.5] }, { model: 'dog', at: [GATE.x - 2.0, 0.05, 44], rot: 4.2, range: [9, 3.5] });
// goats and hens at the foot of the houses along the main street from the gate: beside the lot fronts, never before a door
{ let k = 0; for (const l of lots().filter((q) => q.cz > 20 && q.cz < 80 && Math.abs(q.cx - GATE.x) < 14 && !q.shop).sort((a, b) => a.cz - b.cz)) {
    if (k >= 6) break;
    const u = doorOf(l), z = l.front === 'n' ? l.rect[1] - 0.5 : l.rect[3] + 0.5, x = u + (l.rect[2] - l.rect[0] > 8 ? 2.8 : -2.4) * side(l), c = k % 3;
    if (Math.abs(x - GATE.x) < 2.6) continue;
    if (c === 0) critters.push({ model: l.seed % 2 ? 'goat_black' : 'goat_white', at: [x, 0.05, z], rot: l.seed % 6, range: [9, 3.2] });
    else critters.push({ model: c === 1 ? 'hen_brown' : 'rooster', at: [x, 0.05, z], rot: l.seed % 6, range: [2.2, 1.8] }, { model: 'hen_white', at: [x + 0.6, 0.05, z - 0.2 * (l.front === 'n' ? 1 : -1)], rot: (l.seed >> 3) % 6, range: [2.2, 1.8] });
    k++;
  } }
// pigeons on the merchant's terrace, on the parapet's side away from the stair-head
{ const y = topOf(LM.storeys); critters.push({ model: 'pigeon_grey', at: [LM.rect[0] + 3.2, y, LM.rect[3] - 2.4], rot: 0.5, range: [1.2, 1.0] }, { model: 'pigeon_white', at: [LM.rect[0] + 3.9, y, LM.rect[3] - 2.0], rot: 2.0, range: [1.2, 1.0] }); }
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('shibam'));
export default { fish, flights, perches, critters };
