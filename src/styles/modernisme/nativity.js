// The Nativity façade of the Sagrada Família as it stood in the 1910s–1920s (docs/settlements/barcelona.md §1): the silhouette first.
// Four bell towers, slender parabolic spindles — a square base (7.2 m, leaning in, lancets), a collar turning it round, then a solid
// round cone tapering to a point, pierced by rings of tall slots — the two inner the tallest, rising well clear of everything else; the
// first (Barnabas, north) finished in 1925 with its finial, the others cut off in light timber scaffolding on their upper stages. Between
// and below them three tall parabolic gables, each a sculpted wedge (thin at the crown) round a deep porch: Faith (north), Charity (the
// middle, the highest, with the cypress — the tree of life — rising from its flat tip) and Hope (south), the side gables ending in the
// stumps of their lanterns; each porch's mouth splayed in stepped orders and fringed with stalactites, the gable's face grown with
// foliage and peopled with the groups of the Gospel infancy on corbels, crockets along its rakes; the two palm-trunk columns between
// the portals, standing on a sea turtle (south) and a land tortoise (north); the Charity portal's trumeau, the column of Jesus'
// genealogy with the serpent coiled round it, carrying the Nativity; over the mouth the star, the Annunciation and the Coronation.
// The transept's wall behind is low. All the silhouette's numbers (TOWERS, the gables' gt/ft, the cypress) are checked against the
// arrival camera by a projection (see the commit message), so that the towers' tops are inside the frame.

import { box, lathe, fromTriangles, rod, frustum } from '../../core/geom.js';
import { tube, folded, ball } from '../../objects/kit.js';

// the stone of the façade, told apart so that the sculpture reads in shade as well as in the sun: the walls and towers pale ashlar (S),
// the sculpted masses darker honey rock (MASS), the porches' orders grey and deep (PORCH), the figures, drips and flowers pale (FIG), the
// foliage a grey-green (LEAF); the palm columns and the turtles stay smooth dressed sandstone (SC)
const S = 'limestone_yellow', SC = 'sandstone_dressed', W = 'timber';
const MASS = 'sandstone_relief', PORCH = 'sandstone_carved', FIG = 'limestone_carved', LEAF = 'sandstone_green';
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

/** Light timber scaffolding round a rect (the stone must show through it): slender standards at the corners, ledgers every 4 m on the street and side faces, a board every 8 m, a brace every 8 m on the street face. */
export function scaffold(bag, [x0, z0, x1, z1], y0, y1) {
  const xs = [x0, x1], zs = [z0, z1], zm = (z0 + z1) / 2;
  for (const x of xs) for (const z of zs) bag.add(W, box(x - 0.06, y0, z - 0.06, x + 0.06, y1, z + 0.06));
  for (let yy = y0 + 4; yy < y1 - 0.2; yy += 4) {
    bag.add(W, box(x1 - 0.05, yy - 0.05, z0 - 0.1, x1 + 0.05, yy + 0.05, z1 + 0.1));
    for (const z of zs) bag.add(W, box(x0 - 0.1, yy - 0.05, z - 0.05, x1 + 0.1, yy + 0.05, z + 0.05));
    bag.add('planks_grey', box(x1 + 0.1, yy + 0.21, z0 + 0.2, x1 + 0.9, yy + 0.26, z1 - 0.2));      // (the masons stand on these: arrival.js)
    for (const z of [z0 + 0.3, z1 - 0.3]) bag.add(W, box(x1, yy + 0.05, z - 0.05, x1 + 0.9, yy + 0.21, z + 0.05));
    if (Math.round(yy - y0) % 8 === 0) bag.add(W, rod([x1 + 0.03, yy - 4, z0], [x1 + 0.03, yy, z1], 0.04, 4));
  }
  void zm;
}

// ── Statues ──────────────────────────────────────────────────────────────────────────────────
/**
 * A robed statue standing at p (its soles), h tall, facing +x (the street): the robe in folds, the
 * mantle's fall, the head; `arms` forward (praying, offering), `kneel` lower, `wings` an angel's,
 * `seated` on a block. The façade's figures are of the size of life or larger.
 */
