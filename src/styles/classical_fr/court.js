// The court side of Versailles (docs/settlements/versailles.md §1b): Louis XIII's château of red brick and
// cut stone round the Marble Court and the ranges of the Royal Court and the ministers' court before it —
// two storeys of tall windows in stone chains toothed into the brick, stone quoins, band and cornice;
// painted and gilded wrought-iron balconies; marble busts of Roman emperors on stone consoles between the
// windows; the slate mansard with Hardouin-Mansart's dormers and gilt lead dressings (1679–81) and tall
// chimneys. The corps de logis has its avant-corps of eight red marble columns carrying the gilded balcony,
// and above it the clock framed by the lead figures of Mars and Hercules. Also: the Marble Court's paving of
// white and black marble, and the gilded railings between the courts.
//
// court_range: { rect, y, h, fronts ('nsew' faces with windows), bay, centre: face with the clock avant-corps }
// marble_court: { rect, y, rise, steps: 'e' } — the raised court, its paving and its flight of steps
// grille: { x, z0, z1, y, h, gate: [zc, w], groups } — a gilded railing across x on a stone plinth

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { faceFrame, prism, fbox, ngon } from '../dutch/facade.js';

const ST = 'sandstone_dressed', BR = 'brick', GL = 'glass_outer', FR = 'paint_white', GI = 'gilt_bronze', SL = 'slate';

/** a bust on its socle (centred on x, z, standing at y), facing outward along th (local +z turned by th about y) */
function bust(bag, x, y, z, th, s = 1) {
  const M = 'marble_smooth';
  bag.add(M, lathe([[0.15 * s, 0], [0.15 * s, 0.05 * s], [0.09 * s, 0.1 * s], [0.07 * s, 0.2 * s], [0.001, 0.2 * s]], 10, null, x, y, z));
  // the chest and shoulders cut square under the arms, wider across than deep, the drapery over one shoulder
  const g = lathe([[0.12 * s, 0], [0.24 * s, 0.08 * s], [0.25 * s, 0.24 * s], [0.18 * s, 0.34 * s], [0.07 * s, 0.38 * s], [0.001, 0.38 * s]], 12, null, 0, 0, 0);
  g.scale(1, 1, 0.62); g.rotateY(th); g.translate(x, y + 0.2 * s, z); bag.add(M, g);
  bag.add(M, lathe([[0.055 * s, 0], [0.06 * s, 0.08 * s], [0.001, 0.09 * s]], 8, null, x, y + 0.56 * s, z));               // the neck
  const hd = lathe([[0.001, 0], [0.08 * s, 0.02 * s], [0.105 * s, 0.1 * s], [0.1 * s, 0.19 * s], [0.07 * s, 0.25 * s], [0.001, 0.27 * s]], 10, null, 0, 0, 0);
  hd.scale(0.9, 1, 1.05); hd.rotateY(th); hd.translate(x, y + 0.6 * s, z); bag.add(M, hd);
}

/** a reclining figure in lead on a raking cornice (Mars, Hercules): the body along u, raised toward the clock */
function recliner(bag, F, y, u, v, d, dir, mat = 'lead') {
  const [x, z] = F.at(u, d), [x2, z2] = F.at(u + dir, d), yaw = Math.atan2(z2 - z, x2 - x);
  const g = lathe([[0.001, -0.85], [0.24, -0.65], [0.3, -0.1], [0.27, 0.45], [0.18, 0.7], [0.001, 0.8]], 10, null, 0, 0, 0);
  g.scale(1, 1, 0.8); g.rotateZ(-Math.PI / 2 + 0.4); g.rotateY(-yaw); g.translate(x, y + v, z); bag.add(mat, g);
  const [hx, hz] = F.at(u + dir * 0.72, d);
  bag.add(mat, lathe([[0.001, 0], [0.11, 0.03], [0.12, 0.14], [0.07, 0.22], [0.001, 0.24]], 8, null, hx, y + v + 0.22, hz));
  // the raised arm holding a spear (Mars) or the club (Hercules), and the shield or lion skin below
  const [ax, az] = F.at(u + dir * 0.45, d + 0.05);
  bag.add(mat, lathe([[0.06, 0], [0.045, 0.9], [0.001, 0.95]], 6, null, ax, y + v + 0.1, az));
  const [sx, sz] = F.at(u - dir * 0.2, d + 0.2), [ox, oz] = F.at(u - dir * 0.2, d + 1.2), sh = lathe([[0.3, 0], [0.3, 0.05], [0.001, 0.08]], 12, null, 0, 0, 0);
  sh.rotateX(Math.PI / 2); sh.rotateY(Math.atan2(ox - sx, oz - sz)); sh.translate(sx, y + v - 0.05, sz); bag.add(mat, sh);
}

