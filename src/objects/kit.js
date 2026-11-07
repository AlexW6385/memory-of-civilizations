// Helpers shared by the objects of use, the figures and the beasts (src/objects/): the placer that
// puts each piece as an instance of its shape, smooth tubes and lofted bodies, and the merging of
// the pieces of one material into one shape, cached, so that a figure or a beast is a handful of
// instances (one per material) rather than dozens.

import { lathe } from '../core/geom.js';
import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3, Color } from '../core/three.js';
import { MATERIALS } from '../core/palette.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * Cloth, skin and hide are each one material tinted per piece (the base of the family stands for
 * all its colours): pieces of the same shape in any of a family's colours share one prototype.
 */
const FAMILY = { cloth_: 'cloth_white', hide_: 'hide_white', skin_: 'skin_light' };
const _lin = new Color(), _base = new Color();
export function tint(mat, shade = 1) {
  for (const [pre, base] of Object.entries(FAMILY)) {
    if (!mat.startsWith(pre) || !MATERIALS[mat] || !MATERIALS[base]) continue;
    const a = _lin.set(MATERIALS[mat].color).toArray(), b = _base.set(MATERIALS[base].color).toArray();
    const sh = Array.isArray(shade) ? shade : [shade, shade, shade];
    return { base, color: [a[0] / b[0] * sh[0], a[1] / b[1] * sh[1], a[2] / b[2] * sh[2]] };
  }
  return null;
}
/** How far off an object is still drawn (m): the small things nearer. */
const REACH = { shop_sign: 160, hang_lantern: 120, laundry_pole: 150, tea_table: 120, drying_tray: 90, oar: 150, figure: 170, animal: 190, chickens: 90, pot: 120, basket: 110, sacks: 120, firewood: 110, crates: 140, barrel: 140, ladder: 140, laundry: 150, wash_line: 160, lantern: 120, goods_mat: 110, stool: 100 };
const _q = new Quaternion(), _up = new Vector3(0, 1, 0), _p = new Vector3(), _s = new Vector3();
/**
 * A placer: builds at the origin, then scales, turns and moves each piece to the object's place —
 * as an instance of the piece's shape (GeoBag.addInstance), so the same pot, limb or head in a
 * hundred places is held once. `k` scales the object further (a figure's height); `sc` = [sx, sy, sz]
 * stretches it a little (a stouter or a slighter figure, a heavier beast). put(mat, g, shade): `shade`
 * (a number or [r, g, b]) varies a tinted material's colour per object.
 */
export function placer(el, bag, k = 1, sc = null) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, s = (el.s ?? 1) * k;
  const S = sc ? [s * sc[0], s * sc[1], s * sc[2]] : [s, s, s];
  const M = new Matrix4().compose(_p.set(x, y, z), _q.setFromAxisAngle(_up, rot), _s.set(...S));
  if (!bag.addInstance) return (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const reach = REACH[el.t] ?? 230;
  return (mat, g, shade = 1) => { const t = tint(mat, shade); bag.addInstance(t ? t.base : mat, g, M, { color: t?.color ?? null, real: mat, reach }); };
}

/** Merge pieces (non-indexed position + normal) into one geometry. */
export function merge(list) {
  const gs = list.filter(Boolean).map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of gs) n += g.attributes.position.array.length;
  const pos = new Float32Array(n), nor = new Float32Array(n);
  let o = 0;
  for (const g of gs) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return m;
}

/**
 * An assembly: the pieces of an object gathered by role (a role is a material slot: 'skin', 'c1',
 * 'hide', …), each role merged into one geometry; built once per key and kept. Returns
 * { role: geometry }; put each with put(material of the role, g.clone()).
 */
const ASSEMBLIES = new Map();
export function assembly(key, build) {
  let a = ASSEMBLIES.get(key);
  if (a) return a;
  const parts = {};
  build((role, g) => { if (g) (parts[role] ??= []).push(g); });
  a = {};
  for (const [role, list] of Object.entries(parts)) a[role] = merge(list);
  ASSEMBLIES.set(key, a);
  return a;
}

/**
 * A smooth tube through points [x, y, z, rw, rh] (rw the half-width across, rh the half-height,
 * rh defaults to rw), n sides; closed at each end by a point (a radius of 0 there gives a tip, else
 * the end is capped flat-ish by a last ring at a tenth of the radius). Smooth normals, the seam
 * shared. For limbs, necks, tails, bodies.
 */
