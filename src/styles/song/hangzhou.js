// Southern Song Lin'an on the Qiantang (docs/settlements/song-hangzhou.md §10): the coloured
// curtained stands that the great houses put up along the river below the Liuhe Pagoda for the tide.

import { rod, box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, column, beamTris } from '../ming/index.js';
import { hexa } from './kaifeng.js';
import { STYLES } from '../../core/build.js';

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

/**
 * kaihua_hall: the images and things of Kaihua Temple's main hall { rect (the hall), y (its floor) },
 * the hall facing south (docs/settlements/song-hangzhou.md §11): against the north wall a long
 * sumeru platform of grey brick, on it the Buddha of the present in the middle between two
 * attendant Buddhas, each on his lotus throne with his mandorla; before each an altar table of red
 * lacquer, on the middle one a great bronze censer between two candlesticks, flower vases at its
 * ends; before the tables the oil lamps on their tall stands, the kneeling cushions; the bell in its
 * frame on the east and the drum on its stand on the west.
 */
function kaihuaHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, cx = (x0 + x1) / 2;
  const pz0 = z0 + 1.0, pz1 = pz0 + 5.2, ph = 0.95, py = y + ph;
  // the platform: plinth, two mouldings, the waist, two mouldings, the cap
  for (const [a, b, i] of [[0, 0.16, 0], [0.16, 0.26, 0.06], [0.26, 0.7, 0.14], [0.7, 0.8, 0.06], [0.8, 1, 0]]) bag.add('brick_grey', box(cx - 12 + i, y + a * ph, pz0 + i, cx + 12 - i, y + b * ph, pz1 - i));
  col.rect([cx - 12, pz0, cx + 12, pz1], y, py);
  const B = STYLES.chinese.objects.buddha;
  for (const [dx, h] of [[0, 4.6], [-8.5, 3.8], [8.5, 3.8]]) {
    B({ at: [cx + dx, pz0 + 2.4], y: py, h, dir: [0, 1], robe: 'clay_robe', gilt: 'clay_gilt' }, { bag, col });
    // the altar table
    const w = dx ? 2.2 : 3.4, tz = pz1 + 0.35;
    bag.add('lacquer_red', box(cx + dx - w / 2, y + 0.86, tz, cx + dx + w / 2, y + 0.92, tz + 0.75));
    bag.add('lacquer_red', box(cx + dx - w / 2 + 0.05, y, tz + 0.05, cx + dx + w / 2 - 0.05, y + 0.86, tz + 0.7));
    bag.add('cloth_ochre', box(cx + dx - w / 2 + 0.12, y + 0.08, tz + 0.7, cx + dx + w / 2 - 0.12, y + 0.84, tz + 0.715));     // the altar cloth hung over its front
    col.rect([cx + dx - w / 2, tz, cx + dx + w / 2, tz + 0.75], y, y + 0.92);
    const ty = y + 0.92, zc = tz + 0.38;
    bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.18, 0.08], [0.2, 0.2], [0.15, 0.28], [0.17, 0.31], [0.001, 0.31]], 14, null, cx + dx, ty, zc));
    for (const sx of [-1, 1]) {
      bag.add('bronze', lathe([[0.001, 0], [0.08, 0], [0.06, 0.04], [0.018, 0.08], [0.015, 0.4], [0.05, 0.42], [0.05, 0.45], [0.001, 0.45]], 10, null, cx + dx + sx * 0.6, ty, zc));
      bag.add('linen', lathe([[0.02, 0], [0.02, 0.16], [0.001, 0.18]], 8, null, cx + dx + sx * 0.6, ty + 0.45, zc));
      if (!dx) bag.add('glaze_white', lathe([[0.001, 0], [0.06, 0.01], [0.09, 0.12], [0.05, 0.26], [0.04, 0.3], [0.06, 0.34], [0.001, 0.34]], 10, null, cx + sx * 1.35, ty, zc));
    }
    // the kneeling cushions
    bag.add('cloth_ochre', lathe([[0.001, 0], [0.3, 0], [0.32, 0.08], [0.28, 0.16], [0.001, 0.17]], 12, null, cx + dx, y, tz + 1.7));
  }
  // the oil lamps on their stands either side of the middle table
  for (const sx of [-1, 1]) {
    const lx = cx + sx * 2.6, lz = pz1 + 1.4;
    bag.add('bronze', lathe([[0.001, 0], [0.22, 0], [0.18, 0.06], [0.04, 0.12], [0.03, 1.3], [0.16, 1.34], [0.18, 1.42], [0.14, 1.44], [0.001, 1.42]], 10, null, lx, y, lz));
    bag.add('flame', lathe([[0.001, 0], [0.025, 0.03], [0.001, 0.1]], 6, null, lx, y + 1.44, lz));
    col.circle(lx, lz, 0.22, y, y + 1.4);
  }
  // the bell in its frame (east) and the drum on its stand (west)
  {
    const bx = x1 - 3.2, bz = z1 - 6;
    for (const sz of [-1, 1]) bag.add('lacquer_red', box(bx - 0.08, y, bz + sz * 0.9 - 0.08, bx + 0.08, y + 2.6, bz + sz * 0.9 + 0.08));
    bag.add('lacquer_red', box(bx - 0.1, y + 2.6, bz - 1.1, bx + 0.1, y + 2.8, bz + 1.1));
    bag.add('bronze', lathe([[0.001, 0.0], [0.42, 0.0], [0.45, 0.05], [0.4, 0.4], [0.36, 0.9], [0.3, 1.05], [0.12, 1.12], [0.06, 1.25], [0.001, 1.26]], 16, null, bx, y + 1.3, bz));
    col.rect([bx - 0.5, bz - 1, bx + 0.5, bz + 1], y, y + 2.8);
    const dx2 = x0 + 3.2;
    for (const [a, b] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) bag.add('lacquer_red', box(dx2 + a - 0.05, y, bz + b - 0.05, dx2 + a + 0.05, y + 0.9, bz + b + 0.05));
    const drum = lathe([[0.001, -0.45], [0.55, -0.45], [0.62, -0.25], [0.64, 0], [0.62, 0.25], [0.55, 0.45], [0.001, 0.45]], 18); drum.rotateZ(Math.PI / 2); drum.translate(dx2, y + 1.55, bz);
    bag.add('lacquer_red', drum);
    for (const sx of [-1, 1]) bag.add('hide_tan', lathe([[0.001, 0], [0.555, 0], [0.555, 0.01], [0.001, 0.01]], 18).rotateZ(-sx * Math.PI / 2).translate(dx2 + sx * 0.455, y + 1.55, bz));
    col.rect([dx2 - 0.65, bz - 0.65, dx2 + 0.65, bz + 0.65], y, y + 2.2);
  }
}


