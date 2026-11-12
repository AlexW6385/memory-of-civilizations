// The furnishing of rooms and the dressing of walls of Abbasid Baghdad (docs/settlements/abbasid-baghdad.md §12): what stands in the rooms of a
// house, a barracks, a diwan, a kitchen, a store, a treasury; what is on a house front at eye level (door leaf, bench of brick, window
// grille, rafter ends, patches of fallen plaster, a spout). All in a local frame, boxes and lathes, merged by the builder.

import { box, lathe } from '../../core/geom.js';
import { rug, cushion } from './palace.js';
import { desk, bookcase } from './library.js';
import { wallRun } from './kit.js';

const cl = ['cloth_maroon', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_red', 'cloth_blue'];

/**
 * The frame of a room: `door` is the side the door is on ('+x', '-x', '+z', '-z' of the rect); u runs along the back wall, v from the back wall
 * toward the door. Returns helpers placing boxes (B), colliders (K), points (P) and the extents (L along, W deep).
 */
export function roomFrame(r, door) {
  const [x0, z0, x1, z1] = r, ax = door === '+x' || door === '-x', L = ax ? z1 - z0 : x1 - x0, W = ax ? x1 - x0 : z1 - z0;
  const P = (u, v) => (door === '+x' ? [x0 + v, z0 + u] : door === '-x' ? [x1 - v, z0 + u] : door === '+z' ? [x0 + u, z0 + v] : [x0 + u, z1 - v]);
  const rect = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { L, W, P, rect, B: (bag, mat, u0, v0, u1, v1, h0, h1) => { const q = rect(u0, v0, u1, v1); bag.add(mat, box(q[0], h0, q[1], q[2], h1, q[3])); }, K: (col, u0, v0, u1, v1, h0, h1) => col.rect(rect(u0, v0, u1, v1), h0, h1) };
}

/** An iron-banded chest of cedar. */
export function chest(bag, col, x, z, y, w = 0.9, d = 0.5, h = 0.55) {
  bag.add('cedar', box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2)); bag.add('cedar', box(x - w / 2 - 0.02, y + h, z - d / 2 - 0.02, x + w / 2 + 0.02, y + h + 0.06, z + d / 2 + 0.02));
  for (const s of [-0.3, 0.3]) bag.add('iron', box(x + s * w - 0.025, y, z - d / 2 - 0.012, x + s * w + 0.025, y + h + 0.05, z + d / 2 + 0.012));
  col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + h + 0.06);
}
/** A bronze brazier on three legs with embers. */
export function brazier(bag, col, x, z, y) {
  bag.add('bronze', lathe([[0.001, 0.32], [0.2, 0.34], [0.3, 0.5], [0.34, 0.5], [0.3, 0.46], [0.001, 0.4]], 10, null, x, y, z));
  bag.add('flame', lathe([[0.001, 0.5], [0.26, 0.5], [0.001, 0.52]], 8, null, x, y - 0.02, z));
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.4; bag.add('bronze', box(x + Math.cos(a) * 0.18 - 0.02, y, z + Math.sin(a) * 0.18 - 0.02, x + Math.cos(a) * 0.18 + 0.02, y + 0.34, z + Math.sin(a) * 0.18 + 0.02)); }
  col.circle(x, z, 0.34, y, y + 0.5);
}
/** A big water jar (zir) on a wooden stand, with its lid. */
export function zir(bag, col, x, z, y, s = 1) {
  bag.add('cedar', box(x - 0.3 * s, y, z - 0.3 * s, x + 0.3 * s, y + 0.06, z + 0.3 * s));
  bag.add('terracotta', lathe([[0.001, 0.06], [0.07 * s, 0.1], [0.19 * s, 0.3], [0.25 * s, 0.55], [0.22 * s, 0.8], [0.12 * s, 0.95], [0.14 * s, 1.0], [0.001, 1.0]], 10, null, x, y, z));
  col.circle(x, z, 0.3 * s, y, y + 1.0);
}
/** A storage jar (pithos) half sunk, tall. */
export function pithos(bag, col, x, z, y, s = 1) {
  bag.add('terracotta', lathe([[0.001, 0], [0.2 * s, 0.02], [0.38 * s, 0.3], [0.44 * s, 0.7], [0.36 * s, 1.1], [0.2 * s, 1.3], [0.24 * s, 1.36], [0.001, 1.36]], 10, null, x, y, z));
  col.circle(x, z, 0.42 * s, y, y + 1.3);
}
/** A mattress with a pillow and a quilt, on a reed mat, lying along z (head to −z). */
export function bed(bag, col, x, z, y, rand) {
  bag.add('reed_mat', box(x - 0.6, y, z - 1.1, x + 0.6, y + 0.015, z + 1.1));
  bag.add('cloth_white', box(x - 0.5, y + 0.015, z - 1.0, x + 0.5, y + 0.14, z + 1.0));
  bag.add(cl[Math.floor(rand() * cl.length)], box(x - 0.52, y + 0.14, z - 0.1, x + 0.52, y + 0.2, z + 1.02));
  bag.add('cloth_white', box(x - 0.3, y + 0.14, z - 0.95, x + 0.3, y + 0.24, z - 0.55));
  col.rect([x - 0.6, z - 1.1, x + 0.6, z + 1.1], y, y + 0.22);
}
/** A low round tray table (sufra) with bread and bowls. */
export function tray(bag, col, x, z, y, rand) {
  bag.add('cedar', box(x - 0.04, y, z - 0.04, x + 0.04, y + 0.2, z + 0.04));
  bag.add('bronze', lathe([[0.001, 0.2], [0.42, 0.2], [0.44, 0.23], [0.001, 0.23]], 14, null, x, y, z));
  for (let k = 0; k < 3; k++) bag.add(['glaze_blue', 'glaze_white', 'glaze_green'][k], lathe([[0.001, 0], [0.08, 0], [0.11, 0.05], [0.001, 0.03]], 8, null, x + Math.cos(k * 2.1 + rand()) * 0.22, y + 0.23, z + Math.sin(k * 2.1 + rand()) * 0.22));
  for (let k = 0; k < 2; k++) bag.add('plaster', lathe([[0.001, 0], [0.12, 0], [0.12, 0.02], [0.001, 0.02]], 8, null, x + (k - 0.5) * 0.18, y + 0.23 + k * 0.02, z));
}
/** A hanging oil lamp from the ceiling (glass in a bronze ring), lit. */
export function lamp(c, x, z, yTop, drop, light = true, intensity = 4) {
  const { bag, lights } = c;
  bag.add('iron', box(x - 0.008, yTop - drop, z - 0.008, x + 0.008, yTop, z + 0.008));
  bag.add('bronze', lathe([[0.16, 0], [0.1, 0.08], [0.03, 0.12]], 10, null, x, yTop - drop - 0.12, z)); bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.04], [0.11, 0.16], [0.001, 0.24]], 10, null, x, yTop - drop - 0.28, z));
  if (light) lights.push({ at: [x, yTop - drop - 0.2, z], color: '#ffc27a', intensity, distance: 9 });
}
/** A wall shelf of jars along the back wall of a frame. */
function shelfJars(f, bag, rand, u0, u1, y, v = 0.0) {
  f.B(bag, 'timber', u0, v, u1, v + 0.3, y, y + 0.05);
  for (let u = u0 + 0.2; u < u1 - 0.1; u += 0.34 + rand() * 0.1) { const [x, z] = f.P(u, v + 0.15); bag.add(['terracotta', 'pottery_dark', 'glaze_blue', 'glaze_green', 'terracotta'][Math.floor(rand() * 5)], lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.1], [0.07, 0.2], [0.05, 0.24], [0.06, 0.27], [0.001, 0.27]], 8, null, x, y + 0.05, z)); }
}

