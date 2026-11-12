// The houses of Heian Uji (docs/settlements/heian-uji.md §11–§14): the commoner's house (heian_house: raised
// plank floor and earth floor, a roof of stone-weighted boards, thatch or cypress bark, wattle yard, granary,
// drying rack), the aristocratic hall of the shinden-zukuri (heian_hall: round posts, raised floor, hisashi
// aisle, shitomi and sudare, kōran veranda, stair; furnished with mats, kichō, byōbu, shelf, lamp stand,
// koto, a nurigome room with the chōdai), its covered corridor (watadono), the earthen wall (tsuijibei) and the
// gate (yakumon), the pier and the dragon-headed pleasure boat (ryūtō-gekishu) of the pond. Roofs of the
// shinden are `irimoya` elements of the japanese style (index.js).

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { hexa } from '../chinese/index.js';
import { tube } from './shape.js';
import { dressHouse, furnishTrade, wattle } from './village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pot = (bag, m, x, y, z, r, h) => bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, x, y, z));

/** A gabled roof of real thickness { x0, z0, x1, z1 (the walls), y (eave line), rise, o (eave reach across), ov (reach at the gable ends), th, alongX, mat, under }. */
function gabled(bag, R) {
  const { x0, z0, x1, z1, y, rise, o, ov, th, alongX } = R;
  const out = [], tr = [];
  // the ridge runs along x (alongX) or z; the slopes are on either side of it
  const P = (a, b, yy) => (alongX ? [a, yy, b] : [b, yy, a]);                  // a along the ridge, b across it
  const [a0, a1, b0, b1] = alongX ? [x0 - ov, x1 + ov, z0 - o, z1 + o] : [z0 - ov, z1 + ov, x0 - o, x1 + o];
  const bm = (b0 + b1) / 2, T = 'roofTop';
  for (const [bs, be] of [[b0, bm], [b1, bm]]) {
    const top = [P(a0, bs, y), P(a1, bs, y), P(a1, be, y + rise), P(a0, be, y + rise)];
    const bot = top.map((p) => [p[0], p[1] - th, p[2]]);
    hexa(out, bot, top);
  }
  bag.add(R.mat, fromTriangles(out));
  void T;
  // the gable walls under the verges, double-sided
  const wl = (a, w0, w1) => {
    const hh = rise * (bm - w0) / (bm - b0) - th - 0.03;
    const A = P(a, w0, y), B = P(a, w1, y), C = P(a, bm, y + hh);
    tr.push(...A, ...B, ...C, ...A, ...C, ...B);
  };
  const [wa0, wa1] = alongX ? [x0, x1] : [z0, z1], [wb0, wb1] = alongX ? [z0, z1] : [x0, x1];
  wl(wa0, wb0, wb1); wl(wa1, wb0, wb1);
  if (tr.length) bag.add(R.gable || 'timber', fromTriangles(tr));
  // the ridge cap
  const rc = alongX ? box(a0 - 0.1, y + rise - th * 0.5, bm - 0.22, a1 + 0.1, y + rise + 0.18, bm + 0.22) : box(bm - 0.22, y + rise - th * 0.5, a0 - 0.1, bm + 0.22, y + rise + 0.18, a1 + 0.1);
  bag.add(R.ridge || 'roof_ridge', rc);
  if (R.chigi) for (const e of [a0, a1]) {            // the crossed poles at the ends of a thatch ridge
    for (const s of [-1, 1]) { const A = P(e - Math.sign(e - (a0 + a1) / 2) * 0.1, bm - s * 0.4, y + rise + 0.8), B = P(e, bm + s * 0.4, y + rise - 0.05); bag.add('bamboo_culm', rod(A, B, 0.035, 5)); }
  }
}

/**
 * heian_house: { rect, y, foot, front ('n'|'s'|'e'|'w'), seed, open, simple }. The roof is of stone-weighted boards
 * (ishioki itabuki), thatch or cypress bark by the seed; a third of the houses have a narrow porch, a half a
 * wattle yard; open ones are hollow, with an earth floor and a raised plank floor.
 */
