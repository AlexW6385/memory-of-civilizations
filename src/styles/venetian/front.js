// The west front of San Marco about 1500 (docs/settlements/venice.md §4f): five portals under round arches
// in three orders, deep in the wall, the piers between them carrying two tiers of marble columns; the spandrels
// with roundels of porphyry and serpentine; the lunettes of gold mosaic composed with their figures; the terrace
// with its balustrade and the four gilt horses over the middle portal; behind it the upper register: five arches
// with mosaic lunettes, each crowned with an ogee gable of crockets, a statue at its tip, the pinnacles between
// them carrying saints, and in the middle the lion of St Mark on blue stars. Built in the frame of the front (u
// along +z, y up, d out toward the west).
import { box, lathe, rod, disc } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, wrect } from '../renaissance/face.js';
import { human, horse, limb } from '../greek/sculpture.js';
import { lionOfStMark } from './piazza.js';
import { at, person } from './stone.js';

const M = 'marble', PK = 'marble_pink', VA = 'verde_antico', PC = 'proconnesian', PO = 'porphyry', G = 'mosaic_gold', GB = 'gilt_bronze',
  BL = 'tile_lapis', RB = 'paint_robe', GR = 'mosaic_green', CV = 'limestone_carved', SK = 'skin_light', PL = 'plaster_white', O = 'opening';
const COL = [VA, PK, PC, PO, M, VA, PK];
export const rad = (a, b, r, n, t0 = 0, t1 = Math.PI) => { const p = []; for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; p.push([a + Math.cos(t) * r, b + Math.sin(t) * r]); } return p; };
export const circle = (u, y, r, n = 10) => rad(u, y, r, n, 0, Math.PI * 2).slice(0, n);

/** A band of an arch about (uc, ys) from radius r0 to r1; with legs down to yBot when given. Outline for ext. */
export function band(uc, ys, r0, r1, yBot = null) {
  const outer = rad(uc, ys, r1, 18, Math.PI, 0), inner = rad(uc, ys, r0, 18, 0, Math.PI);   // left to right over the top, then back
  const pts = yBot === null ? outer.concat(inner) : [[uc - r1, yBot], ...outer, [uc + r1, yBot], [uc + r0, yBot], ...inner, [uc - r0, yBot]];
  return pts;
}
export const half = (uc, ys, r, y0 = ys) => [[uc - r, y0], [uc + r, y0], ...rad(uc, ys, r, 18, 0, Math.PI)];   // a field: a rectangle with a round head

/** A column: base, shaft, capital of a basket of leaves, at (u, d), shaft from y0 to y1 (the capital 0.5 above). */
export function column(Lc, mat, u, d, y0, y1, r) {
  Lc.add(M, lathe([[r * 1.5, 0], [r * 1.5, 0.12], [r * 1.15, 0.2], [r, 0.26]], 8, null, u, y0, d));
  Lc.add(mat, lathe([[r, 0], [r * 0.9, y1 - y0 - 0.26]], 8, null, u, y0 + 0.26, d));
  Lc.add(M, lathe([[r * 0.9, 0], [r * 1.2, 0.12], [r * 1.5, 0.3], [r * 1.65, 0.46], [r * 1.65, 0.5]], 8, (th, j) => (j === 2 || j === 3 ? 1 + 0.1 * Math.cos(th * 8) : 1), u, y1, d));
}

