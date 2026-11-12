// The village houses of Ajanta (docs/settlements/ajanta.md §6, §10): four house types of the Deccan village of the
// workers — the plain thatched hut, the hut with a verandah (otla) under the eave, the hut in a walled yard (tulsi platform,
// grain mortar), the flat-roofed mud house with a parapet and its ladder — each furnished inside (hearth, rope cot, grain
// bin, water pots, shelf, mat) and dressed at eye level (chilli garlands, dung cakes, geru and lime bands, a pot stand,
// a drying line, a broom). The village's other pieces: granary, cattle pen, threshing floor, shrine, mud walls.
import { box, lathe, rod, frustum, disc } from '../../core/geom.js';
import { rng } from '../../settlements/ajanta/layout.js';

/** A local frame on a rect: u along the front (0…W), v into the house from the front face (0…D); worlds axis-aligned. */
function frame(rect, front) {
  const [x0, z0, x1, z1] = rect, f = front ?? 's';
  const W = f === 's' || f === 'n' ? x1 - x0 : z1 - z0, D = f === 's' || f === 'n' ? z1 - z0 : x1 - x0;
  const xz = (u, v) => (f === 's' ? [x0 + u, z1 - v] : f === 'n' ? [x1 - u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rect4 = (u0, v0, u1, v1) => { const a = xz(u0, v0), b = xz(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const yaw = f === 's' ? 0 : f === 'n' ? Math.PI : f === 'e' ? -Math.PI / 2 : Math.PI / 2;
  return { W, D, xz, rect4, yaw, f };
}
const B = (F, bag, mat, u0, y0, v0, u1, y1, v1) => { const [a, b, c, d] = F.rect4(u0, v0, u1, v1); bag.add(mat, box(a, y0, b, c, y1, d)); };
const C = (F, col, u0, v0, u1, v1, y0, y1) => col.rect(F.rect4(u0, v0, u1, v1), y0, y1);
const pot = (bag, x, y, z, r, h, mat = 'terracotta') => bag.add(mat, lathe([[0.001, 0], [r * 0.55, 0.02], [r, h * 0.45], [r * 0.82, h * 0.8], [r * 0.5, h * 0.92], [r * 0.58, h], [r * 0.45, h], [r * 0.001, h * 0.9]], 10, null, x, y, z));
/** A wall run along u at depth v0…v1 from u0 to u1, full height H, with openings [uc, half, y0, y1]. */
function wallRun(F, bag, col, mat, u0, u1, v0, v1, H, ops) {
  const O = ops.filter((o) => o[0] + o[1] > u0 && o[0] - o[1] < u1).sort((a, b) => a[0] - b[0]);
  let u = u0;
  const put = (a, b, y0, y1) => { if (b - a < 0.01 || y1 - y0 < 0.01) return; B(F, bag, mat, a, y0, v0, b, y1, v1); C(F, col, a, v0, b, v1, y0, y1); };
  for (const [c, h, y0, y1] of O) { put(u, c - h, 0, H); put(c - h, c + h, 0, y0); put(c - h, c + h, y1, H); u = c + h; }
  put(u, u1, 0, H);
}
const MUDS = ['mud_plaster', 'earth_wall'];

/** aj_house: { rect, front, seed, variant 0–3, mud } — see the file header. */
export function house(el, { bag, col }) {
  const rect = el.rect, F = frame(rect, el.front), { W, D } = F, rand = rng(el.seed ?? 1), mud = el.mud ?? MUDS[Math.floor(rand() * 2)], V = el.variant ?? 0;
  const flat = V === 3, H = flat ? 2.55 : 2.3, t = 0.35, uc = W * (0.38 + rand() * 0.24), dw = 0.52, dh = 1.75, y = 0;
  const ops = [[uc, dw, 0, dh]];
  const wf = W * (uc > W / 2 ? 0.2 : 0.8);
  if (rand() < 0.8) ops.push([wf, 0.22, 1.15, 1.6]);
  // walls: front (door, a small window), the back (a window), the sides
  wallRun(F, bag, col, mud, 0, W, 0, t, H, ops);
  wallRun(F, bag, col, mud, 0, W, D - t, D, H, [[W * 0.5, 0.22, 1.15, 1.6]]);
  wallRun(F, bag, col, mud, 0, t, t, D - t, H, []);
  wallRun(F, bag, col, mud, W - t, W, t, D - t, H, []);
  // the window's bars, the door's frame (timber posts, a lintel standing out at each end) and its leaf ajar inside
  for (const [c, hw, y0, y1] of ops.slice(1)) for (let k = -1; k <= 1; k++) B(F, bag, 'timber', c + k * hw * 0.8 - 0.015, y0, 0.02, c + k * hw * 0.8 + 0.015, y1, 0.1);
  for (const s of [-1, 1]) B(F, bag, 'timber', uc + s * (dw + 0.06) - 0.06, 0, -0.04, uc + s * (dw + 0.06) + 0.06, dh + 0.1, t + 0.04);
  B(F, bag, 'timber', uc - dw - 0.25, dh, -0.08, uc + dw + 0.25, dh + 0.15, t + 0.06);
  B(F, bag, 'planks_grey', uc - dw - 0.05, 0.05, t, uc - dw, dh - 0.05, t + 0.85); C(F, col, uc - dw - 0.05, t, uc - dw, t + 0.85, 0, dh - 0.05);
  // the paint of the front: geru (red earth) band at the foot, lime round the door, lime on the lintel
  B(F, bag, 'tuff_red', 0, 0, -0.02, uc - dw - 0.1, 0.5, 0.0); B(F, bag, 'tuff_red', uc + dw + 0.1, 0, -0.02, W, 0.5, 0.0);
  for (const s of [-1, 1]) B(F, bag, 'limewash_white', uc + s * (dw + 0.16) - 0.06, 0, -0.05, uc + s * (dw + 0.16) + 0.06, dh + 0.25, -0.02);
  B(F, bag, 'limewash_white', uc - dw - 0.22, dh + 0.17, -0.06, uc + dw + 0.22, dh + 0.3, -0.02);
  if (rand() < 0.6) for (let k = 0; k < 5; k++) B(F, bag, 'limewash_white', 0.15 + k * (W - 0.3) / 5, H - 0.55, -0.03, 0.15 + k * (W - 0.3) / 5 + (W - 0.3) / 5 * 0.55, H - 0.4, -0.01);
  // the floor of beaten earth, the plinth in pieces round the door, a threshold stone
  { const [a, b, c, d] = F.rect4(t, t, W - t, D - t); bag.add('earth_wall', box(a, y - 0.1, b, c, y + 0.02, d)); col.floor([a, b, c, d], 0.02); }
  for (const [a, b] of [[0, uc - dw], [uc + dw, W]]) B(F, bag, 'banco', a - 0.06, 0, -0.08, b + (b === W ? 0.06 : 0), 0.26, D + 0.06 * 0 + 0.08);
  B(F, bag, 'granite_rough', uc - dw, 0, -0.35, uc + dw, 0.1, t + 0.05); col.floor(F.rect4(uc - dw, -0.35, uc + dw, t), 0.1);
  // the roof: hip of thatch in two courses (V 1 reaches over the verandah), a flat parapet roof for V 3
  const ext = V === 1 ? 1.65 : 0;
  const rr = F.rect4(-0.55, -0.55 - ext, W + 0.55, D + 0.55);
  if (flat) {
    const [a, b, c, d] = F.rect4(-0.1, -0.1, W + 0.1, D + 0.1);
    bag.add('timber', box(a + 0.1, H - 0.1, b + 0.1, c - 0.1, H, d - 0.1));
    bag.add('earth_wall', box(a, H, b, c, H + 0.22, d));
    for (const [p, q, r2, s] of [[a, b, c, b + 0.2], [a, d - 0.2, c, d], [a, b, a + 0.2, d], [c - 0.2, b, c, d]]) bag.add('mud_plaster', box(p, H + 0.22, q, r2, H + 0.62, s));
    // fodder stacked on the roof, a pot and the ladder against the side wall
    const [fx, fz] = F.xz(W * 0.7, D * 0.5);
    bag.add('thatch_palm', frustum([fx - 0.9, fz - 0.7, fx + 0.9, fz + 0.7], H + 0.22, H + 1.1, 0.35, 0.35, 0.3, 0.3));
    { const [px, pz] = F.xz(W * 0.2, D * 0.3); pot(bag, px, H + 0.22, pz, 0.28, 0.5); }
    { const [lx, lz] = F.xz(W + 0.18, D * 0.4), ax = F.f === 's' || F.f === 'n' ? [0, 1] : [1, 0], o = 0.25;
      for (const sg of [-1, 1]) bag.add('timber', rod([lx + ax[0] * sg * o, 0, lz + ax[1] * sg * o], [lx + ax[0] * sg * o, H + 0.7, lz + ax[1] * sg * o], 0.035, 5));
      for (let k = 0; k < 7; k++) { const yy = 0.3 + k * 0.38; bag.add('timber', rod([lx - ax[0] * o, yy, lz - ax[1] * o], [lx + ax[0] * o, yy, lz + ax[1] * o], 0.025, 5)); } }
  } else {
    bag.add('timber', box(...(() => { const [a, b, c, d] = F.rect4(t, t, W - t, D - t); return [a, H - 0.1, b, c, H, d]; })()));
    bag.add('thatch', frustum(rr, H - 0.1, H + 0.5, 0.18, 0.18, 0.18, 0.18));
    const r2 = F.rect4(-0.3, -0.3 - ext, W + 0.3, D + 0.3);
    bag.add('thatch', frustum(r2, H + 0.5, H + 1.55, 0.5, 0.5, 0.55, 0.55));
    // the ridge and its pot, gourds and their vine on the eave
    const [cx, cz] = F.xz(W / 2, (D - ext) / 2);
    if (V === 1 || rand() < 0.35) pot(bag, cx, H + 1.5, cz, 0.16, 0.34);
    if (rand() < 0.55) for (let k = 0; k < 5; k++) { const [gx, gz] = F.xz(0.4 + rand() * (W - 0.8), -0.45 - ext + 0.05); bag.add(k % 2 ? 'palm_leaf' : 'paint_ochre', box(gx - 0.12, H + 0.3 + rand() * 0.15, gz - 0.12, gx + 0.12, H + 0.5 + rand() * 0.15, gz + 0.12)); }
  }
  // ── the inside, from the front door: the hearth in a back corner with its pots, a rope cot, a grain bin, water pots, a shelf, a mat
  const left = uc > W / 2 ? 1 : 0;                                          // the corner side of the hearth
  { const hu = left ? t + 0.15 : W - t - 0.85, hv = D - t - 0.6;
    B(F, bag, 'terracotta', hu, 0, hv, hu + 0.7, 0.34, hv + 0.45); C(F, col, hu, hv, hu + 0.7, hv + 0.45, 0, 0.34);
    for (const k of [0.2, 0.52]) { const [px, pz] = F.xz(hu + k, hv + 0.22); pot(bag, px, 0.34, pz, 0.17, 0.26, 'pottery_dark'); }
    B(F, bag, 'pottery_dark', hu - 0.05, 0.34, hv + 0.45, hu + 0.75, 1.6, hv + 0.5); }                                    // the soot on the wall
  { const cu = left ? W - t - 1.8 : t + 0.1, cv = D - t - 1.05;
    for (const a of [0.08, 1.62]) for (const b of [0.08, 0.82]) { const [lx, lz] = F.xz(cu + a, cv + b); bag.add('timber', rod([lx, 0, lz], [lx, 0.42, lz], 0.04, 5)); }
    B(F, bag, 'timber', cu, 0.4, cv, cu + 1.7, 0.46, cv + 0.9); B(F, bag, 'rope_fibre', cu + 0.06, 0.44, cv + 0.06, cu + 1.64, 0.49, cv + 0.84);
    B(F, bag, rand() < 0.5 ? 'cloth_white' : 'cloth_ochre', cu + 0.15, 0.49, cv + 0.12, cu + 1.0, 0.54, cv + 0.78);
    C(F, col, cu, cv, cu + 1.7, cv + 0.9, 0, 0.48); }
  { const gu = left ? W - t - 0.6 : t + 0.6, [gx, gz] = F.xz(gu, t + 0.65);
    bag.add('terracotta', lathe([[0.001, 0], [0.34, 0.03], [0.5, 0.45], [0.46, 0.85], [0.3, 1.05], [0.34, 1.12], [0.001, 1.12]], 12, null, gx, 0, gz)); bag.add('thatch_palm', lathe([[0.001, 0], [0.36, 0], [0.2, 0.18], [0.001, 0.24]], 10, null, gx, 1.1, gz)); col.circle(gx, gz, 0.5, 0, 1.2); }
  for (let k = 0; k < 3; k++) { const [px, pz] = F.xz(uc + (left ? -1 : 1) * (dw + 0.45 + k * 0.1), t + 0.35 + (k % 2) * 0.28); pot(bag, px, 0, pz, 0.24, 0.5); }
  B(F, bag, 'planks_grey', W * 0.4, 1.45, D - t - 0.02, W * 0.4 + 1.3, 1.52, D - t - 0.3);
  for (let k = 0; k < 4; k++) { const [px, pz] = F.xz(W * 0.4 + 0.2 + k * 0.3, D - t - 0.17); pot(bag, px, 1.52, pz, 0.09, 0.15, k % 2 ? 'terracotta' : 'pottery_dark'); }
  { const [mx0, mz0, mx1, mz1] = F.rect4(W * 0.45, D * 0.45, W * 0.45 + 1.2, D * 0.45 + 0.9); bag.add('reed_mat', box(mx0, 0.02, mz0, mx1, 0.035, mz1)); const [bx, bz] = F.xz(W * 0.45 + 0.9, D * 0.45 + 0.45); pot(bag, bx, 0.035, bz, 0.1, 0.07, 'pottery_dark'); const [b2, c2] = F.xz(W * 0.45 + 0.4, D * 0.45 + 0.4); pot(bag, b2, 0.035, c2, 0.1, 0.07, 'bronze'); }
  // ── the front, at eye level: a verandah or a yard, the garlands, the dung cakes, the pot stand, the mortar, the line
  if (V === 1) {
    B(F, bag, 'banco', -0.1, 0, -1.55, W + 0.1, 0.18, 0); C(F, col, -0.1, -1.55, uc - dw, 0, 0, 0.18);
    col.floor(F.rect4(-0.1, -1.55, W + 0.1, 0), 0.18);
    for (const u of [0.1, W / 2 - 0.2, W - 0.1]) { const [px, pz] = F.xz(u, -1.5); bag.add('timber', rod([px, 0.18, pz], [px, H + 0.1, pz], 0.07, 6)); col.circle(px, pz, 0.09, 0, H); }
    { const a = F.rect4(-0.15, -1.62, W + 0.15, -1.45); bag.add('timber', box(a[0], H - 0.12, a[1], a[2], H + 0.08, a[3])); }
    B(F, bag, 'banco', 0.25, 0.18, -0.55, 1.35, 0.5, -0.05); C(F, col, 0.25, -0.55, 1.35, -0.05, 0.18, 0.5);
  }
  if (V === 2) {
    const wl = 3.1, wh = 1.15, wt = 0.28, g = 0.85;
    const wallU = (u0, u1, v0, v1) => { B(F, bag, 'mud_plaster', u0, 0, v0, u1, wh, v1); B(F, bag, 'thatch', u0 - 0.05, wh, v0 - 0.06, u1 + 0.05, wh + 0.1, v1 + 0.06); C(F, col, u0, v0, u1, v1, 0, wh); };
    wallU(-0.1, -0.1 + wt, -wl, 0); wallU(W - wt + 0.1, W + 0.1, -wl, 0);
    wallU(-0.1, W / 2 - g, -wl, -wl + wt); wallU(W / 2 + g, W + 0.1, -wl, -wl + wt);
    for (const s of [-1, 1]) B(F, bag, 'timber', W / 2 + s * g - 0.07 + s * 0.0, 0, -wl - 0.04, W / 2 + s * g + 0.07, 1.6, -wl + wt + 0.04);
    // the yard: the tulsi platform with its basil, a pounding stone, the dung cakes drying
    B(F, bag, 'banco', W * 0.72, 0, -1.6, W * 0.72 + 0.55, 0.55, -1.05); C(F, col, W * 0.72, -1.6, W * 0.72 + 0.55, -1.05, 0, 0.55);
    { const [px, pz] = F.xz(W * 0.72 + 0.27, -1.33); bag.add('palm_leaf', lathe([[0.001, 0], [0.18, 0.12], [0.15, 0.35], [0.001, 0.48]], 7, null, px, 0.55, pz)); }
    { const [px, pz] = F.xz(W * 0.25, -1.6); bag.add('granite_rough', lathe([[0.001, 0], [0.24, 0], [0.2, 0.3], [0.001, 0.32]], 8, null, px, 0, pz)); col.circle(px, pz, 0.26, 0, 0.32); bag.add('timber', rod([px + 0.1, 0.3, pz], [px + 0.3, 1.0, pz + 0.1], 0.035, 5)); }
  } else {
    // a drying line before the house, with two cloths
    if (rand() < 0.5) {
      const u0 = rand() < 0.5 ? 0.2 : W - 2.2;
      for (const u of [u0, u0 + 2.0]) { const [px, pz] = F.xz(u, -1.6); bag.add('timber', rod([px, 0, pz], [px, 1.9, pz], 0.04, 5)); col.circle(px, pz, 0.06, 0, 1.9); }
      B(F, bag, 'rope_fibre', u0, 1.82, -1.62, u0 + 2.0, 1.85, -1.58);
      for (const [a, b, m] of [[0.15, 0.85, 'cloth_white'], [0.95, 1.7, rand() < 0.5 ? 'cloth_red' : 'cloth_indigo']]) B(F, bag, m, u0 + a, 0.95 + rand() * 0.1, -1.63, u0 + b, 1.82, -1.57);
    }
  }
  // garlands of chillies and a stick of corn hung under the eave, at the door
  for (let k = 0; k < 7; k++) B(F, bag, 'cloth_red', 0.25 + k * 0.1 + (k % 2) * 0.02, H - 0.6 - (k % 3) * 0.04, -0.08 - (V === 1 ? 0 : 0), 0.3 + k * 0.1 + (k % 2) * 0.02, H - 0.3, -0.03);
  B(F, bag, 'timber', 0.2, H - 0.32, -0.12, 1.05, H - 0.29, -0.08);
  if (rand() < 0.6) for (let k = 0; k < 5; k++) B(F, bag, 'paint_ochre', W - 1.15 + k * 0.14, H - 0.7, -0.08, W - 1.05 + k * 0.14, H - 0.3, -0.03);
  // dung cakes: a stack at the corner, and flat cakes plastered to the side wall to dry
  { const so = rand() < 0.5, u = so ? -0.5 : W + 0.15; for (let r2 = 0; r2 < 5; r2++) B(F, bag, 'earth_wall', u + r2 * 0.01, r2 * 0.07, D * 0.3, u + 0.34 + r2 * 0.01, r2 * 0.07 + 0.07, D * 0.3 + 0.4); if (so) C(F, col, u, D * 0.3, u + 0.35, D * 0.3 + 0.4, 0, 0.35);
    const su = rand() < 0.5 ? -0.03 : W + 0.0;
    for (let r2 = 0; r2 < 3; r2++) for (let c = 0; c < 5; c++) { if (rand() < 0.2) continue; const v = D * 0.45 + c * 0.24, yy = 1.0 + r2 * 0.22; B(F, bag, 'earth_wall', su, yy, v, su + 0.03, yy + 0.17, v + 0.19); } }
  // the pot stand by the door: three sticks, a water pot, a dipper
  { const [px, pz] = F.xz(uc + (left ? 1 : -1) * (dw + 0.9), -0.45), s = left ? 1 : -1;
    for (let k = 0; k < 3; k++) { const a = k * 2.1; bag.add('timber', rod([px + Math.cos(a) * 0.2, 0, pz + Math.sin(a) * 0.2], [px + Math.cos(a) * 0.04, 0.55, pz + Math.sin(a) * 0.04], 0.025, 4)); }
    pot(bag, px, 0.52, pz, 0.26, 0.5); col.circle(px, pz, 0.28, 0, 1.0);
    const [mx, mz] = F.xz(uc + s * (dw + 1.6), -0.5); bag.add('granite_rough', lathe([[0.001, 0], [0.22, 0], [0.19, 0.3], [0.001, 0.32]], 8, null, mx, 0, mz)); col.circle(mx, mz, 0.24, 0, 0.32);
    bag.add('timber', rod([mx + 0.12, 0.28, mz], [mx + 0.3, 1.1, mz + 0.05], 0.03, 4));
    const [bx, bz] = F.xz(uc - s * (dw + 0.45), -0.08); bag.add('thatch_palm', rod([bx, 0.05, bz - 0.0], [bx + 0.1, 1.0, bz - 0.05], 0.035, 5)); }
  // a lamp shelf at the door-post with a clay lamp
  { const [lx, lz] = F.xz(uc + dw + 0.28, -0.06); bag.add('timber', box(lx - 0.08, 1.45, lz - 0.1, lx + 0.08, 1.49, lz + 0.1)); pot(bag, lx, 1.49, lz, 0.05, 0.04, 'terracotta'); }
}

/** aj_granary: { at, y, seed } a kothar: a wicker-and-mud bin on a ring of stones with a thatch cone and a ladder, 1.1 m across. */
export function granary(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = 1.9;
  bag.add('rubble', lathe([[0.001, 0], [0.75, 0], [0.7, 0.4], [0.001, 0.4]], 10, null, x, y, z));
  bag.add('wicker', lathe([[0.001, 0], [0.62, 0], [0.7, h * 0.4], [0.66, h * 0.8], [0.5, h], [0.001, h]], 14, null, x, y + 0.4, z));
  bag.add('mud_plaster', lathe([[0.64, 0.0], [0.72, h * 0.4], [0.68, h * 0.8], [0.52, h]].map(([r, hh], i, a) => [r + 0.03, hh]), 14, null, x, y + 0.4, z));
  bag.add('thatch_palm', lathe([[0.001, 0.62], [0.95, 0], [1.0, -0.05], [0.001, -0.05]].map(([r, hh]) => [r, hh]), 14, null, x, y + 0.4 + h - 0.02, z));
  bag.add('timber', rod([x + 0.5, y + 0.4, z + 0.55], [x + 0.66, y + 0.4 + h * 0.85, z + 0.2], 0.03, 5)); bag.add('timber', rod([x + 0.7, y + 0.4, z + 0.5], [x + 0.84, y + 0.4 + h * 0.85, z + 0.15], 0.03, 5));
  col.circle(x, z, 0.78, y, y + 2.5);
}
/** aj_pen: { rect, gate: 's'|'n'|'e'|'w', y, seed } a cattle pen of stakes and bamboo rails, with a manger and a heap of fodder. */
export function pen(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, g = el.gate ?? 's', rand = rng(el.seed ?? 1);
  const post = (x, z) => { bag.add('timber', rod([x, y, z], [x, y + 1.25 + rand() * 0.15, z], 0.05, 5)); };
  const run = (ax, az, bx, bz, gap) => {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(L / 1.3));
    for (let i = 0; i <= n; i++) { const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t; if (gap && t > gap[0] && t < gap[1]) continue; post(x, z); }
    for (const hh of [0.45, 0.85, 1.2]) {
      const segs = gap ? [[0, gap[0]], [gap[1], 1]] : [[0, 1]];
      for (const [s0, s1] of segs) { if (s1 - s0 < 0.02) continue; bag.add('bamboo_culm', rod([ax + (bx - ax) * s0, y + hh, az + (bz - az) * s0], [ax + (bx - ax) * s1, y + hh, az + (bz - az) * s1], 0.035, 5)); }
    }
    for (const [s0, s1] of gap ? [[0, gap[0]], [gap[1], 1]] : [[0, 1]]) if (s1 - s0 > 0.02) col.segment?.([ax + (bx - ax) * s0, az + (bz - az) * s0], [ax + (bx - ax) * s1, az + (bz - az) * s1], 0.08, y, y + 1.3);
  };
  const gp = [0.38, 0.62];
  run(x0, z0, x1, z0, g === 'n' ? gp : null); run(x0, z1, x1, z1, g === 's' ? gp : null);
  run(x0, z0, x0, z1, g === 'w' ? gp : null); run(x1, z0, x1, z1, g === 'e' ? gp : null);
  // the manger along the back, the fodder, droppings and trodden earth
  const back = g === 's' ? [x0 + 0.6, z0 + 0.5, x1 - 0.6, z0 + 1.1] : g === 'n' ? [x0 + 0.6, z1 - 1.1, x1 - 0.6, z1 - 0.5] : g === 'e' ? [x0 + 0.5, z0 + 0.6, x0 + 1.1, z1 - 0.6] : [x1 - 1.1, z0 + 0.6, x1 - 0.5, z1 - 0.6];
  bag.add('timber', box(back[0], y, back[1], back[2], y + 0.5, back[3])); bag.add('thatch_palm', box(back[0] + 0.08, y + 0.3, back[1] + 0.08, back[2] - 0.08, y + 0.52, back[3] - 0.08)); col.rect(back, y, y + 0.5);
  bag.add('earth_wall', box(x0 + 0.02, y - 0.1, z0 + 0.02, x1 - 0.02, y + 0.015, z1 - 0.02));
}
/** aj_thresh: { at, y, r } a threshing floor of beaten earth with its post, a heap of straw and a winnowing tray. */
export function thresh(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 4.2;
  bag.add('earth_wall', disc(r, y + 0.012, 22, x, z)); bag.add('banco', lathe([[r, 0], [r + 0.12, 0], [r + 0.06, 0.1], [r, 0.1]], 22, null, x, y, z));
  bag.add('timber', rod([x, y, z], [x, y + 1.9, z], 0.09, 6)); col.circle(x, z, 0.12, y, y + 1.9);
  bag.add('thatch_palm', lathe([[0.001, 0], [1.5, 0], [1.2, 0.45], [0.6, 0.9], [0.001, 1.15]], 12, null, x + r * 0.62, y, z - r * 0.3)); col.circle(x + r * 0.62, z - r * 0.3, 1.2, y, y + 1);
  bag.add('wicker', lathe([[0.001, 0.02], [0.5, 0.0], [0.5, 0.06], [0.001, 0.07]], 10, null, x - r * 0.4, y, z + r * 0.35));
  for (let k = 0; k < 7; k++) bag.add('paint_ochre', lathe([[0.001, 0], [0.12 + (k % 3) * 0.03, 0.01], [0.001, 0.07]], 6, null, x - r * 0.4 + 0.5 * Math.cos(k), y + 0.01, z + r * 0.35 + 0.5 * Math.sin(k)));
}
/** aj_vshrine: { at, y } the village's deity: a platform, three oil-and-vermilion stones, a trident, a bell, a flag. */
export function vshrine(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('banco', box(x - 1.3, y, z - 1.0, x + 1.3, y + 0.35, z + 1.0)); col.rect([x - 1.3, z - 1.0, x + 1.3, z + 1.0], y, y + 0.35);
  bag.add('granite_rough', box(x - 1.3, y + 0.3, z - 1.0, x + 1.3, y + 0.37, z + 1.0));
  for (let k = -1; k <= 1; k++) { bag.add('tuff_red', lathe([[0.001, 0], [0.24, 0], [0.2, 0.4 + (k + 1) * 0.07], [0.12, 0.56 + (k + 1) * 0.07], [0.001, 0.6 + (k + 1) * 0.07]], 8, null, x + k * 0.6, y + 0.37, z - 0.2)); }
  bag.add('iron', rod([x - 0.9, y + 0.37, z + 0.45], [x - 0.9, y + 1.8, z + 0.45], 0.025, 5));
  for (const s of [-1, 0, 1]) bag.add('iron', rod([x - 0.9 + s * 0.12, y + 1.55, z + 0.45], [x - 0.9 + s * 0.12, y + 1.95, z + 0.45], 0.015, 4));
  bag.add('iron', box(x - 1.02, y + 1.52, z + 0.43, x - 0.78, y + 1.56, z + 0.47));
  bag.add('timber', rod([x + 1.8, y, z + 0.9], [x + 1.8, y + 3.4, z + 0.9], 0.05, 5)); bag.add('cloth_red', box(x + 1.8, y + 2.7, z + 0.88, x + 2.7, y + 3.3, z + 0.92));
  bag.add('bronze', lathe([[0.001, 0], [0.1, 0], [0.12, 0.12], [0.001, 0.14]], 8, null, x + 1.0, y + 1.7, z + 0.9)); bag.add('timber', box(x + 0.95, y + 1.82, z + 0.85, x + 1.05, y + 1.86, z + 0.95));
  void col;
}
/** aj_mudwall: { pts: [[x, z], …], y, h, thick, gaps } a low mud wall with a thatch cap (a compound's boundary). */
export function mudwall(el, { bag, col }) {
  const P = el.pts, y = el.y ?? 0, h = el.h ?? 1.25, th = el.thick ?? 0.32;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az), nx = (bx - ax) / L, nz = (bz - az) / L;
    const a = [Math.min(ax, bx) - (Math.abs(nz) > 0.5 ? th / 2 : 0), Math.min(az, bz) - (Math.abs(nx) > 0.5 ? th / 2 : 0), Math.max(ax, bx) + (Math.abs(nz) > 0.5 ? th / 2 : 0), Math.max(az, bz) + (Math.abs(nx) > 0.5 ? th / 2 : 0)];
    bag.add(i % 2 ? 'mud_plaster' : 'earth_wall', box(a[0], y, a[1], a[2], y + h, a[3]));
    bag.add('thatch', box(a[0] - (Math.abs(nx) > 0.5 ? 0.03 : 0.07), y + h, a[1] - (Math.abs(nz) > 0.5 ? 0.03 : 0.07), a[2] + (Math.abs(nx) > 0.5 ? 0.03 : 0.07), y + h + 0.12, a[3] + (Math.abs(nz) > 0.5 ? 0.03 : 0.07)));
    col.rect(a, y, y + h);
  }
}
export const HOUSE_ELEMENTS = { aj_house: house, aj_granary: granary, aj_pen: pen, aj_thresh: thresh, aj_vshrine: vshrine, aj_mudwall: mudwall };
