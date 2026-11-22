// Delphi — the animals (src/engine/fauna.js draws them; docs/settlements/delphi.md §8): choughs and ravens (drawn as crows) wheeling
// before the Phaedriades' cliffs, swifts and swallows over the temple's terrace and the Sacred Way, sparrows on the paving and the
// treasuries' steps; no fish (no pool in the disc).
import { lanes, inLot, inLane, WAY, TT_Y, SPRING, STADIUM, STADIUM_Y, TREASURIES } from './layout.js';
import { ground } from './ground.js';
import { houseRoutes } from './walk.js';
import { houseDoors } from '../../styles/delphi/house.js';
import { frame } from '../../styles/greek/agora.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 6, loop: { c: [10, -150], a: [120, 40], rot: 0.1 }, y: [75, 120], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [150, -20], a: [34, 40], rot: 0.5 }, y: [45, 80], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [30, 5], a: [70, 40], rot: 0 }, y: [24, 38], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [70, 70], a: [60, 40], rot: 0.3 }, y: [14, 26], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-34, -52], a: [40, 30], rot: 0 }, y: [38, 52], speed: 9 },
];
flights.push({ kind: 'swallow', n: 5, loop: { c: [-120, 40], a: [60, 50], rot: 0.2 }, y: [10, 26], speed: 10 }, { kind: 'swallow', n: 4, loop: { c: [125, 70], a: [30, 40], rot: 0 }, y: [10, 22], speed: 10 }, { kind: 'crow', n: 5, loop: { c: [-60, -140], a: [70, 30], rot: -0.3 }, y: [70, 110], speed: 8 }, { kind: 'swallow', n: 4, loop: { c: [118, 116], a: [30, 14], rot: 0 }, y: [6, 14], speed: 9 });
const perches = [];
const spots = [[60, 98], [88, 99], [52, 77], [80, 76], [70, 57], [20, 57], [0, 43], [40, 43], [70, 43], [-20, 5], [20, 18], [50, 14], [66, -12], [30, -18], [-10, -17], [135, 0], [128, 8], [100, 120], [112, 118]];
for (const r of lanes()) for (let x = r.x0 + 6; x < r.x1 - 3; x += 17 + (Math.round(r.z) % 5)) spots.push([x, r.z - 0.2]);
for (const t of TREASURIES) spots.push([(t.rect[0] + t.rect[2]) / 2 + 2.5, t.rect[3] + 0.4]);
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
void WAY; void TT_Y; void SPRING; void STADIUM; void STADIUM_Y;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §15.4) ──
// Dogs lying at the doors of the lane's houses, off the door's lane (guard dogs and house dogs of Greek towns [inferred]); cats on the steps (the cat is the
// Egyptian import of the Greek houses, mice-catching, attested in the 5th c. as a pet and rare [inferred]); goats tethered at the lane's edge and about the
// sacrificial pen (goats and sheep were the common victims, Wikipedia "Pythia": the goat's shudder was the sign [stated]); hens before the houses and in the market;
// doves on the paving of the terrace (the dove was Apollo's neighbour's, Aphrodite's and Dodona's bird; at Delphi they are recorded as a bird of the sanctuary in
// the Ion, 154 [inferred, text recalled, unchecked]); the swallows' mud nests under the eaves of the lane's houses (swallows over Delphi, §8).
const critters = [];
const at3 = (x, z, dy = 0.03) => [x, ground.height(x, z) + dy, z];
const hr = houseRoutes();
for (const [i, r] of hr.entries()) {
  const l = r.l, F = frame(l.rect, 's'), D = houseDoors(l.rect, l.seed), L = F.L;
  const side = D.du > L / 2 ? -1 : 1, u = Math.max(1.0, Math.min(L - 1.0, D.du + side * 3.0));
  const [x, z] = F.P(u, -0.9);
  if (i % 3 === 0) critters.push({ model: 'dog', at: at3(x, z), rot: 1.2 + i, range: [9, 3.5] });
  else if (i % 3 === 1) critters.push({ model: i % 2 ? 'cat_tabby' : 'cat_orange', at: at3(x, z, 0.05), rot: 2.4 + i, range: [7, 2.5] });
  if (i % 4 === 2) { const [hx, hz] = F.P(Math.max(1.0, Math.min(L - 1.0, D.du - side * 3.4)), -1.3); critters.push({ model: i % 8 === 2 ? 'rooster' : 'hen_brown', at: at3(hx, hz), rot: i, range: [2.2, 1.6] }); }
  // a swallows' nest under the eave, at the end away from the door, for one house in three
  if (i % 3 === 0 && L >= 9.3) { const [nx, nz] = F.P(side > 0 ? 0.9 : L - 0.9, -0.14); critters.push({ model: 'swallow_nest', at: [nx, l.y + 2.7, nz], rot: Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: i % 2 ? 1 : -1, rise: -0.8 }); }
}
// goats about the sacrificial pen on the terrace (the pen is at x 54–58, z −11.6…−8.6), tethered; two black, one white
critters.push({ model: 'goat_black', at: at3(60.2, -8.2), rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: at3(60.9, -9.6), rot: 3.0, range: [9, 3.2] });
// goats on the slope above the west village
for (const [x0, z0, m] of [[-128, 68, 'goat_black'], [-126.6, 69.4, 'goat_white'], [-150, 30, 'goat_white'], [-148.8, 31.6, 'goat_black']]) {
  // (the nearest ground to the spot that is neither a house nor a lane)
  let best = null;
  for (let r = 0; r < 40 && !best; r += 1.5) for (let a = 0; a < 6.28; a += 0.5) { const x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r; if (!inLot(x, z, 1.6) && !inLane(x, z, 1.6) && Math.hypot(x, z) < 170) { best = [x, z]; break; } }
  if (best) critters.push({ model: m, at: at3(best[0], best[1], 0.05), rot: x0, range: [9, 3.2] });
}
// hens in the forecourt market, between the rows of stalls
for (const [x, z, m] of [[112, 116.8, 'hen_brown'], [113.2, 117.6, 'hen_white'], [132, 116.4, 'hen_brown'], [136, 114.2, 'rooster'], [134.7, 115.2, 'hen_white']]) critters.push({ model: m, at: at3(x, z, 0.04), rot: x * 3, range: [2.4, 1.8] });
// dogs of the market and a dog at the gate
critters.push({ model: 'dog', at: at3(121, 116.8), rot: 0.5, range: [9, 3.5] }, { model: 'dog', at: at3(90.6, 112.5), rot: 2.0, range: [9, 3.5] });
// doves on the terrace's paving before the arrival, and on the treasuries' steps
for (const [x, z, m] of [[65.5, 14.2, 'pigeon_grey'], [66.4, 15.4, 'pigeon_white'], [64.8, 16.6, 'pigeon_grey'], [76, 6, 'pigeon_white'], [77.1, 7.2, 'pigeon_grey']]) critters.push({ model: m, at: at3(x, z, 0.07), rot: x * 3, range: [1.4, 1.2] });
for (const t of TREASURIES.slice(0, 4)) { const x = (t.rect[0] + t.rect[2]) / 2 + 2.2, z = t.rect[3] + 0.9; critters.push({ model: 'pigeon_grey', at: [x, t.y + 0.05, z], rot: x, range: [1.4, 1.2] }); }
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('delphi'));
export default { fish, flights, perches, critters };
