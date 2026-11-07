// A procession of 562 (docs/settlements/constantinople.md §10): from the Chalke across the Augustaion to the south door
// of Hagia Sophia — the processional cross of gold at its head between two tall candles, deacons in white with their
// red stoles, priests, the patriarch carrying the Gospel book bound in gold, the emperor in purple, guards with their
// spears. The Diegesis tells of Justinian coming "in procession from the Palace to the gates of the Augusteion", making
// his entry "with the cross", the patriarch beside him. Figures of the shared library; the cross, the candles and the
// book are built here and stand in the figures' hands (each figure's height fixed, so the hands are where they are).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../../objects/index.js';
import { height } from './layout.js';

const turn = (g, a, x, y, z) => { g.rotateY(a); g.translate(x, y, z); return g; };
/** processional_cross: { at, y, rot, h } — a gilt staff and on it a cross with flared arms, a disc at the crossing. */
function processionalCross(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, h = el.h ?? 2.5;
  bag.add('gilt_bronze', turn(lathe([[0.018, 0], [0.018, h], [0.03, h + 0.02], [0.03, h + 0.06], [0.001, h + 0.06]], 8), a, x, y, z));
  for (const [w, t] of [[0.06, 0.62], [0.46, 0.06]]) bag.add('gold', turn(box(-w / 2, -t / 2 + (t > 0.1 ? 0.28 : 0.36), -0.015, w / 2, t / 2 + (t > 0.1 ? 0.28 : 0.36), 0.015), a, x, y + h + 0.06, z));
  for (const s of [-1, 1]) bag.add('gold', turn(box(s * 0.23 - 0.03, 0.31, -0.016, s * 0.23 + 0.03, 0.41, 0.016), a, x, y + h + 0.06, z));
  bag.add('gold', turn(box(-0.05, 0.86, -0.016, 0.05, 0.92, 0.016), a, x, y + h + 0.06, z));
  bag.add('inlay_carnelian', turn(lathe([[0.001, 0], [0.06, 0], [0.06, 0.04], [0.001, 0.04]], 12).rotateX(Math.PI / 2), a, x, y + h + 0.42, z));
}
/** candle: { at, y, rot, h } — a tall candlestick of silver carried upright, the candle and its flame on top. */
function candle(el, { bag, lights }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.9;
  bag.add('silver', lathe([[0.015, 0], [0.015, h - 0.1], [0.06, h - 0.06], [0.065, h], [0.001, h]], 8, null, x, y, z));
  bag.add('paint_white', lathe([[0.022, 0], [0.022, 0.32], [0.001, 0.33]], 8, null, x, y + h, z));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.015], [0.001, 0.06]], 6, null, x, y + h + 0.33, z));
  if (el.light) lights.push({ at: [x, y + h + 0.45, z], color: '#ffb46b', intensity: 1.2, distance: 5 });
}
/** gospel: { at, y, rot } — the Gospel book held before the chest, its covers of gold set with stones. */
function gospel(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0;
  bag.add('gold', turn(box(-0.15, -0.2, -0.04, 0.15, 0.2, 0.04), a, x, y, z));
  bag.add('linen', turn(box(-0.14, -0.19, -0.036, 0.14, 0.19, 0.036), a, x, y + 0.0005, z).translate(0, 0, 0));
  for (const [dx, dy] of [[0, 0], [-0.09, 0.13], [0.09, 0.13], [-0.09, -0.13], [0.09, -0.13]]) bag.add(dx === 0 ? 'inlay_carnelian' : 'inlay_lapis', turn(box(dx - 0.022, dy - 0.022, -0.05, dx + 0.022, dy + 0.022, -0.04), a, x, y, z));
}
registerStyle('constantinople-site', { trim: () => {}, opening: () => {}, column: () => {}, elements: { ...STYLES.life.elements, processional_cross: processionalCross, candle, gospel }, objects: {} });

// the line of the procession: from the Chalke toward the south door of Hagia Sophia, its head 40 m from the door
const DOOR = [-10, 36], CHALKE = [28, 159];
const U = (() => { const dx = DOOR[0] - CHALKE[0], dz = DOOR[1] - CHALKE[1], L = Math.hypot(dx, dz); return [dx / L, dz / L]; })();
export const HEAD = [DOOR[0] - U[0] * 40, DOOR[1] - U[1] * 40];
/** Whether a point lies near the procession's line (for the other figures of the square to keep clear). */
export const nearProcession = (x, z, m = 2.5) => { const px = x - HEAD[0], pz = z - HEAD[1], t = -(px * U[0] + pz * U[1]), d = Math.abs(px * U[1] - pz * U[0]); return t > -3 && t < 34 && d < m; };

