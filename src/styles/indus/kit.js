// Indus style kit: helpers shared by the elements (docs/settlements/mohenjo-daro.md §5).
import { box, lathe, fromTriangles } from '../../core/geom.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
export const TAU = Math.PI * 2;
export const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

const DIR = (v) => (v[0] > 0.5 ? 'e' : v[0] < -0.5 ? 'w' : v[1] > 0.5 ? 's' : 'n');
/** A frame on a base height: u along, v out from the origin o; all axis-aligned. b() builds boxes in it (y relative to the base). */
export class Fr {
  constructor(ctx, o, U, V, y = 0) { this.bag = ctx.bag; this.col = ctx.col; this.ctx = ctx; this.o = o; this.U = U; this.V = V; this.y = y; }
  pt(u, v) { return [this.o[0] + this.U[0] * u + this.V[0] * v, this.o[1] + this.U[1] * u + this.V[1] * v]; }
  R(u0, v0, u1, v1) { const a = this.pt(u0, v0), b = this.pt(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
  b(mat, u0, y0, v0, u1, y1, v1, solid = true) {
    const r = this.R(u0, v0, u1, v1);
    if (r[2] - r[0] < 1e-4 || r[3] - r[1] < 1e-4 || y1 - y0 < 1e-4) return;
    this.bag.add(mat, box(r[0], this.y + y0, r[1], r[2], this.y + y1, r[3]));
    if (solid) this.col.rect(r, this.y + y0, this.y + y1);
  }
  floor(u0, v0, u1, v1, y) { this.col.floor(this.R(u0, v0, u1, v1), this.y + y); }
  lathe(mat, prof, u, y, v, seg = 10) { const p = this.pt(u, v); this.bag.add(mat, lathe(prof, seg, null, p[0], this.y + y, p[1])); }
  circ(u, v, r, y0, y1) { const p = this.pt(u, v); this.col.circle(p[0], p[1], r, this.y + y0, this.y + y1); }
  /** Steps rising along +v (dv = 1) or −v from (u0..u1) between v0 and v1, from y0 to y1. */
  stairs(u0, v0, u1, v1, y0, y1, dv = 1, mat = 'brick', riser = 0.22) {
    const n = Math.max(1, Math.round((y1 - y0) / riser)), vs = v1 - v0;
    for (let i = 0; i < n; i++) {
      const f0 = i / n, f1 = (i + 1) / n, top = y0 + (y1 - y0) * f1;
      // each step runs back to the high end (no gap under)
      const a = dv > 0 ? v0 + vs * f0 : v0, b = dv > 0 ? v1 : v1 - vs * f0;
      const lo = dv > 0 ? a : v0, hi = dv > 0 ? v1 : b;
      const r = this.R(u0, lo, u1, hi);
      this.bag.add(mat, box(r[0], this.y + y0 - 0.05, r[1], r[2], this.y + top, r[3]));
    }
    // the flight is a solid wedge: its collider under the climbing surface steps up with it, so that nobody walks into it from the side
    const SL = 6;
    for (let k = 1; k < SL; k++) {
      const va = dv > 0 ? v0 + vs * k / SL : v1 - vs * (k + 1) / SL, vb = dv > 0 ? v0 + vs * (k + 1) / SL : v1 - vs * k / SL, r = this.R(u0, va, u1, vb);
      const top = (y1 - y0) * k / SL - 0.6;                                  // (the engine trims what reaches the climbing surface, so the collider stops short of it)
      if (top > 0.3) this.col.rect(r, this.y + y0 - 0.05, this.y + y0 + top);
    }
    const w = this.R(u0, v0, u1, v1), asc = [this.V[0] * dv, this.V[1] * dv];
    this.col.ramp(w, this.y + y0, this.y + y1, DIR(asc));
  }
}
/** A house frame on a lot: u along the lane from one end, v from the lane (the front) into the lot. */
export function lotFrame(ctx, rect, front, y = 0) {
  const [x0, z0, x1, z1] = rect;
  let f;
  if (front === 'w') { f = new Fr(ctx, [x0, z0], [0, 1], [1, 0], y); f.W = z1 - z0; f.D = x1 - x0; }
  else if (front === 'e') { f = new Fr(ctx, [x1, z0], [0, 1], [-1, 0], y); f.W = z1 - z0; f.D = x1 - x0; }
  else if (front === 'n') { f = new Fr(ctx, [x0, z0], [1, 0], [0, 1], y); f.W = x1 - x0; f.D = z1 - z0; }
  else { f = new Fr(ctx, [x0, z1], [1, 0], [0, -1], y); f.W = x1 - x0; f.D = z1 - z0; }
  return f;
}
/** A round brick well: the curb with its mouth, the water below. */
export function wellAt(bag, col, x, y, z, r = 0.62) {
  bag.add('brick', lathe([[r + 0.16, 0], [r + 0.16, 0.5], [r + 0.08, 0.58], [r - 0.12, 0.58], [r - 0.12, 0.2], [0.001, 0.2]], 18, null, x, y, z));
  bag.add('brick_buff', lathe([[r + 1.1, 0], [r + 1.1, 0.04], [r + 0.16, 0.06], [r + 0.16, 0]], 18, null, x, y, z));
  col.circle(x, z, r + 0.2, y, y + 0.55);
}
export { box, lathe, fromTriangles };
