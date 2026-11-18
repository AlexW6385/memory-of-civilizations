// Dogon building parts (docs/settlements/dogon.md §4): granaries with their thatch hats, round kitchens, courtyard walls, the
// niched facade, notched-log ladders, mortars, stacked millet stalks, altars, jars. Shared by the style's elements.

import { box, lathe, rod, place, fromTriangles } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { frame, leaf } from './door.js';

export const WALL = 'banco_rough', PLASTER = 'banco', SMOOTH = 'banco_smooth', MUD = 'mud_plaster', BRICK = 'mudbrick', STONE = 'schist_rubble', STONE2 = 'granite_rough';
export const THATCH = 'thatch', STALK = 'reed_mat', LOG = 'log_pine', DARK = 'wood_dark', RED = 'kokowai', HOLE = 'opening', ROCK = 'sandstone_red';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** A straight wall on the centre line a→b (plan), thickness th, y0..y1, with openings [{ at, w, h }] (door gaps). Solid to the walker except the gaps. */
export function wallRun(bag, col, mat, a, b, th, y0, y1, ops = [], o = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const P = (s) => [a[0] + ux * s, a[1] + uz * s];
  const piece = (s0, s1, ya, yb) => {
    if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return;
    const p0 = P(s0), p1 = P(s1);
    bag.add(mat, orientedBox(p0, p1, th, ya, yb, o.ext ?? 0));
    if (!o.noCol) col.segment(p0, p1, th, ya, yb);
  };
  const S = ops.map((q) => ({ ...q, s0: q.at - q.w / 2, s1: q.at + q.w / 2 })).sort((p, q) => p.s0 - q.s0);
  let s = 0;
  for (const q of S) {
    piece(s, q.s0, y0, y1);
    piece(q.s0, q.s1, y0 + q.h, y1);
    s = q.s1;
  }
  piece(s, L, y0, y1);
}

/** A ladder cut from a trunk: one notched log with its fork left at the top (the two prongs hook over the parapet), foot at (x, y, z), leaning toward (dx, dz) to height h; the notches cut by hand, no two alike. */
export function notchedLadder(bag, x, y, z, h, dx, dz, lean = 0.7) {
  const top = [x + dx * lean, y + h + 0.5, z + dz * lean], len = Math.hypot(top[0] - x, top[1] - y, top[2] - z);
  const ux = (top[0] - x) / len, uy = (top[1] - y) / len, uz = (top[2] - z) / len;
  bag.add(DARK, rod([x, y, z], top, 0.1 + 0.015 * hv(x, z, 1), 7));
  const kf = 0.85 + 0.3 * hv(x, z, 3);
  bag.add(DARK, lathe([[0.15 * kf, 0], [0.12 * kf, 0.1], [0.001, 0.12]], 7, null, x - ux * 0.02, y - 0.02, z - uz * 0.02));          // the foot, a stub of root
  // the fork: two prongs from the trunk's head, opening to either side and over the wall's top
  const px = -dz, pz = dx;
  for (const s of [-1, 1]) {
    const a = [top[0] - ux * 0.28, top[1] - uy * 0.28, top[2] - uz * 0.28], b = [top[0] + ux * 0.22 + s * px * 0.15, top[1] + uy * 0.22 + 0.03, top[2] + uz * 0.22 + s * pz * 0.15];
    bag.add(DARK, rod(a, b, 0.045 - 0.006 * hv(x, z, 2 + s), 5));
  }
  // the notches: steps cut into one face about every 0.3 m, each its own width and depth
  for (let k = 1; k * 0.3 < len - 0.5; k++) {
    const f = (k * 0.3 + (hv(x, z, 10 + k) - 0.5) * 0.03) / len, c = [x + (top[0] - x) * f, y + (top[1] - y) * f, z + (top[2] - z) * f], hw = 0.12 + 0.03 * hv(x, z, 40 + k);
    bag.add(LOG, box(c[0] - hw, c[1] - 0.025, c[2] - hw, c[0] + hw, c[1] + 0.02, c[2] + hw));
  }
}

