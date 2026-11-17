// The Great Pyramid's casing, course by course (docs/settlements/giza.md §16): a fine rib at every joint between the
// courses, laid on the smooth faces from the foot to the pyramidion, so that near the pyramid the casing reads as laid
// stone in courses that shrink as they rise, and from far off as a faint horizontal ruling.

import { fromTriangles } from '../../core/geom.js';

/** A frustum over a square centred at (cx, cz): half-size a0 at y0 to a1 at y1 (open below, capped above). */
function frust(bag, mat, cx, cz, a0, a1, y0, y1) {
  const B = [[-a0, -a0], [a0, -a0], [a0, a0], [-a0, a0]], T = [[-a1, -a1], [a1, -a1], [a1, a1], [-a1, a1]], t = [];
  const P = (q, y) => [cx + q[0], y, cz + q[1]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...P(B[i], y0), ...P(T[i], y1), ...P(T[j], y1), ...P(B[i], y0), ...P(T[j], y1), ...P(B[j], y0)); }
  t.push(...P(T[0], y1), ...P(T[3], y1), ...P(T[2], y1), ...P(T[0], y1), ...P(T[2], y1), ...P(T[1], y1));
  bag.add(mat, fromTriangles(t));
}

/** The courses' height at v metres up a pyramid of height h: 1.4 m at the foot, 0.7 m at the top. */
export const courseHeight = (v, h) => 0.7 + 0.7 * Math.max(0, 1 - v / h);

/** ok_pyramid's joint ribs { c, a, h, y, door }: 0.09 m high, standing 0.16 m off the face (horizontally), one at the head of
 *  every course from the pavement's edge to the pyramidion's foot; none across the heights of the entrance. */
export function courseRibs(bag, el) {
  const [cx, cz] = el.c, a = el.a, h = el.h, y = el.y ?? 0, ph = Math.min(4.4, h * 0.03), top = h - ph - 0.5, D = el.door;
  const half = (v) => a * (1 - v / h), rib = 0.09, out = 0.16;
  for (let v = 0.3 + courseHeight(0.3, h); v < top;) {
    const ch = courseHeight(v, h), v1 = v + rib;
    if (!(D && v1 > D[1] - 0.7 && v < D[3] + 1.4)) frust(bag, 'limestone_core', cx, cz, half(v) + out, half(v1) + out, y + v, y + v1);
    v += ch;
  }
}
