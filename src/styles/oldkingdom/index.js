// Old Kingdom Egyptian architecture (Giza, 4th dynasty, c. 2560 BC; docs/settlements/giza.md §4–§5):
// the true pyramid cased in polished white limestone; temples of granite pillars and basalt
// pavements behind plain limestone walls; the covered causeway; mastaba tombs with battered walls
// in streets; the workers' town of mudbrick — galleries (long halls), bakeries, houses with flat
// roofs and courtyards — and the great stone Wall of the Crow with its tunnel gate.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris, flipTris } from '../ming/index.js';
import { loft, ring } from '../egyptian/objects.js';
import { pyramidInterior } from './interior.js';
import { sphinx } from './sphinx.js';
import { paintChapel } from './chapel.js';
import { khafreTemple, statue } from './khafre.js';
import { houseFront, houseRoof, mastabaWear, galleryOutside, bakeryShade, yard, lane, cemetery, magazines, quay } from './dress.js';
import { quarry, track, tools } from './quarry.js';
import { ramp, shade, casingStones } from './works.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A frustum over a rectangle centred at (cx, cz): half-sizes (a0, b0) at y0 to (a1, b1) at y1. */
function frust(bag, mat, cx, cz, a0, b0, a1, b1, y0, y1) {
  const B = [[-a0, -b0], [a0, -b0], [a0, b0], [-a0, b0]], T = [[-a1, -b1], [a1, -b1], [a1, b1], [-a1, b1]], t = [];
  const P = (q, y) => [cx + q[0], y, cz + q[1]];
  // (wound counter-clockwise seen from outside)
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...P(B[i], y0), ...P(T[i], y1), ...P(T[j], y1), ...P(B[i], y0), ...P(T[j], y1), ...P(B[j], y0)); }
  if (a1 > 0.01) t.push(...P(T[0], y1), ...P(T[3], y1), ...P(T[2], y1), ...P(T[0], y1), ...P(T[2], y1), ...P(T[1], y1));
  bag.add(mat, fromTriangles(t));
}

/** The four faces of a pyramid's casing up to the pyramidion, in pieces of about 6 m (the top field takes a triangle's
 *  points with a tolerance proportional to its size: great triangles would reach over the arrises and over an
 *  opening); `door` [x0, y0, x1, y1] (east–west from the centre and heights, optional): the entrance left open in the
 *  north face, a window of 2 m pieces round it. */
function casing(bag, mat, cx, cz, a, h, ph, y, door) {
  const t = [], top = h - ph, half = (v) => a * (1 - v / h);
  // a point of face f (north, east, south, west) at u (along the foot, to the left seen from outside) and height v
  const FACE = [(u, v) => [cx + u, y + v, cz - half(v)], (u, v) => [cx + half(v), y + v, cz + u], (u, v) => [cx - u, y + v, cz + half(v)], (u, v) => [cx - half(v), y + v, cz - u]];
  const quad = (f, p, q, r, s, size = 6) => {
    const L = (A, B) => Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(1, Math.ceil(Math.max(L(p, q), L(s, r)) / size)), m = Math.max(1, Math.ceil(Math.max(L(p, s), L(q, r)) / size));
    const at = (i, j) => { const a0 = [p[0] + (q[0] - p[0]) * i / n, p[1] + (q[1] - p[1]) * i / n], a1 = [s[0] + (r[0] - s[0]) * i / n, s[1] + (r[1] - s[1]) * i / n]; return FACE[f](a0[0] + (a1[0] - a0[0]) * j / m, a0[1] + (a1[1] - a0[1]) * j / m); };
    // (wound counter-clockwise seen from outside)
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) t.push(...at(i, j), ...at(i + 1, j + 1), ...at(i + 1, j), ...at(i, j), ...at(i, j + 1), ...at(i + 1, j + 1));
  };
  for (let f = 1; f < 4; f++) quad(f, [-half(0), 0], [half(0), 0], [half(top), top], [-half(top), top]);
  if (!door) quad(0, [-half(0), 0], [half(0), 0], [half(top), top], [-half(top), top]);
  else {
    const [u0, v0, u1, v1] = door, U0 = u0 - 12, U1 = u1 + 12, V0 = Math.max(0, v0 - 8), V1 = v1 + 12;
    if (V0 > 0) quad(0, [-half(0), 0], [half(0), 0], [half(V0), V0], [-half(V0), V0]);
    quad(0, [-half(V0), V0], [U0, V0], [U0, V1], [-half(V1), V1]);
    quad(0, [U1, V0], [half(V0), V0], [half(V1), V1], [U1, V1]);
    quad(0, [-half(V1), V1], [half(V1), V1], [half(top), top], [-half(top), top]);
    const cuts = (a0, a1) => { const n = Math.max(1, Math.ceil((a1 - a0) / 2)); return Array.from({ length: n + 1 }, (_, i) => a0 + (a1 - a0) * i / n); };
    const us = [...cuts(U0, u0), ...cuts(u0, u1).slice(1), ...cuts(u1, U1).slice(1)], vs = [...cuts(V0, v0), ...cuts(v0, v1).slice(1), ...cuts(v1, V1).slice(1)];
    for (let i = 0; i < us.length - 1; i++) for (let j = 0; j < vs.length - 1; j++) {
      if (us[i] >= u0 - 1e-6 && us[i + 1] <= u1 + 1e-6 && vs[j] >= v0 - 1e-6 && vs[j + 1] <= v1 + 1e-6) continue;   // the opening
      quad(0, [us[i], vs[j]], [us[i + 1], vs[j]], [us[i + 1], vs[j + 1]], [us[i], vs[j + 1]], 3);
    }
  }
  bag.add(mat, fromTriangles(t));
}

/**
 * ok_pyramid: a true pyramid { c, a (half the base), h, mat }: the faces of polished casing stone
 * on a pavement's edge, the apex a gilded capstone; the slope walkable (one can climb it, slowly,
 * as the faces are smooth only to the eye).
 */
function okPyramid(el, { bag, col }) {
  const [cx, cz] = el.c, a = el.a, h = el.h, y = el.y ?? 0;
  // the casing up to the foot of the pyramidion, the pyramidion gilded (electrum) at the top
  const ph = Math.min(3, h * 0.03), ap = a * ph / h;
  casing(bag, el.mat || 'tura_limestone', cx, cz, a, h, ph, y, el.door);
  frust(bag, 'gilt_bronze', cx, cz, ap, ap, 0, 0, y + h - ph, y + h);
  frust(bag, 'tura_limestone', cx, cz, a + 0.6, a + 0.6, a, a, y - 0.4, y + 0.3);                 // the pavement's edge
  // climbing the faces: each face as strips of ramps, from the foot up to where the strip meets the
  // arrises (the triangle of the face, approximated)
  const n = 40;
  for (let i = 0; i < n; i++) {
    const u0 = -a + 2 * a * i / n, u1 = -a + 2 * a * (i + 1) / n;
    // how far in the strip climbs: to the arris its nearer edge meets (on past the arris a little where the strip is
    // crossed by it: every point of the face lies on its own face's ramp, at the face's own height)
    const reach = a - (u0 * u1 < 0 ? 0 : Math.min(Math.abs(u0), Math.abs(u1)));
    if (reach <= 0.5) continue;
    const top = y + h * reach / a;
    const D = el.door;
    if (D && u1 > D[0] && u0 < D[2]) {
      // the north face round the entrance: beside it as before; in its width up to its sill and on from its head
      if (D[0] > u0) col.ramp([cx + u0, cz - a, cx + D[0], cz - a + reach], y, top, 's');
      if (D[2] < u1) col.ramp([cx + D[2], cz - a, cx + u1, cz - a + reach], y, top, 's');
      const d0 = D[1] * a / h, d1 = D[3] * a / h;
      col.ramp([cx + D[0], cz - a, cx + D[2], cz - a + d0], y, y + D[1], 's');
      if (reach > d1) col.ramp([cx + D[0], cz - a + d1, cx + D[2], cz - a + reach], y + D[3], top, 's');
    } else col.ramp([cx + u0, cz - a, cx + u1, cz - a + reach], y, top, 's');               // the north face
    col.ramp([cx + u0, cz + a - reach, cx + u1, cz + a], y, top, 'n');               // the south face
    col.ramp([cx - a, cz + u0, cx - a + reach, cz + u1], y, top, 'e');               // the west face
    col.ramp([cx + a - reach, cz + u0, cx + a, cz + u1], y, top, 'w');               // the east face
  }
}

