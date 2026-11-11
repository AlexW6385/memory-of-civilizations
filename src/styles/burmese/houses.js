// The houses and halls of Pagan (docs/settlements/bagan.md §5–§6): the stilt house of bamboo and thatch (some furnished and open), the granary, the roadside stall,
// the open rest house (zayat), the teak hall under tiered roofs (pyatthat) for the palace and the monasteries, the brick monastery (okkyaung).
import { box, lathe, fromTriangles, orientOutward, frustum } from '../../core/geom.js';
import { rng, Fr, archWall, vault, miniStupa } from './kit.js';

/** A frame on a lot: u along the street from a corner, v from the street into the lot. */
export function lotFrame(ctx, rect, front) {
  const [x0, z0, x1, z1] = rect;
  let F, W, D;
  if (front === 's') { F = new Fr(ctx, [x0, z1], [1, 0], [0, -1]); W = x1 - x0; D = z1 - z0; }
  else if (front === 'n') { F = new Fr(ctx, [x0, z0], [1, 0], [0, 1]); W = x1 - x0; D = z1 - z0; }
  else if (front === 'e') { F = new Fr(ctx, [x1, z0], [0, 1], [-1, 0]); W = z1 - z0; D = x1 - x0; }
  else { F = new Fr(ctx, [x0, z0], [0, 1], [1, 0]); W = z1 - z0; D = x1 - x0; }
  F.W = W; F.D = D;
  return F;
}

/** A gabled prism roof (a thatch roof): eave rectangle u0..u1 × v0..v1 at yE, the ridge along u (alongU) or v at yE + rise. */
export function gable(F, mat, u0, u1, v0, v1, yE, rise, alongU = true) {
  const P = (u, v, y) => { const p = F.pt(u, v); return [p[0], y, p[1]]; };
  const um = (u0 + u1) / 2, vm = (v0 + v1) / 2, yR = yE + rise, yB = yE - 0.2;
  let t;
  if (alongU) {
    const a = P(u0, v0, yE), b = P(u1, v0, yE), c = P(u1, v1, yE), d = P(u0, v1, yE), r0 = P(u0, vm, yR), r1 = P(u1, vm, yR);
    const a2 = P(u0, v0, yB), b2 = P(u1, v0, yB), c2 = P(u1, v1, yB), d2 = P(u0, v1, yB);
    t = [...a, ...b, ...r1, ...a, ...r1, ...r0, ...d, ...c, ...r1, ...d, ...r1, ...r0, ...a, ...d, ...r0, ...b, ...c, ...r1, ...a2, ...b2, ...c2, ...a2, ...c2, ...d2,
      ...a2, ...a, ...b, ...a2, ...b, ...b2, ...d2, ...d, ...c, ...d2, ...c, ...c2, ...a2, ...a, ...d, ...a2, ...d, ...d2, ...b2, ...b, ...c, ...b2, ...c, ...c2];
  } else {
    const a = P(u0, v0, yE), b = P(u1, v0, yE), c = P(u1, v1, yE), d = P(u0, v1, yE), r0 = P(um, v0, yR), r1 = P(um, v1, yR);
    const a2 = P(u0, v0, yB), b2 = P(u1, v0, yB), c2 = P(u1, v1, yB), d2 = P(u0, v1, yB);
    t = [...a, ...b, ...r0, ...b, ...c, ...r1, ...b, ...r1, ...r0, ...c, ...d, ...r1, ...d, ...a, ...r0, ...d, ...r0, ...r1, ...a2, ...b2, ...c2, ...a2, ...c2, ...d2,
      ...a2, ...a, ...b, ...a2, ...b, ...b2, ...d2, ...d, ...c, ...d2, ...c, ...c2, ...a2, ...a, ...d, ...a2, ...d, ...d2, ...b2, ...b, ...c, ...b2, ...c, ...c2];
  }
  F.bag.add(mat, fromTriangles(orientOutward(t)));
}

/**
 * bgn_house: { rect, front, seed, open } — a stilt house of bamboo and thatch in a fenced yard: posts, a raised plank floor, woven-bamboo walls, a steep thatch roof
 * with crossed bamboo finials, a stair; with `open`, a doorway, a furnished room (mat, hearth, pots, rack) one can walk into.
 */
