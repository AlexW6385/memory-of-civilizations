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

/** The northern niche of a mastaba's east face { c, a, b, h, cased } (docs/settlements/giza.md §17): the two-niche offering place
 *  of the Giza tombs — a false door of limestone at 2.6 m from the north end (the slab stela and the chapel are at the south end): the
 *  frame in two orders, the dark door with the rolled mat over it, the lintel with its roll, above it the panel with the owner
 *  at the table of offerings and the columns of the list in blue and green. */
export function northernNiche(bag, { c, a, b, h, cased }) {
  const [cx, cz] = c, X = cx + a + 0.06 * (cased ? 1 : 0.4), zc = cz - b + 2.6, y0 = 0.15;
  void h;
  const S = (mat, z0, z1, ya, yb, d0, d1) => bag.add(mat, box(X + d0, y0 + ya, zc + z0, X + d1, y0 + yb, zc + z1));
  S('limestone_carved', -0.72, 0.72, 0, 2.35, -0.55, 0);                        // the slab, sunk into the battered face
  for (const k of [-1, 1]) {
    S('tura_limestone', Math.min(k * 0.55, k * 0.72), Math.max(k * 0.55, k * 0.72), 0, 2.2, 0, 0.09);      // the outer jambs
    S('tura_limestone', Math.min(k * 0.36, k * 0.55), Math.max(k * 0.36, k * 0.55), 0, 1.5, 0, 0.05);      // the inner jambs
    S('egyptian_blue', k * 0.635 - 0.035, k * 0.635 + 0.035, 0.2, 2.05, 0.09, 0.1);                         // the offering formula down the jamb
  }
  S('lacquer_black', -0.36, 0.36, 0, 1.4, 0, 0.03);                                                          // the door, recessed in the dark
  S('limewash_yellow', -0.36, 0.36, 1.43, 1.57, 0.03, 0.13);   // the rolled mat
  S('tura_limestone', -0.72, 0.72, 2.2, 2.35, 0, 0.12);                                                      // the lintel
  S('tura_limestone', -0.74, 0.74, 2.35, 2.48, 0.0, 0.15);   // the roll
  // the panel over the door: the owner seated at the table of loaves, the columns of the offering list
  S('plaster_white', -0.36, 0.36, 1.58, 2.15, 0.03, 0.05);
  const R = (mat, z0, z1, ya, yb, d = 0.07) => S(mat, z0, z1, ya, yb, 0.05, d);
  R('paint_robe', 0.2, 0.3, 1.76, 2.0); R('paint_robe', 0.22, 0.29, 2.0, 2.1); R('lacquer_black', 0.2, 0.3, 2.06, 2.12, 0.075);   // the owner, the head, the wig
  R('plaster_white', 0.17, 0.32, 1.7, 1.78); R('timber', 0.18, 0.31, 1.62, 1.7); R('paint_robe', 0.05, 0.2, 1.88, 1.93);            // the kilt, the seat, the arm reaching out
  R('paint_ochre', -0.04, 0.0, 1.66, 1.88); R('paint_ochre', -0.1, 0.06, 1.88, 1.92);                                              // the table
  for (let k = 0; k < 5; k++) R('limewash_yellow', -0.1 + k * 0.032, -0.07 + k * 0.032, 1.92, 2.0 + 0.04 * Math.sin(k / 4 * Math.PI), 0.075);   // the loaves
  for (let k = 0; k < 4; k++) R(k % 2 ? 'fresco_green' : 'egyptian_blue', -0.32 + k * 0.05, -0.28 + k * 0.05, 1.66, 2.1);             // the columns
}
