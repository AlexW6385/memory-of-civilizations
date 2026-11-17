// Three more shops of the Sydney of 1973 to walk into, on the streets of the city beyond the quay (docs/settlements/sydney.md §1k):
// a Greek-run fish-and-chip shop, a hardware store and a bakery, each fitted into the shell of shops.js (shopRoom). The fits get the
// shell's tools: bag, B (a box in the shop's frame: u along the front, d inward), W (a point), S (a box that also blocks the walker),
// the floor F, the wall T, the width L, the depth Dp, the door's centre du, rs (the reading direction of a wall's lettering); each
// leaves the door's line (u = du, from the front to the counter) free, closes the room behind the counter with a partition (the
// back of the shop is a store one does not enter) and lights it with two lights at most.
import { lathe, rod, fromTriangles } from '../../core/geom.js';
import { Quads, letters, textLen, fitCell } from '../artdeco/dress.js';

/** A wall of the shop's back, partition at depth d from wall to wall, the ceiling's underside C above. */
const partition = (c, d) => { const { bag, B, S, L, F, T, H1 } = c; S('plaster_white', T, L - T, d, d + 0.12, F, F + H1 - 0.3); bag.add('wood_dark', B(du(c) - 0.5, du(c) + 0.5, d - 0.04, d, F, F + 2.05)); };
const du = (c) => c.du;
/** A line of lettering on the partition, facing the shop. */
function sign(c, text, ucentre, d, y, cell, mat) {
  const { bag, W, rs } = c, Q = new Quads(), tl = textLen(text, cell);
  letters(Q.t(mat), text, cell, (h, v) => W(ucentre - rs * tl / 2 + rs * h, d, y + v), 0, 0);
  for (const [m, T2] of Q.m) bag.add(m, fromTriangles(T2));
}

/**
 * The fish-and-chip shop, Greek-run as most were: white tiled walls, a counter across the shop under its hot cabinet of battered fish, saveloys,
 * potato cakes and chips, the stack of white paper and newspaper for the wrapping, the till; behind it the two kettle fryers under a hood with
 * its flue, the wire baskets, the sack of potatoes; the waiting bench, the drinks fridge, the menu board.
 */