function heianHouse(el, { bag, col }) {
  const rand = rng((el.seed || 1) + 17);
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's', along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const kind = rand() < 0.4 ? 'board' : rand() < 0.55 ? 'thatch' : 'bark';
  const H = 2.5 + [0, 0.3, 0.6, 0.3][Math.floor(rng((el.seed || 1) * 3 + 101)() * 4)], sill = 0.45, fy = y + sill;   // eaves at 2.5–3.1 m: the low farmhouse, the tall shop-house
  const P = (u, v) => (f === 's' ? [x0 + u, z1 - v] : f === 'n' ? [x1 - u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rc = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = rc(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.3, yb); };
  const wallMat = rand() < 0.5 ? 'timber' : 'plaster_white';
  // stones under the sill
  B('limestone', -0.08, -0.08, L + 0.08, D + 0.08, el.foot !== undefined ? y + el.foot : y - 0.2, fy);
  const door = Math.min(L - 1.2, Math.max(1.2, L * (0.35 + rand() * 0.3))), dw = 1.1;
  const T = 0.2;
  if (el.open && !el.simple) {
    // hollow: the walls with the door's way in the front, the earth floor and the raised floor with the hearth
    B(wallMat, 0, D - T, L, D, fy, y + H, true); B(wallMat, 0, T, T, D - T, fy, y + H, true); B(wallMat, L - T, T, L, D - T, fy, y + H, true);
    B(wallMat, 0, 0, door - dw / 2, T, fy, y + H, true); B(wallMat, door + dw / 2, 0, L, T, fy, y + H, true); B(wallMat, door - dw / 2, 0, door + dw / 2, T, fy + 1.95, y + H);
    B('timber', door - dw / 2 - 0.02, T, door - dw / 2 + 0.05, T + dw, fy, fy + 1.9);                 // the leaf swung open inside
    const earth = Math.min(D - 2.4, 2.6);
    { const r = rc(T, T, L - T, D - T); col.floor(r, fy - 0.02); }
    B('earth_wall', T, T, L - T, T + earth, fy - 0.12, fy + 0.015);
    // the raised floor: a step board, then the planks with mats and the hearth
    const g0 = T + earth, ry = fy + 0.4;
    B('timber', T, g0 - 0.35, L - T, g0, fy - 0.12, fy + 0.2); col.floor(rc(T, g0 - 0.35, L - T, g0), fy + 0.2);
    B('timber', T, g0, L - T, D - T, fy - 0.12, ry); col.floor(rc(T, g0, L - T, D - T), ry);
    const hu = L * 0.5, hv = g0 + (D - T - g0) * 0.45;
    B('wood_dark', hu - 0.6, hv - 0.6, hu + 0.6, hv + 0.6, ry, ry + 0.05); B('pottery_dark', hu - 0.46, hv - 0.46, hu + 0.46, hv + 0.46, ry + 0.05, ry + 0.07);
    { const p = P(hu, hv); pot(bag, 'iron', p[0], ry + 0.55, p[1], 0.2, 0.22); const q = P(hu, hv); bag.add('bamboo_culm', rod([q[0], ry + 0.9, q[1]], [q[0], y + H - 0.1, q[1]], 0.02, 5)); }
    for (const [a, b] of [[T + 0.2, D - T - 1.15], [L - T - 2.0, D - T - 1.15]]) if (b > g0 + 0.2 && L > 5) B('reed_mat', a, b, a + 1.8, b + 0.95, ry, ry + 0.04);
    B('lacquer_chestnut', L - T - 0.8, g0 + 0.15, L - T - 0.1, g0 + 0.85, ry, ry + 0.65, true);
    B('wood_dark', T + 0.1, D - T - 0.5, T + 1.0, D - T - 0.1, ry, ry + 0.45, true);
    B('wood_dark', T + 0.05, D - T - 0.3, L - T - 0.05, D - T - 0.05, y + 1.85, y + 1.9);              // the hanging shelf with its jars
    for (let u = T + 0.5; u < L - T - 0.4; u += 0.7) { const p = P(u, D - T - 0.2); pot(bag, 'pottery_dark', p[0], y + 1.9, p[1], 0.08, 0.16); }
    // the clay stove (kamado) at the earth floor's side wall, its pot and a water jar
    B('earth_wall', L - T - 1.1, T + 0.1, L - T, T + 0.95, fy, fy + 0.8, true);
    { const p = P(L - T - 0.55, T + 0.52); pot(bag, 'iron', p[0], fy + 0.8, p[1], 0.3, 0.24); }
    { const p = P(T + 0.5, T + 0.6); pot(bag, 'pottery_dark', p[0], fy, p[1], 0.32, 0.8); }
    B('timber', T, T, L - T, D - T, y + H - 0.06, y + H - 0.02);
    { const lp = P(hu + 0.95, hv + 0.35); B('wood_dark', hu + 0.9 - 0.0, hv + 0.3, hu + 1.0, hv + 0.4, ry, ry + 0.32); bag.add('lamp_white', lathe([[0.001, 0], [0.1, 0.05], [0.13, 0.17], [0.07, 0.26], [0.001, 0.28]], 9, null, lp[0], ry + 0.32, lp[1])); }   // an andon lamp: paper shade on a stand, the room's light
    furnishTrade(el, { bag, col }, { P, B, ry, T, L, D, g0 });
  } else {
    B(wallMat, 0, 0, L, D, fy, y + H, true);
  }
  // posts, sill and head beams on the front, battens on plank walls
  for (let u = 0; u <= L + 0.01; u += L / Math.max(2, Math.round(L / 2.4))) B('wood_dark', u - 0.07, -0.05, u + 0.07, 0.02, fy, y + H);
  B('wood_dark', 0, -0.05, L, 0.02, y + H - 0.16, y + H); B('wood_dark', 0, -0.04, L, 0.02, fy, fy + 0.1);
  if (!el.simple) {
    // the plank door (open ones leave the way), a lattice window with a blind half lowered over it
    if (!el.open) { B('timber', door - dw / 2, -0.05, door + dw / 2, 0.0, fy, fy + 1.9); for (let k = 1; k < 5; k++) B('wood_dark', door - dw / 2 + k * dw / 5 - 0.01, -0.07, door - dw / 2 + k * dw / 5 + 0.01, -0.05, fy + 0.03, fy + 1.87); }
    B('wood_dark', door - dw / 2 - 0.1, -0.08, door + dw / 2 + 0.1, 0.02, fy + 1.9, fy + 2.05);
    const wx = door > L / 2 ? 0.5 + (door - 1.6 - 0.5) * 0.3 : door + 1.3 + (L - door - 1.3 - 1.4) * 0.3;
    if (wx > 0.3 && wx + 1.1 < L - 0.3) {
      B('opening', wx, -0.012, wx + 1.1, 0.0, fy + 0.9, fy + 1.75); B('koshi', wx, -0.05, wx + 1.1, -0.012, fy + 0.9, fy + 1.75);
      B('wood_dark', wx - 0.08, -0.07, wx + 1.18, -0.02, fy + 1.75, fy + 1.83);
      if (rand() < 0.6) B('reed_mat', wx - 0.05, -0.1, wx + 1.15, -0.07, fy + 1.15, fy + 1.78);
    }
    if (kind !== 'thatch') for (let u = 0.35; u < L - 0.2; u += 0.45) if (Math.abs(u - door) > 0.8 && wallMat === 'timber') B('wood_dark', u, -0.025, u + 0.045, 0.0, fy + 0.1, y + H - 0.16);
  }
  // the roof
  const pitch = kind === 'board' ? 0.34 : kind === 'bark' ? 0.55 : 0.95, ridgeU = rand() < 0.5 ? true : false;
  const alongX = along ? ridgeU : !ridgeU, span = alongX ? D : L;
  const rise = Math.max(0.7, pitch * span / 2), roof = kind === 'thatch' ? 'thatch' : 'roof_bark', o = kind === 'thatch' ? 0.9 : 0.8;
  gabled(bag, { x0, z0, x1, z1, y: y + H, rise, o, ov: kind === 'thatch' ? 0.55 : 0.4, th: kind === 'thatch' ? 0.38 : 0.12, alongX, mat: roof, gable: wallMat === 'timber' ? 'timber' : 'plaster_white', chigi: kind === 'thatch', ridge: kind === 'thatch' ? 'thatch' : 'roof_ridge' });
  // the board roof's weights: head-sized stones in rows along the slopes, held by poles
  if (kind === 'board' && !el.simple) {
    const sx = alongX ? x1 - x0 : z1 - z0, step = 0.5;
    for (const s of [-1, 1]) for (let r = 0; r < 4; r++) {
      const fr = (r + 0.7) / 5, b = (alongX ? (z0 + z1) / 2 + s * (D / 2 + o) * (1 - fr) : (x0 + x1) / 2 + s * (L / 2 + o) * (1 - fr));
      const yy = y + H + rise * fr + 0.04;
      for (let a = (alongX ? x0 : z0) - 0.1; a < (alongX ? x0 : z0) + sx + 0.1; a += step) {
        const jx = (a * 13.7 + r * 7.1) % 0.12;
        const cx = alongX ? a + jx : b, cz = alongX ? b : a + jx;
        bag.add('limestone', box(cx - 0.12, yy, cz - 0.1, cx + 0.12, yy + 0.17, cz + 0.1));
      }
    }
  }
  col.rect([x0, z0, x1, z1], y - 0.3, y + H);
  if (el.simple) return;
  // the yard: a wattle fence behind and at one side, a woodpile, jars, a rack of drying rice sheaves, sometimes a granary on posts
  const yp = (u, v, w = 0.4) => { const p = P(u, v); return p; };
  const fence = (u0, v0, u1, v1) => {
    const a = P(u0, v0), b = P(u1, v1), n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2.2));
    bag.add('wicker', box(Math.min(a[0], b[0]) - 0.03, y, Math.min(a[1], b[1]) - 0.03, Math.max(a[0], b[0]) + 0.03, y + 1.15, Math.max(a[1], b[1]) + 0.03));
    for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; bag.add('bark_dark', box(x - 0.05, y, z - 0.05, x + 0.05, y + 1.3, z + 0.05)); }
    col.segment(a, b, 0.14, y, y + 1.2);
  };
  if (rand() < 0.7) { fence(-0.9, D + 0.9, L + 0.9, D + 0.9); }
  if (rand() < 0.5) { fence(L + 0.9, 1.5, L + 0.9, D + 0.9); }
  if (rand() < 0.5) {                                                      // the woodpile at the back wall
    const u = 0.6 + rand() * Math.max(0.1, L - 3), p = P(u, D + 0.4), q = P(u + 1.3, D + 0.9), x0b = Math.min(p[0], q[0]), z0b = Math.min(p[1], q[1]);
    bag.add('wood_dark', box(x0b, y, z0b, Math.max(p[0], q[0]), y + 0.7, Math.max(p[1], q[1])));
  }
  for (let i = 0; i < 2; i++) if (rand() < 0.6) { const p = yp(1 + rand() * (L - 2), -0.9 - rand() * 0.5); pot(bag, 'pottery_dark', p[0], y, p[1], 0.3, 0.8); }
  if (rand() < 0.45) {                                                     // the rice-drying rack: two posts, three poles, sheaves hung
    const u0 = rand() * Math.max(0.1, L - 3.2), v = -1.8, a = P(u0, v), b = P(u0 + 3.0, v);
    for (const p of [a, b]) bag.add('bamboo_culm', rod([p[0], y, p[1]], [p[0], y + 2.3, p[1]], 0.045, 5));
    for (const h of [1.2, 1.7, 2.2]) bag.add('bamboo_culm', rod([a[0], y + h, a[1]], [b[0], y + h, b[1]], 0.03, 5));
    for (const h of [1.7, 2.2]) for (let k = 0; k < 6; k++) { const t = (k + 0.5) / 6, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; bag.add('thatch', lathe([[0.12, 0], [0.09, 0.2], [0.05, 0.42], [0.001, 0.5]], 6, null, x, y + h - 0.5, z)); }
  }
  if (L > 8 && rand() < 0.3) {                                             // a granary on four posts, its roof of thatch
    const u = L - 2.4, v = D + 1.6, g = rc(u - 1.0, v - 1.0, u + 1.0, v + 1.0);
    for (const [px, pz] of [[g[0] + 0.1, g[1] + 0.1], [g[2] - 0.1, g[1] + 0.1], [g[0] + 0.1, g[3] - 0.1], [g[2] - 0.1, g[3] - 0.1]]) { bag.add('wood_dark', box(px - 0.07, y, pz - 0.07, px + 0.07, y + 0.9, pz + 0.07)); col.circle(px, pz, 0.14, y, y + 0.9); }
    bag.add('timber', box(g[0], y + 0.9, g[1], g[2], y + 2.0, g[3]));
    gabled(bag, { x0: g[0], z0: g[1], x1: g[2], z1: g[3], y: y + 2.0, rise: 0.9, o: 0.4, ov: 0.3, th: 0.25, alongX: along, mat: 'thatch', gable: 'timber', chigi: true, ridge: 'thatch' });
  }
  dressHouse(el, { bag, col }, { P, B, rc, L, D, y, fy, H, door, dw, wallMat, kind, gabled });
}

