// Djenne, 14th c. — wear on what is entered (docs/settlements/djenne.md 20.5): the threshold of an entered house is trodden bare and darker in its
// middle by the feet that cross it, with a smaller worn patch beside the bench's end where people step up; the shops' thresholds likewise, and the polished
// lip of each counter where goods are slid. Wraps the style's elements from here; pure functions of the element's own numbers. The patches are of
// 'mud_plaster', a material the houses already hold (no extra draw). Nothing is written: no verified Arabic here (see the dossier).
import '../../styles/sahel/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './furniture.js';

/** A worn patch: the box turned a few hundredths of a radian about its middle (hand-trodden, never square), so that no two are one shape and the merge does not instance them. */
function patch(bag, x0, y0, z0, x1, y1, z1) {
  const g = box(x0, y0, z0, x1, y1, z1), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, a = (hashAt(cx, cz, 9) - 0.5) * 0.18 + 0.03;
  g.translate(-cx, 0, -cz); g.rotateY(a); g.translate(cx, 0, cz);
  bag.add('mud_plaster', g);
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.sahel.elements;
  const house = (fn) => function worn(el, ctx) {
    const r = fn.call(this, el, ctx);
    if (el.simple || !el.home || (el.front !== 's' && el.front !== 'n')) return r;
    const [x0, z0, x1, z1] = el.rect, mid = (x1 - x0) / 2, s = el.front === 's', { bag } = ctx;
    const put = (u0, u1, v0, v1, y0, y1) => { const ax = s ? x0 + u0 : x1 - u1, bx = s ? x0 + u1 : x1 - u0, az = s ? z1 + v0 : z0 - v1, bz = s ? z1 + v1 : z0 - v0; patch(bag, Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz)); };
    const j = (k, a) => (hashAt(x0, z0, k) - 0.5) * a;   // no two thresholds alike (and no run of identical shapes to instance)
    put(mid - 0.7 + j(1, 0.3), mid + 0.7 + j(2, 0.3), 0.04, 0.5 + j(3, 0.2), 0.0, 0.012 + j(4, 0.004));       // the step's worn middle, out from the wall
    put(mid - 0.45 + j(5, 0.2), mid + 0.45 + j(6, 0.2), 0.1, 0.4 + j(7, 0.14), 0.012, 0.016 + j(8, 0.002));       // trodden bare
    return r;
  };
  E.sahel_near_wall = house(E.sahel_near_wall); E.sahel_home = house(E.sahel_home);
  const shops = (fn) => function worn(el, ctx) {
    const r = fn.call(this, el, ctx);
    const [x0, , x1, z1] = el.rect, n = el.n ?? 8, W = (x1 - x0) / n;
    for (let i = 0; i < n; i++) { const c = x0 + i * W + W / 2; const j = (k, a) => (hashAt(c, z1, k) - 0.5) * a; patch(ctx.bag, c - 0.1 + j(1, 0.2), 0.0, z1 + 0.02, c + 1.4 + j(2, 0.3), 0.012 + j(3, 0.004), z1 + 0.6 + j(4, 0.2)); patch(ctx.bag, c + 0.3 + j(5, 0.15), 0.012, z1 + 0.08, c + 1.1 + j(6, 0.2), 0.016 + j(7, 0.002), z1 + 0.4 + j(8, 0.1)); }
    return r;
  };
  E.sahel_shops = shops(E.sahel_shops);
}
registerWear();
