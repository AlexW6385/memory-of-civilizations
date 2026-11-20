// Timurid Samarkand — the animals (src/engine/fauna.js draws them; docs/settlements/timurid-samarkand.md §11): doves and swallows
// over the Registan and the madrasa's court, house sparrows on the paving and the roofs' parapets, rooks high over the
// orchards; a little fish in the aryk is left out (the channel is too narrow). [inferred]
import { SQUARE, MADRASA, BIBI, SHOPS_N, SHOPS_S, houses, houseGeom } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [48, 34], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-83, 0], a: [26, 18], rot: 0 }, y: [6, 24], speed: 8 },
  { kind: 'swallow', n: 4, lane: { a: [-200, 58], b: [260, 58] }, y: [1, 5], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [60, -150], a: [120, 70], rot: 0.5 }, y: [30, 55], speed: 8 },
];
flights[2].a = [26, 3];
const perches = [];
for (const [x, z] of [[-30, -30], [-20, 20], [0, 10], [25, 30], [30, -10], [-8, -36], [40, 8], [-90, 12], [-75, -10], [-100, 3], [100, 50], [140, 58], [60, 58], [-150, 160], [-120, 150]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// ...and on the parapets of the madrasa's east wings (their roof at 13.5 m, parapet coping)
for (const [x, z] of [[-50, -24], [-50, 24], [-70, 25], [-70, -25]]) perches.push({ kind: 'sparrow', x, z, y: 14.6, rot: 0, range: [1.2, 0], alert: 5 });
// doves (the rock dove of the towns of Central Asia) wheeling over the madrasa's front and resting on the parapets of its wings
flights.push({ kind: 'pigeon', n: 6, loop: { c: [-70, 0], a: [34, 22], rot: 0.3 }, y: [10, 26], speed: 8 });
flights.push({ kind: 'pigeon', n: 4, loop: { c: [30, 40], a: [30, 20], rot: -0.4 }, y: [8, 20], speed: 8 });
for (const [x, z] of [[-53, -24.4], [-53, 24.4], [-66, 24.6]]) perches.push({ kind: 'pigeon', x, z, y: 14.6, rot: 0.4 * x, range: [2.5, 0], alert: 5 });

// ── the critters (dossier §20.4): the rigged small animals of the town, their places a function of the plan's own numbers (no counters, no Math.random) ──
const A = [14, 0], hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
const critters = [];
// doves feeding on the paving where grain and crumbs fall: before the pishtaq's apron, between the aisle and the booths, by the tea-houses (four to a flock)
[[-30, 11.5], [-6, -11.5], [22, 12.5], [-41, -12], [-14, 20.5]].forEach(([x, z], k) => {
  [['pigeon_grey', 0, 0], ['pigeon_white', 0.7, 0.5], ['pigeon_dark', -0.6, 0.7], ['pigeon_grey', 0.3, -0.8]].forEach(([model, dx, dz], i) => critters.push({ model, at: [x + dx, 0.04, z + dz], rot: hashAt(x + i, z) * 6.28, range: [1.4, 1.1], size: 0.96 + 0.04 * ((i + k) % 2) }));
});
// cats on the sill carpets of shops nobody sits in (the odd ones that are not entered), nearest the arrival: a cat among the wares at the keeper's door
for (const [r, row] of [[SHOPS_N, 'n'], [SHOPS_S, 's']]) {
  const nU = Math.max(1, Math.round((r[2] - r[0]) / 3.6)), w = (r[2] - r[0]) / nU, skip = row === 'n' ? [3, 8, 14, 19, 24] : [5, 11, 17, 21, 24];
  const idx = [...Array(nU).keys()].filter((i) => i % 2 === 1 && !skip.includes(i)).sort((a, b) => Math.abs(r[0] + (a + 0.5) * w - A[0]) - Math.abs(r[0] + (b + 0.5) * w - A[0])).slice(0, 2);
  idx.forEach((i, j) => { const xc = r[0] + (i + 0.5) * w, z = row === 'n' ? r[1] + 7.2 : r[3] - 7.2; critters.push({ model: (i + j) % 2 ? 'cat_orange' : 'cat_tabby', at: [xc + 0.55, 0.5, z], rot: row === 'n' ? Math.PI / 2 : -Math.PI / 2, range: [7, 2.5] }); });
}
// a dog asleep against the wall of the house near each lane's end by the Registan, and one by the caravan's camp
const near = houses().filter((h) => h.full && !h.garden).map((h) => ({ h, d: Math.hypot((h.rect[0] + h.rect[2]) / 2 - A[0], (h.rect[1] + h.rect[3]) / 2 - A[1]) })).filter((q) => q.d > 40 && q.d < 140).sort((a, b) => a.d - b.d);
near.slice(0, 2).forEach(({ h }) => { const G = houseGeom(h), p = G.toWorld(h.xd + (hashAt(h.seed, 2) < 0.5 ? 4.2 : -4.2), G.D / 2 + 1.5); critters.push({ model: 'dog', at: [p[0], 0.04, p[1]], rot: hashAt(p[0], p[1]) * 6.28, range: [9, 3.5] }); });
critters.push({ model: 'dog', at: [36, 0.04, 14], rot: 2.2, range: [9, 3.5] });
// hens and a cock in the courts of the furnished houses nearest the arrival: a corner of the court clear of the tree, the tandoor, the charpoy and the people (the court's own frame: houses.js timHouse)
near.slice(0, 6).forEach(({ h }, k) => {
  const G = houseGeom(h), sg = hashAt(h.seed, 9) < 0.5 ? -1 : 1, u0 = 0.4 * sg;
  [['rooster', u0 + 1.3, 3.5], ['hen_brown', u0, 3.9], ['hen_white', u0 - 1.2, 3.3]].forEach(([model, u, v], i) => { const p = G.toWorld(u, v); critters.push({ model, at: [p[0], 0.04, p[1]], rot: hashAt(p[0], p[1]) * 6.28, range: [0.7, 0.6], size: i === 0 ? 1 : 0.97 + 0.03 * (k % 2) }); });
});
void SQUARE; void MADRASA; void BIBI;
export default { fish, flights, perches, critters };
