// Two more buildings of the streets one walks into (docs/settlements/rome.md §4.13): an inn with its stable and courtyard
// (caupona), and a fuller's workshop (fullonica) with its treading vats, the cistern, the press and the drying frames.
// Elements of the `roman` style, in the frame of street.js (u along the front, d deep): { rect, front, y }.

import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import './index.js';
import { tools, hip } from './street.js';
import * as D_ from './dress.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const wall = (T, mat, u0, u1, d0, d1, H, doors = [], ya = -0.4, alongU = true) => {
  // a wall along u (alongU) between u0 and u1 at depth d0…d1 or along d (u0…u1 the thickness) between d0 and d1, with doorways [a, b, h]
  let a = alongU ? u0 : d0;
  const end = alongU ? u1 : d1;
  const put = (p, q, y0, y1) => { if (q - p < 0.01) return; if (alongU) T.B(mat, p, q, d0, d1, y0, y1, true); else T.B(mat, u0, u1, p, q, y0, y1, true); };
  for (const [p, q, h = 2.8] of [...doors].sort((m, n) => m[0] - n[0])) { put(a, p, ya, H); put(p, q, h, H); T.B('travertine', alongU ? p : u0, alongU ? q : u1, alongU ? d0 : p, alongU ? d1 : q, -0.04, 0.03); a = q; }
  put(a, end, ya, H);
};
const stool = (T, u, d) => { T.V('timber', [[0.001, 0], [0.17, 0.0], [0.17, 0.44], [0.001, 0.44]], u, d, 0, 8); T.C(u, d, 0.17, 0, 0.44); };
const table = (T, u, d, w = 1.3, l = 0.8) => { T.B('timber', u - w / 2, u + w / 2, d - l / 2, d + l / 2, 0.72, 0.77, true); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) T.B('timber', u + a * (w / 2 - 0.08) - 0.04, u + a * (w / 2 - 0.08) + 0.04, d + b * (l / 2 - 0.08) - 0.04, d + b * (l / 2 - 0.08) + 0.04, 0, 0.72); };

/**
 * caupona: an inn at a street door (dossier §4.13): the bar-room with its masonry counter, dolia sunk in it, shelves of
 * amphorae and cups behind, tables and stools and benches, the walls painted in dark and red; the passage to the court
 * with the household's shrine; the stable with stalls, mangers and hay; the courtyard with a well and a colonnade of timber
 * posts under a lean-to, and the guest rooms (cubicula) round it, each with its bed, a lamp and a door.
 */
