// Southern Song Lin'an on the Qiantang (docs/settlements/song-hangzhou.md §10): the coloured
// curtained stands that the great houses put up along the river below the Liuhe Pagoda for the tide.

import { rod, box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, column, beamTris } from '../ming/index.js';
import { hexa } from './kaifeng.js';
import { STYLES } from '../../core/build.js';
import { Matrix4, Float32BufferAttribute } from '../../core/three.js';

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
  // the threshold; the door leaves standing open against the piers on the court's side, with iron straps and bronze studs
  bag.add('granite_grey', box(cx - w, y, cz - 0.7, cx + w, y + 0.16, cz + 0.7));
  const studs = [];
  for (const sx of [-1, 1]) {
    const lx = cx + sx * (w - 0.06), z0 = cz - sd * 0.35, z1 = z0 - sd * 3.0, za = Math.min(z0, z1), zb = Math.max(z0, z1);
    bag.add('lacquer_red', box(lx - 0.05, y + 0.16, za, lx + 0.05, y + H - 0.55, zb));
    for (const yy of [0.5, H * 0.5, H - 1.1]) bag.add('iron', box(lx - 0.065, y + yy, za, lx + 0.065, y + yy + 0.1, zb));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 7; j++) studs.push(lathe([[0.001, 0], [0.045, 0], [0.04, 0.025], [0.001, 0.045]], 5).rotateZ(-sx * Math.PI / 2).translate(lx - sx * 0.05, y + 0.45 + j * 0.45, za + 0.3 + i * 0.48));
    col.rect([lx - 0.06, za, lx + 0.06, zb], y, y + H - 0.5);
  }
  for (const g of studs) bag.add('bronze', g);
  for (const sx of [-1, 1]) bag.add('lamp_paper', lathe([[0.001, -0.22], [0.14, -0.14], [0.18, 0], [0.14, 0.14], [0.001, 0.22]], 8, null, cx + sx * (w * 0.62), y + H - 0.62, cz + sd * 0.55));
  // ridge ornaments: a chiwen at each end of the ridge, a ball at its middle
  for (const x of [x0 - 0.1, x1 + 0.1]) {
    const o = x < cx ? 1 : -1;
    bag.add('tile_dark', box(x - 0.14, hy + rise - 0.1, cz - 0.16, x + 0.14, hy + rise + 0.5, cz + 0.16));
    bag.add('tile_dark', box(Math.min(x, x + o * 0.35) - 0.1, hy + rise + 0.5, cz - 0.1, Math.max(x, x + o * 0.35) + 0.1, hy + rise + 0.7, cz + 0.1));
  }
  bag.add('tile_dark', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.2], [0.001, 0.3]], 8, null, cx, hy + rise - 0.05, cz));
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

/**
 * hz_shell: the walls and roof of a furnished lot of Lin'an { rect, front ('n'|'s'|'e'|'w'), y (the street), kind ('teahouse' | 'winehouse' | 'shop' | 'house'), seed, roof ('gable' | 'hip') }:
 * a granite plinth and a brick-paved floor 0.45 m over the street; white walls on a grey dado; the front of a tea house, wine
 * house or shop open between red-brown posts under a beam with a lattice valance (a wine house of two storeys, its upper front a
 * plaster wall with lattice windows behind bamboo blinds, a gallery over the rear), the front of a house a plaster wall with its
 * door under a tiled hood and two lattice windows; a roof of dark tiles. The inside is left to the life's furnishing (interiors.js).
 * Built in the room's own frame (front toward +z) and turned into place.
 */
function hzShell(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[f];
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, M = new Matrix4().makeRotationY(yaw).setPosition(cx, 0, cz);
  const rect = ([a, b, c, d]) => { const p = [[a, b], [c, d]].map(([u, v]) => [cx + u * Math.cos(yaw) + v * Math.sin(yaw), cz - u * Math.sin(yaw) + v * Math.cos(yaw)]); return [Math.min(p[0][0], p[1][0]), Math.min(p[0][1], p[1][1]), Math.max(p[0][0], p[1][0]), Math.max(p[0][1], p[1][1])]; };
  const bag = { add: (m, g) => ctx.bag.add(m, g.applyMatrix4(M)) };
  const col = { floor: (r, y, t) => ctx.col.floor(rect(r), y, t), rect: (r, a, b) => ctx.col.rect(rect(r), a, b), circle: (x, z, r, a, b) => ctx.col.circle(cx + x * Math.cos(yaw) + z * Math.sin(yaw), cz - x * Math.sin(yaw) + z * Math.cos(yaw), r, a, b) };
  const kind = el.kind || 'shop', two = kind === 'winehouse', y = el.y ?? 0, Y = y + 0.45, H = two ? 6.4 : 3.6, H1 = 3.6, rand = rnd(el.seed ?? 1);
  const a0 = -L / 2, a1 = L / 2, b0 = -D / 2, b1 = D / 2, fz = b1 - 0.6, th = 0.25;
  bag.add('granite_block', box(a0, y - 0.4, b0, a1, Y - 0.04, b1));
  bag.add('brick_paving', box(a0 + 0.02, Y - 0.04, b0 + 0.02, a1 - 0.02, Y, b1 - 0.02));
  col.floor([a0, b0, a1, b1], Y);
  const wall = (r, h = H) => { bag.add('plaster_white', box(r[0], Y, r[1], r[2], Y + h, r[3])); bag.add('plaster_grey', box(r[0] - 0.01, Y, r[1] - 0.01, r[2] + 0.01, Y + 0.35, r[3] + 0.01)); col.rect(r, Y, Y + h); };
  const fl = kind === 'house' ? b1 - th : fz;
  wall([a0, b0, a0 + th, fl]); wall([a1 - th, b0, a1, fl]); wall([a0 + th, b0, a1 - th, b0 + th]);
  const lat = (u0, u1, yy0, yy1, zz) => { const t = []; for (let u = u0 + 0.05; u < u1 - 0.03; u += 0.14) beamTris(t, [u, yy0, zz], [u, yy1, zz], 0.02, 0.02); for (let k = 0; k <= 3; k++) { const yy = yy0 + (yy1 - yy0) * (k + 0.5) / 4; beamTris(t, [u0, yy, zz], [u1, yy, zz], 0.02, 0.02); } bag.add('lattice_red', fromTriangles(t)); };
  if (kind === 'house') {
    // the front wall: the door in the middle (1.3 m, a lintel and a tiled hood over it), a lattice window either side
    const dw = 0.7, wy0 = Y + 1.0, wy1 = Y + 2.3;
    wall([a0, fl, -dw, b1], H); wall([dw, fl, a1, b1], H);
    bag.add('lacquer_chestnut', box(-dw - 0.05, Y + 2.35, fl - 0.04, dw + 0.05, Y + 2.5, b1 + 0.04));
    for (const s of [-1, 1]) bag.add('lacquer_chestnut', box(s * dw - (s > 0 ? 0.04 : 0.1), Y, fl - 0.04, s * dw + (s > 0 ? 0.1 : 0.04), Y + 2.4, b1 + 0.04));
    bag.add('tile_dark', box(-dw - 0.45, Y + 2.5, b1 - 0.02, dw + 0.45, Y + 2.58, b1 + 0.5));   // the hood over the door
    for (const sx of [-1, 1]) { const wc = sx * (dw + (L / 2 - dw) / 2); if (Math.abs(wc) < dw + 1.1) continue; bag.add('lacquer_chestnut', box(wc - 0.5, wy0 - 0.05, b1 - 0.02, wc + 0.5, wy1 + 0.05, b1 + 0.03)); lat(wc - 0.45, wc + 0.45, wy0, wy1, b1 + 0.03); }
  } else {
    // the open front: posts, the beam, the lattice valance in each bay
    const nb = L > 8 ? 3 : 2, xs = Array.from({ length: nb + 1 }, (_, i) => a0 + 0.13 + (L - 0.26) * i / nb);
    for (const x of xs) column(bag, col, x, fz, Y, H1 - 0.35, 0.26, 'lacquer_chestnut', true);
    bag.add('lacquer_chestnut', box(a0, Y + H1 - 0.4, fz - 0.12, a1, Y + H1, fz + 0.12));
    for (let i = 0; i < nb; i++) { const a = xs[i] + 0.14, b = xs[i + 1] - 0.14; bag.add('lacquer_chestnut', box(a, Y + H1 - 0.78, fz - 0.03, b, Y + H1 - 0.73, fz + 0.03)); lat(a, b, Y + H1 - 0.73, Y + H1 - 0.4, fz); }
    if (kind === 'shop') for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { const u = sx * (L / 2 - 0.55 - k * 0.2); bag.add('timber', box(u - 0.09, Y + 0.05, fz + 0.14, u + 0.09, Y + H1 - 0.8, fz + 0.18)); }   // the shutters of the front, stacked at the ends
  }
  if (two) {
    // the upper storey: a plaster wall over the front beam with lattice windows behind blinds; a gallery over the rear, its rail toward the hall
    bag.add('plaster_white', box(a0 + th, Y + H1, fz - 0.1, a1 - th, Y + H, fz + 0.1)); col.rect([a0 + th, fz - 0.1, a1 - th, fz + 0.1], Y + H1, Y + H);
    const nw = Math.max(2, Math.floor((L - 1.2) / 2.2));
    for (let i = 0; i < nw; i++) { const c = a0 + 0.6 + (L - 1.2) * (i + 0.5) / nw; bag.add('lacquer_chestnut', box(c - 0.8, Y + H1 + 0.55, fz + 0.09, c + 0.8, Y + H1 + 2.05, fz + 0.13)); lat(c - 0.74, c + 0.74, Y + H1 + 0.6, Y + H1 + 2.0, fz + 0.14); bag.add('reed_mat', box(c - 0.72, Y + H1 + 1.2, fz + 0.15, c + 0.72, Y + H1 + 2.0, fz + 0.17)); }
    bag.add('lacquer_chestnut', box(a0 + th, Y + H1 - 0.1, b0 + th, a1 - th, Y + H1, b0 + 3.4));
    for (let u = a0 + th + 0.1; u < a1 - th; u += 0.7) bag.add('wood_dark', box(u - 0.05, Y + H1 - 0.3, b0 + th, u + 0.05, Y + H1 - 0.1, b0 + 3.4));
    bag.add('lacquer_chestnut', box(a0 + th, Y + H1 + 0.9, b0 + 3.35, a1 - th, Y + H1 + 1.0, b0 + 3.45));
  }
  // the roof: a gable (or hipped) roof, its ridge along the front; white gable boards over the side walls
  const rise = Math.min(D * 0.3, 3.6) + (two ? 0.4 : 0), hip = el.roof === 'hip' && kind !== 'winehouse';
  rectRoof({ c: [0, 0], A: L / 2 + 0.25, B: D / 2 + 0.55, y: Y + H - 0.05, rise, kind: hip ? 'hip' : 'gable', sweep: 0.15, mat: 'tile_dark', soffit: 'timber', p: 1.4 }, bag);
  if (!hip) for (const x of [a0, a1 - th]) { const t = [], top = Y + H + rise - 0.25, e0 = b0 + th, e1 = kind === 'house' ? b1 - th : fz; t.push(x, Y + H, e0, x, Y + H, e1, x, top, 0, x + th, Y + H, e0, x + th, top, 0, x + th, Y + H, e1); bag.add('plaster_white', fromTriangles(t.concat([x, Y + H, e0, x + th, Y + H, e0, x + th, top, 0, x, Y + H, e0, x + th, top, 0, x, top, 0, x, Y + H, e1, x, top, 0, x + th, top, 0, x, Y + H, e1, x + th, top, 0, x + th, Y + H, e1]))); }
  void rand;
}

