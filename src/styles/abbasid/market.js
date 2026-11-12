// The markets of Karkh (docs/settlements/abbasid-baghdad.md §7): a suq row is a street between two rows of brick shop bays under a canopy
// of reed matting, each trade with its own street and its own goods; the muhtasib's gates close it at night. A bay is 3.2 m wide and
// 3.4 deep, a flat roof, a counter, a shutter folded up as an awning; goods by trade. Built in a local frame (the street along x).

import { box, fromTriangles, lathe } from '../../core/geom.js';
import { local, wallRun, rng, merlons, orientedBox, barrel, archBand, spandrel, polyGeo, archCurve } from './kit.js';
import { bookcase, desk } from './library.js';

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const BOOK = ['hide_brown', 'cloth_maroon', 'hide_tan', 'cloth_green', 'hide_black', 'cloth_indigo'];
const BOLT = ['cloth_indigo', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_blue', 'cloth_black'];
const HEAP = ['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_green', 'plaster', 'cloth_maroon', 'cloth_ochre'];
export const TRADES = ['paper', 'spice', 'cloth', 'copper', 'money', 'pottery', 'fruit', 'grain'];

/** A heap (a cone) of spice, grain or fruit; a bolt of cloth; a pot. */
const heap = (bag, mat, x, y, z, r, h) => bag.add(mat, lathe([[r, 0], [r * 0.7, h * 0.4], [r * 0.35, h * 0.8], [0.001, h]], 10, null, x, y, z));
const bolt = (bag, mat, x, y, z, len, r = 0.09) => bag.add(mat, lathe([[r, 0], [r, len]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(x - len / 2, y + r, z));
const vase = (bag, mat, x, y, z, r, h) => bag.add(mat, lathe([[0.001, 0], [r * 0.7, 0.01], [r, h * 0.35], [r * 0.85, h * 0.7], [r * 0.5, h * 0.9], [r * 0.6, h], [0.001, h * 0.97]], 10, null, x, y, z));


/** The dressing of a bay's front at eye level: a painted board over the lintel, an oil lamp on a bracket, a threshold stone, wares on the pavement, a hanging bundle. */
function frontDress(bag, col, xa, xb, zf, s, rand, y, trade, k) {
  const cx = (xa + xb) / 2, Z = (v) => zf + s * v, zlo = (a, b) => [Math.min(Z(a), Z(b)), Math.max(Z(a), Z(b))];
  // the board: a painted sign over the lintel with a border and a few black strokes standing for the writing
  let [a, b] = zlo(-0.02, 0.04);
  bag.add('cedar', box(xa + 0.35, y + 3.66, a, xb - 0.35, y + 4.12, b)); [a, b] = zlo(0.04, 0.06);
  bag.add(rand() < 0.5 ? 'plaster_white' : 'cloth_ochre', box(xa + 0.42, y + 3.72, a, xb - 0.42, y + 4.06, b));
  const n = 3 + Math.floor(rand() * 3), sw = (xb - xa - 1.1) / (n * 2);
  for (let i = 0; i < n; i++) bag.add('lacquer_black', box(xa + 0.55 + i * sw * 2, y + 3.8 + rand() * 0.06, a, xa + 0.55 + i * sw * 2 + sw, y + 3.9 + rand() * 0.1, b + 0.005));
  // an oil lamp on an iron bracket by the pier
  if (k % 2 === 0) { const x = xa - 0.02; [a, b] = zlo(-0.05, -0.55); bag.add('iron', box(x - 0.015, y + 2.25, a, x + 0.015, y + 2.28, b)); const lz = Z(-0.5); bag.add('lamp_glass', lathe([[0.001, 0], [0.07, 0.03], [0.08, 0.15], [0.001, 0.22]], 8, null, x, y + 2.03, lz)); bag.add('iron', box(x - 0.01, y + 2.25, lz - 0.01, x + 0.01, y + 2.3, lz + 0.01)); }
  // a threshold of limestone and wares on the pavement before the counter, by trade
  [a, b] = zlo(-0.1, -0.5); bag.add('limestone', box(xa + 0.1, y, a, xb - 0.1, y + 0.1, b)); col.rect([xa + 0.1, a, xb - 0.1, b], y, y + 0.1);
  const px = xa + 0.5 + rand() * (xb - xa - 1.0), pz = Z(-1.0);
  if (trade === 'pottery' || trade === 'grain') { for (let i = 0; i < 2; i++) bag.add('terracotta', lathe([[0.001, 0], [0.16, 0.02], [0.28, 0.3], [0.3, 0.55], [0.2, 0.75], [0.22, 0.8], [0.001, 0.8]], 10, null, px + i * 0.6 - 0.3, y, pz - s * 0.2 * i)); }
  else if (trade === 'fruit' || trade === 'spice') { bag.add('wicker', lathe([[0.3, 0], [0.38, 0.3], [0.001, 0.3]], 10, null, px, y, pz)); heap(bag, ['cloth_red', 'cloth_ochre', 'cloth_green'][Math.floor(rand() * 3)], px, y + 0.28, pz, 0.32, 0.2); }
  else if (trade === 'cloth' || trade === 'paper') { bag.add('reed_mat', box(px - 0.7, y, pz - 0.5, px + 0.7, y + 0.012, pz + 0.5)); for (let i = 0; i < 3; i++) bolt(bag, BOLT[Math.floor(rand() * BOLT.length)], px, y + i * 0.17, pz - 0.2 + i * 0.1, 0.9, 0.08); }
  else { bag.add('bronze', lathe([[0.001, 0], [0.3, 0.01], [0.42, 0.3], [0.38, 0.5], [0.45, 0.52]], 12, null, px, y, pz)); }
  // a bundle hung from the lintel (a string of onions, dates, sandals)
  if (rand() < 0.5) { const hx = xa + 0.4 + rand() * (xb - xa - 0.8); bag.add('iron', box(hx - 0.006, y + 2.1, Z(-0.04) - 0.006, hx + 0.006, y + 2.9, Z(-0.04) + 0.006)); for (let i = 0; i < 4; i++) bag.add(['cloth_ochre', 'cloth_brown', 'cloth_red', 'hide_tan'][i], lathe([[0.001, 0], [0.07, 0.07], [0.001, 0.15]], 6, null, hx + (i % 2) * 0.02, y + 2.12 + i * 0.16, Z(-0.04))); }
}

/** The goods of one bay: the bay's counter along its front; xa..xb across, zf the front's z, `s` the side (+1: the bay lies at larger z, its front toward −z). */
function goods(bag, col, trade, xa, xb, zf, s, rand, y) {
  const w = xb - xa, cx = (xa + xb) / 2, Z = (v) => zf + s * v, sd = 3.4;
  // the counter: a board on two trestles of brick, 0.9 high, set back 0.5 from the front
  bag.add('cedar', box(xa + 0.25, y + 0.84, Math.min(Z(0.35), Z(0.85)), xb - 0.25, y + 0.9, Math.max(Z(0.35), Z(0.85)))); bag.add('brick_buff', box(xa + 0.3, y, Math.min(Z(0.4), Z(0.8)), xa + 0.7, y + 0.84, Math.max(Z(0.4), Z(0.8)))); bag.add('brick_buff', box(xb - 0.7, y, Math.min(Z(0.4), Z(0.8)), xb - 0.3, y + 0.84, Math.max(Z(0.4), Z(0.8))));
  col.rect([xa + 0.25, Math.min(Z(0.35), Z(0.85)), xb - 0.25, Math.max(Z(0.35), Z(0.85))], y, y + 0.9);
  const rug = () => bag.add(rand() < 0.5 ? 'cloth_maroon' : 'cloth_indigo', box(xa + 0.5, y + 0.01, Math.min(Z(1.2), Z(2.6)), xb - 0.5, y + 0.03, Math.max(Z(1.2), Z(2.6))));
  const back = (mat, hgt, th) => bag.add(mat, box(xa + 0.3, y + hgt, Math.min(Z(sd - 0.45), Z(sd - 0.45 - th)), xb - 0.3, y + hgt + 0.05, Math.max(Z(sd - 0.45), Z(sd - 0.45 - th))));
  const sh = (n) => { for (let k = 0; k < n; k++) back('timber', 0.5 + k * 0.6, 0.35); };
  const top = y + 0.9;
  if (trade === 'paper') {
    sh(3);
    const nB = Math.max(2, Math.min(6, Math.floor((w - 0.8) / 0.42)));
    for (let k = 0; k < 3; k++) for (let i = 0; i < nB; i++) { const bx = xa + 0.4 + i * (w - 0.8 - 0.38) / Math.max(1, nB - 1), h = 0.05 + rand() * 0.03; for (let j = 0; j < 2 + Math.floor(rand() * 3); j++) bag.add(BOOK[Math.floor(rand() * BOOK.length)], box(bx, y + 0.55 + k * 0.6 + j * 0.06, Math.min(Z(sd - 0.5), Z(sd - 0.8)), bx + 0.38, y + 0.6 + k * 0.6 + j * 0.06 - 0.002, Math.max(Z(sd - 0.5), Z(sd - 0.8)))); void h; }
    for (let k = 0; k < 6; k++) bag.add('plaster_white', box(cx - 0.55, top + k * 0.032, Math.min(Z(0.5), Z(0.78)), cx - 0.05, top + k * 0.032 + 0.028, Math.max(Z(0.5), Z(0.78))));
    for (let k = 0; k < 4; k++) bolt(bag, 'plaster', cx + 0.2, top + k * 0.01, Z(0.45 + k * 0.1), 0.5, 0.045);
    bag.add('pottery_dark', lathe([[0.001, 0], [0.05, 0], [0.05, 0.12], [0.001, 0.12]], 8, null, xb - 0.5, top, Z(0.6)));
    rug();
  } else if (trade === 'spice') {
    for (let k = 0; k < 6; k++) { const m = HEAP[k % HEAP.length]; bag.add('wicker', lathe([[0.17, 0], [0.19, 0.06], [0.001, 0.0]], 10, null, xa + 0.5 + k * (w - 1) / 5, top, Z(0.6))); heap(bag, m, xa + 0.5 + k * (w - 1) / 5, top + 0.04, Z(0.6), 0.15, 0.2 + rand() * 0.08); }
    for (let k = 0; k < 4; k++) heap(bag, HEAP[(k + 2) % HEAP.length], xa + 0.6 + k * 0.6, y + 0.0, Z(2.4), 0.3, 0.45);
    for (let k = 0; k < 3; k++) vase(bag, 'pottery_dark', xa + 0.5 + k * 0.7, y, Z(sd - 0.9), 0.24, 0.7);
    bag.add('sacking', box(xb - 1.0, y, Math.min(Z(2.0), Z(2.8)), xb - 0.4, y + 0.55, Math.max(Z(2.0), Z(2.8))));
    rug();
  } else if (trade === 'cloth') {
    // a rail across the bay's front above the counter: bolts hung; folded stacks on the counter; rolls on a shelf
    bag.add('timber', box(xa + 0.2, y + 2.6, Math.min(Z(0.2), Z(0.26)), xb - 0.2, y + 2.65, Math.max(Z(0.2), Z(0.26))));
    for (let k = 0; k < 4; k++) { const mat = BOLT[Math.floor(rand() * BOLT.length)]; bag.add(mat, box(xa + 0.3 + k * (w - 0.6) / 4, y + 1.1, Math.min(Z(0.22), Z(0.28)), xa + 0.3 + k * (w - 0.6) / 4 + (w - 0.6) / 4 - 0.12, y + 2.6, Math.max(Z(0.22), Z(0.28)))); }
    for (let k = 0; k < 5; k++) bag.add(BOLT[Math.floor(rand() * BOLT.length)], box(cx - 0.6 + (k % 2) * 0.1, top + k * 0.07, Math.min(Z(0.45), Z(0.8)), cx + 0.5, top + k * 0.07 + 0.06, Math.max(Z(0.45), Z(0.8))));
    sh(3); for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) bolt(bag, BOLT[Math.floor(rand() * BOLT.length)], xa + 0.7 + i * (w - 1.2) / 4, y + 0.5 + k * 0.6, Z(sd - 0.7), 0.5);
    rug();
  } else if (trade === 'copper') {
    bag.add('timber', box(xa + 0.2, y + 2.5, Math.min(Z(0.5), Z(0.56)), xb - 0.2, y + 2.55, Math.max(Z(0.5), Z(0.56))));
    for (let k = 0; k < 5; k++) { const px = xa + 0.4 + k * (w - 0.8) / 4, r = 0.14 + rand() * 0.06; bag.add('iron', box(px - 0.01, y + 2.2, Z(0.53) - 0.01, px + 0.01, y + 2.5, Z(0.53) + 0.01)); bag.add('bronze', lathe([[0.001, 0], [r * 0.6, 0.01], [r, r * 0.9], [r * 0.95, r * 1.2], [r * 1.05, r * 1.25]], 10, null, px, y + 2.2 - r * 1.2, Z(0.53))); }
    for (let k = 0; k < 4; k++) bag.add('bronze', lathe([[0.26, 0], [0.26, 0.015], [0.001, 0.015]], 14, null, cx - 0.4 + k * 0.01, top + k * 0.03, Z(0.6)));
    for (let k = 0; k < 3; k++) { const r = 0.3 + 0.05 * k; bag.add('bronze', lathe([[0.001, 0], [r * 0.7, 0.01], [r, r * 0.8], [r * 0.9, r * 1.3], [r, r * 1.35]], 12, null, xa + 0.6 + k * 0.8, y, Z(2.2))); }
    bag.add('iron', box(xb - 0.9, y, Math.min(Z(1.5), Z(2.0)), xb - 0.5, y + 0.4, Math.max(Z(1.5), Z(2.0)))); bag.add('iron', box(xb - 0.95, y + 0.4, Math.min(Z(1.45), Z(2.05)), xb - 0.45, y + 0.46, Math.max(Z(1.45), Z(2.05))));
  } else if (trade === 'money') {
    // the sarraf on a low platform behind a small table of scales, coin trays, a banded chest
    bag.add('cedar', box(xa + 0.4, y, Math.min(Z(1.0), Z(sd - 0.5)), xb - 0.4, y + 0.28, Math.max(Z(1.0), Z(sd - 0.5)))); bag.add('cloth_maroon', box(xa + 0.5, y + 0.28, Math.min(Z(1.1), Z(sd - 0.6)), xb - 0.5, y + 0.3, Math.max(Z(1.1), Z(sd - 0.6))));
    bag.add('cedar', box(cx - 0.6, y + 0.3, Math.min(Z(1.3), Z(1.9)), cx + 0.6, y + 0.62, Math.max(Z(1.3), Z(1.9))));
    for (let k = 0; k < 4; k++) bag.add('gilt_bronze', box(cx - 0.5 + k * 0.28, y + 0.62, Math.min(Z(1.4), Z(1.6)), cx - 0.3 + k * 0.28, y + 0.65, Math.max(Z(1.4), Z(1.6))));
    bag.add('bronze', box(cx + 0.2, y + 0.62, Z(1.7) - 0.01, cx + 0.5, y + 0.64, Z(1.7) + 0.01)); bag.add('bronze', box(cx + 0.34, y + 0.62, Z(1.7) - 0.01, cx + 0.36, y + 0.95, Z(1.7) + 0.01));
    bag.add('cedar', box(xb - 1.1, y + 0.3, Math.min(Z(sd - 1.5), Z(sd - 0.7)), xb - 0.5, y + 0.8, Math.max(Z(sd - 1.5), Z(sd - 0.7)))); bag.add('iron', box(xb - 1.12, y + 0.5, Math.min(Z(sd - 1.5), Z(sd - 0.7)), xb - 0.48, y + 0.56, Math.max(Z(sd - 1.5), Z(sd - 0.7))));
    for (let k = 0; k < 3; k++) bag.add('gilt_bronze', lathe([[0.1, 0], [0.1, 0.02], [0.001, 0.02]], 10, null, cx - 0.4 + k * 0.4, top, Z(0.6)));
  } else if (trade === 'pottery') {
    sh(3);
    const mats = ['terracotta', 'pottery_dark', 'glaze_blue', 'glaze_green', 'terracotta', 'glaze_white', 'lamp_glass'];
    for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) vase(bag, mats[Math.floor(rand() * mats.length)], xa + 0.5 + i * (w - 1) / 4, y + 0.54 + k * 0.6, Z(sd - 0.65), 0.1 + rand() * 0.04, 0.22 + rand() * 0.1);
    for (let k = 0; k < 4; k++) vase(bag, mats[Math.floor(rand() * mats.length)], xa + 0.5 + k * 0.65, top, Z(0.6), 0.12, 0.3); for (let k = 0; k < 3; k++) vase(bag, 'terracotta', xa + 0.55 + k * 0.8, y, Z(2.2), 0.3, 0.8);
  } else if (trade === 'fruit') {
    const F = ['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_maroon'];
    for (let k = 0; k < 4; k++) { const px = xa + 0.45 + k * (w - 0.9) / 3; bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.001, 0.2]], 10, null, px, top, Z(0.62))); bag.add(F[Math.floor(rand() * F.length)], lathe(Array.from({ length: 5 }, (_, i) => { const t = i / 4 * Math.PI / 2; return [Math.cos(t) * 0.24, Math.sin(t) * 0.14]; }), 10, null, px, top + 0.18, Z(0.62))); }
    for (let k = 0; k < 3; k++) { bag.add('wicker', lathe([[0.3, 0], [0.38, 0.35], [0.001, 0.35]], 10, null, xa + 0.6 + k * 0.85, y, Z(2.2))); bag.add(F[k % F.length], lathe(Array.from({ length: 5 }, (_, i) => { const t = i / 4 * Math.PI / 2; return [Math.cos(t) * 0.34, Math.sin(t) * 0.2]; }), 10, null, xa + 0.6 + k * 0.85, y + 0.33, Z(2.2))); }
    for (let k = 0; k < 4; k++) bag.add('palm_leaf', lathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t) * 0.15), 0.15 - Math.cos(t) * 0.15]; }), 8, null, xa + 0.7 + k * 0.5, y, Z(sd - 0.8)));
  } else {
    for (let k = 0; k < 3; k++) { bag.add('sacking', box(xa + 0.45 + k * 0.85, y, Math.min(Z(1.2), Z(2.0)), xa + 1.05 + k * 0.85, y + 0.6, Math.max(Z(1.2), Z(2.0)))); heap(bag, 'cloth_ochre', xa + 0.75 + k * 0.85, y + 0.58, Z(1.6), 0.26, 0.2); }
    for (let k = 0; k < 4; k++) bag.add('sacking', box(xa + 0.45 + (k % 2) * 0.7, y + Math.floor(k / 2) * 0.35, Math.min(Z(sd - 0.5), Z(sd - 1.3)), xa + 1.05 + (k % 2) * 0.7, y + 0.35 + Math.floor(k / 2) * 0.35, Math.max(Z(sd - 0.5), Z(sd - 1.3))));
    bag.add('wicker', lathe([[0.15, 0], [0.18, 0.2], [0.001, 0.2]], 10, null, cx + 0.8, top, Z(0.6))); heap(bag, 'cloth_ochre', cx + 0.8, top + 0.18, Z(0.6), 0.16, 0.14);
  }
}

