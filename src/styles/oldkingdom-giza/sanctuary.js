// The false door of the king's mortuary temple (docs/settlements/giza.md §16): of red granite on the inner face of the
// temple's west wall, in the ambulatory beside the doorway to the pyramid's court, with the offering table before it.

import { box, lathe } from '../../core/geom.js';

/** A false door with its offering table on the west wall of a temple whose front is to the east { rect, th, h, s }: `s` metres
 *  along the wall from its south end (z1), the temple's wall `th` thick. Returns nothing; adds to bag and col. */
export function falseDoor(bag, col, { rect, th, s }) {
  const [x0, , , z1] = rect, X = x0 + th / 2, zc = z1 - s;
  const S = (mat, s0, s1, y0, y1, d0, d1) => bag.add(mat, box(X + d0, y0, zc + s0, X + d1, y1, zc + s1));
  // the body, the jambs in two orders, the architrave, the cornice of two steps
  S('granite_red', -0.95, 0.95, 0.12, 3.55, 0, 0.14);
  for (const k of [-1, 1]) {
    S('granite_red', Math.min(k * 0.62, k * 0.95), Math.max(k * 0.62, k * 0.95), 0.12, 3.55, 0.14, 0.3);
    S('granite_grey', Math.min(k * 0.42, k * 0.62), Math.max(k * 0.42, k * 0.62), 0.12, 3.1, 0.14, 0.22);
  }
  S('granite_red', -0.95, 0.95, 3.1, 3.55, 0.14, 0.3);
  S('granite_red', -1.05, 1.05, 3.55, 3.67, 0, 0.4);
  S('granite_red', -1.05, 1.05, 3.67, 3.78, 0, 0.3);
  // the recessed door in black, the rolled mat over it (a drum)
  S('granite_black', -0.42, 0.42, 0.12, 2.9, 0.14, 0.18);
  bag.add('limestone_carved', lathe([[0.001, -0.42], [0.1, -0.42], [0.1, 0.42], [0.001, 0.42]], 10).rotateX(Math.PI / 2).translate(X + 0.24, 3.0, zc));
  // the offering formula in blue down the jambs and along the architrave
  for (const k of [-1, 1]) S('egyptian_blue', k * 0.785 - 0.06, k * 0.785 + 0.06, 0.5, 3.0, 0.3, 0.315);
  S('egyptian_blue', -0.7, 0.7, 3.2, 3.4, 0.3, 0.315);
  col.rect([X, zc - 1.05, X + 0.4, zc + 1.05], 0.12, 3.8);
  // before it: a step of limestone, the round table of alabaster on its stem, five loaves, two beer jars
  S('limestone_carved', -0.9, 0.9, 0.12, 0.27, 0.45, 1.75);
  const tx = X + 1.1, ty = 0.27;
  bag.add('marble_smooth', lathe([[0.001, 0], [0.22, 0], [0.22, 0.04], [0.09, 0.08], [0.08, 0.5], [0.4, 0.54], [0.4, 0.6], [0.001, 0.6]], 14, null, tx, ty, zc));
  for (let k = 0; k < 5; k++) { const t = k * Math.PI * 2 / 5; bag.add('limewash_yellow', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.05], [0.06, 0.1], [0.001, 0.115]], 8, null, tx + Math.cos(t) * 0.2, ty + 0.6, zc + Math.sin(t) * 0.2)); }
  for (const k of [-1, 1]) bag.add('terracotta', lathe([[0.04, 0], [0.1, 0.07], [0.14, 0.28], [0.11, 0.5], [0.06, 0.58], [0.07, 0.61], [0.001, 0.61]], 10, null, tx + 0.05, 0.27, zc + k * 0.7));
  col.rect([tx - 0.42, zc - 0.42, tx + 0.42, zc + 0.42], 0.27, 0.8);
}
