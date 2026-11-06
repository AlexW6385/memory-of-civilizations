// Notre-Dame de Paris as it stood about 1248 (docs/settlements/paris.md §1a): the west front of
// three portals, the Gallery of Kings, the rose and the great gallery, the twin towers with their
// belfry bays; the nave and choir under a steep lead roof with the enlarged clerestory of two
// lancets and an oculus, the tribunes, the outer aisles and the new chapels between the uprights
// of the flying buttresses; the transept with its roses; the apse; the timber and lead spire over
// the crossing; gargoyles. Registered into the `gothic` style as `notre_dame`.
//
// The element: { rect [x0, z0, x1, z1] (the west front at x0, about 128 × 48 m), y }.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall, archHalf, archRise } from '../byzantine/index.js';
import './index.js';

const L = 'limestone', CARVE = 'stucco', LEAD = 'lead';
const D2R = Math.PI / 180;

// ── geometry helpers ───────────────────────────────────────────────────────────────────────────

/** A convex prism: a planar convex polygon (3D points) pushed along d. */
function prism(out, poly, d) {
  const n = poly.length, top = poly.map((p) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]]), t = [];
  for (let i = 1; i < n - 1; i++) t.push(...poly[0], ...poly[i], ...poly[i + 1], ...top[0], ...top[i + 1], ...top[i]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...poly[i], ...poly[j], ...top[j], ...poly[i], ...top[j], ...top[i]); }
  out.push(...orientOutward(t));
}
/** Convex hexahedron from 8 corners (bottom 4, top 4, same order). */
function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}
/** Bars along a polyline in a vertical plane { o [x, z], u [ux, uz] } — pts [[u, y] …], width w, depth d, offset off along the normal. */
function bars(out, o, u, pts, w, d, off = 0) {
  const n = [-u[1], u[0]];
  for (let k = 0; k < pts.length - 1; k++) {
    const [ua, ya] = pts[k], [ub, yb] = pts[k + 1];
    const tx = ub - ua, ty = yb - ya, Ln = Math.hypot(tx, ty) || 1, px = -ty / Ln * w / 2, py = tx / Ln * w / 2;
    const W = (uu, yy, s) => [o[0] + u[0] * uu + n[0] * (off + s), yy, o[1] + u[1] * uu + n[1] * (off + s)];
    hexa(out, [W(ua - px, ya - py, -d / 2), W(ua + px, ya + py, -d / 2), W(ub + px, yb + py, -d / 2), W(ub - px, yb - py, -d / 2)],
      [W(ua - px, ya - py, d / 2), W(ua + px, ya + py, d / 2), W(ub + px, yb + py, d / 2), W(ub - px, yb - py, d / 2)]);
  }
}
const ringPts = (uc, yc, r, n = 24, a0 = 0, a1 = 2 * Math.PI) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [uc + r * Math.cos(a), yc + r * Math.sin(a)]; });
/** The two halves of a pointed arch of half-width r, springing at s (f: arc radius / span), as one polyline from left foot over the crown to the right foot. */
const pointedPts = (uc, r, s, f, n = 10) => {
  const a = { r, pointed: f }, H = archRise(a), side = (sg) => Array.from({ length: n + 1 }, (_, k) => { const dy = H * k / n; return [uc + sg * archHalf(a, dy), s + dy]; });
  return [...side(-1), ...side(1).reverse()];
};

// ── sculpture ──────────────────────────────────────────────────────────────────────────────────

/**
 * A standing figure in carved stone, h tall, its foot at (x, y, z): a robe falling in vertical
 * folds, the shoulders, the head; `crown` (the kings), `book`, `wings` (an angel: two blades
 * behind the shoulders, turned to face along f), `seat` (enthroned: the knees forward along f).
 */
function figure(bag, x, y, z, h, o = {}) {
  const rb = 0.13 * h, m = o.mat || CARVE, f = o.face || [-1, 0];
  const folds = (th, i) => (i > 0 && i < 4 ? 1 + 0.07 * Math.cos(9 * th) : 1);
  if (o.seat) {
    // enthroned: the throne behind, the lap and the knees forward, the robe falling to the feet
    const s = h * 0.62;
    bag.add(m, box(x - 0.2 * h * Math.abs(f[1]) - 0.16 * h * Math.abs(f[0]), y, z - 0.2 * h * Math.abs(f[0]) - 0.16 * h * Math.abs(f[1]), x + 0.2 * h * Math.abs(f[1]) + 0.16 * h * Math.abs(f[0]), y + s * 0.5, z + 0.2 * h * Math.abs(f[0]) + 0.16 * h * Math.abs(f[1])));
    bag.add(m, lathe([[rb * 1.25, 0], [rb * 1.2, 0.08 * h], [rb * 0.95, 0.34 * h], [rb * 0.85, 0.42 * h], [rb * 0.45, 0.47 * h], [0.001, 0.48 * h]], 10, folds, x + f[0] * 0.08 * h, y + s * 0.46, z + f[1] * 0.08 * h));
    bag.add(m, lathe([[rb * 1.05, 0], [rb * 1.2, s * 0.48], [0.001, s * 0.5]], 10, folds, x + f[0] * 0.14 * h, y, z + f[1] * 0.14 * h));
    bag.add(m, lathe([[0.001, 0], [0.065 * h, 0.03 * h], [0.068 * h, 0.1 * h], [0.04 * h, 0.14 * h], [0.001, 0.145 * h]], 8, null, x + f[0] * 0.08 * h, y + s * 0.46 + 0.47 * h, z + f[1] * 0.08 * h));
    return;
  }
  bag.add(m, lathe([[rb * 1.08, 0], [rb, 0.06 * h], [rb * 0.86, 0.42 * h], [rb * 0.8, 0.62 * h], [rb * 0.92, 0.74 * h], [rb * 0.55, 0.81 * h], [0.001, 0.815 * h]], 10, folds, x, y, z));
  bag.add(m, lathe([[0.001, 0], [0.05 * h, 0.02 * h], [0.058 * h, 0.08 * h], [0.045 * h, 0.13 * h], [0.001, 0.14 * h]], 8, null, x, y + 0.8 * h, z));
  if (o.crown) bag.add(o.crownMat || 'paint_ochre', lathe([[0.056 * h, 0], [0.06 * h, 0.05 * h], [0.045 * h, 0.05 * h], [0.045 * h, 0.01 * h]], 8, (th, i) => (i === 1 ? 1 + 0.25 * Math.max(0, Math.cos(4 * th)) : 1), x, y + 0.9 * h, z));
  if (o.book) bag.add(m, box(x + f[0] * rb - 0.05 * h, y + 0.5 * h, z + f[1] * rb - 0.05 * h, x + f[0] * rb + 0.05 * h, y + 0.6 * h, z + f[1] * rb + 0.05 * h));
  if (o.wings) {
    const sx = -f[1], sz = f[0], out = [];
    for (const s of [-1, 1]) {
      const base = [x - f[0] * rb * 0.5 + sx * s * rb * 0.5, y + 0.72 * h, z - f[1] * rb * 0.5 + sz * s * rb * 0.5];
      const tip = [base[0] + sx * s * 0.26 * h - f[0] * 0.06 * h, y + 0.98 * h, base[2] + sz * s * 0.26 * h - f[1] * 0.06 * h];
      const low = [base[0] + sx * s * 0.12 * h - f[0] * 0.05 * h, y + 0.3 * h, base[2] + sz * s * 0.12 * h - f[1] * 0.05 * h];
      prism(out, [base, tip, low], [-f[0] * 0.03 * h, 0, -f[1] * 0.03 * h]);
    }
    bag.add(m, fromTriangles(out));
  }
}