/**
 * suq_row: { rect, axis ('x'|'z'), street (m, 6), trades: [..] (cycled by bay), seed, gates ('both'|'none') }
 * The long side of the rect is the street; shops on both sides, bays 3.2 m.
 */
function suqRow(el, ctx) {
  const [cx, cz] = mid(el.rect), axis = el.axis ?? ((el.rect[2] - el.rect[0]) >= (el.rect[3] - el.rect[1]) ? 'x' : 'z'), L = axis === 'x' ? el.rect[2] - el.rect[0] : el.rect[3] - el.rect[1];
  const S = el.street ?? 6, y = el.y ?? 0, rand = rng(el.seed ?? 773), trades = el.trades || TRADES, sd = 3.4;
  local(ctx, [cx, cz], axis === 'x' ? 0 : Math.PI / 2, (c) => {
    const { bag, col } = c, nb = Math.max(1, Math.floor((L - 4) / 3.2)), bw = (L - 4) / nb, x0 = -L / 2 + 2;
    bag.add('brick_paving', box(-L / 2, y - 0.2, -S / 2, L / 2, y + 0.012, S / 2));
    // a gutter down the middle: a line of baked brick set lower
    bag.add('brick_baked', box(-L / 2, y - 0.01, -0.12, L / 2, y + 0.014, 0.12));
    for (const s of [-1, 1]) {
      const zf = s * S / 2, zb = s * (S / 2 + sd);
      // the back wall of the row, the party walls, the roof of each bay; the lintel beam over the fronts, an awning of the trade's cloth
      bag.add('brick_buff', box(-L / 2 + 0.4, y - 0.3, Math.min(zb, zb + s * 0.5), L / 2 - 0.4, y + 3.8, Math.max(zb, zb + s * 0.5))); col.rect([-L / 2 + 0.4, Math.min(zb, zb + s * 0.5), L / 2 - 0.4, Math.max(zb, zb + s * 0.5)], y, y + 3.8);
      for (let k = 0; k <= nb; k++) { const x = x0 + k * bw; bag.add('brick_buff', box(x - 0.22, y - 0.2, Math.min(zf, zb), x + 0.22, y + 3.5, Math.max(zf, zb))); col.rect([x - 0.22, Math.min(zf, zb), x + 0.22, Math.max(zf, zb)], y, y + 3.5); }
      bag.add('cedar', box(x0 - 0.22, y + 3.1, Math.min(zf, zf + s * 0.2), x0 + nb * bw + 0.22, y + 3.5, Math.max(zf, zf + s * 0.2)));
      bag.add('mud_plaster', box(x0 - 0.3, y + 3.5, Math.min(zf - s * 0.1, zb), x0 + nb * bw + 0.3, y + 3.64, Math.max(zf - s * 0.1, zb)));
      bag.add('brick_buff', box(x0 - 0.3, y + 3.64, Math.min(zb, zb - s * 0.3), x0 + nb * bw + 0.3, y + 4.2, Math.max(zb, zb - s * 0.3)));
      for (let k = 0; k < nb; k++) {
        const xa = x0 + k * bw + 0.22, xb = x0 + (k + 1) * bw - 0.22, trade = trades[(k + (s > 0 ? 3 : 0) + Math.floor(rand() * 2)) % trades.length];
        goods(bag, col, el.trade || trade, xa, xb, zf, s, rand, y);
        frontDress(bag, col, xa, xb, zf, s, rand, y, el.trade || trade, k);
        // the shutter folded up as an awning (0.9 m out, sloping), in a coloured cloth; the bay's ceiling beam
        const cl = BOLT[Math.floor(rand() * BOLT.length)];
        bag.add(cl, fromTriangles([xa, y + 2.9, zf, xb, y + 2.9, zf, xb, y + 2.55, zf - s * 0.95, xa, y + 2.9, zf, xb, y + 2.55, zf - s * 0.95, xa, y + 2.55, zf - s * 0.95, xa, y + 2.9, zf, xb, y + 2.55, zf - s * 0.95, xb, y + 2.9, zf, xa, y + 2.9, zf, xa, y + 2.55, zf - s * 0.95, xb, y + 2.55, zf - s * 0.95]));
      }
    }
    // the canopy: reed matting on beams across the street at 4.4 m, strips 2.4 m wide with 1.2 m gaps for the light, supported on posts at the fronts
    const nC = Math.floor(L / 3.6);
    for (let k = 0; k < nC; k++) {
      const x = -L / 2 + 1.8 + k * 3.6;
      bag.add('cedar', box(x - 0.09, y + 4.3, -S / 2 - 0.4, x + 0.09, y + 4.45, S / 2 + 0.4));
      if (k % 3 !== 2) bag.add('reed_mat', box(x - 1.2, y + 4.45, -S / 2 - 0.3, x + 1.2, y + 4.5, S / 2 + 0.3));
    }
    for (const s of [-1, 1]) for (let k = 0; k <= nb; k += 1) { const x = x0 + k * bw; bag.add('cedar', box(x - 0.07, y + 3.64, s * (S / 2 + 0.25) - 0.07, x + 0.07, y + 4.4, s * (S / 2 + 0.25) + 0.07)); }
    // the gates at the street's ends: two brick piers and a lintel, the leaves folded back
    if ((el.gates ?? 'both') !== 'none') for (const e of [-1, 1]) {
      const x = e * (L / 2 - 0.6);
      bag.add('brick_baked', box(x - 0.45, y, -S / 2 - 0.2, x + 0.45, y + 4.0, -S / 2 + 0.5)); bag.add('brick_baked', box(x - 0.45, y, S / 2 - 0.5, x + 0.45, y + 4.0, S / 2 + 0.2));
      bag.add('cedar', box(x - 0.3, y + 3.5, -S / 2 - 0.2, x + 0.3, y + 4.0, S / 2 + 0.2)); col.rect([x - 0.45, -S / 2 - 0.2, x + 0.45, -S / 2 + 0.5], y, y + 4.0); col.rect([x - 0.45, S / 2 - 0.5, x + 0.45, S / 2 + 0.2], y, y + 4.0);
    }
  });
}

