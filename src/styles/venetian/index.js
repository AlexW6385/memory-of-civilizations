// Venetian architecture about 1500 (docs/settlements/venice.md §4): San Marco — a Greek cross under
// five domes on drums with tall lead-covered outer shells and lanterns, the west front of arches;
// the brick campanile with its belfry and green spire; the Doge's Palace — two storeys of white
// arcades carrying a wall of pink and white diamond-patterned stone; the long arcaded Procuratie;
// the two columns of the Piazzetta; canals, houses and bridges.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const M = 'marble', B = 'brick', L = 'lead', I = 'limestone';
/** basilica: { c, s (arm length), w (arm width), h, y } — the Greek cross with its five domes, the west front. */
function basilica(el, { bag, col }) {
  const [cx, cz] = el.c, S = el.s ?? 38, Wd = el.w ?? 22, H = el.h ?? 22, y = el.y ?? 0;
  for (const r of [[cx - S, cz - Wd / 2, cx + S, cz + Wd / 2], [cx - Wd / 2, cz - S * 0.8, cx + Wd / 2, cz + S * 0.8]]) { bag.add(B, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); col.floor(r, y + H); }
  // the narthex and the west front of five great arches with their gables
  const f = [cx - S - 10, cz - S * 0.85, cx - S, cz + S * 0.85];
  bag.add(M, box(f[0], y - 0.5, f[1], f[2], y + H * 0.7, f[3])); col.rect(f, y, y + H * 0.7);
  for (let k = 0; k < 5; k++) {
    const z = f[1] + (k + 0.5) * (f[3] - f[1]) / 5, w = (f[3] - f[1]) / 5 * 0.7;
    bag.add('opening', box(f[0] - 0.06, y, z - w / 2, f[0] + 0.02, y + H * 0.45, z + w / 2));
    bag.add('mosaic_gold', box(f[0] - 0.08, y + H * 0.47, z - w / 2, f[0] - 0.02, y + H * 0.66, z + w / 2));
    bag.add(M, frustum([f[0] - 0.4, z - w / 2 - 0.5, f[0] + 1.5, z + w / 2 + 0.5], y + H * 0.7, y + H * 0.88, 0, 0, w / 2 + 0.45, w / 2 + 0.45));
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
