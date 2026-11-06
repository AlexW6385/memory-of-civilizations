// The Great Clock's dials (docs/settlements/london.md §1.6): each 7 m across, of pot opal glass in a cast-iron frame
// bolted together in sections, the frame and hands painted Prussian blue; the hour figures 60 cm long (IV, not IIII);
// the ornate surround gilded, its corners cobalt blue with gold leaf; at the base of each dial the Latin prayer
// DOMINE SALVAM FAC REGINAM NOSTRAM VICTORIAM PRIMAM in gilt letters. The opal glass is lit from behind at night.

import { prism, ngon } from '../dutch/facade.js';

// a stroke alphabet for the letters of the inscription and the Roman figures: segments in a unit box
const GLYPH = {
  D: [[0, 0, 0, 1], [0, 1, 0.6, 1], [0.6, 1, 1, 0.7], [1, 0.7, 1, 0.3], [1, 0.3, 0.6, 0], [0.6, 0, 0, 0]],
  O: [[0.2, 0, 0.8, 0], [0.8, 0, 1, 0.3], [1, 0.3, 1, 0.7], [1, 0.7, 0.8, 1], [0.8, 1, 0.2, 1], [0.2, 1, 0, 0.7], [0, 0.7, 0, 0.3], [0, 0.3, 0.2, 0]],
  M: [[0, 0, 0, 1], [0, 1, 0.5, 0.4], [0.5, 0.4, 1, 1], [1, 1, 1, 0]], I: [[0.5, 0, 0.5, 1]], N: [[0, 0, 0, 1], [0, 1, 1, 0], [1, 0, 1, 1]],
  E: [[0, 0, 0, 1], [0, 1, 1, 1], [0, 0.5, 0.8, 0.5], [0, 0, 1, 0]], S: [[1, 1, 0, 1], [0, 1, 0, 0.5], [0, 0.5, 1, 0.5], [1, 0.5, 1, 0], [1, 0, 0, 0]],
  A: [[0, 0, 0.5, 1], [0.5, 1, 1, 0], [0.22, 0.42, 0.78, 0.42]], L: [[0, 1, 0, 0], [0, 0, 1, 0]], V: [[0, 1, 0.5, 0], [0.5, 0, 1, 1]],
  F: [[0, 0, 0, 1], [0, 1, 1, 1], [0, 0.5, 0.8, 0.5]], C: [[1, 1, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0]],
  R: [[0, 0, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0.5], [1, 0.5, 0, 0.5], [0.3, 0.5, 1, 0]], G: [[1, 1, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 1, 0.45], [1, 0.45, 0.5, 0.45]],
  T: [[0, 1, 1, 1], [0.5, 1, 0.5, 0]], P: [[0, 0, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0.5], [1, 0.5, 0, 0.5]], X: [[0, 0, 1, 1], [0, 1, 1, 0]],
};
const FIG = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

/** A bar from (u0, v0) to (u1, v1) on frame F, w wide, d0..d1 out from it. */
function bar(bag, F, m, u0, v0, u1, v1, w, d0, d1) {
  const L = Math.hypot(u1 - u0, v1 - v0) || 1, nu = -(v1 - v0) / L * w / 2, nv = (u1 - u0) / L * w / 2;
  bag.add(m, prism(F, 0, [[u0 - nu, v0 - nv], [u1 - nu, v1 - nv], [u1 + nu, v1 + nv], [u0 + nu, v0 + nv]], d0, d1));
}
/** A ring between radii r0 and r1 round (u, v) in n strips. */
function ring(bag, F, m, u, v, r0, r1, d0, d1, n = 32) {
  for (let i = 0; i < n; i++) { const a = i * 2 * Math.PI / n, b = (i + 1) * 2 * Math.PI / n; bag.add(m, prism(F, 0, [[u + Math.cos(a) * r0, v + Math.sin(a) * r0], [u + Math.cos(b) * r0, v + Math.sin(b) * r0], [u + Math.cos(b) * r1, v + Math.sin(b) * r1], [u + Math.cos(a) * r1, v + Math.sin(a) * r1]], d0, d1)); }
}
/** A word of strokes centred at (u, v), letters h high, turned by `ang` (0: upright), on F at d0..d1. */
function word(bag, F, m, text, u, v, h, ang, d0, d1, sw = h * 0.12, narrow = 1) {
  const cw = h * 0.62 * narrow, gap = h * 0.22 * narrow, W = text.length * (cw + gap) - gap, c = Math.cos(ang), s = Math.sin(ang);
  const T = (x, y) => [u + x * c + y * s, v - x * s + y * c];
  [...text].forEach((ch, i) => { const x0 = -W / 2 + i * (cw + gap); for (const [a, b, e, f] of GLYPH[ch] ?? []) { const p = T(x0 + a * cw, -h / 2 + b * h), q = T(x0 + e * cw, -h / 2 + f * h); bar(bag, F, m, p[0], p[1], q[0], q[1], sw, d0, d1); } });
}

/**
 * The dial on face frame F (u left to right as seen from outside, v absolute height, d outward) centred at (u, v),
 * radius R; `hour` the time it shows.
 */
