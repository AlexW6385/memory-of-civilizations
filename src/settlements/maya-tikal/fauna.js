// Classic Maya Tikal — the animals (src/engine/fauna.js draws them; docs/settlements/maya-tikal.md §10): swallows over the plaza and the
// reservoirs, vultures (the crow stands in) high over the temples, small birds on the plaza's plaster and the causeways, an egret on
// a reservoir's rim, small fish in the reservoirs [inferred: the plastered quarry reservoirs held water through the dry season].
import { RESERVOIRS, resDist, groups } from './layout.js';
import { ground } from './ground.js';
import { houseFrame, quarter, hashAt, PLATFORM, routes } from './walk.js';
import plaza from './plan.js';

const fish = [];
for (const R of RESERVOIRS) fish.push({ n: 5, size: [0.14, 0.26], palette: 'carp', y: R.water, dist: (x, z) => resDist(R, x, z), margin: 0.8, k: 1, rot: R.rot, area: [R.c[0] - R.a * 0.7, R.c[1] - R.b * 0.7, R.c[0] + R.a * 0.7, R.c[1] + R.b * 0.7], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 0], a: [60, 50], rot: 0 }, y: [3, 40], speed: 10 },
  { kind: 'swallow', n: 5, loop: { c: [-5, 205], a: [50, 34], rot: 0.2 }, y: [0.6, 8], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [180, 20], a: [40, 30], rot: -0.3 }, y: [0.6, 8], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [110, 42], a: [34, 24], rot: 0 }, y: [2, 14], speed: 9 },
  { kind: 'crow', n: 7, loop: { c: [10, -20], a: [130, 100], rot: 0.5 }, y: [60, 110], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-140, 20], a: [100, 70], rot: 0 }, y: [50, 90], speed: 7 },
];
const perches = [];
const spots = [[-12, 30], [14, 26], [-26, -10], [26, 12], [0, -30], [-20, 40], [22, -28], [-60, 33], [-120, 33], [-190, 33], [100, -80], [100, -160], [120, 30], [96, 50], [-80, 80], [40, 60], [-30, 110], [30, 140]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
for (const g of groups().filter((_, i) => i % 3 === 0).slice(0, 18)) { const x = g.shrine[0] + 2.5, z = g.shrine[1] + 1.5; perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: g.seed % 3, range: [1.6, 1.4] }); }   // on the groups' courts
for (const [x, z] of [[-70, -48], [112, 40], [120, 52], [100, 36]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: x % 3, range: [1.8, 1.6] });     // the market
{ const R = RESERVOIRS[1], x = R.c[0] - R.a * 0.9, z = R.c[1] + 4; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: 0.5, stay: [80, 240], gone: [40, 150], alert: 10 }); }
{ const R = RESERVOIRS[0], x = R.c[0] + R.a * 0.9, z = R.c[1] - 2; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI, stay: [80, 240], gone: [40, 150], alert: 10 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §19) ──
// The animals of Classic Tikal: the turkey and the dog were the Maya's domestic animals (no hens, pigs, goats or cats before 1492 [stated: the domestic turkey and dog of Mesoamerica;
// the Muscovy duck's domestication in the Americas is [inferred] for the Classic lowlands]); ground-doves (the native small doves stand in the rock dove's model [inferred]) on the plaza's
// plaster; swallows' mud nests under the eaves of the craftsmen's houses; ducks on the palace reservoir; a kingfisher at the rim of the temple reservoir. The scarlet macaw, the
// ocellated turkey and the howler monkey have no model yet (src/engine/critter-models.js): their voices are in the sound map.
const critters = [];
const craftRoutes = routes(plaza.elements).filter((r) => /craft/.test(r.name)).map((r) => r.pts);
const segD = (p, route) => { let d = 1e9; for (let k = 0; k + 1 < route.length; k++) { const [a, b] = [route[k], route[k + 1]], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)); d = Math.min(d, Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t)); } return d; };
const gy = (x, z) => ground.height(x, z);
// turkeys in the courts of the craftsmen's three groups (the court's middle band, between the doors' lanes), a dog outside each east gate, off the way in
for (const [gi, g] of quarter().entries()) {
  const [x0, z0, x1, z1] = g.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sd = z0 < 0 ? -1 : 1;   // the visitor's way crosses the court's north side in the southern group, its south side in the northern one (walk.js)
  // three places in the court's open floor (not on a house's platform or the shrine's, 2 m from every route the visitor's walk takes through it), nearest the middle first
  const spots = [];
  for (let x = x0 + 1.5; x < x1 - 1.5; x += 0.8) for (let z = z0 + 1.5; z < z1 - 1.5; z += 0.8) {
    const free = !g.houses.some((h) => Math.abs(x - h.c[0]) < (h.dir === 'x' ? h.w : h.d) / 2 + 1.2 && Math.abs(z - h.c[1]) < (h.dir === 'x' ? h.d : h.w) / 2 + 1.2) && !(Math.abs(x - g.shrine[0] + 0.2) < 4.2 && Math.abs(z - g.shrine[1]) < 4.2);
    if (free && Math.hypot(x - (x0 + 12), z - (cz + 0.5)) > 1.8 && craftRoutes.every((w) => segD([x, z], w) > 2.2)) spots.push([x, z]);
  }
  spots.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
  const pick = [];
  for (const q of spots) if (pick.length < 3 && pick.every((r) => Math.hypot(r[0] - q[0], r[1] - q[1]) > 1.4)) pick.push(q);
  for (const [k, q] of pick.entries()) critters.push({ model: 'turkey', at: [q[0], 0.1, q[1]], rot: hashAt(cx, cz, k) * 6.28, range: [2.2, 1.0] });
  if (gi !== 1) critters.push({ model: 'dog', at: [x1 + 2.6, gy(x1 + 2.6, cz + sd * 3.5) + 0.02, cz + sd * 3.5], rot: 1.1 + gi, range: [5, 2.2] });
}
// a dog and turkeys by the market's lanes; two dogs at the foot of the Central Acropolis' stair and the North Acropolis'
critters.push({ model: 'dog', at: [96.8, 0.04, 30.5], rot: 0.4, range: [6, 2.5] }, { model: 'dog', at: [-4, 0.04, 36.5], rot: 2.2, range: [6, 2.5] }, { model: 'dog', at: [-17, 0.04, -39], rot: 4.0, range: [6, 2.5] });
for (const [k, [x, z]] of [[92, 41.5], [93.2, 42.2], [121, 31], [122.2, 31.6], [128, 49.5]].entries()) critters.push({ model: 'turkey', at: [x, 0.04, z], rot: k * 1.3, range: [3, 1.4] });
// ground-doves on the plaza's plaster by the stelae and the braziers, on the Great Plaza's edges (away from the arrival's corner)
for (const [k, [x, z]] of [[-12, 36], [-10.6, 36.8], [14, -31], [15.2, -30.2], [-31, -29], [30, 30], [28.8, 30.8]].entries()) critters.push({ model: k % 3 === 2 ? 'pigeon_dark' : 'pigeon_grey', at: [x, 0.05, z], rot: hashAt(x, z, 2) * 6.28, range: [1.5, 1.2] });
// swallows' nests under the eaves of the first houses of each craftsmen's group (beside the door's lane), on the door's wall
for (const g of quarter()) for (const h of g.houses.slice(1, 3)) {
  const { F } = houseFrame(h), n = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[h.door], p = F.P(-0.14, 1.7);
  critters.push({ model: 'swallow_nest', at: [p[0], PLATFORM + 2.1, p[1]], rot: Math.atan2(n[1], n[0]), cycle: 33 + (h.seed % 5), flight: 9, radius: 10, side: h.seed % 2 ? 1 : -1, rise: -0.8 });
}
// Muscovy ducks (domestic, brown and white) on the palace reservoir, near its rim by the Central Acropolis
{ const R = RESERVOIRS[0]; critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown', 'duck_brown'], area: [R.c[0] - R.a * 0.6, R.c[1] - R.b * 0.7, R.c[0] + R.a * 0.6, R.c[1] + R.b * 0.1], dist: (x, z) => resDist(R, x, z), a: [8, 3], ratio: 0.3, margin: 1.2, y: R.water, speed: 0.2, cycle: [18, 26] }); }
// a kingfisher on the temple reservoir's rim, facing the water
{ const R = RESERVOIRS[1];
  let rim = null;
  for (let t = 0; t < 80 && !rim; t += 0.25) { const x = R.c[0] - R.a - 8 + t, z = R.c[1] + 4; if (resDist(R, x, z) < 0.9 && gy(x, z) < R.water + 0.9) rim = [x, z]; }
  if (rim) critters.push({ model: 'kingfisher', at: [rim[0], gy(rim[0], rim[1]) + 0.05, rim[1]], rot: 0, water: [rim[0] + 1.7, rim[1], R.water], cycle: 34 }); }
void RESERVOIRS;
export default { fish, flights, perches, critters };
