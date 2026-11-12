// Brasília style — the Planalto Palace and the Supreme Federal Court: a glass box behind two files of Alvorada columns under a white
// roof slab; the ground floor is a lobby one can enter (reception, sofas, flags, a tapestry wall), a stair climbs to the first floor's
// hall (a long table with chairs, bookcases, flags), the upper floors stay closed.
import { box, lathe } from '../../core/geom.js';
import { rngOf, solidBox, shrub, stool } from './kit.js';

const WHITE = 'plaster_white', CONC = 'concrete_light', FH = 4.4;
/** The Alvorada column: its bow-like swelling profile, flat across its width (1 : 0.38). */
function alvorada(bag, x, z, h, yaw, y = 0) {
  const prof = [[0.08, 0], [0.22, 0.14], [0.4, 0.34], [0.34, 0.55], [0.27, 0.74], [0.36, 0.92], [0.46, 1.0]].map(([r, k]) => [r, k * h]);
  const c = Math.cos(yaw), s = Math.sin(yaw);
  bag.add(WHITE, lathe(prof, 14, (th) => { const a = Math.cos(th) * c + Math.sin(th) * s, b = -Math.cos(th) * s + Math.sin(th) * c; return 1 / Math.hypot(a / 1.0, b / 0.38) * 1.0; }, x, y, z));
}
/** colonnade_palace: { rect, floors, name, door ('z0' | 'z1': the long side where the lobby opens) } */
export function colonnadePalace(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, fl = el.floors ?? 3, H = fl * FH, ins = 4.2, rand = rngOf(Math.round(x0 * 7 + z0));
  const long = x1 - x0 >= z1 - z0 ? 'x' : 'z', y0 = 0.62, doorSide = el.door ?? 'z1';
  bag.add('granite_grey', box(x0 - 3, -0.3, z0 - 3, x1 + 3, 0.5, z1 + 3)); bag.add('marble', box(x0 - 3, 0.5, z0 - 3, x1 + 3, 0.62, z1 + 3));
  const gx0 = x0 + ins, gx1 = x1 - ins, gz0 = z0 + ins, gz1 = z1 - ins, zc = (gz0 + gz1) / 2;
  const n = Math.round((long === 'x' ? x1 - x0 : z1 - z0) / 6.2), sp = (long === 'x' ? x1 - x0 : z1 - z0) / n;
  const dxc = long === 'x' ? x0 + (Math.floor(n / 2) + 0.5) * sp : 0, DW = 2.0;                    // the door's middle: between two columns
  const T = 0.3;
  // ── floors 2 and up: the closed glass box ──
  const yU = y0 + 2 * FH;
  if (fl > 2) { bag.add('facade_glass', box(gx0, yU, gz0, gx1, y0 + H, gz1)); }
  for (let k = 2; k < fl; k++) bag.add(WHITE, box(gx0 - 0.1, y0 + k * FH - 0.15, gz0 - 0.1, gx1 + 0.1, y0 + k * FH + 0.15, gz1 + 0.1));
  bag.add(WHITE, box(x0, y0 + H, z0, x1, y0 + H + 1.1, z1)); bag.add(CONC, box(x0 + 0.6, y0 + H + 1.1, z0 + 0.6, x1 - 0.6, y0 + H + 1.3, z1 - 0.6));
  // ── the two hollow floors: thin glass walls with spandrels, the door in the entrance side of the ground floor ──
  const wall = (a, b, c, d, ya, yb, mat = 'glass_outer') => { bag.add(mat, box(a, ya, b, c, yb, d)); col.rect([a, b, c, d], ya, yb); };
  for (let f = 0; f < Math.min(2, fl); f++) {
    const ya = y0 + f * FH, yb = ya + FH - 0.3;
    // the long sides
    for (const [zA, zB, side] of [[gz0, gz0 + T, 'z0'], [gz1 - T, gz1, 'z1']]) {
      if (f === 0 && side === doorSide) { wall(gx0, zA, dxc - DW, zB, ya, yb); wall(dxc + DW, zA, gx1, zB, ya, yb); bag.add(WHITE, box(dxc - DW, ya + 3.0, zA, dxc + DW, yb, zB)); col.rect([dxc - DW, zA, dxc + DW, zB], ya + 3.0, yb); bag.add('steel_chrome', box(dxc - DW - 0.08, ya, zA - 0.02, dxc - DW, ya + 3.0, zB + 0.02)); bag.add('steel_chrome', box(dxc + DW, ya, zA - 0.02, dxc + DW + 0.08, ya + 3.0, zB + 0.02)); }
      else wall(gx0, zA, gx1, zB, ya, yb);
    }
    wall(gx0, gz0 + T, gx0 + T, gz1 - T, ya, yb, WHITE); wall(gx1 - T, gz0 + T, gx1, gz1 - T, ya, yb, WHITE);
  }
  // the floor slabs: the lobby's ceiling (with the stair's opening), the first floor's ceiling
  const sx0 = gx0 + 3, sx1 = sx0 + 15, sz0 = zc - 2.2, sz1 = zc + 2.2;
  const slab = (a, b, c, d, ya, mat = 'marble') => { bag.add(mat, box(a, ya - 0.3, b, c, ya, d)); col.rect([a, b, c, d], ya - 0.3, ya); };
  const yS = y0 + FH;
  if (fl > 1) {
    slab(gx0, gz0, gx1, sz0, yS); slab(gx0, sz1, gx1, gz1, yS); slab(gx0, sz0, sx0, sz1, yS); slab(sx1, sz0, gx1, sz1, yS);
    col.floor([gx0, gz0, gx1, sz0], yS); col.floor([gx0, sz1, gx1, gz1], yS); col.floor([gx0, sz0, sx0, sz1], yS); col.floor([sx1, sz0, gx1, sz1], yS);
    slab(gx0, gz0, gx1, gz1, y0 + 2 * FH, WHITE);
  } else { slab(gx0, gz0, gx1, gz1, y0 + FH, WHITE); }
  // ── the lobby (ground floor): marble floor, rows of the interior columns, reception, sofas, flags, the tapestry wall, plants ──
  bag.add('marble_dark', box(gx0 + T, y0, gz0 + T, gx1 - T, y0 + 0.04, gz1 - T)); col.floor([gx0 + T, gz0 + T, gx1 - T, gz1 - T], y0 + 0.04);
  const ix0 = gx0 + T, ix1 = gx1 - T, iz0 = gz0 + T, iz1 = gz1 - T, yf = y0 + 0.04;
  for (let x = ix0 + 6; x < ix1 - 3; x += 12) for (const z of [iz0 + 2.2, iz1 - 2.2]) { bag.add(WHITE, lathe([[0.3, 0], [0.26, FH - 0.7], [0.3, FH - 0.3]], 10, null, x, yf, z)); col.circle(x, z, 0.35, yf, y0 + FH); }
  const mx = (long === 'x' ? dxc : (ix0 + ix1) / 2), dz = doorSide === 'z1' ? 1 : -1, zr = doorSide === 'z1' ? iz0 + 3.0 : iz1 - 3.0;
  // the reception desk across the lobby's middle (opposite the door), two flags behind it
  solidBox(bag, col, 'timber', mx - 5, yf, zr - 0.5, mx + 5, yf + 1.1, zr + 0.5); bag.add('marble', box(mx - 5.1, yf + 1.1, zr - 0.6, mx + 5.1, yf + 1.16, zr + 0.6));
  for (const s of [-1, 1]) { const fx = mx + s * 7.5; bag.add('steel_chrome', lathe([[0.05, 0], [0.04, 3.4], [0.001, 3.5]], 6, null, fx, yf, zr + dz * -1.5)); bag.add(s < 0 ? 'cloth_green' : 'cloth_blue', box(fx + 0.04, yf + 2.1, zr - dz * 1.5 - 0.02, fx + 1.4, yf + 3.3, zr - dz * 1.5 + 0.02)); col.circle(fx, zr - dz * 1.5, 0.1, yf, yf + 3.4); }
  // sofas in two groups with low tables; potted palms by the door
  for (const s of [-1, 1]) for (const k of [0, 1]) {
    const cx = mx + s * (9 + k * 7), cz = zc - dz * 0.5 + (k ? 0.8 : 0);
    solidBox(bag, col, 'leather_bench', cx - 1.4, yf, cz - 0.5, cx + 1.4, yf + 0.45, cz + 0.5); bag.add('leather_bench', box(cx - 1.4, yf + 0.45, cz - 0.5 * dz - (dz > 0 ? 0.0 : 0), cx + 1.4, yf + 1.0, cz - 0.5 * dz + 0.12 * dz));
    solidBox(bag, col, 'marble_dark', cx - 0.5, yf, cz + dz * 1.4, cx + 0.5, yf + 0.4, cz + dz * 2.0);
  }
  for (const s of [-1, 1]) { const px = dxc + s * 4.5, pz = doorSide === 'z1' ? iz1 - 1.0 : iz0 + 1.0; solidBox(bag, col, CONC, px - 0.5, yf, pz - 0.5, px + 0.5, yf + 0.6, pz + 0.5); shrub(bag, px, pz, yf + 0.6, 0.7, 'palm_leaf'); }
  // the end walls' tapestry and a long bench under it
  for (const [xx, s] of [[ix0, 1], [ix1, -1]]) { bag.add('cloth_maroon', box(xx + (s > 0 ? 0 : -0.06), yf + 0.8, zc - 4, xx + (s > 0 ? 0.06 : 0), yf + 3.6, zc + 4)); for (let k = 0; k < 6; k++) bag.add(['cloth_ochre', 'cloth_blue', 'cloth_green'][k % 3], box(xx + (s > 0 ? 0.06 : -0.1), yf + 1.2 + (k % 3) * 0.7, zc - 3 + k * 1.1, xx + (s > 0 ? 0.1 : -0.06), yf + 1.7 + (k % 3) * 0.7, zc - 2.2 + k * 1.1)); }
  // ── the stair: from the lobby's west end up to the first floor (a ramp of marble steps) ──
  const run = sx1 - sx0, rise = FH;
  for (let k = 0; k < 22; k++) bag.add('marble', box(sx0 + k * run / 22, yf, sz0 + 0.15, sx0 + (k + 1) * run / 22, yf + 0.18 + (k + 1) * (rise - 0.18) / 22, sz1 - 0.15));
  col.ramp([sx0, sz0 + 0.15, sx1, sz1 - 0.15], yf, y0 + FH, 'e');
  for (const zz of [sz0, sz1 - 0.15]) { bag.add('steel_grey', box(sx0, yf, zz, sx1, yf + 1.0, zz + 0.15)); col.rect([sx0, zz, sx1, zz + 0.15], yf, yf + 1.0); }
  // ── the first floor's hall: carpet, the long table with chairs, bookcases, the flags ──
  if (fl > 1) {
    const yh = y0 + FH, yf1 = yh + 0.04;
    bag.add('cloth_blue', box(sx1 + 0.4, yh + 0.003, iz0 + 3, ix1 - 1, yh + 0.04, iz1 - 3));
    const tx0 = sx1 + 6, tx1 = ix1 - 6;
    if (tx1 > tx0 + 8) {
      solidBox(bag, col, 'timber', tx0, yf1, zc - 1.2, tx1, yf1 + 0.78, zc + 1.2);
      for (let x = tx0 + 1; x < tx1 - 0.5; x += 1.3) for (const s of [-1, 1]) { const cz = zc + s * 1.75; bag.add('leather_bench', box(x, yf1 + 0.42, cz - 0.28, x + 0.55, yf1 + 0.48, cz + 0.28)); bag.add('leather_bench', box(x, yf1 + 0.48, cz + s * 0.24 - 0.04, x + 0.55, yf1 + 1.0, cz + s * 0.24 + 0.04)); for (const [dx, dzz] of [[0.04, -0.24], [0.5, -0.24], [0.04, 0.24], [0.5, 0.24]]) bag.add('timber', box(x + dx, yf1, cz + dzz - 0.02, x + dx + 0.03, yf1 + 0.42, cz + dzz + 0.02)); }
    }
    for (let x = sx1 + 4; x < ix1 - 4; x += 5.2) for (const z of [iz0 + 0.5, iz1 - 0.5]) { solidBox(bag, col, 'timber', x, yf1, z - 0.3, x + 3.6, yf1 + 2.4, z + 0.3); for (let r = 0; r < 4; r++) for (let u = 0; u < 12; u++) if (rand() < 0.8) bag.add(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_white'][Math.floor(rand() * 5)], box(x + 0.1 + u * 0.28, yf1 + 0.2 + r * 0.55, z + (z > zc ? -0.28 : 0.28) - 0.02, x + 0.3 + u * 0.28, yf1 + 0.62 + r * 0.55, z + (z > zc ? -0.28 : 0.28) + 0.02)); }
    for (const s of [-1, 1]) { const fx = ix1 - 1.5, fz = zc + s * 3.5; bag.add('steel_chrome', lathe([[0.05, 0], [0.04, 3.0], [0.001, 3.1]], 6, null, fx, yf1, fz)); bag.add(s < 0 ? 'cloth_green' : 'cloth_blue', box(fx - 1.4, yf1 + 1.8, fz - 0.02, fx - 0.04, yf1 + 2.9, fz + 0.02)); col.circle(fx, fz, 0.1, yf1, yf1 + 3.0); }
    lights.push({ at: [(tx0 + tx1) / 2, yh + 3.2, zc], color: '#fff0d0', intensity: 3, distance: 16 });
    // the floor's own railing round the stair's opening
    for (const zz of [sz0 - 0.1, sz1]) { bag.add('steel_grey', box(sx0, yh, zz, sx1, yh + 1.0, zz + 0.1)); col.rect([sx0, zz, sx1, zz + 0.1], yh, yh + 1.0); }
    bag.add('steel_grey', box(sx0 - 0.1, yh, sz0 - 0.1, sx0, yh + 1.0, sz1 + 0.1)); col.rect([sx0 - 0.1, sz0 - 0.1, sx0, sz1 + 0.1], yh, yh + 1.0);
  }
  lights.push({ at: [(ix0 + ix1) / 2 - 12, y0 + 3.4, zc], color: '#fff0d8', intensity: 3, distance: 16 }, { at: [(ix0 + ix1) / 2 + 12, y0 + 3.4, zc], color: '#fff0d8', intensity: 3, distance: 16 });
  // ── the colonnade: the two files of Alvorada columns outside; the entrance ramp's shallow steps ──
  for (let i = 0; i <= n; i++) {
    for (const side of [0, 1]) {
      const px = long === 'x' ? [x0 + i * sp, side ? z1 - 0.9 : z0 + 0.9] : [side ? x1 - 0.9 : x0 + 0.9, z0 + i * sp];
      alvorada(bag, px[0], px[1], H + 1.1, long === 'x' ? 0 : Math.PI / 2, y0);
      col.circle(px[0], px[1], 0.5, y0, y0 + H);
    }
  }
  // the entrance: a broad ramp of marble between the columns' bay and the glass door
  const zD = doorSide === 'z1' ? gz1 : gz0, sgn = doorSide === 'z1' ? 1 : -1;
  bag.add('marble', box(dxc - 4, y0, Math.min(zD, zD + sgn * (z1 - gz1)), dxc + 4, y0 + 0.02, Math.max(zD, zD + sgn * (z1 - gz1)))); void stool;
}
