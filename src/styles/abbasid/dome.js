// The Green Dome's tower (docs/settlements/abbasid-baghdad.md §14): al-Khatib's account gives two stacked majlis, the lower 20 cubits
// square and high under its own dome, the upper under the green dome, the horseman on top. Local frame centred on the tower, floor y.

import { box, fromTriangles, lathe } from '../../core/geom.js';
import { wallRun, domeShell, archBand, stuccoPanel, polyGeo, archCurve } from './kit.js';

export const HS = 5.0, TH = 2.0, T0 = 19, T1 = 32, SPRING = 10.4;       // the chamber's inner half-width, wall thickness, tower top, drum top, the lower dome's springing (above the floor y)
const SQ = Math.SQRT2;

/** The ceiling of the lower majlis: spherical pendentives from the square's corners to a circle, a shallow pointed saucer above. Returns its height at (x, z). */
export function ceilY(y, x, z) {
  const r = Math.hypot(x, z), c = y + SPRING;
  if (r >= HS) return c + Math.sqrt(Math.max(0, (HS * SQ) ** 2 - r * r));
  const Rc = (HS * HS + 4) / 4;
  return c + 5 + Math.sqrt(Rc * Rc - r * r) - (Rc - 2);
}
function ceiling(bag, y) {
  const c = y + SPRING, R = HS * SQ, n = 96, rows = 18, tris = [];
  const hMax = Math.sqrt(R * R - HS * HS);                                  // 5: where the sphere's radius has fallen to the circle
  const P = (i, j) => {
    const t = (i / n) * Math.PI * 2, h = (j / rows) * hMax, r = Math.sqrt(R * R - h * h);
    return [Math.cos(t) * r, c + h, Math.sin(t) * r];
  };
  const inside = (p) => Math.abs(p[0]) <= HS + 0.02 && Math.abs(p[2]) <= HS + 0.02;
  for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
    const a = P(i, j), b = P(i + 1, j), d = P(i, j + 1), e = P(i + 1, j + 1);
    for (const t of [[a, d, b], [b, d, e]]) { const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cz = (t[0][2] + t[1][2] + t[2][2]) / 3; if (Math.abs(cx) <= HS && Math.abs(cz) <= HS) tris.push(...t[0], ...t[1], ...t[2]); }
  }
  void inside;
  // (wound to face down into the room: the lathe-like order above faces outward from the sphere's centre, which is up and out; flip)
  const flipped = []; for (let i = 0; i < tris.length; i += 9) flipped.push(...tris.slice(i, i + 3), ...tris.slice(i + 6, i + 9), ...tris.slice(i + 3, i + 6));
  bag.add('plaster_white', fromTriangles(flipped)); bag.add('plaster_white', fromTriangles(tris));
  // the saucer: a cap of radius HS rising 2 m, drawn from inside
  const prof = []; const k = 8, Rc = (HS * HS + 4) / 4, cy = c + 5 + 2 - Rc;
  for (let i = 0; i <= k; i++) { const r = HS * (1 - i / k) + 0.001; prof.push([r, cy + Math.sqrt(Rc * Rc - r * r) - (c + 5)]); }
  bag.add('plaster_white', lathe(prof.slice().reverse(), 32, null, 0, c + 5, 0)); bag.add('plaster_white', lathe(prof, 32, null, 0, c + 5, 0));
}

