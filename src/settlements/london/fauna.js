// Victorian London — the animals (src/engine/fauna.js draws them; docs/settlements/london.md §7): house sparrows on the paving of the
// streets and squares and the embankment parapet, rooks (the crows' stand-in) over the Abbey and Parliament Square at dusk, swifts
// (the swallows' stand-in) over the Thames and the streets in summer, and a grey heron on the mud of the Lambeth shore at low tide.
import { ABBEY, SQUARE, GROUND, RIVER, BRIDGE, SQ, bank, height, streetsZ, crossX, inLot, blocked, lots } from './layout.js';
import { openSet, mirrors } from './open.js';
import { nightSites } from './town.js';
import { cagedAt, CAGE } from '../../styles/victorian/letters.js';

const mid = (z) => { const [a, b] = bank(z); return (a + b) / 2; };
const flights = [
  { kind: 'crow', n: 7, loop: { c: [(ABBEY[0] + ABBEY[2]) / 2, (ABBEY[1] + ABBEY[3]) / 2], a: [46, 26], rot: 0.3 }, y: [34, 14], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [(SQUARE[0] + SQUARE[2]) / 2, (SQUARE[1] + SQUARE[3]) / 2], a: [34, 22], rot: 1.1 }, y: [26, 12], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [mid(-250), -250], b: [mid(250), 250] }, y: [-0.5, 5], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [mid(-60) + 25, -60], b: [mid(160) + 25, 160] }, y: [-0.5, 5], speed: 9 },
];
// gulls over the Thames above the bridge and the palace's river front (the river's winter gulls followed the barges' refuse)
flights.push({ kind: 'gull', n: 6, loop: { c: [mid(-110) + 5, -110], a: [38, 22], rot: 0.2 }, y: [4, 10], speed: 7 }, { kind: 'gull', n: 4, lane: { a: [mid(-250), -250], b: [mid(-60), -60] }, y: [0.5, 5], speed: 6 });
flights[2].a = flights[3].a = [30, 4];
const perches = [];
// house sparrows hopping on the paving along the streets near the arrival: a place at the kerb of each of some streets
let sd = 1870; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
for (const zc of streetsZ()) {
  if (Math.abs(zc - BRIDGE.z) > 150) continue;
  for (let x = -230 + rand() * 40; x < 230; x += 38 + rand() * 40) {
    const z = zc + (rand() < 0.5 ? -1 : 1) * 2.2;
    if (blocked(x, z, -1) || inLot(x, z, 1) || crossX().some((c) => Math.abs(c - x) < 5)) continue;
    perches.push({ kind: 'sparrow', x, z, y: GROUND, rot: rand() * 3, range: [1.4, 1.3] });
  }
}
// pigeons on the bridge's parapet and the pavement of Bridge Street, sparrows by the lamp-posts of the deck
for (const [x, z] of [[205, BRIDGE.z - 6.8], [196, BRIDGE.z + 6.9], [170, BRIDGE.z - 6.7], [120, BRIDGE.z + 6.8], [75, BRIDGE.z - 6.9]]) perches.push({ kind: 'pigeon', x, z, y: GROUND + 0.4, rot: x, range: [1.8, 0.6] });
for (const [x, z] of [[-30, -190], [10, -160], [-45, -170], [20, -200]]) perches.push({ kind: 'sparrow', x, z, y: GROUND, rot: x, range: [1.6, 1.4] });
// the grey heron on the Thames mud under the Lambeth embankment, facing the water
{ const z = 40, x = bank(z)[1] - 3.4; perches.push({ kind: 'heron', x, z, y: Math.max(height(x, z), RIVER.level + 0.05), rot: Math.PI, stay: [80, 240], gone: [60, 180], alert: 12 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/london.md §10.3) ──
const critters = [];
const hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
const HOME = [200, -170];
// pigeons on the south footway of the bridge by the arrival, among the passers-by's crumbs [inferred: town pigeons, usual in 19th-century views]
[[188, 0.2, 'grey'], [191.5, -0.2, 'grey'], [195, 0.15, 'white'], [208, 0.2, 'grey'], [212.5, -0.15, 'dark'], [216, 0.1, 'grey']].forEach(([x, dz, v], i) => critters.push({ model: 'pigeon_' + v, at: [x, GROUND + 0.55, BRIDGE.z + 6.4 + dz], rot: i * 1.9, range: [1.3, 1.0], tau: 9 + (i % 4), speed: 0.34, stride: 0.1, size: 0.97 + 0.05 * (i % 3) }));
// pigeons on the paving where the walks of Parliament Square cross, round the benches [inferred]
[[-13.5, -179.2, 'grey'], [-11.2, -180.8, 'grey'], [-8.5, -179.4, 'white'], [-6.4, -180.7, 'grey'], [-10.4, -183.4, 'dark'], [-9.6, -176.8, 'grey'], [-14.6, -181.6, 'grey'], [-7.2, -178.2, 'grey']]
  .forEach(([x, z, v], i) => critters.push({ model: 'pigeon_' + v, at: [x, GROUND, z], rot: 0.8 + i * 1.7, range: [2.4, 1.6], tau: 10, speed: 0.33, stride: 0.1 }));
void SQ;
{
  // the shops that are open: their cats (the butcher's and baker's mousers, the pub's) on the pavement before the door, and a songbird's cage under some fascias
  const all = lots(); mirrors(all);
  const here = [...openSet(all)].filter((l) => l.shop || l.pub).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - HOME[0], (a.rect[1] + a.rect[3]) / 2 - HOME[1]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - HOME[0], (b.rect[1] + b.rect[3]) / 2 - HOME[1]));
  let cats = 0, dogs = 0;
  for (const l of here) {
    const [x0, z0, x1, z1] = l.rect, sg = l.front === 's' ? 1 : -1, zf = sg > 0 ? z1 : z0, w = x1 - x0;
    if (l.shop && cagedAt({ ...l, open: true })) critters.push({ model: 'cagebird', at: [x0 + w * CAGE.u, l.y + CAGE.h, zf + sg * CAGE.d], rot: Math.PI / 2 });
    if (cats < 6 && (l.pub || l.trade === 'butcher' || l.trade === 'baker')) {
      critters.push({ model: cats % 2 ? 'cat_orange' : 'cat_tabby', at: [x0 + w * (0.3 + 0.4 * hashAt(l.seed, 1)), l.y + 0.02, zf + sg * 0.95], rot: sg > 0 ? 0.5 : Math.PI + 0.5, range: [7, 2.5] });
      cats++;
    }
    if (dogs < 2 && l.pub) { critters.push({ model: 'dog', at: [l.corner === 'e' ? x1 - 0.8 : x0 + 0.8, l.y + 0.02, zf + sg * 1.5], rot: sg > 0 ? 1.2 : -1.9, range: [9, 3.5] }); dogs++; }
  }
}
// the knife-grinder's terrier at his barrow on the Lambeth end of Bridge Street, and the costers' dogs under the nearest stalls [inferred; the dossier's §10.3]
critters.push({ model: 'dog', at: [284.4, GROUND + 0.02, BRIDGE.z + 6.9], rot: 0.4, range: [9, 3.5] });
for (const [x, z] of nightSites().stalls.filter(([x]) => Math.abs(x - HOME[0]) < 190).sort((a, b) => Math.hypot(a[0] - HOME[0], a[1] - HOME[1]) - Math.hypot(b[0] - HOME[0], b[1] - HOME[1])).slice(0, 2)) if (!blocked(x + 1.8, z, -1) && !inLot(x + 1.8, z, 1)) critters.push({ model: 'dog', at: [x + 1.8, GROUND + 0.02, z + 0.4], rot: hashAt(x, z) * 6, range: [9, 3.5] });

export default { fish: [], flights, perches, critters };