/** A clay jar. */
export function jar(bag, x, y, z, k = 1, mat = 'terracotta') {
  bag.add(mat, lathe([[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.26], [0.19, 0.38], [0.14, 0.45], [0.15, 0.49], [0.13, 0.49], [0.12, 0.44], [0.001, 0.43]].map(([r, h]) => [r * k, h * k]), 12, null, x, y, z));
}
export function basket(bag, x, y, z, r = 0.22, goods = null) {
  bag.add('wicker', lathe([[0.001, 0], [r * 0.7, 0.01], [r, 0.12], [r * 1.05, 0.25], [r * 0.95, 0.25], [r * 0.9, 0.12], [0.001, 0.03]], 10, null, x, y, z));
  if (goods) bag.add(goods, lathe([[0.001, 0.2], [r * 0.9, 0.2], [r * 0.7, 0.26], [0.001, 0.31]], 8, null, x, y, z));
}
/** A big wooden mortar (a hollowed trunk) with its two pestles leaning in it, for pounding millet. */
export function mortar(bag, col, x, y, z, rand = Math.random) {
  bag.add(DARK, lathe([[0.001, 0], [0.2, 0], [0.28, 0.1], [0.24, 0.55], [0.3, 0.66], [0.2, 0.66], [0.17, 0.45], [0.001, 0.4]], 10, null, x, y, z));
  const a = rand() * 6.28;
  for (const s of [-1, 1]) bag.add(LOG, rod([x + Math.cos(a) * 0.08 * s, y + 0.4, z + Math.sin(a) * 0.08 * s], [x + Math.cos(a) * 0.38 * s, y + 1.65, z + Math.sin(a) * 0.38 * s + 0.1], 0.04, 6));
  col.circle(x, z, 0.32, y, y + 0.7);
}
/** A stack of millet stalks (sheaves) stood against each other: a tall narrow cone of bundles. */
export function milletStack(bag, col, x, y, z, h = 1.8, r = 0.55, seed = 1) {
  const rand = rng(seed);
  bag.add(STALK, lathe([[r, 0], [r * 0.9, h * 0.3], [r * 0.6, h * 0.7], [0.02, h]], 8, (t, i) => 1 + 0.12 * Math.sin(t * 5 + i * 2.1 + seed), x, y, z));
  for (let k = 0; k < 5; k++) { const a = k * 1.26 + rand(); bag.add(THATCH, rod([x + Math.cos(a) * r * 0.9, y, z + Math.sin(a) * r * 0.9], [x + Math.cos(a) * r * 0.1, y + h * 0.97, z + Math.sin(a) * r * 0.1], 0.025, 4)); }
  col.circle(x, z, r * 0.9, y, y + h * 0.6);
}
export function firewood(bag, col, x, y, z, yaw, len = 1.6, rows = 3, rand = Math.random) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  for (let r = 0; r < rows; r++) for (let k = 0; k < rows - r + 1; k++) {
    const u = (k - (rows - r) / 2) * 0.14, v = r * 0.12 + 0.05, ex = (len / 2) * (0.9 + rand() * 0.2);
    bag.add('bark_dark', rod([x - c * ex + -s * u, y + v, z - s * ex + c * u], [x + c * ex - s * u, y + v, z + s * ex + c * u], 0.045 + rand() * 0.015, 5));
  }
  col.rect([x - Math.abs(c) * len / 2 - Math.abs(s) * 0.3, z - Math.abs(s) * len / 2 - Math.abs(c) * 0.3, x + Math.abs(c) * len / 2 + Math.abs(s) * 0.3, z + Math.abs(s) * len / 2 + Math.abs(c) * 0.3], y, y + rows * 0.12 + 0.1);
}

