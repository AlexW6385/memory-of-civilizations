// Venice about 1500 — the animals (src/engine/fauna.js; docs/settlements/venice.md §10): mullet in the canals and the basin, swifts and
// swallows over the water, hooded crows round the campanile at dusk, sparrows hopping on the paving of the piazza and the streets,
// a grey heron on the quay and a little egret at the lagoon's edge.
import { SEA, GROUND, GRAND, BASIN_Z, RADIUS, bands, wet, wells } from './layout.js';
import { ranges } from './shops.js';
import { P as SHOP_P, FW as SHOP_FW, WIN } from '../../styles/venetian/shops.js';
import { Vector3 } from '../../core/three.js';

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

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/venice.md §5f.4) ──
const critters = [];
// cormorants on the tops of the mooring poles (pali) before the Molo, looking out over the basin [inferred: they fish the lagoon and perch on such poles]
for (const [x, dz, i] of [[27.5, 9.5, 0], [75, 9.5, 1], [81, 1.2, 2], [149, 9.5, 3]]) critters.push({ model: 'cormorant', at: [x, SEA - 3 + 6.2 + 0.1, BASIN_Z + dz], rot: Math.PI / 2 + (i - 1.5) * 0.2, cycle: 46 + 7 * i });
// ducks of the outer lagoon, a raft of them off the Molo and another by the western edge of the basin [inferred: Carpaccio's Hunting on the Lagoon shows the lagoon's birds]
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_white', 'duck_brown'], area: [-150, BASIN_Z + 26, -70, BASIN_Z + 70], dist: inWater, a: [9, 4], ratio: 0.4, margin: 2, y: SEA, speed: 0.2, cycle: [24, 32] });
// cats: one by the wellhead on the piazza's north side and one on the Molo's stones; a dog at the Piazzetta's west edge by the Palace [inferred: strays of every quay]
{
  const w = wells().find((q) => Math.abs(q.at[0] + 52) < 1 && q.at[1] < -30)?.at;
  if (w) critters.push({ model: 'cat_tabby', at: [w[0] + 1.7, GROUND + 0.02, w[1] + 0.6], rot: 2.2, range: [5, 1.8] });
}
critters.push({ model: 'cat_orange', at: [46, GROUND + 0.02, BASIN_Z - 2.4], rot: 0.6, range: [6, 1.6] });
critters.push({ model: 'dog', at: [71, GROUND + 0.02, 62], rot: Math.PI, range: [8, 3] });
// hens and a cock in a yard-like corner of the first calle west of the squero [inferred: the poultry of the houses]
{
  const b = bands()[4], r = b?.runs[0];
  if (b && r) for (const [model, dx, dz] of [['rooster', 0.5, 0], ['hen_brown', -0.7, 0.9], ['hen_white', 0.9, 1.3], ['hen_brown', -0.3, -1.1]]) critters.push({ model, at: [b.x0 + 1.2 + dx, GROUND + 0.02, (r[0] + r[1]) / 2 + dz], rot: dx, range: [2.6, 1.4] });
}
// a caged songbird hung out at the spice-seller's window in the Procuratie's south arcade, beside the counter-window
{
  const R = ranges().find((q) => q.id === 's'), sh = R?.shops.find((q) => q.trade === 'spice') ?? R?.shops[1];
  if (R && sh) {
    const bay = R.L / R.n, uw = sh.i * bay + 1.5 * bay, p = new Vector3(uw + WIN / 2 + 0.3, GROUND + 2.0, -SHOP_P + 0.22).applyMatrix4(R.FM), e = R.FM.elements;
    void SHOP_FW; critters.push({ model: 'cagebird', at: [p.x, p.y, p.z], rot: Math.atan2(e[8], e[10]) });
  }
}
export default { fish, flights, perches, critters };
