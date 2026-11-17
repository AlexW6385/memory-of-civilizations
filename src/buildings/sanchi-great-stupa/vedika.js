// The Great Stupa's railings (vedika), rebuilt in the stonework of a wooden fence: posts of lens section with bevelled
// corners on a moulded plinth course, three lens-shaped crossbars in every bay (their ends tenoned into the posts), a
// coping rounded on top; the plain faces carry the donors' inscriptions. docs/buildings/sanchi-great-stupa.md §4, §8.
// Runs may slope (the balustrades of the double stairway).

import { fromTriangles, orientOutward } from '../../core/geom.js';
import { hexa, obox } from '../../styles/chinese/index.js';

/**
 * A run of railing from a to b [x, z], rising from ya to yb, of height h; posts at about `pitch`, post half-width pw,
 * half-depth pd. Adds triangles to L.post, L.bar, L.cope, L.mark. `ends` = [true, true] puts a post at each end (else the
 * run's first post only, the next run supplying the other). `inscribe` puts signs on the posts' faces.
 */
export function vedikaRun(L, a, b, ya, yb, h, pitch, pw, pd, { ends = [true, true], inscribe = false, seed = 0, bars = true } = {}) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [-u[1], u[0]];
  const np = Math.max(1, Math.round(len / pitch)), slope = (yb - ya) / len, yc = h * 0.82;
  const P = (t, d, yy) => [a[0] + u[0] * t + n[0] * d, ya + slope * t + yy, a[1] + u[1] * t + n[1] * d];
    // the plinth course under the whole run: a wide foot and a narrower moulded step
  hexa(L.post, [P(-pw, -pd * 1.9, -0.02), P(len + pw, -pd * 1.9, -0.02), P(len + pw, pd * 1.9, -0.02), P(-pw, pd * 1.9, -0.02)], [P(-pw, -pd * 1.9, 0.1 * h / 3.1), P(len + pw, -pd * 1.9, 0.1 * h / 3.1), P(len + pw, pd * 1.9, 0.1 * h / 3.1), P(-pw, pd * 1.9, 0.1 * h / 3.1)]);
  for (let k = 0; k <= np; k++) {
    const t = len * k / np, last = k === np;
    if ((k === 0 && !ends[0]) || (last && !ends[1])) { if (!last && bars) addBars(k, t); continue; }
    // the post: a lens (bevelled) section in two hexahedra
    const q = (yy, w, d) => [P(t - w, -d, yy), P(t + w, -d, yy), P(t + w, d, yy), P(t - w, d, yy)];
    hexa(L.post, q(0.1 * h / 3.1, pw, pd * 0.62), q(yc, pw, pd * 0.62));
    if (h >= 2.5) hexa(L.post, q(0.1 * h / 3.1, pw * 0.64, pd), q(yc, pw * 0.64, pd));
    if (inscribe && (k + seed) % 3 !== 2) {
      const sd = (k + seed) % 2 ? 1 : -1, g0 = h / 3.1;
      for (let j = 0; j < 4; j++) {
        const v = (k * 7 + j * 3) % 4, yy = (0.7 + j * 0.2) * g0, gu = (j % 2 ? 0.02 : -0.02), c = P(t + gu, sd * (pd + 0.002), yy);
        obox(L.mark, [c[0], c[2]], u, n, v === 2 ? 0.045 : 0.012, 0.012, c[1], c[1] + 0.08 * g0);
        if (v < 2) obox(L.mark, [c[0], c[2]], u, n, 0.04, 0.012, c[1] + (v ? 0 : 0.065 * g0), c[1] + (v ? 0.015 : 0.08) * g0);
      }
    }
    if (last) break;
    if (bars) addBars(k, t);
  }
  function addBars(k, t) {
    // the crossbars to the next post: lens section, thin top and bottom, fullest in the middle, running into the posts
    const t0 = t + pw * 0.4, t1 = len * (k + 1) / np - pw * 0.4;
    for (let j = 0; j < 3; j++) {
      const y0 = h * (0.16 + j * 0.23), y1 = y0 + h * 0.15, ym = (y0 + y1) / 2, e = pd * 0.62;
      const r = (yy, d) => [P(t0, -d, yy), P(t1, -d, yy), P(t1, d, yy), P(t0, d, yy)];
      if (h < 2.5) hexa(L.bar, r(y0 + (y1 - y0) * 0.1, e * 0.6), r(y1 - (y1 - y0) * 0.1, e * 0.6)); else { hexa(L.bar, r(y0, e * 0.3), r(ym, e)); hexa(L.bar, r(ym, e), r(y1, e * 0.3)); }
    }
  }
  // the coping over the whole run: a flat foot, vertical faces, a rounded top
  const cw = pw * 1.18, ch = h - yc;
  const prof = [[-cw, 0], [cw, 0], [cw, ch * 0.5], [cw * 0.72, ch * 0.86], [0, ch], [-cw * 0.72, ch * 0.86], [-cw, ch * 0.5]];
  const T = [], ext = pw * 0.5;
  for (let i = 0; i < prof.length; i++) {
    const [d0, h0] = prof[i], [d1, h1] = prof[(i + 1) % prof.length];
    T.push(...P(-ext, d0, yc + h0), ...P(len + ext, d0, yc + h0), ...P(len + ext, d1, yc + h1), ...P(-ext, d0, yc + h0), ...P(len + ext, d1, yc + h1), ...P(-ext, d1, yc + h1));
  }
  for (const t of [-ext, len + ext]) for (let i = 1; i < prof.length - 1; i++) T.push(...P(t, prof[0][0], yc + prof[0][1]), ...P(t, prof[i][0], yc + prof[i][1]), ...P(t, prof[i + 1][0], yc + prof[i + 1][1]));
  L.cope.push(...orientOutward(T));
}

/** A ring of railing { c, r, y, h, gaps (angles), gap (half-width m) } — posts on the circle, chords between them. */
export function vedikaRing(L, c, r, y, h, gaps, gap, pitch, pw, pd, inscribe) {
  const N = Math.round(2 * Math.PI * r / pitch), pt = (a) => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
  const open = (a) => gaps.some((g) => Math.abs(((a - g) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * r < gap);
  for (let k = 0; k < N; k++) {
    const a0 = 2 * Math.PI * k / N, a1 = 2 * Math.PI * (k + 1) / N;
    if (open(a0)) continue;
    // one bay: its post, its bars and its coping; at a gap's edge the bay is only the post
    if (open(a1)) vedikaRun(L, pt(a0), pt(a0 + 0.001), y, y, h, 1e3, pw, pd, { ends: [true, false], inscribe, seed: k, bars: false });
    else vedikaRun(L, pt(a0), pt(a1), y, y, h, 1e3, pw, pd, { ends: [true, false], inscribe, seed: k });
  }
}
export const newLists = () => ({ post: [], bar: [], cope: [], mark: [] });
export function addLists(bag, mat, L) { for (const k of ['post', 'bar', 'cope', 'mark']) if (L[k].length) bag.add(mat, fromTriangles(L[k])); }
