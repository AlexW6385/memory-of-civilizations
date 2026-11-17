// The temples of Taumadhi (docs/settlements/bhaktapur.md §1, §4): the five-roofed pagoda on its stepped plinth
// with its pairs of guardians, the same in three roofs for the Bhairabnath, the stone shikhara and the chaitya.

import { box, lathe, rod, frustum, fromTriangles, orientOutward } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

const bx = (x0, y0, z0, x1, y1, z1) => box(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1));
const STONE = 'sandstone_dressed';

/** A statue's lathe lying along the facing axis (its y axis turned to x), scaled by s and put at (x, y, z), facing +x or −x. */
function along(bag, mat, g, x, y, z, sx, s) {
  g.scale(s, s, s).rotateZ(-Math.PI / 2);
  if (sx < 0) g.rotateY(Math.PI);
  g.translate(x, y, z); bag.add(mat, g);
}
const ball = (r, n = 8) => lathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);
const at = (g, x, y, z) => g.translate(x, y, z);
/** A ball of radius r centred at p. */
const ballAt = (r, p) => ball(r, 6).translate(p[0], p[1] - r, p[2]);


/** A flat plank between two points: width w along the unit vector u, thickness t (a leaning board, as the carved strut). Returns [geometry, unit normal n]. */
function slant(p0, p1, u, w, t) {
  const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  let n = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
  const l = Math.hypot(...n) || 1; n = n.map((q) => q / l);
  const C = [];
  for (const p of [p0, p1]) for (const a of [-1, 1]) for (const b of [-1, 1]) C.push([p[0] + u[0] * a * w / 2 + n[0] * b * t / 2, p[1] + u[1] * a * w / 2 + n[1] * b * t / 2, p[2] + u[2] * a * w / 2 + n[2] * b * t / 2]);
  const t3 = [];
  for (const [a, b, c, e] of [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]) t3.push(...C[a], ...C[b], ...C[c], ...C[a], ...C[c], ...C[e]);
  return [fromTriangles(orientOutward(t3)), n];
}

/**
 * The carved strut (tunal) from the wall point p0 up and out to the eave p1: a red board with a gilt border, and on its face the figures
 * of the Devi [stated: nepalitimes "a monument to an angry god": 108 struts, each carved with the forms of Bhagwati Mahishamardini and lesser deities]:
 * a lion at the foot, the four-armed goddess in a halo, an attendant above [inferred: the composition].
 */
function tunal(bag, p0, p1, u, w = 0.36) {
  const t = 0.08, [g, n0] = slant(p0, p1, u, w, t);
  const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], L = Math.hypot(...d), e = d.map((q) => q / L);
  const n = n0[1] > 0 ? n0.map((q) => -q) : n0;                          // the face looks outward and down
  bag.add('timber_red', g);
  const P = (s, off = 0, side = 0) => [p0[0] + d[0] * s + n[0] * (t / 2 + off) + u[0] * side, p0[1] + d[1] * s + n[1] * (t / 2 + off) + u[1] * side, p0[2] + d[2] * s + n[2] * (t / 2 + off) + u[2] * side];
  for (const sd of [-1, 1]) bag.add('gilt_bronze', rod(P(0.02, 0.006, sd * (w / 2 - 0.03)), P(0.98, 0.006, sd * (w / 2 - 0.03)), 0.012, 4));
  const sc = Math.min(1.25, L / 2.4 + 0.45);
  bag.add('gilt_bronze', ballAt(0.07 * sc, P(0.13, 0.05 * sc)));                       // the lion at the foot
  bag.add('gilt_bronze', rod(P(0.1, 0.04 * sc), P(0.19, 0.04 * sc), 0.05 * sc, 5));
  bag.add('gilt_bronze', rod(P(0.34, 0.045 * sc), P(0.58, 0.045 * sc), 0.075 * sc, 6));            // the goddess: body, head, crown, halo, four arms
  bag.add('gilt_bronze', ballAt(0.062 * sc, P(0.64, 0.06 * sc)));
  bag.add('gilt_bronze', rod(P(0.665, 0.06 * sc), P(0.73, 0.06 * sc), 0.04 * sc, 5));
  bag.add('gilt_bronze', rod(P(0.64, 0.02), P(0.64, 0.035), 0.15 * sc, 8));
  for (const sd of [-1, 1]) for (const [s1, k] of [[0.52, 0.2], [0.42, 0.13]]) bag.add('gilt_bronze', rod(P(0.56, 0.05 * sc, sd * 0.06 * sc), P(s1, 0.07 * sc, sd * k * sc), 0.016 * sc, 4));
  bag.add('gilt_bronze', rod(P(0.8, 0.04 * sc), P(0.88, 0.04 * sc), 0.045 * sc, 5));                  // an attendant above
  bag.add('gilt_bronze', ballAt(0.04 * sc, P(0.92, 0.05 * sc)));
  void e;
}

