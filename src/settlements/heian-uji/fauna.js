// Heian Uji — the animals (src/engine/fauna.js; docs/settlements/heian-uji.md §13): carp and a few red carp in the Aji pond,
// dark carp in the Uji River, swallows over the pond and the river, crows over the village at dusk, sparrows on the
// gravel of the courts and the lanes, a grey heron on the pond's shore and a little egret on the river's bank.
import { walkSet, keeperLot, frontPoint } from './openwalk.js';
import { MARKET, lots, POND, POND_LEVEL, RIVER, GARDEN, VILLA, height, pondDistance, inRiver } from './layout.js';

const riverX = (z) => RIVER.x + 15 * Math.sin(z / 110);
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 5, size: [0.3, 0.45], palette: 'carp', y: POND_LEVEL, area: [GARDEN[0] + 10, GARDEN[1] + 12, GARDEN[2] - 10, GARDEN[3] - 12], dist: pondDistance, margin: 1.7, a: [14, 8], ratio: 0.55, speed: 0.32, rise: 0.4, tries: 1 });
for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.5, 0.7], palette: 'redcarp', y: POND_LEVEL, area: [GARDEN[0] + 10, GARDEN[1] + 12, GARDEN[2] - 10, GARDEN[3] - 12], dist: pondDistance, margin: 1.9, a: [18, 8], ratio: 0.45, speed: 0.38, rise: 0.5 });
for (let i = 0; i < 4; i++) { const z = -120 + i * 70; fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: RIVER.level, area: [riverX(z) - 8, z - 20, riverX(z) + 8, z + 20], dist: (x, zz) => (inRiver(x, zz) ? -3 : 3), margin: 1.2, a: [10, 18], ratio: 0.3, speed: 0.35, rise: 0.1 }); }
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [6, -5], a: [28, 50], rot: 0, dist: pondDistance, margin: 1.5 }, y: [0.7, 1.8], speed: 7 },
  { kind: 'swallow', n: 4, lane: { a: [riverX(-150), -170], b: [riverX(150), 170] }, y: [0.5, 4], speed: 9, half: 20 },
  { kind: 'crow', n: 6, loop: { c: [-120, 40], a: [40, 30], rot: 0.4 }, y: [30, 12], speed: 9 },
];
const perches = [];
for (const [x, z] of [[-175, 38], [-150, 30], [-158, -8], [-40, 74], [50, -20], [-60, 90], [-110, 60], [-90, 140]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + (z === -8 ? 1.0 : 0), rot: x * 0.07, range: [1.4, 1.3] });
// the market's sparrows pecking at the spilt grain, and a few at the lanes' fronts (positions from the layout)
for (let i = 0; i < 6; i++) { const x = MARKET[0] + 4 + (i * 7.3) % (MARKET[2] - MARKET[0] - 8), z = MARKET[1] + 4 + (i * 11.1) % (MARKET[3] - MARKET[1] - 8); perches.push({ kind: 'sparrow', x, z, y: 0.04, rot: i, range: [1.6, 1.4] }); }
lots().forEach((l, i) => { if (i % 14) return; const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, f = l.front; perches.push({ kind: 'sparrow', x: f === 'e' ? x1 + 1.8 : f === 'w' ? x0 - 1.8 : cx, z: f === 's' ? z1 + 1.8 : f === 'n' ? z0 - 1.8 : cz, y: 0.04, rot: i, range: [1.2, 1.2] }); });
void VILLA;
// the heron at the pond's north shore, the egret on its south arm's shore: a dry spot at the water's edge, clear of the island bridges, facing the water
function shore(hint) {
  let best = null, bd = 1e9;
  for (let x = GARDEN[0]; x < GARDEN[2]; x += 0.5) for (let z = GARDEN[1] - 6; z < GARDEN[3] + 6; z += 0.5) {
    const d = pondDistance(x, z), h = height(x, z);
    if (d < 0.6 || d > 1.6 || h < POND_LEVEL + 0.02 || Math.abs(x + 55) < 4) continue;
    const e = Math.hypot(x - hint[0], z - hint[1]);
    if (e < bd) { bd = e; best = [x, z, h]; }
  }
  if (!best) return null;
  const [x, z, h] = best, gx = pondDistance(x + 0.3, z) - pondDistance(x - 0.3, z), gz = pondDistance(x, z + 0.3) - pondDistance(x, z - 0.3);
  return { x, z, y: h, rot: Math.atan2(-gz, -gx) };
}
for (const [hint, kind] of [[[-75, -62], 'heron'], [[-30, 64], 'egret']]) { const q = shore(hint); if (q) perches.push({ kind, ...q, stay: [80, 240], gone: [40, 150], alert: 10 }); }
void POND;

