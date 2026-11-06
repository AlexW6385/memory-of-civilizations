// The halls of the Nasrid palaces (docs/settlements/granada.md §4.2–§4.3): walls with real doors,
// alcoves and windows; tiled dados, stucco linings and bands of script inside; muqarnas domes on
// squinches and drums, the star dome of the Abencerrajes, the wooden star ceiling of the Hall of the
// Ambassadors, the painted vaults of the Hall of the Kings, the lattice lantern of the Mirador.

import { box, lathe, fromTriangles, rod, disc, place } from '../../core/geom.js';

const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };
export const dbl = (t) => fromTriangles(t.concat(flip(t)));
const q4 = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
const PL = 'plaster_white', SC = 'stucco_cream', SW = 'stucco_warm', MS = 'marble_smooth';

/**
 * An axis-aligned wall r = [x0, z0, x1, z1] from y0 to y1 with rectangular holes through it:
 * holes [[u0, u1, v0, v1]] (u along the wall, v height), as the boxes left between them.
 */
export function holedWall(bag, col, mat, r, y0, y1, holes = [], alongX = (r[2] - r[0]) >= (r[3] - r[1])) {
  const [a0, a1] = alongX ? [r[0], r[2]] : [r[1], r[3]];
  const hs = holes.filter((h) => h[1] > a0 && h[0] < a1 && h[3] > y0 && h[2] < y1);
  const B = (u0, u1, p, q) => { const b = alongX ? [u0, r[1], u1, r[3]] : [r[0], u0, r[2], u1]; bag.add(mat, box(b[0], p, b[1], b[2], q, b[3])); if (col && p < y0 + 2.0) col.rect(b, p, q); };
  // full-length courses between the holes' bands, the bands cut into piers round the holes
  const vs = [...new Set([y0, y1, ...hs.flatMap((h) => [h[2], h[3]]).filter((v) => v > y0 + 1e-4 && v < y1 - 1e-4)])].sort((p, q) => p - q);
  for (let k = 0; k + 1 < vs.length; k++) {
    const p = vs[k], q = vs[k + 1], m = (p + q) / 2; if (q - p < 1e-4) continue;
    const cut = hs.filter((h) => m > h[2] && m < h[3]).map((h) => [Math.max(a0, h[0]), Math.min(a1, h[1])]).sort((x, y) => x[0] - y[0]);
    let u = a0;
    for (const [c0, c1] of cut) { if (c0 - u > 1e-4) B(u, c0, p, q); u = Math.max(u, c1); }
    if (a1 - u > 1e-4) B(u, a1, p, q);
  }
}
/** A face of a wall: the plane `at` on axis 'x' or 'z', n (±1) pointing into the room. R(d0, d1, u0, u1) is the rect from d0 to d1 off it. */
export function face(ax, at, n) {
  const R = (d0, d1, u0, u1) => { const p = at + n * d0, q = at + n * d1; return ax === 'z' ? [u0, Math.min(p, q), u1, Math.max(p, q)] : [Math.min(p, q), u0, Math.max(p, q), u1]; };
  return { ax, at, n, R, alongX: ax === 'z', P: (u, y, d) => ax === 'z' ? [u, y, at + n * d] : [at + n * d, y, u] };
}
/** Strokes of script in relief along a face between u0 and u1 at y, h tall. */
export function script(bag, mat, f, u0, u1, y, h, d0, d1, seed = 1) {
  const n = Math.floor((u1 - u0) / 0.13);
  for (let i = 0; i < n; i++) {
    const u = u0 + 0.04 + i * (u1 - u0 - 0.08) / n, k = (i * 7 + seed * 3) % 5, top = k === 0 ? h * 0.35 : k === 3 ? h * 0.6 : h * 0.92;
    bag.add(mat, box(...((r) => [r[0], y + h * 0.05, r[1], r[2], y + top, r[3]])(f.R(d0, d1, u - 0.022, u + 0.022))));
    if (k === 1) bag.add(mat, box(...((r) => [r[0], y + h * 0.05, r[1], r[2], y + h * 0.16, r[3]])(f.R(d0, d1, u, u + 0.11))));
  }
}
/**
 * The dressing of a room's wall face from u0 to u1, floor y to yTop: a dado of glazed tiles (green
 * field, a lapis border, a row of yellow lozenges), the stucco lining above, a band of script under
 * the ceiling; around the holes (the same [u0, u1, v0, v1] as the wall's).
 */
