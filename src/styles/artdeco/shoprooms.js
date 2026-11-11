// Ten shops of Midtown in 1931 one can walk into (docs/settlements/new-york.md §1j): a drug store with its soda fountain, a delicatessen,
// a barber's with three chairs, a cigar store, a hatter's, a bakery, a shoemaker's, a tailor's, a haberdasher's and a lunch
// room — each a ground storey 9 m deep behind its plate-glass front, the upper floors resting on its tin ceiling. The front
// is open at its door; inside, the counter stands across the room 3 m from the back wall (the keeper's side behind it).
// All laid out on the lot's street face: u along it, d inward from the front plane.

import { box, lathe } from '../../core/geom.js';
import { face } from './blocks.js';
import { Quads, shopSign, rng } from './dress.js';

/** The kinds, in the order the lots near the arrival get them: the name, the lining of the walls, the floor, the lamp's colour. */
export const KINDS = {
  drug: { name: 'DRUGS', sur: 'RUSSELL', wall: 'stucco_cream', floor: 'tile_white', pane: 'SODA', board: ['car_black', 'gold'] },
  deli: { name: 'DELICATESSEN', sur: '', wall: 'tile_white', floor: 'timber', pane: 'LUNCH', board: ['shutter_green', 'paint_white'] },
  barber: { name: 'BARBER SHOP', sur: '', wall: 'stucco_cream', floor: 'tile_dark', pane: 'HAIRCUT', board: ['paint_white', 'car_black'] },
  cigar: { name: 'CIGARS', sur: 'KING', wall: 'wood_dark', floor: 'timber', pane: 'TOBACCO', board: ['wood_dark', 'gold'] },
  hat: { name: 'HATTERS', sur: 'WALKER', wall: 'stucco_pale', floor: 'timber', pane: 'HATS', board: ['car_blue', 'gold'] },
  bakery: { name: 'BAKERY', sur: 'ROMANO', wall: 'tile_white', floor: 'tile_white', pane: 'FRESH BREAD', board: ['stucco_cream', 'car_black'] },
  shoe: { name: 'SHOE REPAIR', sur: '', wall: 'stucco_pale', floor: 'timber', pane: 'HEELS WHILE U WAIT', board: ['cloth_maroon', 'gold'] },
  tailor: { name: 'TAILOR', sur: 'COHEN', wall: 'stucco_pale', floor: 'timber', pane: 'ALTERATIONS', board: ['prussian_blue', 'paint_white'] },
  haber: { name: 'HABERDASHER', sur: 'HARRIS', wall: 'stucco_cream', floor: 'timber', pane: 'SHIRTS', board: ['car_black', 'gold'] },
  lunch: { name: 'LUNCH', sur: '', wall: 'tile_white', floor: 'tile_dark', pane: 'COFFEE 5 CENTS', board: ['car_black', 'paint_white'] },
};
export const KIND_ORDER = ['drug', 'deli', 'barber', 'cigar', 'hat', 'bakery', 'shoe', 'tailor', 'haber', 'lunch'];
const SHIRT = ['paint_white', 'cloth_blue', 'cloth_ochre', 'cloth_grey', 'cloth_red', 'cloth_indigo'], BOXES = ['paint_white', 'cloth_brown', 'wood_ochre', 'cloth_green', 'cloth_blue', 'cloth_red', 'cloth_grey'];

/**
 * shopRoom: builds the ground storey of a lot as a shop, and the body above it. Called by `skyscraper` for a lot with `room`.
 * { rect, y, h, mat, front ('n'|'s'), room: { kind, depth, door (0 left, 1 right at the face) } }
 */
