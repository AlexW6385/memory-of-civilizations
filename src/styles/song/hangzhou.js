// Southern Song Lin'an on the Qiantang (docs/settlements/song-hangzhou.md §10): the coloured
// curtained stands that the great houses put up along the river below the Liuhe Pagoda for the tide.

import { rod, box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, column, beamTris } from '../ming/index.js';
import { hexa } from './kaifeng.js';

/**
 * view_tent: a stand for watching the bore { at, y, w (along x), d (along z), h, cloth, trim, open ('s' |
 * 'n': the side toward the river) }: four poles and a ridge pole, a pitched cloth roof with a valance,
 * a curtain across the back and half curtains at the sides, open toward the water.
 */
function viewTent(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, w = (el.w ?? 4) / 2, d = (el.d ?? 3) / 2, h = el.h ?? 2.4, c = el.cloth ?? 'cloth_red', tr = el.trim ?? 'cloth_ochre';
  const sb = el.open === 'n' ? 1 : -1;                               // the back's side (z sign)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bag.add('timber', rod([x + sx * w, y, z + sz * d], [x + sx * w, y + h, z + sz * d], 0.05, 6)); col.circle(x + sx * w, z + sz * d, 0.08, y, y + h); }
  for (const sx of [-1, 1]) bag.add('timber', rod([x + sx * w, y + h, z], [x + sx * w, y + h + 0.9, z], 0.045, 6));
  bag.add('timber', rod([x - w - 0.15, y + h + 0.9, z], [x + w + 0.15, y + h + 0.9, z], 0.05, 6));
  // the roof: two slopes of cloth over the ridge, a little past the poles; the valance hanging round it
  const roof = [], val = [], cur = [], o = 0.25;
  for (const sz of [-1, 1]) {
    const a = [x - w - o, y + h + 0.9 + 0.03, z + sz * 0.02], b = [x + w + o, y + h + 0.9 + 0.03, z + sz * 0.02], e0 = [x + w + o, y + h - 0.12, z + sz * (d + o)], e1 = [x - w - o, y + h - 0.12, z + sz * (d + o)];
    hexa(roof, [[a[0], a[1] - 0.03, a[2]], [b[0], b[1] - 0.03, b[2]], [e0[0], e0[1] - 0.03, e0[2]], [e1[0], e1[1] - 0.03, e1[2]], a, b, e0, e1]);
    hexa(val, [[x - w - o, y + h - 0.42, z + sz * (d + o)], [x + w + o, y + h - 0.42, z + sz * (d + o)], [x + w + o, y + h - 0.42, z + sz * (d + o + 0.02)], [x - w - o, y + h - 0.42, z + sz * (d + o + 0.02)], [x - w - o, y + h - 0.1, z + sz * (d + o)], [x + w + o, y + h - 0.1, z + sz * (d + o)], [x + w + o, y + h - 0.1, z + sz * (d + o + 0.02)], [x - w - o, y + h - 0.1, z + sz * (d + o + 0.02)]]);
  }
  // the back curtain from the roof's edge to the ground, half curtains at the sides
  const zb = z + sb * (d + 0.06);
  hexa(cur, [[x - w, y, zb - 0.015], [x + w, y, zb - 0.015], [x + w, y, zb + 0.015], [x - w, y, zb + 0.015], [x - w, y + h - 0.15, zb - 0.015], [x + w, y + h - 0.15, zb - 0.015], [x + w, y + h - 0.15, zb + 0.015], [x - w, y + h - 0.15, zb + 0.015]]);
  for (const sx of [-1, 1]) { const xs = x + sx * (w + 0.06), z0 = z + sb * d, z1 = z; hexa(cur, [[xs - 0.015, y + 0.6, Math.min(z0, z1)], [xs + 0.015, y + 0.6, Math.min(z0, z1)], [xs + 0.015, y + 0.6, Math.max(z0, z1)], [xs - 0.015, y + 0.6, Math.max(z0, z1)], [xs - 0.015, y + h - 0.15, Math.min(z0, z1)], [xs + 0.015, y + h - 0.15, Math.min(z0, z1)], [xs + 0.015, y + h - 0.15, Math.max(z0, z1)], [xs - 0.015, y + h - 0.15, Math.max(z0, z1)]]); }
  bag.add(c, fromTriangles(roof)); bag.add(tr, fromTriangles(val)); bag.add(c, fromTriangles(cur));
}

