// The houses of the lineage quarters (docs/settlements/shang-yinxu.md §5): a main house on a rammed foundation with plastered wattle
// walls and a hipped thatch roof; semi-subterranean pit houses (modelled bermed: the ground mesh is too coarse to sink a 4 m floor);
// storage pits, wells, drying racks for hemp, granaries on posts, pens; the workshops of bone, jade, pottery and the diviners' craft.
import { box, lathe, frustum, rod } from '../../core/geom.js';
import { rng } from '../../objects/kit.js';
import { frame, steps, vessel, KINDS } from './geo.js';

export const JAR = (r) => [[0.001, 0], [r * 0.55, 0.02], [r, r * 0.9], [r * 0.9, r * 1.6], [r * 0.5, r * 2.0], [r * 0.58, r * 2.2], [0.001, r * 2.2]];
const WALLS = ['mud_plaster', 'mud_plaster', 'earth_wall', 'mud_plaster'];

/** A bermed pit house: earth banked 0.75 m on three sides, a low front wall with the door, a gabled thatch roof with the ridge from front to back. */
export function pitHouse(F, u, v, w, d, open = false) {
  const R = (a, b, c, e) => F.R(u + a, v + b, u + c, v + e);
  const berm = (r) => { F.bag.add('earth_wall', frustum(r, 0, 0.78, 0.4, 0.4, 0.4, 0.4, { noBottom: true })); F.col.rect(r, 0, 0.78); };
  berm(R(0, 0.9, 1.0, d)); berm(R(w - 1.0, 0.9, w, d)); berm(R(1.0, d - 1.0, w - 1.0, d));
  const fl = R(1.0, 0.9, w - 1.0, d - 1.0);
  F.bag.add('earth_wall', box(fl[0], 0, fl[1], fl[2], 0.03, fl[3]));
  // the front: a wall of plastered wattle 1.5 m high with a doorway, the stepped threshold
  const dw = 0.5;
  F.b('mud_plaster', u, 0, v, u + w / 2 - dw, 1.5, v + 0.45); F.b('mud_plaster', u + w / 2 + dw, 0, v, u + w, 1.5, v + 0.45);
  F.b('mud_plaster', u + w / 2 - dw, 1.25, v, u + w / 2 + dw, 1.5, v + 0.45, false);
  F.b('timber', u + w / 2 - dw - 0.08, 0, v - 0.04, u + w / 2 - dw + 0.04, 1.3, v + 0.5, false); F.b('timber', u + w / 2 + dw - 0.04, 0, v - 0.04, u + w / 2 + dw + 0.08, 1.3, v + 0.5, false);
  F.b('opening', u + w / 2 - dw + 0.04, 0, v + 0.3, u + w / 2 + dw - 0.04, 1.2, v + 0.34, false);
  F.b('earth_wall', u + w / 2 - dw - 0.2, 0, v - 0.45, u + w / 2 + dw + 0.2, 0.12, v, false);
  F.roof(u + 0.2, v + 0.05, u + w - 0.2, v + d - 0.1, 0.72, 1.9 + w * 0.12, 0.45, false);
  F.b('timber', u + w / 2 - 0.05, 0.72, v + 0.1, u + w / 2 + 0.05, 2.0, v + 0.18, false);
  if (open) { F.b('reed_mat', u + 1.1, 0.03, v + 1.2, u + w - 1.1, 0.06, v + d - 1.3, false); F.lathe('pottery_dark', [[0.001, 0.03], [0.3, 0.05], [0.34, 0.2], [0.001, 0.2]], u + w / 2, 0.03, v + d / 2, 10); }
}

