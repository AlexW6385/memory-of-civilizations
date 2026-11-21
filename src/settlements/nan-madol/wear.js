// Nan Madol c. 1300 — wear on what is used and weathering by the climate (docs/settlements/nan-madol.md §14.5): the matting at each nah's threshold trodden dark by bare
// feet, the dark stain of sakau on the slab where the stones strike. Added from here to the style's
// `nah` and `sakau` (the style files stay as they were), in materials the plan already holds (no new draw); pure functions of each element's own numbers.
// Nothing is written anywhere: the Pohnpeians of c. 1300 had no script (§14.5), so no sign, tablet or inscription is made. [inferred throughout]
import '../../styles/nanmadol/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './nightlight.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.nanmadol.elements, nah0 = E.nah, sakau0 = E.sakau;
  E.nah = function worn(el, ctx) {
    const r = nah0.call(this, el, ctx);
    if (!ctx?.bag) return r;
    const { bag } = ctx, { w, l } = el, ph = el.rank ? 0.7 : 0.45, yaw = el.yaw ?? 0, M = new Matrix4().makeRotationY(yaw).setPosition(el.c[0], 0, el.c[1]);
    const put = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
    const h = (s) => hashAt(el.c[0], el.c[1], s);
    // the step of a commoner's house worn dark in its middle by feet; the matting at the threshold trodden dark
    put('bark_dark', box(-0.4 + 0.15 * (h(3) - 0.5), ph + 0.03, -l / 2 + 0.2, 0.4 + 0.15 * (h(4) - 0.5), ph + 0.04, -l / 2 + 0.95));
    return r;
  };
  E.sakau = function stained(el, ctx) {
    const r = sakau0.call(this, el, ctx);
    if (!ctx?.bag) return r;
    // the milky brown of sakau spilt where the stones strike and dried dark on the slab's top (it stands at 0.62 m)
    const M = new Matrix4().makeRotationY(el.yaw ?? 0).setPosition(el.c[0], 0, el.c[1]);
    for (const [x, z] of [[-0.9, 0.06], [0.95, -0.08]]) { const g = box(x - 0.32, 0.621, z - 0.2, x + 0.32, 0.624, z + 0.2); g.applyMatrix4(M); ctx.bag.add('bark_dark', g); }
    return r;
  };
}
registerWear();