export function house(el, ctx) {
  const { bag, col } = ctx, F = lotFrame(ctx, el.rect, el.front), r = rng(el.seed ?? 5), W = F.W, D = F.D;
  const big = el.kind === 'large' || (el.kind !== 'small' && r() < 0.4);
  const hw = Math.min(W - 2.2, big ? 7 + r() * 1.5 : 5 + r() * 1.2), hd = Math.min(D - 5.5, big ? 8.5 + r() * 1.5 : 6.2 + r());
  if (hw < 3.5 || hd < 4) return granary(el, ctx, F);
  const u0 = (W - hw) / 2 + (r() - 0.5) * 0.8, u1 = u0 + hw, v0 = 3.2, v1 = v0 + hd, fl = 1.35, wh = 1.95;
  // the posts on a grid, the floor's beams and boards
  const nu = Math.max(2, Math.round(hw / 2.3)), nv = Math.max(2, Math.round(hd / 2.5));
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) F.b('timber', u0 + (hw * i) / nu - 0.09 + (i === nu ? -0.09 : 0), 0, v0 + (hd * j) / nv - 0.09 + (j === nv ? -0.09 : 0), u0 + (hw * i) / nu + 0.09 + (i === 0 ? 0.09 : 0), fl, v0 + (hd * j) / nv + 0.09 + (j === 0 ? 0.09 : 0), false);
  F.b('wood_ochre', u0 - 0.35, fl - 0.12, v0 - 0.35, u1 + 0.35, fl, v1 + 0.35, false);
  // the walls: woven bamboo; the front with the doorway when open
  const t = 0.1, du = u0 + hw * (0.3 + r() * 0.4), dw = 0.95;
  const wall = (a0, a1, b0, b1) => F.b('wicker', a0, fl, b0, a1, fl + wh, b1, true);
  wall(u0, u1, v1 - t, v1); wall(u0, u0 + t, v0, v1); wall(u1 - t, u1, v0, v1);
  if (el.open) { wall(u0, du - dw / 2, v0, v0 + t); wall(du + dw / 2, u1, v0, v0 + t); F.b('wicker', du - dw / 2, fl + 1.75, v0, du + dw / 2, fl + wh, v0 + t, false); }
  else wall(u0, u1, v0, v0 + t);
  F.b('timber', u0 - 0.04, fl + wh - 0.1, v0 - 0.04, u1 + 0.04, fl + wh + 0.06, v1 + 0.04, false);
  // the roof: thatch, the ridge along the depth for the narrower house, along the width for the long one
  const alongU = hw > hd * 0.95, rise = 2.1 + 0.25 * r() + (big ? 0.5 : 0), ov = 0.65;
  gable(F, 'thatch_palm', u0 - ov, u1 + ov, v0 - ov, v1 + ov, fl + wh + 0.05, rise, alongU);
  // crossed bamboo finials at the gable ends
  const rm = alongU ? [[u0 - ov - 0.1, (v0 + v1) / 2], [u1 + ov + 0.1, (v0 + v1) / 2]] : [[(u0 + u1) / 2, v0 - ov - 0.1], [(u0 + u1) / 2, v1 + ov + 0.1]];
  for (const [u, v] of rm) { F.b('bamboo_culm', u - 0.5, fl + wh + rise - 0.1, v - 0.05, u + 0.5, fl + wh + rise + 0.05, v + 0.05, false); F.b('bamboo_culm', u - 0.05, fl + wh + rise - 0.1, v - 0.5, u + 0.05, fl + wh + rise + 0.05, v + 0.5, false); }
  // a front veranda for the large house: a platform and a lean-to
  if (big) {
    F.b('wood_ochre', u0 - 0.2, fl - 0.12, v0 - 1.9, u1 * 0.5 + u0 * 0.5 + 1.2, fl, v0 - 0.35, false);
    F.floor(u0 - 0.2, v0 - 1.9, (u0 + u1) / 2 + 1.2, v0 - 0.35, fl);
    for (const u of [u0, (u0 + u1) / 2 + 1.0]) F.b('timber', u - 0.07, 0, v0 - 1.8, u + 0.07, fl + 2.2, v0 - 1.66, false);
    F.b('thatch_palm', u0 - 0.3, fl + 2.2, v0 - 2.1, (u0 + u1) / 2 + 1.4, fl + 2.45, v0 - 0.1, false);
  }
  // the stair: a ramp of bamboo treads up to the door
  const su = du - 0.55, sv0 = v0 - (big ? 3.6 : 2.9);
  if (!big) { for (let i = 0; i < 6; i++) F.b('bamboo_culm', su, 0, sv0 + i * 0.45, su + 1.1, fl * (i + 1) / 6, v0 - 0.05, false); F.ramp(su, sv0, su + 1.1, v0 - 0.05, 0, fl, 1); }
  else { for (let i = 0; i < 6; i++) F.b('bamboo_culm', (u0 + u1) / 2 + 1.4, 0, v0 - 1.9 - 2.6 + i * 0.43, (u0 + u1) / 2 + 2.5, fl * (i + 1) / 6, v0 - 1.9, false); F.ramp((u0 + u1) / 2 + 1.4, v0 - 4.5, (u0 + u1) / 2 + 2.5, v0 - 1.9, 0, fl, 1); }
  // a water pot at the foot, a basket
  F.lathe('terracotta', [[0.12, 0], [0.26, 0.12], [0.3, 0.3], [0.2, 0.5], [0.12, 0.56], [0.001, 0.56]], u1 + 0.2, 0, v0 + 0.5, 8);
  // the fence of split bamboo along the sides and the back
  const fence = (a0, b0, a1, b1) => F.b('bamboo_culm', Math.min(a0, a1) - 0.04, 0, Math.min(b0, b1) - 0.04, Math.max(a0, a1) + 0.04, 1.15, Math.max(b0, b1) + 0.04, true);
  fence(0.1, 0.5, 0.1, D - 0.1); fence(W - 0.1, 0.5, W - 0.1, D - 0.1); fence(0.1, D - 0.1, W - 0.1, D - 0.1);
  fence(0.1, 0.1, du - 2.6 < 1 ? 1 : (u0 - 0.8 > 1.5 ? u0 - 0.8 : 1), 0.1); fence(Math.min(W - 1, u1 + 1.6), 0.1, W - 0.1, 0.1);
  // inside, when open: the floor to walk on, the mat, the hearth, pots, a rack, a lamp
  if (el.open) {
    F.floor(u0 + t, v0 + t, u1 - t, v1 - t, fl);
    F.b('reed_mat', u0 + 0.8, fl, v0 + 1.0, u0 + 2.6, fl + 0.03, v0 + 2.6, false);
    F.b('brick', u1 - 1.6, fl, v1 - 1.5, u1 - 0.5, fl + 0.22, v1 - 0.4, true);
    F.lathe('pottery_dark', [[0.14, 0], [0.3, 0.12], [0.34, 0.3], [0.24, 0.45], [0.001, 0.45]], u1 - 1.05, fl + 0.22, v1 - 0.95, 8);
    F.b('bamboo_culm', u0 + 0.2, fl + 0.9, v1 - 0.5, u0 + 2.4, fl + 1.0, v1 - 0.3, false);
    for (let k = 0; k < 3; k++) F.lathe('terracotta', [[0.08, 0], [0.2, 0.1], [0.22, 0.25], [0.12, 0.38], [0.001, 0.4]], u0 + 0.5 + k * 0.5, fl, v1 - 0.9, 8);
    F.b('cloth_ochre', u0 + 0.2, fl, v0 + 3.3, u0 + 0.9, fl + 0.12, v0 + 3.9, false);
    F.light((u0 + u1) / 2, fl + 1.6, (v0 + v1) / 2, '#ffb865', 3, 8);
  }
  void bag; void col;
}

