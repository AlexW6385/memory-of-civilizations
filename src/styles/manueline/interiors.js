// The furnished rooms of Lisbon's open houses (docs/settlements/manueline-lisbon.md §8b): the merchants' shops of the Rua Nova with
// their trades' goods (spice, porcelain, cloth, jewels, parrots and ivory, ship's chandlery, grocery, apothecary, tavern), the hall
// with its stair, the kitchen with its hearth and the chamber above; the fishermen's and the Alfama's homes. Everything in a house's
// frame: u along the front from its left, v in from the front, the floor of the room at height fy; `K` is the kit that places it.
import { box, lathe, rod } from '../../core/geom.js';

const jarP = (r, h) => [[0.001, 0], [r * 0.55, 0], [r, h * 0.25], [r * 1.05, h * 0.55], [r * 0.72, h * 0.88], [r * 0.58, h], [0.001, h]];
const CLOTHS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_maroon', 'cloth_blue', 'cloth_black', 'cloth_brown'];

/** The kit: boxes and turned things placed in the house frame, solid ones also in collision. */
export function kit(ctx, F, fy, rand) {
  const { bag, col } = ctx;
  const A = (mat, u0, v0, u1, v1, y0, y1, solid = false) => { const r = F.R(u0, v0, u1, v1); bag.add(mat, box(r[0], fy + y0, r[1], r[2], fy + y1, r[3])); if (solid) col.rect(r, fy + y0, fy + y1); return r; };
  const Lh = (mat, prof, u, v, y0 = 0, seg = 8) => { const p = F.P(u, v); bag.add(mat, lathe(prof, seg, null, p[0], fy + y0, p[1])); };
  const Rod = (mat, a, b, r, seg = 5) => { const p = F.P(a[0], a[1]), q = F.P(b[0], b[1]); bag.add(mat, rod([p[0], fy + a[2], p[1]], [q[0], fy + b[2], q[1]], r, seg)); };
  const pick = (l) => l[Math.floor(rand() * l.length)];
  const K = {
    A, Lh, Rod, pick,
    jar(u, v, y0 = 0, r = 0.17, h = 0.4, mat = 'terracotta') { Lh(mat, jarP(r, h), u, v, y0, 9); },
    barrel(u, v, y0 = 0, r = 0.32, h = 0.85, solid = true) {
      Lh('timber', [[r * 0.82, 0], [r, h * 0.28], [r * 1.04, h * 0.5], [r, h * 0.72], [r * 0.82, h], [0.001, h]], u, v, y0, 12);
      for (const t of [0.14, 0.86]) Lh('iron', [[r * (t < 0.5 ? 0.97 : 0.97) + 0.005, 0], [r * 0.97 + 0.005, 0.05], [0.001, 0.05]], u, v, y0 + h * t - 0.025, 12);
      if (solid) { const p = F.P(u, v); col.circle(p[0], p[1], r, fy + y0, fy + y0 + h); }
    },
    sack(u, v, y0 = 0, mat = 'sacking', open = false) { Lh(mat, [[0.001, 0], [0.24, 0], [0.3, 0.14], [0.27, 0.42], open ? [0.2, 0.55] : [0.1, 0.56], [0.001, open ? 0.5 : 0.6]], u, v, y0, 8); },
    crate(u, v, y0 = 0, s = 0.55, solid = true) { A('timber', u - s / 2, v - s / 2, u + s / 2, v + s / 2, y0, y0 + s * 0.9, solid); A('wood_dark', u - s / 2 - 0.01, v - s / 2 - 0.01, u + s / 2 + 0.01, v - s / 2 + 0.05, y0 + s * 0.4, y0 + s * 0.5); },
    coil(u, v, y0 = 0, r = 0.34) { Lh('rope_fibre', [[r * 0.45, 0], [r, 0], [r, 0.22], [r * 0.45, 0.22], [r * 0.45, 0]], u, v, y0, 10); },
    /** a bolt of cloth lying along u on a shelf */
    bolt(u, v, y0, len, mat) { Rod(mat, [u - len / 2, v, y0 + 0.11], [u + len / 2, v, y0 + 0.11], 0.11, 6); },
    book(u, v, y0, w = 0.05, h = 0.26) { A(pick(['leather_bench', 'cloth_maroon', 'cloth_brown', 'cloth_green', 'cloth_black']), u, v, u + w, v + 0.18, y0, y0 + h); },
    /** shelves on a wall: boards at the heights, from u0 to u1 at depth v (against a wall at v0), `fill(u, v, y0, row)` stocks each place */
    shelves(u0, u1, v, deep, heights, fill, step = 0.4) {
      const v1 = v + deep;
      for (const h of heights) A('timber', u0, v, u1, v1, h - 0.03, h);
      for (const s of [u0, u1 - 0.05]) A('timber', s, v, s + 0.05, v1, 0, heights[heights.length - 1] + 0.35);
      A('wood_dark', u0, v1 - 0.03, u1, v1, 0, heights[heights.length - 1] + 0.35);
      heights.forEach((h, row) => { for (let u = u0 + 0.25; u < u1 - 0.2; u += step) fill(u, v + deep * 0.5, h, row); });
      const r = F.R(u0, v, u1, v1); col.rect(r, fy, fy + heights[heights.length - 1] + 0.35);
    },
    counter(u0, u1, v0, v1, mat = 'wood_dark') { A(mat, u0, v0, u1, v1, 0, 1.0, true); A('timber', u0 - 0.04, v0 - 0.04, u1 + 0.04, v1 + 0.04, 1.0, 1.06); },
    table(u, v, w = 1.4, d = 0.75, h = 0.78) {
      A('timber', u - w / 2, v - d / 2, u + w / 2, v + d / 2, h - 0.06, h, true);
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) A('wood_dark', u + a * (w / 2 - 0.07) - 0.04, v + b * (d / 2 - 0.07) - 0.04, u + a * (w / 2 - 0.07) + 0.04, v + b * (d / 2 - 0.07) + 0.04, 0, h - 0.06);
    },
    stool(u, v, h = 0.45) { A('timber', u - 0.17, v - 0.17, u + 0.17, v + 0.17, h - 0.05, h); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) A('wood_dark', u + a * 0.13 - 0.025, v + b * 0.13 - 0.025, u + a * 0.13 + 0.025, v + b * 0.13 + 0.025, 0, h - 0.05); },
    bench(u0, u1, v, h = 0.45) { A('timber', u0, v - 0.16, u1, v + 0.16, h - 0.05, h, true); for (const s of [u0 + 0.1, u1 - 0.14]) A('wood_dark', s, v - 0.14, s + 0.05, v + 0.14, 0, h - 0.05); },
    chest(u, v, w = 1.0, d = 0.5, mat = 'wood_dark') { A(mat, u - w / 2, v - d / 2, u + w / 2, v + d / 2, 0, 0.55, true); A('timber', u - w / 2 - 0.02, v - d / 2 - 0.02, u + w / 2 + 0.02, v + d / 2 + 0.02, 0.55, 0.6); A('iron', u - w / 2 + 0.1, v - d / 2 - 0.03, u - w / 2 + 0.16, v + d / 2 + 0.03, 0.0, 0.6); A('iron', u + w / 2 - 0.16, v - d / 2 - 0.03, u + w / 2 - 0.1, v + d / 2 + 0.03, 0.0, 0.6); },
    scales(u, v, y0) {   // a balance on the counter: pillar, beam and two pans
      A('iron', u - 0.015, v - 0.015, u + 0.015, v + 0.015, y0, y0 + 0.5); A('iron', u - 0.3, v - 0.01, u + 0.3, v + 0.01, y0 + 0.5, y0 + 0.52);
      for (const s of [-0.28, 0.28]) { Rod('iron', [u + s, v, y0 + 0.51], [u + s, v, y0 + 0.2], 0.004, 3); Lh('gilt_bronze', [[0.001, 0], [0.11, 0.03], [0.12, 0.04], [0.001, 0.015]], u + s, v, y0 + 0.17, 10); }
    },
    cage(u, v, y0, bird) {   // a wicker cage with a bird in it, hung or standing
      Lh('wicker', [[0.18, 0], [0.2, 0.1], [0.2, 0.34], [0.12, 0.44], [0.001, 0.5]], u, v, y0, 10); Lh('iron', [[0.185, 0.0], [0.185, 0.03], [0.001, 0.03]], u, v, y0, 10);
      if (bird) Lh(bird, [[0.001, 0], [0.05, 0.03], [0.06, 0.1], [0.04, 0.17], [0.001, 0.2]], u, v, y0 + 0.04, 6);
    },
    tusk(u, v, h) { const p = [u, v]; Rod('ivory', [p[0], p[1], 0], [p[0] + 0.1, p[1] - 0.08, h * 0.6], 0.07, 6); Rod('ivory', [p[0] + 0.1, p[1] - 0.08, h * 0.6], [p[0] + 0.3, p[1] - 0.2, h], 0.04, 6); },
    ham(u, v, y0) { Lh('hide_brown', [[0.001, 0], [0.07, 0.04], [0.11, 0.16], [0.09, 0.28], [0.03, 0.34], [0.001, 0.36]], u, v, y0, 7); },
    herbs(u, v, y0, mat = 'palm_leaf') { Lh(mat, [[0.001, 0], [0.03, 0.02], [0.08, 0.16], [0.05, 0.32], [0.001, 0.34]], u, v, y0, 6); Rod('rope_fibre', [u, v, y0 + 0.34], [u, v, y0 + 0.5], 0.01, 3); },
    bed(u, v, w = 1.5, len = 2.1, along = 'v') {
      const a = along === 'v' ? [u - w / 2, v, u + w / 2, v + len] : [u, v - w / 2, u + len, v + w / 2];
      A('wood_dark', a[0], a[1], a[2], a[3], 0.15, 0.45, true); A('cloth_white', a[0] + 0.04, a[1] + 0.04, a[2] - 0.04, a[3] - 0.04, 0.45, 0.58);
      A(pick(['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre']), a[0] + 0.02, a[1] + (along === 'v' ? len * 0.42 : 0.02), a[2] - 0.02, a[3] - 0.02, 0.58, 0.64);
      if (along === 'v') { A('cloth_white', a[0] + 0.15, a[1] + 0.08, a[2] - 0.15, a[1] + 0.5, 0.58, 0.72); A('wood_dark', a[0], a[1] - 0.06, a[2], a[1], 0.15, 1.35); }
    },
    hearth(u, v0, w = 1.8) {   // a stone hearth against the back wall at v0 (the hood and its chimney), a cauldron, logs
      A('brick', u - w / 2, v0 - 0.8, u + w / 2, v0, 0, 0.5, true);
      for (const s of [-1, 1]) A('brick', u + s * (w / 2) - 0.12 * (s > 0 ? 1 : 0) - (s < 0 ? 0 : 0) , v0 - 0.8, u + s * (w / 2) + (s < 0 ? 0.12 : 0), v0, 0.5, 1.7);
      A('brick', u - w / 2 - 0.1, v0 - 0.85, u + w / 2 + 0.1, v0, 1.7, 2.0); A('brick', u - w / 4, v0 - 0.45, u + w / 4, v0, 2.0, 3.6);
      A('opening', u - w / 2 + 0.15, v0 - 0.02, u + w / 2 - 0.15, v0 - 0.0, 0.52, 1.7);
      Lh('iron', [[0.001, 0], [0.18, 0.04], [0.26, 0.2], [0.22, 0.3], [0.001, 0.3]], u, v0 - 0.4, 0.5, 10);
      Rod('bark_dark', [u - 0.4, v0 - 0.3, 0.5], [u + 0.4, v0 - 0.45, 0.58], 0.05, 5); Rod('bark_dark', [u - 0.35, v0 - 0.5, 0.5], [u + 0.35, v0 - 0.2, 0.57], 0.05, 5);
    },
  };
  return K;
}

