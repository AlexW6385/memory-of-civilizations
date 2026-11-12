// The Court Opera inside (docs/settlements/vienna.md §12): three doors from the Ring's arcade into the foyer (marble columns,
// coffered ceiling, chandeliers, the red carpet), three doorways through the thick wall into the horseshoe auditorium — the stalls with
// their rows of red seats, four tiers of gilt balcony fronts with their boxes, the painted ceiling and the great chandelier — and
// the stage behind the proscenium (the curtain drawn back, the painted flats, the orchestra pit with its stands). The hall is a
// circle of 12.5 m; the mass round it is cut in strips (the hall's walls are quads turned inward, the colliders a polygon).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

const FL = 0.12, H = 26, RH = 12.5, TC = 27, FOY = [1.6, 12], FOYH = 7.2;
const DOORS_F = [-5.4, 0, 5.4], DW_F = 3.2, DOORS_R = [[0, 4.6], [-7, 3.0], [7, 3.0]];
const STAGE = { s: 16, t0: 37, t1: 56, h: 25 };

/** The solid mass of the Opera's body cut by the interior: strips along the depth. Returns nothing; adds geometry and colliders. */
export function operaMass({ bag, col }, y, rect) {
  const [x0, z0, x1, z1] = rect, xc = (x0 + x1) / 2, D = z1 - z0, ST = 1.0;
  const X = (s) => xc + s, Z = (t) => z0 + t;
  const solid = (s0, s1, t0, t1, v0, v1) => { if (s1 - s0 < 1e-3 || t1 - t0 < 1e-3 || v1 - v0 < 1e-3) return; bag.add('limestone', box(X(s0), y + v0, Z(t0), X(s1), y + v1, Z(t1))); col.rect([X(s0), Z(t0), X(s1), Z(t1)], y + v0, y + v1); };
  const hw = (x1 - x0) / 2;
  solid(-hw, -17, 0, D, -0.6, H); solid(17, hw, 0, D, -0.6, H);
  for (let s = -17; s < 17 - 1e-6; s += ST) {
    const s2 = s + ST, near = s < 0 && s2 > 0 ? 0 : Math.min(Math.abs(s), Math.abs(s2)), far = Math.max(Math.abs(s), Math.abs(s2));
    const iv = [];
    if (DOORS_F.some((d) => Math.abs((s + s2) / 2 - d) < DW_F / 2)) iv.push([0, FOY[0], 5.8]);
    if (far < 14.5) iv.push([FOY[0], FOY[1], FOYH]);
    const ch = near < RH ? Math.sqrt(RH * RH - near * near) : 0;
    if (ch > 0) iv.push([TC - ch, TC + ch, 19.4]);
    for (const [d, w] of DOORS_R) if (Math.abs((s + s2) / 2 - d) < w / 2 && ch > 0) iv.push([FOY[1] - 0.01, TC - ch + 0.01, 6.0]);
    if (far < STAGE.s) iv.push([STAGE.t0, STAGE.t1, STAGE.h]);
    if (!iv.length) { solid(s, s2, 0, D, -0.6, H); continue; }
    const bs = [...new Set([0, D, ...iv.flatMap(([a, b]) => [a, b])])].sort((a, b) => a - b);
    const segs = [];
    for (let i = 0; i + 1 < bs.length; i++) { const m = (bs[i] + bs[i + 1]) / 2, c = iv.filter(([a, b]) => m > a && m < b); segs.push([bs[i], bs[i + 1], c.length ? Math.max(...c.map((q) => q[2])) : null]); }
    for (let i = 0; i < segs.length;) {
      let j = i; while (j + 1 < segs.length && segs[j + 1][2] === segs[i][2]) j++;
      const [a, , h] = segs[i], b = segs[j][1];
      if (h === null) solid(s, s2, a, b, -0.6, H); else if (h < H) solid(s, s2, a, b, h, H);
      i = j + 1;
    }
  }
}

