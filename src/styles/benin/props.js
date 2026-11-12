// Small things of the Edo house, the yard and the street (docs/settlements/benin-city.md §5, §10): furniture of clay and wood, the
// hearth, the mortar, pots, racks, the plantain, the weathering of red clay. All in world coordinates, all merged into the plan's bag
// (the small pieces are drawn only near, src/core/geom.js).
import { box, lathe, rod, frustum, rng } from './kit.js';

const CLOTHS = ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_blue', 'cloth_green', 'cloth_maroon', 'cloth_brown'];
const pickOf = (rand, a) => a[Math.floor(rand() * a.length)];

/** A pot: round body, neck and lip, h high; lid: a flat cover. */
export function pot(ctx, x, y, z, r = 0.3, h = 0.6, mat = 'terracotta', lid = false) {
  ctx.bag.add(mat, lathe([[0.001, 0], [r * 0.55, 0.01], [r, h * 0.38], [r * 0.92, h * 0.7], [r * 0.55, h * 0.9], [r * 0.6, h], [r * 0.5, h], [0.001, h * 0.92]], 9, null, x, y, z));
  if (lid) ctx.bag.add('wicker', lathe([[0.001, h], [r * 0.7, h], [r * 0.6, h + 0.05], [0.001, h + 0.09]], 8, null, x, y, z));
}
/** Pots in a cluster at (x, z): n of them, sizes varied. */
export function pots(ctx, x, y, z, seed, n = 3, solid = true) {
  const rand = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = rand() * 6.28, d = i ? 0.38 + rand() * 0.2 : 0, r = 0.2 + rand() * 0.15, h = 0.4 + rand() * 0.4;
    pot(ctx, x + Math.cos(a) * d, y, z + Math.sin(a) * d, r, h, rand() < 0.35 ? 'pottery_dark' : 'terracotta', rand() < 0.4);
  }
  if (solid) ctx.col.circle(x, z, 0.5 + (n > 2 ? 0.2 : 0), y, y + 0.7);
}
/** The Edo stool: a waisted seat, round or square, 0.34 m high. */
export function stool(ctx, x, y, z, mat = 'timber') {
  ctx.bag.add(mat, lathe([[0.001, 0], [0.17, 0], [0.09, 0.06], [0.08, 0.2], [0.2, 0.3], [0.2, 0.34], [0.001, 0.34]], 8, null, x, y, z));
}
/** A bed of clay: a platform with a reed mat, a hide and a folded cloth. */
export function bed(ctx, r, y, seed, solid = true) {
  const rand = rng(seed), [x0, z0, x1, z1] = r;
  ctx.bag.add('tuff_red', box(x0, y, z0, x1, y + 0.42, z1)); if (solid) ctx.col.rect(r, y, y + 0.45);
  ctx.bag.add('reed_mat', box(x0 + 0.04, y + 0.42, z0 + 0.04, x1 - 0.04, y + 0.435, z1 - 0.04));
  const long = (x1 - x0) > (z1 - z0), a = long ? [x0 + 0.1, z0 + 0.1, x0 + (x1 - x0) * 0.55, z1 - 0.1] : [x0 + 0.1, z0 + 0.1, x1 - 0.1, z0 + (z1 - z0) * 0.55];
  ctx.bag.add(pickOf(rand, ['hide_tan', 'hide_brown', 'cloth_ochre']), box(a[0], y + 0.435, a[1], a[2], y + 0.46, a[3]));
  const c = long ? [x1 - 0.5, z0 + 0.15, x1 - 0.15, z1 - 0.15] : [x0 + 0.15, z1 - 0.5, x1 - 0.15, z1 - 0.15];
  ctx.bag.add(pickOf(rand, CLOTHS), box(c[0], y + 0.435, c[1], c[2], y + 0.53, c[3]));
}
/** A chest of timber with bronze studs. */
export function chest(ctx, x, y, z, w = 0.9, d = 0.5, h = 0.55) {
  ctx.bag.add('timber', box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2)); ctx.col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + h);
  ctx.bag.add('wood_dark', box(x - w / 2 - 0.01, y + h, z - d / 2 - 0.01, x + w / 2 + 0.01, y + h + 0.04, z + d / 2 + 0.01));
  for (const s of [-1, 1]) ctx.bag.add('bronze', box(x + s * w * 0.3 - 0.03, y + 0.2, z - d / 2 - 0.02, x + s * w * 0.3 + 0.03, y + 0.35, z - d / 2));
}
/** The three-stone hearth with its black pot, the ash and a few logs. */
export function hearth(ctx, x, y, z, seed = 1) {
  const rand = rng(seed), { bag, col } = ctx;
  bag.add('plaster_damp', lathe([[0.001, 0.005], [0.5, 0.005], [0.5, 0.02], [0.001, 0.02]], 10, null, x, y, z));
  for (let i = 0; i < 3; i++) { const a = i * 2.09 + rand(); bag.add('tuff_red', lathe([[0.001, 0], [0.11, 0], [0.13, 0.14], [0.07, 0.22], [0.001, 0.22]], 6, null, x + Math.cos(a) * 0.2, y, z + Math.sin(a) * 0.2)); }
  pot(ctx, x, y + 0.2, z, 0.3, 0.38, 'pottery_dark', true);
  for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.9; bag.add('timber', rod([x + Math.cos(a) * 0.15, y + 0.06, z + Math.sin(a) * 0.15], [x + Math.cos(a) * 0.6, y + 0.04, z + Math.sin(a) * 0.6], 0.035, 5)); }
  col.circle(x, z, 0.5, y, y + 0.6);
}
/** The wooden mortar with its pestle leaning on it (yam is pounded in it). */
export function mortar(ctx, x, y, z, seed = 1) {
  const rand = rng(seed), a = rand() * 6.28;
  ctx.bag.add('wood_dark', lathe([[0.001, 0], [0.16, 0], [0.12, 0.2], [0.14, 0.4], [0.24, 0.62], [0.2, 0.62], [0.1, 0.46], [0.001, 0.46]], 10, null, x, y, z));
  ctx.bag.add('timber', rod([x + Math.cos(a) * 0.12, y + 0.5, z + Math.sin(a) * 0.12], [x + Math.cos(a) * 0.36, y + 1.6, z + Math.sin(a) * 0.36], 0.04, 6));
  ctx.col.circle(x, z, 0.28, y, y + 0.7);
}
/** A drying rack: two forked posts and rails, spread with a cloth, peppers, yam slices or cassava. */
export function rack(ctx, x, z, y, along, len, seed, load = 'pepper') {
  const rand = rng(seed), [ax, az] = along, { bag, col } = ctx;
  const p = (t, h) => [x + ax * t, y + h, z + az * t];
  for (const t of [-len / 2, len / 2]) { bag.add('palm_trunk', rod(p(t, 0), p(t, 1.1), 0.05, 5)); col.circle(x + ax * t, z + az * t, 0.07, y, y + 1.1); }
  bag.add('timber', rod(p(-len / 2, 1.1), p(len / 2, 1.1), 0.03, 5)); bag.add('timber', rod(p(-len / 2, 0.95), p(len / 2, 0.95), 0.03, 5));
  const th = 0.05, w = Math.abs(az) > Math.abs(ax) ? [0.3, len] : [len, 0.3];
  const m = load === 'pepper' ? 'wall_red' : load === 'cloth' ? pickOf(rand, CLOTHS) : load === 'cassava' ? 'chalk' : 'ivory';
  if (load === 'cloth') bag.add(m, box(x - w[0] / 2 * 0.9, y + 0.5, z - w[1] / 2 * 0.9, x + w[0] / 2 * 0.9, y + 1.1, z + w[1] / 2 * 0.9));
  else for (let i = 0; i < 6; i++) { const t = -len / 2 + (i + 0.5) * len / 6; bag.add(m, lathe([[0.001, 0], [0.1, 0.01], [0.08, 0.05], [0.001, 0.07]], 6, null, x + ax * t, y + 1.1, z + az * t)); }
  void th;
}
/** Washing hung on a line between two posts: cloths of the Edo wrappers. */
export function wash(ctx, a, b, y, seed, n = 4) {
  const rand = rng(seed), { bag, col } = ctx, Ln = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Ln, uz = (b[1] - a[1]) / Ln;
  for (const q of [a, b]) { bag.add('palm_trunk', rod([q[0], y, q[1]], [q[0], y + 2.3, q[1]], 0.05, 5)); col.circle(q[0], q[1], 0.07, y, y + 2.3); }
  bag.add('rope_fibre', rod([a[0], y + 2.2, a[1]], [b[0], y + 2.2, b[1]], 0.012, 4));
  let t = 0.3;
  for (let i = 0; i < n && t < Ln - 0.6; i++) {
    const w = 0.6 + rand() * 0.5, h = 0.8 + rand() * 0.5, x0 = a[0] + ux * t, z0 = a[1] + uz * t, x1 = a[0] + ux * (t + w), z1 = a[1] + uz * (t + w);
    bag.add(pickOf(rand, CLOTHS), box(Math.min(x0, x1) - 0.02, y + 2.2 - h, Math.min(z0, z1) - 0.02, Math.max(x0, x1) + 0.02, y + 2.2, Math.max(z0, z1) + 0.02));
    t += w + 0.15 + rand() * 0.3;
  }
}
/** A stack of firewood: rows of billets lying along `along`, 4 courses. */
export function wood(ctx, x, y, z, along, len = 1.4, seed = 1) {
  const rand = rng(seed), [ax, az] = along;
  for (let row = 0; row < 4; row++) for (let k = 0; k < 5 - row; k++) {
    const o = (k - (4 - row) / 2) * 0.17, px = x - az * o, pz = z + ax * o, py = y + 0.07 + row * 0.13, l = len * (0.45 + rand() * 0.08);
    ctx.bag.add('timber', rod([px - ax * l, py, pz - az * l], [px + ax * l, py, pz + az * l], 0.06, 5));
  }
  ctx.col.rect([x - Math.abs(ax) * len * 0.5 - Math.abs(az) * 0.4, z - Math.abs(az) * len * 0.5 - Math.abs(ax) * 0.4, x + Math.abs(ax) * len * 0.5 + Math.abs(az) * 0.4, z + Math.abs(az) * len * 0.5 + Math.abs(ax) * 0.4], y, y + 0.6);
}
/** A plantain clump: a few green trunks with a fan of long leaves, a bunch hanging. */
export function plantain(ctx, x, y, z, seed = 1, n = 3) {
  const rand = rng(seed), { bag } = ctx;
  for (let i = 0; i < n; i++) {
    const a = rand() * 6.28, d = i ? 0.5 + rand() * 0.4 : 0, h = 2.2 + rand() * 1.3, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    bag.add('palm_leaf', lathe([[0.001, 0], [0.17, 0], [0.12, h * 0.5], [0.1, h], [0.001, h]], 6, null, px, y, pz));
    for (let k = 0; k < 6; k++) {
      const t = k / 6 * 6.28 + rand(), lr = 1.5 + rand() * 0.7, tilt = 0.5 + rand() * 0.5;
      const e = [px + Math.cos(t) * lr * Math.cos(tilt) * 0.9, y + h + lr * Math.sin(tilt) * 0.2 - 0.5 * tilt, pz + Math.sin(t) * lr * Math.cos(tilt) * 0.9];
      const mid = [(px + e[0]) / 2, y + h + 0.35, (pz + e[2]) / 2];
      bag.add('palm_leaf', rod([px, y + h, pz], mid, 0.06, 4)); bag.add('palm_leaf', rod(mid, e, 0.05, 4));
    }
    bag.add('palm_leaf', lathe([[0.001, 0], [0.09, 0.05], [0.07, 0.5], [0.001, 0.55]], 6, null, px + 0.25, y + h - 0.7, pz));
  }
  ctx.col.circle(x, z, 0.35, y, y + 2.5);
}
/**
 * The weathering of a clay wall on its outer face: a band of rain-splash at the foot, patches of damp and green, streaks washed
 * from under the eaves, patches of mended clay. a, b: the wall's centre line (ends), th its thickness, ya..yb its height.
 */
