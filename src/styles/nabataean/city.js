// The city in the valley of Petra (docs/settlements/petra.md §12): the colonnaded street with its raised
// porticoes and the shops behind the southern one; the Great Temple's precinct — the propylaeum from the
// street, the lower temenos paved in white hexagons between its triple colonnades and their exedrae, the
// stairs up to the upper temenos, the temple tetrastyle in antis with the theatron inside, its columns
// stuccoed red and white; the temenos of Qasr al-Bint with its benches and the great altar before the
// temple, and the temple itself: the podium and its marble stair with a landing, four columns in antis,
// the pronaos, the naos, the tripartite adyton with the raised platform of the god, the wooden string
// courses in the ashlar, the Doric frieze of rosettes, the pediment.

import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { floralCapital } from './khazneh.js';

const R = 'sandstone_rose', A = 'sandstone_rose_ashlar', ST = 'stucco', RED = 'stucco_red';

/** A column: Attic base, the shaft (its foot stuccoed red to `dado` where given), the floral capital; its collider. */
function pillar(bag, C, x, z, y, h, r, { shaft = A, cap = A, dado = 0 } = {}) {
  bag.add(cap, lathe([[r * 1.42, 0], [r * 1.42, 0.1 * r * 2], [r * 1.28, 0.2 * r * 2], [r * 1.16, 0.28 * r * 2], [r * 1.24, 0.36 * r * 2], [r * 1.08, 0.45 * r * 2], [r, 0.5 * r * 2]], 16, null, x, y, z));
  const yb = y + r, capH = Math.min(1.6, r * 2.2), L = h - r - capH;
  if (dado > 0) {
    bag.add(RED, lathe([[r, 0], [r * (1 - 0.1 * dado / L), dado]], 16, null, x, yb, z));
    bag.add(shaft, lathe([[r * (1 - 0.1 * dado / L), 0], [r * 0.9, L - dado]], 16, null, x, yb + dado, z));
  } else bag.add(shaft, lathe([[r, 0], [r * 0.9, L]], 16, null, x, yb, z));
  floralCapital(bag, cap, x, y + h - capH, z, r * 0.9, capH);
  C.circle(x, z, r * 1.1, y, y + h);
}
/** An ellipsoid (centre c, radii along x, y, z), turned by yaw about y. */
function ell(c, rx, ry, rz, yaw = 0, seg = 8) {
  const g = lathe([[0.001, -1], [0.6, -0.8], [0.92, -0.38], [1, 0], [0.92, 0.38], [0.6, 0.8], [0.001, 1]], seg);
  g.scale(rx, ry, rz); g.applyMatrix4(new Matrix4().makeRotationY(yaw)); g.translate(c[0], c[1], c[2]);
  return g;
}
/** The elephant heads under the corners of a capital's abacus (the Great Temple's lower temenos): head, ears, trunk curled down. */
function elephants(bag, mat, x, y, z, r) {
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2, f = [Math.cos(a), Math.sin(a)], s = r * 0.42, p = (d, v) => [x + f[0] * d, y + v, z + f[1] * d], yaw = -a;
    bag.add(mat, ell(p(r * 1.25, 0), s * 0.8, s, s * 0.9, yaw));
    for (const side of [-1, 1]) { const l = [-f[1] * side, f[0] * side]; bag.add(mat, ell([x + f[0] * r * 1.12 + l[0] * s * 0.95, y + s * 0.1, z + f[1] * r * 1.12 + l[1] * s * 0.95], s * 0.25, s * 0.85, s * 0.7, yaw)); }
    bag.add(mat, ell(p(r * 1.25 + s * 0.7, -s * 0.85), s * 0.28, s * 0.75, s * 0.28, yaw));
    bag.add(mat, ell(p(r * 1.25 + s * 0.85, -s * 1.6), s * 0.3, s * 0.2, s * 0.24, yaw));
  }
}
/** A gable: a triangular prism along z from z0 to z1, eaves at y over x0…x1, its ridge `rise` higher. */
function gable(bag, mat, x0, x1, z0, z1, y, rise) {
  const xm = (x0 + x1) / 2, t = [], q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
  q([x0, y, z0], [xm, y + rise, z0], [xm, y + rise, z1], [x0, y, z1]); q([xm, y + rise, z0], [x1, y, z0], [x1, y, z1], [xm, y + rise, z1]);
  t.push(x0, y, z0, x1, y, z0, xm, y + rise, z0); t.push(x0, y, z1, xm, y + rise, z1, x1, y, z1);
  q([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]);
  bag.add(mat, fromTriangles(orient(t, [xm, y + rise / 3, (z0 + z1) / 2])));
}
/** Wind every triangle away from an inner point (for convex solids). */
function orient(t, c) {
  for (let i = 0; i < t.length; i += 9) {
    const a = t.slice(i, i + 3), b = t.slice(i + 3, i + 6), d = t.slice(i + 6, i + 9);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const m = [(a[0] + b[0] + d[0]) / 3 - c[0], (a[1] + b[1] + d[1]) / 3 - c[1], (a[2] + b[2] + d[2]) / 3 - c[2]];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
  }
  return t;
}
/** White hexagonal pavers, each 2 cm proud of its bed with a joint between, over the rectangle (skipping `holes`). */
function hexPaving(bag, mat, r0, y, holes = [], R6 = 0.55) {
  const t = [], w = Math.sqrt(3) * R6, rr = R6 - 0.025, top = y + 0.02, inHole = (x, z) => holes.some((h) => x > h[0] - 0.5 && x < h[2] + 0.5 && z > h[1] - 0.5 && z < h[3] + 0.5);
  let row = 0;
  for (let z = r0[1] + R6; z < r0[3] - R6 * 0.5; z += R6 * 1.5, row++) {
    for (let x = r0[0] + w / 2 + (row % 2) * w / 2; x < r0[2] - w / 2; x += w) {
      if (inHole(x, z)) continue;
      const P = []; for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; P.push([x + Math.cos(a) * rr, z + Math.sin(a) * rr]); }
      for (let k = 1; k < 5; k++) t.push(P[0][0], top, P[0][1], P[k + 1][0], top, P[k + 1][1], P[k][0], top, P[k][1]);
      for (let k = 0; k < 6; k++) { const a = P[k], b = P[(k + 1) % 6]; t.push(a[0], y, a[1], a[0], top, a[1], b[0], top, b[1], a[0], y, a[1], b[0], top, b[1], b[0], y, b[1]); }
    }
  }
  bag.add(mat, fromTriangles(t));
}
/** A flight rising toward `dir` across rect from y0 to y1 in steps of about `riser`. */
function steps(bag, C, r, y0, y1, dir, mat = A, riser = 0.18) {
  const n = Math.max(1, Math.round((y1 - y0) / riser));
  for (let i = 0; i < n; i++) {
    const f0 = i / n, yt = y0 + (y1 - y0) * (i + 1) / n;
    const q = dir === 's' ? [r[0], r[1] + (r[3] - r[1]) * f0, r[2], r[3]] : dir === 'n' ? [r[0], r[1], r[2], r[3] - (r[3] - r[1]) * f0] : dir === 'e' ? [r[0] + (r[2] - r[0]) * f0, r[1], r[2], r[3]] : [r[0], r[1], r[2] - (r[2] - r[0]) * f0, r[3]];
    bag.add(mat, box(q[0], y0 - 0.3, q[1], q[2], yt, q[3]));
  }
  C.ramp(r, y0, y1, dir);
}

