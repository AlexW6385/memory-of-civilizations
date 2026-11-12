// The furniture of Qufu's streets and courts (docs/settlements/lu-qufu.md §9): the hawkers' stalls under their umbrellas, the wells at the lane
// crossings, hitching posts with a donkey's trough, benches, stone lamps and tree guards (the low stone kerb round an old tree), a handcart.
// Elements: lu_stall, lu_well, lu_hitch, lu_lamp, lu_treeguard, lu_handcart. All in world coordinates ({ at, rot, ... }); rot turns the
// element's +z (its front) about y.
import { box, lathe, rod } from '../../core/geom.js';
import { rng } from './kit.js';
import { jar, stoneBench, lantern, firewood } from './house.js';

function frame(ctx, at, rot) {
  const { bag, col } = ctx, c = Math.cos(rot), s = Math.sin(rot);
  const P = (u, w) => [at[0] + u * c + w * s, at[1] - u * s + w * c];      // u across (x), w in front (z)
  const B = (mat, u0, y0, w0, u1, y1, w1, solid = false) => {
    const a = P(u0, w0), b = P(u1, w1);
    if (!(y1 - y0 > 1e-4) || Math.abs(u1 - u0) < 1e-4 || Math.abs(w1 - w0) < 1e-4) return;
    if (Math.abs(s) < 1e-6 || Math.abs(c) < 1e-6) {
      const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
      bag.add(mat, box(x0, y0, z0, x1, y1, z1)); if (solid) col.rect([x0, z0, x1, z1], y0, y1);
    } else {                                                                    // turned: a box on its centre, rotated by the element's yaw
      const g = box((u0 - (u0 + u1) / 2), y0, (w0 - (w0 + w1) / 2), (u1 - (u0 + u1) / 2), y1, (w1 - (w0 + w1) / 2)); g.rotateY(rot);
      const m = P((u0 + u1) / 2, (w0 + w1) / 2); g.translate(m[0], 0, m[1]); bag.add(mat, g);
      if (solid) col.circle(m[0], m[1], Math.min(Math.abs(u1 - u0), Math.abs(w1 - w0)) / 2, y0, y1);
    }
  };
  const L = (mat, prof, seg, u, y, w) => { const p = P(u, w); bag.add(mat, lathe(prof, seg, null, p[0], y, p[1])); };
  return { P, B, L, bag, col, T: null };
}
const quant = (r) => Math.round(r / (Math.PI / 2)) * (Math.PI / 2);

