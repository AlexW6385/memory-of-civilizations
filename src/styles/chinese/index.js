// Chinese timber architecture (Tang, 9th century): the vocabulary of the Great East Hall of
// Foguang Monastery. Round columns on lotus bases with a rise toward the corners; architraves
// painted "seven red, eight white"; bracket sets (dougong) of blocks and arms stepping out in
// tiers, with descending cantilevers; deep eaves of rafters; a hipped roof of grey tiles on a
// concave profile, its corners turned up, the ridge ending in chiwei; a stone-faced platform.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Vector3 } from '../../core/three.js';
import { registerStyle } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward, place } from '../../core/geom.js';
import { byzantineElements } from '../byzantine/index.js';

export function hexa(out, b, t) {
  const tris = [];
  const q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}

/** A box in a local frame: centre c [x, z], axes u (along) and n (out), extents ±hu, ±hn, y0…y1. */
export function obox(out, c, u, n, hu, hn, y0, y1, nOff = 0) {
  const P = (a, b, y) => [c[0] + u[0] * a + n[0] * (b + nOff), y, c[1] + u[1] * a + n[1] * (b + nOff)];
  hexa(out, [P(-hu, -hn, y0), P(hu, -hn, y0), P(hu, hn, y0), P(-hu, hn, y0)], [P(-hu, -hn, y1), P(hu, -hn, y1), P(hu, hn, y1), P(-hu, hn, y1)]);
}
/** A sloping beam in the (n, y) plane: from (n0, y0) to (n1, y1), width 2hu, depth d. */
function slant(out, c, u, n, hu, n0, y0, n1, y1, d) {
  const P = (a, b, y) => [c[0] + u[0] * a + n[0] * b, y, c[1] + u[1] * a + n[1] * b];
  hexa(out, [P(-hu, n0, y0 - d), P(hu, n0, y0 - d), P(hu, n1, y1 - d), P(-hu, n1, y1 - d)], [P(-hu, n0, y0), P(hu, n0, y0), P(hu, n1, y1), P(-hu, n1, y1)]);
}

/**
 * A bracket set (dougong) { at [x, z], y (column top), dir [dx, dz] (outward), tiers, step, both, ang }:
 * the cap block; in each tier a projecting arm stepping out by `step`, crossed at its tip by an arm
 * along the wall with small blocks; in the upper tiers descending cantilevers (ang) cut like split
 * bamboo; the topmost arm and a beam-end under the eave purlin. `both` also steps inward.
 */
export function bracketSet(el, { bag }) {
  const [x, z] = el.at, y = el.y, n = el.dir, u = [-n[1], n[0]], T = el.tiers || 4, s = el.step || 0.48;
  const out = [], blocks = [];
  const c = [x, z];
  // the cap block (ludou): wide, its lower part tapering
  obox(blocks, c, u, n, 0.34, 0.34, y + 0.14, y + 0.38);
  obox(blocks, c, u, n, 0.27, 0.27, y, y + 0.14);
  const th = 0.3, lv = 0.42;
  for (let k = 1; k <= T; k++) {
    const yb = y + 0.38 + (k - 1) * lv, reach = k * s;
    const isAng = el.ang && k > T - 2;
    // the projecting arm (huagong), symmetric if `both`
    const back = el.both ? -reach : -0.3;
    if (!isAng) obox(out, c, u, n, 0.1, (reach - back) / 2, yb, yb + th, (reach + back) / 2);
    else slant(out, c, u, n, 0.1, -reach * 0.6, yb + th + 0.5, reach + 0.35, yb - 0.12, 0.26);
    // the arm along the wall at the tip (guazi / ling gong), with blocks at its ends and middle
    const len = k === T ? 0.95 : 0.7 + 0.05 * k;
    for (const side of el.both ? [-1, 1] : [1]) {
      const tip = [x + n[0] * reach * side, z + n[1] * reach * side];
      obox(out, tip, u, n, len, 0.09, yb + th, yb + th + 0.26);
      for (const a of [-len + 0.12, 0, len - 0.12]) obox(blocks, [tip[0] + u[0] * a, tip[1] + u[1] * a], u, n, 0.13, 0.13, yb + th + 0.26, yb + th + 0.42);
    }
    // the arm along the wall over the column (nidao gong), doubled up the tiers
    if (k <= 2) obox(out, c, u, n, 0.62 + 0.15 * k, 0.09, yb + th, yb + th + 0.26);
  }
  // the top: a beam-end (shuatou) and the block under the eave purlin
  const ytop = y + 0.38 + T * lv;
  obox(out, c, u, n, 0.1, (T * s + 0.55) / 2, ytop - 0.1, ytop + 0.18, (T * s + 0.55) / 2 - 0.3);
  bag.add(el.mat || 'timber_red', fromTriangles(out));
  bag.add(el.blockMat || 'timber_red', fromTriangles(blocks));
}

// ── the Tang bracket set of the Foguang hall (seven-puzuo: two flower-arm tiers, two descending
// cantilevers; the "stolen heart" (touxin) — no cross-arm — at the first arm and the first cantilever;
// arm ends rounded in four facets (juansha); the cantilever tips cut like split bamboo (pizhu ang)) ──

/** A convex polygon pts [[s, y]…] extruded ±hw: P(s, y, t) maps to the world. */
function prism(out, pts, hw, P) {
  const tris = [], n = pts.length;
  const F = pts.map(([s, y]) => P(s, y, -hw)), B = pts.map(([s, y]) => P(s, y, hw));
  for (let i = 1; i < n - 1; i++) tris.push(...F[0], ...F[i], ...F[i + 1], ...B[0], ...B[i + 1], ...B[i]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; tris.push(...F[i], ...B[i], ...B[j], ...F[i], ...B[j], ...F[j]); }
  out.push(...orientOutward(tris));
}
/** The side outline of an arm from s0 to s1, bottom y0, height h, its lower corners rounded (juansha). */
function armOutline(s0, s1, y0, h, ends = [true, true], cut = 0.16, endH = 0.15) {
  const pts = [[s0, y0 + h]];
  const N = 4;
  if (ends[0]) for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI / 2; pts.push([s0 + cut * (1 - Math.cos(a)), y0 + (h - endH) * (1 - Math.sin(a))]); }
  else pts.push([s0, y0]);
  if (ends[1]) for (let i = N; i >= 0; i--) { const a = (i / N) * Math.PI / 2; pts.push([s1 - cut * (1 - Math.cos(a)), y0 + (h - endH) * (1 - Math.sin(a))]); }
  else pts.push([s1, y0]);
  pts.push([s1, y0 + h]);
  return pts;
}
/** A block (dou) of half-width hw, bottom y0, height h: its lower part (qi) tapers in. */
function dou(out, c, u, n, hw, y0, h, nOff = 0) {
  const q = h * 0.4, b = hw * 0.74;
  const P = (a, bb, y) => [c[0] + u[0] * a + n[0] * (bb + nOff), y, c[1] + u[1] * a + n[1] * (bb + nOff)];
  hexa(out, [P(-b, -b, y0), P(b, -b, y0), P(b, b, y0), P(-b, b, y0)], [P(-hw, -hw, y0 + q), P(hw, -hw, y0 + q), P(hw, hw, y0 + q), P(-hw, hw, y0 + q)]);
  obox(out, c, u, n, hw, hw, y0 + q, y0 + h, nOff);
}

/**
 * A Tang bracket set { at, y (column top or post top), dir (outward), kind: 'column' | 'corner' | 'inner'
 * | 'between', step (0.48), post (height of a short post under the block, for 'between') }.
 * Members: cai 0.30 × 0.21 m, tiers every 0.41 m; the eave purlin's seat 2.45 m over the column.
 */
