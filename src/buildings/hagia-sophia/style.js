// Hagia Sophia's own pieces, on top of the Byzantine style (src/styles/byzantine), after Paul the Silentiary's
// description of the church at its rededication in 563 (docs/buildings/hagia-sophia.md §7, §8, §9): the cross in a
// circle of mosaic at the crown of the dome; the single lamps on bronze stakes along the dome's cornice; the projecting
// cornices of the nave with their gilt mouldings; the inlaid discs in the spandrels of the arcades; the chancel barrier
// of twelve silver-clad columns with its silver plates bossed with crosses; the octagonal silver ciborium with its
// cup-shaped crest and cross over the gold altar; the silver discs and crosses of lamps hung on long chains.

import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';
import { byzantineColumn } from '../../styles/byzantine/index.js';

const D2R = Math.PI / 180;

/** A frame in a vertical plane: origin o [x, z] on the centre line, u along, n out. W(u, y, d) → [x, y, z]. */
const frame = (o, u, n) => (uu, y, d) => [o[0] + u[0] * uu + n[0] * d, y, o[1] + u[1] * uu + n[1] * d];
function fbox(out, W, u0, u1, y0, y1, d0, d1) {
  hexa(out, [W(u0, y0, d0), W(u1, y0, d0), W(u1, y0, d1), W(u0, y0, d1)], [W(u0, y1, d0), W(u1, y1, d0), W(u1, y1, d1), W(u0, y1, d1)]);
}
/** An annulus (or, with r0 ≈ 0, a disc) in the plane of a frame, centred at (uc, yc), standing d0…d1 off the centre line. */
function ring(out, W, uc, yc, r0, r1, d0, d1, n = 20) {
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n, b = 2 * Math.PI * (i + 1) / n;
    const P = (r, t, d) => W(uc + r * Math.cos(t), yc + r * Math.sin(t), d);
    hexa(out, [P(r0, a, d0), P(r1, a, d0), P(r1, b, d0), P(r0, b, d0)], [P(r0, a, d1), P(r1, a, d1), P(r1, b, d1), P(r0, b, d1)]);
  }
}

// ── the dome ─────────────────────────────────────────────────────────────────

/**
 * dome_cross: "at the very navel the sign of the cross is depicted within a circle by means of minute mosaic" (Paul
 * the Silentiary, 506). Laid on the inside of the dome's cap (the same sphere as the ribbed_dome's: { c, y0, r, win: { h },
 * crown }) a few centimetres proud of it: a green field R across with a silver border, and on it a gold cross with
 * flared arms. The ribs stop short of it.
 */
function domeCross(el, { bag }) {
  const [cx, cz] = el.c, yw1 = el.y0 + el.win.h + 0.6, H = el.crown - yw1, Rc = (el.r * el.r + H * H) / (2 * H), yc = el.crown - Rc;
  const R = el.R ?? 4.0;
  /** a point at plan offset (x, z) from the centre, lifted onto the sphere and set `off` inside it */
  const S = (x, z, off) => { const rr = Rc - off; return [cx + x, yc + Math.sqrt(Math.max(0, rr * rr - x * x - z * z)), cz + z]; };
  /** a plan polygon cell (convex, counter-clockwise) → triangles facing down */
  const cell = (out, pts, off) => { for (let k = 1; k < pts.length - 1; k++) out.push(...S(...pts[0], off), ...S(...pts[k], off), ...S(...pts[k + 1], off)); };
  const ann = (out, r0, r1, off, n = 72) => {
    for (let i = 0; i < n; i++) {
      const a = 2 * Math.PI * i / n, b = 2 * Math.PI * (i + 1) / n, p = (r, t) => [r * Math.cos(t), r * Math.sin(t)];
      cell(out, [p(r0, a), p(r0, b), p(r1, b), p(r1, a)], off);
    }
  };
  const field = [], border = [], cross = [];
  ann(field, 0.001, R - 0.32, 0.035, 72);
  ann(border, R - 0.36, R, 0.05);
  ann(border, R - 0.66, R - 0.56, 0.05);
  // the cross: four arms widening toward their ends (0.7 m at the centre, 1.5 m at the ends), a square at the middle
  const w0 = 0.36, w1 = 0.78, L = R - 0.85, st = 8;
  for (let q = 0; q < 4; q++) {
    const c = Math.cos(q * Math.PI / 2), s = Math.sin(q * Math.PI / 2), T = (a, b) => [a * c - b * s, a * s + b * c];
    for (let k = 0; k < st; k++) {
      const t0 = w0 + (L - w0) * k / st, t1 = w0 + (L - w0) * (k + 1) / st;
      const h0 = w0 + (w1 - w0) * ((t0 - w0) / (L - w0)) ** 1.6, h1 = w0 + (w1 - w0) * ((t1 - w0) / (L - w0)) ** 1.6;
      cell(cross, [T(t0, h0), T(t0, -h0), T(t1, -h1), T(t1, h1)], 0.07);
    }
  }
  cell(cross, [[w0, w0], [w0, -w0], [-w0, -w0], [-w0, w0]], 0.07);
  // turn every triangle to face the floor (fromTriangles' normal is (c − b) × (a − b))
  for (const out of [field, border, cross]) for (let i = 0; i < out.length; i += 9) {
    const ax = out[i] - out[i + 3], az = out[i + 2] - out[i + 5], cx2 = out[i + 6] - out[i + 3], cz2 = out[i + 8] - out[i + 5];
    if (cz2 * ax - cx2 * az > 0) for (let k = 0; k < 3; k++) { const t = out[i + 3 + k]; out[i + 3 + k] = out[i + 6 + k]; out[i + 6 + k] = t; }
  }
  bag.add(el.fieldMat || 'mosaic_green', fromTriangles(field));
  bag.add('mosaic_silver', fromTriangles(border));
  bag.add('gold', fromTriangles(cross));
}

