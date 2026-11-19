// Ming Suzhou — the halls' roofs and eaves seen close (docs/settlements/ming-suzhou.md §13):
// the round tile ends (wadang) and the pendant drip tiles (diyou) along every eave, the stepped
// ridge with its coin ornament at the middle, the scrolled ends at the hips' feet, the cantilever
// brackets (ya shou) under the eaves with the purlin they carry, and the carved band on the beams.
// Everything is built from the same roof formula as the style's rectRoof (src/styles/ming/index.js)
// so that it stands exactly on that roof; one geometry per material; no random numbers (a hash of
// the piece's own position).

import { fromTriangles, lathe } from '../../core/geom.js';
import { Parts as Parts2 } from './props.js';
import { canWrite, inscription } from './script.js';

const TAU = Math.PI * 2;
const ROOF = 'tile_dark', WOOD = 'lacquer_chestnut';

/** A hash of a position, 0…1. */
export function hash(x, z, k = 0) {
  let h = Math.imul(Math.round(x * 100) ^ Math.imul(Math.round(z * 100) + 1013, 0x27d4eb2d) ^ Math.imul(k + 7, 0x165667b1), 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** One triangle, turned so that it faces away from `cen` (for the faces of a convex piece). */
function solid(out, cen, a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const mx = (a[0] + b[0] + c[0]) / 3 - cen[0], my = (a[1] + b[1] + c[1]) / 3 - cen[1], mz = (a[2] + b[2] + c[2]) / 3 - cen[2];
  if (nx * mx + ny * my + nz * mz >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
const quadS = (out, cen, a, b, c, d) => { solid(out, cen, a, b, c); solid(out, cen, a, c, d); };

/** The roof of a hall as ming_hall lays it (rectRoof): the height at (u along the ridge, v across), and the plan's own frame. */
export function roofOf(el) {
  const [x0, z0, x1, z1] = el.rect, Lx = x1 - x0, Lz = z1 - z0, along = Lx >= Lz, o = el.eave ?? 1.25;
  const A = (along ? Lx : Lz) / 2 + o, B = (along ? Lz : Lx) / 2 + o, kind = el.roof ?? 'xieshan';
  const y = el.y + el.H - 0.25, R = el.rise ?? B * 0.62, sw = el.sweep ?? 1.0, p = 1.7, gAt = el.gableAt ?? 0.42;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const hgt = (u, v) => {
    const au = Math.abs(u), av = Math.abs(v), ts = Math.max(0, Math.min(1, (B - av) / B));
    let te = kind === 'gable' ? 9 : Math.max(0, (au > A ? 0 : (A - au)) / B);
    if (kind === 'xieshan' && te > gAt) te = 9;
    const t = Math.min(ts, te), corner = kind === 'gable' ? 0 : Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    return y + R * Math.pow(t, p) + sw * corner * corner;
  };
  const W = along ? (u, v) => [cx + u, cz + v] : (u, v) => [cx - v, cz + u];
  const D = along ? (du, dv) => [du, dv] : (du, dv) => [-dv, du];                  // a direction of the frame, in the world
  const inv = along ? (x, z) => [x - cx, z - cz] : (x, z) => [z - cz, -(x - cx)];
  return { A, B, y, R, sw, kind, gAt, p, hgt, W, D, inv, cx, cz, along, o };
}

/** The tile end (wadang): a six-sided round tile end, its face a low boss, facing out along n (horizontal), centre c. */
function tileEnd(out, c, n, r, depth, boss) {
  const tx = -n[1], tz = n[0], R = [], F = [];
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * TAU + 0.26, ct = Math.cos(a) * r, st = Math.sin(a) * r;
    R.push([c[0] + tx * ct, c[1] + st, c[2] + tz * ct]);
    F.push([c[0] + tx * ct + n[0] * depth, c[1] + st, c[2] + tz * ct + n[1] * depth]);
  }
  const mid = [c[0] + n[0] * (depth + boss), c[1], c[2] + n[1] * (depth + boss)], cen = [c[0] + n[0] * depth * 0.5, c[1], c[2] + n[1] * depth * 0.5];
  for (let k = 0; k < 6; k++) {
    const j = (k + 1) % 6;
    solid(out, cen, mid, F[k], F[j]);
    quadS(out, cen, R[k], R[j], F[j], F[k]);
  }
}
/** The drip tile (diyou): a pointed pendant hung under the eave's edge, c its top middle, n out, half-width w, drop h. */
function dripTile(out, c, n, w, h) {
  const tx = -n[1], tz = n[0], d = 0.03;
  const a = [c[0] - tx * w, c[1], c[2] - tz * w], b = [c[0] + tx * w, c[1], c[2] + tz * w], tip = [c[0] + n[0] * d * 0.4, c[1] - h, c[2] + n[1] * d * 0.4];
  const a2 = [a[0] + n[0] * d, a[1] + 0.012, a[2] + n[1] * d], b2 = [b[0] + n[0] * d, b[1] + 0.012, b[2] + n[1] * d], tip2 = [tip[0] + n[0] * d * 0.6, tip[1] + 0.03, tip[2] + n[1] * d * 0.6];
  const cen = [c[0] + n[0] * 0.01, c[1] - h * 0.4, c[2] + n[1] * 0.01];
  solid(out, cen, a2, b2, tip2);
  quadS(out, cen, a, a2, tip2, tip); quadS(out, cen, b, tip, tip2, b2);
}

/** A bar of rectangular section along a polyline of 3-D points, half-width b (across, horizontally), thickness hh (up), closed ends. */
function bar(out, pts, b, hh, up = 0, fb = [1, 0]) {
  const n = pts.length, cen = [0, 0, 0];
  for (const p of pts) { cen[0] += p[0] / n; cen[1] += p[1] / n; cen[2] += p[2] / n; }
  const S = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)], dx = c[0] - a[0], dz = c[2] - a[2], l = Math.hypot(dx, dz), ex = l > 1e-4 ? dx / l : fb[0], ez = l > 1e-4 ? dz / l : fb[1], nx = -ez * b, nz = ex * b;
    return [[p[0] - nx, p[1] + up, p[2] - nz], [p[0] + nx, p[1] + up, p[2] + nz], [p[0] + nx, p[1] + up + hh, p[2] + nz], [p[0] - nx, p[1] + up + hh, p[2] - nz]];
  });
  for (let i = 0; i + 1 < n; i++) {
    const c2 = [(pts[i][0] + pts[i + 1][0]) / 2, pts[i][1] + hh / 2 + up, (pts[i][2] + pts[i + 1][2]) / 2];
    for (let k = 0; k < 4; k++) quadS(out, c2, S[i][k], S[i][(k + 1) % 4], S[i + 1][(k + 1) % 4], S[i + 1][k]);
  }
  for (const [i, j] of [[0, 1], [n - 1, n - 2]]) { const c2 = [(pts[i][0] + pts[j][0]) / 2, pts[i][1] + hh / 2 + up, (pts[i][2] + pts[j][2]) / 2]; solid(out, c2, S[i][0], S[i][1], S[i][2]); solid(out, c2, S[i][0], S[i][2], S[i][3]); }
}

