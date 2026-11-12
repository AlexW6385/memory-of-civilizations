// The planting a village street shows over its walls (docs/settlements/bali-village.md §3, §10): banana clumps (pisang), the commonest
// garden plant of a Balinese compound, a papaya, and a hibiscus hedge. Geometry of a few lathes and double-sided leaf blades; cheap.
import { lathe, fromTriangles } from '../../core/geom.js';
import { rng, TAU } from './kit.js';

/** A broad drooping leaf from (x, y, z) outward along angle a: length L, width w, arching over by `droop`, both faces. */
function blade(out, x, y, z, a, L, w, droop, n = 5) {
  const ca = Math.cos(a), sa = Math.sin(a), pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, d = L * t, hw = w * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.04)) * (1 - 0.35 * t) * 0.5;
    const cx = x + ca * d, cz = z + sa * d, cy = y + L * 0.55 * t - droop * t * t * L;
    pts.push([[cx - sa * hw, cy, cz + ca * hw], [cx + sa * hw, cy, cz - ca * hw]]);
  }
  for (let i = 0; i < n; i++) {
    const [a0, b0] = pts[i], [a1, b1] = pts[i + 1];
    out.push(...a0, ...a1, ...b0, ...b0, ...a1, ...b1, ...a0, ...b0, ...a1, ...b0, ...b1, ...a1);
  }
}
/** bali_banana: { at: [x, z], y, seed, n (plants in the clump), h } — pseudo-stems of rolled leaf-sheaths with a fan of long drooping leaves, a hanging bunch on one. */
export function banana(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = rng(el.seed ?? 1), n = el.n ?? 3, T = [];
  for (let k = 0; k < n; k++) {
    const a0 = r() * TAU, d = k ? 0.5 + r() * 0.7 : 0, px = x + Math.cos(a0) * d, pz = z + Math.sin(a0) * d, h = (el.h ?? 3.0) * (0.75 + r() * 0.35), sr = 0.1 + r() * 0.04;
    bag.add('bark_olive', lathe([[sr * 1.5, 0], [sr * 1.1, h * 0.15], [sr, h * 0.7], [sr * 0.85, h]], 7, null, px, y, pz));
    const nl = 7 + Math.floor(r() * 3);
    for (let i = 0; i < nl; i++) blade(T, px, y + h - 0.05, pz, i / nl * TAU + r() * 0.5, 2.0 + r() * 0.8, 0.7 + r() * 0.25, 0.28 + r() * 0.2);
    if (k === 0) { const a = r() * TAU; bag.add('cloth_maroon', lathe([[0.001, 0], [0.1, 0.1], [0.06, 0.36], [0.001, 0.4]], 6, null, px + Math.cos(a) * 0.42, y + h - 0.7, pz + Math.sin(a) * 0.42)); for (let q = 0; q < 3; q++) bag.add('glaze_yellow', lathe([[0.001, 0], [0.05, 0.1], [0.045, 0.3], [0.001, 0.34]], 5, null, px + Math.cos(a) * (0.4 + q * 0.07), y + h - 1.0 - q * 0.1, pz + Math.sin(a) * (0.4 + q * 0.07))); }
  }
  bag.add('palm_leaf', fromTriangles(T));
  col.circle(x, z, 0.5, y, y + 2.5);
}