/** A crocketed pinnacle: a square shaft with a gablet on each face, a spirelet with crockets on its edges, a finial. */
function pinnacle(bag, x, y, z, w, h, m = L) {
  const s = w / 2, hs = h * 0.34, hg = h * 0.16, out = [];
  out.push(...box(x - s, y, z - s, x + s, y + hs, z + s).attributes.position.array);
  // the gablets: a triangle on each face, standing a little proud
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const ux = -dz, uz = dx, c = [x + dx * (s + 0.02), z + dz * (s + 0.02)];
    prism(out, [[c[0] - ux * s, y + hs, c[1] - uz * s], [c[0] + ux * s, y + hs, c[1] + uz * s], [c[0], y + hs + hg, c[1]]], [-dx * 0.12, 0, -dz * 0.12]);
  }
  bag.add(m, fromTriangles(out));
  bag.add(m, frustum([x - s * 0.92, z - s * 0.92, x + s * 0.92, z + s * 0.92], y + hs, y + h, s * 0.9, s * 0.9, s * 0.9, s * 0.9));
  // crockets up the four edges, a finial of four leaves
  const cr = [];
  for (let k = 1; k <= 3; k++) {
    const t = k / 4.2, yy = y + hs + (h - hs) * t, e = s * 0.92 * (1 - t * 0.98);
    for (const [ex, ez] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) cr.push(...box(x + ex * e - 0.07, yy, z + ez * e - 0.07, x + ex * e + 0.07, yy + 0.14, z + ez * e + 0.07).attributes.position.array);
  }
  cr.push(...box(x - 0.16, y + h - 0.05, z - 0.04, x + 0.16, y + h + 0.06, z + 0.04).attributes.position.array, ...box(x - 0.04, y + h - 0.05, z - 0.16, x + 0.04, y + h + 0.06, z + 0.16).attributes.position.array);
  bag.add(m, fromTriangles(cr));
  bag.add(m, lathe([[0.06, 0], [0.09, 0.2], [0.001, 0.42]], 6, null, x, y + h + 0.06, z));
}

/** A gargoyle: a beast's body run out from the wall along d (horizontal unit vector), its jaws open to spout the rain. */
function gargoyle(bag, x, y, z, d, len = 1.6) {
  const sx = -d[1], sz = d[0], out = [];
  const P = (t, s, v) => [x + d[0] * t + sx * s, y + v, z + d[1] * t + sz * s];
  const sec = (t, hw, v0, v1) => [P(t, -hw, v0), P(t, hw, v0), P(t, hw, v1), P(t, -hw, v1)];
  const seg = (t0, t1, a, b) => { const A = sec(t0, ...a), B = sec(t1, ...b); hexa(out, [A[0], A[1], B[1], B[0]], [A[3], A[2], B[2], B[3]]); };
  seg(-0.3, len * 0.55, [0.24, -0.22, 0.24], [0.2, -0.17, 0.2]);                    // the body, from inside the wall
  seg(len * 0.55, len * 0.8, [0.2, -0.12, 0.22], [0.15, -0.02, 0.24]);               // the neck, raised
  seg(len * 0.8, len, [0.15, 0.03, 0.24], [0.1, 0.06, 0.2]);                          // the upper jaw
  seg(len * 0.78, len * 0.97, [0.12, -0.1, -0.01], [0.08, -0.12, -0.05]);             // the lower jaw, dropped
  for (const s of [-1, 1]) {                                                            // the forelegs gripping the cornice
    const a = P(len * 0.35, s * 0.18, -0.18), b = P(len * 0.42, s * 0.18, -0.5);
    hexa(out, [[a[0] - 0.06, a[1], a[2] - 0.06], [a[0] + 0.06, a[1], a[2] - 0.06], [a[0] + 0.06, a[1], a[2] + 0.06], [a[0] - 0.06, a[1], a[2] + 0.06]], [[b[0] - 0.05, b[1], b[2] - 0.05], [b[0] + 0.05, b[1], b[2] - 0.05], [b[0] + 0.05, b[1], b[2] + 0.05], [b[0] - 0.05, b[1], b[2] + 0.05]]);
    prism(out, [P(len * 0.2, s * 0.2, 0.15), P(len * 0.5, s * 0.42, 0.42), P(len * 0.55, s * 0.2, 0.12)], [-sx * s * 0.04, 0, -sz * s * 0.04]);   // the folded wings
  }
  bag.add(L, fromTriangles(out));
}

// ── windows, rose ─────────────────────────────────────────────────────────────────────────────

/** A window in a wall plane via the style's gothic_window: { o, u, uc, w, sill, spring, lancets, inSide }. */
const win = (ctx, o, u, uc, w, sill, spring, lancets, inSide, f = 0.75) => STYLES.gothic.elements.gothic_window({ o, u, uc, w, sill, spring, lancets, inSide, f }, ctx);

/**
 * The west rose (about 1225; 9.6 m): glass in two layers; a central oculus, twelve spokes to a
 * ring, twenty-four colonnettes to the rim, each pair of them under a little pointed arch; the
 * moulded rim. In the plane { o, u } at (uc, yc), radius r.
 */
function roseND(bag, o, u, uc, yc, r, inSide, depth = 0.42) {
  const n = [-u[1], u[0]];
  const disc = (off, mat) => {
    const tris = [], N = 48, W = (uu, yy) => [o[0] + u[0] * uu + n[0] * off, yy, o[1] + u[1] * uu + n[1] * off];
    for (let k = 0; k < N; k++) { const a = 2 * Math.PI * k / N, b = 2 * Math.PI * (k + 1) / N; tris.push(...W(uc, yc), ...W(uc + r * Math.cos(a), yc + r * Math.sin(a)), ...W(uc + r * Math.cos(b), yc + r * Math.sin(b))); tris.push(...W(uc, yc), ...W(uc + r * Math.cos(b), yc + r * Math.sin(b)), ...W(uc + r * Math.cos(a), yc + r * Math.sin(a))); }
    bag.add(mat, fromTriangles(tris));
  };
  disc(inSide * 0.03, 'stained_glass'); disc(-inSide * 0.03, 'glass_outer');
  const t = [], r0 = r * 0.2, r1 = r * 0.5;
  bars(t, o, u, ringPts(uc, yc, r, 40), 0.34, depth + 0.08);
  bars(t, o, u, ringPts(uc, yc, r1, 32), 0.2, depth);
  bars(t, o, u, ringPts(uc, yc, r0, 20), 0.2, depth);
  for (let k = 0; k < 12; k++) { const a = 2 * Math.PI * (k + 0.5) / 12; bars(t, o, u, [[uc + r0 * Math.cos(a), yc + r0 * Math.sin(a)], [uc + r1 * Math.cos(a), yc + r1 * Math.sin(a)]], 0.15, depth); }
  // the inner ring's twelve trefoil heads, between the spokes
  for (let k = 0; k < 12; k++) { const a0 = 2 * Math.PI * (k + 0.5) / 12, a1 = 2 * Math.PI * (k + 1.5) / 12, am = (a0 + a1) / 2; bars(t, o, u, ringPts(uc + Math.cos(am) * r1 * 0.78, yc + Math.sin(am) * r1 * 0.78, r1 * 0.17, 10, am - Math.PI * 0.75, am + Math.PI * 0.75), 0.09, depth * 0.8); }
  // the outer zone: twenty-four colonnettes, the arches over them, a ring of small oculi under the rim
  for (let k = 0; k < 24; k++) { const a = 2 * Math.PI * (k + 0.25) / 24; bars(t, o, u, [[uc + r1 * Math.cos(a), yc + r1 * Math.sin(a)], [uc + r * 0.84 * Math.cos(a), yc + r * 0.84 * Math.sin(a)]], 0.11, depth * 0.9); }
  for (let k = 0; k < 24; k++) {
    const a0 = 2 * Math.PI * (k + 0.25) / 24, a1 = 2 * Math.PI * (k + 1.25) / 24, am = (a0 + a1) / 2, rr = r * 0.84;
    const A = [uc + rr * Math.cos(a0), yc + rr * Math.sin(a0)], B = [uc + rr * Math.cos(a1), yc + rr * Math.sin(a1)], C = [uc + r * 0.9 * Math.cos(am), yc + r * 0.9 * Math.sin(am)];
    bars(t, o, u, [A, [(A[0] + C[0]) / 2 + Math.cos(am) * 0.05, (A[1] + C[1]) / 2 + Math.sin(am) * 0.05], C, [(B[0] + C[0]) / 2 + Math.cos(am) * 0.05, (B[1] + C[1]) / 2 + Math.sin(am) * 0.05], B], 0.09, depth * 0.8);
    bars(t, o, u, ringPts(uc + r * 0.955 * Math.cos(am), yc + r * 0.955 * Math.sin(am), r * 0.035, 8), 0.06, depth * 0.7);
  }
  bag.add(L, fromTriangles(t));
}

// ── the portals ────────────────────────────────────────────────────────────────────────────────