export function tangBracket(el, { bag }) {
  const [x, z] = el.at, y = el.y, n = el.dir, u = [-n[1], n[0]], kind = el.kind || 'column';
  const s = el.step || 0.48, H = 0.3, W = 0.105, LV = 0.41, L = (k) => y + 0.24 + k * LV;
  const arms = [], blocks = [], c = [x, z];
  const alongN = (cc, nn, uu) => (sv, yv, t) => [cc[0] + nn[0] * sv + uu[0] * t, yv, cc[1] + nn[1] * sv + uu[1] * t];
  // an arm along the outward axis (huagong) from s0 to s1 at tier k, rounded where rounded
  const hua = (s0, s1, k, ends = [true, true], nn = n, uu = u) => prism(arms, armOutline(s0, s1, L(k), H, ends), W, alongN(c, nn, uu));
  // an arm along the wall (guazi, man, ling gong) centred `reach` out, half-length hl, at tier k, with blocks on it
  const cross = (reach, hl, k, nb = 2, nn = n, uu = u) => {
    const cc = [x + nn[0] * reach, z + nn[1] * reach];
    prism(arms, armOutline(-hl, hl, L(k), H), W, (sv, yv, t) => [cc[0] + uu[0] * sv + nn[0] * t, yv, cc[1] + uu[1] * sv + nn[1] * t]);
    const at = nb === 3 ? [-hl + 0.15, 0, hl - 0.15] : [-hl + 0.15, hl - 0.15];
    for (const a of at) dou(blocks, [cc[0] + uu[0] * a, cc[1] + uu[1] * a], uu, nn, 0.15, L(k) + H, 0.19);
  };
  const tipDou = (reach, k, nn = n, uu = u) => dou(blocks, [x + nn[0] * reach, z + nn[1] * reach], uu, nn, 0.16, L(k) + H, 0.19);
  // a descending cantilever (xia'ang) whose top passes (reach, L(k) + H), sloping down outward
  const ang = (reach, k, tail, nn = n, uu = u) => {
    const sl = 0.5, yt = (sv) => L(k) + H - sl * (sv - reach), d = H / Math.cos(Math.atan(sl)), tip = reach + 0.46;
    prism(arms, [[tail, yt(tail)], [tip, yt(tip) - 0.02], [tip - 0.34, yt(tip - 0.34) - d], [tail, yt(tail) - d]], W, alongN(c, nn, uu));
    dou(blocks, [x + nn[0] * reach, z + nn[1] * reach], uu, nn, 0.16, L(k) + H, 0.19);
  };
  const capH = kind === 'between' ? 0.3 : 0.4, capW = kind === 'between' ? 0.22 : 0.32;
  if (el.post) obox(arms, c, u, n, 0.15, 0.12, y - el.post, y);
  dou(blocks, c, u, n, capW, y, capH);
  if (kind === 'between') {
    // the simple set between the columns: two flower arms out and in, a cross-arm in the wall plane
    hua(-s, s, 0); tipDou(s, 0); tipDou(-s, 0);
    hua(-2 * s, 2 * s, 1); tipDou(2 * s, 1); tipDou(-2 * s, 1);
    cross(0, 0.5, 0);
  } else if (kind === 'inner') {
    // the inner ring: flower arms both ways in three tiers, cross-arms at the tips of the second
    hua(-s, s, 0); tipDou(s, 0); tipDou(-s, 0);
    hua(-2 * s, 2 * s, 1); cross(2 * s, 0.31, 2); cross(-2 * s, 0.31, 2);
    hua(-3 * s, 3 * s, 2); tipDou(3 * s, 2); tipDou(-3 * s, 2);
    cross(0, 0.31, 0); cross(0, 0.46, 1);
    hua(-3 * s - 0.2, 3 * s + 0.2, 3, [false, false]); hua(-3 * s - 0.4, 3 * s + 0.4, 4, [true, true]);
    // the same in the other direction, along the ring
    hua(-s, s, 0, [true, true], u, n); hua(-2 * s, 2 * s, 1, [true, true], u, n);
  } else {
    const dirs = kind === 'corner' ? [[n, u, s * Math.SQRT2], [[n[0] + n[1], n[1] - n[0]].map((v) => v / Math.SQRT2), null, s], [[n[0] - n[1], n[1] + n[0]].map((v) => v / Math.SQRT2), null, s]] : [[n, u, s]];
    for (const [nn, uu0, st] of dirs) {
      const uu = uu0 || [-nn[1], nn[0]], main = !!uu0;
      // first tier: the flower arm, stolen heart (no cross-arm at its tip); its tail inward
      hua(-st, st, 0, [true, true], nn, uu); tipDou(st, 0, nn, uu); tipDou(-st, 0, nn, uu);
      // second tier: the flower arm with a double cross-arm (guazi, man gong) at its tip
      hua(-2 * st, 2 * st, 1, [true, true], nn, uu); cross(2 * st, 0.31, 2, 2, nn, uu); cross(2 * st, 0.46, 3, 2, nn, uu);
      cross(-2 * st, 0.31, 2, 2, nn, uu);
      if (!main) continue;
      // third and fourth: the two cantilevers, their tails rising into the hall over the ceiling
      ang(3 * st, 2, -1.7, nn, uu);
      ang(4 * st, 3, -1.3, nn, uu);
      // the ling gong at the tip, the bearing block (tiemu) and, through all, the beam-end (shuatou)
      cross(4 * st, 0.36, 4, 3, nn, uu);
      const tm = [x + nn[0] * 4 * st, z + nn[1] * 4 * st];
      obox(arms, tm, uu, nn, 0.52, W, L(4) + H + 0.11, L(4) + H + 0.26);
      prism(arms, [[-1.5, L(4)], [4 * st + 0.42, L(4)], [4 * st + 0.52, L(4) + H * 0.55], [4 * st + 0.4, L(4) + H], [-1.5, L(4) + H]], W, alongN(c, nn, uu));
      // the inner tail: a third flower arm under the crescent beam
      hua(-3 * st, -2 * st + 0.2, 2, [true, false], nn, uu); tipDou(-3 * st, 2, nn, uu);
    }
    if (kind !== 'corner') {
      // in the wall plane over the column: the nidao gong and the man gong above it
      cross(0, 0.62, 0, 3); cross(0, 0.92, 1, 2);
    }
  }
  bag.add(el.mat || 'timber_red', fromTriangles(arms));
  bag.add(el.blockMat || 'timber_red', fromTriangles(blocks));
}

/** A straight timber (fang, purlin) of section w × h from a [x, z, y] to b [x, z, y] (bottom line), rising or level. */
function tangFang(el, { bag }) {
  const [ax, az, ay] = el.a, [bx, bz, by] = el.b, w = el.w / 2, h = el.h, L = Math.hypot(bx - ax, bz - az);
  const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz * w, nz = ux * w, e = el.ext || 0;
  const A = [ax - ux * e, az - uz * e], B2 = [bx + ux * e, bz + uz * e];
  const out = [];
  hexa(out, [[A[0] - nx, ay, A[1] - nz], [B2[0] - nx, by, B2[1] - nz], [B2[0] + nx, by, B2[1] + nz], [A[0] + nx, ay, A[1] + nz]],
    [[A[0] - nx, ay + h, A[1] - nz], [B2[0] - nx, by + h, B2[1] - nz], [B2[0] + nx, by + h, B2[1] + nz], [A[0] + nx, ay + h, A[1] + nz]]);
  bag.add(el.mat || 'timber_red', fromTriangles(out));
}

/**
 * The rafters under a Tang eave { rafters: { out (eave depth past the column line), sp } }: round rafters
 * (yanchuan) from the column line out, square flying rafters (feizi) in the last metre; along the sides
 * they run square to the eave, toward the corners they fan round to the hip.
 */
function eaveRafters(el, h, bag) {
  const [cx, cz] = el.c, A = el.A, B = el.B, { out = 4, sp = 0.3 } = el.rafters;
  const R = [], F = [];
  const piece = (dst, p, q, wd, dp, drop = 0) => {
    // a straight length under the roof boards from p to q (plan points), width wd, depth dp
    const dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz), px = -dz / l * wd / 2, pz = dx / l * wd / 2;
    const ya = h(p[0], p[1]) - 0.30 - drop, yb = h(q[0], q[1]) - 0.30 - drop;
    hexa(dst, [[p[0] - px, ya - dp, p[1] - pz], [q[0] - px, yb - dp, q[1] - pz], [q[0] + px, yb - dp, q[1] + pz], [p[0] + px, ya - dp, p[1] + pz]],
      [[p[0] - px, ya, p[1] - pz], [q[0] - px, yb, q[1] - pz], [q[0] + px, yb, q[1] + pz], [p[0] + px, ya, p[1] + pz]]);
  };
  // the four sides: [edge point fn(a), inward normal, along unit, half-length]
  const sides = [
    [(a) => [cx + a, cz - B], [0, 1], [1, 0], A], [(a) => [cx + a, cz + B], [0, -1], [1, 0], A],
    [(a) => [cx - A, cz + a], [1, 0], [0, 1], B], [(a) => [cx + A, cz + a], [-1, 0], [0, 1], B],
  ];
  const depthTo = ([px, pz]) => Math.min(B - Math.abs(pz - cz), A - Math.abs(px - cx));
  for (const [edge, inw, al, half] of sides) {
    const nR = Math.floor((2 * half - 0.4) / sp);
    for (let i = 0; i <= nR; i++) {
      const a = -half + 0.2 + i * (2 * half - 0.4) / nR;
      const f = Math.max(0, Math.min(1, (Math.abs(a) - (half - out)) / out));
      let d = [inw[0] - al[0] * Math.sign(a) * f * 0.9, inw[1] - al[1] * Math.sign(a) * f * 0.9];
      const dl = Math.hypot(...d); d = [d[0] / dl, d[1] / dl];
      const p0 = edge(a), p = [p0[0] + inw[0] * 0.03, p0[1] + inw[1] * 0.03];
      // march inward until the column line or the hip (where another side is nearer)
      const pts = [p];
      for (let k = 1; k <= 60; k++) {
        const q = [p[0] + d[0] * k * 0.1, p[1] + d[1] * k * 0.1];
        const own = (q[0] - p0[0]) * inw[0] + (q[1] - p0[1]) * inw[1];
        if (own > out + 0.1 || depthTo(q) < own - 0.12) break;
        if (k % 4 === 0) pts.push(q);
      }
      if (pts.length < 2) continue;
      const own = (q) => (q[0] - p0[0]) * inw[0] + (q[1] - p0[1]) * inw[1];
      for (let k = 0; k < pts.length - 1; k++) {
        const o0 = own(pts[k]), o1 = own(pts[k + 1]);
        if (o1 <= 1.0) piece(F, pts[k], pts[k + 1], 0.12, 0.13, 0.0);
        if (o1 > 0.8) piece(R, pts[k], pts[k + 1], 0.15, 0.15, o0 < 1.0 ? 0.1 : 0.1);
      }
    }
  }
  bag.add(el.soffit || 'timber_red', fromTriangles(R));
  bag.add(el.soffit || 'timber_red', fromTriangles(F));
}

