// Alexandria about 250 BC — the animals (src/engine/fauna.js; docs/settlements/alexandria.md §10): mullet in the harbour and at the
// quays, swifts and swallows over the water and the Canopic Way, black kites (the dark birds of the engine) circling over the
// Museion and the Pharos, sparrows on the paving, a heron and little egrets on the quay and at the lake.
import { SEA, GROUND, QUAY, PHAROS, MUSEION, AGORA, SEROUTE, wet, lots, isle } from './layout.js';
import { opened, walkDist } from './walk.js';
import { hash } from './soundmap.js';

const inWater = (x, z) => wet(x, z);
const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 4, size: [0.3, 0.5], palette: 'carp', y: SEA, area: [-200 + i * 100, -140, -150 + i * 100, -108], dist: inWater, margin: 1.5, a: [12, 5], ratio: 0.3, speed: 0.4, rise: 0.25 });
for (const [x0, z0, x1, z1] of [[-380, -150, -260, -105], [-190, -255, 40, -240]]) for (let i = 0; i < 3; i++) fish.push({ n: 3, size: [0.3, 0.5], palette: 'carp', y: SEA, area: [x0, z0, x1, z1], dist: inWater, margin: 1.3, a: [8, 6], ratio: 0.4, speed: 0.35, rise: 0.2 });

const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-200, -150], b: [380, -150] }, y: [2, 22], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, lane: { a: [-300, 68], b: [380, 68] }, y: [4, 16], speed: 8, half: 12 },
  { kind: 'swallow', n: 4, lane: { a: [60, -80], b: [60, 240] }, y: [4, 14], speed: 8, half: 8 },
  { kind: 'crow', n: 4, loop: { c: [PHAROS.c[0], PHAROS.c[1]], a: [34, 30], rot: 0.3 }, y: [70, 38], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [(MUSEION[0] + MUSEION[2]) / 2, -40], a: [70, 40], rot: 0.1 }, y: [40, 22], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [SEROUTE.rect[0] + 40, 150], a: [50, 40], rot: 0.2 }, y: [34, 20], speed: 8 },
  { kind: 'swallow', n: 4, lane: { a: [-420, 150], b: [-130, 150] }, y: [3, 12], speed: 8, half: 14 },
  { kind: 'swallow', n: 4, lane: { a: [90, 120], b: [90, 250] }, y: [3, 12], speed: 8, half: 10 },
];
flights.push(
  { kind: 'gull', n: 5, loop: { c: [60, -150], a: [70, 45], rot: 0.2 }, y: [16, 7], speed: 7 },
  { kind: 'gull', n: 4, lane: { a: [-200, -112], b: [380, -112] }, y: [3, 14], speed: 8, half: 22 },
  { kind: 'gull', n: 4, loop: { c: [-120, -232], a: [90, 20], rot: 0.1 }, y: [10, 5], speed: 7 },
  { kind: 'kite', n: 2, loop: { c: [150, -85], a: [40, 20], rot: 0.4 }, y: [30, 18], speed: 8 });
