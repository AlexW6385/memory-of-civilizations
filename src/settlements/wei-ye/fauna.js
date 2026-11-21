// Three Kingdoms Ye — the animals (src/engine/fauna.js; docs/settlements/wei-ye.md §8): carp in the Xuanwu pond, swallows over the pond, the garden and the
// avenue, crows over the terraces, sparrows on the paving, an egret and a heron at the water.
import { POND, POND_Y, RIVER, riverZ, SPARROW, height, CITY_WALL, WALL, LODGES, MARKET, MARKET_WALL, lots } from './layout.js';
import '../../styles/wei/index.js';
import { houseDoors } from '../../styles/wei/houses.js';
import { lotFrame } from '../../styles/han/kit.js';

const pondDist = (x, z) => Math.min(x - POND[0], POND[2] - x, z - POND[1], POND[3] - z) - 1.5;
const fish = [];
for (let i = 0; i < 3; i++) fish.push({ n: 4, size: [0.3, 0.6], palette: i ? 'redcarp' : 'carp', y: POND_Y, area: [POND[0] + 3, POND[1] + 3, POND[2] - 3, POND[3] - 3], dist: pondDist, margin: 1.5, a: [12, 10], ratio: 0.5, speed: 0.35, rise: 0.3 });
const riverDist = (x, z) => RIVER.w / 2 + 1.5 - Math.abs(z - riverZ(x)) - 1.5;
for (const [x0, x1] of [[-210, -120], [-110, -20], [-10, 80], [90, 180]]) for (let i = 0; i < 2; i++) fish.push({ n: 2, size: [0.5, 0.8], palette: 'carp', y: RIVER.y, area: [x0, -262, x1, -238], dist: riverDist, margin: 1.2, a: [30, 7], ratio: 0.2, speed: 0.4, rise: 0.2 });
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-215, 74.4], b: [-18, 74.4] }, y: [2, 9], speed: 9, half: 12 },
  { kind: 'swallow', n: 5, lane: { a: [18, 122.4], b: [120, 122.4] }, y: [2, 9], speed: 9, half: 12 },
  { kind: 'swallow', n: 4, loop: { c: [182, 104], a: [50, 40], rot: 0.2 }, y: [3, 12], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [-210, -250], b: [210, -250] }, y: [0.6, 5], speed: 9, half: 16 },
  { kind: 'crow', n: 5, loop: { c: [155, -35], a: [60, 25], rot: 0 }, y: [28, 14], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [0, 120], a: [150, 70], rot: 0.3 }, y: [40, 24], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-110, -100], a: [60, 40], rot: 0.2 }, y: [1.5, 9], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [-230, 25], b: [230, 25] }, y: [2, 12], speed: 9, half: 20 },
  { kind: 'swallow', n: 4, loop: { c: [0, 100], a: [90, 50], rot: 0.5 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [-196, -88], a: [70, 60], rot: 0 }, y: [48, 30], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, -90], a: [60, 40], rot: 0.5 }, y: [34, 22], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-100, -60], [-120, -40], [-110, -108], [-20, 0], [20, -20], [0, -33], [-60, 30], [60, 30], [-100, 40], [100, 40], [-180, 30], [180, 10], [0, 100], [60, 120], [-60, 120], [-190, 100], [-200, -150], [150, -110], [170, 100]])
  perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z, rot] of [[-120, WALL.s - 0.2, 0], [60, WALL.s, 0], [-20, WALL.n, 0], [150, WALL.n, 0], [WALL.e, 90, Math.PI / 2], [WALL.w, -60, Math.PI / 2], [WALL.w, 100, Math.PI / 2]])
  perches.push({ kind: 'sparrow', x, z, y: CITY_WALL.h + 1.5 + 0.05, rot, range: [2.6, 0], alert: 5 });
