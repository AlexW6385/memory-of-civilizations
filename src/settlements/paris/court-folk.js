// Paris in 1248 — more people in the palace court by day (docs/settlements/paris.md §6g): the Cour de Mai was where the king's justice
// was asked, the household came and went, and the Galerie mercière's customers crowded the hall's foot. Pure data: court.js adds the figures to the court's life plan
// (the materials its figures already use, so the arrival gains no draw; built into a near plan they cost 16).
import { RIVER, PALACE } from './layout.js';

function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const CL = ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_blue'];
/** Where the visitor walks and the court's lanes (the arrival's strip, the way to the gate): nobody stands there. [x0, z0, x1, z1] */
const LANES = [[-253, -41, -243, 13], [-253, 2.5, -112, 8.5], [-253, -41, -204, -36]];
const inR = (p, r, m = 0) => p[0] > r[0] - m && p[0] < r[2] + m && p[1] > r[1] - m && p[1] < r[3] + m;

/** The people of the court as figure parameters (world [x, z]). */
export function folk(SKIP) {
  const rand = lrng(1248), out = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, to, o = {}) => {
    if (SKIP.some((r) => inR(at, r, 0.8)) || LANES.some((r) => inR(at, r, 0.6))) return;
    out.push({ t: 'figure', at, y: RIVER.ground, rot: faceTo(at, to), h: 1.56 + rand() * 0.18, seed: Math.floor(rand() * 1e9), dress: rand() < 0.5 ? 'robe' : 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_light', hat: pick(['cap', 'none', 'brim']), hatMat: pick(['cloth_brown', 'cloth_red', 'cloth_black', 'cloth_grey']), over: pick(['sash', 'cape', 'none']), pose: 'stand', carry: 'none', ...o });
  };
  const knot = (c, n, r, o = () => ({})) => { for (let k = 0; k < n; k++) { const a = k / n * 6.283 + rand(); fig([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r], c, { pose: k % 3 === 2 ? 'stand' : 'talk', ...o(k) }); } };
  // advocates and clerks in black, a pair with a writing board, waiting to have their cause called
  knot([-238, -22], 3, 1.0, () => ({ dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_black', over: 'cape', hair: 'short' }));
  knot([-140, -20], 3, 0.9, () => ({ dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_black', over: 'cape' }));
  // petitioners from the country and the town in knots, a wife with a basket of eggs as her gift
  knot([-237, 0.4], 4, 1.2); knot([-145, -8], 3, 1.1); knot([-130, -28], 4, 1.2, (k) => ({ carry: k === 1 ? 'basket' : 'none' }));
  knot([-228, 14], 3, 1.0, (k) => ({ carry: k === 0 ? 'basket' : 'none' }));
  // two friars of a mendicant house crossing the court, a pilgrim pair with staves and wallets
  for (const [a, to] of [[[-150, -14], [-136, -18]], [[-148.6, -13], [-136, -18]]]) fig(a, to, { dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_grey', hair: 'shaven', hat: 'none', over: 'belt', carry: 'staff', len: 1.7 });
  for (const [a, to] of [[[-210, 14], [-190, 18]], [[-208.8, 15], [-190, 18]]]) fig(a, to, { dress: 'tunic', legs: 'hose', feet: 'shod', cloth: 'cloth_brown', hat: 'brim', hatMat: 'cloth_brown', over: 'belt', carry: 'staff', len: 1.9 });
  // a beggar sitting on the paving at the stair's foot with his bowl, a boy with a message running
  fig([-222.5, -30], [-230, -24], { pose: 'sit', dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'none', over: 'none', hair: 'short' });
  fig([-180, 10], [-195, 12], { dress: 'tunic', legs: 'hose', child: true, h: 1.3, cloth: 'cloth_red', hat: 'cap', hatMat: 'cloth_red', over: 'belt' });
  // a household knight with his squire crossing to the hall, a lady with her maid
  fig([-135, -4], [-200, -20], { dress: 'tunic', legs: 'hose', feet: 'shod', cloth: 'cloth_indigo', cloth2: 'cloth_red', hat: 'brim', hatMat: 'cloth_indigo', over: 'cape', beard: true });
  fig([-133.7, -5.3], [-200, -20], { dress: 'tunic', legs: 'hose', child: true, h: 1.35, cloth: 'cloth_ochre', hat: 'cap', over: 'belt' });
  fig([-125, -22], [-140, -14], { dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'veil', hatMat: 'cloth_white', over: 'none', hair: 'long' });
  fig([-126.3, -21], [-140, -14], { dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'veil', hatMat: 'cloth_white', over: 'none', carry: 'basket' });
  // buyers three deep before the mercers' stalls at the hall's foot (the stalls and their masters are the court's own)
  for (const x of [-258, -246.5, -235, -223.5]) { for (const dz of [4.0, 4.9]) fig([x + (rand() - 0.5) * 1.4, -40.6 + dz], [x, -40.6], { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' }); }
  void PALACE;
  return out;
}

