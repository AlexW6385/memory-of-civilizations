// Ming Suzhou's furniture and small things, built in a local frame (sitter's front: -z), turned and
// placed by the room builders (study.js, halls.js, court.js; docs/settlements/ming-suzhou.md §11).

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { Shape, ExtrudeGeometry } from '../../core/three.js';
import { ball, limb, T, Parts, torus } from '../../styles/qing/carving.js';

export { ball, limb, T, Parts, torus, box, lathe, fromTriangles };
export const W = 'lacquer_chestnut';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── furniture, built facing −z at the origin (the sitter's front), then turned and placed ──
/** A table w × d, h high: the top, the waisted apron, round legs, stretchers; ends: 'flat' | 'everted' (the qiaotou'an's turned-up ends). */
export function table(P, w, d, h, ends = 'flat', m = W) {
  P.add(m, box(-w / 2, h - 0.04, -d / 2, w / 2, h, d / 2));
  if (ends === 'everted') for (const s of [-1, 1]) P.add(m, box(s * w / 2 - (s > 0 ? 0.12 : 0), h, -d / 2, s * w / 2 + (s < 0 ? 0.12 : 0), h + 0.05, d / 2));
  const lx = w / 2 - (ends === 'everted' ? 0.22 : 0.05), lz = d / 2 - 0.05;
  for (const s of [-1, 1]) P.add(m, box(-lx, h - 0.11, s * lz - 0.012, lx, h - 0.04, s * lz + 0.012));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, lathe([[0.022, 0], [0.02, h - 0.04], [0.001, h - 0.04]], 8, null, sx * lx, 0, sz * lz));
  for (const sx of [-1, 1]) P.add(m, box(sx * lx - 0.012, 0.16, -lz, sx * lx + 0.012, 0.19, lz));
}
/** The southern official's hat armchair (nanguanmao yi): the seat, the round legs running up into the back posts, the curved splat, the arms, the yoke. */
export function armchair(P, m = W) {
  const sw = 0.29, sd = 0.24, sh = 0.5;
  P.add(m, box(-sw, sh - 0.04, -sd, sw, sh, sd));
  P.add('reed_mat', box(-sw + 0.03, sh, -sd + 0.03, sw - 0.03, sh + 0.006, sd - 0.03));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, lathe([[0.018, 0], [0.017, sh - 0.04], [0.001, sh - 0.04]], 6, null, sx * (sw - 0.03), 0, sz * (sd - 0.03)));
  for (const sx of [-1, 1]) {
    P.add(m, limb([sx * (sw - 0.03), sh, sd - 0.03], [sx * (sw - 0.02), 1.08, sd + 0.02], 0.017, 0.015, 6));          // the back posts
    P.add(m, limb([sx * (sw - 0.03), sh, -sd + 0.03], [sx * (sw - 0.01), sh + 0.24, -sd + 0.02], 0.014, 0.013, 6));     // the arm posts
    P.add(m, limb([sx * (sw - 0.01), sh + 0.24, -sd + 0.02], [sx * (sw - 0.02), sh + 0.26, sd - 0.02], 0.015, 0.015, 6));  // the arms
  }
  P.add(m, limb([-sw + 0.02, 1.08, sd + 0.02], [sw - 0.02, 1.08, sd + 0.02], 0.02, 0.02, 6));                         // the yoke rail
  P.add(m, limb([0, sh, sd - 0.04], [0, 0.78, sd + 0.04], 0.012, 0.012, 4));
  P.add(m, box(-0.1, sh + 0.02, sd - 0.03, 0.1, 1.06, sd + 0.01).translate(0, 0, 0.02));                              // the splat
}
/** A side table (jiwu, a square stand) for tea between two chairs. */
export function stand(P, m = W) { table(P, 0.45, 0.45, 0.68, 'flat', m); }