/** A raised granary: a floor of planks on posts, walls of wattle, a thatched roof, a ladder. */
function granary(F, u, v, w = 3, d = 3) {
  for (const a of [0.2, w - 0.2]) for (const b of [0.2, d - 0.2]) F.b('timber', u + a - 0.1, 0, v + b - 0.1, u + a + 0.1, 0.8, v + b + 0.1);
  F.b('timber', u, 0.8, v, u + w, 0.9, v + d);
  F.b('wicker', u + 0.1, 0.9, v + 0.1, u + w - 0.1, 2.3, v + d - 0.1);
  F.roof(u, v, u + w, v + d, 2.3, 1.5, 0.5, true);
  F.b('timber', u + w / 2 - 0.3, 0, v - 0.3, u + w / 2 - 0.2, 0.9, v + 0.0, false);
  F.b('timber', u + w / 2 + 0.2, 0, v - 0.3, u + w / 2 + 0.3, 0.9, v + 0.0, false);
}
const well = (F, u, v) => { F.lathe('rubble', [[0.7, 0], [0.7, 0.5], [0.45, 0.5]], u, 0, v, 10); F.col.circle(F.X(u), F.Z(v), 0.7, 0, 0.5); F.b('timber', u - 0.8, 0.5, v - 0.05, u + 0.8, 0.58, v + 0.05, false); for (const s of [-1, 1]) F.b('timber', u + s * 0.8 - 0.05, 0.5, v - 0.05, u + s * 0.8 + 0.05, 1.5, v + 0.05, false); F.b('timber', u - 0.9, 1.5, v - 0.05, u + 0.9, 1.58, v + 0.05, false); };
const rack = (F, u, v, len = 3) => { for (const s of [0, len]) { F.b('timber', u + s - 0.05, 0, v - 0.2, u + s + 0.05, 1.8, v - 0.1, false); F.b('timber', u + s - 0.05, 0, v + 0.1, u + s + 0.05, 1.8, v + 0.2, false); } F.b('timber', u, 1.75, v - 0.05, u + len, 1.82, v + 0.05, false); for (let k = 0; k < len * 2.2; k++) F.b(k % 2 ? 'cloth_brown' : 'cloth_ochre', u + 0.2 + k * 0.42, 0.7, v - 0.04, u + 0.45 + k * 0.42, 1.75, v + 0.04, false); };
const pit = (F, u, v, r = 0.8) => { F.lathe('planks_grey', [[r, 0.02], [r, 0.08], [0.001, 0.14]], u, 0, v, 10); F.lathe('earth_wall', [[r + 0.2, 0], [r + 0.2, 0.06], [r, 0.08]], u, 0, v, 10); };
const jars = (F, u, v, n, r = 0.22, y = 0) => { for (let i = 0; i < n; i++) F.lathe(i % 3 ? 'pottery_dark' : 'terracotta', JAR(r + (i % 2) * 0.05), u + i * 0.6, y, v + (i % 2) * 0.25, 9); };
const fence = (F, u0, v0, u1, v1, gap = null) => {
  const seg = (a, b, c, d) => { F.b('wicker', a, 0, b, c, 1.2, d, true); };
  const t = 0.1;
  if (gap) { seg(u0, v0, gap[0], v0 + t); seg(gap[1], v0, u1, v0 + t); } else seg(u0, v0, u1, v0 + t);
  seg(u0, v1 - t, u1, v1); seg(u0, v0, u0 + t, v1); seg(u1 - t, v0, u1, v1);
};

/** The main house: a rammed foundation 0.5 m, plastered walls 2.5 m, a door, a hipped thatch roof; open = the door stands open and the room is furnished. */
function mainHouse(F, u, v, w, d, open, rand) {
  const wm = WALLS[Math.floor(rand() * WALLS.length)], th = 0.45, H = 2.6, P = 0.5;
  F.b('earth_wall', u - 0.4, 0, v - 0.4, u + w + 0.4, P, v + d + 0.4);
  steps(F.bag, F.col, F.R(u + w / 2 - 0.8, v - 1.0, u + w / 2 + 0.8, v - 0.4), 0, P, F.front === 's' ? 's' : 'n');
  const dw = 1.1, dc = u + w / 2;
  F.b(wm, u, P, v, dc - dw / 2, P + H, v + th); F.b(wm, dc + dw / 2, P, v, u + w, P + H, v + th); F.b(wm, dc - dw / 2, P + 1.9, v, dc + dw / 2, P + H, v + th, false);
  F.b(wm, u, P, v + th, u + th, P + H, v + d); F.b(wm, u + w - th, P, v + th, u + w, P + H, v + d); F.b(wm, u + th, P, v + d - th, u + w - th, P + H, v + d);
  F.b('timber', dc - dw / 2 - 0.1, P, v - 0.05, dc - dw / 2 + 0.03, P + 1.95, v + th + 0.05, false); F.b('timber', dc + dw / 2 - 0.03, P, v - 0.05, dc + dw / 2 + 0.1, P + 1.95, v + th + 0.05, false); F.b('timber', dc - dw / 2 - 0.12, P + 1.9, v - 0.06, dc + dw / 2 + 0.12, P + 2.05, v + th + 0.06, false);
  if (!open) F.b('planks_grey', dc - dw / 2 + 0.03, P, v + 0.12, dc + dw / 2 - 0.03, P + 1.9, v + 0.2, false);
  for (const k of [-1, 1]) F.b('opening', u + w / 2 + k * w * 0.3 - 0.3, P + 1.7, v - 0.01, u + w / 2 + k * w * 0.3 + 0.3, P + 2.2, v + 0.03, false);
  F.b('paint_ochre', u - 0.02, P, v - 0.03, u + w + 0.02, P + 0.45, v, false);
  F.roof(u, v, u + w, v + d, P + H, 2.3 + w * 0.08, 0.95, true);
  if (open) {
    F.b('earth_wall', u + th, P, v + th, u + w - th, P + 0.03, v + d - th, false);
    F.b('reed_mat', u + 1.0, P + 0.03, v + 1.2, u + w - 1.0, P + 0.06, v + 3.4, false);
    F.b('lacquer_black', u + w / 2 - 0.6, P + 0.06, v + 1.8, u + w / 2 + 0.6, P + 0.42, v + 2.6);
    vessel('ding', F.bag, F.X(u + w / 2), P + 0.42, F.Z(v + 2.2), 0.7);
    F.b('earth_wall', u + th + 0.1, P + 0.03, v + d - th - 1.6, u + w - th - 0.1, P + 0.5, v + d - th - 0.1);           // the sleeping platform
    F.b('reed_mat', u + th + 0.2, P + 0.5, v + d - th - 1.5, u + w - th - 0.2, P + 0.53, v + d - th - 0.2, false);
    F.b('timber', u + th + 0.1, P + 0.03, v + th + 0.1, u + th + 1.3, P + 0.6, v + th + 0.8); F.b('lacquer_red', u + th + 0.1, P + 0.6, v + th + 0.1, u + th + 1.3, P + 0.65, v + th + 0.8, false);
    F.lathe('pottery_dark', [[0.001, 0.0], [0.3, 0.02], [0.34, 0.2], [0.001, 0.2]], u + w - 1.2, P + 0.03, v + th + 1.0, 10);
    jars(F, u + w - 3.4, v + th + 0.3, 3, 0.2, P + 0.03);
    F.b('timber', u + w - th - 0.15, P + 0.03, v + 2.2, u + w - th - 0.05, P + 1.6, v + 2.3, false);                // a loom's upright
    F.b('cloth_brown', u + w - th - 0.2, P + 0.4, v + 2.3, u + w - th - 0.08, P + 1.5, v + 3.1, false);
  }
}

