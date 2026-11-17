// The Khazneh's finer carving (docs/settlements/petra.md §21): the acanthus capitals, the dressing of the
// tholos, the dentils and returns of the broken pediments, the aedicules of the Dioscuri, the friezes'
// mouldings, the tapering obelisk bases and the bedding of the rock face. Everything is added to the
// materials the façade already uses, so that no draw is added.

import { box, lathe, fromTriangles, orientOutward, place, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

// a cheap ellipsoid, its long axis `up` (a unit vector, possibly leaning), its thin axis `f` (unit, horizontal outward)
const PROFILE = [[0.001, -1], [0.87, -0.5], [1, 0], [0.87, 0.5], [0.001, 1]];
function blob(c, f, lean, rf, ry, rl, seg = 6) {
  const g = lathe(PROFILE, seg);
  // axes: forward (thin) a, long b, lateral cr = a × b
  const a = [f[0] * Math.cos(lean), -Math.sin(lean), f[1] * Math.cos(lean)], b = [f[0] * Math.sin(lean), Math.cos(lean), f[1] * Math.sin(lean)];
  const cr = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  g.scale(rf, ry, rl);   // lathe: x, z around, y long
  // lathe's own x → a, y → b, z → cr
  g.applyMatrix4(new Matrix4().fromArray([a[0], a[1], a[2], 0, b[0], b[1], b[2], 0, cr[0], cr[1], cr[2], 0, c[0], c[1], c[2], 1]));
  return g;
}
const rot = (f, d) => [f[0] * Math.cos(d) - f[1] * Math.sin(d), f[0] * Math.sin(d) + f[1] * Math.cos(d)];

/** An abacus with concave sides: half-width hw at the corners, hw·k at the middle of each side. */
function abacus(bag, mat, x, y0, y1, z, hw, k) {
  // corners: the point where two sides meet, pushed out to the diagonal
  const poly = [];
  for (let s = 0; s < 4; s++) {
    const a = s * Math.PI / 2 + Math.PI / 4, d = hw * 1.0 * Math.SQRT2;
    const m = a - Math.PI / 4, mid = [Math.cos(m) * hw * k, Math.sin(m) * hw * k];
    poly.push(mid, [Math.cos(a) * d, Math.sin(a) * d]);
  }
  const T = [], n = poly.length;
  const V = (p, y) => [x + p[0], y, z + p[1]];
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; T.push(...V(p, y0), ...V(q, y0), ...V(q, y1), ...V(p, y0), ...V(q, y1), ...V(p, y1)); T.push(x, y1, z, ...V(q, y1), ...V(p, y1)); T.push(x, y0, z, ...V(p, y0), ...V(q, y0)); }
  // a concave solid: orient each triangle by its own side (the walls outward from the centre, the caps up and down)
  for (let i = 0; i < T.length; i += 9) {
    const ax = T[i], ay = T[i + 1], az = T[i + 2], ux = T[i + 3] - ax, uy = T[i + 4] - ay, uz = T[i + 5] - az, vx = T[i + 6] - ax, vy = T[i + 7] - ay, vz = T[i + 8] - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (ax + T[i + 3] + T[i + 6]) / 3 - x, my = (ay + T[i + 4] + T[i + 7]) / 3 - (y0 + y1) / 2, mz = (az + T[i + 5] + T[i + 8]) / 3 - z;
    const horiz = Math.abs(ny) > Math.hypot(nx, nz) * 3;
    const out = horiz ? (my > 0 ? 1 : -1) * ny : nx * mx + nz * mz;
    if (out < 0) for (let k = 0; k < 3; k++) { const t = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = t; }
  }
  bag.add(mat, fromTriangles(T));
}

/**
 * An acanthus capital of the Nabataean Corinthian order: the bell, two rows of eight three-lobed leaves with
 * their tips curling out, the corner volutes and the helices between them, the abacus with concave sides
 * and a flower on each face. r the shaft's top radius, h the capital's height; `full` false gives the
 * lighter capital of the small upper columns.
 */
