// Giotto's Campanile, the parts the marble skin does not give (docs/settlements/florence.md §4, "The campanile"):
// the base with its two rows of reliefs (hexagons below, lozenges above: Andrea Pisano's and his workshop's
// scenes of Creation, the arts and the sacraments), the first storey's niches with their prophets, and the
// crown, a frieze of blind trefoil arches on a corbelled cornice under the terrace and its parapet.
// Each face is built in its own frame and merged per material (Florence has no mesh to spare).

import { box, lathe } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, archRise, dropBack } from './face.js';
import { human } from '../greek/sculpture.js';

const M = 'marble', G = 'verde_antico', PINK = 'marble_pink', O = 'opening';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const poly = (uc, yc, r, n, a0 = 0, ry = r) => Array.from({ length: n }, (_, i) => { const a = a0 + (i / n) * Math.PI * 2; return [uc + Math.cos(a) * r, yc + Math.sin(a) * ry]; });
const flat = (Lc, mat, pts, holes, d0, d1) => Lc.add(mat, dropBack(ext(pts, holes, d0, d1, 4)));

/** A figure in low relief: standing with a raised arm, seated at a bench, or standing with a long tool. */
function relief(Lc, mat, uc, yc, kind, sc, d0, d1) {
  const P = (list) => list.map(([u, y]) => [uc + u * sc, yc + y * sc]);
  const head = (u, y, r) => flat(Lc, mat, P(poly(u, y, r, 8)), [], d0, d1);
  if (kind === 0) {
    flat(Lc, mat, P([[-0.2, -0.5], [0.2, -0.5], [0.13, 0.08], [0.11, 0.28], [-0.11, 0.28], [-0.14, 0.08]]), [], d0, d1);
    flat(Lc, mat, P([[0.09, 0.22], [0.2, 0.2], [0.34, 0.5], [0.27, 0.54]]), [], d0, d1);
    head(0, 0.4, 0.12);
  } else if (kind === 1) {
    flat(Lc, mat, P([[-0.5, -0.5], [0.5, -0.5], [0.5, -0.36], [-0.5, -0.36]]), [], d0, d1);                    // the bench
    flat(Lc, mat, P([[-0.28, -0.36], [0.06, -0.36], [0.1, 0.02], [0.02, 0.2], [-0.16, 0.2], [-0.22, 0.0]]), [], d0, d1);
    flat(Lc, mat, P([[0.0, 0.05], [0.3, -0.12], [0.34, -0.06], [0.06, 0.15]]), [], d0, d1);                    // the arm to the work
    flat(Lc, mat, P([[0.28, -0.36], [0.4, -0.36], [0.4, -0.1], [0.28, -0.1]]), [], d0, d1);                    // the thing made
    head(-0.08, 0.32, 0.11);
  } else {
    flat(Lc, mat, P([[-0.2, -0.5], [0.12, -0.5], [0.08, 0.06], [0.07, 0.26], [-0.12, 0.26], [-0.16, 0.06]]), [], d0, d1);
    flat(Lc, mat, P([[0.32, -0.5], [0.37, -0.5], [0.37, 0.5], [0.32, 0.5]]), [], d0, d1);                      // the staff or plough-beam
    flat(Lc, mat, P([[0.08, 0.12], [0.32, 0.18], [0.32, 0.26], [0.06, 0.2]]), [], d0, d1);
    head(-0.02, 0.38, 0.11);
  }
}

/**
 * The base and first storey of one face: the plinth, two rows of reliefs, the string, the niches with prophets,
 * the roundels over them and the string at the storey's top. L the face's length; y1 the storey's top.
 */
