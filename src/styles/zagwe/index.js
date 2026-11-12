// Zagwe architecture of Lalibela (c. 1200; docs/settlements/lalibela.md §4): churches cut down
// into the red tuff, standing free in their pits — Bete Giyorgis as a Greek cross in three
// receding tiers, its roof carved with nested crosses; Bete Medhane Alem as a basilica ringed by
// square pillars under its roof; the others in Aksumite manner, the walls in recessed and
// projecting courses with beam ends; the pits' and trenches' rock walls; round stone houses with
// conical thatch.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';
import { orientBy, piercedSlab } from '../sahel/index.js';
import { hut } from './hut.js';
import { umbrella, procCross } from './liturgy.js';
import { rod } from './hut.js';
import { yardEl, terraceEl, courtEl, clothPile, lampEl } from './compound.js';

const TU = 'tuff_red', TH = 'tuff_hewn';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function solid(bag, col, mat, r, y0, y1) { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); col.floor(r, y1); }
/**
 * An Aksumite window on a face (centre c [x, z], sill at y; u the face's direction, n its outward
 * normal; w × h): the dark opening framed by squared beams standing proud of the wall — jambs,
 * sill and lintel running past them — with the ends of the cross beams, the "monkey heads",
 * jutting at the corners; a transom with its own heads in a tall window (Met: Aksumite windows
 * "framed with rounded cross beams, nicknamed 'monkey heads'"; carried on at Lalibela).
 */
function aksWindow(bag, c, y, u, n, w, h, open = false) {
  const P = (a, d) => [c[0] + u[0] * a + n[0] * d, c[1] + u[1] * a + n[1] * d];
  const bar = (a0, a1, y0, y1, d0, d1) => bag.add(TH, orientedBox(P(a0, (d0 + d1) / 2), P(a1, (d0 + d1) / 2), d1 - d0, y0, y1));
  if (!open) bag.add('opening', orientedBox(P(-w / 2, -0.1), P(w / 2, -0.1), 0.26, y, y + h));
  const fw = 0.14, ext = 0.28;
  for (const sg of [-1, 1]) bar(sg * (w / 2) - (sg < 0 ? fw : 0), sg * (w / 2) + (sg > 0 ? fw : 0), y, y + h, -0.24, 0.09);          // jambs
  for (const yy of h > 1.2 ? [y - fw, y + h, y + h * 0.55 - fw / 2] : [y - fw, y + h]) {
    const mid = yy !== y - fw && yy !== y + h;
    bar(-w / 2 - (mid ? 0 : ext), w / 2 + (mid ? 0 : ext), yy, yy + fw, -0.24, mid ? 0.07 : 0.11);
    for (const sg of [-1, 1]) bar(sg * (w / 2 + fw / 2) - 0.09, sg * (w / 2 + fw / 2) + 0.09, yy - 0.02, yy + fw + 0.02, 0.0, 0.26);   // the monkey heads
  }
}
/** A window with a pointed (ogee) head, as Bete Giyorgis' upper row: the dark opening, a raised frame following it. */
function ogeeWindow(bag, c, y, u, n, w, h) {
  const hr = w * 0.75, N = 8, open = [], frame = [];
  const V = (a, yy, d) => [c[0] + u[0] * a + n[0] * d, yy, c[1] + u[1] * a + n[1] * d];
  const prof = [];
  for (let k = 0; k <= N; k++) { const t = k / N, a = -w / 2 + w * t, f = Math.abs(a) / (w / 2); prof.push([a, y + h + hr * (1 - f) * (1 - f) * (1 + 0.6 * f)]); }
  for (let k = 0; k < N; k++) {
    const [a0, y0] = prof[k], [a1, y1] = prof[k + 1];
    open.push(...V(a0, y, 0.03), ...V(a1, y, 0.03), ...V(a1, y1, 0.03), ...V(a0, y, 0.03), ...V(a1, y1, 0.03), ...V(a0, y0, 0.03));
    beamTris(frame, V(a0, y0, 0.04), V(a1, y1, 0.04), 0.05, 0.13);
  }
  bag.add('opening', fromTriangles(orientOut(open, n)));
  for (const sg of [-1, 1]) { const t = []; beamTris(t, V(sg * (w / 2 + 0.07) - 0.07, y - 0.12, 0.04), V(sg * (w / 2 + 0.07) + 0.07, y - 0.12, 0.04), 0.05, h + 0.12); frame.push(...t); }
  { const t = []; beamTris(t, V(-w / 2 - 0.25, y - 0.14, 0.05), V(w / 2 + 0.25, y - 0.14, 0.05), 0.06, 0.14); frame.push(...t); }
  bag.add(TH, fromTriangles(frame));
}
const orientOut = (tris, n) => { for (let i = 0; i < tris.length; i += 9) { const ux = tris[i + 3] - tris[i], uy = tris[i + 4] - tris[i + 1], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vy = tris[i + 7] - tris[i + 1], vz = tris[i + 8] - tris[i + 2]; const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx; if (nx * n[0] + nz * n[1] < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; } } return tris; };
/** Windows along the four faces of a box [x0, z0, x1, z1] at height y (n per side, w × h, every `step` m), Aksumite or ogee. */
function openings(bag, r, y, h, w, step, skipMid = false, kind = 'aks') {
  const [x0, z0, x1, z1] = r;
  for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, -1], [x0, z1, x1, z1, 0, 1], [x0, z0, x0, z1, -1, 0], [x1, z0, x1, z1, 1, 0]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.floor(L / step)), ux = (bx - ax) / L, uz = (bz - az) / L;
    for (let i = 0; i < n; i++) {
      if (skipMid && n % 2 === 1 && i === (n - 1) / 2) continue;
      const s = (i + 0.5) * L / n, c = [ax + ux * s, az + uz * s];
      (kind === 'ogee' ? ogeeWindow : aksWindow)(bag, c, y, [ux, uz], [nx, nz], w, h);
    }
  }
}

/** rock_cut: the rock walls of a pit or trench { a, b, y0 (floor), th }: hewn tuff from the floor up to the ground. */
function rockCut(el, { bag, col }) {
  const t = []; beamTris(t, [el.a[0], el.y0, el.a[1]], [el.b[0], el.y0, el.b[1]], (el.th ?? 1.6) / 2, -el.y0 + (el.top ?? 0));
  bag.add(TU, fromTriangles(t)); col.segment(el.a, el.b, el.th ?? 1.6, el.y0, el.top ?? 0);
  if (el.n) hewnFace(bag, el);
}
// The tuff's beds, level across the whole site (docs/settlements/lalibela.md §12): [y0, y1] below the
// precinct's ground, each a layer a little paler and finer than the rock round it.
const BEDS = [[-1.55, -1.05], [-2.6, -2.42], [-4.3, -3.55], [-5.9, -5.7], [-7.35, -6.85], [-9.0, -8.8], [-10.4, -9.6], [-11.8, -11.5]];
/**
 * The face of a cut as the masons left it (§12): the beds of the tuff showing as bands, and every 1.1 m
 * down the thin ledge of a working level, where the cutting of one lift stopped and the next began —
 * on the face toward the cut (el.n, the unit into the cut), clipped to the face's height.
 */
function hewnFace(bag, el) {
  const th = (el.th ?? 1.6) / 2, [nx, nz] = el.n, A = [el.a[0] + nx * th, el.a[1] + nz * th], B = [el.b[0] + nx * th, el.b[1] + nz * th];
  const lo = el.y0 + 0.25, hi = (el.top ?? 0) - 0.2, beds = [], ledges = [];
  const strip = (out, y0, y1, e) => { const a = Math.max(lo, y0), b = Math.min(hi, y1); if (b - a < 0.03) return; beamTris(out, [A[0], a, A[1]], [B[0], a, B[1]], e, b - a); };
  for (const [y0, y1] of BEDS) strip(beds, y0, y1, 0.014);
  for (let y = -1.1; y > el.y0; y -= 1.1) strip(ledges, y - 0.05, y, 0.035);
  // weathering: the dark streaks the rain draws down the face from the rim and from each ledge's lip, patches of pale lichen on the
  // sun's faces, damp at the foot where the floor drains
  { const sd = Math.round((el.a[0] * 7.3 + el.a[1] * 3.1 + el.b[0] * 1.7) * 100) | 0, rr = rng(Math.abs(sd) + 1), streaks = [], lichen = [], len = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]) || 1;
    const at = (f, y, d = 0.0) => [A[0] + (B[0] - A[0]) * f + nx * d, y, A[1] + (B[1] - A[1]) * f + nz * d];
    for (let k = 0; k < Math.max(1, Math.round(len / 1.2)); k++) {
      const f = rr(), top = hi - rr() * 0.4, drop = 1.2 + rr() * 4.0, w = 0.05 + rr() * 0.14;
      beamTris(streaks, at(f - w / len / 2, Math.max(lo, top - drop), 0.012), at(f + w / len / 2, Math.max(lo, top - drop), 0.012), 0.012, Math.min(drop, top - lo));
    }
    for (let k = 0; k < 2; k++) { const f = rr(), y = lo + 0.5 + rr() * (hi - lo - 1), r = 0.2 + rr() * 0.35; beamTris(lichen, at(f - r / len, y, 0.014), at(f + r / len, y, 0.014), 0.014, r * 1.2); }
    if (hi - lo > 1) beamTris(streaks, at(0.0, lo, 0.012), at(1.0, lo, 0.012), 0.012, 0.35);
    bag.add('bark_dark', fromTriangles(streaks)); if (lichen.length) bag.add('plaster_damp', fromTriangles(lichen)); }
  if (beds.length) bag.add('tuff_hewn', fromTriangles(beds));
  if (ledges.length) bag.add(TU, fromTriangles(ledges));
}