/** The tower: walls, the lower majlis's ceiling, the floor of the upper majlis, the octagonal drum, the dome, the horseman. */
export function greenDome({ bag, col }, y) {
  const M = HS + TH / 2, door = { at: M, w: 3.4, h: 5.6 };
  const wall = (a, b, ops = []) => wallRun({ bag, col }, { a, b, th: TH, y0: y, y1: y + T0, mat: 'brick_buff', ops });
  wall([-M - TH / 2, -M], [M + TH / 2, -M]);                               // north
  wall([M, -M], [M, M], [door]); wall([-M, M], [-M, -M], [door]);          // east and west: a door each
  wall([M + TH / 2, M], [-M - TH / 2, M], [{ at: M + TH / 2, w: 7.4, h: 11.2 }]);    // south: the great arch into the iwan
  ceiling(bag, y + 0.4);
  // the lower majlis: a cornice of gilt inscription under the springing; the upper majlis's floor of teak over the dome's back; the tower's cornice and a corbel course
  const spr = y + 0.4 + SPRING;
  bag.add('gilt_bronze', box(-HS - 0.02, spr - 0.5, -HS - 0.02, HS + 0.02, spr - 0.3, -HS + 0.02)); bag.add('gilt_bronze', box(-HS - 0.02, spr - 0.5, HS - 0.02, HS + 0.02, spr - 0.3, HS + 0.02));
  bag.add('gilt_bronze', box(-HS - 0.02, spr - 0.5, -HS, -HS + 0.02, spr - 0.3, HS)); bag.add('gilt_bronze', box(HS - 0.02, spr - 0.5, -HS, HS + 0.02, spr - 0.3, HS));
  bag.add('plaster', box(-HS - 0.05, spr - 0.3, -HS - 0.05, HS + 0.05, spr, -HS + 0.2)); bag.add('plaster', box(-HS - 0.05, spr - 0.3, HS - 0.2, HS + 0.05, spr, HS + 0.05));
  bag.add('plaster', box(-HS - 0.05, spr - 0.3, -HS, -HS + 0.2, spr, HS)); bag.add('plaster', box(HS - 0.2, spr - 0.3, -HS, HS + 0.05, spr, HS));
  // the walls above the stucco, up to the upper floor, lined with white plaster (the pendentives meet it)
  for (const [x0, z0, x1, z1] of [[-HS, -HS, HS, -HS + 0.03], [-HS, HS - 0.03, HS, HS], [-HS, -HS, -HS + 0.03, HS], [HS - 0.03, -HS, HS, HS]]) bag.add('plaster_white', box(x0, y + 8.6, z0, x1, y + T0 - 0.5, z1));
  const B = M + TH / 2;
  bag.add('timber', box(-B, y + T0 - 0.5, -B, B, y + T0 - 0.1, B));
  bag.add('plaster', box(-B - 0.5, y + T0 - 0.5, -B - 0.5, B + 0.5, y + T0, B + 0.5));
  for (const sd of [-1, 1]) for (let k = 0; k < 28; k++) {                  // the corbel course under the cornice, on the four faces
    const u = -B + 0.3 + k * (2 * B - 0.6) / 27;
    bag.add('brick_baked', box(u - 0.14, y + T0 - 1.3, sd * B - (sd > 0 ? 0 : 0.2) - 0.0 + (sd > 0 ? 0 : 0), u + 0.14, y + T0 - 0.5, sd * B + (sd > 0 ? 0.2 : 0)));
    bag.add('brick_baked', box(sd * B - (sd > 0 ? 0 : 0.2), y + T0 - 1.3, u - 0.14, sd * B + (sd > 0 ? 0.2 : 0), y + T0 - 0.5, u + 0.14));
  }
  // blind arcades on the north, east and west faces (two tall pointed niches beside the door, a stucco field above), a stucco frieze
  const faces = [{ N: [0, -1], U: [-1, 0] }, { N: [1, 0], U: [0, -1] }, { N: [-1, 0], U: [0, 1] }];
  for (const f of faces) {
    const O = [f.N[0] * B - f.U[0] * B, f.N[1] * B - f.U[1] * B], fr = { O, U: f.U, N: f.N }, L = 2 * B;
    stuccoPanel(bag, fr, 0.6, L - 0.6, y + T0 - 3.6, y + T0 - 1.5, 0.05, 'stucco', 0.42);
    const n = f.N[1] ? 3 : 2, bw = (L - 1.6) / n;
    for (let k = 0; k < n; k++) {
      const u0 = 0.8 + k * bw + 0.45, w2 = bw - 0.9;
      if (f.N[0] && Math.abs(u0 + w2 / 2 - L / 2) < 1.9) continue;      // not over a door
      bag.add('opening', polyGeo(fr, [[u0, y + 6.6], [u0 + w2, y + 6.6], [u0 + w2, y + 14.0], [u0, y + 14.0]], 0, 0.06));
      archBand(bag, fr, u0, y + 6.6, w2, 7.4, 0.3, 0.0, 0.13, ['brick_baked', 'brick_buff']);
    }
  }
  // the drum: eight facets, each a pointed window in a framed field with engaged colonettes at the angles
  const ap = 6.9, N = 8, R = ap / Math.cos(Math.PI / N);
  for (let i = 0; i < N; i++) {
    const a0 = (i / N + 1 / 16) * Math.PI * 2, a1 = ((i + 1) / N + 1 / 16) * Math.PI * 2;
    const A = [Math.cos(a0) * R, Math.sin(a0) * R], Bp = [Math.cos(a1) * R, Math.sin(a1) * R], L = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]);
    wallRun({ bag, col }, { a: A, b: Bp, th: 1.3, y0: y + T0, y1: y + T1, mat: 'plaster_white', ops: [{ at: L / 2, w: 2.4, h: 6.4, y0: y + T0 + 3.4 }], collide: false });
    const mx = (A[0] + Bp[0]) / 2, mz = (A[1] + Bp[1]) / 2, nx = mx / Math.hypot(mx, mz), nz = mz / Math.hypot(mx, mz);
    bag.add('daylight', polyGeo({ O: [mx + nz * 1.2 - nx * 0.4, mz - nx * 1.2 - nz * 0.4], U: [-nz, nx], N: [-nx, -nz] }, [[0, y + T0 + 3.4], [2.4, y + T0 + 3.4], [2.4, y + T0 + 7.0], [0, y + T0 + 7.0]], 0, 0.02));
    const fr = { O: [A[0] + nx * 0.65 * 0 + (Bp[0] - A[0]) / L * 0, A[1]], U: [(Bp[0] - A[0]) / L, (Bp[1] - A[1]) / L], N: [nx, nz] };
    fr.O = [A[0] + nx * 0.65, A[1] + nz * 0.65];
    archBand(bag, fr, L / 2 - 1.2, y + T0 + 3.4, 2.4, 6.4, 0.3, 0.0, 0.1, ['brick_baked', 'plaster']);
    stuccoPanel(bag, fr, L / 2 - 1.2, L / 2 + 1.2, y + T0 + 0.8, y + T0 + 3.1, 0.05, 'stucco', 0.4);
    stuccoPanel(bag, fr, 0.5, L / 2 - 1.5, y + T0 + 0.8, y + T0 + 10.6, 0.04, 'stucco', 0.5); stuccoPanel(bag, fr, L / 2 + 1.5, L - 0.5, y + T0 + 0.8, y + T0 + 10.6, 0.04, 'stucco', 0.5);
    bag.add('plaster', lathe([[0.2, 0], [0.16, 0.2], [0.14, 11.0], [0.2, 11.2], [0.001, 11.2]], 7, null, A[0] + nx * 0.3, y + T0, A[1] + nz * 0.3));
  }
  const Rd = R + 0.1;
  bag.add('tile_turquoise', lathe([[R + 0.4, 0], [R + 0.5, 0.18], [R + 0.2, 0.34]], 8, () => 1, 0, y + T0 + 2.6, 0));
  bag.add('plaster_white', lathe([[R + 0.5, 0], [R + 0.5, 0.35], [R - 0.6, 0.45]], 8, null, 0, y + T1, 0));
  bag.add('gilt_bronze', lathe([[Rd + 0.05, 0], [Rd + 0.1, 0.12], [Rd, 0.24]], 32, null, 0, y + T1 + 0.4, 0));
  domeShell(bag, 'tile_green', 0, 0, Rd, y + T1 + 0.4, { pointed: 0.42, seg: 32, rows: 12, cap: 0 });
  const top = y + T1 + 0.4 + Rd * 1.42;
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.7, 0.1], [0.8, 0.5], [0.55, 0.9], [0.2, 1.2], [0.001, 1.3]], 12, null, 0, top - 0.2, 0));
  bag.add('gilt_bronze', lathe([[0.12, 0], [0.09, 2.6], [0.001, 2.7]], 8, null, 0, top + 1.0, 0));
  horseman(bag, 0, top + 3.6, 0);
}

