// Venice about 1500 — the animals (src/engine/fauna.js; docs/settlements/venice.md §10): mullet in the canals and the basin, swifts and
// swallows over the water, hooded crows round the campanile at dusk, sparrows hopping on the paving of the piazza and the streets,
// a grey heron on the quay and a little egret at the lagoon's edge.
import { SEA, GROUND, GRAND, BASIN_Z, RADIUS, bands, wet } from './layout.js';

const inWater = (x, z) => wet(x, z);
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 4, size: [0.28, 0.45], palette: 'carp', y: SEA, area: [-150 + i * 70, BASIN_Z + 14, -110 + i * 70, BASIN_Z + 40], dist: inWater, margin: 1.5, a: [12, 5], ratio: 0.3, speed: 0.4, rise: 0.25 });
for (const [x0, z0, x1, z1] of [[-205, -75, -188, -25], [-198, -20, -186, 35], [-45, -150, -33, 100]]) for (let i = 0; i < 3; i++) fish.push({ n: 3, size: [0.3, 0.5], palette: 'carp', y: SEA, area: [x0, z0, x1, z1], dist: inWater, margin: 1.3, a: [6, 10], ratio: 0.4, speed: 0.35, rise: 0.2 });

const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-192, -80], b: [-188, 40] }, y: [1, 14], speed: 9, half: 16 },
  { kind: 'swallow', n: 4, lane: { a: [-200, BASIN_Z + 20], b: [210, BASIN_Z + 20] }, y: [1, 9], speed: 9, half: 14 },
  { kind: 'swallow', n: 3, lane: { a: [-36, -140], b: [-32, 100] }, y: [1, 8], speed: 8, half: 6 },
  { kind: 'crow', n: 6, loop: { c: [12, 22], a: [34, 30], rot: 0.3 }, y: [40, 16], speed: 9 },
];
const perches = [];
for (const [x, z] of [[-110, -4], [-70, 12], [-35, -20], [-5, 8], [-90, -30], [40, 50], [60, 90], [100, 66]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.07, range: [1.5, 1.3] });
for (const b of bands()) for (const [z0, z1] of b.runs.slice(0, 1)) perches.push({ kind: 'sparrow', x: (b.x0 + b.x1) / 2, z: (z0 + z1) / 2, y: GROUND + 0.1, rot: 0.4, range: [1.4, 1.2] });
perches.push({ kind: 'heron', x: 160, z: BASIN_Z - 1.2, y: GROUND, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: 60, z: BASIN_Z - 0.6, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void GRAND; void RADIUS;
export default { fish, flights, perches };
