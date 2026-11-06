// Nagara temple architecture of the Chandelas (11th c.; docs/settlements/khajuraho.md §4): a temple
// on a high terrace (jagati), its halls in a row from the east — the entrance porch, the hall,
// the great hall, the vestibule, the sanctum — each roofed higher than the last in stepped
// pyramids, the sanctum crowned by the curvilinear tower (śikhara) clustered with smaller towers
// (uruśṛṅgas) climbing it, each ending in a ribbed amalaka and a pot; bands of sculpture; the
// village's flat-roofed houses.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, rod, orientOutward } from '../../core/geom.js';
import '../qing/index.js';

const S = 'sandstone_dressed', RELIEF = 'sandstone_relief';

/** The stepped plan of a tower course (one quadrant mirrored round): the central offset (bhadra),
 *  the intermediate one (pratiratha), the corner (karna) — half-extent s. Star-shaped about the centre. */
function rathaPlan(s) {
  const q = [[1, 0], [1, 0.22], [0.9, 0.22], [0.9, 0.5], [0.8, 0.5], [0.8, 0.8], [0.5, 0.8], [0.5, 0.9], [0.22, 0.9], [0.22, 1]];
  const out = [];
  for (const [sx, sz, flip] of [[1, 1, false], [-1, 1, true], [-1, -1, false], [1, -1, true]]) {
    const pts = (flip ? [...q].reverse() : q).map(([a, b]) => [sx * a * s, sz * b * s]);
    for (const p of pts) if (!out.length || Math.hypot(out[out.length - 1][0] - p[0], out[out.length - 1][1] - p[1]) > 1e-6) out.push(p);
  }
  if (Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 1e-6) out.pop();
  return out;
}
/** A prism between two similar plans (points about cx, cz), sides wound outward; caps fanned from the centre. */
function prism(out, P0, y0, P1, y1, cx, cz, bottom = true, top = true) {
  const n = P0.length, tri = (a, b, c, want) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    // fromTriangles' normal for (a, b, c) is (c−b)×(a−b) = u×v
    const ok = (nx * want[0] + ny * want[1] + nz * want[2]) > 0;
    out.push(...(ok ? [...a, ...b, ...c] : [...a, ...c, ...b]));
  };
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = [cx + P0[i][0], y0, cz + P0[i][1]], b = [cx + P0[j][0], y0, cz + P0[j][1]], c = [cx + P1[j][0], y1, cz + P1[j][1]], d = [cx + P1[i][0], y1, cz + P1[i][1]];
    const m = [(P0[i][0] + P0[j][0]) / 2, 0, (P0[i][1] + P0[j][1]) / 2];
    tri(a, b, c, m); tri(a, c, d, m);
    if (top) tri([cx, y1, cz], d, c, [0, 1, 0]);
    if (bottom) tri([cx, y0, cz], a, b, [0, -1, 0]);
  }
}
/** A ribbed amalaka (the notched stone disc) of radius r at (x, y, z), its flat cap (chandrika) on top. */
function amalaka(bag, x, y, z, r, mat = S, segs = 24) {
  if (segs <= 12) { bag.add(mat, lathe([[r * 0.55, 0], [r, r * 0.2], [r * 0.55, r * 0.4], [0.001, r * 0.4]], segs, (th, i) => (i === 1 ? 1 + 0.08 * Math.cos(th * segs / 2) : 1), x, y, z)); return; }
  bag.add(mat, lathe([[r * 0.5, 0], [r * 0.86, r * 0.07], [r, r * 0.2], [r * 0.86, r * 0.34], [r * 0.5, r * 0.4], [0.001, r * 0.4]], segs, (th, i) => (i > 0 && i < 4 ? 1 + 0.07 * Math.cos(th * segs / 2) : 1), x, y, z));
}
/** The crown: the shoulder, the neck, the amalaka, a second small amalaka, the pot (kalasha) with its citron finial. */
function crown(bag, cx, top, cz, s, mat = S, rich = true) {
  bag.add(mat, lathe([[s * 0.62, 0], [s * 0.5, s * 0.1], [s * 0.4, s * 0.16], [s * 0.4, s * 0.24], [0.001, s * 0.24]], 16, null, cx, top, cz));
  const ra = s * 0.86, ya = top + s * 0.24;
  amalaka(bag, cx, ya, cz, ra, mat, rich ? 28 : 16);
  if (rich) {
    amalaka(bag, cx, ya + ra * 0.4, cz, ra * 0.42, mat, 16);
    const yk = ya + ra * 0.4 + ra * 0.17;
    bag.add(mat, lathe([[ra * 0.16, 0], [ra * 0.3, ra * 0.12], [ra * 0.32, ra * 0.3], [ra * 0.15, ra * 0.46], [ra * 0.1, ra * 0.5], [ra * 0.18, ra * 0.56], [ra * 0.08, ra * 0.62], [ra * 0.1, ra * 0.72], [0.001, ra * 0.95]], 12, null, cx, yk, cz));
  } else bag.add(mat, lathe([[ra * 0.2, 0], [ra * 0.32, ra * 0.2], [ra * 0.14, ra * 0.42], [0.001, ra * 0.7]], 10, null, cx, ya + ra * 0.4, cz));
}
/** A horseshoe dormer (gavaksha) motif on a face whose outward normal is (nx, nz), at (x, y, z), width w:
 *  the jambs' block and the pointed hood over it, in shallow relief. */
