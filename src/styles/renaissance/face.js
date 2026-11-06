// Helpers for façades drawn in their own plane (shared by the renaissance, venetian and baroque
// styles): a face of an axis-aligned block as a frame (u along the wall left to right seen from
// outside, y up, d outward from its plane), a collector that merges its pieces by material and
// places them with that frame, flat outlines extruded through a depth (arches, tracery, shields,
// merlons), and arch rings of voussoirs. Pieces are merged per material before they go into the
// bag, so that the hundreds of blocks of a rusticated wall add no instanced meshes of their own.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Shape, Path, ExtrudeGeometry } from '../../core/three.js';
import { box, fromTriangles } from '../../core/geom.js';

/** The frame of face f ('n' | 's' | 'e' | 'w') of rect [x0, z0, x1, z1]: { M (local u, y, d → world), L (length) }. */
export function faceFrame(rect, f, y = 0) {
  const [x0, z0, x1, z1] = rect, M = new Matrix4();
  // columns: U, Y, N (U × Y = N, so the frame keeps the faces' winding), origin at u = 0
  if (f === 'w') M.set(0, 0, -1, x0, 0, 1, 0, y, 1, 0, 0, z0, 0, 0, 0, 1);
  else if (f === 'e') M.set(0, 0, 1, x1, 0, 1, 0, y, -1, 0, 0, z1, 0, 0, 0, 1);
  else if (f === 'n') M.set(-1, 0, 0, x1, 0, 1, 0, y, 0, 0, -1, z0, 0, 0, 0, 1);
  else M.set(1, 0, 0, x0, 0, 1, 0, y, 0, 0, 1, z1, 0, 0, 0, 1);
  return { M, L: f === 'w' || f === 'e' ? z1 - z0 : x1 - x0 };
}

/** One geometry from several (positions and normals only). */
export function merge(list) {
  const gs = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0; for (const g of gs) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of gs) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return m;
}

/** Pieces by material, built in a local frame and emitted merged and placed. */
export class Local {
  constructor() { this.m = new Map(); this.free = []; }
  /** a piece emitted on its own (an axis-aligned box repeated hundreds of times: the bag may draw it as an instance) */
  loose(mat, g) { this.free.push([mat, g]); return g; }
  add(mat, g) { if (!g) return g; if (!this.m.has(mat)) this.m.set(mat, []); this.m.get(mat).push(g); return g; }
  /** a box in local coordinates (u0..u1, y0..y1, d0..d1) */
  box(mat, u0, y0, d0, u1, y1, d1) { return this.add(mat, box(Math.min(u0, u1), Math.min(y0, y1), Math.min(d0, d1), Math.max(u0, u1), Math.max(y0, y1), Math.max(d0, d1))); }
  emit(bag, M = null) {
    for (const [mat, list] of this.m) { if (!list.length) continue; const g = merge(list); if (M) g.applyMatrix4(M); bag.add(mat, g); }
    for (const [mat, g] of this.free) { if (M) g.applyMatrix4(M); bag.add(mat, g); }
    this.m.clear(); this.free = [];
  }
}

/** An outline [[u, y], …] (with holes, each [[u, y], …]) extruded from d0 to d1. */
export function ext(pts, holes = [], d0 = 0, d1 = 0.1, curve = 6) {
  const s = new Shape(pts.map(([u, y]) => ({ x: u, y })));
  for (const h of holes) s.holes.push(new Path(h.map(([u, y]) => ({ x: u, y }))));
  const g = new ExtrudeGeometry(s, { depth: d1 - d0, bevelEnabled: false, curveSegments: curve });
  g.deleteAttribute('uv');
  g.translate(0, 0, d0);
  return g.index ? g.toNonIndexed() : g;
}

/**
 * The outline of an arched opening, counter-clockwise: width w centred on uc, from y0, springing at ys.
 * kind: 'round' | 'pointed' (equilateral) | 'ogee' (the Venetian: convex then concave to a point) | 'trefoil' (a pointed head with two cusps).
 */
export function archOutline(uc, y0, w, ys, kind = 'round', n = 10) {
  const r = w / 2, pts = [[uc - r, y0], [uc + r, y0], [uc + r, ys]];
  if (kind === 'round') { for (let i = 1; i < 2 * n; i++) { const a = i / (2 * n) * Math.PI; pts.push([uc + Math.cos(a) * r, ys + Math.sin(a) * r]); } }
  else {
    // the right half from the springing (s = 0) to the crown (s = 1); the left half mirrored
    const at = (s) => {
      if (kind === 'ogee') return [r * (1 - s), r * (s < 0.5 ? Math.sin(s * Math.PI) * 0.55 : 0.55 + (1 - Math.cos((s - 0.5) * Math.PI)) * 0.75)];
      const ang = s * Math.PI / 3; let u = w * Math.cos(ang) - r, y = w * Math.sin(ang);
      if (kind === 'trefoil') { const c = Math.exp(-(((s - 0.4) / 0.13) ** 2)) * 0.2 * r; u -= c * 0.7; y -= c * 0.35; }
      return [u, y];
    };
    for (let i = 1; i <= n; i++) { const [u, y] = at(i / n); pts.push([uc + u, ys + y]); }
    for (let i = n - 1; i >= 1; i--) { const [u, y] = at(i / n); pts.push([uc - u, ys + y]); }
  }
  pts.push([uc - r, ys]);
  return pts;
}
/** The height of an arch head of width w above its springing. */
export const archRise = (w, kind = 'round') => (kind === 'round' ? w / 2 : kind === 'ogee' ? w / 2 * 1.3 : w * Math.sin(Math.PI / 3));

/** The voussoirs of a round arch about (uc, yc) from radius r0 to r1, d0..d1, n stones with joints of `gap`. */
export function voussoirs(L, mat, uc, yc, r0, r1, d0, d1, n = 9, gap = 0.04) {
  const t = r1 - r0, rr = (r0 + r1) / 2;
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI * i / n, a1 = Math.PI * (i + 1) / n, am = (a0 + a1) / 2, len = 2 * rr * Math.sin((a1 - a0) / 2) - gap;
    const g = box(-len / 2, -t / 2, d0, len / 2, t / 2, d1);
    g.rotateZ(am + Math.PI / 2); g.translate(uc + Math.cos(am) * rr, yc + Math.sin(am) * rr, 0);
    L.add(mat, g);
  }
}

/** A point (u, d) of a face frame in world plan coordinates [x, z]. */
export function toW(M, u, d) { const e = M.elements; return [e[12] + e[0] * u + e[8] * d, e[14] + e[2] * u + e[10] * d]; }
/** The world plan rectangle of the local rectangle u0..u1 × d0..d1 of a face frame. */
export function wrect(M, u0, d0, u1, d1) { const p = toW(M, u0, d0), q = toW(M, u1, d1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; }
/** A strip of quads through rows of points (each row [[x, y, z], …]), wound both ways (seen from either side). */
export function sheet(rows) {
  const t = [];
  for (let i = 0; i + 1 < rows.length; i++) for (let j = 0; j + 1 < rows[i].length; j++) {
    const a = rows[i][j], b = rows[i][j + 1], c = rows[i + 1][j + 1], d = rows[i + 1][j];
    t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  return fromTriangles(t);
}
/** The head of an arch from its right springing to its left, both included (an outline to close below as one likes). */
export function headPts(uc, ys, w, kind = 'round', n = 10) { return archOutline(uc, ys - 1, w, ys, kind, n).slice(2); }
