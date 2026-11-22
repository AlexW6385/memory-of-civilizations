// Borgund — the animals (src/engine/fauna.js draws them; docs/settlements/norse-borgund.md §10): trout (dark fish) in the
// river's pools, swallows over the meadows, the farms and the river, crows over the church and the slopes, sparrows
// in the farm yards and the churchyard, a grey heron on the river's bank.
import { LANDING, FARMS, YARD, RIVER, SETERS, riverZ, height, buildings, doorOf } from './layout.js';
import { nearestOpen } from './openwalk.js';

const fish = [];
for (const x of [-290, -250, -190, -130, -60, 20, 70, 110, 160, 200, 260]) {
  const rz = riverZ(x);
  fish.push({ n: 3, size: [0.3, 0.5], palette: 'carp', y: RIVER.level, area: [x - 12, rz - 2, x + 12, rz + 2], dist: (px, pz) => Math.abs(pz - riverZ(px)) - (RIVER.w / 2 - 2), margin: 1.5, a: [8, 3], ratio: 0.3, speed: 0.4, rise: 0.4 });
}
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, 20], a: [120, 60], rot: 0.1 }, y: [1.5, 6], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [LANDING.x, LANDING.rz], a: [30, 12], rot: 0 }, y: [0.5, 3], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [120, 0], a: [60, 40], rot: 0.5 }, y: [2, 8], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [0, -30], a: [40, 30], rot: 0.3 }, y: [24, 14], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [-120, -100], a: [90, 50], rot: 0.9 }, y: [45, 30], speed: 8 },
];
// the swallows nest in the barns: each farm has a pair about its yard
FARMS.forEach(([fx, fz], i) => { if (i % 2 === 0) flights.push({ kind: 'swallow', n: 2, loop: { c: [fx, fz], a: [24, 18], rot: i * 0.7 }, y: [1.2, 5], speed: 8 }); });
flights.push({ kind: 'crow', n: 3, loop: { c: [140, -130], a: [70, 40], rot: 0.2 }, y: [40, 28], speed: 8 });
const perches = [];
// sparrows on the barn doorsteps and the yards' woodpiles
buildings().filter((b) => b.kind === 'barn' && b.farm % 2 === 1).forEach((b) => { const x = (b.rect[0] + b.rect[2]) / 2, z = b.rect[3] + 1.4; perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.04, rot: b.seed % 3, range: [1.6, 1.4] }); });
for (const [fx, fz] of FARMS) perches.push({ kind: 'sparrow', x: fx + 4, z: fz + 14, y: height(fx + 4, fz + 14) + 0.04, rot: (fx * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[-24.2, -30], [-24.3, -14], [-23.8, -44], [-10, YARD[3] + 3], [10, YARD[3] + 2], [0, YARD[1] - 3]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.04, rot: x % 3, range: [1.6, 1.4] });
// a grey heron on the stony bank east of the quay
{ const x = LANDING.x + 22, z = riverZ(x) - 12.5; perches.push({ kind: 'heron', x, z, y: height(x, z), rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 }); }
{ const x = LANDING.x - 40, z = riverZ(x) - 12.5; perches.push({ kind: 'heron', x, z, y: height(x, z), rot: 1.2, stay: [60, 200], gone: [60, 180], alert: 10 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier "Round 6", R6.4) ──
// What lived in the tun of a Norwegian valley about 1250: dogs at the doors of the dwellings (the dossier's dogs "appear often" [stated: Landslov exhibition]),
// cats as mousers at the barns and lofts, hens and a cock scratching in the yards, geese on the river's bank at the landing, mallards on the slack water
// of the river, goats at the summer huts (goats and cows were milked there [stated: Landslov]), and the swallows' mud nests under the eaves of every second
// barn (the dossier: swallows nesting at every second farm). Hens, geese, mallards, cats and the swallows' nests are [inferred]: the dossier names dogs, cattle,
// horses, sheep, goats and pigs; the rigged models of the engine do not include cattle, horses, sheep or pigs, which stay the life figures'.
const critters = [];
const rnd = (a, b, c = 0) => { const k = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return k - Math.floor(k); };   // (a place's own number: no counters, no Math.random)
const open = nearestOpen(40);
const dwellings = open.filter((b) => b.kind === 'stue'), barns = open.filter((b) => b.kind === 'barn');
// a dog lying beside the door of each of the eight nearest dwellings, on the side of the door away from the cleared lane
dwellings.slice(0, 8).forEach((b) => {
  const { at, n } = doorOf(b), sd = b.seed % 2 ? 1 : -1, x = at[0] + n[0] * 2.1 - n[1] * 2.1 * sd, z = at[1] + n[1] * 2.1 + n[0] * 2.1 * sd;
  critters.push({ model: 'dog', at: [x, height(x, z) + 0.02, z], rot: rnd(x, z) * 6.28, range: [9, 3.5] });
});
// cats, the barns' mousers, on the barn doorsteps' far side
barns.slice(0, 6).forEach((b, i) => {
  const { at, n } = doorOf(b), sd = i % 2 ? 1 : -1, x = at[0] + n[0] * 0.9 - n[1] * 1.7 * sd, z = at[1] + n[1] * 0.9 + n[0] * 1.7 * sd;
  critters.push({ model: i % 2 ? 'cat_tabby' : 'cat_orange', at: [x, height(x, z) + 0.05, z], rot: rnd(x, z, 1) * 6.28, range: [7, 2.5] });
});
// a cock and hens scratching in the yards of the six nearest farms (the yard's middle is clear of buildings)
{
  const seen = new Set();
  for (const b of open) {
    if (seen.size >= 6) break;
    if (seen.has(b.farm)) continue; seen.add(b.farm);
    const [fx, fz] = FARMS[b.farm], x = fx + 3.5, z = fz - 3, y = height(x, z);
    critters.push({ model: 'rooster', at: [x, y, z], rot: rnd(x, z) * 6.28, range: [1.8, 1.4] }, { model: 'hen_brown', at: [x + 0.8, y, z + 0.6], rot: rnd(x, z, 4) * 6.28, range: [1.8, 1.4] }, { model: b.farm % 2 ? 'hen_white' : 'hen_brown', at: [x - 0.7, y, z + 1.3], rot: rnd(x, z, 5) * 6.28, range: [1.8, 1.4] });
  }
}
// geese on the grass of the river's bank at the landing
for (const [dx, m] of [[16, 'goose_grey'], [17.5, 'goose_white'], [18.6, 'goose_grey']]) { const x = LANDING.x + dx, z = riverZ(x) - RIVER.w / 2 - 1.8; critters.push({ model: m, at: [x, height(x, z), z], rot: rnd(x, z) * 6.28, range: [2.6, 1.6] }); }
// mallards on the slack water above the landing
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_white'], area: [LANDING.x - 60, riverZ(LANDING.x - 60) - 4, LANDING.x - 30, riverZ(LANDING.x - 30) + 4], dist: (x, z) => Math.abs(z - riverZ(x)) - (RIVER.w / 2 - 3), a: [8, 3], ratio: 0.3, margin: 1.4, y: RIVER.level, speed: 0.2, cycle: [18, 24] });
// goats about the summer huts (a hut's byre side), the milking goats
SETERS.forEach(([sx, sz], i) => { for (let k = 0; k < 3; k++) { const x = sx - 7 + k * 2.4 + rnd(sx, sz, k), z = sz + 9 + rnd(sx, sz, k + 3) * 2, m = (i + k) % 3 === 2 ? 'goat_black' : 'goat_white'; critters.push({ model: m, at: [x, height(x, z) + 0.05, z], rot: rnd(x, z) * 6.28, range: [9, 3.2] }); } });
// swallows' mud nests under the eaves of every second barn, on the wall away from the door, the birds sallying out over the yard
barns.filter((_, i) => i % 2 === 0).slice(0, 4).forEach((b, i) => {
  const [x0, z0, x1, z1] = b.rect, alongX = x1 - x0 >= z1 - z0, { n } = doorOf(b), H = 3.9 + (b.v ? (b.v[0] - 0.5) * 0.5 : 0);
  const wx = alongX ? (x0 + x1) / 2 + 1.2 : n[0] > 0 ? x0 - 0.14 : x1 + 0.14, wz = alongX ? (n[1] > 0 ? z0 - 0.14 : z1 + 0.14) : (z0 + z1) / 2 + 1.2;
  const out = alongX ? [0, n[1] > 0 ? -1 : 1] : [n[0] > 0 ? -1 : 1, 0];
  critters.push({ model: 'swallow_nest', at: [wx, b.y + H - 0.4, wz], rot: Math.atan2(out[1], out[0]), cycle: 33 + (b.seed % 5), flight: 9, radius: 10, side: i % 2 ? 1 : -1, rise: -0.8 });
});
// the flock of sheep west of the churchyard wall, in the first view from the arrival (critter-models-farm.js): on the seven places where town.js's still sheep stood; the herder stays still life
[[-37.8, -40.9, 'sheep_white'], [-46.1, -37.7, 'sheep_white'], [-44.7, -37.1, 'sheep_dark'], [-41.8, -34.6, 'sheep_white'], [-41, -40.5, 'sheep_white'], [-42.7, -47.7, 'sheep_dark'], [-41.1, -39.1, 'sheep_white']]
  .forEach(([x, z, m], i) => critters.push({ model: m, at: [x, height(x, z), z], rot: 0.6 + i * 0.9, range: [2.2, 1.6], tau: 28 + i * 2.5 }));
export default { fish, flights, perches, critters };