// ── the temple's court, its side halls, the main hall's ceiling, the lake boats (docs/settlements/song-hangzhou.md §12) ──

const forward = ([dx, dz]) => { const l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; };

/**
 * temple_gate: a gate of the temple's enclosure { c [x, z], y, w (the opening), dir ('s' | 'n': the side it faces) }: two
 * stone piers, a red lintel and an upper beam, a bracket set over each pier and one between, a gable hood of dark tiles
 * with its ridge along the wall, a name board hung under the lintel; the way through is the opening.
 */
function templeGate(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, w = (el.w ?? 6) / 2, pw = 0.42, H = 4.3, hd = 1.5;
  for (const sx of [-1, 1]) {
    const px = cx + sx * (w + pw);
    bag.add('granite_block', box(px - pw - 0.12, y, cz - hd / 2 - 0.12, px + pw + 0.12, y + 0.5, cz + hd / 2 + 0.12));
    bag.add('granite_block', box(px - pw, y + 0.5, cz - hd / 2, px + pw, y + H - 0.5, cz + hd / 2));
    bag.add('granite_block', box(px - pw - 0.06, y + H - 0.5, cz - hd / 2 - 0.06, px + pw + 0.06, y + H - 0.4, cz + hd / 2 + 0.06));
    col.rect([px - pw - 0.12, cz - hd / 2 - 0.12, px + pw + 0.12, cz + hd / 2 + 0.12], y, y + H);
  }
  const x0 = cx - w - 2 * pw, x1 = cx + w + 2 * pw;
  bag.add('lacquer_red', box(x0 - 0.1, y + H - 0.4, cz - 0.3, x1 + 0.1, y + H - 0.1, cz + 0.3));
  const t = [];
  for (const sg of [-1, 1]) for (const [px, u] of [[cx - w - pw, 0], [cx + w + pw, 0], [cx, 0]]) {
    const o = [px - 0.35, y + H - 0.1, cz + sg * 0.25], p = [px + 0.35, y + H - 0.1, cz + sg * 0.25];
    beamTris(t, o, p, 0.1, 0.12); beamTris(t, [px - 0.5, y + H + 0.02, cz + sg * 0.45], [px + 0.5, y + H + 0.02, cz + sg * 0.45], 0.1, 0.12);
  }
  bag.add('paint_ochre', fromTriangles(t));
  bag.add('lacquer_red', box(x0 - 0.1, y + H + 0.14, cz - 0.3, x1 + 0.1, y + H + 0.42, cz + 0.3));
  const hy = y + H + 0.4, rise = 0.95;
  rectRoof({ c: [cx, cz], A: (x1 - x0) / 2 + 0.7, B: 1.25, y: hy, rise, kind: 'gable', sweep: 0.2, mat: 'tile_dark', soffit: 'timber', p: 1.4 }, bag);
  // the gable boards over the piers' ends
  const top = hy + rise - 0.2;
  for (const x of [x0 - 0.12, x1 + 0.12 - 0.1]) bag.add('plaster_white', box(x, hy - 0.02, cz - 0.4, x + 0.1, top, cz + 0.4));
  // the name board under the lintel (gilt border, dark field), hung from it by two straps; the way remains the opening
  const bw = Math.min(2.6, w), by = y + H - 0.42;
  const sd = el.dir === 'n' ? -1 : 1;
  bag.add('wood_dark', box(cx - bw, by - 0.5, cz + sd * 0.3, cx + bw, by, cz + sd * 0.38));
  bag.add('paint_ochre', box(cx - bw + 0.05, by - 0.45, cz + sd * 0.38, cx + bw - 0.05, by - 0.05, cz + sd * 0.4));
  bag.add('lacquer_black', box(cx - bw + 0.12, by - 0.38, cz + sd * 0.4, cx + bw - 0.12, by - 0.12, cz + sd * 0.42));
}

/**
 * court_censer: the great bronze incense burner of the court { at, y }: a granite plinth of two steps, a round three-legged
 * cauldron with two upright ears, a rim, the ash with sticks of incense standing in it.
 */
