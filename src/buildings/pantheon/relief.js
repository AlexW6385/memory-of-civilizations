// The Pantheon's façade ornament in bronze (docs/buildings/pantheon.md §8d, §8e):
//  frieze_letters — the dedication M·AGRIPPA·L·F·COS·TERTIVM·FECIT in raised bronze letters along the portico's frieze;
//  eagle_relief   — the relief in the pediment: an eagle with spread wings in a wreath of oak, its ribbons running out in
//                   swags toward the corners.
// Both stand on a plane facing north (−z); u runs to the viewer's right (toward −x seen from the north).

import { fromTriangles, orientOutward } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

const D2R = Math.PI / 180;

// ── the lettering ─────────────────────────────────────────────────────────────
// Each glyph: advance width and strokes in units of the letter height: ['l', x0, y0, x1, y1, thickness] and
// ['a', cx, cy, rx, ry, from°, to°, thickness]. Thick strokes 0.13, thin 0.07 (the contrast of Roman capitals).
const T = 0.13, t = 0.07;
const GLYPHS = {
  M: { w: 0.95, s: [['l', 0.08, 0, 0.08, 1, t], ['l', 0.08, 1, 0.475, 0.02, T], ['l', 0.475, 0.02, 0.87, 1, t], ['l', 0.87, 0, 0.87, 1, T]] },
  A: { w: 0.8, s: [['l', 0.4, 1, 0.02, 0, t], ['l', 0.4, 1, 0.78, 0, T], ['l', 0.17, 0.28, 0.63, 0.28, t]] },
  G: { w: 0.82, s: [['a', 0.42, 0.5, 0.36, 0.47, 40, 335, T], ['l', 0.42, 0.45, 0.76, 0.45, t], ['l', 0.76, 0.45, 0.76, 0.14, T]] },
  R: { w: 0.72, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.975, 0.34, 0.975, t], ['a', 0.34, 0.735, 0.27, 0.235, 90, -90, T], ['l', 0.34, 0.5, 0.1, 0.5, t], ['l', 0.36, 0.5, 0.68, 0, T]] },
  I: { w: 0.22, s: [['l', 0.11, 0, 0.11, 1, T]] },
  P: { w: 0.66, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.975, 0.34, 0.975, t], ['a', 0.34, 0.735, 0.27, 0.235, 90, -90, T], ['l', 0.34, 0.5, 0.1, 0.5, t]] },
  L: { w: 0.6, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.035, 0.56, 0.035, t]] },
  F: { w: 0.56, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.965, 0.52, 0.965, t], ['l', 0.1, 0.52, 0.44, 0.52, t]] },
  C: { w: 0.76, s: [['a', 0.4, 0.5, 0.36, 0.47, 42, 318, T]] },
  O: { w: 0.92, s: [['a', 0.46, 0.5, 0.42, 0.47, 0, 360, T]] },
  S: { w: 0.62, s: [['a', 0.31, 0.745, 0.245, 0.245, 25, 270, T], ['a', 0.31, 0.255, 0.245, 0.245, 90, -155, T]] },
  T: { w: 0.66, s: [['l', 0.33, 0, 0.33, 1, T], ['l', 0.0, 0.965, 0.66, 0.965, t]] },
  E: { w: 0.56, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.035, 0.52, 0.035, t], ['l', 0.1, 0.5, 0.44, 0.5, t], ['l', 0.1, 0.965, 0.52, 0.965, t]] },
  V: { w: 0.82, s: [['l', 0.02, 1, 0.4, 0, t], ['l', 0.8, 1, 0.4, 0, T]] },
  '·': { w: 0.26, s: [['l', 0.13, 0.44, 0.13, 0.56, 0.12]] },
};

/**
 * frieze_letters { at [x, z] (the frieze's face on its centre line), y (the letters' foot), h (their height), text, dep, mat }
 * Raised bronze letters, each stroke a prism; the verticals carry small serifs. Reading left to right as seen from −z.
 */
