// Benin City about 1600 — the animals (src/engine/fauna.js; docs/settlements/benin-city.md §8): swallows and swifts over the great
// street and the market, dark kites (the engine's dark birds) circling over the palace and the Iya, small birds on the red earth and
// the thatch (sparrow stand-ins for weaverbirds), an egret at the ditch.
import { PALACE, MARKET, GATES, YARDS, crest, lots, GREAT, GATE_X, SHEDS, BAYS } from './layout.js';
import { frame } from '../../styles/greek/agora.js';
import { walkRoutes } from './walkroutes.js';
import { houseDoor } from '../../styles/benin/house.js';

const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-240, 57], b: [240, 57] }, y: [3, 20], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, loop: { c: [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], a: [60, 40], rot: 0.2 }, y: [4, 16], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [(PALACE[0] + PALACE[2]) / 2, (PALACE[1] + PALACE[3]) / 2], a: [80, 60], rot: 0.1 }, y: [45, 28], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [0, 0], a: [250, 230], rot: 0.5 }, y: [60, 35], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-65, 20], [-30, 52], [40, 60], [98, 20], [98, -60], [160, 20], [150, -50], [-200, 57], [-90, 100], [60, 110], [20, 20], [-120, 28]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: x * 0.07, range: [1.5, 1.3] });
// sparrows on the thatch ridges of the houses about the great street, on the palace wall's coping, on the red earth before the doors
{
  const near = lots().filter((l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 65, (l.rect[1] + l.rect[3]) / 2 - 80) < 150);
  near.forEach((l, i) => {
    const F = frame(l.rect, l.front), p = F.P(F.L * (0.3 + 0.4 * ((i * 7) % 5) / 5), 2.7), top = (l.chief ? 3.8 + 2.9 + 2.6 : 3.1 + 2.9) + 0.1;
    if (i % 2 === 0) perches.push({ kind: 'sparrow', x: p[0], z: p[1], y: top, rot: i, range: [F.L * 0.3, 0], alert: 5 });
    else { const q = F.P(F.L * 0.5 + 3.5, -2.2); perches.push({ kind: 'sparrow', x: q[0], z: q[1], y: 0.12, rot: i * 1.3, range: [1.6, 1.4], alert: 4 }); }
  });
  for (const x of [-120, -95, -40, -15]) perches.push({ kind: 'sparrow', x, z: PALACE[3] - 0.6, y: 3.8 + 0.22, rot: 0, range: [4, 0], alert: 5 });
  for (const x of [-130, -20, 40]) perches.push({ kind: 'sparrow', x, z: GREAT[1] + 3, y: 0.05, rot: x, range: [2.5, 1.5] });
}
// on the new roofs: the ridges of the waiting sheds, the eaves of the bays on the palace wall, the porch beam and the gate's ridge
for (const sh of SHEDS) { const [x0, z0, x1, z1] = sh.rect; perches.push({ kind: 'sparrow', x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: 4.62, rot: x0, range: [(x1 - x0) * 0.35, 0], alert: 5 }); perches.push({ kind: 'sparrow', x: x1 + 0.3, z: z1 + 0.4, y: 0.12, rot: x1, range: [1.8, 1.4], alert: 4 }); }
BAYS.forEach((b, i) => { if (i % 3 === 0) perches.push({ kind: 'sparrow', x: b.rect[0] + 2.5, z: 3.2, y: 2.62, rot: i, range: [2, 0], alert: 4 }); });
for (const s of [-1, 1]) { perches.push({ kind: 'sparrow', x: GATE_X + s * 6.5, z: 2.9, y: 5.28, rot: s, range: [2.4, 0], alert: 6 }); perches.push({ kind: 'sparrow', x: GATE_X + s * 6, z: -5.5, y: 13.0, rot: s, range: [3, 0], alert: 8 }); }
{ const g = GATES[2], th = Math.atan2(g.at[1], g.at[0]), r = crest(th) + 16; perches.push({ kind: 'egret', x: Math.cos(th) * r + 12, z: Math.sin(th) * r, y: -3.4, rot: 0, stay: [60, 200], gone: [60, 160], alert: 10 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/benin-city.md §15.4) ──
// Fowl and goats at the doors of the compounds of the walk (Dapper's streets of close-set houses; the yards of the life pass: hens and goats at the doors, §10), the dwarf goats
// tethered at the sheds and the market [inferred: the market sold goats and fowls, §5], dogs lying by two doors and in the market, a cat on the step of every third compound, doves
// on the square's earth and the court's paving (the dove's cry, §7). Nothing is placed in a door's lane (the door's width and 1.2 m either side) or on a step but the cat's.
const critters = [];
{
  const wr = walkRoutes();
  wr.forEach((r, i) => {
    const l = r.l, F = frame(l.rect, l.front), H = houseDoor(l, F.L), L = F.L, at = (u, v) => F.P(Math.max(1.0, Math.min(L - 1.0, u)), v);
    const side = H.door > L / 2 ? -1 : 1;                                   // the animals keep to the side of the front with more room
    const put = (model, u, v, rot, range, o = {}) => { const [x, z] = at(u, v); critters.push({ model, at: [x, 0, z], rot, range, ...o }); };
    put(i % 2 ? 'hen_white' : 'hen_brown', H.door + side * 4.4, -2.7, i * 1.7, [1.8, 0], { });
    if (i % 2 === 0) put('hen_white', H.door + side * 5.4, -3.3, i * 2.3 + 1, [1.8, 0], { });
    if (i % 3 === 0) put('rooster', H.door + side * 6.4, -2.9, i * 0.9, [2.0, 0], { });
    if (i % 2 === 0) put(i % 4 === 0 ? 'goat_black' : 'goat_white', H.door - side * 4.6, -3.4, i * 1.1, [6, 3]);
    if (i % 4 === 1) put('dog', H.door - side * 3.4, -2.1, i * 0.7, [9, 3.5]);
    if (i % 3 === 2) { const [x, z] = at(H.dc + side * (H.wide / 2 + 0.7), -0.7); critters.push({ model: i % 2 ? 'cat_tabby' : 'cat_orange', at: [x, 0.12, z], rot: i * 1.9, range: [7, 2.5] }); }
  });
  // the king's square: doves on the earth before the gate, hens and goats at the sheds, a dog by the seats
  for (const [x, z, m] of [[-72, 17, 'pigeon_grey'], [-71, 18.1, 'pigeon_white'], [-58.6, 15.4, 'pigeon_grey'], [-57.8, 16.4, 'pigeon_grey'], [-76, 6.6, 'pigeon_white'], [-54, 5.8, 'pigeon_grey']]) critters.push({ model: m, at: [x, 0.02, z], rot: x * 3, range: [1.4, 1.2] });
  for (const sh of SHEDS) { const [x0, z0, x1, z1] = sh.rect; critters.push({ model: 'hen_brown', at: [x1 + 2.4, 0, z1 + 1.8], rot: x0, range: [1.8, 0] }, { model: 'hen_white', at: [x0 - 2.4, 0, z1 + 2.2], rot: x1, range: [1.8, 0] }, { model: 'goat_black', at: [x0 - 2.8, 0, (z0 + z1) / 2], rot: x0 * 0.3, range: [6, 3] }); }
  critters.push({ model: 'dog', at: [-26, 0, 11.6], rot: 2, range: [9, 3.5] });
  // the court of audience: doves on the paving between the benches
  for (const [x, z, m] of [[GATE_X - 8.6, -28, 'pigeon_white'], [GATE_X + 8.7, -45, 'pigeon_grey'], [GATE_X + 1.5, -63.2, 'pigeon_grey']]) critters.push({ model: m, at: [x, 0.03, z], rot: x * 2, range: [1.4, 1.2] });
  // the Oba market: fowl round the mats of the open floor, goats at its edge, two dogs
  for (let k = 0; k < 6; k++) critters.push({ model: k % 3 === 0 ? 'rooster' : k % 2 ? 'hen_white' : 'hen_brown', at: [MARKET[0] + 12 + k * 11.5, 0, 25 + (k % 3) * 2.6], rot: k * 1.3, range: [1.8, 0] });
  for (let k = 0; k < 3; k++) critters.push({ model: k % 2 ? 'goat_white' : 'goat_black', at: [MARKET[0] + 26 + k * 29, 0, 34.2], rot: k * 2.1, range: [6, 3] });
  critters.push({ model: 'dog', at: [MARKET[0] + 40, 0, 22.4], rot: 1, range: [9, 3.5] }, { model: 'dog', at: [MARKET[0] + 82, 0, 10.2], rot: 3, range: [9, 3.5] });
  // the guild lane: fowl at the fronts of the casting yards, a dog at the first weaving yard
  for (const y of YARDS.filter((q) => q.kind === 'cast').slice(0, 4)) { const F = frame(y.rect, y.front), [x, z] = F.P(F.L * 0.62, 3.1), [a, b] = F.P(F.L * 0.62 + 1.3, 3.6); critters.push({ model: 'hen_brown', at: [x, 0.05, z], rot: x, range: [1.8, 0] }, { model: 'hen_white', at: [a, 0.05, b], rot: a, range: [1.8, 0] }); }
  { const y = YARDS.find((q) => q.kind === 'weave'); if (y) { const F = frame(y.rect, y.front), [x, z] = F.P(F.L * 0.7, 3.4); critters.push({ model: 'dog', at: [x, 0.05, z], rot: 1.3, range: [9, 3.5] }); } }
}
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('benin-city'));
export default { fish: [], flights, perches, critters };
