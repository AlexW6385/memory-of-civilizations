// Victorian London — the animals (src/engine/fauna.js draws them; docs/settlements/london.md §7): house sparrows on the paving of the
// streets and squares and the embankment parapet, rooks (the crows' stand-in) over the Abbey and Parliament Square at dusk, swifts
// (the swallows' stand-in) over the Thames and the streets in summer, and a grey heron on the mud of the Lambeth shore at low tide.
import { ABBEY, SQUARE, GROUND, RIVER, BRIDGE, bank, height, streetsZ, crossX, inLot, blocked } from './layout.js';

const mid = (z) => { const [a, b] = bank(z); return (a + b) / 2; };
const flights = [
  { kind: 'crow', n: 7, loop: { c: [(ABBEY[0] + ABBEY[2]) / 2, (ABBEY[1] + ABBEY[3]) / 2], a: [46, 26], rot: 0.3 }, y: [34, 14], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [(SQUARE[0] + SQUARE[2]) / 2, (SQUARE[1] + SQUARE[3]) / 2], a: [34, 22], rot: 1.1 }, y: [26, 12], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [mid(-250), -250], b: [mid(250), 250] }, y: [-0.5, 5], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [mid(-60) + 25, -60], b: [mid(160) + 25, 160] }, y: [-0.5, 5], speed: 9 },
];
flights[2].a = flights[3].a = [30, 4];
const perches = [];
// house sparrows hopping on the paving along the streets near the arrival: a place at the kerb of each of some streets
let sd = 1870; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
for (const zc of streetsZ()) {
  if (Math.abs(zc - BRIDGE.z) > 150) continue;
  for (let x = -230 + rand() * 40; x < 230; x += 38 + rand() * 40) {
    const z = zc + (rand() < 0.5 ? -1 : 1) * 2.2;
    if (blocked(x, z, -1) || inLot(x, z, 1) || crossX().some((c) => Math.abs(c - x) < 5)) continue;
    perches.push({ kind: 'sparrow', x, z, y: GROUND, rot: rand() * 3, range: [1.4, 1.3] });
  }
}
for (const [x, z] of [[-30, -190], [10, -160], [-45, -170], [20, -200]]) perches.push({ kind: 'sparrow', x, z, y: GROUND, rot: x, range: [1.6, 1.4] });
// the grey heron on the Thames mud under the Lambeth embankment, facing the water
{ const z = 40, x = bank(z)[1] - 3.4; perches.push({ kind: 'heron', x, z, y: Math.max(height(x, z), RIVER.level + 0.05), rot: Math.PI, stay: [80, 240], gone: [60, 180], alert: 12 }); }
export default { fish: [], flights, perches };