/**
 * heian_hall: a hall of the shinden-zukuri { rect (the floor including its aisle), y (ground), fl (floor height), front ('s'),
 * core: [u0, u1] (the moya's extent along the front as a fraction pair), furnish: 'shinden'|'taiya'|'none', seed, simple }.
 * Round posts of natural cypress every 2.4 m on stone bases, the floor of boards on joists, a veranda along the front
 * with the kōran, the stair in the middle bay, shitomi lattices and sudare along the aisle's outer line, solid ends.
 */
function heianHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, fl = el.fl ?? 1.0, fy = y + fl, KEN = 2.4, PH = 3.0;
  const nx = Math.max(2, Math.round((x1 - x0) / KEN)), px = (i) => x0 + (x1 - x0) * i / nx;
  const rand = rng((el.seed || 1) + 5);
  // the floor and its edge board; the joists are seen between the posts
  bag.add('timber', box(x0 - 0.15, fy - 0.16, z0 - 0.15, x1 + 0.15, fy, z1 + 0.15));
  bag.add('wood_dark', box(x0 - 0.2, fy - 0.34, z0 - 0.2, x1 + 0.2, fy - 0.16, z0 - 0.15)); bag.add('wood_dark', box(x0 - 0.2, fy - 0.34, z1 + 0.15, x1 + 0.2, fy - 0.16, z1 + 0.2));
  bag.add('wood_dark', box(x0 - 0.2, fy - 0.34, z0 - 0.15, x0 - 0.15, fy - 0.16, z1 + 0.15)); bag.add('wood_dark', box(x1 + 0.15, fy - 0.34, z0 - 0.15, x1 + 0.2, fy - 0.16, z1 + 0.15));
  col.floor([x0 - 0.15, z0 - 0.15, x1 + 0.15, z1 + 0.15], fy);
  // posts: the outer ring, with stone bases; the front's veranda and the back
  const post = (x, z, h = PH + fl) => { bag.add('limestone', box(x - 0.3, y, z - 0.3, x + 0.3, y + 0.28, z + 0.3)); bag.add('timber', lathe([[0.16, 0], [0.16, h * 0.5], [0.15, h]], 12, null, x, y + 0.28, z)); col.circle(x, z, 0.19, y, y + h); };
  const nz = Math.max(1, Math.round((z1 - z0) / KEN));
  for (let i = 0; i <= nx; i++) { post(px(i), z0); post(px(i), z1); }
  for (let j = 1; j < nz; j++) { const z = z0 + (z1 - z0) * j / nz, mid = Math.abs(z - (z0 + z1) / 2) < 0.1; if (!(mid && el.doors?.includes('w'))) post(x0, z); if (!(mid && el.doors?.includes('e'))) post(x1, z); }
  // the beam round the head of the posts
  bag.add('wood_dark', box(x0 - 0.2, y + fl + PH - 0.3, z0 - 0.2, x1 + 0.2, y + fl + PH, z0 + 0.15)); bag.add('wood_dark', box(x0 - 0.2, y + fl + PH - 0.3, z1 - 0.15, x1 + 0.2, y + fl + PH, z1 + 0.2));
  bag.add('wood_dark', box(x0 - 0.2, y + fl + PH - 0.3, z0 + 0.15, x0 + 0.15, y + fl + PH, z1 - 0.15)); bag.add('wood_dark', box(x1 - 0.15, y + fl + PH - 0.3, z0 + 0.15, x1 + 0.2, y + fl + PH, z1 - 0.15));
  // the front (south): a veranda 1.5 m deep with the kōran, a stair of seven steps in the middle bay
  const m = Math.floor(nx / 2), sx0 = px(m), sx1 = px(m + 1), V = 1.6;
  bag.add('timber', box(x0 - 0.3, fy - 0.12, z1 + 0.2, x1 + 0.3, fy - 0.02, z1 + V));
  col.floor([x0 - 0.3, z1 + 0.2, x1 + 0.3, z1 + V], fy - 0.02);
  const rail = (a, b, zz) => { bag.add('lacquer_red', box(a, fy + 0.84, zz - 0.05, b, fy + 0.92, zz + 0.05)); bag.add('lacquer_red', box(a, fy + 0.4, zz - 0.035, b, fy + 0.46, zz + 0.035)); col.segment([a, zz], [b, zz], 0.12, fy - 0.1, fy + 0.95); };
  rail(x0 - 0.3, sx0, z1 + V - 0.05); rail(sx1, x1 + 0.3, z1 + V - 0.05);
  for (let x = x0 - 0.2; x < x1 + 0.3; x += 1.2) if (x < sx0 + 0.05 || x > sx1 - 0.05) bag.add('lacquer_red', box(x - 0.05, fy - 0.02, z1 + V - 0.1, x + 0.05, fy + 0.95, z1 + V));
  const steps = 7, sh = fl / steps;
  for (let k = 1; k <= steps; k++) bag.add('limestone', box(sx0 + 0.2, y, z1 + V + (k - 1) * 0.3, sx1 - 0.2, y + fl - k * sh, z1 + V + k * 0.3));
  col.ramp([sx0 + 0.2, z1 + V, sx1 - 0.2, z1 + V + steps * 0.3], y, fy - 0.02, 'n');
  // the aisle's outer line: bays of shitomi (lattice, half hung up under the eave) and half-lowered sudare, solid ends, doors at the back
  const hb = z1 - 0.12, cl = fy + PH - 0.3;
  for (let i = 0; i < nx; i++) {
    const a = px(i) + 0.17, b = px(i + 1) - 0.17;
    if (i === m) { bag.add('cloth_red', box(a + 0.3, fy + 2.0, hb - 0.03, b - 0.3, cl, hb + 0.0)); continue; }       // the central bay open, a valance of red cloth
    if (i % 2 === 0) {                                                  // shitomi: the lower leaf of lattice, the upper hung up under the beam
      bag.add('opening', box(a, fy + 0.0, hb - 0.02, b, fy + 1.15, hb)); bag.add('koshi', box(a, fy + 0.0, hb, b, fy + 1.15, hb + 0.05));
      bag.add('lacquer_black', box(a, fy + 1.15, hb - 0.02, b, fy + 1.22, hb + 0.07));
      bag.add('koshi', box(a + 0.05, cl - 0.08, hb - 0.06, b - 0.05, cl, hb + 0.04));
      col.segment([a, hb], [b, hb], 0.1, fy, fy + 1.2);
    } else {                                                            // sudare half lowered, with its cloth border and cords
      bag.add('reed_mat', box(a + 0.03, fy + 1.1, hb - 0.0, b - 0.03, cl, hb + 0.04)); bag.add('cloth_green', box(a + 0.03, fy + 1.04, hb - 0.0, b - 0.03, fy + 1.1, hb + 0.045));
      col.segment([a, hb], [b, hb], 0.1, fy, fy + 1.1);
    }
  }
  // the moya's front line, a little inside; the sliding panels (mairado) with a bay open in the middle
  const cu0 = el.core ? x0 + (x1 - x0) * el.core[0] : x0 + KEN, cu1 = el.core ? x0 + (x1 - x0) * el.core[1] : x1 - KEN, cz = z0 + (z1 - z0 - 2 * KEN * 0.5) * 0.5;
  void cz;
  const mz = z1 - KEN;
  for (let i = 0; i < nx && !el.noMoya; i++) {
    const a = px(i), b = px(i + 1);
    if (b <= cu0 + 0.01 || a >= cu1 - 0.01) continue;
    if (i === m) continue;
    bag.add('timber', box(a + 0.05, fy, mz - 0.04, b - 0.05, fy + PH - 0.3, mz + 0.04));
    bag.add('lacquer_black', box(a + 0.05, fy, mz - 0.05, b - 0.05, fy + 0.08, mz + 0.05)); bag.add('lacquer_black', box(a + 0.05, fy + PH - 0.4, mz - 0.05, b - 0.05, fy + PH - 0.3, mz + 0.05));
    col.segment([a, mz], [b, mz], 0.1, fy, fy + PH);
  }
  // the ends: walls of planks and plaster with the posts' lines; a door in the back
  for (const [xe, side] of [[x0, 'w'], [x1, 'e']]) {
    const zm = (z0 + z1) / 2, segs = el.doors?.includes(side) ? [[z0 + 0.2, zm - 0.8], [zm + 0.8, z1 - 0.2]] : [[z0 + 0.2, z1 - 0.2]];
    for (const [za, zb] of segs) { bag.add('plaster_white', box(xe - 0.06, fy, za, xe + 0.06, fy + PH - 0.3, zb)); col.segment([xe, za], [xe, zb], 0.12, fy, fy + PH); }
    if (el.doors?.includes(side)) bag.add('wood_dark', box(xe - 0.1, fy + 2.1, zm - 0.9, xe + 0.1, fy + PH - 0.3, zm + 0.9));
  }
  // the back (north) wall: solid plaster with a door of boards at the middle
  const bx = px(m);
  bag.add('plaster_white', box(x0 + 0.2, fy, z0 - 0.06, bx - 0.2, fy + PH - 0.3, z0 + 0.06)); bag.add('plaster_white', box(px(m + 1) + 0.2, fy, z0 - 0.06, x1 - 0.2, fy + PH - 0.3, z0 + 0.06));
  bag.add('plaster_white', box(bx - 0.2, fy + 2.1, z0 - 0.06, px(m + 1) + 0.2, fy + PH - 0.3, z0 + 0.06));
  bag.add('timber', box(bx - 0.2, fy, z0 - 0.05, px(m + 1) + 0.2, fy + 2.1, z0 + 0.05)); col.segment([bx - 0.2, z0], [px(m + 1) + 0.2, z0], 0.12, fy, fy + PH);
  col.segment([x0 + 0.2, z0], [bx - 0.2, z0], 0.12, fy, fy + PH); col.segment([px(m + 1) + 0.2, z0], [x1 - 0.2, z0], 0.12, fy, fy + PH);
  if (el.simple || el.furnish === 'none') return;
  // ── furnishing ─────────────────────────────────────────────────────────────────────────────
  const mat = (cx, cz2, w, d, border = 'cloth_black', h = 0.06, ya = fy) => { bag.add('reed_mat', box(cx - w / 2, ya, cz2 - d / 2, cx + w / 2, ya + h, cz2 + d / 2)); bag.add(border, box(cx - w / 2 - 0.0, ya + h - 0.01, cz2 - d / 2, cx + w / 2, ya + h + 0.006, cz2 - d / 2 + 0.07)); bag.add(border, box(cx - w / 2, ya + h - 0.01, cz2 + d / 2 - 0.07, cx + w / 2, ya + h + 0.006, cz2 + d / 2)); };
  const zc = el.noMoya ? (z0 + z1) / 2 : z0 + (mz - z0) * 0.55, xm = (x0 + x1) / 2;
  if (el.furnish === 'shinden') {
    // the master's seat: two thick mats (agedatami) at the back of the moya with a canopy-less dais, a screen behind
    mat(xm, z0 + 1.2, 2.0, 1.0, 'cloth_red', 0.16); mat(xm, z0 + 2.2, 2.0, 1.0, 'cloth_red', 0.16);
    bag.add('cloth_ochre', box(xm - 0.35, fy + 0.16, z0 + 1.7, xm + 0.35, fy + 0.2, z0 + 2.25));                // the cushion (shitone)
    // the folding screen (byōbu), six panels zig-zag in gilt with a black frame, behind the seat
    for (let k = 0; k < 6; k++) { const xa = xm - 2.1 + k * 0.7, za = z0 + 0.35 + (k % 2) * 0.1; bag.add('lacquer_black', box(xa, fy, za, xa + 0.7, fy + 1.55, za + 0.04)); bag.add('gold', box(xa + 0.04, fy + 0.06, za + 0.04, xa + 0.66, fy + 1.49, za + 0.055)); bag.add('paint_blue', box(xa + 0.14, fy + 0.4, za + 0.055, xa + 0.56, fy + 1.0, za + 0.062)); }
    // two curtain stands (kichō) beside the seat: a T-frame of black lacquer, a curtain of white silk with red cords
    for (const dx of [-2.2, 2.2]) {
      const cx = xm + dx, cz2 = z0 + 1.9;
      bag.add('lacquer_black', box(cx - 0.4, fy, cz2 - 0.04, cx + 0.4, fy + 0.05, cz2 + 0.04)); bag.add('lacquer_black', box(cx - 0.02, fy + 0.05, cz2 - 0.02, cx + 0.02, fy + 1.6, cz2 + 0.02));
      bag.add('lacquer_black', box(cx - 0.6, fy + 1.6, cz2 - 0.02, cx + 0.6, fy + 1.64, cz2 + 0.02));
      bag.add('cloth_white', box(cx - 0.58, fy + 0.5, cz2 - 0.012, cx - 0.02, fy + 1.6, cz2 + 0.012)); bag.add('cloth_white', box(cx + 0.02, fy + 0.5, cz2 - 0.012, cx + 0.58, fy + 1.6, cz2 + 0.012));
      bag.add('cloth_red', box(cx - 0.58, fy + 1.45, cz2 - 0.015, cx + 0.58, fy + 1.5, cz2 + 0.015));
    }
    // guests' round mats (warawa-da) and a long mat before the seat; a low lacquer table with a lamp stand
    for (const [dx, dz] of [[-1.7, 0.2], [1.7, 0.2], [0, 1.0]]) bag.add('reed_mat', lathe([[0.5, 0], [0.5, 0.05], [0.001, 0.05]], 14, null, xm + dx, fy, zc + dz));
    mat(xm - 3.4, zc + 0.6, 1.9, 0.95, 'cloth_green'); mat(xm + 3.4, zc + 0.6, 1.9, 0.95, 'cloth_green');
    bag.add('lacquer_black', box(xm - 0.5, fy + 0.3, zc + 0.8, xm + 0.5, fy + 0.34, zc + 1.3)); for (const [a, b] of [[-0.45, 0.85], [0.4, 0.85], [-0.45, 1.25], [0.4, 1.25]]) bag.add('lacquer_black', box(xm + a, fy, zc + b, xm + a + 0.05, fy + 0.3, zc + b + 0.05));
    pot(bag, 'glaze_green', xm - 0.2, fy + 0.34, zc + 1.05, 0.08, 0.14); pot(bag, 'pottery_dark', xm + 0.2, fy + 0.34, zc + 1.05, 0.06, 0.1);
    // the lamp stand (tōdai): a slim pole on crossed feet with a dish
    const lx = xm + 2.9, lz = zc - 0.9; bag.add('lacquer_black', box(lx - 0.2, fy, lz - 0.025, lx + 0.2, fy + 0.03, lz + 0.025)); bag.add('lacquer_black', box(lx - 0.025, fy, lz - 0.2, lx + 0.025, fy + 0.03, lz + 0.2)); bag.add('lacquer_black', rod([lx, fy, lz], [lx, fy + 1.3, lz], 0.02, 5)); bag.add('pottery_dark', lathe([[0.1, 0], [0.12, 0.03], [0.001, 0.03]], 8, null, lx, fy + 1.3, lz));
    // the shelf (zushi-dana) against the back wall: black lacquer, two tiers, with a mirror stand and a jar; a koto on the floor
    const sx = x0 + 1.6; bag.add('lacquer_black', box(sx - 0.7, fy, z0 + 0.2, sx + 0.7, fy + 0.9, z0 + 0.65)); bag.add('gilt_bronze', box(sx - 0.62, fy + 0.46, z0 + 0.64, sx + 0.62, fy + 0.5, z0 + 0.66)); pot(bag, 'glaze_blue', sx - 0.3, fy + 0.9, z0 + 0.42, 0.1, 0.2); bag.add('gilt_bronze', lathe([[0.14, 0], [0.14, 0.01], [0.001, 0.01]], 12, null, sx + 0.3, fy + 0.95, z0 + 0.42));
    col.rect([sx - 0.7, z0 + 0.2, sx + 0.7, z0 + 0.65], fy, fy + 0.9);
    const kx = x1 - 3.6, kz = zc + 0.1; bag.add('wood_dark', box(kx - 0.9, fy + 0.1, kz - 0.12, kx + 0.9, fy + 0.18, kz + 0.12)); for (const dx of [-0.7, 0.7]) bag.add('lacquer_black', box(kx + dx - 0.05, fy, kz - 0.14, kx + dx + 0.05, fy + 0.1, kz + 0.14));
    for (let k = 0; k < 6; k++) bag.add('ivory', box(kx - 0.7 + k * 0.28, fy + 0.18, kz - 0.1, kx - 0.66 + k * 0.28, fy + 0.22, kz + 0.1));
    // the nurigome room at the east end of the moya's back: plaster walls, a door; inside the canopied bed (chōdai) of black lacquer and white silk
    const rx1 = x1 - KEN * 0.0 - 0.3, rx0 = rx1 - 2.4, rz0 = z0 + 0.2, rz1 = rz0 + 2.4, dwl = [rz0 + 0.7, rz0 + 1.7];
    bag.add('plaster_white', box(rx0 - 0.1, fy, rz0, rx0, fy + 2.5, dwl[0])); bag.add('plaster_white', box(rx0 - 0.1, fy, dwl[1], rx0, fy + 2.5, rz1)); bag.add('plaster_white', box(rx0 - 0.1, fy + 1.9, dwl[0], rx0, fy + 2.5, dwl[1]));
    bag.add('plaster_white', box(rx0, fy, rz1, rx1, fy + 2.5, rz1 + 0.1));
    col.segment([rx0 - 0.05, rz0], [rx0 - 0.05, dwl[0]], 0.12, fy, fy + 2.5); col.segment([rx0 - 0.05, dwl[1]], [rx0 - 0.05, rz1], 0.12, fy, fy + 2.5); col.segment([rx0, rz1 + 0.05], [rx1, rz1 + 0.05], 0.12, fy, fy + 2.5);
    bag.add('lacquer_black', box(rx0 + 0.5, fy, rz0 + 0.35, rx1 - 0.3, fy + 0.35, rz1 - 0.35)); bag.add('reed_mat', box(rx0 + 0.55, fy + 0.35, rz0 + 0.4, rx1 - 0.35, fy + 0.4, rz1 - 0.4));
    for (const [a, b] of [[rx0 + 0.5, rz0 + 0.35], [rx1 - 0.35, rz0 + 0.35], [rx0 + 0.5, rz1 - 0.4], [rx1 - 0.35, rz1 - 0.4]]) bag.add('lacquer_black', box(a, fy + 0.35, b, a + 0.05, fy + 1.9, b + 0.05));
    bag.add('lacquer_black', box(rx0 + 0.5, fy + 1.9, rz0 + 0.35, rx1 - 0.3, fy + 1.95, rz1 - 0.35));
    for (const s of [0, 1]) bag.add('cloth_white', box(rx0 + 0.52, fy + 0.9, s ? rz1 - 0.4 : rz0 + 0.36, rx1 - 0.32, fy + 1.9, s ? rz1 - 0.36 : rz0 + 0.4));
    bag.add('cloth_white', box(rx1 - 0.36, fy + 0.9, rz0 + 0.36, rx1 - 0.32, fy + 1.9, rz1 - 0.36));
    col.rect([rx0 + 0.5, rz0 + 0.35, rx1 - 0.3, rz1 - 0.35], fy, fy + 1.95);
    void rand;
  } else {
    // a tai-no-ya: mats along the floor, a screen standing, a chest and a lamp stand
    for (let k = 0; k < 3; k++) mat(xm - 1.9 + k * 1.95, zc, 1.9, 0.95, k % 2 ? 'cloth_green' : 'cloth_black');
    for (let k = 0; k < 4; k++) { const xa = xm - 1.4 + k * 0.7, za = z0 + 0.45 + (k % 2) * 0.1; bag.add('lacquer_black', box(xa, fy, za, xa + 0.7, fy + 1.4, za + 0.04)); bag.add('gold', box(xa + 0.04, fy + 0.06, za + 0.04, xa + 0.66, fy + 1.34, za + 0.055)); bag.add('paint_ochre', box(xa + 0.16, fy + 0.3, za + 0.055, xa + 0.54, fy + 0.8, za + 0.062)); }
    bag.add('lacquer_chestnut', box(x1 - 1.3, fy, z0 + 0.4, x1 - 0.5, fy + 0.6, z0 + 1.1)); col.rect([x1 - 1.3, z0 + 0.4, x1 - 0.5, z0 + 1.1], fy, fy + 0.6);
  }
}

