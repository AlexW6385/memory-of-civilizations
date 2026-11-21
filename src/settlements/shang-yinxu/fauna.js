// Shang Yinxu — the animals (src/engine/fauna.js draws them; docs/settlements/shang-yinxu.md §7): swallows over the river and the court,
// crows over the halls and the fields, kites high over the plain, sparrows on the court's earth and the halls' platforms, an egret
// standing at the river's edge, carp in the Huan.
import { RIVER, riverDist, riverZ, riverX, HALL, COURT, landings, lots, lotPoint, spots as lotSpots } from './layout.js';
import { ground } from './ground.js';
import { walkDistance, frontPoint } from './walk.js';

const bank = (x, z) => riverDist(x, z) - RIVER.half;
const fish = [];
for (const x of [-250, -190, -120, -30, 40]) { const z = riverZ(x); fish.push({ n: 3, size: [0.16, 0.3], palette: 'carp', y: RIVER.water, dist: bank, margin: 0.6, k: 1, rot: 0, area: [x - 12, z - 0.3, x + 12, z + 0.3], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 }); }
for (const z of [-20, 40, 100, 160, 220]) { const x = riverX(z); fish.push({ n: 3, size: [0.16, 0.3], palette: 'carp', y: RIVER.water, dist: bank, margin: 0.6, k: 1, rot: 0, area: [x - 0.3, z - 12, x + 0.3, z + 12], a: [1.0, 9], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 }); }
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-300, -150], b: [160, -130] }, y: [0.6, 4], speed: 9, half: 18 },
  { kind: 'swallow', n: 5, loop: { c: [20, -20], a: [50, 40], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [20, -92], a: [50, 30], rot: 0.2 }, y: [14, 34], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-60, 140], a: [90, 40], rot: 0.5 }, y: [20, 45], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-120, 20], a: [90, 60], rot: 0.3 }, y: [2.5, 9], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [110, 120], a: [90, 60], rot: 0.9 }, y: [2.5, 9], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-100, 120], a: [50, 30], rot: 0 }, y: [10, 28], speed: 8 },
  { kind: 'kite', n: 2, loop: { c: [60, 60], a: [140, 90], rot: 0 }, y: [50, 90], speed: 6 },
];
const perches = [];
const spots = [[-4, -60], [44, -60], [10, -20], [30, 20], [20, 40], [-30, 20], [70, -20], [-60, -60], [110, -40], [-100, -40], [-60, 60], [90, 70], [130, 20], [-130, 40]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.1, rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const [x, z] of [[0, -98], [40, -98], [20, -77]]) perches.push({ kind: 'sparrow', x, z, y: HALL.h + 0.1, rot: 0, range: [1.2, 0], alert: 5 });
{ const x = -150, z = riverZ(x) + 15.5; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
landings().forEach((g, i) => { if (i % 3 === 1) { const x = g.a[0] - g.n[0] * 6 + g.tang[0] * 7, z = g.a[1] - g.n[1] * 6 + g.tang[1] * 7; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.atan2(g.n[0], g.n[1]), stay: [60, 200], gone: [60, 160], alert: 10 }); } });
lots().forEach((l, i) => { if (l.lod === 0 && i % 2 === 0) { const [x, z] = lotPoint(l, 3 + (i % 7) * 3, -0.2); perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.1, rot: i, range: [1.2, 0.8] }); } });
for (const [x, z] of [[-110, 106], [-70, 106]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.1, rot: 1, range: [3, 3], alert: 6 });
void riverX; void COURT;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §12) ──
// Dogs (the bone record, §5a) lying beside the gates of the lots on the visitor's walk, hens and a rooster in their yards' fronts (fowl in the yards, §5a), goats in the pens of a few lots
// (sheep or goats are in the bone record, §5a), swallows' mud nests under the eave of the kings' hall and of the great houses (swallows, §7), ducks afloat on the Huan and a crane and
// a kingfisher on its banks. No cat, no pigeon (not certain for the Shang town). All [inferred] from the dossier's lists.
const critters = [];
{
  let k = 0, g = 0, n = 0;
  lots().forEach((l, i) => {
    if (l.lod !== 0 || walkDistance(frontPoint(l)) > 60) return;
    const W = l.rect[2] - l.rect[0], D = l.rect[3] - l.rect[1], sp = lotSpots(l.kind, W, D), at = (u, v) => lotPoint(l, u, v);
    const front = l.front === 's' ? Math.PI : 0;
    if (k < 6 && i % 2 === 0) { const [x, z] = at(sp.gate[0] + 3.4, -1.0); critters.push({ model: 'dog', at: [x, 0.02, z], rot: 1.1 + k, range: [9, 3.5] }); k++; }
    if (i % 3 === 0) {
      const [x, z] = at(sp.hearth[0] - 4.2, sp.hearth[1] - 6.4 < 2 ? 3 : sp.hearth[1] - 6.4);
      for (const [model, dx, dz] of [['rooster', 0, 0], ['hen_brown', 0.9, 0.5], ['hen_white', 1.5, -0.4]]) critters.push({ model, at: [x + dx, 0.02, z + dz], rot: i + dx, range: [3.4, 1.4] });
    }
    if (l.kind !== 'workshop' && g < 4 && i % 4 === 1) { const [x, z] = at(sp.pen[0] - 0.9, sp.pen[1] + 1.1); critters.push({ model: g % 2 ? 'goat_black' : 'goat_white', at: [x, 0.02, z], rot: 2 + g, range: [9, 3.2] }); g++; }
    if (l.kind === 'court' && n < 5) {
      // a mud nest on the main house's front wall between the door and a window, under the eave (hv: the house's front, W/2: its axis; the wall's top is 3.1 m)
      const hv = D - 7.7, [x, z] = at(W / 2 + 1.5, hv - 0.03);
      critters.push({ model: 'swallow_nest', at: [x, 2.85, z], rot: l.front === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: n % 2 ? 1 : -1, rise: -0.8 });
      n++;
    }
    void front;
  });
}
// the nests under the front wall of the kings' hall (the wall's outer face z = -83.8, its top 4.9 m over the floor, between the doors' bays)
for (const x of [16, 24]) critters.push({ model: 'swallow_nest', at: [x, HALL.h + 3.15, -83.78], rot: Math.PI / 2, cycle: 36, flight: 9, radius: 12, side: x < 20 ? -1 : 1, rise: -0.8 });
// ducks afloat on the Huan: a pair of rafts on the western reach and one on the eastern, kept off the landings' boats
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown'], raft: true, area: [-190, riverZ(-190) - 8, -130, riverZ(-130) + 8], dist: bank, a: [14, 5], ratio: 0.3, margin: 1.5, y: RIVER.water, speed: 0.2, cycle: [18, 26] });
critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown'], raft: true, area: [riverX(60) - 8, 30, riverX(60) + 8, 90], dist: bank, a: [5, 14], ratio: 3, margin: 1.5, y: RIVER.water, speed: 0.2, cycle: [18, 24] });
// a crane on the western reach's north bank, a kingfisher on a pile of the landing nearest the palace
{ const x = -110, z = riverZ(x) - RIVER.half - 2.2; critters.push({ model: 'crane', at: [x, ground.height(x, z) + 0.02, z], rot: Math.PI / 2, range: [7.0, 1.6], tau: 50, speed: 0.4 }); }
{ const g0 = landings().find((q) => q.a[0] > -60 && q.a[0] < 0 && q.n[1] === -1); if (g0) critters.push({ model: 'kingfisher', at: [g0.b[0] + 0.9, RIVER.water + 0.9, g0.b[1] - 0.2], rot: 0, water: [g0.b[0] + g0.n[0] * 3, g0.b[1] + g0.n[1] * 3, RIVER.water], cycle: 40 }); }
void COURT;
export default { fish, flights, perches, critters };
