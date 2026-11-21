// Wear and stone rails on the pagoda's approaches (docs/settlements/song-hangzhou.md §32).
// Two stairs of the temple had bare treads and no rails: the one up the pagoda's base on the south and the long one from the
// pagoda's court to the upper terrace. Here each gets a stone balustrade (a sloping panel, a coping and lotus-capped posts) and
// treads dished and darkened down their middle where feet went. Materials are the plans' own (granite_grey, granite_block, slate, bluestone).
//
//   { t: 'hz_stair_dress', rect: [x0, z0, x1, z1], y0, y1, dir: 'n', seed, rail: true }   (the same data as the `stairs` element it dresses)
import { STYLES } from '../../core/build.js';
import { fromTriangles, orientOutward, box, lathe } from '../../core/geom.js';
import '../../styles/song/index.js';

/** A number in [0, 1) from two numbers alone. */
const hash = (a, b, s = 0) => { let h = (Math.round(a * 64) * 73856093) ^ (Math.round(b * 64) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

/** A solid prism: the polygon `poly` of [z, y] corners (convex, in order) extruded over x0..x1. */
function prism(x0, x1, poly) {
  const t = [], n = poly.length;
  for (let i = 1; i < n - 1; i++) {
    t.push(x0, poly[0][1], poly[0][0], x0, poly[i][1], poly[i][0], x0, poly[i + 1][1], poly[i + 1][0]);
    t.push(x1, poly[0][1], poly[0][0], x1, poly[i][1], poly[i][0], x1, poly[i + 1][1], poly[i + 1][0]);
  }
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    t.push(x0, a[1], a[0], x1, a[1], a[0], x1, b[1], b[0], x0, a[1], a[0], x1, b[1], b[0], x0, b[1], b[0]);
  }
  return fromTriangles(orientOutward(t));
}

/** A post with a lotus cap (a lathe: bud on a collar) on a square shaft, its foot at (x, y, z). */
function post(bag, x, y, z, h, side) {
  const s = side / 2;
  bag.add('granite_block', box(x - s, y, z - s, x + s, y + h, z + s));
  bag.add('granite_block', lathe([[0.001, 0], [s * 1.35, 0], [s * 1.35, 0.04], [s * 0.9, 0.07], [s * 1.25, 0.14], [s * 1.0, 0.24], [s * 0.45, 0.3], [0.001, 0.34]], 10, null, x, y + h, z));
}

function stairDress(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1 } = el, len = z1 - z0, n = Math.max(1, Math.round((y1 - y0) / 0.16)), xc = (x0 + x1) / 2, seed = el.seed ?? 5;
  // (only ascending north: the two stairs dressed run so)
  const yAt = (k) => y0 + (y1 - y0) * k / n, zAt = (k) => z1 - len * k / n;
  // the worn middle: on each tread a darker slab, a hair proud, its width and drift by the tread's own place; the odd tread's slab is bluestone
  for (let k = 0; k < n; k++) {
    const zf = zAt(k), zb = zAt(k + 1), top = yAt(k + 1), r = hash(xc, zf, seed), w = (x1 - x0) * (0.3 + 0.16 * hash(zf, k, seed + 1)), cx = xc + (r - 0.5) * 0.5;
    const a = Math.max(x0 + 0.1, cx - w / 2), b = Math.min(x1 - 0.1, cx + w / 2);
    bag.add(hash(zb, xc, seed + 2) < 0.6 ? 'slate' : 'bluestone', box(a, top + 0.003, zb + 0.03 + 0.04 * r, b, top + 0.009 + 0.004 * r, zf - 0.03));
  }
  if (el.rail === false) return;
  // the balustrade: on each side a sloping panel, a coping a little wider, a lotus-capped post at the foot, the middle and the head
  const T = 0.2, H = 0.6, C = 0.3;
  for (const s of [-1, 1]) {
    const xi = s < 0 ? x0 - T : x1, xo = xi + T, cx0 = xi - (C - T) / 2, cx1 = xo + (C - T) / 2;
    bag.add('granite_grey', prism(xi, xo, [[z1, y0 - 0.25], [z0, y0 - 0.25], [z0, y1 + H - 0.06], [z1, y0 + 0.16 + H - 0.06]]));
    bag.add('granite_block', prism(cx0, cx1, [[z1, y0 + 0.16 + H - 0.06], [z0, y1 + H - 0.06], [z0, y1 + H + 0.06], [z1, y0 + 0.16 + H + 0.06]]));
    const px = (xi + xo) / 2;
    for (const f of [0, 0.5, 1]) {
      const z = f === 0 ? z1 - 0.18 : f === 1 ? z0 + 0.18 : z1 - len * f, y = f === 0 ? y0 : f === 1 ? y1 : y0 + (y1 - y0) * f;
      post(bag, px, y - 0.1, z, H + 0.4, 0.3);
    }
    // the stair's own treads end at the panel: the wall is solid to the walker
    col.rect([xi, z0, xo, z1], y0, y1 + H);
  }
}
STYLES.song.elements.hz_stair_dress = stairDress;
