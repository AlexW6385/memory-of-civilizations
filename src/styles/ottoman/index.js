// Ottoman architecture of Sinan (16th c.; docs/settlements/ottoman-istanbul.md §4): the mosque's
// central dome on a square of piers, buttressed by semidomes before and behind and cascading small
// domes, all in lead over cut stone; the arcaded courtyard of domed bays with its fountain; pencil
// minarets with balconies and lead cones; madrasas of domed cells round courts; the city's timber
// houses (src/styles/vernacular's jettied tiled house).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, disc, place } from '../../core/geom.js';
import '../qing/index.js';
import { KULLIYE } from './kulliye.js';
import { prayerHall } from './prayerhall.js';
import { kahvehane } from './kahve.js';
import { carsi } from './bazaar.js';
import { cesme } from './cesme.js';
import { ottomanHouse } from './konak.js';
import * as FN from '../mughal/furnish.js';

const S = 'limestone', L = 'lead';
export const dome = (bag, x, y, z, r, mat = L) => {
  bag.add(S, lathe([[r * 1.04, 0], [r * 1.04, r * 0.22], [r * 0.98, r * 0.28]], 24, null, x, y, z));
  bag.add(mat, lathe([[r, 0], [r * 0.94, r * 0.3], [r * 0.78, r * 0.6], [r * 0.5, r * 0.85], [0.001, r * 0.95]], 24, null, x, y + r * 0.26, z));
  bag.add('gilt_bronze', lathe([[0.06 * r, 0], [0.03 * r, 0.25 * r], [0.001, 0.3 * r]], 6, null, x, y + r * 1.2, z));
};
/** sinan_mosque: { c, d (the central dome's diameter), h (the dome's crown), y, court (depth of the courtyard, north) } — the prayer hall facing south-east (here: the qibla on +z). */
function mosque(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, D = el.d, R = D / 2, y = el.y ?? 0, H = el.h, W = D * 2.2, Dp = D * 2.2, cd = el.court ?? D * 1.8;
  // the heights (docs/settlements/ottoman-istanbul.md §4.10): the drum's foot, the great arches' springing, the outer walls
  const dy = H - R * 1.2, yp = y + dy, ys = yp - 1.2166 * R, wallH = ys - y + 1.2;
  const hall = [cx - W / 2, cz - Dp / 2, cx + W / 2, cz + Dp / 2];
  // the prayer hall's outer walls (the door from the court in the north wall, the mihrab's niche cut in the qibla wall)
  const T = 2.6, dw = 2.4, dh = 6.5, [hx0, hz0, hx1, hz1] = hall, qz = hz1 - T;
  const wall = (r, y1 = y + wallH, y0 = y - 0.5) => { bag.add(S, box(r[0], y0, r[1], r[2], y1, r[3])); if (y0 < y + 1) col.rect(r, y, y1); };
  wall([hx0, qz, cx - 1.25, hz1]); wall([cx + 1.25, qz, hx1, hz1]); wall([cx - 1.25, qz + 1.25, cx + 1.25, hz1], y + 5.6); wall([cx - 1.25, qz, cx + 1.25, hz1], y + wallH, y + 5.6);
  wall([hx0, hz0 + T, hx0 + T, qz]); wall([hx1 - T, hz0 + T, hx1, qz]);
  wall([hx0, hz0, cx - dw, hz0 + T]); wall([cx + dw, hz0, hx1, hz0 + T]);
  bag.add(S, box(cx - dw, y + dh, hz0, cx + dw, y + wallH, hz0 + T));
  bag.add('opening', box(cx - dw * 0.8, y, hz0 + T - 0.05, cx + dw * 0.8, y + dh, hz0 + T - 0.02));
  // the windows: rows in the walls, seen from both sides (the qibla wall's are its own, in src/styles/ottoman/prayerhall.js)
  for (const f of 'new') { const along = f === 'n', Lw = along ? W : Dp, n = Math.floor(Lw / 4); for (let i = 1; i < n; i++) for (const yy of [y + 3, y + 12.2]) { const u = (along ? hx0 : hz0) + i * Lw / n; if (f === 'n' && Math.abs(u - cx) < dw + 1) continue; for (const [o0, o1, wm] of [[-0.06, 0.02, 'opening'], [T - 0.02, T + 0.02, 'daylight']]) { const q = f === 'n' ? [u - 0.8, hz0 + o0, u + 0.8, hz0 + o1] : f === 'w' ? [hx0 + o0, u - 0.8, hx0 + o1, u + 0.8] : [hx1 - o1, u - 0.8, hx1 - o0, u + 0.8]; bag.add(wm, box(q[0], yy, q[1], q[2], yy + 2.6, q[3])); } } }
  bag.add('marble', box(hx0 + T, y - 0.3, hz0 + T, hx1 - T, y + 0.05, hz1 - T)); col.floor([hx0 + T, hz0 + T, hx1 - T, hz1 - T], y + 0.05);
  // inside: the piers, arches, pendentives, drum and dome, the semidomes, tympana and aisles; the mihrab, minbar, loges, lamps, carpets
  prayerHall(bag, col, { cx, cz, y, R, Hi: W / 2 - T, T, yp, yr: yp + R * 0.26, ys });
  // outside: the weight towers at the corners of the central square
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const tx = cx + sx * (R + 1.5), tz = cz + sz * (R + 1.5); bag.add(S, box(tx - 2, y + wallH, tz - 2, tx + 2, y + dy + 1, tz + 2)); bag.add(L, lathe([[2.2, 0], [0.001, 3.5]], 8, null, tx, y + dy + 1, tz)); }
  // the courtyard and its four minarets at its corners: those by the mosque with three balconies, those at the far end with two
  const court = [cx - W * 0.42, hall[1] - cd, cx + W * 0.42, hall[1]];
  courtyard(bag, col, court, y, 9, 7);
  for (const [mx, mz, h, n] of [[court[0], court[1], 56, 2], [court[2], court[1], 56, 2], [court[0], court[3], 76, 3], [court[2], court[3], 76, 3]]) minaret({ c: [mx, mz], y, h, r: 1.9, balconies: n }, ctx);
}
export const dblT = (t) => { const o = t.slice(); for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return fromTriangles(o); };
/** A wall from A to B (plan), th thick, from ya to yb, pierced by pointed arches over the spans [[u0, u1]…] springing at ys; ablaq voussoirs on its faces when ablaq. */
export function arcadeWall(bag, A, B, spans, ya, ys, yb, th, mat = S, ablaq = false) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L, t2 = th / 2;
  const P = (u, yy, o) => [A[0] + ux * u + uz * o, yy, A[1] + uz * u - ux * o], tri = [], vou = [[], []];
  const q = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
  const strip = (ua, ya2, ub, yb2) => { if (Math.abs(ub - ua) < 1e-5) return; for (const o of [-t2, t2]) q(tri, P(ua, ya2, o), P(ub, yb2, o), P(ub, yb, o), P(ua, yb, o)); };
  let u = 0;
  for (const [s0, s1] of spans) {
    strip(u, ya, s0, ya);
    const pts = [[s0, ys - 0.001], ...pointedArc(s0, s1, ys), [s1, ys - 0.001]];
    for (let k = 0; k + 1 < pts.length; k++) {
      const [a0, b0] = pts[k], [a1, b1] = pts[k + 1];
      strip(a0, b0, a1, b1); q(tri, P(a0, b0, t2), P(a1, b1, t2), P(a1, b1, -t2), P(a0, b0, -t2));
    }
    q(tri, P(s0, ya, t2), P(s0, ys, t2), P(s0, ys, -t2), P(s0, ya, -t2)); q(tri, P(s1, ys, t2), P(s1, ya, t2), P(s1, ya, -t2), P(s1, ys, -t2));
    if (ablaq) {
      // voussoirs round the arch, red and white in turn, a band just proud of both faces
      const arc = pointedArc(s0, s1, ys), mid = (s0 + s1) / 2;
      for (let k = 0; k + 1 < arc.length; k++) {
        const [a0, b0] = arc[k], [a1, b1] = arc[k + 1], n0 = norm([a0 - (a0 < mid ? s0 + (s1 - s0) * 0.62 : s1 - (s1 - s0) * 0.62), b0 - ys]), n1 = norm([a1 - (a1 < mid ? s0 + (s1 - s0) * 0.62 : s1 - (s1 - s0) * 0.62), b1 - ys]);
        for (const o of [-t2 - 0.012, t2 + 0.012]) q(vou[k % 2], P(a0, b0, o), P(a1, b1, o), P(a1 + n1[0] * 0.55, b1 + n1[1] * 0.55, o), P(a0 + n0[0] * 0.55, b0 + n0[1] * 0.55, o));
      }
    }
    u = s1;
  }
  strip(u, ya, L, ya);
  q(tri, P(0, ya, -t2), P(0, ya, t2), P(0, yb, t2), P(0, yb, -t2)); q(tri, P(L, ya, t2), P(L, ya, -t2), P(L, yb, -t2), P(L, yb, t2));
  q(tri, P(0, yb, -t2), P(L, yb, -t2), P(L, yb, t2), P(0, yb, t2));
  bag.add(mat, dblT(tri));
  if (ablaq) { bag.add('marble_smooth', dblT(vou[0])); bag.add('granite_red', dblT(vou[1])); }
}
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
/** The intrados of a pointed arch over [s0, s1] springing at ys (centres at 0.38 of the span in from each side). */
export function pointedArc(s0, s1, ys, K = 8) {
  const w = s1 - s0, r = w * 0.62, cL = s0 + r, cR = s1 - r, ta = Math.acos(((s0 + s1) / 2 - cL) / r), out = [];
  // left half: centred on the right centre's mirror — the arc from s0 rises about cL
  for (let i = 0; i <= K; i++) { const t = Math.PI - (Math.PI - ta) * i / K; out.push([cL + r * Math.cos(t), ys + r * Math.sin(t)]); }
  for (let i = K - 1; i >= 0; i--) { const t = Math.PI - (Math.PI - ta) * i / K; out.push([cR - r * Math.cos(t), ys + r * Math.sin(t)]); }
  return out;
}
/** A column of the courtyard: base, monolithic shaft (porphyry, pink granite or white marble), a muqarnas capital in white marble. */
function courtColumn(bag, col, x, z, y, hs, mat) {
  bag.add('marble_smooth', box(x - 0.55, y, z - 0.55, x + 0.55, y + 0.25, z + 0.55));
  bag.add('marble_smooth', lathe([[0.5, 0], [0.5, 0.12], [0.42, 0.22], [0.4, 0.3]], 16, null, x, y + 0.25, z));
  bag.add(mat, lathe([[0.38, 0], [0.34, hs - 1.55]], 16, null, x, y + 0.55, z));
  bag.add('marble_smooth', lathe([[0.4, 0], [0.4, 0.1], [0.36, 0.14]], 16, null, x, y + hs - 1.0, z));
  // the capital: tiers of small cells stepping out from the round neck to the square abacus
  for (let k = 0; k < 4; k++) {
    const r0 = 0.36 + k * 0.08, yy = y + hs - 0.86 + k * 0.2, n = 8 + k * 4;
    for (let i = 0; i < n; i++) { const a = (i + (k % 2) * 0.5) / n * Math.PI * 2, g = box(-0.07, 0, -r0 * Math.PI / n * 0.9, 0.07, 0.2, r0 * Math.PI / n * 0.9); bag.add('marble_smooth', place(g, x + Math.cos(a) * (r0 - 0.04), yy, z + Math.sin(a) * (r0 - 0.04), -a)); }
    bag.add('marble_smooth', lathe([[r0 - 0.04, 0], [r0 - 0.04, 0.2]], 16, null, x, yy, z));
  }
  bag.add('marble_smooth', box(x - 0.62, y + hs - 0.06, z - 0.62, x + 0.62, y + hs + 0.12, z + 0.62));
  col.circle(x, z, 0.42, y, y + hs);
}
/** A dome over a bay from below and above: the plastered shell and the corner fans inside, the lead outside. */
export function bayDome(bag, x, y, z, hx, hz) {
  const r = Math.min(hx, hz) * 0.92, shell = [];
  for (let k = 0; k <= 8; k++) { const t = Math.PI / 2 * k / 8; shell.push([Math.max(0.001, r * Math.cos(t)), r * 0.82 * Math.sin(t)]); }
  bag.add('stucco', lathe(shell.reverse(), 20, null, x, y, z));
  const fan = [];
  for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) { const a0 = Math.atan2(sz, sx) - Math.PI / 4; for (let k = 0; k < 5; k++) { const t0 = a0 + Math.PI / 2 * k / 5, t1 = a0 + Math.PI / 2 * (k + 1) / 5; fan.push(x + sx * hx, y - 0.005, z + sz * hz, x + Math.cos(t0) * r, y - 0.005, z + Math.sin(t0) * r, x + Math.cos(t1) * r, y - 0.005, z + Math.sin(t1) * r); } }
  bag.add('stucco', dblT(fan));
  dome(bag, x, y, z, r);
}
/** A hipped roof over rect [x0, z0, x1, z1] from y, rising h (the ridge along the longer side). */
function hipRoof(bag, mat, r, y, h) {
  const [x0, z0, x1, z1] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = x1 - x0 >= z1 - z0, d = Math.min(x1 - x0, z1 - z0) / 2;
  const a = alongX ? [x0 + d, y + h, cz] : [cx, y + h, z0 + d], b = alongX ? [x1 - d, y + h, cz] : [cx, y + h, z1 - d];
  const c = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], t = [];
  if (alongX) { t.push(...c[0], ...a, ...b, ...c[0], ...b, ...c[1]); t.push(...c[2], ...b, ...a, ...c[2], ...a, ...c[3]); t.push(...c[3], ...a, ...c[0]); t.push(...c[1], ...b, ...c[2]); }
  else { t.push(...c[1], ...a, ...b, ...c[1], ...b, ...c[2]); t.push(...c[3], ...b, ...a, ...c[3], ...a, ...c[0]); t.push(...c[0], ...a, ...c[1]); t.push(...c[2], ...b, ...c[3]); }
  bag.add(mat, dblT(t));
}
/**
 * The courtyard of the Süleymaniye (docs/settlements/ottoman-istanbul.md §4.1) over rect C, the prayer
 * hall's north wall as its south side: a portico of bays nx × nz round the court on 24 columns (two of
 * porphyry by the mosque's door, twelve of pink granite, ten of white marble, all with white marble
 * capitals), pointed arches, a dome over every bay, the outer walls with two rows of windows, the
 * portal in the north wall and doors east and west; the white marble paving with the round porphyry
 * slab before the door; the oblong şadırvan with its green grille, marble frieze and lead roof.
 */
