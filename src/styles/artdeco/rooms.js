// Two rooms of the New York of 1931 one can walk into (docs/settlements/new-york.md §1f): a diner — a lunch car of
// the Worcester kind set on a vacant lot along the cross street, its barrel roof, its enamel panels under a band
// of windows, inside a marble counter with its row of stools, the back bar with the grill, the coffee urns and
// the pie case, booths at the end, a floor of small tiles; and a walk-up — an old-law tenement of four storeys in
// brick with its fire escape, the ground-floor flat of three rooms off the hall: the front room on the street,
// the kitchen (the bathtub with its cover beside the sink, the coal range, the icebox, the built-in china
// cabinet), the small bedroom at the back. Both laid out with the street at +z (the lot's front).

import { box, lathe, fromTriangles } from '../../core/geom.js';

/** An arched strip along x from xa to xb: the arc in (z, y) round the centre (zc, yc), radius R, from angle a0 to a1, both faces. */
function barrel(xa, xb, zc, yc, R, a0, a1, n = 12) {
  const T = [];
  for (let i = 0; i < n; i++) {
    const t0 = a0 + (a1 - a0) * i / n, t1 = a0 + (a1 - a0) * (i + 1) / n;
    const A = [xa, yc + Math.sin(t0) * R, zc + Math.cos(t0) * R], B = [xb, yc + Math.sin(t0) * R, zc + Math.cos(t0) * R], C = [xb, yc + Math.sin(t1) * R, zc + Math.cos(t1) * R], D = [xa, yc + Math.sin(t1) * R, zc + Math.cos(t1) * R];
    T.push(...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C);
  }
  return fromTriangles(T);
}
const stoolAt = (bag, x, z, y) => {
  bag.add('steel_chrome', lathe([[0.2, 0], [0.2, 0.03], [0.05, 0.06], [0.04, 0.62], [0.06, 0.66], [0.001, 0.66]], 12, null, x, y, z));
  bag.add('car_red', lathe([[0.19, 0], [0.2, 0.05], [0.17, 0.09], [0.001, 0.1]], 14, null, x, y + 0.66, z));
};

/**
 * diner: { rect (the lot), y (the street), zf (the street's kerb line, +z) } — the car along the lot's front, its door
 * in the middle of the long side to the street, a step up to it.
 */
