// Conques about 1120 — the animals (src/engine/fauna.js draws them): swallows and house martins over the roofs and
// the lanes, crows and choughs about the church's roofs and the gorge at twilight, house sparrows on the cobbles of the
// lanes and the abbey's square, a grey heron and a little egret on the Dourdou's bank, dark trout in the river.
import { ABBEY, RIVER, RADIUS, BAND, STAIRS, BRIDGE, HOSTEL, lanes, laneZ, inRiver, lots, gardens, level, bandZ } from './layout.js';
import { shopPoint, doorU } from '../../styles/romanesque/village.js';
import { ground } from './ground.js';

const rz = (x) => RIVER.z + 14 * Math.sin(x / 90);
const riverDist = (x, z) => Math.max(0, RIVER.w / 2 - 2 - Math.abs(z - rz(x)));
const fish = [];
for (let i = 0; i < 4; i++) fish.push({ n: 2, size: [0.3, 0.45], palette: 'carp', y: RIVER.level - 0.5, area: [-120 + i * 55, rz(-120 + i * 55) - 3, -80 + i * 55, rz(-80 + i * 55) + 3], dist: riverDist, margin: 1.2, a: [14, 2.4], ratio: 0.15, minA: 1.5, speed: 0.4, rise: 0 });

const flights = [
  { kind: 'swallow', n: 4, loop: { c: [ABBEY.origin[0] + 10, 0], a: [60, 40], rot: 0.2 }, y: [14, 6], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-70, 60], a: [40, 24], rot: 0.5 }, y: [9, 4], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [ABBEY.origin[0] + 36, 0], a: [34, 26], rot: 0.5 }, y: [32, 14], speed: 8 },
];
const perches = [];
// crows on the ridge of the nave and the gables of the west front
for (const [lx, lz] of [[12, 0], [22, 0], [-0.3, 0], [34, 0]]) perches.push({ kind: 'crow', x: ABBEY.origin[0] + lx, z: lz, y: 27.6, rot: Math.PI / 2, range: [1.2, 0], alert: 12 });
// house sparrows on the cobbles of the lanes and the square
{
  let k = 0;
  for (const l of lanes()) for (let x = l.x0 + 10; x < l.x1 - 6; x += 21) {
    const px = x + (k % 4) * 3, pz = l.z + ((k * 7) % 5 - 2) * 0.25;
    if (Math.hypot(px, pz) > RADIUS - 150) { k++; continue; }
    perches.push({ kind: 'sparrow', x: px, z: pz, y: ground.height(px, pz), rot: 0.4 + (k % 7) * 0.8, range: [1.4, 1.1] }); k++;
  }
}
for (const [x, z] of [[-36, -10], [-33, 20], [-40, 34], [-25, 40]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: x % 3, range: [1.8, 1.5] });
// the grey heron and a little egret on the Dourdou's bank
for (const [x, kind] of [[-30, 'heron'], [40, 'egret']]) {
  const z = rz(x) - RIVER.w / 2 - 1.2;
  if (!inRiver(x, z)) perches.push({ kind, x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
}
void laneZ;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §20.4) ──
// What lived in a village of the Rouergue about 1120: dogs lying at the doors, cats on the copings of the retaining walls (mousers of the granaries and the
// abbey's stores), hens and a cock in the yards of the outer houses, geese on the Dourdou's bank at the washing-place, pigeons on the abbey's terrace (the
// abbey kept a dovecote [inferred]), and the swallows' mud nests under the eaves of the open houses on the pilgrims' way. [inferred throughout, from the
// dossier's townscape; no Conques source lists its animals]
const critters = [];
const rnd = (a, b, c = 0) => { const k = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return k - Math.floor(k); };   // (a place's own number: no counters, no Math.random)
const AX = -47, AZ = 12;
const frame = (l) => {
  const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n';
  return { P: (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]), L: along ? x1 - x0 : z1 - z0 };
};
/** u along a lot's front, as far as can be from the way in (the door, the shop's arch), for an animal to lie at. */
const awayU = (l) => {
  const { L } = frame(l), doors = l.shop ? [shopPoint(l).a0, L - shopPoint(l).a0] : l.hostel ? [L / 2] : [doorU(l).du];
  let best = 0.8, bd = -1;
  for (let u = 0.8; u <= L - 0.8; u += 0.4) { const d = Math.min(...doors.map((q) => Math.abs(u - q))); if (d > bd) { bd = d; best = u; } }
  return bd > 1.6 ? best : null;
};
const near = lots().filter((l) => (l.open || l.shop) && (l.front === 's' || l.front === 'n')).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - AX, (a.rect[1] + a.rect[3]) / 2 - AZ) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - AX, (b.rect[1] + b.rect[3]) / 2 - AZ));
// dogs lying at the doors of five houses of the way, cats on the sills' steps of four others
{ let nd = 0, nc = 0;
  for (const l of near) {
    if (nd >= 5 && nc >= 4) break;
    const u = awayU(l); if (u === null) continue;
    const { P } = frame(l), [x, z] = P(u, -0.8);
    if (nd < 5 && (l.seed % 3 !== 0 || nc >= 4)) { critters.push({ model: 'dog', at: [x, ground.height(x, z) + 0.02, z], rot: rnd(x, z) * 6.28, range: [9, 3.5] }); nd++; }
    else if (nc < 4) { critters.push({ model: l.seed % 2 ? 'cat_tabby' : 'cat_orange', at: [x, ground.height(x, z) + 0.05, z], rot: rnd(x, z, 1) * 6.28, range: [7, 2.5] }); nc++; }
  } }