/** A hash of a place (x, z) and a number, 0…1: what makes each repeated piece differ from the next, identically on every build. */
export function hv(x, z, k = 0) {
  let h = Math.imul(Math.round(x * 53) | 0, 374761393) ^ Math.imul(Math.round(z * 53) | 0, 668265263) ^ Math.imul((k | 0) + 1, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** A rounded-square prism (a mud granary body made by hand): half-side r, corner radius rc, from y to y + h in `rows` courses, each course a little proud of the one below, the surface worked by the maker's hand (a hash of its place). */
function roundPrism(x, y, z, r, h, rc, rows) {
  const ring = (j) => {
    const t = j / rows, sw = 1.03 - 0.03 * t + 0.012 * Math.sin(t * 17 + x * 3), out = [];
    for (let i = 0; i < 16; i++) {
      const q = Math.floor(i / 4), k = i % 4, cx = (q === 0 || q === 3 ? 1 : -1) * (r - rc), cz = (q < 2 ? 1 : -1) * (r - rc), a = (q * 0.5 + k / 3 * 0.5) * Math.PI, j2 = 1 + 0.02 * (hv(x + i, z + j, 3) - 0.5);
      out.push([x + (cx + Math.cos(a) * rc) * sw * j2, y + t * h, z + (cz + Math.sin(a) * rc) * sw * j2]);
    }
    return out;
  };
  const T = [];
  let A = ring(0);
  for (let j = 1; j <= rows; j++) {
    const B = ring(j);
    for (let i = 0; i < 16; i++) {
      const n = (i + 1) % 16, a = A[i], b = A[n], c = B[n], d = B[i];
      const mx = (a[0] + b[0]) / 2 - x, mz = (a[2] + b[2]) / 2 - z, e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
      const nx = e1[1] * e2[2] - e1[2] * e2[1], nz = e1[0] * e2[1] - e1[1] * e2[0];
      if (nx * mx + nz * mz >= 0) T.push(...a, ...b, ...c, ...a, ...c, ...d); else T.push(...a, ...c, ...b, ...a, ...d, ...c);
    }
    A = B;
  }
  return fromTriangles(T);
}

/** A foot-stone: a flat-topped lump of rock, the height h, rough by its place. */
function footStone(bag, x, y, z, rad, h, k) {
  bag.add(STONE, lathe([[rad * 1.2, 0], [rad * 1.05, h * 0.55], [rad, h * 0.97], [0.001, h]], 6, (t, i) => 1 + 0.16 * Math.sin(t * 3 + i * 1.9 + k * 7), x, y, z));
}

/**
 * A granary at (x, y, z): on its feet of stones (a floor of slab on piers, so that the rats cannot climb and the air passes under), the
 * body of mud, in courses, its edges rounded by hand (kind 'square': narrow, four-sided; the others cylinders; r the radius or half the
 * side, h the wall), the hat of millet straw — a pointed cap of tiers, each flaring over the last, ragged at the eaves, tied off at the
 * tip — and the carved shutter with its lock on the side toward `yaw` (the male granary's high, with a notched ladder; 'low' with the
 * door at the ground). kind: 'male' | 'female' | 'square' | 'low'.
 */
export function granary(bag, col, x, y, z, r, h, o = {}) {
  const rand = o.rand ?? rng(7), kind = o.kind ?? 'male', sq = kind === 'square', hk = (k) => hv(x, z, k);
  const yaw = sq ? Math.round((o.yaw ?? Math.PI / 2) / (Math.PI / 2)) * (Math.PI / 2) : (o.yaw ?? Math.PI / 2);
  const pl = 0.4, y0 = y + pl, yh = y0 + h;
  // the feet: piers of stone under a slab, the dark between them
  const nf = sq ? 8 : 6, rf = r * 0.84;
  for (let i = 0; i < nf; i++) {
    let fx, fz;
    if (sq) { const q = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]][i]; fx = x + q[0] * (r - 0.12); fz = z + q[1] * (r - 0.12); }
    else { const a = (i + 0.5 * hk(1)) / nf * Math.PI * 2; fx = x + Math.cos(a) * rf; fz = z + Math.sin(a) * rf; }
    footStone(bag, fx, y - 0.1, fz, 0.17 + 0.06 * hk(10 + i), pl - 0.04, hk(20 + i));
  }
  if (sq) bag.add('opening', box(x - r + 0.2, y + 0.02, z - r + 0.2, x + r - 0.2, y0 - 0.1, z + r - 0.2));
  else bag.add('opening', lathe([[r * 0.7, 0.02], [r * 0.7, pl - 0.1]], 10, null, x, y, z));
  // the slab: stones laid flat across the piers and mud over them
  if (sq) {
    bag.add(STONE2, box(x - r - 0.14, y0 - 0.12, z - r - 0.14, x + r + 0.14, y0 - 0.01, z + r + 0.14));
    bag.add(MUD, box(x - r - 0.08, y0 - 0.02, z - r - 0.08, x + r + 0.08, y0 + 0.03, z + r + 0.08));
  } else {
    bag.add(STONE2, lathe([[r + 0.16, pl - 0.13], [r + 0.2, pl - 0.07], [r + 0.15, pl - 0.01], [0.001, pl - 0.01]], 12, (t, i) => 1 + 0.05 * Math.sin(t * 5 + hk(2) * 6 + i), x, y, z));
    bag.add(MUD, lathe([[r + 0.1, pl - 0.04], [r + 0.08, pl + 0.03], [0.001, pl + 0.03]], 12, null, x, y, z));
  }
  // the body of mud
  if (sq) {
    bag.add(WALL, roundPrism(x, y0, z, r, h, 0.13 + 0.03 * hk(3), 5));
    bag.add(MUD, box(x - r * 0.97, yh - 0.02, z - r * 0.97, x + r * 0.97, yh + 0.03, z + r * 0.97));
    for (const c of [0.3, 0.62]) bag.add(SMOOTH, roundPrism(x, y0 + h * c, z, r * 1.015, 0.05, 0.14, 1));        // the seam where one day's mud ended
  } else {
    const wob = hk(4) * 9;
    bag.add(WALL, lathe([[r * 1.05, 0], [r * 1.0, h * 0.12], [r * 1.06, h * 0.5], [r * 1.0, h * 0.8], [r * 0.98, h]], 16, (t, i) => 1 + 0.02 * Math.sin(t * 7 + i * 3.3 + wob) + 0.012 * Math.sin(t * 11 + wob * 2), x, y0, z));
    bag.add(MUD, lathe([[r * 0.98, h], [0.001, h]], 14, null, x, y0, z));
    for (const c of [0.3, 0.62, 0.9]) bag.add(SMOOTH, lathe([[r * (1.03 + 0.03 * c) + 0.012, 0], [r * (1.03 + 0.03 * c) + 0.035, 0.015], [r * (1.03 + 0.03 * c) + 0.012, 0.045]], 16, null, x, y0 + h * c, z));
  }
  // the hat: pointed, tiers of straw each flaring over the one below
  const R0 = sq ? r * 1.42 + 0.28 : r + 0.3, nc = 5, Rt = (t) => R0 * Math.pow(1 - t, 0.92) + 0.02, seg = 16;
  const hatH = sq ? Math.min(0.95 + r * 0.4, 1.4) : (o.hat ?? (r * 1.35 + 0.25));
  const hy = yh - 0.06, ph = hk(5) * 6.28;
  for (let j = 0; j < nc; j++) {
    const t0 = j / nc, t1 = (j + 1) / nc, mat = j % 2 ? STALK : THATCH;
    const f = (t, i) => 1 + (j === 0 ? 0.05 : 0.025) * Math.sin(t * 17 + ph + i) + 0.02 * Math.sin(t * 5 + ph * 2 + j);
    bag.add(mat, lathe([[Rt(t0) + 0.07, hatH * t0 - 0.05], [Rt(t0) + 0.03, hatH * t0 + 0.02], [Rt(t0) + 0.02, hatH * t0 + 0.05], [Rt(t1) + 0.03, hatH * t1 - 0.01]], seg, f, x, hy, z));
  }
  bag.add(THATCH, lathe([[Rt((nc - 0.1) / nc) + 0.03, hatH * (nc - 0.1) / nc], [0.02, hatH]], seg, null, x, hy, z));
  bag.add('bark_dark', lathe([[r * 1.02, -0.05], [R0 + 0.09, -0.05]], seg, null, x, hy, z));           // the dark under the eaves
  // the eaves ragged: loose straw hanging and splayed along the rim, some shorter on the second tier
  const ne = sq ? 26 : 20;
  for (let i = 0; i < ne; i++) {
    const a = (i + hk(30 + i)) / ne * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), len = 0.12 + 0.3 * hk(40 + i), sp = (hk(60 + i) - 0.5) * 0.18;
    bag.add(THATCH, rod([x + ca * (R0 + 0.06), hy - 0.03, z + sa * (R0 + 0.06)], [x + ca * (R0 + 0.1 + len * 0.3) - sa * sp, hy - 0.03 - len, z + sa * (R0 + 0.1 + len * 0.3) + ca * sp], 0.014, 3));
  }
  for (let i = 0; i < 12; i++) {
    const a = (i + hk(80 + i)) / 12 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), R1 = Rt(1 / nc) + 0.06, len = 0.1 + 0.2 * hk(90 + i);
    bag.add(STALK, rod([x + ca * R1, hy + hatH / nc - 0.04, z + sa * R1], [x + ca * (R1 + 0.08), hy + hatH / nc - 0.04 - len, z + sa * (R1 + 0.08)], 0.013, 3));
  }
  // the tip: tied off with a cord, the loose ends of the straw standing out above the knot (a pot over it on some)
  const tipY = hy + hatH;
  const kt = 0.85 + 0.3 * hk(8);
  bag.add(THATCH, lathe([[0.06 * kt, -0.26], [0.05 * kt, -0.1], [0.06 * kt, 0.0], [0.04 * kt, 0.08 + 0.02 * hk(9)], [0.001, 0.11 + 0.03 * hk(9)]], 7, null, x, tipY, z));
  for (const dy of [-0.2, -0.1]) bag.add('bark_dark', lathe([[0.066 * kt, dy - 0.01 * hk(12)], [0.066 * kt, dy + 0.035]], 7, null, x, tipY, z));
  for (let i = 0; i < 8; i++) { const a = (i + hk(100 + i)) / 8 * Math.PI * 2; bag.add(THATCH, rod([x, tipY + 0.02, z], [x + Math.cos(a) * 0.1, tipY + 0.2 + 0.08 * hk(110 + i), z + Math.sin(a) * 0.1], 0.012, 3)); }
  if (hk(6) < 0.35) bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0.02], [0.09, 0.08], [0.05, 0.13], [0.001, 0.14]], 8, null, x, tipY + 0.12, z));
  // the shutter (door.js leaf): two planks carved in rows, pivots in the frame, the sliding lock; the mud frame worked round it
  const dx = Math.sin(yaw), dz = Math.cos(yaw);
  const dw = 0.5, dh = 0.66, dy = kind === 'male' ? y0 + h * 0.5 : kind === 'female' || sq ? y0 + h * 0.32 : y0 + 0.02;
  const w = kind === 'low' ? 0.7 : dw, hgt = kind === 'low' ? 0.9 : dh;
  const off = sq ? r : r * 1.04;
  const px = x + dx * (off - 0.02), pz = z + dz * (off - 0.02);
  const add = (m, g) => bag.add(m, place(g, px, dy, pz, yaw));
  frame(add, w, hgt, { jamb: 0.05 });
  leaf(add, w, hgt - 0.02, { rand, planks: kind === 'low' ? 3 : 2, rows: kind === 'low' ? 5 : 3, lockAt: hk(7) < 0.5 ? 'e' : 'w', lockK: kind === 'low' ? 0.8 : 0.6 });
  add(SMOOTH, box(-w / 2 - 0.16, -0.04, -0.01, -w / 2 - 0.06, hgt + 0.2, 0.07)); add(SMOOTH, box(w / 2 + 0.06, -0.04, -0.01, w / 2 + 0.16, hgt + 0.2, 0.07));
  add(SMOOTH, box(-w / 2 - 0.16, hgt + 0.16, -0.01, w / 2 + 0.16, hgt + 0.26, 0.08));                  // the architrave of hand-smoothed mud
  if (kind === 'male') notchedLadder(bag, x + dx * (r + 0.5), y0, z + dz * (r + 0.5), dy - y0 - 0.05, -dx, -dz, 0.35);
  if (sq) col.rect([x - r - 0.3, z - r - 0.3, x + r + 0.3, z + r + 0.3], y - 0.3, yh + hatH);
  else col.circle(x, z, r + 0.3, y - 0.3, yh + hatH);
  for (let k = 0; k < 2; k++) { const a = hk(120 + k) * 6.28; bag.add(STONE, lathe([[0.12, 0], [0.09, 0.07], [0.001, 0.08]], 6, null, x + Math.cos(a) * (r + 0.3), y, z + Math.sin(a) * (r + 0.3))); }
}

