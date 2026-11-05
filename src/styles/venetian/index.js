// Venetian architecture about 1500 (docs/settlements/venice.md §4): San Marco — a Greek cross under
// five domes on drums with tall lead-covered outer shells and lanterns, the west front of arches;
// the brick campanile with its belfry and green spire; the Doge's Palace — two storeys of white
// arcades carrying a wall of pink and white diamond-patterned stone; the long arcaded Procuratie;
// the two columns of the Piazzetta; canals, houses and bridges.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, rod } from '../../core/geom.js';
import '../qing/index.js';

const M = 'marble', B = 'brick', L = 'lead', I = 'limestone';
/** basilica: { c, s (arm length), w (arm width), h, y } — the Greek cross with its five domes, the west front. */
function basilica(el, { bag, col }) {
  const [cx, cz] = el.c, S = el.s ?? 38, Wd = el.w ?? 22, H = el.h ?? 22, y = el.y ?? 0;
  for (const r of [[cx - S, cz - Wd / 2, cx + S, cz + Wd / 2], [cx - Wd / 2, cz - S * 0.8, cx + Wd / 2, cz + S * 0.8]]) { bag.add(B, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); col.floor(r, y + H); }
  // the narthex and the west front of five great arches with their gables
  const f = [cx - S - 10, cz - S * 0.85, cx - S, cz + S * 0.85];
  bag.add(M, box(f[0], y - 0.5, f[1], f[2], y + H * 0.7, f[3])); col.rect(f, y, y + H * 0.7);
  // B2(z0, z1, y0, y1, d0, d1): a box on the west front, d measured outward (toward -x) from its face
  const fx = f[0], B2 = (z0, z1, y0, y1, d0, d1) => box(fx - d1, y0, z0, fx - d0, y1, z1);
  const P = (zz, yy, d) => [fx - d, yy, zz];
  const ring = (zc, yc, r0, r1, d0, d1, mat) => {                        // a round arch ring in segments
    const N = 12, t = r1 - r0, rr = (r0 + r1) / 2, len = rr * Math.PI / N + 0.04;
    for (let i = 0; i < N; i++) {
      const am = Math.PI * (i + 0.5) / N, zc2 = zc + Math.cos(am) * rr, yc2 = yc + Math.sin(am) * rr;
      const g = box(fx - d1, -t / 2, -len / 2, fx - d0, t / 2, len / 2);
      g.translate(-fx, 0, 0); g.rotateX(-(am - Math.PI / 2)); g.translate(fx, yc2, zc2);
      bag.add(mat, g);
    }
  };
  const PW = (f[3] - f[1]) / 5, spring = H * 0.38;
  for (let k = 0; k < 5; k++) {
    const zc = f[1] + (k + 0.5) * PW, big = k === 2, w = PW * (big ? 0.8 : 0.66), r = w / 2;
    // the recess: stepped archivolts, a dark door below, the gold lunette above it
    for (let st = 0; st < 3; st++) {
      const rr = r + 0.4 + st * 0.55, dd = 2.4 - st * 0.8;
      for (const sz of [-1, 1]) bag.add(M, B2(sz < 0 ? zc - rr : zc + rr - 0.55, sz < 0 ? zc - rr + 0.55 : zc + rr, y, y + spring, dd - 0.8, dd));
      ring(zc, y + spring, rr - 0.55, rr, dd - 0.8, dd, st === 1 ? 'marble_pink' : M);
    }
    bag.add('opening', B2(zc - r * 0.62, zc + r * 0.62, y, y + spring * 0.62, 2.35, 2.42));
    for (let i = 0; i < 8; i++) { const t0 = i / 8, t1 = (i + 1) / 8, hw = r * Math.sqrt(1 - t0 * t0); bag.add('mosaic_gold', B2(zc - hw, zc + hw, y + spring + r * t0, y + spring + r * t1, 2.36, 2.44)); }
    bag.add('mosaic_gold', B2(zc - r + 0.2, zc + r - 0.2, y + spring * 0.64, y + spring - 0.02, 2.36, 2.44));
    // two tiers of colonnettes on the piers between the portals
    if (k > 0) { const zp = f[1] + k * PW; for (const dz of [-0.5, 0, 0.5]) for (const [y0, y1] of [[0.6, spring * 0.5], [spring * 0.52, spring]]) bag.add(dz === 0 ? 'verde_antico' : 'marble_pink', rod(P(zp + dz, y + y0, 2.9), P(zp + dz, y + y1, 2.9), 0.18, 8)); }
    // the upper arch over the loggia: a lunette of gold mosaic under an ogee crown of crockets, a statue at its tip
    const uy = y + H * 0.72, ur = PW * 0.44;
    for (let i = 0; i < 8; i++) { const t0 = i / 8, t1 = (i + 1) / 8, hw = ur * Math.sqrt(1 - t0 * t0); bag.add('mosaic_gold', B2(zc - hw, zc + hw, uy + ur * 0.4 + ur * t0, uy + ur * 0.4 + ur * t1, -0.1, 0)); }
    bag.add('mosaic_gold', B2(zc - ur, zc + ur, uy, uy + ur * 0.4, -0.1, 0));
    for (let i = 0; i < 10; i++) {                                           // the ogee: convex then concave to a point
      const t = i / 10, t1 = (i + 1) / 10, prof = (u) => (u < 0.5 ? Math.sqrt(1 - (1 - 2 * u) ** 2) * 0.5 : 1 - Math.sqrt(1 - (2 - 2 * u) ** 2) * 0.5);
      const hw0 = (ur + 0.7) * (1 - prof(t) * 0.5 - t * 0.5), yy0 = uy + ur * 1.4 + t * ur * 1.3, yy1 = uy + ur * 1.4 + t1 * ur * 1.3;
      bag.add(M, B2(zc - hw0, zc + hw0, yy0, yy1, -0.2, 0.5));
      for (const sz of [-1, 1]) bag.add(M, lathe([[0.22, 0], [0.1, 0.35], [0.001, 0.55]], 6, null, fx - 0.2, yy0 + 0.1, zc + sz * hw0));
    }
    const tip = uy + ur * 2.7;
    bag.add(M, lathe([[0.45, 0], [0.4, 1.4], [0.25, 1.7], [0.001, 2.1]], 8, null, fx - 0.15, tip, zc));
    // tabernacles (pinnacles with a statue) between the upper arches
    if (k < 4) { const zp = f[1] + (k + 1) * PW; bag.add(M, box(fx - 1.2, uy, zp - 0.9, fx + 0.4, uy + ur * 1.5, zp + 0.9)); bag.add(M, lathe([[0.95, 0], [0.001, ur * 1.2]], 4, null, fx - 0.4, uy + ur * 1.5, zp)); }
  }
  // the loggia over the narthex: a balustrade along the top of the lower storey, the four horses in the middle
  bag.add(M, B2(f[1], f[3], y + H * 0.7 - 0.3, y + H * 0.7, 0, 1.2));
  for (let zz = f[1] + 0.3; zz < f[3]; zz += 0.5) bag.add(M, lathe([[0.1, 0], [0.16, 0.4], [0.08, 0.9]], 6, null, fx - 1.0, y + H * 0.7, zz));
  bag.add(M, B2(f[1], f[3], y + H * 0.7 + 0.95, y + H * 0.7 + 1.1, 0.8, 1.2));
  for (const dz of [-3.6, -1.2, 1.2, 3.6]) {
    const hz = (f[1] + f[3]) / 2 + dz, hy = y + H * 0.7 + 0.1;
    bag.add('gilt_bronze', box(fx - 0.9, hy + 1.0, hz - 0.35, fx + 0.9, hy + 1.8, hz + 0.35));
    for (const [lx, lz] of [[-0.7, -0.2], [-0.7, 0.2], [0.7, -0.2], [0.7, 0.2]]) bag.add('gilt_bronze', box(fx + lx - 0.08, hy, hz + lz - 0.08, fx + lx + 0.08, hy + 1.05, hz + lz + 0.08));
    bag.add('gilt_bronze', box(fx - 1.4, hy + 1.6, hz - 0.18, fx - 0.7, hy + 2.6, hz + 0.18));
  }
  // the five domes: drum with windows, the tall lead outer shell, the lantern and cross
  for (const [dx, dz, r] of [[0, 0, 7.5], [-S * 0.62, 0, 6.5], [S * 0.62, 0, 6.5], [0, -S * 0.55, 6.5], [0, S * 0.55, 6.5]]) {
    const x = cx + dx, z = cz + dz;
    bag.add(B, lathe([[r, 0], [r, 3]], 16, null, x, y + H, z));
    bag.add(L, lathe([[r * 1.05, 0], [r * 1.05, r * 0.4], [r * 0.95, r * 0.95], [r * 0.6, r * 1.45], [r * 0.2, r * 1.7], [0.001, r * 1.75]], 16, null, x, y + H + 3, z));
    bag.add(L, lathe([[1, 0], [1, 2], [0.4, 3.2], [0.001, 3.6]], 8, null, x, y + H + 3 + r * 1.72, z));
    bag.add('gilt_bronze', box(x - 0.08, y + H + 6.5 + r * 1.72, z - 0.08, x + 0.08, y + H + 8.5 + r * 1.72, z + 0.08));
  }
}
/** bell_tower: { c, s, h, y } — brick shaft with pilaster strips, the belfry's arches, the attic and the pyramidal green spire with its angel. */
function bellTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 12, h = el.h ?? 98, y = el.y ?? 0, sh = h * 0.5;
  bag.add(B, box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + sh, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h);
  for (let k = -2; k <= 2; k++) for (const [ax, az] of [[1, 0], [0, 1]]) bag.add(B, box(x + (ax ? k * s / 5 - 0.3 : -s / 2 - 0.15), y, z + (az ? k * s / 5 - 0.3 : -s / 2 - 0.15), x + (ax ? k * s / 5 + 0.3 : s / 2 + 0.15), y + sh, z + (az ? k * s / 5 + 0.3 : s / 2 + 0.15)));
  bag.add(I, box(x - s / 2 - 0.3, y + sh, z - s / 2 - 0.3, x + s / 2 + 0.3, y + sh + 1.2, z + s / 2 + 0.3));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(I, box(x + dx * s * 0.42 - 0.5, y + sh + 1.2, z + dz * s * 0.42 - 0.5, x + dx * s * 0.42 + 0.5, y + sh + 10, z + dz * s * 0.42 + 0.5));
  bag.add(I, box(x - s / 2 - 0.3, y + sh + 10, z - s / 2 - 0.3, x + s / 2 + 0.3, y + sh + 11.5, z + s / 2 + 0.3));
  bag.add(B, box(x - s / 2 + 0.5, y + sh + 11.5, z - s / 2 + 0.5, x + s / 2 - 0.5, y + sh + 19, z + s / 2 - 0.5));
  bag.add('tile_green', frustum([x - s / 2 + 0.5, z - s / 2 + 0.5, x + s / 2 - 0.5, z + s / 2 - 0.5], y + sh + 19, y + h - 2, s / 2 - 0.6, s / 2 - 0.6, s / 2 - 0.6, s / 2 - 0.6));
  bag.add('gilt_bronze', lathe([[0.4, 0], [0.3, 1.5], [0.001, 2.5]], 8, null, x, y + h - 2, z));
}
/** doges_palace: { rect, h, y } — the arcade on the ground, the loggia above, the diamond-patterned wall, the crenellation. */
function dogesPalace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 25, a1 = h * 0.29, a2 = h * 0.22;
  const ring = [[x0, z0, x1, z0 + 9], [x0, z1 - 9, x1, z1], [x0, z0 + 9, x0 + 9, z1 - 9], [x1 - 9, z0 + 9, x1, z1 - 9]];
  for (const r of ring) { bag.add('brick_buff', box(r[0] + 1.5, y - 0.5, r[1] + 1.5, r[2] - 1.5, y + a1 + a2, r[3] - 1.5)); col.rect([r[0] + 1.5, r[1] + 1.5, r[2] - 1.5, r[3] - 1.5], y, y + h); }
  // the outer arcades on the two façades (south and west): columns at ground and loggia levels
  for (const [a, b] of [[[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]]]) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    for (const [yy, hh, step, r] of [[y, a1, 5, 0.55], [y + a1 + 0.8, a2 - 0.8, 2.5, 0.3]]) { const n = Math.floor(len / step); for (let i = 0; i <= n; i++) { const px = a[0] + ux * len * i / n, pz = a[1] + uz * len * i / n; bag.add(M, lathe([[r, 0], [r * 0.9, hh - 0.5], [r * 1.4, hh]], 10, null, px, yy, pz)); if (yy === y) col.circle(px, pz, r, y, y + hh); } }
    const t = 0.6, rr = [Math.min(a[0], b[0]) - t, Math.min(a[1], b[1]) - t, Math.max(a[0], b[0]) + t, Math.max(a[1], b[1]) + t];
    bag.add(M, box(rr[0], y + a1, rr[1], rr[2], y + a1 + 0.8, rr[3]));
  }
  // the upper wall in pink and white over everything, its large pointed windows, the crenellation
  bag.add('stucco_rose', box(x0 - 0.6, y + a1 + a2, z0 - 0.6, x1 + 0.6, y + h, z1 + 0.6)); col.floor([x0, z0, x1, z1], y + h);
  for (const [a, b, f] of [[x0, x1, 's'], [z0, z1, 'w']]) { const n = Math.floor((b - a) / 9); for (let i = 0; i < n; i++) { const u = a + (i + 0.5) * (b - a) / n; const q = f === 's' ? [u - 1.4, z1 + 0.56, u + 1.4, z1 + 0.64] : [x0 - 0.64, u - 1.4, x0 - 0.56, u + 1.4]; bag.add('opening', box(q[0], y + a1 + a2 + 2.5, q[1], q[2], y + a1 + a2 + 7.5, q[3])); } }
  bag.add(L, frustum([x0 - 0.8, z0 - 0.8, x1 + 0.8, z1 + 0.8], y + h, y + h + 4, 4, 4, 4, 4));
  for (let x = x0; x < x1; x += 2.6) bag.add(M, box(x, y + h, z1 + 0.2, x + 1, y + h + 1.6, z1 + 0.6));
}
/** procuratie: { rect, h, y, front ('n'|'s'|'e'|'w') } — a long range over a ground-floor arcade. */
function procuratie(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 15, f = el.front ?? 's', along = f === 'n' || f === 's';
  bag.add(I, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  const L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 4);
  for (let i = 0; i < n; i++) for (const [yy, hh] of [[y, 4.5], [y + 6, 3], [y + 10.5, 2.6]]) { const u = (along ? x0 : z0) + (i + 0.5) * L / n; const q = f === 's' ? [u - 1.2, z1 - 0.02, u + 1.2, z1 + 0.06] : f === 'n' ? [u - 1.2, z0 - 0.06, u + 1.2, z0 + 0.02] : f === 'w' ? [x0 - 0.06, u - 1.2, x0 + 0.02, u + 1.2] : [x1 - 0.02, u - 1.2, x1 + 0.06, u + 1.2]; bag.add('opening', box(q[0], yy, q[1], q[2], yy + hh, q[3])); }
  bag.add('roof_tile', frustum([x0 - 0.4, z0 - 0.4, x1 + 0.4, z1 + 0.4], y + h, y + h + 3, along ? 0 : (x1 - x0) / 2, along ? 0 : (x1 - x0) / 2, along ? (z1 - z0) / 2 : 0, along ? (z1 - z0) / 2 : 0));
}
/** column_statue: a tall column with a figure on top { c, h, y }. */
function columnStatue(el, { bag, col }) { const [x, z] = el.c, h = el.h ?? 14, y = el.y ?? 0; bag.add(I, box(x - 1.6, y - 0.3, z - 1.6, x + 1.6, y + 1.5, z + 1.6)); bag.add('granite_grey', lathe([[0.75, 0], [0.65, h]], 14, null, x, y + 1.5, z)); bag.add('bronze', lathe([[0.6, 0], [0.4, 1.8], [0.001, 2.6]], 8, null, x, y + 1.5 + h, z)); col.circle(x, z, 1.6, y, y + h); }
registerStyle('venetian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, basilica, bell_tower: bellTower, doges_palace: dogesPalace, procuratie, column_statue: columnStatue },
  objects: {},
});
