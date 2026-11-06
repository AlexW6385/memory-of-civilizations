// The Doge's Palace about 1500 (docs/settlements/venice.md §4a): on the Molo and the Piazzetta, the
// portico of stout columns with carved capitals under pointed arches; over it the loggia of twice
// as many slender columns, ogee arches and the band of quatrefoils pierced above them, a balustrade
// between the columns; the great wall of white Istrian stone and pink Verona marble laid in
// lozenges, pierced only by seven large pointed windows and a few oculi, the balcony window of 1404
// in the middle of the Molo front; the cresting of marble leaves along the top; on the corners the
// carved groups (Adam and Eve, the Drunkenness of Noah); the canal and the basilica sides plainer.

import { box, lathe, frustum, rod } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, headPts, wrect } from '../renaissance/face.js';
import { human, blob, limb as slimb } from '../greek/sculpture.js';

const M = 'marble', PINK = 'marble_pink', O = 'opening', I = 'limestone', L = 'lead';

/** A quatrefoil outline at (u, y) of radius r (four lobes on a square). */
function quatre(u, y, r, n = 40, rot = 0) {
  const p = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rot; const rr = r * (0.7 + 0.3 * Math.abs(Math.cos(2 * (a - rot)))) ; p.push([u + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  return p;
}
/** A capital of leaves on a column of radius r at the top y (local), centred (u, d). */
function capital(Lc, u, y, d, r, h) { Lc.add(M, lathe([[r, 0], [r * 1.05, h * 0.25], [r * 1.35, h * 0.75], [r * 1.5, h * 0.85], [r * 1.5, h]], 12, (th, j) => (j === 1 || j === 2 ? 1 + 0.12 * Math.cos(th * 6) : 1), u, y, d)); }

/** doges_palace: { rect, h, y, fronts (['s', 'w']) } */
export function dogesPalace(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, y = el.y ?? 0, h = el.h ?? 25, fronts = el.fronts ?? ['s', 'w'];
  const DP = 5.2, yL = 8.0, yU = 14.5, nG = el.arches ?? 17;
  // the core behind the portico and the loggia, the upper wall over all, the roof
  const core = [x0 + (fronts.includes('w') ? DP : 0), z0 + (fronts.includes('n') ? DP : 0), x1 - (fronts.includes('e') ? DP : 0), z1 - (fronts.includes('s') ? DP : 0)];
  bag.add(I, box(core[0], y - 0.5, core[1], core[2], y + yU, core[3])); col.rect(core, y, y + h);
  bag.add(M, box(x0, y + yU, z0, x1, y + h, z1)); col.floor(rect, y + h);
  bag.add(L, frustum([x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.6], y + h + 0.6, y + h + 6.5, 9, 9, 9, 9));
  bag.add(M, box(x0 + 0.6, y + h, z0 + 0.6, x1 - 0.6, y + h + 0.6, z1 - 0.6));
  for (const f of 'nsew') {
    const { M: FM, L: Lf } = faceFrame(rect, f, y), Lc = new Local(), open = fronts.includes(f);
    // the cornice under the cresting; the cresting of marble leaves
    Lc.box(M, -0.3, h - 0.55, -0.05, Lf + 0.3, h, 0.35);
    const nm = Math.round(Lf / 1.55), ms = Lf / nm;
    for (let k = 0; k < nm; k++) {
      const u = (k + 0.5) * ms;
      Lc.add(M, ext([[u - 0.5, 0], [u + 0.5, 0], [u + 0.5, 0.45], [u + 0.26, 0.72], [u + 0.36, 0.95], [u + 0.12, 1.05], [u, 1.75], [u - 0.12, 1.05], [u - 0.36, 0.95], [u - 0.26, 0.72], [u - 0.5, 0.45]], [], 0.0, 0.3).translate(0, h, 0));
    }
    if (!open) {
      // the plainer sides: rows of square-headed windows in the white wall, the ground storey of stone
      for (const wy of [3.0, 9.5, 17.0, 21.0]) for (let u = 3; u < Lf - 2; u += 5) Lc.add(O, ext([[u - 0.7, wy], [u + 0.7, wy], [u + 0.7, wy + 2.4], [u - 0.7, wy + 2.4]], [], -0.03, 0.01));
      Lc.emit(bag, FM);
      continue;
    }
    // ── the portico: pointed arches on stout columns with leaf capitals
    const bay = Lf / nG, wA = bay - 1.0, ysG = 4.3;
    const gHoles = []; for (let i = 0; i < nG; i++) gHoles.push(archOutline((i + 0.5) * bay, 0.05, wA, ysG, 'pointed', 8));
    Lc.add(I, ext([[0, 0], [Lf, 0], [Lf, yL - 0.4], [0, yL - 0.4]], gHoles, -1.2, 0));
    for (let i = 0; i < nG; i++) { const uc = (i + 0.5) * bay; Lc.add(M, ext(headPts(uc, ysG, wA + 0.55, 'pointed', 8).concat(headPts(uc, ysG, wA, 'pointed', 8).reverse()), [], 0, 0.22)); }
    for (let i = 0; i <= nG; i++) {
      const u = i * bay, uu = Math.min(Lf - 0.6, Math.max(0.6, u)), r = i === 0 || i === nG ? 0.72 : 0.62;
      Lc.add(I, lathe([[r + 0.2, 0], [r + 0.2, 0.35], [r, 0.5], [r * 0.95, ysG - 1.0]], 14, null, uu, 0, -0.6));
      capital(Lc, uu, ysG - 1.0, -0.6, r * 0.95, 1.0);
      Lc.box(M, uu - r * 1.45, ysG, -0.6 - r * 1.45, uu + r * 1.45, ysG + 0.18, -0.6 + r * 1.45);
    }
    Lc.box(I, -0.2, yL - 0.4, -1.4, Lf + 0.2, yL, 0.25);                                     // the floor of the loggia, its edge
    Lc.box(I, -0.02, 0, -DP, Lf + 0.02, yL - 0.4, -DP + 0.01);                              // the portico's back wall
    Lc.box(M, 0, yL - 0.9, -DP, Lf, yL - 0.4, -1.2);                                        // its ceiling
    // ── the loggia: ogee arches on slender columns, the band of quatrefoils, the balustrade
    const nL = nG * 2, bl = Lf / nL, wO = bl - 0.46, ysL = yL + 2.9;
    const lHoles = [];
    for (let i = 0; i < nL; i++) lHoles.push(archOutline((i + 0.5) * bl, yL + 0.05, wO, ysL, 'ogee', 10));
    for (let i = 1; i < nL; i++) lHoles.push(quatre(i * bl, ysL + wO * 0.65 + 1.1, Math.min(0.85, bl * 0.42), 32));
    Lc.add(M, ext([[0, yL], [Lf, yL], [Lf, yU], [0, yU]], lHoles, -0.4, 0));
    for (let i = 0; i <= nL; i++) {
      const uu = Math.min(Lf - 0.3, Math.max(0.3, i * bl));
      Lc.add(M, lathe([[0.32, 0], [0.32, 0.18], [0.25, 0.3], [0.23, ysL - yL - 0.55]], 10, null, uu, yL, -0.2));
      capital(Lc, uu, ysL - 0.55, -0.2, 0.23, 0.55);
    }
    for (let i = 0; i < nL; i++) {
      const uc = (i + 0.5) * bl;
      for (let b = -2; b <= 2; b++) Lc.add(M, lathe([[0.07, 0], [0.11, 0.25], [0.06, 0.55], [0.09, 0.75], [0.07, 0.8]], 6, null, uc + b * wO / 5.4, yL, -0.2));
      Lc.box(M, uc - wO / 2, yL + 0.8, -0.33, uc + wO / 2, yL + 0.95, -0.07);
    }
    Lc.box(M, -0.2, yU - 0.25, -0.85, Lf + 0.2, yU, 0.2);
    Lc.box(M, 0, yL, -DP, Lf, yU - 0.3, -DP + 0.01);                                        // the loggia's back wall
    // ── the upper wall: windows, the balcony, the lozenges of pink and white
    const nW = 7, wW = 2.5, wins = [];
    for (let i = 0; i < nW; i++) wins.push((i + 0.5) * Lf / nW);
    const balc = f === 's' ? 3 : -1, yw = yU + 1.6;
    const holesD = [];
    wins.forEach((uc, i) => {
      const big = i === balc, w = big ? 3.4 : wW, ys = yw + (big ? 4.6 : 3.2), top = ys + w * Math.sin(Math.PI / 3);
      Lc.add(O, ext(archOutline(uc, yw, w, ys, 'pointed', 8), [], -0.03, 0.01));
      Lc.add(M, ext(headPts(uc, ys, w + 0.7, 'pointed', 8).concat(headPts(uc, ys, w, 'pointed', 8).reverse()), [], 0, 0.14));
      for (const sg of [-1, 1]) Lc.box(M, uc + sg * w / 2, yw - 0.1, 0, uc + sg * (w / 2 + 0.35), ys, 0.14);
      Lc.box(M, uc - w / 2 - 0.5, yw - 0.3, 0, uc + w / 2 + 0.5, yw, 0.35);
      // the tracery: a mullion, two trefoil lights, a quatrefoil in the head
      Lc.add(M, rod([uc, yw, 0.06], [uc, ys + 0.2, 0.06], 0.09, 6));
      Lc.add(M, ext(archOutline(uc, ys - 0.35, w, ys, 'pointed', 8), [archOutline(uc - w / 4, ys - 0.3, w / 2 - 0.2, ys, 'trefoil', 6), archOutline(uc + w / 4, ys - 0.3, w / 2 - 0.2, ys, 'trefoil', 6), quatre(uc, ys + w * 0.5, w * 0.18, 24)], 0.0, 0.08));
      holesD.push([uc - w / 2 - 0.5, yw - 0.35, uc + w / 2 + 0.5, top + 0.45]);
      if (big) {
        // the balcony on its brackets, its balustrade, the pinnacles at the sides, the crown with Justice
        Lc.box(M, uc - 3.2, yw - 0.35, 0, uc + 3.2, yw, 1.6);
        for (const sg of [-1, 1]) for (const k of [0.6, 2.4]) Lc.box(M, uc + sg * k - 0.15, yw - 1.2, 0, uc + sg * k + 0.15, yw - 0.35, 1.4);
        for (let b = -11; b <= 11; b++) Lc.add(M, lathe([[0.07, 0], [0.11, 0.3], [0.06, 0.7], [0.09, 0.9]], 6, null, uc + b * 0.27, yw, 1.4));
        Lc.box(M, uc - 3.2, yw + 0.9, 1.25, uc + 3.2, yw + 1.05, 1.6);
        for (const sg of [-1, 1]) { Lc.box(M, uc + sg * 2.6 - 0.35, yw, 0, uc + sg * 2.6 + 0.35, top + 1.2, 0.6); Lc.add(M, lathe([[0.42, 0], [0.001, 2.2]], 4, null, uc + sg * 2.6, top + 1.2, 0.3)); }
        Lc.add(M, ext([[uc - w / 2 - 0.5, top], [uc + w / 2 + 0.5, top], [uc + 0.3, top + 2.4], [uc, top + 3.0], [uc - 0.3, top + 2.4]], [], 0, 0.3));
        const fig = human({ pose: 'stand', h: 2.0, drape: 'peplos', arms: { r: [[0.15, 0.62, 0.05], [0.16, 0.95, 0.05]], l: [[-0.15, 0.62, 0.05], [-0.17, 0.55, 0.15]] } });
        for (const g of fig.stone) { g.translate(uc, top + 3.0, 0.3); Lc.add(M, g); }
        Lc.add(M, rod([uc + 0.32, top + 4.9, 0.4], [uc + 0.32, top + 6.0, 0.4], 0.04, 4));    // her sword
        holesD.push([uc - 3.4, yw - 1.3, uc + 3.4, top + 3.2]);
      }
    });
    for (let i = 0; i + 1 < nW; i++) { if (f === 's' && (i === 2 || i === 3)) continue; const uc = (i + 1) * Lf / nW, oy = h - 3.4; const ring = []; for (let k = 0; k < 16; k++) { const a = -k / 16 * Math.PI * 2; ring.push([uc + Math.cos(a) * 0.55, oy + Math.sin(a) * 0.55]); } Lc.add(O, ext(ring, [], -0.03, 0.01)); const outer = ring.map(([a, b]) => [uc + (a - uc) * 1.4, oy + (b - oy) * 1.4]).reverse(); Lc.add(M, ext(outer, [ring], 0, 0.1)); holesD.push([uc - 0.8, oy - 0.8, uc + 0.8, oy + 0.8]); }
    // the lozenges: a lattice of pink rhombi over the white, kept off the windows
    const dw = 1.5, dh = 2.0, rim = 0.22;
    for (let row = 0; yU + 0.6 + (row + 1) * dh / 2 < h - 0.7; row++) for (let k = -1; k * dw < Lf + dw; k++) {
      const cu = k * dw + (row % 2 ? dw / 2 : 0), cy = yU + 0.6 + dh / 2 + row * dh / 2;
      if (cu - dw / 2 < 0.05 || cu + dw / 2 > Lf - 0.05 || cy + dh / 2 > h - 0.6) continue;
      if (holesD.some(([a, b, c, d]) => cu + dw * 0.3 > a && cu - dw * 0.3 < c && cy + dh * 0.3 > b && cy - dh * 0.3 < d)) continue;   // the tips may pass behind a frame
      const o = [[cu, cy - dh / 2], [cu + dw / 2, cy], [cu, cy + dh / 2], [cu - dw / 2, cy]], k2 = 1 - 2 * rim / dw;
      Lc.add(PINK, ext(o, [o.map(([a, b]) => [cu + (a - cu) * k2, cy + (b - cy) * k2])], -0.01, 0.025));
    }
    Lc.emit(bag, FM);
    // the columns of the portico are obstacles; the portico floor is the ground
    for (let i = 0; i <= nG; i++) { const uu = Math.min(Lf - 0.6, Math.max(0.6, i * bay)), r = wrect(FM, uu - 0.7, -1.3, uu + 0.7, 0.1); col.rect(r, y, y + yL); }
  }
  // the carved groups on the corners of the Molo front: Adam and Eve with the tree (south-west), Noah under the vine (south-east)
  if (fronts.includes('s')) {
    const cg = (cx, cz, dx, dz, kind) => {
      // built facing +z (out along the corner's diagonal), the tree on the corner, a figure either side
      const Lc = new Local(), yb = y + 4.3 + 0.18;
      Lc.add(M, rod([0, 0, 0], [0, 2.3, 0], 0.13, 6)); Lc.add(M, blob([0, 2.5, 0], 0.55, [1, 0.7, 1], 7));
      Lc.add(M, slimb([0, 1.9, 0], [0.4, 2.3, 0.1], 0.06, 0.04, 5)); Lc.add(M, slimb([0, 2.0, 0], [-0.4, 2.3, -0.1], 0.06, 0.04, 5));
      const figs = kind === 'adam'
        ? [human({ pose: 'ease', h: 1.75, drape: 'nude' }), human({ pose: 'ease', h: 1.65, drape: 'nude', mirror: true, arms: { r: [[0.15, 0.68, 0.05], [0.1, 0.83, 0.12]] } })]
        : [human({ pose: 'ease', h: 1.75, drape: 'mantle', lean: 8, arms: { r: [[0.16, 0.68, 0.05], [0.18, 0.82, 0.14]] } }), human({ pose: 'stand', h: 1.5, drape: 'chiton', mirror: true })];
      figs.forEach((fg, i) => { const sg = i ? 1 : -1; for (const g of fg.stone) { g.rotateY(-sg * 0.35); g.translate(sg * 0.6, 0, 0); Lc.add(M, g); } });
      for (const list of Lc.m.values()) for (const g of list) { g.rotateY(Math.atan2(dx, dz)); g.translate(cx, yb, cz); }
      Lc.emit(bag);
    };
    cg(x0 + 0.75, z1 - 0.75, -1, 1, 'adam');
    cg(x1 - 0.75, z1 - 0.75, 1, 1, 'noah');
  }
}
