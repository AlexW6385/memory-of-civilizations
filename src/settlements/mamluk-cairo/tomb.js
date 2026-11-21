// Sultan Hasan's mausoleum from inside, and the portals' bronze (docs/settlements/mamluk-cairo.md §15).
//   hasan_tomb: the square chamber (21 m): a dado of polychrome marble panels with inlaid stars, two tiers of grilled windows
//     with deep sills, the wooden Throne Verse frieze, the marble mihrab, the cenotaphs (the sultan's, his sons'), the great
//     Qur'an stand, enamelled lamps on chains, and above the walls the wooden zone of transition: seven tiers of corbelled
//     cells (pendentives) turning the square into the circle of the dome.
//   hasan_dome: the drum with its sixteen windows and the two shells of the dome — the inner ogival one seen from the chamber,
//     the outer one as before (the stone cap over the square, the drum, the stucco dome, the finial).
//   hasan_door: the bronze leaves of a portal, standing open against the jambs, their faces worked with eight-pointed stars.
import { STYLES } from '../../core/build.js';
import { box, lathe, rod, place } from '../../core/geom.js';
import './house.js';
import * as FN from '../../styles/mughal/furnish.js';
import { dbl } from '../../styles/mamluk/kit.js';

const NB = 64, TAU = Math.PI * 2;
const ELEM = STYLES['mamluk-cairo'].elements;
const rr = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** The boundary of the opening at tier fraction t (0: the square of half-width a, 1: the circle of radius r), NB points about (cx, cz). */
function boundary(cx, cz, a, r, t, bump = 0, k = 0) {
  const pts = [];
  for (let i = 0; i < NB; i++) {
    const th = i / NB * TAU, c = Math.cos(th), s = Math.sin(th), sq = a / Math.max(Math.abs(c), Math.abs(s));
    const rho = sq + (r - sq) * Math.pow(t, 0.8) - (bump && t < 1 && ((i + k * 2) % 8) < 4 ? bump : 0);
    pts.push([cx + c * rho, cz + s * rho, rho, th]);
  }
  return pts;
}
const rhoAt = (a, r, t, th) => { const c = Math.cos(th), s = Math.sin(th), sq = a / Math.max(Math.abs(c), Math.abs(s)); return sq + (r - sq) * Math.pow(t, 0.8); };
/** A star polygon (n points, outer radius r1, inner r0) in the plane through C spanned by unit vectors U, V, as double-sided triangles. */
function star(C, U, V, r0, r1, n = 8) {
  const P = (k) => { const a = k / (2 * n) * TAU, r = k % 2 ? r0 : r1; return [C[0] + (U[0] * Math.cos(a) + V[0] * Math.sin(a)) * r, C[1] + (U[1] * Math.cos(a) + V[1] * Math.sin(a)) * r, C[2] + (U[2] * Math.cos(a) + V[2] * Math.sin(a)) * r]; };
  const t = []; for (let k = 0; k < 2 * n; k++) t.push(...C, ...P(k), ...P(k + 1));
  return dbl(t);
}

