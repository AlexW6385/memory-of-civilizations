// Paris in 1248 — the court of the palace (docs/settlements/paris.md §5c): the Cour de Mai before the Sainte-Chapelle, where
// petitioners waited for the king's justice, sergeants stood at the stair to the upper chapel, mercers' stalls leaned against the
// Grand-Salle's south wall, grooms held the horses of those who came on business, and a tree was planted each May. Pure data
// from layout.js (the chapel's footprint and the hall's come from plan.js's numbers, written here as the court's skips).

import { RIVER, CHAPEL, PALACE, inRect } from './layout.js';

function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const CL = ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_blue'];
const y0 = RIVER.ground;
const [OX, OZ] = CHAPEL.origin;
/** What stands in the court and must be left alone: the chapel with its stair and gallery, the hall. [x0, z0, x1, z1] */
export const SKIP = [[OX - 20, OZ - 36, OX + 46, OZ + 11], [-267, -74, -197, -42.5]];
/** The ways the court's walkers use (rects, for walkways() in movers.js): the court's south side from the gate, the west front, the hall's foot. */
export const COURT_WAYS = [
  { r: [-250, 1.5, PALACE[2] + 2, 12], weight: 2.4, market: 0.5, kind: 'street' },
  { r: [-253, -41, -244, 12], weight: 1.6, market: 0.5, kind: 'street' },
  { r: [-253, -40.5, OX + 6, -36], weight: 1.4, market: 0.9, kind: 'street' },
];

export function courtGround() {
  const walks = [[-252, -40, -245, 12], [-252, 3, -114, 7.5], [-253, -39.6, -204, -37.4], [OX - 36, -4, OX - 6, 0.4]];
  return {
    id: 'paris-court', style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [-250, -10], facing: 'e' }, bounds: [PALACE[0], PALACE[1], PALACE[2] + 4, PALACE[3]], rooms: [],
    elements: [
      { t: 'court_ground', rect: [-268, -74, PALACE[2] - 1.5, 58], y: y0, seed: 1248, skip: SKIP, walks: walks.filter((w) => !SKIP.some((s) => w[0] < s[2] && w[2] > s[0] && w[1] < s[3] && w[3] > s[1])), drain: [[-246, 12.2, -200, 13.2], [-199, -34, -198, 12]].filter((d) => !SKIP.some((s) => d[0] < s[2] && d[2] > s[0] && d[1] < s[3] && d[3] > s[1])) },
      { t: 'may_tree', at: [-236, 16], y: y0, h: 6.8, seed: 5 },
      { t: 'mounting_block', at: [-226, 14.6], y: y0, rot: 0 },
      { t: 'hitching_rail', at: [-232, 15.6], y: y0, rot: 0, len: 3.2 },
      { t: 'hitching_rail', at: [-176, 15.4], y: y0, rot: 0, len: 3.6 },
    ],
  };
}