function gavaksha(bag, x, y, z, nx, nz, w, mat = 'sandstone') {
  const t = Math.max(0.02, w * 0.08), ux = -nz, uz = nx, hw = w * 0.42, hb = w * 0.36, hh = w * 0.42, tris = [];
  const P = (u, v, o) => [x + ux * u + nx * o, y + v, z + uz * u + nz * o];
  // the block: front, top-less sides (the hood covers the top)
  const q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(P(-hw, 0, t), P(hw, 0, t), P(hw, hb, t), P(-hw, hb, t));
  q(P(hw, 0, 0), P(hw, hb, 0), P(hw, hb, t), P(hw, 0, t));
  q(P(-hw, 0, t), P(-hw, hb, t), P(-hw, hb, 0), P(-hw, 0, 0));
  q(P(-hw, 0, 0), P(hw, 0, 0), P(hw, 0, t), P(-hw, 0, t));
  // the hood: a pointed gable, its two sloping faces and its front
  const A = P(-hw * 1.15, hb, t * 1.3), B = P(hw * 1.15, hb, t * 1.3), C = P(0, hb + hh, t * 1.3), A0 = P(-hw * 1.15, hb, 0), B0 = P(hw * 1.15, hb, 0), C0 = P(0, hb + hh, 0);
  tris.push(...A, ...B, ...C);
  q(B0, C0, C, B); q(C0, A0, A, C); q(A0, B0, B, A);
  bag.add(mat, fromTriangles(orientOutward(tris)));
}
/**
 * A curvilinear tower (rekha śikhara) on the stepped plan: courses rising vertical then curving in,
 * the corners (karna) divided into storeys by ribbed bhumi-amalakas, the central offsets (bhadra)
 * covered by a mesh of horseshoe dormers (gavaksha), the crown on top. s: half-width at the base.
 */
function shikhara(bag, cx, cz, y, w, h, mat = S, courses = 14, mesh = true) {
  const s = w / 2, f = (t) => (1 + 0.05 * Math.sin(Math.PI * t * 0.8)) * (1 - 0.56 * t ** 2.1);
  const tris = [], storey = courses > 9 ? 3 : 2;
  for (let i = 0; i < courses; i++) {
    const t0 = i / courses, t1 = (i + 1) / courses, y0 = y + h * t0, y1 = y + h * t1;
    prism(tris, rathaPlan(s * f(t0)), y0, rathaPlan(s * f(t1)), y1, cx, cz, i === 0, i === courses - 1);
    const sm = s * f((t0 + t1) / 2), ch = y1 - y0;
    // the storey line: a ribbed bhumi-amalaka on each corner, the corner course under it set back
    if (courses >= 8 && (i + 1) % storey === 0 && i < courses - 1) {
      const sk = s * f(t1);
      for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) amalaka(bag, cx + sx * sk * 0.65, y1 - ch * 0.42, cz + sz * sk * 0.65, sk * 0.19, mat, 8);
    }
    if (mesh) for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ux = -nz, uz = nx;
      gavaksha(bag, cx + nx * sm, y0 + ch * 0.12, cz + nz * sm, nx, nz, Math.min(sm * 0.36, ch * 1.6));
      if (courses >= 14) for (const k of [-1, 1]) gavaksha(bag, cx + nx * sm * 0.9 + ux * k * sm * 0.36, y0 + ch * 0.18, cz + nz * sm * 0.9 + uz * k * sm * 0.36, nx, nz, Math.min(sm * 0.22, ch * 1.2));
    }
  }
  bag.add(mat, fromTriangles(tris));
  crown(bag, cx, y + h, cz, s * f(1), mat, courses > 6);
}
/** A band of figures in high relief round a wall rect r, standing on yb, h tall — gods, attendants, couples, set in niches between pilasters. */
function figureBand(bag, r, yb, h) {
  const [x0, z0, x1, z1] = r, k = h / 1.15;
  const prof = [[0.2 * k, 0], [0.16 * k, 0.45 * k], [0.12 * k, 0.72 * k], [0.07 * k, 0.78 * k], [0.1 * k, 0.86 * k], [0.085 * k, 1.0 * k], [0.001, 1.12 * k]];
  for (const [a, b, fx, fz] of [[[x0, z0], [x1, z0], 0, -1], [[x1, z1], [x0, z1], 0, 1], [[x0, z1], [x0, z0], -1, 0], [[x1, z0], [x1, z1], 1, 0]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(L / (h * 0.62)));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * t + fx * 0.12, z = a[1] + (b[1] - a[1]) * t + fz * 0.12;
      bag.add('sandstone', lathe(prof, 5, null, x, yb + 0.05, z));
      if (i % 3 === 1) bag.add('sandstone', lathe(prof.map(([pr, py]) => [pr * 0.95, py * 0.93]), 5, null, x + (fz ? h * 0.18 : 0), yb + 0.05, z + (fx ? h * 0.18 : 0)));   // a couple
      const pt = (a[0] + (b[0] - a[0]) * (i / n)), pz = (a[1] + (b[1] - a[1]) * (i / n));
      bag.add(S, box(pt - 0.1 + fx * 0.05, yb, pz - 0.1 + fz * 0.05, pt + 0.1 + fx * 0.2, yb + h + 0.15, pz + 0.1 + fz * 0.2));
    }
  }
  bag.add(S, box(x0 - 0.25, yb + h + 0.1, z0 - 0.25, x1 + 0.25, yb + h + 0.35, z1 + 0.25));
  bag.add(S, box(x0 - 0.2, yb - 0.2, z0 - 0.2, x1 + 0.2, yb, z1 + 0.2));
}
/** A balconied window on a hall's side (kakshasana): the seat-back balustrade, the pillars, the sloping eave. */
function balcony(bag, x0, x1, z, side, y, h) {
  const d = side * 1.6, zz = [z, z + d].sort((p, q) => p - q);
  bag.add(S, box(x0, y, zz[0], x1, y + 0.9, zz[1]));
  for (const x of [x0 + 0.2, (x0 + x1) / 2, x1 - 0.2]) bag.add(S, box(x - 0.15, y + 0.9, z + d * 0.85 - 0.15, x + 0.15, y + h, z + d * 0.85 + 0.15));
  bag.add(S, frustum([x0 - 0.3, Math.min(z, z + d * 1.15), x1 + 0.3, Math.max(z, z + d * 1.15)], y + h, y + h + 0.6, 0, 0, side < 0 ? 0 : d * 0.9, side < 0 ? -d * 0.9 : 0, { noBottom: true }));
}
/** A porch pillar from y0 to y1: a square moulded base, the shaft square then octagonal then
 *  sixteen-sided with a band of hanging garlands, the pot-and-foliage capital, the bracket. */
