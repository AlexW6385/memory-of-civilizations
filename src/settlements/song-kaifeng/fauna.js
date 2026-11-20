// Northern Song Bianjing — the animals (src/engine/fauna.js draws them; dossier §11): carp in the Bian,
// swallows over the river and the streets, tree sparrows on the paving, crows at twilight over the
// Kaibao monastery, little egrets and a grey heron on the banks. All places are derived from layout.js.
import { ground } from './ground.js';
import { RIVER, BRIDGE, STONE_BANK, MONASTERY, PAGODA, WALL_X, STREETS, RADIUS, lots, hotDist } from './layout.js';
import { shopElements } from './shops.js';
import { nearDoor } from './doors.js';

const mid = (RIVER.z0 + RIVER.z1) / 2, half = (RIVER.z1 - RIVER.z0) / 2;
/** Negative inside the water (the river's strip, but never in the bridge's abutments or under the wall's footing). */
const riverDist = (x, z) => Math.max(Math.abs(z - mid) - half, Math.abs(x) - (RADIUS - 40));
const X0 = WALL_X + 30, X1 = 250;

const fish = [];
// dark carp (the Bian's catch: carp, crucian) lazing in loose pairs along the river, clear of the arch's shadow
for (let k = 0; k < 7; k++) {
  const cx = X0 + (X1 - X0) * (k + 0.5) / 7;
  for (let i = 0; i < 2; i++) fish.push({ n: 2, size: [0.5, 0.8], palette: 'carp', y: RIVER.water, dist: riverDist, margin: 1.2, k: 1, rot: 0, area: [cx - 18, mid - 9, cx + 18, mid + 9], a: [14, 3.4], ratio: 0.25, minA: 1.5, speed: 0.3, rise: 0.15 });
}
// red carp near the stone landings
for (const x of [-60, 60]) fish.push({ n: 2, size: [0.5, 0.65], palette: 'redcarp', y: RIVER.water, dist: riverDist, margin: 1.4, area: [x - 12, mid - 12, x + 12, mid + 12], a: [12, 4], ratio: 0.4, speed: 0.35, rise: 0.4 });

const flights = [
  // swallows over the river, following the visitor along it, and over the main street
  { kind: 'swallow', n: 5, lane: { a: [X0, mid], b: [X1, mid] }, y: [-0.4, 3.0], speed: 9, a: [26, 8] },
  { kind: 'swallow', n: 3, lane: { a: [0, -200], b: [0, RIVER.z0 - 10] }, y: [1.5, 5], speed: 9, a: [26, 4] },
  { kind: 'swallow', n: 3, lane: { a: [0, RIVER.z1 + 10], b: [0, 200] }, y: [1.5, 5], speed: 9, a: [26, 4] },
  // swallows hawking round the Iron Pagoda's eaves, high in the monastery court
  { kind: 'swallow', n: 5, loop: { c: [PAGODA[0], PAGODA[1]], a: [17, 15], rot: 0.3 }, y: [9, 44], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [PAGODA[0], -140], a: [30, 18], rot: -0.2 }, y: [3, 12], speed: 9 },
  // crows over the monastery's trees at twilight
  { kind: 'crow', n: 8, loop: { c: [(MONASTERY[0] + MONASTERY[2]) / 2, (MONASTERY[1] + MONASTERY[3]) / 2], a: [60, 40], rot: 0.4 }, y: [34, 14], speed: 9 },
];
for (const f of flights) if (f.lane) f.a = f.a ?? [26, 3];

