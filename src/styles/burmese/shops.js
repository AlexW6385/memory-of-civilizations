// The shops and small buildings of Pagan (docs/settlements/bagan.md §6): the market shop-house on the main roads (a raised plank floor under a deep thatch roof, the front open to the road with its
// counter, hanging goods and sign, the trade's goods on the shelves inside, a bench and a lamp), and the brick library (pitakat taik) with its shelves of palm-leaf manuscripts.
import { rng, archWall, vault } from './kit.js';
import { lotFrame, gable } from './houses.js';
import { pot, hangBasket, sign, bench, offering, shelf, laundryLine } from './detail.js';

const TRADES = ['lacquer', 'pottery', 'cloth', 'offerings', 'betel', 'rice', 'tea', 'parasols'];
const SIGN = { lacquer: 'lacquer_red', pottery: 'paint_ochre', cloth: 'paint_blue', offerings: 'cloth_green', betel: 'paint_ochre', rice: 'cloth_ochre', tea: 'lacquer_red', parasols: 'cloth_red' };

/** The goods of a trade on a counter (u0..u1 along, at height y, depth v) and on shelves. */
function goods(F, trade, a0, a1, c, y, r, axis = 'u', step = 0.42) {
  const n = Math.max(2, Math.floor((a1 - a0) / step));
  for (let i = 0; i < n; i++) {
    const a = a0 + 0.25 + i * ((a1 - a0 - 0.5) / Math.max(1, n - 1)), k = i % 3, [u, v] = axis === 'u' ? [a, c] : [c, a];
    switch (trade) {
      case 'lacquer': F.lathe(k === 1 ? 'lacquer_black' : 'lacquer_red', [[0.1, 0], [0.16, 0.04], [0.19, 0.15], [0.17, 0.15], [0.001, 0.15]], u, y, v, 8); if (k === 0) F.lathe('lacquer_red', [[0.1, 0], [0.12, 0.2], [0.07, 0.3], [0.001, 0.32]], u, y + 0.15, v, 8); break;
      case 'pottery': pot(F, u, y, v, 0.8 + (k * 0.2), k === 1 ? 'pottery_dark' : 'terracotta'); break;
      case 'cloth': F.b(['cloth_red', 'cloth_green', 'cloth_white', 'cloth_indigo', 'cloth_ochre'][(i + Math.floor(r() * 5)) % 5], u - 0.17, y, v - 0.2, u + 0.17, y + 0.12 + 0.06 * k, v + 0.2, false); break;
      case 'offerings': F.lathe(k === 0 ? 'cloth_white' : k === 1 ? 'cloth_ochre' : 'cloth_green', [[0.1, 0], [0.13, 0.06], [0.001, 0.12]], u, y, v, 6); F.b('paint_ochre', u + 0.14, y, v - 0.02, u + 0.18, y + 0.22, v + 0.02, false); break;
      case 'betel': F.b('lacquer_red', u - 0.13, y, v - 0.13, u + 0.13, y + 0.2, v + 0.13, false); F.b('gilt_bronze', u - 0.14, y + 0.2, v - 0.14, u + 0.14, y + 0.23, v + 0.14, false); break;
      case 'rice': F.lathe('sacking', [[0.18, 0], [0.24, 0.1], [0.2, 0.3], [0.12, 0.4], [0.001, 0.42]], u, y, v, 8); break;
      case 'tea': F.lathe(k === 0 ? 'bronze' : 'pottery_dark', [[0.09, 0], [0.14, 0.08], [0.1, 0.2], [0.001, 0.22]], u, y, v, 8); break;
      case 'parasols': F.lathe(['cloth_red', 'cloth_ochre', 'cloth_green'][k], [[0.02, 0], [0.34, 0.06], [0.3, 0.09], [0.001, 0.12]], u, y + 0.04, v, 10); break;
      default: break;
    }
  }
}

/**
 * bgn_shop: { rect, front, seed, trade } — a market shop-house on a main road. The lot's width is the shop's width (the fronts run on); a raised plank floor (0.55 m) under a deep thatch
 * roof, the front open: two posts and a beam, a counter with the day's goods, awning and hanging goods, the sign; inside shelves of the trade along the sides, a bench, a sleeping platform
 * at the back, a lamp. The shop is 9 m deep; what lies behind is the owner's house (town.js).
 */
