// The Iron Pagoda, built here (a working copy of the song style's pagoda_oct for the Iron Pagoda: no galleries, glazed skin, walkable
// inside) so that its doorways, windows, eaves and bracket sets can be carried further than the shared style does:
// docs/settlements/song-kaifeng.md §17.
import { lathe, box, fromTriangles, orientOutward } from '../../core/geom.js';
import { hexa } from '../../styles/song/kaifeng.js';
import { ironSkin } from './ironskin.js';

const ngon = (cx, cz, r, n = 8, rot = Math.PI / 8) => Array.from({ length: n }, (_, k) => [cx + Math.cos(rot + k / n * Math.PI * 2) * r, cz + Math.sin(rot + k / n * Math.PI * 2) * r]);
/** A flat-faced frustum from the polygon `bot` at y0 to `top` at y1, capped. */
function prism(bag, mat, bot, top, y0, y1) {
  const n = bot.length, t = [], P = (q, y) => [q[0], y, q[1]];
  for (let k = 0; k < n; k++) { const a = P(bot[k], y0), b = P(bot[(k + 1) % n], y0), c = P(top[(k + 1) % n], y1), d = P(top[k], y1); t.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let k = 1; k < n - 1; k++) { t.push(...P(top[0], y1), ...P(top[k], y1), ...P(top[k + 1], y1), ...P(bot[0], y0), ...P(bot[k + 1], y0), ...P(bot[k], y0)); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
/** An octagonal eave from the inner ring (r0 at y0) out and down to the outer ring (r1 at y1), the corners turned up by `sweep`: tiles above, painted soffit below. */
function octEave(bag, cx, cz, r0, y0, r1, y1, sweep, top = 'tile_dark', under = 'lacquer_red', bells = null) {
  const I = ngon(cx, cz, r0), O = ngon(cx, cz, r1), m = 4, up = [], dn = [];
  const tri = (a, b, c) => {
    const n = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);   // the normal's y (sign)
    const [p, q, r] = n >= 0 ? [a, b, c] : [a, c, b];
    up.push(...p, ...q, ...r);
    dn.push(p[0], p[1] - 0.14, p[2], r[0], r[1] - 0.14, r[2], q[0], q[1] - 0.14, q[2]);
  };
  for (let k = 0; k < 8; k++) {
    const a0 = I[k], a1 = I[(k + 1) % 8], b0 = O[k], b1 = O[(k + 1) % 8];
    for (let j = 0; j < m; j++) {
      const t0 = j / m, t1 = (j + 1) / m, h = (t) => y1 + sweep * Math.abs(2 * t - 1) ** 2.5;
      const i0 = [a0[0] + (a1[0] - a0[0]) * t0, y0, a0[1] + (a1[1] - a0[1]) * t0], i1 = [a0[0] + (a1[0] - a0[0]) * t1, y0, a0[1] + (a1[1] - a0[1]) * t1];
      const o0 = [b0[0] + (b1[0] - b0[0]) * t0, h(t0), b0[1] + (b1[1] - b0[1]) * t0], o1 = [b0[0] + (b1[0] - b0[0]) * t1, h(t1), b0[1] + (b1[1] - b0[1]) * t1];
      tri(i0, i1, o1); tri(i0, o1, o0);
    }
  }
  bag.add(top, fromTriangles(up)); bag.add(under, fromTriangles(dn));
  if (bells) eaveBells(bag, cx, cz, r0, y0, r1, y1 + sweep, bells);
}
/**
 * A wind bell under each of the eave's eight corners: the hook from the soffit, the bell, its clapper
 * and the wind plate below.
 */
function eaveBells(bag, cx, cz, r0, y0, r1, yc, mat) {
  const rr = r1 - 0.3, yy = y0 + (yc - y0) * (rr - r0) / (r1 - r0) - 0.14;
  for (let k = 0; k < 8; k++) {
    const a = Math.PI / 8 + k / 8 * Math.PI * 2, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
    bag.add(mat, lathe([[0.025, -0.3], [0.025, 0.04]], 5, null, x, yy, z));
    bag.add(mat, lathe([[0.001, -0.3], [0.05, -0.3], [0.1, -0.36], [0.15, -0.6], [0.17, -0.7], [0.16, -0.71], [0.001, -0.66]], 10, null, x, yy, z));
    bag.add(mat, lathe([[0.012, -0.95], [0.012, -0.62]], 4, null, x, yy, z));
    bag.add(mat, box(x - 0.09, yy - 1.12, z - 0.012, x + 0.09, yy - 0.95, z + 0.012));
  }
}
/**
 * A row of bracket sets under an eave round the octagonal core (radius r, the sets' foot at y): a
 * set at each corner (pointing out along the diagonal) and two between on each face — bearing
 * block, the cross arm with its small blocks, two tiers of arms stepping out, the eave purlin's ring
 * on their ends; the architrave below.
 */
function bracketRow(bag, cx, cz, r, y, arms = 'timber_red', blocks = 'paint_ochre', K = 1) {
  const G = ngon(cx, cz, r), A = [], B = [];
  const set = (px, pz, ux, uz, nx, nz, s) => {
    const Q = (u, n, yy) => [px + (ux * u + nx * n) * K, y + yy * K, pz + (uz * u + nz * n) * K];
    const bx = (out, u0, u1, n0, n1, y0, y1) => hexa(out, [Q(u0, n0, y0), Q(u1, n0, y0), Q(u1, n1, y0), Q(u0, n1, y0), Q(u0, n0, y1), Q(u1, n0, y1), Q(u1, n1, y1), Q(u0, n1, y1)]);
    bx(B, -0.24 * s, 0.24 * s, -0.05, 0.42 * s, 0, 0.26);
    bx(A, -0.62 * s, 0.62 * s, 0.06, 0.3 * s, 0.26, 0.46);
    for (const u of [-0.55 * s, 0.55 * s]) bx(B, u - 0.1, u + 0.1, 0.05, 0.31 * s, 0.46, 0.6);
    bx(A, -0.1, 0.1, -0.05, 0.86 * s, 0.26, 0.5);
    bx(B, -0.13, 0.13, 0.62 * s, 0.88 * s, 0.5, 0.62);
    bx(A, -0.78 * s, 0.78 * s, 0.64 * s, 0.86 * s, 0.62, 0.8);
    bx(A, -0.1, 0.1, 0.0, 1.34 * s, 0.6, 0.86);
    bx(B, -0.13, 0.13, 1.08 * s, 1.36 * s, 0.86, 0.98);
  };
  for (let k = 0; k < 8; k++) {
    const a = G[k], b = G[(k + 1) % 8], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    let nx = uz, nz = -ux;
    if (((a[0] + b[0]) / 2 - cx) * nx + ((a[1] + b[1]) / 2 - cz) * nz < 0) { nx = -nx; nz = -nz; }
    for (const t of [1 / 3, 2 / 3]) set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, ux, uz, nx, nz, 1);
    const ra = Math.hypot(a[0] - cx, a[1] - cz), dx = (a[0] - cx) / ra, dz = (a[1] - cz) / ra;
    set(a[0], a[1], -dz, dx, dx, dz, 1.15);
  }
  bag.add(arms, fromTriangles(A)); bag.add(blocks, fromTriangles(B));
  // the architrave round the core under the sets, the ring on the arms' ends
  prism(bag, arms, ngon(cx, cz, r + 0.12 * K), ngon(cx, cz, r + 0.12 * K), y - 0.45 * K, y + 0.02 * K);
  prism(bag, arms, ngon(cx, cz, r + 1.15 * K), ngon(cx, cz, r + 1.55 * K), y + 0.96 * K, y + 1.22 * K);
}
const C8 = Math.cos(Math.PI / 8), T8 = Math.tan(Math.PI / 8);
function ringPiece(out, cx, cz, k, a0, a1, y0, y1, u0, u1) {
  const th = (k + 1) * Math.PI / 4, mx = Math.cos(th), mz = Math.sin(th), tx = -mz, tz = mx;
  const Q = (a, u, yy) => [cx + mx * a + tx * u, yy, cz + mz * a + tz * u];
  const l0 = a0 * T8, l1 = a1 * T8;
  const ua0 = Math.max(-l0, u0), ub0 = Math.min(l0, u1), ua1 = Math.max(-l1, u0), ub1 = Math.min(l1, u1);
  hexa(out, [Q(a0, ua0, y0), Q(a0, ub0, y0), Q(a1, ub1, y0), Q(a1, ua1, y0), Q(a0, ua0, y1), Q(a0, ub0, y1), Q(a1, ub1, y1), Q(a1, ua1, y1)]);
  return [Q(a0, ua0, 0), Q(a0, ub0, 0), Q(a1, ub1, 0), Q(a1, ua1, 0)].map((q) => [q[0], q[2]]);
}
/** A flat slab over a convex polygon (plan points) from y0 to y1. */
function slab(out, pts, y0, y1) {
  const t = [], n = pts.length, P = (q, yy) => [q[0], yy, q[1]];
  for (let k = 0; k < n; k++) { const a = pts[k], b = pts[(k + 1) % n]; t.push(...P(a, y0), ...P(b, y0), ...P(b, y1), ...P(a, y0), ...P(b, y1), ...P(a, y1)); }
  for (let k = 1; k < n - 1; k++) t.push(...P(pts[0], y1), ...P(pts[k], y1), ...P(pts[k + 1], y1), ...P(pts[0], y0), ...P(pts[k + 1], y0), ...P(pts[k], y0));
  out.push(...orientOutward(t));
}
// south door on the ground floor); the treads' walkable surface is overlapping squares, so a step is never more than the rise.
const IRON_A = 1.85, IRON_RISE = 0.22, IRON_PIER = 0.5, IRON_R0 = 0.6, IRON_R1 = 1.8, IRON_TH0 = Math.PI;
/** The openings of the walls of storey i for ironSkin: the faces the skin cuts through (3 = west, and the south door on the ground floor), with the heights. */
function ironOpenings(i) { return i === 0 ? { 1: [0, 2.5, 0.75], 3: [0.9, 2.5, 0.5] } : { 3: [0.9, 2.5, 0.5] }; }
/** A wall ring (apothems a0…a1, y0…y1) with openings { face: [sill, top, half-width] } (heights above y0): its pieces into `out`, and its obstacles (if col). */
function ironRing(out, col, cx, cz, a0, a1, y0, y1, open) {
  const solid = (poly, ya, yb) => col && col.obstacles.push({ poly, y0: ya, y1: yb });
  for (let k = 0; k < 8; k++) {
    const o = open[k];
    if (!o) { solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, -99, 99), y0, y1); continue; }
    const [sill, top, dw] = o;
    solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, -99, -dw), y0, y1); solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, dw, 99), y0, y1);
    if (sill > 0.01) solid(ringPiece(out, cx, cz, k, a0, a1, y0, y0 + sill, -dw, dw), y0, y0 + sill);
    solid(ringPiece(out, cx, cz, k, a0, a1, y0 + top, y1, -dw, dw), y0 + top, y1);
  }
}
function ironStorey(bag, col, el, cx, cz, i, y, h, r, coreMat, last) {
  const a = r * C8, open = ironOpenings(i), op = {};
  for (const k of Object.keys(open)) op[k] = open[k];
  // the wall: tile outside, a lining of grey brick inside; the pier of the stair
  const wall = [], lin = [];
  ironRing(wall, col, cx, cz, IRON_A, a, y, y + h, op);
  ironRing(lin, null, cx, cz, IRON_A - 0.05, IRON_A, y, y + h, op);
  bag.add(coreMat, fromTriangles(wall)); bag.add('brick_grey', fromTriangles(lin));
  bag.add('brick_grey', lathe([[IRON_PIER + 0.12, 0], [IRON_PIER, 0.15], [IRON_PIER, h - 0.1], [IRON_PIER + 0.1, h]], 12, null, cx, y, cz));
  col.circle(cx, cz, IRON_PIER, y, y + h);
  // the doorway's frame, the window's sill and splay are the skin's; the passage floor on the ground storey (platform → door → shaft)
  const floor = [];
  if (i === 0) {
    slab(floor, ngon(cx, cz, IRON_A / C8 + 0.01), y - 0.3, y); col.floor([cx - 1.3, cz - 1.3, cx + 1.3, cz + 1.3], y);
    col.floor([cx - 0.75, cz + IRON_A - 0.2, cx + 0.75, cz + a + 0.4], y); col.floor([cx - IRON_A + 0.3, cz - IRON_A + 0.3, cx + IRON_A - 0.3, cz + IRON_A - 0.3], y);
    slab(floor, [[cx - 0.75, cz + IRON_A - 0.2], [cx + 0.75, cz + IRON_A - 0.2], [cx + 0.75, cz + a + 0.1], [cx - 0.75, cz + a + 0.1]], y - 0.3, y);
    bag.add('brick_paving', fromTriangles(floor));
    // (the last storey's floor over the shaft's bottom is the platform's; the pier stands on it)
  }
  // the treads: one turn a storey about the pier, from the west; on the last storey they stop two metres under the ceiling
  const n = Math.max(6, Math.round(h / IRON_RISE)), rise = h / n, steps = [];
  const ymax = last ? y + h - 2.15 : y + h + 0.001;
  for (let j = 0; j < n; j++) {
    const top = y + (j + 1) * rise;
    if (top > ymax) break;
    const th0 = IRON_TH0 + (j / n) * Math.PI * 2, th1 = IRON_TH0 + ((j + 1) / n) * Math.PI * 2 + 0.07;
    const P = (rr, th) => [cx + Math.cos(th) * rr, cz + Math.sin(th) * rr];
    slab(steps, [P(IRON_R0, th0), P(IRON_R1, th0), P(IRON_R1, th1), P(IRON_R0, th1)], top - rise - 0.1, top);
    const tm = (th0 + th1) / 2, rm = (IRON_R0 + IRON_R1) / 2, [px, pz] = P(rm, tm);
    col.floor([px - 0.42, pz - 0.42, px + 0.42, pz + 0.42], top);
  }
  bag.add('granite_block', fromTriangles(steps));
  if (last) {
    const cl = []; slab(cl, ngon(cx, cz, (IRON_A + 0.05) / C8), y + h - 0.35, y + h - 0.02); bag.add('timber_red', fromTriangles(cl));
    // under the ceiling, the lamp of the stair's top and the caisson of the shaft
    bag.add('lacquer_red', lathe([[0.001, 0], [0.2, 0.05], [0.28, 0.3], [0.2, 0.55], [0.001, 0.6]], 8, null, cx, y + h - 1.0, cz));
  }
}

