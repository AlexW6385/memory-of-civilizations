// The courtyard houses of Qufu (docs/settlements/lu-qufu.md §6, §9): a house of the Shandong plain on its lot, facing south onto the lane
// below it. Along the lane runs the front range (the "inverted house", daozuo) in one unbroken front of grey brick under one grey-tile roof,
// broken only by the gate with its hood — or, on the busy lanes, opened as a shop with its counter and signboard; behind it the court, the
// main house to the north in three, five or seven bays with its partitions, its kang and its tables, the east and west houses (the kitchen
// with its stove, the store with its jars and sacks), the screen wall, the well or the millstone or the stone table, strings of corn and
// peppers under the eaves. At the lane the front is dressed at eye level and weathered: the damp band at the foot, the streaks under the eaves.
// Detail is by distance (lod 0 everything, 1 the facade's dressing, 2 the shell).
import { box, lathe, rod, frustum } from '../../core/geom.js';
import { mingHall, mingWall, withPal } from '../ming/index.js';
import { HOUSE } from '../qing/index.js';
import { rng } from './kit.js';

const Hall0 = withPal(mingHall), Wall = withPal(mingWall);
const W_ = 'wood_dark';

/** A thin helper bound to the build context: boxes (solid or not) and lathes. */
export function tools(ctx) {
  const { bag, col } = ctx;
  const B = (mat, x0, y0, z0, x1, y1, z1, solid = false) => {
    if (x1 - x0 < 1e-4 || z1 - z0 < 1e-4 || y1 - y0 < 1e-4) return;
    bag.add(mat, box(x0, y0, z0, x1, y1, z1));
    if (solid) col.rect([x0, z0, x1, z1], y0, y1);
  };
  const L = (mat, prof, seg, x, y, z) => bag.add(mat, lathe(prof, seg, null, x, y, z));
  return { B, L, bag, col };
}

