// Madurai about 1650 — the animals (src/engine/fauna.js draws them; docs/settlements/madurai.md §13): rock pigeons
// round the gopurams, house crows over the roofs, swifts high over the great towers, house sparrows on the
// paving of the streets and the temple courts. (No fish: the Golden Lotus tank holds none, the dossier says.)
import { WALL, GATES, TANK, RADIUS, lots, lotMap, outside } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [GATES.s[0], 140], a: [40, 28], rot: 0 }, y: [30, 52], speed: 10 },          // swifts and pigeons about the south gopuram
  { kind: 'swallow', n: 5, loop: { c: [GATES.e[0] + 10, GATES.e[1]], a: [34, 26], rot: 0.4 }, y: [26, 46], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [(TANK[0] + TANK[2]) / 2, (TANK[1] + TANK[3]) / 2], a: [24, 18], rot: 0 }, y: [4, 12], speed: 8 },   // over the tank
  { kind: 'crow', n: 6, loop: { c: [-60, 60], a: [90, 60], rot: 0.5 }, y: [14, 30], speed: 8 },                          // house crows over the town
  { kind: 'crow', n: 5, loop: { c: [120, 180], a: [80, 50], rot: -0.4 }, y: [12, 26], speed: 8 },
];
const perches = [];
const spar = (x, z, y = 0.02) => perches.push({ kind: 'sparrow', x, z, y, rot: 0.4 + (Math.abs(x * 7 + z) % 3), range: [1.4, 1.3] });
for (const [x, z] of [[-60, WALL[3] + 19], [-12, WALL[3] + 18], [30, WALL[3] + 20], [70, WALL[3] + 18], [WALL[2] + 19, -60], [WALL[2] + 20, 30], [WALL[0] - 19, 20], [WALL[0] - 20, -70], [-80, WALL[1] - 19], [20, WALL[1] - 19]]) spar(x, z);
for (const [x, z] of [[-40, 128], [-15, 140], [-30, 100], [10, 95], [-70, 112], [60, 108]]) spar(x, z);
for (const x of [-110, -50, 20, 90]) spar(x, WALL[3] + 76);
// sparrows on the thinnais' edge and the paving of the first rings, in the lanes between the axial streets
for (let i = 0; i < 16; i++) { const o = [14, 20, 75, 31][i % 4], a = i * 0.39 + 0.2; spar(Math.cos(a) * (WALL[2] + o + (i % 3)) * 1.0, Math.sin(a) * (WALL[3] + o + (i % 3)) * 1.0); }
void RADIUS;

// ── the critters (src/engine/fauna-critters.js; docs/settlements/madurai.md §19): the animals with a rig of their own ──
const critters = [];
// rock pigeons walking and pecking on the paving of the outer court south of Sundareswarar's enclosure, clear of the elephants and the axis [inferred]
for (const [model, x, z] of [['pigeon_grey', 38, 62], ['pigeon_dark', 41.5, 65], ['pigeon_grey', 35.5, 66.5], ['pigeon_white', 44, 60.5], ['pigeon_grey', 62, 84], ['pigeon_dark', 65, 86.5]]) critters.push({ model, at: [x, 0.02, z], rot: (x * 7 + z) % 6.28, range: [3.2, 1.5] });
// street dogs of the temple streets (ownerless, fed by the quarter) lying at the verge of the Chitrai street, clear of the sellers' mats and the door lanes
for (const [x, z, rot] of [[-72, WALL[3] + 15.2, 0.5], [58, WALL[3] + 14.8, 2.4], [WALL[2] + 14.8, -50, 1.2]]) critters.push({ model: 'dog', at: [x, 0.02, z], rot, range: [9, 3.5] });
// goats of the outer streets (the poor keep them), one at the verge of the east ring street
critters.push({ model: 'goat_black', at: [WALL[2] + 24.0, 0.02, 22], rot: 3.3, range: [8, 3] });
critters.push({ model: 'goat_white', at: [-148, 0.02, WALL[3] + 24.0], rot: 0.9, range: [8, 3] });
// hens and a cock scratching at the verge of the Chitrai street's south side in the street's apron
for (const [model, x, z] of [['rooster', 22, WALL[3] + 16.5], ['hen_brown', 24.4, WALL[3] + 16.2], ['hen_white', 20.4, WALL[3] + 16.0]]) critters.push({ model, at: [x, 0.02, z], rot: 1.3, range: [3.0, 1.4] });
// cats on the thinnais of two houses of the first rings within reach of the arrival (the platform's far end from the door), looking out to the street
{
  const near = lots().filter((l) => l.kind === 'house' && outside((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) < 60 && Math.hypot((l.rect[0] + l.rect[2]) / 2 + 20, (l.rect[1] + l.rect[3]) / 2 - 170) < 110 && lotMap(l).W > 5.5)
    .sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 + 20, (a.rect[1] + a.rect[3]) / 2 - 170) - Math.hypot((b.rect[0] + b.rect[2]) / 2 + 20, (b.rect[1] + b.rect[3]) / 2 - 170));
  [[1, 'cat_orange'], [5, 'cat_tabby']].forEach(([k, model]) => {
    const l = near[k]; if (!l) return;
    const { W, map } = lotMap(l), a = map(W * 0.88, 1.15), b = map(W * 0.88, -1.15);
    critters.push({ model, at: [a[0], 0.57, a[1]], rot: Math.atan2(b[1] - a[1], b[0] - a[0]), range: [7, 2.5] });
  });
}
export default { fish, flights, perches, critters };
