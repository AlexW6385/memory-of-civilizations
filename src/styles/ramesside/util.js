// Small tools of the Ramesside style: seeded random, geometry merging, a box minus boxes (the rock-cut halls are
// voids in a mass of rock), polygon prisms (reliefs), extruded profiles (cornices).

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { fromTriangles, box } from '../../core/geom.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** Merge geometries (any mix of indexed and not) into one non-indexed geometry with position and normal. */
export function mergeLocal(list) {
  list = list.filter(Boolean).map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const out = new BufferGeometry();
  out.setAttribute('position', new Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return out;
}

/** Turn a geometry a quarter turn so that local −z (the old sanctuary direction) points to world −x: (x, z) → (z, −x). */
export function turnQuarter(g) {
  const P = g.attributes.position.array, N = g.attributes.normal.array;
  for (let i = 0; i < P.length; i += 3) {
    const x = P[i], z = P[i + 2]; P[i] = z; P[i + 2] = -x;
    const nx = N[i], nz = N[i + 2]; N[i] = nz; N[i + 2] = -nx;
  }
  g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
  return g;
}
/** A bag that turns what is added to it a quarter turn (turnQuarter) and passes it on. */
export const turnedBag = (bag) => ({ add: (m, g) => bag.add(m, turnQuarter(g.index ? g.toNonIndexed() : g)) });

/** Box [x0,y0,z0,x1,y1,z1] minus box v: up to six boxes. */
export function minus(b, v) {
  if (v[0] >= b[3] || v[3] <= b[0] || v[1] >= b[4] || v[4] <= b[1] || v[2] >= b[5] || v[5] <= b[2]) return [b];
  const out = [];
  let [x0, y0, z0, x1, y1, z1] = b;
  if (v[0] > x0) { out.push([x0, y0, z0, v[0], y1, z1]); x0 = v[0]; }
  if (v[3] < x1) { out.push([v[3], y0, z0, x1, y1, z1]); x1 = v[3]; }
  if (v[1] > y0) { out.push([x0, y0, z0, x1, v[1], z1]); y0 = v[1]; }
  if (v[4] < y1) { out.push([x0, v[4], z0, x1, y1, z1]); y1 = v[4]; }
  if (v[2] > z0) { out.push([x0, y0, z0, x1, y1, v[2]]); z0 = v[2]; }
  if (v[5] < z1) { out.push([x0, y0, v[5], x1, y1, z1]); }
  return out;
}
/** A list of boxes minus a list of voids. */
export const carve = (boxes, voids) => voids.reduce((L, v) => L.flatMap((b) => minus(b, v)), boxes);
export const grow = (v, e) => [v[0] - e, v[1] - e, v[2] - e, v[3] + e, v[4] + e, v[5] + e];

/**
 * A mass of rock with rooms cut in it: `outer` boxes minus `voids` (each [x0,y0,z0,x1,y1,z1]); the rock's own faces
 * stand 4 cm off the room's, and a lining of dressed stone (floor, walls, ceiling) fills the gap, so that the rooms
 * take a different material from the cliff outside.
 */
export function rockWithRooms(bag, outer, voids, { rock = 'sandstone_yellow', wall = 'sandstone_dressed', floor = 'sandstone_floor', skip = [] } = {}) {
  const E = 0.04, big = voids.map((v) => grow(v, E));
  for (const b of carve(outer, big)) if (b[3] - b[0] > 1e-4 && b[4] - b[1] > 1e-4 && b[5] - b[2] > 1e-4) bag.add(rock, box(...b));
  voids.forEach((v, i) => {
    for (const s of carve([big[i]], voids)) {
      if (s[3] - s[0] < 1e-4 || s[4] - s[1] < 1e-4 || s[5] - s[2] < 1e-4) continue;
      bag.add(s[4] <= v[1] + 1e-6 ? floor : wall, box(...s));
    }
  });
  void skip;
}

/** Ear-clipping triangulation of a simple polygon of [u, v] points: triples of indices. */
export function earClip(P) {
  const idx = P.map((_, i) => i), out = [];
  let area = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0, cr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inside = (p, a, b, c) => { const d1 = cr(a, b, p), d2 = cr(b, c, p), d3 = cr(c, a, p); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
  for (let guard = 0; idx.length > 3 && guard < 3000; guard++) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length], cv = cr(P[ia], P[ib], P[ic]);
      if (ccw ? cv <= 0 : cv >= 0) continue;
      if (idx.some((j) => j !== ia && j !== ib && j !== ic && inside(P[j], P[ia], P[ib], P[ic]))) continue;
      out.push([ia, ib, ic]); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push(idx.slice());
  return out;
}
const area2 = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a; };

/**
 * A polygon [[u, v]] extruded between `d0` and `d1` along the face's normal: `at(u, v, d)` maps to 3-D. Both faces and the sides,
 * every triangle seen from outside (the polygon may run either way, the face may be mirrored: `flip` swaps the winding).
 */
export function prismTris(poly, at, d0, d1, flip) {
  if (flip === undefined) {
    const o = at(0, 0, 0), a = at(1, 0, 0), b = at(0, 1, 0), c = at(0, 0, 1), u = a.map((v, i) => v - o[i]), v = b.map((w, i) => w - o[i]), w = c.map((q, i) => q - o[i]);
    flip = u[0] * (v[1] * w[2] - v[2] * w[1]) - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0]) < 0;     // a mirrored mapping turns the winding
  }
  const T = [], ccw = area2(poly) > 0, P = ccw ? poly : poly.slice().reverse(), tri = earClip(P);
  const A = (p, d) => at(p[0], p[1], d);
  const f = (a, b, c) => (flip ? [c, b, a] : [a, b, c]);
  for (const [a, b, c] of tri) {
    const q = f(A(P[a], d1), A(P[b], d1), A(P[c], d1)); T.push(...q[0], ...q[1], ...q[2]);
    const r = f(A(P[a], d0), A(P[c], d0), A(P[b], d0)); T.push(...r[0], ...r[1], ...r[2]);
  }
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], q = [A(a, d0), A(b, d0), A(b, d1), A(a, d1)];
    const t1 = f(q[0], q[1], q[2]), t2 = f(q[0], q[2], q[3]);
    T.push(...t1[0], ...t1[1], ...t1[2], ...t2[0], ...t2[1], ...t2[2]);
  }
  return T;
}
export const prism = (poly, at, d0, d1, flip) => fromTriangles(prismTris(poly, at, d0, d1, flip));

/** A profile [[u, v]] (u outward, v up) extruded along z from z0 to z1 (x = x0 + u·dir, y = y0 + v): a cornice, a moulding. */
export function extrudeProfile(profile, x0, y0, z0, z1, dir = 1) {
  const P = area2(profile) > 0 ? profile : profile.slice().reverse();
  // (the solid is wound outward for dir = +1; mirrored in x for −1)
  return prism(P, (u, v, d) => [x0 + u * dir, y0 + v, d], z0, z1, dir < 0);
}
