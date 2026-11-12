// The pura dalem — the temple of the dead, at the village's kelod end (docs/settlements/bali-village.md §4.4): a small walled temple, its split gate toward the street, a raised
// court inside with the shrines of the goddess Durga (the gedong, the rong tiga), the padmasana, the open bales for the offerings, the kulkul, and the stone figure of Rangda
// with her long tongue and her white and black cloths. Authored facing south about its centre, turned by the plan (`turns`).
import { box, lathe } from '../../core/geom.js';
import { bx, coping, canang, sash, rng } from './kit.js';
import { wall, candiBentar, shrine, padmasana } from './stone.js';
import { bale, kulkul } from './bale.js';
import { turned } from './rot.js';

/** Rangda on her plinth: the widow-witch of the dalem, in black stone with a red tongue, white fangs and nails, a wild head of hair, a poleng cloth at the waist. */
export function rangda(ctx, x, z, y) {
  bx(ctx, 'andesite', x - 0.75, y, z - 0.75, x + 0.75, y + 0.35, z + 0.75, true); bx(ctx, 'tuff_hewn', x - 0.62, y + 0.35, z - 0.62, x + 0.62, y + 0.6, z + 0.62, true);
  const b = y + 0.6;
  for (const s of [-1, 1]) { bx(ctx, 'basalt', x + s * 0.34 - 0.1, b, z - 0.1, x + s * 0.34 + 0.1, b + 0.55, z + 0.1); bx(ctx, 'basalt', x + s * 0.34 - 0.13, b, z - 0.05, x + s * 0.34 + 0.13, b + 0.07, z + 0.2); }
  bx(ctx, 'basalt', x - 0.3, b + 0.55, z - 0.17, x + 0.3, b + 1.35, z + 0.17);
  sash(ctx, x, z, b + 0.55, 0.3, 'poleng'); bx(ctx, 'cloth_black', x - 0.32, b + 0.6, z - 0.19, x + 0.32, b + 0.9, z + 0.19); bx(ctx, 'cloth_white', x - 0.32, b + 0.9, z - 0.19, x + 0.32, b + 1.0, z + 0.19);
  for (const s of [-1, 1]) {
    bx(ctx, 'basalt', x + s * 0.3, b + 1.15, z - 0.06, x + s * 0.8, b + 1.27, z + 0.06); bx(ctx, 'basalt', x + s * 0.72, b + 1.15, z - 0.06, x + s * 0.8, b + 1.85, z + 0.06);
    for (const q of [-0.04, 0, 0.04]) bx(ctx, 'cloth_white', x + s * 0.73 + q * s, b + 1.85, z - 0.02, x + s * 0.755 + q * s, b + 2.1, z + 0.02);
  }
  bx(ctx, 'basalt', x - 0.22, b + 1.35, z - 0.14, x + 0.22, b + 1.8, z + 0.18);
  bx(ctx, 'wood_dark', x - 0.15, b + 1.44, z + 0.18, x + 0.15, b + 1.56, z + 0.21); bx(ctx, 'cloth_red', x - 0.05, b + 0.85, z + 0.19, x + 0.05, b + 1.5, z + 0.23);
  for (const s of [-1, 1]) { bx(ctx, 'cloth_white', x + s * 0.1 - 0.015, b + 1.38, z + 0.2, x + s * 0.1 + 0.015, b + 1.5, z + 0.22); bx(ctx, 'cloth_white', x + s * 0.1 - 0.03, b + 1.62, z + 0.18, x + s * 0.1 + 0.03, b + 1.68, z + 0.2); }
  bx(ctx, 'hide_black', x - 0.42, b + 0.5, z - 0.36, x + 0.42, b + 1.95, z - 0.14); bx(ctx, 'hide_black', x - 0.3, b + 1.75, z - 0.2, x + 0.3, b + 1.95, z + 0.1);
  bx(ctx, 'gilt_bronze', x - 0.2, b + 1.8, z - 0.1, x + 0.2, b + 1.9, z + 0.14);
}

