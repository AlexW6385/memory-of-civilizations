// The Tang bracket sets under the eaves of the East Hall, as the visitor sees them from below (docs/settlements/tang-wutai.md §18):
// every member a chamfered timber of cai section (0.21 × 0.30 m) with its real profile — the flower arms (huagong) whose lower edges are
// cut in stepped curves (juansha) toward the ends, the two descending cantilevers (xia ang, cut as split bamboo, pizhu: the beak's lower
// face leaning out in an oblique bevel), the cross-arms (guazi, ling gong) with the same curves, the beam-end through the whole; the blocks
// (dou) with their foot, belly and ears. The set's plan is the shared Tang one (chinese/index.js tangBracket): column-top block 0.64 m, tiers
// every 0.41 m from 0.24 m over the column, the arms' step 0.48 m. One geometry for each set, flat-shaded.

import { Acc, skin, flat, hash, smooth } from './sculpt-kit.js';

const H = 0.3, W = 0.105, LV = 0.41, S = 0.48, BV = 0.016;

/** A chamfered timber along s (out from the wall) of half-width W: lo(s), hi(s) the lower and upper edge at each sample. */
function timber(A, mat, fr, samples, lo, hi, w = W) {
  const rows = samples.map((s) => {
    const l = lo(s), h = hi(s), b = Math.min(BV, (h - l) * 0.3);
    return [[l, -w + b], [l + b, -w], [h - b, -w], [h, -w + b], [h, w - b], [h - b, w], [l + b, w], [l, w - b]].map(([y, t]) => fr(s, t, y));
  });
  A.add(mat, flat(skin(rows, true, true)));
}
/** Sample positions: the ends in `n` steps of the curve, the middle left to the straight run. */
const sampled = (s0, s1, cu0, cu1, n = 6) => {
  const out = [s0]; const e0 = cu0 ? Math.min(0.28, (s1 - s0) / 3) : 0, e1 = cu1 ? Math.min(0.28, (s1 - s0) / 3) : 0;
  for (let i = 1; i <= n && e0; i++) out.push(s0 + e0 * i / n);
  for (let i = n - 1; i >= 0 && e1; i--) out.push(s1 - e1 * i / n);
  if (!e1) out.push(s1);
  if (!e0) out.splice(1, 0, ...[]);
  return [...new Set(out.map((v) => Math.round(v * 1e4) / 1e4))].sort((a, b) => a - b);
};
// the stepped curve of a flower arm's lower edge: rises over two arcs toward the end
const cusp = (u) => { const v = Math.max(0, Math.min(1, u)) * 2, i = Math.min(1, Math.floor(v)), f = v - i; return (i + Math.sin(f * Math.PI / 2)) / 2; };

/** A dou (block) centred at (s, t) in the set's frame, half-width hw, from y0 to y0 + h: a narrow foot, the belly, the broad top with its ears. */
function dou(A, fr, s, t, hw, y0, h, mat) {
  const oct = (k) => [[1, 0.62], [0.62, 1], [-0.62, 1], [-1, 0.62], [-1, -0.62], [-0.62, -1], [0.62, -1], [1, -0.62]].map(([a, b]) => [a * hw * k, b * hw * k]);
  const row = (k, y) => oct(k).map(([a, b]) => fr(s + a, t + b, y));
  A.add(mat, flat(skin([row(0.7, y0), row(0.7, y0 + h * 0.28), row(0.86, y0 + h * 0.4), row(1, y0 + h * 0.52), row(1, y0 + h * 0.62), row(1.02, y0 + h * 0.64), row(1.02, y0 + h)], true, true)));
}

/** A flat slab (a cap, a bearing block) centred (s, t) in the set's frame, half-sizes hs along the axis and ht across; `swap` turns it to run along the wall. */
function slab(A, mat, fr, s, t, hs, ht, y0, y1, swap = false) {
  const r = (y, g) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => (swap ? fr(s + a * hs, t + b * ht, y) : fr(s + a * (hs + g), t + b * (ht + g), y)));
  A.add(mat, flat(skin([r(y0, 0), r(y0 + (y1 - y0) * 0.5, 0), r(y1, -0.0)], true, true)));
}

/**
 * fg_bracket_set { at, y (the column's top), dir (outward), kind: 'column' | 'corner' | 'between', post, lod }: the set with real profiles.
 */