/** The horseman of the Green Dome: a horse at the walk with its head turned, the rider in a caftan and turban, a lance with a pennon, on a swivelling pin. Faces -z. */
function horseman(bag, cx, hy, cz) {
  const M = 'bronze', at = (g) => bag.add(M, g.translate(cx, 0, cz));
  at(lathe([[0.001, -1.15], [0.34, -0.95], [0.46, -0.5], [0.48, 0.2], [0.4, 0.75], [0.001, 1.1]], 10, null, 0, 0, 0).rotateX(Math.PI / 2).translate(0, hy, 0));      // the barrel
  at(box(-0.13, -0.42, -0.2, 0.13, 0.42, 0.2).rotateX(-0.75).translate(0, hy + 0.5, -1.12));                                                                        // the neck
  at(box(-0.1, -0.1, -0.34, 0.1, 0.11, 0.32).rotateX(0.35).translate(0, hy + 0.98, -1.55));                                                                         // the head
  for (const s of [-1, 1]) at(box(-0.02, 0, -0.02, 0.02, 0.18, 0.05).translate(s * 0.07, hy + 1.1, -1.38));                                                            // ears
  at(box(-0.04, -0.5, -0.04, 0.04, 0.1, 0.04).rotateX(0.5).translate(0, hy + 0.35, 1.2));                                                                          // the tail
  for (const [lx, lz, f] of [[-0.18, -0.7, 1], [0.18, -0.7, 0], [-0.18, 0.75, 0], [0.18, 0.75, 1]]) {
    at(box(-0.07, -0.55, -0.07, 0.07, 0, 0.07).translate(lx, hy - 0.4 - 0.0, lz + (f ? -0.18 : 0.05)));
    at(box(-0.05, -0.5, -0.05, 0.05, 0, 0.05).translate(lx, hy - 0.9, lz + (f ? -0.24 : 0.0)));
    at(box(-0.07, -0.08, -0.08, 0.07, 0, 0.08).translate(lx, hy - 1.4, lz + (f ? -0.24 : 0)));
  }
  at(box(-0.28, 0.0, -0.3, 0.28, 0.09, 0.3).translate(0, hy + 0.46, 0.1));                                                                                          // the saddle
  at(box(-0.19, 0, -0.14, 0.19, 0.62, 0.16).translate(0, hy + 0.55, 0.1));                                                                                          // the rider's body
  at(lathe([[0.21, 0], [0.3, -0.45], [0.001, -0.45]], 8, null, 0, 0, 0).translate(0, hy + 0.55, 0.1));                                                              // the caftan's skirt
  at(lathe([[0.001, 0], [0.13, 0.02], [0.14, 0.14], [0.1, 0.22], [0.001, 0.26]], 8, null, 0, hy + 1.22, 0.1));                                                      // the head in its turban
  at(box(0.19, 0.2, -0.5, 0.26, 0.28, 0.12).translate(0, hy + 0.55 + 0.1, 0.1));                                                                                    // the arm that holds the lance
  bag.add('iron', box(cx + 0.19, hy + 0.7, cz - 2.6, cx + 0.25, hy + 0.76, cz + 1.1));                                                                             // the lance
  bag.add('gilt_bronze', fromTriangles([cx + 0.22, hy + 0.73, cz - 3.1, cx + 0.16, hy + 0.73, cz - 2.55, cx + 0.28, hy + 0.73, cz - 2.55, cx + 0.22, hy + 0.73, cz - 3.1, cx + 0.28, hy + 0.73, cz - 2.55, cx + 0.16, hy + 0.73, cz - 2.55]));   // the point
  bag.add('cloth_red', fromTriangles([cx + 0.22, hy + 0.9, cz - 2.55, cx + 0.22, hy + 0.5, cz - 2.55, cx + 0.22, hy + 0.7, cz - 1.7, cx + 0.22, hy + 0.9, cz - 2.55, cx + 0.22, hy + 0.7, cz - 1.7, cx + 0.22, hy + 0.5, cz - 2.55]));     // the pennon
  bag.add('gilt_bronze', box(cx - 0.05, hy - 1.45, cz - 0.05, cx + 0.05, hy - 1.3, cz + 0.05));
}
void archCurve;