/**
 * mastaba: a tomb of Khufu's cemeteries (docs/settlements/giza.md §4.4) { c, a, b (half-sizes: a east–west, b
 * north–south, the long axis), h, mat, seed }: the core of great limestone blocks in stepped courses (or, cased in
 * fine Tura stone, a smooth battered face), a flat top; at the south end of the east face the slab stela set into the
 * stone — the owner seated at the table of offerings, with the lists of his offerings — enclosed in a small chapel of
 * mud brick with its door to the east and a roof of palm logs and mud; an offering basin before the stela, bread and
 * a beer jar on it.
 */
function mastaba(el, { bag, col }) {
  const [cx, cz] = el.c, { a, b, h } = el, rand = rng(el.seed ?? Math.floor(cx * 31 + cz * 17)), cased = el.mat === 'tura_limestone';
  const batter = h * 0.13, n = Math.max(3, Math.round(h / 0.8)), m = el.mat || 'limestone_core';
  const half = (y) => (cased ? batter * y / h : batter * Math.min(n - 1, Math.floor(y / h * n)) / (n - 1));      // how far the face has stepped in at y
  if (cased) frust(bag, m, cx, cz, a, b, a - batter, b - batter, 0, h);
  else for (let k = 0; k < n; k++) { const i = batter * k / (n - 1), y0 = h * k / n, y1 = h * (k + 1) / n; bag.add(m, box(cx - a + i, k ? y0 : -0.3, cz - b + i, cx + a - i, y1, cz + b - i)); }
  bag.add('limestone_core', box(cx - a + batter + 0.15, h, cz - b + batter + 0.15, cx + a - batter - 0.15, h + 0.12, cz + b - batter - 0.15));
  col.rect([cx - a, cz - b, cx + a, cz + b], 0, h);
  col.floor([cx - a + batter, cz - b + batter, cx + a - batter, cz + b - batter], h + 0.12);
  mastabaWear(bag, { cx, cz, a, b, h, cased, seed: el.seed ?? Math.floor(cx * 31 + cz * 17) });
  // the slab stela in its emplacement near the south end of the east face, at the height of a kneeling offerer's eyes
  const sz = cz + b - 2.6, sy = 1.05, sw = 0.53, sh = 0.38, fx = cx + a - half(sy + 0.2);
  const S = (y0, z0, y1, z1, d0, d1, mat = 'limestone_carved') => bag.add(mat, box(fx + d0, sy + y0, sz + z0, fx + d1, sy + y1, sz + z1));
  S(-0.04, -sw / 2 - 0.04, sh + 0.04, sw / 2 + 0.04, -0.02, 0.025, 'limestone_core');                         // the emplacement's frame
  S(0, -sw / 2, sh, sw / 2, 0.025, 0.05);                                                                   // the slab
  // in relief (facing east, the owner on the south looking north): the seat with its bull's legs, the figure, the table of loaves
  // (painted, as the slab stelae were: the man red-brown, his kilt white, the loaves yellow, the signs blue and green)
  const R = (y0, z0, y1, z1, mat, d = 0.068) => S(y0, z0, y1, z1, 0.05, d, mat);
  R(0.04, 0.06, 0.09, 0.17, 'timber'); R(0.04, 0.16, 0.08, 0.18, 'timber');                                   // the stool and its leg
  R(0.09, 0.08, 0.17, 0.15, 'plaster_white');                                                                // the kilt
  R(0.17, 0.09, 0.27, 0.14, 'paint_robe'); R(0.27, 0.095, 0.31, 0.135, 'paint_robe'); R(0.2, 0.03, 0.22, 0.1, 'paint_robe');   // the body, the head, the arm reaching out
  R(0.29, 0.1, 0.32, 0.14, 'lacquer_black', 0.074);                                                                 // the wig
  R(0.035, 0.03, 0.1, 0.06, 'paint_robe'); R(0.02, 0.015, 0.035, 0.06, 'paint_robe');                        // the shins and the feet
  R(0.04, -0.075, 0.1, -0.04, 'terracotta'); R(0.1, -0.068, 0.12, -0.047, 'terracotta');                      // a jar under the table
  R(0.04, -0.02, 0.15, 0.0, 'paint_ochre'); R(0.15, -0.09, 0.165, 0.05, 'paint_ochre');                     // the table's stand and top
  for (let k = 0; k < 6; k++) R(0.165, -0.08 + k * 0.022, 0.2 + 0.035 * Math.sin(k / 5 * Math.PI), -0.069 + k * 0.022, 'limewash_yellow');   // the half loaves standing on it
  for (let k = 0; k < 4; k++) R(0.05, -0.24 + k * 0.035, 0.33, -0.225 + k * 0.035, k % 2 ? 'fresco_green' : 'egyptian_blue');   // the columns of the offering list
  R(0.33, -0.25, 0.345, 0.25, 'egyptian_blue');
  // the chapel of mud brick round it
  const th = 0.45, cd = 2.9, cw = 3.4, H = 2.3, x0 = cx + a, x1 = x0 + cd, z0 = sz - cw / 2, z1 = sz + cw / 2, xin = cx + a - batter - 0.1;
  const W = (r, y0, y1, mat = 'mudbrick') => { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  W([xin, z0, x1, z0 + th], -0.2, H); W([xin, z1 - th, x1, z1], -0.2, H);
  const dz = sz + (rand() - 0.5) * 0.6, dw = 0.85, dh = 1.75;
  W([x1 - th, z0 + th, x1, dz - dw / 2], -0.2, H); W([x1 - th, dz + dw / 2, x1, z1 - th], -0.2, H); W([x1 - th, dz - dw / 2, x1, dz + dw / 2], dh + 0.15, H);
  bag.add('palm_trunk', box(x1 - th - 0.05, dh, dz - dw / 2 - 0.25, x1 + 0.03, dh + 0.15, dz + dw / 2 + 0.25));                    // the lintel
  bag.add('mud_plaster', box(x1 - th, -0.02, dz - dw / 2, x1, 0.04, dz + dw / 2));
  // the roof: palm logs laid across from wall to wall under a skin of mud
  const rx0 = cx + a - half(H) - 0.05;
  for (let x = rx0 + 0.2; x < x1 - 0.1; x += 0.3) bag.add('palm_trunk', lathe([[0.1, 0], [0.1, cw]], 7).rotateX(Math.PI / 2).translate(x, H - 0.1, z0));
  W([rx0, z0, x1, z1], H, H + 0.22, 'mud_plaster'); col.floor([rx0, z0, x1, z1], H + 0.22);
  // inside: the offering basin of limestone before the stela, loaves and a jar on it; the floor of beaten mud
  bag.add('mud_plaster', box(x0, -0.02, z0 + th, x1 - th, 0.03, z1 - th));
  paintChapel(bag, x0 + 0.05, x1 - th - 0.02, z0 + th, z1 - th, H, rand);
  const bx = x0 + 0.55, bw = 0.42, bd = 0.32;
  bag.add('limestone_core', box(bx - bd, 0.03, sz - bw, bx + bd, 0.12, sz + bw));
  for (const [p, q] of [[[bx - bd, sz - bw], [bx + bd, sz - bw + 0.06]], [[bx - bd, sz + bw - 0.06], [bx + bd, sz + bw]], [[bx - bd, sz - bw], [bx - bd + 0.06, sz + bw]], [[bx + bd - 0.06, sz - bw], [bx + bd, sz + bw]]]) bag.add('limestone_core', box(p[0], 0.12, p[1], q[0], 0.2, q[1]));
  col.rect([bx - bd, sz - bw, bx + bd, sz + bw], 0, 0.2);
  for (let k = 0; k < 3; k++) bag.add('limewash_yellow', lathe([[0.06, 0], [0.065, 0.03], [0.04, 0.07], [0.001, 0.08]], 8, null, bx - 0.1 + k * 0.1, 0.12, sz - 0.15 + (k % 2) * 0.12));
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.01], [0.11, 0.18], [0.1, 0.3], [0.05, 0.36], [0.055, 0.4], [0.001, 0.4]], 10, null, bx + 0.05, 0.12, sz + 0.2));
  if (rand() < 0.5) bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0.02], [0.13, 0.1], [0.12, 0.13], [0.001, 0.06]], 10, null, x0 + 0.45, 0.03, z1 - th - 0.35));
}

/**
 * ok_temple: a pyramid temple { rect, h, court: [x0, z0, x1, z1] (an open court within), pillars
 * (granite pillars round the court), door ('e' | 'w' | …) }: thick limestone walls, the court
 * paved with basalt, square pillars of red granite carrying architraves round it.
 */