function tomb(el, { bag, col, lights }) {
  const [cx, cz] = el.c, a = el.a ?? 10.5, y = el.y ?? 0, fy = y + 0.06, rand = rr(1363), Y0 = y + 22.5, Y1 = y + 30, NT = 7, rIn = 6;
  // a box on a wall face: face 'n'|'s'|'e'|'w' of the chamber, u along it from the centre (x for n/s, z for e/w), d inward from the wall
  const Bf = (f, u0, u1, y0, y1, d0, d1) => {
    if (f === 'n') return box(cx + u0, y0, cz - a + d0, cx + u1, y1, cz - a + d1);
    if (f === 's') return box(cx + u0, y0, cz + a - d1, cx + u1, y1, cz + a - d0);
    if (f === 'w') return box(cx - a + d0, y0, cz + u0, cx - a + d1, y1, cz + u1);
    return box(cx + a - d1, y0, cz + u0, cx + a - d0, y1, cz + u1);
  };
  const Pf = (f, u, d) => f === 'n' ? [cx + u, cz - a + d] : f === 's' ? [cx + u, cz + a - d] : f === 'w' ? [cx - a + d, cz + u] : [cx + a - d, cz + u];
  const nrm = { n: [0, 0, 1], s: [0, 0, -1], w: [1, 0, 0], e: [-1, 0, 0] }, tan = { n: [1, 0, 0], s: [1, 0, 0], w: [0, 0, 1], e: [0, 0, 1] };
  const door = [-9.3, -6.7], mih = 1.6, DN = [[-8.1, -5.9], [5.9, 8.1]];   // the south doorway; the mihrab's half-width; the two doors from the qibla iwan in the north wall      // the doorway in the qibla (south) wall; the mihrab's half-width
  // ── the plastered walls above the dado
  for (const f of 'nsew') bag.add('stucco', Bf(f, -a, a, y + 4.6, Y0, 0, 0.04));
  // ── the dado: panels of marble in dark frames, a field in a second marble, an inlaid star in each; a plinth and a pink course
  const kinds = ['marble_smooth', 'marble_pink', 'giallo', 'marble_smooth'];
  for (const f of 'nsew') {
    const n = 12, w = 2 * a / n;
    for (let i = 0; i < n; i++) {
      const u0 = -a + i * w, u1 = u0 + w, um = (u0 + u1) / 2;
      if (f === 's' && ((u1 > door[0] - 0.1 && u0 < door[1] + 0.1) || (u1 > -mih - 0.3 && u0 < mih + 0.3))) continue;
      if (f === 'n' && DN.some(([d0, d1]) => u1 > d0 - 0.1 && u0 < d1 + 0.1)) continue;
      bag.add('marble_dark', Bf(f, u0 + 0.03, u1 - 0.03, fy + 0.25, y + 4.4, 0, 0.05));
      bag.add(kinds[(i + (f === 'n' ? 0 : f === 's' ? 1 : f === 'w' ? 2 : 3)) % 4], Bf(f, u0 + 0.15, u1 - 0.15, fy + 0.4, y + 4.25, 0.05, 0.08));
      const [px, pz] = Pf(f, um, 0.09), N = nrm[f], T = tan[f];
      bag.add('inlay_lapis', star([px, fy + 2.3, pz], T, [0, 1, 0], 0.32, 0.68, 8));
      bag.add('gilt_bronze', star([px + N[0] * 0.012, fy + 2.3, pz + N[2] * 0.012], T, [0, 1, 0], 0.13, 0.3, 8));
    }
    if (f === 'n') { for (const [u0, u1] of [[-a, DN[0][0]], [DN[0][1], DN[1][0]], [DN[1][1], a]]) bag.add('marble_dark', Bf(f, u0, u1, fy, fy + 0.25, 0, 0.12)); } else bag.add('marble_dark', Bf(f, -a, a, fy, fy + 0.25, 0, 0.12));
    bag.add('marble_pink', Bf(f, -a, a, y + 4.4, y + 4.62, 0, 0.1));
  }
  // ── the two doorways of the north wall (from the qibla iwan's doors): a frame of dark and white marble, a lintel, the dark passage beyond
  for (const [d0, d1] of DN) {
    for (const [u0, u1, m] of [[d0 - 0.3, d0, 'marble_dark'], [d1, d1 + 0.3, 'marble_dark'], [d0 - 0.45, d0 - 0.3, 'marble_smooth'], [d1 + 0.3, d1 + 0.45, 'marble_smooth']]) bag.add(m, Bf('n', u0, u1, fy, y + 4.6, 0, 0.14));
    bag.add('marble_dark', Bf('n', d0 - 0.45, d1 + 0.45, y + 4.2, y + 4.6, 0, 0.14)); bag.add('marble_smooth', Bf('n', d0 - 0.6, d1 + 0.6, y + 4.6, y + 4.8, 0, 0.18));
    for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'marble_smooth' : 'marble_dark', Bf('n', d0 - 0.45 + k * (d1 - d0 + 0.9) / 5, d0 - 0.45 + (k + 1) * (d1 - d0 + 0.9) / 5 - 0.02, y + 4.8, y + 5.3, 0, 0.12));
  }
  // ── the windows: a deep sill, the glass behind bronze grilles; two tiers
  const win = (f, u, y0, y1, hw) => {
    bag.add('marble_smooth', Bf(f, u - hw - 0.3, u + hw + 0.3, y0 - 0.4, y0 - 0.1, 0, 0.55));
    bag.add('marble_pink', Bf(f, u - hw - 0.2, u + hw + 0.2, y1, y1 + 0.3, 0, 0.1)); for (const s of [-1, 1]) bag.add('marble_pink', Bf(f, u + s * (hw + 0.2) - 0.1, u + s * (hw + 0.2) + 0.1, y0, y1, 0, 0.1));
    bag.add('daylight', Bf(f, u - hw, u + hw, y0, y1, 0, 0.03));
    const nb = Math.round(hw * 6), nh = Math.round((y1 - y0) * 1.3);
    for (let g = 0; g <= nb; g++) bag.add('bronze', Bf(f, u - hw + g * 2 * hw / nb - 0.03, u - hw + g * 2 * hw / nb + 0.03, y0, y1, 0.03, 0.08));
    for (let g = 1; g < nh; g++) bag.add('bronze', Bf(f, u - hw, u + hw, y0 + g * (y1 - y0) / nh - 0.03, y0 + g * (y1 - y0) / nh + 0.03, 0.03, 0.08));
  };
  for (const f of 'nsew') {
    for (const u of f === 's' ? [-6, 6] : [-6, 0, 6]) win(f, u, y + 6.4, y + 10.2, 0.95);
    for (const u of [-4, 4]) win(f, u, y + 12.4, y + 16, 0.8);
  }
  // ── the Throne Verse in wood round the chamber: tall stems and heads of gilt on a dark band
  const by = y + 17.4, bh = 1.7;
  for (const f of 'nsew') {
    bag.add('wood_dark', Bf(f, -a, a, by, by + bh, 0, 0.1)); bag.add('timber', Bf(f, -a, a, by - 0.15, by, 0, 0.2)); bag.add('timber', Bf(f, -a, a, by + bh, by + bh + 0.15, 0, 0.2));
    let u = -a + 0.3, k = 0;
    while (u < a - 0.4) { const tall = (k * 7 + 3) % 5 !== 0, w = tall ? 0.09 : 0.3; bag.add('gilt_bronze', Bf(f, u, u + w, by + (tall ? 0.2 : 0.2), by + (tall ? 1.4 : 0.55), 0.1, 0.15)); if (tall && k % 3 === 0) bag.add('gilt_bronze', Bf(f, u - 0.12, u + w + 0.12, by + 1.05, by + 1.17, 0.1, 0.15)); u += w + 0.12 + (k % 4) * 0.04; k++; }
  }
  // ── the mihrab on the qibla wall: an aedicule of marble, a niche lined in dark marble, colonnettes, a pointed hood
  {
    const f = 's', D = 0.75;
    for (const s of [-1, 1]) for (let k = 0; k < 8; k++) bag.add(k % 2 ? 'marble_smooth' : 'marble_dark', Bf(f, s > 0 ? 1.15 : -1.55, s > 0 ? 1.55 : -1.15, fy + k * 0.85, fy + (k + 1) * 0.85, 0, D));
    bag.add('marble_dark', Bf(f, -1.15, 1.15, fy, y + 5.4, 0, 0.05)); bag.add('marble_pink', Bf(f, -1.55, 1.55, y + 5.45, y + 6.0, 0, D)); bag.add('marble_smooth', Bf(f, -1.15, 1.15, y + 5.4, y + 5.45, 0, D));
    bag.add('marble_smooth', Bf(f, -1.7, 1.7, y + 6.0, y + 7.4, 0, 0.14)); bag.add('marble_dark', Bf(f, -0.9, 0.9, y + 6.3, y + 7.1, 0.14, 0.18));
    bag.add('gilt_bronze', star([cx, y + 6.7, cz + a - 0.2], [1, 0, 0], [0, 1, 0], 0.25, 0.52, 8));
    for (const s of [-1, 1]) { const [px, pz] = Pf(f, s * 1.0, 0.14); bag.add('marble_column', lathe([[0.1, 0], [0.1, 4.6], [0.15, 4.75], [0.15, 4.85], [0.001, 4.85]], 10, null, px, fy, pz)); }
    const hr = 1.3 * 1.15, hc = -1.3 + hr, hta = Math.acos(-hc / hr), pts = [];
    for (let k = 0; k <= 10; k++) { const t = Math.PI - (Math.PI - hta) * k / 10; pts.push([hc + hr * Math.cos(t), y + 5.4 + hr * Math.sin(t)]); }
    for (const sg of [1, -1]) for (let k = 0; k < 10; k++) { const A = Pf(f, sg * pts[k][0], D - 0.05), Bp = Pf(f, sg * pts[k + 1][0], D - 0.05); bag.add('marble_dark', rod([A[0], pts[k][1], A[1]], [Bp[0], pts[k + 1][1], Bp[1]], 0.07, 6)); }
    col.rect([cx - 1.55, cz + a - D, cx + 1.55, cz + a], fy, y + 7.4);
  }
  // ── the cenotaphs: the sultan's (1384) at the centre, his sons' either side; marble, a carved band, a pink top; the small ones draped
  const ceno = (x, z, w, d, h, cloth) => {
    bag.add('marble_smooth', box(x - w / 2 - 0.15, fy, z - d / 2 - 0.15, x + w / 2 + 0.15, fy + 0.3, z + d / 2 + 0.15));
    bag.add('marble_smooth', box(x - w / 2, fy + 0.3, z - d / 2, x + w / 2, fy + h, z + d / 2));
    bag.add('marble_dark', box(x - w / 2 - 0.03, fy + h * 0.55, z - d / 2 - 0.03, x + w / 2 + 0.03, fy + h * 0.55 + 0.1, z + d / 2 + 0.03));
    bag.add('marble_dark', box(x - w / 2 - 0.03, fy + 0.3, z - d / 2 - 0.03, x + w / 2 + 0.03, fy + 0.38, z + d / 2 + 0.03));
    bag.add('marble_pink', box(x - w / 2 - 0.06, fy + h, z - d / 2 - 0.06, x + w / 2 + 0.06, fy + h + 0.1, z + d / 2 + 0.06));
    bag.add('marble_smooth', box(x - w / 2 + 0.2, fy + h + 0.1, z - d / 2 + 0.2, x + w / 2 - 0.2, fy + h + 0.3, z + d / 2 - 0.2));
    if (cloth) bag.add(cloth, box(x - w / 2 - 0.1, fy + h * 0.45, z - d / 2 - 0.1, x + w / 2 + 0.1, fy + h * 0.55 - 0.02, z + d / 2 + 0.1));
    for (const [s, hx] of [[-1, 'a'], [1, 'b']]) { void hx; bag.add('timber', box(x + s * (w / 2 - 0.12) - 0.04, fy + h + 0.3, z - 0.3, x + s * (w / 2 - 0.12) + 0.04, fy + h + 0.75, z + 0.3)); }
    col.rect([x - w / 2 - 0.15, z - d / 2 - 0.15, x + w / 2 + 0.15, z + d / 2 + 0.15], fy, fy + h + 0.3);
  };
  ceno(cx, cz, 1.5, 3.0, 1.25, null); ceno(cx - 5.2, cz + 0.4, 0.9, 2.0, 0.85, 'cloth_green'); ceno(cx + 5.2, cz + 0.4, 0.9, 2.0, 0.85, 'cloth_maroon');
  // the great Qur'an stand of wood inlaid with ivory stars, a cushion for the reader; a reed mat under the lectern and carpets
  { const x = cx + 7.3, z = cz - 5.2; FN.reedMat(bag, x, fy + 0.01, z, 2.2, 1.6, 0); FN.rahle(bag, x, fy + 0.012, z, Math.PI, { h: 0.95, w: 0.8 }); FN.cushion(bag, x, fy + 0.012, z - 0.9, 0.7, 0.7, 0.12, 0, 'cloth_green'); col.circle(x, z, 0.7, fy, fy + 1.0); }
  FN.carpet(bag, cx, fy + 0.012, cz - 6.2, 5.0, 2.2, 0, 'maroon'); FN.carpet(bag, cx, fy + 0.012, cz + 6.2, 5.0, 2.2, 0, 'mamluk');
  // ── the enamelled lamps on their long chains from the corbelled zone
  const lampAt = [[-3.3, -9.0], [3.3, -9.0], [-3.3, 9.0], [3.3, 9.0], [-9.0, -3.3], [-9.0, 3.3], [9.0, -3.3], [9.0, 3.3]];
  lampAt.forEach(([dx, dz], i) => {
    const th = (Math.atan2(dz, dx) + TAU) % TAU, rho = Math.hypot(dx, dz); let top = Y0;
    for (let k = 0; k < NT; k++) if (rho >= rhoAt(a, rIn, (k + 1) / NT, th)) { top = Y0 + k * (Y1 - Y0) / NT; break; }
    FN.mosqueLamp(bag, i % 4 === 0 ? lights : null, cx + dx, y + 8.8, cz + dz, top, { k: 1.5, enamel: true, glow: 7, reach: 18 });
  });
  lights.push({ at: [cx, y + 7, cz], color: '#fff0d0', intensity: 4, distance: 22 });
  // ── the zone of transition: seven tiers of wooden cells stepping in from the square to the circle of the dome
  const hT = (Y1 - Y0) / NT;
  let prev = boundary(cx, cz, a, rIn, 0);
  for (let k = 0; k < NT; k++) {
    const cur = boundary(cx, cz, a, rIn, (k + 1) / NT, 0.28, k), yk = Y0 + k * hT, U = [], Rz = [];
    for (let i = 0; i < NB; i++) {
      const j = (i + 1) % NB;
      U.push(...[prev[i], prev[j], cur[j]].flatMap(([x, z]) => [x, yk, z]), ...[prev[i], cur[j], cur[i]].flatMap(([x, z]) => [x, yk, z]));
      Rz.push(cur[i][0], yk, cur[i][1], cur[j][0], yk, cur[j][1], cur[j][0], yk + hT, cur[j][1], cur[i][0], yk, cur[i][1], cur[j][0], yk + hT, cur[j][1], cur[i][0], yk + hT, cur[i][1]);
    }
    bag.add('timber', dbl(U)); bag.add(k % 2 ? 'cedar' : 'wood_painted', dbl(Rz));
    // a gilt edge along each tier's lip, the stalactite cells' fronts
    for (let i = 0; i < NB; i += 2) { const j = (i + 1) % NB; bag.add('gilt_bronze', rod([cur[i][0], yk + 0.05, cur[i][1]], [cur[j][0], yk + 0.05, cur[j][1]], 0.035, 3)); }
    prev = cur;
  }
  void rand;
}

