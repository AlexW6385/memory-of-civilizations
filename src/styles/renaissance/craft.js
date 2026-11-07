// The crafts of Florence about 1480 (docs/settlements/florence.md §5, "A bottega" and "The dyers and the
// drying sheds").
//
// bottega: a painter's and sculptor's workshop on the street, open to it through two round arches of
//   pietraforte (one with the shop's counter), a living storey over it under a tiled roof. Inside, as
//   Cennini's book and the workshops of the time had it: an altarpiece on the easel, its gold ground
//   laid and the Virgin blocked in; a panel on trestles being gessoed; the grinding table with its
//   porphyry slab and muller and the pigments in heaps; a cassone being painted; the sculptor's
//   corner with a marble block on its banker and a terracotta bust on a stand; the long bench with
//   tools, jars and brushes under shelves; drawings pinned to the wall; a brazier with the glue pot.
// tintoria: the dyers' shed — vats over brick furnaces with their fires, rinsing tubs, cloth on poles.
// tiratoio: a drying shed on the Arno's bank — a tall open timber frame under a tiled roof, cloth hanging
//   from its rails in the colours of the dye.

import { box, lathe, rod, frustum, disc } from '../../core/geom.js';
import { Local, ext, faceFrame, archOutline, voussoirs, wrect } from './face.js';

