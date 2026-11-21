// Mohenjo-daro, c. 2500 BC — wear on what is entered (docs/settlements/mohenjo-daro.md §16.5): the step and the threshold of a door that is used, rubbed smooth and pale by
// bare feet and dust; the treads of the east stair worn along the way up; nothing is written anywhere (the script is undeciphered: no sign can be drawn correctly).
// Wraps the style's `indus_house` from here (the style's files stay as they were); pure functions of the element's own numbers.
import '../../styles/indus/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { lotFrame } from '../../styles/indus/kit.js';
import { doorU } from './layout.js';

const sink = new Proxy(function () {}, { get: () => sink, apply: () => sink });
/** The treads of a stair (core/build.js `stair`, dir 'w') worn pale along a strip of width w at z = zc: one thin box on each tread (0.004 over its top). */
function stairwear(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, n = Math.max(1, Math.round(Math.abs(el.y1 - el.y0) / (el.riser || 0.17))), zc = (z0 + z1) / 2, w = el.w ?? 3.0;
  for (let i = 1; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, a = x1 - (x1 - x0) * f1, b = x1 - (x1 - x0) * f0, top = el.y0 + (el.y1 - el.y0) * f1;
    const dz = 0.25 * Math.sin(i * 1.7);                                                           // (the way wanders a little from tread to tread)
    bag.add('mud_plaster', box(a + 0.04, top, zc - w / 2 + dz, b - 0.06, top + 0.004, zc + w / 2 + dz));
  }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.indus.elements, base = E.indus_house;
  E.md_stairwear = stairwear;
  E.indus_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (!el.open || el.simple) return r;
    const F = lotFrame(ctx, el.rect, el.front, el.y ?? 0), du = doorU({ seed: el.seed, front: el.front, rect: el.rect });
    // the door-step's pale buff top is rubbed smooth in the middle where the feet come and go, and the threshold's brick the same
    F.b('mud_plaster', du - 0.38, 0.14, -0.49, du + 0.38, 0.143, -0.31, false);
    F.b('mud_plaster', du - 0.42, 0.12, -0.27, du + 0.42, 0.123, -0.03, false);
    return r;
  };
}
registerWear();
