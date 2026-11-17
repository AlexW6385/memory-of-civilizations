// Nan Madol's walls (docs/settlements/nan-madol.md §5): "columnar basalt wall construction using typical
// header-and-stretcher architectural style" [stated: McCoy & Athens 2012] — courses of basalt prisms laid
// without mortar, alternately headers (the ends facing out, a close honeycomb) and stretchers (two columns
// thick along each face), the inside a core of coral rubble; the corner columns of alternate courses
// projecting. Walls run along the axes. Pure geometry helpers: nothing here knows the settlement.

import { box, fromTriangles, orientOutward } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { column, lump, flush } from './column.js';

export const R = 0.27;                    // the prism's circumradius (0.47 m flat to flat, 0.54 corner to corner)
export const C = 0.5;                     // a course's height
const FLAT = R * Math.sqrt(3);
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export const ROCK = ['granite_black', 'dolerite_spotted', 'granite_black', 'basalt'];
// the courses read as bands from afar: the stretchers dark, the headers' ends a paler grey (weathered, salt-bloomed) in a honeycomb
const ROCK_S = ['basalt', 'granite_black', 'basalt', 'basalt'], ROCK_H = ['dolerite_spotted', 'basalt', 'dolerite_spotted', 'dolerite_spotted'];

const FINE_H = ['dolerite_spotted', 'basalt', 'granite_black', 'dolerite_spotted'], FINE_S = ['basalt', 'granite_black', 'basalt', 'basalt'];
// a few lengths only, so that the prisms are instanced in few batches (draws, load time)
const LEN3 = [0.88, 1, 1.12];
const CACHE = new Map();
/** A hexagonal prism along +z from 0 to len, a vertex up (so that neighbours in a row meet flat to flat). */
export function hexPrism(len, r = R) {
  const k = len.toFixed(2) + '/' + r.toFixed(3);
  if (CACHE.has(k)) return CACHE.get(k);
  const ring = (z) => Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + i * Math.PI / 3; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
  const A = ring(0), B = ring(len), t = [];
  for (let i = 0; i < 6; i++) { const j = (i + 1) % 6; t.push(...A[i], ...A[j], ...B[j], ...A[i], ...B[j], ...B[i]); }
  for (let i = 1; i < 5; i++) t.push(...A[0], ...A[i], ...A[i + 1], ...B[0], ...B[i + 1], ...B[i]);
  const g = fromTriangles(orientOutward(t));
  CACHE.set(k, g);
  return g;
}
const M = new Matrix4(), M2 = new Matrix4();
/** Put a prism of length len with its start at (x, y, z), pointing along (dx, dz) horizontally. */
export function laid(bag, mat, len, x, y, z, dx, dz, reach = 200, r = R) {
  M.makeRotationY(Math.atan2(dx, dz)).setPosition(x, y, z);
  bag.addInstance(mat, hexPrism(len, r), M.clone(), { reach });
}

/**
 * A straight wall a → b (along an axis), thickness th, from y0, its top height above y0 at distance u from a
 * given by `top(u, L)` (or a number). Options: sides [+1, −1] the faces that show columns (+1 is the left of
 * a → b seen from above with +z south: (−uz, ux)); ends [e0, e1]: how far the wall runs on past its end points
 * (th / 2 to meet a cross wall at a corner, 0 at a free end); proj: the courses (parity 0 or 1) whose corner
 * columns project 0.2 m; r: the prism radius (islet walls use heavier columns); reach for instancing.
 */