function dome(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, y = el.y ?? 0, a = el.a ?? 10.5, dr = el.drum ?? r * 0.5, rIn = 6, SH = y + dr * 0.6;
  const S = 'limestone_yellow';
  // the stone cap over the square, the circle of the opening in it (the top face, then the four sides)
  { const c = boundary(cx, cz, 0, rIn, 1), s = boundary(cx, cz, r * 1.1, rIn, 0), T = [];
    for (let i = 0; i < NB; i++) { const j = (i + 1) % NB; T.push(c[i][0], SH, c[i][1], s[i][0], SH, s[i][1], s[j][0], SH, s[j][1], c[i][0], SH, c[i][1], s[j][0], SH, s[j][1], c[j][0], SH, c[j][1]); }
    bag.add(S, dbl(T));
    const q = r * 1.1;
    bag.add(S, box(cx - q, y, cz - q, cx - q + 0.02, SH, cz + q)); bag.add(S, box(cx + q - 0.02, y, cz - q, cx + q, SH, cz + q)); bag.add(S, box(cx - q, y, cz - q, cx + q, SH, cz - q + 0.02)); bag.add(S, box(cx - q, y, cz + q - 0.02, cx + q, SH, cz + q));
  }
  const DH = dr * 0.7, yT = y + dr + DH, q = r * 1.1;        // the drum rises 3.7 m; the dome starts at yT
  bag.add(S, lathe([[r * 1.08, 0], [r * 1.02, dr * 0.4]], 32, null, cx, SH, cz));
  bag.add(S, lathe([[r, 0], [r, DH]], 32, null, cx, y + dr, cz));
  // the zone of transition seen from outside: at each corner of the cap stepped blocks climbing toward the drum (the stepped pyramids of the Mamluk domes)
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) [[0, 2.6], [0.7, 1.4], [1.2, 0.8]].forEach(([d, w], k) => {
    const px = cx + sx * (q - d), pz = cz + sz * (q - d), y0 = SH + k * 0.9;
    bag.add(S, box(Math.min(px, px - sx * w), y0, Math.min(pz, pz - sz * w), Math.max(px, px - sx * w), y0 + 0.9, Math.max(pz, pz - sz * w)));
  });
  // the sixteen windows of the drum: dark openings with pointed heads in frames
  for (let k = 0; k < 16; k++) { const th = (k + 0.5) / 16 * TAU, R = r * 1.0 + 0.02, yaw = -(th + Math.PI / 2);
    bag.add('opening', place(box(-0.45, dr * 0.12, -0.05, 0.45, dr * 0.34, 0.05), cx + Math.cos(th) * R, y + dr, cz + Math.sin(th) * R, yaw));
    bag.add(S, place(box(-0.6, dr * 0.34, -0.06, 0.6, dr * 0.34 + 0.18, 0.07), cx + Math.cos(th) * R, y + dr, cz + Math.sin(th) * R, yaw));
    bag.add(S, place(box(-0.75, dr * 0.12 - 0.2, -0.05, -0.55, dr * 0.34 + 0.18, 0.07), cx + Math.cos(th) * R, y + dr, cz + Math.sin(th) * R, yaw));
    bag.add(S, place(box(0.55, dr * 0.12 - 0.2, -0.05, 0.75, dr * 0.34 + 0.18, 0.07), cx + Math.cos(th) * R, y + dr, cz + Math.sin(th) * R, yaw)); }
  // a band of inscription (stems in relief on a carved ground) above the windows, and a stalactite cornice at the drum's head
  bag.add('stucco', lathe([[r + 0.04, 0], [r + 0.04, 0.8]], 32, null, cx, y + dr + 2.2, cz));
  bag.add(S, lathe([[r + 0.04, 0.15], [r + 0.04, 0.65]], 96, (t) => 1 + 0.012 * Math.sign(Math.cos(t * 48 + 0.4)) * (Math.cos(t * 7) > -0.6 ? 1 : 0), cx, y + dr + 2.2, cz));
  for (let k = 0; k < 2; k++) { const n = 44 - k * 4; for (let i = 0; i < n; i++) { const th = (i + (k % 2) * 0.5) / n * TAU, w = r * Math.PI / n * 0.8; bag.add(S, place(box(0, 0, -w, 0.6 - k * 0.2, 0.3, w), cx + Math.cos(th) * (r - 0.02), yT - 0.3 * (k + 1), cz + Math.sin(th) * (r - 0.02), -th)); } }
  bag.add(S, lathe([[r * 1.06, 0], [r * 1.06, 0.2], [r * 0.99, 0.2], [r * 0.99, 0]], 32, null, cx, yT - 0.05, cz));
  // the dome: an ogival (pointed, egg-like) profile fluted all round by sixteen ribs in relief that gather toward the crown
  const fl = (t) => 1 + 0.018 * Math.cos(t * 16);
  const PR = [[0.99, 0], [1.03, 0.22], [1.0, 0.5], [0.82, 0.83], [0.58, 1.1], [0.3, 1.32], [0.1, 1.48], [0.001, 1.58]];
  bag.add('stucco', lathe(PR.map(([a2, b2]) => [r * a2, r * b2]), 64, fl, cx, yT, cz));
  for (let m = 0; m < 16; m++) { const th = m / 16 * TAU; let prevp = null;
    for (const [rr, hh] of PR.slice(1, -1)) { const p = [cx + Math.cos(th) * r * rr * 1.02, yT + r * hh, cz + Math.sin(th) * r * rr * 1.02]; if (prevp) bag.add(S, rod(prevp, p, 0.07, 4)); prevp = p; } }
  const yt = yT + r * 1.58;
  bag.add('bronze', lathe([[0.2, 0], [0.5, 0.5], [0.3, 0.75], [0.5, 1.1], [0.06, 1.7], [0.05, 2.3], [0.001, 2.6]], 10, null, cx, yt - 0.35, cz));
  bag.add('bronze', lathe([[0.001, 0], [0.18, 0.12], [0.001, 0.3]], 8, null, cx, yt + 2.3, cz));
  col.circle(cx, cz, r * 1.1, y, y + dr);
  // the inside: the drum with its windows, the ogival inner dome ribbed in gilt
  const yd = y + 4.2;
  bag.add('stucco', dbl(Array.from(lathe([[rIn, 0], [rIn, yd - y]], 32, null, cx, y, cz).attributes.position.array)));
  for (let k = 0; k < 16; k++) { const th = (k + 0.5) / 16 * TAU, yaw = -(th + Math.PI / 2);
    bag.add('stucco_warm', place(box(-0.55, 1.0, -0.03, 0.55, 3.8, 0.03), cx + Math.cos(th) * (rIn - 0.03), y, cz + Math.sin(th) * (rIn - 0.03), yaw));
    bag.add('daylight', place(box(-0.4, 1.2, -0.02, 0.4, 3.5, 0.02), cx + Math.cos(th) * (rIn - 0.07), y, cz + Math.sin(th) * (rIn - 0.07), yaw)); }
  const prof = [[rIn, 0], [rIn - 0.05, 1.2], [rIn - 0.5, 3.2], [rIn - 1.4, 5.2], [rIn - 2.8, 7.0], [rIn - 4.4, 8.3], [0.001, 9.2]];
  bag.add('stucco', dbl(Array.from(lathe(prof, 32, null, cx, yd, cz).attributes.position.array)));
  for (let m = 0; m < 16; m++) { const th = m / 16 * TAU; for (let k = 0; k + 1 < prof.length - 1; k++) { const p = prof[k], q = prof[k + 1]; bag.add('gilt_bronze', rod([cx + Math.cos(th) * (p[0] - 0.03), yd + p[1], cz + Math.sin(th) * (p[0] - 0.03)], [cx + Math.cos(th) * (q[0] - 0.03), yd + q[1], cz + Math.sin(th) * (q[0] - 0.03)], 0.04, 4)); } }
  void a;
}