/**
 * cornice_lamps: "along the projecting stone of the curved cornice the priest has lit single lamps attached to bronze
 * stakes" (Paul, 862): { c, r, y, n } — a ring of n bronze stakes on the cornice's top, each with a glass cup and its flame.
 * A cyma moulding under the cornice ring { r (its inner face), y0 } with a gilt fillet.
 */
function corniceLamps(el, { bag }) {
  const [cx, cz] = el.c, r = el.r, y = el.y, n = el.n || 80;
  for (let k = 0; k < n; k++) {
    const a = 2 * Math.PI * (k + 0.5) / n, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    bag.add('bronze', rod([x, y, z], [x, y + 0.32, z], 0.012, 4));
    bag.add('bronze', lathe([[0.001, 0], [0.04, 0.005], [0.04, 0.02], [0.001, 0.025]], 6, null, x, y + 0.3, z));
    bag.add('glass_lamp', lathe([[0.001, 0], [0.045, 0.03], [0.06, 0.1], [0.055, 0.13]], 8, null, x, y + 0.32, z));
    bag.add('flame', lathe([[0.001, 0], [0.018, 0.025], [0.001, 0.07]], 5, null, x, y + 0.44, z));
  }
  if (el.cyma) {
    const { r: ri, y0 } = el.cyma;
    // under the ring's flat soffit: a sloping cyma back to the pendentives, a gilt fillet, a fascia
    bag.add('marble_smooth', lathe([[ri + 0.45, y0 - 0.3], [ri + 0.24, y0 - 0.3], [ri + 0.1, y0 - 0.2], [ri + 0.04, y0 - 0.08], [ri + 0.02, y0 - 0.01], [ri + 0.45, y0 - 0.01]], 120, null, cx, 0, cz));
    bag.add('gold', lathe([[ri + 0.45, y0 - 0.36], [ri + 0.26, y0 - 0.36], [ri + 0.26, y0 - 0.29], [ri + 0.45, y0 - 0.29]], 120, null, cx, 0, cz));
  }
}

// ── the cornices of the nave and the spandrels ───────────────────────────────

/**
 * A cornice along a polyline of a wall's centre line { path [[x, z]…], toward [x, z] (a point on the side it projects to),
 * y (its top), half (the wall's half-thickness) }: a fascia, a gilt fillet, a sloping cyma and a corona, carried back into
 * the wall; corners mitred. With fill, the block behind it closes the wall from y − 0.6 to y.
 */
