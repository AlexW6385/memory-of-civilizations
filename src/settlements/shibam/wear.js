// Shibam c. 1700 — wear on what is entered (docs/settlements/shibam.md §20): the threshold of every opened ground floor worn dark and low in its middle by
// the feet and the sacks that cross it, and the same at the merchant's street door and the mosque's door (added by plan.js). Wraps the style's `tower_house`
// from here (the style file stays as it was); pure functions of the element's own numbers. Nothing is written anywhere: Arabic lettering is left out
// because no glyph of it could be checked here (§20).
import '../../styles/hadhrami/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.hadhrami.elements.tower_house;
  STYLES.hadhrami.elements.tower_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (!(el.shop || el.hall) || el.door === undefined || (el.shop?.fashion && el.shop.fashion !== 'shop')) return r;
    const hw = (el.hall ? 3.2 : 1.5) / 2, [x0, z0, x1, z1] = el.rect, n = el.front === 'n', u = el.door, o = n ? -1 : 1, zf = n ? z0 : z1;
    const put = (ua, ub, za, zb, y0, y1) => { const a = zf + o * za, b = zf + o * zb; ctx.bag.add('plaster_damp', box(ua, y0, Math.min(a, b), ub, y1, Math.max(a, b))); };
    // the rubble step of the front (0.6 m out, 0.1 high): a darker patch worn in its middle, wider where the feet come, a small one by each jamb
    put(u - hw + 0.12, u + hw - 0.12, 0.12, 0.52, 0.1, 0.104);
    put(u - hw * 0.55, u + hw * 0.55, 0.2, 0.44, 0.104, 0.107);
    void x0; void x1;
    return r;
  };
}
registerWear();
