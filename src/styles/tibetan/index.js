// Tibetan architecture (17th c.; docs/settlements/lhasa.md §4): blocks of stone with battered walls,
// limewashed white or red, their faces cut by rows of windows in black trapezoid frames under
// pleated cloth valances (shambu) and little cornices of beam ends, crowned with the dark frieze of
// tamarisk twigs (pembe) over a white ledge and under a white coping, the Red Palace's frieze doubled
// and set with gilt roundels; gilded roofs with vase finials and victory banners (gyaltsen); round
// bastions; zigzag stairs on the faces; the inscribed stone pillars (doring) with their canopies;
// flat-roofed whitewashed houses with prayer-flag poles.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, rod } from '../../core/geom.js';
import { rectRoof } from '../ming/index.js';
import { Shape, Path, ExtrudeGeometry } from '../../core/three.js';
import '../qing/index.js';
import '../chinese/index.js';
import { makeShops } from './shops.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A one-sided quad a b c d turned to face along n (nx, nz in plan; ny optional). */
function face(bag, mat, n, a, b, c, d) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;      // (b − a) × (c − a): fromTriangles' normal
  const dot = cx * n[0] + cy * (n[2] ?? 0) + cz * n[1];
  bag.add(mat, fromTriangles(dot >= 0 ? [...a, ...b, ...c, ...a, ...c, ...d] : [...a, ...c, ...b, ...a, ...d, ...c]));
}
const SHAMBU = [['paint_blue', 'cloth_white'], ['cloth_red', 'cloth_white'], ['cloth_ochre', 'cloth_white'], ['cloth_red', 'cloth_ochre'], ['cloth_indigo', 'cloth_white'], ['paint_blue', 'cloth_white']];
/**
 * A Tibetan window on a wall face at (px, pz), u along the face (to the right seen from outside), n
 * out of it, its sill at y: the black trapezoid surround (wider at the foot, reaching below the sill),
 * the red frame with its lattice of mullions and a transom, the dark opening; above, the pleated
 * cloth valance (shambu) hanging from a cornice of two courses — a red board and a row of painted
 * beam ends under a dark sloping cap. s scales it; o.lights (1–3) widens it into a multi-light
 * window; o.k is the wall's batter (inset per metre of height): the window leans back with the face.
 */
function win(bag, [px, pz], [ux, uz], [nx, nz], y, s = 1, rand = Math.random, o = {}) {
  const k = o.k ?? 0, lights = o.lights ?? 1, n = [nx, nz];
  const P = (u, v, d) => [px + ux * u + nx * (d - k * v), y + v, pz + uz * u + nz * (d - k * v)];
  const Q = (mat, u0, v0, u1, v1, d) => face(bag, mat, n, P(u0, v0, d), P(u1, v0, d), P(u1, v1, d), P(u0, v1, d));
  const ow = 0.42 * s * (lights === 1 ? 1 : lights * 0.82), h = 1.5 * s;
  face(bag, 'lacquer_black', n, P(-ow - 0.55 * s, -0.22 * s, 0.03), P(ow + 0.55 * s, -0.22 * s, 0.03), P(ow + 0.24 * s, h + 0.06, 0.03), P(-ow - 0.24 * s, h + 0.06, 0.03));
  Q('limewash_red', -ow - 0.08, 0.04, ow + 0.08, h - 0.02, 0.05);
  Q('opening', -ow, 0.12, ow, h - 0.1, 0.065);
  const bars = lights * 3 - 1;
  for (let i = 1; i <= bars; i++) { const u = -ow + 2 * ow * i / (bars + 1); Q('limewash_red', u - 0.025, 0.12, u + 0.025, h - 0.1, 0.075); }
  Q('limewash_red', -ow, 0.6 * h - 0.025, ow, 0.6 * h + 0.025, 0.076);
  // the cornice: a red board, a row of painted beam ends standing out over the valance, a dark cap
  const vt = h + 0.12 * s, W = ow + 0.42 * s, dB = 0.27 * s;
  Q('limewash_red', -W - 0.04, vt, W + 0.04, vt + 0.1 * s, 0.1);
  Q('paint_dancheong', -W - 0.1, vt + 0.1 * s, W + 0.1, vt + 0.22 * s, dB);
  face(bag, 'paint_dancheong', [0, 0, -1], P(-W - 0.1, vt + 0.1 * s, 0.03), P(W + 0.1, vt + 0.1 * s, 0.03), P(W + 0.1, vt + 0.1 * s, dB), P(-W - 0.1, vt + 0.1 * s, dB));
  face(bag, 'lacquer_black', [nx, nz, 1], P(-W - 0.12, vt + 0.22 * s, dB + 0.02), P(W + 0.12, vt + 0.22 * s, dB + 0.02), P(W + 0.12, vt + 0.36 * s, 0.03), P(-W - 0.12, vt + 0.36 * s, 0.03));
  // the valance: a band, the pleated cloth, a stripe at its hem
  const [ca, cb] = o.cloth || SHAMBU[Math.floor(rand() * SHAMBU.length)];
  Q(ca, -W, vt - 0.07 * s, W, vt, 0.21 * s);
  const N = Math.max(3, Math.round(2 * W / 0.3)), v1 = vt - 0.07 * s, v2 = v1 - 0.27 * s, v3 = v2 - 0.06 * s;
  for (let i = 0; i < N; i++) {
    const u0 = -W + 2 * W * i / N, u1 = -W + 2 * W * (i + 1) / N, d0 = (0.17 + (i % 2) * 0.05) * s, d1 = (0.17 + ((i + 1) % 2) * 0.05) * s;
    face(bag, cb, n, P(u0, v2, d0), P(u1, v2, d1), P(u1, v1, d1), P(u0, v1, d0));
    face(bag, ca, n, P(u0, v3, d0), P(u1, v3, d1), P(u1, v2, d1), P(u0, v2, d0));
  }
}
/** The four faces of a rect, each as [start x, start z, end x, end z, nx, nz] with u to the right seen from outside. */
const FACES = (x0, z0, x1, z1) => ({ s: [x0, z1, x1, z1, 0, 1], n: [x1, z0, x0, z0, 0, -1], e: [x1, z1, x1, z0, 1, 0], w: [x0, z0, x0, z1, -1, 0] });
/**
 * Windows on the faces of a battered block whose wall runs from y0 to y1 with inset b at the top:
 * storeys of slightly varying height; columns at irregular spacing grouped into lit bays and blank
 * stretches; the lower walls nearly blind, a few slits; the windows growing larger storey by storey,
 * the top storeys densest, the odd pair joined into a two-light window. o: { from (lowest sill),
 * step, rowH, bay: [u0, u1] (fractions of the face where wide three-light windows stack in the upper
 * storeys), skip: [[xa, xb, ytop]] (no windows there below ytop: stairs in front) }.
 */
function windows(bag, rect, y0, y1, b, faces, rand, o = {}) {
  const H = y1 - y0, k = b / H, F = FACES(...rect);
  for (const f of faces) {
    const [ax, az, bx, bz, nx, nz] = F[f], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    const margin = b + 2.4, cols = [];
    for (let u = margin + rand() * 1.5; u < L - margin; u += (o.step ?? 3.1) * (0.8 + rand() * 0.55)) cols.push(u);
    const band = []; { let on = rand() < 0.7, left = 2 + Math.floor(rand() * 4); for (let i = 0; i < cols.length; i++) { band.push(on); if (--left <= 0) { on = !on; left = on ? 3 + Math.floor(rand() * 6) : 1 + Math.floor(rand() * 3); } } }
    const rows = []; for (let yy = Math.max(y0 + 3.2, o.from ?? y0); yy < y1 - 2.6; yy += (o.rowH ?? 3.3) * (0.9 + rand() * 0.25)) rows.push(yy);
    const bay = o.bay && f === 's' ? [o.bay[0] * L, o.bay[1] * L] : null;
    rows.forEach((yr, r) => {
      const fr = (yr - y0) / H, top = r === rows.length - 1, jit = (rand() - 0.5) * 0.7;
      let s = 0.62 + 0.5 * fr; if (top) s *= 1.08;
      const put = (u, yy, sc, lights = 1) => {
        const wx = ax + ux * u, wz = az + uz * u;
        if (o.skip && f === 's' && o.skip.some(([xa, xb, yt]) => wx > xa - 2 && wx < xb + 2 && yy < yt)) return;
        if (o.avoid && o.avoid.some(([xa, za, xb, zb, ya, yb]) => wx > xa && wx < xb && wz > za && wz < zb && yy + 1.6 * sc > ya && yy < yb)) return;
        const ins = b * (yy - y0) / H - 0.01;
        win(bag, [wx - nx * ins, wz - nz * ins], [ux, uz], [nx, nz], yy, sc, rand, { k, lights });
      };
      if (bay && fr > 0.5) for (let u = bay[0] + 2.5; u < bay[1] - 2.5; u += 5.2) put(u, yr, s * 1.05, 3);
      for (let i = 0; i < cols.length; i++) {
        const u = cols[i] + jit;
        if (bay && fr > 0.5 && u > bay[0] - 1 && u < bay[1] + 1) continue;
        const p = o.dense ? (band[i] ? o.dense : 0.15) : fr < 0.3 ? 0.05 : fr < 0.55 ? (band[i] ? 0.45 : 0.05) : (band[i] ? 0.9 : 0.1);
        if (rand() >= p) continue;
        const yy = yr + (rand() - 0.5) * 0.2;
        if (o.dense) { put(u, yy, o.s ?? 0.8); continue; }
        if (fr < 0.3) { put(u, yy, 0.5); continue; }
        if (fr > 0.55 && band[i] && i + 1 < cols.length && band[i + 1] && cols[i + 1] - cols[i] < 3.8 && rand() < 0.12) { put((u + cols[i + 1] + jit) / 2, yy, s, 2); i++; continue; }
        put(u, yy, s);
      }
    });
  }
}
/**
 * A victory banner (gyaltsen) standing at (x, y, z): 'gilt' — the cylinder of beaten, gilded copper
 * with its rings and skirts, the parasol and the jewel on top; 'black' — the cylinder of black cloth
 * in flounces on a pole, a gilt trident-flame over it.
 */
function gyaltsen(bag, x, y, z, kind = 'gilt', s = 1) {
  const S = (p) => p.map(([r, h]) => [r * s, h * s]);
  if (kind === 'black') {
    bag.add('timber', lathe(S([[0.07, 0], [0.06, 3.3]]), 6, null, x, y, z));
    bag.add('cloth_black', lathe(S([[0.5, 0.9], [0.55, 0.96], [0.44, 1.55], [0.52, 1.62], [0.42, 2.2], [0.48, 2.27], [0.36, 2.9], [0.12, 3.05], [0.001, 3.08]]), 10, (th, i) => (i % 2 ? 1 : 1 + 0.06 * Math.cos(th * 9)), x, y, z));
    bag.add('gilt_bronze', lathe(S([[0.08, 3.05], [0.13, 3.2], [0.05, 3.35], [0.09, 3.5], [0.001, 3.75]]), 8, null, x, y, z));
    return;
  }
  bag.add('gilt_bronze', lathe(S([[0.08, 0], [0.08, 0.45], [0.36, 0.45], [0.36, 0.58], [0.29, 0.63], [0.29, 1.45], [0.38, 1.5], [0.38, 1.62], [0.31, 1.66], [0.31, 2.15], [0.44, 2.22], [0.44, 2.3], [0.12, 2.42], [0.1, 2.6], [0.17, 2.72], [0.1, 2.88], [0.001, 3.05]]), 12, (th, i) => (i >= 5 && i <= 9 ? 1 + 0.05 * Math.cos(th * 12) : 1), x, y, z));
}
/** Gilt roundels (melong) along the frieze of a face: discs standing out of it. */
function roundels(bag, [ax, az, bx, bz, nx, nz], y, d, r, step = 3.6) {
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.floor(L / step));
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) * L / n, cx = ax + ux * u + nx * d, cz = az + uz * u + nz * d, t = [];
    for (let j = 0; j < 10; j++) {
      const a0 = j / 10 * Math.PI * 2, a1 = (j + 1) / 10 * Math.PI * 2;
      t.push(cx, y, cz, cx + ux * Math.cos(a0) * r, y + Math.sin(a0) * r, cz + uz * Math.cos(a0) * r, cx + ux * Math.cos(a1) * r, y + Math.sin(a1) * r, cz + uz * Math.cos(a1) * r);
    }
    const g = []; for (let q = 0; q < t.length; q += 9) {               // turn each triangle to face out (n)
      const e1 = [t[q + 3] - t[q], t[q + 4] - t[q + 1], t[q + 5] - t[q + 2]], e2 = [t[q + 6] - t[q], t[q + 7] - t[q + 1], t[q + 8] - t[q + 2]];
      const cxn = e1[1] * e2[2] - e1[2] * e2[1], czn = e1[0] * e2[1] - e1[1] * e2[0];
      if (cxn * nx + czn * nz >= 0) g.push(...t.slice(q, q + 9)); else g.push(...t.slice(q, q + 3), ...t.slice(q + 6, q + 9), ...t.slice(q + 3, q + 6));
    }
    bag.add('gilt_bronze', fromTriangles(g));
  }
}
/**
 * One layer (ya to yb) of a hollowed block on the rect R, its outer faces set in by iA at the foot
 * and iB at the top (the batter), cut into cells along the edges of the voids ({ r, y0, y1 }: the
 * rooms, passages and stairwells in it); the cells in a void are left out. Only the faces that
 * can be seen are made: outer faces, and faces onto a void beside, above or below. o.ci: the
 * colliders' set-in on the outer sides (null col: none); o.top / o.bottom: always close the
 * layer's top / foot. Returns the solid cells' rects at the top.
 */
function cells(bag, col, mat, R, ya, yb, iA, iB, voids, o = {}) {
  const cut = (lo, hi, vals) => [...new Set([lo, ...vals.filter((v) => v > lo + iB + 0.05 && v < hi - iB - 0.05), hi])].sort((p, q) => p - q);
  const xs = cut(R[0], R[2], voids.flatMap((v) => [v.r[0], v.r[2]])), zs = cut(R[1], R[3], voids.flatMap((v) => [v.r[1], v.r[3]]));
  const inV = (x, z, y) => voids.some((v) => x > v.r[0] && x < v.r[2] && z > v.r[1] && z < v.r[3] && y > v.y0 && y < v.y1);
  const nx = xs.length - 1, nz = zs.length - 1, ym = (ya + yb) / 2, d = iB - iA, out = [];
  const solid = (i, j) => i >= 0 && j >= 0 && i < nx && j < nz && !inV((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2, ym);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    if (!solid(i, j)) continue;
    const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2, w = i === 0, e = i === nx - 1, n = j === 0, s = j === nz - 1;
    const rr = [xs[i] + (w ? iA : 0), zs[j] + (n ? iA : 0), xs[i + 1] - (e ? iA : 0), zs[j + 1] - (s ? iA : 0)];
    bag.add(mat, frustum(rr, ya, yb, w ? d : 0, e ? d : 0, n ? d : 0, s ? d : 0, {
      noXn: !w && solid(i - 1, j), noXp: !e && solid(i + 1, j), noZn: !n && solid(i, j - 1), noZp: !s && solid(i, j + 1),
      noTop: !(o.top || inV(cx, cz, yb + 0.01)), noBottom: !(o.bottom || inV(cx, cz, ya - 0.01)),
    }));
    out.push([rr[0] + (w ? d : 0), rr[1] + (n ? d : 0), rr[2] - (e ? d : 0), rr[3] - (s ? d : 0)]);
    if (col) { const c = o.ci ?? 0; col.rect([xs[i] + (w ? c : 0), zs[j] + (n ? c : 0), xs[i + 1] - (e ? c : 0), zs[j + 1] - (s ? c : 0)], ya, yb); }
  }
  return out;
}
/**
 * dzong: a battered block { rect, y0, y1, batter, mat, split + low (the wall below `split` in `low`:
 * the Red Palace on its white base), windows ('nesw' faces), win (options for windows()), pembe
 * (frieze depth; ≥ 2.2 doubles it), gilt (roundels on the frieze), banners ('gilt' | 'black' at the
 * roof's corners), seed }. From the top: the white coping, the pembe frieze standing out of the wall,
 * the white ledge under it, the battered wall.
 */