/** The positions of the bays' keepers: [{ at: [x, z], face (toward the street, radians for a figure: rot) }] in world coordinates — for the life plan. */
export function suqKeepers(el) {
  const [cx, cz] = mid(el.rect), axis = el.axis ?? ((el.rect[2] - el.rect[0]) >= (el.rect[3] - el.rect[1]) ? 'x' : 'z'), L = axis === 'x' ? el.rect[2] - el.rect[0] : el.rect[3] - el.rect[1];
  const S = el.street ?? 6, nb = Math.max(1, Math.floor((L - 4) / 3.2)), bw = (L - 4) / nb, out = [];
  for (const s of [-1, 1]) for (let k = 0; k < nb; k++) {
    const u = -L / 2 + 2 + (k + 0.5) * bw, v = s * (S / 2 + 1.9);
    // local (u, v) → world: axis x: (cx + u, cz + v); axis z: rotateY(π/2): (u, v) → (v, −u)
    out.push({ at: axis === 'x' ? [cx + u, cz + v] : [cx + v, cz - u], toward: axis === 'x' ? [0, -s] : [-s, 0], k, side: s });
  }
  return out;
}

/**
 * abbasid_shop: { rect, face, seed } — a bookseller's and paper-seller's shop you can enter, 10 × 18 m: a front room under a barrel vault with a
 * counter and a wide arched door, cupboards of books, paper in reams, a writing desk, a back room with a stair of the store; mats, lamps.
 */