/** A Tang chiwei (owl's tail) at the ridge end [x, z], base y, curling toward `inward` (±1 along x), height H. */
function chiwei(out, x, z, y, inward, H) {
  const N = 14, sl = (t) => {
    // its outer edge sweeps up and in like a fin; the inner edge stands straight, then leans in at the top
    const xo = 0.55 - 1.05 * Math.pow(t, 2.1), xi = -0.4 - 0.32 * Math.pow(t, 3);
    return [xi, xo];
  };
  for (let k = 0; k < N; k++) {
    const t0 = k / N, t1 = (k + 1) / N, [a0, b0] = sl(t0), [a1, b1] = sl(t1), w0 = 0.26 - 0.12 * t0, w1 = 0.26 - 0.12 * t1;
    const P = (s, yy, w) => [x - inward * s, yy, z + w];
    hexa(out, [P(a0, y + H * t0, -w0), P(b0, y + H * t0, -w0), P(b0, y + H * t0, w0), P(a0, y + H * t0, w0)],
      [P(a1, y + H * t1, -w1), P(b1, y + H * t1, -w1), P(b1, y + H * t1, w1), P(a1, y + H * t1, w1)]);
    // the raised fins along the outer edge
    if (k < N - 2 && k % 2 === 0) {
      const tm = (t0 + t1) / 2, [, bm] = sl(tm);
      hexa(out, [P(bm - 0.22, y + H * t0, -w0 - 0.04), P(bm - 0.02, y + H * t0, -w0 - 0.04), P(bm - 0.02, y + H * t0, w0 + 0.04), P(bm - 0.22, y + H * t0, w0 + 0.04)],
        [P(bm - 0.22, y + H * t1, -w1 - 0.04), P(bm - 0.02, y + H * t1, -w1 - 0.04), P(bm - 0.02, y + H * t1, w1 + 0.04), P(bm - 0.22, y + H * t1, w1 + 0.04)]);
    }
  }
}

/** A hipped roof (wudian) { c [x, z], A, B (half-sizes at the eave edge, A ≥ B), y (eave), rise, lift, mat }. */
function hipRoof(el, ctx) { alongZ(hipRoofX, el, ctx); }

/** Build a roof along x, or — for a hall whose long side runs along z — turn it a quarter round its centre. */
export function alongZ(fn, el, ctx) {
  if (!el.alongZ) return fn(el, ctx);
  const list = [];
  fn(el, { ...ctx, bag: { add: (mat, g) => list.push([mat, g]) } });
  const [cx, cz] = el.c;
  for (const [mat, g] of list) { g.translate(-cx, 0, -cz); g.rotateY(Math.PI / 2); g.translate(cx, 0, cz); ctx.bag.add(mat, g); }
}
function hipRoofX(el, { bag }) {
  const [cx, cz] = el.c, A = el.A, B = el.B, R = el.rise, U = el.lift ?? 0.6;
  // the profile: concave (a power of the distance in from the eave), optionally with a straight
  // slope S at the eave itself, so that the rafters run down past the eave purlin (Tang halls)
  const S = el.eaveSlope ?? 0, PW = el.pow ?? 1.45;
  const h = (x, z) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz);
    const t = Math.max(0, Math.min(1, Math.min((B - az) / B, (A - ax) / B)));
    const corner = Math.max(0, 1 - (A - ax) / 5) * Math.max(0, 1 - (B - az) / 5);
    return el.y + S * B * t + (R - S * B) * Math.pow(t, PW) + U * corner * corner;
  };
  if (el.rafters) eaveRafters(el, h, bag);
  const grid = (off, up, mat) => {
    const N = 64, M = 40, pos = [], nor = [];
    const P = (i, j) => { const x = cx - A + 2 * A * i / N, z = cz - B + 2 * B * j / M; return [x, h(x, z) + off, z]; };
    const nrm = (i, j) => {
      const a = P(Math.max(0, i - 1), j), b = P(Math.min(N, i + 1), j), c = P(i, Math.max(0, j - 1)), d = P(i, Math.min(M, j + 1));
      const ux = b[0] - a[0], uy = b[1] - a[1], vy = d[1] - c[1], vz = d[2] - c[2];
      let n = [-uy / ux, 1, -vy / vz]; const l = Math.hypot(...n); n = n.map((v) => v / l);
      return up ? n : n.map((v) => -v);
    };
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      const tris = up ? [[0, 2, 1], [0, 3, 2]] : [[0, 1, 2], [0, 2, 3]];
      for (const tri of tris) for (const k of tri) { pos.push(...P(...q[k])); nor.push(...nrm(...q[k])); }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    bag.add(mat, g);
  };
  grid(0, true, el.mat || 'tile_grey');
  grid(-0.32, false, el.soffit || 'timber_red');
  // the eave's edge: a fascia between tiles and soffit
  const edge = [], E = 96;
  const ring = (k) => {
    const per = 4 * (A + B), d = per * k / E;
    if (d < 2 * A) return [cx - A + d, cz - B];
    if (d < 2 * A + 2 * B) return [cx + A, cz - B + (d - 2 * A)];
    if (d < 4 * A + 2 * B) return [cx + A - (d - 2 * A - 2 * B), cz + B];
    return [cx - A, cz + B - (d - 4 * A - 2 * B)];
  };
  for (let k = 0; k < E; k++) {
    const [ax, az] = ring(k), [bx, bz] = ring(k + 1);
    const ya = h(ax, az), yb = h(bx, bz);
    edge.push(ax, ya + 0.02, az, bx, yb + 0.02, bz, bx, yb - 0.34, bz, ax, ya + 0.02, az, bx, yb - 0.34, bz, ax, ya - 0.34, az);
    edge.push(ax, ya + 0.02, az, bx, yb - 0.34, bz, bx, yb + 0.02, bz, ax, ya + 0.02, az, ax, ya - 0.34, az, bx, yb - 0.34, bz);
  }
  bag.add(el.soffit || 'timber_red', fromTriangles(edge));
  // the main ridge with its chiwei, and the four hip ridges
  const r = [], L = A - B, top = el.y + R;
  obox(r, [cx, cz], [1, 0], [0, 1], L + 0.2, 0.3, top - 0.1, top + 0.75);
  for (const s of [-1, 1]) {
    const ex = cx + s * (L + 0.1);
    if (el.tangChiwei) chiwei(r, ex, cz, top + 0.7, -s, el.tangChiwei);
    else if (!el.noChiwei)
    // a chiwei: a tall ornament curling inward, built of stacked blocks
    for (let k = 0; k < 6; k++) obox(r, [ex - s * (0.18 * k * k / 6), cz], [1, 0], [0, 1], 0.42 - k * 0.03, 0.22, top + 0.6 + k * 0.42, top + 1.05 + k * 0.42);
    for (const sz of [-1, 1]) {
      const pts = [];
      for (let k = 0; k <= 24; k++) { const t = k / 24, x = ex + s * B * t, z = cz + sz * B * t; pts.push([x, h(x, z) + 0.25, z]); }
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
        const w = 0.22, px = -uz * w, pz = ux * w;
        hexa(r, [[a[0] - px, a[1] - 0.3, a[2] - pz], [a[0] + px, a[1] - 0.3, a[2] + pz], [b[0] + px, b[1] - 0.3, b[2] + pz], [b[0] - px, b[1] - 0.3, b[2] - pz]],
          [[a[0] - px, a[1] + 0.25, a[2] - pz], [a[0] + px, a[1] + 0.25, a[2] + pz], [b[0] + px, b[1] + 0.25, b[2] + pz], [b[0] - px, b[1] + 0.25, b[2] - pz]]);
      }
    }
  }
  bag.add(el.ridgeMat || 'tile_grey', fromTriangles(r));
}

