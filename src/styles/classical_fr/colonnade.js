// The Colonnade of Versailles (docs/settlements/versailles.md §1i): Hardouin-Mansart's bosquet of 1684–85 — a ring of thirty-two marble columns of
// different colours carrying thirty-one arches (one bay left open as the entrance), a basin with a jet at the foot of each arch, a cornice with a vase over
// each column, a paved ring walk round a central lawn.
//
// colonnade: { c: [x, z], R (the columns' ring), y (the ground) }

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall } from '../byzantine/index.js';

const MARBLES = ['marble_column', 'pavonazzetto', 'breccia_red', 'verde_antico', 'marble_pink', 'giallo'];

/** A box along a chord: from p to q (plan), width w across, y0..y1, as a closed convex solid. */
function chordBox(bag, mat, p, q, w, y0, y1) {
  const dx = q[0] - p[0], dz = q[1] - p[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * w / 2, nz = dx / L * w / 2;
  const A = [[p[0] + nx, p[1] + nz], [q[0] + nx, q[1] + nz], [q[0] - nx, q[1] - nz], [p[0] - nx, p[1] - nz]], t = [];
  const V = (a, y) => [a[0], y, a[1]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...V(A[i], y0), ...V(A[j], y0), ...V(A[j], y1), ...V(A[i], y0), ...V(A[j], y1), ...V(A[i], y1)); }
  t.push(...V(A[0], y1), ...V(A[1], y1), ...V(A[2], y1), ...V(A[0], y1), ...V(A[2], y1), ...V(A[3], y1));
  t.push(...V(A[0], y0), ...V(A[2], y0), ...V(A[1], y0), ...V(A[0], y0), ...V(A[3], y0), ...V(A[2], y0));
  bag.add(mat, fromTriangles(orientOutward(t)));
}

export function colonnade(el, { bag, col }) {
  const [cx, cz] = el.c, R = el.R ?? 14, y = el.y ?? 0, N = 32, ENTRY = 23;      // the open bay lies between columns 23 and 24 (north)
  const ang = (i) => (i + 0.5) * Math.PI * 2 / N, P = (i, r = R) => [cx + Math.cos(ang(i)) * r, cz + Math.sin(ang(i)) * r];
  const chord = 2 * R * Math.sin(Math.PI / N), SH = 3.3, CAP = 0.5, YB = y + 0.12 + 0.3 + SH + CAP, rA = chord / 2 - 0.42;
  // the ground: gravel out to the ring's outer walk, the marble walk, the lawn in the middle with a border of box
  bag.add('pebbles', lathe([[R + 4, y - 0.3], [R + 4, y + 0.06], [0.001, y + 0.06]], 48, null, cx, 0, cz));
  bag.add('marble_floor', lathe([[R + 1.3, y + 0.06], [R + 1.3, y + 0.12], [R - 2.6, y + 0.12], [R - 2.6, y + 0.06]], 48, null, cx, 0, cz));
  bag.add('terrain', lathe([[R - 3.0, y + 0.06], [R - 3.0, y + 0.1], [0.001, y + 0.1]], 40, null, cx, 0, cz));
  bag.add('lotus_leaf', lathe([[R - 2.75, y + 0.1], [R - 2.75, y + 0.38], [R - 3.0, y + 0.38], [R - 3.0, y + 0.1]], 48, null, cx, 0, cz));
  col.floor([cx - R - 4, cz - R - 4, cx + R + 4, cz + R + 4], y + 0.06);
  // the columns: a plinth and base, a shaft of coloured marble swelling a little, an Ionic capital with its volutes and abacus; a vase over each
  for (let i = 0; i < N; i++) {
    const [px, pz] = P(i), m = MARBLES[i % MARBLES.length], y0 = y + 0.06;
    bag.add('marble', box(px - 0.5, y0, pz - 0.5, px + 0.5, y0 + 0.3, pz + 0.5));
    bag.add('marble', lathe([[0.46, 0], [0.46, 0.1], [0.38, 0.14], [0.37, 0.2], [0.001, 0.2]], 12, null, px, y0 + 0.3, pz));
    bag.add(m, lathe([[0.34, 0], [0.33, SH * 0.3], [0.31, SH * 0.9], [0.28, SH]], 14, null, px, y0 + 0.5, pz));
    const yc = y0 + 0.5 + SH;
    bag.add('marble', lathe([[0.3, 0], [0.34, 0.1], [0.42, 0.28], [0.5, 0.4], [0.5, 0.46], [0.001, 0.46]], 12, null, px, yc, pz));
    col.circle(px, pz, 0.5, y, y + 4.2);
  }
  // the bays: an arch springing from the capitals, a spandrel and a frieze above (the putti are left to the surface), a cornice on modillions; a vase over each pier
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, a = P(i), b = P(j), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const yTop = YB + rA + 0.75;
    if (i !== ENTRY) {
      bag.add('marble', planarWall({ o: [mx, mz], u: [ux, uz], th: 0.9, u0: -L / 2 - 0.1, u1: L / 2 + 0.1, y0: YB - 0.02, y1: yTop, arches: [{ uc: 0, r: rA, spring: YB }] }));
      // the archivolt, a keystone with a head, on the outer face
      const nx = uz, nz = -ux, kx = mx + nx * 0.5 + (mx - cx) * 0, kz = mz + nz * 0.5;
      void kx; void kz;
      // a basin at the foot of the arch with a jet, inside the ring
      const bx = cx + (mx - cx) * (R - 1.15) / Math.hypot(mx - cx, mz - cz), bz = cz + (mz - cz) * (R - 1.15) / Math.hypot(mx - cx, mz - cz);
      bag.add('marble', lathe([[0.52, 0], [0.52, 0.34], [0.44, 0.4], [0.4, 0.34], [0.4, 0.14], [0.001, 0.14]], 12, null, bx, y + 0.12, bz));
      bag.add('water_jet', lathe([[0.03, 0.3], [0.02, 1.5], [0.001, 1.7]], 5, null, bx, y + 0.12, bz));
      col.circle(bx, bz, 0.55, y, y + 0.5);
    } else {
      // the open bay: a pair of low stone seats against the columns' feet, the lintel carried on a flat entablature
      chordBox(bag, 'marble', a, b, 0.9, YB - 0.02, yTop);
    }
    chordBox(bag, 'marble', a, b, 1.2, yTop, yTop + 0.22);
    chordBox(bag, 'marble_smooth', a, b, 1.34, yTop + 0.22, yTop + 0.4);
    // vases on the cornice over the columns, alternating a pot-à-feu and a plain urn
    const [px, pz] = P(i);
    bag.add('marble', lathe(i % 2 ? [[0.28, 0], [0.18, 0.1], [0.14, 0.25], [0.36, 0.55], [0.3, 0.85], [0.001, 1.0]] : [[0.3, 0], [0.2, 0.12], [0.34, 0.5], [0.22, 0.75], [0.1, 0.9], [0.001, 1.25]], 10, null, px, yTop + 0.4, pz));
  }
}