function pillar(bag, x, z, y0, y1, p = 0.4) {
  const H = y1 - y0;
  bag.add(S, box(x - p * 1.15, y0, z - p * 1.15, x + p * 1.15, y0 + 0.25, z + p * 1.15));
  bag.add(S, box(x - p, y0 + 0.25, z - p, x + p, y0 + H * 0.3, z + p));
  bag.add(S, lathe([[p * 0.98, 0], [p * 0.98, H * 0.22], [p * 0.92, H * 0.24], [p * 0.92, H * 0.42], [p * 1.0, H * 0.45], [p * 1.0, H * 0.5], [p * 0.86, H * 0.52]], 8, null, x, y0 + H * 0.3, z).rotateY(0));
  bag.add('sandstone', lathe([[p * 0.86, 0], [p * 0.82, H * 0.04], [p * 0.95, H * 0.07], [p * 1.05, H * 0.1], [p * 0.8, H * 0.12], [p * 0.95, H * 0.13], [p * 0.95, H * 0.18]], 16, (th, k) => (k === 3 ? 1 + 0.08 * Math.cos(th * 8) : 1), x, y0 + H * 0.8, z));
  bag.add(S, box(x - p * 1.5, y1 - H * 0.02 - 0.3, z - p * 0.55, x + p * 1.5, y1, z + p * 0.55));
  bag.add(S, box(x - p * 0.55, y1 - H * 0.02 - 0.3, z - p * 1.5, x + p * 0.55, y1, z + p * 1.5));
}
/** The entrance porch (ardhamaṇḍapa) over r from y, wh tall: four pillars, the seat with its sloping back
 *  (kakṣāsana) along the two sides, the architraves on the pillars, a ceiling slab. */