/** A gabled roof (for gates and lesser halls) { c, A, B, y, rise, mat } with a ridge. */
function gableRoofC(el, ctx) { alongZ(gableRoofCX, el, ctx); }
function gableRoofCX(el, { bag }) {
  const [cx, cz] = el.c, A = el.A, B = el.B, y = el.y, R = el.rise;
  const tris = [], under = [];
  const prof = (t) => y + R * Math.pow(t, 1.4);
  const N = 12;
  for (let k = 0; k < N; k++) {
    const t0 = k / N, t1 = (k + 1) / N;
    for (const s of [-1, 1]) {
      const z0 = cz + s * B * (1 - t0), z1 = cz + s * B * (1 - t1);
      tris.push(cx - A, prof(t0), z0, cx + A, prof(t0), z0, cx + A, prof(t1), z1, cx - A, prof(t0), z0, cx + A, prof(t1), z1, cx - A, prof(t1), z1);
    }
  }
  for (let i = 0; i < tris.length; i += 9) {
    const ux = tris[i + 3] - tris[i], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vz = tris[i + 8] - tris[i + 2];
    if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const tt = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = tt; }
  }
  for (let i = 0; i < tris.length; i += 9) under.push(tris[i], tris[i + 1] - 0.25, tris[i + 2], tris[i + 6], tris[i + 7] - 0.25, tris[i + 8], tris[i + 3], tris[i + 4] - 0.25, tris[i + 5]);
  bag.add(el.mat || 'tile_grey', fromTriangles(tris));
  bag.add(el.soffit || 'timber_red', fromTriangles(under));
  const rm = el.ridgeMat || 'tile_grey';
  bag.add(rm, box(cx - A - 0.1, y + R - 0.1, cz - 0.25, cx + A + 0.1, y + R + 0.5, cz + 0.25));
  if (!el.noHorns) for (const s of [-1, 1]) bag.add(rm, box(cx + s * A - 0.25, y + R, cz - 0.22, cx + s * A + 0.25, y + R + 1.1, cz + 0.22));
  // the gable ends closed by boards
  if (el.gableMat) {
    const g = [];
    for (const s of [-1, 1]) {
      const x = cx + s * (A - 0.6);
      for (let k = 0; k < N; k++) for (const sz of [-1, 1]) {
        const t0 = k / N, t1 = (k + 1) / N, z0 = cz + sz * B * (1 - t0) * 0.82, z1 = cz + sz * B * (1 - t1) * 0.82;
        g.push(x, y, cz, x, prof(t0) - 0.3, z0, x, prof(t1) - 0.3, z1, x, y, cz, x, prof(t1) - 0.3, z1, x, prof(t0) - 0.3, z0);
      }
    }
    bag.add(el.gableMat, fromTriangles(g));
  }
}

/** A round timber column on a lotus base { at, y, h, d }. */
function column(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, h = el.h, r = el.d / 2;
  bag.add('limestone', box(x - r * 1.9, y - 0.05, z - r * 1.9, x + r * 1.9, y + 0.12, z + r * 1.9));
  bag.add('limestone', lathe([[r * 1.75, 0], [r * 1.65, 0.1], [r * 1.2, 0.22], [r * 1.05, 0.26]], 16, (th) => 1 + 0.06 * Math.abs(Math.cos(th * 4)), x, y + 0.12, z));
  bag.add(el.shaftMat || 'timber_red', lathe([[r, 0], [r * 1.0, h * 0.4], [r * 0.9, h - 0.38]], 20, null, x, y + 0.38, z));
  col.circle(x, z, r * 1.2, y, y + h);
}

// an ellipsoid of radii rx, ry, rz at c (low-poly by default)
function ellipsoid(c, rx, ry, rz, seg = 10, rows = 6) {
  const prof = [];
  for (let i = 0; i <= rows; i++) { const a = -Math.PI / 2 + (i / rows) * Math.PI; prof.push([Math.max(0.001, Math.cos(a)), Math.sin(a)]); }
  const g = lathe(prof, seg); g.scale(rx, ry, rz); g.translate(c[0], c[1], c[2]); return g;
}
// a limb segment: a rod from a to b with a ball at the joint b
function limb(out, a, b, r0, r1) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d);
  const g = lathe([[r0, 0], [r1, L]], 10);
  const up = [0, 1, 0], n = d.map((v) => v / L), ax = [up[1] * n[2] - up[2] * n[1], up[2] * n[0] - up[0] * n[2], up[0] * n[1] - up[1] * n[0]];
  const al = Math.hypot(...ax), ang = Math.acos(Math.max(-1, Math.min(1, n[1])));
  if (al > 1e-6) g.applyMatrix4(new Matrix4().makeRotationAxis(new Vector3(ax[0] / al, ax[1] / al, ax[2] / al), ang));
  g.translate(...a); out.push(g, ellipsoid(b, r1, r1, r1, 8, 4));
}
// a lotus petal: a curved, pointed shell rising from radius r0 at height y0, outward and up, at angle th
function petal(th, r0, y0, len, w, lift) {
  const tri = [], N = 7, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, half = w * Math.sqrt(Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.92))), out = r0 + len * Math.cos(lift * t), up = y0 + len * Math.sin(lift * t) * 0.9;
    pts.push([[-half, out - 0.04, up], [0, out + 0.03 * Math.sin(Math.PI * t), up + 0.02], [half, out - 0.04, up]]);
  }
  const P = ([a, r, y]) => [Math.cos(th) * r - Math.sin(th) * a, y, Math.sin(th) * r + Math.cos(th) * a];
  for (let i = 0; i < N; i++) for (let k = 0; k < 2; k++) {
    const a = P(pts[i][k]), b = P(pts[i][k + 1]), c = P(pts[i + 1][k + 1]), d = P(pts[i + 1][k]);
    tri.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  return tri;
}

/**
 * A seated Buddha on a lotus throne { at, y, h, dir, robe, gilt, noThrone, noHalo, simple }:
 * a drum and two rows of upturned petals; the legs crossed with the soles up; the right hand
 * raised (fear not), the left open on the knee (granting); the robe in folds; the head with its
 * snail-shell curls, the topknot, the long lobes, the mark between the brows; behind, a pointed
 * mandorla with flame edge, head and body haloes and small seated Buddhas. Built at h = 5.2.
 */