/** hasan_door: { rect, face ('n'|'s'), m (the door's centre along the face), y } — the star-worked faces of the two open bronze leaves. */
function hasanDoor(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, f = el.face, m = el.m, y = el.y ?? 0, len = 1.4, hh = 5.2;
  const za = f === 'n' ? z0 : z1 - len, zb = za + len, zm = (za + zb) / 2;
  for (const s of [-1, 1]) {
    const xf = m + s * 1.3, N = [-s, 0, 0], inx = (d) => xf + N[0] * d;     // the face looks into the passage
    const sl = (u0, u1, y0, y1, d0, d1) => box(Math.min(inx(d0), inx(d1)), y0, u0, Math.max(inx(d0), inx(d1)), y1, u1);
    for (const [u0, u1, y0, y1] of [[za + 0.04, za + 0.12, y + 0.1, y + hh - 0.1], [zb - 0.12, zb - 0.04, y + 0.1, y + hh - 0.1], [za + 0.04, zb - 0.04, y + 0.1, y + 0.18], [za + 0.04, zb - 0.04, y + hh - 0.18, y + hh - 0.1], [za + 0.04, zb - 0.04, y + 2.0, y + 2.08]]) bag.add('gilt_bronze', sl(u0, u1, y0, y1, 0.0, 0.04));
    for (const yy of [1.05, 3.05, 4.15]) { bag.add('iron', star([inx(0.03), y + yy, zm], [0, 0, 1], [0, 1, 0], 0.3, 0.6, 8)); bag.add('gilt_bronze', star([inx(0.045), y + yy, zm], [0, 0, 1], [0, 1, 0], 0.14, 0.3, 8)); }
    for (let i = 0; i < 4; i++) for (const yy of [0.5, 2.55, 3.6, 4.75]) bag.add('gilt_bronze', sl(za + 0.2 + i * 0.33 - 0.02, za + 0.2 + i * 0.33 + 0.02, y + yy - 0.02, y + yy + 0.02, 0, 0.05));
  }
  void x0; void x1;
}

