// Abu Simbel — the animals (docs/settlements/abu-simbel.md §9): black kites over the cliff, swallows over the river, the terrace and the lanes, sparrows in the
// lanes and on the market's roofs, egrets and a heron at the water's edge and among the papyrus, tilapia and Nile perch in the shallows by the quay.
import { QUAY, QUAY_Y, WATER, TERRACE, MARKET, GRAN_YARD, lanes, lots } from './layout.js';
import { doorX } from './walk.js';
import { ground } from './ground.js';

const nile = (x) => 54 - x;
/** Fish: schools of tilapia (the dark carp's palette) in the shallows off the quay and the reed beds, a few larger perch in the deep. */
const fish = [];
for (const [a, y0, y1] of [[1, -34, -14], [2, 14, 34], [3, -10, 10]]) fish.push({ n: 4, size: [0.22, 0.38], palette: 'carp', y: ground.waterLevel(60), area: [66, y0, 92, y1], dist: nile, margin: 4, a: [14, 7], ratio: 0.5, speed: 0.4, rise: 0.35, tries: 1 + a * 0 });
fish.push({ n: 2, size: [0.7, 1.1], palette: 'carp', y: ground.waterLevel(60), area: [75, -20, 120, 20], dist: nile, margin: 6, a: [22, 10], ratio: 0.4, speed: 0.5, rise: 0.1 });
const flights = [
  { kind: 'crow', n: 4, loop: { c: [-30, -40], a: [120, 90], rot: 0.3 }, y: [40, 80], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [-60, 80], a: [60, 50], rot: 0.9 }, y: [30, 60], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [40, 0], a: [60, 50], rot: 0.1 }, y: [-5, 6], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-10, 70], a: [30, 24], rot: 0.4 }, y: [2, 8], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-12, -60], a: [24, 16], rot: 0 }, y: [2, 8], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-14, 100], a: [26, 28], rot: 1.2 }, y: [2, 8], speed: 9 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
// sparrows hopping in the lanes (a few to each) and the market street, and on the terrace
for (const l of lanes()) {
  const [x0, z0, x1, z1] = l.r, horiz = x1 - x0 > z1 - z0, len = horiz ? x1 - x0 : z1 - z0;
  for (let t = 5; t < len - 3; t += 24) sp(horiz ? x0 + t : (x0 + x1) / 2, horiz ? (z0 + z1) / 2 : z0 + t);
}
for (let x = MARKET[0] + 6; x < MARKET[2]; x += 11) sp(x, (MARKET[1] + MARKET[3]) / 2);
for (const z of [-14, 4, 15]) sp(TERRACE[0] + 12, z);
perches.push({ kind: 'egret', x: QUAY[2] - 0.6, z: QUAY[3] - 2, y: -6.3, rot: 0, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: 57, z: -26, y: ground.waterLevel(60) + 0.05, rot: 1.0, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: 55, z: 27, y: ground.waterLevel(60) + 0.05, rot: 1.6, stay: [80, 240], gone: [60, 180], alert: 12 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/abu-simbel.md §21) ──
// What lived at a Nubian frontier town of Ramesses II and no more: dogs at the doors of the lanes, cats at some houses (tame since the Middle Kingdom), goats
// in the granaries' yard, geese on the bank at the quay, a crane at the quay's edge, a kingfisher on the river's brink, ducks afloat among the reeds.
// No hens or cocks (the fowl are not shown in Nubia at this date), no pigeons, no turkeys; the donkeys and cattle have no model yet.
const critters = [];
const QY = QUAY_Y + 0.02, H = (x, z) => ground.height(x, z);
{ let dogs = 0, cats = 0;
  for (const l of lots().filter((q) => q.kind === 'house' && Math.abs((q.rect[0] + q.rect[2]) / 2 + 8) < 40)) {
    const n = l.front === 'n', xd = doorX(l), zf = n ? l.rect[1] : l.rect[3], x = xd + (l.seed % 2 ? 1.9 : -1.9), z = zf + (n ? -0.9 : 0.9);
    if (dogs < 8 && l.seed % 3 !== 0) { critters.push({ model: 'dog', at: [x, H(x, z), z], rot: n ? 0 : Math.PI, range: [9, 3.5] }); dogs++; }
    else if (cats < 4 && l.seed % 3 === 0) { critters.push({ model: l.seed % 2 ? 'cat_tabby' : 'cat_orange', at: [x, H(x, z), z], rot: 0.4, range: [7, 2.5] }); cats++; }
    if (dogs >= 8 && cats >= 4) break;
  } }
// goats loose in the granaries' yard (the round granaries stand in rows; the beasts keep to the gaps, in the yard's east margin)
for (let k = 0; k < 4; k++) { const x = GRAN_YARD[2] - 0.8, z = GRAN_YARD[1] + 2 + k * 3.2; critters.push({ model: k % 2 ? 'goat_white' : 'goat_black', at: [x, H(x, z), z], rot: k * 1.7, range: [6, 2.4] }); }
// the quay: geese on the stone by the river's face, a crane stalking its edge, the kingfisher on the brink, ducks afloat among the reeds
for (const [z, rot] of [[-3.6, 0.3], [-2.4, 1.1], [-4.4, 2.0], [14.4, 0.8]]) critters.push({ model: z < 0 ? 'goose_grey' : 'goose_white', at: [QUAY[2] - 3.2, QY, Math.min(z, QUAY[3] - 0.5)], rot, range: [3, 1.8], size: 1 });
critters.push({ model: 'crane', at: [QUAY[2] - 2.4, QY, QUAY[3] - 1.4], rot: 1.57, range: [3, 1.2], tau: 50, speed: 0.4 });
critters.push({ model: 'kingfisher', at: [QUAY[2] - 0.4, QY + 0.05, QUAY[1] + 1.4], rot: Math.PI / 2, water: [QUAY[2] + 2.5, QUAY[1] + 1.4, WATER], cycle: 34 });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown'], area: [58, -36, 90, -16], dist: nile, margin: 2, a: [10, 8], ratio: 0.5, speed: 0.5, y: WATER });
critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown'], area: [58, 18, 88, 38], dist: nile, margin: 2, a: [10, 8], ratio: 0.5, speed: 0.5, y: WATER });
export default { fish, flights, perches, critters };
