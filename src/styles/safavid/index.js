// Safavid architecture of Isfahan (c. 1600–1630; docs/settlements/isfahan.md §4): buff fired brick
// for walls and arcades; tile mosaic in deep blue and turquoise on the portals, iwans, drums and
// minarets; pointed arches in rectangular frames; domes on high drums (the Shah Mosque's bulbous
// and turquoise, Lotfollah's low and cream); slender tiled minarets with a wooden balcony; the
// talar, a terrace on slender wooden columns; vaulted bazaar streets lit through their domes; and
// courtyard houses of straw-mud plaster round a court with a pool.
//
// Pieces may be turned (the Shah Mosque faces Mecca, 45° off the square), so most take points a, b
// rather than axis-aligned rectangles.

import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward, rod } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';
import { beamTris } from '../ming/index.js';
import { arcadeWall, pishtaqFace } from '../mughal/index.js';

const B = 'brick_buff', T = 'tile_lapis', Q = 'tile_turquoise';
const boxR = (r, y0, y1) => box(r[0], y0, r[1], r[2], y1, r[3]);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A straight wall a→b, `th` thick, from y to y + h. */
function slab(bag, col, mat, a, b, y, th, h) {
  const t = [];
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h);
  bag.add(mat, fromTriangles(t));
  if (col) col.segment(a, b, th, y, y + h);
}
/** A flat-faced frustum from the polygon `bot` at y0 to `top` at y1 (convex, same vertex count), capped. */
function prism(bag, mat, bot, top, y0, y1, bottom = true) {
  const n = bot.length, t = [], P = (q, y) => [q[0], y, q[1]];
  for (let k = 0; k < n; k++) {
    const a = P(bot[k], y0), b = P(bot[(k + 1) % n], y0), c = P(top[(k + 1) % n], y1), d = P(top[k], y1);
    t.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
  for (let k = 1; k < n - 1; k++) { t.push(...P(top[0], y1), ...P(top[k], y1), ...P(top[k + 1], y1)); if (bottom) t.push(...P(bot[0], y0), ...P(bot[k + 1], y0), ...P(bot[k], y0)); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
const ngon = (cx, cz, r, n, rot = 0) => Array.from({ length: n }, (_, k) => [cx + Math.cos(rot + k / n * Math.PI * 2) * r, cz + Math.sin(rot + k / n * Math.PI * 2) * r]);
/** The unit normal of a→b pointing away from `from` (or to the left when none). */
function awayFrom(a, b, from) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]); let nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L;
  if (from && (from[0] - (a[0] + b[0]) / 2) * nx + (from[1] - (a[1] + b[1]) / 2) * nz > 0) { nx = -nx; nz = -nz; }
  return [nx, nz];
}

/** The profile of a Safavid dome of radius r and height h: swelling a little (bulge) past the drum, drawn to a point. */
function domeProfile(r, h, bulge = 0.07) {
  const p = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, a = t * Math.PI / 2;
    p.push([Math.max(0.001, r * (1 + bulge * Math.sin(Math.min(1, t * 1.8) * Math.PI)) * Math.cos(a) ** 0.8), h * Math.sin(a) ** 1.05]);
  }
  return p;
}
function safDome(bag, mat, x, y, z, r, h, bulge) {
  bag.add(mat, lathe(domeProfile(r, h, bulge), 40, null, x, y, z));
  bag.add('gilt_bronze', lathe([[r * 0.05, 0], [r * 0.06, r * 0.05], [r * 0.025, r * 0.12], [r * 0.05, r * 0.2], [0.001, r * 0.32]], 8, null, x, y + h - r * 0.02, z));
}

/** minaret: a slender tiled shaft { c, y, h, r } with brick bands, a wooden balcony near the top, a little turquoise cap. */
function minaret(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h, r = el.r ?? 2.2, top = h * 0.86;
  bag.add(B, lathe([[r * 1.15, 0], [r * 1.15, h * 0.2]], 20, null, x, y, z));
  bag.add(T, lathe([[r * 1.1, 0], [r, top]], 20, null, x, y + h * 0.2, z));
  for (const f of [0.35, 0.55, 0.75]) bag.add(Q, lathe([[r * 1.06, 0], [r * 1.06, 0.8]], 20, null, x, y + h * f, z));
  // the balcony (wooden, on corbels) and its railing, the lantern above, the cap
  bag.add('timber', lathe([[r * 0.98, 0], [r * 1.7, 1.2], [r * 1.75, 1.5], [0.001, 1.5]], 20, null, x, y + h * 0.2 + top - 1.4, z));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; bag.add('timber', box(x + Math.cos(a) * r * 1.65 - 0.06, y + h * 0.2 + top + 0.1, z + Math.sin(a) * r * 1.65 - 0.06, x + Math.cos(a) * r * 1.65 + 0.06, y + h * 0.2 + top + 1.1, z + Math.sin(a) * r * 1.65 + 0.06)); }
  const ly = y + h * 0.2 + top + 0.1;
  bag.add(T, lathe([[r * 0.8, 0], [r * 0.75, h - top - h * 0.2 - 0.1 + 2.6]], 16, null, x, ly, z));
  safDome(bag, Q, x, ly + h - top - h * 0.2 + 2.4, z, r * 0.85, r * 1.4, 0.04);
  col.circle(x, z, r * 1.15, y, y + h);
}

/**
 * square_arcade: a side of the square's arcade a→b { y, h (12), depth (12), bay (7), facing (a
 * point in the square) }: two storeys of pointed arches in the buff brick — shops below, open
 * balconies above — over a mass of rooms behind, a flat roof with a low parapet.
 */
function squareArcade(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h ?? 12, D = el.depth ?? 12, bay = el.bay ?? 7;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / bay)), w = L / n;
  const [nx, nz] = awayFrom(a, b, el.facing), behind = [(a[0] + b[0]) / 2 + nx * 100, (a[1] + b[1]) / 2 + nz * 100];
  const arches = [];
  for (let i = 0; i < n; i++) {
    arches.push({ at: (i + 0.5) * w, w: w * 0.62, h: h * 0.44, depth: 3.2, back: 'kahgel' });
    arches.push({ at: (i + 0.5) * w, w: w * 0.55, h: h * 0.33, sill: h * 0.53, depth: 2.4, back: 'kahgel' });
  }
  arcadeWall(bag, col, a, b, y, h, 1.2, B, arches, behind);
  // the shops: behind each lower arch, across the arcade's passage, a shop front on the mass of rooms —
  // two timber door leaves, folded open, under a lattice transom — and before it the stone platform
  // (sakku) the shopkeeper sits on with his wares: bales of cloth, rolled carpets, copper vessels,
  // jars; in each upper arch a wooden lattice balustrade
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, rand = rng(Math.round(a[0] * 31 + a[1] * 17) + 7);
  const Q = (s, d) => [a[0] + ux * s + nx * d, a[1] + uz * s + nz * d];
  const R = (s0, s1, d0, d1) => { const p = Q(s0, d0), q = Q(s1, d1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const wares = ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_green'];
  for (let i = 0; i < n; i++) {
    const c = (i + 0.5) * w, dw = Math.min(1.25, w * 0.18), dh = 2.7, df = 3.7;
    for (const s of [-1, 1]) {                                                                       // the door leaves, folded back against the jambs
      bag.add('wood_dark', boxR(R(c + s * dw, c + s * (dw + 0.08), df - 0.95, df), y, y + dh));
      bag.add('wood_dark', boxR(R(c + s * (dw - 0.12), c + s * (dw + 0.1), df - 0.06, df), y, y + dh + 0.12));
    }
    bag.add('wood_dark', boxR(R(c - dw - 0.12, c + dw + 0.12, df - 0.06, df), y + dh, y + dh + 0.14));
    bag.add('lattice', boxR(R(c - dw, c + dw, df - 0.04, df), y + dh + 0.14, y + dh + 1.3));
    bag.add('wood_dark', boxR(R(c - dw - 0.12, c + dw + 0.12, df - 0.06, df), y + dh + 1.3, y + dh + 1.42));
    bag.add('opening', boxR(R(c - dw, c + dw, df - 0.02, df), y, y + dh));
    // the platform and the wares on it
    const pw = Math.min(w * 0.28, 1.9), ph = 0.45, pr = R(c - pw, c + pw, df - 1.3, df - 0.95);
    bag.add('limestone', boxR(pr, y, y + ph)); col.rect(pr, y, y + ph);
    const kind = Math.floor(rand() * 4);
    for (let k = 0; k < 3; k++) {
      const s = c - pw + 0.45 + k * (2 * pw - 0.9) / 2, d = df - 1.12, yp = y + ph, [px, pz] = Q(s, d);
      if (kind === 0) bag.add(wares[(i + k) & 3], boxR(R(s - 0.28, s + 0.28, d - 0.15, d + 0.15), yp, yp + 0.3 + 0.1 * k));              // bales of cloth
      else if (kind === 1) bag.add(wares[(i + k + 1) & 3], lathe([[0.001, 0], [0.16, 0.01], [0.17, 0.5], [0.16, 1.1], [0.001, 1.12]], 8, null, px, yp, pz)); // carpets rolled, stood up
      else if (kind === 2) bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.12], [0.18, 0.24], [0.08, 0.32], [0.07, 0.42], [0.11, 0.46], [0.001, 0.46]], 10, null, px, yp, pz)); // copper vessels
      else bag.add(k === 1 ? 'pottery_dark' : 'terracotta', lathe([[0.001, 0], [0.1, 0.01], [0.2, 0.18], [0.19, 0.36], [0.08, 0.5], [0.09, 0.56], [0.001, 0.56]], 10, null, px, yp, pz)); // jars
    }
    // the upper arch's balustrade, in the middle of the wall's thickness
    const bw = w * 0.55 / 2, ys = y + h * 0.53;
    bag.add('lattice', boxR(R(c - bw, c + bw, -0.03, 0.03), ys, ys + 0.85));
    bag.add('wood_dark', boxR(R(c - bw, c + bw, -0.07, 0.07), ys + 0.85, ys + 0.95));
  }
  const off = (d) => [[a[0] + nx * d, a[1] + nz * d], [b[0] + nx * d, b[1] + nz * d]];
  const [m0, m1] = off((3.8 + D) / 2);
  slab(bag, col, B, m0, m1, y, D - 3.8, h - 0.05);
  // the band of tile along the top, the parapet
  const [f0, f1] = off(-0.62);
  slab(bag, null, T, f0, f1, y + h * 0.92, 0.1, h * 0.06);
  const [p0, p1] = off(0); slab(bag, null, B, p0, p1, y + h, 1.2, 0.9);
}

/**
 * portal: an iwan portal a→b { y, h, iwan: { w, h, depth, pass }, depth (of the mass behind),
 * mat, trim, minarets: { h, r } }: the tiled face with the great arch, its mass behind, the
 * frame standing above, two minarets on its front corners if asked.
 */
function portal(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h, D = el.depth ?? 10, mat = el.mat ?? T;
  const [nx, nz] = awayFrom(a, b, el.facing), inside = [(a[0] + b[0]) / 2 + nx * 100, (a[1] + b[1]) / 2 + nz * 100];
  pishtaqFace(bag, col, a, b, y, h, el.iwan, mat, el.niches ?? true, inside, el.trim ?? Q);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, iw = el.iwan.w;
  // the side masses beside the iwan's recess and the roof over it
  for (const [s0, s1] of [[0, L / 2 - iw / 2 - 0.2], [L / 2 + iw / 2 + 0.2, L]]) {
    const p = [a[0] + ux * (s0 + s1) / 2 + nx * (1.2 + D / 2), a[1] + uz * (s0 + s1) / 2 + nz * (1.2 + D / 2)], hl = (s1 - s0) / 2;
    slab(bag, col, B, [p[0] - ux * hl, p[1] - uz * hl], [p[0] + ux * hl, p[1] + uz * hl], y, D, h);
  }
  const top = y + (el.iwan.sill ?? 0) + el.iwan.h, c = [a[0] + ux * L / 2 + nx * (1.2 + D / 2), a[1] + uz * L / 2 + nz * (1.2 + D / 2)];
  slab(bag, col, B, [c[0] - ux * iw / 2, c[1] - uz * iw / 2], [c[0] + ux * iw / 2, c[1] + uz * iw / 2], top, D, y + h - top);
  if (el.iwan.depth && el.iwan.h > 8) iwanHood(bag, [a[0] + ux * L / 2 + nx * 1.2, a[1] + uz * L / 2 + nz * 1.2], [ux, uz], [nx, nz], iw, el.iwan.depth, y + (el.iwan.sill ?? 0), el.iwan.h);
  if (el.minarets) for (const s of [0.04, 0.96]) minaret({ c: [a[0] + ux * L * s + nx * 1.5, a[1] + uz * L * s + nz * 1.5], y: el.minarets.y ?? y + h, h: el.minarets.h, r: el.minarets.r }, { bag, col });
}

/**
 * The iwan's hood (docs/settlements/isfahan.md §4): under the great arch, the muqarnas — tiers of
 * small niche cells, each tier stepping in over the one below, from the springing to the crown,
 * faced in tile (cream, lapis, turquoise by turns, their edges picked out in white); the iwan's
 * walls below lined with a lapis dado under a band of white inscription on blue. c: the middle of
 * the face's inner side; u along the face; n into the iwan.
 */