/**
 * A portal of the west front, in the bay z0…z1 of a wall whose face is at x (the portal facing −x):
 * N orders stepping in and back from the outer arch (half-width W0) to the door, each a slice of the
 * wall with a pointed opening; on each step below the springing a column-statue on its corbel under a
 * canopy, on each step above it a file of small figures up the archivolt; the trumeau with its figure;
 * the lintels and the tympanum with their figures; the doors with their ironwork. The slices run back
 * to xBack, where the core of the front stands.
 */
function portal(bag, col, p) {
  const { x, z0, z1, y, W0, N, dw, dd, spring: S, xBack, top, f = 0.75 } = p;
  const zc = (z0 + z1) / 2, wN = W0 - N * dw, xEnd = x + N * dd;
  const o = [x, z0], u = [0, 1], uc = zc - z0;
  for (let k = 0; k < N; k++) {
    const r = W0 - k * dw;
    bag.add(L, planarWall({ o: [x + (k + 0.5) * dd, z0], u, th: dd, u0: 0, u1: z1 - z0, y0: y, y1: k === 0 ? y + top : y + S + archRise({ r: W0, pointed: f }) + 0.3, arches: [{ uc, r, spring: y + S, sill: y, pointed: f }] }));
  }
  // the back slice: the tympanum's field over the door
  const doorTop = y + p.door;
  bag.add(L, planarWall({ o: [(xEnd + xBack) / 2, z0], u, th: xBack - xEnd, u0: 0, u1: z1 - z0, y0: y, y1: y + top, holes: [{ u0: uc - wN, u1: uc + wN, y0: y, y1: doorTop }] }));
  // the socle: a moulded base and a shelf at the statues' feet along the steps
  for (const s of [-1, 1]) for (let k = 0; k < N; k++) {
    const za = zc + s * (W0 - k * dw), zb = zc + s * (W0 - (k + 1) * dw), xa = x + (k + 1) * dd;
    bag.add(L, box(xa - 0.12, y, Math.min(za, zb) - 0.0, xa + 0.02, y + 0.35, Math.max(za, zb) + 0.0));
    bag.add(L, box(xa - 0.16, y + p.base - 0.18, Math.min(za, zb), xa + 0.02, y + p.base, Math.max(za, zb)));
    // the colonnette in the corner of the step, the statue before it on its corbel, the canopy over its head
    const zcol = zc + s * (W0 - (k + 1) * dw);
    bag.add(L, lathe([[0.08, 0], [0.08, S - p.base]], 8, null, x + (k + 1) * dd - 0.02, y + p.base, zcol));
    const zs = zc + s * (W0 - (k + 0.5) * dw), xs = xa - 0.27, hS = p.statue;
    bag.add(L, lathe([[0.001, -0.26], [0.2, -0.06], [0.24, 0]], 8, null, xs, y + p.base + 0.26, zs));
    figure(bag, xs, y + p.base + 0.26, zs, hS, { book: k % 2 === 0, crown: p.crowns && k % 3 === 1 });
    const cy = y + p.base + 0.26 + hS + 0.12;
    bag.add(L, box(xs - 0.26, cy, zs - 0.2, xs + 0.24, cy + 0.22, zs + 0.2));
    bag.add(L, frustum([xs - 0.26, zs - 0.2, xs + 0.24, zs + 0.2], cy + 0.22, cy + 0.62, 0.2, 0.2, 0.15, 0.15));
  }
  // the archivolts' figures: on each step above the springing, small seated figures one above another
  for (let k = 0; k < N; k++) {
    const rm = W0 - (k + 0.5) * dw, a = { r: rm, pointed: f }, H = archRise(a), xs = x + (k + 1) * dd - 0.12;
    const n = Math.max(3, Math.round((H * 1.25) / 0.66));
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
      const dy = H * (i + 0.15) / (n + 0.2), zz = zc + s * archHalf(a, dy);
      if (dy > H - 0.45) continue;
      figure(bag, xs, y + S + dy - 0.08, zz, 0.58, { seat: i % 2 === 1, face: [-1, 0] });
    }
  }
  // the trumeau, its figure, the doors with their iron hinges
  const xd = xBack - 0.22;
  bag.add(L, box(xEnd - 0.35, y, zc - 0.36, xBack, doorTop, zc + 0.36));
  bag.add(L, lathe([[0.001, -0.3], [0.24, -0.06], [0.3, 0]], 8, null, xEnd - 0.55, y + 1.6, zc));
  figure(bag, xEnd - 0.55, y + 1.6, zc, p.statue * 1.05, { book: true, crown: p.trumeauCrown });
  bag.add(L, box(xEnd - 0.84, y + 1.72 + p.statue * 1.05, zc - 0.3, xEnd - 0.28, y + 2.0 + p.statue * 1.05, zc + 0.3));
  for (const s of [-1, 1]) {
    const za = zc + s * 0.36, zb = zc + s * wN, zl = Math.min(za, zb), zh = Math.max(za, zb);
    bag.add('wood_dark', box(xd - 0.08, y, zl + 0.01, xd + 0.08, doorTop - 0.01, zh - 0.01));
    const iron = [];
    for (const hy of [0.18, 0.42, 0.66, 0.88]) {
      const yy = y + p.door * hy;
      iron.push(...box(xd - 0.12, yy - 0.05, zl + 0.1, xd - 0.08, yy + 0.05, zh - 0.1).attributes.position.array);
      // the scrolls branching off each strap
      for (let q = 1; q < 4; q++) { const zq = zl + (zh - zl) * q / 4; bars(iron, [xd - 0.1, 0], [0, 1], ringPts(zq, yy + 0.32, 0.28, 8, -Math.PI * 0.95, -Math.PI * 0.05), 0.04, 0.035); bars(iron, [xd - 0.1, 0], [0, 1], ringPts(zq, yy - 0.32, 0.28, 8, Math.PI * 0.05, Math.PI * 0.95), 0.04, 0.035); }
    }
    bag.add('iron', fromTriangles(iron));
  }
  // lintels and tympanum: two bands of figures and the field above with its own
  const tA = { r: wN, pointed: f }, TH = archRise(tA), ty = y + S;
  const band = (y0, y1) => { bag.add(L, box(xEnd - 0.3, y0, zc - wN, xEnd + 0.02, y0 + 0.14, zc + wN)); bag.add(L, box(xEnd - 0.32, y1 - 0.14, zc - wN, xEnd + 0.02, y1, zc + wN)); };
  const L1 = doorTop, L2 = doorTop + p.lintel, L3 = L2 + p.lintel * 1.15;
  band(L1, L2); band(L2, Math.min(L3, ty));
  const row = (y0, h, n, opts = () => ({})) => { for (let i = 0; i < n; i++) { const zz = zc - wN + (i + 0.5) * 2 * wN / n; figure(bag, xEnd - 0.14, y0, zz, h, opts(i, zz)); } };
  const { scheme } = p;
  if (scheme === 'judgement') {
    // the dead rising from their tombs below; the weighing of souls above, the elect to the left, the damned to the right
    for (let i = 0; i < 7; i++) { const zz = zc - wN + (i + 0.5) * 2 * wN / 7; bag.add(L, box(xEnd - 0.34, L1 + 0.14, zz - 0.3, xEnd - 0.04, L1 + 0.42, zz + 0.3)); }
    row(L1 + 0.3, p.lintel - 0.5, 9);
    row(L2 + 0.14, p.lintel * 1.15 - 0.36, 13, (i) => ({ wings: i === 6, seat: false }));
    figure(bag, xEnd - 0.2, ty + 0.2, zc, TH * 0.62, { seat: true });                      // Christ in judgement
    for (const s of [-1, 1]) { figure(bag, xEnd - 0.16, ty + 0.15, zc + s * wN * 0.42, TH * 0.44, { wings: true }); figure(bag, xEnd - 0.16, ty + 0.1, zc + s * wN * 0.72, TH * 0.3, { seat: true }); }
  } else if (scheme === 'virgin') {
    // prophets and kings by the Ark below; the Virgin's death among the apostles; her coronation above
    bag.add(L, box(xEnd - 0.36, L1 + 0.14, zc - 0.5, xEnd - 0.04, L1 + 0.6, zc + 0.5));
    row(L1 + 0.14, p.lintel - 0.3, 6, (i) => ({ crown: i > 2 }));
    bag.add(L, box(xEnd - 0.4, L2 + 0.35, zc - wN * 0.6, xEnd - 0.06, L2 + 0.6, zc + wN * 0.6));
    row(L2 + 0.14, p.lintel * 1.15 - 0.34, 12);
    figure(bag, xEnd - 0.2, ty + 0.15, zc - wN * 0.2, TH * 0.55, { seat: true });
    figure(bag, xEnd - 0.2, ty + 0.15, zc + wN * 0.2, TH * 0.55, { seat: true });
    figure(bag, xEnd - 0.16, ty + TH * 0.4, zc, TH * 0.3, { wings: true });
    for (const s of [-1, 1]) figure(bag, xEnd - 0.16, ty + 0.1, zc + s * wN * 0.68, TH * 0.36, { wings: true });
  } else {
    // Saint Anne: the lives of Anne and Joachim and of Mary below; the Virgin in majesty under her canopy above
    row(L1 + 0.14, p.lintel - 0.3, 10);
    row(L2 + 0.14, p.lintel * 1.15 - 0.34, 11);
    figure(bag, xEnd - 0.2, ty + 0.15, zc, TH * 0.6, { seat: true, crown: true });
    bag.add(L, box(xEnd - 0.4, ty + TH * 0.68, zc - 0.55, xEnd - 0.04, ty + TH * 0.76, zc + 0.55));
    for (const s of [-1, 1]) { figure(bag, xEnd - 0.16, ty + 0.15, zc + s * wN * 0.38, TH * 0.42, { wings: true }); figure(bag, xEnd - 0.16, ty + 0.1, zc + s * wN * 0.7, TH * 0.32, { crown: s > 0 }); }
  }
  col.rect([x, z0, xBack, z1], y, y + top);
}

