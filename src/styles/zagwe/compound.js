// The village of Lasta (docs/settlements/lalibela.md §15): the compounds (gojo) of the farmers and
// the clergy — a yard walled with piled stone or fenced with wattle and thorn, with the things of a
// highland household standing in it: firewood, the stilted granary of woven basketry or mud, the
// haystack on its pole, hanging log beehives, water pots, the grindstone, the washing line, the
// threshing floor, the pen — and the retaining walls of the terraced fields on the slopes.

import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { slope, riserR, TERR, onLane, inCut, PRECINCT } from '../../settlements/lalibela/layout.js';
import { rod } from './hut.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ground = (x, z) => slope(x, z);

/** A stilted granary (gotera): four stone piers, a woven (or mud-plastered) barrel with a bulging belly, a thatched cap, a little door. */
export function granary(bag, col, x, z, seed, mud = false) {
  const rand = rng(seed), y = ground(x, z), s = 0.9 + rand() * 0.25, h0 = 0.55;
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; bag.add('rubble', lathe([[0.001, -0.3], [0.17, -0.3], [0.15, h0], [0.001, h0]], 7, null, x + Math.cos(a) * 0.55 * s, y, z + Math.sin(a) * 0.55 * s)); }
  bag.add('timber', lathe([[0.001, h0 - 0.02], [0.82 * s, h0 - 0.02], [0.82 * s, h0 + 0.08], [0.001, h0 + 0.08]], 12, null, x, y, z));
  const body = [[0.001, h0 + 0.08], [0.78 * s, h0 + 0.08], [0.92 * s, h0 + 0.5 * s], [0.96 * s, h0 + 1.0 * s], [0.84 * s, h0 + 1.45 * s], [0.62 * s, h0 + 1.65 * s]];
  bag.add(mud ? 'mud_plaster' : 'wicker', lathe(body, 14, (th) => 1 + 0.025 * Math.sin(th * 9 + seed), x, y, z));
  if (!mud) for (const hh of [0.45, 0.95, 1.4]) bag.add('timber', lathe([[0.9 * s + hh * 0.05, h0 + hh * s], [0.915 * s + hh * 0.05, h0 + hh * s], [0.915 * s + hh * 0.05, h0 + hh * s + 0.04], [0.9 * s + hh * 0.05, h0 + hh * s + 0.04]], 14, null, x, y, z));
  bag.add('thatch', lathe([[0.001, h0 + 2.55 * s], [0.28 * s, h0 + 2.2 * s], [0.78 * s, h0 + 1.78 * s], [1.08 * s, h0 + 1.62 * s], [0.6 * s, h0 + 1.6 * s], [0.001, h0 + 1.6 * s]], 14, (th) => 1 + 0.03 * Math.sin(th * 7), x, y, z));
  const a = rand() * 6.28;
  bag.add('opening', orientedBox([x + Math.cos(a) * 0.9 * s - Math.sin(a) * 0.17, z + Math.sin(a) * 0.9 * s + Math.cos(a) * 0.17], [x + Math.cos(a) * 0.9 * s + Math.sin(a) * 0.17, z + Math.sin(a) * 0.9 * s - Math.cos(a) * 0.17], 0.12, y + h0 + 0.55, y + h0 + 1.0));
  col.circle(x, z, 0.95 * s, y, y + h0 + 1.8);
}
/** A log beehive pair hung from a crossbar between two posts. */
function beehives(bag, col, x, z, rot, rand) {
  const y = ground(x, z), c = Math.cos(rot), s = Math.sin(rot), P = (a, h) => [x + c * a, y + h, z + s * a];
  const t = [];
  for (const sg of [-1, 1]) rod(t, P(sg * 1.0, -0.2), P(sg * 1.0, 2.3), 0.07, 5);
  rod(t, P(-1.05, 2.2), P(1.05, 2.2), 0.05, 5);
  bag.add('timber', fromTriangles(t));
  const r2 = [];
  for (const [a, hh] of [[-0.45, 1.65], [0.4, 1.55]]) {
    const L = 1.0 + rand() * 0.25, p = P(a, hh);
    const g = lathe([[0.001, -L / 2], [0.17, -L / 2], [0.19, -L * 0.2], [0.19, L * 0.2], [0.17, L / 2], [0.001, L / 2]], 8).rotateZ(Math.PI / 2).rotateY(-rot).translate(p[0], p[1], p[2]);
    bag.add('bark_grey', g);
    rod(r2, P(a - 0.1, hh + 0.19), P(a - 0.04, 2.2), 0.012, 3); rod(r2, P(a + 0.1, hh + 0.19), P(a + 0.04, 2.2), 0.012, 3);
    bag.add('wood_dark', lathe([[0.001, -0.02], [0.15, -0.02], [0.15, 0.02], [0.001, 0.02]], 8).rotateZ(Math.PI / 2).rotateY(-rot).translate(p[0] + c * 0, p[1], p[2]));
  }
  bag.add('rope_fibre', fromTriangles(r2));
  col.circle(x + c * 1.0, z + s * 1.0, 0.12, y, y + 2.3); col.circle(x - c * 1.0, z - s * 1.0, 0.12, y, y + 2.3);
}
/** A haystack round a pole, its peaked top bound. */
function haystack(bag, col, x, z, rand) {
  const y = ground(x, z), s = 0.9 + rand() * 0.4;
  bag.add('timber', lathe([[0.001, 0.0], [0.5 * s, 0.0], [0.5 * s, 0.4], [0.001, 0.4]], 6, null, x, y, z));
  bag.add('thatch', lathe([[0.001, 0.38], [0.95 * s, 0.4], [1.12 * s, 0.9 * s], [0.95 * s, 1.6 * s], [0.5 * s, 2.2 * s], [0.12 * s, 2.7 * s], [0.001, 2.75 * s]], 12, (th) => 1 + 0.07 * Math.sin(th * 5 + x), x, y, z));
  bag.add('timber', lathe([[0.02, 2.6 * s], [0.016, 3.2 * s], [0.001, 3.22 * s]], 5, null, x, y, z));
  col.circle(x, z, 1.0 * s, y, y + 2.4);
}
/** A stack of split firewood against a wall: layers of logs lying along it. */
function firewood(bag, col, x, z, rot, rand) {
  const y = ground(x, z), c = Math.cos(rot), s = Math.sin(rot), t = [], n = 4 + Math.floor(rand() * 2);
  for (let row = 0; row < n; row++) for (let k = 0; k < n - row + 2; k++) {
    const a = (k - (n - row + 1) / 2) * 0.17 + (rand() - 0.5) * 0.03, h = 0.09 + row * 0.15, off = (rand() - 0.5) * 0.08;
    rod(t, [x + c * a - s * (0.55 + off), y + h, z + s * a + c * (0.55 + off)], [x + c * a + s * (0.55 - off), y + h, z + s * a - c * (0.55 - off)], 0.075 + rand() * 0.02, 5);
  }
  bag.add('timber', fromTriangles(t));
  col.circle(x, z, 0.85, y, y + 0.8);
}
/** A grindstone: a sloping slab on two stones and its round muller (the women's daily work). */
function quern(bag, col, x, z, rot) {
  const y = ground(x, z), c = Math.cos(rot), s = Math.sin(rot);
  for (const sg of [-1, 1]) bag.add('rubble', lathe([[0.001, 0], [0.17, 0], [0.15, 0.18 - (sg > 0 ? 0.04 : 0)], [0.001, 0.2 - (sg > 0 ? 0.04 : 0)]], 7, null, x + c * 0.32 * sg, y, z + s * 0.32 * sg));
  bag.add('granite_rough', orientedBox([x - c * 0.46, z - s * 0.46], [x + c * 0.46, z + s * 0.46], 0.5, y + 0.17, y + 0.25));
  bag.add('granite_rough', lathe([[0.001, 0.26], [0.1, 0.26], [0.12, 0.3], [0.1, 0.33], [0.001, 0.33]], 8, null, x + c * 0.1, y, z + s * 0.1));
  col.circle(x, z, 0.7, y, y + 0.35);
}
/** The washing: a line between two forked poles with white shawls (the netela) hanging over it. */
function washLine(bag, col, x, z, rot, rand) {
  const y = ground(x, z), c = Math.cos(rot), s = Math.sin(rot), L = 2.4, t = [];
  for (const sg of [-1, 1]) rod(t, [x + c * L * sg, y - 0.1, z + s * L * sg], [x + c * L * sg, y + 1.75, z + s * L * sg], 0.04, 5);
  rod(t, [x - c * L, y + 1.65, z - s * L], [x + c * L, y + 1.6, z + s * L], 0.012, 3);
  bag.add('timber', fromTriangles(t));
  let a = -L + 0.3;
  while (a < L - 0.6) {
    const w = 0.7 + rand() * 0.5, mat = rand() < 0.75 ? 'cloth_white' : rand() < 0.5 ? 'cloth_ochre' : 'cloth_indigo', d = 0.5 + rand() * 0.5;
    bag.add(mat, orientedBox([x + c * a, z + s * a], [x + c * (a + w), z + s * (a + w)], 0.025, y + 1.62 - d, y + 1.65));
    a += w + 0.2 + rand() * 0.2;
  }
  col.circle(x - c * L, z - s * L, 0.06, y, y + 1.7); col.circle(x + c * L, z + s * L, 0.06, y, y + 1.7);
}
/** Water pots (terracotta, a gourd dipper), standing together by a doorstep. */
function pots(bag, col, x, z, rand) {
  const y = ground(x, z);
  const n = 2 + Math.floor(rand() * 2);
  for (let k = 0; k < n; k++) {
    const px = x + (k - 1) * 0.55 + (rand() - 0.5) * 0.15, pz = z + (rand() - 0.5) * 0.3, sc = 0.8 + rand() * 0.5;
    bag.add(k === 1 && rand() < 0.5 ? 'pottery_dark' : 'terracotta', lathe([[0.001, 0.0], [0.17 * sc, 0.02], [0.3 * sc, 0.26 * sc], [0.31 * sc, 0.5 * sc], [0.2 * sc, 0.72 * sc], [0.15 * sc, 0.8 * sc], [0.19 * sc, 0.86 * sc], [0.001, 0.86 * sc]], 10, (th) => 1 + 0.02 * Math.sin(th * 4 + k), px, y, pz));
    col.circle(px, pz, 0.3 * sc, y, y + 0.85 * sc);
  }
}
/** A round pen: a fence of wattle and thorn with a gap, the floor trampled. */
function pen(bag, col, x, z, rot, rand) {
  const y0 = ground(x, z), R = 2.5 + rand() * 0.6, n = Math.ceil(2 * Math.PI * R / 0.9), h = 1.15;
  bag.add('mud_plaster', lathe([[0.001, 0.025], [R, 0.025], [R, 0.0], [0.001, 0.0]], 16, null, x, y0 - 0.0, z));
  const posts = [];
  for (let k = 0; k < n; k++) {
    const a0 = rot + 0.45 + (k / n) * (Math.PI * 2 - 0.9), a1 = rot + 0.45 + ((k + 1) / n) * (Math.PI * 2 - 0.9);
    const A = [x + Math.cos(a0) * R, z + Math.sin(a0) * R], B = [x + Math.cos(a1) * R, z + Math.sin(a1) * R], yy = ground((A[0] + B[0]) / 2, (A[1] + B[1]) / 2);
    bag.add('bark_dark', orientedBox(A, B, 0.2, yy + 0.3, yy + h * 0.95));
    col.segment(A, B, 0.22, yy, yy + h);
    if (k % 2 === 0) rod(posts, [A[0], yy - 0.1, A[1]], [A[0], yy + h + 0.25 + rand() * 0.2, A[1]], 0.045, 4);
  }
  bag.add('timber', fromTriangles(posts));
}
/** A threshing floor: a disc of beaten and smeared earth, a stake at its middle. */
function threshing(bag, x, z, rand) {
  const y = ground(x, z), R = 3.4 + rand() * 0.8;
  bag.add('mud_plaster', lathe([[0.001, 0.035], [R, 0.035], [R + 0.05, 0.0], [0.001, 0.0]], 18, null, x, y, z));
  bag.add('timber', lathe([[0.04, 0.0], [0.035, 1.5], [0.001, 1.52]], 5, null, x, y, z));
  bag.add('thatch', lathe([[R * 0.6, 0.03], [R * 0.8, 0.03], [R * 0.7, 0.09], [R * 0.5, 0.1]], 10, (th) => 1 + 0.08 * Math.sin(th * 3), x, y, z));
}
/** A stone seat by the door: a slab on two piled stones. */
function seat(bag, col, x, z, rot) {
  const y = ground(x, z), c = Math.cos(rot), s = Math.sin(rot);
  for (const sg of [-1, 1]) bag.add('rubble', box(x + c * 0.45 * sg - 0.17, y - 0.05, z + s * 0.45 * sg - 0.17, x + c * 0.45 * sg + 0.17, y + 0.3, z + s * 0.45 * sg + 0.17));
  bag.add('granite_rough', orientedBox([x - c * 0.7, z - s * 0.7], [x + c * 0.7, z + s * 0.7], 0.42, y + 0.3, y + 0.38));
  col.segment([x - c * 0.7, z - s * 0.7], [x + c * 0.7, z + s * 0.7], 0.42, y, y + 0.4);
}