function okTemple(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 7, th = 2.2, [c0, d0, c1, d1] = el.court;
  bag.add('basalt', box(x0, -0.2, z0, x1, 0.12, z1));
  col.floor([x0, z0, x1, z1], 0.12);
  const walls = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  const doorSide = { n: 0, e: 1, s: 2, w: 3 }[el.door || 'e'], back = (doorSide + 2) % 4;
  walls.forEach(([a, b], i) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const gaps = i === doorSide ? [[L / 2 - 2, L / 2 + 2]] : i === back && el.backDoor ? [[L / 2 - 2, L / 2 + 2]] : [];
    let s = 0;
    for (const [g0, g1] of [...gaps, [L, L]]) {
      if (g0 - s > 0.1) {
        const p = [a[0] + ux * s, a[1] + uz * s], q = [a[0] + ux * g0, a[1] + uz * g0], t = [];
        beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, h);
        bag.add('tura_limestone', fromTriangles(t));
        col.segment(p, q, th, 0, h);
      }
      s = g1;
    }
  });
  // roofed parts round the court: slabs from the walls to the pillars, their undersides painted as the night sky
  for (const [r, cs] of [[[x0, z0, x1, d0], 3], [[x0, d1, x1, z1], 1], [[x0, d0, c0, d1], 2], [[c1, d0, x1, d1], 0]]) if (r[2] - r[0] > 0.5 && r[3] - r[1] > 0.5) {
    bag.add('tura_limestone', box(r[0], h - 0.9, r[1], r[2], h, r[3]));
    const q = [Math.max(r[0], x0 + th / 2), Math.max(r[1], z0 + th / 2), Math.min(r[2], x1 - th / 2), Math.min(r[3], z1 - th / 2)];
    q[cs] += cs < 2 ? 0.7 : -0.7;                                         // clear of the architrave over the pillars
    if (q[2] > q[0] && q[3] > q[1]) bag.add('vault_stars', box(q[0], h - 0.93, q[1], q[2], h - 0.906, q[3]));
  }
  // the painted reliefs on the inner faces of the walls (the court's walls carried the king's jubilee): registers of
  // figures walking toward the temple's axis on blue ground lines, under a band of blue and a frieze of khekher knots
  const gapsOf = (i, L) => (i === doorSide || (i === back && el.backDoor) ? [[L / 2 - 2.6, L / 2 + 2.6]] : []);
  walls.forEach(([a, b], i) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;   // the inward normal
    const off = th / 2, gaps = gapsOf(i, L), regH = 1.95, top = h - 1.15, nReg = Math.max(1, Math.floor((top - 0.9) / regH)), F = Math.min(1.45, (top - 1.05) / 1.06);
    const P = (s, d) => [a[0] + ux * s + nx * (off + d), a[1] + uz * s + nz * (off + d)];
    const slab = (mat, s0, s1, y0, y1, d0, d1) => { const p = P(s0, d0), q = P(s1, d1); bag.add(mat, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
    const free = (s0, s1) => s0 > off + 0.3 && s1 < L - off - 0.3 && !gaps.some(([g0, g1]) => s1 > g0 && s0 < g1);
    // a polygon in the wall's plane — points [u (along the wall), v (up)] — raised d off the face
    const relief = (mat, pts, d) => {
      const T = [], W3 = (u, v, dd) => { const p = P(u, dd); return [p[0], v, p[1]]; };
      let ar = 0; for (let j = 0; j < pts.length; j++) { const p = pts[j], q = pts[(j + 1) % pts.length]; ar += p[0] * q[1] - q[0] * p[1]; }
      const Q = ar < 0 ? pts.slice().reverse() : pts;
      for (let j = 1; j < Q.length - 1; j++) T.push(...W3(...Q[0], d), ...W3(...Q[j], d), ...W3(...Q[j + 1], d));
      for (let j = 0; j < Q.length; j++) { const p = Q[j], q = Q[(j + 1) % Q.length]; T.push(...W3(...p, 0), ...W3(...q, 0), ...W3(...q, d), ...W3(...p, 0), ...W3(...q, d), ...W3(...p, d)); }
      bag.add(mat, fromTriangles(T));                    // counter-clockwise in (u, v) faces off the wall, the sides outward
    };
    // an offering bearer striding toward the wall's middle (dir +1 along the wall, −1 back): the near leg forward,
    // the kilt, the broad shoulders, the wig, one arm hanging and the other bringing what he carries
    const bearer = (s, y, dir, n) => {
      const G = (pts) => pts.map(([u, v]) => [s + dir * u * F, y + v * F]);
      relief('paint_robe', G([[-0.02, 0.47], [0.03, 0.47], [0.165, 0.02], [0.11, 0.02]]), 0.02);                      // the forward leg
      relief('paint_robe', G([[-0.04, 0.47], [0.01, 0.47], [-0.09, 0.02], [-0.14, 0.02]]), 0.018);                    // the back leg
      relief('paint_robe', G([[0.1, 0], [0.22, 0], [0.2, 0.025], [0.11, 0.03]]), 0.02); relief('paint_robe', G([[-0.15, 0], [-0.04, 0], [-0.06, 0.025], [-0.14, 0.03]]), 0.018);
      relief('plaster_white', G([[-0.075, 0.62], [0.075, 0.62], [0.15, 0.42], [-0.1, 0.43]]), 0.026);                // the kilt, its pleated front
      relief('paint_robe', G([[-0.06, 0.615], [0.06, 0.615], [0.12, 0.82], [0.05, 0.845], [-0.05, 0.845], [-0.12, 0.82]]), 0.022);   // the body
      relief('paint_robe', G([[-0.025, 0.84], [0.025, 0.84], [0.03, 0.87], [-0.025, 0.87]]), 0.022);                  // the neck
      relief('paint_robe', G([[-0.045, 0.87], [0.04, 0.87], [0.06, 0.9], [0.072, 0.925], [0.055, 0.935], [0.05, 0.97], [0.0, 0.99], [-0.045, 0.97]]), 0.022);   // the face in profile
      relief('lacquer_black', G([[-0.06, 0.885], [0.025, 0.95], [0.04, 0.985], [0.0, 1.005], [-0.055, 0.99], [-0.07, 0.94]]), 0.026);   // the wig
      relief('paint_robe', G([[-0.12, 0.82], [-0.08, 0.82], [-0.075, 0.5], [-0.105, 0.5]]), 0.018);                   // the far arm, hanging
      relief('paint_robe', G([[0.08, 0.82], [0.12, 0.8], [0.15, 0.68], [0.25, 0.71], [0.25, 0.74], [0.13, 0.725], [0.1, 0.8]]), 0.03);   // the near arm, held out
      const it = n % 4;
      if (it === 0) relief('limewash_yellow', G([[0.2, 0.74], [0.32, 0.74], [0.3, 0.78], [0.26, 0.8], [0.22, 0.78]]), 0.034);            // a loaf on the hand
      else if (it === 1) relief('terracotta', G([[0.22, 0.73], [0.27, 0.73], [0.29, 0.78], [0.27, 0.84], [0.265, 0.87], [0.235, 0.87], [0.225, 0.84], [0.205, 0.78]]), 0.034);   // a beer jar
      else if (it === 2) relief('fresco_green', G([[0.24, 0.74], [0.255, 0.74], [0.26, 0.9], [0.31, 0.97], [0.25, 0.94], [0.19, 0.97], [0.24, 0.9]]), 0.034);   // a lotus
      else relief('paint_ochre', G([[0.18, 0.74], [0.33, 0.745], [0.36, 0.78], [0.3, 0.8], [0.2, 0.79]]), 0.034);                         // a trussed fowl
    };
    for (let k = 0; k < nReg; k++) {
      const y = 0.9 + k * regH;
      for (const [s0, s1] of [[off + 0.3, L - off - 0.3]]) {
        let u = s0;
        for (const [g0, g1] of [...gaps, [L, L]]) { const e = Math.min(s1, g0); if (e - u > 0.5) slab('egyptian_blue', u, e, y - 0.05, y, 0, 0.02); u = Math.max(u, g1); }
      }
      const mid = L / 2;
      for (let s = off + 1.0; s < L - off - 0.8; s += 1.35) {
        if (!free(s - 0.5, s + 0.5)) continue;
        bearer(s, y, s < mid ? 1 : -1, Math.round(s / 1.35) + k);
      }
    }
    let u = off;
    for (const [g0, g1] of [...gaps, [L, L]]) {
      const e = Math.min(L - off, g0);
      if (e - u > 0.5) {
        slab('egyptian_blue', u, e, top, top + 0.08, 0, 0.02);
        for (let s = u + 0.15; s < e - 0.1; s += 0.22) slab('paint_ochre', s - 0.05, s + 0.05, top + 0.1, top + 0.2, 0, 0.02);
      }
      u = Math.max(u, g1);
    }
  });
  // the king's statues of dark stone against the ambulatory's inner walls, facing the court; in the court an altar with its offerings (docs §13)
  if (c1 - c0 > 20) {
    const face = ['s', 'w', 'n', 'e'];
    walls.forEach(([a, b], i) => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, gaps = i === doorSide || (i === back && el.backDoor) ? [L / 2 - 3.6, L / 2 + 3.6] : null;
      for (let s = 5; s < L - 4; s += 9) {
        if (gaps && s > gaps[0] && s < gaps[1]) continue;
        const px = a[0] + ux * s + nx * (th / 2 + 0.75), pz = a[1] + uz * s + nz * (th / 2 + 0.75);
        statue(bag, px, 0.12, pz, face[i]);
        col.rect([px - 0.55, pz - 0.55, px + 0.55, pz + 0.55], 0.12, 1.7);
      }
    });
    const ax = (c0 + c1) / 2, az = (d0 + d1) / 2;
    bag.add('granite_red', box(ax - 1.2, 0.12, az - 0.8, ax + 1.2, 0.9, az + 0.8)); bag.add('limestone_carved', box(ax - 1.3, 0.9, az - 0.9, ax + 1.3, 1.0, az + 0.9));
    col.rect([ax - 1.3, az - 0.9, ax + 1.3, az + 0.9], 0.12, 1.0);
    for (let k = 0; k < 7; k++) bag.add('limewash_yellow', lathe([[0.1, 0], [0.11, 0.05], [0.07, 0.12], [0.001, 0.14]], 8, null, ax - 0.9 + k * 0.3, 1.0, az - 0.3 + (k % 2) * 0.4));
    bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.22, 0.2], [0.2, 0.4], [0.1, 0.55], [0.11, 0.6], [0.001, 0.6]], 10, null, ax + 1.0, 1.0, az));
    for (const dx of [-3, 3]) { bag.add('basalt', lathe([[0.4, 0.12], [0.3, 0.5], [0.001, 0.55]], 8, null, ax + dx * 1.5, 0, az + 3)); }
  }
  // the pillars of red granite round the court, their architraves
  const n = el.pillars ?? 6;
  for (const [a, b] of [[[c0, d0], [c1, d0]], [[c1, d0], [c1, d1]], [[c1, d1], [c0, d1]], [[c0, d1], [c0, d0]]]) {
    for (let k = 0; k < n; k++) {
      const s = k / n, x = a[0] + (b[0] - a[0]) * s, z = a[1] + (b[1] - a[1]) * s;
      bag.add('granite_red', box(x - 0.55, 0.12, z - 0.55, x + 0.55, h - 0.9, z + 0.55));
      col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], 0, h);
    }
    const t = [];
    beamTris(t, [a[0], h - 1.6, a[1]], [b[0], h - 1.6, b[1]], 0.6, 0.7);
    bag.add('granite_red', fromTriangles(t));
  }
}

