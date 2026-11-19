// Florence by night: the light the lamps and the lit rooms throw (docs/settlements/florence.md §17). The glow shades (the lamp_glass of the
// lanterns and the torch-holders) are lit from within by their own material; what they lack, where the pool of real lights is off (the low
// preset), is the light they give the things round them. Here it is made of geometry in one material, `halo` (palette.js, materials.js):
// light ADDED over what is behind it, at night only, with no light, no shadow and no collision. The shape of each piece is carried by its
// normals: the normal's y is the brightness, 1 at the middle of a disc and 0 at its rim, or one value over a whole sheet. Pieces are
// built in a house face's own frame (u along the wall, y up, d out into the street), which the face's matrix turns without changing y.
// The pattern is Suzhou's (src/settlements/ming-suzhou/nightlight.js), copied and made small: the discs are 6 segments, the panes 2 triangles.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const TAU = Math.PI * 2;
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A disc at c spanned by the unit axes U and V, semi-axes su and sv, in rings R (fractions of the radius) of brightness F; the horizontal part of the normals along `nh` or radial. */
  disc(c, U, V, su, sv, nh = null, segs = 6, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving) at height y. */
  floor(x, y, z, r, rz = r, segs = 6) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [1, 0.42, 0], [0, 0.5, 1]); }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [u, d]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 6) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9, 0], [0, 1]); }
  /** The glow round a flame: three upright discs crossed at 60°. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 6, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit shutters) of brightness f (0..1), facing n = [u, d] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  /** The light of one lamp hung out from a wall at (u, cy, d): its glow ball, the wash on the wall behind it (the washed plane is d = 0.06, clear of the stains at 0.0265),
   *  and, if gy is given, the pool on the paving at gy; s its size. */
  lamp(u, cy, d, gy, s) {
    this.ball(u, cy, d, 0.9 * s);
    this.wall(u, cy, 0.06, [0, 1], 1.7 * s, 1.4 * s);
    if (gy !== null) this.floor(u, gy + 0.03, d + 0.3 * s, 2.2 * s);
  }
  get length() { return this.pos.length; }
  /** One geometry of what was made (null if none); the Halo is emptied. */
  geometry() {
    if (!this.pos.length) return null;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    this.pos = []; this.nor = [];
    return g;
  }
}