export function acanthusCapital(bag, mat, x, y, z, r, h, full = true) {
  // (each capital differs from the next by a few millimetres, so that their pieces merge into the material's one mesh and are not instanced)
  r *= 1 + (Math.abs(Math.round(x * 7 + z * 13 + y * 3)) % 9) * 0.006;
  bag.add(mat, lathe([[r * 0.97, 0], [r * 1.0, 0.25 * h], [r * 1.08, 0.55 * h], [r * 1.16, 0.78 * h], [r * 0.7, 0.78 * h]], 16, null, x, y, z));
  const at = (f, rad, yy) => [x + f[0] * rad, y + yy, z + f[1] * rad];
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, f = [Math.cos(a), Math.sin(a)];
    // lower row
    bag.add(mat, blob(at(f, r * 1.02, 0.25 * h), f, 0.16, r * 0.14, 0.27 * h, r * 0.2));
    bag.add(mat, blob(at(f, r * 1.14, 0.5 * h), f, 0.7, r * 0.12, 0.09 * h, r * 0.17));
    if (full) for (const s of [-1, 1]) {
      const g = rot(f, s * 0.3), t = [-f[1], f[0]], c = [x + f[0] * r * 0.98 + t[0] * s * r * 0.36, y + 0.2 * h, z + f[1] * r * 0.98 + t[1] * s * r * 0.36];
      bag.add(mat, blob(c, g, 0.3, r * 0.1, 0.2 * h, r * 0.14));
    }
    // upper row, between
    const b = a + Math.PI / 8, g2 = [Math.cos(b), Math.sin(b)];
    bag.add(mat, blob(at(g2, r * 1.06, 0.5 * h), g2, 0.2, r * 0.14, 0.28 * h, r * 0.2));
    bag.add(mat, blob(at(g2, r * 1.22, 0.74 * h), g2, 0.75, r * 0.12, 0.09 * h, r * 0.18));
    if (full) for (const s of [-1, 1]) {
      const g = rot(g2, s * 0.3), t = [-g2[1], g2[0]], c = [x + g2[0] * r * 1.06 + t[0] * s * r * 0.34, y + 0.46 * h, z + g2[1] * r * 1.06 + t[1] * s * r * 0.34];
      bag.add(mat, blob(c, g, 0.3, r * 0.1, 0.22 * h, r * 0.13));
    }
  }
  // volutes at the corners and the helices at the middle of each side, under the abacus
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2, f = [Math.cos(a), Math.sin(a)], t = [-f[1], f[0]];
    for (const s of [-1, 1]) {
      const c = [x + f[0] * r * 1.3 + t[0] * s * r * 0.22, y + 0.7 * h, z + f[1] * r * 1.3 + t[1] * s * r * 0.22], g = rot(f, s * 0.7);
      bag.add(mat, blob(c, g, 0, r * 0.2, r * 0.2, r * 0.2));
      bag.add(mat, blob([c[0] + g[0] * r * 0.09, c[1], c[2] + g[1] * r * 0.09], g, 0, r * 0.1, r * 0.1, r * 0.1, 5));
    }
    const m = a + Math.PI / 4, fm = [Math.cos(m), Math.sin(m)];
    bag.add(mat, blob(at(fm, r * 1.2, 0.64 * h), fm, 0.15, r * 0.16, r * 0.15, r * 0.15));
    // the flower on the abacus's face
    bag.add(mat, blob(at(fm, r * 1.36 * 0.92, 0.91 * h), fm, 0, r * 0.07, r * 0.22, r * 0.22, 8));
  }
  abacus(bag, mat, x, y + 0.82 * h, y + h, z, r * 1.42, 0.84);
}

/** The tapering base of an obelisk: a square shaft w0 → w1 wide (u) and d0 → d1 deep (v) from y0 to y1, stood on a plinth. */
export function obeliskBase(bag, mat, P, u, v, y0, y1, w0, w1, d0, d1) {
  const c = (uu, vv, y) => { const [x, z] = P(uu, vv); return [x, y, z]; };
  const bot = [[-w0 / 2, -d0 / 2], [w0 / 2, -d0 / 2], [w0 / 2, d0 / 2], [-w0 / 2, d0 / 2]].map(([a, b]) => c(u + a, v + b, y0));
  const top = [[-w1 / 2, -d1 / 2], [w1 / 2, -d1 / 2], [w1 / 2, d1 / 2], [-w1 / 2, d1 / 2]].map(([a, b]) => c(u + a, v + b, y1));
  const T = [];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; T.push(...bot[i], ...bot[j], ...top[j], ...bot[i], ...top[j], ...top[i]); }
  T.push(...top[0], ...top[1], ...top[2], ...top[0], ...top[2], ...top[3]);
  bag.add(mat, fromTriangles(orientOutward(T)));
}

