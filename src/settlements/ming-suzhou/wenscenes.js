// Ming Suzhou — the scenes of Wen Zhengming's record and album that the garden did not yet hold
// (docs/settlements/ming-suzhou.md §26): the flower bank before the hall, the stone seat and the
// fishing rock, the terrace, the plain thatched and tiled pavilions, the rose path and the rose
// hedge, the locust pavilion with its banana rail, the bamboo brook, the jade plot, the spring.
// Small and plain, as the Ming garden was; every piece is built in the garden's own coordinates and
// in materials the garden's plan already draws (so that no mesh of its own is added). One element,
// `wen_scene`, builds each; the plan's list is wenElements(), the routes to them wenWalks().

import { STYLES } from '../../core/build.js';
import { Parts, box, lathe, ball, table, drumStool, teaSet, qin, books, fromTriangles } from './props.js';
import { hash } from './corework.js';
import { ground } from './ground.js';
import { AT, WALKS } from './wen.js';
import { lettering, nameAt } from './boards.js';

const H = (x, z) => ground.height(x, z);
const TAU = Math.PI * 2;
const hs = (x, z, k = 0) => hash(x, z, k);

// ── pieces ───────────────────────────────────────────────────────────────────────────────────────────
/** A thin straight rod from a to b of n sides (3: a stick, 6: a post). */
function rodGeom(a, b, r, n = 3) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-6;
  const g = lathe([[r, 0], [r * 0.9, L]], n);
  g.rotateX(Math.atan2(Math.hypot(dx, dz), dy)); g.rotateY(Math.atan2(dx, dz)); g.translate(a[0], a[1], a[2]);
  return g;
}
const rod = (P, mat, a, b, r, n = 3) => P.add(mat, rodGeom(a, b, r, n));
/** A box along the segment a→b (plan), y0…y1, th thick. */
function obox(P, mat, a, b, y0, y1, th) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  const g = box(-L / 2, y0, -th / 2, L / 2, y1, th / 2); g.rotateY(-Math.atan2(dz, dx)); g.translate((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
  return P.add(mat, g);
}
/** One triangle turned to face away from `cen`. */
function solid(out, cen, a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const mx = (a[0] + b[0] + c[0]) / 3 - cen[0], my = (a[1] + b[1] + c[1]) / 3 - cen[1], mz = (a[2] + b[2] + c[2]) / 3 - cen[2];
  if (nx * mx + ny * my + nz * mz >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
const quadS = (out, cen, a, b, c, d) => { solid(out, cen, a, b, c); solid(out, cen, a, c, d); };
/** Up-facing triangle. */
function up(out, a, b, c) {
  const ux = b[0] - a[0], uz = b[2] - a[2], vx = c[0] - a[0], vz = c[2] - a[2];
  if (uz * vx - ux * vz >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
/** A rock: an ellipsoid with its surface roughened by a hash of its place; flat shaded. */
function lump(P, mat, x, y, z, rx, ry, rz, seed = 0, yaw = 0) {
  const g = ball(rx, ry, rz, 7, 4), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), k = 1 + (hs(Math.round(px * 40) + seed, Math.round(pz * 40) - seed, Math.round(py * 40)) - 0.5) * 0.28;
    p.setXYZ(i, px * k, py * (py < 0 ? 0.7 : 1) * (0.92 + 0.16 * hs(seed, i % 7, 3)), pz * k);
  }
  g.computeVertexNormals(); g.rotateY(yaw); g.translate(x, y, z);
  return P.add(mat, g);
}
/** A mass of leaf: an ellipsoid roughened by a hash of its place, flat shaded (a shrub, a tree's crown, a hedge's mound). */
function bush(P, mat, x, y, z, rx, ry, rz, seed = 0) {
  const g = ball(rx, ry, rz, 8, 4), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), k = 0.78 + 0.44 * hs(Math.round(px * 30) + seed, Math.round(pz * 30) - seed, Math.round(py * 30));
    p.setXYZ(i, px * k, py * (0.9 + 0.2 * k), pz * k);
  }
  g.computeVertexNormals(); g.translate(x, y, z);
  return P.add(mat, g);
}
const stoneStool = (P, x, y, z) => P.add('granite_grey', lathe([[0.001, 0], [0.16, 0], [0.2, 0.06], [0.17, 0.16], [0.2, 0.3], [0.22, 0.4], [0.22, 0.44], [0.001, 0.44]], 8, null, x, y, z));
const stoneTable = (P, x, y, z, r = 0.36, h = 0.74) => P.add('granite_grey', lathe([[0.001, 0], [r * 0.5, 0], [r * 0.45, 0.06], [r * 0.3, 0.12], [r * 0.3, h - 0.1], [r * 0.6, h - 0.05], [r, h - 0.04], [r, h], [0.001, h]], 10, null, x, y, z));
/** A round stone table with n stools round it (and a tea set on it), a collider each. */
function seat(P, col, x, z, y, n = 2, a0 = 0, tea = true) {
  stoneTable(P, x, y, z); col.circle(x, z, 0.36, y, y + 0.78);
  if (tea) { const Q = new Parts(); teaSet(Q); Q.emit(P, x, y + 0.74, z, a0); }
  for (let k = 0; k < n; k++) { const a = a0 + (k + 0.5) / n * TAU + 0.3 * hs(x, z, k), sx = x + Math.cos(a) * 0.74, sz = z + Math.sin(a) * 0.74; stoneStool(P, sx, y, sz); col.circle(sx, sz, 0.22, y, y + 0.46); }
}
/** A plank bench of stone: a slab on two feet along a→b. */
function stoneBench(P, col, c, yaw, y, len = 1.5) {
  const ux = Math.cos(yaw), uz = Math.sin(yaw), a = [c[0] - ux * len / 2, c[1] - uz * len / 2], b = [c[0] + ux * len / 2, c[1] + uz * len / 2];
  obox(P, 'granite_grey', a, b, y + 0.38, y + 0.46, 0.4);
  for (const s of [-1, 1]) obox(P, 'granite_block', [c[0] + ux * s * (len / 2 - 0.2) - uz * 0.16, c[1] + uz * s * (len / 2 - 0.2) + ux * 0.16], [c[0] + ux * s * (len / 2 - 0.2) + uz * 0.16, c[1] + uz * s * (len / 2 - 0.2) - ux * 0.16], y, y + 0.38, 0.12);
  const ex = Math.abs(ux) * len / 2 + Math.abs(uz) * 0.2, ez = Math.abs(uz) * len / 2 + Math.abs(ux) * 0.2;
  col.rect([c[0] - ex, c[1] - ez, c[0] + ex, c[1] + ez], y, y + 0.48);
}

/** A roof pyramid of n sides: thatch (straight, in courses, each lapping the one below) or tile (concave, the corners swept up). */
function pyramid(P, o) {
  const { n, cx, cz, y0, R, rise } = o, K = o.thatch ? 5 : 4, out = [], lipOut = [], under = [];
  const cen = [cx, y0 - 1.5, cz];
  const ring = (t, off, dy = 0) => {
    const s = (1 - t * 0.95) * R + off * (1 - t * 0.5), y = y0 + (o.thatch ? rise * t : rise * Math.pow(t, 1.45)) + dy + (o.thatch ? 0 : 0.3 * Math.pow(1 - t, 2.4));
    return Array.from({ length: n }, (_, k) => { const a = (k + 0.5) / n * TAU; return [cx + Math.cos(a) * s, y, cz + Math.sin(a) * s]; });
  };
  for (let k = 0; k < K; k++) {
    const t0 = k / K, t1 = (k + 1) / K, lip = o.thatch ? 0.09 : 0.05;
    const A = ring(t0, lip, -0.04), A0 = ring(t0, 0), B = ring(t1, 0);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      quadS(out, cen, A[i], A[j], B[j], B[i]);                      // the course
      quadS(lipOut, cen, A0[i], A0[j], A[j], A[i]);                 // its lip (the thickness of the layer)
    }
  }
  // the soffit under the eave, and the cap on the apex
  // (a ceiling of reed or board under the whole roof, facing down: the body walks in under it, and is not taken for one inside a solid roof)
  const E = ring(0, 0.09, -0.04).map(([x, , z]) => [x, y0 - 0.06, z]);
  for (let i = 0; i < n; i++) solid(under, [cx, y0 + 8, cz], [cx, y0 - 0.06, cz], E[i], E[(i + 1) % n]);
  P.add(o.mat, fromTri(out)); P.add(o.lipMat ?? 'bark_dark', fromTri(lipOut)); P.add('bark_dark', fromTri(under));
  const top = y0 + rise;
  P.add(o.thatch ? 'bark_dark' : 'tile_dark', lathe([[0.001, top - 0.05], [0.16, top - 0.05], [0.13, top + 0.12], [0.07, top + 0.22], [0.001, top + 0.3]], 8, null, cx, 0, cz));
}
const fromTri = (t) => fromTriangles(t);

