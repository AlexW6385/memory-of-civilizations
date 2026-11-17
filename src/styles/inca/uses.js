// The uses of Machu Picchu's houses beyond the plain living room (docs/settlements/machu-picchu.md §12.3):
// a spinner's, a storekeeper's, a mason's, a brewer's, and the nobles' (a dais and kero cups). Placed in the
// free front half of the room, clear of the door's corridor (|b| < 0.7), the stove, the batán and the mats.

import { box, lathe, frustum, rod } from '../../core/geom.js';

/**
 * c: { bag, col, at (a, b → [x, z]), sd (the stove's side), rand, depth, width, y, urpu, olla, bowl }.
 * Local a runs from the front wall (-depth/2) to the back, b across; zone Z1 is the front half on the side away from the stove.
 */
export function useThings(c, use) {
  const { bag, col, at, sd, rand, depth, width, y, urpu, olla, bowl } = c;
  if (width < 7 || depth < 4.4) return;
  const cb = -sd * Math.min(Math.max(1.5, width / 2 - 1.6), 2.2), ca = -depth / 2 + 1.5;
  const Z = (da, db) => at(ca + da, cb - sd * db);              // a point in zone Z1
  const heap = (mat, p, r, h) => bag.add(mat, lathe([[r, 0], [r * 0.82, h * 0.45], [r * 0.45, h * 0.85], [0.001, h]], 8, null, p[0], y, p[1]));
  const cloths = ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_black', 'cloth_white'];
  const m = y + 0.0;
  if (use === 'spinner') {
    // a mat with the wool in bundles of every colour, a basket of fleece, a drop spindle laid across, two low seats
    const mat = [Z(-0.8, -0.55), Z(0.8, 0.55)];
    bag.add('reed_mat', box(Math.min(mat[0][0], mat[1][0]), m, Math.min(mat[0][1], mat[1][1]), Math.max(mat[0][0], mat[1][0]), m + 0.025, Math.max(mat[0][1], mat[1][1])));
    for (let i = 0; i < 4; i++) { const p = Z(-0.55 + i * 0.36, 0.25 * (i % 2 ? 1 : -1)); bag.add(cloths[(i + Math.floor(rand() * 5)) % 5], lathe([[0.16, 0], [0.15, 0.1], [0.09, 0.19], [0.001, 0.21]], 8, null, p[0], m + 0.025, p[1])); }
    const bp = Z(1.0, 0.2); bag.add('wicker', lathe([[0.26, 0], [0.29, 0.2], [0.27, 0.36], [0.001, 0.36]], 10, null, bp[0], m, bp[1])); heap('hide_white', bp, 0.25, 0.5 + 0.0); col.circle(bp[0], bp[1], 0.3, m, m + 0.5);
    const sp = Z(0.1, -0.65), sq = Z(0.1, -0.33); bag.add('timber', rod([sp[0], m + 0.04, sp[1]], [sq[0], m + 0.04, sq[1]], 0.008, 4)); bag.add('terracotta', lathe([[0.03, -0.006], [0.03, 0.006]], 8, null, sq[0], m + 0.034, sq[1]));
    for (const db of [-0.95, 1.0]) { const s = Z(-0.1, db); bag.add('granite_rough', frustum([s[0] - 0.17, s[1] - 0.17, s[0] + 0.17, s[1] + 0.17], m - 0.02, m + 0.2, 0.02, 0.02, 0.02, 0.02)); }
  } else if (use === 'store') {
    // wicker bins of grain, sacks of tubers, a jar or two [inferred: the household's stores, after the qollqa's]
    for (let i = 0; i < 3; i++) {
      const p = Z(-0.2 + (i % 2) * 0.1, -0.7 + i * 0.7);
      if (i === 1) { for (let s = 0; s < 3; s++) { const a = s * 2.1 + rand(), px = p[0] + Math.cos(a) * 0.17, pz = p[1] + Math.sin(a) * 0.17; bag.add('sacking', lathe([[0.2, 0], [0.26, 0.2], [0.2, 0.45], [0.1, 0.6], [0.001, 0.62]], 8, null, px, m, pz)); } col.circle(p[0], p[1], 0.42, m, m + 0.6); }
      else { bag.add('wicker', lathe([[0.36, 0], [0.4, 0.4], [0.36, 0.8], [0.32, 0.84], [0.001, 0.84]], 10, null, p[0], m, p[1])); heap('paint_ochre', [p[0], p[1]], 0.3, 0.12); col.circle(p[0], p[1], 0.4, m, m + 0.85); }
    }
    for (let i = 0; i < 2; i++) { const p = Z(1.2, -0.5 + i * 1.0); urpu(bag, p[0], m - 0.05, p[1], 0.7 + rand() * 0.15, rand() * 6.28); col.circle(p[0], p[1], 0.22, m, m + 0.7); }
  } else if (use === 'mason') {
    // the mason's bench of a granite slab on two stones; a block half dressed on it, hammerstones, a bronze bar, a heap of sand, dressed blocks stacked
    // [stated: "masons dressed blocks with heavy stone hammers" — ancient-history-sites]
    const b0 = Z(-0.5, -0.5), b1 = Z(0.5, 0.5), r = [Math.min(b0[0], b1[0]), Math.min(b0[1], b1[1]), Math.max(b0[0], b1[0]), Math.max(b0[1], b1[1])];
    bag.add('granite_inca', frustum(r, m + 0.32, m + 0.42, 0.01, 0.01, 0.01, 0.01));
    for (const sg of [-1, 1]) { const p = Z(sg * 0.35, 0); bag.add('granite_rough', box(p[0] - 0.12, m - 0.02, p[1] - 0.12, p[0] + 0.12, m + 0.33, p[1] + 0.12)); }
    col.rect(r, m, m + 0.42);
    const bc = Z(-0.1, 0.05); bag.add('granite_inca', frustum([bc[0] - 0.22, bc[1] - 0.15, bc[0] + 0.22, bc[1] + 0.15], m + 0.42, m + 0.64, 0.02, 0.05, 0.02, 0.02));
    for (let i = 0; i < 3; i++) { const p = Z(0.25 + i * 0.12, -0.3 + i * 0.25); bag.add('rock_boulder', lathe([[0.001, 0], [0.065, 0.03], [0.07, 0.07], [0.04, 0.12], [0.001, 0.13]], 7, null, p[0], m + 0.42, p[1])); }
    const q0 = Z(-0.3, 0.3), q1 = Z(0.3, 0.35); bag.add('bronze', rod([q0[0], m + 0.45, q0[1]], [q1[0], m + 0.45, q1[1]], 0.014, 5));
    heap('limestone', Z(0.8, 0.9), 0.3, 0.2);
    for (let i = 0; i < 3; i++) { const s = Z(1.1, -0.9 + (i === 2 ? -0.2 : 0)); bag.add('granite_inca', box(s[0] - 0.3, m + i * 0.2, s[1] - 0.22 - (i === 2 ? 0.2 : 0), s[0] + 0.3, m + (i + 1) * 0.2, s[1] + 0.22 - (i === 2 ? 0.2 : 0))); }
    { const s = Z(1.1, -0.9); col.rect([s[0] - 0.3, s[1] - 0.22, s[0] + 0.3, s[1] + 0.22], m, m + 0.6); }
  } else if (use === 'brewer') {
    // jars of maize beer standing in a row, a big pot on three stones with its fire, a paddle and a gourd [inferred: after the beer made at home for the feasts]
    for (let i = 0; i < 3; i++) { const p = Z(-0.4 + i * 0.62, 0.35 * (i % 2 ? -1 : 1)); urpu(bag, p[0], m - 0.05, p[1], 0.9 + rand() * 0.1, rand() * 6.28); col.circle(p[0], p[1], 0.25, m, m + 0.9); }
    const hc = Z(1.45, 0.1);
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.4; bag.add('granite_rough', lathe([[0.001, 0], [0.09, 0], [0.08, 0.2], [0.001, 0.23]], 6, null, hc[0] + Math.cos(a) * 0.2, m, hc[1] + Math.sin(a) * 0.2)); }
    olla(bag, hc[0], m + 0.2, hc[1], 0.27); col.circle(hc[0], hc[1], 0.34, m, m + 0.5);
    for (let i = 0; i < 4; i++) { const a = i * 1.6, p = [hc[0] + Math.cos(a) * 0.1, hc[1] + Math.sin(a) * 0.1]; bag.add('timber', rod([p[0], m + 0.04, p[1]], [p[0] + Math.cos(a + 0.4) * 0.45, m + 0.04, p[1] + Math.sin(a + 0.4) * 0.45], 0.02, 4)); }
    const pa = Z(1.0, -0.8), pb = Z(0.55, -0.95); bag.add('timber', rod([pa[0], m + 0.05, pa[1]], [pb[0], m + 1.0, pb[1]], 0.02, 5));
  } else if (use === 'noble') {
    // a dais of cut granite with a hide on it, kero cups, a pair of tall jars
    const d0 = Z(-0.7, -0.6), d1 = Z(0.7, 0.6), r = [Math.min(d0[0], d1[0]), Math.min(d0[1], d1[1]), Math.max(d0[0], d1[0]), Math.max(d0[1], d1[1])];
    bag.add('granite_inca', frustum(r, m - 0.02, m + 0.2, 0.03, 0.03, 0.03, 0.03));
    const h0 = Z(-0.45, -0.4), h1 = Z(0.55, 0.4); bag.add('hide_white', frustum([Math.min(h0[0], h1[0]), Math.min(h0[1], h1[1]), Math.max(h0[0], h1[0]), Math.max(h0[1], h1[1])], m + 0.2, m + 0.225, 0.01, 0.01, 0.01, 0.01));
    for (const db of [-0.25, 0.25]) { const p = Z(0.45, db); bag.add('wood_ochre', lathe([[0.001, 0], [0.04, 0.005], [0.042, 0.04], [0.065, 0.14], [0.06, 0.145], [0.036, 0.04], [0.001, 0.03]], 8, null, p[0], m + 0.225, p[1])); }
    for (const db of [-0.55, 0.55]) { const p = Z(1.3, db); urpu(bag, p[0], m - 0.05, p[1], 1.0, rand() * 6.28); col.circle(p[0], p[1], 0.26, m, m + 1.0); }
    col.rect(r, m, m + 0.2);
  }
}
