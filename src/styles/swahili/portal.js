// Pointed openings of the Great Mosque's walls (docs/settlements/kilwa.md §21): doorways and windows with the
// pointed head of two arcs, framed in stepped bands of dressed coral (an archivolt with jambs), pierced
// screens of coral bars in the windows and over the doors' lintels; and the mouldings on the hall's arches.
import { face } from './kit.js';

const L = 'limestone';
/** The left arc's points [x, y] from the jamb (u − hw, vS) toward the crown, radius r about (u + hw, vS), up to x = u. */
function arc(u, hw, vS, r, N) {
  const te = Math.PI - Math.acos(Math.min(1, hw / r)), P = [];
  for (let k = 0; k <= N; k++) { const th = Math.PI + (te - Math.PI) * k / N; P.push([u + hw + r * Math.cos(th), vS + r * Math.sin(th)]); }
  return P;
}
/**
 * One pointed opening in a wall of thickness th whose outer face lies at coordinate zz (outward sign sg),
 * along x (alongX) or z; opening from v0 to the crown at u ± hw, springing at vS. Fills the hole's corners
 * above the springing, and puts the surround bands ([width, proud] outward from the opening) on the outer
 * face and the first band on the inner face. Returns the height of the crown arch at a given u.
 */
export function boxSoup(out, x0, y0, z0, x1, y1, z1) {
  const A = [x0, y0, z0], B = [x1, y0, z0], C = [x1, y1, z0], D = [x0, y1, z0], E = [x0, y0, z1], F = [x1, y0, z1], G = [x1, y1, z1], H = [x0, y1, z1];
  face(out, [0, 0, -1], A, D, C, B); face(out, [0, 0, 1], E, F, G, H); face(out, [-1, 0, 0], A, E, H, D); face(out, [1, 0, 0], B, C, G, F); face(out, [0, 1, 0], D, H, G, C); face(out, [0, -1, 0], A, B, F, E);
}
export function pointedOpening(acc, { alongX, zz, sg, u, hw, v0, vS, th = 0.8, bands = [[0.15, 0.06], [0.13, 0.03]], fill = 'lime_plaster_rough', inner = true }) {
  const N = 8, R = 2 * hw, vA = vS + hw * Math.sqrt(3);
  const W = (a, v, d) => (alongX ? [a, v, zz + sg * d] : [zz + sg * d, v, a]);
  const nOut = alongX ? [0, 0, sg] : [sg, 0, 0], nIn = nOut.map((q) => -q), al = alongX ? [1, 0, 0] : [0, 0, 1];
  const bx = (m, a0, b0, a1, b1, d0, d1) => { const p = zz + sg * d0, q = zz + sg * d1; if (alongX) boxSoup(acc.T, a0, b0, Math.min(p, q), a1, b1, Math.max(p, q)); else boxSoup(acc.T, Math.min(p, q), b0, a0, Math.max(p, q), b1, a1); void m; };
  const F = acc.F, T = acc.T;
  const P0 = arc(u, hw, vS, R, N);
  for (const s of [-1, 1]) {
    const X = (x) => (s < 0 ? x : 2 * u - x), cor = [X(u - hw), vA];
    for (let k = 0; k < N; k++) {
      const a = P0[k], b = P0[k + 1];
      for (const [d, n] of [[0, nOut], [-th, nIn]]) face(F, n, W(cor[0], cor[1], d), W(X(a[0]), a[1], d), W(X(b[0]), b[1], d));
      face(F, al.map((q) => -s * q * 0.6).map((q, i) => q + (i === 1 ? -1 : 0)), W(X(a[0]), a[1], 0), W(X(b[0]), b[1], 0), W(X(b[0]), b[1], -th), W(X(a[0]), a[1], -th));
    }
  }
  void fill;
  const band = (o, w, pr0, d0, e) => {
    const r0 = R + o, r1 = R + o + w, A = arc(u, hw, vS, r0, N), B = arc(u, hw, vS, r1, N), pr = e * pr0, nf = nOut.map((q) => q * e);
    for (const s of [-1, 1]) {
      const X = (x) => (s < 0 ? x : 2 * u - x);
      for (let k = 0; k < N; k++) {
        const a = A[k], a2 = A[k + 1], b = B[k], b2 = B[k + 1];
        face(T, nf, W(X(a[0]), a[1], d0 + pr), W(X(a2[0]), a2[1], d0 + pr), W(X(b2[0]), b2[1], d0 + pr), W(X(b[0]), b[1], d0 + pr));
        face(T, [-s * 0.7, -0.7, 0], W(X(a[0]), a[1], d0), W(X(a2[0]), a2[1], d0), W(X(a2[0]), a2[1], d0 + pr), W(X(a[0]), a[1], d0 + pr));
        face(T, [s * 0.7, 0.7, 0], W(X(b[0]), b[1], d0), W(X(b2[0]), b2[1], d0), W(X(b2[0]), b2[1], d0 + pr), W(X(b[0]), b[1], d0 + pr));
      }
    }
    for (const s of [-1, 1]) bx(L, s < 0 ? u - hw - o - w : u + hw + o, v0, s < 0 ? u - hw - o : u + hw + o + w, vS, d0, d0 + pr);
  };
  let o = 0;
  for (const [w, pr] of bands) { band(o, w, pr, 0, 1); o += w; }
  if (inner) band(0, bands[0][0], bands[0][1], -th, -1);
  return (x) => { const dx = Math.abs(x - u); return dx >= hw ? vS : vS + Math.sqrt(Math.max(0, R * R - (dx + hw) ** 2)); };
}
/**
 * The moulding of an arch of the hall (the pointedSpandrel of the same arguments): on each face a band of
 * dressed coral 0.16 high and 0.045 proud along the intrados, with a lip on its lower edge. Pushes triangles on `out`.
 */
export function archMould(out, x, t, zA, zB, ys, yT, alongX = false, kR = 0.6) {
  const span = zB - zA, R = span * kR, N = 10, P = [], bh = 0.16, pr = 0.045;
  for (let k = 0; k <= N; k++) {
    const z = zA + span * k / N, c = z <= zA + span / 2 ? zA + R : zB - R;
    P.push([z, Math.min(yT - 0.05, ys + Math.sqrt(Math.max(0, R * R - (z - c) * (z - c))))]);
  }
  const V = (sx, z, y, d) => (alongX ? [z, y, x + sx * (t + d)] : [x + sx * (t + d), y, z]);
  for (let k = 0; k < N; k++) {
    const [za, ya] = P[k], [zb, yb] = P[k + 1], ta = Math.min(yT - 0.02, ya + bh), tb = Math.min(yT - 0.02, yb + bh);
    for (const sx of [-1, 1]) {
      const n = alongX ? [0, 0, sx] : [sx, 0, 0];
      face(out, n, V(sx, za, ya, pr), V(sx, zb, yb, pr), V(sx, zb, tb, pr), V(sx, za, ta, pr));
      face(out, [0, -1, 0], V(sx, za, ya, 0), V(sx, zb, yb, 0), V(sx, zb, yb, pr), V(sx, za, ya, pr));
    }
  }
}
