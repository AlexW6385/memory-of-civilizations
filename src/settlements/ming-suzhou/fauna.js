// Ming Suzhou — the animals (src/engine/fauna.js draws them; docs/settlements/ming-suzhou.md §11):
// goldfish and red carp in the garden pond, dark carp in the canals, house swallows over the
// canals and the pond, tree sparrows on the paving and the garden walls, crows at twilight over
// the temple, a little egret on the canal's edge and a grey heron at the pond's shore.
import { LEVEL, GARDEN, FOOTPRINTS, CANALS, pondDistance, canalDistance, nearGallery, nearRockPath } from './layout.js';
import { ground } from './ground.js';

const pondArea = [GARDEN[0] + 6, GARDEN[1] + 10, GARDEN[2] - 6, GARDEN[3] - 40];

const fish = [];
// goldfish (jinyu) in loose schools, a few red carp (hongli) among larger loops
for (let i = 0; i < 6; i++) fish.push({ n: 5, size: [0.26, 0.4], palette: 'goldfish', y: LEVEL.pond, area: pondArea, dist: pondDistance, margin: 1.7, a: [14, 7], ratio: 0.55, speed: 0.32, rise: 0.4, tries: 1 });
for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.5, 0.68], palette: 'redcarp', y: LEVEL.pond, area: pondArea, dist: pondDistance, margin: 1.9, a: [18, 8], ratio: 0.45, speed: 0.4, rise: 0.5 });
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

export default { fish, flights, perches };