function nCornice(el, { bag }) {
  const P = el.path, n = P.length, h = el.half ?? 0.4, y = el.y, tw = el.toward;
  // the mitre vectors, pointing to the side the cornice projects to
  const M = P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    const d0 = i > 0 ? norm([p[0] - a[0], p[1] - a[1]]) : norm([b[0] - p[0], b[1] - p[1]]);
    const d1 = i < n - 1 ? norm([b[0] - p[0], b[1] - p[1]]) : d0;
    const o0 = [-d0[1], d0[0]], o1 = [-d1[1], d1[0]], m = norm([o0[0] + o1[0], o0[1] + o1[1]]), k = 1 / Math.max(0.3, m[0] * o1[0] + m[1] * o1[1]);
    return [m[0] * k, m[1] * k];
  });
  const mid = P[Math.floor(n / 2)], s = Math.sign((tw[0] - mid[0]) * M[Math.floor(n / 2)][0] + (tw[1] - mid[1]) * M[Math.floor(n / 2)][1]) || 1;
  const Q = (i, u, yy) => [P[i][0] + M[i][0] * u * s, yy, P[i][1] + M[i][1] * u * s];
  const stone = [], gilt = [];
  /** a layer from (uBack…uFront0) at y0 to (uBack…uFront1) at y1 */
  const layer = (out, ub, uf0, uf1, y0, y1) => {
    for (let i = 0; i < n - 1; i++) hexa(out, [Q(i, ub, y0), Q(i, uf0, y0), Q(i + 1, uf0, y0), Q(i + 1, ub, y0)], [Q(i, ub, y1), Q(i, uf1, y1), Q(i + 1, uf1, y1), Q(i + 1, ub, y1)]);
  };
  const f = h - 0.05;                          // a little inside the wall's face
  layer(stone, f, h + 0.1, h + 0.1, y - 1.0, y - 0.78);            // the fascia
  layer(gilt, f, h + 0.16, h + 0.16, y - 0.78, y - 0.7);           // the gilt fillet
  layer(stone, f, h + 0.14, h + 0.46, y - 0.7, y - 0.34);          // the cyma
  layer(gilt, f, h + 0.5, h + 0.5, y - 0.34, y - 0.27);            // a gilt astragal under the corona
  layer(stone, el.fill ? -h + 0.02 : f, h + 0.56, h + 0.56, y - 0.27, y);   // the corona (with fill, the wall's top behind it)
  if (el.fill) layer(stone, -h + 0.02, f + 0.01, f + 0.01, y - 0.66, y - 0.27);
  bag.add(el.mat || 'marble_smooth', fromTriangles(stone));
  bag.add('gold', fromTriangles(gilt));
}
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };

/**
 * Inlaid discs in the spandrels of an arcade { o, u, half (the wall's half-thickness), at: [u…], y, r, both }: a disc of
 * porphyry in a ring of green marble and a gilt fillet, set a little proud of the revetment on the face toward +n (and the
 * other face with both). [stated: opus sectile in the spandrels — pallasweb; the disc-in-ring composition inferred from
 * the panels of the west wall]
 */
function spandrelDiscs(el, { bag }) {
  const n = [-el.u[1], el.u[0]], W = frame(el.o, el.u, n), h = el.half ?? 0.4, r = el.r ?? 0.5;
  const red = [], green = [], gilt = [];
  for (const sd of el.both ? [1, -1] : [el.side ?? 1]) {
    const d0 = sd * (h - 0.02), d1 = sd * (h + 0.04), d2 = sd * (h + 0.06);
    for (const uu of el.at) {
      ring(red, W, uu, el.y, 0.001, r, Math.min(d0, d1), Math.max(d0, d1), 24);
      ring(gilt, W, uu, el.y, r, r + 0.05, Math.min(d0, d2), Math.max(d0, d2), 24);
      ring(green, W, uu, el.y, r + 0.05, r + 0.3, Math.min(d0, d1), Math.max(d0, d1), 24);
    }
  }
  bag.add('porphyry', fromTriangles(red));
  bag.add('verde_antico', fromTriangles(green));
  bag.add('gold', fromTriangles(gilt));
}

// ── the chancel and the altar ────────────────────────────────────────────────

/**
 * The chancel barrier between two points { a, b, y, n, gaps, h }: "the columns, too, six sets of twain in number, he has
 * completely covered with the silver metal"; "upon the walls which separate the priest from the choir of singers he has set
 * plates of naked silver" — "like a shield with a boss in whose middle part has been carved the sign of the cross" (Paul,
 * 682). Silver-clad columns at the bays' ends; in each closed bay a silver plate framed by a raised border with a bossed
 * disc and a gilt cross on both faces; the architrave with a moulded cap and a silver medallion over each bay.
 */
