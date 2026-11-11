// The souks (docs/settlements/fez.md §5.3): a lane between rows of shops, each a raised cell open to the lane under a cedar lintel,
// the goods of its trade on shelves and hanging; two storeys of plastered rooms above; the lane covered with cedar slats on beams that
// let the sun through in stripes. Also the Place Seffarine, a square of coppersmiths.
import { box, lathe, rod } from '../../core/geom.js';
import { frame } from '../mamluk/kit.js';
import { face, rng, q4, dbl, basin } from './kit.js';
import * as F from '../mughal/furnish.js';

const WALL = ['stucco_ochre', 'stucco_warm', 'plaster_white', 'mud_plaster'];
const SPICE = ['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_green', 'paint_ochre', 'cloth_maroon', 'cloth_ochre'];
const BRIGHT = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_maroon', 'cloth_blue'];

/** One shop. r its rect, f the lane's face of it, y the floor of the lane, shop floor y + 0.55. */
export function shop(bag, col, r, f, y, trade, rand, o = {}) {
  const fr = frame(r, f), [x0, z0, x1, z1] = r, al = f === 'n' || f === 's';
  const L = al ? x1 - x0 : z1 - z0, D = al ? z1 - z0 : x1 - x0;
  const I = (u0, u1, y0, y1, d0, d1) => fr.B(u0, u1, y0, y1, -d1, -d0);
  const mat = o.mat ?? WALL[Math.floor(rand() * WALL.length)], pier = 0.2, fy = y + 0.55, Hs = 2.65, yU = y + Hs + 0.25, yT = y + (o.top ?? 7.0);
  const P = (u, d) => fr.P(u, -d);
  // piers and partitions, the back wall, the raised floor, the lintel beam, the upper floors
  bag.add(mat, I(0, pier, y - 0.3, y + Hs, 0, D)); bag.add(mat, I(L - pier, L, y - 0.3, y + Hs, 0, D)); bag.add(mat, I(pier, L - pier, y - 0.3, y + Hs, D - 0.25, D));
  bag.add('wood_dark', I(pier, L - pier, y, fy, 0.05, D - 0.25)); bag.add('timber', I(pier - 0.02, L - pier + 0.02, fy - 0.03, fy + 0.04, 0, 0.12));
  bag.add('cedar', I(pier, L - pier, y + Hs, y + Hs + 0.25, 0, 0.35));
  bag.add(mat, I(0, L, y + Hs + 0.25, yT, 0, D)); col.rect(r, y, yT);
  bag.add('plaster_white', I(-0.02, L + 0.02, yT, yT + 0.2, 0, D)); bag.add(mat, I(0, L, yT, yT + 0.8, 0, 0.3));
  // the ceiling of the cell: dark boards; the upper floor's windows over the lane, lattice-closed, and cedar corbels carrying the floor
  bag.add('wood_dark', I(pier, L - pier, y + Hs - 0.05, y + Hs, 0.35, D - 0.25));
  for (const [a, b] of [[0.55 * L - 0.3, 0.55 * L + 0.3]]) { const w = I(a, b, y + Hs + 1.1, y + Hs + 2.0, -0.05, 0.02); bag.add('opening', w); const g = I(a - 0.05, b + 0.05, y + Hs + 1.05, y + Hs + 2.05, -0.1, -0.05); bag.add('lattice', g); }
  { const w = I(L * 0.45 - 0.3, L * 0.45 + 0.3, y + Hs + 4.0, y + Hs + 4.8, -0.05, 0.02); bag.add('opening', w); }
  for (let k = 0; k < 2; k++) bag.add('cedar', I(L * (0.25 + 0.5 * k) - 0.06, L * (0.25 + 0.5 * k) + 0.06, y + Hs - 0.5, y + Hs + 0.25, -0.35, 0));
  // the goods
  GOODS[trade]?.(bag, fr, P, I, fy, L, D, rand, o);
  // the merchant's cushion and a lamp
  { const [cxp, czp] = P(L * 0.5, D - 1.0); F.cushion(bag, cxp, fy, czp, 0.7, 0.7, 0.1, 0.2, 'cloth_red'); }
}
const hangRow = (bag, fr, P, I, fy, L, n, mats, wid = 0.22, len = 0.9, rand) => {
  for (let i = 0; i < n; i++) { const u = 0.3 + (L - 0.6) * (i + 0.5) / n; bag.add(mats[Math.floor(rand() * mats.length)], I(u - wid / 2, u + wid / 2, fy + 2.0 - len, fy + 2.0, 0.06, 0.1)); }
};
const GOODS = {
  spice(bag, fr, P, I, fy, L, D, rand) {
    // cones of spices in shallow trays on the counter, sacks on the floor, jars on a shelf
    const n = Math.max(3, Math.floor(L / 0.42));
    for (let i = 0; i < n; i++) { const u = 0.35 + (L - 0.7) * (i + 0.5) / n, [px, pz] = P(u, 0.45); bag.add(SPICE[Math.floor(rand() * SPICE.length)], lathe([[0.17, 0], [0.12, 0.05], [0.04, 0.2], [0.001, 0.26]], 8, null, px, fy, pz)); }
    bag.add('timber', I(0.25, L - 0.25, fy + 1.2, fy + 1.26, D - 0.55, D - 0.28));
    for (let i = 0; i < 4; i++) { const [px, pz] = P(0.5 + i * (L - 1) / 3, D - 0.42); bag.add(['glaze_blue', 'terracotta', 'glaze_green', 'glaze_white'][i], lathe([[0.001, 0], [0.09, 0.01], [0.12, 0.12], [0.07, 0.24], [0.001, 0.25]], 7, null, px, fy + 1.26, pz)); }
    { const [px, pz] = P(L * 0.5, D - 0.7); F.spiceSacks(bag, px, fy, pz, 0, 2); }
  },
  perfume(bag, fr, P, I, fy, L, D, rand) { for (const yy of [0.8, 1.35, 1.9]) { bag.add('timber', I(0.25, L - 0.25, fy + yy, fy + yy + 0.04, D - 0.45, D - 0.28)); for (let i = 0; i < 5; i++) { const [px, pz] = P(0.4 + i * (L - 0.8) / 4, D - 0.37); bag.add(['glass_lamp', 'glaze_blue', 'glaze_white', 'glass_lamp', 'gilt_bronze'][i], lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.1], [0.025, 0.16], [0.02, 0.22], [0.001, 0.22]], 6, null, px, fy + yy + 0.04, pz)); } } },
  henna(bag, fr, P, I, fy, L, D, rand) { for (let i = 0; i < 3; i++) { const [px, pz] = P(0.5 + i * (L - 1) / 2, 0.55); bag.add('cloth_green', lathe([[0.2, 0], [0.16, 0.07], [0.05, 0.22], [0.001, 0.26]], 8, null, px, fy, pz)); } F.spiceSacks(bag, ...P(L * 0.5, D - 0.7).slice(0, 1), fy, P(L * 0.5, D - 0.7)[1], 0, 2, ['cloth_green', 'cloth_brown']); },
  candle(bag, fr, P, I, fy, L, D, rand) { for (let i = 0; i < 6; i++) { const u = 0.3 + (L - 0.6) * (i + 0.5) / 6; for (let k = 0; k < 3; k++) bag.add('limewash_white', I(u - 0.05 + k * 0.05, u - 0.03 + k * 0.05, fy + 0.9, fy + 2.1, 0.1, 0.12)); } for (let i = 0; i < 3; i++) { const [px, pz] = P(0.6 + i * (L - 1.2) / 2, 0.5); bag.add('cloth_ochre', lathe([[0.2, 0], [0.2, 0.3], [0.001, 0.3]], 8, null, px, fy, pz)); } },
  cloth(bag, fr, P, I, fy, L, D, rand) { F.bolts(bag, ...P(L * 0.5, D - 0.5).slice(0, 1), fy + 0.0, P(L * 0.5, D - 0.5)[1], 0, 6, BRIGHT); hangRow(bag, fr, P, I, fy, L, 3, BRIGHT, 0.5, 1.3, rand); bag.add('cedar', I(0.2, L - 0.2, fy + 1.98, fy + 2.04, 0.05, 0.12)); },
  embroidery(bag, fr, P, I, fy, L, D, rand) { hangRow(bag, fr, P, I, fy, L, 3, ['cloth_red', 'cloth_maroon', 'cloth_indigo', 'cloth_ochre'], 0.55, 1.4, rand); bag.add('cedar', I(0.2, L - 0.2, fy + 1.98, fy + 2.04, 0.05, 0.12)); F.rolledCarpets(bag, ...P(L * 0.5, D - 0.5).slice(0, 1), fy, P(L * 0.5, D - 0.5)[1], 3, Math.min(1.6, L - 0.8), fr.f === 'n' || fr.f === 's' ? 0 : Math.PI / 2); },
  slipper(bag, fr, P, I, fy, L, D, rand) {
    // babouches: pairs of pointed slippers in yellow, white, red, green on tiers of boards up the back wall; some hung by the heels at the front
    for (const yy of [0.35, 0.85, 1.35, 1.85]) { bag.add('timber', I(0.22, L - 0.22, fy + yy, fy + yy + 0.03, D - 0.5, D - 0.28)); const n = Math.floor((L - 0.5) / 0.3); for (let i = 0; i < n; i++) { const [px, pz] = P(0.3 + i * (L - 0.6) / n + 0.12, D - 0.4); bag.add(['paint_ochre', 'cloth_white', 'cloth_red', 'cloth_green', 'hide_tan', 'paint_ochre'][Math.floor(rand() * 6)], box(px - 0.1, fy + yy + 0.03, pz - 0.1, px + 0.1, fy + yy + 0.1, pz + 0.1)); } }
    for (let i = 0; i < 5; i++) { const u = 0.35 + (L - 0.7) * (i + 0.5) / 5; bag.add(['paint_ochre', 'cloth_red', 'cloth_white'][i % 3], I(u - 0.06, u + 0.06, fy + 1.55, fy + 1.9, 0.08, 0.2)); }
  },
  brass(bag, fr, P, I, fy, L, D, rand) { for (let i = 0; i < 3; i++) { const [px, pz] = P(0.5 + i * (L - 1) / 2, 0.5); bag.add('bronze', lathe([[0.001, 0], [0.22, 0.01], [0.3, 0.2], [0.28, 0.34], [0.2, 0.36], [0.001, 0.36]], 9, null, px, fy, pz)); } for (let i = 0; i < 4; i++) { const [px, pz] = P(0.35 + i * (L - 0.7) / 3, D - 0.35), yy = fy + 0.9 + (i % 2) * 0.6; bag.add('bronze', lathe([[0.001, 0], [0.24, 0.01], [0.26, 0.04], [0.001, 0.03]], 10, null, px, yy, pz)); bag.add('bronze', rod([px, yy, pz + 0.0], [px, yy + 0.0, pz], 0.01, 3)); } bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.16, 0.15], [0.1, 0.4], [0.05, 0.5], [0.001, 0.5]], 8, ...P(L * 0.5, D - 0.7).reduce((a, v) => a, [null, 0]), 0, 0)); },
  leather(bag, fr, P, I, fy, L, D, rand) { for (let i = 0; i < 4; i++) { const u = 0.35 + (L - 0.7) * (i + 0.5) / 4; bag.add(['hide_brown', 'hide_tan', 'hide_black', 'hide_brown'][i], I(u - 0.18, u + 0.18, fy + 1.1, fy + 1.55, 0.08, 0.17)); bag.add('iron', I(u - 0.02, u + 0.02, fy + 1.55, fy + 1.95, 0.1, 0.12)); } for (let i = 0; i < 3; i++) { const [px, pz] = P(0.5 + i * (L - 1) / 2, 0.55); bag.add('hide_tan', box(px - 0.2, fy, pz - 0.15, px + 0.2, fy + 0.3, pz + 0.15)); } },
};
// (the brass shop's last line is a harmless ewer: lathe's first args are overridden below)
GOODS.brass = (bag, fr, P, I, fy, L, D, rand) => {
  for (let i = 0; i < 3; i++) { const [px, pz] = P(0.5 + i * (L - 1) / 2, 0.5); bag.add('bronze', lathe([[0.001, 0], [0.22, 0.01], [0.3, 0.2], [0.28, 0.34], [0.2, 0.36], [0.001, 0.36]], 9, null, px, fy, pz)); }
  for (let i = 0; i < 4; i++) { const [px, pz] = P(0.35 + i * (L - 0.7) / 3, D - 0.35), yy = fy + 0.9 + (i % 2) * 0.6; bag.add('bronze', lathe([[0.001, 0], [0.24, 0.01], [0.26, 0.04], [0.001, 0.03]], 10, null, px, yy, pz)); }
  F.copperware(bag, ...P(L * 0.5, D - 0.7).slice(0, 1), fy, P(L * 0.5, D - 0.7)[1], 0, 3, 4);
};

