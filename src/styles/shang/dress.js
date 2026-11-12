// The small things of a Shang yard and lane front (docs/settlements/shang-yinxu.md §5, §5a): wattle fences with posts and thatch
// caps, gateways, racks of hemp and millet, ridged garden beds, shocks of millet, wood piles, pens, hearths, grindstones, looms,
// jars and baskets, washing lines, and the weathering of the walls (a splashed foot, rain streaks) and of the thatch (a ridge of
// bundles). Every builder takes a frame F (src/styles/shang/geo.js) and works in its (a, b) coordinates; lod 1 = the lighter version.
import { box, lathe, frustum, rod } from '../../core/geom.js';

export const JAR = (r) => [[0.001, 0], [r * 0.55, 0.02], [r, r * 0.9], [r * 0.9, r * 1.6], [r * 0.5, r * 2.0], [r * 0.58, r * 2.2], [0.001, r * 2.2]];

export const heap = (F, mat, a, b, r, k = 0.55) => { const p = F.P(a, b); F.bag.add(mat, frustum([p[0] - r, p[1] - r * 0.8, p[0] + r, p[1] + r * 0.8], 0, r * k, r * 0.6, r * 0.6, r * 0.5, r * 0.5, { noBottom: true })); };
export const jars = (F, a, b, n, r = 0.22, y = 0, step = 0.6) => { for (let i = 0; i < n; i++) F.lathe(i % 3 ? 'pottery_dark' : 'terracotta', JAR(r + (i % 2) * 0.05), a + i * step, y, b + (i % 2) * 0.25, 9); };

/** A wall's weathering: the foot splashed dark by the rain and the mud of the lane, the plaster streaked under the eaves. door = [a0, a1] of the doorway in the front wall (or null). */
export function skirt(F, a, b, w, d, y0, door = null, h = 0.55) {
  const e = 0.04, m = 'earth_wall', f = (a0, a1) => { if (a1 - a0 > 0.05) F.b(m, a0, y0, b - e, a1, y0 + h, b + 0.02, false); };
  if (door) { f(a - e, door[0]); f(door[1], a + w + e); } else f(a - e, a + w + e);
  F.b(m, a - e, y0, b + d - 0.02, a + w + e, y0 + h, b + d + e, false);
  F.b(m, a - e, y0, b, a + 0.02, y0 + h, b + d, false); F.b(m, a + w - 0.02, y0, b, a + w + e, y0 + h, b + d, false);
}
export function streaks(F, a, b, w, y1, rand, n = 4, door = null) {
  for (let k = 0; k < n; k++) { const x = a + 0.4 + rand() * (w - 0.9); if (door && x > door[0] - 0.2 && x < door[1] + 0.1) continue; F.b('plaster_streak', x, y1 - 0.8 - rand() * 0.6, b - 0.03, x + 0.14 + rand() * 0.1, y1, b + 0.01, false); }
}
/** The ridge of a thatched roof: a long bundle bound along it, its ends proud. (a0, b0, a1, b1, y, rise, o, hip) as for F.roof. */
export function ridge(F, a0, b0, a1, b1, y, rise, o = 0.6, hip = true) {
  const r = F.R(a0, b0, a1, b1), x0 = r[0] - o, z0 = r[1] - o, x1 = r[2] + o, z1 = r[3] + o, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
  const half = hip ? Math.abs(hx - hz) : Math.max(hx, hz), yy = y + rise;
  if (hx >= hz) F.bag.add('roof_ridge', box(cx - half - 0.22, yy - 0.1, cz - 0.17, cx + half + 0.22, yy + 0.14, cz + 0.17));
  else F.bag.add('roof_ridge', box(cx - 0.17, yy - 0.1, cz - half - 0.22, cx + 0.17, yy + 0.14, cz + half + 0.22));
}