// ── the critters: animals with a rig of their own (src/engine/fauna-critters.js; dossier §19.4) ──
const critters = [];
// a pair of mandarin ducks on the pond in front of the hall, a little off the pier's way: the hen leads
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [-6, -22, 24, -6], dist: pondDistance, a: [8, 4], ratio: 0.5, margin: 1.4, y: POND_LEVEL, speed: 0.22, cycle: [18, 24] });
// a crane on the island of the pond, walking along it and stopping
critters.push({ model: 'crane', at: [-52, 0.3, -53], rot: 1.2, range: [2.2, 1.0], tau: 50, speed: 0.4 });
// the fishers' craft moored by the west bank of the river, cormorants resting on its rails (that cormorant fishing was done at Uji in 1053 is not attested: they rest), and two on the trap platform of the upper weir
{
  const z = -58, bx = riverX(z) - 26.5, by = RIVER.level, bz = z;
  critters.push({ model: 'fishing_craft', at: [bx, by, bz], rot: 0 });
  [[-1.0, -1], [0.1, 1], [1.05, -1]].forEach(([u, sd], i) => critters.push({ model: 'cormorant', at: [bx + u, by + 0.296, bz + sd * 0.29], rot: sd * (Math.PI / 2) + (i - 1) * 0.25, cycle: 46 + 7 * i }));
  const zc = -128, tip = [riverX(zc) - 12, zc - 9];
  [[-0.9, -1.8, 0.4], [0.9, -1.9, -0.5]].forEach(([dx, dz, r], i) => critters.push({ model: 'cormorant', at: [tip[0] + dx, RIVER.level + 1.05, tip[1] + dz], rot: r + Math.PI, cycle: 52 + 9 * i }));
}
// a dog and hens at the fronts of walked houses beyond the arrival's reach (positions by the lots' own seeds)
{
  const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }, ALONG = { n: [1, 0], s: [1, 0], e: [0, 1], w: [0, 1] };
  const far = [...walkSet().keys()].filter(keeperLot).sort((a, b) => a.seed - b.seed);
  far.slice(0, 6).forEach((l, i) => {
    const p = frontPoint(l), o = OUT[l.front], a = ALONG[l.front], len = l.rect[2] - l.rect[0] > l.rect[3] - l.rect[1] && (l.front === 'n' || l.front === 's') ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1];
    const at = (u, d) => [p[0] + o[0] * d + a[0] * u, p[1] + o[1] * d + a[1] * u];
    if (i % 2 === 0) { const q = at(len * 0.38 + 1.2, 2.4); critters.push({ model: 'dog', at: [q[0], height(q[0], q[1]) + 0.02, q[1]], rot: Math.atan2(o[0], o[1]), range: [3, 1.5] }); }
    else for (const [m, u, d, sz] of [['rooster', len * 0.35, 2.2, 1], ['hen_brown', len * 0.35 + 0.9, 2.6, 1], ['hen_white', len * 0.35 - 0.8, 2.5, 0.96]]) { const q = at(u, d); critters.push({ model: m, at: [q[0], height(q[0], q[1]) + 0.02, q[1]], rot: i + u, range: [2.4, 1.2], size: sz }); }
  });
}
export default { fish, flights, perches, critters };
