// Cart ruts in the basalt of the Via Lata and the street before the forecourt (docs/settlements/rome.md §4.23). The paving of
// the shared style is wrapped in the style `rome-town` (the shared one is untouched): behind the stepping stones' gaps (1.0 m
// wide, 1.9 m apart: the carts' wheel gauge of crossing()), a polished band 0.16 m wide runs the street's length in granite
// grey, 4 mm proud of the basalt, in the material the drain stripe already uses (no new draw).
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import './nightlight.js';

function rutted(base) {
  const f = (el, ctx) => {
    base(el, ctx);
    if (el.simple) return;
    const [x0, z0, x1, z1] = el.rect, y = (el.y ?? 0) + 0.03, alongZ = z1 - z0 >= x1 - x0, mid = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2;
    const lanes = alongZ ? [-3.8, -1.9, 1.9, 3.8] : [-3.6, -1.9, 1.9, 3.6];
    const cuts = (el.cross ?? []).slice().sort((a, b) => a[0] - b[0]);
    for (const o of lanes) {
      let s = alongZ ? z0 : x0;
      const end = alongZ ? z1 : x1, put = (a, b) => { if (b - a < 0.5) return; const c = mid + o; ctx.bag.add('granite_grey', alongZ ? box(c - 0.08, y, a, c + 0.08, y + 0.004, b) : box(a, y, c - 0.08, b, y + 0.004, c + 0.08)); };
      for (const [c, h] of cuts) { if (c - h > s) put(s, Math.min(end, c - h)); s = Math.max(s, c + h); }
      put(s, end);
    }
  };
  return f;
}
const S = STYLES['rome-town'];
if (S && !S.elements.paving.__ruts) { S.elements.paving = rutted(S.elements.paving); S.elements.paving.__ruts = true; }