function iwanHood(bag, c, u, n, w, depth, y, h) {
  const rise = Math.sqrt((0.8 * w) ** 2 - (0.3 * w) ** 2), ys = y + Math.max(0.3, h - rise), K = 8, top = y + h - 0.4;
  const P = (su, sd) => [c[0] + u[0] * su + n[0] * sd, c[1] + u[1] * su + n[1] * sd];
  const mats = ['tile_cream', 'tile_lapis', 'tile_turquoise', 'tile_lapis'];
  for (let k = 0; k < K; k++) {
    const o = (k + 0.5) * Math.min(w * 0.42, depth * 0.85) / K, ya = ys + k * (top - ys) / K, yb = ya + (top - ys) / K + 0.02;
    // the tier's path: up the left wall, across the back, down the right wall, each o in from them
    const L1 = depth - o, L2 = w - 2 * o, path = [[-w / 2 + o, 0.15], [-w / 2 + o, depth - o], [w / 2 - o, depth - o], [w / 2 - o, 0.15]];
    if (L2 < 0.6) break;
    void L1;
    for (let i = 0; i + 1 < path.length; i++) {
      const [u0, d0] = path[i], [u1, d1] = path[i + 1], len = Math.hypot(u1 - u0, d1 - d0), nc = Math.max(1, Math.round(len / 1.15));
      for (let j = 0; j < nc; j++) {
        const t0 = (j + 0.06) / nc, t1 = (j + 0.94) / nc;
        const qa = P(u0 + (u1 - u0) * t0, d0 + (d1 - d0) * t0), qb = P(u0 + (u1 - u0) * t1, d0 + (d1 - d0) * t1);
        // the cell: a shell of tile standing out over the tier below, a white edge along its foot
        const m = mats[(i * 7 + j + k) % mats.length];
        const t = []; beamTris(t, [qa[0], ya, qa[1]], [qb[0], ya, qb[1]], 0.22, yb - ya); bag.add(m, fromTriangles(t));
        const e = []; beamTris(e, [qa[0], ya - 0.05, qa[1]], [qb[0], ya - 0.05, qb[1]], 0.25, 0.07); bag.add('tile_white', fromTriangles(e));
      }
    }
  }
  // the crown: a flat lapis panel with a golden star over the last tier
  const cc = P(0, depth * 0.6), cw = Math.max(0.6, w * 0.12);
  const t = []; beamTris(t, [cc[0] - u[0] * cw, top + 0.02, cc[1] - u[1] * cw], [cc[0] + u[0] * cw, top + 0.02, cc[1] + u[1] * cw], depth * 0.35, 0.3); bag.add('tile_lapis', fromTriangles(t));
  // the walls below the springing: a lapis dado, a band of white letters on blue at the springing
  for (const [u0, d0, u1, d1] of [[-w / 2 + 0.06, 0.1, -w / 2 + 0.06, depth - 0.1], [-w / 2 + 0.1, depth - 0.06, w / 2 - 0.1, depth - 0.06], [w / 2 - 0.06, depth - 0.1, w / 2 - 0.06, 0.1]]) {
    const a = P(u0, d0), b = P(u1, d1);
    const d = []; beamTris(d, [a[0], y, a[1]], [b[0], y, b[1]], 0.06, 2.2); bag.add('tile_lapis', fromTriangles(d));
    const bd = []; beamTris(bd, [a[0], ys - 1.3, a[1]], [b[0], ys - 1.3, b[1]], 0.06, 1.1); bag.add('tile_lapis', fromTriangles(bd));
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ex = (b[0] - a[0]) / len, ez = (b[1] - a[1]) / len;
    for (let s = 0.3; s < len - 0.3; s += 0.32) { const q = [a[0] + ex * s, a[1] + ez * s], tall = Math.floor(s / 0.32) % 4 !== 0; const l = []; beamTris(l, [q[0] - ex * 0.05, ys - 1.15, q[1] - ez * 0.05], [q[0] + ex * 0.05, ys - 1.15, q[1] + ez * 0.05], 0.09, tall ? 0.8 : 0.25); bag.add('tile_white', fromTriangles(l)); }
  }
}

/**
 * dome_chamber: a square chamber { c, half, rot (radians), y, wallH, drum: { r, h }, dome: { r, h,
 * bulge }, wallMat, drumMat, domeMat }: four walls, an octagonal zone of transition, the drum
 * with its windows, the dome.
 */
function domeChamber(el, ctx) {
  const { bag, col } = ctx;
  const [cx, cz] = el.c, y = el.y ?? 0, A = el.half, rot = el.rot ?? 0, H = el.wallH;
  const pt = (u, v) => [cx + u * Math.cos(rot) - v * Math.sin(rot), cz + u * Math.sin(rot) + v * Math.cos(rot)];
  const C = [pt(-A, -A), pt(A, -A), pt(A, A), pt(-A, A)];
  // with an interior the entrance wall (k 0) and the qibla wall (k 2) are built by it, with the door and the mihrab
  for (let k = 0; k < 4; k++) if (!el.interior || k % 2) slab(bag, col, el.wallMat ?? B, C[k], C[(k + 1) % 4], y, 2, H);
  // the roof of the square, the octagon of transition, the drum, the dome
  const dr = el.drum.r, dh = el.drum.h, r = el.dome.r, oct8 = ngon(cx, cz, A * 1.05 / Math.cos(Math.PI / 8), 8, rot + Math.PI / 8);
  if (el.interior) {
    // the roof only round the octagon (the chamber's inner dome rises inside it); the octagon open below
    const sh = new Shape(), sq = [[-A - 1, -A - 1], [A + 1, -A - 1], [A + 1, A + 1], [-A - 1, A + 1]].map(([u, v]) => pt(u, v));
    sh.moveTo(sq[0][0], -sq[0][1]); for (const q of sq.slice(1)) sh.lineTo(q[0], -q[1]);
    const hole = new Path(); hole.moveTo(oct8[0][0], -oct8[0][1]); for (const q of oct8.slice(1)) hole.lineTo(q[0], -q[1]); sh.holes.push(hole);
    const g = new ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, y + H - 0.3, 0);
    bag.add(el.wallMat ?? B, g);
    prism(bag, el.wallMat ?? B, oct8, ngon(cx, cz, dr * 1.06 / Math.cos(Math.PI / 8), 8, rot + Math.PI / 8), y + H, y + H + A * 0.35, false);
    lotfInterior(el, ctx, pt, A, H, y);
  } else {
    const sq = ngon(cx, cz, A * Math.SQRT2 + 0.7, 4, rot + Math.PI / 4);
    prism(bag, el.wallMat ?? B, sq, sq, y + H - 0.6, y + H);
    prism(bag, el.wallMat ?? B, oct8, ngon(cx, cz, dr * 1.06 / Math.cos(Math.PI / 8), 8, rot + Math.PI / 8), y + H, y + H + A * 0.35);
  }
  const y1 = y + H + A * 0.35;
  bag.add(el.drumMat ?? T, lathe([[dr, 0], [dr, dh], [dr * 1.04, dh + 0.3], [r, dh + 0.5]], 32, null, cx, y1, cz));
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2, wx = cx + Math.cos(a) * (dr + 0.02), wz = cz + Math.sin(a) * (dr + 0.02), t = [];
    beamTris(t, [wx - Math.sin(a) * 0.6, y1 + dh * 0.3, wz + Math.cos(a) * 0.6], [wx + Math.sin(a) * 0.6, y1 + dh * 0.3, wz - Math.cos(a) * 0.6], 0.06, dh * 0.45);
    bag.add('lacquer_black', fromTriangles(t));
    if (el.grilles) {
      // the window's grille: a frame of tile and a lattice of bars, standing a little out of the drum
      const gx = cx + Math.cos(a) * (dr + 0.07), gz = cz + Math.sin(a) * (dr + 0.07), tx = -Math.sin(a), tz = Math.cos(a), y0 = y1 + dh * 0.3, hh = dh * 0.45;
      const bar = (u0, v0, u1, v1, w) => { const g = []; if (Math.abs(u1 - u0) < 1e-6) beamTris(g, [gx + tx * u0, y0 + v0, gz + tz * u0], [gx + tx * u0 + Math.cos(a) * 0.001, y0 + v0, gz + tz * u0 + Math.sin(a) * 0.001], w, v1 - v0); else beamTris(g, [gx + tx * u0, y0 + v0, gz + tz * u0], [gx + tx * u1, y0 + v0, gz + tz * u1], 0.06, w); return g; };
      const T = [...bar(-0.66, -0.06, 0.66, 0, 0.08), ...bar(-0.66, hh - 0.02, 0.66, 0, 0.08)];
      for (const u of [-0.62, -0.31, 0, 0.31, 0.62]) T.push(...vbar(gx + tx * u, gz + tz * u, a, y0, hh, 0.05));
      for (let v = 0.35; v < hh - 0.1; v += 0.35) T.push(...bar(-0.62, v, 0.62, 0, 0.04));
      bag.add('tile_white', fromTriangles(T));
    }
  }
  if (el.inscription) {
    // the band round the drum over the windows: white letters on lapis (§10)
    const yb = y1 + dh * 0.8, hb = dh * 0.17, T = [];
    const n = Math.round(2 * Math.PI * dr / 0.3);
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2, tall = k % 5 !== 2, x = cx + Math.cos(a) * (dr + 0.03), z = cz + Math.sin(a) * (dr + 0.03);
      T.push(...vbar(x, z, a, yb + hb * 0.15, hb * (tall ? 0.7 : 0.28), 0.07));
      if (k % 3 === 0) { const g = []; beamTris(g, [x, yb + hb * 0.12, z], [x - Math.sin(a) * 0.3, yb + hb * 0.12, z + Math.cos(a) * 0.3], 0.03, 0.05); T.push(...g); }
    }
    bag.add('tile_white', fromTriangles(T));
  }
  safDome(bag, el.domeMat ?? Q, cx, y1 + dh + 0.5, cz, r, el.dome.h, el.dome.bulge);
  if (el.net) domeNet(bag, el.net, cx, y1 + dh + 0.5, cz, r, el.dome.h, el.dome.bulge);
  col.circle(cx, cz, A * 1.4, y + H, y1 + dh + el.dome.h);
}

/** A pointed arch's outline in (s, y): w wide about s = 0, its feet at y0, its crown at y0 + h; up the left jamb, over, down the right (feet false: the arcs alone). */
function archLine(w, h, y0, n = 12, feet = true) {
  const r = w * 0.8, rise = Math.sqrt(r * r - (r - w / 2) ** 2), ys = y0 + Math.max(0.3, h - rise), cL = -w / 2 + r, cR = w / 2 - r, P = [];
  if (feet) P.push([-w / 2, y0]);
  for (let i = 0; i <= n; i++) { const s = -w / 2 + (w / 2) * i / n; P.push([s, ys + Math.sqrt(Math.max(0, r * r - (s - cL) ** 2))]); }
  for (let i = 1; i <= n; i++) { const s = (w / 2) * i / n; P.push([s, ys + Math.sqrt(Math.max(0, r * r - (s - cR) ** 2))]); }
  if (feet) P.push([w / 2, y0]);
  return P;
}
/** Push the triangle a b c into T, wound to face the point p. */
function facing(T, p, a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const mx = p[0] - (a[0] + b[0] + c[0]) / 3, my = p[1] - (a[1] + b[1] + c[1]) / 3, mz = p[2] - (a[2] + b[2] + c[2]) / 3;
  if (nx * mx + ny * my + nz * mz >= 0) T.push(...a, ...b, ...c); else T.push(...a, ...c, ...b);
}
/**
 * A turquoise cable moulding along the points `pts` ([x, y, z]): a core and a strand wound round it, the twist of the
 * rope; `nrm(p)` the side it is seen from (the strand's frame), r the rope's radius.
 */
function cable(bag, pts, r, nrm, mat = Q) {
  const S = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(1, Math.ceil(L / (r * 1.3)));
    for (let j = i ? 1 : 0; j <= n; j++) S.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n, a[2] + (b[2] - a[2]) * j / n]);
  }
  bag.add(mat, tube(S.map((p) => [...p, r * 0.72]), 6));
  let d = 0;
  const H = S.map((p, i) => {
    const q = S[Math.min(S.length - 1, i + 1)], o = S[Math.max(0, i - 1)], t = [q[0] - o[0], q[1] - o[1], q[2] - o[2]], tl = Math.hypot(...t) || 1;
    if (i) d += Math.hypot(p[0] - S[i - 1][0], p[1] - S[i - 1][1], p[2] - S[i - 1][2]);
    const N = nrm(p), dn = (N[0] * t[0] + N[1] * t[1] + N[2] * t[2]) / tl / tl, n0 = [N[0] - t[0] * dn, N[1] - t[1] * dn, N[2] - t[2] * dn], nl = Math.hypot(...n0) || 1;
    const nn = n0.map((v) => v / nl), b = [t[1] * nn[2] - t[2] * nn[1], t[2] * nn[0] - t[0] * nn[2], t[0] * nn[1] - t[1] * nn[0]].map((v) => v / tl);
    const ph = d / (r * 2.6) * Math.PI * 2, c = Math.cos(ph) * r * 0.5, s = Math.sin(ph) * r * 0.5;
    return [p[0] + nn[0] * c + b[0] * s, p[1] + nn[1] * c + b[1] * s, p[2] + nn[2] * c + b[2] * s, r * 0.42];
  });
  bag.add(mat, tube(H, 5));
}

/**
 * The Sheikh Lotfollah Mosque inside (docs/settlements/isfahan.md §13), for a dome_chamber with `interior` { passage:
 * { x (the vestibule's east face) } }: the winding passage from the portal's vestibule — north-east along the
 * chamber's north-west wall, south-east along its north-east wall — and the door into the chamber facing the mihrab;
 * the chamber lined with tile above a marble dado, eight pointed arches of turquoise cable moulding rising from the
 * dado, four on the walls and four across the corners, each framed by a band of white letters on blue, the wall arches'
 * fields cream with a lozenge medallion, the corner ones closed over by squinches; the ring at the arches' crowns, the
 * drum with its band of letters and sixteen grilled windows, a cable at the dome's foot; the inner dome of buff brick
 * set with rings of thirty-two lemon-shaped medallions shrinking toward the sunburst at the crown; the mihrab in the
 * qibla wall, its niche under a half-dome of muqarnas, enamelled with little flowers on blue. Local (u, v): +u south-
 * east, +v south-west (toward Mecca) for rot = π/4.
 */
