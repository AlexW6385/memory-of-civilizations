// Achaemenid reliefs (docs/settlements/persepolis.md §4, §10): the figures cut in low relief on the
// stairways of the Apadana and the jambs of the palace doors — Persian guards in the long pleated
// robe and fluted crown, Medes in the knee-length tunic and rounded cap, tribute bearers holding a
// vessel before them, the lion leaping on the bull, cypress trees, the winged disc and the sphinxes,
// the royal hero stabbing a rearing lion, rosettes and stepped merlons. Each outline is drawn
// facing +u with its feet at v = 0 and a height of 1; it is raised `d` out of the wall plane.

import { fromTriangles, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

/** Triangles of a simple polygon (ear clipping); indices into P. */
function earcut(P) {
  const idx = P.map((_, i) => i), out = [];
  let area = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0, cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inTri = (p, a, b, c) => { const d1 = cross(a, b, p), d2 = cross(b, c, p), d3 = cross(c, a, p); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
  let guard = 0;
  while (idx.length > 3 && guard++ < 4000) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length], a = P[ia], b = P[ib], c = P[ic];
      const cv = cross(a, b, c);
      if (ccw ? cv <= 0 : cv >= 0) continue;
      if (idx.some((j) => j !== ia && j !== ib && j !== ic && inTri(P[j], a, b, c))) continue;
      out.push([ia, ib, ic]); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

// ---- the outlines (u forward, v up; height 1)
export const OUTLINES = {
  // a Persian in the long robe with its pleats flaring at the hem, the fluted crown, the square beard
  persian: [[-0.14, 0], [0.13, 0], [0.11, 0.035], [0.125, 0.06], [0.085, 0.36], [0.088, 0.5], [0.15, 0.52], [0.16, 0.58], [0.085, 0.6], [0.072, 0.72],
    [0.088, 0.76], [0.1, 0.81], [0.098, 0.85], [0.118, 0.88], [0.096, 0.905], [0.09, 0.93], [0.1, 1.0], [-0.075, 1.0], [-0.068, 0.935], [-0.095, 0.9],
    [-0.105, 0.84], [-0.075, 0.79], [-0.06, 0.76], [-0.08, 0.65], [-0.092, 0.5], [-0.105, 0.42], [-0.125, 0.2], [-0.155, 0.06], [-0.165, 0.035], [-0.13, 0.03]],
  // a Mede: the tunic to the knee over trousers, the rounded felt cap with its flap behind
  mede: [[-0.11, 0], [0.12, 0], [0.1, 0.03], [0.062, 0.045], [0.06, 0.3], [0.1, 0.355], [0.082, 0.5], [0.14, 0.535], [0.142, 0.6], [0.072, 0.62],
    [0.07, 0.72], [0.09, 0.775], [0.1, 0.85], [0.117, 0.88], [0.095, 0.9], [0.09, 0.93], [0.078, 0.97], [0.03, 1.0], [-0.04, 0.99], [-0.082, 0.95],
    [-0.104, 0.86], [-0.082, 0.78], [-0.068, 0.74], [-0.08, 0.5], [-0.102, 0.36], [-0.064, 0.32], [-0.068, 0.045], [-0.11, 0.03]],
  // a tribute bearer: a Mede-like figure holding a vessel before him in both hands
  bearer: [[-0.11, 0], [0.12, 0], [0.1, 0.03], [0.062, 0.045], [0.06, 0.3], [0.1, 0.355], [0.082, 0.5], [0.075, 0.58], [0.15, 0.575], [0.19, 0.585],
    [0.215, 0.63], [0.212, 0.7], [0.19, 0.725], [0.2, 0.745], [0.14, 0.745], [0.15, 0.725], [0.125, 0.7], [0.075, 0.69], [0.07, 0.72], [0.09, 0.775],
    [0.1, 0.85], [0.117, 0.88], [0.095, 0.9], [0.09, 0.93], [0.078, 0.97], [0.03, 1.0], [-0.04, 0.99], [-0.082, 0.95], [-0.104, 0.86], [-0.082, 0.78],
    [-0.068, 0.74], [-0.08, 0.5], [-0.102, 0.36], [-0.064, 0.32], [-0.068, 0.045], [-0.11, 0.03]],
  // a ram led by the bearers (the Lydian and Cappadocian gifts), horns curled
  ram: [[-0.42, 0], [-0.36, 0], [-0.34, 0.18], [0.2, 0.18], [0.22, 0], [0.28, 0], [0.27, 0.22], [0.32, 0.3], [0.36, 0.42], [0.42, 0.45], [0.46, 0.4],
    [0.48, 0.44], [0.44, 0.52], [0.36, 0.58], [0.3, 0.56], [0.26, 0.5], [0.2, 0.46], [-0.3, 0.46], [-0.42, 0.4], [-0.46, 0.3], [-0.44, 0.2]],
  // the bull rearing, its forelegs raised
  bull: [[-0.56, 0], [-0.42, 0], [-0.38, 0.25], [-0.33, 0.42], [0.05, 0.48], [0.15, 0.5], [0.38, 0.62], [0.45, 0.58], [0.5, 0.63], [0.44, 0.7],
    [0.28, 0.68], [0.3, 0.8], [0.32, 0.92], [0.38, 0.98], [0.47, 0.96], [0.56, 1.0], [0.57, 1.08], [0.5, 1.14], [0.42, 1.18], [0.5, 1.3],
    [0.56, 1.42], [0.52, 1.43], [0.44, 1.33], [0.37, 1.24], [0.33, 1.23], [0.27, 1.23], [0.31, 1.17], [0.2, 1.12], [-0.1, 0.98], [-0.45, 0.88],
    [-0.54, 0.8], [-0.6, 0.5], [-0.57, 0.47], [-0.55, 0.6], [-0.52, 0.3], [-0.57, 0.05]],
  // the lion leaping on it from behind, its forepaws on the bull's back, its jaws in the haunch
  lion: [[-1.08, 0], [-0.92, 0], [-0.9, 0.12], [-0.8, 0.35], [-0.56, 0.6], [-0.4, 0.74], [-0.16, 0.94], [-0.12, 1.02], [-0.21, 1.02], [-0.38, 0.93],
    [-0.3, 1.02], [-0.25, 1.11], [-0.3, 1.2], [-0.38, 1.25], [-0.45, 1.3], [-0.62, 1.19], [-0.7, 1.0], [-0.85, 0.8], [-0.98, 0.66], [-1.12, 0.62],
    [-1.2, 0.5], [-1.22, 0.42], [-1.17, 0.42], [-1.12, 0.52], [-1.02, 0.56], [-1.03, 0.45], [-1.06, 0.12], [-1.1, 0.02]],
  // a cypress
  cypress: [[-0.03, 0], [0.03, 0], [0.03, 0.08], [0.11, 0.13], [0.13, 0.4], [0.105, 0.68], [0.055, 0.88], [0, 1], [-0.055, 0.88], [-0.105, 0.68], [-0.13, 0.4], [-0.11, 0.13], [-0.03, 0.08]],
  // the winged disc: the ring, the long wings, the tail spread below (width 2, centred on u = 0)
  disc: [[-1, 0.52], [-0.92, 0.64], [-0.55, 0.7], [-0.14, 0.66], [-0.13, 0.625], [-0.075, 0.68], [0, 0.7], [0.075, 0.68], [0.13, 0.625], [0.14, 0.66],
    [0.55, 0.7], [0.92, 0.64], [1, 0.52], [0.8, 0.44], [0.5, 0.42], [0.15, 0.45], [0.22, 0.2], [0.1, 0.15], [-0.1, 0.15], [-0.22, 0.2], [-0.15, 0.45], [-0.5, 0.42], [-0.8, 0.44]],
  // a sphinx seated, a winged lion with a man's bearded head under a crown
  sphinx: [[-0.5, 0], [0.36, 0], [0.36, 0.06], [0.2, 0.08], [0.22, 0.42], [0.24, 0.48], [0.29, 0.56], [0.3, 0.64], [0.28, 0.7], [0.27, 0.74],
    [0.28, 0.78], [0.29, 0.9], [0.13, 0.9], [0.13, 0.78], [0.1, 0.7], [0.08, 0.64], [0.06, 0.8], [-0.05, 0.93], [-0.2, 1.0], [-0.32, 0.97],
    [-0.24, 0.9], [-0.3, 0.82], [-0.22, 0.74], [-0.26, 0.62], [-0.2, 0.52], [-0.35, 0.46], [-0.52, 0.32]],
  // the royal hero stabbing a rampant lion that he holds by its mane (the side doors of the palaces)
  hero: [[-0.2, 0], [0.12, 0], [0.1, 0.04], [0.12, 0.07], [0.08, 0.36], [0.1, 0.5], [0.2, 0.56], [0.24, 0.6], [0.2, 0.63], [0.1, 0.62], [0.08, 0.72],
    [0.1, 0.8], [0.12, 0.88], [0.1, 0.9], [0.1, 0.96], [0.11, 1.0], [-0.08, 1.0], [-0.07, 0.94], [-0.1, 0.9], [-0.11, 0.83], [-0.07, 0.77],
    [-0.2, 0.7], [-0.32, 0.74], [-0.34, 0.7], [-0.2, 0.64], [-0.08, 0.6], [-0.1, 0.45], [-0.13, 0.2], [-0.2, 0.06], [-0.23, 0.03]],
  rampant: [[0.55, 0], [0.42, 0], [0.4, 0.2], [0.34, 0.42], [0.3, 0.6], [0.22, 0.62], [0.14, 0.7], [0.16, 0.76], [0.24, 0.74], [0.21, 0.84], [0.17, 0.9],
    [0.19, 0.96], [0.27, 1.0], [0.36, 1.0], [0.42, 0.92], [0.44, 0.78], [0.47, 0.6], [0.55, 0.4], [0.6, 0.22], [0.66, 0.3], [0.7, 0.28], [0.62, 0.12], [0.57, 0.04]],
};
const CUT = {};

/**
 * Raise an outline out of a wall: `place(u, v, w)` maps the wall's frame (u along, v up, w out)
 * to the world; the outline is scaled by `size`, mirrored when dir < 0 and set at [u0, v0].
 * Only the front and the edges are built (the back lies in the wall).
 */
// the carved lines within the figures (belts, sleeves, pleats, legs, the mane): [u0, v0, u1, v1]
const DETAILS = {
  persian: [[-0.088, 0.55, 0.086, 0.55], [-0.07, 0.72, 0.1, 0.565], [0.0, 0.07, 0.0, 0.44], [0.05, 0.075, 0.042, 0.4], [-0.06, 0.075, -0.05, 0.42], [-0.07, 0.94, 0.09, 0.94]],
  mede: [[-0.08, 0.5, 0.08, 0.5], [-0.06, 0.72, 0.12, 0.575], [0.0, 0.05, 0.0, 0.33], [-0.075, 0.87, 0.06, 0.9]],
  bearer: [[-0.08, 0.5, 0.08, 0.5], [0.0, 0.05, 0.0, 0.33], [0.145, 0.73, 0.195, 0.73], [-0.075, 0.87, 0.06, 0.9]],
  hero: [[-0.1, 0.5, 0.09, 0.5], [0.0, 0.07, 0.0, 0.45], [-0.07, 0.94, 0.1, 0.94]],
  lion: [[-0.62, 1.18, -0.5, 0.86], [-0.55, 0.62, -0.42, 0.9]],
  rampant: [[0.42, 0.92, 0.3, 0.72], [0.3, 0.6, 0.42, 0.35]],
  bull: [[0.2, 1.1, 0.28, 0.74], [-0.38, 0.42, -0.42, 0.85], [0.36, 1.06, 0.46, 1.04]],
  sphinx: [[0.02, 0.66, -0.2, 0.9], [0.0, 0.6, -0.18, 0.66], [0.14, 0.45, 0.14, 0.08]],
  disc: [[-0.9, 0.6, -0.2, 0.6], [-0.85, 0.52, -0.2, 0.53], [0.2, 0.6, 0.9, 0.6], [0.2, 0.53, 0.85, 0.52], [0, 0.42, 0, 0.18], [-0.1, 0.42, -0.14, 0.2], [0.1, 0.42, 0.14, 0.2]],
  cypress: [[0, 0.12, 0, 0.9]],
};
/** The outline moved in by e (each vertex along its corner's bisector, the mitre clamped). */
function inset(P, e) {
  let area = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  return P.map((p, i) => {
    const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length];
    const d0 = norm([p[0] - a[0], p[1] - a[1]]), d1 = norm([b[0] - p[0], b[1] - p[1]]);
    const n0 = [-d0[1] * sg, d0[0] * sg], n1 = [-d1[1] * sg, d1[0] * sg];      // inward normals
    const m = norm([n0[0] + n1[0], n0[1] + n1[1]]), c = Math.max(0.5, m[0] * n1[0] + m[1] * n1[1]);
    return [p[0] + m[0] * e / c, p[1] + m[1] * e / c];
  });
}
const norm = ([x, y]) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

/**
 * Raise an outline out of a wall: `place(u, v, w)` maps the wall's frame (u along, v up, w out)
 * to the world; the outline is scaled by `size`, mirrored when dir < 0 and set at [u0, v0]. Its
 * edges are cut on a slant (the face set in by a centimetre) so that they catch the light, and
 * the lines within it raised a little more. Only the front and the edges are built (the back
 * lies in the wall).
 */
export function relief(bag, mat, kind, place, u0, v0, size, dir = 1, d = 0.06) {
  const P = OUTLINES[kind], tri = (CUT[kind] ??= earcut(P)), T = [], key = kind + ':' + size;
  const F = (INS[key] ??= inset(P, Math.min(0.012, 0.016 * size) / size));
  const V = ([u, v], w) => place(u0 + dir * u * size, v0 + v * size, w);
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]], dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const n = sub(place(0, 0, 1), place(0, 0, 0));
  const [i0, i1, i2] = tri[0], ccw = dot(cross(sub(V(P[i1], d), V(P[i0], d)), sub(V(P[i2], d), V(P[i0], d))), n) > 0;
  for (const [a, b, c] of tri) if (ccw) T.push(...V(F[a], d), ...V(F[b], d), ...V(F[c], d)); else T.push(...V(F[a], d), ...V(F[c], d), ...V(F[b], d));
  for (let i = 0; i < P.length; i++) {
    const j = (i + 1) % P.length, a0 = V(P[i], 0), b0 = V(P[j], 0), a1 = V(F[i], d), b1 = V(F[j], d);
    if (ccw) T.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1); else T.push(...a0, ...b1, ...b0, ...a0, ...a1, ...b1);
  }
  bag.add(mat, fromTriangles(T));
  for (const [ua, va, ub, vb] of DETAILS[kind] || []) strip(bag, mat, place, u0 + dir * ua * size, v0 + va * size, u0 + dir * ub * size, v0 + vb * size, Math.max(0.008, 0.016 * size), d + 0.01);
}
const INS = {};

