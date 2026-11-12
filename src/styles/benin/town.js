// The town of Benin outside the palace (docs/settlements/benin-city.md §2, §4, §5): the yards of the guilds (brass-casters at their
// furnaces, ivory and wood carvers, weavers), the stalls of the Oba market, the gates of the Iya and the double palisade on its bank.
import { frame } from '../greek/agora.js';
import { orientedBox } from '../../core/build.js';
import { Matrix4 } from '../../core/three.js';
import { rng, wallMat, B, clayWall, gable, lean, head, plaque, box, frustum, lathe, rod } from './kit.js';
import { pot, pots, stool, wood, wear, hung, mortar, claySeat } from './props.js';

const FRONT_LOW = (F) => { const o = F.out; return o[1] !== 0 ? (o[1] > 0 ? 'zp' : 'zn') : (o[0] > 0 ? 'xp' : 'xn'); };

/** caster_yard: { rect (28 × 17), front ('e' | 'w': the lane), kind ('cast' | 'carve' | 'weave'), seed, simple } */
function yard(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed ?? 1), F = frame(el.rect, el.front), { L, D, P, R } = F, simple = el.simple, wm = wallMat(rand);
  const rr = (u0, v0, u1, v1) => R(u0, v0, u1, v1), kind = el.kind ?? 'cast';
  bag.add('tuff_red', box(el.rect[0], -0.3, el.rect[1], el.rect[2], 0.05, el.rect[3])); col.floor(el.rect, 0.05);
  // the walls: sides and back, low, with the gap at the lane
  const w = (u0, v0, u1, v1, op = []) => clayWall(ctx, P(u0, v0), P(u1, v1), 0.5, 0.05, 1.9, wm, op, !simple);
  w(0.25, 0, 0.25, D); w(L - 0.25, 0, L - 0.25, D); w(0, D - 0.25, L, D - 0.25);
  w(0, 0.25, 3.2, 0.25); w(L - 3.2, 0.25, L, 0.25);
  // the open shed along the back wall: posts, a lean-to of palm thatch sloping to the yard
  const sd = 6;
  lean(ctx, rr(0, D - sd, L, D), FRONT_LOW(F), 2.5, 3.7, 'thatch_palm', 0.5, !simple);
  for (let u = 1.2; u < L; u += 3.3) { const [px, pz] = P(u, D - sd + 0.3); bag.add('palm_trunk', lathe([[0.12, 0.05], [0.11, 2.5]], 6, null, px, 0, pz)); col.circle(px, pz, 0.13, 0.05, 2.5); }
  if (simple) return;
  const S = (u0, v0, u1, v1, y0, y1, m, solid = true) => B(ctx, m, rr(u0, v0, u1, v1), y0, y1, solid);
  if (kind === 'cast') {
    // the furnace of clay with its mouth, chimney and bellows pots; the charcoal heap; moulds drying in a row; the wax and finished heads
    const [fx, fz] = P(4.2, D - 9);
    bag.add('tuff_red', lathe([[0.7, 0.05], [0.62, 0.7], [0.45, 1.15], [0.3, 1.25], [0.001, 1.25]], 12, null, fx, 0, fz)); col.circle(fx, fz, 0.75, 0.05, 1.3);
    const [mx, mz] = P(4.2, D - 9 - 0.6); bag.add('pottery_dark', box(mx - 0.22, 0.3, mz - 0.22, mx + 0.22, 0.62, mz + 0.22));
    for (const s of [-1, 1]) { const [bx, bz] = P(4.2 + s * 1.3, D - 8.6); bag.add('terracotta', lathe([[0.001, 0.05], [0.28, 0.08], [0.36, 0.32], [0.2, 0.5], [0.001, 0.52]], 8, null, bx, 0, bz)); bag.add('hide_brown', box(bx - 0.12, 0.5, bz - 0.12, bx + 0.12, 0.62, bz + 0.12)); col.circle(bx, bz, 0.38, 0.05, 0.6); const a = [bx, 0.5, bz], b = [fx + (bx - fx) * 0.3, 0.35, fz + (bz - fz) * 0.3]; bag.add('iron', rod(a, b, 0.04, 5)); }
    const [hx, hz] = P(7.6, D - 8); bag.add('iron', lathe([[0.7, 0.05], [0.5, 0.35], [0.2, 0.55], [0.001, 0.58]], 8, null, hx, 0, hz)); col.circle(hx, hz, 0.7, 0.05, 0.5);
    for (let i = 0; i < 6; i++) { const [qx, qz] = P(9 + i * 1.0, D - 12.5 + (i % 2) * 0.5); bag.add('earth_wall', lathe([[0.001, 0.05], [0.28, 0.07], [0.33, 0.3], [0.2, 0.46], [0.001, 0.48]], 8, null, qx, 0, qz)); }
    S(L - 6.2, D - 3.9, L - 1.2, D - 2.9, 0.05, 0.85, 'timber');
    for (let i = 0; i < 4; i++) { const [qx, qz] = P(L - 5.6 + i * 1.2, D - 3.4); head(ctx, qx, 0.85, qz, el.front === 'e' ? Math.PI / 2 : -Math.PI / 2, 600 + i + (el.seed ?? 0), false); }
    for (let i = 0; i < 3; i++) { const [qx, qz] = P(L - 4.8 + i * 1.6, D - 0.55); plaque(ctx, qx, 1.7, qz, el.front, 700 + i + (el.seed ?? 0), 0.4, 0.5); }
  } else if (kind === 'carve') {
    S(L / 2 - 2.2, D - 4.5, L / 2 + 2.2, D - 3.2, 0.05, 0.8, 'wood_dark'); S(L / 2 - 2.4, D - 4.7, L / 2 + 2.4, D - 3.0, 0.8, 0.88, 'timber', false);
    for (let i = 0; i < 4; i++) { const [a, b] = [P(2 + i * 1.1, D - 1.2), P(2.3 + i * 1.1, D - 5.4)]; bag.add('ivory', rod([a[0], 0.9, a[1]], [b[0], 0.18, b[1]], 0.07, 6)); }
    for (let i = 0; i < 5; i++) { const [lx, lz] = P(L - 2 - i * 0.7, D - 7.5 + (i % 2)); bag.add('timber', lathe([[0.2, 0.05], [0.2, 1.1 - i * 0.1]], 8, null, lx, 0, lz)); col.circle(lx, lz, 0.22, 0.05, 1); }
  } else {
    for (let k = 0; k < 2; k++) {
      const u = 4 + k * 6, f = [rr(u - 0.9, D - 5.2, u + 0.9, D - 5), rr(u - 0.9, D - 3.5, u + 0.9, D - 3.3)];
      for (const r of f) bag.add('timber', box(r[0], 0.05, r[1], r[2], 1.9, r[3]));
      const c = rr(u - 0.85, D - 5.1, u + 0.85, D - 3.4); bag.add(['cloth_indigo', 'cloth_ochre'][k], box(c[0], 0.6, c[1], c[2], 1.6, c[3] + 0.05));
      col.rect(rr(u - 1, D - 5.3, u + 1, D - 3.2), 0.05, 1.9);
    }
    const [px, pz] = P(L - 3, D - 7), [qx, qz] = P(L - 3, D - 11);
    bag.add('timber', rod([px, 0.05, pz], [px, 2.4, pz], 0.05, 6)); bag.add('timber', rod([qx, 0.05, qz], [qx, 2.4, qz], 0.05, 6));
    const c = [Math.min(px, qx) - 0.04, Math.min(pz, qz), Math.max(px, qx) + 0.04, Math.max(pz, qz)];
    bag.add('cloth_red', box(c[0], 1.0, c[1], c[2], 2.3, c[3]));
  }
  yardExtras(ctx, F, kind, el.seed ?? 1, wm);
}


