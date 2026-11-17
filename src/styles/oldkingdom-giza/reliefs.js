// The causeway's painted reliefs, and the temples' floors laid in slabs (docs/settlements/giza.md §17).
// Herodotus saw Khufu's causeway "of polished stone, carved with figures of animals"; fragments of reliefs
// from the Old Kingdom causeways show processions of offering bearers and herds. Ours: on both inner walls of the
// roofed corridor two registers of painted raised relief — below, bearers striding toward the temple on a blue ground line
// with their loaves, jars, lotuses and fowl; above, cattle and oryx led the same way — under a blue band and a frieze.

import { fromTriangles, box } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const BEARER = (n) => {
  const it = n % 4, L = [
    ['paint_robe', [[-0.02, 0.47], [0.03, 0.47], [0.165, 0.02], [0.11, 0.02]], 1],
    ['paint_robe', [[-0.04, 0.47], [0.01, 0.47], [-0.09, 0.02], [-0.14, 0.02]], 0.8],
    ['paint_robe', [[0.1, 0], [0.22, 0], [0.2, 0.025], [0.11, 0.03]], 1], ['paint_robe', [[-0.15, 0], [-0.04, 0], [-0.06, 0.025], [-0.14, 0.03]], 0.8],
    ['plaster_white', [[-0.075, 0.62], [0.075, 0.62], [0.15, 0.42], [-0.1, 0.43]], 1.5],
    ['paint_robe', [[-0.06, 0.615], [0.06, 0.615], [0.12, 0.82], [0.05, 0.845], [-0.05, 0.845], [-0.12, 0.82]], 1.2],
    ['paint_robe', [[-0.045, 0.87], [0.04, 0.87], [0.06, 0.9], [0.072, 0.925], [0.055, 0.935], [0.05, 0.97], [0.0, 0.99], [-0.045, 0.97]], 1.2],
    ['lacquer_black', [[-0.06, 0.885], [0.025, 0.95], [0.04, 0.985], [0.0, 1.005], [-0.055, 0.99], [-0.07, 0.94]], 1.5],
    ['paint_robe', [[-0.12, 0.82], [-0.08, 0.82], [-0.075, 0.5], [-0.105, 0.5]], 0.8],
    ['paint_robe', [[0.08, 0.82], [0.12, 0.8], [0.15, 0.68], [0.25, 0.71], [0.25, 0.74], [0.13, 0.725], [0.1, 0.8]], 1.8],
  ];
  if (it === 0) L.push(['limewash_yellow', [[0.2, 0.74], [0.32, 0.74], [0.3, 0.78], [0.26, 0.8], [0.22, 0.78]], 2.2]);
  else if (it === 1) L.push(['terracotta', [[0.22, 0.73], [0.27, 0.73], [0.29, 0.78], [0.27, 0.84], [0.265, 0.87], [0.235, 0.87], [0.225, 0.84], [0.205, 0.78]], 2.2]);
  else if (it === 2) L.push(['fresco_green', [[0.24, 0.74], [0.255, 0.74], [0.26, 0.9], [0.31, 0.97], [0.25, 0.94], [0.19, 0.97], [0.24, 0.9]], 2.2]);
  else L.push(['paint_ochre', [[0.18, 0.74], [0.33, 0.745], [0.36, 0.78], [0.3, 0.8], [0.2, 0.79]], 2.2]);
  return L;
};
// a striding ox in profile, facing +u, 1.0 long-ish: body, neck and head, horns, four legs, tail; spots on some
const OX = (n) => [
  ['paint_ochre', [[-0.34, 0.5], [-0.3, 0.33], [0.25, 0.31], [0.33, 0.44], [0.3, 0.58], [0.0, 0.6], [-0.3, 0.57]], 1],
  ['paint_robe', [[0.26, 0.56], [0.38, 0.66], [0.6, 0.62], [0.67, 0.52], [0.6, 0.44], [0.3, 0.38]], 1.6],
  ['paint_robe', [[0.47, 0.63], [0.44, 0.8], [0.53, 0.66]], 1.2],
  ['paint_robe', [[0.2, 0.32], [0.26, 0.32], [0.3, 0.02], [0.25, 0.02]], 0.8], ['paint_robe', [[0.04, 0.32], [0.1, 0.32], [0.14, 0.02], [0.09, 0.02]], 1.2],
  ['paint_robe', [[-0.26, 0.34], [-0.2, 0.34], [-0.2, 0.02], [-0.25, 0.02]], 0.8], ['paint_robe', [[-0.12, 0.34], [-0.06, 0.34], [-0.03, 0.02], [-0.08, 0.02]], 1.2],
  ['paint_robe', [[-0.34, 0.5], [-0.32, 0.5], [-0.4, 0.2], [-0.42, 0.2]], 1.4],
  ...(n % 2 ? [['plaster_white', [[-0.12, 0.46], [0.1, 0.47], [0.12, 0.38], [-0.1, 0.36]], 1.6]] : []),
];