function courtCenser(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('granite_block', box(x - 1.3, y, z - 1.3, x + 1.3, y + 0.28, z + 1.3));
  bag.add('granite_block', box(x - 1.0, y + 0.28, z - 1.0, x + 1.0, y + 0.52, z + 1.0));
  col.rect([x - 1.3, z - 1.3, x + 1.3, z + 1.3], y, y + 0.52);
  const b = y + 0.52;
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5, lx = x + Math.cos(a) * 0.5, lz = z + Math.sin(a) * 0.5; bag.add('bronze', rod([lx, b, lz], [lx + Math.cos(a) * 0.1, b + 0.55, lz + Math.sin(a) * 0.1], 0.07, 6)); }
  bag.add('bronze', lathe([[0.001, 0.5], [0.45, 0.52], [0.72, 0.72], [0.8, 1.05], [0.74, 1.3], [0.82, 1.34], [0.82, 1.42], [0.7, 1.42], [0.001, 1.2]], 18, null, x, b, z));
  bag.add('bronze', lathe([[0.001, 0], [0.66, 0], [0.66, 0.02], [0.001, 0.02]], 18, null, x, b + 1.18, z));
  for (const sx of [-1, 1]) { bag.add('bronze', box(x + sx * 0.72 - 0.05, b + 1.4, z - 0.11, x + sx * 0.72 + 0.05, b + 1.82, z + 0.11)); bag.add('bronze', box(x + sx * 0.72 - 0.05, b + 1.74, z - 0.11, x + sx * 0.72 + 0.05, b + 1.82, z + 0.11)); }
  for (let k = 0; k < 9; k++) { const a = k * 0.7, r = 0.15 + (k % 3) * 0.18; bag.add('timber', rod([x + Math.cos(a) * r, b + 1.19, z + Math.sin(a) * r], [x + Math.cos(a) * r + 0.03, b + 1.6 + (k % 4) * 0.1, z + Math.sin(a) * r], 0.008, 4)); }
  col.circle(x, z, 0.85, b, b + 1.5);
}

/** One seated luohan { at [x, z], y, dir, pose (0 hand raised with beads, 1 bowl in the lap, 2 arm on the knee, 3 sutra scroll), robe, scale }. */
function luohan(bag, [x, z], y, dir, pose, robe, s = 1) {
  const [fx, fz] = forward(dir), nx = -fz, nz = fx, P = (f, o, u) => [x + (fx * f + nx * o) * s, y + u * s, z + (fz * f + nz * o) * s];
  bag.add(robe, lathe([[0.001, 0], [0.46, 0.02], [0.47, 0.16], [0.36, 0.3], [0.3, 0.55], [0.27, 0.82], [0.24, 0.96], [0.14, 1.04], [0.001, 1.06]], 12, null, x, y, z));
  const hx = P(0.02, 0, 1.2), HD = (pose === 2 ? 0.03 : 0);
  bag.add('clay_gilt', lathe([[0.001, -0.14], [0.09, -0.12], [0.125, -0.02], [0.12, 0.07], [0.08, 0.14], [0.001, 0.16]], 10, null, hx[0], hx[1], hx[2]));
  bag.add('clay_gilt', lathe([[0.001, 0.15], [0.08, 0.16], [0.001, 0.2]], 8, null, hx[0], hx[1], hx[2]));                   // the shaven crown
  bag.add('clay_gilt', rod(P(0.0, -0.13 - HD, 1.2), P(0.0, -0.14, 1.12), 0.018, 4)); bag.add('clay_gilt', rod(P(0.0, 0.13 + HD, 1.2), P(0.0, 0.14, 1.12), 0.018, 4));   // the long ears
  const arm = (o, a, b, c = 0.05) => bag.add(robe, rod(P(...a), P(...b), c, 6));
  const hand = (p) => bag.add('clay_gilt', lathe([[0.001, -0.04], [0.045, 0], [0.001, 0.04]], 6, null, ...P(...p)));
  if (pose === 0) { arm(0, [0, -0.28, 0.98], [0.12, -0.42, 0.72]); hand([0.2, -0.44, 0.7]); arm(0, [0, 0.28, 0.98], [0.2, 0.34, 1.34], 0.05); hand([0.2, 0.34, 1.4]); bag.add('wood_dark', lathe([[0.001, -0.05], [0.04, 0], [0.001, 0.05]], 6, null, ...P(0.2, 0.34, 1.52))); }
  else if (pose === 1) { arm(0, [0, -0.28, 0.98], [0.3, -0.12, 0.55]); arm(0, [0, 0.28, 0.98], [0.3, 0.12, 0.55]); hand([0.34, 0, 0.55]); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.02], [0.14, 0.09], [0.12, 0.1], [0.001, 0.05]], 10, null, ...P(0.36, 0, 0.5))); }
  else if (pose === 2) { arm(0, [0, -0.28, 0.98], [0.1, -0.5, 0.58]); hand([0.2, -0.54, 0.58]); arm(0, [0, 0.28, 0.98], [0.34, 0.3, 0.55]); hand([0.38, 0.3, 0.55]); }
  else { arm(0, [0, -0.28, 0.98], [0.34, -0.14, 0.7]); arm(0, [0, 0.28, 0.98], [0.34, 0.14, 0.7]); bag.add('paint_white', box(...P(0.28, -0.17, 0.66).map((v, i) => (i === 1 ? v : v - 0.17)), ...P(0.42, 0.17, 0.72).map((v, i) => (i === 1 ? v : v + 0.17)))); }
}