export function buddha(el, { bag }) {
  const [x, z] = el.at, H = el.h || 5.2, s = H / 5.2, dir = el.dir || [-1, 0];
  const robe = el.robe || 'clay_robe', gilt = el.gilt || 'clay_gilt', simple = el.simple;
  const R = [], G = [], tri = [];
  const b = 1.6;
  if (el.hexSeat || el.pendant) {
    // a sumeru seat: plinth, mouldings stepping in to a waist, stepping out again to the seat (six-sided, or square for the pendant pose)
    const nS = el.pendant ? 4 : 6, k = el.pendant ? Math.SQRT2 : 1 / Math.cos(Math.PI / 6);
    const prof = [[0.001, 0], [1.5, 0], [1.5, 0.18], [1.36, 0.26], [1.24, 0.34], [1.06, 0.42], [1.0, 0.5], [1.0, 1.1], [1.06, 1.18], [1.24, 1.28], [1.36, 1.38], [1.44, 1.46], [1.44, b], [0.001, b]];
    const g = lathe(prof.map(([r, y]) => [r * k * (el.pendant ? 0.6 : 1), y]), nS);
    g.rotateY(Math.PI / nS); R.push(g);
    // the waist's panels in gilt, one to a face
    for (let i = 0; i < nS; i++) {
      const a = (i + 0.5) * 2 * Math.PI / nS + Math.PI / nS, r0 = 1.0 * (el.pendant ? 0.6 * k * Math.cos(Math.PI / 4) : 1) + 0.02, hw = r0 * Math.tan(Math.PI / nS) * 0.7;
      const cxp = Math.cos(a) * r0, czp = Math.sin(a) * r0, tx = -Math.sin(a), tz = Math.cos(a);
      tri.push(...orientOutward([cxp - tx * hw, 0.6, czp - tz * hw, cxp + tx * hw, 0.6, czp + tz * hw, cxp + tx * hw + Math.cos(a) * 0.03, 1.0, czp + tz * hw + Math.sin(a) * 0.03,
        cxp - tx * hw, 0.6, czp - tz * hw, cxp + tx * hw + Math.cos(a) * 0.03, 1.0, czp + tz * hw + Math.sin(a) * 0.03, cxp - tx * hw + Math.cos(a) * 0.03, 1.0, czp - tz * hw + Math.sin(a) * 0.03]));
    }
  } else if (!el.noThrone) {
    R.push(lathe([[0.001, 0], [1.55, 0], [1.55, 0.14], [1.38, 0.22], [1.38, 0.3], [1.15, 0.4], [1.0, 0.48], [1.0, 0.86], [1.12, 0.94], [0.001, 0.94]], 24));
    for (let i = 0; i < 14; i++) tri.push(...petal((i / 14) * Math.PI * 2, 0.98, 0.92, 0.62, 0.3, 1.32));
    for (let i = 0; i < 14; i++) tri.push(...petal(((i + 0.5) / 14) * Math.PI * 2, 0.9, 1.06, 0.58, 0.28, 1.42));
    G.push(lathe([[1.0, 1.0], [1.2, 1.5], [1.18, b], [0.001, b]], 24));
  }
  // the crossed legs, knees out to the sides; the soles turned up on the thighs
  if (el.pendant) {
    // seated with the feet down (Maitreya): the thighs forward, the shins to lotus footrests, the robe hanging between the knees
    for (const k of [-1, 1]) {
      limb(R, [k * 0.38, b + 0.3, 0], [k * 0.42, b + 0.3, 1.08], 0.3, 0.24);
      limb(R, [k * 0.42, b + 0.3, 1.08], [k * 0.46, 0.32, 1.16], 0.22, 0.16);
      G.push(ellipsoid([k * 0.46, 0.24, 1.3], 0.13, 0.08, 0.26, 10, 4));
      R.push(lathe([[0.001, 0], [0.36, 0], [0.42, 0.1], [0.3, 0.16], [0.001, 0.17]], 14, (th) => 1 + 0.07 * Math.abs(Math.cos(th * 5)), k * 0.46, 0, 1.28));
    }
    const drape = lathe([[0.001, 0], [0.5, 0], [0.42, 0.8], [0.44, 1.3], [0.001, 1.32]], 16, (th) => 1 + 0.06 * Math.cos(th * 9));
    drape.scale(1, 1, 0.3); drape.translate(0, b - 1.0, 1.12); R.push(drape);
    R.push(ellipsoid([0, b + 0.28, 0.4], 0.78, 0.3, 0.66, 14, 6));
  } else {
    const legs = lathe([[0.001, 0], [1.0, 0], [1.04, 0.2], [0.92, 0.42], [0.55, 0.52], [0.001, 0.54]], 24, (th) => 1 + 0.035 * Math.cos(th * 11));
    legs.scale(1.3, 1, 0.78); legs.translate(0, b, 0.08); R.push(legs);
    for (const k of [-1, 1]) R.push(ellipsoid([k * 1.0, b + 0.24, 0.22], 0.36, 0.25, 0.4, 12, 6));
    G.push(ellipsoid([0.36, b + 0.46, 0.38], 0.3, 0.07, 0.12, 10, 4), ellipsoid([-0.3, b + 0.44, 0.3], 0.28, 0.07, 0.12, 10, 4));
  }
  // the body: robe folds in the lower part, the chest, the shoulders
  const body = lathe([[0.001, 0.4], [0.66, 0.4], [0.62, 0.8], [0.6, 1.1], [0.68, 1.45], [0.7, 1.64], [0.5, 1.88], [0.2, 2.02], [0.001, 2.04]], 24,
    (th, i) => 1 + (i <= 3 ? 0.03 * Math.cos(th * 13) : 0));
  body.scale(1, 1, 0.74); body.translate(0, b, -0.02); R.push(body);
  // the hem of the robe across the chest, from the left shoulder down under the right breast
  const hem = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; hem.push([0.62 - 1.0 * t, b + 1.66 - 0.5 * t - 0.12 * Math.sin(Math.PI * t)]); }
  for (let i = 0; i < 8; i++) {
    const [x0, y0] = hem[i], [x1, y1] = hem[i + 1], zf = (xx) => 0.52 * Math.sqrt(Math.max(0.05, 1 - (xx / 0.74) ** 2)) + 0.01;
    tri.push(x0, y0, zf(x0), x1, y1, zf(x1), x1, y1 + 0.06, zf(x1) + 0.035, x0, y0, zf(x0), x1, y1 + 0.06, zf(x1) + 0.035, x0, y0 + 0.06, zf(x0) + 0.035);
  }
  // arms: the right raised, palm out; the left on the knee, palm up
  // (or, mudra 'earth': the right hand down over the right knee, touching the earth; the left holding the alms bowl in the lap)
  const earth = el.mudra === 'earth';
  limb(R, [-0.66, b + 1.6, 0], [-0.92, b + 1.0, 0.2], 0.2, 0.17);
  if (earth) limb(R, [-0.92, b + 1.0, 0.2], [-1.0, b + 0.5, 0.62], 0.17, 0.12);
  else limb(R, [-0.92, b + 1.0, 0.2], [-0.8, b + 1.42, 0.5], 0.17, 0.12);
  limb(R, [0.66, b + 1.6, 0], [0.92, b + 0.98, 0.12], 0.2, 0.17);
  if (earth) limb(R, [0.92, b + 0.98, 0.12], [0.3, b + 0.62, 0.5], 0.17, 0.12);
  else limb(R, [0.92, b + 0.98, 0.12], [0.86, b + 0.56, 0.5], 0.17, 0.12);
  // the sleeves hang from the forearms
  for (const k of [-1, 1]) R.push(ellipsoid([k * 1.0, b + 0.82, 0.2], 0.16, 0.34, 0.24, 10, 5));
  if (earth) {
    G.push(ellipsoid([-1.02, b + 0.42, 0.72], 0.12, 0.2, 0.05, 10, 4));
    G.push(lathe([[0.001, 0], [0.12, 0.01], [0.2, 0.08], [0.22, 0.16], [0.19, 0.18], [0.001, 0.12]], 16, null, 0.2, b + 0.6, 0.55));
  } else G.push(ellipsoid([-0.8, b + 1.6, 0.52], 0.13, 0.2, 0.05, 10, 4), ellipsoid([0.84, b + 0.56, 0.68], 0.13, 0.045, 0.2, 10, 4));
  if (!simple && !earth) for (let f = 0; f < 4; f++) {
    G.push(ellipsoid([-0.89 + f * 0.06, b + 1.83, 0.53], 0.026, 0.07, 0.026, 6, 3));
    G.push(ellipsoid([0.78 + f * 0.06, b + 0.57, 0.88], 0.026, 0.024, 0.07, 6, 3));
  }
  // the neck with its three folds, the head, the face
  G.push(lathe([[0.2, 1.98], [0.19, 2.04], [0.205, 2.06], [0.19, 2.1], [0.2, 2.12], [0.18, 2.16], [0.001, 2.17]], 16, null, 0, b, 0));
  const head = lathe([[0.001, 2.12], [0.18, 2.14], [0.28, 2.24], [0.33, 2.4], [0.34, 2.56], [0.3, 2.7], [0.18, 2.8], [0.001, 2.83]], 18);
  head.scale(1, 1, 0.92); head.translate(0, b, 0.02); G.push(head);
  if (el.crown) {
    // a bodhisattva: the hair in a high chignon, a jewelled crown with a small Buddha in front, ribbons by the ears
    G.push(ellipsoid([0, b + 2.98, -0.02], 0.15, 0.24, 0.14, 12, 6));
    G.push(lathe([[0.33, 0], [0.35, 0.04], [0.37, 0.16], [0.33, 0.17], [0.31, 0.05]], 20, (th) => 1 + 0.06 * Math.max(0, Math.cos(th * 5)), 0, b + 2.6, 0.02));
    for (const a of [-0.9, 0, 0.9]) G.push(ellipsoid([Math.sin(a) * 0.36, b + 2.86, Math.cos(a) * 0.32], 0.09, 0.14, 0.03, 8, 4));
    for (const k of [-1, 1]) G.push(ellipsoid([k * 0.38, b + 2.25, -0.04], 0.03, 0.34, 0.05, 6, 4));
  } else G.push(ellipsoid([0, b + 2.88, 0.0], 0.2, 0.14, 0.19, 12, 5));
  G.push(ellipsoid([0, b + 2.4, 0.33], 0.035, 0.1, 0.05, 6, 4), ellipsoid([0, b + 2.53, 0.32], 0.022, 0.022, 0.02, 6, 3));
  for (const k of [-1, 1]) {
    G.push(ellipsoid([k * 0.34, b + 2.36, 0], 0.045, 0.2, 0.09, 8, 5));
    G.push(ellipsoid([k * 0.12, b + 2.48, 0.29], 0.075, 0.018, 0.03, 8, 3));
  }
  if (!simple && !el.crown) {
    // the curls: rings of small knots over the crown and the topknot
    for (const [ry, rr, n, cy] of [[2.62, 0.32, 26, 0], [2.7, 0.28, 22, 0], [2.77, 0.21, 16, 0], [2.81, 0.12, 9, 0], [2.86, 0.19, 14, 1], [2.95, 0.14, 10, 1], [3.0, 0.06, 5, 1]]) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ry;
        if (!cy && Math.sin(a) > 0.55 && ry < 2.66) continue;
        G.push(ellipsoid([Math.cos(a) * rr, b + ry, Math.sin(a) * rr * 0.92 + 0.02], 0.04, 0.035, 0.04, 6, 3));
      }
    }
  }
  const yaw = Math.atan2(dir[0], dir[1]);
  const put = (g) => place(g, x, el.y, z, yaw, s);
  for (const g of R) bag.add(robe, put(g));
  for (const g of G) bag.add(gilt, put(g));
  if (tri.length) bag.add(el.noThrone ? robe : gilt, put(fromTriangles(tri)));
  if (el.noHalo) return;
  // the mandorla: a pointed leaf with a flame edge, standing behind
  const M = [], cy = 3.4, n = 72, zb = -0.6, outline = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2, sn = Math.sin(a);
    const w = 1.55 * (1 - 0.32 * Math.max(0, sn) ** 2), h = 1.85 + 0.55 * Math.max(0, sn) ** 6;
    const f = 1 + 0.045 * Math.abs(Math.sin(a * 14)) * (sn > -0.6 ? 1 : 0);
    outline.push([Math.cos(a) * w * f, cy + sn * h * f]);
  }
  for (let i = 0; i < n; i++) {
    const p = outline[i], q = outline[(i + 1) % n];
    M.push(0, cy, zb, p[0], p[1], zb, q[0], q[1], zb, 0, cy, zb - 0.06, q[0], q[1], zb - 0.06, p[0], p[1], zb - 0.06);
    M.push(p[0], p[1], zb, p[0], p[1], zb - 0.06, q[0], q[1], zb - 0.06, p[0], p[1], zb, q[0], q[1], zb - 0.06, q[0], q[1], zb);
  }
  bag.add(gilt, put(fromTriangles(M)));
  // head and body haloes as raised rings
  const ring = (r0, r1, yc, dz) => lathe([[r0, -0.02], [r1, -0.02], [r1, 0.02], [r0, 0.02]], 32).rotateX(Math.PI / 2).translate(0, yc, zb + dz);
  bag.add(gilt, put(ring(0.62, 0.7, b + 2.45, 0.03)));
  bag.add(gilt, put(ring(0.3, 0.36, b + 2.45, 0.025)));
  bag.add(gilt, put(ring(1.08, 1.16, 2.95, 0.03)));
  if (simple) return;
  // small seated Buddhas round the outer band
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * (-0.12 + (i / 12) * 1.24), px = Math.cos(a) * 1.3, py = cy + Math.sin(a) * 1.62 - 0.1;
    const lx = Math.cos(yaw) * px * s + Math.sin(yaw) * (zb + 0.05) * s, lz = -Math.sin(yaw) * px * s + Math.cos(yaw) * (zb + 0.05) * s;
    buddha({ at: [x + lx, z + lz], y: el.y + (py - 1.6 * 0.07) * s, h: 0.36 * s, dir, robe: gilt, gilt, noThrone: true, noHalo: true, simple: true }, { bag });
  }
}

