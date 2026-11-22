// Mount Wutai in 857 — the animals (src/engine/fauna.js draws them; docs/settlements/tang-wutai.md §12): house swallows over the
// village, the courtyard and the terraces, crows over the pines of the hill, tree sparrows hopping on the paving and the lanes.
// No water, so no fish.
import { height, LANES, HALL } from './layout.js';
import { visitorWalks } from './walk.js';
import { village } from './village.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [-85, 0], a: [34, 22], rot: 0.2 }, y: [2.5, 8], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-150, 30], a: [40, 20], rot: -0.3 }, y: [2.5, 7], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-30, 0], a: [22, 20], rot: 0 }, y: [3, 9], speed: 8 },
  { kind: 'swallow', n: 2, loop: { c: [62, 0], a: [26, 22], rot: 0.4 }, y: [16.5, 23], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [135, -20], a: [48, 36], rot: 0.5 }, y: [40, 58], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [60, 60], a: [40, 24], rot: -0.4 }, y: [26, 40], speed: 9 },
];
const perches = [];
const sparrow = (x, z, y = height(x, z), rot = 0.3 + (Math.abs(x) * 7 % 3)) => perches.push({ kind: 'sparrow', x, z, y, rot, range: [1.4, 1.3] });
for (const [x, z] of [[-48, 1], [-30, -9], [-30, 14], [-20, 28], [-70, 3.5], [-95, -3], [-120, 2], [-140, 40], [-100, -44], [-176, 0], [-180, 44], [-66, -9]]) sparrow(x, z);
sparrow(8, -20, 6.5); sparrow(20, 20, 6.5); sparrow(40, 10, 13); sparrow(45, -16, 13);
// sparrows at the trades' doors (the inn's hitching rail, the shop, the smithy), along the lanes every 24 m, on the green's old tree seat
for (const m of village().smoke.filter((q) => q.trade)) sparrow(m.p[0] + 1.5, m.p[1] + (m.p[1] > 0 ? -3.5 : 3.5));
for (const [x0, z0, x1, z1] of LANES.slice(1)) {
  const alongX = x1 - x0 > z1 - z0, len = alongX ? x1 - x0 : z1 - z0;
  for (let t = 12; t < len - 6; t += 24) { const x = alongX ? x0 + t : (x0 + x1) / 2, z = alongX ? (z0 + z1) / 2 : z0 + t; if (Math.hypot(x, z) < 215) sparrow(x, z); }
}
sparrow(-89, -2.5); sparrow(-86, 3);
// more flights: swallows low over the terraced fields on both flanks, a wheel of crows over the hill path's pines
flights.push({ kind: 'swallow', n: 3, loop: { c: [-130, -135], a: [50, 14], rot: 0.1 }, y: [1.5, 6], speed: 9 }, { kind: 'swallow', n: 3, loop: { c: [-130, 135], a: [50, 14], rot: -0.1 }, y: [1.5, 6], speed: 9 }, { kind: 'crow', n: 4, loop: { c: [150, 50], a: [30, 20], rot: 0.3 }, y: [38, 54], speed: 9 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/tang-wutai.md §22) ──
// [inferred: the animals of a Tang monastery and a north Shanxi village; no source for 857] A dog asleep at the inn's door and one at the smithy's, off the doors'
// lanes; a cat on the monks' kitchen platform; a rooster and hens in the yards of the first two open houses, beside the way to the door; two goats of the
// village's flocks by the green; temple doves on the paving of the three levels (pigeons, birds of the monastery's courts).
const critters = [];
{
  const at = (x, z, dy = 0.03) => [x, height(x, z) + dy, z];
  // donkeys tied before the gate, at the pilgrims' tea shed and on the village green (critter-models-farm.js; the still donkeys of dress.js and village.js stood there)
  critters.push({ model: 'donkey_grey', at: at(-63.2, 6.6), rot: 1.6, range: [0.9, 0.6], tau: 42 }, { model: 'donkey_brown', at: at(-56.5, 9.3), rot: 2.0, range: [0.9, 0.6], tau: 38 }, { model: 'donkey_grey', at: at(-69.4, 5.4), rot: 1.2, range: [1.6, 1.0], tau: 36 });
  critters.push({ model: 'dog', at: at(-103.7, -1.9), rot: 1.2, range: [9, 3.5] }, { model: 'dog', at: at(-110.1, 1.9), rot: 4.1, range: [9, 3.5] });
  critters.push({ model: 'cat_orange', at: [-19.6, 0.48, 35.2], rot: 3.0, range: [4, 1.5] });
  const gx = -77;
  critters.push({ model: 'goat_black', at: at(-86.4, -6.5), rot: 0.6, range: [8, 3] }, { model: 'goat_white', at: at(-85.2, -6.0), rot: 3.0, range: [8, 3] });
  for (const [x, z, y, m] of [[-36.5, 3.0, 0.02, 'pigeon_grey'], [-35.4, 4.1, 0.02, 'pigeon_white'], [-41.2, -3.2, 0.02, 'pigeon_grey'], [9.2, 3.4, 6.52, 'pigeon_white'], [10.3, 4.2, 6.52, 'pigeon_grey'], [38.2, 7.6, 13.02, 'pigeon_grey'], [39.3, 8.5, 13.02, 'pigeon_white'], [gx + 5, 0.6, height(gx + 5, 0.6) + 0.04, 'pigeon_grey']]) critters.push({ model: m, at: [x, y, z], rot: x * 3, range: [1.4, 1.2] });
  // hens in the yards of the first two open houses, beside the yard's front (the way from the gate to the door is kept clear of them)
  visitorWalks().routes.slice(5, 7).forEach((r, i) => {
    const [dx, dz] = [r[r.length - 2][0] + HALL.origin[0], r[r.length - 2][1]], sx = r[1][0] + HALL.origin[0] < dx ? 1 : -1;
    for (const [model, a, d, sz] of [['rooster', 2.4, 0.2, 1], ['hen_brown', 3.0, 0.9, 1], ['hen_white', 2.0, 1.0, 0.96]]) { const x = dx + sx * a, z = dz + (r[r.length - 1][1] > dz ? -1 : 1) * d; critters.push({ model, at: at(x, z), rot: 0.5 + a + i, range: [3.4, 1.4], size: sz }); }
  });
}
export default { fish, flights, perches, critters };
