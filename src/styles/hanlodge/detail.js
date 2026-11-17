// Carved and cast detail of the Weiyang landmark (docs/settlements/han-changan.md §4c): the eave-tile ends with their relief and characters, the
// Han bracket cascade with cut and curved arm-ends, balustrades with lattice, stair cheeks, the gilt-bronze horse. Everything here is collected in a
// Mesh (one geometry per material per element), so it adds no draw calls, and no repeated prototype is picked for instancing.
import { fromTriangles, orientOutward } from '../../core/geom.js';
import { limb, ball } from '../qing/carving.js';

const TAU = Math.PI * 2;
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** A collector: convex solids as triangles by material, emptied into the bag as one geometry per material. */
export class Mesh {
  constructor() { this.m = new Map(); }
  arr(mat) { let a = this.m.get(mat); if (!a) this.m.set(mat, a = []); return a; }
  /** A convex prism: the polygon `poly` ([[a, b], …] in the plane of axes A, B at origin O) extruded along C from c0 to c1; open = no back face. */
  solid(mat, O, A, B, C, poly, c0, c1, open = false) {
    const P = (p, c) => [O[0] + A[0] * p[0] + B[0] * p[1] + C[0] * c, O[1] + A[1] * p[0] + B[1] * p[1] + C[1] * c, O[2] + A[2] * p[0] + B[2] * p[1] + C[2] * c];
    const lo = poly.map((p) => P(p, c0)), hi = poly.map((p) => P(p, c1)), n = poly.length, t = [];
    const tri = (a, b, c) => t.push(...a, ...b, ...c);
    for (let i = 1; i < n - 1; i++) { tri(hi[0], hi[i], hi[i + 1]); if (!open) tri(lo[0], lo[i], lo[i + 1]); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; tri(lo[i], lo[j], hi[j]); tri(lo[i], hi[j], hi[i]); }
    // orient each solid outward from its own centre (the faces are convex)
    const c = [0, 0, 0]; for (const p of [...lo, ...hi]) for (let k = 0; k < 3; k++) c[k] += p[k] / (2 * n);
    for (let i = 0; i < t.length; i += 9) {
      const a = t.slice(i, i + 3), b = t.slice(i + 3, i + 6), d = t.slice(i + 6, i + 9), u = sub(b, a), v = sub(d, a);
      const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0];
      const m = [(a[0] + b[0] + d[0]) / 3 - c[0], (a[1] + b[1] + d[1]) / 3 - c[1], (a[2] + b[2] + d[2]) / 3 - c[2]];
      if (nx * m[0] + ny * m[1] + nz * m[2] < 0) { for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; } }
    }
    const out = this.arr(mat); for (let i = 0; i < t.length; i++) out.push(t[i]);
  }
  /** One flat face: the convex polygon `poly` in the plane of A, B at height c along C, facing +C (a relief laid on a flat field, by colour). */
  face(mat, O, A, B, C, poly, c) {
    const P = (p) => [O[0] + A[0] * p[0] + B[0] * p[1] + C[0] * c, O[1] + A[1] * p[0] + B[1] * p[1] + C[1] * c, O[2] + A[2] * p[0] + B[2] * p[1] + C[2] * c];
    const v = poly.map(P), out = this.arr(mat);
    const u = sub(v[1], v[0]), w = sub(v[2], v[0]), n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], up = n[0] * C[0] + n[1] * C[1] + n[2] * C[2] > 0;
    for (let i = 1; i < v.length - 1; i++) out.push(...(up ? [...v[0], ...v[i], ...v[i + 1]] : [...v[0], ...v[i + 1], ...v[i]]));
  }
  /** An axis-aligned box. */
  box(mat, x0, y0, z0, x1, y1, z1) {
    if (x1 - x0 < 1e-5 || y1 - y0 < 1e-5 || z1 - z0 < 1e-5) return;
    this.solid(mat, [x0, y0, z0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [[0, 0], [x1 - x0, 0], [x1 - x0, y1 - y0], [0, y1 - y0]], 0, z1 - z0);
  }
  /** A geometry (a lathe, a limb) kept as it is, by material. */
  geo(mat, g) { const p = (g.index ? g.toNonIndexed() : g).attributes.position.array; const o = this.arr(mat); for (let i = 0; i < p.length; i++) o.push(p[i]); }
  flush(bag) { for (const [mat, a] of this.m) if (a.length) bag.add(mat, fromTriangles(a)); this.m.clear(); }
}
void orientOutward;