export function wear(ctx, a, b, th, ya, yb, seed, { damp = 1, patches = 1 } = {}) {
  const rand = rng(seed), Ln = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (Ln < 1.5) return;
  const ux = (b[0] - a[0]) / Ln, uz = (b[1] - a[1]) / Ln, at = (s) => [a[0] + ux * s, a[1] + uz * s];
  // (boxes are axis-aligned: walls here run along x or z; the strip is as thin as the wall's face)
  const alongX = Math.abs(ux) > Math.abs(uz), T = 0.035, face = th / 2 + T / 2 - 0.012;
  const put = (s0, s1, y0, y1, mat, ex = 0) => {
    const p = at(s0), q = at(s1);
    for (const sg of [-1, 1]) {
      if (alongX) ctx.bag.add(mat, box(Math.min(p[0], q[0]), y0, p[1] + sg * (face + ex) - T / 2, Math.max(p[0], q[0]), y1, p[1] + sg * (face + ex) + T / 2));
      else ctx.bag.add(mat, box(p[0] + sg * (face + ex) - T / 2, y0, Math.min(p[1], q[1]), p[0] + sg * (face + ex) + T / 2, y1, Math.max(p[1], q[1])));
    }
  };
  // splash band at the foot, in runs
  for (let s = 0; s < Ln;) { const l = 1.2 + rand() * 2.8; if (rand() < 0.85) put(s, Math.min(Ln, s + l), ya, ya + 0.35 + rand() * 0.3, 'scoria_red'); s += l + rand() * 0.8; }
  for (let i = 0, n = Math.round(Ln / 4 * damp); i < n; i++) { const s = rand() * (Ln - 1.2); put(s, s + 0.5 + rand() * 0.7, ya + 0.04, ya + 0.3 + rand() * 0.55, 'plaster_damp', 0.004); }
  for (let i = 0, n = Math.round(Ln / 3.2); i < n; i++) { const s = 0.4 + rand() * (Ln - 0.8), h = Math.min((yb - ya) * 0.6, 0.8 + rand() * 1.3); put(s, s + 0.07 + rand() * 0.08, yb - h - 0.12, yb - 0.1, 'plaster_streak', 0.02); }
  for (let i = 0, n = Math.round(Ln / 5 * patches); i < n; i++) { const s = rand() * (Ln - 1.4), y = ya + 0.7 + rand() * (yb - ya - 1.8); put(s, s + 0.6 + rand() * 0.7, y, y + 0.4 + rand() * 0.35, 'mud_plaster', 0.036); }
}
/** A bench of clay against a wall, `rect` its plan, 0.45 high, with a mat on it. */
export function claySeat(ctx, r, y, seed) {
  ctx.bag.add('stucco_red', box(r[0], y, r[1], r[2], y + 0.46, r[3])); ctx.col.rect(r, y, y + 0.48);
  if (seed % 3 === 0) ctx.bag.add('reed_mat', box(r[0] + 0.05, y + 0.46, r[1] + 0.05, r[2] - 0.05, y + 0.475, r[3] - 0.05));
}
/** A cloth strip hung from a beam (the trader's wares). */
export function hung(ctx, x, y, z, along, n, seed, h = 0.9) {
  const rand = rng(seed), [ax, az] = along;
  for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 0.32, m = pickOf(rand, CLOTHS), hh = h * (0.7 + rand() * 0.5), px = x + ax * o, pz = z + az * o; ctx.bag.add(m, box(px - 0.12 - Math.abs(az) * 0.01, y - hh, pz - 0.12 * Math.abs(ax) - 0.012, px + 0.12 + Math.abs(az) * 0.01, y, pz + 0.12 * Math.abs(ax) + 0.012)); }
}
export { frustum };
