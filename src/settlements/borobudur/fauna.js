// Sailendra Java — the animals (src/engine/fauna.js draws them; docs/settlements/borobudur.md §15): little egrets
// standing in the paddies, swallows over the paddies and about the monument's terraces, crows over the monastery,
// sparrows on the monument's balustrades and the monastery's roofs-edge, an egret at the paddies' edge.
import { MONUMENT, SQUARES, MONASTERY, HAMLETS } from './layout.js';
import { ground } from './ground.js';
import { houses, floorOf } from './layout.js';
import { atOf } from './houseat.js';
import { rumahPlace } from '../../styles/javanese/index.js';

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [95, 95], rot: 0 }, y: [3, 24], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-170, 150], a: [80, 40], rot: 0.5 }, y: [0.8, 4], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [180, -140], a: [70, 40], rot: -0.4 }, y: [0.8, 4], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [(MONASTERY[0] + MONASTERY[2]) / 2, (MONASTERY[1] + MONASTERY[3]) / 2], a: [40, 30], rot: 0.2 }, y: [26, 10], speed: 9 },
];
// more swallows low over the way's paddies where the visitor arrives, and sparrows on the roofs of its stalls
flights.push({ kind: 'swallow', n: 5, loop: { c: [170, 0], a: [90, 45], rot: 0 }, y: [0.8, 5], speed: 8 });
const perches = [];
// sparrows on the first balustrade's coping and the lower terraces, hopping along them
const B = MONUMENT.base;
for (const [x, z, rot, y] of [[0, -(SQUARES[0].a + 0.2), 0, SQUARES[0].y + 1.7 + 0.2], [0, SQUARES[1].a, 0, SQUARES[1].y + 1.5 + 0.2], [-(SQUARES[2].a), 0, Math.PI / 2, SQUARES[2].y + 1.5 + 0.2], [B.a + 0.2, 20, Math.PI / 2, B.h + 1.7 + 0.2]]) perches.push({ kind: 'sparrow', x: x + (x === 0 ? 14 : 0), z: z + (z === 0 ? 14 : 0), y, rot, range: [2.6, 0], alert: 5 });
// egrets in the paddies, on the bunds between them (the ground's own height there)
for (const [x, z, rot] of [[120, 120, 0.4], [-200, 120, 2.0], [100, -190, 1.1], [-180, -60, 0.2], [210, 40, 2.6]]) {
  perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot, stay: [80, 240], gone: [40, 150], alert: 10 });
}
// egrets by the way, in the paddies on its either hand (the ground's height there is the way's, level)
for (const [x, z, rot] of [[112, 24, 0.5], [150, -26, 1.8], [190, 28, 2.4], [235, -28, 0.9], [95, -30, 3.0], [260, 30, 1.2]]) perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot, stay: [80, 240], gone: [40, 150], alert: 9 });
for (const [x, z, rot] of [[-176, -150, 0.3], [-182, -162, 1.1], [-150, -118, 2.0]]) perches.push({ kind: 'sparrow', x, z, y: 3.1, rot, range: [3, 0], alert: 5 });
void HAMLETS;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §20.4) ──
// The animals of the way and its lodgings, none of them where a walker goes (the stair's lane, the doors, the way): dogs at the forecourt and before two lodgings, cats on
// the verandas, a cock and hens scratching in three lodgings' yards, doves at the way's two shrines and on the forecourt, goats tethered at the verge, swallows' mud nests
// under the front eaves of three lodgings. [inferred: the dog, the cat, the fowl and the dove are the village animals of Java; fowl and dogs are among the beasts the reliefs
// show is not claimed here; the swallow's nest under an eave is a habit of the bird]. No ducks: there is no water in this ground.
const critters = [];
const lodg = houses().filter((h) => h.hamlet === -1);
for (const [x, z, rot] of [[91, -4.2, 0.6], [86, 4.6, 2.2]]) critters.push({ model: 'dog', at: [x, 0.02, z], rot, range: [8, 3.2] });
lodg.forEach((h, i) => {
  const at = atOf(h), Pl = rumahPlace(h), sg = -1, side = Pl.su * sg > 0 ? -1 : 1;
  if (i === 0 || i === 4) { const [x, z] = at(4.4, side * 2.4); critters.push({ model: 'dog', at: [x, 0.02, z], rot: 1.1 + i, range: [8, 3.2] }); }
  if (i === 2 || i === 7) { const [x, z] = Pl.P(-Pl.su + (Pl.su > 0 ? -1 : 1) * (Pl.W / 2 - 0.8), Pl.vw + 0.55); critters.push({ model: i === 2 ? 'cat_tabby' : 'cat_orange', at: [x, floorOf(h.seed) + 0.02, z], rot: 2.4 + i, range: [1.4, 0.5] }); }
  if (i === 1 || i === 5 || i === 8) {
    for (const [m, du, dd, sz] of [['rooster', 2.6, 5.6, 1], ['hen_brown', 3.4, 5.0, 1], ['hen_white', 3.9, 6.1, 0.96], ['hen_brown', 2.2, 6.6, 0.95]]) { const [x, z] = at(dd, side * du); critters.push({ model: m, at: [x, 0.02, z], rot: i + du, range: [3.4, 1.4], size: sz }); }
  }
  if ([3, 6, 9].includes(i)) {
    const F = h.front, [fx, fz] = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[F], [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, half = (F === 'e' || F === 'w' ? x1 - x0 : z1 - z0) / 2;
    const u = Pl.su < 0 ? 1 : -1, tx = -fz, tz = fx, px = cx + fx * (half - 0.15) + tx * u * (Pl.W / 2 - 1.0), pz = cz + fz * (half - 0.15) + tz * u * (Pl.W / 2 - 1.0);
    critters.push({ model: 'swallow_nest', at: [px, floorOf(h.seed) + 2.0, pz], rot: Math.atan2(fz, fx), cycle: 33 + i, flight: 9, radius: 10, side: i % 2 ? 1 : -1, rise: 1 });
  }
});
for (const [x, z, m] of [[73.4, -6.6, 'pigeon_white'], [74.2, -7.4, 'pigeon_grey'], [73.0, 7.0, 'pigeon_grey'], [74.4, 6.4, 'pigeon_white'], [80, -3.9, 'pigeon_grey'], [81.2, -4.4, 'pigeon_white']]) critters.push({ model: m, at: [x, 0.02, z], rot: x * 3, range: [2.2, 1.0] });
critters.push({ model: 'goat_white', at: [182, 0.02, -8.2], rot: 0.5, range: [9, 3.2] }, { model: 'goat_black', at: [183.4, 0.02, -9.2], rot: 3.0, range: [9, 3.2] });
export default { fish: [], flights, perches, critters };