/** A round kitchen: a cylinder of mud with a flat roof and a low parapet, a door gap toward `yaw`; solid (the landmark's is built by its own function). */
export function kitchen(bag, col, x, y, z, r, h, yaw, rand) {
  const N = 14;
  bag.add(WALL, lathe([[r * 1.05, -0.4], [r * 1.02, h * 0.2], [r, h]], N, (t, i) => 1 + 0.02 * Math.sin(t * 5 + i * 2 + x), x, y, z));
  bag.add(MUD, lathe([[r, h], [0.001, h + 0.02]], N, null, x, y, z));
  bag.add(WALL, lathe([[r, h], [r * 1.0, h + 0.26], [r * 0.9, h + 0.26], [r * 0.9, h]], N, null, x, y, z));
  const dx = Math.sin(yaw), dz = Math.cos(yaw);
  bag.add(HOLE, place(box(-0.35, 0.0, 0, 0.35, 1.2, 0.03), x + dx * (r - 0.02), y, z + dz * (r - 0.02), yaw));
  col.circle(x, z, r + 0.05, y - 0.4, y + h + 0.3);
  col.floor([x - r * 0.7, z - r * 0.7, x + r * 0.7, z + r * 0.7], y + h);
  void rand;
}

/**
 * The facade of a ginna on the south side of its block: along x from x0 to x1, the wall's south face at zf, from y to y + H.
 * pilasters on a 1.05 m beat, three rows of niches between them, a cornice, a band of triangles in red wash at the top; the door
 * leaf (double) in a frame at doorAt (or none).
 */
