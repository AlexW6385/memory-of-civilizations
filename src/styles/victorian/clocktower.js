// The Clock Tower (Elizabeth Tower), docs/settlements/london.md §1.7: Barry's and Pugin's 96 m tower, 12 m square, in four
// stages seen from the river and from the bridge — the shaft of Perpendicular panelling, the clock stage with the dials at 55 m, the
// belfry with its louvred openings, and the spire in two stages with dormers, hip cresting and a gilt finial. Face frames as in
// ../dutch/facade.js: u along the face from its left corner, v up from the tower's foot (y), d outward from the face.
// The walls are stepped: the core stands back from the face, the buttress blocks, string courses, mullions and arch mouldings
// stand out of it, so the panels read as recesses at a hundred metres.

import { box, frustum, lathe } from '../../core/geom.js';
import { faceFrame, prism, fbox, ngon } from '../dutch/facade.js';
import { pointed } from './hall.js';
import { clockDial } from './dial.js';

const S = 'limestone_yellow', ST = 'limestone';
const SH = 49.3, CT = 61.5, BT = 69.3, CR = 70.4;          // top of the shaft's panelling, of the clock stage, of the belfry's openings, of the cornice
const RECESS = 0.3, BEL = 1.1;                              // how far the core of the shaft and the belfry stand back from the face

/** A pointed-arch band of width w round a half-span hw, springing at vs, rise `rise`, from d0 to d1: strips. */
function archBand(bag, F, y, m, uc, hw, vs, rise, w, d0, d1, n = 8) {
  const ga = (hw + w) / hw;
  for (let i = 0; i < n; i++) {
    const a = -hw + 2 * hw * i / n, b = -hw + 2 * hw * (i + 1) / n;
    bag.add(m, prism(F, y, [[uc + a, vs + pointed(a, hw, rise)], [uc + b, vs + pointed(b, hw, rise)], [uc + b * ga, vs + pointed(b * ga, hw + w, rise * ga)], [uc + a * ga, vs + pointed(a * ga, hw + w, rise * ga)]], d0, d1));
  }
}
/** A ring (a quatrefoil's stand-in: a roundel) of stone between r0 and r1. */
function roundel(bag, F, y, m, u, v, r0, r1, d0, d1, n = 8) {
  for (let i = 0; i < n; i++) { const a = i * 2 * Math.PI / n, b = (i + 1) * 2 * Math.PI / n; bag.add(m, prism(F, y, [[u + Math.cos(a) * r0, v + Math.sin(a) * r0], [u + Math.cos(b) * r0, v + Math.sin(b) * r0], [u + Math.cos(b) * r1, v + Math.sin(b) * r1], [u + Math.cos(a) * r1, v + Math.sin(a) * r1]], d0, d1)); }
}
/** An octagonal pinnacle: a shaft, a stringcourse, the spirelet with crockets up its angles, a gilt finial. */
function pinnacle(bag, x, y, z, r, h) {
  bag.add(S, lathe([[r, 0], [r, h * 0.55]], 8, null, x, y, z));
  bag.add(ST, lathe([[r + 0.14, 0], [r + 0.14, 0.3], [r, 0.4]], 8, null, x, y + h * 0.2, z));
  bag.add(ST, lathe([[r + 0.2, 0], [r + 0.2, 0.25], [r * 0.7, 0.55]], 8, null, x, y + h * 0.55, z));
  bag.add(S, lathe([[r * 0.7, 0], [0.001, h * 0.45]], 8, null, x, y + h * 0.55 + 0.55, z));
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 8, t = 0.18 + 0.2 * k, rr = r * 0.7 * (1 - t) + 0.1; bag.add(ST, box(x + Math.cos(a) * rr - 0.09, y + h * 0.55 + 0.55 + t * h * 0.45, z + Math.sin(a) * rr - 0.09, x + Math.cos(a) * rr + 0.09, y + h * 0.55 + 0.55 + t * h * 0.45 + 0.22, z + Math.sin(a) * rr + 0.09)); }
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.15], [0.001, 0.7]], 6, null, x, y + h + 0.45, z));
}

