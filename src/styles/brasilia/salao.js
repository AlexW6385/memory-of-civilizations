// Brasília style — the Salão Verde of the Congress (docs/settlements/brasilia.md §12): the second great hall under the roof deck, south of
// the pools and facing the Salão Negro across the ramp; entered by a glazed door in the platform's west face, green carpet and marble,
// groups of low sofas round coffee tables, the coffee counter, telephone cabins, bronze busts, and on the east wall a long panel of
// modular blue-and-white tiles set in the manner of Athos Bulcão's (the original panel of 1971 is not copied: the arrangement is ours).
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { tri2 } from './util.js';
import { rngOf, solidBox } from './kit.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';

/** A sofa along x (or an armchair when short) on legs, back on the side away from `face` ('n' faces −z, 's' faces +z). */
function sofa(bag, col, x0, z0, len, face, mat = 'cloth_green') {
  const d = 0.85, b = 0.2, z1 = z0 + d, back = face === 's' ? [z0, z0 + b] : [z1 - b, z1];
  bag.add('timber', box(x0 + 0.05, 0.06, z0 + 0.05, x0 + len - 0.05, 0.2, z1 - 0.05));
  bag.add(mat, box(x0, 0.2, z0, x0 + len, 0.46, z1));
  bag.add(mat, box(x0, 0.46, back[0], x0 + len, 0.88, back[1]));
  for (const e of [0, len - 0.2]) bag.add(mat, box(x0 + e, 0.46, z0, x0 + e + 0.2, 0.62, z1));        // the arms
  col.rect([x0, z0, x0 + len, z1], 0.06, 0.9);
}
/** A standing ashtray (the hall of 1970 is a smoking hall): a steel column and a bowl. */
function ashtray(bag, col, x, z) {
  bag.add('steel_chrome', lathe([[0.16, 0.06], [0.04, 0.12], [0.03, 0.7], [0.16, 0.78], [0.14, 0.86], [0.001, 0.82]], 10, null, x, 0, z));
  col.circle(x, z, 0.17, 0.06, 0.86);
}

