// The stone-walled towns of the Zimbabwe plateau (14th c.; docs/settlements/great-zimbabwe.md §4):
// mortarless walls of dressed granite blocks, battered, curving, with a chevron band near the top;
// the solid conical tower; houses of daga (clay) with conical thatched roofs.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import '../qing/index.js';

const G = 'granite_block';
// a smooth curve through the points (Catmull-Rom), resampled about every `step` metres
function smoothPath(pts, closed, step = 1.6) {
  const n = pts.length, out = [], P = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      const f = (c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
const hash = (i, k = 0) => { let h = Math.imul(i * 7919 + k * 104729 + 13, 2654435761); h ^= h >>> 15; return (h >>> 0) / 4294967296; };

/**
 * dry_wall: a curving wall along `pts` { h, th, y (or yAt(x, z)), chevron (true, or [f0, f1] of its
 * length), monoliths, closed } — mortarless granite courses, battered on both faces, the ends of an
 * open wall rounded (as at the entrances), the top a little uneven; the chevron band near the top.
 */
function dryWall(el, { bag, col }) {
  const h = el.h ?? 6, th = el.th ?? 3, closed = el.closed, bat = th * 0.17;
  const path = smoothPath(el.pts, closed), n = path.length, yOf = (p) => (el.yAt ? el.yAt(p[0], p[1]) : el.y ?? 0);
  // frames: the outward normal at each point (mitred), the cumulative length
  const fr = [], len = [0];
  for (let i = 0; i < n; i++) {
    const pr = path[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], nx = path[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    const dx = nx[0] - pr[0], dz = nx[1] - pr[1], L = Math.hypot(dx, dz) || 1;
    fr.push([dz / L, -dx / L]);
    if (i) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  }
  const total = len[n - 1] + (closed ? Math.hypot(path[0][0] - path[n - 1][0], path[0][1] - path[n - 1][1]) : 0);
  // the top undulates by a few courses; the section: footing, battered faces, the top
  const top = (i) => h * (1 - 0.05 * hash(Math.floor(len[i] / 7)) - 0.03 * Math.sin(len[i] * 0.11));
  const sect = (i) => {
    const [x, z] = path[i], [nx, nz] = fr[i], y = yOf(path[i]), H = top(i), w0 = th / 2, w1 = th / 2 - bat;
    const P = (u, v) => [x + nx * u, y + v, z + nz * u];
    return [P(w0, -1), P(w0, 0), P(w1, H), P(-w1, H), P(-w0, 0), P(-w0, -1)];
  };
  const tri = [], S = path.map((_, i) => sect(i)), segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const A = S[i], B = S[(i + 1) % n];
    for (let k = 0; k < 5; k++) tri.push(...A[k], ...B[k], ...B[k + 1], ...A[k], ...B[k + 1], ...A[k + 1]);
    col.segment(path[i], path[(i + 1) % n], th, yOf(path[i]) - 1, yOf(path[i]) + h);
  }
  bag.add(G, fromTriangles(orientOutward(tri)));
  // the rounded ends of an open wall
  if (!closed) for (const i of [0, n - 1]) {
    const [x, z] = path[i], y = yOf(path[i]);
    bag.add(G, lathe([[th / 2, -1], [th / 2, 0], [th / 2 - bat, top(i)], [0.001, top(i)]], 18, null, x, y, z));
  }
  // the chevron band: blocks set on edge in a zigzag between two plain courses, on the outer face
  const ch = el.chevron === true ? [0, 1] : el.chevron;
  if (ch) {
    const tris = [];
    for (let i = 0; i < segs; i++) {
      const f = len[i] / total;
      if (f < ch[0] || f > ch[1]) continue;
      const a = path[i], b = path[(i + 1) % n], y = yOf(a), H = Math.min(top(i), top((i + 1) % n));
      const off = (v) => th / 2 - bat * (v / h) + 0.03;
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = uz, nz = -ux;
      for (const v0 of [H - 1.55, H - 0.6]) {
        const o = off(v0);
        bag.add('granite_grey', orientedBox([a[0] + nx * o, a[1] + nz * o], [b[0] + nx * o, b[1] + nz * o], 0.1, y + v0, y + v0 + 0.15, 0.02));
      }
      const o = off(H - 1.0), mid = y + H - 1.0;
      for (let t = 0; t < L - 0.05; t += 0.4) {
        const up = Math.floor((len[i] + t) / 0.4) % 2 === 0, t1 = Math.min(L, t + 0.4);
        const p0 = [a[0] + ux * t + nx * o, a[1] + uz * t + nz * o], p1 = [a[0] + ux * t1 + nx * o, a[1] + uz * t1 + nz * o];
        const q0 = up ? mid - 0.32 : mid + 0.18, q1 = up ? mid + 0.18 : mid - 0.32;
        // one block on edge, sloping from q0 to q1 across the step: a thin parallelogram
        const P = (p, yy, d) => [p[0] + nx * d, yy, p[1] + nz * d];
        const a0 = P(p0, q0, 0), a1 = P(p1, q1, 0), a2 = P(p1, q1 + 0.14, 0), a3 = P(p0, q0 + 0.14, 0);
        const b0 = P(p0, q0, 0.09), b1 = P(p1, q1, 0.09), b2 = P(p1, q1 + 0.14, 0.09), b3 = P(p0, q0 + 0.14, 0.09);
        const qd = (A, B, C, D) => tris.push(...A, ...B, ...C, ...A, ...C, ...D);
        qd(b0, b1, b2, b3); qd(a3, a2, b2, b3); qd(a0, b0, b3, a3); qd(a1, a2, b2, b1); qd(a0, a1, b1, b0);
      }
    }
    if (tris.length) bag.add('granite_grey', fromTriangles(orientOutward(tris)));
  }
  // monoliths: tall stones standing on the wall top, a few metres apart
  if (el.monoliths) {
    const [f0, f1] = el.monoliths;
    for (let d = f0 * total + 3; d < f1 * total; d += 5.5) {
      const i = len.findIndex((l) => l >= d);
      if (i < 0) break;
      const [x, z] = path[i], [nx, nz] = fr[i], y = yOf(path[i]) + top(i), hh = 1.2 + hash(i, 3) * 1.4;
      bag.add('granite_grey', orientedBox([x - nz * 0.18, z + nx * 0.18], [x + nz * 0.18, z - nx * 0.18], 0.32, y - 0.2, y + hh));
    }
  }
}
/** cone_tower: the solid conical tower { c, r, h, y }. */
function coneTower(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 2.7, h = el.h ?? 10, y = el.y ?? 0;
  bag.add(G, lathe([[r, 0], [r * 0.58, h], [0.001, h]], 20, null, x, y - 0.5, z)); col.circle(x, z, r, y, y + h);
}
/** daga_hut: { c, r, y, h } — a round house of clay, a conical thatched roof. */
function hut(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 3, y = el.y ?? 0, h = el.h ?? 2.2;
  bag.add('mud_plaster', lathe([[r, 0], [r, h], [0.001, h]], 14, null, x, y - 0.3, z));
  bag.add('thatch', lathe([[r + 0.7, 0], [r * 0.5, r * 0.75], [0.001, r * 1.25]], 14, null, x, y - 0.3 + h - 0.2, z));
  col.circle(x, z, r, y, y + h);
}
registerStyle('zimbabwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dry_wall: dryWall, cone_tower: coneTower, daga_hut: hut },
  objects: {},
});
