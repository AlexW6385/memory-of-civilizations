// The pilgrims' stalls and wayside things of Ajanta's gorge floor (docs/settlements/ajanta.md §16): the booths where flowers, lamps and lamp oil were
// sold to the faithful on the path to the stair, the water-shed (the pāniya-śālā of the roadside), and the small votive stupa that travellers left at the ford.
// A booth is a lean-to of four posts and a woven back wall under a thick thatch roof, a raised mat floor, a display board along the front with a gap
// of 1.7 m at one end so that the visitor can step in to the keeper's mat; the goods lie on the board and hang from the front beam by the booth's kind.
import { box, lathe, rod, frustum } from '../../core/geom.js';
import { rng } from '../../settlements/ajanta/layout.js';
import { frame, B, C, pot } from './houses.js';

const lamp = (bag, x, y, z, r = 0.05, lit = false) => {
  bag.add('terracotta', lathe([[0.001, 0], [r * 0.7, 0], [r, r * 0.35], [r * 0.9, r * 0.5], [r * 0.45, r * 0.42], [0.001, r * 0.3]], 7, null, x, y, z));
  if (lit) bag.add('flame', lathe([[0.008, 0], [0.012, 0.016], [0.001, 0.04]], 5, null, x + r * 0.55, y + r * 0.42, z));
};

