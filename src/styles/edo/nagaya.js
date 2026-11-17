// The retainers' row house (nagaya) of a samurai compound, opened (docs/settlements/edo-himeji.md §5.9): a single storey of
// plastered units under one long roof, each unit with its own door and barred window on the yard side, an earth-floored
// entry with the clay cooking range (kamado) and the water jar, and a raised room of mats with the retainer's things — a low
// table, a cushion, the brazier with its kettle, a chest of drawers, folded bedding, a shelf for the household shrine,
// his swords on a rack and a spear against the wall. Units are built in the frame of their yard face (stores.js frameOf):
// u along the face from the unit's end, v inward from the face's inner side.

import { box, lathe, rod } from '../../core/geom.js';
import { frameOf } from './stores.js';
import { tatami } from './rooms.js';
import { chochin } from './town.js';

const PL = 'plaster_castle', WD = 'wood_dark', MAT = 'reed_mat';
const T = 0.14, FL = 0.4, UNIT = 4.3;

/** The face of a nagaya rect that looks into the compound { rect } of a yard rect: 'n' | 's' | 'e' | 'w' (the side of the row the door is in). */
export function yardFace(rect, yard) {
  const [x0, z0, x1, z1] = rect, [a0, b0, a1, b1] = yard;
  if (z1 - z0 > x1 - x0) return (x0 + x1) / 2 < (a0 + a1) / 2 ? 'e' : 'w';
  return (z0 + z1) / 2 < (b0 + b1) / 2 ? 's' : 'n';
}

/** The units of a row: [{ rect, fr (frameOf), W, D }], units about 4.3 m along the face. */
export function nagayaUnits(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.face, along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, n = Math.max(1, Math.floor(L / UNIT)), Lu = L / n, out = [];
  for (let i = 0; i < n; i++) {
    const rect = along ? [x0 + i * Lu, z0, x0 + (i + 1) * Lu, z1] : [x0, z0 + i * Lu, x1, z0 + (i + 1) * Lu], fr = frameOf(rect, f, T);
    out.push({ rect, fr, W: fr.W, D: fr.D });
  }
  return out;
}

/** The people of the row's open units (a retainer kneeling at his table in every other unit). */
export function nagayaPeople(el) {
  const y = el.y ?? 0;
  return nagayaUnits(el).flatMap((u, i) => (i % 2 === 0 ? [{ at: u.fr.P(2.3, 2.3), y: y + FL + 0.07, rot: u.fr.face(0, -1), pose: 'seiza' }] : []));
}

