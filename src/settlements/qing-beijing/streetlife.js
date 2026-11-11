// Ming–Qing Beijing — the eye-level things of the street (docs/settlements/qing-beijing.md §16, §17):
// the goods and trestles before each shop by its trade, the barber's stand, the tea stall, the water
// barrow, the sedan chair at rest, and what stood at the gates of the hutong — coal-ball stacks,
// the autumn heaps of cabbage under straw, firewood, water vats, a bird cage hung on its bracket,
// children's things. Elements of the style 'life' (registered by style.js). Local frame: x along, z out
// from the wall or the front, y up. Each builds one Parts and emits it once: few meshes, few draws.

import { box, lathe, rod, hangFrom, windMat, fromTriangles } from '../../core/geom.js';
import { Parts, T, ball, limb, torus } from '../../styles/qing/carving.js';
import { figure } from '../../objects/figures.js';
import { animal } from '../../objects/animals.js';
import { goods as boothGoods } from './shops.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (r, l) => l[Math.floor(r() * l.length)];
const CLOTHS = ['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_grey'];
/** A figure of the street at a local point (the builder's frame turned by yaw about (ax, az)). */
function placeAt(el, ctx, lx, lz) { const c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0); return [el.at[0] + lx * c + lz * s, el.at[1] - lx * s + lz * c]; }
function person(el, ctx, lx, lz, extra = {}, dyaw = 0) {
  const [x, z] = placeAt(el, ctx, lx, lz), r = rng((el.seed ?? 1) * 7 + Math.floor(lx * 31 + lz * 17));
  figure({ t: 'figure', at: [x, z], y: el.y ?? 0, rot: (el.rot ?? 0) + Math.PI + dyaw, seed: Math.floor(r() * 1e9), dress: 'robe', cloth: pick(r, ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_black']), cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap', hair: 'shaven', over: 'sash', ...extra }, ctx);
}

// ── before the shops ────────────────────────────────────────────────────────────
function wheelY(P, mat, R, x, y, spokes = 10) {
  // a spoked wheel standing in the plane x = const, hub at (x, y, 0)
  P.add('iron', T(torus(R, 0.018, 18, 4).rotateZ(Math.PI / 2), x, y, 0));
  P.add(mat, T(torus(R - 0.05, 0.03, 16, 4).rotateZ(Math.PI / 2), x, y, 0));
  P.add(mat, lathe([[0.001, -0.07], [0.07, -0.07], [0.09, -0.03], [0.09, 0.03], [0.07, 0.07], [0.001, 0.07]], 8).rotateZ(Math.PI / 2).translate(x, y, 0));
  for (let k = 0; k < spokes; k++) { const a = k / spokes * Math.PI * 2; P.add(mat, limb([x, y + Math.cos(a) * 0.08, Math.sin(a) * 0.08], [x, y + Math.cos(a) * (R - 0.05), Math.sin(a) * (R - 0.05)], 0.014, 0.012, 4)); }
}
/**
 * bj_shopgoods: { at (the middle of the shop's front on the apron), rot (out toward the street), w, trade, seed } — a trestle of the
 * trade with its goods, set out before the front; a bench or stools; a rack of wares for the trades that hang them.
 */
export function bjShopgoods(el, { bag, col }) {
  const r = rng(el.seed || 1), P = new Parts(), w = el.w ?? 3.4, d0 = el.d0 ?? 0.55, tr = el.trade;
  const off = (z) => z + d0;
  if (tr === 'pawn') {
    // the pawnshop: a high blank wall and a pair of stools, a bench; nothing on show
    P.add('timber', box(-0.7, 0.4, off(0.1), 0.7, 0.45, off(0.42)));
    for (const sx of [-1, 1]) for (const sz of [0.14, 0.38]) P.add('timber', box(sx * 0.6 - 0.025, 0, off(sz) - 0.025, sx * 0.6 + 0.025, 0.4, off(sz) + 0.025));
  } else if (tr === 'cloth' || tr === 'lantern' || tr === 'shoes') {
    // wares hung or laid on a rack: bolts of cloth over a pole, a rack of lanterns, shoes in rows on a plank
    if (tr === 'cloth') {
      for (const sx of [-1, 1]) P.add('timber', limb([sx * (w / 2 - 0.2), 0, off(0.3)], [sx * (w / 2 - 0.2), 2.0, off(0.3)], 0.04, 0.035, 5));
      P.add('timber', limb([-(w / 2 - 0.2), 2.0, off(0.3)], [(w / 2 - 0.2), 2.0, off(0.3)], 0.03, 0.03, 5));
      const n = Math.floor((w - 0.8) / 0.34);
      for (let i = 0; i < n; i++) { const x = -(w / 2 - 0.45) + i * ((w - 0.9) / Math.max(1, n - 1)), h = 0.9 + r() * 0.7; P.add(windMat(pick(r, CLOTHS)), hangFrom(box(x - 0.13, 2.0 - h, off(0.3) - 0.012, x + 0.13, 2.0, off(0.3) + 0.012), 2.0)); }
      P.add('wood_dark', box(-w / 2 + 0.3, 0.8, off(0.1), w / 2 - 0.3, 0.86, off(0.55)));
      for (let i = 0; i < 4; i++) P.add(pick(r, CLOTHS), box(-w / 2 + 0.4 + i * 0.7, 0.86, off(0.15), -w / 2 + 0.9 + i * 0.7, 0.98 + (i % 3) * 0.08, off(0.5)));
    } else if (tr === 'lantern') {
      for (const sx of [-1, 1]) P.add('timber', limb([sx * (w / 2 - 0.3), 0, off(0.3)], [sx * (w / 2 - 0.3), 2.2, off(0.3)], 0.04, 0.035, 5));
      P.add('timber', limb([-(w / 2 - 0.3), 2.2, off(0.3)], [(w / 2 - 0.3), 2.2, off(0.3)], 0.03, 0.03, 5));
      const n = Math.floor((w - 1.0) / 0.5);
      for (let i = 0; i < n; i++) { const x = -(w / 2 - 0.55) + i * ((w - 1.1) / Math.max(1, n - 1)), h = 0.3 + (i % 3) * 0.28; P.add('timber', box(x - 0.005, 2.2 - h, off(0.3) - 0.005, x + 0.005, 2.2, off(0.3) + 0.005)); P.add('lamp_paper', lathe([[0.001, 0], [0.12, 0.05], [0.15, 0.17], [0.12, 0.3], [0.001, 0.34]], 8, null, x, 2.2 - h - 0.34, off(0.3))); }
    } else {
      P.add('wood_dark', box(-w / 2 + 0.3, 0.78, off(0.0), w / 2 - 0.3, 0.84, off(0.6)));
      for (const sx of [-1, 1]) P.add('wood_dark', box(sx * (w / 2 - 0.45) - 0.04, 0, off(0.05), sx * (w / 2 - 0.45) + 0.04, 0.78, off(0.55)));
      for (let row = 0; row < 2; row++) for (let i = 0; i < Math.floor((w - 0.8) / 0.34); i++) { const x = -w / 2 + 0.5 + i * 0.34; P.add('lacquer_black', box(x - 0.05, 0.84, off(0.1 + row * 0.25), x + 0.05, 0.9, off(0.28 + row * 0.25))); P.add('cloth_white', box(x - 0.052, 0.84, off(0.1 + row * 0.25), x + 0.052, 0.846, off(0.28 + row * 0.25))); }
    }
  } else {
    // a trestle (the plank on two pairs of crossed legs) with the goods of the booth
    for (const sx of [-1, 1]) for (const sz of [0.12, 0.62]) P.add('wood_dark', box(sx * (w / 2 - 0.3) - 0.03, 0, off(sz) - 0.03, sx * (w / 2 - 0.3) + 0.03, 0.84, off(sz) + 0.03));
    P.add('wood_dark', box(-w / 2 + 0.1, 0.84, off(0.0), w / 2 - 0.1, 0.9, off(0.75)));
    P.add('wood_dark', box(-w / 2 + 0.3, 0.3, off(0.12), w / 2 - 0.3, 0.34, off(0.62)));
    // (the booth's goods are built about z = 0 over a counter of depth ±0.2)
    const G = new Parts(); boothGoods(G, tr, w, r);
    for (const [m, list] of G.m) for (const g of list) P.add(m, g.translate(0, 0, off(0.37)));
    if (tr === 'wine') for (let i = 0; i < 3; i++) P.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.04], [0.28, 0.36], [0.2, 0.62], [0.12, 0.72], [0.001, 0.72]], 10, null, -w / 2 + 0.5 + i * 0.75, 0, off(1.1)));
    if (tr === 'grain') for (let i = 0; i < 4; i++) P.add('sacking', ball(0.3, 0.34, 0.24, 8, 5).translate(-w / 2 + 0.5 + i * 0.7, 0.34 + (i === 2 ? 0.5 : 0), off(1.15)));
    if (tr === 'tea') { P.add('bronze', lathe([[0.001, 0], [0.2, 0.02], [0.26, 0.22], [0.18, 0.4], [0.07, 0.46], [0.001, 0.46]], 10, null, w / 2 - 0.5, 0, off(1.0))); P.add('brick_grey', box(w / 2 - 0.85, 0, off(0.7), w / 2 - 0.15, 0.4, off(1.3))); }
    if (tr === 'medicine') for (let i = 0; i < 3; i++) P.add('wicker', lathe([[0.001, 0], [0.3, 0.0], [0.34, 0.05], [0.001, 0.05]], 10, null, -w / 2 + 0.6 + i * 0.9, 0.34, off(0.37)));
  }
  // (the bench, the pots and baskets at the posts are the front's own: shopfront.js)
  P.emit(bag, el.at[0], el.y ?? 0.04, el.at[1], el.rot ?? 0);
  const c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0);
  for (let i = 0; i < Math.max(1, Math.floor(w / 0.9)); i++) { const lx = -w / 2 + 0.45 + i * 0.9; col?.circle?.(el.at[0] + lx * c + off(0.4) * s, el.at[1] - lx * s + off(0.4) * c, 0.45, el.y ?? 0, (el.y ?? 0) + 1.0); }
}

