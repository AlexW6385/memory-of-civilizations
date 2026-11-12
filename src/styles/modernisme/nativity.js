// The Nativity façade of the Sagrada Família as it stood about 1910 (docs/settlements/barcelona.md §1):
// the four bell towers rising from their square bases, turned round a few metres up, their stumps at
// uneven heights in timber scaffolding; between them the three portals — Faith (north), Charity (the
// middle, the largest) and Hope (south) — each a deep parabolic porch splayed in stepped orders, its
// mouth fringed with stalactites, the great sculpted mass over it grown with foliage and peopled
// with the groups of the Gospel infancy on corbels; the two palm-trunk columns between the portals,
// standing on a sea turtle (south) and a land tortoise (north), crowned with fronds; the Charity
// portal's trumeau, the column of Jesus' genealogy with the serpent coiled round it, carrying the
// Nativity; above the arch the star, the Annunciation and the Coronation; its top still flat and in
// scaffolding where the cypress would rise in the 1930s.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { tube, folded, ball } from '../../objects/kit.js';

const S = 'limestone_yellow', SC = 'sandstone_dressed', W = 'timber';
const quad = (T, A, B, C, D) => T.push(...A, ...B, ...C, ...A, ...C, ...D);
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
/** Turn the triangles of T from i0 on toward the point ref (or away from it). */
function orient(T, i0, ref, away = false) {
  for (let i = i0; i < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const gx = (T[i] + T[i + 3] + T[i + 6]) / 3, gy = (T[i + 1] + T[i + 4] + T[i + 7]) / 3, gz = (T[i + 2] + T[i + 5] + T[i + 8]) / 3;
    const d = nx * (ref[0] - gx) + ny * (ref[1] - gy) + nz * (ref[2] - gz);
    if ((d < 0) !== away) for (let k = 0; k < 3; k++) { const t = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = t; }
  }
}
const nz = (p, q) => Math.sin(p * 1.7 + q * 2.3) * 0.5 + Math.sin(p * 4.1 - q * 3.7 + 1.3) * 0.3 + Math.sin(p * 9.3 + q * 8.1 + 0.7) * 0.2;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Timber scaffolding round a rect: standards at the corners and between, ledgers every 2 m, boards every 4 m, braces. */
export function scaffold(bag, [x0, z0, x1, z1], y0, y1) {
  const xs = [x0, (x0 + x1) / 2, x1], zs = [z0, (z0 + z1) / 2, z1];
  for (const x of xs) for (const z of zs) if (x !== xs[1] || z !== zs[1]) bag.add(W, box(x - 0.09, y0, z - 0.09, x + 0.09, y1, z + 0.09));
  for (let yy = y0 + 2; yy < y1 - 0.2; yy += 2) {
    bag.add(W, box(x0 - 0.07, yy - 0.07, z0 - 0.2, x0 + 0.07, yy + 0.07, z1 + 0.2)); bag.add(W, box(x1 - 0.07, yy - 0.07, z0 - 0.2, x1 + 0.07, yy + 0.07, z1 + 0.2));
    bag.add(W, box(x0 - 0.2, yy + 0.07, z0 - 0.07, x1 + 0.2, yy + 0.21, z0 + 0.07)); bag.add(W, box(x0 - 0.2, yy + 0.07, z1 - 0.07, x1 + 0.2, yy + 0.21, z1 + 0.07));
    if (Math.round(yy - y0) % 4 === 0) {
      bag.add('planks_grey', box(x0 - 0.9, yy + 0.21, z0 + 0.2, x0 - 0.1, yy + 0.26, z1 - 0.2)); bag.add('planks_grey', box(x1 + 0.1, yy + 0.21, z0 + 0.2, x1 + 0.9, yy + 0.26, z1 - 0.2));
      for (const x of [x0 - 0.9, x1 + 0.1]) bag.add(W, box(x, yy - 0.07, z0 + 0.2, x + 0.8, yy + 0.07, z0 + 0.34));
    }
  }
  for (let yy = y0; yy + 4 <= y1; yy += 4) { bag.add(W, rod([x0 - 0.1, yy, z0], [x0 - 0.1, yy + 4, zs[1]], 0.06, 4)); bag.add(W, rod([x1 + 0.1, yy, zs[1]], [x1 + 0.1, yy + 4, z1], 0.06, 4)); bag.add(W, rod([x0, yy, z1 + 0.1], [xs[1], yy + 4, z1 + 0.1], 0.06, 4)); bag.add(W, rod([xs[1], yy, z0 - 0.1], [x1, yy + 4, z0 - 0.1], 0.06, 4)); }
}

// ── Statues ──────────────────────────────────────────────────────────────────────────────────
/**
 * A robed statue standing at p (its soles), h tall, facing +x (the street): the robe in folds, the
 * mantle's fall, the head; `arms` forward (praying, offering), `kneel` lower, `wings` an angel's,
 * `seated` on a block. The façade's figures are of the size of life or larger.
 */
