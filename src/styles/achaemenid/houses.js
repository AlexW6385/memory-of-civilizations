// The houses of Parsa below the terrace (docs/settlements/persepolis.md §15, §16): flat-roofed mudbrick
// houses round small courts and plain houses on the street, a third of them shops with the front opened
// under a reed awning, and a share of all three walkable and furnished. Weathered (plaster lost from the
// brick, rising damp, streaks under the roof spouts, patched repairs), each with its doorstep, its bench,
// its roof goods. Also the stone-lined water channels of the streets and the walled garden plots.

import { box, lathe, rod } from '../../core/geom.js';

import { RAND, frameOf, houseMake, houseDoor, houseVent, houseRoom } from './houses-data.js';
export { frameOf, houseMake, houseDoor, houseVent, houseRoom };

const WALLS = ['mud_plaster', 'mud_plaster', 'earth_wall', 'banco_smooth', 'plaster_persian'];

export function house(el, { bag, col, lights }) {
  const m = houseMake(el), { P, R, L, D } = frameOf(m.rect, m.front), h = m.h, rand = RAND(m.seed * 7 + 3), kind = m.kind;
  const upMat = WALLS[m.seed % 5], loMat = m.seed % 3 === 0 ? 'brick_buff' : 'mudbrick';
  const B = (mat, a0, a1, b0, b1, y0, y1) => { const r = R(a0, a1, b0, b1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const solid = (mat, a0, a1, b0, b1, y0, y1) => { const r = B(mat, a0, a1, b0, b1, y0, y1); col.rect(r, y0, y1); };
  const t = 0.55;
  // a wall of brick and plaster from y0 to hh across a0…a1, b0…b1 (solid)
  const wall = (a0, a1, b0, b1, hh, y0 = 0) => {
    if (a1 - a0 < 0.05 || b1 - b0 < 0.05) return;
    if (y0 <= 0) B('rubble', a0 - 0.05, a1 + 0.05, b0 - 0.05, b1 + 0.05, -0.3, 0.4);
    const k = hh * 0.62, ya = Math.max(y0, 0.4);
    if (ya < k) B(loMat, a0, a1, b0, b1, ya, k);
    B(upMat, a0, a1, b0, b1, Math.max(y0, k), hh);
    col.rect(R(a0, a1, b0, b1), y0, hh);
  };
  const parapet = (a0, a1, b0, b1, y, spouts) => {
    B(upMat, a0, a1, b0, b1, y, y + 0.12);
    const p = 0.28, k = y + 0.12, hp = 0.42;
    B(upMat, a0, a1, b0, b0 + p, k, k + hp); B(upMat, a0, a1, b1 - p, b1, k, k + hp);
    B(upMat, a0, a0 + p, b0 + p, b1 - p, k, k + hp); B(upMat, a1 - p, a1, b0 + p, b1 - p, k, k + hp);
    if (spouts) for (const a of spouts) { const q = P(a, b0), qq = P(a, b0 - 0.35); bag.add('timber', rod([q[0], y + 0.2, q[1]], [qq[0], y + 0.1, qq[1]], 0.05, 6)); }
  };
  const doorway = (a, w, b0, b1, dh = 2.15, leaf = true) => {
    B('opening', a - w / 2, a + w / 2, b0 + 0.04, b1 - 0.04, 0, dh);
    for (const s of [-1, 1]) B('timber', a + s * (w / 2 + 0.07) - 0.07, a + s * (w / 2 + 0.07) + 0.07, b0 - 0.05, b1 + 0.05, 0, dh);
    B('timber', a - w / 2 - 0.3, a + w / 2 + 0.3, b0 - 0.1, b1 + 0.1, dh, dh + 0.22);
    if (leaf) B('wood_dark', a - w / 2 + 0.02, a + w / 2 - 0.02, b0 + 0.06, b0 + 0.16, 0.02, dh - 0.04);
  };
  const beams = (a0, a1, b, y) => { for (let a = a0 + 0.5; a < a1 - 0.3; a += 0.8) B('timber', a - 0.07, a + 0.07, b - 0.14, b, y, y + 0.14); };
  const slit = (a, b, y) => { B('opening', a - 0.17, a + 0.17, b - 0.02, b + 0.03, y, y + 0.55); B('timber', a - 0.22, a + 0.22, b - 0.03, b + 0.03, y + 0.55, y + 0.66); };
  const jar = (x, z, r = 0.3, y = 0, mat = 'terracotta') => bag.add(mat, lathe([[0.001, 0], [r * 0.45, 0], [r * 0.9, r * 0.5], [r, r * 1.2], [r * 0.82, r * 2.1], [r * 0.5, r * 2.5], [r * 0.58, r * 2.7], [0.001, r * 2.65]], 10, null, x, y, z));
  const jarAt = (a, b, r, y = 0, mat) => { const [x, z] = P(a, b); jar(x, z, r, y, mat); };
  // the weathering of a face: boxes proud of the plane b = 0 by 2 cm
  const patch = (mat, a0, a1, y0, y1) => B(mat, a0, a1, -0.025, 0.005, y0, y1);
  const weather = (hh, spouts, a0 = 0, a1 = L) => {
    const span = a1 - a0, n = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {                                    // plaster lost, the brick showing
      const w = 0.6 + rand() * 1.0, a = a0 + 0.4 + rand() * Math.max(0.1, span - w - 0.8), y = rand() < 0.65 ? 0.4 + rand() * 0.6 : hh * 0.45 + rand() * hh * 0.35, hy = 0.35 + rand() * 0.5;
      patch(loMat, a, a + w, y, Math.min(y + hy, hh - 0.3));
    }
    for (let a = a0 + 0.3; a < a1 - 0.6;) { const w = 0.8 + rand() * 1.8; patch('plaster_damp', a, Math.min(a1 - 0.3, a + w), 0.4, 0.55 + rand() * 0.5); a += w + 0.6 + rand() * 2; }   // rising damp
    for (let i = 0; i < 2; i++) { const a = a0 + 0.4 + rand() * Math.max(0.1, span - 2.2); patch('plaster_persian', a, a + 0.8 + rand() * 0.9, hh * 0.3 + rand() * hh * 0.3, hh * 0.6 + rand() * hh * 0.25); }   // a repair in a paler plaster
    if (spouts) for (const a of spouts) patch('plaster_streak', a - 0.14, a + 0.14, hh * 0.35, hh - 0.25);
  };
  const doorFurniture = (a, w) => {
    B('limestone_persian', a - w / 2 - 0.2, a + w / 2 + 0.2, -0.6, 0, 0, 0.14);        // the doorstep
    if (kind !== 'shop' && rand() < 0.55) {                                            // a brick bench by the door, in the sun or in the shade
      const side = a + w / 2 + 2.2 < L - 0.3 ? 1 : -1, a0 = a + side * (w / 2 + 0.2), a1 = a + side * (w / 2 + 2.0);
      solid('mudbrick', Math.min(a0, a1), Math.max(a0, a1), -0.5, 0, 0, 0.44);
      B('mud_plaster', Math.min(a0, a1) - 0.03, Math.max(a0, a1) + 0.03, -0.53, 0.0, 0.44, 0.5);
    }
    B('opening', a - w / 2 - 0.55, a - w / 2 - 0.3, -0.03, 0.12, 1.3, 1.62); B('timber', a - w / 2 - 0.6, a - w / 2 - 0.25, -0.05, 0.14, 1.62, 1.68);   // a lamp niche beside the door
  };
  const roofGoods = (a0, a1, b0, b1, y) => {
    const k = Math.floor(rand() * 4), a = a0 + (a1 - a0) * (0.25 + rand() * 0.5), b = b0 + (b1 - b0) * (0.3 + rand() * 0.4), p = P(a, b);
    if (k === 0) for (let i = 0; i < 4; i++) bag.add('thatch', rod([p[0] - 0.4, y + 0.14 + (i % 2) * 0.2, p[1] + i * 0.18 - 0.3], [p[0] + 0.7, y + 0.14 + (i % 2) * 0.2, p[1] + i * 0.18 - 0.3], 0.09, 6));
    else if (k === 1) { jar(p[0], p[1], 0.26, y + 0.12); jar(p[0] + 0.7, p[1] + 0.2, 0.2, y + 0.12); }
    else if (k === 2) { const r = R(a - 0.7, a + 0.7, b - 0.5, b + 0.5); bag.add('reed_mat', box(r[0], y + 0.12, r[1], r[2], y + 0.17, r[3])); for (let i = 0; i < 6; i++) bag.add('cloth_ochre', box(r[0] + 0.1 + (i % 3) * 0.4, y + 0.17, r[1] + 0.1 + Math.floor(i / 3) * 0.45, r[0] + 0.34 + (i % 3) * 0.4, y + 0.22, r[1] + 0.4 + Math.floor(i / 3) * 0.45)); }
    else { const r = R(a - 0.4, a + 0.4, b - 0.3, b + 0.3); bag.add('wood_dark', box(r[0], y + 0.12, r[1], r[2], y + 0.5, r[3])); }
  };
  // a reed sunshade on four posts over part of the roof (the sleeping place of the summer nights)
  const sunshade = (a0, a1, b0, b1, y) => {
    for (const [a, b] of [[a0, b0], [a1, b0], [a0, b1], [a1, b1]]) { const p = P(a, b); bag.add('timber', rod([p[0], y + 0.12, p[1]], [p[0], y + 1.9, p[1]], 0.05, 6)); }
    B('reed_mat', a0 - 0.2, a1 + 0.2, b0 - 0.2, b1 + 0.2, y + 1.9, y + 1.97);
    B('reed_mat', a0 + 0.2, a1 - 0.2, b0 + 0.2, b1 - 0.2, y + 0.12, y + 0.17);
  };
  const vent = houseVent(el);
  const ventA = () => { if (!vent) return; bag.add('mud_plaster', box(vent[0] - 0.3, vent[1] - 1.25, vent[2] - 0.3, vent[0] + 0.3, vent[1] - 0.55, vent[2] + 0.3)); bag.add('mudbrick', box(vent[0] - 0.26, vent[1] - 0.55, vent[2] - 0.26, vent[0] + 0.26, vent[1] - 0.2, vent[2] + 0.26)); bag.add('opening', box(vent[0] - 0.12, vent[1] - 0.2, vent[2] - 0.12, vent[0] + 0.12, vent[1] - 0.17, vent[2] + 0.12)); };

  // ── a furnished room (a0…a1 along, b0…b1 inward, floor at 0.08): the hearth, the mats, the chests, the loom, the stores
  const floor = (a0, a1, b0, b1) => { const r = B('mud_plaster', a0, a1, b0, b1, 0, 0.08); col.floor(r, 0.08); };
  const lamp = (a, b, y = 1.4) => { const [x, z] = P(a, b); lights?.push({ at: [x, y, z], color: '#ffb46b', intensity: 1.5, distance: 7 }); };
  const mat = (a, b, w, d, c1, c2) => { B('reed_mat', a - w / 2, a + w / 2, b - d / 2, b + d / 2, 0.08, 0.11); B(c1, a - w / 2 + 0.1, a - w / 2 + 0.55, b - d / 2 + 0.2, b - d / 2 + 0.7, 0.11, 0.2); B(c2, a + w / 2 - 0.6, a + w / 2 - 0.1, b + d / 2 - 0.7, b + d / 2 - 0.2, 0.11, 0.19); };
  const hearth = (a, b) => {
    solid('mudbrick', a - 0.6, a + 0.6, b - 0.45, b + 0.45, 0.08, 0.32);
    const [x, z] = P(a, b); bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0], [0.27, 0.12], [0.22, 0.26], [0.17, 0.3], [0.2, 0.32], [0.001, 0.3]], 10, null, x - 0.15, 0.32, z));
    bag.add('flame', lathe([[0.16, 0], [0.08, 0.1], [0.001, 0.2]], 8, null, x + 0.3, 0.32, z)); bag.add('wood_dark', box(x + 0.15, 0.32, z - 0.08, x + 0.45, 0.36, z + 0.08));
    lamp(a, b, 1.2);
  };
  const chest = (a, b, w = 1.0, d = 0.5, hh = 0.55) => { solid('wood_dark', a - w / 2, a + w / 2, b - d / 2, b + d / 2, 0.08, 0.08 + hh); B('bronze', a - w / 2 - 0.01, a + w / 2 + 0.01, b - 0.03, b + 0.03, 0.08 + hh * 0.62, 0.08 + hh * 0.7); };
  const bed = (a, b, w = 2.2, d = 1.4) => { solid('mudbrick', a - w / 2, a + w / 2, b - d / 2, b + d / 2, 0.08, 0.38); B('reed_mat', a - w / 2, a + w / 2, b - d / 2, b + d / 2, 0.38, 0.41); B('cloth_ochre', a - w / 2 + 0.1, a + w / 2 - 0.5, b - d / 2 + 0.1, b + d / 2 - 0.1, 0.41, 0.52); B('cloth_white', a + w / 2 - 0.5, a + w / 2 - 0.15, b - d / 2 + 0.15, b + d / 2 - 0.15, 0.41, 0.58); };
  const loom = (a, b) => {
    for (const s of [-1, 1]) { const p = P(a + s * 0.8, b); bag.add('timber', rod([p[0], 0.08, p[1]], [p[0], 1.9, p[1]], 0.05, 6)); col.circle(p[0], p[1], 0.08, 0.08, 1.9); }
    B('timber', a - 0.85, a + 0.85, b - 0.04, b + 0.04, 1.85, 1.95); B('timber', a - 0.85, a + 0.85, b - 0.04, b + 0.04, 0.55, 0.62);
    for (let i = 0; i < 9; i++) B('sacking', a - 0.72 + i * 0.18, a - 0.68 + i * 0.18, b - 0.02, b + 0.02, 0.7, 1.85);
    B('cloth_red', a - 0.76, a + 0.9, b - 0.03, b + 0.03, 0.62, 0.95); B('cloth_indigo', a - 0.76, a + 0.9, b - 0.03, b + 0.03, 0.95, 1.05);
  };
  const shelf = (a0, a1, b, y, n, along) => {
    B('timber', a0, a1, b - 0.16, b + 0.16, y, y + 0.05);
    for (let i = 0; i < n; i++) { const a = a0 + 0.3 + (a1 - a0 - 0.6) * (i / Math.max(1, n - 1)); jarAt(a, b, 0.12 + (i % 3) * 0.02, y + 0.05, i % 4 === 3 ? 'pottery_dark' : 'terracotta'); }
    void along;
  };
  const stores = (a0, a1, b) => { let a = a0 + 0.5; for (let i = 0; a < a1 - 0.5; i++) { const r = 0.34 + (i % 2) * 0.08; const [x, z] = P(a, b); jar(x, z, r, 0.08); col.circle(x, z, r, 0.08, 1.0); a += r * 2 + 0.25; } };
  const room = (a0, a1, b0, b1, role) => {
    const w = a1 - a0, d = b1 - b0;
    if (role === 'living') { hearth(a1 - 0.9, b0 + 0.6); mat(a0 + w * 0.45, b0 + d * 0.55, 2.6, 1.7, 'cloth_red', 'cloth_indigo'); chest(a0 + 0.7, b1 - 0.4); shelf(a0 + 1.6, a0 + 4.4, b1 - 0.2, 1.3, 5); }
    else if (role === 'sleep') { bed(a0 + 1.4, b1 - 1.0); loom(a0 + w * 0.62, b1 - 0.6); chest(a1 - 0.7, b0 + 0.5, 1.1, 0.55, 0.6); stores(a0 + 3.5, a1 - 1.0, b0 + 0.5); lamp(a0 + w / 2, b0 + d / 2, 1.5); }
    else if (role === 'store') { stores(a0 + 0.2, a1 - 0.2, b1 - 0.5); stores(a0 + 0.2, a1 - 0.2, b0 + 0.5); for (let i = 0; i < 3; i++) B('sacking', a0 + 1 + i * 1.1, a0 + 1.7 + i * 1.1, b0 + d * 0.5 - 0.3, b0 + d * 0.5 + 0.3, 0.08, 0.6); lamp(a0 + w / 2, b0 + d / 2, 1.5); }
  };
  // a hollow block: the walls round a room, the door in the face at b0, a partition with its doorway, the floor, the ceiling's beams
  const hollow = (a0, a1, b0, b1, doorA, doorW, role1, role2, shop) => {
    const dh = shop ? 2.65 : 2.15;
    wall(a0, doorA - doorW / 2, b0, b0 + t, h); wall(doorA + doorW / 2, a1, b0, b0 + t, h); wall(doorA - doorW / 2, doorA + doorW / 2, b0, b0 + t, h, dh);
    wall(a0, a0 + t, b0 + t, b1 - t, h); wall(a1 - t, a1, b0 + t, b1 - t, h); wall(a0, a1, b1 - t, b1, h);
    floor(a0 + t, a1 - t, b0 + t, b1 - t);
    for (let a = a0 + t + 0.4; a < a1 - t; a += 0.9) B('cedar', a - 0.09, a + 0.09, b0 + t - 0.12, b1 - t + 0.12, h - 0.34, h - 0.16);
    B('timber', a0 + t, a1 - t, b0 + t, b1 - t, h - 0.16, h);
    const bp = b0 + (b1 - b0) * (shop ? 0.5 : 0.52), pa = shop ? a0 + (a1 - a0) * 0.78 : a0 + (a1 - a0) * 0.3;
    wall(a0 + t, pa - 0.5, bp - 0.2, bp + 0.2, h); wall(pa + 0.5, a1 - t, bp - 0.2, bp + 0.2, h); wall(pa - 0.5, pa + 0.5, bp - 0.2, bp + 0.2, h, 2.1);
    for (const s of [-1, 1]) B('timber', pa + s * 0.57 - 0.07, pa + s * 0.57 + 0.07, bp - 0.25, bp + 0.25, 0.08, 2.1);
    room(a0 + t, a1 - t, b0 + t, bp - 0.2, role1); room(a0 + t, a1 - t, bp + 0.2, b1 - t, role2);
  };

  // ── the shop's front: the opening under its awning, the counter, the trade's goods and sign
  const shopFront = (a, bd) => {
    const w = 3.0, a0 = a - w / 2, a1 = a + w / 2, gap = m.enter;
    // the counter across the opening (an entry left at its right end in the walkable shops)
    const c1 = gap ? a1 - 1.1 : a1;
    solid('mud_plaster', a0, c1, -0.5, 0.05, 0, 0.92); B('limestone_persian', a0 - 0.04, c1 + 0.04, -0.54, 0.09, 0.92, 0.99);
    // the awning of reed matting on two posts, a valance of cloth along its edge, the trade's sign hanging from it
    for (const s of [-1, 1]) { const p = P(a + s * (w / 2 + 0.3), -1.8); bag.add('timber', rod([p[0], 0, p[1]], [p[0], 2.65, p[1]], 0.055, 6)); col.circle(p[0], p[1], 0.07, 0, 2.65); }
    B('reed_mat', a0 - 0.6, a1 + 0.6, -1.9, -0.1, 2.58, 2.65);
    B(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][m.seed % 4], a0 - 0.6, a1 + 0.6, -1.93, -1.88, 2.18, 2.58);
    B('timber', a0 - 0.62, a1 + 0.62, -0.12, 0.0, 2.7, 2.78);
    // the goods on the counter and what hangs under the awning
    const x0 = a0 + 0.2, x1 = c1 - 0.2, b = -0.22, y = 0.99;
    const row = (n, f) => { for (let i = 0; i < n; i++) f(x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1)), i); };
    const [ax, az] = [0, 0]; void ax; void az;
    const at = (aa, bb) => P(aa, bb);
    switch (m.trade) {
      case 'baker': row(6, (aa, i) => { const [x, z] = at(aa, b); for (let k = 0; k < 3 + (i % 2); k++) bag.add('brick_buff', lathe([[0.2, 0], [0.2, 0.03], [0.001, 0.03]], 10, null, x, y + k * 0.035, z)); });
        { const [x, z] = at(a1 + 0.9, -1.1); bag.add('terracotta', lathe([[0.55, 0], [0.5, 0.4], [0.4, 0.85], [0.2, 1.05], [0.001, 1.05]], 12, null, x, 0, z)); col.circle(x, z, 0.55, 0, 1.0); bag.add('opening', lathe([[0.001, 0.0], [0.22, 0.0], [0.22, 0.02], [0.001, 0.02]], 8, null, x, 1.05, z)); }
        break;
      case 'potter': row(7, (aa, i) => { const [x, z] = at(aa, b); jar(x, z, 0.13 + (i % 3) * 0.03, y, i % 3 === 2 ? 'glaze_blue' : 'terracotta'); });
        for (let i = 0; i < 4; i++) { const [x, z] = at(a0 - 0.4 + i * 0.9, -1.2); jar(x, z, 0.3 + (i % 2) * 0.1, 0, 'terracotta'); col.circle(x, z, 0.35, 0, 1); } break;
      case 'cloth': row(5, (aa, i) => B(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'][i % 5], aa - 0.28, aa + 0.28, b - 0.14, b + 0.14, y, y + 0.25 + (i % 2) * 0.1));
        for (let i = 0; i < 4; i++) { const aa = a0 + 0.5 + i * 0.7; B(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][(i + m.seed) % 4], aa - 0.25, aa + 0.25, -1.7, -1.67, 1.45, 2.55); } break;
      case 'grain': row(4, (aa, i) => { const [x, z] = at(aa, b); bag.add('wicker', lathe([[0.001, 0], [0.22, 0], [0.26, 0.2], [0.001, 0.2]], 10, null, x, y, z)); bag.add(i % 2 ? 'cloth_ochre' : 'brick_buff', lathe([[0.22, 0], [0.12, 0.1], [0.001, 0.13]], 10, null, x, y + 0.17, z)); });
        for (let i = 0; i < 3; i++) B('sacking', a0 + 0.2 + i * 0.8, a0 + 0.8 + i * 0.8, -1.2, -0.7, 0, 0.65); break;
      case 'fruit': row(5, (aa, i) => { const [x, z] = at(aa, b); bag.add('wicker', lathe([[0.001, 0], [0.24, 0], [0.28, 0.14], [0.001, 0.14]], 10, null, x, y, z)); bag.add(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_red', 'cloth_ochre'][i], lathe([[0.26, 0], [0.16, 0.1], [0.001, 0.14]], 10, null, x, y + 0.1, z)); }); break;
      case 'butcher': for (let i = 0; i < 3; i++) { const aa = a0 + 0.6 + i * 0.9, p = P(aa, -1.5); bag.add('iron', rod([p[0], 2.5, p[1]], [p[0], 2.0, p[1]], 0.015, 5)); bag.add(i === 1 ? 'hide_tan' : 'cloth_red', lathe([[0.001, 0], [0.12, 0.1], [0.16, 0.4], [0.1, 0.62], [0.001, 0.7]], 8, null, p[0], 1.35, p[1])); }
        { const [x, z] = at(x0 + 0.4, b); bag.add('wood_dark', lathe([[0.2, 0], [0.2, 0.18], [0.001, 0.18]], 10, null, x, y, z)); } break;
      case 'carpenter': for (let i = 0; i < 6; i++) B('cedar', a0 - 0.3 + i * 0.12, a0 - 0.2 + i * 0.12, -1.4, -1.3, 0, 1.8 - i * 0.03);
        row(3, (aa, i) => B(i % 2 ? 'timber' : 'cedar', aa - 0.3, aa + 0.3, b - 0.12, b + 0.12, y, y + 0.1 + i * 0.05)); break;
      case 'wine': for (let i = 0; i < 3; i++) { const [x, z] = at(a0 + 0.5 + i * 0.9, -1.1); jar(x, z, 0.4, 0, 'terracotta'); bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.18, 0.06], [0.001, 0.06]], 8, null, x, 1.08, z)); col.circle(x, z, 0.4, 0, 1.1); }
        row(4, (aa) => { const [x, z] = at(aa, b); bag.add('bronze', lathe([[0.001, 0], [0.06, 0], [0.1, 0.1], [0.09, 0.11], [0.001, 0.03]], 8, null, x, y, z)); }); break;
      case 'smith': { const [x, z] = at(a0 - 0.6, -1.0); bag.add('marble_dark', lathe([[0.3, 0], [0.22, 0.2], [0.26, 0.5], [0.001, 0.5]], 8, null, x, 0, z)); bag.add('iron', box(x - 0.2, 0.5, z - 0.08, x + 0.2, 0.58, z + 0.08)); col.circle(x, z, 0.3, 0, 0.6); }
        for (let i = 0; i < 3; i++) { const p = P(a0 + 0.6 + i * 0.9, -1.5); bag.add('bronze', lathe([[0.001, 0], [0.2, 0.05], [0.26, 0.2], [0.001, 0.2]], 10, null, p[0], 1.9, p[1])); bag.add('iron', rod([p[0], 1.9, p[1]], [p[0], 2.55, p[1]], 0.01, 4)); }
        row(3, (aa, i) => B(i ? 'iron' : 'bronze', aa - 0.25, aa + 0.25, b - 0.1, b + 0.1, y, y + 0.06)); break;
      case 'dyer': for (let i = 0; i < 3; i++) { const [x, z] = at(a0 + 0.4 + i * 1.0, -1.1); jar(x, z, 0.38, 0, 'terracotta'); bag.add(['egyptian_blue', 'stucco_red', 'cloth_ochre'][i], lathe([[0.28, 0], [0.001, 0.0]], 12, null, x, 1.02, z)); bag.add(['egyptian_blue', 'stucco_red', 'cloth_ochre'][i], lathe([[0.001, 0], [0.27, 0], [0.27, 0.03], [0.001, 0.03]], 12, null, x, 1.0, z)); col.circle(x, z, 0.38, 0, 1.1); }
        for (let i = 0; i < 4; i++) { const aa = a0 + 0.3 + i * 0.75; B(['egyptian_blue', 'stucco_red', 'cloth_ochre', 'egyptian_blue'][i], aa - 0.25, aa + 0.25, -1.7, -1.67, 1.5, 2.55); } break;
      default: break;
    }
    void bd;
  };

  if (m.court) {
    const bd = D * 0.46, cw = 2.5, b0 = D - bd;
    if (m.enter) hollow(0, L, b0, D, L * 0.4, 1.05, 'living', 'sleep', false);
    else { wall(0, L, b0, D, h); doorway(L * 0.4, 1.05, b0, b0 + t, 2.1, false); }
    parapet(0, L, b0, D, h, [L * 0.25, L * 0.75]);
    if (!m.enter) doorway(L * 0.4, 1.05, b0, b0 + t, 2.1, false);
    slit(L * 0.15, b0, 1.55); slit(L * 0.7, b0, 1.55); slit(L * 0.88, b0, 1.55);
    beams(0, L, b0, h - 0.35);
    wall(0, t, 0, b0, cw); wall(L - t, L, 0, b0, cw);
    const g = m.da, gw = 1.5;
    wall(0, g - gw / 2, 0, t, cw); wall(g + gw / 2, L, 0, t, cw);
    B(upMat, g - gw / 2 - 0.35, g + gw / 2 + 0.35, 0, t, cw - 0.55, cw);
    for (const s of [-1, 1]) B('timber', g + s * (gw / 2 + 0.07) - 0.07, g + s * (gw / 2 + 0.07) + 0.07, -0.05, t + 0.05, 0, cw - 0.55);
    B('timber', g - gw / 2 - 0.3, g + gw / 2 + 0.3, -0.1, t + 0.1, cw - 0.55, cw - 0.33);
    B(upMat, 0, L, 0, t, cw, cw + 0.1);
    // a gate leaf standing half open in the walkable ones
    if (m.enter) { const p = P(g - gw / 2 + 0.08, 0.2), q = P(g - gw / 2 + 0.08, 1.4); void p; void q; B('wood_dark', g - gw / 2, g - gw / 2 + 0.1, t, t + 1.0, 0.04, cw - 0.6); }
    // the court: the oven, jars along the wall, a mat, a bed of herbs, the stair up to the roof
    const [ox, oz] = P(L - 1.7, b0 - 1.6);
    bag.add('terracotta', lathe([[0.5, 0], [0.5, 0.35], [0.38, 0.75], [0.14, 0.95], [0.001, 0.95]], 12, null, ox, 0, oz)); col.circle(ox, oz, 0.5, 0, 1);
    bag.add('opening', lathe([[0.001, 0.05], [0.16, 0.05], [0.16, 0.2], [0.001, 0.2]], 8, null, ox, 0.0, oz));
    for (let i = 0; i < 3; i++) { const [jx, jz] = P(t + 0.45 + i * 0.5, b0 - 0.5); jar(jx, jz, 0.3 - i * 0.03); col.circle(jx, jz, 0.28, 0, 0.8); }
    { const r = R(L * 0.45, L * 0.45 + 1.8, 0.9, 2.0); bag.add('reed_mat', box(r[0], 0.0, r[1], r[2], 0.04, r[3])); }
    { const [bx, bz] = P(L * 0.62, 2.3); solid('mudbrick', L * 0.5, L * 0.5 + 0.1, 3, 3.1, 0, 0.01); const r = R(L * 0.6, L * 0.6 + 1.6, 1.6, 2.4); bag.add('mudbrick', box(r[0], 0, r[1], r[2], 0.2, r[3])); bag.add('silt', box(r[0] + 0.1, 0.2, r[1] + 0.1, r[2] - 0.1, 0.23, r[3] - 0.1)); for (let i = 0; i < 4; i++) bag.add('flax_leaf', lathe([[0.001, 0], [0.2, 0.05], [0.14, 0.3], [0.001, 0.38]], 8, null, bx - 0.65 + i * 0.42, 0.23, bz + (i % 2) * 0.06)); void bz; }
    const sa = 1.0, steps = Math.min(10, Math.round(h / 0.36)), run = 0.34;
    for (let k = 0; k < steps; k++) { const bk = b0 - 0.2 - k * run; if (bk < t + 0.2) break; solid('mudbrick', t, t + sa, bk - run, bk, 0, (k + 1) * h / steps); }
    parapet(0, L, 0, t, cw + 0.1, null);
    weather(cw, null);
    doorFurniture(g, gw);
    roofGoods(0, L, b0, D, h);
    if (rand() < 0.35) sunshade(L * 0.5, L * 0.5 + 2.6, b0 + 1.8, b0 + 3.8, h);
    ventA();
    beams(0, L, 0, cw - 0.55);
  } else {
    const bd = D * 0.62, da = m.da, shop = kind === 'shop';
    if (m.enter) hollow(0, L, 0, bd, da, shop ? 3.0 : 1.1, shop ? 'living' : 'living', shop ? 'store' : 'sleep', shop);
    else wall(0, L, 0, bd, h);
    parapet(0, L, 0, bd, h, [L * 0.2, L * 0.8]);
    if (shop) {
      // the front opened: a wide timber lintel on two posts; the wall closed behind in the houses not entered
      if (!m.enter) { wall(da - 1.5, da + 1.5, 0, t, h); B('opening', da - 1.5, da + 1.5, 0.05, 0.1, 0.0, 2.6); }
      B('cedar', da - 1.75, da + 1.75, -0.12, t + 0.12, 2.7, 2.98);
      for (const s of [-1, 1]) B('timber', da + s * 1.62 - 0.12, da + s * 1.62 + 0.12, -0.12, t + 0.12, 0, 2.7);
      shopFront(da, bd);
    } else {
      if (!m.enter) doorway(da, 1.1, 0, t, 2.2);
      else { B('timber', da - 0.62, da - 0.5, -0.05, t + 0.05, 0, 2.15); B('timber', da + 0.5, da + 0.62, -0.05, t + 0.05, 0, 2.15); B('timber', da - 0.75, da + 0.75, -0.1, t + 0.1, 2.15, 2.37); B('wood_dark', da - 0.5, da - 0.4, t, t + 0.8, 0.04, 2.1); }
      for (const q of [L * 0.12, L * 0.88]) if (Math.abs(q - da) > 1.4) slit(q, 0, 2.2);
      doorFurniture(da, 1.1);
    }
    beams(0, L, 0, h - 0.35);
    weather(h, [L * 0.2, L * 0.8], 0, L);
    if (m.upper) {
      const ua = L * 0.15, ub = L * 0.62, uh = h + 2.5;
      wall2(bag, R, col, ua, ub, 0.6, bd - 0.2, h + 0.12, uh);
      B('opening', (ua + ub) / 2 - 0.35, (ua + ub) / 2 + 0.35, 0.55, 0.62, h + 1.1, h + 1.95);
      B('timber', (ua + ub) / 2 - 0.45, (ua + ub) / 2 + 0.45, 0.5, 0.62, h + 1.95, h + 2.12);
      B('timber', (ua + ub) / 2 - 0.5, (ua + ub) / 2 + 0.5, 0.5, 0.62, h + 0.95, h + 1.05);
      B(upMat, ua - 0.08, ub + 0.08, 0.5, bd - 0.1, uh, uh + 0.12);
    }
    // the yard behind: a wall with a heap of fuel and a jar
    const yb = bd;
    wall(0, t, yb, D, 2.4); wall(L - t, L, yb, D, 2.4); wall(0, L, D - t, D, 2.4);
    B(upMat, 0, L, D - t, D, 2.4, 2.5);
    const [fx, fz] = P(L * 0.55, D - 1.2); bag.add('wood_dark', box(fx - 0.9, 0, fz - 0.4, fx + 0.9, 0.7, fz + 0.4)); col.rect([fx - 0.9, fz - 0.4, fx + 0.9, fz + 0.4], 0, 0.7);
    const [jx, jz] = P(1.1, yb + 1.0); jar(jx, jz, 0.34); col.circle(jx, jz, 0.34, 0, 1);
    if (rand() < 0.45) { const [bx, bz] = P(L * 0.3, D - 1.6); bag.add('terracotta', lathe([[0.45, 0], [0.42, 0.3], [0.3, 0.6], [0.001, 0.7]], 10, null, bx, 0, bz)); col.circle(bx, bz, 0.45, 0, 0.7); }
    roofGoods(0, L, 0, bd, h);
    if (rand() < 0.4) sunshade(L * 0.55, L * 0.55 + 2.8, bd * 0.4, bd * 0.4 + 2.0, h + (m.upper ? 0 : 0));
    ventA();
  }
  void lights;
}
function wall2(bag, R, col, a0, a1, b0, b1, y0, y1) {
  const r = R(a0, a1, b0, b1);
  bag.add('mud_plaster', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1);
}

