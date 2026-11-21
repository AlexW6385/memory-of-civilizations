// The Hakka tulou — the animals (src/engine/fauna.js draws them; docs/settlements/hakka-tulou.md §5): swallows over the
// paddy and the stream, egrets standing in the stream and over the paddy, crows over the hill, sparrows on the
// court's cobbles and the roof ridge, small carp in the stream [inferred: a hill stream of the valley].
import '../../engine/critter-models-hakka.js';
import { STREAM, streamZ, T, RADIUS, HOUSES } from './layout.js';
import { ground } from './ground.js';
import { openedHouses, isShop, frameOfHouse } from './walk.js';

const dist = (x, z) => Math.abs(z - streamZ(x)) - STREAM.w / 2;
const fish = [];
for (let x = -90; x <= 90; x += 30) fish.push({ n: 3, size: [0.14, 0.26], palette: 'carp', y: STREAM.water, dist, margin: 0.5, k: 1, rot: 0, area: [x - 14, streamZ(x) - 0.4, x + 14, streamZ(x) + 0.4], a: [10, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-200, 0], b: [200, 0] }, y: [0.5, 3.5], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [0, 100], a: [90, 26], rot: 0 }, y: [1, 6], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, 0], a: [30, 30], rot: 0 }, y: [14, 26], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-20, -110], a: [90, 40], rot: 0.3 }, y: [30, 55], speed: 8 },
];
flights[0].a = [26, 3];
const perches = [];
// sparrows in the court and the lane; on the stone curbs of the wells
for (const [x, z] of [[-14, 8], [10, 12], [-8, -9], [17, 3], [-22, 14], [22, -12], [-3, 21], [0, 36], [-10, 44], [9, 53]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// egrets by the stream, facing the water
for (const x of [-40, 25, 70]) { const z = streamZ(x) - 3.3; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
// sparrows on the porch beams and ridges of the hamlet, one pair to every other house; swallows nesting under the eaves flying over the rows
HOUSES.forEach((h, k) => {
  if (k % 2) return;
  const e = Math.sin(h.yaw) > 0, x = h.c[0] + (e ? 1 : -1) * (h.d / 2 + 1.4), z = h.c[1] + (k % 3 - 1) * 1.5;
  perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.1, rot: e ? 1.57 : -1.57, range: [1.4, 1.2] });
});
flights.push({ kind: 'swallow', n: 5, loop: { c: [0, 45], a: [30, 18], rot: 0 }, y: [1.5, 7], speed: 9 });
flights.push({ kind: 'swallow', n: 4, loop: { c: [0, 108], a: [20, 24], rot: 0 }, y: [1.5, 7], speed: 9 });
void T; void RADIUS;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §11.4) ──
// [inferred: the animals of a Fujian hill hamlet; no source fetched] Dogs asleep at the doors of two shops, a cat on the step of a house and one on the hall's bench,
// a rooster and hens at the foot of the great wall and before four houses, ducks afloat on the stream, house swallows' mud nests under the porch eaves of
// five houses of the walk. (The water buffalo by the road at the arrival is a rigged critter; the ploughing pairs in the far paddy stay the life element's figure.)
const critters = [];
{
  const opened = openedHouses().map((o) => o.h), shops = opened.filter(isShop), homes = opened.filter((h) => !isShop(h));
  const at = (h, a, d) => frameOfHouse(h)(a, h.d / 2 + d);        // a metres across from the door's middle, d out from the front wall
  shops.slice(0, 2).forEach((h, i) => { const [x, z] = at(h, i ? 3.0 : -3.1, 1.5); critters.push({ model: 'dog', at: [x, ground.height(x, z) + 0.03, z], rot: 1.2 + i * 2, range: [9, 3.5] }); });
  { const h = homes[1]; if (h) { const [x, z] = at(h, 2.4, 0.3); critters.push({ model: 'cat_tabby', at: [x, 0.27, z], rot: 2.4, range: [7, 2.5] }); } }
  { const h = homes[4]; if (h) { const [x, z] = at(h, -2.6, 0.5); critters.push({ model: 'cat_orange', at: [x, 0.29, z], rot: 1.1, range: [7, 2.5] }); } }
  homes.slice(0, 8).forEach((h, k) => {
    if (k % 2) return;
    for (const [model, a, d, sz] of [['rooster', -2.3, 2.2, 1], ['hen_brown', -2.9, 2.5, 1], ['hen_white', -1.9, 2.7, 0.96]]) { const [x, z] = at(h, a + k * 0.1, d); critters.push({ model, at: [x, ground.height(x, z) + 0.02, z], rot: 0.5 + a + k, range: [3.4, 1.4], size: sz }); }
  });
  // at the foot of the great wall, either side of the south gate (off the gate's lane and the stream's road)
  for (const [model, x, z, sz] of [['rooster', -5.5, 33.2, 1], ['hen_brown', -6.3, 33.6, 1], ['hen_white', -4.8, 34.1, 0.96], ['hen_brown', 6.2, 33.4, 1], ['hen_white', 7.0, 34.0, 0.96]]) critters.push({ model, at: [x, ground.height(x, z) + 0.02, z], rot: x, range: [3.4, 1.4], size: sz });
  // the buffalo grazing by the road at the arrival with its herd boy (town.js), and one at rest by the farm sheds
  critters.push({ model: 'buffalo_water', at: [-13.2, 0.05, 68.6], rot: 1.9, range: [6, 2.5] });
  critters.push({ model: 'dog', at: [3.4, 0.05, 36], rot: 3.8, range: [9, 3.5] });
  // ducks on the stream, going about its stretches (the still ducks of the life elements are gone)
  for (const x of [-52, -24, 20, 36, 62]) critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown', 'duck_white'], area: [x - 8, streamZ(x) - 1.6, x + 8, streamZ(x) + 1.6], dist, a: [6, 1.1], ratio: 0.2, margin: 0.5, y: STREAM.water, speed: 0.22, cycle: [18, 24] });
  // swallows' nests on the front wall above the porch beam of five houses (a nest on the beam's line, out of the door's)
  let k = 0;
  for (const h of opened) {
    if (k > 4 || h.seed % 2) continue;
    const [x, z] = frameOfHouse(h)(h.seed % 4 === 0 ? 2.2 : -2.2, h.d / 2 + 0.14), sn = Math.sin(h.yaw), cs = Math.cos(h.yaw);
    if (critters.some((c) => c.model === 'swallow_nest' && Math.abs(c.at[0] - x) < 12 && Math.abs(c.at[2] - z) < 12)) continue;
    critters.push({ model: 'swallow_nest', at: [x, 4.0, z], rot: Math.atan2(cs, sn), cycle: 33 + (h.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
  }
}
export default { fish, flights, perches, critters };
