// The Palazzo Medici on the Via Larga about 1480 (docs/settlements/florence.md §4): Michelozzo's
// block of pietraforte (1444–60) in three storeys of falling height — rough rustication below,
// drafted blocks on the piano nobile, smooth ashlar above — under one great cornice on modillions
// and dentils; the two-light windows with round-headed lights; the portal; the loggia at the corner
// of the Via de' Gori, then open; the shops on the side street; the stone bench along the foot; the
// Medici arms on the corner. Inside, the square court of three arches a side on columns, the frieze
// of tondi linked by sgraffito garlands, the piano nobile's windows over the arches, the open loggia
// of the top storey, and Donatello's bronze David on his pedestal in the middle.

import { box, lathe, frustum, rod, fromTriangles } from '../../core/geom.js';
/** A flat quad facing +d at depth d (a line drawn on a wall). */
const quad = (u0, y0, u1, y1, d) => fromTriangles([u0, y0, d, u1, y0, d, u1, y1, d, u0, y0, d, u1, y1, d, u0, y1, d]);
import { faceFrame, Local, ext, archOutline, voussoirs, wrect, merge } from './face.js';
import { rusticate, dropFace, bifora } from './signoria.js';
import { ball, limb, T } from '../qing/carving.js';

const PF = 'limestone_yellow', SER = 'pietra_serena', M = 'marble_smooth', R = 'roof_tile', W = 'wood_dark', O = 'opening', PL = 'plaster_white', STU = 'stucco', BR = 'bronze';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The rectangle `o` less the holes: boxes (as rects) covering what is left, merged along x in each row. */
export function rectsMinus(o, holes) {
  const hs = holes.map((h) => [Math.max(o[0], h[0]), Math.max(o[1], h[1]), Math.min(o[2], h[2]), Math.min(o[3], h[3])]).filter((h) => h[2] > h[0] && h[3] > h[1]);
  const xs = [...new Set([o[0], o[2], ...hs.flatMap((h) => [h[0], h[2]])])].sort((a, b) => a - b);
  const zs = [...new Set([o[1], o[3], ...hs.flatMap((h) => [h[1], h[3]])])].sort((a, b) => a - b);
  const out = [];
  for (let j = 0; j + 1 < zs.length; j++) {
    let run = null;
    for (let i = 0; i + 1 < xs.length; i++) {
      const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2, hole = hs.some((h) => cx > h[0] && cx < h[2] && cz > h[1] && cz < h[3]);
      if (!hole) { if (run) run[2] = xs[i + 1]; else run = [xs[i], zs[j], xs[i + 1], zs[j + 1]]; }
      else if (run) { out.push(run); run = null; }
    }
    if (run) out.push(run);
  }
  return out;
}

/** The outline of a wall from u0 to u1 and y0 to yt with round arches [[u, w], …] springing at ys cut up from its foot (counter-clockwise). */
function wallArches(u0, u1, y0, yt, arches, ys) {
  const pts = [[u1, yt], [u0, yt], [u0, y0]];
  for (const [u, w] of [...arches].sort((a, b) => a[0] - b[0])) pts.push([u - w / 2, y0], [u - w / 2, ys], ...archOutline(u, y0, w, ys, 'round', 12).slice(3, -1).reverse(), [u + w / 2, ys], [u + w / 2, y0]);
  pts.push([u1, y0]);
  return fixOutline(pts);
}

/** A column with base and a leaf capital (composite-like), from y0, shaft height h, radius r, at (x, z). */
function column(bag, mat, x, y0, z, h, r) {
  bag.add(mat, lathe([[r * 1.45, 0], [r * 1.45, 0.12], [r * 1.25, 0.2], [r * 1.3, 0.28], [r * 1.05, 0.36], [r, 0.42], [r * 0.88, h], [r * 1.0, h + 0.06], [r * 1.0, h + 0.12]], 14, null, x, y0, z));
  bag.add(mat, lathe([[r * 0.95, 0], [r * 1.15, 0.2], [r * 1.4, 0.45], [r * 1.62, 0.6], [r * 1.62, 0.62]], 16, (th, j) => (j === 2 || j === 3 ? 1 + 0.14 * Math.cos(th * 8) : 1), x, y0 + h + 0.12, z));
  bag.add(mat, box(x - r * 1.7, y0 + h + 0.74, z - r * 1.7, x + r * 1.7, y0 + h + 0.92, z + r * 1.7));
  return y0 + h + 0.92;
}

