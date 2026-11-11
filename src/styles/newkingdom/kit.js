// New Kingdom style kit: small helpers shared by the elements.
import { fromTriangles } from '../../core/geom.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
export const TAU = Math.PI * 2;

/** A convex polygon [[u, v]] raised d off the surface `place(u, v, d)` maps to, drawn from both sides. */
export function prism(T, poly, place, d) {
  const P = (p, w) => place(p[0], p[1], w);
  for (let j = 1; j < poly.length - 1; j++) T.push(...P(poly[0], d), ...P(poly[j], d), ...P(poly[j + 1], d), ...P(poly[0], d), ...P(poly[j + 1], d), ...P(poly[j], d));
}
/** A column of hieroglyph-like signs stacked from v1 down to v0 (convex pieces: bars, ovals, birds as wedges). */
export function glyphs(T, place, u, v0, v1, w, seed, d = 0.03) {
  const r = rng(seed);
  let v = v1 - w * 0.2;
  while (v > v0 + w * 0.4) {
    const k = r(), hh = w * (k < 0.3 ? 0.3 : k < 0.65 ? 0.6 : 0.85);
    if (v - hh < v0) break;
    if (k < 0.3) prism(T, [[u - w * 0.4, v - hh], [u + w * 0.4, v - hh], [u + w * 0.4, v], [u - w * 0.4, v]], place, d);
    else if (k < 0.65) prism(T, Array.from({ length: 8 }, (_, i) => [u + Math.cos(i / 8 * TAU) * w * 0.3, v - hh / 2 + Math.sin(i / 8 * TAU) * hh * 0.45]), place, d);
    else if (k < 0.85) prism(T, [[u - w * 0.35, v - hh], [u + w * 0.3, v - hh], [u + w * 0.4, v - hh * 0.4], [u + w * 0.15, v], [u - w * 0.2, v - hh * 0.3]], place, d);
    else { prism(T, [[u - w * 0.38, v - hh], [u - w * 0.08, v - hh], [u - w * 0.08, v], [u - w * 0.38, v]], place, d); prism(T, [[u + w * 0.08, v - hh], [u + w * 0.38, v - hh], [u + w * 0.38, v - hh * 0.3], [u + w * 0.08, v]], place, d); }
    v -= hh + w * 0.2;
  }
}
export const tris = (T) => fromTriangles(T);
/** The curved strip of a surface of revolution: angles a0…a1 about (x, z), heights v0…v1, radius rOf(v) + d. */
export function patch(T, x, z, y, rOf, a0, a1, v0, v1, d, nu = 4, nv = 1) {
  const P = (a, v) => { const r = rOf(v) + d; return [x + Math.cos(a) * r, y + v, z + Math.sin(a) * r]; };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const aA = a0 + (a1 - a0) * i / nu, aB = a0 + (a1 - a0) * (i + 1) / nu, vA = v0 + (v1 - v0) * j / nv, vB = v0 + (v1 - v0) * (j + 1) / nv;
    const p = P(aA, vA), q = P(aB, vA), r = P(aB, vB), s = P(aA, vB);
    T.push(...p, ...q, ...r, ...p, ...r, ...s, ...p, ...r, ...q, ...p, ...s, ...r);
  }
}
