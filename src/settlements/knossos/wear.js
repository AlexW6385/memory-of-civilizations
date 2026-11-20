// Knossos about 1600 BC — wear on what is entered (docs/settlements/knossos.md §20.5): the hollow worn in the door-stone of a house that is entered, by the feet that cross it,
// and the soot of the lamp on the ceiling over it. Wraps the style's `dwelling` from here (the style file stays as it was); pure functions of the element's own numbers.
// Nothing is written anywhere (Linear A is undeciphered, Linear B later: §20.5).
import '../../styles/minoan/index.js';
import '../../styles/minoan/town.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { dwellingFrame } from '../../styles/minoan/town.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.minoan.elements.dwelling;
  STYLES.minoan.elements.dwelling = function worn(el, ctx) {
    const n = ctx.lights ? ctx.lights.length : 0;
    const r = base.call(this, el, ctx);
    if (!el.enter || el.simple) return r;
    const y = el.y ?? 0, F = dwellingFrame(el), { bag } = ctx;
    const put = (mat, u0, u1, v0, v1, y0, y1) => { const a = F.P(u0, v0), b = F.P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); };
    // the door-stone (0.4 m out from the wall, its top 0.2 above the ground): a darker patch worn in its middle, wider where the feet come and go, a second small one by the jamb
    put('plaster_damp', F.du - 0.5, F.du + 0.5, 0.02, 0.36, y + 0.2, y + 0.204);
    put('plaster_damp', F.du - 0.3, F.du + 0.3, 0.08, 0.3, y + 0.204, y + 0.207);
    // the soot of each lamp of the room on the ceiling above it
    if (ctx.lights) for (const l of ctx.lights.slice(n)) if (l.at[1] - (y + 0.2) < 2.1 && l.at[1] - (y + 0.2) > 1.2) bag.add('lacquer_black', box(l.at[0] - 0.32, y + 2.684, l.at[2] - 0.32, l.at[0] + 0.32, y + 2.69, l.at[2] + 0.32));
    return r;
  };
}
registerWear();