/** causeway: a covered corridor { a, b, w, h }: walls of limestone, a roof of slabs with a slit for light, the floor a ramp following the ground. */
function causeway(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, w = (el.w ?? 4.6) / 2, h = el.h ?? 5, ya = el.ya ?? 0, yb = el.yb ?? 0;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const n = Math.ceil(L / 6);
  for (let k = 0; k < n; k++) {
    const s0 = k / n, s1 = (k + 1) / n, y0 = ya + (yb - ya) * s0, y1 = ya + (yb - ya) * s1;
    const p0 = [ax + (bx - ax) * s0, az + (bz - az) * s0], p1 = [ax + (bx - ax) * s1, az + (bz - az) * s1];
    for (const s of [-1, 1]) {
      const open = el.gap && s === el.gap.side && k >= el.gap.from && k < el.gap.to;     // a doorway in this side wall: no wall, the roof stays as its lintel
      const t = [];
      if (!open) beamTris(t, [p0[0] + nx * (w + 0.7) * s, Math.min(y0, y1) - 1.5, p0[1] + nz * (w + 0.7) * s], [p1[0] + nx * (w + 0.7) * s, Math.min(y0, y1) - 1.5, p1[1] + nz * (w + 0.7) * s], 0.7, h + 1.5 + Math.abs(y1 - y0));
      if (!open) bag.add('tura_limestone', fromTriangles(t));
      if (!open) col.segment([p0[0] + nx * (w + 0.7) * s, p0[1] + nz * (w + 0.7) * s], [p1[0] + nx * (w + 0.7) * s, p1[1] + nz * (w + 0.7) * s], 1.4, Math.min(y0, y1) - 1.5, Math.max(y0, y1) + h);
      // the roof slabs, leaving a slit along the middle
      const r = [];
      beamTris(r, [p0[0] + nx * (w * 0.55) * s, Math.max(y0, y1) + h, p0[1] + nz * (w * 0.55) * s], [p1[0] + nx * (w * 0.55) * s, Math.max(y0, y1) + h, p1[1] + nz * (w * 0.55) * s], w * 0.45 + 0.7, 0.6);
      bag.add('tura_limestone', fromTriangles(r));
    }
    const f = [];
    beamTris(f, [p0[0], Math.min(y0, y1) - 1.5, p0[1]], [p1[0], Math.min(y0, y1) - 1.5, p1[1]], w, 1.5);
    bag.add('basalt', fromTriangles(f));
    const cx = (p0[0] + p1[0]) / 2, cz = (p0[1] + p1[1]) / 2, hx = Math.abs(ux) * L / n / 2 + Math.abs(nx) * w, hz = Math.abs(uz) * L / n / 2 + Math.abs(nz) * w;
    const dir = Math.abs(ux) > Math.abs(uz) ? (ux * (y1 - y0) > 0 ? 'e' : 'w') : (uz * (y1 - y0) > 0 ? 's' : 'n');
    if (Math.abs(y1 - y0) > 0.05) col.ramp([cx - hx, cz - hz, cx + hx, cz + hz], Math.min(y0, y1), Math.max(y0, y1), dir);
    else col.floor([cx - hx, cz - hz, cx + hx, cz + hz], y0);
  }
}

/**
 * mud_house: a house of the workers' town (docs/settlements/giza.md §5b) { rect, seed, furnish }: mudbrick walls
 * plastered with mud, the foot of the outer walls darker with the dirt of the lane; the door from the lane into the
 * court (or into the room where there is no court) with its palm-log lintel and stone threshold; the roofed part of
 * palm logs under mud. Furnished (AERA's Eastern Town House: "a main room with a sitting bench, and a sleeping niche";
 * "an area for grinding and storage facilities, pottery jars set in the floor, and a small circular granary"): in the
 * room a mud bench along the back wall and the sleeping niche walled off at one end, a mat and a headrest in it, the
 * logs of the roof seen from beneath; in the court a domed oven, the granary, jars sunk in the floor, the saddle quern
 * on its kerb, water and storage jars.
 */
function mudHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 2.6 + rand() * 0.6, th = 0.45;
  const W = x1 - x0, court = rand() < 0.7, split = court ? x0 + W * (0.45 + rand() * 0.2) : x1, F = !!el.furnish;
  const xd = court ? (split + x1) / 2 : (x0 + split) / 2, dw = 0.9;
  const seg = (p, q, mat = 'mud_plaster', y1 = h) => { const t = []; beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, y1); bag.add(mat, fromTriangles(t)); col.segment(p, q, th, 0, y1); };
  // the outer walls (the long ones run past the corners, the ends stop against them), the door in the south wall
  seg([x0 - th / 2, z0], [x1 + th / 2, z0]); seg([x0, z0 + th / 2], [x0, z1 - th / 2]); seg([x1, z0 + th / 2], [x1, z1 - th / 2]);
  seg([x0 - th / 2, z1], [xd - dw / 2, z1]); seg([xd + dw / 2, z1], [x1 + th / 2, z1]);
  bag.add('timber', box(xd - dw / 2 - 0.25, 1.95, z1 - th / 2 - 0.02, xd + dw / 2 + 0.25, 2.12, z1 + th / 2 + 0.02));
  bag.add('mud_plaster', box(xd - dw / 2 - 0.02, 2.11, z1 - th / 2 + 0.01, xd + dw / 2 + 0.02, h - 0.01, z1 + th / 2 - 0.01));
  bag.add('limestone_core', box(xd - dw / 2 + 0.01, -0.05, z1 - th / 2 - 0.05, xd + dw / 2 - 0.01, 0.08, z1 + th / 2 + 0.05));
  // the lane's dirt on the foot of the outer walls
  const e = 0.012, o = th / 2;
  [[x0 - o - e, z0 - o - e, x1 + o + e, z0 - o + 0.003, 0.45], [x0 - o - e, z0 - o, x0 - o + 0.003, z1 + o, 0.5], [x1 + o - 0.003, z0 - o, x1 + o + e, z1 + o, 0.55],
    [x0 - o - e, z1 + o - 0.003, xd - dw / 2 - 0.01, z1 + o + e, 0.6], [xd + dw / 2 + 0.01, z1 + o - 0.003, x1 + o + e, z1 + o + e, 0.62]].forEach(([p0, p1, q0, q1, t]) => bag.add('banco_rough', box(p0, -0.05, p1, q0, t, q1)));
  houseFront(bag, col, { x0, z0, x1, z1, h, th, xd, dw, seed: el.seed });
  if (court) {
    seg([split, z0 + th / 2], [split, z1 - 1.4]);
    if (!F) { bag.add('mudbrick', box(split + 0.6, 0, z0 + 0.6, split + 1.6, 0.9, z0 + 1.6)); bag.add('mud_plaster', box(x1 - 1.4, 0, z0 + 0.6, x1 - 0.6, 1.2, z0 + 1.4)); }
  }
  // the roof: palm logs under mud, the eaves of the logs showing
  const rx1 = split + (court ? th / 2 : 0);
  bag.add('timber', box(x0 - 0.25, h, z0 - 0.25, rx1 + 0.1, h + 0.12, z1 + 0.25));
  bag.add('mud_plaster', box(x0 - 0.25, h + 0.12, z0 - 0.25, rx1 + 0.1, h + 0.3, z1 + 0.25));
  col.floor([x0, z0, rx1, z1], h + 0.3);
  houseRoof(bag, { x0, z0, rx1, z1, h, seed: el.seed });
  if (!F) return;
  const ix0 = x0 + th / 2, iz0 = z0 + th / 2, iz1 = z1 - th / 2, ix1 = split - (court ? th / 2 : th / 2), logs = [];
  // the logs seen from beneath, across the short span
  for (let x = ix0 + 0.12; x < ix1 - 0.05; x += 0.26) beamTris(logs, [x, h - 0.12, iz0], [x, h - 0.12, iz1], 0.1, 0.12);
  bag.add('palm_trunk', fromTriangles(logs));
  // the sitting bench along the back (north) wall, the sleeping niche walled off at the west end
  const nw = Math.min(2.0, (ix1 - ix0) * 0.4);
  bag.add('mud_plaster', box(ix0 + nw + 0.13, 0, iz0 - 0.02, ix1 - 0.1, 0.38, iz0 + 0.48)); col.rect([ix0 + nw + 0.15, iz0, ix1 - 0.1, iz0 + 0.48], 0, 0.38);
  bag.add('mud_plaster', box(ix0 - 0.02, 0, iz0 - 0.02, ix0 + nw + 0.02, 0.42, iz0 + 1.0)); col.rect([ix0, iz0, ix0 + nw, iz0 + 1.0], 0, 0.42);
  bag.add('mud_plaster', box(ix0 + nw, 0, iz0 - 0.02, ix0 + nw + 0.15, 1.5, iz0 + 1.15)); col.rect([ix0 + nw, iz0, ix0 + nw + 0.15, iz0 + 1.15], 0, 1.5);
  bag.add('reed_mat', box(ix0 + 0.05, 0.425, iz0 + 0.06, ix0 + nw - 0.08, 0.442, iz0 + 0.94));
  bag.add('limestone_core', lathe([[0.001, 0], [0.09, 0.0], [0.03, 0.03], [0.03, 0.12], [0.1, 0.17], [0.11, 0.19], [0.001, 0.18]], 8).scale(1, 1, 0.45).translate(ix0 + 0.25, 0.442, iz0 + 0.5));
  bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.13, 0.12], [0.12, 0.25], [0.07, 0.32], [0.08, 0.35], [0.001, 0.35]], 10, null, ix1 - 0.4, 0.38, iz0 + 0.24));
  if (!court) return;
  const cx0 = split + th / 2, cz0 = z0 + th / 2, cx1 = x1 - th / 2;
  // the domed oven in the court's north-west corner, its mouth to the south, soot over the mouth
  const ox = cx0 + 0.65, oz = cz0 + 0.65;
  bag.add('mudbrick', lathe([[0.55, 0], [0.56, 0.3], [0.45, 0.65], [0.25, 0.85], [0.001, 0.9]], 14, null, ox, 0, oz));
  bag.add('pottery_dark', box(ox - 0.18, 0.05, oz + 0.47, ox + 0.18, 0.4, oz + 0.53));
  col.circle(ox, oz, 0.56, 0, 0.9);
  // the small circular granary in the north-east corner, its filling hole at the top, a stone on it
  const gx = cx1 - 0.6, gz = cz0 + 0.6;
  bag.add('mud_plaster', lathe([[0.52, 0], [0.55, 0.5], [0.5, 1.0], [0.32, 1.35], [0.1, 1.45], [0.1, 1.5], [0.001, 1.5]], 14, null, gx, 0, gz));
  bag.add('limestone_core', lathe([[0.001, 0], [0.13, 0], [0.12, 0.06], [0.001, 0.08]], 8, null, gx, 1.5, gz));
  col.circle(gx, gz, 0.55, 0, 1.5);
  // jars set in the floor (their rims and dark mouths at the floor) along the east wall
  for (let k = 0; k < 2; k++) { const jz = gz + 1.1 + k * 0.62; if (jz > z1 - 1.0) break; bag.add('terracotta', lathe([[0.22, 0], [0.23, 0.04], [0.17, 0.05], [0.16, 0.03]], 12, null, cx1 - 0.45, 0, jz)); bag.add('pottery_dark', lathe([[0.16, 0.0], [0.16, 0.012], [0.001, 0.012]], 10, null, cx1 - 0.45, 0, jz)); }
  // the saddle quern on its low kerb, its grinding stone on it, by the court's west wall
  const qz = Math.min(z1 - 1.6, cz0 + 1.9), qx = cx0 + 0.45;
  if (qz > oz + 0.9) {
    bag.add('mud_plaster', box(qx - 0.3, 0, qz - 0.45, qx + 0.3, 0.18, qz + 0.45));
    const g = frustum([-0.2, -0.32, 0.2, 0.32], 0, 0.1, 0.02, 0.02, 0.02, 0.02); g.rotateX(-0.12); g.translate(qx, 0.2, qz); bag.add('granite_red', g);
    bag.add('basalt', lathe([[0.001, 0], [0.05, 0.005], [0.06, 0.04], [0.04, 0.07], [0.001, 0.075]], 8).scale(2.6, 1, 1).rotateY(Math.PI / 2).translate(qx, 0.29, qz + 0.05));
    col.rect([qx - 0.3, qz - 0.45, qx + 0.3, qz + 0.45], 0, 0.35);
  }
  // a water jar by the court door
  bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]], 10, null, Math.min(cx1 - 0.35, xd + dw / 2 + 0.4), 0, z1 - th / 2 - 0.35));
}

