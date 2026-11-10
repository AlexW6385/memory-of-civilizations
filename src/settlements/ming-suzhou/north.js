// Ming Suzhou — north of the garden: the pagoda of the Bao'en (North) Temple and its court, and a
// stretch of the city wall with its gates, water gates, bastions and moat
// (docs/settlements/ming-suzhou.md §12). Plans returned to town.js.
//
// The pieces are built on the Jiangnan vocabulary of the ming style, with the octagonal pagoda of the
// song style (brick core, timber galleries and eaves at every storey, bracket sets, wind bells,
// the gilt finial), under their own style name `suzhou-north`.

import { STYLES, registerStyle } from '../../core/build.js';
import { box, fromTriangles, lathe } from '../../core/geom.js';
import '../../styles/ming/index.js';
import '../../styles/song/index.js';
import { beamTris, rectRoof } from '../../styles/ming/index.js';
import { LEVEL, RADIUS, TEMPLE_COURT, NORTH_KEEP as KEEP } from './layout.js';

// ── where things stand (m, +x east, +z south; the north is −z) ──────────────
/** The pagoda's centre: north of the garden, in the temple's court. */
export const PAGODA_AT = [-40, -145];
/** The temple court (x0, z0, x1, z1). */
export const COURT = TEMPLE_COURT;
/** The city wall's line (its middle), where it runs from x0 to x1, and its base and top widths and height. */
export const WALL = { z: -168, x0: -118, x1: 118, base: 9.4, top: 7.0, H: 9.0 };
/**
 * Rectangles [x0, z0, x1, z1] this part builds on, where nothing else may stand or grow (houses are
 * not placed there; the planting should keep out of them): the temple court, the wall with its bastions
 * and the moat, the road to the gate.
 */
export const NORTH_KEEP = KEEP;

const PI = Math.PI;
const ngon = (cx, cz, r, n = 8, rot = PI / 8) => Array.from({ length: n }, (_, k) => [cx + Math.cos(rot + k / n * PI * 2) * r, cz + Math.sin(rot + k / n * PI * 2) * r]);

/** A flat-faced frustum from the polygon `bot` at y0 to `top` at y1, capped. */
function prism(bag, mat, bot, top, y0, y1) {
  const n = bot.length, t = [], P = (q, y) => [q[0], y, q[1]];
  for (let k = 0; k < n; k++) { const a = P(bot[k], y0), b = P(bot[(k + 1) % n], y0), c = P(top[(k + 1) % n], y1), d = P(top[k], y1); t.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let k = 1; k < n - 1; k++) { t.push(...P(top[0], y1), ...P(top[k], y1), ...P(top[k + 1], y1), ...P(bot[0], y0), ...P(bot[k + 1], y0), ...P(bot[k], y0)); }
  // each triangle turned to face away from the middle of the solid
  const cx = bot.reduce((s, p) => s + p[0], 0) / n, cz = bot.reduce((s, p) => s + p[1], 0) / n, cy = (y0 + y1) / 2;
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (t[i] + t[i + 3] + t[i + 6]) / 3 - cx, my = (t[i + 1] + t[i + 4] + t[i + 7]) / 3 - cy, mz = (t[i + 2] + t[i + 5] + t[i + 8]) / 3 - cz;
    if (nx * mx + ny * my + nz * mz < 0) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
  }
  bag.add(mat, fromTriangles(t));
}

/** A quad a b c d turned to face along n (flipped when its own normal points the other way). */
function qd(out, a, b, c, d, n) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const dot = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
  if (dot >= 0) out.push(...a, ...b, ...c, ...a, ...c, ...d); else out.push(...a, ...c, ...b, ...a, ...d, ...c);
}



/** A cheap rafter from a to b: underside, two sides and the end face (its top is buried in the roof above); w is the half-width, h the depth above a/b's height. */
function rafterTris(out, a, b, w, h) {
  const dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l * w, nz = dx / l * w;
  const L0 = [a[0] - nx, a[1], a[2] - nz], R0 = [a[0] + nx, a[1], a[2] + nz], L1 = [b[0] - nx, b[1], b[2] - nz], R1 = [b[0] + nx, b[1], b[2] + nz];
  const T = (q) => [q[0], q[1] + h, q[2]];
  qd(out, L0, R0, R1, L1, [0, -1, 0]); qd(out, L0, L1, T(L1), T(L0), [-nx, 0, -nz]); qd(out, R0, R1, T(R1), T(R0), [nx, 0, nz]); qd(out, L1, R1, T(R1), T(L1), [dx, 0, dz]);
}

// ── a deep timber eave: tiled upper surface with rolls and hip ridges, a drip lip, a fascia board, a
// thick soffit with the rafters' ends under it, the corners swept up, a wind bell at each corner ──
/**
 * An octagonal eave from the inner ring (r0 at y0, hidden under the storey above) out and down to the
 * outer ring (r1 at y1), the corners swept up by `sweep`; `T` thick. `pw` shapes the slope (>1: flat
 * near the wall, steeper outward; <1: steep at the top, flat at the edge).
 */
