// Mycenae about 1250 BC — wear on what is entered (docs/settlements/mycenae.md §16.5): the hollow worn in the threshold stone of a house by the feet that cross it (the stone is
// darkened and polished in its middle, wider where the feet come and go, a second small patch by the jamb), and the soot of every hearth and lamp of a room on the ceiling over it.
// Wraps the style's `house` from here (the style file stays as it was); pure functions of the element's own numbers. Nothing is written anywhere: Linear B tablets were baked clay
// kept in the palace's archive, not written on walls, and the signs are not set here (§16.5).
import '../../styles/mycenaean/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { mapper } from '../../styles/mycenaean/furnish.js';
import { mergeG } from '../../styles/mycenaean/util.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.mycenaean.elements.house;
  STYLES.mycenaean.elements.house = function worn(el, ctx) {
    const n = ctx.lights ? ctx.lights.length : 0;
    const r = base.call(this, el, ctx);
    if (el.simple || !el.rect) return r;
    const y = el.y ?? 0, m = mapper(el.rect, el.face ?? 'n'), { bag } = ctx, du = el.du ?? m.W / 2, dw = el.dw ?? 1.05;
    // (one geometry of both patches: a piece under 0.4 m would be a fine detail mesh of its own per cell and material, a draw each)
    bag.add('plaster_damp', mergeG([m.B(du - Math.min(0.6, dw / 2 - 0.1), y + 0.02, -0.4, du + Math.min(0.6, dw / 2 - 0.1), y + 0.024, -0.04), m.B(du - dw / 2 + 0.05, y + 0.024, -0.34, du - dw / 2 + 0.3, y + 0.027, -0.1)]));
    // the soot of each light of the room (hearth, forge, lamp) on the roof beams' underside above it
    const SH = el.sh ?? 2.95;
    if (ctx.lights) for (const l of ctx.lights.slice(n)) if (l.at[1] > y + 0.5 && l.at[1] < y + 2.0) bag.add('pottery_dark', box(l.at[0] - 0.3, y + SH - 0.4 - 0.012, l.at[2] - 0.3, l.at[0] + 0.3, y + SH - 0.4 - 0.004, l.at[2] + 0.3));
    return r;
  };
}
registerWear();
