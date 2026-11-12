// The life of the streets, the landing and the market place of Mohenjo-daro (docs/settlements/mohenjo-daro.md §6, §9, §11): jars and heaps of brick at the walls,
// dust drifting against them, wheel ruts and dung in the roadway, water-stands with their pots, the warehouse sheds and net frames of the landing,
// laundry on the quay, fish weirs in the river, the mat pavilions of the market place. All of it small and non-solid except the stands and sheds.
import { box, lathe, frustum } from '../../core/geom.js';
import { rng } from './kit.js';

const JAR = (s) => [[0.07 * s, 0], [0.2 * s, 0.12 * s], [0.24 * s, 0.3 * s], [0.19 * s, 0.5 * s], [0.1 * s, 0.6 * s], [0.12 * s, 0.66 * s], [0.001, 0.66 * s]];
const jar = (bag, mat, x, y, z, s = 1) => bag.add(mat, lathe(JAR(s), 8, null, x, y, z));

/** indus_streetwork: { streets: [rect], seed } — along both edges of each street, by the walls (the drains lie 0.9–1.5 m in): what the street keeps. */
export function streetwork(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed ?? 5), avoid = el.avoid ?? [], blocked = (x, z) => avoid.some((r) => x > r[0] - 2 && x < r[2] + 2 && z > r[1] - 2 && z < r[3] + 2);
  for (const [x0, z0, x1, z1] of el.streets) {
    const alongZ = z1 - z0 > x1 - x0, L = alongZ ? z1 - z0 : x1 - x0, w = alongZ ? x1 - x0 : z1 - z0;
    // a point `t` along the street, `d` in from the edge `s` (−1 | +1), and the outward unit vector of that edge
    const at = (t, d, s) => (alongZ ? [s < 0 ? x0 + d : x1 - d, z0 + t] : [x0 + t, s < 0 ? z0 + d : z1 - d]);
    for (const s of [-1, 1]) {
      for (let t = 4; t < L - 4; t += 7 + rand() * 6) {
        const r = rand();
        if (blocked(...at(t, 2, s))) continue;
        if (r < 0.24) {                                                // jars standing against the wall, some sunk to the shoulder in a soak pit
          const n = 2 + Math.floor(rand() * 3);
          for (let k = 0; k < n; k++) { const [x, z] = at(t + k * 0.5, 1.9 + rand() * 0.3, s); jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', x, 0, z, 1.2 + rand() * 0.8); }
        } else if (r < 0.36) {                                         // a stack of baked brick for mending, a heap of mud beside it
          const [x, z] = at(t, 1.9, s), a = alongZ, n = 4 + Math.floor(rand() * 4);
          for (let k = 0; k < n; k++) { const dy = k * 0.09; bag.add('brick', box(a ? x - 0.4 : x - 0.8 + (k % 2) * 0.05, dy, a ? z - 0.8 + (k % 2) * 0.05 : z - 0.4, a ? x + 0.4 : x + 0.8 + (k % 2) * 0.05, dy + 0.085, a ? z + 0.8 + (k % 2) * 0.05 : z + 0.4)); }
          bag.add('mudbrick', frustum([x - 0.7 + (a ? 0.9 : 0), z - 0.7 + (a ? 0 : 0.9), x + 0.7 + (a ? 0.9 : 0), z + 0.7 + (a ? 0 : 0.9)], 0, 0.4, 0.35, 0.35, 0.35, 0.35, { noBottom: true }));
        } else if (r < 0.66) {                                         // dust drifted against the wall's foot
          const [x, z] = at(t, 0.1, s), len = 2.5 + rand() * 4;
          bag.add('silt', frustum(alongZ ? [x + (s < 0 ? 0 : -0.9), z, x + (s < 0 ? 0.9 : 0), z + len] : [x, z + (s < 0 ? 0 : -0.9), x + len, z + (s < 0 ? 0.9 : 0)], 0, 0.28, alongZ ? (s < 0 ? 0 : 0.55) : len * 0.25, alongZ ? (s < 0 ? 0.55 : 0) : len * 0.25, alongZ ? len * 0.25 : (s < 0 ? 0 : 0.55), alongZ ? len * 0.25 : (s < 0 ? 0.55 : 0), { noBottom: true }));
        } else if (r < 0.74) {                                         // dung cakes and a basket of them, by a wall where a cow was tied
          const [x, z] = at(t, 2.2, s);
          bag.add('hide_brown', lathe([[0.001, 0], [0.5, 0.04], [0.42, 0.14], [0.001, 0.22]], 8, null, x, 0, z)); bag.add('wicker', lathe([[0.22, 0], [0.28, 0.2], [0.001, 0.2]], 8, null, x + 0.8, 0, z + 0.3));
        }
      }
    }
    // wheel ruts down the middle of the broad streets, broken
    if (w > 8) for (let t = 3; t < L - 6; t += 5 + rand() * 12) {
      const len = 4 + rand() * 9, c = w / 2;
      if (blocked(...at(t + len / 2, c, -1))) continue;
      for (const dc of [-0.7, 0.7]) { const a = alongZ ? [x0 + c + dc - 0.16, z0 + t, x0 + c + dc + 0.16, Math.min(z1 - 2, z0 + t + len)] : [x0 + t, z0 + c + dc - 0.16, Math.min(x1 - 2, x0 + t + len), z0 + c + dc + 0.16]; bag.add('silt', box(a[0], 0.006, a[1], a[2], 0.02, a[3]), false); }
    }
    // water-stands: a brick table with three jars under a mat shade, every 60 m or so, on one side
    for (let t = 20 + rand() * 25; t < L - 20; t += 55 + rand() * 30) {
      const s = rand() < 0.5 ? -1 : 1, [x, z] = at(t, 2.6, s), a = alongZ;
      if (blocked(x, z)) continue;
      bag.add('brick', box(a ? x - 0.4 : x - 0.9, 0, a ? z - 0.9 : z - 0.4, a ? x + 0.4 : x + 0.9, 0.7, a ? z + 0.9 : z + 0.4)); col.rect(a ? [x - 0.4, z - 0.9, x + 0.4, z + 0.9] : [x - 0.9, z - 0.4, x + 0.9, z + 0.4], 0, 0.7);
      for (let k = -1; k <= 1; k++) jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', a ? x : x + k * 0.55, 0.7, a ? z + k * 0.55 : z, 1.5);
      for (const [px, pz] of [[-0.6, -1.0], [0.6, -1.0], [-0.6, 1.0], [0.6, 1.0]]) bag.add('timber', box((a ? x + px : x + pz) - 0.05, 0, (a ? z + pz : z + px) - 0.05, (a ? x + px : x + pz) + 0.05, 2.3, (a ? z + pz : z + px) + 0.05), false);
      bag.add('reed_mat', box(a ? x - 0.85 : x - 1.25, 2.3, a ? z - 1.25 : z - 0.85, a ? x + 0.85 : x + 1.25, 2.36, a ? z + 1.25 : z + 0.85), false);
    }
  }
}