function deepEave(bag, cx, cz, r0, y0, r1, y1, sweep, { T = 0.36, pw = 1.4, bells = true, hips = true, rolls = 3, rafters = 7, under = 'lacquer_red', top = 'tile_dark' } = {}) {
  const I = ngon(cx, cz, r0), O = ngon(cx, cz, r1), M = 6, U = 4;
  const f = (u) => Math.pow(u, pw);
  const hh = (t) => y1 + sweep * Math.abs(2 * t - 1) ** 2.2;
  const S = (k, t, u, dy = 0) => {
    const a = I[k], b = I[(k + 1) % 8], c = O[k], d = O[(k + 1) % 8];
    const ix = a[0] + (b[0] - a[0]) * t, iz = a[1] + (b[1] - a[1]) * t, ox = c[0] + (d[0] - c[0]) * t, oz = c[1] + (d[1] - c[1]) * t;
    return [ix + (ox - ix) * u, y0 + (hh(t) - y0) * f(u) + dy, iz + (oz - iz) * u];
  };
  const up = [], dn = [], fas = [], lip = [], roll = [], raf = [], hip = [];
  for (let k = 0; k < 8; k++) {
    const am = Math.PI / 8 + (k + 0.5) / 8 * Math.PI * 2, nrm = [Math.cos(am), 0, Math.sin(am)];
    for (let j = 0; j < M; j++) {
      const t0 = j / M, t1 = (j + 1) / M;
      for (let i = 0; i < U; i++) {
        const u0 = i / U, u1 = (i + 1) / U;
        qd(up, S(k, t0, u0), S(k, t0, u1), S(k, t1, u1), S(k, t1, u0), [0, 1, 0]);
        qd(dn, S(k, t0, u0, -T), S(k, t0, u1, -T), S(k, t1, u1, -T), S(k, t1, u0, -T), [0, -1, 0]);
      }
      qd(fas, S(k, t0, 1), S(k, t1, 1), S(k, t1, 1, -T), S(k, t0, 1, -T), nrm);
      beamTris(lip, S(k, t0, 1, -0.02), S(k, t1, 1, -0.02), 0.13, 0.2, true);
    }
    // the rolls of tiles (radial ridges) and the rafters under the soffit
    for (let q = 1; q < rolls; q++) {
      const t = q / rolls;
      for (let i = 0; i < U; i += 2) beamTris(roll, S(k, t, i / U, -0.03), S(k, t, (i + 2) / U, -0.03), 0.04, 0.08, true);
    }
    for (let q = 0; q < rafters; q++) {
      const t = (q + 0.5) / rafters;
      const a = S(k, t, 0.4, -T - 0.13), b = S(k, t, 1, -T - 0.13);
      b[0] += nrm[0] * 0.2; b[2] += nrm[2] * 0.2;
      rafterTris(raf, a, b, 0.045, 0.15);
    }
    if (hips) for (let i = 1; i < U; i++) beamTris(hip, S(k, 0, i / U, -0.06), S(k, 0, (i + 1) / U, -0.06), 0.1, 0.24, true);
  }
  bag.add(top, fromTriangles(up)); bag.add(under, fromTriangles(dn)); bag.add(under, fromTriangles(fas));
  bag.add(top, fromTriangles(lip)); bag.add('tile_grey', fromTriangles(roll)); bag.add('timber_red', fromTriangles(raf)); bag.add(top, fromTriangles(hip));
  for (let k = 0; k < 8; k++) {
    const e = S(k, 0, 1, 0.1);
    bag.add(top, lathe([[0.0001, 0], [0.2, 0], [0.16, 0.14], [0.08, 0.34], [0.0001, 0.5]], 8, null, e[0], e[1], e[2]));
    if (!bells) continue;
    // the wind bell under the corner: hook, bell, clapper and wind plate
    const rr = r1 - 0.3, u = (rr - r0) / (r1 - r0), c = S(k, 0, u, -T), x = c[0], z = c[2], yy = c[1];
    bag.add('iron', lathe([[0.025, -0.3], [0.025, 0.04]], 5, null, x, yy, z));
    bag.add('iron', lathe([[0.001, -0.3], [0.05, -0.3], [0.1, -0.36], [0.15, -0.6], [0.17, -0.7], [0.16, -0.71], [0.001, -0.66]], 10, null, x, yy, z));
    bag.add('iron', lathe([[0.012, -0.95], [0.012, -0.62]], 4, null, x, yy, z));
    bag.add('iron', box(x - 0.09, yy - 1.12, z - 0.012, x + 0.09, yy - 0.95, z + 0.012));
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// The pagoda of the Bao'en Temple
// ═════════════════════════════════════════════════════════════════════════════
/**
 * beisi_pagoda { c, y }: the song style's octagonal brick-and-timber pagoda (nine storeys, doors on
 * alternate faces, a timber gallery with railing and a bracketed double eave with turned-up corners
 * at every storey, a crowning roof, the gilt finial), here with the temple's stone terraces under it:
 * three octagonal stages of dressed granite, steps up on the south to each, a balustrade round the
 * middle stage.
 */
function beisiPagoda(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y0 = el.y ?? 0;
  const A = 15, B = 12.4, C = 11.0, hA = 0.6, hB = 1.3, hC = 2.2;
  prism(bag, 'granite_block', ngon(cx, cz, A + 0.4), ngon(cx, cz, A), y0, y0 + hA);
  prism(bag, 'granite_block', ngon(cx, cz, B + 0.4), ngon(cx, cz, B), y0 + hA, y0 + hB);
  prism(bag, 'granite_block', ngon(cx, cz, C + 0.6), ngon(cx, cz, C), y0 + hB, y0 + hC);
  // the coping of the lower stages: a slab overhanging a little
  prism(bag, 'granite_grey', ngon(cx, cz, A + 0.15), ngon(cx, cz, A + 0.15), y0 + hA - 0.1, y0 + hA);
  prism(bag, 'granite_grey', ngon(cx, cz, B + 0.15), ngon(cx, cz, B + 0.15), y0 + hB - 0.1, y0 + hB);
  col.circle(cx, cz, C * Math.cos(PI / 8) - 0.5, y0, y0 + hC);
  // the steps on the south (+z): to the first stage, the second, the base
  const f = (r) => r * Math.cos(PI / 8);
  const stairs = [[f(A) + 0.4, y0, y0 + hA, 7, 1.6], [f(B) + 0.4, y0 + hA, y0 + hB, 6, 1.6], [f(C) + 0.6, y0 + hB, y0 + hC, 5, 2.0]];
  for (const [d, a, b, w, run] of stairs) {
    const rect = [cx - w / 2, cz + d - run, cx + w / 2, cz + d];
    const n = Math.max(1, Math.round((b - a) / 0.18));
    for (let i = 0; i < n; i++) {
      const yt = a + (b - a) * (i + 1) / n, z1 = cz + d - run * i / n;
      bag.add('granite_block', box(rect[0], a - 0.02, cz + d - run, rect[2], yt, z1));
    }
    col.ramp(rect, a, b, 'n');
    for (const s of [-1, 1]) bag.add('granite_grey', box(s > 0 ? rect[2] : rect[0] - 0.22, a - 0.02, rect[1], s > 0 ? rect[2] + 0.22 : rect[0], b + 0.35, rect[3]));   // the cheek walls
  }
  // the balustrade round the middle stage: posts at the corners and every ~2.4 m, rails between, the
  // south side open where the steps rise
  const R = ngon(cx, cz, B - 0.35), yb = y0 + hB;
  const posts = [], rails = [], slabs = [];
  for (let k = 0; k < 8; k++) {
    const a = R[k], b = R[(k + 1) % 8], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 2.4));
    const open = Math.abs((a[0] + b[0]) / 2 - cx) < 3.5 && (a[1] + b[1]) / 2 > cz;
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      if (open && Math.abs(x - cx) < 3.3) continue;
      posts.push([x, z]);
    }
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, x0 = a[0] + (b[0] - a[0]) * t0, z0 = a[1] + (b[1] - a[1]) * t0, x1 = a[0] + (b[0] - a[0]) * t1, z1 = a[1] + (b[1] - a[1]) * t1;
      if (open && (Math.abs(x0 - cx) < 3.3 || Math.abs(x1 - cx) < 3.3)) continue;
      const ux = (x1 - x0) / (L / n), uz = (z1 - z0) / (L / n), g = 0.14;
      beamTris(rails, [x0 + ux * g, yb + 0.88, z0 + uz * g], [x1 - ux * g, yb + 0.88, z1 - uz * g], 0.09, 0.14);          // the top rail
      beamTris(slabs, [x0 + ux * g, yb + 0.12, z0 + uz * g], [x1 - ux * g, yb + 0.12, z1 - uz * g], 0.06, 0.18);          // the foot
      beamTris(slabs, [x0 + ux * g, yb + 0.3, z0 + uz * g], [x1 - ux * g, yb + 0.3, z1 - uz * g], 0.045, 0.58);           // the panel between
      col.segment([x0, z0], [x1, z1], 0.2, yb, yb + 1);
    }
  }
  for (const [x, z] of posts) {
    bag.add('granite_grey', box(x - 0.1, yb, z - 0.1, x + 0.1, yb + 0.95, z + 0.1));
    bag.add('granite_grey', lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.1], [0.07, 0.16], [0.001, 0.2]], 8, null, x, yb + 0.95, z));
  }
  bag.add('granite_grey', fromTriangles(rails)); bag.add('granite_block', fromTriangles(slabs));
  // the pagoda itself, the brick body and the timber of its galleries
  const tiers = [];
  for (let i = 0; i < 9; i++) tiers.push({ r: 6.2 - 0.42 * i, h: 9.2 - 0.5 * i });
  // (the song style's own eaves are thin plates: they are left out here, their tile and soffit
  // materials dropped, and replaced by deep eaves of our own)
  const fb = Object.create(bag);
  fb.add = (m, g) => { if (m !== 'tile_dark' && m !== 'lacquer_red') bag.add(m, g); };
  STYLES.song.elements.pagoda_oct({ c: el.c, y: y0 + hC + 0.34 - 0.05, base: { r: 0.3, h: 0.05 }, tiers, spire: 5.6, bells: null, core: 'brick_grey', frame: 'timber_red', eave: 'tile_dark' }, { ...ctx, bag: fb });
  let y = y0 + hC + 0.34;
  tiers.forEach((t, i) => {
    const g = t.r + 2.4, top = y + t.h;
    if (i === tiers.length - 1) deepEave(bag, cx, cz, t.r + 0.6, top + 1.1, g + 1.5, top - 0.2, 0.8, { T: 0.4, pw: 0.8 });
    else deepEave(bag, cx, cz, g - 0.9, top - 0.3, g + 1.6, top - 1.5, 0.9);
    y = top;
  });
  // the crowning roof: a steep octagonal pyramid, concave, with hips
  const rt = tiers[tiers.length - 1].r;
  deepEave(bag, cx, cz, 0.6, y + 4.2, rt + 3.6, y + 0.2, 0.8, { T: 0.5, pw: 0.65, rafters: 12, rolls: 6 });
  void LEVEL;
}