export function procession() {
  const E = [], rot = Math.atan2(-U[0], -U[1]), R = [Math.cos(rot), -Math.sin(rot)];     // facing U; R the figures' right
  const P = (back, side) => [HEAD[0] - U[0] * back + R[0] * side, HEAD[1] - U[1] * back + R[1] * side];
  let sd = 562;
  const fig = (at, o) => E.push({ t: 'figure', at, y: height(at[0], at[1]), rot, seed: sd++, h: 1.7, skin: 'skin_light', hat: 'none', hair: 'short', beard: 1, pose: 'stand', ...o });
  /** a figure whose right hand holds a thing upright: the hand of the 'staff' arms at (0.25, 1.05, −0.25) of a 1.65 m figure */
  const hand = (at, k = 1.7 / 1.65) => [at[0] + R[0] * 0.25 * k + U[0] * 0.27 * k, at[1] + R[1] * 0.25 * k + U[1] * 0.27 * k];
  // the cross between the two candles
  const cb = P(0, 0); fig(cb, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'collar', arms: 'staff', beard: 0 });
  const ch = hand(cb); E.push({ t: 'processional_cross', at: ch, y: height(...ch), rot, h: 2.5 });
  for (const s of [-1.1, 1.1]) { const p = P(0.9, s); fig(p, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'collar', arms: 'staff', beard: 0 }); const hp = hand(p); E.push({ t: 'candle', at: hp, y: height(...hp), rot, h: 1.45, light: s > 0 }); }
  // the deacons in white with red stoles, two by two; the priests in white and ochre
  for (let k = 0; k < 4; k++) fig(P(3 + Math.floor(k / 2) * 1.6, k % 2 ? 0.75 : -0.75), { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'sash', arms: 'clasp', beard: k % 2 });
  for (let k = 0; k < 4; k++) fig(P(6.6 + Math.floor(k / 2) * 1.6, k % 2 ? 0.75 : -0.75), { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'cape', arms: 'clasp', hair: 'long' });
  // the patriarch with the Gospel book before his chest, a candle on either side of him
  const pa = P(10.6, 0); fig(pa, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'cape', arms: 'clasp', hair: 'long' });
  const k = 1.7 / 1.65, bk = [pa[0] + U[0] * 0.24 * k, pa[1] + U[1] * 0.24 * k];
  E.push({ t: 'gospel', at: bk, y: height(...pa) + 1.08 * k, rot });
  for (const s of [-1.1, 1.1]) { const p = P(10.2, s); fig(p, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'collar', arms: 'staff', beard: 0 }); const hp = hand(p); E.push({ t: 'candle', at: hp, y: height(...hp), rot, h: 1.45 }); }
  // the emperor in purple with the gold-bordered cloak, a step behind; two attendants
  fig(P(13.2, 0), { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_ochre', over: 'cloak', arms: 'clasp' });
  for (const s of [-1, 1]) fig(P(14.6, s * 0.9), { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cloak', beard: 0 });
  // the guards: tunics and hose, red cloaks, spears, on either side and two by two behind
  for (const [b, s] of [[12, -2.2], [12, 2.2], [15, -2.2], [15, 2.2], [17.5, -0.8], [17.5, 0.8], [19, -0.8], [19, 0.8]]) fig(P(b, s), { dress: 'tunic', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cloak', carry: 'staff', len: 2.4, staffMat: 'timber', beard: 0 });
  // people stopped to watch along the way
  for (let i = 0; i < 8; i++) { const b = 2 + i * 3.4, s = (i % 2 ? 1 : -1) * (4 + (i % 3) * 0.7), p = P(b, s); fig(p, { rot: rot + (s > 0 ? Math.PI / 2 : -Math.PI / 2), dress: i % 3 ? 'tunic' : 'robe', legs: 'hose', cloth: ['cloth_brown', 'cloth_ochre', 'cloth_indigo', 'cloth_green'][i % 4], cloth2: 'cloth_white', hat: i % 4 === 1 ? 'veil' : 'none', pose: i % 2 ? 'pray' : 'stand' }); }
  return E;
}
export const processionPlan = () => ({ id: 'constantinople-procession', style: 'constantinople-site', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: procession(), rooms: [], bounds: [-420, -420, 420, 420], entrance: { at: [-150, 110], facing: 'e' } });