// ── in the street ────────────────────────────────────────────────────────────────
/**
 * bj_barber: { at, rot, seed } — the itinerant barber's stand (the "pole" of two chests): a red chest of drawers with the basin on a
 * charcoal brazier, a tall pole with a pennant, a stool for the customer (a man whose queue is being dressed), the barber at his back.
 */
export function bjBarber(el, ctx) {
  const { bag, col } = ctx, r = rng(el.seed || 1), P = new Parts();
  P.add('lacquer_red', box(-0.32, 0, -0.22, 0.32, 0.72, 0.22));
  for (let k = 0; k < 3; k++) { P.add('bronze', box(-0.28, 0.1 + k * 0.2, 0.222, 0.28, 0.12 + k * 0.2, 0.226)); P.add('bronze', box(-0.03, 0.14 + k * 0.2, 0.226, 0.03, 0.16 + k * 0.2, 0.24)); }
  P.add('wood_dark', box(-0.36, 0.72, -0.25, 0.36, 0.76, 0.25));
  P.add('iron', lathe([[0.001, 0.0], [0.16, 0.0], [0.2, 0.14], [0.001, 0.14]], 10, null, 0.5, 0.0, 0.0));             // the brazier of charcoal
  P.add('hide_black', lathe([[0.001, 0.12], [0.18, 0.12], [0.001, 0.15]], 10, null, 0.5, 0.0, 0.0));
  P.add('bronze', lathe([[0.001, 0.0], [0.17, 0.0], [0.24, 0.1], [0.23, 0.11], [0.001, 0.06]], 12, null, 0.5, 0.52, 0.0));
  for (const [dx, dz] of [[0.14, 0.14], [-0.14, 0.14], [0, -0.17]]) P.add('iron', limb([0.5 + dx, 0, dz], [0.5 + dx * 0.9, 0.52, dz * 0.9], 0.012, 0.012, 4));
  P.add('timber', limb([-0.55, 0, 0.1], [-0.55, 2.7, 0.1], 0.04, 0.03, 6));
  P.add(windMat('cloth_red'), hangFrom(box(-0.55, 2.0, 0.1, -0.52, 2.6, 0.55), 2.6));
  P.add('timber', box(-0.12, 0, 0.7, 0.16, 0.4, 0.96)); P.add('timber', box(-0.14, 0.4, 0.68, 0.18, 0.44, 0.98));
  for (const dx of [-0.1, 0.1]) P.add('timber', box(dx - 0.02, 0, 0.72, dx + 0.02, 0.4, 0.74));
  P.add('glaze_white', lathe([[0.001, 0], [0.12, 0], [0.16, 0.06], [0.001, 0.06]], 10, null, 0.0, 0.76, 0.0));
  P.emit(bag, el.at[0], el.y ?? 0.03, el.at[1], el.rot ?? 0);
  person(el, ctx, 0.0, 0.88, { pose: 'sit', cloth: 'cloth_grey', seat: 0.4 }, 0);
  person(el, ctx, 0.2, 1.3, { pose: 'stand', cloth: 'cloth_indigo', hat: 'none' }, Math.PI);
  col?.circle?.(...placeAt(el, ctx, 0, 0.2), 0.6, el.y ?? 0, (el.y ?? 0) + 1);
  void r;
}