/**
 * Furnish a room: kind, rect (the room's clear floor), the side its door is on, the floor height, the ceiling height. `c` is the build context.
 * kinds: reception (maqʿad: divans, carpet, brazier, shelf), bedroom, store, kitchen, barracks, diwan, treasury, guard, stable, workshop.
 */
export function furnish(c, kind, r, door, y, ceil, rand, { light = true } = {}) {
  const { bag, col } = c, f = roomFrame(r, door), { L, W } = f;
  if (L < 2.4 || W < 2.4) return;
  const at = (u, v) => f.P(u, v), cen = at(L / 2, W / 2), hang = (u, v, int) => { const [x, z] = at(u, v); lamp(c, x, z, y + ceil, 0.9, light, int); };
  if (kind === 'reception') {
    rug(bag, cen[0], cen[1], door[1] === 'x' ? W - 1.6 : L - 1.6, door[1] === 'x' ? L - 1.6 : W - 1.6, y + 0.01, cl[Math.floor(rand() * 2)], 'cloth_indigo', 'cloth_ochre');
    f.B(bag, 'timber', 0.1, 0.05, L - 0.1, 0.9, y, y + 0.28); f.B(bag, 'cloth_maroon', 0.1, 0.05, L - 0.1, 0.9, y + 0.28, y + 0.36); f.K(col, 0.1, 0.05, L - 0.1, 0.9, y, y + 0.4);
    for (let u = 0.6; u < L - 0.6; u += 0.9) { const [x, z] = at(u, 0.5); bag.add(cl[Math.floor(rand() * cl.length)], box(x - 0.3, y + 0.36, z - 0.3, x + 0.3, y + 0.62, z + 0.3)); }
    if (W > 4) { const [x, z] = at(L / 2, W / 2 + 0.3); tray(bag, col, x, z, y + 0.012, rand); }
    if (W > 5) { const [x, z] = at(L * 0.2, W * 0.55); brazier(bag, col, x, z, y); }
    shelfJars(f, bag, rand, L * 0.15, L * 0.85, y + 1.5, 0.0); shelfJars(f, bag, rand, L * 0.15, L * 0.85, y + 2.0, 0.0);
    hang(L / 2, W * 0.45, 5);
  } else if (kind === 'bedroom') {
    const n = L > 4.5 ? 2 : 1;
    for (let k = 0; k < n; k++) { const [x, z] = at(L * (k + 0.5) / n, 1.3); const a = door === '+x' || door === '-x'; if (a) { bag.add('reed_mat', box(x - 1.1, y, z - 0.6, x + 1.1, y + 0.015, z + 0.6)); bag.add('cloth_white', box(x - 1.0, y + 0.015, z - 0.5, x + 1.0, y + 0.14, z + 0.5)); bag.add(cl[k % cl.length], box(x - 1.02, y + 0.14, z - 0.52, x + 0.1, y + 0.2, z + 0.52)); bag.add('cloth_white', box(x - 0.95, y + 0.14, z - 0.3, x - 0.55, y + 0.24, z + 0.3)); col.rect([x - 1.1, z - 0.6, x + 1.1, z + 0.6], y, y + 0.22); } else bed(bag, col, x, z, y, rand); }
    { const [x, z] = at(L - 0.7, 0.4); chest(bag, col, x, z, y, 0.9, 0.5); }
    { const [x, z] = at(0.5, W - 0.6); zir(bag, col, x, z, y, 0.9); }
    shelfJars(f, bag, rand, L * 0.2, L * 0.7, y + 1.6, 0.0);
    rug(bag, cen[0], cen[1], 2.2, 1.6, y + 0.01, 'cloth_green', 'cloth_maroon', 'cloth_ochre');
    hang(L / 2, W * 0.5, 3);
  } else if (kind === 'store') {
    for (let u = 0.6; u < L - 0.5; u += 1.05) { const [x, z] = at(u, 0.55); pithos(bag, col, x, z, y, 0.9 + rand() * 0.2); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(0.8 + k * 0.9, W - 0.9); bag.add('sacking', lathe([[0.001, 0], [0.3, 0.05], [0.32, 0.4], [0.2, 0.62], [0.001, 0.66]], 9, null, x, y, z)); col.circle(x, z, 0.32, y, y + 0.65); }
    for (let k = 0; k < 3; k++) { const [x, z] = at(L - 0.6 - k * 0.5, W - 0.6); bag.add('wicker', lathe([[0.2, 0], [0.26, 0.3], [0.001, 0.3]], 9, null, x, y, z)); }
    f.B(bag, 'timber', L * 0.45, W - 0.3, L - 0.2, W - 0.05, y + 0.9, y + 0.95); f.B(bag, 'timber', L * 0.45, W - 0.3, L - 0.2, W - 0.05, y + 1.5, y + 1.55);
    shelfJars(f, bag, rand, L * 0.5, L - 0.3, y + 0.95, W - 0.3); shelfJars(f, bag, rand, L * 0.5, L - 0.3, y + 1.55, W - 0.3);
    hang(L / 2, W / 2, 2);
  } else if (kind === 'kitchen') {
    { const [x, z] = at(0.9, 0.9); bag.add('terracotta', lathe([[0.001, 0], [0.5, 0], [0.45, 0.4], [0.36, 0.8], [0.3, 1.0], [0.38, 1.02], [0.38, 1.06], [0.001, 1.06]], 12, null, x, y, z)); bag.add('flame', lathe([[0.001, 0.98], [0.28, 0.98], [0.001, 1.0]], 8, null, x, y, z)); col.circle(x, z, 0.5, y, y + 1.06); }
    { const [x, z] = at(L * 0.55, 0.6); for (let k = 0; k < 3; k++) { const a = k * 2.1; bag.add('iron', box(x + Math.cos(a) * 0.3 - 0.02, y, z + Math.sin(a) * 0.3 - 0.02, x + Math.cos(a) * 0.3 + 0.02, y + 0.5, z + Math.sin(a) * 0.3 + 0.02)); } bag.add('bronze', lathe([[0.001, 0.4], [0.3, 0.45], [0.42, 0.7], [0.4, 0.82], [0.001, 0.82]], 12, null, x, y, z)); bag.add('flame', lathe([[0.001, 0.02], [0.22, 0.02], [0.001, 0.2]], 8, null, x, y, z)); col.circle(x, z, 0.42, y, y + 0.82); }
    f.B(bag, 'bark_pine', L - 1.6, 0.1, L - 0.2, 0.9, y, y + 0.9); f.K(col, L - 1.6, 0.1, L - 0.2, 0.9, y, y + 0.9);
    f.B(bag, 'cedar', 0.2, W - 1.0, L * 0.5, W - 0.4, y + 0.82, y + 0.88); f.B(bag, 'timber', 0.3, W - 0.95, 0.4, W - 0.45, y, y + 0.82); f.B(bag, 'timber', L * 0.5 - 0.3, W - 0.95, L * 0.5 - 0.2, W - 0.45, y, y + 0.82); f.K(col, 0.2, W - 1.0, L * 0.5, W - 0.4, y, y + 0.9);
    { const [x, z] = at(L * 0.8, W - 0.7); zir(bag, col, x, z, y, 1); }
    shelfJars(f, bag, rand, L * 0.3, L * 0.9, y + 1.7, 0.0);
    hang(L / 2, W / 2, 2);
  } else if (kind === 'barracks') {
    for (let k = 0; k < Math.floor(L / 1.6); k++) { const [x, z] = at(0.9 + k * 1.6, 0.5); const a = door === '+x' || door === '-x'; bag.add('cedar', box(x - 0.1, y, z - 0.1, x + 0.1, y + 1.2, z + 0.1)); void a; }
    f.B(bag, 'timber', 0.2, 0.1, L - 0.2, 0.3, y + 0.9, y + 0.95); f.B(bag, 'timber', 0.2, 0.1, L - 0.2, 0.3, y + 1.6, y + 1.65);
    for (let k = 0; k < Math.floor((L - 0.6) / 0.5); k++) { const [x, z] = at(0.5 + k * 0.5, 0.2); bag.add('iron', box(x - 0.012, y + 0.95, z - 0.012, x + 0.012, y + 2.4, z + 0.012)); bag.add('iron', box(x - 0.03, y + 2.4, z - 0.03, x + 0.03, y + 2.55, z + 0.03)); }
    for (let k = 0; k < 3; k++) { const [x, z] = at(L * (0.2 + 0.3 * k), 1.4); for (let j = 0; j < 3; j++) bag.add(['hide_brown', 'cloth_black', 'hide_black'][j], lathe([[0.001, 0], [0.34, 0], [0.34, 0.03], [0.001, 0.08]], 10, null, x, y + j * 0.04, z)); }
    for (let k = 0; k < 2; k++) { const [x, z] = at(L * (0.3 + 0.4 * k), W * 0.6); bed(bag, col, x, z, y, rand); }
    { const [x, z] = at(L - 0.8, W - 0.8); bag.add('cedar', box(x - 0.8, y + 0.4, z - 0.3, x + 0.8, y + 0.45, z + 0.3)); bag.add('cedar', box(x - 0.8, y, z - 0.3, x - 0.7, y + 0.4, z + 0.3)); bag.add('cedar', box(x + 0.7, y, z - 0.3, x + 0.8, y + 0.4, z + 0.3)); col.rect([x - 0.8, z - 0.3, x + 0.8, z + 0.3], y, y + 0.45); }
    hang(L / 2, W / 2, 3);
  } else if (kind === 'diwan') {
    for (let k = 0; k < Math.max(1, Math.floor(L / 3.2)); k++) { const [x, z] = at(1.6 + k * 3.2, W * 0.55); const a = door === '+x' || door === '-x'; if (!a) desk(bag, col, rand, x, z, y, 2.2, 0.9); else { bag.add('cedar', box(x - 0.5, y + 0.42, z - 1.1, x + 0.5, y + 0.48, z + 1.1)); col.rect([x - 0.5, z - 1.1, x + 0.5, z + 1.1], y, y + 0.5); bag.add('plaster_white', box(x - 0.1, y + 0.48, z - 0.3, x + 0.2, y + 0.52, z + 0.1)); } }
    for (let k = 0; k < Math.floor((L - 0.6) / 1.8); k++) { const [x, z] = at(0.9 + k * 1.8, 0.3); if (door === '+z') bookcase(bag, col, rand, x, z, y, 1.7, 1); else if (door === '-z') bookcase(bag, col, rand, x, z, y, 1.7, -1); else { bag.add('cedar', box(x - 0.3, y, z - 0.85, x + 0.3, y + 2.0, z + 0.85)); } }
    rug(bag, cen[0], cen[1], Math.min(L - 1.4, 5), Math.min(W - 1.4, 3), y + 0.01, 'cloth_indigo', 'cloth_maroon', 'cloth_ochre');
    { const [x, z] = at(L - 0.6, W - 0.6); chest(bag, col, x, z, y); }
    hang(L / 2, W / 2, 4);
  } else if (kind === 'treasury') {
    for (let k = 0; k < Math.floor(L / 1.3); k++) { const [x, z] = at(0.7 + k * 1.3, 0.4); chest(bag, col, x, z, y, 1.0, 0.55, 0.62); if (k % 2 === 0) chest(bag, col, x, z, y + 0.68, 0.8, 0.45, 0.45); }
    { const [x, z] = at(L / 2, W * 0.6); bag.add('cedar', box(x - 0.6, y + 0.4, z - 0.4, x + 0.6, y + 0.46, z + 0.4)); bag.add('cedar', box(x - 0.55, y, z - 0.35, x - 0.45, y + 0.4, z + 0.35)); bag.add('cedar', box(x + 0.45, y, z - 0.35, x + 0.55, y + 0.4, z + 0.35)); bag.add('bronze', box(x - 0.2, y + 0.46, z - 0.01, x + 0.2, y + 0.48, z + 0.01)); bag.add('bronze', box(x - 0.01, y + 0.46, z - 0.01, x + 0.01, y + 0.82, z + 0.01)); for (let k = 0; k < 3; k++) bag.add('gilt_bronze', lathe([[0.1, 0], [0.1, 0.02], [0.001, 0.02]], 8, null, x - 0.4 + k * 0.4, y + 0.46, z - 0.25)); col.rect([x - 0.6, z - 0.4, x + 0.6, z + 0.4], y, y + 0.5); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(L - 0.7, W - 0.5 - k * 0.0); void x; void z; }
    hang(L / 2, W / 2, 3);
  } else if (kind === 'guard') {
    f.B(bag, 'timber', 0.1, 0.1, L - 0.1, 0.6, y, y + 0.4); f.K(col, 0.1, 0.1, L - 0.1, 0.6, y, y + 0.4);
    for (let u = 0.6; u < L - 0.5; u += 1.1) { const [x, z] = at(u, 0.35); bag.add(cl[Math.floor(rand() * cl.length)], box(x - 0.35, y + 0.4, z - 0.2, x + 0.35, y + 0.55, z + 0.2)); }
    { const [x, z] = at(L * 0.5, W * 0.6); tray(bag, col, x, z, y, rand); const [bx, bz] = at(L * 0.5 - 1.2, W * 0.6); brazier(bag, col, bx, bz, y); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(0.4 + k * 0.4, 0.8); bag.add('iron', box(x - 0.012, y, z - 0.012, x + 0.012, y + 2.1, z + 0.012)); }
    hang(L / 2, W / 2, 3);
  } else if (kind === 'stable') {
    for (let u = 1.2; u < L - 0.6; u += 2.2) { const [x, z] = at(u, 0.4); const a = door === '+x' || door === '-x'; bag.add('timber', box(x - (a ? 0.35 : 0.9), y + 0.5, z - (a ? 0.9 : 0.35), x + (a ? 0.35 : 0.9), y + 0.9, z + (a ? 0.9 : 0.35))); bag.add('thatch', box(x - (a ? 0.3 : 0.85), y + 0.9, z - (a ? 0.85 : 0.3), x + (a ? 0.3 : 0.85), y + 1.05, z + (a ? 0.85 : 0.3))); col.rect([x - (a ? 0.35 : 0.9), z - (a ? 0.9 : 0.35), x + (a ? 0.35 : 0.9), z + (a ? 0.9 : 0.35)], y, y + 0.9); }
    for (let u = 2.3; u < L - 0.6; u += 2.2) { const [x, z] = at(u, W * 0.5); const a = door === '+x' || door === '-x'; bag.add('timber', box(x - (a ? 0.04 : 0.04), y, z - (a ? 1.3 : 0.04), x + (a ? 0.04 : 0.04), y + 1.5, z + (a ? 1.3 : 0.04))); }
    hang(L / 2, W / 2, 2);
  } else if (kind === 'bakery') {
    { const [x, z] = at(L * 0.25, 0.9); bag.add('terracotta', lathe([[0.001, 0], [0.7, 0], [0.62, 0.5], [0.5, 0.95], [0.42, 1.15], [0.55, 1.18], [0.55, 1.24], [0.001, 1.24]], 14, null, x, y, z)); bag.add('flame', lathe([[0.001, 1.12], [0.4, 1.12], [0.001, 1.14]], 8, null, x, y, z)); col.circle(x, z, 0.7, y, y + 1.24); }
    { const [x, z] = at(L * 0.62, 0.9); bag.add('terracotta', lathe([[0.001, 0], [0.7, 0], [0.62, 0.5], [0.5, 0.95], [0.42, 1.15], [0.55, 1.18], [0.55, 1.24], [0.001, 1.24]], 14, null, x, y, z)); bag.add('flame', lathe([[0.001, 1.12], [0.4, 1.12], [0.001, 1.14]], 8, null, x, y, z)); col.circle(x, z, 0.7, y, y + 1.24); }
    f.B(bag, 'bark_pine', L - 1.8, 0.1, L - 0.2, 1.0, y, y + 1.0); f.K(col, L - 1.8, 0.1, L - 0.2, 1.0, y, y + 1.0);
    f.B(bag, 'cedar', 0.3, W - 1.4, L * 0.55, W - 0.5, y + 0.84, y + 0.9); f.B(bag, 'timber', 0.4, W - 1.35, 0.5, W - 0.55, y, y + 0.84); f.B(bag, 'timber', L * 0.55 - 0.3, W - 1.35, L * 0.55 - 0.2, W - 0.55, y, y + 0.84); f.K(col, 0.3, W - 1.4, L * 0.55, W - 0.5, y, y + 0.9);
    for (let k = 0; k < 8; k++) { const [x, z] = at(0.6 + k * 0.5, W - 0.95); bag.add('plaster', lathe([[0.001, 0], [0.18, 0], [0.2, 0.035], [0.001, 0.05]], 10, null, x, y + 0.9, z)); }
    for (let k = 0; k < 3; k++) { f.B(bag, 'timber', L * 0.62, 2.2 + k * 0.5, L - 0.2, 2.5 + k * 0.5, y + 0.6 + k * 0.5, y + 0.64 + k * 0.5); }
    for (let k = 0; k < 9; k++) { const [x, z] = at(L * 0.62 + 0.3 + (k % 3) * 0.7, 2.35 + Math.floor(k / 3) * 0.5); bag.add('plaster', lathe([[0.001, 0], [0.17, 0], [0.19, 0.03], [0.001, 0.05]], 10, null, x, y + 0.64 + Math.floor(k / 3) * 0.5, z)); }
    { const [x, z] = at(L * 0.45, 0.5); zir(bag, col, x, z, y, 1); }
    hang(L / 2, W / 2, 3);
  } else if (kind === 'perfumer') {
    f.B(bag, 'cedar', 0.2, 0.8, L - 0.2, 1.4, y + 0.84, y + 0.9); f.K(col, 0.2, 0.8, L - 0.2, 1.4, y, y + 0.9); f.B(bag, 'timber', 0.3, 0.9, 0.4, 1.3, y, y + 0.84); f.B(bag, 'timber', L - 0.4, 0.9, L - 0.3, 1.3, y, y + 0.84);
    for (let k = 0; k < 4; k++) { f.B(bag, 'timber', 0.2, 0.0, L - 0.2, 0.35, y + 0.4 + k * 0.5, y + 0.44 + k * 0.5); }
    for (let k = 0; k < 4; k++) for (let i = 0; i < Math.floor((L - 0.8) / 0.3); i++) { const [x, z] = at(0.45 + i * 0.3, 0.18); bag.add(['lamp_glass', 'glaze_blue', 'glaze_green', 'terracotta'][(i + k) % 4], lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.08], [0.04, 0.15], [0.03, 0.2], [0.04, 0.22], [0.001, 0.22]], 8, null, x, y + 0.44 + k * 0.5, z)); }
    for (let i = 0; i < 5; i++) { const [x, z] = at(0.6 + i * 0.5, 1.15); bag.add(['lamp_glass', 'glaze_white', 'glaze_blue'][i % 3], lathe([[0.001, 0], [0.06, 0.01], [0.08, 0.07], [0.03, 0.14], [0.001, 0.15]], 8, null, x, y + 0.9, z)); }
    { const [x, z] = at(L * 0.6, 1.1); bag.add('bronze', box(x - 0.2, y + 0.9, z - 0.01, x + 0.2, y + 0.92, z + 0.01)); bag.add('bronze', box(x - 0.01, y + 0.9, z - 0.01, x + 0.01, y + 1.3, z + 0.01)); }
    rug(bag, cen[0], cen[1] + 0.3, 2.4, 1.4, y + 0.01, 'cloth_green', 'cloth_maroon', 'cloth_ochre');
    { const [x, z] = at(L - 0.8, W - 0.6); brazier(bag, col, x, z, y); }
    hang(L / 2, W / 2, 4);
  } else if (kind === 'coppersmith') {
    { const [x, z] = at(L * 0.3, 1.0); bag.add('limestone', box(x - 0.6, y, z - 0.6, x + 0.6, y + 0.8, z + 0.6)); bag.add('flame', box(x - 0.4, y + 0.8, z - 0.4, x + 0.4, y + 0.84, z + 0.4)); bag.add('iron', box(x - 0.7, y + 0.8, z - 0.1, x - 0.4, y + 0.95, z + 0.1)); col.rect([x - 0.6, z - 0.6, x + 0.6, z + 0.6], y, y + 0.8); }
    { const [x, z] = at(L * 0.65, 1.6); bag.add('bark_pine', lathe([[0.2, 0], [0.18, 0.45], [0.001, 0.45]], 8, null, x, y, z)); bag.add('iron', box(x - 0.2, y + 0.45, z - 0.1, x + 0.2, y + 0.55, z + 0.1)); bag.add('iron', box(x - 0.05, y + 0.55, z - 0.05, x + 0.05, y + 0.6, z + 0.05)); col.circle(x, z, 0.22, y, y + 0.55); }
    f.B(bag, 'cedar', L * 0.1, W - 1.0, L * 0.5, W - 0.4, y + 0.84, y + 0.9); f.K(col, L * 0.1, W - 1.0, L * 0.5, W - 0.4, y, y + 0.9);
    for (let k = 0; k < 6; k++) { const [x, z] = at(0.5 + k * (L - 1) / 5, 0.3); const r = 0.16 + (k % 3) * 0.05; bag.add('bronze', lathe([[0.001, 0], [r * 0.6, 0.01], [r, r * 0.9], [r * 1.05, r * 1.3]], 10, null, x, y + 1.7, z)); bag.add('iron', box(x - 0.008, y + 1.7 + r * 1.3, z - 0.008, x + 0.008, y + 2.4, z + 0.008)); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(L - 0.7, 0.8 + k * 0.7); bag.add('bronze', lathe([[0.001, 0], [0.2, 0.01], [0.32, 0.25], [0.3, 0.45], [0.36, 0.48]], 10, null, x, y, z)); }
    hang(L / 2, W / 2, 3);
  } else if (kind === 'bath') {
    f.B(bag, 'marble', 0.0, 0.0, L, 0.6, y, y + 0.46); f.K(col, 0.0, 0.0, L, 0.6, y, y + 0.46);
    { const [x, z] = at(L / 2, W * 0.55); bag.add('marble', box(x - 1.6, y, z - 1.6, x + 1.6, y + 0.5, z + 1.6)); bag.add('marble_dark', box(x - 1.2, y + 0.5, z - 1.2, x + 1.2, y + 0.54, z + 1.2)); col.rect([x - 1.6, z - 1.6, x + 1.6, z + 1.6], y, y + 0.54); }
    for (let k = 0; k < 3; k++) { const [x, z] = at(1.0 + k * (L - 2) / 2, 0.8); bag.add('marble', lathe([[0.001, 0.46], [0.3, 0.5], [0.34, 0.8], [0.001, 0.8]], 10, null, x, y, z)); bag.add('water', lathe([[0.001, 0.78], [0.3, 0.78], [0.001, 0.79]], 8, null, x, y, z)); bag.add('bronze', box(x - 0.18, y + 0.8, z - 0.05, x + 0.18, y + 0.88, z + 0.05)); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(0.8 + k * 1.6, W - 0.7); bag.add('bronze', lathe([[0.001, 0], [0.16, 0.01], [0.2, 0.18], [0.001, 0.2]], 8, null, x, y, z)); }
    hang(L / 2, W / 2, 1.5);
  } else {   // workshop: a bench with tools, a heap of goods
    f.B(bag, 'cedar', 0.2, 0.3, L - 0.8, 1.0, y + 0.84, y + 0.9); f.K(col, 0.2, 0.3, L - 0.8, 1.0, y, y + 0.9); f.B(bag, 'timber', 0.3, 0.4, 0.4, 0.9, y, y + 0.84); f.B(bag, 'timber', L - 1.2, 0.4, L - 1.1, 0.9, y, y + 0.84);
    { const [x, z] = at(L * 0.5, 0.65); bag.add('iron', box(x - 0.2, y + 0.9, z - 0.1, x + 0.2, y + 0.98, z + 0.1)); }
    shelfJars(f, bag, rand, 0.5, L - 0.5, y + 1.6, 0.0);
    hang(L / 2, W / 2, 3);
  }
}

