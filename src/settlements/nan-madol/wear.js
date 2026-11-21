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
  const E = STYLES.nanmadol.elements, nah0 = E.nah, sakau0 = E.sakau, gate0 = E.gate;
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
  E.gate = function trodden(el, ctx) {
    const r = gate0.call(this, el, ctx);
    if (!ctx?.bag) return r;
    // the ground where feet come to each flight: flakes of rag pressed in by feet, thinning out from the steps [inferred]
    const [cx, cz] = el.c, w = el.w, th = el.th, n = el.n ?? 2;
    for (const side of [1, -1]) {
      const zs = cz + side * (th / 2 + n * 0.55);
      for (let i = 0; i < 14; i++) {
        // pebbles and flakes of rag pressed into the lane by feet: dense in the lane's middle, few at its edge
        const a = hashAt(cx, zs, 40 + i), b = hashAt(cx, zs, 70 + i), c = hashAt(cx, zs, 100 + i), d = hashAt(cx, zs, 130 + i);
        const reach = 0.1 + a * 2.8, x = cx + (b - 0.5) * w * 0.7 * (1 - reach / 5), z = zs + side * reach, r = 0.07 + 0.09 * c;
        ctx.bag.add('coral_rag', box(x - r * (1 + d), 0.002, z - r, x + r * (1 + d), 0.02 + 0.02 * c, z + r));
      }
    }
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