/** bj_teastall: { at, rot, seed } — a tea stall (chatan) under a mat roof: the long table with its bowls, a clay stove with the great kettle, two benches, drinkers. */
export function bjTeastall(el, ctx) {
  const { bag, col } = ctx, r = rng(el.seed || 1), P = new Parts(), w = 3.6, d = 2.4;
  for (const sx of [-1, 1]) { P.add('timber', limb([sx * (w / 2 - 0.1), 0, -0.1], [sx * (w / 2 - 0.1), 2.65, -0.1], 0.05, 0.045, 6)); P.add('timber', limb([sx * (w / 2 - 0.1), 0, d - 0.1], [sx * (w / 2 - 0.1), 2.15, d - 0.1], 0.05, 0.045, 6)); }
  const A = [-w / 2 - 0.2, 2.7, -0.2], B = [w / 2 + 0.2, 2.7, -0.2], C = [w / 2 + 0.2, 2.15, d + 0.3], D = [-w / 2 - 0.2, 2.15, d + 0.3];
  const lo = (v) => [v[0], v[1] - 0.03, v[2]];
  P.add('reed_mat', fromTriangles([...A, ...C, ...B, ...A, ...D, ...C, ...lo(A), ...lo(B), ...lo(C), ...lo(A), ...lo(C), ...lo(D)]));
  P.add('wood_dark', box(-w / 2 + 0.3, 0.8, 0.0, w / 2 - 1.1, 0.86, 0.7));
  for (const sx of [-w / 2 + 0.45, w / 2 - 1.25]) for (const sz of [0.05, 0.65]) P.add('wood_dark', box(sx - 0.03, 0, sz - 0.03, sx + 0.03, 0.8, sz + 0.03));
  for (let i = 0; i < 9; i++) P.add('glaze_white', lathe([[0.001, 0], [0.04, 0.005], [0.06, 0.05], [0.001, 0.05]], 8, null, -w / 2 + 0.55 + (i % 5) * 0.32, 0.86, 0.18 + Math.floor(i / 5) * 0.28));
  P.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.1], [0.05, 0.16], [0.001, 0.17]], 8, null, -w / 2 + 0.9, 0.86, 0.5)); P.add('pottery_dark', limb([-w / 2 + 0.99, 0.95, 0.5], [-w / 2 + 1.1, 1.0, 0.5], 0.015, 0.01, 4));
  // the stove and the kettle
  P.add('brick_grey', box(w / 2 - 0.95, 0, 0.0, w / 2 - 0.25, 0.7, 0.7)); P.add('iron', lathe([[0.001, 0.7], [0.2, 0.7], [0.001, 0.74]], 8, null, w / 2 - 0.6, 0, 0.35));
  P.add('bronze', lathe([[0.001, 0], [0.22, 0.0], [0.3, 0.2], [0.26, 0.4], [0.1, 0.5], [0.001, 0.52]], 12, null, w / 2 - 0.6, 0.74, 0.35));
  P.add('bronze', limb([w / 2 - 0.4, 1.05, 0.35], [w / 2 - 0.2, 1.2, 0.35], 0.03, 0.02, 4)); P.add('bronze', limb([w / 2 - 0.6, 1.2, 0.35], [w / 2 - 0.28, 1.22, 0.35], 0.012, 0.012, 4));
  P.add('brick_grey', box(w / 2 - 0.5, 0.7, 0.55, w / 2 - 0.4, 2.0, 0.65));                                                // the chimney pipe
  for (const z of [1.55, 2.0]) { P.add('timber', box(-1.2, 0.42, z - 0.12, 1.2, 0.46, z + 0.12)); for (const sx of [-1.1, 1.1]) P.add('timber', box(sx - 0.03, 0, z - 0.1, sx + 0.03, 0.42, z + 0.1)); }
  P.emit(bag, el.at[0], el.y ?? 0.03, el.at[1], el.rot ?? 0);
  for (const [lx, lz, p] of [[-0.7, 1.55, 'sit'], [0.5, 2.0, 'sit'], [0.3, 1.55, 'sit']]) if (r() < 0.85) person(el, ctx, lx, lz, { pose: p, cloth: pick(r, ['cloth_indigo', 'cloth_grey', 'cloth_brown']) }, 0);
  person(el, ctx, -0.5, -0.45, { pose: 'stand', cloth: 'cloth_white', cloth2: 'cloth_grey', over: 'apron' }, Math.PI);
  col?.circle?.(...placeAt(el, ctx, 0, 0.4), 1.5, el.y ?? 0, (el.y ?? 0) + 1.2);
}