/**
 * luohan_hall: the furnishing of a side hall of the temple { rect, y (the floor), side ('w' | 'e': the wall that the images stand
 * against), n }: a low platform of grey brick along the back wall, on it n seated luohan, each in a different pose
 * and robe, facing the aisle; an altar table with a censer at the middle of the hall's front side.
 */
function luohanHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, e = el.side === 'e', n = el.n ?? 16, dir = e ? [-1, 0] : [1, 0];
  const px0 = e ? x1 - 2.0 : x0 + 0.5, px1 = e ? x1 - 0.5 : x0 + 2.0, za = z0 + 1.2, zb = z1 - 1.2;
  bag.add('brick_grey', box(px0, y, za, px1, y + 0.18, zb)); bag.add('granite_block', box(px0 - (e ? 0.06 : 0), y + 0.18, za, px1 + (e ? 0 : 0.06), y + 0.3, zb));
  col.rect([px0, za, px1, zb], y, y + 0.3);
  const rob = ['clay_robe', 'cloth_ochre', 'clay_green', 'cloth_brown'], mid = (z0 + z1) / 2;
  for (let i = 0; i < n; i++) {
    const z = za + 0.9 + (zb - za - 1.8) * i / (n - 1), x = e ? px1 - 0.62 : px0 + 0.62;
    luohan(bag, [x, z], y + 0.3, dir, (i * 3 + (i >> 1)) % 4, rob[(i * 5) % 4], 1.0 + 0.05 * ((i * 7) % 3));
    col.circle(x, z, 0.45, y + 0.3, y + 1.9);
  }
  // the altar table at the middle, a bronze censer on it
  const ax = e ? px0 - 1.3 : px1 + 1.3, w = 0.8, l = 2.0;
  bag.add('lacquer_red', box(ax - w / 2, y + 0.82, mid - l / 2, ax + w / 2, y + 0.88, mid + l / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('lacquer_red', box(ax + sx * (w / 2 - 0.07) - 0.04, y, mid + sz * (l / 2 - 0.07) - 0.04, ax + sx * (w / 2 - 0.07) + 0.04, y + 0.82, mid + sz * (l / 2 - 0.07) + 0.04));
  col.rect([ax - w / 2, mid - l / 2, ax + w / 2, mid + l / 2], y, y + 0.88);
  bag.add('bronze', lathe([[0.001, 0], [0.1, 0], [0.16, 0.08], [0.17, 0.2], [0.12, 0.26], [0.001, 0.26]], 12, null, ax, y + 0.88, mid));
}

/**
 * hall_ceiling: the coffered ceiling and the hangings of the main hall { rect, y (floor), H }: under the hall's plain ceiling a grid of red
 * beams (0.9 m a square) with a painted panel in each, a ring of four deeper caissons over the Buddhas' platform's
 * front; long pennants (fan) of cloth hung from the beams in two rows and a lotus lamp or two on chains.
 */
function hallCeiling(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, top = y + (el.H ?? 6) - 0.21, g = 1.1;
  const nx = Math.floor((x1 - x0 - 1.0) / g), nz = Math.floor((z1 - z0 - 1.0) / g), ox = (x0 + x1) / 2 - nx * g / 2, oz = (z0 + z1) / 2 - nz * g / 2;
  const beams = [], panels = [];
  for (let i = 0; i <= nx; i++) beams.push(box(ox + i * g - 0.05, top - 0.22, oz, ox + i * g + 0.05, top, oz + nz * g));
  for (let j = 0; j <= nz; j++) beams.push(box(ox, top - 0.22, oz + j * g - 0.05, ox + nx * g, top, oz + j * g + 0.05));
  for (const b of beams) bag.add('lacquer_red', b);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const m = (i + j) % 2 ? 'paint_blue' : 'paint_caihua';
    bag.add(m, box(ox + i * g + 0.07, top - 0.1, oz + j * g + 0.07, ox + (i + 1) * g - 0.07, top - 0.04, oz + (j + 1) * g - 0.07));
  }
  // the deeper caissons: a square well of three stepped frames over the middle of the hall
  const cx = (x0 + x1) / 2, cz = z0 + 12;
  for (const [r, d] of [[2.6, 0.12], [1.9, 0.24], [1.2, 0.36]]) {
    const q = [];
    for (const [a, b, c, e] of [[cx - r, cz - r, cx + r, cz - r + 0.14], [cx - r, cz + r - 0.14, cx + r, cz + r], [cx - r, cz - r + 0.14, cx - r + 0.14, cz + r - 0.14], [cx + r - 0.14, cz - r + 0.14, cx + r, cz + r - 0.14]]) q.push(box(a, top - 0.22 - d, b, c, top - 0.22 - d + 0.12, e));
    for (const b of q) bag.add('lacquer_red', b);
  }
  bag.add('paint_ochre', box(cx - 1.0, top - 0.5, cz - 1.0, cx + 1.0, top - 0.46, cz + 1.0));
  // the pennants: two rows of long strips hung from the beams at the sides of the aisle
  const hang = ['cloth_red', 'cloth_ochre', 'cloth_indigo'];
  for (const sx of [-1, 1]) for (let k = 0; k < Math.floor((z1 - z0 - 4) / 3.3); k++) {
    const px = (x0 + x1) / 2 + sx * 3.6, pz = z0 + 4.2 + k * 3.3;
    bag.add('wood_dark', box(px - 0.2, top - 0.45, pz - 0.015, px + 0.2, top - 0.4, pz + 0.015));
    bag.add(hang[(k + (sx > 0 ? 1 : 0)) % 3], box(px - 0.16, top - 2.8, pz - 0.012, px + 0.16, top - 0.45, pz + 0.012));
    bag.add('paint_ochre', box(px - 0.16, top - 2.8, pz - 0.016, px + 0.16, top - 2.7, pz + 0.016));
    bag.add('paint_ochre', box(px - 0.02, top - 2.7, pz - 0.016, px + 0.02, top - 0.5, pz + 0.016));
  }
  // two lotus lamps on chains
  for (const sx of [-1, 1]) {
    const lx = (x0 + x1) / 2 + sx * 1.6, lz = z0 + 9;
    bag.add('iron', rod([lx, top - 0.4, lz], [lx, top - 1.6, lz], 0.01, 4));
    bag.add('bronze', lathe([[0.001, -0.14], [0.14, -0.1], [0.2, 0], [0.12, 0.05], [0.001, 0.05]], 10, null, lx, top - 1.75, lz));
    bag.add('flame', lathe([[0.001, 0], [0.02, 0.04], [0.001, 0.1]], 5, null, lx, top - 1.7, lz));
  }
}