// ═══ the streets' water ═════════════════════════════════════════════════════════════════════════════════════════

/**
 * street_channel: { a: [x, z], b: [x, z] (a run along one axis), w (the water's width), y } — a stone-lined channel
 * of the town's water (from the qanat), its two edge stones and the water between them, a slab laid over it
 * at each of `cross` (distances along the run) as a way over.
 */
export function streetChannel(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, w = el.w ?? 0.4, y = el.y ?? 0, alongX = Math.abs(bx - ax) > Math.abs(bz - az);
  const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), z0 = Math.min(az, bz), z1 = Math.max(az, bz), e = 0.14, hh = 0.16;
  const R = (u0, u1, c0, c1) => alongX ? [u0, c0, u1, c1] : [c0, u0, c1, u1];
  const [u0, u1] = alongX ? [x0, x1] : [z0, z1], c = alongX ? az : ax;
  const bx_ = (r, y0, y1, m) => bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3]));
  const cross = (el.cross ?? []).map((d) => u0 + d).sort((p, q) => p - q);
  const cuts = [u0, ...cross.flatMap((d) => [d - 0.7, d + 0.7]), u1];
  for (let i = 0; i < cuts.length; i += 2) {
    const s0 = cuts[i], s1 = cuts[i + 1];
    if (s1 - s0 < 0.2) continue;
    bx_(R(s0, s1, c - w / 2 - e, c - w / 2), y, y + hh, 'limestone_persian'); bx_(R(s0, s1, c + w / 2, c + w / 2 + e), y, y + hh, 'limestone_persian');
    bx_(R(s0, s1, c - w / 2, c + w / 2), y + 0.01, y + 0.07, 'water');
  }
  for (const d of cross) { bx_(R(d - 0.7, d + 0.7, c - w / 2 - e - 0.1, c + w / 2 + e + 0.1), y, y + 0.12, 'limestone_persian'); }
  void col;
}

