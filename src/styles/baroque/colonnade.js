// Bernini's colonnade (1656–67): four rows of Tuscan/Doric columns on each curved arm, under one
// entablature (architrave, plain frieze, a cornice on mutules), a balustrade along the inner edge with a
// saint over every bay, and at each mouth a pavilion with pilasters, a cornice and the arms of Alexander VII
// (docs/settlements/baroque-rome.md §4, "Bernini's colonnade"). Built from a closer look than the first pass:
// the column has its plinth, torus, entasis, astragal, echinus and abacus; the entablature is a stack of
// courses; the pavilions have faces.
import { orientedBox } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { merge } from '../renaissance/face.js';
import { saint } from './piazza.js';

const T = 'travertine', L = 'lead', GB = 'gilt_bronze';

/** The column's profile [r, y] for height h: plinth, torus, a tapering shaft with entasis, astragal, neck, echinus, abacus. */
function columnProfile(h, r0) {
  const yb = 0.72, yt = h - 1.4, rt = r0 * 0.82, p = [[r0 * 1.28, 0], [r0 * 1.28, 0.3], [r0 * 1.16, 0.34], [r0 * 1.22, 0.45], [r0 * 1.24, 0.56], [r0 * 1.2, 0.66], [r0 * 1.02, yb]];
  for (const t of [0, 0.2, 0.45, 0.7, 0.9, 1]) p.push([r0 - (r0 - rt) * t + r0 * 0.035 * Math.sin(Math.PI * t), yb + (yt - yb) * t]);   // (entasis: a swelling of 3.5 % in the lower third)
  p.push([rt * 1.12, yt + 0.06], [rt * 1.12, yt + 0.16], [rt * 0.98, yt + 0.2], [rt * 0.98, yt + 0.36],          // astragal, neck
    [rt * 1.12, yt + 0.5], [rt * 1.3, yt + 0.72], [rt * 1.4, yt + 0.9], [rt * 1.4, yt + 0.95],                     // echinus
    [r0 * 1.5, yt + 0.95], [r0 * 1.5, h], [0.001, h]);                                                              // abacus (round: the square is lost at this distance)
  return p;
}

/** A box in the frame of a face: local (t out along `dir`, u across) from `o`, the extents t0..t1, u0..u1, y0..y1. */
function faceBox(o, dir, t0, t1, u0, u1, y0, y1) {
  const g = box(t0 - 0.05, y0, u0, t1, y1, u1);   // (starts a little inside the block it is set on)
  g.rotateY(-Math.atan2(dir[1], dir[0])); g.translate(o[0], 0, o[1]); return g;
}

