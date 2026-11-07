// Ming Suzhou's own pieces, on top of the Jiangnan vocabulary (src/styles/ming/): the furniture and
// objects of the garden's halls and of a scholar's study, the inscribed boards over the halls and the
// couplets on their columns, the potted landscapes (penjing) on their stands
// (docs/settlements/ming-suzhou.md §11).

import { STYLES, registerStyle } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../../styles/ming/index.js';
import { ball, limb, T, Parts } from '../../styles/qing/carving.js';

const W = 'lacquer_chestnut';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── furniture, built facing −z at the origin (the sitter's front), then turned and placed ──
/** A table w × d, h high: the top, the waisted apron, round legs, stretchers; ends: 'flat' | 'everted' (the qiaotou'an's turned-up ends). */
function table(P, w, d, h, ends = 'flat', m = W) {
  P.add(m, box(-w / 2, h - 0.04, -d / 2, w / 2, h, d / 2));
  if (ends === 'everted') for (const s of [-1, 1]) P.add(m, box(s * w / 2 - (s > 0 ? 0.12 : 0), h, -d / 2, s * w / 2 + (s < 0 ? 0.12 : 0), h + 0.05, d / 2));
  const lx = w / 2 - (ends === 'everted' ? 0.22 : 0.05), lz = d / 2 - 0.05;
  for (const s of [-1, 1]) P.add(m, box(-lx, h - 0.11, s * lz - 0.012, lx, h - 0.04, s * lz + 0.012));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, lathe([[0.022, 0], [0.02, h - 0.04], [0.001, h - 0.04]], 8, null, sx * lx, 0, sz * lz));
  for (const sx of [-1, 1]) P.add(m, box(sx * lx - 0.012, 0.16, -lz, sx * lx + 0.012, 0.19, lz));
}
/** The southern official's hat armchair (nanguanmao yi): the seat, the round legs running up into the back posts, the curved splat, the arms, the yoke. */
function armchair(P, m = W) {
  const sw = 0.29, sd = 0.24, sh = 0.5;
  P.add(m, box(-sw, sh - 0.04, -sd, sw, sh, sd));
  P.add('reed_mat', box(-sw + 0.03, sh, -sd + 0.03, sw - 0.03, sh + 0.006, sd - 0.03));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, lathe([[0.018, 0], [0.017, sh - 0.04], [0.001, sh - 0.04]], 6, null, sx * (sw - 0.03), 0, sz * (sd - 0.03)));
  for (const sx of [-1, 1]) {
    P.add(m, limb([sx * (sw - 0.03), sh, sd - 0.03], [sx * (sw - 0.02), 1.08, sd + 0.02], 0.017, 0.015, 6));          // the back posts
    P.add(m, limb([sx * (sw - 0.03), sh, -sd + 0.03], [sx * (sw - 0.01), sh + 0.24, -sd + 0.02], 0.014, 0.013, 6));     // the arm posts
    P.add(m, limb([sx * (sw - 0.01), sh + 0.24, -sd + 0.02], [sx * (sw - 0.02), sh + 0.26, sd - 0.02], 0.015, 0.015, 6));  // the arms
  }
  P.add(m, limb([-sw + 0.02, 1.08, sd + 0.02], [sw - 0.02, 1.08, sd + 0.02], 0.02, 0.02, 6));                         // the yoke rail
  P.add(m, limb([0, sh, sd - 0.04], [0, 0.78, sd + 0.04], 0.012, 0.012, 4));
  P.add(m, box(-0.1, sh + 0.02, sd - 0.03, 0.1, 1.06, sd + 0.01).translate(0, 0, 0.02));                              // the splat
}
/** A side table (jiwu, a square stand) for tea between two chairs. */
function stand(P, m = W) { table(P, 0.45, 0.45, 0.68, 'flat', m); }

