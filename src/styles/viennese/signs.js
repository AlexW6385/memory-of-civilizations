// The writing of the streets (docs/settlements/vienna.md §15.4): the tram stop's enamel plate on its post, in the block capitals of lettering.js (German,
// "HALTESTELLE"; every glyph of the 3 x 5 alphabet was checked). [inferred: the plain white plate with black capitals is the usual form; no page read.]
import { box, rod } from '../../core/geom.js';
import { lettering } from './lettering.js';
import { faceFrame } from '../dutch/facade.js';

/** tram_stop: { at: [x, z], y }. */
export function tramStop(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('iron', rod([x, y, z], [x, y + 3.3, z], 0.045, 6));
  bag.add('iron', box(x - 0.08, y, z - 0.08, x + 0.08, y + 0.12, z + 0.08));
  // the plate: 1.6 x 0.36 m on a 6 cm board, lettered on both faces (it is read from the promenade and from the tracks)
  const px0 = x - 0.8, px1 = x + 0.8, v0 = 2.6;
  bag.add('plaster_white', box(px0, y + v0, z - 0.03, px1, y + v0 + 0.36, z + 0.03));
  for (const f of ['s', 'n']) {
    const F = faceFrame(f === 's' ? [px0, z - 0.01, px1, z + 0.03] : [px0, z - 0.03, px1, z + 0.01], f);
    lettering(bag, F, y, F.w / 2, v0 + 0.07, 'HALTESTELLE', 0.2, 'iron', 1.5, 0.0);
  }
  col.circle(x, z, 0.06, y, y + 3.3);
}