const BIRDS = ['cloth_green', 'cloth_red', 'cloth_ochre', 'cloth_blue'];
/** Stocks a shop of trade `t` along its two side walls and back (v 0.5…vb), with a counter in the front third. */
export function shop(K, F, L, vb, t, rand, T = 0.5) {
  const { A, Lh, jar, barrel, sack, crate, coil, bolt, book, shelves, counter, table, stool, scales, cage, tusk, ham, herbs, pick } = K;
  const w = L - 2 * T, vs = T + 0.1, mid = L / 2;
  const counterAt = (u0, u1, v) => { counter(u0, u1, v, v + 0.7); };
  if (t === 'spice') {
    shelves(T, T + 3.4, vs, 0.45, [0.55, 1.15, 1.75], (u, v, h) => jar(u, v, h, 0.11 + rand() * 0.03, 0.3, pick(['terracotta', 'glaze_green', 'pottery_dark', 'glaze_white'])));
    shelves(L - T - 3.4, L - T, vs, 0.45, [0.55, 1.15, 1.75], (u, v, h) => jar(u, v, h, 0.11 + rand() * 0.03, 0.3, pick(['terracotta', 'glaze_blue', 'pottery_dark'])));
    counterAt(mid - 1.4, mid + 1.4, 2.6); scales(mid - 0.6, 2.95, 1.06);
    for (const [u, c] of [[mid - 0.4, 'cloth_ochre'], [mid + 0.4, 'cloth_red'], [mid + 1.0, 'cloth_brown']]) Lh(c, [[0.001, 0], [0.16, 0], [0.12, 0.09], [0.001, 0.16]], u, 2.95, 1.06, 8);
    for (let k = 0; k < 6; k++) sack(T + 0.45 + (k % 3) * 0.55, vb - 0.5 - Math.floor(k / 3) * 0.5, 0, 'sacking', true);
    for (let k = 0; k < 3; k++) sack(L - T - 0.5 - k * 0.55, vb - 0.5, 0, 'sacking', true);
    barrel(mid, vb - 0.5);
  } else if (t === 'porcelain') {
    for (const [a, b] of [[T, T + 3.6], [L - T - 3.6, L - T]]) shelves(a, b, vs, 0.5, [0.5, 1.1, 1.7], (u, v, h, row) => { if (rand() < 0.2) return; Lh(row === 1 ? 'glaze_white' : 'glaze_blue', jarP(0.12, 0.32), u, v, h, 10); if (rand() < 0.5) Lh('glaze_white', [[0.001, 0], [0.1, 0.01], [0.1, 0.05], [0.001, 0.04]], u + 0.2, v, h, 10); }, 0.42);
    counterAt(mid - 1.2, mid + 1.2, 2.5);
    for (let k = 0; k < 4; k++) Lh(k % 2 ? 'glaze_white' : 'glaze_blue', jarP(0.14, 0.34), mid - 0.9 + k * 0.6, 2.85, 1.06, 10);
    for (let k = 0; k < 5; k++) crate(T + 0.5 + (k % 3) * 0.65, vb - 0.5 - Math.floor(k / 3) * 0.65, k > 2 ? 0.5 : 0, 0.55);
    for (let k = 0; k < 3; k++) { jar(L - T - 0.6 - k * 0.55, vb - 0.6, 0, 0.26, 0.9, 'glaze_blue'); }
  } else if (t === 'cloth') {
    for (const [a, b] of [[T, T + 3.8], [L - T - 3.8, L - T]]) shelves(a, b, vs, 0.5, [0.45, 1.0, 1.55, 2.1], (u, v, h) => { bolt(u + 0.18, v - 0.1, h, 0.34, pick(CLOTHS)); }, 0.42);
    counterAt(mid - 1.5, mid + 1.5, 2.4);
    for (let k = 0; k < 4; k++) A(pick(CLOTHS), mid - 1.35 + k * 0.7, 2.45, mid - 0.85 + k * 0.7, 2.95, 1.06, 1.06 + 0.08 + (k % 2) * 0.08);
    A('timber', mid + 0.9, 2.5, mid + 2.1, 2.54, 1.07, 1.1);   // the ell rod laid along the counter
    for (let k = 0; k < 4; k++) A(pick(CLOTHS), T + 0.5 + (k % 2) * 0.8, vb - 0.8 - Math.floor(k / 2) * 0.8, T + 1.1 + (k % 2) * 0.8, vb - 0.3 - Math.floor(k / 2) * 0.8, 0, 0.5 + (k % 3) * 0.1, true);
  } else if (t === 'jeweller') {
    counterAt(mid - 1.0, mid + 1.0, 2.2); scales(mid - 0.5, 2.55, 1.06);
    for (let k = 0; k < 5; k++) Lh('gilt_bronze', [[0.001, 0], [0.05, 0.01], [0.05, 0.05], [0.001, 0.03]], mid - 0.7 + k * 0.32, 2.5, 1.06, 8);
    A('cloth_red', mid + 0.2, 2.3, mid + 0.9, 2.55, 1.06, 1.08);
    shelves(mid - 1.2, mid + 1.2, vb - 0.6, 0.35, [0.9, 1.5], (u, v, h) => { Lh('gilt_bronze', jarP(0.06, 0.2), u, v, h, 8); }, 0.3);
    for (const s of [T + 0.5, L - T - 0.9]) { A('iron', s, vb - 0.9, s + 0.4, vb - 0.4, 0, 0.5, true); A('wood_dark', s - 0.05, vb - 0.95, s + 0.45, vb - 0.35, 0.5, 0.58); }
    A('iron', T + 0.1, 3.6, T + 0.18, 4.4, 0.6, 1.9);   // the grille by the strongroom
  } else if (t === 'parrots') {
    for (let k = 0; k < 5; k++) cage(T + 0.7 + k * (w - 1.4) / 4, vs + 0.25, 1.35 + (k % 2) * 0.4, BIRDS[k % 4]);
    for (let k = 0; k < 3; k++) cage(T + 0.9 + k * 0.75, vb - 0.6, 0, BIRDS[(k + 1) % 4]);
    for (const s of [-0.5, 0.0, 0.5]) tusk(mid + s * 1.6, vb - 0.5, 1.7 - Math.abs(s) * 0.5);
    counterAt(L - T - 2.6, L - T - 0.1, 2.6);
    for (let k = 0; k < 3; k++) { Lh('hide_tan', [[0.001, 0], [0.1, 0.02], [0.12, 0.1], [0.001, 0.2]], L - T - 2.3 + k * 0.7, 2.95, 1.06, 8); }   // ostrich eggs and gourds
    crate(T + 0.5, 3.1, 0, 0.6); crate(T + 0.5, 3.8, 0, 0.6); A('cloth_ochre', T + 0.3, 3.0, T + 0.9, 4.1, 0.55, 0.62);
  } else if (t === 'chandler') {
    for (let k = 0; k < 4; k++) coil(T + 0.5 + (k % 2) * 0.75, vs + 0.5 + Math.floor(k / 2) * 0.75, Math.floor(k / 2) * 0, 0.34);
    for (let k = 0; k < 3; k++) coil(L - T - 0.5 - k * 0.72, vs + 0.5, k % 2 ? 0.22 : 0, 0.34);
    for (let k = 0; k < 4; k++) barrel(mid - 1.2 + k * 0.8, vb - 0.5);
    for (let k = 0; k < 5; k++) A(k % 2 ? 'linen' : 'cloth_white', T + 0.3 + k * 0.5, vb - 0.4, T + 0.7 + k * 0.5, vb - 0.1, 0, 0.5, false);
    counterAt(mid - 1.0, mid + 1.0, 2.4);
    for (let k = 0; k < 3; k++) { Lh('iron', [[0.001, 0], [0.1, 0.0], [0.12, 0.3], [0.001, 0.32]], mid - 0.6 + k * 0.6, 2.75, 1.06, 6); }
    for (let k = 0; k < 3; k++) { K.Rod('iron', [T + 1.0 + k * 1.2, vs + 0.2, 2.2], [T + 1.0 + k * 1.2, vs + 0.2, 1.5], 0.01, 3); K.Lh('lamp_glass', [[0.001, 0], [0.1, 0.05], [0.09, 0.25], [0.001, 0.3]], T + 1.0 + k * 1.2, vs + 0.2, 1.2, 6); }
  } else if (t === 'grocer') {
    for (let k = 0; k < 4; k++) Lh('terracotta', [[0.001, 0], [0.2, 0], [0.38, 0.28], [0.44, 0.62], [0.36, 1.0], [0.22, 1.16], [0.25, 1.22], [0.001, 1.22]], T + 0.6 + k * 0.95, vs + 0.55, 0, 12);
    for (let k = 0; k < 3; k++) barrel(L - T - 0.5 - k * 0.7, vs + 0.5);
    for (let k = 0; k < 5; k++) ham(T + 1.0 + k * 0.7, vs + 2.2, 2.05);
    for (let k = 0; k < 4; k++) herbs(L - T - 0.8 - k * 0.6, vs + 2.2, 2.0);
    counterAt(mid - 1.4, mid + 1.4, 2.8);
    for (let k = 0; k < 4; k++) Lh('hide_tan', [[0.001, 0], [0.2, 0], [0.22, 0.1], [0.001, 0.1]], mid - 1.0 + k * 0.6, 3.15, 1.06, 10);
    for (let k = 0; k < 3; k++) Lh('wicker', [[0.2, 0], [0.26, 0.2], [0.22, 0.2], [0.001, 0.04]], mid + 0.9 + k * 0.35, 3.1, 1.06, 9);
    shelves(T, T + 3.0, vb - 0.55, 0.4, [0.5, 1.1, 1.7], (u, v, h) => jar(u, v, h, 0.1, 0.26, pick(['terracotta', 'glaze_green'])), 0.35);
  } else if (t === 'apothecary') {
    for (const [a, b] of [[T, T + 3.6], [L - T - 3.6, L - T]]) shelves(a, b, vs, 0.4, [0.55, 1.1, 1.65, 2.2], (u, v, h) => Lh(pick(['glaze_white', 'glaze_blue', 'glaze_white']), [[0.001, 0], [0.09, 0], [0.065, 0.1], [0.06, 0.2], [0.075, 0.25], [0.001, 0.25]], u, v, h, 8), 0.3);
    counterAt(mid - 1.0, mid + 1.0, 2.6);
    Lh('bronze', [[0.001, 0], [0.12, 0.02], [0.14, 0.12], [0.001, 0.12]], mid - 0.4, 2.95, 1.06, 10); scales(mid + 0.5, 2.95, 1.06);
    for (let k = 0; k < 6; k++) herbs(T + 0.6 + k * (w - 1.2) / 5, vs + 2.0, 2.1, k % 2 ? 'palm_leaf' : 'flax_leaf');
    Lh('glaze_white', [[0.001, 0], [0.2, 0.0], [0.26, 0.3], [0.2, 0.62], [0.001, 0.66]], T + 0.6, vb - 0.6, 0, 10);
  } else if (t === 'tavern') {
    const nt = Math.max(2, Math.floor((w - 1.2) / 2.2));
    for (let k = 0; k < nt; k++) for (const v of [2.3, 4.1]) { const u = T + 1.0 + k * 2.1; if (u > L - 2.5) continue; table(u, v, 1.5, 0.75); K.bench(u - 0.7, u + 0.7, v - 0.7); K.bench(u - 0.7, u + 0.7, v + 0.7); Lh('terracotta', jarP(0.07, 0.2), u - 0.3, v, 0.78, 8); Lh('glaze_white', [[0.001, 0], [0.05, 0], [0.05, 0.1], [0.001, 0.1]], u + 0.25, v + 0.1, 0.78, 8); }
    counterAt(L - T - 0.8, L - T - 0.1, 1.2);
    for (let k = 0; k < 4; k++) barrel(L - T - 0.5, 2.2 + k * 0.7, 0, 0.3, 0.8);
    for (let k = 0; k < 5; k++) Lh('terracotta', jarP(0.08, 0.28), L - T - 0.45, 1.5 + k * 0.55, 1.06, 8);
    for (let k = 0; k < 3; k++) ham(T + 1.4 + k * 0.9, vb - 0.3, 2.0);
  } else {   // a plain trader's shop: a counter, a few sacks and jars
    counterAt(mid - 1.2, mid + 1.2, 2.5);
    for (let k = 0; k < 4; k++) sack(T + 0.5 + k * 0.55, vb - 0.5, 0);
    for (let k = 0; k < 3; k++) jar(L - T - 0.5 - k * 0.5, vb - 0.5, 0, 0.2, 0.6);
  }
}

