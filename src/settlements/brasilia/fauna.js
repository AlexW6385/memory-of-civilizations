// Brasília about 1970 — the animals (src/engine/fauna.js draws them; docs/settlements/brasilia.md §10): swallows over the lawns and the
// pools, black vultures (urubus; the crow's stand-in) wheeling in the thermals of the plateau, sparrows on the lawns and under the
// pilotis, egrets (and the ibises' stand-ins) at the edges of the pools [inferred].
import { LAWN, POOLS, CATH, ITAMARATY, JUSTICE, SQ, SQ2, SQS, ALL_BLOCKS, PRACA, CHAPEL, PLAYS, PITCH_AT, MUSEU, GALLERY, STRIP, KIOSKS, CAMP } from './layout.js';
import { ground } from './ground.js';

const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-420, -20], b: [60, -20] }, y: [0.6, 4], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-50, 51], a: [30, 24], rot: 0 }, y: [1, 8], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [CATH.c[0], CATH.c[1]], a: [60, 50], rot: 0.4 }, y: [2, 30], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [-120, 40], a: [170, 100], rot: 0.2 }, y: [60, 110], speed: 7 },
  { kind: 'crow', n: 4, loop: { c: [-90, 330], a: [120, 90], rot: 1.0 }, y: [55, 100], speed: 7 },
  { kind: 'crow', n: 3, loop: { c: [170, 350], a: [110, 80], rot: 0.5 }, y: [55, 95], speed: 7 },
  { kind: 'swallow', n: 5, loop: { c: [170, 350], a: [70, 60], rot: 0.2 }, y: [2, 14], speed: 9 },
  { kind: 'swallow', n: 5, lane: { a: [-420, -128], b: [60, -128] }, y: [1, 7], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [-420, 128], b: [60, 128] }, y: [1, 7], speed: 9 },
];
const perches = [];
let sd = 1970; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
const sp = (x, z, y = ground.height(x, z) + 0.05, range = [2, 1.8]) => perches.push({ kind: 'sparrow', x, z, y, rot: rand() * 3, range });
for (let k = 0; k < 14; k++) sp(-440 + rand() * 330, (rand() - 0.5) * 200);
for (let k = 0; k < 10; k++) sp(PRACA[0] + 10 + rand() * 220, -110 + rand() * 220);
for (const b of ALL_BLOCKS) sp(b.rect[0] + 10 + rand() * 30, (b.rect[1] + b.rect[3]) / 2 + 7, 0.05, [3, 1.5]);
for (const q of SQS) for (let k = 0; k < 8; k++) sp(q[0] + 14 + rand() * 150, q[1] + 14 + rand() * 150);
// sparrows at the playgrounds, the pitch, the church's steps, the museum's forecourt and the shops' tables
for (const r of PLAYS) for (let k = 0; k < 3; k++) sp(r[0] + 2 + rand() * (r[2] - r[0] - 4), r[1] + 2 + rand() * (r[3] - r[1] - 4));
for (let k = 0; k < 3; k++) sp(CHAPEL[0] + 4 + rand() * 10, CHAPEL[3] + 3.5);
for (let k = 0; k < 4; k++) sp(MUSEU[0] + rand() * 26, MUSEU[3] + 4);
for (let k = 0; k < 6; k++) sp(46 + rand() * 4, 295 + rand() * 75);
for (let k = 0; k < 4; k++) sp(PITCH_AT[0] + rand() * 36, PITCH_AT[3] + 1.5);
// pigeons on the apron, the Square and the Cathedral's plaza, where the people feed them; burrowing owls' stand-ins (sparrows) on the lawn's turf
for (let k = 0; k < 9; k++) perches.push({ kind: 'pigeon', x: -111 + rand() * 14, z: -26 + rand() * 52, y: 0.03, rot: rand() * 3, range: [2.5, 2], alert: 3.5 });
for (let k = 0; k < 12; k++) perches.push({ kind: 'pigeon', x: PRACA[0] + 20 + rand() * 200, z: -40 + rand() * 80, y: 0.03, rot: rand() * 3, range: [2.5, 2], alert: 3.5 });
for (let k = 0; k < 8; k++) perches.push({ kind: 'pigeon', x: CATH.c[0] - 20 + rand() * 40, z: CATH.c[1] + 45 + rand() * 12, y: 0.03, rot: rand() * 3, range: [2.5, 2], alert: 3.5 });
for (let k = 0; k < 8; k++) sp(-300 + rand() * 180, (rand() < 0.5 ? -1 : 1) * (4 + rand() * 90));
// egrets at the congress pools' lawn edge and the Itamaraty's and the Cathedral's pools
for (const [i, p] of POOLS.entries()) perches.push({ kind: 'egret', x: p[0] - 3, z: (p[1] + p[3]) / 2, y: 0, rot: 0, stay: [60, 200], gone: [60, 160], alert: 10 + i });
perches.push({ kind: 'egret', x: CATH.c[0] + CATH.pool + 5, z: CATH.c[1] + 10, y: 0, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: (ITAMARATY[0] + ITAMARATY[2]) / 2 + 8, z: ITAMARATY[3] + 3, y: 0, rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: (JUSTICE[0] + JUSTICE[2]) / 2 - 8, z: JUSTICE[1] - 3, y: 0, rot: 0, stay: [60, 200], gone: [60, 160], alert: 10 });
void LAWN; void SQ; void SQ2;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/brasilia.md §15) ──
const critters = [];
const hashP = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
// whistling ducks (marrecas; the brown duck's stand-in) afloat in the Congress's two pools, the Itamaraty's pool and the Cathedral's ring of water
const inside = (r) => (x, z) => -Math.min(x - r[0], r[2] - x, z - r[1], r[3] - z);          // (the floaters' distance is negative on the water, as a shore's)
for (const p of POOLS) critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_brown'], area: p, dist: inside(p), a: [8, 5], ratio: 0.5, margin: 2.2, y: 0.3, speed: 0.15, cycle: [18, 26] });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown'], area: [ITAMARATY[0] + 7, ITAMARATY[1] + 7, ITAMARATY[2] - 7, ITAMARATY[3] - 7], dist: inside([ITAMARATY[0] + 7, ITAMARATY[1] + 7, ITAMARATY[2] - 7, ITAMARATY[3] - 7]), a: [9, 5], ratio: 0.5, margin: 2.4, y: 0.28, speed: 0.15 });
{ const [cx, cz] = CATH.c, ring = (x, z) => -Math.min(CATH.pool - 0.4 - Math.hypot(x - cx, z - cz), Math.hypot(x - cx, z - cz) - (CATH.R + 0.1));
  critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown'], area: [cx + 30, cz - 30, cx + 50, cz + 30], dist: ring, a: [4, 2.2], ratio: 0.4, margin: 1.4, y: 0.3, speed: 0.12 }); }
// egrets (the crane's stand-in) at the lawn's edge of the Congress's pools, the Itamaraty's and Justice's pools
for (const [i, p] of POOLS.entries()) critters.push({ model: 'crane', at: [p[0] - 5.5, 0, (p[1] + p[3]) / 2 + (i ? 9 : -9)], rot: Math.PI, range: [8, 2.5], tau: 50 });
critters.push({ model: 'crane', at: [(ITAMARATY[0] + ITAMARATY[2]) / 2 + 12, 0, ITAMARATY[3] + 1.5], rot: Math.PI / 2, range: [8, 2.5], tau: 55 });
// cats on the shops' pavements at the arcades' ends of the units (clear of the door lanes), a few dogs asleep in the shade by the kiosks and on the arcades
GALLERY.filter((u) => [1, 4, 6].includes(u.k)).concat(STRIP.filter((u) => [0, 3, 7, 10, 13, 18].includes(u.k))).forEach((u, i) => critters.push({ model: i % 2 ? 'cat_tabby' : 'cat_orange', at: [u.strip[0] + 0.5, 0.05, u.z + 3.7], rot: Math.PI * (0.4 + 1.2 * hashP(u.fx, u.z)), range: [7, 2.5] }));
for (const i of [1, 3, 10]) { const [x, z, r] = KIOSKS[i]; critters.push({ model: 'dog', at: [x + 2.4, 0, z + (r % 2 ? 0 : r === 0 ? -2.4 : 2.4)], rot: 6 * hashP(x, z), range: [9, 3.5] }); }
{ const g = GALLERY[7]; critters.push({ model: 'dog', at: [g.strip[0] - 3.5, 0, g.z + 3.5], rot: 1.3, range: [9, 3.5] }); }
// the candangos' camp: a rooster and hens in the yard
{ const cx = (CAMP[0] + CAMP[2]) / 2, cz = (CAMP[1] + CAMP[3]) / 2;
  critters.push({ model: 'rooster', at: [cx + 5, 0, cz + 7], rot: 0.8, range: [3, 2] }, { model: 'hen_brown', at: [cx + 3.5, 0, cz + 8.5], rot: 2.2, range: [3, 2] }, { model: 'hen_white', at: [cx + 6.5, 0, cz + 9], rot: 4.0, range: [3, 2] }, { model: 'hen_brown', at: [cx - 6, 0, cz - 9], rot: 5.1, range: [3, 2] }); }
export default { fish: [], flights, perches, critters };