export function dress(bag, f, u0, u1, y, yTop, holes = [], o = {}) {
  const a = u0 + 0.045, b = u1 - 0.045, dado = o.dado ?? 1.3;
  holedWall(bag, null, 'glaze_green', f.R(0, 0.04, a, b), y + 0.02, y + dado, holes, f.alongX);
  holedWall(bag, null, 'glaze_lapis', f.R(0, 0.055, a, b), y + dado, y + dado + 0.12, holes, f.alongX);
  holedWall(bag, null, 'glaze_lapis', f.R(0, 0.055, a, b), y + 0.02, y + 0.12, holes, f.alongX);
  const free = (u, v0, v1) => !holes.some((h) => u > h[0] - 0.3 && u < h[1] + 0.3 && v1 > h[2] && v0 < h[3]);
  for (let u = a + 0.3; u < b - 0.2; u += 0.46) if (free(u, y + 0.3, y + 1.1)) { const r = f.R(0.04, 0.05, u - 0.13, u + 0.13); bag.add('glaze_yellow', box(r[0], y + 0.58, r[1], r[2], y + 0.84, r[3])); }
  if (yTop - y - dado < 0.5) return;
  holedWall(bag, null, SC, f.R(0, 0.025, a, b), y + dado + 0.12, yTop, holes, f.alongX);
  if (o.band !== false && yTop - y > 3.4) {
    const yb = yTop - (o.bandDrop ?? 0.75), hs = holes.filter((h) => h[3] > yb - 0.05);
    holedWall(bag, null, SW, f.R(0.025, 0.05, a, b), yb, yb + 0.42, hs, f.alongX);
    let s = a; for (const h of [...hs].sort((p, q) => p[0] - q[0]).concat([[b, b]])) { if (h[0] - s > 0.4) script(bag, SC, f, s + 0.05, h[0] - 0.05, yb + 0.05, 0.32, 0.05, 0.065, Math.round(s * 3)); s = Math.max(s, h[1]); }
  }
  // a band of script at the dado's top, in the stucco
  if (o.dadoScript !== false) {
    const yb = y + dado + 0.2, hs = holes.filter((h) => h[2] < yb + 0.3);
    holedWall(bag, null, SW, f.R(0.025, 0.045, a, b), yb, yb + 0.3, hs, f.alongX);
    let s = a; for (const h of [...hs].sort((p, q) => p[0] - q[0]).concat([[b, b]])) { if (h[0] - s > 0.4) script(bag, SC, f, s + 0.05, h[0] - 0.05, yb + 0.03, 0.24, 0.045, 0.06, Math.round(s * 5)); s = Math.max(s, h[1]); }
  }
}
/**
 * The head of an arch filling a rectangular hole from the springing ys to the hole's top yt, th
 * thick, on a wall face f (the wall from d = 0 to d = th): kind 'round' (stilted), 'horseshoe',
 * 'pointed' or 'lobed'. An archivolt of stucco on both faces and an alfiz (the rectangular frame).
 */
export function archHead(bag, f, u0, u1, ys, yt, th, kind = 'round', o = {}) {
  const tri = [], r = (u1 - u0) / 2, uc = (u0 + u1) / 2, K = 18, pts = [];
  const rise = Math.min(r, yt - ys - 0.04);
  for (let k = 0; k <= K; k++) {
    const t = Math.PI * k / K;
    let rr = 1, yy = Math.sin(t) * rise;
    if (kind === 'lobed' && k > 0 && k < K) rr = 1 - 0.09 * Math.abs(Math.sin(t * 3.5));
    if (kind === 'pointed') { const s = Math.sin(t), c = Math.cos(t); yy = rise * Math.pow(s, 0.8) * (1 + 0.25 * (1 - Math.abs(c))); yy = Math.min(yy, yt - ys - 0.02); }
    let uu = uc - Math.cos(t) * r * rr;
    if (kind === 'horseshoe') { const e = 0.12 * r * Math.sin(t) * (1 - Math.sin(t)); uu = uc - Math.cos(t) * (r * rr) + (k < K / 2 ? e : -e); }
    pts.push([uu, ys + Math.max(0, yy * rr)]);
  }
  for (let k = 0; k < K; k++) {
    const [ua, ya] = pts[k], [ub, yb] = pts[k + 1];
    for (const d of [0, th]) q4(tri, f.P(ua, ya, d), f.P(ub, yb, d), f.P(ub, yt, d), f.P(ua, yt, d));
    q4(tri, f.P(ua, ya, 0), f.P(ub, yb, 0), f.P(ub, yb, th), f.P(ua, ya, th));
  }
  bag.add(o.mat ?? SC, dbl(tri));
  if (o.frame === false) return;
  // the archivolt round the extrados and the alfiz, on the room side (d < 0 is in front of the face at d = 0)
  const sides = o.both ? [0, th] : [o.side === 'far' ? th : 0];
  for (const d of sides) {
    const out = d === 0 ? -0.035 : th + 0.035;
    for (let k = 0; k < K; k++) { const [ua, ya] = pts[k], [ub, yb] = pts[k + 1], g = 0.06; const A = f.P(uc + (ua - uc) * (1 + g / r), ys + (ya - ys) * (1 + g / Math.max(0.3, rise)), out), B = f.P(uc + (ub - uc) * (1 + g / r), ys + (yb - ys) * (1 + g / Math.max(0.3, rise)), out); bag.add(SC, rod(A, B, 0.03, 4)); }
    if (o.alfiz !== false) {
      const ya = ys - 0.05, yb = Math.min(yt + (o.alfizUp ?? 0.35), ys + rise + 0.5), ua = u0 - 0.22, ub = u1 + 0.22;
      for (const [A, B] of [[[ua, ya], [ua, yb]], [[ua, yb], [ub, yb]], [[ub, yb], [ub, ya]]]) bag.add(SC, rod(f.P(A[0], A[1], out), f.P(B[0], B[1], out), 0.035, 4));
      // the spandrels in a darker ground
      const sp = [];
      for (const [s0, s1, sg] of [[0, K / 2, -1], [K / 2, K, 1]]) for (let k = s0; k < s1; k++) { const [ua2, ya2] = pts[k], [ub2, yb2] = pts[k + 1], ue = sg < 0 ? ua : ub; void ue; q4(sp, f.P(ua2, ya2 + 0.07, out * 0.6), f.P(ub2, yb2 + 0.07, out * 0.6), f.P(ub2, yb - 0.05, out * 0.6), f.P(ua2, yb - 0.05, out * 0.6)); }
      bag.add(SW, dbl(sp.filter((v, i) => true)));
    }
  }
}
/**
 * A muqarnas dome seen from below, centre (cx, cz), springing at yb with base radius R (times
 * shape(θ) at the base, blending to a circle above), rising `rise`; ns[k] cells in tier k, each
 * a niche recessed into the tier, the tiers stepping in and up with soffits between them; outer(θ)
 * the distance to the drum wall, filled across at the springing. A gilt boss at the crown.
 */
