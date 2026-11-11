// Paris in 1248 — the animals (src/engine/fauna.js draws them; docs/settlements/paris.md §5c): swallows and house martins
// over the Seine and the rues, rooks and jackdaws about the towers of Notre-Dame and the palace roofs at twilight, house
// sparrows on the paving and the parvis, a grey heron on the Left Bank's strand.
import { NORTH_ARM, SOUTH_ARM, CATHEDRAL, PALACE, PARVIS, RADIUS, streets, inBlock, inRiver } from './layout.js';
import { ground } from './ground.js';

const mid = (a) => (a[1] + a[3]) / 2;
const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, mid(NORTH_ARM)], b: [200, mid(NORTH_ARM)] }, y: [-0.5, 3.5], speed: 9, a: [26, 12] },
  { kind: 'swallow', n: 3, lane: { a: [-200, mid(SOUTH_ARM)], b: [200, mid(SOUTH_ARM)] }, y: [-0.5, 3.5], speed: 9, a: [26, 10] },
  { kind: 'swallow', n: 3, loop: { c: [(PARVIS[0] + PARVIS[2]) / 2, 0], a: [34, 22], rot: 0.3 }, y: [14, 6], speed: 8 },
  // rooks and jackdaws round the west towers (69 m) and the spire, at twilight
  { kind: 'crow', n: 9, loop: { c: [CATHEDRAL[0] + 14, 0], a: [34, 26], rot: 0 }, y: [78, 52], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [(PALACE[0] + PALACE[2]) / 2 + 40, -20], a: [40, 24], rot: 0.5 }, y: [42, 24], speed: 9 },
];
const perches = [];
// house sparrows on the paving of the rues and the parvis, hopping about a spot
{
  let k = 0;
  for (const r of streets()) {
    const w = r[2] - r[0];
    if (w > 700) continue;
    for (let i = 0; i < Math.max(1, Math.floor(w / 90)); i++) {
      const x = r[0] + (i + 0.5) * w / Math.max(1, Math.floor(w / 90)) + (k % 5) * 3, z = (r[1] + r[3]) / 2 + ((k * 7) % 5 - 2) * 0.3;
      if (Math.hypot(x, z) > RADIUS - 70 || inRiver(x, z)) continue;
      perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: 0.4 + (k % 7) * 0.8, range: [1.4, 1.2] });
      k++;
    }
  }
}
for (const [x, z] of [[118, 20], [132, -14], [140, 30], [124, -30]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: x % 3, range: [1.8, 1.5] });
// a grey heron on the strand of the Left Bank, facing the water
perches.push({ kind: 'heron', x: 38, z: SOUTH_ARM[3] + 2.2, y: ground.height(38, SOUTH_ARM[3] + 2.2), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void inBlock;
export default { fish: [], flights, perches };
