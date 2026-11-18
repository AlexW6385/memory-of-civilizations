// The upper floors of the Newar house (docs/settlements/bhaktapur.md §16): the floors above the shop or store (chheli), each reached by a steep
// ladder-stair through a trap: the sleeping rooms (mātan), the living floor with the long carved window and its seat onto the street (chvata),
// and the kitchen and shrine under the roof (baiga). Pieces are placed in the house's own frame (x along the facade, z into the house)
// through the builder's closures `k` (house.js). Treads, rungs, rails and stringers are vertical sheets, and everything one may step on is
// at most 0.45 m high: the walker's engine reads every upward face as a roof or a step (see the dossier).

import { lathe, fromTriangles } from '../../core/geom.js';
import { pot } from './pottery.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const hash = (a, b = 0) => (Math.imul((a >>> 0) ^ 0x9e3779b9, 2654435761) ^ Math.imul(b + 17, 40503)) >>> 0;

/** The rectangle r with the rectangles `holes` taken out, as a list of rectangles [x0, z0, x1, z1]. */
export function without(r, holes) {
  let out = [r];
  for (const h of holes) {
    const next = [];
    for (const q of out) {
      if (h[0] >= q[2] || h[2] <= q[0] || h[1] >= q[3] || h[3] <= q[1]) { next.push(q); continue; }
      if (h[1] > q[1]) next.push([q[0], q[1], q[2], h[1]]);
      if (h[3] < q[3]) next.push([q[0], h[3], q[2], q[3]]);
      const z0 = Math.max(q[1], h[1]), z1 = Math.min(q[3], h[3]);
      if (h[0] > q[0]) next.push([q[0], z0, h[0], z1]);
      if (h[2] < q[2]) next.push([h[2], z0, q[2], z1]);
    }
    out = next;
  }
  return out.filter((q) => q[2] - q[0] > 0.02 && q[3] - q[1] > 0.02);
}

/** The floors of a house of n storeys: the roles by floor index. */
export const roles = (n) => (n >= 4 ? [null, 'matan', 'chvata', 'baiga'] : [null, 'chvata', 'baiga']);

/**
 * Build the upper floors. k: { bag, col, lights, B, RC, toW, dirUp, W, D, T, Y, n, H, seed, trade, ic (the chvata floor), wins (per floor: [x0, x1, y0, y1] of the
 * windows cut through the front wall), seat: { x0, x1 } (the long window's seat), door: { x0, x1 } | null (the balcony door), ladders (out: the walk routes' points) }.
 */
