// The Khazneh (docs/settlements/petra.md §1, §10): the façade, 24.9 m wide and 38.77 m high, cut in
// the rock in two storeys. Below, on three steps, six columns with floral capitals — the four in
// the middle before a deep portico, the outer two against the side bays where the Dioscuri stand
// with their horses — the entablature with its frieze of griffins and vases, the pediment over the
// middle with its acroteria; between the storeys two lions on the cornice. Above, the tholos with
// Isis-Tyche before its drum, its conical roof and the urn; on either side a pavilion of two columns
// with an Amazon raising her axe, Victories in the recesses, the broken half-pediments and the
// eagles on them. In the portico the great door under its pediment, and the side chambers' doors
// with round windows over them.

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { raise, strip } from '../achaemenid/reliefs.js';

const R = 'sandstone_rose';
/** A frame for a façade facing `dir` from its foot centre [x, z]: u along the face, v out of it. */
export function frame(x, z, dir) {
  const [nx, nz] = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] }[dir], ux = -nz, uz = nx;
  const P = (u, v) => [x + ux * u + nx * v, z + uz * u + nz * v];
  const B = (u0, v0, u1, v1, y0, y1) => { const a = P(u0, v0), b = P(u1, v1); return box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1])); };
  const Rc = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { P, B, Rc, n: [nx, nz], u: [ux, uz] };
}

