// Classic Maya Tikal — the animals (src/engine/fauna.js draws them; docs/settlements/maya-tikal.md §10): swallows over the plaza and the
// reservoirs, vultures (the crow stands in) high over the temples, small birds on the plaza's plaster and the causeways, an egret on
// a reservoir's rim, small fish in the reservoirs [inferred: the plastered quarry reservoirs held water through the dry season].
import { RESERVOIRS, resDist } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (const R of RESERVOIRS) fish.push({ n: 5, size: [0.14, 0.26], palette: 'carp', y: R.water, dist: (x, z) => resDist(R, x, z), margin: 0.8, k: 1, rot: R.rot, area: [R.c[0] - R.a * 0.7, R.c[1] - R.b * 0.7, R.c[0] + R.a * 0.7, R.c[1] + R.b * 0.7], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 0], a: [60, 50], rot: 0 }, y: [3, 40], speed: 10 },
  { kind: 'swallow', n: 5, loop: { c: [-5, 205], a: [50, 34], rot: 0.2 }, y: [0.6, 8], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [180, 20], a: [40, 30], rot: -0.3 }, y: [0.6, 8], speed: 9 },
  { kind: 'crow', n: 7, loop: { c: [10, -20], a: [130, 100], rot: 0.5 }, y: [60, 110], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-140, 20], a: [100, 70], rot: 0 }, y: [50, 90], speed: 7 },
];
const perches = [];
const spots = [[-12, 30], [14, 26], [-26, -10], [26, 12], [0, -30], [-20, 40], [22, -28], [-60, 33], [-120, 33], [-190, 33], [100, -80], [100, -160], [120, 30], [96, 50], [-80, 80], [40, 60], [-30, 110], [30, 140]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
{ const R = RESERVOIRS[0], x = R.c[0] + R.a * 0.9, z = R.c[1] - 2; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI, stay: [80, 240], gone: [40, 150], alert: 10 }); }
export default { fish, flights, perches };
