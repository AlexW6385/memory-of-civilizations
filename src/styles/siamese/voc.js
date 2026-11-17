// The Dutch lodge of Ayutthaya, "the Red Building" (docs/settlements/ayutthaya.md §12.3): the two-storey main building of red brick under a
// Siamese tile roof, warehouse below and dining hall above reached by a double stair, the director's and the deputy's rooms at its ends;
// the kitchen, the quarters, the billiard hall, the prison, the bamboo stables and smithy, the timber warehouse, the bamboo fence with its
// gates, the garden, the burial ground, the flagstaff, and the wharf on piles at the river. Everything is walkable; rooms are furnished.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { rectRoof } from '../ming/index.js';
import { wallSeg } from '../ptolemaic/util.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const light = (ctx, x, y, z, i = 3, d = 9) => { if (ctx.lights) ctx.lights.push({ at: [x, y, z], color: '#ffb25a', intensity: i, distance: d }); };

/** Four walls on the edges of rect; ops by side { n, s, w, e } (at from the side's start: x0 or z0), each { at, w, h, y0 (absolute) }. */
function walls(ctx, [x0, z0, x1, z1], y0, y1, th, mat, ops = {}) {
  wallSeg(ctx, [x0, z0], [x1, z0], th, y0, y1, mat, ops.n ?? []); wallSeg(ctx, [x0, z1], [x1, z1], th, y0, y1, mat, ops.s ?? []);
  wallSeg(ctx, [x0, z0], [x0, z1], th, y0, y1, mat, ops.w ?? []); wallSeg(ctx, [x1, z0], [x1, z1], th, y0, y1, mat, ops.e ?? []);
}
/** The shutters of a window thrown open against the wall outside it, on a wall along x at z, facing side (+1 south / -1 north). */
function shutters(bag, x, z, side, y, w, h, off = 0.3) {
  for (const s of [-1, 1]) bag.add('shutter_green', box(x + s * (w / 2 + 0.02) - (s > 0 ? 0 : w / 2), y, Math.min(z + side * off, z + side * (off + 0.04)), x + s * (w / 2 + 0.02) + (s > 0 ? w / 2 : 0), y + h, Math.max(z + side * off, z + side * (off + 0.04))));
}
const gableTri = (bag, mat, x, z0, z1, yb, rise, B) => {
  const zc = (z0 + z1) / 2, hw = (z1 - z0) / 2, edge = yb + rise * (1 - hw / B), apex = yb + rise - 0.2, t = [], tri = (a, b, c) => t.push(...a, ...b, ...c, ...a, ...c, ...b);
  tri([x, yb, z0], [x, yb, z1], [x, edge - 0.16, z1]); tri([x, yb, z0], [x, edge - 0.16, z1], [x, edge - 0.16, z0]);
  tri([x, edge - 0.16, z0], [x, edge - 0.16, z1], [x, apex, zc]);
  bag.add(mat, fromTriangles(t));
};
const jar = (bag, m, x, y, z, s = 1) => bag.add(m, lathe([[0.001, 0], [0.15 * s, 0], [0.22 * s, 0.2 * s], [0.18 * s, 0.38 * s], [0.1 * s, 0.46 * s], [0.12 * s, 0.5 * s]], 8, null, x, y, z));
const chair = (bag, col, x, z, y, face) => { // a high-backed chair facing `face` (0 north, 1 south, 2 west, 3 east)
  const ax = face > 1, sg = face % 2 ? 1 : -1;
  bag.add('timber', box(x - 0.23, y + 0.44, z - 0.23, x + 0.23, y + 0.5, z + 0.23));
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('timber', box(x + a * 0.2 - 0.025, y, z + b * 0.2 - 0.025, x + a * 0.2 + 0.025, y + 0.44, z + b * 0.2 + 0.025));
  if (ax) bag.add('timber', box(x - sg * 0.23 - 0.03, y + 0.5, z - 0.23, x - sg * 0.23 + 0.03, y + 1.15, z + 0.23)); else bag.add('timber', box(x - 0.23, y + 0.5, z - sg * 0.23 - 0.03, x + 0.23, y + 1.15, z - sg * 0.23 + 0.03));
  bag.add('leather_bench', ax ? box(x - sg * 0.2 - 0.02, y + 0.62, z - 0.18, x - sg * 0.2 + 0.02, y + 1.05, z + 0.18) : box(x - 0.18, y + 0.62, z - sg * 0.2 - 0.02, x + 0.18, y + 1.05, z - sg * 0.2 + 0.02));
  col.circle(x, z, 0.3, y, y + 0.55);
};
const table = (bag, col, x0, z0, x1, z1, y, h = 0.78) => {
  bag.add('timber', box(x0, y + h - 0.06, z0, x1, y + h, z1));
  for (const [x, z] of [[x0 + 0.12, z0 + 0.12], [x1 - 0.12, z0 + 0.12], [x0 + 0.12, z1 - 0.12], [x1 - 0.12, z1 - 0.12]]) bag.add('wood_dark', box(x - 0.05, y, z - 0.05, x + 0.05, y + h - 0.06, z + 0.05));
  col.rect([x0, z0, x1, z1], y, y + h);
};
const bed = (bag, col, x, z, y, along) => { // a curtained bed, its head toward -along… the head at the wall (z-), 2.0 long
  bag.add('timber_red', box(x - 0.75, y + 0.25, z, x + 0.75, y + 0.45, z + 2.0)); bag.add('cloth_white', box(x - 0.7, y + 0.45, z + 0.1, x + 0.7, y + 0.62, z + 1.95)); bag.add('cloth_blue', box(x - 0.7, y + 0.62, z + 1.0, x + 0.7, y + 0.68, z + 1.95)); bag.add('cloth_white', box(x - 0.55, y + 0.62, z + 0.15, x + 0.55, y + 0.78, z + 0.6));
  for (const [a, b] of [[-1, 0], [1, 0], [-1, 2.0], [1, 2.0]]) bag.add('wood_dark', box(x + a * 0.72 - 0.05, y, z + b - (b ? 0.1 : 0), x + a * 0.72 + 0.05, y + (b ? 0.25 : 2.0), z + b + (b ? 0 : 0.1)));
  bag.add('cloth_red', box(x - 0.8, y + 1.2, z + 0.02, x + 0.8, y + 2.0, z + 0.07)); bag.add('timber_red', box(x - 0.8, y + 1.95, z, x + 0.8, y + 2.0, z + 0.4));
  col.rect([x - 0.78, z, x + 0.78, z + 2.0], y, y + 0.7); void along;
};
const chest = (bag, col, x0, z0, x1, z1, y) => { bag.add('timber_red', box(x0, y, z0, x1, y + 0.55, z1)); bag.add('iron', box(x0 - 0.01, y + 0.2, z0 - 0.01, x1 + 0.01, y + 0.26, z1 + 0.01)); bag.add('timber_red', box(x0 - 0.02, y + 0.55, z0 - 0.02, x1 + 0.02, y + 0.62, z1 + 0.02)); col.rect([x0, z0, x1, z1], y, y + 0.62); };
const lamp = (bag, x, y, z) => { bag.add('rope_fibre', rod([x, y + 0.3, z], [x, y + 0.7, z], 0.008, 3)); bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.04], [0.13, 0.15], [0.09, 0.27], [0.001, 0.3]], 8, null, x, y, z)); };