/** gallery_hall: one of the long halls of the workers' town { rect, h } — a colonnade down the middle under a roof, a porch at the end, sleeping platforms along the walls. */
function galleryHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 3.4, th = 0.6;
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x1, z0], [x1, z1]]]) {
    const t = [];
    beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], th / 2, h);
    bag.add('mud_plaster', fromTriangles(t));
    col.segment(a, b, th, 0, h);
  }
  const zc = (z0 + z1) / 2, n = Math.round((x1 - x0) / 3.2);
  // the colonnade down the middle: round wooden posts on limestone bases, a beam along their heads carrying the roof's logs
  for (let k = 1; k < n; k++) {
    const x = x0 + (x1 - x0) * k / n;
    bag.add('limestone_core', lathe([[0.3, -0.1], [0.3, 0.12], [0.24, 0.18], [0.001, 0.18]], 10, null, x, 0, zc));
    bag.add('timber', lathe([[0.15, 0.17], [0.13, h - 0.28], [0.001, h - 0.28]], 8, null, x, 0, zc));
    col.rect([x - 0.25, zc - 0.25, x + 0.25, zc + 0.25], 0, h);
  }
  { const t = []; beamTris(t, [x0 + 0.3, h - 0.3, zc], [x1 - 0.3, h - 0.3, zc], 0.14, 0.3); bag.add('timber', fromTriangles(t)); }
  const logs = [];
  for (let x = x0 + 0.5; x < x1 - 0.3; x += 0.32) beamTris(logs, [x, h - 0.13, z0 + 0.1], [x, h - 0.13, z1 - 0.1], 0.11, 0.12);
  bag.add('palm_trunk', fromTriangles(logs));
  bag.add('mud_plaster', box(x0 - 0.2, h, z0 - 0.2, x1 + 0.2, h + 0.4, z1 + 0.2));
  // the sleeping platforms along both walls, mats and bundles on them; a hearth and jars in the open porch at the west end
  for (const [z, s2] of [[z0 + th / 2, 1], [z1 - th / 2, -1]]) {
    bag.add('mudbrick', box(x0 + 2, 0, Math.min(z - s2 * 0.02, z + s2 * 1.0), x1 - th / 2 + 0.02, 0.5, Math.max(z - s2 * 0.02, z + s2 * 1.0)));
    col.rect([x0 + 2, Math.min(z, z + s2 * 1.0), x1, Math.max(z, z + s2 * 1.0)], 0, 0.5);
    for (let x = x0 + 2.3, k = 0; x < x1 - 2; x += 2.1, k++) {
      if ((k + (s2 > 0 ? 0 : 1)) % 3 === 2) continue;
      bag.add('reed_mat', box(x, 0.505, Math.min(z + s2 * 0.08, z + s2 * 0.92), x + 1.85, 0.52, Math.max(z + s2 * 0.08, z + s2 * 0.92)));
      if (k % 2) bag.add('cloth_white', lathe([[0.001, 0], [0.16, 0.02], [0.18, 0.12], [0.12, 0.2], [0.001, 0.22]], 8).scale(1.6, 1, 1).translate(x + 0.4, 0.52, z + s2 * 0.3));
    }
  }
  bag.add('plaster_grey', lathe([[0.5, 0], [0.5, 0.03], [0.001, 0.03]], 12, null, x0 + 1.0, 0, zc - 0.9));
  for (let k = 0; k < 3; k++) { const t = k * 2.1; bag.add('limestone_core', lathe([[0.001, 0], [0.1, 0.01], [0.11, 0.12], [0.001, 0.14]], 6, null, x0 + 1.0 + Math.cos(t) * 0.32, 0, zc - 0.9 + Math.sin(t) * 0.32)); }
  for (const dz of [0.6, 1.2]) bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.2, 0.25], [0.18, 0.5], [0.09, 0.62], [0.1, 0.66], [0.001, 0.66]], 10, null, x0 + 0.7, 0, zc + dz));
  col.floor([x0, z0, x1, z1], h + 0.4);
  galleryOutside(bag, col, { rect: el.rect, h });
}

/** crow_wall: the Wall of the Crow { a, b, h, th, gate: { at, w, h } }: a wall of great limestone blocks with a corbelled tunnel through it. */
function crowWall(el, ctx) {
  STYLES.ming.elements.ming_wall({ a: el.a, b: el.b, y: 0, h: el.h, th: el.th, gates: [{ at: el.gate.at, w: el.gate.w, h: el.gate.h }], pal: { plaster: 'limestone_core', roof: 'limestone_core', plinth: 'limestone_core' } }, ctx);
}

/**
 * bakery: one of the bakeries of the workers' town (docs/settlements/giza.md §5) { rect }: a room
 * of low stone walls, the door on the north; along the south wall a hearth platform, a bed of hot
 * ash on it with the bell-shaped bread pots (bedja) set in rows, lids on some; a stack of pots
 * upturned over an open fire in a corner, heating; two large vats sunk in mudbrick rings for the
 * dough; a few spare pots by the wall.
 */
function bakery(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = 1.3, th = 0.5, rand = rng(el.seed || 3);
  const walls = [[[x0, z1], [x1, z1]], [[x1, z0], [x1, z1]], [[x0, z0], [x0, z1]]];
  const mx = (x0 + x1) / 2;
  walls.push([[x0, z0], [mx - 0.6, z0]], [[mx + 0.6, z0], [x1, z0]]);
  walls.forEach(([a, b], i) => {
    // the long walls run past the corners; the end walls stop against them (no faces in one plane)
    const e0 = i === 0 || i === 3 ? th / 2 : 0, e1 = i === 0 || i === 4 ? th / 2 : 0, ux = Math.sign(b[0] - a[0]), uz = Math.sign(b[1] - a[1]);
    const p = [a[0] - ux * e0, a[1] - uz * e0 + (i === 1 || i === 2 ? th / 2 : 0)], q = [b[0] + ux * e1, b[1] + uz * e1 - (i === 1 || i === 2 ? th / 2 : 0)], t = [];
    beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, h);
    bag.add('limestone_core', fromTriangles(t));
    col.segment(p, q, th, 0, h);
  });
  // the hearth platform along the south wall and its bed of ash
  const hz0 = z1 - th / 2 - 1.5, hz1 = z1 - th / 2;
  bag.add('mudbrick', box(x0 + th / 2, 0, hz0, x1 - th / 2, 0.3, hz1));
  bag.add('plaster_grey', box(x0 + th / 2 + 0.15, 0.3, hz0 + 0.12, x1 - th / 2 - 0.15, 0.4, hz1 - 0.05));
  col.rect([x0, hz0, x1, hz1], 0, 0.4);
  // the bread pots in rows, bedded in the ash, mouths up; lids (pots upturned) on some
  const bell = [[0.04, 0], [0.09, 0.02], [0.15, 0.2], [0.17, 0.3], [0.15, 0.31], [0.13, 0.22], [0.001, 0.08]];
  const n = Math.floor((x1 - x0 - th - 0.5) / 0.42);
  for (let r = 0; r < 3; r++) for (let k = 0; k < n; k++) {
    if (rand() < 0.12) continue;
    const px = x0 + th / 2 + 0.45 + k * 0.42 + (r % 2) * 0.12, pz = hz0 + 0.35 + r * 0.42;
    bag.add('terracotta', lathe(bell, 9, null, px, 0.28, pz));
    if (rand() < 0.4) { const g = lathe(bell, 9); g.rotateX(Math.PI); g.translate(px, 0.28 + 0.31 + 0.3, pz); bag.add('terracotta', g); }
  }
  // the stack of pots heating upturned over an open fire, in the north-west corner
  const sx = x0 + th / 2 + 0.7, sz = z0 + th / 2 + 0.7;
  bag.add('pottery_dark', box(sx - 0.55, 0, sz - 0.55, sx + 0.55, 0.08, sz + 0.55));
  for (let k = 0; k < 3; k++) for (const [ox, oz] of k === 2 ? [[0, 0]] : [[-0.2, -0.15], [0.2, -0.15], [0, 0.2]]) {
    const g = lathe(bell, 9); g.rotateX(Math.PI); g.translate(sx + ox, 0.08 + 0.31 + k * 0.24, sz + oz); bag.add('pottery_dark', g);
  }
  col.rect([sx - 0.55, sz - 0.55, sx + 0.55, sz + 0.55], 0, 0.9);
  // beer brewed from the same dough (AERA: grain distributed "to create the beer and bread"): tall jars stoppered
  // with mud, stood in a row along the east wall
  for (let k = 0; k < 4; k++) {
    const jx = x1 - th / 2 - 0.25, jz = z0 + th / 2 + 2.2 + k * 0.42; if (jz > hz0 - 0.3) break;
    bag.add('terracotta', lathe([[0.04, 0], [0.12, 0.08], [0.17, 0.35], [0.14, 0.62], [0.07, 0.72], [0.08, 0.76], [0.001, 0.76]], 10, null, jx, 0, jz));
    bag.add('mud_plaster', lathe([[0.09, 0], [0.09, 0.03], [0.06, 0.1], [0.001, 0.12]], 8, null, jx, 0.75, jz));
  }
  bakeryShade(bag, col, { rect: el.rect });
  // the two vats for the dough, sunk in rings of mudbrick
  for (const vx of [mx + 0.9, x1 - th / 2 - 0.8]) {
    const vz = z0 + th / 2 + 1.1;
    bag.add('mudbrick', lathe([[0.62, 0], [0.62, 0.45], [0.5, 0.5], [0.001, 0.5]], 14, null, vx, 0, vz));
    bag.add('terracotta', lathe([[0.5, 0.5], [0.56, 0.62], [0.52, 0.64], [0.4, 0.56], [0.001, 0.54]], 14, null, vx, 0, vz));
    col.circle(vx, vz, 0.62, 0, 0.64);
  }
}

