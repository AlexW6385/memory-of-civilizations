// The village below the hill of Sanchi, 1st century (docs/settlements/sanchi.md §13): shop-houses with a verandah
// platform on timber posts under a tiled lean-to and a cloth valance, houses of mud and brick, flat-roofed mud
// houses with parapets, two-storey merchants' houses with timber balconies, thatched huts, cattle sheds; the ones
// marked `open` are hollow and furnished by trade (the pilgrims' trades: flowers, lamps, incense, bowls, robes,
// the ivory carvers of Vidisha). Plus the yard walls, the pilgrims' rest house, the ghat's steps, the tree shrine
// and the thatched stall. Adapted from src/styles/nagara/village.js (read-only there).
// Local frame of a building: u along the front from its left, v from the front face inward, heights above y.

import { box, fromTriangles, orientOutward, lathe, rod } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WALLS = ['plaster', 'earth_wall', 'mud_plaster', 'limewash_white', 'plaster', 'limewash_yellow', 'earth_wall', 'stucco_ochre'];
const pick = (rand, a) => a[Math.floor(rand() * a.length)];

/** A sloping prism roof: eaves at v = −o and D + o at height ye, ridge along u at yr (u from ua to ub). Returns local-frame triangles. */
function gable(P, ua, ub, D, o, ye, yr) {
  const p = (u, v, y) => { const [x, z] = P(u, v); return [x, y, z]; };
  const A = p(ua, -o, ye), B = p(ua, D + o, ye), C = p(ua, D / 2, yr), A2 = p(ub, -o, ye), B2 = p(ub, D + o, ye), C2 = p(ub, D / 2, yr);
  return orientOutward([...A, ...B, ...C, ...A2, ...C2, ...B2, ...A, ...C, ...C2, ...A, ...C2, ...A2, ...B, ...B2, ...C2, ...B, ...C2, ...C, ...A, ...A2, ...B2, ...A, ...B2, ...B]);
}

