// Life on the Moskva about 1600 (docs/settlements/muscovy.md §5.5): the landing stages (mostki) on log piles where the posad's
// women rinsed their washing and the boats lay; the log rafts (plot) floated down from the upper river to the timber market, with
// the raftsmen's hut and steering oar.

import { box, lathe } from '../../core/geom.js';
import { rng } from './yard.js';

/**
 * landing: { c: [x, z] (where it leaves the bank), y (the bank's height), dir (±1: the way to the water along z), level, bed, len, seed } — a stage of
 * planks on log piles: a deck at bank height 2.2 m wide, a lower washing platform at the water with its steps, a rail along the deck's sides, a rack for nets and washing.
 */
export function landing(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, dir = el.dir ?? 1, level = el.level ?? -7, bed = el.bed ?? -10, len = el.len ?? 11, rand = rng(el.seed ?? 5);
  const Z = (d) => z + dir * d, hw = 1.1;
  bag.add('planks_grey', box(x - hw, y - 0.14, Math.min(Z(0), Z(len)), x + hw, y, Math.max(Z(0), Z(len))));
  col.floor([x - hw, Math.min(Z(0), Z(len)), x + hw, Math.max(Z(0), Z(len))], y);
  for (let d = 0.5; d <= len; d += 3) for (const sx of [-1, 1]) bag.add('timber', lathe([[0.001, 0], [0.2, 0], [0.2, y - bed + 0.5], [0.001, y - bed + 0.5]], 7, null, x + sx * (hw - 0.15), bed - 0.3, Z(d)));
  for (let d = 0; d < len; d += 1.2) bag.add('wood_dark', box(x - hw, y - 0.145, Math.min(Z(d), Z(d + 0.05)), x + hw, y - 0.139, Math.max(Z(d), Z(d + 0.05))));     // the gaps between the planks
  for (const sx of [-1, 1]) { bag.add('timber', box(x + sx * hw - 0.04, y + 0.85, Math.min(Z(1), Z(len - 3)), x + sx * hw + 0.04, y + 0.92, Math.max(Z(1), Z(len - 3)))); for (let d = 1; d <= len - 3; d += 2.4) bag.add('timber', box(x + sx * hw - 0.05, y, Z(d) - 0.05, x + sx * hw + 0.05, y + 0.92, Z(d) + 0.05)); col.rect([x + sx * hw - 0.06, Math.min(Z(1), Z(len - 3)), x + sx * hw + 0.06, Math.max(Z(1), Z(len - 3))], y, y + 0.92); }
  // the washing platform near the water: a lower deck on piles, steps down to it
  const wl = level + 0.5, w0 = len - 3, w1 = len + 2.6;
  bag.add('planks_grey', box(x - hw - 0.6, wl - 0.1, Math.min(Z(w0), Z(w1)), x + hw + 0.6, wl, Math.max(Z(w0), Z(w1))));
  for (const sx of [-1, 1]) for (const d of [w0 + 0.3, w1 - 0.3]) bag.add('timber', lathe([[0.001, 0], [0.16, 0], [0.16, wl - bed + 0.2], [0.001, wl - bed + 0.2]], 7, null, x + sx * (hw + 0.4), bed - 0.3, Z(d)));
  const ns = 6; for (let k = 0; k < ns; k++) { const d = w0 - 0.2 - 0, yk = y - (k + 1) * (y - wl) / (ns + 1); bag.add('planks_grey', box(x - 0.45, yk - 0.05, Math.min(Z(w0 - 2.4 + k * 0.4), Z(w0 - 2.0 + k * 0.4)), x + 0.45, yk, Math.max(Z(w0 - 2.4 + k * 0.4), Z(w0 - 2.0 + k * 0.4)))); void d; }
  // a rack of two posts and a pole at the deck's end for nets and washing; a wash-bench and a tub
  const re = 2 + rand() * 2, rx = x - hw - 0.3;
  bag.add('timber', box(rx - 0.06, y, Z(re) - 0.06, rx + 0.06, y + 1.9, Z(re) + 0.06)); bag.add('timber', box(rx - 0.06, y, Z(re + 3) - 0.06, rx + 0.06, y + 1.9, Z(re + 3) + 0.06)); bag.add('timber', box(rx - 0.04, y + 1.85, Math.min(Z(re), Z(re + 3)), rx + 0.04, y + 1.92, Math.max(Z(re), Z(re + 3))));
  for (let k = 0; k < 5; k++) { const d = re + 0.3 + k * 0.5; bag.add(['linen', 'cloth_indigo', 'cloth_white', 'cloth_brown'][(k + el.seed) % 4 | 0], box(rx - 0.01, y + 0.85 + (k % 2) * 0.1, Math.min(Z(d), Z(d + 0.4)), rx + 0.01, y + 1.85, Math.max(Z(d), Z(d + 0.4)))); }
  bag.add('timber', box(x + 0.5, wl, Math.min(Z(w0 + 0.4), Z(w0 + 1.8)), x + 1.0, wl + 0.4, Math.max(Z(w0 + 0.4), Z(w0 + 1.8))));
  bag.add('timber', lathe([[0.001, 0], [0.3, 0], [0.34, 0.35], [0.001, 0.35]], 10, null, x - 0.8, wl, Z(w0 + 1.2)));
}

