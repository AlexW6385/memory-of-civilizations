// The light a lamp throws, as geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only,
// with no light, no shadow and no collision (docs/settlements/venice.md §5f.2; the pattern of Ming Suzhou's nightlight.js, with no Suzhou data).
// The brightness of each piece is carried by its vertex normals (y: 1 at the middle, 0 at the rim; a negative y marks water).
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const TAU = Math.PI * 2, MAT = 'halo';
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc at c spanned by unit axes U and V, semi-axes su and sv, in rings R of brightness F; nh: the horizontal part of the normals ([x, z], a wall's outward) or radial. */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1], sign = 1) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f * sign, nh[1] * q] : [Math.cos(a) * q, f * sign, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc on a horizontal plane (paving, floor, deck, water) at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [1, 0.42, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** A disc standing on a wall at (x, y, z), outward normal nh = [x, z]; rw wide and rh high. */
  wall(x, y, z, nh, rw, rh, segs = 8) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9, 0], [0, 1]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) { for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); } }
  /** A flat sheet of brightness f (0..1) facing n = [x, z], seen from both sides: a window's lamp-lit panel. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