/** hasan_wear: { m, z0, z1, y } — the way to the portal, paved in dark marble slabs, its middle worn smooth and pale where feet went (docs §19.4); 3 cm proud, no collision. */
function hasanWear(el, { bag }) {
  const { m, z0, z1 } = el, y = el.y ?? 0, n = Math.round((z1 - z0) / 1.6), dz = (z1 - z0) / n;
  for (let k = 0; k < n; k++) {
    const a = z0 + k * dz, hk = (Math.imul(k + 7, 2654435761) >>> 0) / 4294967296, w = 1.5 + 0.25 * hk;
    bag.add('marble_dark', box(m - 1.9, y, a + 0.03, m + 1.9, y + 0.02, a + dz - 0.03));
    // the worn track: wider and paler the nearer the door, a little off the middle by slab
    const t = (k + 1) / n, ww = 0.5 + 0.9 * t, off = (hk - 0.5) * 0.4;
    bag.add('marble_smooth', box(m + off - ww / 2, y + 0.02, a + 0.08, m + off + ww / 2, y + 0.032, a + dz - 0.08));
    void w;
  }
  // the threshold: a long pale dish of a step where the leaves meet the ground
  bag.add('marble_smooth', box(m - 1.5, y, z1 - 0.02, m + 1.5, y + 0.035, z1 + 0.5));
}
ELEM.hasan_wear = hasanWear;
ELEM.hasan_tomb = tomb; ELEM.hasan_dome = dome; ELEM.hasan_door = hasanDoor;
