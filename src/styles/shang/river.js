// The life at the Huan (docs/settlements/shang-yinxu.md §5b): plank landings on piles with the fishing gear about them: racks of split carp
// drying, poles with a net hung to dry, wicker fish traps, baskets, a washing stone, stakes of the weir; the boats (dugout canoes and
// reed rafts) and the people are in town.js.
import { box, lathe, frustum, rod } from '../../core/geom.js';
import { RIVER } from '../../settlements/shang-yinxu/layout.js';

/** shang_landing: { a (bank end), b (water end), n (unit bank → water), tang (unit along the bank), seed } */
export function shangLanding(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, [nx, nz] = el.n, [tx, tz] = el.tang, y = 0.02, hw = 0.85;
  const P = (s, t) => [ax + nx * s + tx * t, az + nz * s + tz * t], L = Math.hypot(bx - ax, bz - az);
  const rect = (s0, t0, s1, t1) => { const p = P(s0, t0), q = P(s1, t1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const B = (m, s0, y0, t0, s1, y1, t1, solid = false) => { const r = rect(s0, t0, s1, t1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };
  { const r = rect(-0.4, -hw, L, hw); bag.add('planks_grey', box(r[0], y - 0.1, r[1], r[2], y, r[3])); col.floor(r, y); }
  for (let s = 0.4; s < L; s += 1.9) for (const t of [-hw + 0.1, hw - 0.1]) { const p = P(s, t); bag.add('log_pine', lathe([[0.1, RIVER.bed - 0.3], [0.1, y + 0.45]], 6, null, p[0], 0, p[1])); }
  for (let s = 0.2; s < L; s += 0.7) B('timber', s, y - 0.14, -hw - 0.04, s + 0.08, y - 0.1, hw + 0.04);
  // the land side: a rack of carp, a net hung on two poles, wicker traps, baskets, a washing stone, a heap of reed bundles
  const pole = (s, t, h) => { const p = P(s, t); bag.add('timber', lathe([[0.06, 0], [0.05, h]], 6, null, p[0], 0, p[1])); };
  pole(-2.6, -3.4, 1.55); pole(-2.6, -0.6, 1.55); { const p = P(-2.6, -2.0); const q = tx ? [1.4, 0.08] : [0.08, 1.4]; bag.add('timber', box(p[0] - q[0], 1.45, p[1] - q[1], p[0] + q[0], 1.5, p[1] + q[1]));
    for (let k = 0; k < 8; k++) { const r = P(-2.6, -3.3 + k * 0.38); bag.add('hide_grey', box(r[0] - (tx ? 0.08 : 0.03), 0.85, r[1] - (tx ? 0.03 : 0.08), r[0] + (tx ? 0.08 : 0.03), 1.45, r[1] + (tx ? 0.03 : 0.08))); } }
  pole(-2.6, 1.0, 1.9); pole(-2.6, 5.0, 1.9); { const p = P(-2.6, 3.0), q = tx ? [2.1, 0.04] : [0.04, 2.1]; bag.add('timber', box(p[0] - q[0], 1.85, p[1] - q[1], p[0] + q[0], 1.9, p[1] + q[1]));
    for (let k = 0; k < 6; k++) { const r = P(-2.6, 1.3 + k * 0.62); bag.add('cloth_grey', box(r[0] - (tx ? 0.28 : 0.02), 0.5 + (k % 2) * 0.1, r[1] - (tx ? 0.02 : 0.28), r[0] + (tx ? 0.28 : 0.02), 1.85, r[1] + (tx ? 0.02 : 0.28))); } }
  for (const [s, t] of [[-1.2, 1.6], [-1.6, 2.5]]) { const p = P(s, t); bag.add('wicker', lathe([[0.001, 0], [0.34, 0.02], [0.2, 0.9], [0.001, 1.0]], 8, null, p[0], 0, p[1])); }
  for (const [s, t] of [[-1.0, -1.6], [-1.3, -2.0]]) { const p = P(s, t); bag.add('wicker', lathe([[0.2, 0], [0.26, 0.28], [0.22, 0.3], [0.001, 0.3]], 8, null, p[0], 0, p[1])); }
  { const p = P(-0.8, 1.6); bag.add('granite_grey', frustum([p[0] - 0.45, p[1] - 0.35, p[0] + 0.45, p[1] + 0.35], 0, 0.3, 0.1, 0.1, 0.1, 0.1, { noBottom: true })); }
  { const p = P(-3.8, -0.8); bag.add('ichu', frustum([p[0] - 0.9, p[1] - 0.6, p[0] + 0.9, p[1] + 0.6], 0, 0.7, 0.3, 0.3, 0.3, 0.3, { noBottom: true })); }
  // stakes of a fish weir standing in the water beside the stage, their heads at the waterline
  for (let k = 0; k < 6; k++) { const p = P(L - 0.6 - k * 0.5, hw + 2.2 + k * 0.4); bag.add('timber', lathe([[0.04, RIVER.bed], [0.04, RIVER.water + 0.35 + (k % 2) * 0.15]], 5, null, p[0], 0, p[1])); }
  void rod;
}
