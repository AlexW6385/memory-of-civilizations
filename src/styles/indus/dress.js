// Eye-level dressing and furnishing of the Lower Town's houses (docs/settlements/mohenjo-daro.md §5, §9, §11): salt crust at the foot of the
// baked brick, patched mud plaster, rafter ends under the parapet, door leaves and frames, benches and mat shades at the doors, lattice windows,
// roof clutter (shades, cots, grain mats, jars), and the rooms furnished by use (sleeping, store, kitchen, bath, work). Frame: u along the lane,
// v from the lane into the lot (kit.js Fr). All small pieces: no collision, fine detail drawn only near.
import { lathe } from './kit.js';

const JAR = (s) => [[0.07 * s, 0], [0.2 * s, 0.12 * s], [0.24 * s, 0.3 * s], [0.19 * s, 0.5 * s], [0.1 * s, 0.6 * s], [0.12 * s, 0.66 * s], [0.001, 0.66 * s]];
export const jar = (F, mat, u, v, s = 1, y = 0) => F.lathe(mat, JAR(s), u, y, v, 8);
const dome = (F, mat, u, v, r, h, y = 0) => F.lathe(mat, [[r, 0], [r * 0.95, h * 0.5], [r * 0.6, h * 0.9], [0.001, h]], u, y, v, 8);

/** A face's frame: s along it, d out of it (≥ 0), mapped to (u0, v0, u1, v1). */
export const faceMap = (F, face) => {
  const W = F.W, D = F.D;
  if (face === 'front') return (s0, d0, s1, d1) => [s0, -d0, s1, -d1];
  if (face === 'back') return (s0, d0, s1, d1) => [s0, D + d0, s1, D + d1];
  if (face === 'endA') return (s0, d0, s1, d1) => [-d0, s0, -d1, s1];
  return (s0, d0, s1, d1) => [W + d0, s0, W + d1, s1];
};

/** The weathering and the roofline of a blank outer wall of length `len`: baked brick to `lowH`, mud brick above to `H`. */
export function dressWall(F, rand, face, len, H, lowH, o = {}) {
  const gaps = o.gaps ?? (o.gap ? [o.gap] : []), clear = (s0, s1) => gaps.every((g) => s1 < g[0] || s0 > g[1]);
  const m = faceMap(F, face), b = (mat, s0, y0, d0, s1, y1, d1) => { const r = m(s0, d0, s1, d1); F.b(mat, r[0], y0, r[1], r[2], y1, r[3], false); };
  // the string course where the baked brick gives way to mud brick, and the rafter ends under the parapet
  if (!o.plain) {
    b('brick', 0, lowH - 0.12, 0, len, lowH + 0.04, 0.07);
    for (let s = 0.5 + rand() * 0.4; s < len - 0.3; s += 0.85 + rand() * 0.15) b('timber', s - 0.07, H - 0.42, 0, s + 0.07, H - 0.28, 0.3);
  }
  // the salt that rises in the baked brick: pale crust at the foot, in patches
  for (let s = 0.2; s < len - 0.8;) { const w = 0.7 + rand() * 2.2, h = 0.2 + rand() * 0.65; if (rand() < 0.62 && clear(s, s + w)) b('plaster_streak', s, 0, 0, Math.min(len - 0.1, s + w), h, 0.03); s += w + 0.3 + rand() * 1.4; }
  // mud plaster patches over the mud brick, brick showing where it has fallen
  for (let k = 0, n = H - lowH > 1.2 ? Math.round(len / 2.4) : 0; k < n; k++) {
    const s = 0.3 + rand() * (len - 2.6), w = 0.7 + rand() * 1.8, y = lowH + 0.1 + rand() * (H - lowH - 0.9), h = 0.4 + rand() * 0.8;
    const pm = rand() < 0.7; b(pm ? 'mud_plaster' : 'earth_wall', s, y, 0, s + w, Math.min(H - 0.45, y + h), pm ? 0.05 : 0.07);
    if (rand() < 0.25) b('mudbrick', s + w * 0.25, y + h * 0.2, 0, s + w * 0.6, y + h * 0.7, 0.085);
  }
  for (let k = 0, n = Math.round(len / 5); k < n; k++) { const s = 0.5 + rand() * (len - 1), w = 0.4 + rand() * 0.6; if (clear(s, s + w)) b('brick_baked', s, 0.6 + rand() * 1.1, 0, s + w, 1.0 + rand() * 1.2, 0.04); }   // baked brick spalled and patched
  // rain streaks under the parapet's spouts and a few crack lines
  for (let k = 0, n = o.plain ? 0 : Math.round(len / 4); k < n; k++) { const s = 0.4 + rand() * (len - 0.8); b('plaster_damp', s, H - 1.5 - rand(), 0, s + 0.18 + rand() * 0.12, H - 0.42, 0.095); }
  for (let k = 0, n = Math.round(len / 6); k < n; k++) { const s = 0.5 + rand() * (len - 1); if (clear(s, s + 0.03)) b('wood_dark', s, 0.5 + rand() * 1.5, 0, s + 0.03, 1.4 + rand() * 1.6, 0.06); }
  // a square vent of two brick slots high up, now and then
  if (!o.plain && rand() < 0.5) { const s = 0.8 + rand() * (len - 1.6), y = H - 0.95; b('brick', s, y, 0, s + 0.5, y + 0.3, 0.07); b('wood_dark', s + 0.08, y + 0.08, 0, s + 0.42, y + 0.22, 0.09); }
  // washing on a pole, or a heap of dung cakes drying against the wall
  if (o.life !== false && !o.plain) {
    if (rand() < 0.2) { const s = 1 + rand() * (len - 3.5); if (!clear(s, s + 2.4)) return; b('timber', s, 2.3, 0.22, s + 2.4, 2.38, 0.3); for (let k = 0; k < 3; k++) b(['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo'][Math.floor(rand() * 4)], s + 0.2 + k * 0.7, 1.3, 0.24, s + 0.75 + k * 0.7, 2.3, 0.27); }
    else if (rand() < 0.3) { const s = 0.8 + rand() * (len - 2.6); if (!clear(s, s + 1.6)) return; for (let i = 0; i < 4; i++) for (let j = 0; j < 4 - i; j++) b('hide_tan', s + i * 0.12 + j * 0.28, 0.02 + i * 0.1, 0.02, s + i * 0.12 + j * 0.28 + 0.24, 0.1 + i * 0.1, 0.3); }
  }
}

