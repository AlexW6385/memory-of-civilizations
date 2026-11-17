// The ground floors of the open terrace houses of London about 1870 (docs/settlements/london.md §5a, §8): the shell, the hall with its
// stair, the front room and the back room, in three kinds by the house's class and place (el.variant: 'parlour', 'dining', 'lodging'),
// the door on the left or the right of the front (el.mirror) as the houses of a terrace were built in pairs.
import { box, lathe } from '../../core/geom.js';
import { figure } from '../../objects/figures.js';

/**
 * The ground floor of an open terrace house about 1870 (docs/settlements/london.md §5a), its front 's' or 'n': walls of
 * brick a brick and a half thick; the door from the steps into the hall along the party wall on the door's side, the
 * stair rising in it toward the back; the front parlour beside the hall, kept for Sundays and visitors — wallpaper below
 * the picture rail and a plain frieze over it, a large carpet, the black grate with coloured tiles either side and its
 * fender, the mantelpiece under a velvet drape with the clock and two vases, the black and gold over-mantel mirror, a suite
 * of a sofa and two armchairs, upright chairs, occasional tables (one with three twisted legs), the aspidistra in its
 * ornate pot, prints on the picture rail, lace across the lower half of the window, a gasolier; the back room where the
 * family lived: the black range in the chimney breast, the dresser with its plates, the table under a cloth with chairs.
 */
