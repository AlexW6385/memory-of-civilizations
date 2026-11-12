// Street furniture of Benin (docs/settlements/benin-city.md §10): the tall lamps of the great street, the clay seats and the drums of
// the king's square, the shrine posts at the crossing, the heaps of firewood and the pots at the lane mouths.
import { box, lathe, rod, rng, frustum } from './kit.js';
import { pots, wood, claySeat, stool } from './props.js';

/** benin_lamp: { at: [x, z], y, seed } — a post of timber on a clay foot, a bronze bowl of palm oil on top (street lamps of the great street, [inferred] from the accounts). */
function lamp(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0;
  bag.add('tuff_red', frustum([x - 0.45, z - 0.45, x + 0.45, z + 0.45], y, y + 0.6, 0.14, 0.14, 0.14, 0.14));
  bag.add('timber', lathe([[0.13, 0], [0.1, 3.0], [0.14, 3.1]], 7, null, x, y + 0.6, z));
  bag.add('bronze', lathe([[0.001, 0], [0.3, 0.05], [0.36, 0.2], [0.3, 0.22], [0.001, 0.14]], 9, null, x, y + 3.7, z));
  bag.add('iron', rod([x, y + 3.55, z], [x, y + 3.9, z], 0.03, 5));
  col.circle(x, z, 0.5, y, y + 4);
}
/** benin_square: { rect, seed } — the king's square: long seats of clay in rows, a log drum on its stand, big pots of palm wine, stools. */
function square(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ?? 1), cx = (x0 + x1) / 2;
  // two rows of long clay seats facing the middle, before the palace wall and the street
  for (let k = 0; k < 5; k++) {
    const x = x0 + 12 + k * (x1 - x0 - 24) / 4;
    claySeat(ctx, [x - 2.2, z0 + 3.2, x + 2.2, z0 + 3.9], 0, k);
    if (!el.simple) { for (let j = 0; j < 3; j++) stool(ctx, x - 1.4 + j * 1.4, 0, z0 + 2.4); }
  }
  for (let k = 0; k < 4; k++) { const x = x0 + 18 + k * (x1 - x0 - 36) / 3; claySeat(ctx, [x - 2.2, z1 - 4.0, x + 2.2, z1 - 3.3], 0, k + 7); }
  // the log drum of the palace between two forked posts, a staff of bells beside it
  const dx = cx + 12, dz = z0 + 12;
  for (const s of [-1, 1]) { bag.add('wood_dark', rod([dx + s * 1.3, 0, dz], [dx + s * 1.3, 1.1, dz], 0.1, 6)); col.circle(dx + s * 1.3, dz, 0.14, 0, 1.1); }
  bag.add('timber', rod([dx - 1.55, 1.2, dz], [dx + 1.55, 1.2, dz], 0.34, 9)); bag.add('wood_dark', box(dx - 1.2, 1.33, dz - 0.07, dx + 1.2, 1.56, dz + 0.07));
  col.rect([dx - 1.6, dz - 0.4, dx + 1.6, dz + 0.4], 0, 1.5);
  const bx = dx + 4, bz = dz;
  bag.add('timber', lathe([[0.08, 0], [0.07, 2.6]], 6, null, bx, 0, bz)); col.circle(bx, bz, 0.1, 0, 2.6);
  for (let i = 0; i < 3; i++) bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.2], [0.04, 0.28], [0.001, 0.3]], 7, null, bx + (i - 1) * 0.2, 2.0 - Math.abs(i - 1) * 0.15, bz));
  if (!el.simple) { pots(ctx, x0 + 8, 0, z1 - 6, 31, 4); pots(ctx, x1 - 8, 0, z1 - 6, 32, 4); wood(ctx, cx - 18, 0, z1 - 6, [1, 0], 1.6, 33); }
  void rand;
}
/** benin_mouth: { at, along, seed } — a lane's mouth on a street: a pile of firewood, a cluster of big pots, a clay seat. */
function mouth(el, ctx) {
  const [x, z] = el.at, a = el.along ?? [1, 0];
  if (el.simple) return;
  wood(ctx, x + a[0] * 2.0, 0, z + a[1] * 2.0, a, 1.5, el.seed ?? 3);
  pots(ctx, x - a[0] * 2.2, 0, z - a[1] * 2.2, (el.seed ?? 3) + 1, 3);
}
export const STREET_EL = { benin_lamp: lamp, benin_square: square, benin_mouth: mouth };