export function friezeLetters(el, { bag }) {
  const [cx, cz] = el.at, y0 = el.y, h = el.h, dep = el.dep ?? 0.07, gap = el.gap ?? 0.3;
  const text = [...el.text];
  let total = 0;
  for (const ch of text) total += GLYPHS[ch].w + gap;
  total -= gap;
  const out = [];
  const P = (u, v, d) => [cx - u * h, y0 + v * h, cz - d];       // u to the viewer's right
  const bar = (u0, v0, u1, v1, th, ext = 0) => {
    let dx = u1 - u0, dy = v1 - v0; const L = Math.hypot(dx, dy) || 1;
    dx /= L; dy /= L;
    const nx = -dy * th / 2, ny = dx * th / 2;
    const a = [u0 - dx * ext, v0 - dy * ext], b = [u1 + dx * ext, v1 + dy * ext];
    hexa(out, [P(a[0] + nx, a[1] + ny, 0), P(b[0] + nx, b[1] + ny, 0), P(b[0] - nx, b[1] - ny, 0), P(a[0] - nx, a[1] - ny, 0)],
      [P(a[0] + nx, a[1] + ny, dep), P(b[0] + nx, b[1] + ny, dep), P(b[0] - nx, b[1] - ny, dep), P(a[0] - nx, a[1] - ny, dep)]);
  };
  // letter units are heights; the lettering is laid out from −total/2
  let u = -total / 2;
  for (const ch of text) {
    const g = GLYPHS[ch];
    const U = (x) => u + x;
    for (const s of g.s) {
      if (s[0] === 'l') {
        const [, x0, y0_, x1, y1, th] = s;
        bar(U(x0), y0_, U(x1), y1, th);
        // serifs at the ends of the thick verticals
        if (x0 === x1 && th === T) for (const yy of [y0_, y1]) bar(U(x0) - 0.13, yy === 0 ? 0.017 : 0.983, U(x0) + 0.13, yy === 0 ? 0.017 : 0.983, 0.034);
      } else {
        const [, ccx, ccy, rx, ry, a0, a1, th] = s;
        const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 24));
        for (let i = 0; i < n; i++) {
          const p = (a0 + (a1 - a0) * i / n) * D2R, q = (a0 + (a1 - a0) * (i + 1) / n) * D2R;
          // a ring's thickness varies: thick at the sides (cos), thin at top and bottom
          const w = (a) => t + (th - t) * Math.abs(Math.cos(a));
          bar(U(ccx + rx * Math.cos(p)), ccy + ry * Math.sin(p), U(ccx + rx * Math.cos(q)), ccy + ry * Math.sin(q), (w(p) + w(q)) / 2, 0.02);
        }
      }
    }
    u += g.w + gap;
  }
  // the letters are built in units of the height: scale u and v by h
  const g = fromTriangles(out);
  bag.add(el.mat || 'bronze', g);
}

// ── the pediment's relief ─────────────────────────────────────────────────────

/** A convex polygon (u, v pairs) extruded from depth d0 to d1 on the façade plane. */
function prism(out, W, pts, d0, d1) {
  const n = pts.length, tri = [];
  const B = pts.map((p) => W(p[0], p[1], d0)), Tp = pts.map((p) => W(p[0], p[1], d1));
  for (let i = 1; i < n - 1; i++) { tri.push(...B[0], ...B[i], ...B[i + 1]); tri.push(...Tp[0], ...Tp[i], ...Tp[i + 1]); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; tri.push(...B[i], ...B[j], ...Tp[j], ...B[i], ...Tp[j], ...Tp[i]); }
  out.push(...orientOutward(tri));
}
/** A feather or leaf: a pointed paddle from (u, v) along angle ang (degrees), length L, width w. */
function paddle(out, W, u, v, ang, L, w, d0, d1) {
  const a = ang * D2R, ca = Math.cos(a), sa = Math.sin(a);
  const pts = [[0, -w * 0.4], [L * 0.18, -w], [L * 0.78, -w], [L, 0], [L * 0.78, w], [L * 0.18, w], [0, w * 0.4]].map(([x, y]) => [u + x * ca - y * sa, v + x * sa + y * ca]);
  prism(out, W, pts, d0, d1);
}