/**
 * hz_imperial_way: the surface of the Imperial Way's stretch { rect [x0, z0, x1, z1] (running north–south), y (the paving's top), seed }: "paved with stone and brick, the
 * middle filled with gravel, round pipes under it draining the rain into the canals" — a band of worn bluestone and granite slabs along each side (as the courts'), a
 * granite kerb between the bands and the gravel, the gravel bed of the middle with the cart wheels' two dark ruts, and a drain cover of granite with its slots in the
 * slabs beside the kerb every 16 m, alternating from side to side.
 */
function imperialWay(el, ctx) {
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.04, rand = rnd(el.seed ?? 3), band = 3.3, kb = 0.22, xc = (x0 + x1) / 2;
  const bands = [[x0 + 0.1, z0, x0 + band, z1], [x1 - band, z0, x1 - 0.1, z1]];
  courtPaving({ y, seed: el.seed ?? 3, rects: bands.filter((r) => r[3] - r[1] > 1) }, ctx);
  const gx0 = x0 + band + kb, gx1 = x1 - band - kb;
  bag.add('pebbles', box(gx0, y, z0, gx1, y + 0.03, z1));
  for (const [a, b] of [[x0 + band, gx0], [gx1, x1 - band]]) { bag.add('granite_grey', box(a, y, z0, b, y + 0.09, z1)); ctx.col?.floor([a, z0, b, z1], y + 0.09); }   // (the kerb a step to walk over)
  for (const s of [-1, 1]) bag.add('slate', box(xc + s * 2.6 - 0.14, y, z0, xc + s * 2.6 + 0.14, y + 0.05, z1));   // the wheel ruts
  for (let z = z0 + 6 + rand() * 6, k = 0; z < z1 - 4; z += 16, k++) {
    const side = k % 2 ? 1 : -1, cx = side < 0 ? x0 + band - 0.55 : x1 - band + 0.55;
    bag.add('granite_grey', box(cx - 0.4, y, z - 0.3, cx + 0.4, y + 0.05, z + 0.3));
    for (let i = -2; i <= 2; i++) bag.add('lacquer_black', box(cx - 0.3, y + 0.05, z + i * 0.1 - 0.025, cx + 0.3, y + 0.055, z + i * 0.1 + 0.025));
  }
}

/** sutra_pillar: a stone sutra pillar of the court { at, y } (the hexagonal shaft on its lotus base, as the chinese style's dharani pillar). */
function sutraPillar(el, ctx) { STYLES.chinese.objects.dharani_pillar(el, ctx); }

// ---- the approach of the Liuhe Pagoda and West Lake's set pieces (round 2) -----------------------------------------------------------
const ell = (rx, ry, rz, x, y, z, n = 8) => lathe(Array.from({ length: 7 }, (_, i) => { const t = i / 6 * Math.PI; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; }), n).scale(rx, ry, rz).translate(x, y, z);

/** A prism between two z (a stair's slope): x [xa, xb], z from zA (low) to zB, bottom/top heights as functions of z. */
function slopePrism(out, xa, xb, zA, zB, b, t) {
  hexa(out, [[xa, b(zA), zA], [xb, b(zA), zA], [xb, b(zB), zB], [xa, b(zB), zB], [xa, t(zA), zA], [xb, t(zA), zA], [xb, t(zB), zB], [xa, t(zB), zB]]);
}

/**
 * hz_stair: the processional stair from the river road up to the temple terrace { x0, x1, zTop, zBot, y0, y1, flights (3), landing (m) }, ascending north: flights of
 * granite steps, each tread of three or four slabs with open joints (the middle of the way worn dark and dished by feet, moss and grass in the joints at the sides),
 * the landings between the flights; balustrades of posts with lotus caps, panels and rails following the flights; drum stones at the foot; steles and stone lamps
 * on the landings. [inferred: the forms, from Song temple stairs]
 */