/** A room's clerk's corner or a captain's cabin: desk, chair, ledger, inkwell, a shelf of books. */
function study(ctx, x, z, y, wallZ, faceSouth) {
  const { bag, col } = ctx, sg = faceSouth ? 1 : -1;
  table(bag, col, x - 0.8, z - 0.4, x + 0.8, z + 0.4, y, 0.76);
  bag.add('cloth_black', box(x - 0.35, y + 0.76, z - 0.22, x + 0.0, y + 0.8, z + 0.2)); bag.add('cloth_white', box(x + 0.0, y + 0.76, z - 0.22, x + 0.35, y + 0.785, z + 0.2));
  bag.add('glaze_blue', lathe([[0.001, 0], [0.05, 0], [0.05, 0.08], [0.001, 0.08]], 6, null, x + 0.55, y + 0.76, z)); bag.add('timber', rod([x + 0.5, y + 0.84, z - 0.05], [x + 0.62, y + 1.15, z - 0.1], 0.01, 3));
  chair(bag, col, x, z + sg * 0.75, y, faceSouth ? 0 : 1);
  const r = rng(Math.floor(x * 7 + z)), books = ['cloth_brown', 'cloth_red', 'cloth_black', 'cloth_green', 'cloth_ochre'];
  for (let sh = 0; sh < 2; sh++) { bag.add('timber', box(x - 1.0, y + 1.3 + sh * 0.6, wallZ, x + 1.0, y + 1.34 + sh * 0.6, wallZ + 0.3 * -sg * -1)); for (let b = 0; b < 12; b++) bag.add(books[Math.floor(r() * 5)], box(x - 0.95 + b * 0.16, y + 1.34 + sh * 0.6, wallZ + 0.04 * -sg * -1, x - 0.82 + b * 0.16, y + 1.34 + sh * 0.6 + 0.2 + r() * 0.12, wallZ + 0.24 * -sg * -1)); }
}

