// The rooms and courts of the Tang houses (docs/settlements/tang-changan.md §11): the furnished halls of the courtyard houses in several kinds
// (the master's dais, a study, a bedroom with its bed-platform and screen, a dining hall with its stove, a weaver's room, a store), the
// wings (kitchen, store), the one-room hut of earth, and the dressing of a court (well, vats, woodpile, washing, rockery, stable lean-to).
// All in the hall's own frame (facing +z, the door in the front wall at x = 0), floor at `y`, the hall w × d (its column grid).

import { box, lathe } from '../../core/geom.js';
import { rng } from './kit.js';

const jar = (bag, x, y, z, r, h, mat) => bag.add(mat, lathe([[0.001, 0], [r * 0.7, 0], [r, h * 0.38], [r * 0.9, h * 0.72], [r * 0.5, h * 0.93], [r * 0.55, h], [0.001, h]], 9, null, x, y, z));
const cup = (bag, x, y, z, m = 'glaze_white') => bag.add(m, lathe([[0.001, 0], [0.04, 0], [0.055, 0.065], [0.05, 0.065], [0.001, 0.012]], 8, null, x, y, z));
const stool = (L, x, z, y) => {
  const { bag, col } = L;
  bag.add('wood_dark', box(x - 0.22, y + 0.4, z - 0.18, x + 0.22, y + 0.44, z + 0.18)); bag.add('hide_tan', box(x - 0.18, y + 0.44, z - 0.14, x + 0.18, y + 0.46, z + 0.14));
  for (const s of [-1, 1]) bag.add('wood_dark', box(x + s * 0.19 - 0.02, y, z - 0.16, x + s * 0.19 + 0.02, y + 0.4, z + 0.16));
  col.circle(x, z, 0.26, y, y + 0.46);
};
const table = (L, x, z, y, w, d, h, mat = 'lacquer_red') => {
  const { bag, col } = L;
  bag.add(mat, box(x - w / 2, y + h - 0.05, z - d / 2, x + w / 2, y + h, z + d / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('wood_dark', box(x + sx * (w / 2 - 0.07) - 0.03, y, z + sz * (d / 2 - 0.07) - 0.03, x + sx * (w / 2 - 0.07) + 0.03, y + h - 0.05, z + sz * (d / 2 - 0.07) + 0.03));
  col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + h);
};
const solid = (L, mat, x0, y0, z0, x1, y1, z1) => { L.bag.add(mat, box(x0, y0, z0, x1, y1, z1)); L.col.rect([x0, z0, x1, z1], y0, y1); };
const dais = (L, x0, z0, x1, z1, y, h, top = 'reed_mat') => {
  const { bag, col } = L;
  bag.add('wood_dark', box(x0, y, z0, x1, y + h, z1)); bag.add(top, box(x0 + 0.1, y + h, z0 + 0.1, x1 - 0.1, y + h + 0.025, z1 - 0.1));
  col.rect([x0, z0, x1, z1], y, y + h); col.floor([x0, z0, x1, z1], y + h + 0.025);
};
const lamp = (L, x, y, z, light) => {
  L.bag.add('wood_dark', box(x - 0.03, y, z - 0.03, x + 0.03, y + 1.3, z + 0.03)); L.bag.add('lamp_paper', box(x - 0.11, y + 1.3, z - 0.11, x + 0.11, y + 1.56, z + 0.11));
  if (light) L.lights.push({ at: [x, y + 1.4, z], color: '#ffb46b', intensity: 2.0, distance: 7 });
};
const books = (bag, x0, x1, y, z, rand) => { for (let x = x0; x < x1 - 0.1; x += 0.11) bag.add(rand() < 0.65 ? 'paint_white' : 'cloth_indigo', box(x, y, z, x + 0.09, y + 0.22 + rand() * 0.06, z + 0.26)); };

/** The kinds of room: 'study' | 'bedroom' | 'dining' | 'weaver' | 'store' | 'kitchen' (wings) — { w, d, y, seed, light }. */
export function furnishRoom(L, kind, o) {
  const { bag, col } = L, { w, d, y } = o, rand = rng((o.seed || 1) + 7), hx = w / 2 - 0.45, z0 = -d / 2 + 0.3, side = rand() < 0.5 ? -1 : 1;
  const clr = (x) => Math.abs(x) > 1.5;       // the door's axis is kept clear
  void clr;
  if (kind === 'study') {
    solid(L, 'wood_dark', side * hx - 2.0 + 0.0, y, z0, side * hx + 0.0 - 0.0 + (side > 0 ? 0 : 0), y + 1.9, z0 + 0.45);
    for (const yy of [0.35, 0.95, 1.55]) books(bag, Math.min(side * hx - 2.0, side * hx) + 0.1, Math.max(side * hx - 2.0, side * hx) - 0.1, y + yy, z0 + 0.1, rand);
    dais(L, -side * 3.6, z0 + 0.2, -side * 0.6, z0 + 2.8, y, 0.28);
    const tx = -side * 2.1, tz = z0 + 1.4;
    table(L, tx, tz, y + 0.28, 1.3, 0.62, 0.4, 'lacquer_black');
    bag.add('slate', box(tx - 0.45, y + 0.68, tz - 0.1, tx - 0.25, y + 0.71, tz + 0.1)); bag.add('paint_white', box(tx - 0.1, y + 0.68, tz - 0.2, tx + 0.35, y + 0.685, tz + 0.2));
    bag.add('bamboo_culm', lathe([[0.05, 0], [0.055, 0.16], [0.001, 0.16]], 8, null, tx + 0.5, y + 0.68, tz - 0.15));
    bag.add('cloth_maroon', box(tx - 0.3, y + 0.28, tz + 0.55, tx + 0.3, y + 0.34, tz + 1.2));
    bag.add('paint_white', box(side * (hx - 1.0) - 0.45, y + 1.1, -d / 2 + 0.2, side * (hx - 1.0) + 0.45, y + 2.4, -d / 2 + 0.23)); bag.add('cloth_black', box(side * (hx - 1.0) - 0.5, y + 1.05, -d / 2 + 0.2, side * (hx - 1.0) + 0.5, y + 1.1, -d / 2 + 0.24));
    bag.add('bronze', lathe([[0.001, 0], [0.2, 0.0], [0.26, 0.2], [0.001, 0.22]], 10, null, side * (hx - 0.6), y, z0 + 2.6));
    stool(L, side * 1.9, 0.4, y); lamp(L, -side * (hx - 0.2), y, z0 + 3.4, o.light);
  } else if (kind === 'bedroom') {
    dais(L, -side * hx, z0, -side * (hx - 2.6), z0 + 3.4, y, 0.42, 'cloth_white');
    bag.add(['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_maroon'][Math.floor(rand() * 4)], box(Math.min(-side * hx, -side * (hx - 2.6)) + 0.15, y + 0.46, z0 + 0.9, Math.max(-side * hx, -side * (hx - 2.6)) - 0.15, y + 0.58, z0 + 3.3));
    bag.add('lacquer_red', box(Math.min(-side * hx, -side * (hx - 2.6)), y + 0.42, z0 - 0.1, Math.max(-side * hx, -side * (hx - 2.6)), y + 1.9, z0)); bag.add('paint_ochre', box(Math.min(-side * hx, -side * (hx - 2.6)) + 0.15, y + 0.7, z0, Math.max(-side * hx, -side * (hx - 2.6)) - 0.15, y + 1.75, z0 + 0.02));
    solid(L, 'lacquer_black', side * hx - 1.4 * (side > 0 ? 1 : 0) - (side < 0 ? 0 : 0), y, z0, side * hx + 1.4 * (side < 0 ? 1 : 0), y + 1.6, z0 + 0.6);
    solid(L, 'lacquer_black', -side * 1.0 - 0.45, y, z0 + 0.1, -side * 1.0 + 0.45, y + 0.5, z0 + 1.0);
    table(L, side * 2.2, z0 + 1.6, y, 0.8, 0.5, 0.74, 'lacquer_red');
    bag.add('bronze', box(side * 2.2 - 0.15, y + 0.74, z0 + 1.45, side * 2.2 + 0.15, y + 1.2, z0 + 1.47)); bag.add('wood_dark', box(side * 2.2 - 0.02, y + 0.74, z0 + 1.4, side * 2.2 + 0.02, y + 1.1, z0 + 1.5));
    stool(L, side * 2.2, z0 + 2.4, y); lamp(L, side * (hx - 0.3), y, z0 + 3.3, o.light);
    bag.add('reed_mat', box(-1.2, y, -0.2, 1.2, y + 0.02, 1.4));
  } else if (kind === 'dining') {
    dais(L, -3.2, z0 + 0.2, 3.2, z0 + 3.4, y, 0.3);
    for (const x of [-1.7, 1.7]) {
      table(L, x, z0 + 1.8, y + 0.3, 1.5, 0.65, 0.38, 'lacquer_red');
      for (let k = 0; k < 4; k++) cup(bag, x - 0.5 + k * 0.3, y + 0.68, z0 + 1.8 + (k % 2 ? 0.1 : -0.1), k % 2 ? 'glaze_green' : 'glaze_white');
      for (const sx of [-1, 1]) bag.add(sx < 0 ? 'cloth_ochre' : 'cloth_indigo', box(x + sx * 1.1 - 0.3, y + 0.3, z0 + 1.5, x + sx * 1.1 + 0.3, y + 0.38, z0 + 2.1));
    }
    solid(L, 'mud_plaster', side * (hx - 0.9), y, z0, side * hx, y + 0.9, z0 + 0.9); bag.add('iron', lathe([[0.001, 0], [0.26, 0.04], [0.32, 0.2], [0.28, 0.24], [0.001, 0.24]], 10, null, side * (hx - 0.45), y + 0.9, z0 + 0.45));
    jar(bag, side * (hx - 0.4), y, z0 + 1.5, 0.3, 0.7, 'pottery_dark'); jar(bag, side * (hx - 0.4), y, z0 + 2.2, 0.22, 0.55, 'terracotta');
    solid(L, 'wood_dark', -side * (hx - 0.1) - 1.0, y, z0, -side * (hx - 0.1) + 0.0, y + 1.6, z0 + 0.35);
    lamp(L, -side * 3.7, y + 0.3, z0 + 2.9, o.light);
  } else if (kind === 'weaver') {
    const lx = side * 2.6, lz = z0 + 1.7;
    for (const s of [-1, 1]) solid(L, 'wood_dark', lx + s * 0.9 - 0.06, y, lz - 0.06, lx + s * 0.9 + 0.06, y + 1.5, lz + 0.06);
    bag.add('wood_dark', box(lx - 0.95, y + 1.4, lz - 0.08, lx + 0.95, y + 1.5, lz + 0.08)); bag.add('wood_dark', box(lx - 0.95, y + 0.35, lz - 0.7, lx + 0.95, y + 0.4, lz - 0.62));
    bag.add('cloth_white', box(lx - 0.8, y + 0.4, lz - 0.02, lx + 0.8, y + 1.4, lz + 0.02)); bag.add(['cloth_red', 'cloth_indigo', 'cloth_ochre'][Math.floor(rand() * 3)], box(lx - 0.8, y + 0.4, lz - 0.025, lx + 0.8, y + 0.8, lz + 0.025));
    bag.add('wood_dark', box(lx - 0.5, y + 0.38, lz + 0.8, lx + 0.5, y + 0.44, lz + 1.3)); col.rect([lx - 0.5, lz + 0.8, lx + 0.5, lz + 1.3], y, y + 0.44);
    // the spinning wheel (a wheel on a frame) and the baskets of fibre; the bolts of cloth stacked on a shelf
    bag.add('wood_dark', lathe([[0.001, 0], [0.34, 0], [0.34, 0.03], [0.001, 0.03]], 14, null, -side * 2.4, y + 0.5, z0 + 1.2));
    solid(L, 'wood_dark', -side * 2.4 - 0.4, y, z0 + 1.0, -side * 2.4 + 0.4, y + 0.5, z0 + 1.4);
    for (let k = 0; k < 3; k++) bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.2, 0.2], [0.001, 0.03]], 10, null, -side * (1.0 + k * 0.5), y, z0 + 2.4));
    solid(L, 'wood_dark', -side * (hx - 0.1) - 0.8, y, z0, -side * (hx - 0.1) + 0.0, y + 1.9, z0 + 0.4);
    for (let k = 0; k < 6; k++) bag.add(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'][k % 5], box(-side * (hx - 0.1) - 0.75 + (k % 3) * 0.25, y + 0.5 + Math.floor(k / 3) * 0.7, z0 + 0.4, -side * (hx - 0.1) - 0.55 + (k % 3) * 0.25, y + 0.9 + Math.floor(k / 3) * 0.7, z0 + 0.7));
    stool(L, side * 2.6, z0 + 2.9, y);
  } else {   // 'store' and 'kitchen'
    const kitchen = kind === 'kitchen';
    for (let k = 0; k < 4; k++) jar(bag, -hx + 0.4 + k * 0.78, y, z0 + 0.5, 0.3 + (k % 2) * 0.05, 0.78 + (k % 3) * 0.08, k % 2 ? 'pottery_dark' : 'terracotta');
    for (let k = 0; k < 3; k++) jar(bag, -hx + 0.35 + k * 0.7, y, z0 + 1.3, 0.22, 0.55, 'pottery_dark');
    for (let k = 0; k < 4; k++) { const sx = side * (hx - 0.5 - (k % 2) * 0.6), sz = z0 + 0.5 + Math.floor(k / 2) * 0.55; bag.add('sacking', lathe([[0.001, 0], [0.26, 0.04], [0.3, 0.2], [0.18, 0.5], [0.001, 0.54]], 8, null, sx, y, sz)); }
    if (kitchen) { solid(L, 'mud_plaster', -0.9, y, z0, 0.9, y + 0.85, z0 + 1.0); bag.add('iron', lathe([[0.001, 0], [0.3, 0.04], [0.36, 0.22], [0.001, 0.26]], 10, null, -0.4, y + 0.85, z0 + 0.5)); bag.add('iron', lathe([[0.001, 0], [0.26, 0.04], [0.3, 0.2], [0.001, 0.22]], 10, null, 0.4, y + 0.85, z0 + 0.5)); bag.add('bark_pine', box(-0.7, y, z0 + 1.1, 0.7, y + 0.3, z0 + 1.5)); table(L, side * 2.6, z0 + 2.3, y, 1.4, 0.8, 0.8, 'wood_dark'); bag.add('wicker', lathe([[0.22, 0], [0.3, 0.12], [0.001, 0.12]], 10, null, side * 2.6, y + 0.8, z0 + 2.3)); }
    else { solid(L, 'wood_dark', side * (hx - 0.1) - 1.6, y, z0 + 1.3, side * (hx - 0.1), y + 1.0, z0 + 1.7); for (let k = 0; k < 4; k++) bag.add('wicker', box(side * (hx - 0.1) - 1.5 + k * 0.38, y + 1.0, z0 + 1.35, side * (hx - 0.1) - 1.2 + k * 0.38, y + 1.3, z0 + 1.65)); }
  }
}

