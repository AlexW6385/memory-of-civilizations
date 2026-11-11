// The ground storey of a Florentine house that can be entered (docs/settlements/florence.md §5): the
// walls with the door cut in the middle of the front, a step, a floor of terracotta tiles, the beams
// of the ceiling, and the room furnished by its use: an osteria ('inn'), a home, or the workshop of
// one of the ten trades of the lots (cloth, wine, bread, spice, leather, smith, goldsmith, woodwork,
// candles). Returns the door's position along the front so the street face can put its door there.

import { box, lathe } from '../../core/geom.js';

const W = 'wood_dark', TM = 'timber', IR = 'iron', TC = 'terracotta';
const CLOTHS = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_indigo', 'cloth_brown'];

/** The door's place along a front of length L. */
export const doorAt = (L) => L / 2;

export function openGround(bag, col, el, { wall, y, gh, f, rand, foot }) {
  const [x0, z0, x1, z1] = el.rect, T = 0.4, fy = y + 0.15, along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, du = doorAt(L), dw = 1.4, top = y + gh;
  // a frame: u along the front (0…L), v in from the front (0…D)
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const B = (mat, u0, v0, u1, v1, ya, yb, c = false) => {
    const a = P(u0, v0), b = P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.5, yb);
  };
  const h = (mat, u, v, r, ht, ya = 0) => { const p = P(u, v); bag.add(mat, lathe([[r * 0.6, 0], [r, ht * 0.4], [r * 0.7, ht * 0.85], [r * 0.4, ht], [0.001, ht]], 8, null, p[0], fy + ya, p[1])); };
  const barrel = (u, v, r = 0.33) => { const p = P(u, v); bag.add(TM, lathe([[r * 0.85, 0], [r, 0.3], [r * 0.85, 0.6], [0.001, 0.6]], 8, null, p[0], fy, p[1])); col.circle?.(p[0], p[1], r, fy, fy + 0.6); };
  const table = (u, v, w, d, ht, mat = W) => { B(mat, u - w / 2, v - d / 2, u + w / 2, v + d / 2, fy + ht - 0.06, fy + ht, true); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(mat, u + a * (w / 2 - 0.08) - 0.04, v + b * (d / 2 - 0.08) - 0.04, u + a * (w / 2 - 0.08) + 0.04, v + b * (d / 2 - 0.08) + 0.04, fy, fy + ht - 0.06); };
  const shelves = (u0, u1, v, rows, mat, goods) => { for (let r = 0; r < rows; r++) { const ya = 0.5 + r * 0.45; B(mat, u0, v - 0.3, u1, v, fy + ya, fy + ya + 0.04); goods(r, ya); } B(mat, u0, v - 0.3, u0 + 0.04, v, fy, fy + 0.5 + rows * 0.45); B(mat, u1 - 0.04, v - 0.3, u1, v, fy, fy + 0.5 + rows * 0.45); };
  const hearth = (u) => {
    B('brick', u - 0.8, D - T - 0.7, u + 0.8, D - T, fy, fy + 0.45, true); B('brick', u - 0.9, D - T - 0.75, u + 0.9, D - T, fy + 1.6, fy + 1.9);
    for (const sg of [-1, 1]) B('brick', u + sg * 0.8 - 0.1, D - T - 0.7, u + sg * 0.8 + 0.1, D - T, fy + 0.45, fy + 1.6);
    B('brick', u - 0.6, D - T - 0.5, u + 0.6, D - T, fy + 1.9, top); B(W, u - 0.5, D - T - 0.55, u + 0.5, D - T - 0.05, fy + 0.45, fy + 0.47); h(TC, u, D - T - 0.35, 0.22, 0.3, 0.47);
  };

  // walls: back and sides whole, the front either side of the door and over it; the stone's own colour inside
  B(wall, 0, D - T, L, D, foot - 0.6, top, true); B(wall, 0, T, T, D - T, foot - 0.6, top, true); B(wall, L - T, T, L, D - T, foot - 0.6, top, true);
  B(wall, 0, 0, du - dw / 2, T, foot - 0.6, top, true); B(wall, du + dw / 2, 0, L, T, foot - 0.6, top, true); B(wall, du - dw / 2, 0, du + dw / 2, T, y + 2.4, top);
  col.rect(el.rect, top, top + 0.4);
  // the step, the floor, the plastered ceiling on its beams
  B('limestone_yellow', du - 0.9, -0.5, du + 0.9, 0.02, fy - 0.12, fy + 0.02);
  { const a = P(du - 0.9, -0.5), b = P(du + 0.9, 0); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy + 0.02); }
  B('cotto_floor', T, T, L - T, D - T, fy - 0.1, fy + 0.015); { const a = P(0, 0), b = P(L, D); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy + 0.015); }
  B('plaster_white', T, T, L - T, D - T, top - 0.05, top - 0.02);
  for (let v = T + 0.5; v < D - T; v += 0.85) B(W, T, v - 0.08, L - T, v + 0.08, top - 0.26, top - 0.05);
  B(W, du - dw / 2 - 0.02, T, du - dw / 2 + 0.06, T + dw, fy, fy + 2.3);     // the door leaf standing open
  // a window in each side wall, so that daylight has somewhere to come from
  for (const v of [Math.min(D * 0.45, D - 2)]) { B('opening', T - 0.01, v - 0.5, T + 0.02, v + 0.5, fy + 1.0, fy + 2.0); B('opening', L - T - 0.02, v - 0.5, L - T + 0.01, v + 0.5, fy + 1.0, fy + 2.0); }
  // a lamp hanging from a beam
  { const p = P(L / 2, Math.min(D / 2, 3)); bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.05], [0.12, 0.18], [0.001, 0.26]], 8, null, p[0], top - 0.7, p[1])); B(IR, L / 2 - 0.005, Math.min(D / 2, 3) - 0.005, L / 2 + 0.005, Math.min(D / 2, 3) + 0.005, top - 0.46, top - 0.26); }

  const use = el.use ?? 'home', bw = L - 2 * T, ub = T + 0.1;
  const counter = (u0, u1, v) => { B(W, u0, v - 0.35, u1, v + 0.35, fy, fy + 1.0, true); B(TM, u0 - 0.04, v - 0.4, u1 + 0.04, v + 0.4, fy + 1.0, fy + 1.05); };
  if (use === 'inn') {
    const nt = Math.max(1, Math.floor((L - 2.6) / 2.2));
    for (let k = 0; k < nt; k++) for (const v of [D * 0.38, D * 0.62]) {
      const u = 1.2 + k * 2.2 + 0.4; if (u > L - 1.8 || v > D - 1.4) continue;
      table(u, v, 1.4, 0.7, 0.78);
      for (const s2 of [-1, 1]) { B(TM, u - 0.7, v + s2 * 0.55 - 0.13, u + 0.7, v + s2 * 0.55 + 0.13, fy + 0.42, fy + 0.46, true); for (const a of [-0.6, 0.55]) B(TM, u + a, v + s2 * 0.55 - 0.1, u + a + 0.05, v + s2 * 0.55 + 0.1, fy, fy + 0.42); }
      h(TC, u - 0.3, v, 0.07, 0.24, 0.78); h('plaster_white', u + 0.2, v + 0.1, 0.05, 0.12, 0.78);
    }
    const cu = L - T - 0.6; B(W, cu - 0.3, T + 1.2, cu + 0.3, D - T - 1.2, fy, fy + 1.05, true); B(TM, cu - 0.35, T + 1.15, cu + 0.35, D - T - 1.15, fy + 1.05, fy + 1.1);
    for (let v = T + 1.5; v < D - T - 1.4; v += 0.55) h(TC, cu, v, 0.08, 0.28, 1.1);
    for (let v = T + 1.4; v < D - T - 1.2; v += 0.8) barrel(L - T - 0.45, v);
    hearth(Math.min(L / 2, L - 2.5));
    for (let k = 0; k < 4; k++) h(k % 2 ? TC : 'plaster_white', 1 + k * 0.6, D - T - 1.5, 0.1, 0.35, gh - 1.4);
  } else if (use === 'cloth') {
    // bolts of cloth on shelves along the back wall, the cutting counter, a loom at one side, a bale
    shelves(ub, L - T - 0.1, D - T, 3, W, (r, ya) => { for (let u = ub + 0.2; u < L - T - 0.6; u += 0.5) B(CLOTHS[Math.floor(rand() * CLOTHS.length)], u, D - T - 0.28, u + 0.4, D - T - 0.02, fy + ya + 0.04, fy + ya + 0.3); });
    counter(L * 0.3, L * 0.75, D * 0.45);
    for (let k = 0; k < 3; k++) B(CLOTHS[(k * 2) % 7], L * 0.4 + k * 0.4, D * 0.45 - 0.25, L * 0.4 + k * 0.4 + 0.3, D * 0.45 + 0.25, fy + 1.05, fy + 1.13);
    // the loom: two posts, the beams, the warp threads
    const lu = ub + 0.1;
    for (const v of [T + 0.4, T + 1.5]) B(W, lu, v, lu + 0.08, v + 0.08, fy, fy + 1.7, true);
    B(TM, lu, T + 0.4, lu + 0.08, T + 1.58, fy + 1.6, fy + 1.7); B(TM, lu, T + 0.4, lu + 0.08, T + 1.58, fy + 0.5, fy + 0.58);
    B('cloth_white', lu + 0.02, T + 0.45, lu + 0.05, T + 1.55, fy + 0.58, fy + 1.6);
    B('sacking', L - T - 1.0, T + 0.2, L - T - 0.1, T + 0.9, fy, fy + 0.7, true);
  } else if (use === 'wine') {
    for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) barrel(ub + 0.4 + j * 0.7 + k * 0.35, D - T - 0.5 - 0.0, 0.33);
    for (let j = 0; j < 4; j++) { const p = P(ub + 0.4 + j * 0.7, D - T - 0.5); bag.add(TM, lathe([[0.28, 0], [0.33, 0.3], [0.28, 0.6], [0.001, 0.6]], 8, null, p[0], fy + 0.6, p[1])); }
    for (let v = T + 1.0; v < D - T - 1.2; v += 0.9) barrel(L - T - 0.45, v);
    counter(L * 0.25, L * 0.7, D * 0.4);
    for (let k = 0; k < 6; k++) h('wicker', L * 0.25 + 0.3 + k * 0.28, D * 0.4, 0.07, 0.3, 1.05);
    B(TM, L - T - 0.9, D * 0.4 - 0.3, L - T - 0.1, D * 0.4 - 0.2, fy + 1.0, fy + 1.04);
  } else if (use === 'bread') {
    // the oven: a brick dome with its mouth and a peel, a kneading trough, the bread on racks
    const ou = L - T - 1.5, ov = D - T - 1.5;
    B('brick', ou - 1.3, ov - 1.3, ou + 1.3, ov + 1.3, fy, fy + 0.9, true);
    { const p = P(ou, ov); bag.add('brick', lathe([[1.15, 0], [1.1, 0.4], [0.7, 0.85], [0.001, 1.1]], 10, null, p[0], fy + 0.9, p[1])); }
    B('opening', ou - 0.35, ov - 1.31, ou + 0.35, ov - 1.28, fy + 0.35, fy + 0.8);
    B(TM, ou + 0.5, ov - 3.0, ou + 0.56, ov - 1.4, fy + 0.8, fy + 0.84);
    B(W, ub + 0.1, D * 0.45, ub + 1.7, D * 0.45 + 0.7, fy + 0.5, fy + 0.85, true); B('hide_tan', ub + 0.2, D * 0.45 + 0.1, ub + 1.5, D * 0.45 + 0.6, fy + 0.85, fy + 0.93);
    shelves(ub, Math.min(L - T - 3, ub + 3), D - T, 3, W, (r, ya) => { for (let u = ub + 0.3; u < Math.min(L - T - 3, ub + 3) - 0.2; u += 0.35) h('hide_tan', u, D - T - 0.15, 0.13, 0.12, ya + 0.04); });
    counter(L * 0.2, L * 0.6, T + 1.2);
    for (let k = 0; k < 6; k++) h('hide_tan', L * 0.2 + 0.3 + k * 0.28, T + 1.2, 0.12, 0.1, 1.05);
  } else if (use === 'spice') {
    // a cabinet of small drawers, sacks and jars, a balance on the counter
    B(W, ub, D - T - 0.5, L - T - 0.1, D - T, fy, fy + 2.0, true);
    for (let r = 0; r < 6; r++) for (let u = ub + 0.15; u < L - T - 0.5; u += 0.35) B(r % 2 ? TM : 'wood_painted', u, D - T - 0.52, u + 0.28, D - T - 0.5, fy + 0.2 + r * 0.28, fy + 0.42 + r * 0.28);
    for (let k = 0; k < 5; k++) { const p = P(ub + 0.4 + k * 0.5, T + 0.8 + (k % 2) * 0.6); bag.add('sacking', lathe([[0.001, 0], [0.22, 0.01], [0.24, 0.3], [0.14, 0.55], [0.001, 0.58]], 7, null, p[0], fy, p[1])); }
    counter(L * 0.3, L * 0.7, D * 0.45);
    for (let k = 0; k < 5; k++) h(TC, L * 0.3 + 0.3 + k * 0.3, D * 0.45, 0.08, 0.2, 1.05);
    B(IR, L / 2 - 0.01, D * 0.45 - 0.01, L / 2 + 0.01, D * 0.45 + 0.01, fy + 1.05, fy + 1.4); B(IR, L / 2 - 0.25, D * 0.45 - 0.01, L / 2 + 0.25, D * 0.45 + 0.01, fy + 1.4, fy + 1.42);
  } else if (use === 'leather') {
    for (let k = 0; k < 6; k++) B(k % 2 ? 'hide_brown' : 'hide_tan', ub + 0.3 + k * Math.max(0.6, (bw - 0.8) / 6), D - T - 0.1, ub + 0.3 + k * Math.max(0.6, (bw - 0.8) / 6) + 0.45, D - T, fy + 0.5, fy + 2.2);
    B(TM, ub, D - T - 0.14, L - T - 0.1, D - T - 0.08, fy + 2.2, fy + 2.26);
    B(W, L * 0.3, D * 0.45, L * 0.75, D * 0.45 + 0.8, fy + 0.8, fy + 0.88, true); for (const u of [L * 0.3 + 0.1, L * 0.75 - 0.1]) B(W, u - 0.05, D * 0.45 + 0.05, u + 0.05, D * 0.45 + 0.75, fy, fy + 0.8);
    B('hide_black', L * 0.4, D * 0.45 + 0.1, L * 0.55, D * 0.45 + 0.6, fy + 0.88, fy + 0.93);
    for (let k = 0; k < 4; k++) h('hide_tan', ub + 0.4 + k * 0.45, T + 0.7, 0.14, 0.2, 0.0);
    B(W, ub + 0.1, T + 1.4, ub + 0.5, T + 1.9, fy, fy + 0.45, true);
  } else if (use === 'smith') {
    // the forge: a raised hearth with a hood, the bellows, the anvil on its block, tools hung on the wall, the quench
    const fu = L - T - 1.3, fv = D - T - 1.0;
    B('brick', fu - 0.9, fv - 0.8, fu + 0.9, fv + 0.8, fy, fy + 0.85, true); B('brick', fu - 0.95, fv - 0.85, fu + 0.95, fv + 0.85, fy + 1.9, fy + 2.0);
    for (const sg of [-1, 1]) B('brick', fu + sg * 0.8 - 0.1, fv - 0.1, fu + sg * 0.8 + 0.1, fv + 0.8, fy + 0.85, fy + 1.9); B('brick', fu - 0.7, fv + 0.4, fu + 0.7, fv + 0.8, fy + 1.9, top);
    B('cloth_red', fu - 0.45, fv - 0.4, fu + 0.45, fv + 0.4, fy + 0.85, fy + 0.9);
    B('hide_brown', fu - 1.9, fv - 0.3, fu - 1.1, fv + 0.3, fy + 0.9, fy + 1.3); B(IR, fu - 1.1, fv - 0.04, fu - 0.9, fv + 0.04, fy + 1.0, fy + 1.06);
    B(TM, L * 0.3 - 0.3, D * 0.4 - 0.3, L * 0.3 + 0.3, D * 0.4 + 0.3, fy, fy + 0.6, true); B(IR, L * 0.3 - 0.4, D * 0.4 - 0.12, L * 0.3 + 0.4, D * 0.4 + 0.12, fy + 0.6, fy + 0.78);
    for (let k = 0; k < 6; k++) B(IR, ub + 0.4 + k * 0.4, D - T - 0.06, ub + 0.43 + k * 0.4, D - T, fy + 1.0 + (k % 2) * 0.2, fy + 1.9);
    barrel(ub + 0.5, T + 0.6, 0.35);
  } else if (use === 'goldsmith') {
    // the workbench under the window, a small furnace, a strongbox, a showcase of cups
    B(W, L * 0.25, T + 0.2, L * 0.75, T + 0.9, fy + 0.85, fy + 0.92, true); for (const u of [L * 0.25 + 0.1, L * 0.75 - 0.1]) B(W, u - 0.05, T + 0.25, u + 0.05, T + 0.85, fy, fy + 0.85);
    for (let k = 0; k < 4; k++) h('gilt_bronze', L * 0.3 + k * 0.3, T + 0.55, 0.05, 0.1, 0.92);
    B('brick', L - T - 1.0, D - T - 0.9, L - T - 0.1, D - T - 0.1, fy, fy + 0.8, true); B('brick', L - T - 0.8, D - T - 0.7, L - T - 0.3, D - T - 0.3, fy + 0.8, fy + 1.4);
    B(IR, ub, D - T - 0.7, ub + 0.9, D - T - 0.1, fy, fy + 0.6, true); B(IR, ub - 0.02, D - T - 0.72, ub + 0.92, D - T - 0.6, fy + 0.6, fy + 0.66);
    counter(L * 0.3, L * 0.7, D * 0.5); for (let k = 0; k < 5; k++) h('gilt_bronze', L * 0.3 + 0.3 + k * 0.25, D * 0.5, 0.06, 0.16, 1.05); B('cloth_red', L * 0.3, D * 0.5 - 0.3, L * 0.7, D * 0.5 + 0.3, fy + 1.05, fy + 1.06);
  } else if (use === 'woodwork') {
    // a joiner's bench with its vice, planks stacked, a cassone half made, shavings
    B(W, L * 0.25, D * 0.4, L * 0.7, D * 0.4 + 0.7, fy + 0.8, fy + 0.9, true); for (const u of [L * 0.25 + 0.1, L * 0.7 - 0.1]) B(W, u - 0.06, D * 0.4 + 0.05, u + 0.06, D * 0.4 + 0.65, fy, fy + 0.8);
    B(IR, L * 0.25 - 0.1, D * 0.4 + 0.1, L * 0.25, D * 0.4 + 0.3, fy + 0.9, fy + 1.0);
    for (let k = 0; k < 6; k++) B(k % 2 ? TM : 'wood_painted', ub, D - T - 0.9, ub + 2.0, D - T - 0.1, fy + k * 0.09, fy + k * 0.09 + 0.08);
    B('wood_painted', L - T - 1.4, T + 0.3, L - T - 0.2, T + 1.0, fy, fy + 0.6, true); B(TM, L - T - 1.45, T + 0.25, L - T - 0.15, T + 1.05, fy + 0.6, fy + 0.66);
    for (let k = 0; k < 5; k++) B('straw', L * 0.3 + k * 0.4, D * 0.4 + 0.9 + (k % 2) * 0.2, L * 0.3 + k * 0.4 + 0.25, D * 0.4 + 1.1 + (k % 2) * 0.2, fy + 0.015, fy + 0.04);
    for (let k = 0; k < 5; k++) B(TM, ub + 2.3 + k * 0.1, D - T - 1.1, ub + 2.36 + k * 0.1, D - T - 0.05, fy, fy + 1.4 + (k % 2) * 0.2);
  } else if (use === 'candles') {
    // the pot of tallow on its fire, tapers hung to dry on frames, a rack of candles, a table
    hearth(Math.min(L / 2, L - 2.5)); { const p = P(Math.min(L / 2, L - 2.5), D - T - 0.35); bag.add(IR, lathe([[0.001, 0], [0.3, 0.02], [0.33, 0.25], [0.28, 0.35], [0.001, 0.35]], 10, null, p[0], fy + 0.5, p[1])); }
    for (const v of [D * 0.4, D * 0.6]) { B(TM, ub + 0.2, v - 0.04, L - T - 0.3, v + 0.04, fy + 2.0, fy + 2.08); for (let u = ub + 0.4; u < L - T - 0.5; u += 0.22) B('plaster_white', u, v - 0.015, u + 0.04, v + 0.015, fy + 1.3, fy + 2.0); }
    counter(L * 0.2, L * 0.6, T + 1.2); for (let k = 0; k < 6; k++) B('plaster_white', L * 0.2 + 0.2 + k * 0.2, T + 1.15, L * 0.2 + 0.24 + k * 0.2, T + 1.2, fy + 1.05, fy + 1.3);
  } else {
    // a home: the table and stools, the hearth, a chest, the bed in the corner, a cupboard with crockery
    table(L / 2, D * 0.45, 1.3, 0.8, 0.78); for (const [a, b] of [[-0.9, 0], [0.9, 0], [0, -0.65]]) { const p = [L / 2 + a, D * 0.45 + b]; B(TM, p[0] - 0.18, p[1] - 0.18, p[0] + 0.18, p[1] + 0.18, fy, fy + 0.45, true); }
    h(TC, L / 2 - 0.2, D * 0.45, 0.09, 0.3, 0.78); h('plaster_white', L / 2 + 0.25, D * 0.45 - 0.1, 0.1, 0.06, 0.78);
    hearth(L - 1.6 > 2 ? L - 1.6 : L / 2);
    B(W, ub, T + 0.2, ub + 1.0, T + 0.75, fy, fy + 0.65, true); B('wood_painted', ub, T + 0.2, ub + 1.0, T + 0.25, fy + 0.5, fy + 0.56);
    if (D > 4.5) { B(W, T + 0.05, D - T - 2.1, T + 1.45, D - T - 0.05, fy, fy + 0.5, true); B('cloth_white', T + 0.1, D - T - 2.05, T + 1.4, D - T - 0.1, fy + 0.5, fy + 0.62); B('cloth_red', T + 0.1, D - T - 1.4, T + 1.4, D - T - 0.1, fy + 0.62, fy + 0.66); B('cloth_white', T + 0.25, D - T - 0.55, T + 1.25, D - T - 0.15, fy + 0.62, fy + 0.78); }
    const cu = L - T - 0.25; B(W, cu - 0.2, T + 0.3, cu + 0.2, T + 1.5, fy, fy + 1.9, true); for (const hh of [1.0, 1.45]) { B(W, cu - 0.22, T + 0.3, cu + 0.2, T + 1.5, fy + hh, fy + hh + 0.03); for (let v = T + 0.45; v < T + 1.4; v += 0.3) h(rand() < 0.5 ? 'plaster_white' : TC, cu - 0.05, v, 0.08, 0.16, hh + 0.03); }
  }
}