function statue(bag, p, h, o = {}) {
  const [x, y, z] = p, k = o.kneel ? 0.68 : o.seated ? 0.78 : 1, H = h * k, seed = Math.floor(x * 7 + z * 13 + y * 3) >>> 0;
  if (o.seated) bag.add(FIG, box(x - 0.28 * h, y, z - 0.24 * h, x + 0.12 * h, y + 0.3 * h, z + 0.24 * h));
  const prof = [[0.17, 0], [0.19, 0.05], [0.17, 0.3], [0.14, 0.55], [0.15, 0.7], [0.12, 0.8], [0.065, 0.84], [0.001, 0.85]].map(([r, v]) => [r * h, v * H]);
  bag.add(FIG, folded(prof, 14, 7, 0.16, seed).translate(x, y, z));
  // the mantle falling from the shoulders behind, a second fold
  bag.add(FIG, folded([[0.13, 0], [0.16, 0.25], [0.15, 0.55], [0.11, 0.74], [0.001, 0.78]].map(([r, v]) => [r * h, v * H]), 12, 5, 0.22, seed + 1).scale(1, 1, 1.12).translate(x - 0.05 * h, y + 0.04 * H, z));
  bag.add(FIG, ball(0.068 * h, 10, 7).translate(x + 0.01 * h, y + 0.84 * H, z));
  if (o.veil) bag.add(FIG, lathe([[0.08 * h, 0], [0.085 * h, 0.06 * h], [0.06 * h, 0.13 * h], [0.001, 0.15 * h]], 10).translate(x - 0.01 * h, y + 0.83 * H, z));
  if (o.crown) bag.add('gilt_bronze', lathe([[0.06 * h, 0], [0.065 * h, 0.035 * h], [0.05 * h, 0.035 * h], [0.05 * h, 0.001]], 10).translate(x, y + 0.97 * H, z));
  if (o.arms) for (const s of [-1, 1]) {
    const sh = [x + 0.03 * h, y + 0.74 * H, z + s * 0.12 * h], el = [x + 0.12 * h, y + 0.6 * H, z + s * 0.13 * h], hd = o.arms === 'up' ? [x + 0.2 * h, y + 0.92 * H, z + s * 0.1 * h] : [x + 0.24 * h, y + 0.66 * H, z + s * 0.035 * h];
    bag.add(FIG, tube([[...sh, 0.04 * h], [...el, 0.036 * h], [...hd, 0.028 * h]], 6));
  }
  if (o.wings) {
    const T = [];
    for (const s of [-1, 1]) {
      const R = (a, b) => [x - 0.1 * h - a * 0.12 * h, y + 0.72 * H + b * h, z + s * (0.1 * h + a * 0.42 * h)];
      const rim = [[0, 0.02], [0.3, 0.16], [0.65, 0.3], [1, 0.42], [0.95, 0.25], [0.85, 0.08], [0.75, -0.08], [0.6, -0.22], [0.45, -0.34], [0.25, -0.42], [0.1, -0.3], [0, -0.1]];
      for (let i = 0; i + 1 < rim.length; i++) T.push(...R(0.05, 0), ...R(...rim[i]), ...R(...rim[i + 1]));
    }
    bag.add(FIG, fromTriangles(both(T)));
  }
}
/** A corbel under a group: a flat shelf over a drooping, leafy cone, its back in the wall. */
function corbel(bag, x, y, z, r) {
  bag.add(MASS, lathe([[0.001, -r * 1.3], [r * 0.45, -r * 0.95], [r * 0.8, -r * 0.45], [r, -0.12], [r, 0], [0.001, 0]], 12, (th, i) => (i === 2 ? 1 + 0.12 * Math.cos(th * 5) : 1)).scale(0.7, 0.65, 1).translate(x, y, z));
}
/** Stalactites hanging from a point: a cluster of two or three drips of ice in stone. */
function drips(bag, x, y, z, L, rand) {
  const n = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const l = L * (0.5 + rand() * 0.6), r = 0.07 + l * 0.09, dx = (rand() - 0.5) * 0.25, dz = (rand() - 0.5) * 0.35;
    bag.add(FIG, lathe([[r, 0], [r * 0.85, 0.12], [r * 0.55, l * 0.45], [0.001, l]], 5).rotateX(Math.PI).translate(x + dx, y + 0.1, z + dz));
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
const TAPER = 0.85;                                           // the square base leans in by this much on each face between its foot and its top
const hxAt = (hq, bv, v) => hq - TAPER * Math.max(0, Math.min(1, v / bv));
const BV = 25, R0 = 2.55, V0 = BV + 2.6;                      // the square base's height; the round shaft's radius where the collar ends; its foot
/** The spindle's radius at height v (above the façade's ground) for a tower that would end in a point at hf: a parabola from R0 at V0 to nothing at hf. */
export const spin = (v, hf) => R0 * (1 - Math.min(1, Math.max(0, (v - V0) / (hf - V0))) ** 2);
/** The four towers, Faith's side (north) first: u along the façade, top the height reached (the two inner the tallest), hf the height at which the finished spindle would close; Barnabas's (north) is finished (1925), the others stand cut off in scaffolding. */
export const TOWERS = [{ u: -21, top: 64, hf: 64 }, { u: -7.5, top: 72, hf: 90 }, { u: 7.5, top: 74, hf: 92 }, { u: 21, top: 54, hf: 70 }];
/**
 * The timber scaffolds that stand on the façade (fx its line, y its ground, cz its centre): on the cut-off stages of the unfinished
 * towers, round the base of the cypress, and round the stumps of the side portals' lanterns. { rect, y0, y1 } each. The masons of
 * the arrival's street stand on their boards (scaffoldSpots).
 */
export function facadeScaffolds(fx, y, cz) {
  const xc = fx + 1, out = [];
  for (const { u, top, hf } of TOWERS) if (top < hf) { const e = spin(top - 11, hf) + 0.8; out.push({ rect: [xc - e, cz + u - e, xc + e, cz + u + e], y0: y + top - 11, y1: y + top + 1.6 }); }
  out.push({ rect: [fx + 1.3, cz - 2.4, fx + 5.8, cz + 2.4], y0: y + 38, y1: y + 47 });
  for (const u of [-14.25, 14.25]) out.push({ rect: [fx + 0.9, cz + u - 2.3, fx + 5.7, cz + u + 2.3], y0: y + 28, y1: y + 37.5 });
  return out;
}
/** Where a man can stand on the boards of the scaffolds: [x, z, y] on the street side of each board (scaffold() sets them every 4 m from y0 + 4). */
export function scaffoldSpots(fx, y, cz) {
  const out = [];
  for (const { rect: [, z0, x1, z1], y0, y1 } of facadeScaffolds(fx, y, cz)) for (let yy = y0 + 4; yy < y1 - 0.2; yy += 4) out.push([x1 + 0.5, (z0 + z1) / 2, yy + 0.26, z1 - z0]);
  return out;
}
/**
 * A tower: the square base to BV (leaning in, with string courses and tall lancets), a collar turning it round, then the round spindle,
 * a parabolic cone tapering to hf, pierced by tall slots in rings (each ring turned half a bay, the stair climbing inside), banded; cut
 * off at `top` with a flat head and the masons' waiting blocks where it is unfinished (its scaffold is drawn by nativity()), or closed in a
 * finial where it is done.
 */
function tower(bag, col, xc, zc, y, hq, top, hf, rand) {
  const hx = (v) => hxAt(hq, BV, v), done = top >= hf - 0.01;
  bag.add(S, frustum([xc - hq, zc - hq, xc + hq, zc + hq], y - 1.2, y + BV, TAPER, TAPER, TAPER, TAPER)); col.rect([xc - hq, zc - hq, xc + hq, zc + hq], y - 1.2, y + top);
  for (const v of [6, 12, 18, 23.2]) { const h = hx(v) + 0.14; bag.add('limestone', box(xc - h, y + v, zc - h, xc + h, y + v + 0.4, zc + h)); }
  bag.add('limestone', box(xc - hq - 0.2, y + BV - 0.55, zc - hq - 0.2, xc + hq + 0.2, y + BV, zc + hq + 0.2));     // the corbelled cornice the round shaft stands on
  // the lancets of the base: two tall pairs in each course on the street face, one on each side, deep dark
  const O = [], vs = [[2.6, 5.7], [7.0, 11.4], [12.6, 17.4], [19, 22.4]];
  for (const [v0, v1] of vs) {
    let i0 = O.length;
    for (const zz of [-1.05, 1.05]) { const f = (v) => xc + hx(v) + 0.03; quad(O, [f(v0), y + v0, zc + zz - 0.3], [f(v0), y + v0, zc + zz + 0.3], [f(v1), y + v1, zc + zz + 0.3], [f(v1), y + v1, zc + zz - 0.3]); }
    orient(O, i0, [xc, y + (v0 + v1) / 2, zc], true);
    for (const s2 of [-1, 1]) {
      i0 = O.length; const f = (v) => zc + s2 * (hx(v) + 0.03);
      quad(O, [xc + 1.5, y + v0, f(v0)], [xc + 0.7, y + v0, f(v0)], [xc + 0.7, y + v1, f(v1)], [xc + 1.5, y + v1, f(v1)]);
      orient(O, i0, [xc + 1.1, y + (v0 + v1) / 2, zc], true);
    }
  }
  // the collar from the square to the round
  const sq = (th) => 1 / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
  bag.add(S, lathe([[3.1, 0], [3.1, 0.5], [R0 + 0.3, 1.4], [R0, 2.6]], 24, (th, i) => (i < 2 ? 1 + (sq(th) - 1) * 0.55 : 1)).translate(xc, y + BV - 0.01, zc));
  // the spindle: a solid parabolic cone (the stair and the bells' hollow are out of sight behind its slots)
  const prof = [];
  for (let v = V0; v < top - 0.8; v += 1.5) prof.push([spin(v, hf), v - V0]);
  prof.push([Math.max(0.001, spin(top, hf)), top - V0]);
  if (!done) prof.push([0.001, top - V0]);                       // the flat head
  bag.add(S, lathe(prof, 28).translate(xc, y + V0, zc));
  // bands round the shaft every 9 m
  for (let v = V0 + 6; v < top - 3; v += 9) { const r = spin(v, hf); bag.add('limestone', lathe([[r - 0.05, 0], [r + 0.2, 0.08], [r + 0.2, 0.42], [r - 0.05, 0.52]], 24).translate(xc, y + v, zc)); }
  // tall slots round the shaft in rings, each ring turned half a bay from the one below, longer and closer in the belfry stage
  for (let k = 0, v = V0 + 2.2; v + 3 < top - 1.2; k++, v += v > top - 18 ? 3.8 : 5.2) {
    const len = v > top - 18 ? 3.0 : 3.5, r = spin(v + len / 2, hf), M = Math.max(5, Math.round(Math.PI * 2 * r / 1.9)), w = 0.3;
    for (let m = 0; m < M; m++) {
      const a = (m + (k % 2) * 0.5) / M * Math.PI * 2 + 0.2, t = [-Math.sin(a), Math.cos(a)], r0 = spin(v, hf) + 0.05, r1 = spin(v + len, hf) + 0.05;
      const c0 = [xc + Math.cos(a) * r0, zc + Math.sin(a) * r0], c1 = [xc + Math.cos(a) * r1, zc + Math.sin(a) * r1], i0 = O.length;
      quad(O, [c0[0] - t[0] * w, y + v, c0[1] - t[1] * w], [c0[0] + t[0] * w, y + v, c0[1] + t[1] * w], [c1[0] + t[0] * w * 0.8, y + v + len, c1[1] + t[1] * w * 0.8], [c1[0] - t[0] * w * 0.8, y + v + len, c1[1] - t[1] * w * 0.8]);
      orient(O, i0, [xc, y + v, zc], true);
    }
  }
  bag.add('opening', fromTriangles(O));
  if (done) {                                                     // the finished spire: a pale finial and its cross
    bag.add('limestone', ball(0.5, 10, 7).translate(xc, y + top - 0.1, zc));
    bag.add('gilt_bronze', rod([xc, y + top, zc], [xc, y + top + 2.4, zc], 0.07, 5)); bag.add('gilt_bronze', rod([xc - 0.6, y + top + 1.7, zc], [xc + 0.6, y + top + 1.7, zc], 0.06, 5)); bag.add('gilt_bronze', rod([xc, y + top + 1.7, zc - 0.6], [xc, y + top + 1.7, zc + 0.6], 0.06, 5));
  } else {                                                        // the head cut off: a lip, and the blocks waiting to be laid
    const r = spin(top, hf);
    bag.add('limestone', lathe([[r + 0.2, 0], [r + 0.2, 0.35], [r - 0.1, 0.35]], 24).translate(xc, y + top, zc));
    for (let k = 0; k < 5; k++) { const a = rand() * Math.PI * 2, rr = r * 0.5 * rand(); bag.add(S, box(xc + Math.cos(a) * rr - 0.4, y + top + 0.35, zc + Math.sin(a) * rr - 0.3, xc + Math.cos(a) * rr + 0.4, y + top + 0.7 + rand() * 0.4, zc + Math.sin(a) * rr + 0.3)); }
  }
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
  const outline = (a) => [uc + a * how, Math.min(ft, -1.2 + (gt + 1.2) * (1 - Math.abs(a) ** 1.5))];     // a tall parabolic gable, its tip cut flat at ft for the pinnacle
  const xbAt = (v) => Xb + (Xf - 3.6 - Xb) * (Math.max(0, v + 1.2) / (ft + 1.2)) ** 1.6;                // the mass's back leans forward as it rises: a wedge, thin at the crown, not a slab
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
    quad(G, at(a0, 1), at(a1, 1), P(xbAt(v1), u1, v1), P(xbAt(v0), u0, v0));
    orient(G, j0, P((Xb + Xf) / 2, uc, Math.min(ft, gt) * 0.45), true);
    const k0 = G.length; G.push(...P(Xb, uc, -1.2), ...P(xbAt(v0), u0, v0), ...P(xbAt(v1), u1, v1)); orient(G, k0, P(Xb - 5, uc, 10));
  }
  bag.add(MASS, fromTriangles(G));
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
  bag.add(PORCH, fromTriangles(I));
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
    const [x, u, v] = ip(a, 0.97); drips(bag, x - 0.25, y + v - 0.05, cz + u - Math.sign(a) * 0.1 * Math.abs(a), (0.5 + 0.9 * (1 - Math.abs(a)) * rand() + 0.3) * 1.7, rand);
    if (i % 2 === 0) { const [x2, u2, v2] = ip(a, 0.64); drips(bag, x2 - 0.2, y + v2 - 0.05, cz + u2, (0.4 + 0.5 * rand()) * 1.6, rand); }
  }
  // the archivolts: two stepped rings of pale stone standing out of the mass round the mouth, so that the porch reads as deep from afar
  const ring = (k0, kv0, k1, kv1, xf, back) => {
    const R = [], N = 44, q = (a, k, kvv, x) => { const [u, v] = arch(a, k, kvv); return P(x, u, v); }, c = P(back, uc, ht * 0.35);
    for (let i = 0; i < N; i++) {
      const a0 = -1 + 2 * i / N, a1 = -1 + 2 * (i + 1) / N;
      let j = R.length; quad(R, q(a0, k0, kv0, xf), q(a1, k0, kv0, xf), q(a1, k1, kv1, xf), q(a0, k1, kv1, xf)); orient(R, j, P(xf + 30, uc, ht * 0.5));
      j = R.length; quad(R, q(a0, k0, kv0, back), q(a1, k0, kv0, back), q(a1, k0, kv0, xf), q(a0, k0, kv0, xf)); orient(R, j, c);
      j = R.length; quad(R, q(a0, k1, kv1, back), q(a1, k1, kv1, back), q(a1, k1, kv1, xf), q(a0, k1, kv1, xf)); orient(R, j, c, true);
    }
    bag.add(FIG, fromTriangles(R));
  };
  ring(1.0, 1.0, 1.2, 1.1, Xf + 2.4, Xf + 0.2);
  ring(1.2, 1.1, 1.42, 1.2, Xf + 1.9, Xf + 0.6);
  // the mass broken into rock and foliage: lumps over its face, and along the gable's rakes a row of crockets (small pinnacles), so the outline is not a smooth curve
  for (let k = 0; k < 12; k++) {
    const a = -0.9 + rand() * 1.8, b = 0.4 + rand() * 0.45, [x, v, u] = face(a, b), rr = 0.8 + rand() * 0.9;
    bag.add(rand() < 0.35 ? LEAF : MASS, ball(rr, 8, 6).scale(0.9, 0.85, 1.1).translate(x + 0.1, y + v, cz + u));
  }
  for (let a = -0.95; a < 0.96; a += 0.075) {
    const [uo, vo] = outline(a); if (vo > ft - 0.3) continue;
    const s = Math.sign(a), L = 1.0 + rand() * 0.9, [uo1, vo1] = outline(a + 0.03 * s);
    const lean = Math.atan2(Math.abs(uo1 - uo), Math.abs(vo1 - vo)) * 0.6 * s;           // leaning out along the rake's slope
    bag.add(rand() < 0.3 ? LEAF : MASS, lathe([[0.4, 0], [0.3, L * 0.35], [0.14, L * 0.75], [0.001, L]], 6, (th, i) => 1 + 0.15 * Math.cos(th * 3 + i)).rotateX(lean).translate(Xf + 0.35, y + vo - 0.15, cz + uo));
  }
  // the colliders: the mass either side of the mouth, the doorway's wall
  for (const s of [-1, 1]) { const u0 = uc + s * hw * 0.98, u1 = uc + s * how; col.rect([Xb, cz + Math.min(u0, u1), Xf + 1.6, cz + Math.max(u0, u1)], y - 1.2, y + Math.min(ft, gt)); }
  return { face, at, depth, arch, outline, ip };
}