export function cribWall(bag, { a, b, y0 = 0, th = 2.6, top = 3, seed = 1, sides = [1, -1], ends = null, proj = 0, r = R, core = true, depth = 0.9, coreMat = 'coral_rag', reach = 220, jut = 0.2, rough = 0.04, cap = false, fine = false, flare = 0 }) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, rand = rng(seed);
  const e = ends ?? [th / 2, th / 2], c = r === R ? C : r * Math.sqrt(3) + 0.03, flat = r * Math.sqrt(3);
  const T = typeof top === 'function' ? top : () => top;
  const P = (u, v) => [a[0] + ux * u - uz * v, a[1] + uz * u + ux * v];                 // along, across (left: (−uz, ux))
  const N = (u) => Math.floor((T(Math.max(0, Math.min(L, u)), L) + 1e-6) / c);
  let nmax = 0, nbase = 1e9;
  for (let u = 0; u <= L; u += 0.5) { nmax = Math.max(nmax, N(u)); nbase = Math.min(nbase, N(u)); }
  // fine: every column its own prism (column.js), merged per material; flare: from the course `nbase` up the faces step outward (the corners flaring as they rise)
  const T3 = { granite_black: [], dolerite_spotted: [], basalt: [], coral: [], coral_rag: [] };
  const fk = (k) => (flare ? flare * Math.max(0, k - nbase) : 0);
  const jit = (a, b) => a + (b - a) * rand();
  // one column of the wall: `w` across, `h` high; fine walls make an irregular prism, the rest the stamped hexagon
  const put = (mat, len, x, y, z, ddx, ddz, w, h, caps = 3) => {
    if (fine) column(T3[mat], rand, [x, y, z], ddx, ddz, len, w, h, caps);
    else laid(bag, mat, len, x, y, z, ddx, ddz, reach, r);
  };
  // the core of rubble, stepped to the courses (above nbase, where the faces flare, one slab to each course, as wide as its flared faces)
  if (core) {
    const seg = Math.max(0.5, Math.min(1.5, L / Math.ceil(L)));
    for (let u = -e[0]; u < L + e[1] - 1e-6; u += seg) {
      const u1 = Math.min(L + e[1], u + seg), n = N((u + u1) / 2);
      if (n < 1) continue;
      const slab = (k0, k1, fw) => {
        const p = P(u, -th / 2 + 0.04 - fw), q = P(u1, th / 2 - 0.04 + fw);
        bag.add(coreMat, box(Math.min(p[0], q[0]), y0 + k0 * c, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y0 + k1 * c, Math.max(p[1], q[1])));
      };
      slab(0, Math.min(n, flare ? nbase : n), 0);
      for (let k = nbase; flare && k < n; k++) slab(k, k + 1, fk(k) * 0.9);
      // the wall's crown: a pale skin of coral rubble over the core between the columns' ends, a light line against the dark courses and the sky
      if (cap) {
        const fw = fk(n - 1), p2 = P(u, -th / 2 + 0.3 - fw), q2 = P(u1, th / 2 - 0.3 + fw);
        bag.add('coral', box(Math.min(p2[0], q2[0]), y0 + n * c, Math.min(p2[1], q2[1]), Math.max(p2[0], q2[0]), y0 + n * c + 0.12, Math.max(p2[1], q2[1])));
        // fine: the crown heaped with lumps of coral rubble, between the columns' ends, so the wall's top line is ragged
        if (fine) for (let i = 0, m = Math.round(2.2 * (u1 - u)); i < m; i++) {
          const q3 = P(jit(u, u1), jit(-th / 2 + 0.45 - fw, th / 2 - 0.45 + fw));
          lump(T3[rand() < 0.5 ? 'coral' : 'coral_rag'], rand, q3[0], y0 + n * c + 0.1, q3[1], jit(0.1, 0.27), 0.65);
        }
      }
    }
  }
  for (let k = 0; k < nmax; k++) {
    const header = k % 2 === 0, yc = y0 + (k + 0.5) * c, ext = (k % 2 === proj ? jut : -0.03), f = fk(k);
    const ua = -e[0] - (e[0] ? ext + f : 0), ub = L + e[1] + (e[1] ? ext + f : 0);
    // (a fine column's height: a little under the course's, so that courses never share a face)
    const hh = () => (fine ? c * (header ? jit(1.03, 1.09) : jit(0.96, 1.02)) : 0), ww = (b0) => (fine ? b0 * jit(0.94, 1.06) : 0);
    // a free end shows the ends of columns across its thickness
    for (const [i, u0, sg] of [[0, 0, 1], [1, L, -1]]) {
      if (e[i] || N(u0) <= k) continue;
      for (let v = -th / 2 + flat / 2; v <= th / 2 - flat / 2 + 1e-6; v += flat) {
        const p = P(u0, v);
        put((fine ? (header ? FINE_H : FINE_S) : header ? ROCK_H : ROCK_S)[Math.floor(rand() * 4)], depth * LEN3[Math.floor(rand() * 3)], p[0], yc, p[1], ux * sg, uz * sg, ww(flat * 0.98), hh(), 1);
      }
    }
    for (const s of sides) {
      const nx = -uz * s, nz = ux * s;                                                  // outward
      const face = th / 2;
      if (header) {
        for (let u = ua + flat / 2; u <= ub - flat / 2 + 1e-6; ) {
          const wd = ww(flat);
          if (N(u) <= k) { u += flat; continue; }
          const p = P(u, s * face), len = depth * LEN3[Math.floor(rand() * 3)];
          const mat = (fine ? FINE_H : ROCK_H)[Math.floor(rand() * 4)], o = rand() * rough + f;
          put(mat, len, p[0] + nx * o, yc, p[1] + nz * o, -nx, -nz, wd * 1.1, hh(), 1);
          u += fine ? wd : flat;
        }
      } else {
        // two columns thick along the face: the outer row is the face
        for (let row = 0; row < 2; row++) {
          const v = s * (face - flat / 2 - row * flat);
          let u = ua;
          while (u < ub - 0.4) {
            const len = Math.min(ub - u, [2.0, 2.4, 2.8, 3.2][Math.floor(rand() * 4)] - row * 0.4);
            if (len < 0.5) break;
            if (N(u + len / 2) > k) {
              const p = P(u, v), o = (row === 0 ? rand() * rough * 0.5 : 0) + f * (row === 0 ? 1 : 0.5);
              put((fine ? FINE_S : ROCK_S)[Math.floor(rand() * 4)], len, p[0] + nx * o, yc, p[1] + nz * o, ux, uz, ww(flat), hh(), (u === ua ? 1 : 0) | (u + len + 0.02 >= ub - 0.4 ? 2 : 0));
            }
            u += len + 0.02;
          }
        }
      }
    }
  }
  if (fine) flush(bag, T3);
}

/** The wall's collider: a solid segment of its thickness up to its highest top. */
export function cribCollide(col, { a, b, th = 2.6, y0 = 0, top = 3 }, ends = null) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, e = ends ?? [th / 2, th / 2];
  const h = typeof top === 'function' ? Math.max(top(0, L), top(L / 2, L)) : top;
  col.segment([a[0] - ux * e[0], a[1] - uz * e[0]], [b[0] + ux * e[1], b[1] + uz * e[1]], th, y0, y0 + h);
}
