// Marinid vocabulary (docs/settlements/fez.md §4): zellij tilework, carved stucco, carved cedar, green-glazed roofs.
// Faces are the nasrid helpers' `face(ax, at, n)` (n points into the room or the court); everything adds to a GeoBag.
import { box, fromTriangles, rod, lathe, disc } from '../../core/geom.js';
import { face, holedWall, archHead, dbl } from '../nasrid/halls.js';
export { face, holedWall, archHead, dbl };

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const q4 = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
const SC = 'stucco_cream', SW = 'stucco_warm';
/** A flat polygon on face f at d off it (counter-clockwise in (u, v) faces into the room). */
export function poly(out, f, pts, d) {
  const cu = pts.reduce((s, p) => s + p[0], 0) / pts.length, cv = pts.reduce((s, p) => s + p[1], 0) / pts.length, C = f.P(cu, cv, d);
  const rev = f.ax === 'z' ? f.n < 0 : f.n > 0;
  for (let i = 0; i < pts.length; i++) { const A = f.P(...pts[i], d), B = f.P(...pts[(i + 1) % pts.length], d); rev ? out.push(...C, ...B, ...A) : out.push(...C, ...A, ...B); }
}
const ZC = ['glaze_blue', 'glaze_green', 'glaze_yellow', 'marble_dark'];
/**
 * Zellij: a field of eight-pointed stars cut from single-coloured tiles (green, cobalt, honey, manganese black) on a white
 * ground, small crosses where four stars meet, a plain tile border above and below. free(u, v0, v1, m) tells where a hole is.
 */
export function zellij(bag, f, u0, u1, v0, v1, free = () => true, o = {}) {
  const H = v1 - v0; if (H < 0.25) return;
  const rows = Math.max(1, Math.round(H / (o.cell ?? 0.4))), s = H / rows, n = Math.max(1, Math.floor((u1 - u0) / s)), m = ((u1 - u0) - n * s) / 2, T = ZC.map(() => []), X = [[], []];
  const star = (cu, cv, R) => { const r = R * 0.6, out = []; for (let k = 0; k < 16; k++) { const t = k * Math.PI / 8 + Math.PI / 8, rr = k % 2 ? r : R; out.push([cu + Math.cos(t) * rr, cv + Math.sin(t) * rr]); } return out; };
  const pal = o.pal ?? [1, 0, 2, 0];
  for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
    const cu = u0 + m + (i + 0.5) * s, cv = v0 + (j + 0.5) * s;
    if (free(cu, cv - s / 2, cv + s / 2, s / 2)) poly(T[pal[(i + j * 2) % pal.length]], f, star(cu, cv, s * 0.42), 0.04);
    if (i > 0 && j > 0 && free(cu - s / 2, cv - s / 2 - 0.1, cv - s / 2 + 0.1, 0.12)) {
      const pu = cu - s / 2, pv = cv - s / 2, a = s * 0.14, w = s * 0.05;
      poly(X[(i + j) % 2], f, [[pu - a, pv], [pu - w, pv - w], [pu, pv - a], [pu + w, pv - w], [pu + a, pv], [pu + w, pv + w], [pu, pv + a], [pu - w, pv + w]], 0.04);
    }
  }
  T.forEach((t, k) => t.length && bag.add(ZC[k], fromTriangles(t)));
  if (X[0].length) bag.add('glaze_green', fromTriangles(X[0])); if (X[1].length) bag.add('glaze_blue', fromTriangles(X[1]));
}
/** A dado: a white tile ground (holes cut), its zellij field, a border of turquoise and a dark band, a ribbon of script tile above. */
export function dado(bag, f, u0, u1, y, h, holes = [], o = {}) {
  const a = u0 + 0.03, b = u1 - 0.03, alongX = f.alongX;
  holedWall(bag, null, 'glaze_white', f.R(0, 0.03, a, b), y + 0.02, y + h, holes, alongX);
  holedWall(bag, null, 'tile_turquoise', f.R(0, 0.045, a, b), y + 0.02, y + 0.13, holes, alongX);
  holedWall(bag, null, 'tile_turquoise', f.R(0, 0.045, a, b), y + h - 0.13, y + h, holes, alongX);
  const free = (u, v0, v1, m = 0.3) => !holes.some((q) => u > q[0] - m && u < q[1] + m && v1 > q[2] && v0 < q[3]);
  zellij(bag, f, a, b, y + 0.13, y + h - 0.13, free, o);
  // the epigraphic ribbon: cream script on dark glazed tile (sgraffito), along the dado's top
  if (o.ribbon !== false) {
    const yb = y + h, hs = holes.filter((q) => q[3] > yb - 0.1);
    holedWall(bag, null, 'tile_lapis', f.R(0, 0.035, a, b), yb, yb + 0.42, hs, alongX);
    let s = a; for (const q of [...hs].sort((p, r) => p[0] - r[0]).concat([[b, b]])) { if (q[0] - s > 0.4) script(bag, f, s + 0.05, q[0] - 0.05, yb + 0.05, 0.32, Math.round(s * 5)); s = Math.max(s, q[1]); }
  }
}
/** The cheap dado: a tile field in two bands (the mosaic material stands for the zellij pattern). */
export function dadoFlat(bag, f, u0, u1, y, h, holes = []) {
  const a = u0 + 0.03, b = u1 - 0.03, alongX = f.alongX;
  holedWall(bag, null, 'tile_turquoise', f.R(0, 0.035, a, b), y + 0.02, y + h - 0.2, holes, alongX);
  holedWall(bag, null, 'tile_cream', f.R(0, 0.035, a, b), y + h - 0.2, y + h, holes.filter((q) => q[3] > y + h - 0.2), alongX);
}
function script(bag, f, u0, u1, y, h, seed) {
  const n = Math.floor((u1 - u0) / 0.12);
  for (let i = 0; i < n; i++) {
    const u = u0 + 0.03 + i * (u1 - u0 - 0.06) / n, k = (i * 7 + seed * 3) % 5, top = k === 0 ? h * 0.4 : k === 3 ? h * 0.62 : h * 0.92;
    const r = f.R(0.035, 0.05, u - 0.02, u + 0.02); bag.add('tile_cream', box(r[0], y + h * 0.05, r[1], r[2], y + top, r[3]));
  }
}
/**
 * Carved stucco on a face from y0 to y1: a ground of cream plaster, panels of darj wa ktaf (a lattice of palmette-ringed
 * lozenges) as alternating relief lozenges, framed by plain bands; the upper edge a cornice of small niches (muqarnas cells).
 */