/** A covered corridor (watadono) { a: [x, z], b: [x, z], y, fl, w }: a floor on posts with railings and a gabled roof of bark. */
function corridor(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, fl = el.fl ?? 1.0, w = el.w ?? 2.4, fy = y + fl, alongX = Math.abs(bx - ax) > Math.abs(bz - az);
  const [x0, x1] = [Math.min(ax, bx), Math.max(ax, bx)], [z0, z1] = [Math.min(az, bz), Math.max(az, bz)];
  const R = alongX ? [x0, az - w / 2, x1, az + w / 2] : [ax - w / 2, z0, ax + w / 2, z1];
  bag.add('timber', box(R[0], fy - 0.15, R[1], R[2], fy, R[3])); col.floor(R, fy);
  const n = Math.max(1, Math.round((alongX ? x1 - x0 : z1 - z0) / 2.4));
  for (let i = 0; i <= n; i++) for (const s of [-1, 1]) {
    const p = alongX ? [x0 + (x1 - x0) * i / n, az + s * (w / 2 - 0.1)] : [ax + s * (w / 2 - 0.1), z0 + (z1 - z0) * i / n];
    bag.add('limestone', box(p[0] - 0.22, y, p[1] - 0.22, p[0] + 0.22, y + 0.24, p[1] + 0.22)); bag.add('timber', lathe([[0.13, 0], [0.13, fl + 2.4 - 0.24]], 10, null, p[0], y + 0.24, p[1])); col.circle(p[0], p[1], 0.16, y, fy + 2.4);
  }
  for (const s of [-1, 1]) {      // the half-wall of boards below the rail, the rail
    const c = alongX ? [R[0], az + s * (w / 2 - 0.1), R[2], az + s * (w / 2 - 0.1)] : [ax + s * (w / 2 - 0.1), R[1], ax + s * (w / 2 - 0.1), R[3]];
    const bb = alongX ? box(c[0], fy, c[1] - 0.04, c[2], fy + 0.85, c[1] + 0.04) : box(c[0] - 0.04, fy, c[1], c[0] + 0.04, fy + 0.85, c[3]);
    bag.add('lacquer_red', bb); col.segment([c[0], c[1]], [c[2], c[3]], 0.14, fy, fy + 0.9);
  }
  gabled(bag, { x0: R[0], z0: R[1], x1: R[2], z1: R[3], y: fy + 2.4, rise: 1.1, o: 0.8, ov: 0.3, th: 0.14, alongX, mat: 'roof_bark', gable: 'timber' });
}