/** One court front on face f of rect. */
function courtFront(ctx, el, f) {
  const { bag } = ctx, y = el.y ?? 0, h = el.h ?? 12, F = faceFrame(el.rect, f), L = F.w;
  const A = (m, u0, u1, v0, v1, d0, d1) => bag.add(m, fbox(F, y, u0, u1, v0, v1, d0, d1)), P = (m, pts, d0, d1) => bag.add(m, prism(F, y, pts, d0, d1));
  const n = Math.max(1, Math.round(L / (el.bay ?? 4.2))), bw = L / n, mid = (n - 1) / 2;
  const centre = el.centre === f && n >= 5, m = Math.floor(n / 2), cbays = centre ? new Set([m - 1, m, m + 1]) : new Set(), fv = (el.foot ?? y - 0.5) - y;
  void mid;
  const g0 = 0.9, g1 = h * 0.4, f0 = h * 0.47 + 0.35, f1 = h - 1.45, w = Math.min(1.55, bw * 0.38);
  // plinth, the first floor's band, the cornice with its modillions
  A(ST, -0.12, L + 0.12, fv, g0 - 0.3, 0, 0.14);
  A(ST, -0.06, L + 0.06, h * 0.47 - 0.3, h * 0.47, 0, 0.16); A(ST, -0.06, L + 0.06, h * 0.47, h * 0.47 + 0.1, 0, 0.08);
  A(ST, -0.1, L + 0.1, h - 0.95, h - 0.7, 0, 0.12); A(ST, -0.16, L + 0.16, h - 0.7, h - 0.45, 0, 0.26); A(ST, -0.22, L + 0.22, h - 0.25, h, 0, 0.55);
  for (let u = 0.3; u < L - 0.2; u += 0.62) A(ST, u - 0.08, u + 0.08, h - 0.45, h - 0.25, 0.06, 0.48);
  // the quoins at the corners: long and short stones alternating, toothed into the brick
  for (const e of [0, L]) for (let k = 0, v = g0 - 0.3; v < h - 0.95; k++, v += 0.52) { const q = k % 2 ? 0.6 : 1.05, u0 = e ? L - q : 0, u1 = e ? L : q; A(ST, u0, u1, v + 0.02, Math.min(h - 0.95, v + 0.5), 0, 0.05); }
  for (let i = 0; i < n; i++) {
    const c = (i + 0.5) * bw, ctr = cbays.has(i);
    // the stone chain round both windows, its edges toothed (harpe) into the brick
    const wins = [[g0 - 0.16, g1 + 0.24], [f0 - 0.16, f1 + 0.24]];
    for (let k = 0, v = g0 - 0.3; v < h - 0.95; k++, v += 0.52) {
      const hw = w / 2 + (k % 2 ? 0.32 : 0.55), va = v + 0.02, vb = Math.min(h - 0.95, v + 0.5);
      if (wins.some(([a, b]) => vb > a && va < b)) for (const s of [-1, 1]) A(ST, s < 0 ? c - hw : c + w / 2 + 0.2, s < 0 ? c - w / 2 - 0.2 : c + hw, va, vb, 0, 0.06);
      else A(ST, c - hw, c + hw, va, vb, 0, 0.06);
    }
    for (const [v0, v1, first] of [[g0, g1, false], [f0, f1, true]]) {
      // the window in its reveal: the glass, the white frame with its small panes, the moulded surround
      A(GL, c - w / 2, c + w / 2, v0, v1, -0.05, 0.03);
      A(FR, c - 0.04, c + 0.04, v0, v1, 0.03, 0.07);
      for (let v = v0 + 0.5; v < v1 - 0.15; v += 0.5) A(FR, c - w / 2, c + w / 2, v - 0.025, v + 0.025, 0.03, 0.07);
      for (const s of [-1, 1]) A(FR, c + s * w / 4 - 0.025, c + s * w / 4 + 0.025, v0, v1, 0.03, 0.07);
      A(FR, c - w / 2, c - w / 2 + 0.07, v0, v1, 0.03, 0.09); A(FR, c + w / 2 - 0.07, c + w / 2, v0, v1, 0.03, 0.09);
      for (const s of [-1, 1]) A(ST, s < 0 ? c - w / 2 - 0.2 : c + w / 2, s < 0 ? c - w / 2 : c + w / 2 + 0.2, v0 - 0.05, v1, 0, 0.16);
      A(ST, c - w / 2 - 0.26, c + w / 2 + 0.26, v1, v1 + 0.24, 0, 0.18);
      A(ST, c - w / 2 - 0.18, c + w / 2 + 0.18, v0 - 0.16, v0 - 0.02, 0, 0.22);
      // the carved agrafe over the window: a scrolled keystone
      P(ST, [[c - 0.16, v1 - 0.12], [c + 0.16, v1 - 0.12], [c + 0.22, v1 + 0.36], [c - 0.22, v1 + 0.36]], 0.06, 0.26);
      bag.add(ST, lathe([[0.001, 0], [0.09, 0.03], [0.1, 0.12], [0.001, 0.16]], 8, null, ...(() => { const [x, z] = F.at(c, 0.3); return [x, y + v1 + 0.08, z]; })()));
      // the balcony of the first floor: a stone slab on two consoles, the wrought-iron rail painted and gilded
      if (first && !(ctr && el.centre === f)) {
        const b0 = c - w / 2 - 0.3, b1 = c + w / 2 + 0.3, v = v0 - 0.16;
        A(ST, b0, b1, v - 0.16, v, 0.06, 0.62);
        for (const u of [b0 + 0.18, b1 - 0.18]) P(ST, [[u - 0.09, v - 0.16], [u + 0.09, v - 0.16], [u + 0.09, v - 0.62], [u - 0.09, v - 0.45]].map(([a, b]) => [a, b]), 0.06, 0.5);
        rail(A, bag, F, y, b0 + 0.04, b1 - 0.04, v, 0.56);
      }
    }
    // a marble bust on a stone console on the brick pier between this bay and the next
    if (i < n - 1 && !(ctr && cbays.has(i + 1))) {
      const u = (i + 1) * bw, v = (f0 + f1) / 2 - 0.35;
      P(ST, [[u - 0.2, v], [u + 0.2, v], [u + 0.12, v - 0.55], [u - 0.12, v - 0.55]], 0.0, 0.42);
      A(ST, u - 0.26, u + 0.26, v, v + 0.1, 0, 0.5);
      const [bx, bz] = F.at(u, 0.27), [nx, nz] = F.at(u, 1.27);
      bust(bag, bx, y + v + 0.1, bz, Math.atan2(nx - bx, nz - bz), 0.95);
    }
  }
  if (centre) centrePiece(ctx, el, F, A, P, [...cbays].sort((a, b) => a - b), bw, { g0, g1, f0, f1, w, h });
}