/** The room of a hut of earth (walkable; w × d inside): the bed platform with its straw mat, the stove by the door, jars, firewood, a lamp. */
export function furnishHut(L, o) {
  const { bag, col } = L, { w, d, y } = o, rand = rng((o.seed || 1) + 3), s = rand() < 0.5 ? -1 : 1, hx = w / 2 - 0.25, bz = -d / 2 + 0.25;
  solid(L, 'mud_plaster', s * hx - 1.8 * s, y, bz, s * hx, y + 0.5, bz + 1.5); bag.add('reed_mat', box(Math.min(s * hx, s * hx - 1.8 * s) + 0.05, y + 0.5, bz + 0.05, Math.max(s * hx, s * hx - 1.8 * s) - 0.05, y + 0.53, bz + 1.45));
  bag.add('cloth_brown', box(Math.min(s * hx, s * hx - 1.8 * s) + 0.2, y + 0.53, bz + 0.1, Math.min(s * hx, s * hx - 1.8 * s) + 0.9, y + 0.62, bz + 1.0));
  solid(L, 'mud_plaster', -s * hx + 0.0, y, bz, -s * hx + s * 0.8, y + 0.8, bz + 0.8); bag.add('iron', lathe([[0.001, 0], [0.22, 0.03], [0.26, 0.16], [0.001, 0.18]], 8, null, -s * hx + s * 0.4, y + 0.8, bz + 0.4));
  jar(bag, -s * 0.2, y, bz + 0.35, 0.25, 0.6, 'pottery_dark'); jar(bag, -s * 0.8, y, bz + 0.3, 0.2, 0.5, 'terracotta');
  bag.add('bark_pine', box(-s * hx + s * 0.9, y, bz + 0.1, -s * hx + s * 1.5, y + 0.4, bz + 0.7));
  bag.add('lamp_paper', box(-0.1, y + 1.1, bz + 0.05, 0.1, y + 1.3, bz + 0.2));
  void col;
}

