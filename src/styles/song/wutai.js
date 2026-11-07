// Foguang Monastery's Tang and earlier stones (docs/settlements/tang-wutai.md §1, §10): the dhāraṇī
// pillar of 857 before the Great East Hall and the founding master's (Zushi) pagoda south of it.

import { lathe, box, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

/** A hexagonal solid (flat faces toward ±x) from radius r0 at y0 to r1 at y1, centred at (x, z). */
const hex = (r0, y0, r1, y1, x, z, n = 6) => lathe([[r0 * 0.999, y0], [r0, y0], [r1, y1], [r1 * 0.001, y1]], n).rotateY(Math.PI / n).translate(x, 0, z);
/** A ring of n lotus petals round (x, y, z): each a leaf leaning out (up: true) or hanging down. */
function petals(bag, mat, x, y, z, R, n, len, up = true, lean = 0.55, wide = 0.28) {
  for (let k = 0; k < n; k++) {
    const a = (k + 0.5) / n * Math.PI * 2, g = lathe([[0.001, 0], [len * wide, len * 0.3], [len * wide * 0.8, len * 0.7], [0.001, len]], 8);
    g.scale(1, 1, wide > 0.3 ? 0.3 : 0.45);
    g.rotateX(up ? lean : Math.PI - lean);
    g.rotateY(-a + Math.PI / 2);
    g.translate(x + Math.cos(a) * R, y, z + Math.sin(a) * R);
    bag.add(mat, g);
  }
}

/**
 * tang_dharani: the stone pillar of 857 { at, y, h (3.24) }: the base of three tiers with its band of
 * lions' niches, the up-turned lotus seat, the hexagonal shaft cut with the dhāraṇī and the record of
 * the hall, the canopy with its hanging drapery and tassels, a short drum, a lotus and the pearl.
 */
function tangDharani(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, k = (el.h ?? 3.24) / 3.24, m = 'limestone';
  const Y = (v) => y + v * k;
  bag.add(m, hex(0.82 * k, Y(0), 0.82 * k, Y(0.16), x, z, 8));
  bag.add(m, hex(0.7 * k, Y(0.16), 0.62 * k, Y(0.24), x, z, 8));
  bag.add(m, hex(0.52 * k, Y(0.24), 0.52 * k, Y(0.5), x, z, 8));
  // niches round the base's waist
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = 0.52 * k * Math.cos(Math.PI / 8) + 0.012; const g = box(-0.11 * k, Y(0.29), -0.012, 0.11 * k, Y(0.45), 0.012); g.rotateY(-a + Math.PI / 2); g.translate(x + Math.cos(a) * rr, 0, z + Math.sin(a) * rr); bag.add('granite_grey', g); }
  bag.add(m, hex(0.6 * k, Y(0.5), 0.66 * k, Y(0.58), x, z, 8));
  // the up-turned lotus seat
  bag.add(m, lathe([[0.5 * k, Y(0.58)], [0.42 * k, Y(0.72)], [0.36 * k, Y(0.82)], [0.001, Y(0.82)]], 16, null, x, 0, z));
  petals(bag, m, x, Y(0.6), z, 0.4 * k, 16, 0.32 * k, true, 0.75);
  // the shaft
  bag.add(m, hex(0.27 * k, Y(0.8), 0.27 * k, Y(2.32), x, z));
  for (const yy of [0.9, 2.2]) bag.add(m, hex(0.29 * k, Y(yy), 0.29 * k, Y(yy + 0.04), x, z));
  // the canopy: a hexagonal cap wider than the shaft, its drapery in swags, tassels at the corners
  bag.add(m, hex(0.32 * k, Y(2.32), 0.62 * k, Y(2.42), x, z));
  bag.add(m, hex(0.62 * k, Y(2.42), 0.6 * k, Y(2.52), x, z));
  bag.add(m, hex(0.58 * k, Y(2.52), 0.3 * k, Y(2.62), x, z));
  for (let i = 0; i < 6; i++) {
    const a0 = (i - 0.5) / 6 * Math.PI * 2, a1 = (i + 0.5) / 6 * Math.PI * 2, R = 0.6 * k / Math.cos(Math.PI / 6) * Math.cos(Math.PI / 6), t = [];
    const p = (a, r) => [x + Math.cos(a) * r, z + Math.sin(a) * r];
    for (let j = 0; j < 4; j++) { const f0 = j / 4, f1 = (j + 1) / 4, q0 = p(a0 + (a1 - a0) * f0, R * (1.0 + 0.06 * Math.sin(f0 * Math.PI))), q1 = p(a0 + (a1 - a0) * f1, R * (1.0 + 0.06 * Math.sin(f1 * Math.PI))); beamTris(t, [q0[0], Y(2.42) - 0.12 * k * Math.sin(f0 * Math.PI) - 0.06 * k, q0[1]], [q1[0], Y(2.42) - 0.12 * k * Math.sin(f1 * Math.PI) - 0.06 * k, q1[1]], 0.018, 0.08 * k); }
    bag.add(m, fromTriangles(t));
    const c = p(a0, R * 1.02); bag.add(m, lathe([[0.03 * k, 0], [0.045 * k, -0.08 * k], [0.02 * k, -0.22 * k], [0.001, -0.24 * k]], 6, null, c[0], Y(2.42), c[1]));
  }
  // the drum, the lotus and the pearl
  bag.add(m, hex(0.2 * k, Y(2.62), 0.2 * k, Y(2.86), x, z, 8));
  bag.add(m, lathe([[0.16 * k, Y(2.86)], [0.26 * k, Y(2.96)], [0.2 * k, Y(3.0)], [0.001, Y(3.0)]], 12, null, x, 0, z));
  petals(bag, m, x, Y(2.86), z, 0.16 * k, 8, 0.15 * k, true, 0.9);
  bag.add(m, lathe(Array.from({ length: 9 }, (_, i) => { const t = i / 8 * Math.PI; return [Math.max(0.001, Math.sin(t) * 0.11 * k), Y(3.0) + (1 - Math.cos(t)) * 0.12 * k]; }), 10, null, x, 0, z));
  col.circle(x, z, 0.82 * k, y, y + 3.24 * k);
}

