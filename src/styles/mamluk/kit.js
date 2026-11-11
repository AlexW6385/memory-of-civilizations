// Shared helpers of the Mamluk Cairo elements (docs/settlements/mamluk-cairo.md §11): faces of a rectangle as frames
// (u along the face, d outward), pointed arches as extruded shapes, rings of voussoirs in alternating dark and light
// stone (ablaq), and the stepped cornice with its stalactite cells.

import { Shape, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { box, fromTriangles } from '../../core/geom.js';

export const S = 'limestone_yellow';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Both sides of a triangle soup (so that a dome or a flat sheet is seen from inside and out). */
export function dbl(t) { const f = []; for (let i = 0; i < t.length; i += 9) f.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return fromTriangles(t.concat(f)); }

/**
 * The frame of face f of rect r: O (the u = 0 point), U (the direction of u, [x, z]) and N (outward), and
 * B(u0, u1, y0, y1, d0, d1), a box in it (d from the plane of the face, outward positive).
 */
export function frame(r, f) {
  const [x0, z0, x1, z1] = r;
  const O = f === 'e' ? [x1, z0] : f === 'w' ? [x0, z0] : f === 'n' ? [x0, z0] : [x0, z1];
  const U = f === 'e' || f === 'w' ? [0, 1] : [1, 0];
  const N = f === 'e' ? [1, 0] : f === 'w' ? [-1, 0] : f === 'n' ? [0, -1] : [0, 1];
  const B = (u0, u1, y0, y1, d0, d1) => f === 's' ? box(x0 + u0, y0, z1 + d0, x0 + u1, y1, z1 + d1) : f === 'n' ? box(x0 + u0, y0, z0 - d1, x0 + u1, y1, z0 - d0)
    : f === 'e' ? box(x1 + d0, y0, z0 + u0, x1 + d1, y1, z0 + u1) : box(x0 - d1, y0, z0 + u0, x0 - d0, y1, z0 + u1);
  const P = (u, d) => [O[0] + U[0] * u + N[0] * d, O[1] + U[1] * u + N[1] * d];
  const rect = (u0, u1, d0, d1) => { const a = P(u0, d0), b = P(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { f, r, O, U, N, B, P, rect };
}

function flip(g) {
  for (const k of ['position', 'normal', 'uv']) {
    const a = g.attributes[k]; if (!a) continue;
    const s = a.itemSize, ar = a.array;
    for (let i = 0; i + 3 * s <= ar.length; i += 3 * s) for (let j = 0; j < s; j++) { const t = ar[i + s + j]; ar[i + s + j] = ar[i + 2 * s + j]; ar[i + 2 * s + j] = t; }
  }
  return g;
}
/** A polygon in the frame's (u, v = height) plane, extruded from d0 to d1 outward: a geometry in world space. */
export function polyGeo(fr, pts, d0, d1, holes = []) {
  const sh = new Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]); sh.closePath?.();
  for (const h of holes) { const p = new Shape(); p.moveTo(h[0][0], h[0][1]); for (const q of h.slice(1)) p.lineTo(q[0], q[1]); sh.holes.push(p); }
  const g = new ExtrudeGeometry(sh, { depth: Math.max(0.01, d1 - d0), bevelEnabled: false, curveSegments: 1 });
  const [Ux, Uz] = fr.U, [Nx, Nz] = fr.N, p0 = [fr.O[0] + Nx * d0, fr.O[1] + Nz * d0];
  g.applyMatrix4(new Matrix4().makeBasis({ x: Ux, y: 0, z: Uz }, { x: 0, y: 1, z: 0 }, { x: Nx, y: 0, z: Nz }).setPosition(p0[0], 0, p0[1]));
  return (-Uz * Nx + Ux * Nz) < 0 ? flip(g) : g;
}

/** The pointed arch's points (left spring to right spring) with their outward normals; u from the left base. */
export function archCurve(w, h, n = 12) {
  const r = w * 0.8, rise = Math.sqrt(r * r - (r - w / 2) ** 2), spring = Math.max(0.2, h - rise), cL = r, cR = w - r, out = [];
  for (let i = 0; i <= n; i++) { const x = (w / 2) * i / n, y = spring + Math.sqrt(Math.max(0, r * r - (x - cL) ** 2)); out.push({ p: [x, y], n: [(x - cL) / r, (y - spring) / r] }); }
  for (let i = 1; i <= n; i++) { const x = w / 2 + (w / 2) * i / n, y = spring + Math.sqrt(Math.max(0, r * r - (x - cR) ** 2)); out.push({ p: [x, y], n: [(x - cR) / r, (y - spring) / r] }); }
  return { pts: out, spring };
}
/** The filled pointed arch of width w from v0 to its apex v0 + h, left base at u0. */
export function archPoly(u0, v0, w, h, n = 8) {
  const { pts } = archCurve(w, h, n);
  return [[u0, v0], ...pts.map(({ p }) => [u0 + p[0], v0 + p[1]]), [u0 + w, v0]];
}
/** A pointed arch of voussoirs (alternating materials) of thickness `ring`, from u0 / v0, width w, height h, between d0 and d1. */
export function voussoirs(bag, fr, u0, v0, w, h, ring, d0, d1, mats = ['marble_dark', 'marble_smooth'], n = 7) {
  const { pts } = archCurve(w, h, n), m = pts.length;
  for (let i = 0; i + 1 < m; i++) {
    const a = pts[i], b = pts[i + 1], q = (c) => [u0 + c.p[0] + c.n[0] * ring, v0 + c.p[1] + c.n[1] * ring], p = (c) => [u0 + c.p[0], v0 + c.p[1]];
    bag.add(mats[i % mats.length], polyGeo(fr, [p(a), p(b), q(b), q(a)], d0, d1));
  }
  // the jambs below the springs
  for (const [uu, s] of [[u0 - ring, 0], [u0 + w, 1]]) bag.add(mats[(s ? m : 0) % mats.length], polyGeo(fr, [[uu, v0], [uu + ring, v0], [uu + ring, v0 + pts[s ? m - 1 : 0].p[1]], [uu, v0 + pts[s ? m - 1 : 0].p[1]]], d0, d1));
}
/** A plain frame (one band) round a pointed arch: ring of width `ring`, a single piece. */
export function archRing(bag, mat, fr, u0, v0, w, h, ring, d0, d1) {
  const { pts } = archCurve(w, h, 8);
  const outer = [[u0 - ring, v0], ...pts.map((c) => [u0 + c.p[0] + c.n[0] * ring, v0 + c.p[1] + c.n[1] * ring]), [u0 + w + ring, v0]];
  const inner = [[u0 + w, v0], ...pts.slice().reverse().map((c) => [u0 + c.p[0], v0 + c.p[1]]), [u0, v0]];
  bag.add(mat, polyGeo(fr, outer.concat(inner), d0, d1));
}
/** A disc (a circular window) in the frame plane. */
export function circlePoly(u, v, r, n = 12) { return Array.from({ length: n }, (_, k) => [u + Math.cos(k / n * Math.PI * 2) * r, v + Math.sin(k / n * Math.PI * 2) * r]); }

/**
 * The cornice of a stone face from u0 to u1 at height y: three stepped courses, each hung with a row of
 * stalactite cells (muqarnas), then the parapet of stepped merlons.
 */
export function cornice(bag, fr, u0, u1, y, mat = S, merlons = true) {
  const B = fr.B;
  bag.add(mat, B(u0 - 0.2, u1 + 0.2, y - 0.5, y, 0, 1.0));
  bag.add(mat, B(u0 - 0.2, u1 + 0.2, y, y + 0.28, 0, 1.2));
  const n = Math.max(1, Math.floor((u1 - u0) / 0.5));
  for (let i = 0; i < n; i++) {
    const a = u0 + i * (u1 - u0) / n, b = a + (u1 - u0) / n - 0.04;
    bag.add(mat, B(a, b, y - 1.0, y - 0.5, 0, 0.55));
    if (i % 2 === 0) bag.add(mat, B(a + 0.05, b - 0.05, y - 1.45, y - 1.0, 0, 0.28));
  }
  if (merlons) {
    bag.add(mat, B(u0, u1, y + 0.28, y + 0.85, 0.5, 0.9));
    const m = Math.max(1, Math.floor((u1 - u0) / 1.4));
    for (let i = 0; i < m; i++) { const a = u0 + i * (u1 - u0) / m + 0.1, b = a + (u1 - u0) / m - 0.45; bag.add(mat, B(a, b, y + 0.85, y + 1.55, 0.5, 0.9)); bag.add(mat, B(a + 0.15, b - 0.15, y + 1.55, y + 2.0, 0.5, 0.9)); }
  }
}