/** A group on a corbel set into the face at (a, b): figures across u, h tall, each with its options. */
function group(bag, pr, cz, y, a, b, figs, h = 2.6, sp = 0.46) {
  h *= 1.9;                                                   // (the figures of the façade are larger than life; here they must read from 50 m)
  const [x, v, u] = pr.face(a, b), half = (figs.length - 1) / 2 * sp * h;
  corbel(bag, x + 0.15, y + v, cz + u, Math.max(0.6, half + 0.22 * h));
  figs.forEach((o, i) => { const du = (i - (figs.length - 1) / 2) * sp * h; statue(bag, [x + 0.15 + (o.dx ?? 0), y + v + (o.dv ?? 0), cz + u + du], o.h ?? h, o); });
}
/** Foliage over the face: leaves and flowers, the façade "full of plants". */
function foliage(bag, pr, cz, y, n, rand, avoid) {
  for (let k = 0; k < n; k++) {
    const a = -0.95 + rand() * 1.9, b = 0.08 + rand() * 0.86;
    if (avoid.some(([aa, bb]) => Math.abs(a - aa) < 0.22 && Math.abs(b - bb) < 0.16)) continue;
    const [x, v, u] = pr.face(a, b), r = 0.4 + rand() * 0.5;
    if (rand() < 0.6) {
      // a knot of leaves and buds swelling out of the stone
      const m = 2 + Math.floor(rand() * 3);
      for (let i = 0; i < m; i++) { const rr = r * (0.55 + rand() * 0.6), ang = rand() * Math.PI * 2, d = r * 0.7 * rand(); bag.add(LEAF, ball(rr, 7, 5).scale(0.65, 1, 1).translate(x - rr * 0.4, y + v + Math.sin(ang) * d - rr, cz + u + Math.cos(ang) * d)); }
    } else {
      // a flower: a cup of petals turned to the street
      const rf = r * 1.1;
      bag.add(FIG, lathe([[0.001, 0], [rf * 0.6, rf * 0.25], [rf, rf * 0.5], [rf * 0.9, rf * 0.62], [rf * 0.55, rf * 0.45], [rf * 0.25, rf * 0.3], [0.001, rf * 0.38]], 10, (th, i) => 1 + (i >= 2 ? 0.09 : 0.04) * Math.cos(th * 6)).rotateZ(-Math.PI / 2).translate(x - 0.1, y + v, cz + u));
    }
  }
}