/** A Greek cross [arms of half-length a, half-width w] at c from y0 to y1, as five boxes (no faces overlapping). */
function cross(bag, col, mat, cx, cz, a, w, y0, y1) {
  for (const r of [[cx - w, cz - w, cx + w, cz + w], [cx - a, cz - w, cx - w, cz + w], [cx + w, cz - w, cx + a, cz + w], [cx - w, cz - a, cx + w, cz - w], [cx - w, cz + w, cx + w, cz + a]]) solid(bag, col, mat, r, y0, y1);
}
/**
 * giyorgis: Bete Giyorgis { c, y0 (the pit floor), h, a, w } (docs/settlements/lalibela.md §13): two
 * receding plinth tiers, then the hollow cross-shaped body — walls 1.6 m thick, the arms' lower
 * Aksumite windows open, the upper ogee ones blind, doors in the west, north and south arms with
 * steps up; inside, the arms' flat ceilings, a round arch at each arm's mouth, the crossing roofed by
 * a stepped dome (Sauter: "its flat ceilings and its dome"; "each arm of the cross is cut by a
 * semicircular arch" on the pilasters at the four corners of the central space), the sanctuary in the
 * east arm with its altar and the crosses cut in relief on its wall; on the roof the three nested crosses.
 */
function giyorgis(el, { bag, col }) {
  const [cx, cz] = el.c, y0 = el.y0, a = el.a, w = el.w, top = y0 + el.h, yf = y0 + 1.8;
  const T = 1.6, wi = w - T, wc = w - 0.8, ai = a - T, yT = yf + 6.4, ARMS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const quad = (r) => [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz]) => { const x0 = cx + sx * r[0], x1 = cx + sx * r[2], z0 = cz + sz * r[1], z1 = cz + sz * r[3]; return [Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]; });
  cross(bag, col, TH, cx, cz, a + 0.8, w + 0.8, y0, y0 + 0.9);
  cross(bag, col, TH, cx, cz, a + 0.4, w + 0.4, y0 + 0.9, yf);
  // the walls round the crossing and the arms, to the roof (the four corners of the crossing stand as pilasters)
  for (const r of [[wc, wi, a, w], [wi, wc, wc, w], [wi, w, w, a]]) for (const q of quad(r)) solid(bag, col, TH, q, yf, top);
  // the arms: the end wall pierced by its windows and its door, the flat ceiling over the nave of the arm, the arch at its mouth
  const faces = [], sof = [];
  for (const [dx, dz] of ARMS) {
    const n = [dx, dz], u = dx ? [0, 1] : [1, 0], uc = dx ? cz : cx, F = [cx + dx * a, cz + dz * a], side = dx ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n');
    const endR = dx ? [Math.min(cx + dx * ai, cx + dx * a), cz - wi, Math.max(cx + dx * ai, cx + dx * a), cz + wi] : [cx - wi, Math.min(cz + dz * ai, cz + dz * a), cx + wi, Math.max(cz + dz * ai, cz + dz * a)];
    const holes = [], door = !(dx === 1);
    for (const s of [-0.42, 0.42]) holes.push([uc + s * w - 0.45, uc + s * w + 0.45, yf + 2.7, yf + 4.4]);
    if (door) holes.push([uc - 0.9, uc + 0.9, yf - 0.01, yf + 3.2]);
    piercedSlab(bag, col, TH, endR, yf, top, holes);
    for (const s of [-0.42, 0.42]) {
      const c = [F[0] + u[0] * s * w, F[1] + u[1] * s * w];
      aksWindow(bag, c, yf + 2.7, u, n, 0.9, 1.7, true); ogeeWindow(bag, c, yf + 6.2, u, n, 0.8, 1.1);
    }
    if (door) {
      const Pf = (s, d) => [F[0] + u[0] * s + n[0] * d, F[1] + u[1] * s + n[1] * d];
      const bar = (s0, s1, d1, y1, y2) => bag.add(TH, orientedBox(Pf(s0, d1 / 2), Pf(s1, d1 / 2), d1, y1, y2));
      bar(-1.15, -0.9, 0.2, yf, yf + 3.2); bar(0.9, 1.15, 0.2, yf, yf + 3.2); bar(-1.3, 1.3, 0.24, yf + 3.2, yf + 3.5);
      openLeaves(bag, side, [cx - a, cz - a, cx + a, cz + a], T, uc - 0.9, uc + 0.9, yf, 3.18);
      doorSteps(bag, col, side, [cx - (a + 0.4), cz - (a + 0.4), cx + (a + 0.4), cz + (a + 0.4)], uc, 2.4, y0, yf);
    }
    // the ceiling of the arm and the arch at its mouth
    const slab = dx ? [Math.min(cx + dx * wc, cx + dx * ai), cz - wi, Math.max(cx + dx * wc, cx + dx * ai), cz + wi] : [cx - wi, Math.min(cz + dz * wc, cz + dz * ai), cx + wi, Math.max(cz + dz * wc, cz + dz * ai)];
    solid(bag, col, TH, slab, yT, top);
    const ys = yf + 3.0, ca = (dx ? cx : cz) + (dx ? dx : dz) * (wc + 0.3);
    if (dx) { roundArch(faces, sof, ca, 0.3, cz - wi, cz + wi, ys, yT, false); col.rect([ca - 0.3, cz - wi, ca + 0.3, cz + wi], ys + wi - 0.3, yT); }
    else { roundArch(faces, sof, ca, 0.3, cx - wi, cx + wi, ys, yT, true); col.rect([cx - wi, ca - 0.3, cx + wi, ca + 0.3], ys + wi - 0.3, yT); }
  }
  bag.add(TH, fromTriangles(faces)); bag.add(TH, fromTriangles(sof));
  // the crossing's stepped dome: square rings, each opening narrower than the one below, a cap over the last
  { let y = yT;
    for (const h of [3.2, 2.5, 1.8, 1.1]) {
      for (const r of [[cx - wc, cz - wc, cx + wc, cz - h], [cx - wc, cz + h, cx + wc, cz + wc], [cx - wc, cz - h, cx - h, cz + h], [cx + h, cz - h, cx + wc, cz + h]]) bag.add(TH, box(r[0], y, r[1], r[2], y + 0.55, r[3]));
      y += 0.55;
    }
    bag.add(TH, box(cx - wc, y, cz - wc, cx + wc, top, cz + wc)); }
  // the sanctuary in the east arm: its wall carved with crosses in relief, the altar with its cloth
  { const x = cx + ai;
    for (const zz of [-1.9, 0, 1.9]) for (const yy of [yf + 2.0, yf + 4.0]) {
      bag.add(TU, box(x - 0.07, yy, cz + zz - 0.07, x, yy + 0.9, cz + zz + 0.07));
      bag.add(TU, box(x - 0.07, yy + 0.5, cz + zz - 0.3, x, yy + 0.62, cz + zz - 0.07)); bag.add(TU, box(x - 0.07, yy + 0.5, cz + zz + 0.07, x, yy + 0.62, cz + zz + 0.3));
    }
    solid(bag, col, TH, [x - 2.6, cz - 0.9, x - 1.1, cz + 0.9], yf, yf + 1.05);
    bag.add('cloth_white', box(x - 2.68, yf + 1.05, cz - 0.98, x - 1.02, yf + 1.09, cz + 0.98));
    bag.add('bronze', box(x - 1.9, yf + 1.09, cz - 0.02, x - 1.82, yf + 1.5, cz + 0.02)); bag.add('bronze', box(x - 1.96, yf + 1.34, cz - 0.14, x - 1.76, yf + 1.4, cz + 0.14)); }
  // the roof, level with the ground round the pit: three Greek crosses nested one within another,
  // each stepped up from the last (the triple cross carved on the roof)
  let yr = top;
  for (const [sA, sW, hgt] of [[0.86, 0.8, 0.14], [0.6, 0.55, 0.14], [0.34, 0.3, 0.14]]) {
    const A = a * sA, Wd = w * sW;
    for (const r of [[cx - Wd, cz - Wd, cx + Wd, cz + Wd], [cx - A, cz - Wd, cx - Wd, cz + Wd], [cx + Wd, cz - Wd, cx + A, cz + Wd], [cx - Wd, cz - A, cx + Wd, cz - Wd], [cx - Wd, cz + Wd, cx + Wd, cz + A]]) bag.add(TH, box(r[0], yr, r[1], r[2], yr + hgt, r[3]));
    yr += hgt;
  }
}
/**
 * A round-headed arch in a wall: the solid between the arch (springing at ys, a semicircle over the
 * span uA..uB) and yT, in a wall of half-thickness t on the line c (x = c, or z = c when alongX).
 * Faces go to `faces`, the soffit to `soffit` (so that it can be painted).
 */
