// Boxes of a front's frame with the faces that can never be seen left out (DESIGN §3, §8: by engineering, not by thinning).
// A piece of a street front (a window's lintel, a balcony, a railing) is a handful of boxes set on the wall and on one another:
// built whole, half of every box's faces are against the wall or buried in the next box. The prototypes of modernisme/index.js
// are built through cull(): each box keeps only the faces that face open air.
//
// A face is dropped when
//  - it faces the wall (the box's back, normal toward −t): the wall is solid behind it;
//  - another box's solid lies against it on its outer side and covers it whole (the cornice's top under the next course, a rail's
//    underside on the bars it rests on, a lintel's back on the wall's batter): coplanar contacts and faces inside a body.
// Shadows are cast by the back faces (three's shadow pass draws FrontSide materials' back faces): a face dropped here is always
// one the solid next to it presents instead, so the union solid's outline, and with it the shadow, is the same.
import { fromTriangles } from '../../core/geom.js';

const EPS = 1e-4;
/** Faces: [axis (0 s, 1 t, 2 y), side (-1 low, +1 high)]. */
const FACES = { sn: [0, -1], sp: [0, 1], tn: [1, -1], tp: [1, 1], yn: [2, -1], yp: [2, 1] };

/** A box in the frame fr: b = [s0, s1, t0, t1, y0, y1]; faces: the names to build ('sn', 'sp', 'tn', 'tp', 'yn', 'yp'). Outward by the frame's own directions. */
export function boxGeo(fr, b, faces) {
  const T = [];
  const P = (s, t, y) => { const q = fr.at(s, t); return [q[0], y, q[1]]; };
  const dir = { 0: [fr.u[0], 0, fr.u[1]], 1: [fr.n[0], 0, fr.n[1]], 2: [0, 1, 0] };
  for (const name of faces) {
    const [ax, sg] = FACES[name], c = b[ax * 2 + (sg > 0 ? 1 : 0)];
    // the four corners of the face, in the other two axes
    const o = [0, 1, 2].filter((a) => a !== ax), [a0, a1] = [b[o[0] * 2], b[o[0] * 2 + 1]], [c0, c1] = [b[o[1] * 2], b[o[1] * 2 + 1]];
    const at = (u, v) => { const q = [0, 0, 0]; q[ax] = c; q[o[0]] = u; q[o[1]] = v; return P(q[0], q[1], q[2]); };
    const A = at(a0, c0), B = at(a1, c0), C = at(a1, c1), D = at(a0, c1);
    // wind it to face outward: the geometry's normal is (c − b) × (a − b), as fromTriangles has it
    const ux = C[0] - B[0], uy = C[1] - B[1], uz = C[2] - B[2], vx = A[0] - B[0], vy = A[1] - B[1], vz = A[2] - B[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, d = dir[ax];
    const out = (nx * d[0] + ny * d[1] + nz * d[2]) * sg > 0;
    if (out) T.push(...A, ...B, ...C, ...A, ...C, ...D); else T.push(...A, ...D, ...C, ...A, ...C, ...B);
  }
  return fromTriangles(T);
}

/**
 * The faces to build of each box of a set: items [{ mat, b, drop?: [names], solid?: false, only?: [names] }], in the frame's (s, t, y).
 * wall: the wall's front is at t = 0, solid behind. Returns the faces (arrays of names) in the items' order.
 * solid: false for a piece that does not hide what lies behind it (it is not counted as covering).
 */
export function cull(items, { wall = true } = {}) {
  return items.map((a, i) => {
    if (a.only) return a.only;
    const out = [];
    for (const [name, [ax, sg]] of Object.entries(FACES)) {
      if (a.drop?.includes(name)) continue;
      if (wall && name === 'tn') continue;                                  // against the wall
      const c = a.b[ax * 2 + (sg > 0 ? 1 : 0)], o = [0, 1, 2].filter((x) => x !== ax);
      // wholly inside the wall (t ≤ 0)
      if (wall && a.b[3] <= EPS) continue;
      let covered = false;
      for (let j = 0; j < items.length && !covered; j++) {
        if (j === i || items[j].solid === false) continue;
        const q = items[j].b;
        // the solid of q lies on the outer side of this face: it reaches across the plane
        const lo = q[ax * 2], hi = q[ax * 2 + 1];
        if (sg > 0 ? !(lo <= c + EPS && hi > c + EPS) : !(hi >= c - EPS && lo < c - EPS)) continue;
        // …and its extent covers this face's
        if (q[o[0] * 2] <= a.b[o[0] * 2] + EPS && q[o[0] * 2 + 1] >= a.b[o[0] * 2 + 1] - EPS && q[o[1] * 2] <= a.b[o[1] * 2] + EPS && q[o[1] * 2 + 1] >= a.b[o[1] * 2 + 1] - EPS) covered = true;
      }
      if (wall && !covered && name !== 'tn') {
        // the wall itself covers a face lying in its plane's back half-space: a box set into the wall (t0 < 0) loses what is behind t = 0
        if (ax === 1 && sg > 0 && c <= EPS) covered = true;
      }
      if (!covered) out.push(name);
    }
    return out;
  });
}