const PF = 'limestone_yellow', PL = 'lime_plaster', TI = 'timber', W = 'wood_dark', R = 'roof_tile';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** bottega: { rect, y, front ('n' | 's') } — the shop 12 by 10 m; the front on the north (or south) street. */
export function bottega(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, t = 0.6, h1 = 4.4, h2 = 8.8, fl = y + 0.12, S = el.front === 's' ? -1 : 1;
  const zf = S > 0 ? z0 : z1, zb = S > 0 ? z1 : z0;                      // the front and back walls' outer planes
  const ix0 = x0 + t, ix1 = x1 - t, izf = zf + S * t, izb = zb - S * t;     // the inner faces
  const B = (a, yy0, c, b, yy1, d, m) => bag.add(m, box(Math.min(a, b), yy0, Math.min(c, d), Math.max(a, b), yy1, Math.max(c, d)));
  const solid = (a, c, b, d, yy0 = y, yy1 = y + 2.5) => col.rect([Math.min(a, b), Math.min(c, d), Math.max(a, b), Math.max(c, d)], yy0, yy1);
  // the front: two round arches through a wall of pietraforte, voussoirs round them, a string course
  const { M, L } = faceFrame(el.rect, el.front === 's' ? 's' : 'n', y), Lc = new Local();
  const aw = 3.4, ys = 2.3, ucs = [L * 0.28, L * 0.72];
  Lc.add(PF, ext([[0, -0.4], [L, -0.4], [L, h1], [0, h1]], ucs.map((uc) => archOutline(uc, 0, aw, ys)), -t, 0));
  Lc.add(PL, ext([[0.6, 0.12], [L - 0.6, 0.12], [L - 0.6, h1], [0.6, h1]], ucs.map((uc) => archOutline(uc, 0.12, aw, ys)), -t - 0.04, -t));
  for (const uc of ucs) voussoirs(Lc, PF, uc, ys, aw / 2, aw / 2 + 0.55, 0, 0.06, 11, 0.03);
  Lc.box(PF, 0, h1 - 0.1, 0, L, h1 + 0.15, 0.12);
  // the counter across the left arch, on its stone bench (the muricciolo) outside
  Lc.box(W, ucs[0] - aw / 2, 0.12, -0.3, ucs[0] + aw / 2, 0.95, -0.05);
  Lc.box(W, ucs[0] - aw / 2 - 0.05, 0.95, -0.4, ucs[0] + aw / 2 + 0.05, 1.02, 0.25);
  Lc.box('pietra_serena', ucs[0] - aw / 2, 0, 0, ucs[0] + aw / 2, 0.45, 0.45);
  // the shutters of the arches, folded back against the reveals; the shop's sign, a painted board on an iron arm
  for (const uc of ucs) for (const s of [-1, 1]) Lc.box(W, uc + s * (aw / 2 - 0.06), 0.15, -t - 0.02, uc + s * (aw / 2 - 0.12), ys - 0.1, -t - 0.85);
  Lc.add('iron', rod([L / 2, 3.5, 0], [L / 2, 3.5, 1.1], 0.02, 5));
  Lc.box('wood_painted', L / 2 - 0.02, 2.6, 0.55, L / 2 + 0.02, 3.45, 1.05);
  Lc.emit(bag, M);
  col.rect(wrect(M, ucs[0] - aw / 2, 0, ucs[0] + aw / 2, 0.45), y, y + 0.45);
  // the walls: pietraforte outside below, stucco above; the inner faces plastered
  B(x0, y - 0.4, zb, x1, y + h1, zb - S * t, PF); B(x0, y - 0.4, zf, x0 + t, y + h1, zb - S * t, PF); B(x1 - t, y - 0.4, zf, x1, y + h1, zb - S * t, PF);
  B(ix0, fl, izb, ix1, y + h1, izb + S * 0.04 * -1, PL); B(ix0, fl, izf + S * 0.04, ix0 - 0.04 * -1, y + h1, izb, PL); B(ix1 + 0.04 * -1, fl, izf + S * 0.04, ix1, y + h1, izb, PL);
  solid(x0, zb, x1, zb - S * t, y, y + h2); solid(x0, zf, x0 + t, zb, y, y + h2); solid(x1 - t, zf, x1, zb, y, y + h2);
  {
    const piers = [[0, ucs[0] - aw / 2], [ucs[0] + aw / 2, ucs[1] - aw / 2], [ucs[1] + aw / 2, L]];
    for (const [u0, u1] of piers) { const e = M.elements, a = e[12] + e[0] * u0, b = e[12] + e[0] * u1; solid(a, zf, b, zf + S * t, y, y + h2); }
    const e = M.elements, a = e[12] + e[0] * (ucs[0] - aw / 2), b = e[12] + e[0] * (ucs[0] + aw / 2); solid(a, zf + S * 0.2, b, zf + S * 0.4, y, y + 1.0);   // the counter
  }
  // the upper storey (stucco over the stone, windows with stone surrounds and shutters), the eaves and the roof
  B(x0, y + h1, z0, x1, y + h2, z1, 'stucco_siena');
  for (const zz of [zf, zb]) for (let k = 0; k < 3; k++) {
    const xc = x0 + (k + 0.5) * (x1 - x0) / 3, s = zz === zf ? -S : S;
    B(xc - 0.75, y + 5.3, zz, xc + 0.75, y + 7.6, zz + s * 0.05, PF);
    B(xc - 0.55, y + 5.45, zz + s * 0.05, xc + 0.55, y + 7.45, zz + s * 0.07, 'opening');
    for (const sg of [-1, 1]) B(xc + sg * 0.6, y + 5.45, zz + s * 0.05, xc + sg * 1.15, y + 7.45, zz + s * 0.11, 'shutter_green');
  }
  B(x0 - 0.9, y + h2, z0 - 0.9, x1 + 0.9, y + h2 + 0.15, z1 + 0.9, W);
  bag.add(R, frustum([x0 - 1, z0 - 1, x1 + 1, z1 + 1], y + h2 + 0.15, y + h2 + 2.6, 4.2, 4.2, (z1 - z0) / 2 + 1, (z1 - z0) / 2 + 1));
  for (let k = 0; k < 9; k++) B(x0 - 0.9 + k * (x1 - x0 + 1.8) / 8 - 0.07, y + h2 - 0.25, z0 - 0.9, x0 - 0.9 + k * (x1 - x0 + 1.8) / 8 + 0.07, y + h2, z1 + 0.9, W);   // the eaves' rafters
  // inside: the floor of cotto, the ceiling's beams and boards
  B(ix0, y - 0.3, izf, ix1, fl, izb, 'cotto_floor'); col.floor([Math.min(ix0, ix1), Math.min(izf, izb), Math.max(ix0, ix1), Math.max(izf, izb)], fl);
  B(x0, fl - 0.12, zf, x1, fl, izf, 'pietra_serena'); col.floor([x0, Math.min(zf, izf), x1, Math.max(zf, izf)], fl);   // the threshold
  B(ix0, y + h1 - 0.06, izf, ix1, y + h1, izb, 'planks_grey');
  for (let k = 0; k < 6; k++) { const xx = ix0 + 0.6 + k * (ix1 - ix0 - 1.2) / 5; B(xx - 0.12, y + h1 - 0.34, izf, xx + 0.12, y + h1 - 0.06, izb, TI); }
  // ---- the furniture: positions as fractions across (u, from the west) and deep (v, from the front) ----
  const P = (u, v) => [ix0 + (ix1 - ix0) * u, izf + (izb - izf) * v];
  const BX = (u0, v0, u1, v1, yy0, yy1, m) => { const a = P(u0, v0), b = P(u1, v1); B(a[0], yy0, a[1], b[0], yy1, b[1], m); };
  const SOLID = (u0, v0, u1, v1, yy1 = fl + 1.2) => { const a = P(u0, v0), b = P(u1, v1); solid(a[0], a[1], b[0], b[1], fl, yy1); };
  const D = izb - izf, sd = Math.sign(D);
  // the long bench along the back wall, its tools, the shelves over it with jars and brush pots
  BX(0.04, 0.9, 0.96, 1.0, fl + 0.82, fl + 0.9, TI); SOLID(0.04, 0.88, 0.96, 1.0);
  for (const u of [0.06, 0.35, 0.65, 0.94]) BX(u - 0.006, 0.91, u + 0.006, 0.99, fl, fl + 0.82, TI);
  for (const yy of [fl + 1.7, fl + 2.3]) BX(0.08, 0.95, 0.92, 1.0, yy, yy + 0.04, TI);
  const rand = rng(1480);
  for (let k = 0; k < 18; k++) {
    const [px, pz] = P(0.1 + k * 0.045, 0.975), yy = k % 2 ? fl + 1.74 : fl + 2.34;
    bag.add(['terracotta', 'glaze_white', 'glaze_green', 'terracotta'][k % 4], lathe([[0.05, 0], [0.08, 0.06], [0.07, 0.16], [0.04, 0.2], [0.045, 0.23], [0.001, 0.23]].map(([r, v]) => [r * (0.8 + rand() * 0.4), v * (0.8 + rand() * 0.5)]), 8, null, px, yy, pz));
  }
  for (let k = 0; k < 7; k++) { const [px, pz] = P(0.12 + k * 0.12, 0.95); bag.add(['iron', TI, 'bronze'][k % 3], box(px - 0.12, fl + 0.9, pz - 0.02 * sd, px + 0.12, fl + 0.93, pz + 0.04 * sd)); }   // chisels, a plane, a saw's blade laid on the bench
  for (let k = 0; k < 3; k++) { const [px, pz] = P(0.7 + k * 0.06, 0.94); bag.add('terracotta', lathe([[0.05, 0], [0.06, 0.14], [0.001, 0.14]], 8, null, px, fl + 0.9, pz)); for (let b = 0; b < 4; b++) bag.add(TI, rod([px + (b - 1.5) * 0.015, fl + 1.0, pz], [px + (b - 1.5) * 0.03, fl + 1.3, pz + 0.02], 0.006, 4)); }
  // drawings pinned to the west wall
  for (let k = 0; k < 4; k++) { const [, pz] = P(0, 0.3 + k * 0.12); B(ix0 + 0.01, fl + 1.6 + (k % 2) * 0.35, pz - 0.2, ix0 + 0.02, fl + 2.0 + (k % 2) * 0.35, pz + 0.2, 'linen'); }
  // the easel with the altarpiece: the panel, its gesso, the gold ground of the arched top, the Virgin blocked in
  const [ex, ez] = P(0.24, 0.42);
  for (const dx of [-0.75, 0.75]) bag.add(TI, rod([ex + dx, fl, ez + 0.35 * sd], [ex + dx * 0.9, fl + 3.0, ez - 0.05 * sd], 0.035, 5));
  bag.add(TI, rod([ex, fl, ez - 0.6 * sd], [ex, fl + 2.9, ez - 0.05 * sd], 0.035, 5));
  B(ex - 0.85, fl + 0.6, ez + 0.2 * sd, ex + 0.85, fl + 0.68, ez + 0.36 * sd, TI);
  const pf = ez + 0.18 * sd;                                                 // the panel's painted face looks toward the front (−v)
  B(ex - 0.8, fl + 0.68, pf, ex + 0.8, fl + 2.7, pf + 0.06 * sd, TI);
  const frontFace = pf - 0.005 * sd, F = (u0, yy0, u1, yy1, m, d = 0.005) => B(ex + u0, fl + yy0, frontFace - (d - 0.002) * sd, ex + u1, fl + yy1, frontFace - d * sd, m);
  F(-0.76, 0.72, 0.76, 2.66, 'plaster_white', 0.004);
  F(-0.72, 1.55, 0.72, 2.6, 'gold', 0.008);
  F(-0.36, 0.78, 0.36, 1.55, 'paint_blue', 0.012); F(-0.3, 1.55, 0.3, 2.0, 'paint_blue', 0.012); F(-0.12, 0.85, 0.12, 1.95, 'paint_robe', 0.016);
  F(-0.2, 2.0, 0.2, 2.44, 'gold', 0.014); F(-0.1, 2.08, 0.1, 2.32, 'skin_light', 0.018);
  SOLID(0.16, 0.36, 0.32, 0.5, fl + 2.8);
  // a panel lying on trestles, half gessoed; the trestles
  const [tx, tz] = P(0.24, 0.72);
  for (const dx of [-0.7, 0.7]) { B(tx + dx - 0.05, fl, tz - 0.45, tx + dx + 0.05, fl + 0.75, tz + 0.45, TI); }
  B(tx - 0.95, fl + 0.75, tz - 0.6, tx + 0.95, fl + 0.82, tz + 0.6, TI); B(tx - 0.93, fl + 0.82, tz - 0.58, tx + 0.1, fl + 0.835, tz + 0.58, 'plaster_white');
  SOLID(0.14, 0.64, 0.34, 0.8, fl + 0.9);
  // the grinding table: the porphyry slab and its muller, the pigments in heaps, the bowl of egg
  const [gx, gz] = P(0.52, 0.52);
  B(gx - 0.6, fl + 0.82, gz - 0.4, gx + 0.6, fl + 0.88, gz + 0.4, TI);
  for (const [dx, dz] of [[-0.52, -0.32], [0.52, -0.32], [-0.52, 0.32], [0.52, 0.32]]) B(gx + dx - 0.04, fl, gz + dz - 0.04, gx + dx + 0.04, fl + 0.82, gz + dz + 0.04, TI);
  B(gx - 0.32, fl + 0.88, gz - 0.25, gx + 0.18, fl + 0.94, gz + 0.25, 'porphyry');
  bag.add('porphyry', lathe([[0.07, 0], [0.065, 0.06], [0.03, 0.09], [0.03, 0.17], [0.001, 0.18]], 10, null, gx - 0.05, fl + 0.94, gz));
  [['paint_blue', 0.3, -0.25], ['paint_robe', 0.38, -0.08], ['paint_ochre', 0.3, 0.1], ['fresco_green', 0.42, 0.24], ['paint_white', 0.24, 0.28]].forEach(([m, dx, dz]) => {
    bag.add('terracotta', lathe([[0.001, 0], [0.07, 0], [0.08, 0.025]], 10, null, gx + dx - 0.2, fl + 0.88, gz + dz));
    bag.add(m, lathe([[0.06, 0], [0.001, 0.045]], 8, null, gx + dx - 0.2, fl + 0.89, gz + dz));
  });
  bag.add('glaze_white', lathe([[0.001, 0], [0.05, 0], [0.08, 0.06], [0.085, 0.07]], 10, null, gx + 0.45, fl + 0.88, gz - 0.3));
  SOLID(0.46, 0.46, 0.58, 0.58, fl + 1.0);
  // a cassone being painted: the chest, its gilt bands, a panel of a painted scene on its front
  const [cx, cz] = P(0.5, 0.82);
  B(cx - 0.9, fl, cz - 0.3, cx + 0.9, fl + 0.65, cz + 0.3, 'wood_painted');
  B(cx - 0.92, fl + 0.6, cz - 0.32, cx + 0.92, fl + 0.68, cz + 0.32, 'gilt_bronze');
  B(cx - 0.6, fl + 0.15, cz - 0.31 * sd, cx + 0.6, fl + 0.5, cz - 0.305 * sd, 'fresco_green');
  SOLID(0.42, 0.76, 0.58, 0.88, fl + 0.7);
  // the sculptor's corner: the marble block roughed out on its banker, the terracotta bust on a turned stand, a mallet
  const [sx, sz] = P(0.8, 0.45);
  B(sx - 0.45, fl, sz - 0.45, sx + 0.45, fl + 0.85, sz + 0.45, TI);
  B(sx - 0.32, fl + 0.85, sz - 0.28, sx + 0.32, fl + 1.55, sz + 0.28, 'marble_smooth');
  bag.add('marble_smooth', lathe([[0.26, 0], [0.24, 0.2], [0.13, 0.3], [0.1, 0.36], [0.12, 0.45], [0.001, 0.55]], 10, null, sx, fl + 1.55, sz));
  bag.add('iron', rod([sx + 0.2, fl + 0.86, sz + 0.3 * sd], [sx + 0.4, fl + 0.86, sz + 0.38 * sd], 0.015, 4));
  bag.add(TI, box(sx - 0.28, fl + 0.85, sz + 0.3 * sd, sx - 0.12, fl + 0.95, sz + 0.42 * sd));
  SOLID(0.75, 0.4, 0.85, 0.5, fl + 2.1);
  const [bx2, bz2] = P(0.88, 0.7);
  bag.add(TI, lathe([[0.22, 0], [0.18, 0.06], [0.06, 0.12], [0.05, 0.95], [0.16, 1.0], [0.16, 1.04]], 10, null, bx2, fl, bz2));
  bag.add('terracotta', lathe([[0.17, 0], [0.2, 0.1], [0.16, 0.22], [0.07, 0.3], [0.06, 0.38], [0.1, 0.44], [0.11, 0.56], [0.08, 0.64], [0.001, 0.67]], 12, null, bx2, fl + 1.04, bz2));
  SOLID(0.85, 0.66, 0.91, 0.74, fl + 1.7);
  // the brazier with the glue pot warming on it
  const [hx, hz] = P(0.92, 0.25);
  bag.add('iron', lathe([[0.04, 0], [0.04, 0.5], [0.3, 0.55], [0.32, 0.7]], 10, null, hx, fl, hz));
  bag.add('flame', lathe([[0.22, 0], [0.12, 0.08], [0.001, 0.14]], 8, null, hx, fl + 0.62, hz));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.16], [0.12, 0.2]], 10, null, hx, fl + 0.72, hz));
  lights.push({ at: [hx, fl + 1.0, hz], color: '#ff9a4a', intensity: 1.6, distance: 5 });
  SOLID(0.88, 0.2, 0.96, 0.3, fl + 0.8);
  // stools for the apprentices
  for (const [u, v] of [[0.6, 0.45], [0.32, 0.6]]) { const [qx, qz] = P(u, v); B(qx - 0.18, fl + 0.45, qz - 0.18, qx + 0.18, fl + 0.5, qz + 0.18, TI); for (const [dx, dz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) B(qx + dx - 0.02, fl, qz + dz - 0.02, qx + dx + 0.02, fl + 0.45, qz + dz + 0.02, TI); }
}