/**
 * yard: a compound's yard { c [x, z], R, gate (rad, toward the lane), seed, stone, main: { c, r, door }, granary [x, z]|null, pen [x, z]|null }:
 * its wall or fence round it with a gate gap (posts and a pole laid by it), and the things of the household — placed by the seed on the
 * yard's own frame (u toward the gate, v across).
 */
export function yardEl(el, { bag, col }) {
  const rand = rng(el.seed), [cx, cz] = el.c, R = el.R, gate = el.gate, u = [Math.cos(gate), Math.sin(gate)], v = [-u[1], u[0]];
  const gap = 1.7 / R, n = Math.ceil((Math.PI * 2 - 2 * gap) * R / 1.8), stone = el.stone;
  const hgt = stone ? 0.95 : 1.3, th = stone ? 0.62 : 0.16;
  const posts = [];
  for (let k = 0; k < n; k++) {
    const a0 = gate + gap + (k / n) * (Math.PI * 2 - 2 * gap), a1 = gate + gap + ((k + 1) / n) * (Math.PI * 2 - 2 * gap);
    const A = [cx + Math.cos(a0) * R, cz + Math.sin(a0) * R], B = [cx + Math.cos(a1) * R, cz + Math.sin(a1) * R], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], yy = ground(m[0], m[1]) - 0.25;
    const hh = hgt * (0.9 + rand() * 0.2);
    bag.add(stone ? (k % 3 === 2 ? 'schist_rubble' : 'rubble') : 'wicker', orientedBox(A, B, th, yy, yy + hh + 0.25, 0.03));
    if (stone && k % 4 === 1) bag.add('rubble', orientedBox(A, B, th + 0.1, yy + hh * 0.5 + 0.25, yy + hh * 0.5 + 0.38, 0.03));    // a proud course
    if (!stone && k % 3 === 0) rod(posts, [A[0], yy, A[1]], [A[0], yy + hh + 0.65 + rand() * 0.25, A[1]], 0.05, 4);
    col.segment(A, B, th + 0.05, yy, yy + hh + 0.25);
  }
  if (posts.length) bag.add('timber', fromTriangles(posts));
  // the gate: two forked posts, a pole laid across the ground beside the opening
  { const t = [], g0 = gate - gap * 0.9, g1 = gate + gap * 0.9, P = (a) => [cx + Math.cos(a) * R, cz + Math.sin(a) * R];
    for (const a of [g0, g1]) { const p = P(a), y = ground(p[0], p[1]); rod(t, [p[0], y - 0.2, p[1]], [p[0], y + 1.85, p[1]], 0.07, 5); col.circle(p[0], p[1], 0.09, y, y + 1.8); }
    const p = P(gate + gap * 1.2), y = ground(p[0], p[1]); rod(t, [p[0] - v[0] * 1.4 + u[0] * 0.3, y + 0.1, p[1] - v[1] * 1.4 + u[1] * 0.3], [p[0] + v[0] * 1.4 + u[0] * 0.3, y + 0.08, p[1] + v[1] * 1.4 + u[1] * 0.3], 0.05, 5);
    bag.add('timber', fromTriangles(t)); }
  // the households' things
  const M = el.main, md = M.door ?? gate, mu = [Math.cos(md), Math.sin(md)], mv = [-mu[1], mu[0]], dd = M.r + 1.0;
  pots(bag, col, M.c[0] + mu[0] * (M.r + 0.5) + mv[0] * 1.5, M.c[1] + mu[1] * (M.r + 0.5) + mv[1] * 1.5, rand);
  seat(bag, col, M.c[0] + mu[0] * (M.r + 0.55) - mv[0] * 1.9, M.c[1] + mu[1] * (M.r + 0.55) - mv[1] * 1.9, Math.atan2(mv[1], mv[0]));
  if (rand() < 0.8) firewood(bag, col, M.c[0] + mv[0] * (M.r + 0.3) * 0.0 - mu[0] * (M.r + 0.6), M.c[1] - mu[1] * (M.r + 0.6), Math.atan2(mv[1], mv[0]) + 0, rand);
  if (rand() < 0.5) quern(bag, col, M.c[0] + mu[0] * dd + mv[0] * 0.2 - mv[0] * 0.5, M.c[1] + mu[1] * dd - mv[1] * 0.5 + mv[1] * 0.2, Math.atan2(mv[1], mv[0]));
  if (rand() < 0.7) haystack(bag, col, cx - u[0] * (R * 0.3) + v[0] * R * 0.55, cz - u[1] * (R * 0.3) + v[1] * R * 0.55, rand);
  if (rand() < 0.45) washLine(bag, col, cx + u[0] * R * 0.2 - v[0] * R * 0.5, cz + u[1] * R * 0.2 - v[1] * R * 0.5, Math.atan2(u[1], u[0]) + 0.5, rand);
  if (rand() < 0.35 && R > 8.4) beehives(bag, col, cx + u[0] * R * 0.1 + v[0] * R * 0.1, cz + u[1] * R * 0.1 + v[1] * R * 0.1, Math.atan2(v[1], v[0]), rand);
  if (el.granary) granary(bag, col, el.granary[0], el.granary[1], el.seed + 3, rand() < 0.5);
  if (el.pen) pen(bag, col, el.pen[0], el.pen[1], gate + Math.PI, rand);
  else if (rand() < 0.6) threshing(bag, cx + u[0] * R * 0.38 + v[0] * R * 0.3, cz + u[1] * R * 0.38 + v[1] * R * 0.3, rand);
}