function porch(bag, col, r, y, wh, simple) {
  const pts = [[r[0] + 0.6, r[1] + 0.6], [r[2] - 0.6, r[1] + 0.6], [r[0] + 0.6, r[3] - 0.6], [r[2] - 0.6, r[3] - 0.6]];
  for (const [px, pz] of pts) { if (simple) bag.add(S, box(px - 0.4, y, pz - 0.4, px + 0.4, y + wh - 0.6, pz + 0.4)); else pillar(bag, px, pz, y + 0.9, y + wh - 0.6); col.rect([px - 0.4, pz - 0.4, px + 0.4, pz + 0.4], y, y + wh); }
  // the seat on each side, its sloping back carved with little pilasters; the pillars stand on it
  for (const [z0, z1, sd] of [[r[1], r[1] + 1.2, -1], [r[3] - 1.2, r[3], 1]]) {
    bag.add(S, box(r[0], y, z0, r[2] - 0.05, y + 0.9, z1)); col.rect([r[0], z0, r[2], z1], y, y + 0.9);
    const zo = sd < 0 ? r[1] : r[3];
    bag.add('sandstone', frustum([r[0] + 0.1, Math.min(zo, zo - sd * 0.5), r[2] - 0.15, Math.max(zo, zo - sd * 0.5)], y + 0.9, y + 1.7, 0, 0, sd < 0 ? 0 : 0.3, sd < 0 ? 0.3 : 0));
    if (!simple) for (let x = r[0] + 0.4; x < r[2] - 0.3; x += 0.55) bag.add(RELIEF, box(x - 0.07, y + 0.95, Math.min(zo + sd * 0.03, zo - sd * 0.08), x + 0.07, y + 1.5, Math.max(zo + sd * 0.03, zo - sd * 0.08)));
  }
  bag.add(S, box(r[0], y - 0.05, r[1] + 1.2, r[2], y + 0.9, r[3] - 1.2)); col.floor([r[0], r[1] + 1.2, r[2], r[3] - 1.2], y + 0.9);
  // the architraves round the top and the flat ceiling under the roof
  const ya = y + wh - 0.6;
  for (const q of [[r[0] + 0.1, r[1] + 0.25, r[2] + 0.1, r[1] + 0.95], [r[0] + 0.1, r[3] - 0.95, r[2] + 0.1, r[3] - 0.25], [r[2] - 0.95, r[1] + 0.95, r[2] - 0.25, r[3] - 0.95]]) bag.add(S, box(q[0], ya, q[1], q[2], ya + 0.6, q[3]));
  bag.add('sandstone', box(r[0] + 0.3, y + wh - 0.08, r[1] + 0.3, r[2] - 0.3, y + wh, r[3] - 0.3));
}
/** A small block on a face: along x (ax) at u, the face's coordinate zz, half-width hw, depth d, from yy, h tall. */
const along = (ax, u, zz, hw, d, yy, h) => (ax ? box(u - hw, yy, zz - d, u + hw, yy + h, zz + d) : box(zz - d, yy, u - hw, zz + d, yy + h, u + hw));
/** A stepped pyramidal roof over a hall. */
function stepped(bag, r, y, h, mat = S, n = 7) {
  const [x0, z0, x1, z1] = r, w = x1 - x0, d = z1 - z0;
  for (let i = 0; i < n; i++) {
    const f0 = 1 - 0.8 * i / n, f1 = 1 - 0.8 * (i + 1) / n, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const ya = y + h * i / n, yb = y + h * (i + 1) / n;
    // each tier a sloped course under a projecting ledge, a row of little pot-finials along the ledge
    bag.add(mat, frustum([cx - w * f0 / 2, cz - d * f0 / 2, cx + w * f0 / 2, cz + d * f0 / 2], ya, yb - (yb - ya) * 0.3, w * (f0 - f1) / 2 * 0.7, w * (f0 - f1) / 2 * 0.7, d * (f0 - f1) / 2 * 0.7, d * (f0 - f1) / 2 * 0.7));
    const fm = f0 - (f0 - f1) * 0.62;
    bag.add(mat, box(cx - w * fm / 2 - 0.12, yb - (yb - ya) * 0.3, cz - d * fm / 2 - 0.12, cx + w * fm / 2 + 0.12, yb, cz + d * fm / 2 + 0.12));
    // along the ledge a row of little bell-roofed pavilions (ghaṇṭā kūṭas), a small spire at each corner
    const m = Math.max(2, Math.floor(w * fm / 1.5)), kh = (yb - ya) * 0.9;
    for (let j = 1; j < m; j++) for (const sz of [-1, 1]) { const x = cx - w * fm / 2 + j * w * fm / m; bell(bag, x, yb, cz + sz * (d * fm / 2 - 0.2), Math.min(0.32, kh * 0.4), kh * 0.8); }
    const mz = Math.max(2, Math.floor(d * fm / 1.5));
    for (let j = 1; j < mz; j++) for (const sx of [-1, 1]) { const z = cz - d * fm / 2 + j * d * fm / mz; bell(bag, cx + sx * (w * fm / 2 - 0.2), yb, z, Math.min(0.32, kh * 0.4), kh * 0.8); }
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) shikhara(bag, cx + sx * (w * fm / 2 - 0.35), cz + sz * (d * fm / 2 - 0.35), yb, 0.7, kh * 1.3, mat, 3, false);
  }
  // the crown: a great bell (ghaṇṭā) with its amalaka and pot
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, wt = Math.min(w, d) * 0.2;
  bag.add(mat, lathe([[wt * 1.1, 0], [wt * 1.05, wt * 0.12], [wt * 0.8, wt * 0.3], [wt * 0.55, wt * 0.62], [wt * 0.42, wt * 0.9], [0.001, wt * 0.95]], 20, null, cx, y + h, cz));
  crown(bag, cx, y + h + wt * 0.88, cz, wt * 0.5, mat, true);
}
/** A little bell-roofed pavilion of radius r, height h at (x, y, z): a square base, the bell, a tiny amalaka. */
function bell(bag, x, y, z, r, h) {
  bag.add(S, box(x - r, y, z - r, x + r, y + h * 0.3, z + r));
  bag.add('sandstone', lathe([[r * 1.05, 0], [r * 0.6, h * 0.3], [r * 0.3, h * 0.5], [r * 0.42, h * 0.58], [0.001, h * 0.7]], 6, null, x, y + h * 0.3, z));
}
/**
 * nagara_temple: { c (the sanctum's centre), len (west–east, the porch at the east), w, h (the
 * tower's top above the terrace), jagati (terrace height), y } — the temple faces east.
 */