for (const [x, k] of [[-150, 'egret'], [20, 'heron'], [140, 'egret'], [-90, 'heron']]) { const z = riverZ(x) + RIVER.w / 2 + 2.6; perches.push({ kind: k, x, z, y: height(x, z) + 0.1, rot: -Math.PI / 2, stay: [60, 220], gone: [40, 150], alert: 10 }); }
perches.push({ kind: 'egret', x: POND[2] - 2, z: POND[1] + 10, y: POND_Y + 0.3, rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: 60, z: riverZ(60) + RIVER.w / 2 + 3, y: height(60, riverZ(60) + RIVER.w / 2 + 3) + 0.1, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
// sparrows on the forecourt's paving and the carriages' shafts, at the stair's foot
for (const [x, z] of [[-135, -86], [-129, -91], [-142, -83], [-131, -98], [-125, -78]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.05, rot: (x * 5) % 3, range: [1.8, 1.5] });
void SPARROW;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §18) ──
// The animals the Han tomb models show in the yards of a house (dogs, hens and roosters, geese, ducks, goats): dogs lying outside the gates of the garden's lodgings and the
// walk's houses (not in the door's own lane), hens and a rooster in the garden kitchen's lane, the swallows' mud nests under the eaves of the lodgings' halls, geese and ducks afloat
// on the Zhang River by the pier at x = -150, a crane on the Xuanwu pond's north bank (the cranes of the Han gardens), goats and hens tethered inside the market's west gate.
// No cat and no pigeon (not certain for the city of c. 215).
const critters = [];
const NOOPC = { bag: new Proxy({}, { get: () => () => {} }), col: new Proxy({}, { get: () => () => {} }) };
{
  const homes = [...LODGES.map((l) => ({ rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, room: l.room })), ...lots().filter((l) => l.walk && l.kind !== 'office' && l.rect[0] < -30 && l.rect[2] > -90).map((l) => ({ rect: l.rect, front: l.front, kind: l.kind, seed: l.seed }))];
  let k = 0;
  for (const h of homes) {
    const D = houseDoors(h), F = lotFrame(NOOPC, h.rect, h.front);
    if (k % 2 === 0 && k < 10) { const [x, z] = F.pt(Math.max(1, Math.min(F.W - 1, D.gateU !== undefined ? D.gateU - 2.4 : D.du - 2.4)), -1.6); critters.push({ model: 'dog', at: [x, 0.02, z], rot: 1.1 + k, range: [9, 3.5] }); }
    if (k < 7 && D.gateU !== undefined) {
      // the swallows' nest under the hall's eave, to one side of its door
      const nu = Math.max(1, Math.min(F.W - 1, D.du + (D.du > F.W / 2 ? -2.4 : 2.4))), [nx, nz] = F.pt(nu, D.v - 0.25);
      critters.push({ model: 'swallow_nest', at: [nx, 2.9, nz], rot: h.front === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (h.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 });
    }
    k++;
  }
}
{
  // the garden kitchen's lane: a rooster and three hens scratching
  const l = LODGES.find((q) => q.room === 'kitchen'), F = lotFrame(NOOPC, l.rect, l.front);
  for (const [model, u, v] of [['rooster', 2.2, -2.6], ['hen_brown', 3.1, -2.1], ['hen_white', 1.5, -2.0], ['hen_brown', 3.6, -3.1]]) { const [x, z] = F.pt(u, v); critters.push({ model, at: [x, 0.02, z], rot: u, range: [3.4, 1.4] }); }
}
// the market's west gate, inside: two goats and a few hens (livestock was sold in the markets [inferred])
{
  const x = MARKET[0] + MARKET_WALL.th + 4, z = (MARKET[1] + MARKET[3]) / 2 - 9.6;
  critters.push({ model: 'goat_white', at: [x, 0.02, z], rot: 0.6, range: [9, 3.2] }, { model: 'goat_black', at: [x + 1.4, 0.02, z + 0.8], rot: 3.0, range: [9, 3.2] });
  for (const [model, dx, dz] of [['hen_brown', 3.0, 0.2], ['hen_white', 3.9, -0.5], ['rooster', 3.4, -1.0]]) critters.push({ model, at: [x + dx, 0.02, z + dz], rot: dx, range: [3.4, 1.4] });
}
// geese and ducks afloat on the river by the pier, a crane on the pond's north bank
critters.push({ type: 'floaters', models: ['goose_white', 'goose_grey', 'goose_white', 'goose_white'], raft: true, area: [-175, -262, -135, -238], dist: riverDist, a: [12, 7], ratio: 0.3, margin: 2.5, y: RIVER.y, speed: 0.2, cycle: [18, 26] });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown'], raft: true, area: [-130, -262, -95, -238], dist: riverDist, a: [10, 6], ratio: 0.4, margin: 2.5, y: RIVER.y, speed: 0.25, cycle: [18, 26] });
critters.push({ model: 'crane', at: [-108, 0.02, POND[1] - 2.4], rot: Math.PI / 2, range: [7.0, 1.6], tau: 50, speed: 0.4 });
export default { fish, flights, perches, critters };
