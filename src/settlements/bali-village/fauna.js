// A Balinese village — the animals (src/engine/fauna.js; docs/settlements/bali-village.md §8): swallows along the village street and the lane and over the paddies, crows over the
// temple's merus and the dalem's banyan, egrets standing in the flooded paddies (the white heron of the rice fields), sparrows on the walls' copings and the bale roofs' edges.
// Every place is derived from layout.js (the compounds' lots, the terraces' treads).
import { PURA, DALEM_C, STREET, LANE, lots, lotFrame, height, flooded, CORE, RADIUS } from './layout.js';

const flights = [
  { kind: 'swallow', n: 5, lane: { a: [0, STREET[1] - 20], b: [0, STREET[3] + 20] }, y: [1.4, 5], speed: 9, a: [26, 3] },
  { kind: 'swallow', n: 4, lane: { a: [LANE[0] - 20, (LANE[1] + LANE[3]) / 2], b: [LANE[2] + 20, (LANE[1] + LANE[3]) / 2] }, y: [1.4, 5], speed: 9, a: [26, 3] },
  { kind: 'swallow', n: 6, loop: { c: [0, 60], a: [90, 70], rot: 0.2 }, y: [2, 12], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-130, 90], a: [60, 40], rot: 0.5 }, y: [0.8, 4], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [130, -60], a: [60, 40], rot: -0.4 }, y: [0.8, 4], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [0, (PURA.zN + PURA.zM) / 2], a: [45, 30], rot: 0.1 }, y: [26, 14], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [DALEM_C[0], DALEM_C[1]], a: [22, 16], rot: 0.3 }, y: [20, 12], speed: 7 },
];
const perches = [];
// sparrows on the copings of the street walls (every second compound) and on the temple walls' copings
lots().forEach((l, i) => {
  if (i % 2) return;
  const F = lotFrame(l), W = l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], u = W * (l.gateF > 0.5 ? 0.2 : 0.8), p = F(u, 0.25);
  perches.push({ kind: 'sparrow', x: p[0], z: p[1], y: l.rich ? 2.45 + 0.3 : 2.0 + 0.4, rot: l.front === 'n' || l.front === 's' ? 0 : Math.PI / 2, range: [1.8, 0], alert: 4 });
});
for (const [x, z, y] of [[-33.7, -100, 3.4], [33.7, -120, 5.0], [-20, -72, 3.2], [20, -72, 3.2], [33.7, -90, 3.4]]) perches.push({ kind: 'sparrow', x, z, y, rot: Math.abs(x) > 30 ? Math.PI / 2 : 0, range: [1.6, 0], alert: 4 });
// egrets in the flooded paddies: the first flat flooded tread found in each sector of the terraces
let seed = 7;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
for (let sector = 0; sector < 8; sector++) {
  for (let k = 0; k < 80; k++) {
    const a = (sector + rnd()) / 8 * 6.283, d = 112 + rnd() * 55, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.95;
    if (Math.hypot(x, z) > RADIUS - 14 || (x > CORE[0] - 2 && x < CORE[2] + 2 && z > CORE[1] - 2 && z < CORE[3] + 2)) continue;
    const y = height(x, z);
    if (![[2, 0], [-2, 0], [0, 2], [0, -2]].every(([dx, dz]) => Math.abs(height(x + dx, z + dz) - y) < 0.02) || !flooded(x, z, y)) continue;
    perches.push({ kind: 'egret', x, z, y: y + 0.07, rot: rnd() * 6, stay: [80, 240], gone: [40, 150], alert: 10 });
    break;
  }
}
export default { fish: [], flights, perches };
