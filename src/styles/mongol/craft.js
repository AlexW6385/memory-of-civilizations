// Karakorum's objects (docs/settlements/mongol-karakorum.md §4, §6): the silver tree of William Buchier, the nine-tailed banner,
// the stone tortoise, kilns and forges of the Cathayan quarter, pens.
import { box, rod, lathe, obox, rng, TAU } from './util.js';
import { tube, blob } from '../chinese/statues.js';
import { fromTriangles, addCloth, clothBox } from '../../core/geom.js';

const S = 'silver';
/**
 * silver_tree: the drink-flowing tree [stated: Rubruck / William Buchier, Public Domain Review]: a silver trunk wrapped in four silver serpents
 * with branches, leaves and fruit; an angel with a trumpet above; four silver lions at the root belching white mare's milk; four pipes from
 * the branches pouring wine, qara qumiss, rice wine and mead into silver basins. { c, y, h (default 5.2) }
 */
export function silverTree(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, h = el.h ?? 5.2, rand = rng(el.seed || 3);
  // the low platform of boards, eight-sided, edged in silver
  const plat = lathe([[2.3, 0], [2.3, 0.18], [2.15, 0.2], [0.001, 0.2]], 8, null, cx, y, cz); bag.add('timber', plat);
  bag.add(S, lathe([[2.34, 0.14], [2.34, 0.2], [2.28, 0.2], [2.28, 0.14]], 8, null, cx, y, cz));
  const Y = y + 0.2;
  col.floor([cx - 1.55, cz - 1.55, cx + 1.55, cz + 1.55], Y);
  // the trunk, rising from a flared root
  bag.add(S, lathe([[0.62, 0], [0.4, 0.3], [0.32, 0.9], [0.27, h * 0.7], [0.22, h * 0.86], [0.001, h * 0.9]], 14, null, cx, Y, cz));
  col.circle(cx, cz, 0.45, Y, Y + h);
  // four serpents spiralling up the trunk to the crown, heads at the top
  for (let k = 0; k < 4; k++) {
    const ph = k * TAU / 4, N = 26;
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = ph + t * TAU * 2.1, rho = 0.34 - t * 0.1, p = [cx + Math.cos(a) * rho, Y + 0.4 + t * (h * 0.78), cz + Math.sin(a) * rho];
      if (prev) bag.add(S, rod(prev, p, 0.065 - t * 0.02, 6)); prev = p;
    }
    bag.add(S, lathe([[0.001, 0], [0.07, 0.05], [0.09, 0.14], [0.001, 0.22]], 8, null, prev[0], prev[1], prev[2]));
  }
  // branches: four main ones outward and up, each ending in a spout bent down over a basin; leaves and fruit along them
  const topY = Y + h * 0.7;
  for (let k = 0; k < 4; k++) {
    const a = k * TAU / 4 + TAU / 8, ux = Math.cos(a), uz = Math.sin(a);
    const P = [[cx, topY - 0.2, cz], [cx + ux * 0.6, topY + 0.15, cz + uz * 0.6], [cx + ux * 1.2, topY + 0.2, cz + uz * 1.2], [cx + ux * 1.7, topY - 0.15, cz + uz * 1.7]];
    for (let i = 0; i < 3; i++) bag.add(S, rod(P[i], P[i + 1], 0.07 - i * 0.015, 6));
    // the pipe: a spout bent down, the stream of drink falling into the basin
    const sp = P[3]; bag.add(S, rod(sp, [sp[0] + ux * 0.1, sp[1] - 0.25, sp[2] + uz * 0.1], 0.04, 6));
    bag.add('water_jet', rod([sp[0] + ux * 0.1, sp[1] - 0.25, sp[2] + uz * 0.1], [sp[0] + ux * 0.1, Y + 0.62, sp[2] + uz * 0.1], 0.012, 4));
    // the basin on the platform below the spout
    const bx = sp[0] + ux * 0.1, bz = sp[2] + uz * 0.1;
    bag.add(S, lathe([[0.001, 0], [0.2, 0.02], [0.46, 0.4], [0.5, 0.5], [0.44, 0.5], [0.38, 0.4], [0.001, 0.1]], 14, null, bx, Y, bz));
    bag.add(['cloth_red', 'cloth_white', 'cloth_ochre', 'water_jet'][k], lathe([[0.001, 0], [0.42, 0]], 12, null, bx, Y + 0.47, bz));
    col.circle(bx, bz, 0.5, Y, Y + 0.5);
    // twigs with leaves and fruit
    for (let q = 0; q < 8; q++) {
      const f = 0.3 + rand() * 0.7, bp = [P[1][0] + (P[2][0] - P[1][0]) * f, P[1][1] + (P[2][1] - P[1][1]) * f, P[1][2] + (P[2][2] - P[1][2]) * f];
      const ta = a + (rand() - 0.5) * 2.2, tu = [Math.cos(ta) * 0.45, 0.2 + rand() * 0.35, Math.sin(ta) * 0.45], e = [bp[0] + tu[0], bp[1] + tu[1], bp[2] + tu[2]];
      bag.add(S, rod(bp, e, 0.016, 4));
      bag.add(S, lathe([[0.001, 0], [0.07, 0.04], [0.001, 0.16]], 6, null, e[0], e[1], e[2]));
      if (q % 2) bag.add('gilt_bronze', lathe([[0.001, 0], [0.05, 0.03], [0.05, 0.08], [0.001, 0.11]], 6, null, e[0], e[1] - 0.12, e[2]));
    }
  }
  // the crown and the angel with the trumpet at the top (gilt on silver)
  const cy = Y + h * 0.86;
  bag.add(S, lathe([[0.22, 0], [0.34, 0.1], [0.18, 0.3], [0.001, 0.34]], 10, null, cx, cy, cz));
  const ay = cy + 0.34;
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.16, 0.05], [0.13, 0.5], [0.07, 0.62], [0.001, 0.64]], 10, null, cx, ay, cz));
  bag.add('skin_light', lathe([[0.001, 0], [0.07, 0.03], [0.08, 0.1], [0.04, 0.17], [0.001, 0.18]], 8, null, cx, ay + 0.62, cz));
  for (const s of [-1, 1]) {
    const w = [cx, ay + 0.5, cz, cx + s * 0.55, ay + 0.95, cz + 0.02, cx + s * 0.38, ay + 0.28, cz + 0.02, cx, ay + 0.5, cz, cx + s * 0.38, ay + 0.28, cz + 0.02, cx + s * 0.55, ay + 0.95, cz + 0.02];
    bag.add('gilt_bronze', fromTriangles(w));
  }
  bag.add('gilt_bronze', rod([cx + 0.1, ay + 0.55, cz - 0.08], [cx + 0.1, ay + 0.72, cz - 0.4], 0.03, 5));
  bag.add(S, lathe([[0.02, 0], [0.04, 0.2], [0.16, 0.9]], 8, null, 0, 0, 0).rotateX(-Math.PI / 2 * 0.8).translate(cx + 0.1, ay + 0.72, cz - 0.4));
  // the four lions at the roots, each belching a white stream into a lip of the trunk's pool
  for (let k = 0; k < 4; k++) {
    const a = k * TAU / 4, ux = Math.cos(a), uz = Math.sin(a);
    lion(bag, cx + ux * 1.45, Y, cz + uz * 1.45, Math.atan2(ux, uz));
    col.circle(cx + ux * 1.45, cz + uz * 1.45, 0.5, Y, Y + 1.2);
  }
}
/** A silver lion couchant about 1.2 m long at (x, y, z) facing yaw (0 = +z): body, haunch, chest, head with mane, forelegs, tail; white stream from the mouth. */
function lion(bag, x, y, z, yaw) {
  const put = (g) => g.rotateY(yaw).translate(x, y, z);
  const body = blob([0, 0.5, -0.1], 0.28, 0.32, 0.55, 12, 7), chest = blob([0, 0.58, 0.32], 0.26, 0.34, 0.26, 10, 6), hind = blob([0, 0.42, -0.5], 0.3, 0.3, 0.3, 10, 6);
  const head = blob([0, 0.84, 0.62], 0.2, 0.22, 0.22, 10, 6), mane = blob([0, 0.82, 0.48], 0.34, 0.36, 0.26, 10, 6), muzzle = blob([0, 0.76, 0.82], 0.11, 0.1, 0.13, 8, 5);
  for (const g of [body, chest, hind, head, mane, muzzle]) bag.add('silver', put(g));
  for (const s of [-1, 1]) { bag.add('silver', put(tube([[s * 0.14, 0.4, 0.3, 0.07], [s * 0.14, 0.12, 0.62, 0.06], [s * 0.14, 0.05, 0.8, 0.06]], 6))); bag.add('silver', put(tube([[s * 0.2, 0.3, -0.5, 0.1], [s * 0.2, 0.06, -0.3, 0.07]], 6))); }
  bag.add('silver', put(tube([[0, 0.4, -0.8, 0.04], [0, 0.3, -1.05, 0.035], [0.08, 0.5, -1.2, 0.05]], 5)));
  // the milk: a white stream falling from the mouth to the platform
  bag.add('foam', put(tube([[0, 0.74, 0.92, 0.02], [0, 0.55, 1.05, 0.02], [0, 0.22, 1.12, 0.025]], 5)));
}
/** tug: the nine-tailed white banner of the Mongols: a tall pole with an iron spear head and a boss of horsehair, tassels streaming in the wind. { at, y, h } */
export function tug(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 7;
  bag.add('timber', lathe([[0.1, 0], [0.07, h]], 8, null, x, y, z)); col.circle(x, z, 0.12, y, y + h);
  bag.add('granite_grey', lathe([[0.4, 0], [0.4, 0.2]], 8, null, x, y, z));
  bag.add('iron', lathe([[0.001, 0], [0.09, 0.05], [0.04, 0.3], [0.001, 0.6]], 6, null, x, y + h, z));
  bag.add('hide_black', lathe([[0.2, 0], [0.26, 0.15], [0.2, 0.3], [0.001, 0.34]], 8, null, x, y + h - 0.4, z));
  for (let k = 0; k < 9; k++) {
    const a = k / 9 * TAU, g = clothBox(x + Math.cos(a) * 0.2 - 0.03, y + h - 2.6, z + Math.sin(a) * 0.2 - 0.03, x + Math.cos(a) * 0.2 + 0.03, y + h - 0.4, z + Math.sin(a) * 0.2 + 0.03, 0.3);
    addCloth(bag, k % 3 === 0 ? 'hide_black' : 'hide_white', g, y + h - 0.4);
  }
}
/** tortoise: a stone tortoise plinth for a stele [stated: UW: a stone tortoise plinth is one of the few surface traces]. { at, y, yaw } */
export function tortoise(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const put = (g) => g.rotateY(yaw).translate(x, y, z);
  bag.add('granite_grey', put(blob([0, 0.5, 0], 0.95, 0.5, 1.5, 14, 8)));
  bag.add('granite_grey', put(blob([0, 0.42, 1.6], 0.32, 0.3, 0.42, 10, 6)));
  for (const [sx, sz] of [[-1, 0.85], [1, 0.85], [-1, -0.85], [1, -0.85]]) bag.add('granite_grey', put(blob([sx * 0.95, 0.15, sz], 0.3, 0.16, 0.38, 8, 5)));
  bag.add('granite_grey', put(box(-0.6, 0.8, -0.2, 0.6, 3.6, 0.2)));
  col.circle(x, z, 1.2, y, y + 1);
}
/** kiln: a domed updraught kiln for tiles [stated: UW/finds: kilns for roof tiles, pipes, tableware] with its stoke-hole, flue and stacked tiles. { at, y, r, yaw } */
export function kiln(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 2.1, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  bag.add('brick_grey', lathe([[r + 0.3, 0], [r, 0.4], [r * 0.95, 1.5], [r * 0.65, 2.4], [r * 0.3, 2.9], [0.001, 3.0]], 16, null, x, y, z));
  bag.add('brick_grey', lathe([[0.5, 0], [0.4, 3.6], [0.32, 4.4]], 8, null, x + c * r * 0.0 - s * (r + 0.7), y, z + s * 0.0 + c * (r + 0.7)));
  // the stoke-hole: a low arch with embers
  const sx = x + s * (r + 0.1), sz = z + c * (r + 0.1);
  bag.add('opening', obox([sx - c * 0.4, sz + s * 0.4], [sx + c * 0.4, sz - s * 0.4], 0.3, y, y + 0.8));
  bag.add('flame', obox([sx - c * 0.25 + s * 0.12, sz + s * 0.25 + c * 0.12], [sx + c * 0.25 + s * 0.12, sz - s * 0.25 + c * 0.12], 0.04, y + 0.1, y + 0.4));
  col.circle(x, z, r + 0.4, y, y + 3);
}
/** tile_stack: roof tiles stacked on edge in rows, and a heap of clay. { rect, y, n } */
export function tileStack(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rows = el.rows ?? 5;
  for (let k = 0; k < rows; k++) bag.add(k % 2 ? 'tile_grey' : 'tile_dark', box(x0, y + k * 0.24, z0, x1, y + (k + 1) * 0.24 - 0.01, z1));
  col.rect(el.rect, y, y + rows * 0.24);
}
/** forge: an open smithy [stated: UW: metalworking with water-powered bellows] — four posts, a plank roof, a clay hearth with embers, bellows, an anvil on a block, a quenching tub, charcoal. { rect, y, seed } */
export function forge(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 2.7;
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { bag.add('timber', rod([px, y, pz], [px, y + H, pz], 0.1, 6)); col.circle(px, pz, 0.1, y, y + H); }
  bag.add('timber', box(x0 - 0.3, y + H, z0 - 0.3, x1 + 0.3, y + H + 0.14, z1 + 0.3));
  bag.add('planks_grey', box(x0 - 0.4, y + H + 0.14, z0 - 0.4, x1 + 0.4, y + H + 0.26, z1 + 0.4));
  bag.add('brick_grey', box(x0 + 0.3, y, z0 + 0.2, x0 + 1.5, y + 0.9, z0 + 1.2)); col.rect([x0 + 0.3, z0 + 0.2, x0 + 1.5, z0 + 1.2], y, y + 0.9);
  bag.add('flame', box(x0 + 0.55, y + 0.9, z0 + 0.4, x0 + 1.25, y + 0.97, z0 + 1.0));
  bag.add('hide_brown', lathe([[0.001, 0], [0.25, 0.05], [0.28, 0.25], [0.12, 0.45], [0.001, 0.5]], 8, null, x0 + 1.9, y + 0.4, z0 + 0.7));
  bag.add('log_pine', lathe([[0.3, 0], [0.28, 0.6]], 8, null, cx + 0.5, y, cz + 0.4)); bag.add('iron', box(cx + 0.28, y + 0.6, cz + 0.3, cx + 0.72, y + 0.72, cz + 0.5)); col.circle(cx + 0.5, cz + 0.4, 0.34, y, y + 0.7);
  bag.add('wood_dark', lathe([[0.4, 0], [0.4, 0.5], [0.001, 0.5]], 10, null, x1 - 0.8, y, z1 - 0.7)); col.circle(x1 - 0.8, z1 - 0.7, 0.42, y, y + 0.5);
  bag.add('bark_dark', lathe([[0.7, 0], [0.5, 0.35], [0.001, 0.5]], 8, null, x1 - 0.9, y, z0 + 0.8));
  lights?.push({ at: [x0 + 0.9, y + 1.3, z0 + 0.7], color: '#ff8a3a', intensity: 2, distance: 7 });
}
/** pen: a pen of poles and rails (hurdles), { rect, y, gate ('s' etc), h }; posts every 2 m, two rails, a gap for the gate. */
export function pen(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 1.1, gate = el.gate ?? 's';
  const sides = [['n', [x0, z0], [x1, z0]], ['s', [x0, z1], [x1, z1]], ['w', [x0, z0], [x0, z1]], ['e', [x1, z0], [x1, z1]]];
  for (const [sd, a, b] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 2));
    const gap = sd === gate ? [L / 2 - 1.1, L / 2 + 1.1] : null;
    for (let i = 0; i <= n; i++) { const u = L * i / n; if (gap && u > gap[0] + 0.05 && u < gap[1] - 0.05) continue; const p = [a[0] + (b[0] - a[0]) * u / L, a[1] + (b[1] - a[1]) * u / L]; bag.add('timber', rod([p[0], y, p[1]], [p[0], y + h + 0.1, p[1]], 0.06, 5)); }
    for (const hh of [h * 0.45, h * 0.85]) {
      const seg = gap ? [[0, gap[0]], [gap[1], L]] : [[0, L]];
      for (const [u0, u1] of seg) { const pa = [a[0] + (b[0] - a[0]) * u0 / L, a[1] + (b[1] - a[1]) * u0 / L], pb = [a[0] + (b[0] - a[0]) * u1 / L, a[1] + (b[1] - a[1]) * u1 / L]; bag.add('timber', rod([pa[0], y + hh, pa[1]], [pb[0], y + hh, pb[1]], 0.035, 5)); }
    }
    const seg = gap ? [[0, gap[0]], [gap[1], L]] : [[0, L]];
    for (const [u0, u1] of seg) col.segment([a[0] + (b[0] - a[0]) * u0 / L, a[1] + (b[1] - a[1]) * u0 / L], [a[0] + (b[0] - a[0]) * u1 / L, a[1] + (b[1] - a[1]) * u1 / L], 0.1, y, y + h);
  }
}
void blob;