export function fishChips(c) {
  const { bag, B, W, S, L, Dp, F, T, H1, pend, light } = c, C = F + H1 - 0.3;
  const cd = Math.min(6.0, Dp - T - 3.2), cu0 = T + 0.7, cu1 = L - T - 0.7, pd = cd + 2.5;
  for (const [a, b] of [[T + 0.03, T + 0.05], [L - T - 0.05, L - T - 0.03]]) bag.add('tile_white', B(a, b, T + 0.15, pd, F, F + 1.9));
  partition(c, pd);
  bag.add('tile_white', B(T + 0.05, L - T - 0.05, pd - 0.03, pd, F, F + 1.9));
  // the counter and its hot cabinet
  S('wood_painted', cu0, cu1, cd, cd + 0.7, F, F + 1.0); bag.add('tile_cream', B(cu0, cu1, cd - 0.02, cd, F + 0.1, F + 0.95)); bag.add('aluminium_dull', B(cu0 - 0.04, cu1 + 0.04, cd - 0.05, cd + 0.75, F + 1.0, F + 1.04));
  const k0 = cu0 + 1.0, k1 = cu0 + 4.6;
  bag.add('glass_outer', B(k0, k1, cd + 0.04, cd + 0.06, F + 1.1, F + 1.7)); bag.add('aluminium_dull', B(k0 - 0.03, k1 + 0.03, cd + 0.02, cd + 0.66, F + 1.7, F + 1.74));
  for (const u of [k0, k1]) bag.add('aluminium_dull', B(u - 0.03, u + 0.03, cd + 0.02, cd + 0.66, F + 1.04, F + 1.7));
  for (const h of [1.04, 1.38]) bag.add('aluminium_dull', B(k0, k1, cd + 0.08, cd + 0.62, F + h, F + h + 0.03));
  for (let u = k0 + 0.2; u < k1 - 0.3; u += 0.34) {
    bag.add('cloth_ochre', B(u, u + 0.28, cd + 0.12, cd + 0.34, F + 1.07, F + 1.17));                               // battered fish
    bag.add('cloth_ochre', B(u + 0.02, u + 0.26, cd + 0.4, cd + 0.58, F + 1.07, F + 1.15));
    if (((u * 10) | 0) % 3 === 0) for (let d = 0.2; d < 0.6; d += 0.14) bag.add('car_red', rod(W(u + 0.02, cd + d, F + 1.45), W(u + 0.28, cd + d, F + 1.45), 0.03, 6));   // saveloys
    else for (let q = 0; q < 2; q++) bag.add('hide_tan', lathe([[0.001, 0], [0.07, 0.01], [0.07, 0.05], [0.001, 0.055]], 10, null, ...W(u + 0.08 + q * 0.14, cd + 0.2 + q * 0.2, F + 1.41)));   // potato cakes
  }
  bag.add('paint_cab_yellow', B(k0 + 0.3, k0 + 1.2, cd + 0.4, cd + 0.6, F + 1.41, F + 1.5));                              // a tray of chips
  // the wrapping: a stack of white paper, one of newspaper, the till, salt and vinegar
  bag.add('paint_white', B(k1 + 0.4, k1 + 0.9, cd + 0.2, cd + 0.6, F + 1.04, F + 1.16)); bag.add('cloth_grey', B(k1 + 1.0, k1 + 1.5, cd + 0.2, cd + 0.6, F + 1.04, F + 1.18));
  bag.add('steel_chrome', B(cu1 - 1.1, cu1 - 0.5, cd + 0.2, cd + 0.6, F + 1.04, F + 1.3)); bag.add('car_cream', B(cu1 - 1.08, cu1 - 0.52, cd + 0.22, cd + 0.4, F + 1.3, F + 1.4));
  bag.add('glass_outer', lathe([[0.001, 0], [0.03, 0], [0.03, 0.1], [0.02, 0.13], [0.001, 0.13]], 8, null, ...W(k1 + 0.15, cd + 0.12, F + 1.04))); bag.add('cloth_brown', lathe([[0.001, 0], [0.04, 0], [0.04, 0.17], [0.015, 0.22], [0.001, 0.22]], 8, null, ...W(k1 + 0.27, cd + 0.12, F + 1.04)));
  // behind the counter: two kettle fryers of steel with their hood and flue, the baskets on a rail, the chips' potatoes in a sack
  for (const u of [L * 0.3, L * 0.3 + 1.15]) {
    S('steel_chrome', u - 0.5, u + 0.5, pd - 1.0, pd - 0.1, F, F + 0.9); bag.add('steel_grey', B(u - 0.4, u + 0.4, pd - 0.9, pd - 0.2, F + 0.9, F + 0.93)); bag.add('paint_cab_yellow', B(u - 0.36, u + 0.36, pd - 0.86, pd - 0.24, F + 0.93, F + 0.96));
    bag.add('iron', rod(W(u - 0.3, pd - 0.3, F + 0.95), W(u - 0.3, pd - 0.75, F + 1.15), 0.015, 5));                    // a basket's handle
  }
  bag.add('aluminium_dull', B(L * 0.3 - 0.7, L * 0.3 + 1.85, pd - 1.1, pd - 0.05, F + 2.1, F + 2.7)); bag.add('aluminium_dull', B(L * 0.3 + 0.35, L * 0.3 + 0.75, pd - 0.7, pd - 0.3, F + 2.7, C));
  bag.add('iron', rod(W(L * 0.3 - 0.6, pd - 0.18, F + 1.8), W(L * 0.3 + 1.8, pd - 0.18, F + 1.8), 0.015, 5));        // the rail of the wire baskets
  for (let u = L * 0.3 - 0.4; u < L * 0.3 + 1.8; u += 0.4) bag.add('iron_galv', B(u, u + 0.2, pd - 0.24, pd - 0.14, F + 1.5, F + 1.78));
  S('sacking', L - T - 1.2, L - T - 0.4, pd - 0.9, pd - 0.2, F, F + 0.7);
  // in the shop: the waiting bench, the drinks fridge, the menu board over the fryers, a bin
  S('wood_painted', T + 0.07, T + 0.5, T + 1.5, T + 3.3, F + 0.42, F + 0.47); for (const d of [T + 1.55, T + 3.2]) for (const u of [T + 0.1, T + 0.42]) bag.add('wood_painted', B(u, u + 0.04, d, d + 0.04, F, F + 0.42));
  S('paint_white', L - T - 0.75, L - T - 0.05, T + 1.0, T + 1.7, F, F + 1.75); bag.add('car_red', B(L - T - 0.77, L - T - 0.75, T + 1.0, T + 1.7, F + 1.55, F + 1.75)); bag.add('glass_outer', B(L - T - 0.77, L - T - 0.75, T + 1.04, T + 1.66, F + 0.15, F + 1.5));
  bag.add('car_black', B(L * 0.3 - 0.7, L * 0.3 + 1.85, pd - 0.05, pd - 0.03, F + 2.0, F + 2.0)); bag.add('car_black', B(L * 0.2, L * 0.8, pd - 0.045, pd - 0.03, F + 2.8, F + 3.2));
  sign(c, 'TAKE AWAY', L * 0.5, pd - 0.05, F + 2.84, 0.06, 'paint_white');
  pend(L * 0.5, cd - 1.2); pend(L * 0.5, cd - 3.6); light(L * 0.5, cd - 1.6, '#fff0d0'); light(L * 0.5, cd + 1.0, '#ffe2b0');
  void C;
}

