// The Liuhe Pagoda's upper five storeys dressed for eye level (docs/settlements/song-hangzhou.md §27).
//
// The style dresses only the two lowest storeys of the pagoda (a plinth, corner pilasters, framed doors and
// windows, the gallery's balusters); on the five above, pagoda_oct draws a black plank where a door or a
// window is and a bare rail. The galleries of the upper storeys are walkable from the inside stair, so they
// are looked at from a metre away. `hz_pagoda_upper` is the same programme for tiers `from`..last, composed
// here with the storeys' own differences: the plinth shortens, the windows narrow and the door leaves lose
// a row of studs as the tiers rise, and a brick-carved frieze (a band of small recessed panels, the Song
// pagodas' way of dressing a brick wall) runs under the eave of every storey.
//
//   { t: 'hz_pagoda_upper', c, y (the base's top), base: { r, h }, tiers, from: 2 }
import { STYLES } from '../../core/build.js';
import { lathe, fromTriangles } from '../../core/geom.js';
import { hexa } from '../../styles/song/kaifeng.js';
import '../../styles/song/index.js';

function dressUpper(el, { bag }) {
  const [cx, cz] = el.c, from = el.from ?? 2, n = el.tiers.length;
  const ng = (r) => Array.from({ length: 8 }, (_, k) => [cx + Math.cos(Math.PI / 8 + k * Math.PI / 4) * r, cz + Math.sin(Math.PI / 8 + k * Math.PI / 4) * r]);
  const OPEN = [2, 4, 6], K = 1 / Math.cos(Math.PI / 8);
  let y = el.y + el.base.h;
  for (let i = 0; i < from; i++) y += el.tiers[i].h;
  for (let i = from; i < n; i++) {
    const t = el.tiers[i], r = t.r, h = t.h, F0 = ng(r + 0.03), g = r + 2.4, up = (i - from) / Math.max(1, n - 1 - from);   // 0 at the third storey, 1 at the top
    const slab = (out, d0, d1, ya, yb) => {
      const A = ng(r + 0.03 + d0 * K), B = ng(r + 0.03 + d1 * K);
      for (let k = 0; k < 8; k++) { const k2 = (k + 1) % 8; hexa(out, [[A[k][0], ya, A[k][1]], [A[k2][0], ya, A[k2][1]], [B[k2][0], ya, B[k2][1]], [B[k][0], ya, B[k][1]], [A[k][0], yb, A[k][1]], [A[k2][0], yb, A[k2][1]], [B[k2][0], yb, B[k2][1]], [B[k][0], yb, B[k][1]]]); }
    };
    // the plinth of grey brick, 0.95 m at the third storey down to 0.7 m at the top, its granite cap
    const ph = 0.95 - 0.25 * up, plinth = [], cap = [];
    slab(plinth, 0, 0.1, y, y + ph); slab(cap, 0, 0.17, y + ph, y + ph + 0.12);
    bag.add('brick_grey', fromTriangles(plinth)); bag.add('granite_grey', fromTriangles(cap));
    // the corner pilasters: stone foot, red timber shaft, capital
    for (let k = 0; k < 8; k++) {
      const [px, pz] = ng(r + 0.03 + 0.1)[k];
      bag.add('granite_block', lathe([[0.24, 0], [0.24, 0.26], [0.19, 0.32], [0.001, 0.32]], 8, null, px, y + ph + 0.12, pz));
      bag.add('timber_red', lathe([[0.16, 0], [0.14, h - 2.5 - ph]], 8, null, px, y + ph + 0.44, pz));
      bag.add('granite_grey', lathe([[0.14, 0], [0.22, 0.08], [0.22, 0.2], [0.001, 0.2]], 8, null, px, y + h - 1.0, pz));
    }
    // the brick-carved frieze under the eave: a band of small recessed panels in a grey frame, a lotus boss in each [inferred]
    {
      const fr = [], dk = [], by0 = y + h - 0.95, by1 = y + h - 0.62;
      slab(fr, 0, 0.07, by0 - 0.04, by0); slab(fr, 0, 0.07, by1, by1 + 0.04);
      for (let k = 0; k < 8; k++) {
        const a = F0[k], b = F0[(k + 1) % 8], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, nx = mx - cx, nz = mz - cz, nl = Math.hypot(nx, nz), ox = nx / nl, oz = nz / nl;
        const np = Math.max(4, Math.round((L - 0.9) / 0.62)), pw = (L - 0.9) / np;
        const Q = (u, yy, d) => [mx + ux * u + ox * d, yy, mz + uz * u + oz * d];
        for (let p = 0; p <= np; p++) { const u = -(L - 0.9) / 2 + p * pw; hexa(fr, [Q(u - 0.025, by0, 0.0), Q(u + 0.025, by0, 0.0), Q(u + 0.025, by0, 0.07), Q(u - 0.025, by0, 0.07), Q(u - 0.025, by1, 0.0), Q(u + 0.025, by1, 0.0), Q(u + 0.025, by1, 0.07), Q(u - 0.025, by1, 0.07)]); }
        for (let p = 0; p < np; p++) { const uc = -(L - 0.9) / 2 + (p + 0.5) * pw; hexa(dk, [Q(uc - pw / 2 + 0.04, by0 + 0.02, 0.0), Q(uc + pw / 2 - 0.04, by0 + 0.02, 0.0), Q(uc + pw / 2 - 0.04, by0 + 0.02, 0.04), Q(uc - pw / 2 + 0.04, by0 + 0.02, 0.04), Q(uc - pw / 2 + 0.04, by1 - 0.02, 0.0), Q(uc + pw / 2 - 0.04, by1 - 0.02, 0.0), Q(uc + pw / 2 - 0.04, by1 - 0.02, 0.04), Q(uc - pw / 2 + 0.04, by1 - 0.02, 0.04)]); }
        for (let p = 0; p < np; p++) { const uc = -(L - 0.9) / 2 + (p + 0.5) * pw, c = Q(uc, (by0 + by1) / 2, 0.045); bag.add('granite_grey', lathe([[0.001, 0], [0.07, 0.0], [0.06, 0.03], [0.001, 0.045]], 6).rotateX(Math.PI / 2).rotateY(Math.atan2(ox, oz)).translate(c[0], c[1], c[2])); }
      }
      bag.add('granite_grey', fromTriangles(fr)); bag.add('slate', fromTriangles(dk));
    }
    // the faces: on the closed diagonal (k = 0) a pair of studded lacquer doors, on the compass faces a window
    for (let k = 0; k < 8; k++) {
      if (OPEN.includes(k)) continue;
      const a = F0[k], b = F0[(k + 1) % 8], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = mx - cx, nz = mz - cz, nl = Math.hypot(nx, nz), ox = nx / nl, oz = nz / nl;
      const Q = (u, yy, d) => [mx + ux * u + ox * d, yy, mz + uz * u + oz * d];
      const bx = (u0, u1, d0, d1, ya, yb, mat) => { const tt = []; hexa(tt, [Q(u0, ya, d0), Q(u1, ya, d0), Q(u1, ya, d1), Q(u0, ya, d1), Q(u0, yb, d0), Q(u1, yb, d0), Q(u1, yb, d1), Q(u0, yb, d1)]); bag.add(mat, fromTriangles(tt)); };
      if (k % 2 === 0) {
        const dw = 0.32 * L, dh = Math.min(3, h * 0.45), y0 = y + 0.4, hw = dw / 2, rows = up > 0.5 ? 4 : 5, cols = 4;
        bx(-hw - 0.16, hw + 0.16, 0.02, 0.1, y0 + dh, y0 + dh + 0.2, 'timber_red');
        for (const sg of [-1, 1]) bx(sg * (hw + 0.02) - 0.08, sg * (hw + 0.02) + 0.08, 0.02, 0.1, y0, y0 + dh + 0.2, 'timber_red');
        bx(-hw - 0.3, hw + 0.3, 0.02, 0.2, y + ph - 0.0, y0, 'granite_grey');
        for (const sg of [-1, 1]) {
          const u0 = sg < 0 ? -hw : 0.015, u1 = sg < 0 ? -0.015 : hw;
          bx(u0 + 0.03, u1 - 0.03, 0.03, 0.07, y0, y0 + dh, 'lacquer_red');
          for (const q of [0.3, dh * 0.5, dh - 0.35]) bx(u0 + 0.03, u1 - 0.03, 0.07, 0.085, y0 + q - 0.06, y0 + q + 0.06, 'iron');
          for (let j = 0; j < rows; j++) for (let c2 = 0; c2 < cols; c2++) { const uc = u0 + 0.14 + (u1 - u0 - 0.28) * c2 / (cols - 1), yc = y0 + 0.35 + (dh - 0.7) * j / (rows - 1); bx(uc - 0.035, uc + 0.035, 0.07, 0.115, yc - 0.035, yc + 0.035, 'bronze'); }
          bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.1, 0.03], [0.001, 0.045]], 8).rotateX(Math.PI / 2).translate(...Q(sg * 0.2, y0 + dh * 0.45, 0.095)));
        }
      } else {
        const ww = (0.18 - 0.03 * up) * L, wy0 = y + h * 0.35, wh = 1.2 - 0.15 * up, hw = ww / 2;
        bx(-hw - 0.12, hw + 0.12, 0.02, 0.1, wy0 - 0.12, wy0, 'timber_red'); bx(-hw - 0.12, hw + 0.12, 0.02, 0.1, wy0 + wh, wy0 + wh + 0.12, 'timber_red');
        for (const sg of [-1, 1]) bx(sg * hw + (sg < 0 ? -0.12 : 0), sg * hw + (sg < 0 ? 0 : 0.12), 0.02, 0.1, wy0, wy0 + wh, 'timber_red');
        bx(-hw - 0.25, hw + 0.25, 0.02, 0.22, wy0 - 0.22, wy0 - 0.12, 'granite_grey');
        bx(-hw, hw, 0.055, 0.075, wy0, wy0 + wh, 'lattice_red');
      }
    }
    // the gallery's rail: a baluster every metre and lattice panels between the two rails
    const Rl = ng(g - 0.15);
    for (let k = 0; k < 8; k++) {
      const a = Rl[k], b = Rl[(k + 1) % 8], L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(2, Math.round(L / 1.0)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, ox = uz, oz = -ux;
      for (let q = 0; q <= m; q++) { const f = q / m; bag.add('timber_red', lathe([[0.001, 0], [0.06, 0.02], [0.045, 0.3], [0.07, 0.55], [0.045, 0.8], [0.001, 0.82]], 6, null, a[0] + (b[0] - a[0]) * f, y + 0.15, a[1] + (b[1] - a[1]) * f)); }
      for (let q = 0; q < m; q++) {
        const f0 = (q + 0.1) / m, f1 = (q + 0.9) / m, p0 = [a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0], p1 = [a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1], tt = [];
        hexa(tt, [[p0[0], y + 0.3, p0[1]], [p1[0], y + 0.3, p1[1]], [p1[0] + ox * 0.02, y + 0.3, p1[1] + oz * 0.02], [p0[0] + ox * 0.02, y + 0.3, p0[1] + oz * 0.02], [p0[0], y + 0.8, p0[1]], [p1[0], y + 0.8, p1[1]], [p1[0] + ox * 0.02, y + 0.8, p1[1] + oz * 0.02], [p0[0] + ox * 0.02, y + 0.8, p0[1] + oz * 0.02]]);
        bag.add('lattice_red', fromTriangles(tt));
      }
    }
    y += h;
  }
}

STYLES.song.elements.hz_pagoda_upper = dressUpper;
