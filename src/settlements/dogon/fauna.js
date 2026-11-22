// A Dogon village — the animals (src/engine/fauna.js; docs/settlements/dogon.md §8): swallows over the village and the fields, crows
// (pied crows, kites stand in) wheeling along the cliff, sparrows on the flat roofs and the place's earth. No water: no fish, no egret.
import { COMPOUNDS, LANDMARK, PENS, FORGE, PLACE_Y, height } from './layout.js';
import { WELLS } from './walk.js';
import { frontOf } from '../../styles/dogon/compound.js';

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

// ── the critters: animals with a rig and behaviour (src/engine/fauna-critters.js; dossier 16.4) ──
// Dogs asleep in the dust by the wells, the forge and the place; goats at the wells' troughs and in the pens (men tend them; they graze and lie down);
// hens with a cock before the ginnas' fronts; doves on the flat roofs of the first row; a cat on a house roof. [inferred: the domestic animals of the dossier §8
// and encyclopedia.com (goats, sheep, donkeys, dogs, poultry); where each stands is ours]
const critters = [];
const g = (x, z) => height(x, z);
for (const [i, [x, z]] of WELLS.entries()) {
  critters.push({ model: 'dog', at: [x + 2.9 * (i ? -1 : 1), g(x, z) + 0.02, z - 1.4], rot: 1.2 + i, range: [9, 3.5] });
  critters.push({ model: i ? 'goat_white' : 'goat_black', at: [x + 2.6, g(x, z) + 0.02, z + 1.5], rot: 1.4, range: [9, 3.2] }, { model: i ? 'goat_black' : 'goat_white', at: [x + 1.7, g(x, z) + 0.02, z + 1.8], rot: 4.6, range: [9, 3.2] });
}
for (const [i, p] of PENS.entries()) for (let k = 0; k < 3; k++) { const a = k * 2.1 + i; critters.push({ model: (k + i) % 2 ? 'goat_white' : 'goat_black', at: [p.at[0] + Math.cos(a) * 1.0, g(p.at[0], p.at[1]) + 0.02, p.at[1] + Math.sin(a) * 1.0], rot: a, range: [8, 3] }); }
critters.push({ model: 'dog', at: [FORGE.at[0] + 2.6, g(FORGE.at[0], FORGE.at[1]) + 0.02, FORGE.at[1] - 0.6], rot: 2.0, range: [9, 3.5] }, { model: 'dog', at: [8.5, 1.22, 21.5], rot: 0.5, range: [9, 3.5] });
// hens and a cock before the fronts of the second and third ginna of each side of row C, and a cat on the landmark's roof
let n = 0;
for (const c of COMPOUNDS) {
  if (c.row !== 'C' || c.landmark || c.i === 0 || n >= 6) continue;
  const f = frontOf(c), x = f.x0 + 1.5, z = f.zf + 2.3;
  for (const [k, m] of ['hen_brown', 'hen_white', 'hen_brown', 'rooster'].entries()) critters.push({ model: m, at: [x + 0.6 * k, c.y + 0.02, z + 0.3 * (k % 2)], rot: c.seed % 6 + k, range: [2.2, 1.8] });
  n++;
}
for (const c of COMPOUNDS.filter((q) => q.row === 'C' && q.i < 2)) {
  const f = frontOf(c), top = c.y + 2.7;
  for (const [k, m] of ['pigeon_grey', 'pigeon_white'].entries()) critters.push({ model: m, at: [f.x0 + 1.2 + k * 0.9, top, f.zf - 1.5], rot: c.seed % 5 + k, range: [1.4, 1.2] });
}
// donkeys [inferred: the Dogon's pack animal]: two tethered on the place (one moved 3.4 m off the lane, which the still donkey stood too near), two at the millet field's edge (critter-models-farm.js; they stand and graze a little, short range as at a tether)
critters.push({ model: 'donkey_grey', at: [-39, PLACE_Y + 0.02, 25], rot: 1.7, range: [1.0, 0.7], tau: 40 }, { model: 'donkey_brown', at: [22.5, PLACE_Y + 0.02, 22], rot: 3.5, range: [1.0, 0.7], tau: 44 });
critters.push({ model: 'donkey_grey', at: [-16, g(-16, 46.5) + 0.02, 46.5], rot: 2.2, range: [2.5, 1.5], tau: 36 }, { model: 'donkey_brown', at: [-13.8, g(-13.8, 47.4) + 0.02, 47.4], rot: 0.8, range: [2.5, 1.5], tau: 41 });
critters.push({ model: 'cat_tabby', at: [LANDMARK.rect[0] + 3.0, LANDMARK.y + 2.7, LANDMARK.rect[3] - 1.6], rot: 3.0, range: [1.0, 0.3] });
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('dogon'));
export default { fish, flights, perches, critters };