// ── the scholar's objects ──
function books(P, n, seed, w = 0.2, d = 0.28) {
  const r = rng(seed); let y = 0;
  for (let k = 0; k < n; k++) { const h = 0.012 + r() * 0.01, dx = (r() - 0.5) * 0.02; P.add('paint_white', box(-w / 2 + dx, y + 0.002, -d / 2 + 0.003, w / 2 + dx - 0.004, y + h - 0.002, d / 2 - 0.003)); P.add(r() < 0.6 ? 'cloth_indigo' : 'cloth_brown', box(-w / 2 + dx, y, -d / 2, w / 2 + dx, y + 0.002, d / 2)); y += h; }
  // the case (han) of blue cloth folded round the last few
  P.add('cloth_indigo', box(-w / 2 - 0.006, 0, -d / 2 - 0.004, -w / 2, y, d / 2 + 0.004));
  return y;
}
function deskThings(P, y) {
  // the inkstone with its well, the ink stick on it, the brush rest with three brushes, the brush pot of bamboo, the water dropper, the paperweights on a sheet
  P.add('slate', box(-0.1, y, -0.08, 0.1, y + 0.03, 0.08).translate(-0.35, 0, -0.05));
  P.add('lacquer_black', box(-0.06, y + 0.03, -0.065, 0.06, y + 0.036, 0.03).translate(-0.35, 0, -0.05));
  P.add('lacquer_black', box(-0.012, y + 0.036, -0.04, 0.012, y + 0.05, 0.05).translate(-0.31, 0, -0.04));
  P.add(W, box(-0.12, y, -0.015, 0.12, y + 0.05, 0.015).translate(0.05, 0, -0.18));
  for (const dx of [-0.07, 0, 0.07]) P.add('bamboo_culm', limb([0.05 + dx, y + 0.055, -0.18], [0.05 + dx, y + 0.055, -0.0], 0.005, 0.004, 5)), P.add('lacquer_black', limb([0.05 + dx, y + 0.055, -0.0], [0.05 + dx, y + 0.055, 0.04], 0.006, 0.001, 5));
  P.add('bamboo_culm', lathe([[0.055, 0], [0.06, 0.16], [0.052, 0.16], [0.052, 0.02], [0.001, 0.02]], 12, null, 0.4, y, 0.12));
  for (const [dx, dz] of [[0.0, 0.0], [0.02, 0.025], [-0.02, 0.02]]) P.add('lacquer_black', limb([0.4 + dx, y + 0.1, 0.12 + dz], [0.4 + dx * 3, y + 0.32, 0.12 + dz * 3], 0.005, 0.003, 4));
  P.add('glaze_white', lathe([[0.001, 0], [0.04, 0.01], [0.045, 0.03], [0.03, 0.05], [0.01, 0.06], [0.001, 0.065]], 10, null, 0.22, y, 0.14));
  P.add('paint_white', box(-0.2, y, -0.02, 0.2, y + 0.002, 0.25).translate(0.0, 0, -0.02));
  for (const dz of [0.0, 0.2]) P.add('inlay_jade', box(-0.15, y + 0.002, -0.012, 0.15, y + 0.022, 0.012).translate(0, 0, dz));
}
/** A scholar's rock on its carved wooden stand (thin, open, wrinkled, as the garden's Taihu stones). */
function rock(P, h, seed) {
  const r = rng(seed);
  P.add(W, lathe([[0.001, 0], [h * 0.3, 0], [h * 0.32, 0.03], [h * 0.26, 0.06], [0.001, 0.06]], 10).scale(1, 1, 0.6));
  let c = [0, 0.05, 0];
  for (let k = 0; k < 5; k++) { const n = [c[0] + (r() - 0.5) * h * 0.18, c[1] + h * 0.19, c[2] + (r() - 0.5) * h * 0.08]; P.add('taihu', limb(c, n, h * (0.11 + 0.05 * Math.sin(k * 2.1)), h * (0.1 + 0.05 * Math.cos(k * 1.7)), 7)); c = n; }
  P.add('taihu', T(ball(h * 0.13, h * 0.09, h * 0.08, 7, 5), c[0], c[1], c[2]));
}
/** A miniature pine in a shallow basin (penjing): the twisted trunk, its branches ending in cloud-like pads of needles. */
function pine(P, s, seed, basin = 'glaze_blue') {
  const r = rng(seed);
  P.add(basin, lathe([[0.001, 0], [0.26 * s, 0], [0.3 * s, 0.1 * s], [0.27 * s, 0.1 * s], [0.25 * s, 0.03 * s], [0.001, 0.03 * s]], 6).scale(1.5, 1, 1));
  P.add('ground', lathe([[0.27 * s, 0.08 * s], [0.001, 0.095 * s]], 6).scale(1.5, 1, 1));
  const pts = [[0, 0.08 * s, 0]];
  for (let k = 1; k <= 4; k++) pts.push([Math.sin(k * 1.9 + r()) * 0.09 * s, 0.08 * s + k * 0.13 * s, Math.cos(k * 1.3) * 0.04 * s]);
  for (let k = 0; k < 4; k++) P.add('bark_pine', limb(pts[k], pts[k + 1], (0.045 - k * 0.008) * s, (0.037 - k * 0.008) * s, 6));
  for (let k = 1; k <= 4; k++) {
    const a = r() * 6.28, L = (0.18 + r() * 0.12) * s * (k === 4 ? 0.5 : 1), e = [pts[k][0] + Math.cos(a) * L, pts[k][1] + 0.03 * s, pts[k][2] + Math.sin(a) * L * 0.6];
    P.add('bark_pine', limb(pts[k], e, 0.014 * s, 0.008 * s, 5));
    P.add('lotus_leaf', T(ball(0.12 * s, 0.045 * s, 0.09 * s, 8, 4), e[0], e[1] + 0.02 * s, e[2]));
  }
  P.add('taihu', T(ball(0.06 * s, 0.07 * s, 0.05 * s, 6, 4), 0.18 * s, 0.11 * s, 0.05 * s));
}