/** the wrought-iron rail of a balcony from u0 to u1 at floor v, standing d out: bars, a gilt top rail, gilt scrolls */
function rail(A, bag, F, y, u0, u1, v, d) {
  A('iron', u0, u1, v, v + 0.05, d - 0.03, d + 0.02);
  A(GI, u0 - 0.02, u1 + 0.02, v + 0.9, v + 0.96, d - 0.04, d + 0.03);
  A('iron', u0, u1, v + 0.78, v + 0.81, d - 0.025, d + 0.015);
  const nb = Math.max(3, Math.round((u1 - u0) / 0.13));
  for (let k = 0; k <= nb; k++) { const u = u0 + k * (u1 - u0) / nb; A('iron', u - 0.012, u + 0.012, v + 0.05, v + 0.9, d - 0.02, d + 0.005); }
  for (let u = u0 + 0.22; u < u1 - 0.1; u += 0.44) { const [x, z] = F.at(u, d - 0.008); const g = lathe([[0.12, 0], [0.12, 0.022], [0.07, 0.022], [0.07, 0], [0.001, 0]], 12, null, 0, 0, 0); g.rotateX(Math.PI / 2); const [x2, z2] = F.at(u, d + 1); g.rotateY(Math.atan2(x2 - x, z2 - z)); g.translate(x, y + v + 0.45, z); bag.add(GI, g); }
  for (const u of [u0, u1]) A('iron', u - 0.025, u + 0.025, v, v + 0.96, 0.06, d + 0.02);
}