function roundArch(faces, soffit, c, t, uA, uB, ys, yT, alongX = false) {
  const R = (uB - uA) / 2, m = (uA + uB) / 2, N = 12, P = [], F = [], S = [];
  for (let k = 0; k <= N; k++) { const f = Math.PI * (1 - k / N); P.push([m + Math.cos(f) * R, Math.min(yT - 0.04, ys + Math.sin(f) * R)]); }
  const V = (s, u, y) => (alongX ? [u, y, c + s * t] : [c + s * t, y, u]);
  for (let k = 0; k < N; k++) {
    const [ua, ya] = P[k], [ub, yb] = P[k + 1];
    for (const s of [-1, 1]) F.push(...V(s, ua, ya), ...V(s, ub, yb), ...V(s, ub, yT), ...V(s, ua, ya), ...V(s, ub, yT), ...V(s, ua, yT));
    S.push(...V(-1, ua, ya), ...V(1, ua, ya), ...V(1, ub, yb), ...V(-1, ua, ya), ...V(1, ub, yb), ...V(-1, ub, yb));
  }
  const mid = alongX ? [m, ys, c] : [c, ys, m];
  faces.push(...orientBy(F, (p) => { const a = alongX ? p[2] - c : p[0] - c; return alongX ? [0, 0, Math.sign(a) || 1] : [Math.sign(a) || 1, 0, 0]; }));
  soffit.push(...orientBy(S, (p) => [mid[0] - p[0], mid[1] - p[1], mid[2] - p[2]]));
}
/**
 * The window layout on the four faces of a box (as `openings`): [{ side ('n','s','w','e'), c, u, n, s, y, w, h }].
 */
function windowPlaces(r, y, h, w, step, skipMid = false) {
  const [x0, z0, x1, z1] = r, out = [];
  for (const [side, ax, az, bx, bz, nx, nz] of [['n', x0, z0, x1, z0, 0, -1], ['s', x0, z1, x1, z1, 0, 1], ['w', x0, z0, x0, z1, -1, 0], ['e', x1, z0, x1, z1, 1, 0]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.floor(L / step)), ux = (bx - ax) / L, uz = (bz - az) / L;
    for (let i = 0; i < n; i++) {
      if (skipMid && n % 2 === 1 && i === (n - 1) / 2) continue;
      const s = (i + 0.5) * L / n;
      out.push({ side, c: [ax + ux * s, az + uz * s], u: [ux, uz], n: [nx, nz], y, w, h });
    }
  }
  return out;
}
/**
 * Hollow walls of thickness T round the box r from y0 to y1, pierced by holes per side: { n: [[u0, u1,
 * v0, v1]], s, w, e } (u along the side: x for n/s, z for w/e). The corners belong to the n and s walls.
 */
function hollowWalls(bag, col, mat, r, y0, y1, T, holes) {
  const [x0, z0, x1, z1] = r;
  piercedSlab(bag, col, mat, [x0, z0, x1, z0 + T], y0, y1, holes.n || []);
  piercedSlab(bag, col, mat, [x0, z1 - T, x1, z1], y0, y1, holes.s || []);
  piercedSlab(bag, col, mat, [x0, z0 + T, x0 + T, z1 - T], y0, y1, holes.w || []);
  piercedSlab(bag, col, mat, [x1 - T, z0 + T, x1, z1 - T], y0, y1, holes.e || []);
}
const holeOf = (p, m = 0.012) => (p.side === 'n' || p.side === 's' ? [p.c[0] - p.w / 2 - m, p.c[0] + p.w / 2 + m, p.y - m, p.y + p.h + m] : [p.c[1] - p.w / 2 - m, p.c[1] + p.w / 2 + m, p.y - m, p.y + p.h + m]);
/** A doorway's leaves of planks standing open against the inner face of the wall { at the hole's inner edge }. */
function openLeaves(bag, side, r, T, u0, u1, y, h) {
  const [x0, z0, x1, z1] = r, lw = (u1 - u0) / 2, d = 0.08;
  for (const [u, sg] of [[u0, -1], [u1, 1]]) {
    if (side === 'w' || side === 'e') { const xi = side === 'w' ? x0 + T : x1 - T, k = side === 'w' ? 1 : -1; bag.add('timber', box(Math.min(xi, xi + k * lw), y, u + sg * 0.02 - (sg < 0 ? d : 0), Math.max(xi, xi + k * lw), y + h, u + sg * 0.02 + (sg > 0 ? d : 0))); }
    else { const zi = side === 'n' ? z0 + T : z1 - T, k = side === 'n' ? 1 : -1; bag.add('timber', box(u + sg * 0.02 - (sg < 0 ? d : 0), y, Math.min(zi, zi + k * lw), u + sg * 0.02 + (sg > 0 ? d : 0), y + h, Math.max(zi, zi + k * lw))); }
  }
}
/** Steps up to a doorway from the floor y0 to y1 on a side of the rect r (the plinth's edge), centred at u, w wide. */
function doorSteps(bag, col, side, r, u, w, y0, y1) {
  const n = Math.max(1, Math.round((y1 - y0) / 0.2)), h = (y1 - y0) / n, d = 0.32;
  for (let k = 0; k < n; k++) {
    const out = (n - k) * d, yt = y0 + (k + 1) * h;
    const hw = w / 2 - k * 0.02, rr = side === 'w' ? [r[0] - out, u - hw, r[0], u + hw] : side === 'e' ? [r[2], u - hw, r[2] + out, u + hw] : side === 'n' ? [u - hw, r[1] - out, u + hw, r[1]] : [u - hw, r[3], u + hw, r[3] + out];
    solid(bag, col, TH, rr, k === 0 ? y0 - 0.1 : y0 + k * h - 0.05, yt);
  }
}

/**
 * basilica: Bete Medhane Alem { rect, y0, h, cols: [nLong, nShort] } (docs/settlements/lalibela.md
 * §11): on its plinth, ringed by square pillars carrying the roof's overhang, the hollow body —
 * walls with Aksumite windows (the lower row open, the upper blind), doors in the west, north and
 * south; inside, five naves divided by four rows of seven square pillars (28 within, eight bays)
 * joined lengthwise and across by round arches; the aisles' flat ceilings, the nave's higher;
 * a low gabled roof. No paintings (sources: "devoid of paintings").
 */