/** The yard's life at the lane and in the shed (docs/settlements/benin-city.md §10): weathered walls, pots and charcoal at the front, the guild's trade at its bench. */
function yardExtras(ctx, F, kind, seed, wm) {
  const { bag, col } = ctx, { L, D, P, R } = F, rand = rng(seed * 3 + 1), Y = 0.05;
  void wm;
  wear(ctx, P(0.25, 0), P(0.25, D), 0.5, Y, 1.9, seed + 1); wear(ctx, P(L - 0.25, 0), P(L - 0.25, D), 0.5, Y, 1.9, seed + 2); wear(ctx, P(0, D - 0.25), P(L, D - 0.25), 0.5, Y, 1.9, seed + 3);
  // the front of the yard on the lane: pots, firewood, a seat, charcoal in baskets
  { const [a, b] = P(5.5, 1.6); pots(ctx, a, Y, b, seed + 4, 3); const [c, d] = P(L - 5.5, 1.4); wood(ctx, c, Y, d, F.along, 1.5, seed + 5); const r = R(L / 2 - 2, 1.1, L / 2 + 1, 1.7); claySeat(ctx, r, Y, seed); }
  for (let i = 0; i < 3; i++) { const [x, z] = P(9 + i * 1.1, 2.2 + (i % 2) * 0.4); bag.add('wicker', lathe([[0.001, Y], [0.3, Y + 0.02], [0.32, Y + 0.45], [0.001, Y + 0.45]], 8, null, x, 0, z)); bag.add('obsidian', lathe([[0.28, Y + 0.44], [0.2, Y + 0.55], [0.001, Y + 0.58]], 8, null, x, 0, z)); col.circle(x, z, 0.33, Y, Y + 0.5); }
  if (kind === 'cast') {
    // the wax-worker's bench with heads in wax, a clay pot of wax; the anvil stone and hammer; the tongs on a rack; finished plaques on the back wall; the Ogun shrine
    const [bx, bz] = P(L - 10.5, D - 3.4);
    bag.add('timber', box(bx - 1.0, Y + 0.6, bz - 0.4, bx + 1.0, Y + 0.68, bz + 0.4));
    for (const s of [-1, 1]) for (const t of [-1, 1]) bag.add('wood_dark', rod([bx + s * 0.9, Y, bz + t * 0.32], [bx + s * 0.9, Y + 0.6, bz + t * 0.32], 0.04, 5));
    col.rect([bx - 1.0, bz - 0.4, bx + 1.0, bz + 0.4], Y, Y + 0.7);
    for (let i = 0; i < 4; i++) bag.add('hide_tan', lathe([[0.001, Y + 0.68], [0.1, Y + 0.7], [0.12, Y + 0.84], [0.08, Y + 0.95], [0.001, Y + 0.97]], 7, null, bx - 0.7 + i * 0.45, 0, bz));
    const [ax, az] = P(L - 14, D - 8.5); bag.add('basalt', lathe([[0.3, Y], [0.26, Y + 0.3], [0.001, Y + 0.34]], 8, null, ax, 0, az)); col.circle(ax, az, 0.32, Y, Y + 0.34);
    bag.add('iron', rod([ax + 0.05, Y + 0.34, az], [ax + 0.4, Y + 0.38, az + 0.1], 0.035, 5));
    const [ox, oz] = P(L - 1.7, 3.0);
    bag.add('tuff_red', lathe([[0.7, Y], [0.55, Y + 0.3], [0.001, Y + 0.4]], 9, null, ox, 0, oz)); col.circle(ox, oz, 0.7, Y, Y + 0.4);
    for (let i = 0; i < 5; i++) { const a = i * 1.26; bag.add('iron', rod([ox + Math.cos(a) * 0.25, Y + 0.38, oz + Math.sin(a) * 0.25], [ox + Math.cos(a) * 0.3, Y + 1.3 + (i % 2) * 0.3, oz + Math.sin(a) * 0.3], 0.025, 4)); }
    const [wx, wz] = P(2.2, D - 7); stool(ctx, wx, Y, wz);
  } else if (kind === 'carve') {
    // carved stools and stands for sale at the front, billets of wood, a carver's pole of tools
    for (let i = 0; i < 3; i++) { const [x, z] = P(6 + i * 1.3, 4.0); stool(ctx, x, Y, z, 'wood_dark'); }
    const [px, pz] = P(2, D - 3), [qx, qz] = P(5, D - 3); bag.add('timber', rod([px, Y, pz], [px, Y + 2.0, pz], 0.05, 5)); bag.add('timber', rod([qx, Y, qz], [qx, Y + 2.0, qz], 0.05, 5)); bag.add('timber', rod([px, Y + 1.9, pz], [qx, Y + 1.9, qz], 0.04, 5));
    for (let i = 0; i < 5; i++) { const [x, z] = P(2.3 + i * 0.6, D - 3.05); bag.add('iron', rod([x, Y + 1.0, z], [x + 0.02, Y + 1.85, z], 0.014, 4)); }
    for (let i = 0; i < 6; i++) { const [x, z] = P(L - 4.5 + (i % 3) * 0.5, D - 3 + Math.floor(i / 3) * 0.4); bag.add('timber', lathe([[0.001, Y], [0.14, Y], [0.12, Y + 0.5], [0.001, Y + 0.5]], 6, null, x, 0, z)); }
  } else {
    // the weaver: warp threads on the frame, bolts of cloth stacked, vats of indigo
    for (let k = 0; k < 2; k++) { const u = 4 + k * 6; for (let i = 0; i < 11; i++) { const [x, z] = P(u - 0.8 + i * 0.16, D - 4.6); bag.add(k ? 'cloth_ochre' : 'cloth_white', box(x - 0.004, Y + 1.7, z - 0.55, x + 0.004, Y + 2.15, z + 0.55)); } }
    for (let i = 0; i < 3; i++) { const [x, z] = P(L - 2.2, 4 + i * 1.0); pot(ctx, x, Y, z, 0.4, 0.55, 'pottery_dark'); bag.add('cloth_indigo', lathe([[0.001, Y + 0.5], [0.3, Y + 0.5], [0.001, Y + 0.51]], 8, null, x, 0, z)); col.circle(x, z, 0.42, Y, Y + 0.55); }
    const [bx, bz] = P(L - 8, D - 3.2); for (let i = 0; i < 4; i++) bag.add(['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_green'][i], box(bx - 0.4, Y + i * 0.1, bz - 0.25, bx + 0.4, Y + i * 0.1 + 0.1, bz + 0.25));
    const [hx, hz] = P(2.5, 5); hung(ctx, hx, Y + 2.2, hz, F.along, 3, seed + 9, 1.0);
  }
  void rand; void mortar;
}