/** bali_dalem: { c [x, z], y, turns (0 | −1 ...), w (half the width), d (half the depth) } */
export function dalem(el, ctx0) {
  const c = el.c, [cx, cz] = c, y = el.y ?? 0, HW = el.w ?? 8.75, HD = el.d ?? 12.75, rise = 0.4;
  const ctx = turned(ctx0, c, el.turns ?? 0);
  const rand = rng(el.seed ?? 31), g = 3.6, cb = g / 2 + 4.4;
  const wl = (a, b, gaps) => wall({ a: [cx + a[0], cz + a[1]], b: [cx + b[0], cz + b[1]], y, h: 2.6, th: 0.6, mat: 'brick', cap: 'stone', gaps }, ctx);
  wl([-HW, HD], [-cb, HD]); wl([cb, HD], [HW, HD]); wl([-HW, -HD], [HW, -HD]); wl([-HW, -HD], [-HW, HD]); wl([HW, -HD], [HW, HD]);
  candiBentar({ c: [cx, cz + HD], gap: g, y, depth: 3.6, rise }, ctx);
  // the court, raised a little above the street: a floor of beaten earth and flags before the shrines
  bx(ctx, 'ground', cx - HW + 0.3, y - 0.3, cz - HD + 0.3, cx + HW - 0.3, y + rise - 0.02, cz + HD - 1.8);
  ctx.col.floor([cx - HW + 0.3, cz - HD + 0.3, cx + HW - 0.3, cz + HD - 1.8], y + rise);
  bx(ctx, 'sandstone_floor', cx - 3, y + rise - 0.02, cz - 1, cx + 3, y + rise + 0.015, cz + HD - 1.8);        // the paved way from the gate into the court
  const f = y + rise;
  // the holy end (north): the gedong of Durga, the rong tiga at its left, the taksu at its right, the padmasana behind the shrines' row
  shrine({ c: [cx, cz - HD + 2.6], y: f, kind: 'gedong', face: 's' }, ctx);
  shrine({ c: [cx - 5.6, cz - HD + 2.2], y: f, kind: 'rongtiga', face: 's' }, ctx);
  shrine({ c: [cx + 5.6, cz - HD + 2.0], y: f, kind: 'taksu', face: 's' }, ctx);
  padmasana({ c: [cx + 6.0, cz - HD + 5.6], y: f, s: 0.6 }, ctx);
  // Rangda on her plinth under the banyan's side, and the poleng at the gedong
  rangda(ctx, cx - 5.4, cz - 4.2, f);
  for (const [x, z] of [[-6.4, -2.8], [-4.4, -2.8], [-5.4, -2.5]]) canang(ctx, cx + x, f, cz + z, Math.floor(rand() * 4));
  // the bales: the open pavilion of the offerings (west) and of the village's gathering (east), the kulkul at the front corner
  bale({ rect: [cx - 8.2, cz - 0.6, cx - 3.4, cz + 3.4], y: f, floor: 0.5, h: 2.3, bays: [2, 1], walls: 'back', stairs: 'e', furnish: 'tray', roof: 'palm', gold: true, seed: 41 }, ctx);
  bale({ rect: [cx + 3.4, cz - 0.6, cx + 8.2, cz + 3.4], y: f, floor: 0.5, h: 2.3, bays: [2, 1], walls: 'back', stairs: 'w', furnish: 'mats', roof: 'thatch', seed: 42 }, ctx);
  kulkul({ c: [cx + 5.6, cz + 7.6], y: f, a: 1.2, h: 4.0 }, ctx);
  for (const [x, z] of [[-2, 4], [0, 5], [2, 4], [-1, -3], [1, -3]]) canang(ctx, cx + x, f + 0.005, cz + z, Math.floor(rand() * 4));
  void box; void lathe; void coping;
}