/** Small prisms (dentils) along a line (ua, ya) → (ub, yb), running left to right, hanging below it: size (along, down), v0 → v1. */
export function dentilsAlong(bag, mat, P, prism, ua, ya, ub, yb, pitch, along, down, v0, v1) {
  const len = Math.hypot(ub - ua, yb - ya), du = (ub - ua) / len, dy = (yb - ya) / len, nu = dy, ny = -du;
  const n = Math.floor(len / pitch);
  for (let i = 0; i < n; i++) {
    const j = 0.0007 * (i % 5), s = (i + 0.5) * (len / n) - (along + j) / 2, p = [ua + du * s, ya + dy * s], q = [p[0] + du * (along + j), p[1] + dy * (along + j)];
    prism(bag, P, [p, q, [q[0] + nu * down, q[1] + ny * down], [p[0] + nu * down, p[1] + ny * down]], v0, v1, mat);
  }
}

/** A ring of small boxes about (cx, cz) (radius R, angles in the frame's (u, v) terms), each box [radial, height, tangential] big, at height y. */
function ringBoxes(bag, mat, P, cu, cv, R, t0, t1, n, y, sz) {
  for (let i = 0; i < n; i++) {
    const t = t0 + (t1 - t0) * (i + 0.5) / n, u = cu + Math.sin(t) * R, v = cv + Math.cos(t) * R;
    const [x, z] = P(u, v), [x0, z0] = P(cu, cv), yaw = -Math.atan2(z - z0, x - x0);
    bag.add(mat, place(box(-sz[0] / 2, 0, -sz[2] / 2, sz[0] / 2, sz[1], sz[2] / 2), x, y, z, yaw));
  }
}

/** The tholos: the stylobate, its drum's mouldings, the dentils and triglyph bands of its entablature, the ribbed and tiered roof. */
export function tholosDress(bag, { L, RC }, P, tx, tz, ya, yt, tr) {
  // the stylobate: two steps all round under the ring of columns
  bag.add(L, lathe([[tr + 0.95, 0], [tr + 0.95, 0.18], [tr + 0.62, 0.18], [tr + 0.62, 0.36], [0.001, 0.36]], 28, null, tx, ya, tz));
  // the drum's base and its cornice, rising behind the columns
  bag.add(L, lathe([[2.62, 0.36], [2.62, 0.62], [2.5, 0.68], [2.4, 0.68]], 28, null, tx, ya, tz));
  bag.add(L, lathe([[2.4, 8.2], [2.58, 8.3], [2.62, 8.55], [2.62, 8.8], [2.4, 8.8]], 28, null, tx, ya, tz));
  // the entablature: its frieze with a band of triglyph-like uprights and the dentils below the cornice
  ringBoxes(bag, L, P, 0, -0.3, tr + 0.52, -Math.PI * 0.62, Math.PI * 0.62, 36, yt + 0.12, [0.14, 0.6, 0.2]);
  ringBoxes(bag, L, P, 0, -0.3, tr + 0.77, -Math.PI * 0.62, Math.PI * 0.62, 44, yt + 1.05, [0.22, 0.2, 0.17]);
  // the roof: tiered rings and twelve ribs over the cone, the rings stepping out in the manner of scales
  const rAt = (t) => 3.4 - 2.5 * (t - 0.3) / 3.7;
  const y0 = yt + 1.4;
  for (let t = 0.7; t < 3.8; t += 0.55) { const r = rAt(t); bag.add(L, lathe([[r - 0.02, 0], [r + 0.13, 0.04], [r + 0.13, 0.16], [r - 0.02, 0.24]], 28, null, tx, y0 + t, tz)); }
  for (let k = 0; k < 14; k++) {
    const a = k / 14 * Math.PI * 2, c = [Math.cos(a), Math.sin(a)];
    const [bx, bz] = P(0, -0.3), ux = tx - bx, uz = tz - bz;
    void ux; void uz;
    const pa = [tx + c[0] * (3.46), y0 + 0.2, tz + c[1] * (3.46)], pb = [tx + c[0] * 0.98, y0 + 3.92, tz + c[1] * 0.98];
    // only where the roof is in front of the rock face (v > 0 in the frame)
    const [qa, qb] = [P(0, 0), P(0, 1)], fv = [qb[0] - qa[0], qb[1] - qa[1]];
    if (c[0] * fv[0] + c[1] * fv[1] < -0.2) continue;
    bag.add(L, rod(pa, pb, 0.07, 5));
  }
  // the neck under the capital: a collar of acanthus tips
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2, f = [Math.cos(a), Math.sin(a)];
    bag.add(L, blob([tx + f[0] * 0.78, yt + 5.1, tz + f[1] * 0.78], f, 0.5, 0.1, 0.25, 0.1));
  }
  void RC;
}