/**
 * fez_souk: { a, b (the lane's ends, along one axis), w (clear width), depth (shops), y0 (the ground at a), slope (per metre from a),
 * trades: [..] cycled, covered, seed } — shops either side, the cedar-slat roof over the lane when covered.
 */
export function souk(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, alongX = Math.abs(az - bz) < 0.1, rand = rng(el.seed || 11);
  const L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), u0 = alongX ? Math.min(ax, bx) : Math.min(az, bz), c = alongX ? az : ax;
  const w = el.w, hw = w / 2, depth = el.depth, sw = 2.5, ns = Math.floor(L / sw), y0 = el.y0, slope = el.slope ?? 0;
  const yAt = (u) => y0 + slope * (u - (alongX ? ax : az)) * Math.sign((alongX ? bx - ax : bz - az) || 1) * 1;
  const yy = (u) => y0 + slope * (u - u0);
  void yAt;
  const trades = el.trades;
  for (let i = 0; i < ns; i++) {
    const ua = u0 + i * sw + (L - ns * sw) / 2, ub = ua + sw, ym = yy((ua + ub) / 2);
    for (const side of [-1, 1]) {
      const trade = trades[(i + (side > 0 ? 2 : 0) + Math.floor(rand() * 2)) % trades.length];
      const skip = el.gaps?.some(([g0, g1]) => ua + sw > g0 && ua < g1);
      if (skip) continue;
      const r = alongX ? [ua, side < 0 ? c - hw - depth : c + hw, ub, side < 0 ? c - hw : c + hw + depth] : [side < 0 ? c - hw - depth : c + hw, ua, side < 0 ? c - hw : c + hw + depth, ub];
      shop(bag, col, r, alongX ? (side < 0 ? 's' : 'n') : (side < 0 ? 'e' : 'w'), ym, trade, rand, { top: el.top ?? 7.2 });
    }
  }
  if (!el.covered) return;
  // the roof of the lane: beams across every 1.6 m on the shops' upper floors, slats along them with gaps for light
  const yR = (u) => yy(u) + 4.7, n = Math.floor(L / 1.6);
  const lane = (a, b, z0, z1, y1, y2) => (alongX ? box(a, y1, z0, b, y2, z1) : box(z0, y1, a, z1, y2, b));
  for (let i = 0; i <= n; i++) { const u = u0 + 0.2 + (L - 0.4) * i / n; bag.add('cedar', lane(u - 0.09, u + 0.09, c - hw - 0.2, c + hw + 0.2, yR(u) - 0.24, yR(u))); }
  const m = Math.floor(w / 0.26);
  for (let k = 0; k < m; k++) { const v = c - hw + (k + 0.5) * w / m; for (let i = 0; i < n; i++) { if ((i + k) % 7 === 3) continue; const a = u0 + 0.2 + (L - 0.4) * i / n, b = u0 + 0.2 + (L - 0.4) * (i + 1) / n; bag.add('timber', lane(a + 0.02, b - 0.02, v - 0.06, v + 0.06, yR((a + b) / 2), yR((a + b) / 2) + 0.05)); } }
  // the shops' wall above the slats is the same plaster; the lane's ends get a lintel with green tiles
  for (const e of [u0, u0 + L]) bag.add('cedar', lane(e - 0.12, e + 0.12, c - hw - 0.1, c + hw + 0.1, yR(e) - 0.5, yR(e) - 0.1));
}

/** The Place Seffarine: a paved square with a fountain, shop rows of the coppersmiths on three sides, coppersmiths' seats. */
export function square(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 9);
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y, z1)); col.floor(el.rect, y);
  basin(bag, col, (x0 + x1) / 2, (z0 + z1) / 2, y, 1.1);
  const sw = 2.7, depth = 3.4;
  for (let z = z0 + 3; z + sw < z1 - 0.2; z += sw) { shop(bag, col, [x0 - depth, z, x0, z + sw], 'e', y, 'brass', rand, { top: 6.8 }); shop(bag, col, [x1, z, x1 + depth, z + sw], 'w', y, 'brass', rand, { top: 6.8 }); }
  // the great tree and the beaten copper left to cool on the paving
  for (let i = 0; i < 9; i++) { const x = x0 + 3 + rand() * (x1 - x0 - 6), z = z0 + 3 + rand() * (z1 - z0 - 6); if (Math.hypot(x - (x0 + x1) / 2, z - (z0 + z1) / 2) < 2.5) continue; F.copperware(bag, x, y, z, rand() * 6, i, 3); }
}