/** A roundel of marble in a moulded frame, centred at (u, y) on a face (Local coordinates), radius s, a figure in low relief. */
function tondo(Lc, u, y, s, k) {
  const ring = (r, n = 28) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [u + Math.cos(a) * r, y + Math.sin(a) * r]; });
  Lc.add(M, ext(ring(s), [ring(s * 0.8).reverse()], 0, 0.14));
  Lc.add(M, ext(ring(s * 0.8), [], 0, 0.05));
  // the figure: a standing or seated body, a head, an arm raised (the gems' subjects generalised)
  const sit = k % 2, h = s * 1.1;
  Lc.add(M, ext([[u - s * 0.18, y - h * 0.45], [u + s * 0.18, y - h * 0.45], [u + s * 0.14, y + h * (sit ? 0.05 : 0.2)], [u - s * 0.14, y + h * (sit ? 0.05 : 0.2)]], [], 0.05, 0.11));
  Lc.add(M, T(ball(s * 0.11, s * 0.13, s * 0.05, 8), u, y + h * (sit ? 0.18 : 0.33), 0.1));
  Lc.add(M, ext([[u + s * 0.12, y + h * 0.1], [u + s * 0.45, y + h * 0.35], [u + s * 0.42, y + h * 0.42], [u + s * 0.1, y + h * 0.2]], [], 0.05, 0.1));
  if (sit) Lc.add(M, ext([[u - s * 0.4, y - h * 0.45], [u - s * 0.15, y - h * 0.45], [u - s * 0.15, y - h * 0.05], [u - s * 0.4, y - h * 0.05]], [], 0.05, 0.09));
}

/** Donatello's bronze David, about 1.58 m: the nude youth in his laurelled hat, the sword in his right hand, his left on his hip, a foot on Goliath's head. Facing +z, standing at the origin. */
function david(Lc) {
  const B = (rx, ry, rz, x, y, z, n = 9) => Lc.add(BR, T(ball(rx, ry, rz, n), x, y, z));
  const L2 = (a, b, r0, r1) => Lc.add(BR, limb(a, b, r0, r1, 9));
  // Goliath's head on the ground, the helmet's wings
  B(0.17, 0.13, 0.2, 0.08, 0.12, 0.1); B(0.15, 0.04, 0.22, 0.08, 0.04, 0.1);
  Lc.add(BR, ext([[0, 0], [0.35, 0.08], [0.4, 0.3], [0.05, 0.12]], [], -0.015, 0.015).rotateY(Math.PI / 2).translate(0.2, 0.12, 0.0));
  // the legs: the weight on the right, the left bent onto the head
  L2([-0.09, 0.05, 0], [-0.08, 0.45, 0.02], 0.045, 0.06); L2([-0.08, 0.45, 0.02], [-0.07, 0.82, 0], 0.065, 0.085);
  L2([0.07, 0.24, 0.12], [0.09, 0.52, 0.08], 0.045, 0.06); L2([0.09, 0.52, 0.08], [0.07, 0.82, 0], 0.065, 0.085);
  B(0.05, 0.03, 0.1, -0.09, 0.03, 0.03, 7); B(0.05, 0.03, 0.09, 0.07, 0.22, 0.17, 7);
  // the body in contrapposto, the hips swung out to his right
  B(0.14, 0.11, 0.1, -0.01, 0.86, 0); L2([-0.01, 0.86, 0], [0.01, 1.18, 0.01], 0.12, 0.13); B(0.15, 0.1, 0.09, 0.01, 1.2, 0.01);
  L2([0.01, 1.26, 0.01], [0.0, 1.34, 0.02], 0.04, 0.04);
  B(0.075, 0.09, 0.08, 0.0, 1.41, 0.03);
  // the hat with its brim and laurel, the long hair
  Lc.add(BR, lathe([[0.17, 0], [0.17, 0.015], [0.08, 0.03], [0.07, 0.1], [0.001, 0.12]], 14, null, 0.0, 1.46, 0.03));
  B(0.08, 0.06, 0.06, 0.0, 1.39, -0.02, 7);
  // the right arm down, holding the long sword with its point on the ground; the left on the hip, a stone in the hand
  L2([-0.15, 1.24, 0.01], [-0.2, 1.0, 0.02], 0.04, 0.035); L2([-0.2, 1.0, 0.02], [-0.22, 0.78, 0.06], 0.035, 0.03);
  Lc.add(BR, box(-0.235, 0.0, 0.065, -0.215, 0.8, 0.085)); Lc.add(BR, box(-0.29, 0.78, 0.06, -0.16, 0.81, 0.09));
  L2([0.16, 1.24, 0.01], [0.22, 1.03, -0.03], 0.04, 0.035); L2([0.22, 1.03, -0.03], [0.12, 0.9, 0.02], 0.035, 0.03); B(0.035, 0.03, 0.035, 0.12, 0.89, 0.05, 6);
}