export function shopRoom(bag, col, lights, el, r) {
  const rect = el.rect, y = el.y ?? 0, h = el.h, mat = el.mat, f = el.front, K = KINDS[el.room.kind], F = face(rect, f), { R, L, ext } = F;
  const Dr = el.room.depth, T = 0.3, fy = y + 0.06, HC = y + 4.18, doorR = el.room.door === 1;
  const I = (u0, u1, y0, y1, d0, d1) => R(u0, u1, y0, y1, -d1, -d0);          // d inward from the front plane
  const RC = (u0, u1, d0, d1) => F.rc(u0, u1, -d1, -d0);
  const solid = (m, u0, u1, y0, y1, d0, d1, hit = true) => { bag.add(m, I(u0, u1, y0, y1, d0, d1)); if (hit) col.rect(RC(u0, u1, d0, d1), y0, y1); };
  const P = (u, d, yy) => F.P(u, -d, yy);
  // the body: the upper storeys on the tin ceiling, the solid rear, the party walls and the back wall
  bag.add(mat, R(0, L, y + 4.5, y + h, -ext, 0)); col.rect(F.rc(0, L, -ext, 0), y + 4.5, y + h);
  bag.add(mat, R(0, L, y - 0.5, y + 4.5, -ext, -Dr)); col.rect(F.rc(0, L, -ext, -Dr), y - 0.5, y + 4.5);
  for (const [a, b] of [[0, T], [L - T, L]]) { bag.add(mat, I(a, b, y - 0.5, y + 4.5, 0, Dr)); col.rect(RC(a, b, 0, Dr), y - 0.5, y + 4.5); }
  bag.add(K.wall, I(T, L - T, fy, HC, Dr - 0.04, Dr)); bag.add(K.wall, I(T, T + 0.04, fy, HC, 0.1, Dr)); bag.add(K.wall, I(L - T - 0.04, L - T, fy, HC, 0.1, Dr));
  // the floor, its checker (the tiled floors), the skirting; the tin ceiling with its beams and its cornice
  bag.add(K.floor, I(T, L - T, y - 0.5, fy, 0, Dr));
  const Q = new Quads();
  if (K.floor === 'tile_white' || K.floor === 'tile_dark') {
    const cs = 0.5, o = K.floor === 'tile_white' ? 'tile_dark' : 'tile_white';
    for (let a = T; a + cs <= L - T + 0.01; a += cs) for (let b = 0; b + cs <= Dr + 0.01; b += cs) if (((Math.round(a / cs) + Math.round(b / cs)) & 1) === 0) Q.up(o, P(a, b, fy + 0.004), P(a + cs, b, fy + 0.004), P(a + cs, b + cs, fy + 0.004), P(a, b + cs, fy + 0.004));
  }
  Q.flush(bag);
  bag.add('wood_dark', I(T, L - T, fy, fy + 0.14, Dr - 0.1, Dr)); bag.add('wood_dark', I(T, T + 0.04, fy, fy + 0.14, 0, Dr)); bag.add('wood_dark', I(L - T - 0.04, L - T, fy, fy + 0.14, 0, Dr));
  bag.add('plaster_white', I(T, L - T, HC, y + 4.5, 0, Dr));
  for (let d = 1.6; d < Dr - 0.5; d += 1.6) bag.add('plaster_white', I(T, L - T, HC - 0.1, HC, d - 0.06, d + 0.06));
  bag.add('limestone', I(T, L - T, HC - 0.16, HC, 0.0, 0.18)); bag.add('limestone', I(T, L - T, HC - 0.16, HC, Dr - 0.18, Dr));
  // the front: black granite stall riser, plate glass in chrome, the door (open, a mat and a brass sill), its transom; the fascia over all
  const dw = 1.3, du0 = doorR ? L - T - dw - 0.2 : T + 0.2, du1 = du0 + dw, g0 = doorR ? T : du1, g1 = doorR ? du0 : L - T;
  for (const [a, b] of [[T, du0], [du1, L - T]]) {
    bag.add('granite_black', R(a, b, y - 0.5, y + 0.8, -0.2, 0.1)); col.rect(F.rc(a, b, -0.2, 0.1), y - 0.5, y + 3.3);
    bag.add('glass_outer', R(a, b, y + 0.8, y + 3.3, -0.05, 0.0));
    for (let u = a; u <= b + 0.01; u += (b - a) / Math.max(1, Math.round((b - a) / 1.7))) bag.add('steel_chrome', R(Math.max(a, u - 0.03), Math.min(b, u + 0.03), y + 0.8, y + 3.3, -0.07, 0.04));
  }
  for (const [a, b] of [[0, T + 0.2], [L - T - 0.2, L]].filter(([a, b]) => b - a > 0.3)) { bag.add('granite_black', R(a, b, y - 0.5, y + 3.3, -0.2, 0.1)); col.rect(F.rc(a, b, -0.2, 0.1), y - 0.5, y + 3.3); }
  bag.add('granite_black', R(0, L, y + 3.3, y + 3.7, -0.2, 0.15)); bag.add('limestone', R(0, L, y + 3.7, y + 4.3, 0, 0.4)); bag.add('limestone', R(0, L, y + 4.3, y + 4.5, -0.1, 0.5));
  bag.add('glass_outer', R(du0, du1, y + 2.5, y + 3.3, -0.05, 0)); bag.add('steel_chrome', R(du0, du1, y + 2.42, y + 2.5, -0.08, 0.05));
  bag.add('gilt_bronze', R(du0, du1, y, y + 0.05, -0.2, 0.2)); bag.add('rubber', I(du0 + 0.1, du1 - 0.1, fy, fy + 0.012, 0.3, 1.0));
  bag.add('wood_painted', I(doorR ? du1 - 0.05 : du0, doorR ? du1 : du0 + 0.05, y, y + 2.4, 0.15, 0.8));                 // the leaf folded back against the glass
  // the sign across the fascia, the pane's lettering; an awning on a few
  const shop = { text: `${K.sur ? K.sur + ' ' : ''}${K.name}`.trim(), kind: 'bank', board: K.board, pane: K.pane };
  shopSign(bag, F, T, L - T, y, shop, g0, g1, true, r);
  if (el.room.kind === 'barber') {                                                            // the barber's pole by the door
    const pu = doorR ? du1 + 0.35 : du0 - 0.35, [px, , pz] = F.P(pu, 0.35, 0);
    for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'car_red' : 'paint_white', lathe([[0.11, 0], [0.11, 0.18]], 10, null, px, y + 1.6 + k * 0.18, pz));
    bag.add('steel_chrome', lathe([[0.001, 0], [0.12, 0], [0.12, 0.05], [0.001, 0.05]], 10, null, px, y + 1.55, pz)); bag.add('steel_chrome', lathe([[0.001, 0], [0.12, 0.05], [0.001, 0.12]], 10, null, px, y + 2.68, pz));
    bag.add('iron', lathe([[0.01, 0], [0.01, 1.5]], 4, null, px, y + 1.5, pz)); void pu;
  }
  // ── the furnishing: from the counter across the room (d = Dr − 3.0), the keeper's side behind ──
  const dC = Dr - 3.1, midU = L / 2;
  const counter = (u0, u1, top = 'marble', base = 'wood_dark') => { solid(base, u0, u1, fy, fy + 0.95, dC, dC + 0.7); bag.add(top, I(u0 - 0.04, u1 + 0.04, fy + 0.95, fy + 1.0, dC - 0.04, dC + 0.76)); };
  const shelves = (u0, u1, rows, pal, deep = 0.26, hmax = 0.34) => {
    for (let k = 0; k < rows; k++) {
      const yy = fy + 0.5 + k * 0.5;
      solid('wood_dark', u0, u1, yy, yy + 0.03, Dr - 0.05 - deep, Dr - 0.05, false);
      for (let u = u0 + 0.1; u < u1 - 0.2;) { const w = 0.1 + r() * 0.18, hh = 0.14 + r() * hmax; if (r() < 0.85) bag.add(pal[Math.floor(r() * pal.length)], I(u, u + w, yy + 0.03, yy + 0.03 + hh, Dr - 0.05 - deep + 0.04, Dr - 0.08)); u += w + 0.02 + r() * 0.05; }
    }
    solid('wood_dark', u0 - 0.04, u0, fy, fy + 0.5 + rows * 0.5, Dr - 0.05 - deep, Dr - 0.05, false); solid('wood_dark', u1, u1 + 0.04, fy, fy + 0.5 + rows * 0.5, Dr - 0.05 - deep, Dr - 0.05, false);
    solid('wood_dark', u0, u1, fy, fy + 0.4, Dr - 0.05 - deep, Dr - 0.05, false);
  };
  const stool = (u, d) => { const [x, , z] = P(u, d, fy); bag.add('steel_chrome', lathe([[0.2, 0], [0.2, 0.03], [0.05, 0.06], [0.04, 0.62], [0.001, 0.62]], 10, null, x, fy, z)); bag.add('leather_bench', lathe([[0.18, 0], [0.19, 0.05], [0.001, 0.09]], 10, null, x, fy + 0.62, z)); col.circle(x, z, 0.22, fy, fy + 0.72); };
  const glassCase = (u0, u1, d0, d1, ht = 0.95, pal = null) => {
    solid('wood_dark', u0, u1, fy, fy + 0.5, d0, d1); bag.add('glass_outer', I(u0, u1, fy + 0.5, fy + ht + 0.35, d0 + 0.02, d1 - 0.02)); bag.add('steel_chrome', I(u0, u1, fy + ht + 0.35, fy + ht + 0.4, d0, d1));
    if (pal) for (let u = u0 + 0.1; u < u1 - 0.15; u += 0.18 + r() * 0.12) bag.add(pal[Math.floor(r() * pal.length)], I(u, u + 0.14, fy + 0.5, fy + 0.5 + 0.06 + r() * 0.2, d0 + 0.1, d1 - 0.1));
  };
  const table = (u, d, w = 0.8, dd = 0.8, m = 'wood_dark') => { solid(m, u - w / 2, u + w / 2, fy + 0.72, fy + 0.77, d - dd / 2, d + dd / 2); const [x, , z] = P(u, d, fy); bag.add('iron', lathe([[0.2, 0], [0.04, 0.03], [0.04, 0.72], [0.001, 0.72]], 8, null, x, fy, z)); };
  const chair = (u, d) => { const [x, , z] = P(u, d, fy); bag.add('wood_dark', lathe([[0.17, 0], [0.17, 0.44], [0.001, 0.44]], 8, null, x, fy, z)); col.circle(x, z, 0.2, fy, fy + 0.5); };
  const mirror = (u0, u1, y0, y1) => { bag.add('mirror_tin', I(u0, u1, y0, y1, Dr - 0.06, Dr - 0.04)); bag.add('gilt_bronze', I(u0 - 0.04, u1 + 0.04, y1, y1 + 0.05, Dr - 0.07, Dr - 0.03)); bag.add('gilt_bronze', I(u0 - 0.04, u1 + 0.04, y0 - 0.05, y0, Dr - 0.07, Dr - 0.03)); };
  const k = el.room.kind, u0 = T + 0.4, u1 = L - T - 0.4;
  const fs = (a, b) => (doorR ? [u0 + a, u0 + b] : [u1 - b, u1 - a]);      // a span on the side away from the door
  const fp = (a) => (doorR ? u0 + a : u1 - a);
  if (k === 'drug') {
    // the soda fountain: a marble counter with its stools, the back bar with a mirror, the dispensary's carboys; displays and a magazine rack in front
    counter(u0 + 1.4, u1 - 0.3); for (let u = u0 + 2.0; u < u1 - 0.8; u += 0.75) stool(u, dC - 0.55);
    shelves(u0 + 1.4, u1 - 0.3, 3, ['glaze_blue', 'glaze_green', 'paint_white', 'cloth_red', 'paint_cab_yellow'], 0.3, 0.3); mirror(u0 + 2, u1 - 1, fy + 1.1, fy + 2.3);
    for (const [u, m] of [[u0 + 1.7, 'glaze_red'], [u0 + 2.4, 'glaze_green']]) bag.add(m, lathe([[0.001, 0], [0.18, 0.05], [0.2, 0.3], [0.1, 0.45], [0.05, 0.55], [0.001, 0.58]], 10, null, ...(([x, , z]) => [x, fy + 1.0, z])(P(u, dC + 0.35, 0))));
    { const [a, b] = fs(0, 1.2); glassCase(a, b, 1.4, 3.4, 0.95, BOXES); }
  } else if (k === 'deli') {
    // the long glass case with its salamis hanging behind, canned goods, barrels of pickles, the scale, a cheese
    glassCase(u0 + 0.3, u1 - 0.3, dC, dC + 0.8, 0.9, ['cloth_red', 'cloth_ochre', 'paint_white', 'cloth_brown']);
    for (let u = u0 + 0.6; u < u1 - 0.5; u += 0.28) { const [x, , z] = P(u, dC + 1.4, 0); bag.add('cloth_brown', lathe([[0.04, 0], [0.05, 0.1], [0.05, 0.5], [0.001, 0.56]], 6, null, x, fy + 2.2, z)); bag.add('rope_fibre', lathe([[0.004, 0.56], [0.004, 0.9]], 3, null, x, fy + 2.2, z)); }
    shelves(u0, u1, 4, ['cloth_red', 'paint_white', 'cloth_ochre', 'cloth_green', 'cloth_blue'], 0.28, 0.28);
    for (const u of [fp(0.3), fp(1.0)]) { const [x, , z] = P(u, 0.8, 0); bag.add('timber', lathe([[0.3, 0], [0.34, 0.2], [0.36, 0.45], [0.34, 0.7], [0.3, 0.9], [0.001, 0.9]], 10, null, x, fy, z)); col.circle(x, z, 0.36, fy, fy + 0.9); }
    for (const [u, d] of [[midU - 1, 3.0], [midU + 1.2, 4.2]]) solid('wood_ochre', u - 0.6, u + 0.6, fy, fy + 0.9, d - 0.5, d + 0.5);
    for (let kk = 0; kk < 4; kk++) { const [x, , z] = P(midU - 1 + (kk % 2) * 0.5 - 0.25, 3.0 + (kk > 1 ? 0.3 : -0.3), 0); bag.add('limestone_yellow', lathe([[0.001, 0], [0.22, 0], [0.22, 0.14], [0.001, 0.14]], 10, null, x, fy + 0.9 + (kk > 1 ? 0.14 : 0), z)); }
  } else if (k === 'barber') {
    // three chairs of chrome and green leather before a long mirror, a shelf of bottles, the waiting bench
    mirror(u0, u1, fy + 0.95, fy + 2.4); solid('wood_dark', u0, u1, fy, fy + 0.9, Dr - 0.5, Dr - 0.05); bag.add('marble', I(u0, u1, fy + 0.9, fy + 0.95, Dr - 0.56, Dr - 0.04));
    for (let u = u0 + 0.2; u < u1 - 0.3; u += 0.3) bag.add(['glaze_green', 'glaze_blue', 'paint_white', 'cloth_red'][Math.floor(r() * 4)], I(u, u + 0.1, fy + 0.95, fy + 1.2 + r() * 0.12, Dr - 0.4, Dr - 0.3));
    const n = Math.max(2, Math.min(3, Math.floor((u1 - u0 - 2) / 1.8)));
    for (let kk = 0; kk < n; kk++) { const u = u0 + 1.2 + kk * ((u1 - u0 - 2.4) / Math.max(1, n - 1)), [x, , z] = P(u, Dr - 1.7, 0); bag.add('steel_chrome', lathe([[0.3, 0], [0.3, 0.06], [0.08, 0.14], [0.08, 0.4], [0.001, 0.4]], 12, null, x, fy, z)); bag.add('leather_bench', lathe([[0.001, 0.38], [0.28, 0.4], [0.3, 0.55], [0.001, 0.58]], 12, null, x, fy, z)); bag.add('leather_bench', I(u - 0.28, u + 0.28, fy + 0.55, fy + 1.15, Dr - 1.45 + 0.2, Dr - 1.45 + 0.3)); bag.add('steel_chrome', I(u - 0.3, u + 0.3, fy + 0.5, fy + 0.54, Dr - 2.15, Dr - 1.35)); col.circle(x, z, 0.4, fy, fy + 1.2); }
    { const [a, b] = fs(0.1, 2.4); solid('leather_bench', a, b, fy, fy + 0.45, 0.6, 1.1); solid('wood_dark', a, b, fy + 0.45, fy + 1.0, 1.0, 1.1); }
    for (let kk = 0; kk < 4; kk++) solid(['cloth_red', 'cloth_grey', 'paint_white'][kk % 3], u1 - 1.6 + kk * 0.35, u1 - 1.4 + kk * 0.35, fy + 0.7, fy + 0.72, 0.3, 0.8, false);
  } else if (k === 'cigar') {
    counter(u0 + 0.5, u1 - 0.5, 'timber', 'wood_dark'); glassCase(u0 + 0.9, u0 + 3.0, dC + 0.05, dC + 0.65, 0.2, ['wood_ochre', 'cloth_brown']);
    shelves(u0, u1, 5, ['wood_ochre', 'cloth_brown', 'car_red', 'paint_white', 'cloth_green'], 0.22, 0.12);
    for (const u of [fp(0.2)]) { const [x, , z] = P(u, 1.5, 0); bag.add('wood_dark', lathe([[0.18, 0], [0.18, 1.2], [0.14, 1.7], [0.001, 1.75]], 8, null, x, fy, z)); col.circle(x, z, 0.2, fy, fy + 1.8); }
    table(midU, 2.4, 0.9, 0.9); chair(midU - 0.8, 2.4); chair(midU + 0.8, 2.4);
  } else if (k === 'hat') {
    counter(u0 + 0.5, u1 - 0.5, 'timber', 'wood_dark');
    for (let row = 0; row < 3; row++) for (let u = u0 + 0.3; u < u1 - 0.3; u += 0.42) { const [x, , z] = P(u, Dr - 0.3, 0), m = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'][Math.floor(r() * 4)]; bag.add('wood_dark', box(x - 0.15, fy + 0.7 + row * 0.55, z - 0.15, x + 0.15, fy + 0.72 + row * 0.55, z + 0.15)); bag.add(m, lathe([[0.001, 0], [0.19, 0], [0.19, 0.02], [0.11, 0.03], [0.11, 0.14], [0.001, 0.16]], 10, null, x, fy + 0.72 + row * 0.55, z)); }
    mirror(u0 + 1, u1 - 1, fy + 0.8, fy + 2.2); { const [a, b] = fs(0, 1.6); glassCase(a, b, 1.2, 2.0, 0.95, ['cloth_black', 'cloth_grey']); }
    for (const u of [midU - 0.8, midU + 0.8]) { chair(u, 3.2); }
    solid('wood_dark', midU - 0.35, midU + 0.35, fy, fy + 0.9, 2.2, 2.7);
  } else if (k === 'bakery') {
    counter(u0 + 0.4, u1 - 0.4); glassCase(u0 + 0.5, u1 - 0.5, dC - 1.5, dC - 0.5, 0.9, ['wood_ochre', 'cloth_ochre', 'cloth_brown', 'paint_white']);
    shelves(u0, u1, 4, ['wood_ochre', 'cloth_ochre', 'cloth_brown'], 0.4, 0.2);
    for (let u = u0 + 0.5; u < u1 - 0.6; u += 0.8) { const [x, , z] = P(u, dC + 0.35, 0); bag.add('wood_ochre', lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.08], [0.001, 0.12]], 10, null, x, fy + 1.0, z)); }
    solid('iron', fp(0.6) - 0.3, fp(0.6) + 0.3, fy, fy + 1.7, 0.4, 1.0);
    solid('steel_chrome', midU - 0.3, midU + 0.3, fy + 0.95, fy + 1.1, dC + 0.2, dC + 0.5, false);
  } else if (k === 'shoe') {
    solid('wood_dark', u0 + 0.2, u0 + 2.6, fy, fy + 0.85, dC, dC + 0.7); for (const u of [u0 + 0.6, u0 + 1.6]) { const [x, , z] = P(u, dC + 0.35, 0); bag.add('iron', lathe([[0.2, 0], [0.2, 0.05], [0.06, 0.1], [0.06, 0.5], [0.001, 0.5]], 8, null, x, fy + 0.85, z)); bag.add('iron', box(x - 0.18, fy + 1.3, z - 0.08, x + 0.18, fy + 1.36, z + 0.08)); }
    shelves(u0, u1, 5, ['cloth_black', 'cloth_brown', 'cloth_brown', 'car_red', 'paint_white'], 0.28, 0.14);
    solid('wood_dark', u1 - 2.4, u1 - 0.2, fy, fy + 0.95, dC, dC + 0.6); bag.add('timber', I(u1 - 2.45, u1 - 0.15, fy + 0.95, fy + 1.0, dC - 0.05, dC + 0.65));
    for (let kk = 0; kk < 3; kk++) { chair(midU - 1 + kk * 0.7, 1.8); }
    solid('wood_dark', midU - 1.2, midU + 1.2, fy, fy + 0.45, 0.9, 1.1);
  } else if (k === 'tailor') {
    solid('wood_ochre', midU - 1.4, midU + 1.4, fy + 0.7, fy + 0.78, dC - 1.5, dC - 0.3); solid('wood_dark', midU - 1.2, midU - 1.1, fy, fy + 0.7, dC - 1.4, dC - 0.4); solid('wood_dark', midU + 1.1, midU + 1.2, fy, fy + 0.7, dC - 1.4, dC - 0.4);
    shelves(u0, u1, 4, ['cloth_grey', 'cloth_indigo', 'cloth_brown', 'cloth_black', 'cloth_green', 'cloth_maroon'], 0.5, 0.35);
    for (const u of [fp(0.5)]) { const [x, , z] = P(u, 1.6, 0); bag.add('cloth_white', lathe([[0.001, 0], [0.12, 0.8], [0.18, 1.1], [0.1, 1.35], [0.08, 1.45], [0.001, 1.5]], 8, null, x, fy + 0.15, z)); bag.add('iron', lathe([[0.2, 0], [0.04, 0.05], [0.03, 0.15]], 8, null, x, fy, z)); col.circle(x, z, 0.25, fy, fy + 1.7); }
    mirror(u1 - 1.4, u1 - 0.3, fy + 0.2, fy + 2.0); solid('wood_dark', u0 + 0.1, u0 + 1.3, fy, fy + 0.7, Dr - 0.9, Dr - 0.1);
    { const [x, , z] = P(u0 + 0.8, Dr - 0.55, 0); bag.add('iron', box(x - 0.2, fy + 0.7, z - 0.12, x + 0.2, fy + 0.82, z + 0.12)); }
  } else if (k === 'haber') {
    glassCase(u0 + 0.3, u1 - 0.3, dC, dC + 0.7, 0.95, SHIRT); { const [a, b] = fs(0, 1.5); glassCase(a, b, 1.2, 2.0, 0.95, ['car_red', 'cloth_blue', 'cloth_green']); }
    shelves(u0, u1, 5, SHIRT, 0.34, 0.2);
    for (const u of [fp(0.4)]) { const [x, , z] = P(u, 2.8, 0); bag.add('wood_dark', lathe([[0.2, 0], [0.04, 0.05], [0.03, 1.8], [0.001, 1.8]], 8, null, x, fy, z)); col.circle(x, z, 0.22, fy, fy + 1.8); }
    { const [x, , z] = P(midU, 2.6, 0); bag.add('cloth_black', lathe([[0.001, 0], [0.16, 0.8], [0.2, 1.1], [0.1, 1.35], [0.001, 1.45]], 8, null, x, fy + 0.15, z)); bag.add('iron', lathe([[0.22, 0], [0.04, 0.05], [0.03, 0.15]], 8, null, x, fy, z)); col.circle(x, z, 0.25, fy, fy + 1.7); }
  } else if (k === 'lunch') {
    counter(u0 + 0.4, u1 - 0.4, 'marble', 'car_cream'); for (let u = u0 + 1.0; u < u1 - 0.7; u += 0.7) stool(u, dC - 0.55);
    solid('steel_chrome', u0 + 0.4, u1 - 0.4, fy, fy + 1.0, Dr - 0.7, Dr - 0.05); bag.add('tile_white', I(u0 + 0.4, u1 - 0.4, fy + 1.0, fy + 2.4, Dr - 0.05, Dr - 0.02));
    for (const [u, m] of [[u0 + 1.2, 'steel_chrome'], [u0 + 1.8, 'steel_chrome']]) { const [x, , z] = P(u, dC + 0.35, 0); bag.add(m, lathe([[0.17, 0], [0.17, 0.5], [0.12, 0.6], [0.001, 0.65]], 10, null, x, fy + 1.0, z)); }
    for (const [u, d] of [[u0 + 0.8, 1.6], [midU, 1.6], [u1 - 0.8, 1.6]]) { table(u, d, 0.8, 0.8, 'marble'); chair(u - 0.6, d); chair(u + 0.6, d); }
  }
  // the lamps: a globe over the counter and one at the front, the tin ceiling's
  for (const d of [2.3, Dr - 2.6]) { const [x, , z] = P(midU, d, 0); bag.add('lamp_white', lathe([[0.001, -0.3], [0.13, -0.22], [0.17, -0.1], [0.1, -0.02], [0.001, 0]], 12, null, x, HC - 0.1, z)); bag.add('iron', lathe([[0.01, 0], [0.01, 0.2]], 3, null, x, HC - 0.1, z)); lights.push({ at: [x, HC - 0.6, z], color: '#ffe3b4', intensity: 2.2, distance: 8 }); }
}
export { rng };