/** A standing figure (attendant, heavenly king) { at, y, h, robe }: the plain stand-in of the earlier design. */
function figure(el, { bag }) {
  const [x, z] = el.at, y = el.y, h = el.h || 2.4;
  bag.add('clay_gilt', lathe([[0.45, 0], [0.42, 0.25]], 12, (th) => 1 + 0.08 * Math.abs(Math.cos(th * 8)), x, y, z));
  bag.add(el.robe || 'clay_green', lathe([[0.36, 0], [0.3, h * 0.35], [0.24, h * 0.6], [0.3, h * 0.74], [0.17, h * 0.82], [0.001, h * 0.82]], 14, null, x, y + 0.25, z));
  bag.add('clay_gilt', lathe([[0.001, h * 0.82], [0.12, h * 0.86], [0.13, h * 0.94], [0.06, h * 1.0], [0.001, h * 1.02]], 12, null, x, y + 0.25, z));
}

// a rod (limb, ribbon) from a to b of radii r0 → r1, without the joint ball
function rodG(a, b, r0, r1, seg = 8) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d);
  const g = lathe([[r0, 0], [r1, L]], seg);
  const n = d.map((v) => v / L), ax = [n[2], 0, -n[0]], al = Math.hypot(...ax), ang = Math.acos(Math.max(-1, Math.min(1, n[1])));
  if (al > 1e-6) g.applyMatrix4(new Matrix4().makeRotationAxis(new Vector3(ax[0] / al, 0, ax[2] / al), ang));
  return g.translate(...a);
}
// a ribbon hanging in a curve through the points pts (a chain of rods)
function ribbon(out, pts, r) { for (let i = 0; i < pts.length - 1; i++) out.push(rodG(pts[i], pts[i + 1], r, r, 6)); }
// a lotus pedestal of radius r: a drum with a ring of upturned petals
function lotusBase(G, tri, r, hgt) {
  G.push(lathe([[0.001, 0], [r * 1.05, 0], [r * 1.05, hgt * 0.25], [r * 0.7, hgt * 0.4], [r * 0.7, hgt * 0.8], [r * 0.9, hgt], [0.001, hgt]], 18));
  for (let i = 0; i < 12; i++) tri.push(...petal((i / 12) * Math.PI * 2, r * 0.65, hgt * 0.42, r * 0.42, r * 0.28, 1.25));
}

/**
 * A standing clay statue { at, y, h, dir, type, robe, robe2 } — built at 2.4 m and scaled:
 * 'bodhisattva': bare chest with a necklace, a dhoti in folds, a scarf (tianyi) over the shoulders looping across the thighs,
 *   a high chignon and crown, a halo; on a lotus; one hand raised, the other holding a vase;
 * 'disciple': a monk (Kāśyapa, Ānanda) in a long robe, the head shaven, the hands joined;
 * 'king': a heavenly king in armour — greaves, a flared armoured skirt, breastplates, shoulder guards, a helmet — both hands
 *   on a sword planted before him; on a rock;
 * 'groom': the man who leads the animal, in a short coat and trousers, one arm out on the rein;
 * 'kneel': an offering bodhisattva kneeling on a lotus, the hands raised with an offering.
 */