function statue(bag, p, h, o = {}) {
  const [x, y, z] = p, k = o.kneel ? 0.68 : o.seated ? 0.78 : 1, H = h * k, seed = Math.floor(x * 7 + z * 13 + y * 3) >>> 0;
  if (o.seated) bag.add(SC, box(x - 0.28 * h, y, z - 0.24 * h, x + 0.12 * h, y + 0.3 * h, z + 0.24 * h));
  const prof = [[0.17, 0], [0.19, 0.05], [0.17, 0.3], [0.14, 0.55], [0.15, 0.7], [0.12, 0.8], [0.065, 0.84], [0.001, 0.85]].map(([r, v]) => [r * h, v * H]);
  bag.add(SC, folded(prof, 14, 7, 0.16, seed).translate(x, y, z));
  // the mantle falling from the shoulders behind, a second fold
  bag.add(SC, folded([[0.13, 0], [0.16, 0.25], [0.15, 0.55], [0.11, 0.74], [0.001, 0.78]].map(([r, v]) => [r * h, v * H]), 12, 5, 0.22, seed + 1).scale(1, 1, 1.12).translate(x - 0.05 * h, y + 0.04 * H, z));
  bag.add(SC, ball(0.068 * h, 10, 7).translate(x + 0.01 * h, y + 0.84 * H, z));
  if (o.veil) bag.add(SC, lathe([[0.08 * h, 0], [0.085 * h, 0.06 * h], [0.06 * h, 0.13 * h], [0.001, 0.15 * h]], 10).translate(x - 0.01 * h, y + 0.83 * H, z));
  if (o.crown) bag.add('gilt_bronze', lathe([[0.06 * h, 0], [0.065 * h, 0.035 * h], [0.05 * h, 0.035 * h], [0.05 * h, 0.001]], 10).translate(x, y + 0.97 * H, z));
  if (o.arms) for (const s of [-1, 1]) {
    const sh = [x + 0.03 * h, y + 0.74 * H, z + s * 0.12 * h], el = [x + 0.12 * h, y + 0.6 * H, z + s * 0.13 * h], hd = o.arms === 'up' ? [x + 0.2 * h, y + 0.92 * H, z + s * 0.1 * h] : [x + 0.24 * h, y + 0.66 * H, z + s * 0.035 * h];
    bag.add(SC, tube([[...sh, 0.04 * h], [...el, 0.036 * h], [...hd, 0.028 * h]], 6));
  }
  if (o.wings) {
    const T = [];
    for (const s of [-1, 1]) {
      const R = (a, b) => [x - 0.1 * h - a * 0.12 * h, y + 0.72 * H + b * h, z + s * (0.1 * h + a * 0.42 * h)];
      const rim = [[0, 0.02], [0.3, 0.16], [0.65, 0.3], [1, 0.42], [0.95, 0.25], [0.85, 0.08], [0.75, -0.08], [0.6, -0.22], [0.45, -0.34], [0.25, -0.42], [0.1, -0.3], [0, -0.1]];
      for (let i = 0; i + 1 < rim.length; i++) T.push(...R(0.05, 0), ...R(...rim[i]), ...R(...rim[i + 1]));
    }
    bag.add(SC, fromTriangles(both(T)));
  }
}
/** A corbel under a group: a flat shelf over a drooping, leafy cone, its back in the wall. */
function corbel(bag, x, y, z, r) {
  bag.add(SC, lathe([[0.001, -r * 1.3], [r * 0.45, -r * 0.95], [r * 0.8, -r * 0.45], [r, -0.12], [r, 0], [0.001, 0]], 12, (th, i) => (i === 2 ? 1 + 0.12 * Math.cos(th * 5) : 1)).scale(0.7, 0.65, 1).translate(x, y, z));
}
/** Stalactites hanging from a point: a cluster of two or three drips of ice in stone. */
function drips(bag, x, y, z, L, rand) {
  const n = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const l = L * (0.5 + rand() * 0.6), r = 0.07 + l * 0.09, dx = (rand() - 0.5) * 0.25, dz = (rand() - 0.5) * 0.35;
    bag.add(SC, lathe([[r, 0], [r * 0.85, 0.12], [r * 0.55, l * 0.45], [0.001, l]], 5).rotateX(Math.PI).translate(x + dx, y + 0.1, z + dz));
  }
}

