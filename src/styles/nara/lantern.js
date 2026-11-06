// The octagonal gilt-bronze lantern (hakkaku tōrō) before the Great Buddha Hall of Tōdai-ji, cast
// about 752 (docs/settlements/nara.md §4): 4.62 m from the stone base to the jewel — a single
// base, a double lotus pedestal, the octagonal shaft, the middle stand, the eight-sided fire box
// whose panels (about 1.25 × 0.5 m) are openwork, lions on the four faces toward the compass and
// musician bodhisattvas on the diagonals (cymbals NE, mouth organ SE, transverse flute SW,
// end-blown flute NW), the octagonal roof with its corners turned up, the flaming jewel.

import { lathe, fromTriangles } from '../../core/geom.js';
import { obox } from '../chinese/index.js';
import { tube, plate } from '../japanese/shape.js';

const G = 'gilt_bronze';
/** A solid of revolution with eight faces, its faces (not its corners) toward the compass. */
const oct = (profile, x, y, z, seg = 8, mod = null) => { const g = lathe(profile, seg, mod); g.rotateY(Math.PI / seg); g.translate(x, y, z); return g; };

export function hakkakuToro(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y ?? 0, out = [], fig = [];
  // the single base of stone, and the double lotus pedestal: petals turned down, then up
  bag.add('granite_block', oct([[1.32, 0], [1.32, 0.22], [1.2, 0.3], [0.001, 0.3]], x, y0, z));
  const petals = (n, amp) => (th) => 1 + amp * Math.abs(Math.cos(th * n / 2));
  bag.add(G, lathe([[0.86, 0], [0.88, 0.08], [0.8, 0.2], [0.55, 0.28], [0.42, 0.3]], 32, petals(16, 0.07), x, y0 + 0.3, z));
  bag.add(G, lathe([[0.42, 0], [0.5, 0.06], [0.66, 0.2], [0.7, 0.26], [0.38, 0.28], [0.22, 0.32]], 32, petals(16, 0.08), x, y0 + 0.58, z));
  // the shaft, with a band at its middle and its ends
  const ys = y0 + 0.9, yt = y0 + 2.0;
  bag.add(G, oct([[0.24, 0], [0.24, 0.08], [0.18, 0.12], [0.17, 0.5], [0.22, 0.52], [0.22, 0.6], [0.17, 0.62], [0.16, 1.0], [0.22, 1.04], [0.22, 1.1], [0.001, 1.1]], x, ys, z));
  // the middle stand: an octagonal tray on a ring of upturned petals
  bag.add(G, lathe([[0.2, 0], [0.42, 0.1], [0.72, 0.22], [0.76, 0.28], [0.001, 0.28]], 32, petals(16, 0.06), x, yt, z));
  bag.add(G, oct([[0.84, 0], [0.84, 0.07], [0.001, 0.07]], x, yt + 0.28, z));
  // the fire box: posts at the corners, a sill and a head, and the eight openwork panels
  const yb = yt + 0.35, PH = 1.25, R = 0.66, yh = yb + PH;
  const V = (k, r = R) => { const a = Math.PI / 8 + k * Math.PI / 4; return [x + Math.cos(a) * r, z + Math.sin(a) * r]; };
  bag.add(G, oct([[0.8, 0], [0.8, 0.1], [0.72, 0.12], [0.001, 0.12]], x, yb - 0.12, z));
  bag.add(G, oct([[0.74, 0], [0.8, 0.1], [0.8, 0.16], [0.001, 0.16]], x, yh, z));
  for (let k = 0; k < 8; k++) {
    const p = V(k), q = V(k + 1), u = [(q[0] - p[0]) / Math.hypot(q[0] - p[0], q[1] - p[1]), (q[1] - p[1]) / Math.hypot(q[0] - p[0], q[1] - p[1])];
    const nrm = [u[1], -u[0]], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], n = (m[0] - x) * nrm[0] + (m[1] - z) * nrm[1] > 0 ? nrm : [-nrm[0], -nrm[1]];
    obox(out, p, u, n, 0.045, 0.045, yb, yh);                                   // the corner post
    const hw = Math.hypot(q[0] - p[0], q[1] - p[1]) / 2 - 0.05, c = [m[0] - n[0] * 0.02, m[1] - n[1] * 0.02];
    // the frame of the panel and the lattice of its ground
    obox(out, c, u, n, hw, 0.02, yb, yb + 0.05); obox(out, c, u, n, hw, 0.02, yh - 0.05, yh);
    for (let i = 1; i < 8; i++) obox(out, [c[0] + u[0] * (-hw + i * 2 * hw / 8), c[1] + u[1] * (-hw + i * 2 * hw / 8)], u, n, 0.006, 0.008, yb + 0.05, yh - 0.05);
    for (let j = 1; j < 21; j++) obox(out, c, u, n, hw, 0.008, yb + 0.05 + j * (PH - 0.1) / 21 - 0.006, yb + 0.05 + j * (PH - 0.1) / 21 + 0.006);
    // the figure in relief, standing proud of the lattice on a cloud
    const f = [c[0] + n[0] * 0.03, c[1] + n[1] * 0.03], P = (s, v, d = 0) => [f[0] + u[0] * s + n[0] * d, yb + v, f[1] + u[1] * s + n[1] * d];
    plate(fig, [P(-0.17, 0.12), P(0.17, 0.12), P(0.2, 0.2), P(0.05, 0.25), P(-0.12, 0.24), P(-0.2, 0.18)], [n[0], 0, n[1]], 0.03);
    const compass = k % 2 === 1;                                                // face k looks toward 45°·(k+1) from east: odd k S, W, N, E
    if (compass) lion(fig, P, u, n);
    else bodhisattva(fig, P, u, n, k);
  }
  // a lamp dish inside, the flame
  bag.add(G, lathe([[0.001, 0], [0.12, 0.02], [0.16, 0.07], [0.001, 0.07]], 10, null, x, yb + 0.02, z));
  bag.add('flame', lathe([[0.001, 0], [0.025, 0.03], [0.018, 0.08], [0.001, 0.12]], 6, null, x, yb + 0.09, z));
  // the roof: eight faces rising from an eave whose corners turn up, ribs down the corners curling at their ends
  const yr = yh + 0.16, Re = 1.06, top = [];
  const eave = (k, t) => { const a = V(k, Re), b = V(k + 1, Re), lift = 0.13 * Math.pow(Math.abs(2 * t - 1), 2.2); return [a[0] + (b[0] - a[0]) * t, yr + lift, a[1] + (b[1] - a[1]) * t]; };
  const ring = (k, t, r, yy) => { const a = V(k, r), b = V(k + 1, r); return [a[0] + (b[0] - a[0]) * t, yy, a[1] + (b[1] - a[1]) * t]; };
  for (let k = 0; k < 8; k++) for (let i = 0; i < 4; i++) {
    const t0 = i / 4, t1 = (i + 1) / 4;
    const e0 = eave(k, t0), e1 = eave(k, t1), r0 = ring(k, t0, 0.24, yr + 0.4), r1 = ring(k, t1, 0.24, yr + 0.4), u0 = ring(k, t0, 0.8, yr - 0.02), u1 = ring(k, t1, 0.8, yr - 0.02);
    const up = (pt) => [pt[0] - x, 2, pt[2] - z];
    const tq = (a, b, c, d, w) => { for (const [p1, p2, p3] of [[a, b, c], [a, c, d]]) { const n0 = [(p2[1] - p1[1]) * (p3[2] - p1[2]) - (p2[2] - p1[2]) * (p3[1] - p1[1]), (p2[2] - p1[2]) * (p3[0] - p1[0]) - (p2[0] - p1[0]) * (p3[2] - p1[2]), (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0])]; const ww = w(p1); if (n0[0] * ww[0] + n0[1] * ww[1] + n0[2] * ww[2] < 0) top.push(...p1, ...p3, ...p2); else top.push(...p1, ...p2, ...p3); } };
    tq(e0, e1, r1, r0, up);
    tq(e0, e1, u1, u0, () => [0, -1, 0]);
    const e0b = [e0[0], e0[1] - 0.06, e0[2]], e1b = [e1[0], e1[1] - 0.06, e1[2]];
    tq(e0, e1, e1b, e0b, (pt) => [pt[0] - x, 0, pt[2] - z]);
    tq(e0b, e1b, u1, u0, () => [0, -1, 0]);
  }
  for (let k = 0; k < 8; k++) {
    const a = V(k, Re + 0.02), d = [(a[0] - x) / Math.hypot(a[0] - x, a[1] - z), (a[1] - z) / Math.hypot(a[0] - x, a[1] - z)];
    tube(fig, [x, yr, z], d, [[0.24, 0.42], [0.6, 0.28], [Re, 0.15], [Re + 0.06, 0.2], [Re + 0.03, 0.27]], [[0.03, 0.03], [0.035, 0.035], [0.04, 0.04], [0.035, 0.035], [0.02, 0.02]], 6);
  }
  bag.add(G, fromTriangles(top));
  // the crown: a lotus cup, the flaming jewel
  const yc = yr + 0.4;
  bag.add(G, lathe([[0.26, 0], [0.24, 0.05], [0.12, 0.08], [0.1, 0.12], [0.18, 0.18], [0.16, 0.2], [0.001, 0.2]], 16, petals(8, 0.12), x, yc, z));
  bag.add(G, lathe([[0.001, 0], [0.12, 0.04], [0.15, 0.1], [0.12, 0.17], [0.06, 0.22], [0.001, 0.27]], 12, null, x, yc + 0.2, z));
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, d = [Math.cos(a), Math.sin(a)], s = [-d[1], d[0]], P = (r, v) => [x + d[0] * r, yc + v, z + d[1] * r]; plate(fig, [P(0.1, 0.22), P(0.17, 0.3), P(0.1, 0.38), P(0.04, 0.42), P(0.05, 0.3)], [s[0], 0, s[1]], 0.015); }
  bag.add(G, fromTriangles(out));
  bag.add(G, fromTriangles(fig));
  col.circle(x, z, 1.0, y0, yc + 0.5);
}