// ═════════════════════════════════════════════════════════════════════════════
// Halls with a deep xieshan roof
// ═════════════════════════════════════════════════════════════════════════════
/**
 * suzhou_hall: ming_hall (walls, posts, platform) under a roof of our own: the ming roof with the
 * corner curve spread over a longer run (the stock roof flicks its eave corner up within 2.7 m, a long
 * flat slab ending in a spike), a drip lip and a fascia board along the whole edge, rafters under the
 * soffit and a thick hip rafter at each corner. Same parameters as ming_hall.
 */
function suzhouHall(el, ctx) {
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H ?? 4.2;
  ctx.style.elements.ming_hall({ ...el, roof: 'none' }, ctx);
  const along = (x1 - x0) >= (z1 - z0), Lx = x1 - x0, Lz = z1 - z0, o = el.eave ?? 1.25;
  // the ceiling: a flat board would read as a dark slab, so the tie beams and the purlins show under it (halls of 5 m or more)
  if (H >= 5) {
    const nb = Math.max(1, Math.round((along ? Lx : Lz) / 3.6)), nd = Math.max(1, Math.round((along ? Lz : Lx) / 3.4)), bm = [], yc = y + H - 0.2;
    const [La, Lb, a0, b0] = along ? [Lx, Lz, x0, z0] : [Lz, Lx, z0, x0];
    const P = (u, v, h) => (along ? [a0 + u, h, b0 + v] : [b0 + v, h, a0 + u]);
    for (let i = 0; i <= nb; i++) beamTris(bm, P(La * i / nb, 0, yc - 0.34), P(La * i / nb, Lb, yc - 0.34), 0.13, 0.34, true);
    for (let j = 0; j <= nd; j++) beamTris(bm, P(0, Lb * j / nd, yc - 0.18), P(La, Lb * j / nd, yc - 0.18), 0.09, 0.18, true);
    bag.add('lacquer_chestnut', fromTriangles(bm));
  }
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, A = (along ? Lx : Lz) / 2 + o, B = (along ? Lz : Lx) / 2 + o;
  const rise = el.rise ?? B * 0.62, sw = el.sweep ?? 1.2, gAt = el.gableAt ?? 0.8, ry = y + H - 0.25, p = 1.7;
  rectRoof({ c: [cx, cz], A, B, y: ry, rise, kind: 'xieshan', sweep: sw, gableAt: gAt, alongZ: !along, fish: true }, bag);
  // the roof's height at (x, z) (local: x along the ridge), as rectRoof computes it
  const hAt = (x, z, off = 0) => {
    const ax = Math.abs(x), az = Math.abs(z), ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = Math.max(0, (A - ax) / B); if (te > gAt) te = 9;
    const t = Math.min(ts, te), corner = Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    return ry + rise * Math.pow(t, p) + sw * corner * corner + off;
  };
  const W = (x, z, off = 0) => { const h = hAt(x, z, off); return along ? [cx + x, h, cz + z] : [cx - z, h, cz + x]; };
  const fas = [], lip = [], raf = [], hip = [];
  const pts = (len, n) => Array.from({ length: n + 1 }, (_, i) => -len + 2 * len * i / n);
  const nA = Math.max(10, Math.round(A * 1.6)), nB = Math.max(8, Math.round(B * 1.6));
  const loop = [];
  for (const x of pts(A, nA)) loop.push([x, -B]);
  for (const z of pts(B, nB).slice(1)) loop.push([A, z]);
  for (const x of pts(A, nA).reverse().slice(1)) loop.push([x, B]);
  for (const z of pts(B, nB).reverse().slice(1, -1)) loop.push([-A, z]);
  for (let k = 0; k < loop.length; k++) {
    const a = loop[k], b = loop[(k + 1) % loop.length];
    const pa = W(a[0], a[1], -0.2), pb = W(b[0], b[1], -0.2);
    beamTris(fas, [pa[0], pa[1] - 0.5, pa[2]], [pb[0], pb[1] - 0.5, pb[2]], 0.07, 0.5, true);     // the fascia board, hung under the edge
    beamTris(lip, W(a[0], a[1], -0.03), W(b[0], b[1], -0.03), 0.15, 0.2, true);                    // the drip tiles
  }
  // rafters under the soffit: every 0.55 m, front and back (rafters run in z) and on the hip ends (in x)
  const rafter = (a, b, n) => {
    for (let i = 0; i < n; i++) {
      const u0 = i / n, u1 = (i + 1) / n, P0 = [a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0], P1 = [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1];
      const q0 = W(P0[0], P0[1], -0.14 - 0.16), q1 = W(P1[0], P1[1], -0.14 - 0.16);
      if (i === n - 1) { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); const e = along ? [dx / l * 0.2, dz / l * 0.2] : [-dz / l * 0.2, dx / l * 0.2]; q1[0] += e[0]; q1[2] += e[1]; }
      rafterTris(raf, q0, q1, 0.05, 0.18);
    }
  };
  const wallIn = o - 0.1, zf = B - wallIn, xf = A - wallIn;
  for (let x = -A + 0.7; x < A - 0.6; x += 1.0) for (const s of [-1, 1]) rafter([x, s * zf], [x, s * B], 2);
  for (let z = -B + 0.9; z < B - 0.8; z += 1.0) for (const s of [-1, 1]) rafter([s * xf, z], [s * A, z], 2);
  // the hip rafters: thick, from the wall's corner out to the tip, following the soffit
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const n = 5;
    for (let i = 0; i < n; i++) {
      const a = [sx * (A - wallIn + wallIn * i / n), sz * (B - wallIn + wallIn * i / n)], b = [sx * (A - wallIn + wallIn * (i + 1) / n), sz * (B - wallIn + wallIn * (i + 1) / n)];
      beamTris(hip, W(a[0], a[1], -0.14 - 0.34), W(b[0], b[1], -0.14 - 0.34), 0.11, 0.36);
    }
    const t = W(sx * A, sz * B, 0.1);
    const k = Math.min(1, B / 6);
    bag.add('tile_dark', lathe([[0.0001, 0], [0.22 * k, 0], [0.17 * k, 0.16 * k], [0.09 * k, 0.4 * k], [0.0001, 0.6 * k]], 8, null, t[0], t[1], t[2]));
  }
  bag.add('lacquer_chestnut', fromTriangles(fas)); bag.add('tile_dark', fromTriangles(lip));
  bag.add('timber_red', fromTriangles(raf)); bag.add('lacquer_chestnut', fromTriangles(hip));
}