function basilica(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0, h = el.h, o = 2.4, [nl, ns] = el.cols ?? [12, 7];
  const body = [x0 + o, z0 + o, x1 - o, z1 - o], [bx0, bz0, bx1, bz1] = body, T = 1.2, yf = y0 + 0.8, yTop = y0 + h - 1.6;
  solid(bag, col, TH, [x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y0, yf);
  // the walls: the lower windows pierced, doors in the middle of the west, north and south walls
  const low = windowPlaces(body, y0 + 3.2, 1.6, 0.9, 2.6, true), zc = (bz0 + bz1) / 2, xc = (bx0 + bx1) / 2;
  const holes = { n: [], s: [], w: [], e: [] };
  for (const p of low) holes[p.side].push(holeOf(p));
  const doors = [['w', zc, 2.2, 3.2], ['n', xc, 1.8, 3.0], ['s', xc, 1.8, 3.0]];
  for (const [side, u, w, dh] of doors) holes[side].push([u - w / 2, u + w / 2, yf - 0.01, yf + dh]);
  hollowWalls(bag, col, TH, body, yf, yTop, T, holes);
  for (const p of low) aksWindow(bag, p.c, p.y, p.u, p.n, p.w, p.h, true);
  openings(bag, body, y0 + 6.4, 1.2, 0.7, 2.6);
  for (const [side, u, w, dh] of doors) {
    openLeaves(bag, side, body, T, u - w / 2, u + w / 2, yf, dh - 0.02);
    // the lintel's frame standing proud round the doorway outside
    const a = side === 'w' ? [bx0, u - w / 2 - 0.2] : [u - w / 2 - 0.2, side === 'n' ? bz0 : bz1], b = side === 'w' ? [bx0, u + w / 2 + 0.2] : [u + w / 2 + 0.2, side === 'n' ? bz0 : bz1];
    bag.add(TH, orientedBox(a, b, 0.24, yf + dh, yf + dh + 0.22));
    for (const sg of [-1, 1]) { const c = u + sg * (w / 2 + 0.1), p = side === 'w' ? [[bx0, c - 0.1], [bx0, c + 0.1]] : [[c - 0.1, a[1]], [c + 0.1, a[1]]]; bag.add(TH, orientedBox(p[0], p[1], 0.24, yf, yf + dh)); }
  }
  // the interior: four rows of seven pillars, five naves (the middle the widest), eight bays
  const ix0 = bx0 + T, ix1 = bx1 - T, iz0 = bz0 + T, iz1 = bz1 - T, P = 1.0, ws = [2.1, 2.5, 3.1, 2.5, 2.1], k = (iz1 - iz0 - 4 * P) / ws.reduce((a, b) => a + b, 0);
  const rowZ = []; { let z = iz0; for (let i = 0; i < 4; i++) { z += ws[i] * k; rowZ.push(z + P / 2); z += P; } }
  const colX = Array.from({ length: 7 }, (_, j) => ix0 + (ix1 - ix0) * (j + 1) / 8);
  const ys = yf + 4.0, yC = yf + 6.2, yN = yf + 7.4, faces = [], sof = [];
  for (const [i, z] of rowZ.entries()) {
    const yT = i === 1 || i === 2 ? yN : yC;
    for (const x of colX) {
      solid(bag, col, TH, [x - P / 2, z - P / 2, x + P / 2, z + P / 2], yf, yT);
      // a plain capital: a hewn block a little wider under the arches' springing
      bag.add(TH, box(x - P / 2 - 0.1, ys - 0.28, z - P / 2 - 0.1, x + P / 2 + 0.1, ys, z + P / 2 + 0.1));
    }
    // the arcade along the row
    const xs = [ix0, ...colX.flatMap((x) => [x - P / 2, x + P / 2]), ix1];
    for (let q = 0; q < xs.length; q += 2) { roundArch(faces, sof, z, 0.3, xs[q], xs[q + 1], ys, yT, true); col.rect([xs[q], z - 0.3, xs[q + 1], z + 0.3], ys + (xs[q + 1] - xs[q]) / 2 - 0.3, yT); }
  }
  // the arches across the naves at each column of pillars
  const zs = [iz0, ...rowZ.flatMap((z) => [z - P / 2, z + P / 2]), iz1];
  for (const x of colX) for (let q = 0; q < zs.length; q += 2) {
    const yT = q === 4 ? yN : yC;
    roundArch(faces, sof, x, 0.3, zs[q], zs[q + 1], ys, yT, false);
    col.rect([x - 0.3, zs[q], x + 0.3, zs[q + 1]], ys + (zs[q + 1] - zs[q]) / 2 - 0.3, yT);
  }
  bag.add(TH, fromTriangles(faces)); bag.add(TH, fromTriangles(sof));
  // the ceilings: the aisles' at yC, the nave's at yN, solid rock above to the roof
  for (const r of [[ix0, iz0, ix1, rowZ[1]], [ix0, rowZ[2], ix1, iz1]]) solid(bag, col, TH, r, yC, yN);
  solid(bag, col, TH, [ix0, iz0, ix1, iz1], yN, yTop);
  // the pillars round it, the roof slab, the low gable
  const ring = [];
  for (let i = 0; i < nl; i++) { const x = x0 + 0.7 + (x1 - x0 - 1.4) * i / (nl - 1); ring.push([x, z0 + 0.7], [x, z1 - 0.7]); }
  for (let j = 1; j < ns - 1; j++) { const z = z0 + 0.7 + (z1 - z0 - 1.4) * j / (ns - 1); ring.push([x0 + 0.7, z], [x1 - 0.7, z]); }
  for (const [x, z] of ring) { bag.add(TH, box(x - 0.55, yf, z - 0.55, x + 0.55, yTop, z + 0.55)); col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y0, y0 + h); }
  solid(bag, col, TH, [x0, z0, x1, z1], yTop, y0 + h - 0.6);
  const t = [], yb = y0 + h - 0.6, yr = y0 + h, zm = (z0 + z1) / 2;
  t.push(x0, yb, z0, x1, yb, z0, x1, yr, zm, x0, yb, z0, x1, yr, zm, x0, yr, zm, x0, yb, z1, x0, yr, zm, x1, yr, zm, x0, yb, z1, x1, yr, zm, x1, yb, z1, x0, yb, z0, x0, yr, zm, x0, yb, z1, x1, yb, z0, x1, yb, z1, x1, yr, zm);
  bag.add(TH, fromTriangles(t));
  // steps up onto the plinth before each door
  for (const [side, u, w] of doors) doorSteps(bag, col, side, [x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], u, w + 0.6, y0, yf);
}

/** Holes of a cross-shaped window centred at u, its foot at v (w across the arms, h tall). */
const crossHoles = (u, v, w = 0.8, h = 1.2, b = 0.26) => [[u - b / 2, u + b / 2, v, v + h], [u - w / 2, u + w / 2, v + h * 0.52, v + h * 0.52 + b]];
/**
 * maryam: Bete Maryam { c, y0, h } (docs/settlements/lalibela.md §11): 15.6 × 9.2 m on a low plinth,
 * porches on the west (the main one), north and south; walls pierced by cross-shaped windows and
 * Aksumite ones; inside, a nave and two aisles divided by two rows of six square pillars (twelve,
 * the last pair in the sanctuary, the north one veiled), round arches whose soffits are painted red,
 * yellow and green, a painted frieze over the arcades, the nave's flat ceiling painted as coffers,
 * the aisles' lower; the sanctuary's curtain across the nave's east end; a low gabled roof.
 */