export function muqarnasDome(bag, cx, cz, yb, R, rise, ns, outer, shape = null, o = {}) {
  const K = ns.length, cells = [[], []], soff = [], A = 4, S = 3, d = o.depth ?? Math.min(0.28, R * 0.09);
  const rad = (k) => R * Math.cos(Math.PI / 2 * Math.min(1, k / K)), hy = (k) => yb + rise * Math.sin(Math.PI / 2 * Math.min(1, k / K));
  const sh = (th, k) => (shape ? shape(th) * (1 - k / K) + k / K : 1);
  const bump = (th, n, ph) => Math.abs(Math.sin((th - ph) * n / 2));
  const P = (th, r, y) => [cx + Math.cos(th) * r, y, cz + Math.sin(th) * r];
  for (let k = 0; k < K; k++) {
    const n = ns[k], ph = (k % 2) * Math.PI / n, M = n * A, r0 = rad(k), r1 = rad(k + 1), y0 = hy(k), y1 = hy(k + 1), dk = d * (k === K - 1 ? 0.6 : 1);
    const at = (j, s) => { const th = j / M * Math.PI * 2; return P(th, Math.max(0.001, (r0 + (r1 - r0) * s) * sh(th, k + s) + dk * Math.pow(1 - s, 1.4) * bump(th, n, ph)), y0 + (y1 - y0) * (1 - Math.pow(1 - s, 1.6))); };
    for (let j = 0; j < M; j++) for (let i = 0; i < S; i++) q4(cells[k % 2], at(j, i / S), at(j + 1, i / S), at(j + 1, (i + 1) / S), at(j, (i + 1) / S));
    // the soffit at the tier's foot, from the tier below (or the drum) out to the niches' heads
    const inner = (th) => (k === 0 ? outer(th) : r0 * sh(th, k));
    const Mb = k === 0 ? Math.max(M, 128) : M;
    for (let j = 0; j < Mb; j++) {
      const t0 = j / Mb * Math.PI * 2, t1 = (j + 1) / Mb * Math.PI * 2;
      const e0 = r0 * sh(t0, k) + dk * bump(t0, n, ph), e1 = r0 * sh(t1, k) + dk * bump(t1, n, ph);
      q4(soff, P(t0, inner(t0), y0), P(t1, inner(t1), y0), P(t1, e1, y0), P(t0, e0, y0));
    }
    // pendants: small prisms hanging at the cells' meeting points
    if (k > 0 && k < K - 1 && o.pendants !== false) for (let c = 0; c < n; c++) {
      const th = ph + c / n * Math.PI * 2, rr = r0 * sh(th, k), w = Math.min(0.05, rr * Math.PI / n * 0.25);
      bag.add(o.pendant ?? SC, place(box(-0.04, -0.16, -w, 0.02, 0, w), cx + Math.cos(th) * (rr - 0.02), y0, cz + Math.sin(th) * (rr - 0.02), -th));
    }
  }
  bag.add(o.mats?.[0] ?? SC, dbl(cells[0])); bag.add(o.mats?.[1] ?? SC, dbl(cells[1])); bag.add(o.soffit ?? SW, dbl(soff));
  bag.add(o.gilt ?? 'gilt_bronze', lathe([[0.001, 0.02], [0.14, -0.02], [0.08, -0.12], [0.001, -0.16]], 8, null, cx, yb + rise - 0.01, cz));
}
/** The rays from (cx, cz) at angle th meet the square of half size h at this distance. */
export const sqR = (th, h) => h / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
const octR = (th, a) => { const q = Math.PI / 4, s = ((((th + Math.PI / 8) % q) + q) % q) - Math.PI / 8; return a / Math.cos(s); };
/**
 * A square bay of half size h at (cx, cz) turned into an octagon by stepped squinches (yS to yO),
 * the octagonal drum with `win` windows on each side (yO to yD), and the muqarnas dome over it.
 */