/** One open unit: the shell with its door and window, the floors, and what the room holds. */
function unitIn(bag, col, { fr, W, D }, y, H, seed) {
  const Bq = (m, u0, u1, v0, v1, q0, q1, c = false) => { const r = fr.R(u0, q0, u1, q1); bag.add(m, box(r[0], y + v0, r[1], r[2], y + v1, r[3])); if (c) col.rect(r, y + v0 - 0.02, y + v1); };
  const Cq = (u0, u1, q0, q1, v0, v1) => col.rect(fr.R(u0, q0, u1, q1), y + v0, y + v1);
  const lat = (m, prof, seg, u, v, q) => { const p = fr.P(u, q); bag.add(m, lathe(prof, seg, null, p[0], y + v, p[1])); };
  const fl = FL;
  // ---- the walls: plastered on a dark plinth, whole round but for the yard face's door and window
  const wall = (u0, u1, q0, q1, v0 = 0, v1 = H, plinth = true) => {
    if (u1 - u0 < 0.01 || q1 - q0 < 0.01) return;
    if (plinth && v0 < 0.5) { Bq('plaster_grey', u0, u1, v0, 0.5, q0, q1); Bq(PL, u0, u1, 0.5, v1, q0, q1); } else Bq(PL, u0, u1, v0, v1, q0, q1);
    Cq(u0, u1, q0, q1, v0, v1);
  };
  wall(-T, W + T, D, D + T); wall(-T, 0, -T, D + T); wall(W, W + T, -T, D + T);
  const d0 = 0.2, d1 = 1.2, w0 = W - 1.7, w1 = W - 0.5;
  wall(-T, d0, -T, 0); wall(d1, w0, -T, 0); wall(w1, W + T, -T, 0);
  wall(d0, d1, -T, 0, 1.95, H, false);                                        // the lintel over the door
  wall(w0, w1, -T, 0, 0, 1.05); wall(w0, w1, -T, 0, 1.95, H, false);         // the window's sill and head
  // the door's jambs and head beam in dark timber, the window's frame and its close-set bars (a renji window of the row)
  for (const u of [d0 - 0.06, d1 + 0.06]) Bq(WD, u - 0.06, u + 0.06, 0, 2.1, -T - 0.03, 0.03);
  Bq(WD, d0 - 0.12, d1 + 0.12, 1.95, 2.1, -T - 0.04, 0.03);
  Bq(WD, w0 - 0.06, w1 + 0.06, 1.05, 1.1, -T - 0.03, 0.0); Bq(WD, w0 - 0.06, w1 + 0.06, 1.9, 1.95, -T - 0.03, 0.0);
  for (const u of [w0, w1]) Bq(WD, u - 0.04, u + 0.04, 1.05, 1.95, -T - 0.03, 0.0);
  for (let u = w0 + 0.12; u < w1 - 0.06; u += 0.12) Bq(WD, u - 0.025, u + 0.025, 1.1, 1.9, -T + 0.01, -T + 0.06);
  // the sliding door pushed along the wall outside, over the solid piece between door and window; a threshold stone
  Bq(WD, d1 + 0.08, Math.min(w0 - 0.05, d1 + 1.1), 0.05, 1.9, -T - 0.08, -T - 0.03);
  Bq('granite_grey', d0, d1, 0, 0.04, -T - 0.4, -T); col.floor(fr.R(d0, -T - 0.4, d1, -T), y + 0.04);
  // ---- the floors: beaten earth at the entry, the raised floor of mats
  Bq('silt', 0, 1.3, -0.04, 0.03, 0, D); col.floor(fr.R(0, 0, 1.3, D), y + 0.03);
  Bq('cedar', 1.3, W, 0, fl - 0.05, 0, D); col.floor(fr.R(1.3, 0, W, D), y + fl); Cq(1.3, 1.34, 0, D, 0, fl - 0.05);
  Bq(WD, 1.26, 1.36, fl - 0.14, fl, 0, D);                                    // the edge beam of the step
  tatami(Bq, 1.36, W, 0, D, fl);
  // the ceiling of boards on joists
  Bq('cedar', 0, W, 2.55, 2.7, 0, D);
  for (let q = 0.5; q < D - 0.2; q += 0.9) Bq(WD, 0, W, 2.43, 2.55, q - 0.05, q + 0.05);
  Cq(0, W, 0, D, 2.55, H);
  // ---- the entry: the cooking range of clay at the back with its kettle and rice pot, the water jar, a shelf of bowls
  Bq('mud_plaster', 0.08, 1.22, 0, 0.62, D - 0.8, D - 0.08, true); Bq('plaster_white', 0.075, 1.225, 0.62, 0.66, D - 0.805, D - 0.075);
  Bq('opening', 0.35, 0.95, 0.1, 0.42, D - 0.815, D - 0.8);
  Bq('cloth_black', 0.3, 1.0, 0.42, 0.62, D - 0.805, D - 0.8);
  lat('iron', [[0.001, 0], [0.18, 0.02], [0.2, 0.12], [0.16, 0.2], [0.17, 0.22], [0.001, 0.22]], 12, 0.4, 0.66, D - 0.44);
  lat('pottery_dark', [[0.001, 0], [0.16, 0.02], [0.18, 0.18], [0.12, 0.26], [0.001, 0.27]], 12, 0.88, 0.66, D - 0.44);
  lat('timber', [[0.001, 0], [0.15, 0.0], [0.15, 0.03], [0.001, 0.03]], 12, 0.88, 0.93, D - 0.44);
  lat('pottery_dark', [[0.001, 0], [0.2, 0.02], [0.3, 0.3], [0.28, 0.62], [0.22, 0.7], [0.23, 0.74], [0.001, 0.74]], 12, 0.3, 0.03, 1.5); col.circle(...fr.P(0.3, 1.5), 0.3, y, y + 0.75);
  lat('timber', [[0.001, 0], [0.24, 0.0], [0.24, 0.03], [0.001, 0.03]], 12, 0.3, 0.77, 1.5);
  Bq('timber', 0.0, 0.3, 1.4, 1.44, 0.3, 1.0);
  for (let k = 0; k < 3; k++) lat(k % 2 ? 'pottery_dark' : 'glaze_white', [[0.001, 0], [0.05, 0.0], [0.08, 0.05], [0.001, 0.05]], 8, 0.15, 1.44, 0.45 + k * 0.22);
  // a bundle of firewood against the party wall, split pieces tied with straw
  for (let k = 0; k < 5; k++) Bq('timber', 1.05 + (k % 2) * 0.1, 1.2, 0.03 + k * 0.1, 0.12 + k * 0.1, 0.5 + (k % 3) * 0.04, 1.2);
  // ---- the room (raised floor top at fl): the low table with its cups and a cushion
  const tu = 2.3, tv = 1.5;
  Bq(WD, tu - 0.38, tu + 0.38, fl + 0.26, fl + 0.3, tv - 0.38, tv + 0.38); Cq(tu - 0.38, tu + 0.38, tv - 0.38, tv + 0.38, fl, fl + 0.3);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) Bq(WD, tu + a * 0.33 - 0.03, tu + a * 0.33 + 0.03, fl, fl + 0.26, tv + b * 0.33 - 0.03, tv + b * 0.33 + 0.03);
  for (const [a, b] of [[-0.15, 0], [0.15, 0.1], [0.0, -0.18]]) lat('glaze_white', [[0.001, 0], [0.04, 0.0], [0.06, 0.05], [0.001, 0.05]], 8, tu + a, fl + 0.3, tv + b);
  Bq('cloth_indigo', tu - 0.3, tu + 0.3, fl, fl + 0.07, 2.0, 2.6);
  // the brazier (hibachi) with its iron kettle, ash and a couple of embers' worth of dark in the bowl
  const hu = W - 1.1, hv = 1.55;
  lat('pottery_dark', [[0.001, 0], [0.18, 0.0], [0.24, 0.1], [0.25, 0.28], [0.2, 0.3], [0.2, 0.26], [0.001, 0.26]], 12, hu, fl, hv);
  lat('iron', [[0.001, 0], [0.13, 0.02], [0.18, 0.12], [0.1, 0.2], [0.001, 0.23]], 10, hu, fl + 0.26, hv); col.circle(...fr.P(hu, hv), 0.26, y + fl, y + fl + 0.5);
  // the chest of drawers (tansu) against the back wall, lacquered, with iron pulls
  { const u0 = W - 1.25, u1 = W - 0.12;
    Bq('lacquer_chestnut', u0, u1, fl, fl + 0.88, D - 0.5, D - 0.03, true);
    for (let r = 0; r < 3; r++) { Bq('iron', u0 + 0.05, u1 - 0.05, fl + 0.12 + r * 0.26, fl + 0.14 + r * 0.26, D - 0.515, D - 0.5); for (const c of [0.28, 0.85]) Bq('iron', u0 + c - 0.05, u0 + c + 0.05, fl + 0.2 + r * 0.26, fl + 0.24 + r * 0.26, D - 0.52, D - 0.5); } }
  // the folded bedding (futon) on a shelf-high pile at the back, the household shrine's shelf over it
  Bq('cloth_white', 1.45, 2.55, fl, fl + 0.3, D - 0.75, D - 0.05, true); Bq('cloth_indigo', 1.47, 2.53, fl + 0.3, fl + 0.46, D - 0.72, D - 0.08);
  Bq('timber', 1.6, 2.35, fl + 1.6, fl + 1.64, D - 0.3, D - 0.02);
  Bq('wood_ochre', 1.85, 2.1, fl + 1.64, fl + 1.84, D - 0.26, D - 0.06); Bq('tile_dark', 1.8, 2.15, fl + 1.84, fl + 1.88, D - 0.3, D - 0.02); Bq('paint_white', 1.95, 2.0, fl + 1.66, fl + 1.78, D - 0.27, D - 0.26);
  // on the party wall at the right: the swords on their rack (the long above the short) and a spear leaned beside it
  Bq(WD, W - 0.1, W - 0.02, fl + 1.1, fl + 1.14, 1.0, 1.95); Bq(WD, W - 0.1, W - 0.02, fl + 1.5, fl + 1.54, 1.0, 1.95);
  for (const [h, len, mat] of [[1.58, 0.95, 'lacquer_black'], [1.18, 0.62, 'lacquer_chestnut']]) {
    Bq(mat, W - 0.17, W - 0.1, fl + h, fl + h + 0.06, 1.0 + (0.95 - len) / 2 + 0.0, 1.0 + (0.95 - len) / 2 + len);
    Bq('gilt_bronze', W - 0.18, W - 0.1, fl + h - 0.01, fl + h + 0.07, 1.0 + (0.95 - len) / 2 - 0.05, 1.0 + (0.95 - len) / 2);
    Bq('paint_white', W - 0.17, W - 0.1, fl + h, fl + h + 0.06, 1.0 + (0.95 - len) / 2 - 0.2, 1.0 + (0.95 - len) / 2 - 0.05);
  }
  for (const v of [0.3, 0.5]) { const p = fr.P(W - 0.12, v); bag.add(WD, rod([p[0], y + fl, p[1]], [p[0], y + fl + 1.85, p[1]], 0.022, 5)); bag.add('iron', rod([p[0], y + fl + 1.85, p[1]], [p[0], y + fl + 2.1, p[1]], 0.014, 4)); }
  // the lantern hung over the table
  { const p = fr.P(tu, tv); chochin(bag, p[0], y + 2.43, p[1], 0.13, 0.3, false); }
  void seed;
}

/** The nagaya as a row of open units { rect, face (the yard side), y }: returns nothing; the caller adds the roof. */
export function nagayaOpen(el, { bag, col }) {
  const y = el.y ?? 0, H = 3.0;
  nagayaUnits(el).forEach((u, i) => unitIn(bag, col, u, y, H, (el.seed || 1) + i));
}
void MAT;
