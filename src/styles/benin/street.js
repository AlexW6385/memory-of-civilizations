// Street furniture of Benin (docs/settlements/benin-city.md §10): the tall lamps of the great street, the clay seats and the drums of
// the king's square, the shrine posts at the crossing, the heaps of firewood and the pots at the lane mouths.
import { box, lathe, rod, rng, frustum, gable, lean } from './kit.js';
import { pots, wood, claySeat, stool, pot } from './props.js';

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
    claySeat(ctx, [x - 2.2, z0 + 4.4, x + 2.2, z0 + 5.1], 0, k);
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
/**
 * benin_shelter: { rect, kind ('gable' | 'lean'), seed } — a waiting shed of palm thatch on posts of palm trunk over a floor of beaten clay, where the
 * petitioners, the sellers and the idle sit out the sun and the rain [inferred: the accounts say nothing of them, but a square for audiences is
 * a place of waiting]. 'gable': open on all sides with a ridge along x (4–6 m deep); 'lean': set against the palace wall, its low edge on the
 * south. Clay seats at the back, reed mats on the floor, a water jar and a calabash or two.
 */
function shelter(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ?? 1), L = x1 - x0, kind = el.kind ?? 'gable', Y = 0.1, H = kind === 'lean' ? 2.45 : 2.5;
  bag.add('tuff_red', box(x0, 0, z0, x1, Y, z1)); col.floor(el.rect, Y);
  const n = Math.max(2, Math.round(L / 2.7)), rows = kind === 'lean' ? [z1 - 0.15] : [z0 + 0.15, z1 - 0.15];
  for (const pz of rows) for (let i = 0; i <= n; i++) {
    const px = x0 + 0.15 + i * (L - 0.3) / n;
    bag.add('palm_trunk', lathe([[0.13, 0], [0.1, H * 0.5], [0.09, H]], 6, null, px, Y, pz)); col.circle(px, pz, 0.14, Y, Y + H);
  }
  if (kind === 'lean') {
    bag.add('wood_dark', box(x0, Y + H - 0.12, z1 - 0.25, x1, Y + H + 0.06, z1 - 0.05));
    lean(ctx, [x0, z0, x1, z1], 'zp', Y + H, Y + H + 1.05, 'thatch_palm', 0.3, false);
  } else {
    for (const pz of rows) bag.add('wood_dark', box(x0, Y + H - 0.12, pz - 0.1, x1, Y + H + 0.06, pz + 0.1));
    gable(ctx, el.rect, Y + H + 0.06, 1.9, 'thatch_palm', 'x', 0.55);
    bag.add('timber', rod([x0 - 0.5, Y + H + 1.95, (z0 + z1) / 2], [x1 + 0.5, Y + H + 1.95, (z0 + z1) / 2], 0.09, 6));
  }
  if (el.simple) return;
  // the seats along the back, mats on the floor, jars and a drum of palm wine at the end
  const back = kind === 'lean' ? [x0 + 0.3, z0 + 0.35, x1 - 0.3, z0 + 0.85] : [x0 + 0.4, z0 + 0.5, x1 - 0.4, z0 + 1.0];
  const gap = Math.min(4.2, L - 1);
  claySeat(ctx, [back[0], back[1], back[0] + gap, back[3]], Y, 3); if (L > 6.5) claySeat(ctx, [back[2] - gap, back[1], back[2], back[3]], Y, 6);
  for (let u = x0 + 0.7; u + 1.7 < x1 - 0.4; u += 2.2) bag.add('reed_mat', box(u, Y, z0 + 1.5 + (kind === 'lean' ? 0 : 0.5), u + 1.7, Y + 0.02, z0 + 2.8 + (kind === 'lean' ? 0 : 0.8)));
  pots(ctx, x1 - 0.8, Y, z1 - 0.9, Math.round(x0 * 7 + z0), 2);
  const [cx, cz] = [x0 + L * 0.5, (z0 + z1) / 2];
  void cx; void cz; void pot; void rand;
}
/** benin_mouth: { at, along, seed } — a lane's mouth on a street: a pile of firewood, a cluster of big pots, a clay seat. */
function mouth(el, ctx) {
  const [x, z] = el.at, a = el.along ?? [1, 0];
  if (el.simple) return;
  wood(ctx, x + a[0] * 2.0, 0, z + a[1] * 2.0, a, 1.5, el.seed ?? 3);
  pots(ctx, x - a[0] * 2.2, 0, z - a[1] * 2.2, (el.seed ?? 3) + 1, 3);
}
export const STREET_EL = { benin_lamp: lamp, benin_square: square, benin_mouth: mouth, benin_shelter: shelter };
