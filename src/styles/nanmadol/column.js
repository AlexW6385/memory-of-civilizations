// A basalt column as it lies in Nan Madol's walls (docs/settlements/nan-madol.md §13): not a stamped hexagon but a prism of five or
// six unequal sides, its corners a few degrees off the regular, its two ends not square to its length (one broken, one a little
// slanted), the whole a hair out of line. Every call makes a different prism, so that the columns of a wall are merged into one
// mesh per material and are never instanced (the arrival's draws do not grow with them). Pure geometry: no three.js objects but the
// triangle soup the caller puts in a bag (see `flush`).

import { fromTriangles, orientOutward } from '../../core/geom.js';

/**
 * Push one column's triangles (flat list of 9-number triangles) into `out`.
 * Start `p` = [x, y, z] (the centre of its first end), axis (dx, dz) horizontal, length `len`, width `w` across (the wall's face)
 * and height `h`; `caps` which ends are closed (1 start, 2 end, 3 both); `rand` is the caller's random stream. Cross-section: 5 sides (a third of them) or 6, bounding box exactly w × h.
 */
export function column(out, rand, p, dx, dz, len, w, h, caps = 3) {
  const n = rand() < 0.34 ? 5 : 6, phi = (n === 6 ? (rand() < 0.5 ? Math.PI / 6 : 0) : Math.PI / 2 * (rand() < 0.5 ? 1 : -1)) + (rand() - 0.5) * 0.35;
  const q = [];
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < n; i++) {
    const a = phi + (i + (rand() - 0.5) * 0.3) * 2 * Math.PI / n, r = 1 + (rand() - 0.5) * 0.16, x = Math.cos(a) * r, y = Math.sin(a) * r;
    q.push([x, y]);
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const sx = w / (x1 - x0), sy = h / (y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  for (const v of q) { v[0] = (v[0] - cx) * sx; v[1] = (v[1] - cy) * sy; }
  // the frame: forward f (a whisker of pitch), right r, up u
  const pitch = (rand() - 0.5) * 0.028, yaw = (rand() - 0.5) * 0.03, c = Math.cos(yaw), s = Math.sin(yaw);
  let fx = dx * c + dz * s, fz = -dx * s + dz * c;
  const fl = Math.hypot(fx, fz); fx /= fl; fz /= fl;
  let fy = pitch;
  const fn = Math.hypot(fx, fy, fz); fx /= fn; fy /= fn; fz /= fn;
  let rx = fz, rz = -fx;                                                  // right = up × f, normalised (horizontal)
  const rn = Math.hypot(rx, rz); rx /= rn; rz /= rn;
  const ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;                // up = f × right
  // the ends: each a plane a little off square (s ≤ 0.2 across the width), the first end sometimes chipped back
  const t0 = [(rand() - 0.5) * 0.2, (rand() - 0.5) * 0.2, rand() < 0.3 ? rand() * 0.06 : 0], t1 = [(rand() - 0.5) * 0.16, (rand() - 0.5) * 0.16, -rand() * 0.04];
  const ring = (z, t) => q.map(([x, y]) => { const zz = z + t[0] * x + t[1] * y + t[2]; return [p[0] + rx * x + ux * y + fx * zz, p[1] + uy * y + fy * zz, p[2] + rz * x + uz * y + fz * zz]; });
  const A = ring(0, t0), B = ring(len, t1), tri = [];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; tri.push(...A[i], ...A[j], ...B[j], ...A[i], ...B[j], ...B[i]); }
  // (an end buried in the wall is not made: caps bit 1 the start, bit 2 the end)
  if (caps & 1) for (let i = 1; i < n - 1; i++) tri.push(...A[0], ...A[i], ...A[i + 1]);
  if (caps & 2) for (let i = 1; i < n - 1; i++) tri.push(...B[0], ...B[i + 1], ...B[i]);
  orientOutward(tri);
  for (let i = 0; i < tri.length; i++) out.push(tri[i]);
}

/** A lump of rubble: a jittered bipyramid, flat or round, r its radius; at (x, y, z) with its foot sunk by `sink`. 12 triangles. */
export function lump(out, rand, x, y, z, r, flat = 0.6) {
  const ring = [], a0 = rand() * 6.283;
  for (let i = 0; i < 6; i++) { const a = a0 + (i + (rand() - 0.5) * 0.5) * Math.PI / 3, rr = r * (0.75 + rand() * 0.5); ring.push([x + Math.cos(a) * rr, y + (rand() - 0.5) * r * 0.25 * flat, z + Math.sin(a) * rr]); }
  const top = [x + (rand() - 0.5) * r * 0.3, y + r * flat * (0.7 + rand() * 0.4), z + (rand() - 0.5) * r * 0.3], bot = [x, y - r * flat * 0.5, z], tri = [];
  for (let i = 0; i < 6; i++) { const j = (i + 1) % 6; tri.push(...ring[i], ...ring[j], ...top, ...ring[j], ...ring[i], ...bot); }
  orientOutward(tri);
  for (let i = 0; i < tri.length; i++) out.push(tri[i]);
}

/** Put the triangle lists `bags` = { material: [numbers] } into the style's bag, one geometry per material. */
export function flush(bag, bags) {
  for (const [mat, t] of Object.entries(bags)) if (t.length) bag.add(mat, fromTriangles(t));
}