function temple(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.len, W = el.w, H = el.h, J = el.jagati ?? 4, y0 = el.y ?? 0, y = y0 + J, plinth = H * 0.12;
  // the terrace with a stair on the east (el.terrace: a larger platform, as Lakshmana's with its corner shrines)
  const T = el.terrace || [cx - W * 0.85, cz - W * 0.95, cx + L + 4, cz + W * 0.95];
  bag.add(S, box(T[0], y0 - 0.5, T[1], T[2], y, T[3])); col.rect(T, y0, y); col.floor(T, y);
  if (el.frieze && !el.simple) platformFrieze(bag, T, y0, y, cz, W * 0.14 + 0.2);
  const sw = W * 0.28, sr = [T[2], cz - sw / 2, T[2] + J * 2.2, cz + sw / 2], n = Math.round(J / 0.22);
  for (let i = 0; i < n; i++) { const z = sr[0] + (sr[2] - sr[0]) * (1 - (i + 1) / n), yy = y0 + J * (i + 1) / n; bag.add(S, box(z, y0 - 0.5, sr[1], z + (sr[2] - sr[0]) / n + 0.02, yy, sr[3])); col.floor([z, sr[1], z + (sr[2] - sr[0]) / n, sr[3]], yy); }
  // the high moulded plinth under all the halls
  const P = [cx - W / 2, cz - W * 0.42, cx + L, cz + W * 0.42];
  bag.add(S, box(P[0], y, P[1], P[2], y + plinth, P[3])); col.rect(P, y, y + plinth);
  // the plinth's mouldings: courses stepping out and in, a frieze of elephants and riders (small blocks) along the middle
  if (!el.simple) {
    for (const [f, o] of [[0.12, 0.35], [0.28, 0.15], [0.62, 0.22], [0.86, 0.3], [0.97, 0.12]]) bag.add('sandstone', box(P[0] - o, y + plinth * f - 0.12, P[1] - o, P[2] + o, y + plinth * f + 0.12, P[3] + o));
    for (const [a0, a1, zz, ax] of [[P[0], P[2], P[1] - 0.15, true], [P[0], P[2], P[3] + 0.15, true], [P[1], P[3], P[0] - 0.15, false]]) for (let u = a0 + 0.8; u < a1 - 0.6; u += 1.6) { const hh = plinth * 0.18; bag.add('sandstone', along(ax, u, zz, 0.55, 0.12, y + plinth * 0.4, hh)); }
  }
  // the halls' walls with their sculpture bands, from the sanctum eastward, each roof lower
  // (the halls fill the plinth from the sanctum's east wall to its east end)
  const Lh = (L - W / 2) / 0.84;
  const halls = [[cx - W / 2, W, H * 0.3, null], [cx + W / 2, Lh * 0.16, H * 0.27, 0.55], [cx + W / 2 + Lh * 0.16, Lh * 0.3, H * 0.27, 0.62], [cx + W / 2 + Lh * 0.46, Lh * 0.2, H * 0.24, 0.48], [cx + W / 2 + Lh * 0.66, Lh * 0.18, H * 0.2, 0.34]];
  halls.forEach(([x, len, wh, roofH], i) => {
    const hw = i === 0 ? W / 2 : W * (i === 2 ? 0.48 : 0.36), r = [x, cz - hw, x + len, cz + hw];
    if (i === 4) porch(bag, col, r, y + plinth, wh, el.simple);
    else { bag.add(S, box(r[0], y + plinth, r[1], r[2], y + plinth + wh, r[3])); col.rect(r, y, y + plinth + wh); }
    if (i === 4) { /* the open porch */ } else if (el.simple) for (const k of [0.3, 0.62]) bag.add('sandstone', box(r[0] - 0.05, y + plinth + wh * k, r[1] - 0.05, r[2] + 0.05, y + plinth + wh * k + wh * 0.22, r[3] + 0.05));
    else { for (const k of [0.2, 0.47, 0.74]) figureBand(bag, r, y + plinth + wh * k, Math.min(1.5, wh * 0.21)); if (i === 2 || i === 0) for (const sd of [-1, 1]) balcony(bag, r[0] + len * 0.25, r[2] - len * 0.25, sd < 0 ? r[1] : r[3], sd, y + plinth + wh * 0.18, wh * 0.55); }
    if (i > 0) stepped(bag, [r[0] - 0.4, r[1] - 0.6, r[2] + 0.4, r[3] + 0.6], y + plinth + wh, H * roofH * 0.45);
  });
  // the steep flight from the terrace up the plinth to the porch's floor
  {
    const top = y + plinth + 0.9, z0 = cz - W * 0.36 + 1.2, z1 = cz + W * 0.36 - 1.2, x0 = P[2], run = Math.min(T[2] - P[2] - 0.2, 3.9), n = Math.max(4, Math.round((top - y) / 0.25)), d = run / n;
    for (let k = 0; k < n; k++) {
      const xa = x0 + run - (k + 1) * d, xb = x0 + run - k * d, yy = y + (top - y) * (k + 1) / n;
      bag.add(S, box(xa, y, z0, xb, yy, z1)); col.floor([xa, z0, xb, z1], yy);
    }
    for (const zz of [z0 - 0.35, z1]) bag.add(S, frustum([x0, zz, x0 + run + 0.1, zz + 0.35], y, top + 0.5, 0, run * 0.92, 0, 0));
  }
  // the sanctum's tower: the main śikhara, and round it the climbing towers (uruśṛṅgas) engaged
  // against its faces and corners in tiers, each smaller and lower outward (the sekhari tower)
  const ty = y + plinth + H * 0.3, th = H - plinth - H * 0.3;
  if (el.simple) { shikhara(bag, cx, cz, ty, W * 0.86, th); return; }
  shikhara(bag, cx, cz, ty, W * 0.62, th, S, 18);
  const spires = [];
  for (const [nx, nz] of [[-1, 0], [0, -1], [0, 1], [1, 0]]) {
    const ux = -nz, uz = nx, P = (a, b) => [cx + nx * a * W + ux * b * W, cz + nz * a * W + uz * b * W];
    spires.push([P(0.27, 0), 0.36, 0.78, 12]);
    if (nx === 1) continue;                     // the east face rises over the vestibule's roof
    spires.push([P(0.385, 0), 0.22, 0.55, 8]);
    for (const k of [-1, 1]) { spires.push([P(0.42, k * 0.2), 0.14, 0.34, 6]); spires.push([P(0.455, k * 0.36), 0.08, 0.2, 4]); }
  }
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { spires.push([[cx + sx * 0.33 * W, cz + sz * 0.33 * W], 0.28, 0.6, 9]); spires.push([[cx + sx * 0.42 * W, cz + sz * 0.42 * W], 0.14, 0.36, 6]); }
  for (const [[px, pz], ww, hh, n] of spires) shikhara(bag, px, pz, ty, W * ww, th * hh, S, n, n >= 9);
  // the gable (śukanāsa) over the vestibule on the east: a projecting front with a great dormer medallion
  {
    const gx = cx + W * 0.42, gy = ty + th * 0.36, gw = W * 0.34;
    bag.add(S, frustum([gx - W * 0.12, cz - gw / 2, gx + W * 0.08, cz + gw / 2], ty, gy, 0, W * 0.06, gw * 0.12, gw * 0.12));
    bag.add(S, frustum([gx - W * 0.12, cz - gw * 0.38, gx + W * 0.02, cz + gw * 0.38], gy, gy + th * 0.14, 0, W * 0.1, gw * 0.3, gw * 0.3));
    gavaksha(bag, gx + W * 0.035, gy - th * 0.12, cz, 1, 0, gw * 0.62);
    gavaksha(bag, gx + W * 0.07, ty + th * 0.04, cz, 1, 0, gw * 0.4);
  }
  // the makara torana: the carved garland arching between the porch's front pillars, a sea-monster at either end
  {
    const pr = halls[4], px = pr[0] + pr[1] - 0.6, hw = W * 0.36 - 0.6, yb = y + plinth + pr[2] * 0.42, yt = y + plinth + pr[2] * 0.88;
    const lobes = 7, pts = [];
    for (let k = 0; k <= lobes * 6; k++) {
      const t = k / (lobes * 6), z = cz - hw + 0.4 + t * (2 * hw - 0.8), arch = Math.sin(Math.PI * t), cusp = Math.abs(Math.sin(Math.PI * t * lobes)) * 0.28;
      pts.push([px + 0.25, yb + (yt - yb - 0.4) * arch ** 0.6 + cusp, z]);
    }
    for (let k = 0; k < pts.length - 1; k++) bag.add('sandstone', rod(pts[k], pts[k + 1], 0.11, 6));
    for (const sz of [-1, 1]) {
      const z = cz + sz * (hw - 0.4);
      bag.add('sandstone', box(px + 0.05, yb - 0.25, z - 0.25, px + 0.6, yb + 0.25, z + 0.25));                  // the makara's body
      bag.add('sandstone', rod([px + 0.45, yb + 0.15, z], [px + 0.55, yb + 0.55, z - sz * 0.45], 0.1, 6));     // its curling snout
      bag.add('sandstone', rod([px + 0.55, yb + 0.55, z - sz * 0.45], [px + 0.45, yb + 0.8, z - sz * 0.6], 0.07, 6));
    }
    for (const [ky, kz] of [[0.55, 0], [0.75, -0.35], [0.75, 0.35]]) bag.add(RELIEF, lathe([[0.001, 0], [0.16, 0.04], [0.13, 0.28], [0.09, 0.42], [0.001, 0.5]], 6, null, px + 0.3, yb + (yt - yb) * ky, cz + kz * hw));
  }
}
/** A small figure of the platform's frieze facing out along n, feet at (x, y, z), h tall: kind 0 an elephant
 *  with its rider, 1 a horse and rider, 2 and 3 foot soldiers with shields, 4 a dancer, 5 a drummer, 6 a
 *  couple, 7 a porter with his load. Parts in the round, low and simple; ux, uz along the band. */