/**
 * raft: { c: [x, z], y (the water), yaw, seed, n } — a log raft: logs 10 m long side by side bound with cross poles, a lean-to hut of boards at the
 * stern, a long steering oar over the back, a fire-pit of stones and a pot.
 */
export function raft(el, { bag }) {
  const [x, z] = el.c, y = el.y ?? 0, n = el.n ?? 9, rand = rng(el.seed ?? 3), yaw = el.yaw ?? 0, co = Math.cos(yaw), si = Math.sin(yaw);
  const T = (u, w) => [x + u * co - w * si, z + u * si + w * co];
  const L = 9 + rand() * 3;
  for (let i = 0; i < n; i++) { const w = (i - (n - 1) / 2) * 0.46, g = lathe([[0.22, 0], [0.22, L], [0.001, L]], 7).rotateZ(-Math.PI / 2).translate(-L / 2, 0, w).rotateY(-yaw).translate(x, y, z); bag.add('log_pine', g); }
  for (const u of [-L * 0.3, 0, L * 0.3]) { const a = T(u, -(n * 0.46) / 2 - 0.1), b = T(u, (n * 0.46) / 2 + 0.1); bag.add('timber', box(Math.min(a[0], b[0]) - 0.08, y + 0.2, Math.min(a[1], b[1]) - 0.08, Math.max(a[0], b[0]) + 0.08, y + 0.32, Math.max(a[1], b[1]) + 0.08)); }
  // the hut: three boards leaning, at the stern
  const h0 = T(-L * 0.38, 0), hw = 0.9;
  bag.add('planks_grey', box(h0[0] - hw, y + 0.3, h0[1] - hw, h0[0] + hw, y + 1.55, h0[1] + hw));
  bag.add('thatch', box(h0[0] - hw - 0.1, y + 1.55, h0[1] - hw - 0.1, h0[0] + hw + 0.1, y + 1.7, h0[1] + hw + 0.1));
  const oa = T(-L / 2 - 0.2, 0), ob = T(-L / 2 - 3.2, 0);
  bag.add('timber', box(Math.min(oa[0], ob[0]) - 0.05, y + 1.2, Math.min(oa[1], ob[1]) - 0.05, Math.max(oa[0], ob[0]) + 0.05, y + 1.3, Math.max(oa[1], ob[1]) + 0.05));
  const f = T(L * 0.15, 0.3); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; bag.add('rock_boulder', box(f[0] + Math.cos(a) * 0.4 - 0.1, y + 0.3, f[1] + Math.sin(a) * 0.4 - 0.1, f[0] + Math.cos(a) * 0.4 + 0.1, y + 0.5, f[1] + Math.sin(a) * 0.4 + 0.1)); }
  bag.add('pottery_dark', lathe([[0.001, 0], [0.18, 0.02], [0.22, 0.2], [0.001, 0.22]], 8, null, f[0], y + 0.3, f[1]));
}