function building(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, f = el.front, y = el.y ?? 0, simple = !!el.simple, kind = el.kind || 'home';
  const rand = rng((el.seed || 1) + 5), along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const open = !!el.open && !simple, fy = y + 0.42, T = 0.3;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const pot = (m, u, v, r, h, ya = fy) => { const p = P(u, v); bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, p[0], ya, p[1])); };
  const wall = pick(rand, WALLS), flat = kind === 'mud', storeys = kind === 'merchant' ? 2 : 1;
  const H = (kind === 'hut' ? 2.5 : kind === 'shed' ? 2.6 : 3.1) + (storeys - 1) * 3.0, top = fy + H;
  const tiled = kind !== 'hut' && kind !== 'shed', roofM = tiled ? 'roof_tile' : 'thatch';
  // plinth under the house, the front platform (otla) a step above the lane
  bag.add('mudbrick', box(...(() => { const r = R(-0.1, -0.1, L + 0.1, D + 0.1); return [r[0], y - 0.6, r[1], r[2], fy, r[3]]; })()));
  const open0 = kind === 'shop' || kind === 'shed';
  const oD = 1.2;
  if (kind !== 'hut') {
    B('sandstone_floor', -0.05, -oD, L + 0.05, 0, y - 0.1, fy - 0.03);
    col.floor(R(-0.05, -oD, L + 0.05, 0), fy - 0.03);
    B('sandstone', -0.05, -oD - 0.02, L + 0.05, -oD + 0.1, y - 0.1, fy - 0.03);
  }
  // body
  const doorU = Math.floor(L / 2 / 1.0) * 1.0 + (rand() < 0.5 ? -0.8 : 0.8), shopW = L - 1.0;
  if (!open) {
    if (open0) { B(wall, 0, 0.6, L, D, fy, top, true); B(wall, 0, 0, 0.5, 0.6, fy, top, true); B(wall, L - 0.5, 0, L, 0.6, fy, top, true); B('opening', 0.5, 0.58, L - 0.5, 0.6 + 0.01, fy + 0.1, fy + 2.3); B('timber', 0.5, 0.0, L - 0.5, 0.6, fy + 2.3, fy + 2.5, false); }
    else B(wall, 0, 0, L, D, fy, top, true);
  } else {
    const dw = open0 ? shopW : 1.1, du = open0 ? L / 2 : Math.min(L - 1, Math.max(1, doorU));
    B(wall, 0, D - T, L, D, fy, top, true); B(wall, 0, T, T, D - T, fy, top, true); B(wall, L - T, T, L, D - T, fy, top, true);
    B(wall, 0, 0, du - dw / 2, T, fy, top, true); B(wall, du + dw / 2, 0, L, T, fy, top, true);
    B(wall, du - dw / 2, 0, du + dw / 2, T, fy + (open0 ? 2.4 : 2.1), top);
    const r = R(0, 0, L, D); col.floor(r, fy); col.rect(r, top - 0.1, top + 0.3);
    B('earth_wall', T, T, L - T, D - T, fy - 0.1, fy + 0.012); B('timber', T, T, L - T, D - T, top - 0.06, top - 0.02);
    for (let u = T + 0.6; u < L - T; u += 1.0) B('wood_dark', u - 0.07, T, u + 0.07, D - T, top - 0.24, top - 0.06);
    furnish(el.trade && kind === 'shop' ? el.trade : 'home');
    // the door leaf standing open inside
    if (!open0) B('timber', du - dw / 2 - 0.02, T, du - dw / 2 + 0.05, T + dw, fy, fy + 2.05);
  }
  function furnish(trade) {
    const bk = D - T, sb = (u0, v0, u1, v1, m, h, ya = 0) => B(m, u0, v0, u1, v1, fy + ya, fy + ya + h, true);
    const shelf = (u0, u1, rows = 3) => { for (let k = 0; k < rows; k++) B('timber', u0, bk - 0.4, u1, bk - 0.02, fy + 0.5 + k * 0.55, fy + 0.54 + k * 0.55); B('wood_dark', u0, bk - 0.4, u0 + 0.04, bk - 0.02, fy, fy + 0.5 + rows * 0.55); B('wood_dark', u1 - 0.04, bk - 0.4, u1, bk - 0.02, fy, fy + 0.5 + rows * 0.55); };
    const row = (u0, u1, v, h, m, n) => { for (let k = 0; k < n; k++) pot(m, u0 + (u1 - u0) * (k + 0.5) / n, v, 0.1 + rand() * 0.05, h, fy); };
    const goodsOnShelf = (u0, u1, mats) => { for (let k = 0; k < 3; k++) for (let i = 0; i < Math.max(2, Math.floor((u1 - u0) / 0.35)); i++) pot(pick(rand, mats), u0 + 0.2 + i * 0.35, bk - 0.2, 0.09 + rand() * 0.04, 0.16 + rand() * 0.1, fy + 0.54 + k * 0.55); };
    if (trade === 'home') {
      B('earth_wall', L - T - 1.0, bk - 0.6, L - T - 0.1, bk - 0.05, fy, fy + 0.35, true); pot('pottery_dark', L - T - 0.55, bk - 0.33, 0.18, 0.2, fy + 0.35);
      for (const u of [T + 0.4, T + 0.85]) pot('terracotta', u, bk - 0.4, 0.22, 0.45);
      const cu = L - T - 2.0;
      for (const v of [T + 0.7, T + 1.9]) { if (v + 0.9 > bk - 0.8 || cu < T + 0.8) continue; B('timber', cu, v, cu + 1.9, v + 0.9, fy + 0.4, fy + 0.46, true); B('cloth_white', cu + 0.05, v + 0.05, cu + 1.85, v + 0.85, fy + 0.46, fy + 0.48); for (const [a, b] of [[0, 0], [1.85, 0], [0, 0.85], [1.85, 0.85]]) B('timber', cu + a, v + b, cu + a + 0.05, v + b + 0.05, fy, fy + 0.4); }
      pot('earth_wall', T + 0.5, T + 0.8, 0.35, 1.0); B('cloth_ochre', T + 0.9, T + 0.2, T + 1.9, T + 0.45, fy, fy + 0.06);
      // the quern (two round stones) by the stove, a hanging lamp-niche in the back wall, bundled bedding and a basket
      { const qu = Math.max(T + 1.0, L - T - 1.6), p = P(qu, bk - 1.3); bag.add('granite_grey', lathe([[0.3, 0], [0.3, 0.1], [0.26, 0.14], [0.001, 0.14]], 14, null, p[0], fy, p[1])); bag.add('granite_grey', lathe([[0.26, 0.14], [0.26, 0.24], [0.08, 0.26], [0.001, 0.26]], 14, null, p[0], fy, p[1])); col.circle(p[0], p[1], 0.32, fy, fy + 0.26); }
      B('opening', L / 2 - 0.15, bk - 0.04, L / 2 + 0.15, bk, fy + 1.3, fy + 1.65); B('flame', L / 2 - 0.05, bk - 0.045, L / 2 + 0.05, bk, fy + 1.32, fy + 1.4);
      B('cloth_brown', T + 0.1, T + 1.6, T + 0.7, T + 2.2, fy, fy + 0.5); B('wicker', T + 0.1, T + 2.5, T + 0.65, T + 3.0, fy, fy + 0.35);
    } else if (trade === 'grain') {
      for (let k = 0; k < 4; k++) { const u = T + 0.7 + k * (L - 2 * T - 1.4) / 3; pot('sacking', u, bk - 0.5, 0.32, 0.8, fy); }
      B('timber', T + 0.3, T + 0.9, L - T - 0.3, T + 1.3, fy, fy + 0.8, true); for (let k = 0; k < 4; k++) pot('cloth_ochre', T + 0.7 + k * (L - 2 * T - 1.1) / 3, T + 1.1, 0.16, 0.12, fy + 0.8);
      B('iron', L / 2 - 0.15, T + 0.9, L / 2 + 0.15, T + 1.3, fy + 0.8, fy + 0.84);
    } else if (trade === 'potter') {
      shelf(T + 0.2, L - T - 0.2, 3); goodsOnShelf(T + 0.2, L - T - 0.2, ['terracotta', 'terracotta', 'pottery_dark']);
      for (let k = 0; k < 6; k++) pot('terracotta', T + 0.6 + (k % 3) * 0.6, T + 0.9 + Math.floor(k / 3) * 0.7, 0.2, 0.45, fy);
      B('timber', L - T - 1.0, T + 0.6, L - T - 0.3, T + 1.3, fy, fy + 0.3, true); B('terracotta', L - T - 0.95, T + 0.65, L - T - 0.35, T + 1.25, fy + 0.3, fy + 0.34);
    } else if (trade === 'cloth') {
      B('timber', T + 0.3, T + 1.0, L - T - 0.3, T + 2.2, fy, fy + 0.45, true); B('cloth_white', T + 0.4, T + 1.1, L - T - 0.4, T + 2.1, fy + 0.45, fy + 0.5);
      for (let k = 0; k < 5; k++) B(pick(rand, ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_white']), T + 0.5 + k * (L - 2 * T - 1.4) / 4, T + 1.3, T + 0.9 + k * (L - 2 * T - 1.4) / 4, T + 1.9, fy + 0.5, fy + 0.62);
      shelf(T + 0.2, L - T - 0.2, 3); for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) B(pick(rand, ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_white', 'cloth_maroon']), T + 0.3 + i * (L - 2 * T - 1) / 4, bk - 0.38, T + 0.3 + i * (L - 2 * T - 1) / 4 + 0.45, bk - 0.04, fy + 0.54 + k * 0.55, fy + 0.7 + k * 0.55);
    } else if (trade === 'oil') {
      // the oil press (kolhu): a stone mortar with a wooden pestle on a long arm; oil jars
      const mu = L / 2, mv = D / 2 + 0.2; const p = P(mu, mv);
      bag.add('granite_grey', lathe([[0.5, 0], [0.55, 0.3], [0.5, 0.75], [0.3, 0.75], [0.3, 0.3], [0.001, 0.3]], 12, null, p[0], fy, p[1])); col.circle(p[0], p[1], 0.55, fy, fy + 0.75);
      B('timber', mu - 0.08, mv - 0.08, mu + 0.08, mv + 0.08, fy + 0.3, fy + 2.4); B('timber', mu - 1.4, mv - 0.06, mu + 1.4, mv + 0.06, fy + 1.0, fy + 1.12);
      for (let k = 0; k < 5; k++) pot('pottery_dark', T + 0.5 + k * 0.5, bk - 0.45, 0.2, 0.5);
    } else if (trade === 'sweets') {
      B('brick', L - T - 1.4, T + 0.3, L - T - 0.3, T + 1.3, fy, fy + 0.8, true); pot('iron', L - T - 0.85, T + 0.8, 0.45, 0.2, fy + 0.8); B('flame', L - T - 1.2, T + 0.5, L - T - 0.5, T + 1.1, fy + 0.5, fy + 0.52);
      B('timber', T + 0.3, T + 0.9, L - T - 1.8, T + 1.5, fy, fy + 0.75, true); for (let k = 0; k < 4; k++) pot(pick(rand, ['bronze', 'cloth_ochre', 'cloth_white']), T + 0.6 + k * 0.4, T + 1.2, 0.17, 0.08, fy + 0.75);
      shelf(T + 0.2, L - T - 0.2, 2);
    } else if (trade === 'smith') {
      B('brick', T + 0.3, bk - 1.2, T + 1.5, bk - 0.1, fy, fy + 0.7, true); B('flame', T + 0.6, bk - 0.9, T + 1.2, bk - 0.4, fy + 0.7, fy + 0.72);
      B('timber', T + 1.7, bk - 0.4, T + 2.1, bk - 0.1, fy, fy + 0.3, true); B('iron', T + 1.65, bk - 0.45, T + 2.15, bk - 0.05, fy + 0.3, fy + 0.45, true);
      B('leather_bench', T + 0.2, bk - 1.9, T + 0.5, bk - 1.3, fy, fy + 0.35);
      for (let k = 0; k < 6; k++) B('iron', L - T - 0.15, T + 0.4 + k * 0.5, L - T - 0.05, T + 0.5 + k * 0.5, fy + 0.8, fy + 1.6);
    } else if (trade === 'flowers') {
      B('timber', T + 0.3, T + 0.6, L - T - 0.3, T + 1.2, fy, fy + 0.5, true);
      for (let k = 0; k < 6; k++) B(pick(rand, ['cloth_white', 'cloth_red', 'cloth_white']), T + 0.4 + k * (L - 2 * T - 1) / 5, T + 0.7, T + 0.4 + k * (L - 2 * T - 1) / 5 + 0.5, T + 1.1, fy + 0.5, fy + 0.58);
      for (let k = 0; k < 4; k++) pot('terracotta', T + 0.5 + k * 0.5, bk - 0.4, 0.2, 0.45);
    } else if (trade === 'lamps') {
      // lamp and oil seller: shelves of little clay lamps, oil jars and a stack of wicks on the counter
      shelf(T + 0.2, L - T - 0.2, 3); goodsOnShelf(T + 0.2, L - T - 0.2, ['terracotta', 'terracotta', 'pottery_dark']);
      B('timber', T + 0.3, T + 0.9, L - T - 0.3, T + 1.4, fy, fy + 0.8, true);
      for (let k = 0; k < 6; k++) pot('terracotta', T + 0.5 + k * (L - 2 * T - 1.0) / 5, T + 1.15, 0.07, 0.04, fy + 0.8);
      for (let k = 0; k < 3; k++) pot('pottery_dark', T + 0.5 + k * 0.55, T + 2.1, 0.25, 0.6);
    } else if (trade === 'incense') {
      // incense and powders: trays of coloured powders and resin on a low counter, bundles of sticks hung on a pole
      B('timber', T + 0.3, T + 0.8, L - T - 0.3, T + 1.4, fy, fy + 0.7, true);
      for (let k = 0; k < 5; k++) pot(pick(rand, ['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_brown', 'cloth_ochre']), T + 0.55 + k * (L - 2 * T - 1.1) / 4, T + 1.1, 0.16, 0.1, fy + 0.7);
      B('wood_dark', T + 0.2, bk - 0.1, L - T - 0.2, bk - 0.04, fy + 1.9, fy + 1.96);
      for (let k = 0; k < 6; k++) B('bamboo_culm', T + 0.4 + k * (L - 2 * T - 0.9) / 5, bk - 0.1, T + 0.46 + k * (L - 2 * T - 0.9) / 5, bk - 0.04, fy + 1.0, fy + 1.9);
      shelf(T + 0.2, T + 1.4, 2);
    } else if (trade === 'bowls') {
      // alms bowls and water strainers for the monks: stacks of dark bowls on shelves, a pile on the floor, a potter's wheel by the door
      shelf(T + 0.2, L - T - 0.2, 3); goodsOnShelf(T + 0.2, L - T - 0.2, ['pottery_dark', 'iron', 'pottery_dark', 'terracotta']);
      for (let k = 0; k < 4; k++) pot('pottery_dark', T + 0.6 + (k % 2) * 0.5, T + 0.8 + Math.floor(k / 2) * 0.5, 0.18, 0.12 + (k % 2) * 0.1, fy);
      B('timber', L - T - 1.1, T + 0.7, L - T - 0.4, T + 1.4, fy, fy + 0.35, true); pot('terracotta', L - T - 0.75, T + 1.05, 0.28, 0.06, fy + 0.35);
    } else if (trade === 'robes') {
      // cloth for the robes: bolts of ochre and white on shelves, a folded pile on the counter, a bamboo pole hung with lengths of cloth
      B('timber', T + 0.3, T + 1.0, L - T - 0.3, T + 1.8, fy, fy + 0.45, true); B('cloth_ochre', T + 0.4, T + 1.1, L - T - 0.4, T + 1.7, fy + 0.45, fy + 0.62);
      shelf(T + 0.2, L - T - 0.2, 3); for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) B(pick(rand, ['cloth_ochre', 'cloth_ochre', 'cloth_white', 'cloth_maroon']), T + 0.3 + i * (L - 2 * T - 1) / 4, bk - 0.38, T + 0.3 + i * (L - 2 * T - 1) / 4 + 0.45, bk - 0.04, fy + 0.54 + k * 0.55, fy + 0.72 + k * 0.55);
      B('bamboo_culm', T + 0.3, T + 0.3, L - T - 0.3, T + 0.36, fy + 2.0, fy + 2.06); for (let k = 0; k < 4; k++) B(pick(rand, ['cloth_ochre', 'cloth_white']), T + 0.5 + k * (L - 2 * T - 1.2) / 3, T + 0.31, T + 0.9 + k * (L - 2 * T - 1.2) / 3, T + 0.35, fy + 1.0, fy + 2.0);
    } else if (trade === 'ivory') {
      // the ivory carvers of Vidisha: a bench with tusks and half-carved plaques, a stool, tools in a rack, ivory dust on the floor
      B('timber', T + 0.3, T + 0.7, L - T - 1.0, T + 1.4, fy, fy + 0.85, true);
      for (let k = 0; k < 3; k++) B('ivory', T + 0.5 + k * 0.55, T + 0.85 + (k % 2) * 0.2, T + 0.62 + k * 0.55 + 0.5, T + 0.97 + (k % 2) * 0.2, fy + 0.85, fy + 0.93);
      B('ivory', L - T - 0.9, T + 0.5, L - T - 0.75, T + 0.65, fy, fy + 1.0); B('ivory', L - T - 0.65, T + 0.5, L - T - 0.5, T + 0.65, fy, fy + 0.7);
      B('leather_bench', T + 0.4, T + 1.7, T + 0.9, T + 2.1, fy, fy + 0.38); shelf(T + 0.2, L - T - 0.2, 2);
      for (let i = 0; i < 4; i++) B('ivory', T + 0.4 + i * (L - 2 * T - 1) / 4, bk - 0.3, T + 0.55 + i * (L - 2 * T - 1) / 4, bk - 0.04, fy + 0.54, fy + 0.95);
      B('ivory', T + 0.6, T + 2.2, T + 1.6, T + 2.9, fy + 0.012, fy + 0.022);
    }
  }
  // roof
  const ye = top - 0.05;
  if (!flat) {
    const o = 0.55, rise = tiled ? 1.15 : 1.5;
    bag.add(roofM, fromTriangles(gable(P, -0.5, L + 0.5, D, o, ye, ye + rise)));
    if (!simple) {
      // ridge cap, gable-end walls below, eave boards
      const a = P(-0.5, D / 2), b = P(L + 0.5, D / 2);
      bag.add(tiled ? 'roof_ridge' : 'thatch', rod([a[0], ye + rise + 0.04, a[1]], [b[0], ye + rise + 0.04, b[1]], 0.1, 5));
      for (const v of [-o, D + o]) { const q = R(-0.5, v - 0.03, L + 0.5, v + 0.03); bag.add('timber', box(q[0], ye - 0.12, q[1], q[2], ye, q[3])); }
    }
    // gable-end triangles in the wall material, closing the roof's ends
    for (const u of [0, L]) { const a = P(u, 0), b = P(u, D), c = P(u, D / 2); bag.add(wall, fromTriangles(orientOutward([a[0], ye, a[1], b[0], ye, b[1], c[0], ye + rise - 0.2, c[1], a[0], ye - 0.5, a[1], b[0], ye - 0.5, b[1], c[0], ye + rise - 0.2, c[1]]))); }
  } else {
    // flat roof of earth on beams with a low parapet; the haveli's upper floor is a plain storey
    B('earth_wall', -0.15, -0.15, L + 0.15, D + 0.15, top, top + 0.12);
    for (const [u0, v0, u1, v1] of [[-0.15, -0.15, L + 0.15, 0.05], [-0.15, D - 0.05, L + 0.15, D + 0.15], [-0.15, -0.15, 0.05, D + 0.15], [L - 0.05, -0.15, L + 0.15, D + 0.15]]) B(wall, u0, v0, u1, v1, top + 0.12, top + 0.7);
    B('sandstone', -0.2, -0.2, L + 0.2, 0.0, top + 0.7, top + 0.76);
    if (!simple) for (let k = 0; k < 3; k++) { const u = 0.8 + rand() * (L - 1.6), v = 1 + rand() * (D - 2); B('earth_wall', u, v, u + 0.7, v + 0.5, top + 0.12, top + 0.4 + rand() * 0.1); }
  }
  // the front: posts and a tiled lean-to over the platform, the eave board; openings, frames, stains
  const nb = Math.max(2, Math.round(L / 2.1));
  if (kind !== 'hut') {
    const ya = y + (storeys === 2 ? 3.0 : 0) + 2.55, ve = fy + 2.45;
    for (let k = 0; k <= nb; k++) { const u = k * L / nb; B('timber', Math.max(0, u - 0.07), -oD + 0.1, Math.min(L, u + 0.07), -oD + 0.24, fy - 0.03, ve); col.rect(R(Math.max(0, u - 0.07), -oD + 0.1, Math.min(L, u + 0.07), -oD + 0.24), fy, ve); }
    B('wood_dark', -0.1, -oD + 0.05, L + 0.1, -oD + 0.28, ve, ve + 0.2);
    // lean-to: slab sloping from the wall at (fy + 3.0) down to the beam
    const q = [P(-0.3, 0.05), P(L + 0.3, 0.05), P(L + 0.3, -oD - 0.3), P(-0.3, -oD - 0.3)], yt = [fy + 2.95, fy + 2.95, ve + 0.25, ve + 0.25];
    const pts = q.map((p, i) => [p[0], yt[i], p[1]]), bot = pts.map((p) => [p[0], p[1] - 0.12, p[2]]);
    bag.add(roofM, fromTriangles(orientOutward([...pts[0], ...pts[1], ...pts[2], ...pts[0], ...pts[2], ...pts[3], ...bot[0], ...bot[2], ...bot[1], ...bot[0], ...bot[3], ...bot[2], ...pts[1], ...pts[0], ...bot[0], ...pts[1], ...bot[0], ...bot[1], ...pts[2], ...pts[1], ...bot[1], ...pts[2], ...bot[1], ...bot[2], ...pts[3], ...pts[2], ...bot[2], ...pts[3], ...bot[2], ...bot[3], ...pts[0], ...pts[3], ...bot[3], ...pts[0], ...bot[3], ...bot[0]])));
    void ya;
  }
  // openings on the front of the closed or home houses
  if (!open0 && !simple && kind !== 'shed') {
    const win = (u, w, h, v0) => { B('opening', u - w / 2, -0.01, u + w / 2, 0.02, fy + v0, fy + v0 + h); B('wood_dark', u - w / 2 - 0.08, -0.04, u - w / 2, 0.04, fy + v0, fy + v0 + h + 0.08); B('wood_dark', u + w / 2, -0.04, u + w / 2 + 0.08, 0.04, fy + v0, fy + v0 + h + 0.08); B('wood_dark', u - w / 2 - 0.08, -0.04, u + w / 2 + 0.08, 0.04, fy + v0 + h, fy + v0 + h + 0.08); for (let k = 1; k < 5; k++) B('wood_dark', u - w / 2 + k * w / 5 - 0.015, -0.03, u - w / 2 + k * w / 5 + 0.015, 0.03, fy + v0, fy + v0 + h); };
    for (let k = 0; k < nb; k++) {
      const u = (k + 0.5) * L / nb;
      if (Math.abs(u - doorU) < 0.9 && !open) { B('timber', doorU - 0.5, -0.04, doorU + 0.5, 0.03, fy, fy + 2.0); B('wood_dark', doorU - 0.6, -0.06, doorU + 0.6, 0.05, fy + 2.0, fy + 2.15); for (let j = 1; j < 5; j++) B('wood_dark', doorU - 0.5 + j * 0.2, -0.05, doorU - 0.49 + j * 0.2, 0.04, fy + 0.05, fy + 1.95); }
      else if (!(open && Math.abs(u - doorU) < 0.9)) win(u, 0.75, 0.8, 1.15);
      if (storeys === 2) win(u, 0.8, 1.0, 3.2);
    }
  }
  if (!simple) {
    // weathering: the damp rising in the foot, streaks under the eaves, whitewash and rangoli at the door
    B('plaster_damp', 0.02, -0.03, L - 0.02, 0.0, fy, fy + 0.7); B('plaster_streak', 0.1, -0.03, L - 0.1, 0.0, top - 0.7, top - 0.02);
    if (rand() < 0.5) B('limewash_white', 0.3, -0.03, L - 0.3, 0.0, fy + 0.7, fy + 0.85);
    if (!open0 && kind !== 'hut') for (const u of [doorU - 0.8, doorU + 0.8]) B('limewash_red', u - 0.15, -oD + 0.3, u + 0.15, -oD + 0.6, fy - 0.025, fy - 0.01);
    // eye level: a cloth valance hung from the verandah's beam (shops: deep, in the trade's colour), rafter tails along the eave,
    // opened shutter leaves beside the windows, a lamp niche by the door, a stone seat on the platform, a garland over the door
    if (kind !== 'hut') {
      const ve2 = fy + 2.45, vc = pick(rand, ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_green', 'cloth_maroon']);
      if (kind === 'shop') { B(vc, 0.1, -oD + 0.02, L - 0.1, -oD + 0.1, ve2 - 0.55, ve2); for (let u = 0.1; u < L - 0.2; u += 0.35) B(vc, u, -oD + 0.02, u + 0.18, -oD + 0.1, ve2 - 0.7, ve2 - 0.55); }
      else if (rand() < 0.45) B(vc, 0.3, -oD + 0.02, Math.min(L - 0.3, 0.3 + 1.6 + rand() * 1.4), -oD + 0.1, ve2 - 0.4, ve2);
      for (let u = 0.25; u < L; u += 0.5) B('timber', u - 0.05, -oD - 0.28, u + 0.05, -oD + 0.1, ve2 + 0.2, ve2 + 0.3);
      if (!open0 && kind !== 'shed') {
        for (let k = 0; k < nb; k++) {
          const u = (k + 0.5) * L / nb;
          if (Math.abs(u - doorU) < 0.9) continue;
          for (const sd of [-1, 1]) B('timber', u + sd * 0.55 - 0.15, -0.05, u + sd * 0.55 + 0.15, 0.0, fy + 1.15, fy + 2.0);
        }
        const nu = Math.max(0.35, Math.min(L - 0.35, doorU + (doorU > L / 2 ? -1.15 : 1.15)));
        B('opening', nu - 0.12, -0.04, nu + 0.12, 0.0, fy + 1.45, fy + 1.78); B('flame', nu - 0.04, -0.045, nu + 0.04, -0.01, fy + 1.47, fy + 1.55);
        if (!open) for (let k = 0; k < 7; k++) { const gu = doorU - 0.45 + k * 0.15; B(k % 2 ? 'cloth_red' : 'cloth_white', gu - 0.04, -oD + 0.2, gu + 0.04, -oD + 0.28, ve2 - 0.12 - 0.1 * Math.sin(k / 6 * Math.PI), ve2 - 0.02); }
      }
      if (kind !== 'shop' && kind !== 'shed' && rand() < 0.6) { const su = doorU > L / 2 ? 0.2 : L - 1.6; if (su + 1.4 < doorU - 1.0 || su > doorU + 1.0) B('sandstone', su, -oD + 0.35, su + 1.4, -oD + 0.8, fy, fy + 0.4, true); }
    }
    if (kind === 'merchant') {
      // balconies on brackets over the verandah's beam, a railing of balusters, a little tiled hood
      const nbal = Math.max(1, Math.floor(L / 3.4));
      for (let k = 0; k < nbal; k++) {
        const u = (k + 0.5) * L / nbal, bw = 1.5, by = fy + 3.0;
        B('timber', u - bw / 2, -0.8, u + bw / 2, 0, by, by + 0.14);
        for (const s of [-1, 1]) B('wood_dark', u + s * bw * 0.4 - 0.07, -0.7, u + s * bw * 0.4 + 0.07, 0, by - 0.4, by);
        for (let i = 0; i <= 6; i++) B('timber', u - bw / 2 + i * bw / 6 - 0.025, -0.78, u - bw / 2 + i * bw / 6 + 0.025, -0.72, by + 0.14, by + 0.95);
        B('wood_dark', u - bw / 2, -0.8, u + bw / 2, -0.66, by + 0.95, by + 1.02);
        for (const s of [-1, 1]) B('wood_dark', u + s * bw / 2 - 0.03, -0.8, u + s * bw / 2 + 0.03, 0, by + 0.14, by + 1.0);
        B('opening', u - 0.45, -0.01, u + 0.45, 0.02, by + 0.14, by + 2.0);
        B('limewash_white', u - 0.6, -0.04, u + 0.6, 0.0, by + 2.0, by + 2.12);
      }
    }
  }
  if (kind === 'shed' && !simple) {
    // manger along the back, a post row
    B('timber', 0.4, D - 0.9, L - 0.4, D - 0.3, fy, fy + 0.5, true); B('wood_dark', 0.45, D - 0.85, L - 0.45, D - 0.35, fy + 0.5, fy + 0.54); B('thatch', 0.6, D - 0.8, L - 0.6, D - 0.4, fy + 0.54, fy + 0.7);
  }
  void along;
}

/** yard_wall: a low wall of mud brick with a coping round a yard, gaps (a list of [side 0..3, from, to]) for the ways in. { rect, h, gaps, seed } */
function yardWall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 1.3, g = el.gaps ?? [], t = 0.25;
  const seg = (a, b, c, d, side) => {
    const len = side % 2 ? d - b : c - a, cuts = g.filter((q) => q[0] === side).sort((p, q) => p[1] - q[1]);
    let at = 0;
    for (const [, s, e] of [...cuts, [side, len, len]]) {
      if (s > at + 0.05) { const r = side % 2 ? [a, b + at, c, b + s] : [a + at, b, a + s, d]; bag.add('mudbrick', box(r[0], 0, r[1], r[2], h, r[3])); bag.add('earth_wall', box(r[0] - 0.04, h, r[1] - 0.04, r[2] + 0.04, h + 0.1, r[3] + 0.04)); col.rect(r, 0, h); }
      at = e;
    }
  };
  seg(x0, z0, x1, z0 + t, 0); seg(x1 - t, z0, x1, z1, 1); seg(x0, z1 - t, x1, z1, 2); seg(x0, z0, x0 + t, z1, 3);
}

/** A hipped roof as a closed solid: eaves rectangle [x0, z0, x1, z1] at ye, ridge at yr along the longer side (inset by half the shorter). */
function hip(x0, z0, x1, z1, ye, yr, th = 0.12) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, k = Math.min(w, d) / 2;
  const [ra, rb] = w >= d ? [[x0 + k, cz], [x1 - k, cz]] : [[cx, z0 + k], [cx, z1 - k]];
  const A = [x0, ye, z0], B = [x1, ye, z0], C = [x1, ye, z1], D = [x0, ye, z1], R0 = [ra[0], yr, ra[1]], R1 = [rb[0], yr, rb[1]];
  const out = w >= d
    ? [...A, ...B, ...R1, ...A, ...R1, ...R0, ...B, ...C, ...R1, ...C, ...D, ...R0, ...C, ...R0, ...R1, ...D, ...A, ...R0]
    : [...A, ...B, ...R1, ...A, ...R1, ...R0, ...B, ...C, ...R1, ...C, ...D, ...R1, ...D, ...A, ...R0, ...D, ...R0, ...R1];
  const base = [...A, ...C, ...B, ...A, ...D, ...C].map((v, n) => (n % 3 === 1 ? ye - th : v));
  return orientOutward([...out, ...base]);
}