// cats on the copings of the retaining walls of the shelves (as the life pass has them sit; these have their own rig), between the stair streets
for (let k = 1; k + 1 < BAND.n; k += 3) {
  const zm = bandZ(k) + (BAND.wall[0] + BAND.wall[1]) / 2;
  for (const x0 of [-62, -22, 30]) { const x = x0 + rnd(x0, k) * 8; if (STAIRS.some((s) => Math.abs(s - x) < 5) || Math.hypot(x, zm) > 100 || (zm > -50 && zm < 75 && x > -64 && x < 74)) continue; critters.push({ model: rnd(x, zm, 2) < 0.5 ? 'cat_tabby' : 'cat_orange', at: [x, level(k) + 0.14, zm], rot: rnd(x, zm, 3) * 6.28, range: [7, 2.5] }); }
}
// hens and a cock in the yards of the outer houses (the kitchen gardens of the pens are the sheep's), scratching
{ let n = 0;
  for (const g of gardens()) {
    const cx = (g.rect[0] + g.rect[2]) / 2, cz = (g.rect[1] + g.rect[3]) / 2, w = g.rect[2] - g.rect[0];
    if (((g.seed >>> 3) % 4) === 3 || w < 4.4 || Math.hypot(cx - AX, cz - AZ) > 130 || n >= 9 || (g.seed >>> 5) % 3) continue;
    const y = ground.height(cx, cz);
    critters.push({ model: 'rooster', at: [cx - 0.8, y, cz], rot: rnd(cx, cz) * 6.28, range: [1.8, 1.4] }, { model: 'hen_brown', at: [cx + 0.6, y, cz + 0.5], rot: rnd(cx, cz, 4) * 6.28, range: [1.8, 1.4] }, { model: n % 2 ? 'hen_white' : 'hen_brown', at: [cx + 1.3, y, cz - 0.4], rot: rnd(cx, cz, 5) * 6.28, range: [1.8, 1.4] });
    n++;
  } }
// the abbey's terrace: pigeons on the flags before the west front and by the Plò
for (const [x, z, m] of [[-31, -4, 'pigeon_grey'], [-30, -3, 'pigeon_white'], [-32.2, -2.4, 'pigeon_grey'], [-36, 22, 'pigeon_grey'], [-35, 23, 'pigeon_dark'], [-44, -18, 'pigeon_grey'], [-45.2, -17, 'pigeon_white']]) critters.push({ model: m, at: [x, 0.02, z], rot: rnd(x, z) * 6.28, range: [1.4, 1.2] });
// geese on the Dourdou's bank at the washing-place by the bridge
{ const rz0 = RIVER.z + 14 * Math.sin(BRIDGE.x / 90);
  for (const [dx, m] of [[12, 'goose_white'], [13.4, 'goose_grey'], [14.5, 'goose_white']]) { const x = BRIDGE.x + dx, z = rz0 - RIVER.w / 2 - 1.5; if (!inRiver(x, z)) critters.push({ model: m, at: [x, ground.height(x, z), z], rot: rnd(x, z) * 6.28, range: [2.6, 1.6] }); } }
// the hostel's door: a dog by the bench (the pilgrims' own), hens under the donkeys' feet
{ const hx = HOSTEL.rect[0] + 7.5, hz = HOSTEL.rect[3] + 1.0, y = level(6); critters.push({ model: 'dog', at: [hx, y + 0.02, hz], rot: 2.1, range: [9, 3.5] }, { model: 'hen_brown', at: [hx + 3, y, hz + 0.6], rot: 1, range: [1.8, 1.4] }); }
// the swallows' mud nests under the eaves of up to eight of the open houses on the way, away from the doors
{ let k = 0;
  for (const l of near) {
    if (k > 7) break;
    const { L } = frame(l), u = awayU(l); if (u === null || L < 5) continue;
    const sg = l.front === 's' ? 1 : -1, fz = l.front === 's' ? l.rect[3] : l.rect[1], x = l.front === 's' ? l.rect[2] - u : l.rect[0] + u, ytop = l.y + l.G + (l.storeys - 1) * l.G2;
    if (critters.some((c) => c.model === 'swallow_nest' && Math.abs(c.at[0] - x) < 9 && Math.abs(c.at[2] - fz) < 9)) continue;
    critters.push({ model: 'swallow_nest', at: [x, ytop - 0.4, fz + sg * 0.14], rot: l.front === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
  } }
export default { fish, flights, perches, critters };
