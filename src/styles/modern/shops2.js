// Four more shops of the Sydney of 1973 to walk into (docs/settlements/sydney.md §1g): a Greek milk bar, a butcher, a chemist and a
// barber, fitted into the shell of shops.js (shopRoom). Each fit gets the shell's tools: bag (visual geometry by material), B (a box in
// the shop's frame: u along the front, d inward), W (a point), S (a box that also blocks the walker), the floor F, the wall T, the
// width L, the depth Dp, the door's centre du; each leaves the door's line (u = du, from the front to the counter) free and lights the
// room with two lights at most.
import { lathe, rod } from '../../core/geom.js';

/** The milk bar: a long counter down the right wall with chrome stools, a cake case, the milk-shake mixers and a pie warmer, the soft-drink fridge and the ice-cream freezer, three booths with yellow formica tables down the left, a jukebox. */
export function milkbar(c) {
  const { bag, B, W, S, L, Dp, F, T, pend, light } = c;
  const cu0 = L - T - 2.2, cu1 = L - T - 1.55, d0 = T + 1.7, d1 = Dp - T - 0.9;
  S('wood_painted', cu0, cu1, d0, d1, F, F + 1.0); bag.add('tile_green', B(cu0 - 0.02, cu0, d0, d1, F + 0.1, F + 0.95)); bag.add('steel_chrome', B(cu0 - 0.04, cu0, d0, d1, F + 0.12, F + 0.16)); bag.add('paint_cab_yellow', B(cu0 - 0.08, cu1 + 0.05, d0 - 0.05, d1 + 0.05, F + 1.0, F + 1.04));
  for (let d = d0 + 0.5; d < d1 - 0.2; d += 0.75) { const p = W(cu0 - 0.5, d, F); bag.add('steel_chrome', lathe([[0.18, 0], [0.18, 0.03], [0.04, 0.06], [0.035, 0.58], [0.001, 0.58]], 10, null, p[0], p[1], p[2])); bag.add('car_red', lathe([[0.17, 0], [0.18, 0.05], [0.15, 0.08], [0.001, 0.09]], 12, null, p[0], p[1] + 0.58, p[2])); }
  // on the counter: the glass case of sponges and custard tarts, two mixers with their steel cups, the pie warmer, the till
  const cu = (cu0 + cu1) / 2;
  bag.add('glass_outer', B(cu - 0.28, cu + 0.28, d0 + 0.3, d0 + 1.5, F + 1.04, F + 1.45)); for (const h of [1.04, 1.25]) bag.add('aluminium_dull', B(cu - 0.3, cu + 0.3, d0 + 0.28, d0 + 1.52, F + h, F + h + 0.03));
  for (let k = 0; k < 6; k++) bag.add(['terracotta', 'cloth_ochre', 'paint_white', 'cloth_maroon'][k % 4], lathe([[0.001, 0], [0.09, 0.01], [0.08, 0.07], [0.001, 0.09]], 10, null, ...W(cu - 0.1 + (k % 2) * 0.2, d0 + 0.5 + (k >> 1) * 0.35, F + 1.045)));
  for (const d of [d0 + 2.0, d0 + 2.4]) { const p = W(cu, d, F + 1.04); bag.add('steel_chrome', B(cu - 0.1, cu + 0.1, d - 0.1, d + 0.1, F + 1.04, F + 1.5)); bag.add('car_cream', lathe([[0.06, 0], [0.075, 0.2], [0.001, 0.2]], 10, null, p[0], p[1] + 0.02, p[2])); }
  bag.add('steel_chrome', B(cu - 0.22, cu + 0.22, d1 - 1.4, d1 - 0.6, F + 1.04, F + 1.5)); bag.add('glass_lamp', B(cu - 0.2, cu + 0.2, d1 - 1.38, d1 - 0.62, F + 1.2, F + 1.45)); bag.add('car_black', B(cu - 0.18, cu + 0.18, d1 - 0.5, d1 - 0.1, F + 1.04, F + 1.3));
  // the staff side: the soft-drink fridge (white, glass front, rows of bottles), the freezer chest and its tubs, the back shelves of lollies and cigarettes
  const bu = L - T - 0.05;
  S('paint_white', bu - 0.7, bu, d0 + 0.2, d0 + 1.2, F, F + 1.9); bag.add('glass_outer', B(bu - 0.72, bu - 0.7, d0 + 0.28, d0 + 1.12, F + 0.2, F + 1.8));
  for (const h of [0.45, 0.85, 1.25, 1.6]) for (let d = d0 + 0.32; d < d0 + 1.1; d += 0.12) bag.add(['car_red', 'cloth_green', 'paint_cab_yellow', 'cloth_ochre'][Math.round(d * 9 + h * 5) % 4], lathe([[0.03, 0], [0.032, 0.17], [0.015, 0.23], [0.001, 0.23]], 6, null, ...W(bu - 0.45, d, F + h)));
  S('paint_white', bu - 0.75, bu, d0 + 1.5, d0 + 2.7, F, F + 0.85); bag.add('car_blue', B(bu - 0.77, bu - 0.75, d0 + 1.5, d0 + 2.7, F + 0.5, F + 0.78)); bag.add('paint_white', B(bu - 0.73, bu - 0.02, d0 + 1.55, d0 + 2.65, F + 0.85, F + 0.89));
  for (let d = d0 + 3.0; d < d1 - 0.2; d += 0.2) for (const h of [1.1, 1.45, 1.8]) bag.add(['car_red', 'paint_cab_yellow', 'cloth_green', 'car_blue', 'paint_white'][Math.round(d * 7 + h * 3) % 5], B(bu - 0.28, bu - 0.04, d, d + 0.15, F + h, F + h + 0.22));
  for (const h of [1.08, 1.43, 1.78]) bag.add('timber', B(bu - 0.3, bu - 0.02, d0 + 2.9, d1, F + h - 0.03, F + h));
  bag.add('car_red', B(bu - 0.04, bu, d0 + 1.4, d0 + 2.8, F + 1.95, F + 2.45)); bag.add('paint_white', B(bu - 0.06, bu - 0.04, d0 + 1.5, d0 + 2.7, F + 2.05, F + 2.35));      // the ice-cream sign
  // the booths down the left wall: benches of red vinyl facing across a yellow formica table
  for (let d = T + 1.5; d + 1.9 < Dp - T - 1.0; d += 2.15) {
    S('paint_cab_yellow', T, T + 0.95, d + 0.55, d + 1.35, F + 0.68, F + 0.73); bag.add('steel_chrome', B(T + 0.5, T + 0.56, d + 0.9, d + 0.96, F, F + 0.68));
    for (const [a, b, back] of [[d + 0.0, d + 0.45, d - 0.02], [d + 1.45, d + 1.9, d + 1.87]]) {
      S('car_red', T + 0.04, T + 0.92, a, b, F + 0.0, F + 0.44); bag.add('car_red', B(T + 0.04, T + 0.92, back, back + 0.06 * (back > a ? 1 : -1) + (back > a ? 0 : 0.0), F + 0.44, F + 1.0));
    }
  }
  // the jukebox by the door's other side
  const ju = L * 0.62, jd = T + 0.5; S('car_blue', ju - 0.4, ju + 0.4, jd - 0.3, jd + 0.2, F, F + 1.25); bag.add('glass_lamp', B(ju - 0.25, ju + 0.25, jd + 0.2, jd + 0.22, F + 0.5, F + 1.0));
  pend(L * 0.4, Dp * 0.3); pend(L * 0.4, Dp * 0.65); light(L * 0.45, Dp * 0.35, '#fff0d0'); light(L * 0.45, Dp * 0.7, '#ffe6c0');
}