/**
 * bj_watercart: { at, rot, seed, pusher } — the water-seller's barrow of Beijing (shuiche): one large wheel in the middle under a
 * wooden mudguard, a stave tub on each side, the shafts behind, resting on two short legs; the carrier by it.
 */
export function bjWatercart(el, ctx) {
  const { bag, col } = ctx, P = new Parts(), R = 0.5;
  wheelY(P, 'wood_dark', R, 0, R, 12);
  for (const sx of [-1, 1]) {
    const x = sx * 0.4;
    P.add('timber', lathe([[0.001, 0], [0.27, 0], [0.32, 0.3], [0.34, 0.6], [0.33, 0.85], [0.29, 0.85], [0.001, 0.82]], 12, null, x, 0.55, 0.05));
    for (const yy of [0.12, 0.5, 0.78]) P.add('iron', lathe([[0.3 + yy * 0.04, 0], [0.3 + yy * 0.04, 0.028], [0.001, 0.028]], 12, null, x, 0.55 + yy, 0.05));
    P.add('pottery_dark', lathe([[0.001, 0.82], [0.28, 0.82], [0.28, 0.85], [0.001, 0.85]], 12, null, x, 0.55, 0.05).translate(0, 0.0, 0));
    P.add('timber', box(sx * 0.4 - 0.3, 0.5, -0.38, sx * 0.4 + 0.3, 0.57, 0.5));
    P.add('wood_dark', limb([sx * 0.31, 0.57, 0.3], [sx * 0.34, 0.65, 1.55], 0.032, 0.026, 5));
    P.add('wood_dark', limb([sx * 0.3, 0.55, -0.35], [0, R + 0.02, -0.0], 0.025, 0.025, 4));
    P.add('wood_dark', limb([sx * 0.33, 0.0, 1.05], [sx * 0.33, 0.62, 1.05], 0.03, 0.03, 4));
  }
  P.add('wood_dark', box(-0.46, R + 0.38, -0.5, 0.46, R + 0.42, 0.5)); for (const sz of [-0.5, 0.5]) P.add('wood_dark', box(-0.46, R + 0.0, sz - 0.02, 0.46, R + 0.42, sz + 0.02));
  P.add('rope_fibre', limb([-0.35, 0.6, 1.5], [0.35, 0.6, 1.5], 0.01, 0.01, 4));
  P.emit(bag, el.at[0], el.y ?? 0.03, el.at[1], el.rot ?? 0);
  if (el.pusher !== false) person(el, ctx, 0, 1.9, { pose: 'stand', dress: 'trousers', cloth: 'cloth_brown', hat: 'none', carry: 'none' }, 0);
  col?.circle?.(...placeAt(el, ctx, 0, 0.5), 0.95, el.y ?? 0, (el.y ?? 0) + 1.3);
}

/**
 * bj_sedan: { at, rot, seed, tone } — a sedan chair (jiaozi) set down on its two trestles: the cab with the curtain at the front under a
 * hipped cloth roof, the two long carrying poles, the bearers squatting by it. A blue one for an official, a green one for the rank of the next.
 */
