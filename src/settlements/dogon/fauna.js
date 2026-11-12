// A Dogon village — the animals (src/engine/fauna.js; docs/settlements/dogon.md §8): swallows over the village and the fields, crows
// (pied crows, kites stand in) wheeling along the cliff, sparrows on the flat roofs and the place's earth. No water: no fish, no egret.
import { COMPOUNDS, height } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 10], a: [60, 34], rot: 0 }, y: [5, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, 55], a: [70, 20], rot: 0.2 }, y: [4, 12], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, 24], a: [34, 10], rot: 0.1 }, y: [3, 9], speed: 8 },
  { kind: 'crow', n: 7, loop: { c: [0, -40], a: [60, 9], rot: 0 }, y: [18, 46], speed: 8 },
];
const perches = [];
// doves and sparrows on the walls and roofs of the compounds nearest the place, and on the rim of the pens
const NEAR = COMPOUNDS.filter((c) => c.row === 'C');
for (const c of COMPOUNDS.filter((_, i) => i % 3 === 0)) {
  const x = (c.rect[0] + c.rect[2]) / 2, z = (c.rect[1] + c.rect[3]) / 2;
  perches.push({ kind: 'sparrow', x, z, y: c.y + 0.05, rot: c.seed % 3, range: [2.2, 1.8] });
}
for (const c of NEAR) perches.push({ kind: 'sparrow', x: c.rect[0] + 2.5, z: c.rect[3] + 1.2, y: c.y + 0.05, rot: c.seed % 5, range: [3, 1.2] });
for (const [x, z] of [[-12, 26], [8, 30], [-4, 21], [14, 25], [-19, 27], [31, 27], [-30, 24], [-41, 28]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.05, rot: (x * 5) % 3, range: [2, 1.6] });
export default { fish, flights, perches };
