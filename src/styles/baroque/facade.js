// Maderno's front of St Peter's (1607–14) as it stood about 1670 (docs/settlements/baroque-rome.md
// §4b): travertine, about 115 m wide and 45.5 m high; eight giant Corinthian columns (27.5 m,
// 2.77 m across) and pilasters; the five entrances to the portico in the lower order, a rectangular
// window over each (the central one replaced by Buonvicino's relief of Christ giving the keys);
// in the upper order five balconies with small columns, balustrades, pediments and brackets — the
// central one the Loggia of the Blessings — between four smaller niches; the entablature with
// the inscription to Paul V in letters about a metre high; the pediment (30 m, 7.5 m high) with
// the arms over the middle; the attic with eight square windows framed by small pilasters and the
// balustrade, on it Christ the Redeemer (6 m) with his cross, St John the Baptist and eleven
// apostles (5.65 m) by Ambrogio Buonvicino and others (1612–14). At the ends the arches left from
// the bell towers that were never finished (Valadier's clocks in them are of 1790, not shown).
// Built in the frame of the front (u along it from the south end, y up, d out toward the piazza).

import { box, lathe, rod } from '../../core/geom.js';
import { Local, ext, headPts, archOutline, faceFrame } from '../renaissance/face.js';
import { human } from '../greek/sculpture.js';
import { saint } from './piazza.js';
import { ball, T } from '../qing/carving.js';

const TR = 'travertine', CV = 'limestone_carved', O = 'opening', LET = 'bronze', GB = 'gilt_bronze';

// a stroke font for the inscription: each letter as strokes on a 4 × 6 grid ([x0, y0, x1, y1], width 4)
const F = {
  A: [[0, 0, 2, 6], [4, 0, 2, 6], [1, 2, 3, 2]], B: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 3.5, 4.5], [3.5, 4.5, 0, 3], [0, 3, 3.6, 1.6], [3.6, 1.6, 3, 0], [3, 0, 0, 0]],
  C: [[4, 6, 1, 6], [1, 6, 0, 4.5], [0, 4.5, 0, 1.5], [0, 1.5, 1, 0], [1, 0, 4, 0]], D: [[0, 0, 0, 6], [0, 6, 2.5, 6], [2.5, 6, 4, 4.5], [4, 4.5, 4, 1.5], [4, 1.5, 2.5, 0], [2.5, 0, 0, 0]],
  E: [[0, 0, 0, 6], [0, 6, 4, 6], [0, 3, 3, 3], [0, 0, 4, 0]], G: [[4, 6, 1, 6], [1, 6, 0, 4.5], [0, 4.5, 0, 1.5], [0, 1.5, 1, 0], [1, 0, 4, 0], [4, 0, 4, 2.5], [4, 2.5, 2.5, 2.5]],
  H: [[0, 0, 0, 6], [4, 0, 4, 6], [0, 3, 4, 3]], I: [[0.6, 0, 0.6, 6]], L: [[0, 6, 0, 0], [0, 0, 4, 0]],
  M: [[0, 0, 0.5, 6], [0.5, 6, 2, 1.5], [2, 1.5, 3.5, 6], [3.5, 6, 4, 0]], N: [[0, 0, 0, 6], [0, 6, 4, 0], [4, 0, 4, 6]],
  O: [[1, 0, 0, 1.5], [0, 1.5, 0, 4.5], [0, 4.5, 1, 6], [1, 6, 3, 6], [3, 6, 4, 4.5], [4, 4.5, 4, 1.5], [4, 1.5, 3, 0], [3, 0, 1, 0]],
  P: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 4, 5], [4, 5, 4, 4], [4, 4, 3, 3], [3, 3, 0, 3]], R: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 4, 5], [4, 5, 4, 4], [4, 4, 3, 3], [3, 3, 0, 3], [1.5, 3, 4, 0]],
  S: [[4, 6, 1, 6], [1, 6, 0, 5], [0, 5, 0, 4], [0, 4, 4, 2], [4, 2, 4, 1], [4, 1, 3, 0], [3, 0, 0, 0]], T: [[0, 6, 4, 6], [2, 6, 2, 0]],
  V: [[0, 6, 2, 0], [2, 0, 4, 6]], X: [[0, 0, 4, 6], [0, 6, 4, 0]],
};
/** Letters of height hL along u from u0 at y0, raised by t from d0. Returns the length used. */
function inscribe(Lc, text, u0, y0, hL, d0f, t) {
  const dAt = typeof d0f === 'function' ? d0f : () => d0f;
  const k = hL / 6, sw = hL * 0.12; let u = u0;
  for (const ch of text) {
    if (ch === ' ') { u += 2.6 * k; continue; }
    const d0 = dAt(u + 2 * k);
    if (ch === '·') { Lc.box(LET, u + 0.4 * k, y0 + 2.6 * k, d0, u + 1.2 * k, y0 + 3.4 * k, d0 + t); u += 1.6 * k; continue; }
    for (const [a, b, c, d] of F[ch] ?? []) {
      const x0 = u + a * k, yA = y0 + b * k, x1 = u + c * k, yB = y0 + d * k, L = Math.hypot(x1 - x0, yB - yA);
      if (x0 === x1 || yA === yB) { Lc.add(LET, box(Math.min(x0, x1) - sw / 2, Math.min(yA, yB) - sw / 2, d0, Math.max(x0, x1) + sw / 2, Math.max(yA, yB) + sw / 2, d0 + t)); continue; }
      const g = box(-sw / 2, -sw / 2, d0, L + sw / 2, sw / 2, d0 + t); g.rotateZ(Math.atan2(yB - yA, x1 - x0)); g.translate(x0, yA, 0); Lc.add(LET, g);
    }
    u += (ch === 'I' ? 2.2 : ch === 'M' ? 5.2 : 4.9) * k;
  }
  return u - u0;
}
const textLength = (text, hL) => { const k = hL / 6; let u = 0; for (const ch of text) u += (ch === ' ' ? 2.6 : ch === '·' ? 1.6 : ch === 'I' ? 2.2 : ch === 'M' ? 5.2 : 4.9) * k; return u; };