/**
 * lake_boat: a painted pleasure boat of West Lake (huafang) { at, dir ([dx, dz], the bow), len, y (the water), seed }: a long low
 * hull of red lacquer with a gilt wale and the bow and stern turned up; a cabin of red posts with lattice windows and a tiled
 * roof whose eaves are turned up; a railed fore-deck, benches under an awning aft, the oar and rudder, lanterns at the eaves.
 */
function lakeBoat(el, { bag }) {
  const [x, z] = el.at, L = el.len ?? 14, B = L * 0.2, yw = el.y ?? 0, [dx0, dz0] = el.dir ?? [1, 0], dl = Math.hypot(dx0, dz0) || 1, dx = dx0 / dl, dz = dz0 / dl, nx = -dz, nz = dx;
  const Pt = (s, o, yy) => [x + dx * s + nx * o, yy, z + dz * s + nz * o];
  const N = 14, H = L / 2, w = (t) => B / 2 * (1 - 0.55 * Math.abs(t) ** 2.4), sheer = (t) => yw + 0.55 + 0.18 * t * t + 0.9 * Math.abs(t) ** 7, keel = (t) => yw - 0.22 + 0.25 * Math.abs(t) ** 2.5;
  const ob = (out, s0, s1, o0, o1, y0, y1) => hexa(out, [Pt(s0, o0, y0), Pt(s1, o0, y0), Pt(s1, o1, y0), Pt(s0, o1, y0), Pt(s0, o0, y1), Pt(s1, o0, y1), Pt(s1, o1, y1), Pt(s0, o1, y1)]);
  const hull = [], wale = [], deck = [], sills = [], rail = [], rud = [];
  for (let i = 0; i < N; i++) {
    const t0 = -1 + 2 * i / N, t1 = -1 + 2 * (i + 1) / N, s0 = t0 * H, s1 = t1 * H;
    hexa(hull, [Pt(s0, -w(t0) * 0.7, keel(t0)), Pt(s1, -w(t1) * 0.7, keel(t1)), Pt(s1, w(t1) * 0.7, keel(t1)), Pt(s0, w(t0) * 0.7, keel(t0)), Pt(s0, -w(t0), sheer(t0) - 0.06), Pt(s1, -w(t1), sheer(t1) - 0.06), Pt(s1, w(t1), sheer(t1) - 0.06), Pt(s0, w(t0), sheer(t0) - 0.06)]);
    for (const sg of [-1, 1]) ob(wale, s0, s1, sg * w(t0) - 0.03, sg * w(t0) + 0.05, sheer(t0) - 0.2, sheer(t0) - 0.02);
    hexa(deck, [Pt(s0, -w(t0) + 0.08, sheer(t0) - 0.06), Pt(s1, -w(t1) + 0.08, sheer(t1) - 0.06), Pt(s1, w(t1) - 0.08, sheer(t1) - 0.06), Pt(s0, w(t0) - 0.08, sheer(t0) - 0.06), Pt(s0, -w(t0) + 0.08, sheer(t0) - 0.03), Pt(s1, -w(t1) + 0.08, sheer(t1) - 0.03), Pt(s1, w(t1) - 0.08, sheer(t1) - 0.03), Pt(s0, w(t0) - 0.08, sheer(t0) - 0.03)]);
  }
  bag.add('lacquer_red', fromTriangles(hull)); bag.add('paint_ochre', fromTriangles(wale)); bag.add('planks_grey', fromTriangles(deck));
  // the cabin amidships: four posts a side, lattice between, a floor of boards
  const sA = -H * 0.38, sB = H * 0.28, hw = B / 2 * 0.74, yd = yw + 0.52 + 0.04, ch = 2.1, ns = 4;
  const posts = [], lat = [];
  for (let i = 0; i <= ns; i++) for (const sg of [-1, 1]) { const s = sA + (sB - sA) * i / ns; posts.push(rod(Pt(s, sg * hw, yd), Pt(s, sg * hw, yd + ch), 0.055, 6)); }
  for (const g of posts) bag.add('lacquer_red', g);
  for (let i = 0; i < ns; i++) for (const sg of [-1, 1]) {
    const a = sA + (sB - sA) * i / ns + 0.08, b = sA + (sB - sA) * (i + 1) / ns - 0.08;
    for (const q of [0.3, 0.55, 0.8]) beamTris(lat, Pt(a, sg * hw, yd + 0.5 + q * 1.2), Pt(b, sg * hw, yd + 0.5 + q * 1.2), 0.012, 0.012);
    for (let u = a + 0.1; u < b; u += 0.2) beamTris(lat, Pt(u, sg * hw, yd + 0.5), Pt(u, sg * hw, yd + 1.8), 0.012, 0.012);
    ob(sills, a - 0.08, b + 0.08, sg * hw - 0.03, sg * hw + 0.03, yd, yd + 0.5);
  }
  bag.add('lattice_red', fromTriangles(lat)); bag.add('lacquer_red', fromTriangles(sills));
  // the roof: a hip of dark tiles with eaves turned up, on a beam over the posts, a ridge
  const cs = (sA + sB) / 2, hl = (sB - sA) / 2 + 0.9, ro = hw + 0.7, ry = yd + ch;
  const [rcx, , rcz] = Pt(cs, 0, 0);
  const along = Math.abs(dx) > Math.abs(dz);
  rectRoof({ c: [rcx, rcz], A: along ? hl : ro, B: along ? ro : hl, y: ry, rise: 0.8, kind: 'hip', sweep: 0.3, mat: 'tile_dark', soffit: 'lacquer_red', p: 1.4 }, bag);
  // lanterns at the eaves' corners
  for (const [s, o] of [[cs - hl + 0.2, -ro + 0.2], [cs - hl + 0.2, ro - 0.2], [cs + hl - 0.2, -ro + 0.2], [cs + hl - 0.2, ro - 0.2]]) { bag.add('lamp_paper', lathe([[0.001, -0.16], [0.1, -0.1], [0.12, 0], [0.1, 0.1], [0.001, 0.14]], 8, null, ...Pt(s, o, ry - 0.35))); bag.add('iron', rod(Pt(s, o, ry - 0.2), Pt(s, o, ry - 0.2 + 0.05), 0.01, 4)); }
  // the fore-deck: a railing at the bow, a bench either side; the stern: the rudder and a long oar
  for (const sg of [-1, 1]) { ob(rail, H * 0.4, H * 0.8, sg * hw - 0.04, sg * hw + 0.04, yd + 0.4, yd + 0.5); for (const f of [0.4, 0.6, 0.8]) ob(rail, H * f - 0.04, H * f + 0.04, sg * hw - 0.04, sg * hw + 0.04, yd, yd + 0.4); }
  bag.add('lacquer_red', fromTriangles(rail));
  bag.add('wood_dark', rod(Pt(-H, 0, yw + 0.8), Pt(-H - 1.2, 0, yw - 0.5), 0.05, 5)); ob(rud, -H - 1.3, -H - 1.0, -0.05, 0.05, yw - 0.9, yw - 0.2); bag.add('wood_dark', fromTriangles(rud));
}


