// The houses of Uji's village, version two (docs/settlements/heian-uji.md §17): the commoner's house with its front
// chosen BY RULE from the street, the trade, the width and the roof — a shop front on the roads (a door between two
// display bays, an apron wall, a counter, the upper shutter hung up under the eave), a continuous lattice front for the
// trades that sell, a porch of two posts under the deep eave, the plain front; doors of boards or of straw mats; for a
// roof whose gable faces the lane, the timber of the gable (a king post, a collar, struts, thick bargeboards); and, in the
// houses that can be entered, a plan mirrored by the seed and a fuller furnishing (the household shrine shelf, the post
// between the earth floor and the raised floor, bedding on the mat, soot over the hearth). Registered here as the
// element `uji_house` of the japanese style: the shared files of the style are not touched.

import '../../styles/japanese/index.js';
import '../../objects/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';
import { dressHouse, furnishTrade } from './dress.js';
import { hearthLight } from './nightlight.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pot = (bag, m, x, y, z, r, h) => bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, x, y, z));
const BAY = 1.5;                                                 // a shop front: the door between two display bays of 1.5 m
const DOOR = 1.6, DOOR_SHUT = 1.1;                               // the door of a house that can be entered is wide enough for the walker (1.6 m), a shut house's is 1.1 m

/** The front, the roof's direction, the plan's mirroring and the door's kind of a lot, decided from its seed, street, trade and width. */
export function traits(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const r = rng((el.seed || 1) * 13 + 7), a = r(), b = r(), c = r(), d = r(), e = r();
  const par = b < 0.55;                                           // the ridge parallel to the front (eaves toward the lane), else the gable faces the lane
  const dwid = el.open ? DOOR : DOOR_SHUT, MI = dwid + 2 * BAY;
  let ft = 'plain';
  if (el.kind === 'road' && L >= 6.6) ft = a < 0.7 ? 'mise' : 'lattice';
  else if (['weaver', 'brewer', 'potter'].includes(el.trade) && L >= 5.4) ft = a < 0.6 ? 'lattice' : (par ? 'porch' : 'plain');
  else if (el.trade === 'fisher' || el.trade === 'porter') ft = a < 0.6 && par ? 'porch' : 'plain';
  else if (a < 0.3 && par) ft = 'porch';
  let door = Math.min(L - dwid / 2 - 0.5, Math.max(dwid / 2 + 0.5, L * (0.35 + c * 0.3)));
  if (ft === 'mise') door = Math.min(L - MI / 2 - 0.45, Math.max(MI / 2 + 0.45, L * (0.3 + c * 0.4)));
  void d;
  // the plan is mirrored so that the stove and the chest stand on the side away from the door (the way in from the door to the hearth stays free)
  return { ft, par, mir: door > L / 2, mat: e < 0.4, door, L, D, dw: dwid, MI };
}