function hzStair(el, { bag, col }) {
  const { x0, x1, zTop, zBot, y0, y1 } = el, rand = rnd(el.seed ?? 11), nF = el.flights ?? 3, land = el.landing ?? 2.4, rise = 0.16;
  const N = Math.round((y1 - y0) / rise), run = (zBot - zTop - land * (nF - 1)) / N, xc = (x0 + x1) / 2, W = x1 - x0;
  const per = [], base = Math.floor(N / nF); for (let i = 0; i < nF; i++) per.push(base + (i < N - base * nF ? 1 : 0));
  const moss = [], tufts = [], fl = [];
  let z = zBot, k = 0, yb = y0;
  const treadSlabs = (zf, zb, top, thick = 0.03) => {
    // slabs across the way: cuts at jittered thirds, staggered from step to step
    const n = 3 + (rand() < 0.5 ? 1 : 0), cuts = [x0]; for (let i = 1; i < n; i++) cuts.push(x0 + W * (i + (rand() - 0.5) * 0.4) / n); cuts.push(x1);
    for (let i = 0; i < n; i++) {
      const a = cuts[i] + 0.012, b = cuts[i + 1] - 0.012, mid = (a + b) / 2, worn = Math.abs(mid - xc) < 2.4, r = rand();
      const m = worn ? (r < 0.65 ? 'slate' : 'bluestone') : r < 0.45 ? 'granite_grey' : r < 0.8 ? 'bluestone' : 'granite_block';
      const dish = worn && rand() < 0.5 ? 0.012 : 0;
      bag.add(m, box(a, top - thick - dish * 0, zb + 0.012, b, top - dish, zf - 0.012));
    }
  };
  for (let f = 0; f < nF; f++) {
    const zf0 = z, ns = per[f];
    for (let j = 0; j < ns; j++, k++) {
      const top = y0 + (k + 1) * rise, zf = z, zb = z - run;
      bag.add('granite_block', box(x0, y0 - 0.3, zb, x1, top - 0.03, zf));
      treadSlabs(zf, zb, top);
      // the nosing: a darker lip along the front edge, the riser's carved band
      bag.add('granite_grey', box(x0, top - rise + 0.02, zf - 0.012, x1, top - rise + 0.07, zf + 0.012));
      // moss and grass at the foot of the balustrades and in the damp of the lower flights
      const damp = 1 - k / N * 0.6;
      for (const sx of [x0 + 0.5, x1 - 0.5]) if (rand() < 0.5 * damp + 0.1) {
        const r = 0.15 + rand() * 0.3, px = sx + (rand() - 0.5) * 1.0, pz = zf - rand() * run;
        moss.push(lathe([[0.001, 0.012], [r, 0.006], [r * 1.05, 0.0]], 7, null, px, top, pz).scale(1, 1, 0.6));
        for (let q = 0; q < 2; q++) tufts.push(rod([px + (rand() - 0.5) * r, top, pz], [px + (rand() - 0.5) * r * 1.4, top + 0.09 + rand() * 0.1, pz + (rand() - 0.5) * 0.1], 0.005, 3));
      }
      if (rand() < 0.25) { const px = x0 + rand() * W; moss.push(lathe([[0.001, 0.01], [0.12, 0.005], [0.13, 0]], 6, null, px, top, zf - run * 0.9).scale(1.8, 1, 0.4)); }
    }
    fl.push({ zf: zf0, zb: z - ns * run, yb: y0 + (k - ns) * rise, ns });
    col.ramp([x0 + 0.34, z - ns * run, x1 - 0.34, zf0], y0 + (k - ns) * rise, y0 + k * rise, 'n');
    z -= ns * run;
    if (f < nF - 1) {
      const top = y0 + k * rise;
      bag.add('granite_block', box(x0, y0 - 0.3, z - land, x1, top - 0.03, z));
      for (let zz = z; zz > z - land - 0.01; zz -= 1.2) { const zb2 = Math.max(zz - 1.2, z - land); treadSlabs(zz, zb2, top + 0.0); }
      col.floor([x0 + 0.34, z - land, x1 - 0.34, z], top);
      fl[fl.length - 1].landTop = top; fl[fl.length - 1].landZ = [z, z - land];
      z -= land;
    }
  }
  for (const g of moss) bag.add('lotus_leaf', g);
  for (const g of tufts) bag.add('bark_olive', g);
  // balustrades
  const out = [], rail = [], caps = [], post = (x, zz, yy, h) => {
    bag.add('granite_grey', box(x - 0.17, yy - 0.4, zz - 0.17, x + 0.17, yy + h, zz + 0.17));
    bag.add('granite_block', box(x - 0.21, yy + h, zz - 0.21, x + 0.21, yy + h + 0.07, zz + 0.21));
    caps.push(lathe([[0.001, 0], [0.17, 0.02], [0.2, 0.12], [0.15, 0.22], [0.09, 0.3], [0.1, 0.34], [0.07, 0.42], [0.001, 0.5]], 8, null, x, yy + h + 0.07, zz));
  };
  for (const side of [-1, 1]) {
    const xa = side < 0 ? x0 : x1 - 0.34, xb = xa + 0.34, xm = (xa + xb) / 2;
    // drum stone (baogushi) at the foot, either side of the first post
    const zd = zBot + 0.55, yd = y0;
    bag.add('granite_grey', box(xa - 0.02, yd, zd - 0.5, xb + 0.02, yd + 0.3, zd + 0.5));
    bag.add('granite_grey', rod([xa - 0.02, yd + 0.78, zd], [xb + 0.02, yd + 0.78, zd], 0.46, 16));
    bag.add('slate', rod([xa - 0.04, yd + 0.78, zd], [xb + 0.04, yd + 0.78, zd], 0.3, 14));
    bag.add('granite_grey', rod([xa - 0.05, yd + 0.78, zd], [xb + 0.05, yd + 0.78, zd], 0.12, 10));
    bag.add('granite_grey', box(xa - 0.02, yd + 0.3, zd - 0.2, xb + 0.02, yd + 0.48, zd + 0.2));
    col.rect([xa, zd - 0.5, xb, zd + 0.5], yd, yd + 1.3);
    for (const F of fl) {
      const slope = rise / run, yl = (zz) => F.yb + rise + (F.zf - zz) * slope;
      slopePrism(out, xa, xb, F.zf + 0.0, F.zb, (zz) => yl(zz) - 0.5, (zz) => yl(zz) + 0.28);
      slopePrism(rail, xa + 0.07, xb - 0.07, F.zf, F.zb, (zz) => yl(zz) + 0.28, (zz) => yl(zz) + 0.78);
      slopePrism(out, xa, xb, F.zf, F.zb, (zz) => yl(zz) + 0.78, (zz) => yl(zz) + 0.98);
      const n = Math.max(1, Math.round((F.zf - F.zb) / 3.6));
      for (let i = 0; i <= n; i++) { const zz = F.zf - (F.zf - F.zb) * i / n; post(xm, zz, yl(zz) - 0.1, 1.15); }
      col.segment([xm, F.zf], [xm, F.zb], 0.34, F.yb - 0.4, F.yb + ((F.zf - F.zb) * slope) + 1.5);
      if (F.landZ) {
        const [la, lb] = F.landZ, yL = F.landTop;
        hexa(out, [[xa, yL - 0.5, la], [xb, yL - 0.5, la], [xb, yL - 0.5, lb], [xa, yL - 0.5, lb], [xa, yL + 0.28, la], [xb, yL + 0.28, la], [xb, yL + 0.28, lb], [xa, yL + 0.28, lb]]);
        hexa(rail, [[xa + 0.07, yL + 0.28, la], [xb - 0.07, yL + 0.28, la], [xb - 0.07, yL + 0.28, lb], [xa + 0.07, yL + 0.28, lb], [xa + 0.07, yL + 0.78, la], [xb - 0.07, yL + 0.78, la], [xb - 0.07, yL + 0.78, lb], [xa + 0.07, yL + 0.78, lb]]);
        hexa(out, [[xa, yL + 0.78, la], [xb, yL + 0.78, la], [xb, yL + 0.78, lb], [xa, yL + 0.78, lb], [xa, yL + 0.98, la], [xb, yL + 0.98, la], [xb, yL + 0.98, lb], [xa, yL + 0.98, lb]]);
        post(xm, (la + lb) / 2, yL - 0.1, 1.15); post(xm, lb, yL - 0.1, 1.15);
        col.segment([xm, la], [xm, lb], 0.34, yL - 0.4, yL + 1.5);
      }
    }
    // the top post
    const Fl = fl[fl.length - 1]; void Fl;
  }
  bag.add('granite_grey', fromTriangles(out)); bag.add('bluestone', fromTriangles(rail));
  for (const g of caps) bag.add('granite_block', g);
  // on the landings: a stele on its tortoise and a stone lamp either side of the way
  fl.forEach((F, i) => {
    if (!F.landZ) return;
    const zm = (F.landZ[0] + F.landZ[1]) / 2;
    for (const sx of [-1, 1]) {
      const X = xc + sx * 3.9;
      if (i === 0) stoneLion(bag, col, [X, zm], F.landTop, 0, sx);
      else STYLES.song.elements.stele({ at: [X, zm], y: F.landTop, face: [0, 1] }, { bag, col });
    }
  });
}