/** the corps de logis' avant-corps: eight red marble columns in pairs carrying the gilded balcony; the attic; the clock with Mars and Hercules */
function centrePiece(ctx, el, F, A, P, bays, bw, { g0, g1, f0, f1, w, h }) {
  const { bag } = ctx, y = el.y ?? 0, u0 = bays[0] * bw, u1 = (bays.at(-1) + 1) * bw, uc = (u0 + u1) / 2, D = 2.1, vb = f0 - 0.16;
  // the columns: four pairs, Doric, of red marble on white bases, standing on the court; the entablature over them
  const cols = [u0 + 0.6, u0 + bw, u0 + 2 * bw, u1 - 0.6].flatMap((p) => [p - 0.36, p + 0.36]);
  for (const u of cols) {
    const [x, z] = F.at(u, D - 0.35), top = vb - 0.62 - 0.42;
    bag.add('marble', box(x - 0.36, y - 0.3, z - 0.36, x + 0.36, y + 0.32, z + 0.36));
    bag.add('marble_smooth', lathe([[0.32, 0], [0.32, 0.08], [0.27, 0.18], [0.25, 0.26]], 14, null, x, y + 0.32, z));
    bag.add('breccia_red', lathe([[0.25, 0], [0.24, (top - 0.58) * 0.33], [0.21, top - 0.58]], 14, null, x, y + 0.58, z));
    bag.add('marble_smooth', lathe([[0.23, 0], [0.24, 0.06], [0.22, 0.12], [0.28, 0.2], [0.32, 0.28], [0.32, 0.34]], 14, null, x, y + top - 0.02, z));
    bag.add('marble_smooth', box(x - 0.36, y + top + 0.32, z - 0.36, x + 0.36, y + top + 0.42, z + 0.36));
  }
  // the entablature resting on the columns and returning to the wall; the balcony slab over it
  A(ST, u0 + 0.05, u1 - 0.05, vb - 0.62, vb - 0.16, 0, D);
  A(ST, u0, u1, vb - 0.16, vb, 0.06, D + 0.12);
  for (let u = u0 + 0.2; u < u1 - 0.1; u += 0.5) A(ST, u - 0.05, u + 0.05, vb - 0.5, vb - 0.3, D - 0.02, D + 0.02);
  rail(A, bag, F, y, u0 + 0.12, u1 - 0.12, vb, D);
  for (const u of [u0 + 0.12, u1 - 0.12]) A('iron', u - 0.03, u + 0.03, vb, vb + 0.96, D - 0.1, D + 0.02);
  // the attic storey over the centre: brick and stone, three windows, a cornice; on it the pediment with the clock
  const ah = 3.4, hA = h + ah;
  A(BR, u0 + 0.3, u1 - 0.3, h - 0.3, hA, -3.2, 0.1);
  A(ST, u0 + 0.2, u1 - 0.2, hA - 0.45, hA, -3.3, 0.45);
  for (const i of bays) {
    const c = (i + 0.5) * bw, ww = w * 0.7, v0 = h + 0.5, v1 = hA - 0.8;
    A(GL, c - ww / 2, c + ww / 2, v0, v1, 0.05, 0.12); A(FR, c - 0.035, c + 0.035, v0, v1, 0.12, 0.16); A(FR, c - ww / 2, c + ww / 2, (v0 + v1) / 2 - 0.025, (v0 + v1) / 2 + 0.025, 0.12, 0.16);
    A(ST, c - ww / 2 - 0.18, c - ww / 2, v0 - 0.15, v1 + 0.18, 0.1, 0.22); A(ST, c + ww / 2, c + ww / 2 + 0.18, v0 - 0.15, v1 + 0.18, 0.1, 0.22);
    A(ST, c - ww / 2, c + ww / 2, v1, v1 + 0.18, 0.1, 0.22); A(ST, c - ww / 2 - 0.1, c + ww / 2 + 0.1, v0 - 0.15, v0, 0.1, 0.26);
  }
  for (const u of [u0 + 0.3, u1 - 0.3]) A(ST, u - 0.25, u + 0.25, h, hA - 0.45, -0.6, 0.2);
  // the triangular pediment: the raking cornices, the tympanum, the clock in its gilt frame, Mars and Hercules reclining on the rakes
  const ph = 2.6, pu0 = u0 + 0.2, pu1 = u1 - 0.2, pc = (pu0 + pu1) / 2;
  P(ST, [[pu0, hA], [pu1, hA], [pc, hA + ph]], -3.2, 0.2);
  for (const s of [-1, 1]) { const a = s < 0 ? pu0 : pu1, q = [[a - s * 0.3, hA - 0.05], [pc, hA + ph + 0.25], [pc, hA + ph - 0.1], [a + s * 0.3, hA - 0.05]]; P(ST, q, -3.2, 0.45); }
  const rake = (u) => hA - 0.05 + (ph + 0.3) * (u < pc ? (u - pu0 + 0.3) : (pu1 + 0.3 - u)) / (pc - pu0 + 0.3);
  { const [x, z] = F.at(pc, 0.2), [x2, z2] = F.at(pc, 1.2), yaw = Math.atan2(x2 - x, z2 - z), yc = y + hA + 0.95, R = 0.78;
    const disc = (r, d0, t, m) => { const g = lathe([[0.001, 0], [r, 0], [r, t], [0.001, t]], 28, null, 0, 0, 0); g.rotateX(Math.PI / 2); g.rotateY(yaw); const [px, pz] = F.at(pc, d0); g.translate(px, yc, pz); bag.add(m, g); };
    disc(R + 0.16, 0.18, 0.08, GI); disc(R, 0.24, 0.04, 'marble_dark');
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, uu = pc + Math.cos(a) * R * 0.8, vv = hA + 0.95 + Math.sin(a) * R * 0.8; A(GI, uu - 0.05, uu + 0.05, vv - 0.05, vv + 0.05, 0.28, 0.31); }
    A(GI, pc - 0.03, pc + 0.03, hA + 0.95, hA + 0.95 + R * 0.55, 0.31, 0.34); A(GI, pc - 0.03, pc + R * 0.7, hA + 0.93, hA + 0.97, 0.34, 0.36);
    // the gilt sun's rays round the dial
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; if (Math.sin(a) < -0.3) continue; const r0 = R + 0.18, r1 = R + 0.42, uu = (rr) => pc + Math.cos(a) * rr, vv = (rr) => hA + 0.95 + Math.sin(a) * rr, t = 0.05; P(GI, [[uu(r0) - Math.sin(a) * t, vv(r0) + Math.cos(a) * t], [uu(r1), vv(r1)], [uu(r0) + Math.sin(a) * t, vv(r0) - Math.cos(a) * t]], 0.2, 0.25); }
    void yaw; }
  recliner(bag, F, y, pu0 + 1.4, rake(pu0 + 1.4) + 0.2, 0.3, 1);
  recliner(bag, F, y, pu1 - 1.4, rake(pu1 - 1.4) + 0.2, 0.3, -1);
  // trophies on the attic's corners
  for (const u of [u0 + 0.3, u1 - 0.3]) { const [x, z] = F.at(u, -0.1); bag.add('lead', lathe([[0.25, 0], [0.2, 0.15], [0.3, 0.55], [0.22, 0.85], [0.1, 0.95], [0.001, 0.97]], 10, null, x, y + hA, z)); bag.add(GI, lathe([[0.001, 0], [0.14, 0.05], [0.15, 0.2], [0.001, 0.4]], 8, null, x, y + hA + 0.97, z)); }
  void g0; void g1; void f1;
}

