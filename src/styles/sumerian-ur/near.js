// The houses nearest the arrival, drawn closer (docs/settlements/ur.md §5.13): the doorway's stepped reveals of baked brick, a coping
// on the roof's parapet, a ladder of palm trunks leaning on a side wall, a reed-mat shade on poles over part of the roof, vent pots, and
// the life of the court — the clay oven, the quern, jars, fuel, a sleeping mat, a loom's weights. Every piece is placed by a hash of the
// house's own seed (never a counter), so each house differs and a build repeats exactly. Only materials the houses already use.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { rng, sideFrame, sideBox } from './util.js';

const BB = 'brick_baked';
const JAR = (s) => [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.07 * s, 0.7 * s], [0.001, 0.68 * s]];

/**
 * nearHouse({ bag, col }, { rect, f (the door's face), du (the door's middle along it), H (the roof), cls (front class), seed, wings (the roofs),
 * court ([x0, z0, x1, z1] or null: the court's rect, to furnish), open (an entered house: door and ladder only) }).
 */
export function nearHouse({ bag, col }, { rect, f, du, H, cls, seed, wings = [], court = null, open = false }) {
  const r = rng((seed || 1) * 29 + 11), [x0, z0, x1, z1] = rect;
  const P = sideFrame(rect, f), put = (mat, u0, v0, u1, v1, w0, w1) => bag.add(mat, sideBox(P, u0, v0, u1, v1, w0, w1));
  // ---- the doorway: two steps of baked brick either side (the inner the taller and deeper), a lintel course and a cornice over them
  const base = cls >= 1 ? 0.72 : 0.5, hs = 0.9 + (seed % 5) * 0.02;
  if (cls < 3) for (const s of [-1, 1]) {
    put(BB, s < 0 ? du - base - 0.22 : du + base, 0, s < 0 ? du - base : du + base + 0.22, 2.5, -0.12, 0);
    put(BB, s < 0 ? du - base - 0.4 : du + base + 0.22, 0, s < 0 ? du - base - 0.22 : du + base + 0.4, 2.38, -0.06, 0);
    for (let k = 0; k < 2; k++) put('mud_plaster', s < 0 ? du - base - 0.2 : du + base + 0.02, 0.35 + k * hs, s < 0 ? du - base - 0.02 : du + base + 0.2, 0.43 + k * hs, -0.125, -0.119);   // (a band of plaster on the jamb's face: the joint of the courses)
  }
  if (cls < 3) { put(BB, du - base - 0.4, 2.5, du + base + 0.4, 2.64, -0.12, 0); put(BB, du - base - 0.5, 2.64, du + base + 0.5, 2.74, -0.18, 0); }
  if (open) { ladder(); return; }
  // ---- the parapet's coping: a course of baked brick over the roof's wall, the east and west runs between the north and south
  bag.add(BB, box(x0 - 0.2, H + 0.5, z0 - 0.2, x1 + 0.2, H + 0.57, z0 + 0.2)); bag.add(BB, box(x0 - 0.2, H + 0.5, z1 - 0.2, x1 + 0.2, H + 0.57, z1 + 0.2));
  bag.add(BB, box(x0 - 0.2, H + 0.5, z0 + 0.2, x0 + 0.2, H + 0.57, z1 - 0.2)); bag.add(BB, box(x1 - 0.2, H + 0.5, z0 + 0.2, x1 + 0.2, H + 0.57, z1 - 0.2));
  ladder();
  // ---- the roof: a shade of reed mats on four palm poles over the largest wing, vent pots, a jar of water
  const big = wings.filter((w) => w[2] - w[0] > 3.4 && w[3] - w[1] > 2.6).sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0];
  if (big) {
    const w = 1.7 + r() * 0.5, d = 1.5 + r() * 0.4, cx = big[0] + 1.2 + r() * (big[2] - big[0] - 2.4 - w) + w / 2, cz = big[1] + 0.9 + r() * (big[3] - big[1] - 1.8 - d) + d / 2;
    const hi = 2.1, lo = 1.75, a = [cx - w / 2, cz - d / 2], b = [cx + w / 2, cz + d / 2], T = [];
    for (const [px, pz, h] of [[a[0], a[1], hi], [b[0], a[1], hi], [a[0], b[1], lo], [b[0], b[1], lo]]) bag.add('palm_trunk', box(px - 0.04, H, pz - 0.04, px + 0.04, H + h, pz + 0.04));
    const q = [[a[0], H + hi, a[1]], [b[0], H + hi, a[1]], [b[0], H + lo, b[1]], [a[0], H + lo, b[1]]];
    T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
    bag.add('reed_mat', fromTriangles(T));
    for (const z of [a[1], b[1]]) { const t = []; beamTris(t, [a[0] - 0.05, H + (z === a[1] ? hi : lo), z], [b[0] + 0.05, H + (z === a[1] ? hi : lo), z], 0.025, 0.05); bag.add('palm_trunk', fromTriangles(t)); }
    { const js = 1.0 + r() * 0.2; bag.add('terracotta', lathe(JAR(js), 12, null, a[0] + 0.3, H, b[1] - 0.3)); bag.add('terracotta', lathe([[0.2 * js, 0], [0.2 * js, 0.08], [0.14 * js, 0.08]], 10, null, a[0] + 0.3, H, b[1] - 0.3)); }   // the water jar in the shade (its size by the house's own stream, so no two alike)
    bag.add('mud_plaster', box(b[0] - 0.9, H, a[1] + 0.3, b[0] - 0.3, H + 0.3, a[1] + 0.8));   // a bench of mud brick
  }
  for (const wg of wings.slice(0, 2)) {                                                          // vent pots: a short clay chimney with a mouth, by the parapet
    if (r() < 0.4 || wg[2] - wg[0] < 2.2 || wg[3] - wg[1] < 1.6) continue;
    const vx = wg[0] + 0.5 + r() * (wg[2] - wg[0] - 1.0), vz = wg[1] + 0.5 + r() * (wg[3] - wg[1] - 1.0);
    { const vs = 0.9 + r() * 0.25; bag.add('terracotta', lathe([[0.21 * vs, 0], [0.19 * vs, 0.3 * vs], [0.15 * vs, 0.55 * vs], [0.19 * vs, 0.6 * vs], [0.19 * vs, 0.64 * vs], [0.12 * vs, 0.62 * vs]], 10, null, vx, H, vz)); }
  }
  // ---- the court: the clay oven and the quern, jars, fuel and a sleeping mat — placed by the court's own measure
  if (court) furnish(court);
  function ladder() {
    const fs = ['n', 's', 'w', 'e'].filter((q) => q !== f), q = fs[Math.floor(r() * fs.length)];
    if (r() < 0.45 || H > 4) return;
    const Q = sideFrame(rect, q), [a0, a1] = q === 'n' || q === 's' ? [x0, x1] : [z0, z1], u = a0 + (0.3 + r() * 0.4) * (a1 - a0), top = H + 0.65 + r() * 0.2, out = Math.min(1.0, top * 0.22);
    const pt = (uu, y, o) => { const p = Q(uu, y, -o); return [p[0], p[1], p[2]]; };
    for (const s of [-0.28, 0.28]) { const t = []; beamTris(t, pt(u + s, 0, out), pt(u + s, top, 0.02), 0.035, 0.07); bag.add('palm_trunk', fromTriangles(t)); }
    for (let y = 0.35; y < top - 0.2; y += 0.34) { const o = out * (1 - y / top); bag.add('palm_trunk', sideBox(Q, u - 0.28, y, u + 0.28, y + 0.05, -o - 0.045, -o + 0.045)); }
    if (col) { const a = Q(u, 0, 0), b = Q(u, 0, -out); col.rect([Math.min(a[0], b[0]) - 0.3, Math.min(a[2], b[2]) - 0.3, Math.max(a[0], b[0]) + 0.3, Math.max(a[2], b[2]) + 0.3], 0, 0.1); }
  }
  function furnish(c) {
    const cw = c[2] - c[0], cd = c[3] - c[1];
    if (Math.min(cw, cd) < 3.6) return;
    const m = 1.3, X = (k) => c[0] + m + k * (cw - 2 * m), Z = (k) => c[1] + m + k * (cd - 2 * m), oven = r() < 0.5 ? [0.15, 0.85] : [0.85, 0.2];
    // the tannur: a clay cylinder with a soot-black mouth, beside it a stack of dung cakes and a heap of palm ribs
    const ox = X(oven[0]), oz = Z(oven[1]);
    {
    const os = 0.92 + r() * 0.16;
    bag.add('terracotta', lathe([[0.4 * os, 0], [0.38 * os, 0.35 * os], [0.3 * os, 0.7 * os], [0.18 * os, 0.82 * os], [0.16 * os, 0.82 * os], [0.27 * os, 0.68 * os], [0.35 * os, 0.35 * os], [0.37 * os, 0.02]], 16, null, ox, 0.06, oz));
    bag.add('pottery_dark', lathe([[0.17 * os, 0.8 * os], [0.17 * os, 0.83 * os], [0.001, 0.83 * os]], 12, null, ox, 0.06, oz));
    for (let k = 0; k < 5; k++) { const cs = 0.9 + r() * 0.25; bag.add('pottery_dark', lathe([[0.001, 0], [0.13 * cs, 0.005], [0.14 * cs, 0.035], [0.001, 0.04]], 8, null, ox + 0.65 + (k % 2) * 0.05, 0.06 + k * 0.04, oz - 0.1)); }
    for (let k = 0; k < 6; k++) { const t = [], rl = r() * 0.3; beamTris(t, [ox - 0.5 + k * 0.03, 0.08 + (k > 3 ? 0.05 : 0), oz + 0.7], [ox - 0.5 + k * 0.03, 0.08 + (k > 3 ? 0.05 : 0), oz + 1.5 + rl], 0.022, 0.04); bag.add('palm_trunk', fromTriangles(t)); }
    }
    // the quern: a saddle of stone on a bench of mud brick, a bowl of flour under it
    const qx = X(oven[0] > 0.5 ? 0.2 : 0.8), qz = Z(0.15 + r() * 0.2);
    bag.add('mud_plaster', box(qx - 0.4, 0.06, qz - 0.25, qx + 0.4, 0.4, qz + 0.25)); bag.add('mud_plaster', box(qx - 0.34, 0.4, qz - 0.18, qx + 0.34, 0.47, qz + 0.18)); bag.add('mud_plaster', box(qx - 0.12, 0.47, qz - 0.1, qx + 0.12, 0.53, qz + 0.1));
    if (col) { col.circle(ox, oz, 0.4, 0, 0.9); col.rect([qx - 0.4, qz - 0.25, qx + 0.4, qz + 0.25], 0, 0.5); }
    // jars in a row along the wall, one on a ring stand, a basket; a sleeping mat with a linen sheet
    const jx = X(0.5), jz = Z(oven[1] > 0.5 ? 0.9 : 0.1);
    for (let k = 0; k < 3; k++) { bag.add(k === 1 ? 'pottery_dark' : 'terracotta', lathe(JAR(0.85 + r() * 0.36), 12, null, jx + (k - 1) * 0.55, 0.06, jz + (k % 2) * 0.12)); if (col) col.circle(jx + (k - 1) * 0.55, jz + (k % 2) * 0.12, 0.25, 0, 0.8); }
    { const ws = 0.9 + r() * 0.25; bag.add('terracotta', lathe([[0.001, 0], [0.2 * ws, 0.01], [0.24 * ws, 0.3 * ws], [0.22 * ws, 0.31 * ws], [0.18 * ws, 0.04], [0.001, 0.04]], 12, null, jx + 1.2, 0.06, jz)); }
    const mx = X(0.5), mz = Z(0.5), al = r() < 0.5;
    const ex = al ? [0.9, 0.4] : [0.4, 0.9];
    bag.add('reed_mat', box(mx - ex[0], 0.06, mz - ex[1], mx + ex[0], 0.075, mz + ex[1])); bag.add('limewash_white', box(mx - ex[0] + 0.06, 0.075, mz - ex[1] + 0.06, mx + ex[0] - 0.06, 0.11, mz + ex[1] - 0.06));
  }
}
