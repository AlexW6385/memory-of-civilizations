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
function aksWindow(bag, c, y, u, n, w, h) {
  const P = (a, d) => [c[0] + u[0] * a + n[0] * d, c[1] + u[1] * a + n[1] * d];
  const bar = (a0, a1, y0, y1, d0, d1) => bag.add(TH, orientedBox(P(a0, (d0 + d1) / 2), P(a1, (d0 + d1) / 2), d1 - d0, y0, y1));
  bag.add('opening', orientedBox(P(-w / 2, -0.1), P(w / 2, -0.1), 0.26, y, y + h));
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
}

/** A Greek cross [arms of half-length a, half-width w] at c from y0 to y1, as five boxes (no faces overlapping). */
function cross(bag, col, mat, cx, cz, a, w, y0, y1) {
  for (const r of [[cx - w, cz - w, cx + w, cz + w], [cx - a, cz - w, cx - w, cz + w], [cx + w, cz - w, cx + a, cz + w], [cx - w, cz - a, cx + w, cz - w], [cx - w, cz + w, cx + w, cz + a]]) solid(bag, col, mat, r, y0, y1);
}
/** giyorgis: Bete Giyorgis { c, y0 (the pit floor), h, a, w }: three receding cross-shaped tiers, windows, doors, the roof's nested crosses. */
function giyorgis(el, { bag, col }) {
  const [cx, cz] = el.c, y0 = el.y0, a = el.a, w = el.w, top = y0 + el.h;
  cross(bag, col, TH, cx, cz, a + 0.8, w + 0.8, y0, y0 + 0.9);
  cross(bag, col, TH, cx, cz, a + 0.4, w + 0.4, y0 + 0.9, y0 + 1.8);
  cross(bag, col, TH, cx, cz, a, w, y0 + 1.8, top);
  // the arms' faces: a lower and an upper row of windows; doors on the west, north and south arms
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const r = dx ? [cx + dx * a - (dx > 0 ? 0 : 0), cz - w, cx + dx * a, cz + w] : [cx - w, cz + dz * a, cx + w, cz + dz * a];
    const n = [dx, dz], face = dx ? [[cx + dx * (a + 0.03), cz - w * 0.55], [cx + dx * (a + 0.03), cz + w * 0.55]] : [[cx - w * 0.55, cz + dz * (a + 0.03)], [cx + w * 0.55, cz + dz * (a + 0.03)]];
    void r; void n;
    const u = dx ? [0, 1] : [1, 0], nn = [dx, dz];
    for (const p of face) { const c = dx ? [cx + dx * a, p[1]] : [p[0], cz + dz * a]; aksWindow(bag, c, y0 + 4.5, u, nn, 0.9, 1.7); ogeeWindow(bag, c, y0 + 8.0, u, nn, 0.8, 1.1); }
    if (dx !== 1) { const t = []; if (dx) beamTris(t, [cx + dx * (a + 0.03), y0 + 1.8, cz - 1], [cx + dx * (a + 0.03), y0 + 1.8, cz + 1], 0.04, 2.8); else beamTris(t, [cx - 1, y0 + 1.8, cz + dz * (a + 0.03)], [cx + 1, y0 + 1.8, cz + dz * (a + 0.03)], 0.04, 2.8); bag.add('timber', fromTriangles(t)); }
  }
  // the roof, level with the ground round the pit: three Greek crosses nested one within another,
  // each stepped up from the last (the triple cross carved on the roof)
  let yr = top;
  for (const [sA, sW, hgt] of [[0.86, 0.8, 0.14], [0.6, 0.55, 0.14], [0.34, 0.3, 0.14]]) {
    const A = a * sA, Wd = w * sW;
    for (const r of [[cx - Wd, cz - Wd, cx + Wd, cz + Wd], [cx - A, cz - Wd, cx - Wd, cz + Wd], [cx + Wd, cz - Wd, cx + A, cz + Wd], [cx - Wd, cz - A, cx + Wd, cz - Wd], [cx - Wd, cz + Wd, cx + Wd, cz + A]]) bag.add(TH, box(r[0], yr, r[1], r[2], yr + hgt, r[3]));
    yr += hgt;
  }
}