/** aj_offerstall: { at: [x, z], y, front: 's'|'n'|'e'|'w', kind: 'flowers'|'lamps'|'water'|'cloth', seed } a booth 3.6 by 2.4 m; the keeper's mat is at u 2.3, v 1.3. */
export function offerstall(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, W0 = 3.6, D0 = 2.4, f = el.front ?? 's', rand = rng(el.seed ?? 1);
  const rect = [cx - W0 / 2, cz - D0 / 2, cx + W0 / 2, cz + D0 / 2];
  const F = frame(rect, f), { W, D } = F, kind = el.kind ?? 'flowers';
  const Y = (v) => y + v;
  // the platform of beaten earth and the mat on it (a step of 0.1 m at the front)
  { const [a, b, c, d] = F.rect4(0, 0, W, D); bag.add('earth_wall', box(a, y - 0.1, b, c, y + 0.1, d)); col.floor([a, b, c, d], y + 0.1); }
  { const [a, b, c, d] = F.rect4(0.2, 0.3, W - 0.2, D - 0.15); bag.add('reed_mat', box(a, y + 0.1, b, c, y + 0.118, d)); }
  // four posts, the woven back wall (a wicker panel of bamboo and reed), the front beam, the roof of thatch over a timber frame
  const HF = 2.45, HB = 2.15;
  for (const [u, v, h] of [[0.12, 0.12, HF], [W - 0.12, 0.12, HF], [0.12, D - 0.12, HB], [W - 0.12, D - 0.12, HB]]) { const [px, pz] = F.xz(u, v); bag.add('timber', rod([px, y + 0.1, pz], [px, Y(h), pz], 0.065, 6)); col.circle(px, pz, 0.08, y + 0.1, Y(h)); }
  B(F, bag, 'wicker', 0.12, y + 0.1, D - 0.1, W - 0.12, Y(HB - 0.05), D - 0.04); C(F, col, 0.12, D - 0.1, W - 0.12, D - 0.04, y + 0.1, Y(HB - 0.05));
  for (const u of [W * 0.33, W * 0.66]) B(F, bag, 'bamboo_culm', u - 0.02, y + 0.1, D - 0.12, u + 0.02, Y(HB), D - 0.08);
  B(F, bag, 'timber', 0.0, Y(HF - 0.12), 0.05, W, Y(HF + 0.02), 0.2);
  B(F, bag, 'timber', 0.0, Y(HB - 0.12), D - 0.2, W, Y(HB + 0.02), D - 0.05);
  B(F, bag, 'timber', 0.0, Y(HB - 0.02), 0.2, 0.1, Y(HF - 0.1), D - 0.2); B(F, bag, 'timber', W - 0.1, Y(HB - 0.02), 0.2, W, Y(HF - 0.1), D - 0.2);
  // the roof: thatch of two courses, sloping back, thick (an underside the walker passes under), the lower eave over the board
  { const [a, b, c, d] = F.rect4(-0.3, -0.5, W + 0.3, D + 0.25);
    bag.add('thatch', box(a, Y(HB + 0.02), b, c, Y(HB + 0.3), d));
    const [a2, b2, c2, d2] = F.rect4(-0.15, -0.35, W + 0.15, D * 0.55);
    bag.add('thatch_palm', box(a2, Y(HF + 0.02), b2, c2, Y(HF + 0.24), d2)); }
  // the display board along the front, 0.75 m high on four legs, from u 0.25 to 1.7 (the gap of 1.9 m beyond it is the way in)
  const bu0 = 0.25, bu1 = 1.7, bv0 = 0.35, bv1 = 0.95, bh = 0.78;
  B(F, bag, 'planks_grey', bu0, Y(bh - 0.05), bv0, bu1, Y(bh), bv1);
  for (const [u, v] of [[bu0 + 0.05, bv0 + 0.05], [bu1 - 0.05, bv0 + 0.05], [bu0 + 0.05, bv1 - 0.05], [bu1 - 0.05, bv1 - 0.05]]) { const [px, pz] = F.xz(u, v); bag.add('timber', rod([px, y + 0.1, pz], [px, Y(bh - 0.05), pz], 0.03, 5)); }
  C(F, col, bu0, bv0, bu1, bv1, y + 0.1, Y(bh));
  const at = (u, v) => F.xz(u, v);
  if (kind === 'flowers') {
    // leaf-cups of lotus buds and open lotus, strings of jasmine, a wide basket of loose petals, garlands hanging from the front beam
    for (let k = 0; k < 6; k++) { const [px, pz] = at(bu0 + 0.2 + k * 0.26, bv0 + 0.16 + (k % 2) * 0.2);
      bag.add('palm_leaf', lathe([[0.001, 0], [0.07, 0.03], [0.09, 0.09], [0.001, 0.06]], 7, null, px, Y(bh), pz));
      bag.add(k % 3 === 0 ? 'cloth_red' : 'paint_white', lathe([[0.001, 0.0], [0.05, 0.02], [0.04, 0.08], [0.001, 0.13]], 6, null, px, Y(bh + 0.05), pz)); }
    { const [px, pz] = at(bu1 - 0.35, bv1 - 0.28); bag.add('wicker', lathe([[0.001, 0], [0.22, 0.0], [0.27, 0.12], [0.001, 0.12]], 9, null, px, Y(bh), pz)); bag.add('paint_white', lathe([[0.001, 0.1], [0.2, 0.1], [0.001, 0.17]], 8, null, px, Y(bh), pz)); }
    for (let k = 0; k < 7; k++) { const u = 0.3 + k * (W - 0.7) / 6, L = 0.5 + (k % 3) * 0.14;
      B(F, bag, k % 2 ? 'paint_white' : 'cloth_red', u - 0.025, Y(HF - 0.12 - L), 0.1, u + 0.025, Y(HF - 0.12), 0.14); if (k % 2 === 0) B(F, bag, 'paint_ochre', u - 0.03, Y(HF - 0.12 - L * 0.5), 0.09, u + 0.03, Y(HF - 0.12 - L * 0.5 + 0.06), 0.15); }
  } else if (kind === 'lamps') {
    // rows of clay lamps on the board (a few lit), a stack of spare lamps, the oil jars with a funnel and the bronze measure, a bundle of wicks
    for (let r2 = 0; r2 < 2; r2++) for (let k = 0; k < 7; k++) { const [px, pz] = at(bu0 + 0.18 + k * 0.2, bv0 + 0.17 + r2 * 0.3); lamp(bag, px, Y(bh), pz, 0.055, r2 === 0 && k === 2); }
    for (let k = 0; k < 5; k++) { const [px, pz] = at(bu1 - 0.3, bv0 + 0.2); lamp(bag, px, Y(bh) + k * 0.022, pz, 0.07 - k * 0.003); }
    for (const [u, v, h] of [[2.05, D - 0.55, 0.62], [2.45, D - 0.5, 0.7], [W - 0.5, D - 0.6, 0.58]]) { const [px, pz] = at(u, v); pot(bag, px, y + 0.1, pz, 0.24, h); col.circle(px, pz, 0.26, y + 0.1, Y(h)); }
    { const [px, pz] = at(2.05, D - 0.55); bag.add('bronze', frustum([px - 0.09, pz - 0.09, px + 0.09, pz + 0.09], Y(0.74), Y(0.86), 0.01, 0.01, 0.01, 0.01)); }
    { const [px, pz] = at(bu1 - 0.7, bv1 - 0.2); bag.add('bronze', lathe([[0.001, 0], [0.06, 0], [0.08, 0.1], [0.07, 0.12], [0.001, 0.1]], 8, null, px, Y(bh), pz)); }
    { const [a, b, c, d] = F.rect4(bu1 - 1.0, bv0 + 0.05, bu1 - 0.8, bv0 + 0.3); bag.add('cloth_white', box(a, Y(bh), b, c, Y(bh + 0.06), d)); }
    // a hung lamp at the front beam
    { const [px, pz] = at(W - 0.5, 0.12); bag.add('iron', rod([px, Y(HF - 0.12), pz], [px, Y(HF - 0.5), pz], 0.008, 4)); lamp(bag, px, Y(HF - 0.56), pz, 0.06, true); }
  } else if (kind === 'water') {
    // the water-shed: four great jars on a rack of poles with a dipper and a row of leaf and clay cups; a stone trough for the animals
    for (let k = 0; k < 3; k++) { const [px, pz] = at(bu0 + 0.3 + k * 0.5, bv0 + 0.3); pot(bag, px, Y(bh), pz, 0.22, 0.46); bag.add('pottery_dark', lathe([[0.18, 0.43], [0.2, 0.46], [0.001, 0.46]], 8, null, px, Y(bh), pz)); }
    for (let k = 0; k < 4; k++) { const [px, pz] = at(bu1 - 0.3 + (k % 2) * 0.12, bv0 + 0.18 + (k >> 1) * 0.2); bag.add(k % 2 ? 'terracotta' : 'palm_leaf', lathe([[0.001, 0], [0.04, 0.0], [0.05, 0.07], [0.001, 0.05]], 6, null, px, Y(bh), pz)); }
    { const [px, pz] = at(2.1, D - 0.55); pot(bag, px, y + 0.1, pz, 0.34, 0.9); col.circle(px, pz, 0.36, y + 0.1, Y(0.9)); const [qx, qz] = at(2.8, D - 0.5); pot(bag, qx, y + 0.1, qz, 0.3, 0.8); col.circle(qx, qz, 0.32, y + 0.1, Y(0.8)); }
    { const [a, b, c, d] = F.rect4(W + 0.5, 0.3, W + 1.5, 1.0); bag.add('granite_rough', box(a, y, b, c, y + 0.35, d)); bag.add('water', box(a + 0.08, y + 0.3, b + 0.08, c - 0.08, y + 0.33, d - 0.08)); col.rect([a, b, c, d], y, y + 0.35); }
  } else {
    // a seller of white cotton cloth, shawls and the cord of a bundle: folded bolts on the board, a hanging length from the beam
    for (let k = 0; k < 5; k++) B(F, bag, ['cloth_white', 'cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][k], bu0 + 0.1 + k * 0.3, Y(bh), bv0 + 0.1, bu0 + 0.36 + k * 0.3, Y(bh + 0.16 + (k % 2) * 0.05), bv1 - 0.1);
    B(F, bag, 'cloth_white', 0.5, Y(HF - 1.1), 0.12, 1.5, Y(HF - 0.12), 0.16); B(F, bag, 'cloth_indigo', 1.7, Y(HF - 0.9), 0.12, 2.5, Y(HF - 0.12), 0.16);
  }
  // a bundle of the keeper's own things and her staff on the mat, a lamp on the post
  { const [px, pz] = at(W - 0.6, D - 0.55); bag.add('cloth_brown', lathe([[0.001, 0], [0.2, 0], [0.25, 0.12], [0.1, 0.2], [0.001, 0.2]], 8, null, px, Y(0.1), pz)); }
  rand();
}

/** aj_wayshrine: { at: [x, z], y, seed } a small votive stupa on a platform, a clay lamp in a niche of the platform, flowers laid before it, left by travellers where the path meets the ford. */
export function wayshrine(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('banco', box(x - 1.0, y, z - 1.0, x + 1.0, y + 0.32, z + 1.0)); col.rect([x - 1.0, z - 1.0, x + 1.0, z + 1.0], y, y + 0.32);
  bag.add('sandstone_carved', box(x - 0.8, y + 0.32, z - 0.8, x + 0.8, y + 0.4, z + 0.8));
  bag.add('sandstone_carved', lathe([[0.55, 0], [0.55, 0.3], [0.6, 0.34], [0.001, 0.34]], 14, null, x, y + 0.4, z));
  bag.add('lime_plaster', lathe([[0.001, 0], [0.55, 0.02], [0.62, 0.32], [0.48, 0.64], [0.18, 0.84], [0.001, 0.88]], 14, null, x, y + 0.74, z));
  bag.add('sandstone_carved', box(x - 0.17, y + 1.6, z - 0.17, x + 0.17, y + 1.8, z + 0.17));
  for (let i = 0; i < 3; i++) bag.add('sandstone_carved', lathe([[0.001, 0], [0.34 - i * 0.08, 0], [0.34 - i * 0.08, 0.05], [0.001, 0.05]], 10, null, x, y + 1.8 + i * 0.12, z));
  col.circle(x, z, 0.66, y + 0.32, y + 2.2);
  lamp(bag, x + 0.9, y + 0.32, z + 0.2, 0.06, true);
  for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'paint_white' : 'cloth_red', lathe([[0.001, 0], [0.06, 0], [0.04, 0.05], [0.001, 0.06]], 6, null, x - 0.9 + (k % 3) * 0.1, y + 0.32, z - 0.5 + k * 0.1));
}
export const STALL_ELEMENTS = { aj_offerstall: offerstall, aj_wayshrine: wayshrine };
