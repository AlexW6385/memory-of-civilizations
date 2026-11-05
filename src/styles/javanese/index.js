// Sailendra Javanese architecture (c. 800–825; docs/settlements/borobudur.md §4): Borobudur —
// redented square terraces of grey andesite with walled galleries, balustrades lined with niches
// and small stupas, steep stairs through the middle of each side, circular terraces of latticed
// bell stupas, the crowning stupa — and the timber building of the reliefs: houses raised on posts
// with walls of woven bamboo under steep thatched saddle roofs, open pavilions on platforms.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import '../qing/index.js';

const A = 'andesite';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function roof(bag, [x0, z0, x1, z1], y, o, kind, rise, mat, alongZ) {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, az = alongZ ?? d > w;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (az ? d : w) / 2, B: (az ? w : d) / 2, y, rise, kind, sweep: kind === 'gable' ? 0 : 0.4, p: 1.1, alongZ: az, curl: false, mat, soffit: 'timber' }, bag);
}
/** The outline of a redented square (half a; the middle third of each side set out by p), as points round it. */
function redent(cx, cz, a, p) {
  const t = a / 3, pts = [[-a, -a], [-t, -a], [-t, -a - p], [t, -a - p], [t, -a], [a, -a], [a, -t], [a + p, -t], [a + p, t], [a, t], [a, a], [t, a], [t, a + p], [-t, a + p], [-t, a], [-a, a], [-a, t], [-a - p, t], [-a - p, -t], [-a, -t]];
  return pts.map(([x, z]) => [cx + x, cz + z]);
}
function slab(bag, mat, a, b, y, th, h) { const t = []; beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h); bag.add(mat, fromTriangles(t)); }
/** A small stupa (bell, harmika, spire) of radius r at (x, y, z); `lattice` for the pierced ones. */
function stupa(bag, x, y, z, r, lattice = false) {
  const S = r < 1 ? 8 : r < 3 ? 14 : 32, NR = r < 1 ? 4 : 10;
  bag.add(A, lathe([[r * 1.18, 0], [r * 1.18, r * 0.18], [r * 1.05, r * 0.3], [r * 1.0, r * 0.32]], S, null, x, y, z));
  const bell = []; for (let i = 0; i <= NR; i++) { const t = i / NR; bell.push([Math.max(0.001, r * (1 - 0.18 * t) * Math.cos(t * Math.PI / 2) ** 0.7), r * 0.32 + r * 1.25 * Math.sin(t * Math.PI / 2)]); }
  bag.add(lattice ? 'andesite_lattice' : A, lathe(bell, S, null, x, y, z));
  const hy = y + r * 1.5;
  bag.add(A, box(x - r * 0.28, hy, z - r * 0.28, x + r * 0.28, hy + r * 0.32, z + r * 0.28));
  bag.add(A, lathe([[r * 0.16, 0], [r * 0.03, r * 0.7], [0.001, r * 0.72]], r < 1 ? 4 : 8, null, x, hy + r * 0.32, z));
}

/**
 * borobudur: the monument { c, base: { a, p, h, foot }, squares: [{ a, y }] (the five terraces'
 * half-widths and top heights), circles: [{ r, y, n }], crown: { r, y, h } }.
 */
