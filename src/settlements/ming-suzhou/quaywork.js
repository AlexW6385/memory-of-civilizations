// The quays, bridges and streets of the quarter, worn and lived in (docs/settlements/ming-suzhou.md §20).
// Like townwork.js, each element wraps the shared one of the same name from src/styles/ming (style `suzhou-quarter`):
// the canal wall gets the green of the waterline and weeds in its coping joints; the landing steps get a polished,
// foot-worn middle on every tread and moss on the lowest;
// the arch bridge gets its treads worn along the middle and moss at the abutments; the street its worn centre line.
// Only existing materials of the waterways plan are used (granite_grey) and one more (sod, the moss): no draw is added by the greens' sake alone.
// (Washing, boat loads and wells are life objects, placed in town.js's riverLife().)

import { STYLES, registerStyle } from '../../core/build.js';
import { Acc, hash } from './townwork.js';

const B = { ...STYLES['suzhou-quarter'].elements };
const base = () => B;

/** A film of triangles (a, b, c) turned to face along dir. */
function facingTri(acc, mat, a, b, c, dir) {
  const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
  if (nx * dir[0] + ny * dir[1] + nz * dir[2] >= 0) acc.tri(mat, a, b, c); else acc.tri(mat, a, c, b);
}
/** A ragged patch on a plane: along (p0 → p1 on the wall), from y0 up to a wandering height, `h` tall at most, facing dir. */
function patch(acc, mat, P, s0, s1, y0, h, seed, dir, n = 5) {
  const top = (k) => y0 + h * (0.35 + 0.65 * hash(seed, k)) * Math.sin(Math.PI * (0.12 + 0.76 * k / n));
  for (let k = 0; k < n; k++) {
    const a = s0 + (s1 - s0) * k / n, b = s0 + (s1 - s0) * (k + 1) / n;
    const A = P(a, y0), B = P(b, y0), C = P(b, top(k + 1)), D = P(a, top(k));
    facingTri(acc, mat, A, B, C, dir); facingTri(acc, mat, A, C, D, dir);
  }
}
/** A tuft of grass: three blades standing at p, h tall, leaning with the hash. */
function tuft(acc, mat, p, h, seed) {
  for (let k = 0; k < 3; k++) {
    const a = hash(seed, k, 1) * Math.PI * 2, lean = 0.05 + 0.07 * hash(seed, k, 2), hh = h * (0.6 + 0.4 * hash(seed, k, 3)), w = 0.012;
    const ca = Math.cos(a), sa = Math.sin(a);
    const A = [p[0] - sa * w, p[1], p[2] + ca * w], B = [p[0] + sa * w, p[1], p[2] - ca * w], C = [p[0] + ca * lean, p[1] + hh, p[2] + sa * lean];
    acc.tri(mat, A, B, C); acc.tri(mat, A, C, B);
  }
}

/** A ragged blob of moss lying flat: a fan of eight points round (cx, y, cz), radii ra along (ux, uz) and rb across, each wandering by the hash. */
function blob(acc, mat, cx, y, cz, ux, uz, ra, rb, seed) {
  const pts = [];
  for (let k = 0; k < 9; k++) {
    const t = k / 9 * Math.PI * 2, f = 0.55 + 0.45 * hash(seed, k, 21), a = Math.cos(t) * ra * f, b = Math.sin(t) * rb * f;
    pts.push([cx + ux * a - uz * b, y, cz + uz * a + ux * b]);
  }
  for (let k = 0; k < 9; k++) facingTri(acc, mat, [cx, y, cz], pts[k], pts[(k + 1) % 9], [0, 1, 0]);
}