export function salaoVerde(bag, col, lights, H, hy) {
  const [hx0, hz0, hx1, hz1] = H, T = 0.4, rand = rngOf(1971), zm = (hz0 + hz1) / 2;
  // the floor: marble with a runner of green carpet down the hall's axis and a border of dark marble
  bag.add('marble_floor', box(hx0, 0.0, hz0, hx1, 0.06, hz1)); col.floor(H, 0.06);
  bag.add('cloth_green', box(hx0 + 1.0, 0.06, zm - 3.4, hx1 - 3.0, 0.075, zm + 3.4));
  bag.add('marble_dark', box(hx0 + 0.7, 0.06, zm - 3.7, hx1 - 2.7, 0.072, zm - 3.4)); bag.add('marble_dark', box(hx0 + 0.7, 0.06, zm + 3.4, hx1 - 2.7, 0.072, zm + 3.7));
  // the walls: white plaster with a dado of green marble; the west a glazed front with its door
  const wall = (a, b, c, d) => { bag.add(WHITE, box(a, 0.06, b, c, hy, d)); col.rect([a, b, c, d], 0, hy); };
  wall(hx0, hz0, hx1, hz0 + T); wall(hx0, hz1 - T, hx1, hz1); wall(hx1 - T, hz0, hx1, hz1);
  bag.add('verde_antico', box(hx0 + T, 0.06, hz0 + T, hx1 - T, 1.1, hz0 + T + 0.04)); bag.add('verde_antico', box(hx0 + T, 0.06, hz1 - T - 0.04, hx1 - T, 1.1, hz1 - T));
  const door = [zm - 2, zm + 2];
  for (const [a, b] of [[hz0, door[0]], [door[1], hz1]]) { bag.add('glass_outer', box(hx0 - 0.12, 0.2, a, hx0, hy - 0.5, b)); col.rect([hx0 - 0.12, a, hx0, b], 0, hy); bag.add('granite_black', box(hx0 - 0.12, 0, a, hx0, 0.2, b)); }
  bag.add(CONC, box(hx0 - 0.12, hy - 0.5, hz0, hx0, hy, hz1));
  for (const zz of [door[0] - 0.08, door[1]]) bag.add('steel_chrome', box(hx0 - 0.15, 0, zz, hx0 + 0.05, 3.2, zz + 0.08));
  // the roof deck's round piers, white, two files; the ceiling's lamp panels between them
  for (let x = hx0 + 6; x < hx1 - 3; x += 6) for (const z of [zm - 5.5, zm + 5.5]) { bag.add(WHITE, lathe([[0.5, 0], [0.4, hy - 0.4], [0.5, hy]], 12, null, x, 0.06, z)); col.circle(x, z, 0.55, 0, hy); }
  for (let x = hx0 + 3; x < hx1 - 3; x += 6) for (const z of [hz0 + 5, hz1 - 5, zm]) bag.add('lamp_white', box(x - 0.8, hy - 0.12, z - 0.25, x + 0.8, hy - 0.02, z + 0.25));

  // ── the long tile panel on the east wall: 0.5 m modules, blue and white, plain squares and squares cut on the diagonal, the pattern
  //    running in slow waves (a modular scheme in the manner of Bulcão's; the arrangement is ours) ──
  {
    const xp = hx1 - T - 0.02, s = 0.5, nz = Math.floor((hz1 - hz0 - 1.6) / s), z00 = hz0 + 0.8, y00 = 0.95, ny = 7;
    bag.add(WHITE, box(xp - 0.01, y00 - 0.06, z00 - 0.06, xp, y00 + ny * s + 0.06, z00 + nz * s + 0.06));
    bag.add('granite_grey', box(xp - 0.03, y00 - 0.1, z00 - 0.1, xp, y00 - 0.06, z00 + nz * s + 0.1)); bag.add('granite_grey', box(xp - 0.03, y00 + ny * s + 0.06, z00 - 0.1, xp, y00 + ny * s + 0.1, z00 + nz * s + 0.1));
    const blue = [], white = [];
    for (let i = 0; i < nz; i++) for (let j = 0; j < ny; j++) {
      const v = Math.sin(i * 0.37 + j * 0.9) + Math.sin(i * 0.11 - j * 0.45 + 1.3), kind = v < -0.9 ? 0 : v < 0.1 ? 2 : v < 1.0 ? 3 : 1;
      const za = z00 + i * s, zb = za + s, ya = y00 + j * s, yb = ya + s, x = xp - 0.02;
      const A = [x, ya, za], B = [x, ya, zb], C = [x, yb, zb], D = [x, yb, za];
      if (kind === 0) white.push(A, B, C, A, C, D);
      else if (kind === 1) blue.push(A, B, C, A, C, D);
      else if (kind === 2) { white.push(A, B, C); blue.push(A, C, D); }
      else { blue.push(A, B, D); white.push(B, C, D); }
    }
    const mk = (pts) => { const t = []; for (let k = 0; k < pts.length; k += 3) tri2(t, pts[k], pts[k + 1], pts[k + 2]); return fromTriangles(t); };
    bag.add('tile_lapis', mk(blue)); bag.add('tile_white', mk(white));
  }

  // ── the furniture: the guard's desk by the door; four groups of two sofas facing across a low marble table, ashtrays between; the coffee counter on the south wall; three telephone cabins; busts and flags ──
  solidBox(bag, col, 'timber', hx0 + 1.2, 0.06, hz0 + 0.9, hx0 + 3.6, 1.05, hz0 + 1.7); bag.add('marble', box(hx0 + 1.1, 1.05, hz0 + 0.8, hx0 + 3.7, 1.1, hz0 + 1.8));
  bag.add('steel_grey', box(hx0 + 1.6, 1.1, hz0 + 1.0, hx0 + 2.0, 1.22, hz0 + 1.3));       // the telephone on the desk
  const groups = [[hx0 + 8, hz0 + 4.4], [hx0 + 16, hz0 + 4.4], [hx0 + 8, hz1 - 4.4], [hx0 + 16, hz1 - 4.4]];
  groups.forEach(([gx, gz], i) => {
    sofa(bag, col, gx - 1.0, gz - 1.9, 2.0, 's'); sofa(bag, col, gx - 1.0, gz + 1.05, 2.0, 'n', i % 2 ? 'cloth_ochre' : 'cloth_green');
    solidBox(bag, col, 'marble_dark', gx - 0.7, 0.06, gz - 0.35, gx + 0.7, 0.42, gz + 0.35);
    bag.add('steel_chrome', box(gx - 0.1, 0.42, gz - 0.06, gx + 0.1, 0.48, gz + 0.06));
    ashtray(bag, col, gx + 1.6, gz - 1.5); ashtray(bag, col, gx - 1.7, gz + 1.5);
    bag.add('glass_outer', box(gx - 0.5, 0.42, gz - 0.3, gx + 0.5, 0.5, gz + 0.3));          // a glass ashtray / dish on the table
  });
  // armchairs in the corner by the door and a row of two against the wall
  sofa(bag, col, hx0 + 1.0, hz1 - 3.2, 1.0, 'n', 'cloth_ochre'); sofa(bag, col, hx0 + 2.3, hz1 - 3.2, 1.0, 'n', 'cloth_ochre');
  solidBox(bag, col, 'marble_dark', hx0 + 1.5, 0.06, hz1 - 4.5, hx0 + 2.3, 0.42, hz1 - 3.9);
  // the coffee counter of the hall: a long counter, the steel urn, rows of small cups on a tray, stools, a menu board
  { const cx0 = hx1 - 11, cx1 = hx1 - 2.5, cz = hz1 - 1.9;
    solidBox(bag, col, 'timber', cx0, 0.06, cz - 0.5, cx1, 1.05, cz + 0.4); bag.add('marble', box(cx0 - 0.05, 1.05, cz - 0.55, cx1 + 0.05, 1.1, cz + 0.45));
    bag.add('steel_chrome', lathe([[0.001, 0], [0.22, 0.02], [0.24, 0.5], [0.16, 0.6], [0.001, 0.62]], 10, null, cx0 + 1.4, 1.1, cz - 0.1));
    for (let k = 0; k < 10; k++) bag.add('glaze_white', lathe([[0.001, 0], [0.04, 0.0], [0.045, 0.06], [0.001, 0.06]], 6, null, cx0 + 2.6 + (k % 5) * 0.14, 1.1, cz - 0.3 + Math.floor(k / 5) * 0.14));
    bag.add('steel_grey', box(cx0 + 2.4, 1.1, cz - 0.38, cx0 + 3.4, 1.12, cz + 0.02));
    for (let k = 0; k < 3; k++) { const sx = cx0 + 3.2 + k * 1.8; bag.add('steel_chrome', lathe([[0.17, 0.06], [0.04, 0.12], [0.03, 0.55], [0.2, 0.62], [0.2, 0.7], [0.001, 0.7]], 8, null, sx, 0, cz - 1.25)); col.circle(sx, cz - 1.25, 0.22, 0.06, 0.7); }
    bag.add('cloth_black', box(cx0 + 4.5, 2.0, hz1 - T - 0.05, cx0 + 7.0, 3.0, hz1 - T - 0.02));    // the menu board
    for (let k = 0; k < 6; k++) bag.add('cloth_white', box(cx0 + 4.7 + (k % 3) * 0.7, 2.2 + Math.floor(k / 3) * 0.5, hz1 - T - 0.06, cx0 + 5.2 + (k % 3) * 0.7, 2.3 + Math.floor(k / 3) * 0.5, hz1 - T - 0.05)); }
  // three telephone cabins of timber and glass along the north wall
  for (let k = 0; k < 3; k++) { const px = hx0 + 21 + k * 1.3;
    solidBox(bag, col, 'timber', px, 0.06, hz0 + T, px + 1.1, 2.2, hz0 + T + 1.0);
    bag.add('glass_outer', box(px + 0.1, 0.9, hz0 + T + 1.0, px + 1.0, 2.1, hz0 + T + 1.03)); bag.add('steel_grey', box(px + 0.5, 1.1, hz0 + T + 0.1, px + 0.7, 1.3, hz0 + T + 0.3)); }
  // two bronze busts on granite pedestals and the flag stand before the tile panel
  for (const bz of [zm - 6.5, zm + 6.5]) { const bx = hx1 - T - 0.9; bag.add('granite_grey', box(bx - 0.4, 0.06, bz - 0.4, bx + 0.4, 1.2, bz + 0.4)); bag.add('bronze', lathe([[0.001, 0], [0.2, 0.05], [0.22, 0.3], [0.16, 0.48], [0.001, 0.52]], 10, null, bx, 1.2, bz)); col.rect([bx - 0.4, bz - 0.4, bx + 0.4, bz + 0.4], 0, 1.8); }
  { const fx = hx1 - T - 1.0, fz = zm; bag.add('steel_chrome', lathe([[0.06, 0], [0.04, 3.6], [0.001, 3.7]], 6, null, fx, 0.06, fz)); bag.add('cloth_green', box(fx + 0.04, 1.9, fz - 0.02, fx + 0.04 + 0.02, 3.4, fz + 1.98)); col.circle(fx, fz, 0.1, 0, 3.7); }
  // big potted plants against the piers' line
  for (const [px, pz] of [[hx0 + 4.5, hz0 + 1.5], [hx1 - 3.0, hz0 + 1.5], [hx1 - 3.0, hz1 - 5.5]]) { bag.add('terracotta', lathe([[0.3, 0], [0.38, 0.5], [0.001, 0.5]], 10, null, px, 0.06, pz)); bag.add('palm_leaf', lathe([[0.001, 0], [0.7, 0.3], [0.9, 1.0], [0.5, 1.7], [0.001, 2.0]], 9, null, px, 0.56, pz)); col.circle(px, pz, 0.45, 0.06, 1.2); }
  rand();
  lights.push({ at: [hx0 + 6, 3.8, zm], color: '#ffeccc', intensity: 4, distance: 18 }, { at: [hx0 + 20, 3.8, zm], color: '#ffeccc', intensity: 4, distance: 18 }, { at: [hx0 + 12, 3.8, hz0 + 5], color: '#ffe8c8', intensity: 3, distance: 14 }, { at: [hx0 + 12, 3.8, hz1 - 5], color: '#ffe8c8', intensity: 3, distance: 14 });
}