/** clock_tower: { c: [x, z], s, h, y } — s the side (12 m), h the height to the finial's tip (96 m). */
export function clockTower(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 12, H = el.h ?? 96, y = el.y ?? 0, k = H / 96, R = [cx - s / 2, cz - s / 2, cx + s / 2, cz + s / 2], [x0, z0, x1, z1] = R;
  const F = { n: faceFrame(R, 'n'), s: faceFrame(R, 's'), e: faceFrame(R, 'e'), w: faceFrame(R, 'w') };
  const A = (f, m, ...r) => bag.add(m, fbox(F[f], y, ...r)), Pz = (f, m, pts, d0, d1) => bag.add(m, prism(F[f], y, pts, d0, d1));
  const shaftTop = SH * k, ct = CT * k, bt = BT * k, cr = CR * k;

  // ── the cores: the shaft and the clock stage stand back RECESS from the face, the belfry BEL
  bag.add(S, box(x0 + RECESS, y - 0.5, z0 + RECESS, x1 - RECESS, y + ct, z1 - RECESS));
  bag.add(S, box(x0 + BEL, y + ct - 0.01, z0 + BEL, x1 - BEL, y + cr, z1 - BEL));
  col.rect([x0 - 0.9, z0 - 0.9, x1 + 0.9, z1 + 0.9], y - 0.5, y + H);

  // ── the corner buttresses: blocks standing out of both faces, set back twice, ledges between, a lancet in each face of them
  const sec = [[-0.5, 18 * k, 0.85], [18 * k, 40 * k, 0.7], [40 * k, bt, 0.55]];
  for (const [cxs, czs] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const px = cxs < 0 ? x0 : x1, pz = czs < 0 ? z0 : z1;
    sec.forEach(([v0, v1, out], i) => {
      const xa = cxs < 0 ? px - out : px - 1.5, xb = cxs < 0 ? px + 1.5 : px + out, za = czs < 0 ? pz - out : pz - 1.5, zb = czs < 0 ? pz + 1.5 : pz + out;
      bag.add(S, box(xa, y + v0, za, xb, y + v1, zb));
      if (i < 2) bag.add(ST, box(xa - 0.1 * (cxs < 0), y + v1 - 0.25, za - 0.1 * (czs < 0), xb + 0.1 * (cxs > 0), y + v1 + 0.2, zb + 0.1 * (czs > 0)));
    });
  }
  // the lancets and the string courses ringing the blocks, on both the faces of each block
  for (const f of 'nsew') {
    for (const [uc, sgn] of [[0.35, 1], [s - 0.35, -1]]) {
      void sgn;
      for (let q = 0; q < 6; q++) { const v0 = 3.5 + q * 7.4 * k, out = v0 < 18 * k ? 0.85 : v0 < 40 * k ? 0.7 : 0.55; Pz(f, 'opening', [[uc - 0.17, v0], [uc + 0.17, v0], [uc + 0.17, v0 + 2.2], [uc, v0 + 2.9], [uc - 0.17, v0 + 2.2]], out - 0.01, out + 0.04); }
    }
  }

  for (const f of 'nsew') {
    // ── the shaft: the field between the blocks, three bays of Perpendicular panelling in storeys
    const v00 = 1.6, nst = 6, sh = (shaftTop - 0.7 - v00) / nst;
    A(f, ST, -0.4, s + 0.4, 0.8, 1.6, -RECESS - 0.01, 0.55);                                  // the plinth's moulding
    for (const u of [4.5, 7.5]) A(f, S, u - 0.25, u + 0.25, v00, shaftTop, -RECESS - 0.01, 0.2);    // the mullion buttresses between the bays
    for (let q = 0; q <= nst; q++) A(f, ST, 1.4, s - 1.4, v00 + q * sh - 0.2, v00 + q * sh + 0.2, -RECESS - 0.01, 0.3);   // a string course over every storey
    for (const uc of [2.9, 6, 9.1]) for (let q = 0; q < nst; q++) {
      const v0 = v00 + q * sh, hw = 1.1, vs = v0 + sh * 0.56, rise = 1.5, mid = uc === 6;
      archBand(bag, F[f], y, ST, uc, hw, vs, rise, 0.22, -RECESS - 0.01, 0.08);
      for (const sg of [-1, 1]) A(f, ST, sg < 0 ? uc - hw - 0.22 : uc + hw, sg < 0 ? uc - hw : uc + hw + 0.22, v0 + 0.9, vs, -RECESS - 0.01, 0.08);
      A(f, ST, uc - hw - 0.22, uc + hw + 0.22, v0 + 0.7, v0 + 0.9, -RECESS - 0.01, 0.2);      // the sill
      if (mid) Pz(f, 'opening', [[uc - 0.3, v0 + 1.5], [uc + 0.3, v0 + 1.5], [uc + 0.3, vs + 0.7], [uc, vs + 1.5], [uc - 0.3, vs + 0.7]], -RECESS - 0.01, -RECESS + 0.04);   // the lancet that lights the stair
      else { A(f, ST, uc - 0.07, uc + 0.07, v0 + 0.9, vs + 0.9, -RECESS - 0.01, -0.06); A(f, ST, uc - hw + 0.1, uc + hw - 0.1, vs - 0.05, vs + 0.05, -RECESS - 0.01, -0.12); }   // a blind mullion and transom
      roundel(bag, F[f], y, ST, uc, vs + rise + 0.62, 0.17, 0.3, -RECESS - 0.01, 0.06);
    }

    // ── the clock stage: the dial on its recessed ground, the ornamental gablets over it, the corbelled cornice
    A(f, ST, 1.4, s - 1.4, shaftTop - 0.2, shaftTop + 0.2 - 0.0, -RECESS - 0.01, 0.3);
    A(f, 'gilt_bronze', 1.65, s - 1.65, shaftTop + 0.2, shaftTop + 0.3, 0.2, 0.26);
    { const Fd = { w: F[f].w, D: F[f].D, at: (u, d) => F[f].at(u, d - RECESS - 0.02) };
      clockDial(bag, Fd, s / 2, y + 55 * k, 3.5 * k); }
    const vg = y * 0 + 59.75 * k, gw = (s - 3.4) / 3;
    for (let i = 0; i < 3; i++) {
      const a = 1.7 + i * gw, b = a + gw, m = (a + b) / 2;
      Pz(f, ST, [[a, vg], [b, vg], [m, vg + 1.25 * k]], -RECESS - 0.01, 0.12);
      Pz(f, 'opening', [[a + 0.5, vg + 0.12], [b - 0.5, vg + 0.12], [m, vg + 0.85 * k]], 0.1, 0.15);
      A(f, 'gilt_bronze', m - 0.05, m + 0.05, vg + 1.25 * k, vg + 1.65 * k, -0.1, 0.0);
      for (const sg of [-1, 1]) A(f, ST, m + sg * gw * 0.34 - 0.07, m + sg * gw * 0.34 + 0.07, vg + 0.42 * k, vg + 0.7 * k, 0.1, 0.24);
    }
    // ── the belfry: piers, the openings deep between them, louvres, a mullion and a roundel in each head
    const bs = ct, ve = bt, sill = bs + 0.9 * k, vsp = bs + 3.9 * k, rise = 3.0 * k, ops = [[1.8, 5.5], [6.5, 10.2]];
    A(f, S, 1.4, s - 1.4, bs - 0.0, sill, -BEL - 0.01, 0.0);
    A(f, S, 1.4, 1.8, bs, ve, -BEL - 0.01, 0.0); A(f, S, s - 1.8, s - 1.4, bs, ve, -BEL - 0.01, 0.0); A(f, S, 5.5, 6.5, bs, ve, -BEL - 0.01, 0.0);
    A(f, ST, 5.35, 6.65, bs + 0.3, ve - 0.3, -0.01, 0.16);
    for (const [ua, ub] of ops) {
      const uc = (ua + ub) / 2, hw = (ub - ua) / 2, n = 12, hd = (u) => vsp + pointed(u, hw, rise);
      for (let i = 0; i < n; i++) { const a = -hw + 2 * hw * i / n, b = -hw + 2 * hw * (i + 1) / n; Pz(f, S, [[uc + a, hd(a)], [uc + b, hd(b)], [uc + b, ve], [uc + a, ve]], -BEL - 0.01, 0.0); }
      // the dark back of the opening, the louvre slats across its foot, the mullion, the roundel in the head
      Pz(f, 'opening', [[ua, sill], [ub, sill], ...Array.from({ length: n + 1 }, (_, i) => { const a = hw - 2 * hw * i / n; return [uc + a, hd(a) - 0.01]; })], -BEL, -BEL + 0.05);
      for (let v = sill + 0.35; v < vsp + 0.4; v += 0.34) A(f, 'lead', ua + 0.05, ub - 0.05, v, v + 0.1, -BEL + 0.05, -BEL + 0.5);
      A(f, ST, uc - 0.09, uc + 0.09, sill, vsp + rise * 0.55, -BEL + 0.05, -0.1);
      roundel(bag, F[f], y, ST, uc, vsp + rise * 0.62, 0.3, 0.5, -BEL + 0.05, -0.1);
      archBand(bag, F[f], y, ST, uc, hw, vsp, rise, 0.26, -0.05, 0.3, 12);
    }
    // ── the cornice, its corbels, and the pierced parapet above it
    for (let u = 0.3; u < s - 0.1; u += 0.9) A(f, ST, u - 0.15, u + 0.15, bt - 0.3, bt + 0.0, 0.0, 0.6);
  }
  bag.add(ST, box(x0 - 0.6, y + ct, z0 - 0.6, x1 + 0.6, y + ct + 0.35, z1 + 0.6));
  bag.add(ST, box(x0 - 0.6, y + bt, z0 - 0.6, x1 + 0.6, y + bt + 0.9 * k, z1 + 0.6));
  { const py = y + bt + 0.9 * k;
    for (const f of 'nsew') {
      A(f, ST, -0.6, s + 0.6, bt + 0.9 * k, bt + 0.9 * k + 0.12, 0.28, 0.6);
      for (let u = -0.4; u <= s + 0.45; u += 0.9) { A(f, S, u - 0.17, u + 0.17, bt + 0.9 * k, cr + 0.7, 0.3, 0.58); Pz(f, ST, [[u - 0.17, cr + 0.7], [u + 0.17, cr + 0.7], [u, cr + 1.1]], 0.3, 0.58); }
      A(f, ST, -0.6, s + 0.6, cr + 0.15, cr + 0.3, 0.3, 0.58);
    }
    void py; }
  // the corner pinnacles on the cornice
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pinnacle(bag, cx + dx * (s / 2 + 0.05), y + cr + 0.2, cz + dz * (s / 2 + 0.05), 0.65, 7.5);

  // ── the spire's lower stage: a steep pyramid of iron plates, the dormers (louvred lucarnes) on every face, the hips crested
  const sb = cr + 0.2, in0 = 1.0, w1 = 84 * k - sb, inT = s / 2 - 2.6;                           // the base inset from the face, the height, the inset at the collar
  bag.add('iron_galv', frustum([x0 + in0, z0 + in0, x1 - in0, z1 - in0], y + sb, y + 84 * k, inT - in0, inT - in0, inT - in0, inT - in0));
  const inAt = (v) => in0 + (inT - in0) * (v - sb) / w1;
  for (const f of 'nsew') {
    const sill = 74.4 * k, wall = 77.6 * k, apex = 79.8 * k, df = -inAt(sill) + 1.15, db = -inAt(apex) - 0.5, uc = s / 2, hw = 1.5;
    Pz(f, 'iron_galv', [[uc - hw, sill], [uc + hw, sill], [uc + hw, wall], [uc, apex], [uc - hw, wall]], db, df);
    Pz(f, 'opening', [[uc - hw + 0.4, sill + 0.5], [uc + hw - 0.4, sill + 0.5], [uc + hw - 0.4, wall - 0.1], [uc, apex - 0.9], [uc - hw + 0.4, wall - 0.1]], df - 0.01, df + 0.04);
    for (let v = sill + 0.7; v < wall - 0.2; v += 0.3) A(f, 'lead', uc - hw + 0.45, uc + hw - 0.45, v, v + 0.08, df + 0.04, df + 0.12);
    A(f, 'lead', uc - hw - 0.12, uc + hw + 0.12, sill - 0.16, sill, df - 0.3, df + 0.12);
    for (const sg of [-1, 1]) Pz(f, 'gilt_bronze', sg < 0 ? [[uc - hw, wall], [uc - hw + 0.14, wall], [uc, apex - 0.14], [uc, apex]] : [[uc, apex - 0.14], [uc + hw - 0.14, wall], [uc + hw, wall], [uc, apex]], df - 0.05, df + 0.14);
    const [fx, fz] = F[f].at(uc, df - 0.05);
    bag.add('gilt_bronze', lathe([[0.15, 0], [0.09, 0.3], [0.001, 0.9]], 6, null, fx, y + apex, fz));
  }
  // the hips of both stages carry a cresting of crockets
  const crest = (v0, v1, inA, inB, step) => { for (let v = v0; v < v1; v += step) {
    const t = (v - v0) / (v1 - v0), i = inA + (inB - inA) * t;
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const px = cx + dx * (s / 2 - i), pz = cz + dz * (s / 2 - i); bag.add('gilt_bronze', box(px - 0.13, y + v, pz - 0.13, px + 0.13, y + v + 0.38, pz + 0.13)); bag.add('iron', box(px - 0.05, y + v + 0.38, pz - 0.05, px + 0.05, y + v + 0.6, pz + 0.05)); } } };
  crest(sb + 0.6, 83.4 * k, in0, inT, 1.3);
  // the collar between the stages: a lead gallery with its corner finials, and a ring of small gablets
  const ci = s / 2 - 3.05;
  bag.add('lead', box(x0 + ci, y + 84 * k - 0.05, z0 + ci, x1 - ci, y + 84 * k + 0.5, z1 - ci));
  for (const f of 'nsew') for (let j = -1; j <= 1; j++) { const u = s / 2 + j * 1.9, d = -ci + 0.0; Pz(f, 'iron_galv', [[u - 0.7, 84 * k + 0.5], [u + 0.7, 84 * k + 0.5], [u, 84 * k + 1.5]], d - 0.5, d + 0.02); }
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('gilt_bronze', lathe([[0.16, 0], [0.12, 0.3], [0.001, 0.9]], 6, null, cx + dx * (s / 2 - ci - 0.1), y + 84 * k + 0.5, cz + dz * (s / 2 - ci - 0.1)));
  // ── the upper stage: a slender spire rising to the gilt finial
  const ub = 84 * k + 0.5, ut = 92.6 * k, ui = s / 2 - 2.45, uT = s / 2 - 0.3;
  bag.add('iron_galv', frustum([x0 + ui, z0 + ui, x1 - ui, z1 - ui], y + ub, y + ut, uT - ui, uT - ui, uT - ui, uT - ui));
  crest(ub + 0.4, ut - 0.5, ui, uT - 0.1, 1.2);
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.3, 0.05], [0.5, 0.45], [0.52, 0.65], [0.3, 0.95], [0.14, 1.25], [0.08, 2.2], [0.001, H - ut]], 8, null, cx, y + ut, cz));
}
