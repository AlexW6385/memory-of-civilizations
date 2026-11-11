// The houses of the town (docs/settlements/qin-xianyang.md §6): rammed-earth walls on a footing of tile, a door under a timber
// lintel, a window slit under the eaves, roofs of grey tile or thatch (gabled, the ridge along the street) or flat clay; the
// workman's row house, the courtyard house with its gate, the official's house on a raised earth platform, the raised granary
// (cang), the garden plot. A lot's `front` is the side its door is on; in the lot's own frame u runs along the street and v
// from the street into the lot.
import { box, lathe, fromTriangles, quad } from '../../core/geom.js';
import { rng } from '../../objects/kit.js';

export function frame(rect, front, bag, col) {
  const [x0, z0, x1, z1] = rect, zs = front === 's' ? z1 : z0, sg = front === 's' ? -1 : 1, Z = (v) => zs + sg * v;
  const R = (u0, v0, u1, v1) => { const a = Z(v0), b = Z(v1); return [x0 + u0, Math.min(a, b), x0 + u1, Math.max(a, b)]; };
  return {
    W: x1 - x0, D: z1 - z0, X: (u) => x0 + u, Z, R, rise: front === 's' ? 'n' : 's', bag, col, sg,
    b(mat, u0, y0, v0, u1, y1, v1, solid = true) { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); },
    lathe(mat, prof, u, y, v, seg = 10) { bag.add(mat, lathe(prof, seg, null, x0 + u, y, Z(v))); },
  };
}
export const WALLS = ['earth_wall', 'earth_wall', 'mud_plaster', 'earth_wall', 'mud_plaster'];
export const JAR = (r) => [[0.001, 0], [r * 0.5, 0.02], [r, r * 0.9], [r * 0.9, r * 1.6], [r * 0.5, r * 2.0], [r * 0.58, r * 2.2], [0.001, r * 2.2]];

/** A gabled roof over rect [u0, v0, u1, v1] (frame units), eaves at height H, rising `rise`, the ridge along the street (u), overhang `o`. */
export function gable(F, u0, v0, u1, v1, H, rise, mat, o = 0.5) {
  const a = F.X(u0 - o), b = F.X(u1 + o), za = F.Z(v0 - o), zb = F.Z(v1 + o), zm = (za + zb) / 2, yr = H + rise, T = [];
  const slope = (zE) => { quad(T, [a, H, zE], [a, yr, zm], [b, yr, zm], [b, H, zE]); quad(T, [a, H, zE], [b, H, zE], [b, yr, zm], [a, yr, zm]); };
  slope(za); slope(zb);
  F.bag.add(mat, fromTriangles(T));
  // the gable ends: the wall's triangle in earth
  const E = [];
  for (const x of [F.X(u0), F.X(u1)]) { const zz0 = F.Z(v0), zz1 = F.Z(v1); E.push(x, H, zz0, x, H, zz1, x, yr - 0.1, zm, x, H, zz0, x, yr - 0.1, zm, x, H, zz1); }
  F.bag.add('earth_wall', fromTriangles(E));
  // the ridge: a row of tile
  F.bag.add(mat === 'thatch' ? 'roof_ridge' : 'tile_dark', box(a, yr - 0.05, zm - 0.18, b, yr + 0.25, zm + 0.18));
}
/** The door: a footing of tile, jambs, a timber lintel, the leaf (shut unless the house is open). */
export function door(F, wm, u, w, h, v0, v1, open, H) {
  F.b(wm, 0, 0, v0, u - w / 2, H, v1); F.b(wm, u + w / 2, 0, v0, F.W, H, v1); F.b(wm, u - w / 2, h, v0, u + w / 2, H, v1);
  F.b('timber', u - w / 2 - 0.15, h - 0.16, v0 - 0.06, u + w / 2 + 0.15, h + 0.1, v1 + 0.06, false);
  F.b('brick_grey', u - w / 2 - 0.05, -0.03, v0 - 0.12, u + w / 2 + 0.05, 0.1, v1 + 0.08, false);
  F.b('timber', u - w / 2 - 0.06, 0, v0 - 0.03, u - w / 2 + 0.02, h, v1 + 0.03, false); F.b('timber', u + w / 2 - 0.02, 0, v0 - 0.03, u + w / 2 + 0.06, h, v1 + 0.03, false);
  if (!open) F.b('timber_red', u - w / 2 + 0.02, 0.02, v0 + 0.1, u + w / 2 - 0.02, h - 0.02, v0 + 0.2);
}
const slit = (F, u, y, v, w = 0.5, h = 0.34) => F.b('opening', u - w / 2, y, v - 0.01, u + w / 2, y + h, v + 0.03, false);
/** The footing course of tile at the foot of the walls, the rain-splash of the plain earth above it. */
const footing = (F, u0, v0, u1, v1) => { F.b('tile_grey', u0 - 0.02, 0, v0 - 0.02, u1 + 0.02, 0.28, v0 + 0.04, false); };

