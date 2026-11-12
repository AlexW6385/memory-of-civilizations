// Brasília style — a superquadra block (Costa, 1950s–60s): six floors of flats on open pilotis, balconies with washing and plants on the
// south, brise-soleil on the north, Athos Bulcão's tiled end walls; under the pilotis a lobby one can enter (letter boxes, the stair, the
// lift), bicycles, benches and planters; paths of paving to the lanes; weathering of the red dust at the foot and rain streaks.
import { box, lathe, rod } from '../../core/geom.js';
import { wedgeX } from './util.js';
import { rngOf, solidBox, shrub, letters } from './kit.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';
const LAUNDRY = ['cloth_white', 'cloth_blue', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_maroon'];

/** superblock: { rect (56 × 11.6, long along x), h, pilotis, seed, tile (0 | 1) } */
export function superblock(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 21.6, p = el.pilotis ?? 3.6, rand = rngOf(el.seed), L = x1 - x0, mid = (z0 + z1) / 2;
  bag.add('facade_grey', box(x0, p, z0 + 0.5, x1, h, z1 - 0.5));
  for (let y = p; y < h; y += 3.0) bag.add(WHITE, box(x0 - 0.12, y, z0 + 0.4, x1 + 0.12, y + 0.26, z1 - 0.4));
  // south balconies: a slab and a railing at each floor; on the lower floors washing on lines, towels over the rail, potted plants
  let fl = 0;
  for (let y = p + 3.0; y < h; y += 3.0, fl++) for (let x = x0 + 3; x < x1 - 3; x += 9.3) {
    bag.add(CONC, box(x, y - 0.1, z1 - 0.5, x + 7.4, y + 0.1, z1 + 1.15)); bag.add('steel_grey', box(x, y + 0.1, z1 + 1.1, x + 7.4, y + 1.05, z1 + 1.14));
    for (const e of [0, 7.36]) bag.add('steel_grey', box(x + e, y + 0.1, z1 - 0.5, x + e + 0.04, y + 1.05, z1 + 1.14));
    if (fl < 4) {
      if (rand() < 0.45) { const nw = 1 + Math.floor(rand() * 3); bag.add('steel_grey', rod([x + 0.5, y + 1.6, z1 + 0.9], [x + 6.9, y + 1.6, z1 + 0.9], 0.012, 4)); for (let k = 0; k < nw; k++) { const cx = x + 0.8 + rand() * 5.0; bag.add(LAUNDRY[Math.floor(rand() * LAUNDRY.length)], box(cx, y + 0.85, z1 + 0.88, cx + 0.5 + rand() * 0.4, y + 1.6, z1 + 0.92)); } }
      if (rand() < 0.4) bag.add(LAUNDRY[Math.floor(rand() * LAUNDRY.length)], box(x + 1 + rand() * 4, y + 0.55, z1 + 1.14, x + 2.2 + rand() * 4, y + 1.05, z1 + 1.17));
      for (let k = 0; k < 3; k++) if (rand() < 0.45) { const px = x + 0.5 + rand() * 6.4; bag.add('terracotta', lathe([[0.12, 0], [0.16, 0.28], [0.001, 0.28]], 7, null, px, y + 0.1, z1 + 0.85)); shrub(bag, px, z1 + 0.85, y + 0.38, 0.22, 'palm_leaf'); }
      if (rand() < 0.2) bag.add('cloth_red', box(x + 1.5, y + 0.2, z1 + 0.5, x + 2.3, y + 0.24, z1 + 1.0));            // a hammock folded, a mat
    }
    // the sliding door's glass and a curtain behind it on the façade
    bag.add('glass_outer', box(x + 0.6, y + 0.1, z1 - 0.52, x + 6.8, y + 2.6, z1 - 0.5));
    if (rand() < 0.55) bag.add(LAUNDRY[Math.floor(rand() * 3) + 3] ?? 'cloth_white', box(x + 0.8, y + 0.3, z1 - 0.54, x + 2.0 + rand() * 3, y + 2.5, z1 - 0.52));
  }
  // north brise-soleil: concrete fins before the glazing
  for (let x = x0 + 1.2; x < x1 - 1; x += 1.4) bag.add(WHITE, box(x, p + 0.2, z0 - 0.5, x + 0.1, h - 0.3, z0 + 0.5));
  // rain streaks under the balconies' slabs and the fins' foot, and the red dust of the plateau splashed up the lowest metre
  for (let k = 0; k < 18; k++) { const x = x0 + 1 + rand() * (L - 2), len = 3 + rand() * 9; bag.add('plaster_streak', box(x, h - len, z1 - 0.52, x + 0.3 + rand() * 0.3, h - 0.3, z1 - 0.5)); }
  bag.add('laterite', box(x0, 0, z0 + 0.4, x1, 0.01, z0 + 0.45));
  // the azulejo end walls (Athos Bulcão's panels): a grid of blue and white tiles
  for (const [xa, dir] of [[x0, -1], [x1, 1]]) {
    const xa0 = dir < 0 ? xa - 0.14 : xa, xa1 = dir < 0 ? xa : xa + 0.14;
    bag.add(WHITE, box(xa0, p, z0 + 0.4, xa1, h, z1 - 0.4));
    const nx = 9, ny = 14, sz = (z1 - z0 - 1.4) / nx, sy = (h - p - 0.6) / ny;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const on = el.tile ? (j % 4 < 2) !== (i % 3 === 0) : ((i + j) % 3 === 0);
      if (!on) continue;
      bag.add('tile_lapis', box(dir < 0 ? xa - 0.22 : xa + 0.14, p + 0.3 + j * sy, z0 + 0.7 + i * sz + 0.05, dir < 0 ? xa - 0.14 : xa + 0.22, p + 0.3 + (j + 1) * sy - 0.05, z0 + 0.7 + (i + 1) * sz - 0.05));
    }
  }
  bag.add(WHITE, box(x0 - 0.3, h, z0 + 0.1, x1 + 0.3, h + 0.5, z1 - 0.1));
  for (const t of [0.25, 0.75]) bag.add(CONC, box(x0 + L * t - 2.0, h + 0.5, mid - 2.4, x0 + L * t + 2.0, h + 3.3, mid + 2.4));
  bag.add(WHITE, lathe([[1.6, 0], [1.6, 2.6], [1.4, 2.8], [0.001, 2.8]], 14, null, x0 + L * 0.5, h + 0.5, mid));
  // pilotis: piers in two files
  for (let x = x0 + 2; x <= x1 - 1.9; x += 6.9) for (const z of [z0 + 1.5, z1 - 1.5]) { bag.add(WHITE, lathe([[0.3, 0], [0.26, p - 0.3], [0.3, p]], 8, null, x, 0, z)); col.circle(x, z, 0.4, 0, p); }
  bag.add('marble', box(x0 + 0.5, 0.0, z0 + 0.5, x1 - 0.5, 0.05, z1 - 0.5));
  col.rect([x0, z0 + 0.4, x1, z1 - 0.4], p, h);
  // the two lobbies: walls of white with a glazed south front and its door, the letter boxes, the lift, the stair rising behind a rail
  for (const t of [0.26, 0.74]) {
    const xc = x0 + L * t, cx0 = xc - 3.2, cx1 = xc + 3.2, zs = z0 + 2.4, ze = z1 - 2.4, T = 0.25, door = [xc - 0.9, xc + 0.9];
    solidBox(bag, col, WHITE, cx0, 0, zs, cx0 + T, p, ze); solidBox(bag, col, WHITE, cx1 - T, 0, zs, cx1, p, ze); solidBox(bag, col, WHITE, cx0 + T, 0, zs, cx1 - T, p, zs + T);
    for (const [a, b] of [[cx0 + T, door[0]], [door[1], cx1 - T]]) { bag.add('glass_outer', box(a, 0.1, ze - 0.06, b, 2.7, ze)); col.rect([a, ze - 0.08, b, ze], 0, 2.7); bag.add(WHITE, box(a, 2.7, ze - 0.2, b, p, ze)); col.rect([a, ze - 0.2, b, ze], 2.7, p); }
    bag.add(WHITE, box(door[0], 2.7, ze - 0.2, door[1], p, ze)); col.rect([door[0], ze - 0.2, door[1], ze], 2.7, p);
    bag.add('steel_chrome', box(door[0] - 0.05, 0, ze - 0.05, door[0], 2.7, ze + 0.03)); bag.add('steel_chrome', box(door[1], 0, ze - 0.05, door[1] + 0.05, 2.7, ze + 0.03));
    bag.add('marble_dark', box(cx0 + T, 0, zs + T, cx1 - T, 0.05, ze)); col.floor([cx0 + T, zs + T, cx1 - T, ze], 0.05);
    // letter boxes on the west wall: a grid of small steel doors
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) bag.add(r % 2 ? 'steel_grey' : 'steel_chrome', box(cx0 + T, 1.0 + r * 0.22, zs + 1.0 + c * 0.38, cx0 + T + 0.05, 1.18 + r * 0.22, zs + 1.32 + c * 0.38));
    // the lift on the back wall; the stair (visible, fenced) on the east side climbing to the ceiling; a bench, a plant
    bag.add('steel_chrome', box(xc - 1.0, 0, zs + T, xc + 0.8, 2.2, zs + T + 0.04)); bag.add('steel_grey', box(xc - 1.2, 1.0, zs + T, xc - 1.1, 1.3, zs + T + 0.05));
    const sx0 = xc + 1.0, sx1 = cx1 - T;
    bag.add('concrete_light', wedgeX(sx0, sx1, zs + 0.8, zs + 2.8, 0.06, p - 0.2, 0.05)); col.rect([sx0, zs + 0.8, sx1, zs + 2.8], 0, p);
    bag.add('steel_grey', box(sx0, 0.05, zs + 2.8, sx1, 1.0, zs + 2.84)); bag.add('steel_grey', box(sx0, 0.05, zs + 0.76, sx1, 1.0, zs + 0.8));
    solidBox(bag, col, 'leather_bench', cx0 + T + 0.8, 0, ze - 1.1, cx0 + T + 2.0, 0.45, ze - 0.6);
    shrub(bag, cx1 - T - 0.7, ze - 0.8, 0, 0.45, 'palm_leaf'); bag.add('terracotta', lathe([[0.2, 0], [0.25, 0.4], [0.001, 0.4]], 8, null, cx1 - T - 0.7, 0, ze - 0.8));
    bag.add('lamp_white', box(xc - 0.5, p - 0.12, (zs + ze) / 2 - 0.3, xc + 0.5, p - 0.02, (zs + ze) / 2 + 0.3));
    letters(bag, 'cloth_white', xc, 2.35, ze - 0.02, 4, 'z-', rand, 0.25, 0.2);
    lights.push({ at: [xc, 3.0, (zs + ze) / 2], color: '#ffe8c0', intensity: 2.2, distance: 8 });
    // the path of paving from the door to the lane south, and a bench and a bin at its side
    bag.add('concrete_light', box(xc - 0.8, 0, ze, xc + 0.8, 0.02, z1 + 13.0));
  }
  // under the pilotis: bicycles leaning on the piers, a couple of benches, planters between the piers; a child's cart
  for (let x = x0 + 2; x <= x1 - 1.9; x += 6.9) {
    if (rand() < 0.4) { const bx = x + 0.7, bz = z1 - 1.0; bag.add('steel_grey', rod([bx - 0.5, 0.3, bz], [bx + 0.5, 0.3, bz], 0.02, 4)); bag.add('steel_grey', rod([bx - 0.5, 0.3, bz], [bx, 0.8, bz], 0.02, 4)); bag.add('steel_grey', rod([bx + 0.5, 0.3, bz], [bx + 0.1, 0.85, bz], 0.02, 4)); bag.add('rubber', box(bx - 0.62, 0, bz - 0.02, bx - 0.38, 0.6, bz + 0.02)); bag.add('rubber', box(bx + 0.38, 0, bz - 0.02, bx + 0.62, 0.6, bz + 0.02)); }
    else if (rand() < 0.4) { solidBox(bag, col, CONC, x + 1.0, 0, z1 - 1.7, x + 2.4, 0.5, z1 - 0.9); shrub(bag, x + 1.7, z1 - 1.3, 0.5, 0.45, 'palm_leaf'); }
  }
  for (let k = 0; k < 3; k++) { const bx = x0 + 9 + rand() * (L - 18); if ((bx > x0 + L * 0.26 - 5 && bx < x0 + L * 0.26 + 5) || (bx > x0 + L * 0.74 - 5 && bx < x0 + L * 0.74 + 5)) continue; solidBox(bag, col, 'timber', bx, 0.42, mid - 0.3 + 1.2, bx + 1.8, 0.48, mid + 0.3 + 1.2); bag.add(CONC, box(bx + 0.1, 0, mid + 0.95, bx + 0.2, 0.42, mid + 1.45)); bag.add(CONC, box(bx + 1.6, 0, mid + 0.95, bx + 1.7, 0.42, mid + 1.45)); }
}
