// A Dogon village, c. 1930 — wear on what is entered (docs/settlements/dogon.md §16.5): the earth before each opened ginna's doors is trodden bare and
// darker in its middle by the feet that cross it, with a smaller worn patch where people step up; the earth of the toguna's floor is trodden hollow
// before the seats. Wraps the style's elements from here; pure functions of the element's own numbers. The patches are of 'earth_trodden' (ragged, src/core/wearpatch.js). Nothing is written: the Dogon had no script of their own at this date, and no sign, inscription or
// tablet is invented (see the dossier).
import '../../styles/dogon/index.js';
import './nightlight.js';
import { wearPatches } from '../../core/wearpatch.js';
import { STYLES } from '../../core/build.js';
import { houseOf } from '../../styles/dogon/compound.js';
import { hv } from './furniture.js';
import { height } from './layout.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.dogon.elements;
  const ginna = (fn) => function worn(el, ctx) {
    const r = fn.call(this, el, ctx);
    const h = houseOf({ rect: el.rect, hw: el.hw ?? true }), zf = h.rect[3], y = el.y;
    // trodden earth before each door and the way out toward the lane: ragged, overlapping, fading patches (src/core/wearpatch.js), each on the ground under it
    const P = [];
    for (const u of [1.5, 4.9]) {
      const dx = h.rect[0] + 0.45 + u, w = 0.62 + 0.12 * hv(dx, zf, 2), d = 0.9 + 0.25 * hv(dx, zf, 3);
      P.push([dx, zf + 0.12 + d / 2, w * 1.05, d * 0.62, (hv(dx, zf, 6) - 0.5) * 0.4, { y, layers: 4 }]);               // before the door
      for (let k = 0; k < 3; k++) {
        const z0 = zf + 1.35 + k * 0.7, cx = dx + (hv(dx, z0, 4) - 0.5) * 0.3, w2 = 0.5 - 0.09 * k, gy = height(cx, z0 + 0.3);
        if (Math.abs(gy - y) > 0.25) break;                                                   // not down a step in the ground
        P.push([cx, z0 + 0.25, w2, 0.34 + 0.08 * hv(cx, z0, 5), (hv(cx, z0, 7) - 0.5) * 0.5, { ground: height }]);
      }
    }
    ctx.bag.add('earth_trodden', wearPatches(P, { lift: 0.005 }));
    return r;
  };
  E.dogon_landmark = ginna(E.dogon_landmark); E.dogon_house = ginna(E.dogon_house);
  const toguna = (fn) => function worn(el, ctx) {
    const r = fn.call(this, el, ctx), [cx, cz] = el.c;
    ctx.bag.add('earth_trodden', wearPatches([[1.8, 0.6], [2.5, 1.0], [-2.4, 1.6], [-0.9, 0.8]].map(([dx, dz], n) => [cx + dx, cz + dz, 0.55, 0.42, n * 1.3, { y: el.y }]), { lift: 0.005 }));   // the earth packed hard where the men sit
    return r;
  };
  E.toguna = toguna(E.toguna);
}
registerWear();