/** A Corinthian capital on a column of top radius r at height y (local u, d): two rows of acanthus, the corner volutes, the abacus. */
function capital(Lc, u, y, d, r, hc) {
  Lc.add(TR, lathe([[r, 0], [r * 1.02, hc * 0.1], [r * 1.12, hc * 0.45], [r * 1.25, hc * 0.72], [r * 1.38, hc * 0.86]], 16, (th, j) => (j === 2 ? 1 + 0.1 * Math.max(0, Math.cos(th * 8)) : j === 3 ? 1 + 0.09 * Math.max(0, Math.cos(th * 8 + Math.PI / 8 * 8)) : 1), u, y, d));
  for (const [su, sd] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) Lc.add(TR, T(ball(r * 0.22, r * 0.22, r * 0.22, 6, 4), u + su * r * 1.18, y + hc * 0.83, d + sd * r * 1.18));
  Lc.box(TR, u - r * 1.48, y + hc * 0.86, d - r * 1.48, u + r * 1.48, y + hc, d + r * 1.48);
}
/** A pilaster capital: leaves in two rows on the face, the volutes at the corners, the abacus. */
function pilasterCapital(Lc, u0, u1, y, d0, d1, hc) {
  const w = u1 - u0;
  Lc.box(TR, u0, y, d0, u1, y + hc * 0.86, d1);
  for (let k = 0; k < 4; k++) { const uc = u0 + (k + 0.5) * w / 4; Lc.add(TR, T(ball(w * 0.11, hc * 0.22, 0.12, 5, 3), uc, y + hc * 0.25, d1)); Lc.add(TR, T(ball(w * 0.1, hc * 0.2, 0.1, 5, 3), uc + (k < 2 ? w / 8 : -w / 8) * (k % 2 ? -1 : 1) * 0, y + hc * 0.55, d1)); }
  for (const uc of [u0 + w * 0.08, u1 - w * 0.08]) Lc.add(TR, T(ball(w * 0.09, w * 0.09, 0.14, 6, 4), uc, y + hc * 0.8, d1));
  Lc.box(TR, u0 - 0.15, y + hc * 0.86, d0, u1 + 0.15, y + hc, d1 + 0.15);
}