export function stucco(bag, f, u0, u1, y0, y1, holes = [], o = {}) {
  const a = u0 + 0.03, b = u1 - 0.03, alongX = f.alongX;
  holedWall(bag, null, o.mat ?? SC, f.R(0, 0.03, a, b), y0, y1, holes, alongX);
  if (o.panels === false) return;
  const free = (u, v0, v1, m = 0.25) => !holes.some((q) => u > q[0] - m && u < q[1] + m && v1 > q[2] && v0 < q[3]);
  const H = y1 - y0 - (o.cornice === false ? 0.2 : 0.7), s = o.cell ?? 0.34;
  if (H > 0.5) {
    const rows = Math.max(1, Math.floor(H / s)), ss = H / rows, n = Math.max(1, Math.floor((b - a) / ss)), m = ((b - a) - n * ss) / 2, T = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
      const cu = a + m + (i + 0.5) * ss, cv = y0 + 0.1 + (j + 0.5) * ss;
      if (!free(cu, cv - ss / 2, cv + ss / 2, ss / 2)) continue;
      const r = ss * 0.4;
      poly(T, f, [[cu - r, cv], [cu, cv - r], [cu + r, cv], [cu, cv + r]], 0.055);
      if ((i + j) % 2 === 0) { const r2 = r * 0.5; poly(T, f, [[cu - r2, cv], [cu, cv - r2], [cu + r2, cv], [cu, cv + r2]], 0.075); }
    }
    if (T.length) bag.add(SW, fromTriangles(T));
  }
  if (o.cornice !== false && y1 - y0 > 1.0) {
    // a band of small niches under the cornice
    const yb = y1 - 0.5, hs = holes.filter((q) => q[3] > yb - 0.05);
    holedWall(bag, null, SW, f.R(0.02, 0.07, a, b), yb, yb + 0.22, hs, alongX);
    const n = Math.floor((b - a) / 0.3), T = [];
    for (let i = 0; i < n; i++) { const u = a + 0.15 + i * (b - a - 0.3) / n; if (!free(u, yb, yb + 0.2, 0.1)) continue; const r = f.R(0.07, 0.11, u - 0.06, u + 0.06); bag.add(SC, box(r[0], yb + 0.02, r[1], r[2], yb + 0.2, r[3])); }
    holedWall(bag, null, SC, f.R(0.02, 0.12, a, b), y1 - 0.22, y1, hs, alongX);
  }
}
/**
 * A canopy of carved cedar: a row of corbels on the face, a deep lintel beam, a boarded soffit, and a pent roof of green
 * tiles above it, from u0 to u1 at height y (the beam's underside), projecting `out` into the room/court side of f.
 */