// ═════════════════════════════════════════════════════════════════════════════
// The city wall
// ═════════════════════════════════════════════════════════════════════════════
/**
 * north_wall: a stretch of the city wall running east–west { z (its middle), x0, x1, base, top, H,
 * gates: [{ x, w, kind: 'land' | 'water', tower (the gate hall's width) }],
 * bastions: [{ x, w, d, turret }], ramps: [x] }.
 * Brick over a granite plinth, battered on both faces; granite string courses; an outer parapet of
 * merlons with their crenels, tiled caps and loopholes and a low inner parapet on the wall-walk;
 * gates with a round arch in a ring of voussoirs, the door leaves swung back (land gates) or an iron
 * grille raised in the arch (water gates); bastions projecting from the outer face; stair-ramps up
 * the inner face; a gate hall over the north gate.
 */
function northWall(el, ctx) {
  const { bag, col } = ctx;
  const z = el.z, B = el.base, T = el.top, H = el.H, bat = (B - T) / 2;
  const zn = z - B / 2, zp = z + B / 2, bottom = -3;
  const gates = [...(el.gates || [])].sort((a, b) => a.x - b.x);
  const zf = (y) => zn + bat * y / H, zb = (y) => zp - bat * y / H;       // the outer and the inner face at height y
  const body = [], plinth = [], stone = [];
  // a battered slab from xa to xb between two heights, its faces `off` proud of the wall's
  const slab = (out, xa, xb, ya, yb, off = 0) => {
    const ins = bat * (yb - ya) / H, x0 = xa, x1 = xb, z0 = zf(ya) - off, z1 = zb(ya) + off;
    const b = [[x0, ya, z0], [x1, ya, z0], [x1, ya, z1], [x0, ya, z1]], t = [[x0, yb, z0 + ins], [x1, yb, z0 + ins], [x1, yb, z1 - ins], [x0, yb, z1 - ins]];
    qd(out, t[0], t[3], t[2], t[1], [0, 1, 0]);
    qd(out, b[0], t[0], t[1], b[1], [0, 0.3, -1]); qd(out, b[2], t[2], t[3], b[3], [0, 0.3, 1]);
    qd(out, b[1], t[1], t[2], b[2], [1, 0, 0]); qd(out, b[3], t[3], t[0], b[0], [-1, 0, 0]);
  };
  // the pieces of wall between the gates
  const pieces = [];
  let xs = el.x0;
  for (const g of gates) { pieces.push([xs, g.x - g.w / 2]); xs = g.x + g.w / 2; }
  pieces.push([xs, el.x1]);
  const sprY = (g) => (g.kind === 'water' ? 1.3 : 3.0);
  for (const [xa, xb] of pieces) {
    slab(body, xa, xb, bottom, H, 0);
    slab(plinth, xa, xb, 0, 1.7, 0.12); slab(stone, xa, xb, 1.7, 1.95, 0.2);                  // the plinth and the course on it
    slab(stone, xa, xb, 5.3, 5.5, 0.09); slab(stone, xa, xb, H - 0.55, H - 0.2, 0.2);          // the string courses
    col.floor([xa, zf(H), xb, zb(H)], H, 'wall');
    col.rect([xa, zn, xb, zp], -3, H - 0.05);
  }
  // the gates: the wall's mass over each opening in slices following the arch, a ring of voussoirs
  // on both faces, the door leaves or the grille
  for (const g of gates) {
    const R = g.w / 2, sy = sprY(g), N = 24, low = (x) => sy + Math.sqrt(Math.max(0, R * R - (x - g.x) ** 2));
    const P = (x, y, s) => [x, y, s < 0 ? zf(y) : zb(y)];
    for (let i = 0; i < N; i++) {
      const xa = g.x - R + 2 * R * i / N, xb = g.x - R + 2 * R * (i + 1) / N, ya = low(xa), yb = low(xb), xm = (xa + xb) / 2, ym = (ya + yb) / 2;
      qd(body, P(xa, ya, -1), P(xa, H, -1), P(xb, H, -1), P(xb, yb, -1), [0, 0, -1]);
      qd(body, P(xa, ya, 1), P(xa, H, 1), P(xb, H, 1), P(xb, yb, 1), [0, 0, 1]);
      qd(body, [xa, H, zf(H)], [xa, H, zb(H)], [xb, H, zb(H)], [xb, H, zf(H)], [0, 1, 0]);
      qd(body, P(xa, ya, -1), P(xb, yb, -1), P(xb, yb, 1), P(xa, ya, 1), [g.x - xm, sy - ym, 0]);
    }
    col.rect([g.x - R, zn, g.x + R, zp], sy + 0.2, H - 0.05);
    // the voussoir ring: alternate stones a little deeper; the joints' sides show where one stands proud
    const M = 18, o = 0.13, ri = R - 0.03;
    for (const side of [-1, 1]) {
      const zz = (y) => (side < 0 ? zf(y) - o : zb(y) + o), zw = (y) => (side < 0 ? zf(y) : zb(y));
      const pt = (t, r, fz) => { const y = sy + Math.sin(t) * r; return [g.x - Math.cos(t) * r, y, fz(y)]; };
      for (let i = 0; i < M; i++) {
        const t0 = PI * i / M, t1 = PI * (i + 1) / M, tm = (t0 + t1) / 2, ro = R + (i % 2 ? 0.52 : 0.68);
        qd(stone, pt(t0, ri, zz), pt(t0, ro, zz), pt(t1, ro, zz), pt(t1, ri, zz), [0, 0, side]);
        qd(stone, pt(t0, ro, zw), pt(t0, ro, zz), pt(t1, ro, zz), pt(t1, ro, zw), [-Math.cos(tm), Math.sin(tm), 0]);
        qd(stone, pt(t0, ri, zw), pt(t0, ri, zz), pt(t1, ri, zz), pt(t1, ri, zw), [Math.cos(tm), -Math.sin(tm), 0]);
        if (i % 2 === 0) {
          if (i > 0) qd(stone, pt(t0, R + 0.52, zw), pt(t0, R + 0.52, zz), pt(t0, ro, zz), pt(t0, ro, zw), [-Math.sin(t0), -Math.cos(t0), 0]);
          if (i < M - 1) qd(stone, pt(t1, R + 0.52, zw), pt(t1, R + 0.52, zz), pt(t1, ro, zz), pt(t1, ro, zw), [Math.sin(t1), Math.cos(t1), 0]);
        }
      }
      // the ring's feet, on the springing
      for (const [t, nx] of [[0, 0], [PI, 0]]) qd(stone, pt(t, ri, zw), pt(t, ri, zz), pt(t, R + 0.68, zz), pt(t, R + 0.68, zw), [nx, -1, 0]);
    }
    if (g.kind === 'water') {
      // the grille raised into the arch: iron bars from the crown down to a rail
      const zg = zf(sy + R) + 0.9, rail = sy + R - 1.5;
      for (let k = 1; k < 14; k++) {
        const x = g.x - R + 2 * R * k / 14, top = low(x) - 0.02;
        if (top > rail + 0.1) bag.add('iron', box(x - 0.025, rail, zg - 0.025, x + 0.025, top, zg + 0.025));
      }
      bag.add('iron', box(g.x - R + 0.1, rail - 0.05, zg - 0.04, g.x + R - 0.1, rail + 0.05, zg + 0.04));
    } else {
      // the door leaves swung back against the passage walls at the outer end, banded and studded with iron
      for (const sx of [-1, 1]) {
        const xw = g.x + sx * (R - 0.02), z0 = zf(0) + 1.1, z1 = z0 + R * 0.98, hh = sy - 0.25, xi = xw - sx * 0.14;
        bag.add('timber', box(Math.min(xw, xi), 0.04, z0, Math.max(xw, xi), hh, z1));
        for (const yy of [0.5, 1.4, 2.3]) bag.add('iron', box(Math.min(xi, xi - sx * 0.03), yy, z0, Math.max(xi, xi - sx * 0.03), yy + 0.12, z1));
        for (let k = 0; k < 4; k++) for (const yy of [0.9, 1.9]) { const zq = z0 + 0.2 + k * (z1 - z0 - 0.4) / 3; bag.add('iron', box(Math.min(xi, xi - sx * 0.06), yy - 0.04, zq - 0.04, Math.max(xi, xi - sx * 0.06), yy + 0.04, zq + 0.04)); }
      }
    }
  }
  bag.add('brick_grey', fromTriangles(body)); bag.add('granite_block', fromTriangles(plinth)); bag.add('granite_grey', fromTriangles(stone));
  // ── the parapets: outside a low wall with merlons (1.35 m wide every 2.25 m, tiled caps, a loophole in each),
  // inside a low wall only; broken by the gate hall, the bastions (their own parapets) and the ramps' heads
  const ramps = (el.ramps || []).map((rx) => [rx - 1.7, rx + 1.7]);
  const bastions = el.bastions || [], towers = gates.filter((g) => g.tower).map((g) => [g.x - g.tower / 2 - 1.2, g.x + g.tower / 2 + 1.2]);
  const cut = (iv, list) => { for (const [a, b] of list) iv = iv.flatMap(([p, q]) => (b <= p || a >= q ? [[p, q]] : [[p, a], [b, q]].filter(([u, v]) => v - u > 0.05))); return iv; };
  const parapet = (xa, xb, zo, th, dir, high) => {
    const za = Math.min(zo, zo + th * dir), zq = Math.max(zo, zo + th * dir), yp = H;
    bag.add('brick_grey', box(xa, yp, za, xb, yp + 0.95, zq));
    bag.add('granite_grey', box(xa - 0.02, yp + 0.95, za - 0.06, xb + 0.02, yp + 1.0, zq + 0.06));
    if (high) for (let x = xa + 0.4; x + 1.35 < xb + 0.05; x += 2.25) {
      bag.add('brick_grey', box(x, yp + 1.0, za, x + 1.35, yp + 1.95, zq));
      bag.add('tile_dark', box(x - 0.06, yp + 1.95, za - 0.08, x + 1.41, yp + 2.07, zq + 0.08));
      bag.add('lacquer_black', box(x + 0.6, yp + 1.28, za - 0.015, x + 0.75, yp + 1.7, za + 0.01));
    }
    col.segment([xa, (za + zq) / 2], [xb, (za + zq) / 2], th, yp, yp + (high ? 2 : 1));
  };
  const spans = [...pieces, ...gates.filter((g) => !g.tower).map((g) => [g.x - g.w / 2, g.x + g.w / 2])];
  for (const [pa, pb] of spans) {
    for (const [xa, xb] of cut([[pa, pb]], [...towers, ...bastions.map((q) => [q.x - q.w / 2, q.x + q.w / 2])])) parapet(xa, xb, zf(H), 0.55, 1, true);
    for (const [xa, xb] of cut([[pa, pb]], [...towers, ...ramps])) parapet(xa, xb, zb(H), 0.42, -1, false);
  }
  // ── the bastions
  for (const b of bastions) {
    const xa = b.x - b.w / 2, xb = b.x + b.w / 2, zo = zn - b.d, zi = zn + 2.2, hb = H - 0.03, ib = 0.9;
    const lean = (y) => ib * (y - bottom) / (hb - bottom);
    // a frustum, the outer and side faces leaning in; the inner side stands buried in the wall
    const fr = (x0, x1, za, y0, y1, mat) => {
      const l0 = lean(y0), l1 = lean(y1), o = [];
      const bb = [[x0 + l0, y0, za + l0], [x1 - l0, y0, za + l0], [x1 - l0, y0, zi], [x0 + l0, y0, zi]], tt = [[x0 + l1, y1, za + l1], [x1 - l1, y1, za + l1], [x1 - l1, y1, zi], [x0 + l1, y1, zi]];
      qd(o, tt[0], tt[3], tt[2], tt[1], [0, 1, 0]);
      qd(o, bb[0], tt[0], tt[1], bb[1], [0, 0.2, -1]); qd(o, bb[1], tt[1], tt[2], bb[2], [1, 0.2, 0]); qd(o, bb[3], tt[3], tt[0], bb[0], [-1, 0.2, 0]);
      bag.add(mat, fromTriangles(o));
    };
    const sh = (e) => (y) => e;  void sh;
    fr(xa, xb, zo, bottom, hb, 'brick_grey');
    fr(xa - 0.12, xb + 0.12, zo - 0.12, 0, 1.7, 'granite_block');
    fr(xa - 0.2, xb + 0.2, zo - 0.2, 1.7, 1.95, 'granite_grey');
    fr(xa - 0.2, xb + 0.2, zo - 0.2, hb - 0.55, hb - 0.2, 'granite_grey');
    const tx0 = xa + lean(hb), tx1 = xb - lean(hb), tz0 = zo + lean(hb), yy = hb;
    col.floor([tx0, tz0, tx1, zi], hb, 'wall'); col.rect([xa, zo, xb, zi], -3, hb - 0.05);
    bag.add('brick_grey', box(tx0, yy, tz0, tx1, yy + 0.95, tz0 + 0.55));
    bag.add('brick_grey', box(tx0, yy, tz0 + 0.55, tx0 + 0.45, yy + 0.95, zi)); bag.add('brick_grey', box(tx1 - 0.45, yy, tz0 + 0.55, tx1, yy + 0.95, zi));
    bag.add('granite_grey', box(tx0 - 0.02, yy + 0.95, tz0 - 0.06, tx1 + 0.02, yy + 1.0, tz0 + 0.61));
    for (let x = tx0 + 0.45; x + 1.35 < tx1; x += 2.25) {
      bag.add('brick_grey', box(x, yy + 1.0, tz0, x + 1.35, yy + 1.95, tz0 + 0.55)); bag.add('tile_dark', box(x - 0.06, yy + 1.95, tz0 - 0.08, x + 1.41, yy + 2.07, tz0 + 0.63));
      bag.add('lacquer_black', box(x + 0.6, yy + 1.28, tz0 - 0.015, x + 0.75, yy + 1.7, tz0 + 0.01));
    }
    col.segment([tx0, tz0 + 0.27], [tx1, tz0 + 0.27], 0.55, yy, yy + 2);
    col.segment([tx0 + 0.22, tz0], [tx0 + 0.22, zi], 0.45, yy, yy + 1); col.segment([tx1 - 0.22, tz0], [tx1 - 0.22, zi], 0.45, yy, yy + 1);
    if (b.turret) ctx.style.elements.suzhou_hall({ rect: [b.x - 3.0, tz0 + 1.6, b.x + 3.0, tz0 + 6.2], y: yy + 0.3, H: 3.7, front: 'n', four: false, roof: 'xieshan', plat: 0.3, eave: 1.3 }, ctx);
  }
  // ── the stair-ramps up the inner face (mading): treads of granite between two parapet walls that
  // rise with the slope, a landing at the top flush with the wall-walk
  for (const rx of el.ramps || []) {
    const w = 3.4, x0 = rx - w / 2, x1 = rx + w / 2, L = 16.3, zS = zp + L, zT = zb(H), n = Math.round(H / 0.18), ch = 0.9, cw = 0.4;
    for (let i = 0; i < n; i++) {
      const za = zp + L * (1 - (i + 1) / n), zq = zp + L * (1 - i / n);
      bag.add('granite_block', box(x0, -0.01, za, x1, H * (i + 1) / n, zq));
    }
    bag.add('brick_grey', box(x0, -0.01, zT, x1, H, zp));                                  // the landing
    for (const [xa, xb, sg] of [[x0 - cw, x0, -1], [x1, x1 + cw, 1]]) {
      const o = [], A = [0, ch], Cc = [L, H + ch];                                          // (distance from zp, height) along the cheek's top
      const V = (xx, d, y) => [xx, y, zp + L - d];
      const top = [V(xa, 0, ch), V(xb, 0, ch), V(xb, L, H + ch), V(xa, L, H + ch)];
      qd(o, top[0], top[1], top[2], top[3], [0, 1, 0.1]);
      for (const [xx, nx] of [[xa, -1], [xb, 1]]) qd(o, V(xx, 0, 0), V(xx, 0, ch), V(xx, L, H + ch), V(xx, L, 0), [nx, 0, 0]);
      qd(o, V(xa, 0, 0), V(xb, 0, 0), V(xb, 0, ch), V(xa, 0, ch), [0, 0, 1]);
      void A; void Cc; void sg;
      bag.add('brick_grey', fromTriangles(o));
      col.rect([xa, zT, xb, zS], -3, H + ch);
    }
    col.ramp([x0, zp, x1, zS], 0, H, 'n');
    col.floor([x0, zT, x1, zp], H, 'wall');
  }
  // ── the gate hall over each land gate that has one
  for (const g of gates) {
    if (g.tower) ctx.style.elements.suzhou_hall({ rect: [g.x - g.tower / 2, z - 2.5, g.x + g.tower / 2, z + 2.5], y: H + 0.3, H: 5.0, front: 'n', four: false, roof: 'xieshan', plat: 0.3, eave: 1.5, sweep: 1.3 }, ctx);
  }
}

