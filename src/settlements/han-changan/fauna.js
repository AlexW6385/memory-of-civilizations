// Han Chang'an — the animals (src/engine/fauna.js; docs/settlements/han-changan.md §8): carp in the Kunming Lake and the imperial pond, swallows over
// the water and the avenue, crows over the palaces' roofs and the city wall, sparrows on the paving of the court, the markets and the lanes, an egret
// and a heron at the lake's shore.
import { LAKE, LAKE_Y, GARDEN_POND, POND_Y, AX, height } from './layout.js';

const lakeDist = (x, z) => (1 - Math.hypot((x - LAKE.c[0]) / LAKE.rx, (z - LAKE.c[1]) / LAKE.rz)) * 60;
const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 4, size: [0.3, 0.7], palette: 'carp', y: LAKE_Y, area: [LAKE.c[0] - LAKE.rx + 8, LAKE.c[1] - LAKE.rz + 8, LAKE.c[0] + LAKE.rx - 8, LAKE.c[1] + LAKE.rz - 8], dist: lakeDist, margin: 3, a: [18, 10], ratio: 0.4, speed: 0.4, rise: 0.25 });
for (let i = 0; i < 3; i++) fish.push({ n: 4, size: [0.3, 0.6], palette: 'redcarp', y: POND_Y, area: [GARDEN_POND[0] + 3, GARDEN_POND[1] + 3, GARDEN_POND[2] - 3, GARDEN_POND[3] - 3], dist: (x, z) => Math.min(x - GARDEN_POND[0], GARDEN_POND[2] - x, z - GARDEN_POND[1], GARDEN_POND[3] - z) - 1.5, margin: 1.5, a: [12, 10], ratio: 0.5, speed: 0.35, rise: 0.3 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [LAKE.c[0], LAKE.c[1]], a: [60, 40], rot: 0.2 }, y: [1.5, 9], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [150, -380], b: [150, 240] }, y: [2, 12], speed: 9, half: 20 },
  { kind: 'swallow', n: 4, loop: { c: [-60, 40], a: [80, 60], rot: 0.5 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [AX, -160], a: [90, 60], rot: 0 }, y: [48, 30], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [295, -80], a: [60, 40], rot: 0.5 }, y: [34, 22], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-140, -330], a: [70, 40], rot: 0.1 }, y: [28, 16], speed: 8 },
];
const perches = [];
for (const [x, z] of [[AX - 8, -60], [AX + 8, -40], [AX, -125], [AX - 30, 40], [AX + 20, 70], [-130, -330], [-100, -300], [-160, -300], [150, 40], [150, -200], [270, -300], [-60, 180], [20, 190], [-180, 190], [230, 190], [110, 320], [120, 300], [-150, -80], [-210, -40]])
  perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'egret', x: LAKE.c[0] + LAKE.rx * 0.9, z: LAKE.c[1] - 12, y: 0.1, rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: GARDEN_POND[2] + 1.5, z: GARDEN_POND[1] + 15, y: 0.1, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void LAKE_Y;
export default { fish, flights, perches };