/**
 * terrace: the retaining wall of the field terraces on the riser n { n, from, to (angles) }: stone laid dry, its face a little rough,
 * from the lower tread to the upper's edge; left open where a lane or road crosses it.
 */
export function terraceEl(el, { bag, col }) {
  const r = riserR(el.n), step = 3.6 / r, a0 = el.from, a1 = el.to, rand = rng(el.n * 977 + Math.round(a0 * 100));
  for (let a = a0; a < a1 - 1e-6; a += step) {
    const am = a + step / 2, mx = Math.cos(am) * r, mz = Math.sin(am) * r;
    if (onLane(mx, mz) < 1.2 || inCut(mx, mz, 4)) continue;
    const ax = Math.cos(a) * r, az = Math.sin(a) * r, bx = Math.cos(a + step) * r, bz = Math.sin(a + step) * r;
    const lo = Math.min(slope(mx - Math.cos(am) * 1.2, mz - Math.sin(am) * 1.2), slope(ax - Math.cos(a) * 1.2, az - Math.sin(a) * 1.2)), hi = slope(mx + Math.cos(am) * 1.1, mz + Math.sin(am) * 1.1) + 0.08;
    const y0 = lo - 0.3, hh = hi - y0 + rand() * 0.12;
    bag.add((Math.round(a * 500) & 1) ? 'schist_rubble' : 'rubble', orientedBox([ax, az], [bx, bz], 0.55, y0, y0 + hh, 0.04));
    col.segment([ax, az], [bx, bz], 0.55, lo - 0.2, y0 + hh);
  }
}
void TERR; void PRECINCT;