/** shang_court_house: { rect, front, seed, open } — a compound of the great: a fenced yard, the main house on its foundation, pit houses, granary, well, pits. */
export function courtHouse(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D;
  fence(F, 0.5, 0.5, W - 0.5, D - 0.5, [W / 2 - 1.2, W / 2 + 1.2]);
  F.b('timber', W / 2 - 1.4, 0, 0.4, W / 2 - 1.2, 2.2, 0.7, false); F.b('timber', W / 2 + 1.2, 0, 0.4, W / 2 + 1.4, 2.2, 0.7, false);
  const hw = 9 + Math.floor(rand() * 3), hd = 6.2;
  mainHouse(F, (W - hw) / 2, D - hd - 1.5, hw, hd, !!el.open, rand);
  pitHouse(F, 1.5, 3.4, 3.4, 4.6, false); if (rand() < 0.8) pitHouse(F, W - 5.2, 3.6, 3.4, 4.4, false);
  granary(F, 2.2 + rand() * 2, D - 5.5, 2.6, 2.6);
  well(F, W - 3.5, D - 3);
  pit(F, W / 2 - 3, 4, 0.8); pit(F, W / 2 + 3, 5.5, 0.7);
  rack(F, W / 2 + 4, 2.0, 3.2);
  jars(F, 1.2, 9.5, 3);
}

/** shang_pit_yard: { rect, front, seed, open } — pit houses round a yard with a hearth, a granary, a rack, a pen, storage pits. */
export function pitYard(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D;
  fence(F, 0.5, 0.5, W - 0.5, D - 0.5, [W / 2 - 1.0, W / 2 + 1.0]);
  pitHouse(F, 1.2, 2.4, 3.6, 4.8, false); pitHouse(F, W - 4.8, 2.4, 3.6, 4.6, false); pitHouse(F, 1.4, D - 6.6, 3.4, 4.6, false);
  if (W > 22) pitHouse(F, W - 4.8, D - 6.4, 3.6, 4.6, false);
  const hx = W / 2, hz = D / 2 + 1;
  F.lathe('rubble', [[0.55, 0], [0.55, 0.14], [0.35, 0.14]], hx, 0, hz, 9); F.lathe('flame', [[0.001, 0.12], [0.15, 0.14], [0.001, 0.4]], hx, 0, hz, 6);
  F.lathe('pottery_dark', [[0.001, 0.0], [0.22, 0.02], [0.26, 0.25], [0.001, 0.3]], hx + 0.5, 0.14, hz + 0.1, 8);
  granary(F, W / 2 - 1.3, D - 4.2, 2.6, 2.6);
  pit(F, W / 2 - 3.6, 2.8, 0.8); pit(F, W / 2 + 3.6, 3.0, 0.75);
  rack(F, W / 2 - 4.5, D / 2 + 3.4, 3); jars(F, W - 6.5, D - 2.2, 4);
  if (rand() < 0.6) { F.b('wicker', W - 7.5, 0, D - 6, W - 4.5, 0.9, D - 6.1); F.b('wicker', W - 7.5, 0, D - 3.4, W - 4.5, 0.9, D - 3.5); F.b('wicker', W - 7.5, 0, D - 6, W - 7.4, 0.9, D - 3.4); }
}