/** The reliefs along the inner walls of a causeway segment { a, b, w, ya, yb, gap }: `from` and `to` limit it (metres along). */
export function causewayReliefs(bag, el, from = 0, to = Infinity) {
  const [ax, az] = el.a, [bx, bz] = el.b, w = (el.w ?? 4.6) / 2, ya = el.ya ?? 0, yb = el.yb ?? 0;
  if (Math.abs(yb - ya) > 0.05) return;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, n = Math.ceil(L / 6), step = L / n;
  const out = {};
  for (const side of [-1, 1]) {
    // the figures walk toward the temple: against the direction of travel down the causeway (+u) — so facing −u
    const gapS = el.gap && el.gap.side === side ? [el.gap.from * step - 0.7, el.gap.to * step + 0.7] : null;
    const free = (s0, s1) => s0 > 1.0 && s1 < L - 0.5 && s1 < to && s0 > from && !(gapS && s1 > gapS[0] && s0 < gapS[1]);
    const rel = (mat, pts, s, y, sc, dir, d) => {
      // a polygon in the wall's plane scaled by sc, mirrored when dir < 0, raised d off the wall
      const P = (u, v, dd) => { const lat = side * (w - dd), uu = s + dir * u * sc; return [ax + ux * uu + nx * lat, ya + y + v * sc, az + uz * uu + nz * lat]; };
      const T = [], front = pts.map(([u, v]) => P(u, v, d)), back = pts.map(([u, v]) => P(u, v, 0));
      const cen = [0, 1, 2].map((k) => [...front, ...back].reduce((q, p) => q + p[k], 0) / (2 * pts.length));
      const tri = (p, q, r) => {
        const e1 = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], e2 = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
        const nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        const m = [(p[0] + q[0] + r[0]) / 3 - cen[0], (p[1] + q[1] + r[1]) / 3 - cen[1], (p[2] + q[2] + r[2]) / 3 - cen[2]];
        if (nn[0] * m[0] + nn[1] * m[1] + nn[2] * m[2] < 0) T.push(...p, ...r, ...q); else T.push(...p, ...q, ...r);
      };
      for (let j = 1; j < front.length - 1; j++) tri(front[0], front[j], front[j + 1]);
      for (let j = 0; j < pts.length; j++) { const k = (j + 1) % pts.length; tri(back[j], back[k], front[k]); tri(back[j], front[k], front[j]); }
      (out[mat] ||= []).push(...T);
    };
    const slab = (mat, s0, s1, y0, y1, d) => rel(mat, [[(s0 - s) / 1, y0], [(s1 - s) / 1, y0], [(s1 - s) / 1, y1], [(s0 - s) / 1, y1]].map(([u, v]) => [u, v]), s, 0, 1, 1, d);
    // the registers' ground lines and the band under the roof
    const s0 = Math.max(from, 0.9), s1 = Math.min(L - 0.4, to);
    for (const [y0, y1, d] of [[0.62, 0.7, 0.02], [2.52, 2.6, 0.02], [4.15, 4.35, 0.02]]) {
      let u = s0;
      for (const g of gapS ? [gapS, [L, L]] : [[L, L]]) { const e = Math.min(s1, g[0]); if (e - u > 0.4) rel('egyptian_blue', [[u, y0], [e, y0], [e, y1], [u, y1]], 0, 0, 1, 1, d); u = Math.max(u, g[1]); }
    }
    let k = 0;
    for (let s = s0 + 0.9; s < s1 - 0.5; s += 1.25, k++) {
      if (free(s - 0.5, s + 0.5)) for (const [mat, pts, d] of BEARER(k + Math.round(s))) rel(mat, pts, s, 0.7, 1.5, -1, 0.02 + 0.006 * d);
    }
    k = 0;
    for (let s = s0 + 1.1; s < s1 - 0.9; s += 2.0, k++) {
      if (free(s - 0.9, s + 0.9)) for (const [mat, pts, d] of OX(k + side)) rel(mat, pts, s, 2.6, 1.7, -1, 0.02 + 0.007 * d);
    }
  }
  for (const m of Object.keys(out)) bag.add(m, fromTriangles(out[m]));
}

/** The pavement laid in slabs { x0, z0, x1, z1 (the room), y (the floor's top), mat, joint, seed, skip: [[x0,z0,x1,z1]...] }: irregular slabs in staggered
 *  rows 1.1–2.2 m across and 1.5–3.5 m long, each a few millimetres higher or lower, a hairline joint between. */
export function slabFloor(bag, g) {
  const { x0, z0, x1, z1, y, seed } = g, rand = rng(seed ?? 5), mats = g.mats ?? ['basalt', 'marble_dark'], gap = 0.035, skip = g.skip ?? [];
  const T = {};
  for (let z = z0; z < z1 - 0.2;) {
    const rw = Math.min(z1 - z, 1.1 + rand() * 1.1);
    for (let x = x0 - rand() * 2.5; x < x1 - 0.2;) {
      const len = 1.5 + rand() * 2.0, a = Math.max(x0, x), b = Math.min(x1, x + len);
      if (b - a > 0.3 && !skip.some((r) => a < r[2] && b > r[0] && z < r[3] && z + rw > r[1])) {
        const m = mats[rand() < 0.3 ? 1 : 0], h = 0.012 + rand() * 0.016;
        bag.add(m, box(a + gap / 2, y, z + gap / 2, b - gap / 2, y + h, z + rw - gap / 2));
        void T;
      }
      x += len;
    }
    z += rw;
  }
}