/** benin_stall: { rect (3 × 2.4), front, goods, seed } — a mat roof on four posts, a table of goods. */
const GOODS = ['yam', 'oil', 'cloth', 'pepper', 'plantain', 'brass'];
function stall(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed ?? 1), F = frame(el.rect, el.front), { L, D, P, R } = F, rr = (a, b, c, d) => R(a, b, c, d), goods = el.goods ?? GOODS[Math.floor(rand() * GOODS.length)];
  for (const [u, v] of [[0.15, 0.15], [L - 0.15, 0.15], [0.15, D - 0.15], [L - 0.15, D - 0.15]]) { const [x, z] = P(u, v); bag.add('timber', lathe([[0.05, 0], [0.05, v < D / 2 ? 1.9 : 2.5]], 5, null, x, 0, z)); }
  const roofM = ['reed_mat', 'thatch_palm', 'reed_mat', 'cloth_white', 'cloth_ochre', 'cloth_indigo'][Math.floor(rand() * 6)];
  lean(ctx, rr(0, 0, L, D), FRONT_LOW(F), 1.9, 2.5, roofM, 0.3, false);
  B(ctx, 'timber', rr(0.2, 0.3, L - 0.2, 1.0), 0.7, 0.78, true); for (const [u] of [[0.35], [L - 0.35]]) B(ctx, 'wood_dark', rr(u - 0.05, 0.4, u + 0.05, 0.9), 0, 0.7);
  if (el.simple) return;
  for (let i = 0; i < 6; i++) {
    const u = 0.5 + i * (L - 1.0) / 5, [x, z] = P(u, 0.65);
    if (goods === 'yam') bag.add('tuff_red', rod([x - 0.12, 0.78, z], [x + 0.12, 0.98, z], 0.07, 5));
    else if (goods === 'oil') bag.add('terracotta', lathe([[0.001, 0.78], [0.14, 0.8], [0.2, 0.95], [0.12, 1.1], [0.001, 1.1]], 7, null, x, 0, z));
    else if (goods === 'cloth') bag.add(['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_blue'][i], box(x - 0.2, 0.78, z - 0.25, x + 0.2, 0.9 + (i % 3) * 0.05, z + 0.25));
    else if (goods === 'pepper') bag.add('wall_red', lathe([[0.3, 0.78], [0.2, 0.9], [0.001, 1.0]], 7, null, x, 0, z));
    else if (goods === 'plantain') bag.add('palm_leaf', box(x - 0.2, 0.78, z - 0.12, x + 0.2, 0.92, z + 0.12));
    else bag.add('bronze', lathe([[0.001, 0.78], [0.12, 0.8], [0.1, 0.96], [0.001, 1.0]], 7, null, x, 0, z));
  }
  // behind and beside the table: the seller's stool, baskets and pots of stock, goods hung from the front beam, a heap on a mat
  const r2 = rng((el.seed ?? 1) + 5);
  { const [sx, sz] = P(L * 0.5, D - 0.55); stool(ctx, sx, 0, sz); }
  for (let i = 0; i < 2; i++) { const [x, z] = P(0.5 + i * (L - 1.0), D - 0.45); pots(ctx, x, 0, z, (el.seed ?? 1) + i, 2, false); }
  if (goods === 'cloth' || goods === 'brass') { const [x, z] = P(L / 2, 0.15); hung(ctx, x, 2.0, z, F.along, 5, (el.seed ?? 1) + 8, 0.9); }
  if (goods === 'pepper' || goods === 'plantain') { const [x, z] = P(L / 2, 0.15); for (let i = 0; i < 4; i++) bag.add(goods === 'pepper' ? 'wall_red' : 'palm_leaf', lathe([[0.001, 0], [0.07, 0.05], [0.06, 0.5], [0.001, 0.55]], 6, null, x + (i - 1.5) * 0.4, 1.45, z)); }
  { const [x, z] = P(L + 0.4, 0.9); const g = ['yam', 'pepper', 'plantain'][Math.floor(r2() * 3)]; for (let i = 0; i < 5; i++) bag.add(g === 'yam' ? 'tuff_red' : g === 'pepper' ? 'wall_red' : 'palm_leaf', rod([x - 0.2 + (i % 3) * 0.18, 0.06 + Math.floor(i / 3) * 0.1, z + (i % 2) * 0.1], [x - 0.0 + (i % 3) * 0.18, 0.12 + Math.floor(i / 3) * 0.1, z + (i % 2) * 0.1], 0.07, 5)); }
  void D; void col;
}