// ── the moat: a stone-edged pool along the foot of the wall's outer side ──
/** moat_pool { rect, y, gaps: [[x0, x1]] (where a bridge crosses) }. */
function moatPool({ rect, y, gaps = [] }, { bag }) {
  const [x0, z0, x1, z1] = rect, t = [], edge = [];
  let cuts = [[x0, x1]];
  for (const [ga, gb] of gaps) cuts = cuts.flatMap(([a, b]) => (gb <= a || ga >= b ? [[a, b]] : [[a, ga], [gb, b]].filter(([p, q]) => q - p > 0.1)));
  for (const [a, b] of cuts) {
    t.push(a, y, z0, a, y, z1, b, y, z1, a, y, z0, b, y, z1, b, y, z0);
    for (const zz of [z0 - 0.3, z1 + 0.3]) beamTris(edge, [a, 0, zz], [b, 0, zz], 0.3, 0.3);
  }
  bag.add('water', fromTriangles(t));
  for (const xx of [x0, x1, ...gaps.flat()]) beamTris(edge, [xx, 0, z0 - 0.3], [xx, 0, z1 + 0.3], 0.3, 0.3);
  bag.add('granite_block', fromTriangles(edge));
}

registerStyle('suzhou-north', {
  ...STYLES.ming,
  elements: { ...STYLES.ming.elements, beisi_pagoda: beisiPagoda, suzhou_hall: suzhouHall, north_wall: northWall, moat_pool: moatPool },
});

