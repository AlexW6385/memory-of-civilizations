// The Campanile of San Marco about 1500 (docs/settlements/venice.md §4, "The Campanile"): a brick shaft on a stone plinth with its
// pilaster strips closed by blind arches, the stair's slit windows climbing the faces in turn; the belfry of white stone, three round
// arches to a face on slim piers, open to the bells hung inside on their timber beams; the dado with the winged lion on blue and Venetia
// seated; the cornice with four small obelisks at the corners; the green pyramid; the gilt angel on its ball. Pieces are drawn in each
// face's own frame (u along, y up, d out) with the shared face helpers of the renaissance style.
import { Matrix4 } from '../../core/three.js';
import { box, lathe, frustum, rod, disc } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, headPts } from '../renaissance/face.js';
import { human } from '../greek/sculpture.js';
import { lionOfStMark } from './piazza.js';

const B = 'brick', I = 'limestone', M = 'marble', GB = 'gilt_bronze', BLUE = 'paint_blue', O = 'opening';

/** bell_tower: { c, s, h, y } — the Campanile; the shaft 50 m, the belfry 10 m, the dado 6 m, the pyramid and the angel to h. */
export function bellTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 12, h = el.h ?? 98, y = el.y ?? 0, h0 = h / 98.6;
  const YS = 50 * h0, YB = YS + 1.2, BH = 9.8 * h0, YD = YB + BH, DH = 6.6 * h0, YC = YD + DH, YP = YC + 1.0;
  const rect = [x - s / 2, z - s / 2, x + s / 2, z + s / 2];
  col.rect(rect, y, y + h);
  // ── the shaft: brick on a plinth of stone ──
  bag.add(B, box(rect[0], y - 0.5, rect[1], rect[2], y + YS, rect[3]));
  const faces = ['s', 'e', 'n', 'w'];
  const pil = [0.25, s / 4, s / 2, s * 3 / 4, s - 0.25];                     // the pilaster strips (the corners wider)
  const panelC = [s / 8, s * 3 / 8, s * 5 / 8, s * 7 / 8];
  faces.forEach((f, fi) => {
    const { M: FM } = faceFrame(rect, f, y), Lc = new Local();
    Lc.box(I, -0.3, -0.5, -0.1, s + 0.3, 2.3, 0.4); Lc.box(I, -0.45, 2.3, -0.1, s + 0.45, 2.55, 0.55);             // the plinth and its moulding
    Lc.box(I, -0.3, 2.55, -0.1, s + 0.3, 2.65, 0.4);
    pil.forEach((u, k) => { const w = k === 0 || k === 4 ? 0.5 : 0.35; Lc.box(B, u - w, 2.65, -0.1, u + w, YS - 3.2, 0.28); Lc.box(I, u - w - 0.05, YS - 3.2, -0.1, u + w + 0.05, YS - 3.05, 0.34); });
    // the blind arches closing each panel at the top
    for (const uc of panelC) {
      const w = s / 4 - 0.75;
      Lc.add(I, ext(headPts(uc, YS - 1.8, w + 0.45, 'round', 10).concat(headPts(uc, YS - 1.8, w + 0.05, 'round', 10).reverse()), [], -0.05, 0.14));
      Lc.box(I, uc - w / 2 - 0.22, YS - 3.05, -0.05, uc - w / 2 + 0.02, YS - 1.8, 0.14); Lc.box(I, uc + w / 2 - 0.02, YS - 3.05, -0.05, uc + w / 2 + 0.22, YS - 1.8, 0.14);
    }
    Lc.box(I, -0.2, YS - 0.55, -0.1, s + 0.2, YS, 0.45);                                                       // the cornice of the shaft
    for (let u = 0.1; u < s - 0.1; u += 0.55) Lc.box(I, u, YS - 0.9, -0.05, u + 0.3, YS - 0.55, 0.38);          // its dentils
    // the stair's slit windows, climbing round the four faces in turn (one flight to each face), each in a stone frame
    for (let i = fi; i < 9; i += 4) {
      const wy = 5 + i * 5.2 * 50 / 49, uc = panelC[(i * 3 + fi) % 4];
      if (wy > YS - 6) continue;
      Lc.box(I, uc - 0.3, wy - 0.15, -0.05, uc + 0.3, wy + 1.35, 0.1);
      Lc.box(O, uc - 0.16, wy, 0.1, uc + 0.16, wy + 1.2, 0.13);
    }
    Lc.emit(bag, FM);
  });
  // ── the belfry: a floor, the corner piers, three round arches to a face, a ceiling, the bells inside ──
  const inset = 0.35, br = [rect[0] + inset, rect[1] + inset, rect[2] - inset, rect[3] - inset], bs = s - 2 * inset, pierW = 1.5, wallT = 1.1, Lw = bs - 2 * pierW;
  const BHt = BH - 1.0;                                                     // up to the underside of the cornice
  bag.add(I, box(rect[0] - 0.4, y + YS, rect[1] - 0.4, rect[2] + 0.4, y + YB, rect[3] + 0.4));              // the string course under the belfry
  bag.add(M, box(br[0] + 0.05, y + YB - 0.05, br[1] + 0.05, br[2] - 0.05, y + YB + 0.15, br[3] - 0.05));      // the belfry's floor
  for (const [px, pz] of [[br[0], br[1]], [br[2] - pierW, br[1]], [br[0], br[3] - pierW], [br[2] - pierW, br[3] - pierW]]) bag.add(M, box(px, y + YB, pz, px + pierW, y + YB + BHt, pz + pierW));
  bag.add(M, box(br[0] + 0.05, y + YB + BHt - 0.2, br[1] + 0.05, br[2] - 0.05, y + YB + BHt, br[3] - 0.05));  // the ceiling
  const aw = (Lw - 2 * 0.7) / 3, sill = 1.3, spring = 4.7;
  faces.forEach((f) => {
    const { M: FM } = faceFrame(br, f, y + YB), Lc = new Local();
    // the wall between the piers with its three openings, 1.1 m thick (the piers at both ends are separate blocks)
    const holes = [0, 1, 2].map((k) => archOutline(k * (aw + 0.7) + aw / 2, sill, aw, spring, 'round', 10));
    Lc.add(M, ext([[0, 0], [Lw, 0], [Lw, BHt], [0, BHt]], holes, -wallT, 0));
    for (let k = 0; k < 3; k++) {
      const uc = k * (aw + 0.7) + aw / 2;
      Lc.add(I, ext(headPts(uc, spring, aw + 0.55, 'round', 10).concat(headPts(uc, spring, aw, 'round', 10).reverse()), [], 0, 0.14));                     // the arch's moulded ring
      Lc.add('marble_pink', ext(archOutline(uc, 0, 0.9, 0.45, 'round', 8).map(([a, b]) => [a, b + spring + aw / 2 + 0.9]), [], 0, 0.06));                     // a roundel of coloured marble in the spandrel's crown
      Lc.box(I, uc - aw / 2 - 0.12, sill - 0.14, 0, uc + aw / 2 + 0.12, sill, 0.26);                                                                       // the sill
      for (let u = uc - aw / 2 + 0.1; u < uc + aw / 2 - 0.1; u += 0.24) Lc.add(M, lathe([[0.06, 0], [0.1, 0.12], [0.06, 0.35], [0.075, 0.5]], 6, null, u + 0.05, sill, 0.1));   // the low balusters of the sill
    }
    for (const k of [0, 1]) { const u = (k + 1) * aw + k * 0.7 + 0.35; for (const sg of [-1, 1]) Lc.add('proconnesian', lathe([[0.15, 0], [0.12, 0.2], [0.11, spring - sill - 0.5], [0.16, spring - sill - 0.3], [0.2, spring - sill]], 8, null, u + sg * 0.18, sill, 0.34)); }   // slim shafts on the middle piers
    Lc.emit(bag, FM.clone().multiply(new Matrix4().makeTranslation(pierW, 0, 0)));                                  // (u starts at the first pier's inner edge)
  });
  // ── the bells, hung in the dark behind the arches on their beams ──
  const bx = (br[0] + br[2]) / 2, bz = (br[1] + br[3]) / 2, yb = y + YB + 0.15;
  const bell = (u, v, sc) => bag.add('bronze', lathe([[0.5 * sc, 0], [0.47 * sc, 0.06 * sc], [0.37 * sc, 0.12 * sc], [0.3 * sc, 0.4 * sc], [0.22 * sc, 0.85 * sc], [0.13 * sc, 1.05 * sc], [0.001, 1.1 * sc]], 12, null, bx + u, yb + 2.0 - 0.0, bz + v));
  bell(0, 0, 1.45); for (const [u, v] of [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]]) bell(u, v, 0.95);
  for (const v of [-2.4, 0, 2.4]) bag.add('timber', box(bx - 3.7, yb + 3.6, bz + v - 0.18, bx + 3.7, yb + 4.0, bz + v + 0.18));                   // the beams
  for (const u of [-3.7, 3.7]) bag.add('timber', box(bx + u - 0.2, yb, bz - 2.8, bx + u + 0.2, yb + 4.0, bz + 2.8));                              // their two frames
  // ── the cornice and the dado ──
  const Dr = [rect[0] + 0.45, rect[1] + 0.45, rect[2] - 0.45, rect[3] - 0.45], dL = s - 0.9;
  bag.add(M, box(rect[0] - 0.3, y + YB + BHt, rect[1] - 0.3, rect[2] + 0.3, y + YD - 0.0, rect[3] + 0.3));                     // the belfry's cornice
  bag.add(M, box(Dr[0], y + YD, Dr[1], Dr[2], y + YC - 0.9, Dr[3]));                                                      // the dado, a cube of marble
  bag.add(M, box(rect[0] - 0.25, y + YC - 0.9, rect[1] - 0.25, rect[2] + 0.25, y + YC, rect[3] + 0.25));                  // its cornice
  faces.forEach((f, fi) => {
    const { M: FM } = faceFrame(Dr, f, y + YD), Lc = new Local(), hh = YC - 0.9 - YD, uc = dL / 2;
    Lc.box(BLUE, uc - 2.6, 0.9, -0.02, uc + 2.6, hh - 0.6, 0.05);                                                         // the field of blue
    for (let k = 0; k < 18; k++) Lc.add(GB, disc(0.07, 0, 6).rotateX(Math.PI / 2).translate(uc - 2.4 + ((k * 0.618) % 1) * 4.8, 1.1 + ((k * 0.382 + 0.1) % 1) * (hh - 2.1), 0.07));
    Lc.box(I, uc - 2.85, 0.75, -0.02, uc - 2.6, hh - 0.45, 0.14); Lc.box(I, uc + 2.6, 0.75, -0.02, uc + 2.85, hh - 0.45, 0.14);        // the frame
    Lc.box(I, uc - 2.85, 0.75, -0.02, uc + 2.85, 0.9, 0.14); Lc.box(I, uc - 2.85, hh - 0.6, -0.02, uc + 2.85, hh - 0.45, 0.14);
    if (fi % 2 === 0) {                                                                                                    // the winged lion on the east and west faces
      const lion = new Local(); lionOfStMark(lion, GB, 1.2);
      for (const list of lion.m.values()) for (const g of list) { g.translate(uc - 0.1, 1.05, 0.5); Lc.add(GB, g); }
    } else {                                                                                                               // Venetia, crowned, seated, her sword raised
      const v = human({ pose: 'seat', h: 2.6, drape: 'peplos', n: 5 });
      for (const g of [...v.stone, ...v.skin]) { g.translate(uc, 0.95, 0.3); Lc.add(GB, g); }
      Lc.add(GB, rod([uc + 0.7, 1.9, 0.5], [uc + 0.7, 3.9, 0.5], 0.04, 5)); Lc.box(GB, uc + 0.5, 2.0, 0.46, uc + 0.9, 2.08, 0.54);
    }
    Lc.emit(bag, FM);
  });
  // the four small obelisks at the corners of the dado's cornice
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const px = x + dx * (s / 2 - 0.45), pz = z + dz * (s / 2 - 0.45);
    bag.add(M, box(px - 0.3, y + YC, pz - 0.3, px + 0.3, y + YC + 0.5, pz + 0.3));
    bag.add(M, frustum([px - 0.22, pz - 0.22, px + 0.22, pz + 0.22], y + YC + 0.5, y + YC + 2.3, 0.17, 0.17, 0.17, 0.17));
    bag.add(GB, lathe([[0.1, 0], [0.001, 0.28]], 6, null, px, y + YC + 2.3, pz));
  }
  // ── the pyramid of green copper, the ball and the angel ──
  const pb = s / 2 - 1.1, YT = y + h - 4.6 - 0.9;
  bag.add('tile_green', frustum([x - pb, z - pb, x + pb, z + pb], y + YP, YT, pb - 0.12, pb - 0.12, pb - 0.12, pb - 0.12));
  bag.add(B, box(x - pb - 0.1, y + YC, z - pb - 0.1, x + pb + 0.1, y + YP, z + pb + 0.1));
  bag.add(GB, lathe([[0.001, 0], [0.42, 0.1], [0.5, 0.45], [0.42, 0.8], [0.001, 0.9]], 10, null, x, YT, z));                      // the ball
  const ay = YT + 0.9, W = (g) => g.translate(x, ay, z);
  bag.add(GB, W(lathe([[0.3, 0], [0.34, 0.5], [0.24, 1.5], [0.17, 2.2], [0.001, 2.25]], 10)));                                  // the robe
  bag.add(GB, W(lathe([[0.001, 2.1], [0.16, 2.25], [0.17, 2.5], [0.12, 2.7], [0.001, 2.78]], 8)));                              // the head
  for (const sg of [-1, 1]) {                                                                                           // the wings, swept up and back from the shoulders
    const wing = ext([[0, 0], [0.5, 0.35], [1.25, 1.35], [1.5, 2.1], [1.0, 1.9], [0.95, 2.35], [0.55, 1.95], [0.5, 2.3], [0.15, 1.6], [0, 0.9]].map(([a, b]) => [a * sg, b]), [], -0.03, 0.03);
    wing.rotateY(sg * 0.35); wing.translate(x + 0.02 * sg, ay + 1.25, z - 0.1); bag.add(GB, wing);
  }
  bag.add(GB, rod([x - 0.15, ay + 1.9, z + 0.05], [x - 0.65, ay + 2.5, z + 0.35], 0.06, 5));                                    // an arm raised
  bag.add(GB, rod([x + 0.15, ay + 1.9, z + 0.05], [x + 0.5, ay + 1.5, z + 0.5], 0.06, 5));
}
