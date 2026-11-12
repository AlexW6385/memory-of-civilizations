// Alexandria about 250 BC — the animals (src/engine/fauna.js; docs/settlements/alexandria.md §10): mullet in the harbour and at the
// quays, swifts and swallows over the water and the Canopic Way, black kites (the dark birds of the engine) circling over the
// Museion and the Pharos, sparrows on the paving, a heron and little egrets on the quay and at the lake.
import { SEA, GROUND, QUAY, PHAROS, MUSEION, AGORA, SEROUTE, wet, lots } from './layout.js';

const inWater = (x, z) => wet(x, z);
const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 4, size: [0.3, 0.5], palette: 'carp', y: SEA, area: [-200 + i * 100, -140, -150 + i * 100, -108], dist: inWater, margin: 1.5, a: [12, 5], ratio: 0.3, speed: 0.4, rise: 0.25 });
for (const [x0, z0, x1, z1] of [[-380, -150, -260, -105], [-190, -255, 40, -240]]) for (let i = 0; i < 3; i++) fish.push({ n: 3, size: [0.3, 0.5], palette: 'carp', y: SEA, area: [x0, z0, x1, z1], dist: inWater, margin: 1.3, a: [8, 6], ratio: 0.4, speed: 0.35, rise: 0.2 });

const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-200, -150], b: [380, -150] }, y: [2, 22], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, lane: { a: [-300, 68], b: [380, 68] }, y: [4, 16], speed: 8, half: 12 },
  { kind: 'swallow', n: 4, lane: { a: [60, -80], b: [60, 240] }, y: [4, 14], speed: 8, half: 8 },
  { kind: 'crow', n: 4, loop: { c: [PHAROS.c[0], PHAROS.c[1]], a: [34, 30], rot: 0.3 }, y: [70, 38], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [(MUSEION[0] + MUSEION[2]) / 2, -40], a: [70, 40], rot: 0.1 }, y: [40, 22], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [SEROUTE.rect[0] + 40, 150], a: [50, 40], rot: 0.2 }, y: [34, 20], speed: 8 },
  { kind: 'swallow', n: 4, lane: { a: [-420, 150], b: [-130, 150] }, y: [3, 12], speed: 8, half: 14 },
  { kind: 'swallow', n: 4, lane: { a: [90, 120], b: [90, 250] }, y: [3, 12], speed: 8, half: 10 },
];
const perches = [];
for (const [x, z] of [[30, -86], [110, -85], [200, -85], [-60, -86], [60, 70], [20, 70], [100, 112], [240, -50]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.07, range: [1.5, 1.3] });
// sparrows on the paving at the house fronts and about the agora's booths, near the visitor's usual ways
{ let k = 0; for (const l of lots()) { if (k++ % 9) continue; const [x0, z0, x1, z1] = l.rect; perches.push({ kind: 'sparrow', x: (x0 + x1) / 2, z: l.front === 'n' ? z0 - 0.6 : z1 + 0.6, y: GROUND + 0.1, rot: x0 * 0.05, range: [1.4, 1.2], alert: 4 }); } }
for (const [x, z] of [[AGORA[0] + 10, AGORA[1] + 20], [AGORA[0] + 30, AGORA[1] + 30], [AGORA[0] + 44, AGORA[1] + 24]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.3, range: [2, 1.5], alert: 4 });
perches.push({ kind: 'heron', x: 170, z: -91.5, y: GROUND, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: -40, z: 240, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: 120, z: 244, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void QUAY;
export default { fish, flights, perches };