/** A fence of wattle with posts and a thatched cap, on the line from (a0, b) to (a1, b) (or along b); gaps = [[g0, g1], ...] left open. */
export function fenceRun(F, a0, b0, a1, b1, gaps = [], h = 1.45) {
  const alongA = Math.abs(a1 - a0) >= Math.abs(b1 - b0), L = alongA ? a1 - a0 : b1 - b0, t = 0.09;
  const seg = (s0, s1) => { if (s1 - s0 < 0.1) return; const r = alongA ? [a0 + s0, b0 - t, a0 + s1, b0 + t] : [a0 - t, b0 + s0, a0 + t, b0 + s1];
    F.b('wicker', r[0], 0, r[1], r[2], h - 0.12, r[3]); F.b('thatch', r[0] - 0.05, h - 0.12, r[1] - 0.07, r[2] + 0.05, h + 0.04, r[3] + 0.07, false); };
  let s = 0;
  for (const [g0, g1] of gaps.slice().sort((p, q) => p[0] - q[0])) { seg(s, g0); s = g1; }
  seg(s, L);
  const n = Math.max(2, Math.round(L / 2.4));
  for (let k = 0; k <= n; k++) { const q = L * k / n; if (gaps.some(([g0, g1]) => q > g0 - 0.05 && q < g1 + 0.05)) continue; const A = alongA ? a0 + q : a0, B = alongA ? b0 : b0 + q; F.b('timber', A - 0.07, 0, B - 0.07, A + 0.07, h + 0.12, B + 0.07, false); }
}
/** A lot's fence: front (with a gateway at gate = [g0, g1] or none), sides and back. lod 1: plain. */
export function fence(F, a0, b0, a1, b1, gaps = [], lod = 0) {
  fenceRun(F, a0, b0, a1, b0, gaps);
  fenceRun(F, a0, b1, a1, b1); fenceRun(F, a0, b0, a0, b1); fenceRun(F, a1, b0, a1, b1);
  for (const [g0, g1] of gaps) gateway(F, g0, g1, b0, lod);
}
/** A gateway of two tall posts with a lintel and a thatched hood, the leaves of planks standing open against the fence (lod 0). */
export function gateway(F, g0, g1, b, lod = 0) {
  for (const a of [g0, g1]) F.b('timber', a - 0.12, 0, b - 0.12, a + 0.12, 2.35, b + 0.12);
  F.b('timber', g0 - 0.2, 2.2, b - 0.1, g1 + 0.2, 2.42, b + 0.1, false);
  if (lod === 0) {
    F.roof(g0 - 0.1, b - 0.35, g1 + 0.1, b + 0.35, 2.42, 0.55, 0.3, false);
    F.b('planks_grey', g0 + 0.02, 0, b + 0.16, g0 + 0.95, 1.7, b + 0.24, false); F.b('planks_grey', g1 - 0.95, 0, b + 0.16, g1 - 0.02, 1.7, b + 0.24, false);
    F.b('kokowai', g0 - 0.14, 1.9, b - 0.14, g0 + 0.14, 2.0, b + 0.14, false); F.b('kokowai', g1 - 0.14, 1.9, b - 0.14, g1 + 0.14, 2.0, b + 0.14, false);
  }
}