/** A granary on posts: a small raised store with a thatch roof and a ladder (for lots too small for a house). */
function granary(el, ctx, F) {
  const u0 = F.W / 2 - 1.6, v0 = F.D / 2 - 1.6, fl = 1.0;
  for (const [a, b] of [[0, 0], [3.2, 0], [0, 3.2], [3.2, 3.2]]) F.b('timber', u0 + a - 0.08, 0, v0 + b - 0.08, u0 + a + 0.08, fl, v0 + b + 0.08, false);
  F.b('wicker', u0, fl, v0, u0 + 3.2, fl + 1.6, v0 + 3.2, true);
  gable(F, 'thatch_palm', u0 - 0.5, u0 + 3.7, v0 - 0.5, v0 + 3.7, fl + 1.6, 1.5, true);
}

/** bgn_stall: { c, y, rot (0: the front toward +z), seed, goods } — a roadside stall: four posts, a cloth awning, a counter with goods (flowers, candles, pots, fruit, gold leaf). */
export function stall(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, r = rng(el.seed ?? 1), y = el.y ?? 0, rot = el.rot ?? 0;
  const F = new Fr(ctx, [x, z], [Math.cos(rot), Math.sin(rot) * -1], [Math.sin(rot), Math.cos(rot)]);
  const w = 1.6, d = 1.3;
  for (const [u, v] of [[-w, -d], [w, -d], [-w, d], [w, d]]) F.b('bamboo_culm', u - 0.04, y, v - 0.04, u + 0.04, y + 2.3, v + 0.04, false);
  const aw = r() < 0.5 ? 'cloth_ochre' : r() < 0.5 ? 'cloth_red' : 'cloth_white';
  F.b(aw, -w - 0.3, y + 2.25, -d - 0.2, w + 0.3, y + 2.4, d + 0.6, false);
  F.b('wood_ochre', -w, y, d - 0.7, w, y + 0.85, d, true);
  F.b('wood_ochre', -w, y + 0.85, d - 0.75, w, y + 0.9, d + 0.05, false);
  const goods = el.goods ?? ['flowers', 'pots', 'fruit', 'candles'][Math.floor(r() * 4)];
  for (let i = 0; i < 6; i++) {
    const u = -w + 0.35 + i * 0.52;
    if (goods === 'pots') F.lathe('terracotta', [[0.1, 0], [0.22, 0.1], [0.24, 0.24], [0.15, 0.38], [0.001, 0.4]], u, y + 0.9, d - 0.35, 8);
    else if (goods === 'fruit') F.b(i % 2 ? 'cloth_green' : 'cloth_ochre', u - 0.2, y + 0.9, d - 0.55, u + 0.2, y + 1.1, d - 0.15, false);
    else if (goods === 'candles') F.b('paint_ochre', u - 0.05, y + 0.9, d - 0.45, u + 0.05, y + 1.2, d - 0.35, false);
    else F.b(i % 2 ? 'cloth_red' : 'cloth_ochre', u - 0.2, y + 0.9, d - 0.55, u + 0.2, y + 1.05, d - 0.15, false);
  }
  F.b('reed_mat', -w, y, -d, w, y + 0.03, d - 0.7, false);
  void bag; void col;
}