// ---- outlines (facing +u, feet at 0, height 1)
const O = {
  youth: [[-0.09, 0], [0.08, 0], [0.06, 0.03], [0.05, 0.25], [0.06, 0.48], [0.09, 0.55], [0.07, 0.62], [0.075, 0.72], [0.06, 0.8], [0.12, 0.85], [0.2, 0.82],
    [0.21, 0.86], [0.12, 0.9], [0.06, 0.88], [0.07, 0.92], [0.08, 0.96], [0.05, 1.0], [-0.04, 0.99], [-0.06, 0.93], [-0.05, 0.88], [-0.09, 0.82],
    [-0.13, 0.7], [-0.14, 0.45], [-0.1, 0.42], [-0.07, 0.5], [-0.05, 0.25], [-0.07, 0.03]],
  horse: [[-0.5, 0], [-0.44, 0], [-0.4, 0.3], [-0.35, 0.45], [0.2, 0.45], [0.24, 0.3], [0.22, 0], [0.28, 0], [0.3, 0.32], [0.33, 0.55], [0.38, 0.7],
    [0.46, 0.8], [0.55, 0.8], [0.6, 0.84], [0.58, 0.9], [0.48, 0.97], [0.45, 1.0], [0.42, 0.95], [0.36, 0.9], [0.25, 0.72], [-0.3, 0.68], [-0.45, 0.62],
    [-0.55, 0.5], [-0.58, 0.3], [-0.54, 0.3], [-0.5, 0.5], [-0.46, 0.45], [-0.47, 0.3], [-0.52, 0.02]],
  amazon: [[-0.1, 0], [0.08, 0], [0.06, 0.03], [0.05, 0.3], [0.08, 0.38], [0.06, 0.55], [0.07, 0.7], [0.06, 0.8], [0.07, 0.86], [0.08, 0.93], [0.03, 1.0],
    [0.05, 1.15], [0.12, 1.13], [0.13, 1.25], [0.05, 1.22], [0.0, 1.26], [-0.07, 1.25], [-0.06, 1.13], [0.0, 1.15], [-0.01, 1.0], [-0.05, 0.95],
    [-0.05, 0.86], [-0.08, 0.8], [-0.07, 0.55], [-0.1, 0.38], [-0.06, 0.3], [-0.07, 0.03]],
  victory: [[-0.1, 0], [0.1, 0], [0.07, 0.05], [0.07, 0.5], [0.08, 0.7], [0.12, 0.75], [0.13, 0.8], [0.07, 0.8], [0.07, 0.86], [0.08, 0.93], [0.05, 0.98],
    [-0.03, 0.98], [-0.06, 0.92], [-0.05, 0.85], [-0.08, 0.82], [-0.2, 0.98], [-0.3, 1.02], [-0.26, 0.85], [-0.2, 0.65], [-0.12, 0.6], [-0.09, 0.5], [-0.12, 0.05]],
  goddess: [[-0.11, 0], [0.11, 0], [0.09, 0.05], [0.08, 0.5], [0.1, 0.6], [0.16, 0.62], [0.2, 0.75], [0.22, 0.9], [0.16, 0.92], [0.12, 0.78], [0.08, 0.82],
    [0.08, 0.9], [0.06, 0.97], [0.0, 1.0], [-0.06, 0.97], [-0.08, 0.9], [-0.08, 0.82], [-0.1, 0.6], [-0.12, 0.3], [-0.13, 0.05]],
  griffin: [[-0.45, 0], [-0.38, 0], [-0.36, 0.3], [0.15, 0.3], [0.18, 0], [0.25, 0], [0.25, 0.35], [0.3, 0.5], [0.36, 0.62], [0.45, 0.66], [0.38, 0.7],
    [0.37, 0.78], [0.3, 0.76], [0.25, 0.7], [0.18, 0.6], [0.1, 0.9], [-0.05, 1.0], [-0.12, 0.95], [-0.05, 0.8], [-0.15, 0.62], [-0.38, 0.55], [-0.48, 0.5],
    [-0.55, 0.62], [-0.6, 0.6], [-0.5, 0.42], [-0.45, 0.3]],
  vase: [[-0.12, 0], [0.12, 0], [0.05, 0.1], [0.06, 0.2], [0.2, 0.32], [0.24, 0.6], [0.32, 0.62], [0.33, 0.76], [0.27, 0.8], [0.22, 0.78], [-0.22, 0.78],
    [-0.27, 0.8], [-0.33, 0.76], [-0.32, 0.62], [-0.24, 0.6], [-0.2, 0.32], [-0.06, 0.2], [-0.05, 0.1]],
  eagle: [[-0.15, 0], [0.15, 0], [0.2, 0.2], [0.45, 0.5], [0.4, 0.75], [0.18, 0.65], [0.12, 0.85], [0.08, 0.95], [0, 1], [-0.08, 0.95], [-0.12, 0.85],
    [-0.18, 0.65], [-0.4, 0.75], [-0.45, 0.5], [-0.2, 0.2]],
  lion: [[-0.6, 0], [-0.5, 0], [-0.48, 0.3], [0.25, 0.3], [0.28, 0], [0.38, 0], [0.38, 0.35], [0.45, 0.5], [0.5, 0.62], [0.55, 0.7], [0.52, 0.8], [0.45, 0.86],
    [0.35, 0.85], [0.25, 0.72], [-0.45, 0.62], [-0.6, 0.55], [-0.7, 0.66], [-0.74, 0.64], [-0.62, 0.45], [-0.58, 0.3]],
};
const D = {
  youth: [[-0.13, 0.7, 0.04, 0.8], [0.0, 0.03, 0.0, 0.45]],
  horse: [[0.25, 0.72, 0.36, 0.9], [-0.3, 0.45, -0.28, 0.66], [0.46, 0.8, 0.5, 0.9]],
  amazon: [[-0.08, 0.38, 0.08, 0.38], [-0.06, 0.62, 0.06, 0.62]],
  victory: [[-0.12, 0.6, -0.28, 0.95], [-0.02, 0.05, 0.0, 0.5]],
  goddess: [[0.0, 0.05, 0.0, 0.55], [-0.08, 0.62, 0.08, 0.62]],
  griffin: [[0.1, 0.62, -0.1, 0.9], [0.0, 0.62, -0.12, 0.7]],
  vase: [[-0.2, 0.45, 0.2, 0.45]],
  eagle: [[0.18, 0.6, 0.38, 0.7], [-0.18, 0.6, -0.38, 0.7], [0, 0.2, 0, 0.6]],
  lion: [[0.35, 0.85, 0.3, 0.55]],
};
const fig = (bag, kind, place, u0, v0, size, dir, d) => raise(bag, R, O[kind], 'nab-' + kind, place, u0, v0, size, dir, d, D[kind]);