/**
 * The hardware store: paint tins on shelves down the left wall, a pegboard of tools over a nest of small drawers on the right, a counter at the back
 * with the balance scales and the mechanical cash register, cartons on the shelves behind it, the bulk kerosene drum with its pump and the beer bottles
 * it was drawn into [stated: Toowong hardware], open bins of nails, bolts and screws sold by weight, stacked galvanised buckets and tubs, buckets
 * and a kettle hung from the ceiling.
 */
export function hardware(c) {
  const { bag, B, W, S, L, Dp, F, T, H1, du, pend, light } = c, C = F + H1 - 0.3;
  const cd = Math.min(Dp - T - 2.8, 7.4), d0 = T + 0.7, d1 = cd - 0.5, pd = cd + 2.4, TINS = ['car_red', 'cloth_green', 'car_blue', 'paint_cab_yellow', 'paint_white', 'cloth_ochre'];
  partition(c, pd);
  // paint on the left wall: four shelves of tins in rows, the open ones' colours on their lids
  S('wood_painted', T, T + 0.45, d0, d1, F, F + 0.45);
  for (const h of [0.9, 1.3, 1.7, 2.1]) {
    bag.add('timber', B(T, T + 0.42, d0, d1, F + h - 0.04, F + h));
    for (let d = d0 + 0.15; d < d1 - 0.1; d += 0.2) bag.add(TINS[Math.round(d * 5 + h * 3) % 6], lathe([[0.001, 0], [0.085, 0], [0.085, 0.19], [0.001, 0.19]], 8, null, ...W(T + 0.22, d, F + h)));
  }
  for (const d of [d0, d1]) bag.add('wood_painted', B(T, T + 0.45, d - 0.03, d + 0.03, F, F + 2.4));
  // tools on the right wall's pegboard over a nest of drawers
  S('wood_dark', L - T - 0.5, L - T, d0, d1, F, F + 0.9); bag.add('timber', B(L - T - 0.54, L - T, d0 - 0.04, d1 + 0.04, F + 0.9, F + 0.95));
  for (let d = d0 + 0.05; d + 0.27 < d1; d += 0.3) for (let r = 0; r < 3; r++) { bag.add('timber', B(L - T - 0.53, L - T - 0.5, d, d + 0.26, F + 0.08 + r * 0.28, F + 0.32 + r * 0.28)); bag.add('gilt_bronze', B(L - T - 0.545, L - T - 0.53, d + 0.11, d + 0.15, F + 0.17 + r * 0.28, F + 0.2 + r * 0.28)); }
  bag.add('timber', B(L - T - 0.05, L - T - 0.02, d0, d1, F + 1.05, F + 2.45));
  for (let d = d0 + 0.2; d < d1 - 0.3; d += 0.45) {
    if (Math.round(d * 7) % 3 === 0) { bag.add('steel_grey', B(L - T - 0.07, L - T - 0.05, d, d + 0.02, F + 1.4, F + 1.95)); bag.add('steel_grey', B(L - T - 0.07, L - T - 0.05, d, d + 0.3, F + 1.9, F + 1.97)); }     // a saw
    else { bag.add('wood_dark', rod(W(L - T - 0.07, d, F + 1.3), W(L - T - 0.07, d, F + 1.75), 0.015, 5)); bag.add('steel_grey', B(L - T - 0.09, L - T - 0.06, d - 0.05, d + 0.05, F + 1.72, F + 1.82)); }  // a hammer
  }
  // the island of open bins of nails, screws, bolts and washers, sold by weight
  const iu0 = du - 3.4, iu1 = du - 1.6, id0 = 3.0, id1 = Math.min(cd - 1.4, 6.0);
  S('wood_painted', iu0, iu1, id0, id1, F, F + 0.8); const nb = Math.max(2, Math.floor((id1 - id0) / 0.45));
  for (let k = 0; k < nb; k++) for (const [a, b] of [[iu0 + 0.04, (iu0 + iu1) / 2 - 0.02], [(iu0 + iu1) / 2 + 0.02, iu1 - 0.04]]) {
    const da = id0 + 0.04 + k * (id1 - id0 - 0.08) / nb, db = da + (id1 - id0 - 0.08) / nb - 0.04;
    bag.add(['steel_grey', 'iron', 'gilt_bronze', 'steel_chrome', 'iron_galv', 'aluminium_dull'][(k * 2 + (a > iu0 + 0.1 ? 1 : 0)) % 6], B(a, b, da, db, F + 0.72, F + 0.76));
    bag.add('timber', B(a - 0.02, b + 0.02, da - 0.02, da, F + 0.76, F + 0.82)); bag.add('timber', B(a - 0.02, b + 0.02, db, db + 0.02, F + 0.76, F + 0.82));
  }
  bag.add('wood_dark', B(iu0 + 0.2, iu1 - 0.2, (id0 + id1) / 2 - 0.1, (id0 + id1) / 2 + 0.1, F + 0.82, F + 0.86));
  // stacked galvanised buckets and a tub on the other side of the aisle
  for (let k = 0; k < 4; k++) bag.add('iron_galv', lathe([[0.001, 0], [0.17, 0], [0.23, 0.3], [0.001, 0.3]], 10, null, ...W(du + 1.6, 3.2, F + k * 0.12)));
  bag.add('iron_galv', lathe([[0.001, 0], [0.28, 0], [0.36, 0.3], [0.001, 0.3]], 12, null, ...W(du + 2.3, 3.4, F))); col_(c, du + 1.3, du + 2.7, 2.8, 3.8);
  // the kerosene drum with its hand pump and the beer bottles it was drawn into
  const kx = L - T - 1.6, kd = d1 - 0.1;
  S('timber', kx - 0.4, kx + 0.4, kd - 0.4, kd + 0.4, F, F + 0.25); bag.add('iron', lathe([[0.001, 0], [0.31, 0], [0.33, 0.1], [0.33, 0.85], [0.31, 0.9], [0.001, 0.9]], 12, null, ...W(kx, kd, F + 0.25)));
  bag.add('steel_grey', rod(W(kx, kd, F + 1.15), W(kx + 0.35, kd, F + 1.15), 0.03, 5)); bag.add('iron', rod(W(kx, kd, F + 1.15), W(kx, kd, F + 1.55), 0.025, 5)); bag.add('iron', rod(W(kx + 0.35, kd, F + 1.15), W(kx + 0.35, kd, F + 0.9), 0.015, 4));
  for (let q = 0; q < 3; q++) bag.add('glaze_green', lathe([[0.001, 0], [0.05, 0], [0.05, 0.22], [0.02, 0.3], [0.018, 0.34], [0.001, 0.34]], 8, null, ...W(kx - 0.9 + q * 0.15, kd + 0.3, F)));
  // the counter at the back: the balance scales, the cash register, the nails in a paper bag, hand-priced tags
  S('wood_painted', T + 1.0, L - T - 1.0, cd, cd + 0.8, F, F + 1.0); bag.add('timber', B(T + 0.95, L - T - 0.95, cd - 0.05, cd + 0.85, F + 1.0, F + 1.05));
  const su = du - 1.5; bag.add('iron', B(su - 0.12, su + 0.12, cd + 0.3, cd + 0.5, F + 1.05, F + 1.12)); bag.add('iron', rod(W(su, cd + 0.4, F + 1.12), W(su, cd + 0.4, F + 1.45), 0.02, 5)); bag.add('iron', rod(W(su - 0.4, cd + 0.4, F + 1.45), W(su + 0.4, cd + 0.4, F + 1.45), 0.015, 5));
  for (const s of [-0.4, 0.4]) bag.add('gilt_bronze', lathe([[0.001, 0], [0.14, 0.02], [0.15, 0.04], [0.001, 0.04]], 12, null, ...W(su + s, cd + 0.4, F + 1.2)));
  bag.add('steel_chrome', B(du + 0.9, du + 1.5, cd + 0.2, cd + 0.65, F + 1.05, F + 1.3)); bag.add('gilt_bronze', B(du + 0.92, du + 1.48, cd + 0.22, cd + 0.4, F + 1.3, F + 1.5)); bag.add('car_cream', B(du + 0.95, du + 1.45, cd + 0.22, cd + 0.3, F + 1.5, F + 1.6));
  bag.add('paint_white', B(du + 2.0, du + 2.25, cd + 0.25, cd + 0.45, F + 1.05, F + 1.2));
  // behind the counter: cartons on the shelves, a ladder
  for (const h of [0.9, 1.4, 1.9]) { bag.add('timber', B(T + 1.0, L - T - 1.0, pd - 0.4, pd - 0.02, F + h - 0.03, F + h)); for (let u = T + 1.1; u < L - T - 1.2; u += 0.5) bag.add(['cloth_ochre', 'hide_tan', 'cloth_brown'][Math.round(u * 3 + h * 4) % 3], B(u, u + 0.42, pd - 0.36, pd - 0.06, F + h, F + h + 0.3 + (Math.round(u * 5) % 3) * 0.04)); }
  // from the ceiling: galvanised buckets and a kettle on cords over the aisle's left
  for (const [u, d, m] of [[du - 0.1 - 2.8, 2.0, 'iron_galv'], [du - 2.2, 7.0 > cd - 0.8 ? 1.4 : 2.0, 'iron_galv'], [du - 3.1, 1.4, 'aluminium_dull']]) { bag.add('iron', rod(W(u, d, C), W(u, d, F + 2.05), 0.008, 3)); bag.add(m, lathe([[0.001, 0], [0.17, 0], [0.23, 0.3], [0.001, 0.3]], 10, null, ...W(u, d, F + 1.78))); }
  sign(c, 'HARDWARE', L * 0.5, pd - 0.05, F + 2.3, 0.06, 'paint_cab_yellow');
  pend(L * 0.5, cd - 3.2); pend(L * 0.5, cd - 0.6); light(L * 0.5, cd - 3.0, '#fff0d0'); light(L * 0.5, cd - 0.4, '#ffe6c0');
}
const col_ = (c, u0, u1, d0, d1) => c.rc(u0, u1, d0, d1, c.F, c.F + 0.4);

