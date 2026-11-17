// The Apostolic Palace about 1670 (docs/settlements/baroque-rome.md §4e): Sixtus V's block with its rusticated base, its rows of windows
// under alternating pediments, quoins, string courses and a crowning cornice on modillions, a gate passage to the Cortile di
// San Damaso; the courtyard with Bramante's and Raphael's loggias in three tiers of arches, balustrades, imposts and keystones, the
// ground gallery to walk in; the attic of the last floor and its roofs and chimneys. The block is a ring of wings round the court.

import { Matrix4 } from '../../core/three.js';
import { box, lathe, frustum } from '../../core/geom.js';
import { Local, ext, archOutline, voussoirs, faceFrame, wrect } from '../renaissance/face.js';

const T = 'travertine', WALL = 'stucco_ochre', TW = 6.4;       // the ground tier's height (the soffit of the gallery)
/** A frame with u along (ux, uz), y up, d along the normal (−uz, ux), the origin at (ox, oz). */
function frame(ux, uz, ox, oz) { return new Matrix4().set(ux, 0, -uz, ox, 0, 1, 0, 0, uz, 0, ux, oz, 0, 0, 0, 1); }

/** palace_apostolic: { rect (the block), court (the cortile's clear rectangle), h (to the cornice), gate (x of the passage's axis) } */
export function palaceApostolic(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, C = el.court, H = el.h ?? 26, gx = el.gate ?? (C[0] + C[2]) / 2, GW = 2.0;
  const GR = [C[0] - 3.5, C[1] - 3.5, C[2] + 3.5, C[3] + 3.5], U = [C[0] - 1, C[1] - 1, C[2] + 1, C[3] + 1];
  const mass = (r, ya, yb, mat = WALL, solid = true) => { bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (solid) col.rect(r, Math.max(ya, 0), yb); };
  // ── the masses: the ground tier of the wings (the gallery ring cut out; the gate passage through the south wing), the upper tiers
  mass([x0, z0, x1, GR[1]], -0.5, TW); mass([x0, GR[1], GR[0], GR[3]], -0.5, TW); mass([GR[2], GR[1], x1, GR[3]], -0.5, TW);
  mass([x0, GR[3], gx - GW, z1], -0.5, TW); mass([gx + GW, GR[3], x1, z1], -0.5, TW);
  mass([x0, z0, x1, U[1]], TW, H); mass([x0, U[1], U[0], U[3]], TW, H); mass([U[2], U[1], x1, U[3]], TW, H); mass([x0, U[3], x1, z1], TW, H);
    bag.add('flagstone', box(GR[0], -0.3, GR[1], GR[2], 0.03, GR[3])); bag.add('flagstone', box(gx - GW, -0.3, GR[3], gx + GW, 0.03, z1 + 2.2));
  // ── the outer faces: rustication below, rows of windows, quoins, string courses and the crowning cornice
  const outer = (f) => {
    const { M, L: len } = faceFrame(el.rect, f, 0), Lc = new Local(), n = Math.max(4, Math.round(len / 5)), bay = len / n, isGate = f === 's';
    const gu = gx - x0;
    // rustication: a dark ground, courses of travertine with their joints, cut where the barred windows are
    const wins = []; for (let i = 0; i < n; i++) { const u = (i + 0.5) * bay; if (!(isGate && Math.abs(u - gu) < 3.8)) wins.push([u - 0.8, u + 0.8]); }
    const spansFor = (ya, yb) => {
      let sp = isGate ? [[0.5, gu - 3.4], [gu + 3.4, len - 0.5]] : [[0.5, len - 0.5]];
      if (yb > 1.1 && ya < 3.5) for (const [wa, wb] of wins) sp = sp.flatMap(([p, q]) => (wb <= p || wa >= q ? [[p, q]] : [[p, Math.max(p, wa)], [Math.min(q, wb), q]])).filter(([p, q]) => q - p > 0.05);
      return sp;
    };
    if (isGate) { Lc.box('brick', 0, 0, 0, gu - GW, 5.2, 0.04); Lc.box('brick', gu + GW, 0, 0, len, 5.2, 0.04); } else Lc.box('brick', 0, 0, 0, len, 5.2, 0.04);
    for (let k = 0; k < 9; k++) { const ya = 0.02 + k * 0.58; for (const [ua, ub] of spansFor(ya, ya + 0.5)) Lc.box(T, ua, ya, 0.04, ub, ya + 0.5, 0.15); }
    for (let k = 0; k < 4; k++) { const ya = 5.0 + k * 5.4 - (k === 0 ? 0 : 0); Lc.box(T, -0.12, ya, 0, len + 0.12, ya + 0.3, 0.3 - (k === 0 ? 0.04 : 0)); }
    // quoins at the two corners: long and short blocks by turns
    for (let k = 0; k < 24; k++) for (const [ua, ub] of [[0, k % 2 ? 1.5 : 1.0], [len - (k % 2 ? 1.5 : 1.0), len]]) { const ya = 5.5 + k * 0.8; if (ya + 0.7 < H - 1.6) Lc.box(T, ua, ya, 0, ub, ya + 0.72, 0.1); }
    // the crowning cornice: frieze, modillions, a projecting corona
    Lc.box(T, -0.3, H - 1.7, 0, len + 0.3, H - 1.5, 0.5); Lc.box(WALL, 0, H - 1.5, 0, len, H - 0.7, 0.1);
    for (let u = 0.4; u < len - 0.3; u += 0.8) Lc.box(T, u, H - 1.5, 0, u + 0.3, H - 0.7, 0.7);
    Lc.box(T, -0.5, H - 0.7, 0, len + 0.5, H, 0.9);
    // windows: the base storey barred and low, the piano nobile under alternating pediments, then hoods, lintels, and the square windows of the attic
    const win = (u, y0, w, h, kind) => {
      Lc.box('opening', u - w, y0, -0.02, u + w, y0 + h, 0.03);
      Lc.box(T, u - w - 0.22, y0 - 0.05, 0, u - w, y0 + h, 0.2); Lc.box(T, u + w, y0 - 0.05, 0, u + w + 0.22, y0 + h, 0.2); Lc.box(T, u - w - 0.32, y0 - 0.3, 0, u + w + 0.32, y0 - 0.05, 0.3);
      if (kind === 'tri') for (let k = 0; k < 4; k++) { const wk = (w + 0.5) * (1 - k / 4); Lc.box(T, u - wk, y0 + h + 0.22 + k * 0.17, 0, u + wk, y0 + h + 0.22 + (k + 1) * 0.17, 0.3 - k * 0.02); }
      else if (kind === 'seg') { const pts = [[-w - 0.5, 0], [w + 0.5, 0]]; for (let i = 1; i < 10; i++) { const a = i / 10 * Math.PI; pts.push([Math.cos(a) * (w + 0.5), Math.sin(a) * 0.55]); } pts.reverse(); Lc.add(T, ext(pts.map(([a, b]) => [u + a, y0 + h + 0.22 + b]), [], 0, 0.28, 1)); }
      if (kind === 'tri' || kind === 'seg') Lc.box(T, u - w - 0.45, y0 + h, 0, u + w + 0.45, y0 + h + 0.22, 0.3);
      else Lc.box(T, u - w - 0.3, y0 + h, 0, u + w + 0.3, y0 + h + 0.2, 0.25);
    };
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * bay, atGate = isGate && Math.abs(u - gu) < 3.8, c = isGate && Math.abs(u - gu) < 0.1;
      if (!atGate) { Lc.box('iron', u - 0.45, 1.5, 0.0, u + 0.45, 3.0, 0.02); win(u, 1.4, 0.45, 1.7, 'plain'); }
      if (c) win(u, 7.6, 1.0, 3.2, 'seg'); else if (!atGate) win(u, 6.3, 0.8, 3.2, i % 2 ? 'seg' : 'tri');
      if (c) { Lc.box(T, u - 0.7, 12.1, 0, u + 0.7, 14.2, 0.18); Lc.box('gilt_bronze', u - 0.45, 12.5, 0.18, u + 0.45, 12.6, 0.22); Lc.box('gilt_bronze', u - 0.06, 12.3, 0.18, u + 0.06, 13.9, 0.22); Lc.box(T, u - 0.25, 14.2, 0, u + 0.25, 14.5, 0.3); } else win(u, 11.7, 0.75, 2.9, 'plain'); win(u, 17.0, 0.7, 2.5, 'plain'); win(u, 21.4, 0.45, 1.4, 'plain');
    }
    if (isGate) {                                                                                  // the gate: a rusticated arch under a balcony of the central window
      voussoirs(Lc, T, gu, 4.0, 2.2, 3.1, 0, 0.35, 11, 0.05); Lc.box(T, gu - 0.4, 6.7, 0, gu + 0.4, 7.5, 0.42);
      for (const s of [-1, 1]) Lc.box(T, gu + s * 2.65 - 0.45, 0, 0, gu + s * 2.65 + 0.45, 4.0, 0.35);
      Lc.box(T, gu - 2.2, 7.0, 0.35, gu + 2.2, 7.25, 1.1); for (const s of [-1, 1]) Lc.box(T, gu + s * 1.5 - 0.15, 6.5, 0.35, gu + s * 1.5 + 0.15, 7.0, 0.8);
      Lc.box(T, gu - 2.2, 8.0, 0.9, gu + 2.2, 8.15, 1.1); for (let u = gu - 2.05; u < gu + 2.1; u += 0.3) Lc.add(T, lathe([[0.06, 0], [0.1, 0.2], [0.06, 0.5], [0.001, 0.82]], 6, null, u, 7.25, 1.0));
    }
    Lc.emit(bag, M);
  };
  for (const f of ['n', 's', 'e', 'w']) outer(f);
  // ── the court: four arcades of three tiers (the ground tier open to the gallery); frames with d = 0 at the upper wings' face, the front plane at d = 1
  const BW = 3.0, arcs = [
    { M: frame(1, 0, C[0] - 1, U[1]), len: C[2] - C[0] + 2, n: 9, gate: false },       // north wing's face, looking south
    { M: frame(-1, 0, C[2] + 1, U[3]), len: C[2] - C[0] + 2, n: 9, gate: true },       // south
    { M: frame(0, -1, U[0], C[3]), len: C[3] - C[1], n: 7, gate: false },              // west
    { M: frame(0, 1, U[2], C[1]), len: C[3] - C[1], n: 7, gate: false },               // east
  ];
  for (const { M, len, n } of arcs) {
    const Lc = new Local(), bay = len / n, rows = [[0, 4.9], [6.9, 10.4], [12.7, 16.2]];
    const holes = []; for (let i = 0; i < n; i++) for (const [yb, ys] of rows) holes.push(archOutline((i + 0.5) * bay, yb, BW, ys, 'round', 8));
    const g = ext([[0, -0.5], [len, -0.5], [len, 18.2], [0, 18.2]], holes, 0, 1, 1); g.applyMatrix4(M); bag.add(T, g);
    // the piers stand in the way below the soffit
    for (let i = 0; i <= n; i++) { const u0 = Math.max(0, i * bay - (bay - BW) / 2), u1 = Math.min(len, i * bay + (bay - BW) / 2); if (u1 > u0) col.rect(wrect(M, u0, 0, u1, 1.0), 0, TW); }
    col.rect(wrect(M, 0, 0, len, 1.0), TW, H);
    // string courses at the floors, the cornice on modillions, impost mouldings and keystones, balustrades before the tiers above
    Lc.box(T, -0.1, 6.45, 1.0, len + 0.1, 6.85, 1.3); Lc.box(T, -0.1, 12.0, 1.0, len + 0.1, 12.5, 1.25); Lc.box(T, -0.3, 18.2, 0, len + 0.3, 18.5, 1.5); Lc.box(T, -0.3, 18.5, 0, len + 0.3, 19.1, 1.7);
    for (let u = 0.3; u < len - 0.2; u += 0.7) Lc.box(T, u, 17.7, 1.0, u + 0.25, 18.2, 1.5);
    for (let i = 0; i < n; i++) {
      const uc = (i + 0.5) * bay;
      for (const [yb, ys] of rows) {
        for (const s of [-1, 1]) Lc.box(T, uc + s * (BW / 2 + 0.02) - (s < 0 ? 0.15 : -0.0), ys - 0.12, 1.0, uc + s * (BW / 2 + 0.02) + (s < 0 ? 0 : 0.15), ys + 0.12, 1.12);
        Lc.box(T, uc - 0.28, ys + BW / 2 + 0.05, 1.0, uc + 0.28, ys + BW / 2 + 0.75, 1.14);
      }
      for (const yb of [6.9, 12.7]) {
        Lc.box(T, uc - BW / 2, yb, 0.35, uc + BW / 2, yb + 0.2, 0.7); Lc.box(T, uc - BW / 2, yb + 1.0, 0.35, uc + BW / 2, yb + 1.15, 0.7);
        for (let u = uc - BW / 2 + 0.12; u < uc + BW / 2 - 0.05; u += 0.33) Lc.add(T, lathe([[0.05, 0], [0.09, 0.15], [0.05, 0.4], [0.08, 0.7], [0.001, 0.8]], 6, null, u, yb + 0.2, 0.52));
      }
    }
    for (let i = 0; i <= n; i++) { const u = i * bay; for (const [a, b] of [[0, TW - 0.2], [6.9, 11.9], [12.7, 17.7]]) { if (u > 0.3 && u < len - 0.3) Lc.box('plaster_white', u - 0.3, a + 0.0, 1.0, u + 0.3, b, 1.1); } }
    // behind the upper tiers: the walls of the loggias, painted (grotesques of Raphael's second tier), and doors of the gallery
    Lc.box('paint_ochre', 0.0, 6.9, 0.0, len, 11.9, 0.02); Lc.box('stucco_rome', 0.0, 12.7, 0.0, len, 17.7, 0.02);
    for (let i = 0; i < n; i++) { const uc = (i + 0.5) * bay; for (const k of [-1, 1]) { Lc.box('plaster_white', uc + k * 0.9 - 0.16, 7.2, 0.02, uc + k * 0.9 + 0.16, 11.5, 0.07); Lc.box('cloth_red', uc - 0.6, 7.2, 0.02, uc + 0.6, 7.45, 0.05); }
      if (i % 2 === 0) { Lc.box(T, uc - 0.85, 0.0, -2.52, uc + 0.85, 3.4, -2.42); Lc.box('wood_dark', uc - 0.7, 0.0, -2.5, uc + 0.7, 3.25, -2.4); } }
    Lc.emit(bag, M);
    // the attic windows of the last floor, above the cornice, on the face set back
    const La = new Local(); for (let i = 0; i < n; i++) { const uc = (i + 0.5) * bay; La.box('opening', uc - 0.4, 21.2, -0.02, uc + 0.4, 22.8, 0.03); La.box(T, uc - 0.55, 21.1, -0.0, uc + 0.55, 21.2, 0.2); La.box(T, uc - 0.55, 22.8, -0.0, uc + 0.55, 23.0, 0.2); }
    La.box(T, -0.1, H - 1.7, -0.0, len + 0.1, H - 1.5, 0.4); La.emit(bag, M);
  }
  // ── the roofs of the wings with their chimneys
  const roof = (r, along) => { const d = along === 'x' ? r[3] - r[1] : r[2] - r[0], ex = along === 'x' ? [0.6, 0.8] : [0.8, 0.6]; bag.add('roof_tile', frustum([r[0] - ex[0], r[1] - ex[1], r[2] + ex[0], r[3] + ex[1]], H, H + 4.6, along === 'x' ? 0 : d / 2 + 0.8, along === 'x' ? 0 : d / 2 + 0.8, along === 'x' ? d / 2 + 0.8 : 0, along === 'x' ? d / 2 + 0.8 : 0)); };
  roof([x0, z0, x1, U[1]], 'x'); roof([x0, U[3], x1, z1], 'x'); roof([x0 + 1, U[1] + 1, U[0], U[3] - 1], 'z'); roof([U[2], U[1] + 1, x1 - 1, U[3] - 1], 'z');
  for (const [cx, cz] of [[x0 + 12, (z0 + U[1]) / 2], [x0 + 30, (z0 + U[1]) / 2], [x0 + 52, (z0 + U[1]) / 2], [x0 + 70, (z0 + U[1]) / 2], [x0 + 20, (U[3] + z1) / 2], [x0 + 44, (U[3] + z1) / 2], [x0 + 64, (U[3] + z1) / 2]]) {
    bag.add('brick', box(cx - 0.6, H + 3.2, cz - 0.4, cx + 0.6, H + 7.0, cz + 0.4)); bag.add(T, box(cx - 0.75, H + 7.0, cz - 0.55, cx + 0.75, H + 7.3, cz + 0.55));
  }
  // the courtyard is paved; a stone-edged drain runs to the middle
  bag.add(T, box((C[0] + C[2]) / 2 - 0.5, 0.0, C[1] + 2, (C[0] + C[2]) / 2 + 0.5, 0.05, C[3] - 2));
}
