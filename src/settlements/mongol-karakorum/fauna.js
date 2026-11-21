// Mongol Karakorum — the animals (src/engine/fauna.js draws them; docs/settlements/mongol-karakorum.md §9): ravens and a kite high over the town, larks
// over the steppe outside the wall, swallows about the court, sparrows on the roofs and walls, doves at the mosques [inferred]; no fish.
import { ground } from './ground.js';
import { WALL, PALACE, MOSQUES, WALL_H, COURT_GER, HOUSEHOLD, CAMPS } from './layout.js';
import { bays } from './walkroutes.js';
import { bayLeft } from '../../styles/mongol/shops.js';
import { frontFrame } from '../../styles/mongol/local.js';
import { shopRect } from './layout.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 6, loop: { c: [-10, -20], a: [120, 70], rot: 0.1 }, y: [14, 40], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [60, 60], a: [60, 40], rot: 0.5 }, y: [10, 28], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [70, -30], a: [40, 20], rot: 0 }, y: [3, 12], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [-180, 0], b: [180, 0] }, y: [3, 9], speed: 9 },
];
const perches = [];
// sparrows on the town wall's top and the palace wall's coping, a few in the lanes
for (const [x, z] of [[-90, -97], [-30, -97], [40, -97], [100, -97], [-132, -40], [-132, 40], [132, -40], [132, 40], [-60, 97], [60, 97]]) perches.push({ kind: 'sparrow', x, z, y: WALL_H + 0.1, rot: (x * 7) % 3, range: [2.0, 0.3], alert: 6 });
for (const [x, z] of [[30, -92], [90, -92], [126, -50]]) perches.push({ kind: 'sparrow', x, z, y: 4.4, rot: 1, range: [1.6, 0.3], alert: 5 });
for (const [x, z] of [[-49, -80], [-100, 32]]) perches.push({ kind: 'sparrow', x, z, y: 3.5, rot: 0.4, range: [1.2, 1.2], alert: 7 });
for (const [x, z] of [[-62, 128], [66, 126]]) perches.push({ kind: 'sparrow', x: x + 8, z: z + 4, y: ground.height(x + 8, z + 4), rot: 2, range: [3, 2], alert: 10 });
// sparrows hopping on the paving of the main street and the cross-street among the stalls, and on the flat roofs of the shop rows and houses
for (let x = -120; x < 125; x += 21) perches.push({ kind: 'sparrow', x, z: (Math.round(x / 21) % 2 ? 1 : -1) * 4.6, y: 0.02, rot: 0, range: [1.8, 0.6], alert: 4.5 });
for (let z = -88; z < 90; z += 22) if (Math.abs(z) > 12) perches.push({ kind: 'sparrow', x: (Math.round(z / 22) % 2 ? 1 : -1) * 3.0, z, y: 0.02, rot: 1.57, range: [0.6, 1.8], alert: 4.5 });
for (const [x, z] of [[-100, -9.4], [-60, -9.4], [-30, 10], [30, 10], [60, 10], [-7.4, -40], [7.4, -70], [7.4, 40], [-7.4, 70]]) perches.push({ kind: 'sparrow', x, z, y: 3.5 + 0.9, rot: 0.3, range: [1.6, 0.4], alert: 6 });
for (const m of MOSQUES) perches.push({ kind: 'sparrow', x: (m[0] + m[2]) / 2, z: m[1] + 8, y: 6.5, rot: 0.2, range: [2.2, 0.6], alert: 7 });
flights.push({ kind: 'swallow', n: 5, lane: { a: [-130, 0], b: [130, 0] }, y: [2, 6], speed: 9 }, { kind: 'swallow', n: 4, loop: { c: [-70, 30], a: [40, 20], rot: 0.3 }, y: [3, 9], speed: 9 }, { kind: 'crow', n: 5, loop: { c: [60, -50], a: [50, 40], rot: 0.2 }, y: [12, 30], speed: 8 }, { kind: 'crow', n: 4, loop: { c: [-80, 60], a: [50, 30], rot: 1.1 }, y: [10, 26], speed: 8 });
// ravens on the tops of the nine-tailed banners' staves and the great hall's ridge, a falcon and a kite working over the court, doves round the gate hall
for (const [x, z] of [[58, -22], [82, -22]]) perches.push({ kind: 'raven', x, z, y: 7.7, rot: 0.9, range: [0.1, 0.1], alert: 7 });
for (const z of [-62, -53]) perches.push({ kind: 'raven', x: 70, z, y: 12.55, rot: 0.2, range: [0.1, 3.0], alert: 9 });
for (const [x, z] of [[63.5, -6.4], [76.2, -6.2], [70, -6.0]]) perches.push({ kind: 'dove', x, z, y: 6.5, rot: 0.4, range: [1.2, 0.3], alert: 6 });
flights.push({ kind: 'falcon', n: 1, loop: { c: [70, -34], a: [38, 22], rot: 0.2 }, y: [18, 36], speed: 11 }, { kind: 'kite', n: 2, loop: { c: [60, 10], a: [70, 40], rot: 0.7 }, y: [24, 46], speed: 9 }, { kind: 'swallow', n: 5, loop: { c: [70, -20], a: [24, 14], rot: 0 }, y: [2, 7], speed: 9 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §14.4) ──
// Dogs at the gers (the Mongols' camp dogs; Rubruck's gers are guarded [inferred as to the breed: the heavy mastiff type], on the dog's rig: asleep until the visitor comes near),
// Bactrian camels kneeling at the Saracens' caravan by the west gate [inferred: the dossier's camels], goats tethered outside the sheep pens of the west gate [stated: Rubruck: the
// sheep and goats' market], hens and a cock in the yard of the Cathayan quarter's workshops [inferred], doves on the courts of the mosques [dossier §9], a cat and a hung songbird at
// two Chinese fronts of the east rows [inferred: Chinese households], swallows' mud nests under the front beams of the bazaar's rows on the walk [inferred: the eaves of a mud-brick
// town on the steppe; swallows are named for the court in §12]. No horses or oxen: the engine's critter rigs have no model of them (the still animals of town.js stand for them).
const critters = [];
const dogAt = (g, i) => { const [x, z] = g.c, r = g.r; return [x + r + 1.5, 0.02, z + r * 0.55 + (i % 2) * 0.4]; };
critters.push({ model: 'mastiff', at: [COURT_GER.c[0] + COURT_GER.r + 1.5, 0.02, COURT_GER.c[1] + 3.2], rot: 0.9, range: [9, 3.5] });
HOUSEHOLD.slice(0, 5).forEach((g, i) => { if (i % 2 === 0) critters.push({ model: i === 0 ? 'mastiff' : 'dog', at: dogAt(g, i), rot: 1.7 + i, range: [9, 3.5] }); });
critters.push({ model: 'dog', at: [CAMPS.se[0] + 6, 0.02, CAMPS.se[1] + 4], rot: 0.4, range: [9, 3.5] }, { model: 'mastiff', at: [CAMPS.sw[0] - 5, 0.02, CAMPS.sw[1] + 3], rot: 2.2, range: [9, 3.5] });
critters.push({ model: 'camel_dun', at: [-143.5, 0, 31], rot: 1.2, range: [14, 5] }, { model: 'camel_dark', at: [-141, 0, 36.5], rot: 1.35, range: [14, 5] }, { model: 'camel_dun', at: [-144, 0, 41], rot: 1.1, range: [14, 5] });
critters.push({ model: 'goat_black', at: [-142, 0, 14], rot: 0.5, range: [9, 3.2] }, { model: 'goat_white', at: [-140.8, 0, 15.6], rot: 2.6, range: [9, 3.2] });
critters.push({ model: 'hen_brown', at: [96, 0, 70], rot: 0.3, range: [2.5, 2] }, { model: 'hen_white', at: [97.4, 0, 71.2], rot: 2.0, range: [2.5, 2] }, { model: 'rooster', at: [95.2, 0, 71.8], rot: 4.0, range: [2.5, 2] }, { model: 'hen_brown', at: [99, 0, 69.4], rot: 5.0, range: [2.5, 2] });
for (const q of MOSQUES) { const cx = (q[0] + q[2]) / 2; for (const [dx, dz, m] of [[-1.4, 3.2, 'pigeon_grey'], [-0.4, 4.1, 'pigeon_white'], [1.2, 3.4, 'pigeon_grey']]) critters.push({ model: m, at: [cx + dx, 0.03, q[3] + dz], rot: cx * 3 + dx, range: [1.4, 1.2] }); }
{
  const all = bays(), east = all.filter((b) => b.row.east && b.row.face === 'n' && b.row.a[0] > 70 && b.row.a[0] < 110);
  const frame = (b) => frontFrame(shopRect(b.row), b.row.face);
  const P = (F, u, v) => [F.O[0] + F.U[0] * u + F.V[0] * v, F.O[1] + F.U[1] * u + F.V[1] * v];
  // a cat on the apron at the counter's end of one east bay, a songbird hung from the front beam of another
  { const b = east[2], F = frame(b), uc = bayLeft(b.row.seed || 9, b.i) ? b.i * 3.6 + 0.6 : (b.i + 1) * 3.6 - 0.6, [x, z] = P(F, uc, 2.3); critters.push({ model: 'cat_tabby', at: [x, 0.03, z], rot: Math.atan2(F.V[1], F.V[0]) + 0.5, range: [7, 2.5] }); }
  { const b = east[9], F = frame(b), uc = bayLeft(b.row.seed || 9, b.i) ? b.i * 3.6 + 0.9 : (b.i + 1) * 3.6 - 0.9, [x, z] = P(F, uc, 0.5); critters.push({ model: 'cagebird', at: [x, 2.3, z], rot: Math.atan2(F.V[1], F.V[0]) }); }
  // swallows' nests under the front beams: on the rows nearest the arrival, one every ~12 m, off the ways in
  let k = 0, last = null;
  for (const b of all.filter((q) => (q.row.face === 'n' || q.row.face === 's') && Math.abs(q.at[0] - 70) < 60).sort((p, q) => Math.abs(p.at[0] - 70) - Math.abs(q.at[0] - 70))) {
    if (k >= 8) break;
    if (last && Math.hypot(last[0] - b.at[0], last[1] - b.at[1]) < 11) continue;
    if (critters.some((c) => c.model === 'swallow_nest' && Math.hypot(c.at[0] - b.at[0], c.at[2] - b.at[1]) < 11)) continue;
    const F = frame(b), uc = bayLeft(b.row.seed || 9, b.i) ? b.i * 3.6 + 0.5 : (b.i + 1) * 3.6 - 0.5, [x, z] = P(F, uc, 0.2);
    critters.push({ model: 'swallow_nest', at: [x, 2.45, z], rot: Math.atan2(F.V[1], F.V[0]), cycle: 31 + (k % 5) * 2, flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); last = b.at; k++;
  }
}
void WALL; void PALACE;
export default { fish, flights, perches, critters };
