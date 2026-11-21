// Djenne, 14th c. — wear on what is entered (docs/settlements/djenne.md 20.5): the threshold of an entered house is trodden bare and darker in its
// middle by the feet that cross it, with a smaller worn patch beside the bench's end where people step up; the shops' thresholds likewise, and the polished
// lip of each counter where goods are slid. Wraps the style's elements from here; pure functions of the element's own numbers. The patches are of
// 'mud_plaster', a material the houses already hold (no extra draw). Nothing is written: no verified Arabic here (see the dossier).
import '../../styles/sahel/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.sahel.elements;
  const house = (fn) => function worn(el, ctx) {
    const r = fn.call(this, el, ctx);
    if (el.simple || !el.home || (el.front !== 's' && el.front !== 'n')) return r;
    const [x0, z0, x1, z1] = el.rect, mid = (x1 - x0) / 2, s = el.front === 's', { bag } = ctx;
    const put = (u0, u1, v0, v1, y0, y1) => { const ax = s ? x0 + u0 : x1 - u1, bx = s ? x0 + u1 : x1 - u0, az = s ? z1 + v0 : z0 - v1, bz = s ? z1 + v1 : z0 - v0; bag.add('mud_plaster', box(Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz))); };
    put(mid - 0.7, mid + 0.7, 0.04, 0.5, 0.0, 0.012);       // the step's worn middle, out from the wall
    put(mid - 0.45, mid + 0.45, 0.1, 0.4, 0.012, 0.016);       // trodden bare
    return r;
  };
  E.sahel_near_wall = house(E.sahel_near_wall); E.sahel_home = house(E.sahel_home);
  const shops = (fn) => function worn(el, ctx) {
    const r = fn.call(this, el, ctx);
    const [x0, , x1, z1] = el.rect, n = el.n ?? 8, W = (x1 - x0) / n;
    for (let i = 0; i < n; i++) { const c = x0 + i * W + W / 2; ctx.bag.add('mud_plaster', box(c - 0.1, 0.0, z1 + 0.02, c + 1.4, 0.012, z1 + 0.6)); ctx.bag.add('mud_plaster', box(c + 0.3, 0.012, z1 + 0.08, c + 1.1, 0.016, z1 + 0.4)); }
    return r;
  };
  E.sahel_shops = shops(E.sahel_shops);
}
registerWear();