/** bgn_zayat: { c, A, B (half sizes), rot, y, seed } — an open rest house: a raised plank platform on posts under a tiered thatch roof, benches. Walkable. */
export function zayat(el, ctx) {
  const { c, A = 5, B = 3.5 } = el, y = el.y ?? 0, fl = y + 0.9;
  const F = new Fr(ctx, c, [1, 0], [0, 1]);
  for (let i = 0; i <= 3; i++) for (const s of [-1, 1]) F.b('timber', -A + (2 * A * i) / 3 - 0.12, y, s * B * 0.9 - 0.12, -A + (2 * A * i) / 3 + 0.12, y + 3.6, s * B * 0.9 + 0.12, false);
  F.b('wood_ochre', -A, fl - 0.15, -B, A, fl, B, false); F.floor(-A, -B, A, B, fl);
  F.ramp(-1.2, B, 1.2, B + 2.6, y, fl, -1);
  for (let i = 0; i < 4; i++) F.b('wood_ochre', -1.2, y, B + 2.6 - i * 0.65, 1.2, fl * (i + 1) / 4, B + 2.6 - i * 0.65 - 0.65 + 0.65, false);
  gable(F, 'thatch_palm', -A - 0.8, A + 0.8, -B - 0.9, B + 0.9, y + 3.6, 2.4, true);
  gable(F, 'thatch_palm', -A * 0.55, A * 0.55, -B * 0.55, B * 0.55, y + 5.2, 1.2, true);
  F.b('wood_ochre', -A + 0.3, fl, -B + 0.1, A - 0.3, fl + 0.5, -B + 0.5, true);
  F.b('reed_mat', -A + 1, fl, -1, -1, fl + 0.03, 1.2, false);
}

/**
 * bgn_kyaung: { c, A, B (half sizes of the hall), y (the platform's height), tiers, palace (gilt and red), rot (0: the front toward +z), seed } — a teak hall on a platform under tiered roofs (pyatthat),
 * a stair, the open front with its steps; inside the altar with the gilded image and the mats of the monks (or the court).
 */