/** Emit Parts turned by yaw about the origin and moved to (x, y, z). */
const put = (P, bag, x, y, z, yaw = 0) => P.emit(bag, x, y, z, yaw);
const yawOf = (f) => ({ n: Math.PI, s: 0, e: -Math.PI / 2, w: Math.PI / 2 })[f] ?? 0;

/**
 * scholar_study: a study's furniture and things { rect (the hall), y (its floor), door ('e' | 'w' | 'n' |
 * 's', the side the door is on) }: against the wall opposite the door the couch-bed (luohan chuang)
 * with its low table and a qin laid on it; before the window side the painting table with the
 * armchair behind it and on it the inkstone, ink, brushes, brush pot, water dropper, paperweights,
 * the books in their cases; a bookshelf of two open shelves of books and lacquer boxes; the
 * scholar's rock on its stand on a high table; a small vase with a branch of plum; the incense
 * burner on its own stand, away from the flowers (as the Treatise on Superfluous Things asks).
 */
function scholarStudy(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, door = el.door ?? 'e';
  const yawRoom = { e: Math.PI / 2, w: -Math.PI / 2, s: 0, n: Math.PI }[door];
  const L = (door === 'e' || door === 'w') ? z1 - z0 : x1 - x0, D = (door === 'e' || door === 'w') ? x1 - x0 : z1 - z0;
  const c = Math.cos(yawRoom), s = Math.sin(yawRoom);
  // the room's frame: b toward the door, a across it (the furniture's own frame turned by yawRoom)
  const W2 = (a, b) => [cx + c * a + s * b, cz - s * a + c * b];
  const at = (P, a, b, yaw = 0) => { const p = W2(a, b); put(P, bag, p[0], y, p[1], yaw + yawRoom); };
  const block = (a, b, w, d, h) => { const p = W2(a, b), q = W2(a + w, b + d); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  // the couch-bed against the back wall, its three-panelled railings, the low table and the qin on it
  { const P = new Parts(), w = 2.0, d = 0.95, h = 0.45;
    P.add(W, box(-w / 2, h - 0.08, -d / 2, w / 2, h, d / 2)); P.add('reed_mat', box(-w / 2 + 0.04, h, -d / 2 + 0.04, w / 2 - 0.04, h + 0.008, d / 2 - 0.04));
    P.add(W, box(-w / 2, 0.06, -d / 2, w / 2, h - 0.08, -d / 2 + 0.05)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(W, box(sx * w / 2 - 0.05 * (sx > 0 ? 1 : 0), 0, sz * d / 2 - 0.05 * (sz > 0 ? 1 : 0), sx * w / 2 + 0.05 * (sx < 0 ? 1 : 0), 0.08, sz * d / 2 + 0.05 * (sz < 0 ? 1 : 0)));
    P.add(W, box(-w / 2, h, d / 2 - 0.05, w / 2, h + 0.42, d / 2)); for (const sx of [-1, 1]) P.add(W, box(sx * w / 2 - (sx > 0 ? 0.05 : 0), h, -d / 2, sx * w / 2 + (sx < 0 ? 0.05 : 0), h + 0.3, d / 2));
    const K = new Parts(); table(K, 0.7, 0.4, 0.26, 'flat'); K.emit(P, 0, h + 0.008, 0);
    P.add('lacquer_black', box(-0.6, h + 0.27, -0.09, 0.6, h + 0.33, 0.09).translate(0, 0, 0));
    for (let k = 0; k < 7; k++) P.add('paint_white', box(-0.55, h + 0.331, -0.06 + k * 0.02 - 0.001, 0.5, h + 0.333, -0.06 + k * 0.02 + 0.001));
    at(P, 0, -D / 2 + 0.75, Math.PI); block(-1.0, -D / 2 + 0.25, 2.0, 1.0, 0.9); }
  // the painting table across the room, the armchair behind it, the things on it, the books
  { const P = new Parts(), h = 0.82; table(P, 1.8, 0.8, h, 'flat'); deskThings(P, h);
    const Bk = new Parts(); books(Bk, 6, 7); Bk.emit(P, 0.7, h, -0.18);
    at(P, -L / 2 + 1.9, 0.3, -Math.PI / 2); block(-L / 2 + 1.5, -0.6, 0.8, 1.8, 0.85);
    const C = new Parts(); armchair(C); at(C, -L / 2 + 1.0, 0.3, -Math.PI / 2); }
  // two more chairs and a tea stand by the door for a guest
  for (const b of [2.6, 4.0]) { const C = new Parts(); armchair(C); at(C, L / 2 - 0.55, b, Math.PI / 2); }
  { const S = new Parts(); stand(S); at(S, L / 2 - 0.55, 3.3); block(L / 2 - 0.9, 2.2, 0.7, 2.2, 0.9); }
  // the bookshelf (shuge): two open shelves of books in cases and two lacquer boxes, against the far end wall
  { const P = new Parts(), w = 1.1, d = 0.42, h = 1.9;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(W, box(sx * w / 2 - 0.02, 0, sz * d / 2 - 0.02, sx * w / 2 + 0.02, h, sz * d / 2 + 0.02));
    for (const yy of [0.1, 0.7, 1.3, 1.88]) P.add(W, box(-w / 2, yy, -d / 2, w / 2, yy + 0.025, d / 2));
    for (const [yy, x, n] of [[0.125, -0.3, 5], [0.125, 0.05, 4], [0.725, -0.32, 7], [0.725, 0.2, 3], [1.325, -0.25, 4]]) { const Bk = new Parts(); books(Bk, n, Math.round(x * 100 + yy * 10)); Bk.emit(P, x, yy, 0, Math.PI / 2); }
    P.add('lacquer_red', box(0.18, 1.325, -0.12, 0.45, 1.47, 0.12)); P.add('lacquer_black', box(0.1, 0.125, -0.13, 0.45, 0.26, 0.13));
    at(P, L / 2 - 0.45, -D / 2 + 1.6, Math.PI / 2); block(L / 2 - 0.7, -D / 2 + 1.0, 0.5, 1.2, 2); }
  // the scholar's rock on a high table, the vase of plum, the incense burner on its stand
  { const P = new Parts(); table(P, 0.9, 0.45, 0.85); const R = new Parts(); rock(R, 0.55, 11); R.emit(P, -0.15, 0.85, 0);
    P.add('glaze_white', lathe([[0.001, 0], [0.05, 0.005], [0.06, 0.08], [0.035, 0.17], [0.025, 0.22], [0.04, 0.25], [0.001, 0.25]], 12, null, 0.28, 0.85, 0));
    for (const [a, l] of [[0.3, 0.35], [-0.6, 0.28], [1.4, 0.3]]) { const e = [0.28 + Math.sin(a) * l * 0.5, 0.85 + 0.25 + l, Math.cos(a) * l * 0.3]; P.add('bark_dark', limb([0.28, 1.08, 0], e, 0.007, 0.003, 4)); for (let k = 0; k < 3; k++) P.add('paint_white', T(ball(0.018, 0.018, 0.018, 5, 3), 0.28 + (e[0] - 0.28) * (0.5 + k * 0.2), 1.08 + (e[1] - 1.08) * (0.5 + k * 0.2), e[2] * (0.5 + k * 0.2))); }
    at(P, L / 2 - 0.4, 0.6, Math.PI / 2); block(L / 2 - 0.65, 0.1, 0.5, 1.0, 0.9); }
  { const P = new Parts(); table(P, 0.36, 0.36, 0.72);
    P.add('bronze', lathe([[0.001, 0], [0.09, 0.0], [0.11, 0.05], [0.1, 0.11], [0.08, 0.12], [0.085, 0.14], [0.001, 0.14]], 12, null, 0, 0.72, 0));
    for (const a of [0, 2.1, 4.2]) P.add('bronze', limb([Math.cos(a) * 0.07, 0.75, Math.sin(a) * 0.07], [Math.cos(a) * 0.09, 0.71, Math.sin(a) * 0.09], 0.01, 0.008, 4));
    at(P, -L / 2 + 0.5, D / 2 - 1.2); }
}

/**
 * hall_furniture: a garden hall set for guests { rect, y, front (the side it opens to: the view) }:
 * against the back wall the long table with turned-up ends, on it a great rock in a dish and a pair
 * of vases; along each side a row of armchairs facing across, a tea stand between each pair.
 */
function hallFurniture(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, front = el.front ?? 'n', alongX = front === 'n' || front === 's';
  const back = { n: z1, s: z0, e: x0, w: x1 }[front], sgn = front === 'n' || front === 'w' ? -1 : 1;     // sgn: from the back wall toward the front
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, yaw = yawOf(front);
  const P0 = (a, b) => (alongX ? [cx + a, back + sgn * b] : [back + sgn * b, cz + a]);
  { const P = new Parts(); table(P, 2.6, 0.5, 0.9, 'everted'); const R = new Parts(); rock(R, 0.7, 23); R.emit(P, 0, 0.9, 0);
    for (const s of [-1, 1]) P.add('glaze_blue', lathe([[0.001, 0], [0.08, 0.01], [0.12, 0.15], [0.07, 0.36], [0.05, 0.42], [0.07, 0.46], [0.001, 0.46]], 12, null, s * 0.95, 0.9, 0));
    const p = P0(0, 0.55); P.emit(bag, p[0], y, p[1], yaw); col.circle(p[0], p[1], 1.0, y, y + 1); }
  const span = (alongX ? x1 - x0 : z1 - z0) / 2 - 1.2, depth = (alongX ? z1 - z0 : x1 - x0);
  for (const side of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const b = 1.9 + k * 1.6;
      if (b > depth - 1.6) continue;
      for (const [db, isChair] of [[-0.42, true], [0, false], [0.42, true]]) {
        const P = new Parts(); if (isChair) armchair(P); else stand(P);
        const p = P0(side * span, b + db);
        P.emit(bag, p[0], y, p[1], yaw + side * Math.PI / 2 * (alongX ? -sgn : sgn));
      }
      const p = P0(side * span, b); col.circle(p[0], p[1], 0.7, y, y + 1);
    }
  }
}

/**
 * plaque: an inscribed board { at, y (its foot), facing ([dx, dz]), w, h, n (characters), ink }: a frame
 * of dark lacquer round a field of wood, the characters raised on it in malachite green — each a
 * few strokes (the inscriptions themselves are not modelled; ours are generic strokes).
 */
function plaque(el, { bag }) {
  const w = el.w ?? 2.4, h = el.h ?? 0.75, n = el.n ?? 3, vertical = !!el.vertical, r = rng(el.seed ?? 5), P = new Parts();
  P.add('lacquer_black', box(-w / 2, 0, -0.03, w / 2, h, 0.03));
  P.add(el.field ?? 'timber', box(-w / 2 + 0.06, 0.06, 0.03, w / 2 - 0.06, h - 0.06, 0.04));
  const ink = el.ink ?? 'inlay_jade', cell = vertical ? (h - 0.2) / n : (w - 0.3) / n, cs = Math.min(cell, vertical ? w - 0.12 : h - 0.2) * 0.72;
  for (let k = 0; k < n; k++) {
    const ccx = vertical ? 0 : -w / 2 + 0.15 + cell * (k + 0.5), ccy = vertical ? h - 0.1 - cell * (k + 0.5) : h / 2, t = cs * 0.09;
    // a character: split left and right or top and bottom (or whole), each part filled with stacked
    // strokes across it, one or two down strokes through them, a sweep or a dot
    const stroke = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), g = box(-L / 2, -t / 2, 0, L / 2, t / 2, 0.012); g.rotateZ(Math.atan2(y1 - y0, x1 - x0)); P.add(ink, g.translate(ccx + (x0 + x1) / 2, ccy + (y0 + y1) / 2, 0.04)); };
    const half = cs / 2, kind = r();
    const parts = kind < 0.4 ? [[-half, -half, -half * 0.15, half], [half * 0.05, -half, half, half]] : kind < 0.75 ? [[-half, half * 0.05, half, half], [-half, -half, half, -half * 0.05]] : [[-half, -half, half, half]];
    for (const [a0, b0, a1, b1] of parts) {
      const nh = 2 + Math.floor(r() * 3), w = a1 - a0, h2 = b1 - b0;
      for (let j = 0; j < nh; j++) { const yy = b0 + h2 * (j + 0.5) / nh, sh = 0.1 + r() * 0.15; stroke(a0 + w * sh, yy, a1 - w * (0.1 + r() * 0.15), yy + (r() - 0.5) * t * 0.6); }
      const nv = 1 + Math.floor(r() * 2);
      for (let j = 0; j < nv; j++) { const xx = a0 + w * (nv === 1 ? 0.5 : 0.25 + j * 0.5); stroke(xx, b1 - h2 * 0.05, xx, b0 + h2 * (r() < 0.5 ? 0.05 : 0.3)); }
      if (r() < 0.6) stroke(a0 + w * 0.5, b0 + h2 * 0.45, a0 + w * 0.1, b0 + h2 * 0.05);
      if (r() < 0.5) stroke(a0 + w * 0.5, b0 + h2 * 0.45, a1 - w * 0.05, b0 + h2 * 0.08);
    }
  }
  const [fx, fz] = el.facing ?? [0, 1];
  P.emit(bag, el.at[0], el.y, el.at[1], Math.atan2(fx, fz));
}