/** A box turned in plan: centre (cx, cz), half-length a along the angle `ang`, half-width b across it, from y0 to y1. */
function turnedBox(cx, cz, ang, a, b, y0, y1) {
  const ux = Math.cos(ang), uz = Math.sin(ang), vx = -uz, vz = ux, t = [];
  const P = (s, r, y) => [cx + ux * s + vx * r, y, cz + uz * s + vz * r];
  const c = [[-a, -b], [a, -b], [a, b], [-a, b]];
  for (let i = 0; i < 4; i++) { const [p, q] = [c[i], c[(i + 1) % 4]]; t.push(...P(...p, y0), ...P(...q, y0), ...P(...q, y1), ...P(...p, y0), ...P(...q, y1), ...P(...p, y1)); }
  t.push(...P(...c[0], y1), ...P(...c[1], y1), ...P(...c[2], y1), ...P(...c[0], y1), ...P(...c[2], y1), ...P(...c[3], y1));
  // wind every face outward (the sides above may run either way, as ang turns them)
  return fromTriangles(orient(t, [cx, (y0 + y1) / 2, cz]));
}
function orient(t, c) {
  for (let i = 0; i < t.length; i += 9) {
    const a = t.slice(i, i + 3), b = t.slice(i + 3, i + 6), d = t.slice(i + 6, i + 9);
    const n = [(b[1] - a[1]) * (d[2] - a[2]) - (b[2] - a[2]) * (d[1] - a[1]), (b[2] - a[2]) * (d[0] - a[0]) - (b[0] - a[0]) * (d[2] - a[2]), (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0])];
    const m = [(a[0] + b[0] + d[0]) / 3 - c[0], (a[1] + b[1] + d[1]) / 3 - c[1], (a[2] + b[2] + d[2]) / 3 - c[2]];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  return t;
}

/**
 * boat_pit: a pit cut in the rock beside the pyramid for one of the king's boats, sealed (docs/settlements/giza.md §4.2)
 * { c, len, w, ang (the length's direction in plan, radians), shape ('rect' | 'boat'), n (the covering blocks) }:
 * the great limestone beams laid across it side by side, the joints between them stopped with
 * gypsum, a low kerb round the cutting; a boat-shaped pit covered by beams whose length follows
 * the outline of the hull below.
 */
function boatPit(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.len, W = el.w, ang = el.ang ?? 0, n = el.n ?? Math.round(L / 0.78), boat = el.shape === 'boat';
  const ux = Math.cos(ang), uz = Math.sin(ang), step = L / n, top = el.top ?? 0.45;
  const half = (s) => (boat ? W / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(s) / (L / 2), 2.2)), 0.6) : W / 2);
  for (let i = 0; i < n; i++) {
    const s = -L / 2 + (i + 0.5) * step, hb = half(s) + 0.45;
    if (hb < 0.7) continue;
    const x = cx + ux * s, z = cz + uz * s, tt = top - 0.04 * ((i * 7) % 3);           // the beams not quite level
    bag.add('tura_limestone', turnedBox(x, z, ang + Math.PI / 2, hb, step / 2 - 0.03, -0.9, tt));
    if (i < n - 1 && half(s + step / 2) + 0.35 > 0.7) bag.add('plaster_white', turnedBox(cx + ux * (s + step / 2), cz + uz * (s + step / 2), ang + Math.PI / 2, half(s + step / 2) + 0.3, 0.031, -0.9, top - 0.09));
    const r = Math.min(hb, step) * 0.6;
    col.floor([x - r, z - r, x + r, z + r], tt);
  }
  // the kerb of dressed blocks round the cutting, a hand's breadth above the rock
  const segs = boat ? 16 : 1;
  for (const side of [-1, 1]) for (let k = 0; k < segs; k++) {
    const s0 = -L / 2 + L * k / segs, s1 = -L / 2 + L * (k + 1) / segs, h0 = half(s0) + 0.75, h1 = half(s1) + 0.75;
    const p0 = [cx + ux * s0 - uz * side * h0, cz + uz * s0 + ux * side * h0], p1 = [cx + ux * s1 - uz * side * h1, cz + uz * s1 + ux * side * h1];
    const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    bag.add('limestone_core', turnedBox(m[0], m[1], Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), len / 2 + 0.16, 0.3, -0.3, 0.15));
  }
  if (!boat) for (const e of [-1, 1]) {
    const s = e * (L / 2 + 0.75);
    bag.add('limestone_core', turnedBox(cx + ux * s, cz + uz * s, ang + Math.PI / 2, W / 2 + 1.05, 0.3, -0.3, 0.15));
  }
}

/**
 * royal_ship: Khufu's ship as it lay at the harbour (docs/settlements/giza.md §4.3) { at (the
 * middle), y (the water), len, ang (the bow's direction in plan) }: a long shallow hull of cedar,
 * its ends rising into papyriform posts — the stern higher, curving in toward the bow — each
 * ending in a papyrus umbel; the decking with its stringers; the deckhouse aft of midships with its
 * anteroom, the light framework for an awning before it and the small canopy in the bow; ten oars
 * lashed amidships ahead of the deckhouse, and the two great steering oars at the stern.
 */
