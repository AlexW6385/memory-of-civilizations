// Barcelona about 1910 — the animals (src/engine/fauna.js draws them; docs/settlements/barcelona.md §7): swifts and swallows over the
// streets of the Eixample (the planes' avenues and the Passeig), a few crows in the air over the Sagrada Família's works, house sparrows
// on the paving of the pavements, the court-side walls and the stone yard of the works; and the critters (§14.4): pigeons on the pavements
// of the market and the Marina, cats and dogs at the doors of the shops, canaries in cages before shop windows, a cock and hens at the works.
import { PITCH, SAGRADA, GRACIA_X, RADIUS, MERCAT, ARRIVAL } from './layout.js';
import { ground } from './ground.js';
import { blockElements } from './town.js';
import { shopDoors } from './shoproutes.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [GRACIA_X, -300], b: [GRACIA_X, 300] }, half: 30, y: [12, 28], speed: 11 },
  { kind: 'swallow', n: 4, lane: { a: [-300, PITCH / 2], b: [300, PITCH / 2] }, half: 30, y: [10, 26], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [SAGRADA[0], SAGRADA[1]], a: [60, 50], rot: 0.3 }, y: [28, 55], speed: 10 },
  { kind: 'crow', n: 4, loop: { c: [SAGRADA[0] + 10, SAGRADA[1] - 20], a: [45, 35], rot: 0.6 }, y: [45, 80], speed: 8 },
];
const perches = [];
// sparrows on the pavements: a spot in each of a few streets' kerbs (clear of the planes at 7–8.3 m), at the works' yard
for (let i = -3; i <= 3; i++) for (let k = -3; k <= 3; k++) {
  if ((i * 7 + k * 3) % 3 !== 0) continue;
  const x = i * PITCH + PITCH / 2 + 9.6, z = k * PITCH + 20;
  if (Math.hypot(x, z) > RADIUS - 70) continue;
  perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7 + z) % 3, range: [1.6, 1.0] });
}
for (const [dx, dz] of [[-12, 20], [-4, 33], [-20, 5]]) { const x = SAGRADA[0] + dx, z = SAGRADA[1] + dz; perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: 0.4, range: [2.0, 1.4] }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/barcelona.md §14.4) ──
const critters = [];
const hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
const at = (x, z, dy = 0) => [x, ground.height(x, z) + dy, z];
/** The pavement's middle (a block's house face is 35 m from its centre, the pavement 4.4 m wide: §9). */
export const PAVE = 37.2;
// pigeons on the paving of the market's north and south pavements, in the crumbs of the stalls [inferred: a market's pigeons; the florists' mats are on the north side, §5d]
[[-22, -1, 'grey'], [-14, 1, 'grey'], [-6, -1, 'white'], [4, 1, 'grey'], [13, -1, 'dark'], [21, 1, 'grey']].forEach(([dx, s, v], i) => {
  const x = MERCAT[0] + dx, z = MERCAT[1] + (i % 2 ? PAVE : -PAVE);
  critters.push({ model: 'pigeon_' + v, at: at(x, z), rot: Math.PI / 2 + (i % 3) * 1.1, range: [1.5, 0.8], tau: 11, speed: 0.33, stride: 0.1 });
  void s;
});
// pigeons on the Marina's east pavement north of the arrival [inferred]
[[-66, 'grey'], [-71.5, 'dark'], [-78, 'grey']].forEach(([z, v], i) => critters.push({ model: 'pigeon_' + v, at: at(PITCH * 2.5 + 8.8, z), rot: 0.3 + i * 1.9, range: [0.8, 1.5], tau: 11, speed: 0.33, stride: 0.1 }));
// a cock and hens in the works' yard west of the Schools [inferred: the works' people kept fowl; only the keeper's few]
{ const x = SAGRADA[0] - 27, z = SAGRADA[1] + 28.5; critters.push({ model: 'rooster', at: at(x, z), rot: 2.0, range: [2.5, 1.8], tau: 15, speed: 0.5, stride: 0.22 });
  [['hen_brown', 1.6, 1.2], ['hen_white', -1.2, 2.0], ['hen_brown', 0.4, -1.8]].forEach(([model, dx, dz]) => critters.push({ model, at: at(x + dx, z + dz), rot: hashAt(x + dx, z + dz) * 6, range: [2.2, 1.6], tau: 14, speed: 0.5, stride: 0.22 })); }
// the shops' cats, dogs and canaries: on the step beside the door of the nearest few, by trade [inferred: the grocer's and the baker's cat (mousers), the ironmonger's dog,
// the barber's and the draper's canary in its cage on the wall by the window: the shops' front is §9's, the trades are those of the plots' own plan]
const TAKE = { colmado: 'cat_tabby', forn: 'cat_orange', ferreteria: 'dog', bodega: 'dog', perruqueria: 'cagebird', draperia: 'cagebird', sabater: 'cat_tabby' };
{ const seen = {}, shops = shopDoors(blockElements()).filter((q) => q.d < 330);
  for (const q of shops) {
    const model = TAKE[q.trade]; if (!model) continue;
    const key = q.trade; if ((seen[key] = (seen[key] ?? 0) + 1) > (model === 'dog' ? 1 : 2)) continue;
    const side = hashAt(q.door[0], q.door[1]) < 0.5 ? -1 : 1, tx = -q.n[1] * side, tz = q.n[0] * side, rot = Math.atan2(q.n[0], q.n[1]);
    if (model === 'cagebird') { const x = q.door[0] + q.n[0] * 0.2 + tx * 2.0, z = q.door[1] + q.n[1] * 0.2 + tz * 2.0; critters.push({ model, at: [x, q.y + 2.4, z], rot }); }
    else { const x = q.door[0] + q.n[0] * 0.9 + tx * 1.9, z = q.door[1] + q.n[1] * 0.9 + tz * 1.9; critters.push({ model, at: [x, q.y + 0.02, z], rot: rot + side * 0.9, range: model === 'dog' ? [9, 3.5] : [7, 2.5] }); }
  } }
void ARRIVAL;

export default { fish, flights, perches, critters };
