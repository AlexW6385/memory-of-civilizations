// Taos Pueblo — the animals (src/engine/fauna.js draws them; docs/settlements/taos.md §4.4): swallows over the creek and the
// plaza, ravens high over the terraces, small birds (sparrow stand-ins) on the plaza's earth and the roofs' parapets, an egret
// standing in for a heron at the creek's edge, small dark trout in Red Willow Creek [inferred: a snowmelt stream of the valley].
import { CREEK, creekZ, NORTH, SOUTH, CELL, PENS, WALL, inCreek, nearYard, onKeep } from './layout.js';
import { ground } from './ground.js';

const creekDist = (x, z) => Math.abs(z - creekZ(x)) - CREEK.w / 2;
const fish = [];
for (let x = -50; x <= 50; x += 25) fish.push({ n: 3, size: [0.14, 0.24], palette: 'carp', y: CREEK.water, dist: creekDist, margin: 0.5, k: 1, rot: 0, area: [x - 12, creekZ(x) - 0.3, x + 12, creekZ(x) + 0.3], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-200, 0], b: [200, 0] }, y: [0.4, 3.2], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -20], a: [60, 26], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [-20, -90], a: [90, 40], rot: 0.3 }, y: [28, 55], speed: 8 },
];
flights[0].a = [26, 3];
const perches = [];
for (const [x, z] of [[-55, -30], [-30, -35], [-5, -20], [20, -30], [45, -35], [-45, 28], [-15, 30], [15, 36], [40, 30], [60, 12], [-60, 12], [0, -50]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// ...and on the parapet of a low roof of the North House (the roofs of the first storey stand at 2.7 m)
for (const [x, z] of [[-12.5, -55.5], [4, -54], [-46, -62]]) perches.push({ kind: 'sparrow', x, z, y: 2.7 + 0.5, rot: 0, range: [1.2, 0], alert: 5 });
// a small egret on the creek's bank, facing the water
{ const x = -22, z = creekZ(x) - 2.7; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
// ...and more of them, derived from the layout (§4.5): on the parapets of forty roofs of the two houses, on the plaza's earth round the
// turkey pens (the grain), at the mealing bins and the yards, and on the perimeter wall's top
{
  let q = 77; const rand = () => ((q = (Math.imul(q, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (const B of [NORTH, SOUTH]) {
    const H = B.heights; let n = 0;
    for (let t = 0; t < 400 && n < 20; t++) {
      const i = Math.floor(rand() * H.length), j = Math.floor(rand() * H[0].length), h = H[i][j];
      if (!h) continue;
      perches.push({ kind: 'sparrow', x: B.x0 + (j + 0.2 + rand() * 0.6) * CELL, z: B.z0 + (i + 0.2 + rand() * 0.6) * CELL, y: h * 2.7 + 0.5, rot: rand() * 3, range: [1.2, 0.4], alert: 5 }); n++;
    }
  }
  for (const [px, pz] of PENS) for (let k = 0; k < 2; k++) perches.push({ kind: 'sparrow', x: px + (rand() - 0.5) * 8, z: pz + (rand() - 0.5) * 8, y: ground.height(px, pz) + 0.05, rot: rand() * 3, range: [2.2, 1.6] });
  for (let t = 0, n = 0; t < 200 && n < 14; t++) {
    const x = -62 + rand() * 124, z = -40 + rand() * 76;
    if (inCreek(x, z, 2) || onKeep(x, z, 1)) continue;
    perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: rand() * 3, range: [2, 1.6] }); n++;
  }
  for (const [x, z, rot] of [[-90, WALL[1], 0], [-40, WALL[1], 0], [60, WALL[1], 0], [WALL[0], -60, Math.PI / 2], [WALL[2], 40, Math.PI / 2], [-80, WALL[3], 0], [90, WALL[3], 0]]) perches.push({ kind: 'sparrow', x, z, y: 2.2 + 0.2, rot, range: [3, 0], alert: 6 });
  // a second egret, upstream; and the swallows over the plaza by the houses' feet
  { const x = 38, z = creekZ(x) + 2.8; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: -Math.PI / 2, stay: [50, 160], gone: [70, 200], alert: 10 }); }
}
flights.push({ kind: 'swallow', n: 4, loop: { c: [40, 8], a: [30, 14], rot: 0.2 }, y: [1.2, 6], speed: 9 }, { kind: 'swallow', n: 3, loop: { c: [-45, 4], a: [24, 10], rot: -0.2 }, y: [1.2, 5], speed: 9 }, { kind: 'crow', n: 4, loop: { c: [60, 60], a: [50, 30], rot: 0.6 }, y: [24, 46], speed: 8 });
for (let x = -62; x <= 62; x += 31) fish.push({ n: 4, size: [0.1, 0.18], palette: 'carp', y: CREEK.water, dist: creekDist, margin: 0.5, k: 1, rot: 0, area: [x - 14, creekZ(x) - 0.35, x + 14, creekZ(x) + 0.35], a: [11, 1.1], ratio: 0.1, minA: 1.2, speed: 0.35, rise: 0.1 });
void nearYard;
export default { fish, flights, perches };
