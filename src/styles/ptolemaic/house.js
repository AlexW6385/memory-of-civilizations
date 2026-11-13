// The houses of Alexandria (docs/settlements/alexandria.md §6, §12): the Greek courtyard house with its street door, the room beside
// the passage (a shop on the street, or a store), the court with its peristyle, well, hearth and tree, the side rooms (kitchen,
// store, loom) and the back range (the andron with its couches, the bedroom) — every room hollow, furnished and walked into from the
// court; upper storeys solid with shuttered windows and some with a timber loggia over the street. Plastered walls painted in the
// Masonry style, weathered by salt and damp (bare mudbrick where the plaster has gone, a damp band at the foot, streaks under the
// sills). The old Egyptian house of Rhakotis of mudbrick, its front on the street, its ground room furnished, a yard behind with a
// granary silo, an oven and a palm. Far (el.simple): walls and roofs only. Registered into the `ptolemaic` style (index.js).

import { STYLES } from '../../core/build.js';
import { box, lathe, frustum } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { pent, kit } from '../greek/quarter.js';
import { kline, trapeza, krater, lampstand } from '../greek/house-interior.js';
import '../../objects/index.js';
import { rng, pick, amphora, pithos, basket, sack, crate, bench, firewood, reedBundle, awning, lampBracket, oven, quern, palm, fig, washLine } from './dress.js';

const WALLS = ['plaster_white', 'plaster_white', 'limewash_yellow', 'plaster_ochre'];
const DADO = ['wall_red', 'egyptian_blue', 'wall_red'];
export const SHOP_TRADES = ['bronze', 'perfume', 'cloth', 'wine', 'carpenter', 'oil', 'grain', 'fish', 'pottery', 'papyrus', 'bread', 'sandals'];
const SIGN = { bronze: 'bronze', perfume: 'cloth_indigo', cloth: 'cloth_red', wine: 'wall_red', carpenter: 'timber', oil: 'paint_ochre', grain: 'cloth_ochre', fish: 'egyptian_blue', pottery: 'terracotta', papyrus: 'ivory', bread: 'stucco_siena', sandals: 'hide_brown' };

/** The rooms of a courtyard house in its local frame (shared by the builder and the room list); consumes the first draws of el.seed's stream. */
export function houseLayout(el) {
  const rand = rng(el.seed || 1), F = frame(el.rect, el.front ?? 's'), { L, D } = F;
  const wall = pick(rand, WALLS), dado = pick(rand, DADO);
  const two = rand() < 0.45, H1 = 3.6, H = two ? 7.0 : H1;
  const dw = 1.5, wA = Math.min(L - dw - 4.8, 4.2 + rand() * 3.2), du = wA + 0.4;
  const aShop = rand() < 0.65, trade = pick(rand, SHOP_TRADES);
  const df = 4.2, sw = L < 15 ? 3.0 : 3.4, db = 4.6, cv0 = df + 0.2, cv1 = D - db;
  const left = rand() < 0.5, split = Math.min(L - 4.5, L * (0.5 + rand() * 0.15));
  return { rand, F, L, D, wall, dado, two, H1, H, dw, wA, du, aShop, trade, df, sw, db, cv0, cv1, left, split, tiled: rand() < 0.3 };
}
/** The rooms of a house for its plan (world rectangles): the shop or store, the court, the andron, the kitchen. */
export function houseRooms(el, y = 0) {
  const k = houseLayout(el), { F, L, wA, df, sw, cv0, cv1, D, db, split } = k, id = `house ${Math.round(el.rect[0])},${Math.round(el.rect[1])}`;
  return [
    { id: `${id}: ${k.aShop ? 'shop' : 'store'}`, rect: F.R(0.7, 0.7, wA - 0.1, df - 0.3), y, kind: 'inner', market: false },
    { id: `${id}: court`, rect: F.R(sw + 0.8, cv0 + 0.2, L - sw - 0.8, cv1 - 1.2), y, kind: 'open', market: false },
    { id: `${id}: andron`, rect: F.R(0.9, cv1 + 0.4, split - 0.3, D - 0.8), y, kind: 'inner', market: false },
    { id: `${id}: kitchen`, rect: F.R(k.left ? 0.9 : L - sw - 0.2, cv0 + 0.4, k.left ? sw + 0.1 : L - 0.9, cv1 - 0.3), y, kind: 'inner', market: false },
  ];
}
export function figureAt(ctx, x, z, y, dx, dz, o) {
  const f = STYLES.life?.elements?.figure; if (!f) return;
  f({ t: 'figure', at: [x, z], y, rot: Math.atan2(-dx, -dz), ...o }, ctx);
}

