// Wear in Ming–Qing Beijing (docs/settlements/qing-beijing.md §43): the stone that is walked on is worn where the feet go. A sill-stone or a
// step is a slab whose top dips in the middle of its length — the hollow of generations of feet — by a hair; geometry only, in the material
// the piece already has (granite_grey), so it adds no mesh. The dry north has no moss and no rain streaks here (the climate's `damp` is
// 0.06), so what wears is stone underfoot, not the walls' faces.
import { fromTriangles, orientOutward } from '../../core/geom.js';

/**
 * A worn slab in frame F (houses.js Frame: s along the front, d out of it): from s0 to s1 and d0 to d1, its foot at y0, its top at y1 at the
 * ends and dipped by `dip` in the middle along s (a bell: exp(-5 m²), m from -1 to 1), in 12 pieces. A closed prism, outward faces.
 */
export function wornSlab(bag, mat, F, s0, s1, d0, d1, y0, y1, dip) {
  const N = 12, t = [], top = (s) => { const m = (s - (s0 + s1) / 2) / ((s1 - s0) / 2); return y1 - dip * Math.exp(-m * m * 5); };
  const P = (s, d, y) => F.P(s, d, y), q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
  for (let i = 0; i < N; i++) {
    const a = s0 + (s1 - s0) * i / N, b = s0 + (s1 - s0) * (i + 1) / N, ha = top(a), hb = top(b);
    q(P(a, d0, ha), P(b, d0, hb), P(b, d1, hb), P(a, d1, ha));                      // the top
    q(P(a, d0, y0), P(a, d1, y0), P(b, d1, y0), P(b, d0, y0));                       // the foot
    q(P(a, d0, y0), P(b, d0, y0), P(b, d0, hb), P(a, d0, ha));                       // the two long faces
    q(P(b, d1, y0), P(a, d1, y0), P(a, d1, ha), P(b, d1, hb));
  }
  q(P(s0, d1, y0), P(s0, d0, y0), P(s0, d0, top(s0)), P(s0, d1, top(s0)));            // the ends
  q(P(s1, d0, y0), P(s1, d1, y0), P(s1, d1, top(s1)), P(s1, d0, top(s1)));
  orientOutward(t);
  bag.add(mat, fromTriangles(t));
}
