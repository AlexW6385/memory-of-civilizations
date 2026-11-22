// Mohenjo-daro — the animals (src/engine/fauna.js; docs/settlements/mohenjo-daro.md §8): river fish in the Indus, swallows over the water and the streets,
// kites over the Citadel (drawn as crows), sparrows on the paving, a heron and an egret on the bank and at the quay.
import { RIVER, QUAY, MOUND, PLAZA, riverX, height, lots, doorU } from './layout.js';

const inWater = (x, z) => Math.abs(x - riverX(z)) - (RIVER.hw - 3);
const fish = [];
for (let z = -280; z < 280; z += 70) fish.push({ n: 4, size: [0.3, 0.8], palette: 'carp', y: RIVER.level, area: [riverX(z) - 14, z, riverX(z) + 14, z + 70], dist: inWater, margin: 3, a: [6, 26], ratio: 0.3, speed: 0.4, rise: 0.2 });
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [62, -40], a: [40, 30], rot: 0.2 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [QUAY.x1 + 6, -90], b: [QUAY.x1 + 6, 70] }, y: [0.8, 6], speed: 10, half: 14 },
  { kind: 'swallow', n: 6, lane: { a: [RIVER.x - 8, -250], b: [RIVER.x - 8, 250] }, y: [1.5, 14], speed: 10, half: 26 },
  { kind: 'swallow', n: 4, loop: { c: [60, 0], a: [90, 80], rot: 0.3 }, y: [4, 22], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [(MOUND[0] + MOUND[2]) / 2, (MOUND[1] + MOUND[3]) / 2], a: [90, 70], rot: 0.2 }, y: [34, 22], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [130, -120], a: [60, 40], rot: 0.9 }, y: [26, 14], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [100, 150], a: [70, 40], rot: 0.1 }, y: [25, 14], speed: 8 },
];
const perches = [];
const spots = [[-150, -50], [-120, -60], [-60, -44], [-20, -40], [62, -80], [62, 10], [62, 100], [154, -80], [154, 30], [154, 110], [48, -40], [76, -30], [30, 48], [100, 48], [-30, -100], [-30, 120], [240, -60], [250, 20], [-160, 70], [-200, -150]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[-121, -97], [-178, -80]]) perches.push({ kind: 'crow', x: x + 1.5, z: z + 1, y: 7 + 7.4, rot: x % 3, range: [2, 1.6], stay: [30, 120], gone: [30, 90], alert: 12 });
for (const [x, z] of [[-124, -71], [-192, -80.5], [-72, -92], [-150, -18]]) perches.push({ kind: 'sparrow', x: x + 1.4, z: z - 1.1, y: 7.1, rot: (x * 3) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'sparrow', x: -160, z: -72, y: 7.1, rot: 1, range: [1.6, 1.4] }, { kind: 'sparrow', x: -145, z: -50, y: 7.1, rot: 2, range: [1.6, 1.4] });
// sparrows on the market's stalls and the quay's sheds, crows on the Citadel's parapet and the granary roof, egrets at the weirs
for (const [x, z, y] of [[44, -62, 2.3], [58, -62, 2.3], [78, -62, 2.3], [44, -18, 2.3], [70, -18, 2.3], [255, -98, 3.4], [255, -50, 3.4], [255, -8, 3.4], [255, 22, 3.4]]) perches.push({ kind: 'sparrow', x, z, y, rot: (x * 5) % 3, range: [1.8, 1.4] });
for (const [x, z, y] of [[-208, -92, 7 + 6.2], [-190, -108, 7 + 6.2], [MOUND[2] - 4, MOUND[1] + 6, 8.4], [MOUND[0] + 6, MOUND[3] - 6, 8.4]]) perches.push({ kind: 'crow', x, z, y, rot: (z * 3) % 3, range: [2, 1.6], stay: [30, 120], gone: [60, 160], alert: 9 });
for (const [x, z] of [[286, -125], [288, 128]]) perches.push({ kind: 'egret', x: x + 1, z: z + 2, y: RIVER.level + 0.95, rot: 1, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: riverX(-170) - RIVER.hw + 3, z: -170, y: -1.9, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: QUAY.x1 - 0.9, z: 25, y: 0.5, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void PLAZA;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §16.4) ──
// The animals of the city, domestic and wild-in-town [stated: "cattle, buffalo, goat, pig and chicken", Wikipedia "Indus Valley Civilisation"; dogs; the zebu and buffalo are
// life elements, not critters]: dogs at the doors of the walk's lanes (dog paw prints are on Indus bricks, a dog's and a cat's together at Chanhudaro [inferred from memory, not
// checked]), a cat on a doorstep, goats tethered in the platform's street, fowl pecking in the lanes (the chicken is stated), rock doves on the Bath's paving and in the market
// (the blue rock pigeon is native [inferred]), ducks on the river's backwater, a kingfisher fishing at the landing, and three humped zebu [stated: "humped zebu-type cattle appear often on seals"] standing and grazing on an open stretch of the town west of the market (critter-models-farm.js).
const critters = [];
const walkLots = lots().filter((l) => l.walk);
const doorSpot = (l, du, v) => { const [x0, z0, x1, z1] = l.rect, W = l.front === 'w' || l.front === 'e' ? z1 - z0 : x1 - x0; du = Math.max(0.6, Math.min(W - 0.6, du)); return l.front === 'w' ? [x0 - v, z0 + du] : l.front === 'e' ? [x1 + v, z0 + du] : l.front === 'n' ? [x0 + du, z0 - v] : [x0 + du, z1 + v]; };
// the dogs: beside the door of four of the walk's lots, off the doorway's lane, in the lane's edge
walkLots.filter((l) => l.tag === 'town' || l.rect[1] < -30).slice(0, 12).filter((_, i) => i % 3 === 1).forEach((l, i) => {
  const d = doorU(l), [x, z] = doorSpot(l, d + (d < 6 ? 2.7 : -2.7), 0.55);
  critters.push({ model: 'dog', at: [x, height(x, z) + l.y + 0.02, z], rot: 1.2 + i, range: [9, 3.5] });
});
// a cat on a doorstep of the platform's lane
{ const l = walkLots.find((q) => q.tag === 'top' && q.front === 'w'); if (l) { const d = doorU(l), [x, z] = doorSpot(l, d + (d < 6 ? 2.2 : -2.2), 0.5); critters.push({ model: 'cat_tabby', at: [x, l.y + 0.05, z], rot: 2.4, range: [7, 2.5] }); } }
// goats tethered in the platform's street under the Pillared Hall's south wall
critters.push({ model: 'goat_black', at: [-110, 7.05, -80.6], rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: [-111.4, 7.05, -81.0], rot: 3.0, range: [9, 3.2] });
// fowl in the plain's lanes and the street before the market, at the lane's edge
for (const [x, z, m] of [[-5.0, 24, 'hen_brown'], [-4.4, 25.2, 'rooster'], [-5.2, 26.1, 'hen_white'], [36.4, -12, 'hen_brown'], [36.9, -11, 'hen_brown'], [-91.2, -50, 'hen_white']]) critters.push({ model: m, at: [x, height(x, z) + (x < -80 ? 7 : 0) + 0.05, z], rot: x * 3, range: [2.4, 1.3] });
// zebu on the open ground of the town's west side (clear of the houses and 16 m from every walk route)
for (const [x, z, m, rot] of [[-40, -4, 'zebu_white', 0.6], [-36.5, 2.5, 'zebu_grey', 2.3], [-43.5, 3, 'zebu_red', 4.4]]) critters.push({ model: m, at: [x, height(x, z) + 0.02, z], rot, range: [2.6, 2], tau: 34 + (-x % 5) });
// rock doves on the Bath's court (by the coping), on the Citadel's street, and at the market's edge
for (const [x, y, z, m] of [[-146, 7.07, -73, 'pigeon_grey'], [-145.2, 7.07, -74.3, 'pigeon_grey'], [-147, 7.07, -95, 'pigeon_white'], [-128, 7.07, -61, 'pigeon_grey'], [-127.1, 7.07, -60.2, 'pigeon_grey'], [52, 0.07, -28, 'pigeon_grey'], [53, 0.07, -27, 'pigeon_grey'], [80, 0.07, -22, 'pigeon_white']]) critters.push({ model: m, at: [x, y, z], rot: x * 3, range: [1.4, 1.2] });
// ducks on the Indus's backwater under the quay, a kingfisher on the bank, fishing
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_white'], area: [riverX(95) - RIVER.hw - 2, 80, riverX(95) - RIVER.hw + 16, 112], dist: (x, z) => Math.abs(x - riverX(z)) - (RIVER.hw - 1), a: [8, 2.6], ratio: 0.3, margin: 1.0, y: RIVER.level, speed: 0.2, cycle: [22, 30] });
{ const z = -60, x = riverX(z) - RIVER.hw + 2.5; critters.push({ model: 'kingfisher', at: [x, 0.05, z], rot: Math.PI / 2, water: [x + 1.6, z, RIVER.level], cycle: 34 }); }
export default { fish, flights, perches, critters };
