// The Phoenix Hall's bracket sets (tokyō) and the round latticed window over the middle door, built for the hall alone
// on the vocabulary of the shared Japanese style: docs/settlements/heian-uji.md §18.

import { fromTriangles, orientOutward } from '../../core/geom.js';
import { hexa, obox } from '../../styles/chinese/index.js';
import { holePanel, tri, quad4 } from '../../styles/japanese/shape.js';

/** A convex outline pts [[s, y]…] extruded ±hw: f(s, y, t) maps to the world. */
function ext(out, pts, hw, f) {
  const n = pts.length, F = pts.map(([s, y]) => f(s, y, -hw)), B = pts.map(([s, y]) => f(s, y, hw)), tris = [];
  for (let i = 1; i < n - 1; i++) tris.push(...F[0], ...F[i], ...F[i + 1], ...B[0], ...B[i + 1], ...B[i]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; tris.push(...F[i], ...B[i], ...B[j], ...F[i], ...B[j], ...F[j]); }
  out.push(...orientOutward(tris));
}

/**
 * A three-stepped bracket set (mitesaki tokyō) { at [x, z], y (the column's top), dir (outward unit), tiers (3), step (0.5) }:
 * the capital block (daito) on the column; in each tier the arm (hijiki) running out, its lower tip rounded in facets, crossed
 * at its end by a long arm along the wall (the ends cut), small bearing blocks (masu) on the cross arm's ends and middle that
 * carry the next tier; at the top the purlin's seat. [stated: three-stepped bracket sets, JAANUS; inferred: the members' sizes]
 */
function tokyo(el, { bag }) {
  const [x, z] = el.at, y = el.y, n = el.dir, u = [-n[1], n[0]], T = el.tiers || 3, step = el.step || 0.5, W = [];
  const P = (a, b, yy) => [x + u[0] * a + n[0] * b, yy, z + u[1] * a + n[1] * b];
  const C = (a, b) => [x + u[0] * a + n[0] * b, z + u[1] * a + n[1] * b];
  const j = ((Math.round(x * 10 + z * 7) % 5) + 5) * 0.0003;           // a hair's difference so that the sets merge and are not instanced
  const ky = T === 1 ? 0.3 : 0.28, pitch = T === 1 ? 0.4 : 0.4, blk = 0.15;
  // the capital block: a tapering foot under a wide head
  const hd = 0.33 + j;
  hexa(W, [P(-0.25, -0.25, y), P(0.25, -0.25, y), P(0.25, 0.25, y), P(-0.25, 0.25, y)], [P(-hd, -hd, y + 0.1), P(hd, -hd, y + 0.1), P(hd, hd, y + 0.1), P(-hd, hd, y + 0.1)]);
  obox(W, C(0, 0), u, n, hd, hd, y + 0.1, y + ky);
  for (let k = 1; k <= T; k++) {
    const yb = y + ky + (k - 1) * pitch, reach = k * step, L = 0.5 + 0.3 * k + j;
    // the arm running out: its lower tip rounded off in facets, the tip's top cut square
    const b0 = -0.85, b1 = reach + 0.13;
    ext(W, [[b0, yb + 0.25], [b0, yb], [b1 - 0.3, yb], [b1 - 0.19, yb + 0.02], [b1 - 0.09, yb + 0.07], [b1 - 0.02, yb + 0.15], [b1, yb + 0.25]], 0.098 + j, (s, yy, t) => P(t, s, yy));
    // the cross arm: along the wall at the arm's end, its ends cut in steps
    ext(W, [[-L, yb + 0.26], [-L, yb + 0.14], [-L + 0.1, yb + 0.03], [-L + 0.2, yb + 0.015], [L - 0.2, yb + 0.015], [L - 0.1, yb + 0.03], [L, yb + 0.14], [L, yb + 0.26]], 0.09, (s, yy, t) => P(s, reach + t, yy));
    // the bearing blocks on it: a tapering foot under a wider head
    for (const a of [-L + 0.16, 0, L - 0.16]) {
      const w = 0.105 + j;
      hexa(W, [P(a - 0.075, reach - 0.075, yb + 0.26), P(a + 0.075, reach - 0.075, yb + 0.26), P(a + 0.075, reach + 0.075, yb + 0.26), P(a - 0.075, reach + 0.075, yb + 0.26)], [P(a - w, reach - w, yb + 0.31), P(a + w, reach - w, yb + 0.31), P(a + w, reach + w, yb + 0.31), P(a - w, reach + w, yb + 0.31)]);
      obox(W, C(a, reach), u, n, w, w, yb + 0.31, yb + 0.26 + blk);
    }
  }
  if (T > 1) {
    // the tail of the lowest arm, a second slender arm along the wall over the column, and the beam-end under the purlin
    obox(W, C(0, 0), u, n, 0.72, 0.085, y + ky + 0.02, y + ky + 0.25);
    obox(W, C(0, 0.0), u, n, 0.1, 0.26, y + ky + (T - 1) * pitch + 0.27 + blk, y + ky + (T - 1) * pitch + 0.27 + blk + 0.04, T * step * 0.5);
  }
  bag.add(el.mat || 'timber_ni', fromTriangles(W));
}