function chancelScreen(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, nb = el.n, H = el.h || 4.2;
  const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], W = frame(el.a, u, n);
  for (let i = 0; i <= nb; i++) {
    const t = i * L / nb;
    byzantineColumn({ at: [ax + u[0] * t, az + u[1] * t], y, h: H, d: 0.36, shaftMat: 'silver', capMat: 'silver', impost: false }, { bag, col });
  }
  const sil = [], gold = [], st = L / nb;
  for (let i = 0; i < nb; i++) {
    const t0 = i * st + 0.26, t1 = (i + 1) * st - 0.26, tc = (i + 0.5) * st;
    // the medallion on the architrave over the bay
    for (const sd of [1, -1]) ring(sil, W, tc, y + H + 0.27, 0.001, 0.19, sd > 0 ? 0.27 : -0.3, sd > 0 ? 0.3 : -0.27, 16);
    if (el.gaps && el.gaps.includes(i)) continue;
    fbox(sil, W, t0, t1, y, y + 0.12, -0.1, 0.1);                       // the sill
    fbox(sil, W, t0 + 0.02, t1 - 0.02, y + 0.12, y + 1.0, -0.05, 0.05);   // the plate
    fbox(sil, W, t0, t1, y + 1.0, y + 1.1, -0.09, 0.09);                 // the coping
    const yc = y + 0.56;
    for (const sd of [1, -1]) {
      const d = (a, b) => (sd > 0 ? [a, b] : [-b, -a]);
      // the raised border
      fbox(sil, W, t0 + 0.06, t1 - 0.06, y + 0.18, y + 0.24, ...d(0.04, 0.075));
      fbox(sil, W, t0 + 0.06, t1 - 0.06, y + 0.88, y + 0.94, ...d(0.04, 0.075));
      fbox(sil, W, t0 + 0.06, t0 + 0.12, y + 0.24, y + 0.88, ...d(0.04, 0.075));
      fbox(sil, W, t1 - 0.12, t1 - 0.06, y + 0.24, y + 0.88, ...d(0.04, 0.075));
      // the shield and its boss, the cross on it
      ring(sil, W, tc, yc, 0.24, 0.29, ...d(0.04, 0.09), 24);
      ring(sil, W, tc, yc, 0.001, 0.24, ...d(0.04, 0.07), 24);
      fbox(gold, W, tc - 0.035, tc + 0.035, yc - 0.2, yc + 0.2, ...d(0.06, 0.095));
      fbox(gold, W, tc - 0.17, tc + 0.17, yc - 0.035 + 0.04, yc + 0.035 + 0.04, ...d(0.06, 0.095));
    }
    col.segment(W(t0, 0, 0).filter((_, k) => k !== 1), W(t1, 0, 0).filter((_, k) => k !== 1), 0.2, y, y + 1.1);
  }
  // the architrave and its cap
  fbox(sil, W, -0.25, L + 0.25, y + H, y + H + 0.55, -0.25, 0.25);
  fbox(sil, W, -0.32, L + 0.32, y + H + 0.55, y + H + 0.67, -0.32, 0.32);
  fbox(gold, W, -0.27, L + 0.27, y + H + 0.08, y + H + 0.13, -0.27, 0.27);
  bag.add('silver', fromTriangles(sil));
  bag.add('gold', fromTriangles(gold));
}

/**
 * The ciborium over the altar { at, s, h }: "a figure like a cone, yet not exactly a cone", eight-sided, "borne aloft on
 * silver columns" with arches of silver, a cup-shaped crest and a cross on it (Paul, 720–750); beneath it the altar "of
 * gold" on golden supports. Four silver columns at ±s, an arch on each side with its spandrels, a moulded cornice; the
 * octagonal roof curving in to the crest; a krater and the cross.
 */
