// Ye — wear on what is entered (docs/settlements/wei-ye.md §19): the dark worn patch of the step before a hall's door and of the gate's stone where the feet cross, the soot of
// the lamp and the hearth over the door, the worn way before each shop's counter flap and the polished ends of the counter where hands rest. Wraps the style's `wei_house` and
// `wei_shop_row` from here (the style files stay as they were); pure functions of the element's own numbers. Nothing is written (no inscription: see the dossier).
import '../../styles/wei/index.js';
import './nightlight.js';
import { STYLES } from '../../core/build.js';
import { DOORS, doorKey, SHOPS, shopKey } from '../../styles/wei/houses.js';
import { lotFrame } from '../../styles/han/kit.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.wei?.elements;
  if (!E) return;
  const house = E.wei_house, row = E.wei_shop_row;
  if (house) E.wei_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx), D = DOORS.get(doorKey(el));
    if (!D || el.simple) return r;
    const F = lotFrame(ctx, el.rect, el.front), P = 0.3, put = (mat, u0, u1, v0, v1, y0, y1) => F.b(mat, u0, y0, v0, u1, y1, v1, false);
    // the step before the hall's door: a darker patch worn in its middle, a smaller one by the jamb (the hall's platform is 0.3 m)
    put('plaster_damp', D.du - 0.6, D.du + 0.6, D.v - 0.7, D.v - 0.05, P + 0.001, P + 0.005);
    put('plaster_damp', D.du - 0.35, D.du + 0.35, D.v - 0.5, D.v - 0.15, P + 0.005, P + 0.008);
    // the soot of the lamp and the hearth over the door, on the wall above the lintel
    put('lacquer_black', D.du - 0.55, D.du + 0.55, D.v - 0.012, D.v - 0.006, P + 2.3, P + 2.75);
    // the gate's stone (a court or tower house): worn where the feet cross it
    if (D.gateU !== undefined) put('plaster_damp', D.gateU - 0.5, D.gateU + 0.5, -0.5, -0.05, 0.14 + 0.001, 0.14 + 0.005);
    return r;
  };
  if (row) E.wei_shop_row = function worn(el, ctx) {
    const r = row.call(this, el, ctx), S = SHOPS.get(shopKey(el));
    if (!S || el.simple) return r;
    const F = lotFrame(ctx, el.rect, el.front), put = (mat, u0, u1, v0, v1, y0, y1) => F.b(mat, u0, y0, v0, u1, y1, v1, false);
    for (const s of S) {
      put('plaster_damp', s.gate - 0.8, s.gate + 0.8, -0.85, -0.05, 0.2 + 0.001, 0.2 + 0.005);              // the way worn before the flap
      const e = s.gate < s.keeper ? s.gate + 0.95 : s.gate - 1.15;                                         // the counter's end by the way in, polished and darkened by hands
      put('plaster_damp', e, e + 0.2, 0.08, 0.66, 1.05 + 0.001, 1.05 + 0.004);
    }
    return r;
  };
}
registerWear();
