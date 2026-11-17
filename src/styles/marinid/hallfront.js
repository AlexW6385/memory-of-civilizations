// Carved work of the Bou Inania's court (docs/settlements/fez.md §4.1, §14): the inlaid marble pavement, the muqarnas cornice, the prayer hall's
// arcaded front under its cedar canopy, the pillars' capitals and brackets, the carved cedar frieze and joists of the gallery ceiling.
// Everything is boxes and flat fans merged by material; sizes are varied by a millimetre so the repeats merge instead of instancing.
import { box, fromTriangles } from '../../core/geom.js';
import { face, archHead, canopy, dbl, poly } from './kit.js';

const mm = (i) => ((i * 37) % 7) * 0.0004;
/** An n-pointed star (outer R, inner r) as a flat fan facing up at (cx, y, cz), turned by rot. */
function starFan(out, cx, y, cz, R, r, n = 8, rot = 0) {
  for (let k = 0; k < 2 * n; k++) {
    const a = rot + k * Math.PI / n, b = rot + (k + 1) * Math.PI / n, ra = k % 2 ? r : R, rb = (k + 1) % 2 ? r : R;
    out.push(cx, y, cz, cx + Math.sin(b) * rb, y, cz + Math.cos(b) * rb, cx + Math.sin(a) * ra, y, cz + Math.cos(a) * ra);
  }
}
/** The court's pavement: marble inlaid with dark eight-pointed stars on a grid, links of dark marble, a border, a great star round the basin. */
export function starPave(bag, y, cw0, cw1, cz0, cz1, bx, bz) {
  const W = cw1 - cw0, D = cz1 - cz0, nx = Math.max(2, Math.round(W / 2.9)), nz = Math.max(2, Math.round(D / 2.9)), sx = W / nx, sz = D / nz;
  const dark = [], pale = [], tur = [], yy = y + 0.012;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const cx = cw0 + (i + 0.5) * sx, cz = cz0 + (j + 0.5) * sz;
    if (Math.hypot(cx - bx, cz - bz) < 3.6) continue;
    starFan(dark, cx, yy, cz, 1.05 + mm(i * 5 + j), 0.62, 8, Math.PI / 8);
    starFan(pale, cx, yy + 0.004, cz, 0.62, 0.33, 8, 0);
    starFan(tur, cx, yy + 0.008, cz, 0.2, 0.1, 8, Math.PI / 8);
  }
  starFan(dark, bx, yy, bz, 3.1, 2.15, 8, Math.PI / 8); starFan(pale, bx, yy + 0.004, bz, 2.55, 1.95, 8, 0); starFan(tur, bx, yy + 0.008, bz, 2.1, 1.85, 8, Math.PI / 8);
  bag.add('marble_dark', dbl(dark)); bag.add('marble_smooth', dbl(pale)); bag.add('tile_turquoise', dbl(tur));
  // links along the grid lines and a border of dark marble round the court, a pale fillet inside it
  for (let i = 1; i < nx; i++) bag.add('marble_dark', box(cw0 + i * sx - 0.03, y, cz0 + 0.55, cw0 + i * sx + 0.03, y + 0.01, cz1 - 0.55));
  for (let j = 1; j < nz; j++) bag.add('marble_dark', box(cw0 + 0.55, y, cz0 + j * sz - 0.03, cw1 - 0.55, y + 0.01, cz0 + j * sz + 0.03));
  for (const r of [[cw0 + 0.3, cz0 + 0.3, cw1 - 0.3, cz0 + 0.5], [cw0 + 0.3, cz1 - 0.5, cw1 - 0.3, cz1 - 0.3], [cw0 + 0.3, cz0 + 0.5, cw0 + 0.5, cz1 - 0.5], [cw1 - 0.5, cz0 + 0.5, cw1 - 0.3, cz1 - 0.5]]) bag.add('marble_dark', box(r[0], y, r[1], r[2], y + 0.012, r[3]));
  for (const r of [[cw0 + 0.5, cz0 + 0.5, cw1 - 0.5, cz0 + 0.56], [cw0 + 0.5, cz1 - 0.56, cw1 - 0.5, cz1 - 0.5]]) bag.add('tile_turquoise', box(r[0], y, r[1], r[2], y + 0.011, r[3]));
}
/** A muqarnas cornice on face f from u0 to u1, rising from y0 in `T` corbelled tiers that project to `depth`; each tier a row of cells. */
export function muqarnas(bag, f, u0, u1, y0, T = 4, depth = 0.4, hh = 0.2) {
  for (let k = 0; k < T; k++) {
    const n = Math.round((u1 - u0) / (0.24 + k * 0.01)), s = (u1 - u0) / n, d1 = depth * (k + 1) / T, mat = k % 2 ? 'stucco_warm' : 'stucco_cream', off = k % 2 ? s / 2 : 0;
    for (let i = 0; i < n; i++) {
      const a = u0 + i * s + off, b = a + s * 0.9, e = Math.min(b, u1); if (a < u0 + 0.01 || e - a < 0.05) continue;
      const r = f.R(0, d1 + mm(i + k), a, e); bag.add(mat, box(r[0], y0 + k * hh, r[1], r[2], y0 + (k + 1) * hh - 0.012, r[3]));
      const w = f.R(d1 * 0.4, d1 + mm(i), a + s * 0.2, e - s * 0.2); bag.add('stucco_warm', box(w[0], y0 + k * hh - hh * 0.5, w[1], w[2], y0 + k * hh, w[3]));
    }
  }
  const t = f.R(0, depth + 0.04, u0, u1); bag.add('cedar', box(t[0], y0 + T * hh - 0.012, t[1], t[2], y0 + T * hh + 0.05, t[3]));
}
/** The prayer hall's front (wall at z = zH facing the court): a horseshoe door with colonnettes, arched windows in alfiz frames, a cedar canopy. */
export function hallFront(bag, y, zH, hx0, hx1, cx, wins) {
  const fa = face('z', zH, 1), fo = face('z', zH, -1);
  archHead(bag, fa, cx - 1.7, cx + 1.7, y + 2.9, y + 4.4, 0.7, 'horseshoe', { alfiz: true, alfizUp: 0.5, both: true });
  for (const s of [-1, 1]) {
    const u = cx + s * 1.86, r = fo.R(0.02, 0.2, u - 0.09, u + 0.09);
    bag.add('marble_smooth', box(r[0], y, r[1], r[2], y + 0.18, r[3])); bag.add('marble_dark', box(r[0] + 0.02, y + 0.18, r[1] + 0.02, r[2] - 0.02, y + 2.75, r[3] - 0.02));
    bag.add('stucco_warm', box(r[0] - 0.02, y + 2.75, r[1] - 0.02, r[2] + 0.02, y + 2.95, r[3] + 0.02)); bag.add('cedar', box(r[0] - 0.05, y + 2.95, r[1] - 0.05, r[2] + 0.05, y + 3.03, r[3] + 0.05));
  }
  for (const u of wins) {
    archHead(bag, fa, u - 0.5, u + 0.5, y + 3.0, y + 3.7, 0.7, 'lobed', { alfiz: true, both: true });
    const sill = fo.R(0, 0.14, u - 0.62, u + 0.62); bag.add('marble_smooth', box(sill[0], y + 1.14, sill[1], sill[2], y + 1.22, sill[3]));
    for (const s of [-1, 1]) { const p = fo.R(0.02, 0.1, u + s * 0.58 - 0.04, u + s * 0.58 + 0.04); bag.add('marble_dark', box(p[0], y + 1.22, p[1], p[2], y + 3.2, p[3])); }
  }
  canopy(bag, fo, hx0 + 0.3, hx1 - 0.3, y + 5.2, 1.2);
}
/** A pillar's capital and brackets: a flared cedar block under the lintel, two stepped corbels along the gallery's axis. */
export function pillarCap(bag, x, z, y, alongX, i) {
  const e = mm(i), T = (ax, az, bx, bz, y0, y1, m = 'cedar') => bag.add(m, box(x - ax, y + y0, z - az, x + bx, y + y1 + e, z + bz));
  T(0.3, 0.3, 0.3, 0.3, 3.3, 3.55, 'wood_dark');
  T(0.34, 0.34, 0.34, 0.34, 3.28, 3.32, 'stucco_warm');
  if (alongX) { T(0.55, 0.17, 0.55, 0.17, 3.38, 3.55); T(0.36, 0.17, 0.36, 0.17, 3.24, 3.38, 'wood_dark'); }
  else { T(0.17, 0.55, 0.17, 0.55, 3.38, 3.55); T(0.17, 0.36, 0.17, 0.36, 3.24, 3.38, 'wood_dark'); }
}
/** The carved cedar frieze on the edge of the upper floor: rails, a row of relief lozenges between them, at d off the edge on face f. */
export function frieze(bag, f, u0, u1, y0, y1) {
  const r0 = f.R(0, 0.07, u0, u1), r1 = f.R(0, 0.1, u0, u1);
  bag.add('wood_dark', box(r0[0], y0, r0[1], r0[2], y0 + 0.09, r0[3])); bag.add('wood_dark', box(r1[0], y1 - 0.12, r1[1], r1[2], y1, r1[3]));
  const h = y1 - y0 - 0.21, s = 0.4, n = Math.floor((u1 - u0) / s), m = ((u1 - u0) - n * s) / 2, T = [], T2 = [], vc = y0 + 0.09 + h / 2, q = Math.min(h / 2, s / 2) * 0.88;
  for (let i = 0; i < n; i++) {
    const cu = u0 + m + (i + 0.5) * s;
    poly(T, f, [[cu - q, vc], [cu, vc - q], [cu + q, vc], [cu, vc + q]], 0.045 + mm(i));
    poly(T2, f, [[cu - q * 0.45, vc], [cu, vc - q * 0.45], [cu + q * 0.45, vc], [cu, vc + q * 0.45]], 0.062);
  }
  bag.add('cedar', fromTriangles(T)); bag.add('timber', fromTriangles(T2));
}
/** Joists under a gallery's ceiling: across the gallery from a to b (z or x) every 0.8 m between u0 and u1. */
export function joists(bag, y, rect, alongX) {
  const [x0, z0, x1, z1] = rect;
  if (alongX) { const n = Math.floor((x1 - x0) / 0.8); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; bag.add('cedar', box(x - 0.06, y - 0.16 + mm(i), z0, x + 0.06, y, z1)); } }
  else { const n = Math.floor((z1 - z0) / 0.8); for (let i = 0; i <= n; i++) { const z = z0 + (z1 - z0) * i / n; bag.add('cedar', box(x0, y - 0.16 + mm(i), z - 0.06, x1, y, z + 0.06)); } }
}