// ── the eave-tile ends ─────────────────────────────────────────────────────────────────────────────────────────────────
// Han wadang are round: a raised rim, a field in four parts by a cross, a boss at the middle, in the palaces a character in each part; the
// Weiyang and Changle palaces' read 長生未央 and 長樂未央 (stylised here: three or four strokes to a character, cut as relief).
const GLYPHS = [
  [[-0.7, 0.7, 0.7, 0.7], [-0.6, 0, 0.6, 0], [0, 0.9, 0, -0.9], [-0.7, -0.6, 0.7, -0.6]],              // 長
  [[-0.5, 0.7, 0.5, 0.7], [-0.7, 0, 0.7, 0], [0, 0.9, 0, -0.5], [-0.8, -0.8, 0.8, -0.8]],              // 生
  [[-0.5, 0.65, 0.5, 0.65], [-0.8, 0, 0.8, 0], [0, 0.9, 0, -0.9], [0, -0.2, -0.6, -0.8], [0, -0.2, 0.6, -0.8]],   // 未
  [[-0.6, 0.8, 0.6, 0.8], [-0.6, 0.8, -0.6, 0.3], [0.6, 0.8, 0.6, 0.3], [-0.7, 0, 0.7, 0], [0, 0, -0.7, -0.8], [0, 0, 0.7, -0.8]],  // 央
];
const stroke = (a, b, w) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d * w / 2, ny = dx / d * w / 2;
  return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
};
const ngon = (r, n, rot = 0) => Array.from({ length: n }, (_, i) => [Math.cos(rot + i / n * TAU) * r, Math.sin(rot + i / n * TAU) * r]);

/**
 * The round tile ends along the eave of a hipped roof (the centre cx, cz, half extents A, B, eave height y, the corners' lift as the roof's):
 * every tile a rim, a recessed field, a boss; on the sides in `full` (any of 'n' 's' 'e' 'w') also the cross and the four characters in relief.
 * Collected into M (tile_dark for the rim and the relief, tile_grey for the field).
 */
export function wadang(M, cx, cz, A, B, y, lift = 0.5, step = 0.46, r = 0.19, full = '') {
  const yAt = (x, z) => { const ax = Math.abs(x - cx), az = Math.abs(z - cz), c = Math.max(0, 1 - (A - ax) / 5) * Math.max(0, 1 - (B - az) / 5); return y + lift * c * c - 0.15; };
  const one = (x, z, nx, nz, rich) => {
    const yy = yAt(x, z), O = [x + nx * 0.03, yy, z + nz * 0.03], T = [-nz, 0, nx], U = [0, 1, 0], N = [nx, 0, nz], j = ((x * 7 + z * 13) % 1) * 0.003;   // (a millimetre between neighbours)
    M.face('tile_dark', O, T, U, N, ngon(r + j, 8, 0.39), 0.02);                       // the rim
    M.face('tile_grey', O, T, U, N, ngon(r * 0.84, 8, 0.39), 0.035);                  // the field
    M.face('tile_dark', O, T, U, N, ngon(r * 0.2, 6), 0.05);                           // the boss
    if (!rich) return;
    const w = r * 0.07;
    M.face('tile_dark', O, T, U, N, stroke([-r * 0.84, 0], [r * 0.84, 0], w), 0.05);
    M.face('tile_dark', O, T, U, N, stroke([0, -r * 0.84], [0, r * 0.84], w), 0.05);
    GLYPHS.forEach((g, q) => {
      const gx = (q & 1 ? 1 : -1) * r * 0.46, gy = (q & 2 ? -1 : 1) * r * 0.46, s = r * 0.3;
      for (const st of g) M.face('tile_dark', O, T, U, N, stroke([gx + st[0] * s, gy + st[1] * s], [gx + st[2] * s, gy + st[3] * s], r * 0.06), 0.05);
    });
  };
  for (let x = cx - A + step / 2; x < cx + A; x += step) { one(x, cz - B, 0, -1, full.includes('n')); one(x, cz + B, 0, 1, full.includes('s')); }
  for (let z = cz - B + step / 2; z < cz + B; z += step) { one(cx - A, z, -1, 0, full.includes('w')); one(cx + A, z, 1, 0, full.includes('e')); }
}

// ── the bracket cascade ──────────────────────────────────────────────────────────────────────────────────────────────────
const armPoly = (L, h, tip) => [[0, 0], [L - tip, 0], [L - tip * 0.45, tip * 0.12], [L, tip * 0.4], [L, h], [0, h]];           // lower edge cut up toward the end
/**
 * The Han bracket cascade over one column of a face: base cap block, two tiers of arms reaching out (the ends cut up in a curve) and across
 * (the same, so that the arms of neighbouring columns nearly meet), cap blocks between the tiers. f: { P(u, n, y) → world, U, N } of the face.
 */
