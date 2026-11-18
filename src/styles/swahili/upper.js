// The upper floor of the stone houses (docs/settlements/kilwa.md §21): a masonry stair in the front room
// climbing to the room above it, the opening in the floor guarded by a rail, a gallery (loggia) over
// the court, a door onto the flat roof over the back rooms, and the rooms furnished by their house's
// use — sleeping, storing or working. Built into the house's own bag, in the house's own materials.
// Every coordinate is the house's own (the street on the north); the house mirrors it when turned.

import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { rooms, face, SMOOTH, DRESSED } from './kit.js';

const CL = ['cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_red', 'cloth_green', 'cloth_maroon'];
const GL = ['glaze_green', 'glaze_blue', 'glaze_white'];
/** A number in [0, 1) from a place (never a counter or a shared generator: a repeated piece differs by where it stands). */
export const hp = (x, z, k = 0) => { const s = Math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453; return s - Math.floor(s); };
const pick = (a, x, z, k = 0) => a[Math.floor(hp(x, z, k) * a.length)];

/** How a house is used above: by its trade (or the shop's goods). */
export function useOf(trade, duka) {
  if (duka) return 'store';
  if (['carpenter', 'potter', 'rope', 'fisher', 'copra', 'cloth'].includes(trade)) return 'work';
  return 'sleep';
}

/**
 * The stair, the opening, the gallery and the doors of a house's upper floor, from the house's own measures.
 * o: { x0, x1, zf (the front room's inner north face), zb (its inner south face), T, fl, hs, fdc (the front door's middle),
 *      doorX (the street door's), thatch, trade, duka }
 */
export function upPlan(o) {
  const { x0, x1, zf, zb, T, fl, hs, fdc, doorX, thatch } = o;
  const sg = fdc > (x0 + x1) / 2 ? 1 : -1;               // the stair rises toward this end of the house, the side of the front door
  const N = 13, tread = 0.25, yR = fl + hs + 0.3, rise = (yR - fl) / N, run = (N - 1) * tread;
  const xe = sg > 0 ? x1 - T : x0 + T, xtop = xe - sg * 0.95, xs = xtop - sg * run, xh = xs + sg * 0.65;
  const hole = [Math.min(xh, xtop), zb - 1.0, Math.max(xh, xtop), zb];
  // the upper room's part away from the stair: [end wall … the opening's rail]
  const endX = sg > 0 ? x0 + T : x1 - T, rEdge = xh - sg * 0.1, rc = (endX + rEdge) / 2, Lr = Math.abs(rEdge - endX);
  // the gallery over the court: its door, its posts clear of the court's two doors
  let lc = null, half = 1.4;
  for (const h of [1.4, 1.0]) {
    for (let k = 0; k < 14 && lc === null; k++) {
      const c = rc + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.3;
      if (Math.abs(c - endX) < h + 0.5 || Math.abs(c - rEdge) < 0.7) continue;
      if (Math.abs(c - doorX) < h + 0.95 || false) continue;
      if (c - h - 0.05 < x0 + T || c + h + 0.05 > x1 - T) continue;
      lc = c; half = h;
    }
    if (lc !== null) break;
  }
  const tc = thatch ? null : rc;                                // the door to the roof over the back rooms
  return { sg, N, tread, rise, run, yR, xe, xtop, xs, xh, hole, endX, rEdge, rc, Lr, lc, half, tc, zf, zb, T, fl };
}

/** The notches the ground floor's walls are cut with where the upper floor's doors stand on them (their parapet). */
export function notches(P) {
  const top = P.yR + 0.52, mk = (c) => ({ u0: c - 0.5, u1: c + 0.5, v0: P.yR, v1: top });
  return { n: P.lc === null ? [] : [mk(P.lc)], s: P.tc === null ? [] : [mk(P.tc)] };
}