/** A strip raised out of the wall from (ua, va) to (ub, vb), `wd` wide (a spear, a band, a feather row). */
export function strip(bag, mat, place, ua, va, ub, vb, wd, d) {
  const L = Math.hypot(ub - ua, vb - va), nu = -(vb - va) / L * wd / 2, nv = (ub - ua) / L * wd / 2;
  const q = [[ua - nu, va - nv], [ub - nu, vb - nv], [ub + nu, vb + nv], [ua + nu, va + nv]];
  const T = [], V = ([u, v], w) => place(u, v, w);
  const sub = (p, r) => [p[0] - r[0], p[1] - r[1], p[2] - r[2]], cross = (p, r) => [p[1] * r[2] - p[2] * r[1], p[2] * r[0] - p[0] * r[2], p[0] * r[1] - p[1] * r[0]], dot = (p, r) => p[0] * r[0] + p[1] * r[1] + p[2] * r[2];
  const n = sub(place(0, 0, 1), place(0, 0, 0)), ccw = dot(cross(sub(V(q[1], d), V(q[0], d)), sub(V(q[2], d), V(q[0], d))), n) > 0;
  const tri = [[0, 1, 2], [0, 2, 3]];
  for (const [a, b, c] of tri) if (ccw) T.push(...V(q[a], d), ...V(q[b], d), ...V(q[c], d)); else T.push(...V(q[a], d), ...V(q[c], d), ...V(q[b], d));
  for (let i = 0; i < 4; i++) {
    const a0 = V(q[i], 0), b0 = V(q[(i + 1) % 4], 0), a1 = V(q[i], d), b1 = V(q[(i + 1) % 4], d);
    if (ccw) T.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1); else T.push(...a0, ...b1, ...b0, ...a0, ...a1, ...b1);
  }
  bag.add(mat, fromTriangles(T));
}