function maryam(el, { bag, col }) {
  const [cx, cz] = el.c, y0 = el.y0, h = el.h ?? 9, yf = y0 + 0.6, yTop = y0 + h - 0.8, T = 1.0;
  const body = [cx - 7.8, cz - 4.6, cx + 7.8, cz + 4.6], [bx0, bz0, bx1, bz1] = body;
  solid(bag, col, TH, [bx0 - 0.5, bz0 - 0.5, bx1 + 0.5, bz1 + 0.5], y0, yf);
  // the openings: doors (W, N, S), cross windows in the north and south walls, on the east the
  // central cross over two Aksumite windows, a cross high in the west wall over the porch
  const holes = { n: [], s: [], w: [], e: [] }, aks = [];
  holes.w.push([cz - 0.9, cz + 0.9, yf - 0.01, yf + 2.8]);
  for (const sd of ['n', 's']) {
    holes[sd].push([cx - 0.8, cx + 0.8, yf - 0.01, yf + 2.6]);
    for (const x of [cx - 4.6, cx + 2.6, cx + 5.4]) holes[sd].push(...crossHoles(x, yf + 2.4));
    for (const x of [cx - 4.6, cx + 2.6, cx + 5.4]) holes[sd].push(...crossHoles(x, yf + 5.6, 0.6, 0.9, 0.2));
  }
  holes.e.push(...crossHoles(cz, yf + 4.6, 1.0, 1.5, 0.3));
  for (const z of [cz - 2.4, cz + 2.4]) { const p = { side: 'e', c: [bx1, z], u: [0, 1], n: [1, 0], y: yf + 2.2, w: 0.8, h: 1.5 }; aks.push(p); holes.e.push(holeOf(p)); }
  holes.w.push(...crossHoles(cz, yf + 5.2, 0.8, 1.2, 0.24));
  hollowWalls(bag, col, TH, body, yf, yTop, T, holes);
  for (const p of aks) aksWindow(bag, p.c, p.y, p.u, p.n, p.w, p.h, true);
  // a raised hewn border round each cross window, outside
  const border = (side, u, v, w, hh, b) => {
    const o = side === 'n' ? -1 : side === 's' ? 1 : side === 'e' ? 1 : -1, d0 = side === 'n' ? bz0 : side === 's' ? bz1 : side === 'e' ? bx1 : bx0;
    const R = (u0, u1, v0, v1) => (side === 'n' || side === 's' ? box(u0, v0, Math.min(d0, d0 + o * 0.08), u1, v1, Math.max(d0, d0 + o * 0.08)) : box(Math.min(d0, d0 + o * 0.08), v0, u0, Math.max(d0, d0 + o * 0.08), v1, u1));
    const f = 0.1;
    bag.add(TH, R(u - b / 2 - f, u - b / 2, v - f, v + hh * 0.52)); bag.add(TH, R(u + b / 2, u + b / 2 + f, v - f, v + hh * 0.52));
    bag.add(TH, R(u - b / 2 - f, u - b / 2, v + hh * 0.52 + b, v + hh + f)); bag.add(TH, R(u + b / 2, u + b / 2 + f, v + hh * 0.52 + b, v + hh + f));
    bag.add(TH, R(u - b / 2, u + b / 2, v - f, v)); bag.add(TH, R(u - b / 2, u + b / 2, v + hh, v + hh + f));
    for (const sg of [-1, 1]) { const ua = u + sg * b / 2, ub = u + sg * w / 2; bag.add(TH, R(Math.min(ua, ub), Math.max(ua, ub), v + hh * 0.52 - f, v + hh * 0.52)); bag.add(TH, R(Math.min(ua, ub), Math.max(ua, ub), v + hh * 0.52 + b, v + hh * 0.52 + b + f)); bag.add(TH, R(Math.min(ub, ub + sg * f), Math.max(ub, ub + sg * f), v + hh * 0.52 - f, v + hh * 0.52 + b + f)); }
  };
  for (const sd of ['n', 's']) for (const x of [cx - 4.6, cx + 2.6, cx + 5.4]) { border(sd, x, yf + 2.4, 0.8, 1.2, 0.26); border(sd, x, yf + 5.6, 0.6, 0.9, 0.2); }
  border('e', cz, yf + 4.6, 1.0, 1.5, 0.3);
  // the porches: a hollow box before each door, a round-arched mouth, a roof slab
  const porch = (side) => {
    const D = side === 'w' ? 2.6 : 2.2, W = side === 'w' ? 4.0 : 3.6, H = 4.6, A = [], S = [];
    if (side === 'w') {
      const r = [bx0 - D, cz - W / 2, bx0, cz + W / 2];
      solid(bag, col, TH, [r[0] - 0.3, r[1] - 0.3, bx0 - 0.5, r[3] + 0.3], y0, yf);
      for (const z of [r[1], r[3] - 0.6]) solid(bag, col, TH, [r[0], z, r[2], z + 0.6], yf, yf + H);
      solid(bag, col, TH, [r[0], r[1] + 0.6, r[0] + 0.6, cz - 1.1], yf, yf + H); solid(bag, col, TH, [r[0], cz + 1.1, r[0] + 0.6, r[3] - 0.6], yf, yf + H);
      roundArch(A, S, r[0] + 0.3, 0.3, cz - 1.1, cz + 1.1, yf + 2.6, yf + H, false); col.rect([r[0], cz - 1.1, r[0] + 0.6, cz + 1.1], yf + 3.5, yf + H);
      solid(bag, col, TH, [r[0] - 0.15, r[1] - 0.15, r[2], r[3] + 0.15], yf + H, yf + H + 0.5);
      doorSteps(bag, col, 'w', [r[0] - 0.3, r[1], r[2], r[3]], cz, 2.2, y0, yf);
    } else {
      const sg = side === 'n' ? -1 : 1, zb = side === 'n' ? bz0 : bz1, r = [cx - W / 2, Math.min(zb, zb + sg * D), cx + W / 2, Math.max(zb, zb + sg * D)], zf = zb + sg * D;
      const zp = zb + sg * 0.5; solid(bag, col, TH, [r[0] - 0.3, Math.min(zp, zf + sg * 0.3), r[2] + 0.3, Math.max(zp, zf + sg * 0.3)], y0, yf);
      for (const x of [r[0], r[2] - 0.6]) solid(bag, col, TH, [x, r[1], x + 0.6, r[3]], yf, yf + H);
      const zr = [Math.min(zf, zf - sg * 0.6), Math.max(zf, zf - sg * 0.6)];
      solid(bag, col, TH, [r[0] + 0.6, zr[0], cx - 0.9, zr[1]], yf, yf + H); solid(bag, col, TH, [cx + 0.9, zr[0], r[2] - 0.6, zr[1]], yf, yf + H);
      roundArch(A, S, zf - sg * 0.3, 0.3, cx - 0.9, cx + 0.9, yf + 2.5, yf + H, true); col.rect([cx - 0.9, zr[0], cx + 0.9, zr[1]], yf + 3.3, yf + H);
      solid(bag, col, TH, [r[0] - 0.15, Math.min(zb, zf + sg * 0.15), r[2] + 0.15, Math.max(zb, zf + sg * 0.15)], yf + H, yf + H + 0.5);
      doorSteps(bag, col, side, [r[0], Math.min(zb, zf + sg * 0.3), r[2], Math.max(zb, zf + sg * 0.3)], cx, 1.8, y0, yf);
    }
    bag.add(TH, fromTriangles(A)); bag.add(TH, fromTriangles(S));
  };
  porch('w'); porch('n'); porch('s');
  // the interior: two rows of six pillars, round arches along them, painted soffits; cross arches
  // from each pillar to the side wall over the aisles
  const ix0 = bx0 + T, ix1 = bx1 - T, iz0 = bz0 + T, iz1 = bz1 - T, P = 0.75, rows = [cz - 1.75, cz + 1.75];
  const colX = Array.from({ length: 6 }, (_, j) => ix0 + 1.3 + (ix1 - ix0 - 2.0) * j / 5.4);
  const ys = yf + 3.1, yC = yf + 5.0, yN = yf + 6.6, PAINT = ['paint_minoan_red', 'paint_ochre', 'fresco_green'];
  const faces = [], sofs = [[], [], []];
  for (const z of rows) {
    for (const x of colX) {
      solid(bag, col, TH, [x - P / 2, z - P / 2, x + P / 2, z + P / 2], yf, yN);
      // the capital: a block with a carved cross on its faces toward the nave and the aisle
      bag.add(TH, box(x - P / 2 - 0.09, ys - 0.32, z - P / 2 - 0.09, x + P / 2 + 0.09, ys, z + P / 2 + 0.09));
      for (const sg of [-1, 1]) { const zz = z + sg * (P / 2 + 0.09); bag.add('paint_minoan_red', box(x - 0.04, ys - 0.28, Math.min(zz, zz + sg * 0.02), x + 0.04, ys - 0.04, Math.max(zz, zz + sg * 0.02))); bag.add('paint_minoan_red', box(x - 0.13, ys - 0.2, Math.min(zz, zz + sg * 0.02), x + 0.13, ys - 0.12, Math.max(zz, zz + sg * 0.02))); }
    }
    const xs = [ix0, ...colX.flatMap((x) => [x - P / 2, x + P / 2]), ix1];
    for (let q = 0; q < xs.length; q += 2) { roundArch(faces, sofs[(q / 2) % 3], z, 0.25, xs[q], xs[q + 1], ys, yN, true); col.rect([xs[q], z - 0.25, xs[q + 1], z + 0.25], ys + 0.6, yN); }
    // the frieze over the arcade on its nave face, painted in a meander of squares
    const zz = z + (z < cz ? 0.25 : -0.25), o = z < cz ? 1 : -1;
    bag.add('ceiling_grid', box(ix0, yN - 0.75, Math.min(zz, zz + o * 0.03), ix1, yN - 0.35, Math.max(zz, zz + o * 0.03)));
  }
  for (const x of colX) for (const [za, zb2] of [[iz0, rows[0] - P / 2], [rows[1] + P / 2, iz1]]) { roundArch(faces, sofs[2], x, 0.22, za, zb2, ys, yC, false); col.rect([x - 0.22, za, x + 0.22, zb2], ys + 0.5, yC); }
  bag.add(TH, fromTriangles(faces));
  sofs.forEach((s, i) => s.length && bag.add(PAINT[i], fromTriangles(s)));
  // the ceilings: the aisles' at yC painted with coffers, the nave's at yN painted; rock above
  for (const r of [[ix0, iz0, ix1, rows[0]], [ix0, rows[1], ix1, iz1]]) { bag.add('ceiling_coffer', box(r[0], yC, r[1], r[2], yC + 0.02, r[3])); solid(bag, col, TH, r, yC + 0.02, yN); }
  bag.add('ceiling_painted', box(ix0, yN, rows[0], ix1, yN + 0.02, rows[1]));
  solid(bag, col, TH, [ix0, iz0, ix1, iz1], yN + 0.02, yTop);
  // the north sanctuary pillar veiled from capital to floor: a cloth hung round it in folds, a red band at its hem
  { const x = colX[5], z = rows[0], N = 20;
    const g = lathe([[0.62, 0], [0.6, 0.25], [0.56, 1.4], [0.52, ys - yf - 0.5], [0.5, ys - yf - 0.3], [0.001, ys - yf - 0.3]], N, (th) => 1 + 0.06 * Math.sin(th * 9), x, yf, z);
    bag.add('cloth_white', g);
    bag.add('cloth_red', lathe([[0.64, 0], [0.64, 0.22], [0.001, 0.22]], N, (th) => 1 + 0.06 * Math.sin(th * 9), x, yf + 0.03, z));
    col.circle(x, z, 0.62, yf, ys); }
  // the sanctuary's curtain hung across the nave east of the last pillars, from a rod between them
  { const x = colX[5] + P / 2 + 0.25, za = rows[0] + P / 2, zb2 = rows[1] - P / 2, tt = [];
    beamTris(tt, [x, ys - 0.15, za - 0.1], [x, ys - 0.15, zb2 + 0.1], 0.03, 0.06); bag.add('timber', fromTriangles(tt));
    const C = [], N = 18, Hc = ys - 0.15 - yf - 0.04;
    for (let k = 0; k < N; k++) { const z0 = za + (zb2 - za) * k / N, z1 = za + (zb2 - za) * (k + 1) / N, d0 = 0.07 * Math.sin(k * Math.PI / 2), d1 = 0.07 * Math.sin((k + 1) * Math.PI / 2); C.push(x + d0, yf + 0.04, z0, x + d1, yf + 0.04, z1, x + d1, yf + 0.04 + Hc, z1, x + d0, yf + 0.04, z0, x + d1, yf + 0.04 + Hc, z1, x + d0, yf + 0.04 + Hc, z0); C.push(x + d0, yf + 0.04, z0, x + d1, yf + 0.04 + Hc, z1, x + d1, yf + 0.04, z1, x + d0, yf + 0.04, z0, x + d0, yf + 0.04 + Hc, z0, x + d1, yf + 0.04 + Hc, z1); }
    bag.add('cloth_red', fromTriangles(C)); col.segment([x, za], [x, zb2], 0.2, yf, ys); }
  // the low gable over the roof slab
  { const t = [], yb = yTop, yr = yTop + 0.8, zm = cz, [x0, z0, x1, z1] = [bx0 - 0.1, bz0 - 0.1, bx1 + 0.1, bz1 + 0.1];
    t.push(x0, yb, z0, x1, yb, z0, x1, yr, zm, x0, yb, z0, x1, yr, zm, x0, yr, zm, x0, yb, z1, x0, yr, zm, x1, yr, zm, x0, yb, z1, x1, yr, zm, x1, yb, z1, x0, yb, z0, x0, yr, zm, x0, yb, z1, x1, yb, z0, x1, yb, z1, x1, yr, zm);
    bag.add(TH, fromTriangles(t)); }
}