/**
 * A small open pavilion on four or six posts, on a low stone platform. o: c, n (4 | 6), w (a square's side) or r (a hexagon's circumradius),
 * roof ('thatch' | 'tile'), H (post height), open (the sides left open: 'n' 'e' 's' 'w' of a square), bench (plank seats on the others).
 * Returns { fy (the floor), rect }.
 */
function pavilion(P, col, o) {
  const [cx, cz] = o.c, n = o.n ?? 4, Hh = o.H ?? 2.45, tile = o.roof === 'tile';
  const half = n === 4 ? o.w / 2 : o.r;
  const pts = n === 4 ? [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, z]) => [cx + x, cz + z]) : Array.from({ length: 6 }, (_, k) => [cx + Math.cos(k / 6 * TAU) * o.r, cz + Math.sin(k / 6 * TAU) * o.r]);
  let gmin = 9;
  for (const [x, z] of [...pts, [cx, cz], ...pts.map(([x, z]) => [x + (x - cx) * 0.5, z + (z - cz) * 0.5])]) gmin = Math.min(gmin, H(x, z));
  gmin = Math.min(gmin, H(cx, cz));
  const fy = H(cx, cz) + 0.2, post = tile ? 'lacquer_chestnut' : 'timber';
  // the platform: a granite core, a bluestone top
  if (n === 4) {
    const m = 0.38, r = [cx - half - m, cz - half - m, cx + half + m, cz + half + m];
    P.add('granite_block', box(r[0], gmin - 0.4, r[1], r[2], fy - 0.05, r[3])); P.add('bluestone', box(r[0] + 0.02, fy - 0.05, r[1] + 0.02, r[2] - 0.02, fy, r[3] - 0.02));
    col.floor(r, fy);
    // a step on each open side
    for (const s of o.open ?? []) {
      const e = s === 'e' ? [r[2], cz - 0.7, r[2] + 0.34, cz + 0.7] : s === 'w' ? [r[0] - 0.34, cz - 0.7, r[0], cz + 0.7] : s === 's' ? [cx - 0.7, r[3], cx + 0.7, r[3] + 0.34] : [cx - 0.7, r[1] - 0.34, cx + 0.7, r[1]];
      P.add('granite_block', box(e[0], gmin - 0.3, e[1], e[2], gmin + (fy - gmin) * 0.5, e[3]));
    }
  } else {
    const R = o.r + 0.55;
    P.add('granite_block', lathe([[R, gmin - 0.4], [R, fy - 0.05], [0.001, fy - 0.05]], 6, null, cx, 0, cz)); P.add('bluestone', lathe([[R - 0.03, fy - 0.05], [R - 0.03, fy], [0.001, fy]], 6, null, cx, 0, cz));
    col.floor([cx - R * 0.86, cz - R * 0.86, cx + R * 0.86, cz + R * 0.86], fy);
  }
  for (const [x, z] of pts) {
    P.add('granite_grey', lathe([[0.17, fy], [0.15, fy + 0.12], [0.001, fy + 0.12]], 8, null, x, 0, z));
    P.add(post, lathe([[0.085, fy + 0.1], [0.075, fy + Hh], [0.001, fy + Hh]], 6, null, x, 0, z));
    col.circle(x, z, 0.1, fy, fy + Hh);
  }
  for (let i = 0; i < n; i++) {   // the beam on the posts, and a lower tie
    const a = pts[i], b = pts[(i + 1) % n];
    rod(P, post, [a[0], fy + Hh - 0.08, a[1]], [b[0], fy + Hh - 0.08, b[1]], 0.07, 4);
    rod(P, post, [a[0], fy + Hh - 0.55, a[1]], [b[0], fy + Hh - 0.55, b[1]], 0.035, 3);
  }
  if (n === 4 && o.bench !== false) {
    const sides = { n: [pts[0], pts[1]], e: [pts[1], pts[2]], s: [pts[3], pts[2]], w: [pts[0], pts[3]] };
    for (const [k, [a, b]] of Object.entries(sides)) {
      if ((o.open ?? []).includes(k)) continue;
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
      const a2 = [a[0] + ux * 0.25, a[1] + uz * 0.25], b2 = [b[0] - ux * 0.25, b[1] - uz * 0.25];
      obox(P, post, a2, b2, fy + 0.42, fy + 0.46, 0.34);
      for (const t of [0.2, 0.8]) { const x = a[0] + dx * t, z = a[1] + dz * t; obox(P, post, [x - uz * 0.1, z + ux * 0.1], [x + uz * 0.1, z - ux * 0.1], fy, fy + 0.42, 0.05); }
      rod(P, post, [a2[0], fy + 0.75, a2[1]], [b2[0], fy + 0.75, b2[1]], 0.025, 4);
      const ex = Math.abs(ux) * (L / 2 - 0.2) + Math.abs(uz) * 0.2, ez = Math.abs(uz) * (L / 2 - 0.2) + Math.abs(ux) * 0.2;
      col.rect([(a[0] + b[0]) / 2 - ex, (a[1] + b[1]) / 2 - ez, (a[0] + b[0]) / 2 + ex, (a[1] + b[1]) / 2 + ez], fy, fy + 0.8);
    }
  }
  // the name board (plain: the calligraphy is another's work) hung under the beam of the side the visitor comes to
  {
    const k = o.board ?? (n === 4 ? (o.open ?? ['s'])[0] : 's'), [a, b] = n === 4 ? { n: [pts[0], pts[1]], e: [pts[1], pts[2]], s: [pts[3], pts[2]], w: [pts[0], pts[3]] }[k] : [pts[2], pts[1]];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, ox = (b[0] + a[0]) / 2 - cx, oz = (b[1] + a[1]) / 2 - cz, ol = Math.hypot(ox, oz), nx = ox / ol * 0.09, nz = oz / ol * 0.09;
    const a2 = [a[0] + ux * 0.4 + nx, a[1] + uz * 0.4 + nz], b2 = [b[0] - ux * 0.4 + nx, b[1] - uz * 0.4 + nz];
    obox(P, 'timber', [a2[0] - ux * 0.04, a2[1] - uz * 0.04], [b2[0] + ux * 0.04, b2[1] + uz * 0.04], fy + Hh - 0.67, fy + Hh - 0.21, 0.07);
    obox(P, 'lacquer_black', [a2[0] + nx * 0.2, a2[1] + nz * 0.2], [b2[0] + nx * 0.2, b2[1] + nz * 0.2], fy + Hh - 0.63, fy + Hh - 0.25, 0.07);
    lettering(P, nameAt(cx, cz), a2, b2, nx, nz, fy + Hh - 0.44);                                                    // its name, in gilt (boards.js)
  }
  const Rr = half * (n === 4 ? Math.SQRT2 : 1) + 0.95;
  pyramid(P, { n, cx, cz, y0: fy + Hh, R: Rr, rise: o.rise ?? (tile ? 1.45 : 1.65), thatch: !tile, mat: tile ? 'tile_dark' : 'reed_mat' });
  return { fy };
}