/** indus_shed: { rect, front ('e' | 'w' | 'n' | 's'), seed, y } — an open-fronted warehouse of brick with a flat roof: sacks, jars, a balance and its weights, a tally board. */
export function shed(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 9), H = 3.3, t = 0.5, e = el.front === 'e';
  const seg = (r, y0, y1, m = 'brick') => { bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); col.rect(r, y + y0, y + y1); };
  bag.add('brick_buff', box(x0, y - 0.1, z0, x1, y + 0.05, z1)); col.floor(el.rect, y + 0.05);
  const bx0 = e ? x0 : x1 - t, bx1 = e ? x0 + t : x1;
  seg([bx0, z0, bx1, z1], 0, H); seg([x0, z0, x1, z0 + t], 0, H); seg([x0, z1 - t, x1, z1 - t + t], 0, H);
  const fx = e ? x1 - 0.4 : x0 + 0.4;                                     // the front: posts, a beam
  for (let z = z0 + t + 1.5; z < z1 - t - 1; z += 3.6) { bag.add('timber', box(fx - 0.18, y, z - 0.18, fx + 0.18, y + H - 0.3, z + 0.18)); col.rect([fx - 0.18, z - 0.18, fx + 0.18, z + 0.18], y, y + H - 0.3); }
  bag.add('timber', box(e ? x1 - 0.8 : x0, y + H - 0.32, z0 + t, e ? x1 : x0 + 0.8, y + H, z1 - t), false);
  bag.add('mud_plaster', box(x0 - 0.15, y + H, z0 - 0.15, x1 + 0.15, y + H + 0.4, z1 + 0.15)); col.floor(el.rect, y + H + 0.4);
  bag.add('mudbrick', box(x0 - 0.15, y + H + 0.4, z0 - 0.15, x1 + 0.15, y + H + 0.8, z0 + 0.1), false); bag.add('mudbrick', box(x0 - 0.15, y + H + 0.4, z1 - 0.1, x1 + 0.15, y + H + 0.8, z1 + 0.15), false);
  // inside: heaped sacks along the back, rows of big jars, a balance on a table with its weights
  const bk = e ? x0 + t : x1 - t, dir = e ? 1 : -1;
  for (let z = z0 + t + 0.4; z < z1 - t - 1.6; z += 1.5) for (let k = 0; k < 3; k++) bag.add(k % 2 ? 'sacking' : 'wicker', box(Math.min(bk, bk + dir * 1.1), y + 0.05 + k * 0.3, z, Math.max(bk, bk + dir * 1.1), y + 0.35 + k * 0.3 - (k === 2 ? 0.05 : 0), z + 1.2), false);
  for (let z = z0 + t + 0.8; z < z1 - t - 0.8; z += 1.3) jar(bag, rand() < 0.5 ? 'terracotta' : 'pottery_dark', bk + dir * 2.3, y + 0.05, z, 1.9 + rand() * 0.5);
  const tx = bk + dir * 4.6, tz = (z0 + z1) / 2;
  bag.add('timber', box(tx - 0.5, y + 0.05, tz - 0.9, tx + 0.5, y + 0.9, tz + 0.9), false);
  bag.add('timber', box(tx - 0.05, y + 0.9, tz - 0.05, tx + 0.05, y + 1.5, tz + 0.05), false); bag.add('bronze', box(tx - 0.04, y + 1.45, tz - 0.8, tx + 0.04, y + 1.5, tz + 0.8), false);
  for (const s of [-1, 1]) bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.05], [0.001, 0.05]], 8, null, tx, y + 0.9, tz + s * 0.7), false);
  for (let k = 0; k < 6; k++) bag.add('granite_grey', box(tx + 0.1, y + 0.9, tz - 0.5 + k * 0.18, tx + 0.18, y + 0.9 + 0.04 + 0.015 * k, tz - 0.4 + k * 0.18), false);
  bag.add('timber', box(bk + dir * 0.06 - 0.03, y + 0.4, z1 - t - 2.2, bk + dir * 0.06 + 0.03, y + 1.9, z1 - t - 0.6), false);
  bag.add('wood_dark', box(Math.min(bk, bk + dir * 0.1), y + 1.0, z1 - t - 2.1, Math.max(bk, bk + dir * 0.1), y + 1.8, z1 - t - 0.7), false);
  lights.push({ at: [bk + dir * 3, y + 2.6, tz], color: '#ffd9a0', intensity: 2.4, distance: 9 });
}