/**
 * The guardians of the Nyatapola's stages, from the ground up [stated: wrestlers, elephants, lions, griffins, the goddesses];
 * each pair stronger than the one below, so each figure larger [inferred]. Facing sx (+1 east, −1 west); (x, y, z) the foot of its pedestal.
 */
function guardian(bag, col, kind, x, y, z, sx, s) {
  const M = STONE, ped = 0.45 * s;
  bag.add(M, bx(x - 0.55 * s, y, z - 0.55 * s, x + 0.55 * s, y + ped, z + 0.55 * s));
  col.circle(x, z, 0.62 * s, y, y + 2.4 * s);
  const top = y + ped, F = (u) => x + sx * u;
  if (kind === 'wrestler') {
    // Jaimal or Patta, the Rajput wrestler: a wide stance, the dhoti and belt, a bare chest, a moustached head under a turban, a club in the raised right hand and a round shield on the left arm [stated: wrestlers armed with bludgeons and shields — nepalitimes]
    for (const dz of [-1, 1]) {
      bag.add(M, rod([x, top + 0.04 * s, z + dz * 0.2 * s], [x, top + 0.46 * s, z + dz * 0.15 * s], 0.075 * s, 6));
      bag.add(M, rod([x, top + 0.46 * s, z + dz * 0.15 * s], [x, top + 0.86 * s, z + dz * 0.1 * s], 0.09 * s, 6));
      bag.add(M, bx(x - 0.1 * s, top, z + dz * 0.2 * s - 0.07 * s, F(0.18 * s), top + 0.04 * s, z + dz * 0.2 * s + 0.07 * s));
    }
    bag.add(M, lathe([[0.2 * s, 0], [0.3 * s, 0.3 * s], [0.32 * s, 0.58 * s], [0.2 * s, 0.7 * s], [0.001, 0.72 * s]], 8).translate(x, top + 0.74 * s, z));
    bag.add('gilt_bronze', lathe([[0.3 * s, 0], [0.31 * s, 0.05 * s], [0.3 * s, 0.1 * s]], 8, null, x, top + 0.78 * s, z));
    bag.add(M, lathe([[0.2 * s, 0], [0.3 * s, 0.1 * s], [0.34 * s, 0.3 * s], [0.25 * s, 0.5 * s], [0.12 * s, 0.56 * s]], 8, null, x, top + 1.1 * s, z));
    bag.add(M, rod([x, top + 1.62 * s, z], [x, top + 1.74 * s, z], 0.07 * s, 6));
    bag.add(M, ball(0.13 * s).translate(x, top + 1.7 * s, z));
    for (const v of [-1, 1]) bag.add(M, rod([F(0.12 * s), top + 1.82 * s, z + v * 0.02 * s], [F(0.14 * s), top + 1.8 * s, z + v * 0.17 * s], 0.012 * s, 4));      // the moustache
    bag.add(M, lathe([[0.15 * s, 0], [0.17 * s, 0.07 * s], [0.12 * s, 0.17 * s], [0.001, 0.2 * s]], 8, null, x, top + 1.9 * s, z));                                   // the turban
    // the right arm raised to the club, the left bearing the shield
    bag.add(M, rod([x, top + 1.58 * s, z - 0.3 * s], [F(0.3 * s), top + 1.5 * s, z - 0.48 * s], 0.065 * s, 6));
    bag.add(M, rod([F(0.3 * s), top + 1.5 * s, z - 0.48 * s], [F(0.38 * s), top + 1.82 * s, z - 0.46 * s], 0.055 * s, 6));
    bag.add(M, rod([F(0.38 * s), top + 1.5 * s, z - 0.46 * s], [F(0.38 * s), top + 2.2 * s, z - 0.46 * s], 0.042 * s, 6));
    bag.add(M, lathe([[0.06 * s, 0], [0.11 * s, 0.1 * s], [0.12 * s, 0.25 * s], [0.07 * s, 0.34 * s], [0.001, 0.36 * s]], 7, null, F(0.38 * s), top + 1.9 * s, z - 0.46 * s));
    bag.add(M, rod([x, top + 1.58 * s, z + 0.3 * s], [F(0.25 * s), top + 1.25 * s, z + 0.34 * s], 0.065 * s, 6));
    bag.add('iron', rod([F(0.27 * s), top + 1.2 * s, z + 0.36 * s], [F(0.33 * s), top + 1.2 * s, z + 0.36 * s], 0.24 * s, 10));
    bag.add('gilt_bronze', ballAt(0.07 * s, [F(0.36 * s), top + 1.2 * s, z + 0.36 * s]));
    return;
  }
  // the quadrupeds and the seated goddess: a body, a chest, a head
  if (kind === 'elephant') {
    along(bag, M, lathe([[0.001, -0.7], [0.5, -0.5], [0.58, 0], [0.5, 0.6], [0.001, 0.8]], 10), x, top + 0.95 * s, z, sx, s);
    for (const [u, v] of [[-0.45, -0.28], [-0.45, 0.28], [0.4, -0.28], [0.4, 0.28]]) bag.add(M, bx(F(u * s) - 0.11 * s, top, z + v * s - 0.11 * s, F(u * s) + 0.11 * s, top + 0.75 * s, z + v * s + 0.11 * s));
    bag.add(M, ball(0.3 * s).translate(F(0.88 * s), top + 1.3 * s, z));
    for (const v of [-0.33, 0.33]) bag.add(M, bx(F(0.74 * s) - 0.03 * s, top + 1.1 * s, z + v * s - 0.17 * s, F(0.74 * s) + 0.03 * s, top + 1.55 * s, z + v * s + 0.17 * s));
    bag.add(M, rod([F(1.05 * s), top + 1.25 * s, z], [F(1.2 * s), top + 0.9 * s, z], 0.1 * s, 7));
    bag.add(M, ball(0.2 * s).translate(F(0.8 * s), top + 1.38 * s, z - 0.17 * s)); bag.add(M, ball(0.2 * s).translate(F(0.8 * s), top + 1.38 * s, z + 0.17 * s));            // the twin bosses of the brow
    bag.add(M, rod([F(1.2 * s), top + 0.9 * s, z], [F(1.35 * s), top + 0.6 * s, z], 0.07 * s, 7)); bag.add(M, rod([F(1.35 * s), top + 0.6 * s, z], [F(1.3 * s), top + 0.32 * s, z], 0.055 * s, 7));   // the trunk curls down
    bag.add(M, rod([F(-0.7 * s), top + 1.1 * s, z], [F(-0.78 * s), top + 0.4 * s, z], 0.03 * s, 5));                      // the tail
    bag.add('cloth_red', bx(F(-0.38 * s), top + 1.44 * s, z - 0.4 * s, F(0.3 * s), top + 1.52 * s, z + 0.4 * s)); bag.add('gilt_bronze', bx(F(-0.4 * s), top + 1.5 * s, z - 0.42 * s, F(0.32 * s), top + 1.54 * s, z - 0.38 * s)); bag.add('gilt_bronze', bx(F(-0.4 * s), top + 1.5 * s, z + 0.38 * s, F(0.32 * s), top + 1.54 * s, z + 0.42 * s));   // the saddle cloth
    bag.add('gilt_bronze', bx(F(0.86 * s), top + 1.5 * s, z - 0.12 * s, F(0.92 * s), top + 1.68 * s, z + 0.12 * s));        // the frontlet
    bag.add('ivory', rod([F(1.0 * s), top + 1.1 * s, z - 0.1 * s], [F(1.3 * s), top + 0.95 * s, z - 0.13 * s], 0.025 * s, 5));
    bag.add('ivory', rod([F(1.0 * s), top + 1.1 * s, z + 0.1 * s], [F(1.3 * s), top + 0.95 * s, z + 0.13 * s], 0.025 * s, 5));
    return;
  }
  // lion, griffin (with wings), the goddesses (lion-bodied, crowned)
  along(bag, M, lathe([[0.001, -0.5], [0.28, -0.3], [0.34, 0], [0.3, 0.4], [0.001, 0.55]], 9), x, top + 0.7 * s, z, sx, s);
  for (const [u, v] of [[-0.3, -0.2], [-0.3, 0.2], [0.34, -0.17], [0.34, 0.17]]) bag.add(M, bx(F(u * s) - 0.07 * s, top, z + v * s - 0.07 * s, F(u * s) + 0.07 * s, top + 0.5 * s, z + v * s + 0.07 * s));
  bag.add(M, ball(0.23 * s).translate(F(0.5 * s), top + 1.0 * s, z));
  bag.add(M, lathe([[0.001, 0], [0.3 * s, 0.05 * s], [0.34 * s, 0.25 * s], [0.001, 0.4 * s]], 8).rotateZ(-Math.PI / 2 * sx).translate(F(0.42 * s), top + 0.98 * s, z));   // the mane
  bag.add(M, rod([F(-0.5 * s), top + 0.75 * s, z], [F(-0.68 * s), top + 0.95 * s, z], 0.04 * s, 5)); bag.add(M, rod([F(-0.68 * s), top + 0.95 * s, z], [F(-0.62 * s), top + 1.2 * s, z], 0.035 * s, 5));   // the tail
  bag.add(M, ball(0.19 * s).translate(F(-0.3 * s), top + 0.3 * s, z - 0.2 * s)); bag.add(M, ball(0.19 * s).translate(F(-0.3 * s), top + 0.3 * s, z + 0.2 * s));      // the haunches
  if (kind === 'griffin') for (const v of [-1, 1]) for (let k = 0; k < 4; k++) bag.add(M, bx(F((-0.05 - 0.1 * k) * s), top + (0.9 + 0.04 * k) * s, z + v * 0.36 * s - 0.02 * s, F((-0.25 - 0.1 * k) * s), top + (1.55 - 0.1 * k) * s, z + v * 0.36 * s + 0.02 * s));
  if (kind === 'goddess') for (const v of [-1, 1]) for (const [dy, dv] of [[0.2, 0.2], [-0.05, 0.28]]) bag.add(M, rod([F(0.45 * s), top + 1.0 * s, z + v * 0.1 * s], [F(0.52 * s), top + (1.0 + dy) * s, z + v * dv * s], 0.025 * s, 5));
  if (kind === 'goddess') { bag.add('gilt_bronze', lathe([[0.001, 0], [0.16 * s, 0], [0.12 * s, 0.2 * s], [0.001, 0.3 * s]], 8).translate(F(0.5 * s), top + 1.22 * s, z)); }
}