/** facade: draws the front on the wall at x = fx facing +x, centred at cz, half-width fw; y the floor, top the balustrade's foot. */
export function stPeterFacade(bag, col, { fx, cz, fw, y, top }) {
  const rect = [fx - 4, cz - fw, fx, cz + fw], { M: FM, L } = faceFrame(rect, 'e', y), Lc = new Local(), U = (dz) => fw - dz;   // u of an offset dz from the axis (dz toward +z: the south)
  Lc.noBack = true; Lc.L = L;
  const s = (top - 0) / 45.5, hcol = 27.5 * s, rc = 1.39 * s, hc = 3.1 * s, yE = hcol, yE1 = yE + 5.4 * s, yAt = yE1, P = 1.5;
  // supports: columns (the eight in the middle) and pilasters, by their offset from the axis
  const cols = [5.8, 10.2, 20.8, 25.2].flatMap((a) => [a * s, -a * s]);
  const pils = [35.8, 40.2, 54.4, 58.2].flatMap((a) => [a * s, -a * s]);
  const fore = (dz) => (Math.abs(dz) < 12.6 * s ? P : 0);                                      // the frontispiece of the middle stands forward
  // the frontispiece block and the plinth along the front
  Lc.box(TR, U(12.6 * s), -0.5, 0, U(-12.6 * s), yE1, P);
  Lc.box(TR, 0, -0.5, 0, L, 1.6, 0.6); Lc.box(TR, U(12.6 * s) - 0.1, -0.5, P, U(-12.6 * s) + 0.1, 1.6, P + 0.6);
  // the columns: base, shaft with its taper and entasis, the Corinthian capital
  for (const dz of cols) {
    const u = U(dz), d0 = fore(dz) + rc * 0.75;
    Lc.box(TR, u - rc * 1.35, 1.6, d0 - rc * 1.35, u + rc * 1.35, 2.3, d0 + rc * 1.35);
    Lc.add(TR, lathe([[rc * 1.3, 0], [rc * 1.3, 0.25], [rc * 1.12, 0.55], [rc * 1.18, 0.7], [rc, 0.95], [rc * 1.01, (hcol - hc - 2.3) * 0.33], [rc * 0.86, hcol - hc - 2.3 - 0.4], [rc * 0.95, hcol - hc - 2.3 - 0.2], [rc * 0.86, hcol - hc - 2.3]], 18, null, u, 2.3, d0));
    capital(Lc, u, hcol - hc, d0, rc * 0.86, hc);
    col.circle(...toW(FM, u, d0), rc, y, y + hcol);
  }
  // the pilasters (also behind the columns, on the wall and the frontispiece's sides)
  for (const dz of [...pils, ...cols]) {
    const u = U(dz), w = rc * 1.7, d0 = fore(dz), isCol = cols.includes(dz);
    Lc.box(TR, u - w / 2 - 0.2, 1.6, d0, u + w / 2 + 0.2, 2.3, d0 + 0.55);
    Lc.box(TR, u - w / 2, 2.3, d0, u + w / 2, hcol - hc, d0 + (isCol ? 0.25 : 0.45));
    pilasterCapital(Lc, u - w / 2, u + w / 2, hcol - hc, d0, d0 + (isCol ? 0.25 : 0.45), hc);
  }
  // the bays: entrances with the windows over them, the upper order's balconies, the niches between
  const wide = [[-5.8, 5.8, 'centre'], [10.2, 20.8], [-20.8, -10.2], [25.2, 35.8], [-35.8, -25.2]];
  const narrow = [[5.8, 10.2], [-10.2, -5.8], [20.8, 25.2], [-25.2, -20.8], [35.8, 40.2], [-40.2, -35.8], [54.4, 58.2], [-58.2, -54.4]];
  for (const [a, b, kind] of wide) {
    const u0 = U(b * s), u1 = U(a * s), uc = (u0 + u1) / 2, d0 = fore((a + b) / 2 * s), ew = kind ? 5.2 * s : 4.4 * s, eh = 10.5 * s;
    // the entrance into the portico: its dark, the moulded frame, the cornice on consoles
    Lc.box(O, uc - ew / 2, 0, d0, uc + ew / 2, eh, d0 + 0.06);
    for (const sg of [-1, 1]) Lc.box('marble', uc + sg * ew / 2 - (sg > 0 ? 0 : 0.6), 0, d0, uc + sg * ew / 2 + (sg > 0 ? 0.6 : 0), eh + 0.6, d0 + 0.35);
    Lc.box('marble', uc - ew / 2 - 0.6, eh, d0, uc + ew / 2 + 0.6, eh + 0.6, d0 + 0.35);
    for (const sg of [-1, 1]) Lc.box(TR, uc + sg * (ew / 2 + 0.3) - 0.25, eh - 1.2, d0 + 0.35, uc + sg * (ew / 2 + 0.3) + 0.25, eh + 0.6, d0 + 0.75);
    Lc.box(TR, uc - ew / 2 - 1.0, eh + 0.6, d0, uc + ew / 2 + 1.0, eh + 1.1, d0 + 0.95);
    // over it, the rectangular window — or, in the middle, the relief of Christ giving the keys
    const wy = eh + 1.5 * s, wh = 2.8 * s;
    if (kind) {
      Lc.box(TR, uc - 4.2 * s, wy, d0, uc + 4.2 * s, wy + wh, d0 + 0.15);
      const figs = [[-2.6, 'ease', false], [-1.3, 'stand', true], [0.1, 'stand', false], [1.4, 'ease', true], [2.7, 'stand', false]];
      for (const [fu, pose, m] of figs) { const f = human({ pose, mirror: m, h: wh * 0.85, drape: 'mantle', n: 5 }); for (const g of [...f.stone, ...f.skin]) { g.scale(1, 1, 0.45); g.translate(uc + fu * s, wy + 0.1, d0 + 0.2); Lc.add(CV, g); } }
    } else {
      Lc.box(O, uc - 1.4 * s, wy, d0, uc + 1.4 * s, wy + wh, d0 + 0.06);
      for (const sg of [-1, 1]) Lc.box(TR, uc + sg * 1.4 * s - (sg > 0 ? 0 : 0.35), wy - 0.35, d0, uc + sg * 1.4 * s + (sg > 0 ? 0.35 : 0), wy + wh + 0.35, d0 + 0.25);
      Lc.box(TR, uc - 1.4 * s, wy - 0.35, d0, uc + 1.4 * s, wy, d0 + 0.3); Lc.box(TR, uc - 1.4 * s, wy + wh, d0, uc + 1.4 * s, wy + wh + 0.35, d0 + 0.25);
    }
    // the upper order: the balcony on brackets with its balustrade, the opening between two small columns, the pediment
    const by = wy + wh + 1.4 * s, bh = (kind ? 7.2 : 6.4) * s, bw = (kind ? 4.6 : 3.4) * s, bd = kind ? 2.2 : 1.2;
    Lc.box(TR, uc - bw / 2 - 1.3, by - 0.45, d0, uc + bw / 2 + 1.3, by, d0 + bd);
    for (let k = 0; k < 4; k++) { const ku = uc - bw / 2 - 1.0 + k * (bw + 2.0) / 3; Lc.box(TR, ku - 0.2, by - 1.4, d0, ku + 0.2, by - 0.45, d0 + bd - 0.15); }
    for (let k = 0, nb = Math.round((bw + 2.4) / 0.45); k <= nb; k++) Lc.add(TR, lathe([[0.12, 0], [0.18, 0.3], [0.1, 0.72], [0.13, 0.95], [0.12, 1.0]], 6, null, uc - bw / 2 - 1.2 + k * (bw + 2.4) / nb, by, d0 + bd - 0.25));
    Lc.box(TR, uc - bw / 2 - 1.3, by + 1.0, d0 + bd - 0.45, uc + bw / 2 + 1.3, by + 1.2, d0 + bd);
    for (const sg of [-1, 1]) Lc.box(TR, uc + sg * (bw / 2 + 1.3) - 0.2, by, d0 + 0.4, uc + sg * (bw / 2 + 1.3) + 0.2, by + 1.2, d0 + bd);
    Lc.box(O, uc - bw / 2, by, d0, uc + bw / 2, by + bh, d0 + 0.06);
    for (const sg of [-1, 1]) { const cu = uc + sg * (bw / 2 + 0.55); Lc.add(TR, lathe([[0.36, 0], [0.3, 0.3], [0.27, bh - 0.6], [0.4, bh - 0.3], [0.42, bh]], 10, null, cu, by, d0 + 0.45)); }
    Lc.box(TR, uc - bw / 2 - 1.0, by + bh, d0, uc + bw / 2 + 1.0, by + bh + 0.7, d0 + 0.9);
    const pw = bw / 2 + 1.2, triangular = kind || Math.abs(a) > 20;
    if (triangular) Lc.add(TR, ext([[uc - pw, by + bh + 0.7], [uc + pw, by + bh + 0.7], [uc, by + bh + 0.7 + pw * 0.42]], [], d0, d0 + 0.85));
    else Lc.add(TR, ext(headPts(uc, by + bh + 0.7, 2 * pw, 'round', 8).map(([p, q]) => [p, by + bh + 0.7 + (q - by - bh - 0.7) * 0.45]), [], d0, d0 + 0.85));
  }
  for (const [a, b] of narrow) {
    const u0 = U(b * s), u1 = U(a * s), uc = (u0 + u1) / 2, d0 = fore((a + b) / 2 * s), nw = (u1 - u0) - 1.9 * s;
    for (const [y0, hh] of [[3.0 * s, 8.0 * s], [16.5 * s, 7.0 * s]]) {
      Lc.add(O, ext(archOutline(uc, y0, nw, y0 + hh - nw / 2, 'round', 8), [], d0, d0 + 0.06));
      Lc.add(TR, ext(headPts(uc, y0 + hh - nw / 2, nw + 0.6, 'round', 8).concat(headPts(uc, y0 + hh - nw / 2, nw, 'round', 8).reverse()), [], d0, d0 + 0.25));
      Lc.box(TR, uc - nw / 2 - 0.3, y0 - 0.35, d0, uc + nw / 2 + 0.3, y0, d0 + 0.45);
      for (const sg of [-1, 1]) Lc.box(TR, uc + sg * nw / 2 - (sg > 0 ? 0 : 0.3), y0, d0, uc + sg * nw / 2 + (sg > 0 ? 0.3 : 0), y0 + hh - nw / 2, d0 + 0.25);
    }
  }
  // the arches at the ends (the feet of the bell towers never finished): a passage under each
  for (const sg of [-1, 1]) {
    const uc = U(sg * 47.3 * s), aw = 8.0 * s, ays = 14.0 * s;
    Lc.add(O, ext(archOutline(uc, 0, aw, ays, 'round', 10), [], 0, 0.06));
    Lc.add(TR, ext(headPts(uc, ays, aw + 1.4, 'round', 10).concat(headPts(uc, ays, aw, 'round', 10).reverse()), [], 0, 0.4));
    for (const s2 of [-1, 1]) Lc.box(TR, uc + s2 * aw / 2 - (s2 > 0 ? 0 : 0.7), 0, 0, uc + s2 * aw / 2 + (s2 > 0 ? 0.7 : 0), ays, 0.4);
  }
  // the entablature: three fasciae, the frieze with the inscription, the cornice on modillions
  // (the outer ends return round the corners; where the middle breaks forward the pieces meet without overlapping)
  for (const [u0, u1, d0, e0, e1] of [[0, U(12.6 * s), 0, 1, 0], [U(-12.6 * s), L, 0, 0, 1], [U(12.6 * s), U(-12.6 * s), P, 0, 0]]) {
    for (let k = 0; k < 3; k++) Lc.box(TR, u0, yE + k * 0.45 * s, d0, u1, yE + (k + 1) * 0.45 * s, d0 + 0.75 + k * 0.08);
    Lc.box(TR, u0, yE + 1.35 * s, d0, u1, yE + 3.3 * s, d0 + 0.7);
    Lc.box(TR, u0 - 0.3 * e0, yE + 3.3 * s, d0, u1 + 0.3 * e1, yE + 3.75 * s, d0 + 1.1);
    for (let u = u0 + 0.4; u < u1 - 0.2; u += 1.1) Lc.box(TR, u - 0.22, yE + 3.75 * s, d0 + 0.6, u + 0.22, yE + 4.6 * s, d0 + 1.75);
    Lc.box(TR, u0 - 0.5 * e0, yE + 4.6 * s, d0, u1 + 0.5 * e1, yE1, d0 + 2.0);
  }
  // in three parts, so that no letter straddles the break of the middle
  const hL = 1.0 * s, yI = yE + 1.35 * s + (1.95 * s - hL) / 2, mid = 'PAVLVS V BVRGHESIVS ROMANVS', left = 'IN HONOREM PRINCIPIS APOST', right = 'PONT MAX AN MDCXII PONT VII';
  inscribe(Lc, mid, L / 2 - textLength(mid, hL) / 2, yI, hL, P + 0.7, 0.05);
  inscribe(Lc, left, L / 2 - 12.6 * s - 0.9 - textLength(left, hL), yI, hL, 0.7, 0.05);
  inscribe(Lc, right, L / 2 + 12.6 * s + 0.9, yI, hL, 0.7, 0.05);
  // the pediment over the middle: its field with the arms, the raking cornices
  const pwd = 15.0 * s, ph = 7.5 * s, py = yE1, uc0 = L / 2;
  Lc.add(TR, ext([[uc0 - pwd, py], [uc0 + pwd, py], [uc0, py + ph]], [], 0, P + 0.6));
  for (const sg of [-1, 1]) { const g = box(0, -0.3, 0, Math.hypot(pwd + 0.6, ph), 0.45, P + 2.0); g.rotateZ(sg > 0 ? Math.PI - Math.atan2(ph, pwd) : Math.atan2(ph, pwd)); g.translate(uc0 + sg * (pwd + 0.6), py, 0); Lc.add(TR, g); }
  { const sh = [[uc0 - 1.3, py + 1.0], [uc0 + 1.3, py + 1.0], [uc0 + 1.3, py + 3.2], [uc0, py + 4.0], [uc0 - 1.3, py + 3.2]]; Lc.add('marble', ext(sh, [], P + 0.6, P + 0.85)); Lc.add(GB, lathe([[0.6, 0], [0.55, 0.5], [0.3, 0.9], [0.001, 1.1]], 10, null, uc0, py + 4.0, P + 0.75)); }
  // the attic: short pilasters over the supports, eight square windows framed by small pilasters, the balustrade
  const yT = top, ats = [...cols, ...pils].map((dz) => U(dz)).sort((p, q) => p - q);
  for (const u of ats) Lc.box(TR, u - rc * 0.85, yAt, 0, u + rc * 0.85, yT, 0.35);
  const winAt = [15.5, 30.5, 44.5, 50.1].flatMap((a) => [a, -a]);
  for (const dz of winAt) { const u = U(dz * s), ww = 2.6 * s, wy = yAt + 2.0 * s; Lc.box(O, u - ww / 2, wy, 0, u + ww / 2, wy + ww, 0.06); for (const sg of [-1, 1]) Lc.box(TR, u + sg * (ww / 2 + 0.2) - 0.22, wy - 0.3, 0, u + sg * (ww / 2 + 0.2) + 0.22, wy + ww + 0.3, 0.3); Lc.box(TR, u - ww / 2 - 0.5, wy + ww + 0.3, 0, u + ww / 2 + 0.5, wy + ww + 0.65, 0.4); Lc.box(TR, u - ww / 2 - 0.4, wy - 0.4, 0, u + ww / 2 + 0.4, wy - 0.1, 0.35); }
  Lc.box(TR, -0.2, yT - 0.6, 0, L + 0.2, yT, 0.6);
  for (let u = 0.35; u < L - 0.2; u += 0.55) Lc.add(TR, lathe([[0.14, 0], [0.21, 0.35], [0.11, 0.85], [0.15, 1.1], [0.14, 1.15]], 6, null, u, yT, 0.3));
  Lc.box(TR, -0.2, yT + 1.15, 0, L + 0.2, yT + 1.45, 0.6);
  // the thirteen statues over the supports: Christ the Redeemer with his cross in the middle, the Baptist and eleven apostles
  const axes = [0, 5.8, -5.8, 10.2, -10.2, 20.8, -20.8, 25.2, -25.2, 35.8, -35.8, 40.2, -40.2];
  axes.forEach((dz, i) => {
    const u = U(dz * s), ys = yT + 1.45;
    Lc.box(TR, u - 0.8, ys, -0.2, u + 0.8, ys + 0.7, 1.0);
    if (i === 0) {
      const f = human({ pose: 'stand', h: 6.0, drape: 'mantle', n: 6, arms: { l: [[-0.15, 0.68, 0.05], [-0.12, 0.88, 0.1]], r: [[0.16, 0.66, 0.06], [0.18, 0.82, 0.12]] } });
      for (const g of [...f.stone, ...f.skin]) { g.translate(u, ys + 0.7, 0.4); Lc.add(CV, g); }
      Lc.add(GB, box(u - 0.95, ys + 0.7 + 1.2, 0.95, u - 0.8, ys + 0.7 + 7.6, 1.1)); Lc.add(GB, box(u - 1.6, ys + 0.7 + 6.3, 0.95, u - 0.15, ys + 0.7 + 6.45, 1.1));   // the cross, its top of copper
    } else {
      const g = saint(i * 3 + 1);
      for (const p of g) { p.scale(1.82, 1.82, 1.82); p.translate(u, ys + 0.7, 0.4); Lc.add(CV, p); }
    }
  });
  Lc.emit(bag, FM);
}
const toW = (FM, u, d) => { const e = FM.elements; return [e[12] + e[0] * u + e[8] * d, e[14] + e[2] * u + e[10] * d]; };