export function bjSedan(el, ctx) {
  const { bag, col } = ctx, r = rng(el.seed || 1), P = new Parts(), cloth = el.tone ?? pick(r, ['cloth_indigo', 'cloth_green', 'cloth_blue']);
  const y0 = 0.62;
  for (const sz of [-0.8, 0.8]) { P.add('wood_dark', box(-0.62, 0, sz - 0.04, 0.62, 0.06, sz + 0.04)); for (const sx of [-0.5, 0.5]) { P.add('wood_dark', limb([sx, 0.05, sz], [sx * 0.55, y0 - 0.06, sz], 0.03, 0.025, 5)); } P.add('wood_dark', box(-0.4, y0 - 0.08, sz - 0.05, 0.4, y0 - 0.02, sz + 0.05)); }
  for (const sx of [-0.36, 0.36]) P.add('timber', rod([sx, y0, -1.7], [sx, y0, 1.7], 0.04, 6));
  P.add('lacquer_black', box(-0.5, y0 + 0.02, -0.55, 0.5, y0 + 0.12, 0.55));
  const W = 0.46, Lh = 0.55, H = 1.3;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add('lacquer_black', box(sx * W - 0.03, y0 + 0.12, sz * Lh - 0.03, sx * W + 0.03, y0 + 0.12 + H, sz * Lh + 0.03));
  for (const sx of [-1, 1]) P.add(cloth, box(sx * W - 0.012 - (sx > 0 ? 0.0 : 0.0), y0 + 0.2, -Lh + 0.03, sx * W + 0.012, y0 + 0.12 + H - 0.1, Lh - 0.03));
  P.add(cloth, box(-W + 0.03, y0 + 0.2, Lh - 0.012, W - 0.03, y0 + 0.12 + H - 0.1, Lh + 0.012));
  P.add('cloth_red', box(-W + 0.05, y0 + 0.2, -Lh - 0.012, W - 0.05, y0 + 0.12 + H - 0.12, -Lh + 0.01));       // the curtain at the front
  P.add('lacquer_red', box(-W + 0.05, y0 + 0.12 + H - 0.22, -Lh - 0.016, W - 0.05, y0 + 0.12 + H - 0.1, -Lh - 0.004));
  // the hipped roof: a low pyramid of the cloth over the frame, a gilt finial on its top
  const yt = y0 + 0.12 + H, a = [-W - 0.12, yt - 0.02, -Lh - 0.14], b = [W + 0.12, yt - 0.02, -Lh - 0.14], c = [W + 0.12, yt - 0.02, Lh + 0.14], dd = [-W - 0.12, yt - 0.02, Lh + 0.14], top = [0, yt + 0.28, 0];
  const t = []; for (const [p, q] of [[a, b], [b, c], [c, dd], [dd, a]]) { t.push(...p, ...top, ...q); t.push(...p, ...q, ...top); }
  t.push(...a, ...b, ...c, ...a, ...c, ...dd);
  P.add(cloth, fromTriangles(t));
  P.add('gilt_bronze', ball(0.05, 0.07, 0.05, 6, 4).translate(0, yt + 0.32, 0));
  P.emit(bag, el.at[0], el.y ?? 0.03, el.at[1], el.rot ?? 0);
  for (const [lx, lz, f] of [[-0.8, -2.1, 0], [0.9, 2.2, Math.PI]]) person(el, ctx, lx, lz, { pose: 'squat', dress: 'trousers', cloth: 'cloth_brown', hat: 'none' }, f);
  col?.circle?.(...placeAt(el, ctx, 0, 0), 0.9, el.y ?? 0, (el.y ?? 0) + 1.8);
}

