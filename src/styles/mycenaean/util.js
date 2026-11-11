// Small tools of the Mycenaean style: seeded random, geometry merging and placing, courses of blocks for a wall's face.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { place } from '../../core/geom.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** Merge geometries (indexed or not) into one non-indexed geometry with position and normal. */
export function mergeG(list) {
  list = list.filter(Boolean).map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const out = new BufferGeometry();
  out.setAttribute('position', new Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return out;
}
/** A wall run's local frame (x along a→b, z inward, y up) placed in the plan: the geometry turned and moved. */
export function inFrame(g, a, b) { return place(g, a[0], 0, a[1], -Math.atan2(b[1] - a[1], b[0] - a[0])); }

/**
 * Courses of blocks over a face [u0, u1] × [y0, y1]: returns [[ua, ya, ub, yb, row], ...]. Courses are about `h` high (a little less upward),
 * the blocks `w` long, both random between the pair; `skip(ua, ya, ub, yb)` drops the blocks it says; `cut(y)` gives [lo, hi] of the face at a height
 * (a clipped end, a corbelled edge) when the face is not a plain rectangle.
 */
export function courses(rand, u0, u1, y0, y1, { h = [0.8, 1.3], w = [1, 2.4], taper = 0.07, cut = null } = {}) {
  const out = [];
  let y = y0, row = 0;
  while (y < y1 - 0.05) {
    const ch = Math.max(0.35, (h[0] + rand() * (h[1] - h[0])) * (1 - taper * Math.min(6, row))), ya = y, yb = Math.min(y1, y + ch);
    const [lo, hi] = cut ? cut(ya, yb) : [u0, u1];
    let u = lo - rand() * 0.5 * w[0];
    while (u < hi - 0.04) {
      const bw = w[0] + rand() * (w[1] - w[0]), ua = Math.max(lo, u), ub = Math.min(hi, u + bw);
      if (ub - ua > 0.25) out.push([ua, ya, ub, yb, row]);
      u += bw;
    }
    y = yb; row++;
  }
  return out;
}