/** The scrolled end of a hip: from p it runs out along dir (horizontal) and rises, turning up and back over itself. */
function hipScroll(out, p, dir, size, w) {
  const l = Math.hypot(dir[0], dir[1]) || 1, ex = dir[0] / l, ez = dir[1] / l, N = 10, C = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N, a = -Math.PI / 2 + t * Math.PI * 1.25, R = size * (0.6 - 0.34 * t);
    C.push([size * 0.1 + Math.cos(a) * R, size * 0.6 + Math.sin(a) * R]);
  }
  C[0] = [0, 0];
  const pts = C.map(([d, v]) => [p[0] + ex * d, p[1] + v, p[2] + ez * d]);
  // thicker at the root, thinning to the tip: three runs of the bar
  for (let i = 0; i + 1 < pts.length; i++) bar(out, [pts[i], pts[i + 1]], w * (1 - 0.55 * i / N), w * 1.7 * (1 - 0.5 * i / N), -w * 0.85 * (1 - 0.5 * i / N), [ex, ez]);
}

/** A ring standing on edge (its plane along dir): the coin ornament of the ridge. */
function coin(out, c, dir, R, r) {
  const M = 14, m = 4, l = Math.hypot(dir[0], dir[1]) || 1, ex = dir[0] / l, ez = dir[1] / l;
  const P = (a, b) => { const ca = Math.cos(a), sa = Math.sin(a), rr = R + Math.cos(b) * r, h = Math.sin(b) * r; return [c[0] + ex * ca * rr + -ez * h, c[1] + sa * rr, c[2] + ez * ca * rr + ex * h]; };
  for (let i = 0; i < M; i++) for (let j = 0; j < m; j++) {
    const a0 = i / M * TAU, a1 = (i + 1) / M * TAU, b0 = j / m * TAU, b1 = (j + 1) / m * TAU, cen = [c[0] + ex * Math.cos((a0 + a1) / 2) * R, c[1] + Math.sin((a0 + a1) / 2) * R, c[2] + ez * Math.cos((a0 + a1) / 2) * R];
    quadS(out, cen, P(a0, b0), P(a1, b0), P(a1, b1), P(a0, b1));
  }
}