function ciborium(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.s || 2.0, H = el.h || 5.0;
  // the altar: a gold table on five gold supports, on a marble step
  bag.add('proconnesian', box(x - 1.6, y, z - 1.05, x + 1.6, y + 0.16, z + 1.05));
  bag.add('gold', box(x - 1.35, y + 1.0, z - 0.85, x + 1.35, y + 1.12, z + 0.85));
  for (const [dx, dz] of [[-1.15, -0.65], [1.15, -0.65], [1.15, 0.65], [-1.15, 0.65], [0, 0]]) bag.add('gold', lathe([[0.1, 0], [0.07, 0.1], [0.07, 0.74], [0.11, 0.84]], 10, null, x + dx, y + 0.16, z + dz));
  col.rect([x - 1.35, z - 0.85, x + 1.35, z + 0.85], y, y + 1.12);
  for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) byzantineColumn({ at: [x + dx * s, z + dz * s], y, h: H, d: 0.42, shaftMat: 'silver', capMat: 'gold', impost: false }, { bag, col });
  // the four faces: an arch from column to column and the spandrels up to the cornice
  const sil = [], gold = [], top = y + H + s + 0.3, ri = s - 0.22, ro = s + 0.22, nA = 14;
  for (let f = 0; f < 4; f++) {
    const a = f * Math.PI / 2, nn = [Math.cos(a), Math.sin(a)], uu = [-nn[1], nn[0]];
    const W = frame([x + nn[0] * s, z + nn[1] * s], uu, nn);
    for (let i = 0; i < nA; i++) {
      const t0 = Math.PI * i / nA, t1 = Math.PI * (i + 1) / nA, P = (r, t, d) => W(r * Math.cos(t), y + H + r * Math.sin(t), d);
      hexa(sil, [P(ri, t0, -0.2), P(ro, t0, -0.2), P(ro, t1, -0.2), P(ri, t1, -0.2)], [P(ri, t0, 0.2), P(ro, t0, 0.2), P(ro, t1, 0.2), P(ri, t1, 0.2)]);
    }
    // spandrels: vertical strips from the extrados up to the cornice
    const ns = 10;
    for (let i = 0; i < ns; i++) {
      const u0 = -ro + ro * i / ns, u1 = -ro + ro * (i + 1) / ns;
      for (const sg of [1, -1]) {
        const a0 = sg > 0 ? -u1 : u0, a1 = sg > 0 ? -u0 : u1;      // mirror on the right
        const yb = (uu2) => y + H + Math.sqrt(Math.max(0, ro * ro - uu2 * uu2)) - 0.02;
        hexa(sil, [W(a0, yb(a0), -0.12), W(a1, yb(a1), -0.12), W(a1, yb(a1), 0.12), W(a0, yb(a0), 0.12)], [W(a0, top, -0.12), W(a1, top, -0.12), W(a1, top, 0.12), W(a0, top, 0.12)]);
      }
    }
    for (const sg of [-1, 1]) fbox(sil, W, sg > 0 ? ro : -s - 0.3, sg > 0 ? s + 0.3 : -ro, y + H, top, -0.12, 0.12);
    // the cornice over the face, a gilt band under it
    fbox(sil, W, -s - 0.42, s + 0.42, top, top + 0.22, -0.2, 0.34);
    fbox(gold, W, -s - 0.3, s + 0.3, top - 0.14, top - 0.04, 0.1, 0.16);
  }
  bag.add('silver', fromTriangles(sil));
  bag.add('gold', fromTriangles(gold));
  // the roof: eight-sided, its faces curving in toward the crest; a flat silver ceiling under it
  const R8 = (s + 0.42) / Math.cos(Math.PI / 8), hr = s * 1.35, y8 = top + 0.22;
  const roof = lathe([[R8, 0], [R8 * 0.74, hr * 0.18], [R8 * 0.5, hr * 0.42], [R8 * 0.3, hr * 0.7], [0.2, hr], [0.001, hr]], 8);
  roof.rotateY(Math.PI / 8); roof.translate(x, y8, z); bag.add('silver', roof);
  const ceil = lathe([[0.001, 0], [R8 - 0.02, 0]], 8); ceil.rotateY(Math.PI / 8); ceil.translate(x, y8 + 0.01, z); bag.add('silver', ceil);
  // the cup-shaped crest and the cross
  const yk = y8 + hr;
  bag.add('silver', lathe([[0.16, 0], [0.09, 0.12], [0.11, 0.2], [0.34, 0.42], [0.4, 0.62], [0.36, 0.64], [0.001, 0.5]], 16, null, x, yk, z));
  bag.add('gold', box(x - 0.05, yk + 0.5, z - 0.05, x + 0.05, yk + 1.55, z + 0.05));
  bag.add('gold', box(x - 0.32, yk + 1.12, z - 0.045, x + 0.32, yk + 1.22, z + 0.045));
}

// ── the lamps ────────────────────────────────────────────────────────────────