/** The door and what is beside it: the frame, the leaf standing ajar, the step, a bench, a mat shade, a lamp niche, lattice windows. */
export function dressDoor(F, rand, du, W, H, T) {
  F.b('timber', du - 0.62, 0, -0.08, du - 0.5, 2.15, T + 0.04, false); F.b('timber', du + 0.5, 0, -0.08, du + 0.62, 2.15, T + 0.04, false);
  F.b('timber', du - 0.62, 2.1, -0.1, du + 0.62, 2.28, T + 0.04, false);
  const open = rand() < 0.55;                                         // the leaf standing ajar inside, or shut in the opening
  if (open) F.b('wood_dark', du - 0.48, 0, T - 0.1, du - 0.4 + 0.4, 2.03, T - 0.02, false); else F.b('wood_dark', du - 0.5, 0, T * 0.35, du + 0.5, 2.05, T * 0.35 + 0.08, false);
  F.b('bronze', du + 0.38, 0.95, -0.02, du + 0.44, 1.05, 0.04, false);
  F.b('brick', du - 0.8, 0, -0.6, du + 0.8, 0.07, -0.3, false); F.b('brick_buff', du - 0.7, 0.07, -0.5, du + 0.7, 0.14, -0.3, false);
  const side = du < W / 2 ? 1 : -1;
  if (rand() < 0.45) {                                                // the sitting bench of mud brick against the wall beside the door
    const b0 = du + side * 1.0, b1 = b0 + side * Math.min(2.4, side > 0 ? W - b0 - 0.3 : b0 - 0.3) * 1;
    if (Math.abs(b1 - b0) > 1.2) { F.b('mudbrick', Math.min(b0, b1), 0, -0.55, Math.max(b0, b1), 0.42, 0, false); F.b('mud_plaster', Math.min(b0, b1) - 0.02, 0.42, -0.58, Math.max(b0, b1) + 0.02, 0.47, 0.0, false); if (rand() < 0.5) F.b('reed_mat', Math.min(b0, b1) + 0.1, 0.47, -0.5, Math.max(b0, b1) - 0.1, 0.5, -0.05, false); }
  }
  if (rand() < 0.4) {                                                 // a mat shade over the door on two posts, tied to the wall
    const a = du - 1.3, c = du + 1.3, y = 2.7;
    for (const u of [a, c]) F.b('timber', u - 0.05, 0, -1.25, u + 0.05, y, -1.15, false);
    for (let k = 0; k < 3; k++) F.b('timber', a - 0.1, y + 0.02, -1.3 + k * 0.6, c + 0.1, y + 0.08, -1.2 + k * 0.6, false);
    F.b('reed_mat', a - 0.15, y + 0.08, -1.35, c + 0.15, y + 0.13, 0.02, false);
  }
  if (rand() < 0.6) F.b('bitumen', du + side * 0.95, 1.3, -0.03, du + side * 1.15, 1.5, 0.05, false);   // the lamp niche, black with soot
  F.b('bitumen', du - 0.3, 2.28, -0.03, du + 0.3, 2.62, 0.03, false);                                     // soot over the door
  // the windows: lattice of vertical brick slats or timber bars, one or two, high
  const nw = rand() < 0.35 ? 0 : rand() < 0.5 ? 1 : 2;
  for (let k = 0; k < nw; k++) {
    const wu = side > 0 ? W * (0.55 + 0.3 * k) : W * (0.45 - 0.3 * k);
    if (wu < 1 || wu > W - 1 || Math.abs(wu - du) < 1.4) continue;
    F.b('timber', wu - 0.38, 2.38, -0.08, wu + 0.38, 2.46, 0.05, false); F.b('timber', wu - 0.38, 2.9, -0.08, wu + 0.38, 2.98, 0.05, false);
    F.b('wood_dark', wu - 0.3, 2.46, 0.05, wu + 0.3, 2.9, 0.2, false);
    for (let i = 0; i < 6; i++) F.b(rand() < 0.5 ? 'timber' : 'terracotta', wu - 0.3 + i * 0.12, 2.46, -0.06, wu - 0.26 + i * 0.12, 2.9, 0.0, false);
  }
}