export function bracketSet(M, f, u, y0, reach = 1.95) {
  const Y = [0, 1, 0], O = f.P(u, 0, 0), L2 = reach, L1 = Math.min(1.05, L2 * 0.55);
  const neg = (v) => [-v[0], -v[1], -v[2]];
  const out = (mat, n0, n1, yy, h, w, tip) => M.solid(mat, O, f.N, Y, f.U, armPoly(n1 - n0, h, tip).map(([a, b]) => [a + n0, b + yy]), -w / 2, w / 2);
  const across = (mat, hw, yy, h, w, tip) => M.solid(mat, O, f.U, Y, f.N, [[-hw, yy + tip * 0.4], [-hw + tip * 0.45, yy + tip * 0.12], [-hw + tip, yy], [hw - tip, yy], [hw - tip * 0.45, yy + tip * 0.12], [hw, yy + tip * 0.4], [hw, yy + h], [-hw, yy + h]], -w / 2, w / 2);
  const blk = (n0, n1, u0, u1, y1, y2) => M.solid('paint_ochre', O, f.U, Y, f.N, [[u0, y1], [u1, y1], [u1, y2], [u0, y2]], n0, n1);
  const hw1 = 1.0, hw2 = Math.min(1.7, 3.0 - 0.05);
  void neg;
  blk(-0.38, 0.38, -0.38, 0.38, y0, y0 + 0.36);                                                  // the base cap block
  blk(-0.44, 0.44, -0.44, 0.44, y0 + 0.3, y0 + 0.4);                                              // its flared lip
  const y1 = y0 + 0.4;
  out('timber_red', -0.2, L1, y1, 0.3, 0.3, 0.32); across('timber_red', hw1, y1, 0.3, 0.3, 0.3);   // first tier
  const y2 = y1 + 0.3;
  blk(L1 - 0.34, L1, -0.17, 0.17, y2, y2 + 0.26);                                                   // the cap blocks on its ends
  for (const s of [-1, 1]) blk(-0.17, 0.17, s * (hw1 - 0.17) - 0.17, s * (hw1 - 0.17) + 0.17, y2, y2 + 0.26);
  const y3 = y2 + 0.26;
  out('timber_red', L1 - 0.34, L2, y3, 0.3, 0.3, 0.4); across('timber_red', hw2, y3, 0.3, 0.3, 0.36);   // second tier
}
/** The face frame of a rectangle's side: 'n' 's' 'e' 'w' at the line c (z for n and s, x for e and w). */
export function faceOf(side, c) {
  const alongX = side === 'n' || side === 's', sg = side === 'n' || side === 'w' ? -1 : 1;
  const N = alongX ? [0, 0, sg] : [sg, 0, 0], U = alongX ? [1, 0, 0] : [0, 0, 1];
  return { U, N, sg, alongX, P: (u, n, y) => (alongX ? [u, y, c + sg * n] : [c + sg * n, y, u]) };
}

// ── balustrades ──────────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * A lattice balustrade between two posts, on a line from a to b (x, z) rising from ya to yb at the foot of the rail: sill stone, lower and upper
 * rail, a cross of two bars in the bay, the posts with their caps. Posts are placed by the caller's loop (balustradeRun).
 */