// ═════════════════════════════════════════════════════════════════════════════
// The plans
// ═════════════════════════════════════════════════════════════════════════════
const base = (id, elements, style = 'suzhou-north') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 65], facing: 'n' } });

/** The pagoda on its terraces. */
function pagodaPlan() {
  return base('ming-suzhou-pagoda', [{ t: 'beisi_pagoda', c: PAGODA_AT, y: 0 }]);
}

/** The temple's court: its walls with the gate on the south, the main hall and the side halls, the paved court. */
function templePlan() {
  const [x0, z0, x1, z1] = COURT, cx = PAGODA_AT[0], E = [];
  const wall = (a, b, o = {}) => E.push({ t: 'ming_wall', a, b, y: 0.04, h: 5.0, th: 0.45, ...o });
  E.push({ t: 'paving', rect: [x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.6], y: LEVEL.street + 0.04, th: 0.3 });
  wall([x0, z1], [x1, z1], { gates: [{ at: cx - x0, w: 3.2, h: 3.5, plaque: true }] });
  wall([x0, z0], [x1, z0]); wall([x0, z1], [x0, z0]); wall([x1, z0], [x1, z1]);
  // the main hall (nine bays wide in the temple's scale, here five), its steps; the side halls facing the axis
  E.push({ t: 'suzhou_hall', rect: [cx - 12, -127, cx + 12, -117.5], y: 1.15, H: 7.2, front: 's', four: false, roof: 'xieshan', plat: 1.15, eave: 1.7, sweep: 1.4 });
  E.push({ t: 'stair', rect: [cx - 3, -116.6, cx + 3, -114.6], y0: 0.04, y1: 1.15, dir: 'n', riser: 0.18, mat: 'granite_block' });
  E.push({ t: 'suzhou_hall', rect: [-72, -128, -63, -120], y: 0.4, H: 4.4, front: 'e', four: false, roof: 'xieshan', plat: 0.4 });
  E.push({ t: 'suzhou_hall', rect: [-17, -128, -8, -120], y: 0.4, H: 4.4, front: 'w', four: false, roof: 'xieshan', plat: 0.4 });
  return base('ming-suzhou-temple', E);
}