// ── the scholar's objects ──
export function books(P, n, seed, w = 0.2, d = 0.28) {
  const r = rng(seed); let y = 0;
  for (let k = 0; k < n; k++) { const h = 0.012 + r() * 0.01, dx = (r() - 0.5) * 0.02; P.add('paint_white', box(-w / 2 + dx, y + 0.002, -d / 2 + 0.003, w / 2 + dx - 0.004, y + h - 0.002, d / 2 - 0.003)); P.add(r() < 0.6 ? 'cloth_indigo' : 'cloth_brown', box(-w / 2 + dx, y, -d / 2, w / 2 + dx, y + 0.002, d / 2)); y += h; }
  // the case (han) of blue cloth folded round the last few
  P.add('cloth_indigo', box(-w / 2 - 0.006, 0, -d / 2 - 0.004, -w / 2, y, d / 2 + 0.004));
  return y;
}
export function deskThings(P, y) {
  // the inkstone with its well, the ink stick on it, the brush rest with three brushes, the brush pot of bamboo, the water dropper, the paperweights on a sheet
  P.add('slate', box(-0.1, y, -0.08, 0.1, y + 0.03, 0.08).translate(-0.35, 0, -0.05));
  P.add('lacquer_black', box(-0.06, y + 0.03, -0.065, 0.06, y + 0.036, 0.03).translate(-0.35, 0, -0.05));
  P.add('lacquer_black', box(-0.012, y + 0.036, -0.04, 0.012, y + 0.05, 0.05).translate(-0.31, 0, -0.04));
  P.add(W, box(-0.12, y, -0.015, 0.12, y + 0.05, 0.015).translate(0.05, 0, -0.18));
  for (const dx of [-0.07, 0, 0.07]) P.add('bamboo_culm', limb([0.05 + dx, y + 0.055, -0.18], [0.05 + dx, y + 0.055, -0.0], 0.005, 0.004, 5)), P.add('lacquer_black', limb([0.05 + dx, y + 0.055, -0.0], [0.05 + dx, y + 0.055, 0.04], 0.006, 0.001, 5));
  P.add('bamboo_culm', lathe([[0.055, 0], [0.06, 0.16], [0.052, 0.16], [0.052, 0.02], [0.001, 0.02]], 12, null, 0.4, y, 0.12));
  for (const [dx, dz] of [[0.0, 0.0], [0.02, 0.025], [-0.02, 0.02]]) P.add('lacquer_black', limb([0.4 + dx, y + 0.1, 0.12 + dz], [0.4 + dx * 3, y + 0.32, 0.12 + dz * 3], 0.005, 0.003, 4));
  P.add('glaze_white', lathe([[0.001, 0], [0.04, 0.01], [0.045, 0.03], [0.03, 0.05], [0.01, 0.06], [0.001, 0.065]], 10, null, 0.22, y, 0.14));
  P.add('paint_white', box(-0.2, y, -0.02, 0.2, y + 0.002, 0.25).translate(0.0, 0, -0.02));
  for (const dz of [0.0, 0.2]) P.add('inlay_jade', box(-0.15, y + 0.002, -0.012, 0.15, y + 0.022, 0.012).translate(0, 0, dz));
}
/** A scholar's rock on its carved wooden stand (thin, open, wrinkled, as the garden's Taihu stones). */
export function rock(P, h, seed) {
  const r = rng(seed);
  P.add(W, lathe([[0.001, 0], [h * 0.3, 0], [h * 0.32, 0.03], [h * 0.26, 0.06], [0.001, 0.06]], 10).scale(1, 1, 0.6));
  let c = [0, 0.05, 0];
  for (let k = 0; k < 5; k++) { const n = [c[0] + (r() - 0.5) * h * 0.18, c[1] + h * 0.19, c[2] + (r() - 0.5) * h * 0.08]; P.add('taihu', limb(c, n, h * (0.11 + 0.05 * Math.sin(k * 2.1)), h * (0.1 + 0.05 * Math.cos(k * 1.7)), 7)); c = n; }
  P.add('taihu', T(ball(h * 0.13, h * 0.09, h * 0.08, 7, 5), c[0], c[1], c[2]));
}
/** A miniature pine in a shallow basin (penjing): the twisted trunk, its branches ending in cloud-like pads of needles. */
export function pine(P, s, seed, basin = 'glaze_blue') {
  const r = rng(seed);
  P.add(basin, lathe([[0.001, 0], [0.26 * s, 0], [0.3 * s, 0.1 * s], [0.27 * s, 0.1 * s], [0.25 * s, 0.03 * s], [0.001, 0.03 * s]], 6).scale(1.5, 1, 1));
  P.add('ground', lathe([[0.27 * s, 0.08 * s], [0.001, 0.095 * s]], 6).scale(1.5, 1, 1));
  const pts = [[0, 0.08 * s, 0]];
  for (let k = 1; k <= 4; k++) pts.push([Math.sin(k * 1.9 + r()) * 0.09 * s, 0.08 * s + k * 0.13 * s, Math.cos(k * 1.3) * 0.04 * s]);
  for (let k = 0; k < 4; k++) P.add('bark_pine', limb(pts[k], pts[k + 1], (0.045 - k * 0.008) * s, (0.037 - k * 0.008) * s, 6));
  for (let k = 1; k <= 4; k++) {
    const a = r() * 6.28, L = (0.18 + r() * 0.12) * s * (k === 4 ? 0.5 : 1), e = [pts[k][0] + Math.cos(a) * L, pts[k][1] + 0.03 * s, pts[k][2] + Math.sin(a) * L * 0.6];
    P.add('bark_pine', limb(pts[k], e, 0.014 * s, 0.008 * s, 5));
    P.add('lotus_leaf', T(ball(0.12 * s, 0.045 * s, 0.09 * s, 8, 4), e[0], e[1] + 0.02 * s, e[2]));
  }
  P.add('taihu', T(ball(0.06 * s, 0.07 * s, 0.05 * s, 6, 4), 0.18 * s, 0.11 * s, 0.05 * s));
}

// ── geometry helpers ──
/** A polygon [[u, y], …] extruded by depth along z, centred on z = 0. */
export function prism(pts, depth) {
  const s = new Shape(); pts.forEach(([u, y], i) => (i ? s.lineTo(u, y) : s.moveTo(u, y)));
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}
/** A profile [[z, y], …] extruded along x from x0 to x1. */
export function prismX(pts, x0, x1) { const g = prism(pts, x1 - x0); g.rotateY(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, 0); return g; }
/** A profile [[x, y], …] extruded along z from z0 to z1. */
export function prismZ(pts, z0, z1) { const g = prism(pts, z1 - z0); g.translate(0, 0, (z0 + z1) / 2); return g; }
/** The profile of a moon beam (yueliang): bottom edge arching up by rise over the length, h deep. */
export function moonProfile(len, h, rise, n = 10) {
  const lo = [], hi = [];
  for (let k = 0; k <= n; k++) { const t = k / n, u = -len / 2 + len * t, y = rise * Math.sin(Math.PI * t); lo.push([u, y]); hi.unshift([u, y + h]); }
  return [...lo, ...hi];
}
/** An arc [[u, y], …] thickened downward by t (a boarded vault's section). */
export function arcBand(u0, u1, yEnd, yCrest, t, n = 12) {
  const up = [], dn = [];
  for (let k = 0; k <= n; k++) { const a = k / n, u = u0 + (u1 - u0) * a, y = yEnd + (yCrest - yEnd) * Math.sin(Math.PI * a); up.push([u, y]); dn.unshift([u, y - t]); }
  return [...up, ...dn];
}