/** The room's furnishings: a low table on a mat, a stove with a pot, jars, a chest, a loom. */
function furnish(F, rand, u0, v0, u1, v1) {
  const th = 0.55;
  F.b('earth_wall', u0, -0.02, v0, u1, 0.04, v1, false);
  F.b('reed_mat', u0 + 0.6, 0.04, v0 + 1.0, u0 + 3.0, 0.06, v0 + 3.4, false);
  F.b('lacquer_red', u0 + 1.2, 0.06, v0 + 1.6, u0 + 2.4, 0.34, v0 + 2.3);                          // the low table
  F.b('brick_grey', u1 - 1.7, 0, v1 - 1.2, u1 - 0.3, 0.7, v1 - 0.2);                                // the stove of brick
  F.lathe('pottery_dark', [[0.001, 0.7], [0.3, 0.74], [0.35, 0.95], [0.28, 1.08], [0.001, 1.08]], u1 - 1.0, 0, v1 - 0.7, 10);
  for (let i = 0; i < 3; i++) F.lathe('terracotta', JAR(0.22 + 0.05 * (i % 2)), u1 - 0.7 - i * 0.55, 0, v0 + 0.5, 9);
  F.b('timber', u0 + 0.3, 0, v1 - 1.2, u0 + 1.5, 0.55, v1 - 0.3);                                   // a chest
  F.b('timber_red', u0 + 0.3, 0.55, v1 - 1.2, u0 + 1.5, 0.62, v1 - 0.3, false);
  if (rand() < 0.5) { F.b('timber', u0 + 3.4, 0, v1 - 1.6, u0 + 3.52, 1.4, v1 - 1.5, false); F.b('timber', u0 + 4.6, 0, v1 - 1.6, u0 + 4.72, 1.4, v1 - 1.5, false); F.b('cloth_white', u0 + 3.52, 0.3, v1 - 1.58, u0 + 4.6, 1.3, v1 - 1.52, false); }   // an upright loom
  void th;
}

/** qin_row_house: { rect, front, seed, open } — the workman's house: door and one room, a back room, a roof of grey tile or thatch. */
export function rowHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.55, H = 3.0 + rand() * 0.3, wm = WALLS[Math.floor(rand() * WALLS.length)], open = !!el.open;
  const uD = W * (0.3 + rand() * 0.4);
  door(F, wm, uD, 1.0, 1.95, 0, th, open, H);
  F.b(wm, 0, 0, th, th, H, D); F.b(wm, W - th, 0, th, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);
  slit(F, W * 0.5 + (uD < W / 2 ? 1.5 : -1.5), 2.2, 0.0); slit(F, uD, H - 0.55, 0, 0.5, 0.26);
  footing(F, 0, 0, W, 0);
  if (open) { F.b(wm, th, 0, D * 0.55, W * 0.55 - 0.5, H, D * 0.55 + 0.4); F.b(wm, W * 0.55 + 0.5, 0, D * 0.55, W - th, H, D * 0.55 + 0.4); furnish(F, rand, th, th, W - th, D * 0.55); }
  gable(F, 0, 0, W, D, H, 1.5 + rand() * 0.5, rand() < 0.65 ? 'tile_grey' : 'thatch', 0.55);
}

