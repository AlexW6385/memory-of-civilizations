// The Jerónimos church furnished (docs/settlements/manueline-lisbon.md §3b): the stone stair to the choir gallery along the north
// aisle, the monks' choir stalls and lectern in the gallery, side altars with their painted retables, the pulpit, the font, hanging
// lamps, candle stands and votive lights, the founder's tomb niche and the sedilia in the chancel, grave slabs in the floor.
import { box, lathe, rod } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';
import { addBox, ropeColumn, armillary, orderCross } from './util.js';
import { churchFrame, vaultY } from './church.js';

const MAT = 'limestone_yellow', CARVED = 'limestone_carved';
const candle = (bag, x, y, z, h = 0.3) => { bag.add('ivory', lathe([[0.03, 0], [0.03, h], [0.001, h]], 6, null, x, y, z)); bag.add('flame', lathe([[0.001, 0], [0.018, 0.03], [0.001, 0.08]], 5, null, x, y + h, z)); };

export function furnishChurch(ctx, rect, y, px) {
  const { bag, col, lights } = ctx, F = churchFrame(rect), { xi0, xi1, zi0, zi1, zc, bays, chancel, rows } = F, gy = y + 8.4;
  // ── the stair to the choir gallery: straight, along the north aisle, rising west to the gallery's edge
  const sz0 = zi0 + 1.2, sz1 = sz0 + 1.8, sx0 = bays[1], sx1 = bays[3], nS = 40;
  for (let k = 0; k < nS; k++) { const xa = sx1 - (k + 1) * (sx1 - sx0) / nS, xb = sx1 - k * (sx1 - sx0) / nS, top = y + 0.21 * (k + 1); addBox(bag, 'limestone', xa, y, sz0, xb, top, sz1); }
  col.ramp([sx0, sz0, sx1, sz1], y, gy, 'w');
  bag.add(CARVED, rod([sx1, y + 1.0, sz1], [sx0, gy + 1.0, sz1], 0.08, 6));
  for (let k = 0; k <= 8; k++) { const t = k / 8, xx = sx1 - t * (sx1 - sx0); addBox(bag, CARVED, xx - 0.08, y + 0.21 * t * nS, sz1 - 0.08, xx + 0.08, y + 0.21 * t * nS + 1.0 + 0.0, sz1 + 0.08); }
  col.floor([xi0, zi0, bays[1] - 0.35, zi1], gy);
  // ── the gallery: choir stalls along the west and north walls (seats with high carved backs), the lectern with its great book
  for (const [z0, z1] of [[zi0 + 4.0, zc - 0.5], [zc + 0.5, zi1 - 0.3]]) {
    addBox(bag, 'wood_dark', xi0 + 0.1, gy, z0, xi0 + 0.9, gy + 0.5, z1); addBox(bag, 'timber', xi0 + 0.1, gy + 0.5, z0, xi0 + 0.9, gy + 0.55, z1);
    addBox(bag, 'wood_dark', xi0 + 0.1, gy + 0.55, z0, xi0 + 0.25, gy + 2.4, z1);
    for (let z = z0 + 0.5; z < z1; z += 0.8) addBox(bag, 'wood_dark', xi0 + 0.25, gy + 0.55, z - 0.04, xi0 + 0.9, gy + 1.0, z + 0.04);   // the arm-rests between seats
    for (let z = z0 + 0.4; z < z1 - 0.2; z += 1.6) { bag.add(CARVED, lathe([[0.001, 0], [0.12, 0.05], [0.12, 0.5], [0.001, 0.52]], 6, null, xi0 + 0.2, gy + 2.4, z)); }
  }
  addBox(bag, 'wood_dark', bays[1] - 4.2, gy, zc - 0.9, bays[1] - 3.6, gy + 1.1, zc + 0.9);   // lectern
  addBox(bag, 'wood_dark', bays[1] - 4.35, gy + 1.1, zc - 0.8, bays[1] - 3.45, gy + 1.2, zc + 0.8); addBox(bag, 'cloth_maroon', bays[1] - 4.3, gy + 1.2, zc - 0.55, bays[1] - 3.55, gy + 1.28, zc + 0.55);
  addBox(bag, 'ivory', bays[1] - 4.25, gy + 1.28, zc - 0.5, bays[1] - 3.6, gy + 1.34, zc + 0.5);
  col.rect([bays[1] - 4.35, zc - 0.9, bays[1] - 3.45, zc + 0.9], gy, gy + 1.3);
  for (const z of [zc - 2.2, zc + 2.2]) { bag.add('iron', rod([bays[1] - 2.2, gy, z], [bays[1] - 2.2, gy + 1.5, z], 0.025, 5)); for (let k = 0; k < 3; k++) candle(bag, bays[1] - 2.2 + (k - 1) * 0.12, gy + 1.5, z, 0.25); }
  lights.push({ at: [bays[1] - 3, gy + 2.2, zc], color: '#ffc27a', intensity: 5, distance: 11 });
  // ── the side altars in the south wall's bays and one in the north: a stone table, the antependium, a retable of painted panels, candlesticks
  const altar = (x, face, zw) => {
    const s = face === 's' ? -1 : 1, z = zw + s * 0.0;   // s: toward the nave from the wall
    const zA = face === 's' ? zi1 - 1.6 : zi0 + 1.0;
    void z;
    addBox(bag, 'limestone', x - 1.3, y, zA, x + 1.3, y + 1.0, zA + 1.0); col.rect([x - 1.3, zA, x + 1.3, zA + 1.0], y, y + 1.0);
    addBox(bag, 'limestone', x - 1.4, y + 1.0, zA - 0.05, x + 1.4, y + 1.08, zA + 1.1);
    addBox(bag, 'cloth_red', x - 1.0, y + 0.2, zA + (face === 's' ? 0.0 : 0.98), x + 1.0, y + 0.95, zA + (face === 's' ? 0.02 : 1.0)); void s;
    const wz = face === 's' ? zi1 : zi0;
    addBox(bag, CARVED, x - 1.5, y + 1.08, wz - (face === 's' ? 0.6 : -0.0), x + 1.5, y + 4.6, wz - (face === 's' ? 0.0 : -0.6));
    addBox(bag, 'paint_blue', x - 1.3, y + 1.6, wz - (face === 's' ? 0.64 : -0.6), x + 1.3, y + 4.2, wz - (face === 's' ? 0.6 : -0.64));
    addBox(bag, 'gilt_bronze', x - 0.5, y + 2.2, wz - (face === 's' ? 0.66 : -0.62), x + 0.5, y + 3.6, wz - (face === 's' ? 0.64 : -0.66));
    for (const dx of [-0.9, 0.9]) { bag.add('gilt_bronze', lathe([[0.1, 0], [0.04, 0.2], [0.05, 0.4], [0.1, 0.45]], 8, null, x + dx, y + 1.08, zA + 0.5)); candle(bag, x + dx, y + 1.53, zA + 0.5, 0.3); }
    orderCross(bag, 'wall_red', x, y + 4.9, wz - (face === 's' ? 0.55 : -0.55), 0.35, face === 's' ? 'n' : 's');
  };
  for (const x of [bays[1] + 5, bays[2] + 5, bays[4] + 5]) if (Math.abs(x - px) > 5) altar(x, 's', zi1);
  altar(bays[4] + 5, 'n', zi0);
  // ── the pulpit on the second south column: a stone cup with carved sides, a canopy; the font under the gallery
  const pc = [bays[3], rows[1] - 1.8];
  bag.add(CARVED, lathe([[0.001, 0], [0.5, 0.05], [0.9, 0.5], [1.0, 0.9], [0.95, 1.05], [0.001, 1.05]], 8, null, pc[0], y + 2.5, pc[1]));
  bag.add(MAT, lathe([[0.95, 0], [1.1, 0.12], [1.1, 0.2], [0.001, 0.22]], 8, null, pc[0], y + 3.55, pc[1]));
  bag.add('wood_dark', lathe([[0.5, 0], [0.9, 0.3], [0.001, 0.9]], 8, null, pc[0], y + 4.9, pc[1])); bag.add('iron', rod([pc[0], y + 4.4, pc[1]], [pc[0], y + 4.95, pc[1]], 0.02, 4));
  const fontP = [xi0 + 3.2, zi1 - 3.0];
  bag.add('limestone', lathe([[0.9, 0], [0.9, 0.2], [0.5, 0.4], [0.4, 0.9], [0.8, 1.0], [0.85, 1.05], [0.7, 1.05], [0.001, 1.0]], 10, null, fontP[0], y, fontP[1])); col.circle(fontP[0], fontP[1], 0.9, y, y + 1.1);
  bag.add('water', lathe([[0.001, 0], [0.62, 0]], 10, null, fontP[0], y + 1.0, fontP[1]));
  // ── hanging lamps (silver, on chains) over the nave, lit; candle stands at the aisles; votive stands before the portal
  for (const [lx, lz] of [[bays[1] + 5, zc], [bays[3] + 5, zc], [bays[2] + 5, zc - 7.5], [bays[2] + 5, zc + 7.5], [bays[4] + 5, zc - 7.5], [bays[4] + 5, zc + 7.5], [chancel + 6, zc]]) {
    bag.add('iron', rod([lx, y + vaultY(F, lx, lz) + 0.1, lz], [lx, y + 5.6, lz], 0.015, 4)); bag.add('silver', lathe([[0.3, 0], [0.12, 0.2], [0.2, 0.4], [0.001, 0.42]], 8, null, lx, y + 5.2, lz)); bag.add('flame', lathe([[0.001, 0], [0.04, 0.08], [0.001, 0.2]], 5, null, lx, y + 5.35, lz));
  }
  for (const [vx, vz] of [[px - 7, zi1 - 1.6], [px + 7, zi1 - 1.6]]) {
    addBox(bag, 'iron', vx - 0.5, y, vz - 0.3, vx + 0.5, y + 0.9, vz + 0.3); col.rect([vx - 0.5, vz - 0.3, vx + 0.5, vz + 0.3], y, y + 0.9);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) candle(bag, vx - 0.36 + b * 0.24, y + 0.9, vz - 0.2 + a * 0.2, 0.18);
    lights.push({ at: [vx, y + 1.6, vz], color: '#ffb35c', intensity: 3, distance: 6 });
  }
  for (const [cx, cz] of [[chancel - 4, zc - 4], [chancel - 4, zc + 4], [chancel + 3, zi0 + 1.2], [chancel + 3, zi1 - 1.2]]) {
    const yy = cx < chancel ? y : y + 1.2;
    bag.add('gilt_bronze', lathe([[0.3, 0], [0.12, 0.2], [0.06, 0.5], [0.06, 1.5], [0.18, 1.6], [0.001, 1.64]], 8, null, cx, yy, cz)); col.circle(cx, cz, 0.3, yy, yy + 1.6);
    for (let k = 0; k < 3; k++) candle(bag, cx + (k - 1) * 0.16, yy + 1.62, cz, 0.35);
  }
  // ── the chancel: the founder's tomb niche in the north wall, the sedilia in the south, the Paschal candle, the lectern, steps with carpets
  const ty = y + 1.2;
  addBox(bag, CARVED, chancel + 2.0, ty, zi0, chancel + 6.5, ty + 2.2, zi0 + 0.7); addBox(bag, 'opening', chancel + 2.4, ty + 0.2, zi0 + 0.7, chancel + 6.1, ty + 1.9, zi0 + 0.74);
  addBox(bag, 'marble', chancel + 2.6, ty + 0.2, zi0 + 0.75, chancel + 5.9, ty + 0.9, zi0 + 1.9); col.rect([chancel + 2.6, zi0 + 0.75, chancel + 5.9, zi0 + 1.9], ty, ty + 0.9);
  armillary(bag, CARVED, chancel + 4.25, ty + 2.9, zi0 + 0.4, 0.5); orderCross(bag, 'wall_red', chancel + 3.0, ty + 3.0, zi0 + 0.72, 0.3, 's'); orderCross(bag, 'wall_red', chancel + 5.5, ty + 3.0, zi0 + 0.72, 0.3, 's');
  for (let k = 0; k < 3; k++) { addBox(bag, 'limestone', chancel + 2.4 + k * 1.3, ty, zi1 - 0.9, chancel + 3.5 + k * 1.3, ty + 0.45, zi1); addBox(bag, CARVED, chancel + 2.3 + k * 1.3, ty + 0.45, zi1 - 0.2, chancel + 3.6 + k * 1.3, ty + 2.2, zi1); }
  col.rect([chancel + 2.3, zi1 - 0.9, chancel + 6.2, zi1], ty, ty + 2.2);
  bag.add('ivory', lathe([[0.1, 0], [0.1, 1.6], [0.001, 1.6]], 6, null, xi1 - 6, ty, zc - 3)); bag.add('flame', lathe([[0.001, 0], [0.04, 0.1], [0.001, 0.24]], 5, null, xi1 - 6, ty + 1.6, zc - 3));
  addBox(bag, 'cloth_red', chancel - 3.4, y + 0.3 * 4 * 0.8 - 0.0, zc - 1.6, chancel, y + 0.97, zc + 1.6);   // the carpet down the steps
  // ── the floor: grave slabs of the monks and benefactors, a long marble slab down the nave axis
  for (let k = 0; k < 9; k++) { const x = bays[1] + 3 + (k % 3) * 11 + (k > 5 ? 3 : 0), z = zc + ((k * 5) % 3 - 1) * 3.2; if (Math.abs(x - px) < 4 && z > zc + 3) continue; addBox(bag, 'marble', x, y + 0.002, z, x + 2.2, y + 0.012, z + 1.1); }
  void ropeColumn; void tube;
}