export function diner(el, { bag, col, lights }) {
  const [lx0, lz0, lx1, lz1] = el.rect, y = el.y ?? 0, F = y + 0.75, Wd = 4.6, Lc = Math.min(13.5, lx1 - lx0 - 2);
  const x0 = (lx0 + lx1) / 2 - Lc / 2, x1 = x0 + Lc, z1 = lz1 - 0.8, z0 = z1 - Wd, xm = (x0 + x1) / 2 + 0.6, T = 0.12;
  // the lot: paved, a low fence of iron along its sides and back; a brick party wall behind
  bag.add('asphalt', box(lx0, y - 0.3, lz0, lx1, y + 0.02, lz1));
  for (const [a, b, c, d] of [[lx0, lz0, lx1, lz0 + 0.3], [lx0, lz0, lx0 + 0.3, lz1 - 0.4], [lx1 - 0.3, lz0, lx1, lz1 - 0.4]]) { bag.add('facade_brick', box(a, y - 0.3, b, c, y + 2.2, d)); bag.add('limestone', box(a - 0.03, y + 2.2, b - 0.03, c + 0.03, y + 2.3, d + 0.03)); col.rect([a, b, c, d], y, y + 2.2); }
  // the foundation and the floor of small white and black tiles
  bag.add('brick', box(x0 + 0.1, y - 0.3, z0 + 0.1, x1 - 0.1, F - 0.1, z1 - 0.1));
  bag.add('tile_white', box(x0 + T, F - 0.1, z0 + T, x1 - T, F, z1 - T)); col.floor([x0 + T, z0 + T, x1 - T, z1 - T], F);
  for (let x = x0 + 0.5; x < x1 - 0.4; x += 0.6) bag.add('tile_dark', box(x - 0.04, F, z0 + T, x + 0.04, F + 0.01, z1 - T));
  // the walls: the enamel panels to the windows, the band of windows, the band over them; the door in the middle of the front
  const dw = 0.95, yW0 = F + 1.0, yW1 = F + 2.1, yT = F + 2.45;
  const wallRun = (zz, sg, door) => {
    const zA = sg > 0 ? zz - T : zz, zB = sg > 0 ? zz : zz + T, runs = door ? [[x0, xm - dw / 2], [xm + dw / 2, x1]] : [[x0, x1]];
    for (const [a, b] of runs) {
      bag.add('car_cream', box(a, F - 0.1, zA, b, yW0, zB)); col.rect([a, zA, b, zB], F - 0.1, yT);
      bag.add('glass_outer', box(a, yW0, zA + 0.04, b, yW1, zB - 0.04));
      for (let x = a + 0.05; x < b; x += 0.95) bag.add('steel_chrome', box(Math.max(a, x - 0.04), yW0, Math.min(zA, zB) - 0.01, Math.min(b, x + 0.04), yW1, Math.max(zA, zB) + 0.01));
      bag.add('car_cream', box(a, yW1, zA, b, yT, zB));
      // the red stripes on the enamel, the lettering band over the windows
      bag.add('car_red', box(a, F + 0.15, Math.min(zA, zB) - 0.012, b, F + 0.25, Math.max(zA, zB) + 0.012));
      bag.add('car_red', box(a, F + 0.8, Math.min(zA, zB) - 0.012, b, F + 0.9, Math.max(zA, zB) + 0.012));
    }
    if (door) {
      bag.add('car_cream', box(xm - dw / 2, F + 2.15, zA, xm + dw / 2, yT, zB));
      // the door, its window, folded open inward; its hood
      bag.add('wood_dark', box(xm + dw / 2 - 0.05, F, zz - 0.95, xm + dw / 2, F + 2.1, zz - 0.12));
      bag.add('car_red', box(xm - dw / 2 - 0.4, yT - 0.05, zz, xm + dw / 2 + 0.4, yT + 0.05, zz + 0.7));
      // the step up from the lot
      bag.add('granite_grey', box(xm - 0.75, y, zz, xm + 0.75, y + 0.5, zz + 0.4));
      bag.add('granite_grey', box(xm - 0.75, y, zz + 0.4, xm + 0.75, y + 0.25, zz + 0.8));
      col.ramp([xm - 0.75, zz, xm + 0.75, zz + 0.8], y, F, 'n');
    }
  };
  wallRun(z1, 1, true); wallRun(z0 + T, 1, false);
  for (const xx of [x0, x1 - T]) { bag.add('car_cream', box(xx, F - 0.1, z0, xx + T, yT, z1)); col.rect([xx, z0, xx + T, z1], F - 0.1, yT); bag.add('glass_outer', box(xx - 0.01, yW0, z0 + 0.6, xx + T + 0.01, yW1, z1 - 0.6)); }
  // the name over the windows on the street: gilt letters on a red board
  bag.add('car_red', box(x0 + 2, yT - 0.32, z1 + 0.01, x1 - 2, yT - 0.04, z1 + 0.05));
  for (let x = x0 + 2.4; x < x1 - 2.3; x += 0.42) bag.add('gold', box(x, yT - 0.27, z1 + 0.05, x + 0.22, yT - 0.09, z1 + 0.06));
  // the barrel roof over all, its ends overhanging; inside, the varnished ceiling following it
  const HA = 0.9, R = Wd / 2 / Math.sin(HA), zc = (z0 + z1) / 2, yc = yT - Math.cos(HA) * R;
  bag.add('iron_galv', barrel(x0 - 0.5, x1 + 0.5, zc, yc + 0.06, R + 0.06, Math.PI / 2 - HA - 0.02, Math.PI / 2 + HA + 0.02, 16));
  bag.add('brushbox', barrel(x0 + T, x1 - T, zc, yc - 0.06, R - 0.06, Math.PI / 2 - HA + 0.02, Math.PI / 2 + HA - 0.02, 16));
  for (const xx of [x0, x1]) { const Tg = []; for (let i = 0; i < 16; i++) { const t0 = Math.PI / 2 - HA + 2 * HA * i / 16, t1 = Math.PI / 2 - HA + 2 * HA * (i + 1) / 16; const P = (t) => [xx, yc + Math.sin(t) * R, zc + Math.cos(t) * R]; const Cc = [xx, yT, zc]; Tg.push(...Cc, ...P(t0), ...P(t1), ...Cc, ...P(t1), ...P(t0)); } bag.add('car_cream', fromTriangles(Tg)); }
  // the back bar along the back wall: stainless below, tiles over, a shelf; the grill and hood at the east, the urns, the pie case
  const zb = z0 + T;
  bag.add('steel_chrome', box(x0 + 1.4, F, zb, x1 - T, F + 0.95, zb + 0.6));
  bag.add('tile_white', box(x0 + 1.4, F + 0.95, zb, x1 - T, yW0 + 0.05, zb + 0.03));
  bag.add('marble', box(x0 + 1.4, F + 0.95, zb, x1 - T, F + 1.0, zb + 0.62));
  bag.add('iron', box(x1 - 2.4, F + 1.0, zb + 0.05, x1 - 0.5, F + 1.06, zb + 0.6));
  bag.add('steel_chrome', box(x1 - 2.5, yW1 - 0.2, zb, x1 - 0.4, yW1 + 0.15, zb + 0.75));
  for (const [x, r] of [[x0 + 3.0, 0.2], [x0 + 3.6, 0.2], [x0 + 4.25, 0.16]]) {
    bag.add('steel_chrome', lathe([[r, 0], [r, 0.08], [r * 1.05, 0.1], [r, 0.12], [r, 0.48], [r * 0.7, 0.58], [0.04, 0.62], [0.06, 0.68], [0.001, 0.69]], 16, null, x, F + 1.0, zb + 0.3));
    bag.add('wood_dark', box(x - 0.03, F + 1.12, zb + 0.3 + r, x + 0.03, F + 1.18, zb + 0.3 + r + 0.1));
  }
  bag.add('steel_chrome', box(x0 + 5.0, F + 1.0, zb + 0.05, x0 + 6.4, F + 1.04, zb + 0.55));
  bag.add('glass_outer', box(x0 + 5.02, F + 1.04, zb + 0.07, x0 + 6.38, F + 1.5, zb + 0.53));
  for (const yy of [F + 1.18, F + 1.34]) for (let x = x0 + 5.25; x < x0 + 6.3; x += 0.33) bag.add('ivory', lathe([[0.12, 0], [0.12, 0.04], [0.001, 0.05]], 10, null, x, yy, zb + 0.3));
  // the menu boards on the tiles
  for (let x = x0 + 7.0; x < x1 - 3; x += 1.2) { bag.add('wood_dark', box(x, yW0 + 0.1, zb + 0.03, x + 0.9, yW0 + 0.9, zb + 0.05)); for (let k = 0; k < 5; k++) bag.add('paint_white', box(x + 0.1, yW0 + 0.2 + k * 0.13, zb + 0.05, x + 0.45 + (k * 37 % 4) * 0.08, yW0 + 0.24 + k * 0.13, zb + 0.056)); }
  col.rect([x0 + 1.4, zb, x1 - T, zb + 0.62], F, F + 1.2);
  // the counter: an enamel front on a black base, the marble top; the stools before it
  const zk0 = zb + 1.6, zk1 = zk0 + 0.6, kx0 = x0 + 2.2;
  bag.add('car_black', box(kx0, F, zk0 + 0.05, x1 - T - 1.0, F + 0.12, zk1 - 0.05));
  bag.add('car_cream', box(kx0, F + 0.12, zk0, x1 - T - 1.0, F + 1.0, zk1 - 0.04));
  bag.add('steel_chrome', box(kx0, F + 0.95, zk1 - 0.06, x1 - T - 1.0, F + 1.0, zk1 + 0.03));
  bag.add('marble', box(kx0 - 0.05, F + 1.0, zk0 - 0.05, x1 - T - 0.95, F + 1.05, zk1 + 0.12));
  bag.add('steel_chrome', box(kx0, F + 0.18, zk1 + 0.15, x1 - T - 1.0, F + 0.22, zk1 + 0.19));
  col.rect([kx0 - 0.05, zk0 - 0.05, x1 - T - 0.95, zk1 + 0.12], F, F + 1.05);
  for (let x = kx0 + 0.4; x < x1 - T - 1.2; x += 0.68) stoolAt(bag, x, zk1 + 0.5, F);
  // on the counter: sugar, napkins, a cup and saucer at a few places
  for (let x = kx0 + 0.75; x < x1 - 1.5; x += 2.04) { bag.add('glass_lamp', lathe([[0.04, 0], [0.04, 0.1], [0.025, 0.13], [0.001, 0.14]], 8, null, x, F + 1.05, zk0 + 0.2)); bag.add('glaze_white', lathe([[0.07, 0], [0.07, 0.01], [0.04, 0.012], [0.045, 0.07], [0.001, 0.07]], 10, null, x + 0.6, F + 1.05, zk1 - 0.05)); }
  // the booths at the west end: two benches with high backs and a table between, by the front windows
  for (const [bz, back] of [[z1 - T - 0.25, 1], [z1 - T - 1.85, -1]]) {
    bag.add('wood_dark', box(x0 + T + 0.05, F, bz - 0.25, x0 + 1.9, F + 0.45, bz + 0.25));
    bag.add('leather_bench', box(x0 + T + 0.08, F + 0.45, bz - 0.24, x0 + 1.88, F + 0.52, bz + 0.24));
    bag.add('wood_dark', box(x0 + T + 0.05, F + 0.45, bz + back * 0.2 - 0.05, x0 + 1.9, F + 1.2, bz + back * 0.2 + 0.05));
    col.rect([x0 + T, bz - 0.25, x0 + 1.9, bz + 0.25], F, F + 1.2);
  }
  bag.add('marble', box(x0 + T + 0.1, F + 0.74, z1 - T - 1.35, x0 + 1.85, F + 0.78, z1 - T - 0.75));
  bag.add('steel_chrome', lathe([[0.25, 0], [0.25, 0.02], [0.04, 0.04], [0.04, 0.74], [0.001, 0.74]], 10, null, x0 + 1.0, F, z1 - T - 1.05));
  // the lights: globes down the ceiling
  for (let x = x0 + 1.5; x < x1 - 1; x += 2.6) { bag.add('lamp_white', lathe([[0.001, -0.3], [0.13, -0.22], [0.16, -0.12], [0.1, -0.02], [0.03, 0], [0.001, 0]], 12, null, x, yc + R - 0.08, zc)); lights.push({ at: [x, yc + R - 0.5, zc], color: '#ffe0b0', intensity: 2.5, distance: 6 }); }
}

