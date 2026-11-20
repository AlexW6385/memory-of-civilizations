// Teotihuacan by night: the light the braziers, the temples' fires and the hearths throw (docs/settlements/teotihuacan.md §19), made of geometry in the engine's
// additive material `halo` (palette.js, materials.js 'halo'): light ADDED over what lies behind it, at night only (ENV.night), with no light, no
// shadow, no collision and no fog, so it reads at the low preset, where the pool of real lights is off. The shape of each piece is carried by its
// normals (y: 1 at the middle of a disc, 0 at its rim), as in Suzhou's nightlight.js (the Halo class is copied from it, not imported: that file
// holds Suzhou's canals). One element, `tt_halo { lights }`, builds one mesh of the material for all the city's lights (nightlight.js).
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const TAU = Math.PI * 2;
/** Triangles (a position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc (an ellipse) at c spanned by the unit axes U, V, semi-axes su, sv, in rings R (fractions of the radius) of brightness F; `nh` is a wall's outward [x, z]. */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
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
  /** A pool of light on a horizontal plane at height y (the paving, a floor, a terrace). */
  floor(x, y, z, r, rz = r, k = 1, segs = 8) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]); }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees, each a cone of light from its middle. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a doorway full of a hearth's light) of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  geometry() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    return g;
  }
}

/**
 * tt_halo { lights: [ { k, x, y, z, gy, s?, n?, w?, h?, f? } ] } — k 'brazier' (a glow ball at (x, y, z) and its pool on the floor at gy), 'fire' (the same, large:
 * a temple's fire seen from afar), 'door' (a doorway lit from within: a sheet w wide, h high on the plane through (x, z) facing n = [x, z], its spill on the floor at gy).
 */
export function ttHalo(el, { bag }) {
  const H = new Halo();
  for (const L of el.lights) {
    const s = L.s ?? 1;
    if (L.k === 'brazier') { H.ball(L.x, L.y, L.z, 0.95 * s); H.floor(L.x, L.gy + 0.03, L.z, 1.5 * s, 1.5 * s, 0.8); }
    else if (L.k === 'fire') { H.ball(L.x, L.y, L.z, 2.6 * s); H.floor(L.x, L.gy + 0.03, L.z, 4.2 * s, 4.2 * s, 0.9, 10); }
    else if (L.k === 'door') {
      const [nx, nz] = L.n, tx = -nz, tz = nx, w = (L.w ?? 1.5) / 2, y0 = L.gy + 0.08, y1 = L.gy + (L.h ?? 1.9);
      H.quad([L.x - tx * w, y0, L.z - tz * w], [L.x + tx * w, y0, L.z + tz * w], [L.x + tx * w, y1, L.z + tz * w], [L.x - tx * w, y1, L.z - tz * w], [nx, nz], L.f ?? 0.5);
      H.floor(L.x + nx * 1.5, L.gy + 0.03, L.z + nz * 1.5, 1.7 * s, 1.7 * s, 0.7);
    }
  }
  if (H.pos.length) bag.add('halo', H.geometry());
}
