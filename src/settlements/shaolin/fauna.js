// Shaolin — the animals (src/engine/fauna.js draws them; docs/settlements/shaolin.md §7): swallows over the courts and the village, sparrows
// on the paving and the wall copings, crows and a few doves high over the pagodas and the slopes of Mount Song. No water, so no fish.
import { WALL, HOUSES, rng } from './layout.js';
import { ground } from './ground.js';
import { openedHouses, frontOf } from './walk.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, 60], a: [40, 30], rot: 0 }, y: [4, 14], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, 150], a: [70, 14], rot: 0 }, y: [3, 11], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [-140, 70], a: [40, 40], rot: 0.3 }, y: [14, 34], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [20, -150], a: [70, 30], rot: 0.5 }, y: [40, 80], speed: 8 },
];
const perches = [];
const sp = (x, z, y, rot = 0, range = [1.8, 1.6]) => perches.push({ kind: 'sparrow', x, z, y, rot, range, alert: 5 });
for (const [x, z] of [[8, 110], [-9, 100], [12, 70], [-14, 60], [7, 28], [-8, 14], [10, -18], [-10, -40], [6, -70], [-12, -76], [0, 140], [20, 143]]) sp(x, z, ground.height(x, z) + 0.06);
// on the copings of the compound's walls (4.6 m high with the tiles' rise)
for (const [x, z, rot] of [[WALL[0], 20, Math.PI / 2], [WALL[2], -30, Math.PI / 2], [-40, WALL[1], 0], [40, WALL[1], 0], [WALL[2], 90, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: 4.6 + 0.62, rot, range: [2.6, 0], alert: 5 });
// on the ridges of the village houses (the roof's ridge stands about 1.9 m over the eave line) and on the street's stones
{
  const r = rng(404);
  HOUSES.forEach((h, i) => {
    if (i % 3) return;
    const q = h.rect, along = q[2] - q[0] >= q[3] - q[1], cx = (q[0] + q[2]) / 2, cz = (q[1] + q[3]) / 2;
    perches.push({ kind: 'sparrow', x: cx + (along ? (r() - 0.5) * 3 : 0), z: cz + (along ? 0 : (r() - 0.5) * 3), y: 0.25 + h.H + (h.Hu || 0) + 1.75, rot: along ? 0 : Math.PI / 2, range: [2.2, 0], alert: 6 });
  });
  for (const [x, z] of [[-30, 155], [-12, 153], [22, 157], [48, 155], [-60, 156], [70, 154], [3, 170], [-3, 182], [8, 141], [-9, 136]]) sp(x, z, ground.height(x, z) + 0.06);
}
flights.push({ kind: 'swallow', n: 5, loop: { c: [0, 158], a: [80, 12], rot: 0 }, y: [3, 9], speed: 9 }, { kind: 'crow', n: 4, loop: { c: [60, 90], a: [30, 30], rot: 0 }, y: [18, 40], speed: 8 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §11.4) ──
// [inferred: the animals of a Ming north-Henan village and monastery; no source fetched] Dogs asleep at the doors of two shops on the walk, off the door's lane;
// a cat on the step of a home and one at the kitchen range's door in the monastery; a rooster and hens at the foot of a farmhouse front; two goats at the forecourt's
// corner; doves (the temple dove, a bird of the courts) on the paving of two courts; house swallows' mud nests under the eaves of the open houses of the walk.
const critters = [];
{
  const opened = openedHouses().map((o) => o.h), shops = opened.filter((h) => h.kind === 'shop'), homes = opened.filter((h) => h.kind !== 'shop');
  const at = (h, a, d) => { const F = frontOf(h); return F.P(0.5 + a / F.L, d); };       // a metres along the front from the door's middle, d out from the posts
  shops.slice(0, 2).forEach((h, i) => { const [x, z] = at(h, i ? -2.4 : 2.4, 1.1); critters.push({ model: 'dog', at: [x, ground.height(x, z) + 0.03, z], rot: 1.2 + i * 2, range: [9, 3.5] }); });
  { const h = homes[1]; if (h) { const [x, z] = at(h, 2.3, 0.3); critters.push({ model: 'cat_tabby', at: [x, 0.27, z], rot: 2.4, range: [7, 2.5] }); } }
  critters.push({ model: 'cat_orange', at: [40.6, 0.39, -13], rot: 3.0, range: [7, 2.5] });
  { const h = homes[0]; if (h) for (const [model, a, d, sz] of [['rooster', -2.3, 1.6, 1], ['hen_brown', -2.9, 1.9, 1], ['hen_white', -1.9, 2.1, 0.96]]) { const [x, z] = at(h, a, d); critters.push({ model, at: [x, ground.height(x, z) + 0.02, z], rot: 0.5 + a, range: [3.4, 1.4], size: sz }); } }
  critters.push({ model: 'goat_black', at: [-13.8, 0.03, 130.2], rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: [-12.5, 0.03, 131.4], rot: 3.0, range: [9, 3.2] });
  for (const [x, z, m] of [[6.2, 101, 'pigeon_grey'], [7.1, 102.2, 'pigeon_white'], [5.4, 102.9, 'pigeon_grey'], [-7.0, 61, 'pigeon_white'], [-7.9, 62.1, 'pigeon_grey']]) critters.push({ model: m, at: [x, 0.05, z], rot: x * 3, range: [1.4, 1.2] });
  // swallows' nests under the eaves of up to six open houses of the walk (north or south fronts), away from the doors and from one another
  let k = 0;
  for (const h of opened) {
    if (k > 5 || (h.front !== 'n' && h.front !== 's') || h.w < 6.4) continue;
    const F = frontOf(h), [x, z] = F.P(0.5 + (h.seed % 2 ? 2.4 : -2.4) / F.L, 0.14), sg = h.front === 's' ? 1 : -1;
    if (critters.some((c) => c.model === 'swallow_nest' && Math.abs(c.at[0] - x) < 9 && Math.abs(c.at[2] - z) < 9)) continue;
    critters.push({ model: 'swallow_nest', at: [x, 0.25 + h.H - 0.6, z], rot: h.front === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (h.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
    void sg;
  }
}
export default { fish, flights, perches, critters };