// ── floors ──
/** A floor of square bricks (about 40 cm: the Suzhou "golden bricks") whose top is at y: each brick one flat quad on a slab of lime that shows as the joints (the room is emitted 5 cm above the hall's own floor). */
export function brickFloor(P, x0, z0, x1, z1, seed = 3, y = 0) {
  const r = rng(seed), nx = Math.max(1, Math.round((x1 - x0) / 0.4)), nz = Math.max(1, Math.round((z1 - z0) / 0.4)), sx = (x1 - x0) / nx, sz = (z1 - z0) / nz;
  P.add('plaster_grey', box(x0, y - 0.042, z0, x1, y - 0.0035, z1));
  const A = [], B = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const a = x0 + i * sx + 0.004, b = x0 + (i + 1) * sx - 0.004, c = z0 + j * sz + 0.004, d = z0 + (j + 1) * sz - 0.004, o = r() < 0.55 ? A : B;
    o.push(a, y, d, b, y, d, b, y, c, a, y, d, b, y, c, a, y, c);
  }
  P.add('cloth_grey', fromTriangles(A)); P.add('granite_grey', fromTriangles(B));
}
/** A woollen carpet w × d on the floor (its top at y + 0.02): indigo border, ochre stripe, red field, a roundel. */
export function carpet(P, w, d, y = 0) {
  const h = w / 2, e = d / 2;
  P.add('cloth_indigo', box(-h, y, -e, h, y + 0.014, e));
  for (const [a, b, c, f] of [[-h + 0.12, -e + 0.12, h - 0.12, -e + 0.17], [-h + 0.12, e - 0.17, h - 0.12, e - 0.12], [-h + 0.12, -e + 0.17, -h + 0.17, e - 0.17], [h - 0.17, -e + 0.17, h - 0.12, e - 0.17]]) P.add('cloth_ochre', box(a, y, b, c, y + 0.017, f));
  P.add('cloth_red', box(-h + 0.17, y, -e + 0.17, h - 0.17, y + 0.016, e - 0.17));
  const R = Math.min(w, d) * 0.3;
  P.add('cloth_ochre', lathe([[R + 0.05, y + 0.016], [R + 0.05, y + 0.0195], [R, y + 0.0195], [R, y + 0.016]], 28));
  P.add('cloth_green', lathe([[R, y + 0.0165], [R, y + 0.018], [0.001, y + 0.018]], 28));
  P.add('cloth_ochre', lathe([[R * 0.45, y + 0.018], [R * 0.45, y + 0.0205], [R * 0.3, y + 0.0205], [R * 0.3, y + 0.018]], 20));
  for (const s of [-1, 1]) P.add('cloth_white', box(Math.min(s * h, s * (h + 0.07)), y, -e + 0.02, Math.max(s * h, s * (h + 0.07)), y + 0.004, e - 0.02));
}

// ── lights ──
/** A palace lantern (gongdeng): six panels of silk in a red-lacquered frame, a tasselled foot, hung on a cord; origin at the hook, drop = chain + 0.98. */
export function lantern(P, chain = 0.3) {
  const y0 = -chain;
  P.add('cloth_red', limb([0, 0, 0], [0, y0, 0], 0.004, 0.004, 3));
  P.add('gilt_bronze', T(ball(0.03, 0.03, 0.03, 6, 3), 0, y0 + 0.01, 0));
  P.add('lacquer_red', lathe([[0.001, y0], [0.05, y0 - 0.03], [0.19, y0 - 0.11], [0.225, y0 - 0.1], [0.225, y0 - 0.125], [0.19, y0 - 0.135], [0.001, y0 - 0.135]], 6));
  P.add('lamp_white', lathe([[0.17, y0 - 0.135], [0.19, y0 - 0.2], [0.19, y0 - 0.68], [0.17, y0 - 0.74]], 6));
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; P.add('lacquer_red', limb([Math.cos(a) * 0.196, y0 - 0.135, Math.sin(a) * 0.196], [Math.cos(a) * 0.196, y0 - 0.74, Math.sin(a) * 0.196], 0.008, 0.008, 3)); }
  P.add('lacquer_red', lathe([[0.001, y0 - 0.765], [0.185, y0 - 0.765], [0.185, y0 - 0.735], [0.001, y0 - 0.735]], 6));
  P.add('cloth_red', limb([0, y0 - 0.77, 0], [0, y0 - 0.86, 0], 0.005, 0.005, 3));
  P.add('cloth_red', lathe([[0.001, y0 - 0.86], [0.03, y0 - 0.88], [0.028, y0 - 0.93], [0.001, y0 - 0.93]], 6));
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; P.add('cloth_red', limb([Math.cos(a) * 0.02, y0 - 0.93, Math.sin(a) * 0.02], [Math.cos(a) * 0.028, y0 - 0.98, Math.sin(a) * 0.028], 0.004, 0.003, 3)); }
}
/** A floor candle stand: cross foot with braces, a turned pole, a bronze tray with a red candle burning. */
export function candleStand(P, h = 1.15) {
  P.add('lacquer_black', box(-0.2, 0, -0.035, 0.2, 0.05, 0.035)); P.add('lacquer_black', box(-0.035, 0, -0.2, 0.035, 0.05, 0.2));
  for (const [x, z] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) P.add('lacquer_black', limb([x * 0.18, 0.05, z * 0.18], [x * 0.03, 0.3, z * 0.03], 0.012, 0.01, 4));
  P.add('lacquer_black', lathe([[0.001, 0.05], [0.032, 0.05], [0.026, 0.1], [0.02, 0.2], [0.03, 0.26], [0.02, 0.32], [0.018, h - 0.05], [0.03, h - 0.05], [0.001, h - 0.05]], 8));
  P.add('bronze', lathe([[0.001, h - 0.05], [0.1, h - 0.05], [0.105, h - 0.03], [0.09, h - 0.02], [0.001, h - 0.02]], 12));
  P.add('lacquer_red', lathe([[0.001, h - 0.02], [0.03, h - 0.02], [0.03, h + 0.2], [0.001, h + 0.2]], 8));
  P.add('flame', lathe([[0.001, h + 0.2], [0.017, h + 0.215], [0.001, h + 0.275]], 6));
}
/** A lamp stand (dengtai): a tall pole on a cross foot, at its head a bronze oil lamp with its wick alight inside a silk-paper shade. */
export function lampStand(P, h = 1.35) {
  P.add(W, box(-0.22, 0, -0.04, 0.22, 0.06, 0.04)); P.add(W, box(-0.04, 0, -0.22, 0.04, 0.06, 0.22));
  for (const [x, z] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) P.add(W, limb([x * 0.2, 0.06, z * 0.2], [x * 0.03, 0.34, z * 0.03], 0.014, 0.011, 4));
  P.add(W, lathe([[0.001, 0.06], [0.036, 0.06], [0.026, 0.12], [0.022, 0.4], [0.03, 0.46], [0.021, 0.52], [0.02, h - 0.04], [0.04, h - 0.03], [0.001, h]], 8));
  P.add('bronze', lathe([[0.001, h], [0.07, h], [0.075, h + 0.012], [0.06, h + 0.03], [0.001, h + 0.03]], 12));
  P.add('bronze', limb([0.07, h + 0.02, 0], [0.095, h + 0.035, 0], 0.012, 0.007, 5));
  P.add('flame', lathe([[0.001, h + 0.03], [0.013, h + 0.045], [0.001, h + 0.1]], 6));
  P.add('lamp_white', lathe([[0.08, h + 0.01], [0.1, h + 0.1], [0.1, h + 0.24], [0.08, h + 0.3]], 6));
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; P.add('lacquer_black', limb([Math.cos(a) * 0.082, h + 0.012, Math.sin(a) * 0.082], [Math.cos(a) * 0.1, h + 0.1, Math.sin(a) * 0.1], 0.004, 0.004, 3)); P.add('lacquer_black', limb([Math.cos(a) * 0.1, h + 0.1, Math.sin(a) * 0.1], [Math.cos(a) * 0.1, h + 0.24, Math.sin(a) * 0.1], 0.004, 0.004, 3)); P.add('lacquer_black', limb([Math.cos(a) * 0.1, h + 0.24, Math.sin(a) * 0.1], [Math.cos(a) * 0.08, h + 0.3, Math.sin(a) * 0.08], 0.004, 0.004, 3)); }
  P.add('lacquer_black', lathe([[0.001, h + 0.3], [0.085, h + 0.3], [0.07, h + 0.322], [0.001, h + 0.33]], 6));
}

