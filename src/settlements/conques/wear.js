// Conques about 1120 — wear and writing on what is entered (docs/settlements/conques.md §20.5): the hollow worn in the door-stone of each open house by the
// feet that cross it, the damp dark of its middle where the water drips off the wet cloaks of pilgrims, and over the hostel's door-side a stone plaque with
// PAX cut in Roman capitals (the Benedictine word of peace for the guest). Wraps the style's `maison` from here (the style file stays as it was); pure
// functions of the element's own numbers. The three letters are drawn as strokes P, A, X in capitals of the Roman form, checked stroke by stroke below.
import '../../styles/romanesque/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

/** The strokes of the capitals P, A and X on a 5-wide grid (u 0…4, y 0…6): [[u0, y0, u1, y1]…]. P: the stem, the top bar, the bowl's right side and its lower bar. A: two diagonals meeting at the top and the cross-bar. X: the two diagonals. */
export const LETTERS = {
  P: [[0, 0, 0, 6], [0, 6, 3.4, 6], [3.4, 3, 3.4, 6], [0, 3, 3.4, 3]],
  A: [[0, 0, 2, 6], [4, 0, 2, 6], [0.9, 2, 3.1, 2]],
  X: [[0, 0, 4, 6], [4, 0, 0, 6]],
};

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.romanesque.elements.maison;
  STYLES.romanesque.elements.maison = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (!el.open || el.simple) return r;
    const { bag } = ctx, [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 's' || f === 'n';
    const L = along ? x1 - x0 : z1 - z0, y = el.y, hostel = !!el.hostel;
    const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
    const put = (mat, u0, u1, v0, v1, ya, yb) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yb, Math.max(a[1], b[1]))); };
    // the door's place along the front, as the style puts it (hostel and barn-house at the middle; shops of 5.3 m or more at their second door; the rest by the seed)
    const rng = (s) => { let q = s >>> 0 || 1; return () => ((q = (Math.imul(q, 1664525) + 1013904223) >>> 0) / 4294967296); };
    const rd = rng(el.seed || 1), mir = rd() < 0.5;
    let du = null, dw = 1.05;
    if (hostel) { du = L / 2; dw = 1.9; }
    else if (el.shop) { if (L >= 5.3) du = mir ? L - 4.52 : 4.52; }
    else if (el.kind === 'grange') { du = L / 2; dw = 2.4; }
    else { const r2 = rng(el.seed || 1); r2(); du = L * (0.3 + r2() * 0.4); }
    if (du === null) return r;
    // the door-stone's top is 0.1 above the ground (0.3 out from the wall to the leaf): a worn hollow in its middle, a darker band along the sill, a second small one by the jamb
    const top = y + 0.1, w = dw / 2 - 0.05;
    put('plaster_damp', du - w, du + w, -0.28, 0.42, top, top + 0.004);
    put('plaster_damp', du - w * 0.55, du + w * 0.55, -0.2, 0.3, top + 0.004, top + 0.007);
    if (false && hostel) {   // off: invented, no source places an inscription here (docs/decisions.md)
      // PAX on a plaque of dressed stone, to the right of the door as one faces it, above the windows' row and below the string course
      const cu = du - dw / 2 - 0.75, yb = y + 2.15, W = 0.036, S = 0.05, gap = 0.1;     // stroke 3.6 cm, the grid cell 5 cm: a letter 0.2 × 0.3 m
      const wLet = 4 * S + W, total = 3 * wLet + 2 * gap;
      put('limestone_yellow', cu - total / 2 - 0.1, cu + total / 2 + 0.1, -0.03, 0.0, yb - 0.1, yb + 0.4);
      let t0 = W / 2;                                   // (u runs from the viewer's right to his left on a front seen from the lane: the letters are laid out left to right and mapped back, so they read true)
      for (const ch of 'PAX') {
        for (const [a0, b0, a1, b1] of LETTERS[ch]) {
          const n = Math.max(1, Math.round(Math.hypot((a1 - a0) * S, (b1 - b0) * S) / 0.03));
          for (let k = 0; k <= n; k++) { const t = n ? k / n : 0, px = cu + total / 2 - (t0 + (a0 + (a1 - a0) * t) * S), py = yb + (b0 + (b1 - b0) * t) * S; put('iron', px - W / 2, px + W / 2, -0.04, -0.03, py - W / 2, py + W / 2); }
        }
        t0 += wLet + gap;
      }
    }
    return r;
  };
}
registerWear();
