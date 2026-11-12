// Brasília about 1970 — the animals (src/engine/fauna.js draws them; docs/settlements/brasilia.md §10): swallows over the lawns and the
// pools, black vultures (urubus; the crow's stand-in) wheeling in the thermals of the plateau, sparrows on the lawns and under the
// pilotis, egrets (and the ibises' stand-ins) at the edges of the pools [inferred].
import { LAWN, POOLS, CATH, ITAMARATY, JUSTICE, SQ, SQ2, SQS, ALL_BLOCKS, PRACA, CHAPEL, PLAYS, PITCH_AT, MUSEU } from './layout.js';
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
// egrets at the congress pools' lawn edge and the Itamaraty's and the Cathedral's pools
for (const [i, p] of POOLS.entries()) perches.push({ kind: 'egret', x: p[0] - 3, z: (p[1] + p[3]) / 2, y: 0, rot: 0, stay: [60, 200], gone: [60, 160], alert: 10 + i });
perches.push({ kind: 'egret', x: CATH.c[0] + CATH.pool + 5, z: CATH.c[1] + 10, y: 0, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: (ITAMARATY[0] + ITAMARATY[2]) / 2 + 8, z: ITAMARATY[3] + 3, y: 0, rot: Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: (JUSTICE[0] + JUSTICE[2]) / 2 - 8, z: JUSTICE[1] - 3, y: 0, rot: 0, stay: [60, 200], gone: [60, 160], alert: 10 });
void LAWN; void SQ; void SQ2;
export default { fish: [], flights, perches };
