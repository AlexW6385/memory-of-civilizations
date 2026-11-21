// Persepolis about 480 BC — wear on what is entered (docs/settlements/persepolis.md §23.5): the hollow worn in the door-step of a house that is walked into,
// by the feet that cross it; (soot over the lamp niches and behind the hearths was tried and left out: it cost two draws at the arrival). Wraps the style's `persian_house` from here
// (the style file stays as it was); pure functions of the element's own numbers. Nothing is written anywhere (§23.5: Old Persian cuneiform is not set).
import '../../styles/achaemenid/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseMake, houseDoor, frameOf } from '../../styles/achaemenid/houses-data.js';
import { hashAt } from './nightlight.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.achaemenid.elements.persian_house;
  STYLES.achaemenid.elements.persian_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (el.simple || !ctx?.bag) return r;
    const m = houseMake(el), { P, R, D } = frameOf(m.rect, m.front), d = houseDoor(el), { bag } = ctx, y0 = el.y ?? 0, t = 0.55;
    const put = (mat, a0, a1, b0, b1, ya, yb) => { const q = R(a0, a1, b0, b1); bag.add(mat, box(q[0], y0 + ya, q[1], q[2], y0 + yb, q[3])); };
    if (m.enter) {
      // the doorstep (its top 0.14 above the ground, 0.6 m out): worn darker in the middle where the feet come and go, a second hollow nearer the wall
      const q = hashAt(m.rect[0], m.rect[1], 73), q2 = hashAt(m.rect[0], m.rect[1], 74);   // (no two patches alike: a shape repeated twelve times would be an instanced draw of its own)
      put('plaster_damp', d.a - 0.5 - 0.1 * q, d.a + 0.5 + 0.1 * q2, -0.5 + 0.05 * q2, -0.1 - 0.04 * q, 0.14, 0.1425);
      put('plaster_damp', d.a - 0.3 - 0.06 * q2, d.a + 0.3 + 0.06 * q, -0.38, -0.16 - 0.03 * q2, 0.1425, 0.145);
    }
    return r;
  };
}
registerWear();