/** The wall, its gates, the roads through them, the canals under the water gates, the moat. */
function wallPlan() {
  const { z, base: B } = WALL, zn = z - B / 2, zp = z + B / 2, E = [];
  const gates = [
    { x: 17, w: 5.6, kind: 'land', tower: 17 },                // the north gate, on the road from the town
    { x: -94, w: 4.4, kind: 'land' }, { x: -100.5, w: 5, kind: 'water' },
    { x: 93, w: 4.4, kind: 'land' }, { x: 99.5, w: 5, kind: 'water' },
  ];
  E.push({ t: 'north_wall', z, x0: WALL.x0, x1: WALL.x1, base: B, top: WALL.top, H: WALL.H, gates, ramps: [-52, 58],
    bastions: [{ x: -113, w: 10, d: 6.5, turret: true }, { x: 113, w: 10, d: 6.5, turret: true }, { x: -62, w: 9, d: 5.5 }, { x: 58, w: 9, d: 5.5 }, { x: -22, w: 9, d: 5.5 }] });
  // the roads: the town's north road to the gate; the two canal-side streets on through their gates and out
  E.push({ t: 'paving', rect: [14.2, zn - 1.0, 19.8, -110.8], y: LEVEL.street + 0.04, th: 0.3 });
  E.push({ t: 'paving', rect: [-110, -110.8, 110, -108], y: LEVEL.street + 0.04, th: 0.3 });
  for (const [xa, xb] of [[90, 96], [-97, -91]]) E.push({ t: 'paving', rect: [xa, zn - 3, xb, -162.5], y: LEVEL.street + 0.04, th: 0.3 });
  // the canals run on under the water gates and out (the water the ground's channel holds, to where it rises)
  for (const [xa, xb] of [[96, 103], [-104, -97]]) {
    const zs = xa < 0 ? -155.4 : -156.07, ze = -179;
    E.push({ t: 'water_rect', rect: [xa, ze, xb, zs], y: LEVEL.canal });
    for (const x of [xa, xb]) for (const [a, b] of [[zs, zp + 0.01], [zn - 0.01, ze]]) E.push({ t: 'canal_wall', a: [x, a], b: [x, b], y: LEVEL.street + 0.05, bed: LEVEL.canalBed, th: 0.7, water: LEVEL.canal, toward: [(xa + xb) / 2, (a + b) / 2] });
  }
  // the moat outside the wall, a causeway-bridge where the road leaves the gate
  const zm0 = -186.5, zm1 = -177.3;
  E.push({ t: 'moat_pool', rect: [-88, zm0, 88, zm1], y: LEVEL.street + 0.05, gaps: [[14.2, 19.8]] });
  E.push({ t: 'ming_arch_bridge', at: [17, (zm0 + zm1) / 2 - 0.2], across: 'z', span: zm1 - zm0 + 0.4, width: 5.6, rise: 2.4, landing: 4.6, y: LEVEL.street + 0.04, water: LEVEL.street + 0.05, bed: -1.0 });
  return base('ming-suzhou-wall', E);
}

/** The plans of this part. */
export function northPlans() { return [pagodaPlan(), templePlan(), wallPlan()]; }
