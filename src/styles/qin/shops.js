// The shop-houses of the market (docs/settlements/qin-xianyang.md §6, §9): under the market wall, rows of shops (si) with an open
// front and a counter, a tiled roof, a cloth valance, the sign of the trade; inside the shelves, bins and hanging goods of the trade
// (wine, grain, cloth, pottery, bronze and iron, lacquer, salt and fish, leather and sandals, herbs). Always open to walk into.
import { box, lathe, addCloth, clothBox, frustum } from '../../core/geom.js';
import { rng } from '../../objects/kit.js';
import { frame, gable, JAR } from './houses.js';

export const TRADES = ['wine', 'grain', 'cloth', 'pottery', 'bronze', 'lacquer', 'salt', 'leather', 'herbs', 'cloth', 'wine', 'pottery'];
const VAL = { wine: 'cloth_white', grain: 'cloth_ochre', cloth: 'cloth_indigo', pottery: 'cloth_brown', bronze: 'cloth_red', lacquer: 'cloth_black', salt: 'cloth_grey', leather: 'cloth_brown', herbs: 'cloth_green' };

/** qin_shop: { rect, front, seed, trade } */
export function qinShop(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, T = el.trade ?? 'cloth', H = 3.5, th = 0.4;
  // floor, party walls, back wall
  F.b('brick_grey', 0, -0.02, 0, W, 0.04, D, false);
  F.b('earth_wall', 0, 0, 0, th, H, D); F.b('earth_wall', W - th, 0, 0, W, H, D); F.b('earth_wall', 0, 0, D - th, W, H, D);
  // front: corner posts, a middle post, the beam, a board wall above with the sign
  for (const u of [th + 0.15, W / 2 - 1.1, W / 2 + 1.1, W - th - 0.15]) F.b('timber_red', u - 0.14, 0, 0.05, u + 0.14, 2.7, 0.33);
  F.b('lacquer_black', 0, 2.7, -0.05, W, 3.0, 0.4, false); F.b('planks_grey', 0, 3.0, 0, W, H, 0.3, false);
  F.b('paint_ochre', 0, 3.0, -0.07, W, 3.06, 0.32, false);
  const sign = { wine: 'cloth_red', grain: 'cloth_ochre', cloth: 'cloth_indigo', pottery: 'cloth_brown', bronze: 'cloth_green', lacquer: 'cloth_red', salt: 'cloth_white', leather: 'cloth_brown', herbs: 'cloth_green' }[T];
  F.b('paint_white', W / 2 - 0.9, 3.08, -0.09, W / 2 + 0.9, 3.42, -0.06, false);                                    // the board that names the trade
  F.b('lacquer_black', W / 2 - 0.75, 3.15, -0.1, W / 2 + 0.75, 3.35, -0.08, false);
  // the counters either side of the entrance (the entrance 2.2 m), with a lacquered top, the balance on one
  for (const [a, b] of [[th + 0.3, W / 2 - 1.1], [W / 2 + 1.1, W - th - 0.3]]) { F.b('timber', a, 0, 0.1, b, 0.9, 0.7); F.b('lacquer_red', a - 0.04, 0.9, 0.06, b + 0.04, 0.95, 0.76, false); }
  const un = W / 2 + 1.5, vn = 0.4;
  F.b('timber', un - 0.03, 0.95, vn - 0.03, un + 0.03, 1.4, vn + 0.03, false); F.b('bronze', un - 0.3, 1.38, vn - 0.01, un + 0.3, 1.41, vn + 0.01, false);
  for (const s of [-1, 1]) F.b('bronze', un + s * 0.3 - 0.08, 1.1, vn - 0.08, un + s * 0.3 + 0.08, 1.14, vn + 0.08, false);
  // the roof of tile and the valance of cloth
  gable(F, 0, 0, W, D, H, 1.5, 'tile_grey', 0.6);
  for (let u = 0.2; u < W; u += 0.3) F.b('tile_dark', u - 0.06, H - 0.03, -0.62, u + 0.06, H + 0.12, -0.56, false);
  for (let u = 0.25; u < W; u += 0.42) F.b('timber', u - 0.04, H - 0.13, -0.6, u + 0.04, H - 0.04, 0.0, false);
  addCloth(bag, VAL[T], clothBox(F.X(0.1), H - 1.05, F.Z(-0.5) - 0.02, F.X(W - 0.1), H - 0.1, F.Z(-0.5) + 0.02), H - 0.1);
  // tie-beams and the ridge-pole under the roof, a lamp
  for (let v = 1.5; v < D - 0.5; v += 2.3) F.b('timber', th, H - 0.2, v - 0.08, W - th, H - 0.04, v + 0.08, false);
  F.b('timber', th, H + 1.2, D / 2 - 0.1, W - th, H + 1.35, D / 2 + 0.1, false);
  F.b('lacquer_black', W / 2 - 0.2, 0, D * 0.55 - 0.2, W / 2 + 0.2, 0.9, D * 0.55 + 0.2, false); F.lathe('bronze', [[0.001, 0.9], [0.12, 0.92], [0.14, 1.0], [0.001, 1.0]], W / 2, 0, D * 0.55, 8);
  // the shelves along the back wall and both sides: planks on posts, three tiers
  const shelf = (u0, v0, u1, v1, tiers = 3) => { for (let t = 0; t < tiers; t++) F.b('timber', u0, 0.45 + t * 0.6, v0, u1, 0.5 + t * 0.6, v1, false); for (const [a, b] of [[u0, v0], [u1 - 0.06, v1 - 0.06]]) F.b('timber', a, 0, b, a + 0.06, 0.5 + tiers * 0.6, b + 0.06, false); };
  const back = (fn, tiers = 3) => { shelf(th + 0.1, D - th - 0.5, W - th - 0.1, D - th - 0.05, tiers); for (let t = 0; t < tiers; t++) for (let u = th + 0.5; u < W - th - 0.4; u += 0.55) fn(u, 0.5 + t * 0.6, D - th - 0.28, t); };
  const sideShelf = (fn) => { for (const s of [0, 1]) { const ua = s ? W - th - 0.45 : th + 0.05; shelf(ua, 2.2, ua + 0.4, D - th - 0.7, 3); for (let t = 0; t < 3; t++) for (let v = 2.5; v < D - th - 1.0; v += 0.55) fn(s ? ua + 0.2 : ua + 0.2, 0.5 + t * 0.6, v, t); } };
  const bolt = (u, y, v, t) => F.b(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_maroon', 'cloth_black'][Math.floor(rand() * 7)], u - 0.22, y, v - 0.2, u + 0.22, y + 0.26 - (t === 2 ? 0.05 : 0), v + 0.2, false);
  const pot = (u, y, v) => F.lathe('terracotta', JAR(0.1 + 0.03 * rand()), u, y, v, 7);
  const vessel = (u, y, v) => F.lathe(rand() < 0.5 ? 'bronze' : 'iron', [[0.001, 0], [0.12, 0.02], [0.16, 0.12], [0.12, 0.2], [0.001, 0.2]], u, y, v, 8);
  const lac = (u, y, v) => F.b(rand() < 0.5 ? 'lacquer_red' : 'lacquer_black', u - 0.15, y, v - 0.12, u + 0.15, y + 0.18, v + 0.12, false);
  const sack = (u, y, v) => F.lathe('sacking', [[0.14, 0], [0.18, 0.1], [0.14, 0.3], [0.001, 0.36]], u, y, v, 7);
  const bundle = (u, y, v) => { F.lathe('thatch', [[0.001, 0], [0.1, 0.02], [0.1, 0.2], [0.001, 0.28]], u, y, v, 6); };
  const hang = (mat, n, h = 0.5) => { for (let k = 0; k < n; k++) { const u = th + 0.6 + k * (W - 2 * th - 1.2) / Math.max(1, n - 1), v = 1.8 + rand() * 1.2; F.b('rope_fibre', u - 0.01, 2.6, v, u + 0.01, 3.2, v + 0.02, false); F.b(mat, u - 0.1, 3.2 - h - 0.5, v - 0.1, u + 0.1, 2.6, v + 0.1, false); } };
  if (T === 'cloth') { back(bolt); sideShelf(bolt); F.b('timber', 1.0, 0, 3.0, 2.8, 0.85, 4.0); F.b('cloth_white', 1.1, 0.85, 3.1, 2.7, 0.95, 3.9, false); }
  else if (T === 'pottery') { back(pot); sideShelf(pot); for (let i = 0; i < 10; i++) F.lathe('terracotta', JAR(0.2 + 0.05 * (i % 3)), 1.2 + (i % 5) * 0.8, 0, 2.6 + Math.floor(i / 5) * 0.9, 9); }
  else if (T === 'bronze') { back(vessel); sideShelf(vessel); for (let k = 0; k < 6; k++) F.rod('iron', [th + 0.6 + k * 0.5, 2.8, D / 2 + 0.5], [th + 0.64 + k * 0.5, 2.0, D / 2 + 0.5], 0.02, 4); F.b('granite_black', W - 2.4, 0, 2.6, W - 1.7, 0.45, 3.3); F.b('iron', W - 2.38, 0.45, 2.62, W - 1.72, 0.5, 3.28, false); }
  else if (T === 'lacquer') { back(lac); sideShelf(lac); F.b('lacquer_red', 1.2, 0, 3.0, 2.8, 0.7, 3.8); for (let i = 0; i < 4; i++) F.lathe('lacquer_black', [[0.001, 0.7], [0.1, 0.72], [0.12, 0.82], [0.001, 0.8]], 1.5 + i * 0.35, 0, 3.4, 8); }
  else if (T === 'wine') { for (let i = 0; i < Math.floor((W - 1.2) / 0.85); i++) F.lathe('pottery_dark', JAR(0.34), th + 0.7 + i * 0.85, 0, D - th - 0.6, 10); sideShelf(pot); F.b('lacquer_red', 1.0, 0, 3.2, 2.4, 0.5, 4.4); for (let i = 0; i < 4; i++) F.lathe('glaze_green', [[0.001, 0.5], [0.09, 0.52], [0.11, 0.58], [0.001, 0.56]], 1.3 + i * 0.35, 0, 3.8, 8); F.rod('timber', [W - 1.6, 0.9, 2.6], [W - 1.6, 1.9, 2.6], 0.03, 4); }
  else if (T === 'grain') { for (let i = 0; i < 3; i++) { const u = th + 0.5 + i * ((W - 2 * th - 1.6) / 2); F.b('timber', u, 0, D - th - 1.4, u + 1.1, 0.8, D - th - 0.1); bag.add('paint_ochre', frustum(F.R(u + 0.05, D - th - 1.35, u + 1.05, D - th - 0.15), 0.78, 1.0, 0.2, 0.2, 0.2, 0.2, { noBottom: true })); } for (let i = 0; i < 6; i++) sack(th + 0.5 + (i % 3) * 0.5, Math.floor(i / 3) * 0.36, 2.6 + (i % 2) * 0.3); sideShelf(sack); }
  else if (T === 'salt') { for (let i = 0; i < 5; i++) { bag.add('paint_white', frustum(F.R(th + 0.4 + i * 0.9, D - th - 1.3, th + 1.1 + i * 0.9, D - th - 0.5), 0, 0.7, 0.3, 0.3, 0.3, 0.3, { noBottom: true })); } sideShelf(sack); hang('hide_tan', 5, 0.4); }
  else if (T === 'leather') { hang('hide_brown', 7, 0.8); back(bundle); sideShelf(bundle); F.b('timber', 1.0, 0, 3.0, 2.6, 0.5, 3.8); }
  else { back(bundle); sideShelf(bundle); hang('thatch', 7, 0.4); F.b('timber', 1.0, 0, 3.0, 2.4, 0.8, 3.6); for (let i = 0; i < 5; i++) F.lathe('pottery_dark', [[0.001, 0.8], [0.07, 0.82], [0.09, 0.9], [0.001, 0.9]], 1.2 + i * 0.25, 0, 3.3, 7); }
  // outside: a flag pole of the trade, the goods on the counter, a stool
  const fu = rand() < 0.5 ? 0.2 : W - 0.2;
  F.lathe('log_pine', [[0.06, 0], [0.05, 4.2]], fu, 0, -0.9, 7);
  const dir = fu < W / 2 ? 1 : -1, fa = Math.min(fu, fu + dir * 1.1), fb = Math.max(fu, fu + dir * 1.1);
  F.b('timber', fa, 3.9, -0.95, fb, 3.96, -0.85, false);
  addCloth(bag, sign, clothBox(F.X(fa), 2.7, F.Z(-0.9) - 0.02, F.X(fb), 3.9, F.Z(-0.9) + 0.02), 3.9);
  void sign;
}
