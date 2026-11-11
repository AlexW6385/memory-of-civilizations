// Mexica Tenochtitlan — the animals (src/engine/fauna.js; docs/settlements/tenochtitlan.md §14): fish in the canals and the
// channels of the lake, swallows over the avenues and canals, egrets and herons standing in the shallows by the chinampas
// (the lake's waders), sparrows on the plaza and the lanes, and the black birds that gather over the temples at dusk.
import { RADIUS, LEVEL, ISLAND, CANALS, CAUSEWAY, GAP, TM, inLake } from './layout.js';

const clipEnd = (v) => Math.sqrt(Math.max(0, (ISLAND - 8) ** 2 - v * v));
/** Negative inside the water of a canal (its distance from the nearer bank), positive outside. */
const canalDist = (c) => {
  const horiz = c[2] - c[0] > c[3] - c[1];
  return (x, z) => { const d = horiz ? Math.min(z - c[1], c[3] - z) : Math.min(x - c[0], c[2] - x), e = horiz ? Math.min(x - c[0], c[2] - x) : Math.min(z - c[1], c[3] - z); return -Math.min(d, e + 4); };
};
const fish = [];
for (const c of CANALS) {
  const horiz = c[2] - c[0] > c[3] - c[1], mid = horiz ? (c[1] + c[3]) / 2 : (c[0] + c[2]) / 2, e = clipEnd(mid), dist = canalDist(c);
  for (const [s0, s1] of [[-e + 12, -34], [34, e - 12]]) fish.push({
    n: 3, size: [0.2, 0.34], palette: 'carp', y: LEVEL.water, dist, margin: 0.8, k: 1, rot: horiz ? 0 : Math.PI / 2,
    area: horiz ? [s0, mid - 0.5, s1, mid + 0.5] : [mid - 0.5, s0, mid + 0.5, s1], a: [9, 1.4], ratio: 0.15, minA: 1.2, speed: 0.25, rise: 0.15,
  });
}
// the lake beyond the island: schools of the lake's small fish in the open water, clear of the causeway
const lakeDist = (x, z) => { const r = Math.hypot(x, z); return -Math.min(r - (ISLAND + 2), (RADIUS - 34) - r, x < 0 ? Math.abs(z) - CAUSEWAY.z1 - 1 : 99); };
for (const a of [0.5, 1.3, 2.3, 4.1, 5.0, 5.9]) {
  const r = ISLAND + 22, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (!inLake(x, z)) continue;
  fish.push({ n: 4, size: [0.2, 0.4], palette: 'carp', y: LEVEL.water, dist: lakeDist, margin: 1.5, k: 2, rot: a, area: [x - 6, z - 6, x + 6, z + 6], a: [9, 6], ratio: 0.2, minA: 2, speed: 0.3, rise: 0.25 });
}
const flights = [
  // swallows over the avenues and along the canals
  { kind: 'swallow', n: 3, lane: { a: [-150, 0], b: [150, 0] }, y: [2, 14], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-300, 200], b: [300, 200] }, y: [-0.2, 5], speed: 8 },
  { kind: 'swallow', n: 2, lane: { a: [220, -300], b: [220, 300] }, y: [-0.2, 5], speed: 8 },
  { kind: 'swallow', n: 2, lane: { a: [-220, -300], b: [-220, 300] }, y: [-0.2, 5], speed: 8 },
  { kind: 'swallow', n: 2, lane: { a: [-300, -200], b: [300, -200] }, y: [-0.2, 5], speed: 8 },
  // the black birds over the temple at dusk
  { kind: 'crow', n: 8, loop: { c: [TM.c[0] - 10, 0], a: [60, 45], rot: 0.2 }, y: [60, 28], speed: 8 },
];
for (const f of flights.slice(0, 5)) f.a = [30, 4];
const perches = [];
// egrets and herons in the shallows between the chinampas, and on the shore of the lake
for (const [x, z, kind] of [[-306, 60, 'egret'], [-310, -90, 'heron'], [-250, 235, 'egret'], [310, 40, 'egret'], [305, -120, 'heron'], [150, 280, 'egret'], [-120, -285, 'heron'], [40, 312, 'egret'], [-60, 308, 'egret']])
  perches.push({ kind, x, z, y: LEVEL.water + 0.1, rot: Math.atan2(z, x), range: [0.5, 0.3], alert: 12 });
// egrets and herons at the canals' banks and the washing-stairs, and a swallow flight along every canal
for (const [x, z, kind] of [[-100, 197, 'egret'], [120, -197, 'heron'], [-80, -203, 'egret'], [90, 203, 'egret'], [217, -120, 'egret'], [-221, 150, 'heron'], [223, 120, 'egret'], [-217, -170, 'egret']])
  perches.push({ kind, x, z, y: LEVEL.water + 0.1, rot: 0.5, range: [0.5, 0.3], alert: 9 });
// sparrows on the plaza's paving, the lanes and the market's floor
for (const [x, z] of [[10, 60], [-20, 30], [-10, -40], [30, -28], [-100, 3], [-180, 55], [-190, 78], [-176, 30], [-80, 80], [60, 140], [100, 160], [-60, 210], [180, 60], [-150, -200], [140, -190], [-18, 140], [0, -150]])
  perches.push({ kind: 'sparrow', x, z, y: 0.04, rot: 0.3 + (x * 7 % 3), range: [1.3, 1.2] });
void GAP;
export default { fish, flights, perches };