const perches = [];
// tree sparrows on the paving of the streets, hopping about a spot
const spots = [[-120, RIVER.z0 - 6], [-60, RIVER.z0 - 5], [-30, RIVER.z0 - 7], [30, RIVER.z0 - 5], [90, RIVER.z0 - 6], [150, RIVER.z0 - 7], [-100, RIVER.z1 + 6], [-40, RIVER.z1 + 7], [40, RIVER.z1 + 6], [110, RIVER.z1 + 5], [3, -40], [-3, -120], [3, 140], [-3, 170], [-200, -80], [-120, -80], [60, -80], [200, -80], [-100, 200], [100, 200]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: 0.3 + (x * 7 % 3), range: [1.4, 1.3] });
// the monastery's walls (3.6 m; the coping a little above)
for (const [x, z, rot] of [[MONASTERY[0] + 30, MONASTERY[1], 0], [MONASTERY[2] - 40, MONASTERY[1], 0], [MONASTERY[0], -190, Math.PI / 2], [MONASTERY[2], -200, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: 3.6 + 0.3, rot, range: [2.6, 0], alert: 5 });
// egrets and a heron on the earth banks beyond the stone facing, at the water's edge (where the bank's height meets
// the water level + 0.1), facing the water
const edge = (x, north) => { for (let d = 0; d < 8; d += 0.1) { const z = north ? RIVER.z0 - 4 + d : RIVER.z1 + 4 - d, h = ground.height(x, z); if (h <= RIVER.water + 0.15) return [z, h]; } return null; };
for (const [x, north, kind] of [[-150, true, 'egret'], [-180, false, 'egret'], [STONE_BANK + 50, false, 'heron'], [190, true, 'egret']]) {
  const e = edge(x, north); if (e) perches.push({ kind, x, z: e[0], y: e[1], rot: north ? Math.PI / 2 : -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
}
// tree sparrows on the monastery's court (the way in, the cross way, the pagoda's apron, the steps of the main hall) and on the pagoda's base, near where one arrives
for (const [dx, z] of [[-6, -128], [7, -136], [-14, -148], [14, -152], [-3, -165], [4, -172], [-9, -182], [10, -178], [-2, -208], [6, -214], [-12, -226], [12, -230]]) perches.push({ kind: 'sparrow', x: PAGODA[0] + dx, z, y: 0.05, rot: 0.7 + dx * 0.31, range: [1.6, 1.4], alert: 4 });
for (const dx of [-3.5, 3.5]) perches.push({ kind: 'sparrow', x: PAGODA[0] + dx, z: PAGODA[1] + 5.4, y: 1.25, rot: dx * 0.4, range: [1.2, 0.4], alert: 4 });
// doves (pigeons stand in as the sparrows' larger kin) are not drawn by the engine: crows on the roof ridges of the halls, at the day's end
for (const [x, z, rot] of [[MONASTERY[0] + 14, -185, Math.PI / 2], [MONASTERY[2] - 14, -185, Math.PI / 2]]) perches.push({ kind: 'crow', x, z, y: 5.9, rot, range: [0.8, 0], stay: [60, 200], gone: [60, 160], alert: 12 });
void BRIDGE; void STREETS;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §19.5) ──
// Placements are [inferred] from the scroll's animals (donkeys, oxen and camels are the street life's, street.js) and from what a Song town kept:
// dogs at the shop fronts, a cat on the pagoda's base, hens in the house yards, pigeons in the monastery court, geese on the bank, ducks and
// a cormorant fisher on the Bian.
const critters = [];
const at = (x, z, y = 0.04) => [x, y, z];
// a cat on the Iron Pagoda's base, on the south-east diagonal of its first terrace (1.2 m up), where one arrives
critters.push({ model: 'cat_tabby', at: [PAGODA[0] + 4.14, 1.2, PAGODA[1] + 4.14], rot: 0.6, range: [2.2, 1.6] });
// dogs lying at shop fronts nearest the visitor's walk: at the end of the front away from the sign pole, off the door's lane
{
  const near = shopElements().filter((e) => hotDist(e.at[0], e.at[1]) < 150 && e.L > 4.5)
    .sort((a, b) => hotDist(a.at[0], a.at[1]) - hotDist(b.at[0], b.at[1]));
  let n = 0;
  for (const e of near) {
    if (n >= 6) break;
    const c = Math.cos(e.rot), s = Math.sin(e.rot), lx = (e.poleX > 0 ? -1 : 1) * (e.L / 2 - 0.9), lz = 0.9;
    const x = e.at[0] + lx * c + lz * s, z = e.at[1] - lx * s + lz * c;
    if (nearDoor(x, z, 0.8) || Math.hypot(x - 160, z + 140) < 8) continue;
    critters.push({ model: n % 3 === 2 ? 'cat_orange' : 'dog', at: at(x, z), rot: e.rot + (n % 2 ? 0.5 : -0.5), range: [1.2, 0.5], tau: 40 });
    n++;
  }
}
// hens and a rooster before a house nearest the arrival's gate (the house's yard side, off its door)
{
  const h = lots().filter((l) => l.kind === 'house' && l.det >= 1 && hotDist((l.foot[0] + l.foot[2]) / 2, (l.foot[1] + l.foot[3]) / 2) < 140)
    .sort((a, b) => hotDist((a.foot[0] + a.foot[2]) / 2, (a.foot[1] + a.foot[3]) / 2) - hotDist((b.foot[0] + b.foot[2]) / 2, (b.foot[1] + b.foot[3]) / 2));
  for (const l of h.slice(0, 2)) {
    const [x0, z0, x1, z1] = l.foot, f = l.front, o = f === 's' ? [0, 1] : f === 'n' ? [0, -1] : f === 'e' ? [1, 0] : [-1, 0];
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2 * Math.abs(o[0]) + 0.1, hz = (z1 - z0) / 2 * Math.abs(o[1]) + 0.1;
    for (const [model, k, side] of [['rooster', 1.6, 1.9], ['hen_brown', 1.4, -2.0], ['hen_white', 2.1, 2.5]]) {
      const x = cx + o[0] * (hx + k) - o[1] * side, z = cz + o[1] * (hz + k) + o[0] * side;
      if (!nearDoor(x, z, 0.4)) critters.push({ model, at: at(x, z), rot: Math.atan2(o[0], o[1]) + side, range: [1.6, 1.0], tau: 20 });
    }
  }
}
// pigeons (the Kaibao monastery's doves) on the paving of the court and at the bridge's foot
[[-5, -120, 'grey'], [3, -125, 'white'], [-9, -131, 'grey'], [8, -138, 'dark'], [-11, -146, 'grey'], [11, -158, 'grey']].forEach(([dx, z, v], i) => critters.push({ model: 'pigeon_' + v, at: at(PAGODA[0] + dx, z, 0.075), rot: i * 1.9, range: [2.4, 1.6], tau: 10, speed: 0.33, stride: 0.1 }));
[[-7, 52, 'grey'], [6, 55, 'dark'], [-4, 100, 'grey'], [5, 103, 'white']].forEach(([x, z, v], i) => critters.push({ model: 'pigeon_' + v, at: at(x, z), rot: 0.8 + i * 1.7, range: [2.2, 1.4], tau: 10, speed: 0.33, stride: 0.1 }));
// geese on the earth strip of the north bank beyond the stone facing
for (const [model, x, z] of [['goose_white', -190, RIVER.z0 - 3.4], ['goose_white', -187, RIVER.z0 - 2.9], ['goose_grey', -184, RIVER.z0 - 3.6]]) critters.push({ model, at: [x, ground.height(x, z), z], rot: 1.6, range: [3, 1.0], tau: 16, speed: 0.4, stride: 0.34 });
// a raft of ducks on the Bian east of the bridge, near the north bank, and a second below the south bank
critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown', 'duck_white', 'duck_brown'], raft: true, area: [56, RIVER.z0 + 2.0, 84, RIVER.z0 + 3.6], dist: riverDist, a: [10, 0.9], ratio: 0.12, margin: 0.75, y: RIVER.water, speed: 0.18, cycle: [26, 34] });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown'], raft: true, area: [-90, RIVER.z1 - 4.2, -60, RIVER.z1 - 2.6], dist: riverDist, a: [10, 0.9], ratio: 0.12, margin: 0.75, y: RIVER.water, speed: 0.16, cycle: [28, 36] });
// a fisherman's punt tied under the north bank with cormorants on its rails
{
  const bx = -48, bz = RIVER.z0 + 2.2, by = RIVER.water;
  critters.push({ model: 'fishing_craft', at: [bx, by, bz], rot: 0 });
  [[-1.0, -1], [0.1, 1], [1.05, -1]].forEach(([u, sd], i) => critters.push({ model: 'cormorant', at: [bx + u, by + 0.296, bz + sd * 0.29], rot: sd * (Math.PI / 2) + (i - 1) * 0.25, cycle: 46 + 7 * i }));
}

export default { fish, flights, perches, critters };