/** coffer_cart: the tall cart of the Mongols [stated: Rubruck: felt-covered coffers on tall carts, an axle like a ship's mast]: two great spoked wheels, a plank bed, a chest roofed with black felt, the pole forward (+z). { at, y, yaw, goods } */
export function cofferCart(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  const P = (u, v) => [x + c * u + s * v, z - s * u + c * v];      // u across, v along (+ forward)
  for (const sd of [-1, 1]) {
    const o = P(sd * 1.05, 0);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; bag.add('wood_dark', rod([o[0] + s * Math.cos(a) * 0.1, y + 0.9 + Math.sin(a) * 0.1, o[1] + c * Math.cos(a) * 0.1], [o[0] + s * Math.cos(a) * 0.84, y + 0.9 + Math.sin(a) * 0.84, o[1] + c * Math.cos(a) * 0.84], 0.028, 5)); }
    for (let k = 0; k < 20; k++) { const a0 = k / 20 * TAU, a1 = (k + 1) / 20 * TAU; bag.add('wood_dark', rod([o[0] + s * Math.cos(a0) * 0.9, y + 0.9 + Math.sin(a0) * 0.9, o[1] + c * Math.cos(a0) * 0.9], [o[0] + s * Math.cos(a1) * 0.9, y + 0.9 + Math.sin(a1) * 0.9, o[1] + c * Math.cos(a1) * 0.9], 0.06, 4)); }
    col.circle(o[0], o[1], 0.35, y, y + 1.8);
  }
  const a = P(-1.15, 0), b = P(1.15, 0); bag.add('timber', rod([a[0], y + 0.9, a[1]], [b[0], y + 0.9, b[1]], 0.1, 7));
  bag.add('wood_dark', obox(P(0, -1.6), P(0, 1.6), 1.9, y + 1.05, y + 1.2));
  bag.add('hide_black', obox(P(0, -1.0), P(0, 1.0), 1.5, y + 1.2, y + 2.2));
  const f1 = P(0, -1.0), f2 = P(0, 1.0);
  bag.add('hide_black', obox(f1, f2, 1.0, y + 2.2, y + 2.6));
  bag.add('cloth_white', obox(P(0, -0.6), P(0, 0.6), 0.5, y + 2.6, y + 2.7));
  for (const sd of [-0.4, 0.4]) { const p = P(sd, 1.6), q = P(sd, 4.2); bag.add('timber', rod([p[0], y + 1.1, p[1]], [q[0], y + 0.5, q[1]], 0.05, 6)); }
  col.segment(P(0, -1.6), P(0, 1.6), 1.9, y, y + 2.7);
}