function house(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, K0 = houseLayout(el), { rand, F, L, D, wall, dado, two, H1, H, dw, wA, du, aShop, trade, df, sw, db, cv0, cv1, left, split } = K0;
  const { R, wall: W } = kit(ctx, el.rect, el.front ?? 's', y);
  const [ox, oz] = F.out;
  if (el.simple) {
    R(0, 0, L, D, -0.5, 0.45, 'limestone', false); R(0, 0, L, D, 0.45, 1.3, dado, false); R(0, 0, L, D, 1.3, H, wall, false);
    R(-0.1, -0.1, L + 0.1, D + 0.1, H - 0.2, H + 0.5, wall, false); R(du, -0.05, du + dw, 0.1, 0, 2.4, 'wood_dark', false); return;
  }
  const solid = true;
  R(0, 0, L, D, -0.5, 0, 'limestone', false);
  col.floor(F.R(0.4, 0.4, L - 0.4, D - 0.4), y);
  // ── the outer walls in bands (socle, painted dado, plaster), cut for the doors and windows ──
  const T = 0.6, BANDS = [[-0.5, 0.5, 'limestone'], [0.5, 1.3, dado], [1.3, H1, wall]];
  const outerWall = (alongU, c, a, b, cuts) => {
    const piece = (p, q, y0, y1, m) => { if (q - p < 0.01 || y1 - y0 < 0.01) return; if (alongU) R(p, c - T / 2, q, c + T / 2, y0, y1, m, solid); else R(c - T / 2, p, c + T / 2, q, y0, y1, m, solid); };
    for (const [ya, yb, m] of BANDS) {
      const full = cuts.filter((k) => k.y0 <= ya + 1e-6 && k.y1 >= yb - 1e-6), part = cuts.filter((k) => !full.includes(k) && k.y0 < yb && k.y1 > ya);
      let u = a;
      for (const k of [...full, ...part].sort((p, q) => p.a - q.a)) { piece(u, k.a, ya, yb, m); u = k.b; }
      piece(u, b, ya, yb, m);
      for (const k of part) { piece(k.a, k.b, ya, Math.max(ya, k.y0), m); piece(k.a, k.b, Math.min(yb, k.y1), yb, m); }
    }
  };
  const fcuts = [{ a: du, b: du + dw, y0: 0, y1: 2.5 }];
  if (aShop) fcuts.push({ a: 0.9, b: wA - 0.3, y0: 0.95, y1: 2.6 });
  outerWall(true, T / 2, 0, L, fcuts); outerWall(true, D - T / 2, 0, L, []);
  outerWall(false, T / 2, 0, D, []); outerWall(false, L - T / 2, 0, D, []);
  // ── the ranges: ceilings, the upper storey (solid), the roofs ──
  const ranges = [[0, 0, L, df], [0, D - db, L, D], [0, df, sw + 0.6, D - db], [L - sw - 0.6, df, L, D - db]];
  ranges.forEach(([u0, v0, u1, v1], i) => {
    R(u0 + 0.02, v0 + 0.02, u1 - 0.02, v1 - 0.02, H1 - 0.22, H1, 'timber', false);
    if (two) { R(u0, v0, u1, v1, H1, H, wall, solid); R(u0 - 0.1, v0 - 0.1, u1 + 0.1, v1 + 0.1, H - 0.25, H, 'limestone', false); }
    const r = F.R(u0, v0, u1, v1);
    if (K0.tiled && !two && i !== 0) pent(ctx, r, i === 1 ? (F.out[1] > 0 ? 'zp' : 'zn') : i === 2 ? 'xp' : 'xn', y, H + 0.03, H + (i === 1 ? 1.5 : 1.0), 0.25);
    else { bag.add('mud_plaster', box(r[0], y + H, r[1], r[2], y + H + 0.09, r[3])); R(u0, v0, u1, v0 + 0.3, H, H + 0.55, wall, false); R(u0, v1 - 0.3, u1, v1, H, H + 0.55, wall, false); R(u0, v0, u0 + 0.3, v1, H, H + 0.55, wall, false); R(u1 - 0.3, v0, u1, v1, H, H + 0.55, wall, false); }
  });
  R(-0.12, -0.12, L + 0.12, 0.1, H - 0.28, H, 'limestone', false);
  // ── the street door: stone jambs, the lintel with a cavetto, the leaf standing open against the passage wall ──
  R(du - 0.22, -0.14, du, 0.1, 0, 2.7, 'limestone', false); R(du + dw, -0.14, du + dw + 0.22, 0.1, 0, 2.7, 'limestone', false);
  R(du - 0.3, -0.2, du + dw + 0.3, 0.1, 2.5, 2.85, 'limestone', false); R(du - 0.4, -0.3, du + dw + 0.4, 0.1, 2.85, 3.05, 'sandstone', false);
  R(du, 0.0, du + dw, 0.5, -0.05, 0.0, 'limestone', false);
  R(du + 0.04, 0.7, du + 0.12, 1.9, 0, 2.35, 'wood_dark', false); R(du + 0.02, 0.62, du + 0.14, 0.72, 1.0, 1.1, 'bronze', false);
  // ── the interior walls: the partitions of the front range, the court's front, the sides, the back range ──
  const IW = 0.4, door = (a, b) => [a, b, 2.4];
  W(false, wA + 0.2, 0.6, df, H1, [door(1.3, 2.5)], 'plaster_white', IW);                    // room A | passage
  W(false, du + dw + 0.2, 0.6, df, H1, [door(1.3, 2.5)], 'plaster_white', IW);              // passage | room B
  W(true, df, 0.6, L - 0.6, H1, [door(du, du + dw)], 'plaster_white', IW);                  // the front range's back wall (the passage opens on the court)
  const sideX = left ? sw + 0.4 : L - sw - 0.4, mid = (cv0 + cv1) / 2 - 0.3;
  W(false, sideX, df + 0.2, cv1, H1, [door(mid - 0.3, mid + 1.1)], 'plaster_white', IW);   // the kitchen's wall, the other side's too
  const otherX = left ? L - sw - 0.4 : sw + 0.4;
  W(false, otherX, df + 0.2, cv1, H1, [door(mid - 0.3, mid + 1.1)], 'plaster_white', IW);
  const a0 = (0.6 + split) / 2, b0 = (split + L - 0.6) / 2;
  W(true, cv1, 0.6, L - 0.6, H1, [door(a0 - 1.1, a0 + 1.1), door(b0 - 0.6, b0 + 0.6)], 'plaster_white', IW);   // the back range: the andron's wide door, the bedroom's
  W(false, split, cv1, D - 0.6, H1, [door(1.4, 2.4)], 'plaster_white', 0.3);
  // ── the court: cobbles, the peristyle on the back, a well, an altar, a tree, pots ──
  const cu0 = sw + 0.8, cu1 = L - sw - 0.8;
  R(cu0, cv0, cu1, cv1, -0.4, 0.02, 'cotto_floor', false);
  R(cu0 - 0.05, cv0 + 0.6, cu1 + 0.05, cv1 - 0.8, 0.02, 0.05, 'pebbles', false);
  const colH = 3.0, vc = cv1 - 0.75, nC = Math.max(3, Math.round((cu1 - cu0) / 2.5));
  for (let k = 0; k <= nC; k++) {
    const u = cu0 + 0.2 + k * (cu1 - cu0 - 0.4) / nC;
    if ((Math.abs(u - a0) < 1.5) || (Math.abs(u - b0) < 1.0)) continue;
    STYLES.greek.column({ at: F.P(u, vc), y, h: colH, d: 0.42, mat: 'limestone', flutes: 0, simple: true }, ctx);
  }
  R(cu0, vc - 0.3, cu1, vc + 0.3, colH, colH + 0.3, 'timber', false); R(cu0, vc - 0.3, cu1, cv1, colH + 0.3, colH + 0.38, 'mud_plaster', false);
  const cmid = (cu0 + cu1) / 2, vm = (cv0 + vc) / 2;
  { const [wx, wz] = F.P(cmid + (rand() - 0.5) * 1.2, vm);
    bag.add('limestone', lathe([[0.5, 0], [0.5, 0.78], [0.4, 0.78], [0.4, 0.6], [0.001, 0.6]], 12, null, wx, y, wz)); col.circle(wx, wz, 0.5, y, y + 0.78);
    bag.add('timber', box(-0.55, y + 0.78, -0.03, 0.55, y + 1.5, 0.03).rotateY(F.yaw).translate(wx, 0, wz)); }
  if (cv1 - cv0 > 6.2) { const [tx, tz] = F.P(cu0 + 0.9, cv0 + 1.1); if (two || rand() < 0.5) fig(bag, col, tx, y, tz, 3.4, el.seed); else palm(bag, col, tx, y, tz, 5.2, el.seed); }
  { const [px, pz] = F.P(cu1 - 0.6, cv0 + 0.7); bag.add('terracotta', lathe([[0.001, 0], [0.18, 0.02], [0.3, 0.3], [0.32, 0.6], [0.2, 0.75], [0.22, 0.82], [0.001, 0.8]], 8, null, px, y, pz)); col.circle(px, pz, 0.3, y, y + 0.8);
    const [qx, qz] = F.P(cu0 + 0.5, cv1 - 1.3); basket(bag, qx, y, qz, 0.3, 0.3, 'lotus_leaf'); }
  if (rand() < 0.5) { const [ax, az] = F.P(cmid, cv0 + 0.6); bag.add('limestone', box(ax - 0.3, y, az - 0.3, ax + 0.3, y + 0.9, az + 0.3)); col.rect([ax - 0.3, az - 0.3, ax + 0.3, az + 0.3], y, y + 0.9); bag.add('flame', lathe([[0.001, 0], [0.1, 0.02], [0.001, 0.3]], 5, null, ax, y + 0.9, az)); }
  // painted panels (the Masonry style) on the back range's wall facing the court
  { const pw = ['wall_red', 'paint_ochre', 'egyptian_blue', 'plaster_white']; for (let u = cu0 + 0.3; u + 1.5 < cu1; u += 1.9) { if (Math.abs(u + 0.75 - a0) < 1.6 || Math.abs(u + 0.75 - b0) < 1.0) continue; R(u, cv1 - 0.2, u + 1.5, cv1 - 0.18, 1.4, 2.7, pick(rand, pw), false); } }
  // ── room A: the shop (counter at the window, goods, shelves, the shopkeeper) or a store ──
  const aU0 = 0.7, aU1 = wA - 0.1, aV0 = 0.7, aV1 = df - 0.3;
  R(aU0, aV0, aU1, aV1, -0.05, 0.0, 'flagstone', false);
  if (aShop) {
    R(0.9, 0.62, wA - 0.3, 1.2, 0.0, 0.95, 'timber', solid);                                    // the counter under the window
    R(0.8, -0.35, wA - 0.2, 0.62, 0.9, 0.98, 'limestone', solid);                              // the stone sill outside
    shopGoods(ctx, F, y, trade, rand, 0.9, wA - 0.3, aV1, aV0, SIGN);
    for (const u of [0.95, wA - 0.38]) R(u, 0.55, u + 0.08, 0.7, 0.95, 2.6, 'timber', false);
    // the shutters of the window folded up as a hood, the sign
    R(0.85, -0.5, wA - 0.25, 0.62, 2.6, 2.66, 'wood_dark', false);
    R(wA - 0.02, -1.0, wA + 0.05, 0.0, 3.0, 3.6, SIGN[trade] ?? 'timber', false); R(wA - 0.02, -0.1, wA + 0.05, 0.0, 2.9, 3.0, 'iron', false);
    if (rand() < 0.75) { const [x0, z0, x1, z1] = F.R(0.75, -1.2, wA - 0.15, 0.0); awning(bag, [x0, z0, x1, z1], F.out[1] > 0 ? 'z1' : F.out[1] < 0 ? 'z0' : F.out[0] > 0 ? 'x1' : 'x0', y + 3.1, y + 2.45, pick(rand, ['cloth_ochre', 'cloth_red', 'linen', 'cloth_indigo', 'cloth_white']), col); }
    if (el.seed % 2) { const [sx, sz] = F.P((aU0 + aU1) / 2, aV1 - 0.8); figureAt(ctx, sx, sz, y, ox, oz, { seed: el.seed + 3, dress: 'robe', cloth: pick(rand, ['cloth_white', 'linen', 'cloth_ochre']), skin: 'skin_medium', hair: 'short', beard: rand() < 0.5, pose: 'stand' }); }
  } else {
    for (let k = 0; k < 3; k++) { const [px, pz] = F.P(aU0 + 0.5 + k * 0.9, aV1 - 0.5); pithos(bag, col, px, y, pz, 0.7); }
    for (let k = 0; k < 3; k++) { const [px, pz] = F.P(aU0 + 0.4, aV0 + 0.5 + k * 0.7); sack(bag, px, y, pz, k); }
    R(aU0, aV0 - 0.0, aU1, aV0 + 0.3, 0.0, 0.05, 'flagstone', false);
    const [hx, hz] = F.R(wA - 1.7, 0.75, wA - 0.1, 0.8), _w = 0; void hx; void hz; void _w;
  }
  // a high window in the store's or shop's wall to the court gives its light; room B: a bench, jars
  const bU0 = du + dw + 0.6, bU1 = L - 0.7;
  R(bU0, aV0, bU1, aV1, -0.05, 0.0, 'flagstone', false);
  { const t2 = pick(rand, ['bench', 'stable', 'work']);
    if (t2 === 'bench') { bench(bag, col, F.R(bU0 + 0.1, aV1 - 0.6, bU1 - 0.1, aV1 - 0.1), y, 'timber'); for (let k = 0; k < 3; k++) { const [px, pz] = F.P(bU0 + 0.5 + k * 0.6, aV0 + 0.6); amphora(bag, px, y, pz, { s: 1.0, tilt: 0 }); } }
    else if (t2 === 'stable') { const [px, pz] = F.P((bU0 + bU1) / 2, aV1 - 0.6); bag.add('reed_mat', box(-0.8, y, -0.5, 0.8, y + 0.15, 0.5).rotateY(F.yaw).translate(px, 0, pz)); for (let k = 0; k < 4; k++) { const [rx, rz] = F.P(bU0 + 0.3 + k * 0.2, aV0 + 0.4); reedBundle(bag, rx, y, rz, 1.4); } }
    else { const [px, pz] = F.R(bU0 + 0.2, aV1 - 0.9, bU1 - 0.2, aV1 - 0.2); R(bU0 + 0.2, aV1 - 0.9, bU1 - 0.2, aV1 - 0.2, 0.7, 0.78, 'timber', false); R(bU0 + 0.3, aV1 - 0.8, bU0 + 0.4, aV1 - 0.3, 0, 0.7, 'wood_dark', solid); R(bU1 - 0.4, aV1 - 0.8, bU1 - 0.3, aV1 - 0.3, 0, 0.7, 'wood_dark', solid); void px; void pz; basketsAt(bag, F, y, bU0 + 0.8, aV0 + 0.5, 2); } }
  // ── the kitchen (a side range): the oven, the hearth, water jars, firewood, a table ──
  { const ku0 = left ? 0.8 : sideX + 0.4, ku1 = left ? sideX - 0.2 : L - 0.8, kv0 = df + 0.4, kv1 = cv1 - 0.2;
    R(ku0 - 0.2, kv0 - 0.2, ku1 + 0.2, kv1 + 0.2, -0.05, 0.0, 'flagstone', false);
    const [ovx, ovz] = F.P(left ? ku0 + 0.7 : ku1 - 0.7, kv1 - 0.8); oven(bag, col, ovx, y, ovz, 0.6, F.yaw);
    const [hx, hz] = F.P(left ? ku0 + 1.6 : ku1 - 1.6, kv0 + 0.5); bag.add('limestone', box(hx - 0.5, y, hz - 0.35, hx + 0.5, y + 0.5, hz + 0.35)); bag.add('flame', lathe([[0.001, 0], [0.18, 0.02], [0.001, 0.4]], 6, null, hx, y + 0.5, hz)); col.rect([hx - 0.5, hz - 0.35, hx + 0.5, hz + 0.35], y, y + 0.5);
    bag.add('bronze', lathe([[0.001, 0], [0.22, 0.05], [0.26, 0.2], [0.2, 0.26], [0.001, 0.24]], 8, null, hx, y + 0.5, hz));
    const [fx, fz] = F.P(left ? sideX - 0.6 : sideX + 0.6, kv1 - 0.3); firewood(bag, col, fx, y, fz, 0.9, F.yaw, 3);
    for (let k = 0; k < 2; k++) { const [px, pz] = F.P((ku0 + ku1) / 2 + k * 0.5 - 0.2, kv0 + 0.5); bag.add('terracotta', lathe([[0.08, 0], [0.2, 0.08], [0.24, 0.22], [0.18, 0.36], [0.08, 0.42], [0.1, 0.46], [0.001, 0.46]], 8, null, px, y, pz)); col.circle(px, pz, 0.24, y, y + 0.46); }
    if (el.seed % 3 === 0) { const [qx, qz] = F.P((ku0 + ku1) / 2, kv1 - 0.6); quern(bag, col, qx, y, qz, F.yaw); }
    if (el.seed % 8 === 1) { const [cx, cz] = F.P(left ? ku1 - 0.9 : ku0 + 0.9, (kv0 + kv1) / 2); figureAt(ctx, cx, cz, y, left ? 1 : -1, 0, { seed: el.seed + 9, dress: 'robe', cloth: pick(rand, ['cloth_red', 'cloth_ochre', 'linen']), skin: 'skin_medium', hair: 'bun', hat: 'veil', over: 'apron', pose: 'squat' }); }
  }
  // ── the other side range: a store of pithoi and sacks, or the loom ──
  { const su0 = left ? sideX + 0.4 + (L - sw - 0.4 - sideX - 0.4) : 0.8, ssu0 = left ? L - sw : 0.8, ssu1 = left ? L - 0.8 : sw + 0.1; void su0;
    const kv0 = df + 0.4, kv1 = cv1 - 0.2;
    R(Math.min(ssu0, ssu1) - 0.2, kv0 - 0.2, Math.max(ssu0, ssu1) + 0.2, kv1 + 0.2, -0.05, 0.0, 'flagstone', false);
    if (rand() < 0.5) { for (let k = 0; k < Math.min(4, Math.floor((kv1 - kv0) / 0.9)); k++) { const [px, pz] = F.P(left ? ssu1 - 0.5 : ssu0 + 0.5, kv0 + 0.6 + k * 0.9); pithos(bag, col, px, y, pz, 0.75); } for (let k = 0; k < 4; k++) { const [px, pz] = F.P(left ? ssu0 + 0.5 : ssu1 - 0.5, kv0 + 0.5 + k * 0.5); amphora(bag, px, y, pz, { s: 1.0, tilt: 0.0 }); } }
    else loomAt(ctx, F, y, left ? ssu1 - 0.35 : ssu0 + 0.35, (kv0 + kv1) / 2, left ? -1 : 1, rand);
  }
  // ── the back range: the andron with its couches along the walls, the krater, the table, a lamp; the bedroom ──
  { const au0 = 0.9, au1 = split - 0.3, av0 = cv1 + 0.4, av1 = D - 0.8;
    R(au0 - 0.2, av0 - 0.2, au1 + 0.2, av1 + 0.2, -0.05, 0.0, 'cotto_floor', false);
    R(au0 + 0.3, av0 + 0.3, au1 - 0.3, av1 - 0.3, -0.04, 0.0, 'pebbles', false);
    const n = Math.max(2, Math.floor((au1 - au0 - 0.4) / 2.0));
    for (let k = 0; k < n; k++) { const [x0, z0, x1, z1] = F.R(au0 + 0.1 + k * 2.0, av1 - 0.9, au0 + 1.95 + k * 2.0, av1 - 0.05); kline(bag, col, x0, z0, x1, z1, y, rand() < 0.5, rand); const [tx, tz] = F.P(au0 + 1.0 + k * 2.0, av1 - 1.35); trapeza(bag, tx, tz, y, F.alongX, rand); }
    const [kx, kz] = F.P((au0 + au1) / 2, (av0 + av1) / 2 - 0.3); krater(bag, col, kx, kz, y);
    if (el.lamp) { const [lx, lz] = F.P(au1 - 0.5, av0 + 0.6); lampstand(ctx, lx, lz, y, 1.4); }
    const bu0 = split + 0.3, bu1 = L - 0.8;
    R(bu0 - 0.2, av0 - 0.2, bu1 + 0.2, av1 + 0.2, -0.05, 0.0, 'cotto_floor', false);
    const [x0, z0, x1, z1] = F.R(bu0 + 0.1, av1 - 0.95, Math.min(bu1, bu0 + 2.1), av1 - 0.05); kline(bag, col, x0, z0, x1, z1, y, true, rand);
    const [chx, chz] = F.P(bu1 - 0.5, av0 + 0.5); bag.add('cedar', box(-0.4, y, -0.25, 0.4, y + 0.55, 0.25).rotateY(F.yaw).translate(chx, 0, chz)); col.circle(chx, chz, 0.42, y, y + 0.55);
    if (el.seed % 7 === 0) { const [px, pz] = F.P((au0 + au1) / 2 + 1.4, (av0 + av1) / 2 + 0.6); figureAt(ctx, px, pz, y, -ox, -oz, { seed: el.seed + 21, dress: 'robe', cloth: 'cloth_white', skin: 'skin_medium', hair: 'short', beard: true, pose: 'talk' }); }
  }
  // ── the front's dressing: shutters, the loggia, benches, jars, a pot of basil, a lamp bracket, washing ──
  const pu = du + dw + 0.5;
  weatherFront(R, rand, L, aShop);
  if (two) {
    for (let u = 1.6; u < L - 1.6; u += 3.0) { if (Math.abs(u - du) < 1.2) continue; R(u, -0.06, u + 0.9, 0.1, 4.6, 5.9, 'wood_dark', false); R(u - 0.15, -0.14, u + 1.05, 0.1, 5.9, 6.05, 'limestone', false); R(u - 0.1, -0.12, u + 1.0, 0.1, 4.5, 4.6, 'limestone', false); R(u + 0.1, -0.07, u + 0.4, 0.0, 4.7, 5.8, 'shutter_brown', false); R(u + 0.5, -0.07, u + 0.8, 0.0, 4.7, 5.8, 'shutter_brown', false); }
    if (rand() < 0.35) {          // a timber loggia over the street
      const a = L * 0.25, b = L * 0.75;
      R(a, -1.1, b, 0.0, 4.35, 4.55, 'timber', false);
      for (let u = a; u <= b + 0.01; u += (b - a) / 6) R(u - 0.05, -1.1, u + 0.05, -1.0, 4.55, 5.55, 'wood_dark', false);
      R(a, -1.1, b, -1.0, 5.5, 5.6, 'timber', false); R(a, -1.1, a + 0.08, 0, 4.55, 5.6, 'wood_dark', false); R(b - 0.08, -1.1, b, 0, 4.55, 5.6, 'wood_dark', false);
      for (let u = a; u < b; u += 0.5) R(u, -1.08, u + 0.04, -1.04, 4.55, 5.5, 'wood_dark', false);
      if (rand() < 0.6) { const w = washFront(F, a, b, -1.05, y + 5.5, rand); bag.add(w.m, w.g); }
    }
  } else for (let u = 1.4; u < L - 1.4; u += 3.4) { if (Math.abs(u - du) < 1.4 || (aShop && u < wA)) continue; R(u, -0.06, u + 0.7, 0.1, 2.3, 3.0, 'wood_dark', false); R(u + 0.05, -0.07, u + 0.65, 0.0, 2.35, 2.95, 'shutter_grey', false); }
  { const dd = [[pu, -0.45], [du - 0.5, -0.45]], q = rand();
    if (q < 0.55) for (const [u, v] of dd) { const [ax, az] = F.P(u, v); amphora(bag, ax, y, az, { s: 1.0, tilt: 0 }); col.circle(ax, az, 0.2, y, y + 1.1); }
    else if (q < 0.8) bench(bag, col, F.R(pu - 0.2, -0.6, Math.min(L - 0.4, pu + 1.8), -0.1), y, pick(rand, ['limestone', 'timber']));
    else { const [ax, az] = F.P(pu + 0.2, -0.5); firewood(bag, col, ax, y, az, 1.1, F.yaw + Math.PI / 2, 3); }
    if (rand() < 0.5) { const [ax, az] = F.P(du - 0.5, -0.35); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.2], [0.22, 0.4], [0.001, 0.4]], 8, null, ax, y, az)); bag.add('lotus_leaf', lathe([[0.001, 0.38], [0.2, 0.45], [0.001, 0.65]], 6, null, ax, y, az)); } }
  { const [lx, lz] = F.P(du + dw + 0.5, -0.12); lampBracket(bag, lx, y + 2.7, lz, ox, oz); }
  void H;
}