export function clockDial(bag, F, u, v, R, { hour = 10.13 } = {}) {
  const S = R + 0.85;
  // the surround: the cobalt ground of the square, gilt tracery in its corners, a gilt square frame and a gilt ring
  bag.add('paint_blue', prism(F, 0, [[u - S, v - S], [u + S, v - S], [u + S, v + S], [u - S, v + S]], 0, 0.06));
  for (const [a, b, c, d] of [[-S - 0.18, -S, -S - 0.18, S + 0.18], [S, S + 0.18, -S - 0.18, S + 0.18], [-S, S, -S - 0.18, -S], [-S, S, S, S + 0.18]]) bag.add('gilt_bronze', prism(F, 0, [[u + a, v + c], [u + b, v + c], [u + b, v + d], [u + a, v + d]], 0, 0.16));
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const cu = u + sx * (S - 0.62), cv = v + sy * (S - 0.62);
    ring(bag, F, 'gilt_bronze', cu, cv, 0.36, 0.44, 0.06, 0.11, 16);
    for (let k = 0; k < 3; k++) { const a = Math.atan2(sy, sx) + Math.PI + (k - 1) * 0.9; ring(bag, F, 'gilt_bronze', cu + Math.cos(a) * 0.2, cv + Math.sin(a) * 0.2, 0.1, 0.15, 0.06, 0.1, 10); }
    bar(bag, F, 'gilt_bronze', cu + sx * 0.44 * 0.7, cv + sy * 0.44 * 0.7, u + sx * (S - 0.05), v + sy * (S - 0.05), 0.07, 0.06, 0.1);
    bar(bag, F, 'gilt_bronze', u + sx * R * 0.72, v + sy * R * 0.72, cu - sx * 0.3, cv - sy * 0.3, 0.07, 0.06, 0.1);
  }
  ring(bag, F, 'gilt_bronze', u, v, R, R + 0.24, 0.06, 0.22, 48);
  ring(bag, F, 'gilt_bronze', u, v, R + 0.3, R + 0.4, 0.06, 0.14, 48);
  // the opal glass, and on it the iron frame: the hub, rings, radial bars, the chapter ring with its minutes
  bag.add('lamp_white', prism(F, 0, ngon(u, v, R, 48), 0.06, 0.1));
  for (const r of [0.34, 0.6, 0.8, 0.97]) ring(bag, F, 'prussian_blue', u, v, R * r - 0.035, R * r + 0.035, 0.1, 0.13, 48);
  for (let k = 0; k < 36; k++) { const a = k * Math.PI / 18; bar(bag, F, 'prussian_blue', u + Math.sin(a) * R * 0.34, v + Math.cos(a) * R * 0.34, u + Math.sin(a) * R * 0.6, v + Math.cos(a) * R * 0.6, 0.05, 0.1, 0.13); }
  for (let k = 0; k < 60; k++) { const a = k * Math.PI / 30, r0 = k % 5 ? 0.86 : 0.82; bar(bag, F, 'prussian_blue', u + Math.sin(a) * R * r0, v + Math.cos(a) * R * r0, u + Math.sin(a) * R * 0.97, v + Math.cos(a) * R * 0.97, k % 5 ? 0.04 : 0.08, 0.1, 0.13); }
  // the hour figures, radial, 60 cm long, between the rings
  FIG.forEach((t, k) => { const a = k * Math.PI / 6, rr = R * 0.7; word(bag, F, 'prussian_blue', t, u + Math.sin(a) * rr, v + Math.cos(a) * rr, 0.6, a, 0.1, 0.14, 0.07, 0.5); });
  // the hands: the hour hand 2.7 m, the minute hand 4.2 m with its counterweight, a leaf near each tip; the boss
  const hand = (ang, L, tail, w, d) => { const su = Math.sin(ang), cv = Math.cos(ang), P = (r, o) => [u + su * r + cv * o, v + cv * r - su * o];
    bag.add('prussian_blue', prism(F, 0, [P(-tail, -w), P(L * 0.8, -w * 0.5), P(L * 0.8, w * 0.5), P(-tail, w)], d, d + 0.05));
    bag.add('prussian_blue', prism(F, 0, [P(L * 0.72, 0), P(L * 0.84, -w * 1.8), P(L, 0), P(L * 0.84, w * 1.8)], d, d + 0.05));
    bag.add('prussian_blue', prism(F, 0, ngon(...P(-tail, 0), w * 2.2, 8), d, d + 0.05)); };
  const hr = hour % 12, mn = (hour * 60) % 60;
  hand(hr / 12 * 2 * Math.PI, R * 0.77, R * 0.15, 0.09, 0.15);
  hand(mn / 60 * 2 * Math.PI, R * 0.93, R * 0.25, 0.06, 0.21);
  bag.add('gilt_bronze', prism(F, 0, ngon(u, v, 0.22, 12), 0.1, 0.3));
  // the prayer for the Queen under the dial, in gilt letters on a blue band
  const yb = v - S - 0.62;
  bag.add('paint_blue', prism(F, 0, [[u - S, yb - 0.3], [u + S, yb - 0.3], [u + S, yb + 0.3], [u - S, yb + 0.3]], 0, 0.06));
  const text = 'DOMINE SALVAM FAC REGINAM NOSTRAM VICTORIAM PRIMAM', h = 0.26, W = (2 * S - 0.3) / text.length;
  [...text].forEach((ch, i) => { if (ch !== ' ') word(bag, F, 'gilt_bronze', ch, u - S + 0.15 + (i + 0.5) * W, yb, h, 0, 0.06, 0.09, 0.04); });
}