/** The butcher: white-tiled walls, a marble-topped counter of trays of chops, sausages and mince under a glass hood, the carcasses on the hooks of a rail, the block with its cleaver, the mincer and scales, sawdust on the floor, the cold-room door. */
export function butcher(c) {
  const { bag, B, W, S, L, Dp, F, T, pend, light } = c;
  for (const [a, b] of [[T, T + 0.03], [L - T - 0.03, L - T]]) bag.add('tile_white', B(a, b, T + 0.15, Dp - T, F + 0.0, F + 2.0));
  bag.add('tile_white', B(T, L - T, Dp - T - 0.03, Dp - T, F, F + 2.0));
  bag.add('sacking', B(T + 0.6, L - T - 0.6, Dp - 3.5, Dp - T - 0.1, F, F + 0.01));                                   // the sawdust
  const cd0 = Dp - T - 2.7, cd1 = Dp - T - 1.95, u0 = T + 1.1, u1 = L - T - 1.1;
  S('tile_white', u0, u1, cd0, cd1, F, F + 1.0); bag.add('marble', B(u0 - 0.04, u1 + 0.04, cd0 - 0.05, cd1 + 0.05, F + 1.0, F + 1.05)); bag.add('steel_chrome', B(u0, u1, cd0 - 0.06, cd0 - 0.03, F + 0.1, F + 0.15));
  bag.add('glass_outer', B(u0, u1, cd0 - 0.02, cd0 + 0.04, F + 1.05, F + 1.45)); bag.add('aluminium_dull', B(u0, u1, cd0 - 0.03, cd0 + 0.05, F + 1.42, F + 1.46));
  for (let u = u0 + 0.15, k = 0; u < u1 - 0.6; u += 0.75, k++) {      // trays of meat, each with its own colour and shape
    bag.add('steel_chrome', B(u, u + 0.65, cd0 + 0.1, cd1 - 0.1, F + 1.05, F + 1.09));
    if (k % 3 === 0) for (let j = 0; j < 4; j++) bag.add('cloth_red', B(u + 0.04 + j * 0.15, u + 0.16 + j * 0.15, cd0 + 0.15, cd1 - 0.15, F + 1.09, F + 1.15));
    else if (k % 3 === 1) bag.add('terracotta', B(u + 0.05, u + 0.6, cd0 + 0.15, cd1 - 0.15, F + 1.09, F + 1.2));
    else for (let j = 0; j < 5; j++) bag.add('cloth_ochre', rod(W(u + 0.05 + j * 0.12, cd0 + 0.15, F + 1.13), W(u + 0.05 + j * 0.12, cd1 - 0.15, F + 1.13), 0.03, 5));
  }
  bag.add('steel_chrome', B(u1 - 0.5, u1 - 0.1, cd0 + 0.1, cd0 + 0.5, F + 1.05, F + 1.2)); bag.add('paint_white', lathe([[0.001, 0], [0.18, 0], [0.18, 0.02], [0.001, 0.02]], 14, null, ...W(u1 - 0.3, cd0 + 0.3, F + 1.2)));   // the scale
  // the rail along the back wall over the counter, the carcasses and joints on their hooks
  const rd = Dp - T - 0.8;
  bag.add('steel_chrome', rod(W(T + 0.3, rd, F + 2.4), W(L - T - 0.3, rd, F + 2.4), 0.02, 6));
  for (let u = T + 0.9, k = 0; u < L - T - 0.6; u += 0.8, k++) {
    const p = W(u, rd, F + 2.35); bag.add('steel_chrome', rod(W(u, rd, F + 2.4), W(u, rd, F + 2.25), 0.012, 4));
    bag.add(k % 2 ? 'cloth_red' : 'marble_pink', lathe([[0.001, 0], [0.12, 0.2], [0.17, 0.55], [0.13, 0.95], [0.06, 1.2], [0.001, 1.25]], 8, null, p[0], p[1] - 1.45, p[2]));
    if (k % 3 === 0) bag.add('hide_white', B(u - 0.02, u + 0.02, rd - 0.1, rd + 0.1, F + 0.9, F + 1.5));
  }
  // the block, the mincer and the cold-room door
  { const p = W(L - T - 1.0, Dp - T - 1.1, F); bag.add('timber', lathe([[0.36, 0], [0.36, 0.85], [0.001, 0.85]], 14, null, p[0], p[1], p[2])); bag.add('steel_chrome', B(L - T - 1.1, L - T - 0.9, Dp - T - 1.15, Dp - T - 1.05, F + 0.86, F + 0.88)); }
  S('steel_grey', T + 0.2, T + 0.8, Dp - T - 1.2, Dp - T - 0.5, F, F + 0.95); bag.add('steel_chrome', B(T + 0.25, T + 0.75, Dp - T - 1.15, Dp - T - 0.55, F + 0.95, F + 1.2));
  bag.add('steel_chrome', B(T + 1.3, T + 2.3, Dp - T - 0.1, Dp - T, F, F + 2.0)); bag.add('car_black', B(T + 2.1, T + 2.2, Dp - T - 0.16, Dp - T - 0.1, F + 0.9, F + 1.3));
  // a price board by the door
  bag.add('car_black', B(L - T - 1.3, L - T - 0.1, T + 0.15, T + 0.2, F + 1.0, F + 1.8)); for (let k = 0; k < 6; k++) bag.add('paint_white', B(L - T - 1.2, L - T - 0.3 - (k % 3) * 0.12, T + 0.2, T + 0.22, F + 1.65 - k * 0.12, F + 1.7 - k * 0.12));
  pend(L * 0.4, Dp * 0.35, 0.7); pend(L * 0.5, Dp * 0.7, 0.7); light(L * 0.5, Dp * 0.4, '#fff4e0'); light(L * 0.5, Dp * 0.75, '#ffe6d0');
}