// ── the small things (each a few primitives; the bag merges and instances them) ─────────────────
/** A great water jar (pottery) with its lid. */
export function jar(T, x, y, z, s = 1, mat = 'pottery_dark') {
  T.L(mat, [[0.001, 0], [0.22 * s, 0], [0.34 * s, 0.22 * s], [0.38 * s, 0.5 * s], [0.3 * s, 0.78 * s], [0.2 * s, 0.9 * s], [0.24 * s, 0.94 * s], [0.001, 0.94 * s]], 10, x, y, z);
  T.L('wicker', [[0.28 * s, 0.93 * s], [0.28 * s, 0.97 * s], [0.001, 1.0 * s]], 10, x, y, z);
}
/** A stack of firewood against a wall: rows of split logs seen end-on, w wide, rows high, the stack running along u (dir 'x' or 'z'). */
export function firewood(T, x, y, z, w, rows, dir, rand) {
  for (let r = 0; r < rows; r++) for (let i = 0; i < Math.floor(w / 0.15) - (r % 2); i++) {
    const o = 0.075 + i * 0.15 + (r % 2) * 0.075, a = dir === 'x' ? [x + o, y + 0.08 + r * 0.14, z] : [x, y + 0.08 + r * 0.14, z + o];
    const b = dir === 'x' ? [a[0], a[1], a[2] + 0.55 + rand() * 0.05] : [a[0] + 0.55 + rand() * 0.05, a[1], a[2]];
    T.bag.add(r % 3 === 2 ? 'bark_grey' : 'timber', rod(a, b, 0.062, 5));
  }
  T.col.rect(dir === 'x' ? [x, z, x + w, z + 0.6] : [x, z, x + 0.6, z + w], y, y + 0.1 + rows * 0.14);
}
/** A stone bench (two stone feet and a slab), its length along x or z. */
export function stoneBench(T, x, y, z, len, dir) {
  if (dir === 'x') { T.B('granite_grey', x - len / 2 + 0.1, y, z - 0.15, x - len / 2 + 0.3, y + 0.4, z + 0.15, true); T.B('granite_grey', x + len / 2 - 0.3, y, z - 0.15, x + len / 2 - 0.1, y + 0.4, z + 0.15, true); T.B('granite_grey', x - len / 2, y + 0.4, z - 0.2, x + len / 2, y + 0.47, z + 0.2, true); }
  else { T.B('granite_grey', x - 0.15, y, z - len / 2 + 0.1, x + 0.15, y + 0.4, z - len / 2 + 0.3, true); T.B('granite_grey', x - 0.15, y, z + len / 2 - 0.3, x + 0.15, y + 0.4, z + len / 2 - 0.1, true); T.B('granite_grey', x - 0.2, y + 0.4, z - len / 2, x + 0.2, y + 0.47, z + len / 2, true); }
}
/** The red paper lantern hung at a door: a drum with caps and a tassel. */
export function lantern(T, x, y, z, mat = 'lamp_paper') {
  T.L(mat, [[0.001, 0], [0.09, 0.02], [0.17, 0.12], [0.17, 0.22], [0.09, 0.32], [0.001, 0.34]], 10, x, y, z);
  T.L('lacquer_black', [[0.06, 0.32], [0.06, 0.36], [0.001, 0.36]], 6, x, y, z);
  T.L('cloth_red', [[0.012, 0], [0.012, -0.22]], 4, x, y, z);
}
/** A drum stone (men dun) and a pair for a gate. */
function drumStone(T, x, y, z) {
  T.B('granite_grey', x - 0.17, y, z - 0.22, x + 0.17, y + 0.4, z + 0.22, true);
  const g = lathe([[0.001, -0.09], [0.24, -0.09], [0.27, -0.05], [0.27, 0.05], [0.24, 0.09], [0.001, 0.09]], 12);
  g.rotateZ(Math.PI / 2); g.translate(x, y + 0.64, z); T.bag.add('granite_grey', g);
}
/** A hanging string of corn cobs or of red peppers (a drying braid) from y down h, at (x, z). */
export function hangingBraid(T, x, y, z, h, kind) {
  const m = kind === 'pepper' ? 'cloth_red' : kind === 'garlic' ? 'cloth_white' : 'cloth_ochre', r = kind === 'corn' ? 0.075 : 0.06;
  T.B('timber', x - 0.012, y - h, z - 0.012, x + 0.012, y, z + 0.012);
  for (let k = 0; k < Math.floor(h / (r * 1.6)); k++) {
    const yy = y - 0.1 - k * r * 1.6, s = k % 2 ? 1 : -1;
    T.B(m, x + s * r * 0.35 - r * 0.7, yy - r, z - r * 0.7, x + s * r * 0.35 + r * 0.7, yy + r * 0.2, z + r * 0.7);
  }
}
/** A bamboo pole between two brackets with cloths hung to dry. */
function laundry(T, x0, x1, y, z, rand) {
  const mats = ['cloth_white', 'cloth_indigo', 'cloth_blue', 'cloth_grey', 'cloth_ochre'];
  T.bag.add('bamboo_culm', rod([x0, y, z], [x1, y, z], 0.025, 5));
  for (const sx of [x0, x1]) T.B('timber', sx - 0.02, y - 0.06, z - 0.02, sx + 0.02, y + 0.02, z + 0.2);
  let u = x0 + 0.2;
  while (u < x1 - 0.5) { const w = 0.45 + rand() * 0.4, h = 0.6 + rand() * 0.5; T.B(mats[Math.floor(rand() * mats.length)], u, y - h, z - 0.015, u + w, y - 0.03, z + 0.015); u += w + 0.1 + rand() * 0.3; }
}
/** A hanging birdcage or a bunch of garlic, a rake or a broom leant at the wall: one small thing at the facade. */
function leant(T, x, y, z, kind, rand) {
  if (kind === 'ladder') {
    for (const dx of [-0.2, 0.2]) T.bag.add('bamboo_culm', rod([x + dx, y, z + 0.45], [x + dx, y + 2.6, z + 0.04], 0.03, 5));
    for (let k = 0; k < 8; k++) T.bag.add('bamboo_culm', rod([x - 0.2, y + 0.35 + k * 0.3, z + 0.4 - k * 0.04], [x + 0.2, y + 0.35 + k * 0.3, z + 0.4 - k * 0.04], 0.016, 4));
  } else if (kind === 'broom') {
    T.bag.add('bamboo_culm', rod([x, y, z + 0.3], [x, y + 1.5, z + 0.08], 0.018, 4));
    T.L('thatch', [[0.001, 0], [0.12, 0.02], [0.14, 0.3], [0.001, 0.4]], 6, x, y, z + 0.3);
  } else if (kind === 'sack') {
    for (let k = 0; k < 2 + Math.floor(rand() * 2); k++) T.L('sacking', [[0.001, 0], [0.26, 0.03], [0.3, 0.3], [0.22, 0.6], [0.13, 0.66], [0.001, 0.62]], 8, x + k * 0.5, y, z + 0.3);
  } else if (kind === 'basket') {
    T.L('wicker', [[0.001, 0], [0.3, 0.02], [0.4, 0.4], [0.001, 0.4]], 10, x, y + 0.5, z + 0.4);
    T.B('timber', x - 0.34, y, z + 0.06, x - 0.28, y + 0.5, z + 0.12); T.B('timber', x + 0.28, y, z + 0.06, x + 0.34, y + 0.5, z + 0.12);
  }
}