/** A box without its top face (a rail's: one cannot stand on it). */
const railBox = (bag, mat, x0, y0, z0, x1, y1, z1) => bag.add(mat, frustum([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)], y0, y1, 0, 0, 0, 0, { noTop: true }));
const bx = (bag, mat, x0, y0, z0, x1, y1, z1) => bag.add(mat, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
const obst = (col, x0, z0, x1, z1, y0, y1) => col.rect([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)], y0, y1);
/** A jar (profile scaled to the height h), at (x, y, z). */
const jar = (bag, mat, x, y, z, h = 0.5, r = 0.2) => bag.add(mat, lathe([[0.001, 0], [r * 0.6, 0.01], [r, h * 0.35], [r * 0.95, h * 0.6], [r * 0.45, h * 0.9], [r * 0.5, h], [0.001, h]], 8, null, x, y, z));
/** A rail along x (a to b at z) or along z (a to b at x), from y to y + 0.95: balusters, a top beam and a low beam (no top faces), and an obstacle. */
function rail(ctx, axis, c, a, b, y, th = 0.1) {
  const { bag, col } = ctx, lo = Math.min(a, b), hi = Math.max(a, b), n = Math.max(2, Math.round((hi - lo) / 0.17));
  for (let i = 0; i <= n; i++) {
    const u = lo + 0.03 + (hi - lo - 0.06) * i / n;
    if (axis === 'x') railBox(bag, 'wood_dark', u - 0.018, y, c - 0.018, u + 0.018, y + 0.93, c + 0.018); else railBox(bag, 'wood_dark', c - 0.018, y, u - 0.018, c + 0.018, y + 0.93, u + 0.018);
  }
  for (const [h0, h1, w] of [[0.88, 0.95, 0.05], [0.12, 0.17, 0.03]]) {
    if (axis === 'x') railBox(bag, 'wood_dark', lo, y + h0, c - w, hi, y + h1, c + w); else railBox(bag, 'wood_dark', c - w, y + h0, lo, c + w, y + h1, hi);
  }
  if (axis === 'x') obst(col, lo, c - th / 2, hi, c + th / 2, y, y + 0.95); else obst(col, c - th / 2, lo, c + th / 2, hi, y, y + 0.95);
}

/**
 * The masonry stair of the front room along its south wall: its steps of plastered coral rubble with a
 * timber nosing each, the guard wall on its open side rising with it; the ramp and the obstacles that
 * make it a stair to walk (the walker's body is a circle, the steps are a slope under it).
 */
export function stair(ctx, P, seed) {
  const { bag, col } = ctx, { sg, N, tread, rise, xs, xtop, fl, yR, zb } = P, za = zb - 1.0, zN = zb - 1.1, T = [];
  for (let k = 1; k < N; k++) {
    const a = xs + sg * (k - 1) * tread, b = a + sg * tread, y1 = fl + k * rise, y0 = fl + (k - 1) * rise;
    face(T, [0, 1, 0], [a, y1, za], [b, y1, za], [b, y1, zb], [a, y1, zb]);
    face(T, [-sg, 0, 0], [a, y0 - (k === 1 ? 0.02 : 0), za], [a, y0 - (k === 1 ? 0.02 : 0), zb], [a, y1, zb], [a, y1, za]);
    // a timber nosing on each tread's edge, its length (the stair's width) differing by where the house stands
    const w = 0.04 + 0.008 * hp(seed, k);
    railBox(bag, 'wood_dark', Math.min(a, a - sg * w), y1 - 0.045, za, Math.max(a, a - sg * w), y1 + 0.012, zb);
    col.rect([Math.min(a, b), za, Math.max(a, b), zb], fl, fl + (k - 1) * rise + 0.115);
  }
  face(T, [sg, 0, 0], [xtop, fl - 0.02, za], [xtop, fl - 0.02, zb], [xtop, fl + (N - 1) * rise, zb], [xtop, fl + (N - 1) * rise, za]);
  bag.add(SMOOTH, fromTriangles(T));
  // the guard wall: its top the stair's slope and 0.9 m, no higher than the floor above
  const S = [], L = (x) => Math.min(yR, fl + rise / 2 + Math.abs(x - xs) * rise / tread + 0.9);
  const m = 12;
  face(S, [-sg, 0, 0], [xs, fl - 0.02, zN], [xs, fl - 0.02, za], [xs, L(xs), za], [xs, L(xs), zN]);
  for (let k = 0; k < m; k++) {
    const a = xs + sg * run(P) * k / m, b = xs + sg * run(P) * (k + 1) / m;
    face(S, [0, 0, -1], [a, fl - 0.02, zN], [b, fl - 0.02, zN], [b, L(b), zN], [a, L(a), zN]);
    face(S, [0, 1, 0], [a, L(a), zN], [b, L(b), zN], [b, L(b), za], [a, L(a), za]);
  }
  bag.add(SMOOTH, fromTriangles(S));
  col.rect([Math.min(xs, xtop), zN, Math.max(xs, xtop), za], fl, yR);
  // the ramp: 1.1 m wide along the south wall, its ends half a rise off the floor and off the floor above
  col.ramp([Math.min(xs, xtop), zb - 1.1, Math.max(xs, xtop), zb], fl + rise / 2, yR - rise / 2, sg > 0 ? 'e' : 'w');
}
const run = (P) => P.run;