/**
 * The round window (marumado) in the wall over the middle door, where the face of Amida is seen { x (the wall's line), z (its
 * middle), y (the panel's middle), half (the panel's half-width), h (its height), r (the window's radius), T (half thickness) }:
 * a panel of white plaster with a round hole cut through it, the tunnel and a collar of red lacquer, a gilt ring on the face,
 * radial lattice bars and two rings of black wood across the opening, gilt plates on the panel's corners.
 * [stated: the face of Amida can be seen through the round window of the hall, Kyoto Private Guides; inferred: the lattice, the sizes]
 */
function roundWindow(el, { bag }) {
  const x = el.x, z = el.z, y = el.y, hw = el.half, h = el.h, r = el.r ?? 0.5, T = el.T ?? 0.11, face = [], tun = [], G = [], Bk = [], Cl = [];
  holePanel(face, tun, [x, y, z], [0, 1], [1, 0], hw * 2, h, T, { circle: r });
  bag.add('plaster_white', fromTriangles(face));
  bag.add('timber_ni', fromTriangles(tun));
  const R = (a, rad, dx) => [x + dx, y + Math.sin(a) * rad, z + Math.cos(a) * rad];
  // the lacquered collar and the gilt ring round the hole on the outer face
  const N = 28;
  for (const [r0, r1, dx, mat] of [[r - 0.002, r + 0.07, T + 0.012, Cl], [r + 0.07, r + 0.095, T + 0.02, G]]) {
    for (let k = 0; k < N; k++) {
      const a = k / N * Math.PI * 2, b = (k + 1) / N * Math.PI * 2;
      quad4(mat, R(a, r0, dx), R(b, r0, dx), R(b, r1, dx), R(a, r1, dx), [1, 0, 0]);
      quad4(mat, R(a, r1, dx), R(b, r1, dx), R(b, r1, T), R(a, r1, T), [(r1 > r + 0.08 ? 0 : 0) + 0.2, Math.sin((a + b) / 2), Math.cos((a + b) / 2)]);
    }
  }
  // the lattice across the opening: sixteen radial bars from a hub to the ring, and two rings
  const bar = (a0, r0, a1, r1, wd, dx) => {
    const p = R(a0, r0, dx), q = R(a1, r1, dx), d = [q[1] - p[1], q[2] - p[2]], l = Math.hypot(d[0], d[1]) || 1, nx = -d[1] / l * wd / 2, nz = d[0] / l * wd / 2;
    const A = [p[0], p[1] + nx, p[2] + nz], B = [p[0], p[1] - nx, p[2] - nz], C = [q[0], q[1] - nx, q[2] - nz], D = [q[0], q[1] + nx, q[2] + nz];
    const E = (v, o) => [v[0] + o, v[1], v[2]];
    hexa(Bk, [E(A, -0.03), E(B, -0.03), E(C, -0.03), E(D, -0.03)], [E(A, 0.03), E(B, 0.03), E(C, 0.03), E(D, 0.03)]);
  };
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + 0.01 * (k % 3); bar(a, 0.09, a, r - 0.01, 0.03, 0.0); }
  for (const rr of [0.18 + 0.0004, 0.34]) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; bar(a - 0.001, rr, a + Math.PI * 2 / 24 + 0.001, rr, 0.03, 0.012 + rr * 0.01); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; tri(G, R(a, 0.09, 0.045), R(a + 0.4, 0.13, 0.045), R(a - 0.4, 0.13, 0.045), [1, 0, 0]); }
  // gilt plates on the panel's four corners
  for (const sz of [-1, 1]) for (const sy of [-1, 1]) {
    const cz2 = z + sz * (hw - 0.16), cy2 = y + sy * (h / 2 - 0.13);
    quad4(G, [x + T + 0.01, cy2 - 0.08, cz2 - 0.12], [x + T + 0.01, cy2 - 0.08, cz2 + 0.12], [x + T + 0.01, cy2 + 0.08, cz2 + 0.12], [x + T + 0.01, cy2 + 0.08, cz2 - 0.12], [1, 0, 0]);
  }
  bag.add('lacquer_red', fromTriangles(Cl));
  bag.add('gilt_bronze', fromTriangles(G));
  bag.add('wood_dark', fromTriangles(Bk));
}