/** tintoria: { rect, y } — the dyers' open shed along x: four vats over their furnaces, rinsing tubs, cloth on poles. */
export function tintoria(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 4.6;
  shedFrame(bag, col, x0, z0, x1, z1, y, h, 3);
  const n = 4, dye = ['glaze_blue', 'glaze_red', 'glaze_blue', 'glaze_yellow'];
  for (let k = 0; k < n; k++) {
    const vx = x0 + (k + 0.5) * (x1 - x0) / n, vz = z0 + (z1 - z0) * 0.38;
    bag.add('brick', lathe([[1.05, 0], [1.05, 1.0], [0.95, 1.05]], 16, null, vx, y, vz));
    bag.add('bronze', lathe([[0.82, 0], [0.98, 0.0], [1.0, 0.18], [0.96, 0.2]], 16, null, vx, y + 1.05, vz));
    bag.add('bronze', lathe([[0.96, 0.2], [0.85, 0.02]], 16, null, vx, y + 1.05, vz));
    bag.add(dye[k], disc(0.88, y + 1.08, 16, vx, vz));
    bag.add('opening', box(vx - 0.3, y + 0.15, vz - 1.07, vx + 0.3, y + 0.6, vz - 1.0));                          // the fire mouth, toward the yard
    bag.add('flame', lathe([[0.2, 0], [0.1, 0.12], [0.001, 0.24]], 8, null, vx, y + 0.15, vz - 0.95));
    lights.push({ at: [vx, y + 0.5, vz - 1.3], color: '#ff8a3c', intensity: 1.2, distance: 4 });
    col.circle(vx, vz, 1.05, y, y + 1.2);
    // the stirring pole leaning in the vat
    bag.add(TI, rod([vx + 0.3, y + 0.9, vz + 0.2], [vx + 1.6, y + 3.2, vz + 0.4], 0.03, 5));
  }
  // the rinsing tubs, and cloth drying over poles on trestles at the back
  for (let k = 0; k < 3; k++) {
    const tx = x0 + (k + 0.7) * (x1 - x0) / 3.5, tz = z1 - 1.0;
    bag.add(TI, lathe([[0.6, 0], [0.66, 0.7], [0.62, 0.72]], 14, null, tx, y, tz)); bag.add(TI, lathe([[0.62, 0.72], [0.57, 0.6]], 14, null, tx, y, tz));
    bag.add('water', disc(0.6, y + 0.6, 14, tx, tz));
    col.circle(tx, tz, 0.66, y, y + 0.8);
  }
  const cl = ['cloth_indigo', 'cloth_red', 'cloth_maroon', 'cloth_ochre'];
  for (let k = 0; k < 4; k++) {
    const px = x0 + 1.5 + k * (x1 - x0 - 3) / 3, pz = z0 + (z1 - z0) * 0.78;
    for (const dz of [-0.7, 0.7]) bag.add(TI, box(px - 0.05, y, pz + dz - 0.05, px + 0.05, y + 2.1, pz + dz + 0.05));
    bag.add(TI, rod([px, y + 2.15, pz - 0.9], [px, y + 2.15, pz + 0.9], 0.04, 6));
    bag.add(cl[k], box(px - 0.02, y + 0.5, pz - 0.75, px + 0.02, y + 2.14, pz + 0.75));
    bag.add(cl[k], box(px + 0.02, y + 0.8, pz - 0.75, px + 0.05, y + 2.14, pz + 0.75));
    col.rect([px - 0.1, pz - 0.8, px + 0.1, pz + 0.8], y, y + 2.2);
  }
}

