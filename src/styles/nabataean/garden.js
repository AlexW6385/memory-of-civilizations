// The garden and pool of Petra under Aretas IV (docs/settlements/petra.md §13): the garden terrace on its double
// retaining wall behind the street's shops, its axis of stone platforms and the pergola, the gravel walk across it
// between trellised stylobates with planting pots; the promenade 2.5 m higher round the great pool, the island
// pavilion on its plinth in the middle (reached only by boat before the Roman bridge), the stair down into the
// water at the north-east corner, the screen wall at the back with its niche and exedrae.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { pillar, steps } from './city.js';

const A = 'sandstone_rose_ashlar', RED = 'stucco_red', LIME = 'lime_plaster', PAVE = 'sandstone_floor';

/**
 * pool_garden: { rect, gy (the garden's level), py (the promenade's), split (z where the promenade begins), pool (the
 * pool's inside), floor (its floor), entry: [x0, x1] (the stair up from the street, through the wall), zs (the
 * street's portico back) }.
 */
export function poolGarden(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, gy = el.gy, py = el.py, zp = el.split, [px0, pz0, px1, pz1] = el.pool, fl = el.floor;
  const wall = (r, y0, y1, mat = A) => { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  const [ex0, ex1] = el.entry, zs = el.zs ?? 21;
  // ---- the double retaining wall on the north, a lower outer wall and the inner one rising to a parapet; the stair up
  // from the street through both, between side walls -------------------------------------------------------------------
  for (const [a, b] of [[x0, ex0 - 0.5], [ex1 + 0.5, x1]]) {
    wall([a, z0, b, z0 + 1.1], -0.5, gy - 1.6); col.floor([a, z0, b, z0 + 1.1], gy - 1.6);
    wall([a, z0 + 1.1, b, z0 + 2.6], -0.5, gy + 0.55);
    bag.add(A, box(a, gy - 1.6, z0 + 0.9, b, gy - 1.45, z0 + 1.15));                                        // the outer wall's coping
  }
  const stairZ1 = z0 + 6.5;
  steps(bag, col, [ex0, zs, ex1, stairZ1], 0.45, gy, 's', A, 0.17);
  for (const xs of [ex0 - 0.5, ex1]) wall([xs, zs, xs + 0.5, stairZ1], -0.5, gy + 0.55);
  // the side walls (west, east), rising with the levels behind them
  for (const [a, b] of [[x0, x0 + 1.6], [x1 - 1.6, x1]]) { wall([a, z0, b, zp], -0.5, gy + 0.55); wall([a, zp, b, z1], -0.5, py + 0.55); col.floor([a, z0, b, zp], gy + 0.55); }
  // ---- the garden: a gravel walk across it on the east–west axis between two stylobates carrying a trellis on slender
  // posts, terracotta planting pots along it; two stone platforms on the north–south axis; the pergola at the north end
  const zw = (z0 + 2.6 + zp) / 2, ww = 3.2;
  bag.add('pebbles', box(x0 + 1.6, gy - 0.05, zw - ww / 2, x1 - 1.6, gy + 0.03, zw + ww / 2));
  for (const s of [-1, 1]) {
    const zr = zw + s * (ww / 2 + 0.3);
    bag.add(A, box(x0 + 1.6, gy - 0.1, zr - 0.3, x1 - 1.6, gy + 0.22, zr + 0.3)); col.rect([x0 + 1.6, zr - 0.3, x1 - 1.6, zr + 0.3], gy, gy + 0.22);
    for (let x = x0 + 3; x < x1 - 2.5; x += 3) {
      if (Math.abs(x) < 2.5) continue;                                                                       // (open where the axis crosses)
      bag.add(A, lathe([[0.15, 0], [0.13, 0.05], [0.11, 2.6]], 10, null, x, gy + 0.22, zr)); col.circle(x, zr, 0.15, gy, gy + 2.8);
      bag.add('terracotta', lathe([[0.001, 0], [0.12, 0], [0.18, 0.32], [0.2, 0.34], [0.001, 0.3]], 10, null, x + 1.5, gy, zr - s * 0.75));   // a planting pot
      bag.add('palm_leaf', lathe([[0.001, 0.3], [0.16, 0.36], [0.26, 0.5], [0.24, 0.66], [0.1, 0.74], [0.001, 0.72]], 16, (th, i) => 1 + (i > 0 && i < 5 ? 0.28 * Math.sin(th * 7 + x) * Math.cos(th * 3) : 0), x + 1.5, gy, zr - s * 0.75));
    }
    bag.add('timber', box(x0 + 2.8, gy + 2.82, zr - 0.07, x1 - 2.8, gy + 2.96, zr + 0.07));
  }
  for (let x = x0 + 3; x < x1 - 2.5; x += 1.5) if (Math.abs(x) > 2.5) bag.add('timber', box(x - 0.05, gy + 2.96, zw - ww / 2 - 0.4, x + 0.05, gy + 3.06, zw + ww / 2 + 0.4));   // the trellis's slats across
  // the platforms on the axis: rubble faced with ashlar, a step up; the southern one the larger
  for (const [zc, hw] of [[zw - 8.5, 3], [zw + 9.5, 4.5]]) {
    const r = [-hw, zc - hw, hw, zc + hw];
    wall(r, gy - 0.3, gy + 0.75); col.floor(r, gy + 0.75);
    bag.add(PAVE, box(r[0] + 0.15, gy + 0.75, r[1] + 0.15, r[2] - 0.15, gy + 0.78, r[3] - 0.15));
    steps(bag, col, [-1.2, r[3], 1.2, r[3] + 1.0], gy, gy + 0.75, 'n', A, 0.25);
  }
  // the pergola at the north end of the axis: 8.5 × 11 m of stone piers carrying beams and rafters, vines over it
  { const pz0 = z0 + 3.4, pz1 = pz0 + 8.5, hx = 5.5, H = 3.2;
    for (const x of [-hx, -hx / 3, hx / 3, hx]) for (const z of [pz0 + 0.3, pz1 - 0.3]) { wall([x - 0.25, z - 0.25, x + 0.25, z + 0.25], gy - 0.1, gy + H); }
    for (const z of [pz0 + 0.3, pz1 - 0.3]) bag.add('timber', box(-hx - 0.4, gy + H, z - 0.14, hx + 0.4, gy + H + 0.24, z + 0.14));
    for (let x = -hx; x <= hx + 0.01; x += 0.7) bag.add('timber', box(x - 0.06, gy + H + 0.24, pz0 - 0.2, x + 0.06, gy + H + 0.36, pz1 + 0.2));
    for (let k = 0; k < 22; k++) { const x = -hx + 0.3 + ((k * 7) % 22) / 22 * (2 * hx - 0.6), z = pz0 + 0.6 + ((k * 5) % 11) / 11 * (pz1 - pz0 - 1.2); bag.add('palm_leaf', lathe([[0.001, 0], [0.5, 0.06], [0.6, 0.16], [0.001, 0.22]], 7, null, x, gy + H + 0.3, z)); }
    for (const x of [-hx, hx]) for (const z of [pz0 + 0.3, pz1 - 0.3]) bag.add('bark_olive', lathe([[0.06, 0], [0.05, H]], 6, null, x + (x < 0 ? 0.35 : -0.35), gy, z));   // the vines' stems
  }
  // ---- the promenade: paved, raised 2.5 m on the pool's north wall (3.5 m thick), a stair up to it on the axis
  const t = 0.8, around = [[x0 + 1.6, zp, x1 - 1.6, pz0 - t], [x0 + 1.6, pz1 + t, x1 - 1.6, z1 - 1.5], [x0 + 1.6, pz0 - t, px0 - t, pz1 + t], [px1 + t, pz0 - t, x1 - 1.6, pz1 + t]];
  for (const r of around) { bag.add(PAVE, box(r[0], py - 0.04, r[1], r[2], py + 0.02, r[3])); col.floor(r, py + 0.02); }
  wall([x0 + 1.6, zp, -2.5, zp + 3.5], gy - 0.3, py); wall([2.5, zp, x1 - 1.6, zp + 3.5], gy - 0.3, py);
  steps(bag, col, [-2.5, zp - 1.0, 2.5, zp + 3.5], gy, py, 's', A, 0.17);
  for (const r of [[x0 + 1.6, zp, -2.5, zp + 0.5], [2.5, zp, x1 - 1.6, zp + 0.5]]) wall(r, py, py + 0.9);   // the parapet over the garden
  // ---- the pool: lined, its coping, the stair down at the north-east corner, the water ------------------------------
  for (const r of [[px0 - t, pz0 - t, px1 + t, pz0], [px0 - t, pz1, px1 + t, pz1 + t], [px0 - t, pz0, px0, pz1], [px1, pz0, px1 + t, pz1]]) {
    bag.add(LIME, box(r[0], fl - 0.3, r[1], r[2], py - 0.06, r[3])); col.rect(r, fl, py);
    bag.add(A, box(r[0], py - 0.06, r[1], r[2], py + 0.12, r[3]));                                         // the coping
  }
  bag.add(LIME, box(px0, fl - 0.3, pz0, px1, fl + 0.05, pz1));                                               // the floor
  for (let k = 0; k < 12; k++) { const yt = py - (k + 1) * (py - fl) / 12; bag.add(LIME, box(px1 - 2.2, fl - 0.3, pz0, px1, yt + 0.001, pz0 + 0.3 + k * 0.3)); }
  col.ramp([px1 - 2.2, pz0, px1, pz0 + 3.6], fl, py, 'n');
  bag.add('water', fromTriangles([px0, py - 0.45, pz0, px0, py - 0.45, pz1, px1, py - 0.45, pz1, px0, py - 0.45, pz0, px1, py - 0.45, pz1, px1, py - 0.45, pz0]));
  // ---- the island pavilion on its plinth (8.5 × 11 × 2.5 m): open doorways on three sides, inside four columns on
  // marble-faced bases, red stucco with blue and white; a channel across the floor to the one round it ------------
  { const cx = (px0 + px1) / 2, cz = (pz0 + pz1) / 2, hx = 5.5, hz = 4.25, top = py + 0.12, H = 5.2, th = 0.55, dw = 3.0, dh = 3.6;
    wall([cx - hx, cz - hz, cx + hx, cz + hz], fl, top); col.floor([cx - hx, cz - hz, cx + hx, cz + hz], top);
    bag.add(A, box(cx - hx - 0.08, top - 0.18, cz - hz - 0.08, cx + hx + 0.08, top, cz + hz + 0.08));
    bag.add('opening', box(cx - hx + 0.15, top, cz - hz + 0.15, cx + hx - 0.15, top + 0.004, cz - hz + 0.3));       // the channel round it (north side)
    const X0 = cx - hx + 0.4, X1 = cx + hx - 0.4, Z0 = cz - hz + 0.4, Z1 = cz + hz - 0.4;
    // walls: the south (back) solid; doorways in the middle of the north, east and west
    const seg = (r) => { wall(r, top, top + H, RED); };
    seg([X0, Z1 - th, X1, Z1]);
    seg([X0, Z0, cx - dw / 2, Z0 + th]); seg([cx + dw / 2, Z0, X1, Z0 + th]); wall([cx - dw / 2, Z0, cx + dw / 2, Z0 + th], top + dh, top + H, RED);
    for (const [a, b] of [[X0, X0 + th], [X1 - th, X1]]) { const zm = (Z0 + Z1) / 2; seg([a, Z0 + th, b, zm - dw / 2]); seg([a, zm + dw / 2, b, Z1 - th]); wall([a, zm - dw / 2, b, zm + dw / 2], top + dh, top + H, RED); }
    // inside: a white dado under a blue band; the columns; the roof with its cornice
    for (const [r, along] of [[[X0 + th, Z1 - th - 0.012, X1 - th, Z1 - th], true]]) { bag.add('plaster_white', box(r[0], top, r[1], r[2], top + 1.1, r[3])); bag.add('paint_blue', box(r[0], top + 1.1, r[1], r[2], top + 1.35, r[3])); void along; }
    for (const x of [cx - 1.7, cx + 1.7]) for (const z of [cz - 1.2, cz + 1.2]) {
      bag.add('marble', box(x - 0.42, top, z - 0.42, x + 0.42, top + 0.3, z + 0.42));
      pillar(bag, col, x, z, top + 0.3, H - 0.3, 0.24, { dado: 1.2 });
    }
    bag.add('cedar', box(X0, top + H, Z0, X1, top + H + 0.35, Z1));
    bag.add(A, box(X0 - 0.25, top + H + 0.35, Z0 - 0.25, X1 + 0.25, top + H + 0.75, Z1 + 0.25)); col.floor([X0, Z0, X1, Z1], top + H + 0.75);
    bag.add(PAVE, box(X0 + th, top, Z0 + th, X1 - th, top + 0.02, Z1 - th));
    // the channel running diagonally across the floor
    { const T = [], a = [X0 + th + 0.3, Z0 + th + 0.3], b = [X1 - th - 0.3, Z1 - th - 0.3], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L * 0.07, nz = (b[0] - a[0]) / L * 0.07, y = top + 0.024;
      T.push(a[0] - nx, y, a[1] - nz, b[0] - nx, y, b[1] - nz, b[0] + nx, y, b[1] + nz, a[0] - nx, y, a[1] - nz, b[0] + nx, y, b[1] + nz, a[0] + nx, y, a[1] + nz);
      bag.add('opening', fromTriangles(T)); }
  }
  // ---- the screen wall at the back: a central niche and an exedra either side with its bench ---------------------
  { const zb = z1 - 1.5, H = 5;
    const parts = [[x0 + 1.6, -17], [-11, -2], [2, 11], [17, x1 - 1.6]];
    for (const [a, b] of parts) wall([a, zb, b, z1], py - 0.3, py + H);
    // the niche
    wall([-2, zb + 1.1, 2, z1], py - 0.3, py + H); wall([-2, zb, 2, zb + 1.1], py + 3.6, py + H);
    bag.add('plaster_white', box(-1.6, py + 0.6, zb + 1.088, 1.6, py + 3.4, zb + 1.1));
    // the exedrae: recesses 6 m wide and 2.5 m deep behind the wall's line, a bench round them
    for (const c of [-14, 14]) {
      wall([c - 3, z1, c + 3, z1 + 0.8], py - 0.3, py + H); wall([c - 3.8, zb, c - 3, z1 + 0.8], py - 0.3, py + H); wall([c + 3, zb, c + 3.8, z1 + 0.8], py - 0.3, py + H);
      bag.add(PAVE, box(c - 3, py - 0.04, zb, c + 3, py + 0.02, z1)); col.floor([c - 3, zb, c + 3, z1], py + 0.02);
      wall([c - 3, z1 - 0.5, c + 3, z1], py, py + 0.45); col.floor([c - 3, z1 - 0.5, c + 3, z1], py + 0.45);
      bag.add(A, box(c - 3.8, py + H, zb, c + 3.8, py + H + 0.3, z1 + 0.8));
    }
    bag.add(A, box(x0 + 1.6, py + H, zb - 0.15, x1 - 1.6, py + H + 0.3, z1));
  }
}