/** indus_fishery: { x, z, seed } — on the quay's apron: a net frame with a net drying, baskets of fish, cloth washed and spread. */
export function fishery(el, ctx) {
  const { bag } = ctx, [x, z] = [el.x, el.z], y = el.y ?? 0, rand = rng(el.seed ?? 3);
  const a = el.along ?? 'z';
  const P = (u, v) => (a === 'z' ? [x + v, z + u] : [x + u, z + v]);
  for (const u of [0, 4.4]) { const [px, pz] = P(u, 0); bag.add('timber', box(px - 0.07, y, pz - 0.07, px + 0.07, y + 2.6, pz + 0.07), false); }
  const [ax, az] = P(0, 0), [bx, bz] = P(4.4, 0);
  bag.add('timber', box(Math.min(ax, bx) - 0.07, y + 2.5, Math.min(az, bz) - 0.07, Math.max(ax, bx) + 0.07, y + 2.6, Math.max(az, bz) + 0.07), false);
  for (let k = 0; k < 11; k++) { const u = 0.15 + k * 0.4, [px, pz] = P(u, 0), h = 1.0 + Math.sin(k * 1.7) * 0.2; bag.add('rope_fibre', box(px - 0.012, y + 2.5 - h, pz - 0.012, px + 0.012, y + 2.5, pz + 0.012), false); }
  for (let j = 0; j < 5; j++) { const [p0x, p0z] = P(0.1, 0.01), [p1x, p1z] = P(4.3, 0.01); bag.add('rope_fibre', box(Math.min(p0x, p1x) - 0.01, y + 2.45 - j * 0.28, Math.min(p0z, p1z) - 0.01, Math.max(p0x, p1x) + 0.01, y + 2.47 - j * 0.28, Math.max(p0z, p1z) + 0.01), false); }
  for (let k = 0; k < 3; k++) { const [px, pz] = P(5.6 + k * 0.7, 1.2 + (k % 2) * 0.4); bag.add('wicker', lathe([[0.3, 0], [0.38, 0.22], [0.34, 0.3], [0.001, 0.3]], 8, null, px, y, pz), false); for (let f = 0; f < 3; f++) bag.add('silver', box(px - 0.16 + f * 0.1, y + 0.3, pz - 0.05, px - 0.1 + f * 0.1, y + 0.34, pz + 0.18), false); }
  for (let k = 0; k < 3; k++) { const [px, pz] = P(1 + k * 1.5, 2.6 + rand()); bag.add(['cloth_white', 'cloth_ochre', 'cloth_indigo'][k], box(px - 0.5, y + 0.01, pz - 0.35, px + 0.5, y + 0.03, pz + 0.35), false); }
}