/** A home's main room: table and stools, the hearth at the back, a chest, a cupboard of crockery, nets or tools by trade. */
export function home(K, F, L, v0, v1, kind, rand, T = 0.5) {
  const { A, Lh, table, stool, chest, hearth, jar, barrel, pick, Rod } = K;
  const mid = L / 2;
  table(mid - 0.6, (v0 + v1) / 2, 1.3, 0.8); stool(mid - 1.5, (v0 + v1) / 2); stool(mid + 0.3, (v0 + v1) / 2 + 0.2); stool(mid - 0.6, (v0 + v1) / 2 - 0.8);
  Lh('terracotta', jarP(0.09, 0.26), mid - 0.8, (v0 + v1) / 2, 0.78, 8); Lh('glaze_white', [[0.001, 0], [0.08, 0], [0.08, 0.05], [0.001, 0.05]], mid - 0.4, (v0 + v1) / 2 + 0.1, 0.78, 8);
  hearth(Math.min(L - 1.6, mid + 1.4), v1 - T, 1.7);
  chest(T + 0.55, v0 + 0.6, 1.0, 0.5);
  A('wood_dark', T + 0.05, v1 - T - 1.2, T + 0.5, v1 - T - 0.1, 0, 1.9, true);
  for (const h of [0.6, 1.1, 1.6]) A('timber', T + 0.05, v1 - T - 1.2, T + 0.5, v1 - T - 0.1, h - 0.02, h + 0.02);
  for (let k = 0; k < 6; k++) Lh(k % 2 ? 'glaze_white' : 'terracotta', jarP(0.06, 0.16), T + 0.28, v1 - T - 1.0 + (k % 3) * 0.35, 0.62 + Math.floor(k / 3) * 0.5, 7);
  if (kind === 'fisher') {   // nets over a pole, floats, an oar and a basket of line
    Rod('timber', [T + 0.1, v0 + 2.2, 2.2], [L - T - 0.1, v0 + 2.2, 2.2], 0.04, 5);
    for (let k = 0; k < 4; k++) A('rope_fibre', T + 0.6 + k * (L - 2 * T - 1.4) / 3, v0 + 2.1, T + 0.6 + k * (L - 2 * T - 1.4) / 3 + 0.5, v0 + 2.3, 1.1 + (k % 2) * 0.15, 2.2);
    Rod('timber', [L - T - 0.3, v0 + 0.5, 0], [L - T - 0.15, v0 + 0.55, 2.2], 0.035, 5);
    for (let k = 0; k < 3; k++) barrel(T + 0.5 + k * 0.7, v1 - 1.6, 0, 0.26, 0.6);
  } else {
    barrel(L - T - 0.5, v0 + 0.6);
  }
}