/** A musician bodhisattva in relief: robe and scarves, the arms raised to the instrument, the head with its halo. */
function bodhisattva(out, P, u, n, k) {
  const N = [n[0], 0, n[1]], d = 0.03;
  plate(out, [P(-0.11, 0.24, d), P(0.11, 0.24, d), P(0.08, 0.62, d), P(0.12, 0.8, d), P(-0.12, 0.8, d), P(-0.08, 0.62, d)], N, 0.05);     // the robe
  plate(out, [P(-0.1, 0.78, d), P(0.1, 0.78, d), P(0.08, 0.92, d), P(-0.08, 0.92, d)], N, 0.06);                                         // the chest
  tube(out, P(0, 0, d + 0.02), u, [[0, 0.95], [0, 1.02], [0, 1.07]], [[0.03, 0.035], [0.04, 0.045], [0.02, 0.02]], 8);                  // the head
  plate(out, Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return P(Math.cos(a) * 0.1, 1.0 + Math.sin(a) * 0.1, d - 0.01); }), N, 0.012);   // the halo
  for (const s of [-1, 1]) {                                                                                                          // the scarves streaming
    plate(out, [P(s * 0.1, 0.9, d), P(s * 0.2, 0.7, d), P(s * 0.22, 0.45, d), P(s * 0.17, 0.5, d), P(s * 0.13, 0.75, d)], N, 0.015);
    tube(out, P(0, 0, d + 0.03), u, [[s * 0.1, 0.9], [s * 0.12, 0.84], [s * 0.05, 0.9]], [[0.018, 0.018], [0.016, 0.016], [0.014, 0.014]], 5);   // the arm
  }
  // the instrument: cymbals, the mouth organ, a transverse flute, an end-blown flute
  const kind = ['sho', 'flute', 'shakuhachi', 'cymbals'][(k / 2) % 4];        // faces SE, SW, NW, NE
  if (kind === 'cymbals') for (const s of [-1, 1]) plate(out, Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return P(s * 0.06 + Math.cos(a) * 0.035, 0.9 + Math.sin(a) * 0.035, d + 0.06); }), N, 0.012);
  else if (kind === 'sho') for (let i = 0; i < 5; i++) tube(out, P(0, 0, d + 0.06), u, [[-0.03 + i * 0.015, 0.86], [-0.03 + i * 0.015, 0.9 + (i % 2) * 0.02 + 0.03]], [[0.007, 0.007], [0.007, 0.007]], 4);
  else if (kind === 'flute') tube(out, P(0, 0, d + 0.06), u, [[-0.14, 0.95], [0.06, 0.92]], [[0.01, 0.01], [0.01, 0.01]], 5);
  else tube(out, P(0, 0, d + 0.06), u, [[0, 0.98], [0.02, 0.8]], [[0.011, 0.011], [0.011, 0.011]], 5);
}