export function canopy(bag, f, u0, u1, y, out = 0.9, o = {}) {
  const n = Math.max(2, Math.round((u1 - u0) / 0.55)), cw = 0.1;
  for (let i = 0; i <= n; i++) {
    const u = u0 + (u1 - u0) * i / n;
    const rA = f.R(0, 0.1, u - cw, u + cw); bag.add('cedar', box(rA[0], y - 0.5, rA[1], rA[2], y - 0.05, rA[3]));
    const rB = f.R(0.1, out * 0.65, u - cw * 0.7, u + cw * 0.7); bag.add('cedar', box(rB[0], y - 0.08, rB[1], rB[2], y + 0.02, rB[3]));
    const rC = f.R(0.1, out * 0.4, u - cw * 0.7, u + cw * 0.7); bag.add('cedar', box(rC[0], y - 0.32, rC[1], rC[2], y - 0.2, rC[3]));
  }
  const L = f.R(0.05, out, u0 - 0.05, u1 + 0.05);
  bag.add('wood_dark', box(L[0], y, L[1], L[2], y + 0.1, L[3]));
  const bm = f.R(out - 0.18, out, u0 - 0.05, u1 + 0.05); bag.add('cedar', box(bm[0], y - 0.22, bm[1], bm[2], y + 0.1, bm[3]));
  // the pent roof: a sloping sheet of green tiles from the wall's face down to the beam, with a ridge board
  const t = [], rise = o.rise ?? 0.55, P = (u, d, yy) => f.P(u, yy, d);
  q4(t, P(u0 - 0.1, out - 0.02, y + 0.1), P(u1 + 0.1, out - 0.02, y + 0.1), P(u1 + 0.1, 0.05, y + 0.1 + rise), P(u0 - 0.1, 0.05, y + 0.1 + rise));
  const rev = f.ax === 'z' ? f.n > 0 : f.n < 0; // keep the tiles facing up whichever way the face looks
  bag.add('tile_green', dbl(t)); void rev;
  for (const u of [u0 - 0.1, u1 + 0.1]) { const g = []; g.push(...P(u, out - 0.02, y + 0.1), ...P(u, 0.05, y + 0.1), ...P(u, 0.05, y + 0.1 + rise)); bag.add(SW, dbl(g)); }
}
/** A screen of turned cedar spindles (mashrabiya) between two posts: from u0 to u1, y0 to y1, at d on face f. */
export function screen(bag, col, f, u0, u1, y0, y1, d = 0.1, o = {}) {
  const r0 = f.R(d - 0.04, d + 0.04, u0, u1);
  bag.add('cedar', box(r0[0], y0, r0[1], r0[2], y0 + 0.07, r0[3])); bag.add('cedar', box(r0[0], y1 - 0.07, r0[1], r0[2], y1, r0[3]));
  const mid = y0 + (y1 - y0) * 0.55, rm = f.R(d - 0.035, d + 0.035, u0, u1); bag.add('cedar', box(rm[0], mid, rm[1], rm[2], mid + 0.05, rm[3]));
  const n = Math.floor((u1 - u0) / (o.gap ?? 0.13));
  for (let i = 1; i < n; i++) { const u = u0 + (u1 - u0) * i / n, r = f.R(d - 0.022, d + 0.022, u - 0.022, u + 0.022); bag.add('cedar', box(r[0], y0 + 0.07, r[1], r[2], y1 - 0.07, r[3])); }
  if (col && o.solid !== false) { const rr = f.R(d - 0.05, d + 0.05, u0, u1); col.rect(rr, y0, y1); }
}
/** A cedar door (two leaves, studded, carved panels) in an opening of a face, with a bronze knocker. */
export function door(bag, f, u0, u1, y, h, d = 0.04, o = {}) {
  const w = u1 - u0, uc = (u0 + u1) / 2;
  for (const [a, b] of [[u0 + 0.04, uc - 0.01], [uc + 0.01, u1 - 0.04]]) {
    const r = f.R(d, d + 0.07, a, b); bag.add(o.mat ?? 'cedar', box(r[0], y, r[1], r[2], y + h - 0.1, r[3]));
    const p = f.R(d + 0.07, d + 0.1, a + 0.08, b - 0.08);
    bag.add('wood_dark', box(p[0], y + 0.15, p[1], p[2], y + h * 0.45, p[3])); bag.add('wood_dark', box(p[0], y + h * 0.5, p[1], p[2], y + h - 0.3, p[3]));
  }
  const kr = f.R(d + 0.07, d + 0.12, uc - 0.04, uc + 0.04); bag.add('bronze', box(kr[0], y + 1.0, kr[1], kr[2], y + 1.08, kr[3]));
  if (o.studs !== false) for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const u = uc + s * (0.12 + i * (w / 2 - 0.2) / 6), r = f.R(d + 0.07, d + 0.1, u - 0.015, u + 0.015); bag.add('iron', box(r[0], y + 0.5, r[1], r[2], y + 0.53, r[3])); }
}
/** A small fountain basin (octagon-ish, round) with a jet at (x, z) on y; r its radius; marble rim, zellij-green inside. */
export function basin(bag, col, x, z, y, r = 0.9, o = {}) {
  bag.add('marble_smooth', lathe([[r + 0.14, 0], [r + 0.14, 0.28], [r + 0.02, 0.32], [r, 0.22], [0.001, 0.22]], 16, null, x, y, z));
  bag.add('glaze_green', lathe([[r, 0.2], [r - 0.01, 0.03], [0.001, 0.03]], 16, null, x, y, z));
  bag.add('water', disc(r - 0.02, y + 0.2, 16, x, z));
  bag.add('marble_smooth', lathe([[0.001, 0], [0.12, 0], [0.08, 0.1], [0.05, 0.4], [0.001, 0.46]], 10, null, x, y + 0.22, z));
  bag.add('water_jet', rod([x, y + 0.64, z], [x, y + 0.95, z], 0.014, 4));
  col.circle(x, z, r + 0.16, y, y + 0.3);
}
/** A pitched roof of green tiles on a rectangle: ridge along x or z, eaves overhanging by `e`, gable ends of plaster. */
export function gable(bag, r, y, h, e = 0.45, axis = 'x', o = {}) {
  const [x0, z0, x1, z1] = [r[0] - (axis === 'z' ? 0.05 : e), r[1] - (axis === 'x' ? 0.05 : e), r[2] + (axis === 'z' ? 0.05 : e), r[3] + (axis === 'x' ? 0.05 : e)], t = [];
  if (axis === 'x') { const zm = (z0 + z1) / 2; q4(t, [x0, y, z0], [x1, y, z0], [x1, y + h, zm], [x0, y + h, zm]); q4(t, [x1, y, z1], [x0, y, z1], [x0, y + h, zm], [x1, y + h, zm]); }
  else { const xm = (x0 + x1) / 2; q4(t, [x0, y, z1], [x0, y, z0], [xm, y + h, z0], [xm, y + h, z1]); q4(t, [x1, y, z0], [x1, y, z1], [xm, y + h, z1], [xm, y + h, z0]); }
  bag.add(o.mat ?? 'tile_green', dbl(t));
  if (o.ends !== false) {
    const g = [];
    if (axis === 'x') { const zm = (z0 + z1) / 2; for (const x of [r[0], r[2]]) g.push(x, y, r[1], x, y, r[3], x, y + h * (1 - 0.05), zm); }
    else { const xm = (x0 + x1) / 2; for (const z of [r[1], r[3]]) g.push(r[0], y, z, r[2], y, z, xm, y + h * 0.95, z); }
    bag.add('plaster_white', dbl(g));
  }
}
export { rod, lathe, box, fromTriangles, disc };