/** A gabled roof of real thickness (as heian_house's), with thick bargeboards and, for a gable that faces the lane, its timber. */
function gabled(bag, R) {
  const { x0, z0, x1, z1, y, rise, o, ov, th, alongX } = R;
  const out = [], tr = [];
  const P = (a, b, yy) => (alongX ? [a, yy, b] : [b, yy, a]);
  const [a0, a1, b0, b1] = alongX ? [x0 - ov, x1 + ov, z0 - o, z1 + o] : [z0 - ov, z1 + ov, x0 - o, x1 + o];
  const bm = (b0 + b1) / 2;
  for (const [bs, be] of [[b0, bm], [b1, bm]]) {
    const top = [P(a0, bs, y), P(a1, bs, y), P(a1, be, y + rise), P(a0, be, y + rise)];
    hexa(out, top.map((p) => [p[0], p[1] - th, p[2]]), top);
  }
  bag.add(R.mat, fromTriangles(out));
  const hh = (w0) => rise * (bm - w0) / (bm - b0) - th - 0.03;
  const [wa0, wa1] = alongX ? [x0, x1] : [z0, z1], [wb0, wb1] = alongX ? [z0, z1] : [x0, x1];
  const wl = (a, w0, w1) => { const h = hh(w0), A = P(a, w0, y), B = P(a, w1, y), C = P(a, bm, y + h); tr.push(...A, ...B, ...C, ...A, ...C, ...B); };
  wl(wa0, wb0, wb1); wl(wa1, wb0, wb1);
  if (tr.length) bag.add(R.gable || 'timber', fromTriangles(tr));
  const rc = alongX ? box(a0 - 0.1, y + rise - th * 0.5, bm - 0.22, a1 + 0.1, y + rise + 0.18, bm + 0.22) : box(bm - 0.22, y + rise - th * 0.5, a0 - 0.1, bm + 0.22, y + rise + 0.18, a1 + 0.1);
  bag.add(R.ridge || 'roof_ridge', rc);
  if (R.chigi) for (const e of [a0, a1]) for (const s of [-1, 1]) { const A = P(e - Math.sign(e - (a0 + a1) / 2) * 0.1, bm - s * 0.4, y + rise + 0.8), B = P(e, bm + s * 0.4, y + rise - 0.05); bag.add('bamboo_culm', rod(A, B, 0.035, 5)); }
  if (R.truss) {
    const h = hh(wb0), half = (wb1 - wb0) / 2, mid = (wb0 + wb1) / 2;
    for (const [a, sg] of [[wa0, -1], [wa1, 1]]) {
      const ax = a + sg * 0.03;                                    // the gable wall's outer face
      const at = (b, yy) => P(ax, b, yy);
      const t = 0.45;                                              // the collar at 45 % of the gable's height, its ends where the slopes are
      const yc = y + h * t, wc = half * (1 - t) - 0.06;
      bag.add('wood_dark', rod(at(mid - wc, yc), at(mid + wc, yc), 0.035, 5));
      bag.add('wood_dark', rod(at(mid, y + 0.02), at(mid, y + h - 0.08), 0.045, 6));
      for (const s of [-1, 1]) bag.add('wood_dark', rod(at(mid + s * half * 0.62, y + 0.02), at(mid + s * 0.04, y + h * 0.62), 0.03, 5));
      bag.add('wood_dark', rod(at(wb0 + 0.04, y + 0.03), at(wb1 - 0.04, y + 0.03), 0.045, 6));   // the tie beam at the foot
    }
    // the bargeboards: a thick board along each verge, a little proud of the roof
    for (const a of [a0 + 0.05, a1 - 0.05]) for (const [bs, hgt] of [[b0, 0], [b1, 0]]) bag.add('wood_dark', rod(P(a, bs + Math.sign(bm - bs) * 0.03, y - th * 0.4 + hgt), P(a, bm, y + rise - th * 0.3), 0.06, 5));
  }
}

/** A sloping slab (a board between two lines): from (u0..u1, v0, y0) to (u0..u1, v1, y1), thickness th, in the front's frame. */
function slab(bag, P, mat, u0, u1, v0, y0, v1, y1, th) {
  const p = (u, v, yy) => { const q = P(u, v); return [q[0], yy, q[1]]; };
  const out = [];
  hexa(out, [p(u0, v0, y0), p(u1, v0, y0), p(u1, v1, y1), p(u0, v1, y1)], [p(u0, v0, y0 + th), p(u1, v0, y0 + th), p(u1, v1, y1 + th), p(u0, v1, y1 + th)]);
  bag.add(mat, fromTriangles(out));
}

