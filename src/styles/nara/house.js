// The houses of the capital in 752 (docs/settlements/nara.md §15): the shared Heian village house (vernacular house_japan)
// dressed at eye level — the noren curtain in the door, a bench or trestle of goods under the deep eave, the hung
// signboard of a shop, firewood, jars, baskets, a drying pole — and, where the house is open and a shop, the inside of a
// shop: the counter across the raised floor with its goods, stock on the earth floor.
//
// nara_house { rect, y, foot, front ('s' | 'n'), seed, open, shop (bool), trade, use, simple }
//   use (the temple's service quarter, docs/settlements/nara.md §16): 'inn' | 'scriptorium' | 'kitchen' | 'carpenter' | 'lodge' | 'incense' | 'oil' —
//   its own front (banner and lanterns, blinds, hearth and cauldron, timbers on trestles, spear rack, goods) and its room furnished for the work.

import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

function rng(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TRADES = ['rice', 'cloth', 'pottery', 'wood', 'greens', 'sake', 'fish'];
const USES = ['inn', 'scriptorium', 'kitchen', 'carpenter', 'lodge', 'incense', 'oil'];
const jar = (r, h, x, y, z) => lathe([[0.001, 0], [r * 0.5, 0], [r, h * 0.25], [r * 1.1, h * 0.55], [r * 0.8, h * 0.88], [r * 0.6, h], [0.001, h]], 9, null, x, y, z);

export function naraHouse(el, ctx) {
  const { bag, col, lights } = ctx;
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
  const use = USES.includes(el.use) ? el.use : null, trade = el.trade ?? TRADES[Math.floor(rand() * TRADES.length)];
  const CL = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_brown'];
  const side = rand() < 0.5 ? -1 : 1;                       // which side of the door the goods stand
  const su = du + side * (1.5 + rand() * 0.5);
  // the noren in the door, under the eave; a shop's is longer and darker
  Bx(shop ? 'cloth_indigo' : CL[Math.floor(rand() * 6)], du - 0.55, -0.1, du + 0.55, -0.07, y + (shop ? 0.9 : 1.2), y + 2.05);
  Bx('wood_dark', du - 0.62, -0.13, du + 0.62, -0.07, y + 2.05, y + 2.12);
  const inside = su > 0.9 && su < L - 0.9 && !(use && use !== 'incense' && use !== 'oil');
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
      else if (trade === 'incense') for (let i = 0; i < 4; i++) { Bx(['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_ochre'][i], su - 0.8 + i * 0.42, -0.78, su - 0.5 + i * 0.42, -0.42, y + 0.46, y + 0.58 + (i % 2) * 0.1); Bx('lacquer_red', su - 0.76 + i * 0.42, -0.74, su - 0.54 + i * 0.42, -0.5, y + 0.58 + (i % 2) * 0.1, y + 0.64 + (i % 2) * 0.1); }
      else if (trade === 'oil') for (let i = 0; i < 3; i++) { const p = P(su - 0.6 + i * 0.6, -0.58); bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0], [0.26, 0.18], [0.26, 0.34], [0.14, 0.46], [0.001, 0.46]], 10, null, p[0], y + 0.46, p[1])); }
      else if (trade === 'sake') for (let i = 0; i < 3; i++) { const p = P(su - 0.6 + i * 0.6, -0.58); bag.add('timber', lathe([[0.001, 0], [0.24, 0], [0.3, 0.2], [0.3, 0.4], [0.24, 0.5], [0.001, 0.5]], 10, null, p[0], y + 0.46, p[1])); }
      else for (let i = 0; i < 4; i++) { Bx('bamboo_culm', su - 0.7 + i * 0.45, -0.7, su - 0.66 + i * 0.45, -0.66, y + 1.2, y + 2.2); for (let k = 0; k < 4; k++) Bx('hide_grey', su - 0.74 + i * 0.45, -0.72, su - 0.62 + i * 0.45, -0.64, y + 1.35 + k * 0.2, y + 1.5 + k * 0.2); }
      const sx = du - side * 1.4;                                        // the signboard on the other side of the door
      Bx('wood_dark', sx - 0.04, -0.9, sx + 0.04, 0, y + 2.55, y + 2.62);
      Bx('lacquer_black', sx - 0.02, -0.92, sx + 0.02, -0.5, y + 1.65, y + 2.55);
      Bx('gilt_bronze', sx + 0.02, -0.88, sx + 0.035, -0.54, y + 1.75, y + 2.45);
      Bx('cloth_red', sx - 0.035, -0.88, sx - 0.02, -0.54, y + 1.75, y + 2.45);
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
      for (let i = 0; i < 4; i++) { const u = cu0 + 0.2 + i * (cu1 - cu0 - 0.5) / 3; if (trade === 'pottery' || trade === 'sake' || trade === 'oil') Jr(0.1, 0.22, u, 1.85, fy + 1.05); else Bx(CL[(i + 2) % 6], u, 1.7, u + 0.3, 2.0, fy + 1.05, fy + 1.2); }
      for (let i = 0; i < 2; i++) Bx('wicker', T + 0.05 + i * 0.7, 0.35, T + 0.55 + i * 0.7, 0.85, fy, fy + 0.45, true);
    }
  }
  if (use) serviceHouse(el, ctx, { Bx, Jr, P, L, D, du, y, use, shop });
  else if (el.open && lights) { const q = P(L / 2, D / 2); lights.push({ at: [q[0], y + 2.3, q[1]], color: '#ffd9a0', intensity: 2.2, distance: 7 }); }
}