/** shang_row_house: { rect, front, seed, open } — two or three houses of wattle with thatched gables along the lot, a rack and jars between. */
export function rowHouse(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D;
  const n = W > 22 ? 3 : 2, bw = (W - 2) / n;
  for (let i = 0; i < n; i++) {
    const u = 1 + i * bw, w = bw - 1.2 - rand() * 0.6, d = 5.0 + rand() * 1.4, v = 2.2 + rand() * 1.8, wm = WALLS[Math.floor(rand() * WALLS.length)];
    F.b(wm, u, 0, v, u + 0.4, 2.3, v + d); F.b(wm, u + w - 0.4, 0, v, u + w, 2.3, v + d); F.b(wm, u, 0, v + d - 0.4, u + w, 2.3, v + d);
    F.b(wm, u + 0.4, 0, v, u + w / 2 - 0.5, 2.3, v + 0.4); F.b(wm, u + w / 2 + 0.5, 0, v, u + w - 0.4, 2.3, v + 0.4); F.b(wm, u + w / 2 - 0.5, 1.8, v, u + w / 2 + 0.5, 2.3, v + 0.4, false);
    F.b('timber', u + w / 2 - 0.58, 0, v - 0.04, u + w / 2 - 0.48, 1.85, v + 0.44, false); F.b('timber', u + w / 2 + 0.48, 0, v - 0.04, u + w / 2 + 0.58, 1.85, v + 0.44, false);
    if (!(el.open && i === 0)) F.b('planks_grey', u + w / 2 - 0.48, 0, v + 0.1, u + w / 2 + 0.48, 1.8, v + 0.17, false);
    else { F.b('reed_mat', u + 0.6, 0.01, v + 1.0, u + w - 0.6, 0.04, v + d - 0.6, false); F.b('lacquer_black', u + w / 2 - 0.5, 0.04, v + 2.2, u + w / 2 + 0.5, 0.4, v + 2.9); vessel('gui', F.bag, F.X(u + w / 2), 0.4, F.Z(v + 2.55), 0.8); }
    F.roof(u, v, u + w, v + d, 2.3, 2.0, 0.7, false);
  }
  rack(F, 2, D - 3, 3.5); jars(F, W - 5, D - 2.5, 3); pit(F, W - 3, D - 6, 0.7);
}

