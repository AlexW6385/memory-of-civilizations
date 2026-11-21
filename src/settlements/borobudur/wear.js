// Sailendra Java (Borobudur), c. 825 — wear on what is walked (docs/settlements/borobudur.md §20.5): the bare trodden earth where the feet of a household come down from the
// stair to the yard, and before each stall's counter where its buyers stand. The wet tropics leave no dust: wet feet on bare ground make earth, the grass gone. Wraps the
// style's `rumah` and `warung` from here (the style file stays as it was); the patches are flat slabs of the style's own `mudbrick`, big enough not to be fine pieces (no new
// draw), their edges broken by the hash of their own place. Nothing is written anywhere: no inscription could be set down in Old Javanese or Sanskrit here with every
// letter verified, so the monument's and the shops' boards stay plain (§20.5).
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { rumahPlace } from '../../styles/javanese/index.js';
import { hashAt } from './nightlight.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.javanese.elements, house = E.rumah, stall = E.warung;
  E.rumah = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (el.kind === 'lumbung' || el.simple) return r;
    const { su, D, run, P } = rumahPlace(el), a = P(su - 0.95, D / 2 + run + 0.1), b = P(su + 0.95, D / 2 + run + 1.5), h = hashAt(a[0], a[1], 41);
    const x0 = Math.min(a[0], b[0]) - 0.2 * h, x1 = Math.max(a[0], b[0]) + 0.2 * (1 - h), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]) + 0.3 * h;
    ctx.bag.add('mudbrick', box(x0, 0.002, z0, x1, 0.012, z1));
    return r;
  };
  E.warung = function worn(el, ctx) {
    const r = stall.call(this, el, ctx);
    const s = el.face === 's' ? 1 : el.face === 'n' ? -1 : 0, e = el.face === 'e' ? 1 : el.face === 'w' ? -1 : 0, W = el.w ?? 4;
    const cx = el.at[0] + e * 2.1, cz = el.at[1] + s * 2.1, hx = e ? 0.9 : W / 2 - 0.2, hz = s ? 0.9 : W / 2 - 0.2;
    ctx.bag.add('mudbrick', box(cx - hx, 0.002, cz - hz, cx + hx, 0.01, cz + hz));
    return r;
  };
}
registerWear();