export function courtLife() {
  const rand = lrng(1259), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: y0, rot, h: 1.56 + rand() * 0.18, seed: Math.floor(rand() * 1e9), dress: rand() < 0.5 ? 'robe' : 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_light', hat: pick(['cap', 'none', 'brim']), hatMat: pick(['cloth_brown', 'cloth_red', 'cloth_black']), ...o });
  const face = faceTo;
  // petitioners before the west front, talking in knots, a woman with a child and a bundle of papers' fee, a man kneeling on the paving to ask
  { const c = [-232, -8];
    for (const [dx, dz, p] of [[-1.1, -1.0, 'talk'], [0.2, -1.6, 'talk'], [0.9, 0.2, 'talk'], [-0.4, 1.0, 'stand']]) { const a = [c[0] + dx, c[1] + dz]; fig(a, face(a, c), { pose: p, over: pick(['sash', 'cape', 'none']), carry: p === 'stand' ? 'basket' : 'none' }); }
    const k = [-224, -3.5]; fig(k, face(k, [-214, -9]), { pose: 'kneel', arms: 'pray', hat: 'none', dress: 'robe', cloth: 'cloth_brown' });
    const w = [-238.5, -14.5]; fig(w, face(w, [-228, -13]), { dress: 'robe', hat: 'veil', hatMat: 'cloth_white', cloth: 'cloth_indigo', cloth2: 'cloth_white', over: 'none' });
    const ch = [-237.2, -14.0]; fig(ch, face(ch, [-228, -13]), { child: true, h: 1.05, hat: 'none', hair: 'short', cloth: 'cloth_ochre', dress: 'tunic' });
  }
  // the sergeants of the king's household at the stair's foot, in the livery of the court, staff in hand
  for (const [a, to] of [[[-219.6, -15.4], [-232, -12]], [[-219.6, -22.8], [-232, -24]]]) fig(a, face(a, to), { pose: 'staff', carry: 'staff', len: 2.0, dress: 'tunic', legs: 'hose', feet: 'shod', hat: 'cap', hatMat: 'cloth_red', cloth: 'cloth_blue', cloth2: 'cloth_red', over: 'belt' });
  // the well and the women who draw at it, north of the stair's foot
  L.push({ t: 'well', kind: 'windlass', roof: true, at: [-229, -28.5], y: y0, mat: 'limestone', seed: 11 });
  for (const [dx, dz, p, carry] of [[1.9, 0.5, 'stand', 'pot'], [-1.6, 1.4, 'talk', 'none'], [-0.7, 2.3, 'talk', 'none']]) { const a = [-229 + dx, -28.5 + dz]; fig(a, face(a, [-229, -28.5]), { pose: p, carry, dress: 'robe', hat: 'veil', hatMat: 'cloth_white', cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre']), cloth2: 'cloth_white', over: 'none' }); }
  L.push({ t: 'barrel', at: [-225.2, -30.6], y: y0, rot: 0.3, n: 2, seed: 13 });
  // the mercers' stalls along the Grand-Salle's south wall: cloth, belts and purses, spices, with their masters behind and a buyer or two before
  const mer = [['cloth', 'basket'], ['produce'], ['cloth'], ['dark_pot', 'water_pot'], ['basket', 'produce']], aw = ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_white'];
  mer.forEach((g, i) => {
    const x = -258 + i * 11.5, z = -40.6;
    L.push({ t: 'stall', at: [x, z], y: y0, rot: 0, goods: g, awning: aw[i], w: 2.4, d: 1.3, seed: 70 + i });
    fig([x, z - 1.05], 0, { pose: 'stand', over: 'sash', hat: pick(['cap', 'brim']) });
    for (let k = 0; k < 1 + (i % 2); k++) { const a = [x + (rand() - 0.5) * 1.6, z + 1.9 + rand() * 0.8]; fig(a, face(a, [x, z]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.35 ? 'basket' : 'none' }); }
  });
  // clerks and advocates in black on the bench by the hall's stair, waiting for their cause to be called
  for (const bx of [-250, -243]) L.push({ t: 'bench', at: [bx, -38.4], y: y0, rot: Math.PI, len: 2.0, back: true });
  for (const [x, z] of [[-250.5, -38.5], [-249.6, -38.5], [-243.4, -38.5]]) fig([x, z], 0, { pose: 'sit', dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_black', over: 'cape', hair: 'short' });
  // horses at the rails with their grooms, a mounted party's mounts; the groom feeding from a bag
  for (const [x, z, r] of [[-232, 15.6, 0], [-176, 15.4, 0]]) {
    L.push({ t: 'animal', kind: 'horse', at: [x - 0.6, z + 0.55], y: y0, rot: -Math.PI / 2 + (r ? 0.1 : -0.1), seed: Math.floor(Math.abs(x)), gear: true });
    L.push({ t: 'animal', kind: 'horse', at: [x + 0.9, z + 0.6], y: y0, rot: -Math.PI / 2 - 0.15, seed: Math.floor(Math.abs(x)) + 3, gear: true });
    const g = [x + 2.3, z + 1.4]; fig(g, face(g, [x + 0.9, z + 0.6]), { pose: 'stand', dress: 'tunic', legs: 'hose', feet: 'shod', hat: 'cap', cloth: 'cloth_brown', over: 'belt' });
  }
  // a wine cart unloading at the kitchens' side, casks and sacks, the carter and a boy
  L.push({ t: 'cart', kind: 'two', load: 'barrels', at: [-190, 20], y: y0, rot: Math.PI / 2, seed: 17 });
  L.push({ t: 'barrel', at: [-196.5, 22.2], y: y0, rot: 0, n: 3, seed: 19 }); L.push({ t: 'sacks', at: [-195.8, 18.2], y: y0, rot: 0.4, n: 3, seed: 21 });
  fig([-193.3, 22.4], face([-193.3, 22.4], [-196.5, 22.2]), { dress: 'tunic', legs: 'hose', feet: 'shod', hat: 'cap', cloth: 'cloth_grey', over: 'belt', carry: 'sack', arms: 'sack' });
  // washing the court's paving is not done; but wood for the palace's hearths is stacked under the south wall, and a woman sweeps
  L.push({ t: 'firewood', at: [-150, 36], y: y0, rot: 0, len: 2.6, seed: 23 }); L.push({ t: 'firewood', at: [-146.2, 36], y: y0, rot: 0, len: 2.2, seed: 24 });
  fig([-148, 33.8], face([-148, 33.8], [-148, 36]), { dress: 'robe', hat: 'veil', hatMat: 'cloth_white', cloth: 'cloth_grey', carry: 'besom', arms: 'sweep', over: 'none' });
  // pigeons on the paving by the May tree and the well, dogs at the stalls, a cat under the stair
  L.push({ t: 'chickens', kind: 'pigeon', at: [-241, 14], y: y0, n: 7, seed: 31 }, { t: 'chickens', kind: 'pigeon', at: [-226, -34], y: y0, n: 5, seed: 33 });
  L.push({ t: 'animal', kind: 'dog', at: [-246.5, -37.2], y: y0, rot: 1.0, seed: 41, pose: 'lie' }, { t: 'animal', kind: 'dog', at: [-216, 4], y: y0, rot: 2.2, seed: 43 });
  L.push({ t: 'lantern', kind: 'iron', at: [-221.4, -21.0], y: y0, rot: 0, h: 2.9 });
  return { id: 'paris-court-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [-250, -10], facing: 'e' }, bounds: [PALACE[0], PALACE[1], PALACE[2] + 4, PALACE[3]], rooms: [], elements: L };
}
void inRect;