/**
 * walkup: { rect (the lot), y, h, seed } — a tenement of four storeys, the street at +z: brick with stone lintels and sills,
 * a pressed-metal cornice, the fire escape on the front; the stoop of two steps to the hall door; the ground-floor flat
 * open and furnished. The floors above are solid.
 */
export function walkup(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, F = y + 0.55, H1 = F + 3.3, top = y + (el.h ?? 15), T = 0.3, B = 'facade_brick';
  const ax0 = x0 + 1.75, zf0 = z1 - 3.8, zk0 = zf0 - 3.2, zb0 = z0 + T;
  // (the outer walls brick outside and plastered within; the walls inside plastered both sides)
  const IN = 'stucco_cream';
  const skin = (a, b, c, d, y0, y1, side) => {
    if (side === 's') { bag.add(B, box(a, y0, d - 0.1, c, y1, d)); bag.add(IN, box(a, Math.max(y0, F), b, c, y1, d - 0.1)); if (y0 < F) bag.add(B, box(a, y0, b, c, F, d - 0.1)); }
    else if (side === 'n') { bag.add(B, box(a, y0, b, c, y1, b + 0.1)); bag.add(IN, box(a, Math.max(y0, F), b + 0.1, c, y1, d)); if (y0 < F) bag.add(B, box(a, y0, b + 0.1, c, F, d)); }
    else if (side === 'w') { bag.add(B, box(a, y0, b, a + 0.1, y1, d)); bag.add(IN, box(a + 0.1, Math.max(y0, F), b, c, y1, d)); if (y0 < F) bag.add(B, box(a + 0.1, y0, b, c, F, d)); }
    else if (side === 'e') { bag.add(B, box(c - 0.1, y0, b, c, y1, d)); bag.add(IN, box(a, Math.max(y0, F), b, c - 0.1, y1, d)); if (y0 < F) bag.add(B, box(a, y0, b, c - 0.1, F, d)); }
    else bag.add(IN, box(a, y0, b, c, y1, d));
  };
  const wall = (a, b, c, d, y0 = y - 0.4, y1 = H1, side = '') => { skin(a, b, c, d, y0, y1, side); col.rect([a, b, c, d], y0, y1); };
  // the outer walls of the ground floor: the front with the hall door and two windows of the front room; the back with the bedroom's window
  const dx = x0 + 0.95, front = [[x0, dx - 0.5], [dx + 0.5, ax0 + 1.0], [ax0 + 2.2, ax0 + 3.2], [ax0 + 4.4, x1]];
  for (const [a, b] of front) wall(a, z1 - T, b, z1, y - 0.4, H1, 's');
  for (const [a, b, s0] of [[dx - 0.5, dx + 0.5, F + 2.3], [ax0 + 1.0, ax0 + 2.2, F + 2.2], [ax0 + 3.2, ax0 + 4.4, F + 2.2]]) { skin(a, z1 - T, b, z1, s0, H1, 's'); if (a > dx) { skin(a, z1 - T, b, z1, y - 0.4, F + 0.75, 's'); col.rect([a, z1 - T, b, z1], y - 0.4, F + 0.75); bag.add('glass_outer', box(a, F + 0.75, z1 - 0.17, b, s0, z1 - 0.13)); bag.add('limestone', box(a - 0.1, F + 0.68, z1 - 0.05, b + 0.1, F + 0.75, z1 + 0.06)); bag.add('linen', box(a + 0.05, F + 0.8, z1 - T - 0.03, a + 0.45, s0 - 0.05, z1 - T - 0.01)); bag.add('linen', box(b - 0.45, F + 0.8, z1 - T - 0.03, b - 0.05, s0 - 0.05, z1 - T - 0.01)); } bag.add('limestone', box(a - 0.12, s0, z1 - 0.02, b + 0.12, s0 + 0.28, z1 + 0.05)); }
  wall(x0, z0, x1, zb0, y - 0.4, H1, 'n'); wall(x0, zb0, x0 + T, z1 - T, y - 0.4, H1, 'w'); wall(x1 - T, zb0, x1, z1 - T, y - 0.4, H1, 'e');
  // the hall's wall to the flat, with the flat's door into the kitchen
  for (const [a, b] of [[zb0, zk0 + 1.2], [zk0 + 2.1, z1 - T]]) wall(ax0 - 0.12, a, ax0, b);
  bag.add(IN, box(ax0 - 0.12, F + 2.1, zk0 + 1.2, ax0, H1, zk0 + 2.1));
  // the partitions between the rooms, each with its doorway
  for (const [zz, dz] of [[zf0, 1.6], [zk0, 3.6]]) { const da = ax0 + dz - 0.45, db = ax0 + dz + 0.45; wall(ax0, zz - 0.12, da, zz); wall(db, zz - 0.12, x1 - T, zz); bag.add(IN, box(da, F + 2.1, zz - 0.12, db, H1, zz)); }
  // floors and ceiling; above, the upper storeys solid with their windows' lintels and sills, the cornice
  bag.add('timber', box(x0 + T, y - 0.4, zb0, x1 - T, F, z1 - T)); col.floor([x0 + T, zb0, x1 - T, z1 - T], F);
  bag.add('plaster_white', box(ax0 - 0.12, H1 - 0.12, zb0, x1 - T, H1, z1 - T));
  bag.add('plaster_white', box(x0 + T, H1 - 0.12, zb0 + 3.8, ax0 - 0.12, H1, z1 - T));
  bag.add(B, box(x0, H1, z0, x1, top, z1)); col.rect([x0, z0, x1, z1], H1, top);
  for (let yy = H1 + 0.9; yy < top - 2; yy += 3.0) for (const u of [x0 + 1.2, (x0 + x1) / 2, x1 - 1.2]) {
    bag.add('glass_outer', box(u - 0.55, yy, z1 + 0.004, u + 0.55, yy + 1.7, z1 + 0.02));
    bag.add('limestone', box(u - 0.65, yy - 0.1, z1, u + 0.65, yy, z1 + 0.07)); bag.add('limestone', box(u - 0.68, yy + 1.7, z1, u + 0.68, yy + 1.95, z1 + 0.05));
  }
  bag.add('iron_galv', box(x0, top - 0.6, z1, x1, top - 0.1, z1 + 0.55)); bag.add('iron_galv', box(x0, top - 0.1, z1, x1, top + 0.05, z1 + 0.65));
  for (let x = x0 + 0.3; x < x1; x += 0.7) bag.add('iron_galv', box(x - 0.06, top - 0.9, z1, x + 0.06, top - 0.6, z1 + 0.45));
  // the soot of the city: the cornice's shadow blackened, streaks down from it at the party walls, the grime at the foot of the front
  bag.add('pottery_dark', box(x0, top - 1.8, z1 + 0.004, x1, top - 0.6, z1 + 0.014));
  for (const u of [x0 + 0.25, x1 - 0.25]) bag.add('pottery_dark', box(u - 0.2, top - 6.5, z1 + 0.004, u + 0.2, top - 1.8, z1 + 0.014));
  // the stoop: two steps to the hall door, its door standing open inward, a transom over
  bag.add('limestone', box(dx - 0.8, y - 0.1, z1, dx + 0.8, y + 0.27, z1 + 0.6)); bag.add('limestone', box(dx - 0.8, y - 0.1, z1, dx + 0.8, F, z1 + 0.3));
  col.ramp([dx - 0.8, z1 - T, dx + 0.8, z1 + 0.6], y, F, 'n');
  bag.add('wood_dark', box(dx - 0.5, F, z1 - T - 0.95, dx - 0.44, F + 2.2, z1 - T));
  bag.add('glass_outer', box(dx - 0.5, F + 2.25, z1 - 0.17, dx + 0.5, F + 2.3, z1 - 0.13));
  // the hall: the stair rising to the back, its rail and newel; a ceiling lamp
  const sx0 = x0 + T + 0.05, sx1 = ax0 - 0.17, sz1 = zb0 + 0.2, sz0 = sz1 + 3.6;
  for (let k = 0; k < 12; k++) bag.add('timber', box(sx0, F, sz0 - 3.6 * (k + 1) / 12, sx1, F + (H1 - F - 0.15) * (k + 1) / 12, sz0 - 3.6 * k / 12));
  bag.add('wood_dark', lathe([[0.06, 0], [0.06, 1.0], [0.08, 1.05], [0.001, 1.12]], 8, null, sx1 - 0.06, F, sz0));
  col.rect([sx0, sz1, sx1, sz0], F, F + 1.0);
  // ── the flat ──
  const fx0 = ax0, fx1 = x1 - T;
  // the front room: a rug, a sofa against the hall wall, a table with its lace cloth and chairs, the radio, pictures; the ceiling light
  bag.add('cloth_red', box(fx0 + 0.6, F, zf0 + 0.6, fx1 - 0.6, F + 0.01, z1 - T - 0.6));
  bag.add('cloth_brown', box(fx0 + 0.05, F, zf0 + 0.8, fx0 + 0.85, F + 0.45, zf0 + 2.7)); bag.add('cloth_brown', box(fx0 + 0.05, F + 0.45, zf0 + 0.8, fx0 + 0.25, F + 0.95, zf0 + 2.7));
  for (const zz of [zf0 + 0.8, zf0 + 2.55]) bag.add('cloth_brown', box(fx0 + 0.05, F + 0.45, zz, fx0 + 0.85, F + 0.68, zz + 0.15));
  col.rect([fx0, zf0 + 0.8, fx0 + 0.85, zf0 + 2.7], F, F + 0.95);
  const tx = (fx0 + fx1) / 2 + 0.6, tz = zf0 + 1.8;
  bag.add('wood_dark', lathe([[0.06, 0], [0.06, 0.72], [0.001, 0.72]], 8, null, tx, F, tz)); bag.add('wood_dark', lathe([[0.25, 0], [0.25, 0.04], [0.001, 0.05]], 10, null, tx, F, tz));
  bag.add('linen', lathe([[0.62, -0.18], [0.6, 0], [0.001, 0.0]], 20, null, tx, F + 0.75, tz)); bag.add('wood_dark', lathe([[0.55, 0], [0.55, 0.03], [0.001, 0.03]], 20, null, tx, F + 0.72, tz));
  col.circle(tx, tz, 0.6, F, F + 0.75);
  for (const [cx, cz] of [[tx - 0.85, tz], [tx + 0.85, tz], [tx, tz - 0.85]]) { bag.add('wood_dark', box(cx - 0.21, F + 0.44, cz - 0.21, cx + 0.21, F + 0.48, cz + 0.21)); for (const [ex, ez] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) bag.add('wood_dark', box(cx + ex - 0.02, F, cz + ez - 0.02, cx + ex + 0.02, F + 0.44, cz + ez + 0.02)); const bx2 = cx < tx - 0.5 ? -0.2 : cx > tx + 0.5 ? 0.2 : 0, bz2 = cz < tz - 0.5 ? -0.2 : 0; bag.add('wood_dark', box(cx + bx2 - (bx2 ? 0.02 : 0.2), F + 0.48, cz + bz2 - (bz2 ? 0.02 : 0.2), cx + bx2 + (bx2 ? 0.02 : 0.2), F + 0.95, cz + bz2 + (bz2 ? 0.02 : 0.2))); }
  // the radio cabinet in the corner, its dial lit; a picture over the sofa, a calendar
  bag.add('wood_dark', box(fx1 - 0.55, F, zf0 + 0.15, fx1 - 0.05, F + 1.05, zf0 + 0.55)); bag.add('cloth_ochre', box(fx1 - 0.5, F + 0.55, zf0 + 0.55, fx1 - 0.1, F + 0.9, zf0 + 0.56)); bag.add('lamp_white', box(fx1 - 0.38, F + 0.42, zf0 + 0.55, fx1 - 0.22, F + 0.5, zf0 + 0.565));
  bag.add('gilt_bronze', box(fx0 + 0.001, F + 1.35, zf0 + 1.2, fx0 + 0.04, F + 1.95, zf0 + 2.2)); bag.add('fresco_green', box(fx0 + 0.04, F + 1.42, zf0 + 1.28, fx0 + 0.05, F + 1.88, zf0 + 2.12));
  bag.add('paint_white', box(fx1 - 0.01, F + 1.4, zf0 + 1.5, fx1, F + 1.85, zf0 + 1.85));
  // the kitchen: the coal range and its pipe to the chimney, the icebox, the sink and beside it the bathtub under its board, the china cabinet, the table under oilcloth
  const kz0 = zk0, kz1 = zf0 - 0.12;
  bag.add('iron', box(fx1 - 1.05, F, kz0 + 0.1, fx1 - 0.05, F + 0.8, kz0 + 0.75)); bag.add('iron', box(fx1 - 1.1, F + 0.8, kz0 + 0.05, fx1 - 0.02, F + 0.85, kz0 + 0.8));
  for (const ox of [0.3, 0.7]) bag.add('steel_chrome', lathe([[0.1, 0], [0.1, 0.01], [0.001, 0.012]], 10, null, fx1 - ox, F + 0.85, kz0 + 0.45));
  bag.add('iron', lathe([[0.07, 0], [0.07, H1 - F - 1.4]], 10, null, fx1 - 0.6, F + 0.85, kz0 + 0.2).translate(0, 0, 0));
  bag.add('pottery_dark', lathe([[0.15, 0], [0.16, 0.2], [0.001, 0.22]], 10, null, fx1 - 0.3, F + 0.86, kz0 + 0.45));
  col.rect([fx1 - 1.1, kz0, fx1, kz0 + 0.8], F, F + 0.85);
  bag.add('wood_painted', box(fx1 - 0.7, F, kz1 - 0.7, fx1 - 0.05, F + 1.35, kz1 - 0.08)); bag.add('steel_chrome', box(fx1 - 0.72, F + 0.9, kz1 - 0.7, fx1 - 0.69, F + 1.0, kz1 - 0.6));
  col.rect([fx1 - 0.7, kz1 - 0.7, fx1, kz1 - 0.05], F, F + 1.35);
  const sx = fx0 + 0.15;
  bag.add('glaze_white', box(sx, F + 0.75, kz0 + 0.12, sx + 0.55, F + 0.9, kz0 + 0.9)); bag.add('iron', box(sx + 0.2, F, kz0 + 0.45, sx + 0.3, F + 0.75, kz0 + 0.55)); bag.add('steel_chrome', box(sx + 0.03, F + 0.9, kz0 + 0.48, sx + 0.06, F + 1.15, kz0 + 0.54));
  bag.add('glaze_white', box(sx, F, kz0 + 0.95, sx + 0.72, F + 0.6, kz0 + 2.45)); bag.add('timber', box(sx - 0.02, F + 0.6, kz0 + 0.93, sx + 0.74, F + 0.64, kz0 + 2.47));
  col.rect([sx, kz0 + 0.12, sx + 0.74, kz0 + 2.47], F, F + 0.9);
  bag.add('wood_painted', box(fx0 + 1.4, F, kz0 + 0.05, fx0 + 2.4, F + 0.85, kz0 + 0.45)); bag.add('wood_painted', box(fx0 + 1.4, F + 0.85, kz0 + 0.05, fx0 + 2.4, F + 2.1, kz0 + 0.3)); bag.add('glass_outer', box(fx0 + 1.45, F + 1.0, kz0 + 0.3, fx0 + 2.35, F + 2.0, kz0 + 0.31));
  for (let k = 0; k < 4; k++) bag.add('glaze_white', lathe([[0.1, 0], [0.11, 0.01], [0.001, 0.012]], 10, null, fx0 + 1.6 + k * 0.23, F + 1.25, kz0 + 0.18));
  col.rect([fx0 + 1.4, kz0, fx0 + 2.4, kz0 + 0.45], F, F + 2.1);
  const kx = fx0 + 2.3, kzm = (kz0 + kz1) / 2 + 0.3;
  bag.add('cloth_white', box(kx - 0.5, F + 0.72, kzm - 0.4, kx + 0.5, F + 0.76, kzm + 0.4)); for (const [ex, ez] of [[-0.42, -0.32], [0.42, -0.32], [-0.42, 0.32], [0.42, 0.32]]) bag.add('wood_painted', box(kx + ex - 0.03, F, kzm + ez - 0.03, kx + ex + 0.03, F + 0.72, kzm + ez + 0.03));
  bag.add('cloth_red', box(kx - 0.5, F + 0.76, kzm - 0.06, kx + 0.5, F + 0.762, kzm + 0.06));
  col.rect([kx - 0.5, kzm - 0.4, kx + 0.5, kzm + 0.4], F, F + 0.76);
  // the bedroom at the back: an iron bed under its quilt, a dresser, a crucifix and a picture; the window to the yard
  const bz1 = zk0 - 0.12;
  bag.add('iron', box(fx0 + 0.1, F, zb0 + 0.05, fx0 + 0.15, F + 1.1, zb0 + 1.45)); bag.add('iron', box(fx0 + 1.95, F, zb0 + 0.05, fx0 + 2.0, F + 0.85, zb0 + 1.45));
  for (let z = zb0 + 0.15; z < zb0 + 1.4; z += 0.15) bag.add('iron', box(fx0 + 0.12, F + 0.5, z - 0.01, fx0 + 0.14, F + 1.05, z + 0.01));
  bag.add('linen', box(fx0 + 0.15, F + 0.35, zb0 + 0.05, fx0 + 1.95, F + 0.55, zb0 + 1.45)); bag.add('cloth_indigo', box(fx0 + 0.6, F + 0.55, zb0 + 0.03, fx0 + 1.97, F + 0.6, zb0 + 1.47)); bag.add('linen', box(fx0 + 0.2, F + 0.55, zb0 + 0.25, fx0 + 0.55, F + 0.7, zb0 + 1.25));
  col.rect([fx0 + 0.1, zb0, fx0 + 2.0, zb0 + 1.5], F, F + 1.1);
  bag.add('wood_dark', box(fx1 - 0.55, F, bz1 - 1.2, fx1 - 0.05, F + 0.95, bz1 - 0.2)); bag.add('mirror_tin', box(fx1 - 0.08, F + 1.05, bz1 - 1.0, fx1 - 0.05, F + 1.6, bz1 - 0.4));
  col.rect([fx1 - 0.55, bz1 - 1.2, fx1, bz1 - 0.2], F, F + 0.95);
  bag.add('glass_outer', box(fx0 + 2.4, F + 0.9, z0 + 0.13, fx0 + 3.3, F + 2.3, z0 + 0.17));
  // the lights: a bulb under a shade in each room
  for (const [lx, lz] of [[tx, tz], [kx, kzm], [(fx0 + fx1) / 2, (zb0 + bz1) / 2], [(sx0 + sx1) / 2, z1 - 2]]) { bag.add('lamp_white', lathe([[0.001, -0.12], [0.06, -0.1], [0.07, -0.02], [0.001, 0]], 10, null, lx, H1 - 0.45, lz)); bag.add('iron', box(lx - 0.006, H1 - 0.45, lz - 0.006, lx + 0.006, H1 - 0.12, lz + 0.006)); lights.push({ at: [lx, H1 - 0.7, lz], color: '#ffd29a', intensity: 1.6, distance: 5 }); }
  // the fire escape on the front from the second floor
  for (let yy = H1 + 0.1; yy < top - 1.5; yy += 3.0) {
    bag.add('iron', box(ax0 + 0.6, yy - 0.05, z1, x1 - 0.4, yy, z1 + 1.0));
    bag.add('iron', box(ax0 + 0.6, yy + 0.9, z1 + 0.95, x1 - 0.4, yy + 0.95, z1 + 1.0));
    for (let x = ax0 + 0.6; x <= x1 - 0.4; x += 0.12) bag.add('iron', box(x - 0.01, yy, z1 + 0.97, x + 0.01, yy + 0.9, z1 + 0.99));
  }
}
