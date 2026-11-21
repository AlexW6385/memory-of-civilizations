// Ragged patches of worn ground, shared by the settlements' wear.js: a patch is never one tile but a few overlapping thin irregular polygons (6–10 sides, each
// vertex jittered by a hash of its place), shrinking outward-in and each a couple of millimetres above the last, with a few small flecks scattered round its
// rim so the edge fades into the ground. Geometry only (no collision), deterministic (hashes of position, no Math.random). Used with 'earth_trodden' on
// earth and 'stone_worn' on stone (src/core/palette.js).
import { fromTriangles } from './geom.js';

function h(x, z, s) { const v = Math.sin(x * 127.1 + z * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); }

/**
 * wearPatch(out, cx, cz, a, b, ang, opts) pushes triangles (flat array, for fromTriangles) of one ragged patch: an ellipse a × b (half-sizes, m) turned by `ang`.
 * opts: y (flat height) or ground(x, z) (height under a point; each vertex follows it), lift (m above the ground, default 0.004), layers (default 3),
 * seed, flecks (default 4).
 */
export function wearPatch(out, cx, cz, a, b, ang, opts = {}) {
  const { y = 0, ground = null, lift = 0.004, layers = 3, seed = 0, flecks = 4 } = opts;
  const ca = Math.cos(ang), sa = Math.sin(ang), Y = (x, z, l) => (ground ? ground(x, z) : y) + l;
  const poly = (px, pz, ra, rb, n, l, s, wob) => {
    const pts = [];
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5 * h(px, pz, s + k)) / n * Math.PI * 2, r = 1 - wob + 2 * wob * h(px + k * 0.37, pz - k * 0.61, s + 5);
      const u = Math.cos(t) * ra * r, v = Math.sin(t) * rb * r, x = px + u * ca - v * sa, z = pz + u * sa + v * ca;
      pts.push([x, Y(x, z, l), z]);
    }
    const c = [px, Y(px, pz, l), pz];
    for (let k = 0; k < n; k++) { const p = pts[k], q = pts[(k + 1) % n]; out.push(...c, ...q, ...p); }   // wound up (normal +y)
  };
  for (let i = 0; i < layers; i++) {
    const f = 1 - i * 0.26, n = 6 + Math.floor(h(cx, cz, seed + i) * 5);
    poly(cx + (h(cx, cz, seed + 20 + i) - 0.5) * a * 0.25 * i, cz + (h(cx, cz, seed + 30 + i) - 0.5) * b * 0.25 * i, a * f, b * f, n, lift + i * 0.002, seed + i * 11, 0.28);
  }
  for (let k = 0; k < flecks; k++) {                                       // the scuffed edge: small flecks just outside the rim
    const t = h(cx, cz, seed + 40 + k) * Math.PI * 2, d = 1.05 + 0.3 * h(cx, cz, seed + 50 + k), u = Math.cos(t) * a * d, v = Math.sin(t) * b * d;
    const r = (0.07 + 0.09 * h(cx, cz, seed + 60 + k)) * Math.min(a, b) * 2;
    poly(cx + u * ca - v * sa, cz + u * sa + v * ca, r, r * 0.7, 6 + (k % 3), lift, seed + 70 + k, 0.35);
  }
}

/** A geometry of the patches given as [cx, cz, a, b, ang, opts?] with common opts. */
export function wearPatches(list, common = {}) {
  const out = [];
  list.forEach((p, i) => wearPatch(out, p[0], p[1], p[2], p[3], p[4], { seed: i * 3 + 1, ...common, ...(p[5] || {}) }));
  return fromTriangles(out);
}