// ── the scholar's and the hall's small things ──
/** A seven-string zither (qin), 1.2 m long on its side, strings to +y, head toward −x. */
export function qin(P) {
  const N = 12, L = 1.2;
  for (let k = 0; k < N; k++) {
    const t = (k + 0.5) / N, hw = 0.1 - 0.035 * t, top = 0.03 + 0.012 + 0.013 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    P.add('lacquer_black', box(-L / 2 + k * L / N, 0.026, -hw, -L / 2 + (k + 1) * L / N, top, hw));
  }
  P.add('lacquer_black', box(-L / 2 - 0.02, 0.03, -0.1, -L / 2, 0.06, 0.1));
  P.add('bark_dark', box(-L / 2 + 0.01, 0.055, -0.07, -L / 2 + 0.035, 0.066, 0.07));
  P.add('bark_dark', box(L / 2 - 0.12, 0.05, -0.05, L / 2 - 0.1, 0.056, 0.05));
  for (let k = 0; k < 7; k++) { const z = -0.052 + k * 0.0173; P.add('cloth_white', box(-L / 2 + 0.03, 0.062, z - 0.0012, L / 2 - 0.105, 0.0645, z + 0.0012)); }
  for (const f of [1 / 8, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 2 / 5, 1 / 2, 3 / 5, 2 / 3, 3 / 4, 4 / 5, 5 / 6, 7 / 8]) P.add('inlay_jade', box(-L / 2 + 0.035 + f * 0.9 - 0.006, 0.06, -0.083, -L / 2 + 0.035 + f * 0.9 + 0.006, 0.0615, -0.071));
  for (const x of [-0.42, 0.44]) P.add('lacquer_black', box(x - 0.03, 0, -0.04, x + 0.03, 0.026, 0.04));
}
/** A hand-warmer (shou lu): a lidded bronze pot with a pierced lid and an arched handle. */
export function handWarmer(P) {
  P.add('bronze', lathe([[0.001, 0], [0.058, 0], [0.074, 0.02], [0.082, 0.06], [0.07, 0.088], [0.001, 0.088]], 12));
  P.add('gilt_bronze', lathe([[0.072, 0.088], [0.06, 0.105], [0.03, 0.118], [0.001, 0.122]], 12));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P.add('lacquer_black', T(ball(0.008, 0.006, 0.008, 5, 3), Math.cos(a) * 0.05, 0.105, Math.sin(a) * 0.05)); }
  const pts = [[-0.078, 0.07], [-0.07, 0.13], [0, 0.175], [0.07, 0.13], [0.078, 0.07]];
  for (let k = 0; k < 4; k++) P.add('bronze', limb([pts[k][0], pts[k][1], 0], [pts[k + 1][0], pts[k + 1][1], 0], 0.004, 0.004, 4));
}
/** A plum vase (meiping) with a flowering branch. */
export function plumVase(P, seed = 5) {
  const r = rng(seed);
  P.add('glaze_white', lathe([[0.001, 0], [0.055, 0], [0.065, 0.04], [0.085, 0.13], [0.078, 0.22], [0.05, 0.28], [0.034, 0.31], [0.034, 0.325], [0.048, 0.34], [0.034, 0.34], [0.001, 0.3]], 14));
  P.add('glaze_blue', lathe([[0.083, 0.1], [0.087, 0.12], [0.087, 0.155], [0.083, 0.17]], 14));
  for (let b = 0; b < 3; b++) {
    const a = 0.35 + b * 0.9, l = 0.34 + r() * 0.2, tip = [Math.sin(a) * l * 0.55, 0.3 + l, Math.cos(a * 1.7) * l * 0.25];
    const mid = [tip[0] * 0.45, 0.3 + l * 0.5, tip[2] * 0.4];
    P.add('bark_dark', limb([0, 0.3, 0], mid, 0.006, 0.0045, 4)); P.add('bark_dark', limb(mid, tip, 0.0045, 0.002, 4));
    for (let k = 0; k < 5; k++) { const t = 0.35 + k * 0.16, p = [mid[0] + (tip[0] - mid[0]) * t + (r() - 0.5) * 0.04, mid[1] + (tip[1] - mid[1]) * t, mid[2] + (tip[2] - mid[2]) * t + (r() - 0.5) * 0.04]; P.add(r() < 0.7 ? 'paint_white' : 'cloth_red', T(ball(0.016, 0.014, 0.016, 5, 3), p[0], p[1], p[2])); }
  }
}
/** A painting jar (huagang) holding rolled scrolls. */
export function scrollPot(P) {
  P.add('glaze_white', lathe([[0.001, 0], [0.15, 0], [0.2, 0.12], [0.22, 0.3], [0.2, 0.5], [0.215, 0.54], [0.195, 0.54], [0.185, 0.5], [0.001, 0.47]], 16));
  P.add('glaze_blue', lathe([[0.222, 0.25], [0.226, 0.27], [0.226, 0.33], [0.222, 0.35]], 16));
  for (const [x, z, h, tx, tz] of [[0, 0, 0.5, 0.02, 0], [0.07, 0.04, 0.42, 0.06, 0.03], [-0.07, 0.05, 0.38, -0.05, 0.04], [0.03, -0.08, 0.34, 0.03, -0.05], [-0.06, -0.06, 0.3, -0.07, -0.05], [0.1, -0.03, 0.27, 0.12, -0.02]]) {
    P.add('paint_white', limb([x, 0.47, z], [x + tx, 0.47 + h, z + tz], 0.019, 0.019, 6)); P.add('lacquer_black', limb([x + tx, 0.47 + h, z + tz], [x + tx * 1.05, 0.47 + h + 0.02, z + tz * 1.05], 0.022, 0.022, 6));
  }
}
/** A rolled scroll lying along x: paper, rod knobs, a red tie. */
export function scrollRoll(P, len = 0.5, r = 0.018) {
  P.add('paint_white', limb([-len / 2, r, 0], [len / 2, r, 0], r, r, 8));
  for (const s of [-1, 1]) P.add('lacquer_black', limb([s * len / 2, r, 0], [s * (len / 2 + 0.025), r, 0], r * 1.2, r * 1.2, 8));
  P.add('cloth_red', limb([len * 0.2, r, 0], [len * 0.2 + 0.012, r, 0], r * 1.15, r * 1.15, 8));
}
/** Scrolls on a table top (z toward the sitter): three rolled, a sheet half unrolled under a jade paperweight. */
export function scrollsOnTable(P, seed = 4) {
  const r = rng(seed);
  scrollRoll(P, 0.55); const A = new Parts(); scrollRoll(A, 0.5); A.emit(P, 0.02, 0, 0.04, 0.1);
  const B = new Parts(); scrollRoll(B, 0.46); B.emit(P, 0.03, 0.03, 0.02, -0.06);
  P.add('paint_white', box(-0.28, 0.0, 0.1, 0.18, 0.003, 0.34));
  for (let k = 0; k < 7; k++) P.add('lacquer_black', box(-0.23 + (r() - 0.5) * 0.02, 0.003, 0.12 + k * 0.03, 0.14 - r() * 0.1, 0.0045, 0.128 + k * 0.03));
  P.add('inlay_jade', box(0.1, 0.003, 0.28, 0.2, 0.02, 0.31));
  P.add('paint_white', limb([-0.3, 0.018, 0.1], [-0.3, 0.018, 0.34], 0.018, 0.018, 8));
}
/** A bolster pillow along x. */
export function bolster(P, len = 0.5) {
  P.add('cloth_indigo', limb([-len / 2, 0.075, 0], [len / 2, 0.075, 0], 0.075, 0.075, 10));
  for (const s of [-1, 1]) { P.add('cloth_ochre', limb([s * len / 2, 0.075, 0], [s * (len / 2 + 0.008), 0.075, 0], 0.07, 0.07, 10)); P.add('cloth_red', limb([s * (len / 2 - 0.06), 0.075, 0], [s * (len / 2 - 0.055), 0.075, 0], 0.077, 0.077, 10)); }
}
/** A drum stool (xiudun) with a cushion. */
export function drumStool(P) {
  P.add(W, lathe([[0.001, 0], [0.15, 0], [0.19, 0.05], [0.2, 0.2], [0.17, 0.4], [0.19, 0.425], [0.001, 0.425]], 14));
  P.add('cloth_indigo', lathe([[0.001, 0.425], [0.18, 0.425], [0.19, 0.44], [0.17, 0.455], [0.001, 0.46]], 14));
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; P.add('gilt_bronze', T(ball(0.008, 0.008, 0.008, 4, 3), Math.cos(a) * 0.185, 0.3, Math.sin(a) * 0.185)); }
}
/** A flower stand: a turned pedestal with a round top. */
export function flowerStand(P, h = 0.82) {
  P.add(W, lathe([[0.001, 0], [0.15, 0], [0.15, 0.03], [0.05, 0.09], [0.035, h * 0.2], [0.05, h * 0.3], [0.035, h * 0.4], [0.035, h - 0.08], [0.06, h - 0.05], [0.2, h - 0.03], [0.2, h], [0.001, h]], 14));
}
/** A tea set on a tray: pot and two cups. */
export function teaSet(P) {
  P.add('lacquer_black', box(-0.17, 0, -0.1, 0.17, 0.018, 0.1));
  P.add('glaze_white', lathe([[0.001, 0.018], [0.04, 0.018], [0.055, 0.05], [0.045, 0.09], [0.03, 0.095], [0.001, 0.095]], 10));
  P.add('glaze_white', lathe([[0.001, 0.095], [0.028, 0.095], [0.02, 0.107], [0.001, 0.113]], 8));
  P.add('glaze_white', limb([0.05, 0.075, 0], [0.095, 0.06, 0], 0.01, 0.007, 4));
  for (const x of [-0.1, -0.06]) P.add('glaze_white', lathe([[0.001, 0.018], [0.014, 0.018], [0.025, 0.05], [0.027, 0.058], [0.001, 0.05]], 8, null, x, 0, 0.04));
}