function weatherFront(R, rand, L, aShop) {
  R(0.2, -0.015, L - 0.2, 0.02, 0.5, 1.0, 'plaster_damp', false);
  for (let i = 0, n = 2 + Math.floor(rand() * 3); i < n; i++) { const u = 0.5 + rand() * (L - 2.4), w = 0.4 + rand() * 0.9, y0 = 1.4 + rand() * 1.6; if (aShop && u < 5) continue; R(u, -0.02, u + w, 0.01, y0, y0 + 0.3 + rand() * 0.7, 'mudbrick', false); }
  for (let u = 1.2 + rand(); u < L - 1.5; u += 2.3 + rand() * 2) R(u, -0.02, u + 0.12, 0.01, 2.6 + rand() * 0.5, 3.3, 'plaster_streak', false);
}
function washFront(F, a, b, v, yTop, rand) {
  const [x0, z0] = F.P(a, v), [x1, z1] = F.P(b, v);
  const G = []; const bagLike = { add: (m, g) => G.push([m, g]) };
  washLine(bagLike, [x0, z0], [x1, z1], yTop - 0.1, rand, 0.9);
  return { m: G[0][0], g: G[0][1] };
}
function basketsAt(bag, F, y, u, v, n) { for (let k = 0; k < n; k++) { const [x, z] = F.P(u + k * 0.6, v); basket(bag, x, y, z, 0.28, 0.3, null); } }
/** The warp-weighted loom: two uprights leaning, the cloth beam, the cloth, the row of clay weights; at the wall u, centred at v, `dir` the side the weaver stands (+1 toward +u). */
function loomAt(ctx, F, y, u, v, dir, rand) {
  const { bag, col } = ctx, R = (a0, b0, a1, b1, y0, y1, m) => { const r = F.R(a0, b0, a1, b1); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); return r; };
  for (const s of [-0.7, 0.7]) R(u - 0.05, v + s - 0.04, u + 0.05, v + s + 0.04, 0, 2.0, 'timber');
  R(u - 0.06, v - 0.75, u + 0.06, v + 0.75, 1.9, 2.0, 'timber');
  R(u + dir * 0.02 - 0.015, v - 0.65, u + dir * 0.02 + 0.015, v + 0.65, 0.6, 1.9, 'linen');
  R(u + dir * 0.05 - 0.025, v - 0.65, u + dir * 0.05 + 0.025, v + 0.65, 1.4, 1.5, pick(rand, ['cloth_red', 'cloth_indigo', 'cloth_ochre']));
  for (let s = -0.6; s <= 0.6; s += 0.15) R(u + dir * 0.09 - 0.03, v + s - 0.03, u + dir * 0.09 + 0.03, v + s + 0.03, 0.4, 0.5, 'terracotta');
  const r = F.R(u - 0.2, v - 0.8, u + 0.2, v + 0.8); col.rect(r, y, y + 2.0);
  const [sx, sz] = F.P(u + dir * 0.8, v);
  bag.add('timber', box(sx - 0.2, y, sz - 0.2, sx + 0.2, y + 0.45, sz + 0.2));
}
/** The shop's goods by trade: on the counter (outside and in) and shelves on the back wall. */
function shopGoods(ctx, F, y, trade, rand, u0, u1, vBack, vFront, SIGN) {
  const { bag, col } = ctx, P = (u, v) => F.P(u, v), cy = y + 0.98;
  const put = (m, g, u, v, yy = cy) => { const [x, z] = P(u, v); g.translate(x, yy, z); bag.add(m, g); };
  const n = Math.max(3, Math.floor((u1 - u0) / 0.45));
  for (let k = 0; k < n; k++) {
    const u = u0 + 0.25 + k * (u1 - u0 - 0.5) / (n - 1), v = -0.1 + (k % 2) * 0.2;
    switch (trade) {
      case 'bronze': put('bronze', lathe([[0.001, 0], [0.1, 0.02], [0.12, 0.1], [0.08, 0.14], [0.001, 0.13]], 8), u, v); break;
      case 'perfume': put(k % 2 ? 'ivory' : 'glaze_blue', lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.06], [0.02, 0.1], [0.02, 0.14], [0.001, 0.14]], 6), u, v); break;
      case 'cloth': put(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'linen', 'cloth_green'][k % 5], box(-0.18, 0, -0.14, 0.18, 0.12 + (k % 3) * 0.06, 0.14), u, v); break;
      case 'wine': put('terracotta', lathe([[0.001, 0], [0.05, 0.02], [0.1, 0.12], [0.12, 0.2], [0.07, 0.3], [0.035, 0.38], [0.04, 0.42], [0.001, 0.4]], 7), u, v); break;
      case 'carpenter': put('timber', box(-0.2, 0, -0.04, 0.2, 0.03 + (k % 3) * 0.03, 0.04), u, v); break;
      case 'oil': put('terracotta', lathe([[0.04, 0], [0.09, 0.1], [0.09, 0.2], [0.03, 0.28], [0.03, 0.34], [0.001, 0.34]], 7), u, v); break;
      case 'grain': put('sacking', lathe([[0.001, 0], [0.2, 0.01], [0.23, 0.1], [0.19, 0.22], [0.001, 0.24]], 7), u, v); break;
      case 'fish': put('steel_grey', box(-0.14, 0, -0.04, 0.14, 0.04, 0.04), u, v); break;
      case 'pottery': put(k % 2 ? 'pottery_dark' : 'terracotta', lathe([[0.001, 0], [0.06, 0.01], [0.1, 0.1], [0.07, 0.2], [0.001, 0.2]], 7), u, v); break;
      case 'papyrus': put('ivory', lathe([[0.04, 0], [0.04, 0.3], [0.001, 0.3]], 6).rotateZ(Math.PI / 2), u, v, cy + 0.05); break;
      case 'bread': put('stucco_siena', lathe([[0.1, 0], [0.12, 0.04], [0.07, 0.09], [0.001, 0.1]], 8), u, v); break;
      default: put('hide_brown', box(-0.1, 0, -0.05, 0.1, 0.04, 0.05), u, v);
    }
  }
  // the shelves on the back wall of the room: two boards with a row of goods (jars, bolts, tools)
  const vb = vFront + 2.55;
  for (const h of [0.9, 1.5]) { const r = F.R(u0, vBack - 0.35, u1 + 0.2, vBack - 0.05); bag.add('timber', box(r[0], y + h, r[1], r[2], y + h + 0.04, r[3])); }
  const m = ({ cloth: 'cloth_ochre', wine: 'terracotta', oil: 'terracotta', pottery: 'pottery_dark', bronze: 'bronze', perfume: 'glaze_blue', papyrus: 'ivory' })[trade] ?? 'terracotta';
  for (let k = 0; k < 5; k++) for (const h of [0.94, 1.54]) { const [x, z] = P(u0 + 0.3 + k * ((u1 - u0 - 0.5) / 4), vBack - 0.2); bag.add(m, lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.1], [0.07, 0.2], [0.001, 0.2]], 6, null, x, y + h, z)); }
  void vb; void col; void rand; void SIGN;
}