function courtyard(bag, col, C, y, nx, nz) {
  const [X0, Z0, X1, Z1] = C, bx = (X1 - X0) / nx, bz = (Z1 - Z0) / nz, hs = 5.4, top = 9.0, wt = 1.3, wallTop = top + 0.9, cx = (X0 + X1) / 2;
  // the columns on the inner line, the materials as the sources give them
  const pos = [];
  for (let i = 1; i < nx; i++) pos.push([X0 + i * bx, Z1 - bz, 's', i], [X0 + i * bx, Z0 + bz, 'n', i]);
  for (let j = 2; j < nz - 1; j++) pos.push([X0 + bx, Z0 + j * bz, 'w', j], [X1 - bx, Z0 + j * bz, 'e', j]);
  pos.sort((a, b) => Math.hypot(a[0] - cx, a[1] - Z1) - Math.hypot(b[0] - cx, b[1] - Z1));
  // nearest the door the two of porphyry; then pair by pair, granite and marble in turn (12 and 10)
  pos.forEach(([x, z], k) => courtColumn(bag, col, x, z, y, hs, k < 2 ? 'porphyry' : Math.floor((k - 2) / 2) % 2 ? 'marble_smooth' : 'granite_red'));
  // the arcades: along the inner lines (the court's faces), and across each bay from the columns to the walls
  const inner = (A, B, n, a) => arcadeWall(bag, A, B, Array.from({ length: n }, (_, i) => [i * a + 0.62, (i + 1) * a - 0.62]), y + hs, y + hs, y + top, 0.9, S, true);
  inner([X0 + bx, Z0 + bz], [X1 - bx, Z0 + bz], nx - 2, bx); inner([X0 + bx, Z1 - bz], [X1 - bx, Z1 - bz], nx - 2, bx);
  inner([X0 + bx, Z0 + bz], [X0 + bx, Z1 - bz], nz - 2, bz); inner([X1 - bx, Z0 + bz], [X1 - bx, Z1 - bz], nz - 2, bz);
  const across = (A, B, a) => arcadeWall(bag, A, B, [[0.62, a - 0.3]], y + hs, y + hs, y + top, 0.7, S);
  for (let i = 1; i < nx; i++) { across([X0 + i * bx, Z0 + bz], [X0 + i * bx, Z0], bz); across([X0 + i * bx, Z1 - bz], [X0 + i * bx, Z1], bz); }
  for (let j = 1; j < nz; j++) { across([X0 + bx, Z0 + j * bz], [X0, Z0 + j * bz], bx); across([X1 - bx, Z0 + j * bz], [X1, Z0 + j * bz], bx); }
  // a dome over every bay of the ring, the one before the mosque's door raised on a drum
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    if (i > 0 && i < nx - 1 && j > 0 && j < nz - 1) continue;
    const x = X0 + (i + 0.5) * bx, z = Z0 + (j + 0.5) * bz, main = j === nz - 1 && i === (nx - 1) / 2;
    if (main) { const hx = bx / 2 - 0.2, hz = bz / 2 - 0.2; for (const q of [[x - hx, z - hz, x + hx, z - hz + 0.4], [x - hx, z + hz - 0.4, x + hx, z + hz], [x - hx, z - hz + 0.4, x - hx + 0.4, z + hz - 0.4], [x + hx - 0.4, z - hz + 0.4, x + hx, z + hz - 0.4]]) bag.add(S, box(q[0], y + top - 0.01, q[1], q[2], y + top + 1.0, q[3])); bayDome(bag, x, y + top + 1.0, z, hx, hz); }
    else bayDome(bag, x, y + top, z, bx / 2, bz / 2);
  }
  // the outer walls (north, west, east) outside the rect: two rows of windows per bay, doors in the middle bays, the portal north
  const doorN = cx, doorEW = Z0 + (Math.floor(nz / 2) + 0.5) * bz;
  const wallRun = (r, alongX, door) => {
    const [a0, a1] = alongX ? [r[0], r[2]] : [r[1], r[3]], cut = door ? [door - 1.6, door + 1.6] : null;
    const seg = (u0, u1, ya, yb) => { const q = alongX ? [u0, r[1], u1, r[3]] : [r[0], u0, r[2], u1]; bag.add(S, box(q[0], ya, q[1], q[2], yb, q[3])); if (ya <= y) col.rect(q, y, yb); };
    if (cut) { seg(a0, cut[0], y - 0.5, y + wallTop); seg(cut[1], a1, y - 0.5, y + wallTop); seg(cut[0], cut[1], y + 5.2, y + wallTop); } else seg(a0, a1, y - 0.5, y + wallTop);
    bag.add(S, alongX ? box(r[0] - 0.25, y + wallTop, r[1] - 0.25, r[2] + 0.25, y + wallTop + 0.35, r[3] + 0.25) : box(r[0] - 0.25, y + wallTop, r[1] - 0.25, r[2] + 0.25, y + wallTop + 0.35, r[3] + 0.25));
    const n = alongX ? nx : nz, b = alongX ? bx : bz;
    for (let i = 0; i < n; i++) {
      const u = (alongX ? X0 : Z0) + (i + 0.5) * b;
      if (door && Math.abs(u - door) < 1) continue;
      for (const face of [0, 1]) {
        const f = face ? (alongX ? r[3] : r[2]) : (alongX ? r[1] : r[0]), sg = face ? 1 : -1;
        const W = (u0, u1, ya, yb, d0, d1, m) => { const p = [f + sg * d0, f + sg * d1]; const q = alongX ? [u0, Math.min(...p), u1, Math.max(...p)] : [Math.min(...p), u0, Math.max(...p), u1]; bag.add(m, box(q[0], ya, q[1], q[2], yb, q[3])); };
        W(u - 0.85, u + 0.85, y + 1.0, y + 3.6, -0.06, 0.02, 'opening');
        W(u - 1.05, u + 1.05, y + 3.6, y + 3.85, 0, 0.12, 'marble_smooth'); W(u - 1.05, u + 1.05, y + 0.8, y + 1.0, 0, 0.14, 'marble_smooth');
        for (const s2 of [-1, 1]) W(u + s2 * 0.95 - 0.1, u + s2 * 0.95 + 0.1, y + 1.0, y + 3.6, 0, 0.1, 'marble_smooth');
        for (let g = 1; g < 6; g++) W(u - 0.85 + g * 0.283 - 0.02, u - 0.85 + g * 0.283 + 0.02, y + 1.0, y + 3.6, 0.02, 0.07, 'iron');
        W(u - 0.85, u + 0.85, y + 2.28, y + 2.32, 0.02, 0.07, 'iron');
        W(u - 0.5, u + 0.5, y + 4.6, y + 6.6, -0.06, 0.02, 'opening');
        for (let k = 0; k < 4; k++) W(u - 0.5 + k * 0.12, u + 0.5 - k * 0.12, y + 6.6 + k * 0.14, y + 6.74 + k * 0.14, -0.06, 0.02, 'opening');
        W(u - 0.7, u + 0.7, y + 4.4, y + 4.6, 0, 0.1, 'marble_smooth');
      }
    }
  };
  wallRun([X0 - wt, Z0 - wt, X1 + wt, Z0], true, doorN);
  wallRun([X0 - wt, Z0, X0, Z1], false, doorEW); wallRun([X1, Z0, X1 + wt, Z1], false, doorEW);
  // the portal: a block standing out from the north wall, taller than it, the niche with its muqarnas hood, the door
  const pw = 5.2, pd = 2.4, pz = Z0 - wt, ph = 15;
  for (const s2 of [-1, 1]) { const q = [s2 < 0 ? cx - pw - 1.6 : cx + pw - 0.2, pz - pd, s2 < 0 ? cx - pw + 0.2 : cx + pw + 1.6, pz]; bag.add(S, box(q[0], y - 0.5, q[1], q[2], y + ph, q[3])); col.rect(q, y, y + ph); }
  bag.add(S, box(cx - pw + 0.2, y + ph - 3.4, pz - pd, cx + pw - 0.2, y + ph, pz));
  bag.add(S, box(cx - pw - 1.6, y + wallTop, pz, cx + pw + 1.6, y + ph, pz + wt));
  bag.add(S, box(cx - pw - 1.9, y + ph, pz - pd - 0.3, cx + pw + 1.9, y + ph + 0.5, pz + wt));
  for (let k = 0; k < 7; k++) {
    const yy = y + ph - 3.4 - (7 - k) * 0.5, out = pd * (k + 1) / 8, n = 9 - Math.floor(k / 2) * 2, w = 2 * pw - 0.4;
    for (let i = 0; i < n; i++) { const u0 = cx - pw + 0.2 + i * w / n + 0.03, u1 = cx - pw + 0.2 + (i + 1) * w / n - 0.03; bag.add('marble_smooth', box(u0, yy, pz - out, u1, yy + 0.5, pz)); }
  }
  bag.add('glaze_white', box(cx - 2.4, y + 6.0, pz - 0.05, cx + 2.4, y + 7.2, pz)); bag.add('glaze_blue', box(cx - 2.2, y + 6.15, pz - 0.07, cx + 2.2, y + 7.05, pz - 0.04));
  bag.add('marble_smooth', box(cx - 2.2, y + 5.2, pz - 0.18, cx + 2.2, y + 5.6, pz));
  for (const s2 of [-1, 1]) bag.add('marble_smooth', box(cx + s2 * 1.6 - 0.2, y, pz - 0.18, cx + s2 * 1.6 + 0.2, y + 5.2, pz));
  // the paving, the porphyry slab before the mosque's door
  bag.add('marble_floor', box(X0, y - 0.3, Z0, X1, y + 0.08, Z1)); col.floor(C, y + 0.08);
  bag.add('porphyry', disc(1.0, y + 0.09, 24, cx, Z1 - 1.6));
  bag.add('porphyry', lathe([[1.0, 0], [1.0, 0.01]], 24, null, cx, y + 0.08, Z1 - 1.6));
  // the şadırvan: an oblong marble basin, taps and stools round it, the green grille, the marble frieze, the lead roof
  const fz = (Z0 + Z1) / 2, fw = 2.6, fd = 1.8;
  bag.add('marble_smooth', box(cx - fw - 0.9, y + 0.08, fz - fd - 0.9, cx + fw + 0.9, y + 0.28, fz + fd + 0.9)); col.floor([cx - fw - 0.9, fz - fd - 0.9, cx + fw + 0.9, fz + fd + 0.9], y + 0.28);
  bag.add('marble_smooth', box(cx - fw, y + 0.28, fz - fd, cx + fw, y + 1.2, fz + fd)); col.rect([cx - fw, fz - fd, cx + fw, fz + fd], y, y + 3.3);
  bag.add('marble_smooth', box(cx - fw - 0.12, y + 1.2, fz - fd - 0.12, cx + fw + 0.12, y + 1.32, fz + fd + 0.12));
  const ring = (fn) => { for (const s2 of [-1, 1]) { for (let i = 0; i < 6; i++) fn(cx - fw + (i + 0.5) * 2 * fw / 6, fz + s2 * fd, 0, s2); for (let i = 0; i < 4; i++) fn(cx + s2 * fw, fz - fd + (i + 0.5) * 2 * fd / 4, s2, 0); } };
  ring((x, z, dx, dz) => {
    bag.add('bronze', rod([x + dx * 0.01, y + 0.85, z + dz * 0.01], [x + dx * 0.16, y + 0.82, z + dz * 0.16], 0.025, 6));
    bag.add('bronze', rod([x + dx * 0.16, y + 0.82, z + dz * 0.16], [x + dx * 0.17, y + 0.74, z + dz * 0.17], 0.02, 6));
    bag.add('marble_smooth', box(x + dx * 0.55 - 0.18, y + 0.28, z + dz * 0.55 - 0.18, x + dx * 0.55 + 0.18, y + 0.6, z + dz * 0.55 + 0.18));
  });
  const gx0 = cx - fw + 0.06, gx1 = cx + fw - 0.06, gz0 = fz - fd + 0.06, gz1 = fz + fd - 0.06;
  for (const [x, z] of [[gx0, gz0], [gx1, gz0], [gx1, gz1], [gx0, gz1]]) bag.add('marble_smooth', box(x - 0.14, y + 1.32, z - 0.14, x + 0.14, y + 2.9, z + 0.14));
  for (const [a, b, alongX, at] of [[gx0, gx1, true, gz0], [gx0, gx1, true, gz1], [gz0, gz1, false, gx0], [gz0, gz1, false, gx1]]) {
    for (let u = a + 0.2; u < b - 0.1; u += 0.14) bag.add('shutter_green', alongX ? box(u - 0.015, y + 1.32, at - 0.015, u + 0.015, y + 2.9, at + 0.015) : box(at - 0.015, y + 1.32, u - 0.015, at + 0.015, y + 2.9, u + 0.015));
    for (const yy of [y + 1.5, y + 2.1, y + 2.7]) bag.add('shutter_green', alongX ? box(a, yy, at - 0.03, b, yy + 0.05, at + 0.03) : box(at - 0.03, yy, a, at + 0.03, yy + 0.05, b));
  }
  bag.add('marble_smooth', box(cx - fw - 0.1, y + 2.9, fz - fd - 0.1, cx + fw + 0.1, y + 3.35, fz + fd + 0.1));
  for (const s2 of [-1, 1]) for (let i = 0; i < 14; i++) { const x = cx - fw + 0.2 + i * (2 * fw - 0.4) / 13; bag.add('marble_dark', box(x - 0.06, y + 3.0, fz + s2 * (fd + 0.1) - 0.02, x + 0.06, y + 3.25, fz + s2 * (fd + 0.1) + 0.02)); }
  bag.add('timber', box(cx - fw - 0.9, y + 3.35, fz - fd - 0.9, cx + fw + 0.9, y + 3.45, fz + fd + 0.9));
  hipRoof(bag, L, [cx - fw - 0.9, fz - fd - 0.9, cx + fw + 0.9, fz + fd + 0.9], y + 3.45, 1.5);
  bag.add('gilt_bronze', lathe([[0.08, 0], [0.12, 0.25], [0.04, 0.5], [0.001, 0.8]], 8, null, cx, y + 4.95, fz));
}