export function nicheFacade(bag, x0, x1, zf, y, H, rand, o = {}) {
  // kinds (docs/settlements/dogon.md §5): 'niche' (three rows of niches, the red band of triangles), 'plain' (smooth plaster, the older kind),
  // 'tall' (a higher facade, stepped pilaster heads, four rows of smaller niches), 'zigzag' (smooth, two raised bands with white zig-zags),
  // 'wash' (a darker mud wash up to the first rows' height, niches above it, a pale band under the cornice)
  const kind = o.kind ?? (o.plain ? 'plain' : 'niche');
  const smooth = kind === 'plain' || kind === 'zigzag';
  const n = Math.max(2, Math.round((x1 - x0) / 1.05)), pitch = (x1 - x0) / n;
  const door = o.doors ?? [];
  const clr = o.clear ?? 0.78, inDoor = (u, w) => door.some((d) => Math.abs(u - d) < w / 2 + clr - 0.03);
  const top = y + H;
  const step = kind === 'tall' ? 0.2 : 0.12, beat = kind === 'tall' ? 3 : 2;
  for (let i = 0; i <= n; i++) {
    const u = x0 + i * pitch;
    if (door.some((d) => Math.abs(u - d) < clr)) continue;
    bag.add(PLASTER, box(u - 0.14, y, zf, u + 0.14, top + 0.2 + (i % beat) * step, zf + 0.15));
  }
  // the spans between the doors and the facade's ends, for the bands laid on the wall
  const cuts = [x0 - 0.2, ...[...door].sort((a, b) => a - b).flatMap((d) => [d - clr + 0.03, d + clr - 0.03]), x1 + 0.2], spans = [];
  for (let i = 0; i < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > 0.4) spans.push([cuts[i], cuts[i + 1]]);
  if (!smooth) {
    const rows = kind === 'tall' ? 4 : 3, nh = kind === 'tall' ? 0.28 : 0.34, nw = kind === 'tall' ? 0.13 : 0.17, sp = kind === 'tall' ? 0.62 : 0.66, y0 = kind === 'wash' ? y + 1.45 : y + 1.15;
    for (let i = 0; i < n; i++) {
      const uc = x0 + (i + 0.5) * pitch;
      if (inDoor(uc, 0)) continue;
      for (let r = 0; r < rows; r++) {
        const yy = y0 + r * sp + (H - 3) * 0.3 * r * 0.3;
        if (yy + 0.4 > top - 0.35 - (kind === 'wash' ? 0.35 : 0)) continue;
        if (r === 0 && kind !== 'wash' && rand() < 0.25) continue;
        bag.add(HOLE, box(uc - nw, yy, zf, uc + nw, yy + nh, zf + 0.012));
        // the niche as a recess: a hand-smoothed frame standing 0.09 m proud of the wall, so the dark back lies that deep (lintel heavy, sill sloped, jambs)
        const e = 0.001 * (r % 3), dz = 0.09 + e;
        bag.add(SMOOTH, box(uc - nw - 0.06, yy + nh, zf, uc + nw + 0.06, yy + nh + 0.06, zf + dz + 0.02));
        bag.add(SMOOTH, box(uc - nw - 0.05, yy - 0.05, zf, uc + nw + 0.05, yy, zf + dz));
        bag.add(SMOOTH, box(uc - nw - 0.05, yy, zf, uc - nw, yy + nh, zf + dz));
        bag.add(SMOOTH, box(uc + nw, yy, zf, uc + nw + 0.05, yy + nh, zf + dz));
        bag.add(WALL, box(uc - nw, yy, zf + 0.012, uc + nw, yy + 0.02, zf + dz - 0.01));                    // the niche's floor, seen from above
      }
    }
  }
  bag.add(PLASTER, box(x0 - 0.2, top - 0.1, zf - 0.02, x1 + 0.2, top + 0.14, zf + 0.12));      // the cornice
  if (kind === 'wash') {
    // the darker wash of the lower wall, a raised hem at its top, and the pale band under the cornice
    for (const [a, b] of spans) { bag.add(MUD, box(a, y, zf, b, y + 1.25, zf + 0.04)); bag.add(SMOOTH, box(a, y + 1.25, zf, b, y + 1.3, zf + 0.08)); bag.add('limewash_white', box(a, top - 0.62, zf, b, top - 0.12, zf + 0.04)); }
  }
  // the red band of triangles under the cornice
  const T = [], W = [];
  if (kind === 'niche' || kind === 'tall' || kind === 'wash') {
    for (let i = 0; i < n * 3; i++) {
      const a = x0 + i * pitch / 3, b = a + pitch / 3, yb = top - (kind === 'wash' ? 1.1 : 0.5), yt = top - (kind === 'wash' ? 0.75 : 0.15);
      if (door.some((d) => Math.abs((a + b) / 2 - d) < clr)) continue;
      T.push(a, yb, zf + 0.165, (a + b) / 2, yt, zf + 0.165, b, yb, zf + 0.165);
    }
    if (T.length && kind !== 'wash') bag.add(RED, fromTriangles(T));
  }
  if (kind === 'zigzag') {
    // two raised bands of plaster with a zig-zag of white wash: one low, one under the cornice
    for (const [b0, b1] of [[y + 1.0, y + 1.55], [top - 0.85, top - 0.3]]) {
      for (const [a, b] of spans) bag.add(PLASTER, box(a, b0, zf, b, b1, zf + 0.15));
      const k = Math.max(4, Math.round((x1 - x0) / 0.3));
      for (let i = 0; i < k; i++) {
        const a = x0 + (i / k) * (x1 - x0), b = x0 + ((i + 1) / k) * (x1 - x0), m = (a + b) / 2;
        if (door.some((d) => Math.abs(m - d) < clr)) continue;
        if (i % 2 === 0) W.push(a, b0 + 0.04, zf + 0.153, m, b1 - 0.04, zf + 0.153, b, b0 + 0.04, zf + 0.153);
        else W.push(a, b1 - 0.04, zf + 0.153, m, b0 + 0.04, zf + 0.153, b, b1 - 0.04, zf + 0.153);
      }
    }
    if (W.length) bag.add('limewash_white', fromTriangles(W));
  }
}