/** pilgrim_hall: the pilgrims' rest house (dharmasala) on a low plinth: two rows of timber posts, tie beams, a hipped thatched roof, stone seat slabs along the back, water pots at one end and mats. { rect, plinth, h } */
function pilgrimHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, pl = el.plinth ?? 0.5, h = el.h ?? 3.0, o = 1.0;
  bag.add('mudbrick', box(x0, -0.6, z0, x1, pl, z1)); bag.add('sandstone_floor', box(x0 - 0.2, pl - 0.05, z0 - 0.2, x1 + 0.2, pl, z1 + 0.2)); bag.add('sandstone', box(x0 - 0.2, 0, z0 - 0.2, x1 + 0.2, pl * 0.5, z1 + 0.2));
  col.rect([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], -0.6, pl * 0.5); col.floor([x0 - 0.1, z0 - 0.1, x1 + 0.1, z1 + 0.1], pl);
  const nx = Math.max(3, Math.round((x1 - x0) / 3)), nz = Math.max(2, Math.round((z1 - z0) / 3));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    if (i > 0 && i < nx && j > 0 && j < nz) continue;
    const x = x0 + 0.4 + (x1 - x0 - 0.8) * i / nx, z = z0 + 0.4 + (z1 - z0 - 0.8) * j / nz;
    bag.add('sandstone', box(x - 0.2, pl, z - 0.2, x + 0.2, pl + 0.22, z + 0.2)); bag.add('timber', box(x - 0.14, pl + 0.22, z - 0.14, x + 0.14, pl + h, z + 0.14));
    col.rect([x - 0.2, z - 0.2, x + 0.2, z + 0.2], pl, pl + h);
  }
  for (const z of [z0 + 0.4, z1 - 0.4]) bag.add('wood_dark', box(x0 + 0.2, pl + h, z - 0.12, x1 - 0.2, pl + h + 0.28, z + 0.12));
  for (const x of [x0 + 0.4, x1 - 0.4]) bag.add('wood_dark', box(x - 0.12, pl + h, z0 + 0.2, x + 0.12, pl + h + 0.28, z1 - 0.2));
  bag.add('thatch', fromTriangles(hip(x0 - o, z0 - o, x1 + o, z1 + o, pl + h + 0.2, pl + h + 0.2 + Math.min(x1 - x0, z1 - z0) / 2 * 0.62)));
  // stone seat slabs along the back, a row of water pots on a stand at the east end, mats, a clay lamp
  bag.add('sandstone', box(x0 + 0.7, pl, z0 + 0.7, x1 - 0.7, pl + 0.42, z0 + 1.3)); col.rect([x0 + 0.7, z0 + 0.7, x1 - 0.7, z0 + 1.3], pl, pl + 0.42);
  for (let k = 0; k < 4; k++) bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.14], [0.22, 0.26], [0.15, 0.38], [0.1, 0.42], [0.12, 0.46], [0.001, 0.46]], 10, null, x1 - 1.0, pl, z1 - 1.0 - k * 0.55));
  bag.add('sandstone', box(x1 - 1.35, pl, z1 - 3.4, x1 - 0.65, pl + 0.12, z1 - 0.65));
  for (let k = 0; k < 3; k++) bag.add(k === 1 ? 'cloth_white' : 'reed_mat', box(x0 + 1.4 + k * 2.2, pl, (z0 + z1) / 2 - 0.5, x0 + 2.8 + k * 2.2, pl + 0.025, (z0 + z1) / 2 + 0.7));
}

