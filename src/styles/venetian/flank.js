// The side and east walls of San Marco (docs/settlements/venice.md §4h): the brick shell dressed as the sides of the
// church were — a plinth, a blind arcade of round arches cut in a marble skin on colonnettes of coloured stone, a
// cornice, a band of roundels, a storey of arched windows in marble frames under a crowning cornice; the ends of the
// transepts topped by a great semicircular gable of gold mosaic with its saints.
import { box, lathe } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline } from '../renaissance/face.js';
import { band, column, moFig, half, circle } from './front.js';

const M = 'marble', PK = 'marble_pink', VA = 'verde_antico', PC = 'proconnesian', PO = 'porphyry', G = 'mosaic_gold', BL = 'tile_lapis', RB = 'paint_robe', GR = 'mosaic_green', O = 'opening';
const COL = [VA, PK, PC, PO, M];

/** flank(bag, { f ('n' | 's' | 'e' | 'w'), rect (the wall's line as a rectangle), y, H (to the cornice), gable }) */
export function flank(bag, { f, rect, y, H, gable = false, seed = 0 }) {
  const { M: FM, L } = faceFrame(rect, f, y), Lc = new Local();
  const n = Math.max(1, Math.round(L / 4.2)), bay = L / n, w = Math.min(3.0, bay - 1.0), ys = 4.6, top = 7.0;
  Lc.box(M, -0.05, -0.3, -0.05, L + 0.05, 0.6, 0.4);                                                          // the plinth
  // the marble skin, the arches cut through it (the brick shows behind)
  const holes = []; for (let i = 0; i < n; i++) holes.push(archOutline((i + 0.5) * bay, 1.4, w, ys, 'round', 8));
  Lc.add(M, ext([[0, 0.6], [L, 0.6], [L, top], [0, top]], holes, 0, 0.25));
  for (let i = 0; i < n; i++) {
    const uc = (i + 0.5) * bay;
    Lc.add(PK, ext(band(uc, ys, w / 2, w / 2 + 0.2, 1.4), [], 0.25, 0.34));
    if ((i + seed) % 2 === 0) { Lc.add(O, ext(archOutline(uc, 2.2, 1.0, 3.7, 'round', 5), [], 0.0, 0.04)); Lc.add(M, ext(band(uc, 3.7, 0.5, 0.72, 2.1), [], 0.0, 0.14)); }
    Lc.add(i % 2 ? VA : PO, ext(circle(uc, top + 1.1, 0.42, 10), [], 0.0, 0.05)); Lc.add(M, ext(circle(uc, top + 1.1, 0.58, 10), [circle(uc, top + 1.1, 0.42, 10)], 0.0, 0.08));   // the roundels
    const wy = top + 3.0, uw = uc;                                                                              // the upper storey's window
    if (wy + 3.3 < H - 0.8) { Lc.add(O, ext(archOutline(uw, wy, 1.3, wy + 1.7, 'round', 6), [], 0.0, 0.04)); Lc.add(M, ext(band(uw, wy + 1.7, 0.65, 0.95, wy), [], 0.0, 0.16)); Lc.box(M, uw - 0.9, wy - 0.2, 0, uw + 0.9, wy, 0.3); }
  }
  for (let i = 0; i <= n; i++) { const u = Math.min(L - 0.2, Math.max(0.2, i * bay)); column(Lc, COL[(i + seed) % 5], u, 0.3, 0.6, 3.9, 0.17); Lc.box(M, u - 0.3, 4.4, 0, u + 0.3, 4.75, 0.55); }
  Lc.box(M, -0.1, top, 0, L + 0.1, top + 0.35, 0.55);                                                         // the cornice over the arcade
  Lc.box(M, -0.1, top + 2.3, 0, L + 0.1, top + 2.45, 0.3);                                                    // a string between the roundels and the windows
  Lc.box(M, -0.1, H - 0.7, 0, L + 0.1, H, 0.6);                                                              // the crowning cornice
  for (let u = 0.3; u < L - 0.1; u += 0.6) Lc.box(PC, u - 0.12, H - 0.95, 0.0, u + 0.12, H - 0.7, 0.4);       // its corbels
  if (gable) {
    const uc = L / 2, R = Math.min(9.6, L / 2 - 0.8), ys2 = H;
    Lc.add(M, ext(half(uc, ys2, R + 0.9, ys2 - 0.0), [], 0, 0.4));
    Lc.add(M, ext(band(uc, ys2, R, R + 0.7), [], 0.4, 0.7)); Lc.add(PK, ext(band(uc, ys2, R + 0.25, R + 0.42), [], 0.7, 0.76));
    Lc.add(BL, ext(band(uc, ys2, R - 0.4, R), [], 0.4, 0.46));
    Lc.add(G, ext(half(uc, ys2, R - 0.4, ys2), [], 0.4, 0.45));
    Lc.add(GR, ext([[uc - R + 0.4, ys2], [uc + R - 0.4, ys2], [uc + R - 0.4, ys2 + 0.3], [uc, ys2 + 0.6], [uc - R + 0.4, ys2 + 0.3]], [], 0.45, 0.5));
    moFig(Lc, uc, ys2 + 0.3, 6.2, RB, 0.5, true);
    for (const sg of [-1, 1]) { moFig(Lc, uc + sg * 2.8, ys2 + 0.3, 5.0, BL, 0.5, sg > 0); moFig(Lc, uc + sg * 5.2, ys2 + 0.3, 4.0, RB, 0.5); moFig(Lc, uc + sg * 7.0, ys2 + 0.3, 2.8, BL, 0.5); }
    for (const sg of [-1, 1, 0]) { const uw = uc + sg * 4.6; Lc.add(O, ext(archOutline(uw, 9.0, 2.4, 13.4, 'round', 8), [], 0.0, 0.04)); Lc.add(M, ext(band(uw, 13.4, 1.2, 1.6, 9.0), [], 0.0, 0.2)); }
  }
  Lc.emit(bag, FM);
}