// ── larger furniture and the hall's wood ──
/** A couch-bed (luohan chuang) 2.0 × 1.0, seat 0.46: waisted apron, hoof feet, a spindle railing on the back (+z) and the two ends; the mat on it. */
export function couch(P) {
  const w = 2.0, d = 1.0, h = 0.46;
  P.add(W, box(-w / 2, h - 0.1, -d / 2, w / 2, h - 0.04, d / 2));
  P.add('reed_mat', box(-w / 2 + 0.05, h - 0.04, -d / 2 + 0.05, w / 2 - 0.05, h - 0.012, d / 2 - 0.05));
  for (const sz of [-1, 1]) P.add(W, box(-w / 2 + 0.06, h - 0.2, sz * (d / 2 - 0.035) - 0.02, w / 2 - 0.06, h - 0.1, sz * (d / 2 - 0.035) + 0.02));
  for (const sx of [-1, 1]) P.add(W, box(sx * (w / 2 - 0.035) - 0.02, h - 0.2, -d / 2 + 0.06, sx * (w / 2 - 0.035) + 0.02, h - 0.1, d / 2 - 0.06));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (w / 2 - 0.04), z = sz * (d / 2 - 0.04);
    P.add(W, box(x - 0.03, 0.05, z - 0.03, x + 0.03, h - 0.1, z + 0.03));
    P.add(W, box(x - 0.04, 0, z - 0.04, x + 0.04, 0.05, z + 0.04));
    P.add(W, limb([x, 0.05, z], [x + sx * 0.03, 0.05, z + sz * 0.03], 0.03, 0.045, 5));
  }
  for (const s of [-1, 1]) P.add(W, box(-w / 2 + 0.07, 0.15, s * (d / 2 - 0.035) - 0.012, w / 2 - 0.07, 0.19, s * (d / 2 - 0.035) + 0.012));
  // the railing: back 0.4 high, ends 0.3, with spindles
  const rail = (x0, z0, x1, z1, hh) => {
    const L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L, n = Math.round(L / 0.075);
    const seg = (a, b, y0, y1, t) => P.add(W, box(Math.min(x0 + ux * a, x0 + ux * b) - (uz ? t : 0), h + y0, Math.min(z0 + uz * a, z0 + uz * b) - (ux ? t : 0), Math.max(x0 + ux * a, x0 + ux * b) + (uz ? t : 0), h + y1, Math.max(z0 + uz * a, z0 + uz * b) + (ux ? t : 0)));
    seg(0, L, 0, 0.03, 0.025); seg(0, L, hh - 0.04, hh, 0.03);
    for (let k = 1; k < n; k++) { const a = L * k / n; seg(a - 0.008, a + 0.008, 0.03, hh - 0.04, 0.008); }
  };
  rail(-w / 2 + 0.04, d / 2 - 0.04, w / 2 - 0.04, d / 2 - 0.04, 0.4);
  rail(-w / 2 + 0.04, -d / 2 + 0.04, -w / 2 + 0.04, d / 2 - 0.04, 0.3); rail(w / 2 - 0.04, -d / 2 + 0.04, w / 2 - 0.04, d / 2 - 0.04, 0.3);
  for (const [x, z, hh] of [[-w / 2 + 0.04, d / 2 - 0.04, 0.44], [w / 2 - 0.04, d / 2 - 0.04, 0.44], [-w / 2 + 0.04, -d / 2 + 0.04, 0.34], [w / 2 - 0.04, -d / 2 + 0.04, 0.34]]) { P.add(W, box(x - 0.025, h, z - 0.025, x + 0.025, h + hh, z + 0.025)); P.add(W, T(ball(0.03, 0.03, 0.03, 6, 4), x, h + hh + 0.02, z)); }
}
/** A long table with everted ends (qiaotou'an): top, scrolled ends, end boards between the legs with a ruyi spandrel; h high. */
export function longTable(P, w, d, h) {
  P.add(W, box(-w / 2, h - 0.05, -d / 2, w / 2, h, d / 2));
  for (const s of [-1, 1]) {
    P.add(W, lathe([[0.001, 0], [0.04, 0], [0.04, d], [0.001, d]], 8).rotateX(Math.PI / 2).translate(s * (w / 2 + 0.03), h + 0.045, -d / 2));
    P.add(W, box(s * w / 2 - (s > 0 ? 0.1 : 0), h, -d / 2, s * w / 2 + (s < 0 ? 0.1 : 0), h + 0.07, d / 2));
    const lx = s * (w / 2 - 0.2);
    P.add(W, box(lx - 0.014, 0.1, -d / 2 + 0.05, lx + 0.014, h - 0.05, d / 2 - 0.05));
    P.add(W, box(lx - 0.04, 0, -d / 2 + 0.04, lx + 0.04, 0.1, d / 2 - 0.04));
    for (const sz of [-1, 1]) P.add(W, lathe([[0.03, 0], [0.026, h - 0.05], [0.001, h - 0.05]], 8, null, lx, 0, sz * (d / 2 - 0.06)));
    P.add('lacquer_black', box(lx - 0.012, 0.16, -d / 2 + 0.08, lx + 0.012, h - 0.12, d / 2 - 0.08));
    for (const sz of [-1, 1]) P.add(W, limb([lx, h - 0.06, sz * (d / 2 - 0.06)], [lx, h - 0.22, sz * 0.08], 0.012, 0.012, 4));
  }
  P.add(W, box(-w / 2 + 0.2, h - 0.1, -d / 2 + 0.03, w / 2 - 0.2, h - 0.05, -d / 2 + 0.05));
  P.add(W, box(-w / 2 + 0.2, h - 0.1, d / 2 - 0.05, w / 2 - 0.2, h - 0.05, d / 2 - 0.03));
}
/** A hanging fretwork (guàluò / flying screen, feizhao): a deep frame with spindles and ring-knobs, hung from a beam, w wide, h deep, facing +z. */
export function fret(P, w, h, deep = 0.06) {
  P.add(W, box(-w / 2, -0.05, -deep / 2, w / 2, 0, deep / 2));
  P.add(W, box(-w / 2, -h, -deep / 2 + 0.01, w / 2, -h + 0.03, deep / 2 - 0.01));
  const n = Math.max(2, Math.round(w / 0.15));
  for (let k = 0; k <= n; k++) {
    const x = -w / 2 + w * k / n;
    P.add(W, box(x - 0.008, -h + 0.03, -0.012, x + 0.008, -0.05, 0.012));
    if (k < n && k % 2 === 0) P.add(W, T(ball(0.03, 0.03, 0.012, 6, 3), x + w / n / 2, -h * 0.5, 0));
  }
  for (const s of [-1, 1]) { P.add(W, limb([s * (w / 2 - 0.02), -0.05, 0], [s * (w / 2 - 0.2), -h * 0.7, 0], 0.016, 0.012, 4)); P.add(W, limb([s * (w / 2 - 0.2), -h * 0.7, 0], [s * (w / 2 - 0.34), -h * 0.9, 0], 0.012, 0.01, 4)); }
}
/** A screen of door panels (pingmen) w wide, h high, facing +z: skirt boards, panel fields, a fretwork transom. */
export function backScreen(P, w, h) {
  const n = Math.round(w / 0.8), pw = w / n, tr = 0.4;
  P.add(W, box(-w / 2, 0, 0, w / 2, 0.12, 0.06));
  P.add(W, box(-w / 2, h - tr - 0.05, 0, w / 2, h - tr, 0.07)); P.add(W, box(-w / 2, h - 0.05, 0, w / 2, h, 0.07));
  for (let k = 0; k < n; k++) {
    const x0 = -w / 2 + k * pw, x1 = x0 + pw;
    P.add(W, box(x0, 0.12, 0, x0 + 0.05, h - tr - 0.05, 0.06)); P.add(W, box(x1 - 0.05, 0.12, 0, x1, h - tr - 0.05, 0.06));
    P.add(W, box(x0, 0.12, 0, x1, 0.62, 0.05)); P.add('lacquer_black', box(x0 + 0.09, 0.2, 0.05, x1 - 0.09, 0.54, 0.056));
    P.add(W, box(x0, 1.7, 0, x1, 1.78, 0.05));
    P.add('timber', box(x0 + 0.05, 0.62, 0.012, x1 - 0.05, 1.7, 0.04)); P.add('lacquer_black', box(x0 + 0.1, 0.72, 0.04, x1 - 0.1, 0.76, 0.046)); P.add('lacquer_black', box(x0 + 0.1, 1.6, 0.04, x1 - 0.1, 1.64, 0.046));
    P.add('timber', box(x0 + 0.05, 1.78, 0.012, x1 - 0.05, h - tr - 0.05, 0.04));
    const m = Math.max(3, Math.round(pw / 0.08));
    for (let j = 1; j < m; j++) { const x = x0 + pw * j / m; P.add(W, box(x - 0.007, h - tr, 0.015, x + 0.007, h - 0.05, 0.045)); }
    P.add(W, box(x0 + 0.04, h - tr * 0.5 - 0.008, 0.015, x1 - 0.04, h - tr * 0.5 + 0.008, 0.045));
  }
}
/** A hanging scroll painting w × h (mount, painted field with ink hills and pines, rollers with jade ends), facing +z, origin at the bottom centre. */
export function hangingScroll(P, w, h, seed = 3) {
  const r = rng(seed), fw = w * 0.74, fh = h * 0.62, fy = h * 0.2;
  P.add('cloth_indigo', box(-w / 2, 0, 0, w / 2, h, 0.012));
  P.add('cloth_ochre', box(-fw / 2 - 0.025, fy - 0.025, 0.012, fw / 2 + 0.025, fy + fh + 0.025, 0.026));
  P.add('paint_white', box(-fw / 2, fy, 0.026, fw / 2, fy + fh, 0.04));
  for (let k = 0; k < 4; k++) { const cx = (r() - 0.5) * fw * 0.5, cy = fy + fh * (0.35 + r() * 0.3), rx = fw * (0.14 + r() * 0.1), ry = fh * (0.12 + r() * 0.1); P.add(k % 2 ? 'cloth_grey' : 'lacquer_black', T(ball(rx, ry, 0.0012, 10, 5), cx, cy, 0.0415)); }
  P.add('lacquer_black', T(ball(fw * 0.4, fh * 0.05, 0.0012, 10, 4), 0, fy + fh * 0.12, 0.0415));
  for (const dx of [-0.25, 0.1]) { const x = dx * fw; P.add('lacquer_black', limb([x, fy + fh * 0.12, 0.0425], [x + 0.01, fy + fh * 0.45, 0.0425], 0.004, 0.003, 4)); P.add('lacquer_black', T(ball(0.05, 0.02, 0.001, 6, 3), x + 0.01, fy + fh * 0.45, 0.0428)); }
  P.add('lacquer_black', limb([-w / 2 - 0.04, h, 0.006], [w / 2 + 0.04, h, 0.006], 0.014, 0.014, 6));
  P.add('lacquer_black', limb([-w / 2 - 0.04, 0, 0.006], [w / 2 + 0.04, 0, 0.006], 0.02, 0.02, 6));
  for (const s of [-1, 1]) { P.add('inlay_jade', T(ball(0.026, 0.026, 0.026, 6, 4), s * (w / 2 + 0.06), 0, 0.006)); P.add('inlay_jade', T(ball(0.02, 0.02, 0.02, 6, 4), s * (w / 2 + 0.055), h, 0.006)); }
  P.add('cloth_red', limb([0, h, 0.006], [0, h + 0.3, -0.01], 0.003, 0.003, 4));
}
/** The ancestors' shrine (kan): a lacquered cabinet on a plinth, an open niche of three tiers with the tablets, a carved lintel; 2.4 wide, 0.55 deep, facing +z. */
export function shrine(P) {
  const w = 2.4, d = 0.55;
  P.add('granite_grey', box(-w / 2 - 0.1, 0, -d / 2 - 0.08, w / 2 + 0.1, 0.12, d / 2 + 0.08));
  P.add(W, box(-w / 2, 0.12, -d / 2, w / 2, 0.82, d / 2));
  for (let k = 0; k < 3; k++) {
    const x0 = -w / 2 + 0.06 + k * (w - 0.12) / 3, x1 = x0 + (w - 0.12) / 3 - 0.02;
    P.add('lacquer_red', box(x0, 0.2, d / 2, x1, 0.74, d / 2 + 0.02)); P.add('lacquer_black', box(x0 + 0.06, 0.28, d / 2 + 0.02, x1 - 0.06, 0.66, d / 2 + 0.028));
    P.add('gilt_bronze', T(ball(0.022, 0.022, 0.006, 8, 4), (x0 + x1) / 2, 0.47, d / 2 + 0.034));
  }
  P.add(W, box(-w / 2 - 0.04, 0.82, -d / 2 - 0.04, w / 2 + 0.04, 0.87, d / 2 + 0.04));
  const top = 2.3;
  P.add('lacquer_red', box(-w / 2 + 0.03, 0.87, -d / 2 + 0.03, w / 2 - 0.03, top, -d / 2 + 0.06));
  for (const s of [-1, 1]) { P.add(W, box(s * (w / 2 - 0.07) - 0.035, 0.87, d / 2 - 0.09, s * (w / 2 - 0.07) + 0.035, top, d / 2 - 0.02)); P.add('lacquer_red', box(s * (w / 2 - 0.09) - 0.012, 0.87, -d / 2 + 0.03, s * (w / 2 - 0.09) + 0.012, top, d / 2 - 0.09)); }
  P.add(W, box(-w / 2 + 0.03, top - 0.12, d / 2 - 0.09, w / 2 - 0.03, top, d / 2 - 0.02));
  for (const yy of [1.2, 1.55]) P.add(W, box(-w / 2 + 0.1, yy, -d / 2 + 0.06, w / 2 - 0.1, yy + 0.025, d / 2 - 0.1));
  const tiers = [[0.87, 7], [1.225, 5], [1.575, 3]];
  tiers.forEach(([y0, n], ti) => {
    for (let k = 0; k < n; k++) {
      const x = (k - (n - 1) / 2) * (w - 0.5) / Math.max(1, 6), hh = 0.3 - ti * 0.02;
      P.add('timber', box(x - 0.055, y0, -0.1, x + 0.055, y0 + 0.04, 0.03));
      P.add('lacquer_black', box(x - 0.04, y0 + 0.04, -0.07, x + 0.04, y0 + 0.04 + hh, -0.05));
      P.add('gilt_bronze', box(x - 0.008, y0 + 0.08, -0.049, x + 0.008, y0 + 0.04 + hh - 0.08, -0.047));
      P.add('lacquer_red', box(x - 0.048, y0 + 0.04 + hh, -0.075, x + 0.048, y0 + 0.052 + hh, -0.045));
    }
  });
  P.add(W, box(-w / 2 - 0.12, top, -d / 2 - 0.1, w / 2 + 0.12, top + 0.06, d / 2 + 0.1));
  P.add('tile_dark', prismX([[-d / 2 - 0.2, top + 0.06], [d / 2 + 0.2, top + 0.06], [d / 2 + 0.05, top + 0.2], [-d / 2 - 0.05, top + 0.2]], -w / 2 - 0.2, w / 2 + 0.2));
  const F = new Parts(); fret(F, w - 0.2, 0.3); F.emit(P, 0, top - 0.12, d / 2 - 0.05);
}
/** The characters-and-board of an inscribed board or couplet (plaque): builds its geometry facing +z, origin at the bottom centre. */
export function plaqueBuild(P, el) {
  const w = el.w ?? 2.4, h = el.h ?? 0.75, n = el.n ?? 3, vertical = !!el.vertical, r = rng(el.seed ?? 5);
  P.add('lacquer_black', box(-w / 2, 0, -0.03, w / 2, h, 0.03));
  P.add(el.field ?? 'timber', box(-w / 2 + 0.06, 0.06, 0.03, w / 2 - 0.06, h - 0.06, 0.04));
  const ink = el.ink ?? 'inlay_jade', cell = vertical ? (h - 0.2) / n : (w - 0.3) / n, cs = Math.min(cell, vertical ? w - 0.12 : h - 0.2) * 0.72;
  for (let k = 0; k < n; k++) {
    const ccx = vertical ? 0 : -w / 2 + 0.15 + cell * (k + 0.5), ccy = vertical ? h - 0.1 - cell * (k + 0.5) : h / 2, t = cs * 0.09;
    const stroke = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), g = box(-L / 2, -t / 2, 0, L / 2, t / 2, 0.012); g.rotateZ(Math.atan2(y1 - y0, x1 - x0)); P.add(ink, g.translate(ccx + (x0 + x1) / 2, ccy + (y0 + y1) / 2, 0.04)); };
    const half = cs / 2, kind = r();
    const parts = kind < 0.4 ? [[-half, -half, -half * 0.15, half], [half * 0.05, -half, half, half]] : kind < 0.75 ? [[-half, half * 0.05, half, half], [-half, -half, half, -half * 0.05]] : [[-half, -half, half, half]];
    for (const [a0, b0, a1, b1] of parts) {
      const nh = 2 + Math.floor(r() * 3), w2 = a1 - a0, h2 = b1 - b0;
      for (let j = 0; j < nh; j++) { const yy = b0 + h2 * (j + 0.5) / nh, sh = 0.1 + r() * 0.15; stroke(a0 + w2 * sh, yy, a1 - w2 * (0.1 + r() * 0.15), yy + (r() - 0.5) * t * 0.6); }
      const nv = 1 + Math.floor(r() * 2);
      for (let j = 0; j < nv; j++) { const xx = a0 + w2 * (nv === 1 ? 0.5 : 0.25 + j * 0.5); stroke(xx, b1 - h2 * 0.05, xx, b0 + h2 * (r() < 0.5 ? 0.05 : 0.3)); }
      if (r() < 0.6) stroke(a0 + w2 * 0.5, b0 + h2 * 0.45, a0 + w2 * 0.1, b0 + h2 * 0.05);
      if (r() < 0.5) stroke(a0 + w2 * 0.5, b0 + h2 * 0.45, a1 - w2 * 0.05, b0 + h2 * 0.08);
    }
  }
}