function friezeFig(bag, kind, x, y, z, ux, uz, h) {
  const k = h / 0.75, M = RELIEF, P = (u, v, d = 0) => [x + ux * u, y + v * k, z + uz * u];
  const man = (u, sc = 1, arms = 0) => {
    bag.add(M, lathe([[0.07 * k * sc, 0], [0.05 * k * sc, 0.3 * k * sc], [0.06 * k * sc, 0.42 * k * sc], [0.04 * k * sc, 0.5 * k * sc], [0.001, 0.52 * k * sc]], 5, null, ...P(u, 0)));
    bag.add(M, lathe([[0.001, 0], [0.04 * k * sc, 0.02 * k * sc], [0.04 * k * sc, 0.08 * k * sc], [0.001, 0.1 * k * sc]], 5, null, ...P(u, 0.52 * sc)));
    if (arms) bag.add(M, rod(P(u, 0.42 * sc), P(u + arms * 0.12 * k, 0.6 * sc), 0.018 * k, 4));
  };
  if (kind === 0) {
    bag.add(M, box(...[P(-0.22 * k, 0.18), P(0.22 * k, 0.42)].reduce((a, b) => [Math.min(a[0], b[0]) - 0.08 * k * Math.abs(uz), a[1], Math.min(a[2], b[2]) - 0.08 * k * Math.abs(ux), Math.max(a[0], b[0]) + 0.08 * k * Math.abs(uz), b[1], Math.max(a[2], b[2]) + 0.08 * k * Math.abs(ux)])));
    for (const u of [-0.16, 0.16]) bag.add(M, lathe([[0.035 * k, 0], [0.035 * k, 0.2 * k], [0.001, 0.2 * k]], 5, null, ...P(u * k, 0)));
    bag.add(M, rod(P(0.24 * k, 0.4), P(0.3 * k, 0.05), 0.025 * k, 4));
    man(0.02 * k, 0.55, 1); return;
  }
  if (kind === 1) {
    bag.add(M, rod(P(-0.18 * k, 0.3), P(0.16 * k, 0.32), 0.07 * k, 5)); bag.add(M, rod(P(0.16 * k, 0.32), P(0.26 * k, 0.48), 0.04 * k, 5));
    for (const u of [-0.15, 0.13]) bag.add(M, rod(P(u * k, 0.3), P(u * k + 0.02 * k, 0), 0.02 * k, 4));
    man(0, 0.6, 1); return;
  }
  if (kind === 2 || kind === 3) { man(0, 1, kind === 2 ? 1 : -1); bag.add(M, lathe([[0.001, 0], [0.09 * k, 0.005], [0.09 * k, 0.02 * k]], 6, null, ...P(-0.06 * k, 0.28))); return; }
  if (kind === 4) { man(0, 1, 1); bag.add(M, rod(P(0, 0.42), P(-0.12 * k, 0.55), 0.018 * k, 4)); bag.add(M, rod(P(0, 0.12), P(0.1 * k, 0.24), 0.02 * k, 4)); return; }
  if (kind === 5) { man(0, 1); bag.add(M, lathe([[0.05 * k, 0], [0.07 * k, 0.07 * k], [0.05 * k, 0.14 * k]], 6, null, ...P(0.08 * k, 0.22))); return; }
  if (kind === 6) { man(-0.06 * k, 1, 1); man(0.06 * k, 0.94, -1); return; }
  man(0, 1); bag.add(M, rod(P(-0.2 * k, 0.5), P(0.2 * k, 0.5), 0.012 * k, 4)); for (const u of [-0.18, 0.18]) bag.add(M, lathe([[0.04 * k, 0], [0.05 * k, 0.05 * k], [0.001, 0.1 * k]], 5, null, ...P(u * k, 0.36)));
}
/** The jagati's sides: a moulded base and coping, and between them a sunk band carved with the life of the
 *  kingdom in long processions — elephants and horsemen, soldiers, dancers and drummers, couples, porters.
 *  (The stair's opening on the east, half-width sw about cz, is left.) */