/** A carved door (door.js): the frame with its lintel and sill, the plank leaf carved in registers by this door's own seed, the sliding-bolt lock. At (u, y), facing +z at zf. An open door stands with its leaf swung back against the wall's front beside the jamb. */
export function carvedDoor(bag, u, y, zf, w, h, rand, open = false) {
  const at = (px, pz, yaw) => (m, g) => bag.add(m, place(g, px, y, pz, yaw));
  frame(at(u, zf, 0), w, h, open ? { fill: 0.5 } : {});
  // the mud crown over the door: two steps of hand-smoothed plaster, and the worked reveal either side
  const cr = at(u, zf, 0);
  cr(SMOOTH, box(-w / 2 - 0.3, h + 0.2, 0.0, w / 2 + 0.3, h + 0.31, 0.1)); cr(SMOOTH, box(-w / 2 - 0.12, h + 0.31, 0.0, w / 2 + 0.12, h + 0.42, 0.1));
  for (const sd of [-1, 1]) cr(SMOOTH, box(sd * (w / 2 + 0.2) - 0.06, 0.0, 0.0, sd * (w / 2 + 0.2) + 0.06, h + 0.2, 0.06));
  const o = { rand, planks: w > 0.9 ? 3 : 2, rows: h > 1.7 ? 5 : 4, lockAt: rand() < 0.5 ? 'e' : 'w', lockK: 1 };
  if (!open) { leaf(at(u, zf, 0), w, h - 0.03, o); return; }
  const swing = (m, g) => bag.add(m, place(g.translate(-w / 2, 0, 0), u + w / 2 + 0.14, y, zf + 0.14, Math.PI / 2));
  leaf(swing, w, h - 0.03, { ...o, lockAt: 'w' });
}

