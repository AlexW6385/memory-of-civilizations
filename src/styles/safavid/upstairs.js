// The upper floor of a courtyard house of Isfahan (docs/settlements/isfahan.md §25): a flight of brick steps in the court
// up to a landing at the roof of the kitchen or store wing; on that roof the upper room (balakhaneh) with its
// five-window face on the court, its windows on the lane and the door on the terrace, and the terrace where the household
// sleeps in summer, behind a parapet, with a wind-catcher (badgir) over the room. Uses only the materials a house of the
// settlement already has (one mesh per material in the plan), pieces turned by rule from the house's seed.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';
import { P as Pt, TREAD, STRIP, ascent } from './stairplan.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A vertical panel from (x0, z0) to (x1, z1), its foot at ya → yb, h high, both faces and no top (the walker steps onto a top). */
function panel(bag, mat, a, b, ya, yb, h) {
  const A = [a[0], ya, a[1]], B = [b[0], yb, b[1]], C = [b[0], yb + h, b[1]], D = [a[0], ya + h, a[1]];
  bag.add(mat, fromTriangles([...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C]));
}

/**
 * pl: stairplan.js's plan; M: the house's materials ({ out, in, ceiling, beam }); kind: 'merchant' | 'craftsman' |
 * 'tenement' | 'inn'; seed: the house's.
 */