// ── the front of a house at eye level ──────────────────────────────────────

/**
 * Dress the street front of a lot, in the house's local frame (the front at z = hd, wall thickness T): the door leaf standing open, the lintel
 * beam and its posts, a brick bench (mastaba) at the door, a grilled window, the ends of the rafters under the parapet, patches of fallen plaster,
 * a clay spout, the damp course of bitumen at the foot. `ox` the doorway's offset, `rich` more of it.
 */
export function dressFront(c, { hw, hd, T, y, H, ox, mat, top, rand, storeys }) {
  const { bag } = c, zf = hd, patchM = mat === 'brick_baked' || mat === 'brick_buff' ? 'mud_plaster' : 'brick_buff';
  const dx = ox, w = 1.5;
  // the doorway: a timber frame (lintel at 2.7 m under the arch's crown reads as a beam across the leaf's head), the leaf open against the jamb
  bag.add('cedar', box(dx - w / 2 - 0.1, y, zf + 0.01, dx - w / 2 - 0.02, y + 2.15, zf + 0.09)); bag.add('cedar', box(dx + w / 2 + 0.02, y, zf + 0.01, dx + w / 2 + 0.1, y + 2.15, zf + 0.09));
  bag.add('palm_trunk', box(dx - w / 2 - 0.16, y + 2.15, zf + 0.0, dx + w / 2 + 0.16, y + 2.33, zf + 0.12));
  const lf = rand() < 0.5 ? 1 : -1, jx = dx + lf * (w / 2 - 0.03);
  bag.add('wood_dark', box(jx - 0.03, y + 0.05, zf - T + 0.02, jx + 0.03, y + 2.1, zf - T + 0.02 + w * 0.5));
  for (const hy of [0.4, 1.0, 1.6]) bag.add('iron', box(jx - 0.04, y + hy, zf - T + 0.02, jx + 0.04, y + hy + 0.05, zf - T + 0.02 + w * 0.5));
  bag.add('iron', box(jx - 0.04, y + 1.05, zf - T + 0.02 + w * 0.5 - 0.1, jx + 0.04, y + 1.12, zf - T + 0.02 + w * 0.5)); // the knocker
  // the mastaba: a brick seat 0.42 high, 0.42 deep, 1.8 long, beside the door
  const bs = -lf * (w / 2 + 1.2);
  if (hw - Math.abs(dx + bs) > 1.2 && rand() < 0.7) { bag.add('brick_baked', box(dx + bs - 0.9, y, zf, dx + bs + 0.9, y + 0.42, zf + 0.4)); c.col.rect([dx + bs - 0.9, zf, dx + bs + 0.9, zf + 0.4], y, y + 0.42); bag.add('reed_mat', box(dx + bs - 0.6, y + 0.42, zf + 0.04, dx + bs + 0.2, y + 0.435, zf + 0.36)); }
  // a grilled window on the front: high in a one-storey house, upstairs in a two-storey one, with a timber sill and a lattice
  const wy = y + (storeys === 2 ? 4.9 : 2.5), wx = (rand() < 0.5 ? -1 : 1) * Math.min(hw * 0.5, 3.4) * (rand() < 0.5 ? 1 : 0.4);
  if (Math.abs(wx - dx) > 1.6) {
    bag.add('opening', box(wx - 0.3, wy, zf - 0.02, wx + 0.3, wy + 0.75, zf + 0.04)); bag.add('lattice', box(wx - 0.3, wy, zf + 0.04, wx + 0.3, wy + 0.75, zf + 0.06));
    bag.add('cedar', box(wx - 0.4, wy - 0.07, zf, wx + 0.4, wy, zf + 0.22)); bag.add('cedar', box(wx - 0.36, wy + 0.75, zf, wx + 0.36, wy + 0.82, zf + 0.1));
    if (storeys === 2 && rand() < 0.5) { bag.add('cedar', box(wx - 0.45, wy - 0.75, zf + 0.02, wx - 0.4, wy - 0.07, zf + 0.04)); bag.add('timber', box(wx - 0.5, wy + 0.82, zf, wx + 0.5, wy + 0.86, zf + 0.5)); bag.add('reed_mat', box(wx - 0.5, wy + 0.86, zf, wx + 0.5, wy + 0.9, zf + 0.5)); }
  }
  // the ends of the palm-trunk rafters under the parapet, every 0.75 m, and the drain spout at a corner
  for (let x = -hw + 0.9; x < hw - 0.6; x += 0.75) bag.add('palm_trunk', box(x - 0.07, y + H - 0.32, zf, x + 0.07, y + H - 0.18, zf + 0.22));
  const sx = (rand() < 0.5 ? -1 : 1) * (hw - 1.4);
  bag.add('terracotta', box(sx - 0.07, y + H - 0.42, zf, sx + 0.07, y + H - 0.3, zf + 0.5)); bag.add('plaster_damp', box(sx - 0.2, y + 0.0, zf, sx + 0.2, y + H - 0.4, zf + 0.012));
  // the damp course: a band of bitumen and a darker foot of salted brick; patches where the plaster has fallen and the brick shows
  bag.add('bitumen', box(-hw, y, zf, hw, y + 0.35, zf + 0.015));
  for (let k = 0; k < 3 + Math.floor(rand() * 3); k++) { const pw = 0.5 + rand() * 1.4, ph = 0.4 + rand() * 0.9, px = -hw + 0.8 + rand() * (2 * hw - 1.6 - pw), py = y + 0.5 + rand() * (H - 1.8); if (Math.abs(px + pw / 2 - dx) < w / 2 + 0.5 && py < y + 2.6) continue; bag.add(patchM, box(px, py, zf, px + pw, py + ph, zf + 0.02)); }
  // the lintel course of baked brick over the door and the string course at the floor of the upper storey
  if (storeys === 2) bag.add('brick_baked', box(-hw, y + 3.5, zf, hw, y + 3.62, zf + 0.06));
  void top;
}