/**
 * minaret: { c, h (to the alem's tip), y, r (the shaft's radius), balconies } — Sinan's pencil minaret
 * (docs/settlements/ottoman-istanbul.md §4.2): the square base up past the court's roof, a chamfered
 * transition, the sixteen-sided fluted shaft, each şerefe on tiers of muqarnas with a parapet of pierced
 * marble panels and a rail, the shaft going on above, the lead cone and the gilt alem; a door onto each balcony.
 */
function minaret(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 60, r = el.r ?? 1.9, n = el.balconies ?? 3;
  const cap = h * 0.16, shaftTop = y + h - cap, hb = Math.max(10.6, h * 0.14), hw = r * 1.3;
  bag.add(S, box(x - hw, y - 0.5, z - hw, x + hw, y + hb, z + hw)); col.rect([x - hw, z - hw, x + hw, z + hw], y, y + hb);
  bag.add(S, box(x - hw - 0.12, y + hb - 0.5, z - hw - 0.12, x + hw + 0.12, y + hb, z + hw + 0.12));
  // the transition: the square's corners cut back in triangles to the sixteen sides
  bag.add(S, lathe([[hw * Math.SQRT2, 0], [r * 1.12, 1.6]], 4, null, 0, 0, 0).rotateY(Math.PI / 4).translate(x, y + hb, z));
  bag.add(S, lathe([[r * 1.14, 0], [r * 1.14, 0.3], [r * 1.02, 0.5]], 16, null, x, y + hb + 1.4, z));
  const flute = (t) => 1 + 0.03 * Math.cos(t * 16);
  const levels = Array.from({ length: n }, (_, k) => y + hb + 2 + (shaftTop - y - hb - 6) * (n === 3 ? [0.42, 0.66, 0.9][k] : [0.55, 0.88][k]));
  let y0 = y + hb + 1.9;
  const rt = r * 0.9, radius = (yl) => r * (1 - 0.06 * (yl - y) / h);
  levels.forEach((yl, li) => {
    const rr = radius(yl), rnext = li + 1 < levels.length ? radius(levels[li + 1]) : rt;
    bag.add(S, lathe([[rr, 0], [rr * 0.995, yl - 1.6 - y0]], 32, flute, x, y0, z));
    // the muqarnas under the balcony: rings of cells stepping out
    for (let k = 0; k < 4; k++) {
      const ra = rr * (1 + k * 0.17), yy = yl - 1.6 + k * 0.4, cells = 16 + k * 8;
      bag.add(S, lathe([[k ? ra - rr * 0.17 : ra * 0.98, 0], [ra, 0], [ra, 0.4]], 16, null, x, yy, z));
      for (let i = 0; i < cells; i++) { const a = (i + (k % 2) * 0.5) / cells * Math.PI * 2, w = ra * Math.PI / cells * 0.8; bag.add('limestone', place(box(-0.02, 0.05, -w, rr * 0.17, 0.4, w), x + Math.cos(a) * ra, yy, z + Math.sin(a) * ra, -a)); }
    }
    const rf = rr * 1.72;
    bag.add(S, lathe([[rr * 1.5, 0], [rf, 0.08], [rf, 0.24], [0.001, 0.24]], 32, null, x, yl, z));
    // the parapet of pierced marble panels between posts, and the rail
    const np = 16;
    for (let i = 0; i < np; i++) {
      const a = (i + 0.5) / np * Math.PI * 2, w = rf * Math.sin(Math.PI / np) - 0.07;
      const pr = rf * Math.cos(Math.PI / np) - 0.06, px = x + Math.cos(a) * pr, pz = z + Math.sin(a) * pr;
      bag.add('marble_smooth', place(box(-0.04, 0, -w, 0.04, 0.85, w), px, yl + 0.24, pz, -a));
      bag.add('marble_smooth', place(box(0.04, 0.12, -w + 0.1, 0.065, 0.73, w - 0.1), px, yl + 0.24, pz, -a));
      bag.add('marble_dark', place(box(0.065, 0.36, -0.05, 0.08, 0.5, 0.05), px, yl + 0.24, pz, -a));
      const b = i / np * Math.PI * 2; bag.add('marble_smooth', box(x + Math.cos(b) * (rf - 0.1) - 0.07, yl + 0.24, z + Math.sin(b) * (rf - 0.1) - 0.07, x + Math.cos(b) * (rf - 0.1) + 0.07, yl + 1.09, z + Math.sin(b) * (rf - 0.1) + 0.07));
    }
    bag.add('marble_smooth', lathe([[rf + 0.02, 0], [rf + 0.02, 0.1], [rf - 0.22, 0.1], [rf - 0.22, 0]], 32, null, x, yl + 1.09, z));
    // the door from the stair onto the balcony
    bag.add('opening', box(x + rnext * 0.94, yl + 0.24, z - 0.38, x + rnext * 1.045, yl + 2.1, z + 0.38));
    y0 = yl + 0.24;
  });
  bag.add(S, lathe([[rt, 0], [rt, shaftTop - y0 - 0.4]], 32, flute, x, y0, z));
  bag.add(S, lathe([[rt, 0], [rt * 1.1, 0.2], [rt * 1.1, 0.4]], 16, null, x, shaftTop - 0.4, z));
  bag.add(L, lathe([[rt * 1.12, 0], [rt * 0.9, cap * 0.18], [rt * 0.45, cap * 0.62], [0.001, cap * 0.9]], 16, null, x, shaftTop, z));
  for (const [rr, yy] of [[0.18, 0], [0.26, 0.35], [0.2, 0.75]]) bag.add('gilt_bronze', lathe([[0.03, 0], [rr, 0.12], [0.03, 0.26]], 8, null, x, shaftTop + cap * 0.88 + yy, z));
  bag.add('gilt_bronze', rod([x, shaftTop + cap * 0.86, z], [x, y + h, z], 0.03, 5));
}