function dzong(el, { bag, col }) {
  const rand = rng(el.seed || 1), rect = el.rect, [x0, z0, x1, z1] = rect, y0 = el.y0, y1 = el.y1, mat = el.mat || 'limewash_white';
  const pe = el.pembe ?? 1.8, cap = el.cap ?? (pe > 1 ? 0.4 : 0.3), yw = y1 - pe - cap, b = el.batter ?? (yw - y0) * 0.08;
  // el.bs: the set-in at the top of each face [w, e, n, s] (a joint between masses: its faces follow its neighbours'), else b all round
  const [bW, bE, bN, bS] = el.bs || [b, b, b, b], r1 = [x0 + bW, z0 + bN, x1 - bE, z1 - bS];
  const voids = el.voids || [], roofVoids = voids.filter((v) => v.y1 > yw);
  if (voids.length) {
    // hollowed: the block in layers split at the rooms' floors and ceilings, each layer in cells
    // round the rooms (halls, passages, stairwells), the outer faces keeping the batter
    const ins = (y) => b * (Math.min(y, yw) - y0) / (yw - y0);
    const ys = [...new Set([y0, ...(el.split > y0 + 1 && el.split < yw - 1 ? [el.split] : []), ...voids.flatMap((v) => [v.y0, v.y1]).filter((y) => y > y0 + 0.05 && y < yw - 0.05), yw])].sort((p, q) => p - q);
    for (let i = 0; i + 1 < ys.length; i++) cells(bag, col, el.split && ys[i + 1] <= el.split + 1e-6 ? (el.low || 'limewash_white') : mat, rect, ys[i], ys[i + 1], ins(ys[i]), ins(ys[i + 1]), voids, { bottom: i === 0, top: false, ci: b / 2 });
    for (const v of voids) if (v.floor !== false && v.y0 > y0) { const q = ins(v.y0); col.floor([Math.max(v.r[0], x0 + q), Math.max(v.r[1], z0 + q), Math.min(v.r[2], x1 - q), Math.min(v.r[3], z1 - q)], v.y0); }
  } else if (el.split && el.split > y0 + 1 && el.split < yw - 1) {
    const f = (el.split - y0) / (yw - y0), [w, e, n, s] = [bW * f, bE * f, bN * f, bS * f];
    bag.add(el.low || 'limewash_white', frustum(rect, y0, el.split, w, e, n, s));
    bag.add(mat, frustum([x0 + w, z0 + n, x1 - e, z1 - s], el.split, yw, bW - w, bE - e, bN - n, bS - s));
  } else bag.add(mat, frustum(rect, y0, yw, bW, bE, bN, bS));
  const grow = (r, m) => [r[0] - m, r[1] - m, r[2] + m, r[3] + m];
  const bx = (m, r, ya, yb) => bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3]));
  // (with a stairwell through the roof: the ledge and the friezes as rings round the edge, the
  // roof's fill and coping in cells round the opening)
  // (a void open to the sky that runs out through a face — a courtyard open to the street — breaks the rings there)
  const gaps = (q) => {
    const along = q[2] - q[0] >= q[3] - q[1], lo = along ? q[0] : q[1], hi = along ? q[2] : q[3], cut = [];
    for (const v of roofVoids) if (v.r[0] < q[2] && v.r[2] > q[0] && v.r[1] < q[3] && v.r[3] > q[1]) cut.push(along ? [v.r[0], v.r[2]] : [v.r[1], v.r[3]]);
    cut.sort((a, c) => a[0] - c[0]); const out = []; let a = lo;
    for (const [c0, c1] of cut) { if (c0 > a + 0.05) out.push([a, Math.min(c0, hi)]); a = Math.max(a, c1); }
    if (hi > a + 0.05) out.push([a, hi]);
    return out.map(([u0, u1]) => (along ? [u0, q[1], u1, q[3]] : [q[0], u0, q[2], u1]));
  };
  const RB = roofVoids.length ? (m, r, ya, yb) => { const d = 0.8; for (const q of [[r[0], r[1], r[2], r[1] + d], [r[0], r[3] - d, r[2], r[3]], [r[0], r[1] + d, r[0] + d, r[3] - d], [r[2] - d, r[1] + d, r[2], r[3] - d]]) for (const g of gaps(q)) bx(m, g, ya, yb); } : bx;
  if (roofVoids.length) cells(bag, col, 'limewash_white', r1, yw, y1 - cap, 0, 0, voids, { ci: 0 });
  if (pe > 0) {
    const po = pe > 1 ? 0.12 : 0.06, led = pe > 1 ? 0.2 : 0.1;
    RB('limewash_white', grow(r1, led), yw - 0.14, yw + 0.06);
    if (pe >= 2.2) {
      const m = yw + 0.06 + (pe - 0.06) * 0.42;
      RB('pembe', grow(r1, po), yw + 0.06, m - 0.12); RB('limewash_white', grow(r1, po + 0.07), m - 0.12, m + 0.12); RB('pembe', grow(r1, po), m + 0.12, y1 - cap);
      if (el.gilt) { const F = FACES(...r1), yc = (m + 0.12 + y1 - cap) / 2, rr = Math.min(0.42, (y1 - cap - m) * 0.3); for (const f of el.windows || 's') roundels(bag, F[f], yc, po + 0.025, rr); }
    } else {
      RB('pembe', grow(r1, po), yw + 0.06, y1 - cap);
      if (el.gilt) { const F = FACES(...r1), yc = (yw + y1 - cap) / 2 + 0.03, rr = Math.min(0.36, pe * 0.22); for (const f of el.windows || 's') roundels(bag, F[f], yc, po + 0.025, rr); }
    }
    if (roofVoids.length) for (const q of cells(bag, null, el.capMat || 'limewash_white', grow(r1, led), y1 - cap, y1, 0, 0, voids, { top: true })) col.floor(q, y1);
    else bx(el.capMat || 'limewash_white', grow(r1, led), y1 - cap, y1);
  } else if (roofVoids.length) { for (const q of cells(bag, null, el.capMat || mat, grow(r1, 0.12), yw, y1, 0, 0, voids, { top: true })) col.floor(q, y1); } else bx(el.capMat || mat, grow(r1, 0.12), yw, y1);
  if (!voids.length) col.rect([x0 + Math.max(0, bW) / 2, z0 + Math.max(0, bN) / 2, x1 - Math.max(0, bE) / 2, z1 - Math.max(0, bS) / 2], y0, y1);
  else if (!roofVoids.length) col.rect(r1, yw, y1);
  if (!roofVoids.length) col.floor(r1, y1);
  const avoid = [...(el.win?.avoid || []), ...voids.map((v) => [v.r[0] - 1.2, v.r[1] - 1.2, v.r[2] + 1.2, v.r[3] + 1.2, v.y0 - 1.5, v.y1 + 1.2])];
  if (el.windows) windows(bag, rect, y0, yw, b, el.windows, rand, { from: el.wy, ...(el.win || {}), avoid });
  if (el.banners) for (const [x, z] of [[r1[0], r1[1]], [r1[2], r1[1]], [r1[0], r1[3]], [r1[2], r1[3]]]) gyaltsen(bag, x + Math.sign((r1[0] + r1[2]) / 2 - x) * 0.6, y1, z + Math.sign((r1[1] + r1[3]) / 2 - z) * 0.6, el.banners, el.bannerS ?? 1);
}
/**
 * golden_roof: a gilded hip-and-gable roof { rect, y } on a short drum — red wall under a band of
 * pembe — with a gilt vase finial (ganjira) on the ridge and victory banners at the drum's corners.
 */
function goldenRoof(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, w = x1 - x0, d = z1 - z0, az = d > w;
  bag.add('limewash_red', box(x0, y, z0, x1, y + 1.3, z1)); bag.add('pembe', box(x0 - 0.08, y + 1.3, z0 - 0.08, x1 + 0.08, y + 2.2, z1 + 0.08));
  col.rect([x0, z0, x1, z1], y, y + 2.2);
  const A = (az ? d : w) / 2 + 1.2, B = (az ? w : d) / 2 + 1.2, rise = Math.min(w, d) * 0.4, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  rectRoof({ c: [cx, cz], A, B, y: y + 2.1, rise, kind: 'xieshan', sweep: 0.8, p: 1.4, alongZ: az, curl: true, mat: 'gilt_bronze', soffit: 'limewash_red' }, bag);
  const top = y + 2.1 + rise + 0.28, gs = Math.min(1.4, Math.min(w, d) / 7);
  bag.add('gilt_bronze', lathe([[0.32, 0], [0.42, 0.12], [0.3, 0.3], [0.5, 0.75], [0.52, 1.0], [0.3, 1.35], [0.18, 1.5], [0.28, 1.62], [0.12, 1.8], [0.16, 2.0], [0.06, 2.3], [0.001, 2.6]].map(([r, h]) => [r * gs, h * gs]), 12, null, cx, top, cz));
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) gyaltsen(bag, x, y + 2.2, z, 'gilt', 0.8);
}
/** round_tower: a round battered bastion { c, r, y0, y1, batter, pembe, seed } with a few windows on its outer side. */
function roundTower(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, y0 = el.y0, H = el.y1 - y0, pe = el.pembe ?? 1.2, cap = 0.4, yw = H - pe - cap, b = el.batter ?? yw * 0.1, rt = r - b, rand = rng(el.seed || 3);
  bag.add('limewash_white', lathe([[r, 0], [rt, yw], [0.001, yw]], 36, null, x, y0, z));
  bag.add('limewash_white', lathe([[rt - 0.05, yw - 0.14], [rt + 0.2, yw - 0.14], [rt + 0.2, yw + 0.06], [0.001, yw + 0.06]], 36, null, x, y0, z));
  bag.add('pembe', lathe([[rt + 0.12, yw + 0.06], [rt + 0.12, H - cap]], 36, null, x, y0, z));
  bag.add('limewash_white', lathe([[rt + 0.12, H - cap], [rt + 0.2, H - cap], [rt + 0.2, H], [0.001, H]], 36, null, x, y0, z));
  col.circle(x, z, r, y0, el.y1); col.floor([x - rt * 0.7, z - rt * 0.7, x + rt * 0.7, z + rt * 0.7], el.y1);
  const k = b / yw, a0 = el.from ?? 0.15, a1 = el.to ?? Math.PI - 0.15;
  for (let v = Math.max(4, yw * 0.45); v < yw - 2.4; v += 3.4) for (let a = a0 + rand() * 0.3; a < a1; a += 0.42 + rand() * 0.25) {
    if (rand() < 0.35) continue;
    const nx = Math.cos(a), nz = Math.sin(a), rr = r - k * v + 0.04;
    win(bag, [x + nx * rr, z + nz * rr], [nz, -nx], [nx, nz], y0 + v, 0.6 + 0.4 * v / yw, rand, { k });
  }
}
/**
 * zigzag: the stairs up the face of a terrace { x0, x1, zf (the face they lean on, they stand south
 * of it), w (width of each flight), n (flights), y1 (top), land (landing length), start ('w' | 'e':
 * the end the lowest flight starts from), bridge (how far the top landing reaches north over the
 * terrace's edge) }. The lowest flight runs outermost; each landing turns back north onto the next.
 * Treads of flagstone between white parapets; the solid stair walls whitewashed.
 */
