// Carving and metalwork shared by the Treasury, the Lion Gate and Grave Circle A (docs/settlements/mycenae.md §13): spirals in round-section relief,
// rosettes, studs and a stele's panels, all built in a local frame (u along the face, v up, d out of it) that a map turns into the plan.

import { Quaternion, Vector3 } from '../../core/three.js';
import { rod, lathe } from '../../core/geom.js';

const UP = new Vector3(0, 1, 0);
/** A spiral in a plane: centre (cu, cv), winding outward from radius r0 to r1 in `turns`, counter-clockwise when dir = 1; rods of radius rr between mapped points. */
export function spiral(map, cu, cv, r0, r1, turns, dir = 1, rr = 0.02, d = 0, seg = 5) {
  const out = [], N = Math.max(8, Math.round(turns * 12));
  let prev = null;
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = dir * Math.PI * 2 * turns * t + (dir > 0 ? 0 : Math.PI), r = r0 + (r1 - r0) * t;
    const p = map(cu + Math.cos(a) * r, cv + Math.sin(a) * r, d);
    if (prev) out.push(rod(prev, p, rr, seg));
    prev = p;
  }
  return out;
}
/** A straight rod between two points of the face. */
export const bar = (map, u0, v0, u1, v1, rr = 0.02, d = 0, seg = 5) => rod(map(u0, v0, d), map(u1, v1, d), rr, seg);
/** A rosette (eight lobes, a boss) lying on a surface at `pos`, its axis along the unit vector n. */
export function rosette(pos, n, r = 0.13, lobes = 8) {
  const g = lathe([[r, 0], [r, 0.022], [r * 0.36, 0.04], [r * 0.3, 0.06], [0.001, 0.07]], lobes * 2, (th) => 1 + 0.32 * Math.cos(th * lobes));
  g.applyQuaternion(new Quaternion().setFromUnitVectors(UP, new Vector3(...n).normalize()));
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}
/** A small round stud or boss (nail head) at pos facing n. */
export function stud(pos, n, r = 0.05) {
  const g = lathe([[r, 0], [r, 0.012], [r * 0.5, 0.03], [0.001, 0.035]], 6);
  g.applyQuaternion(new Quaternion().setFromUnitVectors(UP, new Vector3(...n).normalize()));
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}