/** An earthen wall (tsuijibei) with a tiled coping { a, b, y, h }: a core of rammed earth, plaster bands (the white stripes of an imperial grade), the coping. */
function tsuijibei(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 2.4, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]];
  const pts = (t, s) => [ax + u[0] * t + n[0] * s, az + u[1] * t + n[1] * s];
  const slab = (mat, s0, s1, ya, yb, t0 = 0, t1 = L) => { const A = pts(t0, s0), Bp = pts(t1, s1); bag.add(mat, box(Math.min(A[0], Bp[0]), ya, Math.min(A[1], Bp[1]), Math.max(A[0], Bp[0]), yb, Math.max(A[1], Bp[1]))); };
  const ho = (t) => (el.ho ?? 0.35) * (1 - t);
  void ho;
  // the earth wall, battered: three tapering courses
  slab('earth_wall', -0.45, 0.45, y - 0.2, y + h * 0.4); slab('earth_wall', -0.4, 0.4, y + h * 0.4, y + h * 0.75); slab('earth_wall', -0.36, 0.36, y + h * 0.75, y + h);
  slab('plaster_white', -0.462, 0.462, y + h * 0.34, y + h * 0.4 - 0.02, 0, L);
  slab('plaster_white', -0.412, 0.412, y + h * 0.7, y + h * 0.75 - 0.02, 0, L);
  slab('tile_dark', -0.55, 0.55, y + h, y + h + 0.16); slab('tile_dark', -0.4, 0.4, y + h + 0.16, y + h + 0.32);
  col.segment([ax, az], [bx, bz], 0.9, y - 0.2, y + h + 0.3);
}

