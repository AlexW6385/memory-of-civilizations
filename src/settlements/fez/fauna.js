// Fez about 1350 — the animals (src/engine/fauna.js; docs/settlements/fez.md §8): swifts and house martins screaming over the roofs and the
// minarets at dusk, jackdaws and crows over the tannery and the hills, house sparrows on the lanes' stones, in the courts and the sahn,
// an egret on the river's quay. No fish: the Oued Fes is drawn but not swum in.
import { SITES, riverZ, siteY, ground0, RADIUS } from './layout.js';

const fish = [];
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [mid(SITES.qar)[0], mid(SITES.qar)[1] - 6], a: [60, 40], rot: 0.1 }, y: [24, 42], speed: 11 },      // swifts round the Qarawiyyin's minaret
  { kind: 'swallow', n: 5, loop: { c: [-132, 0], a: [40, 30], rot: -0.2 }, y: [20, 36], speed: 11 },                                       // round the Bou Inania's
  { kind: 'swallow', n: 4, lane: { a: [-280, riverZ(-280)], b: [280, riverZ(280)] }, y: [1.5, 6], speed: 9 },                                 // house martins low over the river
  { kind: 'swallow', n: 4, loop: { c: [0, -40], a: [120, 50], rot: 0.3 }, y: [14, 30], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [mid(SITES.tannery)[0], mid(SITES.tannery)[1]], a: [50, 35], rot: 0.4 }, y: [16, 30], speed: 8 },     // jackdaws over the tannery
  { kind: 'crow', n: 5, loop: { c: [-120, -150], a: [110, 60], rot: -0.3 }, y: [34, 58], speed: 8 },
];
const perches = [];
const sp = (x, z, y = ground0(x, z) + 0.05, rot = 0.3 + (Math.abs(x) * 7 % 3)) => perches.push({ kind: 'sparrow', x, z, y, rot, range: [1.4, 1.2] });
const b = SITES.bou, q = SITES.qar, yb = siteY('bou') + 0.05, yq = siteY('qar') + 0.05;
for (const [x, z] of [[-139, -3], [-126, 6], [-135, 9], [-128, -5]]) sp(x, z, yb);
for (const [x, z] of [[q[0] + 40, q[1] + 12], [q[0] + 30, q[1] + 18], [q[0] + 44, q[1] + 8]]) sp(x, z, yq);
for (let x = -250; x < 250; x += 37) sp(x + 3, -21 + (x % 2 ? 1.1 : -1.1));
for (let x = -200; x < 240; x += 53) { const z = riverZ(x) - 5.2; sp(x, z); }
{ const x = 190, z = riverZ(x) - 4.4; perches.push({ kind: 'egret', x, z, y: ground0(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void RADIUS; void b;
export default { fish, flights, perches };