/** tiratoio: { rect, y } — a drying shed along x, two storeys high and open, cloth hanging from its rails. */
export function tiratoio(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 7.6;
  shedFrame(bag, col, x0, z0, x1, z1, y, h, 4.5);
  for (const zz of [z0 + 0.12, z1 - 0.12]) bag.add(TI, box(x0, y + 3.8, zz - 0.1, x1, y + 4.0, zz + 0.1));    // the mid rails
  const cl = ['cloth_red', 'cloth_indigo', 'cloth_black', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_red', 'cloth_white'], rand = rng(Math.floor(x0 * 7 + z0));
  const rows = [z0 + (z1 - z0) * 0.3, z0 + (z1 - z0) * 0.7];
  for (const rz of rows) {
    bag.add(TI, box(x0 + 0.2, y + h - 0.6, rz - 0.06, x1 - 0.2, y + h - 0.48, rz + 0.06));                     // the rail under the tie beams
    for (let x = x0 + 1.2; x < x1 - 1.2; x += 1.75) {
      const len = 4.2 + rand() * 1.6, w = 1.35, m = cl[Math.floor(rand() * cl.length)], sk = (rand() - 0.5) * 0.06;
      bag.add(m, box(x - w / 2, y + h - 0.6 - len, rz - 0.015 + sk, x + w / 2, y + h - 0.6, rz + 0.015 + sk));
    }
  }
}

/** The open timber frame of a shed: posts on stone bases every ~`bay` m, plates, tie beams, a tiled gable roof along x. */
function shedFrame(bag, col, x0, z0, x1, z1, y, h, bay) {
  const n = Math.max(1, Math.round((x1 - x0) / bay));
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n;
    for (const zz of [z0, z1]) {
      bag.add('pietra_serena', box(x - 0.22, y - 0.1, zz - 0.22, x + 0.22, y + 0.35, zz + 0.22));
      bag.add(TI, box(x - 0.13, y + 0.35, zz - 0.13, x + 0.13, y + h, zz + 0.13));
      col.rect([x - 0.22, zz - 0.22, x + 0.22, zz + 0.22], y, y + h);
      bag.add(TI, rod([x + (i < n ? 0.12 : -0.12), y + h - 1.0, zz], [x + (i < n ? 0.9 : -0.9), y + h - 0.12, zz], 0.06, 4));   // a knee brace
    }
    bag.add(TI, box(x - 0.12, y + h - 0.02, z0 - 0.15, x + 0.12, y + h + 0.26, z1 + 0.15));                   // the tie beam
    bag.add(TI, box(x - 0.08, y + h + 0.26, (z0 + z1) / 2 - 0.08, x + 0.08, y + h + 1.6, (z0 + z1) / 2 + 0.08));  // the king post
  }
  for (const zz of [z0, z1]) bag.add(TI, box(x0 - 0.15, y + h - 0.02, zz - 0.15, x1 + 0.15, y + h + 0.26, zz + 0.15));   // the plates
  const rz = (z1 - z0) / 2 + 0.8;
  bag.add(R, frustum([x0 - 0.8, z0 - 0.8, x1 + 0.8, z1 + 0.8], y + h + 0.26, y + h + 1.75, 0, 0, rz, rz));
}