// ── The palm columns on their turtles ────────────────────────────────────────────────────────
function turtleColumn(bag, col, x, y, z, sea) {
  // the shell: a sea turtle's flat and long, a tortoise's high and domed, its scutes in a ring of bulges
  const L = sea ? 1.35 : 1.15, Hs = sea ? 0.75 : 1.1, ex = sea ? 0.72 : 0.82, y0 = y + (sea ? 0.18 : 0.38);
  const ell = (th) => 1 / Math.sqrt(Math.cos(th) ** 2 + Math.sin(th) ** 2 / ex ** 2);
  bag.add(SC, lathe([[L, 0], [L * 1.02, 0.08], [L * 0.94, Hs * 0.35], [L * 0.75, Hs * 0.68], [L * 0.45, Hs * 0.9], [0.001, Hs]], 18,
    (th, i) => ell(th) * (i >= 2 && i <= 4 ? 1 + 0.035 * Math.cos(th * 6 + i) : 1)).translate(x, y0, z));
  bag.add(SC, lathe([[L * 0.92, 0], [0.001, 0.001]], 18, (th) => ell(th)).translate(x, y0, z));        // the plastron
  // the head and neck reaching toward the street (+x)
  bag.add(SC, tube([[x + L * 0.85, y0 + 0.15, z, 0.2, 0.17], [x + L + 0.35, y0 + 0.25, z, 0.17, 0.15], [x + L + 0.7, y0 + 0.3, z, 0.15, 0.13]], 8));
  bag.add(SC, ball(0.2, 10, 7).scale(1.35, 1, 1).translate(x + L + 0.75, y0 + 0.18, z));
  // flippers or legs
  for (const [fx, sz] of [[0.6, -1], [0.6, 1], [-0.7, -1], [-0.7, 1]]) {
    if (sea) {
      const front = fx > 0, len = front ? 1.25 : 0.7;
      bag.add(SC, tube([[x + fx * L, y0 + 0.1, z + sz * L * ex * 0.8, 0.22, 0.06], [x + fx * L + (front ? 0.3 : -0.25), y0 + 0.05, z + sz * (L * ex + len * 0.6), 0.2, 0.05], [x + fx * L + (front ? -0.15 : -0.5), y + 0.03, z + sz * (L * ex + len), 0.08, 0.03]], 8));
    } else {
      const px = x + fx * L * 0.85, pz = z + sz * L * ex * 0.85;
      bag.add(SC, tube([[px, y0 + 0.25, pz, 0.2], [px + fx * 0.05, y0 * 0.5 + y * 0.5, pz + sz * 0.12, 0.19], [px + fx * 0.08, y + 0.08, pz + sz * 0.16, 0.21]], 8));
      bag.add(SC, lathe([[0.24, 0], [0.25, 0.08], [0.001, 0.1]], 8, null, px + fx * 0.08, y, pz + sz * 0.16));
    }
  }
  col.circle(x, z, L, y - 1, y + 14);
  // the column: a moulded base on the shell, the trunk of a palm with its ring of leaf scars, the crown of fronds
  const yb = y0 + Hs - 0.12, top = y + 13.2;
  bag.add(SC, lathe([[0.85, 0], [0.88, 0.2], [0.72, 0.32], [0.62, 0.55], [0.56, 0.75]], 14, null, x, yb, z));
  const rows = []; for (let v = 0; v <= top - yb - 0.75; v += 0.22) rows.push([v % 0.44 < 0.2 ? 0.5 : 0.465, v]);
  bag.add(SC, lathe(rows.map(([r, v]) => [r * (1 - v * 0.012), v]), 12, (th, i) => 1 + 0.04 * Math.sin(th * 3 + i * 0.9)).translate(x, yb + 0.75, z));
  bag.add(SC, lathe([[0.36, 0], [0.5, 0.25], [0.42, 0.5], [0.001, 0.62]], 10, null, x, top - 0.2, z));
  for (let k = 0; k < 11; k++) {
    const a = k / 11 * Math.PI * 2 + (sea ? 0.2 : 0), up = k % 2 ? 0.9 : 1.3, L2 = 2.3 + (k % 3) * 0.35;
    const P = (t) => [x + Math.cos(a) * (0.3 + L2 * t), top + up * Math.sin(Math.PI * t * 0.8) - 0.9 * t * t, z + Math.sin(a) * (0.3 + L2 * t)];
    bag.add(SC, tube([[...P(0), 0.14, 0.06], [...P(0.3), 0.3, 0.05], [...P(0.6), 0.26, 0.04], [...P(1), 0.03, 0.02]], 6));
  }
}