/** the slate mansard: the steep brisis with its dormers, the gentle terrasson, gilt lead crestings, chimneys */
function mansard(ctx, el) {
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 12, Y = y + h;
  const e = 0.22, H1 = 4.3, I1 = 1.45, r0 = [x0 - e, z0 - e, x1 + e, z1 + e];
  const Lx = r0[2] - r0[0], Lz = r0[3] - r0[1];
  bag.add(SL, frustumOf(r0, Y, Y + H1, I1));
  const r1 = [r0[0] + I1, r0[1] + I1, r0[2] - I1, r0[3] - I1], short = Math.min(r1[2] - r1[0], r1[3] - r1[1]), rise = short * 0.28, ri = short / 2 - 0.05;
  bag.add(SL, frustumOf(r1, Y + H1, Y + H1 + rise, ri));
  // the lead roll at the break, gilt
  for (const q of [[r1[0] - 0.04, r1[1] - 0.04, r1[2] + 0.04, r1[1] + 0.06], [r1[0] - 0.04, r1[3] - 0.06, r1[2] + 0.04, r1[3] + 0.04], [r1[0] - 0.04, r1[1], r1[0] + 0.06, r1[3]], [r1[2] - 0.06, r1[1], r1[2] + 0.04, r1[3]]]) bag.add(GI, box(q[0], Y + H1 - 0.02, q[1], q[2], Y + H1 + 0.1, q[3]));
  // the ridge: lead, with a gilt cresting of small vases and épis (tall finials) at its ends
  const alongX = Lx >= Lz, cx = (r1[0] + r1[2]) / 2, cz = (r1[1] + r1[3]) / 2, rl = Math.abs((alongX ? r1[2] - r1[0] : r1[3] - r1[1]) - short) / 2 + 0.05, top = Y + H1 + rise;
  bag.add('lead', alongX ? box(cx - rl, top - 0.06, cz - 0.12, cx + rl, top + 0.14, cz + 0.12) : box(cx - 0.12, top - 0.06, cz - rl, cx + 0.12, top + 0.14, cz + rl));
  for (let t = -rl + 0.4; t <= rl - 0.3; t += 0.8) { const px = alongX ? cx + t : cx, pz = alongX ? cz : cz + t; bag.add(GI, lathe([[0.07, 0], [0.05, 0.08], [0.12, 0.22], [0.08, 0.34], [0.001, 0.48]], 6, null, px, top + 0.14, pz)); }
  for (const s of [-1, 1]) { const px = alongX ? cx + s * rl : cx, pz = alongX ? cz : cz + s * rl; bag.add('lead', lathe([[0.16, 0], [0.12, 0.3], [0.28, 0.75], [0.2, 1.05], [0.05, 1.15], [0.04, 1.9], [0.001, 1.92]], 10, null, px, top + 0.1, pz)); bag.add(GI, lathe([[0.001, 0], [0.18, 0.12], [0.2, 0.32], [0.001, 0.62]], 8, null, px, top + 1.4, pz)); }
  // the chimneys: tall stacks of brick with stone dressings, through the terrasson
  const nc = Math.max(1, Math.round(rl * 2 / 14));
  for (let k = 0; k < nc; k++) {
    const t = nc === 1 ? 0 : -rl + 2 + k * (2 * rl - 4) / (nc - 1), px = alongX ? cx + t : cx + (k % 2 ? 0.9 : -0.9), pz = alongX ? cz + (k % 2 ? 0.9 : -0.9) : cz + t, a = alongX ? 1.1 : 0.55, b = alongX ? 0.55 : 1.1, cy0 = Y + H1, cy1 = top + 2.4;
    bag.add(BR, box(px - a, cy0, pz - b, px + a, cy1, pz + b));
    for (const [v0, v1, g] of [[cy0 + (cy1 - cy0) * 0.55, cy0 + (cy1 - cy0) * 0.55 + 0.16, 0.06], [cy1 - 0.35, cy1 - 0.12, 0.1], [cy1 - 0.12, cy1, 0.04]]) bag.add(ST, box(px - a - g, v0, pz - b - g, px + a + g, v1, pz + b + g));
  }
  // the dormers on the brisis over each window bay of the fronts
  for (const f of el.fronts ?? 'nsew') {
    const F = faceFrame(el.rect, f), L = F.w, n = Math.max(1, Math.round(L / (el.bay ?? 4.2))), bw = L / n, w = Math.min(1.3, bw * 0.3);
    const A = (m, u0, u1, v0, v1, d0, d1) => bag.add(m, fbox(F, Y, u0, u1, v0, v1, d0, d1)), P = (m, pts, d0, d1) => bag.add(m, prism(F, Y, pts, d0, d1));
    for (let i = 0; i < n; i++) {
      const c = (i + 0.5) * bw;
      if (el.centre === f && n >= 5 && Math.abs(i - (n - 1) / 2) < 1.6) continue;      // the attic and the clock stand there
      const v0 = 0.35, v1 = 2.55, d0 = -0.12, d1 = -1.55, hw = w / 2 + 0.32, seg = i % 2 === 0;
      A('lead', c - hw, c + hw, v0, v1, d1, d0 - 0.02);                                        // the cheeks and body, dressed in lead
      A(ST, c - hw - 0.04, c - w / 2, v0 - 0.08, v1, d0 - 0.04, d0 + 0.1); A(ST, c + w / 2, c + hw + 0.04, v0 - 0.08, v1, d0 - 0.04, d0 + 0.1);
      A(ST, c - hw - 0.08, c + hw + 0.08, v0 - 0.2, v0, d0 - 0.04, d0 + 0.16);
      A(GL, c - w / 2, c + w / 2, v0, v1, d0 - 0.12, d0 - 0.03); A(FR, c - 0.03, c + 0.03, v0, v1, d0 - 0.03, d0 + 0.01);
      for (let v = v0 + 0.55; v < v1 - 0.1; v += 0.55) A(FR, c - w / 2, c + w / 2, v - 0.02, v + 0.02, d0 - 0.03, d0 + 0.01);
      // the pediment, alternately triangular and segmental; its small lead roof running back into the slates
      const ph = seg ? 0.42 : 0.6, pts = seg ? Array.from({ length: 9 }, (_, k) => { const a = Math.PI * k / 8; return [c - Math.cos(a) * (hw + 0.14), v1 + Math.sin(a) * ph]; }) : [[c - hw - 0.14, v1], [c + hw + 0.14, v1], [c, v1 + ph]];
      P(ST, seg ? [[c - hw - 0.14, v1 - 0.12], ...pts.map(([a, b]) => [a, b]), [c + hw + 0.14, v1 - 0.12]].filter((p, k, arr) => k === 0 || p[0] !== arr[k - 1][0] || p[1] !== arr[k - 1][1]) : [[c - hw - 0.14, v1 - 0.12], [c + hw + 0.14, v1 - 0.12], [c, v1 + ph]], d0 - 0.04, d0 + 0.18);
      P('lead', seg ? [[c - hw, v1], ...pts.slice(1, -1).map(([a, b]) => [c + (a - c) * hw / (hw + 0.14), v1 + (b - v1) * 0.9]), [c + hw, v1]] : [[c - hw, v1], [c + hw, v1], [c, v1 + ph * 0.9]], d1, d0 - 0.04);
      // the gilt lead dressings: scrolls at the cheeks' feet, a vase on the top
      for (const s of [-1, 1]) P(GI, [[c + s * (hw + 0.04), v0], [c + s * (hw + 0.36), v0], [c + s * (hw + 0.04), v0 + 0.85]].sort((p, q) => p[0] - q[0]), d0 - 0.14, d0 + 0.02);
      { const [x, z] = F.at(c, d0 + 0.02); bag.add(GI, lathe([[0.08, 0], [0.06, 0.08], [0.15, 0.24], [0.1, 0.36], [0.03, 0.4], [0.001, 0.55]], 8, null, x, Y + v1 + ph - 0.06, z)); }
    }
  }
}
// a hipped frustum from rect r (y0 → y1) with the same inset i on every side (clamped to the shorter half)
function frustumOf(r, y0, y1, i) {
  const ix = Math.min(i, (r[2] - r[0]) / 2 - 0.01), iz = Math.min(i, (r[3] - r[1]) / 2 - 0.01);
  const b = [[r[0], y0, r[1]], [r[2], y0, r[1]], [r[2], y0, r[3]], [r[0], y0, r[3]]], t = [[r[0] + ix, y1, r[1] + iz], [r[2] - ix, y1, r[1] + iz], [r[2] - ix, y1, r[3] - iz], [r[0] + ix, y1, r[3] - iz]];
  const tri = [], q = (a, b2, c, d) => tri.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(t[0], t[3], t[2], t[1]); for (let k = 0; k < 4; k++) { const j = (k + 1) % 4; q(b[k], t[k], t[j], b[j]); }
  return fromTriangles(orientOutward(tri));
}