/** The chemist: the dispensary at the back behind a glass counter, the great coloured carboys, the shelves of tonics and cough mixture down the walls, a stand of cosmetics, the weighing machine, a stool. */
export function chemist(c) {
  const { bag, B, W, S, L, Dp, F, T, du, pend, light } = c;
  const SH = ['paint_white', 'glaze_blue', 'glaze_green', 'car_blue', 'cloth_ochre', 'car_cream', 'cloth_red'];
  for (const [side, a] of [[0, T], [1, L - T - 0.3]]) {
    S('wood_painted', a, a + 0.3, T + 1.0, Dp - T - 3.0, F, F + 0.8);
    for (const h of [1.0, 1.35, 1.7, 2.05]) { bag.add('timber', B(a, a + 0.3, T + 1.0, Dp - T - 3.0, F + h, F + h + 0.03)); for (let d = T + 1.05; d < Dp - T - 3.05; d += 0.17) bag.add(SH[(Math.round(d * 7) + Math.round(h * 5) + side) % 7], B(a + 0.04, a + 0.26, d, d + 0.12, F + h + 0.03, F + h + 0.03 + 0.14 + ((Math.round(d * 13) % 3) * 0.04))); }
  }
  const cd0 = Dp - T - 2.8, cd1 = Dp - T - 2.1;
  S('wood_painted', T + 1.0, L - T - 1.0, cd0, cd1, F, F + 1.0); bag.add('glass_outer', B(T + 1.1, L - T - 1.1, cd0 + 0.04, cd1 - 0.04, F + 1.0, F + 1.3)); bag.add('aluminium_dull', B(T + 1.05, L - T - 1.05, cd0, cd1, F + 1.28, F + 1.32));
  for (let u = T + 1.3; u < L - T - 1.6; u += 0.4) bag.add(SH[Math.round(u * 5) % 7], B(u, u + 0.28, cd0 + 0.1, cd1 - 0.1, F + 1.0, F + 1.1 + (Math.round(u * 7) % 3) * 0.06));
  // the dispensary: shelves on the back wall with the big carboys, labelled jars, a mortar, the scale
  const bd = Dp - T - 0.05;
  S('wood_painted', T + 1.0, L - T - 1.0, bd - 0.5, bd, F, F + 0.9);
  bag.add('timber', B(T + 1.0, L - T - 1.0, bd - 0.45, bd - 0.02, F + 0.9, F + 0.95));
  for (const h of [1.5, 2.0]) bag.add('timber', B(T + 1.0, L - T - 1.0, bd - 0.35, bd - 0.02, F + h, F + h + 0.04));
  for (let u = T + 1.3, k = 0; u < L - T - 1.2; u += 0.55, k++) bag.add(['glaze_green', 'car_red', 'glaze_blue', 'cloth_ochre'][k % 4], lathe([[0.001, 0], [0.12, 0.02], [0.15, 0.18], [0.1, 0.32], [0.04, 0.4], [0.05, 0.5], [0.001, 0.52]], 10, null, ...W(u, bd - 0.2, F + 2.04)));
  for (let u = T + 1.2; u < L - T - 1.1; u += 0.26) bag.add(['paint_white', 'glass_outer', 'cloth_brown'][Math.round(u * 6) % 3], lathe([[0.001, 0], [0.05, 0.0], [0.055, 0.12], [0.03, 0.17], [0.001, 0.17]], 8, null, ...W(u, bd - 0.2, F + 1.54)));
  bag.add('steel_chrome', B(L / 2 - 0.2, L / 2 + 0.2, bd - 0.4, bd - 0.1, F + 0.95, F + 1.1)); bag.add('paint_white', lathe([[0.001, 0], [0.12, 0], [0.12, 0.03], [0.001, 0.03]], 12, null, ...W(L / 2 - 0.55, bd - 0.25, F + 0.95)));
  // the cosmetics stand and the weighing machine near the door
  { const p = W(L * 0.28, Dp * 0.4, F); bag.add('iron', lathe([[0.001, 0], [0.2, 0], [0.03, 0.04], [0.03, 1.1], [0.001, 1.1]], 8, null, p[0], p[1], p[2])); for (const h of [0.5, 0.8, 1.1]) bag.add('paint_white', lathe([[0.001, 0], [0.3 - (h - 0.5) * 0.3, 0], [0.3 - (h - 0.5) * 0.3, 0.03], [0.001, 0.03]], 12, null, p[0], p[1] + h, p[2])); for (let k = 0; k < 8; k++) bag.add(SH[k % 7], B(L * 0.28 + Math.cos(k) * 0.18, L * 0.28 + Math.cos(k) * 0.18 + 0.08, Dp * 0.4 + Math.sin(k) * 0.18, Dp * 0.4 + Math.sin(k) * 0.18 + 0.06, F + 0.53 + (k % 3) * 0.3, F + 0.63 + (k % 3) * 0.3)); }
  S('steel_chrome', du - 0.9 + 0.0 - 0.3, du - 0.9 + 0.3, T + 0.5, T + 0.9, F, F + 1.3); bag.add('paint_white', B(du - 1.0, du - 0.8, T + 0.88, T + 0.92, F + 1.0, F + 1.2));
  pend(L * 0.4, Dp * 0.3, 0.7); pend(L * 0.5, Dp * 0.62, 0.7); light(L * 0.5, Dp * 0.35, '#fff6e6'); light(L * 0.5, Dp * 0.68, '#fff6e6');
}

