// The inside of the Belém Tower (docs/settlements/manueline-lisbon.md §5b): thick ashlar walls round five storeys joined by a
// switchback stair — the vaulted cistern and magazine, the Governor's hall, the king's chamber, the audience room, the chapel — and a
// hatch to the terrace; the courtyard of the bastion with its shot, barrels and flagstaff. Called by belem.js.
import { lathe, rod } from '../../core/geom.js';
import { addBox, orderCross, armillary } from './util.js';
import { kit } from './interiors.js';
import { frame } from '../greek/agora.js';

const MAT = 'limestone', CARVED = 'limestone_carved', WT = 1.4, LAND = 1.4;
export const FLOORS = [0, 6.4, 12.6, 18.8, 25.0];
export function towerFrame(cx, cz) {
  const tx0 = cx - 6, tx1 = cx + 6, tz0 = cz - 5, tz1 = cz + 6, ix0 = tx0 + WT, ix1 = tx1 - WT, iz0 = tz0 + WT, iz1 = tz1 - WT;
  return { tx0, tx1, tz0, tz1, ix0, ix1, iz0, iz1, wx0: ix0, wx1: ix0 + 1.2, wx2: ix0 + 1.3, wx3: ix0 + 2.5 };
}
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

export function towerShell(ctx, { cx, cz, y, top }) {
  const { bag, col, lights } = ctx, T = towerFrame(cx, cz), { tx0, tx1, tz0, tz1, ix0, ix1, iz0, iz1, wx0, wx1, wx2, wx3 } = T;
  const B = (m, a, b, c, d, e, f, solid = false) => { addBox(bag, m, a, b, c, d, e, f); if (solid) col.rect([a, c, d, f], b, e); };
  const dx = cx, dw = 0.85, rand = rng(77);
  // the walls, the door in the south one
  B(MAT, tx0, y - 0.2, tz0, tx1, top, tz0 + WT); B(MAT, tx0, y - 0.2, tz0 + WT, tx0 + WT, top, tz1 - WT); B(MAT, tx1 - WT, y - 0.2, tz0 + WT, tx1, top, tz1 - WT);
  B(MAT, tx0, y - 0.2, tz1 - WT, dx - dw, top, tz1); B(MAT, dx + dw, y - 0.2, tz1 - WT, tx1, top, tz1); B(MAT, dx - dw, y + 3.0, tz1 - WT, dx + dw, top, tz1);
  col.rect([tx0, tz0, tx1, tz0 + WT], y, top + 1); col.rect([tx0, tz0 + WT, tx0 + WT, tz1 - WT], y, top + 1); col.rect([tx1 - WT, tz0 + WT, tx1, tz1 - WT], y, top + 1);
  col.rect([tx0, tz1 - WT, dx - dw, tz1], y, top + 1); col.rect([dx + dw, tz1 - WT, tx1, tz1], y, top + 1); col.rect([dx - dw, tz1 - WT, dx + dw, tz1], y + 2.8, top + 1);
  B(CARVED, dx - dw - 0.2, y, tz1 - 0.05, dx - dw, y + 3.2, tz1 + 0.18); B(CARVED, dx + dw, y, tz1 - 0.05, dx + dw + 0.2, y + 3.2, tz1 + 0.18); B(CARVED, dx - dw - 0.2, y + 3.0, tz1 - 0.05, dx + dw + 0.2, y + 3.3, tz1 + 0.18);
  B('wood_dark', dx - dw, y, tz1 - WT + 0.05, dx - dw + 0.15, y + 2.8, tz1 - 0.3);
  // whitewash lining of the upper rooms
  for (const [a, b, c, d] of [[ix0, iz0, ix1, iz0 + 0.02], [ix0, iz1 - 0.02, ix1, iz1], [ix0, iz0, ix0 + 0.02, iz1], [ix1 - 0.02, iz0, ix1, iz1]]) B('limewash_white', a, y + 6.4, b, c, y + 28.4, d);
  // windows seen from inside: a daylight panel at each of the outer panels
  for (const [yy, h] of [[2.4, 1.6], [8.4, 2.0], [20.8, 2.0], [26.6, 1.6]]) {
    for (const u of [cx - 3, cx + 3]) { B('daylight_plain', u - 0.55, y + yy, iz0 - 0.001, u + 0.55, y + yy + h, iz0 + 0.04); }
    B('daylight_plain', ix1 - 0.04, y + yy, cz + 0.5 - 0.55, ix1 + 0.001, y + yy + h, cz + 0.5 + 0.55); B('daylight_plain', ix0 - 0.001, y + yy, cz + 0.5 - 0.55, ix0 + 0.04, y + yy + h, cz + 0.5 + 0.55);
  }
  for (const [yy, h] of [[2.4, 1.6], [20.8, 2.0], [26.6, 1.6]]) for (const u of [cx - 3, cx + 3]) B('daylight_plain', u - 0.55, y + yy, iz1 - 0.04, u + 0.55, y + yy + h, iz1 + 0.001);
  B('daylight_plain', cx - 4.2, y + FLOORS[2] + 1.1, iz1 - 0.04, cx + 4.2, y + FLOORS[2] + 3.6, iz1 + 0.001);   // the loggia seen from the king's chamber
  // the floors (slabs with the well cut out), the stair
  const fl0 = y;
  B('flagstone', ix0, fl0 - 0.5, iz0, ix1, fl0, iz1); col.floor([ix0, iz0, ix1, iz1], fl0);
  const flight = (xa, xb, f0, f1, north) => {
    const nS = 18, za = north ? iz1 - LAND : iz0 + LAND, zb = north ? iz0 + LAND : iz1 - LAND;
    for (let k = 0; k < nS; k++) { const t0 = k / nS, t1 = (k + 1) / nS, z0 = za + (zb - za) * t0, z1 = za + (zb - za) * t1; B(MAT, xa, y + f0 - 0.4, Math.min(z0, z1), xb, y + f0 + (f1 - f0) * t1, Math.max(z0, z1)); }
    col.ramp([xa, Math.min(za, zb), xb, Math.max(za, zb)], y + f0, y + f1, north ? 'n' : 's');
  };
  for (let s = 0; s < 4; s++) {
    const f0 = FLOORS[s], f1 = FLOORS[s + 1], mid = (f0 + f1) / 2, fl = y + f1;
    flight(wx0, wx1, f0, mid, true); flight(wx2, wx3, mid, f1, false);
    B(MAT, wx0, y + mid - 0.4, iz0, wx3, y + mid, iz0 + LAND); col.floor([wx0, iz0, wx3, iz0 + LAND], y + mid);
    B('wood_dark', wx1, y + f0, iz0 + LAND, wx2, y + f1 - 0.3, iz1 - LAND);
    const slab = (a, b, c, d) => { B(s === 3 ? 'limestone' : 'timber', a, fl - 0.35, b, c, fl, d); col.floor([a, b, c, d], fl); };
    slab(ix0, iz1 - LAND, ix1, iz1); slab(wx3, iz0, ix1, iz1 - LAND);
    // beams under it
    for (let z = iz0 + 0.6; z < iz1; z += 1.2) if (z > iz0 + LAND) B('wood_dark', wx3, fl - 0.6, z - 0.1, ix1, fl - 0.35, z + 0.1);
  }
  // the chapel's flight to the terrace (west side of the well, from the chapel's south strip north to the roof)
  { const f0 = FLOORS[4], f1 = 28.9, nS = 18, za = iz1 - LAND, zb = iz0 + LAND;
    for (let k = 0; k < nS; k++) { const t1 = (k + 1) / nS, z0 = za + (zb - za) * k / nS, z1 = za + (zb - za) * t1; B(MAT, wx0, y + f0 - 0.4, Math.min(z0, z1), wx1, y + f0 + (f1 - f0) * t1, Math.max(z0, z1)); }
    col.ramp([wx0, zb, wx1, za], y + f0, y + f1, 'n'); }
  // ── the rooms
  const R = (i) => kit(ctx, frame([ix0, iz0, ix1, iz1], 'n'), y + FLOORS[i], rand);
  const light = (i, x, z, c = '#ffc27a', k = 5) => lights.push({ at: [x, y + FLOORS[i] + 4.2, z], color: c, intensity: k, distance: 11 });
  const ux = wx3 + 0.3, mx = (wx3 + ix1) / 2, mz = (iz0 + iz1) / 2;
  // ground: the cistern and the magazine — a curb with water, shot in pyramids, powder barrels, coils, torches
  { const k = R(0); const a = [mx, mz - 1]; bag.add('limestone', lathe([[1.1, 0], [1.1, 0.9], [0.9, 0.9], [0.9, 0.0]], 10, null, a[0], y, a[1])); col.circle(a[0], a[1], 1.1, y, y + 0.9); bag.add('water', lathe([[0.001, 0], [0.9, 0]], 10, null, a[0], y + 0.7, a[1]));
    for (let q = 0; q < 3; q++) for (let r = 0; r <= 2 - q; r++) for (let c = 0; c <= 2 - q - r; c++) bag.add('iron', lathe([[0.001, 0], [0.1, 0.07], [0.12, 0.12], [0.1, 0.17], [0.001, 0.24]], 6, null, ix1 - 1.0 - r * 0.24 - q * 0.12 - c * 0.12, y + q * 0.2, iz0 + 0.8 + (r + c) * 0.24 + q * 0.12));
    for (let q = 0; q < 6; q++) k.barrel(ux + 0.4 + (q % 3) * 0.75, iz1 - 2.6 - Math.floor(q / 3) * 0.75, 0, 0.3, 0.8);
    for (let q = 0; q < 3; q++) k.coil(ix1 - 0.8, iz1 - 2.2 - q * 0.8, 0, 0.34);
    light(0, mx, mz, '#ff9a4a', 6); }
  // the Governor's hall: a long table with chairs and a map, a rack of halberds, a chest, a banner of the Order
  { const k = R(1); k.table(mx, mz, 3.4, 1.0, 0.8); for (const s of [-1, 1]) for (let q = 0; q < 3; q++) k.stool(mx - 1.2 + q * 1.2, mz + s * 0.95, 0.46);
    addBox(bag, 'linen', mx - 1.0, y + FLOORS[1] + 0.82, mz - 0.35, mx + 0.4, y + FLOORS[1] + 0.84, mz + 0.35); addBox(bag, 'cloth_blue', mx - 0.8, y + FLOORS[1] + 0.84, mz - 0.2, mx - 0.1, y + FLOORS[1] + 0.85, mz + 0.2);
    for (let q = 0; q < 5; q++) bag.add('iron', rod([ix1 - 0.4 - q * 0.18, y + FLOORS[1], iz0 + 0.5], [ix1 - 0.35 - q * 0.18, y + FLOORS[1] + 2.2, iz0 + 0.5], 0.02, 4));
    k.chest(ux + 0.6, iz1 - 0.6, 1.1, 0.55); addBox(bag, 'plaster_white', mx - 1.0, y + FLOORS[1] + 2.3, iz1 - 0.08, mx + 1.0, y + FLOORS[1] + 4.4, iz1 - 0.04); orderCross(bag, 'wall_red', mx, y + FLOORS[1] + 3.35, iz1 - 0.09, 0.7, 'n'); light(1, mx, mz); }
  // the king's chamber: a canopied bed, a prie-dieu, a table, a hung tapestry
  { const k = R(2); k.bed(ix1 - 1.2, iz0 + 0.3, 1.7, 2.3); for (const [a, b] of [[ix1 - 2.0, iz0 + 0.3], [ix1 - 0.4, iz0 + 0.3], [ix1 - 2.0, iz0 + 2.5], [ix1 - 0.4, iz0 + 2.5]]) addBox(bag, 'wood_dark', a - 0.05, y + FLOORS[2], b - 0.05, a + 0.05, y + FLOORS[2] + 2.2, b + 0.05);
    addBox(bag, 'cloth_maroon', ix1 - 2.1, y + FLOORS[2] + 2.2, iz0 + 0.2, ix1 - 0.3, y + FLOORS[2] + 2.35, iz0 + 2.6);
    k.table(mx - 0.4, mz + 1.4, 1.2, 0.7); k.stool(mx - 0.4, mz + 2.1); k.chest(ux + 0.8, iz0 + 0.5, 1.1, 0.55);
    addBox(bag, 'wood_dark', mx + 0.8, y + FLOORS[2], mz - 0.4, mx + 1.4, y + FLOORS[2] + 0.9, mz + 0.2); addBox(bag, 'cloth_red', mx + 0.8, y + FLOORS[2] + 0.55, mz - 0.4, mx + 1.4, y + FLOORS[2] + 0.62, mz + 0.2);
    addBox(bag, 'cloth_red', ix1 - 0.06, y + FLOORS[2] + 1.0, iz0 + 3.0, ix1 - 0.02, y + FLOORS[2] + 3.6, iz0 + 6.5); addBox(bag, 'gilt_bronze', ix1 - 0.07, y + FLOORS[2] + 1.3, iz0 + 3.5, ix1 - 0.05, y + FLOORS[2] + 3.3, iz0 + 6.0); light(2, mx, mz); }
  // the audience room: a dais with a carved chair, benches along the walls, a table with a portolan chart, a hanging lamp
  { const k = R(3); addBox(bag, 'timber', mx - 1.8, y + FLOORS[3], iz0 + 0.2, mx + 1.8, y + FLOORS[3] + 0.3, iz0 + 2.2); col.floor([mx - 1.8, iz0 + 0.2, mx + 1.8, iz0 + 2.2], y + FLOORS[3] + 0.3);
    addBox(bag, 'wood_dark', mx - 0.5, y + FLOORS[3] + 0.3, iz0 + 0.5, mx + 0.5, y + FLOORS[3] + 0.9, iz0 + 1.3); addBox(bag, 'wood_dark', mx - 0.5, y + FLOORS[3] + 0.9, iz0 + 0.45, mx + 0.5, y + FLOORS[3] + 2.1, iz0 + 0.6); addBox(bag, 'cloth_red', mx - 0.45, y + FLOORS[3] + 0.9, iz0 + 0.65, mx + 0.45, y + FLOORS[3] + 0.98, iz0 + 1.25);
    for (const s of [-1, 1]) k.bench(mx + s * 2.6 - 0.9, mx + s * 2.6 + 0.9, mz + 1.0);
    k.table(mx, mz + 2.4, 1.6, 0.9); addBox(bag, 'linen', mx - 0.7, y + FLOORS[3] + 0.8, mz + 2.1, mx + 0.7, y + FLOORS[3] + 0.82, mz + 2.7); addBox(bag, 'cloth_blue', mx - 0.5, y + FLOORS[3] + 0.82, mz + 2.2, mx + 0.3, y + FLOORS[3] + 0.83, mz + 2.6);
    bag.add('iron', rod([mx, y + FLOORS[3] + 6.0, mz], [mx, y + FLOORS[3] + 4.3, mz], 0.015, 4)); bag.add('gilt_bronze', lathe([[0.4, 0], [0.12, 0.2], [0.3, 0.4], [0.001, 0.42]], 8, null, mx, y + FLOORS[3] + 3.9, mz)); light(3, mx, mz); }
  // the chapel: an altar under a ribbed vault, the Virgin, benches, a lamp
  { const k = R(4), f = y + FLOORS[4];
    addBox(bag, 'limestone', mx - 1.3, f, iz0 + 0.3, mx + 1.3, f + 1.0, iz0 + 1.3); col.rect([mx - 1.3, iz0 + 0.3, mx + 1.3, iz0 + 1.3], f, f + 1.0); addBox(bag, 'cloth_white', mx - 1.2, f + 1.0, iz0 + 0.35, mx + 1.2, f + 1.04, iz0 + 1.25);
    addBox(bag, CARVED, mx - 1.2, f + 1.0, iz0 + 0.02, mx + 1.2, f + 3.0, iz0 + 0.3); addBox(bag, 'gilt_bronze', mx - 0.5, f + 1.4, iz0 + 0.3, mx + 0.5, f + 2.7, iz0 + 0.32);
    bag.add(CARVED, lathe([[0.001, 0], [0.18, 0.05], [0.15, 0.6], [0.1, 0.75], [0.12, 0.95], [0.001, 1.0]], 8, null, mx, f + 1.04, iz0 + 0.8));
    for (const z of [mz + 0.6, mz + 1.8]) k.bench(mx - 1.2, mx + 1.2, z, 0.45);
    for (let q = 0; q < 3; q++) { addBox(bag, 'ivory', mx - 0.9 + q * 0.9 - 0.03, f + 1.04, iz0 + 0.8 - 0.03, mx - 0.9 + q * 0.9 + 0.03, f + 1.3, iz0 + 0.8 + 0.03); bag.add('flame', lathe([[0.001, 0], [0.02, 0.04], [0.001, 0.1]], 5, null, mx - 0.9 + q * 0.9, f + 1.3, iz0 + 0.8)); }
    for (const [a, b] of [[wx3 + 0.05, iz0 + 0.3], [ix1 - 0.05, iz0 + 0.3], [wx3 + 0.05, iz1 - 0.3], [ix1 - 0.05, iz1 - 0.3]]) { /* ribs spring from the corners */ bag.add('limestone_yellow', rod([a, f + 2.6, b], [mx, top - 0.05, mz], 0.08, 5)); }
    bag.add('limestone_carved', lathe([[0.3, 0], [0.34, 0.08], [0.001, 0.2]], 8, null, mx, top - 0.22, mz)); light(4, mx, mz, '#ffd9a0', 5); }
  return T;
}
/** The deck's courtyard: shot in pyramids, powder barrels, coils of rope, a flagstaff with the royal banner, a sentry box. */
export function deckDressing(ctx, { cx, cz, y }) {
  const { bag, col } = ctx, rand = rng(5);
  for (const [px, pz] of [[cx - 9, cz + 7], [cx + 9, cz + 7], [cx - 11, cz - 1], [cx + 11, cz - 1]]) for (let q = 0; q < 3; q++) for (let r = 0; r <= 2 - q; r++) for (let c = 0; c <= 2 - q - r; c++) bag.add('iron', lathe([[0.001, 0], [0.1, 0.07], [0.12, 0.12], [0.1, 0.17], [0.001, 0.24]], 6, null, px + r * 0.24 + q * 0.12, y + q * 0.2, pz + (c + r) * 0.0 + c * 0.24 + q * 0.12));
  for (let k = 0; k < 6; k++) { const px = cx - 7 + (k % 3) * 0.7 + (k > 2 ? 12 : 0), pz = cz + 9 - Math.floor(k / 3) * 0.7; bag.add('timber', lathe([[0.27, 0], [0.32, 0.25], [0.33, 0.45], [0.32, 0.65], [0.27, 0.9], [0.001, 0.9]], 12, null, px, y, pz)); col.circle(px, pz, 0.33, y, y + 0.9); }
  bag.add('timber', rod([cx + 5, y, cz + 8.5], [cx + 5, y + 8, cz + 8.5], 0.08, 6)); addBox(bag, 'plaster_white', cx + 5.05, y + 5.6, cz + 8.46, cx + 5.07, y + 7.6, cz + 8.46 + 0.0 + 0.0 + 0.0 + 0.0);
  addBox(bag, 'plaster_white', cx + 5.05, y + 5.6, cz + 8.5, cx + 6.9, y + 7.6, cz + 8.52); orderCross(bag, 'wall_red', cx + 5.98, y + 6.6, cz + 8.53, 0.5, 's');
  col.circle(cx + 5, cz + 8.5, 0.1, y, y + 8);
  void rand; void armillary;
}
