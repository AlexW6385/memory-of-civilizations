// Manueline Lisbon — the animals (src/engine/fauna.js; docs/settlements/manueline-lisbon.md §9): sardines and mullet in the Tagus
// along the quay, gulls and swifts over the river and the roofs, kites over the Alfama and the castle, sparrows on the paving,
// an egret on the shore of Belém.
import { SEA, GROUND, QUAY, HILL, RADIUS, wet, lots } from './layout.js';

const inWater = (x, z) => wet(x, z);
const fish = [];
for (let i = 0; i < 7; i++) fish.push({ n: 4, size: [0.2, 0.4], palette: 'carp', y: SEA, area: [-160 + i * 60, 108, -110 + i * 60, 135], dist: inWater, margin: 1.5, a: [12, 5], ratio: 0.3, speed: 0.4, rise: 0.25 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-250, 90], b: [280, 90] }, y: [2, 18], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, lane: { a: [-250, 20], b: [280, 20] }, y: [6, 20], speed: 8, half: 14 },
  { kind: 'swallow', n: 4, lane: { a: [-206, 30], b: [-206, 130] }, y: [8, 28], speed: 8, half: 10 },
  { kind: 'swallow', n: 4, lane: { a: [-130, -4], b: [200, -4] }, y: [6, 18], speed: 8, half: 6 },
  { kind: 'crow', n: 6, loop: { c: [-245, 175], a: [40, 30], rot: 0.2 }, y: [10, 26], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [HILL.c[0], HILL.c[1]], a: [60, 50], rot: 0.3 }, y: [70, 42], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [30, 140], a: [120, 40], rot: 0.1 }, y: [24, 40], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-60, 98], [20, 98], [100, 98], [200, 98], [90, 60], [-200, 80], [-215, 100], [-100, -30], [-70, -40], [110, 28], [240, 40]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.07, range: [1.5, 1.3] });
{ let k = 0; for (const l of lots()) { if (l.kind === 'yard' || ++k % 6) continue; const [x0, z0, x1, z1] = l.rect; const fz = l.front === 'n' ? z0 - 1.5 : z1 + 1.5; perches.push({ kind: 'sparrow', x: (x0 + x1) / 2, z: fz, y: l.y + 0.05, rot: l.seed * 0.01, range: [1.5, 1.2] }); } }
for (const x of [-230, -140]) perches.push({ kind: 'egret', x, z: shoreZ(x) - 1.2, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: -170, z: shoreZ(-170) - 1.5, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
function shoreZ(x) { for (let z = 140; z > 40; z--) if (wet(x, z) > 1) return z; return 100; }
void QUAY; void RADIUS;
export default { fish, flights, perches };