export function cupola(bag, cx, cz, h0, yS, yO, yD, rise, ns, win = 2, o = {}) {
  const h = h0 - 0.03, cut = h - h * Math.tan(Math.PI / 8), tiers = 4, sq = [], vf = [];
  const sOf = (i) => (i >= tiers ? cut : cut * (i + 0.6) / (tiers + 0.6)), yOf = (i) => yS + (yO - yS) * i / tiers;
  for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
    const C = [cx + sx * h, cz + sz * h], E = (s, y) => [[C[0] - sx * s, y, C[1]], [C[0], y, C[1] - sz * s]];
    { const [a, b] = E(sOf(0), yS); sq.push(C[0], yS, C[1], ...a, ...b); }
    for (let i = 0; i < tiers; i++) {
      const ya = yOf(i), yb2 = yOf(i + 1), [a, b] = E(sOf(i), ya), [a2, b2] = E(sOf(i), yb2), [a1, b1] = E(sOf(i + 1), yb2);
      // the step's face, then the soffit stepping out to the next
      q4(vf, a, b, b2, a2); q4(sq, a2, b2, b1, a1);
      const s0 = sOf(i), m = [(a[0] + b[0]) / 2, (a[2] + b[2]) / 2], dir = Math.atan2(cz - m[1], cx - m[0]), w = s0 * 0.3;
      if (w > 0.1) bag.add('opening', place(box(-0.004, ya + (yb2 - ya) * 0.12, -w, 0.006, ya + (yb2 - ya) * 0.75, w), m[0] + Math.cos(dir) * 0.006, 0, m[1] + Math.sin(dir) * 0.006, -dir));
    }
  }
  bag.add(SW, dbl(sq)); bag.add(SC, dbl(vf));
  // the drum: the octagon's eight faces, windows of pierced stucco (light behind) in each
  const oct = [];
  for (let k = 0; k < 8; k++) {
    const a0 = Math.PI / 8 + k * Math.PI / 4, a1 = a0 + Math.PI / 4, ro = h / Math.cos(Math.PI / 8);
    const p0 = [cx + Math.cos(a0) * ro, cz + Math.sin(a0) * ro], p1 = [cx + Math.cos(a1) * ro, cz + Math.sin(a1) * ro];
    q4(oct, [p0[0], yO, p0[1]], [p1[0], yO, p1[1]], [p1[0], yD, p1[1]], [p0[0], yD, p0[1]]);
    const am = a0 + Math.PI / 8, side = 2 * h * Math.tan(Math.PI / 8);
    for (let i = 0; i < win; i++) {
      const t = (i + 0.5) / win - 0.5, w = Math.min(0.28, side / win * 0.3), mx = cx + Math.cos(am) * (h - 0.01) - Math.sin(am) * t * side, mz = cz + Math.sin(am) * (h - 0.01) + Math.cos(am) * t * side;
      const wy0 = yO + (yD - yO) * 0.22, wy1 = yO + (yD - yO) * 0.8;
      bag.add('daylight', place(box(-0.01, wy0, -w, 0.0, wy1, w), mx, 0, mz, -am));
      bag.add(SW, place(box(-0.03, wy0 - 0.06, -w - 0.06, -0.005, wy0, w + 0.06), mx, 0, mz, -am));
      bag.add(SW, place(box(-0.03, wy1, -w - 0.06, -0.005, wy1 + 0.06, w + 0.06), mx, 0, mz, -am));
    }
  }
  bag.add(SC, dbl(oct));
  muqarnasDome(bag, cx, cz, yD, h - (o.depth ?? Math.min(0.28, h * 0.09)) - 0.03, rise, ns, (th) => octR(th, h), null, o);
}
/** The polar outline of an eight-pointed star of two squares of half size s. */
export const starR = (th, s) => Math.max(sqR(th, s), sqR(th - Math.PI / 4, s));
/**
 * The star dome of the Abencerrajes over a square of half h at (cx, cz): at yS a ceiling from the
 * square in to the star of two squares (half s), the sixteen faces of the star's drum up to yD, a
 * window in each, the muqarnas dome springing from the star.
 */