/** The spire of a Song brick pagoda { c, y (the crowning roof's apex), R (the roof's corner radius) }: a sumeru base, the bowl (fuyue), seven rings of the finial (xianglun) on an iron pole, the water flame and the pearl; chains to the eight corners of the roof. */
function songSpire(bag, cx, y, cz, R, ycorner) {
  bag.add('bronze', lathe([[0.001, 0], [1.0, 0], [1.0, 0.14], [0.8, 0.26], [0.8, 0.5], [0.95, 0.62], [0.95, 0.72], [0.001, 0.72]], 8, null, cx, y, cz));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.55, 0], [0.8, 0.2], [0.88, 0.5], [0.8, 0.8], [0.55, 1.0], [0.4, 1.02], [0.001, 1.04]], 14, null, cx, y + 0.72, cz));
  bag.add('iron', rod([cx, y + 0.6, cz], [cx, y + 6.2, cz], 0.09, 6));
  for (let k = 0; k < 7; k++) { const r = 0.74 - k * 0.07, yy = y + 1.9 + k * 0.5; bag.add('gilt_bronze', lathe([[0.001, 0], [r, 0], [r + 0.04, 0.06], [r, 0.12], [0.001, 0.12]], 12, null, cx, yy, cz)); }
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.34, 0.05], [0.4, 0.3], [0.2, 0.7], [0.12, 1.1], [0.001, 1.35]], 10, null, cx, y + 5.4, cz));
  bag.add('gilt_bronze', lathe([[0.001, -0.16], [0.14, -0.08], [0.17, 0.02], [0.12, 0.12], [0.001, 0.17]], 10, null, cx, y + 7.0, cz));
  for (let k = 0; k < 8; k++) {
    const a = Math.PI / 8 + k * Math.PI / 4, ex = cx + Math.cos(a) * (R - 0.4), ez = cz + Math.sin(a) * (R - 0.4), p0 = [cx, y + 4.6, cz];
    let prev = p0;
    for (let q = 1; q <= 7; q++) { const t = q / 7, pt = [cx + (ex - cx) * t, y + 4.6 + (ycorner - (y + 4.6)) * t - Math.sin(t * Math.PI) * 0.35, cz + (ez - cz) * t]; bag.add('iron', rod(prev, pt, 0.025, 4)); prev = pt; }
  }
}

/**
 * The niches of a walkable pagoda's corridor { c, y, base, tiers }: on the inner wall of every storey, on the four faces the stair leaves free, a niche with a
 * red frame, a sill and a small hood, in it a small seated Buddha on a lotus.
 */