function lotfInterior(el, { bag, col, lights }, pt, A, H, y) {
  const [cx, cz] = el.c, rot = el.rot ?? 0, WM = el.wallMat ?? B, a = A - 1, w8 = 2 * a * Math.tan(Math.PI / 8), y0 = y + 1.45, ah = 12;
  const vec = (u, v) => [u * Math.cos(rot) - v * Math.sin(rot), u * Math.sin(rot) + v * Math.cos(rot)];
  const mid = [cx, y + 7, cz];
  // ---- the structure: the entrance wall with its door, the qibla wall in two leaves round the mihrab's niche, the corners filled
  slab(bag, col, WM, pt(-A, -A), pt(-1, -A), y, 2, H); slab(bag, col, WM, pt(1, -A), pt(A, -A), y, 2, H);
  slab(bag, col, WM, pt(-1, -A), pt(1, -A), y + 3.2, 2, H - 3.2);
  const MW = 2.2, MH = 4.2, MO = 1.4;
  arcadeWall(bag, col, pt(-A, A - 0.6), pt(A, A - 0.6), y, H, 0.8, T, [{ at: A, w: MW, h: MH, depth: 0.6, alcove: 'oct', plain: true, sideMat: T, backMat: T, domeMat: T, ribMat: Q, cellMat: 'tile_cream', ribSeg: 3 }], pt(0, A + 100));
  slab(bag, col, WM, pt(-A, A + 0.4), pt(-MO, A + 0.4), y, 1.2, H); slab(bag, col, WM, pt(MO, A + 0.4), pt(A, A + 0.4), y, 1.2, H);
  slab(bag, null, WM, pt(-MO, A + 0.4), pt(MO, A + 0.4), y + MH + 0.15, 1.2, H - MH - 0.15); slab(bag, null, WM, pt(-MO, A + 0.85), pt(MO, A + 0.85), y, 0.3, MH + 0.15);
  for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) bag.add(WM, orientedBox(pt(su * A - 1, sv * A), pt(su * A + 1, sv * A), 2, y, y + H));
  // ---- the eight faces of the octagon: the walls (inward normals) and the corners' diagonals, all `a` from the centre
  const faces = [[0, 1, 'door'], [-1, 0], [0, -1, 'mihrab'], [1, 0]].map(([u, v, kind]) => ({ nL: [u, v], wall: true, kind }));
  for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) faces.push({ nL: [-su * Math.SQRT1_2, -sv * Math.SQRT1_2], wall: false });
  for (const f of faces) {
    const n = vec(...f.nL), t = [n[1], -n[0]], c0 = [cx - n[0] * a, cz - n[1] * a];
    f.F = (s, yy, o) => [c0[0] + t[0] * s + n[0] * o, yy, c0[1] + t[1] * s + n[1] * o];
    f.box = (s0, s1, ya, yb, o0, o1, m) => { const p = f.F(s0, 0, (o0 + o1) / 2), q = f.F(s1, 0, (o0 + o1) / 2); bag.add(m, orientedBox([p[0], p[2]], [q[0], q[2]], o1 - o0, ya, yb)); };
    // a flat shape (outline in s, y) laid on the face, `o` out from it, d thick
    f.shape = (pts, o, d, m) => {
      const sh = new Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) sh.lineTo(q[0], q[1]);
      const g = new ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 4 }), p0 = f.F(0, 0, o);
      g.applyMatrix4(new Matrix4().makeBasis({ x: t[0], y: 0, z: t[1] }, { x: 0, y: 1, z: 0 }, { x: n[0], y: 0, z: n[1] }).setPosition(p0[0], 0, p0[2]));
      bag.add(m, g);
    };
  }
  const tris = new Map(), put = (m, p, A1, B1, C1) => { if (!tris.has(m)) tris.set(m, []); facing(tris.get(m), p, A1, B1, C1); };
  const quad = (m, p, q0, q1, q2, q3) => { put(m, p, q0, q1, q2); put(m, p, q0, q2, q3); };
  // white letters across a band: strokes between its two edges (lists of [s, y]) on face f, o out
  const letters = (f, e0, e1, o, p) => {
    let k = 0;
    for (let i = 0; i + 1 < e0.length; i++) {
      const L = Math.hypot(e0[i + 1][0] - e0[i][0], e0[i + 1][1] - e0[i][1]), ns = Math.max(1, Math.round(L / 0.24));
      for (let j = 0; j < ns; j++, k++) {
        const g = (j + 0.5) / ns, A0 = [e0[i][0] + (e0[i + 1][0] - e0[i][0]) * g, e0[i][1] + (e0[i + 1][1] - e0[i][1]) * g], A1 = [e1[i][0] + (e1[i + 1][0] - e1[i][0]) * g, e1[i][1] + (e1[i + 1][1] - e1[i][1]) * g];
        const along = [(e0[i + 1][0] - e0[i][0]) / L * 0.03, (e0[i + 1][1] - e0[i][1]) / L * 0.03], tall = k % 5 !== 2 && k % 7 !== 4, f0 = 0.2, f1 = tall ? 0.78 : 0.4;
        const P0 = [A0[0] + (A1[0] - A0[0]) * f0, A0[1] + (A1[1] - A0[1]) * f0], P1 = [A0[0] + (A1[0] - A0[0]) * f1, A0[1] + (A1[1] - A0[1]) * f1];
        quad('tile_white', p, f.F(P0[0] - along[0], P0[1] - along[1], o), f.F(P0[0] + along[0], P0[1] + along[1], o), f.F(P1[0] + along[0], P1[1] + along[1], o), f.F(P1[0] - along[0], P1[1] - along[1], o));
        if (k % 3 === 0) { const B0 = [A0[0] + (A1[0] - A0[0]) * 0.12, A0[1] + (A1[1] - A0[1]) * 0.12], d2 = [along[0] * 4, along[1] * 4]; quad('tile_white', p, f.F(B0[0] - d2[0], B0[1] - d2[1] - 0.025, o), f.F(B0[0] + d2[0], B0[1] + d2[1] - 0.025, o), f.F(B0[0] + d2[0], B0[1] + d2[1] + 0.025, o), f.F(B0[0] - d2[0], B0[1] - d2[1] + 0.025, o)); }
      }
    }
  };
  const lozenge = (f, s, yc, hw, hh, o, m) => { const p = f.F(0, yc, 3); quad(m, p, f.F(s, yc - hh, o), f.F(s + hw, yc, o), f.F(s, yc + hh, o), f.F(s - hw, yc, o)); };
  const flower = (f, s, yc, r, o) => { const p = f.F(s, yc, o + 3); for (const [ds, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) lozenge(f, s + ds * 0.6, yc + dy * 0.6, r * 0.45, r * 0.45, o, 'tile_white'); lozenge(f, s, yc, r * 0.3, r * 0.3, o + 0.008, 'glaze_yellow'); void p; };
  const DOOR = 1.0, DH = 3.2, MF = 1.85, MFH = 6.3;
  for (const f of faces) {
    const p = f.F(0, y + 7, 4);
    if (f.wall) {
      // the lining: a marble dado with a moulded top, tile above (the qibla wall's inner leaf is itself of tile)
      const gap = f.kind === 'door' ? DOOR : f.kind === 'mihrab' ? MF : 0, runs = gap ? [[-a, -gap], [gap, a]] : [[-a, a]];
      for (const [s0, s1] of runs) { f.box(s0, s1, y, y + 1.35, -0.02, 0.1, 'marble_smooth'); f.box(s0, s1, y + 1.35, y + 1.45, -0.02, 0.13, 'marble'); }
      if (f.kind !== 'mihrab') {
        for (const [s0, s1] of runs) f.box(s0, s1, y + 1.35, y + H, -0.02, 0.05, T);
        if (f.kind === 'door') {
          f.box(-DOOR, DOOR, y + DH, y + H, -0.02, 0.05, T);
          for (const sg of [-1, 1]) f.box(sg * DOOR - (sg > 0 ? 0 : 0.25), sg * DOOR + (sg > 0 ? 0.25 : 0), y, y + DH + 0.25, -0.02, 0.15, 'marble_smooth');
          f.box(-DOOR - 0.25, DOOR + 0.25, y + DH, y + DH + 0.24, -0.02, 0.14, 'marble_smooth');
        }
      }
      // the spandrels over the arch (cream), the band of letters inside it, the field, the medallion
      const arc = archLine(w8, ah, y0, 12, false);
      for (let i = 0; i + 1 < arc.length; i++) quad('tile_cream', p, f.F(arc[i][0], arc[i][1], 0.07), f.F(arc[i + 1][0], arc[i + 1][1], 0.07), f.F(arc[i + 1][0], y + H, 0.07), f.F(arc[i][0], y + H, 0.07));
      const e0 = archLine(w8 - 0.24, ah - 0.15, y0 + 0.02), e1 = archLine(w8 - 1.5, ah - 0.95, y0 + 0.02);
      for (let i = 0; i + 1 < e0.length; i++) quad(T, p, f.F(e0[i][0], e0[i][1], 0.08), f.F(e0[i + 1][0], e0[i + 1][1], 0.08), f.F(e1[i + 1][0], e1[i + 1][1], 0.08), f.F(e1[i][0], e1[i][1], 0.08));
      letters(f, e0.slice(1, -1), e1.slice(1, -1), 0.095, p);
      for (const e of [e0, e1]) for (let i = 1; i + 2 < e.length; i++) { const q0 = e[i], q1 = e[i + 1], L = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]), nx = -(q1[1] - q0[1]) / L * 0.03, ny = (q1[0] - q0[0]) / L * 0.03; quad('tile_white', p, f.F(q0[0] - nx, q0[1] - ny, 0.09), f.F(q1[0] - nx, q1[1] - ny, 0.09), f.F(q1[0] + nx, q1[1] + ny, 0.09), f.F(q0[0] + nx, q0[1] + ny, 0.09)); }
      // the field: notched round the door or the mihrab's frame
      const fl = e1.slice(1, -1), fs = fl[0][0], fy = y0 + 0.02;
      let outline = [[fs, fy], ...fl, [-fs, fy]];
      if (gap) { const top = f.kind === 'door' ? y + DH + 0.3 : y + MFH; outline = [[fs, fy], ...fl, [-fs, fy], [gap + 0.02, fy], [gap + 0.02, top], [-gap - 0.02, top], [-gap - 0.02, fy]]; }
      f.shape(outline.reverse(), 0.06, 0.012, 'tile_cream');
      if (f.kind !== 'mihrab') {
        const yc = y0 + ah * 0.47;
        lozenge(f, 0, yc, 1.5, 2.4, 0.08, Q); lozenge(f, 0, yc, 1.32, 2.15, 0.09, T); lozenge(f, 0, yc, 0.55, 0.9, 0.1, 'tile_white'); lozenge(f, 0, yc, 0.22, 0.36, 0.11, 'glaze_yellow');
        for (const [ds, dy] of [[0, 1.6], [0, -1.6], [0.8, 0], [-0.8, 0]]) flower(f, ds, yc + dy, 0.18, 0.1);
        for (const sg of [-1, 1]) for (const dy of [-2.6, 2.6]) flower(f, sg * 1.7, yc + dy * 0.75, 0.16, 0.08);
      }
      // the cable round the arch, standing on the dado
      cable(bag, archLine(w8 + 0.02, ah + 0.02, y0, 16).map(([s, yy]) => f.F(s, yy, 0.13)), 0.1, () => [mid[0] - f.F(0, 0, 0)[0], 0, mid[2] - f.F(0, 0, 0)[2]]);
    } else {
      // a corner: the arch across it on the diagonal, the squinch closing over the corner to its top, a band of letters along the arch
      const arc = archLine(w8, ah, y0, 12, false), c0 = f.F(0, 0, 0), K = [cx + (c0[0] - cx) * Math.SQRT2, y + H, cz + (c0[2] - cz) * Math.SQRT2];
      const P3 = arc.map(([s, yy]) => f.F(s, yy, 0)), lerp = (q, g) => [q[0] + (K[0] - q[0]) * g, q[1] + (K[1] - q[1]) * g, q[2] + (K[2] - q[2]) * g], BG = 0.11;
      for (let i = 0; i + 1 < P3.length; i++) {
        quad(T, p, P3[i], P3[i + 1], lerp(P3[i + 1], BG), lerp(P3[i], BG));
        put('tile_cream', p, lerp(P3[i], BG), lerp(P3[i + 1], BG), K);
        // the letters: strokes from the arch toward the corner, standing a little proud
        const q = lerp(P3[i], 0.02), qe = lerp(P3[i], i % 4 === 2 ? 0.05 : 0.09), dx = (P3[i + 1][0] - P3[i][0]) * 0.12, dy = (P3[i + 1][1] - P3[i][1]) * 0.12, dz = (P3[i + 1][2] - P3[i][2]) * 0.12;
        const pr = (v) => [v[0] + (mid[0] - v[0]) * 0.004, v[1] + (mid[1] - v[1]) * 0.004, v[2] + (mid[2] - v[2]) * 0.004];
        quad('tile_white', p, pr([q[0] - dx, q[1] - dy, q[2] - dz]), pr([q[0] + dx, q[1] + dy, q[2] + dz]), pr([qe[0] + dx, qe[1] + dy, qe[2] + dz]), pr([qe[0] - dx, qe[1] - dy, qe[2] - dz]));
      }
      // ribs of turquoise over the squinch, from the band to the corner's top
      for (const g of [0.1, 0.3, 0.5, 0.7, 0.9]) { const i = Math.round(g * (P3.length - 1)); bag.add(Q, rod(lerp(P3[i], BG), lerp(P3[i], 0.96), 0.045, 5)); }
      cable(bag, archLine(w8 + 0.02, ah + 0.02, y0, 16, false).map(([s, yy]) => f.F(s, yy, 0.02)), 0.1, () => [mid[0] - c0[0], 0, mid[2] - c0[2]]);
    }
  }
  // the mihrab: its frame of white-edged letters on blue, little flowers in the spandrels and over the niche's back
  const fm = faces[2], pm = fm.F(0, y + 3, 4);
  for (const [s0, s1, ya, yb] of [[-MF, -MF + 0.5, y, y + MFH], [MF - 0.5, MF, y, y + MFH], [-MF, MF, y + MFH - 0.5, y + MFH]]) {
    for (const [p0, p1, q0, q1] of [[s0, s0 + 0.05, ya, yb], [s1 - 0.05, s1, ya, yb], [s0, s1, ya, ya + 0.05], [s0, s1, yb - 0.05, yb]]) fm.box(p0, p1, q0, q1, -0.02, 0.04, 'tile_white');
    if (yb - ya > 2) letters(fm, [[s0 + 0.06, ya + 0.1], [s0 + 0.06, yb - 0.55]], [[s1 - 0.06, ya + 0.1], [s1 - 0.06, yb - 0.55]], 0.03, pm);
    else letters(fm, [[s0 + 0.55, ya + 0.06], [s1 - 0.55, ya + 0.06]], [[s0 + 0.55, yb - 0.06], [s1 - 0.55, yb - 0.06]], 0.03, pm);
  }
  for (let s = -1.2; s <= 1.21; s += 0.3) for (let yy = y + MH + 0.42; yy < y + MFH - 0.6; yy += 0.3) flower(fm, s, yy, 0.09, 0.02);
  { const spring = MH - Math.sqrt((MW * 0.8) ** 2 - (MW * 0.3) ** 2), wb = Math.min(MW * 0.46, MW - 0.4); for (let s = -wb / 2 + 0.15; s < wb / 2 - 0.1; s += 0.25) for (let yy = y + 0.35; yy < y + spring - 0.45; yy += 0.3) flower(fm, s, yy, 0.07, -(MO - 0.02)); }
  cable(bag, archLine(MW + 0.3, MH + 0.25, y, 12).map(([s, yy]) => fm.F(s, yy, 0.08)), 0.07, () => [mid[0] - fm.F(0, 0, 0)[0], 0, mid[2] - fm.F(0, 0, 0)[2]]);
  // ---- the ring at the crowns of the arches, the drum, the inner dome
  const RD = a - 0.5, yD = y + H + 4, RI = RD;
  bag.add('tile_cream', lathe([[RD, 0], [a * Math.SQRT2 + 0.1, 0]], 32, null, cx, y + H - 0.01, cz));
  bag.add('tile_cream', lathe([[RD, 4.02], [RD, 0]], 48, null, cx, y + H - 0.01, cz));
  bag.add(T, lathe([[RD - 0.03, 1.35], [RD - 0.03, 0.35]], 48, null, cx, y + H, cz));
  {
    const TL = [], n = Math.round(2 * Math.PI * RD / 0.26);
    for (let k = 0; k < n; k++) {
      const an = k / n * Math.PI * 2, tall = k % 5 !== 2 && k % 7 !== 3, x = cx + Math.cos(an) * (RD - 0.05), z = cz + Math.sin(an) * (RD - 0.05);
      TL.push(...vbar(x, z, an, y + H + 0.5, tall ? 0.72 : 0.28, 0.06));
      if (k % 3 === 0) { const g = []; beamTris(g, [x, y + H + 0.45, z], [x - Math.sin(an) * 0.22, y + H + 0.45, z + Math.cos(an) * 0.22], 0.05, 0.05); TL.push(...g); }
    }
    bag.add('tile_white', fromTriangles(TL));
  }
  cable(bag, Array.from({ length: 65 }, (_, k) => { const an = k / 64 * Math.PI * 2; return [cx + Math.cos(an) * (RD - 0.05), y + H + 0.12, cz + Math.sin(an) * (RD - 0.05)]; }), 0.1, (q) => [cx - q[0], 0, cz - q[2]]);
  // sixteen windows: daylight behind grilles of white tile, framed in turquoise
  for (let k = 0; k < 16; k++) {
    const an = (k + 0.5) / 16 * Math.PI * 2, ca = Math.cos(an), sa = Math.sin(an), W2 = 0.5, wy0 = y + H + 1.6, wy1 = y + H + 3.6;
    const at = (rr) => [cx + ca * rr, cz + sa * rr], tg = [-sa, ca];
    const bx = (s0, s1, ya, yb, r0, r1, m) => { const c = at((r0 + r1) / 2), t = []; beamTris(t, [c[0] + tg[0] * s0, ya, c[1] + tg[1] * s0], [c[0] + tg[0] * s1, ya, c[1] + tg[1] * s1], (r1 - r0) / 2, yb - ya); bag.add(m, fromTriangles(t)); };
    bx(-W2, W2, wy0, wy1, RD - 0.04, RD + 0.02, 'daylight');
    for (const [s0, s1, ya, yb] of [[-W2 - 0.1, -W2, wy0, wy1 + 0.1], [W2, W2 + 0.1, wy0, wy1 + 0.1], [-W2 - 0.1, W2 + 0.1, wy0 - 0.1, wy0], [-W2 - 0.1, W2 + 0.1, wy1, wy1 + 0.1]]) bx(s0, s1, ya, yb, RD - 0.12, RD - 0.01, Q);
    for (const s of [-0.25, 0, 0.25]) bx(s - 0.025, s + 0.025, wy0, wy1, RD - 0.1, RD - 0.05, 'tile_white');
    for (let yy = wy0 + 0.33; yy < wy1 - 0.1; yy += 0.33) bx(-W2, W2, yy - 0.025, yy + 0.025, RD - 0.1, RD - 0.05, 'tile_white');
  }
  cable(bag, Array.from({ length: 65 }, (_, k) => { const an = k / 64 * Math.PI * 2; return [cx + Math.cos(an) * (RD - 0.06), yD, cz + Math.sin(an) * (RD - 0.06)]; }), 0.11, (q) => [cx - q[0], 0, cz - q[2]]);
  // the inner dome: buff brick, the rings of lemon-shaped medallions, the sunburst
  const prof = []; for (let i = 14; i >= 0; i--) { const ph = i / 14 * Math.PI / 2; prof.push([Math.max(0.001, RI * Math.cos(ph)), RI * Math.sin(ph)]); }
  bag.add(B, lathe(prof, 48, null, cx, yD, cz));
  const S3 = (th, ph, off) => [cx + Math.cos(th) * (RI - off) * Math.cos(ph), yD + (RI - off) * Math.sin(ph), cz + Math.sin(th) * (RI - off) * Math.cos(ph)], ctr = [cx, yD, cz];
  const lemon = (th, ph, hw, hl, off, m) => {
    const O = []; for (let k = 0; k < 16; k++) { const g = Math.cos(Math.PI * k / 8), side = k <= 8 ? 1 : -1, fw = Math.pow(Math.max(0, 1 - g * g), 1.2); O.push(S3(th + side * hw * fw, ph + hl * g, off)); }
    const c = S3(th, ph, off); for (let k = 0; k < 16; k++) put(m, ctr, c, O[k], O[(k + 1) % 16]);
  };
  const N = 32, dT = Math.PI * 2 / N;
  for (let j = 0, ph = 0.0; ; j++) {
    const hw = 0.36 * dT, hl0 = 1.8 * hw * Math.cos(ph || 0.1);
    if (j === 0) ph = 0.04 + hl0;
    const hl = 1.8 * hw * Math.cos(ph);
    if (RI * Math.cos(ph) < 2.7) break;
    for (let i = 0; i < N; i++) {
      const th = (i + (j % 2) * 0.5) * dT;
      lemon(th, ph, hw, hl, 0.03, 'tile_white'); lemon(th, ph, hw * 0.86, hl * 0.86, 0.05, 'glaze_yellow');
      lemon(th, ph, hw * 0.5, hl * 0.55, 0.07, T); lemon(th, ph, hw * 0.16, hl * 0.18, 0.09, Q);
    }
    ph += 1.1 * hl;
  }
  {
    const ring = (r0, r1, off, m, n = 48, from = 0, step = 1, frac = 1) => { for (let k = from; k < n; k += step) { const t0 = k / n * Math.PI * 2, t1 = (k + frac) / n * Math.PI * 2, p0 = Math.acos(Math.min(1, r0 / RI)), p1 = Math.acos(Math.min(1, r1 / RI)); quad(m, ctr, S3(t0, p0, off), S3(t1, p0, off), S3(t1, p1, off), S3(t0, p1, off)); } };
    ring(2.25, 2.6, 0.04, T); ring(2.2, 2.25, 0.05, 'tile_white'); ring(2.6, 2.65, 0.05, 'tile_white');
    for (let k = 0; k < 24; k++) { const t0 = k / 24 * Math.PI * 2, tw = Math.PI * 2 / 24 * 0.42, p0 = Math.acos(1.0 / RI), p1 = Math.acos(2.2 / RI); put(k % 2 ? 'tile_white' : Q, ctr, S3(t0 - tw, p0, 0.05), S3(t0 + tw, p0, 0.05), S3(t0, p1, 0.05)); }
    const cap = []; for (let i = 6; i >= 0; i--) { const ph = Math.acos(1.05 / RI) + (Math.PI / 2 - Math.acos(1.05 / RI)) * i / 6; cap.push([Math.max(0.001, (RI - 0.06) * Math.cos(ph)), (RI - 0.06) * Math.sin(ph)]); }
    bag.add('glaze_yellow', lathe(cap, 24, null, cx, yD, cz));
    ring(0.35, 0.9, 0.08, T, 8, 0, 1, 0.5);
  }
  for (const [m, t] of tris) bag.add(m, fromTriangles(t));
  // ---- the floor, the passage from the portal's vestibule
  const poly = (pts, y0p, y1p, m) => prism(bag, m, pts.map(([u, v]) => pt(u, v)), pts.map(([u, v]) => pt(u, v)), y0p, y1p);
  poly([[-a, -a], [a, -a], [a, a], [-a, a]], y - 0.05, y + 0.04, 'marble_floor');
  poly([[-1, -A - 1], [1, -A - 1], [1, -a], [-1, -a]], y - 0.05, y + 0.04, 'marble_floor');
  const P = el.interior.passage;
  if (P) {
    const W = 2.6, o0 = A + 1, o1 = o0 + W, ow = o1 + 0.3, ch = 4.5, top = 5.5;
    // the vestibule's east face in local terms: v where world x = P.x at a given u
    const vx = (u) => (cx + u * Math.cos(rot) - P.x) / Math.sin(rot);
    slab(bag, col, WM, pt(-ow, vx(-ow)), pt(-ow, -ow - 0.3), y, 0.6, top);             // the outer wall of the north-eastward leg
    slab(bag, col, WM, pt(-ow - 0.3, -ow), pt(1.9, -ow), y, 0.6, top);                 // the outer wall of the south-eastward leg
    slab(bag, col, WM, pt(1.9, -o0 + 0.1), pt(1.9, -ow - 0.3), y, 0.6, top);          // the end
    poly([[-ow - 0.3, -ow - 0.3], [2.2, -ow - 0.3], [2.2, -o0 + 0.1], [-ow - 0.3, -o0 + 0.1]], y + ch, y + ch + 0.5, WM);
    poly([[-ow - 0.3, -o0 + 0.1], [-o0 + 0.1, -o0 + 0.1], [-o0 + 0.1, vx(-o0 + 0.1)], [-ow - 0.3, vx(-ow - 0.3)]], y + ch, y + ch + 0.5, WM);
    poly([[-o1, -o1], [1.6, -o1], [1.6, -o0], [-o1, -o0]], y - 0.05, y + 0.03, 'brick_paving');
    poly([[-o1, -o0], [-o0, -o0], [-o0, vx(-o0)], [-o1, vx(-o1)]], y - 0.05, y + 0.03, 'brick_paving');
    // the passage's lamps
    for (const [u, v] of [[-(o0 + o1) / 2, -3], [-6, -(o0 + o1) / 2]]) { const q = pt(u, v); hangingLamp(bag, lights, q[0], y + 3.1, q[1], y + ch, 4, 9); }
  }
}

