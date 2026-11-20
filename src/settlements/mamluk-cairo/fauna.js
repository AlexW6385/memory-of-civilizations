// Mamluk Cairo — the animals (src/engine/fauna.js draws them; docs/settlements/mamluk-cairo.md §12): kites (drawn as crows)
// wheeling high over the lanes and the Citadel's spur, pigeons (drawn as sparrows) on the roofs and the Bayn's paving
// and the khan's court, swifts over the roofs at the evening, sparrows at the shop fronts and the fountains.
import { BAYN, KHAN, SQUARE, HAMMAM, CITADEL, SUQ, SUQ2, SUQ3, lanes, yards } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 5, loop: { c: [CITADEL.c[0], CITADEL.c[1]], a: [160, 110], rot: 0.3 }, y: [45, 120], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-150, -240], a: [110, 80], rot: 0 }, y: [30, 85], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-150, -230], a: [90, 60], rot: 0.5 }, y: [10, 40], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [0, 40], a: [100, 50], rot: 0 }, y: [14, 40], speed: 7 },
  { kind: 'swallow', n: 4, loop: { c: [-60, -150], a: [80, 40], rot: 0.8 }, y: [14, 40], speed: 7 },
];
const perches = [];
const spots = [[-160, -200], [-158, -250], [-152, -296], [-165, -290], [-125, -286], [-118, -280], [-132, -272], [-143, -150], [-40, -110], [-38, -30], [100, 20], [110, 60], [SQUARE[0] + 20, 40], [-38, 4], [-60, -120], [-140, -190], [-80, -192], [-66, -250]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// sparrows and pigeons along the lanes and in the yards, the dovecotes' flocks over the roofs
{ let i = 0; for (const l of lanes()) { if (l.kind !== 'lane') continue; for (let x = l.r[0] + 12; x < l.r[2] - 12; x += 55) { if (Math.hypot(x, l.r[1]) > 300 || (i++ % 2)) continue; const z = (l.r[1] + l.r[3]) / 2; perches.push({ kind: 'sparrow', x, z, y: 0, rot: (x * 5) % 3, range: [2.2, 1.4] }); } }
  for (const r of yards().filter((_, k) => k % 4 === 0)) { const x = (r[0] + r[2]) / 2, z = (r[1] + r[3]) / 2; if (Math.hypot(x, z) < 300) perches.push({ kind: 'sparrow', x, z, y: 0, rot: x % 3, range: [2, 2] }); } }
for (const c of [[-100, -60], [-220, -80], [-60, -330], [40, 200], [-250, 120]]) flights.push({ kind: 'swallow', n: 6, loop: { c, a: [35, 25], rot: c[0] * 0.01 }, y: [9, 18], speed: 6 });
void BAYN; void KHAN; void HAMMAM;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/mamluk-cairo.md §18.4) ──
// Cats on the mastabas of the covered streets (the cats of Cairo's markets, fed by the sellers), dogs asleep in the lanes' shade and at the
// portal, pigeons on the paving of the court, the Bayn and the khan, hens and a cock in the walled yards. None within the Rumayla (the arrival's
// budget; life.js has its dogs and pigeons there). [inferred; Lane, 1830s, for the dogs and cats of the streets and the pigeons of the roofs]
const critters = [];
const hash = (x, z, s = 0) => { const k = Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453; return k - Math.floor(k); };
for (const S of [SUQ, SUQ2, SUQ3]) {
  const D = (S[2] - S[0] - 5) / 2, n = Math.floor((S[3] - S[1]) / 3), w = (S[3] - S[1]) / n;
  for (let i = 1; i < n - 1; i++) {
    if (hash(S[0], i, 7) > 0.12) continue;
    const side = hash(S[0], i, 9) < 0.5 ? -1 : 1, x = side < 0 ? S[0] + D + 0.4 : S[2] - D - 0.4, z = S[1] + i * w + 0.7;
    critters.push({ model: hash(x, z) < 0.5 ? 'cat_tabby' : 'cat_orange', at: [x, 0.74, z], rot: side < 0 ? -Math.PI / 2 : Math.PI / 2, range: [7, 2.5] });
  }
}
for (const [x, z] of [[-158.6, -142], [-162.4, -101], [-90, -118.8], [20, -121], [-30.5, -3], [-150, -203], [-120, -285], [-61, -190]]) critters.push({ model: 'dog', at: [x, 0.04, z], rot: hash(x, z) * 6.28, range: [8, 3] });
for (const [x, z, n] of [[0, 40, 5], [-7, 47, 3], [-31, -1, 3], [-160, -240, 5], [-152, -270, 4], [-125, -286, 5], [-20, -121, 3]]) {
  for (let k = 0; k < n; k++) { const px = x + (hash(x + k, z) - 0.5) * 5, pz = z + (hash(x, z + k) - 0.5) * 4; critters.push({ model: ['pigeon_grey', 'pigeon_white', 'pigeon_dark', 'pigeon_grey'][k % 4], at: [px, 0.06, pz], rot: hash(pz, px) * 6.28, range: [2.4, 1.6] }); }
}
{ let k = 0; for (const r of yards()) {
    const x = (r[0] + r[2]) / 2, z = (r[1] + r[3]) / 2;
    if (Math.hypot(x, z) > 300 || Math.hypot(x - 116, z - 104) < 130 || hash(x, z, 3) > 0.12 || k >= 6) continue;
    k++;
    for (const [m, dx, dz, sz] of [['rooster', 0, 0, 1], ['hen_brown', 1.0, 0.7, 1], ['hen_white', -0.9, 0.9, 1], ['hen_brown', 0.4, -1.0, 0.96]]) critters.push({ model: m, at: [x + dx, 0.04, z + dz], rot: hash(x + dx, z) * 6.28, range: [3.4, 1.4], size: sz });
  } }
export default { fish, flights, perches, critters };