/**
 * aksumite: a church in the Aksumite manner { rect, y0, h, name } (docs/settlements/lalibela.md §16): the body hollow — walls 1.3 m thick
 * with courses standing out from them in the Aksumite way (the beam ends, "monkey heads", under each), windows open, a door in the west
 * wall with steps up to it; inside a nave and aisles on rows of square pillars under a flat ceiling, the sanctuary screened at the east
 * end by a wall and a curtain, the altar and tabot behind; rush mats, hanging lamps; in Bete Golgotha the saints cut in relief on the
 * walls (§16: a widely reported feature, [inferred]).
 */
function aksumite(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0, h = el.h, T = 1.3, yf = y0 + 0.9, zc = (z0 + z1) / 2, name = el.name || '';
  solid(bag, col, TH, [x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y0, yf);
  const sill = y0 + Math.max(2.8, h * 0.4), wh = 1.5, ceil = yf + Math.min(5.8, h - 2.6), yTop = y0 + h;
  const places = windowPlaces([x0, z0, x1, z1], sill, wh, 0.85, 3.4, true).filter((p) => !(p.side === 'w' && Math.abs(p.c[1] - zc) < 1.6));
  const holes = { n: [], s: [], w: [], e: [] };
  for (const p of places) holes[p.side].push(holeOf(p));
  holes.w.push([zc - 0.9, zc + 0.9, yf - 0.01, yf + 3.0]);
  hollowWalls(bag, col, TH, [x0, z0, x1, z1], yf, yTop, T, holes);
  for (const p of places) aksWindow(bag, p.c, p.y, p.u, p.n, p.w, p.h, true);
  openLeaves(bag, 'w', [x0, z0, x1, z1], T, zc - 0.9, zc + 0.9, yf, 2.98);
  { const bar = (s0, s1, d1, ya, yb) => bag.add(TH, orientedBox([x0 - d1 / 2, s0], [x0 - d1 / 2, s1], d1, ya, yb));
    bar(zc - 1.15, zc - 0.9, 0.2, yf, yf + 3.0); bar(zc + 0.9, zc + 1.15, 0.2, yf, yf + 3.0); bar(zc - 1.3, zc + 1.3, 0.24, yf + 3.0, yf + 3.3); }
  doorSteps(bag, col, 'w', [x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], zc, 2.4, y0, yf);
  // the courses standing out from the walls (proud 0.18 m), a beam end under each every 1.7 m, a cornice at the top
  const courses = [[y0 + 0.95, y0 + 2.25], [sill + wh + 0.5, sill + wh + 1.8], [yTop - 1.0, yTop]].filter(([a, b]) => b <= yTop + 0.01 && a < b);
  for (const [ya, yb] of courses) {
    const q = [x0 - 0.18, z0 - 0.18, x1 + 0.18, z1 + 0.18];
    const sides = [[q[0], q[1], q[2], q[1], 'z'], [q[0], q[3], q[2], q[3], 'z'], [q[0], q[1], q[0], q[3], 'x'], [q[2], q[1], q[2], q[3], 'x']];
    for (const [ax, az, bx, bz, kd] of sides) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.floor(L / 1.7));
      // (the west side is cut round the door's frame)
      if (kd === 'x') {
        const xa = ax === q[0] ? x0 - 0.18 : x1, xb = ax === q[0] ? x0 : x1 + 0.18;
        if (ax === q[0] && ya < yf + 3.4) { bag.add(TH, box(xa, ya, q[1], xb, yb, zc - 1.3)); bag.add(TH, box(xa, ya, zc + 1.3, xb, yb, q[3])); }
        else bag.add(TH, box(xa, ya, az, xb, yb, bz));
      } else {
        const za = az === q[1] ? z0 - 0.18 : z1, zb = az === q[1] ? z0 : z1 + 0.18;
        bag.add(TH, box(ax, ya, za, bx, yb, zb));
      }
      if (yb - ya > 1.0 && ya > y0 + 0.5) for (let i = 1; i < n; i++) {
        const px = ax + (bx - ax) * i / n, pz = az + (bz - az) * i / n;
        if (kd === 'x' && ax === q[0] && Math.abs(pz - zc) < 1.6 && ya < yf + 3.5) continue;
        bag.add(TH, box(px - 0.18, ya - 0.36, pz - 0.18, px + 0.18, ya, pz + 0.18).translate(kd === 'x' ? (ax === q[0] ? -0.14 : 0.14) : 0, 0, kd === 'z' ? (az === q[1] ? -0.14 : 0.14) : 0));
      }
    }
  }
  // inside: the ceiling and the solid above it, the pillars, the screen, the altar
  const ix0 = x0 + T, ix1 = x1 - T, iz0 = z0 + T, iz1 = z1 - T;
  solid(bag, col, TH, [ix0, iz0, ix1, iz1], ceil, yTop);
  const P = 0.8, rows = (iz1 - iz0) > 7 ? [zc - (iz1 - iz0) / 6, zc + (iz1 - iz0) / 6] : [zc], span = ix1 - ix0 - 6.2, nc = Math.max(2, Math.round(span / 4.4));
  for (const z of rows) for (let j = 0; j < nc; j++) {
    const x = ix0 + 1.8 + span * (j + 0.5) / nc;
    solid(bag, col, TH, [x - P / 2, z - P / 2, x + P / 2, z + P / 2], yf, ceil);
    bag.add(TH, box(x - P / 2 - 0.1, ceil - 0.5, z - P / 2 - 0.1, x + P / 2 + 0.1, ceil - 0.22, z + P / 2 + 0.1));
    bag.add('paint_minoan_red', box(x - 0.04, yf + 2.3, z - P / 2 - 0.012, x + 0.04, yf + 2.9, z - P / 2)); bag.add('paint_minoan_red', box(x - 0.14, yf + 2.52, z - P / 2 - 0.012, x + 0.14, yf + 2.6, z - P / 2));
  }
  for (const z of rows) bag.add(TH, box(ix0 + 1.0, ceil - 0.22, z - 0.3, ix1 - 3.4, ceil, z + 0.3));
  const sx = ix1 - 3.2;                                               // the screen of the sanctuary
  piercedSlab(bag, col, TH, [sx, iz0, sx + 0.5, iz1], yf, ceil, [[zc - 0.8, zc + 0.8, yf - 0.01, yf + 2.4]]);
  bag.add('cloth_red', box(sx - 0.05, yf + 0.04, zc - 0.78, sx, yf + 2.35, zc + 0.78));
  solid(bag, col, TH, [ix1 - 1.9, zc - 0.9, ix1 - 0.7, zc + 0.9], yf, yf + 1.05);
  bag.add('cloth_white', box(ix1 - 1.98, yf + 1.05, zc - 0.98, ix1 - 0.62, yf + 1.09, zc + 0.98));
  bag.add('bronze', box(ix1 - 1.55, yf + 1.09, zc - 0.22, ix1 - 1.05, yf + 1.4, zc + 0.22));        // the tabot's casket
  for (const sg of [-1, 1]) { bag.add('bronze', box(ix1 - 1.3 - 0.01, yf + 1.4, zc + sg * 0.2 - 0.01, ix1 - 1.28, yf + 1.7, zc + sg * 0.2 + 0.01)); }
  bag.add('reed_mat', box(ix0 + 0.8, yf, zc - 1.4, sx - 0.8, yf + 0.015, zc + 1.4));
  // the saints of Golgotha in relief on the nave's walls: robed figures with haloes, standing in niches
  if (/golgotha/.test(name)) for (const [zz, sgn] of [[iz0, 1], [iz1, -1]]) for (let k = 0; k < 4; k++) {
    const x = ix0 + 2.8 + k * ((sx - ix0 - 5.0) / 3), zf = zz + sgn * 0.0;
    bag.add(TU, box(x - 0.45, yf + 0.5, Math.min(zf, zf + sgn * 0.08), x + 0.45, yf + 2.4, Math.max(zf, zf + sgn * 0.08)));
    bag.add(TU, box(x - 0.2, yf + 2.4, Math.min(zf, zf + sgn * 0.1), x + 0.2, yf + 2.82, Math.max(zf, zf + sgn * 0.1)));
    bag.add(TH, box(x - 0.34, yf + 2.8, Math.min(zf, zf + sgn * 0.05), x + 0.34, yf + 2.9, Math.max(zf, zf + sgn * 0.05)));
  }
  // the lamps: clay lamps hung on cords before the screen and at the door, with a little light each
  if (lights) { for (const [lx, lz] of [[sx - 1.0, zc - 1.2], [sx - 1.0, zc + 1.2], [ix0 + 2.2, zc]]) {
    const t = []; rod(t, [lx, ceil, lz], [lx, ceil - 1.1, lz], 0.01, 3); bag.add('rope_fibre', fromTriangles(t));
    bag.add('bronze', lathe([[0.001, 0], [0.1, 0.02], [0.14, 0.08], [0.001, 0.08]], 8, null, lx, ceil - 1.2, lz)); bag.add('flame', lathe([[0.001, 0.08], [0.03, 0.08], [0.015, 0.16], [0.001, 0.2]], 6, null, lx, ceil - 1.2, lz));
    lights.push({ at: [lx, ceil - 1.0, lz], color: '#ffb468', intensity: 2.4, distance: 8 }); } }
  col.floor([x0, z0, x1, z1], yTop);
}
/**
 * tukul: a Lasta round house { c, r, storeys, seed, y } (docs/settlements/lalibela.md §5, §11; UNESCO:
 * "two storey round houses" of "local red stone" with interior staircases and thatched roofs): a
 * drum of red stone, battered a little, its courses marked by slightly proud bands; a plank door in a
 * timber frame; in a two-storey house the ends of the upper floor's joists standing out round the
 * drum, an upper door and small framed windows; the conical thatch in two layers with a deep eave,
 * crowned by a clay pot and a stick; a low wall of piled stone round part of the yard.
 */
