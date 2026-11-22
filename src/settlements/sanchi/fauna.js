// Sanchi — the animals (src/engine/fauna.js draws them; docs/settlements/sanchi.md §12–13): swifts and swallows circling the dome and
// the gateways and skimming the tank, crows over the hill and the village, sparrows on the paving, the stalls' awnings and the
// ridges and parapets along the streets, carp in the tank, egrets and a heron at its margin and in the plain's fields.
import { TEMPLE40, TANK, TOP, HALL, tankD, lots, yards } from './layout.js';
import { houseDoor } from '../../styles/indian/village.js';
import { SUMMIT_STALLS } from './summit.js';
import { ground } from './ground.js';

const area = [TANK.c[0] - TANK.r[0], TANK.c[1] - TANK.r[1], TANK.c[0] + TANK.r[0], TANK.c[1] + TANK.r[1]];
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 3, size: [0.45, 0.7], palette: 'carp', y: TANK.level, area, dist: tankD, margin: 2.5, a: [24, 11], ratio: 0.5, speed: 0.3, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 0], a: [34, 30], rot: 0.2 }, y: [26, 38], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [20, 10], a: [70, 40], rot: 0.5 }, y: [24, 34], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-140, 0], a: [30, 24], rot: 0.1 }, y: [4, 12], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [TANK.c[0], TANK.c[1]], a: [44, 20], rot: 0, dist: tankD, margin: 3 }, y: [0.4, 2.2], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [0, 20], a: [140, 100], rot: 0.4 }, y: [55, 85], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, 175], a: [90, 40], rot: 0.2 }, y: [10, 24], speed: 8 },
];
const perches = [];
// sparrows on the paving: round the stupa's ground walk, at the south gate, the monastery court, the temple platform's steps, along the way and its stalls
const spots = [[-17, 8], [16, -10], [3, -22], [-4, 25], [10, 30], [-10, 40], [30, 8], [49, 8], [44, 24], [TEMPLE40.c[0] - 25, 62], [-60, 20], [60, -60], [-30, -50], [5, -90], [-140, -30], [-120, 10], [-60, 150], [20, 140], [90, 160], [-20, 190], [2, 54], [-3, 69], [3, 85], [0, 100], [4, 131], [-5, 146]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.04, rot: (x * 7) % 3, range: [1.8, 1.6], alert: 5 });
// on the stalls' ridges
for (const [x, z] of SUMMIT_STALLS.filter((_, i) => i % 3 === 0)) perches.push({ kind: 'sparrow', x, z, y: 22 + 3.4, rot: 1.57, range: [2.6, 0], alert: 6 });
// sparrows and crows on the ridges and parapets along the streets, a share of the houses
{
  let n = 0;
  for (const l of lots()) {
    if (!l.main || n > 34 || (l.seed % 3) || l.farm) continue;
    const [x0, z0, x1, z1] = l.rect;
    perches.push({ kind: n % 4 === 3 ? 'crow' : 'sparrow', x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: l.kind === 'mud' ? 3.95 : l.kind === 'merchant' ? 7.2 : 4.7, rot: l.seed % 6, range: [2.4, 0], alert: 6 });
    n++;
  }
}
// egrets in the plain's fields south-west of the village; an egret and a heron at the tank's margin
for (const [x, z] of [[-60, 255], [40, 268]]) perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: 0.8, stay: [80, 240], gone: [40, 150], alert: 10 });
for (const [kind, a] of [['egret', -0.6], ['heron', 2.4]]) {
  let best = null;
  for (let d = 1; d < 4 && !best; d += 0.5) { const x = TANK.c[0] + Math.cos(a) * (TANK.r[0] + d), z = TANK.c[1] + Math.sin(a) * (TANK.r[1] + d); if (Math.abs(tankD(x, z) - 0.5) < 3.5) best = [x, z]; }
  if (best) { const [x, z] = best; perches.push({ kind, x, z, y: ground.height(x, z), rot: Math.atan2(TANK.c[1] - z, TANK.c[0] - x), stay: [80, 240], gone: [40, 150], alert: 10 }); }
}

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §23) ──
// The animals of a pilgrim village on the plain of the Betwa [inferred: nothing here is sourced to Sanchi itself; they are the animals of any village of the Ganges-Malwa plains
// of the time]: village dogs lying at the stair's foot, on the summit's way and at the door of a shop, cats on the platforms of homes (the household cat is old in India), hens and
// a cock in the yards (the jungle fowl domesticated in the Indus valley and the plains), goats in two other yards, rock pigeons on the stupa's paving and in the first
// monastery's court (they come to the offerings), a goose of the grey kind (the bar-headed goose, the hamsa, is carved on Ashoka's pillar's abacus) and ducks on the
// tank, a kingfisher at the ghat; zebu graze on the open ground between the hill's foot and the first rows (critter-models-farm.js; village.js draws the other cattle there as still life). No peafowl.
const critters = [];
const lotOf = (kind, n) => lots().filter((l) => l.open && !l.farm && l.kind === kind).sort((a, b) => Math.hypot(a.rect[0], a.rect[1] - 150) - Math.hypot(b.rect[0], b.rect[1] - 150)).slice(0, n);
const platform = (l, side, u) => { const F = houseDoor({ rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, fr: l.fr }); return F.Pf(F.du + side * u, -0.7); };
critters.push({ model: 'dog', at: [-6.4, TOP + 0.04, 90], rot: 1.1, range: [9, 3.5] });
critters.push({ model: 'dog', at: [-6.8, 0.02, 139], rot: 2.2, range: [9, 3.5] });
{ const l = lotOf('shop', 4)[1]; if (l) { const [x, z] = platform(l, 1, 1.5); critters.push({ model: 'dog', at: [x, 0.42, z], rot: 2.0, range: [7, 3] }); } }
lotOf('home', 3).forEach((l, i) => { if (i === 2) return; const [x, z] = platform(l, i ? -1 : 1, 1.5); critters.push({ model: i ? 'cat_tabby' : 'cat_orange', at: [x, 0.42, z], rot: 2.4 + i, range: [6, 2.5] }); });
const pens = yards().filter((y) => y.rect[2] - y.rect[0] >= 10).sort((a, b) => Math.hypot(a.rect[0], a.rect[1] - 150) - Math.hypot(b.rect[0], b.rect[1] - 150));
pens.slice(0, 2).forEach((y, i) => { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: 'rooster', at: [cx - 3.2, 0.05, cz + 1.2], rot: i, range: [2.0, 1.4], size: 0.95 }, { model: i % 2 ? 'hen_white' : 'hen_brown', at: [cx - 2.4, 0.05, cz + 1.9], rot: i + 2, range: [2.0, 1.4], size: 0.92 }, { model: 'hen_brown', at: [cx - 3.8, 0.05, cz + 2.1], rot: i + 4, range: [2.0, 1.4], size: 0.9 }); });
pens.slice(2, 4).forEach((y, i) => { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: i ? 'goat_white' : 'goat_black', at: [cx + 0.6, 0.05, cz - 2.6], rot: 0.6 + i, range: [9, 3.2] }, { model: i ? 'goat_black' : 'goat_white', at: [cx - 1.6, 0.05, cz - 2.2], rot: 3 + i, range: [9, 3.2] }); });
for (const [x, z, m] of [[3.4, 27.5, 'pigeon_grey'], [4.6, 28.4, 'pigeon_white'], [-4.4, 27.0, 'pigeon_grey'], [41, 24.5, 'pigeon_grey'], [42.1, 25.3, 'pigeon_white']]) critters.push({ model: m, at: [x, TOP + 0.04, z], rot: x * 3, range: [1.4, 1.2] });
const tkArea = [TANK.c[0] - TANK.r[0], TANK.c[1] - TANK.r[1], TANK.c[0] + TANK.r[0], TANK.c[1] + TANK.r[1]];
critters.push({ type: 'floaters', models: ['goose_grey', 'goose_grey', 'duck_brown', 'duck_white'], area: tkArea, dist: tankD, a: [16, 9], ratio: 0.5, margin: 2.5, y: TANK.level, speed: 0.25, cycle: [18, 24] });
{ const x = TANK.c[0] + 9, zEdge = TANK.c[1] - TANK.r[1] * Math.sqrt(1 - ((x - TANK.c[0]) / TANK.r[0]) ** 2); critters.push({ model: 'kingfisher', at: [x, ground.height(x, zEdge - 1.2) + 0.08, zEdge - 1.2], rot: Math.PI / 2, water: [x, zEdge + 3, TANK.level], cycle: 36 }); }
// zebu on the open ground between the hill's foot and the first rows (village.js leaves those places to the critters)
for (const [x, z, m, rot] of [[-48, 134, 'zebu_red', 0.8], [-45.6, 136.4, 'zebu_white', 2.4], [48, 135, 'zebu_grey', 4.1], [50.6, 133.2, 'zebu_white', 5.2], [66, 132, 'zebu_red', 1.2], [96, 160, 'zebu_white', 0.3]]) critters.push({ model: m, at: [x, ground.height(x, z), z], rot, range: [3.5, 2.5], tau: 34 + (x % 7) });
void HALL;
export default { fish, flights, perches, critters };