/**
 * newar_pagoda: the pagoda temple { c, front ('e'|'w'), plinth: { hw: [by stage, lowest first], h (stage height), tread (the stair side's tread), top (the east face of the highest stage is at hw + top) },
 * roofs: [{ hw (eave half-width), core (the wall's half-width under it), wall (its height), rise }], guard: ['wrestler' ...] (a pair at the foot of each flight), bells, door }.
 */
export function pagoda(el, { bag, col, lights }) {
  const [cx, cz] = el.c, sx = el.front === 'w' ? -1 : 1, P = el.plinth, h = P.h, n = P.hw.length;
  const X = (u) => cx + sx * u, rect = (u0, v0, u1, v1) => { const a = X(u0), b = X(u1); return [Math.min(a, b), cz + v0, Math.max(a, b), cz + v1]; };
  const uFace = []; for (let k = n - 1, u = P.hw[n - 1] + (P.top ?? 1); k >= 0; k--, u += P.tread) uFace[k] = u;
  // the stages: brick faced, with a stone coping, and the flights of the stair on the front
  for (let k = 0; k < n; k++) {
    const r = rect(-P.hw[k], -P.hw[k], uFace[k], P.hw[k]), y1 = (k + 1) * h;
    bag.add('brick', box(r[0], 0, r[1], r[2], y1 - 0.1, r[3])); bag.add(STONE, box(r[0] - 0.06, y1 - 0.1, r[1] - 0.06, r[2] + 0.06, y1, r[3] + 0.06));
    col.rect(r, 0, y1); col.floor(r, y1);
  }
  const W = P.stair ?? 4.4, m = 4;
  for (let k = 0; k < n; k++) for (let j = 1; j <= m; j++) {
    const r = rect(uFace[k], -W / 2, uFace[k] + (m - j + 1) * 0.35, W / 2), t = k * h + j * h / m;
    bag.add(STONE, box(r[0], 0, r[1], r[2], t, r[3])); col.rect(r, 0, t); col.floor(r, t);
  }
  const kinds = el.guard ?? ['wrestler', 'elephant', 'lion', 'griffin', 'goddess'];
  for (let k = 0; k < n && k < kinds.length; k++) for (const v of [-1, 1]) guardian(bag, col, kinds[k], X(uFace[k] + 1.25), k * h, cz + v * (W / 2 + 1.05), sx, 0.85 + 0.12 * k);
  // the roofs and the walls of the tiers
  let yb = n * h - 0.02;
  const R = el.roofs;
  R.forEach((q, i) => {
    const ye = yb + q.wall, next = R[i + 1] ? R[i + 1].core : 0.55, run = q.hw - next, ov = q.hw - q.core;
    const c0 = rect(-q.core, -q.core, q.core, q.core);
    if (i === 0 && el.chamber) {
      // the sanctum on the ground tier is open to the front: walls 0.7 m thick on three sides and a front wall with the door, a ceiling of joists under the second tier
      const t = 0.7, dw = 0.75, ch = el.chamber, c = q.core, y0 = yb;
      const wl = (u0, v0, u1, v1, y1 = ye) => { const r = rect(u0, v0, u1, v1); bag.add('brick', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0 - 1, y1); };
      wl(-c, -c, -c + t, c); wl(-c, -c, c, -c + t); wl(-c, c - t, c, c);
      wl(c - t, -c, c, -dw); wl(c - t, dw, c, c);
      { const r = rect(c - t, -dw, c, dw); bag.add('brick', box(r[0], y0 + 2.1, r[1], r[2], ye, r[3])); }
      { const r = rect(-c + t, -c + t, c - t, c - t); bag.add('wood_dark', box(r[0], ye - 0.25, r[1], r[2], ye, r[3])); }
      // within: the image of Bhairab on a stone seat (a gilt head with a crown, great eyes, a garland), a lamp, a bell, offerings
      const ix = X(-c + t + 0.9), iz = cz;
      bag.add(STONE, box(ix - 0.8, y0, iz - 0.8, ix + 0.8, y0 + 0.5, iz + 0.8)); col.rect([ix - 0.8, iz - 0.8, ix + 0.8, iz + 0.8], y0, y0 + 0.5);
      bag.add('gilt_bronze', lathe([[0.001, 0], [0.34, 0.02], [0.4, 0.3], [0.32, 0.62], [0.2, 0.78], [0.001, 0.82]], 10, null, ix, y0 + 0.5, iz));
      bag.add('gilt_bronze', lathe([[0.25, 0], [0.3, 0.2], [0.14, 0.45], [0.001, 0.6]], 8, null, ix, y0 + 1.28, iz));
      for (const v of [-0.14, 0.14]) bag.add('paint_white', ball(0.07).translate(ix + sx * 0.3, y0 + 1.12, iz + v)), bag.add('iron', ball(0.03).translate(ix + sx * 0.37, y0 + 1.12, iz + v));
      bag.add('cloth_ochre', lathe([[0.42, 0], [0.45, 0.06], [0.42, 0.12], [0.38, 0.06]], 10, null, ix, y0 + 0.9, iz));
      for (const v of [-1.4, 1.4]) { const lx = X(-c + t + 1.3); bag.add('bronze', lathe([[0.001, 0], [0.2, 0], [0.25, 0.14], [0.001, 0.14]], 8, null, lx, y0, iz + v)); bag.add('flame', lathe([[0.03, 0], [0.001, 0.08]], 5, null, lx, y0 + 0.14, iz + v)); }
      bag.add('bronze', rod([X(c - t - 0.3), y0 + 2.05, cz], [X(c - t - 0.3), y0 + 1.5, cz], 0.02, 5)); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.22], [0.001, 0.22]], 7, null, X(c - t - 0.3), y0 + 1.3, cz));
      { const dr = rect(-c + t, -c + t, c - t, c - t); bag.add('wood_ochre', box(dr[0], y0, dr[1], dr[2], y0 + 0.04, dr[3])); col.floor(dr, y0 + 0.04); void ch; }
      if (lights) lights.push({ at: [X(0), y0 + 2.0, cz], color: '#ffd9a0', intensity: 2.0, distance: 9 });
    } else {
      bag.add('brick', box(c0[0], yb, c0[1], c0[2], ye, c0[3]));
      if (i === 0) col.rect(c0, 0, ye + q.rise);
    }
    // the openings of the tier: a door on the front at the first, a lattice window on every face above [stated: a chamber with gates on the four sides — oocities]
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const dw = 0.75, door = i === 0 && dx === sx, w = door ? 0.9 : 0.55, hh = door ? 2.0 : 1.1, y0 = door ? yb : yb + 0.8, off = 0.03;
      const px = cx + dx * (q.core + off), pz = cz + dz * (q.core + off);
      if (!(door && el.chamber)) bag.add('opening', bx(px - (dz ? w : 0.02), y0, pz - (dx ? w : 0.02), px + (dz ? w : 0.02), y0 + hh, pz + (dx ? w : 0.02)));
      const fo = 0.08, fx = cx + dx * (q.core + fo), fz = cz + dz * (q.core + fo);
      bag.add('timber_red', bx(fx - (dz ? w + 0.12 : 0.03), y0, fz - (dx ? w + 0.12 : 0.03), fx + (dz ? w + 0.12 : 0.03), y0 + 0.1, fz + (dx ? w + 0.12 : 0.03)));
      bag.add('timber_red', bx(fx - (dz ? w + 0.12 : 0.03), y0 + hh, fz - (dx ? w + 0.12 : 0.03), fx + (dz ? w + 0.12 : 0.03), y0 + hh + 0.14, fz + (dx ? w + 0.12 : 0.03)));
      for (const s of [-1, 1]) bag.add('timber_red', bx(fx + (dz ? s * (w + 0.06) - 0.06 : 0), y0, fz + (dx ? s * (w + 0.06) - 0.06 : 0), fx + (dz ? s * (w + 0.06) + 0.06 : 0.03 * dx), y0 + hh, fz + (dx ? s * (w + 0.06) + 0.06 : 0.03 * dz)));
      // face-local boxes: t along the face from its middle, o outward from the wall, y up
      const fb = (mat, t0, t1, ya, yb2, o0, o1) => bag.add(mat, bx(cx + (dx ? dx * (q.core + o0) : t0), ya, cz + (dz ? dz * (q.core + o0) : t0), cx + (dx ? dx * (q.core + o1) : t1), yb2, cz + (dz ? dz * (q.core + o1) : t1)));
      if (!door) {
        // the lattice of the window (ankhi jhyal): bars each way behind a carved, gilt-headed frame [stated: windows and doors lavishly carved and painted]
        const nb = 5;
        for (let k = 1; k < nb; k++) { const t = -w + 2 * w * k / nb; fb('wood_dark', t - 0.016, t + 0.016, y0, y0 + hh, 0.0, 0.05); }
        for (let k = 1; k < 4; k++) { const yy = y0 + hh * k / 4; fb('wood_dark', -w, w, yy - 0.016, yy + 0.016, 0.0, 0.05); }
        fb('gilt_bronze', -w - 0.06, w + 0.06, y0 + hh + 0.14, y0 + hh + 0.2, 0.04, 0.14);
        fb('gilt_bronze', -0.12, 0.12, y0 + hh + 0.2, y0 + hh + 0.34, 0.06, 0.12);
        fb('timber_red', -w - 0.1, w + 0.1, y0 - 0.1, y0 - 0.04, 0.06, 0.2);
      } else if (!el.chamber) {
        // the shut door: two painted leaves with gilt bosses, the carved jambs, and a gilt torana (an arch with a kirtimukha) over the lintel [inferred: the sanctum is closed]
        fb('wood_painted', -w, -0.02, y0, y0 + hh, 0.0, 0.06); fb('wood_painted', 0.02, w, y0, y0 + hh, 0.0, 0.06);
        for (const t of [-0.35, 0.35]) for (const yy of [0.6, 1.0, 1.4]) fb('gilt_bronze', t - 0.05, t + 0.05, y0 + yy - 0.05, y0 + yy + 0.05, 0.05, 0.09);
        fb('gilt_bronze', -w - 0.16, -w - 0.1, y0, y0 + hh, 0.06, 0.14); fb('gilt_bronze', w + 0.1, w + 0.16, y0, y0 + hh, 0.06, 0.14);
        const ty = y0 + hh + 0.14, R = w + 0.2;
        fb('timber_red', -R, R, ty, ty + 0.2, 0.02, 0.1);
        for (let k = 0; k < 9; k++) { const a0 = Math.PI * k / 9, a1 = Math.PI * (k + 1) / 9; fb('gilt_bronze', R * Math.cos(a1) * 0.98, R * Math.cos(a0) * 0.98, ty + 0.2 + Math.sin(a0) * 0.2, ty + 0.2 + Math.sin(a1) * 0.2 + 0.05, 0.04, 0.12); }
        bag.add('gilt_bronze', ballAt(0.07, [cx + (dx ? dx * (q.core + 0.12) : 0), ty + 0.2 + 0.2 + 0.02, cz + (dz ? dz * (q.core + 0.12) : 0)]));
      } else {
        // the Bhairabnath's door: carved jambs and a gilt lintel board round the opening
        fb('timber_red', -dw - 0.14, -dw, yb, yb + 2.1, -0.04, 0.12); fb('timber_red', dw, dw + 0.14, yb, yb + 2.1, -0.04, 0.12);
        fb('gilt_bronze', -dw - 0.2, dw + 0.2, yb + 2.1, yb + 2.2, -0.04, 0.14);
      }
    }
    // the eave: a red fascia, the roof in two slopes (a gentle curve), gilt hip ridges, upturned corners
    const e = rect(-q.hw, -q.hw, q.hw, q.hw), ex = (e[0] + e[2]) / 2, ez = (e[1] + e[3]) / 2;
    bag.add('timber_red', bx(e[0], ye - 0.38, e[1], e[2], ye, e[1] + 0.12)); bag.add('timber_red', bx(e[0], ye - 0.38, e[3] - 0.12, e[2], ye, e[3]));
    bag.add('timber_red', bx(e[0], ye - 0.38, e[1] + 0.12, e[0] + 0.12, ye, e[3] - 0.12)); bag.add('timber_red', bx(e[2] - 0.12, ye - 0.38, e[1] + 0.12, e[2], ye, e[3] - 0.12));
    const hw2 = q.hw - run * 0.38, y2 = ye + q.rise * 0.3;
    bag.add('roof_tile', frustum([e[0], e[1], e[2], e[3]], ye, y2, run * 0.38, run * 0.38, run * 0.38, run * 0.38, { noBottom: false }));
    bag.add('roof_tile', frustum([ex - hw2, ez - hw2, ex + hw2, ez + hw2], y2, ye + q.rise, hw2 - next, hw2 - next, hw2 - next, hw2 - next, { noBottom: true }));
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      bag.add('gilt_bronze', rod([ex + a * q.hw, ye + 0.05, ez + b * q.hw], [ex + a * next, ye + q.rise, ez + b * next], 0.07, 5));
      bag.add('gilt_bronze', lathe([[0.1, 0], [0.06, 0.18], [0.001, 0.4]], 5, null, ex + a * (q.hw - 0.05), ye + 0.05, ez + b * (q.hw - 0.05)));
    }
    // the struts, at 45° from the wall to the eave, each a carved board with the forms of the Devi [stated: 108 on the Nyatapola — 7, 6, 6, 5, 3 on each face]
    const ns = el.struts ? el.struts[i] : Math.max(3, Math.round(q.hw / 1.35));
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let s = 0; s < ns; s++) {
      const v = (-q.core + 0.6) + (2 * q.core - 1.2) * (ns > 1 ? s / (ns - 1) : 0.5), ou = Math.min(ov * 0.82, 2.4);
      const p0 = [cx + (dx ? dx * (q.core + 0.04) : v), ye - 0.3 - ou, cz + (dz ? dz * (q.core + 0.04) : v)], p1 = [cx + (dx ? dx * (q.core + ou) : v), ye - 0.38, cz + (dz ? dz * (q.core + ou) : v)];
      tunal(bag, p0, p1, dx ? [0, 0, 1] : [1, 0, 0], Math.min(0.4, 0.2 + 0.07 * q.hw));
    }
    // the bells along the eave [stated: 528 wind bells, the most on the lowest roof]
    const nb = Math.round(el.bells ? el.bells[i] : 8 * q.hw / 0.9 / 4);
    const per = 8 * q.hw;
    for (let b = 0; b < nb; b++) {
      let d = (b + 0.5) / nb * per, x, z;
      if (d < 2 * q.hw) { x = ex - q.hw + d; z = ez - q.hw; } else if (d < 4 * q.hw) { x = ex + q.hw; z = ez - q.hw + (d - 2 * q.hw); } else if (d < 6 * q.hw) { x = ex + q.hw - (d - 4 * q.hw); z = ez + q.hw; } else { x = ex - q.hw; z = ez + q.hw - (d - 6 * q.hw); }
      bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.07, 0.16], [0.03, 0.22], [0.001, 0.22]], 5, null, x, ye - 0.62, z));
    }
    yb = ye + q.rise - 0.15;
  });
  // the pinnacle: a gilt vase, umbrellas and a spire
  const last = R[R.length - 1], top = yb + 0.15;
  bag.add('gilt_bronze', lathe([[0.7, 0], [0.7, 0.14], [0.45, 0.22], [0.62, 0.55], [0.3, 0.95], [0.4, 1.1], [0.16, 1.4], [0.55, 1.5], [0.55, 1.55], [0.14, 1.7], [0.28, 2.1], [0.09, 2.5], [0.035, 3.4], [0.001, 3.6]], 10, null, cx, top, cz));
  void last;
}