// ── the furniture of a room ──────────────────────────────────────────────────────────────────
/** A table: top, apron, four legs. */
export function table(T, x, y, z, w, d, h, m = W_) {
  T.B(m, x - w / 2, y + h - 0.045, z - d / 2, x + w / 2, y + h, z + d / 2);
  T.B(m, x - w / 2 + 0.04, y + h - 0.13, z - d / 2 + 0.04, x + w / 2 - 0.04, y + h - 0.045, z + d / 2 - 0.04);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) T.B(m, x + sx * (w / 2 - 0.07) - 0.03, y, z + sz * (d / 2 - 0.07) - 0.03, x + sx * (w / 2 - 0.07) + 0.03, y + h - 0.045, z + sz * (d / 2 - 0.07) + 0.03);
  T.col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + h);
}
export function chair(T, x, y, z, face, m = W_) {            // face: 'n'|'s'|'e'|'w' — the direction the sitter looks
  const f = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[face], px = -f[1], pz = f[0];
  const p = (a, b) => [x + f[0] * a + px * b, z + f[1] * a + pz * b];
  const seat = [p(-0.24, -0.23), p(0.24, 0.23)], bk = [p(-0.27, -0.23), p(-0.23, 0.23)];
  T.B(m, Math.min(seat[0][0], seat[1][0]), y + 0.46, Math.min(seat[0][1], seat[1][1]), Math.max(seat[0][0], seat[1][0]), y + 0.5, Math.max(seat[0][1], seat[1][1]));
  T.B(m, Math.min(bk[0][0], bk[1][0]), y + 0.5, Math.min(bk[0][1], bk[1][1]), Math.max(bk[0][0], bk[1][0]), y + 1.1, Math.max(bk[0][1], bk[1][1]));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const q = p(0.2 * sx, 0.2 * sz); T.B(m, q[0] - 0.025, y, q[1] - 0.025, q[0] + 0.025, y + 0.46, q[1] + 0.025); }
  T.col.circle(x, z, 0.3, y, y + 0.5);
}
export function stool(T, x, y, z, h = 0.42, m = W_) {
  T.B(m, x - 0.17, y + h - 0.04, z - 0.17, x + 0.17, y + h, z + 0.17);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) T.B(m, x + sx * 0.13 - 0.02, y, z + sz * 0.13 - 0.02, x + sx * 0.13 + 0.02, y + h - 0.04, z + sz * 0.13 + 0.02);
}
/** The main hall's middle bay (the tang): along the back (north) wall the long table with its vases and censer, the hanging painting and couplet; before it the square table and chairs. */
export function tang(T, cx, y, zb, bw, rand) {
  const tw = Math.min(2.4, bw - 0.6);
  table(T, cx, y, zb + 0.3, tw, 0.45, 0.92);
  for (const sx of [-1, 1]) {
    const vx = cx + sx * Math.min(0.9, bw / 2 - 0.55);
    T.L('glaze_blue', [[0.06, 0], [0.11, 0.06], [0.12, 0.2], [0.06, 0.36], [0.045, 0.46], [0.06, 0.5], [0.001, 0.5]], 10, vx, y + 0.92, zb + 0.3);
    T.bag.add('timber', rod([vx, y + 1.42, zb + 0.3], [vx + 0.05, y + 1.9, zb + 0.3], 0.01, 4));
  }
  T.L('bronze', [[0.07, 0], [0.1, 0.03], [0.11, 0.1], [0.08, 0.15], [0.09, 0.16], [0.001, 0.16]], 10, cx, y + 0.92, zb + 0.3);
  T.B('cloth_indigo', cx - 0.42, y + 1.25, zb - 0.02, cx + 0.42, y + 2.75, zb - 0.005);
  T.B('paint_white', cx - 0.34, y + 1.38, zb - 0.005, cx + 0.34, y + 2.55, zb + 0.003);
  T.B('lacquer_black', cx - 0.3, y + 1.5, zb + 0.003, cx + 0.05, y + 1.9, zb + 0.008);
  T.B('slate', cx - 0.1, y + 1.9, zb + 0.003, cx + 0.3, y + 2.4, zb + 0.008);
  for (const sx of [-1, 1]) { const x = cx + sx * 0.7; T.B('cloth_red', x - 0.13, y + 1.2, zb - 0.02, x + 0.13, y + 2.75, zb - 0.005); for (let k = 0; k < 6; k++) T.B('lacquer_black', x - 0.06, y + 2.55 - k * 0.22, zb - 0.005, x + 0.06, y + 2.55 - k * 0.22 + 0.12, zb + 0.003); }
  const tz = zb + 1.45;
  table(T, cx, y, tz, 0.95, 0.95, 0.86);
  for (const sx of [-1, 1]) { table(T, cx + sx * 0.85, y, tz, 0.5, 0.45, 0.5); chair(T, cx + sx * 1.1, y, tz, sx > 0 ? 'w' : 'e'); }
  T.col.rect([cx - 1.4, tz - 0.55, cx + 1.4, tz + 0.55], y, y + 0.9);
  void rand;
}
/** A side room of the main house: the kang (the heated brick bed, its mat, the low table, folded quilts), the wardrobe, the chest. kind 0 bedroom, 1 study. */
export function chamber(T, [x0, x1], y, zb, zf, kind, rand) {
  const w = x1 - x0, cx = (x0 + x1) / 2;
  if (kind === 0) {
    const kx1 = x1 - 0.2, kx0 = Math.max(x0 + 1.3, kx1 - 2.2), kz1 = zb + 1.9;
    T.B('brick_grey', kx0, y, zb, kx1, y + 0.6, kz1, true);
    T.B('reed_mat', kx0 + 0.02, y + 0.6, zb + 0.02, kx1 - 0.02, y + 0.62, kz1 - 0.02);
    T.B(W_, (kx0 + kx1) / 2 - 0.35, y + 0.62, zb + 0.9, (kx0 + kx1) / 2 + 0.35, y + 0.86, zb + 1.4);
    for (let k = 0; k < 3; k++) T.B(['cloth_red', 'cloth_blue', 'cloth_maroon'][k], kx0 + 0.15 + k * 0.55, y + 0.62, zb + 0.05, kx0 + 0.6 + k * 0.55, y + 0.95 + 0.06 * k, zb + 0.55);
    T.B('lacquer_black', kx0 - 0.8, y, zb + 0.8, kx0 - 0.1, y + 0.1, kz1 - 0.2);                         // the stove mouth's hearthstone
  } else {
    table(T, cx, y, zb + 0.5, Math.min(2.0, w - 0.8), 0.7, 0.8);
    chair(T, cx, y, zb + 1.25, 'n');
    for (let k = 0; k < 3; k++) T.B(['cloth_white', 'cloth_indigo', 'cloth_white'][k], cx - 0.6 + k * 0.34, y + 0.8, zb + 0.3, cx - 0.35 + k * 0.34, y + 0.88 + 0.03 * k, zb + 0.55);
    T.L('glaze_white', [[0.001, 0.8], [0.04, 0.82], [0.06, 0.94], [0.001, 0.95]], 8, cx + 0.7, 0, zb + 0.5);
  }
  // the wardrobe pair against the partition wall, a chest by the back wall
  const wx = kind === 0 ? x0 + 0.1 : x1 - 0.1 - 0.5;
  T.B('lacquer_chestnut', wx, y, zb + 2.2, wx + 0.5, y + 1.9, zb + 3.4, true);
  T.B('gilt_bronze', wx + (kind === 0 ? 0.5 : -0.005), y + 1.0, zb + 2.7, wx + (kind === 0 ? 0.51 : 0.005), y + 1.15, zb + 2.9);
  T.B('lacquer_chestnut', x0 + 0.2, y, zb + 0.1, x0 + 1.1, y + 0.55, zb + 0.6, true);
  void rand; void zf;
}
/** The kitchen (west house): the brick stove with its great iron pot, the chimney, the jars, firewood, a table of dough. */
function kitchen(T, [x0, z0, x1, z1], y, rand) {
  const cx = (x0 + x1) / 2;
  T.B('brick_grey', x0 + 0.3, y, z0 + 0.3, x0 + 1.9, y + 0.95, z0 + 1.4, true);
  T.L('iron', [[0.001, 0], [0.5, 0.04], [0.56, 0.2], [0.001, 0.22]], 10, x0 + 1.1, y + 0.95, z0 + 0.85);
  T.L('timber', [[0.58, 0.0], [0.58, 0.05], [0.001, 0.05]], 10, x0 + 1.1, y + 1.17, z0 + 0.85);
  T.B('brick_grey', x0 + 0.4, y + 0.95, z0 + 0.3, x0 + 0.9, y + 3.0, z0 + 0.8);
  firewood({ ...T }, x0 + 0.3, y, z1 - 0.9, 1.6, 4, 'x', rand);
  table(T, cx + 0.7, y, z0 + 1.0, 1.4, 0.7, 0.82);
  T.B('cloth_white', cx + 0.2, y + 0.82, z0 + 0.8, cx + 0.7, y + 0.86, z0 + 1.2);
  jar(T, x1 - 0.5, y, z0 + 0.5, 0.9); jar(T, x1 - 0.5, y, z0 + 1.3, 0.8, 'glaze_green');
  T.col.circle(x1 - 0.5, z0 + 0.5, 0.35, y, y + 0.9); T.col.circle(x1 - 0.5, z0 + 1.3, 0.3, y, y + 0.8);
}
/** The store (east house): grain bins, sacks, jars of oil and pickles, a spinning wheel, strings of dried things. */
function store(T, [x0, z0, x1, z1], y, rand) {
  for (let k = 0; k < 3; k++) { T.B('wood_ochre', x1 - 1.3, y, z0 + 0.3 + k * 1.2, x1 - 0.3, y + 1.1, z0 + 1.2 + k * 1.2, true); T.B('wicker', x1 - 1.25, y + 1.1, z0 + 0.35 + k * 1.2, x1 - 0.35, y + 1.14, z0 + 1.15 + k * 1.2); }
  for (let k = 0; k < 5; k++) T.L('sacking', [[0.001, 0], [0.26, 0.03], [0.3, 0.3], [0.22, 0.6], [0.13, 0.66], [0.001, 0.62]], 8, x0 + 0.6 + (k % 3) * 0.55, y + (k > 2 ? 0.55 : 0), z0 + 0.5 + (k > 2 ? 0.3 : 0));
  jar(T, x0 + 0.5, y, z1 - 0.6, 1.0); jar(T, x0 + 1.3, y, z1 - 0.6, 0.85, 'glaze_green'); jar(T, x0 + 2.0, y, z1 - 0.6, 0.9);
  T.col.circle(x0 + 0.5, z1 - 0.6, 0.38, y, y + 1); T.col.circle(x0 + 1.3, z1 - 0.6, 0.34, y, y + 0.85); T.col.circle(x0 + 2.0, z1 - 0.6, 0.35, y, y + 0.9);
  for (let k = 0; k < 5; k++) hangingBraid(T, x0 + 0.6 + k * 0.5, y + 2.7, (z0 + z1) / 2, 0.6 + rand() * 0.3, k % 2 ? 'pepper' : 'garlic');
}

