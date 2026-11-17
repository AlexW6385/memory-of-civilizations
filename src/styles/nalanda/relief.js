// Nalanda — relief: the faces of the great temples (piers, stucco niches with their figures, merlons, the stair's cheek walls),
// the chamber of a shrine with its stepped roof, the turrets and the gate, the votive stupa (docs/settlements/nalanda.md §17).
// Brick built as brick: courses in the piers and plinths, plaster only where the stucco was (arch rings, panels, figures).
// Everything is boxes (which the plan instances as one shape) or pieces made distinct by a millimetre (which merge), so the draws do not grow.
import { orientedBox } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';

const BR = 'brick', BRB = 'brick_baked', PL = 'lime_plaster', ST = 'stucco_warm', OP = 'opening';
/** A variation of a millimetre or two by a counter, so that repeated lathes and prisms are not found to be one shape and instanced. */
export const jit = (k) => ((k * 7) % 29) * 0.0011;

/** Push the quad a b c d wound so that its normal has a positive dot with `want`. */
function quadW(out, a, b, c, d, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * want[0] + ny * want[1] + nz * want[2] >= 0) out.push(...a, ...b, ...c, ...a, ...c, ...d); else out.push(...a, ...d, ...c, ...a, ...c, ...b);
}

export default function make(H) {
  const { B, polyPrism, archPoly, fromTriangles } = H;

  /** The frame of one face of a square building (centre cx, cz; half-width h; outward o): pt(t, d) a point along the face and out from it, rib(...) a box on it. */
  function faceFrame(bag, cx, cz, h, o) {
    const tg = o[1] ? [1, 0] : [0, 1];
    const pt = (t, d) => [cx + o[0] * (h - 0.03 + d) + tg[0] * t, cz + o[1] * (h - 0.03 + d) + tg[1] * t];
    const rib = (m, t0, t1, d0, d1, ya, yb) => bag.add(m, orientedBox(pt(t0, (d0 + d1) / 2), pt(t1, (d0 + d1) / 2), d1 - d0, ya, yb, 0));
    return { o, tg, pt, rib, bag };
  }

  /** An arched ring (outer half-width wo, inner wi; straight to h1 then a half-ellipse of rise ro / ri) standing on the wall at p (tangent t, out n) from y, depth d0..d1: front face, reveal, outer edge. */
  function archRing(bag, mat, p, t, n, y, wo, wi, h1o, ro, h1i, ri, d0, d1, seg = 6) {
    const V = (s, h, d) => [p[0] + t[0] * s + n[0] * d, y + h, p[1] + t[1] * s + n[1] * d];
    const line = (hw, h1, rise) => {
      const P = [[-hw, 0]];
      for (let i = 0; i <= seg; i++) { const a = Math.PI * (1 - i / seg); P.push([hw * Math.cos(a), h1 + rise * Math.sin(a)]); }
      P.push([hw, 0]);
      return P;
    };
    const O = line(wo, h1o, ro), I = line(wi, h1i, ri), out = [], ref = V(0, h1i * 0.5, (d0 + d1) / 2), nn = [n[0], 0, n[1]];
    for (let i = 0; i < O.length - 1; i++) {
      const o0 = O[i], o1 = O[i + 1], i0 = I[i], i1 = I[i + 1];
      quadW(out, V(...o0, d1), V(...o1, d1), V(...i1, d1), V(...i0, d1), nn);                         // the front
      const c = V((i0[0] + i1[0]) / 2, (i0[1] + i1[1]) / 2, (d0 + d1) / 2);
      quadW(out, V(...i0, d1), V(...i1, d1), V(...i1, d0), V(...i0, d0), [ref[0] - c[0], ref[1] - c[1], ref[2] - c[2]]);   // the reveal, facing the opening
      const e = V((o0[0] + o1[0]) / 2, (o0[1] + o1[1]) / 2, (d0 + d1) / 2);
      quadW(out, V(...o0, d1), V(...o1, d1), V(...o1, d0), V(...o0, d0), [e[0] - ref[0], e[1] - ref[1], e[2] - ref[2]]);   // the outer edge
    }
    bag.add(mat, fromTriangles(out));
  }

  /** A convex prism without its back (the face against a wall is never seen): the front at d1, the sides down to d0. */
  function slab(bag, mat, poly, p, t, n, y, d0, d1) {
    const V = (a, h, d) => [p[0] + t[0] * a + n[0] * d, y + h, p[1] + t[1] * a + n[1] * d];
    const F = poly.map(([a, h]) => V(a, h, d1)), K = poly.map(([a, h]) => V(a, h, d0)), out = [], nn = [n[0], 0, n[1]];
    const cs = poly.reduce((q, r) => q + r[0], 0) / poly.length, ch = poly.reduce((q, r) => q + r[1], 0) / poly.length, c = V(cs, ch, (d0 + d1) / 2);
    for (let i = 1; i < poly.length - 1; i++) { const a = F[0], b = F[i], d = F[i + 1], nx = (b[1] - a[1]) * (d[2] - a[2]) - (b[2] - a[2]) * (d[1] - a[1]), ny = (b[2] - a[2]) * (d[0] - a[0]) - (b[0] - a[0]) * (d[2] - a[2]), nz = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]); if (nx * nn[0] + ny * nn[1] + nz * nn[2] >= 0) out.push(...a, ...b, ...d); else out.push(...a, ...d, ...b); }
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length, m = [(F[i][0] + K[j][0]) / 2 - c[0], (F[i][1] + K[j][1]) / 2 - c[1], (F[i][2] + K[j][2]) / 2 - c[2]];
      quadW(out, F[i], F[j], K[j], K[i], m);
    }
    bag.add(mat, fromTriangles(out));
  }
  /** A flat face of a convex polygon standing on the wall, looking out (n), at depth d: the dark back of a recess. */
  function panel(bag, mat, poly, p, t, n, y, d) {
    const V = (a, h) => [p[0] + t[0] * a + n[0] * d, y + h, p[1] + t[1] * a + n[1] * d], F = poly.map(([a, h]) => V(a, h)), out = [];
    for (let i = 1; i < poly.length - 1; i++) {
      const a = F[0], b = F[i], c = F[i + 1], nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]), ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
      if (nx * n[0] + ny * 0 + nz * n[1] >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
    }
    bag.add(mat, fromTriangles(out));
  }
  // ── figures: stucco in high relief, made of convex prisms seen from the front ─────────────
  const oct = (r, h, n = 8) => Array.from({ length: n }, (_, i) => [r * Math.cos((i + 0.5) * 2 * Math.PI / n), h + r * Math.sin((i + 0.5) * 2 * Math.PI / n)]);
  /** A seated Buddha in dhyāna on a lotus seat before a red halo, in relief: p the point on the axis (tangent tg, outward o), y the seat. s: 1 ≈ 1.2 m. */
  function seated(bag, p, tg, o, y, s, k = 0) {
    const e = jit(k), S = s, P = (m, poly, d0, d1) => slab(bag, m, poly, p, tg, o, y, d0 * S, d1 * S);
    P('terracotta', oct(0.42 + e, 0.8, 8).map(([a, h]) => [a * S, h * S]), -0.2, -0.13);                           // the halo, a disc of painted plaster behind
    P(ST, [[-0.56, 0], [0.56, 0], [0.5, 0.08], [0.46, 0.2], [0.3, 0.3], [-0.3, 0.3], [-0.46, 0.2], [-0.5, 0.08]], -0.12, 0.18);        // lotus seat and crossed legs
    P(ST, [[-0.27, 0.28], [0.27, 0.28], [0.33, 0.52], [0.24, 0.68], [-0.24, 0.68], [-0.33, 0.52]], -0.1, 0.1);        // the body with its shoulders
    P(ST, [[-0.13, 0.3], [0.13, 0.3], [0.11, 0.4], [-0.11, 0.4]], 0.0, 0.17);                                         // the hands in the lap
    P(ST, oct(0.14, 0.8, 8), -0.06, 0.1);                                                                              // the head
    P(ST, oct(0.07, 0.99, 6), -0.03, 0.07);                                                                            // the ushnisha
  }
  /** A standing bodhisattva with a crown, a halo, on a lotus. s: 1 ≈ 1.6 m. */
  function standing(bag, p, tg, o, y, s, k = 0) {
    const e = jit(k), S = s, P = (m, poly, d0, d1) => slab(bag, m, poly, p, tg, o, y, d0 * S, d1 * S);
    P('terracotta', oct(0.33 + e, 1.22, 8).map(([a, h]) => [a * S, h * S]), -0.2, -0.13);
    P(ST, [[-0.3, 0], [0.3, 0], [0.26, 0.08], [-0.26, 0.08]], -0.12, 0.16);                                          // the lotus
    P(ST, [[-0.19, 0.08], [0.19, 0.08], [0.15, 0.62], [-0.15, 0.62]], -0.08, 0.08);                                  // the dhoti
    P(ST, [[-0.14, 0.6], [0.14, 0.6], [0.2, 1.02], [0.1, 1.1], [-0.1, 1.1], [-0.2, 1.02]], -0.08, 0.09);             // the torso, its shoulders and arms
    P(ST, oct(0.12, 1.24, 8), -0.05, 0.09);                                                                          // the head
    P(ST, [[-0.13, 1.33], [0.13, 1.33], [0.08, 1.5], [-0.08, 1.5]], -0.04, 0.07);                                    // the crown
  }
  /** A stucco niche in a wall: a deep arched ring, the dark recess behind, a throne or shelf, the figure (kind 0 seated Buddha, 1 standing bodhisattva), the stepped panel of the base below. y0 the tier's foot, ah the niche's height. */
  function niche(F, t, y0, ah, kind, k, w = 1) {
    const { bag, o, tg, pt, rib } = F, p = pt(t, 0), e = jit(k), ro = 0.62 * w, by = y0 + 1.15;
    archRing(bag, PL, p, tg, o, by, 0.68 * w, (0.46 + e) * w, ah - ro, ro, ah - ro - 0.02, ro - 0.2, -0.04, 0.46);
    // the dark recess behind (the wall's face is at d = 0.03)
    panel(bag, OP, archPoly(0.47 * w, ah - ro - 0.1, ro - 0.22, 5), p, tg, o, by + 0.1, 0.06);
    // the stepped panel of the base under the niche
    rib(PL, t - 0.55 * w, t + 0.55 * w, 0, 0.1, y0 + 0.62, by - 0.02);
    rib(BRB, t - 0.6 * w, t + 0.6 * w, 0, 0.16, by - 0.1, by - 0.02);
    rib(BRB, t - 0.6 * w, t + 0.6 * w, 0, 0.16, y0 + 0.5, y0 + 0.62);
    const pf = pt(t, 0.3);
    if (kind === 1) {
      rib(PL, t - 0.4 * w, t + 0.4 * w, 0, 0.5, by, by + 0.14);
      standing(bag, pf, tg, o, by + 0.14, 0.95 * w, k);
    } else {
      rib(PL, t - 0.46 * w, t + 0.46 * w, 0, 0.55, by, by + 0.22); rib(PL, t - 0.38 * w, t + 0.38 * w, 0, 0.5, by + 0.22, by + 0.36);
      seated(bag, pf, tg, o, by + 0.36, 0.78 * w, k);
    }
  }

  /** A pier of brick standing out from the wall of a tier: a base of two courses, the shaft with a plaster strip on its face, a capital of two corbelled courses. */
  function pier(F, t, ya, yb, w = 0.54, d = 0.3) {
    const { rib } = F;
    rib(BRB, t - w / 2 - 0.08, t + w / 2 + 0.08, -0.04, d + 0.08, ya, ya + 0.2);
    rib(BR, t - w / 2, t + w / 2, -0.04, d, ya + 0.2, yb - 0.2);
    rib(PL, t - 0.09, t + 0.09, d, d + 0.04, ya + 0.5, yb - 0.5);
    rib(BRB, t - w / 2 - 0.08, t + w / 2 + 0.08, -0.04, d + 0.08, yb - 0.2, yb);
  }

  /** A row of small stepped merlons (miniature shrines) along a terrace's edge: at the cornice's top, round the square of half-width h about (cx, cz), skipping rectangles in `skip`. */
  function merlons(bag, cx, cz, h, y, step = 1.7, skip = []) {
    const E = h - 0.22, n = Math.max(2, Math.round((2 * E) / step));
    const at = (x, z) => {
      if (skip.some((r) => x > r[0] && x < r[2] && z > r[1] && z < r[3])) return;
      B(bag, BRB, x - 0.17, y, z - 0.17, x + 0.17, y + 0.12, z + 0.17);
      B(bag, PL, x - 0.11, y + 0.12, z - 0.11, x + 0.11, y + 0.42, z + 0.11);
    };
    for (let i = 0; i < n; i++) {
      const q = -E + 2 * E * (i + 0.5) / n;
      at(cx + q, cz - E); at(cx + q, cz + E); at(cx - E, cz + q); at(cx + E, cz + q);
    }
  }


  /** A miniature stepped shrine (a merlon): two blocks. */
  function mini(bag, x, y, z, w = 0.17) {
    B(bag, BRB, x - w, y, z - w, x + w, y + 0.12, z + w);
    B(bag, PL, x - w * 0.65, y + 0.12, z - w * 0.65, x + w * 0.65, y + 0.12 + w * 1.8, z + w * 0.65);
  }

  /**
   * The dressing of a shrine's chamber (its walls are built by the caller): a plinth of three courses, piers at the corners and pilasters, a deep niche
   * with a seated Buddha in the middle of each side and one with a bodhisattva either side of it, a string course, dentils and a cornice of two courses;
   * the door's side has two niches with bodhisattvas, one each side of the door. c the centre, ho the half-width of the walls' outer face, y the floor, H the wall's height,
   * door the outward direction of the doorway (dw its half-width). Colliders for the plinth go with it.
   */
  function chamber(ctx, { c, ho, y, H, door, dw = 0.9, seed = 0 }) {
    const { bag, col } = ctx, [cx, cz] = c, top = y + H, tn = ho - 1.25, tp = tn - 1.0, ah = Math.min(2.6, H - 2.6);
    let k = seed * 31;
    const courses = [[0.45, 0, 0.22, BRB], [0.32, 0.22, 0.42, BR], [0.2, 0.42, 0.6, BRB]];
    for (const o of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const F = R_face(bag, cx, cz, ho, o), isDoor = o[0] === door[0] && o[1] === door[1], ns = o[1] !== 0;
      const spans = (lim) => (isDoor ? [[-lim, -dw - 0.5], [dw + 0.5, lim]] : [[-lim, lim]]);
      for (const [e, ya, yb, m] of courses) for (const [t0, t1] of spans(ns ? ho + e : ho)) {
        if (t1 - t0 < 0.05) continue;
        F.rib(m, t0, t1, -0.04, e, y + ya, y + yb);
        if (ya === 0) { const a = F.pt(t0, 0), b = F.pt(t1, e); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 0.6); }
      }
      // the pilasters, and the niches
      const small = ho < 3.6;
      if (isDoor) { for (const sg of [-1, 1]) { pier(F, sg * (dw + 0.95), y + 0.6, top - 1.1, 0.5, 0.18); if (!small) niche(F, sg * tn, y - 0.05, ah, 1, k++); } }
      else if (small) niche(F, 0, y - 0.05, ah + 0.1, 0, k++, 1.0);
      else {
        for (const sg of [-1, 1]) { pier(F, sg * tp, y + 0.6, top - 1.1, 0.5, 0.18); niche(F, sg * tn, y - 0.05, ah, 1, k++); }
        niche(F, 0, y - 0.05, ah + 0.3, 0, k++, 1.35);
      }
      // the string course, the dentils, the cornice
      const lim = ns ? ho + 0.5 : ho;
      F.rib(PL, -ho + 0.3, ho - 0.3, -0.02, 0.12, top - 1.2, top - 1.06);
      for (let t = -ho + 0.3; t < ho - 0.3; t += 0.5) F.rib(BRB, t - 0.11, t + 0.11, -0.04, 0.2, top - 0.85, top - 0.55);
      F.rib(BRB, -lim + (ns ? 0.15 : 0), lim - (ns ? 0.15 : 0), -0.04, 0.34, top - 0.55, top - 0.28);
      F.rib(BR, -lim, lim, -0.04, 0.5, top - 0.28, top);
    }
    // the corner piers
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const ex = cx + sx * ho, ez = cz + sz * ho, r2 = (m, e, ya, yb) => { const xa = ex - sx * (0.5 + e), xb = ex + sx * (0.18 + e), za = ez - sz * (0.5 + e), zb = ez + sz * (0.18 + e); B(bag, m, Math.min(xa, xb), ya, Math.min(za, zb), Math.max(xa, xb), yb, Math.max(za, zb)); };
      r2(BRB, 0.08, y + 0.6, y + 0.8); r2(BR, 0, y + 0.8, top - 1.3); r2(BRB, 0.08, top - 1.3, top - 1.1);
    }
  }
  const R_face = (bag, cx, cz, h, o) => faceFrame(bag, cx, cz, h, o);

  /**
   * A stepped roof over a square chamber (half-width ho at the wall top y0): n receding stages of brick and plaster, each with its lip, a chaitya-arched window
   * in the face of the lower stages, miniature shrines at the corners; then the neck, the amalaka, and a stack of parasols and a finial. ps scales the finial.
   */
  function shikhara(ctx, { c, ho, y0, n, hh, ps = 1 }) {
    const { bag } = ctx, [cx, cz] = c, w0 = ho - 0.4, w1 = Math.max(0.8, ho * 0.22);
    let y = y0, w = w0;
    for (let i = 0; i < n; i++) {
      w = w0 + (w1 - w0) * (i / Math.max(1, n - 1));
      B(bag, i % 2 ? PL : BR, cx - w, y, cz - w, cx + w, y + hh - 0.14, cz + w);
      B(bag, BRB, cx - w - 0.14, y + hh - 0.14, cz - w - 0.14, cx + w + 0.14, y + hh, cz + w + 0.14);
      if (i < n - 2) for (const o of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const p = [cx + o[0] * w, cz + o[1] * w], tg = o[1] ? [1, 0] : [0, 1], ww = Math.min(0.9, w * 0.3 + 0.1) + jit(i * 4 + (o[0] + 2 * o[1] + 3));
        archRing(bag, PL, p, tg, o, y + 0.12, ww, ww * 0.7, 0.05, hh * 0.62, 0.05, hh * 0.62 - ww * 0.3, -0.04, 0.2);
        panel(bag, OP, archPoly(ww * 0.7, 0.05, hh * 0.62 - ww * 0.3, 5), p, tg, o, y + 0.12, 0.03);
      }
      if (i < n - 1) for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) mini(bag, cx + sx * (w - 0.27), y + hh, cz + sz * (w - 0.27), 0.16);
      y += hh;
    }
    const q = ps;
    B(bag, PL, cx - 0.55 * q, y, cz - 0.55 * q, cx + 0.55 * q, y + 0.3 * q, cz + 0.55 * q);
    bag.add(PL, lathe([[0.62 * q, 0], [0.78 * q, 0.12 * q], [0.84 * q, 0.3 * q], [0.7 * q, 0.5 * q], [0.5 * q, 0.58 * q]], 10, null, cx, y + 0.3 * q, cz));
    bag.add(BRB, lathe([[0.2 * q, 0], [0.16 * q, 0.1 * q], [0.5 * q, 0.14 * q], [0.5 * q, 0.2 * q], [0.12 * q, 0.26 * q], [0.12 * q, 0.34 * q], [0.38 * q, 0.38 * q], [0.38 * q, 0.43 * q], [0.08 * q, 0.48 * q], [0.05 * q, 0.6 * q], [0.05 * q, 1.1 * q], [0.001, 1.5 * q]], 8, null, cx, y + 0.88 * q, cz));
  }


  /** A corner turret of a monastery's roof, its foot at y: plinth, brick body with quoins at the corners and an arched window on the two faces that look outward (sx, sz the corner), string course, cornice with a miniature shrine at each corner, plaster storey, spire. */
  function turret(ctx, x, z, y, sx, sz, k = 0) {
    const { bag } = ctx;
    B(bag, BRB, x - 1.58, y, z - 1.58, x + 1.58, y + 0.3, z + 1.58);
    B(bag, BR, x - 1.4, y + 0.3, z - 1.4, x + 1.4, y + 2.9, z + 1.4);
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const xa = x + a * 1.12, xb = x + a * 1.48, za = z + b * 1.12, zb = z + b * 1.48; B(bag, BRB, Math.min(xa, xb), y + 0.3, Math.min(za, zb), Math.max(xa, xb), y + 2.6, Math.max(za, zb)); }
    B(bag, PL, x - 1.46, y + 2.4, z - 1.46, x + 1.46, y + 2.55, z + 1.46);
    for (const o of [[sx, 0], [0, sz]]) {
      const tg = o[1] ? [1, 0] : [0, 1], p = [x + o[0] * 1.4, z + o[1] * 1.4], e = jit(k + o[0] + 2 * o[1] + 3);
      archRing(bag, PL, p, tg, o, y + 0.85, 0.52, 0.34 + e, 0.75, 0.52, 0.73, 0.34, -0.04, 0.2);
      panel(bag, OP, archPoly(0.35, 0.73, 0.34, 5), p, tg, o, y + 0.85, 0.03);
    }
    B(bag, BRB, x - 1.62, y + 2.9, z - 1.62, x + 1.62, y + 3.22, z + 1.62);
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) mini(bag, x + a * 1.38, y + 3.22, z + b * 1.38, 0.15);
    B(bag, PL, x - 0.95, y + 3.22, z - 0.95, x + 0.95, y + 4.1, z + 0.95);
    B(bag, BRB, x - 1.05, y + 4.1, z - 1.05, x + 1.05, y + 4.25, z + 1.05);
    bag.add(BRB, lathe([[0.6, 0], [0.4, 0.3], [0.1, 0.9], [0.001, 1.6]], 8, null, x, y + 4.25, z));
  }

  /** The dressing of the gate tower over a monastery's entrance (west side; the tower from x0 to x0 + 4.6, gz its middle, y its foot): pilasters and an arched window on the faces, small shrines on the cornice. */
  function gateTower(ctx, x0, gz, y) {
    const { bag } = ctx;
    for (const [o, cxx, czz, hw] of [[[-1, 0], x0, gz, 3.4], [[1, 0], x0 + 4.6, gz, 3.4], [[0, -1], x0 + 2.3, gz - 3.4, 2.3], [[0, 1], x0 + 2.3, gz + 3.4, 2.3]]) {
      const tg = o[1] ? [1, 0] : [0, 1], p = [cxx, czz], ns = o[1] !== 0;
      archRing(bag, PL, p, tg, o, y + 0.6, 0.85, 0.6, 1.2, 0.6, 1.18, 0.4, -0.04, 0.24);
      panel(bag, OP, archPoly(0.61, 1.18, 0.4, 5), p, tg, o, y + 0.6, 0.03);
      B(bag, PL, ...(ns ? [cxx - 1.0, y + 0.5, czz - 0.04 + (o[1] > 0 ? 0 : -0.3), cxx + 1.0, y + 0.6, czz + (o[1] > 0 ? 0.3 : 0.04)] : [cxx - 0.04 + (o[0] > 0 ? 0 : -0.3), y + 0.5, czz - 1.0, cxx + (o[0] > 0 ? 0.3 : 0.04), y + 0.6, czz + 1.0]));
      if (!ns) for (const sg of [-1, 1]) {
        const zz = czz + sg * 2.4, xa = o[0] > 0 ? cxx : cxx - 0.18, xb = o[0] > 0 ? cxx + 0.18 : cxx;
        B(bag, BRB, xa, y, zz - 0.4, xb, y + 0.25, zz + 0.4); B(bag, BR, xa, y + 0.25, zz - 0.32, xb, y + 2.9, zz + 0.32); B(bag, BRB, xa, y + 2.9, zz - 0.4, xb, y + 3.1, zz + 0.4);
      }
    }
    for (const dz of [-3.1, -1.55, 0, 1.55, 3.1]) { mini(bag, x0 + 0.15, y + 3.6, gz + dz, 0.15); mini(bag, x0 + 4.45, y + 3.6, gz + dz, 0.15); }
  }

  /** The porch before a monastery's gate (x0 the front of the wall, gz the middle): pilasters on the faces of the two brick stubs, a lintel course under the slab and small shrines along its edge. */
  function porch(ctx, x0, gz) {
    const { bag } = ctx;
    for (const sg of [-1, 1]) {
      const zc = gz + sg * 2.15;
      B(bag, BRB, x0 - 2.62, -0.1, zc - 0.55, x0 - 2.4, 0.35, zc + 0.55);
      B(bag, BR, x0 - 2.55, 0.35, zc - 0.4, x0 - 2.4, 3.9, zc + 0.4);
      B(bag, BRB, x0 - 2.62, 3.9, zc - 0.55, x0 - 2.4, 4.15, zc + 0.55);
      B(bag, PL, x0 - 2.58, 4.15, zc - 0.5, x0 - 2.4, 4.3, zc + 0.5);
    }
    B(bag, BRB, x0 - 2.7, 4.5, gz - 2.7, x0, 4.7, gz + 2.7);
    for (const dz of [-2.55, -1.9, 1.9, 2.55]) mini(bag, x0 - 2.45, 5.0, gz + dz, 0.15);
    mini(bag, x0 - 2.45, 5.0, gz, 0.2);
  }

  /** The cheek walls of a flight toward the west (rising westward) on its two sides: stepped with the steps, a coping of baked brick, a base moulding; a newel at the foot with a votive stupa. */
  function cheeks(ctx, x0, xs, cz, sw, y0, y1, nSteps, foot, stupa) {
    const { bag } = ctx, L = xs - x0, dy = (y1 - y0) / nSteps;
    for (const s of [-1, 1]) {
      const za = s > 0 ? cz + sw + 0.05 : cz - sw - 0.65, zb = za + 0.6;
      for (let i = 0; i < nSteps; i++) {
        const xa = xs - L * (i + 1) / nSteps, xb = xs - L * i / nSteps, top = y0 + dy * (i + 1) + 0.92;
        B(bag, BR, xa, foot, za, xb, top - 0.12, zb);
        B(bag, BRB, xa, top - 0.12, za - 0.07, xb, top, zb + 0.07);
      }
      // the newel at the foot: a squared pier with a base, a cap and a small stupa
      const zc = (za + zb) / 2;
      B(bag, BRB, xs - 0.2, foot, zc - 0.48, xs + 0.95, y0 + 0.28, zc + 0.48);
      B(bag, BR, xs - 0.05, y0 + 0.28, zc - 0.38, xs + 0.8, y0 + 1.5, zc + 0.38);
      B(bag, BRB, xs - 0.15, y0 + 1.5, zc - 0.46, xs + 0.9, y0 + 1.68, zc + 0.46);
      stupa(ctx, xs + 0.37, zc, y0 + 1.68, 0.2, false);
    }
  }

  return { faceFrame, archRing, seated, standing, niche, pier, merlons, cheeks, chamber, shikhara, mini, turret, gateTower, porch, panel, slab, jit };
}
