// Bhaktapur — the animals (src/engine/fauna.js draws them; docs/settlements/bhaktapur.md §7): swallows over the squares and the lanes, crows over the
// roofs at twilight, sparrows on the paving, the plinth and the eaves of the market's houses. No fish (no open water in the town).
import { SQ, POT, NYA, BHA, KEEP, STALLS, HOUSE, lots, fp, inRect, inLot } from './layout.js';
import taumadhi from './plan.js';

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [5, -5], a: [40, 24], rot: 0.1 }, y: [4, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-78, 70], a: [34, 20], rot: 0.5 }, y: [3, 10], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [0, 0], a: [120, 90], rot: 0.3 }, y: [28, 55], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-26, -20], [-26, 12], [0, 2], [20, -20], [40, -10], [-5, 20], [12, 14], [30, 21], [-5, -30], [18, 3], [-60, 60], [-90, 75], [-70, 88]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// on the Nyatapola's plinth: the west treads of the second, third and fourth stages (tops at 2, 3 and 4 m)
for (const [k, u] of [[1, 6.85], [2, 5.95], [3, 5.05]]) perches.push({ kind: 'sparrow', x: NYA.c[0] - u, z: NYA.c[1], y: (k + 1) * 1.0 + 0.05, rot: 0, range: [0.3, 3], alert: 5 });
// sparrows on the steps and the pidha of the houses nearest the square, and on the Bhairabnath's plinth treads (tops at 0.9, 1.8, 2.7)
{
  let k = 0;
  for (const l of lots()) {
    if (l.use || Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) > 80 || k > 22 || (l.seed % 3) !== 0) continue;
    const W = l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], p = fp(l, l.dx ?? W / 2, -0.7);
    perches.push({ kind: 'sparrow', x: p[0], z: p[1], y: l.pid ? 0.5 : 0.07, rot: (l.seed % 7) * 0.9, range: [1.6, 1.4] }); k++;
  }
  for (const [j, u] of [[1, 5.0], [2, 4.2]]) perches.push({ kind: 'sparrow', x: BHA.c[0] - u - 1.5, z: BHA.c[1] + 2.6, y: j * 0.9 + 0.05, rot: 0, range: [0.3, 2.5], alert: 5 });
}
void SQ; void POT;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §17): one mesh, one draw ──
// Pigeons on the brick of Taumadhi (they replace the eight flocks the street life had), cats on the pidhas, dogs asleep before the shops, hens before a
// dwelling, goats tethered at the lanes' edge, all by the lots' own seeds (no counters, no Math.random).
const AR = [19, 21];
const hash = (x, z, s = 0) => { const k = Math.sin(x * 12.9898 + z * 78.233 + s * 4.1) * 43758.5453; return k - Math.floor(k); };
const nearRoute = (x, z) => taumadhi.walks.some((w) => w.some((a, i) => { if (!i) return false; const b = w[i - 1], dx = a[0] - b[0], dz = a[1] - b[1], t = Math.max(0, Math.min(1, ((x - b[0]) * dx + (z - b[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - b[0] - dx * t, z - b[1] - dz * t) < 1.5; }));
const dArr = (p) => Math.hypot(p[0] - AR[0], p[1] - AR[1]);
const wOf = (l) => (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]);
const rot = (f) => ({ s: Math.PI, n: 0, e: -Math.PI / 2, w: Math.PI / 2 }[f]);      // the figure rotation facing outward from a front (rot 0 faces −z)
const nearest = (list, from = AR) => list.map((l) => ({ l, d: Math.hypot((l.rect[0] + l.rect[2]) / 2 - from[0], (l.rect[1] + l.rect[3]) / 2 - from[1]) })).sort((a, b) => a.d - b.d);
const L = lots();
/** The lots whose animals are critters (town.js leaves out the life elements it would have set there). */
export const CRITTER_CAT = new Set(), CRITTER_DOG = new Set();
const critters = [];
// pigeons: flocks of four on the brick about the temples and the dabali [stated: the square's pigeons]
{
  const PG = ['pigeon_grey', 'pigeon_white', 'pigeon_dark', 'pigeon_grey'];
  for (const [x, z] of [[-16, -2], [2, -3], [26, 2], [-24, 14], [33, 19], [12, 18], [-6, 17], [36, -12]]) {
    if (Math.hypot(x - AR[0], z - AR[1]) < 7 || KEEP.some((k) => inRect(k, x, z, 0.3)) || STALLS.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 2) || nearRoute(x, z)) continue;
    for (let k = 0; k < 4; k++) {
      const a = hash(x, z, k) * 6.28, d = 0.4 + 1.4 * hash(z, x, k + 3), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
      if (KEEP.some((q) => inRect(q, px, pz, 2.2)) || nearRoute(px, pz) || inLot(px, pz, 1.8) || STALLS.some(([sx, sz]) => Math.hypot(px - sx, pz - sz) < 1.8)) continue;   // (they roam 1.4 m)
      critters.push({ model: PG[k], at: [px, 0.05, pz], rot: hash(px, pz) * 6.28, range: [1.4, 1.1], tau: 12 + 6 * hash(pz, px, 2), speed: 0.45, stride: 0.18 });
    }
  }
}
// cats on the larger seat of a pidha, the nearest three houses with one
for (const { l, d } of nearest(L.filter((q) => !q.use && !q.open && q.pid && !q.shop))) {
  if (CRITTER_CAT.size >= 3) break;
  if (d < 9 || d > 75) continue;
  const W = wOf(l), dx = l.dx ?? W / 2, seat = dx - 0.2 - 0.1 > 0.9 ? [0.1, dx - 0.2] : W - 0.1 - dx - 1.5 > 0.9 ? [dx + 1.5, W - 0.1] : null;
  if (!seat) continue;
  const p = fp(l, seat[0] < dx ? seat[0] + 0.5 : seat[1] - 0.5, -0.4);
  if (nearRoute(p[0], p[1])) continue;
  CRITTER_CAT.add(l);
  critters.push({ model: hash(p[0], p[1]) < 0.5 ? 'cat_tabby' : 'cat_orange', at: [p[0], 0.46, p[1]], rot: rot(l.front) + (hash(p[1], p[0]) - 0.5) * 0.8, range: [7, 2.5] });
}
// dogs asleep before the open shops (the village dogs of Bhaktapur's lanes), the nearest three
for (const { l, d } of nearest(L.filter((q) => q.open && !q.home && !q.use && wOf(q) >= 6.4))) {
  if (CRITTER_DOG.size >= 3) break;
  if (d < 10 || d > 70) continue;
  const p = fp(l, 1.0 + 1.5 * hash(l.rect[0], l.rect[1]), -1.3);
  if (nearRoute(p[0], p[1]) || STALLS.some(([sx, sz]) => Math.hypot(p[0] - sx, p[1] - sz) < 2)) continue;
  CRITTER_DOG.add(l);
  critters.push({ model: 'dog', at: [p[0], 0.05, p[1]], rot: rot(l.front) + (hash(p[1], p[0]) - 0.5) * 1.6, range: [9, 3.5] });
}
// hens (and a cock) before a dwelling's door, and two goats at the lanes' edge
{
  const homes = nearest(L.filter((q) => q.home && !q.use && wOf(q) >= 7)).filter(({ d }) => d > 40 && d < 85);
  const h = homes[1] || homes[0];
  if (h) {
    const l = h.l, W = wOf(l);
    [['rooster', 1.3], ['hen_brown', 2.2], ['hen_white', 3.0], ['hen_brown', 3.7]].forEach(([model, lx], i) => {
      const p = fp(l, Math.min(W - 1, lx + 1.6), -1.6 - (i % 2) * 0.5);
      if (!nearRoute(p[0], p[1])) critters.push({ model, at: [p[0], 0.05, p[1]], rot: rot(l.front) + i, range: [3.2, 1.3], size: i === 2 ? 0.96 : 1 });
    });
  }
  const shops = nearest(L.filter((q) => q.open && !q.home && !q.use && wOf(q) >= 6.4 && !CRITTER_DOG.has(q))).filter(({ d }) => d > 14 && d < 70);
  [shops[1], shops[3]].forEach((s, i) => {
    if (!s) return;
    const p = fp(s.l, wOf(s.l) - 0.8, -1.7);
    if (!nearRoute(p[0], p[1])) critters.push({ model: i ? 'goat_white' : 'goat_black', at: [p[0], 0.05, p[1]], rot: rot(s.l.front) + 0.6 - i, range: [9, 3.2] });
  });
}
void HOUSE;
export default { fish: [], flights, perches, critters };
