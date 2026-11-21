// Machu Picchu c. 1450–1530 — wear on what is lived in (docs/settlements/machu-picchu.md §17): the soot of the hearth on the wall above the stove, the hollow worn in a
// door's threshold stone, and the polish of the feet and the llamas' hooves along the flagged road. Wraps the style's `inca_house` from here (the style file stays as it was);
// pure functions of the element's own numbers (the stove's place is the style's own: its first random draw, its back corner). Nothing is written anywhere: the Inca had no script
// (the quipu kept their records), so there are no inscriptions to carve [stated: Wikipedia, "Chasqui" / "Quipu"].
import '../../styles/inca/index.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const IN = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] };

/**
 * The wear of a flight's treads (docs §18): where feet fell, a damp-dark hollow across the middle of each tread, 4 mm over its top, narrower than the flight and
 * kept off the nosing and the riser's foot; the lower treads the most worn is not modelled (all alike) [inferred: after worn stone stairs]. n treads over rise y0..y1, dir the way up.
 */
export function treadWear(bag, rect, y0, y1, dir, n) {
  const [x0, z0, x1, z1] = rect, alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0, wid = alongZ ? x1 - x0 : z1 - z0, hw = Math.min(0.45, wid * 0.25), c = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2;
  for (let k = 0; k < n; k++) {
    const f0 = k / n, f1 = (k + 1) / n, yy = y0 + (y1 - y0) * f1, run = len / n;
    // the tread's own strip along the flight, then the worn part of it: from 25% to 80% of its run, its width a little different from tread to tread
    const a = f0 + (f1 - f0) * 0.25, b = f0 + (f1 - f0) * 0.8, j = 0.85 + 0.3 * (((k * 2654435761) >>> 0) % 97) / 97, w = hw * j;
    if (run < 0.12) continue;
    const t0 = dir === 'n' ? z1 - len * b : dir === 's' ? z0 + len * a : dir === 'e' ? x0 + len * a : x1 - len * b, t1 = t0 + len * (b - a);
    bag.add('plaster_damp', alongZ ? box(c - w, yy - 0.01, t0, c + w, yy + 0.016, t1) : box(t0, yy - 0.01, c - w, t1, yy + 0.016, c + w));
  }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  { const sb = STYLES.inca.elements.stairs;
    STYLES.inca.elements.stairs = function wornStairs(el, ctx) { const r = sb.call(this, el, ctx); if (!el.slab && ctx.bag) treadWear(ctx.bag, el.rect, el.y0, el.y1, el.dir, Math.max(1, Math.round((el.y1 - el.y0) / 0.16))); return r; }; }
  STYLES.inca.elements.mp_tread_wear = (el, { bag }) => treadWear(bag, el.rect, el.y0, el.y1, el.dir, Math.max(1, Math.round(Math.abs(el.y1 - el.y0) / (el.riser || 0.17))));
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
