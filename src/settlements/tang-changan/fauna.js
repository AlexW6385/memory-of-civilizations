// Tang Chang'an — the animals (src/engine/fauna.js draws them; dossier §13): sparrows hopping on the earth of the streets and the walls'
// coping, pigeons round the pagoda and the temple roofs, magpies in the locusts of the avenue, crows over the wards at dusk,
// swallows over the avenue and the ditches' water. All places are derived from layout.js.
import { ground } from './ground.js';
import { PAGODA, DACI, DACI_AX, DACI_MAIN, WARDS, DITCH, RADIUS, CRIT, inDitch, marketYards } from './layout.js';

// small carp and loaches in the avenue's ditches (shallow water, 3 m wide): schools along the two ditches in several reaches
const cxd = (DITCH.in + DITCH.out) / 2, hwd = (DITCH.out - DITCH.in) / 2, fish = [];
const dd = (x, z) => (inDitch(x, z) ? hwd - Math.abs(Math.abs(x) - cxd) : -1);
for (const sd of [-1, 1]) for (let z0 = -400; z0 < 400; z0 += 80) fish.push({ n: 3, size: [0.14, 0.26], palette: 'carp', y: DITCH.water, dist: dd, margin: 0.35, k: 1, rot: Math.PI / 2, area: [sd * cxd - 0.6, z0 + 8, sd * cxd + 0.6, z0 + 72], a: [14, 0.7], ratio: 0.1, minA: 0.8, speed: 0.25, rise: 0 });
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-30, -300], b: [-30, 300] }, y: [1.5, 7], speed: 9, a: [26, 4] },
  { kind: 'swallow', n: 4, lane: { a: [30, -300], b: [30, 300] }, y: [1.5, 7], speed: 9, a: [26, 4] },
  { kind: 'pigeon', n: 9, loop: { c: [PAGODA[0], PAGODA[1]], a: [40, 30], rot: 0.3 }, y: [18, 40], speed: 7 },
  { kind: 'pigeon', n: 6, loop: { c: [DACI_AX, DACI.rect[1] + 120], a: [50, 30], rot: 0.2 }, y: [10, 22], speed: 7 },
  { kind: 'swallow', n: 4, loop: { c: [DACI_AX, 80], a: [30, 20], rot: 0 }, y: [4, 14], speed: 8 },
  { kind: 'crow', n: 7, loop: { c: [-137, -110], a: [90, 60], rot: 0.5 }, y: [30, 14], speed: 9 },
];
const perches = [];
// sparrows on the avenue's earth and the lanes' crossings, on the ward walls' coping
const spots = [[-20, 40], [24, 60], [-14, 120], [20, 160], [-26, -50], [18, -90], [-12, -160], [26, -220], [60, 0], [-60, 4], [-90, 12], [110, 10], [-137, 20], [-137, 90], [137, 215], [-137, 215], [137, -215]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: 0.3 + ((x * 7) % 3), range: [1.4, 1.3] });
for (const w of WARDS) perches.push({ kind: 'sparrow', x: w.rect[0] + 40, z: w.rect[1] + 1.3, y: 3.6 + 0.3, rot: 0, range: [2.6, 0], alert: 5 });
// magpies in the locusts along the avenue
for (const z of [-80, 30, 100, 200]) perches.push({ kind: 'magpie', x: 49.8, z, y: 0.05, rot: 1.2, range: [2.2, 1.6], alert: 7 });
void ground; void DITCH; void RADIUS;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/tang-changan.md §20) ──
// Dogs lie at the lane crossings of the wards, at the kitchen door of Daci'en and in the caravanserai yards (they rise and face the visitor
// who comes close); a cat sleeps on the kitchen's platform and the sutra hall's step; pigeons walk and peck on the court's brick before the
// main hall; a rooster and hens range the lane of the ward nearest the temple (the temple itself keeps no fowl: a Buddhist kitchen).
// Within CRIT m of the origin only (the rig is drawn to 95 m, and further wards keep their static dogs: dress.js).
const critters = [];
for (const w of WARDS) {
  if (w.kind === 'daci\'en' || w.kind === 'daoist' || w.kind === 'market') continue;
  const [cx, cz] = w.c;
  if (Math.hypot(cx, cz) > CRIT) continue;
  const k = Math.round(cx * 7 + cz * 3);
  critters.push({ model: 'dog', at: [cx + 5.5, 0, cz - 3], rot: (k % 7) * 0.9, range: [9, 3.5] });                          // (the place of dress.js's static dog, which it replaces)
}
const ax = DACI_AX, mh = DACI_MAIN[1];
critters.push({ model: 'dog', at: [80.6, 0, 94.6], rot: 0.5, range: [9, 3.5] });                                              // by the kitchen door
critters.push({ model: 'cat_orange', at: [87.6, 0.35, 90.6], rot: 2.7, range: [7, 2.5] });                                   // asleep on the kitchen's platform, in the sun
critters.push({ model: 'cat_tabby', at: [90.3, 0.7, 119.6], rot: 0.9, range: [7, 2.5] });                                   // on the sutra hall's platform, by its stair
for (const [model, dx, dz, r, size] of [['pigeon_grey', -12, 134, 0.4, 1], ['pigeon_white', -10.6, 135.5, 2.2, 1], ['pigeon_dark', 5, 137, 4.0, 0.97], ['pigeon_grey', 12.4, 135, 1.1, 1.02], ['pigeon_grey', 2, 147, 5.3, 1]]) critters.push({ model, at: [ax + dx, 0, dz], rot: r, range: [3.4, 2.2], tau: 12, speed: 0.4, stride: 0.1, size });
void mh;
// the ward nearest the temple (E0S1, south of Daci'en's): a rooster and three hens in the lane
{
  const w = WARDS.filter((q) => q.kind !== 'daci\'en' && q.kind !== 'daoist' && q.kind !== 'market').sort((a, b) => Math.hypot(a.c[0] - ax, a.c[1] - 112) - Math.hypot(b.c[0] - ax, b.c[1] - 112))[0], [cx, cz] = w.c;
  for (const [model, dx, dz, size] of [['rooster', -10.5, 1.2, 1], ['hen_brown', -9.4, 1.9, 1], ['hen_white', -11.4, 2.3, 0.96], ['hen_brown', -10.0, 0.0, 0.94]]) critters.push({ model, at: [cx + dx, 0, cz + dz], rot: dx, range: [3.2, 1.0], size });
}
// the caravanserai yards: a watch-dog lying near the stables, a cat on the sacks
for (const [k, m] of marketYards().filter((q) => q.kind === 'caravanserai').entries()) {
  critters.push({ model: 'dog', at: [m.yard[0] + 12, 0, m.yard[1] + 20 + k * 3], rot: 1.0 + k, range: [9, 3.5] });
  if (k === 0) critters.push({ model: 'cat_tabby', at: [m.yard[0] + 19.5, 0, m.yard[1] + 12], rot: 3.8, range: [7, 2.5] });
}

export default { fish, flights, perches, critters };