function shop(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, face = el.face || 's', y = el.y ?? 0, rand = rng(el.seed ?? 5);
  const w = face === 's' || face === 'n' ? x1 - x0 : z1 - z0, d = face === 's' || face === 'n' ? z1 - z0 : x1 - x0, hw = w / 2, hd = d / 2, T = 0.55, YAWS = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
  local(ctx, [cx, cz], YAWS[face], (c) => {
    const { bag, col, lights } = c, H = 3.6, spring = 3.0, rise = hw - T - 0.3;
    wallRun(c, { a: [-hw, hd - T / 2], b: [hw, hd - T / 2], th: T, y0: y, y1: y + spring, mat: 'brick_buff', ops: [{ at: hw, w: 3.6, h: 3.0, flat: true }] });
    archBand(bag, { O: [-1.8, hd - T / 2], U: [1, 0], N: [0, 1] }, 0, y, 3.6, 3.0, 0.3, T / 2, T / 2 + 0.08);
    wallRun(c, { a: [hw - T / 2, hd], b: [hw - T / 2, -hd], th: T, y0: y, y1: y + spring, mat: 'brick_buff', ops: [{ at: hd - 2.5, w: 0.7, h: 0.8, y0: y + 1.8, flat: true }] });
    wallRun(c, { a: [-hw + T / 2, -hd], b: [-hw + T / 2, hd], th: T, y0: y, y1: y + spring, mat: 'brick_buff' });
    wallRun(c, { a: [hw, -hd + T / 2], b: [-hw, -hd + T / 2], th: T, y0: y, y1: y + spring, mat: 'brick_buff', ops: [{ at: hw, w: 1.2, h: 2.3 }] });
    // the barrel vault over the whole room and the gable ends' fill
    barrel(bag, 'plaster_white', [-hw + T, -hd + T, hw - T, hd - T], y + spring, 'z', 10, rise);
    for (const [zz, sd] of [[hd - T / 2, 1], [-hd + T / 2, -1]]) bag.add('brick_buff', polyGeo({ O: [-hw, zz], U: [1, 0], N: [0, sd] }, [[0, y + spring], [w, y + spring], ...Array.from({ length: 11 }, (_, i) => { const t = i / 10 * Math.PI; return [hw - Math.cos(t) * (hw - T), y + spring + Math.sin(t) * rise]; })], -T / 2, T / 2));
    for (const sd of [-1, 1]) col.rect([sd < 0 ? -hw : hw - T, -hd, sd < 0 ? -hw + T : hw, hd], y, y + 7);
    col.rect([-hw, hd - T, hw, hd], y + 3.0, y + 7); col.rect([-hw, -hd, hw, -hd + T], y + 3.0, y + 7);
    bag.add('mud_plaster', box(-hw, y + spring, -hd, hw, y + spring + 0.05, hd)); void H;
    bag.add('brick_paving', box(-hw + T, y - 0.2, -hd + T, hw - T, y + 0.02, hd - T)); col.floor([-hw + T, -hd + T, hw - T, hd - T], y + 0.02);
    // the cupboards along both side walls; the counter before the door; paper in reams; desks; a rug; the lamp
    for (let k = 0; k < 4; k++) { bookcase(bag, col, rand, -hw + T + 0.35, -hd + 2.0 + k * 2.2, y + 0.02, 1.7, 1); bookcase(bag, col, rand, hw - T - 0.35, -hd + 2.0 + k * 2.2, y + 0.02, 1.7, 1); }
    bag.add('cedar', box(-hw + 1.6, y, hd - 5.2, hw - 3.4, y + 0.9, hd - 4.6)); col.rect([-hw + 1.6, hd - 5.2, hw - 3.4, hd - 4.6], y, y + 0.9);
    for (let k = 0; k < 6; k++) bag.add('plaster_white', box(-hw + 2.0, y + 0.9 + k * 0.032, hd - 5.1, -hw + 2.7, y + 0.93 + k * 0.032, hd - 4.7));
    for (let k = 0; k < 4; k++) bag.add(BOOK[k % BOOK.length], box(-0.4, y + 0.9 + k * 0.058, hd - 5.1, 0.2, y + 0.945 + k * 0.058, hd - 4.7));
    bag.add('bronze', box(1.0, y + 0.9, hd - 5.0, 1.3, y + 0.92, hd - 4.95)); bag.add('bronze', box(1.14, y + 0.9, hd - 5.0, 1.16, y + 1.25, hd - 4.95));
    desk(bag, col, rand, 0, -2.0, y + 0.02, 2.4, 0.9); desk(bag, col, rand, 0, 2.4, y + 0.02, 2.0, 0.8);
    bag.add('cloth_maroon', box(-1.8, y + 0.02, -3.0, 1.8, y + 0.04, 3.6)); bag.add('cloth_indigo', box(-1.5, y + 0.04, -2.7, 1.5, y + 0.05, 3.3));
    bag.add('iron', box(-0.01, y + 3.0, 0 - 0.01, 0.01, y + 3.9, 0.01)); bag.add('lamp_glass', lathe([[0.001, 0], [0.13, 0.05], [0.15, 0.22], [0.001, 0.32]], 10, null, 0, y + 2.6, 0)); lights.push({ at: [0, y + 2.8, 0], color: '#ffc27a', intensity: 5, distance: 10 });
    lights.push({ at: [0, y + 2.6, hd - 2], color: '#fff0d0', intensity: 3, distance: 8 });
    // the sign: a board over the door in a plain hand, hung from a beam
    bag.add('cedar', box(-1.4, y + 3.15, hd + 0.15, 1.4, y + 3.6, hd + 0.19)); bag.add('plaster', box(-1.3, y + 3.2, hd + 0.19, 1.3, y + 3.55, hd + 0.2));
  });
}

export const marketElements = { suq_row: suqRow, abbasid_shop: shop };
void wallRun; void merlons; void orientedBox;
