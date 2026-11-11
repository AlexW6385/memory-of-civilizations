// Thebes — the animals (src/engine/fauna.js draws them; docs/settlements/thebes.md §9): tilapia and Nile perch in the river and the
// sacred lake, swallows over the water and the quay, black kites over the pylons (drawn as crows), sparrows on the paving of the
// avenue, the market and the courts, a heron and a little egret on the reeds and the quay.
import { RIVER, LAKE, QUAY, riverX, height, ENCL } from './layout.js';

const inWater = (x, z) => Math.abs(x - riverX(z)) - (RIVER.w / 2 - 2);
const fish = [];
for (let z = -300; z < 300; z += 60) for (let i = 0; i < 2; i++) fish.push({ n: 3, size: [0.3, 0.7], palette: 'carp', y: RIVER.level, area: [RIVER.x - 12, z, RIVER.x + 12, z + 60], dist: inWater, margin: 3, a: [6, 26], ratio: 0.3, speed: 0.4, rise: 0.2 });
// the sacred lake: schools in its stone basin
fish.push({ n: 5, size: [0.25, 0.5], palette: 'carp', y: -2.2, area: [LAKE[0] + 2, LAKE[1] + 2, LAKE[2] - 2, LAKE[3] - 2], dist: (x, z) => Math.min(x - LAKE[0], LAKE[2] - x, z - LAKE[1], LAKE[3] - z) - 1.5, margin: 1.5, a: [10, 8], ratio: 0.4, speed: 0.35, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [RIVER.x, -250], b: [RIVER.x, 250] }, y: [1.5, 14], speed: 10, half: 26 },
  { kind: 'swallow', n: 4, loop: { c: [-200, 40], a: [60, 60], rot: 0.3 }, y: [4, 22], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [100, 100], a: [70, 40], rot: 0 }, y: [2, 10], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [-70, 0], a: [90, 55], rot: 0.2 }, y: [60, 38], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [30, -20], a: [50, 40], rot: 0.9 }, y: [42, 28], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [-120, -200], a: [60, 40], rot: 0.1 }, y: [25, 14], speed: 8 },
];
const perches = [];
const spots = [[-200, 5], [-180, -4], [-140, 4], [-124, -8], [-60, 3], [-6, -3], [20, 4], [-224, 34], [-210, 40], [-226, 58], [-104, 80], [-60, 100], [60, 120], [90, 30], [-30, -120], [-10, -100], [-120, -224], [-40, -204], [40, 204], [-160, 140], [110, -60], [-246, 20], [-246, -60], [-246, 100]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'heron', x: RIVER.x + RIVER.w / 2 - 2, z: -160, y: -3.2, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: QUAY.x - 1.3, z: 60, y: 0.7, rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: LAKE[0] - 1.8, z: 100, y: 0.4, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void ENCL;
export default { fish, flights, perches };