/**
 * palazzo_medici: { rect, y, court (side of the open court), portico (depth) } — the front on the east
 * (the Via Larga), the side on the south (the Via de' Gori), the loggia at their corner.
 */
export function palazzoMedici(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, y = el.y ?? 0, rand = rng(1444);
  const yG = 9.0, y1 = 16.5, yT = 22.0, yR = 24.0, yP = 8.4;          // the storeys, the top of the walls, the portico's ceiling
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, cs = el.court ?? 15, pd = el.portico ?? 3.4;
  const C = [cx - cs / 2, cz - cs / 2, cx + cs / 2, cz + cs / 2], K = [C[0] - pd, C[1] - pd, C[2] + pd, C[3] + pd];
  const lgD = 5, lgL = 9.6, LG = [x1 - lgD, z1 - lgL, x1, z1];         // the loggia in the south-east corner
  const pw = 3.4, PG = [K[2] - 0.01, cz - pw / 2, x1 - 1.0, cz + pw / 2]; // the passage from the portal to the court (the front wall's own thickness is the portal's)
  // the mass: below the portico's ceiling all but the court and its portico, the passage and the loggia; then all but the court; the top storey all but the court and its upper loggia
  const layer = (o, holes, ya, yb) => { for (const r of rectsMinus(o, holes)) { bag.add(PF, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); col.rect(r, y + ya, y + yb); } };
  const PS = 5.0, PW0 = [x1 - 1.0, cz - pw / 2 - 1.0, x1, cz + pw / 2 + 1.0];
  layer(rect, [K, LG, PG, PW0], 0, yP);
  // the loggia's front walls with their arches (east: two; south: one), a metre thick
  const archWall = (pts, holes, f, d0) => { const { M: FM } = faceFrame(rect, f, y); const g = ext(pts, holes, d0, 0); g.applyMatrix4(FM); bag.add(PF, g); };
  const eArch = [[3.0, 3.4], [7.3, 3.4]], sArch = [[37.15, 3.1]], ysL = 4.8, Lf = z1 - z0, Ls = x1 - x0;
  archWall(wallArches(0, lgL, 0, yP, eArch, ysL), [], 'e', -1.0);
  archWall(wallArches(Ls - lgD, Ls - 1.0, 0, yP, sArch, ysL), [], 's', -1.0);
  // the front wall round the portal, the portal's arch through it
  archWall(wallArches(Lf / 2 - pw / 2 - 1.0, Lf / 2 + pw / 2 + 1.0, 0, yP, [[Lf / 2, pw]], PS), [], 'e', -1.0);
  { const { M: FM } = faceFrame(rect, 'e', y); for (const s of [-1, 1]) col.rect(wrect(FM, Lf / 2 + s * pw / 2, -1.0, Lf / 2 + s * (pw / 2 + 1.0), 0), y, y + yP); }
  for (const [u, w] of eArch) { const { M: FM } = faceFrame(rect, 'e', y); for (const s of [-1, 1]) col.rect(wrect(FM, u + s * w / 2 - (s < 0 ? 1.3 : 0), -1.0, u + s * w / 2 + (s > 0 ? 0.9 : 0), 0), y, y + ysL); }
  { const { M: FM } = faceFrame(rect, 's', y); col.rect(wrect(FM, Ls - lgD, -1.0, sArch[0][0] - sArch[0][1] / 2, 0), y, y + ysL); }
  // the passage's walls are the mass's; its ceiling, the loggia's vault (shown flat, plastered), their floors
  bag.add(STU, box(PG[0], y + yP - 0.25, PG[1], x1 - 1.0, y + yP, PG[3]));
  bag.add(STU, box(LG[0], y + yP - 0.25, LG[1], LG[2] - 1.0, y + yP, LG[3] - 1.0));
  bag.add(SER, box(PG[0], y - 0.3, PG[1], x1, y + 0.04, PG[3])); col.floor([PG[0], PG[1], x1, PG[3]], y + 0.04);
  bag.add(SER, box(LG[0], y - 0.3, LG[1], LG[2], y + 0.04, LG[3])); col.floor(LG, y + 0.04);
  // the loggia's stone bench along its back walls
  bag.add(PF, box(LG[0], y, LG[1], LG[0] + 0.5, y + 0.48, LG[3] - 1.0)); bag.add(PF, box(LG[0] + 0.5, y, LG[1], LG[2] - 1.0, y + 0.48, LG[1] + 0.5));
  col.rect([LG[0], LG[1], LG[0] + 0.5, LG[3] - 1.0], y, y + 0.48);
  layer(rect, [C], yP, y1);
  layer(rect, [K], y1, yR);
  // the upper loggia's floor over the portico's wings, and the court's own paving
  for (const r of rectsMinus(K, [C])) { bag.add(STU, box(r[0], y + y1 - 0.3, r[1], r[2], y + y1, r[3])); }
  bag.add(SER, box(K[0], y - 0.3, K[1], K[2], y + 0.04, K[3])); col.floor(K, y + 0.04, 'court');

  // ---- the four fronts ---------------------------------------------------------------------------
  const RU = new Local();
  for (const f of 'esnw') {
    const { M: FM, L } = faceFrame(rect, f, y), Lc = new Local(), front = f === 'e', side = f === 's', street = front || side;
    Lc.noBack = true; Lc.L = L;
    const nb = f === 'w' ? [1, 0] : f === 'e' ? [-1, 0] : f === 'n' ? [0, 1] : [0, -1];
    Lc.put = (u0, y0, d0, u1, y1b, d1) => { const r = wrect(FM, u0, d0, u1, d1); RU.add(PF, dropFace(box(r[0], y + y0, r[1], r[2], y + y1b, r[3]), nb, y0 > 2.5)); };
    const nB = Math.round(L / 4), bw = L / nB, bu = (i) => (i + 0.5) * bw;
    // the string courses (each a moulded sill course carrying the windows above), the plinth
    for (const ys of [yG, y1]) { Lc.box(PF, 0, ys - 0.5, -0.04, L, ys - 0.2, 0.32); Lc.box(PF, 0, ys - 0.2, -0.04, L, ys, 0.42); Lc.box(PF, 0, ys - 0.62, -0.04, L, ys - 0.5, 0.2); }
    Lc.box(PF, 0, -0.4, -0.04, L, 0.25, 0.42);
    // the windows of the piano nobile and the top storey: every bay
    const holesN = [], holesT = [];
    // (the north front stood against its neighbours' houses: no windows on it)
    if (f !== 'n') for (let i = 0; i < nB; i++) {
      const uc = bu(i);
      for (const [s, hl, H] of [[yG + 0.6, 3.2, holesN], [y1 + 0.5, 2.6, holesT]]) {
        const ys = s - 0.15 + hl, ro = 1.3 + 0.6;
        H.push({ u0: uc - 1.36, u1: uc + 1.36, y0: s - 0.02, y1: ys + ro + 0.02, hw: (yy) => (yy <= ys ? 1.36 : Math.sqrt(Math.max(0, ro * ro - (yy - ys) ** 2)) + 0.02) });
        bifora(Lc, uc, s, { hl, vou: 0.6, proj: H === holesN ? 0.12 : 0.06, mat: PF, stone: PF, light: 'round', lite: true });
      }
    }
    // the ground storey: the portal, the loggia's arches, the shops, the small windows high up
    const holesG = [], arch = (u, w, ys, ro) => holesG.push({ u0: u - w / 2 - ro, u1: u + w / 2 + ro, y0: 0.2, y1: ys + w / 2 + ro + 0.02, hw: (yy) => (yy <= ys ? w / 2 + 0.04 : Math.sqrt(Math.max(0, (w / 2 + ro) ** 2 - (yy - ys) ** 2)) + 0.02) });
    const ar = 0.85;
    if (front) {
      const pu = L / 2, ps = PS;
      arch(pu, pw, ps, ar);
      voussoirs(Lc, PF, pu, ps, pw / 2, pw / 2 + ar, -0.04, 0.38, 13, 0.06);
      for (const s of [-1, 1]) { const g = s > 0 ? box(0, 0.04, -0.06, pw / 2 - 0.05, ps + pw / 2 - 0.4, 0.06) : box(-(pw / 2 - 0.05), 0.04, -0.06, 0, ps + pw / 2 - 0.4, 0.06); g.rotateY(s * 1.35); g.translate(pu + s * (pw / 2 - 0.1), 0, -1.05); Lc.add(W, g); }   // the leaves, opened back into the passage
      for (const [u, w] of eArch) { arch(u, w, ysL, ar); voussoirs(Lc, PF, u, ysL, w / 2, w / 2 + ar, -0.04, 0.38, 13, 0.06); }
    }
    if (side) {
      for (const [u, w] of sArch) { arch(u, w, ysL, ar); voussoirs(Lc, PF, u, ysL, w / 2, w / 2 + ar, -0.04, 0.38, 13, 0.06); }
      // three shops under round arches: the dark of the shop, the counter, the shutter propped up as an awning
      for (const u of [6, 14, 22]) {
        const w = 2.8, ys = 3.4; arch(u, w, ys, ar); voussoirs(Lc, PF, u, ys, w / 2, w / 2 + ar, -0.04, 0.38, 11, 0.06);
        Lc.add(O, ext(archOutline(u, 0.25, w, ys, 'round', 8), [], -0.03, 0.005));
        Lc.box(W, u - w / 2, 0.25, -0.03, u + w / 2, 1.05, 0.5); Lc.box(W, u - w / 2 - 0.05, 1.05, -0.03, u + w / 2 + 0.05, 1.12, 0.62);
        const aw = box(u - w / 2 + 0.05, -0.04, 0, u + w / 2 - 0.05, 0.04, 1.0); aw.rotateX(-0.5); aw.translate(0, ys - 0.1, 0.02); Lc.add(W, aw);
        col.rect(wrect(FM, u - w / 2, 0, u + w / 2, 0.62), y, y + 1.12);
      }
    }
    if (street) for (let i = 0; i < nB; i++) {
      const uc = bu(i), busy = holesG.some((h) => uc + 0.8 > h.u0 && uc - 0.8 < h.u1) || (front && uc < lgL + 1.2);
      if (busy) continue;
      holesG.push({ u0: uc - 0.6, u1: uc + 0.6, y0: 5.9, y1: 7.6 });
      Lc.add(O, ext([[uc - 0.55, 5.95], [uc + 0.55, 5.95], [uc + 0.55, 7.55], [uc - 0.55, 7.55]], [], -0.03, 0.005));
      Lc.box(PF, uc - 0.7, 5.75, -0.04, uc + 0.7, 5.95, 0.34);
      for (let k = -1; k <= 1; k++) Lc.box('iron', uc + k * 0.32 - 0.02, 5.95, 0.02, uc + k * 0.32 + 0.02, 7.55, 0.06);   // the grille
    }
    // the stone bench along the foot of the street fronts (not across the openings)
    if (street) {
      const cuts = holesG.filter((h) => h.y0 < 1).map((h) => [h.u0 - 0.1, h.u1 + 0.1]).sort((a, b) => a[0] - b[0]);
      let u = front ? lgL + 0.1 : 0.4; const end = side ? Ls - lgD - 0.1 : L - 0.4;
      for (const [a, b] of [...cuts, [end, end]]) { if (a - u > 0.8) { Lc.box(PF, u, -0.3, 0.42, Math.min(a, end), 0.48, 0.95); col.rect(wrect(FM, u, 0.42, Math.min(a, end), 0.95), y, y + 0.48); } u = Math.max(u, b); if (u >= end) break; }
    }
    // the masonry: rough below (the courses higher), drafted on the piano nobile, the top left smooth
    if (street) rusticate(Lc, 0, L, 0.25, yG - 0.72, holesG, 0.3, rand, 0.82);
    else rusticate(Lc, 0, L, 0.25, yG - 0.72, [], 0.22, rand, 0.82);
    rusticate(Lc, 0, L, yG, y1 - 0.72, holesN, 0.07, rand, 0.62);
    // the cornice: architrave and frieze, the dentils, the ovolo, the modillions, the corona, the cyma;
    // the long fronts carry each member round the corners by its own projection, the short ones stop against them
    const long = f === 'e' || f === 'w', ring = (ya, yb, d, mat = PF) => Lc.box(mat, long ? -d : 0, yT + ya, -0.04, long ? L + d : L, yT + yb, d);
    ring(-0.6, 0, 0.3); ring(0, 0.18, 0.45);
    for (let u = (long ? -0.6 : 0) + 0.06; u < (long ? L + 0.6 : L) - 0.12; u += 0.28) Lc.box(PF, u, yT + 0.18, 0, u + 0.14, yT + 0.42, 0.6);
    ring(0.42, 0.62, 0.75);
    for (let u = (long ? -1.75 : 0) + 0.45; u < (long ? L + 1.75 : L) - 0.3; u += 0.9) {
      Lc.box(PF, u - 0.15, yT + 0.62, 0, u + 0.15, yT + 1.05, 1.0);
      Lc.box(PF, u - 0.15, yT + 1.05, 0, u + 0.15, yT + 1.25, 1.75);
      Lc.box(PF, u - 0.13, yT + 0.66, 1.0, u + 0.13, yT + 0.95, 1.2);
    }
    ring(1.25, 1.6, 2.0); ring(1.6, 2.0, 2.15);
    Lc.emit(bag, FM);
  }
  RU.emit(bag);
  // the arms of the Medici on the corner, across it: the shield with its six balls under a cartouche
  {
    const Lc = new Local(), sh = [[-0.9, 1.1], [0.9, 1.1], [0.95, -0.2], [0.5, -0.9], [0, -1.15], [-0.5, -0.9], [-0.95, -0.2]];
    Lc.add(PF, ext([[-1.2, 1.35], [1.2, 1.35], [1.25, -0.25], [0.6, -1.15], [0, -1.45], [-0.6, -1.15], [-1.25, -0.25]], [], 0, 0.25));
    Lc.add(PF, ext(sh, [], 0.25, 0.35));
    for (const [u, v, r] of [[0, 0.7, 0.24], [-0.45, 0.25, 0.2], [0.45, 0.25, 0.2], [-0.35, -0.25, 0.2], [0.35, -0.25, 0.2], [0, -0.68, 0.2]]) Lc.add(PF, T(ball(r, r, r * 0.6, 10), u, v, 0.37));
    for (const list of Lc.m.values()) for (const g of list) { g.rotateY(Math.PI / 4); g.translate(x1 + 0.05, y + 12.6, z1 + 0.05); }
    Lc.emit(bag);
  }
  // the roof: a low double pitch over each wing, behind the cornice
  const wings = [[x0 + 0.4, z0 + 0.4, x1 - 0.4, K[1]], [x0 + 0.4, K[3], x1 - 0.4, z1 - 0.4], [x0 + 0.4, K[1], K[0], K[3]], [K[2], K[1], x1 - 0.4, K[3]]];
  wings.forEach((r, i) => { const alongX = i < 2, hw = alongX ? (r[3] - r[1]) / 2 : (r[2] - r[0]) / 2; bag.add(R, frustum(r, y + yR, y + yR + hw * 0.32, hw, hw, hw, hw)); });
  court(bag, col, C, K, y, yP, y1, yR, cs);
}