// ── The bell towers ──────────────────────────────────────────────────────────────────────────
/** A tower: the square base to bv, a collar turning it round, the round hollow shaft to its 1910 height in scaffolding. */
function tower(bag, col, xc, zc, y, hq, r, bv, top, rand) {
  bag.add(S, box(xc - hq, y - 1.2, zc - hq, xc + hq, y + bv, zc + hq)); col.rect([xc - hq, zc - hq, xc + hq, zc + hq], y - 1.2, y + top);
  for (const v of [7.5, 15]) bag.add('limestone', box(xc - hq - 0.12, y + v, zc - hq - 0.12, xc + hq + 0.12, y + v + 0.35, zc + hq + 0.12));
  bag.add('limestone', box(xc - hq - 0.2, y + bv - 0.45, zc - hq - 0.2, xc + hq + 0.2, y + bv, zc + hq + 0.2));
  // slits in the base's street face and its sides
  const O = [];
  for (const v of [9.5, 17]) {
    quad(O, [xc + hq + 0.02, y + v, zc - 0.25], [xc + hq + 0.02, y + v, zc + 0.25], [xc + hq + 0.02, y + v + 3.2, zc + 0.25], [xc + hq + 0.02, y + v + 3.2, zc - 0.25]);
    for (const s of [-1, 1]) quad(O, [xc + 1.2, y + v, zc + s * (hq + 0.02)], [xc + 0.7, y + v, zc + s * (hq + 0.02)], [xc + 0.7, y + v + 3.2, zc + s * (hq + 0.02)], [xc + 1.2, y + v + 3.2, zc + s * (hq + 0.02)]);
  }
  // the collar from the square to the round
  const sq = (th) => 1 / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
  const rc = r + 0.6;
  bag.add(S, lathe([[rc, 0], [rc, 0.5], [r + 0.3, 1.4], [r, 2.6]], 16, (th, i) => (i < 2 ? 1 + (sq(th) - 1) * 0.55 : 1)).translate(xc, y + bv - 0.01, zc));
  // the shaft, a hollow ring of ashlar, its last course broken off unevenly
  const sh = top - 0.5;
  bag.add(S, lathe([[r, 0], [r, sh - bv], [r - 0.85, sh - bv], [r - 0.85, 0]], 24).translate(xc, y + bv, zc));
  const N = 18;
  for (let i = 0; i < N; i++) {
    if (rand() < 0.3) continue;
    const a0 = i / N * Math.PI * 2 + 0.02, a1 = (i + 1) / N * Math.PI * 2 - 0.02, rm = r - 0.42;
    const p = [xc + Math.cos(a0) * rm, zc + Math.sin(a0) * rm], q = [xc + Math.cos(a1) * rm, zc + Math.sin(a1) * rm];
    const T = [], hh = 0.38 + rand() * 0.15, d = 0.78;
    const nrm = [(Math.cos(a0) + Math.cos(a1)) / 2, (Math.sin(a0) + Math.sin(a1)) / 2];
    const c = (pt, s) => [pt[0] + nrm[0] * s, pt[1] + nrm[1] * s];
    const A = c(p, -d / 2), B = c(q, -d / 2), C = c(q, d / 2), D = c(p, d / 2), Y0 = y + sh, Y1 = y + sh + hh;
    quad(T, [A[0], Y1, A[1]], [B[0], Y1, B[1]], [C[0], Y1, C[1]], [D[0], Y1, D[1]]);
    for (const [E, F] of [[A, B], [B, C], [C, D], [D, A]]) quad(T, [E[0], Y0, E[1]], [F[0], Y0, F[1]], [F[0], Y1, F[1]], [E[0], Y1, E[1]]);
    const i0 = 0; orient(T, i0, [xc + Math.cos((a0 + a1) / 2) * rm, Y0 + hh / 2, zc + Math.sin((a0 + a1) / 2) * rm], true);
    bag.add(S, fromTriangles(T));
  }
  // tall narrow openings round the shaft, staggered as the stair climbs inside
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + 0.2, v0 = bv + 3.5 + (k % 4) * 1.6; if (v0 + 2.6 > sh - 0.6) continue;
    const t = [-Math.sin(a), Math.cos(a)], c = [xc + Math.cos(a) * (r + 0.02), zc + Math.sin(a) * (r + 0.02)];
    const i0 = O.length;
    quad(O, [c[0] - t[0] * 0.22, y + v0, c[1] - t[1] * 0.22], [c[0] + t[0] * 0.22, y + v0, c[1] + t[1] * 0.22], [c[0] + t[0] * 0.22, y + v0 + 2.6, c[1] + t[1] * 0.22], [c[0] - t[0] * 0.22, y + v0 + 2.6, c[1] - t[1] * 0.22]);
    orient(O, i0, [xc, y + v0, zc], true);
  }
  orient(O, 0, [xc, y + 10, zc], true);
  bag.add('opening', fromTriangles(O));
  // the scaffolding stands on the base's top, round the shaft
  const e = hq - 0.25;
  scaffold(bag, [xc - e, zc - e, xc + e, zc + e], y + bv, y + top + 3.2);
}