/** The gate (yakumon) of a wall { at, y, yaw (0: leaves on the z axis, so the way runs along z), w }: four posts, a gable of bark, leaves open. */
function yakumon(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, w = el.w ?? 3.2, alongZ = (el.axis ?? 'z') === 'z';
  const P = (a, b) => (alongZ ? [x + a, z + b] : [x + b, z + a]);
  const posts = [[-w / 2, -0.7], [w / 2, -0.7], [-w / 2, 0.7], [w / 2, 0.7]];
  for (const [a, b] of posts) { const p = P(a, b); bag.add('limestone', box(p[0] - 0.3, y, p[1] - 0.3, p[0] + 0.3, y + 0.2, p[1] + 0.3)); bag.add('timber_ni', lathe([[0.2, 0], [0.19, 3.3]], 12, null, p[0], y + 0.2, p[1])); col.circle(p[0], p[1], 0.22, y, y + 3.5); }
  const beam = (a0, b0, a1, b1, ya, yb, m = 'wood_dark') => { const p = P(a0, b0), q = P(a1, b1); bag.add(m, box(Math.min(p[0], q[0]), ya, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yb, Math.max(p[1], q[1]))); };
  beam(-w / 2 - 0.2, -0.85, w / 2 + 0.2, -0.55, y + 3.0, y + 3.35); beam(-w / 2 - 0.2, 0.55, w / 2 + 0.2, 0.85, y + 3.0, y + 3.35);
  beam(-w / 2 - 0.2, -0.85, -w / 2 + 0.2, 0.85, y + 3.0, y + 3.35); beam(w / 2 - 0.2, -0.85, w / 2 + 0.2, 0.85, y + 3.0, y + 3.35);
  // the leaves folded back against the side posts, of boards with a lattice head
  for (const s of [-1, 1]) { beam(s * (w / 2 - 0.25) - 0.05, -0.7, s * (w / 2 - 0.25) + 0.05, 0.7, y + 0.2, y + 2.8, 'timber'); }
  const Rx = P(-w / 2 - 0.9, -1.3), Ry = P(w / 2 + 0.9, 1.3);
  gabled(bag, { x0: Math.min(Rx[0], Ry[0]) + (alongZ ? 0.7 : 1.0), z0: Math.min(Rx[1], Ry[1]) + (alongZ ? 1.0 : 0.7), x1: Math.max(Rx[0], Ry[0]) - (alongZ ? 0.7 : 1.0), z1: Math.max(Rx[1], Ry[1]) - (alongZ ? 1.0 : 0.7), y: y + 3.35, rise: 1.5, o: 1.0, ov: 0.9, th: 0.2, alongX: !alongZ, mat: 'roof_bark', gable: 'plaster_white' });
}