/**
 * sagittarius: the tile panel crowning the Qeysarieh portal's iwan (docs/settlements/isfahan.md §14) { c: [x, z] (the
 * middle of its foot on the wall's face), n: [nx, nz] (out of the wall), y0, w, h }: in a turquoise frame and a white
 * border, on a blue ground strewn with little flowers, Sagittarius as the sources describe him — a tiger's body, a
 * man's head and a dragon's tail — the archer turned back on his tiger's body drawing his bow at the dragon's head at
 * the end of his own tail. Mosaic tile: flat pieces laid a few millimetres proud of each other.
 */
function sagittarius(el, { bag }) {
  const [cx, cz] = el.c, [nx, nz] = el.n, tx = nz, tz = -nx, y0 = el.y0, w = el.w ?? 5, h = el.h ?? 2.5, k = h / 2.5;
  const lay = (pts, o, m, d = 0.008) => {
    const sh = new Shape(); sh.moveTo(pts[0][0] * k, pts[0][1] * k); for (const q of pts.slice(1)) sh.lineTo(q[0] * k, q[1] * k);
    const g = new ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 3 });
    g.applyMatrix4(new Matrix4().makeBasis({ x: tx, y: 0, z: tz }, { x: 0, y: 1, z: 0 }, { x: nx, y: 0, z: nz }).setPosition(cx + nx * o, y0, cz + nz * o));
    bag.add(m, g);
  };
  const rect = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  const ell = (u, v, a, b, n = 20, rot = 0) => Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2, c = Math.cos(t) * a, s = Math.sin(t) * b; return [u + c * Math.cos(rot) - s * Math.sin(rot), v + c * Math.sin(rot) + s * Math.cos(rot)]; });
  // a band along a polyline, its width going from w0 to w1
  const strip = (pts, w0, w1) => {
    const L = [], R2 = [];
    pts.forEach((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1, ww = (w0 + (w1 - w0) * i / (pts.length - 1)) / 2; L.push([p[0] - dy / l * ww, p[1] + dx / l * ww]); R2.push([p[0] + dy / l * ww, p[1] - dx / l * ww]); });
    return [...L, ...R2.reverse()];
  };
  const W2 = w / 2 / k, H2 = h / k;                                          // the panel in units of a 2.5 m high one
  lay(rect(-W2, 0, W2, H2), 0, Q, 0.03);
  lay(rect(-W2 + 0.1, 0.1, W2 - 0.1, H2 - 0.1), 0.03, 'tile_white');
  lay(rect(-W2 + 0.17, 0.17, W2 - 0.17, H2 - 0.17), 0.038, T);
  // the ground's little flowers: four white petals round a yellow heart
  for (let u = -W2 + 0.4; u < W2 - 0.3; u += 0.42) for (let v = 0.4; v < H2 - 0.3; v += 0.42) {
    const du = ((Math.round(v / 0.42) % 2) * 0.21);
    for (const [a, b] of [[0.06, 0], [-0.06, 0], [0, 0.06], [0, -0.06]]) lay(ell(u + du + a, v + b, 0.04, 0.04, 8), 0.046, 'tile_white');
    lay(ell(u + du, v, 0.025, 0.025, 8), 0.054, 'glaze_yellow');
  }
  const F = 0.06;                                                           // the figure stands proud of the ground
  // the dragon's tail: from the tiger's rump an S rising and curling back, scaled, its head facing the archer
  const tail = [[0.95, 1.1], [1.25, 1.2], [1.5, 1.42], [1.62, 1.7], [1.56, 1.95], [1.36, 2.1], [1.1, 2.12], [0.88, 2.04]];
  lay(strip(tail, 0.2, 0.13), F - 0.004, Q);
  lay(strip(tail, 0.05, 0.03), F + 0.008, 'tile_white');
  lay([[0.9, 1.97], [0.64, 2.0], [0.5, 2.1], [0.66, 2.05], [0.58, 2.2], [0.82, 2.18], [0.92, 2.2]], F, Q);   // the head with open jaws
  lay(ell(0.78, 2.13, 0.025, 0.025, 6), F + 0.008, 'glaze_yellow');
  lay([[0.84, 2.18], [0.9, 2.32], [0.94, 2.19]], F - 0.004, 'tile_white');                                          // a horn
  // the tiger's body, legs, stripes
  lay(ell(0.0, 1.05, 1.0, 0.33, 24), F, 'glaze_yellow');
  for (const [u, dir] of [[-0.75, -1], [-0.5, -1], [0.55, 1], [0.8, 1]]) {
    lay([[u - 0.08, 0.95], [u + 0.08, 0.95], [u + 0.05 + dir * 0.06, 0.32], [u - 0.05 + dir * 0.06, 0.32]], F, 'glaze_yellow');
    lay(ell(u + dir * 0.08, 0.3, 0.09, 0.05, 8), F + 0.008, 'tile_white');
  }
  for (let i = 0; i < 8; i++) { const u = -0.65 + i * 0.19; lay(strip([[u - 0.04, 1.32], [u + 0.02, 1.12], [u - 0.02, 0.9]], 0.05, 0.02), F + 0.008, 'lacquer_black'); }
  // the archer: robe, head with a crown, turned back drawing the bow toward the tail
  lay([[-1.05, 1.2], [-0.7, 1.2], [-0.74, 1.88], [-1.0, 1.88]], F + 0.004, 'tile_white');
  lay(rect(-1.04, 1.4, -0.71, 1.46), F + 0.012, 'tile_turquoise');
  lay(ell(-0.87, 2.04, 0.13, 0.15, 14), F + 0.004, 'tile_cream');
  lay([[-1.0, 2.15], [-0.74, 2.15], [-0.78, 2.3], [-0.87, 2.24], [-0.96, 2.3]], F + 0.008, 'glaze_yellow');
  lay(strip([[-0.74, 1.8], [-0.5, 1.88], [-0.3, 1.92]], 0.07, 0.06), F + 0.008, 'tile_white');           // the bow arm, to the right
  lay(strip([[-0.95, 1.82], [-0.8, 1.94], [-0.66, 1.93]], 0.07, 0.06), F + 0.012, 'tile_white');         // the drawing arm
  lay(strip([[-0.32, 1.6], [-0.23, 1.76], [-0.2, 1.93], [-0.23, 2.1], [-0.32, 2.26]], 0.035, 0.035), F + 0.016, 'lacquer_black');   // the bow
  lay(strip([[-0.32, 1.6], [-0.66, 1.93], [-0.32, 2.26]], 0.012, 0.012), F + 0.014, 'tile_white');     // the string drawn back
  lay(strip([[-0.68, 1.93], [0.45, 2.02]], 0.022, 0.022), F + 0.018, 'lacquer_black');                     // the arrow at the dragon
  lay([[0.45, 1.98], [0.56, 2.03], [0.45, 2.07]], F + 0.018, 'lacquer_black');
}