const UMB = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
export function stall(el, ctx) {
  const rand = rng(el.seed ?? 3), rot = quant(el.rot ?? 0), F = frame(ctx, el.at, rot), kind = el.kind ?? 'fruit', mat = UMB[Math.floor(rand() * UMB.length)];
  // the trestle table and its cloth, the pole and the umbrella
  F.B('wood_dark', -0.9, 0, -0.4, 0.9, 0.78, 0.4, true); F.B('cloth_white', -0.95, 0.78, -0.45, 0.95, 0.8, 0.45);
  F.B('timber', -0.04, 0.0, -0.6, 0.04, 2.6, -0.52);
  F.L(mat, [[0.001, 2.9], [0.4, 2.8], [1.2, 2.45], [1.35, 2.38], [1.2, 2.4], [0.001, 2.7]], 12, 0, 0, -0.56);
  const goods = {
    fruit: () => { for (let k = 0; k < 9; k++) F.L(k % 3 ? 'cloth_ochre' : 'cloth_red', [[0.001, 0], [0.07, 0.03], [0.09, 0.09], [0.05, 0.16], [0.001, 0.17]], 7, -0.7 + (k % 5) * 0.34, 0.8, -0.2 + Math.floor(k / 5) * 0.4); },
    buns: () => { for (let k = 0; k < 3; k++) { F.L('wicker', [[0.3, 0], [0.32, 0.18], [0.001, 0.18]], 10, -0.6 + k * 0.6, 0.8, 0); F.L('cloth_white', [[0.28, 0.18], [0.001, 0.3]], 10, -0.6 + k * 0.6, 0.8, 0); } },
    noodle: () => { F.B('brick_grey', -0.8, 0, 0.5, -0.2, 0.7, 1.0, true); F.L('iron', [[0.001, 0], [0.3, 0.04], [0.34, 0.2], [0.001, 0.22]], 10, -0.5, 0.7, 0.75); F.B('wood_dark', 0.2, 0, 0.6, 0.6, 0.45, 0.95, true); F.L('glaze_white', [[0.001, 0.8], [0.1, 0.84], [0.12, 0.92], [0.001, 0.92]], 8, 0.4, 0, 0.0); },
    cloth: () => { for (let k = 0; k < 5; k++) F.B(['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_blue'][k], -0.8 + k * 0.33, 0.8, -0.3, -0.52 + k * 0.33, 0.8 + 0.18 + 0.04 * k, 0.3); },
    books: () => { for (let k = 0; k < 10; k++) F.B(k % 3 ? 'cloth_indigo' : 'cloth_white', -0.8 + k * 0.16, 0.8, -0.3, -0.67 + k * 0.16, 0.8 + 0.1 + 0.03 * (k % 3), 0.3); },
    pots: () => { for (let k = 0; k < 6; k++) jar({ L: (m, p, s, x, y, z) => F.L(m, p, s, -0.7 + (k % 3) * 0.7, 0.8 + (y || 0), -0.2 + Math.floor(k / 3) * 0.5), B: F.B }, 0, 0, 0, 0.45, k % 2 ? 'glaze_green' : 'pottery_dark'); },
  };
  (goods[kind] ?? goods.fruit)();
  F.B('wood_dark', 0.6, 0, 0.7, 1.0, 0.4, 1.1, true);                      // the stool of the seller
}
export function well(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at;
  bag.add('granite_grey', lathe([[0.7, 0], [0.7, 0.55], [0.42, 0.58], [0.42, 0.5], [0.001, 0.5]], 14, null, x, 0, z));
  col.circle(x, z, 0.72, 0, 0.58);
  bag.add('granite_black', lathe([[0.4, 0.5], [0.4, 0.52], [0.001, 0.5]], 12, null, x, 0, z));
  for (const s of [-1, 1]) bag.add('timber', box(x + s * 0.55 - 0.05, 0.55, z - 0.05, x + s * 0.55 + 0.05, 1.8, z + 0.05));
  bag.add('timber', box(x - 0.62, 1.75, z - 0.05, x + 0.62, 1.85, z + 0.05));
  bag.add('rope_fibre', rod([x, 1.78, z], [x, 0.9, z], 0.012, 4));
  bag.add('wicker', lathe([[0.1, 0.8], [0.12, 0.95], [0.001, 0.95]], 8, null, x, 0, z));
  // the trough and a pair of buckets beside it, the wet stones round
  bag.add('granite_grey', box(x + 0.9, 0, z - 0.3, x + 1.7, 0.4, z + 0.3)); col.rect([x + 0.9, z - 0.3, x + 1.7, z + 0.3], 0, 0.4);
  bag.add('plaster_damp', box(x - 1.0, 0.0, z - 1.0, x + 1.0, 0.02, z + 1.0));
}
export function hitch(el, ctx) {
  const rot = quant(el.rot ?? 0), F = frame(ctx, el.at, rot);
  for (const u of [-1.0, 1.0]) F.B('timber', u - 0.07, 0, -0.07, u + 0.07, 1.3, 0.07, true);
  F.B('timber', -1.05, 1.0, -0.04, 1.05, 1.1, 0.04);
  F.B('granite_grey', -0.7, 0, 0.5, 0.7, 0.42, 1.0, true);
  F.B('plaster_damp', -0.6, 0.38, 0.55, 0.6, 0.42, 0.95);
  for (let k = 0; k < 3; k++) F.B('thatch', -0.5 + k * 0.4, 0.0, 1.2, -0.2 + k * 0.4, 0.02, 1.5);
}
export function lamp(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at;
  bag.add('granite_grey', lathe([[0.001, 0], [0.32, 0], [0.32, 0.3], [0.2, 0.34], [0.14, 0.5], [0.14, 2.2], [0.001, 2.2]], 8, null, x, 0, z));
  col.circle(x, z, 0.3, 0, 2.2);
  bag.add('granite_grey', box(x - 0.26, 2.2, z - 0.26, x + 0.26, 2.28, z + 0.26));
  bag.add('lamp_paper', box(x - 0.2, 2.28, z - 0.2, x + 0.2, 2.78, z + 0.2));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('granite_grey', box(x + dx * 0.2 - 0.02, 2.28, z + dz * 0.2 - 0.02, x + dx * 0.2 + 0.02, 2.78, z + dz * 0.2 + 0.02));
  bag.add('granite_grey', box(x - 0.3, 2.78, z - 0.3, x + 0.3, 2.86, z + 0.3)); bag.add('granite_grey', box(x - 0.18, 2.86, z - 0.18, x + 0.18, 3.0, z + 0.18));
}
/** The low stone kerb round a tree, square (w) with a stone bench on one side. */
export function treeGuard(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, w = el.w ?? 1.3;
  for (const [a, b, c, d] of [[x - w, z - w, x + w, z - w + 0.28], [x - w, z + w - 0.28, x + w, z + w], [x - w, z - w, x - w + 0.28, z + w], [x + w - 0.28, z - w, x + w, z + w]]) { bag.add('granite_grey', box(a, 0, b, c, 0.4, d)); col.rect([a, b, c, d], 0, 0.4); }
  bag.add('ground', box(x - w + 0.28, 0, z - w + 0.28, x + w - 0.28, 0.2, z + w - 0.28));
  if (el.bench) stoneBench({ B: (m, a, b, c, d, e, f, s) => { bag.add(m, box(a, b, c, d, e, f)); if (s) col.rect([a, c, d, f], b, e); }, L: () => {}, bag, col }, x, 0, z + w + 0.5, 1.8, 'x');
}
export function handcart(el, ctx) {
  const rot = quant(el.rot ?? 0), F = frame(ctx, el.at, rot), rand = rng(el.seed ?? 4);
  F.B('wood_ochre', -0.55, 0.45, -0.7, 0.55, 0.55, 0.7, true);
  for (const s of [-1, 1]) { F.B('wood_dark', s * 0.55 - 0.03, 0.55, -0.7, s * 0.55 + 0.03, 0.9, 0.7); F.L('wood_dark', [[0.5, -0.03], [0.5, 0.03], [0.001, 0.03]], 12, s * 0.62, 0, 0); }
  for (const s of [-1, 1]) F.B('wood_dark', s * 0.45 - 0.03, 0.5, 0.7, s * 0.45 + 0.03, 0.55, 1.9);
  for (let k = 0; k < 4; k++) F.L(rand() < 0.5 ? 'sacking' : 'wicker', [[0.001, 0.55], [0.25, 0.58], [0.3, 0.8], [0.001, 0.9]], 8, -0.3 + (k % 2) * 0.6, 0, -0.35 + Math.floor(k / 2) * 0.7);
}
export { lantern, firewood };