/** One stone lion (shi) of a gate { at [x, z], y, yaw (0 faces +z, the way a lion at a gate looks out), side (−1 | 1: which paw plays with the ball) } on a plinth, ~1.5 m with it. */
function stoneLion(bag, col, [x, z], y, yaw, side) {
  const gs = [], P = (g) => { g.rotateY(yaw); g.translate(x, y, z); return g; };
  bag.add('granite_grey', box(x - 0.55, y, z - 0.75, x + 0.55, y + 0.5, z + 0.75));
  bag.add('granite_block', box(x - 0.62, y, z - 0.82, x + 0.62, y + 0.09, z + 0.82));
  bag.add('granite_block', box(x - 0.6, y + 0.5, z - 0.8, x + 0.6, y + 0.58, z + 0.8));
  col.rect([x - 0.62, z - 0.82, x + 0.62, z + 0.82], y, y + 1.7);
  const yy = 0.58, add = (rx, ry, rz, px, py, pz, n = 8) => gs.push(P(ell(rx, ry, rz, px, yy + py, pz, n)));
  add(0.3, 0.3, 0.46, 0, 0.55, -0.1);          // body
  add(0.28, 0.27, 0.28, 0, 0.35, -0.38);       // haunch
  add(0.27, 0.3, 0.26, 0, 0.7, 0.25);          // chest
  add(0.22, 0.22, 0.2, 0, 1.0, 0.36);          // head
  add(0.14, 0.1, 0.12, 0, 0.92, 0.55);         // muzzle
  add(0.34, 0.3, 0.14, 0, 0.98, 0.2);          // mane
  for (const sx of [-1, 1]) { add(0.06, 0.07, 0.05, sx * 0.19, 1.14, 0.3, 6); add(0.05, 0.04, 0.05, sx * 0.07, 0.99, 0.62, 6); add(0.1, 0.3, 0.1, sx * 0.16, 0.3, 0.3, 6); add(0.1, 0.12, 0.2, sx * 0.17, 0.12, -0.55, 6); }
  add(0.09, 0.09, 0.2, 0, 0.62, -0.62, 6);     // tail
  add(0.16, 0.16, 0.16, side * 0.18, 0.16, 0.5, 8);   // the ball
  for (const g of gs) bag.add('granite_grey', g);
}
/** hz_lion_pair { c [x, z] (the way's axis), y, gap (half the distance between), yaw (0: the lions look +z) }. */
function hzLionPair(el, { bag, col }) {
  const [cx, cz] = el.c, g = el.gap ?? 3.8, yaw = el.yaw ?? 0, s = Math.sin(yaw), c = Math.cos(yaw);
  for (const sx of [-1, 1]) stoneLion(bag, col, [cx + sx * g * c, cz - sx * g * s], el.y ?? 0, yaw, sx);
}

/**
 * hz_wutou: a black-capped gate (wutou men) of the temple's approach, across the foot of the stair { c [x, z], y, half (half the way between the posts), h, dir }: two
 * square posts of red-painted timber on granite bases with drum-stone buttresses and black caps, two tie beams, a plaque board between them. [inferred: the Song 乌头门]
 */
function hzWutou(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, hw = el.half ?? 7.4, h = el.h ?? 5.2, pw = 0.3;
  for (const sx of [-1, 1]) {
    const px = cx + sx * hw;
    bag.add('granite_grey', box(px - 0.55, y, cz - 0.55, px + 0.55, y + 0.5, cz + 0.55));
    bag.add('granite_block', box(px - 0.45, y + 0.5, cz - 0.45, px + 0.45, y + 0.62, cz + 0.45));
    bag.add('lacquer_red', box(px - pw, y + 0.62, cz - pw, px + pw, y + h, cz + pw));
    bag.add('lacquer_black', box(px - pw - 0.05, y + h, cz - pw - 0.05, px + pw + 0.05, y + h + 0.5, cz + pw + 0.05));
    bag.add('lacquer_black', box(px - 0.18, y + h + 0.5, cz - 0.18, px + 0.18, y + h + 0.66, cz + 0.18));
    bag.add('bronze', lathe([[0.001, 0], [0.11, 0.02], [0.13, 0.12], [0.001, 0.2]], 8, null, px, y + h + 0.66, cz));
    // the drum stones either side across the way's line
    for (const dz of [-1, 1]) {
      const zz = cz + dz * 0.85;
      bag.add('granite_grey', box(px - 0.16, y, zz - 0.3, px + 0.16, y + 0.3, zz + 0.3));
      bag.add('granite_grey', rod([px - 0.17, y + 0.62, zz], [px + 0.17, y + 0.62, zz], 0.34, 14));
      bag.add('slate', rod([px - 0.19, y + 0.62, zz], [px + 0.19, y + 0.62, zz], 0.2, 12));
    }
    col.rect([px - 0.55, cz - 0.55, px + 0.55, cz + 0.55], y, y + h);
  }
  const a = cx - hw, b = cx + hw;
  bag.add('lacquer_red', box(a - 0.3, y + h - 0.6, cz - 0.16, b + 0.3, y + h - 0.2, cz + 0.16));
  bag.add('lacquer_red', box(a - 0.3, y + h - 1.9, cz - 0.1, b + 0.3, y + h - 1.65, cz + 0.1));
  // the board between the beams: dark, gilt-edged, carried by short posts
  const bw = Math.min(2.8, hw * 0.4), sd = el.dir === 'n' ? -1 : 1;
  for (const sx of [-1, 1]) bag.add('lacquer_red', box(cx + sx * bw - 0.07, y + h - 1.65, cz - 0.07, cx + sx * bw + 0.07, y + h - 0.6, cz + 0.07));
  bag.add('paint_ochre', box(cx - bw, y + h - 1.62, cz + sd * 0.05, cx + bw, y + h - 0.62, cz + sd * 0.12));
  bag.add('lacquer_black', box(cx - bw + 0.1, y + h - 1.52, cz + sd * 0.12, cx + bw - 0.1, y + h - 0.72, cz + sd * 0.14));
  // tie-beam ends, little hoods over the posts' heads aside
}

/**
 * Leaves as small pointed cards (a six-point outline, two-sided material) bent in their normals toward
 * the outside of the crown, so a crown shades as one rounded mass as the engine's flora does; one
 * geometry per material (cards: [[cx, cy, cz, ux, uy, uz, vx, vy, vz, hw, hl]...]).
 */