/** benin_posts: { a, b, ys: [y at a, mid, b], simple } — the double palisade of great posts on the crest of the bank. */
function posts(el, ctx) {
  const { bag, col } = ctx, [a, b] = [el.a, el.b], Ln = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Ln, uz = (b[1] - a[1]) / Ln, [y0, ym, y1] = el.ys;
  const yAt = (t) => { const s = t / Ln; return (1 - s) * (1 - s) * y0 + 2 * s * (1 - s) * (2 * ym - (y0 + y1) / 2) + s * s * y1; };
  const ymax = Math.max(y0, ym, y1), ymin = Math.min(y0, ym, y1);
  if (el.simple) { bag.add('palisade', orientedBox(a, b, 1.1, ymin - 0.2, ymax + 3.3)); col.segment(a, b, 1.1, ymin - 0.4, ymax + 3.3); return; }
  bag.add('palisade', orientedBox(a, b, 0.6, ymin - 0.3, ymax + 2.0));
  const n = Math.max(2, Math.round(Ln / 0.55));
  for (let i = 0; i <= n; i++) {
    const t = i / n * Ln, y = yAt(t), h = 3.0 + ((i * 7) % 5) * 0.12;
    for (const off of [-0.32, 0.32]) {
      const x = a[0] + ux * t - uz * off, z = a[1] + uz * t + ux * off;
      bag.add('palisade', box(x - 0.15, y - 0.2, z - 0.15, x + 0.15, y + h, z + 0.15));
      bag.add('palisade', frustum([x - 0.15, z - 0.15, x + 0.15, z + 0.15], y + h, y + h + 0.3, 0.12, 0.12, 0.12, 0.12));
    }
  }
  col.segment(a, b, 1.1, ymin - 0.4, ymax + 3.3);
}

