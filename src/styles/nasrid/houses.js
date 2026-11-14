// The houses of Nasrid Granada about 1390 (docs/settlements/granada.md §15): a whitewashed block on the lane, enterable —
// the door under a horseshoe arch, a ground room (a divan-room, or a shop with its counter and shelves), a stair along a side
// wall to the upper room whose lane windows are closed by wooden lattices, a second flight to the flat roof (terrado) with its
// parapet, its water jars and washing. Built in a frame u along the front, v in from it; every storey walkable.

import { box, lathe, rod, clothBox, addCloth } from '../../core/geom.js';
import { holedWall, archHead, face } from './halls.js';

const LW = 'limewash_white', T = 0.4, ST = 3.1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Whether the house with this seed keeps a shop on its ground floor (shared with the lane's dressing). */
export const isShop = (seed) => seed % 7 < 2;
const TRADES = ['potter', 'cloth', 'grocer'];

/**
 * andalusi_house: { rect, y, foot, front ('n' | 's'), seed, storeys (1 | 2), solid } — `solid`: the shell only (a closed block)
 * for the houses beyond the visitor's reach.
 */
function house(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed + 3), N = el.storeys === 1 ? 1 : el.seed % 7 === 3 ? 3 : 2, VAR = el.seed % 4, LW = el.seed % 11 === 0 ? 'limewash_yellow' : 'limewash_white', SHOP = isShop(el.seed), s = el.front === 's';
  const L = x1 - x0, D = z1 - z0, H = N * ST, top = y + H + 0.95;
  const F = (u, v) => (s ? [x1 - u, z1 - v] : [x0 + u, z0 + v]);
  const R = (u0, v0, u1, v1) => { const a = F(u0, v0), b = F(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, v0, u1, v1, ya, yb, c = false) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const bays = Math.max(1, Math.round(L / 3.6)), du = (Math.floor(bays / 2) + 0.5) * L / bays;
  bag.add(LW, box(x0 - 0.05, (el.foot ?? y) - 0.6, z0 - 0.05, x1 + 0.05, y + 0.12, z1 + 0.05));
  if (el.solid) {
    bag.add(LW, box(x0, y, z0, x1, top, z1)); col.rect(el.rect, y, top);
    B('roof_tile', -0.05, -0.05, L + 0.05, D + 0.05, top, top + 0.1);
    return;
  }
  const wall = (u0, v0, u1, v1, holes, along) => holedWall(bag, null, LW, R(u0, v0, u1, v1), y, top, holes, along);
  const wx = (u) => F(u, 0)[0], wz = (v) => F(0, v)[1];
  const hx = (ua, ub, ya, yb) => [Math.min(wx(ua), wx(ub)), Math.max(wx(ua), wx(ub)), ya, yb];
  const hz = (va, vb, ya, yb) => [Math.min(wz(va), wz(vb)), Math.max(wz(va), wz(vb)), ya, yb];
  // the front: the door, and on the upper floor a window in every bay
  const frontHoles = [hx(du - 0.6, du + 0.6, y + 0.12, y + 2.45)];
  for (let q = 1; q < N; q++) for (let b = 0; b < bays; b++) { const u = (b + 0.5) * L / bays; frontHoles.push(hx(u - 0.36, u + 0.36, y + q * ST + 1.0, y + q * ST + 2.05)); }
  wall(0, 0, L, T, frontHoles, true);
  wall(0, D - T, L, D, [hx(L * 0.3 - 0.3, L * 0.3 + 0.3, y + 1.5, y + 2.2), ...(N > 1 ? [hx(L * 0.7 - 0.3, L * 0.7 + 0.3, y + ST + 1.0, y + ST + 1.9)] : [])], true);
  const sideHoles = (k) => { const h = []; for (let q = 0; q < N; q++) for (const v of [2.5 + k, 6.0 - k]) if (v < D - 1) h.push(hz(v - 0.28, v + 0.28, y + q * ST + 1.6, y + q * ST + 2.2)); return h; };
  wall(0, T, T, D - T, sideHoles(0), false); wall(L - T, T, L, D - T, sideHoles(0.3), false);
  // collision of the walls (the door left open) and the parapet's coping
  col.rect(R(0, 0, du - 0.6, T), y, top); col.rect(R(du + 0.6, 0, L, T), y, top); col.rect(R(du - 0.6, 0, du + 0.6, T), y + 2.45, top);
  col.rect(R(0, D - T, L, D), y, top); col.rect(R(0, T, T, D - T), y, top); col.rect(R(L - T, T, L, D - T), y, top);
  B('roof_tile', -0.06, -0.06, L + 0.06, D + 0.06, top, top + 0.1);
  // the horseshoe arch over the door, the leaf folded back, the step
  archHead(bag, face('z', s ? z1 : z0, s ? -1 : 1), Math.min(wx(du - 0.6), wx(du + 0.6)), Math.max(wx(du - 0.6), wx(du + 0.6)), y + 1.9, y + 2.45, T, ['horseshoe', 'pointed', 'horseshoe', 'lobed'][VAR], { alfiz: true });
  B('wood_dark', du - 0.55, 0.08, du - 0.05, 0.16, y + 0.12, y + 2.0);
  B(LW, du - 0.9, -0.5, du + 0.9, 0, y - 0.1, y + 0.12); col.floor(R(du - 0.9, -0.5, du + 0.9, 0), y + 0.12);
  // a wooden lattice over each upper window, standing a hand off the wall (the middle bay of the first upper floor of some houses is a mirador, an enclosed lattice bay on corbels)
  for (let q = 1; q < N; q++) for (let b = 0; b < bays; b++) {
    const u = (b + 0.5) * L / bays, yq = y + q * ST;
    B('wood_dark', u - 0.46, -0.18, u + 0.46, -0.1, yq + 0.92, yq + 2.13);
    B('lattice', u - 0.4, -0.16, u + 0.4, -0.12, yq + 0.98, yq + 2.07);
    B('wood_dark', u - 0.5, -0.19, u + 0.5, -0.04, yq + 2.12, yq + 2.2);
  }
  if (N > 1 && VAR === 2) {
    const u = (Math.floor(bays / 2) + 0.5) * L / bays, yq = y + ST, w = 0.62, d = 0.55;
    B('wood_dark', u - w - 0.08, -d - 0.08, u + w + 0.08, -0.04, yq + 0.8, yq + 0.92);
    for (const dd of [-w, w]) { B('wood_dark', u + dd - 0.06, -d, u + dd + 0.06, -0.04, yq + 0.92, yq + 2.2); B('lattice', u + dd + (dd > 0 ? 0.04 : -0.09), -d + 0.08, u + dd + (dd > 0 ? 0.09 : -0.04), -0.12, yq + 1.0, yq + 2.1); }
    B('wood_dark', u - w + 0.06, -d - 0.06, u + w - 0.06, -d, yq + 0.92, yq + 2.2);
    B('lattice', u - w + 0.14, -d - 0.09, u + w - 0.14, -d - 0.04, yq + 1.0, yq + 2.1);
    B('roof_tile', u - w - 0.12, -d - 0.12, u + w + 0.12, -0.02, yq + 2.2, yq + 2.3);
    for (const dd of [-0.45, 0, 0.45]) B('wood_dark', u + dd - 0.05, -d + 0.02, u + dd + 0.05, -0.04, yq + 0.45, yq + 0.8);
    col.rect(R(u - w - 0.08, -d - 0.08, u + w + 0.08, 0), y + ST + 0.45, y + ST + 2.3);
  }
  // a tiled canopy on corbels over the door (the shops have their cloth awning instead); on the other houses a crenellated coping
  if (!SHOP && VAR === 1) { B('roof_tile', du - 1.0, -0.7, du + 1.0, -0.02, y + 2.8, y + 2.9); for (const dd of [-0.8, 0.8]) B('wood_dark', du + dd - 0.05, -0.62, du + dd + 0.05, -0.02, y + 2.5, y + 2.8); }
  if (VAR === 3 || (VAR === 0 && N === 3)) for (let u = 0.2; u < L - 0.4; u += 0.75) B(LW, u, 0, u + 0.4, T, top + 0.1, top + 0.45);
  // the floors: each storey a slab with the flight below it cut out; the flights; the roof
  const fy = y + 0.15, lvl = (k) => (k === 0 ? fy : y + k * ST);
  const holeOf = (k) => (k % 2 === 0 ? [T, 1.4, T + 1.05, 5.6] : [L - T - 1.05, 1.4, L - T, 5.6]);
  const pieces = (hole) => (hole ? [[T, T, L - T, hole[1]], [T, hole[3], L - T, D - T], [T, hole[1], hole[0], hole[3]], [hole[2], hole[1], L - T, hole[3]]].filter((p) => p[2] - p[0] > 0.01 && p[3] - p[1] > 0.01) : [[T, T, L - T, D - T]]);
  B('brick_paving', T, T, L - T, D - T, y + 0.05, fy); col.floor(R(T, T, L - T, D - T), fy);
  for (let k = 1; k <= N; k++) {
    const yk = lvl(k);
    for (const p of pieces(holeOf(k - 1))) {
      B('plaster_white', p[0], p[1], p[2], p[3], yk - 0.3, yk); B(k === N ? 'mud_plaster' : 'brick_paving', p[0], p[1], p[2], p[3], yk, yk + 0.03);
      col.floor(R(...p), yk + 0.03); col.rect(R(...p), yk - 0.3, yk);
    }
  }
  for (let k = 0; k < N; k++) {
    const [a, v0, c, v1] = holeOf(k), ya = lvl(k) + (k === 0 ? 0 : 0.03), yb = lvl(k + 1) + 0.03, n = 14, run = (v1 - v0) / n, up = k % 2 === 0;
    for (let i = 0; i < n; i++) B('brick', a, up ? v0 + i * run : v0, c, up ? v1 : v1 - i * run, ya, ya + (yb - ya) * (i + 1) / n);
    col.ramp(R(a, v0, c, v1), ya, yb, up ? (s ? 'n' : 's') : (s ? 's' : 'n'));
    // the flight's open side (toward the room) and its tall end: the brick of each step blocks the body beside it, below the height of one who climbs
    const uo = k % 2 === 0 ? [c, c + 0.05] : [a - 0.05, a];
    for (let i = 0; i < n; i++) {
      if ((yb - ya) * (i + 1) / n <= 0.5) continue;
      const va = up ? v0 + i * run : v1 - (i + 1) * run;
      col.rect(R(uo[0], va, uo[1], va + run), ya, ya + (yb - ya) * i / n + 0.2);
    }
    col.rect(up ? R(a, v1, c, v1 + 0.05) : R(a, v0 - 0.05, c, v0), ya, yb - 0.05);
  }
  // the roof: jars of water, a washing line
  const ry = lvl(N) + 0.03;
  for (const [u, v, sc] of [[1.2, D - 1.0, 0.9], [L - 1.9, D - 1.1, 0.8]]) { const p = F(u, v); jar(bag, p[0], ry, p[1], sc); }
  { const a = F(2.2, D - 1.0), b = F(L - 3.2, D - 1.0);
    for (const p of [a, b]) bag.add('timber', rod([p[0], ry, p[1]], [p[0], ry + 1.7, p[1]], 0.035, 5));
    bag.add('rope_fibre', rod([a[0], ry + 1.65, a[1]], [b[0], ry + 1.6, b[1]], 0.007, 3));
    for (let i = 0; i < 3; i++) { const t = 0.15 + i * 0.3, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; addCloth(bag, ['cloth_white', 'cloth_indigo', 'cloth_ochre'][i], clothBox(x - 0.28, ry + 0.8, z - 0.01, x + 0.28, ry + 1.62, z + 0.01, 0.2), ry + 1.62); } }
  const shop = isShop(el.seed);
  room(bag, B, F, { L, D, y, fy, N, shop, rand, trade: TRADES[el.seed % 3] });
  // the sign of the shop, a painted board on an iron bracket by its door
  if (shop) {
    const a = F(du + 1.25, 0), b = F(du + 1.25, -0.55);
    bag.add('iron', rod([a[0], y + 2.65, a[1]], [b[0], y + 2.65, b[1]], 0.012, 4));
    bag.add('wood_painted', box(b[0] - 0.22, y + 2.2, b[1] - 0.03, b[0] + 0.22, y + 2.62, b[1] + 0.03));
    bag.add(['glaze_blue', 'glaze_green', 'cloth_red'][el.seed % 3], box(b[0] - 0.17, y + 2.3, b[1] - 0.035, b[0] + 0.17, y + 2.52, b[1] + 0.035));
  }
}
function jar(bag, x, y, z, s) {
  bag.add('terracotta', lathe([[0.001, 0], [0.16 * s, 0.01], [0.27 * s, 0.25 * s], [0.31 * s, 0.5 * s], [0.25 * s, 0.7 * s], [0.14 * s, 0.82 * s], [0.17 * s, 0.9 * s], [0.001, 0.9 * s]], 10, null, x, y, z));
}

/** The furniture of the ground room (a divan-room or a shop) and of the upper room (a divan under the lattice, a chest, a lamp). */
function room(bag, B, F, { L, D, y, fy, N, shop, rand, trade }) {
  const h = (mat, u, v, r, ht, ya) => { const p = F(u, v); bag.add(mat, lathe([[r * 0.6, 0], [r, ht * 0.4], [r * 0.7, ht * 0.85], [r * 0.4, ht], [0.001, ht]], 10, null, p[0], ya, p[1])); };
  const cush = ['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_white', 'cloth_blue'];
  const divan = (u0, v0, u1, v1, yb) => { B('timber', u0, v0, u1, v1, yb, yb + 0.3, true); B(cush[Math.floor(rand() * 5)], u0 + 0.03, v0 + 0.03, u1 - 0.03, v1 - 0.03, yb + 0.3, yb + 0.36); };
  const lamp = (u, v, yb) => { const p = F(u, v); bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.15, 0.2], [0.08, 0.3], [0.001, 0.32]], 10, null, p[0], yb, p[1])); bag.add('iron', rod([p[0], yb + 0.32, p[1]], [p[0], yb + 1.0, p[1]], 0.006, 3)); };
  if (shop) {
    B('wood_dark', 0.9, 2.2, L - 0.9, 2.7, fy, fy + 1.0, true); B('timber', 0.85, 2.15, L - 0.85, 2.75, fy + 1.0, fy + 1.05);
    for (let q = 0; q < 3; q++) B('wood_dark', 0.5, D - 0.65, L - 0.5, D - 0.4, fy + 0.4 + q * 0.6, fy + 0.45 + q * 0.6, q === 0);
    for (let i = 0; i < 7; i++) {
      const u = 1.2 + i * (L - 2.4) / 6, q = i % 3;
      if (trade === 'potter') { h(i % 2 ? 'terracotta' : 'glaze_blue', u, 2.45, 0.1, 0.28, fy + 1.05); h(i % 2 ? 'glaze_white' : 'terracotta', u, D - 0.52, 0.11, 0.3, fy + 0.45 + q * 0.6); }
      else if (trade === 'cloth') { B(cush[(i * 2) % 5], u - 0.25, 2.3, u + 0.25, 2.6, fy + 1.05, fy + 1.3); B(cush[(i * 3 + 1) % 5], u - 0.28, D - 0.6, u + 0.28, D - 0.45, fy + 0.45 + q * 0.6, fy + 0.7 + q * 0.6); }
      else { const p = F(u, 2.45); bag.add('wicker', lathe([[0.12, 0], [0.2, 0.2], [0.001, 0.22]], 8, null, p[0], fy + 1.05, p[1])); h('terracotta', u, D - 0.52, 0.1, 0.25, fy + 0.45 + q * 0.6); }
    }
    B('cloth_red', 2.2, 3.4, L - 2.2, 5.0, fy + 0.01, fy + 0.025);
    lamp(L / 2, 1.2, fy + 1.9);
  } else {
    divan(0.5, D - 1.3, L - 0.5, D - 0.5, fy);
    B('cloth_red', 2.0, 2.4, L - 2.0, D - 1.6, fy + 0.01, fy + 0.025); B('cloth_ochre', 2.3, 2.7, L - 2.3, D - 1.9, fy + 0.025, fy + 0.03);
    const p = F(L / 2, D / 2 - 0.2); bag.add('wood_dark', lathe([[0.25, 0], [0.18, 0.15], [0.22, 0.38], [0.001, 0.38]], 8, null, p[0], fy + 0.03, p[1])); bag.add('gilt_bronze', lathe([[0.001, 0], [0.42, 0.01], [0.4, 0.04], [0.001, 0.05]], 12, null, p[0], fy + 0.41, p[1]));
    B('wood_painted', L - 1.6, 0.6, L - 0.5, 1.2, fy, fy + 0.7, true); h('terracotta', 1.0, 0.9, 0.2, 0.7, fy);
    lamp(L / 2, D / 2, fy + 1.6);
  }
  if (N > 1) {
    const yk = y + ST + 0.03;
    divan(0.5, 6.0, L - 2.0, Math.min(7.0, D - 0.4), yk);
    B('wood_painted', 1.9, 0.6, 3.0, 1.2, yk, yk + 0.55, true); h('terracotta', 3.6, 0.8, 0.14, 0.4, yk);
    B('cloth_red', 2.0, 2.0, L - 3.2, 5.2, yk + 0.01, yk + 0.025);
    lamp(L / 2, 3.5, yk + 1.5);
  }
}
export const HOUSES = { andalusi_house: house };