export function balustradeRun(M, a, b, ya, yb, o = {}) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), step = o.step ?? 3, n = Math.max(1, Math.round(L / step)), H = o.h ?? 1.1;
  const ux = dx / L, uz = dz / L, T = [ux, 0, uz], Y = [0, 1, 0], Nn = [-uz, 0, ux];
  const at = (t) => [a[0] + dx * t, a[1] + dz * t];
  const hy = (t) => ya + (yb - ya) * t;
  const pt = (t) => [...at(t)];
  const rect = (mat, t0, t1, y0, y1, th, w) => {                       // a bar along the run, between t0 and t1, y0 at t0, y1 at t1 (the lower edge), th high, w thick
    const [px, pz] = pt(t0), O = [px, 0, pz], l = (t1 - t0) * L;
    M.solid(mat, O, T, Y, Nn, [[0, y0], [l, y1], [l, y1 + th], [0, y0 + th]], -w / 2, w / 2);
  };
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    rect('bluestone', t0, t1, hy(t0), hy(t1), 0.22, 0.34);                                               // the sill
    rect('lacquer_red', t0, t1, hy(t0) + 0.22, hy(t1) + 0.22, 0.1, 0.12);                                 // the lower rail
    rect('lacquer_red', t0, t1, hy(t0) + H - 0.12, hy(t1) + H - 0.12, 0.13, 0.16);                          // the rail (xunzhang)
    // the cross of bars in the bay (the Han balustrade's x-pattern)
    const ia = hy(t0) + 0.32, ib = hy(t1) + 0.32, ja = hy(t0) + H - 0.14, jb = hy(t1) + H - 0.14;
    for (const [p0, p1] of [[ia, jb], [ja, ib]]) {
      const l = (t1 - t0) * L, [px, pz] = pt(t0), w = 0.06;
      const d = Math.hypot(l, p1 - p0), ox = -(p1 - p0) / d * 0.03, oy = l / d * 0.03;
      M.solid('lacquer_red', [px, 0, pz], T, Y, Nn, [[ox, p0 + oy], [l + ox, p1 + oy], [l - ox, p1 - oy], [-ox, p0 - oy]], -w / 2, w / 2);
    }
  }
  for (let i = 0; i <= n; i++) {
    const t = i / n, [px, pz] = pt(t), y = hy(t), w = 0.2;
    M.box('lacquer_red', px - w / 2, y, pz - w / 2, px + w / 2, y + H + 0.1, pz + w / 2);
    M.box('gilt_bronze', px - w / 2 - 0.03, y + H + 0.1, pz - w / 2 - 0.03, px + w / 2 + 0.03, y + H + 0.17, pz + w / 2 + 0.03);
    M.box('gilt_bronze', px - 0.06, y + H + 0.17, pz - 0.06, px + 0.06, y + H + 0.32, pz + 0.06);
  }
}

// ── the gilt-bronze horse ────────────────────────────────────────────────────────────────────────────────────────────────
/** A standing horse of the slim western (Dayuan) breed at (x, y, z), facing (fx, fz); the near fore-leg lifted. s scales (1 = 1.6 m at the withers). */
export function horse(bag, x, y, z, fx, fz, s = 1) {
  const ux = -fz, uz = fx, P = (a, h, b) => [x + (fx * a + ux * b) * s, y + h * s, z + (fz * a + uz * b) * s];     // a forward, h up, b to the side
  const L = (p, q, r0, r1, mat = 'gilt_bronze') => bag.add(mat, limb(p, q, r0 * s, r1 * s, 6));
  const Bl = (c, rx, ry, rz, mat = 'gilt_bronze') => { const g = ball(rx * s, ry * s, rz * s, 8, 5); g.rotateY(Math.atan2(fx, fz)); g.translate(c[0], c[1], c[2]); bag.add(mat, g); };
  Bl(P(0, 1.28, 0), 0.3, 0.34, 0.78); Bl(P(0.5, 1.34, 0), 0.28, 0.34, 0.3); Bl(P(-0.55, 1.32, 0), 0.3, 0.32, 0.36);      // barrel, chest, croup
  L(P(0.62, 1.4, 0), P(0.98, 2.0, 0), 0.2, 0.12);                                                                       // the arched neck
  L(P(0.98, 2.0, 0), P(1.34, 1.74, 0), 0.12, 0.075); Bl(P(1.4, 1.7, 0), 0.075, 0.09, 0.12);                             // head and muzzle
  for (const sd of [-1, 1]) L(P(1.0, 2.02, sd * 0.06), P(1.0, 2.26, sd * 0.07), 0.03, 0.005);                           // ears
  L(P(0.6, 1.65, 0), P(0.9, 2.12, 0), 0.025, 0.02);                                                                       // the mane's ridge
  L(P(-0.78, 1.5, 0), P(-1.1, 1.0, 0), 0.07, 0.035); L(P(-1.1, 1.0, 0), P(-1.05, 0.55, 0), 0.04, 0.012);                // the tail
  for (const [a, sd] of [[0.5, -1], [-0.5, -1], [-0.5, 1]]) {                                                                // three legs down (the fore-leg of the far side, both hind)
    const b = sd * 0.16, hind = a < 0;
    L(P(a, 1.1, b), P(a + (hind ? -0.08 : 0.02), 0.55, b), 0.11, 0.065); L(P(a + (hind ? -0.08 : 0.02), 0.55, b), P(a + (hind ? -0.02 : 0.02), 0.07, b), 0.05, 0.04);
    L(P(a + (hind ? -0.02 : 0.02), 0.07, b), P(a + (hind ? -0.02 : 0.02), 0.0, b), 0.06, 0.055, 'bronze');
  }
  L(P(0.5, 1.1, 0.16), P(0.72, 0.62, 0.16), 0.11, 0.065); L(P(0.72, 0.62, 0.16), P(0.82, 0.78, 0.16), 0.05, 0.04);       // the lifted fore-leg, the knee bent
}