// ── the main building ─────────────────────────────────────────────────────────────────────────────────────────────
/** voc_lodge: { rect [x0, z0, x1, z1] (front to the south, long along x) } */
function lodge(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, F = 3.7, T = F + 3.2, th = 0.6, L = x1 - x0, r = rng(el.seed ?? 5);
  const upW = (n, y = F + 0.9) => ({ at: n, w: 1.1, h: 1.55, y0: y });
  const front = [{ at: L / 2, w: 2.4, h: 2.7, y0: F }], back = [{ at: L / 2, w: 1.4, h: 2.1, y0: F }];
  const grd = [{ at: 4.7, w: 2.4, h: 2.8, y0: 0 }, { at: 29.9, w: 2.4, h: 2.8, y0: 0 }];
  for (let k = 0; k < 9; k++) { const a = 2.6 + k * 4.2; if (Math.abs(a - L / 2) > 1.9) front.push(upW(a)); if (Math.abs(a - L / 2) > 1.4) back.push(upW(a)); }
  const gwin = [8.9, 13.1, 17.3, 21.5, 25.7, 34.1].map((a) => ({ at: a, w: 0.6, h: 0.8, y0: 1.9 }));
  grd.push(...gwin);
  wallSeg(ctx, [x0, z1], [x1, z1], th, 0, T, 'brick', [...front, ...grd]);
  wallSeg(ctx, [x0, z0], [x1, z0], th, 0, T, 'brick', [...back, ...gwin, { at: 29.9, w: 0.6, h: 0.8, y0: 1.9 }, { at: 4.7, w: 0.6, h: 0.8, y0: 1.9 }]);
  const gw = [{ at: (z1 - z0) / 2, w: 1.0, h: 1.5, y0: F + 0.9 }];
  wallSeg(ctx, [x0, z0], [x0, z1], th, 0, T, 'brick', gw); wallSeg(ctx, [x1, z0], [x1, z1], th, 0, T, 'brick', gw);
  // string courses of lime plaster at the floor and under the eaves, a dark foot, the quoins
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]]]) { bag.add('lime_plaster', box(a[0] - 0.4, F - 0.2, a[1] - th / 2 - 0.05, b[0] + 0.4, F + 0.08, b[1] + th / 2 + 0.05)); bag.add('lime_plaster', box(a[0] - 0.4, T - 0.2, a[1] - th / 2 - 0.08, b[0] + 0.4, T, b[1] + th / 2 + 0.08)); bag.add('plaster_damp', box(a[0] - 0.4, 0, a[1] - th / 2 - 0.03, b[0] + 0.4, 0.8, b[1] + th / 2 + 0.03)); }
  for (const x of [x0, x1]) { bag.add('lime_plaster', box(x - th / 2 - 0.05, F - 0.2, z0 - 0.3, x + th / 2 + 0.05, F + 0.08, z1 + 0.3)); bag.add('lime_plaster', box(x - th / 2 - 0.08, T - 0.2, z0 - 0.3, x + th / 2 + 0.08, T, z1 + 0.3)); }
  for (const x of [x0, x1]) for (const z of [z0, z1]) bag.add('lime_plaster', box(x - 0.42, 0, z - 0.42, x + 0.42, T - 0.2, z + 0.42));
  for (const w of front) if (w.y0 > F + 0.5 && w.h < 2) { const x = x0 + w.at; bag.add('lime_plaster', box(x - 0.7, F + 0.82, z1 - 0.36, x + 0.7, F + 0.9, z1 + 0.4)); bag.add('lime_plaster', box(x - 0.7, F + 2.45, z1 - 0.36, x + 0.7, F + 2.58, z1 + 0.34)); shutters(bag, x, z1, 1, F + 0.95, 1.1, 1.5); }
  for (const w of back) if (w.y0 > F + 0.5 && w.h < 2 && w.w > 1) { const x = x0 + w.at; shutters(bag, x, z0, -1, F + 0.95, 1.1, 1.5); }
  for (const w of grd) if (w.w < 1) { const x = x0 + w.at; for (let b = 0; b < 4; b++) bag.add('iron', box(x - 0.27 + b * 0.18, 1.9, z1 + 0.28, x - 0.25 + b * 0.18, 2.7, z1 + 0.3)); }
  // gable ends, roof
  gableTri(bag, 'brick', x0, z0 - th / 2, z1 + th / 2, T, 3.4, (z1 - z0) / 2 + 0.9); gableTri(bag, 'brick', x1, z0 - th / 2, z1 + th / 2, T, 3.4, (z1 - z0) / 2 + 0.9);
  rectRoof({ c: [cx, cz], A: L / 2 + 0.5, B: (z1 - z0) / 2 + 0.9, y: T, rise: 3.4, kind: 'gable', sweep: 0, curl: false, p: 1.0, mat: 'roof_tile', soffit: 'timber' }, bag);
  bag.add('timber_red', box(x0 - 0.5, T + 3.4 - 0.1, cz - 0.12, x1 + 0.5, T + 3.4 + 0.12, cz + 0.12));
  // the ceilings and floors
  bag.add('timber', box(x0 + 0.3, T - 0.18, z0 + 0.3, x1 - 0.3, T - 0.1, z1 - 0.3));
  for (let x = x0 + 1.5; x < x1; x += 1.6) bag.add('wood_dark', box(x - 0.1, F - 0.46, z0 + 0.3, x + 0.1, F - 0.2, z1 - 0.3));
  bag.add('timber', box(x0 + 0.3, F - 0.2, z0 + 0.3, x1 - 0.3, F, z1 - 0.3)); col.floor([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], F);
  bag.add('brick_paving', box(x0 + 0.3, -0.03, z0 + 0.3, x1 - 0.3, 0.04, z1 - 0.3)); col.floor([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], 0.04);
  // ── the double stair: two flights along the front rising to a landing before the dining hall's door, 20 steps each
  const n = 20, rise = F / n, run = 0.36, lw = 1.9, lx0 = cx - lw, lx1 = cx + lw, zs0 = z1 + th / 2 + 0.05, zs1 = zs0 + 2.1;
  for (const s of [-1, 1]) for (let i = 0; i < n - 1; i++) {
    const a = s < 0 ? lx0 - (n - 1 - i) * run : lx1 + i * run, rr = s < 0 ? [a, zs0, a + run + 0.01, zs1] : [a, zs0, a + run + 0.01, zs1];
    const hh = s < 0 ? rise * (i + 1) : rise * (n - 1 - i);
    bag.add('brick', box(rr[0], 0, rr[1], rr[2], hh, rr[3])); bag.add('lime_plaster', box(rr[0], hh - 0.04, rr[1], rr[2], hh, rr[3]));
  }
  col.ramp([lx0 - (n - 1) * run, zs0, lx0, zs1], 0, F - rise, 'e'); col.ramp([lx1, zs0, lx1 + (n - 1) * run, zs1], 0, F - rise, 'w');
  const zl1 = zs1 + 1.2;
  bag.add('timber', box(lx0, F - 0.3, zs0, lx1, F - 0.04, zl1)); col.floor([lx0, zs0, lx1, zl1], F);
  for (const [px, pz] of [[lx0 + 0.25, zl1 - 0.25], [lx1 - 0.25, zl1 - 0.25]]) { bag.add('brick', box(px - 0.25, 0, pz - 0.25, px + 0.25, F - 0.3, pz + 0.25)); col.rect([px - 0.25, pz - 0.25, px + 0.25, pz + 0.25], 0, F); }
  bag.add('brick', box(lx0, 0, zs0, lx0 + 0.3, F - 0.3, zs1)); bag.add('brick', box(lx1 - 0.3, 0, zs0, lx1, F - 0.3, zs1));
  // balustrades: timber rail along the flights' outer side and round the landing
  for (const s of [-1, 1]) { const a = s < 0 ? lx0 - (n - 1) * run : lx1, b = s < 0 ? lx0 : lx1 + (n - 1) * run; bag.add('timber', rod(s < 0 ? [a, 1.0, zs1 - 0.05] : [a, F + 0.9 - 0.0, zs1 - 0.05], s < 0 ? [b, F + 0.9, zs1 - 0.05] : [b, 1.0, zs1 - 0.05], 0.035, 4)); const pt = [[a, zs1 - 0.05], [b, zs1 - 0.05]]; for (let k = 0; k <= 5; k++) { const t = k / 5, x = pt[0][0] + (pt[1][0] - pt[0][0]) * t, yh = s < 0 ? 1.0 + (F - 0.1) * t : F + 0.9 - (F - 0.1) * t + 0.0; bag.add('timber', rod([x, yh - 0.9, zs1 - 0.05], [x, yh, zs1 - 0.05], 0.03, 4)); } }
  bag.add('timber', rod([lx0, F + 0.9, zl1], [lx1, F + 0.9, zl1], 0.035, 4)); bag.add('timber', rod([lx0, F + 0.9, zl1], [lx0, F + 0.9, zs1], 0.035, 4)); bag.add('timber', rod([lx1, F + 0.9, zl1], [lx1, F + 0.9, zs1], 0.035, 4));
  for (const [px, pz] of [[lx0, zl1], [lx1, zl1]]) bag.add('timber', rod([px, F, pz], [px, F + 0.9, pz], 0.04, 4));
  col.segment([lx0, zl1], [lx1, zl1], 0.1, F, F + 0.95); col.segment([lx0, zl1], [lx0, zs1], 0.1, F, F + 0.95); col.segment([lx1, zl1], [lx1, zs1], 0.1, F, F + 0.95);
  // the door's pediment of lime plaster over the hall's door and the Company's arms (a lion on a shield: a gilt board)
  bag.add('lime_plaster', box(cx - 1.5, F + 2.7, z1 - 0.38, cx + 1.5, F + 2.95, z1 + 0.42)); bag.add('clay_gilt', box(cx - 0.45, F + 2.95, z1 + 0.3, cx + 0.45, F + 3.0 + 0.7, z1 + 0.38)); bag.add('cloth_red', box(cx - 0.3, F + 3.05, z1 + 0.38, cx + 0.3, F + 3.55, z1 + 0.4));
  // ── upstairs: partitions, the hall, the two chambers
  const px0 = cx - 8.0, px1 = cx + 8.0, dz = (z0 + z1) / 2;
  for (const px of [px0, px1]) wallSeg(ctx, [px, z0 + 0.3], [px, z1 - 0.3], 0.22, F, T - 0.18, 'planks_grey', [{ at: (z1 - z0) / 2 - 0.3, w: 1.3, h: 2.3, y0: F }]);
  // the hall: a long table with chairs, a sideboard of blue-and-white and pewter, a map, a chandelier, the Company's flag in the corner
  table(bag, col, cx - 3.4, dz - 0.55, cx + 3.4, dz + 0.55, F, 0.78);
  bag.add('cloth_white', box(cx - 3.1, F + 0.78, dz - 0.3, cx + 3.1, F + 0.8, dz + 0.3));
  for (let k = 0; k < 5; k++) { const x = cx - 2.8 + k * 1.4; chair(bag, col, x, dz - 0.95, F, 1); chair(bag, col, x, dz + 0.95, F, 0); }
  chair(bag, col, cx - 3.9, dz, F, 3); chair(bag, col, cx + 3.9, dz, F, 2);
  for (let k = 0; k < 6; k++) { const x = cx - 2.5 + k * 1.0; bag.add('glaze_white', lathe([[0.001, 0], [0.13, 0], [0.17, 0.03], [0.001, 0.03]], 8, null, x, F + 0.8, dz + (k % 2 ? 0.15 : -0.15))); }
  for (const x of [cx - 1.5, cx + 0.3, cx + 1.9]) { bag.add('silver', lathe([[0.001, 0], [0.06, 0], [0.07, 0.2], [0.05, 0.28], [0.08, 0.3]], 7, null, x, F + 0.8, dz)); }
  for (const x of [cx - 0.6, cx + 1.0]) { bag.add('cloth_white', lathe([[0.025, 0], [0.025, 0.2]], 5, null, x, F + 0.8, dz + 0.2)); bag.add('flame', lathe([[0.001, 0.2], [0.012, 0.24], [0.001, 0.3]], 4, null, x, F + 0.8, dz + 0.2)); }
  bag.add('timber', box(cx - 3.0, F, z0 + 0.35, cx + 3.0, F + 0.95, z0 + 1.0)); col.rect([cx - 3.0, z0 + 0.35, cx + 3.0, z0 + 1.0], F, F + 0.95); bag.add('wood_dark', box(cx - 3.05, F + 0.95, z0 + 0.33, cx + 3.05, F + 1.0, z0 + 1.02));
  for (let k = 0; k < 6; k++) { const x = cx - 2.5 + k * 1.0; if (k % 3 === 1) bag.add('silver', lathe([[0.001, 0], [0.09, 0], [0.1, 0.25], [0.06, 0.34]], 8, null, x, F + 1.0, z0 + 0.68)); else jar(bag, k % 2 ? 'glaze_blue' : 'glaze_white', x, F + 1.0, z0 + 0.68, 1.4); }
  bag.add('timber', box(cx - 1.2, F + 1.6, z0 + 0.3, cx + 1.2, F + 3.0, z0 + 0.38)); bag.add('paint_ochre', box(cx - 1.1, F + 1.7, z0 + 0.38, cx + 1.1, F + 2.9, z0 + 0.4)); bag.add('paint_blue', box(cx - 0.9, F + 1.9, z0 + 0.4, cx + 0.2, F + 2.7, z0 + 0.41)); bag.add('paint_blue', box(cx + 0.3, F + 2.2, z0 + 0.4, cx + 0.8, F + 2.4, z0 + 0.41));
  { const x = cx, y = T - 0.2; bag.add('rope_fibre', rod([x, y, dz], [x, y - 0.8, dz], 0.012, 3)); bag.add('bronze', lathe([[0.04, 0], [0.5, -0.1], [0.5, -0.04], [0.04, 0.06]], 10, null, x, y - 1.0, dz));
    for (let a = 0; a < 6; a++) { const px = x + Math.cos(a / 6 * 6.28) * 0.5, pz = dz + Math.sin(a / 6 * 6.28) * 0.5; bag.add('cloth_white', lathe([[0.02, 0], [0.02, 0.18]], 5, null, px, y - 1.0, pz)); bag.add('flame', lathe([[0.001, 0.18], [0.011, 0.22], [0.001, 0.28]], 4, null, px, y - 1.0, pz)); }
    light(ctx, x, y - 0.6, dz, 6, 13); }
  { const fx = px1 - 0.5, fz = z1 - 0.7; bag.add('timber', lathe([[0.04, 0], [0.03, 2.6]], 5, null, fx, F, fz)); const t = [], tri = (a, b, c) => t.push(...a, ...b, ...c, ...a, ...c, ...b);
    for (const [k, m] of [[0, 'cloth_ochre'], [1, 'cloth_white'], [2, 'cloth_blue']]) { const tt = []; const yy = F + 2.55 - k * 0.2; tri([fx, yy, fz - 0.9], [fx, yy, fz], [fx, yy - 0.2, fz]); tt.push(...t); t.length = 0; tri([fx, yy, fz - 0.9], [fx, yy - 0.2, fz], [fx, yy - 0.2, fz - 0.9]); tt.push(...t); t.length = 0; bag.add(m, fromTriangles(tt)); } }
  // the director's room (west) and the deputy's (east): bed, desk with its ledger, a chest, a lamp
  for (const [k, px] of [[0, x0 + 0.3], [1, px1]]) {
    const ex = k ? px + 0.9 : px + 1.2, sg = k ? 1 : 1;
    bed(bag, col, k ? x1 - 1.5 : x0 + 1.5, z0 + 0.35, F, 0); void ex; void sg;
    study(ctx, k ? x1 - 4.2 : x0 + 4.4, z0 + 1.6, F, z0 + 0.35, true);
    chest(bag, col, k ? x1 - 3.0 : x0 + 2.4, z1 - 1.5, k ? x1 - 1.9 : x0 + 3.5, z1 - 0.8, F);
    lamp(bag, k ? x1 - 3.3 : x0 + 4.4, F + 1.8, dz + 0.2); light(ctx, k ? x1 - 3.3 : x0 + 4.4, F + 1.7, dz + 0.2, 3.5, 9);
    bag.add('cloth_maroon', box(k ? x1 - 4.6 : x0 + 3.9, F + 0.01, dz - 0.9, k ? x1 - 2.2 : x0 + 6.3, F + 0.03, dz + 1.1));
  }
  // ── downstairs, the warehouse: a row of posts, the Company's goods in stacks along the walls, a weighing beam, the clerk's desk
  for (let x = x0 + 5; x < x1 - 2; x += 6) { bag.add('wood_dark', lathe([[0.2, 0], [0.17, F - 0.3]], 6, null, x, 0, cz)); col.circle(x, cz, 0.22, 0, F); }
  const stack = (x, z, kind, sz) => {
    if (kind === 0) { for (let l = 0; l < 6; l++) bag.add(l % 2 ? 'hide_tan' : 'hide_brown', box(x - 0.55, l * 0.16, z - 0.4, x + 0.55, l * 0.16 + 0.15, z + 0.4)); bag.add('rope_fibre', box(x - 0.56, 0.3, z - 0.02, x + 0.56, 0.34, z + 0.02)); col.rect([x - 0.56, z - 0.41, x + 0.56, z + 0.41], 0, 1.0); }
    else if (kind === 1) { for (let l = 0; l < 3; l++) for (let m = 0; m < 4 - l; m++) bag.add('wood_dark', rod([x - 0.9 + l * 0.2 + m * 0.4 - 0.2, 0.15 + l * 0.28, z - sz / 2], [x - 0.9 + l * 0.2 + m * 0.4 - 0.2, 0.15 + l * 0.28, z + sz / 2], 0.14, 6)); col.rect([x - 1.1, z - sz / 2, x + 1.1, z + sz / 2], 0, 0.8); }
    else if (kind === 2) { for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) bag.add('sacking', lathe([[0.2, 0], [0.26, 0.15], [0.22, 0.35], [0.001, 0.4]], 7, null, x - 0.5 + a * 0.5, c * 0.38, z - 0.25 + b * 0.5)); col.rect([x - 0.8, z - 0.5, x + 0.8, z + 0.5], 0, 0.9); }
    else if (kind === 3) { for (let a = 0; a < 3; a++) { bag.add('timber', lathe([[0.3, 0], [0.34, 0.3], [0.3, 0.6], [0.001, 0.6]], 9, null, x + a * 0.7, 0, z)); bag.add('iron', lathe([[0.31, 0.15], [0.31, 0.19]], 9, null, x + a * 0.7, 0, z)); } col.rect([x - 0.4, z - 0.4, x + 2.0, z + 0.4], 0, 0.7); }
    else { bag.add('timber_red', box(x - 0.5, 0, z - 0.3, x + 0.5, 0.55, z + 0.3)); bag.add('iron', box(x - 0.51, 0.2, z - 0.31, x + 0.51, 0.26, z + 0.31)); bag.add('timber_red', box(x - 0.52, 0.55, z - 0.32, x + 0.52, 0.62, z + 0.32)); bag.add('timber_red', box(x - 0.45, 0.62, z - 0.25, x + 0.45, 1.1, z + 0.25)); col.rect([x - 0.52, z - 0.32, x + 0.52, z + 0.32], 0, 1.1); }
  };
  for (let k = 0; k < 8; k++) { const x = x0 + 2.0 + k * 4.5, kind = k % 5; stack(kind === 3 ? x - 0.6 : x, z0 + 1.2 + (kind === 1 ? 0.2 : 0), kind, 2.0); }
  for (let k = 0; k < 6; k++) { const x = x0 + 8 + k * 4.5; if (Math.abs(x - x0 - 6) < 2.6 || Math.abs(x - (x1 - 6)) < 2.6) continue; stack(x, z1 - 1.0, [2, 0, 4, 2, 0, 4][k], 1.0); }
  { const x = cx + 5.5, z = cz; bag.add('timber', lathe([[0.1, 0], [0.07, 2.4]], 6, null, x - 0.8, 0, z)); bag.add('timber', lathe([[0.1, 0], [0.07, 2.4]], 6, null, x + 0.8, 0, z)); bag.add('timber', rod([x - 0.85, 2.3, z], [x + 0.85, 2.3, z], 0.04, 5)); bag.add('timber', rod([x, 2.3, z], [x, 1.9, z], 0.03, 4)); bag.add('iron', rod([x - 0.7, 1.9, z], [x + 0.7, 1.9, z], 0.02, 4)); for (const s of [-1, 1]) { bag.add('bronze', lathe([[0.001, 0], [0.24, 0.05], [0.2, 0.1]], 8, null, x + s * 0.7, 1.45, z)); for (const a of [-1, 1]) bag.add('rope_fibre', rod([x + s * 0.7, 1.9, z], [x + s * 0.7 + a * 0.2, 1.52, z], 0.005, 3)); } col.circle(x - 0.8, z, 0.14, 0, 2.4); col.circle(x + 0.8, z, 0.14, 0, 2.4); bag.add('iron', lathe([[0.001, 0], [0.15, 0], [0.15, 0.3], [0.001, 0.3]], 7, null, x + 1.6, 0, z + 0.3)); col.circle(x + 1.6, z + 0.3, 0.17, 0, 0.3); }
  { const x = x0 + 22, z = z0 + 1.8; table(bag, col, x - 0.7, z - 0.4, x + 0.7, z + 0.4, 0, 0.9); bag.add('cloth_black', box(x - 0.4, 0.9, z - 0.25, x + 0.0, 0.94, z + 0.2)); bag.add('timber', box(x + 0.25, 0.9, z - 0.2, x + 0.6, 0.93, z + 0.3)); chair(bag, col, x, z + 0.8, 0, 0); lamp(bag, x - 0.5, 1.9, z + 0.1); light(ctx, x - 0.5, 1.9, z + 0.1, 3, 8); }
  light(ctx, x0 + 6, 2.4, cz, 2.5, 9); light(ctx, x1 - 6, 2.4, cz, 2.5, 9); void r;
}