/** Bamboo or brushwood fence along the runs [[ax, az, bx, bz]…], h high. */
function fence(P, col, runs, o = {}) {
  const h = o.h ?? 0.95, brush = o.brush, mat = brush ? 'timber' : 'bamboo_culm';
  for (const [ax, az, bx, bz] of runs) {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, np = Math.max(1, Math.round(L / 1.5));
    for (let i = 0; i <= np; i++) {
      const x = ax + ux * L * i / np, z = az + uz * L * i / np, y = H(x, z), hh = h + 0.12 + 0.05 * hs(x, z, 1);
      P.add(mat, rodGeom([x, y - 0.1, z], [x, y + hh, z], 0.03, 5));
    }
    for (const t of brush ? [0.25, 0.55, 0.85] : [0.3, 0.78]) {
      const m = Math.max(1, Math.round(L / 0.7));
      for (let i = 0; i < m; i++) {
        const x0 = ax + ux * L * i / m, z0 = az + uz * L * i / m, x1 = ax + ux * L * (i + 1) / m, z1 = az + uz * L * (i + 1) / m;
        P.add(mat, rodGeom([x0, H(x0, z0) + h * t + 0.01 * hs(x0, z0, 4), z0], [x1, H(x1, z1) + h * t, z1], 0.015, 3));
      }
    }
    const step = brush ? 0.13 : 0.3, ns = Math.floor(L / step);
    for (let i = 1; i < ns; i++) {
      const x = ax + ux * step * i, z = az + uz * step * i, y = H(x, z), r = hs(x, z, 2), hh = h * (brush ? 0.85 + 0.3 * r : 0.82 + 0.18 * r), lean = brush ? (r - 0.5) * 0.14 : 0;
      P.add(mat, rodGeom([x, y, z], [x - uz * lean + ux * lean * 0.5, y + hh, z + ux * lean + uz * lean * 0.5], brush ? 0.011 : 0.02, brush ? 3 : 3));
    }
    col.segment([ax, az], [bx, bz], 0.12, H(ax, az), H(ax, az) + h);
  }
}
/** A runs list for a rectangle's four sides with the gaps [[side, lo, hi]…] ('w', 'e': along z; 'n', 's': along x). */
function rectRuns(r, gaps = []) {
  const [x0, z0, x1, z1] = r, out = [];
  const side = (k, a, b, fixed, alongX) => {
    let cuts = gaps.filter((g) => g[0] === k).map((g) => [g[1], g[2]]).sort((p, q) => p[0] - q[0]), s = a;
    for (const [lo, hi] of cuts) { if (lo > s + 0.1) out.push(alongX ? [s, fixed, lo, fixed] : [fixed, s, fixed, lo]); s = hi; }
    if (b > s + 0.1) out.push(alongX ? [s, fixed, b, fixed] : [fixed, s, fixed, b]);
  };
  side('n', x0, x1, z0, true); side('s', x0, x1, z1, true); side('w', z0, z1, x0, false); side('e', z0, z1, x1, false);
  return out;
}
/** A flower clump (a peony, a mallow): leaves and a blossom or two. */
function clump(P, x, y, z, k = 0) {
  const r = hs(x, z, 5 + k), s = 0.8 + 0.5 * r;
  P.add('lotus_leaf', ball(0.2 * s, 0.1 * s, 0.2 * s, 5, 2).translate(x, y + 0.1 * s, z));
  const c = r < 0.4 ? 'cloth_red' : r < 0.65 ? 'paint_white' : r < 0.85 ? 'cloth_ochre' : 'paint_ochre';
  P.add(c, ball(0.07 * s, 0.045 * s, 0.07 * s, 4, 2).translate(x + (hs(x, z, 8) - 0.5) * 0.12, y + 0.24 * s, z + (hs(x, z, 9) - 0.5) * 0.12));
  if (r > 0.55) P.add(c, ball(0.05, 0.04, 0.05, 4, 2).translate(x + 0.12, y + 0.2 * s, z - 0.08));
}
/** A raised bed edged with brick, planted with clumps at about `sp` m. */
function bed(P, col, r, sp = 1.0, k = 0) {
  const [x0, z0, x1, z1] = r, y = H((x0 + x1) / 2, (z0 + z1) / 2);
  const kb = 0.14;
  P.add('brick_grey', box(x0, y - 0.05, z0, x1, y + kb, z0 + 0.1)); P.add('brick_grey', box(x0, y - 0.05, z1 - 0.1, x1, y + kb, z1));
  P.add('brick_grey', box(x0, y - 0.05, z0 + 0.1, x0 + 0.1, y + kb, z1 - 0.1)); P.add('brick_grey', box(x1 - 0.1, y - 0.05, z0 + 0.1, x1, y + kb, z1 - 0.1));
  P.add('ground', box(x0 + 0.1, y - 0.05, z0 + 0.1, x1 - 0.1, y + 0.1, z1 - 0.1));
  const nx = Math.max(1, Math.floor((x1 - x0 - 0.5) / sp)), nz = Math.max(1, Math.floor((z1 - z0 - 0.5) / sp));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    const x = x0 + 0.3 + (x1 - x0 - 0.6) * (nx ? i / nx : 0.5) + (hs(i, j, k) - 0.5) * 0.25, z = z0 + 0.3 + (z1 - z0 - 0.6) * (nz ? j / nz : 0.5) + (hs(j, i, k + 1) - 0.5) * 0.25;
    clump(P, x, y + 0.1, z, k);
  }
  col.rect(r, y, y + 0.16);
}
/** A little flowering tree (a crab-apple, an osmanthus): trunk, crown blobs, blossoms. */
function smallTree(P, col, x, z, h, blossom, seed) {
  const y = H(x, z);
  P.add('bark_dark', lathe([[0.1, y], [0.06, y + h * 0.55], [0.001, y + h * 0.7]], 5, null, x, 0, z));
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1 + seed, d = k ? 0.5 : 0, cy = y + h * (0.62 + 0.14 * k);
    bush(P, 'lotus_leaf', x + Math.cos(a) * d, cy, z + Math.sin(a) * d, h * 0.4, h * 0.27, h * 0.4, seed + k);
    for (let j = 0; j < 7; j++) { const b = hs(seed, k, j) * TAU, e = (hs(seed, j, k + 3) - 0.3) * 1.1, rr = h * 0.37; P.add(blossom, ball(0.05, 0.04, 0.05, 4, 2).translate(x + Math.cos(a) * d + Math.cos(b) * Math.cos(e) * rr, cy + Math.sin(e) * h * 0.25, z + Math.sin(a) * d + Math.sin(b) * Math.cos(e) * rr)); }
  }
  col.circle(x, z, 0.14, y, y + h * 0.7);
}
/**
 * A banana plant: a pseudostem of overlapping leaf sheaths (a dry brown base, green above, each sheath a little wider than the one
 * over it), a furled new leaf standing at the crown, and five broad leaves arching out and hanging: each a midrib with the two halves
 * folded down and cut into pinnae by the wind (every pinna a parallelogram swept toward the tip, some torn short, a slit between).
 */