export function courtRange(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 12, foot = el.foot ?? y - 0.5;
  bag.add(BR, box(x0, foot, z0, x1, y + h, z1)); col.rect(el.rect, foot, y + h);
  for (const f of el.fronts ?? 'nsew') courtFront(ctx, el, f);
  // the blind returns: plinth, band and cornice only, with the quoins
  for (const f of 'nsew') if (!(el.fronts ?? 'nsew').includes(f) && !(el.blind ?? '').includes(f)) {
    const F = faceFrame(el.rect, f), L = F.w, A = (m, u0, u1, v0, v1, d0, d1) => bag.add(m, fbox(F, y, u0, u1, v0, v1, d0, d1));
    A(ST, -0.12, L + 0.12, foot - y, 0.6, 0, 0.14); A(ST, -0.06, L + 0.06, h * 0.47 - 0.3, h * 0.47, 0, 0.16);
    A(ST, -0.1, L + 0.1, h - 0.95, h - 0.7, 0, 0.12); A(ST, -0.16, L + 0.16, h - 0.7, h - 0.45, 0, 0.26); A(ST, -0.22, L + 0.22, h - 0.25, h, 0, 0.55);
  }
  mansard(ctx, el);
}

/** the Marble Court: raised over the Royal Court, paved in white marble with black lozenges, a flight of steps on its open side */
export function marbleCourt(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, top = y + (el.rise ?? 0.85);
  bag.add('marble_floor', box(x0, y - 0.5, z0, x1, top, z1)); col.floor(el.rect, top);
  const s = 1.3;
  for (let i = 0; (i + 0.5) * s < x1 - x0; i++) for (let k = 0; (k + 0.5) * s < z1 - z0; k++) {
    const cx = x0 + (i + 0.5) * s, cz = z0 + (k + 0.5) * s, r = s * 0.36;
    if (cx + r > x1 - 0.1 || cz + r > z1 - 0.1) continue;
    const tri = [], pts = [[cx - r, cz], [cx, cz - r], [cx + r, cz], [cx, cz + r]];
    const T = pts.map(([a, b]) => [a, top + 0.012, b]), B = pts.map(([a, b]) => [a, top - 0.02, b]);
    const q = (a, b2, c, d) => tri.push(...a, ...b2, ...c, ...a, ...c, ...d);
    q(T[0], T[3], T[2], T[1]); for (let j = 0; j < 4; j++) { const m = (j + 1) % 4; q(B[j], T[j], T[m], B[m]); }
    bag.add('marble_dark', fromTriangles(orientOutward(tri)));
  }
  // a border of black marble along the façades and the edge
  for (const q of [[x0, z0, x1, z0 + 0.4], [x0, z1 - 0.4, x1, z1], [x0, z0, x0 + 0.4, z1], [x1 - 0.4, z0, x1, z1]]) bag.add('marble_dark', box(q[0], top - 0.02, q[1], q[2], top + 0.012, q[3]));
  // the steps down to the Royal Court across the open side (east)
  const n = Math.max(2, Math.round((top - y) / 0.16)), tread = 0.4, rise = (top - y) / n;
  for (let k = 0; k < n; k++) bag.add('marble', box(x1, y - 0.3, z0, x1 + (n - k) * tread, y + rise * (k + 1), z1));
  col.ramp([x1, z0, x1 + n * tread, z1], y, top, 'w');
}