/**
 * colonnade_street { a, b (its ends, east and west, on one z), w (the paving), pd (the porticoes' depth), h (the
 * columns), gaps ([x0, x1] where no shops stand: the precinct of the Great Temple) }: the paved street between
 * two raised porticoes, three steps up to each; the columns with floral capitals under the architrave; the
 * porticoes' timber ceilings and flat roofs; behind the southern one a row of shops, each with its doorway, a
 * stone counter and a partition either side; the northern one closed by a wall toward the wadi.
 */
export function colonnadeStreet(el, { bag, col: C }) {
  const z = el.a[1], xa = Math.min(el.a[0], el.b[0]), xb = Math.max(el.a[0], el.b[0]), w = el.w ?? 6, pd = el.pd ?? 5, h = el.h ?? 6, gaps = el.gaps ?? [];
  const yf = 0.45, top = h + 0.7, inGap = (x) => gaps.some(([g0, g1]) => x > g0 && x < g1);
  bag.add('flagstone', box(xa, -0.3, z - w / 2, xb, 0.05, z + w / 2)); C.floor([xa, z - w / 2, xb, z + w / 2], 0.05);
  const n = Math.floor((xb - xa) / 3.6), sp = (xb - xa) / n;
  for (const s of [-1, 1]) {
    const e = z + s * w / 2, Z = (o) => e + s * o, Rz = (o0, o1) => [Math.min(Z(o0), Z(o1)), Math.max(Z(o0), Z(o1))];
    // the steps and the portico's floor
    for (let k = 0; k < 3; k++) { const [q0, q1] = Rz(k * 0.3, 0.9 + pd); bag.add(A, box(xa, -0.3, q0, xb, 0.15 * (k + 1), q1)); }
    for (let k = 0; k < 3; k++) { const [q0, q1] = Rz(k * 0.3, k * 0.3 + 0.3); C.floor([xa, q0, xb, q1], 0.15 * (k + 1)); }
    const [f0, f1] = Rz(0.9, 0.9 + pd); C.floor([xa, f0, xb, f1], yf);
    // the columns and the architrave
    const zc = Z(1.3);
    for (let i = 0; i <= n; i++) pillar(bag, C, xa + i * sp, zc, yf, h - yf, 0.36);
    bag.add(A, box(xa - 0.5, h, zc - 0.5, xb + 0.5, top, zc + 0.5));
    bag.add(A, box(xa - 0.6, top - 0.18, zc - 0.62, xb + 0.6, top, zc + 0.62));
    // the back: the shops (south) or the wall (north); the ceiling and the roof where there is a back to carry them
    const zb = Z(0.9 + pd);
    const runs = []; { let p = xa; for (const [g0, g1] of [...gaps].sort((q, r) => q[0] - r[0])) { if (s > 0 && g0 > p) runs.push([p, g0]); if (s > 0) p = Math.max(p, g1); } if (xb > p) runs.push([p, xb]); }
    for (const [r0, r1] of s > 0 ? runs : [[xa, xb]]) {
      const [c0, c1] = [Math.min(zc + s * 0.62, zb), Math.max(zc + s * 0.62, zb)];
      bag.add('timber', box(r0, h + 0.15, c0, r1, h + 0.3, c1));
      bag.add('plaster', box(r0, h + 0.3, c0, r1, top, c1)); C.floor([r0, c0, r1, c1], top);
      if (s < 0) { const [b0, b1] = Rz(0.9 + pd, 1.5 + pd); bag.add(A, box(r0, -0.3, b0, r1, top, b1)); C.rect([r0, b0, r1, b1], 0, top); continue; }
      // the shops: a front wall with a doorway into each, partitions, the back wall, a counter inside the door
      const sd = 6.4, [w0, w1] = Rz(0.9 + pd, 1.5 + pd), [k0, k1] = Rz(0.9 + pd + sd - 0.6, 0.9 + pd + sd), [i0, i1] = Rz(1.5 + pd, 0.9 + pd + sd - 0.6);
      bag.add(A, box(r0, -0.3, k0, r1, top, k1)); C.rect([r0, k0, r1, k1], 0, top);
      bag.add('flagstone', box(r0, -0.3, i0, r1, yf, i1)); C.floor([r0, i0, r1, i1], yf);
      bag.add('timber', box(r0, h + 0.15, i0, r1, h + 0.3, i1)); bag.add('plaster', box(r0, h + 0.3, i0, r1, top, i1)); C.floor([r0, i0, r1, i1], top);
      const ns = Math.max(1, Math.round((r1 - r0) / 4.6)), ws = (r1 - r0) / ns;
      for (let i = 0; i < ns; i++) {
        const sx0 = r0 + i * ws, m = sx0 + ws / 2, dw = Math.min(2.2, ws - 1.4);
        for (const [p0, p1] of [[sx0, m - dw / 2], [m + dw / 2, sx0 + ws]]) { bag.add(A, box(p0, -0.3, w0, p1, top, w1)); C.rect([p0, w0, p1, w1], 0, top); }
        bag.add(A, box(m - dw / 2, yf + 2.9, w0, m + dw / 2, top, w1));
        bag.add(A, box(m - dw / 2 - 0.25, yf + 2.9, w0 - 0.08, m + dw / 2 + 0.25, yf + 3.25, w1 + 0.08));            // the lintel
        bag.add('flagstone', box(m - dw / 2, yf - 0.02, w0, m + dw / 2, yf + 0.04, w1));                          // the threshold
        const ck = s > 0 ? [i0 + 0.6, i0 + 1.2] : [i1 - 1.2, i1 - 0.6];
        bag.add(A, box(sx0 + 0.9, yf, ck[0], m - dw / 2 + 0.2, yf + 0.95, ck[1])); C.rect([sx0 + 0.9, ck[0], m - dw / 2 + 0.2, ck[1]], yf, yf + 0.95);
        if (i > 0) { bag.add(A, box(sx0 - 0.3, yf, i0, sx0 + 0.3, h + 0.15, i1)); C.rect([sx0 - 0.3, i0, sx0 + 0.3, i1], yf, h + 0.15); }
      }
      for (const xe of [r0, r1]) { const q = xe === r0 ? [r0, r0 + 0.6] : [r1 - 0.6, r1]; bag.add(A, box(q[0], -0.3, i0, q[1], h + 0.15, i1)); C.rect([q[0], i0, q[1], i1], 0, h + 0.15); }
    }
  }
}