function lower(Lc, L, y1, seed) {
  const rand = rng(seed);
  // the plinth and the cornice over the reliefs
  Lc.box(M, 0.6, 0, 0, L - 0.6, 0.95, 0.32); Lc.box(G, 0.6, 0.95, 0, L - 0.6, 1.07, 0.36); Lc.box(M, 0.6, 1.07, 0, L - 0.6, 6.55, 0.06);
  Lc.box(G, 0.6, 6.55, 0, L - 0.6, 6.7, 0.28); Lc.box(M, 0.6, 6.7, 0, L - 0.6, 7.05, 0.38);
  // the reliefs: six to a face, hexagons (the Creation and the arts) in the lower row and lozenges (planets, virtues, sacraments) above
  const n = 6, p = (L - 1.2) / n;
  for (let i = 0; i < n; i++) {
    const uc = 0.6 + (i + 0.5) * p;
    const hx = poly(uc, 2.5, 1.02, 6), hi = poly(uc, 2.5, 0.84, 6);
    flat(Lc, M, hx, [hi], 0.06, 0.2); flat(Lc, G, hi, [], 0.06, 0.1);
    relief(Lc, M, uc, 2.5, Math.floor(rand() * 3), 1.35, 0.1, 0.17);
    const dm = poly(uc, 4.95, 1.06, 4, Math.PI / 2, 1.2), di = poly(uc, 4.95, 0.86, 4, Math.PI / 2, 1.0);
    flat(Lc, M, dm, [di], 0.06, 0.2); flat(Lc, PINK, di, [], 0.06, 0.1);
    for (const [a, b] of [[0, 1.18], [1, 0], [0, -1.18], [-1, 0]]) flat(Lc, G, poly(uc + a * 1.06, 4.95 + b, 0.19, 8), [], 0.06, 0.2);   // the lobes at the points
    relief(Lc, M, uc, 4.95, Math.floor(rand() * 3), 1.05, 0.1, 0.17);
  }
  // the first storey: green strips between the panels, the niches of the prophets, the roundels over them
  for (const u of [L / 2]) Lc.box(G, u - 0.3, 7.05, 0, u + 0.3, y1 - 0.3, 0.08);
  const wn = 2.2, y0 = 8.9, hn = 4.7, ys = y0 + hn - archRise(wn, 'trefoil');
  for (const sg of [-1, 1]) {
    const uc = L / 2 + sg * 3.35;
    const open = archOutline(uc, y0, wn, ys, 'trefoil', 8), outer = archOutline(uc, y0 - 0.2, wn + 0.7, ys, 'trefoil', 8);
    flat(Lc, M, outer, [open], 0.05, 0.28); flat(Lc, G, open, [], 0.04, 0.09);
    Lc.box(M, uc - wn / 2 - 0.3, y0 - 0.5, 0.04, uc + wn / 2 + 0.3, y0, 0.62);                                  // the sill, the statue's plinth
    Lc.box(G, uc - wn / 2 - 0.3, y0 - 0.58, 0.04, uc + wn / 2 + 0.3, y0 - 0.5, 0.66);
    const f = human({ n: 5, h: 2.3, pose: rand() < 0.5 ? 'stand' : 'ease', drape: 'mantle', mirror: rand() < 0.5, lean: Math.floor(rand() * 5) - 2 });
    for (const g of [...f.stone, ...f.metal, ...(f.skin ?? [])]) { g.translate(uc, y0, 0.3); Lc.add(M, g); }
    // the roundel over the niche: a pink field in a green ring in a marble frame
    const rc = 17.0;
    flat(Lc, M, poly(uc, rc, 1.2, 12), [poly(uc, rc, 1.0, 12)], 0.05, 0.16); flat(Lc, G, poly(uc, rc, 1.0, 12), [poly(uc, rc, 0.75, 12)], 0.05, 0.1); flat(Lc, PINK, poly(uc, rc, 0.75, 12), [], 0.05, 0.09);
  }
  Lc.box(G, 0.6, y1 - 0.45, 0, L - 0.6, y1 - 0.3, 0.25); Lc.box(M, 0.6, y1 - 0.3, 0, L - 0.6, y1, 0.4);
}