export function starDome(bag, cx, cz, h, s, yS, yD, rise, ns) {
  const vs = [], ang = []; for (let k = 0; k < 16; k++) ang.push(k * Math.PI / 8);
  for (const c of [1, 3, 5, 7]) ang.push(c * Math.PI / 4);
  ang.sort((a, b) => a - b);
  const P = (th, r, y) => [cx + Math.cos(th) * r, y, cz + Math.sin(th) * r], fill = [], drum = [];
  for (let i = 0; i < ang.length; i++) { const a0 = ang[i], a1 = i + 1 < ang.length ? ang[i + 1] : ang[0] + Math.PI * 2; q4(fill, P(a0, sqR(a0, h), yS), P(a1, sqR(a1, h), yS), P(a1, starR(a1, s), yS), P(a0, starR(a0, s), yS)); }
  for (let k = 0; k < 16; k++) {
    const a0 = k * Math.PI / 8, a1 = (k + 1) * Math.PI / 8, p0 = P(a0, starR(a0, s), 0), p1 = P(a1, starR(a1, s), 0);
    q4(drum, [p0[0], yS, p0[2]], [p1[0], yS, p1[2]], [p1[0], yD, p1[2]], [p0[0], yD, p0[2]]);
    const mx = (p0[0] + p1[0]) / 2, mz = (p0[2] + p1[2]) / 2, L = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]), dir = Math.atan2(p1[2] - p0[2], p1[0] - p0[0]);
    let nx = -(p1[2] - p0[2]) / L, nz = (p1[0] - p0[0]) / L; if (nx * (cx - mx) + nz * (cz - mz) < 0) { nx = -nx; nz = -nz; }
    const w = Math.min(0.24, L * 0.18), wy0 = yS + (yD - yS) * 0.25, wy1 = yS + (yD - yS) * 0.78;
    const g = box(-w, wy0, -0.005, w, wy1, 0.005); g.rotateY(-dir); g.translate(mx + nx * 0.008, 0, mz + nz * 0.008); bag.add('daylight', g);
    const fr = box(-w - 0.06, wy0 - 0.06, -0.012, w + 0.06, wy0, 0.012); fr.rotateY(-dir); fr.translate(mx + nx * 0.02, 0, mz + nz * 0.02); bag.add(SW, fr);
    vs.push([mx, mz]);
  }
  bag.add(SW, dbl(fill)); bag.add(SC, dbl(drum));
  const d = 0.26, R = s * 1.08 - d - 0.03;
  muqarnasDome(bag, cx, cz, yD, R, rise, ns, (th) => starR(th, s), (th) => (starR(th, s) - d - 0.03) / R, { depth: d });
}

/** A 12-pointed star as a band (w wide) on the plane O + U·a + V·b, lifted e along N; centre boss. */
function starBand(out, O, U, V, N, a, b, Ro, w, e) {
  const n = 12, Ri = Ro * 0.62, pt = (k, rr) => { const t = Math.PI * k / n + Math.PI / 2, x = a + Math.cos(t) * rr, y = b + Math.sin(t) * rr; return [0, 1, 2].map((i) => O[i] + U[i] * x + V[i] * y + N[i] * e); };
  for (let k = 0; k < 2 * n; k++) { const r0 = k % 2 ? Ri : Ro, r1 = (k + 1) % 2 ? Ri : Ro; q4(out, pt(k, r0), pt(k + 1, r1), pt(k + 1, r1 - w), pt(k, r0 - w)); }
}
/**
 * The wooden ceiling of the Hall of the Ambassadors over the square [x0, z0, x1, z1] from yc: four
 * coved faces of cedar in three slopes rising to a small square lantern with a muqarnas cupola; the
 * faces covered in rows of twelve-pointed stars (seven rows, the seven heavens), the hips ribbed.
 */
