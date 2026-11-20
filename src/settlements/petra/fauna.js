// Petra — the animals (src/engine/fauna.js draws them; docs/settlements/petra.md §17): rock doves (drawn as sparrows) on the
// street's paving, the temple steps and the Khazneh's forecourt, house sparrows at the shop fronts, swifts and swallows over the
// valley and along the Siq's cliffs, brown-necked ravens and kites circling over the massif. No water: no fish, no herons.
import { STREET, PLAZA, TEMENOS, QASR, yards } from './layout.js';
import { outerRoutes } from './walkroutes.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [-60, 10], a: [150, 70], rot: 0.1 }, y: [12, 40], speed: 11 },
  { kind: 'swallow', n: 4, loop: { c: [115, -120], a: [40, 70], rot: 0.9 }, y: [10, 35], speed: 10 },
  { kind: 'swallow', n: 4, lane: { a: [320, -150], b: [150, -160] }, y: [5, 30], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [60, -90], a: [120, 90], rot: 0.5 }, y: [60, 95], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-150, 20], a: [60, 50], rot: 0 }, y: [35, 70], speed: 8 },
];
const perches = [];
const spots = [];
for (let x = -100; x <= 56; x += 22) spots.push([x, STREET.a[1] + 0.4 * ((x * 7) % 3 - 1)], [x + 8, STREET.a[1] + 6.5]);
spots.push([PLAZA.c[0] - 4, PLAZA.c[1] + 3], [PLAZA.c[0] - 2, PLAZA.c[1] - 5], [PLAZA.c[0] + 4, PLAZA.c[1] + 7]);
spots.push([QASR.altar[0], QASR.altar[1] + 3], [TEMENOS[0] + 30, QASR.altar[1] + 8], [-60, 17], [-40, 17.5]);
spots.push([62, STREET.a[1] - 2.5], [62.5, STREET.a[1] + 2.5], [PLAZA.c[0] + 1, PLAZA.c[1] + 12.8], [PLAZA.c[0] - 8, PLAZA.c[1] + 11]);
for (const y of yards()) spots.push([(y.rect[0] + y.rect[2]) / 2 + 2, (y.rect[1] + y.rect[3]) / 2 + 1.5]);
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.5] });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §26) ──
// Dogs at the doors of the Outer Siq's houses and the tents (every caravan and camp kept them), black goats at the tents and in the pens (the black goat-hair
// tents of the Arabs, Greek and Roman writers: §18), hens and a rooster before one Outer Siq house (the domestic fowl of the Roman Levant [inferred]), a cat on
// a bench of the south portico and one at a shop's step, rock doves on the paving by the Nymphaeum, the forecourt's basin and the great altar's steps, and house
// swallows' nests under the cornices of four Outer Siq houses. All kept off the doors' lanes. [inferred: that these species stood at these places]
const critters = [];
const outer = outerRoutes().map((r) => { const [a, b] = r.route; const dx = a[0] - b[0], dz = a[1] - b[1], l = Math.hypot(dx, dz) || 1; return { door: b, out: [dx / l, dz / l], i: r.i }; });
const at = (o, d, side) => { const [ox, oz] = o.out, x = o.door[0] + ox * d - oz * side, z = o.door[1] + oz * d + ox * side; return [+x.toFixed(2), +(ground.height(x, z) + 0.03).toFixed(3), +z.toFixed(2)]; };
critters.push({ model: 'dog', at: at(outer[1], 2.6, 2.3), rot: 1.1, range: [9, 3.5] }, { model: 'dog', at: at(outer[5], 2.6, -2.3), rot: 4.2, range: [9, 3.5] });
for (const [k, [d, sd]] of [[3.6, 3.0], [4.2, 3.6], [4.6, 2.8], [3.8, 4.2]].entries()) critters.push({ model: k === 0 ? 'rooster' : k % 2 ? 'hen_brown' : 'hen_white', at: at(outer[3], d, sd), rot: k * 1.3, range: [2.2, 1.0] });
for (const k of [0, 2, 4, 6]) { const o = outer[k], [x, y, z] = at(o, 0.16, 2.1); critters.push({ model: 'swallow_nest', at: [x, y + 2.8, z], rot: Math.atan2(o.out[1], o.out[0]), cycle: 33 + k, flight: 9, radius: 12, side: k % 4 ? 1 : -1, rise: -2.4 }); }
{ const ys = yards(), tents = ys.filter((y) => y.kind === 'tents'), pens = ys.filter((y) => y.kind === 'pen');
  for (const y of tents.slice(0, 2)) { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: 'dog', at: [cx - 3.4, y.y + 0.03, cz + 2.8], rot: 2, range: [9, 3.5] }, { model: 'goat_black', at: [cx + 3.6, y.y + 0.03, cz - 3.2], rot: 0.5, range: [9, 3.2] }, { model: 'goat_black', at: [cx + 4.4, y.y + 0.03, cz - 2.2], rot: 3.4, range: [9, 3.2] }); }
  pens.slice(0, 3).forEach((y, i) => { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: i % 2 ? 'goat_white' : 'goat_black', at: [cx + 1.5, y.y + 0.03, cz + 1.2], rot: i * 2, range: [7, 2.8] }); }); }
// a cat on a bench of the south portico (its top 0.46 above the portico's floor) and one on the stone block before a shop
critters.push({ model: 'cat_orange', at: [12.5, 0.45 + 0.47, STREET.a[1] + STREET.w / 2 + 2.1 - 0.05], rot: 0.4, range: [7, 0.5] }, { model: 'cat_tabby', at: [-2.0, 0.45 + 0.47, STREET.a[1] + STREET.w / 2 + 2.1 - 0.05], rot: 2.2, range: [7, 0.5] });
// rock doves on the paving: at the Nymphaeum's basin, the forecourt's basin and before the great altar's stair
for (const [x, z, m] of [[63.8, STREET.a[1] + 4.6, 'pigeon_grey'], [64.8, STREET.a[1] + 5.4, 'pigeon_white'], [63.2, STREET.a[1] + 6.0, 'pigeon_grey'], [PLAZA.c[0] - 2.6, PLAZA.c[1] + 12.4, 'pigeon_grey'], [PLAZA.c[0] - 1.6, PLAZA.c[1] + 11.6, 'pigeon_dark'], [QASR.altar[0] - 12, QASR.altar[1] - 1, 'pigeon_grey'], [QASR.altar[0] - 12.8, QASR.altar[1] + 0.4, 'pigeon_white']]) critters.push({ model: m, at: [x, ground.height(x, z) + 0.05, z], rot: x * 3, range: [1.4, 1.2] });
export default { fish, flights, perches, critters };