/** A figure of a mosaic: robe, head, halo, standing on y0 at u, depth d, height h. */
export function moFig(Lc, u, y0, h, robe, d, book = false) {
  const s = h / 2.2;
  Lc.add(robe, ext([[u - 0.36 * s, y0], [u + 0.36 * s, y0], [u + 0.26 * s, y0 + 1.55 * s], [u + 0.36 * s, y0 + 1.7 * s], [u + 0.3 * s, y0 + 1.82 * s], [u - 0.3 * s, y0 + 1.82 * s], [u - 0.36 * s, y0 + 1.7 * s], [u - 0.26 * s, y0 + 1.55 * s]], [], d, d + 0.03));
  Lc.add(RB === robe ? BL : RB, ext([[u - 0.12 * s, y0 + 0.2 * s], [u + 0.12 * s, y0 + 0.2 * s], [u + 0.1 * s, y0 + 1.7 * s], [u - 0.1 * s, y0 + 1.7 * s]], [], d + 0.03, d + 0.05));   // the tunic's strip
  Lc.add(SK, ext(circle(u, y0 + 1.98 * s, 0.17 * s, 8), [], d, d + 0.045));
  Lc.add(PO, ext(rad(u, y0 + 1.98 * s, 0.3 * s, 12, 0, Math.PI * 2).slice(0, 12), [circle(u, y0 + 1.98 * s, 0.22 * s, 10)], d, d + 0.03));   // the halo's ring
  if (book) Lc.add(GB, ext([[u + 0.18 * s, y0 + 0.9 * s], [u + 0.5 * s, y0 + 0.9 * s], [u + 0.5 * s, y0 + 1.3 * s], [u + 0.18 * s, y0 + 1.3 * s]], [], d + 0.03, d + 0.06));
}

/** The lunette of a portal: the border, the gold ground, the scene. kind 0 city and saints, 1 three saints, 2 the Last Judgment's Christ in his mandorla. */
function lunette(Lc, uc, y0, ys, R, kind, d, sc = 1) {
  Lc.add(BL, ext(band(uc, ys, R - 0.32, R), [], d, d + 0.05).clone());                            // the blue border
  Lc.add(PK, ext(band(uc, ys, R - 0.42, R - 0.32), [], d, d + 0.05));
  const field = half(uc, ys, R - 0.42, y0);
  Lc.add(G, ext(field, [], d, d + 0.04));                                                          // the gold ground
  Lc.add(GR, ext([[uc - R + 0.42, y0], [uc + R - 0.42, y0], [uc + R - 0.42, y0 + 0.22], [uc + 2.4, y0 + 0.4], [uc + 1.0, y0 + 0.2], [uc - 0.4, y0 + 0.42], [uc - 1.8, y0 + 0.2], [uc - R + 0.42, y0 + 0.36]], [], d + 0.04, d + 0.07));   // the green ground
  const dd = d + 0.07, yb = y0 + 0.25, hr = ys - y0 + R;
  if (kind === 2) {
    const cy = yb + 2.3;
    Lc.add(BL, ext(rad(uc, cy, 1.6, 20, 0, Math.PI * 2).slice(0, 20).map(([a, b]) => [uc + (a - uc) * 0.62, cy + (b - cy)]), [], dd, dd + 0.03));   // the mandorla
    Lc.add(PK, ext(band(uc, cy, 0.9, 1.0).concat([]), [], dd + 0.03, dd + 0.05));
    moFig(Lc, uc, yb + 0.6, 3.0 * sc, RB, dd + 0.05, true);
    for (const sg of [-1, 1]) { moFig(Lc, uc + sg * 2.0, yb, 2.4 * sc, BL, dd, sg < 0); moFig(Lc, uc + sg * 3.0, yb, 2.0 * sc, RB, dd); }
  } else if (kind === 1) {
    moFig(Lc, uc, yb, 3.0 * sc, BL, dd, true);
    for (const sg of [-1, 1]) { moFig(Lc, uc + sg * 1.5, yb, 2.6 * sc, RB, dd, sg > 0); moFig(Lc, uc + sg * 2.7, yb, 2.0 * sc, BL, dd); }
  } else {
    for (const [a, w, h, m] of [[-2.9, 1.0, 1.4, PL], [-1.8, 0.8, 2.0, PK], [1.9, 1.1, 1.7, PL], [2.9, 0.7, 1.2, PK]]) {                    // the houses of the city
      Lc.add(m, ext([[uc + a - w / 2, yb], [uc + a + w / 2, yb], [uc + a + w / 2, yb + h], [uc + a - w / 2, yb + h]], [], dd, dd + 0.05));
      Lc.add(O, ext(archOutline(uc + a, yb + 0.1, w * 0.4, yb + h * 0.5, 'round', 4), [], dd + 0.05, dd + 0.07));
    }
    Lc.add(PL, ext(half(uc + 0.2, yb + 2.2, 0.8, yb), [], dd, dd + 0.06));
    moFig(Lc, uc - 0.5, yb, 2.8 * sc, BL, dd + 0.02, true); moFig(Lc, uc + 0.6, yb, 2.4 * sc, RB, dd + 0.02);
  }
}