/** An extruded profile in a vertical plane: pts of [s, y] (a closed polygon, convex enough), thickness t across, starting at (x, z) going along n. */
function extrude(out, prof, x, z, n, t) {
  const tx = -n[1] * t / 2, tz = n[0] * t / 2, P = (q, sg) => [x + n[0] * q[0] + sg * tx, q[1], z + n[1] * q[0] + sg * tz];
  const k = prof.length, cen = [0, 0, 0];
  for (const q of prof) { cen[0] += q[0] / k; cen[1] += q[1] / k; }
  const C = [x + n[0] * cen[0], cen[1], z + n[1] * cen[0]];
  // the two faces, fanned from the profile's middle; the rim between them
  for (let i = 0; i < k; i++) {
    const j = (i + 1) % k;
    for (const sg of [-1, 1]) solid(out, [C[0] - sg * tx * 3, C[1], C[2] - sg * tz * 3], [C[0] + sg * tx, C[1], C[2] + sg * tz], P(prof[i], sg), P(prof[j], sg));
    quadS(out, C, P(prof[i], -1), P(prof[j], -1), P(prof[j], 1), P(prof[i], 1));
  }
}

/** The outer posts of a hall, as ming_hall sets them out: [{ x, z, nx, nz }] (a corner post twice, once for each face). */
export function rimPosts(el) {
  const [x0, z0, x1, z1] = el.rect, Lx = x1 - x0, Lz = z1 - z0, along = Lx >= Lz;
  const nb = el.bays?.[0] ?? Math.max(1, 2 * Math.round(((along ? Lx : Lz) / 3.6 - 1) / 2) + 1), nd = el.bays?.[1] ?? Math.max(1, Math.round((along ? Lz : Lx) / 3.4));
  const xs = [], zs = [];
  for (let i = 0; i <= (along ? nb : nd); i++) xs.push(x0 + Lx * i / (along ? nb : nd));
  for (let j = 0; j <= (along ? nd : nb); j++) zs.push(z0 + Lz * j / (along ? nd : nb));
  const out = [];
  for (const x of xs) { out.push({ x, z: z0, nx: 0, nz: -1, side: 'n' }); out.push({ x, z: z1, nx: 0, nz: 1, side: 's' }); }
  for (const z of zs) { out.push({ x: x0, z, nx: -1, nz: 0, side: 'w' }); out.push({ x: x1, z, nx: 1, nz: 0, side: 'e' }); }
  return { posts: out, xs, zs };
}

