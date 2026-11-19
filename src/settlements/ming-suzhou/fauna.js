// Ming Suzhou — the animals (src/engine/fauna.js draws them; docs/settlements/ming-suzhou.md §11):
// goldfish and red carp in the garden pond, dark carp in the canals, house swallows over the
// canals and the pond, tree sparrows on the paving and the garden walls, crows at twilight over
// the temple, a little egret on the canal's edge and a grey heron at the pond's shore.
import { LEVEL, GARDEN, GARDEN_BRIDGES, FOOTPRINTS, CANALS, LOQUAT_COURT, lots, pondDistance, canalDistance, nearGallery, nearRockPath } from './layout.js';
import { ground } from './ground.js';

const pondArea = [GARDEN[0] + 6, GARDEN[1] + 10, GARDEN[2] - 6, GARDEN[3] - 40];

const fish = [];
// goldfish (jinyu) in loose schools, a few red carp (hongli) among larger loops
for (let i = 0; i < 6; i++) fish.push({ n: 5, size: [0.26, 0.4], palette: 'goldfish', y: LEVEL.pond, area: pondArea, dist: pondDistance, margin: 1.7, a: [14, 7], ratio: 0.55, speed: 0.32, rise: 0.4, tries: 1 });
for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.5, 0.68], palette: 'redcarp', y: LEVEL.pond, area: pondArea, dist: pondDistance, margin: 1.9, a: [18, 8], ratio: 0.45, speed: 0.4, rise: 0.5 });
// goldfish gathered at the garden's bridges (people feed the fish from them): a small tight school beside each, circling within a few metres
for (const { pts } of GARDEN_BRIDGES) {
  const mx = pts.reduce((a, q) => a + q[0], 0) / pts.length, mz = pts.reduce((a, q) => a + q[1], 0) / pts.length;
  fish.push({ n: 6, size: [0.24, 0.36], palette: 'goldfish', y: LEVEL.pond, area: [mx - 6, mz - 6, mx + 6, mz + 6], dist: pondDistance, margin: 0.9, a: [4.5, 2.6], ratio: 0.55, speed: 0.22, rise: 0.7, minA: 1.4, tries: 1 });
}
// dark carp lazing in the canals, along their length
for (const [x0, z0, x1, z1] of CANALS) {
  const alongX = x1 - x0 > z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < 3; i++) fish.push({
    n: 2, size: [0.55, 0.8], palette: 'carp', y: LEVEL.canal, dist: canalDistance, margin: 1.2, k: 1, rot: alongX ? 0 : Math.PI / 2,
    area: alongX ? [x0 + 20, cz - 0.5, x1 - 20, cz + 0.5] : [cx - 0.5, z0 + 20, cx + 0.5, z1 - 20], a: [16, 2.4], ratio: 0.15, minA: 1.5, speed: 0.3, rise: 0,
  });
}

const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, 72], b: [200, 72] }, y: [-0.1, 2.6], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [99.5, -190], b: [99.5, 60] }, y: [-0.1, 2.6], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-100.5, -190], b: [-100.5, 60] }, y: [-0.1, 2.6], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [0, -42], a: [26, 9], rot: 0, dist: pondDistance, margin: 1.5 }, y: [0.7, 1.6], speed: 7 },
  { kind: 'crow', n: 7, loop: { c: [-40, -135], a: [32, 26], rot: 0.5 }, y: [32, 12], speed: 9 },
];
// (a swallow's lane loops are set in the engine from the canal's own axis; their lateral half-width is the loop's az)
flights[0].a = flights[1].a = flights[2].a = [26, 3];

const perches = [];
// tree sparrows on the paving of the streets (hopping about a spot)
for (const [x, z] of [[-120, 64.6], [-80, 65.2], [-45, 64.4], [-12, 65.4], [22, 64.6], [48, 65.4], [85, 64.8], [125, 65.2], [92.8, -20], [93.2, 10], [92.6, -75], [-94, -50], [-94.4, -5], [-93.6, 30], [-30, -93], [30, -92.8]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: Math.atan2(0.3, 1) + (x * 7 % 3), range: [1.4, 1.3] });
// ...and on the copings of the garden's walls (4.4 m above the garden's level), hopping along them
const top = LEVEL.garden + 4.4 + 0.62;     // the tiled coping rises 0.6 m above the wall's h
for (const [x, z, rot] of [[-40, GARDEN[1], 0], [10, GARDEN[1], 0], [52, GARDEN[1], 0], [GARDEN[2], -55, Math.PI / 2], [GARDEN[2], -20, Math.PI / 2], [GARDEN[0], -60, Math.PI / 2], [GARDEN[0], -15, Math.PI / 2]])
  perches.push({ kind: 'sparrow', x, z, y: top, rot, range: [2.6, 0], alert: 5 });