/** indus_weir: { x0, z0, z1, level, seed } — fish stakes in the shallows: rows of poles standing out of the water in a V, with a trap basket at the point. */
export function weir(el, ctx) {
  const { bag } = ctx, { x, z, level } = el, rand = rng(el.seed ?? 4);
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { const px = x + k * 0.9, pz = z + s * (5 - k * 0.5); bag.add('timber', box(px - 0.05, level - 1, pz - 0.05, px + 0.05, level + 0.9 + rand() * 0.5, pz + 0.05), false); }
  bag.add('wicker', lathe([[0.5, 0], [0.55, 0.4], [0.3, 0.7], [0.001, 0.8]], 8, null, x + 8.4, level - 0.2, z), false);
  for (let k = 0; k < 6; k++) bag.add('reed_mat', box(x + 0.9 * k, level + 0.0, z - 5 + k * 0.5 - 0.02, x + 0.9 * k + 0.9, level + 0.4, z - 5 + k * 0.5 + 0.02), false);
}

/** indus_shade: { c: [x, z], seed } — a pavilion of reed mats on tall poles, 5 × 5 m, with a bench beneath: the shade of the market place's corners. */
export function shade(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, H = 3.4, a = 2.5;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bag.add('timber', box(x + sx * a - 0.1, 0, z + sz * a - 0.1, x + sx * a + 0.1, H, z + sz * a + 0.1)); col.circle(x + sx * a, z + sz * a, 0.12, 0, H); }
  for (let k = -2; k <= 2; k++) bag.add('timber', box(x - a - 0.2, H, z + k * 1.1 - 0.06, x + a + 0.2, H + 0.1, z + k * 1.1 + 0.06), false);
  bag.add('reed_mat', box(x - a - 0.3, H + 0.1, z - a - 0.3, x + a + 0.3, H + 0.17, z + a + 0.3), false);
  bag.add('cloth_red', box(x - a - 0.3, H - 0.4, z - a - 0.3, x + a + 0.3, H, z - a - 0.26), false);
  bag.add('mudbrick', box(x - 1.6, 0, z - 0.3, x + 1.6, 0.44, z + 0.3)); col.rect([x - 1.6, z - 0.3, x + 1.6, z + 0.3], 0, 0.44);
  bag.add('reed_mat', box(x - 1.5, 0.44, z - 0.25, x + 1.5, 0.47, z + 0.25), false);
  for (let k = 0; k < 3; k++) jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', x - 1.0 + k * 1.0, 0, z + 1.4, 1.5);
}