function tukul(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x, z] = el.c, r = el.r, st = el.storeys ?? 1, H = st === 2 ? 5.4 : 2.7, y = el.y ?? 0;
  bag.add(TU, lathe([[r + 0.1, -1.0], [r + 0.1, 0], [r, H], [0.001, H]], 20, (th) => 1 + 0.012 * Math.sin(th * 7 + el.seed), x, y, z));
  // the courses: thin proud bands of flatter stones every 0.6 m or so
  for (let yy = 0.55; yy < H - 0.3; yy += 0.55 + rand() * 0.15) { const rr = r + 0.1 - 0.1 * yy / H + 0.015; bag.add('rubble', lathe([[rr, yy], [rr, yy + 0.07], [0.001, yy + 0.07]], 20, null, x, y, z)); }
  bag.add('bark_grey', lathe([[r + 0.112, -0.2], [r + 0.112, 0.0], [r + 0.1, 0.5], [r + 0.0, 0.5], [0.001, 0.5]].slice(0, 3), 20, (th) => 1 + 0.012 * Math.sin(th * 7 + el.seed), x, y, z));
  col.circle(x, z, r + 0.05, y, y + H);
  const a0r = rand() * Math.PI * 2, a = el.door ?? a0r, dx = Math.cos(a), dz = Math.sin(a), ex = -dz, ez = dx;
  const P = (s, d) => [x + dx * (r + d) + ex * s, z + dz * (r + d) + ez * s];
  const bar = (mat, s0, s1, d0, d1, y0, y1) => { const p = P((s0 + s1) / 2, (d0 + d1) / 2); bag.add(mat, orientedBox(P(s0, (d0 + d1) / 2), P(s1, (d0 + d1) / 2), d1 - d0, y + y0, y + y1)); void p; };
  // the door: a dark opening, its plank leaf ajar inside, the timber frame proud of the stone
  const door = (yb, w, hh) => {
    bar('opening', -w / 2, w / 2, -0.25, 0.02, yb, yb + hh);
    for (const sg of [-1, 1]) bar('timber', sg * w / 2 - (sg < 0 ? 0.12 : 0), sg * w / 2 + (sg > 0 ? 0.12 : 0), -0.1, 0.1, yb - (yb > 0 ? 0.08 : 0), yb + hh);
    bar('timber', -w / 2 - 0.3, w / 2 + 0.3, -0.1, 0.12, yb + hh, yb + hh + 0.14);
    if (yb > 0) bar('timber', -w / 2 - 0.2, w / 2 + 0.2, -0.1, 0.14, yb - 0.1, yb);
  };
  door(0, 0.95, 1.8);
  if (st === 2) {
    // the joists of the upper floor, their ends out through the drum
    for (let k = 0; k < 14; k++) { const b = k / 14 * Math.PI * 2 + 0.1, t = []; beamTris(t, [x + Math.cos(b) * (r - 0.3), y + 2.5, z + Math.sin(b) * (r - 0.3)], [x + Math.cos(b) * (r + 0.32), y + 2.5, z + Math.sin(b) * (r + 0.32)], 0.07, 0.14); bag.add('timber', fromTriangles(t)); }
    // the upper door over a ledge of flat stones, and two small windows
    const b2 = a + Math.PI * (0.6 + rand() * 0.4), c2 = [x + Math.cos(b2) * r, z + Math.sin(b2) * r], u2 = [-Math.sin(b2), Math.cos(b2)], n2 = [Math.cos(b2), Math.sin(b2)];
    const B2 = (s0, s1, d0, d1, y0, y1, mat) => bag.add(mat, orientedBox([c2[0] + u2[0] * s0 + n2[0] * (d0 + d1) / 2, c2[1] + u2[1] * s0 + n2[1] * (d0 + d1) / 2], [c2[0] + u2[0] * s1 + n2[0] * (d0 + d1) / 2, c2[1] + u2[1] * s1 + n2[1] * (d0 + d1) / 2], d1 - d0, y + y0, y + y1));
    B2(-0.4, 0.4, -0.25, 0.02, 2.95, 4.5, 'opening');
    for (const sg of [-1, 1]) B2(sg * 0.4 - (sg < 0 ? 0.1 : 0), sg * 0.4 + (sg > 0 ? 0.1 : 0), -0.1, 0.1, 2.85, 4.5, 'timber');
    B2(-0.65, 0.65, -0.1, 0.12, 4.5, 4.63, 'timber'); B2(-0.6, 0.6, -0.1, 0.45, 2.75, 2.88, 'rubble');
    for (const ang of [a + 1.3, a - 1.4]) {
      const c3 = [x + Math.cos(ang) * r, z + Math.sin(ang) * r], u3 = [-Math.sin(ang), Math.cos(ang)], n3 = [Math.cos(ang), Math.sin(ang)];
      const B3 = (s0, s1, d0, d1, y0, y1, mat) => bag.add(mat, orientedBox([c3[0] + u3[0] * s0 + n3[0] * (d0 + d1) / 2, c3[1] + u3[1] * s0 + n3[1] * (d0 + d1) / 2], [c3[0] + u3[0] * s1 + n3[0] * (d0 + d1) / 2, c3[1] + u3[1] * s1 + n3[1] * (d0 + d1) / 2], d1 - d0, y + y0, y + y1));
      B3(-0.22, 0.22, -0.25, 0.02, 3.6, 4.1, 'opening'); B3(-0.3, 0.3, -0.08, 0.1, 3.5, 3.6, 'timber'); B3(-0.3, 0.3, -0.08, 0.1, 4.1, 4.2, 'timber');
      for (const sg of [-1, 1]) B3(sg * 0.22 - (sg < 0 ? 0.08 : 0), sg * 0.22 + (sg > 0 ? 0.08 : 0), -0.08, 0.1, 3.6, 4.1, 'timber');
    }
  }
  // the thatch: a deep lower skirt and the cone over it, a clay pot upturned on the apex, a stick through it
  const ry = y + H - 0.25, hc = r * 1.05 + 0.7;
  bag.add('thatch', lathe([[r + 0.85, -0.12], [r + 0.8, 0], [r * 0.55, hc * 0.45], [r * 0.45, hc * 0.45 + 0.02], [0.001, hc * 0.45 + 0.02]], 20, (th) => 1 + 0.02 * Math.sin(th * 13 + el.seed), x, ry, z));
  bag.add('thatch', lathe([[r * 0.62, hc * 0.38], [r * 0.6, hc * 0.42], [0.12, hc], [0.001, hc + 0.02]], 18, (th) => 1 + 0.025 * Math.sin(th * 11), x, ry, z));
  bag.add('terracotta', lathe([[0.001, hc - 0.12], [0.16, hc - 0.1], [0.2, hc + 0.05], [0.15, hc + 0.22], [0.09, hc + 0.26], [0.001, hc + 0.26]], 10, null, x, ry, z));
  bag.add('timber', lathe([[0.025, hc + 0.2], [0.02, hc + 0.75], [0.001, hc + 0.76]], 5, null, x, ry, z));
  col.circle(x, z, r + 0.6, ry, ry + hc * 0.6);
  // the yard's low wall of piled stones, round part of the house
  if (el.yard && rand() < 0.55) {
    const R = r + 1.8 + rand() * 0.6, a0 = a + 0.6, a1 = a + Math.PI * 2 - 0.6, n = Math.ceil((a1 - a0) * R / 1.2), t = [];
    for (let k = 0; k < n; k++) { const b0 = a0 + (a1 - a0) * k / n, b1 = a0 + (a1 - a0) * (k + 1) / n, hh = 0.7 + rand() * 0.25; beamTris(t, [x + Math.cos(b0) * R, y - 0.3, z + Math.sin(b0) * R], [x + Math.cos(b1) * R, y - 0.3, z + Math.sin(b1) * R], 0.3, hh + 0.3); col.segment([x + Math.cos(b0) * R, z + Math.sin(b0) * R], [x + Math.cos(b1) * R, z + Math.sin(b1) * R], 0.6, y, y + hh); }
    bag.add('rubble', fromTriangles(t));
  }
}