/** The Charity portal's trumeau: the column of Jesus' genealogy, the serpent coiled round it, its capital carrying the Nativity. */
function trumeau(bag, x, y, z, hc) {
  bag.add(FIG, lathe([[0.62, 0], [0.62, 0.35], [0.5, 0.5], [0.42, 0.8], [0.4, hc - 0.9], [0.5, hc - 0.6], [0.72, hc - 0.25], [0.98, hc - 0.05], [0.98, hc]], 14, (th, i) => (i >= 3 && i <= 4 ? 1 + 0.05 * Math.cos(th * 8) : 1), x, y, z));
  // bands of the genealogy's names
  for (let v = 1.4; v < hc - 1.2; v += 0.75) bag.add(FIG, lathe([[0.43, 0], [0.45, 0.05], [0.45, 0.12], [0.43, 0.17]], 14, null, x, y + v, z));
  // the serpent, its coils climbing with the apple in its mouth
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 1 / 40) { const a = t * Math.PI * 2 * 2.6, r = 0.5; pts.push([x + Math.cos(a) * r, y + 0.5 + t * (hc - 2.2), z + Math.sin(a) * r, 0.11 - 0.05 * t]); }
  bag.add(FIG, tube(pts, 6));
  const e = pts[pts.length - 1]; bag.add(FIG, ball(0.11, 8, 6).scale(1.5, 0.9, 1).translate(e[0] + 0.08, e[1] - 0.05, e[2]));
  bag.add('glaze_red', ball(0.08, 8, 6).translate(e[0] + 0.22, e[1] - 0.08, e[2]));
}

