// Fine pieces that are all different (docs/settlements/lhasa.md §19). The viewer draws a shape that a plan repeats twelve times or more as one
// instanced mesh, and counts every such shape's draw apart: a Lhasa house's butter lamps, bowls, flags and cushions, a hundred and thirty houses
// to a plan, were some fifty draws a plan for pieces a hand's breadth across. Each fine piece (under DETAIL_SIZE, as src/core/geom.js has it)
// now carries one zero-area triangle set by its own position, so that no two are the same shape and the plan's fine pieces of a material are
// one merged mesh, as the viewer bakes the small ones together in any case. Nothing visible changes: the triangle has no area and sits inside
// the piece's own box; the memory rises by a few bytes a piece.
import { DETAIL_SIZE } from '../../core/geom.js';

/** A hash of a place: three numbers in 0..1. */
function hash3(x, y, z) {
  const a = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453, b = Math.sin(x * 269.5 + y * 183.3 + z * 246.1) * 43758.5453, c = Math.sin(x * 113.5 + y * 271.9 + z * 124.6) * 43758.5453;
  return [a - Math.floor(a), b - Math.floor(b), c - Math.floor(c)];
}

/** The geometry g with a zero-area marker triangle inside its box (g itself when it is not fine). */
export function marked(g) {
  if (!g) return g;
  const src = g.index ? g.toNonIndexed() : g, A = src.attributes, P = A.position.array;
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < P.length; i += 3) {
    if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 1] < y0) y0 = P[i + 1]; if (P[i + 1] > y1) y1 = P[i + 1]; if (P[i + 2] < z0) z0 = P[i + 2]; if (P[i + 2] > z1) z1 = P[i + 2];
  }
  const size = Math.max(x1 - x0, y1 - y0, z1 - z0);
  if (!(size < DETAIL_SIZE) || !Number.isFinite(size)) return g;
  const [u, v, w] = hash3(Math.round(x0 * 1000), Math.round(y0 * 1000), Math.round(z0 * 1000)), px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * v, pz = z0 + (z1 - z0) * w;
  const out = src === g ? g.clone() : src;
  for (const name of Object.keys(out.attributes)) {
    const at = out.attributes[name], s = at.itemSize, arr = new at.array.constructor(at.array.length + 3 * s);
    arr.set(at.array);
    for (let k = 0; k < 3; k++) {
      const o = at.array.length + k * s;
      if (name === 'position') { arr[o] = px; arr[o + 1] = py; arr[o + 2] = pz; } else if (name === 'normal') arr[o + 1] = 1;
    }
    out.setAttribute(name, new at.constructor(arr, s, at.normalized));
  }
  return out;
}

/** The context an element is built with, its bag's `add` marking the fine pieces. */
export function variedCtx(ctx) {
  const bag = ctx.bag;
  if (!bag || bag.__varied) return ctx;
  const v = Object.create(bag);
  v.__varied = true;
  v.add = (mat, g) => bag.add(mat, marked(g));
  return { ...ctx, bag: v };
}

/** An element builder that builds with its fine pieces marked. */
export const withVariety = (fn) => (el, ctx) => fn(el, variedCtx(ctx));