/** The service quarter's houses: the front and the furnished room of each use, a lamp in the room (lights: at most two). */
function serviceHouse(el, ctx, helpers) {
  const { bag, col, lights } = ctx, { Bx, Jr, P, L, D, du, y, use, shop } = helpers;
  const T = 0.3, fy = y + 0.45, rf = fy + 0.4, hv = (T + 1.2 + D - T) / 2;
  // the free side of the room: the wall on the side of the door with more floor, t from that wall along the front
  const left = du > L / 2, U = (t) => (left ? T + 0.1 + t : L - T - 0.1 - t);
  // (what stands in the door's line, outside or on the earth floor, is kept to the free side's width)
  const zw = left ? du - 0.9 - (T + 0.1) : L - T - 0.1 - (du + 0.9);
  const Z = (t0, v0, t1, v1, ya, yb, m, c = false) => {
    if (Math.min(v0, v1) < 1.5 && t1 > zw) { if (t0 > zw - 0.05) return; t1 = zw; }
    Bx(m, U(t0), v0, U(t1), v1, ya, yb, c);
  };
  const lat = (m, prof, u, v, ya) => { const p = P(u, v); bag.add(m, lathe(prof, 9, null, p[0], ya, p[1])); };
  const lampAt = (u, v, ya) => { const p = P(u, v); bag.add('lamp_paper', box(p[0] - 0.16, ya + 0.2, p[1] - 0.16, p[0] + 0.16, ya + 0.58, p[1] + 0.16)); bag.add('wood_dark', box(p[0] - 0.2, ya, p[1] - 0.2, p[0] + 0.2, ya + 0.2, p[1] + 0.2)); bag.add('wood_dark', box(p[0] - 0.17, ya + 0.58, p[1] - 0.17, p[0] + 0.17, ya + 0.62, p[1] + 0.17)); col.rect([p[0] - 0.2, p[1] - 0.2, p[0] + 0.2, p[1] + 0.2], ya, ya + 0.6); return p; };
  // the front, outside the wall (v < 0): the banner on its pole, the lanterns, the blinds, the hearth and cauldron, the timbers, the spears
  const sgn = left ? 1 : -1, fu = (t) => U(t);
  const tall = (m, u, v, w, h, ya = 0, c = true) => Bx(m, u - w, v - w, u + w, v + w, y + ya, y + ya + h, c);
  if (use === 'inn') {
    // a banner of red cloth on a bamboo pole, two paper lanterns under the eave either side of the door, a deep valance on two posts over the step
    tall('bamboo_culm', du + sgn * -2.3, -1.0, 0.04, 3.6);
    Bx('cloth_red', du - sgn * 2.3 - 0.32, -1.02, du - sgn * 2.3 + 0.32, -0.98, y + 1.0, y + 3.5);
    for (const s of [-1, 1]) { Bx('lamp_paper', du + s * 1.3 - 0.14, -0.3, du + s * 1.3 + 0.14, -0.02, y + 1.85, y + 2.3); Bx('wood_dark', du + s * 1.3 - 0.02, -0.18, du + s * 1.3 + 0.02, -0.14, y + 2.3, y + 2.6); }
    Bx('cloth_indigo', du - 1.25, -0.9, du + 1.25, -0.1, y + 2.5, y + 2.56); Bx('wood_dark', du - 1.3, -0.95, du + 1.3, -0.85, y + 2.56, y + 2.64);
    for (const s of [-1, 1]) tall('wood_dark', du + s * 1.25, -0.9, 0.05, 2.5);
    for (let i = 0; i < 4; i++) Bx('hide_tan', fu(0.2 + i * 0.35), -0.6, fu(0.2 + i * 0.35 + 0.22), -0.2, y + 0.02, y + 0.06);          // straw sandals at the step
  } else if (use === 'scriptorium') {
    // blinds of split bamboo hung over the windows either side of the door, a black plaque with gilt characters over it
    for (const [a, b] of left ? [[0.35, du - 0.95]] : [[du + 0.95, L - 0.35]]) if (b - a > 1) { Bx('bamboo_culm', a, -0.2, b, -0.15, y + 1.15, y + 2.45); for (let u = a + 0.2; u < b; u += 0.4) Bx('lacquer_black', u - 0.01, -0.21, u + 0.01, -0.19, y + 1.15, y + 2.45); }
    Bx('lacquer_black', du - 0.6, -0.12, du + 0.6, -0.06, y + 2.2, y + 2.55); Bx('gilt_bronze', du - 0.45, -0.14, du + 0.45, -0.12, y + 2.3, y + 2.45);
    tall('wood_dark', du + sgn * 1.6, -0.6, 0.05, 1.0); Bx('lacquer_black', du + sgn * 1.6 - 0.25, -0.65, du + sgn * 1.6 + 0.25, -0.58, y + 1.0, y + 1.5);     // the notice board on its post
  } else if (use === 'kitchen') {
    // an open hearth of stones by the door with a great iron cauldron, a woodpile stacked to the eave, a water vat
    Z(0.2, -1.5, 1.4, -0.5, y, y + 0.55, 'rubble', true); lat('iron', [[0.001, 0], [0.42, 0.02], [0.5, 0.18], [0.46, 0.34], [0.001, 0.34]], U(0.8), -1.0, y + 0.55);
    Bx('flame', U(0.45), -0.55, U(1.15), -0.5, y + 0.12, y + 0.3);
    Z(1.55, -0.5, 2.55, -0.1, y, y + 1.5, 'log_pine', true);
    { const p = P(U(2.95), -0.8); lat('timber', [[0.001, 0], [0.32, 0], [0.4, 0.35], [0.34, 0.75], [0.001, 0.75]], U(2.95), -0.8, y); col.rect([p[0] - 0.34, p[1] - 0.34, p[0] + 0.34, p[1] + 0.34], y, y + 0.75); }
  } else if (use === 'carpenter') {
    // timbers leaning on the wall, a log on two trestles for the saw, shavings on the ground
    for (let i = 0; i < 4; i++) Z(0.15 + i * 0.3, -0.45, 0.4 + i * 0.3, -0.2, y, y + 2.3 - i * 0.12, i % 2 ? 'timber' : 'log_pine', true);
    for (const t of [1.6, 3.0]) Z(t, -1.3, t + 0.14, -0.7, y, y + 0.65, 'wood_dark', true);
    Z(1.5, -1.2, 3.3, -0.8, y + 0.65, y + 0.95, 'log_pine', true);
    for (let i = 0; i < 5; i++) Z(1.3 + i * 0.4, -1.6 - (i % 2) * 0.3, 1.6 + i * 0.4, -1.4 - (i % 2) * 0.3, y, y + 0.03, 'wood_ochre');
  } else if (use === 'lodge') {
    // a bench by the door, a rack of spears and a black signboard on a post, a red pennant
    Z(0.2, -0.7, 2.2, -0.25, y + 0.35, y + 0.42, 'timber', true); for (const t of [0.3, 2.1]) Z(t, -0.6, t + 0.08, -0.3, y, y + 0.35, 'wood_dark');
    for (let i = 0; i < 5; i++) { Z(2.5 + i * 0.17, -0.5, 2.5 + i * 0.17 + 0.05, -0.44, y, y + 2.3, 'bamboo_culm'); Z(2.5 + i * 0.17, -0.5, 2.5 + i * 0.17 + 0.05, -0.44, y + 2.3, y + 2.5, 'iron'); }
    Z(2.4, -0.6, 3.3, -0.3, y + 0.9, y + 0.96, 'wood_dark');
    tall('wood_dark', du + sgn * -1.7, -0.8, 0.05, 2.6); Bx('lacquer_black', du - sgn * 1.7 - 0.3, -0.85, du - sgn * 1.7 + 0.3, -0.78, y + 1.4, y + 2.2); Bx('cloth_red', du - sgn * 1.7 - 0.3, -0.9, du - sgn * 1.7 + 0.3, -0.86, y + 2.25, y + 2.55);
  }
  if (!el.open) return;
  // the room
  let lamp = null;
  if (use === 'inn') {
    // bedding rolled out along the wall (quilts of indigo, white pillows), travellers' bundles and staffs at the back, a lamp stand, a water jar
    for (let i = 0; i < 3; i++) { Z(0, 2.5 + i * 1.2, 0.95, 3.5 + i * 1.2, rf, rf + 0.16, 'cloth_indigo'); Z(0, 2.5 + i * 1.2, 0.3, 3.5 + i * 1.2, rf + 0.16, rf + 0.26, 'cloth_white'); }
    for (let i = 0; i < 2; i++) Z(1.3 + i * 0.7, D - T - 1.0, 1.75 + i * 0.7, D - T - 0.5, rf, rf + 0.32 + i * 0.1, 'sacking', true);
    for (let i = 0; i < 3; i++) { Z(2.9 + i * 0.12, D - T - 0.15, 2.95 + i * 0.12, D - T - 0.1, rf, rf + 1.6, 'bamboo_culm'); }
    lamp = lampAt(U(1.6), 4.2, rf); Jr(0.22, 0.5, U(0.4), 1.0, rf - 0.4);
  } else if (use === 'scriptorium') {
    // three low desks in a row with sheets, ink stones and brush pots, a cushion before each; a rack of scrolls at the back wall; a lamp
    for (let i = 0; i < 3; i++) {
      const v = 2.7 + i * 1.25;
      Z(0.15, v, 1.1, v + 0.6, rf + 0.3, rf + 0.34, 'timber', true);
      for (const [a, b] of [[0.2, 0.05], [1.05, 0.05], [0.2, 0.55], [1.05, 0.55]]) Z(a, v + b - 0.04, a + 0.06, v + b + 0.02, rf, rf + 0.3, 'wood_dark');
      Z(0.35, v + 0.12, 0.85, v + 0.48, rf + 0.34, rf + 0.345, 'cloth_white'); Z(0.9, v + 0.1, 1.02, v + 0.18, rf + 0.34, rf + 0.38, 'lacquer_black'); Z(0.9, v + 0.4, 0.95, v + 0.45, rf + 0.34, rf + 0.5, 'bamboo_culm');
      Z(1.4, v + 0.05, 1.95, v + 0.55, rf, rf + 0.04, 'cloth_ochre');
    }
    Z(2.4, D - T - 0.55, 4.2, D - T - 0.08, rf, rf + 1.5, 'wood_dark', true);
    for (const q of [0.5, 0.95, 1.4]) { Z(2.35, D - T - 0.6, 4.25, D - T - 0.04, rf + q, rf + q + 0.03, 'timber'); for (let k = 0; k < 6; k++) lat(k % 3 ? 'cloth_white' : 'cloth_ochre', [[0.001, 0], [0.05, 0.01], [0.05, 0.28], [0.001, 0.3]], U(2.55 + k * 0.28), D - T - 0.32, rf + q + 0.03); }
    lamp = lampAt(U(1.7), 4.4, rf);
  } else if (use === 'kitchen') {
    // a clay stove of two mouths in the earth-floor part with an iron cauldron and a wooden steamer on it, the fire in the mouth; rice sacks and firewood at the back; a row of jars
    Z(0, 0.4, 1.8, 1.4, y + 0.45, y + 1.3, 'earth_wall', true); Bx('flame', U(0.3), 0.36, U(0.75), 0.4, y + 0.6, y + 0.9); Bx('flame', U(1.05), 0.36, U(1.5), 0.4, y + 0.6, y + 0.9);
    lat('iron', [[0.001, 0], [0.34, 0.02], [0.4, 0.16], [0.001, 0.2]], U(0.9), 0.9, y + 1.3); lat('timber', [[0.3, 0], [0.3, 0.55], [0.22, 0.6], [0.001, 0.6]], U(0.9), 0.9, y + 1.45);
    lat('iron', [[0.001, 0], [0.3, 0.02], [0.36, 0.14], [0.001, 0.18]], U(1.45), 0.9, y + 1.3);
    for (let i = 0; i < 2; i++) Z(0, D - T - 1.2 + i * 0.01, 0.9, D - T - 0.3, rf + i * 0.34, rf + 0.34 + i * 0.34, 'sacking', true);
    Z(1.1, D - T - 0.7, 2.6, D - T - 0.1, rf, rf + 0.9, 'log_pine', true);
    for (let i = 0; i < 4; i++) Jr(0.26 - (i % 2) * 0.04, 0.6, U(2.0 + i * 0.6), 2.6, rf);
    lamp = P(U(1.0), 1.4);
  } else if (use === 'carpenter') {
    // a bench with a plank being planed, the tools, a stack of boards at the back, shavings on the floor and a tool board on the wall
    Z(0.1, 2.6, 2.7, 3.35, rf, rf + 0.8, 'timber', true); Z(0.4, 2.8, 2.2, 3.15, rf + 0.8, rf + 0.86, 'planks_grey');
    for (const [t, m] of [[2.4, 'wood_dark'], [2.5, 'iron']]) Z(t, 2.9, t + 0.12, 3.1, rf + 0.8, rf + 0.88, m);
    Z(0.1, D - T - 1.5, 2.4, D - T - 0.1, rf, rf + 0.7, 'planks_grey', true);
    for (let i = 0; i < 7; i++) Z(0.2 + i * 0.4, 4.0 + (i % 3) * 0.5, 0.5 + i * 0.4, 4.2 + (i % 3) * 0.5, rf, rf + 0.025, 'wood_ochre');
    Z(0.0, 4.2, 0.06, 5.8, rf + 0.9, rf + 1.9, 'wood_dark'); for (let k = 0; k < 6; k++) Z(0.06, 4.35 + k * 0.25, 0.14, 4.4 + k * 0.25, rf + 1.1 + (k % 3) * 0.25, rf + 1.5 + (k % 3) * 0.25, 'iron');
    lamp = lampAt(U(1.9), 4.4, rf);
  } else if (use === 'lodge') {
    // a bench along the wall, the spears and a rack of hats and cuirasses, a drum, a lamp
    Z(0, 2.4, 0.55, 5.6, rf, rf + 0.42, 'timber', true);
    for (let i = 0; i < 6; i++) { Z(1.0 + i * 0.22, D - T - 0.15, 1.05 + i * 0.22, D - T - 0.1, rf, rf + 2.1, 'bamboo_culm'); Z(1.0 + i * 0.22, D - T - 0.15, 1.05 + i * 0.22, D - T - 0.1, rf + 2.1, rf + 2.3, 'iron'); }
    for (let k = 0; k < 3; k++) { Z(2.6 + k * 0.5, D - T - 0.3, 2.95 + k * 0.5, D - T - 0.1, rf + 1.1, rf + 1.5, 'lacquer_black'); Z(2.6 + k * 0.5, D - T - 0.3, 2.95 + k * 0.5, D - T - 0.1, rf + 1.5, rf + 1.58, 'iron'); }
    lat('timber', [[0.001, 0], [0.34, 0.05], [0.4, 0.3], [0.34, 0.55], [0.001, 0.6]], U(2.2), 6.0, rf); lat('hide_tan', [[0.001, 0.6], [0.34, 0.6], [0.001, 0.62]], U(2.2), 6.0, rf);
    lamp = lampAt(U(1.4), 4.0, rf);
  } else if (use === 'incense') {
    // shelves of boxes and bundles on the side wall, a bronze censer on the counter's end, scales on a stand
    Z(0, 3.0, 0.4, 6.0, rf, rf + 1.9, 'wood_dark', true);
    for (let q = 0; q < 4; q++) for (let k = 0; k < 4; k++) Z(0.02, 3.1 + k * 0.7, 0.34, 3.6 + k * 0.7, rf + 0.15 + q * 0.45, rf + 0.35 + q * 0.45, ['lacquer_red', 'cloth_ochre', 'cloth_white', 'lacquer_black'][(q + k) % 4]);
    lat('bronze', [[0.001, 0], [0.14, 0.02], [0.2, 0.14], [0.16, 0.22], [0.001, 0.22]], U(2.2), 6.6, rf); lat('bronze', [[0.001, 0], [0.12, 0.01], [0.001, 0.03]], U(2.2), 6.6, rf + 0.22);
    lamp = lampAt(U(1.6), 4.4, rf);
  } else if (use === 'oil') {
    // jars of oil in rows along the back wall, a lamp stand burning one, a measure and funnel on a stool
    for (let i = 0; i < 6; i++) Jr(0.3, 0.7, U(0.5 + (i % 3) * 0.8), D - T - 0.55 - Math.floor(i / 3) * 0.85, rf);
    lat('timber', [[0.001, 0], [0.18, 0], [0.18, 0.32], [0.001, 0.32]], U(0.6), 3.0, rf); lat('wood_dark', [[0.001, 0.32], [0.1, 0.32], [0.08, 0.44], [0.001, 0.44]], U(0.6), 3.0, rf);
    lamp = lampAt(U(1.8), 4.4, rf);
  }
  if (lamp && lights) lights.push({ at: [lamp[0], rf + 1.0, lamp[1]], color: '#ffd9a0', intensity: 2.6, distance: 8 });
  if (use === 'kitchen' && lights) { const q = P(U(0.9), 1.0); lights.push({ at: [q[0], y + 1.2, q[1]], color: '#ffb46b', intensity: 2.2, distance: 6 }); }
  void shop; void hv;
}
export const houseElements = { nara_house: naraHouse };