/** The star of Bethlehem: rays of stone round a boss, its trail of light flowing up and back. */
function star(bag, x, y, z) {
  bag.add(FIG, ball(0.38, 12, 8).translate(x, y - 0.38, z));
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, L = k % 2 ? 0.9 : 1.6; bag.add(FIG, lathe([[0.16, 0], [0.001, L]], 6).rotateX(a).translate(x, y, z)); }
  bag.add(FIG, tube([[x - 0.1, y + 0.2, z - 0.25, 0.32, 0.2], [x - 0.25, y + 1.2, z - 1.0, 0.26, 0.15], [x - 0.35, y + 2.2, z - 1.5, 0.18, 0.1], [x - 0.45, y + 3.2, z - 1.7, 0.05, 0.04]], 8));
}

/** A small boat (Joseph sailing, at the top of the Hope portal). */
function boat(bag, x, y, z) {
  bag.add(FIG, lathe([[0.001, 0], [0.4, 0.06], [0.6, 0.35], [0.62, 0.55]], 12, (th) => 1 / Math.sqrt(Math.cos(th) ** 2 + (Math.sin(th) / 3) ** 2) * 0.33).translate(x, y, z));
  bag.add(FIG, rod([x - 0.1, y + 0.4, z], [x - 0.1, y + 3.4, z], 0.06, 6));
  const T = []; T.push(x - 0.12, y + 3.3, z, x - 0.12, y + 1.0, z, x - 0.12, y + 1.1, z + 1.4); bag.add('limestone', fromTriangles(both(T)));
}