/** shang_workshop: { rect, front, seed, open, trade } — a yard of a craft: bone, jade, pottery or the oracle-bone craft, under a shed of posts and thatch. */
export function workshop(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D, T = el.trade ?? 'bone';
  fence(F, 0.4, 0.4, W - 0.4, D - 0.4, [W / 2 - 1.2, W / 2 + 1.2]);
  const su0 = 1.5, sv0 = D - 9, su1 = W - 1.5, sv1 = D - 1.2, sh = 2.5;
  for (let u = su0; u <= su1 + 0.1; u += (su1 - su0) / 3) for (const v of [sv0, sv1]) F.post(u, v, 0, sh, 0.12);
  F.b('timber', su0, sh, sv0 - 0.1, su1, sh + 0.18, sv0 + 0.1, false); F.b('timber', su0, sh, sv1 - 0.1, su1, sh + 0.18, sv1 + 0.1, false);
  F.roof(su0, sv0, su1, sv1, sh + 0.18, 2.1, 0.8, false);
  const bench = (u, v, l = 3, wd = 0.9) => { F.b('timber', u, 0.62, v, u + l, 0.7, v + wd); for (const a of [0.1, l - 0.2]) for (const b of [0.1, wd - 0.2]) F.b('timber', u + a, 0, v + b, u + a + 0.1, 0.62, v + b + 0.1, false); F.col.rect(F.R(u, v, u + l, v + wd), 0, 0.7); };
  const heap = (mat, u, v, r) => F.bag.add(mat, frustum([F.X(u) - r, F.Z(v) - r * 0.8, F.X(u) + r, F.Z(v) + r * 0.8], 0, r * 0.55, r * 0.6, r * 0.6, r * 0.5, r * 0.5, { noBottom: true }));
  if (T === 'bone') {
    bench(su0 + 1, sv0 + 2.4, 3.2); for (let i = 0; i < 6; i++) F.b('ivory', su0 + 1.2 + i * 0.45, 0.7, sv0 + 2.6, su0 + 1.3 + i * 0.45, 0.72, sv0 + 3.2, false);
    bench(su1 - 4.5, sv0 + 2.4, 3.2); for (let i = 0; i < 5; i++) F.b('ivory', su1 - 4.3 + i * 0.55, 0.7, sv0 + 2.6, su1 - 4.1 + i * 0.55, 0.78, sv0 + 3.1, false);
    heap('ivory', W / 2 - 3, 4, 1.1); heap('ivory', W / 2 + 3, 5, 0.9); F.lathe('granite_grey', [[0.5, 0], [0.5, 0.3], [0.001, 0.32]], W / 2, 0, D / 2 - 1.5, 8);
  } else if (T === 'jade') {
    bench(su0 + 1, sv0 + 2.4, 2.4); F.lathe('inlay_jade', [[0.001, 0.7], [0.14, 0.7], [0.14, 0.76], [0.001, 0.8]], su0 + 1.6, 0, sv0 + 2.8, 8);
    F.b('reed_mat', W / 2 - 1.6, 0.01, sv0 + 1.2, W / 2 + 1.6, 0.04, sv0 + 3.4, false); for (let i = 0; i < 5; i++) F.b('inlay_jade', W / 2 - 1.2 + i * 0.5, 0.04, sv0 + 2.0, W / 2 - 0.95 + i * 0.5, 0.07, sv0 + 2.5, false);
    F.lathe('sandstone', [[0.4, 0], [0.4, 0.2], [0.001, 0.2]], su1 - 2, 0, sv0 + 3, 8); F.lathe('granite_grey', [[0.5, 0.2], [0.5, 0.26]], su1 - 2, 0, sv0 + 3, 12);
    heap('granite_grey', W / 2 + 3, 4.5, 1.0);
  } else if (T === 'pottery') {
    F.bag.add('mud_plaster', frustum([F.X(W / 2) - 2.2, F.Z(5) - 2.0, F.X(W / 2) + 2.2, F.Z(5) + 2.0], 0, 1.7, 0.9, 0.9, 0.8, 0.8, { noBottom: true })); F.col.rect(F.R(W / 2 - 2.2, 3, W / 2 + 2.2, 7), 0, 1.7);
    F.b('opening', W / 2 - 0.5, 0.1, 3.05, W / 2 + 0.5, 0.9, 3.1, false); F.lathe('granite_black', [[0.001, 1.7], [0.3, 1.7], [0.3, 1.82], [0.001, 1.82]], W / 2, 0, 5, 8);
    for (let r = 0; r < 3; r++) jars(F, 2 + r * 0.1, 8.3 + r * 0.9, 5, 0.2 + 0.03 * r);
    F.lathe('timber', [[0.35, 0.3], [0.35, 0.36], [0.001, 0.36]], su1 - 1.5, 0, sv0 + 2.3, 12); F.b('timber', su1 - 1.6, 0, sv0 + 2.2, su1 - 1.4, 0.3, sv0 + 2.4, false);
    heap('mud_plaster', W - 3, 4, 1.2);
  } else {
    bench(su0 + 1, sv0 + 2.4, 3.4); for (let i = 0; i < 5; i++) F.b('ivory', su0 + 1.2 + i * 0.62, 0.7, sv0 + 2.6, su0 + 1.7 + i * 0.62, 0.74, sv0 + 3.2, false);
    bench(su1 - 4.6, sv0 + 2.4, 3.4); F.b('bronze', su1 - 2.2, 0.7, sv0 + 2.7, su1 - 1.9, 0.72, sv0 + 3.0, false);
    F.lathe('bronze', [[0.001, 0.3], [0.28, 0.33], [0.32, 0.46], [0.001, 0.46]], W / 2, 0, D / 2 - 1.2, 10); F.lathe('flame', [[0.001, 0.46], [0.1, 0.5], [0.001, 0.7]], W / 2, 0, D / 2 - 1.2, 6);
    heap('hide_grey', W / 2 - 3.5, 4.5, 1.0); heap('ivory', W / 2 + 3.5, 4, 0.8);
  }
  jars(F, su0 + 0.2, sv1 - 0.8, 2); void KINDS;
}
export const KINDS_H = WALLS;
void rod; void lathe;