export function kyaung(el, ctx) {
  const { c, A = 7, B = 5.5 } = el, r = rng(el.seed ?? 2), tiers = el.tiers ?? 3, y = el.y ?? 2.0, pal = !!el.palace, wallH = pal ? 4.6 : 3.8;
  const rot = el.rot ?? 0;
  const F = new Fr(ctx, c, [Math.cos(rot), -Math.sin(rot)], [Math.sin(rot), Math.cos(rot)]);
  // the footing of brick and the platform of planks
  F.b('brick', -A - 1.6, 0, -B - 1.6, A + 1.6, y - 0.1, B + 1.6, true);
  F.b('wood_dark', -A - 1.6, y - 0.1, -B - 1.6, A + 1.6, y, B + 1.6, false); F.floor(-A - 1.6, -B - 1.6, A + 1.6, B + 1.6, y);
  // the stair up the front: wide steps of brick
  const n = 7, sl = 4.2;
  for (let i = 0; i < n; i++) F.b('brick', -2.4, 0, B + 1.6 + sl * (n - 1 - i) / n, 2.4, y * (i + 1) / n, B + 1.6 + sl, false);
  F.ramp(-2.4, B + 1.6, 2.4, B + 1.6 + sl, 0, y, -1);
  // the posts (round, dark teak) round the hall and inside; the walls on the sides and the back, the front open
  const nu = Math.max(3, Math.round(A * 2 / 2.8)), nv = Math.max(2, Math.round(B * 2 / 2.8));
  const post = (u, v) => { F.lathe(pal ? 'lacquer_red' : 'wood_dark', [[0.3, 0], [0.26, wallH * 0.5], [0.24, wallH]], u, y, v, 8); F.circle(u, v, 0.26, y, y + wallH); };
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const e = i === 0 || j === 0 || i === nu || j === nv; if (e || (i % 2 === 0 && j === Math.floor(nv / 2))) post(-A + (2 * A * i) / nu, -B + (2 * B * j) / nv); }
  const ww = (u0, v0, u1, v1) => F.b(pal ? 'lacquer_red' : 'planks_grey', u0, y, v0, u1, y + wallH - 0.5, v1, true);
  ww(-A, -B, A, -B + 0.3); ww(-A, -B, -A + 0.3, B); ww(A - 0.3, -B, A, B);
  // a carved fascia and a rail along the front
  F.b(pal ? 'gilt_bronze' : 'wood_ochre', -A - 0.2, y + wallH - 0.5, -B - 0.2, A + 0.2, y + wallH, B + 0.2, false);
  for (const u of [-A, A]) F.b('wood_dark', u - 0.06, y + 0.7, B - 0.2, u + 0.06, y + 1.0, B + 0.02, false);
  // the roofs: stacked hips, each smaller, the wall band between them carved
  let a = A + 2.4, b = B + 2.4, yy = y + wallH, T = [];
  for (let k = 0; k < tiers; k++) {
    const rh = 1.5 + (k === 0 ? 0.4 : 0), ia = Math.min(a, b) * 0.2;
    ctx.bag.add(pal ? 'tile_dark' : 'tar_shingle', frustum(F.R(-a, -b, a, b), yy, yy + rh, ...(rot ? [ia, ia, ia, ia] : [ia, ia, ia, ia])));
    ctx.bag.add(pal ? 'gilt_bronze' : 'wood_ochre', frustum(F.R(-a - 0.05, -b - 0.05, a + 0.05, b + 0.05), yy - 0.25, yy + 0.02, 0, 0, 0, 0));
    yy += rh;
    // the wall band between this tier and the next
    if (k < tiers - 1) { a -= 2.2; b -= 2.2; if (a < 1.4 || b < 1.4) { T.push(k); break; } const bh = 1.0; F.b(pal ? 'lacquer_red' : 'wood_dark', -a + 0.3, yy, -b + 0.3, a - 0.3, yy + bh, b - 0.3, false); yy += bh; }
  }
  const [px, pz] = F.pt(0, 0);
  ctx.bag.add('gilt_bronze', lathe([[0.45, 0], [0.5, 0.4], [0.3, 0.7], [0.35, 1.4], [0.2, 2.2], [0.08, 3.4], [0.001, 3.8]], 8, null, px, yy, pz));
  // inside: the altar and image at the back, mats for the monks (or the court), a lamp
  F.b('lacquer_red', -2.0, y, -B + 0.4, 2.0, y + 0.9, -B + 2.2, true);
  F.b('gilt_bronze', -2.05, y + 0.8, -B + 0.35, 2.05, y + 0.9, -B + 2.25, false);
  F.lathe('gold', [[1.0, 0], [0.9, 0.35], [0.6, 0.9], [0.7, 1.3], [0.28, 1.5], [0.22, 1.7]], 0, y + 0.9, -B + 1.3, 12);
  F.lathe('gilt_bronze', [[0.22, 1.7], [0.3, 1.95], [0.27, 2.2], [0.001, 2.35]], 0, y + 0.9, -B + 1.3, 10);
  for (let k = 0; k < 6; k++) { const u = -A + 1.6 + k * ((2 * A - 3.2) / 5); if (Math.abs(u) < 1.4) continue; F.b('reed_mat', u - 0.7, y, 0.2, u + 0.7, y + 0.03, 1.6, false); }
  F.b('reed_mat', -A + 1.5, y, B - 2.3, A - 1.5, y + 0.03, B - 1.0, false);
  F.light(0, y + wallH - 0.5, 0, '#ffc98a', 6, 16);
  void r; void T;
}

