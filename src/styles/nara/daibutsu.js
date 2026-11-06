// The Great Buddha of Tōdai-ji, Rushana (Vairocana), as at the eye-opening of 752 (docs/settlements/
// nara.md §4): bronze, about 16 m seated, on a lotus throne whose upturned petals were incised with
// the worlds of the Lotus Treasury; seated with the legs crossed, the soles turned up; the robe over
// both shoulders, open in a V on the chest, its folds over the arms and the lap; the right hand raised,
// palm out (fear not), the left on the knee, palm up (granting); the head large (the face 5.33 m, the
// eyes 1.02 m, the ears 2.54 m), the hair in tight curls over the head and its protuberance, the urna
// on the brow, three folds on the neck.

import { lathe, fromTriangles } from '../../core/geom.js';
import { tube, plate } from '../japanese/shape.js';

/** daibutsu { at, y (seat of the throne's base), dir (facing), h (the figure, seat to the top of the head), mat } */
export function daibutsu(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y ?? 0, F = el.dir || [0, 1], L = [-F[1], F[0]], s = (el.h || 15.8) / 15.8, M = el.mat || 'bronze';
  const out = [];
  const W = (lx, y, fz) => [x + (L[0] * lx + F[0] * fz) * s, y0 + y * s, z + (L[1] * lx + F[1] * fz) * s];
  const yaw = Math.atan2(F[0], F[1]);
  const lat = (profile, n, kz, lx, fz, y, mod = null) => { const g = lathe(profile.map(([r, v]) => [r * s, v * s]), n, mod); g.scale(1, 1, kz); g.rotateY(yaw); const p = W(lx, y, fz); g.translate(p[0], p[1], p[2]); bag.add(M, g); };
  /** a limb between two 3-D points (in figure coordinates), radius r0 → r1 */
  const limb = (A, B, r0, r1, n = 10) => {
    const a = W(...A), b = W(...B), dx = b[0] - a[0], dz = b[2] - a[2], hd = Math.hypot(dx, dz), d = hd > 1e-6 ? [dx / hd, dz / hd] : [F[0], F[1]];
    tube(out, a, d, [[0, 0], [hd, b[1] - a[1]]], [[r0 * s, r0 * s], [r1 * s, r1 * s]], n);
  };
  const ball = (p, r0) => { const r = r0 * s, g = lathe([[0.001, -r], [r * 0.75, -r * 0.65], [r, 0], [r * 0.75, r * 0.65], [0.001, r]], 6); const q = W(...p); g.translate(q[0], q[1], q[2]); bag.add(M, g); };

  // ---- the lotus throne: a drum, two rows of great upturned petals, the seat
  const T = 2.6;
  lat([[9.2, 0], [9.2, 0.45], [8.2, 0.6], [6.6, 0.9], [6.5, T], [0.001, T]], 40, 1, 0, 0, 0);
  for (let row = 0; row < 2; row++) for (let k = 0; k < 24; k++) {
    const a = (k + row * 0.5) / 24 * Math.PI * 2, d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], r0 = 6.6 + row * 0.35, hgt = 3.0 - row * 0.5, wid = 1.25;
    const P = (w, v, o) => [x + (d[0] * (r0 + o) + t[0] * w) * s, y0 + (0.5 + row * 0.35 + v) * s, z + (d[1] * (r0 + o) + t[1] * w) * s];
    plate(out, [P(0, 0, 0), P(wid, 0.5, 0.3), P(wid * 0.95, 1.6, 0.75), P(wid * 0.5, 2.5, 1.05), P(0, hgt, 1.2), P(-wid * 0.5, 2.5, 1.05), P(-wid * 0.95, 1.6, 0.75), P(-wid, 0.5, 0.3)], [d[0], -0.35, d[1]], 0.14 * s);
    // the incised ribs of the petal
    limb2(out, P(0, 0.3, 0.25), P(0, hgt - 0.3, 1.18), 0.06 * s);
  }
  col.circle(x, z, 9.2 * s, y0, y0 + T * s);
  const Y = T;                                                                // the figure sits on the throne
  // ---- the crossed legs under the robe, the soles turned up on the thighs
  lat([[0.001, 0], [6.0, 0], [6.25, 0.8], [5.7, 1.9], [3.6, 2.7], [0.001, 2.8]], 32, 0.6, 0, 1.3, Y, (th) => 1 + 0.025 * Math.cos(th * 13));
  for (const k of [-1, 1]) lat([[0.001, -0.4], [0.75, -0.25], [0.85, 0.05], [0.6, 0.35], [0.001, 0.45]], 10, 1.9, k * 2.5, 2.4, Y + 2.35);
  // the folds of the robe over the lap, falling in arcs from the knees
  for (let k = 0; k < 4; k++) {
    const pts = []; for (let i = 0; i <= 8; i++) { const t = -1 + 2 * i / 8; pts.push([t * (4.6 - k * 0.6), Y + 2.15 - k * 0.35 - 0.5 * (1 - t * t), 3.45 + k * 0.32 - 0.9 * t * t]); }
    for (let i = 0; i < pts.length - 1; i++) limb(pts[i], pts[i + 1], 0.13, 0.13, 6);
  }
  // ---- the body: the torso under the robe, the robe's V on the chest, the neck with its three folds
  const torso = [[0.001, 1.6], [3.35, 1.6], [3.2, 3.5], [3.3, 5.2], [3.7, 7.0], [3.85, 7.9], [3.0, 8.7], [1.6, 9.1], [0.001, 9.2]];
  lat(torso, 32, 0.66, 0, -0.3, Y);
  const front = (lx, yy) => { let r = 3.3; for (let i = 0; i < torso.length - 1; i++) if (yy >= torso[i][1] && yy <= torso[i + 1][1]) r = torso[i][0] + (torso[i + 1][0] - torso[i][0]) * (yy - torso[i][1]) / (torso[i + 1][1] - torso[i][1] || 1); return -0.3 + 0.66 * Math.sqrt(Math.max(0.02, r * r - lx * lx)); };
  for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) {
    const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8, lx = sd * (2.2 - 2.0 * t) + sd * k * 0.35, yy = 8.4 - 3.4 * t - k * 0.25; pts.push([lx, Y + yy, front(lx, yy) + 0.05]); }
    for (let i = 0; i < pts.length - 1; i++) limb(pts[i], pts[i + 1], 0.16 - k * 0.04, 0.16 - k * 0.04, 6);
  }
  for (let k = 0; k < 4; k++) {                                              // the folds across the belly
    const pts = []; for (let i = 0; i <= 6; i++) { const lx = -2.6 + 5.2 * i / 6, yy = 4.8 - k * 0.7 + 0.25 * Math.cos(lx); pts.push([lx, Y + yy, front(lx, yy) + 0.04]); }
    for (let i = 0; i < pts.length - 1; i++) limb(pts[i], pts[i + 1], 0.1, 0.1, 6);
  }
  lat([[1.5, 0], [1.55, 0.2], [1.45, 0.35], [1.5, 0.5], [1.4, 0.7], [1.45, 0.85], [1.35, 1.1], [0.001, 1.1]], 20, 0.95, 0, 0.1, Y + 8.6);
  // ---- the head: the face, the protuberance, the curls, the features, the long ears
  const head = [[0.001, 9.5], [1.1, 9.6], [1.75, 10.2], [2.05, 11.0], [2.2, 11.8], [2.25, 12.6], [2.2, 13.3], [1.9, 13.9], [1.3, 14.3], [0.001, 14.4]];
  const HZ = 0.35, KZ = 0.95;
  lat(head, 28, KZ, 0, HZ, Y);
  const top = [[0.001, 13.7], [1.45, 13.8], [1.55, 14.5], [1.25, 15.25], [0.6, 15.7], [0.001, 15.8]];
  lat(top, 20, 1, 0, HZ - 0.15, Y);
  const radius = (prof, yy) => { for (let i = 0; i < prof.length - 1; i++) if (yy >= prof[i][1] && yy <= prof[i + 1][1]) return prof[i][0] + (prof[i + 1][0] - prof[i][0]) * (yy - prof[i][1]) / (prof[i + 1][1] - prof[i][1]); return 0; };
  for (let yy = 11.5; yy < 15.65; yy += 0.36) {
    const rh = radius(head, yy) * KZ, rt = radius(top, yy), r = Math.max(rh, rt) + 0.08, cz0 = rt > rh ? HZ - 0.15 : HZ;
    const n = Math.max(6, Math.floor(2 * Math.PI * r / 0.38));
    for (let k = 0; k < n; k++) {
      const a = (k + (Math.round(yy / 0.36) % 2) * 0.5) / n * Math.PI * 2, fa = Math.cos(a);       // fa = 1 at the face
      if (yy < 12.95 && fa > (yy < 12.3 ? -0.2 : 0.35)) continue;                             // the brow and the face are bare
      ball([Math.sin(a) * r, Y + yy, cz0 + fa * r], 0.17);
    }
  }
  const face = (lx, yy) => HZ + KZ * Math.sqrt(Math.max(0.02, radius(head, yy) ** 2 - lx * lx));
  ball([0, Y + 12.55, face(0, 12.55) + 0.02], 0.22);                          // the urna
  for (const sd of [-1, 1]) {
    const brow = [], lid = [];
    for (let i = 0; i <= 5; i++) { const t = i / 5, lx = sd * (0.25 + 1.2 * t); brow.push([lx, Y + 12.25 + 0.18 * Math.sin(Math.PI * t) - 0.1 * t, face(lx, 12.3) + 0.05]); lid.push([sd * (0.35 + 1.0 * t), Y + 11.7 + 0.08 * Math.sin(Math.PI * t) + 0.05 * t, face(sd * (0.35 + 1.0 * t), 11.7) + 0.03]); }
    for (let i = 0; i < 5; i++) { limb(brow[i], brow[i + 1], 0.09, 0.09, 6); limb(lid[i], lid[i + 1], 0.07, 0.07, 6); }
    // the ear: a long lobe from the temple to the jaw
    const ex = sd * 2.12, ez = HZ + 0.1, Pp = (yy, o, f) => W(ex + sd * o, Y + yy, ez + f);
    plate(out, [Pp(12.5, 0, 0.3), Pp(12.4, 0.35, -0.2), Pp(11.4, 0.42, -0.4), Pp(10.4, 0.35, -0.3), Pp(9.95, 0.15, 0.0), Pp(10.3, 0.05, 0.25), Pp(11.6, 0.1, 0.45)], [L[0] * sd, 0, L[1] * sd], 0.28 * s);
  }
  limb([0, Y + 12.2, face(0, 12.2) - 0.05], [0, Y + 11.25, face(0, 11.25) + 0.42], 0.22, 0.32, 8);           // the nose
  for (const sd of [-1, 1]) ball([sd * 0.3, Y + 11.2, face(sd * 0.3, 11.2) + 0.25], 0.2);
  limb([-0.55, Y + 10.55, face(-0.55, 10.55) + 0.02], [0, Y + 10.5, face(0, 10.5) + 0.08], 0.09, 0.12, 6);  // the mouth
  limb([0, Y + 10.5, face(0, 10.5) + 0.08], [0.55, Y + 10.55, face(0.55, 10.55) + 0.02], 0.12, 0.09, 6);
  // ---- the arms in their sleeves: the right raised, palm out; the left on the knee, palm up
  const sh = 3.6;
  for (const sd of [-1, 1]) {
    const raised = sd > 0, S = [sd * sh, Y + 7.6, -0.3], E = raised ? [sd * 4.7, Y + 4.4, 1.3] : [sd * 4.8, Y + 4.2, 0.9];
    const Wr = raised ? [sd * 3.9, Y + 6.6, 3.5] : [sd * 4.4, Y + 2.95, 3.9];
    limb(S, E, 1.25, 1.0, 12); limb(E, Wr, 1.0, 0.55, 12);
    ball(E, 1.0);
    // the sleeve hanging from the forearm
    limb([E[0], E[1] - 0.7, E[2]], [Wr[0] + sd * 0.1, Wr[1] - (raised ? 0.9 : 0.45), Wr[2] - 0.4], 0.85, 0.45, 10);
    if (raised) {
      // the palm turned out, the four fingers up, the thumb
      const c = [sd * 3.85, Y + 7.6, 3.75], Pp = (lx, yy, fz = 0) => W(c[0] + lx, c[1] + yy, c[2] + fz);
      plate(out, [Pp(-0.85, -1.0), Pp(0.85, -1.0), Pp(0.9, 0.7), Pp(-0.9, 0.7)], [F[0], 0, F[1]], 0.5 * s);
      for (let f = 0; f < 4; f++) { const lx = -0.66 + f * 0.44; limb([c[0] + lx, c[1] + 0.6, c[2]], [c[0] + lx * 1.05, c[1] + 0.6 + (f === 0 || f === 3 ? 1.35 : 1.65), c[2] + 0.08], 0.21, 0.17, 6); }
      limb([c[0] - sd * 0.85, c[1] - 0.45, c[2] + 0.1], [c[0] - sd * 1.6, c[1] + 0.35, c[2] + 0.3], 0.24, 0.18, 6);
    } else {
      // the palm up on the knee, the fingers reaching forward over it
      const c = [sd * 4.4, Y + 2.9, 4.3], Pp = (lx, yy, fz) => W(c[0] + lx, c[1] + yy, c[2] + fz);
      plate(out, [Pp(-0.85, 0, -0.8), Pp(0.85, 0, -0.8), Pp(0.88, 0, 0.85), Pp(-0.88, 0, 0.85)], [0, 1, 0], 0.5 * s);
      for (let f = 0; f < 4; f++) { const lx = -0.66 + f * 0.44; limb([c[0] + lx, c[1], c[2] + 0.8], [c[0] + lx, c[1] - 0.35, c[2] + 0.8 + (f === 0 || f === 3 ? 1.25 : 1.5)], 0.21, 0.17, 6); }
      limb([c[0] + sd * 0.85, c[1] + 0.05, c[2] - 0.3], [c[0] + sd * 1.3, c[1] + 0.1, c[2] + 0.6], 0.24, 0.18, 6);
    }
  }
  bag.add(M, fromTriangles(out));
  col.circle(x, z, 6.5 * s, y0 + T * s, y0 + (T + 15.8) * s);
}
function limb2(out, a, b, r) { const dx = b[0] - a[0], dz = b[2] - a[2], hd = Math.hypot(dx, dz) || 1e-6; tube(out, a, [dx / hd, dz / hd], [[0, 0], [hd, b[1] - a[1]]], [[r, r], [r, r]], 5); }
