// Nasrid Granada about 1390 — the Court of the Myrtles at the visitor's eye (docs/settlements/granada.md §4.2, §14b): where the
// sultan's viziers and the secretaries of the chancery received petitioners and envoys, so men waiting on rugs under the Barca's
// portico, a gardener clipping the myrtle hedges, servants crossing with trays, pairs of tall glazed jars at the portico's piers, doves
// on the kerb. Everything placed from layout.js (the court's rectangle); walkers' ways for the movers.

import { HILL, MYRTLES, RADIUS } from './layout.js';

const T = HILL.top + 0.05;
const rot = { n: 0, s: Math.PI, w: Math.PI / 2, e: -Math.PI / 2 };
const [mx0, mz0, mx1, mz1] = MYRTLES, cx = (mx0 + mx1) / 2;
/** The two side walks of the court between the portico's piers and the hedges (the pool and hedges stand between), for walkways(). */
export const COURT_WAYS = [
  { r: [mx0 + 1.3, mz0 + 1.0, cx - 5.2, mz1 - 0.5], weight: 1.2, market: 0, kind: 'street' },
  { r: [cx + 5.2, mz0 + 1.0, mx1 - 1.3, mz1 - 0.5], weight: 1.2, market: 0, kind: 'street' },
];

export function courtLife() {
  const L = [];
  let seed = 1391;
  const fig = (at, dir, o = {}) => L.push({ t: 'figure', at, y: T, rot: typeof dir === 'number' ? dir : rot[dir], seed: (seed += 7919), skin: 'skin_medium', dress: 'robe', pose: 'stand', ...o });
  const man = (at, dir, o = {}) => fig(at, dir, { cloth: ['cloth_white', 'cloth_brown', 'cloth_ochre', 'cloth_red', 'cloth_white'][seed % 5], cloth2: 'cloth_white', over: 'sash', hat: seed % 4 ? 'turban' : 'none', hatMat: 'cloth_white', hair: 'short', beard: seed % 3 === 0, ...o });
  // petitioners and envoys waiting on rugs under the north portico (before the Barca's door), men of the chancery standing by with their papers
  const rug = (x, z, c) => L.push({ t: 'goods_mat', at: [x, z], y: T, rot: 0, mat: c, goods: [], seed: seed++ });
  for (const [dx, c] of [[-6.4, 'cloth_red'], [-2.0, 'cloth_indigo'], [3.4, 'cloth_red'], [7.0, 'cloth_ochre']]) rug(cx + dx, mz0 - 2.4, c);
  for (const [dx, dz] of [[-6.8, -2.0], [-5.9, -2.7], [-2.2, -2.3], [3.0, -2.2], [3.9, -2.8], [7.0, -2.4]]) man([cx + dx, mz0 - 2.4 + dz * 0.2], 's', { pose: 'cross' });
  man([cx - 0.8, mz0 - 1.0], 's', { pose: 'talk', cloth: 'cloth_brown' }); man([cx + 0.3, mz0 - 0.9], 'n', { pose: 'talk', cloth: 'cloth_white' });
  // along the west and the east walks: a vizier's retinue in slow talk, a secretary with a case, a servant with a tray crossing
  man([mx0 + 4.0, mz0 + 10.5], 'e', { pose: 'talk' }); man([mx0 + 5.1, mz0 + 10.4], 'w', { pose: 'talk', cloth: 'cloth_red' }); man([mx0 + 4.5, mz0 + 11.8], 'n', { cloth: 'cloth_white', hat: 'turban' });
  man([mx1 - 4.2, mz0 + 24.0], 'n', { carry: 'sack', arms: 'sack', hat: 'cap', dress: 'tunic', over: 'belt', legs: 'bare', cloth: 'cloth_brown' });
  fig([mx1 - 4.6, mz0 + 17.0], 'w', { dress: 'tunic', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white', carry: 'pot', hair: 'short', beard: true });
  // the gardener clipping the hedge's edge, kneeling with his shears; a boy with a watering jar
  fig([mx1 - 5.7, mz0 + 8.0], 'w', { dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'belt', hat: 'cap', hatMat: 'cloth_white', hair: 'short', beard: true, legs: 'bare', pose: 'squat' });
  fig([mx0 + 5.8, mz0 + 28.0], 'e', { child: true, h: 1.1, dress: 'tunic', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white', hair: 'short', legs: 'bare', carry: 'pot' });
  // the tall glazed jars (tinajas) at the piers of both porticoes and at the south door; water jars and a bench in the corners of the court
  for (const x of [mx0 + 1.4, mx1 - 1.4]) for (const z of [mz0 + 0.9, mz1 - 0.9]) L.push({ t: 'pot', kind: 'glazed_jar', at: [x, z], y: T, rot: 0, n: 1, seed: seed++ });
  L.push({ t: 'pot', kind: 'water_pot', at: [mx0 + 1.2, mz1 - 3.0], y: T, rot: 0, n: 2, seed: seed++ }, { t: 'pot', kind: 'water_pot', at: [mx1 - 1.2, mz0 + 3.2], y: T, rot: 0, n: 2, seed: seed++ });
  L.push({ t: 'bench', at: [mx0 + 0.9, mz0 + 16], y: T, rot: -Math.PI / 2, len: 1.8, back: false, mat: 'marble' });
  // doves on the kerb and the tiles, a cat asleep in the sun by the south fountain, sparrows at the water
  L.push({ t: 'chickens', kind: 'pigeon', at: [cx + 4.9, mz0 + 14], y: T, n: 5, seed: 51 }, { t: 'chickens', kind: 'pigeon', at: [cx - 5.3, mz0 + 26], y: T, n: 4, seed: 53 });
  L.push({ t: 'animal', kind: 'cat', at: [cx + 5.0, mz1 - 6], y: T, rot: 2.1, seed: 57, pose: 'lie' });
  return { id: 'granada-court-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: L, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } };
}
