// The village of Khajuraho about 1050 (docs/settlements/khajuraho.md §13): shop-houses with a verandah
// platform (otla) on timber posts under a tiled lean-to, houses of mud and brick, flat-roofed mud houses with
// parapets, two-storey merchants' houses with bracketed balconies, thatched huts, cattle sheds; the ones
// marked `open` are hollow and furnished by trade. Plus the yard walls, the rest house and the tank's ghat.
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
  const wall = pick(rand, WALLS), flat = kind === 'mud' || kind === 'haveli', storeys = kind === 'haveli' ? 2 : 1;
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
    furnish(el.trade && kind === 'shop' ? el.trade : kind === 'haveli' ? 'home' : 'home');
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
    if (kind === 'haveli') {
      // balconies on brackets over the verandah's beam, a railing of balusters, a little tiled hood
      const nbal = Math.max(1, Math.floor(L / 3.4));
      for (let k = 0; k < nbal; k++) {
        const u = (k + 0.5) * L / nbal, bw = 1.5, by = fy + 3.0;
        B('sandstone', u - bw / 2, -0.8, u + bw / 2, 0, by, by + 0.14);
        for (const s of [-1, 1]) B('sandstone', u + s * bw * 0.4 - 0.07, -0.7, u + s * bw * 0.4 + 0.07, 0, by - 0.4, by);
        for (let i = 0; i <= 6; i++) B('sandstone', u - bw / 2 + i * bw / 6 - 0.025, -0.78, u - bw / 2 + i * bw / 6 + 0.025, -0.72, by + 0.14, by + 0.95);
        B('sandstone', u - bw / 2, -0.8, u + bw / 2, -0.66, by + 0.95, by + 1.02);
        for (const s of [-1, 1]) B('sandstone', u + s * bw / 2 - 0.03, -0.8, u + s * bw / 2 + 0.03, 0, by + 0.14, by + 1.0);
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

/** rest_house: a pilgrims' pillared hall (dharmashala) on a plinth: 3 × 5 square pillars, brackets, a flat stone roof with a low stepped crown. { rect, plinth, h } */
function restHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, pl = el.plinth ?? 0.7, h = el.h ?? 3.2, S = 'sandstone';
  bag.add(S, box(x0, -0.6, z0, x1, pl, z1)); bag.add('sandstone_floor', box(x0 - 0.3, pl - 0.04, z0 - 0.3, x1 + 0.3, pl, z1 + 0.3)); bag.add(S, box(x0 - 0.3, 0, z0 - 0.3, x1 + 0.3, pl * 0.5, z1 + 0.3));
  col.rect([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], -0.6, pl * 0.5); col.floor([x0, z0, x1, z1], pl);
  const nx = Math.max(3, Math.round((x1 - x0) / 2.8)), nz = 3;
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    const x = x0 + 0.5 + (x1 - x0 - 1) * i / nx, z = z0 + 0.5 + (z1 - z0 - 1) * j / nz; if (i > 0 && i < nx && j > 0 && j < nz) continue;
    bag.add(S, box(x - 0.22, pl, z - 0.22, x + 0.22, pl + 0.3, z + 0.22)); bag.add(S, box(x - 0.17, pl + 0.3, z - 0.17, x + 0.17, pl + h - 0.5, z + 0.17)); bag.add(S, box(x - 0.3, pl + h - 0.5, z - 0.3, x + 0.3, pl + h - 0.3, z + 0.3));
    for (const dx of [-1, 1]) bag.add(S, box(x + dx * 0.45 - 0.2, pl + h - 0.3, z - 0.12, x + dx * 0.45 + 0.2, pl + h - 0.1, z + 0.12));
    col.rect([x - 0.22, z - 0.22, x + 0.22, z + 0.22], pl, pl + h);
  }
  bag.add(S, box(x0 - 0.5, pl + h - 0.3, z0 - 0.5, x1 + 0.5, pl + h, z1 + 0.5)); bag.add(S, box(x0 - 0.2, pl + h, z0 - 0.2, x1 + 0.2, pl + h + 0.35, z1 + 0.2)); bag.add(S, box(x0 + 1.2, pl + h + 0.35, z0 + 1.2, x1 - 1.2, pl + h + 0.7, z1 - 1.2));
  bag.add('sandstone_dressed', box(x0 + 2.4, pl + h + 0.7, z0 + 2.4, x1 - 2.4, pl + h + 1.0, z1 - 2.4));
  col.rect([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], pl + h - 0.3, pl + h + 1.0);
  // low seat slabs along the back
  bag.add(S, box(x0 + 0.5, pl, z1 - 1.3, x1 - 0.5, pl + 0.45, z1 - 0.7)); col.rect([x0 + 0.5, z1 - 1.3, x1 - 0.5, z1 - 0.7], pl, pl + 0.45);
}

/** chhatri: a four-pillared kiosk with a domed roof on the bank. { c, w, y } */
function chhatri(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 2.6, y = el.y ?? 0, S = 'sandstone', h = 2.6;
  bag.add(S, box(cx - w / 2 - 0.3, y - 0.8, cz - w / 2 - 0.3, cx + w / 2 + 0.3, y + 0.35, cz + w / 2 + 0.3)); col.rect([cx - w / 2 - 0.3, cz - w / 2 - 0.3, cx + w / 2 + 0.3, cz + w / 2 + 0.3], y - 0.8, y + 0.35); col.floor([cx - w / 2 - 0.3, cz - w / 2 - 0.3, cx + w / 2 + 0.3, cz + w / 2 + 0.3], y + 0.35);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = cx + sx * (w / 2 - 0.15), z = cz + sz * (w / 2 - 0.15); bag.add(S, box(x - 0.15, y + 0.35, z - 0.15, x + 0.15, y + 0.35 + h, z + 0.15)); col.rect([x - 0.15, z - 0.15, x + 0.15, z + 0.15], y + 0.35, y + 0.35 + h); }
  bag.add(S, box(cx - w / 2 - 0.25, y + 0.35 + h, cz - w / 2 - 0.25, cx + w / 2 + 0.25, y + 0.35 + h + 0.25, cz + w / 2 + 0.25));
  bag.add(S, lathe([[w * 0.62, 0], [w * 0.6, 0.15], [w * 0.5, 0.45], [w * 0.28, 0.75], [w * 0.1, 0.95], [0.001, 1.0]], 16, null, cx, y + 0.35 + h + 0.25, cz));
  bag.add(S, lathe([[0.06, 0], [0.1, 0.1], [0.04, 0.3], [0.001, 0.4]], 8, null, cx, y + 0.35 + h + 1.2, cz));
}

export const villageElements = { bazaar_house: building, yard_wall: yardWall, rest_house: restHouse, chhatri };