/** The eave's edge: a fascia board along each face and, every 0.4 m, a round tile-end (wadang) on it, as on the tile eaves the brick copies. */
function eaveEdge(bag, cx, cz, r1, y1, sweep, fasciaMat, discMat) {
  const O = ngon(cx, cz, r1), fa = [], ds = [], m = 4;
  for (let k = 0; k < 8; k++) {
    const b0 = O[k], b1 = O[(k + 1) % 8], L = Math.hypot(b1[0] - b0[0], b1[1] - b0[1]), a = (k + 1) * Math.PI / 4, nx = Math.cos(a), nz = Math.sin(a);
    const pt = (t) => [b0[0] + (b1[0] - b0[0]) * t, y1 + sweep * Math.abs(2 * t - 1) ** 2.5, b0[1] + (b1[1] - b0[1]) * t];
    for (let j = 0; j < m; j++) {
      const p = pt(j / m), q = pt((j + 1) / m), o = 0.035;
      const P = (v, yy, d) => [v[0] + nx * d, yy, v[2] + nz * d];
      hexa(fa, [P(p, p[1] - 0.17, 0), P(q, q[1] - 0.17, 0), P(q, q[1] - 0.17, o), P(p, p[1] - 0.17, o), P(p, p[1] - 0.02, 0), P(q, q[1] - 0.02, 0), P(q, q[1] - 0.02, o), P(p, p[1] - 0.02, o)]);
    }
    const n = Math.max(4, Math.round(L / 0.4));
    for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n, p = pt(t);
      const tx = -nz, tz = nx, c = [p[0] + nx * 0.035, p[1] - 0.095, p[2] + nz * 0.035], w = 0.05, hh = 0.05, o = 0.028;
      const V = (du, dy, dn) => [c[0] + tx * du + nx * dn, c[1] + dy, c[2] + tz * du + nz * dn];
      hexa(ds, [V(-w, -hh, 0), V(w, -hh, 0), V(w * 0.6, -hh, o), V(-w * 0.6, -hh, o), V(-w, hh, 0), V(w, hh, 0), V(w * 0.6, hh, o), V(-w * 0.6, hh, o)]);
    }
  }
  bag.add(fasciaMat, fromTriangles(fa)); bag.add(discMat, fromTriangles(ds));
}