/** The goods set out on a shop's counter, by the trade. */
function counterGoods(bag, P, trade, u0, u1, yc) {
  const n = Math.max(2, Math.floor((u1 - u0) / 0.3));
  for (let k = 0; k < n; k++) {
    const u = u0 + 0.15 + k * (u1 - u0 - 0.3) / Math.max(1, n - 1), p = P(u, -0.25 - (k % 2) * 0.12);
    if (trade === 'potter' || trade === 'brewer') pot(bag, k % 3 ? 'pottery_dark' : 'terracotta', p[0], yc, p[1], 0.1 + (k % 2) * 0.03, 0.22 + (k % 3) * 0.06);
    else if (trade === 'weaver') bag.add(['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_red'][k % 4], box(p[0] - 0.12, yc, p[1] - 0.12, p[0] + 0.12, yc + 0.14 + (k % 2) * 0.05, p[1] + 0.12));
    else if (trade === 'woodman' || trade === 'carpenter') bag.add('timber', box(p[0] - 0.14, yc, p[1] - 0.09, p[0] + 0.14, yc + 0.1 + (k % 3) * 0.05, p[1] + 0.09));
    else bag.add(k % 2 ? 'wicker' : 'thatch', lathe([[0.14, 0], [0.17, 0.06], [0.12, 0.13], [0.001, 0.15]], 8, null, p[0], yc, p[1]));
  }
}