function statue(el, { bag }) {
  const [x, z] = el.at, H = el.h || 2.4, type = el.type || 'bodhisattva', dir = el.dir || [-1, 0];
  const robe = el.robe || 'clay_robe', robe2 = el.robe2 || 'clay_green', skin = 'clay_gilt';
  const R = [], R2 = [], G = [], tri = [];
  const kneel = type === 'kneel', king = type === 'king', monk = type === 'disciple', groom = type === 'groom';
  // the base: lotus, or rock under the king and the groom
  const b = king || groom ? 0.22 : 0.3;
  if (king || groom) R2.push(lathe([[0.001, 0], [0.5, 0], [0.52, 0.08], [0.46, 0.16], [0.4, b], [0.001, b]], 9, (th) => 1 + 0.12 * Math.sin(th * 3) + 0.06 * Math.cos(th * 7)));
  else lotusBase(G, tri, kneel ? 0.42 : 0.36, b);
  // the build height without the base: 2.1 m (standing), so a kneeling figure is scaled from the same body
  const by = kneel ? b - 0.62 : b;            // kneeling: the body sinks; the folded legs below
  if (kneel) {
    R.push(ellipsoid([0, b + 0.16, 0.05], 0.3, 0.17, 0.36, 12, 6));
    for (const k of [-1, 1]) R.push(ellipsoid([k * 0.14, b + 0.14, 0.3], 0.12, 0.13, 0.2, 10, 5));
  } else {
    // feet, and the lower garment
    for (const k of [-1, 1]) (monk || king || groom ? R2 : G).push(ellipsoid([k * 0.1, b + 0.04, 0.08], 0.07, 0.05, 0.13, 8, 4));
    if (king) {
      for (const k of [-1, 1]) R2.push(lathe([[0.075, 0], [0.085, 0.3], [0.09, 0.5], [0.06, 0.52]], 10, null, k * 0.11, b, 0));        // greaves
      R.push(lathe([[0.12, 0.42], [0.32, 0.5], [0.28, 0.8], [0.22, 1.05], [0.001, 1.06]], 16, (th) => 1 + 0.05 * Math.abs(Math.cos(th * 6)), 0, b, 0).scale(1, 1, 0.8));
      R2.push(lathe([[0.31, 0.58], [0.33, 0.62], [0.3, 0.64]], 16, null, 0, b, 0).scale(1, 1, 0.8));
    } else if (groom) {
      for (const k of [-1, 1]) R2.push(lathe([[0.07, 0], [0.09, 0.2], [0.1, 0.7], [0.12, 0.9], [0.001, 0.92]], 10, null, k * 0.1, b, 0));
      R.push(lathe([[0.001, 0.62], [0.24, 0.62], [0.22, 0.9], [0.2, 1.05], [0.001, 1.06]], 14).scale(1, 1, 0.8).translate(0, b, 0));
    } else {
      const skirt = lathe([[0.001, 0.02], [0.22, 0.02], [0.27, 0.12], [0.24, 0.5], [0.21, 0.88], [0.2, 1.04], [0.001, 1.06]], 18, (th) => 1 + 0.045 * Math.cos(th * 9));
      skirt.scale(1, 1, 0.8); skirt.translate(0, b, 0); R.push(skirt);
      if (!monk) R2.push(lathe([[0.215, 0.92], [0.225, 0.95], [0.215, 0.98]], 18).scale(1, 1, 0.8).translate(0, b, 0));   // the sash at the waist
    }
  }
  // torso
  const bareChest = type === 'bodhisattva' || kneel;
  const torso = lathe([[0.001, 1.0], [0.19, 1.02], [0.17, 1.2], [0.2, 1.36], [0.22, 1.48], [0.13, 1.57], [0.001, 1.6]], 16);
  torso.scale(king ? 1.15 : 1, 1, 0.72); torso.translate(0.02 * (bareChest ? 1 : 0), by, 0);
  (bareChest ? G : monk ? R : R2).push(torso);
  if (monk) {
    // the robe over the left shoulder, down to the feet
    const kasaya = lathe([[0.001, 0.05], [0.26, 0.05], [0.25, 0.6], [0.22, 1.1], [0.23, 1.45], [0.15, 1.56], [0.001, 1.58]], 18, (th) => 1 + 0.035 * Math.cos(th * 11));
    kasaya.scale(1.02, 1, 0.78); kasaya.translate(0, b, 0); R2.push(kasaya);
  }
  if (bareChest) {
    // the necklace, a U of jewels across the chest, and the scarf over the shoulders, looping across the thighs
    for (let i = 0; i <= 8; i++) { const t = i / 8, a = Math.PI * (0.15 + 0.7 * t); G.push(ellipsoid([Math.cos(a) * 0.15, by + 1.5 - 0.12 * Math.sin(Math.PI * t), Math.sin(a) * 0.14 + 0.02], 0.025, 0.025, 0.02, 6, 3)); }
    if (!kneel) {
      ribbon(R2, [[-0.22, by + 1.5, -0.04], [-0.3, by + 1.2, 0.0], [-0.34, by + 0.8, 0.06], [-0.32, by + 0.3, 0.05]], 0.025);
      ribbon(R2, [[0.22, by + 1.5, -0.04], [0.3, by + 1.2, 0.0], [0.34, by + 0.8, 0.06], [0.32, by + 0.3, 0.05]], 0.025);
      ribbon(R2, [[-0.26, by + 1.0, 0.1], [-0.12, by + 0.78, 0.2], [0.1, by + 0.74, 0.2], [0.26, by + 0.9, 0.12]], 0.022);
    }
  }
  if (king) {
    // the breastplates (two discs), the belt, the shoulder guards with their flared rims, the sleeves fluttering
    for (const k of [-1, 1]) G.push(ellipsoid([k * 0.1, by + 1.38, 0.15], 0.085, 0.085, 0.03, 12, 4));
    G.push(lathe([[0.21, 1.02], [0.235, 1.06], [0.21, 1.1]], 16).scale(1.1, 1, 0.8).translate(0, by, 0));
    for (const k of [-1, 1]) { R.push(ellipsoid([k * 0.27, by + 1.46, 0], 0.13, 0.1, 0.13, 10, 5)); G.push(ellipsoid([k * 0.31, by + 1.4, 0], 0.1, 0.05, 0.12, 10, 4)); }
    ribbon(R, [[-0.3, by + 1.3, -0.05], [-0.42, by + 1.0, -0.08], [-0.46, by + 0.6, -0.02]], 0.035);
    ribbon(R, [[0.3, by + 1.3, -0.05], [0.42, by + 1.0, -0.08], [0.46, by + 0.6, -0.02]], 0.035);
  }
  // arms
  const arm = (k, sh, el2, hd, rr = 0.06) => { (bareChest ? G : R2).push(rodG(sh, el2, rr, rr * 0.85), ellipsoid(el2, rr * 0.85, rr * 0.85, rr * 0.85, 8, 4)); (bareChest ? G : R2).push(rodG(el2, hd, rr * 0.85, rr * 0.7)); G.push(ellipsoid(hd, 0.045, 0.06, 0.03, 8, 4)); };
  const sh = (k) => [k * 0.22, by + 1.48, 0];
  if (monk || kneel) { for (const k of [-1, 1]) arm(k, sh(k), [k * 0.25, by + 1.18, 0.08], [k * 0.03, by + 1.32, 0.2]); }
  else if (king) { for (const k of [-1, 1]) arm(k, sh(k), [k * 0.3, by + 1.15, 0.1], [k * 0.05, by + 1.02, 0.28], 0.075); }
  else if (groom) { arm(-1, sh(-1), [-0.3, by + 1.2, 0.15], [-0.25, by + 1.25, 0.45]); arm(1, sh(1), [0.26, by + 1.18, 0.02], [0.28, by + 0.92, 0.08]); }
  else { arm(-1, sh(-1), [-0.27, by + 1.2, 0.04], [-0.2, by + 1.38, 0.2]); arm(1, sh(1), [0.27, by + 1.2, 0.02], [0.26, by + 0.98, 0.1]); }
  if (type === 'bodhisattva') G.push(lathe([[0.001, 0], [0.04, 0.02], [0.05, 0.08], [0.02, 0.13], [0.015, 0.2], [0.001, 0.21]], 10, null, 0.26, by + 0.92, 0.12));   // the vase
  if (monk) R2.push(ellipsoid([0, by + 1.22, 0.16], 0.13, 0.14, 0.08, 10, 5));      // the hands in the sleeves
  if (kneel) G.push(lathe([[0.001, 0], [0.06, 0.02], [0.08, 0.08], [0.001, 0.1]], 10, null, 0, by + 1.34, 0.22));   // the offering
  if (king) {
    // the sword: a long straight blade, point down before the feet, the hilt under the hands
    G.push(box(-0.025, b + 0.02, 0.34, 0.025, by + 1.0, 0.36), box(-0.12, by + 0.98, 0.31, 0.12, by + 1.02, 0.39), box(-0.02, by + 1.02, 0.33, 0.02, by + 1.16, 0.37));
  }
  // neck, head, hair
  G.push(lathe([[0.06, 1.55], [0.055, 1.62], [0.001, 1.64]], 10, null, 0, by, 0));
  const head = ellipsoid([0, by + 1.72, 0.01], 0.1, 0.13, 0.11, 12, 6); G.push(head);
  for (const k of [-1, 1]) G.push(ellipsoid([k * 0.1, by + 1.69, 0], 0.02, 0.06, 0.03, 6, 3));
  if (type === 'bodhisattva' || kneel) {
    R2.push(ellipsoid([0, by + 1.88, -0.01], 0.065, 0.11, 0.06, 10, 5));                       // chignon
    G.push(lathe([[0.1, 0], [0.108, 0.02], [0.115, 0.07], [0.1, 0.075]], 14, (th) => 1 + 0.12 * Math.max(0, Math.cos(th * 3)), 0, by + 1.78, 0.01));   // crown
    // the halo behind the head
    G.push(lathe([[0.2, -0.008], [0.24, -0.008], [0.24, 0.008], [0.2, 0.008]], 24).rotateX(Math.PI / 2).translate(0, by + 1.74, -0.16));
  } else if (king) {
    R2.push(lathe([[0.001, 0.0], [0.13, 0.0], [0.12, 0.08], [0.08, 0.16], [0.02, 0.2], [0.001, 0.26]], 12, null, 0, by + 1.76, 0));   // helmet
    G.push(lathe([[0.14, -0.01], [0.16, 0.0], [0.13, 0.04]], 12, null, 0, by + 1.74, 0));
  } else if (groom) R2.push(lathe([[0.001, 0], [0.11, 0], [0.1, 0.06], [0.04, 0.12], [0.001, 0.13]], 10, null, 0, by + 1.79, 0));    // cap
  const yaw = Math.atan2(dir[0], dir[1]), s = H / 2.4;
  const put = (g) => place(g, x, el.y, z, yaw, s);
  for (const g of R) bag.add(robe, put(g));
  for (const g of R2) bag.add(robe2, put(g));
  for (const g of G) bag.add(skin, put(g));
  if (tri.length) bag.add(skin, put(fromTriangles(tri)));
}

