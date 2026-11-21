// Han Chang'an — the animals (src/engine/fauna.js; docs/settlements/han-changan.md §8): carp in the Kunming Lake and the imperial pond, swallows over
// the water and the avenue, crows over the palaces' roofs and the city wall, sparrows on the paving of the court, the markets and the lanes, an egret
// and a heron at the lake's shore.
import { walkRoutes } from './walkroutes.js';
import { lotFrame } from '../../styles/han/kit.js';
import { houseDoors } from '../../styles/hanlodge/index.js';
import { lots, inService, serviceKind, MARKET_WALL } from './layout.js';
import { LAKE, LAKE_Y, GARDEN_POND, POND_Y, AX, height, WARDS, WEST_MARKET, EAST_MARKET, MOAT, MOAT_Y, WALL_W, WALL_S, PALACE } from './layout.js';

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
// sparrows on the copings: the ward walls (3.3 m + the tile cap), the markets' walls (5 m), the palace wall (8 m) and the city wall's parapet (11 m + 1.3 m)
for (const w of WARDS) for (const f of [0.3, 0.7]) perches.push({ kind: 'sparrow', x: w[0] + (w[2] - w[0]) * f, z: w[1] + 0.8, y: 3.3 + 0.34, rot: 0, range: [3.2, 0], alert: 5 });
for (const [x0, z0, x1, z1] of [WEST_MARKET, EAST_MARKET]) for (const f of [0.25, 0.75]) perches.push({ kind: 'sparrow', x: x0 + (x1 - x0) * f, z: z1 - 1.2, y: 5.34, rot: 0, range: [3, 0], alert: 5 });
for (const f of [0.3, 0.55]) perches.push({ kind: 'sparrow', x: PALACE[0] + (PALACE[2] - PALACE[0]) * f, z: PALACE[3], y: 8.34, rot: 0, range: [3, 0], alert: 5 });
perches.push({ kind: 'sparrow', x: WALL_W + 1.5, z: 80, y: 12.4, rot: Math.PI / 2, range: [3, 0], alert: 5 }, { kind: 'sparrow', x: 60, z: WALL_S - 1.5, y: 12.4, rot: 0, range: [3, 0], alert: 5 });
// the moat: carp along the west and south reaches, an egret on its berm, swallows skimming it
for (const m of [MOAT[0], MOAT[1]]) {
  const alongZ = m[3] - m[1] > m[2] - m[0], c = [(m[0] + m[2]) / 2, (m[1] + m[3]) / 2];
  for (let k = 0; k < 3; k++) { const t = 0.2 + k * 0.28; const cx = alongZ ? c[0] : m[0] + (m[2] - m[0]) * t, cz = alongZ ? m[1] + (m[3] - m[1]) * t : c[1]; fish.push({ n: 3, size: [0.3, 0.6], palette: 'carp', y: MOAT_Y, area: alongZ ? [m[0] + 1, cz - 20, m[2] - 1, cz + 20] : [cx - 20, m[1] + 1, cx + 20, m[3] - 1], dist: (x, z) => Math.min(x - m[0], m[2] - x, z - m[1], m[3] - z) - 0.4, margin: 0.4, a: alongZ ? [2, 12] : [12, 2], ratio: 0.4, speed: 0.4, rise: 0.2 }); }
}
perches.push({ kind: 'egret', x: WALL_W - 12.5, z: 120, y: 0.1, rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 });
flights.push({ kind: 'swallow', n: 4, lane: { a: [WALL_W - 8, -300], b: [WALL_W - 8, 250] }, y: [-0.4, 3], speed: 9, half: 6 }, { kind: 'swallow', n: 4, lane: { a: [-200, WALL_S + 12], b: [420, WALL_S + 12] }, y: [-0.4, 3], speed: 9, half: 6 });
void LAKE_Y;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §16) ──
// The animals of the Han city that the tomb models show (dogs, hens and roosters in the yards, geese, goats, ducks): dogs lying at the doors of the service quarters' houses on the walk
// and beside the guard sheds, hens and a rooster in a yard's front, the swallows' mud nests under the eaves of the lane's houses, a goose and duck raft on the Kunming Lake and the palace pond,
// cranes on the pond's bank (the cranes of the Han imperial gardens), goats and hens tethered in the East Market by its gate. No cat (not certain for the Han city), no pigeons.
const critters = [];
const NOOPC = { bag: new Proxy({}, { get: () => () => {} }), col: new Proxy({}, { get: () => () => {} }) };
{
  const homes = lots().filter((l) => inService(l) && (serviceKind(l) === 'row' || serviceKind(l) === 'shop') && Math.abs((l.rect[0] + l.rect[2]) / 2 - AX) < 90 && l.rect[1] < -50);
  let k = 0;
  for (const l of homes) {
    const D = houseDoors({ rect: l.rect, front: l.front, kind: serviceKind(l), seed: l.seed }), F = lotFrame(NOOPC, l.rect, l.front);
    if (D.du === undefined) continue;
    const side = D.du > F.W / 2 ? -1 : 1, du = D.du + side * (D.dw / 2 + 1.1);
    const [x, z] = F.pt(du, -0.7);
    if (k < 3) critters.push({ model: 'dog', at: [x, 0.02, z], rot: 1.1 + k, range: [9, 3.5] });
    // the swallows' nest under the eave, away from the door
    const nu = D.du + side * (D.dw / 2 + 2.2), [nx, nz] = F.pt(Math.max(1, Math.min(F.W - 1, nu)), D.v0 - 0.2), sg = l.front === 's' ? 1 : -1;
    if (k < 4) critters.push({ model: 'swallow_nest', at: [nx, 2.55, nz], rot: l.front === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 });
    void sg;
    k++;
  }
  void walkRoutes;
}
// a dog by the guard sheds at the palace's south gate, hens and a rooster on the forecourt's edge by the service quarter's lane (the kitchens' fowl)
critters.push({ model: 'dog', at: [AX - 14, 0.02, 100], rot: 2.0, range: [9, 3.5] });
for (const [model, x, z] of [['rooster', AX - 15, -84.5], ['hen_brown', AX - 13.6, -84.0], ['hen_white', AX - 14.6, -82.9], ['hen_brown', AX - 16.2, -83.4]]) critters.push({ model, at: [x, 0.02, z], rot: x, range: [3.4, 1.4] });
// the East Market: two goats and a few hens at the west gate's inside (livestock was sold in the markets [inferred])
{
  const x = EAST_MARKET[0] + MARKET_WALL.th + 4, z = (EAST_MARKET[1] + EAST_MARKET[3]) / 2 - 8.6;
  critters.push({ model: 'goat_white', at: [x, 0.02, z], rot: 0.6, range: [9, 3.2] }, { model: 'goat_black', at: [x + 1.4, 0.02, z + 0.8], rot: 3.0, range: [9, 3.2] });
  for (const [model, dx, dz] of [['hen_brown', 3.0, 0.2], ['hen_white', 3.9, -0.5], ['rooster', 3.4, -1.0]]) critters.push({ model, at: [x + dx, 0.02, z + dz], rot: dx, range: [3.4, 1.4] });
}
// geese and ducks afloat on the Kunming Lake (a raft of geese near the west shore), ducks on the palace pond, a crane on the pond's north bank
critters.push({ type: 'floaters', models: ['goose_white', 'goose_grey', 'goose_white', 'goose_white'], raft: true, area: [LAKE.c[0] - LAKE.rx + 10, LAKE.c[1] - 20, LAKE.c[0] - 20, LAKE.c[1] + 25], dist: lakeDist, a: [16, 9], ratio: 0.3, margin: 3, y: LAKE_Y, speed: 0.2, cycle: [18, 26] });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown'], raft: true, area: [GARDEN_POND[0] + 3, GARDEN_POND[1] + 3, GARDEN_POND[2] - 3, GARDEN_POND[3] - 3], dist: (x, z) => Math.min(x - GARDEN_POND[0], GARDEN_POND[2] - x, z - GARDEN_POND[1], GARDEN_POND[3] - z) - 1.5, a: [12, 8], ratio: 0.4, margin: 1.5, y: POND_Y, speed: 0.2, cycle: [18, 24] });
critters.push({ model: 'crane', at: [GARDEN_POND[0] + 30, 0.02, GARDEN_POND[1] - 2.4], rot: Math.PI / 2, range: [7.0, 1.6], tau: 50, speed: 0.4 });
export default { fish, flights, perches, critters };