function caupona(el, ctx) {
  const T = tools(el, ctx), { W, D, B, V } = T, rand = rng(el.seed || 7), t = 0.5, H = 4.8, fd = 8.0;
  T.B('flagstone', t, W - t, t, D - t, -0.3, 0.0); T.col.floor(T.R(t, W - t, t, D - t), T.y);
  T.B('cotto_floor', t, 8.5, t, fd, -0.3, 0.03);
  wall(T, 'stucco_rome', 0, W, 0, t, H, [[1.6, 6.4, 3.4], [9.4, 11.4, 3.0], [14.0, 17.8, 3.2]]);          // the front: the bar's wide door, the passage, the stable gate
  wall(T, 'stucco_rome', 0, t, 0, D, H, [], -0.4); wall(T, 'stucco_rome', W - t, W, 0, D, H, [], -0.4);
  wall(T, 'stucco_rome', 8.5, 8.9, t, fd, H, [[3.6, 5.2, 2.6]], -0.4, false);                                // the bar's side wall, a door to the passage
  wall(T, 'stucco_rome', 12.2, 12.6, t, fd, H, [[3.4, 5.4, 2.8]], -0.4, false);                              // the stable's wall
  wall(T, 'stucco_rome', 0, W, fd, fd + 0.5, H, [[10.0, 11.4, 3.0], [3.0, 6.0, 3.0]], -0.4);                 // the back of the front block: to the passage / the bar to the court
  wall(T, 'stucco_rome', 0, W, D - t, D, 5.2, [], -0.4);                                                      // the court's back wall
  // the bar-room: the counter in an L, dolia sunk in its top, the shelves behind with amphorae and cups
  B('brick', 0.9, 1.9, 1.6, 6.2, 0, 1.0, true); B('brick', 0.9, 4.4, 1.6, 2.6, 0, 1.0, true); B('marble_smooth', 0.88, 1.92, 1.58, 6.22, 1.0, 1.05); B('marble_smooth', 0.88, 4.42, 1.58, 2.62, 1.0, 1.05);
  for (const [u, d] of [[1.4, 2.4], [1.4, 4.0], [2.6, 2.1], [3.8, 2.1]]) { V('terracotta', [[0.2, 0], [0.22, 0.02], [0.22, 0.035], [0.17, 0.035], [0.17, 0.0]], u, d, 1.03, 12); V('lacquer_black', [[0.001, 0], [0.17, 0], [0.001, 0.001]], u, d, 1.04, 12); }
  for (const sy of [1.3, 1.9, 2.5]) B('timber', t, 0.9, 1.2, 6.6, sy, sy + 0.05, true);
  for (let k = 0; k < 7; k++) V('terracotta', D_.AMPH, 0.55, 1.5 + k * 0.7, 0, 10);
  for (let k = 0; k < 8; k++) V(k % 2 ? 'terracotta' : 'pottery_dark', [[0.04, 0], [0.07, 0.05], [0.075, 0.12], [0.04, 0.2], [0.001, 0.22]], 0.65, 1.5 + k * 0.62, 1.35 + (k % 3) * 0.6, 8);
  for (const [u, d] of [[5.0, 5.0], [6.9, 6.2], [4.4, 7.0], [7.0, 3.3]]) { table(T, u, d); stool(T, u - 0.9, d); stool(T, u + 0.9, d); stool(T, u, d + 0.7); }
  B('timber', 7.4, 8.5, 5.0, 7.7, 0.4, 0.45, true);                                                          // a bench along the wall
  for (const [u0, u1, d0, d1] of [[t, 8.5, fd - 0.01, fd], [8.5, 8.51, t, fd]]) { B('lacquer_black', u0, u1, d0, d1, 0.0, 0.9); B('wall_red', u0, u1, d0, d1, 0.9, 3.4); B('paint_ochre', u0, u1, d0, d1, 3.4, 3.6); }
  B('wall_red', 2.0, 4.6, 0.0, 0.02, 3.5, 3.9);
  // the passage with the shrine
  B('stucco', 9.5, 11.3, fd - 0.2, fd, 1.5, 2.9); B('wall_red', 9.7, 11.1, fd - 0.21, fd - 0.2, 1.7, 2.7); B('stucco', 9.4, 11.4, fd - 0.3, fd, 2.9, 3.0);
  // the stable: stalls of timber with mangers, hay, a post for the beasts
  for (let k = 0; k < 3; k++) { const d0 = t + 1.0 + k * 2.2; B('timber', 12.6, 17.6, d0 + 1.6, d0 + 1.7, 0.0, 1.2, true); B('timber', 12.8, 14.0, d0, d0 + 0.5, 0.7, 0.75); B('timber', 12.8, 14.0, d0, d0 + 0.05, 0.0, 0.75); B('timber', 12.8, 14.0, d0 + 0.45, d0 + 0.5, 0.0, 0.75); B('hide_tan', 12.9, 13.9, d0 + 0.05, d0 + 0.45, 0.7, 0.8); }
  for (let k = 0; k < 4; k++) B('hide_tan', 15 + (k % 2) * 1.5, 16.2 + (k % 2) * 1.5, fd - 1.4 + (k > 1 ? 0.5 : 0), fd - 0.6 + (k > 1 ? 0.5 : 0), 0, 0.6 + (k > 1 ? 0.5 : 0));
  // the roof of the front block
  B('timber', t, W - t, 0.0, fd + 0.5, H - 0.2, H);
  hip(ctx, T.R(0, W, 0, fd + 0.5), T.y + H, 2.0, 0.5);
  // the court: a well, the colonnade of posts under a lean-to along both sides and the back, the guest rooms behind it
  const cu = W / 2, cd = (fd + 0.5 + D - t) / 2 + 0.6;
  B('travertine', cu - 0.8, cu + 0.8, cd - 0.8, cd + 0.8, 0.0, 0.95, true); B('water', cu - 0.6, cu + 0.6, cd - 0.6, cd + 0.6, 0.5, 0.52);
  for (const u of [cu - 0.6, cu + 0.6]) B('timber', u - 0.07, u + 0.07, cd - 0.06, cd + 0.06, 0.95, 2.5);
  B('timber', cu - 0.7, cu + 0.7, cd - 0.07, cd + 0.07, 2.5, 2.6);
  const rd = D - t - 3.4;                                                                                  // the rooms along the back: depth 3.4
  for (let k = 0; k < 4; k++) {
    const u0 = t + 0.1 + k * (W - 2 * t - 0.2) / 4, u1 = u0 + (W - 2 * t - 0.2) / 4;
    wall(T, 'stucco_rome', u0, u1, rd, rd + 0.3, 3.6, [[(u0 + u1) / 2 - 0.5, (u0 + u1) / 2 + 0.5, 2.3]], -0.4);
    B('stucco_rome', u1 - 0.15, u1 + 0.15, rd, D - t, -0.4, 3.6, true);
    B('timber', u0 + 0.4, u0 + 1.9, rd + 1.0, rd + 2.9, 0.0, 0.5, true); B('linen', u0 + 0.45, u0 + 1.85, rd + 1.05, rd + 2.85, 0.5, 0.58); B('cloth_ochre', u0 + 0.45, u0 + 0.9, rd + 2.2, rd + 2.8, 0.58, 0.66);   // a bed
    V('terracotta', [[0.001, 0], [0.09, 0.0], [0.09, 0.4], [0.001, 0.4]], u1 - 0.5, D - t - 0.4, 0, 8);
    B('timber', u0 + 0.1, u1 - 0.1, rd, rd + 0.3, 3.55, 3.6);
    T.L((u0 + u1) / 2, rd + 1.8, 1.6, '#ffcf8a', 0.8, 5);
  }
  B('timber', t, W - t, rd, D - t, 3.6, 3.75); hip(ctx, T.R(0, W, rd, D), T.y + 3.75, 1.2, 0.4);
  for (let u = t + 1; u < W - t; u += 3.2) B('timber', u - 0.09, u + 0.09, rd - 0.2, rd - 0.02, 0.0, 3.2, true);
  B('timber', t, W - t, rd - 0.2, rd - 0.02, 3.2, 3.5);
  T.L(4.5, 4.0, 3.0, '#ffd9a0', 1.4, 9); T.L(15.5, 4.0, 2.4, '#ffe6c0', 0.7, 7); T.L(cu, cd, 3.5, '#fff0d4', 0.7, 10);
}