/** A wooden pier on piles into the pond { a: [x, z] (on the shore), b: [x, z] (the end), y (deck), bed, w }. */
function pier(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], w = (el.w ?? 2.2) / 2, y = el.y;
  const P = (t, s) => [ax + u[0] * t + n[0] * s, az + u[1] * t + n[1] * s];
  const cs = [P(0, -w), P(L, -w), P(L, w), P(0, w)];
  const xs = cs.map((p) => p[0]), zs = cs.map((p) => p[1]);
  bag.add('timber', box(Math.min(...xs), y - 0.12, Math.min(...zs), Math.max(...xs), y, Math.max(...zs)));
  col.floor([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y);
  for (let t = 0.6; t <= L; t += 2.4) for (const s of [-1, 1]) { const p = P(t, s * (w - 0.1)); bag.add('bark_dark', lathe([[0.1, 0], [0.1, y - (el.bed ?? -2) + 0.25]], 8, null, p[0], el.bed ?? -2, p[1])); }
}

/**
 * A pleasure boat of the pond (ryūtō-gekishu, "dragon-head and fish-hawk boat") { at: [x, z], rot, y (waterline), len, head: 'dragon'|'hawk' }:
 * a long narrow hull with a high curved prow carrying the carved head, a low open pavilion with a pyramid roof of bark amidships
 * over a mat, rails, and a pennant pole at the stern; the bow toward −z at rot 0.
 */
