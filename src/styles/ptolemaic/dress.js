// The small things of Alexandria's streets, shops and rooms (docs/settlements/alexandria.md §12): amphorae of the great trading
// kinds, pithoi, baskets, sacks, crates, benches, firewood, reed bundles, net racks, rope coils, awnings, lamp brackets, laundry —
// built into the bag of the element that stands them (low-segment turnings, merged with the rest), never as separate objects.
// Registered nowhere: helpers for house.js, shops.js, quay.js and the other ptolemaic elements.

import { box, lathe, rod } from '../../core/geom.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const pick = (rand, a) => a[Math.floor(rand() * a.length)];

/** The trading amphora (a Rhodian or Knidian jar: long neck, two handles, a pointed foot), standing at its foot or leaning. */
export function amphora(bag, x, y, z, { s = 1, mat = 'terracotta', tilt = 0, rot = 0, seg = 8 } = {}) {
  const g = lathe([[0.001, 0], [0.025 * s, 0.03 * s], [0.07 * s, 0.18 * s], [0.17 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.12 * s, 0.84 * s], [0.06 * s, 0.98 * s], [0.058 * s, 1.1 * s], [0.085 * s, 1.14 * s], [0.07 * s, 1.15 * s], [0.04 * s, 1.1 * s], [0.001, 1.08 * s]], seg);
  if (tilt) { g.rotateX(tilt); g.rotateY(rot); }
  bag.add(mat, g.translate(x, y, z));
  const h = box(-0.2 * s, 0.98 * s, -0.012, 0.2 * s, 1.08 * s, 0.012); if (tilt) { h.rotateX(tilt); h.rotateY(rot); } else h.rotateY(rot);
  bag.add(mat, h.translate(x, y, z));
}
/** A pithos (the big storage jar), its lid of a flat stone. */
export function pithos(bag, col, x, y, z, s = 1, mat = 'terracotta') {
  bag.add(mat, lathe([[0.001, 0], [0.2 * s, 0], [0.32 * s, 0.22 * s], [0.4 * s, 0.55 * s], [0.36 * s, 0.85 * s], [0.26 * s, 1.0 * s], [0.28 * s, 1.06 * s], [0.001, 1.06 * s]], 10, null, x, y, z));
  bag.add('limestone', lathe([[0.001, 0], [0.3 * s, 0], [0.3 * s, 0.05 * s], [0.001, 0.05 * s]], 8, null, x, y + 1.06 * s, z));
  col?.circle(x, z, 0.4 * s, y, y + 1.1 * s);
}
export function basket(bag, x, y, z, r = 0.3, h = 0.35, fill = null) {
  bag.add('wicker', lathe([[r * 0.7, 0], [r, h * 0.7], [r * 0.95, h], [r * 0.85, h], [r * 0.6, 0.03], [0.001, 0.03]], 8, null, x, y, z));
  if (fill) bag.add(fill, lathe([[0.001, h * 0.82], [r * 0.9, h * 0.8], [r * 0.5, h * 1.25], [0.001, h * 1.3]], 8, null, x, y, z));
}
export function sack(bag, x, y, z, rot = 0, mat = 'sacking') {
  const g = lathe([[0.001, 0], [0.2, 0.01], [0.23, 0.2], [0.17, 0.42], [0.1, 0.5], [0.05, 0.54], [0.001, 0.52]], 7);
  bag.add(mat, g.scale(1, 1, 0.7).rotateY(rot).translate(x, y, z));
}
export function crate(bag, col, x, y, z, w = 0.7, h = 0.45, d = 0.5, mat = 'timber') {
  bag.add(mat, box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2)); bag.add('wood_dark', box(x - w / 2 - 0.01, y + h * 0.4, z - d / 2 - 0.01, x + w / 2 + 0.01, y + h * 0.5, z + d / 2 + 0.01));
  col?.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + h);
}
/** A stone or timber bench along x0…x1 at z0…z1 (its long axis the longer side), seat 0.45 m. */
export function bench(bag, col, [x0, z0, x1, z1], y, mat = 'limestone') {
  const alongX = x1 - x0 > z1 - z0;
  bag.add(mat, box(x0, y + 0.38, z0, x1, y + 0.46, z1));
  if (alongX) for (const x of [x0 + 0.1, x1 - 0.4]) bag.add(mat, box(x, y, z0 + 0.04, x + 0.3, y + 0.38, z1 - 0.04));
  else for (const z of [z0 + 0.1, z1 - 0.4]) bag.add(mat, box(x0 + 0.04, y, z, x1 - 0.04, y + 0.38, z + 0.3));
  col?.rect([x0, z0, x1, z1], y, y + 0.46);
}
export function firewood(bag, col, x, y, z, len = 1.2, rot = 0, rows = 3) {
  for (let r = 0; r < rows; r++) for (let k = 0; k < 6 - r; k++) {
    const g = lathe([[0.05, 0], [0.05, len], [0.001, len]], 5); g.rotateZ(Math.PI / 2).translate(-len / 2, 0.05, 0);
    bag.add(r % 2 ? 'wood_dark' : 'timber', g.translate(0, y + 0.06 + r * 0.09, (k - (5 - r) / 2) * 0.1).rotateY(rot).translate(x, 0, z));
  }
  col?.circle(x, z, len * 0.5, y, y + 0.35);
}
export function reedBundle(bag, x, y, z, h = 1.6, lean = 0.12) {
  const g = lathe([[0.1, 0], [0.09, h * 0.9], [0.02, h]], 6); g.rotateZ(lean);
  bag.add('reed_mat', g.translate(x, y, z));
}
/** A coil of rope on the ground. */
export function ropeCoil(bag, x, y, z, r = 0.3) {
  bag.add('rope_fibre', lathe([[r * 0.35, 0], [r, 0], [r, 0.14], [r * 0.35, 0.14]], 9, null, x, y, z));
}
/** A cloth awning over a front: rect [x0, z0, x1, z1] its plan; `wall` the side of the rect on the wall ('x0' | 'x1' | 'z0' | 'z1'); yWall the height at the wall, yOut the height at the outer edge; poles at the outer corners. */
export function awning(bag, [x0, z0, x1, z1], wall, yWall, yOut, mat, col = null) {
  const alongX = wall === 'z0' || wall === 'z1', g = box(x0, 0, z0, x1, 0.03, z1), pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const a = alongX ? pos.getZ(i) : pos.getX(i), lo = alongX ? z0 : x0, hi = alongX ? z1 : x1;
    const t = (wall === 'z0' || wall === 'x0') ? (a - lo) / (hi - lo) : (hi - a) / (hi - lo);
    pos.setY(i, pos.getY(i) + yWall + (yOut - yWall) * t);
  }
  bag.add(mat, g);
  const ox = wall === 'x0' ? x1 - 0.08 : wall === 'x1' ? x0 + 0.08 : null, oz = wall === 'z0' ? z1 - 0.08 : wall === 'z1' ? z0 + 0.08 : null;
  const pts = alongX ? [[x0 + 0.1, oz], [x1 - 0.1, oz]] : [[ox, z0 + 0.1], [ox, z1 - 0.1]];
  for (const [px, pz] of pts) { bag.add('timber', box(px - 0.04, 0, pz - 0.04, px + 0.04, yOut, pz + 0.04)); col?.circle(px, pz, 0.06, 0, yOut); }
}
/** A bracket of wrought iron on a wall with a hanging oil lamp: at (x, z) on a wall facing (nx, nz), y the lamp's height. */
export function lampBracket(bag, x, y, z, nx, nz) {
  bag.add('iron', rod([x, y, z], [x + nx * 0.4, y + 0.1, z + nz * 0.4], 0.018, 4));
  bag.add('bronze', lathe([[0.001, 0], [0.06, 0.02], [0.07, 0.1], [0.04, 0.14], [0.001, 0.14]], 6, null, x + nx * 0.4, y - 0.1, z + nz * 0.4));
  bag.add('flame', lathe([[0.001, 0], [0.02, 0.01], [0.001, 0.07]], 5, null, x + nx * 0.4, y - 0.06, z + nz * 0.4));
}
/** A line of washing from (x0, z0) to (x1, z1) at height y: linen sheets hanging along it. */
export function washLine(bag, [x0, z0], [x1, z1], y, rand, drop = 0.9) {
  bag.add('rope_fibre', rod([x0, y, z0], [x1, y, z1], 0.012, 3));
  const L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L;
  for (let t = 0.4; t < L - 0.8; t += 0.7 + rand() * 0.6) {
    const w = 0.5 + rand() * 0.4, d = drop * (0.6 + rand() * 0.5), m = pick(rand, ['linen', 'cloth_white', 'cloth_ochre', 'linen', 'cloth_red', 'cloth_indigo']);
    const px = x0 + ux * t, pz = z0 + uz * t;
    bag.add(m, box(Math.min(px, px + ux * w) - 0.01, y - d, Math.min(pz, pz + uz * w) - 0.01, Math.max(px, px + ux * w) + 0.01, y - 0.02, Math.max(pz, pz + uz * w) + 0.01));
  }
}
/** A clay oven (the tannur or the baker's dome): a dome on a base, the mouth, ash; at (x, z). */
export function oven(bag, col, x, y, z, r = 0.6, yaw = 0) {
  bag.add('mud_plaster', lathe([[r, 0], [r, 0.4], [r * 0.9, 0.7], [r * 0.6, 0.95], [r * 0.25, 1.1], [0.001, 1.12]], 10, null, x, y, z));
  const m = box(-0.2, 0.15, r - 0.12, 0.2, 0.55, r + 0.02); m.rotateY(yaw); bag.add('opening', m.translate(x, y, z));
  col?.circle(x, z, r, y, y + 1.1);
}
/** A hand mill (the quern): a saddle stone on a bench, a rider on it. */
export function quern(bag, col, x, y, z, rot = 0) {
  bag.add('granite_grey', box(-0.35, y + 0.4, -0.2, 0.35, y + 0.52, 0.2).rotateY(rot).translate(x, 0, z));
  bag.add('timber', box(-0.3, y, -0.15, 0.3, y + 0.4, 0.15).rotateY(rot).translate(x, 0, z));
  bag.add('granite_black', box(-0.12, y + 0.52, -0.14, 0.12, y + 0.6, 0.14).rotateY(rot).translate(x, 0, z));
  col?.circle(x, z, 0.4, y, y + 0.6);
}
/** A date palm of the courts and the shore: the ringed trunk, the crown of arching fronds, the hanging dates. */
export function palm(bag, col, x, y, z, h = 6, seed = 1) {
  const rand = rng(seed);
  bag.add('palm_trunk', lathe([[0.3, 0], [0.22, h * 0.15], [0.19, h * 0.6], [0.2, h], [0.001, h + 0.1]], 8, null, x, y, z));
  for (let k = 0; k < 9; k++) {
    const a = k / 9 * Math.PI * 2 + rand() * 0.4, L = 2.4 + rand() * 0.8, dx = Math.cos(a), dz = Math.sin(a);
    const p0 = [x, y + h, z], p1 = [x + dx * L * 0.55, y + h + 0.9, z + dz * L * 0.55], p2 = [x + dx * L, y + h + 0.1 - rand() * 0.5, z + dz * L];
    bag.add('palm_leaf', rod(p0, p1, 0.07, 4)); bag.add('palm_leaf', rod(p1, p2, 0.05, 4));
    bag.add('palm_leaf', box(Math.min(p1[0], p2[0]) - 0.35 * Math.abs(dz), Math.min(p1[1], p2[1]) - 0.03, Math.min(p1[2], p2[2]) - 0.35 * Math.abs(dx), Math.max(p1[0], p2[0]) + 0.35 * Math.abs(dz), Math.max(p1[1], p2[1]) + 0.03, Math.max(p1[2], p2[2]) + 0.35 * Math.abs(dx)));
  }
  col?.circle(x, z, 0.25, y, y + h);
}
/** A fig or a pomegranate tree: a short bole and a round crown of leaf. */
export function fig(bag, col, x, y, z, h = 3.2, seed = 1) {
  const rand = rng(seed);
  bag.add('bark_dark', lathe([[0.2, 0], [0.12, h * 0.4], [0.1, h * 0.7], [0.001, h * 0.75]], 6, null, x, y, z));
  for (let k = 0; k < 4; k++) {
    const a = k * 1.6 + rand(), r = 0.9 + rand() * 0.5;
    bag.add('lotus_leaf', lathe([[0.001, -0.4], [r, -0.1], [r * 1.05, 0.25], [r * 0.6, 0.6], [0.001, 0.7]], 7, null, x + Math.cos(a) * 0.6, y + h + 0.2 * k * 0.3, z + Math.sin(a) * 0.6));
  }
  col?.circle(x, z, 0.15, y, y + h);
}
