// Nalanda — the animals (src/engine/fauna.js draws them; docs/settlements/nalanda.md §9–§10): carp in the tanks, swallows over the water and
// round the temple's top, doves on the library's roofs, crows over the groves, sparrows on the courts and terraces, egrets at the tanks' margins.
import { TANKS, LEVEL, T3, M1, LIBRARY, tankD, height, WAY_LAMPS, BOOTHS, OTLAS, ANNEXES, GATE, MONASTERIES, yards } from './layout.js';
import { houseDoor } from '../../styles/nalanda/houses.js';
import { openHouses } from './walk.js';

const tk = TANKS[0], area = [tk.rect[0], tk.rect[1], tk.rect[2], tk.rect[3]];
const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: LEVEL, area, dist: tankD, margin: 2.5, a: [10, 60], ratio: 0.3, speed: 0.3, rise: 0.15 });
for (const t of TANKS.slice(1)) for (let i = 0; i < 3; i++) fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: LEVEL, area: t.rect, dist: tankD, margin: 2.5, a: [8, 5], ratio: 0.4, speed: 0.3, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 3, loop: { c: [-10, 130], a: [26, 12], rot: 0, dist: tankD, margin: 3 }, y: [0.5, 3], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [GATE.c[0], GATE.c[1]], a: [18, 14], rot: 0.4 }, y: [4, 14], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-120, -20], a: [40, 50], rot: 0.2 }, y: [14, 30], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [T3.c[0], T3.c[1]], a: [34, 30], rot: 0.2 }, y: [22, 38], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [106, 0], a: [16, 70], rot: 0, dist: tankD, margin: 3 }, y: [0.5, 3], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [LIBRARY.c[0], LIBRARY.c[1]], a: [30, 20], rot: 0.3 }, y: [14, 40], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [0, 20], a: [150, 110], rot: 0.4 }, y: [45, 80], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [150, 100], a: [50, 40], rot: 0.9 }, y: [10, 24], speed: 8 },
];
const perches = [];
const [mx0, mz0, mx1, mz1] = M1.rect, mzc = (mz0 + mz1) / 2;
for (const [x, z, y] of [[mx0 + 24, mzc - 8, 0.04], [mx0 + 30, mzc + 8, 0.04], [mx0 + 14, mzc + 2, 0.04], [T3.c[0] + T3.half + 3, 12, 0.04], [T3.c[0] + T3.half + 8, -9, 0.04], [4, 20, 0.04], [-3, -40, 0.04], [30, 100, 0.04], [30, -100, 0.04], [-90, -80, 0.04], [T3.c[0], T3.c[1] + 8, 20.04], [T3.c[0] + 7, T3.c[1] - 5, 20.04]]) perches.push({ kind: 'sparrow', x, z, y, rot: (x * 7) % 3, range: [1.8, 1.6] });
for (const [x, z] of [[tk.rect[0] - 4.5, 40], [tk.rect[2] + 3, -30], [TANKS[1].rect[0] + 12, TANKS[1].rect[1] - 3.5]]) perches.push({ kind: 'egret', x, z, y: height(x, z), rot: 0.8, stay: [80, 240], gone: [40, 150], alert: 10 });
// sparrows on the lamp pillars, the booths' awnings, the benches and the annexes' roofs; doves are not drawn
WAY_LAMPS.filter((_, i) => i % 3 === 0).forEach(([x, z], i) => perches.push({ kind: 'sparrow', x, z, y: 2.3, rot: i, range: [0.1, 0.1] }));
BOOTHS.filter((_, i) => i % 3 === 1).forEach(([x, z], i) => perches.push({ kind: 'sparrow', x, z, y: 2.8, rot: i * 2, range: [1.2, 0.8] }));
OTLAS.filter((_, i) => i % 2 === 0).forEach(([x, z0, , z1], i) => perches.push({ kind: 'sparrow', x, z: (z0 + z1) / 2, y: 0.52, rot: 1.57, range: [0.2, 4], alert: 5 + i }));
ANNEXES.forEach((a, i) => perches.push({ kind: 'sparrow', x: (a.rect[0] + a.rect[2]) / 2, z: (a.rect[1] + a.rect[3]) / 2, y: 4.5, rot: i, range: [5, 3] }));
MONASTERIES.forEach((m, i) => perches.push({ kind: 'sparrow', x: m.rect[0] + 25, z: (m.rect[1] + m.rect[3]) / 2 + 3, y: 0.04, rot: i, range: [2, 2], alert: 4 }));

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §21) ──
// The animals of a monastery town on the plain of Bihar [inferred: nothing here is sourced to Nalanda itself; the animals are those of any Gangetic village and pilgrim town]:
// village dogs lying at the gate and at the doors of the way and two houses, a cat on the step of a kitchen and of the refectory (the household cat of India is old), hens and a
// cock in the village yards (the jungle fowl was domesticated in the Indus valley and the plains), goats in two pens, pigeons on the paving before the great temple's stair and in the
// courts (doves were fed at shrines), ducks on the east tank and a kingfisher at its steps, swallows' mud nests under the annexes' eaves (the swallows already fly over the tanks).
// Zebu (humped cattle, white, grey and red; critter-models-farm.js) stand and graze in two village yards (the yards' still zebu are dropped from town.js); no peafowl.
const critters = [];
const doorSide = (l) => { const F = houseDoor(l), u = F.du < F.L / 2 ? F.du + 2.1 : F.du - 2.1; return F.P(u, -0.8); };
critters.push({ model: 'dog', at: [-7.6, 0.02, GATE.c[1] + 3.6], rot: 1.1, range: [9, 3.5] });
critters.push({ model: 'dog', at: [7.2, 0.02, 71.5], rot: 4.2, range: [9, 3.5] });
for (const [i, h] of openHouses().slice(0, 4).entries()) {
  const [x, z] = doorSide(h);
  if (i === 1) critters.push({ model: 'dog', at: [x, 0.02, z], rot: 2.0, range: [9, 3.5] });
}
// cats: on the step of the second monastery's annex (a kitchen) and of the refectory
for (const [i, a] of [ANNEXES[1], ANNEXES[0]].entries()) { const cx = (a.rect[0] + a.rect[2]) / 2; critters.push({ model: i ? 'cat_tabby' : 'cat_orange', at: [cx + 2.8, 0.05, a.rect[3] + 1.0], rot: 2.4 + i, range: [7, 2.5] }); }
// hens and a cock in the pens of the village yards nearest the arrival; goats in two others
const pens = yards().filter((y, i) => i % 4 !== 0 && !y.gone).sort((a, b) => Math.hypot(a.rect[0] - -2, a.rect[1] - 70) - Math.hypot(b.rect[0] - -2, b.rect[1] - 70));
pens.slice(0, 2).forEach((y, i) => { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: 'rooster', at: [cx - 1.6, 0.05, cz + 1.2], rot: i, range: [2.0, 1.4], size: 0.95 }, { model: i % 2 ? 'hen_white' : 'hen_brown', at: [cx - 0.4, 0.05, cz + 1.7], rot: i + 2, range: [2.0, 1.4], size: 0.92 }, { model: 'hen_brown', at: [cx + 0.6, 0.05, cz + 0.9], rot: i + 4, range: [2.0, 1.4], size: 0.9 }); });
pens.slice(2, 4).forEach((y, i) => { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: i ? 'goat_white' : 'goat_black', at: [cx + 1.8, 0.05, cz - 0.8], rot: 0.6 + i, range: [9, 3.2] }, { model: i ? 'goat_black' : 'goat_white', at: [cx - 0.8, 0.05, cz + 1.4], rot: 3 + i, range: [9, 3.2] }); });
// pigeons on the paving before the great temple's stair, in Monastery 1's court and in the library's yard
for (const [x, z, m] of [[-10.6, 10.5, 'pigeon_grey'], [-9.8, 11.8, 'pigeon_white'], [-11.4, 9.2, 'pigeon_grey'], [mx0 + 16, mzc + 12.5, 'pigeon_grey'], [mx0 + 17.1, mzc + 13.4, 'pigeon_white'], [LIBRARY.yard[2] - 8, -80, 'pigeon_grey'], [LIBRARY.yard[2] - 8.9, -79.2, 'pigeon_grey']]) critters.push({ model: m, at: [x, 0.05, z], rot: x * 3, range: [1.4, 1.2] });
// ducks on the east tank's open water, a kingfisher on the margin by a ghat
critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown'], area: [TANKS[0].rect[0], -62, TANKS[0].rect[2], -38], dist: tankD, a: [8, 6], ratio: 0.5, margin: 2.5, y: LEVEL, speed: 0.25, cycle: [18, 24] });
critters.push({ model: 'kingfisher', at: [TANKS[0].rect[0] - 0.2, height(TANKS[0].rect[0] - 0.2, 4) + 0.08, 4], rot: -Math.PI / 2, water: [TANKS[0].rect[0] + 3.2, 4, LEVEL], cycle: 36 });
// swallows' mud nests under the eave of two annexes' south fronts, away from the doors
for (const [i, a] of [ANNEXES[0], ANNEXES[2]].entries()) critters.push({ model: 'swallow_nest', at: [a.rect[0] + 1.4, 3.2, a.rect[3] + 0.44], rot: Math.PI / 2, cycle: 33 + 4 * i, flight: 9, radius: 10, side: i ? 1 : -1, rise: -0.8 });
// zebu in two of the village yards, off the way: they walk a little, graze and lift the head to the visitor
for (const [yi, models] of [[0, ['zebu_white', 'zebu_grey', 'zebu_red']], [4, ['zebu_grey', 'zebu_white']]]) {
  const y = yards()[yi], cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2;
  models.forEach((m, i) => critters.push({ model: m, at: [cx + (i - (models.length - 1) / 2) * 2.7, 0.05, cz + (i % 2 ? 1.2 : -1.0)], rot: 1.2 + i * 1.9 + yi, range: [1.3, 0.9], tau: 36 + i * 4 }));
}
export default { fish, flights, perches, critters };