function zigzag(el, { bag, col }) {
  // el.back: how far the topmost flight's solid runs north into the battered face it leans on (no wedge
  // of air behind it); el.base: the foot of the solid masses, below the ground
  const { x0, x1, zf, w, n, y1 } = el, land = el.land ?? 6, T = 0.45, ph = 1.0, B0 = el.base ?? 0;
  for (let k = 0; k < n; k++) {
    const zA = zf + (n - 1 - k) * w - (k === n - 1 ? el.back ?? 0 : 0.02), zB = zf + (n - k) * w, h0 = y1 * k / n, h1 = y1 * (k + 1) / n;
    const east = (k % 2 === 0) === ((el.start ?? 'w') === 'w');
    const s0 = east ? [x0, x0 + land] : [x1 - land, x1], fl = [x0 + land, x1 - land], e0 = east ? [x1 - land, x1] : [x0, x0 + land];
    const zi = zB - T;                                                             // the walking side of the parapet
    // the start landing (on the ground for the lowest flight) and the end landing
    if (k > 0) { bag.add('limewash_white', box(s0[0], B0, zA, s0[1], h0 - 0.1, zB)); bag.add('flagstone', box(s0[0], h0 - 0.1, zA, s0[1], h0, zi)); col.rect([s0[0], zA, s0[1], zB], B0, h0 - 0.3); col.floor([s0[0], zA, s0[1], zi], h0); }
    bag.add('limewash_white', box(e0[0], B0, zA, e0[1], h1 - 0.1, zB)); bag.add('flagstone', box(e0[0], h1 - 0.1, zA, e0[1], h1, zi)); col.rect([e0[0], zA, e0[1], zB], B0, h1 - 0.3); col.floor([e0[0], zA, e0[1], zi], h1);
    // the flight: steps of 0.16 m
    const ns = Math.max(1, Math.round((h1 - h0) / 0.16)), len = fl[1] - fl[0];
    // the stair's solid wall under the flight, its top following the slope; the steps on it inside the parapet
    { const ya = h0 - 0.3, yb = h1 - 0.3, [xa, xb] = east ? fl : [fl[1], fl[0]], t = [];
      const B = [[xa, B0, zA], [xb, B0, zA], [xb, B0, zB], [xa, B0, zB]], U = [[xa, ya, zA], [xb, yb, zA], [xb, yb, zB], [xa, ya, zB]];
      const q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
      q(U[0], U[1], U[2], U[3]); q(B[0], U[0], U[1], B[1]); q(B[3], U[3], U[2], B[2]); q(B[0], B[3], U[3], U[0]); q(B[1], U[1], U[2], B[2]);
      bag.add('limewash_white', fromTriangles(fixOut(t))); }
    for (let i = 0; i < ns; i++) {
      const a = east ? fl[0] + len * i / ns : fl[1] - len * (i + 1) / ns, bq = a + len / ns, yy = h0 + (h1 - h0) * (i + 1) / ns, yp = h0 + (h1 - h0) * i / ns;
      bag.add('limewash_white', box(a, yp - 0.3, zA, bq, yy - 0.08, zi)); bag.add('flagstone', box(a, yy - 0.08, zA, bq, yy, zi));
    }
    col.ramp([fl[0], zA, fl[1], zi], h0, h1, east ? 'e' : 'w'); if (k > 0) col.rect([fl[0], zA, fl[1], zB], B0, h0 - 0.3);
    // the outer parapet: along the flight and the end landing (the start landing is open to the flight below it)
    const lo = (x) => { const t = Math.max(0, Math.min(1, ((east ? x - fl[0] : fl[1] - x)) / len)); return h0 + (h1 - h0) * t; };
    const xs = east ? [fl[0], fl[1], e0[1]] : [fl[1], fl[0], e0[0]];
    const par = [];
    for (let i = 0; i + 1 < xs.length; i++) {
      const a = xs[i], c = xs[i + 1], ya = lo(a), yc = lo(c);
      const P = [[a, ya - 0.3, zi], [c, yc - 0.3, zi], [c, yc - 0.3, zB], [a, ya - 0.3, zB]], U = P.map(([px, py, pz]) => [px, py + ph + 0.3, pz]);
      const q = (p1, p2, p3, p4) => par.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
      q(U[0], U[1], U[2], U[3]); q(P[0], P[1], U[1], U[0]); q(P[3], U[3], U[2], P[2]); q(P[0], U[0], U[3], P[3]); q(P[1], P[2], U[2], U[1]);
      col.segment([a, (zi + zB) / 2], [c, (zi + zB) / 2], T, Math.min(ya, yc) - 0.3, Math.max(ya, yc) + ph);
    }
    bag.add('limewash_white', fromTriangles(fixOut(par)));
    // the end walls across the band at the outer ends of the landings
    const endX = east ? e0[1] - T : e0[0], top = k === n - 1 && el.bridge;
    { bag.add('limewash_white', box(endX, h1, zA, endX + T, h1 + ph, zi)); col.rect([endX, zA, endX + T, zi], h1 - 0.3, h1 + ph); }
    if (k > 0) { const sx = east ? s0[0] : s0[1] - T; bag.add('limewash_white', box(sx, h0, zA, sx + T, h0 + ph, zB)); col.rect([sx, zA, sx + T, zB], h0 - 0.3, h0 + ph); }
    // the top landing reaches north over the terrace's battered edge onto its roof
    if (top) { bag.add('flagstone', box(e0[0], h1 - 0.5, zf - el.bridge, e0[1], h1, zA)); col.floor([e0[0], zf - el.bridge, e0[1], zA], h1); }
  }
}
/** Turn every quad-pair triangle of a box-like prism list outward from its own prism's centre (each 30 numbers = 5 quads). */
function fixOut(t) {
  const out = [];
  for (let p = 0; p < t.length; p += 90) {
    const seg = t.slice(p, p + 90); let cx = 0, cy = 0, cz = 0; for (let i = 0; i < seg.length; i += 3) { cx += seg[i]; cy += seg[i + 1]; cz += seg[i + 2]; } const m = seg.length / 3; cx /= m; cy /= m; cz /= m;
    for (let i = 0; i < seg.length; i += 9) {
      const a = seg.slice(i, i + 3), b = seg.slice(i + 3, i + 6), c = seg.slice(i + 6, i + 9);
      const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      const mm = [(a[0] + b[0] + c[0]) / 3 - cx, (a[1] + b[1] + c[1]) / 3 - cy, (a[2] + b[2] + c[2]) / 3 - cz];
      if (nn[0] * mm[0] + nn[1] * mm[1] + nn[2] * mm[2] >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
    }
  }
  return out;
}
/**
 * doring: an inscribed stone pillar { at, y, h } — a brick-laid base, three stone steps, the tall
 * square shaft tapering a little, a stone canopy (slab and low hipped cap) and the carved finial of
 * the flaming wish-granting jewel.
 */
function doring(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 7.5;
  const sq = (m, hw, ya, yb, tw = hw) => bag.add(m, frustum([x - hw, z - hw, x + hw, z + hw], ya, yb, hw - tw, hw - tw, hw - tw, hw - tw));
  sq('brick', 2.6, y - 0.3, y + 0.3);
  sq('granite_grey', 1.8, y + 0.3, y + 0.62); sq('granite_grey', 1.4, y + 0.62, y + 0.94); sq('granite_grey', 1.0, y + 0.94, y + 1.26);
  const yb = y + 1.26, yt = yb + h;
  sq('granite_grey', 0.44, yb, yt, 0.34);
  sq('granite_grey', 0.5, yt, yt + 0.22);                                   // a collar under the canopy
  sq('granite_grey', 0.95, yt + 0.22, yt + 0.48);                           // the canopy slab
  sq('granite_grey', 0.95, yt + 0.48, yt + 1.05, 0.18);                    // its low hipped cap
  bag.add('granite_grey', lathe([[0.16, 0], [0.24, 0.12], [0.2, 0.3], [0.28, 0.5], [0.3, 0.68], [0.2, 0.9], [0.1, 1.05], [0.04, 1.25], [0.001, 1.38]], 10, null, x, yt + 1.03, z));
  col.rect([x - 2.6, z - 2.6, x + 2.6, z + 2.6], y - 0.3, y + 0.3); col.floor([x - 2.6, z - 2.6, x + 2.6, z + 2.6], y + 0.3);
  col.rect([x - 1.8, z - 1.8, x + 1.8, z + 1.8], y + 0.3, y + 1.26);
  col.rect([x - 0.5, z - 0.5, x + 0.5, z + 0.5], yb, yt + 2.4);
}
/** sangkhang: a whitewashed incense burner { at, y, rot } — a square plinth, a bulbous oven with its dark mouth, a small chimney and finial. */
function sangkhang(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, ca = Math.cos(a), sa = Math.sin(a);
  bag.add('limewash_white', box(x - 0.8, y, z - 0.8, x + 0.8, y + 0.9, z + 0.8));
  bag.add('limewash_white', lathe([[0.62, 0], [0.7, 0.35], [0.66, 0.8], [0.4, 1.15], [0.22, 1.25], [0.22, 1.6], [0.3, 1.65], [0.001, 1.72]], 14, null, x, y + 0.9, z));
  const mx = x + sa * 0.64, mz = z + ca * 0.64;
  face(bag, 'opening', [sa, ca], [mx - ca * 0.22, y + 1.15, mz + sa * 0.22], [mx + ca * 0.22, y + 1.15, mz - sa * 0.22], [mx + ca * 0.22, y + 1.55, mz - sa * 0.22], [mx - ca * 0.22, y + 1.55, mz + sa * 0.22]);
  col.rect([x - 0.8, z - 0.8, x + 0.8, z + 0.8], y, y + 2.6);
}
/** stone_heap: a heap of stones { at, y, r } piled by passers-by. */
function stoneHeap(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 1.1, rand = rng(el.seed || 9);
  bag.add('rock_boulder', lathe([[r, -0.05], [r * 0.85, 0.25], [r * 0.55, 0.55], [r * 0.2, 0.8], [0.001, 0.86]], 9, (th, i) => 1 + 0.12 * Math.sin(th * 5 + i * 1.7), x, y, z));
  for (let i = 0; i < 9; i++) { const t = rand() * 6.28, d = r * (0.5 + rand() * 0.45), s = 0.12 + rand() * 0.14; const px = x + Math.cos(t) * d, pz = z + Math.sin(t) * d, py = y + 0.62 * (1 - d / r) + 0.05; bag.add('rock_boulder', lathe([[s, -s * 0.4], [s * 1.1, 0], [s * 0.8, s * 0.5], [0.001, s * 0.7]], 6, null, px, py, pz)); }
  col.circle(x, z, r, y, y + 0.9);
}
/**
 * shol_gate: a gatehouse in Shöl's wall { c, along ('x': the wall runs along x, the passage along z;
 * 'z' the other way), w (passage), d (depth through the wall), len (along the wall), h, seed }: two
 * battered piers and the upper storey over the passage, windows facing both ways, a timber lintel.
 */
function sholGate(el, ctx) {
  const [cx, cz] = el.c, w = el.w ?? 4.5, d = el.d ?? 9, len = el.len ?? 16, h = el.h ?? 10, ax = el.along !== 'z', h1 = 4.4;
  const R = (u0, u1, v0, v1) => (ax ? [cx + u0, cz + v0, cx + u1, cz + v1] : [cx + v0, cz + u0, cx + v1, cz + u1]);
  const fw = ax ? 'ns' : 'ew', b = 0.6;
  dzong({ rect: R(-len / 2, -w / 2, -d / 2, d / 2), y0: -0.5, y1: h, batter: b, pembe: 0.9, windows: fw, win: { step: 3.0, rowH: 3.0, from: 4.6, dense: 0.8 }, seed: el.seed || 5 }, ctx);
  dzong({ rect: R(w / 2, len / 2, -d / 2, d / 2), y0: -0.5, y1: h, batter: b, pembe: 0.9, windows: fw, win: { step: 3.0, rowH: 3.0, from: 4.6, dense: 0.8 }, seed: (el.seed || 5) + 1 }, ctx);
  // the storey over the passage: set in by the piers' batter at its height
  const bi = b * (h1 + 0.5) / (h + 0.5) + 0.02;
  dzong({ rect: R(-w / 2 - 0.3, w / 2 + 0.3, -d / 2 + bi, d / 2 - bi), y0: h1, y1: h, batter: b - bi, pembe: 0.9, windows: '', seed: 3 }, ctx);
  for (const s of [-1, 1]) {
    const v = s * (d / 2 - bi + 0.02);
    ctx.bag.add('timber', box(...(ax ? [cx - w / 2 - 0.4, h1 - 0.35, cz + v - (s < 0 ? 0.3 : 0), cx + w / 2 + 0.4, h1, cz + v + (s > 0 ? 0.3 : 0)] : [cx + v - (s < 0 ? 0.3 : 0), h1 - 0.35, cz - w / 2 - 0.4, cx + v + (s > 0 ? 0.3 : 0), h1, cz + w / 2 + 0.4])));
    const nrm = ax ? [0, s] : [s, 0], u = ax ? [s, 0] : [0, -s], kk = (b - bi) / (h - 0.9 - 0.3 - h1), vi = v - s * kk * 1.6;
    win(ctx.bag, ax ? [cx, cz + vi] : [cx + vi, cz], u, nrm, h1 + 1.6, 1.0, rng(7 + s), { k: kk, lights: 2 });
  }
}
/** banner_pole: a prayer-flag pole { c, y, h }. */
function bannerPole(el, { bag }) { const [x, z] = el.c; bag.add('timber', lathe([[0.08, 0], [0.06, el.h ?? 4]], 6, null, x, el.y ?? 0, z)); bag.add('paint_blue', box(x, (el.y ?? 0) + (el.h ?? 4) - 1.6, z - 0.02, x + 0.9, (el.y ?? 0) + (el.h ?? 4) - 0.2, z + 0.02)); }
/** Prayer flags in the five colours strung from (ax, ay, az) to (ex, ey, ez), sagging a little. */
function flagString(bag, [ax, ay, az], [ex, ey, ez], sag = 0.4) {
  const FL = ['paint_blue', 'cloth_white', 'cloth_red', 'cloth_green', 'glaze_yellow'], L = Math.hypot(ex - ax, ez - az), n = Math.floor(L / 0.45);
  for (let i = 1; i < n; i++) {
    const t = i / n, px = ax + (ex - ax) * t, pz = az + (ez - az) * t, py = ay + (ey - ay) * t - Math.sin(Math.PI * t) * sag, ux = (ex - ax) / L * 0.14, uz = (ez - az) / L * 0.14;
    bag.add(FL[i % 5], fromTriangles([px - ux, py, pz - uz, px + ux, py, pz + uz, px + ux, py - 0.32, pz + uz, px - ux, py, pz - uz, px + ux, py - 0.32, pz + uz, px - ux, py - 0.32, pz - uz, px - ux, py, pz - uz, px + ux, py - 0.32, pz + uz, px + ux, py, pz + uz, px - ux, py, pz - uz, px - ux, py - 0.32, pz - uz, px + ux, py - 0.32, pz + uz]));
  }
}
/** A bundle of twigs (lapse) on a raised roof corner at (x, y, z), hung with little prayer flags in the five colours. */
function twigs(bag, x, y, z, rand) {
  const FL = ['paint_blue', 'cloth_white', 'cloth_red', 'cloth_green', 'glaze_yellow'];
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + rand(), l = 0.12 + rand() * 0.06, tx = x + Math.cos(a) * l, tz = z + Math.sin(a) * l, ty = y + 0.75 + rand() * 0.25;
    bag.add('timber', rod([x, y - 0.05, z], [tx, ty, tz], 0.015, 4));
    const ux = -Math.sin(a) * 0.09, uz = Math.cos(a) * 0.09;
    face(bag, FL[i], [Math.cos(a), Math.sin(a)], [tx - ux, ty - 0.24, tz - uz], [tx + ux, ty - 0.24, tz + uz], [tx + ux, ty - 0.04, tz + uz], [tx - ux, ty - 0.04, tz - uz]);
    face(bag, FL[i], [-Math.cos(a), -Math.sin(a)], [tx - ux, ty - 0.24, tz - uz], [tx + ux, ty - 0.24, tz + uz], [tx + ux, ty - 0.04, tz + uz], [tx - ux, ty - 0.04, tz - uz]);
  }
}
/** sang-khun: the urn-shaped whitewashed incense burner on a roof { at, y }: juniper smoulders in it at dawn; its mouth sooted. */
function sangkhun(bag, x, y, z, dir = [0, 1]) {
  bag.add('limewash_white', box(x - 0.42, y, z - 0.42, x + 0.42, y + 0.3, z + 0.42));
  bag.add('limewash_white', lathe([[0.3, 0], [0.38, 0.18], [0.4, 0.42], [0.3, 0.62], [0.2, 0.7], [0.24, 0.74], [0.001, 0.76]], 12, null, x, y + 0.3, z));
  bag.add('lacquer_black', lathe([[0.15, 0], [0.19, 0.03], [0.001, 0.035]], 10, null, x, y + 1.065, z));
  const [nx, nz] = dir, ux = -nz, uz = nx, mx = x + nx * 0.385, mz = z + nz * 0.385;
  face(bag, 'opening', dir, [mx - ux * 0.13, y + 0.52, mz - uz * 0.13], [mx + ux * 0.13, y + 0.52, mz + uz * 0.13], [mx + ux * 0.13, y + 0.78, mz + uz * 0.13], [mx - ux * 0.13, y + 0.78, mz - uz * 0.13]);
}
/**
 * tibetan_house: { rect, seed, y } — a Lhasa house round its courtyard (Tibet Heritage Fund: "all
 * three types of buildings generally have at least one courtyard"; commoners' houses "usually two
 * stories high"; the ground floor store-rooms and stables; "a gallery giving access to the rooms on
 * the upper floor"): the main range on the north facing the sun, two side ranges, the courtyard
 * closed on the street side by a lower wall with its gate. Battered whitewashed walls, black-framed
 * windows under little cornices, a narrow dark frieze; on the courtyard side of the main range an
 * upper gallery on timber posts reached by a steep ladder; flat roofs with their corners raised and
 * hung with twigs and prayer flags ("twigs decorated with prayer-flags in five colours"), the flag
 * pole, the urn of the incense burner (sang-khun); in some houses a third storey set back on the
 * main range's roof.
 */