// ---- the courts of the churches: what pilgrims and clergy leave there (docs §16)
/** Sandals left at a door (the pilgrims go in barefoot): rows of pairs, each turned a little. */
function shoes(bag, x, y, z, rot, n, rand) {
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let k = 0; k < n; k++) {
    const a = (k - n / 2) * 0.36 + (rand() - 0.5) * 0.08, row = (k % 2) * 0.32 + (rand() - 0.5) * 0.06, t = rot + (rand() - 0.5) * 0.7, mat = rand() < 0.6 ? 'hide_brown' : rand() < 0.5 ? 'hide_tan' : 'hide_black';
    for (const sg of [-1, 1]) {
      const px = x + c * a - s * row + (-Math.sin(t)) * 0.07 * sg * 0, pz = z + s * a + c * row, ox = Math.cos(t + Math.PI / 2) * 0.07 * sg, oz = Math.sin(t + Math.PI / 2) * 0.07 * sg;
      bag.add(mat, orientedBox([px + ox - Math.cos(t) * 0.12, pz + oz - Math.sin(t) * 0.12], [px + ox + Math.cos(t) * 0.12, pz + oz + Math.sin(t) * 0.12], 0.075, y, y + 0.025));
    }
  }
}
/** Staffs of pilgrims leant together against a wall (the walls' foot at [x, z], n the unit into the court). */
function staffs(bag, x, y, z, nx, nz, rand) {
  const t = [];
  for (let k = 0; k < 3; k++) { const o = (k - 1) * 0.16, ux = -nz * o, uz = nx * o; rod(t, [x + nx * (0.55 + k * 0.04) + ux, y, z + nz * (0.55 + k * 0.04) + uz], [x + nx * 0.05 + ux, y + 1.45 + rand() * 0.25, z + nz * 0.05 + uz], 0.022, 4); }
  bag.add('wood_dark', fromTriangles(t));
}
/** A white bundle (a pilgrim's cloth, tied) with its walking stick across it. */
function bundle(bag, x, y, z, rand) {
  bag.add('cloth_white', lathe([[0.001, 0], [0.22, 0.01], [0.28, 0.13], [0.2, 0.26], [0.08, 0.32], [0.001, 0.33]], 8, (th) => 1 + 0.08 * Math.sin(th * 3 + x), x, y, z));
  const t = [], a = rand() * 3; rod(t, [x - Math.cos(a) * 0.5, y + 0.28, z - Math.sin(a) * 0.5], [x + Math.cos(a) * 0.5, y + 0.3, z + Math.sin(a) * 0.5], 0.02, 4); bag.add('wood_dark', fromTriangles(t));
}
/**
 * court: dressing for one pit { y (the floor), seed, shoes: [[x, z, rot, n]], walls: [[x, z, nx, nz, kind]] }: sandals at the doors; at the
 * foot of the rock walls the pilgrims' staffs, bundles, water jars, and benches cut from the rock itself (the masons left rock seats).
 */