/**
 * nativity(bag, col, fx, y, cz): the façade facing east (+x) on the line x = fx, centred at z = cz.
 */
export function nativity(bag, col, fx, y, cz) {
  const rand = rng(1892), P = (x, u, v) => [x, y + v, cz + u];
  const xc = fx + 1, hq = 3.6;
  // the transept's wall at the back of the porches, low behind the gables and the four towers
  bag.add(S, box(fx - 2.4, y - 1.2, cz - 21, fx + 0.6, y + 14, cz + 21)); col.rect([fx - 2.4, cz - 21, fx + 0.6, cz + 21], y - 1.2, y + 14);
  bag.add('limestone', box(fx - 2.55, y + 13.6, cz - 21, fx + 0.75, y + 14.1, cz + 21));
  // the four spindle towers (Faith's side north, Hope's south), the two inner the tallest, as they stood in the years round 1925
  for (const { u, top, hf } of TOWERS) tower(bag, col, xc, cz + u, y, hq, top, hf, rand);
  // the three portals: tall parabolic gables between and below the towers, the Charity portal the highest
  const X = { Xw: fx + 0.6, Xf: fx + 5.2, Xb: fx - 1.6 };
  const faith = portal(bag, col, P, cz, y, { uc: -14.25, hw: 3.4, ht: 17, gt: 34, ft: 28, ho: 3.35, ...X }, rand);
  const charity = portal(bag, col, P, cz, y, { uc: 0, hw: 4.2, ht: 21, gt: 46, ft: 38, ho: 3.3, ...X }, rand);
  const hope = portal(bag, col, P, cz, y, { uc: 14.25, hw: 3.4, ht: 17, gt: 34, ft: 28, ho: 3.35, ...X }, rand);
  // Charity: the trumeau and the Nativity on its capital; the adorations of the shepherds and the kings at the sides;
  // child angels with their instruments; over the mouth the star, the Annunciation, the Coronation
  const tx = fx + 2.2, hc = 7.2;
  trumeau(bag, tx, y, cz, hc);
  statue(bag, [tx - 0.15, y + hc, cz - 0.55], 1.9, { veil: true, seated: true });                    // Mary
  statue(bag, [tx - 0.25, y + hc, cz + 0.6], 2.05, { arms: true });                                 // Joseph
  bag.add(FIG, box(tx + 0.05, y + hc, cz - 0.3, tx + 0.55, y + hc + 0.35, cz + 0.3)); bag.add(FIG, ball(0.16, 8, 6).scale(1.6, 0.8, 1).translate(tx + 0.3, y + hc + 0.35, cz));   // the manger and the child
  for (const s of [-1, 1]) bag.add(FIG, tube([[tx - 0.55, y + hc + 0.9, cz + s * 0.25, 0.22, 0.2], [tx - 0.3, y + hc + 1.05, cz + s * 0.2, 0.17, 0.15], [tx - 0.05, y + hc + 0.95, cz + s * 0.15, 0.13, 0.12]], 8));   // the ox and the mule
  group(bag, charity, cz, y, -0.74, 0.18, [{ arms: true }, { kneel: true }], 2.0, 0.34);      // the shepherds
  group(bag, charity, cz, y, 0.74, 0.18, [{ crown: true, kneel: true }, { crown: true, arms: true }], 2.0, 0.34);   // the kings
  for (const [a, b] of [[-0.5, 0.62], [0.5, 0.62], [-0.62, 0.38], [0.62, 0.38]]) group(bag, charity, cz, y, a, b, [{ wings: true, arms: 'up' }], 1.6);
  { const [x, v, u] = charity.face(0, 0.06); star(bag, x + 0.6, y + v + 0.3, cz + u); }
  group(bag, charity, cz, y, 0, 0.32, [{ wings: true, arms: true }, { veil: true, kneel: true }], 2.9);        // the Annunciation
  group(bag, charity, cz, y, 0, 0.66, [{ arms: true }, { veil: true, seated: true, crown: true }, { arms: 'up', crown: true }], 2.8);   // the Coronation
  foliage(bag, charity, cz, y, 120, rand, [[0, 0.06], [0, 0.32], [0, 0.66], [-0.74, 0.18], [0.74, 0.18], [-0.5, 0.62], [0.5, 0.62], [-0.62, 0.38], [0.62, 0.38]]);
  // Hope: the flight into Egypt, the Innocents, the wedding of Mary and Joseph, Joseph at the helm of his boat
  group(bag, hope, cz, y, -0.6, 0.4, [{ veil: true, seated: true }, { arms: true }], 1.9, 0.36);
  group(bag, hope, cz, y, 0.6, 0.4, [{ arms: 'up' }, { kneel: true, veil: true }], 1.9, 0.36);
  group(bag, hope, cz, y, 0, 0.3, [{ veil: true }, { arms: true }], 2.5);
  { const [x, v, u] = hope.face(0, 0.62); corbel(bag, x + 0.15, y + v, cz + u, 1.2); boat(bag, x + 0.3, y + v, cz + u); statue(bag, [x + 0.25, y + v + 0.45, cz + u - 0.2], 1.8, { arms: true }); }
  foliage(bag, hope, cz, y, 80, rand, [[-0.6, 0.4], [0.6, 0.4], [0, 0.3], [0, 0.62]]);
  // Faith: the Visitation, Jesus at the carpenter's bench, the Presentation, the Immaculate Conception
  group(bag, faith, cz, y, -0.6, 0.4, [{ veil: true }, { veil: true, arms: true }], 1.9, 0.36);
  { const [x, v, u] = faith.face(0.6, 0.4); corbel(bag, x + 0.15, y + v, cz + u, 1.0); statue(bag, [x + 0.05, y + v, cz + u - 0.4], 1.9, { arms: true }); bag.add('wood_dark', box(x + 0.15, y + v, cz + u + 0.05, x + 0.75, y + v + 0.8, cz + u + 0.95)); }
  group(bag, faith, cz, y, 0, 0.3, [{ arms: true }, { veil: true }, { arms: true }], 2.4);
  { const [x, v, u] = faith.face(0, 0.66); corbel(bag, x + 0.15, y + v, cz + u, 0.8); bag.add(FIG, lathe([[0.9, 0], [0.95, 0.12], [0.001, 0.2]], 12, (th) => 1 + 0.5 * Math.cos(th)).translate(x + 0.15, y + v, cz + u)); statue(bag, [x + 0.15, y + v + 0.15, cz + u], 2.2, { veil: true, arms: 'up' }); }
  foliage(bag, faith, cz, y, 80, rand, [[-0.6, 0.4], [0.6, 0.4], [0, 0.3], [0, 0.66]]);
  // the columns between the portals: a sea turtle at the sea (south) end, a tortoise at the mountain (north)
  turtleColumn(bag, col, fx + 6.3, y, cz + 7.5, true);
  turtleColumn(bag, col, fx + 6.3, y, cz - 7.5, false);
  // the crowns: on the Charity gable the cypress, the tree of life — a tall flame of stone in lobes and tiers rising from the gable's flat tip, a
  // tau cross at its head; on the side gables the stumps of the lanterns (finished only in the 1930s) — the timber scaffolds standing on both
  const cxx = fx + 3.55;
  bag.add(MASS, lathe([[1.9, 0], [2.0, 0.55], [1.8, 2.0], [1.95, 3.3], [1.55, 4.8], [1.7, 6.2], [1.25, 7.7], [1.2, 9.0], [0.85, 10.2], [0.55, 11.5], [0.28, 12.9], [0.001, 14.2]], 28,
    (th, k) => 1 + (k > 0 ? 0.1 * Math.cos(th * 9 + k * 0.7) : 0)).translate(cxx, y + 38, cz));
  bag.add(FIG, rod([cxx, y + 51.4, cz], [cxx, y + 53.6, cz], 0.09, 6)); bag.add(FIG, rod([cxx, y + 53.4, cz - 0.7], [cxx, y + 53.4, cz + 0.7], 0.08, 6));
  for (const uc of [-14.25, 14.25]) {
    bag.add(S, lathe([[1.75, 0], [1.9, 0.5], [1.7, 2.5], [1.4, 4.6], [1.05, 6.4], [0.001, 6.4]], 14, (th, i) => 1 + 0.08 * Math.cos(th * 6 + i)).translate(cxx, y + 28, cz + uc));
    for (let k = 0; k < 4; k++) { const a = rand() * Math.PI * 2, rr = 0.2 + rand() * 0.5; bag.add(S, box(cxx + Math.cos(a) * rr - 0.4, y + 34.4, cz + uc + Math.sin(a) * rr - 0.3, cxx + Math.cos(a) * rr + 0.4, y + 34.7 + rand() * 0.4, cz + uc + Math.sin(a) * rr + 0.3)); }
  }
  // light timber scaffolds, only on the unfinished upper stages: the towers' cut-off heads, the cypress's foot, the lanterns' stumps
  for (const { rect, y0, y1 } of facadeScaffolds(fx, y, cz)) scaffold(bag, rect, y0, y1);
}