/**
 * bgn_okkyaung: { rect (x0, z0, x1, z1), front, seed } — a brick monastery, two storeys: a vaulted hall below with pointed arches on the front, a plastered upper room under a stepped roof;
 * enterable on the ground floor.
 */
export function okkyaung(el, ctx) {
  const F = lotFrame(ctx, el.rect, el.front ?? 's'), W = F.W, D = F.D, f = 0.6, h1 = 5.6, h2 = 9.2;
  F.b('brick_baked', 0, 0, 0, W, f, D, false); F.floor(0, 0, W, D, f);
  const op = [-1, 0, 1].map((i) => ({ c: W / 2 + i * (W / 3.4), w: 2.4, top: f + 4.4 }));
  archWall(F, 'limewash_white', 0, W, 0.2, 1.6, f, h1, op, 'stucco_cream');
  F.b('limewash_white', 0, f, D - 1.4, W, h1, D, true);
  F.b('limewash_white', 0, f, 1.6, 1.4, h1, D - 1.4, true); F.b('limewash_white', W - 1.4, f, 1.6, W, h1, D - 1.4, true);
  vault(F, 'u', (1.6 + D - 1.4) / 2, (D - 3.0) / 2, 1.4, W - 1.4, f + 3.2, 2.2, 5, 'limewash_white');
  // the upper room, set back, with a row of windows and a stepped roof
  F.b('limewash_white', 1.2, h1, 1.6, W - 1.2, h2, D - 1.2, true);
  for (let i = 1; i < 5; i++) F.b('wood_dark', W * i / 5 - 0.5, h1 + 1.5, 1.52, W * i / 5 + 0.5, h1 + 3.0, 1.62, false);
  F.b('stucco_cream', 0.6, h1 - 0.35, 0.6, W - 0.6, h1 + 0.03, D - 0.6, false);
  for (let i = 0; i < 3; i++) F.b('limewash_white', 1.2 + i * 1.3, h2 + i * 0.9, 1.6 + i * 1.3, W - 1.2 - i * 1.3, h2 + 0.9 + i * 0.9, D - 1.2 - i * 1.3, false);
  const [px, pz] = F.pt(W / 2, D / 2);
  miniStupa(ctx.bag, px, h2 + 2.7, pz, 3.4, 'limewash_white', true, 8);
  // inside: the Buddha at the back and the monks' mats
  F.b('lacquer_red', W / 2 - 1.6, f, D - 3.6, W / 2 + 1.6, f + 0.9, D - 1.4, true);
  F.lathe('gold', [[0.9, 0], [0.8, 0.35], [0.55, 0.9], [0.65, 1.3], [0.26, 1.5], [0.2, 1.7]], W / 2, f + 0.9, D - 2.5, 12);
  for (let k = 0; k < 4; k++) F.b('reed_mat', 2.2 + k * (W - 5.4) / 3, f, 3.0, 3.6 + k * (W - 5.4) / 3, f + 0.03, 4.6, false);
  F.light(W / 2, f + 3.2, D / 2, '#ffc98a', 5, 14);
}