/** a gilded wrought-iron railing across x from z0 to z1 on a stone plinth; stone piers; a gateway with its leaves open, the gate piers carrying sculpture groups */
export function grille(el, ctx) {
  const { bag, col } = ctx, x = el.x, y = el.y ?? 0, h = el.h ?? 3.4, [gz, gw] = el.gate ?? [0, 6], ph = 0.65;
  const runs = [[el.z0, gz - gw / 2 - 0.8], [gz + gw / 2 + 0.8, el.z1]];
  for (const [a, b] of runs) {
    if (b - a < 0.5) continue;
    bag.add(ST, box(x - 0.3, y - 0.3, a, x + 0.3, y + ph, b)); bag.add(ST, box(x - 0.36, y + ph - 0.1, a, x + 0.36, y + ph, b));
    col.segment([x, a], [x, b], 0.6, y - 0.3, y + h);
    const np = Math.max(1, Math.round((b - a) / 5.5)), pw = (b - a) / np;
    for (let p = 0; p <= np; p++) {
      const z = a + p * pw;
      bag.add(ST, box(x - 0.42, y - 0.3, z - 0.42, x + 0.42, y + h + 0.3, z + 0.42)); bag.add(ST, box(x - 0.5, y + h + 0.3, z - 0.5, x + 0.5, y + h + 0.5, z + 0.5));
      bag.add(ST, lathe([[0.25, 0], [0.16, 0.12], [0.3, 0.5], [0.26, 0.75], [0.14, 0.85], [0.18, 0.92], [0.001, 0.95]], 10, null, x, y + h + 0.5, z));
      if (p === np) continue;
      for (let zz = z + 0.55; zz < z + pw - 0.5; zz += 0.16) {
        bag.add('iron', box(x - 0.018, y + ph, zz - 0.018, x + 0.018, y + h - 0.05, zz + 0.018));
        bag.add(GI, lathe([[0.04, 0], [0.05, 0.05], [0.001, 0.22]], 4, null, x, y + h - 0.05, zz));
      }
      for (const v of [ph + 0.25, h - 0.55, h - 0.25]) bag.add('iron', box(x - 0.03, y + v, z + 0.42, x + 0.03, y + v + 0.05, z + pw - 0.42));
      for (let zz = z + 1.0; zz < z + pw - 0.8; zz += 1.0) { const g = lathe([[0.16, 0], [0.16, 0.025], [0.09, 0.025], [0.09, 0], [0.001, 0]], 12, null, 0, 0, 0); g.rotateZ(Math.PI / 2); g.translate(x + 0.02, y + h - 0.95, zz); bag.add(GI, g); }
    }
  }
  // the gate piers: heavier, a cornice, the sculpture groups (Peace and Abundance) on them
  for (const s of [-1, 1]) {
    const z = gz + s * (gw / 2 + 0.4);
    bag.add(ST, box(x - 0.8, y - 0.3, z - 0.8, x + 0.8, y + h + 1.3, z + 0.8)); col.rect([x - 0.8, z - 0.8, x + 0.8, z + 0.8], y - 0.3, y + h + 1.3);
    bag.add(ST, box(x - 0.95, y + h + 1.3, z - 0.95, x + 0.95, y + h + 1.6, z + 0.95)); bag.add(ST, box(x - 0.7, y + h + 1.6, z - 0.7, x + 0.7, y + h + 2.1, z + 0.7));
    for (const dz of [-0.5, 0.5]) bag.add(ST, box(x - 0.86, y + 0.4, z + dz - 0.12, x + 0.86, y + h + 1.1, z + dz + 0.12));
    if (el.groups !== false) {
      const M = 'marble_smooth', b = y + h + 2.1;
      bag.add(M, lathe([[0.55, 0], [0.5, 0.2], [0.001, 0.25]], 10, null, x, b, z));
      bag.add(M, lathe([[0.36, 0], [0.34, 0.3], [0.26, 1.0], [0.24, 1.35], [0.28, 1.6], [0.16, 1.75], [0.001, 1.77]], 12, (t, i) => (i > 0 && i < 4 ? 1 + 0.07 * Math.cos(7 * t) : 1), x - 0.12, b + 0.2, z));
      bag.add(M, lathe([[0.001, 0], [0.11, 0.03], [0.12, 0.16], [0.07, 0.25], [0.001, 0.27]], 8, null, x - 0.12, b + 1.97, z));
      bag.add(M, lathe([[0.3, 0], [0.26, 0.3], [0.2, 0.55], [0.001, 0.6]], 10, null, x + 0.3, b + 0.2, z + s * 0.25));          // the seated companion, the child
      bag.add(M, lathe([[0.14, 0], [0.2, 0.25], [0.24, 0.32], [0.001, 0.36]], 8, null, x + 0.35, b + 0.8, z - s * 0.3));           // the horn of plenty, the olive branch's urn
    }
  }
  // the leaves standing open into the court, each a frame of bars with a gilt crown of scrolls
  for (const s of [-1, 1]) {
    const z = gz + s * (gw / 2 - 0.5), lw = gw / 2 - 0.6, xd = el.open ?? -1;
    bag.add('iron', box(x + Math.min(0, xd * lw), y + 0.05, z - 0.04, x + Math.max(0, xd * lw), y + 0.15, z + 0.04));
    bag.add('iron', box(x + Math.min(0, xd * lw), y + h - 0.2, z - 0.04, x + Math.max(0, xd * lw), y + h - 0.1, z + 0.04));
    for (let k = 0; k <= Math.round(lw / 0.16); k++) { const xx = x + xd * k * lw / Math.round(lw / 0.16); bag.add('iron', box(xx - 0.018, y + 0.15, z - 0.018, xx + 0.018, y + h + 0.1, z + 0.018)); bag.add(GI, lathe([[0.04, 0], [0.05, 0.05], [0.001, 0.22]], 4, null, xx, y + h + 0.1, z)); }
    for (const t of [0.3, 0.7]) { const xx = x + xd * t * lw, g = lathe([[0.3, 0], [0.3, 0.03], [0.2, 0.03], [0.2, 0], [0.001, 0]], 14, null, 0, 0, 0); g.translate(0, 0, 0); g.rotateX(Math.PI / 2); g.translate(xx, y + h * 0.55, z - 0.015); bag.add(GI, g); }
    col.segment([x, z], [x + xd * lw, z], 0.1, y, y + h);
  }
  void ngon;
}