/** A drain spout: a half-log hollowed out and run through the parapet at `at` on its side (dir [nx, nz] outward), standing out 0.7 m and tilted down, with the dark mouth cut in the parapet and the wet stain of the roof's water below. */
export function spout(bag, x, y, z, dir) {
  const [nx, nz] = dir, tx = -nz, tz = nx, k = hv(x, z, 5), L = 0.62 + 0.18 * k;
  const slab = (t0, t1, y0, y1, n0, n1) => {     // a box across the spout's tangent (t0…t1) and along its normal (n0…n1) from the wall's face (x, z)
    const ax = x + tx * t0 + nx * n0, az = z + tz * t0 + nz * n0, bx = x + tx * t1 + nx * n1, bz = z + tz * t1 + nz * n1;
    return box(Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz));
  };
  bag.add(HOLE, slab(-0.12, 0.12, y - 0.04, y + 0.14, 0, 0.005));                              // the mouth cut in the parapet
  bag.add(MUD, slab(-0.07, 0.07, y - 1.0 - 0.5 * k, y - 0.04, 0, 0.004));                          // the wet stain of the water down the wall
  bag.add(DARK, rod([x - nx * 0.3, y + 0.06, z - nz * 0.3], [x + nx * L, y - 0.02, z + nz * L], 0.085, 6));
  for (const s of [-1, 1]) bag.add(DARK, rod([x - nx * 0.1 + tx * 0.075 * s, y + 0.115, z - nz * 0.1 + tz * 0.075 * s], [x + nx * L + tx * 0.07 * s, y + 0.03, z + nz * L + tz * 0.07 * s], 0.02, 4));      // the lips of the channel
}