/** The roof: what a house keeps up there in the heat. `rooms` are the back range's rectangles; roofs are at height H. */
export function dressRoof(F, rand, rooms, W, D, H, T) {
  const kinds = ['shade', 'cot', 'grain', 'jars', 'wood', 'pots'];
  const n = 1 + Math.floor(rand() * 3);
  for (let k = 0; k < n && rooms.length; k++) {
    const r = rooms[Math.floor(rand() * rooms.length)], u = r[0] + 0.8 + rand() * Math.max(0.1, r[2] - r[0] - 2.4), v = r[1] + 0.9 + rand() * Math.max(0.1, r[3] - r[1] - 2.2), kind = kinds[Math.floor(rand() * kinds.length)];
    if (kind === 'shade') {
      for (const [a, b] of [[0, 0], [1.8, 0], [0, 1.6], [1.8, 1.6]]) F.b('timber', u + a - 0.04, H, v + b - 0.04, u + a + 0.04, H + 1.7, v + b + 0.04, false);
      F.b('reed_mat', u - 0.2, H + 1.7, v - 0.2, u + 2.0, H + 1.78, v + 1.8, false);
    } else if (kind === 'cot') {
      for (const [a, b] of [[0, 0], [1.6, 0], [0, 0.8], [1.6, 0.8]]) F.b('timber', u + a - 0.03, H, v + b - 0.03, u + a + 0.03, H + 0.34, v + b + 0.03, false);
      F.b('timber', u - 0.05, H + 0.32, v - 0.05, u + 1.65, H + 0.37, v + 0.85, false); F.b('rope_fibre', u, H + 0.35, v, u + 1.6, H + 0.415, v + 0.8, false);
      if (rand() < 0.5) F.b(rand() < 0.5 ? 'cloth_white' : 'cloth_ochre', u + 0.2, H + 0.4, v + 0.1, u + 1.2, H + 0.46, v + 0.7, false);
    } else if (kind === 'grain') {
      F.b('reed_mat', u, H, v, u + 2.2, H + 0.03, v + 1.8, false);
      for (let i = 0; i < 3; i++) dome(F, i % 2 ? 'wicker' : 'sacking', u + 0.5 + i * 0.65, v + 0.6 + (i % 2) * 0.5, 0.42, 0.35, H + 0.03);
    } else if (kind === 'jars') {
      for (let i = 0; i < 4; i++) jar(F, i % 2 ? 'terracotta' : 'pottery_dark', u + (i % 2) * 0.55, v + Math.floor(i / 2) * 0.55, 1.5, H);
    } else if (kind === 'wood') {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3 - (i > 1 ? 1 : 0); j++) F.b('timber', u + j * 0.17, H + i * 0.14, v, u + j * 0.17 + 0.14, H + i * 0.14 + 0.12, v + 1.4, false);
      F.b('hide_tan', u + 0.5, H, v + 1.6, u + 1.3, H + 0.2, v + 2.0, false);
    } else {
      for (let i = 0; i < 3; i++) F.lathe('wicker', [[0.3, 0], [0.34, 0.2], [0.3, 0.35], [0.001, 0.35]], u + i * 0.8, H, v + (i % 2) * 0.5, 8);
    }
  }
}