/** Giotto's tower: the base and niches on each face (its first storey to y1 above y), and the crown at h; r the tower's footprint. */
export function campanileDetail(bag, r, y, h, y1 = 19.4) {
  let k = 0;
  for (const f of 'nsew') {
    const { M: FM, L } = faceFrame(r, f, y), Lc = new Local();
    Lc.noBack = true; Lc.L = L;
    lower(Lc, L, y1, 1334 + 7 * k++);
    // the crown's frieze of blind trefoil arches on its cornice, the corbels under the terrace
    const yb = h - 1.55;
    Lc.box(M, 0.6, yb - 0.25, 0, L - 0.6, yb, 0.22);
    Lc.box(M, 0.6, yb, 0, L - 0.6, h - 0.45, 0.3);
    const na = Math.floor((L - 1.2) / 1.2), pa = (L - 1.2) / na;
    for (let i = 0; i < na; i++) {
      const uc = 0.6 + (i + 0.5) * pa;
      flat(Lc, O, archOutline(uc, yb + 0.12, 0.7, yb + 0.5, 'trefoil', 6), [], 0.3, 0.32);
    }
    for (let i = 0; i <= na; i++) Lc.box(M, 0.6 + i * pa - 0.17, h - 0.8, 0.3, 0.6 + i * pa + 0.17, h, 0.62);   // the corbels
    Lc.emit(bag, FM);
  }
  // the terrace slab, the parapet round it with its green band, the coping and the finials at the corners
  const q = 0.95;
  bag.add(M, box(r[0] - q, y + h, r[1] - q, r[2] + q, y + h + 0.4, r[3] + q));
  const t = 0.28, ph = y + h + 1.4;
  for (const w of [[r[0] - q + 0.06, r[1] - q + 0.06, r[2] + q - 0.06, r[1] - q + 0.06 + t], [r[0] - q + 0.06, r[3] + q - 0.06 - t, r[2] + q - 0.06, r[3] + q - 0.06], [r[0] - q + 0.06, r[1] - q + 0.06 + t, r[0] - q + 0.06 + t, r[3] + q - 0.06 - t], [r[2] + q - 0.06 - t, r[1] - q + 0.06 + t, r[2] + q - 0.06, r[3] + q - 0.06 - t]]) {
    bag.add(M, box(w[0], y + h + 0.4, w[1], w[2], ph, w[3]));
  }
  bag.add(M, box(r[0] - q, ph, r[1] - q, r[2] + q, ph + 0.1, r[1] - q + 0.4)); bag.add(M, box(r[0] - q, ph, r[3] + q - 0.4, r[2] + q, ph + 0.1, r[3] + q));
  bag.add(M, box(r[0] - q, ph, r[1] - q + 0.4, r[0] - q + 0.4, ph + 0.1, r[3] + q - 0.4)); bag.add(M, box(r[2] + q - 0.4, ph, r[1] - q + 0.4, r[2] + q, ph + 0.1, r[3] + q - 0.4));
  for (const [cx, cz] of [[r[0] - q + 0.2, r[1] - q + 0.2], [r[2] + q - 0.2, r[1] - q + 0.2], [r[0] - q + 0.2, r[3] + q - 0.2], [r[2] + q - 0.2, r[3] + q - 0.2]]) bag.add(M, lathe([[0.32, 0], [0.32, 0.2], [0.16, 0.3], [0.16, 0.9], [0.001, 1.3]], 4, null, cx, ph + 0.1, cz));
  // a band of green panels on the parapet's faces (a thin slab proud of the wall, not a plane shared with it)
  const bw = [[r[0] - q + 0.06, r[1] - q + 0.03, r[2] + q - 0.06, r[1] - q + 0.06], [r[0] - q + 0.06, r[3] + q - 0.06, r[2] + q - 0.06, r[3] + q - 0.03]];
  for (const b of bw) bag.add(G, box(b[0] + 0.5, y + h + 0.7, b[1], b[2] - 0.5, y + h + 1.1, b[3]));
  for (const b of [[r[0] - q + 0.03, r[1] - q + 0.06, r[0] - q + 0.06, r[3] + q - 0.06], [r[2] + q - 0.06, r[1] - q + 0.06, r[2] + q - 0.03, r[3] + q - 0.06]]) bag.add(G, box(b[0], y + h + 0.7, b[1] + 0.5, b[2], y + h + 1.1, b[3] - 0.5));
}
