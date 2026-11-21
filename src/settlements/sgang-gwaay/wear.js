// SG̱ang Gwaay Llnagaay — wear on what is used (docs/settlements/sgang-gwaay.md §11e): the door's sill worn dark in its middle by the feet, the lips of the house's tiers worn dark
// where the family steps down. Added from here to the haida style's `haida_house` (the style file stays as it was), in materials the house plan already
// holds (wood_dark: no new draw); pure functions of the house's own numbers. Nothing is written anywhere: the Haida of 1850 had no script (§11e).
import '../../styles/haida/index.js';
import './nightlight.js';
import { box, rod, placer, frame } from '../../styles/haida/util.js';
import { STYLES } from '../../core/build.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.haida.elements.haida_house;
  STYLES.haida.elements.haida_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (!ctx?.bag || !el.tiers) return r;
    const g = el.g ?? 1, hd = el.d / 2, M = frame(el.c[0], 0, el.c[1], el.yaw), add = placer(ctx.bag, M);
        // the sill: a dip worn dark in the middle of the threshold
    add('wood_dark', box(-0.34, g, -hd - 0.02, 0.34, g + 0.004, -hd + 0.38));
    // the tiers' lips worn dark where the family steps down (the stair at the middle of the front landing and of the lower platform)
    const T = el.tiers, yL = g - 0.4, yLo = g - 0.8, fr = 1.4;
    add('wood_dark', box(-0.65, yL + 0.07, -T.hd + fr - 0.12, 0.65, yL + 0.074, -T.hd + fr + 0.02));
    add('wood_dark', box(-0.65, yLo + 0.07, -T.hd + fr + 1.4 - 0.12, 0.65, yLo + 0.074, -T.hd + fr + 1.4 + 0.02));
    // paddles leaned against the front wall at the corners (blade down on the ground, the shaft against the planks), clear of the door's lane
    if (el.landmark) for (const [u, lean] of [[-el.w / 2 + 1.1, 0.0], [-el.w / 2 + 1.45, 0.1], [el.w / 2 - 1.2, -0.05], [el.w / 2 - 1.55, 0.08]]) {
      add('timber', rod([u, g + 0.5, -hd - 0.22], [u + lean, g + 2.0, -hd - 0.12], 0.028, 5));
      add('cedar', box(u - 0.08, g + 0.02, -hd - 0.25, u + 0.08, g + 0.7, -hd - 0.2));
    }
    return r;
  };
}
registerWear();