function pagodaNiches(bag, el) {
  const [cx, cz] = el.c, C8 = Math.cos(Math.PI / 8), T8 = Math.tan(Math.PI / 8), rt = el.tiers[el.tiers.length - 1].r * C8, aw = rt - Math.max(1.4, rt * 0.22), ac = aw - 2.0;
  let y = el.y + el.base.h;
  const fr = [], B = STYLES.chinese.objects.buddha;
  for (const t of el.tiers) {
    for (const k of [2, 3, 4, 6]) {
      const th = (k + 1) * Math.PI / 4, mx = Math.cos(th), mz = Math.sin(th), tx = -mz, tz = mx, Q = (a, u, yy) => [cx + mx * a + tx * u, yy, cz + mz * a + tz * u];
      const bx = (a0, a1, u0, u1, y0, y1) => hexa(fr, [Q(a0, u0, y0), Q(a0, u1, y0), Q(a1, u1, y0), Q(a1, u0, y0), Q(a0, u0, y1), Q(a0, u1, y1), Q(a1, u1, y1), Q(a1, u0, y1)]);
      const y0 = y + 1.0, y1 = y + 2.3;
      for (const sg of [-1, 1]) bx(ac, ac + 0.42, sg * 0.5, sg * 0.64, y0, y1);
      bx(ac, ac + 0.42, -0.64, 0.64, y1, y1 + 0.14); bx(ac, ac + 0.5, -0.7, 0.7, y1 + 0.14, y1 + 0.22); bx(ac, ac + 0.4, -0.7, 0.7, y0 - 0.08, y0);
      bx(ac, ac + 0.05, -0.5, 0.5, y0, y1);
      const [px, , pz] = Q(ac + 0.22, 0, 0);
      B({ at: [px, pz], y: y0, h: 0.95, dir: [mx, mz], robe: 'clay_robe', gilt: 'clay_gilt', noHalo: true }, { bag });
    }
    y += t.h;
  }
  bag.add('timber_red', fromTriangles(fr));
}

/**
 * liuhe_pagoda: pagoda_oct with the song style's finished spire and the niches (same parameters as pagoda_oct, `interior` and `images` for the walkable inside).
 */
function liuhePagoda(el, ctx) {
  // pagoda_oct's own spire is the only 'gilt_bronze' it adds: hold it back and put ours on
  const bag2 = new Proxy(ctx.bag, { get: (t, k) => (k === 'add' ? (m, g) => (m === 'gilt_bronze' ? undefined : t.add(m, g)) : typeof t[k] === 'function' ? t[k].bind(t) : t[k]) });
  STYLES.song.elements.pagoda_oct({ ...el, spire: 0.5 }, { ...ctx, bag: bag2 });
  const top = el.y + el.base.h + el.tiers.reduce((a, t) => a + t.h, 0), rt = el.tiers[el.tiers.length - 1].r, R = rt + 3.6;
  songSpire(ctx.bag, el.c[0], top + 4.2, el.c[1], R, top + 1.0);
  if (el.interior && el.niches !== false) pagodaNiches(ctx.bag, el);
}

/**
 * hall_offerings: what is set out in the main hall { rect, y }: a plate of fruit (a pile of peaches and oranges) and a vase of lotus on each altar table beside the
 * censer, two rows of kneeling cushions with a mat before each, a wooden fish (muyu) on a stand and a bowl gong on its cushion at the head of the monks' row, and the
 * red lanterns hung in two rows down the hall.
 */
function hallOfferings(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, cx = (x0 + x1) / 2, tz = z0 + 1.0 + 5.2 + 0.35 + 0.38, ty = y + 0.92, rand = rnd(z0 + 11);
  for (const [dx, sx] of [[0, -1], [0, 1], [-8.5, -1], [-8.5, 1], [8.5, -1], [8.5, 1]]) {
    const px = cx + dx + sx * (dx ? 0.8 : 0.95);
    bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.14, 0.03], [0.17, 0.06], [0.001, 0.06]], 12, null, px, ty, tz));
    for (let k = 0; k < 7; k++) {
      const a = k * 2.4, r = k < 4 ? 0.09 : 0.04, lv = k < 4 ? 0 : 1;
      bag.add(k % 2 ? 'cloth_ochre' : 'cloth_red', lathe([[0.001, -0.04], [0.045, 0], [0.05, 0.04], [0.001, 0.07]], 7, null, px + Math.cos(a) * r, ty + 0.06 + lv * 0.07, tz + Math.sin(a) * r));
    }
  }
  // cushions in two rows either side of the aisle, a mat before each
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) {
    const px = cx + sx * 2.4, pz = z0 + 14 + k * 1.5;
    bag.add('cloth_ochre', box(px - 0.48, y + 0.005, pz - 0.36, px + 0.48, y + 0.045, pz + 0.36));
    bag.add('cloth_red', lathe([[0.001, 0], [0.26, 0], [0.28, 0.07], [0.22, 0.14], [0.001, 0.15]], 10, null, px, y + 0.045, pz));
  }
  // the wooden fish and the bowl gong at the head of the east row
  {
    const fx = cx + 2.4 + 1.1, fz = z0 + 13;
    for (const [a, b] of [[-0.18, -0.12], [0.18, -0.12], [-0.18, 0.12], [0.18, 0.12]]) bag.add('wood_dark', box(fx + a - 0.02, y, fz + b - 0.02, fx + a + 0.02, y + 0.5, fz + b + 0.02));
    bag.add('wood_dark', box(fx - 0.22, y + 0.5, fz - 0.16, fx + 0.22, y + 0.54, fz + 0.16));
    bag.add('lacquer_red', lathe([[0.001, -0.14], [0.12, -0.12], [0.18, 0], [0.16, 0.1], [0.001, 0.12]], 10, null, fx, y + 0.68, fz).scale(1.1, 1, 1.4));
    bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.16, 0.08], [0.15, 0.13], [0.001, 0.13]], 12, null, fx - 0.9, y + 0.15, fz - 0.4));
    bag.add('cloth_ochre', lathe([[0.001, 0], [0.2, 0], [0.21, 0.07], [0.16, 0.14], [0.001, 0.15]], 10, null, fx - 0.9, y, fz - 0.4));
    col.rect([fx - 0.24, fz - 0.2, fx + 0.24, fz + 0.2], y, y + 0.7);
  }
  // red lanterns hung from the beams, two rows
  for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) {
    const lx = cx + sx * 5.2, lz = z0 + 5 + k * 3.8, ly = y + (el.H ?? 6) - 0.21 - 0.4;
    bag.add('iron', rod([lx, ly + 0.45, lz], [lx, ly + 0.2, lz], 0.008, 4));
    bag.add('lamp_paper', lathe([[0.001, -0.3], [0.12, -0.26], [0.23, -0.1], [0.25, 0.04], [0.2, 0.18], [0.001, 0.2]], 10, null, lx, ly, lz));
    bag.add('lacquer_black', lathe([[0.1, 0.2], [0.1, 0.24]], 6, null, lx, ly, lz));
    bag.add('cloth_red', rod([lx, ly - 0.3, lz], [lx, ly - 0.62, lz], 0.012, 4));
  }
}

