// A Dogon village, c. 1930 — wear on what is entered (docs/settlements/dogon.md §16.5): the earth before each opened ginna's doors is trodden bare and
// darker in its middle by the feet that cross it, with a smaller worn patch where people step up; the earth of the toguna's floor is trodden hollow
// before the seats. Wraps the style's elements from here; pure functions of the element's own numbers. The patches are of 'mud_plaster', a material
// the houses already hold (no extra draw). Nothing is written: the Dogon had no script of their own at this date, and no sign, inscription or
// tablet is invented (see the dossier).
import '../../styles/dogon/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
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
    for (const u of [1.5, 4.9]) {
      const dx = h.rect[0] + 0.45 + u, w = 0.62 + 0.12 * hv(dx, zf, 2), d = 0.9 + 0.25 * hv(dx, zf, 3);
      ctx.bag.add('mud_plaster', box(dx - w, y + 0.014, zf + 0.12, dx + w, y + 0.02, zf + 0.12 + d));           // trodden bare before the door
      ctx.bag.add('mud_plaster', box(dx - w * 0.55, y + 0.02, zf + 0.16, dx + w * 0.55, y + 0.026, zf + 0.16 + d * 0.5));   // and darker where the feet fall
    }
    // the way to the door: three narrowing patches of bare earth running out toward the lane where feet went, each on the ground under it (a stride apart)
    for (const u of [1.5, 4.9]) {
      const dx = h.rect[0] + 0.45 + u;
      for (let k = 0; k < 3; k++) {
        const z0 = zf + 1.15 + k * 0.62, cx = dx + (hv(dx, z0, 4) - 0.5) * 0.3, w = 0.48 - 0.08 * k, gy = height(cx, z0 + 0.3);
        if (Math.abs(gy - y) > 0.25) break;                                                   // not down a step in the ground
        ctx.bag.add('mud_plaster', box(cx - w, gy + 0.012, z0, cx + w, gy + 0.018, z0 + 0.5 + 0.12 * hv(cx, z0, 5)));
      }
    }
    return r;
  };
  E.dogon_landmark = ginna(E.dogon_landmark); E.dogon_house = ginna(E.dogon_house);
  const toguna = (fn) => function worn(el, ctx) {
    const r = fn.call(this, el, ctx), [cx, cz] = el.c;
    for (const [dx, dz] of [[1.8, 0.6], [2.5, 1.0], [-2.4, 1.6], [-0.9, 0.8]]) ctx.bag.add('mud_plaster', box(cx + dx - 0.5, el.y + 0.015, cz + dz - 0.4, cx + dx + 0.5, el.y + 0.021, cz + dz + 0.4));   // the earth packed hard where the men sit
    return r;
  };
  E.toguna = toguna(E.toguna);
}
registerWear();