/** A twelve-petalled rosette of radius r at (u, v), standing d out of the wall. */
const ROS = {};
export function rosette(bag, mat, place, u, v, r, d = 0.04) {
  const key = r + ':' + d;
  // built facing +y about the origin, then turned into the wall's frame
  const g0 = (ROS[key] ??= lathe([[r * 0.98, 0], [r, d * 0.4], [r * 0.82, d * 0.75], [r * 0.35, d * 0.8], [r * 0.3, d], [0.001, d * 1.05]], 12, (th, i) => (i < 3 ? 1 - 0.18 * Math.abs(Math.sin(th * 6)) : 1)));
  const g = g0.clone(), o = place(u, v, 0), eu = sub3(place(u + 1, v, 0), o), ew = sub3(place(u, v, 1), o);
  let ev = sub3(place(u, v + 1, 0), o);
  // keep the frame right-handed (the rosette is symmetric, so its mirror image is itself)
  const det = eu[0] * (ew[1] * ev[2] - ew[2] * ev[1]) - eu[1] * (ew[0] * ev[2] - ew[2] * ev[0]) + eu[2] * (ew[0] * ev[1] - ew[1] * ev[0]);
  if (det < 0) ev = ev.map((c) => -c);
  // lathe x → eu, y → ew, z → ev
  g.applyMatrix4(new Matrix4().fromArray([eu[0], eu[1], eu[2], 0, ew[0], ew[1], ew[2], 0, ev[0], ev[1], ev[2], 0, o[0], o[1], o[2], 1]));
  bag.add(mat, g);
}
const sub3 = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