/** newar_shikhara { c, s }: a small stone temple — a stepped base, a cube with a door, a tower of stacked, narrowing courses, a ribbed crown and a gilt finial; ~11 m. */
export function shikhara(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 1;
  const hw = [2.7, 2.3, 1.9];
  hw.forEach((w, k) => { const r = [cx - w * s, cz - w * s, cx + w * s, cz + w * s]; bag.add(STONE, box(r[0], k * 0.35 * s, r[1], r[2], (k + 1) * 0.35 * s, r[3])); col.rect(r, 0, (k + 1) * 0.35 * s); col.floor(r, (k + 1) * 0.35 * s); });
  const y0 = 1.05 * s, wh = 2.6 * s, c = 1.5 * s;
  bag.add('sandstone', box(cx - c, y0, cz - c, cx + c, y0 + wh, cz + c)); col.rect([cx - c, cz - c, cx + c, cz + c], 0, y0 + wh);
  bag.add('opening', box(cx + c - 0.02, y0, cz - 0.5 * s, cx + c + 0.03, y0 + 1.7 * s, cz + 0.5 * s));
  bag.add('timber', box(cx + c, y0 + 1.7 * s, cz - 0.6 * s, cx + c + 0.1, y0 + 1.85 * s, cz + 0.6 * s));
  let y = y0 + wh, w = c;
  for (let k = 0; k < 6; k++) {
    const nw = w * (k < 5 ? 0.86 : 0.7), hh = (1.05 - k * 0.07) * s;
    bag.add('sandstone', frustum([cx - w - 0.1 * s, cz - w - 0.1 * s, cx + w + 0.1 * s, cz + w + 0.1 * s], y, y + 0.18 * s, 0.1 * s, 0.1 * s, 0.1 * s, 0.1 * s));
    bag.add('sandstone', frustum([cx - w, cz - w, cx + w, cz + w], y + 0.18 * s, y + hh, w - nw, w - nw, w - nw, w - nw));
    y += hh; w = nw;
  }
  bag.add('sandstone_dressed', lathe([[w * 1.35, 0], [w * 1.4, 0.2 * s], [w * 1.0, 0.4 * s], [w * 0.5, 0.5 * s]], 12, null, cx, y, cz));
  bag.add('gilt_bronze', lathe([[0.25 * s, 0], [0.3 * s, 0.25 * s], [0.12 * s, 0.6 * s], [0.04 * s, 1.3 * s], [0.001, 1.6 * s]], 8, null, cx, y + 0.5 * s, cz));
}