/** A crocket (a leaf curling up and out) at (u, y) on the right-hand edge's outward normal at angle th; sg -1 mirrors it for the left edge. */
export function crocket(Lc, u, y, th, sg, d) {
  const pts = [[0, 0], [0.22, 0.02], [0.34, 0.22], [0.3, 0.44], [0.2, 0.36], [0.2, 0.22], [0.08, 0.14]].map(([a, b]) => [sg * a, b]);
  const g = ext(pts, [], d, d + 0.3); g.rotateZ(sg > 0 ? th : -th); g.translate(u, y, 0);
  Lc.add(M, g);
}

/**
 * westFront(bag, col, o): o = { fx, z0, z1, y, H, cz } — the narthex's front face at x = fx, from z0 to z1.
 * Returns { zm } (the middle of the front).
 */
export function westFront(bag, col, o) {
  const { fx, z0, z1, y, H } = o, Wf = z1 - z0, PW = Wf / 5, T = H * 0.7, DP = 2.4;
  const { M: FM } = faceFrame([fx, z0, fx, z1], 'w', y), Lc = new Local();
  const P = (k) => (k + 0.5) * PW, RR = (k) => (k === 2 ? 4.8 : 3.9), YS = 8.6, YP = T - 0.6;
  // ── the front plate with the five portals cut through it
  Lc.add(M, ext([[0, -0.6], [Wf, -0.6], [Wf, YP], [0, YP]], [0, 1, 2, 3, 4].map((k) => archOutline(P(k), 0, RR(k) * 2, YS, 'round', 14)), 0, DP));
  // ── three orders of arch round each portal, the legs down the sides; carved bosses on the outer one
  for (let k = 0; k < 5; k++) {
    const R = RR(k), uc = P(k);
    Lc.add(M, ext(band(uc, YS, R, R + 0.22, 0.2), [], DP, DP + 0.16));
    Lc.add(PK, ext(band(uc, YS, R + 0.22, R + 0.42, 0.2), [], DP, DP + 0.1));
    Lc.add(M, ext(band(uc, YS, R + 0.42, R + 0.62, 0.2), [], DP, DP + 0.22));
    for (let i = 1; i < 14; i++) { const a = Math.PI * i / 14, rr = R + 0.52; Lc.add(VA, ext(circle(uc + Math.cos(a) * rr, YS + Math.sin(a) * rr, 0.07, 6), [], DP + 0.22, DP + 0.27)); }
    // the nested portal: shafts in the jambs carrying two smaller arches in the recess
    for (const sg of [-1, 1]) for (const [dd, ru, rr] of [[0.7, R - 0.39, 0.12], [1.5, R - 0.1, 0.11]]) column(Lc, COL[(k + (sg > 0 ? 1 : 0) + (dd > 1 ? 1 : 0)) % 7], uc + sg * ru, dd, 0.3, YS - 1.0, rr);
    Lc.add(M, ext(band(uc, YS - 0.5, R - 0.5, R - 0.28), [], 0.5, 1.0));
    Lc.add(PK, ext(band(uc, YS - 0.5, R - 0.28, R - 0.18), [], 0.5, 0.9));
    Lc.add(M, ext(band(uc, YS - 0.5, R - 0.2, R), [], 1.3, 1.7));
    // the door with its frame, the lintel; over it the gold lunette composed with its figures
    const hw = k === 2 ? 2.0 : 1.3, dh = k === 2 ? 4.8 : 4.3;
    if (k !== 2) {
      Lc.box(O, uc - hw, 0, 0, uc + hw, dh, 0.03);
      Lc.box(WD, uc - hw + 0.1, 0, 0.03, uc + hw - 0.1, 0.2, 0.06);
      // the closed doors: two bronze leaves, each with four raised panels and a gilt boss in each, a ring on the meeting stile [inferred: bronze doors on the side portals]
      for (const sg of [-1, 1]) {
        const a0 = sg < 0 ? uc - hw + 0.08 : uc + 0.015, a1 = sg < 0 ? uc - 0.015 : uc + hw - 0.08, pw = a1 - a0 - 0.3, ph = (dh - 0.7) / 4;
        Lc.box('bronze', a0, 0.2, 0.03, a1, dh - 0.12, 0.07);
        for (let r = 0; r < 4; r++) {
          const y0 = 0.35 + r * ph, mu = (a0 + a1) / 2;
          Lc.box('bronze', mu - pw / 2, y0 + 0.06, 0.07, mu + pw / 2, y0 + ph - 0.06, 0.1);
          Lc.box(GB, mu - 0.05, y0 + ph / 2 - 0.05, 0.1, mu + 0.05, y0 + ph / 2 + 0.05, 0.12);
        }
        Lc.box(GB, (sg < 0 ? a1 - 0.14 : a0 + 0.04), 2.0, 0.07, (sg < 0 ? a1 - 0.04 : a0 + 0.14), 2.1, 0.11);
      }
    }
    if (k !== 2) {                                  // the threshold of each door: a marble sill worn to a dish by the feet of the centuries (the middle 1.2 cm lower) [inferred]
      Lc.box(M, uc - hw, 0, 0.1, uc + hw, 0.058, 0.9);
      for (const [a, b] of [[uc - hw, uc - hw + 0.4], [uc + hw - 0.4, uc + hw]]) Lc.box(M, a, 0, 0.1, b, 0.07, 0.9);
    }
    for (const sg of [-1, 1]) Lc.box(M, sg < 0 ? uc - hw - 0.25 : uc + hw, 0, 0, sg < 0 ? uc - hw : uc + hw + 0.25, dh + 0.3, 0.16);
    Lc.box(PC, uc - hw - 0.3, dh + 0.3, 0, uc + hw + 0.3, dh + 0.55, 0.26);
    lunette(Lc, uc, dh + 0.55, YS - 0.5, R - 0.5, k === 2 ? 2 : k % 2 ? 1 : 0, 0.03, k === 2 ? 1.25 : 1.35);
  }
  // ── the piers' two tiers of columns, the ledges between, the roundels in the spandrels, the frieze
  const piers = [[0, P(0) - RR(0)]];
  for (let k = 0; k < 4; k++) piers.push([P(k) + RR(k), P(k + 1) - RR(k + 1)]);
  piers.push([P(4) + RR(4), Wf]);
  piers.forEach(([a, b], i) => {
    const w = b - a, c = (a + b) / 2, n = w > 2.2 ? 3 : 2, step = Math.min(0.66, (w - 1.5) / Math.max(1, n - 1));
    for (let j = 0; j < n; j++) {
      const u = c + (j - (n - 1) / 2) * step;
      column(Lc, COL[(i * 2 + j) % 7], u, DP + 0.3, 0.2, 4.2, 0.2);
      column(Lc, COL[(i * 2 + j + 3) % 7], u, DP + 0.3, 5.3, 7.9, 0.16);
    }
    Lc.box(M, a + 0.1, 4.7, DP, b - 0.1, 5.05, DP + 0.95); Lc.box(PK, a + 0.15, 5.05, DP, b - 0.15, 5.3, DP + 0.8);
    Lc.box(M, a + 0.1, 8.45, DP, b - 0.1, 8.7, DP + 0.8);
    if (i > 0 && i < 5) {                                                                                      // the roundels over the piers
      const sy = YS + 2.7, r = i % 2 ? 0.95 : 0.8;
      Lc.add(M, ext(circle(c, sy, r + 0.14, 14), [], DP, DP + 0.1));
      Lc.add(i % 2 ? PO : VA, ext(circle(c, sy, r, 14), [], DP + 0.1, DP + 0.14));
      Lc.add(GB, ext(circle(c, sy, r * 0.3, 8), [], DP + 0.14, DP + 0.17));
    }
  });
  for (let u = 0.6; u < Wf - 0.4; u += 1.2) Lc.add(PK, ext([[u, YP - 0.9], [u + 0.5, YP - 0.55], [u, YP - 0.2], [u - 0.5, YP - 0.55]], [], DP, DP + 0.08));   // the frieze of lozenges
  Lc.box(M, -0.15, YP, 0, Wf + 0.15, T - 0.3, DP + 0.4);                                                  // the cornice and the terrace's edge
  Lc.box(PC, -0.15, T - 0.3, 0, Wf + 0.15, T, DP + 0.5);
  // ── the terrace's balustrade, the middle bay thrown forward on corbels for the horses
  const zm = Wf / 2, ht = 6.0, DB = DP + 1.9;
  const bal = (u, d) => Lc.add(M, lathe([[0.1, 0], [0.16, 0.38], [0.08, 0.9], [0.11, 1.0]], 6, null, u, T, d));
  for (let u = 0.25; u < Wf; u += 0.5) if (Math.abs(u - zm) > ht + 0.2) bal(u, DP + 0.3);
  Lc.box(M, -0.1, T + 1.0, DP + 0.2, zm - ht - 0.2, T + 1.15, DP + 0.4); Lc.box(M, zm + ht + 0.2, T + 1.0, DP + 0.2, Wf + 0.1, T + 1.15, DP + 0.4);
  Lc.box(M, -0.1, T - 0.04, DP + 0.2, zm - ht - 0.2, T + 0.1, DP + 0.4); Lc.box(M, zm + ht + 0.2, T - 0.04, DP + 0.2, Wf + 0.1, T + 0.1, DP + 0.4);
  Lc.box(M, zm - ht - 0.2, T - 0.6, DP, zm + ht + 0.2, T, DB);                                              // the forward terrace
  for (let u = zm - ht + 0.4; u < zm + ht; u += 1.0) for (const [d0, d1, yy] of [[DP, DP + 0.7, T - 1.0], [DP, DP + 1.3, T - 0.8]]) Lc.box(PC, u - 0.22, yy, d0, u + 0.22, T - 0.6, d1);
  for (let u = zm - ht + 0.25; u < zm + ht; u += 0.5) bal(u, DB - 0.2);
  for (let d = DP + 0.45; d < DB - 0.3; d += 0.5) for (const sg of [-1, 1]) bal(zm + sg * ht, d);
  Lc.box(M, zm - ht - 0.2, T + 1.0, DB - 0.4, zm + ht + 0.2, T + 1.15, DB); Lc.box(M, zm - ht - 0.2, T - 0.04, DB - 0.4, zm + ht + 0.2, T + 0.1, DB);
  for (const sg of [-1, 1]) Lc.box(M, zm + sg * ht - 0.2, T, DP + 0.2, zm + sg * ht + 0.2, T + 1.15, DB);
  for (const dz of [-3.9, -1.3, 1.3, 3.9]) Lc.box(PC, zm + dz - 0.62, T, DP + 0.5, zm + dz + 0.62, T + 0.55, DB - 0.5);   // the horses' plinths
  // ── the upper register on the terrace: the screen with five arches, the ogee gables, the pinnacles
  const SD = -4.4, SU = T + 5.4, Ru = 4.3;
  Lc.box(M, 0, T - 0.5, SD - 0.8, Wf, SU, SD);
  Lc.box(PC, -0.1, SU - 0.35, SD, Wf + 0.1, SU, SD + 0.5); Lc.box(PC, -0.1, T, SD, Wf + 0.1, T + 0.4, SD + 0.35);       // the cornice under the lunettes, the base
  for (let k = 0; k < 5; k++) {
    const uc = P(k), mid = k === 2, hg = mid ? 10.4 : 8.4;
    Lc.add(M, ext(half(uc, SU, 5.3, SU), [], SD - 0.8, SD));                                                // the round head of the screen
    // the window or the door to the loggia under the lunette
    if (mid) { Lc.add(O, ext(archOutline(uc, T + 0.1, 3.4, T + 3.3, 'round', 10), [], SD - 0.02, SD + 0.05)); Lc.add(M, ext(band(uc, T + 3.3, 1.7, 2.1, T + 0.1), [], SD, SD + 0.2)); }
    else for (const sg of [-1, 1]) { const uw = uc + sg * 2.0; Lc.add(O, ext(archOutline(uw, T + 0.7, 1.6, T + 3.2, 'round', 8), [], SD - 0.02, SD + 0.05)); Lc.add(M, ext(band(uw, T + 3.2, 0.8, 1.1, T + 0.7), [], SD, SD + 0.15)); Lc.box(M, uw - 1.0, T + 0.5, SD, uw + 1.0, T + 0.7, SD + 0.3); }
    // the ogee gable: its sides follow the arch, then curve in to a point
    const side = [], Rg = 5.3, yk = 4.2;
    for (let i = 0; i <= 12; i++) { const yr = yk * i / 12; side.push([Math.sqrt(Rg * Rg - yr * yr), yr]); }
    for (let i = 1; i <= 12; i++) { const s = i / 12, w0 = Math.sqrt(Rg * Rg - yk * yk); side.push([Math.max(0.02, w0 * Math.pow(1 - s, 1.7)), yk + (hg - yk) * s]); }
    const poly = [[uc + Rg, SU - 0.4], ...side.map(([w, yr]) => [uc + w, SU + yr]), ...side.slice().reverse().slice(1).map(([w, yr]) => [uc - w, SU + yr]), [uc - Rg, SU - 0.4]];
    Lc.add(M, ext(poly, [half(uc, SU, Ru, SU).reverse()], SD, SD + 0.3));
    const cen = [uc, SU + 3.0], sc = (k2) => poly.map(([a, b]) => [cen[0] + (a - cen[0]) * k2, cen[1] + (b - cen[1]) * k2]);
    Lc.add(PK, ext(sc(0.93), [sc(0.89)], SD + 0.3, SD + 0.33));                                              // the pink inlay inside the edge
    // the ring of the arch over the lunette, the field, the crockets along the edge
    Lc.add(M, ext(band(uc, SU, Ru, Ru + 0.7), [], SD + 0.3, SD + 0.62));
    Lc.add(PK, ext(band(uc, SU, Ru + 0.25, Ru + 0.4), [], SD + 0.62, SD + 0.68));
    if (mid) {
      Lc.add(G, ext(band(uc, SU, Ru - 0.3, Ru), [], SD + 0.3, SD + 0.36));
      Lc.add(BL, ext(half(uc, SU, Ru - 0.3, SU), [], SD, SD + 0.34));
      for (let i = 0; i < 40; i++) { const a = Math.PI * (0.04 + 0.92 * ((i * 0.618) % 1)), r = 0.4 + ((i * 0.381) % 1) * (Ru - 1.0); Lc.add(GB, ext(circle(uc + Math.cos(a) * r, SU + 0.3 + Math.sin(a) * r * 0.95, 0.09, 5), [], SD + 0.34, SD + 0.37)); }
      const lion = new Local(); lionOfStMark(lion, GB, 1.05);
      for (const list of lion.m.values()) for (const g of list) { g.translate(uc - 1.0, SU + 0.2, SD + 0.75); Lc.add(GB, g); }
    } else lunette(Lc, uc, SU, SU, Ru, k % 2 ? 1 : 0, SD);
    for (let i = 2; i < side.length - 1; i += 2) {
      const a2 = side[i - 1], b2 = side[i + 1], tw = b2[0] - a2[0], ty = b2[1] - a2[1], th = Math.atan2(-tw, ty);       // the outward normal (ty, -tw)
      for (const sg of [-1, 1]) crocket(Lc, uc + sg * side[i][0], SU + side[i][1], th, sg, SD + 0.08);
    }
    // the finial and the statue at the tip: St Mark in the middle, saints on the others
    const tip = SU + hg;
    Lc.add(M, lathe([[0.4, 0], [0.34, 0.5], [0.5, 0.9], [0.3, 1.3], [0.2, 1.5]], 8, (th, j) => (j === 2 ? 1 + 0.15 * Math.cos(th * 4) : 1), uc, tip - 0.2, SD + 0.15));
    person(Lc, { pose: mid ? 'ease' : 'stand', drape: mid ? 'mantle' : 'peplos', bareLegs: false, beard: mid, hair: 'curls', lod: 2, arms: mid ? { R: [-0.14, 0.7, 0.1], L: [0.15, 0.6, 0.1] } : undefined }, CV, at(mid ? 3.4 : 2.4, uc, tip + 1.3, SD + 0.15, (k - 2) * 0.12));
    if (mid) for (const sg of [-1, 1]) {                                                                       // the angels either side of St Mark, on their pinnacles
      Lc.box(M, uc + sg * 2.2 - 0.3, SU + 6.0, SD - 0.3, uc + sg * 2.2 + 0.3, SU + 7.4, SD + 0.3);
      person(Lc, { pose: 'stand', drape: 'chiton', hair: 'curls', lod: 2, arms: { R: [-0.14, 0.7, 0.12], L: [0.14, 0.7, 0.12] } }, CV, at(2.0, uc + sg * 2.2, SU + 7.4, SD, -sg * 0.5));
      for (const w of [-1, 1]) Lc.add(CV, limb([w * 0.1, 1.35, -0.05], [w * 0.55, 2.05, -0.28], 0.07, 0.03, 5).translate(uc + sg * 2.2, SU + 7.4, SD));   // the wings, folded
    }
  }
  // the pinnacles between the gables: a shaft, a gablet, a saint
  for (let k = 0; k <= 5; k++) {
    const zp = k * PW, u = Math.min(Wf - 0.45, Math.max(0.45, zp)), top = SU + 3.0;
    Lc.box(M, u - 0.45, T - 0.5, SD - 0.8, u + 0.45, top, SD + 0.15);
    Lc.add(M, lathe([[0.62, 0], [0.4, 0.6], [0.001, 1.6]], 4).rotateY(Math.PI / 4).translate(u, top, SD - 0.3));
    Lc.box(PC, u - 0.55, top - 0.2, SD - 0.9, u + 0.55, top, SD + 0.25);
    person(Lc, { pose: k % 2 ? 'ease' : 'stand', drape: k % 3 ? 'mantle' : 'peplos', beard: k % 2 === 1, hair: 'curls', lod: 2 }, CV, at(2.0, u, top, SD - 0.3, (k - 2.5) * 0.1));
  }
  Lc.emit(bag, FM);
  // ── the four horses of gilt bronze on their plinths, the outer pair turned toward the inner, two lifting a foreleg
  const hy = y + T + 0.55;
  if (!o.noHorses) for (const [dz, turn, lift] of [[-3.9, 0.22, 1], [-1.3, 0.08, 0], [1.3, -0.08, 1], [3.9, -0.22, 0]]) {
    const hs = horse({ pose: 'stand', h: 1.65, mirror: true }).stone;
    if (lift) { hs.splice(hs.length - 8, 2, limb([-0.35 * 1.1, 1.0 * 1.1, 0.14], [-0.55 * 1.1, 0.72 * 1.1, 0.14], 0.085 * 1.1, 0.05 * 1.1, 6), limb([-0.55 * 1.1, 0.72 * 1.1, 0.14], [-0.5 * 1.1, 0.42 * 1.1, 0.14], 0.05 * 1.1, 0.035 * 1.1, 6)); }
    for (const g of hs) { g.rotateY(turn); g.translate(fx - (DP + 1.0 + 0.35), hy, z0 + zm + dz); bag.add(GB, g); }
  }
  // the piers stand in the way: the plate between the portals, with its columns
  piers.forEach(([a, b]) => col.rect(wrect(FM, a, 0, b, DP + 1.1), y, y + T));
  return { zm: z0 + zm };
}
const WD = 'wood_dark';