function leafCards(list, centre, bend = 0.7) {
  const pos = [], nor = [];
  for (const c of list) {
    const [cx, cy, cz, ux, uy, uz, vx, vy, vz, hw, hl] = c;
    // the outline in the card's plane: base, two shoulders, tip (u across, v along)
    const P = [[0, -hl], [-hw, -hl * 0.1], [hw, -hl * 0.1], [-hw * 0.55, hl * 0.55], [hw * 0.55, hl * 0.55], [0, hl]];
    const W = P.map(([a, b]) => [cx + ux * a + vx * b, cy + uy * a + vy * b, cz + uz * a + vz * b]);
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    // wound so that the front face looks out of the crown (the two-sided material would otherwise turn the bent normal in)
    const wox = cx - centre[0], woy = cy - centre[1], woz = cz - centre[2], fl = -(nx * wox + ny * woy + nz * woz) < 0;
    for (const [a, b, d] of [[0, 1, 2], [1, 3, 2], [2, 3, 4], [3, 5, 4]]) for (const k of (fl ? [a, d, b] : [a, b, d])) {
      pos.push(...W[k]);
      let ox = W[k][0] - centre[0], oy = W[k][1] - centre[1], oz = W[k][2] - centre[2]; const ol = Math.hypot(ox, oy, oz) || 1; ox /= ol; oy /= ol; oz /= ol;
      let sx = nx * (1 - bend) + ox * bend, sy = ny * (1 - bend) + oy * bend, sz = nz * (1 - bend) + oz * bend;
      if (sx * ox + sy * oy + sz * oz < 0) { sx = -sx; sy = -sy; sz = -sz; }
      const sl = Math.hypot(sx, sy, sz) || 1; nor.push(sx / sl, sy / sl, sz / sl);
    }
  }
  const g = fromTriangles(pos);
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/**
 * hz_tree { at [x, z], y, kind ('camphor' | 'ginkgo' | 'willow' | 'peach'), h, seed }: an old tree of the temple court or the causeway — a buttressed, leaning trunk
 * that forks into curving limbs and twigs; the crown of leaf cards in tufts (broad dark camphor leaves, the ginkgo's fans, the peach's narrow leaves among five-petalled
 * blossom) over a dark core; the willow's drooping withes hung with narrow leaves.
 */
function hzTree(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rand = rnd(el.seed ?? 1), kind = el.kind ?? 'camphor', h = el.h ?? (kind === 'willow' ? 8 : kind === 'peach' ? 4.2 : 12);
  const trunkR = kind === 'peach' ? 0.13 : kind === 'willow' ? 0.3 : 0.5, lean = (rand() - 0.5) * 0.5, la = rand() * 6.28;
  const forkAt = kind === 'peach' ? 0.42 : kind === 'willow' ? 0.3 : 0.38;
  const tx = (t) => x + Math.cos(la) * lean * t * h * 0.3, tz = (t) => z + Math.sin(la) * lean * t * h * 0.3;
  // the trunk: a flared foot (roots), a slight twist up to the fork, bark furrows by a second thinner shell
  const prof = [[trunkR * 1.9, -0.25], [trunkR * 1.5, 0.12], [trunkR * 1.15, 0.5], [trunkR, h * forkAt * 0.4], [trunkR * 0.85, h * forkAt * 0.75], [trunkR * 0.7, h * forkAt]];
  const tg = lathe(prof, 9, null, 0, 0, 0);
  const tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) { const t = Math.max(0, tp.getY(i) / (h * forkAt)); tp.setX(i, tp.getX(i) + (tx(t) - x) + Math.sin(tp.getY(i) * 2.1 + el.seed) * trunkR * 0.08); tp.setZ(i, tp.getZ(i) + (tz(t) - z)); tp.setY(i, tp.getY(i) + y); tp.setX(i, tp.getX(i) + x); tp.setZ(i, tp.getZ(i) + z); }
  tg.computeVertexNormals();
  bag.add('bark_grey', tg);
  for (let r = 0; r < 3 && kind !== 'peach'; r++) { const a = la + 1 + r * 2.1; bag.add('bark_grey', rod([x + Math.cos(a) * trunkR * 1.2, y - 0.1, z + Math.sin(a) * trunkR * 1.2], [x + Math.cos(a) * trunkR * 2.4, y - 0.18, z + Math.sin(a) * trunkR * 2.4], trunkR * 0.3, 5)); }
  const fx = tx(forkAt), fz = tz(forkAt), fy = y + h * forkAt;
  const spec = {
    camphor: { w: 0.19, l: 0.34, tuft: 6, mats: ['doum_leaf', 'palm_leaf', 'doum_leaf'], limbs: 5, out: 0.34, rise: 0.9, cr: 0.27, n: 20 },
    ginkgo: { w: 0.2, l: 0.2, tuft: 6, mats: ['palm_leaf', 'doum_leaf', 'palm_leaf'], limbs: 5, out: 0.2, rise: 1.05, cr: 0.2, n: 20 },
    willow: { w: 0.07, l: 0.3, tuft: 5, mats: ['papyrus', 'doum_leaf', 'papyrus'], limbs: 6, out: 0.4, rise: 0.75, cr: 0.17, n: 12 },
    peach: { w: 0.06, l: 0.2, tuft: 5, mats: ['doum_leaf', 'palm_leaf', 'doum_leaf'], limbs: 4, out: 0.34, rise: 0.8, cr: 0.26, n: 22 },
  }[kind];
  const cards = [[], [], []], pink = [], threads = [], twig = [];
  const ends = [];
  for (let i = 0; i < spec.limbs; i++) {
    const a = i * 6.28 / spec.limbs + rand() * 0.8, out = spec.out * h * (0.8 + rand() * 0.4), up = h * (0.86 - forkAt) * spec.rise * (0.75 + rand() * 0.3);
    const mx = fx + Math.cos(a) * out * 0.35, mz = fz + Math.sin(a) * out * 0.35, my = fy + up * 0.55;
    const ex = fx + Math.cos(a) * out, ez = fz + Math.sin(a) * out, ey = fy + up;
    bag.add('bark_grey', rod([fx, fy - 0.15, fz], [mx, my, mz], trunkR * 0.5, 6));
    bag.add('bark_grey', rod([mx, my, mz], [ex, ey, ez], trunkR * 0.3, 5));
    ends.push([ex, ey, ez, a]);
    // twigs from the end of the limb to the leaf tufts' hearts
    for (let q = 0; q < 3; q++) { const a2 = a + (rand() - 0.5) * 1.6; ends.push([ex + Math.cos(a2) * out * 0.3, ey + (rand() - 0.2) * h * 0.1, ez + Math.sin(a2) * out * 0.3, a2]); bag.add('bark_grey', rod([ex, ey, ez], ends[ends.length - 1].slice(0, 3), trunkR * 0.14, 4)); }
  }
  // the crown's lobes: one on each limb's end and one over the fork, each a smooth dark core under leaf cards laid on its shell like scales
  const limbEnds = ends.filter((_, k) => k % 4 === 0);
  let cx = 0, cy = 0, cz = 0; for (const e of limbEnds) { cx += e[0]; cy += e[1]; cz += e[2]; } cx /= limbEnds.length; cy /= limbEnds.length; cz /= limbEnds.length;
  const cr = spec.cr * h, centre = [cx, cy + cr * 0.1, cz];
  const lobes = [...limbEnds.map((e) => [e[0], e[1], e[2]]), ...limbEnds.map((e) => [fx + (e[0] - fx) * 0.5, fy + (e[1] - fy) * 0.62, fz + (e[2] - fz) * 0.5]), [cx, cy + cr * 0.6, cz]];
  const coreMat = kind === 'ginkgo' ? 'palm_leaf' : 'flax_leaf';
  const R = cr * (kind === 'willow' ? 0.75 : 0.9), per = Math.round(kind === 'peach' ? 60 : kind === 'willow' ? 90 : 200 * (R / 3) ** 2 + 60);
  for (const [lx, ly, lz] of lobes) {
    const ry = R * (kind === 'willow' ? 0.8 : 0.85);
    if (kind !== 'willow') bag.add(coreMat, lathe(Array.from({ length: 9 }, (_, q) => { const t = q / 8 * Math.PI; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; }), 14).scale(R * 0.8, ry * 0.8, R * 0.8).translate(lx, ly, lz));
    for (let t = 0; t < per; t++) {
      const th = rand() * 6.28, ph = Math.acos(rand() * 1.7 - 0.7);                    // not much of the underside
      let nx = Math.cos(th) * Math.sin(ph), ny = Math.cos(ph), nz = Math.sin(th) * Math.sin(ph);
      const px = lx + nx * R, py = ly + ny * ry, pz = lz + nz * R;
      // the card lies along the shell (v a random tangent), tilted out a little at the tip
      let vx = rand() - 0.5, vy = rand() - 0.5, vz = rand() - 0.5; const dd = vx * nx + vy * ny + vz * nz; vx -= nx * dd; vy -= ny * dd; vz -= nz * dd;
      const vl = Math.hypot(vx, vy, vz) || 1; vx = vx / vl + nx * 0.35; vy = vy / vl + ny * 0.35 - (kind === 'willow' ? 0.3 : 0); vz = vz / vl + nz * 0.35;
      const vl2 = Math.hypot(vx, vy, vz); vx /= vl2; vy /= vl2; vz /= vl2;
      let ux = vy * nz - vz * ny, uy = vz * nx - vx * nz, uz = vx * ny - vy * nx; const ul = Math.hypot(ux, uy, uz) || 1; ux /= ul; uy /= ul; uz /= ul;
      const sz = 0.85 + rand() * 0.5;
      cards[t % 3].push([px, py, pz, ux, uy, uz, vx, vy, vz, spec.w * sz * 1.15, spec.l * sz * 1.15]);
      if (kind === 'peach' && rand() < 0.45) {
        const ax = Math.abs(ny) > 0.9 ? [1, 0, 0] : [0, 1, 0];
        const bx = ax[1] * nz - ax[2] * ny, by = ax[2] * nx - ax[0] * nz, bz = ax[0] * ny - ax[1] * nx, bl = Math.hypot(bx, by, bz) || 1;
        const e1 = [bx / bl, by / bl, bz / bl], e2 = [ny * e1[2] - nz * e1[1], nz * e1[0] - nx * e1[2], nx * e1[1] - ny * e1[0]], rb = 0.1 + rand() * 0.04;
        const q0 = [px + nx * 0.06, py + ny * 0.06, pz + nz * 0.06], ring = (an, k) => [0, 1, 2].map((c) => q0[c] + (e1[c] * Math.cos(an) + e2[c] * Math.sin(an)) * rb * k + (k > 1 ? [nx, ny, nz][c] * 0.015 : 0));
        for (let p = 0; p < 5; p++) { const a1 = p * 1.2566; pink.push(...q0, ...ring(a1, 0.75), ...ring(a1 + 0.6283, 1.25), ...q0, ...ring(a1 + 0.6283, 1.25), ...ring(a1 + 1.2566, 0.75)); }
      }
    }
    if (kind === 'willow') for (let t = 0; t < 14; t++) {
      // a withe hanging from the lobe's rim: a curved thread with narrow leaves along it, down to near the ground
      const th = rand() * 6.28, sx = lx + Math.cos(th) * R * 0.95, sz2 = lz + Math.sin(th) * R * 0.95, top = ly - ry * 0.1 - rand() * ry * 0.5;
      const len = Math.min(top - y - 0.9, h * (0.42 + rand() * 0.3)), nseg = 6, drift = [(rand() - 0.5) * 0.7, (rand() - 0.5) * 0.7];
      let px = sx, py = top, pz = sz2;
      for (let s = 1; s <= nseg; s++) {
        const f = s / nseg, qx = sx + drift[0] * f * f + Math.cos(th) * 0.3 * Math.sin(f * 3), qy = top - len * f, qz = sz2 + drift[1] * f * f + Math.sin(th) * 0.3 * Math.sin(f * 3);
        threads.push(rod([px, py, pz], [qx, qy, qz], 0.011, 3));
        for (const sd of [-1, 1]) cards[(s + (sd > 0 ? 1 : 0)) % 3].push([qx, qy + 0.1, qz, Math.cos(th + 1.57 * sd), 0.15, Math.sin(th + 1.57 * sd), 0.12 * sd, -1, 0.1, spec.w * 1.3, spec.l * (0.9 + rand() * 0.3)]);
        px = qx; py = qy; pz = qz;
      }
    }
  }
  cards.forEach((c, i) => c.length && bag.add(spec.mats[i], leafCards(c, centre)));
  if (pink.length) bag.add('stucco_rose', fromTriangles(pink));
  for (const g of threads) bag.add('bark_grey', g);
  col.circle(x, z, trunkR * 1.3, y, y + 3);
}

