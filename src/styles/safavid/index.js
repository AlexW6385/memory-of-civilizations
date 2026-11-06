// Safavid architecture of Isfahan (c. 1600–1630; docs/settlements/isfahan.md §4): buff fired brick
// for walls and arcades; tile mosaic in deep blue and turquoise on the portals, iwans, drums and
// minarets; pointed arches in rectangular frames; domes on high drums (the Shah Mosque's bulbous
// and turquoise, Lotfollah's low and cream); slender tiled minarets with a wooden balcony; the
// talar, a terrace on slender wooden columns; vaulted bazaar streets lit through their domes; and
// courtyard houses of straw-mud plaster round a court with a pool.
//
// Pieces may be turned (the Shah Mosque faces Mecca, 45° off the square), so most take points a, b
// rather than axis-aligned rectangles.

import { Shape, Path, ExtrudeGeometry } from '../../core/three.js';
import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { arcadeWall, pishtaqFace } from '../mughal/index.js';

const B = 'brick_buff', T = 'tile_lapis', Q = 'tile_turquoise';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A straight wall a→b, `th` thick, from y to y + h. */
function slab(bag, col, mat, a, b, y, th, h) {
  const t = [];
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h);
  bag.add(mat, fromTriangles(t));
  if (col) col.segment(a, b, th, y, y + h);
}
/** A flat-faced frustum from the polygon `bot` at y0 to `top` at y1 (convex, same vertex count), capped. */
function prism(bag, mat, bot, top, y0, y1) {
  const n = bot.length, t = [], P = (q, y) => [q[0], y, q[1]];
  for (let k = 0; k < n; k++) {
    const a = P(bot[k], y0), b = P(bot[(k + 1) % n], y0), c = P(top[(k + 1) % n], y1), d = P(top[k], y1);
    t.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
  for (let k = 1; k < n - 1; k++) { t.push(...P(top[0], y1), ...P(top[k], y1), ...P(top[k + 1], y1)); t.push(...P(bot[0], y0), ...P(bot[k + 1], y0), ...P(bot[k], y0)); }
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
function domeChamber(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, A = el.half, rot = el.rot ?? 0, H = el.wallH;
  const pt = (u, v) => [cx + u * Math.cos(rot) - v * Math.sin(rot), cz + u * Math.sin(rot) + v * Math.cos(rot)];
  const C = [pt(-A, -A), pt(A, -A), pt(A, A), pt(-A, A)];
  for (let k = 0; k < 4; k++) slab(bag, col, el.wallMat ?? B, C[k], C[(k + 1) % 4], y, 2, H);
  // the roof of the square, the octagon of transition, the drum, the dome
  const sq = ngon(cx, cz, A * Math.SQRT2 + 0.7, 4, rot + Math.PI / 4);
  prism(bag, el.wallMat ?? B, sq, sq, y + H - 0.6, y + H);
  const dr = el.drum.r, dh = el.drum.h, r = el.dome.r;
  prism(bag, el.wallMat ?? B, ngon(cx, cz, A * 1.05 / Math.cos(Math.PI / 8), 8, rot + Math.PI / 8), ngon(cx, cz, dr * 1.06 / Math.cos(Math.PI / 8), 8, rot + Math.PI / 8), y + H, y + H + A * 0.35);
  const y1 = y + H + A * 0.35;
  bag.add(el.drumMat ?? T, lathe([[dr, 0], [dr, dh], [dr * 1.04, dh + 0.3], [r, dh + 0.5]], 32, null, cx, y1, cz));
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2, wx = cx + Math.cos(a) * (dr + 0.02), wz = cz + Math.sin(a) * (dr + 0.02), t = [];
    beamTris(t, [wx - Math.sin(a) * 0.6, y1 + dh * 0.3, wz + Math.cos(a) * 0.6], [wx + Math.sin(a) * 0.6, y1 + dh * 0.3, wz - Math.cos(a) * 0.6], 0.06, dh * 0.45);
    bag.add('lacquer_black', fromTriangles(t));
  }
  safDome(bag, el.domeMat ?? Q, cx, y1 + dh + 0.5, cz, r, el.dome.h, el.dome.bulge);
  col.circle(cx, cz, A * 1.4, y + H, y1 + dh + el.dome.h);
}

/** court_arcade: a two-storey arcade a→b facing a court { y, h, bay, depth, facing, mat }: tiled, arches recessed, the mass behind. */
function courtArcade(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h ?? 14, D = el.depth ?? 12, bay = el.bay ?? 6, mat = el.mat ?? T;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / bay)), w = L / n;
  const [nx, nz] = awayFrom(a, b, el.facing), behind = [(a[0] + b[0]) / 2 + nx * 100, (a[1] + b[1]) / 2 + nz * 100];
  const arches = [];
  for (let i = 0; i < n; i++) {
    arches.push({ at: (i + 0.5) * w, w: w * 0.62, h: h * 0.4, sill: 0.4, depth: 2.5, back: 'tile_cream' });
    arches.push({ at: (i + 0.5) * w, w: w * 0.62, h: h * 0.36, sill: h * 0.5, depth: 2.5, back: 'tile_cream' });
  }
  arcadeWall(bag, col, a, b, y, h, 1.2, mat, arches, behind);
  const m0 = [a[0] + nx * (3.1 + D) / 2, a[1] + nz * (3.1 + D) / 2], m1 = [b[0] + nx * (3.1 + D) / 2, b[1] + nz * (3.1 + D) / 2];
  slab(bag, col, B, m0, m1, y, D - 3.1, h - 0.05);
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

/** talar: a columned terrace { rect, y, h, cols: [nx, nz] }: slender wooden columns on a platform, a flat wooden roof with a painted ceiling, a railing on the open sides. */
function talar(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h, [nx, nz] = el.cols;
  bag.add(B, box(x0, y - 0.4, z0, x1, y, z1)); col.floor([x0, z0, x1, z1], y);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const x = x0 + 0.8 + (x1 - x0 - 1.6) * (nx > 1 ? i / (nx - 1) : 0.5), z = z0 + 0.8 + (z1 - z0 - 1.6) * (nz > 1 ? j / (nz - 1) : 0.5);
    bag.add('timber', lathe([[0.34, 0], [0.34, 0.5], [0.24, 0.8], [0.2, h - 1.2], [0.4, h - 0.5], [0.5, h]], 12, null, x, y, z));
    col.circle(x, z, 0.3, y, y + h);
  }
  bag.add('timber', box(x0 - 0.6, y + h, z0 - 0.6, x1 + 0.6, y + h + 0.9, z1 + 0.6));
  bag.add('ceiling_painted', box(x0, y + h - 0.02, z0, x1, y + h, z1));
  for (const r of el.rail || []) { const [a, b] = r; slab(bag, col, 'timber', a, b, y, 0.15, 1.0); }
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

registerStyle('safavid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.mughal.elements,
    square_arcade: squareArcade, portal, dome_chamber: domeChamber, court_arcade: courtArcade,
    safavid_minaret: minaret, adobe_wall: wall, mass, arcade, talar, goalpost, bazaar, khaneh,
  },
  objects: {},
});