/** newar_chaitya { c, s }: a small stupa — a stone plinth, a white dome, the square harmika with its eyes, the thirteen gilt rings of the spire. */
export function chaitya(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 1;
  bag.add(STONE, box(cx - 0.85 * s, 0, cz - 0.85 * s, cx + 0.85 * s, 0.5 * s, cz + 0.85 * s)); col.rect([cx - 0.85 * s, cz - 0.85 * s, cx + 0.85 * s, cz + 0.85 * s], 0, 0.5 * s);
  bag.add('limewash_white', lathe([[0.7 * s, 0], [0.72 * s, 0.15 * s], [0.5 * s, 0.6 * s], [0.001, 0.8 * s]], 12, null, cx, 0.5 * s, cz));
  bag.add('gilt_bronze', box(cx - 0.25 * s, 1.3 * s, cz - 0.25 * s, cx + 0.25 * s, 1.55 * s, cz + 0.25 * s));
  const rings = []; for (let k = 0; k < 13; k++) rings.push([0.2 * s * (1 - k / 14) + 0.02 * s, k * 0.05 * s], [0.2 * s * (1 - k / 14) + 0.06 * s, k * 0.05 * s + 0.02 * s]);
  bag.add('gilt_bronze', lathe([[0.001, 0], ...rings.map(([r, y]) => [r, y]), [0.02 * s, 0.7 * s], [0.001, 0.95 * s]], 8, null, cx, 1.55 * s, cz));
}
