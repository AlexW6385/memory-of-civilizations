// Pagan — the animals (src/engine/fauna.js; docs/settlements/bagan.md §10): swallows over the plain and the river, crows and kites (crow stand-ins) high over the temples, sparrows
// in the courts and on the precinct walls, egrets on the river's bank and the tank's edge, small carp in the village tank.
import { RADIUS, PRECINCT, TANK, TANK_Y, ANANDA, SHWE, SULA, THAT, GATE, MAIN_ROAD, bankX, inRect, lots } from './layout.js';
import { ground } from './ground.js';

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
void RADIUS; void PRECINCT; void MAIN_ROAD; void ANANDA; void SHWE; void inRect;
export default { fish, flights, perches };