function house(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0;
  const H = 6, b = 0.3, pe = 0.45, cap = 0.3, yw = y + H - pe - cap, k = b / (yw - y + 0.5);
  const third = W > 11 && rand() < 0.35, dn = third ? 4.3 : 3.6, dr = W > 12 ? 3.2 : 2.9, dw = 0.8;
  const C = [x0 + dr, z0 + dn, x1 - dr, z1 - dw];               // the courtyard (its south side the wall)
  // the house: one battered body hollowed by the courtyard, open to the sky and to the street side
  dzong({ rect: el.rect, y0: y - 0.5, y1: y + H, batter: b, mat: 'limewash_white', windows: '', pembe: pe, cap, seed: el.seed,
    voids: [{ r: [C[0], C[1], C[2], z1 + 1], y0: y + 0.04, y1: y + H + 1 }] }, ctx);
  bag.add('pebbles', box(C[0], y, C[1], C[2], y + 0.1, z1 - dw + 0.3));
  // the courtyard wall with its gate (set back a little from the ranges' fronts, its ends in their walls)
  const gx = (C[0] + C[2]) / 2 + (rand() - 0.5) * Math.max(0, C[2] - C[0] - 3), gw = 1.5, wh = 3.3;
  dzong({ rect: [C[0] - 0.3, z1 - dw, C[2] + 0.3, z1 - 0.2], y0: y - 0.5, y1: y + wh, batter: 0.08, pembe: 0.35, cap: 0.25, windows: '', seed: 3,
    voids: [{ r: [gx - gw / 2, z1 - dw - 1, gx + gw / 2, z1 + 1], y0: y - 0.5, y1: y + 2.25, floor: false }] }, ctx);
  doorway({ at: [gx, z1 - 0.2], n: 's', y, w: gw, h: 2.25, k: 0.08 / (wh - 0.1) }, ctx);
  // the gate's two leaves standing open against the wall's inner face
  for (const sg of [-1, 1]) { const xe = gx + sg * gw / 2; bag.add('wood_painted', box(Math.min(xe, xe - sg * 0.06), y + 0.12, z1 - dw - 0.75, Math.max(xe, xe - sg * 0.06), y + 2.2, z1 - dw - 0.04)); }
  // windows on the outer faces: the ground floor nearly blind (store-rooms), the upper floor lit; few to the north
  const F = FACES(x0, z0, x1, z1);
  for (const f of 'snew') {
    const [ax, az, bx, bz, nx, nz] = F[f], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.floor(L / 3));
    for (let s = 0; s < 2; s++) for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * L / n, wx = ax + ux * u, wz = az + uz * u;
      if (f === 's' && wx > C[0] - 0.6 && wx < C[2] + 0.6) continue;                  // the courtyard wall
      if (s === 0 ? rand() < 0.75 : f === 'n' ? rand() < 0.6 : rand() < 0.15) continue;
      const yy = y + s * 3 + (s ? 0.75 : 1.2), ins = k * (yy - y + 0.5) - 0.01;
      win(bag, [wx - nx * ins, wz - nz * ins], [ux, uz], [nx, nz], yy, s ? 0.78 : 0.5, rand, { k });
    }
  }
  // the courtyard faces (upright): store-room doors below, windows above; the main range behind its gallery
  const gd = 1.25, inner = [
    { a: [C[0], C[1]], b: [C[2], C[1]], n: [0, 1] },                                 // the main range, facing south
    { a: [C[2], C[1]], b: [C[2], C[3]], n: [-1, 0] }, { a: [C[0], C[3]], b: [C[0], C[1]], n: [1, 0] },
  ];
  for (const fc of inner) {
    const L = Math.hypot(fc.b[0] - fc.a[0], fc.b[1] - fc.a[1]), ux = (fc.b[0] - fc.a[0]) / L, uz = (fc.b[1] - fc.a[1]) / L, n = Math.max(1, Math.floor((L - 0.6) / 2.4)), main = fc.n[1] === 1;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * L / n, px = fc.a[0] + ux * u, pz = fc.a[1] + uz * u;
      if (main || i % 2 === 0) {                                                        // a door to a store-room or stable
        const P = (uu, v, d) => [px + ux * uu + fc.n[0] * d, y + v, pz + uz * uu + fc.n[1] * d];
        face(bag, 'lacquer_black', fc.n, P(-0.62, 0.1, 0.02), P(0.62, 0.1, 0.02), P(0.5, 2.15, 0.02), P(-0.5, 2.15, 0.02));
        face(bag, rand() < 0.5 ? 'opening' : 'wood_painted', fc.n, P(-0.42, 0.12, 0.07), P(0.42, 0.12, 0.07), P(0.42, 1.95, 0.07), P(-0.42, 1.95, 0.07));
      }
      if (!main || rand() < 0.9) win(bag, [px, pz], [ux, uz], fc.n, y + 3.75, main ? 0.95 : 0.8, rand, { k: 0, lights: main && n === 1 ? 2 : 1 });
    }
  }
  // the gallery along the main range's courtyard face: posts, the floor at the upper storey, a railing, the roof over it
  { const za = C[1], zb = C[1] + gd, xa = C[0] + 0.02, xb = C[2] - 0.02, np = Math.max(2, Math.round((xb - xa) / 2.1)), yf = y + 3.0, yr = y + H - 0.35;
    for (let i = 0; i <= np; i++) { const px = xa + 0.12 + (xb - xa - 0.24) * i / np; bag.add('timber', box(px - 0.1, y + 0.1, zb - 0.22, px + 0.1, yr - 0.22, zb - 0.02)); bag.add('paint_dancheong', box(px - 0.28, yr - 0.22, zb - 0.26, px + 0.28, yr - 0.08, zb + 0.02)); col.rect([px - 0.1, zb - 0.22, px + 0.1, zb - 0.02], y, yr); }
    bag.add('timber', box(xa, yf - 0.22, za, xb, yf, zb)); bag.add('planks_grey', box(xa, yf, za, xb, yf + 0.05, zb)); col.floor([xa, za, xb, zb - 0.1], yf + 0.05);
    const lx = xb - 0.95, ladder = C[3] - zb > 2.0;
    for (const [ra, rb] of ladder ? [[xa, lx - 0.05], [lx + 0.85, xb]] : [[xa, xb]]) {
      bag.add('wood_painted', box(ra, yf + 0.85, zb - 0.12, rb, yf + 0.95, zb)); bag.add('wood_painted', box(ra, yf + 0.05, zb - 0.1, rb, yf + 0.18, zb - 0.02));
      for (let px = ra + 0.2; px < rb - 0.1; px += 0.24) bag.add('wood_painted', box(px - 0.025, yf + 0.18, zb - 0.08, px + 0.025, yf + 0.85, zb - 0.04));
      col.rect([ra, zb - 0.14, rb, zb], yf, yf + 0.95);
    }
    bag.add('timber', box(xa, yr - 0.08, za, xb, yr + 0.04, zb + 0.08)); bag.add('pembe', box(xa, yr + 0.04, za, xb, y + H - 0.04, zb + 0.12));
    bag.add('paint_dancheong', box(xa, yr - 0.08, zb + 0.08, xb, yr + 0.04, zb + 0.12));
    // the steep ladder up to it at the courtyard's east end, from the ground beside the gallery
    if (ladder) skas({ rect: [lx, zb + 0.02, lx + 0.8, zb + 2.0], y0: y + 0.1, y1: yf + 0.05, up: 'n' }, ctx);
  }
  // the roof: raised corners with twigs and flags, the flag pole, the incense burner; the odd third storey
  const ri = 0.2, corners = [[x0 + ri, z0 + ri], [x1 - ri, z0 + ri], [x0 + ri, z1 - ri], [x1 - ri, z1 - ri]].map(([cx, cz]) => [cx + (cx < (x0 + x1) / 2 ? b : -b), cz + (cz < (z0 + z1) / 2 ? b : -b)]);
  for (const [cx, cz] of corners) {
    const sx = cx < (x0 + x1) / 2 ? 1 : -1, sz = cz < (z0 + z1) / 2 ? 1 : -1, r = [Math.min(cx, cx + sx * 0.75), Math.min(cz, cz + sz * 0.75), Math.max(cx, cx + sx * 0.75), Math.max(cz, cz + sz * 0.75)];
    bag.add('limewash_white', box(r[0], y + H - 0.05, r[1], r[2], y + H + 0.5, r[3])); bag.add('pembe', box(r[0] - 0.02, y + H + 0.18, r[1] - 0.02, r[2] + 0.02, y + H + 0.36, r[3] + 0.02));
    twigs(bag, (r[0] + r[2]) / 2, y + H + 0.5, (r[1] + r[3]) / 2, rand);
  }
  const pole = third ? [x0 + dr / 2 + 0.2, z1 - 2.4] : [x0 + 1.4, z0 + 1.4];
  bannerPole({ c: pole, y: y + H, h: 3.8 }, ctx);
  flagString(bag, [pole[0], y + H + 3.6, pole[1]], [x1 - 0.6, y + H + 0.9, z0 + 0.6]);
  flagString(bag, [pole[0], y + H + 3.6, pole[1]], third ? [x1 - 0.7, y + H + 0.9, z1 - 0.7] : [x0 + 0.7, y + H + 0.9, z1 - 0.7]);
  sangkhun(bag, x1 - dr / 2, y + H, z1 - 2.1, [0, 1]);
  if (third) {
    const r3 = [x0 + 1.3, z0 + 1.0, x0 + 1.3 + Math.min(W - 2.6, 5 + rand() * 3), z0 + dn - 0.3];
    dzong({ rect: r3, y0: y + H - 0.25, y1: y + H + 3, batter: 0.12, mat: 'limewash_white', windows: '', pembe: 0.4, cap: 0.25, seed: 7 }, ctx);
    const L = r3[2] - r3[0], nw = Math.max(1, Math.floor(L / 2.2));
    for (let i = 0; i < nw; i++) win(bag, [r3[0] + (i + 0.5) * L / nw, r3[3] - 0.03], [1, 0], [0, 1], y + H + 0.6, 0.9, rand, { k: 0.12 / 2.6, lights: i === Math.floor(nw / 2) && L > 5 ? 2 : 1 });
  }
}

/** A rack of woodblocks against a wall { x0, x1 (along x), z (the wall), dir (+1: facing +z), y0, y1 }: timber uprights, shelves, the blocks' ends in each bay. */
function blockRack(bag, x0, x1, z, dir, y0, y1) {
  const dep = 0.62, zb = z, zf = z + dir * dep, Z = (a, c) => [Math.min(a, c), Math.max(a, c)], nb = Math.max(1, Math.round((x1 - x0) / 0.72)), ns = Math.max(3, Math.floor((y1 - y0 - 0.2) / 0.34));
  for (let i = 0; i <= nb; i++) { const x = x0 + (x1 - x0) * i / nb, [za, zc] = Z(zb, zf); bag.add('timber', box(x - 0.04, y0, za, x + 0.04, y1, zc)); }
  for (let j = 0; j <= ns; j++) { const yy = y0 + 0.12 + (y1 - y0 - 0.2) * j / ns, [za, zc] = Z(zb, zf); bag.add('timber', box(x0, yy - 0.035, za, x1, yy, zc)); }
  // the blocks: lying on the shelves end-on, in each bay a stack a little short of the front, a few gaps
  let q = Math.floor(x0 * 13 + z * 7) >>> 0;
  for (let i = 0; i < nb; i++) for (let j = 0; j < ns; j++) {
    q = (q * 1664525 + 1013904223) >>> 0; if (q / 4294967296 < 0.08) continue;
    const xa = x0 + (x1 - x0) * i / nb + 0.06, xb = x0 + (x1 - x0) * (i + 1) / nb - 0.06, ya = y0 + 0.12 + (y1 - y0 - 0.2) * j / ns, yb = ya + (y1 - y0 - 0.2) / ns - 0.08, [za, zc] = Z(zb + dir * 0.04, zf - dir * 0.06);
    bag.add(q % 3 ? 'wood_ochre' : 'timber', box(xa, ya, za, xb, yb, zc));
    // the joints between the blocks' ends: thin dark lines across the stack
    for (let l = 1; l < 4; l++) { const yl = ya + (yb - ya) * l / 4, zl = dir > 0 ? zc : za; bag.add('lacquer_black', box(xa, yl - 0.008, Math.min(zl, zl + dir * 0.006), xb, yl + 0.008, Math.max(zl, zl + dir * 0.006))); }
  }
}
/** A printers' bench between two printers { at: [x, z], y }: a low table carrying the inked block on its sloping board, the ink pot and its pad, the stacks of blank and printed sheets; two low seats. */
function printBench(bag, col, x, z, y, rand) {
  bag.add('wood_painted', box(x - 0.25, y, z - 0.42, x + 0.25, y + 0.42, z + 0.42)); col.rect([x - 0.25, z - 0.42, x + 0.25, z + 0.42], y, y + 0.45);
  bag.add('timber', fromTriangles(orientBox([x - 0.22, y + 0.42, z - 0.36], [x + 0.22, y + 0.5, z + 0.36], 0.04)));
  bag.add('wood_ochre', box(x - 0.11, y + 0.47, z - 0.3, x + 0.11, y + 0.52, z + 0.3));                 // the block
  bag.add(rand() < 0.5 ? 'cloth_red' : 'lacquer_black', box(x - 0.1, y + 0.52, z - 0.29, x + 0.1, y + 0.523, z + 0.29));   // its inked face
  bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0.01], [0.08, 0.06], [0.06, 0.1], [0.001, 0.1]], 8, null, x + 0.55, y, z + 0.5));
  bag.add('cloth_white', box(x + 0.3, y, z - 0.75, x + 0.55, y + 0.12, z - 0.45));                   // the blank sheets
  bag.add('cloth_white', box(x - 0.56, y, z - 0.75, x - 0.3, y + 0.08 + rand() * 0.1, z - 0.45));    // the printed ones
  for (const sg of [-1, 1]) { bag.add('cloth_red', box(x + sg * 0.86 - 0.24, y, z - 0.26, x + sg * 0.86 + 0.24, y + 0.4, z + 0.26)); col.rect([x + sg * 0.86 - 0.24, z - 0.26, x + sg * 0.86 + 0.24, z + 0.26], y, y + 0.4); }
}
/** A box from a to b whose top slopes down by `drop` toward −x (the block's tilted board): triangles for fromTriangles. */
function orientBox(a, b, drop) {
  const [x0, y0, z0] = a, [x1, y1, z1] = b, t = [], q = (p, r, u, v) => t.push(...p, ...r, ...u, ...p, ...u, ...v);
  const B = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], T = [[x0, y1 - drop, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1 - drop, z1]];
  q(T[0], T[3], T[2], T[1]); q(B[0], B[1], T[1], T[0]); q(B[2], B[3], T[3], T[2]); q(B[1], B[2], T[2], T[1]); q(B[3], B[0], T[0], T[3]);
  return t;
}
/**
 * parkhang: the printing house of Shöl { rect, y, seed, benches: [[x, z], …] (on the upper floor) } —
 * founded about 1690 on the Fifth Dalai Lama's orders, "a two-story building on the southeast corner
 * of the Shol" (Treasury of Lives). A battered two-storey courtyard building, its gate through the
 * south range; on the north side of the court the ranges open on both floors behind red pillars:
 * below, the store of woodblocks in racks; above, the printing room "open to a courtyard, working by
 * sunlight", where printers sit "in pairs in low chairs, facing each other" (as at Dergé), one inking
 * the block, the other laying the paper and running the roller; racks of blocks behind them.
 */
function parkhang(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 11), y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, H = 7.6, dn = 7.5, dr = 6, ds = 5.5, f1 = y + 3.8;
  const C = [x0 + dr, z0 + dn, x1 - dr, z1 - ds], gx = (C[0] + C[2]) / 2, Lz = C[1] - 5.2;
  const b = 0.55, pe = 0.8, cap = 0.35, yw = y + H - pe - cap, k = b / (yw - y + 0.5);
  dzong({ rect: el.rect, y0: y - 0.5, y1: y + H, batter: b, mat: 'limewash_white', windows: 'nsew', pembe: pe, cap, seed: el.seed || 11,
    win: { dense: 0.75, step: 3.0, rowH: 3.8, from: y + 1.4, s: 0.78 },
    voids: [
      { r: C, y0: y + 0.04, y1: y + H + 1 },
      { r: [gx - 1.4, C[3], gx + 1.4, z1 + 1], y0: y + 0.04, y1: y + 3.0 },               // the gate passage
      { r: [C[0], Lz, C[2], C[1]], y0: y + 0.04, y1: y + 3.2 },                          // the block store
      { r: [C[0], Lz, C[2], C[1]], y0: f1, y1: y + H - 1.0 },                            // the printing room
    ] }, ctx);
  bag.add('pebbles', box(C[0], y, C[1], C[2], y + 0.1, C[3]));
  bag.add('flagstone', box(C[0], y, Lz, C[2], y + 0.1, C[1])); bag.add('flagstone', box(gx - 1.4, y, C[3], gx + 1.4, y + 0.1, z1));
  bag.add('planks_grey', box(C[0], f1, Lz, C[2], f1 + 0.06, C[1]));
  doorway({ at: [gx, z1], n: 's', y, w: 2.8, h: 3.0, k }, ctx);
  doorway({ at: [gx, C[3]], n: 'n', y, w: 2.8, h: 3.0, k: 0 }, ctx);
  // the pillars along the open fronts, below and above: red shafts, painted capitals and brackets, a beam
  const np = Math.max(3, Math.round((C[2] - C[0]) / 3.2)), pz = C[1] - 0.35;
  for (const [ya, yb] of [[y + 0.1, y + 3.2], [f1 + 0.06, y + H - 1.0]]) {
    for (let i = 1; i < np; i++) {
      const px = C[0] + (C[2] - C[0]) * i / np;
      bag.add('granite_grey', box(px - 0.22, ya, pz - 0.22, px + 0.22, ya + 0.12, pz + 0.22));
      bag.add('lacquer_red', box(px - 0.13, ya + 0.12, pz - 0.13, px + 0.13, yb - 0.55, pz + 0.13));
      bag.add('paint_dancheong', box(px - 0.2, yb - 0.55, pz - 0.2, px + 0.2, yb - 0.32, pz + 0.2));
      bag.add('paint_dancheong', frustum([px - 0.6, pz - 0.15, px + 0.6, pz + 0.15], yb - 0.32, yb - 0.12, -0.25, -0.25, 0, 0));
      col.rect([px - 0.13, pz - 0.13, px + 0.13, pz + 0.13], ya, yb);
    }
    bag.add('lacquer_red', box(C[0], yb - 0.12, pz - 0.2, C[2], yb + 0.0, pz + 0.2));
    bag.add('paint_dancheong', box(C[0], yb - 0.1, pz + 0.2, C[2], yb - 0.02, pz + 0.24));
    for (let x = C[0] + 0.4; x < C[2] - 0.2; x += 0.8) bag.add('paint_caihua', box(x - 0.06, yb - 0.12, Lz, x + 0.06, yb, pz - 0.2));
  }
  // the parapet along the printing room's open front
  for (const [ra, rb] of [[C[0], C[2] - 2.2], [C[2] - 1.1, C[2]]]) { bag.add('wood_painted', box(ra, f1 + 0.06, C[1] - 0.12, rb, f1 + 0.9, C[1] - 0.02)); col.rect([ra, C[1] - 0.12, rb, C[1] - 0.02], f1, f1 + 0.9); }
  // the racks of blocks: along the back of the store, and behind the printers
  blockRack(bag, C[0] + 0.3, C[2] - 0.3, Lz + 0.02, 1, y + 0.1, y + 3.0);
  blockRack(bag, C[0] + 0.3, C[2] - 0.3, Lz + 0.02, 1, f1 + 0.06, y + H - 1.15);
  for (const xe of [C[0] + 0.02, C[2] - 0.02]) for (const ya of [y + 0.1, f1 + 0.06]) {           // and on the end walls
    const L0 = Lz + 0.9, L1 = C[1] - 1.0, dir = xe < gx ? 1 : -1, yb = ya < f1 ? y + 3.0 : y + H - 1.15, nb = Math.round((L1 - L0) / 0.72);
    for (let i = 0; i <= nb; i++) { const z = L0 + (L1 - L0) * i / nb; bag.add('timber', box(Math.min(xe, xe + dir * 0.6), ya, z - 0.04, Math.max(xe, xe + dir * 0.6), yb, z + 0.04)); }
    for (let j = 0; j < 7; j++) { const yy = ya + 0.12 + (yb - ya - 0.2) * j / 7; bag.add('timber', box(Math.min(xe, xe + dir * 0.6), yy - 0.035, L0, Math.max(xe, xe + dir * 0.6), yy, L1)); if (j < 6) bag.add('wood_ochre', box(Math.min(xe + dir * 0.05, xe + dir * 0.52), yy, L0 + 0.08, Math.max(xe + dir * 0.05, xe + dir * 0.52), yy + (yb - ya - 0.2) / 7 - 0.08, L1 - 0.08)); }
  }
  // the printers' benches on the upper floor (the printers are placed with the town's people)
  for (const [bx, bz] of el.benches || []) printBench(bag, col, bx, bz, f1 + 0.06, rand);
  // the ladder from the court up to the printing room, at the east end
  skas({ rect: [C[2] - 1.9, C[1] + 0.05, C[2] - 1.1, C[1] + 3.9], y0: y + 0.1, y1: f1 + 0.06, up: 'n' }, ctx);
  // windows on the court's other faces
  for (const [ax, az, bx2, bz2, nx, nz] of [[C[2], C[1] + 1, C[2], C[3] - 0.5, -1, 0], [C[0], C[3] - 0.5, C[0], C[1] + 1, 1, 0], [C[0] + 0.5, C[3], C[2] - 0.5, C[3], 0, -1]]) {
    const L = Math.hypot(bx2 - ax, bz2 - az), ux = (bx2 - ax) / L, uz = (bz2 - az) / L, n = Math.floor(L / 2.8);
    for (let i = 0; i < n; i++) { const u = (i + 0.5) * L / n, px = ax + ux * u, pz = az + uz * u; if (Math.abs(px - gx) < 2.4 && nz) continue; win(bag, [px, pz], [ux, uz], [nx, nz], f1 + 0.7, 0.9, rand, { k: 0 }); }
  }
  // the roof: raised corners with twigs and flags, a pole, the incense burner
  for (const [cx, cz, sx, sz] of [[x0, z0, 1, 1], [x1, z0, -1, 1], [x0, z1, 1, -1], [x1, z1, -1, -1]]) {
    const ax = cx + sx * (b + 0.2), az = cz + sz * (b + 0.2), r = [Math.min(ax, ax + sx * 1.0), Math.min(az, az + sz * 1.0), Math.max(ax, ax + sx * 1.0), Math.max(az, az + sz * 1.0)];
    bag.add('limewash_white', box(r[0], y + H - 0.05, r[1], r[2], y + H + 0.7, r[3])); bag.add('pembe', box(r[0] - 0.02, y + H + 0.25, r[1] - 0.02, r[2] + 0.02, y + H + 0.5, r[3] + 0.02));
    twigs(bag, (r[0] + r[2]) / 2, y + H + 0.7, (r[1] + r[3]) / 2, rand);
  }
  bannerPole({ c: [x0 + 3, z0 + 3], y: y + H, h: 5 }, ctx);
  flagString(bag, [x0 + 3, y + H + 4.8, z0 + 3], [x1 - 1.2, y + H + 1.2, z0 + 1.2], 0.8);
  sangkhun(bag, x1 - 3, y + H, z1 - 2.5, [0, 1]);
}


