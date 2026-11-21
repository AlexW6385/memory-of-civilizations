// Lhasa — the animals (src/engine/fauna.js draws them; docs/settlements/lhasa.md §14): choughs and ravens
// (drawn as crows) over the palace's walls and roofs, swifts (swallows) in the valley's light, sparrows
// (and the town's pigeons) on the paving of Shöl's street and the pilgrims' circuit.
import { SHOL, STREET, POND, lots, shops, inLot } from './layout.js';
import { ground } from './ground.js';
import { dressing } from './dress.js';
import potala from './plan.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 5, loop: { c: [-20, -40], a: [150, 40], rot: 0 }, y: [30, 130], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [120, -60], a: [50, 30], rot: 0.4 }, y: [60, 120], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [0, 120], a: [90, 60], rot: 0 }, y: [8, 40], speed: 11 },
  { kind: 'swallow', n: 4, loop: { c: [POND.c[0], POND.c[1]], a: [70, 30], rot: 0 }, y: [4, 20], speed: 10 },
];
const perches = [];
for (const [x, z] of [[-2, 80], [-1, 100], [0, 120], [-2, 150], [1, 175], [-6, 136], [5, 138], [-1, 200], [-30, 142], [30, 142], [-60, 141], [60, 141], [-95, 142.5], [95, 141.5], [-140, 142], [140, 142], [-180, 142], [180, 142], [-4, 58], [-12, 56], [-1, 236], [-150, 222], [100, 222], [-213, 100], [213, 100]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
void SHOL; void STREET;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §19): one mesh, one draw ──
// The mastiffs chained at the gates of the wide lane (and one at the south gate), the dogs asleep and the goats tethered in the lanes (dress.js), the rock pigeons
// on the open ground below the palace and the street, a cat on the doorstep of two trading houses; all near the lane's crossing and the arrival, by the lots' own
// seeds (no counters, no Math.random). The dogs and goats lie down far from the visitor and stand when he comes.
const hash = (x, z, s = 0) => { const k = Math.sin(x * 12.9898 + z * 78.233 + s * 4.1) * 43758.5453; return k - Math.floor(k); };
const nearRoute = (x, z, d = 2.4) => potala.walks.some((w) => w.some((a, i) => { if (!i) return false; const b = w[i - 1], dx = a[0] - b[0], dz = a[1] - b[1], t = Math.max(0, Math.min(1, ((x - b[0]) * dx + (z - b[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(b[0] + t * dx - x, b[1] + t * dz - z) < d; }));
const critters = [];
// the mastiffs: chained beside the wall of a house of the row north of the wide lane, at its south-east corner (the gate leaves the middle clear), four of the nearest
{
  let k = 0;
  const row = lots().filter((l) => !l.farm && l.rect[1] > 120 && l.rect[1] < 126 && l.seed % 3 === 0).sort((a, b) => Math.abs((a.rect[0] + a.rect[2]) / 2) - Math.abs((b.rect[0] + b.rect[2]) / 2));
  for (const l of row) {
    if (k >= 4) break;
    const p = [l.rect[2] - 1.0, l.rect[3] + 1.5];
    if (nearRoute(p[0], p[1], 3) || Math.abs(p[0]) < 14) continue;
    critters.push({ model: 'mastiff', at: [p[0], 0.05, p[1]], rot: Math.PI + (hash(p[0], p[1]) - 0.5) * 1.2, range: [11, 4.5], size: 1.3 }); k++;
  }
  critters.push({ model: 'mastiff', at: [6, 0.05, 207.4], rot: Math.PI * 0.5, range: [11, 4.5], size: 1.3 });                      // at the south gate's east pier
}
// the lanes' dogs and goats (dress.js): village dogs of a tan coat, hill goats
for (const e of dressing().crit) {
  if (nearRoute(e.at[0], e.at[1])) continue;
  if (e.kind === 'dog') critters.push({ model: 'dog', at: [e.at[0], 0.05, e.at[1]], rot: e.rot, range: [9, 3.5] });
  else critters.push({ model: hash(e.at[0], e.at[1]) < 0.5 ? 'goat_black' : 'goat_white', at: [e.at[0], 0.05, e.at[1]], rot: e.rot, range: [9, 3.2] });
}
// rock pigeons in flocks of four on the open ground below the stairs, the street and the lane's crossing
for (const [x, z] of [[-10, 52], [12, 53.5], [-22, 57], [-2, 82], [4.5, 118], [-5, 163], [2, 236]]) {
  const PG = ['pigeon_grey', 'pigeon_dark', 'pigeon_grey', 'pigeon_white'];
  for (let k = 0; k < 4; k++) {
    const a = hash(x, z, k) * 6.28, d = 0.4 + 1.3 * hash(z, x, k + 3), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (nearRoute(px, pz, 1.2) || inLot(px, pz, 1.2)) continue;
    critters.push({ model: PG[k], at: [px, 0.05, pz], rot: hash(px, pz) * 6.28, range: [1.4, 1.1], tau: 12 + 6 * hash(pz, px, 2), speed: 0.45, stride: 0.18 });
  }
}
// a cat on the doorstep of two trading houses (beside the door's lane)
{
  let k = 0;
  for (const s of shops().filter((q) => q.kind === 'trade' && q.seed % 4 === 1 && q.rect[1] < 160)) {
    if (k >= 2) break;
    const e = s.door === 'e', zc = (s.rect[1] + s.rect[3]) / 2, p = [e ? s.rect[2] + 0.75 : s.rect[0] - 0.75, zc + 2.1];
    if (nearRoute(p[0], p[1], 1.5)) continue;
    critters.push({ model: hash(p[0], p[1]) < 0.5 ? 'cat_tabby' : 'cat_orange', at: [p[0], 0.05, p[1]], rot: e ? Math.PI / 2 : -Math.PI / 2, range: [7, 2.5] }); k++;
  }
}
export default { fish, flights, perches, critters };