/** The rail round the opening on the upper floor (north edge on the guard wall, the end toward the room). */
function openingRail(ctx, P) {
  const { sg, xh, xtop, yR, zb } = P;
  rail(ctx, 'x', zb - 1.05, xh, xtop, yR, 0.1);
  rail(ctx, 'z', xh - sg * 0.06, zb - 1.1, zb, yR, 0.08);
}

/** The gallery over the court: boards on poles built into the wall, two struts under it, a rail round three sides. */
function gallery(ctx, P, o) {
  const { bag, col } = ctx, { lc, half, yR, zf, T } = P, z1 = zf - T, z0 = z1 - 1.15, x0 = lc - half, x1 = lc + half;
  bx(bag, 'timber', x0, yR - 0.1, z0, x1, yR, z1);
  col.floor([x0, z0, x1, z1], yR);
  // the joists, built into the wall and standing out under the boards, and the beam across their ends on two posts
  const n = Math.max(3, Math.round((x1 - x0) / 0.45));
  for (let i = 0; i <= n; i++) { const u = x0 + 0.08 + (x1 - x0 - 0.16) * i / n; bx(bag, 'wood_dark', u - 0.05, yR - 0.24, z0 - 0.06, u + 0.05, yR - 0.1, z1); }
  bx(bag, 'wood_dark', x0 - 0.05, yR - 0.36, z0 - 0.07, x1 + 0.05, yR - 0.24, z0 + 0.05);
  // the weight carried by two diagonal struts from the wall below (no post in the court: the court is walked)
  for (const px of [x0 + 0.12, x1 - 0.12]) { const Q = []; beamTris(Q, [px, yR - 1.25, z1 - 0.02], [px, yR - 0.36, z0 + 0.08], 0.06, 0.055); bag.add('wood_dark', fromTriangles(Q)); }
  rail(ctx, 'x', z0 + 0.04, x0, x1, yR, 0.08);
  rail(ctx, 'z', x0 + 0.04, z0, z1, yR, 0.08);
  rail(ctx, 'z', x1 - 0.04, z0, z1, yR, 0.08);
}