function ryuto(el, { bag }) {
  const [cx, cz] = el.at, y = el.y, rot = el.rot ?? 0, L = el.len ?? 9, B = 1.0, D = 0.55, c = Math.cos(rot), s = Math.sin(rot);
  const T = (lx, ly, lz) => [cx + lx * c + lz * s, y + ly, cz - lx * s + lz * c];     // local: bow toward −z
  const out = [];
  const N = 14, ring = [0, 1, 2, 3, 4, 5];
  const sec = (t) => {                                    // a station at t (0 bow … 1 stern): half-beam, keel, sheer
    const e = Math.sin(Math.PI * Math.min(1, t * 0.97 + 0.015)), hb = B * Math.pow(e, 0.6), sheer = 0.35 * Math.pow(Math.abs(2 * t - 1), 2.4) + 0.0;
    return { hb, z: -L / 2 + L * t, sheer, keel: -D + 0.15 * Math.pow(Math.abs(2 * t - 1), 2) };
  };
  const prof = (st) => [[-st.hb, st.sheer], [-st.hb * 0.9, st.keel + 0.25], [-st.hb * 0.45, st.keel], [st.hb * 0.45, st.keel], [st.hb * 0.9, st.keel + 0.25], [st.hb, st.sheer]];
  for (let i = 0; i < N; i++) {
    const a = sec(i / N), b = sec((i + 1) / N), pa = prof(a), pb = prof(b);
    for (const k of ring.slice(0, 5)) {
      const A = T(pa[k][0], pa[k][1], a.z), Bq = T(pa[k + 1][0], pa[k + 1][1], a.z), C = T(pb[k + 1][0], pb[k + 1][1], b.z), Dq = T(pb[k][0], pb[k][1], b.z);
      out.push(...A, ...Bq, ...C, ...A, ...C, ...Dq, ...A, ...C, ...Bq, ...A, ...Dq, ...C);
    }
  }
  bag.add('lacquer_red', fromTriangles(out));
  // the deck, a gunwale rail, the pavilion
  const dk = [];
  for (let i = 0; i < N; i++) { const a = sec(i / N), b = sec((i + 1) / N), A = T(-a.hb * 0.92, a.sheer * 0.4 - 0.12, a.z), Bq = T(a.hb * 0.92, a.sheer * 0.4 - 0.12, a.z), C = T(b.hb * 0.92, b.sheer * 0.4 - 0.12, b.z), Dq = T(-b.hb * 0.92, b.sheer * 0.4 - 0.12, b.z); dk.push(...A, ...Bq, ...C, ...A, ...C, ...Dq, ...A, ...C, ...Bq, ...A, ...Dq, ...C); }
  bag.add('timber', fromTriangles(dk));
  for (const sd of [-1, 1]) for (let i = 1; i < N - 1; i++) { const a = sec(i / N), b = sec((i + 1) / N), A = T(sd * a.hb, a.sheer, a.z), Bq = T(sd * b.hb, b.sheer, b.z); bag.add('gilt_bronze', rod([A[0], A[1] + 0.02, A[2]], [Bq[0], Bq[1] + 0.02, Bq[2]], 0.04, 5)); }
  const base = y - 0.12 + 0.2;
  bag.add('reed_mat', box(...(() => { const p = T(-0.7, 0, -1.6), q = T(0.7, 0, 1.6); return [Math.min(p[0], q[0]), base - 0.0, Math.min(p[2], q[2]), Math.max(p[0], q[0]), base + 0.04, Math.max(p[2], q[2])]; })()));
  for (const [lx, lz] of [[-0.7, -1.6], [0.7, -1.6], [-0.7, 1.6], [0.7, 1.6]]) { const p = T(lx, 0, lz); bag.add('lacquer_red', box(p[0] - 0.05, base, p[2] - 0.05, p[0] + 0.05, base + 2.2, p[2] + 0.05)); }
  { const p = T(0, 0, 0), h = 2.0; bag.add('roof_bark', lathe([[1.9, 0], [1.4, 0.3], [0.1, 0.95], [0.001, 1.0]], 4, null, 0, 0, 0).rotateY(Math.PI / 4).scale(1.0, 1, 1.35).rotateY(rot).translate(p[0], base + 2.2, p[2])); void h; }
  // the prow: a curved post rising to the carved head
  const tail = (pts, rad, m, d) => { const o = []; tube(o, T(0, 0, 0 + 0), [-s, -c], pts, rad, 8); bag.add(m, fromTriangles(o)); void d; };
  void tail;
  const bowZ = -L / 2, o = [];
  const dirw = [Math.sin(rot) * -1, -Math.cos(rot)];                                      // the bow's direction in the world (x, z)
  const bo = T(0, 0, bowZ);
  tube(o, [bo[0], y, bo[2]], dirw, [[0, 0.25], [-0.2, 0.7], [-0.5, 1.15], [-0.85, 1.4], [-1.05, 1.7], [-1.0, 1.95]], [[0.07, 0.07], [0.07, 0.07], [0.07, 0.07], [0.08, 0.08], [0.09, 0.09], [0.1, 0.1]], 6);
  bag.add('lacquer_red', fromTriangles(o));
  const h2 = [], hp = el.head === 'hawk';
  tube(h2, [bo[0], y, bo[2]], dirw, hp ? [[-1.0, 1.95], [-1.05, 2.1], [-1.2, 2.2], [-1.45, 2.15]] : [[-1.0, 1.95], [-1.1, 2.15], [-1.3, 2.25], [-1.55, 2.2], [-1.7, 2.1]], hp ? [[0.12, 0.12], [0.1, 0.1], [0.06, 0.06], [0.01, 0.01]] : [[0.12, 0.12], [0.14, 0.14], [0.14, 0.12], [0.1, 0.07], [0.02, 0.02]], 7);
  bag.add('gilt_bronze', fromTriangles(h2));
  // the stern post with a pennant pole
  const st = T(0, 0, L / 2 - 0.2); bag.add('lacquer_red', rod([st[0], y + 0.2, st[2]], [st[0], y + 2.6, st[2]], 0.04, 6)); const pe = T(0.4, 0, L / 2 - 0.2); bag.add('cloth_red', box(Math.min(st[0], pe[0]), y + 2.0, Math.min(st[2], pe[2]) - 0.01, Math.max(st[0], pe[0]) + 0.02, y + 2.5, Math.max(st[2], pe[2]) + 0.01));
}

export const heianElements = { wattle, heian_house: heianHouse, heian_hall: heianHall, corridor, tsuijibei, yakumon, pier, ryuto_boat: ryuto };