/** stall: an open stall for the pilgrims' goods: four posts, a thatched gable roof, a counter with the trade's goods, a cloth hung over the front. { rect, front, y, seed, trade } */
function stall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's', y = el.y ?? 0, rand = rng((el.seed || 1) + 11), along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, H = 2.5;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const trade = el.trade ?? 'flowers', cloths = { flowers: ['cloth_white', 'cloth_red'], lamps: ['terracotta', 'pottery_dark'], water: ['terracotta', 'pottery_dark'], incense: ['cloth_ochre', 'cloth_brown'], bowls: ['pottery_dark', 'iron'], robes: ['cloth_ochre', 'cloth_maroon'] }[trade] ?? ['cloth_white'];
  B('sandstone', 0.1, 0.1, L - 0.1, D - 0.1, y - 0.3, y + 0.15);
  for (const [u, v] of [[0.25, 0.25], [L - 0.25, 0.25], [0.25, D - 0.25], [L - 0.25, D - 0.25]]) B('timber', u - 0.07, v - 0.07, u + 0.07, v + 0.07, y + 0.15, y + H, true);
  const ye = y + H, rise = 0.9, a = [P(-0.4, -0.4), P(L + 0.4, -0.4), P(L + 0.4, D + 0.4), P(-0.4, D + 0.4)];
  bag.add('thatch', fromTriangles(hip(Math.min(...a.map((q) => q[0])), Math.min(...a.map((q) => q[1])), Math.max(...a.map((q) => q[0])), Math.max(...a.map((q) => q[1])), ye, ye + rise, 0.1)));
  // the counter along the front, the goods on it, a cloth hung over its face, a mat and a stool behind
  B('timber', 0.3, 0.3, L - 0.3, 0.9, y + 0.15, y + 0.85, true);
  const n = Math.max(3, Math.floor((L - 0.8) / 0.38));
  for (let k = 0; k < n; k++) {
    const u = 0.5 + k * (L - 1.0) / Math.max(1, n - 1), m = cloths[k % cloths.length], p = P(u, 0.6);
    if (trade === 'flowers') bag.add(m, lathe([[0.001, 0], [0.15, 0.02], [0.17, 0.08], [0.1, 0.14], [0.001, 0.16]], 8, null, p[0], y + 0.85, p[1]));
    else if (trade === 'water') bag.add(m, lathe([[0.001, 0], [0.13, 0.03], [0.2, 0.15], [0.2, 0.26], [0.14, 0.36], [0.1, 0.4], [0.12, 0.44], [0.001, 0.44]], 10, null, p[0], y + 0.85, p[1]));
    else bag.add(m, lathe([[0.001, 0], [0.1, 0.01], [0.12, 0.05], [0.07, 0.09], [0.001, 0.1]], 8, null, p[0], y + 0.85, p[1]));
  }
  B(pick(rand, cloths.length > 1 && trade !== 'water' ? ['cloth_red', 'cloth_ochre', 'cloth_indigo'] : ['cloth_ochre']), 0.3, 0.22, L - 0.3, 0.3, y + 0.35, y + 0.82);
  B('reed_mat', 0.6, 1.2, L - 0.6, D - 0.5, y + 0.15, y + 0.17);
  for (let k = 0; k < 3; k++) B('wood_dark', 0.6 + k * (L - 1.4) / 2, 1.4, 0.7 + k * (L - 1.4) / 2 + 0.3, 1.7, y + 0.17, y + 0.45);
}