function banana(P, col, x, z, seed, s = 1) {
  const y = H(x, z), hh = (1.5 + 0.5 * hs(x, z, 2)) * s, rings = 6, T = [];
  const stem = (k0, k1, mat) => {
    const pr = [];
    for (let k = k0; k < k1; k++) {
      const r = (0.155 - 0.045 * k / rings) * s, y0 = y + hh * k / rings, y1 = y + hh * (k + 0.9) / rings;
      pr.push([r * 1.05, y0], [r * 0.96, y1]);
    }
    P.add(mat, lathe(pr, 8, null, x, 0, z));
  };
  stem(0, 2, 'bark_olive'); stem(2, rings, 'lotus_leaf');
  // the furled new leaf: a narrow cone, a little bent
  const fa = seed * 1.3 + 4 * hs(x, z, 40);
  P.add('lotus_leaf', lathe([[0.045 * s, y + hh - 0.05], [0.04 * s, y + hh + 0.3 * s], [0.001, y + hh + 0.62 * s]], 5, null, x + Math.cos(fa) * 0.02, 0, z + Math.sin(fa) * 0.02));
  const NP = 7;
  for (let k = 0; k < 5; k++) {
    const a = k / 5 * TAU + seed + 0.6 * hs(x, z, k), L = (1.7 + 0.6 * hs(x, z, 10 + k)) * s, wd = 0.4 * s;
    const px = Math.cos(a), pz = Math.sin(a), qx = -pz, qz = px, up = 0.35 + 0.8 * hs(x, z, 20 + k);
    const mid = (t) => [x + px * L * t * 0.92, y + hh - 0.04 + L * (up * t - 0.95 * t * t), z + pz * L * t * 0.92];
    const wing = (t, w, sd) => { const m = mid(Math.min(1, t)); return [m[0] + qx * w * sd * 0.88, m[1] - w * 0.34 - 0.03 * s * (w / wd), m[2] + qz * w * sd * 0.88]; };
    for (const sd of [-1, 1]) for (let i = 0; i < NP; i++) {
      const t0 = 0.2 + 0.8 * i / NP, t1 = 0.2 + 0.8 * (i + 1) / NP, tm = (t0 + t1) / 2, u = hs(x + i, z + sd * k, 30);
      const w = wd * Math.pow(Math.sin(Math.PI * (0.08 + 0.88 * tm)), 0.7) * (u < 0.25 ? 0.5 : 0.78 + 0.22 * u) * (i === NP - 1 ? 0.7 : 1);
      const i0 = mid(t0), i1 = mid(t1), o0 = wing(t0 + 0.05, w, sd), o1 = wing(t1 + 0.05 - 0.03, w * 0.92, sd);
      T.push(...i0, ...i1, ...o1, ...i0, ...o1, ...o0, ...i0, ...o1, ...i1, ...i0, ...o0, ...o1);
    }
  }
  P.add('lotus_leaf', fromTri(T));
  col.circle(x, z, 0.22 * s, y, y + hh);
}
/** A ribbon path draped on the ground: bluestone slabs between irregular edge stones. */
function ribbon(P, pts, w = 1.1) {
  const out = [], stones = [];
  let acc = 0;
  const hw = w / 2;
  let prev = null;
  for (let s = 0; s + 1 < pts.length; s++) {
    const [ax, az] = pts[s], [bx, bz] = pts[s + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, m = Math.max(1, Math.ceil(L / 0.7));
    for (let i = 0; i <= m; i++) {
      if (i === 0 && s > 0) continue;
      const t = i / m, x = ax + ux * L * t, z = az + uz * L * t;
      // the mean direction at a joint
      let dx = ux, dz = uz;
      if (i === m && s + 2 < pts.length) { const [cx, cz] = pts[s + 2], l2 = Math.hypot(cx - bx, cz - bz); dx += (cx - bx) / l2; dz += (cz - bz) / l2; const l = Math.hypot(dx, dz); dx /= l; dz /= l; }
      else if (i === 0 && s === 0) { dx = ux; dz = uz; }
      const lx = x - dz * hw, lz = z + dx * hw, rx = x + dz * hw, rz = z - dx * hw;
      const row = { L: [lx, H(lx, lz) + 0.018, lz], C: [x, H(x, z) + 0.035, z], R: [rx, H(rx, rz) + 0.018, rz] };
      if (prev) { up(out, prev.L, prev.C, row.C); up(out, prev.L, row.C, row.L); up(out, prev.C, prev.R, row.R); up(out, prev.C, row.R, row.C); }
      prev = row;
      acc += 0.7;
      if (acc >= 1.15) {
        acc = 0;
        for (const sd of [-1, 1]) {
          const r = hs(x, z, sd + 3);
          if (r < 0.28) continue;
          const ex = x + sd * dz * (hw + 0.02) * -1, ez = z + sd * dx * (hw + 0.02), len = 0.26 + 0.2 * hs(x, z, 6 + sd), th = 0.1 + 0.07 * hs(x, z, 7 + sd);
          stones.push([ex, ez, len, th, Math.atan2(dz, dx) + (r - 0.6) * 0.5]);
        }
      }
    }
    prev = null; // (each segment's ribbon is laid to its own end; the next starts from the joint's mean direction)
    if (s + 1 < pts.length - 1) {
      // re-seed so the next segment joins the same cross-section
      const [cx, cz] = pts[s + 1], [nx, nz] = pts[s + 2], l2 = Math.hypot(nx - cx, nz - cz);
      let dx = ux + (nx - cx) / l2, dz = uz + (nz - cz) / l2; const l = Math.hypot(dx, dz); dx /= l; dz /= l;
      const lx = cx - dz * hw, lz = cz + dx * hw, rx = cx + dz * hw, rz = cz - dx * hw;
      prev = { L: [lx, H(lx, lz) + 0.018, lz], C: [cx, H(cx, cz) + 0.035, cz], R: [rx, H(rx, rz) + 0.018, rz] };
    }
  }
  if (out.length) P.add('bluestone', fromTri(out));
  for (const [x, z, len, th, yaw] of stones) { const g = box(-len / 2, -0.04, -th / 2, len / 2, 0.075 + 0.03 * hs(x, z, 9), th / 2); g.rotateY(-yaw); g.translate(x, H(x, z), z); P.add('granite_grey', g); }
}

// ── the scenes ───────────────────────────────────────────────────────────────────────────────────────────
function fanxiang(P, col) {
  // 繁香塢: a flower bank before the hall, "mixed flowers planted beside the thatched hall — peony, tree peony, osmanthus, crab-apple, crape myrtle"
  const r = AT.fanxiang.rect, [x0, z0, x1, z1] = r;
  fence(P, col, rectRuns(r, [['e', -0.7, 1.5]]), { h: 0.9 });
  bed(P, col, [x0 + 1.2, z0 + 1.0, x1 - 1.1, z0 + 3.6], 0.95, 1);
  bed(P, col, [x0 + 1.2, z1 - 3.4, x1 - 1.1, z1 - 0.9], 0.95, 2);
  smallTree(P, col, x0 + 2.2, z0 + 1.7, 2.4, 'cloth_red', 3);      // the crab-apple
  smallTree(P, col, x0 + 3.0, z1 - 1.6, 1.9, 'cloth_ochre', 5);    // the osmanthus
  stoneBench(P, col, [x0 + 0.55, 0.45], Math.PI / 2, H(x0 + 0.55, 0.45), 1.3);
}
function zhiqing(P, col) {
  // 志清處: "a stone to sit on at the water's edge, beyond the bamboo": a flat seat-stone, a lesser stone beside it
  const [x, z] = AT.zhiqing.c, y = H(x, z);
  lump(P, 'granite_rough', x, y - 0.1, z, 0.85, 0.34, 0.5, 11, 0.2);
  lump(P, 'granite_rough', x - 0.35, y - 0.1, z + 1.0, 0.4, 0.2, 0.3, 12, 1.0);
  lump(P, 'granite_rough', x + 0.2, y - 0.05, z - 0.95, 0.3, 0.3, 0.26, 13, 0.4);
  col.circle(x, z, 0.8, y, y + 0.4);
}
function diaoji(P, col) {
  // 釣䃮: "a clean white stone, level with the water" at the foot of the terrace, a bamboo rod over the water
  const [x, z] = AT.diaoji.c;
  lump(P, 'granite_grey', x, 0.05, z, 0.95, 0.3, 0.6, 21, -0.3);
  lump(P, 'granite_grey', x - 1.1, -0.12, z + 0.5, 0.45, 0.2, 0.3, 22, 0.5);
  const top = 0.28;
  P.add('timber', rodGeom([x + 0.45, top - 0.05, z + 0.55], [x + 0.3, top + 0.45, z + 0.62], 0.02, 3));          // the forked stick that holds the rod
  rod(P, 'bamboo_culm', [x + 0.7, top, z + 0.5], [x - 2.7, top + 1.15, z - 0.25], 0.013, 4);                        // the rod, over the water
  rod(P, 'timber', [x - 2.7, top + 1.15, z - 0.25], [x - 2.76, -0.3, z - 0.3], 0.004, 3);                          // the line
  P.add('timber', lathe([[0.001, 0], [0.12, 0], [0.14, 0.18], [0.1, 0.2], [0.001, 0.16]], 7, null, x + 0.55, top, z - 0.15));   // the fisher's creel
  col.circle(x, z, 0.85, 0, top);
}
function liuao(P, col) {
  // 柳隩: a stone bench in the willows' shade on the north shore of the bay
  const [x, z] = AT.liuao.c;
  stoneBench(P, col, [x, z], 0.15, H(x, z), 1.7);
  lump(P, 'granite_rough', x + 1.7, H(x, z) - 0.05, z + 0.5, 0.45, 0.45, 0.35, 31, 0.3);
}
function yiyuan(P, col) {
  // 意遠臺: "a terrace piled of earth on the east bank": a stone-faced earth terrace, a stair on its east side, a stone table and stools on top
  const [x0, z0, x1, z1] = AT.yiyuan.rect, gy = H((x0 + x1) / 2, (z0 + z1) / 2), top = gy + 1.15, cz = (z0 + z1) / 2;
  P.add('granite_block', box(x0, gy - 0.6, z0, x1, top - 0.14, z1));
  P.add('granite_grey', box(x0 - 0.05, top - 0.14, z0 - 0.05, x1 + 0.05, top - 0.04, z1 + 0.05));
  P.add('bluestone', box(x0 + 0.15, top - 0.04, z0 + 0.15, x1 - 0.15, top, z1 - 0.15));
  P.add('ground', box(x0 + 0.05, top - 0.04, z0 + 0.05, x1 - 0.05, top - 0.03, z1 - 0.05));
  // the edge: a low kerb on three sides, left open at the stair
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]]]) obox(P, 'granite_grey', a, b, top, top + 0.16, 0.16);
  const nr = 7, rise = (top - gy) / nr;
  for (let i = 1; i < nr; i++) P.add('granite_block', box(x1 - 0.02, gy - 0.1, cz - 0.9 - 0.03 * i, x1 + 0.34 * i, top - i * rise, cz + 0.9 + 0.03 * i));
  col.floor([x0, z0, x1, z1], top); col.rect([x0, z0, x1, z1], gy - 0.6, top - 0.31); col.ramp([x1, cz - 0.9, x1 + 0.34 * nr, cz + 0.9], gy, top, 'w');
  seat(P, col, x0 + 2.4, cz + 0.2, top, 2, 0.4);
  lump(P, 'granite_rough', x0 + 0.7, top, z0 + 0.8, 0.4, 0.3, 0.3, 41, 0.2);
  col.circle(x0 + 0.7, z0 + 0.8, 0.4, top, top + 0.4);
}
function jingshen(P, col) {
  // 凈深亭: a thatched pavilion over the clear deep water, open to the south; a qin table in it
  const { c, w } = AT.jingshen, { fy } = pavilion(P, col, { c, w, open: ['s'], roof: 'thatch' });
  const Q = new Parts(), R = new Parts(); table(Q, 1.0, 0.36, 0.45, 'everted'); qin(R); R.emit(Q, 0, 0.45, 0);
  Q.emit(P, c[0], fy, c[1] - 0.15, 0); col.rect([c[0] - 0.5, c[1] - 0.33, c[0] + 0.5, c[1] + 0.03], fy, fy + 0.5);
}
function tingsong(P, col) {
  // 聽松風處: a stone table and stools and a long stone seat under the pines
  const [x, z] = AT.tingsong.c, y = H(x, z);
  seat(P, col, x, z, y, 2, 0.5);
  stoneBench(P, col, [x - 1.9, z + 0.4], 1.45, y, 1.5);
  lump(P, 'granite_rough', x + 1.6, y - 0.05, z - 0.6, 0.35, 0.5, 0.3, 51, 0.3);
}
function yiyan(P, col) {
  // 怡顏處: a small paved place by the water's edge with a stone table, stools and a rock
  const [x, z] = AT.yiyan.c, y = H(x, z);
  P.add('bluestone', box(x - 1.8, y - 0.1, z - 1.3, x + 1.8, y + 0.05, z + 1.3));
  seat(P, col, x, z, y + 0.05, 3, 0.2);
  lump(P, 'taihu', x + 1.2, y + 0.04, z - 0.9, 0.35, 0.8, 0.28, 61, 0.3);
  col.circle(x + 1.2, z - 0.9, 0.35, y, y + 0.9);
}
function meigui(P, col) {
  // 玫瑰柴: a rose hedge on a fence of brushwood along the orchard's southern edge, a gap for the path
  const { a, b, gap } = AT.meigui;
  const runs = [[a[0], a[1], gap[0], a[1]], [gap[1], a[1], b[0], a[1]]];
  fence(P, col, runs, { h: 0.95, brush: true });
  for (const [x0, x1] of [[a[0], gap[0]], [gap[1], b[0]]]) for (let x = x0 + 0.4; x < x1 - 0.3; x += 0.85) {
    // (the canes lean over the fence in loose mounds of leaf, each a little other than its neighbours)
    const h = hs(x, 1), z = a[1] + (hs(x, 2) - 0.5) * 0.3, y = H(x, z);
    bush(P, 'lotus_leaf', x, y + 0.55 + 0.12 * hs(x, 5), z, 0.5 + 0.2 * h, 0.34, 0.36, 3);
    bush(P, 'lotus_leaf', x + 0.4, y + 0.85 + 0.1 * hs(x, 6), z + (hs(x, 7) - 0.5) * 0.2, 0.34, 0.26, 0.3, 5);
    for (let j = 0; j < 4; j++) { const t = hs(x, j, 2) * TAU; P.add('cloth_red', ball(0.04, 0.03, 0.04, 4, 2).translate(x + Math.cos(t) * 0.38, y + 0.7 + hs(x, j, 3) * 0.4, z + Math.sin(t) * 0.28)); }
  }
}
function qiangwei(P, col) {
  // 薔薇徑: arches of bamboo over the path, the rose canes trained over them
  const A = AT.qiangwei.arches;
  A.forEach(([x, z], i) => {
    const q = A[Math.min(A.length - 1, i + 1)], p = A[Math.max(0, i - 1)];
    let dx = q[0] - p[0], dz = q[1] - p[1]; const l = Math.hypot(dx, dz); dx /= l; dz /= l;
    const nx = -dz, nz = dx, y = H(x, z), pts = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8 * Math.PI, c = Math.cos(t), s = Math.sin(t); pts.push([x + nx * c * 1.1, y + 0.1 + s * 2.3, z + nz * c * 1.1]); }
    for (let k = 0; k < 8; k++) rod(P, 'bamboo_culm', pts[k], pts[k + 1], 0.022, 3);
    for (const [px, py, pz] of [pts[1], pts[2], pts[4], pts[6], pts[7]]) {
      P.add('lotus_leaf', ball(0.19, 0.11, 0.17, 5, 2).translate(px + (hs(px, pz, 4) - 0.5) * 0.15, py, pz));
      for (let j = 0; j < 2; j++) P.add('cloth_red', ball(0.045, 0.035, 0.045, 4, 2).translate(px + (hs(px, pz, j) - 0.5) * 0.4, py + (hs(pz, px, j) - 0.4) * 0.3, pz + (hs(px, py, j) - 0.5) * 0.3));
    }
    for (const s of [-1, 1]) col.circle(x + nx * 1.1 * s, z + nz * 1.1 * s, 0.07, y, y + 2.0);
    if (i + 1 < A.length) for (const k of [1, 4, 7]) rod(P, 'bamboo_culm', pts[k], [A[i + 1][0] + (pts[k][0] - x) + (A[i + 1][0] - x) * 0, pts[k][1], A[i + 1][1] + (pts[k][2] - z)], 0.015, 3);
  });
}
function huaiyu(P, col) {
  // 槐雨亭: the tiled pavilion under the locusts, open on the east; a qin table and a stool in it
  const { c, w } = AT.huaiyu, { fy } = pavilion(P, col, { c, w, open: ['e'], roof: 'tile', H: 2.6 });
  const Q = new Parts(), R = new Parts(); table(Q, 1.0, 0.36, 0.45, 'everted'); qin(R); R.emit(Q, 0, 0.45, 0);
  Q.emit(P, c[0] - 0.6, fy, c[1], Math.PI / 2); col.rect([c[0] - 0.8, c[1] - 0.5, c[0] - 0.4, c[1] + 0.5], fy, fy + 0.5);
  const S = new Parts(); drumStool(S); S.emit(P, c[0] + 0.1, fy, c[1], 0); col.circle(c[0] + 0.1, c[1], 0.2, fy, fy + 0.46);
}
function erer(P, col) {
  // 爾耳軒: a plain study of three bays, a plastered back and ends, open to the east, a gabled tile roof
  const [x0, z0, x1, z1] = AT.erer.rect, gy = H((x0 + x1) / 2, (z0 + z1) / 2), fy = gy + 0.25, Hh = 2.9, zc = (z0 + z1) / 2;
  P.add('granite_block', box(x0 - 0.35, gy - 0.5, z0 - 0.35, x1 + 0.35, fy - 0.05, z1 + 0.35)); P.add('bluestone', box(x0 - 0.33, fy - 0.05, z0 - 0.33, x1 + 0.33, fy, z1 + 0.33));
  col.floor([x0 - 0.35, z0 - 0.35, x1 + 0.35, z1 + 0.35], fy);
  const wall = (a, b, win) => {
    obox(P, 'plaster_white', a, b, fy, fy + Hh, 0.24); col.segment(a, b, 0.24, fy, fy + Hh);
    P.add('tile_dark', (() => { const g = box(-Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, 0, -0.17, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, 0.1, 0.17); g.rotateY(-Math.atan2(b[1] - a[1], b[0] - a[0])); g.translate((a[0] + b[0]) / 2, fy + Hh, (a[1] + b[1]) / 2); return g; })());
    void win;
  };
  wall([x0, z0], [x0, z1]); wall([x0, z0], [x1, z0]); wall([x0, z1], [x1, z1]);
  for (let k = 0; k < 4; k++) { const z = z0 + (z1 - z0) * k / 3; P.add('lacquer_chestnut', lathe([[0.085, fy + 0.1], [0.075, fy + Hh], [0.001, fy + Hh]], 6, null, x1, 0, z)); P.add('granite_grey', lathe([[0.17, fy], [0.15, fy + 0.12], [0.001, fy + 0.12]], 8, null, x1, 0, z)); col.circle(x1, z, 0.1, fy, fy + Hh); }
  rod(P, 'lacquer_chestnut', [x1, fy + Hh - 0.08, z0], [x1, fy + Hh - 0.08, z1], 0.07, 4);
  { const zb = (z0 + z1) / 2; obox(P, 'timber', [x1 + 0.1, zb - 0.95], [x1 + 0.1, zb + 0.95], fy + Hh - 0.67, fy + Hh - 0.21, 0.07); obox(P, 'lacquer_black', [x1 + 0.14, zb - 0.9], [x1 + 0.14, zb + 0.9], fy + Hh - 0.63, fy + Hh - 0.25, 0.07); lettering(P, '爾耳軒', [x1 + 0.1, zb - 0.95], [x1 + 0.1, zb + 0.95], 1, 0, fy + Hh - 0.44, 0.078); }   // the name board, plain
  // the roof: a gable over the three bays, its ridge along z, swept at the eaves
  const A = (z1 - z0) / 2 + 0.7, B = (x1 - x0) / 2 + 0.85, cx = (x0 + x1) / 2, ry = fy + Hh - 0.1, R = 1.35, out = [], cen = [cx, ry - 2, zc], N = 6;
  const prof = (v) => ry + R * Math.pow(1 - Math.abs(v) / B, 1.4);
  for (let side of [-1, 1]) for (let i = 0; i < N; i++) {
    const v0 = side * B * (1 - i / N), v1 = side * B * (1 - (i + 1) / N);
    quadS(out, cen, [cx + v0, prof(v0) + 0.15 * (i === 0), z0 - 0.7], [cx + v0, prof(v0) + 0.15 * (i === 0), z1 + 0.7], [cx + v1, prof(v1), z1 + 0.7], [cx + v1, prof(v1), z0 - 0.7]);
  }
  P.add('tile_dark', fromTri(out));
  { const t = [], cl = [[cx - B, ry - 0.2, z0 - 0.7], [cx + B, ry - 0.2, z0 - 0.7], [cx + B, ry - 0.2, z1 + 0.7], [cx - B, ry - 0.2, z1 + 0.7]]; quadS(t, [cx, ry + 8, zc], ...cl); P.add('bark_dark', fromTri(t)); }
  for (const z of [z0 - 0.45, z1 + 0.45]) { const t = []; solid(t, [cx, ry, z + (z < zc ? 1 : -1)], [cx - B + 0.2, ry + 0.05, z], [cx + B - 0.2, ry + 0.05, z], [cx, ry + R, z]); P.add('plaster_white', fromTri(t)); }
  P.add('tile_dark', box(cx - 0.1, ry + R, z0 - 0.7, cx + 0.1, ry + R + 0.14, z1 + 0.7));
  // within: a long table with books, a stool
  const Q = new Parts(), Bk = new Parts(); table(Q, 0.5, 1.4, 0.8); books(Bk, 4, 7); Bk.emit(Q, 0, 0.8, 0.2, 0);
  Q.emit(P, x0 + 0.7, fy, zc, 0); col.rect([x0 + 0.4, zc - 0.75, x0 + 1.0, zc + 0.75], fy, fy + 0.85);
  const S = new Parts(); drumStool(S); S.emit(P, x0 + 1.5, fy, zc, 0); col.circle(x0 + 1.5, zc, 0.2, fy, fy + 0.46);
}
function bajiao(P, col) {
  // 芭蕉檻: "in front of the high pink wall, a bend of vermilion rail": a plastered wall, bananas before it, a curving red rail round them
  const [x0, z0, x1, z1] = AT.bajiao.rect, gy = H(x1, (z0 + z1) / 2), wx = x1 - 0.1;
  obox(P, 'plaster_white', [wx, z0 + 0.5], [wx, z1 - 0.3], gy, gy + 2.3, 0.24); col.segment([wx, z0 + 0.5], [wx, z1 - 0.3], 0.24, gy, gy + 2.3);
  obox(P, 'tile_dark', [wx, z0 + 0.4], [wx, z1 - 0.2], gy + 2.3, gy + 2.4, 0.4);
  obox(P, 'granite_grey', [wx, z0 + 0.5], [wx, z1 - 0.3], gy, gy + 0.3, 0.3);
  const spots = [[x1 - 0.9, z0 + 1.1], [x1 - 1.05, z0 + 2.3], [x1 - 1.0, z0 + 3.4], [x1 - 1.9, z0 + 1.7], [x1 - 2.0, z0 + 2.9], [x1 - 1.6, z0 + 4.4]];
  spots.forEach(([x, z], i) => banana(P, col, x, z, i * 1.7, 0.85 + 0.2 * hs(x, z, 1)));
  // the rail: posts and two rails along a bend from the wall's north end, round the west, to the wall's south end
  const rail = [];
  for (let k = 0; k <= 10; k++) { const t = k / 10, a = -0.35 * Math.PI + t * 1.7 * Math.PI * 0.62; rail.push([x1 - 0.6 - 2.1 * (0.5 - 0.5 * Math.cos(t * Math.PI)) * 0.0 - 1.45 * Math.sin(t * Math.PI), z0 + 0.35 + t * (z1 - z0 - 0.5)]); void a; }
  const y = (p) => H(p[0], p[1]);
  for (let k = 0; k < rail.length; k++) { const p = rail[k]; if (k % 2 === 0) { P.add('lacquer_red', rodGeom([p[0], y(p), p[1]], [p[0], y(p) + 0.95, p[1]], 0.04, 5)); col.circle(p[0], p[1], 0.06, y(p), y(p) + 0.95); } }
  for (let k = 0; k + 1 < rail.length; k++) for (const hgt of [0.95, 0.5]) { const a = rail[k], b = rail[k + 1]; P.add('lacquer_red', rodGeom([a[0], y(a) + hgt, a[1]], [b[0], y(b) + hgt, b[1]], 0.025, 4)); }
  for (let k = 0; k + 1 < rail.length; k++) col.segment(rail[k], rail[k + 1], 0.08, y(rail[k]), y(rail[k]) + 0.95);
}
function zhujian(P, col) {
  // 竹澗: a brook running out of a rock into the pond's north side between banks of bamboo, a slab bridge where the path crosses
  const { x, z0, z1, bridge } = AT.zhujian, wy = H(x, z0) + 0.07;
  const w = 0.5;
  const out = [];
  for (let z = z0; z < z1 - 0.01; z += 1.0) { const a = z, b = Math.min(z1, z + 1.0), xa = x + Math.sin(a * 0.8) * 0.18, xb = x + Math.sin(b * 0.8) * 0.18; out.push(xa - w, wy, a, xa + w, wy, a, xb + w, wy, b, xa - w, wy, a, xb + w, wy, b, xb - w, wy, b); }
  // (up-facing: reverse if needed)
  const g = []; for (let i = 0; i < out.length; i += 9) up(g, [out[i], out[i + 1], out[i + 2]], [out[i + 3], out[i + 4], out[i + 5]], [out[i + 6], out[i + 7], out[i + 8]]);
  P.add('water', fromTri(g));
  for (let zz = z0; zz < z1 - 0.2; zz += 0.9) for (const s of [-1, 1]) {
    const len = 0.7 + 0.25 * hs(zz, s, 1), xx = x + Math.sin(zz * 0.8) * 0.18 + s * (w + 0.08), a = [xx, zz], b = [xx + (hs(zz, s, 2) - 0.5) * 0.06, zz + len];
    if (Math.abs(zz - bridge[1]) < 1.0) continue;
    obox(P, 'granite_grey', a, b, H(xx, zz) - 0.03, H(xx, zz) + 0.14 + 0.05 * hs(zz, s, 3), 0.2 + 0.05 * hs(zz, s, 4));
  }
  // the source: a heap of rock at the north end; a stone pool at the south
  lump(P, 'taihu', x - 0.4, wy - 0.1, z0 - 0.4, 0.7, 0.9, 0.6, 71, 0.2); lump(P, 'taihu', x + 0.5, wy - 0.1, z0 - 0.2, 0.5, 0.6, 0.5, 72, 1.0); lump(P, 'granite_rough', x, wy - 0.1, z0 - 0.9, 0.9, 0.6, 0.5, 73, 0.1);
  col.circle(x, z0 - 0.5, 1.0, wy - 0.1, wy + 1.0);
  for (let k = 0; k < 7; k++) { const a = Math.PI * (0.1 + k / 6 * 0.8), px = x + Math.cos(a) * 1.0, pz = z1 + 0.15 + Math.sin(a) * 0.8; lump(P, 'granite_rough', px, wy - 0.06, pz, 0.28 + 0.1 * hs(px, pz, 1), 0.14, 0.22, 74 + k, a); }
  // the bridge: two granite slabs laid across, a stepping stone each side
  const [bx, bz] = bridge, by = H(bx, bz);
  P.add('granite_block', box(bx - 0.9, by + 0.02, bz - 0.5, bx + 0.9, by + 0.16, bz + 0.5)); P.add('granite_block', box(bx - 0.9, by + 0.02, bz + 0.5, bx + 0.9, by + 0.17, bz + 1.5));
  col.floor([bx - 0.9, bz - 0.5, bx + 0.9, bz + 1.5], by + 0.17);
}
function yaopu(P, col) {
  // 瑤圃: a plot of fine flowers and herbs in a bamboo fence, the path through it from gate to gate
  const r = AT.yaopu.rect, [x0, z0, x1, z1] = r, wx = 59.5;
  fence(P, col, rectRuns(r, [['n', wx - 1.0, wx + 1.0], ['s', wx - 1.0, wx + 1.0]]), { h: 0.95 });
  bed(P, col, [x0 + 1.1, z0 + 1.0, wx - 1.3, z1 - 1.0], 0.95, 3);
  bed(P, col, [wx + 1.3, z0 + 1.0, x1 - 1.1, z1 - 1.0], 0.95, 4);
  seat(P, col, x1 - 0.9, z0 + 0.9, H(x1 - 0.9, z0 + 0.9), 1, 2.0, false);
}
function jiashi(P, col) {
  // 嘉實亭: a thatched pavilion at the orchard's foot, open to the south
  const { c, w } = AT.jiashi, { fy } = pavilion(P, col, { c, w, open: ['s'], roof: 'thatch' });
  const S = new Parts(); stoneTable(S, 0, 0, 0, 0.34, 0.72); void S;
  stoneTable(P, c[0], fy, c[1] - 0.2, 0.33, 0.72); col.circle(c[0], c[1] - 0.2, 0.34, fy, fy + 0.76);
  const Q = new Parts(); teaSet(Q); Q.emit(P, c[0], fy + 0.72, c[1] - 0.2, 0.3);
}
function yuquan(P, col) {
  // 玉泉: a spring in a stone kerb at the south-east corner, a bucket on a long rope from a windlass, a stone table for the tea it makes
  const [x, z] = AT.yuquan.c, y = H(x, z);
  P.add('granite_block', lathe([[1.5, y - 0.3], [1.5, y + 0.07], [0.001, y + 0.07]], 8, null, x, 0, z));
  P.add('granite_grey', lathe([[1.1, y + 0.07], [1.1, y + 0.14], [0.001, y + 0.14]], 8, null, x, 0, z));
  P.add('granite_grey', lathe([[0.68, y + 0.14], [0.68, y + 0.62], [0.42, y + 0.62], [0.42, y + 0.2]], 8, null, x, 0, z));
  P.add('water', lathe([[0.42, y + 0.34], [0.001, y + 0.34]], 8, null, x, 0, z));
  col.circle(x, z, 0.7, y, y + 0.64);
  // windlass: two posts, a crank beam, rope, bucket
  const px = [x - 0.75, x + 0.75];
  for (const xx of px) { P.add('timber', rodGeom([xx, y + 0.1, z + 0.55], [xx, y + 1.65, z + 0.55], 0.05, 5)); col.circle(xx, z + 0.55, 0.07, y, y + 1.65); }
  rod(P, 'timber', [px[0] - 0.15, y + 1.55, z + 0.55], [px[1] + 0.2, y + 1.55, z + 0.55], 0.045, 6);
  P.add('timber', lathe([[0.07, 0], [0.07, 0.9]], 6).rotateZ(Math.PI / 2).translate(x - 0.45, y + 1.55, z + 0.55));
  rod(P, 'timber', [x, y + 1.5, z + 0.5], [x, y + 0.7, z + 0.06], 0.007, 3);
  P.add('timber', lathe([[0.1, 0], [0.12, 0.2], [0.11, 0.2], [0.09, 0.02]], 8, null, x, y + 0.5, z + 0.05));
  P.add('timber', lathe([[0.1, 0.2], [0.001, 0.2]], 8, null, x, y + 0.5, z + 0.05));
  // the table and stools, a sand-pot on a small stove
  seat(P, col, x - 1.9, z - 0.4, y, 2, 1.6, true);
  P.add('granite_grey', box(x - 2.55, y - 0.05, z - 1.3, x - 1.2, y + 0.04, z + 0.5));
}

