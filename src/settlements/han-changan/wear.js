// Han Chang'an — wear on what is entered (docs/settlements/han-changan.md §17): the dark worn patch of the doorstep of a house where the feet cross, the soot of the lamp and
// the hearth over the door, the worn way before each shop's counter flap and the polished edges of the counter where hands rest. Wraps the styles' `hanl_house` and `han_shop_row`
// from here (the style files stay as they were); pure functions of the element's own numbers. Nothing is written (no inscription here: see the dossier).
import '../../styles/han/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { DOORS, doorKey } from '../../styles/hanlodge/index.js';
import { lotFrame } from '../../styles/han/kit.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  for (const key of ['han', 'hanlodge']) {
    const E = STYLES[key]?.elements;
    if (!E) continue;
    const house = E.hanl_house, row = E.han_shop_row;
    if (house) E.hanl_house = function worn(el, ctx) {
      const r = house.call(this, el, ctx), D = DOORS.get(doorKey(el));
      if (!D || D.du === undefined || el.simple) return r;
      const F = lotFrame(ctx, el.rect, el.front), y = D.P ?? 0.3, put = (mat, u0, u1, v0, v1, y0, y1) => F.b(mat, u0, y0, v0, u1, y1, v1, false);
      // the step before the hall's door: a darker patch worn in its middle, a smaller one by the jamb
      put('plaster_damp', D.du - 0.6, D.du + 0.6, D.v0 - 0.7, D.v0 - 0.05, y + 0.001, y + 0.005);
      put('plaster_damp', D.du - 0.35, D.du + 0.35, D.v0 - 0.5, D.v0 - 0.15, y + 0.005, y + 0.008);
      // the soot of the lamp and hearth over the door, on the wall above the lintel
      put('lacquer_black', D.du - 0.55, D.du + 0.55, D.v0 - 0.012, D.v0 - 0.006, y + 2.3, y + 2.75);
      return r;
    };
    if (row) E.han_shop_row = function worn(el, ctx) {
      const r = row.call(this, el, ctx);
      if (el.simple) return r;
      const F = lotFrame(ctx, el.rect, el.front), n = el.n ?? Math.max(1, Math.round(F.W / 5.2)), sw = F.W / n;
      for (let i = 0; i < n; i++) {
        const mid = i * sw + sw / 2, put = (mat, u0, u1, v0, v1, y0, y1) => F.b(mat, u0, y0, v0, u1, y1, v1, false);
        put('plaster_damp', mid - 0.8, mid + 0.8, -0.85, -0.05, 0.2 + 0.001, 0.2 + 0.005);                     // the way worn before the flap
        put('plaster_damp', mid - 0.8, mid - 0.62, 0.08, 0.66, 1.05 + 0.001, 1.05 + 0.004);                     // the counter's ends, polished and darkened by hands
        put('plaster_damp', mid + 0.62, mid + 0.8, 0.08, 0.66, 1.05 + 0.001, 1.05 + 0.004);
      }
      return r;
    };
  }
}
registerWear();
