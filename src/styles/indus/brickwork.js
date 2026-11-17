// Brick as brick (docs/settlements/mohenjo-daro.md §14): single bricks and proud courses for the places seen close. Every piece is a slightly tapered
// block with millimetre jitter, so that the viewer merges them into the material's one mesh instead of instancing them (src/core/geom.js shapeOf: a
// box with true axis normals is stretched from one prototype; a tapered one is judged by its size in mm).
import { frustum, fromTriangles, orientOutward } from '../../core/geom.js';

/**
 * A pack of pieces that reaches the bag as one geometry per material: a brick on its own is "fine detail" (under 0.4 m), which the viewer draws as a mesh of its own
 * per cell; a face's or a ring's bricks together are one big piece and merge into the plan's one mesh of the material (the arrival's draws do not rise).
 */
export class Pack {
  constructor() { this.m = new Map(); }
  add(mat, g) { const l = this.m.get(mat) ?? this.m.set(mat, []).get(mat); l.push(g.index ? g.toNonIndexed() : g); }
  flush(bag) {
    for (const [mat, list] of this.m) {
      let n = 0; for (const g of list) n += g.attributes.position.array.length;
      const a = new Array(n); let o = 0;
      for (const g of list) { const P = g.attributes.position.array; for (let i = 0; i < P.length; i++) a[o++] = P[i]; }
      bag.add(mat, fromTriangles(a));
    }
    this.m.clear();
  }
}
export const BRICK = { L: 0.28, W: 0.14, H: 0.07, joint: 0.012 };      // 28 × 14 × 7 cm, the 4:2:1 brick [stated: anantamias.com]
/** A tapered block (no bottom): the brick, the proud course, the slab. */
export function rb(bag, mat, x0, y0, z0, x1, y1, z1, r, noBottom = true) {
  const j = () => (r() - 0.5) * 0.0036, t = Math.min(0.0022 + r() * 0.0018, (x1 - x0) * 0.3, (z1 - z0) * 0.3);
  bag.add(mat, frustum([x0 + j(), z0 + j(), x1 + j(), z1 + j()], y0 + j(), y1 + j(), t, t, t, t, { noBottom }));
}
/**
 * A wall face of bricks in English bond: courses of stretchers (0.28 long) alternating with courses of headers (0.14), each brick standing proud of the
 * wall behind it by `d`, the mortar showing dark between. The face lies in the plane `at` (an x or a z), looks toward `out` (±1), runs `a0..a1` along the
 * other axis and `y0..y1` up. `skip(a, y)` may veto a brick (stairs in the way). `matAt(y)` names the material of a course.
 */
export function bondFace(bag, matAt, axis, at, out, a0, a1, y0, y1, r, { d = 0.028, h = BRICK.H + BRICK.joint, skip = null, phase = 0 } = {}) {
  const n = Math.floor((y1 - y0) / h + 1e-6);
  for (let k = 0; k < n; k++) {
    const ya = y0 + k * h + BRICK.joint * 0.5, yb = ya + BRICK.H, stretch = (k + phase) % 2 === 0, len = stretch ? BRICK.L : BRICK.W, pitch = len + BRICK.joint;
    const off = stretch ? 0 : 0.5 * (BRICK.W + BRICK.joint) * 0;                    // (headers start flush: the quoin of an English bond)
    for (let a = a0 + off; a + len * 0.5 < a1; a += pitch) {
      const e = Math.min(a1, a + len);
      if (skip && skip((a + e) / 2, ya)) continue;
      const f0 = out > 0 ? at : at - d, f1 = out > 0 ? at + d : at;
      if (axis === 'x') rb(bag, matAt(ya), f0, ya, a, f1, yb, e, r); else rb(bag, matAt(ya), a, ya, f0, e, yb, f1, r);
    }
  }
}
/** A wedge-shaped brick of a round well's lining: from angle t0 to t1, radii r0 (inner) to r1 (outer), y0..y1, shrunk a little for the joints. */
export function wedge(bag, mat, cx, cz, y0, y1, t0, t1, r0, r1, r) {
  const g = 0.006 / r0, a = t0 + g, b = t1 - g, e = () => (r() - 0.5) * 0.003;
  const P = (t, rr, y) => [cx + Math.cos(t) * (rr + e()), y + e(), cz + Math.sin(t) * (rr + e())];
  const A = [P(a, r0, y0), P(b, r0, y0), P(b, r1, y0), P(a, r1, y0)], B = [P(a, r0, y1), P(b, r0, y1), P(b, r1, y1), P(a, r1, y1)], out = [];
  const q = (p, s, u, v) => out.push(...p, ...s, ...u, ...p, ...u, ...v);
  q(B[0], B[1], B[2], B[3]); q(A[0], A[1], A[2], A[3]); q(A[0], A[1], B[1], B[0]); q(A[1], A[2], B[2], B[1]); q(A[2], A[3], B[3], B[2]); q(A[3], A[0], B[0], B[3]);
  bag.add(mat, fromTriangles(orientOutward(out)));
}