/**
 * The dressing of a court in the house's frame (facing +z, the gate in the front wall at x = gx, z = D / 2; the hall in the back):
 * { W, D, gx, hz, hd, kind, det, seed }. The path of brick, a well with its frame and bucket, vats, a woodpile, washing on a line,
 * for the mansions a rockery and a stone table, a stable lean-to; the gate's lanterns.
 */
export function courtDress(L, o) {
  const { bag, col } = L, { W, D, gx, hz, hd, kind, det } = o, rand = rng((o.seed || 1) + 41), sx = gx > 0 ? -1 : 1;
  const zf = hz + hd / 2 + 1.0, zm = (zf + D / 2) / 2;
  const path = (x0, z0, x1, z1) => bag.add('brick_grey', box(Math.min(x0, x1), 0, Math.min(z0, z1), Math.max(x0, x1), 0.025, Math.max(z0, z1)));
  path(gx - 0.8, zm - 0.8, gx + 0.8, D / 2 - 0.2); path(Math.min(gx, 0) - 0.8, zm - 0.8, Math.max(gx, 0) + 0.8, zm + 0.8); path(-0.8, zf, 0.8, zm + 0.8);
  if (det < 1) return;
  const cx = sx * Math.max(3, W * 0.28);
  // the well: a curb of stone, the frame with its windlass and the bucket
  const wz = zm + 0.4 + (rand() - 0.5) * 3;
  bag.add('granite_block', lathe([[0.55, 0], [0.9, 0], [0.9, 0.62], [0.55, 0.62], [0.55, 0]], 12, null, cx, 0, wz)); bag.add('water', lathe([[0.001, 0.36], [0.55, 0.36], [0.55, 0.37], [0.001, 0.37]], 10, null, cx, 0, wz)); col.circle(cx, wz, 0.9, 0, 0.62);
  for (const s of [-1, 1]) bag.add('timber', box(cx + s * 0.78 - 0.05, 0.6, wz - 0.05, cx + s * 0.78 + 0.05, 1.9, wz + 0.05));
  bag.add('timber', box(cx - 0.85, 1.85, wz - 0.06, cx + 0.85, 1.95, wz + 0.06)); bag.add('wood_dark', lathe([[0.001, 0], [0.12, 0], [0.14, 0.2], [0.001, 0.2]], 8, null, cx + 0.3, 0.62, wz + 0.3));
  // vats at the hall's steps, a woodpile at the side wall, a drying rack with a tray of grain
  for (const s of [-1, 1]) bag.add('pottery_dark', lathe([[0.2, 0], [0.34, 0.12], [0.4, 0.34], [0.36, 0.6], [0.001, 0.62]], 10, null, s * 2.4, 0, zf + 0.3));
  const wp = [sx * (W / 2 - 1.0), zf + 1.0 + rand() * 2.5];
  bag.add('bark_pine', box(wp[0] - 0.4, 0, wp[1], wp[0] + 0.4, 1.0, wp[1] + 2.0 + rand())); col.rect([wp[0] - 0.4, wp[1], wp[0] + 0.4, wp[1] + 2.0], 0, 1.0);
  for (let k = 0; k < 4; k++) bag.add('wood_dark', box(wp[0] - 0.4 + (k % 2) * 0.55, 1.0, wp[1] + 0.1 + k * 0.4, wp[0] - 0.2 + (k % 2) * 0.55, 1.12, wp[1] + 0.3 + k * 0.4));
  if (det >= 2 || rand() < 0.5) {
    // the washing: two posts of bamboo, a cord and the cloths (blue, white, ochre) hanging
    const lz = zm + 2.8, lx0 = -sx * 3.0, lx1 = -sx * (3.0 + 4.4);
    for (const x of [lx0, lx1]) bag.add('bamboo_culm', box(x - 0.04, 0, lz - 0.04, x + 0.04, 2.4, lz + 0.04));
    bag.add('rope_fibre', box(Math.min(lx0, lx1), 2.3, lz - 0.01, Math.max(lx0, lx1), 2.33, lz + 0.01));
    for (let k = 0; k < 5; k++) { const x = Math.min(lx0, lx1) + 0.5 + k * 0.78; bag.add(['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_blue', 'cloth_white'][k], box(x, 1.2 + (k % 2) * 0.2, lz - 0.015, x + 0.55, 2.3, lz + 0.015)); }
  }
  if (kind === 'mansion') {
    // the rockery and the stone table in the far corner of the court; the stable lean-to with its trough
    const rx = -sx * (W / 2 - 3.2), rz = zf + 1.6;
    for (const [dx, dz, w2, h2] of [[0, 0, 1.2, 1.9], [0.9, 0.5, 0.8, 1.2], [-0.8, 0.3, 0.7, 1.0], [0.3, -0.7, 0.7, 1.5]]) bag.add('taihu', box(rx + dx - w2 / 2, 0, rz + dz - w2 / 2, rx + dx + w2 / 2, h2, rz + dz + w2 / 2));
    col.rect([rx - 1.2, rz - 1.1, rx + 1.4, rz + 1.1], 0, 1.5);
    bag.add('limestone', box(rx - 0.5, 0.42, rz + 2.0, rx + 0.5, 0.5, rz + 2.8)); bag.add('limestone', box(rx - 0.4, 0, rz + 2.1, rx - 0.25, 0.42, rz + 2.7)); bag.add('limestone', box(rx + 0.25, 0, rz + 2.1, rx + 0.4, 0.42, rz + 2.7));
    const stx = sx * (W / 2 - 1.8), stz = zf + 6.5 + rand() * 2;
    if (stz + 2 < D / 2 - 2) {
      bag.add('wood_dark', box(stx - 0.08, 0, stz - 1.8, stx + 0.08, 2.3, stz - 1.7)); bag.add('wood_dark', box(stx - 0.08, 0, stz + 1.7, stx + 0.08, 2.3, stz + 1.8));
      bag.add('thatch', box(stx - 1.5 * sx - 0.0, 2.2, stz - 1.9, stx + 0.0, 2.5, stz + 1.9)); bag.add('wood_dark', box(stx - 0.5, 0.5, stz - 1.2, stx + 0.5, 0.75, stz + 1.2));
    }
  }
  // the gate's lanterns (on cords from the eaves) and the stone drums of the gate's feet
  for (const s of [-1, 1]) {
    bag.add('wood_dark', box(gx + s * 1.1 - 0.008, 2.5, D / 2 + 0.28, gx + s * 1.1 + 0.008, 2.9, D / 2 + 0.3)); bag.add('lamp_paper', box(gx + s * 1.1 - 0.14, 2.1, D / 2 + 0.16, gx + s * 1.1 + 0.14, 2.5, D / 2 + 0.44));
    bag.add('granite_block', box(gx + s * 1.62 - 0.22, 0, D / 2 + 0.1, gx + s * 1.62 + 0.22, 0.5, D / 2 + 0.54));
  }
}