/** The upper floor: walls and roof over the front room, windows with open reveals, the doors, the stair's rail and the gallery, the rooms furnished. */
export function upper(ctx, P, o) {
  const { bag, col } = ctx, { zf, zb, T, yR, sg, endX, rEdge, rc, Lr, lc, tc } = P, { mat, x0, x1 } = o;
  const yU = yR, fu = yU + 0.01;
  const wins = [];
  for (let x = x0 + 1.1; x < x1 - 0.9; x += 2.1) {
    if (lc !== null && Math.abs(x - lc) < 1.1) continue;
    if (Math.abs(x - endX) < 0.7) continue;
    wins.push({ u0: x - 0.35, u1: x + 0.35, v0: yU + 0.95, v1: yU + 1.85, frame: 'door' });
  }
  const nHoles = [...wins, ...(lc !== null ? [{ u0: lc - 0.5, u1: lc + 0.5, v0: yU, v1: yU + 2.1, frame: 'door' }] : [])];
  const sHoles = tc !== null ? [{ u0: tc - 0.5, u1: tc + 0.5, v0: yU, v1: yU + 2.1, frame: 'door' }] : [];
  rooms(ctx, { mat, rect: [x0, zf - T, x1, zb + T], along: 'x', n: 1, fl: fu, yB: yU, hs: 2.6, roof: 'poles', t: T, door: null, floor: null, holes: { n: nHoles, s: sHoles }, parapet: 0.5 });
  // the open windows: a plank shutter folded back against the wall beside each, on the court's side
  for (const w of wins) {
    const s = hp(w.u0, zf) < 0.5 ? -1 : 1, a = s < 0 ? w.u0 - 0.3 : w.u1;
    bx(bag, 'wood_dark', a, w.v0, zf - T - 0.06, a + 0.3, w.v1, zf - T - 0.025);
    bx(bag, 'wood_dark', w.u0 - 0.02, w.v0 - 0.06, zf - T - 0.1, w.u1 + 0.02, w.v0 - 0.02, zf - T);
  }
  stair(ctx, P, o.seed);
  openingRail(ctx, P);
  if (lc !== null) gallery(ctx, P, o);
  furnish(ctx, P, o, fu);
  if (tc !== null) terrace(ctx, P, o, yU);
  void Lr; void rEdge; void rc; void col; void bag;
}