// ── at the gates of the hutong ────────────────────────────────────────────────────
/** The coal-ball stack (meiqiu): a stepped cone of black balls, a few fallen about its foot. */
function coalStack(P, x, z, s, r) {
  P.add('hide_black', lathe([[0.55 * s, 0], [0.55 * s, 0.1 * s], [0.46 * s, 0.12 * s], [0.46 * s, 0.28 * s], [0.36 * s, 0.3 * s], [0.36 * s, 0.46 * s], [0.24 * s, 0.48 * s], [0.24 * s, 0.6 * s], [0.1 * s, 0.62 * s], [0.001, 0.66 * s]], 12, (th, i) => 0.92 + 0.1 * Math.sin(th * 5 + i * 2), x, 0, z));
  for (let k = 0; k < 7; k++) { const a = r() * 6.28, q = (0.6 + r() * 0.35) * s; P.add('hide_black', ball(0.035, 0.03, 0.035, 5, 3).translate(x + Math.cos(a) * q, 0.03, z + Math.sin(a) * q * 0.7)); }
}
/** The winter cabbages (dabaicai) heaped against the wall, a mat of straw over the top. */
function cabbages(P, x, z, r, rows = 3) {
  for (let row = 0; row < rows; row++) for (let k = 0; k < 6 - row * 1.5; k++) {
    const cx = x + (k - (5 - row * 1.5) / 2) * 0.27 + (r() - 0.5) * 0.05, cy = 0.14 + row * 0.2;
    P.add('cloth_green', ball(0.13, 0.19, 0.13, 6, 4).translate(cx, cy + 0.04, z + row * 0.07 + (r() - 0.5) * 0.04));
    P.add('cloth_white', ball(0.09, 0.1, 0.09, 5, 3).translate(cx, cy - 0.06, z + row * 0.07 + 0.02));
  }
  P.add('reed_mat', box(x - 0.9, 0.62, z - 0.25, x + 0.9, 0.655, z + 0.22));
  P.add('reed_mat', fromTriangles([x - 0.9, 0.66, z + 0.22, x - 0.9, 0.2, z + 0.5, x + 0.9, 0.2, z + 0.5, x - 0.9, 0.66, z + 0.22, x + 0.9, 0.2, z + 0.5, x + 0.9, 0.66, z + 0.22, x - 0.9, 0.66, z + 0.22, x + 0.9, 0.2, z + 0.5, x - 0.9, 0.2, z + 0.5, x - 0.9, 0.66, z + 0.22, x + 0.9, 0.66, z + 0.22, x + 0.9, 0.2, z + 0.5]));
}
function vat(P, x, z, s = 1) {
  P.add('pottery_dark', lathe([[0.2, 0], [0.3, 0.12], [0.36, 0.34], [0.37, 0.5], [0.34, 0.62], [0.355, 0.64], [0.355, 0.67], [0.001, 0.67]].map(([a, b]) => [a * s, b * s]), 12, null, x, 0, z));
  for (let k = 0; k < 3; k++) P.add('timber', box(x - 0.36 * s + k * 0.24 * s, 0.67 * s, z - 0.3 * s, x - 0.36 * s + (k + 1) * 0.24 * s - 0.01, 0.7 * s, z + 0.3 * s));
}
function firewood(P, x, z, L, r) {
  for (let row = 0; row < 4; row++) for (let k = 0; k < 7 - row; k++) {
    const rr = 0.06 + r() * 0.025;
    P.add('bark_pine', lathe([[rr, 0], [rr, L * (0.85 + r() * 0.2)], [0.001, L * (0.85 + r() * 0.2)]], 5).rotateZ(Math.PI / 2).translate(x - L / 2, 0.07 + row * 0.115, z + (k - (6 - row) / 2) * 0.14));
  }
}
function birdcage(P, x, z, r) {
  const y = 1.75;
  P.add('iron', limb([x, 2.15, 0.0], [x, 2.15, z], 0.014, 0.012, 4)); P.add('iron', limb([x, 2.15, z], [x, 2.0, z], 0.01, 0.01, 4)); P.add('iron', limb([x, 1.82, 0.0], [x, 2.15, 0.0], 0.012, 0.012, 4));
  P.add('lacquer_black', lathe([[0.001, 0], [0.17, 0], [0.17, 0.03], [0.001, 0.03]], 10, null, x, y, z));
  P.add('lacquer_black', lathe([[0.17, 0.34], [0.12, 0.4], [0.05, 0.43], [0.001, 0.45]], 10, null, x, y, z));
  P.add('lacquer_black', lathe([[0.17, 0.33], [0.17, 0.36], [0.001, 0.36]], 10, null, x, y, z));
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; P.add('bamboo_culm', limb([x + Math.cos(a) * 0.16, y + 0.03, z + Math.sin(a) * 0.16], [x + Math.cos(a) * 0.16, y + 0.34, z + Math.sin(a) * 0.16], 0.004, 0.004, 3)); }
  P.add('bamboo_culm', limb([x - 0.16, y + 0.12, z], [x + 0.16, y + 0.12, z], 0.005, 0.005, 3));
  P.add(r() < 0.5 ? 'hide_brown' : 'hide_grey', ball(0.045, 0.04, 0.04, 6, 4).translate(x + 0.02, y + 0.16, z)); P.add('hide_brown', ball(0.025, 0.025, 0.025, 5, 3).translate(x + 0.06, y + 0.2, z));
  P.add('lacquer_black', limb([x, y + 0.45, z], [x, 2.0, z], 0.006, 0.006, 3));
}
function toys(P, x, z, r) {
  // a bamboo hoop with its pushing stick leaned on the wall, a little stool, a top and a cloth ball
  P.add('bamboo_culm', T(torus(0.27, 0.012, 14, 4).rotateX(Math.PI / 2 - 0.12), x, 0.28, z));
  P.add('bamboo_culm', limb([x + 0.32, 0.0, z - 0.05], [x + 0.5, 0.95, z - 0.2], 0.012, 0.01, 4));
  P.add('timber', box(x - 0.9, 0.18, z - 0.1, x - 0.55, 0.21, z + 0.18)); for (const sx of [-0.87, -0.58]) for (const sz of [-0.07, 0.15]) P.add('timber', box(x + sx - 0.015, 0, z + sz - 0.015, x + sx + 0.015, 0.18, z + sz + 0.015));
  P.add('wood_dark', lathe([[0.001, 0], [0.04, 0.05], [0.001, 0.08]], 6, null, x + 0.1, 0, z + 0.3));
  P.add(pick(r, ['cloth_red', 'cloth_ochre']), ball(0.06, 0.06, 0.06, 6, 4).translate(x + 0.4, 0.06, z + 0.35));
}