const SCENE = { fanxiang, zhiqing, diaoji, liuao, yiyuan, jingshen, tingsong, yiyan, meigui, qiangwei, huaiyu, erer, bajiao, zhujian, yaopu, jiashi, yuquan,
  dezhen(P, col) {
    // 得真亭: a hexagonal thatched pavilion on the plum slope's west shoulder, a stone table in it
    const { c, r } = AT.dezhen, { fy } = pavilion(P, col, { c, n: 6, r, roof: 'thatch', H: 2.35, bench: false });
    stoneTable(P, c[0], fy, c[1], 0.36, 0.74); col.circle(c[0], c[1], 0.38, fy, fy + 0.78);
    const Q = new Parts(); teaSet(Q); Q.emit(P, c[0], fy + 0.74, c[1], 0.4);
    for (let k = 0; k < 2; k++) { const a = 0.6 + k * 2.6, sx = c[0] + Math.cos(a) * 0.8, sz = c[1] + Math.sin(a) * 0.8; stoneStool(P, sx, fy, sz); col.circle(sx, sz, 0.22, fy, fy + 0.46); }
  },
  paths(P) { for (const [k, p] of Object.entries(WALKS)) { void k; ribbon(P, p, 1.1); } },
};

function wenScene(el, { bag, col }) {
  const P = new Parts();
  SCENE[el.id](P, col);
  P.emit(bag, 0, 0, 0, 0);
}
STYLES['suzhou-site'].elements.wen_scene = wenScene;