/** A room's local frame: a along the door wall, b inward from it. door is 'v0' | 'u0' | 'u1'. */
function local(r, door) {
  const [u0, v0, u1, v1] = r;
  if (door === 'v0') return { A: u1 - u0, B: v1 - v0, pt: (a, b) => [u0 + a, v0 + b] };
  if (door === 'v1') return { A: u1 - u0, B: v1 - v0, pt: (a, b) => [u0 + a, v1 - b] };
  if (door === 'u1') return { A: v1 - v0, B: u1 - u0, pt: (a, b) => [u1 - b, v0 + a] };
  return { A: v1 - v0, B: u1 - u0, pt: (a, b) => [u0 + b, v0 + a] };
}
const K = (F, L, mat, a0, y0, b0, a1, y1, b1) => { const p = L.pt(a0, b0), q = L.pt(a1, b1); F.b(mat, p[0], y0, p[1], q[0], y1, q[1], false); };
const KL = (F, L, mat, prof, a, b, y = 0, seg = 8) => { const p = L.pt(a, b); F.lathe(mat, prof, p[0], y, p[1], seg); };

/** The rooms by use: 'sleep' | 'store' | 'kitchen' | 'bath' | 'work'. Items stay against the walls, the doorway's line stays clear. */
export function furnishRoom(F, r, door, kind, rand, lights, lit = false) {
  const L = local(r, door), { A, B } = L, m = A / 2;
  const k = (mat, a0, y0, b0, a1, y1, b1) => K(F, L, mat, a0, y0, b0, a1, y1, b1), jl = (mat, a, b, s, y = 0) => KL(F, L, mat, JAR(s), a, b, y);
  const wall = B - 0.5;
  if (kind === 'sleep') {
    const a = rand() < 0.5 ? 0.3 : A - 2.1;                                // the bed against a side wall, a rope net on a timber frame
    k('timber', a, 0.26, wall - 1.5, a + 1.8, 0.33, wall - 0.35); for (const [x, z] of [[0, 0], [1.7, 0], [0, 1.1], [1.7, 1.1]]) k('timber', a + x, 0, wall - 1.5 + z, a + x + 0.1, 0.26, wall - 1.4 + z);
    k('rope_fibre', a + 0.05, 0.325, wall - 1.45, a + 1.75, 0.36, wall - 0.4); k(rand() < 0.5 ? 'cloth_white' : 'cloth_ochre', a + 0.1, 0.36, wall - 1.4, a + 1.0, 0.43, wall - 0.5);
    k('reed_mat', a < 1 ? A - 1.9 : 0.4, 0, 0.8, a < 1 ? A - 0.4 : 1.9, 0.03, 2.2);
    jl('terracotta', m + (a < 1 ? 0.7 : -0.7), wall, 1.5); jl('pottery_dark', m + (a < 1 ? 1.1 : -1.1), wall - 0.2, 1.1);
    k('brick', A - 0.55, 0, 0.2, A - 0.3, 0.55, 0.45);                      // a niche shelf with a lamp
    KL(F, L, 'terracotta', [[0.001, 0], [0.07, 0.01], [0.08, 0.04], [0.001, 0.05]], A - 0.43, 0.32, 0.55);
  } else if (kind === 'store') {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) jl((i + j) % 2 ? 'terracotta' : 'pottery_dark', 0.5 + i * 0.75, wall - j * 0.8, 1.9 + (j % 2) * 0.3);
    for (let i = 0; i < 3; i++) KL(F, L, 'sacking', [[0.3, 0], [0.34, 0.25], [0.2, 0.42], [0.001, 0.45]], A - 0.5 - (i % 2) * 0.1, 0.6 + i * 0.6, 0);
    k('timber', 0.3, 0.9, wall + 0.05, A - 0.3, 0.97, wall + 0.4); for (let i = 0; i < 4; i++) jl('wicker', 0.7 + i * ((A - 1.6) / 3), wall + 0.2, 0.7, 0.97);   // a shelf on pegs
    for (let i = 0; i < 3; i++) KL(F, L, 'wicker', [[0.22, 0], [0.28, 0.2], [0.001, 0.2]], m - 0.5 + i * 0.5, B * 0.5, 0);
  } else if (kind === 'kitchen') {
    k('brick', 0.3, 0.02, wall - 1.2, 1.5, 0.28, wall - 0.3); k('bitumen', 0.5, 0.28, wall - 1.0, 1.3, 0.31, wall - 0.5);               // the hearth, black
    KL(F, L, 'pottery_dark', [[0.001, 0], [0.18, 0.04], [0.26, 0.2], [0.2, 0.32], [0.24, 0.32], [0.001, 0.3]], 0.9, wall - 0.75, 0.31, 10);
    k('granite_grey', A - 1.5, 0, wall - 0.8, A - 0.5, 0.22, wall - 0.2); k('granite_grey', A - 1.2, 0.22, wall - 0.65, A - 0.8, 0.32, wall - 0.35);    // the saddle quern
    jl('terracotta', A - 0.5, 1.0, 1.7); jl('pottery_dark', A - 0.5, 1.7, 1.3);
    for (let i = 0; i < 3; i++) k('timber', 1.8, i * 0.14, wall - 0.4, 2.3, i * 0.14 + 0.12, wall - 0.1);                       // firewood
    k('reed_mat', m - 0.6, 0, 1.2, m + 0.6, 0.03, 2.2); KL(F, L, 'wicker', [[0.24, 0], [0.3, 0.1], [0.001, 0.1]], m, 1.7, 0.03);
  } else if (kind === 'bath') {
    k('brick', 0.2, 0.0, 0.4, A - 0.2, 0.06, B - 0.3); k('bitumen', 0.2, 0.06, wall - 0.2, A - 0.2, 0.08, wall + 0.0);      // the brick floor, the drain channel along the wall
    k('brick', 0.5, 0.0, 0.5, 1.6, 0.55, 1.4); k('bitumen', 0.55, 0.55, 0.55, 1.55, 0.58, 1.35);                             // the bathing platform
    jl('terracotta', A - 0.6, wall - 0.2, 2.1); jl('pottery_dark', A - 1.2, wall - 0.3, 1.2); k('brick', A - 0.9, 0.0, 0.3, A - 0.2, 0.3, 0.9);
    k('bitumen', 0.9, 0.06, wall, 1.1, 0.4, wall + 0.2);
  } else if (kind === 'cell') {                                            // a priest's cell: a mat and a rolled blanket, a water jar, a stool, a lamp niche, his things in a basket
    k('reed_mat', 0.5, 0, wall - 2.0, 1.7, 0.035, wall - 0.3); k('cloth_white', 0.6, 0.035, wall - 0.9, 1.5, 0.12, wall - 0.4);
    KL(F, L, 'cloth_ochre', [[0.001, 0], [0.12, 0.01], [0.12, 0.5], [0.001, 0.5]], 0.5, wall - 0.4, 0.035, 8);
    jl('terracotta', A - 0.5, wall - 0.2, 1.7); k('mudbrick', A - 1.4, 0, 0.9, A - 0.8, 0.38, 1.4); KL(F, L, 'wicker', [[0.22, 0], [0.28, 0.2], [0.001, 0.2]], A - 0.5, 1.2, 0);
    k('brick', 0.15, 0.9, wall + 0.1, 0.65, 1.0, wall + 0.4); KL(F, L, 'terracotta', [[0.001, 0], [0.07, 0.01], [0.08, 0.04], [0.001, 0.05]], 0.4, wall + 0.25, 1.0, 8);
  } else if (kind === 'shrine') {                                          // a brick plinth with a seated figure of soapstone, offerings before it
    k('brick', m - 0.7, 0, wall - 1.0, m + 0.7, 0.5, wall - 0.1); k('soapstone', m - 0.22, 0.5, wall - 0.75, m + 0.22, 0.95, wall - 0.4); k('soapstone', m - 0.14, 0.95, wall - 0.68, m + 0.14, 1.22, wall - 0.47);
    k('gold', m - 0.16, 1.12, wall - 0.7, m + 0.16, 1.17, wall - 0.45); k('reed_mat', m - 0.9, 0, 0.8, m + 0.9, 0.03, 2.0);
    for (let i = 0; i < 3; i++) jl(i % 2 ? 'terracotta' : 'pottery_dark', m - 0.5 + i * 0.5, 2.3, 0.9, 0.03);
    k('bitumen', m + 0.8, 0, wall - 0.5, m + 1.1, 0.7, wall - 0.2);
  } else {                                                                 // work: a loom frame, spindles, baskets of cotton or wool
    for (const a of [0.4, 1.9]) k('timber', a, 0, wall - 0.1, a + 0.08, 1.7, wall - 0.02); k('timber', 0.4, 1.6, wall - 0.1, 2.0, 1.68, wall - 0.02);
    for (let i = 0; i < 9; i++) k('cloth_white', 0.55 + i * 0.15, 0.4, wall - 0.08, 0.58 + i * 0.15, 1.6, wall - 0.06);
    k('cloth_indigo', 0.55, 0.4, wall - 0.08, 1.9, 0.9, wall - 0.04);
    for (let i = 0; i < 3; i++) KL(F, L, 'wicker', [[0.24, 0], [0.3, 0.2], [0.001, 0.2]], A - 0.6 - (i % 2) * 0.1, 0.8 + i * 0.6, 0);
    k('reed_mat', m, 0, 1.0, m + 1.6, 0.03, 2.3); jl('terracotta', m + 0.2, 1.2, 1.2, 0.03);
  }
  if (lit) { const p = L.pt(m, B * 0.45); lights.push({ at: [p[0], F.y + 1.6, p[1]], color: '#ffc98a', intensity: 2.6, distance: 7 }); }
}

