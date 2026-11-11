// Northern Song Bianjing — the animals (src/engine/fauna.js draws them; dossier §11): carp in the Bian,
// swallows over the river and the streets, tree sparrows on the paving, crows at twilight over the
// Kaibao monastery, little egrets and a grey heron on the banks. All places are derived from layout.js.
import { ground } from './ground.js';
import { RIVER, BRIDGE, STONE_BANK, MONASTERY, PAGODA, WALL_X, STREETS, RADIUS } from './layout.js';

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
void BRIDGE; void STREETS; void PAGODA;
export default { fish, flights, perches };