/**
 * tea_house: a tea house of Lin'an on the street { rect, y, seed } (its front to the south, +z): as
 * Mengliang lu describes them — "flowers of the four seasons set out, paintings by famous hands hung
 * up, to adorn the shop", "flower racks with rare pines and junipers on them". A stone plinth and
 * paved floor; white side and back walls; the front open between red-brown posts under a beam with a
 * lattice valance; a gable roof of dark tiles. Inside: three hanging scrolls of ink landscapes on the
 * back wall over a long table with vases of flowers (plum branches in blossom); the counter at the
 * east wall with a brazier and its copper kettle and shelves of black tea bowls on red lacquer stands;
 * a stepped flower rack of potted pines by the door. The tea tables and the customers are placed
 * with the life (tea_table).
 */
function teaHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, Y = y + 0.45, H = 3.6, L = x1 - x0, fz = z1 - 0.6, rand = rnd(el.seed ?? 1);
  // the plinth and the floor (the front step 0.6 m wide before the posts)
  bag.add('granite_block', box(x0, y - 0.4, z0, x1, Y - 0.04, z1));
  bag.add('brick_paving', box(x0 + 0.02, Y - 0.04, z0 + 0.02, x1 - 0.02, Y, z1 - 0.02));
  col.floor([x0, z0, x1, z1], Y);
  // the walls
  for (const r of [[x0, z0, x0 + 0.25, fz], [x1 - 0.25, z0, x1, fz], [x0 + 0.25, z0, x1 - 0.25, z0 + 0.25]]) { bag.add('plaster_white', box(r[0], Y, r[1], r[2], Y + H, r[3])); bag.add('plaster_grey', box(r[0] - 0.01, Y, r[1] - 0.01, r[2] + 0.01, Y + 0.35, r[3] + 0.01)); col.rect(r, Y, Y + H); }
  // the front: posts, the beam, the lattice valance in each bay
  const nb = L > 8 ? 3 : 2, xs = Array.from({ length: nb + 1 }, (_, i) => x0 + 0.13 + (L - 0.26) * i / nb);
  for (const x of xs) column(bag, col, x, fz, Y, H - 0.35, 0.26, 'lacquer_chestnut', true);
  bag.add('lacquer_chestnut', box(x0, Y + H - 0.4, fz - 0.12, x1, Y + H, fz + 0.12));
  for (let i = 0; i < nb; i++) {
    const a = xs[i] + 0.14, b = xs[i + 1] - 0.14, lt = [];
    bag.add('lacquer_chestnut', box(a, Y + H - 0.78, fz - 0.03, b, Y + H - 0.73, fz + 0.03));
    for (let u = a + 0.1; u < b - 0.05; u += 0.16) beamTris(lt, [u, Y + H - 0.73, fz], [u, Y + H - 0.4, fz], 0.025, 0.025);
    for (const yy of [Y + H - 0.62, Y + H - 0.51]) beamTris(lt, [a, yy, fz], [b, yy, fz], 0.025, 0.025);
    bag.add('lattice_red', fromTriangles(lt));
  }
  // the roof: a gable roof along the street, the gable boards over the side walls
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, D = z1 - z0;
  rectRoof({ c: [cx, cz], A: L / 2 + 0.25, B: D / 2 + 0.55, y: Y + H - 0.05, rise: D * 0.3, kind: 'gable', sweep: 0.15, mat: 'tile_dark', soffit: 'timber', p: 1.4 }, bag);
  for (const x of [x0, x1 - 0.25]) { const t = [], top = Y + H + D * 0.3 - 0.25; t.push(x, Y + H, z0 + 0.25, x, Y + H, fz, x, top, cz, x + 0.25, Y + H, z0 + 0.25, x + 0.25, top, cz, x + 0.25, Y + H, fz); bag.add('plaster_white', fromTriangles(t.concat([x, Y + H, z0 + 0.25, x + 0.25, Y + H, z0 + 0.25, x + 0.25, top, cz, x, Y + H, z0 + 0.25, x + 0.25, top, cz, x, top, cz, x, Y + H, fz, x, top, cz, x + 0.25, top, cz, x, Y + H, fz, x + 0.25, top, cz, x + 0.25, Y + H, fz]))); }
  // the back wall: the long table, the vases with plum branches, three hanging scrolls of landscapes
  const bz = z0 + 0.25, tl = Math.min(3.2, L - 3.2), tx = cx - 0.6;
  bag.add('lacquer_chestnut', box(tx - tl / 2, Y + 0.84, bz + 0.05, tx + tl / 2, Y + 0.9, bz + 0.5));
  for (const sx of [-1, 1]) for (const zz of [bz + 0.08, bz + 0.42]) bag.add('lacquer_chestnut', box(tx + sx * (tl / 2 - 0.06) - 0.03, Y, zz - 0.03, tx + sx * (tl / 2 - 0.06) + 0.03, Y + 0.84, zz + 0.03));
  col.rect([tx - tl / 2, bz, tx + tl / 2, bz + 0.5], Y, Y + 0.9);
  for (const k of [-1, 0, 1]) {
    const px = tx + k * tl / 3, py = Y + 1.35;
    bag.add('stucco_cream', box(px - 0.32, py, bz + 0.005, px + 0.32, py + 1.7, bz + 0.02));
    bag.add('paint_white', box(px - 0.25, py + 0.25, bz + 0.02, px + 0.25, py + 1.3, bz + 0.03));
    // the landscape: peaks rising from mist, in ink
    // three ranges: the far peaks pale and tall, the middle ones grey, the near bank dark and low, mist between
    for (const [mat, yb, top, n, d] of [['plaster_grey', py + 0.62, 0.6, 4, 0.032], ['slate', py + 0.45, 0.38, 6, 0.036], ['lacquer_black', py + 0.27, 0.16, 9, 0.04]]) {
      const ink = [], xs2 = [];
      for (let m = 0; m <= n; m++) xs2.push([px - 0.24 + 0.48 * m / n, yb + (m === 0 || m === n ? 0.02 : (0.3 + 0.7 * rand()) * top)]);
      for (let m = 0; m < n; m++) { const [ax, ay] = xs2[m], [bx2, by] = xs2[m + 1], mx = (ax + bx2) / 2 + (rand() - 0.5) * 0.02, my = Math.max(ay, by) * 0.5 + Math.min(ay, by) * 0.5 - rand() * 0.04; ink.push(ax, yb, bz + d, bx2, yb, bz + d, bx2, by, bz + d, ax, yb, bz + d, bx2, by, bz + d, mx, my, bz + d, ax, yb, bz + d, mx, my, bz + d, ax, ay, bz + d); }
      bag.add(mat, fromTriangles(ink));
    }
    bag.add('wood_dark', lathe([[0.018, -0.36], [0.018, 0.36]], 6).rotateZ(Math.PI / 2).translate(px, py - 0.01, bz + 0.03));
    bag.add('wood_dark', box(px - 0.33, py + 1.69, bz + 0.005, px + 0.33, py + 1.73, bz + 0.03));
    bag.add('iron', box(px - 0.006, py + 1.73, bz + 0.005, px + 0.006, Y + H - 0.2, bz + 0.015));
  }
  for (const k of [-1, 1]) {
    const vx = tx + k * tl * 0.33, vz = bz + 0.27, vy = Y + 0.9;
    bag.add(k < 0 ? 'glaze_white' : 'glaze_green', lathe([[0.001, 0], [0.07, 0], [0.11, 0.08], [0.1, 0.2], [0.04, 0.3], [0.035, 0.36], [0.05, 0.4], [0.001, 0.4]], 12, null, vx, vy, vz));
    const tw = [], fl = [];
    for (let b = 0; b < 4; b++) {
      const a = b * 1.7 + rand(), tip = [vx + Math.cos(a) * (0.25 + rand() * 0.2), vy + 0.75 + rand() * 0.35, vz + Math.sin(a) * 0.12];
      const mid = [vx + Math.cos(a) * 0.1, vy + 0.55, vz + Math.sin(a) * 0.05];
      tw.push(rod([vx, vy + 0.36, vz], mid, 0.008, 4), rod(mid, tip, 0.006, 4));
      for (let f = 0; f < 4; f++) { const t = 0.3 + f * 0.22, p = [mid[0] + (tip[0] - mid[0]) * t, mid[1] + (tip[1] - mid[1]) * t + 0.02, mid[2] + (tip[2] - mid[2]) * t + 0.015]; fl.push(lathe([[0.001, -0.012], [0.018, 0], [0.001, 0.012]], 5, null, ...p)); }
    }
    for (const g of tw) bag.add('bark_dark', g);
    for (const g of fl) bag.add(k < 0 ? 'cloth_white' : 'cloth_red', g);
  }
  // the counter along the east wall: a brazier with its kettle, the tea bowls on their stands, the shelf above
  const ex = x1 - 0.25, cz0 = bz + 0.6, cz1 = fz - 1.6;
  if (cz1 - cz0 > 1.5) {
    bag.add('wood_dark', box(ex - 0.6, Y, cz0, ex, Y + 0.95, cz1)); bag.add('lacquer_chestnut', box(ex - 0.65, Y + 0.95, cz0 - 0.03, ex, Y + 1.0, cz1 + 0.03));
    col.rect([ex - 0.65, cz0, ex, cz1], Y, Y + 1.0);
    const bx = ex - 0.32, bzz = cz1 - 0.35;
    bag.add('terracotta', lathe([[0.001, 0], [0.13, 0], [0.16, 0.12], [0.15, 0.2], [0.12, 0.22], [0.001, 0.22]], 10, null, bx, Y + 1.0, bzz));
    bag.add('bronze', lathe([[0.001, 0], [0.08, 0.01], [0.11, 0.08], [0.1, 0.15], [0.05, 0.19], [0.03, 0.22], [0.001, 0.22]], 12, null, bx, Y + 1.22, bzz));
    bag.add('bronze', rod([bx - 0.09, Y + 1.32, bzz], [bx - 0.2, Y + 1.42, bzz], 0.012, 5));
    bag.add('bronze', rod([bx - 0.06, Y + 1.43, bzz], [bx + 0.06, Y + 1.43, bzz], 0.008, 4));
    for (let j = 0; cz0 + 0.3 + j * 0.24 < bzz - 0.35; j++) for (let s2 = 0; s2 < 2; s2++) {
      const z = cz0 + 0.3 + j * 0.24, x = ex - 0.45 + s2 * 0.22;
      bag.add('lacquer_red', lathe([[0.001, 0], [0.045, 0], [0.04, 0.03], [0.06, 0.035], [0.06, 0.045], [0.001, 0.045]], 10, null, x, Y + 1.0, z));
      bag.add('pottery_dark', lathe([[0.001, 0], [0.025, 0], [0.04, 0.025], [0.06, 0.06], [0.055, 0.065], [0.001, 0.02]], 10, null, x, Y + 1.045, z));
    }
    // the shelf of bowls over the counter
    for (const hh of [1.75, 2.25]) {
      bag.add('wood_dark', box(ex - 0.32, Y + hh - 0.04, cz0, ex, Y + hh, cz1));
      for (let z = cz0 + 0.12; z < cz1 - 0.1; z += 0.14) bag.add(hh > 2 ? 'glaze_white' : 'pottery_dark', lathe([[0.001, 0], [0.025, 0], [0.04, 0.025], [0.06, 0.06], [0.055, 0.065], [0.001, 0.02]], 8, null, ex - 0.16, Y + hh, z));
    }
  }
  // the flower rack by the door (inside the west post): three steps of boards, potted pines on them
  {
    const rx0 = x0 + 0.35, rx1 = x0 + 1.55, rz = fz - 0.55;
    for (const [i, hh] of [[0, 0.35], [1, 0.75], [2, 1.15]]) {
      const zz = rz - i * 0.32;
      bag.add('wood_dark', box(rx0, Y + hh - 0.04, zz - 0.15, rx1, Y + hh, zz + 0.15));
      for (const sx of [rx0 + 0.03, rx1 - 0.06]) bag.add('wood_dark', box(sx, Y, zz - 0.13, sx + 0.04, Y + hh, zz - 0.09));
      for (let j = 0; j < 3; j++) {
        const px = rx0 + 0.2 + j * 0.4, py = Y + hh;
        bag.add(j % 2 ? 'glaze_blue' : 'terracotta', lathe([[0.001, 0], [0.08, 0], [0.1, 0.11], [0.11, 0.12], [0.001, 0.12]], 10, null, px, py, zz));
        const lean = (rand() - 0.5) * 0.3;
        bag.add('bark_pine', rod([px, py + 0.1, zz], [px + lean, py + 0.38, zz], 0.018, 5));
        for (let c = 0; c < 3; c++) bag.add('lotus_leaf', lathe([[0.001, 0], [0.09 - c * 0.02, 0.01], [0.07 - c * 0.02, 0.05], [0.001, 0.06]], 7, null, px + lean * (0.6 + c * 0.25) + (c - 1) * 0.06, py + 0.3 + c * 0.07, zz));
      }
    }
    col.rect([rx0, rz - 0.8, rx1, rz + 0.15], Y, Y + 1.3);
  }
}
function rnd(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const HANGZHOU_ELEMENTS = { view_tent: viewTent, tea_house: teaHouse };