/** The court: three arches a side on columns, the frieze of tondi and garlands, the piano nobile's windows, the top storey's open loggia, the David. */
function court(bag, col, C, K, y, yP, y1, yR, cs) {
  const nA = 3, sp = cs / nA, cr = 0.3, yc = y + 0.04, hShaft = 5.0, P = C[0] - K[0];
  // the columns on the court's edge: four a side (the corners shared)
  let yCap = 0;
  const ring = (f) => { for (let i = 0; i <= nA; i++) for (let j = 0; j <= nA; j++) if (!(i > 0 && i < nA && j > 0 && j < nA)) f(C[0] + i * sp, C[1] + j * sp); };
  ring((x, z) => { yCap = column(bag, SER, x, yc, z, hShaft, cr); col.circle(x, z, cr * 1.4, y, yCap); });
  // the portico's plastered ceiling (its vaults shown flat); the corners behind the corner columns filled to it
  for (const r of rectsMinus(K, [C])) bag.add(STU, box(r[0], y + yP - 0.1, r[1], r[2], y + yP, r[3]));
  for (const [x, z] of [[C[0], C[1]], [C[2], C[1]], [C[0], C[3]], [C[2], C[3]]]) { const sx = x === C[0] ? -1 : 1, sz = z === C[1] ? -1 : 1; bag.add(PL, box(Math.min(x, x + sx * 0.35), yCap, Math.min(z, z + sz * 0.35), Math.max(x, x + sx * 0.35), y + yP - 0.1, Math.max(z, z + sz * 0.35))); }
  const ys = yCap, r = (sp - 0.7) / 2, s0 = y + yP + 2.0, wT = s0 + 2.7 + 1.3 + 0.4;
  for (const f of 'nsew') {
    // faceFrame's d points out of C; the work is built facing +d and turned to face into the court
    const { M: FM } = faceFrame(C, f, 0), Lc = new Local(), L = cs, short = f === 'e' || f === 'w';
    const ua = short ? 0.12 : 0, ub = short ? L - 0.12 : L;
    // the arcade: the plastered spandrels over the arches up to the ceiling, the archivolts of pietra serena
    Lc.add(PL, ext(wallArches(0, L, ys, y + yP - 0.1, Array.from({ length: nA }, (_, k) => [(k + 0.5) * sp, 2 * r]), ys), [], -0.35, 0.0));
    for (let k = 0; k < nA; k++) voussoirs(Lc, SER, (k + 0.5) * sp, ys, r, r + 0.26, -0.36, 0.06, 15, 0.0);
    // the plaster of the walls above, the frieze between its mouldings, a tondo over every arch, garlands drawn in sgraffito between them
    Lc.box(PL, 0, y + yP - 0.1, -0.02, L, y + y1 - 0.25, 0.004);
    Lc.box(SER, ua, y + yP - 0.1, -0.04, ub, y + yP + 0.06, 0.1);
    for (let k = 0; k < nA; k++) tondo(Lc, (k + 0.5) * sp, y + yP + 0.62, 0.46, k + f.charCodeAt(0));
    for (let k = 0; k <= nA; k++) for (const sg of [-1, 1]) {
      if ((k === 0 && sg < 0) || (k === nA && sg > 0)) continue;
      const u = k * sp;
      // a garland swagged between the ribbon at the column's line and the tondo, thickest at its lowest point
      const tri = [], N = 10, u0 = u + sg * 0.12, u1 = (k + (sg > 0 ? 0.5 : -0.5)) * sp - sg * 0.6, at = (t) => [u0 + (u1 - u0) * t, y + yP + 1.0 - Math.sin(t * Math.PI) * 0.42], th = (t) => 0.025 + Math.sin(t * Math.PI) * 0.05;
      for (let q = 0; q < N; q++) {
        const [ua, va] = at(q / N), [ub, vb] = at((q + 1) / N), ta = th(q / N), tb = th((q + 1) / N), A = [ua, va - ta], B = [ub, vb - tb], Cc = [ub, vb + tb], Dd = [ua, va + ta];
        const P = sg > 0 ? [A, B, Cc, A, Cc, Dd] : [B, A, Dd, B, Dd, Cc];
        for (const [pu, pv] of P) tri.push(pu, pv, 0.008);
      }
      Lc.add(SER, fromTriangles(tri));
      Lc.add(SER, quad(u - 0.04, y + yP + 0.55, u + 0.04, y + yP + 1.05, 0.008));   // the ribbon the garland hangs from
    }
    Lc.box(SER, ua, y + yP + 1.2, -0.04, ub, y + yP + 1.34, 0.12);
    // the piano nobile: an ashlar drawn in sgraffito, a window over each arch
    const win = (u, yy) => [0, 1, 2].some((k) => Math.abs(u - (k + 0.5) * sp) < 1.85) && yy > s0 - 0.35 && yy < wT;
    for (let row = 0, yy = y + yP + 1.34; yy + 0.55 < y + y1 - 0.4; row++, yy += 0.55) {
      // the bed joint, broken at the windows
      let run = null;
      for (let u = 0; u <= L + 1e-6; u += 0.1) { const busy = u >= L - 1e-6 || win(u, yy + 0.54); if (!busy && run === null) run = u; if (busy && run !== null) { if (u - run > 0.15) Lc.add(SER, quad(run, yy + 0.53, u, yy + 0.55, 0.008)); run = null; } }
      for (let u = (row % 2) * 0.6 + 0.6; u < L - 0.1; u += 1.2) if (!win(u, yy) && !win(u, yy + 0.53)) Lc.add(SER, quad(u - 0.012, yy, u + 0.012, yy + 0.53, 0.008));
    }
    for (let k = 0; k < nA; k++) bifora(Lc, (k + 0.5) * sp, s0, { hl: 2.7, vou: 0.35, proj: 0.08, mat: SER, stone: SER, light: 'round', lite: true });
    Lc.box(SER, ua, y + y1 - 0.25, -0.04, ub, y + y1, 0.28);
    // (u, y, d) → (L − u, y, −d): the face turned to look into the court, its winding kept
    for (const list of Lc.m.values()) for (const g of list) { g.rotateY(Math.PI); g.translate(L, 0, 0); }
    for (const [, g] of Lc.free) { g.rotateY(Math.PI); g.translate(L, 0, 0); }
    Lc.emit(bag, FM);
  }
  // the top storey's open loggia: columns on the court's edge, the architrave, the ceiling; its back wall is the portico's line
  const yL = y + y1, hL = 3.4;
  let yTop = 0;
  ring((x, z) => { yTop = column(bag, SER, x, yL, z, hL, 0.18); });
  const yA = yTop + 0.5;
  for (const q of [[C[0] - 0.3, C[1] - 0.3, C[2] + 0.3, C[1] + 0.3], [C[0] - 0.3, C[3] - 0.3, C[2] + 0.3, C[3] + 0.3], [C[0] - 0.3, C[1] + 0.3, C[0] + 0.3, C[3] - 0.3], [C[2] - 0.3, C[1] + 0.3, C[2] + 0.3, C[3] - 0.3]]) bag.add(SER, box(q[0], yTop, q[1], q[2], yA, q[3]));
  for (const q of rectsMinus(K, [[C[0] - 0.3, C[1] - 0.3, C[2] + 0.3, C[3] + 0.3]])) bag.add(STU, box(q[0], yTop + 0.2, q[1], q[2], yTop + 0.32, q[3]));
  // the eaves: a tiled slope from the back wall down over the architrave, running out a little over the court
  const top = y + yR - 0.2, low = yA + 0.25, ang = Math.atan2(top - low, P), len = (P + 0.6) / Math.cos(ang);
  for (const f of 'nsew') {
    const { M: FM } = faceFrame(K, f, 0), L = K[2] - K[0];
    const g = box(0, -0.1, 0, L, 0.1, len); g.rotateX(Math.PI - ang); g.translate(0, top, 0);
    g.applyMatrix4(FM); bag.add(R, g);
  }
  // the David on his pedestal in the middle of the court
  const mx = (C[0] + C[2]) / 2, mz = (C[1] + C[3]) / 2;
  bag.add(M, lathe([[0.85, 0], [0.85, 0.25], [0.7, 0.35], [0.55, 0.45], [0.5, 1.25], [0.62, 1.35], [0.72, 1.5], [0.72, 1.6], [0.001, 1.6]], 16, null, mx, yc, mz));
  col.circle(mx, mz, 0.9, y, y + 1.6);
  const D = new Local(); david(D);
  for (const list of D.m.values()) for (const g of list) { g.rotateY(Math.PI); g.translate(mx, yc + 1.6, mz); }
  D.emit(bag);
}
/** Drop repeated consecutive points of an outline. */
function fixOutline(pts) { const out = []; for (const p of pts) { const q = out[out.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-4) out.push(p); } return out; }
export { merge };
