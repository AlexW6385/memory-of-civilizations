// Qufu — wear on what is entered (docs/settlements/lu-qufu.md §18): the dark worn patch of the street apron before each shop's doorway where the feet cross it, the doorway's
// threshold worn paler-and-darker in the middle, and the polished, darkened ends of the counter either side of the doorway where hands rest and goods are slid. Wraps the style's
// `lu_shop_row` from here (the style files stay as they were); pure functions of the element's own numbers. Nothing is written (no new inscription: see the dossier).
import '../../styles/lu/index.js';
import './nightlight.js';
import { STYLES } from '../../core/build.js';
import { lotFrame } from '../../styles/lu/kit.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.lu?.elements, row = E?.lu_shop_row;
  if (!row) return;
  E.lu_shop_row = function worn(el, ctx) {
    const r = row.call(this, el, ctx);
    if (el.simple) return r;
    const F = lotFrame(ctx, el.rect, el.front), n = el.n ?? Math.max(1, Math.round(F.W / 5.6)), sw = F.W / n;
    const put = (mat, u0, u1, v0, v1, y0, y1) => F.b(mat, u0, y0, v0, u1, y1, v1, false);
    for (let i = 0; i < n; i++) {
      const g = i * sw + sw * (i % 2 ? 0.34 : 0.66);
      // the apron's brick (top 0.18) before the doorway: the way worn, a smaller darker patch in its middle
      put('plaster_damp', g - 0.75, g + 0.75, -1.05, -0.05, 0.18 + 0.001, 0.18 + 0.004);
      put('plaster_damp', g - 0.4, g + 0.4, -0.7, -0.15, 0.18 + 0.004, 0.18 + 0.007);
      // the counter's two ends at the doorway (top 1.0): polished and darkened
      put('plaster_damp', g - 0.75 - 0.2, g - 0.75, 0.12, 0.68, 1.0 + 0.001, 1.0 + 0.004);
      put('plaster_damp', g + 0.75, g + 0.75 + 0.2, 0.12, 0.68, 1.0 + 0.001, 1.0 + 0.004);
    }
    return r;
  };
}
registerWear();