/**
 * great_temple { rect [x0, z0, x1, z1] (the precinct, its north side on the street's shops' line) }: the
 * propylaeum's stair and four columns; the lower temenos 1.5 m up, paved in white hexagons, a triple
 * colonnade down each side with elephant-headed capitals on the inner row, a semicircular exedra at the south
 * end of each; the retaining wall with its two stairways up to the upper temenos 4.7 m up, paved the same;
 * the temple on its podium: tetrastyle in antis (the middle columns 7 m apart, the outer 5 m beyond), two more
 * in the pronaos, the cella with its columns round the theatron, a tiled gable roof and pediment; all columns
 * stuccoed white with their feet red.
 */
export function greatTemple(el, { bag, col: C }) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, yL = 1.5, yU = 4.7, zR = z0 + 37.5, zW = z0 + 0.8, wallTop = 8.4;
  // the precinct's walls: west, east and south full height, the north low but for the propylaeum
  for (const r of [[x0 - 1, z0, x0, z1 + 1], [x1, z0, x1 + 1, z1 + 1], [x0, z1, x1, z1 + 1]]) { bag.add(A, box(r[0], -0.5, r[1], r[2], wallTop, r[3])); C.rect(r, -0.5, wallTop); }
  const pw = [cx - 12, cx + 12];
  for (const r of [[x0, z0, pw[0], zW], [pw[1], z0, x1, zW]]) { bag.add(A, box(r[0], -0.5, r[1], r[2], wallTop, r[3])); C.rect(r, -0.5, wallTop); }
  // the lower temenos and its stair up from the street's portico
  const zs = zW + 2.8;
  for (const r of [[x0, zW, pw[0], zR], [pw[1], zW, x1, zR], [pw[0], zs, pw[1], zR]]) { bag.add(R, box(r[0], -0.5, r[1], r[2], yL, r[3])); C.floor(r, yL + 0.02); }
  steps(bag, C, [pw[0], z0, pw[1], zs], 0.45, yL, 's', 'limestone', 0.15);
  hexPaving(bag, 'limestone', [x0, zW, x1, zR], yL);
  // the propylon: four columns on the stair's head under an entablature, its ends on short antae
  for (const s of [-1, 1]) { const r = [s < 0 ? pw[0] - 1.6 : pw[1], zs, s < 0 ? pw[0] : pw[1] + 1.6, zs + 2.2]; bag.add(A, box(r[0], yL, r[1], r[2], yL + 8.5, r[3])); C.rect(r, yL, yL + 8.5); }
  for (let i = 0; i < 4; i++) pillar(bag, C, pw[0] + 3 + i * 6, zs + 1.1, yL, 7.4, 0.55, { shaft: ST, cap: ST, dado: 1.8 });
  bag.add(A, box(pw[0] - 1.6, yL + 7.4, zs + 0.3, pw[1] + 1.6, yL + 8.5, zs + 1.9));
  bag.add(A, box(pw[0] - 1.8, yL + 8.5, zs + 0.15, pw[1] + 1.8, yL + 8.8, zs + 2.05));
  // the triple colonnades: three rows down each side, roofed, the inner row's capitals with elephant heads
  const zc0 = zs + 4, zc1 = zR - 9.5, nc = Math.max(4, Math.round((zc1 - zc0) / 3.2)), hc = 6;
  for (const s of [-1, 1]) {
    const xs = [2.2, 5.2, 8.2].map((d) => (s < 0 ? x0 + d : x1 - d));
    xs.forEach((x, ri) => {
      for (let k = 0; k <= nc; k++) { const zz = zc0 + k * (zc1 - zc0) / nc; pillar(bag, C, x, zz, yL, hc, 0.36, { shaft: ST, cap: ST, dado: 1.4 }); if (ri === 2) elephants(bag, ST, x, yL + hc - 0.5, zz, 0.36 * 0.9 * 1.42); }
      bag.add(A, box(x - 0.45, yL + hc, zc0 - 0.5, x + 0.45, yL + hc + 0.6, zc1 + 0.5));
    });
    const r = s < 0 ? [x0, zc0 - 0.5, xs[2] + 0.45, zc1 + 0.5] : [xs[2] - 0.45, zc0 - 0.5, x1, zc1 + 0.5];
    bag.add('timber', box(r[0], yL + hc + 0.6, r[1], r[2], yL + hc + 0.75, r[3])); bag.add('plaster', box(r[0], yL + hc + 0.75, r[1], r[2], yL + hc + 1.1, r[3])); C.floor(r, yL + hc + 1.1);
    // the exedra at the colonnade's south end: a half-round of five niches between buttresses, two columns at its mouth, a bench
    const ex = s < 0 ? x0 + 6.4 : x1 - 6.4, ez = zc1 + 3.2, ri = 3.35, ro = 4.6, segs = 10;
    for (let k = 0; k < segs; k++) {
      const a0 = k * Math.PI / segs, a1 = (k + 1) * Math.PI / segs, rm = (ri + ro) / 2 / Math.cos((a1 - a0) / 2);
      const p = [ex + Math.cos(a0) * rm, ez + Math.sin(a0) * rm], q = [ex + Math.cos(a1) * rm, ez + Math.sin(a1) * rm];
      bag.add(A, orientedBox(p, q, ro - ri, yL, yL + 5.8, 0.03)); C.segment(p, q, ro - ri, yL, yL + 5.8);
      if (k % 2 === 1) { const am = (a0 + a1) / 2; bag.add(A, orientedBox([ex + Math.cos(am) * (ri - 0.1), ez + Math.sin(am) * (ri - 0.1)], [ex + Math.cos(am) * (ri - 0.75), ez + Math.sin(am) * (ri - 0.75)], 0.5, yL, yL + 5.8)); }
      const bm = ri - 0.95; bag.add(A, orientedBox([ex + Math.cos(a0) * bm, ez + Math.sin(a0) * bm], [ex + Math.cos(a1) * bm, ez + Math.sin(a1) * bm], 0.45, yL, yL + 0.5, 0.02));
    }
    for (let k = 0; k < segs; k++) { const a0 = k * Math.PI / segs, a1 = (k + 1) * Math.PI / segs, rm = (ri + ro) / 2 / Math.cos((a1 - a0) / 2); bag.add(A, orientedBox([ex + Math.cos(a0) * rm, ez + Math.sin(a0) * rm], [ex + Math.cos(a1) * rm, ez + Math.sin(a1) * rm], ro - ri + 0.45, yL + 5.8, yL + 6.15, 0.03)); }
    bag.add(A, box(ex - ro - 0.2, yL + 5.8, ez - 0.55, ex + ro + 0.2, yL + 6.15, ez + 0.05));
    for (const d of [-1.7, 1.7]) pillar(bag, C, ex + d, ez - 0.2, yL, 5.8, 0.25, { shaft: ST, cap: ST, dado: 1.2 });
  }
  // the retaining wall and the stairs up to the upper temenos
  bag.add(A, box(x0, -0.5, zR, x1, yU, zR + 1)); C.rect([x0, zR, x1, zR + 1], -0.5, yU);
  bag.add(R, box(x0, -0.5, zR + 1, x1, yU, z1)); C.floor([x0, zR, x1, z1], yU + 0.02);
  for (const xm of [cx - 10, cx + 10]) {
    const sr = [xm - 3, zR - 7.2, xm + 3, zR + 1]; steps(bag, C, sr, yL, yU, 's', 'limestone', 0.2);
    for (const s of [-1, 1]) { const q = [s < 0 ? xm - 3.6 : xm + 3, zR - 7.2, s < 0 ? xm - 3 : xm + 3.6, zR]; bag.add(A, box(q[0], yL, q[1], q[2], yU + 0.6, q[3])); C.rect(q, yL, yU + 0.6); }
  }
  // the temple
  const T = [cx - 17.5, zR + 4, cx + 17.5, z1 - 2.5], yP = yU + 1.2, hT = 15, eT = yP + hT;
  hexPaving(bag, 'limestone', [x0, zR + 1, x1, z1], yU, [[T[0] - 1, T[1] - 3.2, T[2] + 1, T[3] + 1]]);
  bag.add(A, box(T[0] - 1, yU - 0.3, T[1], T[2] + 1, yP, T[3] + 1)); C.rect([T[0] - 1, T[1], T[2] + 1, T[3] + 1], yU, yP); C.floor([T[0] - 1, T[1], T[2] + 1, T[3] + 1], yP + 0.02);
  bag.add('marble_floor', box(T[0] + 3, yP, T[1] + 0.2, T[2] - 3, yP + 0.02, T[3] - 2));
  steps(bag, C, [cx - 12, T[1] - 3, cx + 12, T[1]], yU, yP, 's', 'limestone', 0.2);
  // the antae and the side and back walls, 3 m thick, to the entablature
  const wall = (r, y1 = eT) => { bag.add(A, box(r[0], yP, r[1], r[2], y1, r[3])); C.rect(r, yP, y1); };
  wall([T[0], T[1], T[0] + 3, T[3]]); wall([T[2] - 3, T[1], T[2], T[3]]); wall([T[0] + 3, T[3] - 2, T[2] - 3, T[3]]);
  for (const x of [T[0], T[2] - 3]) bag.add(ST, box(x - 0.08, yP - 0.05, T[1] - 0.08, x + 3.08, yP + 0.5, T[1] + 1.2));          // the antae's bases
  // the front: four columns 7 m apart in the middle, 5 m beyond; two in the pronaos; the cella's front wall and its great door
  for (const dx of [-8.5, -3.5, 3.5, 8.5]) pillar(bag, C, cx + dx, T[1] + 1.5, yP, hT, 0.75, { shaft: ST, cap: ST, dado: 3 });
  for (const dx of [-3.5, 3.5]) pillar(bag, C, cx + dx, T[1] + 5.5, yP, hT, 0.75, { shaft: ST, cap: ST, dado: 3 });
  const zF = T[1] + 8, dW = 7;
  wall([T[0] + 3, zF, cx - dW / 2, zF + 1.5]); wall([cx + dW / 2, zF, T[2] - 3, zF + 1.5]);
  bag.add(A, box(cx - dW / 2, yP + 10.1, zF, cx + dW / 2, eT, zF + 1.5));
  for (const s of [-1, 1]) bag.add(ST, box(cx + s * dW / 2 - (s < 0 ? 0.6 : 0.1), yP - 0.05, zF - 0.1, cx + s * dW / 2 + (s > 0 ? 0.6 : 0.1), yP + 10, zF + 1.6));
  bag.add(ST, box(cx - dW / 2 - 0.6, yP + 10, zF - 0.1, cx + dW / 2 + 0.6, yP + 10.8, zF + 1.6));
  // within: columns along the cella's walls and across its back, the theatron between them facing the door
  const zi = zF + 1.5;
  for (const x of [T[0] + 4.6, T[2] - 4.6]) for (let k = 0; k < 4; k++) pillar(bag, C, x, zi + 3 + k * 5, yP, 12, 0.6, { shaft: ST, cap: ST, dado: 2.4 });
  for (let k = 0; k < 6; k++) pillar(bag, C, T[0] + 6.5 + k * (T[2] - T[0] - 13) / 5, T[3] - 3.6, yP, 12, 0.6, { shaft: ST, cap: ST, dado: 2.4 });
  bag.add(A, box(T[0] + 3, yP + 12, zi, T[2] - 3, yP + 12.8, T[3] - 2));
  {
    const tc = [cx, zi + 4.5], r0 = 3.2, r1 = 10, rows = 9, rh = 0.4, tw = (r1 - r0) / rows, segs = 24, at = (a, r) => [tc[0] + Math.cos(a) * r, tc[1] + Math.sin(a) * r];
    for (let i = 0; i < rows; i++) {
      const ra = r0 + i * tw, rb = ra + tw, yt = yP + (i + 1) * rh;
      for (let k = 0; k < segs; k++) { const a0 = k * Math.PI / segs, a1 = (k + 1) * Math.PI / segs, rm = (ra + rb) / 2 / Math.cos((a1 - a0) / 2); bag.add(A, orientedBox(at(a0, rm), at(a1, rm), tw + 0.03, yP, yt, 0.03)); }
      for (let k = 0; k < segs; k += 4) { const a0 = k * Math.PI / segs, a1 = Math.min(Math.PI, (k + 4) * Math.PI / segs); C.segment(at(a0, (ra + rb) / 2), at(a1, (ra + rb) / 2), tw, yP, yt); }
    }
    bag.add('flagstone', lathe([[r0 - 0.05, 0], [r0 - 0.05, 0.05], [0.001, 0.05]], 24, null, tc[0], yP, tc[1]));
  }
  // the entablature all round, the pediment over the front, the tiled roof
  bag.add(A, box(T[0] - 0.3, eT, T[1] - 0.3, T[2] + 0.3, eT + 1.2, T[3] + 0.3));
  bag.add(ST, box(T[0] - 0.3, eT + 1.2, T[1] - 0.35, T[2] + 0.3, eT + 2.0, T[3] + 0.3));
  bag.add(A, box(T[0] - 0.7, eT + 2.0, T[1] - 0.75, T[2] + 0.7, eT + 2.4, T[3] + 0.7));
  gable(bag, A, T[0] - 0.4, T[2] + 0.4, T[1] - 0.45, T[1] + 0.3, eT + 2.4, 4.2);
  gable(bag, 'roof_tile', T[0] - 0.8, T[2] + 0.8, T[1] + 0.3, T[3] + 0.8, eT + 2.4, 4.2);
  // the raking cornices
  for (const s of [-1, 1]) {
    const L = Math.hypot(17.9, 4.2), t = [], P = (u, v, zz) => [cx + s * (17.9 - u), eT + 2.35 + v, zz];
    const n = [4.2 / L, 17.9 / L], th = 0.45;
    const a = P(-0.4, 0, T[1] - 0.85), b = P(17.9, 4.2, T[1] - 0.85), a2 = P(-0.4, 0, T[1] + 0.3), b2 = P(17.9, 4.2, T[1] + 0.3);
    const up = (p) => [p[0] - s * n[0] * th * 0, p[1] + th, p[2]];
    const q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
    q(a, b, b2, a2); q(up(a), up(b), up(b2), up(a2)); q(a, b, up(b), up(a)); q(a2, b2, up(b2), up(a2)); q(a, a2, up(a2), up(a)); q(b, b2, up(b2), up(b));
    bag.add(A, fromTriangles(orient(t, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + th / 2, (a[2] + a2[2]) / 2])));
  }
}

