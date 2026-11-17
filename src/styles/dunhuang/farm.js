// A threshing floor of the oasis (docs/settlements/dunhuang.md §13): a round of beaten earth at the field's edge with a
// stone roller on a pivot pole, piles of wheat and straw, wooden forks, a winnowing tray and a basket; the ox, the
// farmers and the sacks are the town's life list.
import { box, lathe, rod } from '../../core/geom.js';
import { rng } from '../../settlements/dunhuang/layout.js';

/** dh_threshing { at: [x, z], r, seed }. */
function threshing(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, R = el.r ?? 6, r = rng(el.seed || 4);
  bag.add('banco_smooth', lathe([[0.001, 0], [R, 0], [R, 0.03], [0.001, 0.03]], 28, (th) => 1 + 0.03 * Math.sin(th * 3 + 1)).translate(x, 0, z));     // the floor, slightly out of round
  // the pivot pole, an arm and the stone roller (axis radial, 1.2 m long, 0.84 m across), standing on the floor at 2.6 m from the pole
  bag.add('timber', rod([x, 0, z], [x, 1.25, z], 0.09, 6));
  bag.add('timber', box(x - 0.14, 1.18, z - 0.14, x + 2.15, 1.3, z + 0.14));
  bag.add('granite_grey', lathe([[0.001, 0], [0.42, 0], [0.43, 0.04], [0.42, 1.2], [0.001, 1.2]], 14, (th) => 1 + 0.015 * Math.cos(th * 7)).rotateZ(-Math.PI / 2).translate(x + 3.2, 0.43, z));
  for (const s of [-1, 1]) bag.add('timber', rod([x + 2.15, 1.24, z + s * 0.04], [x + 2.15, 0.43, z + s * 0.48], 0.045, 5));
  bag.add('iron', box(x + 2.0, 0.38, z - 0.05, x + 2.12, 0.48, z + 0.05));
  col.circle(x, z, 0.14, 0, 1.3); col.rect([x + 2.0, z - 0.43, x + 3.2, z + 0.43], 0, 0.86);
  // piles of wheat and straw at the floor's edge, a heap of chaff, two forks leaning on a pile, a winnowing tray, a basket
  for (let k = 0; k < 5; k++) {
    const a = 2.3 + k * 1.05 + 0.2 * r(), d = R - 1.2 - r() * 0.6, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, s = 0.75 + 0.5 * r();
    bag.add(k % 2 ? 'thatch' : 'sacking', lathe([[0.001, 0], [1.0 * s, 0], [0.9 * s, 0.35 * s], [0.55 * s, 0.7 * s], [0.001, 0.95 * s]], 10, null, px, 0, pz));
    col.circle(px, pz, 0.9 * s, 0, 0.8 * s);
  }
  for (const [dx, dz, ry] of [[-1.5, -2.9, 0.3], [-1.2, -3.1, -0.2]]) {
    const px = x + dx, pz = z + dz;
    bag.add('timber', rod([px, 0.0, pz], [px + Math.sin(ry) * 0.4, 1.9, pz - 0.5], 0.025, 5));
    for (const t of [-0.07, 0, 0.07]) bag.add('timber', rod([px + Math.sin(ry) * 0.4 + t, 1.9, pz - 0.5], [px + Math.sin(ry) * 0.4 + t, 2.25, pz - 0.55], 0.012, 4));
  }
  bag.add('wicker', lathe([[0.001, 0], [0.3, 0], [0.36, 0.05], [0.4, 0.12], [0.36, 0.14], [0.001, 0.14]], 12, null, x - 2.4, 0.03, z + 2.0));
  bag.add('thatch', lathe([[0.001, 0], [0.26, 0], [0.22, 0.08], [0.001, 0.1]], 10, null, x - 2.4, 0.15, z + 2.0));
  // the beaten earth's rim: a ring of stones and straw
  for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2 + 0.1, d = R + 0.1; bag.add('rubble', box(x + Math.cos(a) * d - 0.12, 0, z + Math.sin(a) * d - 0.1, x + Math.cos(a) * d + 0.12, 0.08 + 0.05 * r(), z + Math.sin(a) * d + 0.1)); }
}
export const FARM_ELEMENTS = { dh_threshing: threshing };
