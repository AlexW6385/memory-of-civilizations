// A local frame for building in the Mongol style: a house or a shop row is laid out in (u, v) — u along its front, v out of the front
// into the street or court (inside the building v is negative) — and put in the world by the frame's origin and its two unit vectors.
// Every helper puts pieces into the bag and, when asked, their colliders.
import { box, rod, lathe, obox } from './util.js';
import { wallRun } from './hall.js';

export class Local {
  /** O: the world [x, z] of (0, 0); U, V: unit vectors of u and v in plan. */
  constructor(bag, col, lights, O, U, V) { this.bag = bag; this.col = col; this.lights = lights; this.O = O; this.U = U; this.V = V; }
  P(u, v) { return [this.O[0] + this.U[0] * u + this.V[0] * v, this.O[1] + this.U[1] * u + this.V[1] * v]; }
  /** The world rectangle [x0, z0, x1, z1] of a local one. */
  R(u0, v0, u1, v1) { const a = this.P(u0, v0), b = this.P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
  /** A box of local corners; solid: also a collider. */
  box(mat, u0, v0, u1, v1, y0, y1, solid = false) {
    const r = this.R(u0, v0, u1, v1);
    if (r[2] - r[0] < 1e-4 || r[3] - r[1] < 1e-4 || y1 - y0 < 1e-4) return;
    this.bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));
    if (solid) this.col.rect(r, y0, y1);
  }
  /** A lathe about the vertical axis through local (u, v) at height y. */
  lathe(mat, profile, seg, u, v, y) { const p = this.P(u, v); this.bag.add(mat, lathe(profile, seg, null, p[0], y, p[1])); }
  /** A rod between local points [u, y, v]. */
  rod(mat, a, b, r, seg = 5) { const p = this.P(a[0], a[2]), q = this.P(b[0], b[2]); this.bag.add(mat, rod([p[0], a[1], p[1]], [q[0], b[1], q[1]], r, seg)); }
  /** A thin oriented slab along local a→b (centre line), thickness th. */
  slab(mat, ua, va, ub, vb, th, y0, y1) { this.bag.add(mat, obox(this.P(ua, va), this.P(ub, vb), th, y0, y1)); }
  circle(u, v, r, y0, y1) { const p = this.P(u, v); this.col.circle(p[0], p[1], r, y0, y1); }
  /** A wall along local a→b, with the openings of wallRun. */
  wall(mat, ua, va, ub, vb, th, y0, y1, ops = [], opMat = null) { wallRun(this.bag, this.col, this.P(ua, va), this.P(ub, vb), th, y0, y1, mat, ops, opMat); }
  light(u, y, v, color = '#ffcf86', intensity = 1.6, distance = 7) { const p = this.P(u, v); this.lights?.push({ at: [p[0], y, p[1]], color, intensity, distance }); }
  /** A ramp (stair) over the local rectangle, rising toward −v (up = '-v') or +u / −u; the world direction for the collider. */
  ramp(u0, v0, u1, v1, y0, y1, up) {
    const r = this.R(u0, v0, u1, v1);
    const d = up === '-v' ? [-this.V[0], -this.V[1]] : up === '+v' ? [this.V[0], this.V[1]] : up === '+u' ? [this.U[0], this.U[1]] : [-this.U[0], -this.U[1]];
    const dir = Math.abs(d[0]) > Math.abs(d[1]) ? (d[0] > 0 ? 'e' : 'w') : (d[1] > 0 ? 's' : 'n');
    this.col.ramp(r, y0, y1, dir);
  }
  floor(u0, v0, u1, v1, y) { this.col.floor(this.R(u0, v0, u1, v1), y); }
}
/** The frame of the front of a rectangle: the front on the side `side` ('s' | 'n' | 'e' | 'w': which way the front looks), rect [x0, z0, x1, z1]. Returns { O, U, V, W, D }. */
export function frontFrame(rect, side) {
  const [x0, z0, x1, z1] = rect;
  if (side === 's') return { O: [x0, z1], U: [1, 0], V: [0, 1], W: x1 - x0, D: z1 - z0 };
  if (side === 'n') return { O: [x0, z0], U: [1, 0], V: [0, -1], W: x1 - x0, D: z1 - z0 };
  if (side === 'e') return { O: [x1, z0], U: [0, 1], V: [1, 0], W: z1 - z0, D: x1 - x0 };
  return { O: [x0, z0], U: [0, 1], V: [-1, 0], W: z1 - z0, D: x1 - x0 };
}