/** The barber: two chairs of red leather and chrome before a long mirror on the left wall with its shelf of tonics, combs and clippers, a basin, the waiting bench with the day's papers, a hat stand, the radio. */
export function barber(c) {
  const { bag, B, W, S, L, Dp, F, T, du, pend, light } = c;
  bag.add('cloth_red', B(T + 0.4, T + 2.6, T + 1.2, Dp - T - 2.2, F, F + 0.012));                                     // a rug
  const d0 = T + 1.0, d1 = Dp - T - 2.0;
  S('wood_painted', T, T + 0.42, d0, d1, F, F + 0.85); bag.add('marble', B(T, T + 0.45, d0 - 0.02, d1 + 0.02, F + 0.85, F + 0.89)); bag.add('mirror_tin', B(T + 0.01, T + 0.04, d0, d1, F + 1.0, F + 2.5)); bag.add('timber', B(T, T + 0.06, d0 - 0.04, d1 + 0.04, F + 0.97, F + 1.0));
  for (let d = d0 + 0.2, k = 0; d < d1 - 0.2; d += 0.32, k++) { bag.add(['glaze_green', 'car_red', 'glass_outer', 'glaze_blue'][k % 4], lathe([[0.001, 0], [0.04, 0.0], [0.045, 0.14], [0.02, 0.2], [0.001, 0.2]], 8, null, ...W(T + 0.2, d, F + 0.89))); if (k % 2) bag.add('car_black', B(T + 0.1, T + 0.3, d + 0.1, d + 0.2, F + 0.89, F + 0.9)); }
  for (const d of [d0 + 1.2, d0 + 3.2]) if (d < d1 - 0.5) {
    const p = W(T + 1.15, d, F);
    bag.add('steel_chrome', lathe([[0.3, 0], [0.3, 0.05], [0.08, 0.1], [0.07, 0.45], [0.001, 0.45]], 12, null, p[0], p[1], p[2]));
    bag.add('car_red', B(T + 0.88, T + 1.42, d - 0.27, d + 0.27, F + 0.45, F + 0.58)); bag.add('car_red', B(T + 1.26, T + 1.42, d - 0.25, d + 0.25, F + 0.58, F + 1.2)); bag.add('car_red', B(T + 1.1, T + 1.5, d - 0.08, d + 0.08, F + 1.2, F + 1.45));
    bag.add('car_red', B(T + 0.88, T + 0.92, d - 0.26, d - 0.2, F + 0.58, F + 0.75)); bag.add('car_red', B(T + 0.88, T + 0.92, d + 0.2, d + 0.26, F + 0.58, F + 0.75)); bag.add('steel_chrome', B(T + 0.5, T + 0.8, d - 0.2, d + 0.2, F + 0.12, F + 0.15));
    S('steel_chrome', T + 0.88, T + 1.5, d - 0.3, d + 0.3, F, F + 0.5);
  }
  // the basin at the back, the hot-towel steamer, the hat stand by the door, the radio on the shelf
  S('paint_white', T + 0.05, T + 0.7, Dp - T - 1.1, Dp - T - 0.1, F, F + 0.85); bag.add('steel_chrome', rod(W(T + 0.3, Dp - T - 0.2, F + 0.85), W(T + 0.3, Dp - T - 0.2, F + 1.1), 0.02, 5)); bag.add('mirror_tin', B(T + 0.05, T + 0.7, Dp - T - 0.04, Dp - T, F + 1.1, F + 2.2));
  { const p = W(L - T - 0.35, Dp - T - 0.6, F); bag.add('steel_chrome', lathe([[0.001, 0], [0.16, 0], [0.16, 0.3], [0.001, 0.3]], 10, null, p[0], p[1] + 0.85, p[2])); }
  S('wood_painted', L - T - 0.7, L - T, Dp - T - 1.2, Dp - T, F, F + 0.85);
  { const p = W(L - T - 0.35, T + 0.6, F); bag.add('iron', lathe([[0.001, 0], [0.18, 0], [0.025, 0.04], [0.025, 1.7], [0.001, 1.7]], 8, null, p[0], p[1], p[2])); for (let k = 0; k < 4; k++) bag.add('iron', rod([p[0], p[1] + 1.6, p[2]], [p[0] + Math.cos(k * 1.6) * 0.15, p[1] + 1.75, p[2] + Math.sin(k * 1.6) * 0.15], 0.008, 4)); bag.add('hide_brown', lathe([[0.001, 0], [0.14, 0], [0.12, 0.1], [0.001, 0.12]], 10, null, p[0], p[1] + 1.76, p[2])); }
  // the waiting bench along the right wall with papers on it
  S('wood_painted', L - T - 0.5, L - T - 0.04, T + 1.5, T + 3.7, F, F + 0.45); bag.add('leather_bench', B(L - T - 0.5, L - T - 0.04, T + 1.5, T + 3.7, F + 0.45, F + 0.52)); bag.add('leather_bench', B(L - T - 0.1, L - T - 0.04, T + 1.5, T + 3.7, F + 0.52, F + 1.0));
  for (let k = 0; k < 4; k++) bag.add(['paint_white', 'cloth_grey', 'car_cream', 'cloth_blue'][k], B(L - T - 0.45, L - T - 0.15, T + 1.7 + k * 0.45, T + 2.0 + k * 0.45, F + 0.52, F + 0.54));
  S('wood_painted', L - T - 0.5, L - T - 0.04, T + 4.2, T + 4.6, F, F + 0.5);
  void du; pend(L * 0.4, Dp * 0.3, 0.7); pend(L * 0.4, Dp * 0.62, 0.7); light(L * 0.4, Dp * 0.35, '#fff0d8'); light(L * 0.4, Dp * 0.7, '#fff0d8');
}
