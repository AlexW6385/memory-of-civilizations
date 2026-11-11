// The Marinid minaret (docs/settlements/fez.md §4.4): a square brick shaft, its upper half in panels of darj wa ktaf
// (lozenge lattice) filled with zellij, a band of tile at the top, the gallery, a small lantern under a green pyramid, three balls.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { face, poly, q4, dbl } from './kit.js';

export function minaret(bag, col, r, y, h, o = {}) {
  const [x0, z0, x1, z1] = r;
  bag.add('brick_baked', box(x0, y - 2, z0, x1, y + h, z1)); col.rect(r, y - 2, y + h);
  const fs = [face('z', z0, -1), face('z', z1, 1), face('x', x0, -1), face('x', x1, 1)];
  const lo = y + h * 0.46, hi = y + h * 0.93;
  for (const f of fs) {
    const [a, b] = f.ax === 'z' ? [x0, x1] : [z0, z1];
    // the frame of the panel and a ground of cream stucco, then lozenges in green and turquoise tile
    for (const [u0, u1, vv0, vv1, m] of [[a + 0.15, b - 0.15, lo, lo + 0.14, 'stucco_cream'], [a + 0.15, b - 0.15, hi - 0.14, hi, 'stucco_cream']]) { const R = f.R(0, 0.07, u0, u1); bag.add(m, box(R[0], vv0, R[1], R[2], vv1, R[3])); }
    for (const u of [a + 0.15, b - 0.29]) { const R = f.R(0, 0.07, u, u + 0.14); bag.add('stucco_cream', box(R[0], lo, R[1], R[2], hi, R[3])); }
    const R0 = f.R(0, 0.04, a + 0.29, b - 0.29); bag.add('plaster_white', box(R0[0], lo + 0.14, R0[1], R0[2], hi - 0.14, R0[3]));
    const T = [[], []], s = 0.9, n = Math.floor((b - a - 0.6) / s), rows = Math.floor((hi - lo - 0.3) / s), m = (b - a - 0.6 - n * s) / 2, vm = ((hi - lo - 0.3) - rows * s) / 2;
    for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
      const cu = a + 0.3 + m + (i + 0.5) * s, cv = lo + 0.15 + vm + (j + 0.5) * s, k = (i + j) % 2, q = s * 0.44;
      poly(T[k], f, [[cu - q, cv], [cu, cv - q], [cu + q, cv], [cu, cv + q]], 0.06);
      poly(T[1 - k], f, [[cu - q * 0.45, cv], [cu, cv - q * 0.45], [cu + q * 0.45, cv], [cu, cv + q * 0.45]], 0.075);
    }
    bag.add('tile_green', fromTriangles(T[0])); bag.add('tile_turquoise', fromTriangles(T[1]));
    const B = f.R(0, 0.06, a, b); bag.add('tile_lapis', box(B[0], y + h * 0.955, B[1], B[2], y + h * 0.985, B[3]));
  }
  // the gallery and the lantern
  const e = 0.3, g = [x0 - e, z0 - e, x1 + e, z1 + e];
  bag.add('stucco_cream', box(g[0], y + h, g[1], g[2], y + h + 0.28, g[3]));
  const n = Math.floor((g[2] - g[0]) / 0.9);
  for (const [a, b, alongX, at] of [[g[0], g[2], true, g[1]], [g[0], g[2], true, g[3] - 0.25], [g[1], g[3], false, g[0]], [g[1], g[3], false, g[2] - 0.25]]) for (let i = 0; i < n; i += 2) { const u0 = a + i * (b - a) / n, u1 = u0 + (b - a) / n; bag.add('stucco_cream', alongX ? box(u0, y + h + 0.28, at, u1, y + h + 0.95, at + 0.25) : box(at, y + h + 0.28, u0, at + 0.25, y + h + 0.95, u1)); }
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, L = (x1 - x0) * 0.46, yl = y + h + 0.28;
  bag.add('plaster_white', box(cx - L, yl, cz - L, cx + L, yl + 3.6, cz + L));
  for (const f of [face('z', cz - L, -1), face('z', cz + L, 1), face('x', cx - L, -1), face('x', cx + L, 1)]) { const R = f.R(0, 0.05, f.ax === 'z' ? cx - 0.45 : cz - 0.45, f.ax === 'z' ? cx + 0.45 : cz + 0.45); bag.add('opening', box(R[0], yl + 1.0, R[1], R[2], yl + 2.6, R[3])); }
  const t = [], P = [[cx - L - 0.25, cz - L - 0.25], [cx + L + 0.25, cz - L - 0.25], [cx + L + 0.25, cz + L + 0.25], [cx - L - 0.25, cz + L + 0.25]], ya = yl + 3.6, top = [cx, ya + 1.7, cz];
  for (let i = 0; i < 4; i++) { const A = P[i], B = P[(i + 1) % 4]; t.push(A[0], ya, A[1], ...top, B[0], ya, B[1]); }
  bag.add('tile_green', dbl(t)); bag.add('timber', box(cx - L - 0.25, ya - 0.1, cz - L - 0.25, cx + L + 0.25, ya, cz + L + 0.25));
  const yb = ya + 1.7;
  bag.add('gilt_bronze', rod([cx, yb, cz], [cx, yb + 1.9, cz], 0.03, 5));
  for (const [k, rr] of [[0.15, 0.2], [0.75, 0.15], [1.25, 0.11]]) bag.add('gilt_bronze', lathe([[0.001, -rr], [rr, 0], [0.001, rr]], 8, null, cx, yb + k + rr * 0.5, cz));
  void q4;
}
