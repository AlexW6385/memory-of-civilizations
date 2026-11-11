// The built ground of Pagan (docs/settlements/bagan.md §2, §6): the Irrawaddy's surface, the ghat of brick steps with its landing, the river boats, the village tank, the brickworks' kiln.
import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import { rng, Fr } from './kit.js';
import { gable } from './houses.js';

const upTris = (t) => {
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i + 3] - t[i], az = t[i + 5] - t[i + 2], bx = t[i + 6] - t[i], bz = t[i + 8] - t[i + 2];
    // fromTriangles' normal is (c − b) × (a − b): its y is positive when the turn a→b→c runs this way
    if (ax * bz - az * bx > 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  return t;
};
const quadUp = (T, a, b, c, d) => { T.push(...a, ...b, ...c, ...a, ...c, ...d); };

/** bgn_river: { edge: [[z, x], ...] (the water's edge x at each z), y (the water level), x0 (the far side) } — the Irrawaddy's surface as a strip. */
export function river(el, ctx) {
  const T = [], y = el.y, e = el.edge;
  for (let i = 0; i < e.length - 1; i++) { const [z0, xa] = e[i], [z1, xb] = e[i + 1]; quadUp(T, [el.x0, y, z0], [xa, y, z0], [xb, y, z1], [el.x0, y, z1]); }
  ctx.bag.add('water', fromTriangles(upTris(T)));
}

/** bgn_ghat: { at: [x, z] (the top of the steps, on the bank), y (the water level), w } — brick steps down the bank (toward −x) to a timber landing over the water, mooring posts. */
export function ghat(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, F = new Fr(ctx, [x, z], [0, 1], [-1, 0]), w = el.w ?? 7, n = 9, run = 0.46, yL = (el.y ?? -2.4) + 0.45;
  for (let i = 0; i < n; i++) F.b('brick', -w / 2, -6, i * run, w / 2, yL * (i + 1) / n, (i + 1) * run + 0.01, false);
  F.ramp(-w / 2, 0, w / 2, n * run, yL, 0, -1);
  // a landing: planks on posts out over the water
  const L0 = n * run, L1 = L0 + 4.5;
  F.b('wood_ochre', -w / 2, yL - 0.18, L0, w / 2, yL, L1, false); F.floor(-w / 2, L0, w / 2, L1, yL);
  for (const u of [-w / 2 + 0.2, w / 2 - 0.2]) for (const v of [L0 + 0.3, L1 - 0.3]) F.b('timber', u - 0.12, -6, v - 0.12, u + 0.12, yL + 1.2, v + 0.12, false);
  void bag;
}

/** bgn_boat: { at: [x, z], y (the waterline), len, yaw (0: the bow toward −z), seed, canopy } — a river boat of the Irrawaddy: a long hull with a raised bow and stern, a thatched canopy amidships, a steering oar, pots and sacks. */
export function boat(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, r = rng(el.seed ?? 1), L = el.len ?? 12, B = L * 0.13, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const F = new Fr(ctx, [x, z], [c, -s], [s, c]);          // u lateral, v along (the bow at −v)
  const n = 12;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, tc = (t0 + t1) / 2, e = Math.abs(tc * 2 - 1);
    const hw = B * 0.5 * (1 - 0.7 * Math.pow(e, 2.4)), rise = 0.1 + 0.9 * Math.pow(Math.max(0, e - 0.55) / 0.45, 2) * (tc < 0.5 ? 1 : 0.6);
    F.b('timber', -hw, y - 0.35, -L / 2 + t0 * L, hw, y + 0.5 + rise, -L / 2 + t1 * L + 0.01, false);
    F.b('wood_ochre', -hw + 0.12, y + 0.45 + rise * 0.0, -L / 2 + t0 * L, hw - 0.12, y + 0.52, -L / 2 + t1 * L + 0.01, false);
  }
  if (el.canopy ?? r() < 0.6) {
    for (const u of [-B * 0.36, B * 0.36]) for (const v of [-L * 0.1, L * 0.2]) F.b('bamboo_culm', u - 0.04, y + 0.5, v - 0.04, u + 0.04, y + 1.9, v + 0.04, false);
    gable(F, 'thatch_palm', -B * 0.55, B * 0.55, -L * 0.14, L * 0.26, y + 1.9, 0.6, false);
  }
  // pots and sacks in the open part
  for (let k = 0; k < 4; k++) F.lathe('terracotta', [[0.1, 0], [0.22, 0.1], [0.25, 0.25], [0.15, 0.4], [0.001, 0.42]], (k % 2 ? 1 : -1) * B * 0.18, y + 0.52, L * (0.3 + k * 0.05), 8);
  F.b('cloth_ochre', -B * 0.15, y + 0.52, L * 0.32, B * 0.2, y + 0.75, L * 0.42, false);
  // the steering oar over the stern
  F.b('wood_dark', -B * 0.2, y + 0.4, L / 2 - 0.3, -B * 0.2 + 0.07, y + 1.3, L / 2 + 1.7, false);
  void bag;
}

/** bgn_tank: { rect, y (the water level) } — a village tank: water, a brick coping, a flight of steps on one side. */
export function tank(el, ctx) {
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? -0.6;
  const T = []; quadUp(T, [x0 + 0.3, y, z0 + 0.3], [x1 - 0.3, y, z0 + 0.3], [x1 - 0.3, y, z1 - 0.3], [x0 + 0.3, y, z1 - 0.3]);
  bag.add('water', fromTriangles(upTris(T)));
  for (const [a, b, c, d] of [[x0 - 0.4, z0 - 0.4, x1 + 0.4, z0 + 0.2], [x0 - 0.4, z1 - 0.2, x1 + 0.4, z1 + 0.4], [x0 - 0.4, z0 - 0.4, x0 + 0.2, z1 + 0.4], [x1 - 0.2, z0 - 0.4, x1 + 0.4, z1 + 0.4]]) bag.add('brick', box(a, y - 0.4, b, c, y + 0.25, d));
}

/** bgn_kiln: { c, seed } — the brickworks: an earth-covered clamp kiln with its fire mouths, stacks of green and fired bricks. */
export function kiln(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, r = rng(el.seed ?? 4);
  bag.add('mud_plaster', frustum([x - 3.2, z - 2.4, x + 3.2, z + 2.4], 0, 2.6, 0.9, 0.9, 0.7, 0.7));
  col.rect([x - 3.2, z - 2.4, x + 3.2, z + 2.4], 0, 2.6);
  for (const dx of [-1.6, 0, 1.6]) bag.add('wood_dark', box(x + dx - 0.35, 0, z + 2.38, x + dx + 0.35, 0.8, z + 2.5));
  bag.add('flame', box(x - 0.35 + 0, 0.1, z + 2.5, x + 0.35, 0.7, z + 2.55));
  for (let k = 0; k < 3; k++) { const sx = x - 8 + k * 1.9 + r() * 0.3, sz = z + 5 + r() * 0.5; bag.add(k % 2 ? 'brick' : 'brick_buff', box(sx, 0, sz, sx + 1.6, 1.2 + r() * 0.5, sz + 0.9)); col.rect([sx, sz, sx + 1.6, sz + 0.9], 0, 1.4); }
  for (let k = 0; k < 3; k++) { const sx = x + 5 + k * 1.9, sz = z - 4 + r(); bag.add('brick_buff', box(sx, 0, sz, sx + 1.6, 1.0, sz + 0.9)); col.rect([sx, sz, sx + 1.6, sz + 0.9], 0, 1.0); }
}