/** One silver disc of lamps at (x, y, z), radius r, nl glass cups in its piercings; its three chains to a ring at y + k. */
function lampDisc(bag, x, y, z, r, nl, hook = 0.7) {
  const sil = [];
  const seg = (r0, r1, a0, a1) => { const P = (rr, a, yy) => [x + rr * Math.cos(a), yy, z + rr * Math.sin(a)]; hexa(sil, [P(r0, a0, y), P(r1, a0, y), P(r1, a1, y), P(r0, a1, y)], [P(r0, a0, y + 0.03), P(r1, a0, y + 0.03), P(r1, a1, y + 0.03), P(r0, a1, y + 0.03)]); };
  for (let k = 0; k < 24; k++) { seg(r * 0.84, r, 2 * Math.PI * k / 24, 2 * Math.PI * (k + 1) / 24); seg(0.001, r * 0.3, 2 * Math.PI * k / 24, 2 * Math.PI * (k + 1) / 24); }
  // spokes between the piercings
  for (let k = 0; k < nl; k++) { const a = 2 * Math.PI * (k + 0.5) / nl, w = Math.min(0.2, 0.5 / nl * 2); seg(r * 0.29, r * 0.85, a - w / 2, a + w / 2); }
  bag.add('silver', fromTriangles(sil));
  for (let k = 0; k < nl; k++) {
    const a = 2 * Math.PI * k / nl, px = x + Math.cos(a) * r * 0.57, pz = z + Math.sin(a) * r * 0.57;
    bag.add('glass_lamp', lathe([[0.001, 0], [0.05, 0.03], [0.075, 0.12], [0.07, 0.19]], 8, null, px, y - 0.15, pz));
    bag.add('flame', lathe([[0.001, 0], [0.02, 0.03], [0.001, 0.08]], 5, null, px, y + 0.03, pz));
  }
  for (let k = 0; k < 3; k++) { const a = 2 * Math.PI * (k + 0.25) / 3; bag.add('bronze', rod([x + Math.cos(a) * r * 0.92, y + 0.03, z + Math.sin(a) * r * 0.92], [x, y + hook, z], 0.008, 3)); }
  bag.add('bronze', lathe([[0.05, 0], [0.06, 0.02], [0.05, 0.04]], 8, null, x, y + hook - 0.02, z));
}
/** A cross of lamps, "the shape of the lofty cross with many eyes upon it" (Paul, 806): silver arms, cups along them. */
function lampCross(bag, x, y, z, L, yaw, hook = 0.7) {
  const sil = [], c = Math.cos(yaw), s = Math.sin(yaw), T = (a, b) => [x + a * c - b * s, z + a * s + b * c];
  const bar = (a0, a1, b0, b1) => { const p = [T(a0, b0), T(a1, b0), T(a1, b1), T(a0, b1)]; hexa(sil, p.map((q) => [q[0], y, q[1]]), p.map((q) => [q[0], y + 0.04, q[1]])); };
  bar(-L, L, -0.07, 0.07);                                  // one arm through, the other in two halves meeting it
  bar(-0.07, 0.07, 0.07, L); bar(-0.07, 0.07, -L, -0.07);
  bag.add('silver', fromTriangles(sil));
  const eyes = [];
  for (let k = -3; k <= 3; k++) if (k) { eyes.push(T(k * L / 3.4, 0)); eyes.push(T(0, k * L / 3.4)); }
  eyes.push(T(0, 0));
  for (const [px, pz] of eyes) {
    bag.add('glass_lamp', lathe([[0.001, 0], [0.04, 0.03], [0.06, 0.1], [0.055, 0.15]], 8, null, px, y - 0.11, pz));
    bag.add('flame', lathe([[0.001, 0], [0.016, 0.025], [0.001, 0.065]], 5, null, px, y + 0.04, pz));
  }
  for (const [px, pz] of [T(L * 0.9, 0), T(-L * 0.9, 0), T(0, L * 0.9), T(0, -L * 0.9)]) bag.add('bronze', rod([px, y + 0.04, pz], [x, y + hook, z], 0.008, 3));
}

/**
 * The hanging lamps { at, y, r, n, top, hang, light, lights, distance }. With hang { r, y } (the great ring under the
 * dome): n silver discs and crosses alternating in a circle of radius r, "suspended circle-wise in the air round the
 * central confines of the church", each on its own long chain from the cornice at the hang radius (Paul, 806–820).
 * With r > 1.5: a cluster of discs round a central one, their chains gathered to one chain from the vault. Otherwise one
 * disc of lamps on its chains.
 */
function polykandelon(el, { bag, lights }) {
  const [x, z] = el.at, y = el.y, r = el.r, n = el.n || 16;
  if (el.hang) {
    const k = Math.max(8, Math.round(n / 3));
    for (let i = 0; i < k; i++) {
      const a = 2 * Math.PI * i / k, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, yy = y + (i % 2 ? 0.25 : 0);
      if (i % 2) lampCross(bag, px, yy, pz, 0.62, a); else lampDisc(bag, px, yy, pz, 0.55, 8);
      bag.add('bronze', rod([px, yy + 0.7, pz], [x + Math.cos(a) * el.hang.r, el.hang.y, z + Math.sin(a) * el.hang.r], 0.016, 3));
    }
  } else if (r > 1.5) {
    const k = Math.max(4, Math.round(n / 4)), hy = y + 2.2;
    for (let i = 0; i < k; i++) {
      const a = 2 * Math.PI * i / k, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
      lampDisc(bag, px, y, pz, 0.45, 6);
      bag.add('bronze', rod([px, y + 0.7, pz], [x, hy, z], 0.01, 3));
    }
    lampDisc(bag, x, y + 0.6, z, 0.6, 8, hy - y - 0.6);
    bag.add('bronze', rod([x, hy, z], [x, el.top, z], 0.02, 4));
  } else {
    lampDisc(bag, x, y, z, Math.min(0.75, r * 0.7), Math.min(10, n));
    bag.add('bronze', rod([x, y + 0.7, z], [x, el.top, z], 0.014, 4));
  }
  const nl = el.lights || (el.light ? 1 : 0);
  for (let i = 0; i < nl; i++) {
    const a = 2 * Math.PI * (i + 0.5) / nl;
    lights.push({ at: [x + Math.cos(a) * r, y + 0.02, z + Math.sin(a) * r], color: '#ffb46b', intensity: el.light, distance: el.distance ?? Math.max(8, r * 3) });
  }
}