/**
 * A latticed door-wall (kōshi-do) between posts, in the plane x = const { x, z0, z1, y0, y1 }: a solid kick-board along the foot,
 * above it the lattice of slender uprights set close, held by three rails, framed by stiles at the leaves' edges (a leaf about
 * 1.15 m) and a head rail; at every crossing of stile and rail a gilt nail-cover plate and a gilt fitting at the leaf's middle.
 * [inferred: after the hall's latticed doors; the sizes]
 */
function latticeDoors(el, { bag }) {
  const x = el.x, z0 = el.z0, z1 = el.z1, y0 = el.y0, y1 = el.y1, W = [], G = [], K = [];
  const n = Math.max(1, Math.round((z1 - z0) / 1.15)), leaf = (z1 - z0) / n, kick = 0.62, H = y1 - y0;
  const bx = (arr, za, zb, ya, yb, d) => hexa(arr, [[x - d, ya, za], [x + d, ya, za], [x + d, ya, zb], [x - d, ya, zb]], [[x - d, yb, za], [x + d, yb, za], [x + d, yb, zb], [x - d, yb, zb]]);
  bx(K, z0, z1, y0, y0 + kick, 0.045);                                                    // the kick-board
  bx(W, z0, z1, y0 + kick, y0 + kick + 0.06, 0.052);                                      // the foot rail
  bx(W, z0, z1, y1 - 0.12, y1, 0.058);                                                    // the head rail
  for (const f of [0.38, 0.7]) bx(W, z0, z1, y0 + kick + (H - kick) * f - 0.025, y0 + kick + (H - kick) * f + 0.025, 0.04);   // the middle rails
  for (let i = 0; i <= n; i++) {
    const zc = z0 + leaf * i, wd = i === 0 || i === n ? 0.05 : 0.075;
    bx(W, Math.max(z0, zc - wd), Math.min(z1, zc + wd), y0 + kick, y1, 0.058);            // a stile
    for (const yy of [y0 + kick + 0.03, y0 + kick + (H - kick) * 0.38, y0 + kick + (H - kick) * 0.7, y1 - 0.06]) bx(G, zc - 0.045, zc + 0.045, yy - 0.045, yy + 0.045, 0.064);
  }
  for (let i = 0; i < n; i++) {
    const a = z0 + leaf * i, b = a + leaf, N = Math.round((leaf - 0.2) / 0.105);
    for (let k = 0; k <= N; k++) { const zc = a + 0.1 + (leaf - 0.2) * k / N, j = (k % 3) * 0.0003; bx(W, zc - 0.016 - j, zc + 0.016 + j, y0 + kick + 0.06, y1 - 0.12, 0.034); }
    bx(G, (a + b) / 2 - 0.06, (a + b) / 2 + 0.06, y0 + kick - 0.2, y0 + kick - 0.14, 0.05);     // the handle plate on the kick-board
  }
  bag.add('timber_ni', fromTriangles(W)); bag.add('wood_dark', fromTriangles(K)); bag.add('gilt_bronze', fromTriangles(G));
}

export const frontElements = { byodo_tokyo: tokyo, byodo_round_window: roundWindow, byodo_lattice: latticeDoors };
