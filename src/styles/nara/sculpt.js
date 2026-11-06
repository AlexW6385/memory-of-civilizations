// A sculptor's kit for the Nara figures (the attendant bodhisattvas, the guardian kings of the gate,
// the deer): the pieces of a figure are built in its own frame (x to the figure's left, y up from its
// seat or its feet, z forward), gathered by material, merged and kept per kind, then turned and set
// in place. Smooth tubes and lathes from the objects' kit; thin plates from the Japanese shapes.

import { fromTriangles, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { tube, slathe, ball, merge } from '../../objects/kit.js';
import { plate } from '../japanese/shape.js';

/** A figure under construction: add(mat, geometry), tris(mat) → a flat triangle list for plates. */
export function sculptor() {
  const parts = {}, tl = {};
  const S = {
    add(mat, g) { if (g) (parts[mat] ??= []).push(g.index ? g.toNonIndexed() : g); return g; },
    tris(mat) { return (tl[mat] ??= []); },
    tube(mat, pts, n = 10) { return S.add(mat, tube(pts, n)); },
    lathe(mat, prof, n = 16, mod = null, at = [0, 0, 0], kz = 1, kx = 1) { const g = slathe(prof, n, mod); g.scale(kx, 1, kz); g.translate(...at); return S.add(mat, g); },
    lathe1(mat, prof, n = 8, at = [0, 0, 0]) { const g = lathe(prof, n); g.translate(...at); return S.add(mat, g); },
    ball(mat, p, r, k = [1, 1, 1], n = 8, m = 6) { const g = ball(r, n, m); g.translate(0, -r, 0); g.scale(...k); g.translate(...p); return S.add(mat, g); },
    plate(mat, pts, nrm, t) { plate(S.tris(mat), pts, nrm, t); },
    /** A closed loop of tube through points (each [x, y, z]) with radii rw, rh. */
    loop(mat, pts, rw, rh = rw, n = 6) { const P = [...pts, pts[0], pts[1]].map((p) => [...p, rw, rh]); S.add(mat, tube(P, n, { capA: false, capB: false })); },
    /** Done: { mat: geometry } merged. */
    done() {
      const out = {};
      for (const [m, list] of Object.entries(tl)) if (list.length) (parts[m] ??= []).push(fromTriangles(list));
      for (const [m, list] of Object.entries(parts)) out[m] = merge(list);
      return out;
    },
  };
  return S;
}

const CACHE = new Map();
/** The figure of `key`, built once by build(S). */
export function figure(key, build) {
  let f = CACHE.get(key);
  if (!f) { const S = sculptor(); build(S); f = S.done(); CACHE.set(key, f); }
  return f;
}
/** Set a figure in place: at [x, z], y, facing dir [dx, dz], scaled s. */
export function setFigure(bag, f, at, y, dir, s = 1) {
  const yaw = Math.atan2(dir[0], dir[1]), M = new Matrix4().makeRotationY(yaw).premultiply(new Matrix4().makeTranslation(at[0], y, at[1])).multiply(new Matrix4().makeScale(s, s, s));
  for (const [m, g] of Object.entries(f)) bag.add(m, g.clone().applyMatrix4(M));
}
/** Points along a curve f(t), t in [0, 1], n segments. */
export const along = (f, n) => Array.from({ length: n + 1 }, (_, i) => f(i / n));
export const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