/**
 * Build a run of rooms (rects with the side their door is on, from palaceRooms-like lists): the court-side wall with a door and two grilled
 * windows, the party walls, a timber ceiling, a roof slab, a floor; each furnished by its kind. Local frame. `RH` roof height, `TOP` the
 * court wall's height (a parapet above the roof), `ceil` the ceiling's.
 */
export function buildRooms(c, rooms, { y, RH = 6.4, TOP = 8.0, ceil = 4.8, floor = 'marble_floor', rand, mat = 'brick_buff', lightEvery = 2, back = false }) {
  const { bag } = c;
  for (const rm of rooms) {
    const [x0, z0, x1, z1] = rm.rect, door = rm.door, ax = door === '+x' || door === '-x', rl = ax ? z1 - z0 : x1 - x0;
    const xw = door === '+x' ? x1 - 0.4 : door === '-x' ? x0 + 0.4 : null, zw = door === '+z' ? z1 - 0.4 : door === '-z' ? z0 + 0.4 : null;
    const dd = rl / 2, win = (at) => ({ at, w: 0.9, h: 1.3, y0: y + 1.7, flat: true });
    const ops = [{ at: dd, w: rm.doorW ?? 1.9, h: rm.doorH ?? 3.5 }, ...(rl > 5.4 ? [win(dd - 2.2), win(dd + 2.2)] : [])];
    if (ax) {
      wallRun(c, { a: [xw, z0], b: [xw, z1], th: 0.8, y0: y, y1: y + TOP, mat, ops });
      for (const zz of [z0, z1]) if ((zz === z0 && rm.k >= 0) || (zz === z1 && rm.k === rm.n - 1)) wallRun(c, { a: [x0, zz], b: [door === '+x' ? x1 - 0.8 : x1, zz], th: 0.6, y0: y, y1: y + RH, mat });
      for (const at of rl > 5.4 ? [dd - 2.2, dd + 2.2] : []) bag.add('lattice', box(xw - 0.05, y + 1.7, z0 + at - 0.45, xw + 0.05, y + 3.0, z0 + at + 0.45));
    } else {
      wallRun(c, { a: [x0, zw], b: [x1, zw], th: 0.8, y0: y, y1: y + TOP, mat, ops });
      for (const xx of [x0, x1]) if ((xx === x0 && rm.k >= 0) || (xx === x1 && rm.k === rm.n - 1)) wallRun(c, { a: [xx, door === '+z' ? z0 : z0 + 0.8], b: [xx, door === '+z' ? zw - 0.4 : z1], th: 0.6, y0: y, y1: y + RH, mat });
      for (const at of rl > 5.4 ? [dd - 2.2, dd + 2.2] : []) bag.add('lattice', box(x0 + at - 0.45, y + 1.7, zw - 0.05, x0 + at + 0.45, y + 3.0, zw + 0.05));
    }
    if (back) { if (door === '+z') wallRun(c, { a: [x0, z0 + 0.3], b: [x1, z0 + 0.3], th: 0.6, y0: y, y1: y + RH, mat }); else if (door === '-z') wallRun(c, { a: [x0, z1 - 0.3], b: [x1, z1 - 0.3], th: 0.6, y0: y, y1: y + RH, mat }); else if (door === '+x') wallRun(c, { a: [x0 + 0.3, z0], b: [x0 + 0.3, z1], th: 0.6, y0: y, y1: y + RH, mat }); else wallRun(c, { a: [x1 - 0.3, z0], b: [x1 - 0.3, z1], th: 0.6, y0: y, y1: y + RH, mat }); }
    bag.add('timber', box(x0, y + ceil, z0, x1, y + ceil + 0.16, z1)); bag.add('mud_plaster', box(x0, y + RH, z0, x1, y + RH + 0.14, z1)); bag.add(floor, box(x0, y - 0.2, z0, x1, y + 0.03, z1));
    bag.add('plaster_white', ax ? box(xw - 0.45, y + TOP - 0.3, z0, xw + 0.45, y + TOP, z1) : box(x0, y + TOP - 0.3, zw - 0.45, x1, y + TOP, zw + 0.45));
    const clear = door === '+x' ? [x0 + 0.1, z0 + 0.3, x1 - 0.8, z1 - 0.3] : door === '-x' ? [x0 + 0.8, z0 + 0.3, x1 - 0.1, z1 - 0.3] : door === '+z' ? [x0 + 0.3, z0 + 0.1, x1 - 0.3, z1 - 0.8] : [x0 + 0.3, z0 + 0.8, x1 - 0.3, z1 - 0.1];
    furnish(c, rm.kind, clear, door, y + 0.03, ceil, rand, { light: rm.k % lightEvery === 0 });
  }
}