export function fgBracketSet(el, { bag }) {
  const [x, z] = el.at, y = el.y, kind = el.kind || 'column', mat = el.mat || 'timber_red', A = new Acc();
  const Lk = (k) => y + 0.24 + k * LV, ph = hash(x, z, 4) * 0.01;
  const dirs = kind === 'corner' ? [[el.dir, 1], [[(el.dir[0] + el.dir[1]) / Math.SQRT2, (el.dir[1] - el.dir[0]) / Math.SQRT2], 0], [[(el.dir[0] - el.dir[1]) / Math.SQRT2, (el.dir[1] + el.dir[0]) / Math.SQRT2], 0]] : [[el.dir, 1]];
  const capH = kind === 'between' ? 0.3 : 0.4, capW = kind === 'between' ? 0.22 : 0.32;
  if (el.post) timber(A, mat, (s, t, yy) => [x + (-el.dir[1]) * s * 0 + el.dir[0] * t, yy, z + el.dir[1] * t], [0, 1], () => y - el.post, () => y, 0.12);
  for (const [n, main] of dirs) {
    const u = [-n[1], n[0]], st = kind === 'corner' && !main ? S : kind === 'corner' ? S * Math.SQRT2 : S;
    const fr = (s, t, yy) => [x + n[0] * s + u[0] * t, yy, z + n[1] * s + u[1] * t];
    const frU = (s, t, yy) => [x + u[0] * s + n[0] * t, yy, z + u[1] * s + n[1] * t];       // an arm along the wall, `s` along it and `t` out from it
    // a flower arm along the outward axis, its ends cut in the stepped curve
    const hua = (s0, s1, k, cu0 = true, cu1 = true) => timber(A, mat, fr, sampled(s0, s1, cu0, cu1), (s) => { const e0 = cu0 ? cusp((s0 + 0.28 - s) / 0.28) : 0, e1 = cu1 ? cusp((s - (s1 - 0.28)) / 0.28) : 0; return Lk(k) + H * 0.6 * Math.max(e0, e1) + ph; }, () => Lk(k) + H + ph);
    // an arm along the wall (guazi, ling gong, nidao) centred `reach` out
    const cross = (reach, hl, k, nb = 2) => {
      const frC = (s, t, yy) => [x + n[0] * (reach + t) + u[0] * s, yy, z + n[1] * (reach + t) + u[1] * s];
      timber(A, mat, frC, sampled(-hl, hl, true, true, 4), (s) => Lk(k) + H * 0.55 * Math.max(cusp((-hl + 0.18 - s) / 0.18), cusp((s - (hl - 0.18)) / 0.18)), () => Lk(k) + H);
      const at = nb === 3 ? [-hl + 0.15, 0, hl - 0.15] : [-hl + 0.15, hl - 0.15];
      for (const a of at) dou(A, frC, a, 0, 0.15, Lk(k) + H, 0.19, mat);
    };
    const tip = (reach, k) => dou(A, fr, reach, 0, 0.16, Lk(k) + H, 0.19, mat);
    // a descending cantilever whose top passes (reach, Lk(k) + H), sloping down outward; the beak cut obliquely, the lower face leaning out
    const ang = (reach, k, tail) => {
      const sl = 0.5, yt = (s) => Lk(k) + H - sl * (s - reach), d = H / Math.cos(Math.atan(sl)), tp = reach + 0.46, cut = 0.17;
      const ss = [tail, tail + (tp - cut - tail) * 0.5, tp - cut, tp - cut * 0.5, tp];
      timber(A, mat, fr, ss, (s) => yt(s) - d + (s > tp - cut ? 0 : 0), (s) => (s <= tp - cut ? yt(s) : yt(tp - cut) - (yt(tp - cut) - (yt(tp) - d)) * ((s - (tp - cut)) / cut) * 0.97));
      tip(reach, k);
    };
    // the column-top block, with a moulded cap
    if (main) {
      dou(A, fr, 0, 0, capW, y, capH, mat);
      slab(A, mat, fr, 0, 0, capW + 0.04, capW + 0.04, y + capH - 0.05, y + capH);
    }
    if (kind === 'between') {
      hua(-st, st, 0); tip(st, 0); tip(-st, 0);
      hua(-2 * st, 2 * st, 1); tip(2 * st, 1); tip(-2 * st, 1);
      cross(0, 0.5, 0);
      continue;
    }
    if (!main) { hua(-st, st, 0); tip(st, 0); tip(-st, 0); hua(-2 * st, 2 * st, 1); cross(2 * st, 0.31, 2); continue; }
    hua(-st, st, 0); tip(st, 0); tip(-st, 0);
    hua(-2 * st, 2 * st, 1); cross(2 * st, 0.31, 2); cross(2 * st, 0.46, 3); cross(-2 * st, 0.31, 2);
    ang(3 * st, 2, -1.7);
    ang(4 * st, 3, -1.3);
    cross(4 * st, 0.36, 4, 3);
    // the bearing block over the ling gong and the beam-end (shuatou) through it, its end cut in a slanted face
    timber(A, mat, fr, [-1.5, 4 * st + 0.2, 4 * st + 0.42, 4 * st + 0.5], (s) => Lk(4) + (s > 4 * st + 0.4 ? H * 0.3 : 0), (s) => Lk(4) + H * (s > 4 * st + 0.45 ? 0.6 : 1), 0.1);
    slab(A, mat, fr, 4 * st, 0, W, 0.52, Lk(4) + H + 0.11, Lk(4) + H + 0.26, true);
    hua(-3 * st, -2 * st + 0.2, 2, true, false); tip(-3 * st, 2);
    if (kind !== 'corner') { cross(0, 0.62, 0, 3); cross(0, 0.92, 1); }
  }
  A.emit(bag, () => {});
}
void smooth;