/**
 * egyptian_house: { rect (the lot), seed, y, front ('n' | 's': the street) } — a house of Rhakotis on the street: its front the whole width
 * of the lot, mudbrick battering in, 2–3 storeys, the ground room furnished and entered by the street door, an outside stair to the
 * roof, palm-trunk beams ending in the wall, small high windows with a grille, a room on the roof and the drying line; behind it a
 * walled yard with a round granary silo, an oven, a palm and the animals' pen.
 */
function egyptianHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, F = frame(el.rect, el.front ?? 's'), { L, D } = F, [ox, oz] = F.out;
  const R = (u0, v0, u1, v1, y0, y1, m, solid = false) => { const r = F.R(u0, v0, u1, v1); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); return r; };
  const n = 2 + (rand() < 0.4 ? 1 : 0), sh = 2.9, H = n * sh, hd = Math.min(D - 4.5, 8.6 + rand() * 2), b = 0.1 * n, wl = rand() < 0.6 ? 'plaster_white' : 'mud_plaster';
  const dw = 1.1, du = 1.2 + rand() * (L - 5.2), side = rand() < 0.5 ? 1 : -1;
  const stairU = side > 0 ? L - 1.1 : 0.1;
  const simple = el.simple;
  R(-0.05, 0, L + 0.05, hd, -0.5, 0.5, 'limestone');
  if (simple) {
    bag.add('mudbrick', frustum(F.R(0, 0, L, hd), y + 0.5, y + H, b, b, b, b)); R(0, 0, L, hd, H - sh * 0.45, H, wl); R(0, 0, L, hd, H, H + 0.5, 'mudbrick'); R(du, -0.05, du + dw, 0.1, 0, 1.9, 'wood_dark'); return;
  }
  // walls: the ground floor hollow (room: 0.6…L-0.6 × 0.6…hd-0.6, wall 0.6); the upper floors solid, battering in
  const t = 0.6, WALL = (alongU, c, a1, b1, cuts) => {
    const piece = (p, q, y0, y1, m) => { if (q - p < 0.01) return; if (alongU) R(p, c - t / 2, q, c + t / 2, y0, y1, m, true); else R(c - t / 2, p, c + t / 2, q, y0, y1, m, true); };
    let u = a1; for (const k of cuts) { piece(u, k.a, 0.5, sh, 'mudbrick'); piece(k.a, k.b, k.y1, sh, 'mudbrick'); u = k.b; } piece(u, b1, 0.5, sh, 'mudbrick');
  };
  WALL(true, t / 2, 0, L, [{ a: du, b: du + dw, y1: 2.1 }]); WALL(true, hd - t / 2, 0, L, []); WALL(false, t / 2, 0, hd, []); WALL(false, L - t / 2, 0, hd, []);
  col.floor(F.R(0.4, 0.4, L - 0.4, hd - 0.4), y);
  R(0, 0, L, hd, sh - 0.15, sh, 'palm_trunk');
  // upper storeys: battered solid block (a frustum), lime wash on the top, parapet, roof room, linen
  bag.add('mudbrick', frustum(F.R(0, 0, L, hd), y + sh, y + H, b * 0.7, b * 0.7, b * 0.7, b * 0.7)); col.rect(F.R(0, 0, L, hd), y + sh, y + H);
  bag.add(wl, frustum(F.R(b * 0.5, b * 0.5, L - b * 0.5, hd - b * 0.5), y + H - sh * 0.45, y + H + 0.02, b * 0.1, b * 0.1, b * 0.1, b * 0.1));
  R(0, 0, L, hd, H, H + 0.1, 'mudbrick'); R(0, 0, L, 0.25, H + 0.1, H + 0.6, 'mudbrick'); R(0, hd - 0.25, L, hd, H + 0.1, H + 0.6, 'mudbrick'); R(0, 0, 0.25, hd, H + 0.1, H + 0.6, 'mudbrick'); R(L - 0.25, 0, L, hd, H + 0.1, H + 0.6, 'mudbrick');
  if (rand() < 0.6) { R(0.7, 0.7, Math.min(3.4, L * 0.35), 0.7 + Math.min(2.6, hd * 0.4), H + 0.1, H + 2.3, 'mud_plaster'); }
  { const [x0, z0] = F.P(L * 0.55, 1.3), [x1, z1] = F.P(L * 0.9, 1.3); const G = []; washLine({ add: (m, g) => G.push([m, g]) }, [x0, z0], [x1, z1], y + H + 1.6, rand, 0.8); for (const [m, g] of G) bag.add(m, g); }
  // the door and the front's dressing: the palm lintel, little high windows with a grille, the beams ending in the wall
  R(du - 0.1, -0.1, du + dw + 0.1, 0.08, 0, 2.15, 'palm_trunk'); R(du + 0.04, 0.55, du + 0.1, 0.55 + dw * 0.9, 0, 2.0, 'wood_dark');
  R(du - 0.1, -0.12, du + dw + 0.1, 0.08, 2.1, 2.25, 'limestone');
  for (let k = 1; k <= n; k++) for (let u = 0.6; u < L - 0.5; u += 1.1) { if (k === 1 && u > du - 0.3 && u < du + dw + 0.3) continue; R(u, -0.2, u + 0.17, 0.0, k * sh - 0.35, k * sh - 0.18, 'palm_trunk'); }
  for (let k = 0; k < n; k++) for (let u = 1.4 + (k % 2) * 0.8; u < L - 1.0; u += 2.6) { if (k === 0 && Math.abs(u + 0.3 - du - dw / 2) < 1.4) continue; R(u, -0.04, u + 0.6, 0.06, (k + 1) * sh - 1.2, (k + 1) * sh - 0.5, 'wood_dark'); R(u + 0.28, -0.05, u + 0.32, 0.07, (k + 1) * sh - 1.2, (k + 1) * sh - 0.5, 'timber'); }
  R(0.15, -0.015, L - 0.15, 0.02, 0.5, 1.1, 'plaster_damp');
  for (let i = 0; i < 3; i++) { const u = 0.5 + rand() * (L - 2), w = 0.5 + rand(); R(u, -0.02, u + w, 0.01, 1.2 + rand() * 2.2, 1.6 + rand() * 2.2, 'mud_plaster'); }
  // the stair along the side wall up to the roof (a flight of mud steps on a solid mass), against the front
  { const st = Math.min(hd - 1.0, 7.6), nS = Math.round(H / 0.3);
    for (let i = 0; i < nS; i++) { const v = 0.0 + i * (st / nS); R(stairU, v, stairU + 1.0, Math.min(hd, v + st / nS + 0.02), 0, 0.3 + i * 0.3, 'mudbrick'); }
    col.ramp(F.R(stairU, 0, stairU + 1.0, st), y, y + H, F.out[1] > 0 ? 's' : F.out[1] < 0 ? 'n' : F.out[0] > 0 ? 'e' : 'w'); }
  // the ground room: a mat bed, a quern, jars, a stool, a lamp niche; the family at the quern
  { const ru0 = 0.7, ru1 = L - 0.7, rv0 = 0.7, rv1 = hd - 0.7;
    R(ru0, rv0, ru1, rv1, -0.05, 0.0, 'mud_plaster');
    const [mx, mz] = F.P(ru0 + 1.0, rv1 - 0.8); bag.add('reed_mat', box(-0.9, y, -0.5, 0.9, y + 0.1, 0.5).rotateY(F.yaw).translate(mx, 0, mz));
    for (let k = 0; k < 3; k++) { const [px, pz] = F.P(ru1 - 0.5, rv1 - 0.5 - k * 0.8); pithos(bag, col, px, y, pz, 0.7); }
    const [qx, qz] = F.P((ru0 + ru1) / 2 + 0.6, rv1 - 0.8); quern(bag, col, qx, y, qz, F.yaw);
    for (let k = 0; k < 3; k++) { const [px, pz] = F.P(ru0 + 0.5 + k * 0.5, rv0 + 0.5); basket(bag, px, y, pz, 0.26, 0.3, null); }
    const [fx, fz] = F.P((ru0 + ru1) / 2, rv0 + 1.0); figureAt(ctx, fx, fz, y, ox, oz, { seed: el.seed + 5, dress: rand() < 0.5 ? 'sheath' : 'shendyt', cloth: 'linen', skin: 'skin_dark', hair: rand() < 0.5 ? 'long' : 'shaven', pose: 'sit_ground' });
  }
  // the yard behind: a low wall, the round granary silo, an oven, a palm, a pen of reed
  { const yv0 = hd + 0.2, yv1 = D - 0.4;
    if (yv1 - yv0 > 2.5) {
      R(0.1, yv1 - 0.3, L - 0.1, yv1, 0, 1.5, 'mudbrick', true); R(0.1, yv0, 0.4, yv1, 0, 1.5, 'mudbrick', true); R(L - 0.4, yv0, L - 0.1, yv1, 0, 1.5, 'mudbrick', true);
      const [sx, sz] = F.P(L * 0.3, (yv0 + yv1) / 2); bag.add('mud_plaster', lathe([[1.0, 0], [1.1, 1.2], [0.9, 2.2], [0.6, 2.6], [0.001, 2.9]], 10, null, sx, y, sz)); col.circle(sx, sz, 1.0, y, y + 2.6);
      const [ex, ez] = F.P(L * 0.62, yv0 + 0.9); oven(bag, col, ex, y, ez, 0.55, F.yaw);
      const [px, pz] = F.P(L * 0.8, (yv0 + yv1) / 2 + 0.3); palm(bag, col, px, y, pz, 4.5 + rand() * 2, el.seed);
    }
  }
}
// Near-alike materials folded into one (the plan's meshes are plan × material: the houses are the bulk of the settlement's count).
const FOLD = { cloth_indigo: 'egyptian_blue', cloth_green: 'cloth_ochre', cloth_brown: 'cloth_ochre', hide_black: 'granite_black', skin_dark: 'skin_medium', plaster_streak: 'plaster_damp', shutter_grey: 'shutter_brown', mud_plaster: 'mudbrick', steel_grey: 'iron', glaze_blue: 'egyptian_blue', hide_brown: 'timber', pottery_dark: 'terracotta', paint_ochre: 'plaster_ochre', sacking: 'wicker', cedar: 'timber', rope_fibre: 'wicker', reed_mat: 'wicker', bark_dark: 'palm_trunk', flagstone: 'limestone', cotto_floor: 'terracotta', rubble: 'mudbrick', sandstone: 'limestone', pebbles: 'limestone', ivory: 'linen' };
const folded = (fn) => (el, ctx) => fn(el, { ...ctx, bag: new Proxy(ctx.bag, { get: (t, k) => (k === 'add' ? (m, ...r) => t.add(FOLD[m] ?? m, ...r) : typeof t[k] === 'function' ? t[k].bind(t) : t[k]) }) });
export const HOUSES = { ptol_house: folded(house), egyptian_house: folded(egyptianHouse) };