export function courtEl(el, { bag, col }) {
  const rand = rng(el.seed), y = el.y;
  for (const [x, z, rot, n] of el.shoes ?? []) shoes(bag, x, y + 0.15, z, rot, n, rand);
  for (const [x, z, nx, nz, kind] of el.walls ?? []) {
    if (kind === 'staff') staffs(bag, x, y + 0.15, z, nx, nz, rand);
    else if (kind === 'bundle') { bundle(bag, x + nx * 0.5, y + 0.15, z + nz * 0.5, rand); bundle(bag, x + nx * 0.5 - nz * 0.7, y + 0.15, z + nz * 0.5 + nx * 0.7, rand); }
    else if (kind === 'jar') { pots(bag, col, x + nx * 0.5, z + nz * 0.5, rand); }
    else if (kind === 'bench') {
      const ux = -nz, uz = nx, L = 1.6 + rand() * 1.2, a = [x + nx * 0.35 - ux * L / 2, z + nz * 0.35 - uz * L / 2], b = [x + nx * 0.35 + ux * L / 2, z + nz * 0.35 + uz * L / 2];
      bag.add('tuff_red', orientedBox(a, b, 0.55, y + 0.1, y + 0.5)); col.segment(a, b, 0.55, y + 0.15, y + 0.5);
      bag.add('tuff_hewn', orientedBox(a, b, 0.57, y + 0.46, y + 0.52));
    }
  }
}
/** cloth_pile: washed shawls spread flat on the stones to dry { at, y }. */
export function clothPile(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, r = rng(Math.round(x * 13 + z * 7));
  for (let k = 0; k < 3; k++) { const a = r() * 3, c = [x + (r() - 0.5) * 1.2, z + (r() - 0.5) * 0.6]; bag.add(k === 1 ? 'cloth_ochre' : 'cloth_white', orientedBox([c[0] - Math.cos(a) * 0.6, c[1] - Math.sin(a) * 0.6], [c[0] + Math.cos(a) * 0.6, c[1] + Math.sin(a) * 0.6], 0.8, y + 0.02 + k * 0.012, y + 0.035 + k * 0.012)); }
}
/** lamp: a clay-and-brass lamp hung on a cord { at [x, z], y (the ceiling), drop } with a flame and a little warm light. */
export function lampEl(el, { bag, lights }) {
  const [x, z] = el.at, y = el.y - el.drop, t = [];
  rod(t, [x, el.y, z], [x, y + 0.08, z], 0.01, 3); bag.add('rope_fibre', fromTriangles(t));
  bag.add('bronze', lathe([[0.001, 0], [0.11, 0.02], [0.16, 0.09], [0.12, 0.1], [0.001, 0.07]], 8, null, x, y, z));
  bag.add('flame', lathe([[0.001, 0.07], [0.03, 0.07], [0.016, 0.17], [0.001, 0.21]], 6, null, x, y, z));
  if (lights) lights.push({ at: [x, y + 0.25, z], color: '#ffb468', intensity: 2.6, distance: 11 });
}