export function houseUpstairs({ bag, col, lights }, pl, M, kind, seed) {
  const R = rng(seed ^ 0x5a17), { hB, dw, L, Lr, uF, run, n, riser, landLen } = pl, S = STRIP;
  const yawA = pl.side === 's' ? 0 : Math.PI / 2;
  const p = (t, v) => Pt(pl, t, v);
  const rectOf = (t0, t1, v0, v1) => { const a = p(t0, v0), b = p(t1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const bx = (mat, t0, t1, v0, v1, y0, y1) => { const r = rectOf(t0, t1, v0, v1); if (r[2] - r[0] > 0.002 && r[3] - r[1] > 0.002 && y1 - y0 > 0.002) bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); };
  const co = (t0, t1, v0, v1, y0, y1) => { if (y1 - y0 > 0.01) col.rect(rectOf(t0, t1, v0, v1), y0, y1); };
  const solid = (mat, t0, t1, v0, v1, y0, y1) => { bx(mat, t0, t1, v0, v1, y0, y1); co(t0, t1, v0, v1, y0, y1); };

  // ---- the flight: brick steps solid to the court, 1.2 m wide along the court face, a landing at the roof's level
  const y0r = 0.04 + riser / 2, y1r = hB - riser / 2, line = (t) => 0.04 + (t - uF) / TREAD * riser, surf = (t) => y0r + (t - uF) / run * (y1r - y0r);
  for (let i = 0; i < n; i++) { const t0 = uF + i * TREAD; bx('brick_buff', t0, t0 + TREAD, -S, 0, 0.04, 0.04 + (i + 1) * riser); }
  const tL = uF + run;
  bx('brick_buff', tL, L, -S, 0, 0.04, hB - 0.1); bx('limestone', tL, L, -S, 0, hB - 0.1, hB);
  col.floor(rectOf(tL, L, -S, 0), hB);
  col.ramp(rectOf(uF, tL, -S, 0), y0r, y1r, ascent(pl));
  col.rect(rectOf(tL, L, -S, 0), 0.04, hB - 0.45);
  for (let k = 0; uF + 2 * k * TREAD < tL - 0.01; k++) {          // the mass under the flight, below what the stair's own surface cuts away
    const ta = uF + 2 * k * TREAD, tb = Math.min(ta + 2 * TREAD, tL), y1 = surf(ta) - 0.15;
    if (y1 > 0.12) col.rect(rectOf(ta, tb, -S, 0), 0.04, y1);
  }
  // the guard along the open side: posts, a rail and the balusters as flat panels without tops, in sections a metre long
  const vg = -S - 0.05;
  for (let ta = uF; ta < tL - 0.01; ta += 1.0) {
    const tb = Math.min(ta + 1.0, tL), a = p(ta, vg), b = p(tb, vg);
    panel(bag, 'wood_dark', a, b, line(ta) + 0.82, line(tb) + 0.82, 0.08);
    panel(bag, 'wood_dark', a, b, line(ta) + 0.3, line(tb) + 0.3, 0.05);
    bx('wood_dark', ta - 0.04, ta + 0.04, vg - 0.04, vg + 0.04, line(ta) - 0.1, line(ta) + 0.98);
    col.segment(a, b, 0.08, line(ta) - 0.05, line(tb) + 0.95);
  }
  { const a = p(tL, vg), b = p(L, vg);
    panel(bag, 'wood_dark', a, b, hB + 0.82, hB + 0.82, 0.08); panel(bag, 'wood_dark', a, b, hB + 0.3, hB + 0.3, 0.05);
    for (const t of [tL, (tL + L) / 2, L - 0.04]) bx('wood_dark', t - 0.04, t + 0.04, vg - 0.04, vg + 0.04, hB, hB + 0.98);
    col.segment(a, b, 0.08, hB, hB + 0.95); }

  // ---- the terrace: a parapet on the lane (the wing's own, raised to 0.95 m), a wall at the end, the court's edge guarded but for the landing
  solid(M.out, Lr, L, dw - 0.25, dw, hB + 0.55, hB + 0.95); co(Lr, L, dw - 0.25, dw, hB, hB + 0.55);
  solid(M.out, L - 0.3, L, 0, dw - 0.25, hB, hB + 0.9);
  { const a = p(Lr, 0.04), b = p(tL, 0.04);
    panel(bag, 'wood_dark', a, b, hB + 0.82, hB + 0.82, 0.08); panel(bag, 'wood_dark', a, b, hB + 0.3, hB + 0.3, 0.05);
    for (let t = Lr; t < tL + 0.01; t += (tL - Lr) / Math.max(1, Math.round((tL - Lr) / 1.1))) bx('wood_dark', t - 0.04, t + 0.04, 0, 0.08, hB, hB + 0.98);
    col.segment(a, b, 0.08, hB, hB + 0.95); }

  // ---- the upper room on the roof of the foot half: walls of the house's own material, plaster within, a painted ceiling
  const T0 = 0.35, T1 = Lr - 0.35, V0 = 0.35, V1 = dw - 0.47, vm = (V0 + V1) / 2, len = T1 - T0, dep = V1 - V0, CH = 3.0;
  const pieces = (u0, u1, holes, ya, yb, emit) => {
    let u = u0;
    for (const h of holes.slice().sort((q, r) => q.c - r.c)) { const a = h.c - h.w / 2, b = h.c + h.w / 2; if (a > u) emit(u, a, ya, yb, true); emit(a, b, ya, h.y0, true); emit(a, b, h.y1, yb, false); u = b; }
    if (u1 > u) emit(u, u1, ya, yb, true);
  };
  const frame = (alongT, c, w, y0, y1, f0, f1) => {                       // a wooden frame on the inner face of a hole
    const E = (u0, u1, y, yy) => (alongT ? bx('wood_dark', u0, u1, f0, f1, y, yy) : bx('wood_dark', f0, f1, u0, u1, y, yy));
    E(c - w / 2 - 0.06, c - w / 2, y0 - 0.05, y1 + 0.06); E(c + w / 2, c + w / 2 + 0.06, y0 - 0.05, y1 + 0.06); E(c - w / 2 - 0.06, c + w / 2 + 0.06, y1, y1 + 0.06);
    if (y0 > hB + 0.3) E(c - w / 2 - 0.06, c + w / 2 + 0.06, y0 - 0.05, y0);
  };
  const yT = hB + CH + 0.08;
  // the court wall: five windows in a row (a three-window one in a short room)
  const nw = len >= 4.2 ? 5 : 3, cwH = [];
  for (let i = 0; i < nw; i++) cwH.push({ c: T0 + (i + 0.5) * len / nw, w: 0.75, y0: hB + 0.9, y1: hB + 2.4 });
  pieces(0, Lr, cwH, hB, yT, (u0, u1, ya, yb, sol) => { bx(M.out, u0, u1, 0, 0.35, ya, yb); if (sol) co(u0, u1, 0, 0.35, ya, yb); bx(M.in, u0, u1, 0.35, 0.38, ya, yb); });
  for (const h of cwH) { frame(true, h.c, h.w, h.y0, h.y1, 0.38, 0.45); for (const s of [-0.2, 0, 0.2]) bx('wood_dark', h.c + s - 0.012, h.c + s + 0.012, 0.1, 0.13, h.y1 - 0.5, h.y1); }
  // the lane wall: two windows, open reveals with their frames
  const lwH = [0.3, 0.7].map((f) => ({ c: T0 + f * len, w: 0.9, y0: hB + 0.95, y1: hB + 2.25 }));
  pieces(0, Lr, lwH, hB, yT, (u0, u1, ya, yb, sol) => { bx(M.out, u0, u1, dw - 0.47, dw - 0.02, ya, yb); if (sol) co(u0, u1, dw - 0.47, dw - 0.02, ya, yb); bx(M.in, u0, u1, dw - 0.5, dw - 0.47, ya, yb); });
  for (const h of lwH) frame(true, h.c, h.w, h.y0, h.y1, dw - 0.54, dw - 0.5);
  // the end walls: the far one solid, the one toward the terrace with the door
  const endWall = (t0, t1, holes, lin0, lin1) => pieces(V0, V1, holes, hB, yT, (u0, u1, ya, yb, sol) => { bx(M.out, t0, t1, u0, u1, ya, yb); if (sol) co(t0, t1, u0, u1, ya, yb); bx(M.in, lin0, lin1, u0, u1, ya, yb); });
  endWall(0, T0, [], T0, T0 + 0.03);
  const doorH = [{ c: vm, w: 1.1, y0: hB, y1: hB + 2.2 }];
  endWall(T1, Lr, doorH, T1 - 0.03, T1);
  frame(false, vm, 1.1, hB, hB + 2.2, T1 - 0.1, T1 - 0.03);
  if (kind === 'tenement') {                                              // a partition: two cells, a door between
    const tm = (T0 + T1) / 2 - 0.2;
    pieces(V0, V1, [{ c: vm, w: 0.9, y0: hB, y1: hB + 2.1 }], hB, hB + CH, (u0, u1, ya, yb, sol) => { bx(M.in, tm - 0.07, tm + 0.07, u0, u1, ya, yb); if (sol) co(tm - 0.07, tm + 0.07, u0, u1, ya, yb); });
    frame(false, vm, 0.9, hB, hB + 2.1, tm + 0.07, tm + 0.12);
  }
  bx(M.ceiling, T0, T1, V0, V1, hB + CH, hB + CH + 0.08);
  bx(M.out, 0, Lr, 0, dw - 0.02, yT, yT + 0.2);
  for (let k = 0; k < Math.round(len / 0.7); k++) { const t = T0 + (k + 0.5) * len / Math.round(len / 0.7); bx(M.beam ?? 'wood_dark', t - 0.07, t + 0.07, V0 + 0.035, V1 - 0.035, hB + CH - 0.16, hB + CH); }
  const lc = p(T0 + len * 0.5, vm);
  bag.add('bronze', box(lc[0] - 0.012, hB + CH - 0.6, lc[1] - 0.012, lc[0] + 0.012, hB + CH, lc[1] + 0.012));
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0.05], [0.2, 0.16], [0.17, 0.26], [0.05, 0.3], [0.001, 0.31]], 12, null, lc[0], hB + CH - 0.9, lc[1]));
  lights.push({ at: [lc[0], hB + CH - 0.8, lc[1]], color: '#ffb46b', intensity: 3.2, distance: 6.5 });

  // ---- what the room is used for (t along the wing from the foot end, v from the court face; the door on the terrace side at T1)
  const at = p, y = hB + 0.012;
  const cush = (t, v, w, d, h, yw, m, yy = y) => { const q = at(t, v); F.cushion(bag, q[0], yy, q[1], w, d, h, yw, m); };
  const bolster = (t, v, ln, m, e) => { const q = at(t, v); F.bolster(bag, q[0], y, q[1], ln, 0.13, yawA, m, e); };
  const chest = (t, v, w, d, h, yw = yawA) => { const q = at(t, v); F.chest(bag, q[0], y, q[1], w, d, h, yw); };
  const jar = (t, v, k = 1) => { const q = at(t, v); F.waterJar(bag, q[0], y, q[1], k); };
  const pad = (t, v, w, d, m) => { const q = at(t, v); F.kilim(bag, q[0], y, q[1], w, d, yawA, m); };
  const rollQuilts = (t, v, side) => { for (let k = 0; k < 3; k++) cush(t, v, 0.95, 0.6, 0.12, yawA, ['cloth_white', 'cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][(k + side) % 5], y + 0.58 + k * 0.11); };
  const lamp = (t, v, yy) => { const q = at(t, v); bag.add('bronze', lathe([[0.001, 0], [0.04, 0], [0.06, 0.03], [0.05, 0.1], [0.001, 0.12]], 8, null, q[0], yy, q[1])); lights.push({ at: [q[0], yy + 0.2, q[1]], color: '#ffb060', intensity: 1.4, distance: 4 }); };
  if (kind === 'merchant') {
    const c = at((T0 + T1) / 2 - 0.15, vm); F.carpet(bag, c[0], y, c[1], len - 1.5, dep - 0.7, yawA, ['persian', 'blue', 'maroon'][Math.floor(R() * 3)]);
    chest(T0 + 0.5, V1 - 0.4, 1.0, 0.56, 0.6); rollQuilts(T0 + 0.5, V1 - 0.4, 0); lamp(T0 + 0.5, V1 - 0.4, y + 0.66 + 0.33);
    { const q = at(T0 + 0.85, V0 + 0.62); F.rolledCarpets(bag, q[0], y, q[1], 5, 1.3, yawA); }
    bolster(T0 + len * 0.45, V1 - 0.22, 1.5, 'cloth_indigo', 'cloth_ochre'); bolster(T0 + len * 0.7, V1 - 0.22, 1.5, 'cloth_red', 'cloth_ochre');
    { const q = at(T0 + len * 0.55, vm + 0.1); F.ewer(bag, q[0], y, q[1], 1, 0.6); bag.add('wood_dark', lathe([[0.001, 0], [0.34, 0], [0.34, 0.03], [0.05, 0.03], [0.05, 0.24], [0.36, 0.26], [0.36, 0.29], [0.001, 0.29]], 14, null, q[0] - 0.7, y, q[1])); }
    cush(T1 - 1.9, V1 - 0.5, 0.9, 0.55, 0.28, yawA, 'cloth_maroon', y); cush(T1 - 1.9, V1 - 0.5, 0.8, 0.5, 0.26, yawA, 'cloth_ochre', y + 0.27);
  } else if (kind === 'craftsman') {                                      // a loom stood against the far wall, hanks of dyed wool on a pole
    const lt = T0 + 0.3, lw = Math.min(0.85, dep / 2 - 0.15);
    for (const s of [-1, 1]) bx('wood_dark', lt - 0.05, lt + 0.05, vm + s * lw - 0.05, vm + s * lw + 0.05, y, y + 1.95);
    bx('wood_dark', lt - 0.05, lt + 0.05, vm - lw, vm + lw, y + 1.85, y + 1.95); bx('wood_dark', lt - 0.05, lt + 0.05, vm - lw, vm + lw, y + 0.3, y + 0.4);
    for (let k = 0; k < 15; k++) bx('cloth_white', lt - 0.006, lt + 0.006, vm - lw + 0.1 + k * (2 * lw - 0.2) / 14 - 0.005, vm - lw + 0.1 + k * (2 * lw - 0.2) / 14 + 0.005, y + 1.0, y + 1.85);
    bx('cloth_red', lt - 0.02, lt + 0.02, vm - lw + 0.08, vm + lw - 0.08, y + 0.4, y + 1.0); bx('cloth_indigo', lt - 0.025, lt + 0.025, vm - lw + 0.08, vm + lw - 0.08, y + 0.64, y + 0.72);
    bx('wood_dark', T0 + 0.85, T0 + 1.2, vm - 0.2, vm + 0.15, y, y + 0.3);
    bx('wood_dark', T0 + 1.6, T1 - 0.9, V1 - 0.2, V1 - 0.14, y + 2.0, y + 2.06);
    for (let k = 0; k < 7; k++) { const t = T0 + 1.75 + k * (len - 3.0) / 6; bx(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][k % 4], t - 0.05, t + 0.05, V1 - 0.19, V1 - 0.15, y + 1.4, y + 2.0); }
    for (let k = 0; k < 3; k++) cush(T0 + 0.5 + k * 0.08, V0 + 0.45 + (k === 2 ? 0.1 : 0), 0.7, 0.5, 0.36, yawA + k * 0.3, k === 1 ? 'cloth_white' : 'cloth_ochre', y + (k === 2 ? 0.34 : 0));
    pad(T0 + len * 0.55, V1 - 0.55, 1.7, 0.8, ['cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white']); bolster(T0 + len * 0.55 + 0.7, V1 - 0.5, 0.9, 'cloth_green', 'cloth_ochre');
    jar(T1 - 1.5, V0 + 0.4, 0.9);
  } else if (kind === 'tenement') {                                      // two households: a cell each, a mat, quilts rolled, a pot
    const tm = (T0 + T1) / 2 - 0.2;
    pad((T0 + tm) / 2, V1 - 0.6, 1.5, 0.8, ['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_white']); bolster(T0 + 0.5, V1 - 0.6, 0.8, 'cloth_red', 'cloth_ochre');
    chest(T0 + 0.5, V0 + 0.35, 0.8, 0.5, 0.5); rollQuilts(T0 + 0.5, V0 + 0.35, 1);
    { const q = at((T0 + tm) / 2, V0 + 0.4); F.pots(bag, q[0], y, q[1], yawA, 4, ['terracotta', 'glaze_blue', 'terracotta']); }
    pad((tm + T1) / 2 - 0.3, V1 - 0.6, 1.5, 0.8, ['cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_white']); bolster(tm + 0.5, V1 - 0.6, 0.8, 'cloth_indigo', 'cloth_ochre');
    jar(tm + 0.45, V0 + 0.4, 0.9); lamp(tm + 0.45, V1 - 0.2, y);
    { const q = at(T1 - 1.5, V0 + 0.4); F.pots(bag, q[0], y, q[1], yawA, 3, ['terracotta', 'glaze_green', 'terracotta']); }
  } else {                                                                  // a room for travellers: pallets along the wall, their saddlebags at the heads
    for (let k = 0; k < 3; k++) {
      const t = T0 + 0.95 + k * Math.min(1.25, (len - 1.2) / 3);
      pad(t, V1 - 0.5, 1.1, 0.8, [['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'], ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white'], ['cloth_ochre', 'cloth_green', 'cloth_red', 'cloth_white']][k]);
      bolster(t + 0.0, V1 - 0.18, 0.9, ['cloth_green', 'cloth_maroon', 'cloth_indigo'][k], 'cloth_ochre');
      { const q = at(t, V1 - 0.95); F.saddlebag(bag, q[0], y, q[1], yawA + (k - 1) * 0.25, k === 1 ? ['cloth_maroon', 'cloth_ochre'] : ['cloth_red', 'cloth_indigo']); }
    }
    pad((T0 + T1) / 2, V0 + 0.7, len - 1.8, 0.9, ['cloth_maroon', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
    jar(T0 + 0.4, V0 + 0.4, 1.0); lamp(T0 + 0.4, V1 - 0.2, y + 0.6);
  }

  // ---- the terrace: a bed for the summer nights along the parapet (a mattress only where the terrace is short), a jar of water in the shade of it; the lane from the landing to the door stays free
  { const tb = L - 1.3, vb = dw - 1.0;
    if (L - Lr >= 3.4) {
      const bw = 0.9, bl = 1.9, h = 0.42, q = at(tb, vb);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const lp = at(tb + sx * (bl / 2 - 0.05), vb + sz * (bw / 2 - 0.05)); bag.add('wood_painted', box(lp[0] - 0.035, y, lp[1] - 0.035, lp[0] + 0.035, y + h, lp[1] + 0.035)); }
      bx('timber', tb - bl / 2, tb + bl / 2, vb - bw / 2, vb + bw / 2, y + h - 0.1, y + h - 0.04);
      F.cushion(bag, q[0], y + h - 0.04, q[1], bl * 0.85, bw * 0.85, 0.1, yawA, ['cloth_indigo', 'cloth_red', 'cloth_ochre'][Math.floor(R() * 3)]);
      const hd = at(tb - bl * 0.36, vb); F.cushion(bag, hd[0], y + h + 0.05, hd[1], 0.5, 0.6, 0.12, yawA, 'cloth_white');
      col.circle(q[0], q[1], 0.9, y, y + h);
    } else { const q = at(tb, vb); F.cushion(bag, q[0], y, q[1], 1.5, 0.8, 0.1, yawA, ['cloth_indigo', 'cloth_red', 'cloth_ochre'][Math.floor(R() * 3)]); const hd = at(tb - 0.5, vb); F.cushion(bag, hd[0], y + 0.1, hd[1], 0.45, 0.55, 0.12, yawA, 'cloth_white'); }
  }
  jar(Lr + 0.55, dw - 0.55, 1.0);
  // the wind-catcher over the room: a tower of four piers open on every side, crossed inside by two thin walls, a flat cap
  if (R() < 0.6) {
    const tc = Lr * 0.45, vc = dw - 1.35, hw = 0.7, y0 = yT + 0.2, th = 3.1;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bx(M.out, tc + sx * hw - (sx > 0 ? 0.3 : 0), tc + sx * hw + (sx < 0 ? 0.3 : 0), vc + sz * hw - (sz > 0 ? 0.3 : 0), vc + sz * hw + (sz < 0 ? 0.3 : 0), y0, y0 + th);
    bx(M.out, tc - 0.04, tc + 0.04, vc - hw + 0.3, vc + hw - 0.3, y0, y0 + th); bx(M.out, tc - hw + 0.3, tc + hw - 0.3, vc - 0.04, vc + 0.04, y0, y0 + th);
    bx('wood_dark', tc - hw - 0.12, tc + hw + 0.12, vc - hw - 0.12, vc + hw + 0.12, y0 + th, y0 + th + 0.14);
    bx(M.out, tc - hw - 0.04, tc + hw + 0.04, vc - hw - 0.04, vc + hw + 0.04, y0 + th + 0.14, y0 + th + 0.3);
  }
}