/** The plan's elements for the scenes. */
export function wenElements() {
  return [...Object.keys(SCENE).map((id) => ({ t: 'wen_scene', id }))];
}
/** Routes for the walk check, each from a point of the old paths to a scene along the new ones. */
export function wenWalks() {
  const W = WALKS, rev = (a) => a.slice().reverse(), east = [[11, 12.8], ...W.east];
  const rs = [
    east,                                                                                    // the spring (玉泉)
    [...east, ...W.spine.slice(1, 5), [59.4, -2.6]],                                         // the jade plot (瑤圃)
    [...east, ...W.spine.slice(1, 5), [57, -7.0], [57, -8.4]],                               // the fruit pavilion (嘉實亭)
    [...east, ...W.spine.slice(1), ...rev(W.rose).slice(1)],                                 // the rose path (薔薇徑) by the orchard
    [[16, -2.1], ...W.toDezhen.slice(1), [20.5, -11.0]],                                     // the hexagonal pavilion (得真亭)
    [...W.west, W.bank[1], [-57, -7.2], [-60, -7.9], [-60.2, -11], [-60.6, -12.2], [-61.4, -12.2]],                             // the locust pavilion (槐雨亭), down the west bank
    [...W.west, ...W.bank.slice(1), [-58.4, 1.0], [-60.2, 0.4], [-61.2, 0.4]],               // the study (爾耳軒) by the bank
    [...W.north.slice(0, 10), ...W.toJingshen.slice(1), [-6, -66.2]],                         // the thatched pavilion (凈深亭)
    [...W.north.slice(0, 6), ...W.toTingsong.slice(1), [11, -70.4]],                          // the pine seat (聽松風處)
    [...W.north.slice(0, 3), ...W.toYiyan.slice(1), [24, -67.2]],                            // the water's-edge seat (怡顏處)
    [...W.north.slice(6), [-28.2, -62.3], [-31.5, -62.3]],                                   // the terrace (意遠臺), up its stair
  ];
  for (const r of rs) r.y0 = 0;
  return rs;
}