/**
 * hz_bank { x, z0, z1, y (the causeway's top), half (the bank's half width), path (half width of the path) }: the causeway's edge: a revetment of granite blocks along the
 * water with a coping, bollards every 6 m for mooring, the path edged by kerbs of granite and the earth between kept green with tufts of grass; the path's slabs laid
 * (as the courts') with the middle worn.
 */
function hzBank(el, ctx) {
  const { bag } = ctx, { x, z0, z1 } = el, y = el.y ?? 0, hw = el.half ?? 11, pw = el.path ?? 2.6, rand = rnd(el.seed ?? 4);
  for (const s of [-1, 1]) {
    const xe = x + s * hw;
    const [a, b] = s < 0 ? [xe - 0.05, xe + 0.45] : [xe - 0.45, xe + 0.05];
    bag.add('granite_block', box(a, y - 1.2, z0, b, y - 0.05, z1));     // the coping and the face below it over the water
    bag.add('granite_grey', box(a - 0.03 * s, y - 0.05, z0, b + 0.03 * -s, y + 0.08, z1));
    // blocks on the face, seams: vertical joints in a dark thin band every 1.4 m
    for (let zz = z0; zz < z1; zz += 1.4) bag.add('slate', box(s < 0 ? a - 0.012 : b - 0.0, y - 1.2, zz, s < 0 ? a : b + 0.012, y - 0.1, zz + 0.04));
    for (let zz = z0 + 3; zz < z1 - 2; zz += 6) {
      bag.add('granite_grey', lathe([[0.001, 0], [0.2, 0], [0.18, 0.4], [0.24, 0.5], [0.12, 0.62], [0.001, 0.62]], 8, null, xe - s * 0.3, y + 0.08, zz));
    }
    // the kerb along the path
    bag.add('granite_grey', box(x + s * pw - 0.1, y + 0.0, z0, x + s * pw + 0.1, y + 0.14, z1));
  }
  // a path of slabs with worn middle
  courtPaving({ y: y + 0.04, seed: el.seed ?? 4, rects: [[x - pw + 0.1, z0, x + pw - 0.1, z1]] }, ctx);
  // grass tufts and sedge on the earth either side of the path
  const tufts = [];
  for (const s of [-1, 1]) bag.add('sod', box(x + s * (pw + 0.12) - (s < 0 ? hw - pw - 0.5 : 0), y, z0, x + s * (pw + 0.12) + (s > 0 ? hw - pw - 0.5 : 0), y + 0.03, z1));
  for (let n = 0; n < (z1 - z0) * 3; n++) {
    const s = rand() < 0.5 ? -1 : 1, px = x + s * (pw + 0.4 + rand() * (hw - pw - 1.2)), pz = z0 + rand() * (z1 - z0);
    for (let q = 0; q < 3; q++) tufts.push(rod([px, y, pz], [px + (rand() - 0.5) * 0.3, y + 0.16 + rand() * 0.22, pz + (rand() - 0.5) * 0.3], 0.008, 3));
  }
  for (const g of tufts) bag.add('bark_olive', g);
}

/**
 * hz_wall_skin: the brick facing of the city wall { a [x, z], b [x, z] (one run, along x or z), n (±1: the side the face looks toward, in z for a run along x, in x for a run
 * along z), off (the face's coordinate at yBase), batter (how far the face leans in over the height), yBase, y0, y1, seed }: a granite plinth, the grey brick in courses (the mortar
 * lines a hair proud and dark), a pilaster every 7 m, a corbelled string course under the parapet, and patches where the facing was repaired in lighter plaster. [inferred: the Song
 * city wall, rammed earth faced with brick at its foot and in repairs (docs/settlements/song-hangzhou.md §12)]
 */