// ── the court ────────────────────────────────────────────────────────────────────────────────
/** The stone table with its four drum stools, the millstone, the well, the chicken coop, the drying frame: the objects of a court. */
function court(T, rect, cx, zc, rand, kinds) {
  const [x0, , x1] = rect;
  for (const k of kinds) {
    if (k === 'table') {
      T.L('granite_grey', [[0.001, 0], [0.3, 0], [0.26, 0.5], [0.52, 0.52], [0.52, 0.6], [0.001, 0.6]], 10, cx + 4.8, 0.03, zc);
      T.col.circle(cx + 4.8, zc, 0.5, 0, 0.6);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; T.L('granite_grey', [[0.001, 0], [0.17, 0], [0.17, 0.36], [0.001, 0.38]], 8, cx + 4.8 + Math.cos(a) * 0.85, 0.03, zc + Math.sin(a) * 0.85); }
    } else if (k === 'mill') {
      const mx = cx - 5.2;
      T.L('granite_grey', [[0.001, 0], [0.62, 0], [0.62, 0.42], [0.001, 0.42]], 12, mx, 0.03, zc);
      T.L('granite_grey', [[0.001, 0.42], [0.55, 0.42], [0.55, 0.62], [0.001, 0.62]], 12, mx, 0.03, zc);
      T.bag.add('timber', rod([mx, 0.65, zc], [mx + 1.1, 0.85, zc + 0.5], 0.04, 5)); T.col.circle(mx, zc, 0.65, 0, 0.62);
    } else if (k === 'well') {
      const wx = cx - 3.6, wz = zc + 1.0;
      T.L('granite_grey', [[0.55, 0], [0.55, 0.48], [0.34, 0.5], [0.34, 0.45], [0.001, 0.45]], 12, wx, 0.03, wz); T.col.circle(wx, wz, 0.56, 0, 0.5);
      for (const s of [-1, 1]) T.B('timber', wx + s * 0.5 - 0.04, 0.5, wz - 0.04, wx + s * 0.5 + 0.04, 1.6, wz + 0.04);
      T.B('timber', wx - 0.55, 1.55, wz - 0.04, wx + 0.55, 1.65, wz + 0.04);
      T.bag.add('wicker', rod([wx, 1.58, wz], [wx, 0.95, wz], 0.012, 4));
      T.L('timber', [[0.12, 0.8], [0.14, 0.95], [0.001, 0.95]], 8, wx, 0, wz);
    } else if (k === 'coop') {
      const px = x1 - 2.2, pz = zc + 3.4;
      T.B('wood_ochre', px, 0.03, pz, px + 1.2, 0.5, pz + 0.8, true);
      T.B('timber', px - 0.05, 0.5, pz - 0.05, px + 1.25, 0.58, pz + 0.85);
      T.B('lacquer_black', px + 0.4, 0.05, pz - 0.01, px + 0.8, 0.35, pz + 0.01);
    } else if (k === 'frame') {
      const fx = x0 + 3.0, fz = zc - 1.0;
      for (const dx of [0, 2.4]) T.B('timber', fx + dx, 0.03, fz, fx + dx + 0.07, 1.8, fz + 0.07);
      T.bag.add('bamboo_culm', rod([fx, 1.75, fz + 0.03], [fx + 2.4, 1.75, fz + 0.03], 0.03, 5));
      for (let i = 0; i < 5; i++) hangingBraid(T, fx + 0.3 + i * 0.45, 1.72, fz + 0.04, 0.55 + rand() * 0.45, i % 3 === 1 ? 'pepper' : 'corn');
    } else if (k === 'basket') {
      for (let i = 0; i < 3; i++) { const bx = cx - 1.2 + i * 1.4, bz = zc + 3.6; T.L('wicker', [[0.001, 0], [0.55, 0.0], [0.62, 0.05], [0.001, 0.05]], 10, bx, 0.03, bz); for (let j = 0; j < 7; j++) T.B(i === 1 ? 'cloth_red' : 'cloth_ochre', bx - 0.3 + (j % 3) * 0.2, 0.08, bz - 0.3 + Math.floor(j / 3) * 0.2, bx - 0.2 + (j % 3) * 0.2, 0.13, bz - 0.2 + Math.floor(j / 3) * 0.2); T.B('timber', bx - 0.55, 0.0, bz - 0.55, bx - 0.5, 0.2, bz - 0.5); }
    }
  }
}

