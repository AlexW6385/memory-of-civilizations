// The shops of the old Procuratie's arcades, open (docs/settlements/venice.md §5f.1). A shop takes two bays of the arcade: the doorway in
// the first, a counter-window in the second with its shutter let down to a board; behind a front wall of 0.4 m a room 5.2 m deep, the rest of the
// block solid. `shopSlots` is the one layout both parts read; `shopShell` is the part always drawn (walls, floor, ceiling, doorway, window —
// in the Procuratie's own plan, so the far form is the town's own); `shopFit` (element `ven_shopfit`, a plan shown near) is what stands in the
// rooms: shelves, counters, the goods of the trade, the lamp and its night light, the keeper, the sign over the door, in Roman capitals.
// Local frame as faceFrame (venetian/piazza.js): u along the front, y up, d outward (the room is at negative d).

import { Vector3 } from '../../core/three.js';
import { lathe, rod } from '../../core/geom.js';
import { Local, wrect, faceFrame } from '../renaissance/face.js';
import { Halo } from './halo.js';
import { STYLES } from '../../core/build.js';
import { strokesOf, widthOf } from '../../settlements/venice/script.js';

export const P = 4.2, FW = 0.4, RD = 5.2, YA = 5.6, CEIL = 3.4, DOOR = 1.8, WIN = 1.6;
const PL = 'plaster_white', I = 'limestone', W = 'wood_dark', FLOOR = 'wood_dark';
const hash = (a, b = 0) => { const k = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return k - Math.floor(k); };

/** The shops of a front of n bays over length L: shops = [{ i (first bay), trade, seed }] → [{ u0, W, su0, su1, uc (door), uw (window), trade, seed, i }]. */
export function shopSlots(L, n, shops = []) {
  const bay = L / n;
  return shops.map((s) => { const u0 = s.i * bay, w = 2 * bay; return { ...s, u0, W: w, su0: u0 + 0.15, su1: u0 + w - 0.15, uc: u0 + bay / 2, uw: u0 + bay * 1.5, bay }; });
}
/** u-intervals of the block between the shops' rooms. */
function solids(L, slots) {
  const out = []; let a = 0;
  for (const s of [...slots].sort((p, q) => p.su0 - q.su0)) { if (s.su0 > a + 1e-6) out.push([a, s.su0]); a = s.su1; }
  if (a < L - 1e-6) out.push([a, L]);
  return out;
}

/**
 * The always-drawn part, into the Procuratie's builder: replaces the solid core behind the portico. `Sh` a Local, `col` the colliders, `FM`/`y`/`D`/`h` of the front.
 * [inferred: the walls' thickness, the doorway 1.8 m (the walker needs 1.5 m), the counter-window]
 */
