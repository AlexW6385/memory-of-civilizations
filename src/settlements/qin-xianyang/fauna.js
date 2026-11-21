// Qin Xianyang — the animals (src/engine/fauna.js draws them; docs/settlements/qin-xianyang.md §7): swallows over the market and the road,
// crows (rooks) over the palace's roofs and the pit's mound, sparrows on the paving of the forecourt, the market and the walls,
// a pair of kites high over the plain. No water, so no fish.
import { onWalk, walkDistance } from './walk.js';
import { height, TERRACE, MARKET, FORECOURT, PIT, ROOF, WS_Z, YARD, HAUL, rampZ, lots } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-300, 10], b: [300, 10] }, y: [1, 8], speed: 10, half: 20 },
  { kind: 'swallow', n: 4, loop: { c: [-30, 58], a: [60, 28], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [-219, -100], a: [50, 34], rot: 0.2 }, y: [18, 40], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [20, -150], a: [90, 40], rot: 0.1 }, y: [14, 34], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [60, -230], a: [70, 30], rot: 0.5 }, y: [20, 45], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [YARD[0] + 30, -121], a: [45, 30], rot: 0 }, y: [1.5, 9], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [HAUL.x0, HAUL.z], b: [HAUL.x1, HAUL.z] }, y: [1, 5], speed: 10, half: 12 },
  { kind: 'swallow', n: 3, lane: { a: [-290, 148], b: [290, 148] }, y: [1, 6], speed: 9, half: 14 },
  { kind: 'crow', n: 4, loop: { c: [YARD[0] + 60, -150], a: [50, 30], rot: 0.3 }, y: [14, 30], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, 190], a: [120, 60], rot: 0 }, y: [18, 40], speed: 8 },
];
const perches = [];
const spots = [[-219, -40], [-200, -34], [-240, -30], [-170, -36], [-60, 34], [-10, 46], [-28, 80], [20, 70], [-90, 40], [100, 10], [60, -14], [-130, 14], [170, -100], [-60, WS_Z + 6], [40, WS_Z - 8], [110, WS_Z + 4], [-120, 140], [60, 160], [-60, 200], [180, 130], [-200, 100]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
// on the terrace's coping and the pit's mound
for (const [x, z] of [[-250, -126], [-190, -126], [-230, -74.4]]) perches.push({ kind: 'sparrow', x, z, y: TERRACE.h + 1.1, rot: 0, range: [1.2, 0], alert: 5 });
for (const [x, z] of [[-40, -120], [10, -130], [30, -110]]) perches.push({ kind: 'sparrow', x, z, y: ROOF.mound + 0.1, rot: 1, range: [1.4, 1.2] });
// on the ridges and the wall-tops of the town: a scatter of houses, the yard's stacks and its watch tower
{ let n = 0; for (const l of lots()) { if (l.trade || l.kind === 'garden' || (n++ % 7)) continue; const [x0, z0, x1, z1] = l.rect, x = (x0 + x1) / 2 + (l.seed % 5 - 2), z = (z0 + z1) / 2; perches.push({ kind: 'sparrow', x, z, y: height(x, z) + (l.kind === 'official' ? 6.6 : 4.6), rot: (l.seed % 6), range: [2.4, 0.4], alert: 6 }); } }
for (const [x, z] of [[YARD[0] + 16, -148], [YARD[0] + 22, -146], [YARD[0] + 40, -100], [YARD[0] + 8, -96]]) perches.push({ kind: 'sparrow', x, z, y: 0.12, rot: x % 3, range: [1.6, 1.4] });
// at the ramps' heads: sparrows on the guard logs of the ramps' edges
for (const i of [0, 1, 2]) { const z = rampZ(i); for (const s of [-1, 1]) perches.push({ kind: 'sparrow', x: PIT.x1 + 6 + i * 3, z: z + s * 3.7, y: 0.36, rot: s, range: [3.5, 0.2], alert: 3 }); }
void MARKET; void FORECOURT; void PIT;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §13) ──
// The domestic animals of a Qin town: dogs (the Qin law and the tomb finds know the household dog), hens and a cock, geese, goats, and the swallows' mud nests under the eaves (the swallow
// "nested in the houses of men"). They sit on the street fronts of the open houses along the visitor's walk, off the walking line, and in a figure-makers' yard. No cat (not certain for
// the Qin town), no pigeons. [inferred: the placing; the species are those a Warring States or Qin household kept]
const critters = [];
{
  const homes = lots().filter((l) => l.open && !l.trade && (l.kind === 'row' || l.kind === 'court') && l.tier < 2 && onWalk(l)).sort((a, b) => a.rect[0] - b.rect[0] || a.rect[1] - b.rect[1]);
  const pt = (l, u, v) => { const [x0, z0, x1, z1] = l.rect, n = l.front === 'n'; return [x0 + u, n ? z0 + v : z1 - v]; };
  let dogs = 0, nests = 0, hens = 0, goats = 0, geese = 0;
  homes.forEach((l, k) => {
    const W = l.rect[2] - l.rect[0], rot = l.front === 's' ? Math.PI / 2 : -Math.PI / 2, side = k % 2 ? 1 : -1;
    if (k % 4 === 0 && dogs < 7) { const [x, z] = pt(l, side > 0 ? W - 1.0 : 1.0, -0.9); critters.push({ model: 'dog', at: [x, 0.02, z], rot: 1.1 + k, range: [9, 3.5] }); dogs++; }
    if (k % 3 === 1 && nests < 9) { const [x, z] = pt(l, side > 0 ? W * 0.14 : W * 0.86, -0.25); critters.push({ model: 'swallow_nest', at: [x, 2.65, z], rot, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side, rise: -0.8 }); nests++; }
    if (k % 5 === 2 && hens < 3) {
      for (const [model, du, dv] of [['rooster', 0, 0], ['hen_brown', 1.0, 0.5], ['hen_white', 0.3, 1.2]]) { const [x, z] = pt(l, W * 0.5 + side * (3.2 + du), -0.8 - dv * 0.25); critters.push({ model, at: [x, 0.02, z], rot: du * 5 + k, range: [3.4, 1.4] }); }
      hens++;
    }
    if (k % 6 === 3 && goats < 2) { for (const [model, du] of [['goat_white', 0], ['goat_black', 1.3]]) { const [x, z] = pt(l, W * 0.3 + du, -0.9); critters.push({ model, at: [x, 0.02, z], rot: 0.6 + du, range: [9, 3.2] }); } goats++; }
    if (k % 7 === 5 && geese < 2) { for (const [model, du] of [['goose_white', 0], ['goose_grey', 1.0], ['goose_white', 2.1]]) { const [x, z] = pt(l, W * 0.5 - side * (3 + du), -0.9); critters.push({ model, at: [x, 0.02, z], rot: du * 3, range: [3.4, 1.4] }); } geese++; }
  });
  // a figure-makers' yard on the walk: hens by the gate post, a dog under the shed's eaves
  const yardLot = lots().find((l) => l.trade === 'clay' && l.open && onWalk(l));
  if (yardLot) {
    const [x0, z0, x1, z1] = yardLot.rect, n = yardLot.front === 'n', W = x1 - x0, D = z1 - z0, at = (u, v) => [x0 + u, n ? z0 + v : z1 - v];
    for (const [model, u, v] of [['hen_brown', W - 3.0, 3.2], ['hen_white', W - 2.2, 3.9], ['rooster', W - 2.7, 4.6]]) { const [x, z] = at(u, v); critters.push({ model, at: [x, 0.02, z], rot: u, range: [3.4, 1.4] }); }
    const [dx, dz] = at(W - 3, D - 2.2); critters.push({ model: 'dog', at: [dx, 0.02, dz], rot: 2.4, range: [9, 3.5] });
  }
}
// nothing on the ground stands on the walking line itself (the street is 4 m wide and the walk keeps to its middle, animals lie by the fronts)
for (let i = critters.length - 1; i >= 0; i--) if (critters[i].model !== 'swallow_nest' && walkDistance([critters[i].at[0], critters[i].at[2]]) < 0.8) critters.splice(i, 1);
export default { fish, flights, perches, critters };
