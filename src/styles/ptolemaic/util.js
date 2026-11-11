// Small builders the ptolemaic elements share (the generic wall and stair of src/core/build.js are not exported to styles).
import { orientedBox } from '../../core/build.js';
import { box } from '../../core/geom.js';

/** A straight wall on the centre line a→b, thickness th, from y0 to y1, with openings [{ at, w, h, y0 }] (at: from a to the opening's middle). */
export function wallSeg({ bag, col }, a, b, th, y0, y1, mat, openings = []) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const ops = openings.map((o) => ({ ...o, s0: o.at - o.w / 2, s1: o.at + o.w / 2, y0: o.y0 ?? y0 })).sort((p, q) => p.s0 - q.s0);
  const piece = (s0, s1, ya, yb) => {
    if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return;
    const p0 = [a[0] + ux * s0, a[1] + uz * s0], p1 = [a[0] + ux * s1, a[1] + uz * s1];
    bag.add(mat, orientedBox(p0, p1, th, ya, yb)); col.segment(p0, p1, th, ya, yb);
  };
  let s = 0;
  for (const o of ops) { piece(s, o.s0, y0, y1); if (o.y0 > y0) piece(o.s0, o.s1, y0, o.y0); piece(o.s0, o.s1, o.y0 + o.h, y1); s = o.s1; }
  piece(s, L, y0, y1);
}
/** A flight of steps over rect rising from y0 to y1 toward `dir` ('n' | 's' | 'e' | 'w' = the high end). */
export function steps({ bag, col }, [x0, z0, x1, z1], dir, y0, y1, base, mat = 'limestone', riser = 0.2) {
  const n = Math.max(1, Math.round(Math.abs(y1 - y0) / riser));
  for (let i = 0; i < n; i++) {
    const f1 = (i + 1) / n, f0 = i / n, yt = y0 + (y1 - y0) * f1;
    let r;
    if (dir === 'n') r = [x0, z1 - (z1 - z0) * f1, x1, z1];
    else if (dir === 's') r = [x0, z0, x1, z0 + (z1 - z0) * f1];
    else if (dir === 'e') r = [x0, z0, x0 + (x1 - x0) * f1, z1];
    else r = [x1 - (x1 - x0) * f1, z0, x1, z1];
    void f0;
    bag.add(mat, box(r[0], base, r[1], r[2], yt, r[3]));
  }
  col.ramp([x0, z0, x1, z1], y0, y1, dir);
}