// an ellipsoid in a right-handed frame (forward f, lateral l)
function ell(c, f, rf, ry, rl, seg = 10) {
  const g = lathe([[0.001, -1], [0.5, -0.87], [0.87, -0.5], [1, 0], [0.87, 0.5], [0.5, 0.87], [0.001, 1]], seg), l = [-f[1], f[0]];
  g.scale(rf, ry, rl);
  g.applyMatrix4(new Matrix4().fromArray([f[0], 0, f[1], 0, 0, 1, 0, 0, l[0], 0, l[1], 0, c[0], c[1], c[2], 1]));
  return g;
}
/**
 * A floral capital in the Nabataean manner of the Corinthian (docs §10): the bell, two rows of
 * eight leaves, the volutes curling out under the corners of the abacus.
 */
export function floralCapital(bag, mat, x, y, z, r, h) {
  bag.add(mat, lathe([[r * 0.96, 0], [r * 1.02, 0.3 * h], [r * 1.2, 0.78 * h], [r * 1.28, 0.82 * h], [r * 0.6, 0.82 * h]], 16, null, x, y, z));
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, f = [Math.cos(a), Math.sin(a)];
    bag.add(mat, ell([x + f[0] * r * 0.98, y + 0.24 * h, z + f[1] * r * 0.98], f, r * 0.2, 0.24 * h, r * 0.32, 8));
    const b = a + Math.PI / 8, g = [Math.cos(b), Math.sin(b)];
    bag.add(mat, ell([x + g[0] * r * 1.08, y + 0.52 * h, z + g[1] * r * 1.08], g, r * 0.2, 0.24 * h, r * 0.3, 8));
  }
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2, f = [Math.cos(a), Math.sin(a)];
    bag.add(mat, ell([x + f[0] * r * 1.32, y + 0.76 * h, z + f[1] * r * 1.32], f, r * 0.2, r * 0.22, r * 0.2, 8));
  }
  bag.add(mat, box(x - r * 1.42, y + 0.82 * h, z - r * 1.42, x + r * 1.42, y + h, z + r * 1.42));
}
/** A column of the façade: Attic base, smooth shaft, floral capital. */
function column(bag, x, z, y, h, r, C, coll = true) {
  bag.add(R, lathe([[r * 1.42, 0], [r * 1.42, 0.12], [r * 1.3, 0.2], [r * 1.18, 0.28], [r * 1.26, 0.38], [r * 1.12, 0.48], [r * 1.0, 0.55]], 16, null, x, y, z));
  const capH = Math.min(1.45, h * 0.12);
  bag.add(R, lathe([[r, 0], [r * 0.9, h - 0.55 - capH]], 16, null, x, y + 0.55, z));
  floralCapital(bag, R, x, y + h - capH, z, r * 0.9, capH);
  if (coll) C.circle(x, z, r, y, y + h);
}
/** A prism of the convex outline [[u, y], …] in the façade plane, from v0 to v1. */
function prismUY(bag, P, pts, v0, v1, mat = R) {
  const t = [], V = ([u, y], v) => { const [x, z] = P(u, v); return [x, y, z]; }, n = pts.length;
  for (let k = 0; k < n; k++) { const p = pts[k], q = pts[(k + 1) % n]; t.push(...V(p, v0), ...V(q, v0), ...V(q, v1), ...V(p, v0), ...V(q, v1), ...V(p, v1)); }
  for (let k = 1; k < n - 1; k++) { t.push(...V(pts[0], v0), ...V(pts[k], v0), ...V(pts[k + 1], v0)); t.push(...V(pts[0], v1), ...V(pts[k + 1], v1), ...V(pts[k], v1)); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
/** A raking cornice: a bar from (ua, ya) to (ub, yb), th thick across its slope, from v0 to v1. */
function rake(bag, P, ua, ya, ub, yb, th, v0, v1) {
  const L = Math.hypot(ub - ua, yb - ya), nu = -(yb - ya) / L * th, ny = (ub - ua) / L * th;
  const up = ny < 0 ? -1 : 1;
  prismUY(bag, P, [[ua, ya], [ub, yb], [ub + nu * up, yb + ny * up], [ua + nu * up, ya + ny * up]], v0, v1);
}

/** A flat disc of radius r at c facing n (unit), t a unit vector in its plane: a round window's dark opening. */
function roundel(c, n, t, r, seg = 16) {
  const b = [n[1] * t[2] - n[2] * t[1], n[2] * t[0] - n[0] * t[2], n[0] * t[1] - n[1] * t[0]], T = [];
  const at = (a) => [c[0] + (t[0] * Math.cos(a) + b[0] * Math.sin(a)) * r, c[1] + (t[1] * Math.cos(a) + b[1] * Math.sin(a)) * r, c[2] + (t[2] * Math.cos(a) + b[2] * Math.sin(a)) * r];
  for (let k = 0; k < seg; k++) T.push(...c, ...at(k / seg * Math.PI * 2), ...at((k + 1) / seg * Math.PI * 2));
  return fromTriangles(T);
}
/** khazneh: the Treasury { at, dir, w, h, back (depth of rock behind), top }. */
export function khazneh(el, { bag, col: C }) {
  const [x, z] = el.at, { P, B, Rc } = frame(x, z, el.dir), W = el.w ?? 24.9, H = el.h ?? 38.77, back = el.back ?? 26, top = el.top ?? H + 20;
  const hw = W / 2, pu = 6.6, pv = -3.5;                                                   // the portico's half-width and back wall
  const rock0 = (u0, v0, u1, v1, y0, y1) => { bag.add(R, B(u0, v0, u1, v1, y0, y1)); C.rect(Rc(u0, v0, u1, v1), y0, y1); };
  // above `cliff` (when the cliff over the façade is built round it) the dressed rock stands 3 m back, behind the built face
  const rock = (u0, v0, u1, v1, y0, y1) => {
    if (!el.cliff || y1 <= el.cliff) return rock0(u0, v0, u1, v1, y0, y1);
    if (y0 < el.cliff) rock0(u0, v0, u1, v1, y0, el.cliff);
    if (v0 < -3) rock0(u0, v0, u1, Math.min(v1, -3), Math.max(y0, el.cliff), y1);
  };
  // the rock the façade is cut from, the portico hollowed in it
  const fl = el.flank ?? 25;                                                  // the rock either side (the cliff itself may be built round it)
  rock(-hw - fl, -back, -hw, 0, -2, top); rock(hw, -back, hw + fl, 0, -2, top);
  rock(-hw, -back, hw, pv, -2, top);
  rock(-hw, pv, -pu, 0, -2, top); rock(pu, pv, hw, 0, -2, top);
  rock(-pu, pv, pu, 0, 13.5, top);
  bag.add(R, B(-pu, pv, pu, 0, -2, 1.05)); C.floor(Rc(-pu, pv, pu, 0), 1.05);
  // the three steps
  for (let k = 0; k < 3; k++) { const yy = 0.35 * (k + 1), vv = 3.6 - 0.4 * k; bag.add(R, B(-hw - 0.5, 0, hw + 0.5, vv, -0.5, yy)); C.floor(Rc(-hw - 0.5, vv - 0.4, hw + 0.5, vv), yy); }
  C.floor(Rc(-hw - 0.5, 0, hw + 0.5, 2.8), 1.05);
  // ---- the lower storey
  const yb = 1.05, cv = 2.0, cr = 0.53, ch = 12.45;
  for (const u of [-11.4, -7.3, -2.9, 2.9, 7.3, 11.4]) { const [cx, cz] = P(u, cv); column(bag, cx, cz, yb, ch, cr, C); }
  // the side bays, their walls behind the outer columns; the Dioscuri with their horses
  for (const s of [-1, 1]) {
    bag.add(R, B(s < 0 ? -hw : pu, 0, s < 0 ? -pu : hw, 1.75, yb, 13.5)); C.rect(Rc(s < 0 ? -hw : pu, 0, s < 0 ? -pu : hw, 1.75), yb, 13.5);
    const face = (u, v, w) => { const [px, pz] = P(u, 1.75 + w); return [px, yb + 0.6 + v, pz]; };
    fig(bag, 'horse', face, s * 9.35, 0.4, 2.6, -s, 0.28);
    fig(bag, 'youth', face, s * 9.0, 0, 3.0, -s, 0.45);
    bag.add(R, B(s * 9.35 - 0.9, 1.75, s * 9.35 + 0.9, 2.1, yb, yb + 0.6));            // the figures' plinth
  }
  // the entablature: architrave in three fasciae, the frieze, the cornice on its dentils
  for (const [y0, y1, dv] of [[13.5, 13.78, 2.86], [13.78, 14.08, 2.92], [14.08, 14.4, 2.98]]) bag.add(R, B(-hw - 0.15, -0.3, hw + 0.15, dv, y0, y1));
  bag.add(R, B(-hw - 0.15, -0.3, hw + 0.15, 2.88, 14.4, 15.4));
  for (let u = -hw + 0.2; u < hw - 0.1; u += 0.38) bag.add(R, B(u, 2.88, u + 0.2, 3.1, 15.22, 15.4));
  bag.add(R, B(-hw - 0.45, -0.3, hw + 0.45, 3.3, 15.4, 16.2));
  const frieze = (u, v, w) => { const [px, pz] = P(u, 2.88 + w); return [px, 14.45 + v, pz]; };
  for (let u = -hw + 1.0, i = 0; u < hw - 0.6; u += 1.55, i++) {
    if (i % 2 === 0) fig(bag, 'vase', frieze, u, 0.05, 0.85, 1, 0.07);
    else fig(bag, 'griffin', frieze, u - 0.35, 0.03, 0.85, 1, 0.07);
  }
  // the pediment over the middle: tympanum, raking cornices, its vine scroll, acroteria
  const pw = 7.9, pr = 3.0, py = 16.2;
  prismUY(bag, P, [[-pw, py], [pw, py], [0, py + pr]], 0, 2.9);
  rake(bag, P, -pw - 0.35, py, 0, py + pr + 0.05, 0.42, 0, 3.4); rake(bag, P, 0, py + pr + 0.05, pw + 0.35, py, 0.42, 0, 3.4);
  const tym = (u, v, w) => { const [px, pz] = P(u, 2.9 + w); return [px, py + v, pz]; };
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
    const u0 = s * (0.8 + k * 1.05), u1 = s * (1.3 + k * 1.05), v0 = 0.45 + 0.4 * Math.sin(k * 1.7), v1 = 0.45 + 0.4 * Math.sin(k * 1.7 + 1.4);
    if (Math.abs(u1) > pw * (1 - Math.max(v0, v1) / pr) - 0.2) continue;
    strip(bag, R, tym, u0, v0, u1, v1, 0.09, 0.07);
  }
  fig(bag, 'vase', tym, 0, 0.35, 1.2, 1, 0.08);
  { const [ax, az] = P(0, 1.8); bag.add(R, lathe([[0.55, 0], [0.4, 0.25], [0.65, 0.8], [0.3, 1.2], [0.001, 1.25]], 10, null, ax, py + pr + 0.3, az)); }
  for (const s of [-1, 1]) { const [ax, az] = P(s * (pw + 0.1), 1.8); bag.add(R, lathe([[0.4, 0], [0.4, 0.7], [0.001, 1.0]], 8, null, ax, py, az)); }
  // ---- between the storeys: the attic behind the pediment, the lions on the cornice over the side bays
  const ya = 19.6;
  bag.add(R, B(-hw, 0, hw, 2.2, 16.2, ya)); C.rect(Rc(-hw, 0, hw, 2.2), 16.2, ya); C.floor(Rc(-hw, 0, hw, 2.2), ya);
  for (const s of [-1, 1]) {
    const face = (u, v, w) => { const [px, pz] = P(u, 2.2 + w); return [px, 16.2 + v, pz]; };
    fig(bag, 'lion', face, s * 10.2, 0, 1.6, s, 0.7);
  }
  // ---- the upper storey: the two pavilions
  const uc = 8.6, ur = 0.42, yt = 28.2;
  for (const s of [-1, 1]) {
    const uo = s * hw, ui = s * (hw - 6.2);
    for (const u of [s * (hw - 0.9), s * (hw - 5.3)]) { const [cx, cz] = P(u, 1.5); column(bag, cx, cz, ya, uc, ur, C); }
    const back = (u, v, w) => { const [px, pz] = P(u, w); return [px, ya + 0.3 + v, pz]; };
    fig(bag, 'amazon', back, s * (hw - 3.1), 0, 4.6, -s, 0.35);
    fig(bag, 'victory', back, s * 4.9, 0, 4.8, -s, 0.3);
    // the pavilion's entablature and its broken half-pediment, rising toward the middle, the eagle on its peak
    bag.add(R, B(Math.min(uo, ui), -0.2, Math.max(uo, ui), 2.05, yt, yt + 0.8));
    bag.add(R, B(Math.min(uo, ui) - 0.2, -0.2, Math.max(uo, ui) + 0.2, 2.35, yt + 0.8, yt + 1.4));
    const yp = yt + 1.4;
    prismUY(bag, P, [[uo, yp], [ui, yp], [ui, yp + 2.2]], -0.2, 2.0);
    rake(bag, P, s < 0 ? uo - 0.3 : ui, s < 0 ? yp : yp + 2.25, s < 0 ? ui : uo + 0.3, s < 0 ? yp + 2.25 : yp, 0.38, -0.2, 2.45);
    const ef = (u, v, w) => { const [px, pz] = P(u, 0.5 + w); return [px, yp + 2.2 + v, pz]; };
    fig(bag, 'eagle', ef, ui - s * 1.1, 0, 2.3, 1, 1.0);
    // the base of the obelisk above, running up into the rock
    bag.add(R, B(ui - s * 1.7 - 0.6, -0.2, ui - s * 1.7 + 0.6, 0.6, yp + 2.2, yp + 4.4));
  }
  // the tholos: its drum, the ring of columns, Isis-Tyche before the drum, the entablature, the conical roof, the capital and the urn
  const [tx, tz] = P(0, -0.3), tr = 3.3;
  bag.add(R, lathe([[2.4, 0], [2.4, uc]], 24, null, tx, ya, tz));
  for (const a of [-90, -55, -20, 20, 55, 90]) { const t = a * Math.PI / 180, [cx, cz] = P(Math.sin(t) * tr, -0.3 + Math.cos(t) * tr); column(bag, cx, cz, ya, uc, ur, C); }
  fig(bag, 'goddess', (u, v, w) => { const [px, pz] = P(u, 2.0 + w); return [px, ya + 0.4 + v, pz]; }, 0, 0, 3.6, 1, 0.35);
  bag.add(R, lathe([[2.3, 0], [tr + 0.5, 0], [tr + 0.5, 0.8], [tr + 0.75, 0.9], [tr + 0.75, 1.4], [0.001, 1.4]], 28, null, tx, yt, tz));
  bag.add(R, lathe([[tr + 0.3, 0], [tr + 0.1, 0.3], [0.9, 4.0], [0.001, 4.0]], 28, null, tx, yt + 1.4, tz));
  floralCapital(bag, R, tx, yt + 5.4, tz, 0.62, 1.2);
  bag.add(R, lathe([[0.55, 0], [0.38, 0.35], [0.85, 1.1], [1.0, 1.9], [0.8, 2.6], [0.42, 2.95], [0.58, 3.2], [0.001, H - (yt + 6.6) ]], 16, null, tx, yt + 6.6, tz));
  // ---- the portico: the great door under its pediment; the side chambers' doors, round windows above
  bag.add('opening', B(-1.5, pv + 0.01, 1.5, pv + 0.03, yb, yb + 7.2));
  for (const s of [-1, 1]) bag.add(R, B(s * 1.5 - (s > 0 ? 0 : 0.5), pv, s * 1.5 + (s > 0 ? 0.5 : 0), pv + 0.3, yb, yb + 7.5));
  bag.add(R, B(-2.2, pv, 2.2, pv + 0.35, yb + 7.2, yb + 7.8));
  prismUY(bag, P, [[-2.3, yb + 7.8], [2.3, yb + 7.8], [0, yb + 8.9]], pv, pv + 0.4);
  for (const s of [-1, 1]) {
    // the side wall of the portico faces the middle: door and round window cut in it
    const wu = s * pu, dirIn = -s;
    const door = B(wu + dirIn * 0.01 - (dirIn > 0 ? 0 : 0.02), -2.2, wu + dirIn * 0.01 + (dirIn > 0 ? 0.02 : 0), -0.6, yb, yb + 3.6);
    bag.add('opening', door);
    { const c = P(wu + dirIn * 0.015, -1.4), o = P(wu + dirIn * 1.015, -1.4), t = P(wu + dirIn * 0.015, -0.4); bag.add('opening', roundel([c[0], yb + 5.0, c[1]], [o[0] - c[0], 0, o[1] - c[1]], [t[0] - c[0], 0, t[1] - c[1]], 0.55)); }
    bag.add(R, B(wu + (dirIn > 0 ? 0 : -0.25), -2.5, wu + (dirIn > 0 ? 0.25 : 0), -0.3, yb + 3.6, yb + 4.0));
  }
}