/** A thin upright bar standing out of a round drum at angle a: w wide (along the drum), from y0 up by h. */
function vbar(x, z, a, y0, h, w) {
  const t = [], tx = -Math.sin(a) * w / 2, tz = Math.cos(a) * w / 2;
  beamTris(t, [x - tx, y0, z - tz], [x + tx, y0, z + tz], 0.05, h);
  return t;
}
/**
 * The net of arabesques laid over a dome (docs/settlements/isfahan.md §10): bands spiralling up from
 * the drum both ways, so that they cross in a net of lozenges growing smaller toward the crown, a
 * pale line along the middle of each band and a medallion at each crossing. net: { n (bands each
 * way), turn (sectors each band sweeps), band, line, knot (materials) }.
 */
function domeNet(bag, net, x, y, z, r, h, bulge) {
  const prof = domeProfile(r, h, bulge), N = net.n ?? 16, K = net.turn ?? 3, t0 = 0.05, t1 = 0.86, steps = 44;
  const at = (t, phi, off) => {
    const f = t * 20, i = Math.min(19, Math.floor(f)), u = f - i, [r0, y0] = prof[i], [r1, y1] = prof[i + 1];
    const rr = r0 + (r1 - r0) * u, yy = y0 + (y1 - y0) * u, dl = Math.hypot(r1 - r0, y1 - y0) || 1, nr = (y1 - y0) / dl, ny = -(r1 - r0) / dl;
    return [x + Math.cos(phi) * (rr + nr * off), y + yy + ny * off, z + Math.sin(phi) * (rr + nr * off)];
  };
  const band = (sg, i, w, off, T) => {
    const phi = (t) => i / N * Math.PI * 2 + sg * (t - t0) / (t1 - t0) * K / N * Math.PI * 2;
    for (let k = 0; k < steps; k++) {
      const ta = t0 + (t1 - t0) * k / steps, tb = t0 + (t1 - t0) * (k + 1) / steps;
      // the band's half-width as an angle, narrowing with the dome's radius toward the crown
      const ra = Math.max(0.6, at(ta, 0, 0)[0] - x), rb = Math.max(0.6, at(tb, 0, 0)[0] - x), da = w / 2 / ra, db = w / 2 / rb;
      const A0 = at(ta, phi(ta) - da, off), A1 = at(ta, phi(ta) + da, off), B0 = at(tb, phi(tb) - db, off), B1 = at(tb, phi(tb) + db, off);
      const a0 = at(ta, phi(ta) - da, -0.03), a1 = at(ta, phi(ta) + da, -0.03), b0 = at(tb, phi(tb) - db, -0.03), b1 = at(tb, phi(tb) + db, -0.03);
      const inner = at((ta + tb) / 2, phi((ta + tb) / 2), off - 1), mid = at((ta + tb) / 2, phi((ta + tb) / 2), off * 0.5);
      tri(T, inner, A0, B1, B0); tri(T, inner, A0, A1, B1);                     // the face, outward
      tri(T, mid, a0, B0, b0); tri(T, mid, a0, A0, B0);                         // its two edges, away from its middle
      tri(T, mid, a1, b1, B1); tri(T, mid, a1, B1, A1);
    }
  };
  const TB = [], TL = [];
  for (const sg of [-1, 1]) for (let i = 0; i < N; i++) { band(sg, i, net.width ?? 0.42, 0.05, TB); band(sg, i, (net.width ?? 0.42) * 0.3, 0.08, TL); }
  bag.add(net.band ?? T, fromTriangles(TB));
  bag.add(net.line ?? 'tile_white', fromTriangles(TL));
  // the medallions where the bands cross
  const TK = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let m = -K; m <= K; m++) {
    const d = (j - i) / N * Math.PI * 2 + m * Math.PI * 2, tt = t0 + d / 2 / (K / N * Math.PI * 2) * (t1 - t0);
    if (tt <= t0 + 0.01 || tt >= t1 - 0.02) continue;
    const phi = i / N * Math.PI * 2 + (tt - t0) / (t1 - t0) * K / N * Math.PI * 2, rr = Math.max(0.6, at(tt, 0, 0)[0] - x), s = (net.knot ?? 0.5) * Math.min(1, rr / r + 0.25);
    const c = at(tt, phi, 0.1), e = at(tt, phi + s / rr, 0.1), w = at(Math.min(t1, tt + s / h), phi, 0.1), q = at(tt, phi - s / rr, 0.1), sth = at(Math.max(0, tt - s / h), phi, 0.1);
    const c0 = at(tt, phi, -0.02), inner = at(tt, phi, -1), axis = at(tt, phi, 0.04);
    tri(TK, inner, c, e, w); tri(TK, inner, c, w, q); tri(TK, inner, c, q, sth); tri(TK, inner, c, sth, e);
    for (const [p0, p1] of [[e, w], [w, q], [q, sth], [sth, e]]) tri(TK, axis, c0, p1, p0);
  }
  bag.add(net.knot_mat ?? Q, fromTriangles(TK));
}
/** Push the triangle a b c into T, wound to face away from the point `from`. */
function tri(T, from, a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const mx = (a[0] + b[0] + c[0]) / 3 - from[0], my = (a[1] + b[1] + c[1]) / 3 - from[1], mz = (a[2] + b[2] + c[2]) / 3 - from[2];
  if (nx * mx + ny * my + nz * mz >= 0) T.push(...a, ...b, ...c); else T.push(...a, ...c, ...b);
}
/** court_arcade: a two-storey arcade a→b facing a court { y, h, bay, depth, facing, mat }: tiled, arches recessed, the mass behind. */
function courtArcade(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h ?? 14, D = el.depth ?? 12, bay = el.bay ?? 6, mat = el.mat ?? T;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / bay)), w = L / n;
  const [nx, nz] = awayFrom(a, b, el.facing), behind = [(a[0] + b[0]) / 2 + nx * 100, (a[1] + b[1]) / 2 + nz * 100];
  const arches = [];
  // each bay a recess under a pointed half-dome (docs/settlements/isfahan.md §4): the walls and the floor in cream
  // tile, a band of muqarnas cells at the springing in cream, the hood in lapis with its net of ribs (karbandi)
  // in turquoise; set 5 cm short of the mass behind so that the back walls do not share its face
  const niche = { alcove: 'rect', depth: 2.45, plain: true, floor: true, ribSeg: 3, ribOut: 0.022, sideMat: 'tile_cream', domeMat: 'tile_lapis', ribMat: 'tile_turquoise', cellMat: 'tile_cream' };
  for (let i = 0; i < n; i++) {
    arches.push({ ...niche, at: (i + 0.5) * w, w: w * 0.62, h: h * 0.4, sill: 0.4 });
    arches.push({ ...niche, at: (i + 0.5) * w, w: w * 0.62, h: h * 0.36, sill: h * 0.5 });
  }
  arcadeWall(bag, col, a, b, y, h, 1.2, mat, arches, behind);
  const m0 = [a[0] + nx * (3.1 + D) / 2, a[1] + nz * (3.1 + D) / 2], m1 = [b[0] + nx * (3.1 + D) / 2, b[1] + nz * (3.1 + D) / 2];
  slab(bag, col, B, m0, m1, y, D - 3.1, h - 0.05);
  // the roof over the recesses, between the face and the mass (it lay open to the sky)
  const r0 = [a[0] + nx * 1.85, a[1] + nz * 1.85], r1 = [b[0] + nx * 1.85, b[1] + nz * 1.85];
  slab(bag, null, B, r0, r1, y + h - 0.6, 2.5, 0.55);
}

/** wall: a plain wall a→b { y, h, th, mat } with a rounded coping. */
function wall(el, { bag, col }) {
  slab(bag, col, el.mat ?? 'kahgel', el.a, el.b, el.y ?? 0, el.th ?? 0.8, el.h);
  slab(bag, null, el.mat ?? 'kahgel', el.a, el.b, (el.y ?? 0) + el.h, (el.th ?? 0.8) + 0.2, 0.25);
}

/** arcade: a face a→b with arched openings { y, h, th, mat, arches, facing } (the recesses go away from `facing`). */
function arcade(el, { bag, col }) {
  const [nx, nz] = awayFrom(el.a, el.b, el.facing);
  arcadeWall(bag, col, el.a, el.b, el.y ?? 0, el.h, el.th ?? 1, el.mat ?? B, el.arches || [], [(el.a[0] + el.b[0]) / 2 + nx * 100, (el.a[1] + el.b[1]) / 2 + nz * 100]);
}

/** mass: a solid block a→b (its centre line) { y, th, h, mat }: the bulk of a building, its top walkable by the roof field. */
function mass(el, { bag, col }) { slab(bag, col, el.mat ?? B, el.a, el.b, el.y ?? 0, el.th, el.h); }

/**
 * talar: a columned terrace { rect, y, h, cols: [nx, nz], rail, pool } (docs/settlements/isfahan.md
 * §10): slender wooden columns, many-sided, on stone bases, their shafts banded with mirror work,
 * stepped muqarnas capitals under the bolsters; the main beams over the rows of columns, a grid of
 * joists and coffers under the painted ceiling; a balustrade of posts and lattice on the open
 * sides; the copper-lined pool with its fountain in the middle of the floor.
 */