/**
 * triple_stair: the long, steep triple stair up a battered face into the White Palace from the
 * Deyang Shar (Richardson: "entered by a long, steep, triple stair") { xf (the foot, east), xt (the
 * top, west), zc, y0, y1, w (each flight), face: [x at y0, x at y1] of the wall it climbs to }:
 * three flights side by side between whitewashed walls on a solid whitewashed base, treads of stone;
 * at the top a landing running into the wall, a porch of two red pillars under a beam of painted
 * ends and a pembe band, the door hung with a black yak-hair curtain bordered in white.
 */
function tripleStair(el, { bag, col }) {
  const { xf, xt, zc, y0, y1 } = el, w = el.w ?? 2.2, T = 0.45, n = 3, W = n * w + (n + 1) * T, z0 = zc - W / 2, run = xf - xt;
  const ns = Math.max(4, Math.round((y1 - y0) / 0.27)), ph = 1.0, land = el.land ?? 4.5, xl = xt - land;
  // the solid base under the flights, its top following the slope; the landing block at the top
  const t = [], q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
  { const ya = y0 - 0.4, yb = y1 - 0.4, B = [[xt, y0 - 1, z0], [xf, y0 - 1, z0], [xf, y0 - 1, z0 + W], [xt, y0 - 1, z0 + W]], U = [[xt, yb, z0], [xf, ya, z0], [xf, ya, z0 + W], [xt, yb, z0 + W]];
    q(U[0], U[3], U[2], U[1]); q(B[0], B[1], U[1], U[0]); q(B[3], U[3], U[2], B[2]); q(B[1], B[2], U[2], U[1]); q(B[0], U[0], U[3], B[3]); }
  bag.add('limewash_white', fromTriangles(fixOut(t)));
  bag.add('limewash_white', box(xl, y0 - 1, z0, xt, y1 - 0.1, z0 + W)); bag.add('flagstone', box(xl, y1 - 0.1, z0 + T, xt, y1, z0 + W - T));
  col.rect([xl, z0, xt, z0 + W], y0 - 1, y1 - 0.3); col.floor([xl, z0 + T, xt, z0 + W - T], y1);
  // the steps of each flight
  for (let f = 0; f < n; f++) {
    const za = z0 + T + f * (w + T), zb = za + w;
    for (let i = 0; i < ns; i++) {
      const xa = xf - run * (i + 1) / ns, xb = xf - run * i / ns, yy = y0 + (y1 - y0) * (i + 1) / ns;
      bag.add('limewash_white', box(xa, yy - 0.45, za, xb, yy - 0.07, zb)); bag.add('flagstone', box(xa - 0.03, yy - 0.07, za, xb, yy, zb));
    }
    col.ramp([xt, za, xf, zb], y0, y1, 'w');
  }
  // the four walls between and beside the flights, their tops a metre over the treads, stepped down at the foot
  const par = [];
  for (let k = 0; k <= n; k++) {
    const za = z0 + k * (w + T), zb = za + T, ya = y0 + ph, yb = y1 + ph;
    const P = [[xt, y0 - 0.4, za], [xf, y0 - 0.4, za], [xf, y0 - 0.4, zb], [xt, y0 - 0.4, zb]], U = [[xt, yb, za], [xf, ya, za], [xf, ya, zb], [xt, yb, zb]];
    const qq = (a, b, c, d) => par.push(...a, ...b, ...c, ...a, ...c, ...d);
    qq(U[0], U[3], U[2], U[1]); qq(P[0], P[1], U[1], U[0]); qq(P[3], U[3], U[2], P[2]); qq(P[1], P[2], U[2], U[1]); qq(P[0], U[0], U[3], P[3]);
    col.segment([xt, za + T / 2], [xf, za + T / 2], T, y0, yb);
    // a dark band along the top of each wall
    { const S = [], qs = (a, b, c, d) => S.push(...a, ...b, ...c, ...a, ...c, ...d), e = 0.03;
      const L = [[xt, yb - 0.02, za - e], [xf, ya - 0.02, za - e], [xf, ya - 0.02, zb + e], [xt, yb - 0.02, zb + e]], V = L.map(([x, y, z]) => [x, y + 0.1, z]);
      qs(V[0], V[3], V[2], V[1]); qs(L[0], L[1], V[1], V[0]); qs(L[3], V[3], V[2], L[2]); qs(L[1], L[2], V[2], V[1]); qs(L[0], V[0], V[3], L[3]);
      bag.add('lacquer_black', fromTriangles(fixOut(S))); }
  }
  bag.add('limewash_white', fromTriangles(fixOut(par)));
  // the porch on the landing: two pillars, a beam with painted ends, a band of pembe, a cap; the curtained door
  const xp = xl + land * 0.62, hp = 3.4, pz = [z0 + W * 0.28, z0 + W * 0.72];
  for (const z of pz) { bag.add('lacquer_red', box(xp - 0.17, y1, z - 0.17, xp + 0.17, y1 + hp, z + 0.17)); bag.add('paint_dancheong', box(xp - 0.32, y1 + hp, z - 0.5, xp + 0.32, y1 + hp + 0.2, z + 0.5)); col.rect([xp - 0.17, z - 0.17, xp + 0.17, z + 0.17], y1, y1 + hp); }
  bag.add('lacquer_red', box(xp - 0.3, y1 + hp + 0.2, z0 + 0.3, xp + 0.3, y1 + hp + 0.5, z0 + W - 0.3));
  for (let k = 0; k < 14; k++) { const z = z0 + 0.6 + (W - 1.2) * k / 13; bag.add('paint_dancheong', box(xp + 0.3, y1 + hp + 0.52, z - 0.08, xp + 0.55, y1 + hp + 0.66, z + 0.08)); }
  bag.add('lacquer_red', box(xp - 0.3, y1 + hp + 0.5, z0 + 0.3, xp + 0.3, y1 + hp + 0.7, z0 + W - 0.3));
  bag.add('pembe', box(xl, y1 + hp + 0.7, z0 + 0.1, xp + 0.62, y1 + hp + 1.5, z0 + W - 0.1));
  bag.add('limewash_white', box(xl, y1 + hp + 1.5, z0, xp + 0.75, y1 + hp + 1.75, z0 + W));
  for (const [za, zb] of [[z0 + 0.1, z0 + T + 0.1], [z0 + W - T - 0.1, z0 + W - 0.1]]) { bag.add('limewash_white', box(xl, y1, za, xp - 0.4, y1 + hp + 0.7, zb)); col.rect([xl, za, xp - 0.4, zb], y1, y1 + hp); }
  if (el.open) return;                          // the doorway itself is the wall's (a passage into the palace: doorway)
  const xd = xl + 0.5;
  bag.add('opening', box(xl, y1, zc - 1.1, xd, y1 + 2.8, zc + 1.1));
  bag.add('cloth_black', box(xd, y1 + 0.2, zc - 1.3, xd + 0.06, y1 + 3.0, zc + 1.3));
  for (const [za, zb, ya, yb] of [[zc - 1.3, zc + 1.3, y1 + 2.82, y1 + 3.0], [zc - 1.3, zc - 1.18, y1 + 0.2, y1 + 2.82], [zc + 1.18, zc + 1.3, y1 + 0.2, y1 + 2.82], [zc - 0.4, zc + 0.4, y1 + 1.3, y1 + 1.7]]) bag.add('cloth_white', box(xd + 0.06, ya, za, xd + 0.1, yb, zb));
}

/** A prism over the band u0…u1 × v0…v1 of a straight run, its foot at yb, its top following y(u): five quads (no bottom), for fixOut. */
function slopeBlock(t, P, u0, u1, v0, v1, yb, yt) {
  const A = [P(u0, v0, yb), P(u1, v0, yb), P(u1, v1, yb), P(u0, v1, yb)], U = [P(u0, v0, yt(u0)), P(u1, v0, yt(u1)), P(u1, v1, yt(u1)), P(u0, v1, yt(u0))];
  const q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
  q(U[0], U[1], U[2], U[3]); q(A[0], A[1], U[1], U[0]); q(A[3], U[3], U[2], A[2]); q(A[0], U[0], U[3], A[3]); q(A[1], A[2], U[2], U[1]);
}
/**
 * flight: a straight stone stair climbing a face or a roof { a, b: [x, z] (the middle of its foot and
 * of its head, on a line along x or z), w (the treads' width), y0, y1, base (the foot of its solid
 * mass) }: steps of about 17 cm on a solid whitewashed mass between parapets a metre high with
 * dark copings; both ends open. (The ramps up to the Deyang Shar — "two steep access ramps".)
 */
function flight(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, alongX = Math.abs(bx - ax) > Math.abs(bz - az), w = el.w ?? 3.3, T = 0.45, ph = 1.0, y0 = el.y0, y1 = el.y1;
  const L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), sg = Math.sign(alongX ? bx - ax : bz - az);
  const P = (u, v, y) => (alongX ? [ax + sg * u, y, az + v] : [ax + v, y, az + sg * u]);
  const R = (u0, u1, v0, v1) => { const p = P(u0, v0, 0), q = P(u1, v1, 0); return [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]; };
  const slope = (u) => y0 + (y1 - y0) * Math.max(0, Math.min(1, u / L)), hw = w / 2;
  const t = []; slopeBlock(t, P, 0, L, -hw, hw, el.base, (u) => slope(u) - 0.3); bag.add('limewash_white', fromTriangles(fixOut(t)));
  const ns = Math.max(2, Math.round((y1 - y0) / 0.17));
  for (let i = 0; i < ns; i++) {
    const u0 = L * i / ns, u1 = L * (i + 1) / ns, yy = y0 + (y1 - y0) * (i + 1) / ns, yp = y0 + (y1 - y0) * i / ns, r = R(u0, u1, -hw, hw);
    bag.add('limewash_white', box(r[0], yp - 0.3, r[1], r[2], yy - 0.08, r[3])); bag.add('flagstone', box(r[0], yy - 0.08, r[1], r[2], yy, r[3]));
  }
  col.ramp(R(0, L, -hw, hw), y0, y1, alongX ? (sg > 0 ? 'e' : 'w') : (sg > 0 ? 's' : 'n'));
  for (const s of [-1, 1]) {
    const v0 = s < 0 ? -hw - T : hw, v1 = v0 + T, p = [], c = [];
    slopeBlock(p, P, 0, L, v0, v1, el.base, (u) => slope(u) + ph - 0.02); bag.add('limewash_white', fromTriangles(fixOut(p)));
    // the dark coping along the parapet's top
    const e = 0.03, B = (u, y) => y, top = (u) => slope(u) + ph;
    { const A = [P(0, v0 - e, top(0) - 0.1), P(L, v0 - e, top(L) - 0.1), P(L, v1 + e, top(L) - 0.1), P(0, v1 + e, top(0) - 0.1)], U = A.map(([x, y, z]) => [x, y + 0.1, z]);
      const q = (a, b2, cc, d) => c.push(...a, ...b2, ...cc, ...a, ...cc, ...d); q(U[0], U[1], U[2], U[3]); q(A[0], A[1], U[1], U[0]); q(A[3], U[3], U[2], A[2]); q(A[0], U[0], U[3], A[3]); q(A[1], A[2], U[2], U[1]); B(0, 0);
      bag.add('lacquer_black', fromTriangles(fixOut(c))); }
    const pa = P(0, (v0 + v1) / 2, 0), pb = P(L, (v0 + v1) / 2, 0);
    col.segment([pa[0], pa[2]], [pb[0], pb[2]], T, Math.min(y0, y1) - 0.3, Math.max(y0, y1) + ph);
  }
}
/**
 * landing: a whitewashed block with a flagstone top { rect, y, base, walls: [[ax, az, bx, bz]] (parapets
 * along its edges, built inside them) }: the turns of the flights, the stair towers.
 */