function borobudur(el, { bag, col }) {
  const [cx, cz] = el.c, B = el.base, p = B.p;
  // the plinth and the base
  const level = (a, y0, y1, mat = A) => {
    const t = a / 3;
    for (const r of [[-a, -a, a, a], [-t, -a - p, t, -a], [-t, a, t, a + p], [-a - p, -t, -a, t], [a, -t, a + p, t]]) {
      const R = [cx + r[0], cz + r[1], cx + r[2], cz + r[3]];
      bag.add(mat, box(R[0], y0, R[1], R[2], y1, R[3])); col.rect(R, y0, y1); col.floor(R, y1);
    }
  };
  level(B.a + B.foot, 0, 1.5); level(B.a, 1.5, B.h);
  // balustrade round an outline at height y, broken for the four stairs; niches and small stupas on it
  const balustrade = (a, y, h = 1.7) => {
    const P = redent(cx, cz, a, p);
    for (let k = 0; k < P.length; k++) {
      const q0 = P[k], q1 = P[(k + 1) % P.length], L = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]);
      const ux = (q1[0] - q0[0]) / L, uz = (q1[1] - q0[1]) / L, mx = (q0[0] + q1[0]) / 2 - cx, mz = (q0[1] + q1[1]) / 2 - cz;
      // the middle segment of each side's projection holds the stair: leave a 4 m gap
      const pieces = (Math.abs(ux) > 0.5 && Math.abs(mx) < 1) || (Math.abs(uz) > 0.5 && Math.abs(mz) < 1) ? [[0, L / 2 - 2], [L / 2 + 2, L]] : [[0, L]];
      for (const [s0, s1] of pieces) {
        if (s1 - s0 < 0.5) continue;
        const a0 = [q0[0] + ux * s0, q0[1] + uz * s0], a1 = [q0[0] + ux * s1, q0[1] + uz * s1];
        slab(bag, A, a0, a1, y, 0.9, h); col.segment(a0, a1, 0.9, y, y + h);
        const n = Math.floor((s1 - s0) / 3.6);
        for (let i = 0; i < n; i++) { const s = s0 + (i + 0.5) * (s1 - s0) / n, c = [q0[0] + ux * s, q0[1] + uz * s]; stupa(bag, c[0], y + h, c[1], 0.42); }
      }
    }
  };
  balustrade(B.a + 0.2, B.h);
  let prevY = B.h;
  for (const s of el.squares) {
    level(s.a, prevY, s.y);
    // the main wall's niches (dark) along each straight side of this terrace's face
    for (const [sx, sz, nx, nz] of [[1, 0, 0, -1], [1, 0, 0, 1], [0, 1, -1, 0], [0, 1, 1, 0]]) {
      const H = s.y - prevY;
      if (H < 2.6) continue;
      // the niches with their seated Buddhas in the upper part of the wall
      for (let u = -s.a + 3; u < s.a - 2; u += 4.5) {
        if (Math.abs(u) < s.a / 3 + 1) continue;
        const px = cx + sx * u + nx * (s.a + 0.02), pz = cz + sz * u + nz * (s.a + 0.02), t = [], nh = Math.min(1.5, H * 0.32), ny0 = s.y - nh - 0.35;
        beamTris(t, [px - sx * 0.7, ny0, pz - sz * 0.7], [px + sx * 0.7, ny0, pz + sz * 0.7], 0.05, nh);
        bag.add('lacquer_black', fromTriangles(t));
        bag.add(A, lathe([[0.42, 0], [0.4, 0.25], [0.24, 0.45], [0.26, 0.75], [0.14, 0.95], [0.001, 1.0]], 8, null, px + nx * 0.25, ny0 + 0.05, pz + nz * 0.25));
      }
      // the narrative reliefs below them: two registers of framed panels, figures standing out in each
      const regs = H > 3.6 ? 2 : 1, rh = (H - Math.min(1.5, H * 0.32) - 0.9) / regs;
      for (let r2 = 0; r2 < regs; r2++) {
        const y0 = prevY + 0.35 + r2 * rh, t = [], fig = [];
        for (let u = -s.a + 1.6; u < s.a - 1.6; u += 2.7) {
          if (Math.abs(u) < s.a / 3 + 1.2 && Math.abs(u) > 2.4) { /* the projections are plain where the stair passes */ }
          if (Math.abs(u) < 2.4) continue;
          const px = cx + sx * u + nx * (s.a + 0.04), pz = cz + sz * u + nz * (s.a + 0.04);
          beamTris(t, [px - sx * 1.25, y0, pz - sz * 1.25], [px + sx * 1.25, y0, pz + sz * 1.25], 0.06, rh - 0.25);
          for (const d of [-0.75, -0.2, 0.4, 0.85]) { const fx = px + sx * d + nx * 0.07, fz = pz + sz * d + nz * 0.07, fh = (rh - 0.6) * (d === 0.4 ? 0.7 : 1); beamTris(fig, [fx - sx * 0.14, y0 + 0.12, fz - sz * 0.14], [fx + sx * 0.14, y0 + 0.12, fz + sz * 0.14], 0.05, fh); }
        }
        bag.add(A, fromTriangles(t)); bag.add(A, fromTriangles(fig));
      }
    }
    balustrade(s.a, s.y, 1.5);
    prevY = s.y;
  }
  // the stairs on the four sides, level by level
  const levels = [[B.a + p + B.foot, 0], [B.a + p, B.h], ...el.squares.map((s) => [s.a + p, s.y])];
  for (let i = 0; i + 1 < levels.length; i++) {
    const [aOut, y0] = levels[i], [aIn, y1] = levels[i + 1], run = Math.max(2.4, (y1 - y0) * 1.0);
    const e0 = aIn, e1 = aIn + run;
    for (const [dir, rect] of [['s', [cx - 1.6, cz - e1, cx + 1.6, cz - e0]], ['n', [cx - 1.6, cz + e0, cx + 1.6, cz + e1]], ['e', [cx - e1, cz - 1.6, cx - e0, cz + 1.6]], ['w', [cx + e0, cz - 1.6, cx + e1, cz + 1.6]]]) {
      STYLES.qing.elements.stairs({ rect, y0, y1, dir, mat: A }, { bag, col });
    }
    void aOut;
  }
  // the circular terraces with their latticed stupas, the crowning stupa
  let y = prevY;
  for (const c of el.circles) {
    bag.add(A, lathe([[c.r + 1.6, 0], [c.r + 1.6, c.y - y], [0.001, c.y - y]], 48, null, cx, y, cz));
    col.circle(cx, cz, c.r + 1.6, y, c.y);
    for (let k = 0; k < c.n; k++) { const a = (k + 0.5) / c.n * Math.PI * 2; stupa(bag, cx + Math.cos(a) * c.r, c.y, cz + Math.sin(a) * c.r, 1.7, true); col.circle(cx + Math.cos(a) * c.r, cz + Math.sin(a) * c.r, 2, c.y, c.y + 4.5); }
    y = c.y;
  }
  col.floor([cx - 30, cz - 30, cx + 30, cz + 30], y);
  stupa(bag, cx, y, cz, el.crown.r);
  col.circle(cx, cz, el.crown.r * 1.18, y, y + el.crown.r * 2.4);
}

