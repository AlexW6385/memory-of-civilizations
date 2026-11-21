// The temples of Taumadhi (docs/settlements/bhaktapur.md §1, §4): the five-roofed pagoda on its stepped plinth
// with its pairs of guardians, the same in three roofs for the Bhairabnath, the stone shikhara and the chaitya.

import { box, lathe, rod, frustum, fromTriangles, orientOutward } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { guardian } from './guardians.js';

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

/** The profile of a pagoda roof from eave (t = 0) to its top (t = 1): a gentle sag, as the Newar roofs are drawn. */
const prof = (t) => t - 0.1 * Math.sin(Math.PI * t);

/**
 * The roof of a tier as the real ones are: four facets of pan-and-roll tile courses (a zigzag across the slope, every 0.34 m) on a sagging
 * profile, the eave edge rising at the corners by U, a thick red fascia that follows it, and the dark underside of the overhang.
 * (ex, ez) its centre, hw the eave half-width, top the half-width where it meets the wall above, ye the eave height, rise its height.
 */
function tileRoof(bag, ex, ez, hw, top, ye, rise, U, seed) {
  const NT = 4, NU = Math.max(20, 2 * Math.round(hw / 0.25)), amp = 0.04;
  const lift = (u, t) => U * Math.abs(u) ** 4 * (1 - t) ** 1.5;
  const tri = (out, a, b, c, h) => {
    const n = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    if (n[0] * h[0] + n[1] * h[1] + n[2] * h[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
  };
  const top3 = [], under = [], fascia = [], trim = [];
  const eps = ((seed * 7 + 3) % 5) * 0.0004;                       // a hair apart from the other tiers' pieces
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const px = -dz, pz = dx, hint = [dx * 0.4, 1, dz * 0.4], hdn = [-dx * 0.4, -1, -dz * 0.4];
    const P = (u, t, off = 0, drop = 0) => { const r = hw - (hw - top) * t, y = ye + rise * prof(t) + lift(u, t) + off - drop; return [ex + dx * r + px * u * r, y, ez + dz * r + pz * u * r]; };
    const V = [], W = [];
    for (let j = 0; j <= NT; j++) {
      const t = j / NT, row = [], rw = [];
      for (let i = 0; i <= NU; i++) {
        const u = -1 + 2 * i / NU, fade = Math.min(1, (1 - Math.abs(u)) * hw / 0.4) * (j === NT ? 0.4 : 1);
        row.push(P(u, t, (i & 1) * amp * fade + eps));
        rw.push(P(u, t, 0, 0.16));
      }
      V.push(row); W.push(rw);
    }
    for (let j = 0; j < NT; j++) for (let i = 0; i < NU; i++) {
      tri(top3, V[j][i], V[j][i + 1], V[j + 1][i + 1], hint); tri(top3, V[j][i], V[j + 1][i + 1], V[j + 1][i], hint);
    }
    // the underside: coarse (it is smooth), every fourth column
    for (let j = 0; j < NT; j++) for (let i = 0; i < NU; i += 4) {
      const i1 = Math.min(NU, i + 4);
      tri(under, W[j][i], W[j][i1], W[j + 1][i1], hdn); tri(under, W[j][i], W[j + 1][i1], W[j + 1][i], hdn);
    }
    // the fascia: a red board 0.38 high and 0.1 thick at the eave edge, rising with the corners; a gilt moulding along its foot
    for (let i = 0; i < NU; i += 4) {
      const u0 = -1 + 2 * i / NU, u1 = -1 + 2 * Math.min(NU, i + 4) / NU;
      const o = (u, dd, y) => { const p = P(u, 0, 0, 0); return [p[0] - dx * dd, p[1] + y, p[2] - dz * dd]; };
      const a = o(u0, 0, -0.38), b = o(u1, 0, -0.38), c = o(u1, 0, 0), d = o(u0, 0, 0);
      tri(fascia, a, b, c, [dx, 0, dz]); tri(fascia, a, c, d, [dx, 0, dz]);
      const g0 = o(u0, -0.03, -0.38), g1 = o(u1, -0.03, -0.38), g2 = o(u1, -0.03, -0.3), g3 = o(u0, -0.03, -0.3);
      tri(trim, g0, g1, g2, [dx, 0, dz]); tri(trim, g0, g2, g3, [dx, 0, dz]);
    }
  }
  bag.add('roof_tile', fromTriangles(top3)); bag.add('timber_red', fromTriangles(under));
  bag.add('timber_red', fromTriangles(fascia)); bag.add('gilt_bronze', fromTriangles(trim));
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
    // a moulded stone base course, a string course under the coping, and stone pilaster strips dividing the brick face into panels [inferred]
    const pe = (a, b, c, d, e2, f) => bag.add(STONE, box(a, b, c, d, e2, f));
    const y0 = k * h;
    pe(r[0] - 0.1, y0, r[1] - 0.1, r[2] + 0.1, y0 + 0.25, r[3] + 0.1);
    pe(r[0] - 0.03, y1 - 0.34, r[1] - 0.03, r[2] + 0.03, y1 - 0.24, r[3] + 0.03);
    const np = Math.max(2, Math.round(P.hw[k] / 1.6));
    for (let j = 1; j < np; j++) { const v = -P.hw[k] + 2 * P.hw[k] * j / np; pe(r[0] - 0.03, y0 + 0.28, cz + v - 0.14, r[0], y1 - 0.34, cz + v + 0.14); pe(r[2], y0 + 0.28, cz + v - 0.14 - 0.0004 * j, r[2] + 0.03, y1 - 0.34, cz + v + 0.14); pe(X(0) + v - 0.14 - 0.0004 * j, y0 + 0.28, r[3], X(0) + v + 0.14, y1 - 0.34, r[3] + 0.03); pe(X(0) + v - 0.14, y0 + 0.28, r[1] - 0.03, X(0) + v + 0.14, y1 - 0.34, r[1]); }
    col.rect(r, 0, y1); col.floor(r, y1);
  }
  const W = P.stair ?? 4.4, m = 4;
  for (let k = 0; k < n; k++) for (let j = 1; j <= m; j++) {
    const r = rect(uFace[k], -W / 2, uFace[k] + (m - j + 1) * 0.35, W / 2), t = k * h + j * h / m;
    bag.add(STONE, box(r[0], 0, r[1], r[2], t, r[3])); col.rect(r, 0, t); col.floor(r, t);
  }
  const kinds = el.guard ?? ['wrestler', 'elephant', 'lion', 'griffin', 'goddess'];
  for (let k = 0; k < n && k < kinds.length; k++) for (const v of [-1, 1]) guardian(bag, col, kinds[k], X(uFace[k] + 1.25), k * h, cz + v * (W / 2 + 1.05), sx, 0.85 + 0.12 * k, v);
  // the four Ganesh shrines at the corners of the first stage and the stone tap on its north face [stated: bhaktapur.com; the shrines' form inferred]
  if (el.corner) {
    const hw0 = P.hw[0], c = 0.26, y0 = h, sq = (u, v, r, a, b) => bx(X(u - r), a, cz + v - r, X(u + r), b, cz + v + r);
    for (const [u, v] of [[uFace[0] - 0.9, -hw0 + 0.45], [uFace[0] - 0.9, hw0 - 0.45], [-hw0 + 0.45, -hw0 + 0.45], [-hw0 + 0.45, hw0 - 0.45]]) {
      bag.add(STONE, sq(u, v, 0.36, y0, y0 + 0.12));
      bag.add('sandstone', sq(u, v, c, y0 + 0.12, y0 + 0.62));
      bag.add('opening', bx(X(u + c) - sx * 0.02, y0 + 0.2, cz + v - 0.15, X(u + c) + sx * 0.03, y0 + 0.5, cz + v + 0.15));
      bag.add('cloth_red', lathe([[0.1, 0], [0.11, 0.06], [0.08, 0.16], [0.07, 0.24], [0.03, 0.3], [0.001, 0.3]], 7, null, X(u + c - 0.1), y0 + 0.2, cz + v));
      bag.add('timber', sq(u, v, 0.31, y0 + 0.62, y0 + 0.68));
      bag.add('roof_tile', frustum([Math.min(X(u - 0.32), X(u + 0.32)), cz + v - 0.32, Math.max(X(u - 0.32), X(u + 0.32)), cz + v + 0.32], y0 + 0.68, y0 + 0.92, 0.2, 0.2, 0.2, 0.2));
      bag.add('gilt_bronze', lathe([[0.04, 0], [0.05, 0.05], [0.015, 0.2], [0.001, 0.26]], 6, null, X(u), y0 + 0.92, cz + v));
      col.rect([Math.min(X(u - 0.36), X(u + 0.36)), cz + v - 0.36, Math.max(X(u - 0.36), X(u + 0.36)), cz + v + 0.36], y0, y0 + 0.9);
    }
    // the stone tap: a spout (a makara's snout) through the north face into a stone basin
    const ut = uFace[0] - 5.2, zf = cz - hw0, sp = (a, b, c2, d, e, f) => bag.add(STONE, bx(X(a), b, zf + c2, X(d), e, zf + f));
    sp(ut - 0.22, 0.5, -0.08, ut + 0.22, 0.82, 0.04); sp(ut - 0.14, 0.52, -0.5, ut + 0.14, 0.72, -0.08); sp(ut - 0.08, 0.5, -0.5, ut + 0.08, 0.54, -0.1);
    bag.add(STONE, lathe([[0.62, 0], [0.62, 0.34], [0.54, 0.34], [0.54, 0.08], [0.001, 0.08]], 12, null, X(ut), 0, zf - 0.95));
    col.rect([Math.min(X(ut - 0.62), X(ut + 0.62)), zf - 1.57, Math.max(X(ut - 0.62), X(ut + 0.62)), zf - 0.33], 0, 0.34);
  }
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
    // the carved cornice beam and the base band of the tier's wall, and its corner posts [inferred: the usual Newar framing of a brick storey]
    if (!(i === 0 && el.chamber)) {
      bag.add('timber_red', bx(c0[0] - 0.12, ye - 0.58, c0[1] - 0.12, c0[2] + 0.12, ye - 0.26, c0[3] + 0.12));
      bag.add('gilt_bronze', bx(c0[0] - 0.14, ye - 0.4, c0[1] - 0.14, c0[2] + 0.14, ye - 0.36, c0[3] + 0.14));
      bag.add('timber_red', bx(c0[0] - 0.07, yb, c0[1] - 0.07, c0[2] + 0.07, yb + 0.24, c0[3] + 0.07));
      for (const sa of [-1, 1]) for (const sb of [-1, 1]) { const qx = cx + sa * q.core, qz = cz + sb * q.core; bag.add('timber_red', bx(qx - 0.16, yb + 0.24, qz - 0.16, qx + 0.16, ye - 0.58, qz + 0.16)); }
    }
    // the colonnade of the ground tier: 20 wooden columns, six to a face, each on a stone base and under a carved bracket (meth), under a tie beam [stated: khwopa-raks, 'colonnade of wooden poles and pillars', 20 columns, 6 on each face]
    if (i === 0 && el.colonnade) {
      const cc = q.core + 0.38, ring = [];
      for (let k = 0; k < 6; k++) { const v = -cc + 2 * cc * k / 5; ring.push([cc, v], [-cc, v]); if (k > 0 && k < 5) ring.push([v, cc], [v, -cc]); }
      ring.forEach(([a, b], k) => {
        const qx = cx + a, qz = cz + b, th = 0.0004 * (k % 5);
        bag.add(STONE, bx(qx - 0.3, yb, qz - 0.3, qx + 0.3, yb + 0.22, qz + 0.3));
        bag.add('timber_red', lathe([[0.2 + th, 0], [0.19, 0.3], [0.17, 1.2], [0.16, 2.0]], 8, null, qx, yb + 0.22, qz));
        bag.add('gilt_bronze', lathe([[0.215 + th, 0], [0.215, 0.05], [0.17, 0.06]], 8, null, qx, yb + 0.22, qz));
        bag.add('timber_red', bx(qx - 0.26, ye - 0.58, qz - 0.26, qx + 0.26, ye - 0.3, qz + 0.26));
        col.circle(qx, qz, 0.22, yb, ye - 0.3);
      });
      // the tie beam over the columns, its face carved with a gilt band
      const bw = cc + 0.26;
      for (const [a0, b0, a1, b1] of [[-bw, -bw, bw, -cc + 0.26], [-bw, cc - 0.26, bw, bw], [-bw, -cc + 0.26, -cc + 0.26, cc - 0.26], [cc - 0.26, -cc + 0.26, bw, cc - 0.26]]) bag.add('timber_red', bx(cx + a0, ye - 0.3, cz + b0, cx + a1, ye - 0.04, cz + b1));
      bag.add('gilt_bronze', bx(cx - bw - 0.02, ye - 0.22, cz - bw - 0.02, cx + bw + 0.02, ye - 0.16, cz + bw + 0.02));
    }
    // the openings of the tier: a door on the front at the first, a lattice window on every face above [stated: a chamber with gates on the four sides — oocities]
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const dw = 0.75, door = i === 0 && dx === sx, w = door ? 0.9 : Math.min(0.8, 0.25 * q.core + 0.2), hh = door ? 2.0 : 1.45, y0 = door ? yb : yb + 0.6, off = 0.03;
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
        const nb = 8;
        for (let k = 1; k < nb; k++) { const t = -w + 2 * w * k / nb; fb('wood_dark', t - 0.014, t + 0.014, y0, y0 + hh, 0.0, 0.05); }
        for (let k = 1; k < 6; k++) { const yy = y0 + hh * k / 6; fb('wood_dark', -w, w, yy - 0.014, yy + 0.014, 0.0, 0.05); }
        // a carved lintel board with three gilt roundels over the head, stepped gilt cornice, brackets under the sill [inferred from the Newar window's form]
        fb('timber_red', -w - 0.3, w + 0.3, y0 + hh + 0.14, y0 + hh + 0.46, 0.0, 0.12);
        for (const t of [-w * 0.6, 0, w * 0.6]) fb('gilt_bronze', t - 0.09, t + 0.09, y0 + hh + 0.2, y0 + hh + 0.4, 0.12, 0.15);
        fb('gilt_bronze', -w - 0.36, w + 0.36, y0 + hh + 0.46, y0 + hh + 0.52, 0.0, 0.2);
        fb('gilt_bronze', -0.14, 0.14, y0 + hh + 0.52, y0 + hh + 0.72, 0.04, 0.14);
        fb('timber_red', -w - 0.1, w + 0.1, y0 - 0.1, y0 - 0.04, 0.06, 0.24);
        for (const t of [-w * 0.8, w * 0.8]) fb('timber_red', t - 0.05, t + 0.05, y0 - 0.34, y0 - 0.1, 0.06, 0.24);
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
    // the eave: a red fascia that rises with the upturned corners, the roof of tile courses on a sagging profile, gilt hip ridges ending in curls
    const e = rect(-q.hw, -q.hw, q.hw, q.hw), ex = (e[0] + e[2]) / 2, ez = (e[1] + e[3]) / 2;
    const U = 0.04 * q.hw, lf = (u, t) => U * Math.abs(u) ** 4 * (1 - t) ** 1.5;
    tileRoof(bag, ex, ez, q.hw, next, ye, q.rise, U, i);
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      // the hip ridge, a gilt rod along the corner, and at the eave the curl of its end
      const pts = []; for (let j = 0; j <= 6; j++) { const t = j / 6, r = q.hw - run * t; pts.push([ex + a * r, ye + q.rise * prof(t) + lf(1, t) + 0.07, ez + b * r]); }
      for (let j = 0; j < 6; j++) bag.add('gilt_bronze', rod(pts[j], pts[j + 1], 0.075, 5));
      const c0 = [ex + a * (q.hw + 0.02), ye + lf(1, 0) + 0.02, ez + b * (q.hw + 0.02)], k = 0.7071;
      bag.add('gilt_bronze', rod(c0, [c0[0] + a * 0.16 * k, c0[1] + 0.18, c0[2] + b * 0.16 * k], 0.06, 5));
      bag.add('gilt_bronze', rod([c0[0] + a * 0.16 * k, c0[1] + 0.18, c0[2] + b * 0.16 * k], [c0[0] + a * 0.1 * k, c0[1] + 0.42, c0[2] + b * 0.1 * k], 0.042, 5));
      bag.add('gilt_bronze', rod([c0[0] + a * 0.1 * k, c0[1] + 0.42, c0[2] + b * 0.1 * k], [c0[0] - a * 0.06 * k, c0[1] + 0.56, c0[2] - b * 0.06 * k], 0.026, 5));
    }
    // the struts, at 45° from the wall to the eave, each a carved board with the forms of the Devi [stated: 108 on the Nyatapola — 7, 6, 6, 5, 3 on each face]
    const ns = el.struts ? el.struts[i] : Math.max(3, Math.round(q.hw / 1.35));
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let s = 0; s < ns; s++) {
      const v = (-q.core + 0.6) + (2 * q.core - 1.2) * (ns > 1 ? s / (ns - 1) : 0.5), ou = Math.min(ov * 0.82, 2.4), bo = i === 0 && el.colonnade ? 0.58 : 0;
      const p0 = [cx + (dx ? dx * (q.core + 0.04 + bo) : v), ye - 0.3 - ou, cz + (dz ? dz * (q.core + 0.04 + bo) : v)], p1 = [cx + (dx ? dx * (q.core + ou + bo) : v), ye - 0.38, cz + (dz ? dz * (q.core + ou + bo) : v)];
      tunal(bag, p0, p1, dx ? [0, 0, 1] : [1, 0, 0], Math.min(0.4, 0.2 + 0.07 * q.hw));
    }
    // the bells along the eave [stated: 528 wind bells, the most on the lowest roof]
    const nb = Math.round(el.bells ? el.bells[i] : 8 * q.hw / 0.9 / 4);
    const per = 8 * q.hw;
    for (let b = 0; b < nb; b++) {
      let d = (b + 0.5) / nb * per, x, z;
      if (d < 2 * q.hw) { x = ex - q.hw + d; z = ez - q.hw; } else if (d < 4 * q.hw) { x = ex + q.hw; z = ez - q.hw + (d - 2 * q.hw); } else if (d < 6 * q.hw) { x = ex + q.hw - (d - 4 * q.hw); z = ez + q.hw; } else { x = ex - q.hw; z = ez + q.hw - (d - 6 * q.hw); }
      const bu = Math.min(Math.abs(x - ex), Math.abs(z - ez)) / q.hw;
      bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.07, 0.16], [0.03, 0.22], [0.001, 0.22]], 5, null, x, ye - 0.62 + lf(bu, 0), z));
    }
    yb = ye + q.rise - 0.15;
  });
  // the pinnacle: a gilt vase, umbrellas and a spire
  const last = R[R.length - 1], top = yb + 0.15;
  bag.add('gilt_bronze', lathe([[0.7, 0], [0.7, 0.14], [0.45, 0.22], [0.62, 0.55], [0.3, 0.95], [0.4, 1.1], [0.16, 1.4], [0.55, 1.5], [0.55, 1.55], [0.14, 1.7], [0.28, 2.1], [0.09, 2.5], [0.035, 3.4], [0.001, 3.6]], 10, null, cx, top, cz));
  // three gilt umbrellas (chhatras) on the spire, each smaller than the one below [inferred: the form of a Newar gajur]
  for (const [y, r] of [[2.35, 0.52], [2.8, 0.42], [3.2, 0.32]]) bag.add('gilt_bronze', lathe([[r, 0], [r + 0.03, 0.04], [r * 0.6, 0.15], [0.05, 0.24], [0.001, 0.26]], 12, null, cx, top + y, cz));
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