function royalShip(el, { bag }) {
  const L = el.len ?? 43.6, B = el.beam ?? 5.9, ang = el.ang ?? 0, [X0, Z0] = el.at, Y0 = el.y ?? 0;
  // local frame: the ship along −z (bow) to +z (stern), x across, y up from the water
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const W = ([x, y, z]) => { const f = -z; return [X0 + ca * f - sa * x, Y0 + y, Z0 + sa * f + ca * x]; };
  const parts = { cedar: [], linen: [], timber: [] };
  const put = (mat, g) => parts[mat].push(g);
  const gun = (t) => 0.95 + (t > 0 ? 1.6 : 1.1) * Math.pow(Math.max(0, Math.abs(t) - 0.55) / 0.45, 2);
  const keel = (t) => -0.95 * (1 - Math.pow(Math.abs(t), 2.4)) + 0.25 * Math.pow(Math.abs(t), 3) * 3;
  const wid = (t) => B / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 2.4)), 0.55) + 0.14;
  // the hull: half-elliptic sections from gunwale to gunwale, the deck closing each across
  const rings = [];
  for (let i = 0; i <= 40; i++) {
    const t = -1 + 2 * i / 40, w = wid(t), g = gun(t), k = Math.min(keel(t), g - 0.3), r = [];
    for (let j = 0; j <= 12; j++) { const a = Math.PI * j / 12; r.push([Math.cos(a) * w, g - Math.sin(a) * (g - k), t * L / 2]); }
    rings.push(r);
  }
  put('cedar', loft(rings));
  // the wale along each side just under the gunwale
  for (const s of [-1, 1]) put('cedar', loft([-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9].map((t) => ring([s * (wid(t) + 0.03), gun(t) - 0.22, t * L / 2], X, Y, 0.06, 0.07, 6))));
  // the papyriform posts: the hull's ends drawn up into tapering columns, the stern's curling inboard,
  // each ending in an umbel flaring like the papyrus flower
  const post = (pts, r0, r1) => {
    put('cedar', loft(pts.map((p, i) => {
      const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)], d = [q[1] - o[1], q[2] - o[2]], l = Math.hypot(...d) || 1;
      return ring(p, X, [0, -d[1] / l, d[0] / l], r0 + (r1 - r0) * i / (pts.length - 1), r0 + (r1 - r0) * i / (pts.length - 1), 10);
    })));
    const e = pts[pts.length - 1], f = pts[pts.length - 2], d = [e[1] - f[1], e[2] - f[2]], l = Math.hypot(...d), v = [0, d[0] / l, d[1] / l], n = [0, -d[1] / l, d[0] / l];
    put('cedar', loft([[0, r1 * 0.9], [0.18, r1 * 1.1], [0.42, r1 * 2.0], [0.62, r1 * 2.6], [0.66, r1 * 2.2]].map(([o, rr]) => ring([e[0], e[1] + v[1] * o, e[2] + v[2] * o], X, n, rr, rr, 14, (t) => 1 + 0.08 * Math.cos(t * 16)))));
  };
  const zs = L / 2, zb = -L / 2;
  post([[0, gun(1) - 0.3, zs - 0.4], [0, gun(1) + 0.4, zs + 0.15], [0, gun(1) + 1.4, zs + 0.55], [0, gun(1) + 2.4, zs + 0.6], [0, gun(1) + 3.2, zs + 0.3], [0, gun(1) + 3.7, zs - 0.25]], 0.34, 0.16);
  post([[0, gun(-1) - 0.3, zb + 0.4], [0, gun(-1) + 0.4, zb - 0.15], [0, gun(-1) + 1.3, zb - 0.55], [0, gun(-1) + 2.2, zb - 0.85]], 0.3, 0.15);
  // the stringers along the deck to which the oars were lashed
  for (const s of [-1, 1]) put('timber', loft([-0.5, -0.25, 0, 0.25, 0.5].map((t) => ring([s * 1.15, gun(t) + 0.06, t * L / 2], X, Y, 0.08, 0.07, 6))));
  // the deckhouse aft of midships: the main cabin, its anteroom before it, a roof with eaves
  const dy = 0.95;
  put('cedar', box(-1.6, dy, 3.2, 1.6, dy + 2.25, 12.2));
  put('cedar', box(-1.8, dy + 2.25, 2.9, 1.8, dy + 2.45, 12.5));
  put('cedar', box(-1.25, dy, 0.6, 1.25, dy + 1.9, 3.2));
  put('cedar', box(-1.4, dy + 1.9, 0.4, 1.4, dy + 2.05, 3.2));
  for (const z of [4.6, 6.4, 8.2, 10.0]) for (const s of [-1, 1]) put('timber', box(s * 1.6 - 0.04, dy + 0.1, z - 0.06, s * 1.6 + 0.04, dy + 2.2, z + 0.06));   // the framing of the panels
  // the awning frame forward of the deckhouse: posts with palm capitals, rails, a linen awning on the aft half
  for (const z of [-3.6, -1.2, 0.6]) for (const s of [-1, 1]) {
    put('timber', lathe([[0.07, 0], [0.06, 2.3], [0.1, 2.4], [0.05, 2.5]], 8, null, s * 1.5, dy, z));
  }
  for (const s of [-1, 1]) put('timber', box(s * 1.5 - 0.05, dy + 2.5, -3.7, s * 1.5 + 0.05, dy + 2.6, 0.6));
  for (const z of [-3.6, -1.2, 0.6]) put('timber', box(-1.55, dy + 2.5, z - 0.05, 1.55, dy + 2.6, z + 0.05));
  put('linen', box(-1.6, dy + 2.6, -1.2, 1.6, dy + 2.64, 0.6));
  // the canopy in the bow: four slender posts and a light roof
  const bz = -L / 2 + 6.5;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('timber', lathe([[0.06, 0], [0.05, 1.9], [0.09, 2.0], [0.04, 2.1]], 8, null, sx * 0.85, gun(-0.7) - 0.05, bz + sz * 0.9));
  put('cedar', box(-1.0, gun(-0.7) + 2.05, bz - 1.05, 1.0, gun(-0.7) + 2.18, bz + 1.05));
  // ten oars lashed amidships ahead of the deckhouse, their looms on the stringers, their blades in the water
  for (const z of [-10.5, -8.2, -5.9, -3.6, -1.3]) for (const s of [-1, 1]) {
    const a = [s * 1.15, gun(z * 2 / L) + 0.15, z], b = [s * 7.2, -0.25, z + 1.6], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l, (b[2] - a[2]) / l], u2 = [d[2], 0, -d[0]].map((q) => q / Math.hypot(d[2], d[0]));
    put('timber', loft([0, 0.6, 1].map((f) => ring([a[0] + d[0] * l * f * 0.8, a[1] + d[1] * l * f * 0.8, a[2] + d[2] * l * f * 0.8], u2, [d[1] * u2[2] - d[2] * u2[1], d[2] * u2[0] - d[0] * u2[2], d[0] * u2[1] - d[1] * u2[0]], 0.07 - f * 0.02, 0.07 - f * 0.02, 6))));
    const bc = [a[0] + d[0] * l * 0.9, a[1] + d[1] * l * 0.9, a[2] + d[2] * l * 0.9];
    put('timber', loft([-0.7, 0, 0.7].map((o, i) => ring([bc[0] + d[0] * o, bc[1] + d[1] * o, bc[2] + d[2] * o], u2, [d[1] * u2[2] - d[2] * u2[1], d[2] * u2[0] - d[0] * u2[2], d[0] * u2[1] - d[1] * u2[0]], i === 1 ? 0.2 : 0.1, 0.025, 8))));
  }
  // the two steering oars at the stern, each against an upright post
  for (const s of [-1, 1]) {
    const pz = L / 2 - 4.5, gy = gun(pz * 2 / L);
    put('timber', box(s * 1.7 - 0.08, gy - 0.1, pz - 0.08, s * 1.7 + 0.08, gy + 1.8, pz + 0.08));
    const a = [s * 1.75, gy + 1.7, pz - 0.6], b = [s * 2.6, -0.9, pz + 4.6], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l, (b[2] - a[2]) / l];
    const u2 = [1, 0, 0], v2 = [0, -d[2], d[1]].map((q) => q / Math.hypot(d[2], d[1]));
    put('timber', loft([0, 0.75].map((f) => ring([a[0] + d[0] * l * f, a[1] + d[1] * l * f, a[2] + d[2] * l * f], u2, v2, 0.09, 0.09, 8))));
    put('timber', loft([0.72, 0.86, 1].map((f, i) => ring([a[0] + d[0] * l * f, a[1] + d[1] * l * f, a[2] + d[2] * l * f], u2, v2, 0.04, i === 1 ? 0.35 : 0.18, 8))));
  }
  for (const [mat, list] of Object.entries(parts)) for (const g of list) {
    const p = g.attributes.position, nn = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const w = W([p.getX(i), p.getY(i), p.getZ(i)]); p.setXYZ(i, w[0], w[1], w[2]);
      const nx = nn.getX(i), nz = nn.getZ(i), f = -nz; nn.setXYZ(i, ca * f - sa * nx, nn.getY(i), sa * f + ca * nx);
    }
    bag.add(mat, g);
  }
}
const X = [1, 0, 0], Y = [0, 1, 0];

/**
 * stone_sledge: a block of limestone on its wooden sledge, as hauled from the quay up to the works (docs/settlements/
 * giza.md §5c) { at, y, rot, w (block width), len }: two runners turned up at the front, crossbars, the block lashed
 * down with ropes over it, the hauling rope running forward from the runners' noses and lying slack on the ground.
 */
function stoneSledge(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s2 = Math.sin(a), W = el.w ?? 1.2, Lb = el.len ?? 1.8;
  const P = (u, v, h) => [x + c * u - s2 * v, y + h, z + s2 * u + c * v];
  const T = [], R = [];
  for (const v of [-W * 0.42, W * 0.42]) {
    beamTris(T, P(-Lb / 2 - 0.3, v, 0), P(Lb / 2 + 0.2, v, 0), 0.08, 0.16);
    beamTris(T, P(Lb / 2 + 0.2, v, 0.02), P(Lb / 2 + 0.6, v, 0.3), 0.08, 0.14);
  }
  for (let u = -Lb / 2 - 0.1; u < Lb / 2 + 0.2; u += 0.45) beamTris(T, P(u, -W * 0.55, 0.16), P(u, W * 0.55, 0.16), 0.06, 0.1);
  bag.add('timber', fromTriangles(T));
  bag.add('tura_limestone', turnedBox(x, z, a, Lb / 2, W / 2, y + 0.26, y + 0.26 + W * 0.85));
  for (const u of [-Lb * 0.3, Lb * 0.3]) for (const sg of [-1, 1]) beamTris(R, P(u, sg * (W / 2 + 0.02), 0.2), P(u, sg * (W / 2 + 0.02), 0.26 + W * 0.85 + 0.02), 0.02, 0.0001 + 0.03);
  for (const u of [-Lb * 0.3, Lb * 0.3]) beamTris(R, P(u, -W / 2 - 0.02, 0.26 + W * 0.85), P(u, W / 2 + 0.02, 0.26 + W * 0.85), 0.02, 0.03);
  for (const v of [-W * 0.42, W * 0.42]) beamTris(R, P(Lb / 2 + 0.6, v, 0.3), P(Lb / 2 + 4.5, v * 0.3, 0.02), 0.02, 0.03);
  beamTris(R, P(Lb / 2 + 4.5, 0, 0.0), P(Lb / 2 + 9, 0.6, 0.0), 0.025, 0.04);
  bag.add('rope_fibre', fromTriangles(R));
  col.rect([x - Lb / 2 - 0.4, z - Lb / 2 - 0.4, x + Lb / 2 + 0.4, z + Lb / 2 + 0.4].map((v, i) => v + (i % 2 ? 0 : 0)), y, y + 0.3 + W);
}
registerStyle('oldkingdom', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ok_pyramid: okPyramid, mastaba, ok_temple: okTemple, causeway, mud_house: mudHouse, gallery_hall: galleryHall, crow_wall: crowWall,
    boat_pit: boatPit, royal_ship: royalShip, bakery, ok_pyramid_interior: pyramidInterior, stone_sledge: stoneSledge,
    ok_yard: yard, ok_lane: lane, ok_cemetery: cemetery, ok_magazines: magazines, ok_quay: quay,
    ok_sphinx: sphinx, ok_khafre_temple: khafreTemple, ok_quarry: quarry, ok_track: track, ok_tools: tools, ok_ramp: ramp, ok_shade: shade, ok_casing: casingStones,
  },
  objects: {},
});
void flipTris;