/**
 * zushi_pagoda: the founding master's pagoda { at, y, door ('w' | 'e' …: the face of the chamber's
 * door) }: white-plastered brick, hexagonal, 6 m; a plinth; the first storey with its chamber door
 * under a flame-shaped arch; the eave of corbelled brick courses, stepped out then back over a band
 * of lotus petals; the second storey (solid) on an up-turned lotus seat, blind doors on its faces,
 * a small corbelled eave; the lotus bud and the vase-shaped finial.
 */
function zushiPagoda(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, wm = 'plaster_white', bm = 'brick_grey';
  const ang = { e: 0, s: Math.PI / 2, w: Math.PI, n: -Math.PI / 2 }[el.door ?? 'w'];
  bag.add(bm, hex(1.95, y - 0.3, 1.95, y + 0.42, x, z));
  bag.add(bm, hex(1.95, y + 0.42, 1.78, y + 0.5, x, z));
  bag.add(wm, hex(1.58, y + 0.5, 1.58, y + 2.75, x, z));
  // the door and its flame-shaped arch on the chamber's face
  {
    const ap = 1.58 * Math.cos(Math.PI / 6), dx = Math.cos(ang), dz = Math.sin(ang), ux = -dz, uz = dx;
    const Q = (u, n, yy) => [x + dx * n + ux * u, yy, z + dz * n + uz * u];
    const d = box(-0.42, y + 0.5, -0.02, 0.42, y + 1.95, 0.02); d.rotateY(-ang + Math.PI / 2); const c = Q(0, ap + 0.005, 0); d.translate(c[0], 0, c[2]); bag.add('opening', d);
    // the arch: a pointed ogee in brick over the door, ending in a flame
    const t = [], pts = [];
    for (let i = 0; i <= 12; i++) { const s = i / 12, u = -0.58 + 1.16 * s, h = 2.0 + 0.55 * Math.pow(Math.sin(s * Math.PI), 0.8) + 0.25 * Math.max(0, 1 - Math.abs(s - 0.5) * 6); pts.push([u, h]); }
    for (let i = 0; i < 12; i++) beamTris(t, Q(pts[i][0], ap + 0.06, y + pts[i][1] - 0.05), Q(pts[i + 1][0], ap + 0.06, y + pts[i + 1][1] - 0.05), 0.05, 0.12);
    for (const s of [-1, 1]) { const g = box(-0.07, y + 0.5, -0.06, 0.07, y + 2.0, 0.06); g.rotateY(-ang + Math.PI / 2); const q = Q(s * 0.52, ap + 0.04, 0); g.translate(q[0], 0, q[2]); bag.add(bm, g); }
    bag.add(bm, fromTriangles(t));
  }
  // the corbelled eave: courses stepping out, the lotus band, courses stepping back
  let yy = y + 2.75;
  for (let i = 0; i < 5; i++) { bag.add(bm, hex(1.6 + i * 0.09, yy, 1.6 + i * 0.09, yy + 0.085, x, z)); yy += 0.085; }
  bag.add(bm, hex(2.05, yy, 2.05, yy + 0.1, x, z)); yy += 0.1;
  for (let i = 0; i < 4; i++) { bag.add(bm, hex(1.95 - i * 0.14, yy, 1.95 - i * 0.14, yy + 0.08, x, z)); yy += 0.08; }
  bag.add(wm, hex(1.35, yy, 1.2, yy + 0.25, x, z));
  petals(bag, wm, x, yy - 0.02, z, 1.12, 18, 0.4, true, 0.4, 0.5);
  yy += 0.25;
  // the second storey on its lotus seat: blind doors on the faces
  bag.add(wm, hex(1.08, yy, 1.04, yy + 1.15, x, z));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, ap = 1.04 * Math.cos(Math.PI / 6) + 0.012, g = box(-0.012, yy + 0.2, -0.22, 0.012, yy + 0.85, 0.22); g.rotateY(-a); g.translate(x + Math.cos(a) * ap, 0, z + Math.sin(a) * ap); const tw = (((a - ang) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); bag.add(tw < 0.01 || tw > 2 * Math.PI - 0.01 ? 'opening' : 'plaster_grey', g); }
  yy += 1.15;
  for (let i = 0; i < 3; i++) { bag.add(bm, hex(1.08 + i * 0.1, yy, 1.08 + i * 0.1, yy + 0.08, x, z)); yy += 0.08; }
  for (let i = 0; i < 4; i++) { bag.add(bm, hex(1.2 - i * 0.2, yy, 1.2 - i * 0.2, yy + 0.08, x, z)); yy += 0.08; }
  // the lotus bud and the vase
  bag.add(wm, lathe([[0.45, 0], [0.62, 0.15], [0.55, 0.32], [0.3, 0.42], [0.001, 0.44]], 12, null, x, yy, z));
  petals(bag, wm, x, yy + 0.02, z, 0.5, 10, 0.3, true, 0.45, 0.5);
  bag.add(wm, lathe([[0.18, 0], [0.12, 0.15], [0.3, 0.4], [0.3, 0.62], [0.12, 0.85], [0.08, 0.95], [0.14, 1.02], [0.001, 1.12]], 12, null, x, yy + 0.42, z));
  col.circle(x, z, 1.95, y, y + 6);
}

