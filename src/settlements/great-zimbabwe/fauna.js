// Great Zimbabwe — the animals (src/engine/fauna.js; docs/settlements/great-zimbabwe.md §15): swallows over the valley and
// the Great Enclosure, crows (pied crows) circling the hill's boulders, sparrows (the weavers and sparrows of the plateau)
// on the daga floors of the compounds and the tops of the walls. No water: no fish, no egret.
import { ENCLOSURE, HILL, compounds, height } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [ENCLOSURE.c[0], ENCLOSURE.c[1]], a: [90, 60], rot: 0 }, y: [6, 22], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-40, 0], a: [150, 90], rot: 0.4 }, y: [8, 26], speed: 10 },
  { kind: 'crow', n: 6, loop: { c: [HILL.c[0], HILL.c[1]], a: [90, 50], rot: 0.1 }, y: [50, 80], speed: 8 },
];
const perches = [];
for (const k of compounds().filter((_, i) => i % 3 === 0)) perches.push({ kind: 'sparrow', x: k.c[0], z: k.c[1], y: height(k.c[0], k.c[1]) + 0.3, rot: k.seed % 3, range: [2.2, 2.0] });
// on the Great Enclosure's outer wall top (10 m, a little less where the top undulates)
for (const [x, z] of [[ENCLOSURE.c[0] - 30, ENCLOSURE.c[1] + 33], [ENCLOSURE.c[0] + 40, ENCLOSURE.c[1] + 24]]) perches.push({ kind: 'sparrow', x, z, y: 9.6, rot: 0, range: [2.5, 0], alert: 6 });
export default { fish, flights, perches };