/** basilica: Bete Medhane Alem { rect, y0, h, cols: [nLong, nShort] }: the body with Aksumite windows, square pillars round it carrying the roof's overhang, a low gabled roof. */
function basilica(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0, h = el.h, o = 2.4, [nl, ns] = el.cols ?? [11, 7];
  const body = [x0 + o, z0 + o, x1 - o, z1 - o];
  solid(bag, col, TH, [x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y0, y0 + 0.8);
  solid(bag, col, TH, body, y0 + 0.8, y0 + h - 1.6);
  openings(bag, body, y0 + 3.2, 1.6, 0.9, 2.6, true);
  openings(bag, body, y0 + 6.4, 1.2, 0.7, 2.6);
  { const t = []; beamTris(t, [body[0] - 0.04, y0 + 0.8, (z0 + z1) / 2 - 1.1], [body[0] - 0.04, y0 + 0.8, (z0 + z1) / 2 + 1.1], 0.04, 3); bag.add('timber', fromTriangles(t)); }
  // the pillars round it, the roof slab, the low gable
  const ring = [];
  for (let i = 0; i < nl; i++) { const x = x0 + 0.7 + (x1 - x0 - 1.4) * i / (nl - 1); ring.push([x, z0 + 0.7], [x, z1 - 0.7]); }
  for (let j = 1; j < ns - 1; j++) { const z = z0 + 0.7 + (z1 - z0 - 1.4) * j / (ns - 1); ring.push([x0 + 0.7, z], [x1 - 0.7, z]); }
  for (const [x, z] of ring) { bag.add(TH, box(x - 0.55, y0 + 0.8, z - 0.55, x + 0.55, y0 + h - 1.6, z + 0.55)); col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y0, y0 + h); }
  solid(bag, col, TH, [x0, z0, x1, z1], y0 + h - 1.6, y0 + h - 0.6);
  const t = [], yb = y0 + h - 0.6, yr = y0 + h, zc = (z0 + z1) / 2;
  t.push(x0, yb, z0, x1, yb, z0, x1, yr, zc, x0, yb, z0, x1, yr, zc, x0, yr, zc, x0, yb, z1, x0, yr, zc, x1, yr, zc, x0, yb, z1, x1, yr, zc, x1, yb, z1, x0, yb, z0, x0, yr, zc, x0, yb, z1, x1, yb, z0, x1, yb, z1, x1, yr, zc);
  bag.add(TH, fromTriangles(t));
}

/** aksumite: a church in the Aksumite manner { rect, y0, h }: walls in recessed and projecting courses with beam ends, windows, a door on the west, a flat roof. */
function aksumite(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0, h = el.h, band = 1.3;
  solid(bag, col, TH, [x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y0, y0 + 0.9);
  let y = y0 + 0.9, k = 0;
  while (y < y0 + h - 0.1) {
    const y2 = Math.min(y0 + h, y + band), inset = k % 2 ? 0.2 : 0;
    bag.add(TH, box(x0 + inset, y, z0 + inset, x1 - inset, y2, z1 - inset));
    if (k % 2 === 0 && y2 < y0 + h - 0.5) for (const [ax, az, bx, bz] of [[x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1]]) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 1.6);
      for (let i = 1; i < n; i++) { const px = ax + (bx - ax) * i / n, pz = az + (bz - az) * i / n; bag.add(TH, box(px - 0.18, y2 - 0.36, pz - 0.18, px + 0.18, y2, pz + 0.18)); }
    }
    y = y2; k++;
  }
  col.rect([x0, z0, x1, z1], y0, y0 + h); col.floor([x0, z0, x1, z1], y0 + h);
  openings(bag, [x0, z0, x1, z1], y0 + h * 0.55, 1.4, 0.8, 3.2, true);
  const t = []; beamTris(t, [x0 - 0.04, y0 + 0.9, (z0 + z1) / 2 - 0.9], [x0 - 0.04, y0 + 0.9, (z0 + z1) / 2 + 0.9], 0.04, 2.6); bag.add('timber', fromTriangles(t));
}

/** tukul: a round house { c, r, storeys, seed }: a stone drum (two storeys for some, with an upper door), a conical thatched roof. */
function tukul(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x, z] = el.c, r = el.r, st = el.storeys ?? 1, H = st === 2 ? 5.6 : 2.8, y = el.y ?? 0;
  bag.add('rubble', lathe([[r, -0.5], [r, H], [0.001, H]], 16, null, x, y, z));
  col.circle(x, z, r, y, y + H);
  const a = rand() * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a), t = [];
  beamTris(t, [x + dx * (r + 0.02) - dz * 0.5, y, z + dz * (r + 0.02) + dx * 0.5], [x + dx * (r + 0.02) + dz * 0.5, y, z + dz * (r + 0.02) - dx * 0.5], 0.04, 1.9);
  if (st === 2) beamTris(t, [x + dx * (r + 0.02) - dz * 0.45, y + 3.2, z + dz * (r + 0.02) + dx * 0.45], [x + dx * (r + 0.02) + dz * 0.45, y + 3.2, z + dz * (r + 0.02) - dx * 0.45], 0.04, 1.6);
  bag.add('timber', fromTriangles(t));
  bag.add('thatch', lathe([[r + 0.7, 0], [r * 0.5, r * 0.6], [0.001, r * 1.1 + 0.6]], 16, null, x, y + H - 0.3, z));
  col.circle(x, z, r + 0.5, y + H - 0.3, y + H + r);
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
registerStyle('zagwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, rock_cut: rockCut, giyorgis, basilica, aksumite, tukul, cave, hand_cross: handCross },
  objects: {},
});