export function tube(pts, n = 8, { capA = true, capB = true } = {}) {
  const P = pts.map((p) => new Vector3(p[0], p[1], p[2])), m = P.length;
  const T = P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(m - 1, i + 1)]; return b.clone().sub(a).normalize(); });
  // frames: 'up' kept as near world +y as the tangent allows (or +z for a vertical tube), carried along
  let up = Math.abs(T[0].y) > 0.9 ? new Vector3(0, 0, -1) : new Vector3(0, 1, 0);
  const rings = [];
  for (let i = 0; i < m; i++) {
    const side = new Vector3().crossVectors(T[i], up);
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
    side.normalize();
    const u = new Vector3().crossVectors(side, T[i]).normalize();
    up = u;
    const [, , , rw, rh = rw] = pts[i], row = [];
    for (let s = 0; s < n; s++) {
      const th = s / n * Math.PI * 2, c = Math.cos(th), sn = Math.sin(th);
      row.push(P[i].clone().addScaledVector(side, c * rw).addScaledVector(u, sn * rh));
    }
    rings.push(row);
  }
  const verts = [], idx = [];
  for (const row of rings) for (const v of row) verts.push(v.x, v.y, v.z);
  const tri = (a, b, c) => idx.push(a, b, c);
  for (let i = 0; i < m - 1; i++) for (let s = 0; s < n; s++) {
    const a = i * n + s, b = i * n + (s + 1) % n, c = (i + 1) * n + (s + 1) % n, d = (i + 1) * n + s;
    tri(a, c, b); tri(a, d, c);
  }
  if (capA) { const ci = verts.length / 3; const e = P[0].clone().addScaledVector(T[0], -Math.min(pts[0][3], pts[0][4] ?? pts[0][3]) * 0.35); verts.push(e.x, e.y, e.z); for (let s = 0; s < n; s++) tri(ci, s, (s + 1) % n); }
  if (capB) { const ci = verts.length / 3, o = (m - 1) * n; const e = P[m - 1].clone().addScaledVector(T[m - 1], Math.min(pts[m - 1][3], pts[m - 1][4] ?? pts[m - 1][3]) * 0.35); verts.push(e.x, e.y, e.z); for (let s = 0; s < n; s++) tri(ci, o + (s + 1) % n, o + s); }
  return finish(verts, idx);
}
/** Indexed triangles → a non-indexed geometry with smooth normals, every face turned outward of its own local centre. */
function finish(verts, idx) {
  // orient each triangle away from the centre of its neighbourhood: the mean of the tube ring is
  // not at hand here, so use the winding test against the vertex normal computed by area weighting
  const nv = verts.length / 3, N = new Float32Array(verts.length);
  const V = (i) => [verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2]];
  for (let t = 0; t < idx.length; t += 3) {
    const a = V(idx[t]), b = V(idx[t + 1]), c = V(idx[t + 2]);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [idx[t], idx[t + 1], idx[t + 2]]) { N[i * 3] += nx; N[i * 3 + 1] += ny; N[i * 3 + 2] += nz; }
  }
  for (let i = 0; i < nv; i++) { const l = Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1; N[i * 3] /= l; N[i * 3 + 1] /= l; N[i * 3 + 2] /= l; }
  const pos = new Float32Array(idx.length * 3), nor = new Float32Array(idx.length * 3);
  for (let t = 0; t < idx.length; t++) { const i = idx[t]; pos.set(V(i), t * 3); nor.set([N[i * 3], N[i * 3 + 1], N[i * 3 + 2]], t * 3); }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/**
 * A lathe with smooth normals (shared across rows and round the seam): profile [[r, y]], `mod(th, i, r, y)`
 * scales the radius at an angle (th = 0 along +x, 3π/2 toward −z). Rows whose radius is ~0 close the ends.
 */
export function slathe(profile, seg = 12, mod = null) {
  const verts = [], idx = [], m = profile.length;
  for (let i = 0; i < m; i++) { const [r, y] = profile[i]; for (let s = 0; s < seg; s++) { const th = s / seg * Math.PI * 2, k = mod ? mod(th, i, r, y) : 1; verts.push(Math.cos(th) * r * k, y, Math.sin(th) * r * k); } }
  for (let i = 0; i < m - 1; i++) {
    for (let s = 0; s < seg; s++) {
      const a = i * seg + s, b = i * seg + (s + 1) % seg, c = (i + 1) * seg + (s + 1) % seg, d = (i + 1) * seg + s;
      idx.push(a, c, b, a, d, c);                         // the profile runs up the outside (as geom.lathe)
    }
  }
  return finish(verts, idx);
}

/** A lathe whose radius is modulated: folds (k folds round, depth growing toward the hem) and an uneven hem. */
export function folded(profile, seg, folds, depth, seed = 1) {
  const r = rng(seed), ph = r() * 6.28, ph2 = r() * 6.28, y0 = profile[0][1], y1 = profile[profile.length - 1][1];
  return slathe(profile, seg, (th, i, rr, y) => {
    const t = Math.max(0, Math.min(1, 1 - (y - y0) / ((y1 - y0) || 1)));          // 1 at the hem, 0 at the top
    return 1 + depth * t * t * (Math.cos(th * folds + ph) * 0.7 + Math.cos(th * (folds + 3) + ph2) * 0.3);
  });
}

/** A ball, a little more finely made than the old one (n round, m rows). */
export function ball(r, n = 10, m = 7) {
  return lathe(Array.from({ length: m }, (_, i) => { const t = i / (m - 1) * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);
}