export function shop(el, ctx) {
  const F = lotFrame(ctx, el.rect, el.front), r = rng(el.seed ?? 3), W = F.W, trade = el.trade ?? TRADES[Math.floor(r() * TRADES.length)];
  const fl = 0.55, wh = 2.9, v0 = 0.5, v1 = 9.2, t = 0.14, u0 = 0.1, u1 = W - 0.1;
  const tint = r() < 0.5 ? 'planks_grey' : 'wood_ochre';
  // the front's design (town.js gives the shops along a road in turn 0..3): 0 the open counter, 1 the plank front with its shutter propped as a canopy, 2 the screened porch on red posts, 3 the two-storey front with a loft window
  const V = (el.variant ?? 0) % 4, ext = V === 3 ? 2.0 : 0, H = wh + ext;
  // the footing and floor
  F.b('brick', u0, 0, v0, u1, fl - 0.1, v1, false);
  F.b('wood_ochre', u0, fl - 0.1, v0, u1, fl, v1, false); F.floor(u0, v0, u1, v1, fl);
  // the front step along the whole front and the walls: sides shared with the neighbours, a back wall
  F.b('brick', u0 + 0.2, 0, -1.0, u1 - 0.2, fl * 0.5, v0, false); F.b('brick', u0 + 0.2, 0, -0.25, u1 - 0.2, fl, v0, false);
  F.ramp(u0 + 0.2, -1.0, u1 - 0.2, v0, 0, fl, 1);
  F.b(tint, u0, fl, v1 - t, u1, fl + H, v1, true);
  F.b(tint, u0, fl, v0 + 1.6, u0 + t, fl + H, v1, true); F.b(tint, u1 - t, fl, v0 + 1.6, u1, fl + H, v1, true);
  F.b(tint, u0, fl, v0, u0 + t, fl + H, v0 + 1.6, true); F.b(tint, u1 - t, fl, v0, u1, fl + H, v0 + 1.6, true);
  // the front: two posts, the beam, the counter under it with a gap for the door at one side
  const dpos = r() < 0.5 ? u0 + 1.2 : u1 - 1.2;
  for (const u of [u0 + 0.2, (u0 + u1) / 2, u1 - 0.2]) F.b('timber', u - 0.09, fl, v0 - 0.09, u + 0.09, fl + wh, v0 + 0.09, false);
  F.b('wood_dark', u0, fl + wh - 0.55, v0 - 0.1, u1, fl + wh - 0.1, v0 + 0.1, false);
  const c0 = dpos < W / 2 ? dpos + 0.7 : u0 + 0.4, c1 = dpos < W / 2 ? u1 - 0.4 : dpos - 0.7;
  F.b('wood_ochre', c0, fl, v0 - 0.45, c1, fl + 0.9, v0 - 0.05, true);
  F.b('wood_dark', c0 - 0.03, fl + 0.88, v0 - 0.5, c1 + 0.03, fl + 0.95, v0, false);
  goods(F, trade, c0, c1, v0 - 0.25, fl + 0.95, r);
  // the deep roof, an awning of cloth over the counter, goods hung from the beam
  gable(F, 'thatch_palm', u0 - 0.15, u1 + 0.15, v0 - 1.3, v1 + 0.5, fl + H, (V === 3 ? 2.6 : V === 2 ? 1.6 : 2.0) + 0.2 * r(), true);
  const aw = trade === 'parasols' || trade === 'cloth' ? 'cloth_red' : r() < 0.5 ? 'cloth_ochre' : 'cloth_white';
  F.b(aw, c0 - 0.1, fl + 2.15, v0 - 1.25, c1 + 0.1, fl + 2.22, v0 - 0.2, false);
  for (let u = c0; u < c1 - 0.2; u += 0.5) F.b(aw, u, fl + 1.95, v0 - 1.27, u + 0.28, fl + 2.15, v0 - 1.25, false);
  const hang = trade === 'pottery' || trade === 'offerings' ? 'wicker' : trade === 'parasols' ? 'cloth_green' : 'wicker';
  for (let u = c0 + 0.5; u < c1 - 0.3; u += 1.1) hangBasket(F, u, fl + 1.8, v0 - 0.8, 1.0, hang);
  sign(F, (u0 + u1) / 2 + (r() - 0.5) * 1.2, fl + 2.45, v0 - 1.0, 1.1, SIGN[trade] ?? 'paint_ochre');
  if (V === 1) {
    // the plank front closed above the counter but for a wide window, its shutter leaf propped up on two sticks as a canopy over the goods; the door gap beside it stays
    const wm = (c0 + c1) / 2, ww = Math.min(1.5, (c1 - c0) * 0.4), y0 = fl + 0.95, y1 = fl + wh - 0.55;
    for (const [a, b] of [[c0, wm - ww / 2], [wm + ww / 2, c1]]) F.b(tint, a, y0, v0 - 0.04, b, y1, v0 + 0.06, true);
    F.b(tint, wm - ww / 2, fl + 2.05, v0 - 0.04, wm + ww / 2, y1, v0 + 0.06, true);
    F.b('planks_grey', wm - ww / 2 - 0.05, fl + 2.0, v0 - 0.9, wm + ww / 2 + 0.05, fl + 2.06, v0 - 0.08, false);
    for (const u of [wm - ww / 2, wm + ww / 2]) F.b('bamboo_culm', u - 0.02, fl + 0.95, v0 - 0.86, u + 0.02, fl + 2.0, v0 - 0.82, false);
    F.b('lacquer_red', c0 - 0.05, fl + 0.9, v0 - 0.5, c1 + 0.05, fl + 0.95, v0 + 0.02, false);
  } else if (V === 2) {
    // a screened porch: the posts painted red, a rolled reed blind under the beam, a low basket-work screen below the counter's goods, a bench either side, a deeper porch roof
    for (const u of [u0 + 0.2, (u0 + u1) / 2, u1 - 0.2]) F.b('lacquer_red', u - 0.11, fl, v0 - 0.11, u + 0.11, fl + wh - 0.55, v0 + 0.11, false);
    F.b('reed_mat', c0, fl + wh - 0.95, v0 - 0.18, c1, fl + wh - 0.62, v0 - 0.05, false);
    F.b('wicker', c0, fl + 0.95, v0 - 0.12, c1, fl + 1.35, v0 - 0.06, false);
    gable(F, 'thatch_palm', c0 - 0.4, c1 + 0.4, v0 - 2.5, v0 - 1.1, fl + 2.45, 0.7, true);
    for (const u of [c0 - 0.2, c1 + 0.2]) F.b('bamboo_culm', u - 0.04, fl, v0 - 2.35, u + 0.04, fl + 2.45, v0 - 2.27, true);
    F.b('wood_ochre', c0, fl, v0 - 2.3, c1, fl + 0.4, v0 - 1.8, false);
  } else if (V === 3) {
    // the loft: the front carried up over the beam with a window, its shutters propped open, a rail across the sill, a hanging lantern
    const wm = (u0 + u1) / 2, y0 = fl + wh, y1 = fl + H;
    for (const [a, b] of [[u0, wm - 0.65], [wm + 0.65, u1]]) F.b(tint, a, y0, v0 - 0.06, b, y1, v0 + 0.08, true);
    F.b(tint, wm - 0.65, y0, v0 - 0.06, wm + 0.65, y0 + 0.65, v0 + 0.08, true); F.b(tint, wm - 0.65, y0 + 1.55, v0 - 0.06, wm + 0.65, y1, v0 + 0.08, true);
    for (const sg of [-1, 1]) F.b('wood_dark', wm + sg * 0.66 - 0.02, y0 + 0.65, v0 - 0.62, wm + sg * 0.66 + 0.02, y0 + 1.55, v0 - 0.06, false);
    F.b('timber', wm - 0.8, y0 + 0.62, v0 - 0.36, wm + 0.8, y0 + 0.68, v0 - 0.06, false);
    F.b('timber', wm - 0.8, y0 + 1.2, v0 - 0.38, wm + 0.8, y0 + 1.25, v0 - 0.34, false);
    F.b('lamp_paper', wm + 1.0, y0 + 0.3, v0 - 0.3, wm + 1.24, y0 + 0.62, v0 - 0.06, false);
  }
  // inside: shelves along the sides and back with the trade's goods, a bench, a stool, a lamp, the back platform for sleeping
  for (const side of [u0 + t, u1 - t]) {
    const sg = side < W / 2 ? 1 : -1;
    for (let k = 0; k < 3; k++) {
      const y = fl + 0.5 + k * 0.55;
      F.b('wood_dark', Math.min(side, side + sg * 0.4), y, v0 + 1.8, Math.max(side, side + sg * 0.4), y + 0.04, v1 - 0.4, false);
      goods(F, trade, v0 + 1.9, v1 - 0.6, side + sg * 0.2, y + 0.04, r, 'v', 0.8);
    }
  }
  for (let k = 0; k < 2; k++) {
    const y = fl + 0.5 + k * 0.55;
    F.b('wood_dark', u0 + 0.6, y, v1 - 0.45, u1 - 0.6, y + 0.04, v1 - t, false);
    goods(F, trade, u0 + 0.7, u1 - 0.7, v1 - 0.28, y + 0.04, r, 'u', 0.75);
  }
  bench(F, W / 2 - 0.8, v0 + 2.2, 1.6, fl);
  F.b('reed_mat', W / 2 - 1.2, fl, v0 + 3.4, W / 2 + 1.2, fl + 0.03, v0 + 5.2, false);
  F.b('wood_ochre', u0 + 0.4, fl, v1 - 2.2, u0 + 2.2, fl + 0.3, v1 - 0.6, false);
  F.b('cloth_red', u0 + 0.5, fl + 0.3, v1 - 2.1, u0 + 2.1, fl + 0.34, v1 - 0.7, false);
  shelf(F, W / 2, fl + 1.75, v1 - 0.18, 'u');
  F.b('lamp_paper', W / 2 - 0.12, fl + wh - 0.6, v0 + 3.4, W / 2 + 0.12, fl + wh - 0.3, v0 + 3.64, false);
  F.light(W / 2, fl + wh - 0.5, v0 + 4.0, '#ffb865', 4, 10);
  if (trade === 'tea') { F.b('wood_ochre', W / 2 + 1.4, fl, v0 + 2.0, W / 2 + 2.3, fl + 0.5, v0 + 2.8, false); for (const dv of [-0.3, 1.1]) F.b('wood_dark', W / 2 + 1.5, fl, v0 + 2.1 + dv, W / 2 + 1.9, fl + 0.3, v0 + 2.4 + dv, false); }
  void laundryLine; void offering;
}