export function starCeiling(bag, r, yc) {
  const [x0, z0, x1, z1] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, h0 = (x1 - x0) / 2;
  const prof = [[h0, 0], [h0 * 0.86, 1.8], [h0 * 0.6, 3.6], [h0 * 0.25, 4.8]], rows = [2, 3, 2];
  const wood = [], inlay = [], gilt = [], ribs = [];
  for (let f = 0; f < 4; f++) {
    const a = f * Math.PI / 2, ux = -Math.sin(a), uz = Math.cos(a), nx = -Math.cos(a), nz = -Math.sin(a);   // along the face, into the room
    const W = (d, along, y) => [cx + Math.cos(a) * d + ux * along, yc + y, cz + Math.sin(a) * d + uz * along];
    for (let s = 0; s + 1 < prof.length; s++) {
      const [d0, y0] = prof[s], [d1, y1] = prof[s + 1];
      q4(wood, W(d0, -d0, y0), W(d0, d0, y0), W(d1, d1, y1), W(d1, -d1, y1));
      // rows of stars on this slope: the plane's frame
      const O = W(d0, 0, y0), V0 = [W(d1, 0, y1)[0] - O[0], y1 - y0, W(d1, 0, y1)[2] - O[2]], L = Math.hypot(...V0), V = V0.map((v) => v / L), U = [ux, 0, uz];
      const Nn = [nx * Math.abs(V[1]) + 0, -Math.hypot(V[0], V[2]) * 0 - 1 * 0, nz * Math.abs(V[1])], N = (() => { const c = [U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0]]; const l = Math.hypot(...c); const m = [c[0] / l, c[1] / l, c[2] / l]; return m[1] > 0 || (m[0] * nx + m[2] * nz) < 0 ? m.map((v) => -v) : m; })();
      void Nn;
      for (let rI = 0; rI < rows[s]; rI++) {
        const t = (rI + 0.5) / rows[s], half = d0 + (d1 - d0) * t, Ro = L / rows[s] * 0.42, n = Math.max(1, Math.floor((2 * half - 0.4) / (Ro * 2.25)));
        for (let i = 0; i < n; i++) {
          const along = -half + 0.2 + (i + 0.5) * (2 * half - 0.4) / n;
          starBand(inlay, O, U, V, N, along, t * L, Ro, 0.045, 0.012);
          const c = [0, 1, 2].map((k) => O[k] + U[k] * along + V[k] * t * L + N[k] * 0.02);
          gilt.push(c);
        }
        // the lines between the rows
        const tl = rI / rows[s]; if (rI > 0) { const A = [0, 1, 2].map((k) => O[k] - U[k] * (d0 + (d1 - d0) * tl) + V[k] * tl * L + N[k] * 0.012), B = [0, 1, 2].map((k) => O[k] + U[k] * (d0 + (d1 - d0) * tl) + V[k] * tl * L + N[k] * 0.012); ribs.push([A, B, 0.025]); }
      }
      ribs.push([W(d0, -d0, y0).map((v, k) => v + [nx, 0, nz][k] * 0.01), W(d0, d0, y0).map((v, k) => v + [nx, 0, nz][k] * 0.01), 0.05]);
    }
    // the hip: a rib down the corner
    for (let s = 0; s + 1 < prof.length; s++) ribs.push([W(prof[s][0], prof[s][0], prof[s][1]).map((v, k) => v + [nx + ux * -1, 0, nz + uz * -1][k] * 0.02), W(prof[s + 1][0], prof[s + 1][0], prof[s + 1][1]).map((v, k) => v + [nx - ux, 0, nz - uz][k] * 0.02), 0.06]);
  }
  bag.add('cedar', dbl(wood)); bag.add('ivory', dbl(inlay));
  for (const c of gilt) bag.add('gilt_bronze', place(lathe([[0.001, 0], [0.07, 0.0], [0.05, -0.04], [0.001, -0.05]], 6), c[0], c[1], c[2]));
  for (const [A, B, rr] of ribs) bag.add('timber', rod(A, B, rr, 4));
  // the lantern at the top: four short walls and a small muqarnas cupola
  const ht = prof[3][0], yt = yc + prof[3][1];
  for (const [ax, az, bx, bz] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) { const t = []; q4(t, [cx + ax * ht, yt, cz + az * ht], [cx + bx * ht, yt, cz + bz * ht], [cx + bx * ht, yt + 0.5, cz + bz * ht], [cx + ax * ht, yt + 0.5, cz + az * ht]); bag.add('cedar', dbl(t)); }
  muqarnasDome(bag, cx, cz, yt + 0.5, ht - 0.12, 0.6, [12, 12, 8], (th) => sqR(th, ht), null, { mats: ['cedar', 'timber'], soffit: 'timber', depth: 0.08, pendants: false });
}
/** A barrel vault of planks along x over [x0, z0, x1, z1] springing at ys (a half ellipse of rise), its ends closed; painted (mat) or ribbed. */
export function plankVault(bag, r, ys, rise, mat = 'cedar', ribs = 'timber', axis = 'x') {
  const [x0, z0, x1, z1] = r, t = [], ends = [], N = 14;
  const alongX = axis === 'x', c = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2, hw = alongX ? (z1 - z0) / 2 : (x1 - x0) / 2, [a0, a1] = alongX ? [x0, x1] : [z0, z1];
  const P = (u, k) => { const f = Math.PI * k / N, w = c - Math.cos(f) * hw, y = ys + Math.sin(f) * rise; return alongX ? [u, y, w] : [w, y, u]; };
  for (let k = 0; k < N; k++) {
    q4(t, P(a0, k), P(a1, k), P(a1, k + 1), P(a0, k + 1));
    for (const u of [a0, a1]) ends.push(...P(u, k), ...P(u, k + 1), ...(alongX ? [u, ys, c] : [c, ys, u]));
  }
  bag.add(mat, dbl(t)); bag.add(mat, dbl(ends));
  if (!ribs) return;
  const L = a1 - a0, n = Math.max(2, Math.round(L / 0.9));
  for (let i = 0; i <= n; i++) { const u = a0 + 0.05 + (L - 0.1) * i / n; for (let k = 0; k < N; k++) { const A = P(u, k), B = P(u, k + 1); bag.add(ribs, rod(A.map((v, j) => v + (j === 1 ? -0.02 : 0)), B.map((v, j) => v + (j === 1 ? -0.02 : 0)), 0.022, 4)); } }
  for (const k of [3, 7, 11]) bag.add(ribs, rod(P(a0 + 0.05, k).map((v, j) => v + (j === 1 ? -0.025 : 0)), P(a1 - 0.05, k).map((v, j) => v + (j === 1 ? -0.025 : 0)), 0.022, 4));
}
/** A hipped roof of tiles over [x0, z0, x1, z1] from y rising h, with a timber eave under its edge. */
export function hipRoof(bag, r, y, h, eave = 0.5) {
  const [x0, z0, x1, z1] = [r[0] - eave, r[1] - eave, r[2] + eave, r[3] + eave], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = x1 - x0 >= z1 - z0, d = Math.min(x1 - x0, z1 - z0) / 2;
  const a = alongX ? [x0 + d, y + h, cz] : [cx, y + h, z0 + d], b = alongX ? [x1 - d, y + h, cz] : [cx, y + h, z1 - d];
  const c = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], t = [];
  if (alongX) { t.push(...c[0], ...a, ...b, ...c[0], ...b, ...c[1]); t.push(...c[2], ...b, ...a, ...c[2], ...a, ...c[3]); t.push(...c[3], ...a, ...c[0]); t.push(...c[1], ...b, ...c[2]); }
  else { t.push(...c[1], ...a, ...b, ...c[1], ...b, ...c[2]); t.push(...c[3], ...b, ...a, ...c[3], ...a, ...c[0]); t.push(...c[0], ...a, ...c[1]); t.push(...c[2], ...b, ...c[3]); }
  bag.add('roof_tile', dbl(t));
  bag.add('timber', box(x0, y - 0.18, z0, x1, y, z1));
}
/** A floor of lustre tiles: a cream field with small lapis lozenges set in it. */
export function tileFloor(bag, col, r, y) {
  bag.add('tile_cream', box(r[0], y - 0.3, r[1], r[2], y + 0.05, r[3])); if (col) col.floor(r, y + 0.05);
  for (let x = r[0] + 0.5; x < r[2] - 0.3; x += 0.8) for (let z = r[1] + 0.5; z < r[3] - 0.3; z += 0.8) bag.add('glaze_lapis', place(box(-0.09, 0.05, -0.09, 0.09, 0.056, 0.09), x, y, z, Math.PI / 4));
}
/** A small round fountain flush with the floor, its jet; and a channel from it (dir [dx, dz], len). */
export function floorFountain(bag, col, x, z, y, r = 0.55, ch = null) {
  bag.add(MS, lathe([[r + 0.18, 0], [r + 0.18, 0.11], [r, 0.11], [r, 0.07], [0.001, 0.07]], 16, null, x, y, z));
  bag.add('water', disc(r, y + 0.095, 16, x, z));
  bag.add(MS, lathe([[0.06, 0], [0.04, 0.16], [0.001, 0.2]], 8, null, x, y + 0.07, z));
  bag.add('water', rod([x, y + 0.27, z], [x, y + 0.5, z], 0.012, 4));
  col.circle(x, z, r + 0.18, y, y + 0.12);
  if (!ch) return;
  const [dx, dz, L] = ch, a = [x + dx * (r + 0.17), z + dz * (r + 0.17)], b = [x + dx * L, z + dz * L];
  const lo = [Math.min(a[0], b[0]), Math.min(a[1], b[1])], hi = [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  for (const [w0, w1] of [[-0.24, -0.12], [0.12, 0.24]]) bag.add(MS, dx ? box(lo[0], y, z + w0, hi[0], y + 0.14, z + w1) : box(x + w0, y, lo[1], x + w1, y + 0.14, hi[1]));
  bag.add('water', dx ? box(lo[0], y + 0.01, z - 0.12, hi[0], y + 0.1, z + 0.12) : box(x - 0.12, y + 0.01, lo[1], x + 0.12, y + 0.1, hi[1]));
}

export function crenels(bag, r, y, mat = 'tuff_red') {
  const [x0, z0, x1, z1] = r;
  for (const [a, b, alongX] of [[x0, x1, true], [z0, z1, false]]) {
    const n = Math.floor((b - a) / 1.5);
    for (let i = 0; i < n; i += 2) { const u0 = a + i * (b - a) / n, u1 = u0 + (b - a) / n; for (const s of [0, 1]) { const q = alongX ? [u0, s ? z1 - 0.6 : z0, u1, s ? z1 : z0 + 0.6] : [s ? x1 - 0.6 : x0, u0, s ? x1 : x0 + 0.6, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.3, q[3])); } }
  }
}

