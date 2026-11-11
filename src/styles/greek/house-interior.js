// A house of Athens about 410 BC that one can walk into (docs/settlements/athens.md §5b): the house and shop by
// the south-west corner of the Agora that the finds name Simon's — the shoemaker's shop on the street with his
// bench, lasts, hobnails and leather; the passage to the court with its altar, well-head and storage jar; the andron
// with its offset door, the raised cement border round a pebble floor, seven couches with their tables, the krater
// in the middle, the lamp on its stand; across the court the room of the loom, the kitchen with its hearth, the store.

import { STYLES } from '../../core/build.js';
import { box, lathe, frustum } from '../../core/geom.js';
import { gables } from './town.js';
import { furnishShop } from './shops.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Walls along x or z with doorways: run [a, b] at fixed c, thickness t, `doors` [[u0, u1]] along the run. */
function wallRun(ctx, alongX, c, a, b, t, y, H, doors, mat) {
  const { bag, col } = ctx, ds = [...doors].sort((p, q) => p[0] - q[0]);
  const seg = (u0, u1, y0, y1, m) => { if (u1 - u0 < 0.01) return; const r = alongX ? [u0, c - t / 2, u1, c + t / 2] : [c - t / 2, u0, c + t / 2, u1]; bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  let u = a;
  for (const [d0, d1] of ds) {
    seg(u, d0, y - 0.6, y + 0.7, 'rubble'); seg(u, d0, y + 0.7, y + H, mat);
    seg(d0, d1, y + 2.2, y + H, mat);
    const r = alongX ? [d0 - 0.1, c - t / 2 - 0.02, d1 + 0.1, c + t / 2 + 0.02] : [c - t / 2 - 0.02, d0 - 0.1, c + t / 2 + 0.02, d1 + 0.1];
    bag.add('timber', box(r[0], y + 2.08, r[1], r[2], y + 2.22, r[3]));                     // the lintel
    const th = alongX ? [d0, c - t / 2, d1, c + t / 2] : [c - t / 2, d0, c + t / 2, d1];
    bag.add('limestone', box(th[0], y - 0.1, th[1], th[2], y + 0.04, th[3]));              // the worn threshold
    u = d1;
  }
  seg(u, b, y - 0.6, y + 0.7, 'rubble'); seg(u, b, y + 0.7, y + H, mat);
}
/** A range of rooms under one tiled roof pitched both ways, its timber ceiling at y + H. */
export function rangeRoof({ bag }, r, y, H) {
  const along = r[2] - r[0] > r[3] - r[1], rise = (along ? r[3] - r[1] : r[2] - r[0]) * 0.28;
  bag.add('timber', box(r[0] + 0.05, y + H - 0.12, r[1] + 0.05, r[2] - 0.05, y + H, r[3] - 0.05));
  bag.add('roof_tile', frustum([r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3], y + H, y + H + rise, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? (r[3] - r[1]) / 2 + 0.25 : 0, along ? (r[3] - r[1]) / 2 + 0.25 : 0));
  bag.add('mud_plaster', gables(r, y + H, rise, along));
}

// ── the furniture ────────────────────────────────────────────────────────────────────────────
/** A couch (kline) along u: frame on four legs cut in the "rectangular" manner, the mattress, a striped cover, the cushion at the head (the left end, u0). */
export function kline(bag, col, x0, z0, x1, z1, y, headAtMin, rand) {
  const alongX = x1 - x0 > z1 - z0, H = 0.62;
  for (const [lx, lz] of [[x0 + 0.06, z0 + 0.06], [x1 - 0.12, z0 + 0.06], [x0 + 0.06, z1 - 0.12], [x1 - 0.12, z1 - 0.12]]) {
    bag.add('wood_dark', box(lx, y, lz, lx + 0.06, y + H - 0.14, lz + 0.06));
    bag.add('wood_dark', box(lx - 0.015, y + H - 0.32, lz - 0.015, lx + 0.075, y + H - 0.26, lz + 0.075));
  }
  bag.add('wood_dark', box(x0, y + H - 0.14, z0, x1, y + H - 0.06, z1));
  bag.add('linen', box(x0 + 0.03, y + H - 0.06, z0 + 0.03, x1 - 0.03, y + H + 0.06, z1 - 0.03));
  const cover = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][Math.floor(rand() * 4)];
  if (alongX) bag.add(cover, box(x0 + 0.5, y + H + 0.06, z0 + 0.02, x1 - 0.1, y + H + 0.08, z1 - 0.02));
  else bag.add(cover, box(x0 + 0.02, y + H + 0.06, z0 + 0.5, x1 - 0.02, y + H + 0.08, z1 - 0.1));
  // the head-rest raised at one end and the cushion folded over it
  const hx = headAtMin ? (alongX ? x0 : z0) : (alongX ? x1 : z1);
  if (alongX) { const a = headAtMin ? x0 : x1 - 0.08; bag.add('wood_dark', box(a, y + H - 0.06, z0, a + 0.08, y + H + 0.3, z1)); }
  else { const a = headAtMin ? z0 : z1 - 0.08; bag.add('wood_dark', box(x0, y + H - 0.06, a, x1, y + H + 0.3, a + 0.08)); }
  const pc = alongX ? [hx + (headAtMin ? 0.28 : -0.28), (z0 + z1) / 2] : [(x0 + x1) / 2, hx + (headAtMin ? 0.28 : -0.28)];
  const cushion = lathe([[0.001, -0.3], [0.1, -0.29], [0.13, -0.2], [0.13, 0.2], [0.1, 0.29], [0.001, 0.3]], 10);
  cushion.rotateZ(Math.PI / 2);
  if (alongX) cushion.rotateY(Math.PI / 2);
  bag.add(['cloth_white', 'cloth_red', 'cloth_indigo'][Math.floor(rand() * 3)], cushion.scale(1, 0.75, 1).translate(pc[0], y + H + 0.14, pc[1]));
  col.rect([x0, z0, x1, z1], y, y + H + 0.1);
}
/** A low three-legged table (trapeza) with cups and a dish of food on it. */
export function trapeza(bag, x, z, y, alongX, rand) {
  const w = alongX ? 0.75 : 0.42, d = alongX ? 0.42 : 0.75, h = 0.48;
  bag.add('wood_dark', box(x - w / 2, y + h - 0.04, z - d / 2, x + w / 2, y + h, z + d / 2));
  const legs = alongX ? [[x - w / 2 + 0.06, z], [x + w / 2 - 0.08, z - d / 2 + 0.06], [x + w / 2 - 0.08, z + d / 2 - 0.08]] : [[x, z - d / 2 + 0.06], [x - w / 2 + 0.06, z + d / 2 - 0.08], [x + w / 2 - 0.08, z + d / 2 - 0.08]];
  for (const [lx, lz] of legs) bag.add('wood_dark', box(lx - 0.025, y, lz - 0.025, lx + 0.025, y + h - 0.04, lz + 0.025));
  // a kylix or two (the black-glazed cup on its stem), a dish of bread and fruit
  const kylix = lathe([[0.001, 0], [0.035, 0], [0.035, 0.008], [0.01, 0.02], [0.009, 0.045], [0.06, 0.06], [0.1, 0.085], [0.095, 0.088], [0.055, 0.066], [0.001, 0.06]], 14);
  for (let k = 0; k < 1 + (rand() < 0.5 ? 1 : 0); k++) bag.add('pottery_dark', kylix.clone().translate(x + (alongX ? (k ? 0.2 : -0.18) : 0), y + h, z + (alongX ? 0 : (k ? 0.2 : -0.18))));
  bag.add('terracotta', lathe([[0.001, 0], [0.09, 0.0], [0.12, 0.03], [0.11, 0.032], [0.001, 0.012]], 12, null, x + (alongX ? 0.02 : 0.03), y + h, z + (alongX ? 0.03 : 0.02)));
  bag.add('paint_ochre', lathe([[0.001, 0], [0.05, 0.0], [0.045, 0.03], [0.001, 0.04]], 8, null, x + (alongX ? 0.02 : 0.03), y + h + 0.012, z + (alongX ? 0.03 : 0.02)));
}
/** A bell krater on the floor, its ladle; black with a band of red-figure (the clay's red). */
export function krater(bag, col, x, z, y) {
  bag.add('pottery_dark', lathe([[0.001, 0], [0.13, 0], [0.13, 0.05], [0.08, 0.08], [0.1, 0.12], [0.16, 0.2], [0.2, 0.32], [0.24, 0.46], [0.28, 0.52], [0.27, 0.535], [0.22, 0.48], [0.001, 0.46]], 20, null, x, y, z));
  bag.add('terracotta', lathe([[0.168, 0.22], [0.193, 0.22], [0.219, 0.4], [0.193, 0.4]], 20, null, x, y, z));
  bag.add('water', lathe([[0.001, 0], [0.225, 0], [0.001, 0.001]], 16, null, x, y + 0.44, z));
  bag.add('bronze', box(x + 0.05, y + 0.3, z - 0.012, x + 0.07, y + 0.62, z + 0.012));
  col.circle(x, z, 0.28, y, y + 0.54);
}
/** A bronze lampstand with an oil lamp burning on its top. */
export function lampstand(ctx, x, z, y, h = 1.2) {
  const { bag, lights } = ctx;
  bag.add('bronze', lathe([[0.001, 0], [0.16, 0], [0.12, 0.05], [0.02, 0.08], [0.015, h - 0.05], [0.07, h - 0.02], [0.08, h], [0.001, h]], 10, null, x, y, z));
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.005], [0.055, 0.025], [0.02, 0.04], [0.001, 0.04]], 10, null, x, y + h, z));
  bag.add('terracotta', box(x + 0.03, y + h + 0.01, z - 0.015, x + 0.09, y + h + 0.03, z + 0.015));
  bag.add('flame', lathe([[0.001, 0], [0.01, 0.01], [0.001, 0.045]], 6, null, x + 0.085, y + h + 0.03, z));
  lights.push({ at: [x, y + h + 0.25, z], color: '#ffb46b', intensity: 2.2, distance: 6 });
}
/** The warp-weighted loom against a wall (facing +z from the wall at z0): two uprights leaning, the cloth beam, the warp, the heddle bar, the row of pyramidal loom weights. */
export function loom(bag, col, x, z0, y, w = 1.6) {
  const lean = 0.35, H = 2.0;
  for (const s of [-1, 1]) bag.add('timber', box(x + s * w / 2 - 0.05, y, z0 + lean - 0.05, x + s * w / 2 + 0.05, y + 0.1, z0 + lean + 0.05).translate(0, 0, 0)), bag.add('timber', (() => { const g = box(-0.04, 0, -0.04, 0.04, H, 0.04); g.rotateX(-Math.atan2(lean - 0.05, H)); g.translate(x + s * w / 2, y, z0 + lean); return g; })());
  bag.add('timber', lathe([[0.05, 0], [0.05, w + 0.3], [0.001, w + 0.3]], 8).rotateZ(Math.PI / 2).translate(x + w / 2 + 0.15, y + H - 0.05, z0 + 0.09));
  // the woven cloth at the top, the warp threads below it as a thin sheet, the heddle bar
  bag.add('cloth_white', box(x - w / 2 + 0.08, y + 1.3, z0 + 0.08, x + w / 2 - 0.08, y + H - 0.1, z0 + 0.1));
  bag.add('cloth_ochre', box(x - w / 2 + 0.08, y + 1.55, z0 + 0.1, x + w / 2 - 0.08, y + 1.62, z0 + 0.105));
  bag.add('linen', box(x - w / 2 + 0.08, y + 0.5, z0 + 0.17, x + w / 2 - 0.08, y + 1.3, z0 + 0.18));
  bag.add('timber', box(x - w / 2 - 0.05, y + 1.05, z0 + 0.22, x + w / 2 + 0.05, y + 1.09, z0 + 0.26));
  const weight = lathe([[0.001, 0], [0.04, 0], [0.025, 0.09], [0.001, 0.1]], 4);
  for (let u = x - w / 2 + 0.14; u < x + w / 2 - 0.1; u += 0.11) bag.add('terracotta', weight.clone().translate(u, y + 0.38 + ((u * 37) % 0.06), z0 + 0.3));
  col.rect([x - w / 2 - 0.1, z0, x + w / 2 + 0.1, z0 + lean + 0.1], y, y + H);
}