/** The court: a hearth, a washing place, jars along the wall, a mat, sometimes a tree-stump seat and a stack of fuel. */
export function dressCourt(F, rand, u0, v0, u1, v1) {
  const w = u1 - u0, d = v1 - v0;
  if (w < 2 || d < 2) return;
  const u = u0 + 0.5 + rand() * Math.max(0.1, w - 2.4), v = v1 - 0.6 - rand() * Math.min(1.2, d * 0.3);
  F.b('brick', u, 0.04, v - 0.4, u + 1.1, 0.24, v + 0.3, false); F.b('bitumen', u + 0.15, 0.24, v - 0.25, u + 0.95, 0.27, v + 0.15, false); jar(F, 'pottery_dark', u + 0.55, v - 0.05, 1.2, 0.27);
  if (rand() < 0.5) { const a = u0 + 0.4 + rand() * (w - 1.2); for (let i = 0; i < 3; i++) jar(F, i % 2 ? 'terracotta' : 'pottery_dark', a + i * 0.45, v0 + 0.5, 1.4); }
  if (rand() < 0.5) { const a = u0 + 0.6 + rand() * (w - 2.0); F.b('reed_mat', a, 0.08, v0 + 1.2, a + 1.5, 0.11, v0 + 2.4, false); }
  if (rand() < 0.35) for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) F.b('timber', u0 + 0.3 + j * 0.2 + i * 0.1, 0.08 + i * 0.14, v1 - 0.4, u0 + 0.46 + j * 0.2 + i * 0.1, 0.2 + i * 0.14, v1 - 0.15, false);
  void lathe;
}
