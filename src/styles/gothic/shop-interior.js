// The ground floor of an open Paris house or shop about 1250 (docs/settlements/paris.md §5a2): stone walls, a flagged floor,
// the beams of the floor above, the street's wide door and the counter opening; a partition with a doorway between the shop
// and the living room behind (hearth, table and benches, bed, chest, shelf, a ladder to the loft). The shop part is
// furnished by trade. All in the house's own frame: u along the front, d into the house from the front.

import { box, rod, lathe } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const FL = 0.1;                                  // the floor, over the street's level (a step at the door)

/** ctx: { bag, col, rect, y, foot, f, L, D, st, su, ws, du, doorL, trade (id), seed } — builds the stone storey in place of the solid one. */
export function openGround(c) {
  const { bag, col, rect, y, foot, f, L, D, st, su, ws, du, doorL, trade, lights, lit } = c, rand = rng((c.seed || 1) + 77);
  const [x0, z0, x1, z1] = rect, T = 0.4, fl = y + FL;
  const P = (u, d) => (f === 's' ? [x0 + u, z1 - d] : f === 'n' ? [x1 - u, z0 + d] : f === 'e' ? [x1 - d, z0 + u] : [x0 + d, z1 - u]);
  const R = (u0, d0, u1, d1) => { const a = P(u0, d0), b = P(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  // a box in the frame, heights above the floor (ya, yb), solid for walking when col
  const B = (m, u0, u1, d0, d1, ya, yb, k = false) => { const r = R(u0, d0, u1, d1); bag.add(m, box(r[0], fl + ya, r[1], r[2], fl + yb, r[3])); if (k) col.rect(r, fl + ya - 0.05, fl + yb); };
  const W = (m, u0, u1, d0, d1, ya, yb) => { const r = R(u0, d0, u1, d1); bag.add(m, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); col.rect(r, y + ya - 0.3, y + yb); };      // wall pieces, heights above the street
  const rodU = (m, a, b, r = 0.03, seg = 5) => { const p = P(a[0], a[1]), q = P(b[0], b[1]); bag.add(m, rod([p[0], fl + a[2], p[1]], [q[0], fl + b[2], q[1]], r, seg)); };
  const vase = (m, u, d, r, h, ya = 0, prof = null) => { const p = P(u, d); bag.add(m, lathe(prof || [[r * 0.6, 0], [r, h * 0.4], [r * 0.8, h * 0.85], [r * 0.5, h], [0.001, h]], 10, null, p[0], fl + ya, p[1])); };
  const barrel = (u, d, r = 0.34, h = 0.85, ya = 0, m = 'wood_dark') => { vase(m, u, d, r, h, ya, [[r * 0.8, 0], [r, h * 0.3], [r, h * 0.7], [r * 0.8, h], [0.001, h]]); col.circle(...P(u, d), r, fl + ya, fl + ya + h); };
  const sack = (u, d, ya = 0) => vase('sacking', u, d, 0.27, 0.5, ya, [[0.22, 0], [0.28, 0.18], [0.24, 0.4], [0.1, 0.5], [0.001, 0.5]]);

  // ── the shell: the footing and floor, the walls with the door and the counter opening in the front, the ceiling's beams
  { const r = R(-0.1, -0.1, L + 0.1, D + 0.1); bag.add('limestone', box(r[0], foot - 0.6, r[1], r[2], fl, r[3])); col.rect(R(0, 0, L, D), foot - 0.6, fl - 0.3); col.floor(R(0, 0, L, D), fl); }
  { const r = R(T, T, L - T, D - T); bag.add('flagstone', box(r[0], fl, r[1], r[2], fl + 0.012, r[3])); }
  W('limestone', 0, L, D - T, D, 0, st);
  W('limestone', 0, T * 0.75, 0.0, D - T, 0, st); W('limestone', L - T * 0.75, L, 0.0, D - T, 0, st);
  const gaps = [[su, su + ws, 0.92, 2.75], [du - 0.02, du + 1.02, 0, 2.35]].sort((a, b) => a[0] - b[0]);
  let u = 0;
  for (const [g0, g1, lo, hi] of gaps) {
    if (g0 > u) W('limestone', u, g0, -0.1, T, 0, st);
    if (lo > 0) W('limestone', g0, g1, -0.1, T, 0, lo);
    W('limestone', g0, g1, -0.1, T, hi, st);
    u = g1;
  }
  if (L > u) W('limestone', u, L, -0.1, T, 0, st);
  // the door's leaf standing open against its jamb, hinged at the side away from the shop
  { const hu = doorL ? du : du + 1.0; B('wood_dark', hu - 0.03, hu + 0.03, T, T + 0.95, 0, 2.2); }
  // the floor above on its beams and boards; walked on the roof of the room, not in it
  { const r = R(T, T, L - T, D - T); bag.add('timber', box(r[0], y + st - 0.06, r[1], r[2], y + st - 0.02, r[3])); }
  for (let d = T + 0.8; d < D - T; d += 1.25) B('wood_dark', T, L - T, d - 0.1, d + 0.1, st - FL - 0.3, st - FL - 0.04);
  col.rect(R(0, 0, L, D), y + st - 0.1, y + st + 0.3);

  // a hanging lamp over the shop (one light a room, only where asked: the court's lodgings)
  if (lit && lights) { const p = P(L / 2, Math.min(D * 0.38, 2.8)); lights.push({ at: [p[0], fl + 2.35, p[1]], color: '#ffc27a', intensity: 3, distance: 8 }); rodU('iron', [L / 2, Math.min(D * 0.38, 2.8), 2.75], [L / 2, Math.min(D * 0.38, 2.8), 2.45], 0.012); vase('lamp_glass', L / 2, Math.min(D * 0.38, 2.8), 0.08, 0.2, 2.2); }

  // ── the partition (the doorway where the corridor from the street door runs on) and its door
  const PD = Math.min(D - 3.2, 5.6), pu = doorL ? du : du - 0.05;
  B('limestone', 0, pu, PD, PD + 0.16, 0, st - FL - 0.04, true); B('limestone', pu + 1.1, L, PD, PD + 0.16, 0, st - FL - 0.04, true);
  B('timber', pu - 0.05, pu + 1.15, PD - 0.04, PD + 0.2, 2.15, 2.3);
  B('limestone', pu - 0.05, pu + 1.15, PD, PD + 0.16, 2.3, st - FL - 0.04);

  // ── the corridor side and the free side: furniture on the far side from the door, along the wall
  const wu = doorL ? L - T * 0.75 : T * 0.75, sg = doorL ? -1 : 1, u0 = doorL ? du + 1.35 : T + 0.1, u1 = doorL ? L - T - 0.1 : du - 0.3, mu = (u0 + u1) / 2;
  const WB = (m, d0, d1, ya, yb, th, k = false) => B(m, Math.min(wu, wu + sg * th), Math.max(wu, wu + sg * th), d0, d1, ya, yb, k);
  const shelves = (d0, d1, n, m = 'timber', th = 0.3) => { for (let k = 0; k < n; k++) WB(m, d0, d1, 0.5 + k * 0.45, 0.54 + k * 0.45, th); };
  // the shop's counter inside the opening: the shelf the board is let down from and the stool of the master behind it
  B('timber', su, su + ws, T, T + 0.5, 0.78, 0.84);
  const sh = (kind) => {
    const d1 = PD - 0.2, d0 = 1.4;
    if (kind === 'baker') {
      shelves(d0, d1 - 1.2, 3); for (let d = d0 + 0.2; d < d1 - 1.4; d += 0.36) for (let k = 0; k < 3; k++) WB('hide_tan', d, d + 0.26, 0.54 + k * 0.45, 0.66 + k * 0.45, 0.22);
      B('wood_dark', mu - 0.5, mu + 0.5, 2.2, 3.1, 0.7, 0.78, true); for (const a of [-0.45, 0.45]) for (const b of [2.25, 3.05]) B('timber', mu + a - 0.04, mu + a + 0.04, b - 0.04, b + 0.04, 0, 0.7);
      B('cloth_white', mu - 0.35, mu + 0.35, 2.4, 2.9, 0.78, 0.86);
      for (const [a, b] of [[0.3, 4.8], [0.65, 4.9], [0.3, 5.15]]) sack(wu + sg * a, b);
      vase('limestone', wu + sg * 0.75, 3.9, 0.85, 1.1, 0, [[0.9, 0], [0.9, 0.5], [0.6, 0.95], [0.001, 1.15]]); B('iron', wu + sg * 0.2, wu + sg * 0.45, 3.7, 4.1, 0.2, 0.55);
    } else if (kind === 'draper') {
      shelves(d0, d1, 4, 'timber', 0.5); for (let d = d0 + 0.1; d < d1 - 0.3; d += 0.45) for (let k = 0; k < 4; k++) WB(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_brown'][Math.floor(rand() * 6)], d, d + 0.4, 0.54 + k * 0.45, 0.88 + k * 0.45 - (rand() < 0.5 ? 0.1 : 0), 0.42);
      B('timber', mu - 0.55, mu + 0.55, 2.3, 3.3, 0.88, 0.94, true); for (const a of [-0.5, 0.5]) for (const b of [2.35, 3.25]) B('wood_dark', mu + a - 0.04, mu + a + 0.04, b - 0.04, b + 0.04, 0, 0.88);
      B('cloth_red', mu - 0.3, mu + 0.3, 2.5, 3.0, 0.94, 1.06); B('iron', mu - 0.5, mu + 0.5, 3.18, 3.22, 0.96, 0.98);
      rodU('timber', [wu, 4.8, 0.05], [wu, 4.8, 1.6], 0.025);
    } else if (kind === 'butcher') {
      B('timber', u0 + 0.2, u1 - 0.2, 1.5, 3.0, 0, 0.1); B('wood_dark', mu - 0.4, mu + 0.4, 1.6, 2.4, 0, 0.85, true); B('hide_white', mu - 0.4, mu + 0.4, 1.6, 2.4, 0.85, 0.9);
      B('timber', u0, u1, 3.4, 3.5, 2.05, 2.15); for (let k = 0; k < 4; k++) { const u = u0 + 0.3 + k * (u1 - u0 - 0.6) / 3; rodU('iron', [u, 3.45, 2.05], [u, 3.45, 1.5], 0.012); B(k % 2 ? 'cloth_red' : 'hide_white', u - 0.1, u + 0.1, 3.35, 3.55, 0.8, 1.5); }
      barrel(wu + sg * 0.4, 4.5, 0.32, 0.7); barrel(wu + sg * 0.4, 5.2, 0.32, 0.7); shelves(d0, 2.6, 2, 'wood_dark', 0.28);
    } else if (kind === 'tavern') {
      for (const d of [1.5, 3.1, 4.5]) { const uu = u0 + 0.9; B('timber', uu - 0.9, uu + 0.9, d - 0.35, d + 0.35, 0.74, 0.8, true); for (const a of [-0.8, 0.8]) B('wood_dark', uu + a - 0.04, uu + a + 0.04, d - 0.3, d + 0.3, 0, 0.74); for (const s2 of [-0.55, 0.55]) B('timber', uu - 0.8, uu + 0.8, d + s2 - 0.12, d + s2 + 0.12, 0.42, 0.46, true); vase('pottery_dark', uu - 0.4, d, 0.07, 0.22, 0.8); vase('pottery_dark', uu + 0.3, d + 0.1, 0.06, 0.2, 0.8); }
      barrel(wu + sg * 0.4, 1.5, 0.36, 0.95, 0.5); barrel(wu + sg * 0.4, 1.5, 0.36, 0.95, 0); barrel(wu + sg * 0.4, 2.4, 0.36, 0.95); shelves(3.2, d1, 2, 'wood_dark', 0.25);
      for (let d = 3.4; d < d1 - 0.2; d += 0.34) vase(rand() < 0.5 ? 'terracotta' : 'pottery_dark', wu + sg * 0.15, d, 0.07, 0.22, 0.54);
    } else if (kind === 'goldsmith') {
      B('wood_dark', mu - 0.7, mu + 0.7, 2.2, 3.0, 0, 0.85, true); B('timber', mu - 0.75, mu + 0.75, 2.15, 3.05, 0.85, 0.9); B('iron', mu - 0.2, mu + 0.1, 2.4, 2.6, 0.9, 1.0); B('silver', mu + 0.25, mu + 0.45, 2.45, 2.55, 0.9, 0.93); B('gold', mu + 0.5, mu + 0.6, 2.5, 2.6, 0.9, 0.92);
      vase('limestone', wu + sg * 0.5, 3.4, 0.4, 0.8, 0, [[0.4, 0], [0.4, 0.7], [0.001, 0.8]]); B('iron', wu + sg * 0.35, wu + sg * 0.65, 3.8, 4.2, 0, 0.45, true); B('wood_dark', wu + sg * 0.1, wu + sg * 0.6, 1.5, 2.3, 0, 0.6, true); B('iron', wu + sg * 0.05, wu + sg * 0.55, 1.5, 2.3, 0.6, 0.64);
      shelves(4.4, d1, 2, 'wood_dark', 0.25); for (let d = 4.5; d < d1 - 0.2; d += 0.4) vase('silver', wu + sg * 0.15, d, 0.07, 0.2, 0.54);
    } else if (kind === 'shoemaker') {
      B('timber', wu < L / 2 ? wu : wu - 1.0, wu < L / 2 ? wu + 1.0 : wu, 1.5, 2.3, 0.74, 0.8, true); B('wood_dark', mu - 0.3, mu + 0.3, 2.2, 2.7, 0, 0.3, true);
      shelves(d0 + 1.4, d1, 3, 'wood_dark', 0.3); for (let d = d0 + 1.6; d < d1 - 0.2; d += 0.32) for (let k = 0; k < 3; k++) WB('hide_brown', d, d + 0.2, 0.54 + k * 0.45, 0.66 + k * 0.45, 0.25);
      for (let k = 0; k < 5; k++) { const d = d0 + 0.2 + k * 0.25; WB(k % 2 ? 'hide_tan' : 'hide_brown', d, d + 0.18, 1.3, 2.0, 0.06); }
    } else if (kind === 'cooper') {
      for (const [a, b, h] of [[0.4, 1.6, 0.9], [1.2, 1.7, 0.9], [0.4, 3.0, 0.9], [1.2, 3.2, 0.8], [0.4, 4.4, 0.9], [0.9, 4.9, 0.7]]) barrel(wu + sg * a, b, 0.36, h);
      for (let k = 0; k < 14; k++) rodU('timber', [mu - 0.5 + k * 0.07, 2.2, 0.04], [mu - 0.4 + k * 0.07, 2.4, 1.6], 0.025);
      B('wood_dark', u0, u0 + 0.9, 3.7, 4.1, 0, 0.7, true); for (const a of [0.2, 0.55, 0.9]) rodU('iron', [wu + sg * 0.1, d0 + a, 1.8], [wu + sg * 0.1, d0 + a, 1.45], 0.02);
    } else if (kind === 'chandler') {
      vase('iron', mu, 2.6, 0.5, 0.7, 0, [[0.35, 0], [0.5, 0.35], [0.45, 0.7], [0.001, 0.7]]); B('tile_dark', mu - 0.4, mu + 0.4, 3.35, 3.4, 0, 0.9);
      B('timber', u0, u1, 1.5, 1.6, 2.0, 2.06); for (let k = 0; k < 8; k++) { const uu = u0 + 0.15 + k * (u1 - u0 - 0.3) / 7; rodU('ivory', [uu, 1.55, 2.0], [uu, 1.55, 1.45], 0.02); }
      shelves(d0 + 1.8, d1, 3, 'wood_dark', 0.28); for (let d = d0 + 2.0; d < d1 - 0.2; d += 0.3) for (let k = 0; k < 3; k++) rodU('ivory', [wu + sg * 0.12, d, 0.54 + k * 0.45], [wu + sg * 0.12, d, 0.8 + k * 0.45], 0.02);
    } else if (kind === 'scribe') {
      for (const [a, b] of [[0.0, 1.7], [0.0, 3.3]]) { B('wood_dark', mu + a - 0.45, mu + a + 0.45, b - 0.35, b + 0.35, 0.9, 0.94, true); B('timber', mu + a - 0.42, mu + a + 0.42, b - 0.3, b + 0.3, 0.94, 1.0); B('ivory', mu + a - 0.3, mu + a + 0.2, b - 0.2, b + 0.2, 1.0, 1.01); B('wood_dark', mu + a - 0.45, mu + a + 0.45, b - 0.35, b - 0.3, 0, 0.9); B('wood_dark', mu + a - 0.45, mu + a + 0.45, b + 0.3, b + 0.35, 0, 0.9); vase('iron', mu + a + 0.35, b, 0.03, 0.08, 1.0); B('timber', mu + a - 0.25, mu + a + 0.25, b + 0.7, b + 1.0, 0, 0.45, true); }
      shelves(d0 + 0.2, d1, 4, 'wood_dark', 0.3); for (let d = d0 + 0.3; d < d1 - 0.2; d += 0.14) for (let k = 0; k < 4; k++) if (rand() < 0.8) WB(['cloth_brown', 'cloth_red', 'hide_brown', 'cloth_indigo'][Math.floor(rand() * 4)], d, d + 0.11, 0.54 + k * 0.45, 0.8 + k * 0.45, 0.22);
    } else {                                              // fishmonger
      B('timber', u0, u1, 1.5, 2.6, 0.7, 0.76, true); for (const a of [u0 + 0.1, u1 - 0.1]) for (const b of [1.6, 2.5]) B('wood_dark', a - 0.04, a + 0.04, b - 0.04, b + 0.04, 0, 0.7);
      for (let k = 0; k < 7; k++) B('silver', u0 + 0.15 + (k % 4) * 0.3, u0 + 0.4 + (k % 4) * 0.3, 1.7 + Math.floor(k / 4) * 0.4, 1.8 + Math.floor(k / 4) * 0.4, 0.76, 0.82);
      for (const [a, b] of [[0.4, 3.5], [0.4, 4.2], [0.9, 4.9]]) vase('wood_dark', wu + sg * a, b, 0.32, 0.45, 0, [[0.28, 0], [0.32, 0.2], [0.34, 0.45], [0.001, 0.45]]);
      rodU('timber', [wu + sg * 0.1, 1.4, 1.9], [wu + sg * 0.1, 3.6, 1.9], 0.025); B('rope_fibre', Math.min(wu, wu + sg * 0.04), Math.max(wu, wu + sg * 0.04), 1.6, 3.4, 1.2, 1.9);
    }
  };
  sh(trade);

  // ── the living room: hearth, table and benches, the bed, a chest, shelf, ladder
  const d0 = PD + 0.5, dE = D - T, hu0 = doorL ? 0.5 : L - 2.0;
  B('limestone', hu0, hu0 + 1.5, dE - 0.8, dE, 0, 0.35, true); B('limestone', hu0 + 0.1, hu0 + 1.4, dE - 0.6, dE, 0.35, st - FL - 0.04); B('limestone', hu0 - 0.1, hu0 + 1.6, dE - 0.85, dE - 0.55, 1.5, 1.7);
  vase('iron', hu0 + 0.75, dE - 0.4, 0.2, 0.28, 0.35); rodU('iron', [hu0 + 0.75, dE - 0.4, 1.45], [hu0 + 0.75, dE - 0.4, 0.62], 0.01); B('wood_dark', hu0 + 0.2, hu0 + 0.5, dE - 0.5, dE - 0.2, 0.35, 0.4); B('iron', hu0 + 0.5, hu0 + 1.1, dE - 0.6, dE - 0.4, 0.35, 0.37);
  const tu = doorL ? L - 2.0 : 1.6;
  B('timber', tu - 0.8, tu + 0.8, d0 + 0.5, d0 + 1.2, 0.74, 0.8, true); for (const a of [-0.7, 0.7]) B('wood_dark', tu + a - 0.04, tu + a + 0.04, d0 + 0.55, d0 + 1.15, 0, 0.74); for (const s2 of [-0.1, 1.3]) B('timber', tu - 0.7, tu + 0.7, d0 + s2 + 0.1 - 0.1, d0 + s2 + 0.1 + 0.12, 0.42, 0.46, true);
  vase('pottery_dark', tu - 0.2, d0 + 0.85, 0.08, 0.22, 0.8); B('hide_tan', tu + 0.2, tu + 0.5, d0 + 0.65, d0 + 0.95, 0.8, 0.86);
  const bu = doorL ? L - T * 0.75 - 1.0 : T * 0.75, bsg = doorL ? 1 : 1;
  B('wood_dark', Math.min(bu, bu + (doorL ? 0 : 1.0)) + (doorL ? 0 : 0), Math.min(bu, bu + (doorL ? 0 : 1.0)) + 1.0, dE - 2.1, dE - 0.15, 0.3, 0.46, true); B('linen', Math.min(bu, bu + (doorL ? 0 : 1.0)) + 0.04, Math.min(bu, bu + (doorL ? 0 : 1.0)) + 0.96, dE - 2.05, dE - 0.2, 0.46, 0.58); B('cloth_red', Math.min(bu, bu + (doorL ? 0 : 1.0)) + 0.04, Math.min(bu, bu + (doorL ? 0 : 1.0)) + 0.96, dE - 1.2, dE - 0.2, 0.58, 0.64);
  void bsg;
  B('wood_dark', doorL ? 2.0 : L - 3.2, doorL ? 3.2 : L - 2.0, PD + 0.3, PD + 0.75, 0, 0.6, true); B('iron', doorL ? 2.0 : L - 3.2, doorL ? 3.2 : L - 2.0, PD + 0.3, PD + 0.75, 0.6, 0.64);
  const lu = doorL ? 0.5 : L - 0.5;
  for (const a of [-0.2, 0.2]) rodU('timber', [lu + a, PD + 1.4, 0], [lu + a, PD + 1.0, st - FL - 0.1], 0.03);
  for (let k = 1; k < 8; k++) rodU('timber', [lu - 0.2, PD + 1.4 - k * 0.057, k * 0.34], [lu + 0.2, PD + 1.4 - k * 0.057, k * 0.34], 0.02);
  { const sw = doorL ? L - T * 0.75 : T * 0.75; B('timber', Math.min(sw, sw + (doorL ? -0.3 : 0.3)), Math.max(sw, sw + (doorL ? -0.3 : 0.3)), dE - 3.3, dE - 2.4, 1.3, 1.34); for (let d = dE - 3.2; d < dE - 2.5; d += 0.2) vase(rand() < 0.5 ? 'terracotta' : 'pottery_dark', sw + (doorL ? -0.15 : 0.15), d, 0.06, 0.2, 1.34); }
  void rand;
}