function talar(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h, [nx, nz] = el.cols;
  bag.add(B, box(x0, y - 0.4, z0, x1, y, z1)); col.floor([x0, z0, x1, z1], y);
  const xs = [], zs = [];
  for (let i = 0; i < nx; i++) xs.push(x0 + 0.8 + (x1 - x0 - 1.6) * (nx > 1 ? i / (nx - 1) : 0.5));
  for (let j = 0; j < nz; j++) zs.push(z0 + 0.8 + (z1 - z0 - 1.6) * (nz > 1 ? j / (nz - 1) : 0.5));
  for (const x of xs) for (const z of zs) {
    bag.add('marble', box(x - 0.42, y, z - 0.42, x + 0.42, y + 0.25, z + 0.42));
    bag.add('marble', lathe([[0.4, 0], [0.38, 0.12], [0.3, 0.3], [0.27, 0.42]], 16, null, x, y + 0.25, z));
    bag.add('timber', lathe([[0.25, 0], [0.19, h - 1.6]], 16, null, x, y + 0.67, z));
    for (const f of [0.18, 0.42, 0.66]) bag.add('mirror_work', lathe([[0.26 - 0.06 * f, 0], [0.26 - 0.06 * f, 0.7], [0.25 - 0.06 * f, 0.72]], 16, null, x, y + 0.67 + (h - 1.6) * f, z));
    // the capital: four stepped tiers of little niches, then the bolster under the beam
    let yc = y + h - 0.93;
    for (let k = 0; k < 4; k++) {
      const r = 0.22 + k * 0.1, hh = 0.16;
      bag.add('timber', lathe([[r, 0], [r + 0.07, hh], [0.001, hh]], 8, null, x, yc, z));
      bag.add('paint_blue', lathe([[r + 0.028, hh * 0.25], [r + 0.07, hh * 0.85]], 8, null, x, yc, z));
      yc += hh;
    }
    bag.add('timber', box(x - 0.6, yc, z - 0.35, x + 0.6, y + h - 0.45, z + 0.35));
    col.circle(x, z, 0.3, y, y + h);
  }
  // the main beams over the rows of columns (along z), the joists across them and the coffers' frames
  for (const x of xs) bag.add('timber', box(x - 0.3, y + h - 0.45, z0, x + 0.3, y + h - 0.02, z1));
  for (let z = z0 + 0.75; z < z1 - 0.3; z += 1.5) bag.add('timber', box(x0 - 0.3, y + h - 0.32, z - 0.09, x1 + 0.3, y + h - 0.02, z + 0.09));
  for (let x = x0 + 0.75; x < x1 - 0.3; x += 1.5) if (!xs.some((c) => Math.abs(c - x) < 0.5)) bag.add('timber', box(x - 0.07, y + h - 0.2, z0, x + 0.07, y + h - 0.02, z1));
  bag.add('timber', box(x0 - 0.6, y + h, z0 - 0.6, x1 + 0.6, y + h + 0.9, z1 + 0.6));
  bag.add('ceiling_painted', box(x0, y + h - 0.02, z0, x1, y + h, z1));
  // the balustrade: posts, a rail, a lattice between
  for (const r of el.rail || []) {
    const [a, b] = r, L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 1.5)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    slab(bag, col, 'timber', a, b, y, 0.16, 0.12);
    slab(bag, null, 'timber', a, b, y + 0.92, 0.2, 0.1);
    const ia = [a[0] + ux * 0.1, a[1] + uz * 0.1], ib = [b[0] - ux * 0.1, b[1] - uz * 0.1];
    slab(bag, null, 'lattice', ia, ib, y + 0.12, 0.04, 0.8);
    for (let i = 0; i <= n; i++) { const p = [a[0] + ux * L * i / n, a[1] + uz * L * i / n]; bag.add('timber', box(p[0] - 0.08, y, p[1] - 0.08, p[0] + 0.08, y + 1.08, p[1] + 0.08)); }
    col.segment(a, b, 0.2, y, y + 1.0);
  }
  // the pool in the middle of the floor: a copper lining, a stone rim, the water and the jet's spout
  if (el.pool !== false) {
    // between the columns nearest the middle: half the gap less a column's base and the rim
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, near = (vs, c) => Math.min(...vs.map((v) => Math.abs(v - c) < 0.01 ? Infinity : Math.abs(v - c)));
    const pw = Math.max(0.5, Math.min(1.6, near(xs, cx) - 0.8)), pd = Math.max(0.5, Math.min(2.4, near(zs, cz) - 0.8));
    bag.add('marble', box(cx - pw - 0.3, y, cz - pd - 0.3, cx + pw + 0.3, y + 0.1, cz + pd + 0.3)); col.rect([cx - pw - 0.3, cz - pd - 0.3, cx + pw + 0.3, cz + pd + 0.3], y, y + 0.4);
    for (const [a0, b0, a1, b1] of [[-pw - 0.3, -pd - 0.3, pw + 0.3, -pd], [-pw - 0.3, pd, pw + 0.3, pd + 0.3], [-pw - 0.3, -pd, -pw, pd], [pw, -pd, pw + 0.3, pd]]) bag.add('marble', box(cx + a0, y + 0.1, cz + b0, cx + a1, y + 0.4, cz + b1));
    bag.add('bronze', box(cx - pw, y + 0.1, cz - pd, cx + pw, y + 0.12, cz + pd));
    for (const [a0, b0, a1, b1] of [[-pw, -pd, pw, -pd + 0.02], [-pw, pd - 0.02, pw, pd], [-pw, -pd + 0.02, -pw + 0.02, pd - 0.02], [pw - 0.02, -pd + 0.02, pw, pd - 0.02]]) bag.add('bronze', box(cx + a0, y + 0.12, cz + b0, cx + a1, y + 0.38, cz + b1));
    bag.add('water', box(cx - pw + 0.02, y + 0.12, cz - pd + 0.02, cx + pw - 0.02, y + 0.33, cz + pd - 0.02));
    bag.add('bronze', lathe([[0.18, 0], [0.12, 0.08], [0.05, 0.3], [0.09, 0.42], [0.03, 0.5], [0.001, 0.52]], 12, null, cx, y + 0.12, cz));
  }
}

/** goalpost: a pair of stone polo posts { c, along ('x'|'z'), gap, h }. */
function goalpost(el, { bag, col }) {
  const [x, z] = el.c, g = (el.gap ?? 7) / 2, h = el.h ?? 3.2;
  for (const s of [-1, 1]) {
    const px = el.along === 'z' ? x : x + s * g, pz = el.along === 'z' ? z + s * g : z;
    bag.add('marble', lathe([[0.45, 0], [0.45, 0.3], [0.32, 0.45], [0.3, h - 0.3], [0.4, h - 0.15], [0.001, h]], 12, null, px, 0, pz));
    col.circle(px, pz, 0.45, 0, h);
  }
}

/**
 * bazaar: a vaulted bazaar street from a to b (axis-aligned) { w (5), h (7), bay (5), shops
 * (depth) }: shops on both sides under a second storey, the street roofed with a row of domes,
 * each with an opening for light.
 */
function bazaar(el, { bag, col }) {
  const a = el.a, b = el.b, w = el.w ?? 5, h = el.h ?? 7, bay = el.bay ?? 5, S = el.shops ?? 5;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const n = Math.max(1, Math.round(L / bay)), bw = L / n;
  for (const s of [-1, 1]) {
    const o = s * (w / 2 + 0.3), p0 = [a[0] + nx * o, a[1] + nz * o], p1 = [b[0] + nx * o, b[1] + nz * o];
    const arches = [];
    for (let i = 0; i < n; i++) arches.push({ at: (i + 0.5) * bw, w: bw * 0.7, h: 3.4, depth: 2.6, back: 'kahgel' }, { at: (i + 0.5) * bw, w: bw * 0.45, h: 1.6, sill: 4.2, depth: 0.5, back: 'lacquer_black' });
    arcadeWall(bag, col, p0, p1, 0, h, 0.6, B, arches, [p0[0] + nx * s * 50, p0[1] + nz * s * 50]);
    const m = s * (w / 2 + 0.6 + 2.6 + S / 2);
    slab(bag, col, B, [a[0] + nx * m, a[1] + nz * m], [b[0] + nx * m, b[1] + nz * m], 0, S, h + 0.6);
  }
  // the arches across the street at each bay, the domes over the bays with their light openings
  for (let i = 0; i <= n; i++) {
    const c = [a[0] + ux * i * bw, a[1] + uz * i * bw];
    slab(bag, null, B, [c[0] - nx * (w / 2 + 0.3), c[1] - nz * (w / 2 + 0.3)], [c[0] + nx * (w / 2 + 0.3), c[1] + nz * (w / 2 + 0.3)], h - 0.6, 0.7, 0.6);
  }
  for (let i = 0; i < n; i++) {
    const c = [a[0] + ux * (i + 0.5) * bw, a[1] + uz * (i + 0.5) * bw], r = Math.min(bw, w + 0.6) / 2 - 0.15;
    const prof = [[r, 0], [r * 0.92, r * 0.4], [r * 0.6, r * 0.78], [r * 0.18, r * 0.9]];
    bag.add(B, lathe([...prof, [r * 0.18, r * 1.05], [0.001, r * 1.05]], 16, null, c[0], h - 0.6, c[1]));
    // the pendentives: a plate over the bay with the dome's round opening, then the dome's inside
    const sh = new Shape(), hw = bw / 2, hd = w / 2 + 0.3;
    sh.moveTo(-hw, -hd); sh.lineTo(hw, -hd); sh.lineTo(hw, hd); sh.lineTo(-hw, hd); sh.lineTo(-hw, -hd);
    const hole = new Path(); hole.absarc(0, 0, r * 0.94, 0, Math.PI * 2, true); sh.holes.push(hole);
    const g = new ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false, curveSegments: 16 });
    const ang = Math.atan2(uz, ux);
    g.rotateX(Math.PI / 2); g.rotateY(-ang); g.translate(c[0], h - 0.3, c[1]);
    bag.add(B, g);
    // the inside of the dome (seen from the street), open at its crown for light
    bag.add('kahgel', lathe(prof.map(([q, yy]) => [q * 0.94, yy * 0.94]).reverse(), 16, null, c[0], h - 0.6, c[1]));
  }
  const m = w / 2 + 3.5 + S, xs = [a[0] + nx * m, a[0] - nx * m, b[0] + nx * m, b[0] - nx * m], zs = [a[1] + nz * m, a[1] - nz * m, b[1] + nz * m, b[1] - nz * m];
  if (Math.abs(ux) < 1e-6 || Math.abs(uz) < 1e-6) col.floor([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], h + 0.6);
}

/**
 * khaneh: a courtyard house { rect, seed }: rooms round a court — straw-mud walls blind to the
 * lane, the court with a pool and a planted bed, a taller summer hall (talar) with a deep arch
 * on its north side facing the sun, flat roofs with parapets, now and then a little dome.
 */
function khaneh(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0;
  const d = Math.min(4.2, Math.min(W, D) * 0.28), H = 4 + rand() * 1.4, hi = H + 2 + rand() * 1.5;
  const M = 'kahgel';
  // the four wings: north (the tall hall, its arch facing south into the court), south, east, west
  bag.add(M, box(x0, 0, z0, x1, hi, z0 + d)); col.rect([x0, z0, x1, z0 + d], 0, hi);
  bag.add(M, box(x0, 0, z1 - d, x1, H, z1)); col.rect([x0, z1 - d, x1, z1], 0, H);
  bag.add(M, box(x0, 0, z0 + d, x0 + d, H, z1 - d)); col.rect([x0, z0 + d, x0 + d, z1 - d], 0, H);
  bag.add(M, box(x1 - d, 0, z0 + d, x1, H, z1 - d)); col.rect([x1 - d, z0 + d, x1, z1 - d], 0, H);
  col.floor([x0, z0, x1, z0 + d], hi); for (const r of [[x0, z1 - d, x1, z1], [x0, z0 + d, x0 + d, z1 - d], [x1 - d, z0 + d, x1, z1 - d]]) col.floor(r, H);
  // parapets
  for (const [a, b, y] of [[[x0, z0], [x1, z0], hi], [[x0, z1], [x1, z1], H], [[x0, z0 + d], [x0, z1], H], [[x1, z0 + d], [x1, z1], H]]) slab(bag, null, M, a, b, y, 0.3, 0.6);
  // the hall's arch on the court, doors and windows on the court, the street door
  const xc = (x0 + x1) / 2, zh = z0 + d + 0.02, aw = Math.min(W - 2 * d - 1, 3.6);
  if (aw > 1.2) { const t = []; beamTris(t, [xc - aw / 2, 0, zh], [xc + aw / 2, 0, zh], 0.03, hi * 0.72); bag.add('lacquer_black', fromTriangles(t)); bag.add('brick_buff', box(xc - aw / 2 - 0.4, hi * 0.72, zh - 0.02, xc + aw / 2 + 0.4, hi * 0.72 + 0.5, zh + 0.12)); }
  for (const [px, pz, ax] of [[xc, z1 - d - 0.02, 'x'], [x0 + d + 0.02, (z0 + z1) / 2, 'z'], [x1 - d - 0.02, (z0 + z1) / 2, 'z']]) {
    const t = []; if (ax === 'x') beamTris(t, [px - 0.6, 0, pz], [px + 0.6, 0, pz], 0.03, 2.4); else beamTris(t, [px, 0, pz - 0.6], [px, 0, pz + 0.6], 0.03, 2.4);
    bag.add('timber', fromTriangles(t));
  }
  const side = rand() < 0.5 ? 'w' : 'e', dz = (z0 + z1) / 2, dx = side === 'w' ? x0 - 0.02 : x1 + 0.02;
  { const t = []; beamTris(t, [dx, 0, dz - 0.65], [dx, 0, dz + 0.65], 0.04, 2.3); bag.add('timber', fromTriangles(t)); }
  // the court: a pool, a bed
  const cx0 = x0 + d, cz0 = z0 + d, cx1 = x1 - d, cz1 = z1 - d;
  if (cx1 - cx0 > 3 && cz1 - cz0 > 3) {
    const pw = Math.min(2.2, (cx1 - cx0) * 0.25), pd = Math.min(1.6, (cz1 - cz0) * 0.2), pc = [(cx0 + cx1) / 2, (cz0 + cz1) / 2];
    bag.add('brick_paving', box(cx0, 0, cz0, cx1, 0.08, cz1));
    bag.add('limestone', box(pc[0] - pw - 0.3, 0, pc[1] - pd - 0.3, pc[0] + pw + 0.3, 0.4, pc[1] + pd + 0.3));
    bag.add('water', box(pc[0] - pw, 0.3, pc[1] - pd, pc[0] + pw, 0.36, pc[1] + pd));
  }
  // a little dome on the south wing now and then (a vaulted room)
  if (rand() < 0.3) { const r = Math.min(d, 3) * 0.55; bag.add(M, lathe(domeProfile(r, r * 0.8, 0), 12, null, xc, H, z1 - d / 2)); }
}

