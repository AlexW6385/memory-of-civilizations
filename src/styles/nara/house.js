// The houses of the capital in 752 (docs/settlements/nara.md §15): the shared Heian village house (vernacular house_japan)
// dressed at eye level — the noren curtain in the door, a bench or trestle of goods under the deep eave, the hung
// signboard of a shop, firewood, jars, baskets, a drying pole — and, where the house is open and a shop, the inside of a
// shop: the counter across the raised floor with its goods, stock on the earth floor.
//
// nara_house { rect, y, foot, front ('s' | 'n'), seed, open, shop (bool), simple }

import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

function rng(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TRADES = ['rice', 'cloth', 'pottery', 'wood', 'greens', 'sake', 'fish'];
const jar = (r, h, x, y, z) => lathe([[0.001, 0], [r * 0.5, 0], [r, h * 0.25], [r * 1.1, h * 0.55], [r * 0.8, h * 0.88], [r * 0.6, h], [0.001, h]], 9, null, x, y, z);

export function naraHouse(el, ctx) {
  const { bag, col } = ctx;
  STYLES.vernacular.elements.house_japan(el, ctx);
  if (el.simple) return;
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's', rand = rng((el.seed || 1) * 7 + 3);
  const L = x1 - x0, D = z1 - z0, nb = Math.max(2, Math.floor(L / 3.2)), du = (Math.floor(nb / 2) + 0.5) * L / nb;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : [x0 + u, z0 + v]);
  const Bx = (m, u0, v0, u1, v1, ya, yb, c = false) => {
    const a = P(u0, v0), b = P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3]));
    if (c) col.rect(r, ya, yb);
  };
  const Jr = (r, h, u, v, ya) => { const p = P(u, v); bag.add('pottery_dark', jar(r, h, p[0], ya, p[1])); };
  const shop = !!el.shop;
  const trade = TRADES[Math.floor(rand() * TRADES.length)];
  const CL = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_brown'];
  const side = rand() < 0.5 ? -1 : 1;                       // which side of the door the goods stand
  const su = du + side * (1.5 + rand() * 0.5);
  // the noren in the door, under the eave; a shop's is longer and darker
  Bx(shop ? 'cloth_indigo' : CL[Math.floor(rand() * 6)], du - 0.55, -0.1, du + 0.55, -0.07, y + (shop ? 0.9 : 1.2), y + 2.05);
  Bx('wood_dark', du - 0.62, -0.13, du + 0.62, -0.07, y + 2.05, y + 2.12);
  const inside = su > 0.9 && su < L - 0.9;
  if (inside) {
    if (shop) {
      // the trestle and the goods of the trade; the signboard on an arm from the eave
      Bx('timber', su - 0.9, -0.85, su + 0.9, -0.3, y + 0.38, y + 0.46, true);
      for (const u of [su - 0.8, su + 0.8]) for (const v of [-0.35, -0.8]) Bx('wood_dark', u - 0.04, v - 0.04, u + 0.04, v + 0.04, y, y + 0.38);
      if (trade === 'rice') for (let i = 0; i < 3; i++) Bx('sacking', su - 0.8 + i * 0.55, -0.8, su - 0.3 + i * 0.55, -0.35, y + 0.46, y + 0.8);
      else if (trade === 'cloth') for (let i = 0; i < 5; i++) Bx(CL[(i + Math.floor(rand() * 3)) % 6], su - 0.8 + i * 0.34, -0.8, su - 0.55 + i * 0.34, -0.35, y + 0.46, y + 0.7);
      else if (trade === 'pottery') for (let i = 0; i < 4; i++) Jr(0.16 + (i % 2) * 0.04, 0.3 + (i % 3) * 0.05, su - 0.6 + i * 0.4, -0.58, y + 0.46);
      else if (trade === 'wood') for (let i = 0; i < 6; i++) Bx('log_pine', su - 0.8 + (i % 3) * 0.55, -0.8, su - 0.3 + (i % 3) * 0.55, -0.35, y + 0.46 + Math.floor(i / 3) * 0.22, y + 0.66 + Math.floor(i / 3) * 0.22);
      else if (trade === 'greens') for (let i = 0; i < 3; i++) { Bx('wicker', su - 0.8 + i * 0.58, -0.8, su - 0.35 + i * 0.58, -0.38, y + 0.46, y + 0.7); Bx('lotus_leaf', su - 0.78 + i * 0.58, -0.78, su - 0.37 + i * 0.58, -0.4, y + 0.7, y + 0.76); }
      else if (trade === 'sake') for (let i = 0; i < 3; i++) { const p = P(su - 0.6 + i * 0.6, -0.58); bag.add('timber', lathe([[0.001, 0], [0.24, 0], [0.3, 0.2], [0.3, 0.4], [0.24, 0.5], [0.001, 0.5]], 10, null, p[0], y + 0.46, p[1])); }
      else for (let i = 0; i < 4; i++) { Bx('bamboo_culm', su - 0.7 + i * 0.45, -0.7, su - 0.66 + i * 0.45, -0.66, y + 1.2, y + 2.2); for (let k = 0; k < 4; k++) Bx('hide_grey', su - 0.74 + i * 0.45, -0.72, su - 0.62 + i * 0.45, -0.64, y + 1.35 + k * 0.2, y + 1.5 + k * 0.2); }
      const sx = du - side * 1.4;                                        // the signboard on the other side of the door
      Bx('wood_dark', sx - 0.04, -0.9, sx + 0.04, 0, y + 2.55, y + 2.62);
      Bx('lacquer_black', sx - 0.02, -0.92, sx + 0.02, -0.5, y + 1.65, y + 2.55);
      Bx('gilt_bronze', sx - 0.03, -0.9, sx + 0.03, -0.84, y + 1.75, y + 2.45);
      Bx('cloth_red', sx - 0.03, -0.62, sx + 0.03, -0.56, y + 1.75, y + 2.45);
    } else {
      // a house: a bench, a water jar, firewood stacked to the eave on the wall, a basket
      Bx('timber', su - 0.7, -0.5, su + 0.7, -0.15, y + 0.38, y + 0.45, true);
      Jr(0.28, 0.65, su + (rand() < 0.5 ? 1.2 : -1.2), -0.45, y);
      Bx('log_pine', su - 1.6 * side - 0.5, -0.45, su - 1.6 * side + 0.5, -0.05, y, y + 1.0 + rand() * 0.3, true);
      if (rand() < 0.6) { Bx('wicker', su + 0.9 * side, -0.5, su + 1.3 * side, -0.15, y + 0.45, y + 0.7); }
    }
  }
  // the inside of a shop: a counter across the raised floor on the side away from the hearth, goods on it, crates and jars on the earth floor
  if (shop && el.open) {
    const T = 0.3, fy = y + 0.45, cu0 = T + 0.2, cu1 = Math.max(cu0 + 1.4, du - 1.2);
    if (cu1 < L - T - 1) {
      Bx('timber', cu0, 1.55, cu1, 2.15, fy + 0.4, fy + 1.0, true);
      Bx('wood_dark', cu0 - 0.05, 1.5, cu1 + 0.05, 2.2, fy + 1.0, fy + 1.05);
      for (let i = 0; i < 4; i++) { const u = cu0 + 0.2 + i * (cu1 - cu0 - 0.5) / 3; if (trade === 'pottery' || trade === 'sake') Jr(0.1, 0.22, u, 1.85, fy + 1.05); else Bx(CL[(i + 2) % 6], u, 1.7, u + 0.3, 2.0, fy + 1.05, fy + 1.2); }
      for (let i = 0; i < 2; i++) Bx('wicker', T + 0.05 + i * 0.7, 0.35, T + 0.55 + i * 0.7, 0.85, fy, fy + 0.45, true);
    }
  }
}
export const houseElements = { nara_house: naraHouse };