/** The far shell of a house (lod 2): one box of wall and one gable of grey tile, no windows, no doors, no ornament. ridge along x unless `alongZ`. */
function shellBlock(T, rect, y, H, rise, ov, alongZ = false) {
  const [x0, z0, x1, z1] = rect;
  T.B('brick_grey', x0, y, z0, x1, y + H, z1, true);
  const hx = (x1 - x0 + 2 * ov) / 2, hz = (z1 - z0 + 2 * ov) / 2;
  T.bag.add('tile_grey', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + ov], y + H, y + H + rise, alongZ ? hx : 0, alongZ ? hx : 0, alongZ ? 0 : hz, alongZ ? 0 : hz, { noBottom: true }));
}

// ── the element ──────────────────────────────────────────────────────────────────────────────
/**
 * lu_house: { rect, seed, wealth, lod, shop, trade } — a courtyard house facing south onto the lane below its south edge.
 * lod 0: furnished interiors, court and facade; 1: facade dressing; 2: the shell.
 */
export function luHouse(el, ctx) {
  const T = tools(ctx), { bag, col } = ctx, rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, lod = el.lod ?? 0, pal = HOUSE, cx = (x0 + x1) / 2;
  const rich = (el.wealth ?? 0) > 0.55;
  // the walls: north, west and east (the lot's front is the front range, whole)
  const far = lod >= 2;
  const wall = (a, b) => (far ? T.B('brick_grey', Math.min(a[0], b[0]) - 0.2, 0, Math.min(a[1], b[1]) - 0.2, Math.max(a[0], b[0]) + 0.2, 3.0, Math.max(a[1], b[1]) + 0.2, true) : Wall({ a, b, y: 0, h: 3.0, th: 0.42, gates: [], pal, simple: true }, ctx));
  wall([x0, z0], [x1, z0]); wall([x0, z0], [x0, z1]); wall([x1, z0], [x1, z1]);
  const Hall = far ? () => {} : Hall0;
  // the front range along the lane, in one run but for the gate
  const dS = 4.4, fz0 = z1 - 0.35 - dS, fz1 = z1 - 0.35;
  const gw = el.shop ? 1.9 : 1.7, gx = x0 + 3.6 + (el.shop ? (rand() < 0.5 ? 0.25 : 0.7) : rand()) * Math.max(0, W - 7.2);
  const hallOpts = { y: 0.3, H: 3.3, four: false, roof: 'gable', plat: 0.3, pal, eave: 0.75, platMargin: 0.35, winWall: false, simple: true };
  const runs = [[x0 + 0.35, gx - gw - 1.0], [gx + gw + 1.0, x1 - 0.35]];
  const shopRun = el.shop ? (runs[0][1] - runs[0][0] >= runs[1][1] - runs[1][0] ? 0 : 1) : -1;
  for (let i = 0; i < 2; i++) {
    const [a, b] = runs[i];
    if (b - a < 3.2) continue;
    const nb = Math.max(1, 2 * Math.round(((b - a) / 3.4 - 1) / 2) + 1);
    if (i === shopRun) Hall({ ...hallOpts, rect: [a, fz0, b, fz1], front: 's', bays: [nb, 1], eave: 1.0, platMargin: 0.5 }, ctx);
    else Hall({ ...hallOpts, rect: [a, fz0, b, fz1], front: 'n', bays: [nb, 1] }, ctx);
  }
  // the gate: the hood over the passage and the doors standing open into the court
  Hall({ rect: [gx - gw - 0.9, fz0 - 0.2, gx + gw + 0.9, fz1 + 0.1], y: 0.35, H: 3.5, front: 's', four: false, roof: 'gable', plat: 0.35, bays: [1, 1], pal, eave: 0.8, platMargin: 0.3 }, ctx);
  if (!far) for (const sx of [-1, 1]) bag.add('lacquer_red', box(gx + sx * gw * 0.5 - 0.03, 0.35, fz0 + 0.2, gx + sx * gw * 0.5 + 0.03, 2.5, fz0 + 1.1));
  // the screen wall inside the gate
  if (!far) Wall({ a: [gx - 2.0, fz0 - 2.4], b: [gx + 2.0, fz0 - 2.4], y: 0, h: 2.5, th: 0.36, pal, simple: true }, ctx);
  // the main house: three, five or seven bays, raised a little, a gable roof; its partitions and doors
  const nbm = W > 30 || rich ? 7 : W > 25 ? 5 : 3, dN = Math.min(7.6, D * 0.28), dE = Math.min(4.6, W * 0.2);
  const main = [x0 + dE * 0.35, z0 + 0.6, x1 - dE * 0.35, z0 + 0.6 + dN];
  Hall({ rect: main, y: 0.6, H: 3.5, front: 's', four: false, roof: 'gable', plat: 0.6, bays: [nbm, 2], pal, eave: 0.95, platMargin: 1.1 }, ctx);
  const bw = (main[2] - main[0]) / nbm, mz0 = main[1], mz1 = main[3];
  // east and west houses and the court
  const sz0 = mz1 + 1.8, sz1 = fz0 - 3.0;
  const west = [x0 + 0.6, sz0, x0 + 0.6 + dE, sz1], east = [x1 - 0.6 - dE, sz0, x1 - 0.6, sz1];
  if (sz1 - sz0 > 4) {
    Hall({ rect: west, y: 0.4, H: 3.2, front: 'e', four: false, roof: 'gable', plat: 0.4, bays: [3, 1], pal, eave: 0.8, platMargin: 0.8 }, ctx);
    Hall({ rect: east, y: 0.4, H: 3.2, front: 'w', four: false, roof: 'gable', plat: 0.4, bays: [3, 1], pal, eave: 0.8, platMargin: 0.8 }, ctx);
  }
  if (far) {
    // the far shell: the runs of the front range, the gate hood over the passage, the main house, the two wings
    for (const [a, b] of runs) if (b - a > 3.2) shellBlock(T, [a, fz0, b, fz1], 0.3, 3.3, 1.5, 0.6);
    shellBlock(T, [gx - gw - 0.9, fz0 - 0.2, gx + gw + 0.9, fz1 + 0.1], 0.35, 3.5, 1.5, 0.5);
    shellBlock(T, main, 0.6, 3.5, 1.9, 0.9);
    if (sz1 - sz0 > 4) { shellBlock(T, west, 0.4, 3.2, 1.3, 0.6, true); shellBlock(T, east, 0.4, 3.2, 1.3, 0.6, true); }
  }
  bag.add('brick_paving', box(x0 + 0.3, -0.2, z0 + 0.3, x1 - 0.3, 0.03, z1 - 0.3));
  col.floor([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], 0.03);
  // the paths: from the gate to the main house, across the court
  const pz0 = mz1 + 1.1;
  if (!far) { bag.add('bluestone', box(cx - 0.6, 0.0, pz0, cx + 0.6, 0.06, fz0 - 0.4)); bag.add('bluestone', box(gx - 1.0, 0.0, fz0 - 3.4, gx + 1.0, 0.06, fz1 + 0.2)); }
  const zc = (sz0 + sz1) / 2;
  // ── the facade at the lane (lod < 2): drum stones, lanterns, couplets, damp band, streaks, goods ──
  const zf = z1 - 0.35 + 0.14;                                  // the lane face of the front range's wall (the wall line plus its half thickness)
  if (!far) for (const sx of [-1, 1]) drumStone(T, gx + sx * (gw + 1.25), 0.3, zf + 0.5);
  if (!far) for (const sx of [-1, 1]) {
    T.B('cloth_red', gx + sx * (gw + 0.55) - 0.12, 1.0, zf + 0.04, gx + sx * (gw + 0.55) + 0.12, 2.4, zf + 0.06);
    for (let k = 0; k < 5; k++) T.B('lacquer_black', gx + sx * (gw + 0.55) - 0.05, 2.2 - k * 0.24, zf + 0.06, gx + sx * (gw + 0.55) + 0.05, 2.2 - k * 0.24 + 0.12, zf + 0.07);
  }
  if (lod < 2) {
    lantern(T, gx - 0.9, 2.55, zf + 0.5, 'lamp_paper'); lantern(T, gx + 0.9, 2.55, zf + 0.5, 'lamp_paper');
    // the damp at the foot of the wall and the streaks under the eaves, in short runs by the bays
    for (const [a, b] of runs) {
      if (b - a < 3.2) continue;
      for (let u = a + 0.2; u < b - 0.6; u += 1.7 + rand() * 2.4) { const w = 0.9 + rand() * 1.6; bag.add('plaster_damp', box(u, 0.3, zf + 0.0, Math.min(u + w, b - 0.1), 0.3 + 0.4 + rand() * 0.55, zf + 0.012)); }
      for (let u = a + 0.4; u < b - 0.4; u += 2.2 + rand() * 2.6) bag.add('plaster_streak', box(u, 1.5 + rand() * 0.7, zf, u + 0.25 + rand() * 0.4, 3.3, zf + 0.012));
    }
    // the dressing at eye level (not at the shop run: that has its own)
    const slots = [];
    for (let i = 0; i < 2; i++) { const [a, b] = runs[i]; if (i !== shopRun && b - a > 3.2) for (let u = a + 0.6; u < b - 1.0; u += 1.6) slots.push(u); }
    for (let k = slots.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [slots[k], slots[j]] = [slots[j], slots[k]]; }
    const picks = ['wood', 'jar', 'bench', 'ladder', 'sack', 'broom', 'basket', 'jar2', 'laundry', 'braid'];
    for (let i = 0; i < Math.min(slots.length, lod ? 3 : 5); i++) {
      const u = slots[i], what = picks[Math.floor(rand() * picks.length)];
      if (what === 'wood') firewood({ ...T }, u, 0.3, zf + 0.0, 1.5, 4 + Math.floor(rand() * 3), 'x', rand);
      else if (what === 'jar') { jar(T, u + 0.3, 0.3, zf + 0.4, 1.0); jar(T, u + 0.95, 0.3, zf + 0.35, 0.8, 'glaze_green'); T.col.circle(u + 0.3, zf + 0.4, 0.38, 0.3, 1.2); T.col.circle(u + 0.95, zf + 0.35, 0.3, 0.3, 1.0); }
      else if (what === 'bench') stoneBench(T, u + 0.9, 0.0, zf + 0.5, 1.8, 'x');
      else if (what === 'ladder') leant(T, u + 0.4, 0.3, zf, 'ladder', rand);
      else if (what === 'sack') leant(T, u + 0.2, 0.3, zf + 0.1, 'sack', rand);
      else if (what === 'broom') { leant(T, u + 0.3, 0.3, zf, 'broom', rand); leant(T, u + 0.8, 0.3, zf, 'basket', rand); }
      else if (what === 'basket') leant(T, u + 0.6, 0.3, zf, 'basket', rand);
      else if (what === 'jar2') { T.B('wicker', u, 0.3, zf + 0.1, u + 1.4, 0.34, zf + 0.9); jar(T, u + 0.4, 0.3, zf + 0.5, 0.7); }
      else if (what === 'laundry') laundry(T, u, Math.min(u + 2.6, runs[0][0] < u && u < runs[0][1] ? runs[0][1] - 0.4 : runs[1][1] - 0.4), 2.7, zf + 0.5, rand);
      else for (let q = 0; q < 4; q++) hangingBraid(T, u + 0.3 + q * 0.4, 3.0, zf + 0.15, 0.55 + rand() * 0.45, ['corn', 'pepper', 'garlic', 'corn'][q]);
    }
  }
  // ── the shop in the front range ──
  if (el.shop && shopRun >= 0 && !far) shopCounter(T, runs[shopRun], zf, fz0, fz1, el.trade ?? 0, rand, lod);
  // ── the interiors and the court (lod 0) ──
  if (lod === 0) {
    const y = 0.6, zb = mz0 + 0.17, mid = (nbm - 1) / 2;
    // partitions at the bay lines either side of the middle bay, a door through each near the front
    for (const k of [mid, mid + 1]) {
      const x = main[0] + bw * k;
      T.B('brick_grey', x - 0.12, y, zb, x + 0.12, y + 3.1, zb + 3.0, true);
      T.B('brick_grey', x - 0.12, y, zb + 4.1, x + 0.12, y + 3.1, mz1 - 0.2, true);
      T.B('brick_grey', x - 0.12, y + 2.2, zb + 3.0, x + 0.12, y + 3.1, zb + 4.1);
      T.B('lacquer_red', x - 0.13, y, zb + 2.97, x + 0.13, y + 2.2, zb + 3.03); T.B('lacquer_red', x - 0.13, y, zb + 4.07, x + 0.13, y + 2.2, zb + 4.13);
    }
    tang(T, main[0] + bw * (mid + 0.5), y, zb, bw, rand);
    const sideL = [main[0] + 0.2, main[0] + bw * mid - 0.15], sideR = [main[0] + bw * (mid + 1) + 0.15, main[2] - 0.2];
    chamber(T, sideL, y, zb, mz1, rand() < 0.5 ? 0 : 1, rand);
    chamber(T, sideR, y, zb, mz1, 0, rand);
    lanternIn(T, main[0] + bw * (mid + 0.5), y + 3.0, mz0 + 2.5);
    if (sz1 - sz0 > 4) { kitchen(T, west, 0.4, rand); store(T, east, 0.4, rand); }
    // strings of corn and peppers under the main house's eaves; a few pots of flowers at its steps
    for (let k = 0; k < 8; k++) hangingBraid(T, main[0] + 1.2 + k * ((main[2] - main[0] - 2.4) / 7), 3.05, mz1 + 0.5, 0.6 + rand() * 0.5, ['corn', 'pepper', 'corn', 'garlic'][k % 4]);
    for (let k = 0; k < 4; k++) T.L(k % 2 ? 'terracotta' : 'pottery_dark', [[0.001, 0], [0.12, 0], [0.19, 0.28], [0.21, 0.3], [0.001, 0.3]], 8, main[0] + 1.0 + k * 0.7, 0.6, mz1 + 0.9);
    const kinds = ['table', 'basket'];
    if (rand() < 0.5) kinds.push('well'); else kinds.push('mill');
    if (rand() < 0.6) kinds.push('coop');
    if (rand() < 0.6) kinds.push('frame');
    court(T, el.rect, cx, zc, rand, kinds);
  }
}
const lanternIn = (T, x, y, z) => { lantern(T, x, y - 0.34, z); T.bag.add('timber', rod([x, y, z], [x, y + 0.12, z], 0.01, 3)); };