/**
 * eagle_relief { at [x, z] (on the tympanum's face), y (the wreath's centre), r (its mean radius), base (the tympanum's floor),
 * reach (how far the swags run), face }: an oak wreath of leaf pairs with acorns, bound at the foot by a knot with two
 * ribbons; in it an eagle seen from the front, the head in profile to its right, the wings in three tiers of feathers
 * (coverts, secondaries, primaries), the tail fanned below, the talons on a thunderbolt with its flames; from the knot the
 * ribbons run out low across the tympanum in swags and end in swallow-tails. [stated: probable — clamp holes in the
 * pediment (dossier §8); form after Roman eagle-in-wreath reliefs, inferred]
 */
export function eagleRelief(el, { bag }) {
  const [x, z] = el.at, yc = el.y, r = el.r ?? 2.0, S = r / 2, base = el.base ?? yc - 2.9, reach = el.reach ?? 12.5;
  const W = (u, v, d) => [x - u, yc + v, z - d];
  const g = [];
  // the wreath: a band, and round it leaves in pairs, two layers
  const NB = 48;
  for (let i = 0; i < NB; i++) {
    const a = TAU(i / NB), b = TAU((i + 1) / NB);
    const P = (rr, th) => [rr * Math.cos(th), rr * Math.sin(th)];
    prism(g, W, [P(r - 0.07, a), P(r + 0.07, a), P(r + 0.07, b), P(r - 0.07, b)], 0, 0.1);
  }
  const NL = 40;
  for (let i = 0; i < NL; i++) {
    const th = TAU(i / NL), tx = -Math.sin(th), ty = Math.cos(th), rx = Math.cos(th), ry = Math.sin(th);
    const tang = Math.atan2(ty, tx) / D2R;
    for (const [side, off, lay] of [[1, 0.1, 0], [-1, -0.1, 1]]) {
      const cu = (r + off) * rx - tx * 0.18, cv = (r + off) * ry - ty * 0.18;
      paddle(g, W, cu, cv, tang + side * 28, 0.46, 0.085, 0.07 + lay * 0.03, 0.15 + lay * 0.03);
    }
    if (i % 4 === 2) prism(g, W, [[rx * (r + 0.24) - 0.05, ry * (r + 0.24) - 0.05], [rx * (r + 0.24) + 0.05, ry * (r + 0.24) - 0.05], [rx * (r + 0.24) + 0.05, ry * (r + 0.24) + 0.05], [rx * (r + 0.24) - 0.05, ry * (r + 0.24) + 0.05]], 0.1, 0.2);
  }
  // the knot at the foot and the ribbons: a swag with a slow wave, ending in a swallow-tail
  prism(g, W, [[-0.3, -r - 0.15], [0.3, -r - 0.15], [0.42, -r + 0.2], [-0.42, -r + 0.2]], 0.1, 0.24);
  const ribbon = (sgn) => {
    const x0 = 0.35, N = 28, wd = 0.34;
    const yAt = (u) => (base + 0.95 - yc) - 0.38 * Math.sin(Math.PI * (u - x0) / (reach - x0)) + 0.1 * Math.sin((u - x0) * 2.3) + (u > reach - 2 ? 0 : 0);
    for (let i = 0; i < N; i++) {
      const ua = x0 + (reach - x0) * i / N, ub = x0 + (reach - x0) * (i + 1) / N;
      prism(g, W, [[sgn * ua, yAt(ua) - wd / 2 + 0.3], [sgn * ub, yAt(ub) - wd / 2 + 0.3], [sgn * ub, yAt(ub) + wd / 2 + 0.3], [sgn * ua, yAt(ua) + wd / 2 + 0.3]], 0.1, 0.17);
    }
    const ye = yAt(reach) + 0.3;
    prism(g, W, [[sgn * reach, ye - wd / 2], [sgn * (reach + 0.5), ye - wd / 2 - 0.22], [sgn * (reach + 0.35), ye], [sgn * reach, ye + wd / 2]], 0.1, 0.17);
    prism(g, W, [[sgn * reach, ye + wd / 2], [sgn * (reach + 0.35), ye], [sgn * (reach + 0.5), ye + wd / 2 + 0.22], [sgn * reach, ye + wd / 2 + 0.01]], 0.1, 0.17);
  };
  ribbon(1); ribbon(-1);

  // the eagle
  const e = (u, v) => [u * S, v * S];
  const E = (pts) => pts.map(([u, v]) => e(u, v));
  const dz0 = 0.1, dz1 = 0.2;
  // body, breast feathers in rows, neck
  prism(g, W, E([[-0.28, 0.45], [0.28, 0.45], [0.36, -0.1], [0.22, -0.7], [-0.22, -0.7], [-0.36, -0.1]]), dz0, dz1 + 0.12);
  for (let k = 0; k < 4; k++) for (const sg of [-1, 1]) paddle(g, W, sg * 0.1 * S, (0.3 - 0.27 * k) * S, -90 + sg * 22, 0.34 * S, 0.1 * S, dz1 + 0.1, dz1 + 0.18);
  // the head in profile to the right, the beak hooked
  prism(g, W, E([[-0.12, 0.58], [0.2, 0.58], [0.3, 0.74], [0.18, 0.92], [-0.08, 0.92], [-0.16, 0.74]]), dz0, dz1 + 0.16);
  prism(g, W, E([[0.26, 0.76], [0.52, 0.74], [0.5, 0.64], [0.4, 0.62], [0.36, 0.7], [0.26, 0.68]]), dz0, dz1 + 0.12);
  prism(g, W, E([[0.06, 0.82], [0.12, 0.82], [0.12, 0.78], [0.06, 0.78]]), dz1 + 0.16, dz1 + 0.2);       // the eye
  // wings: three tiers of feathers fanned from the shoulders
  for (const sg of [-1, 1]) {
    const sh = [sg * 0.3 * S, 0.36 * S];
    const tier = (n, a0, a1, L, w, d0, d1, ox) => {
      for (let i = 0; i < n; i++) {
        const ang = a0 + (a1 - a0) * i / (n - 1), a = ang * D2R;
        const ca = Math.cos(a), sa = Math.sin(a);
        const o = [sh[0] + sg * ox * S * ca * 0, sh[1]];
        paddle(g, W, o[0], o[1], sg > 0 ? ang : 180 - ang, L * S, w * S, d0, d1);
      }
    };
    tier(8, 58, -34, 1.32, 0.1, dz0, dz0 + 0.06, 0);         // primaries, the outer ones longest and lowest
    tier(7, 52, -18, 1.0, 0.11, dz0 + 0.05, dz0 + 0.11, 0);   // secondaries
    tier(6, 62, 0, 0.62, 0.1, dz0 + 0.1, dz0 + 0.17, 0);      // coverts
    // the tail
    paddle(g, W, sg * 0.12 * S, -0.62 * S, -90 + sg * 14, 0.7 * S, 0.1 * S, dz0, dz0 + 0.07);
    paddle(g, W, sg * 0.05 * S, -0.62 * S, -90 + sg * 5, 0.78 * S, 0.1 * S, dz0, dz0 + 0.07);
    // the legs and the talons
    prism(g, W, E([[sg * 0.12 - 0.05, -0.64], [sg * 0.12 + 0.05, -0.64], [sg * 0.15 + 0.05, -0.92], [sg * 0.15 - 0.05, -0.92]]), dz0 + 0.04, dz1 + 0.04);
    for (const dd of [-0.08, 0, 0.08]) prism(g, W, E([[sg * 0.15 + dd - 0.025, -0.9], [sg * 0.15 + dd + 0.025, -0.9], [sg * 0.15 + dd * 1.8, -1.0], [sg * 0.15 + dd * 1.8 - 0.01, -1.0]]), dz0 + 0.04, dz1 + 0.04);
  }
  // the thunderbolt in the claws: a zigzag bar with flames fanned to either side
  const zig = [[-0.5, -0.96], [-0.2, -0.9], [-0.05, -1.02], [0.1, -0.9], [0.5, -0.96]];
  for (let i = 0; i < zig.length - 1; i++) {
    const [a, b] = [zig[i], zig[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * 0.035, ny = dx / L * 0.035;
    prism(g, W, E([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]), dz0 + 0.02, dz1 + 0.1);
  }
  for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) paddle(g, W, sg * 0.5 * S, -0.96 * S, sg > 0 ? -14 + k * 14 : 194 - k * 14, 0.38 * S, 0.035 * S, dz0 + 0.02, dz1 + 0.06);
  bag.add(el.mat || 'gilt_bronze', fromTriangles(g));
}
const TAU2 = Math.PI * 2;
function TAU(f) { return f * TAU2; }