/**
 * hallTrim(bag, el): the fine work of a hall's roof and eaves. el is the ming_hall element itself
 * ({ rect, y, H, eave, roof, rise, sweep, trim: true | 'lite' }); `lite` leaves out the beam band.
 */
export function hallTrim(bag, el) {
  const rf = roofOf(el), { A, B, hgt, W, D } = rf, kind = rf.kind, lite = el.trim === 'lite';
  const tiles = [], wood = [];
  // ── the eave: a round tile end at every cover-tile row (every 21 cm), a drip tile between
  const sp = 0.21;
  // a run along the edge: u (axis 0) or v (axis 1) varies over ±half in steps of sp from the middle, the other coordinate fixed at `fix`; nrm outward (local)
  const run = (axis, fix, half, nrm) => {
    const nw = D(nrm[0], nrm[1]), ni = Math.floor(half / sp);
    const at = (t) => (axis === 0 ? [t, fix] : [fix, t]);
    for (let i = -ni; i <= ni; i++) {
      const [u, v] = at(i * sp), e = W(u, v);
      if (hash(e[0], e[1], 3) > 0.012) tileEnd(tiles, [e[0], hgt(u, v) - 0.038, e[1]], nw, 0.074, 0.033, 0.012);      // (now and then one is missing)
    }
    for (let i = -ni - 1; i <= ni; i++) {
      const t = (i + 0.5) * sp;
      if (Math.abs(t) > half) continue;
      const [u, v] = at(t), e = W(u, v);
      dripTile(tiles, [e[0], hgt(u, v) - 0.185, e[1]], nw, 0.062, 0.13);
    }
  };
  const inset = 0.1;
  run(0, -B, A - inset, [0, -1]); run(0, B, A - inset, [0, 1]);
  run(1, A, B - inset, [1, 0]); run(1, -A, B - inset, [-1, 0]);

  // ── the ridge: a footing course, a cap over the beam, the coin at the middle flanked by two tall studs, and (hip-and-gable) the scrolled ends at the hips' feet
  const top = rf.y + rf.R, L = kind === 'gable' ? A : kind === 'xieshan' ? A - rf.gAt * B - 0.3 : A - B;
  if (kind !== 'hip' && L > 1) {
    const r0 = W(-L - 0.3, 0), r1 = W(L + 0.3, 0);
    bar(tiles, [[r0[0], top - 0.04, r0[1]], [r1[0], top - 0.04, r1[1]]], 0.235, 0.085);                 // the footing, a little proud of the beam's 0.16
    bar(tiles, [[r0[0], top + 0.335, r0[1]], [r1[0], top + 0.335, r1[1]]], 0.2, 0.05);                  // the cap
    const m = W(0, 0), dd = D(1, 0);
    const dn = Math.hypot(dd[0], dd[1]); dd[0] /= dn; dd[1] /= dn;
    coin(tiles, [m[0], top + 0.385 + 0.27, m[1]], dd, 0.24, 0.032);
    bar(tiles, [[m[0] - dd[0] * 0.2, top + 0.385, m[1] - dd[1] * 0.2], [m[0] + dd[0] * 0.2, top + 0.385, m[1] + dd[1] * 0.2]], 0.07, 0.06);
    for (const s of [-1, 1]) { const q = W(s * Math.min(L * 0.5, 2.2), 0); bar(tiles, [[q[0] - dd[0] * 0.1, top + 0.385, q[1] - dd[1] * 0.1], [q[0] + dd[0] * 0.1, top + 0.385, q[1] + dd[1] * 0.1]], 0.1, 0.22); bar(tiles, [[q[0] - dd[0] * 0.07, top + 0.605, q[1] - dd[1] * 0.07], [q[0] + dd[0] * 0.07, top + 0.605, q[1] + dd[1] * 0.07]], 0.07, 0.07); }
  }
  if (kind === 'xieshan') for (const su of [-1, 1]) for (const sv of [-1, 1]) {
    const e = W(su * A, sv * B), h = hgt(su * A, sv * B), dir = D(su, sv);
    hipScroll(tiles, [e[0] - dir[0] * 0.05, h + 0.14, e[1] - dir[1] * 0.05], dir, 0.6, 0.075);
  }

  // ── the brackets (ya shou) under the eaves, the purlin they carry, the carved band on the beams
  const { posts } = rimPosts(el), y = el.y, H = el.H;
  const tip = Math.min(0.95, rf.o - 0.3);
  const topY = (x, z, s, nx, nz) => { const [u, v] = rf.inv(x + nx * s, z + nz * s); return hgt(u, v) - 0.365; };
  const runs = new Map();
  for (const q of posts) {
    const n = [q.nx, q.nz], S = 7, prof = [], up = [], dn = [];
    for (let k = 0; k <= S; k++) {
      const s = 0.13 + (tip - 0.13) * k / S, f = k / S, ty = topY(q.x, q.z, s, q.nx, q.nz);
      const depth = 0.15 + 0.27 * Math.pow(1 - f, 1.6) + (k === S ? 0.02 : 0) + 0.04 * Math.sin(f * Math.PI * 2) * (1 - f);
      up.push([s, ty]); dn.push([s, ty - depth]);
    }
    for (const p of up) prof.push(p);
    for (let k = S; k >= 0; k--) prof.push(dn[k]);
    extrude(wood, prof, q.x, q.z, n, 0.12);
    // the block (dou) at the arm's tip, under the purlin
    const [s, ty] = up[S], bx = q.x + n[0] * s, bz = q.z + n[1] * s;
    extrude(wood, [[s - 0.1, ty - 0.14], [s + 0.1, ty - 0.14], [s + 0.1, ty + 0.0], [s - 0.1, ty + 0.0]].map(([a, b]) => [a - s, b]), bx, bz, n, 0.17);
    const key = q.side; if (!runs.has(key)) runs.set(key, []); runs.get(key).push([bx, ty + 0.0, bz]);
  }
  for (const [sd, pts] of runs) {
    pts.sort((a, b) => a[0] - b[0] || a[2] - b[2]);
    if (pts.length < 2) continue;
    const f = pts[0], l = pts[pts.length - 1], dl = Math.hypot(l[0] - f[0], l[2] - f[2]) || 1, ux = (l[0] - f[0]) / dl, uz = (l[2] - f[2]) / dl;
    const ext = [[f[0] - ux * tip, f[1], f[2] - uz * tip], ...pts, [l[0] + ux * tip, l[1], l[2] + uz * tip]];       // on to the corner, where the next side's purlin meets it
    bar(wood, ext, 0.065, 0.14, 0, [ux, uz]);
    void sd;
  }
  if (!lite) {
    // the carved band: on the outer face of every beam, between the posts, a raised plaque with three lobed bosses
    const plate = (e, n, u, w2, hh, yb) => {
      const t = [n[1], -n[0]], d0 = 0.14, d1 = 0.158, c = [e[0], yb + hh / 2, e[1]];
      const P = (a, b, d) => [e[0] + t[0] * a + n[0] * d, yb + b, e[1] + t[1] * a + n[1] * d];
      const cen = [c[0] - n[0] * 0.2, c[1], c[2] - n[1] * 0.2];
      quadS(wood, cen, P(-w2, 0, d1), P(w2, 0, d1), P(w2, hh, d1), P(-w2, hh, d1));
      for (const [a, b, a2, b2] of [[-w2, 0, w2, 0], [w2, 0, w2, hh], [w2, hh, -w2, hh], [-w2, hh, -w2, 0]]) quadS(wood, cen, P(a, b, d0), P(a2, b2, d0), P(a2, b2, d1), P(a, b, d1));
      // three lobed bosses on it: a larger one at the middle
      for (const [a, r] of [[0, 0.075], [-w2 * 0.6, 0.045], [w2 * 0.6, 0.045]]) {
        const ctr = P(a, hh / 2, d1), k = 8;
        for (let i = 0; i < k; i++) {
          const a0 = i / k * TAU, a1 = (i + 1) / k * TAU, r0 = r * (1 + 0.18 * Math.cos(a0 * 4)), r1 = r * (1 + 0.18 * Math.cos(a1 * 4));
          const p0 = [ctr[0] + t[0] * Math.cos(a0) * r0, ctr[1] + Math.sin(a0) * r0 * 0.9, ctr[2] + t[1] * Math.cos(a0) * r0], p1 = [ctr[0] + t[0] * Math.cos(a1) * r1, ctr[1] + Math.sin(a1) * r1 * 0.9, ctr[2] + t[1] * Math.cos(a1) * r1];
          const apex = [ctr[0] + n[0] * 0.022, ctr[1], ctr[2] + n[1] * 0.022];
          solid(wood, [ctr[0] - n[0] * 0.1, ctr[1], ctr[2] - n[1] * 0.1], apex, p0, p1);
        }
      }
    };
    const bySide = new Map();
    for (const q of posts) { if (!bySide.has(q.side)) bySide.set(q.side, []); bySide.get(q.side).push(q); }
    for (const [sd, list] of bySide) {
      list.sort((a, b) => a.x - b.x || a.z - b.z);
      for (let i = 0; i + 1 < list.length; i++) {
        const a = list[i], b = list[i + 1], m = [(a.x + b.x) / 2, (a.z + b.z) / 2], L2 = Math.hypot(b.x - a.x, b.z - a.z);
        if (L2 < 1.2) continue;
        plate(m, [a.nx, a.nz], 0, Math.min(1.2, L2 / 2 - 0.35), 0.2, y + H - 0.5);
      }
      void sd;
    }
  }
  bag.add(ROOF, fromTriangles(tiles));
  bag.add(WOOD, fromTriangles(wood));
}