/**
 * A painted panel: flat shapes laid on a wall face, each layer a little in front of the last.
 * a, b: the strip's ends on the face (settlement x, z), y0: its foot, n: the face's outward normal [nx, nz].
 * Returns { disc, poly, strip, add } in panel coordinates (s along a→b, v up, d out from the face).
 */
function painter(a, b, y0, n) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, N = [n[0], 0, n[1]];
  const bags = new Map();
  const P = (s, v, d) => [a[0] + ux * s + n[0] * d, y0 + v, a[1] + uz * s + n[1] * d];
  const tri = (mat, p, q, r) => {
    const t = bags.get(mat) ?? []; bags.set(mat, t);
    const e1 = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], e2 = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
    const c = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (c[0] * N[0] + c[2] * N[2] >= 0) t.push(...p, ...q, ...r); else t.push(...p, ...r, ...q);
  };
  /** a convex outline [[s, v]…] filled from its centre */
  const poly = (mat, pts, d) => { const cs = pts.reduce((m, p) => m + p[0], 0) / pts.length, cv = pts.reduce((m, p) => m + p[1], 0) / pts.length, C = P(cs, cv, d); for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; tri(mat, C, P(p[0], p[1], d), P(q[0], q[1], d)); } };
  const disc = (mat, s, v, rs, rv, d, k = 14, a0 = 0, a1 = Math.PI * 2) => poly(mat, [...(a1 - a0 < 6.28 ? [[s, v]] : []), ...Array.from({ length: k + (a1 - a0 < 6.28 ? 1 : 0) }, (_, i) => { const t = a0 + (a1 - a0) * i / k; return [s + Math.cos(t) * rs, v + Math.sin(t) * rv]; })], d);
  /** a ribbon of width w along the path [[s, v]…] */
  const strip = (mat, path, w, d) => { for (let i = 0; i < path.length - 1; i++) { const [s0, v0] = path[i], [s1, v1] = path[i + 1], l = Math.hypot(s1 - s0, v1 - v0) || 1, ns = -(v1 - v0) / l * w / 2, nv = (s1 - s0) / l * w / 2; const A = P(s0 + ns, v0 + nv, d), B = P(s1 + ns, v1 + nv, d), C = P(s1 - ns, v1 - nv, d), D = P(s0 - ns, v0 - nv, d); tri(mat, A, B, C); tri(mat, A, C, D); } };
  const add = (bag) => { for (const [m, t] of bags) bag.add(m, fromTriangles(t)); };
  return { L, disc, poly, strip, add };
}