/**
 * court_paving: the worn flagstones and the green of the courts { rects: [[x0, z0, x1, z1], …] (the paths), y (the terrace's top), seed, moss: [[x0, z0, x1, z1]…] (the strips
 * at wall feet where moss grows) }: slabs of bluestone and grey granite 1.2 by 0.9 m laid in running bond with open joints, some of them sunk a little and
 * darkened by feet, cracked ones; patches of moss and grass tufts in the joints and along the foot of the walls.
 */
function courtPaving(el, { bag }) {
  const y = el.y, rand = rnd(el.seed ?? 5);
  for (const [x0, z0, x1, z1] of el.rects) {
    const along = (z1 - z0) >= (x1 - x0);
    const [u0, u1, v0, v1] = along ? [z0, z1, x0, x1] : [x0, x1, z0, z1];
    let row = 0;
    for (let v = v0; v < v1 - 0.05; v += 0.9, row++) {
      const vb = Math.min(v + 0.9, v1);
      for (let u = u0 - (row % 2) * 0.6; u < u1; u += 1.2) {
        const ua = Math.max(u, u0), ub = Math.min(u + 1.2, u1); if (ub - ua < 0.2) continue;
        const wear = Math.abs((v + vb) / 2 - (v0 + v1) / 2) < (v1 - v0) * 0.22, sink = rand() < 0.2 ? 0.012 : 0, r = rand();
        const m = r < 0.25 ? 'granite_grey' : wear && r < 0.6 ? 'slate' : 'bluestone';
        const [a, b, c, d] = along ? [vb > v ? v + 0.02 : v, ua + 0.02, Math.min(vb, v1) - 0.02, ub - 0.02] : [ua + 0.02, v + 0.02, ub - 0.02, Math.min(vb, v1) - 0.02];
        bag.add(m, box(a, y, b, c, y + 0.03 - sink, d));
      }
    }
  }
  const tufts = [], pat = [];
  for (const [x0, z0, x1, z1] of el.moss ?? []) for (let k = 0; k < Math.ceil((x1 - x0) * (z1 - z0) / 2.5); k++) {
    const px = x0 + rand() * (x1 - x0), pz = z0 + rand() * (z1 - z0), r = 0.2 + rand() * 0.45;
    pat.push(lathe([[0.001, 0.018], [r, 0.01], [r * 1.05, 0.002]], 8, null, px, y, pz).scale(1, 1, 0.8 + rand() * 0.5));
    for (let q = 0; q < 3; q++) tufts.push(rod([px + (rand() - 0.5) * r, y, pz + (rand() - 0.5) * r], [px + (rand() - 0.5) * r * 1.2, y + 0.12 + rand() * 0.14, pz + (rand() - 0.5) * r * 1.2], 0.006, 3));
  }
  for (const g of pat) bag.add('lotus_leaf', g);
  for (const g of tufts) bag.add('bark_olive', g);
}

/** sutra_pillar: a stone sutra pillar of the court { at, y } (the hexagonal shaft on its lotus base, as the chinese style's dharani pillar). */
function sutraPillar(el, ctx) { STYLES.chinese.objects.dharani_pillar(el, ctx); }

export const HANGZHOU_ELEMENTS = { view_tent: viewTent, tea_house: teaHouse, kaihua_hall: kaihuaHall, temple_gate: templeGate, court_censer: courtCenser, luohan_hall: luohanHall, hall_ceiling: hallCeiling, lake_boat: lakeBoat, sutra_pillar: sutraPillar, liuhe_pagoda: liuhePagoda, hall_offerings: hallOfferings, court_paving: courtPaving };