/** qin_court_house: { rect, front, seed, open } — a walled court with a gate, the house of two rooms behind, a shed. */
export function courtHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.55, wm = WALLS[Math.floor(rand() * WALLS.length)], open = !!el.open;
  const cv = 5.8 + rand() * 1.6, uD = W * (0.25 + rand() * 0.5), H = 3.3 + rand() * 0.4, HW = 2.6;
  door(F, wm, uD, 1.8, 2.3, 0, th, open, HW);
  F.b(wm, 0, 0, th, th, HW, cv); F.b(wm, W - th, 0, th, W, HW, cv);
  footing(F, 0, 0, W, 0);
  gable(F, uD - 1.4, -0.1, uD + 1.4, th + 0.2, HW, 0.7, 'tile_grey', 0.5);                               // the little roof over the gate
  F.b(wm, 0, 0, cv, th, H, D); F.b(wm, W - th, 0, cv, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);
  F.b(wm, th, 0, cv, W * 0.5 - 0.6, H, cv + th); F.b(wm, W * 0.5 + 0.6, 0, cv, W - th, H, cv + th); F.b('timber', W * 0.5 - 0.6, 2.1, cv, W * 0.5 + 0.6, H, cv + th, false);
  F.b('timber', W * 0.5 - 0.7, 0, cv - 0.05, W * 0.5 - 0.6, 2.1, cv + th + 0.05, false); F.b('timber', W * 0.5 + 0.6, 0, cv - 0.05, W * 0.5 + 0.7, 2.1, cv + th + 0.05, false);
  slit(F, W * 0.2, 2.2, cv - 0.01); slit(F, W * 0.8, 2.2, cv - 0.01);
  if (open) { furnish(F, rand, th, cv + th, W - th, D - th); }
  gable(F, 0, cv, W, D, H, 1.7 + rand() * 0.4, 'tile_grey', 0.7);
  // in the court: a well, a pen of wicker, the oven, jars; a shed along one wall
  const side = rand() < 0.5 ? 1 : -1, uw = side > 0 ? W - 1.6 : 1.6;
  F.b('brick_grey', uw - 0.5, 0, 2.2, uw + 0.5, 0.5, 3.2); F.lathe('timber', [[0.5, 0.5], [0.001, 0.5]], uw, 0, 2.7, 8);
  F.b('timber', uw - 0.5, 0.5, 2.15, uw - 0.4, 1.9, 2.25, false); F.b('timber', uw + 0.4, 0.5, 2.15, uw + 0.5, 1.9, 2.25, false); F.b('timber', uw - 0.5, 1.9, 2.15, uw + 0.5, 2.0, 2.25, false);
  const sh = side > 0 ? [th + 0.1, 2.8, th + 3.2, 5.2] : [W - th - 3.2, 2.8, W - th - 0.1, 5.2];
  F.b('timber', sh[0], 0, sh[1], sh[0] + 0.1, 2.0, sh[1] + 0.1, false); F.b('timber', sh[2] - 0.1, 0, sh[1], sh[2], 2.0, sh[1] + 0.1, false); F.b('timber', sh[0], 0, sh[3] - 0.1, sh[0] + 0.1, 2.0, sh[3], false); F.b('timber', sh[2] - 0.1, 0, sh[3] - 0.1, sh[2], 2.0, sh[3], false);
  F.b('thatch', sh[0] - 0.2, 2.0, sh[1] - 0.2, sh[2] + 0.2, 2.25, sh[3] + 0.2, false);
  for (let i = 0; i < 4; i++) F.lathe('terracotta', JAR(0.2), sh[0] + 0.5 + i * 0.7, 0, sh[3] - 0.7, 8);
}

/** qin_official: { rect, front, seed, open } — an official's house on a raised earth platform, a gate, a hall with a porch of columns. */
export function official(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.65, P = 0.9, H = 4.0, open = !!el.open;
  const uD = W / 2, cv = 6.5;
  // the gate: a bay on the street wall with a tile roof, doors of red lacquer
  F.b('earth_wall', 0, 0, 0, uD - 1.6, 2.9, th); F.b('earth_wall', uD + 1.6, 0, 0, W, 2.9, th);
  F.b('timber_red', uD - 1.6, 2.4, 0, uD + 1.6, 3.2, th, false);
  for (const s of [-1, 1]) F.b('timber_red', uD + s * 1.6 - 0.15, 0, -0.05, uD + s * 1.6 + 0.15, 3.2, th + 0.05, true);
  if (!open) F.b('lacquer_red', uD - 1.45, 0.02, 0.2, uD + 1.45, 2.4, 0.32);
  gable(F, uD - 2.4, -0.2, uD + 2.4, th + 0.3, 3.2, 1.0, 'tile_grey', 0.5);
  F.b('earth_wall', 0, 0, th, th, 2.9, D); F.b('earth_wall', W - th, 0, th, W, 2.9, D); F.b('earth_wall', 0, 0, D - th, W, 2.9, D);
  footing(F, 0, 0, W, 0);
  // the hall on its platform
  const hu0 = 2.2, hu1 = W - 2.2, hv0 = cv, hv1 = Math.min(D - 2.2, cv + 9);
  F.b('earth_wall', hu0 - 0.8, 0, hv0 - 0.8, hu1 + 0.8, P, hv1 + 0.8, true);
  F.b('brick_grey', hu0 - 0.85, P - 0.08, hv0 - 0.85, hu1 + 0.85, P + 0.04, hv1 + 0.85, false);
  const wallsH = 3.6;
  F.b('palace_wall', hu0, P, hv1 - th, hu1, P + wallsH, hv1); F.b('palace_wall', hu0, P, hv0, hu0 + th, P + wallsH, hv1); F.b('palace_wall', hu1 - th, P, hv0, hu1, P + wallsH, hv1);
  const dc = (hu0 + hu1) / 2;
  F.b('palace_wall', hu0 + th, P, hv0, dc - 1.2, P + wallsH, hv0 + th); F.b('palace_wall', dc + 1.2, P, hv0, hu1 - th, P + wallsH, hv0 + th); F.b('timber_red', dc - 1.2, P + 2.4, hv0, dc + 1.2, P + wallsH, hv0 + th, false);
  for (let u = hu0; u <= hu1 + 0.01; u += (hu1 - hu0) / 4) { F.b('timber_red', u - 0.2, P, hv0 - 1.4, u + 0.2, P + wallsH, hv0 - 1.0); }
  F.b('lacquer_black', hu0 - 0.3, P + wallsH + 0.02, hv0 - 1.5, hu1 + 0.3, P + wallsH + 0.37, hv0 - 0.9, false);
  F.col.ramp(F.R(dc - 2, hv0 - 4.8, dc + 2, hv0 - 0.8), 0, P, F.rise);
  for (let i = 0; i < 5; i++) F.b('brick_grey', dc - 2, 0, hv0 - 4.8 + i * 0.8, dc + 2, (i + 1) * 0.18, hv0 - 4.0 + i * 0.8, false);
  F.b('earth_wall', hu0 - 0.6, P + wallsH, hv0 - 1.5, hu1 + 0.6, P + wallsH + 0.01, hv1 + 0.6, false);
  gable(F, hu0 - 0.6, hv0 - 1.5, hu1 + 0.6, hv1 + 0.2, P + wallsH + 0.3, 2.3, 'tile_grey', 0.9);
  if (open) { F.b('reed_mat', hu0 + th + 1, P + 0.08, hv0 + th + 1, hu1 - th - 1, P + 0.11, hv1 - th - 1, false); F.b('lacquer_black', dc - 1.2, P + 0.05, hv1 - th - 1.6, dc + 1.2, P + 0.6, hv1 - th - 0.3); F.b('lacquer_red', dc - 1.0, P + 0.6, hv1 - th - 1.5, dc + 1.0, P + 0.66, hv1 - th - 0.4, false); }
  F.lathe('bronze', [[0.001, 0], [0.4, 0.05], [0.5, 0.5], [0.001, 0.55]], dc + 4, 0, 3.4, 12);
  void rand;
}

