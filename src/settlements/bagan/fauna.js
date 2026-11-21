// Pagan — the animals (src/engine/fauna.js; docs/settlements/bagan.md §10): swallows over the plain and the river, crows and kites (crow stand-ins) high over the temples, sparrows
// in the courts and on the precinct walls, egrets on the river's bank and the tank's edge, small carp in the village tank.
import { RADIUS, PRECINCT, TANK, TANK_Y, ANANDA, SHWE, SULA, THAT, GATE, MAIN_ROAD, bankX, inRect, lots } from './layout.js';
import { ground } from './ground.js';
import { walkRoutes, shopPoint } from './walkroutes.js';

const fish = [{ n: 4, size: [0.14, 0.24], palette: 'carp', y: TANK_Y, dist: (x, z) => Math.min(x - TANK[0], TANK[2] - x, z - TANK[1], TANK[3] - z) * -1 + 0.4, margin: 0.8, k: 1, rot: 0, area: [TANK[0] + 6, (TANK[1] + TANK[3]) / 2 - 3, TANK[2] - 6, (TANK[1] + TANK[3]) / 2 + 3], a: [8, 2.5], ratio: 0.3, minA: 1.2, speed: 0.4, rise: 0.15 }];
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-200, 0], b: [200, 0] }, y: [0.8, 6], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [105, 0], a: [70, 50], rot: 0 }, y: [4, 24], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [60, -40], a: [150, 90], rot: 0.4 }, y: [30, 62], speed: 8 },
];
flights[0].a = [30, 4];
// swallows hawking over the river and the tank, and along the shop rows of the main road; kites circling high over the three great temples
flights.push({ kind: 'swallow', n: 5, lane: { a: [-280, -150], b: [-280, 150] }, y: [0.5, 5], speed: 9 });
flights.push({ kind: 'swallow', n: 4, loop: { c: [(TANK[0] + TANK[2]) / 2, (TANK[1] + TANK[3]) / 2], a: [30, 20], rot: 0 }, y: [0.7, 3], speed: 8 });
flights.push({ kind: 'crow', n: 4, loop: { c: [THAT.c[0], THAT.c[1]], a: [50, 40], rot: 0.2 }, y: [38, 70], speed: 8 });
flights.push({ kind: 'crow', n: 4, loop: { c: [SULA.c[0], SULA.c[1]], a: [40, 40], rot: 0.9 }, y: [30, 55], speed: 8 });
flights.push({ kind: 'crow', n: 4, loop: { c: [SHWE.c[0], SHWE.c[1]], a: [45, 45], rot: 1.4 }, y: [55, 85], speed: 8 });
flights[flights.length - 5].a = [26, 4];
const perches = [];
const hy = (x, z) => ground.height(x, z) + 0.05;
for (const [x, z] of [[40, -30], [60, 20], [150, 30], [130, -60], [40, 60], [100, 80], [-20, 10], [-60, -30]]) perches.push({ kind: 'sparrow', x, z, y: hy(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// on the precinct wall's top (2.6 m)
for (const [x, z] of [[60, -95], [150, -95], [60, 95], [150, 95]]) perches.push({ kind: 'sparrow', x, z, y: 2.6 + 0.3, rot: 0, range: [1.2, 0], alert: 5 });
{ const z = -20, x = bankX(z) + 1.5; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 }); }
{ const x = TANK[2] + 1.2, z = TANK[1] + 8; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
// sparrows hopping at the shop fronts and the pot stands, on the Ananda's upper terrace and the Tharabar Gate's top
{
  let k = 0;
  for (const l of lots()) {
    if (!l.shop || (k++ % 2)) continue;
    const [x0, z0, x1, z1] = l.rect, x = (x0 + x1) / 2 + 2, z = l.front === 's' ? z1 + 1.2 : z0 - 1.2;
    perches.push({ kind: 'sparrow', x, z, y: hy(x, z), rot: x * 3 % 6, range: [1.6, 0.8] });
  }
  for (const [dx, dz] of [[-22, -24], [22, 24], [-24, 22], [24, -22]]) perches.push({ kind: 'sparrow', x: ANANDA.c[0] + dx, z: ANANDA.c[1] + dz, y: 12.2, rot: dx, range: [2.2, 1.0], alert: 5 });
  perches.push({ kind: 'sparrow', x: GATE.x, z: GATE.z + 1.5, y: 6.2 + 0.3, rot: 0, range: [0.8, 3.5], alert: 5 });
  for (const z of [-120, -86, 20, 66, 112, 150]) { const x = bankX(z) + 1.6; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI, stay: [60, 220], gone: [60, 160], alert: 10 }); }
  for (const [x, z] of [[-60, -60], [30, 90], [70, -100], [-150, 150], [-90, -170]]) perches.push({ kind: 'sparrow', x, z, y: hy(x, z), rot: x, range: [1.8, 1.6] });
}
// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/bagan.md §15.4) ──
// The animals of the market road and the villages: dogs asleep in the shade of the shop fronts (the village dog of the later Burmese town; the dossier §8), cats on the shops' low steps (the temple
// cat and the shopkeeper's cat: [inferred]), fowl scratching in front of the shops (the domestic fowl is the Burmese jungle fowl's tame kin: [inferred]), two goats tethered at the cross street's
// corner, doves on the Ananda's paving (the doves of the temples, §8), ducks on the village tank, kingfishers at the tank and on the river's bank, swallows' mud nests under the beams of the shop
// fronts (the swallows over the road, §8). Each stands clear of the shop doors' lanes (the door's side is shop()'s own draw, walkroutes.js).
const critters = [];
const wr = walkRoutes(), gy = (x, z) => ground.height(x, z);
const hs = (x, z, k = 0) => { const q = Math.sin(x * 12.9898 + z * 78.233 + k * 3.7) * 43758.5453; return q - Math.floor(q); };
const Wd = (l) => ((l.front === 'n' || l.front === 's') ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]);
/** A point on a shop's front: u along from the door's side toward the middle, v out into the verge (negative). */
const away = (r, du, v) => { const W = Wd(r.l), u = r.u < W / 2 ? r.u + du : r.u - du; return shopPoint(r.l, u, v); };
// dogs in the shade at the fronts of six shops, on the side away from the door
[1, 5, 9, 14, 19, 25].forEach((i, k) => { const r = wr[i % wr.length], [x, z] = away(r, 3.6, -1.6); critters.push({ model: 'dog', at: [x, gy(x, z) + 0.03, z], rot: 1.1 + k * 1.3, range: [9, 3.5] }); });
// cats on the low step of four shops (the step's lower block is 0.275 m high)
[3, 10, 16, 22].forEach((i, k) => { const r = wr[i % wr.length], [x, z] = away(r, 2.7, -0.6); critters.push({ model: k % 2 ? 'cat_orange' : 'cat_tabby', at: [x, 0.285, z], rot: 2.3 + k, range: [7, 2.5] }); });
// a rooster and two hens scratching before three shops
[2, 11, 21].forEach((i, k) => { const r = wr[i % wr.length], [x, z] = away(r, 4.6, -1.8); for (const [m, dx, dz, size] of [['rooster', 0, 0, 1], ['hen_brown', 0.9, 0.5, 0.95], ['hen_white', -0.8, 0.6, 0.92]]) critters.push({ model: m, at: [x + dx, gy(x, z) + 0.03, z + dz], rot: k * 2 + dx, range: [2.6, 1.6], size }); });
// two goats tethered at the cross street's corner
critters.push({ model: 'goat_black', at: [-133.6, 0.04, -22.6], rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: [-134.9, 0.04, -23.9], rot: 3.0, range: [9, 3.2] });
critters.push({ model: 'goat_white', at: [-133.4, 0.04, 22.8], rot: 2.2, range: [9, 3.2] }, { model: 'goat_black', at: [-134.6, 0.04, 24.0], rot: 5.1, range: [9, 3.2] });
// doves on the Ananda's paving: before the west porch's stalls, by the porches' steps and the gates
for (const [x, z, m] of [[63, 9.5, 'pigeon_grey'], [64.4, 10.6, 'pigeon_white'], [62.2, 11.4, 'pigeon_grey'], [64.0, -9.8, 'pigeon_white'], [62.8, -11.0, 'pigeon_grey'], [105, 58.5, 'pigeon_grey'], [106.4, 59.4, 'pigeon_white'],
  [104, 60.2, 'pigeon_grey'], [152, 9.6, 'pigeon_white'], [153.3, 10.7, 'pigeon_grey'], [150.8, 11.4, 'pigeon_grey'], [105, -58.5, 'pigeon_white'], [106.3, -59.6, 'pigeon_grey']]) critters.push({ model: m, at: [x, 0.05, z], rot: x * 3, range: [1.4, 1.2] });