// ── the cathedral ─────────────────────────────────────────────────────────────────────────────

function notreDame(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, y = el.y ?? 0, cz = (Z0 + Z1) / 2;
  const Y = (v) => y + v;
  // plan (x from the west front, z from the axis)
  const XF = X0 + 1, XA = X0 + 4, XT = X0 + 13, ZF = 20.5;
  const BAY = 6.2, NB = 8, XTR0 = XT + NB * BAY, XTR1 = XTR0 + 14, CB = 6.4, NCB = 4, XAP = XTR1 + NCB * CB;
  const ZN = 7, ZT = 13, ZC = 21, ZU0 = 18.6, ZU1 = 23.6, ZCC = 17, ZUC0 = 16, ZUC1 = 21;   // walls; nave uprights; the choir's outer wall and uprights
  const EAVE = 34, RIDGE = 44.5, TRIB = 21.8, TRIBR = 23, CHAP = 11.5, CHAPR = 13.8;
  const Z = (v) => cz + v;

  // ── the west front ──
  const BUT = [[-ZF, -17.6], [-7.4, -4.6], [4.6, 7.4], [17.6, ZF]];
  for (const [a, b] of BUT) {
    bag.add(L, box(X0 - 1.4, Y(-0.5), Z(a), XA + 0.01, Y(18.6), Z(b))); bag.add(L, box(XF, Y(18.5), Z(a), XA + 0.01, Y(19.45), Z(b))); col.rect([X0 - 1.4, Z(a), XA, Z(b)], y, Y(19));
    const w = [];
    hexa(w, [[X0 - 1.4, Y(18.6), Z(a)], [XF + 0.6, Y(18.6), Z(a)], [XF + 0.6, Y(18.6), Z(b)], [X0 - 1.4, Y(18.6), Z(b)]], [[XF + 0.5, Y(19.45), Z(a)], [XF + 0.6, Y(19.45), Z(a)], [XF + 0.6, Y(19.45), Z(b)], [XF + 0.5, Y(19.45), Z(b)]]);
    bag.add(L, fromTriangles(w));
    // a statue before the buttress on its corbel, under a gabled canopy (the four of the buttresses)
    const zm = Z((a + b) / 2);
    bag.add(L, lathe([[0.001, -0.4], [0.3, -0.1], [0.36, 0]], 8, null, X0 - 1.75, Y(3.0), zm));
    figure(bag, X0 - 1.75, Y(3.0), zm, 2.5, { book: a < 0 && a > -10, crown: a > 10 });
    bag.add(L, box(X0 - 2.15, Y(5.7), zm - 0.45, X0 - 1.39, Y(5.95), zm + 0.45));
    const g = []; prism(g, [[X0 - 2.15, Y(5.95), zm - 0.45], [X0 - 2.15, Y(5.95), zm + 0.45], [X0 - 2.15, Y(6.9), zm]], [0.76, 0, 0]); bag.add(L, fromTriangles(g));
    // the blind arcade on the buttress's face above
    bag.add(L, planarWall({ o: [X0 - 1.5, Z(a)], u: [0, 1], th: 0.2, u0: 0.3, u1: b - a - 0.3, y0: Y(9), y1: Y(16.5), arches: [] }));
    const arc = []; bars(arc, [X0 - 1.62, Z(a)], [0, 1], pointedPts((b - a) / 2, (b - a) / 2 - 0.55, Y(13.8), 0.8), 0.16, 0.12); bag.add(L, fromTriangles(arc));
  }
  // the three portals: the Virgin (north, the left), the Last Judgement (centre), Saint Anne (south)
  const side = { W0: 4.0, N: 4, dw: 0.24, dd: 0.45, spring: 8.6, door: 5.6, lintel: 1.1, base: 2.4, statue: 2.2, top: 19.45 };
  portal(bag, col, { ...side, x: XF, z0: Z(-17.6), z1: Z(-7.4), y, xBack: XA, scheme: 'virgin', crowns: true });
  portal(bag, col, { x: XF, z0: Z(-4.6), z1: Z(4.6), y, W0: 4.45, N: 6, dw: 0.24, dd: 0.42, spring: 9.5, door: 6.4, lintel: 1.15, base: 2.6, statue: 2.35, top: 19.45, xBack: XA, scheme: 'judgement' });
  portal(bag, col, { ...side, x: XF, z0: Z(7.4), z1: Z(17.6), y, xBack: XA, scheme: 'anne', trumeauCrown: false });
  // the core of the front behind the portals and up to the great gallery
  bag.add(L, box(XA, Y(-0.5), Z(-ZF), XT, Y(36.8), Z(ZF))); col.rect([XA, Z(-ZF), XT, Z(ZF)], y, Y(36.8));

  // the Gallery of Kings: twenty-eight kings of Judah under an arcade, on a ledge some 20 m up
  const XK = XF + 0.6;
  bag.add(L, box(XK, Y(19.4), Z(-ZF), XA + 0.01, Y(24.6), Z(ZF)));
  bag.add(L, box(X0 - 0.2, Y(19.4), Z(-ZF - 0.2), XK + 0.01, Y(20.2), Z(ZF + 0.2)));
  const NK = 28, kw = 2 * ZF / NK;
  for (let i = 0; i < NK; i++) {
    const zz = Z(-ZF + (i + 0.5) * kw);
    figure(bag, XK - 0.42, Y(20.2), zz, 3.3, { crown: true });
  }
  for (let i = 0; i <= NK; i++) { const zz = Z(-ZF + i * kw); bag.add(L, lathe([[0.11, 0], [0.1, 3.0], [0.16, 3.05], [0.16, 3.15]], 8, null, X0 + 0.95, Y(20.2), zz)); }
  bag.add(L, planarWall({ o: [X0 + 0.95, Z(-ZF)], u: [0, 1], th: 0.4, u0: 0, u1: 2 * ZF, y0: Y(23.35), y1: Y(24.45), arcade: true, noEnds: true,
    arches: Array.from({ length: NK }, (_, i) => ({ uc: (i + 0.5) * kw, r: kw / 2 - 0.1, spring: Y(23.35), sill: Y(23.35), pointed: 0.8 })) }));
  bag.add(L, box(X0 + 0.55, Y(24.4), Z(-ZF - 0.2), XK + 0.5, Y(24.65), Z(ZF + 0.2)));
  // the Virgin's gallery: an open balustrade of small trefoil arches before the rose
  bag.add(L, planarWall({ o: [X0 + 0.72, Z(-ZF)], u: [0, 1], th: 0.3, u0: 0, u1: 2 * ZF, y0: Y(24.65), y1: Y(25.85), arcade: true,
    arches: Array.from({ length: 52 }, (_, i) => ({ uc: (i + 0.5) * 2 * ZF / 52, r: ZF / 52 - 0.07, spring: Y(25.15), sill: Y(24.75), pointed: 0.85 })) }));
  bag.add(L, box(X0 + 0.52, Y(25.85), Z(-ZF), X0 + 0.92, Y(26.0), Z(ZF)));
  for (let i = 0; i <= 52; i++) bag.add(L, box(X0 + 0.64, Y(24.65), Z(-ZF + i * 2 * ZF / 52) - 0.04, X0 + 0.8, Y(25.15), Z(-ZF + i * 2 * ZF / 52) + 0.04));

  // the rose stage: the rose in the middle, in each tower a great window of two lancets and an oculus
  const XR = X0 + 2;                                                               // the wall's face
  const STRIP = [[-ZF, -18.2], [-7.0, -5.4], [5.4, 7.0], [18.2, ZF]];
  bag.add(L, planarWall({ o: [XR + 1, Z(-5.4)], u: [0, 1], th: 2, u0: 0, u1: 10.8, y0: Y(24.6), y1: Y(36.8), circles: [{ uc: 5.4, yc: Y(31.2), r: 4.8 }] }));
  roseND(bag, [XR + 0.6, cz], [0, 1], 0, Y(31.2), 4.8, -1);
  const rim = []; bars(rim, [XR - 0.05, cz], [0, 1], ringPts(0, Y(31.2), 5.0, 48), 0.42, 0.22); bars(rim, [XR - 0.1, cz], [0, 1], ringPts(0, Y(31.2), 5.32, 48), 0.18, 0.2); bag.add(L, fromTriangles(rim));
  for (const s of [-1, 1]) {
    const za = s < 0 ? -18.2 : 7.0, zb = s < 0 ? -7.0 : 18.2, uc = (zb - za) / 2;
    bag.add(L, planarWall({ o: [XR + 1, Z(za)], u: [0, 1], th: 2, u0: 0, u1: zb - za, y0: Y(24.6), y1: Y(36.8), arches: [{ uc, r: 3.2, spring: Y(31.8), sill: Y(26.2), pointed: 0.75 }] }));
    win(ctx, [XR + 0.7, Z(za)], [0, 1], uc, 6.4, Y(26.2), Y(31.8), 2, -1);
    // the archivolt round the window, in two orders
    const av = []; bars(av, [XR - 0.06, Z(za)], [0, 1], pointedPts(uc, 3.42, Y(31.8), 0.75, 12), 0.36, 0.2); bars(av, [XR - 0.12, Z(za)], [0, 1], pointedPts(uc, 3.78, Y(31.8), 0.75, 12), 0.2, 0.2); bag.add(L, fromTriangles(av));
  }
  // the buttress strips running up the front to the towers' tops, set back at each stage
  for (const [a, b] of STRIP) {
    bag.add(L, box(X0 + 1.0, Y(24.6), Z(a), XR + 0.3, Y(36.9), Z(b)));
    bag.add(L, box(X0 + 1.6, Y(36.9), Z(a), XR + 0.6, Y(43.4), Z(b)));
    bag.add(L, box(X0 + 2.2, Y(43.4), Z(a), X0 + 3.4, Y(55), Z(b)));
    bag.add(L, box(X0 + 2.6, Y(55), Z(a), X0 + 3.4, Y(67.3), Z(b)));
    const w = [];
    for (const [ya, xa, xb] of [[36.9, X0 + 1.0, X0 + 1.6], [43.4, X0 + 1.6, X0 + 2.2], [55, X0 + 2.2, X0 + 2.6]]) hexa(w, [[xa, Y(ya - 0.6), Z(a)], [xb, Y(ya - 0.6), Z(a)], [xb, Y(ya - 0.6), Z(b)], [xa, Y(ya - 0.6), Z(b)]], [[xb - 0.01, Y(ya), Z(a)], [xb, Y(ya), Z(a)], [xb, Y(ya), Z(b)], [xb - 0.01, Y(ya), Z(b)]]);
    bag.add(L, fromTriangles(w));
  }

  // the great gallery: a screen of tall slender arches on colonnettes, open to the sky between the towers
  bag.add(L, box(X0 + 1.2, Y(36.4), Z(-ZF), XT, Y(36.9), Z(ZF))); col.floor([X0 + 1.2, Z(-ZF), XT, Z(ZF)], Y(36.9));
  for (const [a, b] of [[-18.2, -7.0], [-5.4, 5.4], [7.0, 18.2]]) {
    const n = Math.round((b - a) / 1.0), st = (b - a) / n;
    bag.add(L, planarWall({ o: [X0 + 1.95, Z(a)], u: [0, 1], th: 0.45, u0: 0, u1: b - a, y0: Y(36.9), y1: Y(42.6), arcade: true, noEnds: true,
      arches: Array.from({ length: n }, (_, i) => ({ uc: (i + 0.5) * st, r: st / 2 - 0.11, spring: Y(40.9), sill: Y(36.9), pointed: 0.9 })) }));
    for (let i = 0; i <= n; i++) bag.add(L, lathe([[0.15, 0], [0.11, 0.25], [0.11, 3.7], [0.17, 3.85], [0.17, 4.0]], 8, null, X0 + 1.95, Y(36.9), Z(a + i * st)));
  }
  bag.add(L, box(X0 + 1.45, Y(42.6), Z(-ZF), X0 + 2.45, Y(43.0), Z(ZF)));
  bag.add(L, planarWall({ o: [X0 + 1.75, Z(-ZF)], u: [0, 1], th: 0.25, u0: 0, u1: 2 * ZF, y0: Y(43.0), y1: Y(44.0), arcade: true,
    arches: Array.from({ length: 40 }, (_, i) => ({ uc: (i + 0.5) * 2 * ZF / 40, r: ZF / 40 - 0.08, spring: Y(43.45), sill: Y(43.1), pointed: 0.85 })) }));
  bag.add(L, box(X0 + 1.6, Y(44.0), Z(-5.4), X0 + 1.9, Y(44.15), Z(5.4)));

  // the towers: the lower mass up to the gallery's head, then the belfry with two tall bays a face, the louvres, the platform
  const TX0 = X0 + 3.4, TX1 = XT + 3.5;
  for (const s of [-1, 1]) {
    const za = s < 0 ? -ZF : 6.0, zb = s < 0 ? -6.0 : ZF;
    bag.add(L, box(X0 + 3.4, Y(-0.5), Z(za), TX1, Y(43.4), Z(zb))); col.rect([X0 + 3.4, Z(za), TX1, Z(zb)], y, Y(43.4));
    const faces = [[[TX0 + 0.7, Z(za)], [0, 1], zb - za], [[TX1 - 0.7, Z(za)], [0, 1], zb - za], [[TX0, Z(za) + 0.7], [1, 0], TX1 - TX0], [[TX0, Z(zb) - 0.7], [1, 0], TX1 - TX0]];
    for (const [o, u, Ln] of faces) {
      const bays = [Ln / 2 - 2.6, Ln / 2 + 2.6];
      bag.add(L, planarWall({ o, u, th: 1.4, u0: u[0] ? 0 : 0, u1: Ln, y0: Y(43.4), y1: Y(67.3), arches: bays.map((uc) => ({ uc, r: 1.3, spring: Y(59.0), sill: Y(46.5), pointed: 0.75 })) }));
      const n = [-u[1], u[0]];
      for (const uc of bays) {
        // the bay's archivolt, its colonnettes, the louvres inside
        const av = []; bars(av, [o[0] - n[0] * 0.75, o[1] - n[1] * 0.75], u, pointedPts(uc, 1.5, Y(59.0), 0.75, 10), 0.3, 0.2); bars(av, [o[0] + n[0] * 0.75, o[1] + n[1] * 0.75], u, pointedPts(uc, 1.5, Y(59.0), 0.75, 10), 0.3, 0.2); bag.add(L, fromTriangles(av));
        for (const e of [-1, 1]) for (const sd of [-0.78, 0.78]) { const p0 = [o[0] + u[0] * (uc + e * 1.38) + n[0] * sd, o[1] + u[1] * (uc + e * 1.38) + n[1] * sd]; bag.add(L, lathe([[0.12, 0], [0.12, 12.5]], 8, null, p0[0], Y(46.5), p0[1])); }
        const lv = [];
        for (let k = 0; k < 14; k++) { const yy = Y(47.2 + k * 0.85); const hw = archHalf({ r: 1.3, pointed: 0.75 }, yy - Y(59.0)) - 0.02; if (hw < 0.2) continue; hexa(lv, [[o[0] + u[0] * (uc - hw) + n[0] * 0.3, yy, o[1] + u[1] * (uc - hw) + n[1] * 0.3], [o[0] + u[0] * (uc + hw) + n[0] * 0.3, yy, o[1] + u[1] * (uc + hw) + n[1] * 0.3], [o[0] + u[0] * (uc + hw) + n[0] * 0.24, yy - 0.06, o[1] + u[1] * (uc + hw) + n[1] * 0.24], [o[0] + u[0] * (uc - hw) + n[0] * 0.24, yy - 0.06, o[1] + u[1] * (uc - hw) + n[1] * 0.24]], [[o[0] + u[0] * (uc - hw) - n[0] * 0.3, yy - 0.5, o[1] + u[1] * (uc - hw) - n[1] * 0.3], [o[0] + u[0] * (uc + hw) - n[0] * 0.3, yy - 0.5, o[1] + u[1] * (uc + hw) - n[1] * 0.3], [o[0] + u[0] * (uc + hw) - n[0] * 0.36, yy - 0.56, o[1] + u[1] * (uc + hw) - n[1] * 0.36], [o[0] + u[0] * (uc - hw) - n[0] * 0.36, yy - 0.56, o[1] + u[1] * (uc - hw) - n[1] * 0.36]]); }
        bag.add('timber', fromTriangles(lv));
      }
    }
    col.rect([TX0, Z(za), TX1, Z(zb)], Y(43.4), Y(67.3));
    // the platform: the cornice, the pierced parapet round it, the lead over the vault, gargoyles at the corners
    bag.add(L, box(TX0 - 0.35, Y(67.3), Z(za) - 0.35, TX1 + 0.35, Y(67.8), Z(zb) + 0.35));
    bag.add(LEAD, box(TX0 + 0.4, Y(67.8), Z(za) + 0.4, TX1 - 0.4, Y(67.95), Z(zb) - 0.4)); col.floor([TX0, Z(za), TX1, Z(zb)], Y(67.95));
    for (const [o, u, Ln] of [[[TX0 - 0.15, Z(za) - 0.35], [0, 1], zb - za + 0.7], [[TX1 + 0.15, Z(za) - 0.35], [0, 1], zb - za + 0.7], [[TX0 - 0.35, Z(za) - 0.15], [1, 0], TX1 - TX0 + 0.7], [[TX0 - 0.35, Z(zb) + 0.15], [1, 0], TX1 - TX0 + 0.7]]) {
      const n = Math.round(Ln / 0.9), st = Ln / n;
      bag.add(L, planarWall({ o, u, th: 0.3, u0: 0, u1: Ln, y0: Y(67.8), y1: Y(69.0), arches: Array.from({ length: n }, (_, i) => ({ uc: (i + 0.5) * st, r: st / 2 - 0.1, spring: Y(68.35), sill: Y(67.95), pointed: 0.85 })) }));
    }
    for (const [cx, czz, dx, dz] of [[TX0, Z(za), -1, -1], [TX0, Z(zb), -1, 1], [TX1, Z(za), 1, -1], [TX1, Z(zb), 1, 1]]) { const l = Math.SQRT1_2; gargoyle(bag, cx - dx * 0.2, Y(67.05), czz - dz * 0.2, [dx * l, dz * l], 1.9); }
    for (const t of [0.33, 0.67]) { gargoyle(bag, TX0 - 0.1, Y(67.05), Z(za + (zb - za) * t), [-1, 0], 1.5); }
  }

  // the nave's west gable behind the gallery
  { const g = []; prism(g, [[XT, Y(EAVE), Z(-ZN - 0.4)], [XT, Y(EAVE), Z(ZN + 0.4)], [XT, Y(RIDGE + 0.6), cz]], [0.9, 0, 0]); bag.add(L, fromTriangles(g)); }

  // ── nave, choir: the three volumes in section, the clerestory, the tribunes, the chapels ──
  const range = (xa, xb, zc, zu0, zu1, chapels) => {
    for (const s of [-1, 1]) {
      const zlo = (a, b) => Z(Math.min(s * a, s * b)), zhi = (a, b) => Z(Math.max(s * a, s * b));
      bag.add(L, box(xa, Y(-0.5), zlo(ZN, ZT), xb, Y(TRIB), zhi(ZN, ZT)));
      bag.add(L, box(xa, Y(-0.5), zlo(ZT, zc), xb, Y(CHAP), zhi(ZT, zc))); col.rect([xa, zlo(ZN, zc), xb, zhi(ZN, zc)], y, Y(TRIB));
      // the lead roofs: the tribune's terrace-roof, the outer aisle's lean-to
      const lean = (z0, y0, z1, y1) => { const r = []; hexa(r, [[xa, Y(y0 - 0.25), Z(s * z0)], [xb, Y(y0 - 0.25), Z(s * z0)], [xb, Y(y1 - 0.25), Z(s * z1)], [xa, Y(y1 - 0.25), Z(s * z1)]], [[xa, Y(y0), Z(s * z0)], [xb, Y(y0), Z(s * z0)], [xb, Y(y1), Z(s * z1)], [xa, Y(y1), Z(s * z1)]]); bag.add(LEAD, fromTriangles(r)); };
      lean(ZN - 0.1, TRIBR, ZT + 0.35, TRIB + 0.05);
      lean(ZT - 0.1, CHAPR, zc + 0.35, CHAP + 0.05);
      // a corbel table and cornice under each eave
      bag.add(L, box(xa, Y(CHAP - 0.45), zlo(zc, zc + 0.3), xb, Y(CHAP - 0.2), zhi(zc, zc + 0.3)));
      bag.add(L, box(xa, Y(TRIB - 0.45), zlo(ZT, ZT + 0.3), xb, Y(TRIB - 0.2), zhi(ZT, ZT + 0.3)));
      bag.add(L, box(xa, Y(EAVE - 0.5), zlo(ZN, ZN + 0.35), xb, Y(EAVE - 0.15), zhi(ZN, ZN + 0.35)));
    }
    bag.add(L, box(xa, Y(-0.5), Z(-ZN), xb, Y(EAVE), Z(ZN))); col.rect([xa, Z(-ZN), xb, Z(ZN)], y, Y(EAVE));
    bag.add(LEAD, frustum([xa, Z(-ZN - 0.45), xb, Z(ZN + 0.45)], Y(EAVE), Y(RIDGE), 0, 0, ZN + 0.45, ZN + 0.45));
    bag.add(LEAD, box(xa, Y(RIDGE - 0.05), cz - 0.12, xb, Y(RIDGE + 0.25), cz + 0.12));
    const n = Math.round((xb - xa) / BAY), bw = (xb - xa) / n;
    for (let i = 0; i < n; i++) {
      const uc = (i + 0.5) * bw;
      for (const s of [-1, 1]) {
        if (i > 0 || xa !== XT) {                                  // the first bay of the nave is engaged in the towers
          win(ctx, [xa, Z(s * (ZN + 0.06))], [1, 0], uc, 4.0, Y(24.0), Y(30.0), 2, -s);
          win(ctx, [xa, Z(s * (ZT + 0.06))], [1, 0], uc, 2.8, Y(CHAPR + 0.8), Y(18.4), 2, -s);
        }
        if (chapels) win(ctx, [xa, Z(s * (zc + 0.06))], [1, 0], uc, 3.4, Y(2.8), Y(8.0), 4, -s);
        else win(ctx, [xa, Z(s * (zc + 0.06))], [1, 0], uc, 2.6, Y(3.2), Y(7.6), 2, -s);
      }
    }
    // at each bay's division: the pilaster on the clerestory, the upright, the flyer, its pinnacle and gargoyle
    // (none against the towers or the transept; the choir's last stands at the apse's springing)
    for (let i = 1; i <= (xb === XAP ? n : n - 1); i++) for (const s of [-1, 1]) flyer(xa + i * bw, s, zu0, zu1);
  };
  const flyer = (x, s, zu0, zu1) => {
    const zl = (a, b) => Z(Math.min(s * a, s * b)), zh = (a, b) => Z(Math.max(s * a, s * b));
    bag.add(L, box(x - 0.55, Y(TRIBR - 0.3), zl(ZN, ZN + 0.6), x + 0.55, Y(EAVE - 0.5), zh(ZN, ZN + 0.6)));
    // the upright: three stages, each set back under a sloping weathering
    const st = [[0, 12, zu1], [12, 22, zu1 - 0.7], [22, 29.5, zu1 - 1.4]], w = [];
    for (const [y0, y1, zo] of st) { bag.add(L, box(x - 1.0, Y(y0 - (y0 ? 0 : 0.5)), zl(zu0, zo), x + 1.0, Y(y1), zh(zu0, zo))); }
    for (const [yy, zo0, zo1] of [[12, zu1, zu1 - 0.7], [22, zu1 - 0.7, zu1 - 1.4]]) hexa(w, [[x - 1.0, Y(yy), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy), Z(s * zo0)], [x - 1.0, Y(yy), Z(s * zo0)]], [[x - 1.0, Y(yy + 0.7), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy + 0.7), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy + 0.7), Z(s * zo1)], [x - 1.0, Y(yy + 0.7), Z(s * zo1)]]);
    bag.add(L, fromTriangles(w));
    col.rect([x - 1.0, zl(zu0, zu1), x + 1.0, zh(zu0, zu1)], y, Y(29.5));
    // the flying arch over the aisles to the clerestory: an arc below, a straight sloping back above, its coping
    const fl = [], N = 14, za = zu0, zb = ZN + 0.6, ya0 = 23.4, yb0 = 29.7, ya1 = 28.6, yb1 = 31.1;
    const Pt = (t) => { const zz = za + (zb - za) * t; return [Z(s * zz), Y(ya0 + (yb0 - ya0) * Math.sin(t * Math.PI / 2)), Y(ya1 + (yb1 - ya1) * t)]; };
    for (let k = 0; k < N; k++) {
      const A = Pt(k / N), B = Pt((k + 1) / N);
      hexa(fl, [[x - 0.42, A[1], A[0]], [x + 0.42, A[1], A[0]], [x + 0.42, B[1], B[0]], [x - 0.42, B[1], B[0]]], [[x - 0.42, A[2], A[0]], [x + 0.42, A[2], A[0]], [x + 0.42, B[2], B[0]], [x - 0.42, B[2], B[0]]]);
      hexa(fl, [[x - 0.2, A[2] - 0.01, A[0]], [x + 0.2, A[2] - 0.01, A[0]], [x + 0.2, B[2] - 0.01, B[0]], [x - 0.2, B[2] - 0.01, B[0]]], [[x - 0.1, A[2] + 0.22, A[0]], [x + 0.1, A[2] + 0.22, A[0]], [x + 0.1, B[2] + 0.22, B[0]], [x - 0.1, B[2] + 0.22, B[0]]]);
    }
    bag.add(L, fromTriangles(fl));
    pinnacle(bag, x, Y(29.5), Z(s * (zu0 + (zu1 - 1.4 - zu0) / 2)), Math.min(1.8, zu1 - 1.4 - zu0 - 0.1), 7.5);
    gargoyle(bag, x, Y(28.9), Z(s * (zu1 - 1.45)), [0, s], 1.7);
  };
  range(XT, XTR0, ZC, ZU0, ZU1, true);
  range(XTR1, XAP, ZCC, ZUC0, ZUC1, false);

  // ── the transept: the arms to just beyond the chapels, the gables with their roses ──
  const ZTR = 23.2, XC = (XTR0 + XTR1) / 2;
  bag.add(L, box(XTR0, Y(-0.5), Z(-ZTR), XTR1, Y(EAVE), Z(ZTR))); col.rect([XTR0, Z(-ZTR), XTR1, Z(ZTR)], y, Y(EAVE));
  bag.add(LEAD, frustum([XTR0 - 0.45, Z(-ZTR), XTR1 + 0.45, Z(ZTR)], Y(EAVE), Y(RIDGE), 7.45, 7.45, 0, 0));
  bag.add(LEAD, box(XC - 0.12, Y(RIDGE - 0.05), Z(-ZTR), XC + 0.12, Y(RIDGE + 0.25), Z(ZTR)));
  for (const s of [-1, 1]) {
    const g = []; prism(g, [[XTR0 - 0.45, Y(EAVE), Z(s * ZTR)], [XTR1 + 0.45, Y(EAVE), Z(s * ZTR)], [XC, Y(RIDGE + 0.7), Z(s * ZTR)]], [0, 0, s * 0.7]); bag.add(L, fromTriangles(g));
    roseND(bag, [XTR0, Z(s * (ZTR + 0.08))], [1, 0], XC - XTR0, Y(25.6), 4.4, -s, 0.36);
    const rr = []; bars(rr, [XTR0, Z(s * (ZTR + 0.08))], [1, 0], ringPts(XC - XTR0, Y(25.6), 4.65, 40), 0.4, 0.3); bag.add(L, fromTriangles(rr));
    for (let k = 0; k < 5; k++) win(ctx, [XTR0, Z(s * (ZTR + 0.06))], [1, 0], 2.6 + k * 2.2, 1.5, Y(14.5), Y(19.2), 2, -s, 0.8);
    win(ctx, [XTR0, Z(s * (ZTR + 0.06))], [1, 0], 7, 3.4, Y(5.6), Y(10.5), 2, -s);
    roseND(bag, [XTR0, Z(s * (ZTR + 0.72))], [1, 0], 7, Y(38.4), 1.5, -s, 0.3);
    for (const x of [XTR0 - 1.0, XTR1 + 1.0]) {
      bag.add(L, box(x - 1.0, Y(-0.5), Z(Math.min(s * (ZTR - 1), s * (ZTR + 1.8))), x + 1.0, Y(EAVE + 1), Z(Math.max(s * (ZTR - 1), s * (ZTR + 1.8)))));
      pinnacle(bag, x, Y(EAVE + 1), Z(s * (ZTR + 0.4)), 1.7, 6.5);
      gargoyle(bag, x, Y(EAVE + 0.4), Z(s * (ZTR + 1.8)), [0, s], 1.6);
    }
  }

  // ── the apse: the half-polygon of the choir, the ambulatories round it, the uprights and flyers ──
  const SIDES = 5, a0 = -90, step = 180 / SIDES;
  const P = (r, a, yy) => [XAP + r * Math.cos(a * D2R), yy, cz + r * Math.sin(a * D2R)];
  const half = (r, y0, y1, mat) => { const pts = Array.from({ length: SIDES + 1 }, (_, k) => P(r, a0 + k * step, Y(y0))); const g = []; prism(g, pts, [0, y1 - y0, 0]); bag.add(mat, fromTriangles(g)); };
  half(ZN / Math.cos(step / 2 * D2R), -0.5, EAVE, L);
  half(ZT / Math.cos(step / 2 * D2R), -0.5, TRIB, L);
  half(ZCC / Math.cos(step / 2 * D2R), -0.5, CHAP, L);
  col.circle(XAP, cz, ZCC, y, Y(TRIB));
  STYLES.gothic.elements.apse_roof({ c: [XAP, cz], sides: SIDES, a0: -90, a1: 90, R: ZN / Math.cos(step / 2 * D2R) + 0.5, y: Y(EAVE), ridge: Y(RIDGE) }, ctx);
  const ringRoof = (r0, y0, r1, y1) => {
    const g = [];
    for (let k = 0; k < SIDES; k++) {
      const aa = a0 + k * step, bb = aa + step, R0 = r0 / Math.cos(step / 2 * D2R), R1 = r1 / Math.cos(step / 2 * D2R);
      hexa(g, [P(R0, aa, Y(y0 - 0.25)), P(R0, bb, Y(y0 - 0.25)), P(R1, bb, Y(y1 - 0.25)), P(R1, aa, Y(y1 - 0.25))], [P(R0, aa, Y(y0)), P(R0, bb, Y(y0)), P(R1, bb, Y(y1)), P(R1, aa, Y(y1))]);
    }
    bag.add(LEAD, fromTriangles(g));
  };
  ringRoof(ZN - 0.1, TRIBR, ZT + 0.35, TRIB + 0.05);
  ringRoof(ZT - 0.1, CHAPR, ZCC + 0.35, CHAP + 0.05);
  for (let k = 0; k < SIDES; k++) {
    const am = a0 + (k + 0.5) * step;
    for (const [r, w, sill, spring, Lc] of [[ZN, 3.2, 24.0, 30.0, 2], [ZT, 3.0, CHAPR + 0.8, 18.4, 2], [ZCC, 3.6, 3.2, 7.6, 2]]) {
      const c = P(r + 0.06, am, 0), uu = [-Math.sin(am * D2R), Math.cos(am * D2R)], half2 = r * Math.tan(step / 2 * D2R);
      win(ctx, [c[0] - uu[0] * half2, c[2] - uu[1] * half2], uu, half2, w, Y(sill), Y(spring), Lc, 1);
    }
  }
  // the uprights round the apse, at its corners, each with its flyer to the choir's wall
  for (let k = 1; k < SIDES; k++) {
    const a = a0 + k * step, d = [Math.cos(a * D2R), Math.sin(a * D2R)], t = [-d[1], d[0]];
    const Q = (r, s, yy) => [XAP + d[0] * r + t[0] * s, Y(yy), cz + d[1] * r + t[1] * s];
    const up = [];
    for (const [y0, y1, ro] of [[-0.5, 12, ZUC1], [12, 22, ZUC1 - 0.7], [22, 29.5, ZUC1 - 1.4]]) hexa(up, [Q(ZUC0, -1, y0), Q(ZUC0, 1, y0), Q(ro, 1, y0), Q(ro, -1, y0)], [Q(ZUC0, -1, y1), Q(ZUC0, 1, y1), Q(ro, 1, y1), Q(ro, -1, y1)]);
    const R7 = ZN / Math.cos(step / 2 * D2R);
    hexa(up, [Q(R7 - 0.2, -0.55, TRIBR - 0.3), Q(R7 - 0.2, 0.55, TRIBR - 0.3), Q(R7 + 0.6, 0.55, TRIBR - 0.3), Q(R7 + 0.6, -0.55, TRIBR - 0.3)], [Q(R7 - 0.2, -0.55, EAVE - 0.5), Q(R7 - 0.2, 0.55, EAVE - 0.5), Q(R7 + 0.6, 0.55, EAVE - 0.5), Q(R7 + 0.6, -0.55, EAVE - 0.5)]);
    const N = 14;
    for (let i = 0; i < N; i++) {
      const f0 = i / N, f1 = (i + 1) / N, rr = (f) => ZUC0 + (R7 + 0.6 - ZUC0) * f, yb = (f) => 23.4 + 6.3 * Math.sin(f * Math.PI / 2), yt = (f) => 28.6 + 2.5 * f;
      hexa(up, [Q(rr(f0), -0.42, yb(f0)), Q(rr(f0), 0.42, yb(f0)), Q(rr(f1), 0.42, yb(f1)), Q(rr(f1), -0.42, yb(f1))], [Q(rr(f0), -0.42, yt(f0)), Q(rr(f0), 0.42, yt(f0)), Q(rr(f1), 0.42, yt(f1)), Q(rr(f1), -0.42, yt(f1))]);
    }
    bag.add(L, fromTriangles(up));
    col.circle(...[XAP + d[0] * (ZUC0 + 2), cz + d[1] * (ZUC0 + 2)], 1.6, y, Y(29.5));
    const pc = Q(ZUC0 + (ZUC1 - 1.4 - ZUC0) / 2, 0, 29.5);
    pinnacle(bag, pc[0], pc[1], pc[2], 1.7, 7.5);
    const gp = Q(ZUC1 - 1.45, 0, 28.9); gargoyle(bag, gp[0], gp[1], gp[2], d, 1.7);
  }

  // ── the spire over the crossing (about 1220–30; about 78 m above the floor), of oak sheathed in lead ──
  const sx = XC, R8 = 3.3;
  bag.add(LEAD, lathe([[R8 + 0.3, 0], [R8 + 0.3, 0.6], [R8, 0.7], [R8, 8.6], [R8 + 0.35, 8.8], [R8 + 0.35, 9.3]], 8, null, sx, Y(RIDGE - 2.5), cz));
  // the lantern's pointed bays and their gablets, the corner pinnacles
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) * Math.PI / 4, d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], rf = R8 * Math.cos(Math.PI / 8) + 0.03, hw = R8 * Math.sin(Math.PI / 8) * 0.62;
    const c = [sx + d[0] * rf, cz + d[1] * rf], op = [];
    const pts = pointedPts(0, hw, Y(RIDGE + 3.6), 0.8, 6);
    for (let i = 0; i < pts.length - 1; i++) {
      const [ua, ya] = pts[i], [ub, yb] = pts[i + 1];
      op.push(c[0] + t[0] * ua, ya, c[1] + t[1] * ua, c[0] + t[0] * ub, yb, c[1] + t[1] * ub, c[0], Y(RIDGE + 3.6), c[1]);
    }
    op.push(c[0] - t[0] * hw, Y(RIDGE + 0.6), c[1] - t[1] * hw, c[0] + t[0] * hw, Y(RIDGE + 0.6), c[1] + t[1] * hw, c[0] + t[0] * hw, Y(RIDGE + 3.6), c[1] + t[1] * hw);
    op.push(c[0] - t[0] * hw, Y(RIDGE + 0.6), c[1] - t[1] * hw, c[0] + t[0] * hw, Y(RIDGE + 3.6), c[1] + t[1] * hw, c[0] - t[0] * hw, Y(RIDGE + 3.6), c[1] - t[1] * hw);
    // wind every triangle outward
    for (let i = 0; i < op.length; i += 9) { const ux = op[i + 3] - op[i], uy = op[i + 4] - op[i + 1], uz = op[i + 5] - op[i + 2], vx = op[i + 6] - op[i], vy = op[i + 7] - op[i + 1], vz = op[i + 8] - op[i + 2]; const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx; if (nx * d[0] + nz * d[1] < 0) for (let q = 0; q < 3; q++) { const tt = op[i + 3 + q]; op[i + 3 + q] = op[i + 6 + q]; op[i + 6 + q] = tt; } }
    bag.add('opening', fromTriangles(op));
    const gb = [], gw = R8 * Math.sin(Math.PI / 8) * 0.95;
    prism(gb, [[c[0] - t[0] * gw, Y(RIDGE + 6.8), c[1] - t[1] * gw], [c[0] + t[0] * gw, Y(RIDGE + 6.8), c[1] + t[1] * gw], [c[0], Y(RIDGE + 9.4), c[1]]], [-d[0] * 0.5, 0, -d[1] * 0.5]);
    bag.add(LEAD, fromTriangles(gb));
    const ca = k * Math.PI / 4, pr = R8 + 0.1;
    bag.add(LEAD, lathe([[0.32, 0], [0.32, 1.2], [0.001, 3.4]], 4, null, sx + Math.cos(ca) * pr, Y(RIDGE + 6.8), cz + Math.sin(ca) * pr));
  }
  bag.add(LEAD, lathe([[R8 * 0.96, 0], [R8 * 0.6, 6], [0.5, 22], [0.08, 26.5]], 8, null, sx, Y(RIDGE + 6.8), cz));
  for (let k = 1; k <= 7; k++) {
    const t = k / 8, yy = Y(RIDGE + 6.8 + 26 * t), rr = R8 * 0.96 * (1 - t) ** 0.8 + 0.08;
    for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4; bag.add(LEAD, box(sx + Math.cos(a) * rr - 0.12, yy, cz + Math.sin(a) * rr - 0.12, sx + Math.cos(a) * rr + 0.12, yy + 0.3, cz + Math.sin(a) * rr + 0.12)); }
  }
  const top = Y(RIDGE + 6.8 + 26.5);
  bag.add('gilt_bronze', lathe([[0.06, 0], [0.06, 2.0], [0.001, 2.0]], 6, null, sx, top, cz));
  bag.add('gilt_bronze', box(sx - 0.05, top + 1.25, cz - 0.55, sx + 0.05, top + 1.38, cz + 0.55));
  bag.add('gilt_bronze', box(sx - 0.35, top + 2.0, cz - 0.04, sx + 0.3, top + 2.4, cz + 0.04));     // the cock
  bag.add('gilt_bronze', box(sx - 0.1, top + 2.4, cz - 0.04, sx + 0.18, top + 2.65, cz + 0.04));
  void X1; void Z1; void Z0;
}

Object.assign(STYLES.gothic.elements, { notre_dame: notreDame });
