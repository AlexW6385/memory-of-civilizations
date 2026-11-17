// The palace's street faces (docs/settlements/abbasid-baghdad.md §14): the compound wall's blind arcade, the Golden Gate's framed front
// with Samarra stucco (styles A, B, C by turns), the corner towers' mouldings. All in the palace's local frame, front to +z.

import { box, lathe } from '../../core/geom.js';
import { archBand, archPoly, stuccoPanel, polyGeo, orientedBox, merlons } from './kit.js';

// (repeated pieces of one shape become instanced draws; each of ours differs by a millimetre or a few mm of phase, so they merge into their material's mesh)
const hash = (a, b) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };
/** A saw-tooth course of baked brick, each tooth a millimetre different. */
function teeth(bag, fr, u0, u1, v, mat = 'brick_baked') {
  const n = Math.max(1, Math.floor((u1 - u0) / 0.3));
  for (let i = 0; i < n; i++) { const a = u0 + i * (u1 - u0) / n, b = a + (u1 - u0) / n, h = 0.1 + 0.003 * hash(a, v); bag.add(mat, polyGeo(fr, [[a, v], [b, v], [(a + b) / 2, v + h]], 0, 0.07)); }
}

/** A pointed blind niche with a ring of voussoirs and its dark back, on a face frame `fr`: u0, width w, base v0, height h. */
export function niche(bag, fr, u0, v0, w, h, ring = 0.28) {
  const k = hash(u0, v0); w *= 1 + 0.004 * k; h *= 1 + 0.003 * k;
  bag.add('brick_baked', polyGeo(fr, archPoly(u0, v0, w, h), 0, 0.04));
  archBand(bag, fr, u0, v0, w, h, ring, 0, 0.12, ['brick_baked', 'brick_buff']);
}

/** The south wall of the compound seen from the esplanade: pilasters and blind arches in the wall's two wings, a stucco frieze, a toothed band. */
export function wallArcade(bag, w, T, y, x0, x1) {
  const z = w + T / 2, fr = { O: [0, z], U: [1, 0], N: [0, 1] }, n = Math.max(1, Math.round((x1 - x0) / 4.0)), bay = (x1 - x0) / n;
  for (let k = 0; k <= n; k++) { const x = x0 + k * bay; bag.add('brick_buff', box(x - 0.4, y, z, x + 0.4, y + 8.1, z + 0.3 + (k % 2) * 0.001)); bag.add('brick_baked', box(x - 0.46, y, z, x + 0.46, y + 0.7, z + 0.36)); }
  for (let k = 0; k < n; k++) niche(bag, fr, x0 + k * bay + 0.75, y + 0.9, bay - 1.5, 5.2);
  bag.add('brick_baked', box(x0, y + 6.55, z, x1, y + 6.75, z + 0.14));
  stuccoPanel(bag, fr, x0 + 0.4, x1 - 0.4, y + 6.95, y + 8.0, 0.045, 'stucco', 0.32);
  bag.add('brick_baked', box(x0, y + 8.1, z, x1, y + 8.3, z + 0.18));
  teeth(bag, fr, x0, x1, y + 8.3, 'brick_baked');
}

/** The Golden Gate's front: the pishtaq of the gate-hall (frame, stucco fields, colonettes, the gilt inscription), over the arch of width 5.2, apex 7.4. */
export function goldenGateFront(bag, w, T, y) {
  const z = w + T / 2 + 0.1, fr = { O: [0, z], U: [1, 0], N: [0, 1] }, top = 12.5;
  // the frame: two piers and a lintel band proud of the face, in white plaster
  for (const sd of [-1, 1]) {
    bag.add('plaster_white', box(sd * 3.2 - 0.15, y, z, sd * 3.2 + 0.15, y + top - 0.4, z + 0.16));
    bag.add('plaster_white', box(sd * 5.3 - 0.1, y, z, sd * 5.3 + 0.1, y + top - 0.4, z + 0.16));
    for (const [i, [a, b]] of [[3.35, 5.2], [3.35, 5.2]].entries()) {
      void i;
      const u0 = sd < 0 ? -b : a, u1 = sd < 0 ? -a : b;
      stuccoPanel(bag, fr, u0, u1, y + 0.5, y + 7.6, 0.05, 'stucco', 0.55);
      stuccoPanel(bag, fr, u0, u1, y + 7.9, y + 11.0, 0.05, 'stucco', 0.8);
    }
    // an engaged colonette of baked brick either side of the arch, with base and capital
    bag.add('brick_baked', lathe([[0.2, 0], [0.16, 0.2], [0.15, 5.0], [0.19, 5.1], [0.001, 5.1]], 8, null, sd * 2.95, y, z + 0.1));
    bag.add('limestone', box(sd * 2.95 - 0.24, y, z, sd * 2.95 + 0.24, y + 0.3, z + 0.34)); bag.add('limestone', box(sd * 2.95 - 0.24, y + 4.9, z, sd * 2.95 + 0.24, y + 5.2, z + 0.34));
  }
  bag.add('plaster_white', box(-5.4, y + top - 0.4, z, 5.4, y + top - 0.1, z + 0.2));
  stuccoPanel(bag, fr, -2.7, 2.7, y + 8.7, y + 10.9, 0.05, 'stucco', 0.5);
  stuccoPanel(bag, fr, -5.2, 5.2, y + 11.1, y + 11.9, 0.05, 'stucco', 0.3);
  for (let k = 0; k < 11; k++) bag.add('gilt_bronze', box(-5.0 + k * 0.95, y + 11.5, z + 0.05, -4.5 + k * 0.95, y + 11.6, z + 0.12));   // the gilt inscription band's letters
}

/** A tower's mouldings: two string courses, slits, a corbel table under the parapet (the tower itself is a lathe of radius R to height H). */
export function towerDetail(bag, tx, tz, R, H, y, mat = 'brick_buff', { corbels = 16, slits = 6, rings = 2 } = {}) {
  const k = hash(tx, tz), ph = k * Math.PI * 2;
  for (const hh of [3.2, H - 1.2].slice(2 - rings)) bag.add(mat, lathe([[R + 0.05 + 0.004 * k, 0], [R + 0.2 + 0.004 * k, 0.05], [R + 0.2 + 0.004 * k, 0.2], [R + 0.05, 0.25]], 14, null, tx, y + hh, tz));
  const ring = (r, n, ph0, h0, h1, wd, th, mat) => { for (let j = 0; j < n; j++) { const a = ph0 + j / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), x = tx + c * r, z = tz + s * r; bag.add(mat, orientedBox([x - s * wd, z + c * wd], [x + s * wd, z - c * wd], th, y + h0, y + h1)); } };
  ring(R + 0.08, corbels, ph, H - 0.9, H, 0.16, 0.2, mat);           // the corbels, each turned to face outward
  if (slits) ring(R + 0.0, slits, ph + 0.4, 5.5, 7.5, 0.1, 0.12, 'opening');              // the slits
}
