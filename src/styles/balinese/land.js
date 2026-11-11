// Land and festival: the water of flooded paddies (row-merged rectangles on the terraces' flat treads), subak channels with their brick lips, the unwalled
// shrine of the water temple among the paddies, the penjors of the temple festival, offerings on the ground, the banyan's seat at the crossing.
import { box, fromTriangles } from '../../core/geom.js';
import { bx, curvedPole, canang, rng } from './kit.js';
import { shrine } from './stone.js';

/** bali_water: { rects: [[x0, z0, x1, z1, y]] } — still water on flooded paddies. */
export function water(el, ctx) {
  const out = [];
  for (const [x0, z0, x1, z1, y] of el.rects) { const a = [x0, y, z0], b = [x1, y, z0], c = [x1, y, z1], d = [x0, y, z1]; out.push(...a, ...d, ...c, ...a, ...c, ...b); }
  if (out.length) ctx.bag.add('water', fromTriangles(out));
}
/** bali_channel: { pts: [[x, z], ...] axis-aligned legs, y, w } — a stone-lined channel at ground level: brick lips both sides, the water between. */
export function channel(el, ctx) {
  const w = el.w ?? 0.55, y = el.y ?? 0, lip = el.lip ?? 0.2;
  for (let i = 0; i < el.pts.length - 1; i++) {
    const [ax, az] = el.pts[i], [bx_, bz] = el.pts[i + 1];
    const x0 = Math.min(ax, bx_), x1 = Math.max(ax, bx_), z0 = Math.min(az, bz), z1 = Math.max(az, bz), alongX = (x1 - x0) >= (z1 - z0);
    const gx = alongX ? 0 : w / 2 + 0.12, gz = alongX ? w / 2 + 0.12 : 0;
    if (alongX) { bx(ctx, 'brick', x0, y - 0.05, z0 - gz, x1, y + lip, z0 - w / 2); bx(ctx, 'brick', x0, y - 0.05, z0 + w / 2, x1, y + lip, z0 + gz); bx(ctx, 'water', x0, y - 0.04, z0 - w / 2, x1, y + lip - 0.06, z0 + w / 2); }
    else { bx(ctx, 'brick', x0 - gx, y - 0.05, z0, x0 - w / 2, y + lip, z1); bx(ctx, 'brick', x0 + w / 2, y - 0.05, z0, x0 + gx, y + lip, z1); bx(ctx, 'water', x0 - w / 2, y - 0.04, z0, x0 + w / 2, y + lip - 0.06, z1); }
  }
}
/** bali_planks: footbridges over the channel: { at: [x, z], axis, len, y } — a pair of split palm logs. */
export function footbridge(el, ctx) {
  const [x, z] = el.at, L = el.len ?? 1.6, y = el.y ?? 0;
  if (el.axis === 'x') { bx(ctx, 'timber', x - L / 2, y + 0.18, z - 0.4, x + L / 2, y + 0.26, z + 0.4); ctx.col.floor([x - L / 2, z - 0.4, x + L / 2, z + 0.4], y + 0.26); }
  else { bx(ctx, 'timber', x - 0.4, y + 0.18, z - L / 2, x + 0.4, y + 0.26, z + L / 2); ctx.col.floor([x - 0.4, z - L / 2, x + 0.4, z + L / 2], y + 0.26); }
}
/** bali_subak_shrine: { at: [x, z], y } — the unwalled shrine of the water temple, its stone seat and a tray of offerings, a shade tree's trunk close by is planted by the ground. */
export function subakShrine(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0;
  bx(ctx, 'andesite', x - 1.2, y - 1.2, z - 1.2, x + 1.2, y + 0.3, z + 1.2, true);
  shrine({ c: [x, z], y: y + 0.3, kind: 'small' }, ctx);
  for (let k = 0; k < 3; k++) canang(ctx, x - 0.8 + k * 0.8, y + 0.3, z + 0.9, k);
}
/** bali_penjor: { at: [x, z], dir: [dx, dz], h, y } — the tall curved bamboo pole with its hanging leaves, the little shrine and lamak at its foot. */
export function penjor(el, ctx) {
  const [x, z] = el.at, [dx, dz] = el.dir ?? [0, 1], h = el.h ?? 7.5, y = el.y ?? 0, rand = rng(Math.round(x * 31 + z * 17));
  curvedPole(ctx, 'bamboo_culm', [x, y, z], [x + dx * 0.5, y + h * 1.12, z + dz * 0.5], [x + dx * 3.0, y + h * 0.86, z + dz * 3.0], 0.06, 8);
  const tip = [x + dx * 3.0, y + h * 0.86, z + dz * 3.0];
  // the hanging janur: strips of pale-yellow palm leaf, a spiral and fruit offerings
  for (let k = 0; k < 6; k++) { const t = k / 6, px = x + dx * (1.4 + 1.6 * t), pz = z + dz * (1.4 + 1.6 * t), py = y + h * (0.97 - 0.12 * t), len = 2.2 + rand() * 1.6; ctx.bag.add('paint_ochre', box(px - 0.04, py - len, pz - 0.04, px + 0.04, py, pz + 0.04)); }
  ctx.bag.add('paint_ochre', box(tip[0] - 0.12, tip[1] - 3.4, tip[2] - 0.12, tip[0] + 0.12, tip[1] - 0.1, tip[2] + 0.12));
  ctx.bag.add('cloth_red', box(tip[0] - 0.2, tip[1] - 1.2, tip[2] - 0.2, tip[0] + 0.2, tip[1] - 0.7, tip[2] + 0.2));
  bx(ctx, 'bamboo_culm', x - 0.35, y, z - 0.35, x + 0.35, y + 0.08, z + 0.35);
  for (const [a, b] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) bx(ctx, 'bamboo_culm', x + a - 0.02, y, z + b - 0.02, x + a + 0.02, y + 1.0, z + b + 0.02);
  bx(ctx, 'thatch_palm', x - 0.4, y + 1.0, z - 0.4, x + 0.4, y + 1.1, z + 0.4);
  ctx.bag.add('cloth_ochre', box(x + dx * 0.4 - 0.25 * Math.abs(dz) - 0.02, y + 0.15, z + dz * 0.4 - 0.25 * Math.abs(dx) - 0.02, x + dx * 0.4 + 0.25 * Math.abs(dz) + 0.02, y + 1.0, z + dz * 0.4 + 0.25 * Math.abs(dx) + 0.02));
  ctx.col.circle(x, z, 0.12, y, y + 3);
}
/** bali_offerings: { list: [[x, y, z]] } — canang sari on the ground, steps and shrine ledges. */
export function offerings(el, ctx) { el.list.forEach(([x, y, z], i) => canang(ctx, x, y, z, i)); }
/** bali_banyan_seat: { c, y, r } — the ring seat of brick round the banyan's roots, with a small shrine and the poleng wrapping. */
export function banyanSeat(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, r = el.r ?? 2.6;
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2, b = (k + 0.9) / 16 * Math.PI * 2, x0 = cx + Math.cos(a) * r, z0 = cz + Math.sin(a) * r, x1 = cx + Math.cos(b) * r, z1 = cz + Math.sin(b) * r;
    bx(ctx, 'brick', Math.min(x0, x1) - 0.12, y, Math.min(z0, z1) - 0.12, Math.max(x0, x1) + 0.12, y + 0.5, Math.max(z0, z1) + 0.12, true);
  }
  shrine({ c: [cx + r + 1.4, cz], y, kind: 'small' }, ctx);
}