// ---- Ali Qapu ------------------------------------------------------------------------------------

/** Vessels as the music room's stucco cut them out: half-profiles [half-width, height], both of a unit of height. */
const VESSELS = [
  [[0.1, 0], [0.24, 0.07], [0.34, 0.24], [0.3, 0.42], [0.13, 0.55], [0.07, 0.62], [0.065, 0.88], [0.11, 0.94], [0.08, 1]],    // the long-necked bottle (surahi)
  [[0.14, 0], [0.18, 0.05], [0.32, 0.3], [0.35, 0.48], [0.26, 0.68], [0.16, 0.78], [0.18, 0.92], [0.24, 1]],                  // the vase
  [[0.2, 0], [0.2, 0.04], [0.05, 0.1], [0.05, 0.42], [0.29, 0.55], [0.34, 0.75], [0.34, 1]],                                  // the goblet
  [[0.18, 0], [0.29, 0.12], [0.37, 0.38], [0.34, 0.6], [0.19, 0.78], [0.16, 0.88], [0.21, 1]],                               // the jar
];
/** A closed outline of vessel k, standing at (u, v), h high, as points. */
function vesselOutline(k, u, v, h) {
  // the profile smoothed (Catmull–Rom, four points a span) so the cut reads as a turned vessel
  const p = VESSELS[k % VESSELS.length], sm = [];
  for (let i = 0; i + 1 < p.length; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], d = p[Math.min(p.length - 1, i + 2)];
    for (let j = 0; j < 4; j++) { const t = j / 4, t2 = t * t, t3 = t2 * t; sm.push([0, 1].map((m) => 0.5 * (2 * b[m] + (-a[m] + c[m]) * t + (2 * a[m] - 5 * b[m] + 4 * c[m] - d[m]) * t2 + (-a[m] + 3 * b[m] - 3 * c[m] + d[m]) * t3))); }
  }
  sm.push(p[p.length - 1]);
  const R = sm.map(([w, t]) => [u + Math.max(0.02, w) * h, v + t * h]), L = sm.map(([w, t]) => [u - Math.max(0.02, w) * h, v + t * h]).reverse();
  return [...R, ...L];
}
/** A pointed-arch outline (a niche's frame) of width w, height h, its foot at (u, v), as points. */
function archOutline(u, v, w, h) {
  const r = w * 0.75, rise = Math.sqrt(r * r - (r - w / 2) ** 2), sp = h - rise, pts = [[u - w / 2, v]];
  for (let i = 0; i <= 8; i++) { const x = -w / 2 + (w / 2) * i / 8; pts.push([u + x, v + sp + Math.sqrt(Math.max(0, r * r - (x + w / 2 - r) ** 2))]); }
  for (let i = 1; i <= 8; i++) { const x = (w / 2) * i / 8; pts.push([u + x, v + sp + Math.sqrt(Math.max(0, r * r - (w / 2 - x - r) ** 2))]); }
  pts.push([u + w / 2, v]);
  return pts;
}
/**
 * A wall's lining of stucco, th thick, cut through with the outlines `holes` (in the lining's u–v
 * plane: u along the wall from s0, v up from y0), over a thin backing that shows in the holes: o is
 * a point of the wall's face, n the unit normal from it into the room, the lining from s0 to s1
 * along u = (n.z, −n.x), from y0 up H.
 */
function lining(bag, col, o, n, s0, s1, y0, H, th, holes, cuts = [], mat = 'stucco_cream', back = 'plaster_ochre') {
  const L = s1 - s0, U = [n[1], -n[0]], sh = new Shape(), bt = 0.03;
  sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  for (const pts of holes) { const p = new Path(); p.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) p.lineTo(q[0], q[1]); p.lineTo(pts[0][0], pts[0][1]); sh.holes.push(p); }
  const g = new ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 4 });
  const p0 = [o[0] + U[0] * s0 + n[0] * bt, o[1] + U[1] * s0 + n[1] * bt];
  g.applyMatrix4(new Matrix4().makeBasis({ x: U[0], y: 0, z: U[1] }, { x: 0, y: 1, z: 0 }, { x: n[0], y: 0, z: n[1] }).setPosition(p0[0], y0, p0[1]));
  bag.add(mat, g);
  const a = [o[0] + U[0] * s0, o[1] + U[1] * s0], b = [o[0] + U[0] * s1, o[1] + U[1] * s1];
  // the backing, broken where `cuts` ([s0, s1] along the wall: the windows) go through
  let u = s0;
  for (const [c0, c1] of [...cuts.sort((p, q) => p[0] - q[0]), [s1, s1]]) {
    if (c0 > u + 0.01) {
      const pa = [o[0] + U[0] * u, o[1] + U[1] * u], pb = [o[0] + U[0] * c0 + n[0] * bt, o[1] + U[1] * c0 + n[1] * bt];
      bag.add(back, box(Math.min(pa[0], pb[0]), y0, Math.min(pa[1], pb[1]), Math.max(pa[0], pb[0]), y0 + H, Math.max(pa[1], pb[1])));
    }
    u = Math.max(u, c1);
  }
  const e = [b[0] + n[0] * (bt + th), b[1] + n[1] * (bt + th)];
  col.rect([Math.min(a[0], e[0]), Math.min(a[1], e[1]), Math.max(a[0], e[0]), Math.max(a[1], e[1])], y0, y0 + H);
}
/** A straight flight of steps over rect rising y0 → y1 toward dir, each step solid down to y0 − under. */
function flight(bag, col, rect, y0, y1, dir, mat, under = 0.28) {
  const [x0, z0, x1, z1] = rect, n = Math.max(1, Math.round((y1 - y0) / 0.2));
  for (let i = 0; i < n; i++) {
    const f = i / n, yt = y0 + (y1 - y0) * (i + 1) / n;
    const r = dir === 'e' ? [x0 + (x1 - x0) * f, z0, x1, z1] : dir === 'w' ? [x0, z0, x1 - (x1 - x0) * f, z1] : dir === 's' ? [x0, z0 + (z1 - z0) * f, x1, z1] : [x0, z0, x1, z1 - (z1 - z0) * f];
    bag.add(mat, box(r[0], i === 0 ? y0 - under : yt - 0.2 - under, r[1], r[2], yt, r[3]));
  }
  col.ramp(rect, y0, y1, dir);
}
/** A balustrade a→b at floor height y: posts, a rail, wooden lattice between. */
function balustrade(bag, col, a, b, y, h = 0.95) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.max(1, Math.round(L / 1.1));
  slab(bag, null, 'wood_dark', a, b, y, 0.12, 0.1);
  slab(bag, null, 'wood_dark', a, b, y + h - 0.08, 0.14, 0.08);
  slab(bag, null, 'lattice', [a[0] + ux * 0.06, a[1] + uz * 0.06], [b[0] - ux * 0.06, b[1] - uz * 0.06], y + 0.1, 0.03, h - 0.18);
  for (let i = 0; i <= n; i++) { const p = [a[0] + ux * L * i / n, a[1] + uz * L * i / n]; bag.add('wood_dark', box(p[0] - 0.06, y, p[1] - 0.06, p[0] + 0.06, y + h + 0.04, p[1] + 0.06)); }
  col.segment(a, b, 0.14, y, y + h);
}
/** A hanging lamp at (x, y, z) under a ceiling at yc: chain, a pierced brass body, its light. */
function hangingLamp(bag, lights, x, y, z, yc, intensity = 5, distance = 10) {
  bag.add('bronze', box(x - 0.015, y + 0.3, z - 0.015, x + 0.015, yc, z + 0.015));
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0.05], [0.2, 0.16], [0.17, 0.26], [0.05, 0.3], [0.001, 0.31]], 12, null, x, y, z));
  lights.push({ at: [x, y + 0.1, z], color: '#ffb46b', intensity, distance });
}

/**
 * ali_qapu: the palace gateway on the west side of the square { rect, tower, top } (docs/settlements/
 * isfahan.md §11), its face to the square on +x. The gate block (13 m): the vaulted passage from the
 * door on the square, two storeys with the hall of the chancellery over it; behind, the square tower
 * rising to `top` with the reception chamber on the talar's level, two storeys of rooms over it and
 * the music room at the top, its walls lined with stucco cut through in the shapes of bottles, vases,
 * goblets and jars in rows of arched niches. An enclosed stair on the south side, steep, winding up
 * round a square newel in four flights a storey, joins them all; windows of wooden lattice; painted
 * ceilings on beams, carpets and bolsters, hanging lamps. (The talar on its columns is the `talar` element.)
 */
