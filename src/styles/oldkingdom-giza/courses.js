// The Great Pyramid's casing, block by block (docs/settlements/giza.md §16): the faces laid in true flush courses of
// polished white Tura limestone, each course a slab standing a finger's breadth off the stepped core with a hairline
// joint between it and the next (the joint a recess in which the darker stone behind shows), the courses shrinking as they
// rise (1.4 m at the foot, 0.7 m at the top); near the foot, where a visitor stands, the courses are cut into blocks with
// staggered vertical joints and the blocks alternate two shades of white. The arrises are mitred. Replaces the earlier
// proud ribs, which read as rings on the faces.

import { fromTriangles } from '../../core/geom.js';

/** The courses' height at v metres up a pyramid of height h: 1.4 m at the foot, 0.7 m at the top. */
export const courseHeight = (v, h) => 0.7 + 0.7 * Math.max(0, 1 - v / h);

const FACES = [
  { n: [0, -1], t: [1, 0] },    // north (the entrance's face)
  { n: [0, 1], t: [1, 0] },     // south
  { n: [-1, 0], t: [0, 1] },    // west
  { n: [1, 0], t: [0, 1] },     // east
];

/** ok_pyramid's casing { c, a, h, y, door }: a slab (0.04 m off the face) for every course or block from the pavement's edge
 *  to the pyramidion's foot, the joint strip (0.012 m off) behind; none across the heights of the entrance. */
export function courseRibs(bag, el) {
  const [cx, cz] = el.c, a = el.a, h = el.h, y = el.y ?? 0, ph = Math.min(4.4, h * 0.03), top = h - ph - 0.4, D = el.door;
  const half = (v) => a * (1 - v / h), OFF = 0.04, JOFF = 0.012, gap = 0.035;
  const blockZone = Math.min(15, h * 0.12), bw = Math.max(1.2, a * 0.016);        // blocks 1.8 m wide on the Great Pyramid
  const T = { marble_smooth: [], plaster_white: [], limestone_core: [] };
  const quad = (arr, f, u0, v0, u1, v1, off) => {
    // a trapezoid on face f between heights v0 < v1, from u0 to u1 clipped at the arrises (mitred)
    const lim0 = half(v0) + off, lim1 = half(v1) + off;
    const cl = (u, lim) => Math.max(-lim, Math.min(lim, u));
    const bl = cl(u0, lim0), br = cl(u1, lim0), tl = cl(u0, lim1), tr = cl(u1, lim1);
    if (br - bl < 0.02 && tr - tl < 0.02) return;
    const F = FACES[f], P = (u, v) => [cx + F.n[0] * (half(v) + off) + F.t[0] * u, y + v, cz + F.n[1] * (half(v) + off) + F.t[1] * u];
    const A = P(bl, v0), B = P(br, v0), C = P(tr, v1), E = P(tl, v1);
    // wind so that the face looks outward: (B-A) x (C-A) . outward > 0
    const ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], ac = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const nx = ab[1] * ac[2] - ab[2] * ac[1], ny = ab[2] * ac[0] - ab[0] * ac[2], nz = ab[0] * ac[1] - ab[1] * ac[0];
    const out = nx * F.n[0] + nz * F.n[1] + ny * 0.5 > 0;
    if (out) arr.push(...A, ...B, ...C, ...A, ...C, ...E); else arr.push(...A, ...C, ...B, ...A, ...E, ...C);
  };
  let k = 0;
  for (let v = 0.3; v < top; k++) {
    const ch = Math.min(courseHeight(v, h), top - v), v1 = v + ch;
    if (ch < 0.25) break;
    for (let f = 0; f < 4; f++) {
      const doorBand = f === 0 && D && v1 > D[1] - 0.7 && v < D[3] + 1.4;
      const skip = (u0, u1) => doorBand && u1 > D[0] - 0.7 && u0 < D[2] + 0.7;
      const L = half(v) + OFF;
      // the joint strip behind the whole course, and the slab(s) before it
      if (!skip(-L, L)) quad(T.limestone_core, f, -L, v, L, v1, JOFF);
      else { quad(T.limestone_core, f, -L, v, D[0] - 0.7, v1, JOFF); quad(T.limestone_core, f, D[2] + 0.7, v, L, v1, JOFF); }
      const s0 = v + gap;
      if (v < blockZone) {
        // blocks, the joints staggered by course
        const n = Math.max(1, Math.round(2 * L / bw)), w = 2 * L / n, sh = ((k * 0.37 + f * 0.19) % 1) * w;
        for (let i = -1; i <= n; i++) {
          const u0 = -L + i * w + sh - w * 0.5 * 0, u1 = u0 + w - 0.03;
          if (u1 < -L || u0 > L || skip(u0, u1)) continue;
          const m = ((i * 7 + k * 5 + f * 3) % 4) < 2 ? 'marble_smooth' : 'plaster_white';
          quad(T[m], f, Math.max(u0, -L), s0, Math.min(u1, L), v1, OFF);
        }
      } else if (!skip(-L, L)) quad(T[k % 2 ? 'marble_smooth' : 'plaster_white'], f, -L, s0, L, v1, OFF);
      else { quad(T.marble_smooth, f, -L, s0, D[0] - 0.7, v1, OFF); quad(T.marble_smooth, f, D[2] + 0.7, s0, L, v1, OFF); }
    }
    v = v1;
  }
  for (const m of Object.keys(T)) if (T[m].length) bag.add(m, fromTriangles(T[m]));
}