/** madrasa: { rect, y } — domed cells round a court with an arcade. */
function madrasa(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, d = 5.5;
  for (const r of [[x0, z0, x1, z0 + d], [x0, z1 - d, x1, z1], [x0, z0 + d, x0 + d, z1 - d], [x1 - d, z0 + d, x1, z1 - d]]) {
    bag.add(S, box(r[0], y - 0.5, r[1], r[2], y + 5, r[3])); col.rect(r, y, y + 5);
    const along = r[2] - r[0] > r[3] - r[1], len = along ? r[2] - r[0] : r[3] - r[1], n = Math.floor(len / d);
    for (let i = 0; i < n; i++) { const u = (along ? r[0] : r[1]) + (i + 0.5) * len / n; dome(bag, along ? u : (r[0] + r[2]) / 2, y + 5, along ? (r[1] + r[3]) / 2 : u, d * 0.42); }
  }
}
/**
 * turbe: { c, y, r (the octagon's inner apothem), h (the walls), door ('n'|'s'|'e'|'w') } — an octagonal
 * tomb of Sinan's (docs/settlements/ottoman-istanbul.md §4.3, Hürrem Sultan's of 1558): cut stone on a
 * plinth, on seven faces a window with an iron grille under a tiled lunette, small pointed windows
 * above, the door on the eighth; inside, Iznik tiles to the window heads, the hooded niches between
 * the windows, the dome on a drum; the cenotaph under its cloth within a wooden rail, a carpet, a lamp.
 */