/**
 * An animal mount under a seated bodhisattva { at, y, animal: 'lion' | 'elephant', dir, rider }: the white elephant of
 * Samantabhadra — barrel body, pillar legs, a trunk curling down, broad ears, tusks, a saddle cloth — or the lion of the
 * figure Liang Sicheng read as Guanyin — crouched haunches, a curled mane, the head up, the tail curling; on the back a lotus seat.
 */
function mount(el, { bag }) {
  const [x, z] = el.at, y = el.y, d = el.dir || [-1, 0];
  const big = el.animal === 'elephant';
  const body = big ? 'paint_white' : 'paint_ochre', B = [], C = [], G = [];
  // local frame: +z forward (the head), y up; placed and turned at the end
  if (big) {
    B.push(ellipsoid([0, 1.25, 0], 0.68, 0.62, 1.2, 16, 8));
    for (const [kx, kz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      B.push(lathe([[0.2, 0], [0.21, 0.06], [0.19, 0.5], [0.22, 0.95], [0.001, 1.0]], 12, null, kx * 0.4, 0, kz * 0.72));
      G.push(lathe([[0.215, 0], [0.22, 0.05], [0.2, 0.07]], 12, null, kx * 0.4, 0, kz * 0.72));        // toenail rims
    }
    B.push(ellipsoid([0, 1.55, 1.25], 0.42, 0.46, 0.42, 14, 7));                                     // head
    for (const k of [-1, 1]) B.push(ellipsoid([k * 0.42, 1.55, 1.12], 0.06, 0.42, 0.34, 10, 6));     // ears
    // the trunk, in tapering lengths, curling down and back at the tip
    const tr = [[0, 1.42, 1.58], [0, 1.1, 1.72], [0, 0.75, 1.74], [0, 0.45, 1.66], [0, 0.3, 1.52], [0, 0.34, 1.42]];
    for (let i = 0; i < tr.length - 1; i++) { const r0 = 0.17 - i * 0.025, r1 = 0.17 - (i + 1) * 0.025; B.push(rodG(tr[i], tr[i + 1], r0, r1, 10), ellipsoid(tr[i + 1], r1, r1, r1, 8, 4)); }
    for (const k of [-1, 1]) G.push(rodG([k * 0.18, 1.32, 1.52], [k * 0.26, 1.05, 1.95], 0.06, 0.02, 8));   // tusks
    B.push(rodG([0, 1.3, -1.15], [0, 0.6, -1.3], 0.05, 0.03, 6));                                     // tail
    // the saddle cloth with its fringe, the girth, the harness of bells
    C.push(lathe([[0.001, 0], [0.62, 0], [0.64, 0.04], [0.001, 0.06]], 20).scale(1, 1, 1.25).translate(0, 1.84, -0.05));
    C.push(rodG([-0.66, 1.2, -0.05], [0.66, 1.2, -0.05], 0.04, 0.04, 6).rotateY(0));
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.1 + 0.8 * i / 8); G.push(ellipsoid([Math.cos(a) * 0.5, 1.12 - Math.sin(a) * 0.12, 0.95 + Math.sin(a) * 0.12], 0.05, 0.05, 0.05, 6, 3)); }
  } else {
    // the lion seated on its haunches, the forelegs straight, the chest out
    B.push(ellipsoid([0, 0.75, -0.25], 0.45, 0.5, 0.72, 14, 7));
    B.push(ellipsoid([0, 1.05, 0.35], 0.42, 0.55, 0.45, 14, 7));
    for (const k of [-1, 1]) {
      B.push(rodG([k * 0.24, 0.9, 0.5], [k * 0.26, 0.1, 0.62], 0.13, 0.1, 10), ellipsoid([k * 0.26, 0.08, 0.7], 0.12, 0.08, 0.16, 8, 4));
      B.push(ellipsoid([k * 0.36, 0.45, -0.45], 0.16, 0.4, 0.42, 10, 6), ellipsoid([k * 0.3, 0.08, -0.12], 0.12, 0.08, 0.2, 8, 4));
    }
    B.push(ellipsoid([0, 1.55, 0.62], 0.3, 0.3, 0.3, 12, 6), ellipsoid([0, 1.48, 0.88], 0.16, 0.14, 0.14, 10, 5));   // head, muzzle
    // the mane: rows of curls round the neck and head
    for (const [ry, rr, n] of [[1.75, 0.3, 10], [1.55, 0.38, 12], [1.32, 0.42, 12], [1.12, 0.4, 10]]) for (let i = 0; i < n; i++) {
      const a = Math.PI * (-0.15 + 1.3 * i / (n - 1)) + Math.PI;
      C.push(ellipsoid([Math.cos(a) * rr, ry, 0.5 + Math.sin(a) * rr * 0.7], 0.09, 0.09, 0.08, 8, 4));
    }
    C.push(rodG([0, 0.9, -0.9], [0, 1.3, -1.15], 0.06, 0.05, 6), ellipsoid([0, 1.38, -1.1], 0.13, 0.13, 0.13, 8, 4));   // tail with its tuft
    C.push(lathe([[0.001, 0], [0.5, 0], [0.52, 0.04], [0.001, 0.06]], 18).scale(1, 1, 1.4).translate(0, 1.22, -0.25));    // saddle cloth
  }
  const top = big ? 1.88 : 1.28;
  const yaw = Math.atan2(d[0], d[1]), put = (g) => place(g, x, y, z, yaw, 1);
  for (const g of B) bag.add(body, put(g));
  for (const g of C) bag.add(big ? 'clay_robe' : 'clay_green', put(g));
  for (const g of G) bag.add('clay_gilt', put(g));
  // the rider: a crowned bodhisattva seated on a lotus, a little over half the size of the Buddhas
  buddha({ at: [x, z], y: y + top, h: el.rider || 3.0, dir: d, crown: true, robe: 'clay_green' }, { bag });
}

/** The dhāraṇī pillar: a hexagonal stone shaft on a lotus base, with a canopy and pearl. */
function dharaniPillar(el, { bag, col }) {
  const [x, z] = el.at, y = el.y;
  bag.add('limestone', lathe([[0.75, 0], [0.75, 0.35], [0.55, 0.45], [0.62, 0.75], [0.3, 0.85], [0.3, 2.35], [0.6, 2.5], [0.55, 2.7], [0.28, 2.8], [0.2, 3.0], [0.001, 3.24]], 6, null, x, y, z));
  col.circle(x, z, 0.75, y, y + 3.24);
}

/** A small hexagonal pagoda of two storeys with a lotus finial (the Zushi pagoda). */
function pagoda(el, { bag, col }) {
  const [x, z] = el.at, y = el.y;
  bag.add('paint_white', lathe([[1.7, 0], [1.7, 0.6], [1.5, 0.7], [1.5, 2.6], [1.9, 2.8], [1.9, 3.0], [1.25, 3.3], [1.15, 4.2], [1.45, 4.35], [1.45, 4.5], [0.9, 4.8], [0.6, 5.2], [0.35, 5.6], [0.001, 6.1]], 6, null, x, y, z));
  bag.add('opening', box(x - 0.5, y + 0.7, z - 1.52, x + 0.5, y + 2.2, z - 1.49));
  col.circle(x, z, 1.7, y, y + 6);
}

export { hipRoof, gableRoofC, column as chineseColumn };

registerStyle('chinese', {
  column,
  trim: () => {},
  opening: () => {},
  elements: { ...byzantineElements, bracket_set: bracketSet, tang_bracket_set: tangBracket, tang_fang: tangFang, hip_roof: hipRoof, gable_roof_c: gableRoofC },
  objects: { buddha, figure, statue, mount, dharani_pillar: dharaniPillar, pagoda },
});
