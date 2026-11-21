// SG̱ang Gwaay Llnagaay — wear on what is used (docs/settlements/sgang-gwaay.md §11e): the earth trodden dark and bare in the lane from the street
// to each house's door and round the frontal pole's foot, the door's sill worn dark in its middle by the feet, the lips of the house's tiers worn dark
// where the family steps down. Added from here to the haida style's `haida_house` (the style file stays as it was), in materials the house plan already
// holds (wood_dark: no new draw); pure functions of the house's own numbers. Nothing is written anywhere: the Haida of 1850 had no script (§11e).
import '../../styles/haida/index.js';
import './nightlight.js';
import { box, lathe, placer, frame } from '../../styles/haida/util.js';
import { height } from './layout.js';
import { hashAt } from './nightlight.js';
import { STYLES } from '../../core/build.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.haida.elements.haida_house;
  STYLES.haida.elements.haida_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (!ctx?.bag || !el.tiers) return r;
    const g = el.g ?? 1, hd = el.d / 2, M = frame(el.c[0], 0, el.c[1], el.yaw), add = placer(ctx.bag, M);
    const cs = Math.cos(el.yaw), sn = Math.sin(el.yaw), gy = (u, v) => height(el.c[0] + u * cs + v * sn, el.c[1] - u * sn + v * cs);
    // the trodden lane: dark flattened patches along the way from the street to the door, widening where the feet turn at the pole's foot
    const J = (k) => (hashAt(el.c[0], el.c[1], 40 + k) - 0.5) * 0.3;
    for (const [v, rx, k] of [[-hd - 1.4, 1.0, 0], [-hd - 2.6, 0.8, 1], [-hd - 3.7, 0.65, 2], [-hd - 4.8, 0.55, 3]]) {
      const u = J(k), y = gy(u, v);
      if (Number.isFinite(y) && y > 0.4 && y < g + 0.3) add('wood_dark', lathe([[0.001, 0.012], [rx, 0.012], [rx * 1.1, 0.004]], 12, null, u, y, v));
    }
    // the sill: a dip worn dark in the middle of the threshold
    add('wood_dark', box(-0.34, g, -hd - 0.02, 0.34, g + 0.004, -hd + 0.38));
    // the tiers' lips worn dark where the family steps down (the stair at the middle of the front landing and of the lower platform)
    const T = el.tiers, yL = g - 0.4, yLo = g - 0.8, fr = 1.4;
    add('wood_dark', box(-0.65, yL + 0.07, -T.hd + fr - 0.12, 0.65, yL + 0.074, -T.hd + fr + 0.02));
    add('wood_dark', box(-0.65, yLo + 0.07, -T.hd + fr + 1.4 - 0.12, 0.65, yLo + 0.074, -T.hd + fr + 1.4 + 0.02));
    return r;
  };
}
registerWear();