/** benin_gate: { at: [x, z] on the crest, th (angle outward), seed } — the breach in the bank, two great posts, the leaf cut from one piece of wood, the toll-keeper's shelter. */
function gate(el, ctx) {
  const { bag, col } = ctx, [gx, gz] = el.at, th = el.th, rand = rng(el.seed ?? 1), Y = el.y ?? 0;
  const M = new Matrix4().makeRotationY(-th); M.setPosition(gx, 0, gz);
  const add = (m, g) => { g.applyMatrix4(M); bag.add(m, g); };
  const W = el.w ?? 4.6;
  for (const s of [-1, 1]) {
    add('kokowai', box(-0.3, Y, s * W - 0.3, 0.3, Y + 4.6, s * W + 0.3));
    add('bronze', box(-0.34, Y + 4.6, s * W - 0.34, 0.34, Y + 4.8, s * W + 0.34));
    add('bronze', box(-0.05, Y + 4.8, s * W - 0.05, 0.05, Y + 5.3, s * W + 0.05));
    col.circle(gx - Math.sin(th) * s * W, gz + Math.cos(th) * s * W, 0.4, Y, Y + 4.8);
  }
  // the leaf, one plank 1.6 m wide, 2.7 m high, ajar
  const leaf = box(0, 0, 0, 0.16, 2.7, 1.6); leaf.rotateY(-0.9); leaf.translate(0, Y, -W + 0.6); add('wood_dark', leaf);
  // the toll-keeper's shelter inside the gate: a platform, four posts, a gable of thatch, a bench
  const sx = -7, sz = W + 5.5;
  add('tuff_red', box(sx - 2.2, Y - 0.3, sz - 1.8, sx + 2.2, Y + 0.2, sz + 1.8));
  for (const [dx, dz] of [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]]) add('palm_trunk', lathe([[0.1, Y + 0.2], [0.1, Y + 2.4]], 6, null, sx + dx, 0, sz + dz));
  add('thatch_palm', frustum([sx - 2.8, sz - 2.4, sx + 2.8, sz + 2.4], Y + 2.4, Y + 3.7, 0, 0, 2.3, 2.3, { noBottom: true }));
  add('timber', box(sx - 1.5, Y + 0.2, sz + 1.0, sx + 1.5, Y + 0.6, sz + 1.4));
  if (!el.simple) {
    // the shrine of the gate: a clay mound with iron staves and a chalked ring, offerings of pots; the toll goods: baskets and a heap of yam
    add('tuff_red', lathe([[0.9, Y], [0.7, Y + 0.35], [0.001, Y + 0.5]], 9, null, -3.5, 0, -(W + 2.6)));
    for (let i = 0; i < 4; i++) { const a = i * 1.6; add('iron', rod([-3.5 + Math.cos(a) * 0.3, Y + 0.45, -(W + 2.6) + Math.sin(a) * 0.3], [-3.5 + Math.cos(a) * 0.35, Y + 1.6 + (i % 2) * 0.4, -(W + 2.6) + Math.sin(a) * 0.35], 0.025, 4)); }
    add('chalk', lathe([[0.95, Y], [0.95, Y + 0.02], [0.8, Y + 0.02], [0.8, Y]], 12, null, -3.5, 0, -(W + 2.6)));
    col.circle(gx + Math.cos(th) * -3.5 + Math.sin(th) * (W + 2.6), gz + Math.sin(th) * -3.5 - Math.cos(th) * (W + 2.6), 0.9, Y, Y + 0.5);
    for (let i = 0; i < 4; i++) add('wicker', lathe([[0.001, Y], [0.3, Y + 0.02], [0.34, Y + 0.4], [0.001, Y + 0.4]], 8, null, -4.5 + (i % 2) * 0.8, 0, W + 2.2 + Math.floor(i / 2) * 0.8));
    for (let i = 0; i < 6; i++) add('tuff_red', rod([-6.2 + (i % 3) * 0.3, Y + 0.06 + Math.floor(i / 3) * 0.12, W + 1.4], [-5.9 + (i % 3) * 0.3, Y + 0.12 + Math.floor(i / 3) * 0.12, W + 1.4], 0.08, 5));
    for (const s of [-1, 1]) { add('bronze', lathe([[0.001, 0], [0.14, 0.02], [0.12, 0.24], [0.001, 0.3]], 7, null, -0.0, Y + 3.8, s * (W - 0.4))); add('chalk', box(-0.36, Y + 1.2, s * W - 0.36, 0.36, Y + 1.35, s * W + 0.36)); }
  }
  void rand; void head;
}
export const TOWN_EL = { caster_yard: yard, benin_stall: stall, benin_posts: posts, benin_gate: gate };
void wallMat; void gable; void B;