function ujiHouse(el, { bag, col }) {
  const rand = rng((el.seed || 1) + 17);
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's', along = f === 's' || f === 'n';
  const tr = traits(el), L = tr.L, D = tr.D, simple = !!el.simple;
  const kind = rand() < 0.4 ? 'board' : rand() < 0.55 ? 'thatch' : 'bark';
  const H = 2.5 + [0, 0.3, 0.6, 0.3][Math.floor(rng((el.seed || 1) * 3 + 101)() * 4)], sill = 0.45, fy = y + sill;
  const P = (u, v) => (f === 's' ? [x0 + u, z1 - v] : f === 'n' ? [x1 - u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rc = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = rc(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.3, yb); };
  const wallMat = rand() < 0.5 ? 'timber' : 'plaster_white';
  const T = 0.2, dw = tr.dw, MISE = tr.MI, door = tr.door, mise = tr.ft === 'mise' && !simple;
  const open = el.open && !simple;
  B('limestone', -0.08, -0.08, L + 0.08, D + 0.08, el.foot !== undefined ? y + el.foot : y - 0.2, fy);
  const bays = mise ? [[door - MISE / 2, door - dw / 2], [door + dw / 2, door + MISE / 2]] : [];
  if (open) {
    B(wallMat, 0, D - T, L, D, fy, y + H, true); B(wallMat, 0, T, T, D - T, fy, y + H, true); B(wallMat, L - T, T, L, D - T, fy, y + H, true);
    if (mise) {
      // the front in pieces: the plain walls at the ends, the two bays (an apron wall, a true opening above it, the lintel), the door's way
      B(wallMat, 0, 0, bays[0][0], T, fy, y + H, true); B(wallMat, bays[1][1], 0, L, T, fy, y + H, true);
      for (const [a, b] of bays) { B(wallMat, a, 0, b, T, fy, fy + 0.8); B(wallMat, a, 0, b, T, y + H - 0.25, y + H); col.rect(rc(a, 0, b, T), fy - 0.3, y + H); }
    } else {
      B(wallMat, 0, 0, door - dw / 2, T, fy, y + H, true); B(wallMat, door + dw / 2, 0, L, T, fy, y + H, true);
    }
    B(wallMat, door - dw / 2, 0, door + dw / 2, T, fy + 1.95, y + H);
    B('timber', door - dw / 2 - 0.02, T, door - dw / 2 + 0.05, T + dw, fy, fy + 1.9);                 // the leaf swung open inside
    const earth = Math.min(D - 2.4, 2.6), g0 = T + earth, ry = fy + 0.4, hu = L * 0.5, hv = g0 + (D - T - g0) * 0.45;
    col.floor(rc(T, T, L - T, D - T), fy - 0.02);
    B('earth_wall', T, T, L - T, T + earth, fy - 0.12, fy + 0.015);
    B('timber', T, g0 - 0.35, L - T, g0, fy - 0.12, fy + 0.2); col.floor(rc(T, g0 - 0.35, L - T, g0), fy + 0.2);
    B('timber', T, g0, L - T, D - T, fy - 0.12, ry); col.floor(rc(T, g0, L - T, D - T), ry);
    // from here on the plan may be mirrored along the front (u → L − u), by the seed
    const M = (u) => (tr.mir ? L - u : u), P2 = (u, v) => P(M(u), v), B2 = (m, u0, v0, u1, v1, ya, yb, c = false) => B(m, M(u0), v0, M(u1), v1, ya, yb, c);
    B('wood_dark', hu - 0.6, hv - 0.6, hu + 0.6, hv + 0.6, ry, ry + 0.05); B('pottery_dark', hu - 0.46, hv - 0.46, hu + 0.46, hv + 0.46, ry + 0.05, ry + 0.07);
    { const p = P(hu, hv); pot(bag, 'iron', p[0], ry + 0.55, p[1], 0.2, 0.22); bag.add('bamboo_culm', rod([p[0], ry + 0.9, p[1]], [p[0], y + H - 0.1, p[1]], 0.02, 5)); }
    B('bark_dark', hu - 0.95, hv - 0.95, hu + 0.95, hv + 0.95, y + H - 0.068, y + H - 0.06);              // the soot over the hearth, on the ceiling boards
    for (const [a, b] of [[T + 0.2, D - T - 1.15], [L - T - 2.0, D - T - 1.15]]) if (b > g0 + 0.2 && L > 5) B2('reed_mat', a, b, a + 1.8, b + 0.95, ry, ry + 0.04);
    if (L > 5 && D - T - 1.15 > g0 + 0.2) {                                                                  // bedding laid on the second mat, a wooden pillow
      const a = L - T - 2.0, b = D - T - 1.15;
      B2('cloth_ochre', a + 0.1, b + 0.1, a + 1.45, b + 0.85, ry + 0.04, ry + 0.11); B2('wood_dark', a + 1.5, b + 0.3, a + 1.7, b + 0.65, ry + 0.04, ry + 0.12);
    }
    B2('lacquer_chestnut', L - T - 0.8, g0 + 0.15, L - T - 0.1, g0 + 0.85, ry, ry + 0.65, true);
    B2('wood_dark', T + 0.1, D - T - 0.5, T + 1.0, D - T - 0.1, ry, ry + 0.45, true);
    B('wood_dark', T + 0.05, D - T - 0.3, L - T - 0.05, D - T - 0.05, y + 1.85, y + 1.9);
    for (let u = T + 0.5; u < L - T - 0.4; u += 0.7) { const p = P(u, D - T - 0.2); pot(bag, 'pottery_dark', p[0], y + 1.9, p[1], 0.08, 0.16); }
    B2('earth_wall', L - T - 1.1, T + 0.1, L - T, T + 0.95, fy, fy + 0.8, true);
    { const p = P2(L - T - 0.55, T + 0.52); pot(bag, 'iron', p[0], fy + 0.8, p[1], 0.3, 0.24); }
    { const p = P2(T + 0.5, T + 0.6); pot(bag, 'pottery_dark', p[0], fy, p[1], 0.32, 0.8); }
    B('timber', T, T, L - T, D - T, y + H - 0.06, y + H - 0.02);
    // the post between the earth floor and the raised floor (daikoku-bashira), the household shrine on its shelf on the side wall
    B2('wood_dark', 0.9, g0 - 0.5, 1.08, g0 - 0.32, fy, y + H - 0.06, true);
    if (D - T - g0 > 2.4) {
      const v0 = g0 + 0.9, sh = (u0, v, ya, yb, m) => B2(m, T, v, T + 0.3, v + 0.5, ya, yb);
      sh(0, v0, y + 1.62, y + 1.66, 'wood_dark');
      B2('timber', T + 0.03, v0 + 0.08, T + 0.26, v0 + 0.42, y + 1.66, y + 1.86);                              // the miniature shrine: a box with its door, a roof of bark
      B2('wood_dark', T + 0.1, v0 + 0.2, T + 0.16, v0 + 0.3, y + 1.7, y + 1.8);
      { const p = P2(T + 0.145, v0 + 0.25); bag.add('roof_bark', lathe([[0.2, 0], [0.12, 0.05], [0.001, 0.13]], 4, null, p[0], y + 1.86, p[1])); }
      B2('cloth_white', T + 0.28, v0 + 0.15, T + 0.31, v0 + 0.35, y + 1.45, y + 1.62);                          // a hanging strip of paper at its edge
    }
    { const lp = P(hu + 0.95, hv + 0.35); B('wood_dark', hu + 0.9, hv + 0.3, hu + 1.0, hv + 0.4, ry, ry + 0.32); bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.01], [0.12, 0.045], [0.1, 0.05], [0.001, 0.03]], 9, null, lp[0], ry + 0.32, lp[1])); }   // an oil saucer on its stand (an andon with a paper shade is later)
    furnishTrade(el, { bag, col }, { P: P2, B: B2, ry, T, L, D, g0 });
    // the keeper, built into the near form (a life figure reaches 170 m; this one only where the house is near): behind the counter of a shop front, else at the hearth
    if (el.keeper && STYLES.life?.elements.figure) {
      const kr = rng((el.seed || 1) * 31 + 5), woman = kr() < 0.4, face = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
      const side = kr() < 0.5 ? -1 : 1, at = mise ? P(door + side * (dw / 2 + BAY / 2 + 0.05), 0.95) : P2(hu + (tr.mir ? -1.35 : 1.35), hv), to = mise ? P(door + side * (dw / 2 + BAY / 2 + 0.05), -2.5) : P2(hu, hv);
      STYLES.life.elements.figure({ at, y: mise ? fy + 0.015 : ry, rot: face(at, to), seed: 7700 + (el.seed % 9973) * 53, dress: woman ? 'robe' : 'trousers', hair: woman ? 'long' : 'topknot', hat: woman || mise ? 'none' : 'cap', hatMat: 'cloth_black', cloth: ['cloth_indigo', 'cloth_brown', 'cloth_black', 'cloth_ochre'][Math.floor(kr() * 4)], cloth2: 'cloth_white', skin: 'skin_medium', carry: 'none', pose: mise ? 'stand' : 'cross' }, { bag, col });
    }
    if (el.night) hearthLight(bag, P(hu, hv), ry, P(door, -1.7), fy);
  } else {
    B(wallMat, 0, 0, L, D, fy, y + H, true);
  }
  // posts, sill and head beams on the front
  const posts = [];
  for (let u = 0; u <= L + 0.01; u += L / Math.max(2, Math.round(L / 2.4))) posts.push(u);
  if (mise) for (const u of [door - MISE / 2, door - dw / 2, door + dw / 2, door + MISE / 2]) posts.push(u);
  for (const u of posts) B('wood_dark', u - 0.07, -0.05, u + 0.07, 0.02, fy, y + H);
  B('wood_dark', 0, -0.05, L, 0.02, y + H - 0.16, y + H); B('wood_dark', 0, -0.04, L, 0.02, fy, fy + 0.1);
  if (!simple) {
    // the door: boards, or a hanging mat of straw (mushiro); a lintel
    if (!tr.mat) { if (!open) { B('timber', door - dw / 2, -0.05, door + dw / 2, 0.0, fy, fy + 1.9); for (let k = 1; k < 5; k++) B('wood_dark', door - dw / 2 + k * dw / 5 - 0.01, -0.07, door - dw / 2 + k * dw / 5 + 0.01, -0.05, fy + 0.03, fy + 1.87); } }
    else {
      B('reed_mat', door - dw / 2 + 0.03, -0.075, door + dw / 2 - 0.03, -0.05, open ? fy + 1.78 : fy, fy + 1.88);           // (an opened house's mat is rolled up under the lintel, clear of the walker's head)
      B('wood_dark', door - dw / 2 - 0.02, -0.09, door + dw / 2 + 0.02, -0.065, fy + 1.86, fy + 1.93);
      for (const k of [0.25, 0.75]) B('wood_dark', door - dw / 2 + dw * k - 0.01, -0.08, door - dw / 2 + dw * k + 0.01, -0.07, open ? fy + 1.78 : fy + 0.1, fy + 1.86);
    }
    B('wood_dark', door - dw / 2 - 0.1, -0.08, door + dw / 2 + 0.1, 0.02, fy + 1.9, fy + 2.05);
    const win = (a, b) => { B('opening', a, -0.012, b, 0.0, fy + 0.85, y + H - 0.4); B('koshi', a, -0.05, b, -0.012, fy + 0.85, y + H - 0.4); B('wood_dark', a - 0.06, -0.07, b + 0.06, -0.02, y + H - 0.4, y + H - 0.32); B('wood_dark', a - 0.06, -0.07, b + 0.06, -0.02, fy + 0.78, fy + 0.85); };
    if (tr.ft === 'plain' || tr.ft === 'porch') {
      const wx = door > L / 2 ? 0.5 + (door - 1.6 - 0.5) * 0.3 : door + 1.3 + (L - door - 1.3 - 1.4) * 0.3;
      if (wx > 0.3 && wx + 1.1 < L - 0.3) {
        B('opening', wx, -0.012, wx + 1.1, 0.0, fy + 0.9, fy + 1.75); B('koshi', wx, -0.05, wx + 1.1, -0.012, fy + 0.9, fy + 1.75);
        B('wood_dark', wx - 0.08, -0.07, wx + 1.18, -0.02, fy + 1.75, fy + 1.83);
        if (rand() < 0.6) B('reed_mat', wx - 0.05, -0.1, wx + 1.15, -0.07, fy + 1.15, fy + 1.78);
      }
    } else if (tr.ft === 'lattice') {
      // the whole front a lattice, both sides of the door, the lower wall of planks under it
      if (door - dw / 2 - 0.5 > 0.9) win(0.4, door - dw / 2 - 0.2);
      if (L - 0.4 - (door + dw / 2 + 0.2) > 0.9) win(door + dw / 2 + 0.2, L - 0.4);
    } else if (mise) {
      for (const [a, b] of bays) {
        // the opening (dark in the shut house, real in the open one), the counter on its brackets, the upper shutter hung up under the eave on two poles
        if (!open) B('opening', a + 0.05, -0.012, b - 0.05, 0.0, fy + 0.84, y + H - 0.3);
        B('wood_dark', a + 0.02, -0.07, b - 0.02, 0.0, fy + 0.77, fy + 0.8);
        B('timber', a + 0.03, -0.58, b - 0.03, -0.02, fy + 0.8, fy + 0.86);
        for (const s of [a + 0.15, b - 0.15]) { const p = P(s, -0.02), q = P(s, -0.52); bag.add('wood_dark', rod([p[0], fy + 0.2, p[1]], [q[0], fy + 0.8, q[1]], 0.025, 4)); }
        counterGoods(bag, P, el.trade || 'farmer', a + 0.05, b - 0.05, fy + 0.86);
        slab(bag, P, 'timber', a + 0.05, b - 0.05, -0.03, y + H - 0.42, -0.78, y + H - 0.3, 0.04);
        for (const s of [a + 0.12, b - 0.12]) { const q = P(s, -0.74); bag.add('bamboo_culm', rod([q[0], fy + 0.86, q[1]], [q[0], y + H - 0.3, q[1]], 0.02, 4)); }
      }
    }
    if (tr.ft === 'porch') {
      // two posts under the deep eave with a beam between them, a plank bench against the wall
      const th = kind === 'thatch' ? 0.38 : 0.12, top = y + H - th - 0.04, pu = [door - 1.5, door + 1.5];
      if (pu[0] > 0.2 && pu[1] < L - 0.2) {
        for (const u of pu) { const p = P(u, -0.72); bag.add('wood_dark', box(p[0] - 0.07, y, p[1] - 0.07, p[0] + 0.07, top, p[1] + 0.07)); bag.add('limestone', box(p[0] - 0.14, y - 0.1, p[1] - 0.14, p[0] + 0.14, y + 0.1, p[1] + 0.14)); col.circle(p[0], p[1], 0.14, y, top); }
        B('wood_dark', pu[0] - 0.1, -0.8, pu[1] + 0.1, -0.64, top - 0.16, top);
        B('timber', pu[0] + 0.1, -0.66, door - dw / 2 - 0.2, -0.28, y + 0.38, y + 0.44);
        for (const u of [pu[0] + 0.2, door - dw / 2 - 0.3]) B('wood_dark', u - 0.03, -0.62, u + 0.03, -0.32, y, y + 0.38);
      }
    }
    if (kind !== 'thatch' && tr.ft === 'plain') for (let u = 0.35; u < L - 0.2; u += 0.45) if (Math.abs(u - door) > 0.8 && wallMat === 'timber') B('wood_dark', u, -0.025, u + 0.045, 0.0, fy + 0.1, y + H - 0.16);
  }
  // the roof
  const pitch = kind === 'board' ? 0.34 : kind === 'bark' ? 0.55 : 0.95;
  const alongX = along ? tr.par : !tr.par, span = alongX ? D : L;
  const rise = Math.max(0.7, pitch * span / 2), roof = kind === 'thatch' ? 'thatch' : 'roof_bark', o = kind === 'thatch' ? 0.9 : 0.8;
  gabled(bag, { x0, z0, x1, z1, y: y + H, rise, o, ov: kind === 'thatch' ? 0.55 : 0.4, th: kind === 'thatch' ? 0.38 : 0.12, alongX, mat: roof, gable: wallMat === 'timber' ? 'timber' : 'plaster_white', chigi: kind === 'thatch', ridge: kind === 'thatch' ? 'thatch' : 'roof_ridge', truss: !simple && !tr.par });
  if (kind === 'board' && !simple) {
    const sx = alongX ? x1 - x0 : z1 - z0, step = 0.5;
    for (const s of [-1, 1]) for (let r = 0; r < 4; r++) {
      const fr = (r + 0.7) / 5, b = (alongX ? (z0 + z1) / 2 + s * (D / 2 + o) * (1 - fr) : (x0 + x1) / 2 + s * (L / 2 + o) * (1 - fr));
      const yy = y + H + rise * fr + 0.04;
      for (let a = (alongX ? x0 : z0) - 0.1; a < (alongX ? x0 : z0) + sx + 0.1; a += step) {
        const jx = (a * 13.7 + r * 7.1) % 0.12, cx = alongX ? a + jx : b, cz = alongX ? b : a + jx;
        bag.add('limestone', box(cx - 0.12, yy, cz - 0.1, cx + 0.12, yy + 0.17, cz + 0.1));
      }
    }
  }
  if (!open) col.rect([x0, z0, x1, z1], y - 0.3, y + H);       // (an opened house's walls, posts and furniture carry their own colliders: the room is walked)
  if (simple) return;
  // the yard behind and beside: as the shared houses (a wattle fence, a woodpile, jars, a drying rack, a granary)
  const yp = (u, v) => P(u, v);
  const fence = (u0, v0, u1, v1) => {
    const a = P(u0, v0), b = P(u1, v1), n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2.2));
    bag.add('wicker', box(Math.min(a[0], b[0]) - 0.03, y, Math.min(a[1], b[1]) - 0.03, Math.max(a[0], b[0]) + 0.03, y + 1.15, Math.max(a[1], b[1]) + 0.03));
    for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; bag.add('bark_dark', box(x - 0.05, y, z - 0.05, x + 0.05, y + 1.3, z + 0.05)); }
    col.segment(a, b, 0.14, y, y + 1.2);
  };
  if (rand() < 0.7) fence(-0.9, D + 0.9, L + 0.9, D + 0.9);
  if (rand() < 0.5) fence(L + 0.9, 1.5, L + 0.9, D + 0.9);
  if (rand() < 0.5) {
    const u = 0.6 + rand() * Math.max(0.1, L - 3), p = P(u, D + 0.4), q = P(u + 1.3, D + 0.9);
    bag.add('wood_dark', box(Math.min(p[0], q[0]), y, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + 0.7, Math.max(p[1], q[1])));
  }
  // (a thing of the yard in front of the door stands beside the door's lane: the door and 0.4 m each side)
  const lane = (u, w) => { const a = door - dw / 2 - 0.4, b = door + dw / 2 + 0.4; if (u + w <= a || u >= b) return u; const lo = a - w, hi = b; return lo >= 0.15 ? lo : Math.min(hi, Math.max(0.15, L - w - 0.15)); };
  for (let i = 0; i < 2; i++) if (!mise && rand() < 0.6) { const p = yp(lane(1 + rand() * (L - 2) - 0.3, 0.6) + 0.3, -0.9 - rand() * 0.5); pot(bag, 'pottery_dark', p[0], y, p[1], 0.3, 0.8); }
  if (rand() < 0.45) {
    const u0 = rand() * Math.max(0.1, L - 3.2), v = -1.8, a = P(u0, v), b = P(u0 + 3.0, v);
    for (const p of [a, b]) bag.add('bamboo_culm', rod([p[0], y, p[1]], [p[0], y + 2.3, p[1]], 0.045, 5));
    for (const h of [1.2, 1.7, 2.2]) bag.add('bamboo_culm', rod([a[0], y + h, a[1]], [b[0], y + h, b[1]], 0.03, 5));
    for (const h of [1.7, 2.2]) for (let k = 0; k < 6; k++) { const t = (k + 0.5) / 6, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; bag.add('thatch', lathe([[0.12, 0], [0.09, 0.2], [0.05, 0.42], [0.001, 0.5]], 6, null, x, y + h - 0.5, z)); }
  }
  if (L > 8 && rand() < 0.3) {
    const u = L - 2.4, v = D + 1.6, g = rc(u - 1.0, v - 1.0, u + 1.0, v + 1.0);
    for (const [px, pz] of [[g[0] + 0.1, g[1] + 0.1], [g[2] - 0.1, g[1] + 0.1], [g[0] + 0.1, g[3] - 0.1], [g[2] - 0.1, g[3] - 0.1]]) { bag.add('wood_dark', box(px - 0.07, y, pz - 0.07, px + 0.07, y + 0.9, pz + 0.07)); col.circle(px, pz, 0.14, y, y + 0.9); }
    bag.add('timber', box(g[0], y + 0.9, g[1], g[2], y + 2.0, g[3]));
    gabled(bag, { x0: g[0], z0: g[1], x1: g[2], z1: g[3], y: y + 2.0, rise: 0.9, o: 0.4, ov: 0.3, th: 0.25, alongX: along, mat: 'thatch', gable: 'timber', chigi: true, ridge: 'thatch' });
  }
  // the dressing of the front by the trade: not on a shop front, whose bays carry the goods, but its eave, weathering and sign still do
  dressHouse(el, { bag, col }, { P, B, rc, L, D, y, fy, H, door, dw: mise ? MISE : dw, wallMat, kind, gabled });
}

STYLES.japanese.elements.uji_house = ujiHouse;
STYLES.japanese.elements.uji_door_clear = () => {};              // (a door's lane: a footprint for the street life, nothing built; openwalk.js)
export { ujiHouse };