// ── the canal wall ─────────────────────────────────────────────────────────────────────────────────────────────
function canalWall(el, ctx) {
  base().canal_wall(el, ctx);
  if (el.water === undefined) return;
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const th = el.th ?? 0.7, w = el.water, sg = el.toward ? (((el.toward[0] - ax) * nx + (el.toward[1] - az) * nz) > 0 ? 1 : -1) : 1;
  const acc = new Acc(), o = sg * (th / 2 + 0.011), dir = [nx * sg, 0, nz * sg];
  const Pw = (s, yy, oo = o) => [ax + ux * s + nx * oo, yy, az + uz * s + nz * oo];
  // the green of the waterline: ragged ribbons of moss on the wet band, in runs of half a metre to a metre and a half
  for (let s = 0.4; s < L - 1.6;) {
    const h0 = hash(ax + ux * s, az + uz * s, 11);
    if (h0 < 0.5) { const len = 0.5 + hash(ax + ux * s, az + uz * s, 12) * 1.1; patch(acc, 'sod', (t, yy) => Pw(t, yy), s, s + len, w - 0.08, 0.2 + hash(s, ax, 3) * 0.2, ax + s, dir); s += len + 0.5; } else s += 1.2;
  }
  // weeds in the coping joints along the top, every few metres (the coping's top lies about 0.02 above the wall's y)
  const yTop = (el.y ?? 0.05) + 0.02;
  for (let s = 0.9; s < L - 0.5; s += 1.3 + hash(ax + s, az, 5) * 3.5) if (hash(ax + ux * s, az + uz * s, 13) < 0.6) tuft(acc, 'sod', [ax + ux * s + nx * (hash(s, az, 4) - 0.5) * 0.3, yTop, az + uz * s + nz * (hash(s, az, 4) - 0.5) * 0.3], 0.09 + hash(s, az, 6) * 0.08, ax * 3 + s);
  acc.flush(ctx.bag);
}

// ── the landing steps ──────────────────────────────────────────────────────────────────────────────────────────
function waterSteps(el, ctx) {
  base().water_steps(el, ctx);
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, [dx, dz] = el.dir;
  const y = el.y ?? 0, w = el.water ?? -0.75, D = el.depth ?? 1.05, land = w + 0.14;
  const n = Math.max(3, Math.round((y - land) / 0.17)), rise = (y - land) / n;
  const flights = el.double ? [[0, 1], [L, -1]] : [[0, 1]];
  const run = el.double ? Math.min(0.3, (L - 1.0) / 2 / n) : Math.min(0.3, (L - 0.8) / n);
  const acc = new Acc(), P = (s, d, yy) => [ax + ux * s + dx * d, yy, az + uz * s + dz * d];
  const up = [0, 1, 0];
  let sEnd = [];
  for (const [s0, dir] of flights) {
    for (let k = 0; k < n; k++) {
      const top = y - rise * (k + 1) + 0.004, sa = s0 + dir * k * run, sb = s0 + dir * (k + 1) * run, lo = Math.min(sa, sb) + 0.04, hi = Math.max(sa, sb) - 0.03;
      // the polished middle of the tread (feet go down the middle, and the lowest treads are wet): darker, smoother stone, its outline wavering
      const d0 = 0.22 + 0.1 * hash(sa, k, az), d1 = D - 0.2 - 0.12 * hash(sb, k, ax);
      const A = P(lo, d0, top), B = P(hi, d0, top), C = P(hi, d1, top), E = P(lo, d1, top);
      facingTri(acc, 'granite_grey', A, B, C, up); facingTri(acc, 'granite_grey', A, C, E, up);
      // moss in the corners of the lowest three treads, and along their wet outer ends: a few ragged blobs, a hand's breadth to a foot across
      if (k >= n - 3) for (let q = 0; q < 2; q++) if (hash(sa, k, 9 + q) < 0.65) {
        const m = [ax + ux * (lo + (hi - lo) * (0.2 + 0.6 * hash(sa, k, 14 + q))) + dx * (D - 0.12 - 0.2 * hash(sb, k, 16 + q)), az + uz * (lo + (hi - lo) * (0.2 + 0.6 * hash(sa, k, 14 + q))) + dz * (D - 0.12 - 0.2 * hash(sb, k, 16 + q))];
        blob(acc, 'sod', m[0], top + 0.003, m[1], ux, uz, 0.05 + 0.1 * hash(sa, k, 18), 0.04 + 0.08 * hash(sb, k, 19), sa * 7 + k + q);
      }
    }
    sEnd.push(s0 + dir * n * run);
  }
  // and on the landing slab, along its water side and where the treads meet it
  { const l0 = el.double ? Math.min(...sEnd) : sEnd[0], l1 = el.double ? Math.max(...sEnd) : L;
    for (let q = 0; q < 4; q++) {
      const s = l0 + (l1 - l0) * (0.08 + 0.84 * hash(ax, az, 30 + q)), d = D - 0.1 - 0.35 * hash(ax, az, 34 + q) * (q < 2 ? 0.3 : 1);
      if (hash(ax + q, az, 38) < 0.75) blob(acc, 'sod', ax + ux * s + dx * d, land + 0.005, az + uz * s + dz * d, ux, uz, 0.08 + 0.16 * hash(ax, az, 40 + q), 0.05 + 0.1 * hash(ax, az, 44 + q), ax * 3 + az + q);
    }
  }
  acc.flush(ctx.bag);
}

