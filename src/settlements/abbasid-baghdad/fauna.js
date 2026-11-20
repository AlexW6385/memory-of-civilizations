// Abbasid Baghdad — the animals (src/engine/fauna.js draws them; docs/settlements/abbasid-baghdad.md §10): carp and barbel in the Tigris and the
// canal, swallows and swifts over the river and the esplanade, kites (crows stand in) over the walls, sparrows on the suq rows and the quays,
// egrets at the reeds of the river bank.
import { KHAN_RECT, HAMMAM_RECT, RIVER, CANAL, WATER, MOSQUE, LIBRARY, ALL_SUQS as SUQS, CANAL_BRIDGES, C, JETTIES, jettyAt, riverX, canalEnd, inLot, inRect, AVENUES, ROADS_IN, ROADS_OUT } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (let z = -440; z <= 440; z += 110) {
  const xr = riverX(z), edge = (x) => RIVER.w / 2 - Math.abs(x - xr);
  fish.push({ n: 4, size: [0.4, 0.9], palette: 'carp', y: RIVER.water, area: [xr - 38, z - 30, xr + 38, z + 30], dist: (x) => edge(x), margin: 8, a: [20, 12], ratio: 0.4, speed: 0.45, rise: 0.1, tries: 1 });
}
fish.push({ n: 3, size: [0.3, 0.6], palette: 'carp', y: CANAL.water, area: [-300, CANAL.z - 5, canalEnd() - 20, CANAL.z + 5], dist: (x, z) => CANAL.w / 2 - Math.abs(z - CANAL.z), margin: 2, a: [20, 2.5], ratio: 0.2, speed: 0.4, rise: 0.1, tries: 1 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [325, -60], a: [70, 160], rot: 0 }, y: [1, 10], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [C[0], C[1]], a: [120, 120], rot: 0.4 }, y: [10, 38], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-150, CANAL.z], a: [150, 12], rot: 0 }, y: [1, 6], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-48, 334], a: [30, 30], rot: 0.3 }, y: [8, 22], speed: 9 },
  { kind: 'crow', n: 7, loop: { c: [C[0], C[1]], a: [200, 180], rot: 0.5 }, y: [50, 90], speed: 8 },
];
const perches = [];
for (const s of SUQS) perches.push({ kind: 'sparrow', x: (s.rect[0] + s.rect[2]) / 2, z: s.rect[1] + 3, y: 4.9, rot: 0, range: [2, 2] });
for (const [x, z] of [[(KHAN_RECT[0] + KHAN_RECT[2]) / 2, KHAN_RECT[1] + 20], [(KHAN_RECT[0] + KHAN_RECT[2]) / 2 + 9, KHAN_RECT[1] + 12], [(HAMMAM_RECT[0] + HAMMAM_RECT[2]) / 2, HAMMAM_RECT[1] + 4]]) perches.push({ kind: 'sparrow', x, z, y: 6.9, rot: 0.5, range: [2, 2] });
for (const j of JETTIES.slice(0, 6)) { const J = jettyAt(j); perches.push({ kind: 'sparrow', x: J.a[0] + J.dir * 14, z: j.z + 1.0, y: -0.1, rot: 1.0, range: [2, 1.6] }); }
for (const z of [-200, -20, 150, 330]) { const x = riverX(z) - RIVER.w / 2 - 1.5; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [60, 220], gone: [40, 150], alert: 10 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/abbasid-baghdad.md §17) ──
// Cats on the pavement of the suq rows (the cats of the markets, fed by the sellers), dogs of the quarters asleep at the street edges and the
// quays, pigeons on the paving of the mosque's court, the library's court, the khan and the esplanade, ducks on the Isa canal and along the
// Tigris's bank, kingfishers fishing the canal, goats at the Karkh crossing's sheep market and at the khan's stable. None stands on the
// middle of the gate roads, where the visitor walks, or in a house. [inferred; the sheep market is stated (Karkh), the animals are the
// common animals of a Mesopotamian town]
const critters = [];
const hash = (x, z, s = 0) => { const k = Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453; return k - Math.floor(k); };
const roads = [...AVENUES, ...ROADS_IN, ...ROADS_OUT];
/** Clear of the houses, the walk's lane (the middle of a road, the middle of the esplanade's south road) and the water. */
const clear = (x, z, m = 1.5) => !inLot(x, z, m) && !roads.some((r) => { const h = r[2] - r[0] > r[3] - r[1], c = h ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2; return inRect(r, x, z) && Math.abs((h ? z : x) - c) < 3.2; }) && !(Math.abs(x - C[0]) < 3.5 && z > C[1] + 20 && z < C[1] + 160) && ground.height(x, z) > -0.05;
/** n free spots near (cx, cz), by the hash of the start. */
const spots = (cx, cz, n, spread, seed = 0) => { const out = []; for (let k = 0; k < 60 && out.length < n; k++) { const x = cx + (hash(cx + k, cz, seed) - 0.5) * 2 * spread, z = cz + (hash(cx, cz + k, seed + 1) - 0.5) * 2 * spread; if (clear(x, z, 2.5) && !SUQS.some((s) => inRect(s.rect, x, z, 1)) && out.every((q) => Math.hypot(q[0] - x, q[1] - z) > 1.2)) out.push([x, z]); } return out; };
// cats: on the pavement at the foot of the piers of some suq bays (never the middle of the street)
for (const S of SUQS) {
  const horiz = S.rect[2] - S.rect[0] > S.rect[3] - S.rect[1], L = horiz ? S.rect[2] - S.rect[0] : S.rect[3] - S.rect[1], nb = Math.max(1, Math.floor((L - 4) / 3.2)), bw = (L - 4) / nb;
  for (let k = 1; k < nb - 1; k++) {
    if (hash(S.rect[0], S.rect[1], k) > 0.16) continue;
    const side = hash(S.rect[1], k, 5) < 0.5 ? -1 : 1, u = 2 + (k + 0.15) * bw, x = horiz ? S.rect[0] + u : (S.rect[0] + S.rect[2]) / 2 + side * 2.4, z = horiz ? (S.rect[1] + S.rect[3]) / 2 + side * 2.4 : S.rect[1] + u;
    critters.push({ model: hash(x, z) < 0.5 ? 'cat_tabby' : 'cat_orange', at: [x, 0.03, z], rot: hash(z, x) * 6.28, range: [7, 2.5] });
  }
}
// dogs asleep at the edges of the roads between the rings and the canal's quays, in the lee of a wall
for (const [x, z] of [[C[0] + 5.2, C[1] + 190], [C[0] - 5.4, C[1] - 190], [C[0] + 190, C[1] + 5.6], [C[0] - 190, C[1] - 5.6], [C[0] + 5.4, C[1] + 292], [-250, CANAL.z - 11], [-150, CANAL.z + 11], [60, CANAL.z - 11], [C[0] - 40, 352]]) if (clear(x, z, 1)) critters.push({ model: 'dog', at: [x, 0.03, z], rot: hash(x, z) * 6.28, range: [8, 3] });
// pigeons on the ground: the mosque's sahn, the library's court, the khan's court, the esplanade by the palace wall, the crossing of Karkh
for (const [x, z, n] of [[(MOSQUE[0] + MOSQUE[2]) / 2 + 6, (MOSQUE[1] + MOSQUE[3]) / 2 - 12, 6], [(LIBRARY[0] + LIBRARY[2]) / 2 + 4, (LIBRARY[1] + LIBRARY[3]) / 2 + 6, 5], [(KHAN_RECT[0] + KHAN_RECT[2]) / 2 + 7, (KHAN_RECT[1] + KHAN_RECT[3]) / 2 - 6, 5], [C[0] + 18, C[1] + 50, 5], [C[0] - 22, C[1] + 56, 4], [-100, 372, 4]]) {
  for (let k = 0; k < n; k++) { const px = x + (hash(x + k, z) - 0.5) * 5, pz = z + (hash(x, z + k) - 0.5) * 4; critters.push({ model: ['pigeon_grey', 'pigeon_white', 'pigeon_dark', 'pigeon_grey'][k % 4], at: [px, 0.06, pz], rot: hash(pz, px) * 6.28, range: [2.4, 1.6] }); }
}
// ducks on the Isa canal between its bridges, and on the Tigris along the west bank between the jetties
for (const [a, b] of [[-230, -125], [-95, 25], [55, 155]]) if (CANAL_BRIDGES.length) critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown'], area: [a, CANAL.z - 5, b, CANAL.z + 5], dist: (x, z) => Math.abs(z - CANAL.z) - CANAL.w / 2, a: [6, 2.2], ratio: 0.3, margin: 1.2, y: WATER, speed: 0.25, cycle: [18, 24] });
for (const z of [-90, 20, 110, 200]) critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown', 'duck_brown'], area: [riverX(z) - RIVER.w / 2, z - 12, riverX(z) - RIVER.w / 2 + 14, z + 12], dist: (x, zz) => Math.abs(x - riverX(zz)) - (RIVER.w / 2 - 1), a: [8, 6], ratio: 0.5, margin: 2, y: WATER, speed: 0.22, cycle: [18, 24] });
// kingfishers on the canal's north bank, fishing it
for (const x of [-205, -75, 110]) { const z = CANAL.z - CANAL.w / 2 - 0.4; critters.push({ model: 'kingfisher', at: [x, Math.max(ground.height(x, z), -0.3) + 0.05, z], rot: Math.PI / 2, water: [x, CANAL.z - CANAL.w / 2 + 1.4, WATER], cycle: 33 + (x % 7) }); }
// goats and sheep (white goats stand for them) at the sheep market, Karkh's crossing, and at the khan's stable; a black goat among them
for (const [cx, cz, n] of [[-60, 366, 4], [30, 366, 3], [KHAN_RECT[0] - 8, KHAN_RECT[3] + 6, 3]]) spots(cx, cz, n, 9, 3).forEach(([x, z], i) => critters.push({ model: i % 3 === 2 ? 'goat_black' : 'goat_white', at: [x, 0.05, z], rot: hash(x, z) * 6.28, range: [9, 3.2] }));
export default { fish, flights, perches, critters };