/** The room above, by its use. */
function furnish(ctx, P, o, fu) {
  const { bag, col } = ctx, { sg, endX, rEdge, rc, zf, zb, lc, tc } = P, { trade, duka, seed } = o, use = useOf(trade, duka);
  const at = (a) => endX + sg * a;                       // a point a metres from the end wall
  const Lr = Math.abs(rEdge - endX), zN = zf + 0.04, zS = zb - 0.04;
  const gate = [lc, tc].filter((v) => v !== null);       // the doors' x: kept clear
  const clear = (x, w) => gate.every((g) => Math.abs(x - g) > 0.75 + w / 2);
  // a floor mat across the middle, its length by the house
  bag.add('reed_mat', box(Math.min(at(0.9), at(Lr - 0.5)), fu + 0.015, zf + 0.5, Math.max(at(0.9), at(Lr - 0.5)), fu + 0.03, zb - 0.5));
  // the lamp hung from the roof poles
  { const lx = rc + (hp(seed, 3) - 0.5) * 0.6, lz = (zf + zb) / 2, top = fu + 2.5;
    bag.add('rope_fibre', box(lx - 0.006, fu + 2.15, lz - 0.006, lx + 0.006, top, lz + 0.006));
    bag.add('bronze', lathe([[0.001, 0], [0.06, 0.02], [0.1, 0.07], [0.12, 0.09], [0.001, 0.09]], 10, null, lx, fu + 2.06, lz));
    bag.add('flame', lathe([[0.001, 0.07], [0.03, 0.08], [0.02, 0.15], [0.001, 0.18]], 6, null, lx, fu + 2.06, lz)); }
  // the end wall's piece: the sleeping platform (kitanda), or a bench, by use
  const e0 = Math.min(endX, at(1.35)), e1 = Math.max(endX, at(1.35));
  if (use === 'sleep') {
    bx(bag, 'lime_plaster', e0, fu - 0.01, zf + 0.1, e1, fu + 0.42, zb - 0.1); col.rect([e0, zf + 0.1, e1, zb - 0.1], fu, fu + 0.42);
    bx(bag, 'reed_mat', e0 + 0.03, fu + 0.4, zf + 0.13, e1 - 0.03, fu + 0.435, zb - 0.13);
    bx(bag, pick(CL, seed, 1), e0 + 0.06, fu + 0.43, zf + 0.2, e1 - 0.06, fu + 0.5, zf + 0.2 + (zb - zf) * 0.5);
    bx(bag, 'cloth_white', e0 + 0.08, fu + 0.49, zb - 0.55, e0 + 0.4 + 0.25 * hp(seed, 2), fu + 0.6, zb - 0.2);
    // the chests (sanduku) against the wall beside, and the water jar
    const cx = at(1.9 + 0.3 * hp(seed, 4));
    if (clear(cx, 1)) { bx(bag, 'wood_dark', cx - 0.45, fu, zS - 0.5, cx + 0.45, fu + 0.52, zS); col.rect([cx - 0.45, zS - 0.5, cx + 0.45, zS], fu, fu + 0.52); for (const d of [-0.3, 0.3]) bx(bag, 'iron', cx + d - 0.02, fu, zS - 0.505, cx + d + 0.02, fu + 0.52, zS); }
    jar(bag, 'terracotta', at(0.4), fu, zS - 0.18 - 0.0, 0.6, 0.2);
    // clothes hung on a line along the south wall: lengths of cloth on pegs
    const a = at(2.7), b = at(Lr - 0.4);
    if (Math.abs(b - a) > 1.2) for (let k = 0, x = Math.min(a, b) + 0.1; x < Math.max(a, b) - 0.3; x += 0.38, k++) { if (!clear(x, 0.3)) continue; bx(bag, pick(CL, x, zb, 5), x, fu + 0.9 + 0.08 * (k % 3), zS - 0.03, x + 0.28, fu + 1.85, zS - 0.012); }
  } else if (use === 'store') {
    // goods of the house's trade in stacks along the south wall and under the windows
    for (let a = 0.35, k = 0; a < Lr - 0.5; a += 0.6 + 0.15 * hp(seed, k), k++) {
      const x = at(a);
      if (!clear(x, 0.6)) continue;
      const h = hp(x, zS, 7);
      if (trade === 'jars' || trade === 'potter') { for (let j = 0; j < 2; j++) jar(bag, j ? pick(GL, x, zb) : 'pottery_dark', x, fu + j * 0.0, zS - 0.22 - j * 0.42, 0.55 + 0.15 * h, 0.17 + 0.04 * hp(x, zb, 9)); col.circle(x, zS - 0.3, 0.3, fu, fu + 0.6); }
      else if (trade === 'ivory') { const Q = []; beamTris(Q, [x, fu, zS - 0.45], [x + 0.06, fu + 1.5 + 0.3 * h, zS - 0.05], 0.035, 0.085); bag.add('ivory', fromTriangles(Q)); col.circle(x, zS - 0.25, 0.2, fu, fu + 1.5); }
      else if (trade === 'cloth' || trade === 'beads' || trade === 'spice') { for (let j = 0; j < 2 + (h > 0.5 ? 1 : 0); j++) bx(bag, j % 2 ? pick(CL, x, zb, 11 + j) : 'sacking', x - 0.28, fu + j * 0.3, zS - 0.6 + 0.04 * j, x + 0.28 + 0.06 * h, fu + (j + 1) * 0.3, zS - 0.04); col.rect([x - 0.28, zS - 0.6, x + 0.34, zS], fu, fu + 0.9); }
      else { for (let j = 0; j < 2; j++) bx(bag, j ? 'wicker' : 'sacking', x - 0.26 - 0.04 * h, fu + j * 0.42, zS - 0.5, x + 0.26, fu + j * 0.42 + 0.42, zS - 0.04); col.rect([x - 0.3, zS - 0.5, x + 0.26, zS], fu, fu + 0.84); }
    }
    // the merchant's chest, with his scales on it, under the north windows
    const cx = at(1.0);
    bx(bag, 'wood_dark', cx - 0.5, fu, zN, cx + 0.5, fu + 0.55, zN + 0.55); col.rect([cx - 0.5, zN, cx + 0.5, zN + 0.55], fu, fu + 0.55); for (const d of [-0.32, 0.32]) bx(bag, 'iron', cx + d - 0.02, fu, zN + 0.55, cx + d + 0.02, fu + 0.55, zN + 0.555);
    bx(bag, 'bronze', cx - 0.12, fu + 0.55, zN + 0.18, cx + 0.12, fu + 0.59, zN + 0.38);
  } else {
    // a workroom, by its trade
    if (trade === 'carpenter') {
      bx(bag, 'timber', e0, fu + 0.75, zf + 0.2, at(1.5 * sg < 0 ? -1.5 : 1.5), fu + 0.8, zf + 0.85);
      const bx0 = Math.min(at(0.1), at(1.4)), bx1 = Math.max(at(0.1), at(1.4));
      for (const x of [bx0 + 0.1, bx1 - 0.1]) bx(bag, 'wood_dark', x - 0.04, fu, zf + 0.25, x + 0.04, fu + 0.75, zf + 0.8);
      col.rect([bx0, zf + 0.2, bx1, zf + 0.85], fu, fu + 0.8);
      for (let k = 0; k < 5; k++) bx(bag, 'timber', Math.min(endX, at(0.25)), fu + k * 0.07, zb - 0.55 - 0.03 * k, Math.max(endX, at(2.3 + 0.2 * hp(seed, k))), fu + k * 0.07 + 0.06, zb - 0.1 - 0.03 * k);
      col.rect([Math.min(endX, at(0.25)), zb - 0.55, Math.max(endX, at(2.3)), zb - 0.1], fu, fu + 0.4);
      for (let k = 0; k < 4; k++) { const Q = []; beamTris(Q, [at(2.8 + 0.12 * k), fu, zb - 0.12 - 0.05 * (k % 2)], [at(Lr - 0.4 - 0.1 * k), fu + 0.1, zb - 0.1], 0.04, 0.05); bag.add('wood_dark', fromTriangles(Q)); }
    } else if (trade === 'potter') {
      // a plank shelf of pots drying along the end wall and the wheel's stone, a heap of clay
      for (let j = 0; j < 2; j++) bx(bag, 'timber', Math.min(endX, at(0.4)), fu + 0.6 + 0.6 * j, zf + 0.3, Math.max(endX, at(0.4)), fu + 0.64 + 0.6 * j, zb - 0.3);
      for (let j = 0; j < 2; j++) for (let k = 0; k < 4; k++) { const z = zf + 0.5 + k * 0.4; jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', at(0.2), fu + 0.64 + 0.6 * j, z, 0.28 + 0.08 * hp(z, j), 0.1 + 0.03 * hp(j, z)); }
      const wx = at(2.0 + 0.4 * hp(seed, 5)), wz = zb - 0.7;
      bag.add('terracotta', lathe([[0.001, 0], [0.22, 0], [0.3, 0.06], [0.3, 0.12], [0.001, 0.12]], 10, null, wx, fu, wz)); col.circle(wx, wz, 0.3, fu, fu + 0.12);
      bx(bag, 'terracotta', at(Lr - 1.0), fu, zN, at(Lr - 0.3), fu + 0.35, zN + 0.5); col.rect([at(Lr - 1.0), zN, at(Lr - 0.3), zN + 0.5], fu, fu + 0.35);
      for (let k = 0; k < 4; k++) { const x = at(1.3 + 0.55 * k); if (clear(x, 0.4)) jar(bag, pick(GL, x, zb, 2), x, fu, zS - 0.3, 0.4 + 0.1 * hp(x, zb), 0.15); }
    } else if (trade === 'rope') {
      // hanks of coir hung on pegs along the south wall, coils on the floor
      for (let k = 0, x = at(0.4); k < 8; k++, x = at(0.4 + 0.5 * k)) { if (!clear(x, 0.4)) continue; bx(bag, 'wood_dark', x - 0.02, fu + 1.8, zS - 0.1, x + 0.02, fu + 1.84, zS); bx(bag, 'rope_fibre', x - 0.1, fu + 0.8 - 0.1 * hp(x, zb), zS - 0.1 - 0.02 * (k % 2), x + 0.1, fu + 1.82, zS - 0.04); }
      for (let k = 0; k < 3; k++) { const x = at(0.5 + 0.8 * k), z = zN + 0.4; bag.add('rope_fibre', lathe([[0.1, 0], [0.3 + 0.03 * hp(x, z), 0.02], [0.3, 0.14], [0.1, 0.16], [0.1, 0]], 9, null, x, fu, z)); col.circle(x, z, 0.3, fu, fu + 0.16); }
    } else if (trade === 'fisher') {
      // a net heaped and a net hung to mend, floats of palm, baskets, oars standing in the corner
      bx(bag, 'rope_fibre', Math.min(endX, at(1.2)), fu, zf + 0.3, Math.max(endX, at(1.2)), fu + 0.3 + 0.1 * hp(seed, 1), zf + 1.2); col.rect([Math.min(endX, at(1.2)), zf + 0.3, Math.max(endX, at(1.2)), zf + 1.2], fu, fu + 0.35);
      for (let k = 0, x = at(1.9); k < 4; k++, x = at(1.9 + 0.7 * k)) { if (!clear(x, 0.5)) continue; bx(bag, 'rope_fibre', x - 0.3, fu + 0.7, zS - 0.06, x + 0.3, fu + 1.9, zS - 0.045); bx(bag, 'wood_dark', x - 0.3, fu + 1.88, zS - 0.1, x + 0.3, fu + 1.93, zS); }
      for (let k = 0; k < 6; k++) bag.add('palm_trunk', lathe([[0.001, 0], [0.09, 0.03], [0.11, 0.1], [0.08, 0.17], [0.001, 0.2]], 6, null, at(0.3 + 0.12 * (k % 3)), fu + 0.3 + 0.001, zf + 0.5 + 0.2 * k * 0.5 + 0.1 * hp(k, seed)));
      for (let k = 0; k < 3; k++) { const Q = []; beamTris(Q, [at(Lr - 0.3 - 0.1 * k), fu, zb - 0.2 - 0.12 * k], [at(Lr - 0.18 - 0.1 * k), fu + 1.9, zb - 0.1], 0.03, 0.04); bag.add('timber', fromTriangles(Q)); }
      for (let k = 0; k < 2; k++) { const x = at(2.6 + 1.1 * k); if (clear(x, 0.6) && 2.6 + 1.1 * k < Lr - 1.5) { bx(bag, 'wicker', x - 0.25, fu, zN, x + 0.25, fu + 0.4, zN + 0.4); col.rect([x - 0.25, zN, x + 0.25, zN + 0.4], fu, fu + 0.4); } }
    } else if (trade === 'copra') {
      // sacks and a heap of split coconut, a scraping stool
      for (let k = 0; k < 6; k++) { const x = at(0.4 + 0.45 * (k % 3)), z = zS - 0.3 - 0.4 * Math.floor(k / 3); bx(bag, 'sacking', x - 0.2, fu, z - 0.18, x + 0.2 + 0.05 * hp(x, z), fu + 0.5 + 0.1 * hp(z, x), z + 0.18); }
      col.rect([Math.min(endX, at(1.5)), zS - 0.9, Math.max(endX, at(1.5)), zS], fu, fu + 0.55);
      for (let k = 0; k < 16; k++) { const x = at(2.3 + 0.18 * (k % 5)) + (hp(k, seed) - 0.5) * 0.05, z = zN + 0.25 + 0.16 * Math.floor(k / 5); bag.add('palm_trunk', lathe([[0.001, 0], [0.08, 0.05], [0.1, 0.1], [0.07, 0.18], [0.001, 0.2]], 6, null, x, fu + (k % 2) * 0.1, z)); }
      bx(bag, 'wood_dark', at(Lr - 0.9), fu, zb - 0.7, at(Lr - 0.5), fu + 0.35, zb - 0.3); col.rect([at(Lr - 0.9), zb - 0.7, at(Lr - 0.5), zb - 0.3], fu, fu + 0.35);
    } else {
      // a cloth weaver's loom: two posts, beams, the warp, a bolt on a shelf
      const lx = at(0.5), z0l = zf + 0.5, z1l = zb - 0.5;
      for (const z of [z0l, z1l]) bx(bag, 'wood_dark', lx - 0.04, fu, z - 0.04, lx + 0.04, fu + 1.7, z + 0.04);
      bx(bag, 'wood_dark', lx - 0.05, fu + 1.65, z0l, lx + 0.05, fu + 1.72, z1l); bx(bag, 'wood_dark', lx - 0.05, fu + 0.5, z0l, lx + 0.05, fu + 0.56, z1l);
      for (let z = z0l + 0.08; z < z1l - 0.04; z += 0.07) bx(bag, 'cloth_white', lx - 0.006, fu + 0.56, z, lx + 0.006, fu + 1.65, z + 0.012);
      bx(bag, pick(CL, seed, 6), lx - 0.012, fu + 0.56, z0l + 0.08, lx + 0.012, fu + 0.95, z1l - 0.08);
      col.rect([lx - 0.08, z0l - 0.05, lx + 0.08, z1l + 0.05], fu, fu + 1.7);
      for (let k = 0; k < 4; k++) { const x = at(1.6 + 0.7 * k); if (clear(x, 0.6)) { bx(bag, pick(CL, x, zb, 8), x - 0.25, fu, zS - 0.45, x + 0.25, fu + 0.34, zS - 0.05); col.rect([x - 0.25, zS - 0.45, x + 0.25, zS], fu, fu + 0.34); } }
    }
  }
}

/** The flat roof over the back rooms, reached by the door of the upper room: what the household keeps there. */
function terrace(ctx, P, o, yU) {
  const { bag, col } = ctx, { tc, zb, T, sg } = P, { x0, x1, z1, seed } = o;
  const zA = zb + T + 0.35, zS = z1 - T - 0.04, xa = x0 + T + 0.4, xb = x1 - 2.1 - 0.7;
  // jars along the south parapet, a mat laid out to dry, a line with cloth on two posts, the doorway kept clear
  for (let k = 0, x = xa + 0.1; x < xb - 0.2; k++, x += 0.9 + 0.5 * hp(seed, k + 20)) {
    if (Math.abs(x - tc) < 0.9) continue;
    const m = hp(x, z1, 3);
    if (m < 0.55) { jar(bag, m < 0.3 ? 'terracotta' : 'pottery_dark', x, yU, zS - 0.2, 0.5 + 0.2 * m, 0.17 + 0.05 * m); col.circle(x, zS - 0.2, 0.22, yU, yU + 0.6); }
    else if (m < 0.8) bx(bag, 'reed_mat', x - 0.4, yU + 0.015, zS - 1.0 + 0.2 * hp(z1, x), x + 0.4 + 0.2 * m, yU + 0.03, zS - 0.1);
  }
  if (hp(seed, 31) < 0.7) {
    const sx = tc + sg * (1.9 + 0.2 * hp(seed, 32)), a = sx - 0.9, b = sx + 0.9;
    if (Math.min(a, b) > x0 + T + 0.2 && Math.max(a, b) < x1 - 2.1 - 0.4) {
      for (const x of [a, b]) { bx(bag, 'wood_dark', x - 0.035, yU, zA + 0.2, x + 0.035, yU + 1.7, zA + 0.28); col.circle(x, zA + 0.24, 0.05, yU, yU + 1.7); }
      bx(bag, 'rope_fibre', a, yU + 1.62, zA + 0.22, b, yU + 1.65, zA + 0.26);
      for (let x = a + 0.15, k = 0; x < b - 0.2; x += 0.3, k++) bx(bag, pick(CL, x, zA, 4), x, yU + 0.8 + 0.1 * (k % 2), zA + 0.235, x + 0.24, yU + 1.62, zA + 0.245);
    }
  }
}

/** The facts the walk routes and the settlement's layout need: where the doors and the stair stand (the house's own coordinates). */
export function routeOf(P, o) {
  const { sg, xs, xtop, xh, zf, zb, T, lc, tc, rc, yR } = P;
  const A = [[o.doorX, o.z0 - 1.8], [o.doorX, o.z0 + T + 0.7], [o.fdc, zf - T - 0.45], [o.fdc, zf + 0.9], [xs + sg * 0.2, zb - 0.55], [xtop - sg * 0.35, zb - 0.55], [xtop + sg * 0.5, zb - 1.5], [xh - sg * 0.5, zb - 1.5], [rc, (zf + zb) / 2]];
  if (lc !== null) A.push([lc, zf + 0.6], [lc, zf - T - 0.6]);
  const B = tc === null ? null : [[rc, (zf + zb) / 2], [tc, zb - 0.6], [tc, zb + T / 2], [tc, zb + T + 0.9]];
  return { A, B, yU: yR };
}