/** The urn: gadroons round its belly and two loop handles. */
export function urnDress(bag, L, tx, tz, y0) {
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2, f = [Math.cos(a), Math.sin(a)];
    bag.add(L, blob([tx + f[0] * 0.97, y0 + 1.5, tz + f[1] * 0.97], f, 0, 0.1, 0.62, 0.17));
  }
  for (const s of [-1, 1]) {
    const pts = [[0.9, 2.3], [1.2, 2.2], [1.35, 1.9], [1.3, 1.5], [1.05, 1.3]];
    for (let i = 0; i + 1 < pts.length; i++) bag.add(L, rod([tx, y0 + pts[i][1], tz + s * pts[i][0]], [tx, y0 + pts[i + 1][1], tz + s * pts[i + 1][0]], 0.08, 5));
  }
}

/** The mouldings of the frieze above the lower order: an egg-and-dart on the architrave, a sima with antefixes over the cornice. */
export function lowerMouldings(bag, { L, R }, B, hw) {
  for (let u = -hw + 0.1, i = 0; u < hw - 0.2; u += 0.3, i++) {
    bag.add(L, B(u, 2.97, u + 0.15 + (i % 3) * 0.001, 3.12, 14.36, 14.52));   // the egg
    bag.add(L, B(u + 0.17, 2.97, u + 0.22, 3.1, 14.36, 14.5));               // the dart
  }
  // the sima: an upright band along the cornice's top, an antefix over every other dentil
  bag.add(L, B(-hw - 0.45, 3.0, hw + 0.45, 3.3, 16.2, 16.55));
  for (let u = -hw - 0.2, i = 0; u < hw + 0.3; u += 0.76, i++) bag.add(R, B(u, 3.0, u + 0.3 + (i % 2) * 0.001, 3.28, 16.55, 16.95 + (i % 3) * 0.002));
}

/** An aedicule round a niche in a side bay of the lower storey. */
export function aedicule(bag, { L }, P, B, prism, s, yb, y1) {
  const u0 = s > 0 ? 6.8 : -12.2, u1 = s > 0 ? 12.2 : -6.8, vw = 1.75;
  for (const [a, b] of [[u0, u0 + 0.55], [u1 - 0.55, u1]]) {
    bag.add(L, B(a, vw, b, vw + 0.22, yb + 0.6, yb + y1));                 // the pilaster
    bag.add(L, B(a - 0.08, vw, b + 0.08, vw + 0.3, yb + 0.6, yb + 0.95));  // its base
    bag.add(L, B(a - 0.1, vw, b + 0.1, vw + 0.3, yb + y1 - 0.35, yb + y1)); // its capital
  }
  bag.add(L, B(u0 - 0.15, vw, u1 + 0.15, vw + 0.3, yb + y1, yb + y1 + 0.45));          // the architrave
  bag.add(L, B(u0 - 0.3, vw, u1 + 0.3, vw + 0.42, yb + y1 + 0.45, yb + y1 + 0.75));    // the cornice
  const cu = (u0 + u1) / 2;
  prism(bag, P, [[u0 - 0.3, yb + y1 + 0.75], [u1 + 0.3, yb + y1 + 0.75], [cu, yb + y1 + 1.7]], vw, vw + 0.4, L);
}

/** The cornice of the pavilions' entablature and the returns at the broken ends of the half-pediments. */
export function pavilionMouldings(bag, { L, R }, P, prism, B, s, ue, ui, yt, yp) {
  const a = Math.min(ue, ui), b = Math.max(ue, ui);
  for (let u = a + 0.15; u < b - 0.1; u += 0.34) bag.add(L, B(u, 2.05, u + 0.18, 2.3, yt + 0.62, yt + 0.8));      // dentils
  // the cornice's return: the horizontal cornice that finishes the broken pediment at its inner end, with its own moulding
  const e = ui;
  bag.add(L, B(Math.min(e - s * 0.35, e + s * 0.1), -0.2, Math.max(e - s * 0.35, e + s * 0.1), 2.45, yp, yp + 2.35));
  bag.add(L, B(Math.min(e - s * 0.5, e + s * 0.25), -0.2, Math.max(e - s * 0.5, e + s * 0.25), 2.6, yp + 2.35, yp + 2.6));
  void P; void prism; void R;
}

/** The bedding of the face: ledges across the dressed rock, deterministic, thin beds weathered back, thick ones standing out. */
export function bedding(bag, R, B, hw, y0, y1, seed = 3) {
  let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let y = y0;
  while (y < y1) {
    const th = 0.18 + rnd() * 0.5, d = 0.05 + rnd() * 0.2, gap = 0.4 + rnd() * 1.1;
    if (y + th < y1) bag.add(R, B(-hw + rnd() * 0.6, 0.0, hw - rnd() * 0.6, d, y, y + th));
    y += th + gap;
  }
}