/** A lion in relief, rearing on its cloud: haunches, chest, the maned head, the curling tail. */
function lion(out, P, u, n) {
  const N = [n[0], 0, n[1]], d = 0.035;
  tube(out, P(0, 0, d), u, [[-0.08, 0.3], [-0.06, 0.48], [0.0, 0.66], [0.04, 0.8]], [[0.05, 0.08], [0.06, 0.1], [0.06, 0.1], [0.05, 0.07]], 8);   // the body, rearing
  tube(out, P(0, 0, d + 0.02), u, [[0.03, 0.82], [0.06, 0.9], [0.12, 0.92]], [[0.05, 0.06], [0.06, 0.07], [0.03, 0.04]], 8);                   // the head and snout
  plate(out, Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return P(0.04 + Math.cos(a) * 0.12 * (1 + 0.15 * (i % 2)), 0.86 + Math.sin(a) * 0.12 * (1 + 0.15 * (i % 2)), d - 0.01); }), N, 0.02);   // the mane
  for (const [a, b] of [[[-0.06, 0.32], [-0.1, 0.25]], [[0.0, 0.32], [0.04, 0.25]], [[0.03, 0.7], [0.14, 0.62]], [[0.0, 0.66], [0.1, 0.52]]]) tube(out, P(0, 0, d), u, [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.02], b], [[0.025, 0.025], [0.022, 0.022], [0.018, 0.018]], 5);   // the legs
  tube(out, P(0, 0, d), u, [[-0.1, 0.36], [-0.16, 0.45], [-0.16, 0.58], [-0.1, 0.62], [-0.08, 0.56]], [[0.02, 0.02], [0.02, 0.02], [0.022, 0.022], [0.025, 0.025], [0.015, 0.015]], 5);   // the tail
}
