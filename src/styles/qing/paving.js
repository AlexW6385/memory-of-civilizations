// Ming–Qing Beijing — the paving of the palace's courts (docs/settlements/qing-beijing.md §24): the great courts laid
// with square "golden bricks" (jinzhuan) in cells with seams, each cell a few millimetres out of true, patches of
// repair in another stone; the stone way down the axis in slabs of three widths with open joints, a few slabs of
// weathered stone; the drain covers (the coin-pattern stone covers of the courts' drains); the aprons of the galleries.
import { box, lathe } from '../../core/geom.js';
import { Parts, T } from './carving.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const meets = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;

/**
 * court_bricks: { rect, y, cell (4.7 m: ten bricks of 0.47), seed, skip: [rects], wear: [[x0, x1], …] (the bands, in x, where the
 * traffic wore the paving) } — a base below the seams, the cells on it, repair patches of flagstone, walkable at y.
 */
export function courtBricks(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.03, C = el.cell ?? 4.7, g = 0.05, r = rng(el.seed || 7), skip = el.skip || [];
  bag.add('brick_paving', box(x0, y - 0.3, z0, x1, y - 0.011, z1));          // under the seams (the seams show it a little lower)
  col.floor(el.rect, y);
  const nx = Math.round((x1 - x0) / C), nz = Math.max(1, Math.round((z1 - z0) / C)), cw = (x1 - x0) / nx, cd = (z1 - z0) / nz;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = [x0 + i * cw + g / 2, z0 + j * cd + g / 2, x0 + (i + 1) * cw - g / 2, z0 + (j + 1) * cd - g / 2];
    if (skip.some((s) => meets(a, s))) continue;
    const cx = (a[0] + a[2]) / 2, worn = (el.wear || []).some(([u0, u1]) => cx >= u0 && cx <= u1);
    // a cell is out of true by up to 5 mm (worn bands sit lower, their edges rubbed); every tenth is a patch of flagstone laid in repair
    const patch = r() < 0.07, up = patch ? 0.017 : 0.004 * r() + (worn ? 0 : 0.004);
    bag.add(patch ? 'flagstone' : 'brick_paving', box(a[0], y - 0.012, a[1], a[2], y + up, a[3]));
  }
}

/** stone_way: { rect, y, cols: [widths], seed } — the stone way: slabs 2.4–3.6 m long in columns, open joints over a dark bed, a few weathered. */
export function stoneWay(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.06, r = rng(el.seed || 3), W = x1 - x0, cols = el.cols ?? [W / 3, W / 3, W / 3], j = 0.03;
  bag.add('granite_grey', box(x0, y - 0.35, z0, x1, y - 0.04, z1));
  col.floor(el.rect, y);
  let xa = x0;
  for (const w of cols) {
    let z = z0;
    while (z < z1 - 0.01) {
      const len = Math.min(z1 - z, 2.4 + r() * 1.2), weathered = r() < 0.16;
      bag.add(weathered ? 'travertine' : 'marble_floor', box(xa + j, y - 0.04, z + j, xa + w - j, y - (weathered ? 0.006 : 0), z + len - j));
      z += len;
    }
    xa += w;
  }
}

/** drain_cover: { at, y, s } — a stone cover of a court's drain: a ring, a cross of bars, four holes (the coin pattern), dark below. */
export function drainCover(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0.03, s = el.s ?? 1, P = new Parts();
  P.add('granite_grey', lathe([[0.26, 0], [0.36, 0], [0.36, 0.045], [0.26, 0.045]], 20));
  P.add('granite_grey', box(-0.3, 0, -0.035, 0.3, 0.04, 0.035)); P.add('granite_grey', box(-0.035, 0, -0.3, 0.035, 0.04, 0.3));
  P.add('iron', lathe([[0.001, 0.022], [0.27, 0.022]], 20));
  P.emit(bag, x, y, z, 0, s);
  void T;
}

/** gallery_apron: { rect, y, face } — a kerbed strip of dressed stone along a gallery's platform: a step down to the court. */
export function galleryApron(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.14;
  bag.add('marble', box(x0, 0, z0, x1, y, z1));
  col.floor(el.rect, y);
}