/**
 * bgn_library: { c, rot, seed } — a brick library (pitakat taik): a square vaulted room 6 m, one pointed door, a limewashed stepped roof with a finial; inside shelves of palm-leaf manuscripts
 * wrapped in cloth, a reading mat. Enterable.
 */
export function library(el, ctx) {
  const rot = el.rot ?? 0, F = lotFrame(ctx, [el.c[0] - 3.8, el.c[1] - 3.8, el.c[0] + 3.8, el.c[1] + 3.8], ['s', 'w', 'n', 'e'][Math.round(((rot % (Math.PI * 2)) + Math.PI * 2) / (Math.PI / 2)) % 4]);
  const f = 0.5, h = 3.8, W = 7.6, D = 7.6, t = 0.7, r = rng(el.seed ?? 1);
  F.b('brick_baked', 0, 0, 0, W, f, D, false); F.floor(0.3, 0.3, W - 0.3, D - 0.3, f);
  archWall(F, 'brick', 0.3, W - 0.3, 0.3, 0.3 + t, f, f + h, [{ c: W / 2, w: 1.3, top: f + 2.9 }], 'limewash_white');
  F.b('brick', 0.3, f, D - 0.3 - t, W - 0.3, f + h, D - 0.3, true);
  F.b('brick', 0.3, f, 0.3 + t, 0.3 + t, f + h, D - 0.3 - t, true); F.b('brick', W - 0.3 - t, f, 0.3 + t, W - 0.3, f + h, D - 0.3 - t, true);
  vault(F, 'u', D / 2, (D - 2 * t - 0.6) / 2, 0.3 + t, W - 0.3 - t, f + 2.4, 1.4, 4, 'brick');
  F.b('limewash_white', 0.1, f + h, 0.1, W - 0.1, f + h + 0.3, D - 0.1, false);
  for (let i = 0; i < 3; i++) F.b('limewash_white', 0.7 + i * 0.8, f + h + 0.3 + i * 0.7, 0.7 + i * 0.8, W - 0.7 - i * 0.8, f + h + 1.0 + i * 0.7, D - 0.7 - i * 0.8, false);
  const [px, pz] = F.pt(W / 2, D / 2);
  F.bag.add('gilt_bronze', lathe2(px, f + h + 2.1, pz));
  // inside: shelves with bundles of palm-leaf books, a reading mat, a lamp
  for (const side of [0.3 + t, W - 0.3 - t]) {
    const sg = side < W / 2 ? 1 : -1;
    for (let k = 0; k < 3; k++) {
      const y = f + 0.5 + k * 0.7;
      F.b('wood_dark', Math.min(side, side + sg * 0.45), y, 1.8, Math.max(side, side + sg * 0.45), y + 0.04, D - 1.2, false);
      for (let v = 1.9; v < D - 1.4; v += 0.34) F.b(r() < 0.5 ? 'cloth_ochre' : 'cloth_red', Math.min(side, side + sg * 0.4), y + 0.04, v, Math.max(side, side + sg * 0.4), y + 0.2, v + 0.26, false);
    }
  }
  F.b('reed_mat', W / 2 - 0.9, f, 3.7, W / 2 + 0.9, f + 0.03, 5.3, false);
  F.b('wood_ochre', W / 2 - 0.5, f, 3.0, W / 2 + 0.5, f + 0.2, 3.6, false);
  F.light(W / 2, f + 2.8, D / 2, '#ffb865', 3, 9);
}
import { lathe } from '../../core/geom.js';
const lathe2 = (x, y, z) => lathe([[0.3, 0], [0.12, 0.3], [0.04, 0.7], [0.001, 1.1]], 8, null, x, y, z);