// ── the smaller buildings ─────────────────────────────────────────────────────────────────────────────────────────
/** voc_house: { rect, kind ('quarters' | 'kitchen' | 'billiard' | 'prison'), door ('n'|'s'|'e'|'w'), seed } a one-storey brick building under a tile roof. */
function house(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = el.kind === 'billiard' ? 4.2 : 3.4, th = 0.45, k = el.kind, side = el.door ?? 's';
  const Lx = x1 - x0, Lz = z1 - z0, ops = { n: [], s: [], w: [], e: [] };
  const win = (arr, len, a, w = 0.9, h = 1.3, y = 1.1) => arr.push({ at: a, w, h, y0: y });
  const nWin = (len, step) => Math.max(1, Math.floor((len - 2.4) / step));
  const sides = { n: Lx, s: Lx, w: Lz, e: Lz };
  for (const sd of ['n', 's', 'w', 'e']) {
    const len = sides[sd], nn = k === 'prison' ? 1 : nWin(len, k === 'billiard' ? 2.3 : 3.2);
    if (sd === side) ops[sd].push({ at: len / 2, w: k === 'prison' ? 0.9 : 1.3, h: 2.3, y0: 0 });
    for (let i = 0; i < nn; i++) { const a = len * (i + 0.5) / nn; if (sd === side && Math.abs(a - len / 2) < 1.4) continue; if (k === 'kitchen' && sd !== side && i % 2) continue; win(ops[sd], len, a, k === 'prison' ? 0.4 : 0.9, k === 'prison' ? 0.5 : k === 'billiard' ? 1.9 : 1.3, k === 'billiard' ? 1.1 : 1.3); }
  }
  walls(ctx, [x0, z0, x1, z1], 0, H, th, 'brick', ops);
  bag.add('plaster_damp', box(x0 - th / 2 - 0.02, 0, z0 - th / 2 - 0.02, x1 + th / 2 + 0.02, 0.7, z1 + th / 2 + 0.02)); void cx; void cz;
  bag.add('lime_plaster', box(x0 - th / 2 - 0.06, H - 0.2, z0 - th / 2 - 0.06, x1 + th / 2 + 0.06, H, z1 + th / 2 + 0.06));
  bag.add('brick_paving', box(x0, -0.03, z0, x1, 0.04, z1)); col.floor([x0, z0, x1, z1], 0.04);
  bag.add('timber', box(x0 + 0.1, H - 0.18, z0 + 0.1, x1 - 0.1, H - 0.1, z1 - 0.1));
  // the roof: ridge along the longer side; the gable ends closed in brick
  const long = Lx >= Lz, B = (long ? Lz : Lx) / 2 + 0.6, rise = B * 0.62;
  rectRoof({ c: [cx, cz], A: (long ? Lx : Lz) / 2 + 0.5, B, y: H, rise, kind: 'gable', sweep: 0, curl: false, p: 1.0, alongZ: !long, mat: 'roof_tile', soffit: 'timber' }, bag);
  if (long) for (const x of [x0, x1]) gableTri(bag, 'brick', x, z0 - th / 2, z1 + th / 2, H, rise, B); else for (const z of [z0, z1]) {
    const t = [], tri = (a, b, c) => t.push(...a, ...b, ...c, ...a, ...c, ...b), hw = (x1 - x0) / 2 + th / 2, edge = H + rise * (1 - hw / B) - 0.16;
    tri([x0 - th / 2, H, z], [x1 + th / 2, H, z], [x1 + th / 2, edge, z]); tri([x0 - th / 2, H, z], [x1 + th / 2, edge, z], [x0 - th / 2, edge, z]); tri([x0 - th / 2, edge, z], [x1 + th / 2, edge, z], [cx, H + rise - 0.2, z]); bag.add('brick', fromTriangles(t)); }
  // shutters or bars at the windows
  for (const sd of ['n', 's']) for (const o of ops[sd]) if (o.y0 > 0.5) { const x = x0 + o.at, z = sd === 's' ? z1 : z0, sg = sd === 's' ? 1 : -1; if (k === 'prison') for (let b = 0; b < 3; b++) bag.add('iron', box(x - 0.15 + b * 0.15, o.y0, z + sg * 0.25, x - 0.13 + b * 0.15, o.y0 + o.h, z + sg * 0.27)); else shutters(bag, x, z, sg, o.y0, o.w, o.h, th / 2); }
  const dxy = side === 's' ? [cx, z1 + 0.6] : side === 'n' ? [cx, z0 - 0.6] : side === 'e' ? [x1 + 0.6, cz] : [x0 - 0.6, cz];
  bag.add('lime_plaster', box(dxy[0] - (side === 'n' || side === 's' ? 0.2 : 0.0) - 0.0, 0, dxy[1] - 0.0, dxy[0] + 0.0, 0.0, dxy[1] + 0.0)); // (the step is the threshold of the wall itself)
  const r = rng(el.seed ?? 3);
  const inner = [x0 + th / 2 + 0.1, z0 + th / 2 + 0.1, x1 - th / 2 - 0.1, z1 - th / 2 - 0.1];
  if (k === 'billiard') {
    // the troktafel: a heavy table with a green cloth, rails, six pockets, a rack of cues on the wall, benches, lamps
    const tx = cx, tz = cz, w = 2.0, l = 3.8;
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('wood_dark', box(tx + a * (w / 2 - 0.2) - 0.15, 0, tz + b * (l / 2 - 0.2) - 0.15, tx + a * (w / 2 - 0.2) + 0.15, 0.82, tz + b * (l / 2 - 0.2) + 0.15));
    bag.add('wood_dark', box(tx - w / 2, 0.82, tz - l / 2, tx + w / 2, 0.95, tz + l / 2)); bag.add('cloth_green', box(tx - w / 2 + 0.15, 0.95, tz - l / 2 + 0.15, tx + w / 2 - 0.15, 0.97, tz + l / 2 - 0.15));
    for (const [a, b, ww, ll] of [[-w / 2, -l / 2, 0.15, l], [w / 2 - 0.15, -l / 2, 0.15, l], [-w / 2, -l / 2, w, 0.15], [-w / 2, l / 2 - 0.15, w, 0.15]]) bag.add('timber_red', box(tx + a, 0.95, tz + b, tx + a + ww, 1.05, tz + b + ll));
    for (let b = 0; b < 3; b++) bag.add('cloth_white', lathe([[0.001, 0], [0.03, 0.01], [0.001, 0.06]], 6, null, tx - 0.2 + b * 0.2, 0.97, tz + 0.3 + (b % 2) * 0.15));
    col.rect([tx - w / 2, tz - l / 2, tx + w / 2, tz + l / 2], 0, 1.05);
    for (let c = 0; c < 4; c++) bag.add('timber', rod([inner[0] + 0.12 + c * 0.14, 0.9, inner[1] + 0.08], [inner[0] + 0.14 + c * 0.14, 2.2, inner[1] + 0.08], 0.012, 4)); bag.add('timber', box(inner[0] + 0.05, 0.85, inner[1] + 0.05, inner[0] + 0.7, 0.9, inner[1] + 0.2));
    for (const z of [cz - 2.6, cz + 2.6]) { bag.add('timber', box(x0 + 0.6, 0, z - 0.2, x0 + 3.6, 0.45, z + 0.2)); col.rect([x0 + 0.6, z - 0.2, x0 + 3.6, z + 0.2], 0, 0.5); }
    lamp(bag, cx, H - 0.8, cz); light(ctx, cx, H - 0.8, cz, 4, 10);
  } else if (k === 'kitchen') {
    // the hearth of brick with a hood, pots, a table, a rack of dishes, a water jar, firewood, a mortar
    const hx = x0 + 1.2, hz = z0 + 0.9; bag.add('brick', box(hx - 1.0, 0, hz - 0.6, hx + 1.0, 0.8, hz + 0.6)); col.rect([hx - 1.0, hz - 0.6, hx + 1.0, hz + 0.6], 0, 0.85);
    bag.add('iron', box(hx - 0.8, 0.8, hz - 0.4, hx + 0.8, 0.84, hz + 0.4)); bag.add('iron', lathe([[0.001, 0], [0.3, 0.02], [0.34, 0.2], [0.3, 0.3]], 9, null, hx - 0.3, 0.84, hz)); bag.add('pottery_dark', lathe([[0.001, 0], [0.24, 0.02], [0.28, 0.2], [0.2, 0.3]], 9, null, hx + 0.4, 0.84, hz));
    bag.add('brick', box(hx - 0.8, 0.84, hz - 0.55, hx + 0.8, 2.6, hz - 0.35)); bag.add('flame', box(hx - 0.3, 0.88, hz - 0.1, hx + 0.1, 1.0, hz + 0.1));
    light(ctx, hx, 1.2, hz + 0.6, 3, 7);
    table(bag, col, cx - 0.2, cz - 0.5, cx + 1.8, cz + 0.5, 0, 0.9);
    for (let i = 0; i < 4; i++) jar(bag, i % 2 ? 'terracotta' : 'pottery_dark', x1 - 1.0 - (i % 2) * 0.5, 0, z0 + 0.8 + i * 0.6, 1.5);
    for (let i = 0; i < 6; i++) bag.add('timber', rod([x0 + 0.9 + (i % 3) * 0.2, 0.2 + (i % 2) * 0.18, z1 - 0.7 - Math.floor(i / 3) * 0.2], [x0 + 2.2 + (i % 3) * 0.2, 0.2 + (i % 2) * 0.18, z1 - 0.7 - Math.floor(i / 3) * 0.2], 0.05, 5));
    bag.add('timber', box(x1 - 2.2, 1.5, z1 - 0.7, x1 - 0.4, 1.55, z1 - 0.3)); for (let i = 0; i < 5; i++) bag.add(i % 2 ? 'glaze_white' : 'glaze_blue', lathe([[0.001, 0], [0.12, 0], [0.16, 0.03], [0.001, 0.03]], 8, null, x1 - 2.0 + i * 0.35, 1.55, z1 - 0.5));
  } else if (k === 'prison') {
    bag.add('timber', box(inner[0] + 0.2, 0, inner[1] + 0.2, inner[0] + 2.0, 0.35, inner[1] + 0.9)); bag.add('reed_mat', box(inner[0] + 0.2, 0.35, inner[1] + 0.2, inner[0] + 2.0, 0.37, inner[1] + 0.9)); col.rect([inner[0] + 0.2, inner[1] + 0.2, inner[0] + 2.0, inner[1] + 0.9], 0, 0.4);
    bag.add('iron', rod([inner[2] - 0.2, 0.2, inner[3] - 0.2], [inner[2] - 0.2, 1.2, inner[3] - 0.2], 0.03, 4)); bag.add('iron', rod([inner[2] - 0.2, 0.2, inner[3] - 0.2], [inner[2] - 0.6, 0.05, inner[3] - 0.5], 0.015, 3));
    jar(bag, 'pottery_dark', inner[2] - 0.5, 0, inner[1] + 0.4, 1.0);
  } else {
    // the quarters: a row of cots with mats and chests at their feet, a table with a lamp, hooks with clothes
    const nb = Math.floor((Lx - 2) / 2.2);
    for (let i = 0; i < nb; i++) { const bx = x0 + 1.6 + i * 2.2; for (const zz of [z0 + 0.9, z1 - 2.7]) { bag.add('timber', box(bx - 0.5, 0.3, zz, bx + 0.5, 0.4, zz + 1.9)); bag.add('reed_mat', box(bx - 0.47, 0.4, zz + 0.05, bx + 0.47, 0.43, zz + 1.85)); bag.add(i % 2 ? 'cloth_blue' : 'cloth_ochre', box(bx - 0.47, 0.43, zz + 0.9, bx + 0.47, 0.5, zz + 1.85)); for (const [a, b] of [[-1, 0], [1, 0], [-1, 1.9], [1, 1.9]]) bag.add('timber', box(bx + a * 0.46 - 0.03, 0, zz + b - 0.03, bx + a * 0.46 + 0.03, 0.3, zz + b + 0.03)); col.rect([bx - 0.5, zz, bx + 0.5, zz + 1.9], 0, 0.5); bag.add('cloth_white', box(bx - 0.3, 0.43, zz + 0.1, bx + 0.3, 0.53, zz + 0.5)); } }
    table(bag, col, cx - 0.9, cz - 0.4, cx + 0.9, cz + 0.4, 0, 0.8); lamp(bag, cx, H - 0.9, cz); light(ctx, cx, H - 0.9, cz, 3.5, 9);
    for (let i = 0; i < 5; i++) chest(bag, col, x0 + 1.1 + i * 2.2 * (nb / 5), z0 + 0.45, x0 + 1.9 + i * 2.2 * (nb / 5), z0 + 0.85, 0);
    void r;
  }
}