/**
 * bj_lane: { at: [x, z] (the gate's x, the wall's lane face), seed, west (how far the row reaches), lod } — what the household of a
 * lane gate put out: a choice of the coal stack, the cabbage heap, firewood, the water vat, a bird cage on its bracket, the children's things,
 * along the foot of the wall west of the gate. Local frame: +x east, +z out into the lane.
 */
export function bjLane(el, { bag, col }) {
  const r = rng(el.seed || 1), P = new Parts();
  const slots = []; for (let k = 0; k < 6; k++) slots.push(-3.4 - k * 2.2);
  const kinds = ['coal', 'cabbage', 'wood', 'vat', 'cage', 'toys', 'coal', 'cabbage'];
  const n = el.lod >= 2 ? 2 : 3 + Math.floor(r() * 3);
  let used = 0;
  for (let k = 0; k < slots.length && used < n; k++) {
    if (r() < 0.12) continue;
    const x = slots[k] + (r() - 0.5) * 0.3, kind = kinds[Math.floor(r() * kinds.length)];
    used++;
    if (kind === 'coal') { coalStack(P, x, 0.62, 0.9 + r() * 0.4, r); if (r() < 0.5) coalStack(P, x + 1.0, 0.55, 0.7, r); col?.circle?.(el.at[0] + x, el.at[1] + 0.62, 0.55, 0, 0.7); }
    else if (kind === 'cabbage') { cabbages(P, x, 0.4, r, 3); col?.rect?.([el.at[0] + x - 0.9, el.at[1] + 0.1, el.at[0] + x + 0.9, el.at[1] + 0.9], 0, 0.65); }
    else if (kind === 'wood') { firewood(P, x, 0.32, 1.6, r); col?.rect?.([el.at[0] + x - 0.8, el.at[1], el.at[0] + x + 0.8, el.at[1] + 0.85], 0, 0.6); }
    else if (kind === 'vat') { vat(P, x, 0.55); if (r() < 0.6) vat(P, x + 0.85, 0.5, 0.85); col?.circle?.(el.at[0] + x, el.at[1] + 0.55, 0.38, 0, 0.7); }
    else if (kind === 'cage') birdcage(P, x, 0.46, r);
    else toys(P, x, 0.55, r);
  }
  P.emit(bag, el.at[0], 0.03, el.at[1], 0);
}

/** bj_lane_cat: a cat sitting on the wall's coping, or a dog by the gate, for lane gates; drawn by the engine's animal. */
export function bjPet(el, ctx) { animal({ t: 'animal', kind: el.kind ?? 'dog', at: el.at, y: el.y ?? 0.03, rot: el.rot ?? 0, seed: el.seed, graze: false }, ctx); }

