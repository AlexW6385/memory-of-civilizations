// A building drawn with its front to the south can be turned to face north: this mirrors what is added to a bag (and the colliders) in z about a
// line, winding the triangles anew. Lets the town's houses stand back to back with their doors on opposite lanes.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

/** A copy of g mirrored in z about zc (every triangle's winding turned so that it still faces out). */
export function flipZ(g, zc) {
  const s = g.index ? g.toNonIndexed() : g.clone(), out = new BufferGeometry();
  for (const name of Object.keys(s.attributes)) {
    const a = s.attributes[name], n = a.itemSize, A = a.array, B = new Float32Array(A.length), tri = 3 * n;
    for (let i = 0; i + tri <= A.length; i += tri) {
      for (let k = 0; k < n; k++) { B[i + k] = A[i + k]; B[i + n + k] = A[i + 2 * n + k]; B[i + 2 * n + k] = A[i + n + k]; }   // swap vertices 1 and 2
    }
    if (name === 'position') for (let i = 2; i < B.length; i += 3) B[i] = 2 * zc - B[i];
    else if (name === 'normal') for (let i = 2; i < B.length; i += 3) B[i] = -B[i];
    out.setAttribute(name, new Float32BufferAttribute(B, n));
  }
  return out;
}
/** A build context (bag, col, lights) that mirrors what it is given about the line z = zc. */
export function mirrored(ctx, zc) {
  const m = (z) => 2 * zc - z, { bag, col } = ctx;
  return {
    ...ctx,
    bag: { add: (mat, g) => bag.add(mat, flipZ(g, zc)) },
    col: {
      floor: ([x0, z0, x1, z1], y, tag) => col.floor([x0, m(z1), x1, m(z0)], y, tag),
      ramp: ([x0, z0, x1, z1], y0, y1, dir) => col.ramp([x0, m(z1), x1, m(z0)], y0, y1, dir === 'n' ? 's' : dir === 's' ? 'n' : dir),
      segment: (a, b, th, y0, y1) => col.segment([a[0], m(a[1])], [b[0], m(b[1])], th, y0, y1),
      rect: ([x0, z0, x1, z1], y0, y1) => col.rect([x0, m(z1), x1, m(z0)], y0, y1),
      circle: (x, z, r, y0, y1) => col.circle(x, m(z), r, y0, y1),
    },
  };
}