// ── the open sheds and the timber warehouse ───────────────────────────────────────────────────────────────────────
/** voc_shed: { rect, kind ('stable' | 'smithy' | 'store'), seed } posts of bamboo or timber under atap or tile. */
function shed(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, k = el.kind, H = k === 'store' ? 3.8 : 3.0, tile = k === 'store';
  const Lx = x1 - x0, Lz = z1 - z0, long = Lx >= Lz, pm = tile ? 'timber' : 'bamboo_culm', r = rng(el.seed ?? 4);
  const up = k === 'store' ? 0.8 : 0;     // the store stands on piles against the damp
  if (k === 'store') { bag.add('timber', box(x0 - 0.2, up - 0.25, z0 - 0.2, x1 + 0.2, up, z1 + 0.2)); col.floor([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], up); for (let x = x0; x <= x1 + 0.1; x += (Lx) / 4) for (const z of [z0, cz, z1]) bag.add('wood_dark', lathe([[0.17, 0], [0.15, up]], 6, null, x, 0, z)); }
  const nx = Math.max(2, Math.round(Lx / 3.2)), nz = Math.max(1, Math.round(Lz / 3.2));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) { if (i > 0 && i < nx && j > 0 && j < nz) continue; const x = x0 + Lx * i / nx, z = z0 + Lz * j / nz; bag.add(pm, lathe([[0.1, 0], [0.085, H]], 6, null, x, up, z)); col.circle(x, z, 0.12, up, up + H); }
  for (const z of [z0, z1]) bag.add(pm, rod([x0, up + H - 0.2, z], [x1, up + H - 0.2, z], 0.06, 5)); for (const x of [x0, x1]) bag.add(pm, rod([x, up + H - 0.2, z0], [x, up + H - 0.2, z1], 0.06, 5));
  if (k === 'store') { // plank walls up to 1.3 m on the three sides, the open front and the stacked planking and rice within
    wallSeg(ctx, [x0, z0], [x1, z0], 0.12, up, up + 1.6, 'planks_grey'); wallSeg(ctx, [x0, z0], [x0, z1], 0.12, up, up + 1.6, 'planks_grey'); wallSeg(ctx, [x1, z0], [x1, z1], 0.12, up, up + 1.6, 'planks_grey');
    for (let s = 0; s < 6; s++) for (let l = 0; l < 6; l++) bag.add('planks_grey', box(x0 + 0.5 + s * 0.0, up + l * 0.12, z0 + 0.3 + s * 0.28, x0 + 5.5, up + l * 0.12 + 0.1, z0 + 0.5 + s * 0.28)); col.rect([x0 + 0.5, z0 + 0.3, x0 + 5.5, z0 + 2.0], up, up + 0.8);
    for (let a = 0; a < 5; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) bag.add('sacking', lathe([[0.2, 0], [0.26, 0.15], [0.22, 0.35], [0.001, 0.4]], 7, null, x1 - 4.2 + a * 0.55, up + c * 0.38, z0 + 0.5 + b * 0.55)); col.rect([x1 - 4.5, z0 + 0.2, x1 - 1.3, z0 + 2.0], up, up + 0.8);
    for (let n = 0; n < 4; n++) { const t = n / 3, x = x0 + 4 + t * (Lx - 8); bag.add('wood_dark', rod([x, up + 0.15, z1 - 0.5], [x + 1.2, up + 0.15, z1 - 0.5], 0.1, 6)); }
    const steps = 4; for (let i = 0; i < steps; i++) bag.add('timber', box(cx - 0.9, up * (i / steps), z1 + 0.2 + (steps - 1 - i) * 0.3, cx + 0.9, up * (i + 1) / steps, z1 + 0.2 + (steps - i) * 0.3 + 0.01)); col.ramp([cx - 0.9, z1 + 0.2, cx + 0.9, z1 + 0.2 + steps * 0.3], 0, up, 'n');
  } else if (k === 'stable') {
    for (let i = 0; i < 4; i++) { const sx = x0 + 1.5 + i * (Lx - 3) / 3.0; bag.add(pm, rod([sx, 1.2, z0 + 0.6], [sx, 1.2, z1 - 0.6], 0.04, 4)); bag.add(pm, rod([sx, 0.6, z0 + 0.6], [sx, 0.6, z1 - 0.6], 0.04, 4)); col.segment([sx, z0 + 0.6], [sx, z1 - 0.6], 0.1, 0, 1.3); bag.add('thatch', box(sx + 0.3, 0, z1 - 1.0, sx + 1.4, 0.25, z1 - 0.2)); bag.add('timber', box(sx + 0.2, 0.55, z0 + 0.45, sx + 1.3, 0.75, z0 + 0.95)); }
  } else {
    // the smithy: a clay forge with a bellows, an anvil on a stump, a quench trough, tools hung on a post
    const fx = x0 + 1.4, fz = z0 + 1.2; bag.add('mudbrick', box(fx - 0.7, 0, fz - 0.5, fx + 0.7, 0.8, fz + 0.5)); col.rect([fx - 0.7, fz - 0.5, fx + 0.7, fz + 0.5], 0, 0.85); bag.add('flame', box(fx - 0.2, 0.8, fz - 0.15, fx + 0.2, 0.9, fz + 0.15)); light(ctx, fx, 1.2, fz + 0.4, 3, 7);
    bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.2, 0.4]], 8, null, fx + 1.1, 0.35, fz)); bag.add('timber', lathe([[0.2, 0], [0.18, 0.7]], 7, null, cx + 0.5, 0, cz + 0.5)); bag.add('iron', box(cx + 0.5 - 0.3, 0.7, cz + 0.5 - 0.1, cx + 0.5 + 0.3, 0.9, cz + 0.5 + 0.1)); col.circle(cx + 0.5, cz + 0.5, 0.25, 0, 0.9);
    bag.add('timber', box(x1 - 1.5, 0, z1 - 1.2, x1 - 0.3, 0.45, z1 - 0.5)); bag.add('water', box(x1 - 1.4, 0.4, z1 - 1.1, x1 - 0.4, 0.43, z1 - 0.6)); col.rect([x1 - 1.5, z1 - 1.2, x1 - 0.3, z1 - 0.5], 0, 0.45);
    for (let i = 0; i < 4; i++) bag.add('iron', rod([x0 + 0.3 + i * 0.12, 1.9, z1 - 0.3], [x0 + 0.3 + i * 0.12, 1.3 - i * 0.05, z1 - 0.3], 0.015, 3));
  }
  const B = (long ? Lz : Lx) / 2 + 0.8, rise = B * (tile ? 0.62 : 0.95);
  rectRoof({ c: [cx, cz], A: (long ? Lx : Lz) / 2 + 0.6, B, y: up + H, rise, kind: 'gable', sweep: 0, curl: false, p: 1.0, alongZ: !long, mat: tile ? 'roof_tile' : 'thatch_palm', soffit: tile ? 'timber' : 'thatch_palm' }, bag);
  void r;
}