function platformFrieze(bag, T, y0, y, cz, sw) {
  const [x0, z0, x1, z1] = T, H = y - y0, bh = Math.min(0.85, H * 0.28), yb = y0 + H * 0.38;
  for (const [ya, yb2, o] of [[y0, y0 + 0.35, 0.3], [y0 + 0.35, y0 + 0.55, 0.15], [y - 0.35, y, 0.25], [yb - 0.18, yb, 0.12], [yb + bh, yb + bh + 0.18, 0.12]]) {
    for (const r of [[x0 - o, z0 - o, x1 + o, z0], [x0 - o, z1, x1 + o, z1 + o], [x0 - o, z0, x0, z1], [x1, z0, x1 + o, cz - sw], [x1, cz + sw, x1 + o, z1]]) bag.add(o > 0.2 ? S : 'sandstone', box(r[0], ya, r[1], r[2], yb2, r[3]));
  }
  let n = 0;
  const run = (ax, az, bx, bz, nx, nz) => {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, step = 0.62, m = Math.floor(L / step);
    for (let i = 0; i < m; i++) { const u = (i + 0.5) * L / m, px = ax + ux * u + nx * 0.04, pz = az + uz * u + nz * 0.04; friezeFig(bag, [0, 2, 3, 1, 2, 4, 5, 4, 6, 7, 2, 3][n++ % 12], px, yb, pz, ux, uz, bh * 0.92); }
  };
  run(x1, z0, x0, z0, 0, -1); run(x0, z1, x1, z1, 0, 1); run(x0, z0, x0, z1, -1, 0); run(x1, z1, x1, cz + sw + 0.3, 1, 0); run(x1, cz - sw - 0.3, x1, z0, 1, 0);
}
/**
 * sub_shrine: a small temple { c, w, h, y, face ('e' | 'n' | 's' | 'w') } — on a moulded base, the
 * sanctum under its curvilinear tower, and before its door an entrance porch: two pillars, the
 * seat-backs at the sides, a little stepped roof (Lakshmana's corner shrines: "each … like a
 * separate temple with a sanctum and entrance porch"). Without face: no porch.
 */