// the shore of the pond: a place on the garden's level, at the water's edge, clear of buildings, galleries and paths
function shore(hint) {
  let best = null, bd = 1e9;
  for (let x = GARDEN[0] + 3; x < GARDEN[2] - 3; x += 0.5) for (let z = GARDEN[1] + 3; z < GARDEN[3] - 3; z += 0.5) {
    const d = pondDistance(x, z), h = ground.height(x, z);
    if (d < 0.5 || d > 1.1 || Math.abs(h - LEVEL.garden) > 0.3) continue;
    if (FOOTPRINTS.some((r) => x > r[0] - 2.5 && x < r[2] + 2.5 && z > r[1] - 2.5 && z < r[3] + 2.5) || nearGallery(x, z, 3) || nearRockPath(x, z, 2.5)) continue;
    const e = Math.hypot(x - hint[0], z - hint[1]);
    if (e < bd) { bd = e; best = [x, z, h]; }
  }
  if (!best) return null;
  // face the water: toward falling pondDistance
  const [x, z, h] = best, gx = pondDistance(x + 0.3, z) - pondDistance(x - 0.3, z), gz = pondDistance(x, z + 0.3) - pondDistance(x, z - 0.3);
  return { x, z, y: h, rot: Math.atan2(-gz, -gx) };
}
for (const [hint, kind] of [[[-49, -50], 'heron'], [[28, -36], 'egret']]) {
  const s = shore(hint);
  if (s) perches.push({ kind, ...s, stay: [80, 240], gone: [40, 150], alert: 10 });
}
// a little egret on the stone edge of the south canal (the street's side), facing the water
perches.push({ kind: 'egret', x: -38, z: 67.5, y: 0.02, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });

// magpies (xique, the bird of glad tidings) on the ridges and walls of the quarter, and sparrows along the Hall's ridge
for (const [x, z, y, rot] of [[-36, -14.75, 9.6, 0], [32.5, GARDEN[1], top + 0.0, 0], [GARDEN[2], -38, top, Math.PI / 2]]) perches.push({ kind: 'pica', x, z, y, rot, range: [2.2, 0], alert: 6.5 });
for (const x of [-3.2, 3.4]) perches.push({ kind: 'sparrow', x, z: -14.75, y: 9.6, rot: 0, range: [2.4, 0], alert: 5 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §22) ──
const critters = [];
const G = LEVEL.garden, hash = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
// a mandarin drake and his hen on the pond before the Hall, a few metres from the bridge the visitor comes by: they go as a pair, the hen leading
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [-14, -46, 14, -30], dist: pondDistance, a: [7, 3.2], ratio: 0.5, margin: 1.2, y: LEVEL.pond, speed: 0.22, cycle: [18, 24] });
// the scholar's crane on the Hall's terrace (the terrace is the garden's one open, level paving before the Hall), walking along it and stopping
critters.push({ model: 'crane', at: [0.5, 0.9, -23.2], rot: Math.PI, range: [7.0, 1.6], tau: 50, speed: 0.4 });
// the house swallows' nests under the Hall's north eave, facing the pond: from them the birds sweep down over the water and back
for (const [x, side] of [[-1.9, 1], [2.7, -1]]) critters.push({ model: 'swallow_nest', at: [x, 5.25, -19.7], rot: -Math.PI / 2, cycle: 34 + 3 * side, flight: 9, radius: 12, side, rise: -4.2 });
// the kingfisher (feicui) on the pond's edge near the bridge, the little egret's neighbour
{
  const s = shore([-4, -40]);
  if (s) critters.push({ model: 'kingfisher', at: [s.x, s.y + 0.05, s.z], rot: s.rot, water: [s.x + Math.cos(s.rot) * 1.7, s.z + Math.sin(s.rot) * 1.7, LEVEL.pond], cycle: 34 });
}
// a cat asleep on the coping of the loquat court's low north wall, a dog on the gate hall's platform, hens in the side yard by the service door
critters.push({ model: 'cat_tabby', at: [LOQUAT_COURT[0] + 15.5, G + 3.2 + 0.62, LOQUAT_COURT[1]], rot: 0.15, range: [7, 2.5] });
critters.push({ model: 'dog', at: [-4.6, G + 0.45, 60.9], rot: Math.PI / 2, range: [9, 3.5] });
for (const [model, x, z, size] of [['rooster', -31.2, 54.4, 1], ['hen_brown', -29.0, 54.0, 1], ['hen_brown', -30.4, 55.4, 0.96], ['hen_white', -32.4, 53.6, 1]]) critters.push({ model, at: [x, G + 0.02, z], rot: 0, range: [3.4, 1.4], size });
// the cage hung from the tea house's front, off its door lantern's line
{
  const open = lots().filter((l) => !l.water && (l.front === 's' || l.front === 'n') && l.kind === 'row' && ((l.front === 's' || l.front === 'n') ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0]) < 7.4 && l.rect[2] - l.rect[0] > 4.2)
    .sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2, (a.rect[1] + a.rect[3]) / 2 - 60) - Math.hypot((b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2 - 60));
  const tea = open.filter((l) => l.shop0 ?? l.shop)[2];
  if (tea) { const [x0, , x1, z1] = tea.rect; critters.push({ model: 'cagebird', at: [x0 + (x1 - x0) * 0.32, ground.height(x0, z1) + 3.2, z1 + 0.4], rot: Math.PI / 2 }); }
}
// a fishing punt tied at the south bank of the south canal with cormorants on its rails, and a raft of farm ducks on the water beyond
{
  const bx = 30, bz = 74.8, by = LEVEL.canal;
  critters.push({ model: 'fishing_craft', at: [bx, by, bz], rot: 0 });
  [[-1.0, -1], [0.1, 1], [1.05, -1]].forEach(([u, sd], i) => critters.push({ model: 'cormorant', at: [bx + u, by + 0.296, bz + sd * 0.29], rot: sd * (Math.PI / 2) + (i - 1) * 0.25, cycle: 46 + 7 * i }));
  critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_white', 'duck_brown', 'duck_brown', 'duck_white'], raft: true, area: [-135, 73.6, -112, 75.2], dist: canalDistance, a: [10, 0.9], ratio: 0.12, margin: 0.75, y: LEVEL.canal, speed: 0.18, cycle: [26, 34] });
}

export default { fish, flights, perches, critters };