// ── A portal ─────────────────────────────────────────────────────────────────────────────────
/**
 * A portal: uc its centre along the façade, hw the half width of its mouth, ht the mouth's crown,
 * gt the sculpted mass's crown (flat-topped at ft, unfinished), Xw the doorway's plane, Xf the
 * mouth's plane, Xb the mass's back. Returns the mass's face as a function face(a, b) → [x, v, u]:
 * a across (−1…1), b from the mouth's edge (0) to the mass's outline (1).
 */
function portal(bag, col, P, cz, y, { uc, hw, ht, gt, ft, Xw, Xf, Xb, ho, kb = 0.6, kv = 0.8 }, rand) {
  const how = hw + ho;
  const arch = (a, k = 1, kvv = 1) => [uc + a * hw * k, -1.2 + (ht * kvv + 1.2) * (1 - a * a)];
  const outline = (a) => [uc + a * how, Math.min(ft, -1.2 + (gt + 1.2) * (1 - Math.abs(a) ** 3.2))];
  const depth = (a, b) => Xf + 0.3 + 1.25 * Math.sin(Math.PI * Math.min(1, b * 1.15)) ** 0.7 * (1 - 0.35 * Math.abs(a)) + (0.4 * nz(a * 7 + uc, b * 6) + 0.14 * nz(a * 31 + uc, b * 23)) * Math.sin(Math.PI * b);
  const face = (a, b) => { const [ua, va] = arch(a), [uo, vo] = outline(a); const bb = b; return [depth(a, b), va + (vo - va) * bb, ua + (uo - ua) * bb]; };
  const NA = 64, NB = 18, NS = 24;
  // the sculpted face round the mouth
  const G = [], at = (a, b) => { const [x, v, u] = face(a, b); return P(x, u, v); };
  for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) {
    const a0 = -1 + 2 * i / NA, a1 = -1 + 2 * (i + 1) / NA, b0 = j / NB, b1 = (j + 1) / NB, j0 = G.length;
    quad(G, at(a0, b0), at(a1, b0), at(a1, b1), at(a0, b1));
    orient(G, j0, P(Xf + 40, uc, gt * 0.4));
  }
  // its skin back along the outline to the back plane, and the back
  for (let i = 0; i < NA; i++) {
    const a0 = -1 + 2 * i / NA, a1 = -1 + 2 * (i + 1) / NA, [u0, v0] = outline(a0), [u1, v1] = outline(a1), j0 = G.length;
    quad(G, at(a0, 1), at(a1, 1), P(Xb, u1, v1), P(Xb, u0, v0));
    orient(G, j0, P((Xb + Xf) / 2, uc, Math.min(ft, gt) * 0.45), true);
    const k0 = G.length; G.push(...P(Xb, uc, -1.2), ...P(Xb, u0, v0), ...P(Xb, u1, v1)); orient(G, k0, P(Xb - 5, uc, 10));
  }
  bag.add(SC, fromTriangles(G));
  // the porch: the mouth splayed back to the doorway in three stepped orders, rough as ice and rock
  const st = (s) => { const i = Math.min(2, Math.floor(s * 3)), f = s * 3 - i, t = Math.max(0, Math.min(1, (f - 0.62) / 0.38)); return (i + t * t * (3 - 2 * t)) / 3; };
  const ip = (a, s) => {
    const k = kb + (1 - kb) * st(s), kvv = kv + (1 - kv) * st(s), [u, v] = arch(a, k, kvv), x = Xw + (depth(a, 0) - Xw) * s;
    const n = 0.12 * nz(a * 9 + s * 5, s * 11 + uc);
    return [x, u - Math.sign(a) * n * Math.abs(a), v - n * (1 - Math.abs(a))];
  };
  const I = [];
  for (let i = 0; i < NA; i++) for (let j = 0; j < NS; j++) {
    const a0 = -1 + 2 * i / NA, a1 = -1 + 2 * (i + 1) / NA, s0 = j / NS, s1 = (j + 1) / NS, j0 = I.length;
    const p = (a, s) => { const [x, u, v] = ip(a, s); return P(x, u, v); };
    quad(I, p(a0, s0), p(a1, s0), p(a1, s1), p(a0, s1));
    const [xm, um, vm] = ip((a0 + a1) / 2, (s0 + s1) / 2);
    orient(I, j0, P(xm, uc, vm * 0.3 - 1));
  }
  bag.add(SC, fromTriangles(I));
  // the doorway's darkness at the back
  const D = [];
  for (let i = 0; i < NA; i++) {
    const a0 = -1 + 2 * i / NA, a1 = -1 + 2 * (i + 1) / NA, [ua, va] = arch(a0, kb, kv), [ub, vb] = arch(a1, kb, kv);
    D.push(...P(Xw + 0.03, uc, -1.2), ...P(Xw + 0.03, ua, va), ...P(Xw + 0.03, ub, vb));
  }
  orient(D, 0, P(Xw + 5, uc, 5));
  bag.add('opening', fromTriangles(D));
  // stalactites hanging inside the mouth's rim, and along the orders
  for (let i = 1; i < 44; i++) {
    const a = -1 + 2 * i / 44; if (Math.abs(a) > 0.9) continue;
    const [x, u, v] = ip(a, 0.97); drips(bag, x - 0.25, y + v - 0.05, cz + u - Math.sign(a) * 0.1 * Math.abs(a), 0.5 + 0.9 * (1 - Math.abs(a)) * rand() + 0.3, rand);
    if (i % 2 === 0) { const [x2, u2, v2] = ip(a, 0.64); drips(bag, x2 - 0.2, y + v2 - 0.05, cz + u2, 0.4 + 0.5 * rand(), rand); }
  }
  // the colliders: the mass either side of the mouth, the doorway's wall
  for (const s of [-1, 1]) { const u0 = uc + s * hw * 0.98, u1 = uc + s * how; col.rect([Xb, cz + Math.min(u0, u1), Xf + 1.6, cz + Math.max(u0, u1)], y - 1.2, y + gt); }
  return { face, at, depth, arch, outline, ip };
}