function landing(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, T = 0.45, ph = 1.0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('limewash_white', box(x0, el.base, z0, x1, y - 0.1, z1)); bag.add('flagstone', box(x0, y - 0.1, z0, x1, y, z1));
  col.rect(el.rect, el.base, y); col.floor(el.rect, y);
  for (const [ax, az, bx, bz] of el.walls || []) {
    const ax2 = Math.abs(bx - ax) > Math.abs(bz - az), [lo, hi] = ax2 ? [Math.min(ax, bx), Math.max(ax, bx)] : [Math.min(az, bz), Math.max(az, bz)];
    const r = ax2 ? [lo, az < cz ? az : az - T, hi, az < cz ? az + T : az] : [ax < cx ? ax : ax - T, lo, ax < cx ? ax + T : ax, hi];
    bag.add('limewash_white', box(r[0], y, r[1], r[2], y + ph - 0.02, r[3]));
    bag.add('lacquer_black', box(r[0] - 0.03, y + ph - 0.1, r[1] - 0.03, r[2] + 0.03, y + ph, r[3] + 0.03));
    col.rect(r, y - 0.3, y + ph);
  }
}
/**
 * doorway: the frame of a doorway through a battered wall { at: [x, z] (the middle of its sill on the
 * face), n: 'n' | 'e' | 's' | 'w' (outward), y, w, h, k (the wall's set-back per metre of height) }:
 * the black trapezoid surround about the opening, red jambs and lintel standing out of it, the
 * cornice of a red board, painted beam ends and a dark cap, the pleated valance under it, and the
 * black yak-hair curtain (Bell: "the doorway covered with yak hair curtains") rolled up under the lintel.
 */
function doorway(el, { bag }) {
  const N = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[el.n], [nx, nz] = N, ux = -nz, uz = nx, [px, pz] = el.at, y = el.y, k = el.k ?? 0, w = el.w, h = el.h, hw = w / 2;
  const P = (u, v, d) => [px + ux * u + nx * (d - k * v), y + v, pz + uz * u + nz * (d - k * v)];
  const Q = (mat, u0, v0, u1, v1, d) => face(bag, mat, N, P(u0, v0, d), P(u1, v0, d), P(u1, v1, d), P(u0, v1, d));
  // the surround, left, right and over the opening
  face(bag, 'lacquer_black', N, P(-hw - 0.6, 0, 0.02), P(-hw, 0, 0.02), P(-hw, h, 0.02), P(-hw - 0.35, h, 0.02));
  face(bag, 'lacquer_black', N, P(hw, 0, 0.02), P(hw + 0.6, 0, 0.02), P(hw + 0.35, h, 0.02), P(hw, h, 0.02));
  face(bag, 'lacquer_black', N, P(-hw - 0.35, h, 0.02), P(hw + 0.35, h, 0.02), P(hw + 0.3, h + 0.35, 0.02), P(-hw - 0.3, h + 0.35, 0.02));
  // the red frame: jambs and a lintel, boxes standing out of the face
  const bxu = (mat, u0, u1, v0, v1, d0, d1) => { const a = P(u0, v0, d0), b2 = P(u1, v1, d1), lo = P(u0, v0, d0); const xs = [a[0], b2[0], P(u1, v0, d0)[0], P(u0, v1, d1)[0]], zs = [a[2], b2[2], P(u1, v0, d0)[2], P(u0, v1, d1)[2]]; bag.add(mat, box(Math.min(...xs), lo[1], Math.min(...zs), Math.max(...xs), b2[1], Math.max(...zs))); };
  bxu('lacquer_red', -hw - 0.2, -hw, 0, h, -0.15, 0.1); bxu('lacquer_red', hw, hw + 0.2, 0, h, -0.15, 0.1); bxu('lacquer_red', -hw - 0.3, hw + 0.3, h, h + 0.24, -0.15, 0.12);
  // the cornice and the valance
  const vt = h + 0.32, W = hw + 0.55;
  Q('limewash_red', -W - 0.04, vt, W + 0.04, vt + 0.12, 0.13);
  Q('paint_dancheong', -W - 0.1, vt + 0.12, W + 0.1, vt + 0.27, 0.34);
  face(bag, 'paint_dancheong', [0, 0, -1], P(-W - 0.1, vt + 0.12, 0.03), P(W + 0.1, vt + 0.12, 0.03), P(W + 0.1, vt + 0.12, 0.34), P(-W - 0.1, vt + 0.12, 0.34));
  face(bag, 'lacquer_black', [nx, nz, 1], P(-W - 0.12, vt + 0.27, 0.36), P(W + 0.12, vt + 0.27, 0.36), P(W + 0.12, vt + 0.45, 0.03), P(-W - 0.12, vt + 0.45, 0.03));
  Q('cloth_red', -W, vt - 0.08, W, vt, 0.26);
  const NP = Math.max(4, Math.round(2 * W / 0.3)), v1 = vt - 0.08, v2 = v1 - 0.32;
  for (let i = 0; i < NP; i++) { const u0 = -W + 2 * W * i / NP, u1 = -W + 2 * W * (i + 1) / NP, d0 = 0.2 + (i % 2) * 0.06, d1 = 0.2 + ((i + 1) % 2) * 0.06; face(bag, i % 3 ? 'cloth_white' : 'paint_blue', N, P(u0, v2, d0), P(u1, v2, d1), P(u1, v1, d1), P(u0, v1, d0)); }
  // the curtain, rolled up under the lintel, a white border showing at its ends
  const ca = P(-hw + 0.05, h - 0.22, -0.3), cb = P(hw - 0.05, h - 0.22, -0.3);
  bag.add('cloth_black', rod(ca, cb, 0.17, 10));
  for (const t of [0.04, 0.96]) { const c = [ca[0] + (cb[0] - ca[0]) * t, ca[1], ca[2] + (cb[2] - ca[2]) * t], c2 = [ca[0] + (cb[0] - ca[0]) * (t + 0.02), ca[1], ca[2] + (cb[2] - ca[2]) * (t + 0.02)]; bag.add('cloth_white', rod(c, c2, 0.175, 10)); }
}
/**
 * skas: a steep wooden stair (Tibetan buildings are climbed inside by such stairs, near ladders)
 * { rect (the flight's plan), y0, y1, up ('n' | 'e' | 's' | 'w': the way it rises), hatch: walls round
 * the opening it comes up through on the roof (all but the side one steps off) }: two heavy
 * stringers, plank treads, red handrails on posts.
 */
function skas(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0, y1 = el.y1, up = el.up, alongX = up === 'e' || up === 'w', fwd = up === 'e' || up === 's' ? 1 : -1;
  const L = alongX ? x1 - x0 : z1 - z0, W = alongX ? z1 - z0 : x1 - x0, ns = Math.max(3, Math.round((y1 - y0) / 0.24));
  // u from the foot along the flight, v across from the rect's low edge
  const P = (u, v, y) => alongX ? [fwd > 0 ? x0 + u : x1 - u, y, z0 + v] : [x0 + v, y, fwd > 0 ? z0 + u : z1 - u];
  const at = (u) => y0 + (y1 - y0) * u / L;
  for (const v of [0.05, W - 0.05]) bag.add('timber', rod(P(0, v, y0 - 0.15), P(L, v, y1 - 0.15), 0.1, 6));
  for (let i = 0; i < ns; i++) {
    const u = L * (i + 0.5) / ns, yy = y0 + (y1 - y0) * (i + 1) / ns, a = P(u - L / ns * 0.75, 0.12, yy - 0.05), b2 = P(u + L / ns * 0.25, W - 0.12, yy);
    bag.add('wood_painted', box(Math.min(a[0], b2[0]), yy - 0.05, Math.min(a[2], b2[2]), Math.max(a[0], b2[0]), yy, Math.max(a[2], b2[2])));
  }
  for (const v of [0.08, W - 0.08]) {
    bag.add('lacquer_red', rod(P(0, v, y0 + 0.95), P(L, v, y1 + 0.95), 0.035, 6));
    for (const u of [0.15, L / 2, L - 0.15]) bag.add('lacquer_red', rod(P(u, v, at(u) - 0.1), P(u, v, at(u) + 0.95), 0.03, 5));
  }
  col.ramp(el.rect, y0, y1, up);
  if (el.hatch) {
    const T = 0.3, h = 0.95, sides = { n: [x0 - T, z0 - T, x1 + T, z0], s: [x0 - T, z1, x1 + T, z1 + T], w: [x0 - T, z0, x0, z1], e: [x1, z0, x1 + T, z1] }, off = up;
    for (const [sd, r] of Object.entries(sides)) {
      if (sd === off) continue;
      bag.add('limewash_white', box(r[0], y1, r[1], r[2], y1 + h - 0.08, r[3])); bag.add('lacquer_black', box(r[0] - 0.02, y1 + h - 0.08, r[1] - 0.02, r[2] + 0.02, y1 + h, r[3] + 0.02));
      col.rect(r, y1 - 0.3, y1 + h);
    }
  }
}

/**
 * koku: the great appliqué banner hung down the palace's lower face on the day of the Golden
 * Procession (Richardson: "a great appliqué banner which covers the lower face of the Potala for a
 * space of some 75 by 40 feet", in two panels, one rather larger than the other, each a huge figure
 * among many deities and bodhisattvas) { panels: [[x0, x1], …] (the larger first), y0, y1 (its
 * foot and its top), z0, fy0, k: the wall face it lies on, at z0 where y = fy0, leaning back k per metre }. Each panel a field of indigo in
 * borders of red and ochre, the pleated valance and the pole at the top, a ground of green at the
 * foot; the seated Buddha in his aureole on a lotus throne, rows of small seated figures round him.
 */
function koku(el, { bag }) {
  const fz = (y) => el.z0 - el.k * (y - el.fy0), y0 = el.y0, y1 = el.y1, H = y1 - y0;
  const slab = (mat, shape, d, x0) => {
    const g = new ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false, curveSegments: 10 }), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const u = P.getX(i), v = P.getY(i), dz = P.getZ(i), yy = y0 + v; P.setXYZ(i, x0 + u, yy, fz(yy) + d + dz); }
    g.computeVertexNormals(); bag.add(mat, g);
  };
  const rect = (u0, v0, u1, v1) => { const s = new Shape(); s.moveTo(u0, v0); s.lineTo(u1, v0); s.lineTo(u1, v1); s.lineTo(u0, v1); s.closePath(); return s; };
  const ell = (cu, cv, ru, rv, hole = 0) => { const s = new Shape(); s.absellipse(cu, cv, ru, rv, 0, Math.PI * 2, false); if (hole) { const h = new Path(); h.absellipse(cu, cv, ru - hole, rv - hole, 0, Math.PI * 2, true); s.holes.push(h); } return s; };
  const poly = (pts) => { const s = new Shape(); s.moveTo(...pts[0]); for (const p of pts.slice(1)) s.lineTo(...p); s.closePath(); return s; };
  /** A seated figure, centred at cu, its seat at v, size h: the lotus seat, crossed legs, the robe, the head, the halo; layered from d. */
  const seatedFig = (x0, cu, v, h, robe, d, full) => {
    if (full) slab('cloth_ochre', ell(cu, v + h * 0.62, h * 0.62, h * 0.72, h * 0.07), d, x0);                   // the aureole's rim
    slab(full ? 'cloth_green' : 'cloth_ochre', ell(cu, v + h * 0.9, h * 0.2, h * 0.2), d + 0.035, x0);            // the halo
    slab(robe, poly([[cu - h * 0.42, v + h * 0.04], [cu + h * 0.42, v + h * 0.04], [cu + h * 0.36, v + h * 0.22], [cu + h * 0.2, v + h * 0.3], [cu + h * 0.21, v + h * 0.66], [cu + h * 0.1, v + h * 0.74], [cu - h * 0.1, v + h * 0.74], [cu - h * 0.21, v + h * 0.66], [cu - h * 0.2, v + h * 0.3], [cu - h * 0.36, v + h * 0.22]]), d + 0.07, x0);
    slab('paint_ochre', ell(cu, v + h * 0.88, h * 0.1, h * 0.12), d + 0.105, x0);                                  // the face, gilt
    slab('paint_ochre', ell(cu, v + h * 0.3, h * 0.08, h * 0.05), d + 0.105, x0);                                  // the hands in the lap
    if (full) slab('cloth_red', poly([[cu - h * 0.12, v + h * 0.62], [cu + h * 0.12, v + h * 0.62], [cu, v + h * 0.36]]), d + 0.105, x0);   // the robe's fold over the breast
    const np = full ? 9 : 5;                                                                                         // the lotus seat's petals
    for (let k = 0; k < np; k++) { const u = cu - h * 0.5 + h * (k + 0.5) / np; slab('cloth_white', poly([[u - h * 0.55 / np, v + h * 0.04], [u + h * 0.55 / np, v + h * 0.04], [u, v - h * 0.14]]), d + 0.07, x0); }
    slab('cloth_red', rect(cu - h * 0.5, v - h * 0.22, cu + h * 0.5, v - h * 0.13), d + 0.035, x0);
  };
  el.panels.forEach(([x0, x1], i) => {
    const W = x1 - x0, b = 0.45, ib = 0.16, robes = ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green'];
    slab('cloth_indigo', rect(0, 0, W, H - 0.6), 0.08, x0);                                                          // the field
    for (const r of [[0, 0, W, b], [0, H - 0.6 - b, W, H - 0.6], [0, b, b, H - 0.6 - b], [W - b, b, W, H - 0.6 - b]]) slab('cloth_red', rect(...r), 0.115, x0);
    for (const r of [[b, b, W - b, b + ib], [b, H - 0.6 - b - ib, W - b, H - 0.6 - b], [b, b + ib, b + ib, H - 0.6 - b - ib], [W - b - ib, b + ib, W - b, H - 0.6 - b - ib]]) slab('cloth_ochre', rect(...r), 0.115, x0);
    slab('cloth_green', rect(b + ib, b + ib, W - b - ib, b + ib + H * 0.07), 0.115, x0);                            // the ground at the foot
    // the valance across the top in pleats, and the pole it hangs from
    const N = Math.round(W / 0.4);
    for (let k = 0; k < N; k++) slab(k % 2 ? 'cloth_white' : 'cloth_red', rect(W * k / N, H - 1.5, W * (k + 1) / N, H - 0.25), 0.16 + (k % 2) * 0.035, x0);
    slab('cloth_ochre', rect(-0.1, H - 0.3, W + 0.1, H - 0.05), 0.24, x0);
    bag.add('timber', box(x0 - 0.5, y1 - 0.05, fz(y1) + 0.05, x1 + 0.5, y1 + 0.17, fz(y1) + 0.27));
    // the great figure, and the small ones in rows round him (the larger panel's figure the larger)
    const inner = W - 2 * (b + ib), gh = inner * 0.78, gv = b + ib + H * 0.11, cu = W / 2;
    seatedFig(x0, cu, gv, gh, 'cloth_red', 0.115, true);
    const sh = Math.min(1.3, inner / 4.2);
    let n = 0;
    for (let v = gv + gh * 1.36 + 0.3; v + sh < H - 1.8; v += sh * 1.3) for (let u = b + ib + sh * 0.7; u < W - b - ib - sh * 0.5; u += sh * 1.15) seatedFig(x0, u, v, sh, robes[n++ % 4], 0.115, false);
    // two attendants standing at the foot beside the throne
    for (const sg of [-1, 1]) seatedFig(x0, cu + sg * (inner / 2 - sh * 0.6), gv - gh * 0.05, sh * 1.1, robes[(n++) % 4], 0.155, false);
  });
}

/**
 * A thangka hung on a wall: { at: [x, z] (the wall face), u: [ux, uz] (along the wall, to the right seen
 * from the room), n: [nx, nz] (into the room), y (the foot of the painting), w, h, kind }: the
 * brocade mount in indigo, the red and ochre "rainbow" borders round the painting, the brocade
 * "door" below it, the painting — a deity seated on a lotus in a ring of light on a ground of
 * green hills under a blue sky — the yellow silk veil rolled up at the top with its two red
 * ribbons, the top stick and the bottom roller with its gilt knobs.
 */
