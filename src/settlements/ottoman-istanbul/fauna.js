// Ottoman Istanbul about 1560 — the animals (src/engine/fauna.js draws them; docs/settlements/ottoman-istanbul.md §12): swallows
// and swifts over the roofs and domes (common over the city in summer), crows over the terrace and the cemetery's
// cypresses, sparrows on the paving of the avenues, the outer court and the market lanes. (Gulls and pigeons, so
// characteristic of Istanbul, are not among the engine's birds; the soundscape has the gulls.)
import { PRECINCT, CARSI, TERRACE, TOP, MESCIT, IMARET, lanes, laneAt, height, yardItems } from './layout.js';

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, -30], a: [70, 60], rot: 0.3 }, y: [TOP + 14, TOP + 40], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-120, 60], a: [40, 30], rot: -0.4 }, y: [TOP + 8, TOP + 24], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [115, 20], a: [40, 40], rot: 0.5 }, y: [TOP + 8, TOP + 24], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [20, 70], a: [60, 28], rot: 0.1 }, y: [TOP + 30, TOP + 14], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-190, -60], a: [50, 40], rot: 0.7 }, y: [TOP + 6, TOP + 22], speed: 9 },
];
// swallows and swifts along the lanes of the timber quarter, low, following the visitor
for (const x of [-185, -100, 100, 185]) flights.push({ kind: 'swallow', n: 3, lane: { a: [x, -330], b: [x, 330] }, y: [4, 14], speed: 8 });
const perches = [];
// sparrows hopping on the paving: the avenues, the forecourt, the market's lanes and before its west gate
for (const [x, z] of [[-84, -75], [84, -75], [-84, 30], [84, 30], [-30, PRECINCT[1] - 6], [30, PRECINCT[1] - 8], [-50, PRECINCT[3] + 8], [30, PRECINCT[3] + 9], [-105, CARSI.lanes[0].c], [-100, CARSI.lanes[0].c + 0.6], [30, CARSI.lanes[1].c], [40, CARSI.lanes[1].c - 0.6], [-120, 118], [15, 118]])
  perches.push({ kind: 'sparrow', x, z, y: TOP + 0.04, rot: 0.3 + (x * 7 % 3), range: [1.6, 1.3] });
// on the copings of the outer court's wall (4 m up) and the bedesten's cornice
for (const [x, z, rot] of [[-30, PRECINCT[1] + 0.6, 0], [30, PRECINCT[1] + 0.6, 0], [PRECINCT[0] + 0.6, -40, Math.PI / 2], [PRECINCT[2] - 0.6, 10, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: TOP + 4.02, rot, range: [2.4, 0], alert: 5 });
// sparrows on the cobbles of the lanes nearest the terrace and on the mescit's portico
for (const [x, z] of [[-168, -60], [-168, 70], [168, -60], [168, 70], [-80, -112.5], [80, -112.5], [0, -112.5], [-40, 154], [40, 154], [-148, -76.5], [150, 112]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.04, rot: 0.4 + (x * 7 % 3), range: [1.6, 1.3] });
perches.push({ kind: 'sparrow', x: MESCIT.rect[0] + 3, z: MESCIT.rect[1] + 1.4, y: TOP + 0.14, rot: 0, range: [2, 0.6] });
void TERRACE; void lanes;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §21) ──
// Cats and dogs lived in the streets and courts (the cats fed on the garden walls and by the kitchens, the dogs by the meat-sellers' rounds); hens
// in the yards of the houses [inferred]. All on the ground and off the ways walked (the benches' sides, the lane's edge, the yard's coop).
const critters = [];
const hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
const MODEL = (x, z, a, b) => (hashAt(x, z) < 0.5 ? a : b);
// the outer court: a cat by each of the two marble benches nearest the arrival, one at the soup kitchen's back (where the kitchen's scraps go), one at the tomb garden's gate
for (const [x, z] of [[14.3, -78], [-14.3, -63.5], [IMARET[0] - 1.2, IMARET[1] + 30], [-11, PRECINCT[3] - 22]]) critters.push({ model: MODEL(x, z, 'cat_tabby', 'cat_orange'), at: [x, TOP + 0.03, z], rot: hashAt(z, x) * 6.28, range: [7, 2.5] });
// the lanes nearest the terrace: cats on the lane's edge, a dog asleep at the corner of the lane below the gate
const edge = (z0, x, off) => [x, z0 + off];
{
  const hl = lanes().filter((l) => !l.vert && l.r[1] < TERRACE[1] - 1 && l.r[1] > TERRACE[1] - 90).sort((a, b) => b.r[1] - a.r[1])[0];
  if (hl) {
    const z0 = hl.r[1];
    for (const [x, off, dog] of [[-34, 0.55, false], [47, 0.6, false], [-6, 0.55, true], [88, 0.6, true]]) {
      const [px, pz] = edge(z0, x, off);
      if (!laneAt(px, pz)) continue;
      critters.push(dog ? { model: 'dog', at: [px, height(px, pz) + 0.04, pz], rot: hashAt(px, pz) * 6.28, range: [9, 3.5] } : { model: MODEL(px, pz, 'cat_orange', 'cat_tabby'), at: [px, height(px, pz) + 0.04, pz], rot: hashAt(pz, px) * 6.28, range: [7, 2.5] });
    }
  }
}
// hens (a rooster with them) by the coops of the three yards nearest the arrival
{
  const coops = [];
  for (const y of yardItems()) for (const it of y.items) if (it.k === 'coop') coops.push({ ...it, mid: (y.rect[0] + y.rect[2]) / 2 });
  coops.sort((a, b) => Math.hypot(a.at[0], a.at[1] + 91) - Math.hypot(b.at[0], b.at[1] + 91));
  for (const c of coops.slice(0, 3)) {
    const [cx, cz] = c.at, side = c.mid > cx ? 1 : -1;     // toward the middle of the yard
    [['rooster', 3.0 * side, 0.5], ['hen_brown', 3.4 * side, -0.7], ['hen_white', 2.8 * side, -1.1], ['hen_brown', 3.6 * side, 0.9]].forEach(([model, dx, dz], i) => {
      const x = cx + dx, z = cz + dz;
      critters.push({ model, at: [x, height(x, z) + 0.02, z], rot: hashAt(x, z) * 6.28, range: [1.3, 1.0], size: 0.96 + 0.04 * (i % 2) });
    });
  }
}
export default { fish: [], flights, perches, critters };