// ducks on the village tank, kingfishers at the tank's edge and on the river's bank
critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown'], area: [TANK[0] + 5, TANK[1] + 5, TANK[2] - 5, TANK[3] - 5], dist: (x, z) => Math.min(x - TANK[0], TANK[2] - x, z - TANK[1], TANK[3] - z) * -1 + 0.4, a: [8, 3.5], ratio: 0.4, margin: 1.2, y: TANK_Y, speed: 0.22, cycle: [18, 24] });
critters.push({ model: 'kingfisher', at: [TANK[2] + 0.7, gy(TANK[2] + 0.7, 172) + 0.05, 172], rot: -Math.PI / 2, water: [TANK[2] - 2.3, 172, TANK_Y], cycle: 34 });
for (const z of [-60, 70]) { const x = bankX(z) + 0.8; critters.push({ model: 'kingfisher', at: [x, gy(x, z) + 0.05, z], rot: Math.PI, water: [x - 3, z, -2.4], cycle: 31 + (z % 4) }); }
// swallows' nests on the front beam of eight shops (2.9–3.35 m up: the beam at the shop's v = 0.5), well apart and clear of the doors
{ let k = 0; const used = [];
  for (const r of wr.slice().reverse()) {      // (from the Ananda's end of the road: the shops the visitor passes first)
    if (k > 7) break;
    const W = Wd(r.l), u = r.u < W / 2 ? W - 0.9 : 0.9, [x, z] = shopPoint(r.l, u, 0.38);
    if (used.some(([a, b]) => Math.hypot(a - x, b - z) < 14)) continue;
    const sg = r.l.front === 's' ? 1 : -1;
    critters.push({ model: 'swallow_nest', at: [x, 3.05, z + sg * 0.14], rot: r.l.front === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (r.l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 });
    used.push([x, z]); k++;
  } }
void hs; void RADIUS; void PRECINCT; void MAIN_ROAD; void ANANDA; void SHWE; void inRect;
export default { fish, flights, perches, critters };
