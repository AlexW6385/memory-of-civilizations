// A small kit for modelled volumes (docs/settlements/thebes.md §14): rounded limbs and horns as tubes along a spline, heads and bodies as rows of
// superellipse sections, ellipsoids turned any way; the pieces gathered per material (`Parts`) and handed to the bag as one geometry each.
// Everything is a function of its inputs (and of `hash` of a piece's own place): the same plan builds the same geometry every time.
import { BufferGeometry, Float32BufferAttribute, Matrix4, Vector3 } from '../../core/three.js';
import { place } from '../../core/geom.js';
import { loft, ring } from '../egyptian/objects.js';

export const TAU = Math.PI * 2;
const X = [1, 0, 0], Y = [0, 1, 0];

/** A number in [0, 1) from up to three inputs (their millimetres): the variation of one piece, never a shared counter. */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.round(a * 1000) | 0, 0x9e3779b1) ^ Math.imul((Math.round(b * 1000) | 0) + 0x7f4a7c15, 0x85ebca6b) ^ Math.imul((Math.round(c * 1000) | 0) + 0x165667b1, 0xc2b2ae35);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** The pieces of one object by material; `emit` joins each material's into one geometry, placed, and adds it to the bag. */
export class Parts {
  constructor() { this.m = new Map(); }
  add(mat, g) { if (!g) return; if (!this.m.has(mat)) this.m.set(mat, []); this.m.get(mat).push(g); }
  get tris() { let n = 0; for (const l of this.m.values()) for (const g of l) n += g.attributes.position.count / 3; return n; }
  emit(bag, x = 0, y = 0, z = 0, yaw = 0, s = 1) {
    for (const [mat, list] of this.m) {
      const P = [], N = [];
      for (const g of list) { const q = g.index ? g.toNonIndexed() : g; for (const v of q.attributes.position.array) P.push(v); for (const v of q.attributes.normal.array) N.push(v); }
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(P, 3));
      g.setAttribute('normal', new Float32BufferAttribute(N, 3));
      place(g, x, y, z, yaw, s);
      bag.add(mat, g);
    }
  }
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cr = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/** Catmull–Rom through control rows (any width), `seg` steps between each pair. */
export function spline(ctrl, seg = 3) {
  const out = [], n = ctrl.length, w = ctrl[0].length;
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < seg; k++) {
    const t = k / seg, p = [];
    for (let c = 0; c < w; c++) p.push(cr(ctrl[Math.max(0, i - 1)][c], ctrl[i][c], ctrl[i + 1][c], ctrl[Math.min(n - 1, i + 2)][c], t));
    out.push(p);
  }
  out.push(ctrl[n - 1].slice());
  return out;
}

/**
 * A tube along a smooth path: control rows [x, y, z, a, b] (a the half-width across the path's side, b the half-height; for a path along z a is x, b is y; for
 * one going up a is x, b is z), the section a superellipse of exponent `p`. `ridge(t, theta)` scales the radius (rings of a horn, the flutes of a leg).
 */
export function tube(ctrl, { seg = 3, n = 12, caps = [true, true], p = 2, ridge = null } = {}) {
  const pts = spline(ctrl, seg), m = pts.length, T = [];
  for (let i = 0; i < m; i++) T.push(unit(sub(pts[Math.min(m - 1, i + 1)], pts[Math.max(0, i - 1)])));
  let u = unit(cross(Math.abs(T[0][1]) > 0.9 ? [0, 0, 1] : Y, T[0])), rings = [];
  for (let i = 0; i < m; i++) {
    if (i) { const d = dot(u, T[i]); u = unit([u[0] - T[i][0] * d, u[1] - T[i][1] * d, u[2] - T[i][2] * d]); }
    const v = cross(T[i], u), [px, py, pz, a, b] = pts[i], A = Math.max(0.002, a), B = Math.max(0.002, b), ring_ = [];
    for (let j = 0; j < n; j++) {
      const th = j / n * TAU, c = Math.cos(th), s = Math.sin(th), k = (Math.abs(c) ** p + Math.abs(s) ** p) ** (-1 / p) * (ridge ? ridge(i / (m - 1), th) : 1);
      ring_.push([px + (u[0] * c * A + v[0] * s * B) * k, py + (u[1] * c * A + v[1] * s * B) * k, pz + (u[2] * c * A + v[2] * s * B) * k]);
    }
    rings.push(ring_);
  }
  return loft(rings, caps);
}

/**
 * Sections along z (a head, a body, a paw): rows [z, yTop, yBottom, half-width, cx = 0]; the section a superellipse of exponent `p`; splined between the rows.
 */
export function rowsZ(rows, { seg = 2, n = 16, p = 2.3, caps = [true, true] } = {}) {
  const R = spline(rows.map(([z, t, b, w, cx = 0]) => [z, t, b, w, cx]), seg);
  return loft(R.map(([z, t, b, w, cx]) => ring([cx, (t + b) / 2, z], X, Y, Math.max(0.002, w), Math.max(0.002, (t - b) / 2), n, (th) => (Math.abs(Math.cos(th)) ** p + Math.abs(Math.sin(th)) ** p) ** (-1 / p))), caps);
}
/** The same along y (a torso, a neck): rows [y, zFront, zBack, half-width, cx = 0] with the front toward +z. */
export function rowsY(rows, { seg = 2, n = 16, p = 2.3, caps = [true, true] } = {}) {
  const R = spline(rows.map(([y, f, bk, w, cx = 0]) => [y, f, bk, w, cx]), seg);
  return loft(R.map(([y, f, bk, w, cx]) => ring([cx, y, (f + bk) / 2], X, [0, 0, 1], Math.max(0.002, w), Math.max(0.002, (f - bk) / 2), n, (th) => (Math.abs(Math.cos(th)) ** p + Math.abs(Math.sin(th)) ** p) ** (-1 / p))), caps);
}

/** An ellipsoid: centre, radii, turned by `rot` [rx, ry, rz] radians (about its own centre; the order x, y, z). */
export function ell(c, r, rot = null, seg = 10, rows = 6) {
  const R = [];
  for (let i = 1; i < rows; i++) { const q = -Math.PI / 2 + Math.PI * i / rows; R.push(ring([0, Math.sin(q) * r[1], 0], X, [0, 0, 1], Math.cos(q) * r[0], Math.cos(q) * r[2], seg)); }
  const g = loft([[[0, -r[1], 0]].concat(Array(seg - 1).fill([0, -r[1], 0])), ...R, [[0, r[1], 0]].concat(Array(seg - 1).fill([0, r[1], 0]))], [false, false]);
  if (rot) { const M = new Matrix4().makeRotationZ(rot[2]); M.premultiply(new Matrix4().makeRotationX(rot[0])); M.premultiply(new Matrix4().makeRotationY(rot[1])); g.applyMatrix4(M); }
  g.translate(c[0], c[1], c[2]);
  return g;
}
export const V3 = (a) => new Vector3(...a);