/**
 * The bakery: a glass case down the right side on a tiled counter, trays of meat pies, vanilla slices, lamingtons and cream buns, a pie warmer,
 * the till; behind it shelves of loaves, white and brown, and trays of rolls; a rack of the day's bread on the left with sliced white in paper,
 * a stand of iced celebration cakes, paper bags and string.
 */
export function bakery(c) {
  const { bag, B, W, S, L, Dp, F, T, H1, du, pend, light } = c, C = F + H1 - 0.3;
  const cu0 = L - T - 2.3, cu1 = L - T - 1.55, d0 = T + 1.8, d1 = Math.min(Dp - T - 3.5, d0 + 7.0), pd = d1 + 1.8;
  partition(c, pd);
  for (const [a, b] of [[T + 0.03, T + 0.05], [L - T - 0.05, L - T - 0.03]]) bag.add('tile_cream', B(a, b, T + 0.15, pd, F, F + 1.5));
  // the counter and its case
  S('wood_painted', cu0, cu1, d0, d1, F, F + 1.0); bag.add('tile_green', B(cu0 - 0.02, cu0, d0, d1, F + 0.1, F + 0.95)); bag.add('marble', B(cu0 - 0.06, cu1 + 0.04, d0 - 0.04, d1 + 0.04, F + 1.0, F + 1.04));
  const g0 = d0 + 0.2, g1 = d1 - 0.8, gc = (cu0 + cu1) / 2;
  bag.add('glass_outer', B(cu0 - 0.03, cu0 - 0.01, g0, g1, F + 1.06, F + 1.6)); bag.add('glass_outer', B(cu0 - 0.03, cu1 - 0.04, g0, g0 + 0.02, F + 1.06, F + 1.6)); bag.add('glass_outer', B(cu0 - 0.03, cu1 - 0.04, g1 - 0.02, g1, F + 1.06, F + 1.6));
  bag.add('aluminium_dull', B(cu0 - 0.05, cu1 - 0.02, g0 - 0.02, g1 + 0.02, F + 1.6, F + 1.64));
  for (const u of [cu0 - 0.03]) for (const d of [g0, g1 - 0.02]) bag.add('aluminium_dull', B(u - 0.01, u + 0.03, d, d + 0.03, F + 1.04, F + 1.6));
  for (const h of [1.04, 1.32]) bag.add('aluminium_dull', B(cu0, cu1 - 0.05, g0, g1, F + h, F + h + 0.03));
  // in the case: trays of pies (brown, crimped), vanilla slices (cream over pastry, pink icing), lamingtons (chocolate, coconut), buns
  const FOOD = [['hide_brown', 'cloth_brown'], ['paint_cab_yellow', 'cloth_ochre'], ['cloth_maroon', 'paint_white'], ['cloth_red', 'paint_white']];
  for (let d = g0 + 0.15, k = 0; d < g1 - 0.25; d += 0.38, k++) for (const [h, row] of [[1.07, 0], [1.35, 1]]) {
    const fm = FOOD[(k + row * 2) % 4];
    if ((k + row) % 2) { bag.add(fm[0], B(cu0 + 0.06, cu1 - 0.12, d, d + 0.3, F + h, F + h + 0.07)); bag.add(fm[1], B(cu0 + 0.1, cu1 - 0.16, d + 0.04, d + 0.26, F + h + 0.07, F + h + 0.1)); }
    else for (let q = 0; q < 2; q++) for (let r = 0; r < 2; r++) bag.add(fm[0], lathe([[0.001, 0], [0.065, 0], [0.07, 0.04], [0.05, 0.065], [0.001, 0.07]], 8, null, ...W(cu0 + 0.14 + q * 0.17, d + 0.07 + r * 0.17, F + h)));
  }
  // on the case: the pie warmer, the till, a bell, bags and string
  bag.add('steel_chrome', B(gc - 0.2, gc + 0.2, d1 - 0.75, d1 - 0.05, F + 1.04, F + 1.62)); bag.add('glass_lamp', B(gc - 0.18, gc + 0.18, d1 - 0.72, d1 - 0.1, F + 1.1, F + 1.55));
  bag.add('steel_chrome', B(gc - 0.2, gc + 0.2, g1 + 0.0, g1 + 0.0, F + 1.04, F + 1.04)); bag.add('gilt_bronze', B(cu1 - 0.1, cu1 + 0.04, d0 + 0.05, d0 + 0.55, F + 1.04, F + 1.3)); bag.add('car_cream', B(cu1 - 0.1, cu1 + 0.03, d0 + 0.07, d0 + 0.3, F + 1.3, F + 1.42));
  bag.add('cloth_ochre', B(cu1 - 0.35, cu1 - 0.15, d0 + 0.7, d0 + 0.95, F + 1.04, F + 1.1)); bag.add('iron', lathe([[0.001, 0], [0.04, 0], [0.04, 0.03], [0.001, 0.05]], 8, null, ...W(cu1 - 0.3, d0 + 1.2, F + 1.04)));
  // the staff side: shelves of loaves and rolls against the right wall
  const bu = L - T - 0.05;
  S('wood_painted', bu - 0.5, bu, d0, d1, F, F + 0.8);
  for (const h of [0.95, 1.35, 1.75, 2.15]) { bag.add('timber', B(bu - 0.45, bu - 0.02, d0, d1, F + h - 0.03, F + h)); for (let d = d0 + 0.2; d < d1 - 0.25; d += 0.42) { const white = Math.round(d * 5 + h * 2) % 3 !== 0; bag.add(white ? 'cloth_ochre' : 'hide_brown', B(bu - 0.4, bu - 0.08, d, d + 0.34, F + h, F + h + 0.2)); bag.add(white ? 'hide_tan' : 'cloth_brown', B(bu - 0.38, bu - 0.1, d + 0.04, d + 0.3, F + h + 0.2, F + h + 0.24)); } }
  // the left side: a rack of the day's bread with sliced white in paper, a stand of iced celebration cakes
  const ru0 = T + 0.07;
  S('wood_painted', ru0, ru0 + 0.45, T + 1.0, T + 3.2, F, F + 0.35);
  for (const h of [0.7, 1.05, 1.4]) { bag.add('timber', B(ru0, ru0 + 0.45, T + 1.0, T + 3.2, F + h - 0.03, F + h)); for (let d = T + 1.1; d < T + 3.1; d += 0.34) bag.add(h > 1 ? 'paint_white' : 'cloth_ochre', B(ru0 + 0.05, ru0 + 0.4, d, d + 0.28, F + h, F + h + 0.2)); }
  for (const d of [T + 1.0, T + 3.2]) bag.add('wood_painted', B(ru0, ru0 + 0.45, d - 0.03, d + 0.03, F, F + 1.8));
  for (const [u, d] of [[T + 1.6, T + 4.4], [T + 1.6, T + 5.4]]) { bag.add('iron', lathe([[0.15, 0], [0.15, 0.03], [0.03, 0.06], [0.03, 0.75], [0.2, 0.78], [0.2, 0.82], [0.001, 0.82]], 10, null, ...W(u, d, F))); bag.add('paint_white', lathe([[0.001, 0], [0.17, 0], [0.17, 0.12], [0.001, 0.12]], 10, null, ...W(u, d, F + 0.82))); bag.add(u > 0 && d > T + 5 ? 'cloth_red' : 'cloth_blue', lathe([[0.1, 0], [0.1, 0.03], [0.001, 0.03]], 8, null, ...W(u, d, F + 0.94))); }
  sign(c, 'MEAT PIES', L * 0.5, pd - 0.05, F + 2.3, 0.06, 'paint_white');
  pend(L * 0.5, d0 + 1.0); pend(L * 0.5, d0 + 3.8); light(L * 0.5, d0 + 1.4, '#fff0d0'); light(L * 0.5, d0 + 4.5, '#ffe6c0');
  void du; void C; void fromTriangles;
}