function hzWallSkin(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, n = el.n ?? 1, rand = rnd(el.seed ?? 5), yb = el.yBase ?? -0.5, y0 = el.y0 ?? -0.1, y1 = el.y1, H = y1 - yb, bat = el.batter ?? 0, off = el.off;
  const alongX = Math.abs(bz - az) < 1e-6, u0 = alongX ? Math.min(ax, bx) : Math.min(az, bz), u1 = alongX ? Math.max(ax, bx) : Math.max(az, bz);
  const f = (y) => off - n * bat * (y - yb) / H;
  const P = (u, y, d) => (alongX ? [u, y, f(y) + n * d] : [f(y) + n * d, y, u]);
  const layer = (out, p, q, ya, yc, d0, d1) => hexa(out, [P(p, ya, d0), P(q, ya, d0), P(q, ya, d1), P(p, ya, d1), P(p, yc, d0), P(q, yc, d0), P(q, yc, d1), P(p, yc, d1)]);
  const plinth = [], brick = [], mortar = [], pil = [], str = [], patch = [], cap = [];
  const yp = Math.min(y0 + 1.7, y1);
  layer(plinth, u0, u1, y0, yp, 0, 0.12);
  layer(cap, u0, u1, yp, yp + 0.1, 0, 0.17);
  layer(brick, u0, u1, yp + 0.1, y1 - 0.3, 0, 0.05);
  for (let y = yp + 0.4; y < y1 - 0.5; y += 0.34) layer(mortar, u0, u1, y, y + 0.022, 0.05, 0.062);
  if (u1 - u0 > 2) layer(str, u0 + 0.02, u1 - 0.02, y1 - 2.3, y1 - 2.05, 0, 0.2);
  for (let u = u0 + 3 + rand() * 2; u < u1 - 1.5; u += 6.5 + rand() * 1.5) {
    layer(pil, u - 0.32, u + 0.32, yp + 0.1, y1 - 2.3, 0.05, 0.2); layer(plinth, u - 0.4, u + 0.4, y0, yp + 0.1, 0.1, 0.24);
  }
  for (let k = 0; k < Math.ceil((u1 - u0) / 9); k++) {
    const w = 0.9 + rand() * 1.6, u = u0 + rand() * Math.max(0.1, u1 - u0 - w), ya = yp + 0.5 + rand() * (y1 - yp - 5), h = 0.7 + rand() * 1.6;
    layer(patch, u, u + w, ya, Math.min(ya + h, y1 - 2.5), 0.05, 0.068);
  }
  bag.add('granite_block', fromTriangles([...plinth])); bag.add('granite_grey', fromTriangles([...cap, ...str]));
  bag.add('brick_grey', fromTriangles([...brick, ...pil])); bag.add('slate', fromTriangles(mortar)); bag.add('plaster_damp', fromTriangles(patch));
}

/**
 * hz_gate { rect [x0, z0, x1, z1] (the gate block, the way through along z), w (the passage), spring (its jambs' height), rise (the segmental arch's rise), H (the platform's top),
 * y, seed }: a city gate of Lin'an faced in brick — a segmental brick vault (courses of mortar rings across the soffit), jambs with a granite plinth and coursed brick, a ring of
 * granite voussoirs on each portal with a keystone and impost blocks, the facade faced as the wall, a string course under the platform's edge, the passage paved in granite slabs worn
 * into two wheel tracks, and the two door leaves swung back against the jambs at the outer portal (timber boards, iron straps, rows of iron studs, a ring handle). [inferred: Song
 * city gates were timber-lined passages or brick vaults; Lin'an's walls were brick-faced from the Southern Song (docs/settlements/song-hangzhou.md §12)]
 */
function hzGate(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, w = el.w ?? 10, sp = el.spring ?? 4.4, rise = el.rise ?? 3.0, Hh = el.H ?? 9.6, rand = rnd(el.seed ?? 3);
  const c = (x0 + x1) / 2, hw = w / 2, R = (hw * hw + rise * rise) / (2 * rise), cy = y + sp + rise - R;
  const Y = (o) => cy + Math.sqrt(Math.max(0, R * R - o * o));
  const outer = el.outer === 'n' ? z0 : z1;                       // the outer portal's z (the doors stand here); default: the north face... see below
  const outerIsZ0 = el.outer !== 's';
  void outer;
  // ── the masses either side, and the vault's spandrels as stepped columns above the arch
  const sideL = [x0, z0, c - hw, z1], sideR = [c + hw, z0, x1, z1];
  for (const r of [sideL, sideR]) { bag.add('brick_grey', box(r[0], y - 0.3, r[1], r[2], y + Hh, r[3])); col.rect(r, y - 0.3, y + Hh); }
  const N = 28, os = Array.from({ length: N + 1 }, (_, i) => -hw + w * i / N);
  for (let i = 0; i < N; i++) {
    const ya = Math.max(Y(os[i]), Y(os[i + 1]));
    bag.add('brick_grey', box(c + os[i], ya, z0, c + os[i + 1], y + Hh, z1));
  }
  col.rect([c - hw, z0, c + hw, z1], y + sp + 0.3, y + Hh); col.floor([x0, z0, x1, z1], y + Hh);
  // the soffit: strips of brick (thick, into the vault) and the mortar rings of the courses
  const soff = [], ring = [];
  for (let i = 0; i < N; i++) {
    const a = [c + os[i], Y(os[i])], b = [c + os[i + 1], Y(os[i + 1])];
    hexa(soff, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1], [a[0], a[1] + 0.3, z0], [b[0], b[1] + 0.3, z0], [b[0], b[1] + 0.3, z1], [a[0], a[1] + 0.3, z1]]);
  }
  for (let z = z0 + 0.35; z < z1 - 0.2; z += 0.46) for (let i = 0; i < N; i++) {
    const a = [c + os[i], Y(os[i]) - 0.014], b = [c + os[i + 1], Y(os[i + 1]) - 0.014];
    hexa(ring, [[a[0], a[1], z], [b[0], b[1], z], [b[0], b[1], z + 0.03], [a[0], a[1], z + 0.03], [a[0], a[1] + 0.02, z], [b[0], b[1] + 0.02, z], [b[0], b[1] + 0.02, z + 0.03], [a[0], a[1] + 0.02, z + 0.03]]);
  }
  bag.add('brick_grey', fromTriangles(soff)); bag.add('slate', fromTriangles(ring));
  // ── the jambs: a granite plinth with a cap, brick between, mortar courses, an impost block at the springing
  const mort = [];
  for (const s of [-1, 1]) {
    const xi = c + s * hw, xo = (d) => xi - s * d;
    bag.add('granite_block', box(Math.min(xo(0), xo(0.07)), y - 0.05, z0, Math.max(xo(0), xo(0.07)), y + 0.95, z1));
    bag.add('granite_grey', box(Math.min(xo(0), xo(0.14)), y + 0.95, z0, Math.max(xo(0), xo(0.14)), y + 1.05, z1));
    bag.add('granite_grey', box(Math.min(xo(0), xo(0.16)), y + sp - 0.3, z0, Math.max(xo(0), xo(0.16)), y + sp, z1));
    for (let yy = y + 1.3; yy < y + sp - 0.4; yy += 0.3) hexa(mort, [[xo(0), yy, z0], [xo(0.012), yy, z0], [xo(0.012), yy, z1], [xo(0), yy, z1], [xo(0), yy + 0.022, z0], [xo(0.012), yy + 0.022, z0], [xo(0.012), yy + 0.022, z1], [xo(0), yy + 0.022, z1]]);
  }
  bag.add('slate', fromTriangles(mort));
  // ── the portals: a ring of voussoirs round the arch on each face, a keystone, the facade's brick either side, a string course under the platform's edge
  const th0 = Math.asin(hw / R), NV = 19;
  for (const [zf, n] of [[z0, -1], [z1, 1]]) {
    const vs = [];
    for (let k = 0; k < NV; k++) {
      const a0 = -th0 + 2 * th0 * k / NV + 0.006, a1 = -th0 + 2 * th0 * (k + 1) / NV - 0.006, key = k === (NV - 1) / 2, ro = R + (key ? 1.0 : 0.72), d = key ? 0.24 : k % 2 ? 0.16 : 0.12;
      const pt = (ang, r, dd) => [c + Math.sin(ang) * r, cy + Math.cos(ang) * r, zf + n * dd];
      hexa(vs, [pt(a0, R - 0.02, 0), pt(a1, R - 0.02, 0), pt(a1, ro, 0), pt(a0, ro, 0), pt(a0, R - 0.02, d), pt(a1, R - 0.02, d), pt(a1, ro, d), pt(a0, ro, d)]);
    }
    bag.add('granite_block', fromTriangles(vs));
    // impost blocks at the springing, each side
    for (const s of [-1, 1]) bag.add('granite_block', box(Math.min(c + s * hw - 0.2 * s, c + s * (hw + 0.8)), y + sp - 0.55, n < 0 ? zf - 0.2 : zf, Math.max(c + s * hw - 0.2 * s, c + s * (hw + 0.8)), y + sp + 0.05, n < 0 ? zf : zf + 0.2));
    // the string course under the platform's edge, and the brick facing of the two sides
    bag.add('granite_grey', box(x0, y + Hh - 1.2, n < 0 ? zf - 0.22 : zf, x1, y + Hh - 0.95, n < 0 ? zf : zf + 0.22));
    bag.add('granite_grey', box(x0, y + Hh - 0.1, n < 0 ? zf - 0.28 : zf, x1, y + Hh + 0.02, n < 0 ? zf : zf + 0.28));
    for (const [p, q] of [[x0, c - hw - 1.4], [c + hw + 1.4, x1]]) hzWallSkin({ a: [p, zf], b: [q, zf], n, off: zf, batter: 0, yBase: y - 0.3, y0: y, y1: y + Hh - 1.2, seed: Math.round(p + zf) }, { bag });
  }
  // ── the paving: granite slabs on a bed, laid in rows, the two wheel tracks worn down and darker; the kerb stones at the foot of the jambs
  const bedT = [], slabsOk = [], slabsTrack = [];
  bag.add('slate', box(c - hw, y - 0.14, z0, c + hw, y - 0.02, z1));
  const trackAt = (xm) => Math.abs(Math.abs(xm - c) - 1.5) < 0.42;
  for (let z = z0, row = 0; z < z1 - 0.01; z += 1.25, row++) for (let k = -1; k < 8; k++) {
    const xa = c - hw + w * k / 8 + (row % 2 ? 0.45 : 0), xa2 = Math.max(c - hw, xa), xb = Math.min(c + hw, xa + w / 8);
    if (xb - xa2 < 0.08) continue;
    const zb = Math.min(z1, z + 1.25), tr = trackAt((xa2 + xb) / 2);
    (tr ? slabsTrack : slabsOk).push([xa2 + 0.012, zb - 0.012, xb - 0.012, z + 0.012, tr ? y - 0.05 : y + 0.02 - rand() * 0.012]);
  }
  for (const [a, b, c2, d, t] of slabsOk) bag.add('granite_block', box(a, y - 0.1, d, c2, t, b));
  for (const [a, b, c2, d, t] of slabsTrack) bag.add('granite_grey', box(a, y - 0.1, d, c2, t, b));
  // ── the door leaves swung back against the jambs at the outer portal: boards, iron straps and studs, a ring
  const zd = outerIsZ0 ? z0 + 0.15 : z1 - 5.15, lw = 5.0, lh = sp - 0.15, tD = 0.2;
  for (const s of [-1, 1]) {
    const g0 = 0.19, xa = s > 0 ? c + hw - g0 - tD : c - hw + g0, xb = xa + tD;
    for (let b = 0; b < 20; b++) bag.add(b % 3 === 0 ? 'wood_dark' : 'timber', box(xa, y, zd + b * (lw / 20) + 0.004, xb, y + lh, zd + (b + 1) * (lw / 20) - 0.004));
    const face = s < 0 ? xb : xa, sgn = s < 0 ? 1 : -1;
    for (const hy of [0.7, lh * 0.5, lh - 0.7]) bag.add('iron', box(Math.min(face, face + sgn * 0.03), y + hy - 0.09, zd, Math.max(face, face + sgn * 0.03), y + hy + 0.09, zd + lw));
    for (const hy of [0.7, lh * 0.5, lh - 0.7]) for (let k = 0; k < 11; k++) for (const dy of [-0.05, 0.05]) { const zz = zd + 0.25 + k * 0.45; bag.add('iron', box(Math.min(face + sgn * 0.03, face + sgn * 0.07), y + hy + dy - 0.035 + (dy > 0 ? 0.04 : -0.04), zz - 0.035, Math.max(face + sgn * 0.03, face + sgn * 0.07), y + hy + dy + 0.035 + (dy > 0 ? 0.04 : -0.04), zz + 0.035)); }
    bag.add('iron', lathe([[0.001, 0], [0.12, 0], [0.13, 0.03], [0.001, 0.05]], 8, null, 0, 0, 0).rotateZ(s < 0 ? -Math.PI / 2 : Math.PI / 2).translate(face + sgn * 0.07, y + 1.5, zd + lw * 0.5 + 0.02));
    col.rect([Math.min(xa, xb) - 0.02, zd, Math.max(xa, xb) + 0.08, zd + lw], y, y + lh);
  }
}

