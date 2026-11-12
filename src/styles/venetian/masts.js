// The three masts before San Marco (docs/settlements/venice.md §3): tall timber masts on stepped stone bases, a gilt finial, a yard with the
// banner of the Republic (St Mark's gilt lion on red) hung from it — in Gentile Bellini's Procession of the Relic (1496) the masts stand
// before the basilica with the banners of the three kingdoms (Cyprus, Candia, the Morea) hung on feast days; one banner here, red with a gilt
// field for the lion [stated: Bellini's painting; inferred: the dimensions].

import { box, lathe, clothBox, addCloth } from '../../core/geom.js';

/** pennone: { at: [x, z], y, h (the mast's height), rot, cloth } — a banner mast on its base. */
export function pennone(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 20, rot = el.rot ?? 0, c = el.cloth ?? 'cloth_red';
  // the base: three steps of stone and a turned plinth
  for (const [s, hh, yy] of [[1.5, 0.22, 0], [1.2, 0.22, 0.22], [0.9, 0.26, 0.44]]) bag.add('limestone', box(x - s, y + yy, z - s, x + s, y + yy + hh, z + s));
  bag.add('limestone', lathe([[0.5, 0], [0.44, 0.12], [0.36, 0.5], [0.4, 0.62], [0.3, 0.72], [0.001, 0.72]], 12, null, x, y + 0.7, z));
  // the mast, tapering, banded with iron where the pieces are scarfed, the truck and gilt ball at its head
  bag.add('timber', lathe([[0.2, 0], [0.17, h * 0.4], [0.12, h * 0.8], [0.08, h]], 8, null, x, y + 1.42, z));
  for (const f of [0.28, 0.55, 0.8]) bag.add('iron', lathe([[0.215 - 0.1 * f, 0], [0.215 - 0.1 * f, 0.1], [0.001, 0.1]], 8, null, x, y + 1.42 + h * f, z));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.06], [0.13, 0.2], [0.08, 0.3], [0.001, 0.34]], 8, null, x, y + 1.42 + h, z));
  // the yard across the mast under the head, the banner hung from it, the lion's field gilt
  const yy = y + 1.42 + h - 1.0, L = 2.6;
  const g = box(-L / 2, 0, -0.04, L / 2, 0.08, 0.04); g.rotateY(-rot); g.translate(x, yy, z); bag.add('timber', g);
  const w = clothBox(-L / 2 + 0.1, -2.6, -0.012, L / 2 - 0.1, 0, 0.012); w.rotateY(-rot); w.translate(x, yy, z); addCloth(bag, c, w, yy);
  const f = clothBox(-0.5, -1.7, -0.016, 0.5, -0.8, 0.016); f.rotateY(-rot); f.translate(x, yy, z); addCloth(bag, 'cloth_ochre', f, yy);
  col?.circle(x, z, 0.9, y, y + 2);
}