function thangka(bag, el) {
  const [px, pz] = el.at, [ux, uz] = el.u, [nx, nz] = el.n, y = el.y, w = el.w, h = el.h, hw = w / 2;
  const P = (u, v, d) => [px + ux * u + nx * d, y + v, pz + uz * u + nz * d];
  const Q = (mat, u0, v0, u1, v1, d) => face(bag, mat, [nx, nz], P(u0, v0, d), P(u1, v0, d), P(u1, v1, d), P(u0, v1, d));
  const flat = (mat, shape, d) => {
    const g = new ExtrudeGeometry(shape, { depth: 0.004, bevelEnabled: false, curveSegments: 8 }), A = g.attributes.position;
    for (let i = 0; i < A.count; i++) { const q = P(A.getX(i), A.getY(i), d + A.getZ(i)); A.setXYZ(i, q[0], q[1], q[2]); }
    g.computeVertexNormals(); bag.add(mat, g);
  };
  const ell = (cu, cv, ru, rv) => { const sh = new Shape(); sh.absellipse(cu, cv, ru, rv, 0, Math.PI * 2, false); return sh; };
  const poly = (pts) => { const sh = new Shape(); sh.moveTo(...pts[0]); for (const q of pts.slice(1)) sh.lineTo(...q); sh.closePath(); return sh; };
  if (!el.mural) {
    Q('cloth_indigo', -hw - 0.24, -0.42, hw + 0.24, h + 0.62, 0.03);                         // the mount
    Q('cloth_red', -hw * 0.62, -0.38, hw * 0.62, -0.02, 0.036);                              // the "door"
    Q('cloth_ochre', -hw * 0.5, -0.3, hw * 0.5, -0.1, 0.04);
    for (const [m, e] of [['cloth_red', 0.07], ['cloth_ochre', 0.035]]) {                   // the rainbow borders
      Q(m, -hw - e, -e, hw + e, 0, 0.037 + e * 0.02); Q(m, -hw - e, h, hw + e, h + e, 0.037 + e * 0.02);
      Q(m, -hw - e, 0, -hw, h, 0.037 + e * 0.02); Q(m, hw, 0, hw + e, h, 0.037 + e * 0.02);
    }
  }
  Q('paint_blue', -hw, h * 0.32, hw, h, 0.04); Q('cloth_green', -hw, 0, hw, h * 0.32, 0.04);   // sky and hills
  const kind = el.kind ?? 0, robe = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_green'][kind % 4], fh = Math.min(w * 0.8, h * 0.62), cv = h * 0.2;
  flat('cloth_ochre', ell(0, cv + fh * 0.6, fh * 0.48, fh * 0.6), 0.06);                // the aureole
  flat(kind % 2 ? 'cloth_green' : 'cloth_red', ell(0, cv + fh * 0.88, fh * 0.2, fh * 0.2), 0.08);     // the halo
  flat(robe, poly([[-fh * 0.42, cv + fh * 0.04], [fh * 0.42, cv + fh * 0.04], [fh * 0.36, cv + fh * 0.22], [fh * 0.2, cv + fh * 0.3], [fh * 0.2, cv + fh * 0.66], [fh * 0.1, cv + fh * 0.74], [-fh * 0.1, cv + fh * 0.74], [-fh * 0.2, cv + fh * 0.66], [-fh * 0.2, cv + fh * 0.3], [-fh * 0.36, cv + fh * 0.22]]), 0.1);
  flat('paint_ochre', ell(0, cv + fh * 0.86, fh * 0.1, fh * 0.12), 0.12);                // the gilt face
  for (let k = 0; k < 7; k++) { const u = -fh * 0.5 + fh * (k + 0.5) / 7; flat('cloth_white', poly([[u - fh * 0.08, cv + fh * 0.04], [u + fh * 0.08, cv + fh * 0.04], [u, cv - fh * 0.12]]), 0.1); }
  for (const sg of [-1, 1]) flat(kind % 2 ? 'cloth_red' : 'cloth_white', ell(sg * hw * 0.68, h * 0.84, hw * 0.16, hw * 0.16), 0.06);   // two small figures in the sky
  if (el.mural) return;
  // the veil rolled at the top, its ribbons; the stick and the roller
  const t0 = P(-hw - 0.2, h + 0.5, 0.17), t1 = P(hw + 0.2, h + 0.5, 0.17);
  bag.add('cloth_ochre', rod(t0, t1, 0.07, 8));
  for (const sg of [-0.3, 0.3]) Q('cloth_red', sg * w - 0.04, h * 0.25, sg * w + 0.04, h + 0.45, 0.17);
  bag.add('timber', rod(P(-hw - 0.3, h + 0.62, 0.05), P(hw + 0.3, h + 0.62, 0.05), 0.03, 6));
  const b0 = P(-hw - 0.32, -0.45, 0.06), b1 = P(hw + 0.32, -0.45, 0.06);
  bag.add('lacquer_red', rod(b0, b1, 0.04, 8));
  for (const q of [P(-hw - 0.38, -0.45, 0.06), P(hw + 0.38, -0.45, 0.06)]) bag.add('gilt_bronze', lathe([[0.001, -0.07], [0.06, -0.04], [0.065, 0.02], [0.03, 0.07], [0.001, 0.08]], 8, null, q[0], q[1], q[2]));
}
/**
 * potala_hall: a great pillared hall inside the palace (the Great East Hall of the White Palace,
 * 27.8 × 25.8 m, where the Dalai Lamas were enthroned) { rect, y, h, nx, nz (bays), door: the side
 * of the passage it is entered by, throne: the side of the throne }: a polished floor; pillars of
 * red lacquer on stone bases under painted capitals and long splayed brackets carrying the red
 * beams, painted joists and boards over them; thangkas hung round the walls on their brocade
 * mounts; the Dalai Lama's throne of stacked cushions on its lacquered dais with its gilt back and
 * canopy; a table of butter lamps before it; the monks' long low seats in rows down the hall.
 */
function potalaHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h, yc = y + h, nxb = el.nx ?? 7, nzb = el.nz ?? 7, W = x1 - x0, D = z1 - z0;
  bag.add('lacquer_chestnut', box(x0, y, z0, x1, y + 0.03, z1));
  const xs = [], zs = []; for (let i = 1; i < nxb; i++) xs.push(x0 + W * i / nxb); for (let j = 1; j < nzb; j++) zs.push(z0 + D * j / nzb);
  const yb = yc - 0.95;                 // the beams' underside
  for (const x of xs) for (const z of zs) {
    bag.add('granite_grey', box(x - 0.36, y + 0.03, z - 0.36, x + 0.36, y + 0.16, z + 0.36));
    bag.add('lacquer_red', lathe([[0.25, 0], [0.24, yb - 0.9 - y - 0.16], [0.26, yb - 0.9 - y - 0.12]], 12, null, x, y + 0.16, z));
    for (const v of [0.35, 0.36 + (yb - y) * 0.45]) bag.add('cloth_ochre', lathe([[0.262, 0], [0.262, 0.22]], 12, null, x, y + v, z));   // brocade bands round the shaft
    // the capital: a square block, the short bracket, the long splayed bracket along the beam
    bag.add('paint_dancheong', box(x - 0.33, yb - 0.9, z - 0.33, x + 0.33, yb - 0.55, z + 0.33));
    bag.add('lacquer_red', frustum([x - 0.45, z - 0.2, x + 0.45, z + 0.2], yb - 0.55, yb - 0.35, -0.2, -0.2, 0, 0));
    bag.add('paint_dancheong', frustum([x - 0.65, z - 0.2, x + 0.65, z + 0.2], yb - 0.35, yb, -0.55, -0.55, 0, 0));
    col.circle(x, z, 0.3, y, yb);
  }
  // the beams along x over the pillar rows, the joists across them, the boards; a painted band on the beams
  for (const z of zs) { bag.add('lacquer_red', box(x0, yb, z - 0.22, x1, yb + 0.42, z + 0.22)); bag.add('paint_dancheong', box(x0, yb + 0.1, z - 0.235, x1, yb + 0.3, z + 0.235)); }
  for (let x = x0 + 0.45; x < x1 - 0.2; x += 0.9) bag.add('paint_caihua', box(x - 0.07, yb + 0.42, z0, x + 0.07, yb + 0.58, z1));
  bag.add('ceiling_coffer', box(x0, yb + 0.58, z0, x1, yc - 0.02, z1));
  // the north and south walls painted from the dado to the beams (the thangkas hang over the paintings)
  if (el.murals !== false) { mural(bag, { a: [x0, z0], b: [x1, z0], y: y + 0.03, h: yb - y - 0.05, seed: 2 }); mural(bag, { a: [x1, z1], b: [x0, z1], y: y + 0.03, h: yb - y - 0.05, seed: 5 }); }
  // thangkas along the walls, one in each bay (not at the passage or the stair)
  const th = Math.min(2.4, yb - y - 1.9), tw = th * 0.66, skip = el.keep || [];
  const walls = [
    { a: [x0, z1], u: [1, 0], n: [0, -1], L: W, axis: 'x', c: z1, side: 's' }, { a: [x1, z0], u: [-1, 0], n: [0, 1], L: W, axis: 'x', c: z0, side: 'n' },
    { a: [x0, z0], u: [0, 1], n: [1, 0], L: D, axis: 'z', c: x0, side: 'w' }, { a: [x1, z1], u: [0, -1], n: [-1, 0], L: D, axis: 'z', c: x1, side: 'e' },
  ];
  let k = 0;
  for (const wl of walls) {
    const nb = wl.axis === 'x' ? nxb : nzb;
    for (let i = 0; i < nb; i++) {
      const u = wl.L * (i + 0.5) / nb, px = wl.a[0] + wl.u[0] * u, pz = wl.a[1] + wl.u[1] * u;
      if (wl.side === el.throne && Math.abs(i - (nb - 1) / 2) < 1) continue;
      if (skip.some(([xa, za, xb, zb]) => px > xa - tw && px < xb + tw && pz > za - tw && pz < zb + tw)) continue;
      thangka(bag, { at: [px, pz], u: wl.u, n: wl.n, y: y + 1.35, w: tw, h: th, kind: k++ });
    }
  }
  // the throne against the middle of its wall, facing into the hall
  const T = { w: [x0, (z0 + z1) / 2, 1, 0], e: [x1, (z0 + z1) / 2, -1, 0], n: [(x0 + x1) / 2, z0, 0, 1], s: [(x0 + x1) / 2, z1, 0, -1] }[el.throne || 'w'];
  const [tx, tz, fx, fz] = T, L = (a, b2, c0, c1, ya, yb2, m) => { const p = [tx + fx * a + fz * c0, tz + fz * a + fx * c0], q = [tx + fx * b2 + fz * c1, tz + fz * b2 + fx * c1]; const r = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; bag.add(m, box(r[0], ya, r[1], r[2], yb2, r[3])); return r; };
  col.rect(L(0.05, 2.4, -1.5, 1.5, y, y + 0.9, 'lacquer_red'), y, y + 2.6);
  L(0.02, 2.48, -1.58, 1.58, y + 0.9, y + 0.98, 'gilt_bronze');
  L(0.2, 2.3, -1.3, 1.3, y + 0.98, y + 1.2, 'cloth_ochre'); L(0.3, 2.2, -1.2, 1.2, y + 1.2, y + 1.42, 'cloth_red'); L(0.4, 2.1, -1.1, 1.1, y + 1.42, y + 1.62, 'cloth_ochre');
  L(0.05, 0.25, -1.4, 1.4, y + 0.98, y + 3.4, 'wood_painted'); L(0.25, 0.3, -1.2, 1.2, y + 1.62, y + 3.1, 'cloth_ochre'); L(0.04, 0.28, -1.5, 1.5, y + 3.4, y + 3.6, 'gilt_bronze');
  L(0.05, 2.7, -1.75, 1.75, yb - 0.9, yb - 0.75, 'cloth_ochre');                                          // the canopy, its valance
  for (let i = 0; i < 12; i++) { const c = -1.75 + 3.5 * i / 12; L(2.62, 2.7, c, c + 3.5 / 12, yb - 1.35, yb - 0.75, i % 2 ? 'cloth_red' : 'cloth_white'); }
  // a table of butter lamps before it, and the long low seats of the monks in rows down the hall
  const tr = L(3.0, 3.7, -1.2, 1.2, y, y + 0.75, 'wood_painted'); col.rect(tr, y, y + 0.75);
  for (let i = 0; i < 9; i++) { const c = -1.0 + 2.0 * i / 8, a = 3.35, px = tx + fx * a + fz * c, pz = tz + fz * a + fx * c; bag.add('gilt_bronze', lathe([[0.04, 0], [0.025, 0.08], [0.07, 0.14], [0.06, 0.17], [0.001, 0.17]], 8, null, px, y + 0.75, pz)); bag.add('lamp_glass', lathe([[0.001, 0], [0.02, 0.03], [0.001, 0.09]], 5, null, px, y + 0.92, pz)); }
  // (between the pillar rows, the middle aisle left clear)
  const along = fx !== 0, span = along ? W : D, lines = (along ? zs : xs).map((v) => v - (along ? tz : tx)), mid = [];
  for (let i = 0; i + 1 < lines.length; i++) if (lines[i] * lines[i + 1] > 0) mid.push((lines[i] + lines[i + 1]) / 2);
  for (const c of mid) L(4.6, span - 2.5, c - 0.42, c + 0.42, y + 0.03, y + 0.2, 'cloth_red');
}
/** mani_wheel: a hand prayer wheel held upright { at: [x, z] (the fist), y }: the wooden handle, the embossed copper drum on its pin with its cap, the weight on its chain standing out from the drum. */
function maniWheel(el, { bag }) {
  const [x, z] = el.at, y = el.y, a = el.rot ?? 0;
  bag.add('timber', lathe([[0.016, -0.16], [0.02, -0.1], [0.018, 0.04], [0.012, 0.06]], 6, null, x, y, z));
  bag.add('bronze', lathe([[0.004, 0.06], [0.04, 0.065], [0.046, 0.075], [0.046, 0.15], [0.04, 0.16], [0.012, 0.175], [0.016, 0.19], [0.001, 0.205]], 10, (th, i) => (i >= 2 && i <= 3 ? 1 + 0.04 * Math.cos(th * 8) : 1), x, y, z));
  bag.add('silver', lathe([[0.047, 0.095], [0.047, 0.125]], 10, null, x, y, z));
  const wx = x + Math.cos(a) * 0.11, wz = z + Math.sin(a) * 0.11;
  bag.add('iron', rod([x + Math.cos(a) * 0.045, y + 0.12, z + Math.sin(a) * 0.045], [wx, y + 0.1, wz], 0.003, 3));
  bag.add('bronze', lathe([[0.001, -0.015], [0.015, 0], [0.001, 0.015]], 6, null, wx, y + 0.1, wz));
}
/**
 * mural: a wall painted as the chapels' walls are (docs/settlements/lhasa.md §13) { a, b ([x, z], the
 * wall's run, the room on the left going from a to b), y, h, n (scenes) }: a red band at the foot, a
 * band of scroll pattern at the top, between them the scenes side by side — each a deity on a lotus in
 * a ring of light among green hills under a blue sky, small figures in the sky (the thangka's
 * composition painted straight on the wall).
 */
function mural(bag, el) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]];
  const y = el.y, h = el.h;
  const P = (s, v, d) => [ax + u[0] * s + n[0] * d, y + v, az + u[1] * s + n[1] * d];
  const Q = (mat, s0, v0, s1, v1, d) => face(bag, mat, n, P(s0, v0, d), P(s1, v0, d), P(s1, v1, d), P(s0, v1, d));
  Q('limewash_red', 0, 0, L, 0.9, 0.006); Q('cloth_ochre', 0, 0.9, L, 0.98, 0.008);
  Q('cloth_red', 0, h - 0.3, L, h, 0.006); Q('cloth_ochre', 0, h - 0.36, L, h - 0.3, 0.008);
  for (let i = 0; i < Math.round(L / 0.35); i++) Q(i % 2 ? 'cloth_green' : 'paint_blue', i * 0.35 + 0.05, h - 0.27, i * 0.35 + 0.3, h - 0.03, 0.01);
  // the scenes in rows, each about 1.1 m wide: a deity in its ring of light, landscape behind, small figures above
  const span = h - 0.36 - 0.98, rows = Math.max(1, Math.round(span / 1.35)), ph = span / rows, kk = el.n ?? Math.max(1, Math.round(L / 1.1)), cw = L / kk;
  for (let r = 0; r < rows; r++) for (let i = 0; i < kk; i++) thangka(bag, { at: P(cw * (i + 0.5), 0, 0).filter((_, j) => j !== 1), u, n, y: y + 0.98 + r * ph, w: cw - 0.03, h: ph - 0.03, kind: (el.seed ?? 0) + i * 3 + r * 7, mural: true });
}
/**
 * lhakhang: a chapel on the pilgrims' circuit with its great prayer wheel (a mani lhakhang) { rect, y,
 * door ('w' | 'e' | 'n' | 's') }: battered whitewashed walls under a pembe band and a white coping, a
 * Tibetan doorway; inside, a floor of polished earth, the great wheel turning on its axle from the
 * floor to the ceiling beam — a drum of red lacquer banded in gilt, rows of gilt syllables round it —
 * the walls painted with scenes, at the back the stepped altar with the gilt images and the rows of
 * butter lamps burning before them; a pillar each side of the wheel, the beams and the board ceiling.
 */