/** The shop that opens the front range onto the lane: the counter across all but the door, the shelves and goods inside, the signboard, the goods out on the apron. */
function shopCounter(T, [a, b], zf, fz0, fz1, trade, rand, lod) {
  const n = Math.max(1, 2 * Math.round(((b - a) / 3.4 - 1) / 2) + 1), bay = (b - a) / n, mid = (n - 1) / 2, door0 = a + bay * mid, door1 = door0 + bay;
  const zl = fz1 + 0.15;                                         // the lane side of the posts
  // the counter in the bays either side of the door, shuttered at night
  for (const [u0, u1] of [[a + 0.2, door0 - 0.05], [door1 + 0.05, b - 0.2]]) if (u1 - u0 > 0.8) {
    T.B('lacquer_black', u0, 0.3, zl - 0.25, u1, 1.0, zl + 0.45, true);
    T.B('lacquer_chestnut', u0 - 0.04, 1.0, zl - 0.3, u1 + 0.04, 1.06, zl + 0.5);
  }
  const GOODS = [['cloth_white', 'cloth_grey', 'cloth_indigo'], ['cloth_red', 'cloth_ochre', 'cloth_red'], ['cloth_indigo', 'cloth_white', 'cloth_indigo'], ['cloth_brown', 'cloth_ochre', 'cloth_brown']];
  const g = GOODS[trade % GOODS.length];
  for (const [u0, u1] of [[a + 0.2, door0 - 0.05], [door1 + 0.05, b - 0.2]]) if (u1 - u0 > 0.8) for (let k = 0; k < Math.floor((u1 - u0) / 0.5); k++) T.B(g[k % 3], u0 + 0.12 + k * 0.5, 1.06, zl - 0.05, u0 + 0.5 + k * 0.5, 1.06 + 0.12 + 0.07 * (k % 3), zl + 0.3);
  // the name board over the door, the hanging signboard at the corner
  T.B('lacquer_black', door0 + 0.1, 3.0, zl + 0.28, door1 - 0.1, 3.5, zl + 0.34);
  T.B('gilt_bronze', door0 + 0.2, 3.1, zl + 0.33, door1 - 0.2, 3.4, zl + 0.355);
  T.B('timber', b - 0.15, 0.3, zl + 0.6, b - 0.08, 3.9, zl + 0.66);
  T.B('lacquer_red', b - 0.4, 2.0, zl + 0.58, b - 0.1, 3.5, zl + 0.69); T.B('gilt_bronze', b - 0.34, 2.2, zl + 0.68, b - 0.16, 3.2, zl + 0.70);
  if (lod === 0) {
    // inside: shelves on the back wall with the jars and the goods of the trade, a stool and the account table
    const zb = fz0 + 0.3;
    T.B('wood_dark', a + 0.3, 0.3, zb, b - 0.3, 0.38, zb + 0.45); T.B('wood_dark', a + 0.3, 1.2, zb, b - 0.3, 1.26, zb + 0.4); T.B('wood_dark', a + 0.3, 2.0, zb, b - 0.3, 2.06, zb + 0.4);
    for (let k = 0; k < Math.floor((b - a - 0.8) / 0.6); k++) { jar(T, a + 0.6 + k * 0.6, 1.26, zb + 0.2, 0.4); T.B(g[k % 3], a + 0.4 + k * 0.6, 0.38, zb + 0.05, a + 0.9 + k * 0.6, 0.9, zb + 0.4); }
    stool(T, door0 + bay / 2 + 0.6, 0.3, zl - 1.0);
    T.B('lacquer_black', door0 + 0.4, 0.3, fz0 + 0.9, door1 - 0.4, 0.9, fz0 + 1.5, true);
    T.B('wicker', door0 + 0.6, 0.9, fz0 + 1.0, door0 + 1.0, 0.93, fz0 + 1.3);
    lantern(T, door0 + bay / 2, 2.55, fz0 + 2.0, 'lamp_paper');
  }
  // out on the apron: a trestle with the day's goods and a bamboo pole with the trade's streamer
  T.B('lacquer_chestnut', door0 + 0.3, 0.3, zl + 0.9, door0 + 0.38, 0.9, zl + 0.98);
  T.bag.add('bamboo_culm', rod([a + 0.1, 0.3, zl + 1.0], [a + 0.1, 3.3, zl + 1.0], 0.03, 5));
  T.B(g[0], a + 0.1, 2.6, zl + 1.0, a + 0.9, 3.2, zl + 1.01);
  void rand;
}