const perches = [];
for (const [x, z] of [[60, -78], [43, -79], [77, -78], [116, -83.5], [-60, -83.5]]) perches.push({ kind: 'pigeon', x, z, y: GROUND + 0.1, rot: x * 0.11, range: [1.5, 1.3] });
for (const [x, z] of [[30, -86], [110, -85], [200, -85], [-60, -86], [60, 70], [20, 70], [100, 112], [240, -50]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.07, range: [1.5, 1.3] });
// sparrows on the paving at the house fronts and about the agora's booths, near the visitor's usual ways
{ let k = 0; for (const l of lots()) { if (k++ % 9) continue; const [x0, z0, x1, z1] = l.rect; perches.push({ kind: 'sparrow', x: (x0 + x1) / 2, z: l.front === 'n' ? z0 - 0.6 : z1 + 0.6, y: GROUND + 0.1, rot: x0 * 0.05, range: [1.4, 1.2], alert: 4 }); } }
for (const [x, z] of [[AGORA[0] + 10, AGORA[1] + 20], [AGORA[0] + 30, AGORA[1] + 30], [AGORA[0] + 44, AGORA[1] + 24]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.3, range: [2, 1.5], alert: 4 });
perches.push({ kind: 'heron', x: 170, z: -91.5, y: GROUND, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: -40, z: 240, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: 120, z: 244, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §16.4) ──
// at the houses of the walk (nearest first): a dog at the door of the first four, a cat asleep on the sill or the threshold of the next four [stated: the cat revered in
// Egypt, Diodorus 1.83], hens and a cock in the court of two, pigeons before the harbour gate and the horrea, cormorants on the quay's edge and the pier [inferred: fishing in the
// harbour], geese and ducks at the water stairs, a kingfisher on the island's quay, goats in Rhakotis, cats in the Museion's colonnade
const critters = [], O = opened(), FRn = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
O.slice(0, 4).forEach(({ l, F, door }, i) => { const [x, z] = F.P(door + (i % 2 ? 1.6 : -1.6), -1.5), [ox, oz] = F.out; critters.push({ model: 'dog', at: [x, l.y, z], rot: Math.atan2(ox, oz) + (i % 2 ? 0.6 : -0.6), range: [9, 3.5] }); });
O.slice(4, 8).forEach(({ l, F, door, K }, i) => { const [x, z] = F.P(door - K.dw / 2 - 0.5, -0.5); critters.push({ model: i % 2 ? 'cat_orange' : 'cat_tabby', at: [x, l.y + 0.02, z], rot: Math.atan2(F.out[0], F.out[1]) + 1.2, range: [7, 2.5] }); });
O.slice(1, 3).forEach(({ l, F, K }, i) => {
  const [x, z] = F.P(K.sw + 2.2 + i, K.cv0 + 1.8);
  for (const [model, dx, dz, size] of [['rooster', 0, 0, 1], ['hen_brown', 1.0, 0.5, 1], ['hen_white', -0.9, 0.8, 0.96], ['hen_brown', 0.3, -0.9, 0.94]]) critters.push({ model, at: [x + dx, l.y + 0.03, z + dz], rot: i + dx, range: [3, 1.4], size });
});
for (const [x, z] of [[58, -81.8], [63.5, -81.8], [92, -82.6], [10, -82.4]]) critters.push({ model: x > 60 && x < 70 ? 'pigeon_white' : 'pigeon_grey', at: [x, GROUND + 0.05, z], rot: hash(x, z) * 6.28, range: [2.4, 1.6] });
[[96, -88.7], [118, -88.7], [150, -88.7], [-20, -88.7], [77.4, -117]].forEach(([x, z], i) => critters.push({ model: 'cormorant', at: [x, GROUND + 0.06, z], rot: Math.PI, cycle: 46 + 7 * (i % 3) }));
for (const [x, z] of [[113.2, -88.4], [188.8, -88.4], [-36.2, -88.4]]) {
  critters.push({ model: 'goose_white', at: [x + 1.6, GROUND + 0.05, z + 0.6], rot: 2.2, range: [3.2, 1.4] }, { model: 'goose_grey', at: [x - 0.6, GROUND + 0.05, z + 1.4], rot: 3.4, range: [3.2, 1.4] }, { model: 'duck_brown', at: [x + 3.0, GROUND + 0.05, z + 1.0], rot: 1.1, range: [3, 1.4] });
}
{ const I = isle(), [nx, nz] = I.nets[0] || [-190, -255.4]; critters.push({ model: 'kingfisher', at: [nx + 4, GROUND + 0.06, -249.5], rot: Math.PI, water: [nx + 4, -247.8, SEA], cycle: 34 }); }
{ let k = 0; for (const l of lots()) { if (l.quarter !== 'egyptian' || hash(l.rect[0], l.rect[1]) > 0.06 || k >= 8) continue; k++; const [x0, z0, x1, z1] = l.rect, f = FRn[l.front], x = (x0 + x1) / 2 + 1.5, z = l.front === 'n' ? z0 - 1.5 : z1 + 1.5; critters.push({ model: k % 2 ? 'goat_black' : 'goat_white', at: [x, l.y, z], rot: Math.atan2(f[0], f[1]), range: [8, 3] }); } }
for (const [x, z, m] of [[212, -66.8, 'cat_tabby'], [262, -66.8, 'cat_orange']]) critters.push({ model: m, at: [x, GROUND + 0.3, z], rot: 0.5, range: [7, 2.5] });
void QUAY; void walkDist;
export default { fish, flights, perches, critters };