export function shopShell(Sh, col, FM, y, L, D, h, slots) {
  const back = -P - FW - RD, wr = (a, b, d0, d1) => wrect(FM, a, d0, b, d1);
  Sh.box(PL, 0, -0.5, -D, L, YA, back); col.rect(wr(0, L, -D, back), y, y + h);
  for (const [a, b] of solids(L, slots)) { Sh.box(PL, a, -0.5, back, b, YA, -P); col.rect(wr(a, b, back, -P), y, y + h); }
  for (const s of slots) {
    const { su0, su1, uc, uw } = s, d0 = -P - FW, d1 = -P, dc0 = uc - DOOR / 2, dc1 = uc + DOOR / 2, dw0 = uw - WIN / 2, dw1 = uw + WIN / 2;
    // the front wall about the doorway and the window
    for (const [a, b] of [[su0, dc0], [dc1, dw0], [dw1, su1]]) { Sh.box(PL, a, -0.5, d0, b, YA, d1); col.rect(wr(a, b, d0, d1), y, y + h); }
    Sh.box(PL, dc0, 2.55, d0, dc1, YA, d1); col.rect(wr(dc0, dc1, d0, d1), y + 2.55, y + h);
    Sh.box(PL, dw0, -0.5, d0, dw1, 0.95, d1); col.rect(wr(dw0, dw1, d0, d1), y, y + 0.95);
    Sh.box(PL, dw0, 2.25, d0, dw1, YA, d1); col.rect(wr(dw0, dw1, d0, d1), y + 2.25, y + h);
    // the room: a boarded floor, the ceiling slab (the underside of the block over it)
    Sh.box(FLOOR, su0, -0.3, back, su1, 0.05, d1); col.floor(wr(su0, su1, back, d1), y + 0.05);
    Sh.box(PL, su0, CEIL, back, su1, YA, d0); col.rect(wr(su0, su1, back, d0), y + CEIL, y + h);
    // stone jambs and lintel of the doorway, the sill of the window
    for (const [a, b] of [[dc0 - 0.12, dc0], [dc1, dc1 + 0.12]]) Sh.box(I, a, 0, d0, b, 2.55, d1 + 0.07);
    Sh.box(I, dc0 - 0.14, 2.55, d0, dc1 + 0.14, 2.75, d1 + 0.07);
    Sh.box(I, dw0 - 0.1, 0.9, d0, dw1 + 0.1, 0.95, d1 + 0.1);
    for (const [a, b] of [[dw0 - 0.1, dw0], [dw1, dw1 + 0.1]]) Sh.box(I, a, 0.95, d0, b, 2.25, d1 + 0.05);
    Sh.box(I, dw0 - 0.12, 2.25, d0, dw1 + 0.12, 2.4, d1 + 0.07);
  }
}