const base = STYLES.byzantine;
/**
 * The ambo (Paul the Silentiary, Descriptio Ambonis; docs/settlements/constantinople.md §4.7): "as an island rises amidst
 * the swelling billows ... so in the middle space of the boundless temple rises upright the tower-like ambo of stone";
 * an oval platform on eight posts with a vaulted space beneath it for the singers, reached by stairs from east and west;
 * round it an enclosure of eight columns with parapet slabs between them about a man's height and an architrave on top;
 * all of costly marbles with silver. { at [x, z], y, rx, rz (the platform's half-axes), h (its floor) }.
 */
function ambo(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rx || 3.0, b = el.rz || 2.1, H = el.h || 2.4;
  const oval = (prof, n, mat, sx = a, sz = b) => { const g = lathe(prof, n); g.scale(sx, 1, sz); g.translate(x, y, z); bag.add(mat, g); };
  // the platform: a slab with a moulded edge; beneath it a shallow vault (the singers' space), the eight posts
  oval([[0.001, H - 0.32], [0.97, H - 0.32], [1.0, H - 0.26], [1.0, H - 0.04], [1.02, H], [0.001, H]], 40, 'marble_smooth');
  oval([[0.9, H - 0.32], [0.7, H - 0.42], [0.4, H - 0.5], [0.001, H - 0.53]], 32, 'mosaic_gold');
  for (let k = 0; k < 8; k++) {
    const t = 2 * Math.PI * (k + 0.5) / 8, px = x + Math.cos(t) * a * 0.68, pz = z + Math.sin(t) * b * 0.68;
    bag.add('verde_antico', lathe([[0.12, 0], [0.11, H - 0.62]], 12, null, px, y, pz));
    bag.add('marble', lathe([[0.17, 0], [0.17, 0.14], [0.12, 0.2], [0.001, 0.2]], 12, null, px, y, pz));
    bag.add('silver', lathe([[0.11, 0], [0.19, 0.14], [0.2, 0.2], [0.001, 0.2]], 12, null, px, y + H - 0.62, pz));
    col.circle(px, pz, 0.15, y, y + H);
  }
  // the parapet round the platform: panels of marble framed in silver, a silver coping, a gilt band; open at the stair heads
  oval([[0.955, H], [0.995, H], [0.995, H + 1.0], [0.955, H + 1.0]], 48, 'pavonazzetto');
  oval([[0.94, H + 1.0], [1.01, H + 1.0], [1.01, H + 1.07], [0.94, H + 1.07]], 48, 'silver');
  oval([[0.995, H + 0.12], [1.002, H + 0.12], [1.002, H + 0.2], [0.995, H + 0.2]], 48, 'gold');
  oval([[0.995, H + 0.82], [1.002, H + 0.82], [1.002, H + 0.9], [0.995, H + 0.9]], 48, 'gold');
  for (let k = 0; k < 16; k++) {
    const t = 2 * Math.PI * (k + 0.5) / 16, c = Math.cos(t), s = Math.sin(t);
    if (Math.abs(c) > 0.97) continue;
    // a silver cross on each panel
    const px = x + c * a * 1.003, pz = z + s * b * 1.003, yaw = Math.atan2(-s * a, c * b);
    for (const [w, h2] of [[0.06, 0.42], [0.28, 0.06]]) { const g = box(-w / 2, -h2 / 2, -0.008, w / 2, h2 / 2, 0.008); g.rotateY(-yaw + Math.PI / 2); g.translate(px, y + H + 0.5, pz); bag.add('silver', g); }
  }
  col.floor([x - a * 0.7, z - b * 0.7, x + a * 0.7, z + b * 0.7], y + H);
  for (const s of [-1, 1]) col.segment([x - a * 0.8, z + s * b * 0.98], [x + a * 0.8, z + s * b * 0.98], 0.15, y + H, y + H + 1.07);
  // the stairs from east and west: marble treads between parapets of green marble with silver copings, walked up
  for (const s of [-1, 1]) {
    const x0 = x + s * a * 0.72, x1 = x + s * (a + 4.2), n = Math.round(H / 0.2);
    for (let i = 0; i < n; i++) {
      const f1 = (i + 1) / n, xa = x1 + (x0 - x1) * (i / n);
      bag.add('marble_smooth', box(Math.min(xa, x0), y, z - 0.7, Math.max(xa, x0), y + H * f1, z + 0.7));
    }
    for (const sz of [-1, 1]) {
      const zz0 = z + sz * 0.7, zz1 = z + sz * 0.85, lo = Math.min(x0, x1), hi = Math.max(x0, x1);
      // the parapet rising with the flight: in steps of its own, a rail on top
      for (let i = 0; i < n; i += 2) {
        const xa = x1 + (x0 - x1) * (i / n), xb = x1 + (x0 - x1) * Math.min(1, (i + 2) / n), yt = y + H * Math.min(1, (i + 2) / n) + 0.95;
        bag.add('revetment_green', box(Math.min(xa, xb), y, Math.min(zz0, zz1), Math.max(xa, xb), yt, Math.max(zz0, zz1)));
        bag.add('silver', box(Math.min(xa, xb), yt, Math.min(zz0, zz1) - 0.02, Math.max(xa, xb), yt + 0.05, Math.max(zz0, zz1) + 0.02));
      }
      col.segment([lo, (zz0 + zz1) / 2], [hi, (zz0 + zz1) / 2], 0.2, y, y + H + 1.0);
    }
    col.ramp([Math.min(x0, x1), z - 0.7, Math.max(x0, x1), z + 0.7], y, y + H, s > 0 ? 'w' : 'e');
  }
  // the enclosure: eight columns on an oval round it, the stair passages between the pairs at east and west, parapet
  // slabs about a man's height between the others, the architrave carried round on the columns
  const A = a + 1.5, B = b + 1.5, CH = 4.6;
  const C = Array.from({ length: 8 }, (_, k) => { const t = 2 * Math.PI * (k + 0.5) / 8; return [x + Math.cos(t) * A, z + Math.sin(t) * B, Math.cos(t)]; });
  for (const [cx, cz] of C) byzantineColumn({ at: [cx, cz], y, h: CH, d: 0.36, shaftMat: 'verde_antico', capMat: 'marble', impost: false }, { bag, col });
  for (let k = 0; k < 8; k++) {
    const [ax, az] = C[k], [bx, bz] = C[(k + 1) % 8], mxk = (ax + bx) / 2;
    if (Math.abs(mxk - x) > A * 0.8) continue;                              // the passages east and west
    const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], W = frame([ax, az], u, n);
    const pl = [], sl = [];
    fbox(pl, W, 0.22, L - 0.22, y, y + 1.75, -0.06, 0.06);
    fbox(sl, W, 0.2, L - 0.2, y + 1.75, y + 1.82, -0.09, 0.09);
    for (const d of [1, -1]) { fbox(sl, W, 0.35, L - 0.35, y + 0.15, y + 0.2, d * 0.06, d * 0.075); fbox(sl, W, 0.35, L - 0.35, y + 1.55, y + 1.6, d * 0.06, d * 0.075); ring(sl, W, L / 2, y + 0.88, 0.22, 0.27, d > 0 ? 0.06 : -0.075, d > 0 ? 0.075 : -0.06, 20); }
    bag.add('proconnesian', fromTriangles(pl)); bag.add('silver', fromTriangles(sl));
    col.segment([ax + u[0] * 0.2, az + u[1] * 0.2], [bx - u[0] * 0.2, bz - u[1] * 0.2], 0.14, y, y + 1.82);
  }
  // the architrave: an oval band of marble on the capitals, silver-faced
  oval([[A - 0.25, y + CH - y], [A + 0.25, y + CH - y], [A + 0.25, y + CH + 0.5 - y], [A - 0.25, y + CH + 0.5 - y]].map(([r, h]) => [r / A, h]), 48, 'marble', A, B);
  oval([[1 + 0.26 / A, CH + 0.12], [1 + 0.27 / A, CH + 0.12], [1 + 0.27 / A, CH + 0.4], [1 + 0.26 / A, CH + 0.4]], 48, 'silver', A, B);
}

registerStyle('byzantine-hs', {
  ...base,
  elements: { ...base.elements, dome_cross: domeCross, cornice_lamps: corniceLamps, n_cornice: nCornice, spandrel_discs: spandrelDiscs },
  objects: { ...base.objects, chancel_screen: chancelScreen, ciborium, polykandelon, ambo },
});
