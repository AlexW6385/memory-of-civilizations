// The Lion Gate's relief (docs/settlements/mycenae.md §4.2, §14): two lionesses rampant on either side of a Minoan column on its altar, modelled as
// rounded volumes (haunch, flank, shoulder, tapering limbs, neck, head turned out, tail) raised from a slab, in a local frame (u along the wall,
// v up from the lintel, d out of the slab). A shape is placed in the plane by the caller (toPlane).

import { Matrix4 } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { mergeG } from './util.js';

const SPHERE = [[0.001, -1], [0.5, -0.866], [0.866, -0.5], [1, 0], [0.866, 0.5], [0.5, 0.866], [0.001, 1]];
/** An ellipsoid at (u, v, d) with radii (ru, rv, rd), turned by `rot` about the d axis (counter-clockwise from +u). */
function blob(c, r, rot = 0, seg = 14) {
  const g = lathe(SPHERE, seg);
  // lathe's axis is y: radii (ru, rv, rd) map to x, y, z
  g.applyMatrix4(new Matrix4().makeScale(r[0], r[1], r[2]));
  g.applyMatrix4(new Matrix4().makeRotationZ(rot));
  g.translate(c[0], c[1], c[2]);
  return g;
}
/** A tapering limb from a to b (u, v, d), radius r0 at a and r1 at b. */
function limb(a, b, r0, r1, seg = 7) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
  const g = lathe([[r0, 0], [r1, len]], seg);
  const dir = [dx / len, dy / len, dz / len], ax = [dir[2], 0, -dir[0]], s = Math.hypot(ax[0], ax[2]);
  const m = new Matrix4();
  if (s > 1e-6) m.makeRotationAxis({ x: ax[0] / s, y: 0, z: ax[2] / s, isVector3: true }, Math.acos(Math.max(-1, Math.min(1, dir[1]))));
  m.setPosition(a[0], a[1], a[2]);
  g.applyMatrix4(m);
  return g;
}

/** One lioness of the left-hand side (facing +u), mirrored for the right with s = −1. */
function lioness(s) {
  const P = (u, v, d) => [s * u, v, d], out = [], R = (a) => s * a;
  const D = 0.12;
  out.push(blob(P(-0.98, 0.62, D), [0.3, 0.32, 0.17], R(0.1)));                 // the haunch
  out.push(blob(P(-0.76, 0.86, D), [0.5, 0.25, 0.17], R(0.55)));                // the flank, rising to the shoulder
  out.push(blob(P(-0.55, 1.1, D + 0.01), [0.25, 0.29, 0.17], R(0.2)));          // the shoulder
  out.push(blob(P(-0.9, 0.8, D + 0.05), [0.14, 0.08, 0.14], R(0.6), 7));        // the muscle of the loin
  // hind leg: thigh to the hock to the paw on the ground
  out.push(limb(P(-1.0, 0.5, D), P(-1.14, 0.12, D), 0.12, 0.06));
  out.push(blob(P(-1.14, 0.06, D), [0.15, 0.06, 0.1], 0, 8));
  // the forelegs on the altar, the far one a little behind
  out.push(limb(P(-0.58, 0.98, D + 0.02), P(-0.55, 0.5, D + 0.02), 0.1, 0.066));
  out.push(limb(P(-0.76, 0.9, D - 0.01), P(-0.74, 0.5, D - 0.01), 0.085, 0.06));
  out.push(blob(P(-0.55, 0.46, D + 0.02), [0.13, 0.05, 0.1], 0, 8), blob(P(-0.74, 0.46, D - 0.01), [0.12, 0.05, 0.09], 0, 8));
  // neck and the head (restored, turned out to the visitor): skull, muzzle, jaw, ears
  out.push(blob(P(-0.52, 1.3, D + 0.02), [0.19, 0.24, 0.15], R(-0.25)));                         // the chest and the base of the neck
  out.push(limb(P(-0.5, 1.4, D + 0.02), P(-0.45, 1.7, D + 0.04), 0.15, 0.115));
  out.push(blob(P(-0.45, 1.84, D + 0.05), [0.18, 0.17, 0.14], 0, 14));
  out.push(blob(P(-0.45, 1.76, D + 0.15), [0.09, 0.08, 0.07], 0, 10));
  out.push(blob(P(-0.45, 1.68, D + 0.11), [0.095, 0.05, 0.07], 0, 8));
  out.push(blob(P(-0.45, 1.8, D + 0.2), [0.03, 0.025, 0.02], 0, 6));
  for (const e of [-1, 1]) { out.push(blob(P(-0.45 + e * 0.13, 1.99, D + 0.03), [0.05, 0.065, 0.03], R(-e * 0.4), 6)); out.push(blob(P(-0.45 + e * 0.07, 1.89, D + 0.17), [0.025, 0.02, 0.02], 0, 5)); }
  // ribs along the flank, the knee and the elbow
  for (let k = 0; k < 3; k++) out.push(blob(P(-0.95 + k * 0.17, 0.78 + k * 0.1, D + 0.1), [0.1, 0.022, 0.09], R(0.55 + 0.2), 6));
  out.push(blob(P(-0.62, 0.74, D + 0.04), [0.09, 0.09, 0.08], 0, 8), blob(P(-1.04, 0.38, D + 0.02), [0.08, 0.08, 0.07], 0, 8));
  // the tail hangs behind, tufted
  out.push(limb(P(-1.2, 0.74, D), P(-1.3, 0.5, D), 0.04, 0.03, 5), limb(P(-1.3, 0.5, D), P(-1.34, 0.3, D), 0.03, 0.028, 5), blob(P(-1.34, 0.26, D), [0.045, 0.07, 0.04], 0, 6));
  return out;
}

/** The whole relief in the local frame: the slab (thickness 0.12), the altar with mouldings, the column with its capital, the rafter ends, the lionesses. */
export function lionRelief() {
  const g = [];
  // the triangular slab, as a stack of thin steps would be crude: a prism of its outline
  const parts = [];
  parts.push(lioness(1), lioness(-1));
  // the altar: a plinth with a moulded top and a base course
  g.push(box(-0.95, 0, 0, 0.95, 0.1, 0.26), box(-0.9, 0.1, 0.03, 0.9, 0.36, 0.22), box(-0.98, 0.36, 0, 0.98, 0.44, 0.28));
  for (const u of [-0.62, -0.31, 0, 0.31, 0.62]) g.push(box(u - 0.03, 0.12, 0.22, u + 0.03, 0.34, 0.25));
  // the column, tapering downward, fluted, with the round capital: cushion and abacus
  const col = lathe([[0.15, 0.44], [0.16, 0.8], [0.185, 1.3], [0.205, 1.6], [0.17, 1.65], [0.2, 1.68], [0.3, 1.75], [0.32, 1.84], [0.3, 1.88], [0.34, 1.9], [0.34, 2.02]], 16, (th, i) => (i < 4 ? 1 + 0.05 * Math.cos(th * 10) : 1));
  col.translate(0, 0, 0.12);
  g.push(col);
  // the beam over it with four rafter ends, round
  g.push(box(-0.4, 2.02, 0, 0.4, 2.1, 0.22));
  for (const u of [-0.27, -0.09, 0.09, 0.27]) g.push(blob([u, 2.19, 0.1], [0.075, 0.075, 0.14], 0, 9));
  for (const p of parts) g.push(...p);
  return mergeG(g);
}