// ── what stands in a room ────────────────────────────────────────────────────────────────────────────────────────
/** The trades [inferred], each its goods: shelf (rows of what), counter, floor. */
export const TRADES = {
  cloth: { word: 'PANNI', shelf: ['bolt'], mats: ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_black'], counter: 'stack', floor: 'bales' },
  silk: { word: 'SETA', shelf: ['bolt'], mats: ['cloth_maroon', 'cloth_blue', 'cloth_red', 'cloth_green', 'cloth_ochre'], counter: 'stack', floor: 'chest', trim: true },
  spice: { word: 'SPEZIE', shelf: ['jar'], mats: ['glaze_white', 'glaze_blue', 'pottery_dark'], counter: 'mortar', floor: 'sacks', herbs: true },
  books: { word: 'LIBRI', shelf: ['book'], mats: ['cloth_red', 'hide_brown', 'cloth_green', 'hide_tan', 'cloth_indigo', 'cloth_black'], counter: 'lectern', floor: 'books' },
  gold: { word: 'ORO', shelf: ['plate'], mats: ['gilt_bronze', 'silver', 'bronze'], counter: 'scales', floor: 'chest', bars: true },
  glass: { word: 'VETRO', shelf: ['flask'], mats: ['glass_topaz', 'glass_outer', 'glaze_lapis'], counter: 'flasks', floor: 'crate' },
  wine: { word: 'VIN', shelf: ['jug'], mats: ['terracotta', 'pottery_dark'], counter: 'cups', floor: 'barrels' },
  bread: { word: 'PAN', shelf: ['loaf'], mats: ['hide_tan', 'wood_ochre'], counter: 'loaves', floor: 'flour' },
  shoes: { word: 'CALZE', shelf: ['shoe'], mats: ['hide_brown', 'hide_black', 'hide_tan'], counter: 'last', floor: 'hides' },
  barber: { word: 'BARBIER', shelf: ['jar'], mats: ['glaze_white', 'terracotta'], counter: 'basin', floor: 'chair' },
  hats: { word: 'BERETE', shelf: ['cap'], mats: ['cloth_red', 'cloth_black', 'cloth_indigo', 'cloth_maroon'], counter: 'stack', floor: 'chest' },
};
export const TRADE_NAMES = Object.keys(TRADES);

/**
 * ven_shopfit { rect, front, y, h, shops: [{ i, trade, seed }], reach } — the furniture, goods, keepers and signs of the shops of one Procuratie range, for the
 * `reach` shops only (a plan covers a stretch of the arcade). Lights and the night's halos too.
 */
export function shopFit(el, ctx) {
  const { bag, col, lights } = ctx, y = el.y ?? 0, { M: FM, L } = faceFrame(el.span, el.front, y), n = Math.max(2, Math.round(L / 3.1)), H = new Halo();
  const slots = shopSlots(L, n, el.shops);
  const Lc = new Local();
  const P3 = (u, yy, d) => new Vector3(u, yy, d).applyMatrix4(FM);
  const nd = (() => { const e = FM.elements; return [e[8], e[10]]; })();                   // the world direction of local +d (out of the front)
  const wr = (a, b, d0, d1) => wrect(FM, a, d0, b, d1);
  for (const s of slots) {
    const { su0, uc, uw, trade, seed } = s, T = TRADES[trade], z0 = -P - FW;
    const R = (ru, rd) => [su0 + ru, z0 - rd];                                              // room coordinates: ru along from the room's left, rd inward from the front wall
    const B = (mat, ru0, ya, rd0, ru1, yb, rd1) => Lc.box(mat, su0 + ru0, ya, z0 - rd1, su0 + ru1, yb, z0 - rd0);
    const lat = (mat, prof, seg, ru, ya, rd) => Lc.add(mat, lathe(prof, seg, null, su0 + ru, ya, z0 - rd));
    const blk = (ru0, ru1, rd0, rd1, ya, yb) => col.rect(wr(su0 + ru0, su0 + ru1, z0 - rd1, z0 - rd0), y + ya, y + yb);
    const h = (k) => hash(seed, k), RW = s.W - 0.3;
    // shelves: the back wall and the left wall, three rows
    const rows = [0.5, 1.1, 1.7];
    for (const ya of rows) { B(W, 0.15, ya, RD - 0.34, RW, ya + 0.04, RD); B(W, 0.15, ya, 1.5, 0.5, ya + 0.04, RD - 0.34); }
    for (const ru of [0.15, RW - 0.04]) B(W, ru, 0.1, RD - 0.34, ru + 0.04, 2.0, RD);
    B(W, 0.15, 0.1, 1.5, 0.19, 2.0, RD - 0.34);
    blk(0.15, RW, RD - 0.34, RD, 0, 2.1); blk(0.15, 0.5, 1.5, RD - 0.34, 0, 2.1);
    // the goods: items along each shelf row by the trade
    const mats = T.mats, kind = T.shelf[0];
    const put = (ru, ya, rd, k) => {
      const m = mats[Math.floor(h(k) * mats.length)], v = h(k + 7);
      if (kind === 'bolt') B(m, ru - 0.14, ya + 0.04, rd - 0.17, ru + 0.14, ya + 0.04 + 0.2 + v * 0.1, rd + 0.17), T.trim && B('gilt_bronze', ru - 0.14, ya + 0.12, rd - 0.18, ru + 0.14, ya + 0.14, rd + 0.18);
      else if (kind === 'jar') lat(m, [[0.001, 0], [0.07, 0], [0.09, 0.09], [0.07, 0.17 + v * 0.05], [0.04, 0.2 + v * 0.05], [0.04, 0.23 + v * 0.05], [0.001, 0.23 + v * 0.05]], 7, ru, ya + 0.04, rd);
      else if (kind === 'book') B(m, ru - 0.03 - v * 0.02, ya + 0.04, rd - 0.1, ru + 0.03 + v * 0.02, ya + 0.04 + 0.2 + v * 0.07, rd + 0.1);
      else if (kind === 'plate') lat(m, [[0.001, 0], [0.11, 0], [0.13, 0.025], [0.001, 0.02]], 8, ru, ya + 0.04, rd);
      else if (kind === 'flask') lat(m, [[0.001, 0], [0.06, 0], [0.09, 0.07], [0.06, 0.15], [0.025, 0.2], [0.03, 0.27 + v * 0.05], [0.001, 0.27 + v * 0.05]], 7, ru, ya + 0.04, rd);
      else if (kind === 'jug') lat(m, [[0.001, 0], [0.08, 0], [0.11, 0.1], [0.08, 0.2], [0.05, 0.24], [0.05, 0.27], [0.001, 0.27]], 7, ru, ya + 0.04, rd);
      else if (kind === 'loaf') lat(m, [[0.001, 0], [0.14, 0.005], [0.16, 0.05], [0.1, 0.1], [0.001, 0.115]], 8, ru, ya + 0.04, rd);
      else if (kind === 'shoe') B(m, ru - 0.14, ya + 0.04, rd - 0.05, ru + 0.14, ya + 0.1 + v * 0.03, rd + 0.05), B(m, ru + 0.05, ya + 0.1, rd - 0.05, ru + 0.14, ya + 0.17, rd + 0.05);
      else if (kind === 'cap') lat(m, [[0.001, 0], [0.12, 0], [0.13, 0.05], [0.09, 0.12], [0.001, 0.14]], 8, ru, ya + 0.04, rd);
    };
    let k = 0;
    const step = kind === 'bolt' ? 0.3 : kind === 'book' ? 0.1 : kind === 'loaf' ? 0.33 : kind === 'shoe' ? 0.32 : 0.24;
    for (const ya of rows) for (let ru = 0.4; ru < RW - 0.2; ru += step) if (h(k++) > 0.12) put(ru, ya, RD - 0.17, k);
    for (const ya of rows) for (let rd = 1.8; rd < RD - 0.5; rd += step) if (h(k++) > 0.2) put(0.32, ya, rd, k);
    // the counter: across the right of the room, its keeper behind it
    const cr0 = 2.9, cr1 = RW - 0.1, cd0 = 2.3, cd1 = 2.9;
    B(W, cr0, 0, cd0, cr1, 0.9, cd1); B('timber', cr0 - 0.04, 0.9, cd0 - 0.04, cr1 + 0.04, 0.95, cd1 + 0.04); blk(cr0, cr1, cd0, cd1, 0, 0.95);
    const cc = (cr0 + cr1) / 2, topy = 0.95, cm = T.counter;
    if (cm === 'stack') for (let q = 0; q < 4; q++) B(mats[(q + seed) % mats.length], cc - 0.5 + q * 0.28, topy, cd0 + 0.12, cc - 0.28 + q * 0.28, topy + 0.1 + (q % 2) * 0.08, cd0 + 0.46);
    if (cm === 'mortar') { lat('bronze', [[0.001, 0], [0.09, 0], [0.12, 0.05], [0.11, 0.12], [0.08, 0.12], [0.001, 0.04]], 8, cc - 0.4, topy, cd0 + 0.3); B('wood_dark', cc + 0.1, topy, cd0 + 0.12, cc + 0.45, topy + 0.04, cd0 + 0.46); lat('bronze', [[0.001, 0], [0.04, 0.02], [0.03, 0.2], [0.001, 0.2]], 5, cc + 0.28, topy + 0.04, cd0 + 0.3); }
    if (cm === 'lectern') { B(W, cc - 0.3, topy, cd0 + 0.12, cc + 0.3, topy + 0.2, cd0 + 0.5); B(PL, cc - 0.25, topy + 0.2, cd0 + 0.18, cc + 0.25, topy + 0.22, cd0 + 0.46); B(W, cc - 0.01, topy + 0.2, cd0 + 0.18, cc + 0.01, topy + 0.22, cd0 + 0.46); for (let q = 0; q < 3; q++) B(mats[q], cc + 0.45, topy + q * 0.07, cd0 + 0.18, cc + 0.85, topy + q * 0.07 + 0.07, cd0 + 0.5); }
    if (cm === 'scales') { B('iron', cc - 0.02, topy, cd0 + 0.28, cc + 0.02, topy + 0.36, cd0 + 0.32); B('bronze', cc - 0.3, topy + 0.34, cd0 + 0.285, cc + 0.3, topy + 0.36, cd0 + 0.315); for (const sg of [-1, 1]) lat('bronze', [[0.001, 0], [0.09, 0.01], [0.001, 0.03]], 8, cc + sg * 0.28, topy + 0.15, cd0 + 0.3); for (let q = 0; q < 6; q++) lat('gold', [[0.001, 0], [0.03, 0], [0.03, 0.008], [0.001, 0.008]], 6, cc + 0.5 + (q % 3) * 0.09, topy, cd0 + 0.18 + Math.floor(q / 3) * 0.1); }
    if (cm === 'flasks') for (let q = 0; q < 5; q++) lat(mats[q % mats.length], [[0.001, 0], [0.06, 0], [0.09, 0.07], [0.06, 0.15], [0.025, 0.2], [0.03, 0.27], [0.001, 0.27]], 7, cc - 0.5 + q * 0.25, topy, cd0 + 0.3);
    if (cm === 'cups') { for (let q = 0; q < 4; q++) lat('pottery_dark', [[0.001, 0], [0.03, 0], [0.045, 0.09], [0.001, 0.09]], 6, cc - 0.3 + q * 0.16, topy, cd0 + 0.18); lat('terracotta', [[0.001, 0], [0.1, 0], [0.14, 0.13], [0.09, 0.27], [0.06, 0.3], [0.001, 0.3]], 7, cc + 0.45, topy, cd0 + 0.3); }
    if (cm === 'loaves') for (let q = 0; q < 6; q++) lat('hide_tan', [[0.001, 0], [0.14, 0.005], [0.16, 0.05], [0.1, 0.1], [0.001, 0.115]], 8, cc - 0.55 + (q % 3) * 0.36, topy + Math.floor(q / 3) * 0.1, cd0 + 0.3);
    if (cm === 'last') { B('wood_dark', cc - 0.1, topy, cd0 + 0.2, cc + 0.2, topy + 0.07, cd0 + 0.36); B('hide_tan', cc - 0.5, topy, cd0 + 0.15, cc - 0.15, topy + 0.04, cd0 + 0.5); B('iron', cc + 0.35, topy, cd0 + 0.2, cc + 0.55, topy + 0.1, cd0 + 0.32); }
    if (cm === 'basin') { lat('bronze', [[0.001, 0], [0.12, 0.03], [0.17, 0.1], [0.15, 0.1], [0.001, 0.05]], 10, cc - 0.3, topy, cd0 + 0.3); B('mirror_tin', cc + 0.1, topy + 0.1, cd0 + 0.45, cc + 0.4, topy + 0.5, cd0 + 0.47); B('cloth_white', cc + 0.45, topy, cd0 + 0.2, cc + 0.75, topy + 0.05, cd0 + 0.45); }
    // the floor: bales, a chest, sacks, books, barrels, hides, a chair, by the trade, at the room's back right and the left of the aisle's end
    const fl = T.floor, fa = 3.4, fb = 4.55;
    if (fl === 'bales') { B('cloth_white', fa, 0, fb, fa + 0.7, 0.45, fb + 0.45); B('cloth_ochre', fa + 0.8, 0, fb, fa + 1.5, 0.45, fb + 0.45); blk(fa, fa + 1.5, fb, fb + 0.45, 0, 0.45); }
    if (fl === 'chest') { B(W, fa, 0, fb, fa + 0.9, 0.5, fb + 0.45); B('iron', fa - 0.01, 0.2, fb - 0.01, fa + 0.91, 0.23, fb + 0.46); blk(fa, fa + 0.9, fb, fb + 0.45, 0, 0.5); }
    if (fl === 'sacks') { for (let q = 0; q < 3; q++) { lat('sacking', [[0.001, 0], [0.2, 0.02], [0.24, 0.2], [0.17, 0.42], [0.08, 0.46], [0.001, 0.46]], 7, fa + 0.3 + q * 0.5, 0, fb + 0.25); lat('cloth_ochre', [[0.001, 0.4], [0.12, 0.43], [0.001, 0.45]], 6, fa + 0.3 + q * 0.5, 0.02, fb + 0.25); } blk(fa, fa + 1.5, fb, fb + 0.5, 0, 0.5); }
    if (fl === 'books') { for (let q = 0; q < 6; q++) B(mats[q % mats.length], fa + 0.05, q * 0.07, fb, fa + 0.6, q * 0.07 + 0.07, fb + 0.4); blk(fa, fa + 0.7, fb, fb + 0.4, 0, 0.45); }
    if (fl === 'crate') { B(W, fa, 0, fb, fa + 0.7, 0.4, fb + 0.5); for (let q = 0; q < 3; q++) lat('glass_outer', [[0.001, 0], [0.06, 0], [0.08, 0.07], [0.001, 0.12]], 6, fa + 0.15 + q * 0.2, 0.4, fb + 0.25); blk(fa, fa + 0.7, fb, fb + 0.5, 0, 0.45); }
    if (fl === 'barrels') { for (let q = 0; q < 2; q++) { lat('wood_dark', [[0.001, 0], [0.26, 0.0], [0.32, 0.3], [0.34, 0.45], [0.32, 0.6], [0.26, 0.9], [0.001, 0.9]], 10, fa + 0.45 + q * 0.8, 0, fb + 0.4); for (const yy of [0.15, 0.7]) lat('iron', [[0.28, yy], [0.3, yy], [0.3, yy + 0.03], [0.28, yy + 0.03]], 10, fa + 0.45 + q * 0.8, 0, fb + 0.4); } blk(fa, fa + 1.6, fb, fb + 0.85, 0, 0.9); }
    if (fl === 'flour') { for (let q = 0; q < 3; q++) lat('sacking', [[0.001, 0], [0.2, 0.02], [0.24, 0.2], [0.17, 0.42], [0.001, 0.46]], 7, fa + 0.3 + q * 0.5, 0, fb + 0.25); blk(fa, fa + 1.5, fb, fb + 0.5, 0, 0.5); }
    if (fl === 'hides') { for (let q = 0; q < 3; q++) B('hide_tan', fa, q * 0.06, fb, fa + 0.8, q * 0.06 + 0.06, fb + 0.55); blk(fa, fa + 0.8, fb, fb + 0.55, 0, 0.2); }
    if (fl === 'chair') { B(W, fa, 0, fb, fa + 0.5, 0.45, fb + 0.5); B(W, fa, 0.45, fb + 0.45, fa + 0.5, 1.1, fb + 0.5); blk(fa, fa + 0.5, fb, fb + 0.5, 0, 0.5); }
    if (T.herbs) for (let q = 0; q < 6; q++) B('cloth_green', 0.7 + q * 0.8, 2.15, 0.9 + (q % 2) * 0.3, 0.74 + q * 0.8, 2.6, 0.94 + (q % 2) * 0.3);
    if (T.bars) for (let q = 0; q < 5; q++) rodAt(bag, 'iron', P3, [uw - 0.6 + q * 0.3, 0.95, -P - FW + 0.03], [uw - 0.6 + q * 0.3, 2.25, -P - FW + 0.03], 0.012);
    // the window's shutter, let down to a board over the sill, on two chains; the goods on it
    Lc.box(W, uw - WIN / 2, 0.93, -P - FW + 0.05, uw + WIN / 2, 0.97, -P + 0.55); col.rect(wr(uw - WIN / 2, uw + WIN / 2, -P - FW, -P + 0.55), y, y + 0.97);
    for (const sg of [-1, 1]) rodAt(bag, 'iron', P3, [uw + sg * (WIN / 2 - 0.04), 0.97, -P + 0.55], [uw + sg * (WIN / 2 - 0.04), 1.4, -P - FW + 0.04], 0.006);
    if (kind === 'bolt') for (let q = 0; q < 3; q++) Lc.box(mats[(q + seed) % mats.length], uw - 0.6 + q * 0.42, 0.97, -P + 0.1, uw - 0.25 + q * 0.42, 1.12, -P + 0.45);
    else Lc.box(mats[0], uw - 0.4, 0.97, -P + 0.1, uw + 0.4, 1.0, -P + 0.45);
    // beams under the ceiling, the oil lamp hung from the middle one
    for (let q = 0; q < 3; q++) B('timber', 0.1, CEIL - 0.18, 0.9 + q * 1.7, RW + 0.05, CEIL, 1.1 + q * 1.7);
    const lu = su0 + 1.5, ld = z0 - 2.6, ly = CEIL - 0.45;
    rodAt(bag, 'iron', P3, [lu, CEIL - 0.18, ld], [lu, ly + 0.12, ld], 0.006);
    Lc.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.05], [0.07, 0.09], [0.001, 0.08]], 8, null, lu, ly, ld));
    Lc.add('flame', lathe([[0.001, 0.08], [0.02, 0.1], [0.001, 0.17]], 6, null, lu, ly, ld));
    const lw = P3(lu, ly + 0.2, ld);
    lights?.push({ at: [lw.x, lw.y, lw.z], color: '#ffb46b', intensity: 1.8, distance: 6 });
    // the night: the glow round the lamp, its pool on the boards, and the light spilling out of the doorway across the portico (halo material, night only)
    const fy = (p) => p.y;
    H.ball(lw.x, lw.y - 0.05, lw.z, 1.0); H.floor(lw.x, y + 0.08, lw.z, 2.2, 1.8, 0, 10);
    const dd = P3(uc, 0, -P + 0.9), dl = P3(uc, 0, -P - 1.0);
    H.floor(dd.x, y + 0.07, dd.z, 1.8, 1.4, 0, 10); H.wall(dl.x, fy(lw) - 0.3, dl.z, [nd[0], nd[1]], 1.2, 1.0);
    // the sign over the doorway: a painted board on the wall of the portico with the trade's word in capitals
    sign(Lc, bag, P3, T.word, uc, 3.35, -P + 0.02, seed);
    // the keeper behind the counter, facing the door; a patron now and then in front of it
    const kp = P3(su0 + cc, 0, z0 - cd1 - 0.45), rot = Math.atan2(-nd[0], -nd[1]), figs = STYLES.life?.elements.figure;
    if (figs) {
      const men = ['cloth_brown', 'cloth_black', 'cloth_indigo', 'cloth_ochre', 'cloth_red'];
      figs({ t: 'figure', at: [kp.x, kp.z], y: y + 0.05, rot, seed: Math.floor(h(3) * 1e9), dress: trade === 'barber' || h(4) < 0.7 ? 'robe' : 'tunic', legs: 'hose', cloth: men[Math.floor(h(5) * 5)], cloth2: men[Math.floor(h(6) * 5)], skin: 'skin_light', hat: h(8) < 0.7 ? 'cap' : 'none', over: 'apron', pose: 'stand' }, ctx);
    }
  }
  Lc.emit(bag, FM);
  H.flush(bag);
}
/** A thin rod between two local points. */
function rodAt(bag, mat, P3, a, b, r) { const p = P3(...a), q = P3(...b); bag.add(mat, rod([p.x, p.y, p.z], [q.x, q.y, q.z], r, 4)); }

/** A sign: a board (dark, with a pale rim) over the door and the word on it in rods, centred on u, at height y, on the wall plane d. */
function sign(Lc, bag, P3, word, u, y, d, seed) {
  const cap = 0.2, gap = 0.2, w = widthOf(word, gap) * cap, bw = w + 0.5, dark = seed % 3 === 0 ? 'cloth_indigo' : seed % 3 === 1 ? 'cloth_black' : 'cloth_green';
  Lc.box('timber', u - bw / 2 - 0.04, y - 0.08, d - 0.04, u + bw / 2 + 0.04, y + cap + 0.08, d + 0.0);
  Lc.box(dark, u - bw / 2, y - 0.04, d, u + bw / 2, y + cap + 0.04, d + 0.025);
  const x0 = u - w / 2;
  for (const s of strokesOf(word, gap)) for (let i = 0; i + 1 < s.length; i++) {
    const a = P3(x0 + s[i][0] * cap, y + s[i][1] * cap, d + 0.03), b = P3(x0 + s[i + 1][0] * cap, y + s[i + 1][1] * cap, d + 0.03);
    bag.add('paint_white', rod([a.x, a.y, a.z], [b.x, b.y, b.z], 0.012, 4));
  }
}