/**
 * pavilionTrim(bag, el): the eave work of a pyramid-roofed pavilion (hexagonal or square, as the
 * style's pyramidRoof lays it, its eaves 1 m beyond the posts): a round tile end at every cover-tile
 * row of every edge, a drip tile between, and a scroll at the foot of each hip.
 */
export function pavilionTrim(bag, el) {
  const [cx, cz] = el.c, y0 = el.y + (el.H ?? 3.3) - 0.2, sweep = el.sweep ?? 1.0;
  let poly;
  if (el.shape === 'square' || el.shape === 'rect') { const w = el.w / 2, d = (el.d ?? el.w) / 2; poly = [[cx - w, cz - d], [cx + w, cz - d], [cx + w, cz + d], [cx - w, cz + d]]; }
  else poly = Array.from({ length: el.shape === 'oct' ? 8 : 6 }, (_, k) => { const a = (k + 0.5) / (el.shape === 'oct' ? 8 : 6) * TAU; return [cx + Math.cos(a) * el.r, cz + Math.sin(a) * el.r]; });
  const ext = poly.map((p) => { const dx = p[0] - cx, dz = p[1] - cz, l = Math.hypot(dx, dz); return [cx + dx / l * (l + 1.0), cz + dz / l * (l + 1.0)]; });
  const tiles = [], n = ext.length, sp = 0.21;
  for (let k = 0; k < n; k++) {
    const A = ext[k], B = ext[(k + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L;
    const mx = (A[0] + B[0]) / 2 - cx, mz = (A[1] + B[1]) / 2 - cz;
    let nx = uz, nz = -ux; if (nx * mx + nz * mz < 0) { nx = -nx; nz = -nz; }
    const hAt = (a) => y0 + sweep * Math.pow(Math.abs(a - 0.5) * 2, 3);
    const m = Math.floor((L - 0.3) / sp);
    for (let i = 0; i <= m; i++) {
      const a = (0.15 + i * sp) / L, s = a * L, px = A[0] + ux * s, pz = A[1] + uz * s;
      if (hash(px, pz, 3) > 0.012) tileEnd(tiles, [px, hAt(a) - 0.038, pz], [nx, nz], 0.074, 0.033, 0.012);
      if (i < m) { const a2 = (0.15 + (i + 0.5) * sp) / L, s2 = a2 * L; dripTile(tiles, [A[0] + ux * s2, hAt(a2) - 0.185, A[1] + uz * s2], [nx, nz], 0.062, 0.13); }
    }
    const V = ext[k], dx = V[0] - cx, dz = V[1] - cz, dl = Math.hypot(dx, dz);
    hipScroll(tiles, [V[0] - dx / dl * 0.05, y0 + sweep + 0.14, V[1] - dz / dl * 0.05], [dx / dl, dz / dl], 0.6, 0.075);
  }
  bag.add(ROOF, fromTriangles(tiles));
}

// ── the gates' name tablets: characters on the brick plaques of the gates ──
/** Strokes of n characters in a row of width w and height h (the glyphs generic: horizontals, verticals and falling strokes in the proportions of characters), facing +z, from z0 up 1.2 cm. */
function glyphs(P, w, h, n, seed, z0, mat) {
  let s = (seed >>> 0) || 1; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cell = w / n, cs = Math.min(cell * 0.82, h * 0.86), t = cs * 0.085;
  for (let k = 0; k < n; k++) {
    const ccx = -w / 2 + cell * (k + 0.5), ccy = h / 2, half = cs / 2;
    const stroke = (x0, y0, x1, y1) => {
      const L = Math.hypot(x1 - x0, y1 - y0) || 1e-3, a = Math.atan2(y1 - y0, x1 - x0), ca = Math.cos(a), sa = Math.sin(a), mx = ccx + (x0 + x1) / 2, my = ccy + (y0 + y1) / 2;
      const q = (u, v, z) => [mx + ca * u - sa * v, my + sa * u + ca * v, z];
      const tri = [], zb = z0, zt = z0 + 0.012;
      const c = [[-L / 2, -t / 2], [L / 2, -t / 2], [L / 2, t / 2], [-L / 2, t / 2]];
      const top = c.map(([u, v]) => q(u, v, zt)), bot = c.map(([u, v]) => q(u, v, zb));
      tri.push(...top[0], ...top[1], ...top[2], ...top[0], ...top[2], ...top[3]);
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; tri.push(...bot[i], ...bot[j], ...top[j], ...bot[i], ...top[j], ...top[i]); }
      P.add(mat, fromTriangles(orient(tri)));
    };
    const kind = r();
    const parts = kind < 0.4 ? [[-half, -half, -half * 0.15, half], [half * 0.05, -half, half, half]] : kind < 0.75 ? [[-half, half * 0.05, half, half], [-half, -half, half, -half * 0.05]] : [[-half, -half, half, half]];
    for (const [a0, b0, a1, b1] of parts) {
      const nh = 2 + Math.floor(r() * 3), w2 = a1 - a0, h2 = b1 - b0;
      for (let j = 0; j < nh; j++) { const yy = b0 + h2 * (j + 0.5) / nh; stroke(a0 + w2 * (0.1 + r() * 0.15), yy, a1 - w2 * (0.1 + r() * 0.15), yy + (r() - 0.5) * t * 0.6); }
      const nv = 1 + Math.floor(r() * 2);
      for (let j = 0; j < nv; j++) { const xx = a0 + w2 * (nv === 1 ? 0.5 : 0.25 + j * 0.5); stroke(xx, b1 - h2 * 0.05, xx, b0 + h2 * (r() < 0.5 ? 0.05 : 0.3)); }
      if (r() < 0.6) stroke(a0 + w2 * 0.5, b0 + h2 * 0.45, a0 + w2 * 0.1, b0 + h2 * 0.05);
      if (r() < 0.5) stroke(a0 + w2 * 0.5, b0 + h2 * 0.45, a1 - w2 * 0.05, b0 + h2 * 0.08);
    }
  }
}
function orient(tri) {
  // faces of one stroke turned to look away from its middle
  let cx = 0, cy = 0, cz = 0; const n = tri.length / 3;
  for (let i = 0; i < tri.length; i += 3) { cx += tri[i]; cy += tri[i + 1]; cz += tri[i + 2]; }
  const out = [];
  for (let i = 0; i < tri.length; i += 9) solid(out, [cx / n, cy / n, cz / n], tri.slice(i, i + 3), tri.slice(i + 3, i + 6), tri.slice(i + 6, i + 9));
  return out;
}
/** tablet_text { a, b (the wall's ends), y (its foot), th, at (along), cv (the plaque's centre height), w (its width), n (characters), seed }: the inscription on both faces of a gate's plaque. */
export function tabletText(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const w = el.w - 0.22, h = 0.46 - 0.2, P = new Parts2();
  for (const sg of [-1, 1]) {
    const Q = new Parts2();
    if (canWrite(el.text)) { const m = [...el.text].length, size = Math.min(h * 0.92, w / m / 1.1); Q.add('paint_white', inscription(el.text, { pitch: Math.min(size * 1.12, w / m), size, z0: 0, z1: 0.016, thick: 1 }).translate(0, h / 2, 0)); }
    else glyphs(Q, w, h, el.n ?? 3, (el.seed ?? 5) + (sg > 0 ? 0 : 0), 0, 'tile_dark');      // (both faces carry the same inscription, read from its own side)
    const yaw = Math.atan2(nx * sg, nz * sg), o = sg * (el.th / 2 + 0.025);
    Q.emit(P, ax + ux * el.at + nx * o, el.y + el.cv - h / 2, az + uz * el.at + nz * o, yaw);
  }
  P.emit(bag, 0, 0, 0, 0);
}

// ── the carved door panels (qun ban) of the garden halls ──
let LEAF = null;
/** The carving of one door leaf's foot panel, facing +z, origin at the leaf's centre on the wall's line at the panel's middle height: a stepped roundel with a bud. */
function leafCarving() {
  if (LEAF) return LEAF;
  const P = new Parts2();
  P.add(WOOD, lathe([[0.001, 0.068], [0.108, 0.068], [0.09, 0.088], [0.05, 0.104], [0.001, 0.118]], 6).rotateX(Math.PI / 2));
  LEAF = P;
  return P;
}
/** doorCarving(bag, el): every door leaf of a hall's lattice sides gets the carved roundel on both faces of its foot panel. */
export function doorCarving(bag, el) {
  const [x0, z0, x1, z1] = el.rect, front = el.front || 's', { xs, zs } = rimPosts(el), y = el.y, proto = leafCarving();
  const sides = { n: [z0, xs, 0, -1], s: [z1, xs, 0, 1], w: [x0, zs, -1, 0], e: [x1, zs, 1, 0] };
  const wallKind = (k) => el.walls?.[k] ?? (el.four || k === front ? 'lat' : 'plaster');
  const doorSide = (k) => k === front || !!el.doors?.includes(k);
  for (const [k, [line, ticks, nx, nz]] of Object.entries(sides)) {
    if (wallKind(k) !== 'lat') continue;
    const mid = Math.floor((ticks.length - 1) / 2), dbs = el.doorBays?.[k] === 'sides' && ticks.length > 3 ? [mid - 1, mid + 1] : [mid];
    const lk = k === front || el.winSide === 'door' ? 'door' : 'window';
    if (lk !== 'door') continue;
    for (let i = 0; i + 1 < ticks.length; i++) {
      if (doorSide(k) && dbs.includes(i)) continue;
      const a = ticks[i], b = ticks[i + 1], L = b - a, n = Math.max(2, Math.round(L / 0.62));
      for (let q = 0; q < n; q++) {
        const u = a + (q + 0.5) * L / n;
        for (const sg of [-1, 1]) {
          const px = nx ? line : u, pz = nx ? u : line;
          proto.emit(bag, px, y + 0.3, pz, Math.atan2(nx * sg, nz * sg), 0.94 + 0.12 * hash(px, pz, 11 + sg));
        }
      }
    }
  }
}