/** penjing: a potted landscape on its stand { at, y, kind ('pine' | 'rock'), s, seed, stand ('stone' | 'wood') }. */
function penjing(el, { bag, col }) {
  const P = new Parts(), s = el.s ?? 1, sh = el.stand === 'wood' ? 0.75 : 0.55;
  if (el.stand === 'wood') { const Q = new Parts(); table(Q, 0.6 * s, 0.4 * s, sh); Q.emit(P, 0, 0, 0); }
  else { P.add('granite_grey', box(-0.32 * s, 0, -0.22 * s, 0.32 * s, sh - 0.05, 0.22 * s)); P.add('granite_grey', box(-0.36 * s, sh - 0.05, -0.26 * s, 0.36 * s, sh, 0.26 * s)); }
  const Q = new Parts();
  if (el.kind === 'rock') { Q.add('glaze_white', lathe([[0.001, 0], [0.3, 0], [0.32, 0.05], [0.29, 0.05], [0.001, 0.03]], 8).scale(1.4, 1, 0.9)); Q.add('water', lathe([[0.29, 0.042], [0.001, 0.042]], 8).scale(1.4, 1, 0.9)); const R = new Parts(); rock(R, 0.45, el.seed ?? 3); R.emit(Q, 0.05, 0.03, 0); }
  else pine(Q, 1, el.seed ?? 4, el.basin ?? 'glaze_blue');
  Q.emit(P, 0, sh, 0, 0, s);
  P.emit(bag, el.at[0], el.y ?? 0, el.at[1], el.rot ?? 0);
  col.circle(el.at[0], el.at[1], 0.35 * s, el.y ?? 0, (el.y ?? 0) + sh);
}

const base = STYLES.ming;
registerStyle('suzhou-site', { ...base, elements: { ...base.elements, scholar_study: scholarStudy, hall_furniture: hallFurniture, plaque, penjing } });
