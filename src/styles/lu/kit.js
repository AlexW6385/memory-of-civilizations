// Small helpers of the Qufu style (docs/settlements/lu-qufu.md §5).
import { box } from '../../core/geom.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
export const TAU = Math.PI * 2;

/** A frame on a lot: u runs along the street from the lot's corner, v from the street (the front) into the lot. */
export class Fr {
  constructor(ctx, o, U, V) { this.bag = ctx.bag; this.col = ctx.col; this.ctx = ctx; this.o = o; this.U = U; this.V = V; }
  pt(u, v) { return [this.o[0] + this.U[0] * u + this.V[0] * v, this.o[1] + this.U[1] * u + this.V[1] * v]; }
  R(u0, v0, u1, v1) { const a = this.pt(u0, v0), b = this.pt(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
  b(mat, u0, y0, v0, u1, y1, v1, solid = true) {
    const r = this.R(u0, v0, u1, v1);
    if (r[2] - r[0] < 1e-4 || r[3] - r[1] < 1e-4 || y1 - y0 < 1e-4) return;
    this.bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));
    if (solid) this.col.rect(r, y0, y1);
  }
}
/** The frame of a lot rect whose street side (front) is 'n' | 's' | 'e' | 'w'. */
export function lotFrame(ctx, rect, front) {
  const [x0, z0, x1, z1] = rect;
  let f;
  if (front === 's') { f = new Fr(ctx, [x0, z1], [1, 0], [0, -1]); f.W = x1 - x0; f.D = z1 - z0; }
  else if (front === 'n') { f = new Fr(ctx, [x0, z0], [1, 0], [0, 1]); f.W = x1 - x0; f.D = z1 - z0; }
  else if (front === 'e') { f = new Fr(ctx, [x1, z0], [0, 1], [-1, 0]); f.W = z1 - z0; f.D = x1 - x0; }
  else { f = new Fr(ctx, [x0, z1], [0, -1], [1, 0]); f.W = z1 - z0; f.D = x1 - x0; }
  return f;
}