/** A group on a corbel set into the face at (a, b): figures across u, h tall, each with its options. */
function group(bag, pr, cz, y, a, b, figs, h = 2.6, sp = 0.46) {
  const [x, v, u] = pr.face(a, b), half = (figs.length - 1) / 2 * sp * h;
  corbel(bag, x + 0.15, y + v, cz + u, Math.max(0.6, half + 0.22 * h));
  figs.forEach((o, i) => { const du = (i - (figs.length - 1) / 2) * sp * h; statue(bag, [x + 0.15 + (o.dx ?? 0), y + v + (o.dv ?? 0), cz + u + du], o.h ?? h, o); });
}
/** Foliage over the face: leaves and flowers, the façade "full of plants". */
function foliage(bag, pr, cz, y, n, rand, avoid) {
  for (let k = 0; k < n; k++) {
    const a = -0.95 + rand() * 1.9, b = 0.08 + rand() * 0.86;
    if (avoid.some(([aa, bb]) => Math.abs(a - aa) < 0.22 && Math.abs(b - bb) < 0.16)) continue;
    const [x, v, u] = pr.face(a, b), r = 0.22 + rand() * 0.3;
    if (rand() < 0.6) {
      // a knot of leaves and buds swelling out of the stone
      const m = 2 + Math.floor(rand() * 3);
      for (let i = 0; i < m; i++) { const rr = r * (0.55 + rand() * 0.6), ang = rand() * Math.PI * 2, d = r * 0.7 * rand(); bag.add(SC, ball(rr, 7, 5).scale(0.65, 1, 1).translate(x - rr * 0.4, y + v + Math.sin(ang) * d - rr, cz + u + Math.cos(ang) * d)); }
    } else {
      // a flower: a cup of petals turned to the street
      const rf = r * 1.1;
      bag.add(SC, lathe([[0.001, 0], [rf * 0.6, rf * 0.25], [rf, rf * 0.5], [rf * 0.9, rf * 0.62], [rf * 0.55, rf * 0.45], [rf * 0.25, rf * 0.3], [0.001, rf * 0.38]], 10, (th, i) => 1 + (i >= 2 ? 0.09 : 0.04) * Math.cos(th * 6)).rotateZ(-Math.PI / 2).translate(x - 0.1, y + v, cz + u));
    }
  }
}

/** The Charity portal's trumeau: the column of Jesus' genealogy, the serpent coiled round it, its capital carrying the Nativity. */
function trumeau(bag, x, y, z, hc) {
  bag.add(SC, lathe([[0.62, 0], [0.62, 0.35], [0.5, 0.5], [0.42, 0.8], [0.4, hc - 0.9], [0.5, hc - 0.6], [0.72, hc - 0.25], [0.98, hc - 0.05], [0.98, hc]], 14, (th, i) => (i >= 3 && i <= 4 ? 1 + 0.05 * Math.cos(th * 8) : 1), x, y, z));
  // bands of the genealogy's names
  for (let v = 1.4; v < hc - 1.2; v += 0.75) bag.add(SC, lathe([[0.43, 0], [0.45, 0.05], [0.45, 0.12], [0.43, 0.17]], 14, null, x, y + v, z));
  // the serpent, its coils climbing with the apple in its mouth
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 1 / 40) { const a = t * Math.PI * 2 * 2.6, r = 0.5; pts.push([x + Math.cos(a) * r, y + 0.5 + t * (hc - 2.2), z + Math.sin(a) * r, 0.11 - 0.05 * t]); }
  bag.add(SC, tube(pts, 6));
  const e = pts[pts.length - 1]; bag.add(SC, ball(0.11, 8, 6).scale(1.5, 0.9, 1).translate(e[0] + 0.08, e[1] - 0.05, e[2]));
  bag.add('glaze_red', ball(0.08, 8, 6).translate(e[0] + 0.22, e[1] - 0.08, e[2]));
}