/** A vertical quad from plan point A to B, y0..y1, its face toward `c` (a plan point on the visible side). */
function vquad(bag, mat, A, B, y0, y1, c) {
  const dx = B[0] - A[0], dz = B[1] - A[1], n = [-dz, dx], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], ok = n[0] * (c[0] - m[0]) + n[1] * (c[1] - m[1]) > 0;
  const P0 = [A[0], y0, A[1]], P1 = [B[0], y0, B[1]], P2 = [B[0], y1, B[1]], P3 = [A[0], y1, A[1]];
  const t = ok ? [...P0, ...P1, ...P2, ...P0, ...P2, ...P3] : [...P1, ...P0, ...P3, ...P1, ...P3, ...P2];
  bag.add(mat, fromTriangles(t));
}
/** A horizontal quad (the four plan points in order), facing down. */
function hquadDown(bag, mat, y, p) {
  const a = [p[0][0], y, p[0][1]], b = [p[1][0], y, p[1][1]], c = [p[2][0], y, p[2][1]], d = [p[3][0], y, p[3][1]];
  const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);   // y component of (b-a)×(c-a) with the xz order used by fromTriangles
  bag.add(mat, fromTriangles(ny < 0 ? [...a, ...b, ...c, ...a, ...c, ...d] : [...a, ...c, ...b, ...a, ...d, ...c]));
}