/** tree_shrine: a pipal's shrine, the platform of the seat of the Enlightenment: a low stone platform in a railing (vedika: posts, three bars, a coping) with a gap on the south, the throne slab under a parasol on a pole, lamps. { c, r, y } */
function treeShrine(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 3.2, y = el.y ?? 0, S = 'sandstone', sq = (v) => v * v;
  bag.add(S, box(cx - r, y - 0.8, cz - r, cx + r, y + 0.5, cz + r)); col.rect([cx - r, cz - r, cx + r, cz + r], y - 0.8, y + 0.5);
  bag.add('sandstone_floor', box(cx - r - 0.1, y + 0.48, cz - r - 0.1, cx + r + 0.1, y + 0.52, cz + r + 0.1)); col.floor([cx - r, cz - r, cx + r, cz + r], y + 0.5);
  bag.add(S, box(cx - 1.2, y + 0.2, cz + r, cx + 1.2, y + 0.5, cz + r + 0.5)); col.rect([cx - 1.2, cz + r, cx + 1.2, cz + r + 0.5], y - 0.8, y + 0.2); col.floor([cx - 1.2, cz + r, cx + 1.2, cz + r + 0.5], y + 0.2);
  const post = (x, z) => { bag.add(S, box(x - 0.1, y + 0.5, z - 0.1, x + 0.1, y + 1.6, z + 0.1)); col.rect([x - 0.1, z - 0.1, x + 0.1, z + 0.1], y + 0.5, y + 1.6); };
  const run = (ax, az, bx, bz, skip) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(len / 1.3));
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      if (skip && Math.abs(x - cx) < 1.3 && Math.abs(z - (cz + r - 0.3)) < 0.5 && i > 0 && i < n) continue;
      post(x, z);
    }
    for (const yy of [0.8, 1.15, 1.4]) {
      const alongX = Math.abs(bz - az) < 1e-6, lo = Math.min(alongX ? ax : az, alongX ? bx : bz), hi = Math.max(alongX ? ax : az, alongX ? bx : bz);
      if (skip) { for (const [a, b] of [[lo, cx - 1.2], [cx + 1.2, hi]]) bag.add(S, alongX ? box(a, y + 0.5 + yy - 0.06, az - 0.05, b, y + 0.5 + yy + 0.06, az + 0.05) : box(ax - 0.05, y + 0.5 + yy - 0.06, a, ax + 0.05, y + 0.5 + yy + 0.06, b)); }
      else bag.add(S, alongX ? box(lo, y + 0.5 + yy - 0.06, az - 0.05, hi, y + 0.5 + yy + 0.06, az + 0.05) : box(ax - 0.05, y + 0.5 + yy - 0.06, lo, ax + 0.05, y + 0.5 + yy + 0.06, hi));
    }
    if (skip) { for (const [a, b] of [[Math.min(ax, bx), cx - 1.2], [cx + 1.2, Math.max(ax, bx)]]) { bag.add(S, box(a, y + 1.6, az - 0.08, b, y + 1.7, az + 0.08)); col.rect([a, az - 0.06, b, az + 0.06], y + 0.5, y + 1.6); } }
    else { const alongX = Math.abs(bz - az) < 1e-6; bag.add(S, alongX ? box(Math.min(ax, bx), y + 1.6, az - 0.08, Math.max(ax, bx), y + 1.7, az + 0.08) : box(ax - 0.08, y + 1.6, Math.min(az, bz), ax + 0.08, y + 1.7, Math.max(az, bz))); col.rect(alongX ? [Math.min(ax, bx), az - 0.06, Math.max(ax, bx), az + 0.06] : [ax - 0.06, Math.min(az, bz), ax + 0.06, Math.max(az, bz)], y + 0.5, y + 1.6); }
  };
  const e = r - 0.3;
  run(cx - e, cz - e, cx + e, cz - e); run(cx - e, cz - e, cx - e, cz + e); run(cx + e, cz - e, cx + e, cz + e); run(cx - e, cz + e, cx + e, cz + e, true);
  // the throne slab with its stepped plinth, the parasol on a pole behind it, lamps in front
  bag.add(S, box(cx - 1.0, y + 0.5, cz - 0.55, cx + 1.0, y + 0.72, cz + 0.55)); bag.add('sandstone_dressed', box(cx - 0.8, y + 0.72, cz - 0.4, cx + 0.8, y + 0.9, cz + 0.4)); col.rect([cx - 1.0, cz - 0.55, cx + 1.0, cz + 0.55], y + 0.5, y + 0.9);
  bag.add('timber', box(cx - 0.05, y + 0.9, cz - 0.05, cx + 0.05, y + 3.6, cz + 0.05));
  bag.add('cloth_white', lathe([[0.001, 3.3], [1.0, 3.05], [1.05, 3.08], [0.9, 3.15], [0.001, 3.55]], 14, null, cx, y, cz));
  for (const sx of [-1, 1]) bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.05], [0.05, 0.07], [0.001, 0.07]], 8, null, cx + sx * 0.5, y + 0.9, cz + 0.55));
  void sq;
}

export const villageElements = { village_house: building, yard_wall: yardWall, pilgrim_hall: pilgrimHall, stall, tree_shrine: treeShrine };