function lhakhang(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.h ?? 5.2, t = 0.9, b = H * 0.07, door = el.door ?? 'w';
  const yi = y + H - 0.55;           // the ceiling
  // the walls: each battered outside, plumb inside; the door wall in two pieces round the opening, a lintel over it
  const dw = 1.6, dh = 2.5, cxm = (x0 + x1) / 2, czm = (z0 + z1) / 2;
  const walls = { w: [x0, z0, x0 + t, z1, b, 0, b, b], e: [x1 - t, z0, x1, z1, 0, b, b, b], n: [x0, z0, x1, z0 + t, b, b, b, 0], s: [x0, z1 - t, x1, z1, b, b, 0, b] };
  for (const [side, [a0, c0, a1, c1, ixn, ixp, izn, izp]] of Object.entries(walls)) {
    if (side !== door) { bag.add('limewash_white', frustum([a0, c0, a1, c1], y - 0.3, y + H, ixn, ixp, izn, izp)); continue; }
    const alongZ = side === 'w' || side === 'e';
    const m = alongZ ? czm : cxm, lo = alongZ ? c0 : a0, hi = alongZ ? c1 : a1;
    const piece = (p0, p1, yA, yB, top) => {
      const r = alongZ ? [a0, p0, a1, p1] : [p0, c0, p1, c1], f = (yB - yA) / (H + 0.3);
      bag.add('limewash_white', frustum(r, yA, yB, ixn * f, ixp * f, izn * f, izp * f));
    };
    piece(lo, m - dw / 2, y - 0.3, y + H); piece(m + dw / 2, hi, y - 0.3, y + H);
    // the wall over the door: its foot set back by the batter already climbed, its face leaning on with the rest
    const f0 = (dh + 0.3) / (H + 0.3), f1 = (H - dh) / (H + 0.3);
    const lr = alongZ ? [a0 + ixn * f0, m - dw / 2 - 0.01, a1 - ixp * f0, m + dw / 2 + 0.01] : [m - dw / 2 - 0.01, c0 + izn * f0, m + dw / 2 + 0.01, c1 - izp * f0];
    bag.add('limewash_white', frustum(lr, y + dh, y + H, alongZ ? ixn * f1 : 0, alongZ ? ixp * f1 : 0, alongZ ? 0 : izn * f1, alongZ ? 0 : izp * f1));
    const N = side, at = side === 'w' ? [x0, czm] : side === 'e' ? [x1, czm] : side === 'n' ? [cxm, z0] : [cxm, z1];
    doorway({ at, n: N, y, w: dw, h: dh, k: b / H }, { bag });
  }
  for (const [a, c, d, e] of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0, x0 + t, z1], [x1 - t, z0, x1, z1]]) {
    const alongZ = d - a < e - c, isDoor = (door === 'w' && a === x0 && alongZ) || (door === 'e' && d === x1 && alongZ) || (door === 'n' && c === z0 && !alongZ) || (door === 's' && e === z1 && !alongZ);
    if (!isDoor) { col.rect([a, c, d, e], y, y + H); continue; }
    if (alongZ) { col.rect([a, c, d, czm - dw / 2], y, y + H); col.rect([a, czm + dw / 2, d, e], y, y + H); }
    else { col.rect([a, c, cxm - dw / 2, e], y, y + H); col.rect([cxm + dw / 2, c, d, e], y, y + H); }
  }
  // the pembe band, the white coping, the roof
  bag.add('pembe', frustum([x0 + b * 0.84, z0 + b * 0.84, x1 - b * 0.84, z1 - b * 0.84], y + H - 0.62, y + H - 0.12, 0.05 * b, 0.05 * b, 0.05 * b, 0.05 * b).translate(0, 0, 0));
  bag.add('limewash_white', box(x0 + b - 0.12, y + H - 0.12, z0 + b - 0.12, x1 - b + 0.12, y + H + 0.1, z1 - b + 0.12));
  bag.add('mud_plaster', box(x0 + t, yi + 0.3, z0 + t, x1 - t, y + H - 0.12, z1 - t));
  // inside: the floor, the ceiling, two pillars and the beam over them
  bag.add('lacquer_chestnut', box(x0 + t, y, z0 + t, x1 - t, y + 0.03, z1 - t));
  col.floor([x0 + t, z0 + t, x1 - t, z1 - t], y + 0.03);
  bag.add('ceiling_coffer', box(x0 + t, yi, z0 + t, x1 - t, yi + 0.3, z1 - t));
  const alongX = door === 'w' || door === 'e', fx = door === 'w' ? -1 : door === 'e' ? 1 : 0, fz = door === 'n' ? -1 : door === 's' ? 1 : 0;
  const ix0 = x0 + t, iz0 = z0 + t, ix1 = x1 - t, iz1 = z1 - t, icx = (ix0 + ix1) / 2, icz = (iz0 + iz1) / 2;
  const span = alongX ? iz1 - iz0 : ix1 - ix0;
  for (const sgn of [-1, 1]) {
    const px = alongX ? icx : icx + sgn * span * 0.32, pz = alongX ? icz + sgn * span * 0.32 : icz;
    bag.add('lacquer_red', lathe([[0.16, 0], [0.15, yi - y - 0.75], [0.17, yi - y - 0.7]], 10, null, px, y + 0.03, pz));
    bag.add('paint_dancheong', box(px - 0.24, yi - 0.68, pz - 0.24, px + 0.24, yi - 0.45, pz + 0.24));
    bag.add('lacquer_red', alongX ? box(px - 0.6, yi - 0.45, pz - 0.18, px + 0.6, yi - 0.3, pz + 0.18) : box(px - 0.18, yi - 0.45, pz - 0.6, px + 0.18, yi - 0.3, pz + 0.6));
    col.circle(px, pz, 0.18, y, yi);
  }
  bag.add('lacquer_red', alongX ? box(icx - 0.17, yi - 0.3, iz0, icx + 0.17, yi, iz1) : box(ix0, yi - 0.3, icz - 0.17, ix1, yi, icz + 0.17));
  // the great wheel, a little toward the door from the middle, on its axle
  const wx = icx + fx * 0.6, wz = icz + fz * 0.6, R = Math.min(1.15, span * 0.2), wy0 = y + 0.5, wy1 = yi - 0.9;
  bag.add('iron', lathe([[0.06, 0], [0.06, yi - y], [0.001, yi - y]], 8, null, wx, y, wz));
  bag.add('wood_painted', lathe([[0.001, 0], [R + 0.25, 0], [R + 0.25, 0.4], [0.001, 0.4]], 20, null, wx, y + 0.03, wz));
  bag.add('lacquer_red', lathe([[0.001, wy0], [R, wy0], [R, wy1], [0.001, wy1]], 24, null, wx, 0, wz));
  for (const v of [wy0 + 0.05, wy0 + 0.45, wy1 - 0.45, wy1 - 0.05]) bag.add('gilt_bronze', lathe([[R + 0.012, v - 0.06], [R + 0.012, v + 0.06]], 24, null, wx, 0, wz));
  for (let row = 0; row < 3; row++) for (let i = 0; i < 18; i++) {
    const a = (i + row * 0.5) / 18 * Math.PI * 2, v = wy0 + 0.75 + row * (wy1 - wy0 - 1.5) / 2.2, cx2 = wx + Math.cos(a) * (R + 0.008), cz2 = wz + Math.sin(a) * (R + 0.008);
    // a syllable of the mantra in raised gilt: the headline it hangs from, two or three strokes below, a vowel sign above some
    const parts = [box(-0.008, 0.06, -0.075, 0.012, 0.085, 0.075), box(-0.008, -0.1, -0.06, 0.012, 0.06, -0.035), box(-0.008, -0.07, 0.03, 0.012, 0.06, 0.055)];
    if ((i + row) % 2) parts.push(box(-0.008, -0.03, -0.035, 0.012, -0.005, 0.03)); else parts.push(box(-0.008, -0.11, -0.02, 0.012, -0.085, 0.06));
    if ((i + row) % 3 === 0) { const c = box(-0.008, 0.085, -0.01, 0.012, 0.13, 0.012); c.rotateX(0.5); parts.push(c); }
    for (const g of parts) { g.rotateY(-a); g.translate(cx2, v, cz2); bag.add('gilt_bronze', g); }
  }
  bag.add('lacquer_red', lathe([[R + 0.05, 0], [R + 0.05, 0.12], [0.001, 0.12]], 24, null, wx, wy1, wz));
  col.circle(wx, wz, R + 0.3, y, yi);
  // the painted walls (all but the door's and the altar's)
  const yM = y + 0.03, hM = yi - y - 0.35;
  const W4 = { n: [[ix0, iz0], [ix1, iz0]], e: [[ix1, iz0], [ix1, iz1]], s: [[ix1, iz1], [ix0, iz1]], w: [[ix0, iz1], [ix0, iz0]] };
  const back = { w: 'e', e: 'w', n: 's', s: 'n' }[door];
  let seed = 0;
  for (const [side, [a, c]] of Object.entries(W4)) {
    if (side === door) continue;
    mural(bag, { a, b: c, y: yM, h: side === back ? 2.5 : hM, seed: seed += 3 });
  }
  // the altar against the back wall: three steps of painted wood, gilt images on the top, butter lamps in rows on the lower steps
  const bw = span - 0.8, bd = 1.5, B0 = { e: [ix1, icz, -1, 0], w: [ix0, icz, 1, 0], n: [icx, iz0, 0, 1], s: [icx, iz1, 0, -1] }[back];
  const [ox, oz, ux2, uz2] = B0, perp = [-uz2, ux2];
  const BX = (d0, d1, yy0, yy1, m, w2 = bw) => { const p = [ox + ux2 * d0 + perp[0] * w2 / 2, oz + uz2 * d0 + perp[1] * w2 / 2], q = [ox + ux2 * d1 - perp[0] * w2 / 2, oz + uz2 * d1 - perp[1] * w2 / 2]; bag.add(m, box(Math.min(p[0], q[0]), yy0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yy1, Math.max(p[1], q[1]))); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  col.rect(BX(0, bd, y, y + 0.7, 'wood_painted'), y, y + 1.5);
  BX(0, bd * 0.66, y + 0.7, y + 1.15, 'wood_painted'); BX(0, bd * 0.33, y + 1.15, y + 1.6, 'wood_painted');
  BX(bd - 0.02, bd + 0.005, y + 0.08, y + 0.62, 'cloth_ochre', bw - 0.3);                       // the cloth hung over the front
  const B = STYLES.chinese.objects.buddha;
  for (const k of [-1, 0, 1]) { const c = [ox + ux2 * 0.25 + perp[0] * k * bw * 0.3, oz + uz2 * 0.25 + perp[1] * k * bw * 0.3]; B({ at: c, y: y + 1.6, h: k ? 1.15 : 1.45, dir: [ux2, uz2], robe: 'gilt_bronze', gilt: 'gilt_bronze' }, { bag, col: { circle() {}, rect() {}, segment() {}, floor() {} } }); }
  for (const [d, yy, n] of [[bd * 0.5, y + 1.15, 9], [bd * 0.83, y + 0.7, 13]]) for (let i = 0; i < n; i++) {
    const c = [ox + ux2 * d + perp[0] * (i - (n - 1) / 2) * (bw - 0.4) / (n - 1), oz + uz2 * d + perp[1] * (i - (n - 1) / 2) * (bw - 0.4) / (n - 1)];
    bag.add('gilt_bronze', lathe([[0.03, 0], [0.02, 0.07], [0.055, 0.12], [0.05, 0.15], [0.001, 0.14]], 8, null, c[0], yy, c[1]));
    bag.add('flame', lathe([[0.001, 0], [0.012, 0.015], [0.001, 0.05]], 5, null, c[0], yy + 0.14, c[1]));
  }
  if (lights) lights.push({ at: [ox + ux2 * bd, y + 1.3, oz + uz2 * bd], color: '#ffb46b', intensity: 2.2, distance: 6 });
}
/**
 * mani_gallery: a row of prayer wheels along the circuit { a, b ([x, z]), y: (x, z) => ground, side (+1:
 * the wheels face the left of a → b) }: in steps of about 6 m, each on its own level, a whitewashed
 * back wall under a pembe band and a narrow roof of slates on beams; on a ledge before it the wheels,
 * a hand's breadth apart, each a red drum banded in gilt on its spindle between the ledge and a rail.
 */
function maniGallery(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], sd = el.side ?? 1, n = [-u[1] * sd, u[0] * sd];
  const gy = typeof el.y === 'function' ? el.y : () => el.y ?? 0, step = 6, ns = Math.max(1, Math.round(L / step)), sl = L / ns;
  // one wheel, built once (instanced): the drum, its bands, the spindle
  const wheel = (cx, y, cz) => {
    bag.add('lacquer_red', lathe([[0.001, 0], [0.13, 0], [0.13, 0.42], [0.001, 0.42]], 10, null, cx, y, cz));
    bag.add('gilt_bronze', lathe([[0.134, 0.03], [0.134, 0.08]], 10, null, cx, y, cz));
    bag.add('gilt_bronze', lathe([[0.134, 0.34], [0.134, 0.39]], 10, null, cx, y, cz));
    bag.add('iron', lathe([[0.012, -0.06], [0.012, 0.52], [0.001, 0.52]], 5, null, cx, y, cz));
  };
  for (let i = 0; i < ns; i++) {
    const s0 = i * sl, s1 = s0 + sl, sm = (s0 + s1) / 2, mx = ax + u[0] * sm, mz = az + u[1] * sm, y = gy(mx, mz);
    const P = (s, d) => [ax + u[0] * s + n[0] * d, az + u[1] * s + n[1] * d];
    const R = (sA, sB, dA, dB, y0, y1, m) => { const p = P(sA, dA), q = P(sB, dB); const r = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
    // the back wall (behind the wheels, on the far side from the walker), the ledge, the rail, the roof
    const wr = R(s0, s1 + 0.01, -0.95, -0.55, y - 0.6, y + 2.3, 'limewash_white'); col.rect(wr, y, y + 2.3);
    R(s0, s1 + 0.01, -0.97, -0.53, y + 2.3, y + 2.55, 'pembe');
    R(s0, s1 + 0.01, -0.55, -0.05, y - 0.6, y + 0.55, 'limewash_white');
    R(s0, s1 + 0.01, -0.5, -0.1, y + 1.18, y + 1.26, 'wood_painted');
    col.rect(R(s0, s1 + 0.01, -0.55, -0.05, y + 0.55, y + 0.56, 'wood_painted'), y, y + 1.2);
    for (const s of [s0 + 0.05, s1 - 0.05]) R(s - 0.07, s + 0.07, -0.18, -0.04, y + 0.55, y + 2.4, 'lacquer_red');
    R(s0 - 0.02, s1 + 0.03, -1.05, 0.25, y + 2.55, y + 2.65, 'wood_painted');
    R(s0 - 0.04, s1 + 0.05, -1.08, 0.3, y + 2.65, y + 2.72, 'slate');
    const nw = Math.floor((sl - 0.4) / 0.36);
    for (let k = 0; k < nw; k++) { const p = P(s0 + 0.2 + (k + 0.5) * (sl - 0.4) / nw, -0.3); wheel(p[0], y + 0.66, p[1]); }
  }
}
const { teaSeats: _ts, ...SHOPS } = makeShops({ face, doorway, win, thangka, sangkhun, twigs, bannerPole, flagString });
/** Where patrons sit in a tea house (shops.js). */
export const teaSeats = _ts;
registerStyle('tibetan', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dzong, sang_khun: (el, { bag }) => sangkhun(bag, el.at[0], el.y ?? 0, el.at[1], el.dir), lapse: (el, { bag }) => twigs(bag, el.at[0], el.y ?? 0, el.at[1], rng(el.seed || 5)), golden_roof: goldenRoof, banner_pole: bannerPole, tibetan_house: house, round_tower: roundTower, zigzag, doring, sangkhang, stone_heap: stoneHeap, shol_gate: sholGate, triple_stair: tripleStair, koku, flight, landing, doorway, skas, potala_hall: potalaHall, parkhang, mani_wheel: maniWheel, lhakhang, mani_gallery: maniGallery, ...SHOPS },
  objects: {},
});