/** A Nasrid column, springing at y + hc: ringed base, slender shaft, rings under the neck, the cubic capital (round below, square above). */
export function nColumn(bag, col, x, z, y, hc) {
  const s = hc - 0.62;
  bag.add(MS, lathe([[0.15, 0], [0.15, 0.08], [0.125, 0.12], [0.125, 0.16], [0.1, 0.22], [0.094, s - 0.2], [0.114, s - 0.18], [0.114, s - 0.13], [0.094, s - 0.11], [0.094, s - 0.07], [0.114, s - 0.05], [0.114, s - 0.01], [0.1, s + 0.02]], 12, null, x, y, z));
  bag.add(MS, lathe([[0.1, 0], [0.132, 0.1], [0.132, 0.2]], 12, null, x, y + s + 0.02, z));
  bag.add(MS, box(x - 0.15, y + s + 0.2, z - 0.15, x + 0.15, y + hc - 0.14, z + 0.15));
  col.circle(x, z, 0.13, y, y + hc);
}
/**
 * A run of arches from A to B (plan points) over stations st = [{ u, w }] (u along the run, w the
 * half width of the station's columns), springing at y + hc, the wall 0.5 thick up to y + top.
 * Spans under 0.8 m are solid. opts: lobed (scalloped intrados), sebka (lattice panels above the crowns), abaci.
 */