/**
 * qasr { rect (the temple, its front north), podium, h, altar [x, z], court [x0, z0, x1, z1] (the temenos) }: the
 * paved temenos, its south wall with the benches of Aretas IV; the great altar on the axis before the temple,
 * its stair; the temple 28 m square on its podium, the marble stair of 26 steps in two flights with a landing;
 * the porch of four columns between the antae, pilasters along the flanks, stuccoed white on rose ashlar,
 * bands of cedar laid in the walls; the pronaos, the great door, the naos; at its back the adyton in three:
 * the raised platform of the god with its stair and the baetyl on a gilded base in the middle, a room either
 * side with its balcony floor; the Doric frieze of triglyphs and rosettes, the cornice, the pediment and roof.
 */
export function qasr(el, { bag, col: C }) {
  const [x0, z0, x1, z1] = el.rect, pd = el.podium ?? 3, H = el.h ?? 23, cx = (x0 + x1) / 2, th = 2.2, eT = pd + 15.5;
  // the temenos: paving, the south wall with its bench
  if (el.court) {
    const [c0, d0, c1, d1] = el.court;
    bag.add('flagstone', box(c0, -0.3, d0, c1, 0.06, d1)); C.floor([c0, d0, c1, d1], 0.06);
    const sw = [x1 + 2, d1 - 1, c1, d1]; bag.add(A, box(sw[0], -0.3, sw[1], sw[2], 3.2, sw[3])); C.rect(sw, 0, 3.2);
    const bn = [sw[0], d1 - 1.55, c1, d1 - 1]; bag.add(A, box(bn[0], 0.06, bn[1], bn[2], 0.46, bn[3])); C.rect(bn, 0, 0.46);
    bag.add(A, box(bn[0], 0.06, bn[1], bn[2], 0.2, bn[1] + 0.05));
    const ww = [c0 - 1, d0, c0, d1]; bag.add(A, box(ww[0], -0.3, ww[1], ww[2], 3.2, ww[3])); C.rect(ww, 0, 3.2);
  }
  // the altar: a platform of ashlar on a moulded base, its stair from the west, the hearth on top
  if (el.altar) {
    const [ax, az] = el.altar, r = [ax - 6, az - 5, ax + 6, az + 5], ah = 3;
    bag.add(A, box(r[0] - 0.3, -0.3, r[1] - 0.3, r[2] + 0.3, 0.5, r[3] + 0.3));
    bag.add(A, box(r[0], 0.5, r[1], r[2], ah, r[3])); C.rect([r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3], 0, ah); C.floor(r, ah);
    bag.add(A, box(r[0] - 0.25, ah - 0.35, r[1] - 0.25, r[2] + 0.25, ah, r[3] + 0.25));
    steps(bag, C, [r[0] - 4.6, az - 1.8, r[0] - 0.3, az + 1.8], 0.06, ah, 'e', 'marble_floor', 0.2);
    bag.add('limestone', box(ax - 1.2, ah, az - 1.2, ax + 1.2, ah + 0.9, az + 1.2)); C.rect([ax - 1.2, az - 1.2, ax + 1.2, az + 1.2], ah, ah + 0.9);
    bag.add('bronze', box(ax - 0.9, ah + 0.9, az - 0.9, ax + 0.9, ah + 0.95, az + 0.9));
  }
  // the podium and the marble stair in two flights with a landing
  bag.add(A, box(x0 - 0.6, -0.3, z0, x1 + 0.6, pd, z1 + 0.6)); C.rect([x0 - 0.6, z0, x1 + 0.6, z1 + 0.6], 0, pd); C.floor([x0 - 0.6, z0, x1 + 0.6, z1 + 0.6], pd + 0.02);
  bag.add(A, box(x0 - 0.85, pd - 0.3, z0 - 0.25, x1 + 0.85, pd, z1 + 0.85));
  const sw2 = 8, half = pd * 13 / 26, run = 13 * 0.38;
  steps(bag, C, [cx - sw2, z0 - run, cx + sw2, z0], half + 0.02, pd, 's', 'marble_floor', pd / 26);
  bag.add('marble_floor', box(cx - sw2, -0.3, z0 - run - 1.6, cx + sw2, half, z0 - run)); C.floor([cx - sw2, z0 - run - 1.6, cx + sw2, z0 - run], half);
  steps(bag, C, [cx - sw2, z0 - 2 * run - 1.6, cx + sw2, z0 - run - 1.6], 0.06, half, 's', 'marble_floor', pd / 26);
  for (const s of [-1, 1]) { const q = [s < 0 ? cx - sw2 - 0.7 : cx + sw2, z0 - 2 * run - 1.6, s < 0 ? cx - sw2 : cx + sw2 + 0.7, z0]; bag.add(A, box(q[0], -0.3, q[1], q[2], pd + 0.5, q[3])); C.rect(q, 0, pd + 0.5); }
  const y = pd + 0.02;
  const wall = (r, y1 = eT) => { bag.add(A, box(r[0], y, r[1], r[2], y1, r[3])); C.rect(r, y, y1); };
  // the porch: antae either side, four columns between them
  const zP = z0 + 6.5;
  wall([x0, z0, x0 + th, z1]); wall([x1 - th, z0, x1, z1]); wall([x0 + th, z1 - th, x1 - th, z1]);
  const span = (x1 - x0 - 2 * th);
  for (let i = 1; i <= 4; i++) pillar(bag, C, x0 + th + i * span / 5, z0 + 1.6, y, eT - y, 0.9, { shaft: ST, cap: ST });
  // pilasters along the flanks and the back, stuccoed
  for (const [xa, sg] of [[x0, -1], [x1, 1]]) for (let k = 0; k <= 5; k++) { const zz = z0 + 0.6 + k * (z1 - z0 - 1.2) / 5; bag.add(ST, box(sg < 0 ? xa - 0.25 : xa - 0.01, pd - 0.05, zz - 0.55, sg < 0 ? xa + 0.01 : xa + 0.25, eT + 0.05, zz + 0.55)); }
  for (let k = 0; k <= 5; k++) { const xx = x0 + 0.6 + k * (x1 - x0 - 1.2) / 5; bag.add(ST, box(xx - 0.55, pd - 0.05, z1 - 0.01, xx + 0.55, eT + 0.05, z1 + 0.25)); }
  // the wooden string courses, laid in the walls and standing a little out of them
  for (const yy of [y + 3.2, y + 7.6, y + 12]) {
    bag.add('cedar', box(x0 - 0.04, yy, z0 + 0.2, x0 + th + 0.04, yy + 0.22, z1 - 0.2));
    bag.add('cedar', box(x1 - th - 0.04, yy, z0 + 0.2, x1 + 0.04, yy + 0.22, z1 - 0.2));
    bag.add('cedar', box(x0 + 0.3, yy, z1 - th - 0.04, x1 - 0.3, yy + 0.22, z1 + 0.04));
  }
  // the pronaos wall with the great door, the naos
  const dW = 6, dH = 10;
  wall([x0 + th, zP, cx - dW / 2, zP + th]); wall([cx + dW / 2, zP, x1 - th, zP + th]);
  bag.add(A, box(cx - dW / 2, y + dH + 0.1, zP, cx + dW / 2, eT, zP + th));
  for (const s of [-1, 1]) bag.add(ST, box(s < 0 ? cx - dW / 2 - 0.7 : cx + dW / 2 - 0.1, pd - 0.05, zP - 0.12, s < 0 ? cx - dW / 2 + 0.1 : cx + dW / 2 + 0.7, y + dH, zP + th + 0.12));
  bag.add(ST, box(cx - dW / 2 - 0.9, y + dH, zP - 0.12, cx + dW / 2 + 0.9, y + dH + 0.9, zP + th + 0.12));
  // the marble dado round the naos
  const zN0 = zP + th, zA = z1 - th - 8.5;
  for (const r of [[x0 + th, zN0, x0 + th + 0.04, zA], [x1 - th - 0.04, zN0, x1 - th, zA]]) bag.add('marble', box(r[0], y, r[1], r[2], y + 0.7, r[3]));
  bag.add('marble_floor', box(x0 + th, y, zN0, x1 - th, y + 0.02, z1 - th));
  // the adyton in three: the middle open to the naos with its platform and stair; the side rooms walled, doors, balconies
  const third = span / 3, aL = x0 + th + third, aR = x1 - th - third;
  for (const xa of [aL, aR]) wall([xa - 0.6, zA, xa + 0.6, z1 - th]);
  for (const [r0, r1] of [[x0 + th, aL - 0.6], [aR + 0.6, x1 - th]]) {
    const m = (r0 + r1) / 2;
    wall([r0, zA, m - 1, zA + 0.8]); wall([m + 1, zA, r1, zA + 0.8]); bag.add(A, box(m - 1, y + 3.2, zA, m + 1, eT, zA + 0.8));
    bag.add(A, box(r0, y + 5.5, zA + 3.5, r1, y + 5.8, z1 - th));                                                   // the balcony floor
    bag.add(A, box(r0, y + 5.8, zA + 3.4, r1, y + 6.8, zA + 3.6));                                                  // its parapet
  }
  const pf = [aL + 0.6, zA + 1.6, aR - 0.6, z1 - th], ph = 1.6;
  bag.add(A, box(pf[0], y, pf[1], pf[2], y + ph, pf[3])); C.rect(pf, y, y + ph); C.floor(pf, y + ph);
  bag.add('marble', box(pf[0] - 0.03, y, pf[1] - 0.03, pf[2] + 0.03, y + 0.7, pf[1] + 0.01));
  steps(bag, C, [cx - 1.8, zA - 1.2, cx + 1.8, pf[1]], y, y + ph, 's', 'marble_floor', 0.2);
  const bz = (pf[1] + pf[3]) / 2 + 0.8;
  bag.add('gilt_bronze', box(cx - 0.9, y + ph, bz - 0.6, cx + 0.9, y + ph + 0.5, bz + 0.6)); C.rect([cx - 0.9, bz - 0.6, cx + 0.9, bz + 0.6], y + ph, y + ph + 0.5);
  bag.add('basalt', box(cx - 0.42, y + ph + 0.5, bz - 0.3, cx + 0.42, y + ph + 1.75, bz + 0.3));                 // the baetyl, a plain block
  // the ceiling over the naos and the adyton
  bag.add('cedar', box(x0 + th, eT - 0.8, z0 + 2.7, x1 - th, eT, z1 - th));
  // the entablature: architrave, the Doric frieze of triglyphs and rosette metopes, the cornice
  bag.add(A, box(x0 - 0.3, eT, z0 - 0.3, x1 + 0.3, eT + 1.0, z1 + 0.3));
  bag.add(ST, box(x0 - 0.3, eT + 1.0, z0 - 0.3, x1 + 0.3, eT + 2.1, z1 + 0.3));
  const tri = (u0, u1, face) => {
    const n = Math.round((u1 - u0) / 1.7);
    for (let i = 0; i <= n; i++) {
      const u = u0 + i * (u1 - u0) / n;
      if (face === 'n') bag.add(A, box(u - 0.35, eT + 1.0, z0 - 0.42, u + 0.35, eT + 2.1, z0 - 0.3));
      else if (face === 'w') bag.add(A, box(x0 - 0.42, eT + 1.0, u - 0.35, x0 - 0.3, eT + 2.1, u + 0.35));
      else bag.add(A, box(x1 + 0.3, eT + 1.0, u - 0.35, x1 + 0.42, eT + 2.1, u + 0.35));
      if (i < n) {
        const m = u + (u1 - u0) / n / 2, rs = lathe([[0.36, 0], [0.38, 0.05], [0.25, 0.1], [0.08, 0.12], [0.001, 0.13]], 12, (t) => 1 - 0.18 * Math.abs(Math.sin(t * 4)));
        const M = face === 'n' ? new Matrix4().makeRotationX(-Math.PI / 2).setPosition(m, eT + 1.55, z0 - 0.3) : face === 'w' ? new Matrix4().makeRotationZ(Math.PI / 2).setPosition(x0 - 0.3, eT + 1.55, m) : new Matrix4().makeRotationZ(-Math.PI / 2).setPosition(x1 + 0.3, eT + 1.55, m);
        rs.applyMatrix4(M); bag.add(A, rs);
      }
    }
  };
  tri(x0, x1, 'n'); tri(z0, z1, 'w'); tri(z0, z1, 'e');
  bag.add(A, box(x0 - 0.8, eT + 2.1, z0 - 0.8, x1 + 0.8, eT + 2.5, z1 + 0.8));
  // the pediment over the porch and the roof behind it, to the 23 m of its height
  const rise = Math.max(1, H - (eT + 2.5));
  gable(bag, A, x0 - 0.5, x1 + 0.5, z0 - 0.5, z0 + 0.3, eT + 2.5, rise);
  gable(bag, 'roof_tile', x0 - 0.9, x1 + 0.9, z0 + 0.3, z1 + 0.9, eT + 2.5, rise);
}