// ── the arch bridge ────────────────────────────────────────────────────────────────────────────────────────────
function archBridge(el, ctx) {
  base().ming_arch_bridge(el, ctx);
  const [cx, cz] = el.at, S = el.span, W = el.width / 2, R = el.rise ?? 2.2, land = el.landing ?? 4.5, y0 = el.y ?? 0, springY = el.water ?? -0.75;
  const alongZ = el.across === 'z', P = (s, o, y) => (alongZ ? [cx + o, y, cz + s] : [cx + s, y, cz + o]);
  const half = S / 2 + land, top = (s) => y0 + R * Math.cos(Math.min(1, Math.abs(s) / half) * Math.PI / 2) ** 0.8;
  const N = 48, acc = new Acc(), up = [0, 1, 0], archR = S / 2 * 0.92;
  // the treads, worn along the middle: the polished stone lies a hair above each step's top, a metre and a half wide, its edges ragged
  for (let i = 0; i < N; i++) {
    const s0 = -half + 2 * half * i / N, s1 = -half + 2 * half * (i + 1) / N;
    const t = Math.max(Math.round(top(s0) / 0.16) * 0.16, Math.round(top(s1) / 0.16) * 0.16) - 0.001 + 0.004;
    const w0 = 0.55 + 0.25 * hash(cx, cz + i, 1), w1 = 0.55 + 0.25 * hash(cx, cz + i, 2), o0 = (hash(cx + i, cz, 3) - 0.5) * 0.2;
    const A = P(s0 + 0.03, o0 - w0, t), B = P(s1 - 0.01, o0 - w1, t), C = P(s1 - 0.01, o0 + w1, t), E = P(s0 + 0.03, o0 + w0, t);
    facingTri(acc, 'granite_grey', A, B, C, up); facingTri(acc, 'granite_grey', A, C, E, up);
  }
  // the green at the abutments: on both faces, in the band the water wets, beyond the arch's ring
  for (const sg of [-1, 1]) for (const e of [-1, 1]) {
    const o = sg * (W + 0.004), dir = alongZ ? [sg, 0, 0] : [0, 0, sg], s0 = e * (archR + 0.55), s1 = e * (archR + 0.55 + 1.4 + 1.2 * hash(cx, cz + e, sg));
    patch(acc, 'sod', (t, yy) => P(t, o, yy), Math.min(s0, s1), Math.max(s0, s1), springY - 0.1, 0.45, cx + cz * 3 + e * 7 + sg, dir, 6);
  }
  acc.flush(ctx.bag);
}

// ── the street's worn centre line ──────────────────────────────────────────────────────────────────────────────
/** street_wear { rect } : on a street of bluestone slabs, a line of long slabs down its middle worn smooth and dark by the foot traffic (a hair above the paving, in pieces with gaps). */
function streetWear(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, along = x1 - x0 >= z1 - z0, len = along ? x1 - x0 : z1 - z0, wid = along ? z1 - z0 : x1 - x0, y = (el.y ?? 0.04) + 0.008, acc = new Acc();
  const half = Math.min(0.55, wid * 0.17), c = (along ? (z0 + z1) / 2 : (x0 + x1) / 2);
  for (let s = 0.8; s < len - 1.2;) {
    const l = 1.3 + hash(x0 + s, z0, 1) * 1.6, off = (hash(x0, z0 + s, 2) - 0.5) * wid * 0.16, w = half * (0.8 + 0.4 * hash(s, x0, 3));
    if (s + l > len - 0.6) break;
    const q = (a, o) => (along ? [x0 + a, y, c + o] : [c + o, y, z0 + a]);
    const A = q(s, off - w), B = q(s + l, off - w * (0.9 + 0.2 * hash(s, z0, 4))), C = q(s + l, off + w), D = q(s, off + w * (0.9 + 0.2 * hash(s, z0, 5)));
    facingTri(acc, 'granite_grey', A, B, C, [0, 1, 0]); facingTri(acc, 'granite_grey', A, C, D, [0, 1, 0]);
    s += l + 0.25 + hash(s, x0, 6) * 0.5;
  }
  acc.flush(ctx.bag);
}

registerStyle('suzhou-quarter', {
  ...STYLES['suzhou-quarter'],
  elements: { ...B, canal_wall: canalWall, water_steps: waterSteps, ming_arch_bridge: archBridge, street_wear: streetWear },
});