/**
 * simon_house: { rect: [x0, z0, x1, z1] (13 × 14 m, the street on the north, z0), y, seed } — see the header.
 * Rooms: the shop and the passage and the andron on the street; the court; the loom room, the kitchen, the store.
 */
function simonHouse(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, y = el.y ?? 0, H = 3.2, t = 0.5, ti = 0.4, rand = rng(el.seed || 410), wm = 'mud_plaster';
  const nz = Z0 + t + 5.0, sz = Z1 - t - 3.1;                       // the north range's inner wall, the south range's
  const xs = X0 + t + 4.5, xp = xs + ti + 1.6, xa = xp + ti;          // shop | passage | andron
  const xl = X0 + t + 4.3, xk = xl + ti + 3.4;                        // loom room | kitchen | store
  // the floors: beaten earth in the rooms, pebbles in the court
  bag.add('lime_plaster', box(X0 + t, y - 0.3, Z0 + t, X1 - t, y, nz - ti / 2)); col.floor([X0 + t, Z0 + t, X1 - t, nz], y);
  bag.add('pebbles', box(X0 + t, y - 0.3, nz + ti / 2, X1 - t, y - 0.02, sz - ti / 2)); col.floor([X0 + t, nz, X1 - t, sz], y - 0.02);
  bag.add('lime_plaster', box(X0 + t, y - 0.3, sz + ti / 2, X1 - t, y, Z1 - t)); col.floor([X0 + t, sz, X1 - t, Z1 - t], y);
  // the outer walls; on the street the shop's wide opening and the house door
  wallRun(ctx, true, Z0 + t / 2, X0, X1, t, y, H, [[X0 + t + 1.2, X0 + t + 3.3], [xs + ti + 0.3, xs + ti + 1.3]], wm);
  wallRun(ctx, true, Z1 - t / 2, X0, X1, t, y, H, [], wm);
  wallRun(ctx, false, X0 + t / 2, Z0 + t, Z1 - t, t, y, H, [], wm);
  wallRun(ctx, false, X1 - t / 2, Z0 + t, Z1 - t, t, y, H, [], wm);
  // the inner walls: the north range on the court (the shop's back door, the passage open, the andron's offset door), the partitions
  wallRun(ctx, true, nz, X0 + t, X1 - t, ti, y, H, [[X0 + t + 2.6, X0 + t + 3.5], [xs + ti, xp], [xa + 0.3, xa + 1.2]], wm);
  wallRun(ctx, false, xs + ti / 2, Z0 + t, nz - ti / 2, ti, y, H, [], wm);
  wallRun(ctx, false, xp + ti / 2, Z0 + t, nz - ti / 2, ti, y, H, [], wm);
  wallRun(ctx, true, sz, X0 + t, X1 - t, ti, y, H, [[X0 + t + 1.5, X0 + t + 2.4], [xl + ti + 1.2, xl + ti + 2.1], [xk + ti + 1.4, xk + ti + 2.3]], wm);
  wallRun(ctx, false, xl + ti / 2, sz + ti / 2, Z1 - t, ti, y, H, [], wm);
  wallRun(ctx, false, xk + ti / 2, sz + ti / 2, Z1 - t, ti, y, H, [], wm);
  rangeRoof(ctx, [X0, Z0, X1, nz + ti / 2], y, H);
  rangeRoof(ctx, [X0, sz - ti / 2, X1, Z1], y, H);
  // the street door's leaf standing open inward, the herm beside it outside
  const dx = xs + ti + 0.3;
  bag.add('wood_dark', box(dx, y + 0.04, Z0 + t, dx + 0.06, y + 2.05, Z0 + t + 0.95));
  STYLES.greek.elements.herm({ at: [dx + 1.6, Z0 - 0.5], y, rot: Math.PI }, ctx);

  const trade = el.trade ?? 'shoe';
  if (trade !== 'shoe') {
    // another trade's shop in the same room (the Agora's shop fittings): u from X0, v from Z0 on the north street
    const F = { R: (u0, v0, u1, v1) => [X0 + u0, Z0 + v0, X0 + u1, Z0 + v1], P: (u, v) => [X0 + u, Z0 + v], out: [0, -1] };
    furnishShop(ctx, F, y, t, t + 4.5, t, nz - ti / 2 - Z0, trade, rand);
  } else {
  // ── the shop: the bench, the lasts, leather, the boots and sandals on pegs, the whetstone
  const sx0 = X0 + t, sx1 = xs;
  bag.add('timber', box(sx0 + 0.2, y, Z0 + t + 1.6, sx0 + 1.6, y + 0.72, Z0 + t + 2.3)); col.rect([sx0 + 0.2, Z0 + t + 1.6, sx0 + 1.6, Z0 + t + 2.3], y, y + 0.72);
  bag.add('hide_tan', box(sx0 + 0.35, y + 0.72, Z0 + t + 1.7, sx0 + 1.0, y + 0.735, Z0 + t + 2.15));
  bag.add('hide_brown', box(sx0 + 1.05, y + 0.72, Z0 + t + 1.75, sx0 + 1.45, y + 0.73, Z0 + t + 2.05));
  const last = lathe([[0.001, 0], [0.04, 0.0], [0.045, 0.05], [0.035, 0.09], [0.001, 0.1]], 8);
  for (let k = 0; k < 4; k++) bag.add('wood_dark', last.clone().scale(1, 0.6, 2.4).translate(sx0 + 0.4 + k * 0.28, y + 0.72, Z0 + t + 2.22));
  bag.add('iron', box(sx0 + 1.2, y + 0.72, Z0 + t + 2.12, sx0 + 1.3, y + 0.74, Z0 + t + 2.2));
  bag.add('wood_dark', box(sx0 + 0.75, y, Z0 + t + 2.55, sx0 + 1.1, y + 0.3, Z0 + t + 2.9));                 // the low stool
  bag.add('limestone', box(sx0 + 1.9, y, Z0 + t + 2.6, sx0 + 2.3, y + 0.25, Z0 + t + 2.9));                  // the whetstone, worn hollow
  // sandals and boots on a shelf along the west wall, hides hung on pegs
  bag.add('timber', box(sx0, y + 1.4, Z0 + t + 0.6, sx0 + 0.3, y + 1.44, nz - ti / 2 - 0.3));
  for (let z = Z0 + t + 0.8; z < nz - 0.9; z += 0.34) {
    bag.add(rand() < 0.5 ? 'hide_brown' : 'hide_tan', box(sx0 + 0.04, y + 1.44, z, sx0 + 0.28, y + 1.47, z + 0.1));
    if (rand() < 0.5) bag.add('hide_brown', box(sx0 + 0.06, y + 1.44, z + 0.14, sx0 + 0.26, y + 1.68, z + 0.24));
  }
  for (const z of [Z0 + t + 3.2, Z0 + t + 3.9]) { bag.add('timber', box(sx1 - 0.12, y + 1.75, z - 0.02, sx1, y + 1.8, z + 0.02)); bag.add('hide_tan', box(sx1 - 0.05, y + 0.9, z - 0.3, sx1 - 0.02, y + 1.78, z + 0.3)); }
  bag.add('wicker', lathe([[0.001, 0], [0.18, 0], [0.22, 0.25], [0.2, 0.26], [0.16, 0.03], [0.001, 0.03]], 10, null, sx1 - 0.5, y, Z0 + t + 0.6));
  }

  // ── the andron: the raised border, the pebble floor, the red dado, seven couches with their tables, the krater, the lamp
  const A = [xa, Z0 + t, X1 - t, nz - ti / 2], bw = 0.9, bh = 0.12;
  const doorA = [xa + 0.3, xa + 1.2];
  for (const r of [[A[0], A[1], A[2], A[1] + bw], [A[0], A[1] + bw, A[0] + bw, A[3]], [A[2] - bw, A[1] + bw, A[2], A[3]], [doorA[1] + 0.05, A[3] - bw, A[2] - bw, A[3]], [A[0] + bw, A[3] - bw, doorA[0], A[3]]]) {
    if (r[2] - r[0] < 0.05) continue;
    bag.add('plaster_white', box(r[0], y, r[1], r[2], y + bh, r[3])); col.floor(r, y + bh);
  }
  bag.add('pebble_mosaic', box(A[0] + bw + 0.3, y + 0.0, A[1] + bw + 0.3, A[2] - bw - 0.3, y + 0.012, A[3] - bw - 0.3));
  bag.add('plaster_white', box(A[0] + bw, y, A[1] + bw, A[2] - bw, y + 0.006, A[3] - bw));
  for (const [r, o] of [[[A[0], A[1] + 0.002, A[2], A[1] + 0.014], 0], [[A[0], A[3] - 0.014, A[2], A[3] - 0.002], 0], [[A[0] + 0.002, A[1], A[0] + 0.014, A[3]], 0], [[A[2] - 0.014, A[1], A[2] - 0.002, A[3]], 0]]) bag.add('wall_red', box(r[0], y + bh, r[1], r[2], y + 1.1, r[3]));
  const yb = y + bh, cw = 0.8, cl = 1.85;
  const couches = [
    [A[0] + bw + 0.1, A[1] + 0.05, A[0] + bw + 0.1 + cl, A[1] + 0.05 + cw, true],
    [A[0] + bw + 0.2 + cl, A[1] + 0.05, A[0] + bw + 0.2 + 2 * cl, A[1] + 0.05 + cw, true],
    [A[2] - 0.05 - cw, A[1] + bw + 0.1, A[2] - 0.05, A[1] + bw + 0.1 + cl, true],
    [A[2] - 0.05 - cw, A[1] + bw + 0.2 + cl, A[2] - 0.05, Math.min(A[3] - 0.05, A[1] + bw + 0.2 + 2 * cl), true],
    [A[0] + 0.05, A[1] + bw + 0.1, A[0] + 0.05 + cw, A[1] + bw + 0.1 + cl, false],
    [A[0] + 0.05, A[1] + bw + 0.2 + cl, A[0] + 0.05 + cw, Math.min(A[3] - 0.05, A[1] + bw + 0.2 + 2 * cl), false],
    [Math.max(doorA[1] + 0.15, A[2] - bw - 0.1 - cl), A[3] - 0.05 - cw, A[2] - bw - 0.1, A[3] - 0.05, false],
  ];
  for (const [x0, z0, x1, z1, head] of couches) {
    if (x1 - x0 < 0.7 || z1 - z0 < 0.7) continue;
    kline(bag, col, x0, z0, x1, z1, yb, head, rand);
    const alongX = x1 - x0 > z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    // the table stands on the floor below the border, before the couch
    if (alongX) trapeza(bag, cx, z0 < (A[1] + A[3]) / 2 ? A[1] + bw + 0.3 : A[3] - bw - 0.3, y, true, rand);
    else trapeza(bag, x0 < (A[0] + A[2]) / 2 ? A[0] + bw + 0.3 : A[2] - bw - 0.3, cz, y, false, rand);
  }
  krater(bag, col, (A[0] + A[2]) / 2, (A[1] + A[3]) / 2, y + 0.012);
  lampstand(ctx, A[0] + bw + 0.35, A[3] - bw - 0.35, y);

  // ── the court: the altar of Zeus Herkeios, the well-head, the storage jar, a bench
  const cz0 = nz + ti / 2, cz1 = sz - ti / 2, ax = (X0 + X1) / 2 + 1.2, az = (cz0 + cz1) / 2;
  bag.add('limestone', box(ax - 0.35, y, az - 0.3, ax + 0.35, y + 0.7, az + 0.3)); bag.add('limestone', box(ax - 0.42, y + 0.7, az - 0.37, ax + 0.42, y + 0.8, az + 0.37));
  bag.add('lacquer_black', box(ax - 0.2, y + 0.8, az - 0.15, ax + 0.2, y + 0.805, az + 0.15));
  col.rect([ax - 0.42, az - 0.37, ax + 0.42, az + 0.37], y, y + 0.8);
  bag.add('limestone', lathe([[0.42, 0], [0.42, 0.62], [0.34, 0.62], [0.34, 0.5], [0.001, 0.5]], 14, null, X1 - t - 0.8, y, cz0 + 0.8)); col.circle(X1 - t - 0.8, cz0 + 0.8, 0.42, y, y + 0.62);
  bag.add('terracotta', lathe([[0.12, 0], [0.32, 0.25], [0.38, 0.6], [0.3, 0.95], [0.2, 1.05], [0.22, 1.12], [0.001, 1.1]], 12, null, X0 + t + 0.6, y, cz1 - 0.6)); col.circle(X0 + t + 0.6, cz1 - 0.6, 0.38, y, y + 1.1);
  bag.add('timber', box(X0 + t + 1.4, y, cz0 + 0.05, X0 + t + 3.2, y + 0.42, cz0 + 0.45)); col.rect([X0 + t + 1.4, cz0 + 0.05, X0 + t + 3.2, cz0 + 0.45], y, y + 0.42);

  // ── the loom room: the loom on the south wall, a stool, a basket of wool
  const lz1 = Z1 - t;
  loom(bag, col, X0 + t + 2.1, lz1 - 0.02 - 0.6, y);
  bag.add('wicker', lathe([[0.001, 0], [0.18, 0], [0.22, 0.22], [0.2, 0.23], [0.16, 0.03], [0.001, 0.03]], 10, null, X0 + t + 0.6, y, sz + 0.8));
  bag.add('cloth_white', lathe([[0.001, 0.2], [0.18, 0.2], [0.12, 0.3], [0.001, 0.32]], 10, null, X0 + t + 0.6, y, sz + 0.8));
  // the kitchen: the hearth on the floor (a ring of stones, the ash, the cooking pot on its stand), the soot above, the water jar
  const kx = (xl + ti + xk) / 2, kz = (sz + Z1 - t) / 2 + 0.3;
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; bag.add('limestone', box(kx + Math.cos(a) * 0.45 - 0.09, y, kz + Math.sin(a) * 0.45 - 0.07, kx + Math.cos(a) * 0.45 + 0.09, y + 0.12, kz + Math.sin(a) * 0.45 + 0.07)); }
  bag.add('lacquer_black', box(kx - 0.36, y, kz - 0.36, kx + 0.36, y + 0.03, kz + 0.36));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.17, 0.12], [0.15, 0.22], [0.12, 0.25], [0.13, 0.27], [0.001, 0.26]], 12, null, kx, y + 0.13, kz));
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; bag.add('iron', box(kx + Math.cos(a) * 0.13 - 0.012, y, kz + Math.sin(a) * 0.13 - 0.012, kx + Math.cos(a) * 0.13 + 0.012, y + 0.15, kz + Math.sin(a) * 0.13 + 0.012)); }
  bag.add('lacquer_black', box(kx - 1.0, y + 2.0, Z1 - t - 0.012, kx + 1.0, y + H - 0.12, Z1 - t - 0.002));
  ctx.lights.push({ at: [kx, y + 0.4, kz], color: '#ff8a3a', intensity: 1.6, distance: 4 });
  col.circle(kx, kz, 0.55, y, y + 0.4);
  bag.add('terracotta', lathe([[0.1, 0], [0.24, 0.12], [0.28, 0.42], [0.2, 0.62], [0.12, 0.66], [0.13, 0.7], [0.001, 0.7]], 12, null, xk - 0.4, y, Z1 - t - 0.4));
  // the store: amphorae leaning on the walls, a pithos sunk to its shoulders
  const amph = lathe([[0.001, 0], [0.03, 0.02], [0.1, 0.15], [0.18, 0.42], [0.17, 0.62], [0.08, 0.75], [0.05, 0.85], [0.06, 0.9], [0.001, 0.9]], 12);
  for (let k = 0; k < 5; k++) { const g = amph.clone(); g.rotateX(-0.18); bag.add('terracotta', g.translate(xk + ti + 0.35 + k * 0.42, y, Z1 - t - 0.35)); }
  bag.add('terracotta', lathe([[0.36, 0], [0.38, 0.25], [0.3, 0.42], [0.25, 0.48], [0.27, 0.52], [0.001, 0.5]], 14, null, X1 - t - 0.6, y, sz + 0.75));
  col.rect([xk + ti, Z1 - t - 0.6, X1 - t, Z1 - t], y, y + 0.9);
}

Object.assign(STYLES.greek.elements, { simon_house: simonHouse });