/** cave: a cell or tomb cut into a pit's rock face { c [x, z] on the face, n (outward normal of the face, [nx, nz]), y, w, h }: the dark mouth with a rounded head, a hewn lip round it, a worn step below. */
function cave(el, { bag }) {
  const [cx, cz] = el.c, n = el.n, u = [-n[1], n[0]], w = el.w ?? 1, h = el.h ?? 1.6, y = el.y, N = 8, open = [], lip = [];
  const V = (a, yy, d) => [cx + u[0] * a + n[0] * d, yy, cz + u[1] * a + n[1] * d];
  const head = (k) => { const f = Math.PI * k / N; return [-Math.cos(f) * w / 2, y + h - w / 2 + Math.sin(f) * w / 2]; };
  for (let k = 0; k < N; k++) { const [a0, y0] = head(k), [a1, y1] = head(k + 1); open.push(...V(0, y + h - w / 2, 0.02), ...V(a0, y0, 0.02), ...V(a1, y1, 0.02)); beamTris(lip, V(a0 * 1.12, y0 + 0.04, 0.03), V(a1 * 1.12, y1 + 0.04, 0.03), 0.04, 0.1); }
  open.push(...V(-w / 2, y, 0.02), ...V(w / 2, y, 0.02), ...V(w / 2, y + h - w / 2, 0.02), ...V(-w / 2, y, 0.02), ...V(w / 2, y + h - w / 2, 0.02), ...V(-w / 2, y + h - w / 2, 0.02));
  bag.add('opening', fromTriangles(orientOut(open, n)));
  for (const sg of [-1, 1]) beamTris(lip, V(sg * w * 0.56 - 0.05, y, 0.03), V(sg * w * 0.56 + 0.05, y, 0.03), 0.04, h - w / 2 + 0.04);
  bag.add(TH, fromTriangles(lip));
  if (y > el.floor + 0.3) bag.add(TU, orientedBox([cx - u[0] * w * 0.6 + n[0] * 0.25, cz - u[1] * w * 0.6 + n[1] * 0.25], [cx + u[0] * w * 0.6 + n[0] * 0.25, cz + u[1] * w * 0.6 + n[1] * 0.25], 0.5, el.floor, y));
}
/** hand_cross: a priest's hand cross of brass held upright { at [x, z], y (the hand), rot }: a short grip, a knop, the cross with flared arms in an open ring. */
function handCross(el, { bag }) {
  const [x, z] = el.at, y = el.y, r = el.rot ?? 0, ux = Math.cos(r), uz = -Math.sin(r), M = 'bronze', t = [];
  bag.add(M, lathe([[0.012, -0.06], [0.012, 0.1], [0.022, 0.12], [0.012, 0.14], [0.001, 0.14]], 6, null, x, y, z));
  const yc = y + 0.26, P = (a, yy) => [x + ux * a, yy, z + uz * a];
  beamTris(t, P(-0.009, y + 0.14), P(0.009, y + 0.14), 0.006, 0.24);
  beamTris(t, P(-0.1, yc - 0.008), P(0.1, yc - 0.008), 0.006, 0.016);
  for (let k = 0; k < 12; k++) { const a0 = k / 12 * Math.PI * 2, a1 = (k + 1) / 12 * Math.PI * 2; beamTris(t, P(Math.cos(a0) * 0.075, yc + Math.sin(a0) * 0.075), P(Math.cos(a1) * 0.075, yc + Math.sin(a1) * 0.075), 0.006, 0.012); }
  for (const [a, b] of [[[0, 0.12], [0, 0.07]], [[-0.03, 0.12], [0.03, 0.12]]]) beamTris(t, P(a[0], yc + a[1]), P(b[0], yc + b[1]), 0.006, 0.012);
  bag.add(M, fromTriangles(t));
}
/** A frame for things held by a figure { at, y, rot }: local (x, y, z), the figure facing −z at rot 0. */
function heldFrame(el) { const [X, Z] = el.at, r = el.rot ?? 0, Y = el.y ?? 0; return (g) => g.rotateY(r).translate(X, Y, Z); }
/**
 * sistrum: the tsenatsel, the sistrum shaken by deacons and priests { at, y (the hand), rot }: a
 * turned wooden grip, a U-frame of brass, three rods across it each carrying loose metal discs.
 */
function sistrum(el, { bag }) {
  const W = heldFrame(el), t = [], d = [];
  bag.add('timber', W(lathe([[0.016, -0.08], [0.018, 0.04], [0.026, 0.06], [0.02, 0.08], [0.001, 0.08]], 8)));
  const fr = (a, b) => beamTris(t, a, b, 0.006, 0.012);
  // the frame: two uprights rising from a yoke, an arched top
  fr([-0.05, 0.075, 0], [0.05, 0.075, 0]);
  for (const sx of [-0.045, 0.045]) fr([sx, 0.08, 0], [sx, 0.3, 0]);
  for (let k = 0; k < 8; k++) { const a0 = Math.PI * k / 8, a1 = Math.PI * (k + 1) / 8; fr([-Math.cos(a0) * 0.045, 0.3 + Math.sin(a0) * 0.03, 0], [-Math.cos(a1) * 0.045, 0.3 + Math.sin(a1) * 0.03, 0]); }
  for (const yy of [0.14, 0.2, 0.26]) {
    fr([-0.05, yy, 0], [0.05, yy, 0]);
    for (const xx of [-0.022, 0.0, 0.022]) d.push(lathe([[0.001, -0.002], [0.014, -0.002], [0.014, 0.002], [0.001, 0.002]], 8).rotateX(Math.PI / 2).translate(xx, yy, 0));
  }
  const g = fromTriangles(t);
  bag.add('bronze', W(g));
  for (const q of d) bag.add('bronze', W(q));
}
/**
 * kebero: the church drum { at, y, rot, held }: a long body of wood, the larger head at one end, the
 * smaller at the other, hide laced over both; held: slung across a standing figure's front at the
 * height of its hands (a figure in the 'row' arm pose), its strap over the left shoulder; else lying
 * on the floor.
 */
function kebero(el, { bag }) {
  const W = heldFrame(el), L = 0.66;
  const body = lathe([[0.001, -L / 2], [0.2, -L / 2], [0.235, -0.1], [0.225, 0.08], [0.16, L / 2], [0.001, L / 2]], 14);
  const heads = [lathe([[0.001, -L / 2 - 0.006], [0.205, -L / 2 - 0.006], [0.205, -L / 2 + 0.04], [0.001, -L / 2 + 0.04]], 14), lathe([[0.001, L / 2 - 0.04], [0.165, L / 2 - 0.04], [0.165, L / 2 + 0.006], [0.001, L / 2 + 0.006]], 14)];
  // the lacing: thongs from head to head along the body
  const lace = [];
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, b = a + 0.25; beamTris(lace, [Math.cos(a) * 0.205, -L / 2 + 0.03, Math.sin(a) * 0.205], [Math.cos(b) * 0.232, -0.1, Math.sin(b) * 0.232], 0.005, 0.008); beamTris(lace, [Math.cos(b) * 0.232, -0.1, Math.sin(b) * 0.232], [Math.cos(a) * 0.168, L / 2 - 0.03, Math.sin(a) * 0.168], 0.005, 0.008); }
  const lg = fromTriangles(lace);
  const pose = (g) => (el.held ? g.rotateZ(Math.PI / 2).translate(0, 0.9, -0.36) : g.rotateZ(Math.PI / 2).translate(0, 0.235, 0));
  bag.add('wood_dark', W(pose(body)));
  for (const h of heads) bag.add('hide_tan', W(pose(h)));
  bag.add('hide_brown', W(pose(lg)));
  if (el.held) { const s = []; beamTris(s, [-0.3, 0.92, -0.36], [-0.19, 1.36, -0.02], 0.02, 0.01); beamTris(s, [0.3, 0.92, -0.36], [0.17, 1.2, 0.12], 0.02, 0.01); bag.add('hide_brown', W(fromTriangles(s))); }
}
/** floor_mat: a mat of rushes laid on a floor { rect, y }. */
function floorMat(el, { bag }) { const [x0, z0, x1, z1] = el.rect; bag.add('reed_mat', box(x0, el.y, z0, x1, el.y + 0.015, z1)); }
/** curtain: a cloth hung in folds from a rod { a, b ([x, z]), y (the floor), h (the rod), mat }. */
function curtain(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, y = el.y, h = el.h, tt = [];
  beamTris(tt, [ax - ux * 0.1, y + h, az - uz * 0.1], [bx + ux * 0.1, y + h, bz + uz * 0.1], 0.03, 0.06); bag.add('timber', fromTriangles(tt));
  const C = [], N = Math.max(6, Math.round(L / 0.18));
  const V = (k, yy) => { const s = L * k / N, d = 0.07 * Math.sin(k * Math.PI / 2); return [ax + ux * s + nx * d, yy, az + uz * s + nz * d]; };
  for (let k = 0; k < N; k++) { const a = V(k, y + 0.04), b = V(k + 1, y + 0.04), c = V(k + 1, y + h - 0.02), d = V(k, y + h - 0.02); C.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); }
  bag.add(el.mat || 'cloth_red', fromTriangles(C)); col.segment(el.a, el.b, 0.2, y, y + h);
}

registerStyle('zagwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, rock_cut: rockCut, giyorgis, basilica, aksumite, maryam, tukul, hut, umbrella, proc_cross: procCross, cave, hand_cross: handCross, sistrum, kebero, floor_mat: floorMat, curtain, yard: yardEl, terrace: terraceEl, court: courtEl, cloth_pile: clothPile, lamp: lampEl },
  objects: {},
});