/** A drying rack for hemp and millet: two frames of posts, a rail, bundles hung over it. */
export function rack(F, a, b, len = 3, lod = 0) {
  for (const s of [0, len]) { F.b('timber', a + s - 0.05, 0, b - 0.2, a + s + 0.05, 1.85, b - 0.1, false); F.b('timber', a + s - 0.05, 0, b + 0.1, a + s + 0.05, 1.85, b + 0.2, false); }
  F.b('timber', a, 1.78, b - 0.05, a + len, 1.86, b + 0.05, false);
  const n = Math.round(len * (lod ? 1.2 : 2.2));
  for (let k = 0; k < n; k++) F.b(k % 3 ? (k % 2 ? 'cloth_brown' : 'ichu') : 'cloth_ochre', a + 0.15 + k * (len - 0.3) / n, 0.65, b - 0.05, a + 0.15 + k * (len - 0.3) / n + 0.26, 1.78, b + 0.05, false);
}
export const pitStore = (F, a, b, r = 0.8) => { F.lathe('planks_grey', [[r, 0.02], [r, 0.08], [0.001, 0.14]], a, 0, b, 10); F.lathe('earth_wall', [[r + 0.2, 0], [r + 0.2, 0.06], [r, 0.08]], a, 0, b, 10); };
/** A raised granary on posts: a floor of planks, walls of wattle, a thatched roof, a ladder. */
export function granary(F, a, b, w = 2.6, d = 2.6) {
  for (const x of [0.2, w - 0.2]) for (const z of [0.2, d - 0.2]) F.b('timber', a + x - 0.1, 0, b + z - 0.1, a + x + 0.1, 0.8, b + z + 0.1);
  F.b('timber', a, 0.8, b, a + w, 0.9, b + d); F.b('wicker', a + 0.1, 0.9, b + 0.1, a + w - 0.1, 2.3, b + d - 0.1);
  F.b('opening', a + w / 2 - 0.3, 1.2, b - 0.01, a + w / 2 + 0.3, 1.9, b + 0.12, false);
  F.roof(a, b, a + w, b + d, 2.3, 1.5, 0.5, true); ridge(F, a, b, a + w, b + d, 2.3, 1.5, 0.5, true);
  F.b('timber', a + w / 2 - 0.3, 0, b - 0.4, a + w / 2 - 0.2, 0.9, b, false); F.b('timber', a + w / 2 + 0.2, 0, b - 0.4, a + w / 2 + 0.3, 0.9, b, false);
  for (let k = 0; k < 4; k++) F.b('timber', a + w / 2 - 0.3, 0.2 + k * 0.2, b - 0.4 + k * 0.05, a + w / 2 + 0.3, 0.24 + k * 0.2, b - 0.36 + k * 0.05, false);
}
export function well(F, a, b) {
  F.lathe('rubble', [[0.75, 0], [0.75, 0.55], [0.5, 0.55]], a, 0, b, 10); F.lathe('earth_wall', [[0.95, 0], [0.95, 0.04], [0.75, 0.06]], a, 0, b, 10);
  F.col.circle(F.P(a, b)[0], F.P(a, b)[1], 0.75, 0, 0.55);
  F.b('timber', a - 0.85, 0.55, b - 0.05, a + 0.85, 0.63, b + 0.05, false);
  for (const s of [-1, 1]) F.b('timber', a + s * 0.85 - 0.05, 0.55, b - 0.05, a + s * 0.85 + 0.05, 1.6, b + 0.05, false);
  F.b('timber', a - 0.95, 1.6, b - 0.05, a + 0.95, 1.68, b + 0.05, false);
  F.lathe('timber', [[0.001, 0], [0.13, 0.01], [0.15, 0.3], [0.001, 0.3]], a + 0.2, 0.7, b + 0.1, 8);        // the bucket
}
/** Ridged beds of a crop: 'millet' (tall, ochre), 'hemp' (tall, green), 'beans' (low); rows along a. lod 1: one block a row. */
export function garden(F, a0, b0, a1, b1, crop, rand, lod = 0) {
  const gap = 0.62, rows = Math.max(2, Math.floor((b1 - b0) / gap)), mat = crop === 'hemp' ? 'flax_leaf' : crop === 'beans' ? 'sod' : 'ichu', hgt = crop === 'millet' ? 1.25 : crop === 'hemp' ? 1.7 : 0.55, wd = crop === 'beans' ? 0.34 : 0.2;
  F.b('earth_wall', a0 - 0.1, 0, b0 - 0.1, a1 + 0.1, 0.05, b1 + 0.1, false);
  for (let r = 0; r < rows; r++) {
    const b = b0 + (r + 0.5) * (b1 - b0) / rows;
    F.b('earth_wall', a0, 0.04, b - 0.18, a1, 0.12, b + 0.18, false);
    if (lod) { F.b(mat, a0 + 0.1, 0.1, b - wd / 2, a1 - 0.1, hgt * 0.85, b + wd / 2, false); continue; }
    const n = Math.max(2, Math.round((a1 - a0) / 0.9));
    for (let k = 0; k < n; k++) { const x = a0 + (k + 0.5) * (a1 - a0) / n, hh = hgt * (0.75 + rand() * 0.4); F.b(mat, x - 0.38, 0.1, b - wd / 2, x + 0.38, hh, b + wd / 2, false); if (crop === 'millet') F.b('hide_tan', x - 0.1, hh - 0.06, b - wd / 2 - 0.02, x + 0.12, hh + 0.2, b + wd / 2 + 0.02, false); }
  }
}
/** A shock of millet sheaves: a cone of stalks bound with a rope. */
export function shock(F, a, b, r = 0.5) { const p = F.P(a, b); F.bag.add('ichu', frustum([p[0] - r, p[1] - r, p[0] + r, p[1] + r], 0, 1.25, r * 0.78, r * 0.78, r * 0.78, r * 0.78, { noBottom: true })); F.bag.add('rope_fibre', box(p[0] - r * 0.5, 0.7, p[1] - r * 0.5, p[0] + r * 0.5, 0.76, p[1] + r * 0.5)); }
export function woodpile(F, a, b, len = 2.4, rows = 4) { for (let r = 0; r < rows; r++) F.b('log_pine', a, r * 0.24, b, a + len, r * 0.24 + 0.22, b + 0.55 - r * 0.04, false); F.col.rect(F.R(a, b, a + len, b + 0.55), 0, rows * 0.24); }
/** A pen of wattle and a mud floor with a trough. */
export function pen(F, a0, b0, a1, b1, gap = null) {
  F.b('earth_wall', a0, 0, b0, a1, 0.03, b1, false);
  const t = 0.08, h = 0.95, seg = (p, q, r, s) => F.b('wicker', p, 0, q, r, h, s);
  if (gap) { seg(a0, b0, gap[0], b0 + t); seg(gap[1], b0, a1, b0 + t); } else seg(a0, b0, a1, b0 + t);
  seg(a0, b1 - t, a1, b1); seg(a0, b0, a0 + t, b1); seg(a1 - t, b0, a1, b1);
  F.b('timber', a1 - 1.2, 0.2, b1 - 0.45, a1 - 0.3, 0.3, b1 - 0.2, false); F.b('timber', a1 - 1.2, 0, b1 - 0.45, a1 - 1.1, 0.2, b1 - 0.2, false);
}
/** An open-air hearth: a ring of stones, a fire, a pot on three stones, jars about it, a mat. */
export function hearth(F, a, b, lod = 0) {
  F.lathe('rubble', [[0.6, 0], [0.6, 0.14], [0.38, 0.14]], a, 0, b, 9); F.lathe('flame', [[0.001, 0.12], [0.16, 0.14], [0.001, 0.42]], a, 0, b, 6);
  F.lathe('pottery_dark', [[0.001, 0.2], [0.28, 0.24], [0.34, 0.42], [0.3, 0.6], [0.001, 0.6]], a + 0.05, 0, b, 9);
  if (!lod) { F.b('reed_mat', a - 1.6, 0.01, b + 0.9, a + 0.6, 0.04, b + 2.2, false); jars(F, a - 1.3, b - 1.1, 3, 0.2); F.b('wicker', a + 0.9, 0, b - 0.5, a + 1.3, 0.28, b - 0.1, false); }
}
/** A grindstone (a saddle quern on a bench) and a mortar with its pestle. */
export function grind(F, a, b) {
  F.b('timber', a, 0.28, b, a + 1.0, 0.36, b + 0.6); for (const x of [0.08, 0.84]) F.b('timber', a + x, 0, b + 0.1, a + x + 0.08, 0.28, b + 0.18, false);
  F.b('granite_grey', a + 0.12, 0.36, b + 0.08, a + 0.88, 0.46, b + 0.52, false); F.b('granite_black', a + 0.3, 0.46, b + 0.2, a + 0.7, 0.54, b + 0.4, false);
  F.lathe('granite_grey', [[0.001, 0], [0.2, 0], [0.22, 0.2], [0.14, 0.34], [0.001, 0.34]], a + 1.6, 0, b + 0.3, 8);
  F.b('timber', a + 1.56, 0.34, b + 0.26, a + 1.64, 0.9, b + 0.34, false);
}
/** An upright loom for hemp cloth: two posts, two beams, the warp, the cloth woven on. */
export function loom(F, a, b) {
  for (const s of [0, 1.4]) F.b('timber', a + s - 0.05, 0, b, a + s + 0.05, 1.6, b + 0.1, false);
  F.b('timber', a, 1.45, b - 0.03, a + 1.4, 1.52, b + 0.13, false); F.b('timber', a, 0.4, b - 0.03, a + 1.4, 0.46, b + 0.13, false);
  F.b('cloth_grey', a + 0.1, 0.5, b + 0.03, a + 1.3, 1.45, b + 0.07, false); F.b('cloth_brown', a + 0.1, 0.5, b + 0.03, a + 1.3, 0.8, b + 0.09, false);
}
export const bench = (F, a, b, l = 1.8, y = 0.42) => { F.b('timber', a, y, b, a + l, y + 0.06, b + 0.34, false); for (const s of [0.15, l - 0.25]) F.b('timber', a + s, 0, b + 0.04, a + s + 0.1, y, b + 0.3, false); F.col.rect(F.R(a, b, a + l, b + 0.34), 0, y + 0.06); };
export const stool = (F, a, b) => { F.lathe('timber', [[0.18, 0], [0.16, 0.3], [0.22, 0.32], [0.001, 0.32]], a, 0, b, 7); };
/** A washing line of hemp cloth between two props. */
export function washline(F, a, b, len, rand) {
  for (const s of [0, len]) F.b('timber', a + s - 0.04, 0, b - 0.04, a + s + 0.04, 1.9, b + 0.04, false);
  F.b('rope_fibre', a, 1.84, b - 0.015, a + len, 1.87, b + 0.015, false);
  for (let x = 0.3; x < len - 0.5; x += 0.5 + rand() * 0.4) F.b(['cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)], a + x, 1.0 + rand() * 0.2, b - 0.03, a + x + 0.35 + rand() * 0.3, 1.85, b + 0.03, false);
}
/** A mat of grain drying in the sun with a rake leaning by. */
export function grainMat(F, a, b, w = 2.4, d = 1.8) { F.b('reed_mat', a, 0.01, b, a + w, 0.04, b + d, false); heap(F, 'ichu', a + w * 0.4, b + d * 0.5, 0.55, 0.35); heap(F, 'hide_tan', a + w * 0.72, b + d * 0.4, 0.35, 0.35); }
/** A fish rack at the river: poles with split carp hung to dry. */
export function fishRack(F, a, b, len = 2.4) { for (const s of [0, len]) F.b('timber', a + s - 0.04, 0, b, a + s + 0.04, 1.5, b + 0.08, false); F.b('timber', a, 1.45, b, a + len, 1.5, b + 0.08, false); for (let k = 0; k < len * 2.5; k++) F.b('hide_grey', a + 0.15 + k * 0.4, 0.9, b + 0.02, a + 0.27 + k * 0.4, 1.45, b + 0.06, false); }
export function dogHouse(F, a, b) { F.b('wicker', a, 0, b, a + 0.9, 0.6, b + 0.7); F.roof(a, b, a + 0.9, b + 0.7, 0.6, 0.35, 0.12, false); F.b('opening', a + 0.25, 0, b - 0.01, a + 0.65, 0.42, b + 0.03, false); }
void rod; void lathe;
