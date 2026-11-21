// Qufu — the animals (src/engine/fauna.js; docs/settlements/lu-qufu.md §8): the crows and magpies of the temple's old cypresses over the roofs, swallows over
// the Bishui pool and Queli Street, sparrows on the paving of the courts and the lanes, a heron at the pool's edge, carp in the pool.
import { POOL, POOL_Y, ALTAR, MX, DRUM, shopRuns, lots } from './layout.js';
import { lotFrame } from '../../styles/lu/kit.js';

const poolDist = (x, z) => Math.min(x - POOL[0], POOL[2] - x, z - POOL[1], POOL[3] - z) - 1.5;
const fish = [];
for (let i = 0; i < 3; i++) fish.push({ n: 4, size: [0.3, 0.7], palette: i ? 'redcarp' : 'carp', y: POOL_Y, area: [POOL[0] + 3, POOL[1] + 3, POOL[2] - 3, POOL[3] - 3], dist: poolDist, margin: 1.5, a: [12, 10], ratio: 0.5, speed: 0.35, rise: 0.3 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 98], a: [34, 22], rot: 0 }, y: [1.5, 8], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [0, 150], b: [0, 255] }, y: [2, 11], speed: 9, half: 12 },
  { kind: 'crow', n: 7, loop: { c: [0, -130], a: [80, 60], rot: 0 }, y: [40, 24], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [0, 60], a: [80, 50], rot: 0.3 }, y: [30, 18], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [DRUM.x, DRUM.z], a: [30, 24], rot: 0 }, y: [2, 12], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [0, -190], a: [60, 40], rot: 0.2 }, y: [30, 18], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [MX, -40], a: [60, 70], rot: 0.5 }, y: [26, 16], speed: 8 },
];
const perches = [];
for (const [x, z] of [[8, -60], [-8, -92], [12, 40], [-14, 70], [4, 110], [-30, 20], [20, -20], [0, 150], [-12, 200], [12, 225], [ALTAR.c[0] + 9, ALTAR.c[1] + 8], [-60, -30], [50, 90], [MX, 90], [MX - 20, 0], [-130, 60], [-130, -100], [-60, 200], [DRUM.x + 3, DRUM.z - 8], [8, 180], [-8, 240], [30, -50], [-30, -50], [MX + 10, 60], [MX - 10, -120], [-100, 20], [100, -30], [0, -200], [-100, 160]])
  perches.push({ kind: 'sparrow', x, z, y: 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'heron', x: POOL[2] + 1.5, z: POOL[1] + 8, y: 0.1, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §17) ──
// The animals of a Qing county town and a temple: dogs asleep before the shops' doorways, cats by the counters, the swallows' mud nests under the shop eaves, a songbird's cage
// hung at a shop's post, hens and a rooster at the gates of the poorer houses in the lanes, pigeons on the paving of the temple's first court, black goats beside the threshing
// yards. [inferred: general to a north China town; no Qufu source]. No donkey here (the donkeys of the yards, the hitching posts and the carts are the street life's), no ducks on
// the Bishui pool (the ritual pool keeps its carp).
const critters = [];
const NOOPC = { bag: new Proxy({}, { get: () => () => {} }), col: new Proxy({}, { get: () => () => {} }) };
{
  let k = 0;
  for (const row of shopRuns()) {
    if (row.rect[1] < 168) continue;                                                // Queli Street's shops, not the square's
    const F = lotFrame(NOOPC, row.rect, row.front), sw = F.W / row.n, ang = Math.atan2(-F.V[1], -F.V[0]);
    for (let i = 0; i < row.n; i++, k++) {
      const gap = i * sw + sw * (i % 2 ? 0.34 : 0.66), away = i % 2 ? 1 : -1, u0 = i * sw;
      if (k % 5 === 0) { const [x, z] = F.pt(gap + away * 1.9, -0.9); critters.push({ model: 'dog', at: [x, 0.02, z], rot: ang + 1.1 * away, range: [9, 3.5] }); }
      if (k % 7 === 3) { const [x, z] = F.pt(gap + away * 1.5, 0.45); critters.push({ model: k % 2 ? 'cat_tabby' : 'cat_orange', at: [x, 1.06, z], rot: ang, range: [8, 3] }); }
      if (k % 3 === 1) { const [x, z] = F.pt(u0 + 0.32, -0.2); critters.push({ model: 'swallow_nest', at: [x, 3.25, z], rot: ang, cycle: 33 + (k % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); }
      if (k % 11 === 6) { const [x, z] = F.pt((i + 1) * sw - 0.25, -0.2); critters.push({ model: 'cagebird', at: [x, 2.4, z], rot: ang }); }
    }
  }
  // hens and a rooster in the lane before the gates of the poorer houses near the temple (rank 0 and 1: the style's own rule, styles/lu/house.js)
  const rg = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
  let n = 0;
  for (const l of lots()) {
    if (l.lod !== 0 || n >= 6) continue;
    const luck = rg((l.seed || 1) * 7919 + 13)(), score = (l.wealth ?? 0) + (luck - 0.5) * 0.26, tier = score > 0.55 ? 2 : score > 0.3 ? 1 : 0;
    if (tier === 2 || Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 20) > 200) continue;
    const [x0, , x1, z1] = l.rect, first = rg(l.seed || 1)(), gx = x0 + 3.6 + first * Math.max(0, x1 - x0 - 7.2), x = gx + 3.4, z = z1 + 1.6;
    for (const [model, dx, dz] of [['rooster', 0, 0], ['hen_brown', 0.9, -0.6], ['hen_white', -0.8, 0.5], ['hen_brown', 1.5, 0.7]]) critters.push({ model, at: [x + dx, 0.02, z + dz], rot: x + dx, range: [3.4, 1.4] });
    n++;
  }
  // pigeons on the paving of the first court, fed by the pilgrims
  for (const [model, x, z] of [['pigeon_grey', 12.5, 66], ['pigeon_white', 13.5, 67], ['pigeon_grey', 12, 68.2], ['pigeon_dark', 14.4, 66.4], ['pigeon_grey', -13, 40], ['pigeon_white', -14, 41.2]]) critters.push({ model, at: [x, 0.04, z], rot: x, range: [3.4, 1.4] });
  // black goats by two of the threshing yards
  for (const yx of [-84, 24]) critters.push({ model: 'goat_black', at: [yx + 6.2, 0.02, 269.5], rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: [yx + 7.4, 0.02, 270.4], rot: 3.0, range: [9, 3.2] });
}
export default { fish, flights, perches, critters };
