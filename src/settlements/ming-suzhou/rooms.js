// What stands in the rooms of the climbable houses (upstairs.js), by use (docs/settlements/ming-suzhou.md §6,
// "Upstairs"). groundFit furnishes the floor one comes in on, upperFit the floor above. Everything is boxes and
// lathe pieces gathered by the house's builder; colliders for what one would walk into. The ways through are
// kept clear: on the ground floor the lane at b 1.5–2.1 from the door to the stair's foot; above, the way from the
// stair's top by the stair room's side to the doorway in the partition and along the front to the gallery door.

const BOLT = ['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_brown', 'cloth_black'];

import { NEW_USES, groundExtra, upperExtra } from './rooms2.js';
import { HOUSEHOLD_USES, groundHouse, upperHouse, householdBits } from './rooms3.js';

export function kit(c) {
  const { B, blk, lat, rand } = c;
  const k = {};
  const hash = (a, b) => { let h = Math.imul(Math.floor(a * 100) | 0, 374761393) + Math.imul(Math.floor(b * 100) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  k.hash = hash;
  /** A box standing on the floor yy. */
  k.put = (yy) => (mat, a0, b0, a1, b1, ya, yb) => B(a0, b0, a1, b1, yy + ya, yy + yb, mat);
  k.table = (a0, b0, a1, b1, yy, h, mat = 'lacquer_chestnut', coll = true) => {
    B(a0, b0, a1, b1, yy + h - 0.05, yy + h, mat);
    for (const [a, b] of [[a0 + 0.03, b0 + 0.03], [a1 - 0.09, b0 + 0.03], [a0 + 0.03, b1 - 0.09], [a1 - 0.09, b1 - 0.09]]) B(a, b, a + 0.06, b + 0.06, yy, yy + h - 0.05, mat);
    if (coll) blk(a0, b0, a1, b1, yy, yy + h);
  };
  k.stool = (a, b, yy, h = 0.45, s = 0.15, coll = true) => {
    B(a - s, b - s, a + s, b + s, yy + h - 0.04, yy + h, 'lacquer_chestnut');
    for (const [da, db] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(a + da * (s - 0.03) - 0.025, b + db * (s - 0.03) - 0.025, a + da * (s - 0.03) + 0.025, b + db * (s - 0.03) + 0.025, yy, yy + h - 0.04, 'lacquer_chestnut');
    if (coll) blk(a - s, b - s, a + s, b + s, yy, yy + h);
  };
  k.jar = (mat, a, b, yy, s = 1) => lat(mat, [[0.001, 0], [0.1 * s, 0.01], [0.16 * s, 0.12 * s], [0.17 * s, 0.22 * s], [0.1 * s, 0.32 * s], [0.07 * s, 0.36 * s], [0.001, 0.36 * s]], 9, a, b, yy);
  k.bowl = (mat, a, b, yy, s = 1) => lat(mat, [[0.001, 0], [0.05 * s, 0], [0.13 * s, 0.06 * s], [0.12 * s, 0.07 * s], [0.001, 0.02 * s]], 9, a, b, yy);
  k.lamp = (a, b, yy) => lat('lamp_paper', [[0.07, 0], [0.17, 0.07], [0.19, 0.2], [0.16, 0.34], [0.07, 0.4], [0.001, 0.4]], 12, a, b, yy);
  /** Sacks of grain or salt stacked in a block a0..a1 × b0..b1, n high (each 0.5 × 0.34 × 0.2, laid crosswise by rows). */
  k.sacks = (a0, b0, a1, b1, yy, n, mats = ['cloth_ochre', 'cloth_white', 'cloth_ochre', 'cloth_grey']) => {
    const na = Math.max(1, Math.round((a1 - a0) / 0.5)), nb = Math.max(1, Math.round((b1 - b0) / 0.36)), da = (a1 - a0) / na, db = (b1 - b0) / nb;
    for (let h = 0; h < n; h++) for (let i = 0; i < na; i++) for (let j = 0; j < nb; j++) {
      const m = mats[Math.floor(hash(a0 + i + h * 7, b0 + j) * mats.length)], sh = (h % 2) * da * 0.3 * (i === na - 1 ? 0 : 1);
      B(a0 + i * da + sh + 0.02, b0 + j * db + 0.02, a0 + (i + 1) * da + sh - 0.02, b0 + (j + 1) * db - 0.02, yy + h * 0.21, yy + h * 0.21 + 0.2, m);
    }
    blk(a0, b0, a1, b1, yy, yy + n * 0.21);
  };
  /** A bed: a plank platform with a mat, a quilt, a pillow (canopy: posts, frame and curtains half drawn, as the hall's bed). */
  k.bed = (a0, b0, a1, b1, yy, canopy, quilt = 'cloth_indigo') => {
    const longB = (b1 - b0) >= (a1 - a0);
    B(a0, b0, a1, b1, yy + 0.3, yy + 0.46, 'lacquer_chestnut');
    B(a0 + 0.04, b0 + 0.04, a1 - 0.04, b1 - 0.04, yy + 0.46, yy + 0.5, 'thatch');
    if (longB) { B(a0 + 0.06, b0 + 0.9, a1 - 0.06, b1 - 0.06, yy + 0.5, yy + 0.62, quilt); B(a0 + 0.1, b0 + 0.08, a1 - 0.1, b0 + 0.4, yy + 0.5, yy + 0.62, 'cloth_white'); }
    else { B(a0 + 0.9, b0 + 0.06, a1 - 0.06, b1 - 0.06, yy + 0.5, yy + 0.62, quilt); B(a0 + 0.08, b0 + 0.1, a0 + 0.4, b1 - 0.1, yy + 0.5, yy + 0.62, 'cloth_white'); }
    for (const [a, b] of [[a0 + 0.04, b0 + 0.04], [a1 - 0.12, b0 + 0.04], [a0 + 0.04, b1 - 0.12], [a1 - 0.12, b1 - 0.12]]) B(a, b, a + 0.08, b + 0.08, yy, yy + 0.3, 'lacquer_chestnut');
    if (canopy) {
      for (const [a, b] of [[a0, b0], [a1 - 0.06, b0], [a0, b1 - 0.06], [a1 - 0.06, b1 - 0.06]]) B(a, b, a + 0.06, b + 0.06, yy + 0.5, yy + 2.0, 'lacquer_chestnut');
      B(a0, b0, a1, b1, yy + 1.96, yy + 2.04, 'lacquer_chestnut');
      B(a0, b0, a1, b0 + 0.04, yy + 0.5, yy + 1.2, 'lacquer_chestnut');                                                  // the headboard
      if (longB) { B(a1 - 0.03, b1 - 0.6, a1 - 0.01, b1 - 0.06, yy + 0.5, yy + 1.96, 'cloth_red'); B(a0 + 0.01, b1 - 0.6, a0 + 0.03, b1 - 0.06, yy + 0.5, yy + 1.96, 'cloth_red'); }
      B(a0, b0, a1, b1, yy + 1.9, yy + 1.96, 'cloth_red');                                                               // the valance
    } else B(a0, b0, a1, b0 + 0.05, yy + 0.5, yy + 0.8, 'lacquer_chestnut');
    blk(a0, b0, a1, b1, yy, canopy ? yy + 2.0 : yy + 0.62);
  };
  k.chest = (a0, b0, a1, b1, yy, h = 0.55, mat = 'lacquer_chestnut') => {
    B(a0, b0, a1, b1, yy, yy + h, mat); B(a0 - 0.01, b0 - 0.01, a1 + 0.01, b1 + 0.01, yy + h - 0.04, yy + h, 'lacquer_black');
    const side = (a1 - a0) > (b1 - b0), m = side ? (a0 + a1) / 2 : 0, n = side ? 0 : (b0 + b1) / 2;
    if (side) B(m - 0.05, b1, m + 0.05, b1 + 0.015, yy + h - 0.25, yy + h - 0.1, 'gilt_bronze'); else B(a1, n - 0.05, a1 + 0.015, n + 0.05, yy + h - 0.25, yy + h - 0.1, 'gilt_bronze');
    blk(a0, b0, a1, b1, yy, yy + h);
  };
  /** A cabinet (gui) with two doors and brass fittings, standing against a wall. */
  k.cabinet = (a0, b0, a1, b1, yy, h, faceB = 1) => {
    B(a0, b0, a1, b1, yy, yy + h, 'lacquer_chestnut');
    const fb = faceB > 0 ? b1 : b0, ma = (a0 + a1) / 2;
    for (const s of [-1, 1]) B(ma + s * 0.17 - 0.015, faceB > 0 ? fb : fb - 0.015, ma + s * 0.17 + 0.015, faceB > 0 ? fb + 0.015 : fb, yy + h * 0.45, yy + h * 0.55, 'gilt_bronze');
    B(ma - 0.01, faceB > 0 ? fb : fb - 0.012, ma + 0.01, faceB > 0 ? fb + 0.012 : fb, yy + 0.05, yy + h - 0.05, 'lacquer_black');
    blk(a0, b0, a1, b1, yy, yy + h);
  };
  /** A shelf unit against a wall: posts, boards, goods by row (kind: 'books' | 'bolts' | 'jars' | 'bowls'). */
  k.shelves = (a0, a1, b0, b1, yy, rows, kind, faceB = 1) => {
    for (const a of [a0, (a0 + a1) / 2, a1 - 0.05]) B(a, b0, a + 0.05, b1, yy, yy + rows[rows.length - 1] + 0.3, 'wood_dark');
    for (const hh of rows) {
      B(a0, b0, a1, b1, yy + hh - 0.04, yy + hh, 'wood_dark');
      const step = kind === 'books' ? 0.2 : kind === 'bolts' ? 0.27 : 0.36;
      for (let a = a0 + 0.2; a < a1 - 0.2; a += step) {
        if (hash(a, hh) < 0.1) continue;
        const r = hash(hh, a);
        if (kind === 'bolts') B(a - 0.11, b0 + 0.03, a + 0.11, b1 - 0.03, yy + hh, yy + hh + 0.22 + r * 0.05, BOLT[Math.floor(r * BOLT.length * 0.99)]);
        else if (kind === 'books') { const n = 2 + Math.floor(r * 3); for (let q = 0; q < n; q++) B(a - 0.09, b0 + 0.04, a + 0.09, b1 - 0.04, yy + hh + q * 0.06, yy + hh + q * 0.06 + 0.055, r < 0.5 ? 'cloth_indigo' : 'cloth_white'); }
        else if (kind === 'bowls') { const n = 1 + Math.floor(r * 3); for (let q = 0; q < n; q++) k.bowl(r < 0.6 ? 'lacquer_red' : 'lacquer_black', a, (b0 + b1) / 2, yy + hh + q * 0.07, 1.1); }
        else k.jar(['glaze_blue', 'glaze_white', 'pottery_dark', 'glaze_green'][Math.floor(r * 3.99)], a, (b0 + b1) / 2, yy + hh, 0.9);
      }
    }
    blk(a0, b0, a1, b1, yy, yy + rows[rows.length - 1] + 0.3);
    void faceB;
  };
  /** A stove (zao) of grey brick with a pot, and a chimney on its wall. */
  k.stove = (a0, b0, a1, b1, yy) => {
    B(a0, b0, a1, b1, yy, yy + 0.85, 'brick_grey'); B(a0 - 0.03, b0 - 0.03, a1 + 0.03, b1 + 0.03, yy + 0.85, yy + 0.9, 'granite_grey');
    k.jar('iron', (a0 + a1) / 2 - 0.2, (b0 + b1) / 2, yy + 0.9, 1.5); k.jar('iron', (a0 + a1) / 2 + 0.2, (b0 + b1) / 2, yy + 0.9, 1.2);
    B(a0 + 0.1, b1 - 0.35, a1 - 0.1, b1, yy + 0.9, yy + 2.6, 'brick_grey'); B(a0 + 0.3, b0 + 0.05, a1 - 0.3, b0 + 0.08, yy + 0.2, yy + 0.5, 'iron');
    blk(a0, b0, a1, b1, yy, yy + 0.9);
  };
  /** A hanging pole with cloth, from the beam. */
  k.hanging = (a0, a1, b, yy, top, cloths) => {
    B(a0, b - 0.02, a1, b + 0.02, top, top + 0.04, 'bamboo_culm');
    const n = cloths.length, w = (a1 - a0) / n;
    cloths.forEach((m, i) => B(a0 + i * w + 0.05, b - 0.01, a0 + (i + 1) * w - 0.05, b + 0.01, top - 0.55 - hash(a0, i) * 0.4, top, m));
  };
  return k;
}

export function groundFit(c) {
  const { B, blk, L, y0, lay, ibB, use, mir } = c;
  const k = kit(c), P = k.put(y0), il = 1.45, ir = L - 0.3, ib = ibB, sb0 = ib - 0.45, mid = (il + ir) / 2;
  const lampAt = (a, b) => k.lamp(a, b, y0 + 2.45);
  void mir;
  // on every counter: the abacus and the steelyard
  if (['rice', 'inn', 'cloth', 'medicine', 'books', 'lacquer'].includes(use)) {
    const ca = 0.8;
    B(ca, 0.58, ca + 0.34, 0.72, y0 + 1.0, y0 + 1.04, 'wood_dark'); for (let q = 0; q < 6; q++) B(ca + 0.03 + q * 0.05, 0.6, ca + 0.045 + q * 0.05, 0.7, y0 + 1.04, y0 + 1.08, 'wood_dark');
    B(ca + 0.7, 0.62, ca + 1.25, 0.64, y0 + 1.15, y0 + 1.17, 'iron'); B(ca + 0.8, 0.6, ca + 0.84, 0.66, y0 + 1.0, y0 + 1.15, 'timber');
    k.stool(1.7, 1.12, y0, 0.45, 0.15, false);
  }
  if (use === 'cloth') {
    k.shelves(il, ir, sb0, ib, y0, [0.5, 1.15, 1.8], 'bolts');
    k.table(il + 0.2, 2.55, il + 1.35, 3.2, y0, 0.74, 'timber'); B(il + 0.3, 2.65, il + 0.95, 3.1, y0 + 0.74, y0 + 0.8, 'cloth_indigo'); B(il + 0.55, 2.7, il + 1.2, 3.05, y0 + 0.8, y0 + 0.86, 'cloth_red');
    B(ir - 0.9, 2.8, ir - 0.1, 3.4, y0, y0 + 0.5, 'timber'); for (let q = 0; q < 3; q++) B(ir - 0.85, 2.85, ir - 0.15, 3.35, y0 + 0.5 + q * 0.1, y0 + 0.58 + q * 0.1, BOLT[q * 2]); blk(ir - 0.9, 2.8, ir - 0.1, 3.4, y0, y0 + 0.8);
    lampAt(mid, 2.3);
  } else if (use === 'medicine') {
    const nc = Math.max(5, Math.floor((ir - il - 0.3) / 0.3)), cw = (ir - il - 0.3) / nc;
    B(il + 0.1, sb0, ir - 0.1, ib, y0, y0 + 1.9, 'lacquer_chestnut');
    for (let r = 0; r < 6; r++) for (let q = 0; q < nc; q++) { const a = il + 0.15 + q * cw, hh = 0.1 + r * 0.26; B(a + 0.01, sb0 - 0.04, a + cw - 0.02, sb0, y0 + hh, y0 + hh + 0.23, 'wood_dark'); B(a + cw / 2 - 0.03, sb0 - 0.06, a + cw / 2 + 0.03, sb0 - 0.04, y0 + hh + 0.1, y0 + hh + 0.14, 'gilt_bronze'); }
    B(il + 0.1, sb0, ir - 0.1, ib, y0 + 1.9, y0 + 1.95, 'wood_dark');
    for (let a = il + 0.4; a < ir - 0.3; a += 0.5) k.jar(['glaze_blue', 'glaze_white', 'pottery_dark'][Math.floor(k.hash(a, 1) * 2.99)], a, sb0 + 0.2, y0 + 1.95, 1.1);
    blk(il, sb0 - 0.04, ir, ib, y0, y0 + 2.2);
    for (let q = 0; q < 6; q++) { const a = il + 0.7 + q * (ir - il - 1.4) / 5; B(a - 0.05, 2.7 + (q % 2) * 0.5, a + 0.05, 2.8 + (q % 2) * 0.5, y0 + 1.7, y0 + 2.5, ['cloth_brown', 'thatch', 'cloth_ochre'][q % 3]); }
    B(ir - 1.3, 2.7, ir - 0.2, 3.1, y0, y0 + 0.4, 'timber'); B(ir - 1.2, 2.75, ir - 0.3, 3.05, y0 + 0.4, y0 + 0.5, 'iron'); k.jar('iron', ir - 0.75, 2.9, y0 + 0.5, 1.0); blk(ir - 1.3, 2.7, ir - 0.2, 3.1, y0, y0 + 0.6);    // the herb mill
  } else if (use === 'books') {
    k.shelves(il, ir, sb0, ib, y0, [0.45, 1.0, 1.55, 2.05], 'books');
    k.table(ir - 1.7, 2.55, ir - 0.6, 3.25, y0, 0.78); B(ir - 1.5, 2.7, ir - 1.0, 3.1, y0 + 0.78, y0 + 0.83, 'cloth_white'); B(ir - 1.0, 2.75, ir - 0.75, 2.95, y0 + 0.78, y0 + 0.9, 'cloth_indigo');
    k.stool(ir - 1.15, 3.7, y0, 0.45, 0.17);
    for (let q = 0; q < 7; q++) B(il + 0.15 + q * 0.1, 2.8, il + 0.2 + q * 0.1, 2.85, y0 + 0.3, y0 + 1.4, 'bamboo_culm'); B(il + 0.1, 2.7, il + 0.9, 3.0, y0, y0 + 0.3, 'timber'); blk(il + 0.1, 2.7, il + 0.9, 3.0, y0, y0 + 1.4);
    lampAt(mid, 2.3);
  } else if (use === 'rice') {
    const nb = Math.max(2, Math.floor((ir - il - 0.3) / 1.0)), bw = (ir - il - 0.3) / nb;
    for (let q = 0; q < nb; q++) { const a = il + 0.15 + q * bw, a2 = a + bw - 0.1; B(a, sb0 - 0.1, a2, ib, y0, y0 + 0.95, 'timber'); B(a + 0.06, sb0 - 0.04, a2 - 0.06, ib - 0.06, y0 + 0.88, y0 + 0.97, 'plaster'); B(a, sb0 - 0.12, a2, sb0 - 0.1, y0 + 0.5, y0 + 0.56, 'wood_dark'); }
    B(il + 0.1, ib - 0.12, ir - 0.1, ib - 0.02, y0 + 1.5, y0 + 2.2, 'lacquer_chestnut'); blk(il, sb0 - 0.1, ir, ib, y0, y0 + 0.95);
    k.sacks(ir - 1.0, 2.6, ir - 0.1, 3.3, y0, 3); k.sacks(ir - 1.0, 3.45, ir - 0.1, 3.95, y0, 2, ['cloth_white']);
    B(il + 0.2, 2.7, il + 0.45, 2.95, y0, y0 + 0.3, 'timber'); B(il + 0.6, 2.7, il + 0.85, 2.95, y0, y0 + 0.22, 'timber'); blk(il + 0.2, 2.7, il + 0.85, 2.95, y0, y0 + 0.3);
    B(il + 1.2, 2.65, il + 2.0, 3.05, y0, y0 + 0.5, 'timber'); B(il + 1.25, 2.7, il + 1.95, 3.0, y0 + 0.5, y0 + 0.6, 'plaster'); blk(il + 1.2, 2.65, il + 2.0, 3.05, y0, y0 + 0.6);   // the big grain bushel (dou)
    lampAt(mid, 2.3);
  } else if (use === 'lacquer') {
    k.shelves(il, ir, sb0, ib, y0, [0.5, 1.15, 1.8], 'bowls');
    B(ir - 1.6, 2.7, ir - 0.3, 2.76, y0 + 0.15, y0 + 1.7, 'lacquer_red'); B(ir - 1.6, 2.69, ir - 0.3, 2.77, y0 + 1.65, y0 + 1.7, 'gilt_bronze'); B(ir - 1.6, 2.69, ir - 1.55, 2.77, y0 + 0.15, y0 + 1.7, 'gilt_bronze'); B(ir - 0.35, 2.69, ir - 0.3, 2.77, y0 + 0.15, y0 + 1.7, 'gilt_bronze');
    B(ir - 1.7, 2.6, ir - 1.5, 2.9, y0, y0 + 0.15, 'lacquer_black'); B(ir - 0.4, 2.6, ir - 0.2, 2.9, y0, y0 + 0.15, 'lacquer_black'); blk(ir - 1.7, 2.6, ir - 0.2, 2.9, y0, y0 + 1.7);
    k.table(il + 0.2, 2.6, il + 1.4, 3.2, y0, 0.74, 'timber'); for (let q = 0; q < 4; q++) k.bowl(q % 2 ? 'lacquer_red' : 'lacquer_black', il + 0.4 + q * 0.28, 2.9, y0 + 0.74, 1.2);
  } else if (use === 'inn') {
    // a tea house: tables with stools in the front room, the kettle stove and the shelves of caddies along the back
    for (const [a, b] of [[2.3, 2.7], [4.7, 2.7], [7.1, 2.7]]) {
      k.table(a - 0.45, b - 0.4, a + 0.45, b + 0.4, y0, 0.76, 'lacquer_chestnut');
      k.stool(a - 0.7, b, y0, 0.46, 0.15); k.stool(a + 0.7, b, y0, 0.46, 0.15); k.stool(a, b + 0.62, y0, 0.46, 0.15);
      k.bowl('glaze_white', a - 0.15, b, y0 + 0.76, 1.1); k.bowl('glaze_white', a + 0.15, b - 0.1, y0 + 0.76, 1.1); k.jar('glaze_blue', a, b + 0.15, y0 + 0.76, 0.7);
    }
    k.shelves(il + 3.4, ir - 0.2, sb0 + 0.12, ib, y0, [0.55, 1.2, 1.85], 'jars');
    k.stove(il + 0.1, ib - 0.9, il + 1.2, ib - 0.1, y0 - 0.0);
    k.lamp(4.7, 3.2, y0 + 2.4); k.lamp(7.1, 3.2, y0 + 2.4); k.lamp(2.3, 3.2, y0 + 2.4);
  } else if (use === 'merchant') {
    // the hall: the long table against the back wall with its burner and vase, the scroll over it, the square table and armchairs, a cabinet
    const t0 = ib - 0.45;
    k.table(mid - 1.0, t0, mid + 1.0, ib - 0.02, y0, 0.9, 'lacquer_chestnut');
    B(mid - 1.05, t0, mid - 0.98, ib - 0.02, y0 + 0.9, y0 + 1.02, 'lacquer_chestnut'); B(mid + 0.98, t0, mid + 1.05, ib - 0.02, y0 + 0.9, y0 + 1.02, 'lacquer_chestnut');
    k.jar('glaze_white', mid - 0.5, t0 + 0.22, y0 + 0.9, 1.0); lat0(c, 'bronze', mid + 0.15, t0 + 0.22, y0 + 0.9);
    B(mid - 0.35, ib - 0.03, mid + 0.35, ib - 0.01, y0 + 1.3, y0 + 2.4, 'stucco_cream'); B(mid - 0.4, ib - 0.04, mid + 0.4, ib - 0.01, y0 + 2.38, y0 + 2.44, 'wood_dark'); B(mid - 0.25, ib - 0.035, mid + 0.25, ib - 0.025, y0 + 1.5, y0 + 2.2, 'stucco_rose');
    const tb = t0 - 1.35; k.table(mid - 0.45, tb - 0.45, mid + 0.45, tb + 0.45, y0, 0.78);
    for (const sx of [-1, 1]) { const ca = mid + sx * 0.9; B(ca - 0.28, tb - 0.25, ca + 0.28, tb + 0.25, y0 + 0.45, y0 + 0.5, 'lacquer_chestnut'); for (const [da, db] of [[-0.26, -0.23], [0.22, -0.23], [-0.26, 0.19], [0.22, 0.19]]) B(ca + da, tb + db, ca + da + 0.04, tb + db + 0.04, y0, y0 + 0.45, 'lacquer_chestnut'); B(ca - 0.28, tb + 0.2, ca + 0.28, tb + 0.25, y0 + 0.5, y0 + 1.05, 'lacquer_chestnut'); blk(ca - 0.28, tb - 0.25, ca + 0.28, tb + 0.25, y0, y0 + 1.05); }
    k.cabinet(ir - 0.55, 2.45, ir, 3.35, y0, 1.9, -1);
    lampAt(mid, 3.0);
  } else if (use === 'tenement') {
    // a shared kitchen: the stove, the water jar, a firewood stack, a table with benches, a pole with washing
    k.stove(ir - 1.3, ib - 1.0, ir, ib - 0.05, y0);
    k.jar('pottery_dark', il + 0.3, ib - 0.35, y0, 2.4); k.jar('pottery_dark', il + 0.8, ib - 0.35, y0, 2.0); blk(il + 0.1, ib - 0.6, il + 1.0, ib - 0.1, y0, y0 + 0.8);
    for (let q = 0; q < 8; q++) B(ir - 2.7 + (q % 4) * 0.2, ib - 0.5 + Math.floor(q / 4) * 0.0, ir - 2.55 + (q % 4) * 0.2, ib - 0.05, y0 + Math.floor(q / 4) * 0.14, y0 + Math.floor(q / 4) * 0.14 + 0.13, 'timber');
    blk(ir - 2.7, ib - 0.5, ir - 1.9, ib - 0.05, y0, y0 + 0.3);
    k.table(mid - 0.6, 2.7, mid + 0.6, 3.4, y0, 0.74, 'timber'); k.bowl('pottery_dark', mid - 0.2, 3.0, y0 + 0.74, 1.2); k.bowl('pottery_dark', mid + 0.25, 3.1, y0 + 0.74, 1.2); k.jar('glaze_blue', mid, 2.9, y0 + 0.74, 0.7);
    B(mid - 0.9, 2.75, mid - 0.7, 3.35, y0 + 0.4, y0 + 0.45, 'timber'); B(mid + 0.7, 2.75, mid + 0.9, 3.35, y0 + 0.4, y0 + 0.45, 'timber');
    for (const a of [mid - 0.85, mid - 0.75, mid + 0.75, mid + 0.85]) for (const b of [2.8, 3.3]) B(a - 0.02, b - 0.02, a + 0.02, b + 0.02, y0, y0 + 0.4, 'wood_dark');
    blk(mid - 0.9, 2.75, mid - 0.7, 3.35, y0, y0 + 0.45); blk(mid + 0.7, 2.75, mid + 0.9, 3.35, y0, y0 + 0.45);
    k.hanging(il + 0.3, il + 1.9, 2.4, y0, y0 + 2.55, ['cloth_white', 'cloth_indigo', 'cloth_grey']);
  } else if (use === 'weaver') {
    // a narrow loom (zhi ji) in the back of the room: two posts, a breast beam, the warp stretched from the roll to the cloth beam, the treadle bench
    const a0 = il + 0.12, a1 = ir - 0.05, b0 = 2.6, b1 = 4.3;
    for (const [a, b] of [[a0, b0], [a1 - 0.1, b0], [a0, b1 - 0.1], [a1 - 0.1, b1 - 0.1]]) B(a, b, a + 0.1, b + 0.1, y0, y0 + 1.5, 'lacquer_chestnut');
    for (const a of [a0, a1 - 0.1]) { B(a, b0, a + 0.1, b1, y0 + 1.4, y0 + 1.5, 'lacquer_chestnut'); B(a, b0, a + 0.1, b1, y0 + 0.55, y0 + 0.62, 'lacquer_chestnut'); }
    B(a0, b0, a1, b0 + 0.1, y0 + 1.35, y0 + 1.5, 'lacquer_chestnut'); B(a0, b1 - 0.1, a1, b1, y0 + 0.9, y0 + 1.0, 'lacquer_chestnut');
    for (let a = a0 + 0.12; a < a1 - 0.12; a += 0.04) B(a, b0 + 0.05, a + 0.012, b1 - 0.05, y0 + 1.0 + (b1 - 1.0 - b0) * 0.0, y0 + 1.012, k.hash(a, 3) < 0.3 ? 'cloth_red' : 'cloth_white');
    B(a0 + 0.1, b0 + 0.3, a1 - 0.1, b0 + 0.45, y0 + 1.0, y0 + 1.05, 'cloth_red'); B(a0 + 0.1, b0 + 0.3, a1 - 0.1, b0 + 0.45, y0 + 0.4, y0 + 0.46, 'lacquer_chestnut');
    B(a0 + 0.2, b1 - 0.7, a1 - 0.2, b1 - 0.35, y0, y0 + 0.4, 'timber'); blk(a0, b0, a1, b1, y0, y0 + 1.5);
    k.lamp((a0 + a1) / 2, 3.4, y0 + 2.2);
  }
  if (NEW_USES.includes(use)) groundExtra(c, { ...k, B, blk });
  if (HOUSEHOLD_USES.includes(use)) groundHouse(c, k);
  householdBits(c, k, 0);
  void P; void blk; void lay;
}
function lat0(c, mat, a, b, yy) { c.lat(mat, [[0.001, 0], [0.08, 0.01], [0.1, 0.1], [0.06, 0.16], [0.001, 0.16]], 8, a, b, yy); }

export function upperFit(c) {
  const { B, blk, L, Y1, lay, ibU, ibB, use } = c;
  const k = kit(c), y = Y1, pa = lay.pa, e0 = lay.e0, e1 = lay.e1, du = lay.du;
  const back = ibB;
  const wlamp = (a, b) => k.lamp(a, b, y + 2.1);
  // the stair room: a landing with a little to hold, and a desk under its window
  const desk = (a0, b0, a1, b1, withBooks) => {
    k.table(a0, b0, a1, b1, y, 0.76, 'lacquer_chestnut');
    if (withBooks) { B(a0 + 0.1, b0 + 0.1, a0 + 0.35, b0 + 0.35, y + 0.76, y + 0.9, 'cloth_indigo'); B(a0 + 0.4, b0 + 0.12, a0 + 0.6, b0 + 0.3, y + 0.76, y + 0.84, 'cloth_white'); }
    k.stool((a0 + a1) / 2, b1 + 0.3, y, 0.46, 0.15, false);
  };
  const backJars = (a) => { k.jar('pottery_dark', a, back - 0.3, y, 2.0); blk(a - 0.3, back - 0.6, a + 0.3, back - 0.05, y, y + 0.7); };
  void pa; void wlamp;
  if (use === 'merchant') {
    // E: the bedroom (canopy bed in the back corner, a wardrobe, a chest, a dressing table); W: the study (desk under the window, a bookcase on the wall)
    k.bed(e1 - 1.45, 2.55, e1 - 0.05, back - 0.05, y, true, 'cloth_red');
    k.cabinet(e0 + 0.05, back - 0.6, e0 + 1.35, back - 0.05, y, 2.0, -1);
    k.chest(e0 + 1.5, back - 0.55, e0 + 2.3, back - 0.08, y, 0.55);
    k.table(e0 + 0.1, 2.5, e0 + 0.7, 3.2, y, 0.7); B(e0 + 0.28, 2.6, e0 + 0.62, 3.1, y + 0.7, y + 1.15, 'lacquer_black'); B(e0 + 0.26, 2.58, e0 + 0.28, 3.12, y + 0.7, y + 1.17, 'gilt_bronze');   // the mirror stand on the dressing table
    k.lamp(e1 - 0.75, 2.4, y + 2.0);
    desk(0.35, 1.3, 1.25, 1.9, true);
    B(0.27, 2.0, 0.55, 2.45, y, y + 2.0, 'lacquer_chestnut'); blk(0.27, 2.0, 0.55, 2.45, y, y + 2.0);                            // (a bookcase beside the stairwell's foot)
    for (let h = 0; h < 4; h++) for (let q = 0; q < 3; q++) B(0.55, 2.03 + q * 0.14, 0.62, 2.15 + q * 0.14, y + 0.15 + h * 0.45, y + 0.5 + h * 0.45, q % 2 ? 'cloth_white' : 'cloth_indigo');
  } else if (use === 'rice') {
    // the granary loft: stacks of sacks to the back and the right, the measures, the clerk's bed in the corner, his desk by the window
    k.sacks(e0 + 1.2, back - 1.1, e1 - 0.1, back - 0.05, y, 4, ['cloth_ochre', 'cloth_white', 'cloth_ochre']);
    k.sacks(e1 - 0.9, 2.8, e1 - 0.05, back - 1.2, y, 3);
    B(e0 + 1.3, 2.9, e0 + 1.75, 3.35, y, y + 0.32, 'timber'); B(e0 + 1.35, 2.95, e0 + 1.7, 3.3, y + 0.32, y + 0.36, 'plaster'); blk(e0 + 1.3, 2.9, e0 + 1.75, 3.35, y, y + 0.4);
    k.bed(e0 + 0.1, 2.8, e0 + 1.05, back - 0.05, y, false, 'cloth_grey');
    desk(0.35, 1.3, 1.25, 1.85, false); B(0.5, 1.45, 0.75, 1.7, y + 0.76, y + 0.8, 'cloth_white'); k.bowl('glaze_white', 1.0, 1.6, y + 0.76);
  } else if (use === 'inn') {
    // the tea room over the street: window seats and low tables; behind, guest rooms with a bed and a chest each
    { const a = e0 + 2.5, b = 3.1; k.table(a - 0.45, b - 0.4, a + 0.45, b + 0.4, y, 0.76); k.stool(a - 0.7, b, y, 0.46); k.stool(a + 0.7, b, y, 0.46); k.bowl('glaze_white', a - 0.1, b, y + 0.76, 1.1); k.jar('glaze_blue', a + 0.15, b + 0.1, y + 0.76, 0.7); }
    for (const a of [e0 + 0.5, e0 + 2.4, e0 + 4.2]) { B(a - 0.4, 1.3, a + 0.4, 1.75, y + 0.45, y + 0.5, 'lacquer_chestnut'); B(a - 0.4, 1.3, a - 0.35, 1.75, y, y + 0.45, 'lacquer_chestnut'); B(a + 0.35, 1.3, a + 0.4, 1.75, y, y + 0.45, 'lacquer_chestnut'); }
    // the guest rooms at the east end behind a board partition with a door
    const pb = e1 - 3.2;
    B(pb - 0.05, 2.6, pb + 0.05, 3.5, y, y + 2.45, 'timber'); B(pb - 0.05, 4.05, pb + 0.05, back, y, y + 2.45, 'timber'); B(pb - 0.05, 3.5, pb + 0.05, 4.05, y + 2.0, y + 2.45, 'timber');
    blk(pb - 0.05, 2.6, pb + 0.05, 3.5, y, y + 2.45); blk(pb - 0.05, 4.05, pb + 0.05, back, y, y + 2.45);
    k.bed(e1 - 1.5, 2.9, e1 - 0.05, back - 0.05, y, true, 'cloth_indigo'); k.chest(pb + 0.15, back - 0.5, pb + 0.95, back - 0.05, y, 0.55);
    k.bed(e0 + 0.15, back - 1.9, e0 + 1.45, back - 0.05, y, false, 'cloth_grey'); k.chest(e0 + 1.6, back - 0.5, e0 + 2.4, back - 0.05, y, 0.55);
    k.lamp(e0 + 2.5, 3.4, y + 2.1); k.lamp(e1 - 0.8, 3.4, y + 2.1);
    k.chest(0.3, 1.3, 1.2, 1.9, y, 0.5);
  } else if (use === 'cloth') {
    // the tailor's room: the cutting table with its cloth and shears, bolts stacked on a rack, the apprentices' mats rolled by the wall
    k.table(e0 + 0.2, 2.9, e0 + 1.8, 3.75, y, 0.78, 'timber'); B(e0 + 0.3, 3.0, e0 + 1.2, 3.6, y + 0.78, y + 0.84, 'cloth_indigo'); B(e0 + 0.7, 3.1, e0 + 1.6, 3.65, y + 0.84, y + 0.9, 'cloth_red');
    B(e0 + 1.35, 3.2, e0 + 1.62, 3.26, y + 0.9, y + 0.92, 'iron');
    k.shelves(e1 - 1.3, e1 - 0.05, back - 0.55, back - 0.05, y, [0.4, 0.95, 1.5], 'bolts'); k.shelves(e0 + 0.1, e0 + 2.2, back - 0.55, back - 0.05, y, [0.4, 0.95, 1.5], 'bolts');
    k.stool(e0 + 1.0, 4.1, y, 0.35, 0.16); k.hanging(e1 - 1.5, e1 - 0.1, 2.9, y, y + 2.4, ['cloth_indigo', 'cloth_red', 'cloth_ochre']);
    k.chest(0.3, 1.3, 1.2, 1.9, y, 0.5); for (let q = 0; q < 3; q++) B(0.3 + q * 0.28, 2.05, 0.52 + q * 0.28, 2.6, y, y + 0.22, ['cloth_indigo', 'thatch', 'cloth_indigo'][q]);
    k.bed(e1 - 0.95, 2.75, e1 - 0.05, 3.9, y, false, 'cloth_grey');
  } else if (use === 'medicine') {
    // the physician's loft: herbs drying on racks of bamboo and hung in bundles, jars, the mortar, a narrow bed for the apprentice
    for (const b of [2.9, 3.6]) { B(e0 + 0.15, b, e1 - 1.0, b + 0.05, y + 1.5, y + 1.55, 'bamboo_culm'); }
    for (const [a, b] of [[e0 + 0.15, 2.9], [e1 - 1.05, 2.9], [e0 + 0.15, 3.6], [e1 - 1.05, 3.6]]) B(a, b, a + 0.05, b + 0.05, y, y + 1.55, 'bamboo_culm');
    for (let a = e0 + 0.3; a < e1 - 1.1; a += 0.3) for (const b of [2.9, 3.6]) B(a, b - 0.02, a + 0.12, b + 0.07, y + 0.95 + k.hash(a, b) * 0.2, y + 1.5, k.hash(b, a) < 0.5 ? 'thatch' : 'cloth_brown');
    blk(e0 + 0.1, 2.85, e1 - 0.95, 3.7, y, y + 1.6);
    k.shelves(e0 + 0.1, e1 - 1.05, back - 0.5, back - 0.05, y, [0.5, 1.1, 1.7], 'jars');
    k.bed(e1 - 0.95, 2.75, e1 - 0.05, back - 0.05, y, false, 'cloth_brown');
    desk(0.4, 1.3, 1.25, 1.85, true); k.jar('bronze', 0.6, 1.55, y + 0.76, 1.2);
    for (let q = 0; q < 6; q++) B(0.3 + q * 0.1, 3.0, 0.36 + q * 0.1, 3.06, y + 0.2, y + 1.0, 'thatch');
  } else if (use === 'books') {
    // the block-cutting room: racks of carved printing blocks, the inking table with brush and baren, sheets hung to dry, a stool for the cutter
    k.shelves(e0 + 0.1, e1 - 0.1, back - 0.5, back - 0.05, y, [0.45, 0.95, 1.45], 'books');
    for (let q = 0; q < 12; q++) B(e0 + 0.15 + q * 0.2, back - 0.48, e0 + 0.3 + q * 0.2, back - 0.1, y + 1.5, y + 1.56, 'timber');
    k.table(e0 + 0.15, 2.8, e0 + 1.65, 3.6, y, 0.8, 'timber'); B(e0 + 0.3, 2.95, e0 + 0.95, 3.4, y + 0.8, y + 0.88, 'wood_dark'); B(e0 + 1.1, 3.0, e0 + 1.35, 3.25, y + 0.8, y + 0.86, 'cloth_black'); B(e0 + 1.3, 3.3, e0 + 1.5, 3.45, y + 0.8, y + 0.85, 'cloth_white');
    k.stool(e0 + 0.9, 4.0, y, 0.38, 0.17);
    k.hanging(e0 + 0.2, e0 + 2.3, 2.2, y, y + 2.3, ['cloth_white', 'cloth_white', 'cloth_white', 'cloth_white']);
    k.hanging(e1 - 1.8, e1 - 0.2, 2.5, y, y + 2.3, ['cloth_white', 'cloth_white', 'cloth_white']);
    desk(0.4, 1.3, 1.25, 1.85, true);
    k.chest(0.3, 2.0, 0.8, 2.55, y, 0.45);
  } else if (use === 'lacquer') {
    // the drying room: lacquered bowls on racks in the damp cupboard (lacquer cures in humid air), the work bench with brushes, jars of red and black lacquer
    B(e0 + 0.1, back - 0.9, e1 - 1.05, back - 0.05, y, y + 2.0, 'lacquer_chestnut'); B(e0 + 0.1, back - 0.93, e1 - 1.05, back - 0.9, y, y + 2.0, 'wood_dark');
    for (let r = 0; r < 4; r++) for (let q = 0; q < Math.floor((e1 - e0 - 1.35) / 0.3); q++) k.bowl(q % 3 ? 'lacquer_red' : 'lacquer_black', e0 + 0.3 + q * 0.3, back - 0.92 - 0.04, y + 0.3 + r * 0.45, 0.9);
    blk(e0 + 0.1, back - 0.93, e1 - 1.05, back - 0.05, y, y + 2.0);
    k.table(e0 + 0.15, 2.8, e0 + 1.75, 3.45, y, 0.8, 'timber'); for (let q = 0; q < 3; q++) k.bowl('lacquer_red', e0 + 0.4 + q * 0.4, 3.1, y + 0.8, 1.3);
    k.jar('lacquer_black', e0 + 1.55, 2.95, y + 0.8, 0.9); k.jar('lacquer_red', e0 + 1.55, 3.3, y + 0.8, 0.9);
    B(e0 + 0.9, 2.9, e0 + 1.2, 2.93, y + 0.8, y + 0.84, 'bamboo_culm'); k.stool(e0 + 0.9, 4.0 - 0.1, y, 0.4, 0.17);
    k.bed(e1 - 0.95, 2.75, e1 - 0.05, back - 0.05, y, false, 'cloth_indigo');
    desk(0.4, 1.3, 1.25, 1.85, false);
  } else if (use === 'tenement') {
    // two families' rooms: a plank bed and a chest each, a prayer shelf with incense, washing on a pole; a screen of boards between
    const pb = e0 + (e1 - e0) / 2;
    B(pb - 0.05, 2.6, pb + 0.05, back, y, y + 2.3, 'timber'); blk(pb - 0.05, 2.6, pb + 0.05, back, y, y + 2.3);
    k.bed(e0 + 0.1, 2.9, e0 + 1.05, back - 0.05, y, false, 'cloth_indigo'); k.chest(e0 + 1.15, back - 0.5, pb - 0.1, back - 0.05, y, 0.5);
    k.bed(pb + 0.15, 2.9, pb + 1.1, back - 0.05, y, false, 'cloth_brown'); k.chest(pb + 1.2, back - 0.5, e1 - 0.05, back - 0.05, y, 0.5);
    B(e0 + 1.2, back - 0.05, e0 + 1.8, back - 0.0, y + 1.3, y + 1.35, 'lacquer_chestnut'); B(e0 + 1.4, back - 0.1, e0 + 1.6, back - 0.05, y + 1.35, y + 1.4, 'bronze');
    k.hanging(e0 + 0.1, pb - 0.2, 2.3, y, y + 2.3, ['cloth_white', 'cloth_grey', 'cloth_indigo']); k.hanging(pb + 0.2, e1 - 0.1, 2.3, y, y + 2.3, ['cloth_ochre', 'cloth_white']);
    k.table(0.35, 1.3, 1.2, 1.85, y, 0.5, 'timber'); k.bowl('pottery_dark', 0.6, 1.55, y + 0.5, 1.2);
  } else if (use === 'weaver') {
    // one room: the weaver's bed along the side wall, a spinning wheel and a rack of silk skeins by the window
    k.bed(L - 1.2, 2.8, L - 0.3, back - 0.05, y, false, 'cloth_red');
    // spinning wheel: a big wheel, a stand, a spindle
    const wa = 0.7, wb = 1.55;
    B(wa - 0.2, wb - 0.04, wa + 0.2, wb + 0.04, y, y + 0.06, 'timber'); for (const s of [-1, 1]) B(wa + s * 0.15 - 0.02, wb - 0.02, wa + s * 0.15 + 0.02, wb + 0.02, y + 0.06, y + 0.75, 'timber');
    for (let q = 0; q < 12; q++) { const th = q / 12 * Math.PI * 2, rr = 0.34; B(wa + Math.cos(th) * rr - 0.02, wb - 0.015, wa + Math.cos(th) * rr + 0.02, wb + 0.015, y + 0.75 + Math.sin(th) * rr - 0.02, y + 0.75 + Math.sin(th) * rr + 0.02, 'lacquer_chestnut'); }
    blk(wa - 0.35, wb - 0.1, wa + 0.35, wb + 0.1, y, y + 1.1);
    B(0.28, 3.0, 0.4, 3.9, y + 1.2, y + 1.26, 'bamboo_culm'); for (let q = 0; q < 5; q++) B(0.3, 3.05 + q * 0.17, 0.38, 3.15 + q * 0.17, y + 0.6 + k.hash(q, 1) * 0.1, y + 1.2, ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][q]);
    blk(0.25, 2.95, 0.45, 3.95, y, y + 1.3);
  }
  if (NEW_USES.includes(use)) upperExtra(c, k);
  if (HOUSEHOLD_USES.includes(use)) upperHouse(c, k);
  householdBits(c, k, 1);
  void backJars; void ibU;
}