function turbe(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, ri = el.r ?? 4.4, T = 1.2, ro = ri + T, h = el.h ?? 7.6, tn = Math.tan(Math.PI / 8);
  const doorA = { n: -Math.PI / 2, s: Math.PI / 2, e: 0, w: Math.PI }[el.door ?? 'n'];
  // F(a, d0, d1, u0, u1, y0, y1, m): a box on face a, d radial from the centre, u along the face
  const F = (a, d0, d1, u0, u1, y0, y1, m) => bag.add(m, place(box(d0, y0, u0, d1, y1, u1), cx, 0, cz, -a));
  bag.add('marble_smooth', place(lathe([[(ro + 0.8) / Math.cos(Math.PI / 8), 0], [(ro + 0.8) / Math.cos(Math.PI / 8), 0.45], [0.001, 0.45]], 8), cx, y - 0.2, cz, Math.PI / 8));
  const y0 = y + 0.25, half = ro * tn;
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, door = Math.abs(Math.atan2(Math.sin(a - doorA), Math.cos(a - doorA))) < 0.1;
    if (door) {
      F(a, ri, ro, -half, -0.85, y0, y + h + 0.7, S); F(a, ri, ro, 0.85, half, y0, y + h + 0.7, S); F(a, ri, ro, -0.85, 0.85, y0 + 3.3, y + h + 0.7, S);
      F(a, ro, ro + 0.14, -1.25, -0.85, y0, y0 + 3.6, 'marble_smooth'); F(a, ro, ro + 0.14, 0.85, 1.25, y0, y0 + 3.6, 'marble_smooth'); F(a, ro, ro + 0.14, -1.25, 1.25, y0 + 3.3, y0 + 3.75, 'marble_smooth');
      F(a, ro, ro + 0.06, -1.25, 1.25, y0 + 3.9, y0 + 4.6, 'glaze_white'); F(a, ro + 0.06, ro + 0.08, -1.1, 1.1, y0 + 4.0, y0 + 4.5, 'tile_lapis');
      // the door leaves standing open inside
      for (const s2 of [-1, 1]) F(a + s2 * 0.0, ri - 0.85, ri, s2 * 0.85 - (s2 > 0 ? 0.06 : 0), s2 * 0.85 + (s2 < 0 ? 0.06 : 0), y0, y0 + 3.25, 'wood_dark');
    } else {
      F(a, ri, ro, -half, half, y0, y + h + 0.7, S);
      // the lower window: marble frame, iron grille, the tiled lunette over it; inside, its reveal
      F(a, ro - 0.02, ro + 0.03, -0.75, 0.75, y0 + 0.9, y0 + 3.1, 'opening'); F(a, ri - 0.03, ri + 0.02, -0.75, 0.75, y0 + 0.9, y0 + 3.1, 'daylight');
      F(a, ro, ro + 0.12, -0.95, -0.75, y0 + 0.7, y0 + 3.3, 'marble_smooth'); F(a, ro, ro + 0.12, 0.75, 0.95, y0 + 0.7, y0 + 3.3, 'marble_smooth');
      F(a, ro, ro + 0.14, -0.95, 0.95, y0 + 0.55, y0 + 0.75, 'marble_smooth'); F(a, ro, ro + 0.12, -0.95, 0.95, y0 + 3.1, y0 + 3.3, 'marble_smooth');
      for (let g = 1; g < 5; g++) F(a, ro + 0.03, ro + 0.07, -0.75 + g * 0.3 - 0.02, -0.75 + g * 0.3 + 0.02, y0 + 0.9, y0 + 3.1, 'iron');
      F(a, ro + 0.03, ro + 0.07, -0.75, 0.75, y0 + 1.98, y0 + 2.02, 'iron');
      F(a, ro, ro + 0.05, -0.75, 0.75, y0 + 3.3, y0 + 4.1, 'tile_turquoise');
      for (let s = 0; s < 4; s++) F(a, ro + 0.05, ro + 0.12, -0.95 + s * 0.12, 0.95 - s * 0.12, y0 + 4.1 + s * 0.16, y0 + 4.26 + s * 0.16, S);
      // the upper window, pointed
      F(a, ro - 0.02, ro + 0.03, -0.45, 0.45, y0 + 5.0, y0 + 6.2, 'opening'); F(a, ri - 0.03, ri + 0.02, -0.45, 0.45, y0 + 5.0, y0 + 6.2, 'daylight');
      for (let s = 0; s < 3; s++) F(a, ro - 0.02, ro + 0.03, -0.45 + s * 0.15, 0.45 - s * 0.15, y0 + 6.2 + s * 0.13, y0 + 6.33 + s * 0.13, 'opening');
      // inside: the Iznik tiles to the window heads, the inscription band, the lunette's panel
      F(a, ri - 0.04, ri, -ri * tn, -0.75, y0 + 0.02, y0 + 3.3, 'tile_iznik'); F(a, ri - 0.04, ri, 0.75, ri * tn, y0 + 0.02, y0 + 3.3, 'tile_iznik');
      F(a, ri - 0.04, ri, -0.75, 0.75, y0 + 0.02, y0 + 0.9, 'tile_iznik');
      F(a, ri - 0.06, ri, -ri * tn, ri * tn, y0 + 3.3, y0 + 4.1, 'tile_lapis');
      for (let i = 0; i < 16; i++) { const u = -ri * tn + 0.15 + i * (2 * ri * tn - 0.3) / 15, tall = (i * 5 + k) % 3 !== 0; F(a, ri - 0.09, ri - 0.06, u - 0.03, u + 0.03, y0 + 3.45, y0 + (tall ? 3.95 : 3.62), 'glaze_white'); }
    }
    // the hooded niche at the corner between this face and the next (the corners are cut inside)
    const ac = a + Math.PI / 8, rc = ri / Math.cos(Math.PI / 8);
    F(ac, rc - 0.17, rc - 0.1, -0.36, 0.36, y0 + 0.4, y0 + 3.0, 'tile_lapis');
    for (let s = 0; s < 3; s++) F(ac, rc - 0.25 - s * 0.03, rc - 0.12, -0.34 + s * 0.08, 0.34 - s * 0.08, y0 + 3.0 + s * 0.14, y0 + 3.14 + s * 0.14, 'glaze_white');
  }
  // collision: the walls as a ring of circles, open at the door
  for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - doorA), Math.cos(a - doorA))) < 0.2) continue; col.circle(cx + Math.cos(a) * (ri + T / 2), cz + Math.sin(a) * (ri + T / 2), T * 0.6, y, y + h); }
  bag.add('marble_floor', place(lathe([[ri / Math.cos(Math.PI / 8) + 0.05, 0], [ri / Math.cos(Math.PI / 8) + 0.05, 0.31], [0.001, 0.31]], 8), cx, y0 - 0.3, cz, Math.PI / 8));
  col.floor([cx - ri, cz - ri, cx + ri, cz + ri], y0 + 0.01);
  // the cornice, the drum with its windows, the lead dome and its alem; the plastered dome inside
  bag.add(S, place(lathe([[ro / Math.cos(Math.PI / 8), 0], [(ro + 0.35) / Math.cos(Math.PI / 8), 0.5], [(ro + 0.35) / Math.cos(Math.PI / 8), 0.7], [ri / Math.cos(Math.PI / 8), 0.7]], 8), cx, y + h, cz, Math.PI / 8));
  const rd = ri + 0.3;
  bag.add(S, lathe([[rd + 0.6, 0], [rd + 0.6, 1.4], [rd - 0.2, 1.4]], 16, null, cx, y + h + 0.7, cz));
  for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * Math.PI * 2; F(a, rd + 0.58, rd + 0.62, -0.22, 0.22, y + h + 0.95, y + h + 1.85, 'opening'); }
  const shell = []; for (let k = 0; k <= 8; k++) { const t = Math.PI / 2 * k / 8; shell.push([Math.max(0.001, ri * Math.cos(t)), ri * 0.92 * Math.sin(t)]); }
  bag.add('stucco', lathe(shell.slice().reverse(), 24, null, cx, y + h + 0.7, cz));
  const fan = [], rcn = ri / Math.cos(Math.PI / 8), yf = y + h + 0.7;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, ac = a + Math.PI / 8; for (let i = 0; i < 6; i++) { const t0 = a + Math.PI / 4 * i / 6, t1 = a + Math.PI / 4 * (i + 1) / 6; fan.push(cx + Math.cos(ac) * rcn, yf, cz + Math.sin(ac) * rcn, cx + Math.cos(t0) * ri, yf, cz + Math.sin(t0) * ri, cx + Math.cos(t1) * ri, yf, cz + Math.sin(t1) * ri); } }
  bag.add('stucco', dblT(fan));
  dome(bag, cx, y + h + 2.1, cz, rd + 0.4);
  // inside: the cenotaph under its cloth, a wooden rail round it, the carpet, a lamp on its chain
  bag.add('cloth_red', place(lathe([[ri / Math.cos(Math.PI / 8) - 0.6, 0], [ri / Math.cos(Math.PI / 8) - 0.6, 0.02], [0.001, 0.02]], 8), cx, y0, cz, Math.PI / 8));
  const along = doorA === 0 || doorA === Math.PI ? 0 : 1, cl = along ? [1.1, 0.5] : [0.5, 1.1];
  bag.add('wood_painted', box(cx - cl[0], y0, cz - cl[1], cx + cl[0], y0 + 0.5, cz + cl[1]));
  bag.add('cloth_green', box(cx - cl[0] - 0.06, y0 + 0.02, cz - cl[1] - 0.06, cx + cl[0] + 0.06, y0 + 0.95, cz + cl[1] + 0.06));
  bag.add('cloth_green', lathe([[0.56, 0], [0.4, 0.16], [0.001, 0.22]], 12).scale(along ? 2.06 : 1, 1, along ? 1 : 2.06).translate(cx, y0 + 0.95, cz));
  const rr = [cx - cl[0] - 0.7, cz - cl[1] - 0.7, cx + cl[0] + 0.7, cz + cl[1] + 0.7];
  // the Qur'an readers' places (docs/settlements/ottoman-istanbul.md §10): two folding stands with their books open, a
  // cushion before each, outside the rail on the side away from the door
  for (const s of [-1, 1]) { const qx = along ? cx + s * 0.8 : cx + (doorA === Math.PI / 2 ? -1 : 1) * -(cl[0] + 1.25), qz = along ? cz + (doorA === Math.PI ? 1 : -1) * -(cl[1] + 1.25) : cz + s * 0.8; const yw = along ? (doorA === Math.PI ? 0 : Math.PI) : (doorA === Math.PI / 2 ? -Math.PI / 2 : Math.PI / 2); FN.rahle(bag, qx, y0 + 0.02, qz, yw); const ox = Math.sin(yw) * 0.45, oz = Math.cos(yw) * 0.45; FN.cushion(bag, qx - ox, y0 + 0.02, qz - oz, 0.5, 0.5, 0.09, yw, 'cloth_green'); }
  for (const [ax, az, bx, bz] of [[rr[0], rr[1], rr[2], rr[1]], [rr[0], rr[3], rr[2], rr[3]], [rr[0], rr[1], rr[0], rr[3]], [rr[2], rr[1], rr[2], rr[3]]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.2);
    bag.add('wood_dark', box(Math.min(ax, bx) - 0.04, y0 + 0.82, Math.min(az, bz) - 0.04, Math.max(ax, bx) + 0.04, y0 + 0.9, Math.max(az, bz) + 0.04));
    bag.add('wood_dark', box(Math.min(ax, bx) - 0.04, y0 + 0.02, Math.min(az, bz) - 0.04, Math.max(ax, bx) + 0.04, y0 + 0.1, Math.max(az, bz) + 0.04));
    for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n; bag.add('wood_dark', box(x - 0.025, y0 + 0.1, z - 0.025, x + 0.025, y0 + 0.82, z + 0.025)); }
  }
  col.rect(rr, y0, y0 + 0.9);
  const ly = y + h - 1.5;
  bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.08], [0.2, 0.2], [0.2, 0.3], [0.12, 0.38], [0.11, 0.45], [0.2, 0.62], [0.001, 0.62]], 10, null, cx + 1.8, ly, cz + 1.8));
  bag.add('iron', rod([cx + 1.8, ly + 0.62, cz + 1.8], [cx + 1.8, y + h + 0.7 + ri * 0.92 * Math.sin(Math.acos(Math.min(1, 2.55 / ri))) - 0.05, cz + 1.8], 0.012, 4));
}
/**
 * graves: { list: [{ at, len, yaw, kind ('man'|'woman') }], y, roses: [[x, z]…] } — the burial garden behind
 * the qibla wall (§4.3): each grave a low marble kerb with earth between, an upright headstone and a
 * footstone; a man's headstone crowned with a carved turban, a woman's with a rounded top; rose bushes.
 */