/** qin_granary: { rect, front, seed } — a granary (cang): a floor of planks on posts and a stone footing, walls of boards, a thatched roof, a ladder. */
export function granary(el, ctx) {
  const { bag } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, ctx.col), W = F.W, D = F.D;
  const w = Math.min(W - 2, 6), d = Math.min(D - 4, 6), u0 = (W - w) / 2, v0 = 3, h = 0.9, H = 2.6;
  for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) F.b('brick_grey', u0 + i * (w - 0.4) / 3, 0, v0 + j * (d - 0.4) / 3, u0 + i * (w - 0.4) / 3 + 0.4, h, v0 + j * (d - 0.4) / 3 + 0.4, i === 0 || j === 0 || i === 3 || j === 3);
  F.b('timber', u0 - 0.1, h, v0 - 0.1, u0 + w + 0.1, h + 0.15, v0 + d + 0.1);
  F.b('planks_grey', u0, h + 0.15, v0, u0 + w, h + H, v0 + d);
  F.b('timber', u0 + w / 2 - 0.6, h + 0.15, v0 - 0.04, u0 + w / 2 + 0.6, h + 1.9, v0 + 0.02, false);
  gable(F, u0, v0, u0 + w, v0 + d, h + H, 1.5, 'thatch', 0.7);
  F.b('timber', u0 + w / 2 - 0.3, 0, v0 - 1.2, u0 + w / 2 - 0.2, 0.2, v0 - 0.2, false);
  for (let k = 0; k < 4; k++) F.b('timber', u0 + w / 2 - 0.5, 0.2 + k * 0.1, v0 - 1.4 + k * 0.28, u0 + w / 2 + 0.5, 0.3 + k * 0.1, v0 - 1.2 + k * 0.28, false);
  void rand;
}

/** qin_garden: { rect, front, seed } — a fenced plot of vegetables, a well and a coop. */
export function garden(el, ctx) {
  const { bag } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, ctx.col), W = F.W, D = F.D;
  for (const [a, b, c, d] of [[0, 0, W, 0.1], [0, D - 0.1, W, D], [0, 0, 0.1, D], [W - 0.1, 0, W, D]]) F.b('timber', a, 0, b, c, 1.1, d, false);
  for (let u = 0; u < W; u += 1.6) for (const v of [0, D - 0.1]) F.b('timber', u, 0, v - 0.05, u + 0.12, 1.4, v + 0.15, false);
  for (let i = 0; i < 4; i++) F.b('earth_wall', 1.5 + i * 2.2, 0, 3, 2.5 + i * 2.2, 0.25, D - 3, false);
  for (let i = 0; i < 4; i++) F.b('cloth_green', 1.6 + i * 2.2, 0.25, 3.1, 2.4 + i * 2.2, 0.55, D - 3.1, false);
  F.b('brick_grey', W - 2.2, 0, D - 2.4, W - 1.2, 0.6, D - 1.4);
  void rand;
}
