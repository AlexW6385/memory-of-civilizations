// Machu Picchu c. 1450–1530 — wear on what is lived in (docs/settlements/machu-picchu.md §17): the soot of the hearth on the wall above the stove, the hollow worn in a
// door's threshold stone, and the polish of the feet and the llamas' hooves along the flagged road. Wraps the style's `inca_house` from here (the style file stays as it was);
// pure functions of the element's own numbers (the stove's place is the style's own: its first random draw, its back corner). Nothing is written anywhere: the Inca had no script
// (the quipu kept their records), so there are no inscriptions to carve [stated: Wikipedia, "Chasqui" / "Quipu"].
import '../../styles/inca/index.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const IN = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] };

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.inca.elements.inca_house;
  STYLES.inca.elements.inca_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (el.doors > 1 || !ctx.bag) return r;
    const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, th = el.th ?? 0.7, h = el.h ?? 2.6, f = el.front || 's';
    const bat = Math.min(0.087 * h, th / 4), off = (v) => th / 2 - (bat * v) / h, inV = IN[f], sideV = [-inV[1], inV[0]], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!el.empty && el.doorW) {   // (only the houses opened to the visitor: the soot is a detail piece, and every other tile's detail would cost a draw)
      // the soot over the stove: the stove is in the back corner on the side `sd` (the style's first draw); a dark patch on the back wall's face from 0.95 to 1.95 m, wider at the top
      const sd = rng((el.seed || 1) * 31 + 7)() < 0.5 ? -1 : 1, m = th / 2 + 0.08, along = Math.abs(inV[0]) ? x1 - x0 : z1 - z0, across = (Math.abs(inV[0]) ? z1 - z0 : x1 - x0) - 2 * m;
      const bk = [cx + inV[0] * along / 2, cz + inV[1] * along / 2], b = sd * (across / 2 - 0.4), px = bk[0] + sideV[0] * b, pz = bk[1] + sideV[1] * b;
      const put = (v0, v1, hw) => {
        const d = off((v0 + v1) / 2), k0 = -d - 0.004, k1 = -d + 0.012;      // (from just inside the wall's face to 12 mm proud of it; the wall leans 1.5 degrees over this height)
        const ax = [px + inV[0] * k0, pz + inV[1] * k0], bx = [px + inV[0] * k1, pz + inV[1] * k1];
        const sx = Math.abs(sideV[0]) * hw, sz = Math.abs(sideV[1]) * hw;
        bag.add('pottery_dark', box(Math.min(ax[0], bx[0]) - sx, y + v0, Math.min(ax[1], bx[1]) - sz, Math.max(ax[0], bx[0]) + sx, y + v1, Math.max(ax[1], bx[1]) + sz));
      };
      put(0.95, 1.4, 0.34); put(1.4, 1.95, 0.5);
    }
    if (el.step && el.doorW) {
      // the threshold stone's top worn into a hollow where the feet cross it: a damp-dark patch, a second smaller one deeper in it
      const out = [-inV[0], -inV[1]], edge = f === 'e' ? [x1, cz] : f === 'w' ? [x0, cz] : f === 'n' ? [cx, z0] : [cx, z1], w = el.doorW ?? (el.humble ? 0.9 : 1.0);
      const patch = (k0, k1, hw, y1) => {
        const a = [edge[0] + out[0] * (off(0) + k0), edge[1] + out[1] * (off(0) + k0)], c = [edge[0] + out[0] * (off(0) + k1), edge[1] + out[1] * (off(0) + k1)];
        const sx = Math.abs(sideV[0]) * hw, sz = Math.abs(sideV[1]) * hw;
        bag.add('plaster_damp', box(Math.min(a[0], c[0]) - sx, y1, Math.min(a[1], c[1]) - sz, Math.max(a[0], c[0]) + sx, y1 + 0.004, Math.max(a[1], c[1]) + sz));
      };
      patch(0.1, 0.4, w * 0.5, y + 0.1); patch(0.16, 0.3, w * 0.3, y + 0.104);
    }
    return r;
  };
}
registerWear();