function graves(el, { bag, col }) {
  const y = el.y ?? 0;
  for (const g of el.list) {
    const [x, z] = g.at, a = g.yaw ?? 0, L = g.len ?? 2.0, P = (gg) => place(gg, x, y, z, a);
    bag.add('marble_smooth', P(box(-L / 2, -0.1, -0.42, L / 2, 0.22, -0.32))); bag.add('marble_smooth', P(box(-L / 2, -0.1, 0.32, L / 2, 0.22, 0.42)));
    bag.add('marble_smooth', P(box(-L / 2, -0.1, -0.32, -L / 2 + 0.1, 0.22, 0.32))); bag.add('marble_smooth', P(box(L / 2 - 0.1, -0.1, -0.32, L / 2, 0.22, 0.32)));
    bag.add('ground', P(box(-L / 2 + 0.1, -0.1, -0.32, L / 2 - 0.1, 0.12, 0.32)));
    const hs = g.kind === 'woman' ? 1.05 : 1.15;
    bag.add('marble_smooth', P(box(-L / 2 - 0.02, 0, -0.2, -L / 2 + 0.14, hs, 0.2)));
    bag.add('marble_smooth', P(box(L / 2 - 0.12, 0, -0.16, L / 2 + 0.02, 0.6, 0.16)));
    if (g.kind === 'woman') bag.add('marble_smooth', P(lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.12], [0.18, 0.22], [0.001, 0.26]], 10).scale(0.4, 1, 1).translate(-L / 2 + 0.06, hs, 0)));
    else { bag.add('marble_smooth', P(lathe([[0.08, 0], [0.08, 0.06], [0.2, 0.1], [0.24, 0.2], [0.2, 0.32], [0.08, 0.36], [0.001, 0.4]], 12, (t) => 1 + 0.06 * Math.cos(t * 10)).translate(-L / 2 + 0.06, hs, 0))); }
    // a band of script on the headstone's face
    for (let i = 0; i < 4; i++) bag.add('marble_dark', P(box(-L / 2 + 0.14, hs - 0.25 - i * 0.16, -0.14, -L / 2 + 0.155, hs - 0.2 - i * 0.16, 0.14)));
    col.circle(x, z, 0.3, y, y + 0.3);
  }
  for (const [x, z] of el.roses || []) {
    const s = 0.5 + ((x * 13 + z * 7) % 1 + 1) % 1 * 0.3;
    bag.add('lotus_leaf', lathe([[0.001, 0], [0.25 * s, 0.1], [0.42 * s, 0.4 * s], [0.36 * s, 0.8 * s], [0.001, 0.95 * s]], 8, null, x, y, z));
    for (let k = 0; k < 7; k++) { const a = k * 2.4, rr = 0.3 * s + (k % 2) * 0.06, yy = y + (0.45 + (k % 3) * 0.14) * s; bag.add('cloth_red', box(x + Math.cos(a) * rr - 0.04, yy, z + Math.sin(a) * rr - 0.04, x + Math.cos(a) * rr + 0.04, yy + 0.07, z + Math.sin(a) * rr + 0.04)); }
  }
}

registerStyle('ottoman', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, sinan_mosque: mosque, minaret, madrasa, turbe, graves, kahvehane, carsi, cesme, ottoman_house: ottomanHouse, ...KULLIYE },
  objects: {},
});
