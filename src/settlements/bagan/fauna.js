// Pagan — the animals (src/engine/fauna.js; docs/settlements/bagan.md §10): swallows over the plain and the river, crows and kites (crow stand-ins) high over the temples, sparrows
// in the courts and on the precinct walls, egrets on the river's bank and the tank's edge, small carp in the village tank.
import { RADIUS, PRECINCT, TANK, TANK_Y, ANANDA, SHWE, bankX, inRect } from './layout.js';
import { ground } from './ground.js';

const fish = [{ n: 4, size: [0.14, 0.24], palette: 'carp', y: TANK_Y, dist: (x, z) => Math.min(x - TANK[0], TANK[2] - x, z - TANK[1], TANK[3] - z) * -1 + 0.4, margin: 0.8, k: 1, rot: 0, area: [TANK[0] + 6, (TANK[1] + TANK[3]) / 2 - 3, TANK[2] - 6, (TANK[1] + TANK[3]) / 2 + 3], a: [8, 2.5], ratio: 0.3, minA: 1.2, speed: 0.4, rise: 0.15 }];
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-200, 0], b: [200, 0] }, y: [0.8, 6], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [105, 0], a: [70, 50], rot: 0 }, y: [4, 24], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [60, -40], a: [150, 90], rot: 0.4 }, y: [30, 62], speed: 8 },
];
flights[0].a = [30, 4];
const perches = [];
const hy = (x, z) => ground.height(x, z) + 0.05;
for (const [x, z] of [[40, -30], [60, 20], [150, 30], [130, -60], [40, 60], [100, 80], [-20, 10], [-60, -30]]) perches.push({ kind: 'sparrow', x, z, y: hy(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// on the precinct wall's top (2.6 m)
for (const [x, z] of [[60, -95], [150, -95], [60, 95], [150, 95]]) perches.push({ kind: 'sparrow', x, z, y: 2.6 + 0.3, rot: 0, range: [1.2, 0], alert: 5 });
{ const z = -20, x = bankX(z) + 1.5; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 }); }
{ const x = TANK[2] + 1.2, z = TANK[1] + 8; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void RADIUS; void PRECINCT; void ANANDA; void SHWE; void inRect;
export default { fish, flights, perches };