/**
 * fullonica: a fuller's workshop (dossier §4.13): a shop on the street with folded cloth on shelves and the counter; behind
 * it the open washing court: six treading vats in two rows (a walled tub each, the water in it), the stone cistern with its
 * spout, the great press of two posts and a beam with its screws, the wicker frame in which the cloth was bleached over
 * burning sulphur, racks of timber on which cloth dries, hearths.
 */
function fullonica(el, ctx) {
  const T = tools(el, ctx), { W, D, B, V } = T, rand = rng(el.seed || 11), t = 0.5, H = 4.6, sd = 6.0;
  T.B('flagstone', t, W - t, t, D - t, -0.3, 0.0); T.col.floor(T.R(t, W - t, t, D - t), T.y);
  wall(T, 'stucco_rome', 0, W, 0, t, H, [[1.4, 5.8, 3.3], [W - 5.0, W - 2.6, 3.0]]);
  wall(T, 'stucco_rome', 0, t, 0, D, H, [], -0.4); wall(T, 'stucco_rome', W - t, W, 0, D, H, [], -0.4);
  wall(T, 'stucco_rome', 0, W, D - t, D, 5.0, [], -0.4);
  wall(T, 'stucco_rome', 0, W, sd, sd + 0.4, H, [[W - 5.0, W - 2.6, 3.0], [2.5, 4.5, 2.8]], -0.4);
  // the shop: shelves of folded cloth, the counter, a bale
  for (const sy of [0.6, 1.3, 2.0, 2.7]) B('timber', t, 5.5, sd - 0.5, sd - 0.05, sy, sy + 0.05, true);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) B(['linen', 'cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo'][(k + r) % 5], t + 0.2 + k * 1.0, t + 1.0 + k * 1.0, sd - 0.45, sd - 0.1, 0.65 + r * 0.7, 0.9 + r * 0.7);
  B('brick', 1.2, 5.6, 1.4, 2.0, 0, 0.95, true); B('marble_smooth', 1.18, 5.62, 1.38, 2.02, 0.95, 1.0);
  for (let k = 0; k < 3; k++) B(['linen', 'cloth_white', 'cloth_ochre'][k], 1.6 + k * 1.3, 2.6 + k * 1.3, 1.5, 1.9, 1.0, 1.12);
  B('wall_red', 1.8, 4.6, 0.0, 0.02, 3.4, 3.8);
  B('timber', t, W - t, 0, sd + 0.4, H - 0.2, H); hip(ctx, T.R(0, W, 0, sd + 0.4), T.y + H, 1.8, 0.5);
  // the court: six treading vats of stone in two rows with the channel between them
  const cd0 = sd + 2.0;
  for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
    const u = 2.2 + k * 2.2, d = cd0 + r * 3.6;
    B('travertine', u - 0.9, u + 0.9, d - 0.9, d + 0.9, 0, 0.95, true); B('water', u - 0.7, u + 0.7, d - 0.7, d + 0.7, 0.6, 0.63);
    B('travertine', u - 0.95, u + 0.95, d - 0.95, d - 0.85, 0.95, 1.02); B('travertine', u - 0.95, u + 0.95, d + 0.85, d + 0.95, 0.95, 1.02);
    B('travertine', u - 0.95, u - 0.85, d - 0.85, d + 0.85, 0.95, 1.02); B('travertine', u + 0.85, u + 0.95, d - 0.85, d + 0.85, 0.95, 1.02);
  }
  B('travertine', 1.2, 7.8, cd0 + 1.7, cd0 + 1.95, 0.0, 0.1); B('water', 1.3, 7.7, cd0 + 1.72, cd0 + 1.93, 0.0, 0.06);
  // the cistern with its spout, in the back corner; the press of two posts, a beam and screws
  B('travertine', W - 3.6, W - t - 0.2, D - t - 2.2, D - t - 0.1, 0, 1.7, true); B('water', W - 3.4, W - t - 0.4, D - t - 2.0, D - t - 0.3, 1.6, 1.64);
  V('bronze', [[0.001, 0], [0.04, 0.0], [0.05, 0.03], [0.04, 0.3], [0.001, 0.3]], W - 2.0, D - t - 2.28, 1.0, 8);
  const pu = W - 6.0, pd = cd0 + 0.8;
  for (const s of [-1, 1]) B('wood_dark', pu + s * 1.2 - 0.15, pu + s * 1.2 + 0.15, pd - 0.15, pd + 0.15, 0, 3.0, true);
  B('wood_dark', pu - 1.5, pu + 1.5, pd - 0.18, pd + 0.18, 2.9, 3.25); B('wood_dark', pu - 1.1, pu + 1.1, pd - 0.15, pd + 0.15, 1.55, 1.8); B('timber', pu - 0.9, pu + 0.9, pd - 0.7, pd + 0.7, 0, 0.5, true);
  for (const s of [-1, 1]) V('timber', [[0.001, 0], [0.06, 0.0], [0.06, 2.0], [0.001, 2.0]], pu + s * 0.55, pd, 1.25, 6);
  // the wicker frame over the sulphur: a cone of wicker over a brazier
  V('wicker', [[0.9, 0], [0.8, 0.5], [0.6, 1.1], [0.3, 1.6], [0.001, 1.9]], 2.4, D - 3.0, 0.0, 12); T.C(2.4, D - 3.0, 0.9, 0, 1.9);
  B('brick', 3.4, 4.2, D - 3.4, D - 2.6, 0, 0.4, true);
  // the drying racks along the side wall with cloth hung over them
  for (let k = 0; k < 3; k++) {
    const d0 = cd0 + 0.4 + k * 2.4; B('timber', W - t - 1.3, W - t - 1.2, d0, d0 + 0.08, 0, 2.4, true); B('timber', W - t - 1.3, W - t - 1.2, d0 + 1.9, d0 + 1.98, 0, 2.4, true); B('timber', W - t - 1.3, W - t - 1.2, d0, d0 + 1.98, 2.3, 2.4);
    B(['cloth_white', 'linen', 'cloth_ochre'][k], W - t - 1.28, W - t - 1.22, d0 + 0.1, d0 + 1.9, 0.9, 2.3);
  }
  for (let k = 0; k < 3; k++) { B('timber', t, t + 0.1, cd0 + k * 2.6, cd0 + k * 2.6 + 0.1, 0, 2.2, true); }
  B('timber', t, t + 0.1, cd0, cd0 + 5.3, 2.1, 2.2); B('cloth_white', t + 0.02, t + 0.08, cd0 + 0.2, cd0 + 5.1, 1.0, 2.1);
  T.L(4, 3.0, 3.0, '#ffe6c0', 1.2, 8); T.L(W / 2, D / 2, 4.5, '#fff0d4', 0.8, 12);
}
Object.assign(STYLES.roman.elements, { caupona, fullonica });
void D_;