/** The furnishing and surfaces inside. */
export function operaInside(ctx, y, rect) {
  const { bag, col, lights } = ctx, [x0, z0, x1] = rect, xc = (x0 + x1) / 2;
  const X = (s) => xc + s, Z = (t) => z0 + t, Y = y + FL;
  const B = (m, s0, s1, t0, t1, v0, v1, hard = false) => { if (s1 - s0 < 1e-4 || t1 - t0 < 1e-4 || v1 - v0 < 1e-4) return; bag.add(m, box(X(Math.min(s0, s1)), Y + v0, Z(t0), X(Math.max(s0, s1)), Y + v1, Z(t1))); if (hard) col.rect([X(Math.min(s0, s1)), Z(t0), X(Math.max(s0, s1)), Z(t1)], Y + v0, Y + v1); };
  const C = [X(0), Z(TC)];
  // ── the foyer
  B('marble_floor', -14.5, 14.5, FOY[0], FOY[1], -0.1, 0.0); col.floor([X(-14.5), Z(FOY[0]), X(14.5), Z(FOY[1])], Y);
  for (const d of DOORS_F) B('marble_floor', d - DW_F / 2, d + DW_F / 2, -0.1, FOY[0], -0.1, 0.0);
  B('cloth_red', -1.1, 1.1, FOY[0], FOY[1], 0.0, 0.02); B('gilt_bronze', -1.2, -1.1, FOY[0], FOY[1], 0.0, 0.025); B('gilt_bronze', 1.1, 1.2, FOY[0], FOY[1], 0.0, 0.025);
  B('ceiling_coffer', -14.5, 14.5, FOY[0], FOY[1], FOYH - 0.2, FOYH);
  for (let t = FOY[0] + 0.4; t < FOY[1]; t += 2.0) B('gilt_bronze', -14.5, 14.5, t, t + 0.12, FOYH - 0.28, FOYH - 0.2);
  for (const t of [4.8, 9.0]) for (const s of [-11, -7, -3.2, 3.2, 7, 11]) { bag.add('marble_column', lathe([[0.5, 0], [0.4, 0.3], [0.34, 0.5], [0.3, FOYH - 0.6], [0.4, FOYH - 0.35], [0.001, FOYH - 0.3]], 10, null, X(s), Y, Z(t))); bag.add('gilt_bronze', lathe([[0.001, FOYH - 0.9], [0.4, FOYH - 0.9], [0.5, FOYH - 0.35], [0.001, FOYH - 0.3]], 10, null, X(s), Y, Z(t))); col.circle(X(s), Z(t), 0.5, Y, Y + FOYH); }
  for (const s of [-12.6, 12.6]) { bag.add('marble', box(X(s - 0.5), Y, Z(11.0), X(s + 0.5), Y + 1.1, Z(11.9))); col.rect([X(s - 0.5), Z(11.0), X(s + 0.5), Z(11.9)], Y, Y + 1.1); bag.add('ivory', lathe([[0.001, 1.1], [0.3, 1.1], [0.26, 1.6], [0.3, 2.8], [0.4, 3.0], [0.2, 3.6], [0.001, 3.7]], 10, null, X(s), Y, Z(11.45))); }
  for (const s of [-10, -5, 5, 10]) { B('wood_dark', s - 0.5, s + 0.5, 11.9, 11.95, 1.2, 3.4); B('mirror_tin', s - 0.42, s + 0.42, 11.85, 11.9, 1.3, 3.3); }
  B('wood_dark', 8.5, 12.8, 2.3, 3.4, 0, 1.15, true); B('marble', 8.4, 12.9, 2.2, 3.5, 1.15, 1.2); B('wood_dark', 8.5, 12.8, 2.3, 2.35, 1.2, 2.5);
  for (const s of [-9, 0, 9]) { const p = [X(s), Z(7)]; bag.add('iron', rod([p[0], Y + FOYH - 0.2, p[1]], [p[0], Y + FOYH - 1.6, p[1]], 0.02, 4)); bag.add('gilt_bronze', lathe([[0.7, 0], [0.7, 0.07], [0.001, 0.2]], 14, null, p[0], Y + FOYH - 1.8, p[1])); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, q = [p[0] + Math.cos(a) * 0.62, p[1] + Math.sin(a) * 0.62]; bag.add('lamp_glass', lathe([[0.001, 0], [0.06, 0.04], [0.05, 0.2], [0.001, 0.26]], 6, null, q[0], Y + FOYH - 1.6, q[1])); } lights?.push({ at: [p[0], Y + FOYH - 1.7, p[1]], color: '#ffd9a0', intensity: 9, distance: 15 }); }
  // the doors of the arcade: jambs and lintels in dark wood, the leaves folded back
  for (const d of DOORS_F) { B('wood_dark', d - DW_F / 2, d - DW_F / 2 + 0.12, 0, 1.6, 0, 5.8); B('wood_dark', d + DW_F / 2 - 0.12, d + DW_F / 2, 0, 1.6, 0, 5.8); B('wood_dark', d - DW_F / 2, d + DW_F / 2, 0, 1.6, 5.7, 5.8); }
  // ── the doorways from the foyer into the hall: a dark wood frame each
  for (const [d, w] of DOORS_R) { B('wood_dark', d - w / 2 - 0.1, d - w / 2, FOY[1], FOY[1] + 0.3, 0, 6.0); B('wood_dark', d + w / 2, d + w / 2 + 0.1, FOY[1], FOY[1] + 0.3, 0, 6.0); B('wood_dark', d - w / 2, d + w / 2, FOY[1], FOY[1] + 0.3, 5.8, 6.0); B('marble_floor', d - w / 2, d + w / 2, FOY[1], TC - Math.sqrt(RH * RH - d * d) + 0.1, -0.1, 0.0); col.floor([X(d - w / 2), Z(FOY[1]), X(d + w / 2), Z(TC - Math.sqrt(RH * RH - d * d) + 0.1)], Y); }
  // ── the hall: floor, the wall's quads (a gap at the proscenium), the tiers, the ceiling
  B('wood_ochre', -RH, RH, TC - RH, STAGE.t0 - 2.5, -0.1, 0.0); col.floor([X(-RH), Z(TC - RH), X(RH), Z(STAGE.t0 - 2.5)], Y);
  const N = 44, gap = 0.62, lim = Math.PI / 2;     // the stage lies toward +t: angles measured from +t
  const P = (r, a) => [C[0] + Math.sin(a) * r, C[1] + Math.cos(a) * r];
  const tiers = [4.9, 8.7, 12.5, 16.3];
  for (let k = 0; k < N; k++) {
    const a0 = gap + (k / N) * (Math.PI * 2 - 2 * gap), a1 = gap + ((k + 1) / N) * (Math.PI * 2 - 2 * gap);
    vquad(bag, 'plaster_white', P(RH - 0.01, a0), P(RH - 0.01, a1), Y, y + 19.4, C);
    vquad(bag, 'cloth_red', P(RH - 0.02, a0), P(RH - 0.02, a1), Y + 0.9, Y + 2.9, C);
    for (const v of tiers) {
      // the balcony front (gilt, with the red velvet rail), its underside, and the walls of the boxes behind
      vquad(bag, 'gilt_bronze', P(RH - 1.3, a0), P(RH - 1.3, a1), Y + v - 0.5, Y + v + 0.9, C);
      vquad(bag, 'cloth_red', P(RH - 1.3, a0), P(RH - 1.3, a1), Y + v + 0.9, Y + v + 1.12, C);
      hquadDown(bag, 'plaster_white', Y + v - 0.5, [P(RH - 1.3, a0), P(RH - 1.3, a1), P(RH - 0.01, a1), P(RH - 0.01, a0)]);
      if (k % 2 === 0) { const q = P(RH - 1.3, a0); bag.add('gilt_bronze', rod([q[0], Y + v - 0.5, q[1]], [q[0], Y + v + 2.4, q[1]], 0.06, 5)); }
    }
    { const am = (a0 + a1) / 2, sm = Math.sin(am) * RH; if (!(Math.cos(am) < 0 && DOORS_R.some(([d, w]) => Math.abs(sm - d) < w / 2 + 0.5))) col.segment(P(RH + 0.2, a0), P(RH + 0.2, a1), 0.6, Y - 0.2, Y + 22); }
  }
  for (const a of [gap, Math.PI * 2 - gap]) { const q0 = P(RH - 0.01, a), q1 = [q0[0], q0[1] + 0]; void q1; }
  // the proscenium's sides: the hall's walls run on to the arch
  for (const sg of [-1, 1]) { const s = sg * 6.2; bag.add('gilt_bronze', box(X(s - 0.6), Y, Z(STAGE.t0 - 1.5), X(s + 0.6), Y + 14.5, Z(STAGE.t0 - 0.5))); col.rect([X(s - 0.6), Z(STAGE.t0 - 1.5), X(s + 0.6), Z(STAGE.t0 - 0.5)], Y, Y + 14.5); bag.add('marble_column', lathe([[0.45, 0], [0.38, 0.3], [0.32, 9.5], [0.42, 9.8], [0.001, 10]], 10, null, X(sg * 7.4), Y + 0.0, Z(STAGE.t0 - 1.0))); }
  B('gilt_bronze', -7.6, 7.6, STAGE.t0 - 1.5, STAGE.t0 - 0.5, 14.5, 16.4); B('cloth_red', -6.0, 6.0, STAGE.t0 - 1.1, STAGE.t0 - 0.9, 12.9, 14.5); B('gold', -2, 2, STAGE.t0 - 1.7, STAGE.t0 - 1.5, 15.0, 16.2);
  B('ceiling_painted', -RH, RH, TC - RH, STAGE.t0 - 2.5, 19.2, 19.4);
  // the stalls: rows of red seats in two blocks with an aisle, from the hall's back to the orchestra
  let rows = 0;
  for (let t = TC - 9.6; t < STAGE.t0 - 6.5; t += 1.1, rows++) {
    const d = t - TC, ch = Math.sqrt(Math.max(0, (RH - 1.0) ** 2 - d * d)) - 0.8;
    if (ch < 3) continue;
    for (const sg of [-1, 1]) { const a = sg * 1.3, b = sg * Math.min(ch, 8.5); for (let s = Math.min(a, b) + 0.1; s < Math.max(a, b) - 0.3; s += 0.56) { B('cloth_red', s, s + 0.5, t, t + 0.45, 0.42, 0.5); B('cloth_red', s, s + 0.5, t + 0.42, t + 0.5, 0.5, 0.95); B('wood_dark', s + 0.02, s + 0.05, t + 0.05, t + 0.4, 0.0, 0.42); } B('wood_dark', Math.min(a, b), Math.max(a, b), t + 0.5, t + 0.55, 0.0, 0.08, rows % 3 === 0); }
  }
  // the orchestra pit: a rail of dark wood and brass, music stands, the conductor's desk
  B('wood_dark', -7.0, 7.0, STAGE.t0 - 4.6, STAGE.t0 - 4.4, 0.0, 1.1, true); B('gilt_bronze', -7.0, 7.0, STAGE.t0 - 4.65, STAGE.t0 - 4.35, 1.1, 1.15);
  for (let k = 0; k < 10; k++) { const s = -5.2 + k * 1.15, tt = STAGE.t0 - 3.6 + (k % 2) * 0.9; bag.add('iron', rod([X(s), Y, Z(tt)], [X(s), Y + 1.05, Z(tt)], 0.015, 4)); B('paint_white', s - 0.22, s + 0.22, tt - 0.02, tt + 0.02, 1.0, 1.28); B('wood_dark', s - 0.2, s + 0.2, tt - 0.3, tt - 0.1, 0.4, 0.46); }
  B('wood_dark', -0.6, 0.6, STAGE.t0 - 3.0, STAGE.t0 - 2.3, 0.0, 0.2); B('wood_dark', -0.3, 0.3, STAGE.t0 - 2.6, STAGE.t0 - 2.5, 0.2, 1.1);
  // ── the stage: planks a metre above the hall, steps up, the curtain drawn back, the flats, the backcloth, the ropes
  const SH = 1.1;
  B('wood_ochre', -STAGE.s + 0.4, STAGE.s - 0.4, STAGE.t0 - 2.5, STAGE.t1 - 0.5, -0.1, SH);
  for (let k = 0; k < 4; k++) B('wood_ochre', -1.8, 1.8, STAGE.t0 - 4.4 + k * 0.5, STAGE.t0 - 2.5, 0.0, 0.27 * (k + 1));
  col.ramp([X(-1.8), Z(STAGE.t0 - 4.4), X(1.8), Z(STAGE.t0 - 2.5)], Y, Y + SH, 's'); col.floor([X(-STAGE.s + 0.4), Z(STAGE.t0 - 2.5), X(STAGE.s - 0.4), Z(STAGE.t1 - 0.5)], Y + SH);
  for (const sg of [-1, 1]) { for (let k = 0; k < 7; k++) { B('cloth_red', sg * (4.6 + k * 0.28) - 0.14, sg * (4.6 + k * 0.28) + 0.14, STAGE.t0 - 1.2 + (k % 2) * 0.1, STAGE.t0 - 0.9 + (k % 2) * 0.1, SH, 13.2); } B('gold', sg * 4.6 - 0.3, sg * 6.6 + 0.3, STAGE.t0 - 1.3, STAGE.t0 - 0.8, 9.0, 9.2); }
  B('cloth_blue', -14.5, 14.5, STAGE.t1 - 0.9, STAGE.t1 - 0.6, SH, 22); B('cloth_green', -8, 5, STAGE.t1 - 0.86, STAGE.t1 - 0.52, SH, SH + 4.5); B('paint_ochre', 2, 12, STAGE.t1 - 0.84, STAGE.t1 - 0.46, SH + 0.05, SH + 2.2);
  for (const [s, t, w, h, m] of [[-9.5, 42, 3, 8, 'cloth_green'], [9.5, 42, 3, 8, 'cloth_green'], [-10.5, 47, 3.4, 9, 'wood_painted'], [10.5, 47, 3.4, 9, 'wood_painted'], [-11.5, 52, 3, 10, 'cloth_green'], [11.5, 52, 3, 10, 'cloth_green']]) B(m, s - w / 2, s + w / 2, t, t + 0.12, SH, SH + h);
  for (let k = 0; k < 8; k++) { const s = -13 + k * 3.7; bag.add('rope_fibre', rod([X(s), Y + SH, Z(STAGE.t1 - 1.5)], [X(s), Y + 23, Z(STAGE.t1 - 1.5)], 0.03, 4)); }
  B('gilt_bronze', -STAGE.s + 0.4, STAGE.s - 0.4, STAGE.t0 - 2.5, STAGE.t0 - 2.3, SH, SH + 0.1);
  lights?.push({ at: [X(0), Y + SH + 8, Z(46)], color: '#ffe2b0', intensity: 10, distance: 22 });
  // ── the great chandelier: tiers of gilt rings hung with crystal, ninety flames
  for (const rr of [4.8, 3.2, 1.7]) for (let q = 0; q < 3; q++) void q;
  { const cy = Y + 14.6; bag.add('iron', rod([C[0], Y + 19.2, C[1]], [C[0], cy + 1.0, C[1]], 0.04, 5));
    for (const [rr, dy] of [[3.4, 0], [2.4, 0.9], [1.4, 1.7]]) { bag.add('gilt_bronze', lathe([[rr, 0], [rr, 0.1], [rr - 0.12, 0.14], [rr - 0.12, 0.0]], 24, null, C[0], cy + dy, C[1])); for (let k = 0; k < Math.round(rr * 6); k++) { const a = k / Math.round(rr * 6) * 6.283, q = [C[0] + Math.cos(a) * rr, C[1] + Math.sin(a) * rr]; bag.add('ivory', rod([q[0], cy + dy + 0.1, q[1]], [q[0], cy + dy + 0.45, q[1]], 0.04, 4)); bag.add('flame', lathe([[0.001, 0], [0.05, 0.06], [0.001, 0.16]], 5, null, q[0], cy + dy + 0.45, q[1])); bag.add('lamp_glass', lathe([[0.001, 0], [0.03, -0.15], [0.001, -0.35]], 5, null, q[0], cy + dy, q[1])); } }
    bag.add('lamp_glass', lathe([[0.001, -0.9], [0.5, -0.3], [0.5, 0.0], [0.001, 0.2]], 12, null, C[0], cy - 0.2, C[1]));
    for (const [dx, dz] of [[0, 0], [0, 0]]) lights?.push({ at: [C[0] + dx, cy + 0.5, C[1] + dz], color: '#ffd9a0', intensity: 14, distance: 26 }); }
}