/** The Iron Pagoda: { c, y, base: { r, h }, tiers: [{ r, h }], spire, eave, core, bells }, walkable inside (stair in the wall, south door). */
export function ironPagoda(el, { bag, col }) {
  const [cx, cz] = el.c;
  let y = el.y;
  const B = el.base;
  prism(bag, 'granite_block', ngon(cx, cz, B.r + 0.6), ngon(cx, cz, B.r), y, y + B.h);
  // the base is walkable (a stair comes up on the south): a floor over a cross inside the base's faces, the base's wall low enough to step over at the top
  col.circle(cx, cz, B.r * Math.cos(Math.PI / 8) - 0.4, y, y + B.h - 0.1);
  { const q = B.r * 0.82, c2 = B.r * 0.39;
    for (const r4 of [[-q, -c2, q, c2], [-c2, -q, c2, q], [-B.r * 0.62, -B.r * 0.62, B.r * 0.62, B.r * 0.62]]) col.floor([cx + r4[0], cz + r4[1], cx + r4[2], cz + r4[3]], y + B.h); }
  y += B.h;
  el.tiers.forEach((t, i) => {
    const last = i === el.tiers.length - 1, r = t.r, h = t.h, coreMat = el.core || 'tile_iron';
    ironStorey(bag, col, el, cx, cz, i, y, h, r, coreMat, last);
    const top = h - 0.68 - 0.45 * 0.7 - 0.04, sk = ironSkin(bag, coreMat, cx, cz, r, y, h, top, i, ironOpenings(i), r * C8 - IRON_A - 0.02);
    bag.add('lacquer_black', fromTriangles(sk.dark)); bag.add(coreMat, fromTriangles(sk.frame));
    const G = ngon(cx, cz, r);
    for (let k = 0; k < 8; k++) bag.add(coreMat, lathe([[0.17, 0], [0.17, 0.12], [0.14, 0.2], [0.14, top - 0.12], [0.18, top], [0.001, top]], 8, null, G[k][0], y, G[k][1]));
    bracketRow(bag, cx, cz, r, y + h - 0.68, coreMat, coreMat, 0.7);
    prism(bag, coreMat, ngon(cx, cz, r + 0.15), ngon(cx, cz, r + 0.4), y + h, y + h + 0.72);
    octEave(bag, cx, cz, r + 0.3, y + h + 0.7, r + 1.6, y + h - 0.1, 0.35, el.eave || 'tile_dark', coreMat, el.bells || null);
    eaveEdge(bag, cx, cz, r + 1.6, y + h - 0.1, 0.35, coreMat, coreMat);
    y += h;
  });
  const rt = el.tiers[el.tiers.length - 1].r, R = rt + 1.8;
  octEave(bag, cx, cz, 0.6, y + 2.6, R, y + 0.2, 0.8, el.eave || 'tile_dark', el.core || 'tile_iron', el.bells || null);
  eaveEdge(bag, cx, cz, R, y + 0.2, 0.8, el.core || 'tile_iron', el.core || 'tile_iron');
  bag.add('gilt_bronze', lathe([[0.5, 0], [0.5, 0.6], [1.0, 0.8], [0.35, 1.2], [0.8, 1.6], [0.3, 2.0], [0.6, 2.4], [0.2, 2.8], [0.45, 3.1], [0.12, 3.6], [0.001, el.spire ?? 4.8]], 12, null, cx, y + 3.8, cz));
}
