// The courtyard's north portal seen from the arrival (docs/settlements/ottoman-istanbul.md §16): a block standing out of
// the wall and above it, a pointed niche ringed by voussoirs of white marble and red granite in turn, corner colonnettes
// with muqarnas capitals, a hood of muqarnas cells in tiers receding up the niche's head, a tablet of inscription over
// the door and Iznik tile panels beside and above it in lapis frames, a corbelled cornice.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { dblT, pointedArc, arcadeWall } from './index.js';

const M = 'marble_smooth', S = 'limestone';

export function courtPortal(bag, col, { cx, pz, y, pw, pd, ph, wt, wallTop }) {
  const hw = pw - 0.2, ys = y + 8.6, P = (u, yy, o) => [cx + u, yy, pz - o];
  const B = (mat, u0, u1, y0, y1, o0, o1) => bag.add(mat, box(cx + u0, y + y0, pz - o1, cx + u1, y + y1, pz - o0));
  // the many small repeated pieces are gathered into one geometry per material (no repeated shapes to instance)
  const acc = {}, Bm = (mat, u0, u1, y0, y1, o0, o1) => {
    const t = acc[mat] || (acc[mat] = []), X0 = cx + u0, X1 = cx + u1, Y0 = y + y0, Y1 = y + y1, Z0 = pz - o1, Z1 = pz - o0;
    const q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
    q([X0, Y0, Z0], [X1, Y0, Z0], [X1, Y1, Z0], [X0, Y1, Z0]); q([X1, Y0, Z1], [X0, Y0, Z1], [X0, Y1, Z1], [X1, Y1, Z1]);
    q([X0, Y1, Z0], [X1, Y1, Z0], [X1, Y1, Z1], [X0, Y1, Z1]); q([X0, Y0, Z1], [X1, Y0, Z1], [X1, Y0, Z0], [X0, Y0, Z0]);
    q([X0, Y0, Z1], [X0, Y0, Z0], [X0, Y1, Z0], [X0, Y1, Z1]); q([X1, Y0, Z0], [X1, Y0, Z1], [X1, Y1, Z1], [X1, Y1, Z0]);
  };
  const tri = (out, o, ...pts) => { for (const [u, yy] of pts) out.push(...P(u, yy, o)); };
  // a flat plate: rectangle from yb to ys (the arch's springing), a pointed head over it
  const plate = (out, s0, s1, yb, yS, o) => {
    tri(out, o, [s0, yb], [s1, yb], [s1, yS], [s0, yb], [s1, yS], [s0, yS]);
    const a = pointedArc(s0, s1, yS), c = [(s0 + s1) / 2, yS];
    for (let k = 0; k + 1 < a.length; k++) tri(out, o, c, a[k], a[k + 1]);
  };
  const frame = (out, s0, s1, yb, yS, b, o) => {
    const i = pointedArc(s0, s1, yS), e = pointedArc(s0 - b, s1 + b, yS);
    for (let k = 0; k + 1 < i.length; k++) tri(out, o, i[k], i[k + 1], e[k + 1], i[k], e[k + 1], e[k]);
    for (const [a0, a1] of [[s0 - b, s0], [s1, s1 + b]]) tri(out, o, [a0, yb], [a1, yb], [a1, yS], [a0, yb], [a1, yS], [a0, yS]);
    tri(out, o, [s0, yb - b], [s1, yb - b], [s1, yb], [s0, yb - b], [s1, yb], [s0, yb]);
  };
  const tilePanel = (s0, s1, yb, yS, o) => {
    const fr = [], fl = [];
    plate(fr, s0 - 0.22, s1 + 0.22, yb - 0.22, yS, o); plate(fl, s0, s1, yb, yS, o + 0.03);
    bag.add('tile_lapis', dblT(fr)); bag.add('tile_iznik', dblT(fl));
    const gl = []; frame(gl, s0 - 0.22, s1 + 0.22, yb - 0.22, yS, 0.07, o + 0.04); bag.add('gilt_bronze', dblT(gl));
  };
  // the block: a wall with a pointed niche of ablaq voussoirs, jambs and spandrels through its depth
  arcadeWall(bag, [cx - pw - 1.6, pz - pd / 2], [cx + pw + 1.6, pz - pd / 2], [[1.8, 1.8 + 2 * hw]], y - 0.5, ys, y + ph, pd, S, true);
  for (const s of [-1, 1]) { const q = [s < 0 ? cx - pw - 1.6 : cx + hw, pz - pd, s < 0 ? cx - hw : cx + pw + 1.6, pz]; col.rect(q, y, y + 9); }
  bag.add(S, box(cx - pw - 1.6, y + wallTop, pz, cx + pw + 1.6, y + ph, pz + wt));
  bag.add(S, box(cx - pw - 1.9, y + ph, pz - pd - 0.3, cx + pw + 1.9, y + ph + 0.5, pz + wt));
  // the cornice: corbels under the crown, the crown's moulding
  for (let u = -pw - 1.45; u < pw + 1.5; u += 0.5) Bm('limestone_carved', u, u + 0.3, ph - 0.7, ph, pd, pd + 0.28);
  B(M, -pw - 1.9, pw + 1.9, ph + 0.5, ph + 0.62, -0.2, pd + 0.3);
  // the hood: tiers of muqarnas cells, the lowest the deepest, narrowing with the arch's head
  const arc = pointedArc(-hw, hw, ys), left = arc.slice(0, 9), halfAt = (yy) => { for (let k = 0; k + 1 < left.length; k++) { const [x0, y0] = left[k], [x1, y1] = left[k + 1]; if (yy >= y0 && yy <= y1) return -(x0 + (x1 - x0) * (yy - y0) / Math.max(1e-6, y1 - y0)); } return 0; };
  const K = 9, th = 0.62, cw = 0.66;
  for (let k = 0; k < K; k++) {
    const y0 = ys + k * th, half = halfAt(y0 + th * 0.5) - 0.08; if (half < 0.4) break;
    const n = Math.max(1, Math.floor(2 * half / cw) - (k % 2)), w = 2 * half / (n + (k % 2 ? 0 : 0)), d = pd * (0.9 - 0.62 * k / K);
    for (let i = 0; i < n; i++) {
      const u = -half + w * (i + 0.5) + (k % 2 ? 0 : 0);
      Bm(M, u - w / 2 + 0.015, u + w / 2 - 0.015, y0 - y, y0 - y + th, 0, d);
      Bm(i % 2 ? 'gilt_bronze' : 'opening', u - w * 0.3, u + w * 0.3, y0 - y + 0.09, y0 - y + th - 0.1, d, d + 0.025);
      Bm('marble_dark', u - w * 0.36, u + w * 0.36, y0 - y + th - 0.07, y0 - y + th, d, d + 0.05);
    }
  }
  // the colonnettes in the niche's corners: red granite and porphyry, bases, muqarnas capitals
  for (const s of [-1, 1]) {
    const u = s * (hw - 0.3), x = cx + u, z = pz - 0.75;
    bag.add(M, box(x - 0.34, y, z - 0.34, x + 0.34, y + 0.4, z + 0.34));
    bag.add(s < 0 ? 'granite_red' : 'porphyry', lathe([[0.2, 0], [0.18, ys - y - 1.4]], 14, null, x, y + 0.4, z));
    bag.add(M, lathe([[0.26, 0], [0.26, 0.12], [0.2, 0.2]], 14, null, x, y + 0.4, z));
    for (let k = 0; k < 3; k++) bag.add(k === 2 ? 'gilt_bronze' : M, box(x - 0.26 - k * 0.04, ys - 1.0 - 0.3 + k * 0.33 - 0.0, z - 0.26 - k * 0.04, x + 0.26 + k * 0.04, ys - 1.0 + k * 0.33 + 0.03, z + 0.26 + k * 0.04));
    bag.add('limestone_carved', box(x - 0.38, ys - 0.31, z - 0.38, x + 0.38, ys, z + 0.38));
    col.circle(x, z, 0.3, y, y + 8);
  }
  // the door: frame, lintel, the tablet above with its inscription, a tile lunette over that
  B(M, -2.2, 2.2, 5.2, 5.65, 0.0, 0.2); for (const s of [-1, 1]) B(M, s < 0 ? -2.2 : 1.8, s < 0 ? -1.8 : 2.2, 0, 5.2, 0.0, 0.2);
  B('tile_lapis', -2.6, 2.6, 5.85, 7.05, 0.0, 0.07);
  B('marble_smooth', -2.4, 2.4, 6.0, 6.9, 0.07, 0.1);
  for (let u = -2.2; u < 2.2; u += 0.13) { const hh = 0.55 + ((Math.round(u * 7.7) % 3) + 3) % 3 * 0.1; Bm('marble_dark', u, u + 0.06, 6.45 - hh / 2, 6.45 + hh / 2, 0.1, 0.13); }
  B('gilt_bronze', -2.4, 2.4, 6.0, 6.05, 0.1, 0.13); B('gilt_bronze', -2.4, 2.4, 6.85, 6.9, 0.1, 0.13);
  tilePanel(-0.9, 0.9, y + 7.2, y + 7.2, 0.0);
  for (const sg of [-1, 1]) tilePanel(sg < 0 ? -3.95 : 2.55, sg < 0 ? -2.55 : 3.95, y + 1.3, y + 5.0, 0.0);
  // the step before the threshold, and the panels' sills
  B(M, -hw, hw, -0.0, 0.14, 0.0, pd);
  for (const [m, t] of Object.entries(acc)) bag.add(m, dblT(t));
}