/**
 * hz_landing { rect [x0, z0, x1, z1] (the jetty reaching west from the bank), y (its deck's top = the bank), bed, seed }: planks laid across with their gaps and nails' darker
 * ends, a timber kerb, piles each side every 2.2 m with iron rings and a cap, a bollard at the end, a stone step at the bank, and on the deck the boatmen's gear: a punting pole
 * laid along the rail, a basket, a coil of rope and a lantern post. [inferred]
 */
function hzLanding(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rnd(el.seed ?? 2), xe = x0, t = [];
  for (let x = x0; x < x1 - 0.01; x += 0.32) bag.add(rand() < 0.3 ? 'wood_dark' : 'planks_grey', box(x + 0.012, y - 0.01, z0 + 0.1, Math.min(x + 0.32, x1) - 0.012, y + 0.05, z1 - 0.1));
  for (const z of [z0, z1 - 0.12]) bag.add('timber', box(x0, y - 0.12, z, x1, y + 0.1, z + 0.12));
  for (let x = x0 + 0.3; x < x1; x += 2.2) for (const z of [z0 - 0.02, z1 + 0.02]) {
    bag.add('timber', rod([x, el.bed, z], [x, y + 0.5, z], 0.09, 6));
    bag.add('timber', lathe([[0.001, 0], [0.1, 0], [0.11, 0.05], [0.001, 0.07]], 6, null, x, y + 0.5, z));
    bag.add('iron', rod([x, y - 0.1, z + (z < (z0 + z1) / 2 ? -0.1 : 0.1)], [x, y + 0.18, z + (z < (z0 + z1) / 2 ? -0.1 : 0.1)], 0.015, 4));
    col.circle(x, z, 0.1, y, y + 0.6);
  }
  bag.add('wood_dark', lathe([[0.001, 0], [0.13, 0], [0.1, 0.35], [0.16, 0.42], [0.001, 0.42]], 7, null, xe + 0.3, y + 0.05, (z0 + z1) / 2));
  for (let i = 0; i < 3; i++) bag.add('granite_block', box(x1 - 0.1 * (i + 1) - 0.5 * i, y - 0.1 - 0.12 * i - 0.12, z0 + 0.3, x1 + 0.6 - 0.5 * i, y - 0.1 - 0.12 * i, z1 - 0.3));
  // the gear
  const zm = (z0 + z1) / 2;
  bag.add('bamboo_culm', rod([x0 + 1.5, y + 0.12, z0 + 0.35], [x1 - 1.0, y + 0.16, z0 + 0.38], 0.022, 5));
  bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.25], [0.28, 0.32], [0.001, 0.32]], 8, null, x0 + 4.5, y + 0.05, zm + 0.3));
  for (let k = 0; k < 4; k++) bag.add('rope_fibre', lathe([[0.16, 0], [0.2, 0.02], [0.2, 0.05], [0.16, 0.06]], 10, null, x0 + 7.5, y + 0.05 + k * 0.05, zm - 0.3));
  bag.add('wood_dark', rod([x1 - 2.2, y, z1 - 0.2], [x1 - 2.2, y + 1.7, z1 - 0.2], 0.04, 5));
  bag.add('lamp_paper', lathe([[0.001, -0.14], [0.1, -0.08], [0.12, 0], [0.1, 0.08], [0.001, 0.14]], 8, null, x1 - 2.2, y + 1.5, z1 - 0.2));
  void t;
}

export const HANGZHOU_ELEMENTS = { hz_shell: hzShell, hz_imperial_way: imperialWay, view_tent: viewTent, tea_house: teaHouse, kaihua_hall: kaihuaHall, temple_gate: templeGate, court_censer: courtCenser, luohan_hall: luohanHall, hall_ceiling: hallCeiling, lake_boat: lakeBoat, sutra_pillar: sutraPillar, liuhe_pagoda: liuhePagoda, hall_offerings: hallOfferings, court_paving: courtPaving, hz_stair: hzStair, hz_lion_pair: hzLionPair, hz_wutou: hzWutou, hz_tree: hzTree, hz_bank: hzBank, hz_wall_skin: hzWallSkin, hz_gate: hzGate, hz_landing: hzLanding };