/** The star of Bethlehem: rays of stone round a boss, its trail of light flowing up and back. */
function star(bag, x, y, z) {
  bag.add(SC, ball(0.38, 12, 8).translate(x, y - 0.38, z));
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, L = k % 2 ? 0.9 : 1.6; bag.add(SC, lathe([[0.16, 0], [0.001, L]], 6).rotateX(a).translate(x, y, z)); }
  bag.add(SC, tube([[x - 0.1, y + 0.2, z - 0.25, 0.32, 0.2], [x - 0.25, y + 1.2, z - 1.0, 0.26, 0.15], [x - 0.35, y + 2.2, z - 1.5, 0.18, 0.1], [x - 0.45, y + 3.2, z - 1.7, 0.05, 0.04]], 8));
}

/** A small boat (Joseph sailing, at the top of the Hope portal). */
function boat(bag, x, y, z) {
  bag.add(SC, lathe([[0.001, 0], [0.4, 0.06], [0.6, 0.35], [0.62, 0.55]], 12, (th) => 1 / Math.sqrt(Math.cos(th) ** 2 + (Math.sin(th) / 3) ** 2) * 0.33).translate(x, y, z));
  bag.add(SC, rod([x - 0.1, y + 0.4, z], [x - 0.1, y + 3.4, z], 0.06, 6));
  const T = []; T.push(x - 0.12, y + 3.3, z, x - 0.12, y + 1.0, z, x - 0.12, y + 1.1, z + 1.4); bag.add('limestone', fromTriangles(both(T)));
}

/**
 * nativity(bag, col, fx, y, cz): the façade facing east (+x) on the line x = fx, centred at z = cz.
 */
