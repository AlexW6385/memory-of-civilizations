// New Kingdom style kit: small helpers shared by the elements.
import { fromTriangles, lathe } from '../../core/geom.js';
import { Vector3, Matrix4, BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

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

/** An ellipsoid (a unit sphere scaled): centre, radii, segments, tilted about x by `tx` (radians, about its own centre). */
export function ellip(cx, cy, cz, rx, ry, rz, seg = 12, tx = 0, tz = 0) {
  const rows = Math.max(5, Math.round(seg * 0.6));
  const prof = Array.from({ length: rows + 1 }, (_, i) => { const t = Math.PI * i / rows; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; });
  const g = lathe(prof, seg); g.scale(rx, ry, rz);
  if (tx) g.rotateX(tx);
  if (tz) g.rotateZ(tz);
  g.translate(cx, cy, cz); return g;
}
/** A tapered round bar from a to b (radius r0 at a, r1 at b). */
export function taper(a, b, r0, r1, seg = 8) {
  const A = new Vector3(...a), B = new Vector3(...b), len = A.distanceTo(B);
  const g = lathe([[r0, 0], [r1, len]], seg);
  const dir = B.clone().sub(A).normalize(), up = new Vector3(0, 1, 0), axis = up.clone().cross(dir), m = new Matrix4();
  if (axis.lengthSq() < 1e-9) { if (dir.y < 0) m.makeRotationX(Math.PI); } else m.makeRotationAxis(axis.normalize(), Math.acos(Math.min(1, Math.max(-1, up.dot(dir)))));
  m.setPosition(A); g.applyMatrix4(m); return g;
}
/** A chain of tapered bars through the points, the radius running r0 → r1 along it. */
export function curve(pts, r0, r1, seg = 6) {
  const gs = [];
  for (let i = 0; i < pts.length - 1; i++) { const t0 = i / (pts.length - 1), t1 = (i + 1) / (pts.length - 1); gs.push(taper(pts[i], pts[i + 1], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1, seg)); }
  return gs;
}
/** Of a flat triangle list keep the triangles whose horizontal normal points along N = [nx, nz] (cos > 0.5): carved signs drawn from both sides, one side wanted. */
export function keep(T, N) {
  const out = [];
  for (let i = 0; i + 8 < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, L = Math.hypot(nx, ny, nz);
    if (L > 1e-14 && (nx * N[0] + nz * N[1]) / L > 0.5) for (let k = 0; k < 9; k++) out.push(T[i + k]);
  }
  return out;
}

/** One geometry from many (flat, with normals): the pieces of one material of a repeated object, so that the object's copies are copies of a few shapes, not of dozens. */
export function joined(list) {
  const P = [], N = [];
  for (const g of list) { const q = g.index ? g.toNonIndexed() : g; P.push(...q.attributes.position.array); N.push(...q.attributes.normal.array); }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new Float32BufferAttribute(N, 3));
  return g;
}