export function terraceInterior(el, ctx, mat, st) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front, L = x1 - x0, D = z1 - z0, T = 0.34, fy = y + 0.4, V = el.variant ?? 'parlour', M = !!el.mirror;
  // (u along the street from x0, v in from the front face, height) → world
  const P = (u, v) => [x0 + (M ? L - u : u), f === 's' ? z1 - v : z0 + v];
  const B = (m, u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yb, Math.max(a[1], b[1]))); };
  const C = (u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], ya, yb); };
  const W = (m, u0, u1, ya, yb, v0, v1) => { B(m, u0, u1, ya, yb, v0, v1); C(u0, u1, ya, yb, v0, v1); };
  const du = L / 4, wu = 3 * L / 4, ceil = y + st;               // the door's and the window's centres (as on the front)
  // the shell: front wall with the doorway and the window, back wall with its window, the two party walls; the floor
  W(mat, 0, du - 0.55, y - 0.5, ceil, 0, T); W(mat, du + 0.55, wu - 0.55, y - 0.5, ceil, 0, T); W(mat, wu + 0.55, L, y - 0.5, ceil, 0, T);
  W(mat, du - 0.55, du + 0.55, fy + 2.6, ceil, 0, T);                                                  // over the door; the fanlight's glass under it
  B('glass_outer', du - 0.55, du + 0.55, fy + 2.05, fy + 2.6, 0.12, 0.135);
  W(mat, wu - 0.55, wu + 0.55, y - 0.5, y + 0.6, 0, T); W(mat, wu - 0.55, wu + 0.55, y + 2.4, ceil, 0, T);
  B('glass_outer', wu - 0.55, wu + 0.55, y + 0.6, y + 2.4, 0.1, 0.115); C(wu - 0.55, wu + 0.55, y + 0.6, y + 2.4, 0.05, 0.2);
  W(mat, 0, L, y - 0.5, ceil, D - T, D);
  W(mat, 0, 0.22, y - 0.5, ceil, T, D - T); W(mat, L - 0.22, L, y - 0.5, ceil, T, D - T);
  B('timber', 0.22, L - 0.22, y - 0.5, fy, T, D - T);
  { const a = P(0.22, T), b = P(L - 0.22, D - T); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy); }
  B('timber', du - 0.55, du + 0.55, y - 0.5, fy, 0, T);                                                  // the threshold
  // the front door stands open, folded back against the hall wall
  B('wood_dark', du - 0.62, du - 0.57, fy, fy + 2.03, T, T + 0.95);
  // the hall: a partition along it with the parlour's door, the stair rising toward the back
  const hw = du + 0.6, pv = 4.6;                                                                       // the hall's inner side; the parlours' dividing wall
  W('stucco_cream', hw, hw + 0.12, fy, ceil, T, 1.5); W('stucco_cream', hw, hw + 0.12, fy + 2.1, ceil, 1.5, 2.4); W('stucco_cream', hw, hw + 0.12, fy, ceil, 2.4, 5.0);
  W('stucco_cream', hw, hw + 0.12, fy + 2.1, ceil, 5.0, 5.9); W('stucco_cream', hw, hw + 0.12, fy, ceil, 5.9, D - T);           // the back room's door from the hall
  const nst = 14, rise = (ceil - fy) / nst, run = 0.24, sv0 = D - T - 0.3 - nst * run;
  for (let k = 0; k < nst; k++) B('timber', 0.22, hw, fy, fy + rise * (k + 1), sv0 + k * run, sv0 + (k + 1) * run);
  C(0.22, hw, fy, ceil, sv0, D - T);
  B('wood_dark', hw - 0.06, hw - 0.02, fy + 0.2, fy + 1.1, sv0, D - T - 0.3);                          // the banister's rail on its balusters
  for (let k = 0; k < nst; k += 1) B('wood_dark', hw - 0.05, hw - 0.03, fy + rise * (k + 1), fy + rise * (k + 1) + 0.9, sv0 + k * run + 0.1, sv0 + k * run + 0.12);
  B('cloth_red', 0.4, hw - 0.1, fy + 0.002, fy + 0.01, T + 0.3, sv0);                                   // the hall's runner
  // the parlours' dividing wall with its door near the hall
  W('stucco_cream', hw + 0.12, hw + 0.25, fy, ceil, pv, pv + 0.14); W('stucco_cream', hw + 1.15, L - 0.22, fy, ceil, pv, pv + 0.14); W('stucco_cream', hw + 0.25, hw + 1.15, fy + 2.1, ceil, pv, pv + 0.14);
  // ── the front parlour (u hw+0.12 … L−0.22, v T … pv) ──
  const pu0 = hw + 0.12, pu1 = L - 0.22, pm = (pu0 + pu1) / 2, pr = fy + 2.45;
  for (const [u0, u1, v0, v1] of [[pu0, pu0 + 0.01, T, pv], [pu1 - 0.01, pu1, T, pv]]) { B('paint_fleur', u0, u1, fy, pr, v0, v1); B('stucco_cream', u0, u1, pr, ceil, v0, v1); }
  B('paint_fleur', pu0, pu1, fy, pr, pv - 0.01, pv); B('stucco_cream', pu0, pu1, pr, ceil, pv - 0.01, pv);
  // the front wall's inner face papered round the window
  B('paint_fleur', pu0, wu - 0.55, fy, pr, T, T + 0.01); B('paint_fleur', wu + 0.55, pu1, fy, pr, T, T + 0.01); B('paint_fleur', wu - 0.55, wu + 0.55, fy, y + 0.6, T, T + 0.01);
  B('stucco_cream', pu0, pu1, Math.max(pr, y + 2.4), ceil, T, T + 0.01); B('paint_fleur', wu - 0.55, wu + 0.55, y + 2.4, pr, T, T + 0.01);
  B('wood_dark', pu0, pu1, pr, pr + 0.04, pv - 0.03, pv); B('wood_dark', pu1 - 0.03, pu1, pr, pr + 0.04, T, pv); B('wood_dark', pu0, pu0 + 0.03, pr, pr + 0.04, T, pv);
  // the fireplace in the chimney breast on the party wall
  const cb = pu1 - 0.36, fv = (T + pv) / 2;
  B('cloth_red', pu0 + 0.3, cb - 0.56, fy + 0.001, fy + 0.009, T + 0.3, pv - 0.3);
  W(mat, cb, pu1, fy, ceil, fv - 0.8, fv + 0.8);
  B('paint_fleur', cb - 0.01, cb, fy, pr, fv - 0.8, fv + 0.8); B('stucco_cream', cb - 0.01, cb, pr, ceil, fv - 0.8, fv + 0.8);
  for (const [v0, v1] of [[fv - 0.81, fv - 0.8], [fv + 0.8, fv + 0.81]]) { B('paint_fleur', cb, pu1 - 0.01, fy, pr, v0, v1); B('stucco_cream', cb, pu1 - 0.01, pr, ceil, v0, v1); }
  B('iron', cb - 0.02, cb, fy, fy + 0.85, fv - 0.32, fv + 0.32);                                         // the black grate's register
  B('opening', cb - 0.025, cb - 0.02, fy + 0.15, fy + 0.62, fv - 0.22, fv + 0.22);
  for (const sd of [-1, 1]) B('tile_iznik', cb - 0.025, cb - 0.015, fy + 0.05, fy + 0.85, fv + sd * 0.32, fv + sd * 0.48);
  B('flame', cb - 0.15, cb - 0.05, fy + 0.18, fy + 0.3, fv - 0.15, fv + 0.15);
  B('marble_dark', cb - 0.12, cb, fy, fy + 1.0, fv - 0.62, fv - 0.48); B('marble_dark', cb - 0.12, cb, fy, fy + 1.0, fv + 0.48, fv + 0.62);
  B('marble_dark', cb - 0.22, cb, fy + 1.0, fy + 1.06, fv - 0.7, fv + 0.7);                              // the mantel shelf
  if (V !== 'lodging') {
  B('cloth_maroon', cb - 0.235, cb - 0.22, fy + 0.78, fy + 1.06, fv - 0.72, fv + 0.72);                    // the velvet drape, its gold daisies
  for (let k = -3; k <= 3; k++) B('gold', cb - 0.24, cb - 0.235, fy + 0.86, fy + 0.9, fv + k * 0.2 - 0.02, fv + k * 0.2 + 0.02);
  }
  B('iron', cb - 0.5, cb - 0.46, fy, fy + 0.12, fv - 0.6, fv + 0.6); B('iron', cb - 0.5, cb - 0.12, fy, fy + 0.12, fv - 0.62, fv - 0.58); B('iron', cb - 0.5, cb - 0.12, fy, fy + 0.12, fv + 0.58, fv + 0.62);   // the fender
  if (V !== 'lodging') {
  B('wood_dark', cb - 0.13, cb - 0.03, fy + 1.06, fy + 1.36, fv - 0.1, fv + 0.1); B('gold', cb - 0.135, cb - 0.13, fy + 1.15, fy + 1.27, fv - 0.05, fv + 0.05);   // the clock
  for (const sd of [-1, 1]) { const p = P(cb - 0.1, fv + sd * 0.5); bag.add('glaze_blue', lathe([[0.04, 0], [0.06, 0.08], [0.03, 0.18], [0.045, 0.24], [0.001, 0.24]], 10, null, p[0], fy + 1.06, p[1])); }
  B('wood_dark', cb - 0.04, cb - 0.01, fy + 1.3, fy + 2.3, fv - 0.55, fv + 0.55); B('gold', cb - 0.05, cb - 0.04, fy + 1.33, fy + 2.27, fv - 0.52, fv + 0.52); B('mirror_tin', cb - 0.055, cb - 0.05, fy + 1.38, fy + 2.22, fv - 0.47, fv + 0.47);
  }
  if (V === 'lodging') { B('wood_dark', cb - 0.16, cb - 0.1, fy + 1.06, fy + 1.07, fv - 0.5, fv - 0.1); /* candlestick, tea caddy and two plates on the shelf */ { const p = P(cb - 0.12, fv - 0.3); bag.add('gilt_bronze', lathe([[0.04, 0], [0.025, 0.02], [0.015, 0.1], [0.025, 0.14], [0.001, 0.14]], 8, null, p[0], fy + 1.06, p[1])); bag.add('flame', lathe([[0.01, 0], [0.001, 0.05]], 5, null, p[0], fy + 1.2, p[1])); } B('iron', cb - 0.2, cb - 0.08, fy + 1.06, fy + 1.2, fv + 0.1, fv + 0.3); for (const dv of [0.45, 0.62]) { const p = P(cb - 0.03, fv + dv); const g = lathe([[0.001, 0], [0.09, 0.004], [0.1, 0.012], [0.001, 0.012]], 10); g.rotateZ(Math.PI / 2); g.translate(p[0], fy + 1.17, p[1]); bag.add('glaze_white', g); } }
  // the suite: the sofa against the dividing wall, two armchairs by the fire, upright chairs; brocade green and brown
  const seat = (u, v, w, dd, back, m, axis) => {
    const [ua, ub, va, vb] = axis === 'v' ? [u - dd / 2, u + dd / 2, v - w / 2, v + w / 2] : [u - w / 2, u + w / 2, v - dd / 2, v + dd / 2];
    B('wood_dark', ua, ub, fy, fy + 0.12, va, vb); B(m, ua, ub, fy + 0.12, fy + 0.44, va, vb);
    if (back) { const [a, b2, c, d] = back; B(m, a, b2, fy + 0.44, fy + 0.95, c, d); }
    C(ua, ub, fy, fy + 0.9, va, vb);
  };
  const tab = (u, v, r, h) => { const p = P(u, v); bag.add('wood_dark', lathe([[0.001, 0], [r, 0], [r, 0.03], [0.001, 0.03]], 14, null, p[0], fy + h, p[1])); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; bag.add('wood_dark', lathe([[0.022, 0], [0.03, 0.15], [0.02, 0.3], [0.03, 0.45], [0.02, h]], 6, null, p[0] + Math.cos(a) * r * 0.5, fy, p[1] + Math.sin(a) * r * 0.5)); } C(u - r, u + r, fy, fy + h, v - r, v + r); };
  if (V === 'parlour') {
  seat(pm - 0.2, pv - 0.42, 1.7, 0.75, [pm - 1.05, pm + 0.65, pv - 0.14, pv - 0.04], 'cloth_green');
  seat(cb - 1.2, fv - 0.9, 0.75, 0.75, [cb - 1.58, cb - 0.82, fv - 1.27, fv - 1.17], 'cloth_brown', 'v');
  seat(cb - 1.2, fv + 0.9, 0.75, 0.75, [cb - 1.58, cb - 0.82, fv + 1.17, fv + 1.27], 'cloth_brown', 'v');
  for (const v of [T + 0.45]) for (const u of [pu0 + 0.35]) { B('wood_dark', u - 0.2, u + 0.2, fy, fy + 0.45, v - 0.2, v + 0.2); B('wood_dark', u - 0.2, u + 0.2, fy + 0.45, fy + 1.0, v - 0.2, v - 0.16); C(u - 0.2, u + 0.2, fy, fy + 1, v - 0.2, v + 0.2); }
  // occasional tables: one round on three twisted legs by the window with the aspidistra; another by the sofa
  tab(wu - x0 * 0 + 0, T + 0.7, 0.32, 0.72);
  { const p = P(wu, T + 0.7); bag.add('glaze_blue', lathe([[0.08, 0], [0.12, 0.05], [0.14, 0.18], [0.16, 0.22], [0.001, 0.22]], 12, null, p[0], fy + 0.75, p[1]));
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, g = lathe([[0.001, 0], [0.035, 0.12], [0.03, 0.3], [0.001, 0.42]], 5); g.scale(1, 1, 0.25); g.rotateX(0.35 + (k % 3) * 0.2); g.rotateY(a); g.translate(p[0], fy + 0.95, p[1]); bag.add('lotus_leaf', g); } }
  tab(pm + 0.9, pv - 1.3, 0.25, 0.6);
  // the prints hung from the picture rail on the dividing wall
  for (const u of [pm - 0.7, pm + 0.6]) { B('wood_dark', u - 0.3, u + 0.3, fy + 1.45, fy + 2.05, pv - 0.04, pv - 0.015); B('linen', u - 0.24, u + 0.24, fy + 1.51, fy + 1.99, pv - 0.045, pv - 0.04); B('paint_robe', u - 0.12, u + 0.1, fy + 1.58, fy + 1.86, pv - 0.05, pv - 0.045); }
  // lace across the lower half of the window
  B('linen', wu - 0.55, wu + 0.55, y + 0.6, y + 1.5, T + 0.02, T + 0.025);
  // the gasolier: a brass rod from the ceiling rose, two arms with glass globes
  { const p = P(pm, (T + pv) / 2); bag.add('plaster_white', lathe([[0.25, 0], [0.2, -0.03], [0.001, -0.04]], 14, null, p[0], ceil, p[1])); bag.add('gilt_bronze', lathe([[0.012, 0], [0.012, 0.75]], 6, null, p[0], ceil - 0.75, p[1]));
    for (const sd of [-1, 1]) { B('gilt_bronze', pm - 0.01, pm + 0.01, ceil - 0.76, ceil - 0.74, (T + pv) / 2 + (sd < 0 ? -0.3 : 0), (T + pv) / 2 + (sd > 0 ? 0.3 : 0)); const q = P(pm, (T + pv) / 2 + sd * 0.3); bag.add('lamp_glass', lathe([[0.03, 0], [0.07, 0.05], [0.06, 0.13], [0.04, 0.15]], 10, null, q[0], ceil - 0.75, q[1])); } }
  }
  // ── the back room (v pv … D−T) ──
  const bv0 = pv + 0.14, bv1 = D - T;
  for (const [u0, u1] of [[hw + 0.12, hw + 0.13], [L - 0.23, L - 0.22]]) { B('stucco_cream', u0, u1, fy + 1.0, ceil, bv0, bv1); B('wood_dark', u0, u1, fy, fy + 1.0, bv0, bv1); }
  B('wood_dark', hw + 0.12, L - 0.22, fy, fy + 0.008, bv0, bv1);
  const rv = (bv0 + bv1) / 2;
  W(mat, cb, L - 0.22, fy, ceil, rv - 0.75, rv + 0.75);
  B('iron', cb - 0.55, cb, fy, fy + 0.85, rv - 0.6, rv + 0.6);                                          // the range: oven, firebox, hob, its brass rail
  B('flame', cb - 0.56, cb - 0.55, fy + 0.4, fy + 0.6, rv - 0.12, rv + 0.12); B('gilt_bronze', cb - 0.6, cb - 0.58, fy + 0.7, fy + 0.72, rv - 0.6, rv + 0.6);
  B('iron', cb - 0.3, cb, fy + 0.85, fy + 1.6, rv - 0.3, rv + 0.3);
  { const p = P(cb - 0.3, rv + 0.25); bag.add('iron', lathe([[0.1, 0], [0.12, 0.05], [0.12, 0.18], [0.1, 0.2]], 10, null, p[0], fy + 0.85, p[1])); }   // the kettle on the hob
  // the dresser against the hall partition: cupboards below, shelves of plates above
  B('wood_dark', hw + 0.12, hw + 0.6, fy, fy + 0.9, bv1 - 1.6, bv1 - 0.2); C(hw + 0.12, hw + 0.6, fy, fy + 2.2, bv1 - 1.6, bv1 - 0.2);
  B('wood_dark', hw + 0.12, hw + 0.35, fy + 0.9, fy + 2.2, bv1 - 1.6, bv1 - 0.2);
  for (const yy of [1.3, 1.75]) { B('wood_dark', hw + 0.35, hw + 0.45, fy + yy, fy + yy + 0.025, bv1 - 1.6, bv1 - 0.2); for (let k = 0; k < 5; k++) { const p = P(hw + 0.37, bv1 - 1.45 + k * 0.27); const g = lathe([[0.001, 0], [0.11, 0.004], [0.12, 0.012], [0.001, 0.012]], 12); g.rotateZ(Math.PI / 2 - 0.15); g.translate(p[0], fy + yy + 0.13, p[1]); bag.add('glaze_white', g); } }
  // the table under its cloth with four chairs
  const tu = (hw + 0.6 + cb - 0.6) / 2;
  B('wood_dark', tu - 0.45, tu + 0.45, fy + 0.7, fy + 0.74, rv - 0.6, rv + 0.6); if (V !== 'lodging') B('linen', tu - 0.5, tu + 0.5, fy + 0.74, fy + 0.745, rv - 0.65, rv + 0.65);
  for (const [a, b2] of [[-0.4, -0.55], [0.4, -0.55], [-0.4, 0.55], [0.4, 0.55]]) B('wood_dark', tu + a - 0.03, tu + a + 0.03, fy, fy + 0.7, rv + b2 - 0.03, rv + b2 + 0.03);
  C(tu - 0.5, tu + 0.5, fy, fy + 0.75, rv - 0.65, rv + 0.65);
  for (const sd of [-1, 1]) { const v = rv + sd * 0.85; B('wood_dark', tu - 0.2, tu + 0.2, fy + 0.43, fy + 0.47, v - 0.2, v + 0.2); for (const a of [-0.17, 0.17]) for (const b2 of [-0.17, 0.17]) B('wood_dark', tu + a - 0.02, tu + a + 0.02, fy, fy + 0.43, v + b2 - 0.02, v + b2 + 0.02); B('wood_dark', tu - 0.2, tu + 0.2, fy + 0.47, fy + 0.95, v + sd * 0.17, v + sd * 0.2); C(tu - 0.2, tu + 0.2, fy, fy + 0.9, v - 0.2, v + 0.2); }

  // ── the variants of the front room, and the people in the house ──
  const who = (u, v, toward, o) => { const at = P(u, v), to = P(toward[0], toward[1]); figure({ t: 'figure', at, y: fy, rot: Math.atan2(-(to[0] - at[0]), -(to[1] - at[1])), h: 1.56 + (((u * 7 + v * 3) % 1 + 1) % 1) * 0.1, skin: 'skin_light', feet: 'shod', seed: Math.floor(u * 977 + v * 331) + 7, ...o }, ctx); };
  const chair = (u, v, face) => {      // a plain wooden chair, its back toward -face (face: ±1 along v)
    B('wood_dark', u - 0.2, u + 0.2, fy + 0.43, fy + 0.47, v - 0.2, v + 0.2);
    for (const a of [-0.17, 0.17]) for (const b2 of [-0.17, 0.17]) B('wood_dark', u + a - 0.02, u + a + 0.02, fy, fy + 0.43, v + b2 - 0.02, v + b2 + 0.02);
    B('wood_dark', u - 0.2, u + 0.2, fy + 0.47, fy + 0.95, v - face * 0.2, v - face * 0.17); C(u - 0.2, u + 0.2, fy, fy + 0.9, v - 0.2, v + 0.2);
  };
  function diningRoom() {
    // the middle-class front room, the dining room of a clerk's or a tradesman's family: the table laid for tea, the sideboard, the upright piano
    const tm = pm + 0.1, tv = 3.0;
    B('wood_dark', tm - 0.55, tm + 0.55, fy + 0.72, fy + 0.76, tv - 0.42, tv + 0.42); B('linen', tm - 0.6, tm + 0.6, fy + 0.76, fy + 0.765, tv - 0.47, tv + 0.47);
    B('cloth_white', tm - 0.6, tm + 0.6, fy + 0.62, fy + 0.765, tv - 0.47, tv - 0.465); B('cloth_white', tm - 0.6, tm + 0.6, fy + 0.62, fy + 0.765, tv + 0.465, tv + 0.47);
    for (const [a, b2] of [[-0.45, -0.34], [0.45, -0.34], [-0.45, 0.34], [0.45, 0.34]]) B('wood_dark', tm + a - 0.04, tm + a + 0.04, fy, fy + 0.72, tv + b2 - 0.04, tv + b2 + 0.04);
    C(tm - 0.6, tm + 0.6, fy, fy + 0.77, tv - 0.47, tv + 0.47);
    { const p = P(tm, tv); bag.add('glaze_white', lathe([[0.001, 0], [0.07, 0], [0.085, 0.06], [0.07, 0.12], [0.04, 0.13], [0.001, 0.13]], 10, null, p[0], fy + 0.765, p[1])); }
    for (const du2 of [-0.3, 0.3]) for (const dv of [-0.22, 0.22]) { const p = P(tm + du2, tv + dv); bag.add('glaze_white', lathe([[0.001, 0], [0.035, 0], [0.045, 0.05], [0.001, 0.05]], 8, null, p[0], fy + 0.765, p[1])); }
    B('hide_tan', tm - 0.2, tm + 0.2, fy + 0.765, fy + 0.8, tv + 0.15, tv + 0.4);                       // bread and butter
    chair(tm, tv - 0.72, 1); chair(tm, tv + 0.72, -1);
    // the sideboard on the front wall by the window: cupboards, drawers, a tray with decanters
    B('wood_dark', pu0 + 0.1, pu0 + 1.2, fy, fy + 0.95, T + 0.012, T + 0.5); C(pu0 + 0.1, pu0 + 1.2, fy, fy + 1.0, T, T + 0.5);
    B('timber', pu0 + 0.08, pu0 + 1.22, fy + 0.95, fy + 0.99, T + 0.012, T + 0.54);
    for (const u of [pu0 + 0.47, pu0 + 0.83]) B('lacquer_black', u - 0.01, u + 0.01, fy + 0.05, fy + 0.9, T + 0.5, T + 0.51);
    B('gilt_bronze', pu0 + 0.3, pu0 + 0.9, fy + 0.99, fy + 1.01, T + 0.08, T + 0.42);
    for (const [k, m] of [[0.4, 'glaze_green'], [0.6, 'glass_topaz'], [0.8, 'glaze_blue']]) { const p = P(pu0 + k, T + 0.25); bag.add(m, lathe([[0.001, 0], [0.05, 0.01], [0.055, 0.14], [0.02, 0.2], [0.02, 0.26], [0.001, 0.26]], 8, null, p[0], fy + 1.01, p[1])); }
    // the upright piano against the dividing wall: the keys, the music stand with its candle brackets, the stool
    const pa = pu0 + 1.3, pb = pa + 1.4;
    B('wood_dark', pa, pb, fy + 0.1, fy + 1.3, pv - 0.58, pv - 0.02); B('wood_dark', pa + 0.05, pb - 0.05, fy, fy + 0.1, pv - 0.5, pv - 0.1); C(pa, pb, fy, fy + 1.3, pv - 0.58, pv - 0.02);
    B('lacquer_black', pa - 0.02, pb + 0.02, fy + 0.72, fy + 0.76, pv - 0.76, pv - 0.56);          // the key shelf
    B('linen', pa + 0.04, pb - 0.04, fy + 0.76, fy + 0.785, pv - 0.74, pv - 0.58);                  // the keys
    for (let k = 0; k < 12; k++) B('lacquer_black', pa + 0.1 + k * 0.105, pa + 0.14 + k * 0.105, fy + 0.785, fy + 0.8, pv - 0.66, pv - 0.58);
    B('wood_dark', pa + 0.1, pb - 0.1, fy + 0.95, fy + 1.15, pv - 0.6, pv - 0.575); B('linen', pa + 0.3, pb - 0.3, fy + 0.98, fy + 1.12, pv - 0.605, pv - 0.6);
    for (const u of [pa + 0.12, pb - 0.12]) { B('gilt_bronze', u - 0.015, u + 0.015, fy + 0.85, fy + 0.95, pv - 0.64, pv - 0.58); }
    { const p = P((pa + pb) / 2, pv - 1.15); bag.add('wood_dark', lathe([[0.001, 0], [0.2, 0], [0.2, 0.03], [0.17, 0.03], [0.17, 0.46], [0.2, 0.46], [0.2, 0.5], [0.001, 0.5]], 12, null, p[0], fy, p[1])); C((pa + pb) / 2 - 0.2, (pa + pb) / 2 + 0.2, fy, fy + 0.5, pv - 1.35, pv - 0.95); }
    // a fireside chair by the window, the gasolier, lace
    seat(cb - 1.0, T + 0.62, 0.7, 0.7, [cb - 1.35, cb - 0.65, T + 0.27, T + 0.34], 'cloth_green', 'v');
    B('linen', wu - 0.55, wu + 0.55, y + 0.6, y + 1.5, T + 0.02, T + 0.025);
    { const p = P(pm, tv); bag.add('plaster_white', lathe([[0.25, 0], [0.2, -0.03], [0.001, -0.04]], 14, null, p[0], ceil, p[1])); bag.add('gilt_bronze', lathe([[0.012, 0], [0.012, 0.8]], 6, null, p[0], ceil - 0.8, p[1])); bag.add('lamp_glass', lathe([[0.04, 0], [0.12, 0.08], [0.1, 0.22], [0.001, 0.26]], 10, null, p[0], ceil - 1.05, p[1])); }
    for (const u of [pm - 0.5, pm + 0.5]) { B('wood_dark', u - 0.3, u + 0.3, fy + 1.45, fy + 2.05, pv - 0.04, pv - 0.015); B('linen', u - 0.24, u + 0.24, fy + 1.51, fy + 1.99, pv - 0.045, pv - 0.04); B('paint_robe', u - 0.1, u + 0.1, fy + 1.6, fy + 1.9, pv - 0.05, pv - 0.045); }
    who(cb - 1.0, T + 0.62, [cb, fv], { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_black', hat: 'none', over: 'shawl', pose: 'sit' });
  }
  function lodgingRoom() {
    // a working family's front room, living and sleeping room in one: Mayhew's costers kept "a bed, a table, chairs, a chest of drawers"
    // and crockery; the iron bedstead under the window with a patchwork quilt, the chest with its jug and basin, the table and stools,
    // the rag rug before the fire, a paraffin lamp and a candle
    const b0 = pu0 + 0.55, b1 = b0 + 1.85, bv0_ = T + 0.05, bv1_ = T + 0.95;
    for (const [u, v] of [[b0, bv0_], [b1 - 0.04, bv0_], [b0, bv1_ - 0.04], [b1 - 0.04, bv1_ - 0.04]]) B('iron', u, u + 0.04, fy, fy + (u > (b0 + b1) / 2 ? 0.6 : 0.95), v, v + 0.04);
    B('iron', b0, b0 + 0.03, fy + 0.5, fy + 0.9, bv0_, bv1_); B('iron', b1 - 0.03, b1, fy + 0.4, fy + 0.58, bv0_, bv1_);
    for (let v = bv0_ + 0.1; v < bv1_; v += 0.14) B('iron', b0, b0 + 0.02, fy + 0.5, fy + 0.9, v, v + 0.015);
    B('iron', b0, b1, fy + 0.3, fy + 0.33, bv0_, bv1_);
    B('linen', b0 + 0.04, b1 - 0.04, fy + 0.33, fy + 0.5, bv0_ + 0.02, bv1_ - 0.02);                  // the straw mattress and sheet
    for (let k = 0; k < 6; k++) B(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_indigo'][k], b0 + 0.45 + (k % 3) * 0.45 + (k > 2 ? 0 : 0), b0 + 0.9 + (k % 3) * 0.45, fy + 0.5, fy + 0.54, bv0_ + (k < 3 ? 0.0 : 0.43), bv0_ + (k < 3 ? 0.46 : 0.9));  // the patchwork quilt
    B('cloth_white', b0 + 0.05, b0 + 0.4, fy + 0.5, fy + 0.6, bv0_ + 0.1, bv1_ - 0.1);                  // the bolster
    C(b0, b1, fy, fy + 0.6, bv0_, bv1_);
    const cu = pu0 + 1.3;
    B('wood_dark', cu, cu + 0.9, fy, fy + 0.92, pv - 0.46, pv - 0.02); C(cu, cu + 0.9, fy, fy + 0.95, pv - 0.46, pv - 0.02);
    for (const yy of [0.25, 0.5, 0.75]) B('timber', cu + 0.03, cu + 0.87, fy + yy - 0.01, fy + yy + 0.01, pv - 0.475, pv - 0.46);
    { const p = P(cu + 0.3, pv - 0.25); bag.add('glaze_white', lathe([[0.001, 0], [0.1, 0], [0.12, 0.02], [0.14, 0.07], [0.001, 0.07]], 12, null, p[0], fy + 0.92, p[1])); bag.add('glaze_white', lathe([[0.001, 0], [0.05, 0], [0.065, 0.1], [0.04, 0.18], [0.001, 0.18]], 8, null, p[0], fy + 0.96, p[1])); }
    B('wood_dark', cu + 0.55, cu + 0.85, fy + 0.92, fy + 1.3, pv - 0.04, pv - 0.02); B('mirror_tin', cu + 0.58, cu + 0.82, fy + 0.96, fy + 1.26, pv - 0.045, pv - 0.04);
    // the table with two stools, a loaf and a teapot, a lamp
    const tm = pm + 0.2, tv = 3.0;
    B('timber', tm - 0.4, tm + 0.4, fy + 0.72, fy + 0.76, tv - 0.35, tv + 0.35); for (const [a, b2] of [[-0.35, -0.3], [0.35, -0.3], [-0.35, 0.3], [0.35, 0.3]]) B('wood_dark', tm + a - 0.03, tm + a + 0.03, fy, fy + 0.72, tv + b2 - 0.03, tv + b2 + 0.03);
    C(tm - 0.4, tm + 0.4, fy, fy + 0.77, tv - 0.35, tv + 0.35);
    B('hide_tan', tm - 0.3, tm - 0.05, fy + 0.76, fy + 0.84, tv - 0.1, tv + 0.1);
    { const p = P(tm + 0.15, tv); bag.add('glaze_white', lathe([[0.001, 0], [0.06, 0], [0.075, 0.06], [0.05, 0.12], [0.001, 0.12]], 8, null, p[0], fy + 0.76, p[1])); const q = P(tm + 0.3, tv + 0.2); bag.add('iron', lathe([[0.001, 0], [0.05, 0], [0.04, 0.12], [0.001, 0.14]], 8, null, q[0], fy + 0.76, q[1])); bag.add('lamp_glass', lathe([[0.025, 0], [0.05, 0.08], [0.03, 0.22], [0.001, 0.24]], 8, null, q[0], fy + 0.9, q[1])); }
    for (const sd of [-1, 1]) { const v = tv + sd * 0.55; B('wood_dark', tm - 0.17, tm + 0.17, fy + 0.4, fy + 0.44, v - 0.17, v + 0.17); for (const a of [-0.13, 0.13]) for (const b2 of [-0.13, 0.13]) B('wood_dark', tm + a - 0.02, tm + a + 0.02, fy, fy + 0.4, v + b2 - 0.02, v + b2 + 0.02); C(tm - 0.17, tm + 0.17, fy, fy + 0.44, v - 0.17, v + 0.17); }
    // the rag rug before the fire, a coal scuttle, the washing hung on a line across the window end
    B('cloth_brown', cb - 1.7, cb - 0.55, fy + 0.002, fy + 0.012, fv - 0.55, fv + 0.55); for (let k = 0; k < 4; k++) B(k % 2 ? 'cloth_red' : 'cloth_grey', cb - 1.65 + k * 0.28, cb - 1.45 + k * 0.28, fy + 0.012, fy + 0.016, fv - 0.5, fv + 0.5);
    { const p = P(cb - 0.45, fv - 0.95); bag.add('iron', lathe([[0.001, 0], [0.14, 0], [0.17, 0.2], [0.12, 0.3], [0.001, 0.3]], 8, null, p[0], fy, p[1])); C(cb - 0.65, cb - 0.25, fy, fy + 0.3, fv - 1.15, fv - 0.75); }
    B('linen', pu0 + 0.1, pu1 - 0.1, fy + 2.0, fy + 2.003, 0.9 + 0.0, 0.905);
    for (const [u, w] of [[pm - 0.9, 0.5], [pm - 0.2, 0.42], [pm + 0.55, 0.55]]) B('linen', u, u + w, fy + 1.45, fy + 2.0, 0.9, 0.93);       // shirts and a sheet on the line
    who(tm, tv - 0.55, [tm, tv], { dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_white', over: 'apron', pose: 'sit' });
    who(cb - 1.1, fv + 0.1, [cb, fv], { h: 0.95, dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_brown', hat: 'none', pose: 'lap' });
  }
  if (V === 'dining') diningRoom(); else if (V === 'lodging') lodgingRoom();
  if (V === 'parlour') who(cb - 1.2, fv + 0.9, [cb, fv], { dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_black', hat: 'none', over: 'shawl', pose: 'sit' });
  // the back room's cook at the range (the lodging's wife is in the front room with her child)
  if (V !== 'lodging') who(cb - 0.95, rv - 1.0, [cb, rv - 0.3], { dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_white', over: 'apron', pose: 'stand' });
  else { B('wood_dark', hw + 0.12, hw + 0.6, fy, fy + 0.06, bv0 + 0.2, bv0 + 0.9); { const p = P(cb - 0.9, rv + 0.95); bag.add('timber', lathe([[0.3, 0], [0.32, 0.5], [0.001, 0.5]], 14, null, p[0], fy, p[1])); } C(cb - 1.2, cb - 0.6, fy, fy + 0.5, rv + 0.65, rv + 1.25); }
}