// ── between the gates (§29) ───────────────────────────────────────────────────────────────────────
/** bj_shrine: a street shrine to the earth god (tudi miao) at the lane's edge: a brick niche under a small grey-tiled roof, a red cloth and couplets, the incense bowl before it. */
export function bjShrine(el, { bag, col }) {
  const r = rng(el.seed || 1), P = new Parts();
  P.add('granite_grey', box(-0.55, 0, 0.1, 0.55, 0.2, 0.95));
  P.add('brick_grey', box(-0.46, 0.2, 0.18, 0.46, 1.12, 0.78));
  P.add('lacquer_black', box(-0.27, 0.34, 0.76, 0.27, 1.0, 0.805));                             // the niche
  P.add('cloth_red', box(-0.3, 0.3, 0.8, 0.3, 0.34, 0.835));
  P.add('paint_ochre', box(-0.14, 0.42, 0.806, 0.14, 0.9, 0.826));                               // the little tablet
  for (const sx of [-1, 1]) P.add('cloth_red', box(sx * 0.37 - 0.035, 0.45, 0.78, sx * 0.37 + 0.035, 1.0, 0.8));   // the couplet
  // the roof: two eaves of grey tile and a ridge, the front eave swept out
  P.add('tile_grey', box(-0.6, 1.12, 0.08, 0.6, 1.2, 0.98)); P.add('tile_grey', box(-0.5, 1.2, 0.16, 0.5, 1.28, 0.9)); P.add('tile_grey', box(-0.52, 1.28, 0.4, 0.52, 1.36, 0.66));
  P.add('tile_grey', box(-0.58, 1.36, 0.46, 0.58, 1.42, 0.6));
  // the incense bowl on its flat stone, the sticks burning down, an offering of three apples
  P.add('granite_grey', box(-0.3, 0, 0.95, 0.3, 0.1, 1.35));
  P.add('pottery_dark', lathe([[0.09, 0], [0.12, 0.06], [0.14, 0.12], [0.001, 0.12]], 8, null, 0, 0.1, 1.15));
  for (let k = 0; k < 5; k++) P.add('timber', limb([-0.06 + k * 0.03, 0.2, 1.15 + (r() - 0.5) * 0.04], [-0.06 + k * 0.03 + (r() - 0.5) * 0.03, 0.42, 1.15], 0.004, 0.004, 3));
  for (let k = 0; k < 3; k++) P.add('cloth_red', ball(0.04, 0.04, 0.04, 5, 3).translate(0.12 + k * 0.1, 0.14, 1.2));
  col?.rect?.([el.at[0] - 0.6, el.at[1] + 0.08, el.at[0] + 0.6, el.at[1] + 1.0], 0, 1.4);
  P.emit(bag, el.at[0], 0.03, el.at[1], 0);
}
/** bj_benchtree: the tree's pit (a ring of brick) with a long stone bench round its south side, a low table with a pot of tea and two stools. The tree is the planting's. */
export function bjBenchtree(el, { bag, col }) {
  const r = rng(el.seed || 1), P = new Parts(), cx = 1.6, cz = 0.7;
  P.add('brick_grey', lathe([[1.05, 0], [1.05, 0.2], [0.93, 0.2], [0.93, 0.0]], 16, null, cx, 0, cz));
  // the bench: a granite slab on two blocks
  for (const sx of [-1, 1]) P.add('granite_grey', box(cx + sx * 1.15 - 0.12, 0, cz + 1.3, cx + sx * 1.15 + 0.12, 0.42, cz + 1.7));
  P.add('granite_grey', box(cx - 1.5, 0.42, cz + 1.25, cx + 1.5, 0.5, cz + 1.75));
  // the table, its pot and cups, two stools
  P.add('wood_dark', box(cx + 2.2, 0.38, cz + 0.3, cx + 3.0, 0.43, cz + 0.9));
  for (const [sx, sz] of [[2.25, 0.35], [2.95, 0.35], [2.25, 0.85], [2.95, 0.85]]) P.add('wood_dark', box(cx + sx - 0.025, 0, cz + sz - 0.025, cx + sx + 0.025, 0.38, cz + sz + 0.025));
  P.add('pottery_dark', lathe([[0.001, 0], [0.07, 0.02], [0.08, 0.1], [0.05, 0.13], [0.001, 0.14]], 8, null, cx + 2.5, 0.43, cz + 0.6));
  for (let k = 0; k < 3; k++) P.add('glaze_white', lathe([[0.001, 0], [0.025, 0.01], [0.035, 0.05], [0.001, 0.05]], 6, null, cx + 2.7 + k * 0.1, 0.43, cz + 0.7));
  for (const [sx, sz] of [[2.6, 1.2], [2.6, -0.1]]) { P.add('timber', box(cx + sx - 0.17, 0.3, cz + sz - 0.17, cx + sx + 0.17, 0.34, cz + sz + 0.17)); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.add('timber', box(cx + sx + a * 0.14 - 0.02, 0, cz + sz + b * 0.14 - 0.02, cx + sx + a * 0.14 + 0.02, 0.3, cz + sz + b * 0.14 + 0.02)); }
  col?.rect?.([el.at[0] + cx - 1.5, el.at[1] + cz + 1.25, el.at[0] + cx + 1.5, el.at[1] + cz + 1.75], 0, 0.5);
  void r;
  P.emit(bag, el.at[0], 0.03, el.at[1], 0);
}
/** bj_coalcart: the coal seller's cart: a two-wheeled flatbed loaded with sacks and coal balls, its shafts to the left for the donkey (set by the life plan at +x). */
export function bjCoalcart(el, { bag, col }) {
  const r = rng(el.seed || 1), P = new Parts(), zc = 1.5, y = 0.62;
  P.add('timber', box(-0.95, y, zc - 0.5, 0.95, y + 0.07, zc + 0.5));
  for (const sz of [-1, 1]) P.add('timber', box(-0.95, y + 0.07, zc + sz * 0.5 - 0.02, 0.95, y + 0.3, zc + sz * 0.5 + 0.02));
  P.add('timber', box(-0.95, y - 0.1, zc - 0.05, 0.95, y, zc + 0.05));                                      // the axle beam
  P.add('timber', limb([0.95, y + 0.1, zc - 0.3], [2.6, y - 0.05, zc - 0.3], 0.035, 0.03, 5)); P.add('timber', limb([0.95, y + 0.1, zc + 0.3], [2.6, y - 0.05, zc + 0.3], 0.035, 0.03, 5));
  for (const sz of [-1, 1]) {
    const w = new Parts(); wheelY(w, 'timber', 0.5, 0, 0.5, 12); w.emit(bag, el.at[0] + 0.0 + 0, 0.03, el.at[1] + zc + sz * 0.62, Math.PI / 2);
  }
  // the load: sacks of coal dust and a pile of coal balls
  for (let k = 0; k < 6; k++) { const x = -0.7 + (k % 3) * 0.55, z = zc + (k < 3 ? -0.22 : 0.22); P.add('hide_black', ball(0.26, 0.15, 0.2, 7, 4).translate(x, y + 0.2, z)); }
  for (let k = 0; k < 3; k++) P.add('hide_black', ball(0.24, 0.14, 0.19, 7, 4).translate(-0.5 + k * 0.5, y + 0.36, zc + (r() - 0.5) * 0.1));
  // coal balls stacked on the ground beside it
  const Q = new Parts(); coalStack(Q, 0, 0, 0.9, r); Q.emit(bag, el.at[0] - 1.9, 0.03, el.at[1] + 0.9, 0);
  col?.rect?.([el.at[0] - 1.0, el.at[1] + zc - 0.6, el.at[0] + 2.6, el.at[1] + zc + 0.6], 0, 0.8);
  P.emit(bag, el.at[0], 0.03, el.at[1], 0);
}
