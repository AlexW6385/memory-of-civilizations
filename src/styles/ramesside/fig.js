// A frame and a few shared parts for the modelled sculpture of Abu Simbel (docs/settlements/abu-simbel.md §17): the Kit puts a figure built in
// its own frame (x to the viewer's right, y up, w out of the surface toward the viewer, metres) into the world and collects what is built by
// material, each material one Sculpt (one geometry); the head and the hand are the same for the king, the gods and the family.
// Deterministic: a copy differs from another by a hair taken from a hash of its own position, never from a counter or a random number.

import { Sculpt, blob, blobDir, tube, rodT, torus, hash3 } from '../nabataean/sculpt.js';

export { blob, blobDir, tube, rodT, torus };

export class Kit {
  /** o the figure's origin in the world, ex / ey / ez the world directions of its x, y, w; k its scale; flat, clip: a relief (w flattened and cut at 0). */
  constructor(o, ex, ey, ez, k = 1, { jit = 0.0015, flat = 1, clip = false } = {}) {
    const j = k * (1 + jit * (hash3(o[0], o[1], o[2]) - 0.5) * 2);
    this.xf = ([a, b, c]) => [o[0] + j * (ex[0] * a + ey[0] * b + ez[0] * c), o[1] + j * (ex[1] * a + ey[1] * b + ez[1] * c), o[2] + j * (ex[2] * a + ey[2] * b + ez[2] * c)];
    this.flat = flat; this.clip = clip; this.m = new Map();
  }
  s(mat) { let S = this.m.get(mat); if (!S) { S = new Sculpt(this.xf, { flat: this.flat, clip: this.clip }); this.m.set(mat, S); } return S; }
  /** The geometries by material into a bag. */
  flush(bag) { for (const [m, S] of this.m) if (S.pos.length) bag.add(m, S.geometry()); return this; }
  get triangles() { let n = 0; for (const S of this.m.values()) n += S.triangles; return n; }
}
/** A kit for a figure standing at (x, y, z) facing the way a statue of the old builders does at `yaw` (yaw 0 faces −z, −π/2 faces +x). */
export function standing(x, y, z, yaw = 0, k = 1, o = {}) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return new Kit([x, y, z], [-c, 0, s], [0, 1, 0], [-s, 0, -c], k, o);
}

/**
 * A human head: centre c, radii r = [rx, ry, rz] (the face looks along +w). The mid form: the skull, cheeks, brow ridges, lids, the nose with its wings,
 * the lips, the chin and ears. `fine` adds what is seen within a few metres (the painted eyes and brows, the cosmetic lines, the mouth's line, the
 * dimples of the smile) as the paints. `skin` the material of the flesh, `lip` the lips'.
 */
export function head(F, c, r, { skin = 'paint_robe', lip = 'limewash_red', fine = false, female = false } = {}) {
  const [rx, ry, rz] = r, K = F.s(skin);
  // a point on the face at fractions (fx, fy) of the radii, proud of the surface by `out` (of rz)
  const at = (fx, fy, out = 0) => [c[0] + fx * rx, c[1] + fy * ry, c[2] + rz * (Math.sqrt(Math.max(0.04, 1 - fx * fx - fy * fy)) + out)];
  const bump = (S, fx, fy, out, [ax, ay, az], nl = 3, nn = 6) => blob(S, at(fx, fy, out), [ax * rx, ay * ry, az * rz], nl, nn);
  if (!fine) {
    blob(K, c, r, 6, 12);                                                              // the skull and face
    blob(K, [c[0], c[1] - 0.5 * ry, c[2] + 0.16 * rz], [0.66 * rx, 0.5 * ry, 0.74 * rz], 4, 10);   // the jaw
    for (const s of [-1, 1]) {
      bump(K, s * 0.5, -0.2, 0.0, [0.3, 0.22, 0.28], 3, 8);                            // the cheek
      bump(K, s * 0.42, 0.33, 0.08, [0.34, 0.075, 0.15], 3, 8);                        // the brow ridge
      bump(K, s * 0.42, 0.2, 0.04, [0.26, 0.06, 0.08], 2, 8);                          // the lids
      blob(K, [c[0] + s * 0.98 * rx, c[1] + 0.08 * ry, c[2] + 0.02 * rz], [0.07 * rx, 0.22 * ry, 0.13 * rz], 3, 6);   // the ear
      bump(K, s * 0.13, -0.12, 0.08, [0.1, 0.07, 0.1], 2, 6);                          // the wing of the nostril
      bump(K, s * 0.3, -0.4, 0.04, [0.07, 0.045, 0.05], 2, 5);                         // the corner of the smile
    }
    blobDir(K, at(0, 0.05, 0.12), [0, -0.55, 0.85], 0.3 * ry, 0.085 * rx, 0.1 * rz, [1, 0, 0], 3, 7);   // the nose: bridge to tip
    bump(K, 0, -0.14, 0.2, [0.12, 0.07, 0.1], 2, 6);                                    // the tip
    bump(F.s(lip), 0, -0.4, 0.04, [0.27, 0.05, 0.08], 2, 8);                           // the upper lip
    bump(F.s(lip), 0, -0.49, 0.03, [0.24, 0.055, 0.08], 2, 8);                         // the lower
    bump(K, 0, -0.74, 0.05, [0.26, 0.14, 0.18], 3, 7);                                  // the chin
    void female;
  } else {
    for (const s of [-1, 1]) {
      bump(F.s('plaster_white'), s * 0.42, 0.2, 0.1, [0.2, 0.035, 0.03], 2, 8);        // the eyeball
      bump(F.s('paint_minoan_black'), s * 0.42, 0.2, 0.135, [0.07, 0.035, 0.015], 2, 6);   // the iris
      bump(F.s('paint_minoan_black'), s * 0.42, 0.37, 0.16, [0.36, 0.022, 0.025], 2, 8);   // the painted brow
      const a = at(s * 0.62, 0.2, 0.1), b = at(s * 0.95, 0.2, 0.04);
      rodT(F.s('paint_minoan_black'), a, b, 0.018 * ry, 0.018 * ry, { seg: 4 });         // the cosmetic line to the ear
    }
    bump(F.s('paint_minoan_black'), 0, -0.445, 0.115, [0.3, 0.013, 0.018], 2, 8);      // the line of the mouth
  }
}

/** A fist or hand as one volume: centre c, the fingers' direction d, size k (the knuckles in `fine`). */
export function fist(F, c, d, k = 1, mat = 'paint_robe', fine = false) {
  if (!fine) blobDir(F.s(mat), c, d, 0.14 * k, 0.1 * k, 0.12 * k, [0, 1, 0], 3, 7);
  else for (let i = -1; i <= 2; i++) blob(F.s(mat), [c[0] + (d[0] > 0.5 ? 0 : i * 0.045 * k), c[1] - (d[0] > 0.5 ? i * 0.045 * k : 0) + 0.03 * k, c[2] + 0.075 * k], [0.032 * k, 0.032 * k, 0.04 * k], 2, 5);
}