/** flag_apron: { rect, y } — a paving of stone slabs laid on the earth (before a gate, round a well). */
export function flagApron(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  bag.add('flagstone', box(x0, y, z0, x1, y + 0.05, z1));
  const rand = RAND(Math.floor(x0 * 7 + z0 * 13) + 5);
  for (let i = 0; i < 14; i++) { const a = x0 + rand() * (x1 - x0 - 0.8), b = z0 + rand() * (z1 - z0 - 0.8); bag.add('limestone_persian', box(a, y + 0.05, b, a + 0.6 + rand() * 0.3, y + 0.065, b + 0.5 + rand() * 0.3)); }
}

/**
 * garden_plot: { rect, seed } — a lot kept as a garden behind a low mudbrick wall with a gap: raised beds of vegetables in rows,
 * a water channel from a jar, a shed of reeds; the fruit trees themselves are planted by the ground.
 */
export function gardenPlot(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = RAND(el.seed || 1), t = 0.4, hh = 1.4;
  const run = (a0, b0, a1, b1) => { bag.add('rubble', box(a0 - 0.04, -0.2, b0 - 0.04, a1 + 0.04, 0.3, b1 + 0.04)); bag.add('mudbrick', box(a0, 0.3, b0, a1, hh * 0.65, b1)); bag.add('mud_plaster', box(a0, hh * 0.65, b0, a1, hh, b1)); bag.add('mud_plaster', box(a0 - 0.05, hh, b0 - 0.05, a1 + 0.05, hh + 0.1, b1 + 0.05)); col.rect([a0, b0, a1, b1], 0, hh); };
  const gap = x0 + (x1 - x0) * (0.3 + rand() * 0.4), gw = 1.4;
  run(x0, z0, x1, z0 + t); run(x0, z0, x0 + t, z1); run(x1 - t, z0, x1, z1); run(x0, z1 - t, gap - gw / 2, z1); run(gap + gw / 2, z1 - t, x1, z1);
  const rows = 4, bw = (x1 - x0 - 3) / rows;
  for (let i = 0; i < rows; i++) {
    const bx = x0 + 1.5 + i * bw;
    bag.add('silt', box(bx + 0.2, 0, z0 + 2, bx + bw - 0.2, 0.18, z1 - 3));
    for (let k = 0; k < Math.floor((z1 - z0 - 5) / 0.8); k++) bag.add(i % 2 ? 'flax_leaf' : 'cloth_green', lathe([[0.001, 0], [0.22, 0.04], [0.2, 0.2], [0.001, 0.28]], 7, null, bx + bw / 2, 0.18, z0 + 2.3 + k * 0.8));
  }
  bag.add('water', box(x0 + 1.2, 0.01, z0 + 1.2, x1 - 1.2, 0.05, z0 + 1.55));
  { const sx = x1 - 3.2, sz = z0 + 0.8; for (const [dx, dz] of [[0, 0], [2.2, 0], [0, 1.6], [2.2, 1.6]]) bag.add('timber', rod([sx + dx, 0, sz + dz], [sx + dx, 1.9, sz + dz], 0.05, 6)); bag.add('reed_mat', box(sx - 0.2, 1.9, sz - 0.2, sx + 2.4, 1.98, sz + 1.8)); }
}
