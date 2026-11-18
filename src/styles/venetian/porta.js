// The Porta della Carta of the Doge's Palace (1438–42, Giovanni and Bartolomeo Bon; docs/settlements/venice.md §4i):
// the state gateway between the palace and the basilica — a doorway under a lunette of the lion of St Mark with the
// doge Francesco Foscari kneeling before it, the four Virtues in niches either side, above it the great pointed
// window with its balcony, over that the crocketed ogee gable crowned with Justice, pinnacles at the sides.
import { lathe, rod } from '../../core/geom.js';
import { ext, archOutline } from '../renaissance/face.js';
import { human } from '../greek/sculpture.js';
import { lionOfStMark } from './piazza.js';
import { Local } from '../renaissance/face.js';
import { band, column, moFig, circle, crocket } from './front.js';
import { justice } from './works-b.js';
import { at } from './stone.js';

const M = 'marble', PK = 'marble_pink', PC = 'proconnesian', CV = 'limestone_carved', GB = 'gilt_bronze', BL = 'paint_blue', O = 'opening', WD = 'wood_dark';

/** porta(Lc, uP): into the local frame of a wall (u along it, y up, d out), the gateway centred at uP on the ground. */
export function porta(Lc, uP, figs = true) {
  const W = 3.1;
  Lc.box(M, uP - W, 0, 0, uP + W, 8.0, 0.55);                                                                 // the body of the gate
  Lc.box(PC, uP - W - 0.15, 0, 0, uP + W + 0.15, 0.5, 0.75);                                                  // its plinth
  for (const sg of [-1, 1]) {                                                                                  // the twisted shafts at the sides, pinnacles over them
    const u = uP + sg * (W + 0.1);
    Lc.add(PK, lathe([[0.22, 0], [0.2, 8.4]], 8, (th, j) => 1 + 0.12 * Math.cos(th * 3 + 0), u, 0.5, 0.75));
    Lc.box(M, u - 0.3, 8.9, 0.45, u + 0.3, 9.9, 1.05);
    Lc.add(M, lathe([[0.42, 0], [0.3, 0.7], [0.001, 2.2]], 4).rotateY(Math.PI / 4).translate(u, 9.9, 0.75));
    Lc.add(M, lathe([[0.001, 0], [0.18, 0.15], [0.001, 0.4]], 6).translate(u, 12.1, 0.75));
  }
  // the door in its frame, the lintel
  Lc.box(O, uP - 1.2, 0, 0.55, uP + 1.2, 4.2, 0.58);
  Lc.box(WD, uP - 1.2, 0, 0.58, uP + 1.2, 0.18, 0.6);
  for (const sg of [-1, 1]) Lc.box(PC, sg < 0 ? uP - 1.5 : uP + 1.2, 0, 0.55, sg < 0 ? uP - 1.2 : uP + 1.5, 4.5, 0.8);
  Lc.box(PC, uP - 1.6, 4.2, 0.55, uP + 1.6, 4.55, 0.85);
  // the lunette over the door: the lion of St Mark in gilt on blue, the doge kneeling before him
  Lc.add(BL, ext(archOutline(uP, 4.6, 2.5, 5.7, 'ogee', 8), [], 0.55, 0.62));
  Lc.add(PK, ext(band(uP, 5.7, 1.25, 1.4, 4.6).slice(0, 0).concat(archOutline(uP, 4.55, 2.9, 5.7, 'ogee', 8)), [archOutline(uP, 4.6, 2.5, 5.7, 'ogee', 8)], 0.55, 0.7));
  if (figs) { const lion = new Local(); lionOfStMark(lion, GB, 0.5); for (const list of lion.m.values()) for (const g of list) { g.translate(uP - 0.1, 4.7, 0.65); Lc.add(GB, g); } }
  if (figs) moFig(Lc, uP - 0.85, 4.65, 1.2, GB, 0.64);
  // the four Virtues in niches under crocketed canopies: Prudence, Fortitude, Temperance, Charity
  for (const sg of [-1, 1]) for (const [y0, k] of [[0.9, 0], [5.0, 1]]) {
    const u = uP + sg * 2.1, w = 1.0;
    Lc.add(O, ext(archOutline(u, y0, w, y0 + 1.9, 'pointed', 6), [], 0.55, 0.58));
    Lc.add(PK, ext(archOutline(u, y0 - 0.1, w + 0.45, y0 + 1.9, 'pointed', 6), [archOutline(u, y0, w, y0 + 1.9, 'pointed', 6)], 0.55, 0.72));
    Lc.box(M, u - 0.5, y0 - 0.2, 0.55, u + 0.5, y0, 0.95);
    if (figs) { const fg = human({ pose: 'stand', h: 1.65, drape: 'chiton', n: 5, mirror: sg > 0 }); for (const g of fg.stone) { g.translate(u, y0, 0.74); Lc.add(CV, g); } }
  }
  // the cornice, the great window with its balcony
  Lc.box(M, uP - W - 0.1, 7.7, 0, uP + W + 0.1, 8.1, 0.95);
  const wy = 8.9, ww = 2.6, ws = wy + 2.2;
  Lc.add(O, ext(archOutline(uP, wy, ww, ws, 'pointed', 8), [], 0.55, 0.6));
  Lc.add(M, ext(archOutline(uP, wy - 0.1, ww + 0.8, ws, 'pointed', 8), [archOutline(uP, wy, ww, ws, 'pointed', 8)], 0.55, 0.85));
  Lc.add(M, rod([uP, wy, 0.62], [uP, ws + 1.0, 0.62], 0.07, 6));
  for (const sg of [-1, 1]) Lc.add(M, rod([uP + sg * 0.65, wy + 0.0, 0.62], [uP + sg * 0.65, ws + 0.1, 0.62], 0.04, 5));
  Lc.add(M, ext(circle(uP, ws + 1.5, 0.38, 6), [], 0.6, 0.66));
  Lc.box(M, uP - 1.9, wy - 0.3, 0.55, uP + 1.9, wy, 1.7);
  for (let b = -6; b <= 6; b++) Lc.add(M, lathe([[0.05, 0], [0.08, 0.2], [0.04, 0.45], [0.06, 0.6]], 6, null, uP + b * 0.29, wy, 1.55));
  Lc.box(M, uP - 1.9, wy + 0.6, 1.4, uP + 1.9, wy + 0.72, 1.7);
  // the crocketed gable: a pointed ogee over the window, Justice at its crown
  const gy = ws + 2.6, gw = 5.4, gh = 4.6, og = archOutline(uP, gy, gw, gy, 'ogee', 8).slice(2);
  Lc.add(M, ext([[uP - gw / 2, gy - 0.3], [uP + gw / 2, gy - 0.3], [uP + gw / 2, gy], ...og.slice(0, -1).map(([a, b]) => [a, gy + (b - gy) * gh / (gw / 2 * 1.3)])], [], 0.45, 0.8));
  const side = og.slice(0, og.length / 2 | 0).map(([a, b]) => [a - uP, gy + (b - gy) * gh / (gw / 2 * 1.3)]);
  for (let i = 1; i < side.length - 1; i += 1) {
    const a2 = side[i - 1], b2 = side[i + 1], th = Math.atan2(-(b2[0] - a2[0]), b2[1] - a2[1]);
    for (const sg of [-1, 1]) crocket(Lc, uP + sg * Math.abs(side[i][0]), side[i][1], th, sg, 0.5);
  }
  Lc.add(M, lathe([[0.3, 0], [0.4, 0.4], [0.2, 0.8], [0.001, 1.1]], 8, null, uP, gy + gh - 0.1, 0.6));
  justice(Lc, at(2.2, uP, gy + gh + 0.5, 0.6), 1, CV);
}