function aliQapu(el, { bag, col, lights }) {
  const [X0, Z0, X1, Z1] = el.rect, XT = el.tower ?? X0 + 12, TOP = el.top ?? 38;
  const Y = [0, 6.5, 13, 19.5, 26, 32.5], q = 6.5 / 4, P = 'plaster_persian';
  const at = (dx, dz) => [X0 + dx, Z0 + dz];
  const solid = (mat, x0, z0, x1, z1, y0, y1, c = true) => { bag.add(mat, box(x0, y0, z0, x1, y1, z1)); if (c) col.rect([x0, z0, x1, z1], y0, y1); };
  const floorAt = (r, y, fin = 'brick_paving', ceil = 'ceiling_painted') => { bag.add(ceil, box(r[0], y - 0.5, r[1], r[2], y - 0.03, r[3])); bag.add(fin, box(r[0], y - 0.03, r[1], r[2], y, r[3])); col.floor(r, y); };
  // the stair's well: clear [wx0, wz0, wx1, wz1] against the west and south walls, the newel in the middle, corner landings 1.25 m
  const wx0 = X0 + 1, wx1 = X0 + 5.5, wz1 = Z1 - 2, wz0 = wz1 - 4.5, f = 1.25, ew = 0.5;
  const C0 = [wx1 - f, wz0, wx1, wz0 + f], C1 = [wx0, wz0, wx0 + f, wz0 + f], C2 = [wx0, wz1 - f, wx0 + f, wz1], C3 = [wx1 - f, wz1 - f, wx1, wz1];
  const F1 = [wx0 + f, wz0, wx1 - f, wz0 + f], F2 = [wx0, wz0 + f, wx0 + f, wz1 - f], F3 = [wx0 + f, wz1 - f, wx1 - f, wz1], F4 = [wx1 - f, wz0 + f, wx1, wz1 - f];
  const yTop = Y[5] - 0.5;                                     // the well's walls and newel stop under the top floor
  // ---- the gate block's shell (0–13): north, south and west walls; the face to the square with its door and lattice windows
  solid(B, X0, Z0, X1 - 1, Z0 + 1, 0, 13); solid(B, X0, Z1 - 1, X1 - 1, Z1, 0, 13); solid(B, X0, Z0 + 1, X0 + 1, Z1 - 1, 0, 13);
  for (const z of [Z0, Z1 - 1]) solid(B, X1 - 1, z, X1, z + 1, 12.6, 13, false);
  const W = Z1 - Z0, zc = (Z0 + Z1) / 2;
  arcadeWall(bag, col, [X1 - 0.5, Z1], [X1 - 0.5, Z0], 0, 12.6, 1, B, [
    { at: W / 2, w: 4, h: 5.2, pass: true },
    ...[W / 2 - 4, W / 2 + 4].map((u) => ({ at: u, w: 1.8, h: 2.6, sill: 1.2, depth: -0.5, back: 'lattice' })),
    ...[3, 7, W - 7, W - 3].map((u) => ({ at: u, w: 2, h: 3, sill: 7.6, depth: -0.5, back: 'lattice' })),
  ], [X0, zc]);
  // the passage: a vaulted hall from the door, solid piers either side, the west mass carrying the tower
  const vz0 = zc - 6, vz1 = zc + 6, vx0 = X0 + 6;
  solid(P, vx0, Z0 + 1, X1 - 1, vz0, 0, 6); solid(P, vx0, vz1, X1 - 1, Z1 - 1, 0, 6);
  solid(P, X0 + 1, Z0 + 1, vx0, wz0 - ew, 0, 12.5);
  bag.add('brick_paving', box(vx0, 0, vz0, X1 - 1, 0.03, vz1));
  {
    const sh = new Shape(), half = 6, rise = 1.5, sp = 4.4, R = (half * half + rise * rise) / (2 * rise);
    sh.moveTo(-half, sp); for (let i = 1; i < 24; i++) { const u = -half + 2 * half * i / 24; sh.lineTo(u, sp + rise - (R - Math.sqrt(R * R - u * u))); }
    sh.lineTo(half, sp); sh.lineTo(half, 6); sh.lineTo(-half, 6); sh.lineTo(-half, sp);
    const g = new ExtrudeGeometry(sh, { depth: X1 - 1 - vx0, bevelEnabled: false, curveSegments: 4 });
    g.applyMatrix4(new Matrix4().makeBasis({ x: 0, y: 0, z: -1 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }).setPosition(vx0, 0, zc));
    bag.add(P, g);
    // ribs across the vault at each third, a cornice at the springing
    for (const fx of [1 / 3, 2 / 3]) {
      const x = vx0 + (X1 - 1 - vx0) * fx, rib = new Shape();
      rib.moveTo(-half, sp - 0.3); for (let i = 0; i <= 24; i++) { const u = -half + 2 * half * i / 24; rib.lineTo(u, sp + rise - (R - Math.sqrt(R * R - u * u)) - 0.22); }
      rib.lineTo(half, sp - 0.3); rib.lineTo(half, sp); for (let i = 23; i >= 1; i--) { const u = -half + 2 * half * i / 24; rib.lineTo(u, sp + rise - (R - Math.sqrt(R * R - u * u))); } rib.lineTo(-half, sp);
      const gr = new ExtrudeGeometry(rib, { depth: 0.4, bevelEnabled: false, curveSegments: 4 });
      gr.applyMatrix4(new Matrix4().makeBasis({ x: 0, y: 0, z: -1 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }).setPosition(x - 0.2, 0, zc));
      bag.add('brick_buff', gr);
    }
    for (const z of [vz0, vz1 - 0.15]) bag.add('stucco_cream', box(vx0, sp - 0.3, z, X1 - 1, sp, z + 0.15));
    hangingLamp(bag, lights, (vx0 + X1) / 2, 3.4, zc, sp + rise, 6, 12);
  }
  // ---- the hall over the passage (6.5): the chancellery, on beams under a painted ceiling
  floorAt([vx0, Z0 + 1, X1 - 1, Z1 - 1], Y[1]);
  bag.add('ceiling_painted', box(XT, 12.5, Z0 + 1, X1 - 1, 12.6, Z1 - 1));
  for (let x = vx0 + 1.4; x < X1 - 1.5; x += 2.4) bag.add('wood_dark', box(x - 0.13, 12.15, Z0 + 1, x + 0.13, 12.5, Z1 - 1));
  for (const [x0, z0, x1, z1] of [[vx0 + 2, Z0 + 2, X1 - 3, Z0 + 5.5], [vx0 + 2, Z1 - 5.5, X1 - 3, Z1 - 2]]) bag.add('cloth_red', box(x0, Y[1], z0, x1, Y[1] + 0.02, z1));
  for (const [x0, z0, x1, z1] of [[vx0 + 2, Z0 + 1.05, X1 - 3, Z0 + 1.55], [vx0 + 2, Z1 - 1.55, X1 - 3, Z1 - 1.05]]) solid('cloth_indigo', x0, z0, x1, z1, Y[1] + 0.02, Y[1] + 0.42);
  for (const x of [vx0 + 3, X1 - 5]) solid('wood_dark', x - 0.6, zc - 0.35, x + 0.6, zc + 0.35, Y[1], Y[1] + 0.75);
  hangingLamp(bag, lights, (vx0 + X1) / 2, 10.2, zc, 12.5, 5, 12);
  // ---- the tower (13 → top): walls with lattice windows on every storey, the reception chamber's three doors to the talar
  const yT = 13, H = TOP - yT, win = (u, w = 1.6, h = 2.6, extra = {}) => Y.slice(2).map((y, k) => ({ at: u, w: k === 3 ? w + 0.4 : w, h: k === 3 ? 3 : h, sill: y - yT + (k === 0 && extra.door ? 0 : 0.95), depth: -0.5, back: 'lattice', ...(k === 0 && extra.door ? { pass: true, h: 4, w: 2.2 } : {}) }));
  const inside = [(X0 + XT) / 2, zc];
  arcadeWall(bag, col, [X0, Z0 + 1.5], [XT, Z0 + 1.5], yT, H, 1, B, [...win(3), ...win(8)], inside);
  arcadeWall(bag, col, [XT, Z1 - 1.5], [X0, Z1 - 1.5], yT, H, 1, B, [...win(XT - X0 - 8), ...[0, 1, 2].map((k) => ({ at: XT - X0 - (wx0 + f + 1 - X0), w: 0.5, h: 1.2, sill: Y[2 + k] + 2 * q + 0.9 - yT, depth: -0.5, back: 'lattice' }))], inside);
  arcadeWall(bag, col, [X0 + 0.5, Z1 - 2], [X0 + 0.5, Z0 + 2], yT, H, 1, B, [...win(9), ...win(13)], inside);
  arcadeWall(bag, col, [XT - 0.5, Z1 - 2], [XT - 0.5, Z0 + 2], yT, H, 1, B, [3, 8, 13].flatMap((u) => win(u, 2, 2.6, { door: true })), inside);
  solid(B, X0, Z0 + 1, XT, Z1 - 1, TOP - 0.5, TOP, false); col.floor([X0, Z0 + 1, XT, Z1 - 1], TOP);
  bag.add('ceiling_painted', box(X0 + 1, TOP - 0.6, Z0 + 2, XT - 1, TOP - 0.5, Z1 - 2));
  for (const [a, b] of [[[X0, Z0 + 1.5], [XT, Z0 + 1.5]], [[X0, Z1 - 1.5], [XT, Z1 - 1.5]], [[X0 + 0.5, Z0 + 2], [X0 + 0.5, Z1 - 2]], [[XT - 0.5, Z0 + 2], [XT - 0.5, Z1 - 2]]]) slab(bag, col, B, a, b, TOP, 1, 0.8);
  // the floors of the tower's storeys (the stair's well left open), the reception chamber's reaching to the talar
  floorAt([X0 + 1, Z0 + 1, wx1 + ew, wz0 - ew], Y[2]); floorAt([wx1 + ew, Z0 + 1, XT, Z1 - 1], Y[2]);
  for (const y of [Y[3], Y[4]]) { floorAt([X0 + 1, Z0 + 2, wx1 + ew, wz0 - ew], y); floorAt([wx1 + ew, Z0 + 2, XT - 1, Z1 - 2], y); }
  // ---- the stair: its walls (a door at the newel's north-east corner on every storey), the newel, landings and flights
  for (let k = 0; k < 5; k++) {
    const y0 = Y[k], y1 = k === 4 ? yTop : Y[k + 1], zs = y0 < 13 ? Z1 - 1 : Z1 - 2;
    solid(P, wx0, wz0 - ew, wx1, wz0, y0, y1);                                            // the north wall
    solid(P, wx1, wz0 - ew, wx1 + ew, C0[1], y0, y1);
    solid(P, wx1, C0[3], wx1 + ew, zs, y0, y1);
    solid(P, wx1, C0[1], wx1 + ew, C0[3], y0 + 2.2, y1);                                  // the door's head
    bag.add('wood_dark', box(wx1 + ew - 0.02, y0, C0[1] - 0.08, wx1 + ew + 0.04, y0 + 2.28, C0[1]));
    bag.add('wood_dark', box(wx1 + ew - 0.02, y0, C0[3], wx1 + ew + 0.04, y0 + 2.28, C0[3] + 0.08));
    bag.add('wood_dark', box(wx1 + ew - 0.02, y0 + 2.2, C0[1], wx1 + ew + 0.04, y0 + 2.28, C0[3]));
    col.floor([wx1, C0[1], wx1 + ew, C0[3]], y0);
    const [A0, A1, A2, A3] = [y0, y0 + q, y0 + 2 * q, y0 + 3 * q];
    flight(bag, col, F1, A0, A1, 'w', 'limestone'); flight(bag, col, F2, A1, A2, 's', 'limestone');
    flight(bag, col, F3, A2, A3, 'e', 'limestone'); flight(bag, col, F4, A3, y0 + 6.5, 'n', 'limestone');
    for (const [r, y] of [[C1, A1], [C2, A2], [C3, A3]]) { bag.add('limestone', box(r[0], y - 0.3, r[1], r[2], y, r[3])); col.floor(r, y); }
    if (k > 0) { bag.add('limestone', box(C0[0], y0 - 0.3, C0[1], C0[2], y0, C0[3])); col.floor(C0, y0); }
    if (y0 < 13) solid(P, wx0, wz1, wx1, Z1 - 1, y0, Math.min(y1, 13));                  // below the tower, the strip to the gate's south wall
  }
  solid(P, wx0 + f, wz0 + f, wx1 - f, wz1 - f, 0, yTop);                                  // the newel
  hangingLamp(bag, lights, (C1[0] + C1[2]) / 2, 10, (C1[1] + C1[3]) / 2, Y[2] + q - 0.3, 3, 7);
  hangingLamp(bag, lights, (C1[0] + C1[2]) / 2, 23, (C1[1] + C1[3]) / 2, Y[4] + q - 0.3, 3, 7);
  // ---- the reception chamber (13): carpets, a low throne platform with its bolsters, painted beams
  {
    const y = Y[2], cx = (wx1 + ew + XT - 1) / 2;
    bag.add('cloth_red', box(wx1 + ew + 0.8, y, Z0 + 3, XT - 1.8, y + 0.02, Z1 - 3));
    bag.add('cloth_indigo', box(X0 + 2, y, Z0 + 3, wx1 - 0.5, y + 0.02, wz0 - 1.5));
    solid('wood_dark', wx1 + ew + 0.3, zc - 2, wx1 + ew + 2.3, zc + 2, y, y + 0.45);
    bag.add('cloth_red', box(wx1 + ew + 0.35, y + 0.45, zc - 1.95, wx1 + ew + 2.25, y + 0.5, zc + 1.95));
    solid('cloth_indigo', wx1 + ew + 0.35, zc - 1.9, wx1 + ew + 0.75, zc + 1.9, y + 0.5, y + 0.95);
    for (const s of [-1, 1]) solid('cloth_indigo', wx1 + ew + 0.75, zc + s * 1.9 - (s > 0 ? 0.4 : 0), wx1 + ew + 2.2, zc + s * 1.9 + (s < 0 ? 0.4 : 0), y + 0.5, y + 0.85);
    for (let x = wx1 + ew + 1; x < XT - 1.2; x += 2) bag.add('wood_dark', box(x - 0.12, Y[3] - 0.82, Z0 + 2, x + 0.12, Y[3] - 0.5, Z1 - 2));
    hangingLamp(bag, lights, cx, y + 3.4, zc, Y[3] - 0.5, 5, 11);
    for (const y2 of [Y[3], Y[4]]) { bag.add('cloth_red', box(wx1 + ew + 0.8, y2, Z0 + 3, XT - 1.8, y2 + 0.02, Z1 - 3)); hangingLamp(bag, lights, cx, y2 + 3.6, zc, y2 + 6, 3, 9); }
  }
  // ---- the music room (top storey): the stair's well covered but for its last flights, a balustrade round them
  {
    const y = Y[5];   // open: the last flights F3, F4 and the corner C3 between them
    for (const r of [[X0 + 1, Z0 + 2, XT - 1, wz0], [X0 + 1, wz0, C0[0], F2[3]], [X0 + 1, C2[1], wx0 + f, Z1 - 2], C0, [wx1, wz0, XT - 1, Z1 - 2]]) floorAt(r, y);
    balustrade(bag, col, [F3[0] - 0.07, F3[1]], [F3[0] - 0.07, F3[3] - 0.25], y);
    balustrade(bag, col, [F3[0], F3[1] - 0.07], [F3[2], F3[1] - 0.07], y);
    balustrade(bag, col, [F4[0] - 0.07, F4[1]], [F4[0] - 0.07, F4[3]], y);
    balustrade(bag, col, [wx1 + 0.07, F4[1]], [wx1 + 0.07, C3[3] - 0.25], y);
    // the stucco: a plain dado, then three rows of arched niches, each cut through in a vessel's shape
    const y0 = y, Hh = TOP - 0.6 - y, th = 0.22, cols = 0.9;
    // each wall one lining from e to L − e (s along u = (n.z, −n.x) from the face point o), the windows
    // (centres s, widths w) cut out of it a little larger than their arches, the niches in columns between
    const cutWall = (o, n, L, wins, e = 0) => {
      const m = Math.floor((L - 2 * e) / cols), pad = e + (L - 2 * e - m * cols) / 2, holes = [];
      for (const [c, w] of wins) holes.push(archOutline(c - e, 0.9, w + 0.3, 3.1));
      for (let i = 0; i < m; i++) {
        const u = pad + (i + 0.5) * cols;
        if (wins.some(([c, w]) => Math.abs(u - c) < w / 2 + 0.15 + cols / 2)) continue;
        for (let r = 0; r < 3; r++) {
          const v = 1.05 + r * 1.32, k = (i + r * 2 + Math.round(o[0] + o[1])) & 3;
          holes.push(r === 2 ? archOutline(u - e, v, cols - 0.2, 1.08) : vesselOutline(k, u - e, v + 0.06, r === 0 ? 1.04 : 0.98));
        }
      }
      lining(bag, col, o, n, e, L - e, y0, Hh, th, holes, wins.map(([c, w]) => [c - w / 2 - 0.15, c + w / 2 + 0.15]));
    };
    const ix0 = X0 + 1, ix1 = XT - 1, iz0 = Z0 + 2, iz1 = Z1 - 2, Lx = ix1 - ix0, Lz = iz1 - iz0, e = th + 0.03;
    cutWall([ix0, iz0], [0, 1], Lx, [[X0 + 3 - ix0, 2], [X0 + 8 - ix0, 2]]);
    cutWall([ix1, iz1], [0, -1], Lx, [[ix1 - (XT - 4), 2]]);
    cutWall([ix0, iz1], [1, 0], Lz, [[iz1 - (Z1 - 2 - 9), 2], [iz1 - (Z1 - 2 - 13), 2]], e);
    cutWall([ix1, iz0], [-1, 0], Lz, [3, 8, 13].map((u) => [(Z1 - 2 - u) - iz0, 2.4]), e);
    hangingLamp(bag, lights, (ix0 + ix1) / 2 + 1.5, y + 3.2, iz0 + Lz * 0.3, TOP - 0.6, 5, 12);
    hangingLamp(bag, lights, (ix0 + ix1) / 2 + 1.5, y + 3.2, iz0 + Lz * 0.7, TOP - 0.6, 5, 12);
  }
}

registerStyle('safavid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.mughal.elements,
    square_arcade: squareArcade, portal, dome_chamber: domeChamber, court_arcade: courtArcade,
    safavid_minaret: minaret, adobe_wall: wall, mass, arcade, talar, goalpost, bazaar, khaneh, ali_qapu: aliQapu, sagittarius,
  },
  objects: {},
});
