// The painted walls of a mastaba's chapel (docs/settlements/giza.md §4.4, §12): the mud-brick walls plastered white; on
// the north wall a register of offering bearers walking west toward the stela, on the south wall the owner seated before
// the table of loaves with the columns of the offering list, a blue band under the registers and a frieze under the roof.
// Painted relief a few millimetres proud, as the slab stelae are.

import { box } from '../../core/geom.js';

/** x0..x1 the chapel's inner length (west end at x0), zN and zS the inner faces of its north and south walls, H the height. */
export function paintChapel(bag, x0, x1, zN, zS, H, rand) {
  const t = 0.02, y0 = 1.0;
  bag.add('plaster_white', box(x0, 0.04, zN, x1, H - 0.1, zN + t));
  bag.add('plaster_white', box(x0, 0.04, zS - t, x1, H - 0.1, zS));
  // north wall (faces south): z from zN + t; south wall (faces north): z to zS - t
  const N = (xa, ya, xb, yb, mat, d = 0.014) => bag.add(mat, box(Math.min(xa, xb), ya, zN + t, Math.max(xa, xb), yb, zN + t + d));
  const S = (xa, ya, xb, yb, mat, d = 0.014) => bag.add(mat, box(Math.min(xa, xb), ya, zS - t - d, Math.max(xa, xb), yb, zS - t));
  for (const F of [N, S]) {
    F(x0 + 0.05, y0 - 0.06, x1 - 0.05, y0 - 0.02, 'egyptian_blue');                      // the ground line under the register
    F(x0 + 0.05, H - 0.32, x1 - 0.05, H - 0.26, 'egyptian_blue');                        // the band under the roof
    for (let x = x0 + 0.1; x < x1 - 0.12; x += 0.14) F(x, H - 0.25, x + 0.07, H - 0.16, 'paint_ochre');   // the frieze of knots
  }
  // a bearer on the north wall, walking west (toward lower x): the far leg and the near, the kilt, the body, head and wig,
  // one arm hanging, the other bringing a loaf, a jar or a fowl
  const bearer = (x, k) => {
    N(x - 0.04, y0, x - 0.0, y0 + 0.4, 'paint_robe', 0.016); N(x + 0.02, y0, x + 0.06, y0 + 0.4, 'paint_robe', 0.018);
    N(x - 0.075, y0 + 0.38, x + 0.075, y0 + 0.52, 'plaster_white', 0.02);
    N(x - 0.07, y0 + 0.5, x + 0.07, y0 + 0.78, 'paint_robe', 0.018);
    N(x - 0.05, y0 + 0.78, x + 0.04, y0 + 0.9, 'paint_robe', 0.02); N(x - 0.02, y0 + 0.86, x + 0.07, y0 + 0.95, 'lacquer_black', 0.024);
    N(x - 0.24, y0 + 0.6, x - 0.04, y0 + 0.64, 'paint_robe', 0.024);
    if (k % 3 === 0) N(x - 0.3, y0 + 0.64, x - 0.18, y0 + 0.7, 'limewash_yellow', 0.028);
    else if (k % 3 === 1) N(x - 0.3, y0 + 0.64, x - 0.24, y0 + 0.82, 'terracotta', 0.028);
    else N(x - 0.3, y0 + 0.64, x - 0.17, y0 + 0.72, 'paint_ochre', 0.028);
  };
  const n = Math.max(2, Math.floor((x1 - x0 - 0.5) / 0.55));
  for (let i = 0; i < n; i++) if (rand() > 0.12) bearer(x1 - 0.45 - i * 0.55, i);
  // the owner on the south wall, seated before the table, facing east (toward the door): his seat, the kilt, the body, the arm
  // reaching out, the wig; the table of half loaves; the columns of the list above them
  const ox = x0 + 0.65;
  S(ox - 0.15, y0 + 0.02, ox + 0.18, y0 + 0.24, 'paint_ochre', 0.02);                    // the stool with its lion's legs
  S(ox - 0.12, y0 + 0.24, ox + 0.12, y0 + 0.36, 'plaster_white', 0.024);
  S(ox - 0.1, y0 + 0.36, ox + 0.08, y0 + 0.74, 'paint_robe', 0.022);
  S(ox - 0.07, y0 + 0.74, ox + 0.08, y0 + 0.92, 'paint_robe', 0.024); S(ox - 0.09, y0 + 0.84, ox + 0.06, y0 + 0.98, 'lacquer_black', 0.028);
  S(ox + 0.08, y0 + 0.55, ox + 0.5, y0 + 0.59, 'paint_robe', 0.026);
  S(ox + 0.52, y0 + 0.0, ox + 0.56, y0 + 0.5, 'paint_ochre', 0.02); S(ox + 0.42, y0 + 0.5, ox + 0.7, y0 + 0.54, 'paint_ochre', 0.022);
  for (let k = 0; k < 5; k++) S(ox + 0.44 + k * 0.055, y0 + 0.54, ox + 0.49 + k * 0.055, y0 + 0.7, 'limewash_yellow', 0.026);
  for (let k = 0; k < 6; k++) S(ox + 0.12 + k * 0.1, y0 + 0.76, ox + 0.18 + k * 0.1, y0 + 1.15, k % 2 ? 'fresco_green' : 'egyptian_blue', 0.016);
}