/** A flat roof's furniture: parapet round the edge (a lip 0.28 high), drain spouts (o.sides: which sides, 'n' 's' 'e' 'w'; default the south), bundles of stalks, pots. */
export function roofTop(bag, col, rect, top, rand, o = {}) {
  const [x0, z0, x1, z1] = rect, t = 0.3, ph = 0.3;
  bag.add(MUD, box(x0, top, z0, x1, top + 0.1, z1));
  for (const r of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]]) bag.add(WALL, box(r[0], top, r[1], r[2], top + ph, r[3]));
  // the spouts of the drain: hollowed half-logs through the parapet
  for (const side of o.sides ?? ['s']) {
    const horiz = side === 'n' || side === 's', a = horiz ? x0 : z0, b = horiz ? x1 : z1, n = Math.max(1, Math.round((b - a) / 3.4));
    for (let k = 0; k < n; k++) {
      const u = a + (b - a) * (k + 0.5 + (hv(x0 + k, z0, 8) - 0.5) * 0.3) / n;
      if (side === 's') spout(bag, u, top + 0.08, z1, [0, 1]); else if (side === 'n') spout(bag, u, top + 0.08, z0, [0, -1]); else if (side === 'e') spout(bag, x1, top + 0.08, u, [1, 0]); else spout(bag, x0, top + 0.08, u, [-1, 0]);
    }
  }
  col.floor(rect, top + 0.1);
  if (o.stalks) for (let k = 0; k < o.stalks; k++) milletStack(bag, { circle() {} }, x0 + 0.8 + rand() * (x1 - x0 - 1.6), top + 0.1, z0 + 0.8 + rand() * (z1 - z0 - 1.6), 1.0 + rand() * 0.6, 0.35, Math.floor(rand() * 999));
  if (o.pots) for (let k = 0; k < o.pots; k++) jar(bag, x0 + 0.7 + rand() * (x1 - x0 - 1.4), top + 0.1, z0 + 0.7 + rand() * (z1 - z0 - 1.4), 1.0 + rand() * 0.3, rand() < 0.5 ? 'terracotta' : 'pottery_dark');
}

/** An altar: a cone of mud (Lébé: pointed, whitened with millet offerings) or the binu (a small house with a door). */
export function altar(bag, col, x, y, z, kind, rand) {
  if (kind === 'cone') {
    bag.add(STONE, lathe([[0.7, -0.2], [0.68, 0.1], [0.001, 0.1]], 10, (t) => 1 + 0.06 * Math.sin(t * 5), x, y, z));
    bag.add(WALL, lathe([[0.55, 0.08], [0.4, 0.5], [0.22, 0.95], [0.001, 1.25]], 10, (t, i) => 1 + 0.05 * Math.sin(t * 4 + i), x, y, z));
    bag.add('plaster_white', lathe([[0.3, 0.55], [0.25, 0.7], [0.14, 0.95], [0.12, 0.94], [0.2, 0.7], [0.27, 0.55]], 10, (t) => 1 + 0.2 * Math.sin(t * 3), x, y, z));      // the crust of the offerings
    col.circle(x, z, 0.65, y - 0.2, y + 1.3);
  } else {
    bag.add(WALL, box(x - 0.7, y - 0.2, z - 0.55, x + 0.7, y + 1.05, z + 0.55));
    bag.add(MUD, box(x - 0.78, y + 1.05, z - 0.63, x + 0.78, y + 1.18, z + 0.63));
    bag.add(HOLE, box(x - 0.2, y + 0.25, z + 0.55, x + 0.2, y + 0.75, z + 0.562));
    bag.add(DARK, box(x - 0.17, y + 0.28, z + 0.562, x + 0.17, y + 0.72, z + 0.58));
    bag.add('plaster_white', box(x - 0.7, y + 0.9, z + 0.55, x + 0.7, y + 0.98, z + 0.563));
    for (let k = 0; k < 4; k++) bag.add(RED, box(x - 0.6 + k * 0.33, y + 0.5, z + 0.55, x - 0.5 + k * 0.33, y + 0.62, z + 0.564));
    col.rect([x - 0.78, z - 0.63, x + 0.78, z + 0.63], y - 0.2, y + 1.2);
  }
  void rand;
}
