// Paris in 1248 — the animals (src/engine/fauna.js draws them; docs/settlements/paris.md §5c): swallows and house martins
// over the Seine and the rues, rooks and jackdaws about the towers of Notre-Dame and the palace roofs at twilight, house
// sparrows on the paving and the parvis, a grey heron on the Left Bank's strand.
import { NORTH_ARM, SOUTH_ARM, CATHEDRAL, PALACE, PARVIS, RADIUS, streets, inBlock, inRiver } from './layout.js';
import { ground } from './ground.js';
import { courtLots } from './court-lots.js';

const mid = (a) => (a[1] + a[3]) / 2;
const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, mid(NORTH_ARM)], b: [200, mid(NORTH_ARM)] }, y: [-0.5, 3.5], speed: 9, a: [26, 12] },
  { kind: 'swallow', n: 3, lane: { a: [-200, mid(SOUTH_ARM)], b: [200, mid(SOUTH_ARM)] }, y: [-0.5, 3.5], speed: 9, a: [26, 10] },
  { kind: 'swallow', n: 3, loop: { c: [(PARVIS[0] + PARVIS[2]) / 2, 0], a: [34, 22], rot: 0.3 }, y: [14, 6], speed: 8 },
  // rooks and jackdaws round the west towers (69 m) and the spire, at twilight
  { kind: 'crow', n: 9, loop: { c: [CATHEDRAL[0] + 14, 0], a: [34, 26], rot: 0 }, y: [78, 52], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [(PALACE[0] + PALACE[2]) / 2 + 40, -20], a: [40, 24], rot: 0.5 }, y: [42, 24], speed: 9 },
];
const perches = [];
// house sparrows on the paving of the rues and the parvis, hopping about a spot
{
  let k = 0;
  for (const r of streets()) {
    const w = r[2] - r[0];
    if (w > 700) continue;
    for (let i = 0; i < Math.max(1, Math.floor(w / 90)); i++) {
      const x = r[0] + (i + 0.5) * w / Math.max(1, Math.floor(w / 90)) + (k % 5) * 3, z = (r[1] + r[3]) / 2 + ((k * 7) % 5 - 2) * 0.3;
      if (Math.hypot(x, z) > RADIUS - 70 || inRiver(x, z)) continue;
      perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: 0.4 + (k % 7) * 0.8, range: [1.4, 1.2] });
      k++;
    }
  }
}
for (const [x, z] of [[118, 20], [132, -14], [140, 30], [124, -30]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: x % 3, range: [1.8, 1.5] });
// a grey heron on the strand of the Left Bank, facing the water
perches.push({ kind: 'heron', x: 38, z: SOUTH_ARM[3] + 2.2, y: ground.height(38, SOUTH_ARM[3] + 2.2), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void inBlock;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/paris.md §6d) ──
const critters = [];
const hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
const at = (x, z, dy = 0) => [x, ground.height(x, z) + dy, z];
/** The Seine's water as signed distance (negative inside, metres to the nearer bank) for floaters: the arms' water rectangles of plan.js. */
const ARM_WATER = [[-348, NORTH_ARM[1] + 2, 348, NORTH_ARM[3] - 2], [-348, SOUTH_ARM[1] + 2, 348, SOUTH_ARM[3] - 2]];
export const riverDistance = (x, z) => Math.min(...ARM_WATER.map((r) => { const dx = Math.max(r[0] - x, x - r[2]), dz = Math.max(r[1] - z, z - r[3]); return dx > 0 || dz > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) : Math.max(dx, dz); }));
const WATER = -3;                                                                     // RIVER.level
// pigeons on the parvis before Notre-Dame, among the stalls and the market's crumbs (the cries list pigeons for sale, "Crieries de Paris", 1265 [stated]; a flock about a church is [inferred])
[[116, 2, 'grey'], [125, -6, 'grey'], [131, 5, 'white'], [121, 9, 'grey'], [136, -3, 'dark'], [141, 8, 'grey'], [112, -9, 'grey'], [128, 14, 'grey']].forEach(([x, z, v], i) => critters.push({ model: 'pigeon_' + v, at: at(x, z), rot: i * 1.9, range: [2.6, 1.8], tau: 9 + (i % 4), speed: 0.34, stride: 0.1, size: 0.97 + 0.05 * (i % 3) }));
// pigeons in the palace court by the well and the May tree [inferred: the court's own dovecote, the palace's doves; court.js has them as figures too]
[[-224, -22, 'grey'], [-231, -24, 'grey'], [-236, 20, 'dark'], [-241, 14, 'grey']].forEach(([x, z, v], i) => critters.push({ model: 'pigeon_' + v, at: at(x, z), rot: 0.8 + i * 1.7, range: [2.2, 1.6], tau: 10, speed: 0.33, stride: 0.1 }));
// the court row's service yards: hens scratching in the carters' passage to the kitchen yard and the woodyard, a cock on the log pile (the kitchens kept poultry [inferred])
critters.push({ model: 'rooster', at: at(-146, 31), rot: 2.4, range: [3, 2], tau: 15, speed: 0.5, stride: 0.22 });
for (const [model, x, z] of [['hen_brown', -192.4, 30.2], ['hen_brown', -190.4, 32.4], ['hen_white', -194.2, 33.0], ['hen_brown', -148.6, 29.4], ['hen_white', -144.2, 33.2]]) critters.push({ model, at: at(x, z), rot: hashAt(x, z) * 6, range: [2.6, 1.7], tau: 13, speed: 0.46, stride: 0.2 });
// geese driven to market on the Left Bank's strand and grazing at the water [stated: flocks of sheep, pigs and cows were driven to the markets, Wikipedia "Paris in the Middle Ages"; goslings are among the cries of the *Crieries*; the geese themselves are [inferred]]
for (const [model, x, z] of [['goose_white', -22, 153.2], ['goose_white', -17.5, 154.4], ['goose_grey', -20, 156], ['goose_white', -14, 152.6]]) critters.push({ model, at: at(x, z), rot: 1.6 + hashAt(x, z), range: [4.5, 2.2], tau: 16, speed: 0.4, stride: 0.34 });
// mallards and a farm duck or two on the Seine's south arm in the lee of the bank, and on the north arm west of the Grand Pont
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_white', 'duck_brown'], area: [22, 124, 62, 146], dist: riverDistance, a: [9, 3.2], ratio: 0.45, margin: 1.6, y: WATER, speed: 0.2, cycle: [16, 22] });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_brown'], area: [-130, -163, -80, -150], dist: riverDistance, a: [9, 2.8], ratio: 0.35, margin: 1.5, y: WATER, speed: 0.24, cycle: [17, 23] });
// a kingfisher on the Right Bank's strand west of the Grand Pont, watching the water
{ const x = -100, z = NORTH_ARM[1] + 0.6; critters.push({ model: 'kingfisher', at: at(x, z, 0.06), rot: Math.PI / 2, water: [x, z + 1.6, WATER], cycle: 36 }); }
// cats where the sun falls: by the well's foot in the court, and at the baker's corner of the court row (mousers of the granary and the bakehouse) [inferred]
critters.push({ model: 'cat_tabby', at: at(-226.6, -26.4, 0.02), rot: 0.4, range: [7, 2.5] });
{ const b = courtLots()[0]; critters.push({ model: 'cat_orange', at: at(b.rect[0] + 0.55, b.rect[1] - 0.6, 0.02), rot: -1.2, range: [7, 2.5] }); }
// a hound at the court's hitching rail (the grooms' dog) and a butcher's dog before the first butcher's shop of the court row
critters.push({ model: 'dog', at: at(-229, 17.4, 0.02), rot: 1.2, range: [9, 3.5] });

export default { fish: [], flights, perches, critters };