function shrine(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, w = el.w, y = el.y ?? 0, h = el.h, f = el.face;
  shrineCore(el, ctx);
  if (!f) return;
  const d = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] }[f], ux = -d[1], uz = d[0], pd = w * 0.62, pw = w * 0.4;
  const P = (a, b) => [cx + d[0] * a + ux * b, cz + d[1] * a + uz * b], R = (a0, a1, b0, b1) => { const p = P(a0, b0), q = P(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const base = R(w * 0.75, w * 0.75 + pd, -pw, pw);
  bag.add(S, box(base[0], y - 0.5, base[1], base[2], y + 1.4, base[3])); col.rect(base, y, y + 1.4); col.floor(base, y + 1.4);
  for (const sb of [-1, 1]) { const [px, pz] = P(w * 0.75 + pd - 0.35, sb * (pw - 0.35)); pillar(bag, px, pz, y + 1.4, y + 1.4 + h * 0.3, 0.2); col.rect([px - 0.2, pz - 0.2, px + 0.2, pz + 0.2], y, y + 1.4 + h * 0.3); }
  const roofR = R(w / 2 - 0.1, w * 0.75 + pd + 0.2, -pw - 0.2, pw + 0.2);
  bag.add(S, box(roofR[0], y + 1.4 + h * 0.3, roofR[1], roofR[2], y + 1.4 + h * 0.3 + 0.3, roofR[3]));
  stepped(bag, roofR, y + 1.4 + h * 0.3 + 0.3, h * 0.22, S, 3);
  // the steps down from the porch to the terrace
  const st = R(w * 0.75 + pd, w * 0.75 + pd + 1.2, -0.7, 0.7);
  for (let i = 0; i < 4; i++) { const a0 = w * 0.75 + pd + 1.2 * i / 4, r = R(a0, a0 + 1.2 / 4, -0.7, 0.7), yy = y + 1.4 * (1 - (i + 1) / 5); bag.add(S, box(r[0], y - 0.3, r[1], r[2], yy, r[3])); col.floor(r, yy); }
  void st;
}
/**
 * varaha_mandapa: the boar's pavilion before Lakshmana (c. 900–925; "an oblong pavilion with a pyramidal
 * roof of receding tiers, resting on fourteen plain pillars", on a lofty plinth) { rect, y, plinth, h }:
 * the moulded plinth with its stair on the side facing the temple, the fourteen square pillars round
 * the oblong, the architraves and ceiling, the stepped roof; inside the colossal monolithic Varaha, 2.6
 * m long and 1.7 m high, its whole body carved with rows of little figures.
 */
function varaha(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, ph = el.plinth ?? 2.6, h = el.h ?? 3.6, yf = y + ph, cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
  bag.add(S, box(x0, y - 0.5, z0, x1, yf, z1)); col.rect([x0, z0, x1, z1], y, yf); col.floor([x0, z0, x1, z1], yf);
  for (const [f, o] of [[0.1, 0.25], [0.45, 0.12], [0.75, 0.18], [0.95, 0.1]]) bag.add('sandstone', box(x0 - o, y + ph * f - 0.12, z0 - o, x1 + o, y + ph * f + 0.12, z1 + o));
  // the stair up the west side, toward the temple
  const n = Math.round(ph / 0.22), run = ph * 1.1;
  for (let i = 0; i < n; i++) { const xa = x0 - run * (i + 1) / n, yy = yf - ph * (i + 1) / n + ph / n; bag.add(S, box(xa, y - 0.3, cz - 1.2, xa + run / n, yy, cz + 1.2)); col.floor([xa, cz - 1.2, xa + run / n, cz + 1.2], yy); }
  // fourteen pillars: five along each long side, two more on each short side
  const pts = [];
  for (let i = 0; i < 5; i++) { const x = x0 + 0.5 + (x1 - x0 - 1) * i / 4; pts.push([x, z0 + 0.5], [x, z1 - 0.5]); }
  for (const x of [x0 + 0.5, x1 - 0.5]) for (const t of [1 / 3, 2 / 3]) pts.push([x, z0 + 0.5 + (z1 - z0 - 1) * t]);
  for (const [px, pz] of pts) {
    if (px === x0 + 0.5 && Math.abs(pz - cz) < 1.5) { /* the way in from the stair stays clear between the west pair */ }
    bag.add(S, box(px - 0.32, yf, pz - 0.32, px + 0.32, yf + 0.25, pz + 0.32)); bag.add(S, box(px - 0.22, yf + 0.25, pz - 0.22, px + 0.22, yf + h - 0.35, pz + 0.22)); bag.add(S, box(px - 0.36, yf + h - 0.35, pz - 0.36, px + 0.36, yf + h, pz + 0.36));
    col.rect([px - 0.22, pz - 0.22, px + 0.22, pz + 0.22], yf, yf + h);
  }
  bag.add(S, box(x0, yf + h, z0, x1, yf + h + 0.45, z1));
  stepped(bag, [x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], yf + h + 0.45, (z1 - z0) * 0.55, S, 5);
  // the boar on its pedestal, facing north, its body covered in rows of small carved figures
  const by = yf + 0.45, L = 2.6, H2 = 1.7;
  bag.add(S, box(cx - 1.6, yf, cz - 0.8, cx + 1.6, by, cz + 0.8)); col.rect([cx - 1.6, cz - 0.8, cx + 1.6, cz + 0.8], yf, by + H2);
  const body = lathe([[0.001, -1], [0.55, -0.85], [0.75, -0.4], [0.78, 0.1], [0.7, 0.55], [0.45, 0.88], [0.001, 1]], 14, null, 0, 0, 0);
  body.rotateZ(Math.PI / 2); body.scale(L * 0.42, 0.62, 0.55); body.translate(cx, by + 0.95, cz); bag.add(RELIEF, body);
  for (const [dx, dz] of [[0.75, 0.3], [0.75, -0.3], [-0.75, 0.3], [-0.75, -0.3]]) bag.add(RELIEF, lathe([[0.15, 0], [0.13, 0.55], [0.001, 0.6]], 8, null, cx + dx, by, cz + dz));
  bag.add(RELIEF, lathe([[0.001, 0], [0.3, 0.1], [0.32, 0.35], [0.18, 0.6], [0.08, 0.72], [0.001, 0.74]], 10, null, 0, 0, 0).rotateZ(-Math.PI / 2).translate(cx + 1.0, by + 1.15, cz));
  for (const sz of [-1, 1]) bag.add('ivory', rod([cx + 1.45, by + 1.0, cz + sz * 0.1], [cx + 1.6, by + 1.25, cz + sz * 0.18], 0.035, 5));
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) for (const sz of [-1, 1]) {
    const t = -0.8 + 1.6 * i / 8, yy = by + 0.65 + r * 0.17, rz = 0.55 * Math.sqrt(Math.max(0, 1 - (t / 1.15) ** 2)) * Math.cos((r - 1.2) * 0.5);
    bag.add('sandstone', lathe([[0.03, 0], [0.025, 0.07], [0.001, 0.1]], 4, null, cx + t, yy, cz + sz * rz));
  }
}
/** The sanctum and tower of a small shrine on its base. */
function shrineCore(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w, y = el.y ?? 0, h = el.h;
  bag.add(S, box(cx - w * 0.75, y - 0.5, cz - w * 0.75, cx + w * 0.75, y + 1.4, cz + w * 0.75)); col.rect([cx - w * 0.75, cz - w * 0.75, cx + w * 0.75, cz + w * 0.75], y, y + 1.4); col.floor([cx - w * 0.75, cz - w * 0.75, cx + w * 0.75, cz + w * 0.75], y + 1.4);
  bag.add(S, box(cx - w / 2, y + 1.4, cz - w / 2, cx + w / 2, y + 1.4 + h * 0.35, cz + w / 2)); col.rect([cx - w / 2, cz - w / 2, cx + w / 2, cz + w / 2], y, y + h * 0.4);
  shikhara(bag, cx, cz, y + 1.4 + h * 0.35, w * 0.9, h * 0.6, S, 9);
}
registerStyle('nagara', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, nagara_temple: temple, sub_shrine: shrine, varaha_mandapa: varaha },
  objects: {},
});