// ── the grounds ───────────────────────────────────────────────────────────────────────────────────────────────────
/** voc_fence: { a, b, gaps [[s0, s1]] } a bamboo fence, pickets between two rails, posts every 2 m. */
function fence(el, ctx) {
  const { bag, col } = ctx, [a, b] = [el.a, el.b], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, gaps = el.gaps ?? [];
  const inG = (s) => gaps.some((g) => s > g[0] - 0.05 && s < g[1] + 0.05);
  for (let s = 0; s <= L + 0.01; s += 2.0) { if (inG(s) && !gaps.some((g) => Math.abs(s - g[0]) < 1.0 || Math.abs(s - g[1]) < 1.0)) continue; bag.add('bamboo_culm', lathe([[0.06, 0], [0.05, 2.4]], 5, null, a[0] + ux * s, 0, a[1] + uz * s)); }
  const piece = (s0, s1) => {
    const p = [a[0] + ux * s0, a[1] + uz * s0], q = [a[0] + ux * s1, a[1] + uz * s1];
    for (const y of [0.45, 1.5]) bag.add('bamboo_culm', rod([p[0], y, p[1]], [q[0], y, q[1]], 0.03, 4));
    const yaw = Math.atan2(uz, ux), pick = box(-0.025, 0, -0.02, 0.025, 1.9, 0.02), n = Math.floor((s1 - s0) / 0.22);
    for (let i = 0; i < n; i++) { const g = pick.clone(); const s = s0 + (i + 0.5) * 0.22; g.rotateY(-yaw); g.translate(a[0] + ux * s, 0, a[1] + uz * s); bag.add('bamboo_culm', g); }
    col.segment(p, q, 0.1, 0, 2.0);
  };
  let s = 0; for (const g of [...gaps].sort((p, q) => p[0] - q[0])) { if (g[0] > s) piece(s, g[0]); s = g[1]; } if (s < L) piece(s, L);
}
/** voc_grounds: { paths [rect], trees [[x, z, kind]], graves [[x, z, rot]], flag [x, z], wharf { x, z0, z1 } } */
function grounds(el, ctx) {
  const { bag, col } = ctx, r = rng(el.seed ?? 8);
  for (const p of el.paths ?? []) { bag.add('brick_paving', box(p[0], 0, p[1], p[2], 0.05, p[3])); bag.add('laterite', box(p[0] - 0.12, 0, p[1] - 0.0, p[0], 0.07, p[3])); bag.add('laterite', box(p[2], 0, p[1], p[2] + 0.12, 0.07, p[3])); }
  // fruit trees: pomegranate, orange, lime (Heeck's garden): a short trunk, a rounded crown, a few fruits on it
  for (const [x, z, kind] of el.trees ?? []) {
    const s = 0.85 + r() * 0.3, fm = kind === 0 ? 'cloth_red' : kind === 1 ? 'glaze_yellow' : 'cloth_green';
    bag.add('bark_dark', lathe([[0.16 * s, 0], [0.1 * s, 1.0 * s], [0.07 * s, 1.7 * s]], 6, null, x, 0, z)); col.circle(x, z, 0.2, 0, 2);
    bag.add('doum_leaf', lathe([[0.001, 1.5 * s], [1.0 * s, 1.7 * s], [1.5 * s, 2.4 * s], [1.3 * s, 3.1 * s], [0.7 * s, 3.5 * s], [0.001, 3.6 * s]], 9, null, x, 0, z));
    for (let f = 0; f < 5; f++) { const a = r() * 6.28, d = 1.0 * s + r() * 0.3; bag.add(fm, lathe([[0.001, 0], [0.07, 0.05], [0.001, 0.11]], 5, null, x + Math.cos(a) * d, 2.0 * s + r() * 0.8, z + Math.sin(a) * d)); }
  }
  // the burial ground: low brick wall round it, slabs of lime-plastered brick, a few with a headstone
  if (el.cemetery) {
    const [a, b, c, d] = el.cemetery;
    for (const [p, q] of [[[a, b], [c, b]], [[a, d], [c, d]], [[a, b], [a, d]], [[c, b], [c, d]]]) wallSeg(ctx, p, q, 0.3, 0, 1.0, 'brick', p[1] === d && q[1] === d ? [{ at: (c - a) / 2, w: 1.2, h: 1.0, y0: 0 }] : []);
    for (let x = a + 2; x < c - 1.5; x += 2.4) for (let z = b + 1.8; z < d - 1.5; z += 2.6) { if (r() < 0.2) continue; bag.add('lime_plaster', box(x - 0.5, 0, z - 0.25, x + 0.5, 0.22, z + 1.1)); bag.add('plaster_white', box(x - 0.4, 0.22, z - 0.15, x + 0.4, 0.3, z + 1.0)); bag.add('limestone', box(x - 0.32, 0.3, z - 0.15, x + 0.32, 1.0, z - 0.07)); col.rect([x - 0.5, z - 0.25, x + 0.5, z + 1.1], 0, 1.0); }
  }
  // the flagstaff: a tall mast with the prince's flag, orange, white and blue
  if (el.flag) {
    const [fx, fz] = el.flag; bag.add('brick', box(fx - 0.5, 0, fz - 0.5, fx + 0.5, 0.5, fz + 0.5)); bag.add('timber', lathe([[0.13, 0], [0.08, 11]], 8, null, fx, 0.5, fz)); col.circle(fx, fz, 0.55, 0, 11.5);
    bag.add('gold', lathe([[0.001, 0], [0.12, 0.05], [0.001, 0.4]], 7, null, fx, 11.5, fz));
    for (const [k, m] of [[0, 'cloth_ochre'], [1, 'cloth_white'], [2, 'cloth_blue']]) { const t = [], n = 6, y0 = 10.6 - k * 0.5, w = 3.0; const P = (i, yy) => [fx + 0.1 + (i / n) * w, yy, fz + Math.sin(i * 0.9 + k * 0.4) * 0.18 * (i / n)]; for (let i = 0; i < n; i++) { const a = P(i, y0), b = P(i + 1, y0), c = P(i + 1, y0 - 0.5), d = P(i, y0 - 0.5); t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); } bag.add(m, fromTriangles(t)); }
  }
  // the wharf: planks on piles to the river, bollards, a derrick with its block and tackle, bales and casks waiting
  if (el.wharf) {
    const { x, z0, z1 } = el.wharf, w = 1.7;
    bag.add('timber', box(x - w, -0.22, z0, x + w, -0.04, z1)); bag.add('planks_grey', box(x - w, -0.04, z0, x + w, 0.06, z1)); col.floor([x - w, z0, x + w, z1], 0.06);
    for (let z = z0 + 1; z <= z1; z += 3.0) for (const s of [-1, 1]) { bag.add('wood_dark', lathe([[0.15, 0], [0.13, 3.6]], 6, null, x + s * (w - 0.15), -2.3, z)); }
    for (const s of [-1, 1]) for (const z of [z0 + 2, z1 - 0.6]) { bag.add('wood_dark', lathe([[0.15, 0], [0.12, 0.45]], 6, null, x + s * (w - 0.05), 0.06, z)); col.circle(x + s * (w - 0.05), z, 0.16, 0, 0.5); }
    const dz = z1 - 5; for (const s of [-1, 1]) { bag.add('wood_dark', rod([x + s * (w - 0.3), 0.06, dz], [x + s * 0.2, 3.8, dz], 0.1, 5)); } bag.add('wood_dark', rod([x - 0.3, 3.75, dz], [x + 0.3, 3.75, dz], 0.1, 5)); bag.add('timber', rod([x, 3.8, dz], [x, 3.8, dz + 2.6], 0.08, 5)); bag.add('rope_fibre', rod([x, 3.8, dz + 2.5], [x, 2.3, dz + 2.5], 0.015, 3)); bag.add('iron', lathe([[0.001, 0], [0.08, 0.05], [0.001, 0.25]], 6, null, x, 2.05, dz + 2.5));
    col.circle(x - w + 0.3, dz, 0.15, 0, 3.8); col.circle(x + w - 0.3, dz, 0.15, 0, 3.8);
    for (let i = 0; i < 3; i++) bag.add('hide_tan', box(x - w + 0.15 + (i % 2) * 0.1, 0.06 + i * 0.22, z0 + 1.5, x - w + 1.2, 0.06 + i * 0.22 + 0.2, z0 + 2.5)); col.rect([x - w + 0.1, z0 + 1.5, x - w + 1.3, z0 + 2.5], 0, 0.8);
    for (let i = 0; i < 2; i++) { bag.add('timber', lathe([[0.3, 0], [0.34, 0.3], [0.3, 0.6], [0.001, 0.6]], 9, null, x + w - 0.5, 0.06, z0 + 1.7 + i * 0.8)); col.circle(x + w - 0.5, z0 + 1.7 + i * 0.8, 0.35, 0, 0.7); }
  }
}

export const VOC_ELEMENTS = { voc_lodge: lodge, voc_house: house, voc_shed: shed, voc_fence: fence, voc_grounds: grounds };