/**
 * tang_mural: the Tang painting on the bracket-eye panel over the front inner architrave of the north
 * secondary bay (docs/settlements/tang-wutai.md §10) { a, b, y0, h (0.66), n }: in the middle a seated Buddha
 * in his mandorla among seven attendants, to each side a group round a seated bodhisattva, flying apsaras
 * with trailing scarves over them, donor monks and officials kneeling at the two ends; stone green, red
 * earth and a blue gone dark as iron on an ochre ground.
 */
function tangMural(el, { bag }) {
  const h = el.h ?? 0.66, M = painter(el.a, el.b, el.y0, el.n), W = M.L, D = (k) => 0.004 + k * 0.003;
  const G = 'fresco_green', R = 'clay_robe', B = 'paint_blue', F = 'stucco_warm', O = 'paint_ochre', Wt = 'paint_white';
  M.poly(O, [[0, 0], [W, 0], [W, h], [0, h]], D(0));
  // a border of red earth along the foot and the top
  M.poly(R, [[0, 0], [W, 0], [W, 0.035], [0, 0.035]], D(1)); M.poly(R, [[0, h - 0.035], [W, h - 0.035], [W, h], [0, h]], D(1));
  const seated = (s, v, k, robe, halo, big = false) => {      // k: height of the seated figure
    if (big) M.disc(halo, s, v + k * 0.62, k * 0.42, k * 0.62, D(1), 18);                       // the mandorla
    M.disc(halo === G ? 'paint_ochre' : G, s, v + k * 0.86, k * 0.17, k * 0.17, D(2));          // the head halo
    M.disc(R, s, v + k * 0.08, k * 0.36, k * 0.1, D(2), 12, 0, Math.PI);                         // the lotus seat
    M.poly(robe, [[s - k * 0.33, v + k * 0.1], [s + k * 0.33, v + k * 0.1], [s + k * 0.2, v + k * 0.26], [s - k * 0.2, v + k * 0.26]], D(3));   // the crossed legs
    M.poly(robe, [[s - k * 0.17, v + k * 0.24], [s + k * 0.17, v + k * 0.24], [s + k * 0.15, v + k * 0.66], [s - k * 0.15, v + k * 0.66]], D(3));
    M.disc(F, s, v + k * 0.8, k * 0.085, k * 0.11, D(4), 10);                                    // the face
    M.disc(B, s, v + k * 0.93, k * 0.05, k * 0.04, D(5), 8);                                     // the hair's knot
  };
  const standing = (s, v, k, robe, sash) => {
    M.disc(G, s, v + k * 0.9, k * 0.11, k * 0.11, D(1));
    M.poly(robe, [[s - k * 0.12, v], [s + k * 0.12, v], [s + k * 0.08, v + k * 0.8], [s - k * 0.08, v + k * 0.8]], D(2));
    M.strip(sash, [[s - k * 0.1, v + k * 0.6], [s, v + k * 0.45], [s + k * 0.11, v + k * 0.62]], k * 0.04, D(3));
    M.disc(F, s, v + k * 0.88, k * 0.055, k * 0.07, D(3), 10);
  };
  const kneeling = (s, v, k, robe, dir) => {
    M.poly(robe, [[s - k * 0.2 * dir, v], [s + k * 0.16 * dir, v], [s + k * 0.08 * dir, v + k * 0.55], [s - k * 0.06 * dir, v + k * 0.55]], D(2));
    M.disc(F, s + k * 0.02 * dir, v + k * 0.64, k * 0.07, k * 0.085, D(3), 10);
    M.strip(robe, [[s + k * 0.04 * dir, v + k * 0.42], [s + k * 0.17 * dir, v + k * 0.36]], k * 0.06, D(3));    // the hands held out
  };
  const apsara = (s, v, k, dir, robe) => {
    M.disc(robe, s, v, k * 0.26, k * 0.06, D(2), 10);
    M.disc(F, s + dir * k * 0.28, v + k * 0.04, k * 0.05, k * 0.06, D(3), 8);
    const path = Array.from({ length: 9 }, (_, i) => [s - dir * k * (0.15 + i * 0.12), v + k * 0.08 + Math.sin(i * 0.9) * k * 0.08]);
    M.strip(G, path, k * 0.035, D(3)); M.strip(R, path.map(([a, b]) => [a, b - k * 0.1]), k * 0.03, D(3));
  };
  const clouds = (s, v, w) => { for (let i = 0; i < 4; i++) M.disc(Wt, s - w / 2 + (i + 0.5) * w / 4, v + (i % 2) * 0.012, w / 7, 0.022, D(1), 10); };
  const c = W / 2, v0 = 0.06;
  // the middle: the Buddha (Amitābha?) and seven attendants
  seated(c, v0, 0.5, R, G, true);
  [[-0.42, B], [-0.3, G], [-0.19, R], [0.19, R], [0.3, G], [0.42, B]].forEach(([o, m], i) => standing(c + o * 1.15, v0 + (i % 2 ? 0.03 : 0), 0.42, m, i % 2 ? R : G));
  standing(c, v0 + 0.02, 0.2, B, R);
  // the side groups: a bodhisattva seated (Guanyin, Mahāsthāmaprāpta) with four attendants, on clouds
  for (const sd of [-1, 1]) {
    const g = c + sd * 1.3;
    clouds(g, v0 - 0.02, 0.8);
    seated(g, v0 + 0.02, 0.4, B, G);
    [-0.33, -0.2, 0.2, 0.33].forEach((o, i) => standing(g + o, v0 + 0.01, 0.34, i % 2 ? G : R, B));
    apsara(g - sd * 0.62, h - 0.12, 0.36, -sd, R);
    // the donors at the ends: a monk in dark robes and an official, kneeling toward the middle
    kneeling(sd < 0 ? 0.16 : W - 0.16, v0, 0.34, B, sd < 0 ? 1 : -1);
    kneeling(sd < 0 ? 0.34 : W - 0.34, v0, 0.32, R, sd < 0 ? 1 : -1);
  }
  M.add(bag);
}

export const WUTAI_ELEMENTS = { tang_dharani: tangDharani, zushi_pagoda: zushiPagoda, tang_mural: tangMural };
