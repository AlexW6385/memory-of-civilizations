// Zagwe architecture of Lalibela (c. 1200; docs/settlements/lalibela.md §4): churches cut down
// into the red tuff, standing free in their pits — Bete Giyorgis as a Greek cross in three
// receding tiers, its roof carved with nested crosses; Bete Medhane Alem as a basilica ringed by
// square pillars under its roof; the others in Aksumite manner, the walls in recessed and
// projecting courses with beam ends; the pits' and trenches' rock walls; round stone houses with
// conical thatch.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';

const TU = 'tuff_red', TH = 'tuff_hewn';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function solid(bag, col, mat, r, y0, y1) { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); col.floor(r, y1); }
/** Dark openings on the face of a box [x0, z0, x1, z1] at height y (n per side, w × h). */
function openings(bag, r, y, h, w, step, skipMid = false) {
  const [x0, z0, x1, z1] = r;
  for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, -1], [x0, z1, x1, z1, 0, 1], [x0, z0, x0, z1, -1, 0], [x1, z0, x1, z1, 1, 0]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.floor(L / step));
    for (let i = 0; i < n; i++) {
      if (skipMid && n % 2 === 1 && i === (n - 1) / 2) continue;
      const s = (i + 0.5) * L / n, px = ax + (bx - ax) * s / L + nx * 0.03, pz = az + (bz - az) * s / L + nz * 0.03, ux = (bx - ax) / L, uz = (bz - az) / L, t = [];
      beamTris(t, [px - ux * w / 2, y, pz - uz * w / 2], [px + ux * w / 2, y, pz + uz * w / 2], 0.04, h); bag.add('lacquer_black', fromTriangles(t));
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
    for (const [yy, hh] of [[y0 + 4.5, 1.8], [y0 + 8.2, 1.6]]) for (const p of face) { const t = []; if (dx) beamTris(t, [p[0], yy, p[1] - 0.45], [p[0], yy, p[1] + 0.45], 0.04, hh); else beamTris(t, [p[0] - 0.45, yy, p[1]], [p[0] + 0.45, yy, p[1]], 0.04, hh); bag.add('lacquer_black', fromTriangles(t)); }
    if (dx !== 1) { const t = []; if (dx) beamTris(t, [cx + dx * (a + 0.03), y0 + 1.8, cz - 1], [cx + dx * (a + 0.03), y0 + 1.8, cz + 1], 0.04, 2.8); else beamTris(t, [cx - 1, y0 + 1.8, cz + dz * (a + 0.03)], [cx + 1, y0 + 1.8, cz + dz * (a + 0.03)], 0.04, 2.8); bag.add('timber', fromTriangles(t)); }
  }
  // the roof: three nested crosses in low relief
  for (const [s, hgt] of [[0.85, 0.12], [0.6, 0.24], [0.35, 0.36]]) {
    const A = a * s, W = Math.max(0.6, w * s * 0.7);
    for (const r of [[cx - A, cz - W, cx + A, cz + W], [cx - W, cz - A, cx - W + 0.001 + 2 * W, cz - W], [cx - W, cz + W, cx + W, cz + A]]) bag.add(TH, box(r[0], top, r[1], r[2], top + hgt, r[3]));
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

registerStyle('zagwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, rock_cut: rockCut, giyorgis, basilica, aksumite, tukul },
  objects: {},
});