export function nativity(bag, col, fx, y, cz) {
  const rand = rng(1892), P = (x, u, v) => [x, y + v, cz + u];
  const xc = fx + 1, hq = 3.6, r = 2.65;
  // the wall at the back of the porches, running behind the four towers
  bag.add(S, box(fx - 2.4, y - 1.2, cz - 21, fx + 0.6, y + 19, cz + 21)); col.rect([fx - 2.4, cz - 21, fx + 0.6, cz + 21], y - 1.2, y + 19);
  bag.add('limestone', box(fx - 2.55, y + 18.6, cz - 21, fx + 0.75, y + 19.1, cz + 21));
  // the four towers (Faith's side north, Hope's south), at the heights reached about 1910
  for (const [u, top] of [[-21, 30.5], [-7.5, 37.5], [7.5, 40], [21, 32.5]]) tower(bag, col, xc, cz + u, y, hq, r, 24, top, rand);
  // the three portals
  const X = { Xw: fx + 0.6, Xf: fx + 5.2, Xb: fx - 1.6 };
  const faith = portal(bag, col, P, cz, y, { uc: -14.25, hw: 3.4, ht: 17, gt: 31, ft: 28.5, ho: 3.35, ...X }, rand);
  const charity = portal(bag, col, P, cz, y, { uc: 0, hw: 4.2, ht: 21, gt: 40, ft: 36, ho: 3.3, ...X }, rand);
  const hope = portal(bag, col, P, cz, y, { uc: 14.25, hw: 3.4, ht: 17, gt: 31, ft: 28.5, ho: 3.35, ...X }, rand);
  // Charity: the trumeau and the Nativity on its capital; the adorations of the shepherds and the kings at the sides;
  // child angels with their instruments; over the mouth the star, the Annunciation, the Coronation
  const tx = fx + 2.2, hc = 7.2;
  trumeau(bag, tx, y, cz, hc);
  statue(bag, [tx - 0.15, y + hc, cz - 0.55], 1.9, { veil: true, seated: true });                    // Mary
  statue(bag, [tx - 0.25, y + hc, cz + 0.6], 2.05, { arms: true });                                 // Joseph
  bag.add(SC, box(tx + 0.05, y + hc, cz - 0.3, tx + 0.55, y + hc + 0.35, cz + 0.3)); bag.add(SC, ball(0.16, 8, 6).scale(1.6, 0.8, 1).translate(tx + 0.3, y + hc + 0.35, cz));   // the manger and the child
  for (const s of [-1, 1]) bag.add(SC, tube([[tx - 0.55, y + hc + 0.9, cz + s * 0.25, 0.22, 0.2], [tx - 0.3, y + hc + 1.05, cz + s * 0.2, 0.17, 0.15], [tx - 0.05, y + hc + 0.95, cz + s * 0.15, 0.13, 0.12]], 8));   // the ox and the mule
  group(bag, charity, cz, y, -0.8, 0.45, [{ arms: true }, { kneel: true }], 2.3, 0.36);       // the shepherds
  group(bag, charity, cz, y, 0.8, 0.45, [{ crown: true, kneel: true }, { crown: true, arms: true }], 2.3, 0.36);   // the kings
  for (const [a, b] of [[-0.5, 0.3], [0.5, 0.3], [-0.62, 0.62], [0.62, 0.62], [-0.38, 0.55], [0.38, 0.55]]) group(bag, charity, cz, y, a, b, [{ wings: true, arms: 'up' }], 1.6);
  { const [x, v, u] = charity.face(0, 0.1); star(bag, x + 0.6, y + v + 0.3, cz + u); }
  group(bag, charity, cz, y, 0, 0.42, [{ wings: true, arms: true }, { veil: true, kneel: true }], 2.9);        // the Annunciation
  group(bag, charity, cz, y, 0, 0.8, [{ arms: true }, { veil: true, seated: true, crown: true }, { arms: 'up', crown: true }], 2.8);   // the Coronation
  foliage(bag, charity, cz, y, 190, rand, [[0, 0.1], [0, 0.42], [0, 0.8], [-0.8, 0.45], [0.8, 0.45], [-0.5, 0.3], [0.5, 0.3], [-0.62, 0.62], [0.62, 0.62], [-0.38, 0.55], [0.38, 0.55]]);
  // Hope: the flight into Egypt, the Innocents, the wedding of Mary and Joseph, Joseph at the helm of his boat
  group(bag, hope, cz, y, -0.72, 0.45, [{ veil: true, seated: true }, { arms: true }], 2.2, 0.36);
  group(bag, hope, cz, y, 0.72, 0.45, [{ arms: 'up' }, { kneel: true, veil: true }], 2.2, 0.36);
  group(bag, hope, cz, y, 0, 0.3, [{ veil: true }, { arms: true }], 2.5);
  { const [x, v, u] = hope.face(0, 0.72); corbel(bag, x + 0.15, y + v, cz + u, 1.2); boat(bag, x + 0.3, y + v, cz + u); statue(bag, [x + 0.25, y + v + 0.45, cz + u - 0.2], 1.8, { arms: true }); }
  foliage(bag, hope, cz, y, 130, rand, [[-0.72, 0.45], [0.72, 0.45], [0, 0.3], [0, 0.72]]);
  // Faith: the Visitation, Jesus at the carpenter's bench, the Presentation, the Immaculate Conception
  group(bag, faith, cz, y, -0.72, 0.45, [{ veil: true }, { veil: true, arms: true }], 2.2, 0.36);
  { const [x, v, u] = faith.face(0.72, 0.45); corbel(bag, x + 0.15, y + v, cz + u, 1.0); statue(bag, [x + 0.05, y + v, cz + u - 0.4], 1.9, { arms: true }); bag.add('wood_dark', box(x + 0.15, y + v, cz + u + 0.05, x + 0.75, y + v + 0.8, cz + u + 0.95)); }
  group(bag, faith, cz, y, 0, 0.3, [{ arms: true }, { veil: true }, { arms: true }], 2.4);
  { const [x, v, u] = faith.face(0, 0.72); corbel(bag, x + 0.15, y + v, cz + u, 0.8); bag.add(SC, lathe([[0.9, 0], [0.95, 0.12], [0.001, 0.2]], 12, (th) => 1 + 0.5 * Math.cos(th)).translate(x + 0.15, y + v, cz + u)); statue(bag, [x + 0.15, y + v + 0.15, cz + u], 2.2, { veil: true, arms: 'up' }); }
  foliage(bag, faith, cz, y, 130, rand, [[-0.72, 0.45], [0.72, 0.45], [0, 0.3], [0, 0.72]]);
  // the columns between the portals: a sea turtle at the sea (south) end, a tortoise at the mountain (north)
  turtleColumn(bag, col, fx + 6.3, y, cz + 7.5, true);
  turtleColumn(bag, col, fx + 6.3, y, cz - 7.5, false);
  // the unfinished tops: the Charity portal's flat crown in scaffolding with blocks waiting where the cypress would go;
  // the side portals' crowns capped, their pinnacles to come
  scaffold(bag, [fx - 0.8, cz - 1.6, fx + 4.6, cz + 1.6], y + 36, y + 42.5);
  for (let k = 0; k < 5; k++) { const bx = fx + 0.2 + rand() * 3, bz = cz - 1.2 + rand() * 2; bag.add(S, box(bx, y + 36 - 0.05, bz, bx + 0.9, y + 36.5, bz + 0.6)); }
  for (const uc of [-14.25, 14.25]) bag.add(S, box(fx - 1, y + 28.4, cz + uc - 1.1, fx + 2.6, y + 29.6, cz + uc + 1.1));
}