export function archRun(bag, A, B, st, y, hc, top, opts = {}) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L, th = 0.5, t2 = th / 2;
  const P = (u, yy, o) => [A[0] + ux * u + uz * o, yy, A[1] + uz * u - ux * o];
  const tri = [], grd = [], q = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
  const ys = y + hc, yt = y + top;
  const strip = (ua, ya, ub, yb) => { if (Math.abs(ub - ua) < 1e-5) return; for (const o of [-t2, t2]) q(tri, P(ua, ya, o), P(ub, yb, o), P(ub, yt, o), P(ua, yt, o)); };
  const under = (ua, ya, ub, yb) => q(tri, P(ua, ya, t2), P(ub, yb, t2), P(ub, yb, -t2), P(ua, ya, -t2));
  for (const s of st) {
    strip(s.u - s.w, ys, s.u + s.w, ys);
    if (opts.abaci !== false) bag.add(MS, (() => { const a = P(s.u - s.w - 0.03, 0, -t2 - 0.03), b = P(s.u + s.w + 0.03, 0, t2 + 0.03); return box(Math.min(a[0], b[0]), ys - 0.14, Math.min(a[2], b[2]), Math.max(a[0], b[0]), ys, Math.max(a[2], b[2])); })());
  }
  const u0 = st[0].u - st[0].w, u1 = st[st.length - 1].u + st[st.length - 1].w;
  q(tri, P(u0, ys, -t2), P(u0, ys, t2), P(u0, yt, t2), P(u0, yt, -t2)); q(tri, P(u1, ys, -t2), P(u1, ys, t2), P(u1, yt, t2), P(u1, yt, -t2));
  q(tri, P(u0, yt, -t2), P(u1, yt, -t2), P(u1, yt, t2), P(u0, yt, t2));
  const rods = [];
  for (let i = 0; i + 1 < st.length; i++) {
    const ua = st[i].u + st[i].w, ub = st[i + 1].u - st[i + 1].w, span = ub - ua;
    if (span < 0.8) { strip(ua, ys, ub, ys); under(ua, ys, ub, ys); continue; }
    const r = span / 2, uc = (ua + ub) / 2, stilt = 0.22, yc = ys + stilt, K = 16, pts = [[ua, ys]];
    for (let k = 0; k <= K; k++) { const t = Math.PI - Math.PI * k / K, rr = opts.lobed && k > 0 && k < K ? r * (1 - 0.07 * Math.abs(Math.sin(t * 4.5))) : r; pts.push([uc + Math.cos(t) * rr, yc + Math.sin(t) * rr]); }
    pts.push([ub, ys]);
    for (let k = 0; k + 1 < pts.length; k++) { strip(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]); under(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]); }
    // the archivolt: a moulding round the extrados on both faces
    for (let k = 0; k < K; k++) { const t0 = Math.PI - Math.PI * k / K, t1 = Math.PI - Math.PI * (k + 1) / K, R2 = r + 0.13; for (const o of [-t2, t2]) rods.push([P(uc + Math.cos(t0) * R2, yc + Math.sin(t0) * R2, o), P(uc + Math.cos(t1) * R2, yc + Math.sin(t1) * R2, o), 0.03]); }
    // the sebka over the crown: a lattice of rhombs in relief on a darker ground, framed
    const sy0 = yc + r + 0.24, sy1 = yt - 0.1, sa = ua + 0.04, sb = ub - 0.04;
    if (opts.sebka && sy1 - sy0 > 0.25) {
      for (const o of [-t2 - 0.008, t2 + 0.008]) q(grd, P(sa, sy0, o), P(sb, sy0, o), P(sb, sy1, o), P(sa, sy1, o));
      const m = 1.9, sp = 0.22, hh = sy1 - sy0;
      for (const sg of [1, -1]) for (let c = sa - hh / m; c < sb + hh / m; c += sp) {
        // the line y = sy0 + sg·m·(u − c) (sg −1 measured from the top), clipped to the panel
        let ga = sg > 0 ? c : c, gb = c + hh / m; ga = Math.max(ga, sa); gb = Math.min(gb, sb);
        if (gb - ga < 0.03) continue;
        const Y = (u) => sg > 0 ? sy0 + m * (u - c) : sy1 - m * (u - c);
        for (const o of [-t2, t2]) rods.push([P(ga, Y(ga), o), P(gb, Y(gb), o), 0.022]);
      }
      for (const o of [-t2, t2]) for (const [a, b] of [[[sa, sy0], [sb, sy0]], [[sb, sy0], [sb, sy1]], [[sb, sy1], [sa, sy1]], [[sa, sy1], [sa, sy0]]]) rods.push([P(a[0], a[1], o), P(b[0], b[1], o), 0.03]);
    }
  }
  bag.add('stucco_cream', dbl(tri));
  if (grd.length) bag.add('stucco_warm', dbl(grd));
  for (const [a, b, r] of rods) bag.add('stucco_cream', rod(a, b, r, 4));
}