/** colonnade: { c (centre of the oval), ax, bz (semi-axes), rows, depth, h, y, arms } — two curved arms of four rows of columns. */
export function colonnade(el, { bag, col }) {
  const [ox, oz] = el.c, ax = el.ax ?? 70, bz = el.bz ?? 95, rows = el.rows ?? 4, depth = el.depth ?? 14, h = el.h ?? 13, y = el.y ?? 0;
  const arms = el.arms ?? [[0.35, Math.PI - 0.55], [-Math.PI + 0.55, -0.35]];
  const prof = columnProfile(h, 0.8), damp = [[0.835, 0.72], [0.835, 1.2], [0.8, 1.26]];
  for (const [a0, a1] of arms) {
    const n = Math.round(Math.abs(a1 - a0) * (ax + bz) / 2 / 4.2);
    const pt = (a, off) => { const s = 1 + off / ((ax + bz) / 2); return [ox + Math.cos(a) * ax * s, oz - Math.sin(a) * bz * s]; };
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n;
      for (let r = 0; r < rows; r++) {
        const [x, z] = pt(a, r * depth / (rows - 1));
        bag.add(T, lathe(prof, 12, null, x, y, z)); col.circle(x, z, 0.8, y, y + h);
        bag.add('plaster_damp', lathe(damp, 12, null, x, y, z));
      }
      if (i < n) {
        const b = a0 + (a1 - a0) * (i + 1) / n, [px, pz] = pt(a, depth / 2), [qx, qz] = pt(b, depth / 2), P = [px, pz], Q = [qx, qz];
        // the entablature: architrave in two fasciae, a plain frieze, a cornice on mutules under the corona, the cymatium
        const course = (th, y0, y1, ex = 0.2) => bag.add(T, orientedBox(P, Q, th, y + h + y0, y + h + y1, ex));
        course(15.7, 0, 1.1); course(16.0, 1.1, 1.4); course(15.5, 1.4, 2.3); course(16.0, 2.3, 2.45); course(17.0, 2.7, 3.05, 0.22); course(16.6, 3.05, 3.2, 0.2);
        // (the soffit of the corona, and the mutules under it along both faces, three to a bay)
        course(16.4, 2.45, 2.7, 0.12);
        const dx = qx - px, dz = qz - pz, Lc = Math.hypot(dx, dz), ux = dx / Lc, uz = dz / Lc, nx = -uz, nz = ux;
        for (const side of [-1, 1]) for (let j = 0; j < 3; j++) {
          const t = (j + 0.5) / 3, mx = px + dx * t + nx * side * 8.28, mz = pz + dz * t + nz * side * 8.28;
          bag.add(T, orientedBox([mx - ux * 0.2, mz - uz * 0.2], [mx + ux * 0.2, mz + uz * 0.2], 0.5, y + h + 2.45, y + h + 2.7, 0.12));
        }
        bag.add(L, orientedBox(P, Q, depth + 1.6, y + h + 3.2, y + h + 4.6, 0.05));
        // the balustrade along the inner edge, a saint on a pedestal over every bay, facing the piazza
        const [sx, sz] = pt(a, -1.05), [tx, tz] = pt(b, -1.05), yt = y + h + 3.2;
        bag.add(T, orientedBox([sx, sz], [tx, tz], 0.45, yt, yt + 0.2, 0.02)); bag.add(T, orientedBox([sx, sz], [tx, tz], 0.4, yt + 1.0, yt + 1.15, 0.02));
        for (let j = 1; j < 8; j++) { const t = j / 8; bag.add(T, lathe([[0.09, 0], [0.15, 0.3], [0.08, 0.6], [0.11, 0.78], [0.1, 0.8]], 6, null, sx + (tx - sx) * t, yt + 0.2, sz + (tz - sz) * t)); }
        // the pedestal: plinth, die, cap (the saints a fifth over life size so that the line against the sky reads from the oval's mouth)
        bag.add(T, box(sx - 0.62, yt, sz - 0.62, sx + 0.62, yt + 0.28, sz + 0.62)); bag.add(T, box(sx - 0.5, yt + 0.28, sz - 0.5, sx + 0.5, yt + 1.3, sz + 0.5)); bag.add(T, box(sx - 0.6, yt + 1.3, sz - 0.6, sx + 0.6, yt + 1.55, sz + 0.6));
        const yaw = Math.atan2(ox - sx, oz - sz), k = (i * 7 + (a0 < 0 ? 3 : 0)) % 20;
        const fig = merge(saint(k)); fig.scale(1.2, 1.2, 1.2); fig.rotateY(yaw); fig.translate(sx, yt + 1.55, sz); bag.add('limestone_carved', fig);
      }
    }
    // the end pavilions: the block, pilasters on the face, the entablature carried round, the attic with the arms of Alexander VII
    for (const a of [a0, a1]) {
      const [px, pz] = pt(a, depth / 2), [qx, qz] = pt(a + (a1 > a0 ? -1 : 1) * 0.04, depth / 2);
      bag.add(T, orientedBox([px, pz], [qx, qz], depth + 4, y - 0.3, y + h + 5.5, 1.5)); col.segment([px, pz], [qx, qz], depth + 4, y, y + h + 5.5);
      const Lc = Math.hypot(qx - px, qz - pz), dir = [(qx - px) / Lc, (qz - pz) / Lc], F = [px + dir[0] * (Lc + 1.5), pz + dir[1] * (Lc + 1.5)], hw = (depth + 4) / 2;
      const fb = (t0, t1, u0, u1, y0, y1, m = T) => bag.add(m, faceBox(F, dir, t0, t1, u0, u1, y + y0, y + y1));
      // (the face is the plane t = 0; boxes stand out of it by t0..t1 > 0)
      fb(0, 0.35, -hw - 0.2, hw + 0.2, 0, 0.7);                                                     // plinth
      for (const u of [-hw + 0.3, hw - 1.6, -3.4, 2.1]) { fb(0, 0.9, u, u + 1.3, 0.7, h - 0.5); fb(0, 1.05, u - 0.12, u + 1.42, 0.7, 1.1); fb(0, 1.05, u - 0.12, u + 1.42, h - 0.9, h - 0.5); fb(0, 1.15, u - 0.22, u + 1.52, h - 0.5, h); }   // pilasters: shaft, base, necking, capital
      // (a raised frame in each side bay)
      for (const s of [-1, 1]) { const u0 = s > 0 ? 3.9 : -7.1, u1 = u0 + 3.2; fb(0, 0.3, u0, u0 + 0.3, 2.2, h - 1.8); fb(0, 0.3, u1 - 0.3, u1, 2.2, h - 1.8); fb(0, 0.3, u0, u1, 2.2, 2.5); fb(0, 0.3, u0, u1, h - 2.1, h - 1.8); fb(0, 0.15, u0 + 0.3, u1 - 0.3, 2.5, h - 2.1); }
      for (const [th, y0, y1, o] of [[hw * 2, h, h + 1.1, 0.2], [hw * 2 + 0.3, h + 1.1, h + 1.4, 0.3], [hw * 2, h + 1.4, h + 2.3, 0.2], [hw * 2 + 0.3, h + 2.3, h + 2.45, 0.35], [hw * 2 + 1.0, h + 2.7, h + 3.05, 0.65], [hw * 2 + 0.6, h + 3.05, h + 3.2, 0.5]]) fb(0, o, -th / 2, th / 2, y0, y1);
      // the attic over the middle and the arms: a shield, the three mounts and the eight-pointed star of the Chigi
      fb(0, 0.3, -3.2, 3.2, h + 3.2, h + 5.5); fb(0, 0.5, -3.5, 3.5, h + 5.5, h + 5.8);
      fb(0.3, 0.6, -1.0, 1.0, h + 3.45, h + 5.35);
      for (const [u, hh] of [[-0.62, 0.6], [0, 0.85], [0.62, 0.6]]) { const g = lathe([[0.5, 0], [0.001, hh]], 8, null, 0, 0, 0); g.translate(0.62, h + 3.6, u); g.rotateY(-Math.atan2(dir[1], dir[0])); g.translate(F[0], y, F[1]); bag.add(GB, g); }
      for (const ang of [0, Math.PI / 4]) { const g = box(0.64, -0.9, -0.07, 0.72, 0.9, 0.07); g.rotateX(ang); g.translate(0, h + 4.7, 0); g.rotateY(-Math.atan2(dir[1], dir[0])); g.translate(F[0], y, F[1]); bag.add(GB, g); const g2 = box(0.64, -0.9, -0.07, 0.72, 0.9, 0.07); g2.rotateX(ang + Math.PI / 2); g2.translate(0, h + 4.7, 0); g2.rotateY(-Math.atan2(dir[1], dir[0])); g2.translate(F[0], y, F[1]); bag.add(GB, g2); }
    }
  }
  bag.add('flagstone', box(ox - ax * 1.05, y - 0.4, oz - bz * 1.05, ox + ax * 1.05, y + 0.02, oz + bz * 1.05));
}
