// The fronts of the houses of Venice, varied by a rule (docs/settlements/venice.md §5d). The shared `house_med` builds each house with its
// windows at the centres of its bays; here, in the same frame, a front of one of four kinds is laid over its middle bay: the Gothic polifora
// (a stone panel with a triple light under an ogee arch, a quatrefoil over it) on the wide houses; a pilastered stone doorway; a liagò (the
// timber loggia of glazed windows on brackets, under a pent of tile) on the top storey; chain quoins of cut stone up the corners.
// ven_facade { items: [{ rect, front ('n' | 's'), y, seed, storeys, kinds: [...] }] } — placed by settlement/venice/fronts.js.
import { box, lathe } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, headPts } from '../renaissance/face.js';

const I = 'marble', O = 'opening', W = 'wood_dark';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The house_med's storey height and tower flag for a seed (the same draws in the same order). */
export function houseFrame(seed, rect) {
  const r = rng(seed || 1), tower = r() < 0.01 && rect[2] - rect[0] < 11 && rect[3] - rect[1] < 11, st = 3.3 + r() * 0.5;
  return { tower, st };
}

export function venFacade(el, { bag }) {
  for (const o of el.items) {
    const { tower, st } = houseFrame(o.seed, o.rect);
    if (tower) continue;
    const [x0, z0, x1, z1] = o.rect, L = x1 - x0, n = o.storeys, bays = Math.max(1, Math.round(L / 2.5)), uc = (Math.floor(bays / 2) + 0.5) * L / bays;
    const { M: FM } = faceFrame(o.rect, o.front, o.y), Lc = new Local();
    // faceFrame's u runs from the left seen from outside; the house's bays run from x0, so flip for a south front's mirror
    const U = (u) => (o.front === 's' ? u : L - u), wh = Math.min(st - 1.1, 1.955), v1 = (s) => s * st + (st - wh) * 0.45;   // the window's foot on storey s
    const c = U(uc);
    for (const kind of o.kinds) {
      if (kind === 'polifora') {
        const y0 = v1(1) - 0.04, y1 = v1(1) + wh + 0.5, hw = 1.1;
        Lc.box(I, c - hw, y0, 0, c + hw, y1, 0.2);                                                 // the panel of stone over the house's window
        Lc.box(I, c - hw - 0.1, y0 - 0.1, 0, c + hw + 0.1, y0, 0.3);                                // its sill
        for (let k = -1; k <= 1; k++) {                                                              // the triple light: three pointed lights
          const u = c + k * 0.62, head = archOutline(u, y0 + 0.15, 0.46, y0 + 1.05, 'pointed', 6);
          Lc.add(O, ext(head, [], 0.2, 0.23));
          Lc.add(W, ext([[u - 0.012, y0 + 0.15], [u + 0.012, y0 + 0.15], [u + 0.012, y0 + 1.7], [u - 0.012, y0 + 1.7]], [], 0.23, 0.26));
        }
        for (const k of [-0.31, 0.31]) Lc.add('proconnesian', lathe([[0.06, 0], [0.045, 0.1], [0.045, 0.95], [0.065, 1.0]], 6, null, c + k, y0 + 0.15, 0.27));   // the colonnettes between the lights
        Lc.add(I, ext(headPts(c, y0 + 1.05, 1.9, 'ogee', 8).concat(headPts(c, y0 + 1.05, 1.6, 'ogee', 8).reverse()), [], 0.2, 0.31));                  // the ogee arch over them
        const qy = y0 + 1.05 + 0.5 * 1.9 * 0.55 + 0.45;
        Lc.add(I, ext([[c - 0.22, qy], [c, qy + 0.22], [c + 0.22, qy], [c, qy - 0.22]], [], 0.2, 0.28));                                          // the quatrefoil's lozenge
        for (const [a, b] of [[0, 0.22], [0, -0.22], [0.22, 0], [-0.22, 0]]) Lc.add(O, ext([[c + a - 0.09, qy + b], [c + a, qy + b + 0.09], [c + a + 0.09, qy + b], [c + a, qy + b - 0.09]], [], 0.28, 0.3));
      } else if (kind === 'portal') {
        for (const sg of [-1, 1]) {                                                                  // pilasters with a base and a capital
          const u = c + sg * 0.9;
          Lc.box(I, u - 0.13, 0.5, 0, u + 0.13, 3.3, 0.2); Lc.box(I, u - 0.17, 0.5, 0, u + 0.17, 0.75, 0.25); Lc.box(I, u - 0.17, 3.15, 0, u + 0.17, 3.38, 0.26);
        }
        Lc.box(I, c - 1.1, 3.38, 0, c + 1.1, 3.62, 0.3);                                             // the lintel
        Lc.box('limestone', c - 0.12, 3.3, 0.3, c + 0.12, 3.38, 0.34);                               // the keystone
      } else if (kind === 'quoins') {
        for (const sg of [0, 1]) for (let k = 0, v = 0.8; v < n * st - 0.9; k++, v += 0.62) {
          const q = k % 2 ? 0.45 : 0.8, u0 = sg ? L - q : 0, u1 = sg ? L : q;
          Lc.box('limestone', u0, v, 0, u1, v + 0.5, 0.05);
        }
      } else if (kind === 'liago') {
        const s = n - 1, y0 = v1(s) - 0.12, hw = 1.35, dp = 0.8, top = y0 + 0.12 + wh + 0.2;
        Lc.box(W, c - hw, y0, 0, c + hw, y0 + 0.12, dp);                                              // the floor of the loggia
        for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) Lc.box(W, c + sg * (hw - 0.2) - 0.06, y0 - 0.4 + k * 0.1, 0, c + sg * (hw - 0.2) + 0.06, y0 - 0.3 + k * 0.1, dp * (k + 1) / 3);   // its brackets
        for (const sg of [-1, 1]) Lc.box(W, c + sg * hw - 0.05, y0 + 0.12, 0, c + sg * hw + 0.05, top, dp);                                              // the side walls' posts
        Lc.box(W, c - hw, y0 + 0.12, dp - 0.04, c + hw, y0 + 0.62, dp + 0.02);                         // the sill-high panel in front
        Lc.box(O, c - hw + 0.08, y0 + 0.62, dp - 0.02, c + hw - 0.08, top - 0.1, dp);                  // the glazing
        for (let u = c - hw + 0.08 + 0.45; u < c + hw - 0.1; u += 0.45) Lc.box(W, u - 0.025, y0 + 0.62, dp, u + 0.025, top - 0.1, dp + 0.04);          // its bars
        Lc.box(W, c - hw, top - 0.1, 0, c + hw, top, dp + 0.05);
        { const len = dp + 0.3, g = box(c - hw - 0.12, -0.03, 0, c + hw + 0.12, 0.03, len); g.rotateX(Math.atan(0.5 / len)); g.translate(0, top + 0.5, 0); Lc.add('roof_tile', g); }   // the pent roof of tile sloping to the front
      }
    }
    // the faceFrame's u starts at the left seen from outside: for a south front that is x0 as the bays count; for a north front the mirror, handled by U()
    Lc.emit(bag, FM);
  }
}
