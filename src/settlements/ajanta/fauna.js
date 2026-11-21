// Ajanta — the animals (src/engine/fauna.js; docs/settlements/ajanta.md §9): swifts and swallows over the river and the pocket
// [inferred: cliff-nesting birds], kites and ravens high along the rim, sparrows at the village and on the ledge, an egret
// in the shallows, small fish in the Waghora.
import { RIVER, riverX, XF, VILLAGE, FALL, FLOOR, GHATS, SHELTER, rng } from './layout.js';
import { openHouses, doorway } from './walk.js';
import { ground } from './ground.js';
import { lots } from './town.js';

const fish = [];
for (let z = -60; z <= 60; z += 40) fish.push({ n: 3, size: [0.12, 0.2], palette: 'carp', y: RIVER.water, dist: (x, zz) => Math.abs(x - riverX(zz)) - RIVER.w / 2, margin: 0.5, k: 1, rot: 0, area: [riverX(z) - 0.4, z - 12, riverX(z) + 0.4, z + 12], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 7, loop: { c: [XF + 30, 0], a: [34, 40], rot: 0 }, y: [3, 24], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [XF + 10, -50], b: [XF + 10, 50] }, y: [8, 26], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [XF - 10, 0], a: [40, 110], rot: 0 }, y: [38, 62], speed: 8 },
];
flights[1].a = [26, 3];
flights.push({ kind: 'swallow', n: 6, lane: { a: [XF + 20, -50], b: [XF + 20, 50] }, y: [1, 6], speed: 8 });
flights.push({ kind: 'swallow', n: 5, loop: { c: [VILLAGE[0] + 30, 40], a: [28, 30], rot: 0.4 }, y: [4, 14], speed: 8 });
flights.push({ kind: 'crow', n: 4, loop: { c: [VILLAGE[0] + 30, 40], a: [40, 36], rot: 0.2 }, y: [16, 30], speed: 7 });
const perches = [];
// sparrows on the ledge's kerb and the shelves of the niches, on the huts' ridges and by the washing places
for (const z of [-40, -12, 6, 22, 33, 44, 52]) perches.push({ kind: 'sparrow', x: XF + 5.7, z, y: FLOOR[1] + 0.52, rot: z % 3, range: [1.6, 0] });
lots().forEach((l, k) => { if (k % 3 === 0) perches.push({ kind: 'sparrow', x: (l.rect[0] + l.rect[2]) / 2, z: (l.rect[1] + l.rect[3]) / 2, y: 8 + (l.variant === 3 ? 3.2 : 3.85), rot: k, range: [l.variant === 3 ? 1.6 : 0.8, 0], alert: 5 }); });
for (const gz of GHATS) perches.push({ kind: 'sparrow', x: riverX(gz) - 6.0, z: gz + 2.8, y: 0.12, rot: gz % 3, range: [1.2, 1.2] });
// herons and egrets in the Waghora's shallows
perches.push({ kind: 'egret', x: riverX(-5) + 3.8, z: -5, y: -0.6, rot: 1.2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: riverX(55) - 3.5, z: 55, y: -0.6, rot: -1.0, stay: [90, 260], gone: [80, 200], alert: 12 });
for (const [x, z] of [[VILLAGE[0] + 8, 30], [VILLAGE[0] + 20, 36], [VILLAGE[0] + 30, 22], [XF + 3, -20], [XF + 3.5, 10], [XF + 4, 40], [-48, -30], [-48, 20]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// the egret in the shallows of the waterfall's pool, facing the water
{ const x = FALL.pool[0] + 3.5, z = FALL.pool[1] + 2; perches.push({ kind: 'egret', x, z, y: -0.6, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §19) ──
// [inferred throughout: nothing here is sourced to Ajanta itself; these are the animals of a Deccan village and a pilgrimage cliff of the 5th century]: village dogs lying
// at the doors of the open huts and at the shelter, hens and a cock in the yards, goats on the village's open ground, blue rock pigeons on the ledge and on the
// wayside stupa (the cliff is their natural roost), a cat at the lamp-seller's booth and on a hut's step, bar-headed geese (the hamsa of the cave paintings) and ducks
// on the slack water of the river above the ford, a kingfisher on the west bank. No peafowl, monkeys or zebu are rigged (the engine has no model): the zebu and buffalo are the life figures'.
const critters = [];
const gy = (x, z) => ground.height(x, z) + 0.05;
// the dogs: beside the doors of two of the open huts (not in the door's lane: 2.1 m aside, in the front yard), one by the pilgrims' shelter, one on the ledge's foot
{
  const hs = openHouses();
  [[0, 1], [3, -1]].forEach(([i, sd], k) => { const h = hs[i]; if (!h) return; const d = doorway(h), u = d.uc + sd * 2.1 > 0.3 && d.uc + sd * 2.1 < d.W - 0.3 ? d.uc + sd * 2.1 : d.uc - sd * 2.1, [x, z] = d.P(u, -2.0); critters.push({ model: 'dog', at: [x, gy(x, z), z], rot: 1.1 + k * 2, range: [9, 3.5] }); });
  if (hs[2]) { const d = doorway(hs[2]), u = d.uc < d.W / 2 ? d.uc + 2.2 : d.uc - 2.2, [x, z] = d.P(u, -2.0); critters.push({ model: 'cat_tabby', at: [x, gy(x, z), z], rot: 2.4, range: [7, 2.5] }); }
}
critters.push({ model: 'dog', at: [SHELTER[0] - 1.6, 0.05, SHELTER[1] + 3.5], rot: 0.5, range: [9, 3.5] }, { model: 'dog', at: [XF + 12, 0.05, -52.5], rot: 3.8, range: [9, 3.5] });
// the cat on the ground between the lamp-seller's booth and the cloth-seller's (the booths are at z -46.9, x -27 and -22)
critters.push({ model: 'cat_orange', at: [-24.5, 0.05, -45.2], rot: 3.0, range: [7, 2.5] });
// hens and a cock in the front yards of four huts that are not open (the yards: 2 m before the front, away from the door)
{
  let n = 0;
  for (const l of lots()) {
    if (l.open || l.craft || n >= 4) continue;
    if (Math.hypot((l.rect[0] + l.rect[2]) / 2 - 40, (l.rect[1] + l.rect[3]) / 2 - 30) > 70) continue;
    const r = rng(l.seed ?? 1), W = l.rect[2] - l.rect[0], uc = W * (0.38 + r() * 0.24), P = (u, v) => (l.front === 's' ? [l.rect[0] + u, l.rect[3] + v] : [l.rect[2] - u, l.rect[1] - v]);
    const u0 = uc < W / 2 ? W - 1.0 : 1.0, [x, z] = P(u0, 2.2), pt = (dx, dz) => [x + dx, gy(x + dx, z + dz), z + dz];
    critters.push({ model: n % 2 ? 'rooster' : 'hen_brown', at: pt(0, 0), rot: n, range: [1.8, 1.4] }, { model: n % 2 ? 'hen_white' : 'hen_brown', at: pt(0.7, 0.5), rot: n + 2, range: [1.8, 1.4], size: 0.93 });
    if (n % 2 === 0) critters.push({ model: 'rooster', at: pt(-0.8, 0.4), rot: n + 4, range: [1.8, 1.4], size: 0.96 });
    n++;
  }
}
// goats on the open ground of the village's yard
critters.push({ model: 'goat_white', at: [47, gy(47, 22), 22], rot: 0.6, range: [9, 3.2] }, { model: 'goat_black', at: [48.4, gy(48.4, 23), 23], rot: 3.2, range: [9, 3.2] }, { model: 'goat_black', at: [56, gy(56, 36), 36], rot: 1.6, range: [9, 3.2] });
// the rock pigeons: on the ledge before the caves (clear of the visitor's line along it at XF + 4) and on the platform of the wayside stupa
for (const [z, m] of [[-40, 'pigeon_grey'], [-39.2, 'pigeon_white'], [2, 'pigeon_grey'], [2.9, 'pigeon_grey'], [36, 'pigeon_grey'], [36.8, 'pigeon_white']]) critters.push({ model: m, at: [XF + 3.4, FLOOR[1] + 0.05, z], rot: z * 3, range: [1.2, 1.1] });
critters.push({ model: 'pigeon_grey', at: [-15.6, 0.44, 9.9], rot: 1.0, range: [0.4, 0.4] });
// the geese and ducks on the slack water of the river above the ford (the loop follows the river's axis)
critters.push({ type: 'floaters', models: ['goose_white', 'goose_grey', 'duck_brown'], area: [riverX(-30) - 0.4, -36, riverX(-30) + 0.4, -22], dist: (x, zz) => Math.abs(x - riverX(zz)) - RIVER.w / 2, a: [7, 1.7], ratio: 0.22, margin: 1.0, minA: 1.2, y: RIVER.water, speed: 0.22, cycle: [18, 24], size: 0.95 });
// a kingfisher on the west bank below the second washing place, looking at the water
{ const z = 52, x = riverX(z) - 6.0; critters.push({ model: 'kingfisher', at: [x, gy(x, z) + 0.05, z], rot: Math.PI / 2, water: [riverX(z) - 3.0, z, RIVER.water], cycle: 36 }); }
export default { fish, flights, perches, critters };