export function upperFloors(k) {
  const { bag, col, B, RC, toW, W, D, T, Y, n, H, seed, trade } = k;
  const R = roles(n), top = n - 1, sx0 = W - T - 3.4, sx1 = W - T - 2.5, dirUp = k.dirUp;
  const hv = (i, j = 0) => hash(seed, i * 31 + j);
  const wrect = (a, b, c, d) => { const p = toW(a, b), q = toW(c, d); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const tri = [];
  /** A double-sided vertical sheet from frame point (a, b) to (c, d), from y0 to y1 (y2, y3 at the second end when it slopes). */
  const sheet = (a, b, c, d, y0, y1, y2 = y0, y3 = y1) => {
    const p = toW(a, b), q = toW(c, d);
    tri.push(p[0], y0, p[1], q[0], y2, q[1], q[0], y3, q[1], p[0], y0, p[1], q[0], y3, q[1], p[0], y1, p[1]);
    tri.push(p[0], y0, p[1], q[0], y3, q[1], q[0], y2, q[1], p[0], y0, p[1], p[0], y1, p[1], q[0], y3, q[1]);
  };
  const flush = (mat) => { if (tri.length) { bag.add(mat, fromTriangles(tri.splice(0))); } };

  // ── the circulation: the ground flight (house.js) comes up in the well [sx0, T]–[sx1, 4.5]; each further flight is a steep ladder-stair ──
  const flights = [{ fl: 1, u0: sx0, u1: sx1, d0: 4.9, d1: 6.6 }];                // from floor 1 to floor 2
  if (n >= 4) flights.push({ fl: 2, u0: T + 0.2, u1: T + 1.1, d0: 1.5, d1: 3.2, wall: 'left' });   // from floor 2 to floor 3, along the left wall at the front
  const NR = 12;
  const holes = {};
  for (const f of flights) {
    const up = f.fl + 1, y0 = Y[f.fl], y1 = Y[up], rise = (y1 - y0) / NR, tr = (f.d1 - f.d0) / NR;
    const rect = [f.u0 - 0.2, f.d0 - 0.04, f.u1 + 0.2, f.d1 - tr];
    // the ramp under the walker, from the floor to a rise under the last rung (the slab beyond is the landing)
    col.ramp(wrect(rect[0], rect[1], rect[2], rect[3]), y0, y1 - rise, dirUp);
    for (let j = 0; j < NR; j++) { const d = f.d0 + (j + 0.5) * tr, yy = y0 + (j + 1) * rise; sheet(f.u0, d, f.u1, d, yy - 0.08, yy); }
    flush('wood_ochre');
    for (const u of [f.u0, f.u1]) sheet(u, f.d0, u, f.d1, y0, y0 + 0.3, y1 - 0.02, y1 + 0.28);   // the two stringers
    sheet(f.u1, f.d0 + 0.1, f.u1, f.d1 - 0.1, y0 + 0.95, y0 + 1.02, y1 + 0.75, y1 + 0.82);       // the hand-rail
    flush('wood_dark');
    // the opening in the floor above: 0.5 m clear of the ramp's rectangle on the open sides, with a rail round it and the trap raised
    const h = [Math.max(T, f.u0 - 0.7), f.d0 - 0.3, Math.min(W - T, f.u1 + 0.7), f.d1 - tr];
    if (f.wall === 'left') h[0] = T;
    holes[up] = h;
    const ry = y1;
    for (const [a, b, c, d] of [[h[0], h[1], h[0], h[3]], [h[2], h[1], h[2], h[3]], [h[0], h[1], h[2], h[1]]]) {
      if (f.wall === 'left' && a === T && c === T) continue;
      for (const [s0, s1] of [[0.30, 0.38], [0.60, 0.68], [0.90, 0.98]]) sheet(a, b, c, d, ry + s0, ry + s1);
      for (const t of [0, 1]) { const px = a + (c - a) * t, pz = b + (d - b) * t; sheet(px - 0.03, pz, px + 0.03, pz, ry, ry + 1.0); sheet(px, pz - 0.03, px, pz + 0.03, ry, ry + 1.0); }
      const r = wrect(Math.min(a, c) - 0.04, Math.min(b, d) - 0.04, Math.max(a, c) + 0.04, Math.max(b, d) + 0.04);
      col.rect(r, ry, ry + 1.0);
    }
    flush('wood_dark');
    // the trap, a board hinged at the front edge and stood up against its rail
    B(h[0] + 0.15, ry, h[1] - 0.02, h[2] - 0.15, ry + 0.9, h[1] + 0.05, 'wood_ochre'); B(h[0] + 0.25, ry, h[1] + 0.05, h[0] + 0.33, ry + 0.9, h[1] + 0.09, 'wood_dark');
    f.hole = h;
  }
  // the ground flight's well on the first floor: a rail along its two sides (on the slab, a hand clear of the ramp)
  holes[1] = [sx0, T, sx1, 4.5];
  for (const x of [sx0 - 0.12, sx1 + 0.12]) {
    for (const [s0, s1] of [[0.35, 0.43], [0.68, 0.76], [0.98, 1.05]]) sheet(x, T + 0.4, x, 4.5, Y[1] + s0, Y[1] + s1);
    for (const z of [T + 0.4, 4.45]) { sheet(x - 0.03, z, x + 0.03, z, Y[1], Y[1] + 1.05); }
    col.rect(wrect(x - 0.03, T + 0.4, x + 0.03, 4.5), Y[1], Y[1] + 1.0);
  }
  flush('wood_dark');

  // ── the floors, their ceilings of joists, and the wall colliders ──
  for (let i = 1; i <= top; i++) {
    const y = Y[i], yc = Y[i + 1], mat = R[i] === 'baiga' ? 'mud_plaster' : 'wood_ochre';
    for (const r of without([T, T, W - T, D - T], holes[i] ? [holes[i]] : [])) { const w = wrect(r[0], r[1], r[2], r[3]); B(r[0], y - 0.32, r[1], r[2], y, r[3], mat); col.floor(w, y); }
    for (let z = T + 0.5; z < D - T - 0.3; z += 0.95) {
      const hh = holes[i];
      const xs = hh && z > hh[1] - 0.15 && z < hh[3] + 0.15 ? [[T, hh[0]], [hh[2], W - T]] : [[T, W - T]];
      for (const [a, b] of xs) if (b - a > 0.2) B(a, y - 0.46, z - 0.07, b, y - 0.32, z + 0.07, 'timber');
    }
    RC(0, y, 0, T, yc, D); RC(W - T, y, 0, W, yc, D); RC(0, y, D - T, W, yc, D);
    // the walls' lower part washed with mud plaster, a hand's breadth proud of the brick (the kitchen's to the ceiling's beams)
    const dh = R[i] === 'baiga' ? yc - y - 0.5 : 1.1;
    B(T, y, T + 0.02, T + 0.03, y + dh, D - T, 'mud_plaster'); B(W - T - 0.03, y, T + 0.02, W - T, y + dh, D - T, 'mud_plaster'); B(T + 0.03, y, D - T - 0.03, W - T - 0.03, y + dh, D - T, 'mud_plaster');
  }
  // the ceiling of the top floor: a plank ceiling on joists under the soffit (the roof stands over it)
  B(T, H - 0.3, T, W - T, H - 0.2, D - T, 'wood_ochre');
  for (let x = T + 0.3; x < W - T; x += 0.9) B(x - 0.07, H - 0.46, T, x + 0.07, H - 0.3, D - T, 'timber');

  // ── the furniture, by role ──
  const URN = {
    jar: [[0.001, 0], [0.22, 0.04], [0.28, 0.26], [0.18, 0.47], [0.14, 0.56], [0.001, 0.55]],
    round: [[0.001, 0], [0.16, 0.05], [0.2, 0.19], [0.1, 0.36], [0.12, 0.42], [0.001, 0.4]],
    cup: [[0.001, 0], [0.09, 0.04], [0.12, 0.13], [0.001, 0.12]],
    bowl: [[0.001, 0], [0.18, 0.05], [0.24, 0.12], [0.001, 0.11]],
  };
  const P = (x, y, z, kind, s, dark) => { const p = toW(x, z); bag.add(dark ? 'pottery_dark' : 'terracotta', lathe(URN[kind].map(([r, h]) => [r * s, h * s]), 6, null, p[0], y, p[1])); };
  const cushion = (x, y, z, w, d, m) => B(x, y, z, x + w, y + 0.07, z + d, m);
  const COLS = ['cloth_red', 'cloth_maroon', 'cloth_ochre', 'cloth_green', 'cloth_black'];
  const bed = (i, x, z, w, l, y, alongX = false, j = 0) => {
    const q = hv(i, j + x * 3 + z * 7);
    B(x, y, z, x + w, y + 0.34, z + l, 'wood_dark');
    B(x + 0.04, y + 0.34, z + 0.04, x + w - 0.04, y + 0.41, z + l - 0.04, 'sacking');
    const quiltTo = alongX ? [x + w * 0.35, z + 0.06, x + w - 0.06, z + l - 0.06] : [x + 0.06, z + l * 0.3, x + w - 0.06, z + l - 0.06];
    B(quiltTo[0], y + 0.41, quiltTo[1], quiltTo[2], y + 0.47, quiltTo[3], COLS[q % 4]);
    if (alongX) B(x + 0.06, y + 0.41, z + 0.08, x + 0.34, y + 0.5, z + l - 0.08, 'cloth_ochre'); else B(x + 0.08, y + 0.41, z + 0.06, x + w - 0.08, y + 0.5, z + 0.34, 'cloth_ochre');
    RC(x, y, z, x + w, y + 0.6, z + l);
  };
  const chest = (x, z, w, d, y, alongZ = true) => {
    B(x, y, z, x + w, y + 0.5, z + d, 'wood_dark'); B(x - 0.02, y + 0.5, z - 0.02, x + w + 0.02, y + 0.55, z + d + 0.02, 'wood_ochre');
    if (alongZ) B(x + w - 0.01, y + 0.2, z + d * 0.4, x + w + 0.02, y + 0.3, z + d * 0.6, 'gilt_bronze'); else B(x + w * 0.4, y + 0.2, z + d - 0.01, x + w * 0.6, y + 0.3, z + d + 0.02, 'gilt_bronze');
    RC(x, y, z, x + w, y + 0.6, z + d);
  };
  const mat = (x, z, w, d, y) => B(x, y, z, x + w, y + 0.025, z + d, 'wicker');
  const shrine = (y, z, side) => {
    // a framed niche in the left (or right) wall: a gilt image, a lamp lit before it
    const xw = side === 'left' ? T : W - T, s = side === 'left' ? 1 : -1;
    const ax = xw - s * 0.01, bx_ = xw + s * 0.12;
    B(Math.min(ax, bx_), y + 1.0, z - 0.45, Math.max(ax, bx_), y + 1.9, z + 0.45, 'wood_painted');
    B(Math.min(xw + s * 0.1, xw + s * 0.13), y + 1.08, z - 0.35, Math.max(xw + s * 0.1, xw + s * 0.13), y + 1.82, z + 0.35, 'wood_dark');
    const p = toW(xw + s * 0.3, z);
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0], [0.08, 0.2], [0.05, 0.3], [0.001, 0.36]], 6, null, p[0], y + 1.1, p[1]));
    B(Math.min(xw, xw + s * 0.4), y + 0.95, z - 0.5, Math.max(xw, xw + s * 0.4), y + 1.0, z + 0.5, 'wood_dark');
  };
  const shelves = (y, x0, x1, zWall, heights, mats, dz = 0.4) => { for (const h of heights) B(x0, y + h, zWall - dz, x1, y + h + 0.05, zWall, 'wood_ochre'); void mats; };
  const partition = (i, y, z) => {
    // a plank partition across the floor with a door a metre and a half wide by the stair; its lintel at 1.85 m
    const g0 = sx0 - 0.1, g1 = sx1 + 0.4, yc = Y[i + 1] - 0.3;
    for (const [a, b] of [[T, g0], [g1, W - T]]) { B(a, y, z, b, yc, z + 0.1, 'wood_painted'); RC(a, y, z, b, yc, z + 0.1); }
    B(g0, y + 1.85, z, g1, yc, z + 0.1, 'wood_painted'); B(g0 - 0.06, y + 1.85, z - 0.03, g1 + 0.06, y + 1.95, z + 0.13, 'wood_dark');
    for (const x of [g0 - 0.06, g1]) B(x, y, z - 0.03, x + 0.06, y + 1.95, z + 0.13, 'wood_dark');
  };
  const backZ = D - T, hasPart = D - T - 7.1 >= 2.0;
  const matanRoom = (i) => {
    const y = Y[i], rr = hv(i);
    // two beds along the side walls in the front, a chest at the foot of each; behind the partition two more, and a clothes pole
    bed(i, T + 0.05, 1.0, 1.0, 1.9, y, false, 1); chest(T + 0.05, 3.05, 0.85, 0.55, y);
    bed(i, W - T - 1.05, 1.0, 1.0, 1.9, y, false, 2); chest(W - T - 0.9, 3.05, 0.85, 0.55, y);
    if (hasPart) {
      partition(i, y, 7.1);
      bed(i, T + 0.1, backZ - 1.05, 1.9, 1.0, y, true, 3); bed(i, W - T - 3.15, backZ - 1.05, 1.9, 1.0, y, true, 4);
      chest(T + 0.1, 7.35, 0.55, 0.85, y, false);
    } else {
      bed(i, T + 0.1, backZ - 1.05, 1.9, 1.0, y, true, 3);
    }
    shrine(y, 5.6, 'left');
  };
  const tradeFloor = (i, c) => {
    // what the house's trade keeps on this floor, by the right-hand wall (c: the chvata) or the back (the store)
    const y = Y[i], rr = hv(i, 5);
    if (c) {
      if (trade === 'carver') {
        // the carver's bench under the window light with a half-carved strut and chisels, finished struts leaning on the wall
        B(sx1 + 0.8, y + 0.78, 1.15, W - T - 0.1, y + 0.86, 2.0, 'wood_ochre'); for (const x of [sx1 + 0.85, W - T - 0.2]) for (const z of [1.2, 1.9]) B(x, y, z - 0.04, x + 0.1, y + 0.78, z + 0.04, 'wood_dark');
        RC(sx1 + 0.8, y, 1.15, W - T - 0.1, y + 0.9, 2.0);
        B(sx1 + 1.0, y + 0.86, 1.4, sx1 + 2.0, y + 0.98, 1.75, 'wood_painted');
        for (let j = 0; j < 4; j++) B(sx1 + 1.3 + j * 0.2, y + 0.86, 1.2, sx1 + 1.33 + j * 0.2, y + 0.89, 1.5, 'wood_dark');
        for (let j = 0; j < 4; j++) { const x = sx1 + 0.8 + j * 0.28; B(x, y, W * 0 + D - T - 0.4, x + 0.22, y + 1.5 + (j % 2) * 0.2, D - T - 0.02, j % 2 ? 'wood_painted' : 'wood_dark'); }
        for (let j = 0; j < 5; j++) B(sx1 + 0.9 + (j * 0.31) % 1.6, y, 2.2 + (j * 0.47) % 1.0, sx1 + 1.06 + (j * 0.31) % 1.6, y + 0.025, 2.28 + (j * 0.47) % 1.0, 'thatch');
      } else if (trade === 'weaver') {
        // a frame loom by the window: two posts, the beams, the warp and the cloth woven so far
        for (const x of [sx1 + 0.9, sx1 + 2.0]) for (const z of [1.2, 2.5]) B(x - 0.05, y, z - 0.05, x + 0.05, y + 1.1, z + 0.05, 'wood_dark');
        B(sx1 + 0.85, y + 1.0, 1.15, sx1 + 2.05, y + 1.07, 1.25, 'wood_ochre'); B(sx1 + 0.85, y + 1.0, 2.45, sx1 + 2.05, y + 1.07, 2.55, 'wood_ochre');
        B(sx1 + 0.95, y + 1.0, 1.25, sx1 + 1.95, y + 1.012, 2.45, 'sacking'); B(sx1 + 0.95, y + 1.012, 1.25, sx1 + 1.95, y + 1.024, 1.8, 'cloth_red');
        B(sx1 + 1.0, y, 2.7, sx1 + 1.9, y + 0.4, 3.05, 'wood_ochre');
        RC(sx1 + 0.8, y, 1.1, sx1 + 2.1, y + 1.1, 2.6);
      } else if (trade === 'cloth') {
        // bolts of cloth stacked on a table by the window and folded lengths on a shelf
        B(sx1 + 0.8, y + 0.7, 1.15, W - T - 0.1, y + 0.76, 2.1, 'wood_ochre'); for (const x of [sx1 + 0.85, W - T - 0.2]) for (const z of [1.2, 2.0]) B(x, y, z - 0.04, x + 0.1, y + 0.7, z + 0.04, 'wood_dark');
        RC(sx1 + 0.8, y, 1.15, W - T - 0.1, y + 0.8, 2.1);
        for (let j = 0; j < 4; j++) B(sx1 + 0.9 + j * 0.32, y + 0.76, 1.3 + (j % 2) * 0.2, sx1 + 1.15 + j * 0.32, y + 0.76 + 0.12 + (j % 3) * 0.06, 1.8 + (j % 2) * 0.2, COLS[(j + rr) % 5]);
      } else if (trade === 'brass') {
        // the beaten vessels waiting to be sold, on a plank shelf on the wall and in a row on the floor
        shelves(y, sx1 + 0.4, W - T - 0.1, backZ, [0.6, 1.2], null, 0.45);
        for (let j = 0; j < 5; j++) { const p = toW(sx1 + 0.7 + j * 0.38, backZ - 0.25); bag.add(j % 3 === 0 ? 'gilt_bronze' : 'bronze', lathe([[0.001, 0], [0.1, 0], [0.16, 0.12], [0.1, 0.24], [0.06, 0.3], [0.09, 0.34], [0.001, 0.33]], 8, null, p[0], y + 0.65, p[1])); }
        for (let j = 0; j < 3; j++) { const p = toW(sx1 + 0.8 + j * 0.55, 1.6); bag.add('bronze', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.2], [0.24, 0.36], [0.27, 0.4], [0.001, 0.38]], 9, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.28, y, y + 0.6); }
      } else {
        // a farm house: the garlic and the maize hung to dry from the joists over a mat, grain in a basket
        mat(sx1 + 0.8, 1.2, 1.6, 1.4, y);
        for (let j = 0; j < 4; j++) { const x = sx1 + 0.95 + j * 0.38; B(x, y + 1.3, 2.0, x + 0.05, Y[i + 1] - 0.46, 2.05, 'rope_fibre'); B(x - 0.04, y + 0.95, 1.98, x + 0.09, y + 1.3, 2.07, j % 2 ? 'cloth_ochre' : 'sacking'); }
        const p = toW(W - T - 0.5, 2.9); bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.3, 0.32], [0.26, 0.32], [0.001, 0.05]], 7, null, p[0], y, p[1]));
      }
    }
  };
  const chvataRoom = (i) => {
    const y = Y[i], rr = hv(i, 2), seat = k.seat;
    // the seat in the long window: a plank across it, a cushion on it (the walker steps onto it, 0.4 m)
    if (seat) {
      const segs = k.door ? [[seat.x0, k.door[0] - 0.04], [k.door[1] + 0.04, seat.x1]] : [[seat.x0, seat.x1]];
      for (const [a, b] of segs) {
        if (b - a < 0.15) continue;
        B(a, y, T, b, y + 0.42, T + 0.42, 'wood_ochre');                       // (the brick sill in the wall is the seat's back half)
        col.floor(wrect(a, 0.0, b, T + 0.42), y + 0.42);
        for (let x = a + 0.08; x < b - 0.5; x += 1.15) B(x, y + 0.42, 0.06, Math.min(b - 0.06, x + 0.8), y + 0.48, T + 0.38, COLS[(Math.floor(x * 3) + rr) % 3]);
      }
    }
    // the family's mat with cushions and a low table on the left in the middle, a lamp niche, the household shrine
    const mx = Math.max(T + 0.3, sx0 - 2.5);
    if (i === k.ic) {
      if (k.n >= 4) {
        mat(T + 2.05, 3.7, 1.7, 1.1, y);
        cushion(T + 2.15, y + 0.025, 3.8, 0.5, 0.4, 'cloth_red'); cushion(T + 2.85, y + 0.025, 3.9, 0.5, 0.4, 'cloth_ochre');
      } else {
        void mx;
        mat(T + 0.4, 2.8, 2.0, 1.3, y);
        cushion(T + 1.5, y + 0.025, 2.9, 0.5, 0.4, 'cloth_red'); cushion(T + 1.5, y + 0.025, 3.5, 0.5, 0.4, 'cloth_ochre'); cushion(T + 0.5, y + 0.025, 3.7, 0.5, 0.4, 'cloth_maroon');
        B(T + 0.5, y + 0.025, 3.1, T + 1.3, y + 0.3, 3.5, 'wood_dark'); RC(T + 0.5, y, 3.1, T + 1.3, y + 0.55, 3.5);
      }
    }
    shrine(y, 5.6, 'left');
    tradeFloor(i, true);
    // the chests and the jars at the back
    if (hasPart) {
      partition(i, y, 7.1);
      for (let j = 0; j < 2; j++) chest(T + 0.1 + j * 1.0, backZ - 0.65, 0.85, 0.6, y, false);
      if (i > 1) for (let j = 0; j < 4; j++) { P(W - T - 0.5 - (j % 2) * 0.6, y, backZ - 0.5 - Math.floor(j / 2) * 0.6, 'jar', 1.5 - 0.15 * j, j === 2); col.circle(...toW(W - T - 0.5 - (j % 2) * 0.6, backZ - 0.5 - Math.floor(j / 2) * 0.6), 0.3, y, y + 0.8); }
      if (trade === 'grain' || trade === 'home' || trade === 'store' || trade === 'mill') for (let j = 0; j < 3; j++) { const x = T + 0.4 + j * 0.45; B(x, y, 7.4, x + 0.38, y + 0.58, 7.75, j % 2 ? 'sacking' : 'sacking'); }
    } else {
      for (let j = 0; j < 2; j++) chest(T + 0.1 + j * 1.0, backZ - 0.65, 0.85, 0.6, y, false);
      bed(i, W - T - 3.3, backZ - 1.05, 1.9, 1.0, y, true, 3);
    }
  };
  const baigaRoom = (i) => {
    const y = Y[i], rr = hv(i, 3), yc = Y[i + 1];
    // the hearth (a raised block of clay with two pot-rests, a fire, a pot on it) in the back right corner, firewood beside it
    const hx = W - T - 1.5, hz = backZ - 1.3;
    B(hx, y, hz, hx + 1.4, y + 0.5, hz + 1.2, 'mud_plaster'); RC(hx, y, hz, hx + 1.4, y + 0.6, hz + 1.2);
    B(hx + 0.12, y + 0.5, hz + 0.12, hx + 0.48, y + 0.58, hz + 0.48, 'wood_dark'); B(hx + 0.82, y + 0.5, hz + 0.12, hx + 1.18, y + 0.58, hz + 0.48, 'wood_dark');
    B(hx + 0.55, y + 0.5, hz + 0.55, hx + 0.8, y + 0.53, hz + 1.05, 'cloth_red');                // the embers between the pot-rests
    P(hx + 0.3, y + 0.58, hz + 0.3, 'round', 1.3, true); P(hx + 1.0, y + 0.58, hz + 0.3, 'bowl', 1.1, false);
    for (let j = 0; j < 4; j++) B(hx - 0.35, y + 0.0 + j * 0.1, hz + 0.1 + j * 0.02, hx - 0.05, y + 0.1 + j * 0.1, hz + 1.1 - j * 0.04, 'timber');
    // the shrine of the house's god on the back wall: a framed niche with a gilt image, a lamp and marigolds, a low plank before it
    {
      const sxc = Math.max(T + 1.2, W * 0.38), z0 = backZ;
      B(sxc - 0.5, y + 0.9, z0 - 0.12, sxc + 0.5, y + 1.8, z0, 'wood_painted'); B(sxc - 0.4, y + 1.0, z0 - 0.14, sxc + 0.4, y + 1.7, z0 - 0.11, 'wood_dark');
      const p = toW(sxc, z0 - 0.25);
      bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0], [0.08, 0.2], [0.05, 0.3], [0.001, 0.36]], 6, null, p[0], y + 1.02, p[1]));
      B(sxc - 0.55, y + 0.85, z0 - 0.5, sxc + 0.55, y + 0.9, z0, 'wood_dark'); B(sxc - 0.3, y + 0.9, z0 - 0.4, sxc + 0.3, y + 0.94, z0 - 0.15, 'cloth_ochre');
      B(sxc - 0.7, y, z0 - 0.6, sxc + 0.7, y + 0.3, z0 - 0.05, 'mud_plaster'); RC(sxc - 0.7, y, z0 - 0.6, sxc + 0.7, y + 0.35, z0 - 0.05);
    }
    // shelves of pots on the back wall left of the shrine, water jars and grain bins along the right wall
    shelves(y, T + 0.2, W * 0.38 - 0.9, backZ, [0.7, 1.3], null, 0.4);
    for (let x = T + 0.4, j = 0; x < W * 0.38 - 1.0; x += 0.36, j++) { P(x, y + 0.75, backZ - 0.22, j % 2 ? 'cup' : 'round', 0.9, j % 3 === 0); P(x, y + 1.35, backZ - 0.22, 'cup', 1, false); }
    for (let j = 0; j < 3; j++) { P(W - T - 0.45, y, 2.2 + j * 0.65, 'jar', 1.5 - 0.1 * j, j === 1); col.circle(...toW(W - T - 0.45, 2.2 + j * 0.65), 0.3, y, y + 0.8); }
    for (let j = 0; j < 2; j++) { const p = toW(W - T - 0.55, 4.4 + j * 0.8); bag.add('wicker', lathe([[0.001, 0], [0.38, 0], [0.45, 0.4], [0.4, 0.85], [0.001, 0.85]], 8, null, p[0], y, p[1])); bag.add('thatch', lathe([[0.45, 0.85], [0.3, 1.05], [0.001, 1.2]], 8, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.46, y, y + 1.2); }
    // strings of chillies and garlic from the joists, along the back wall only (what hangs in the room is walked into)
    for (let j = 0; j < 5; j++) { const x = T + 0.5 + j * 0.28; if (x > W * 0.38 - 1.0) break; B(x, yc - 1.25, backZ - 0.06, x + 0.04, yc - 0.46, backZ - 0.02, 'rope_fibre'); B(x - 0.04, yc - 1.4, backZ - 0.09, x + 0.09, yc - 1.15, backZ - 0.01, j % 2 ? 'cloth_red' : 'sacking'); }
    // a mat and a stool by the left wall (not where the ladder comes up at the front on a house of four storeys)
    if (k.n < 4) { mat(T + 0.2, 1.6, 1.5, 1.2, y); }
    else { mat(T + 2.2, 4.0, 1.5, 1.2, y); }
    void rr;
  };
  // four storage jars in the back right corner of the first floor, of the shapes and places the town's houses have always had there (they stay instanced, as drawn before)
  for (let j = 0; j < 4; j++) { const p = toW(W - T - 0.5 - (j % 2) * 0.55, D - T - 0.5 - Math.floor(j / 2) * 0.6); pot(k.realBag, p[0], Y[1], p[1], 'jar', 1.4 - 0.15 * j); col.circle(p[0], p[1], 0.3, Y[1], Y[1] + 0.8); }
  for (let i = 1; i <= top; i++) { const role = R[i]; if (role === 'matan') matanRoom(i); else if (role === 'chvata') chvataRoom(i); else baigaRoom(i); }
  return { flights, holes };
}

/** One geometry of several non-indexed ones (positions and normals concatenated). */
export function mergeGeos(list) {
  let n = 0;
  for (const g of list) n += g.attributes.position.array.length;
  const pos = new Float32Array(n), nor = new Float32Array(n);
  let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}