/** rumah: a house on posts { rect, seed }: posts, a raised floor, walls of woven bamboo, a steep thatched saddle roof flaring at the ridge. */
function rumah(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, fl = 1.4 + rand() * 0.6, H = 2.4;
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [(x0 + x1) / 2, z0], [(x0 + x1) / 2, z1]]) { bag.add('timber', box(x - 0.13, 0, z - 0.13, x + 0.13, fl, z + 0.13)); col.circle(x, z, 0.15, 0, fl); }
  bag.add('timber', box(x0 - 0.2, fl, z0 - 0.2, x1 + 0.2, fl + 0.2, z1 + 0.2)); col.floor([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], fl + 0.2);
  bag.add('reed_mat', box(x0 + 0.3, fl + 0.2, z0 + 0.3, x1 - 0.3, fl + H, z1 - 0.3)); col.rect([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], fl, fl + H);
  const alongX = x1 - x0 >= z1 - z0;
  roof(bag, [x0, z0, x1, z1], fl + H - 0.1, 0.9, 'gable', Math.min(x1 - x0, z1 - z0) * 0.85, rand() < 0.5 ? 'thatch_palm' : 'ijuk', !alongX);
  // a ladder to the door
  const zf = z1 + 0.25, xc = (x0 + x1) / 2;
  for (let k = 0; k < 4; k++) bag.add('timber', box(xc - 0.4, fl * k / 4, zf + 0.9 - k * 0.22, xc + 0.4, fl * k / 4 + 0.06, zf + 1.1 - k * 0.22));
}
/** pendopo: an open pavilion { rect, y } on a stone platform, posts, a steep hipped roof. */
function pendopo(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3.4;
  bag.add(A, box(x0 - 1, y, z0 - 1, x1 + 1, y + 0.8, z1 + 1)); col.rect([x0 - 1, z0 - 1, x1 + 1, z1 + 1], y, y + 0.8); col.floor([x0 - 1, z0 - 1, x1 + 1, z1 + 1], y + 0.8);
  const nx = Math.max(2, Math.round((x1 - x0) / 3) + 1), nz = Math.max(2, Math.round((z1 - z0) / 3) + 1);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { if (i > 0 && i < nx - 1 && j > 0 && j < nz - 1) continue; const x = x0 + (x1 - x0) * i / (nx - 1), z = z0 + (z1 - z0) * j / (nz - 1); bag.add('timber', box(x - 0.15, y + 0.8, z - 0.15, x + 0.15, y + 0.8 + h, z + 0.15)); col.circle(x, z, 0.18, y + 0.8, y + 0.8 + h); }
  roof(bag, [x0, z0, x1, z1], y + 0.8 + h, 1.4, 'hip', Math.min(x1 - x0, z1 - z0) * 0.7, el.mat || 'ijuk');
}
/** pagar: a low wall a→b { h } of brick with a coping. */
function pagar(el, { bag, col }) { slab(bag, 'brick', el.a, el.b, 0, 0.6, el.h ?? 2); slab(bag, A, el.a, el.b, el.h ?? 2, 0.8, 0.25); col.segment(el.a, el.b, 0.6, 0, (el.h ?? 2) + 0.25); }

registerStyle('javanese', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, borobudur, rumah, pendopo, pagar },
  objects: {},
});
