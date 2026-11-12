// The village's open places and trades (docs/settlements/dogon.md §5, §6): the shade trees of the place (fig and tamarind), the
// blacksmith's forge at the outskirts (open on the south, its furnace, bellows of goatskin, anvil stone), the indigo dyers' pits with
// their cloths drying, the threshing floor with its heaps of millet heads and the pounding mortars, the goats' pen of stone and thorn,
// and the litter of the lanes: flat stones, chaff, dung, stalks, sherds.

import { box, lathe, rod } from '../../core/geom.js';
import { rng, wallRun, WALL, SMOOTH, MUD, STONE, STONE2, DARK, LOG, HOLE, STALK, THATCH, jar, basket, mortar, milletStack } from './props.js';
import { wallDress } from './dress.js';

const NOCOL = { circle() {}, rect() {}, floor() {}, segment() {}, ramp() {} };

/** shade_tree: { at: [x, z], y, r (the trunk's), h (to the crown), seed }: a fig or tamarind of the place — a thick fluted trunk with buttress roots, limbs spreading wide, a flat crown. */
export function shadeTree(el, { bag, col }) {
  const rand = rng(el.seed || 5), [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 0.6, h = el.h ?? 5.2;
  bag.add('bark_grey', lathe([[r * 1.7, -0.5], [r * 1.3, 0.3], [r * 0.85, 1.2], [r * 0.72, 2.4], [r * 0.78, h * 0.55], [r * 0.6, h * 0.62]], 12, (t, i) => 1 + 0.12 * Math.sin(t * 5 + i * 1.7 + x) + 0.06 * Math.sin(t * 11 + i), x, y, z));
  for (let k = 0; k < 5; k++) { const a = k * 1.26 + rand(); bag.add('bark_grey', rod([x + Math.cos(a) * r * 0.5, y + 1.1, z + Math.sin(a) * r * 0.5], [x + Math.cos(a) * r * 2.6, y - 0.05, z + Math.sin(a) * r * 2.6], r * 0.28, 6)); }
  const tips = [], n = 6 + Math.floor(rand() * 2);
  for (let i = 0; i < n; i++) {
    const a = i * (6.28 / n) + rand() * 0.5, R = 2.6 + rand() * 2.2, yb = y + h * 0.58, yt = y + h * 0.82 + rand() * 1.3;
    const mid = [x + Math.cos(a) * R * 0.5, yb + (yt - yb) * 0.55, z + Math.sin(a) * R * 0.5], tip = [x + Math.cos(a) * R, yt, z + Math.sin(a) * R];
    bag.add('bark_grey', rod([x, yb, z], mid, r * 0.36, 7)); bag.add('bark_grey', rod(mid, tip, r * 0.24, 6)); tips.push(tip);
    bag.add('bark_grey', rod(mid, [mid[0] + Math.cos(a + 0.7) * 1.4, mid[1] + 0.9, mid[2] + Math.sin(a + 0.7) * 1.4], r * 0.14, 5));
  }
  for (const t of tips) {
    const k = 1.0 + rand() * 0.5;
    bag.add('palm_leaf', lathe([[0.3 * k, 0], [1.7 * k, 0.2 * k], [2.2 * k, 0.65 * k], [1.6 * k, 1.15 * k], [0.7 * k, 1.35 * k], [0.001, 1.4 * k]], 9, (tt, i) => 1 + 0.22 * Math.sin(tt * 3 + i * 2.2 + t[0]), t[0], t[1] - 0.2, t[2]));
  }
  bag.add('palm_leaf', lathe([[0.3, 0], [2.2, 0.3], [2.7, 0.9], [1.8, 1.6], [0.001, 1.8]], 9, (tt, i) => 1 + 0.2 * Math.sin(tt * 3 + i * 1.3), x, y + h * 0.85, z));
  col.circle(x, z, r * 1.2, y, y + h);
}

/** forge: { at: [x, z] (the middle of the open front), y, seed }: the smith's shed, 5.4 × 3.8 m, open to the south, roofed at 2.25 m with layers of millet stalks. */
export function forge(el, { bag, col, lights }) {
  const rand = rng(el.seed || 7), [cx, cz] = el.at, y = el.y ?? 0, W = 5.4, D = 3.8, x0 = cx - W / 2, x1 = cx + W / 2, z0 = cz - D, z1 = cz, F = y + 0.08, TOP = y + 2.25;
  bag.add(MUD, box(x0 - 0.2, y - 0.4, z0, x1 + 0.2, F, z1 + 0.3)); col.floor([x0 - 0.2, z0, x1 + 0.2, z1 + 0.3], F);
  wallRun(bag, col, WALL, [x0, z0 + 0.2], [x1, z0 + 0.2], 0.45, y - 0.5, TOP + 0.1);                 // the back wall
  wallRun(bag, col, WALL, [x0 + 0.2, z0], [x0 + 0.2, z0 + 2.0], 0.4, y - 0.5, y + 1.5);              // the west side, half closed
  wallRun(bag, col, WALL, [x1 - 0.2, z0], [x1 - 0.2, z0 + 1.2], 0.4, y - 0.5, y + 1.4);
  for (const [px, pz] of [[x0 + 0.3, z1 - 0.2], [cx - 0.9, z1 - 0.2], [cx + 0.9, z1 - 0.2], [x1 - 0.3, z1 - 0.2], [x0 + 1.9, z0 + 2.2], [x1 - 1.9, z0 + 2.2]]) {
    bag.add(DARK, rod([px, y - 0.2, pz], [px + (rand() - 0.5) * 0.04, TOP - 0.05, pz], 0.085, 7));
    bag.add(DARK, rod([px, TOP - 0.1, pz], [px, TOP + 0.02, pz + 0.17], 0.05, 5)); col.circle(px, pz, 0.11, y, TOP);
  }
  for (const pz of [z1 - 0.2, z0 + 2.2]) bag.add(DARK, rod([x0 - 0.2, TOP + 0.02, pz], [x1 + 0.2, TOP + 0.02, pz], 0.09, 7));
  for (let i = 0; i < 9; i++) { const u = x0 - 0.3 + i * (W + 0.6) / 8; bag.add(LOG, rod([u, TOP + 0.14, z0 - 0.1], [u + (rand() - 0.5) * 0.05, TOP + 0.14, z1 + 0.4], 0.055, 6)); }
  for (let L = 0; L < 5; L++) {
    const alongX = L % 2 === 0, n = Math.round((alongX ? D + 0.9 : W + 0.9) / 0.22), m = L % 2 ? STALK : THATCH, inset = L * 0.07;
    for (let i = 0; i < n; i++) {
      const o = (alongX ? z0 - 0.1 : x0 - 0.3) + (i + 0.5) * ((alongX ? D + 0.9 : W + 0.9) / n), ext = (alongX ? W + 0.6 : D + 0.9) / 2 - inset + (rand() - 0.5) * 0.15, bh = 0.11 + rand() * 0.03, yy = TOP + 0.22 + L * 0.12, zc = z0 - 0.1 + (D + 0.9) / 2;
      if (alongX) bag.add(m, box(cx - ext, yy, o - 0.11, cx + ext, yy + bh, o + 0.11)); else bag.add(m, box(o - 0.11, yy, zc - ext, o + 0.11, yy + bh, zc + ext));
    }
  }
  for (let i = 0; i < 6; i++) bag.add(STONE2, lathe([[0.2, 0], [0.17, 0.1], [0.001, 0.14]], 6, null, cx + (rand() - 0.5) * (W - 0.6), TOP + 0.74, cz - 0.4 - rand() * 2.4));
  // the furnace: a clay chimney-shaft with its fire hole, the tuyere from the bellows
  const fx = x1 - 1.1, fz = z0 + 0.95;
  bag.add(SMOOTH, lathe([[0.62, -0.1], [0.5, 0.3], [0.4, 0.8], [0.32, 1.15], [0.38, 1.25], [0.2, 1.3]], 12, (t, i) => 1 + 0.03 * Math.sin(t * 4 + i), fx, F, fz));
  bag.add(HOLE, box(fx - 0.17, F + 0.12, fz + 0.38, fx + 0.17, F + 0.5, fz + 0.43));
  bag.add('flame', box(fx - 0.12, F + 0.15, fz + 0.43, fx + 0.12, F + 0.35, fz + 0.45));
  bag.add('iron', rod([fx - 0.2, F + 0.3, fz + 0.4], [fx - 1.05, F + 0.32, fz + 0.9], 0.03, 5));
  col.circle(fx, fz, 0.55, F, F + 1.3);
  // the two bellows of goatskin on their board, worked by the smith's assistant, one then the other
  for (const s of [-1, 1]) {
    const bx = fx - 1.15 + s * 0.24, bz = fz + 1.0;
    bag.add('hide_tan', lathe([[0.17, 0], [0.19, 0.12], [0.12, 0.3], [0.05, 0.42], [0.001, 0.45]], 8, null, bx, F + 0.04, bz));
    bag.add(DARK, rod([bx, F + 0.46, bz], [bx + s * 0.04, F + 0.95, bz + 0.08], 0.012, 4));
  }
  bag.add(DARK, box(fx - 1.55, F, fz + 0.72, fx - 0.7, F + 0.05, fz + 1.28)); col.rect([fx - 1.55, fz + 0.72, fx - 0.7, fz + 1.28], F, F + 0.5);
  // the anvil stone on a stump, the hammers, the heap of charcoal, a trough of water, the bench along the back wall with the day's work
  bag.add(DARK, lathe([[0.3, 0], [0.26, 0.2], [0.27, 0.4], [0.001, 0.4]], 9, null, cx - 0.7, F, cz - 1.8));
  bag.add(STONE2, box(cx - 0.9, F + 0.38, cz - 1.95, cx - 0.5, F + 0.52, cz - 1.65)); col.circle(cx - 0.7, cz - 1.8, 0.3, F, F + 0.55);
  bag.add('iron', box(cx - 0.55, F + 0.52, cz - 1.82, cx - 0.35, F + 0.57, cz - 1.78));
  for (const [hx, hz] of [[cx - 0.2, cz - 1.5], [cx - 1.3, cz - 1.9]]) { bag.add('iron', box(hx, F + 0.03, hz, hx + 0.1, F + 0.09, hz + 0.06)); bag.add(LOG, rod([hx + 0.1, F + 0.06, hz + 0.03], [hx + 0.55, F + 0.04, hz + 0.1], 0.016, 4)); }
  bag.add('bark_dark', lathe([[0.7, 0], [0.5, 0.18], [0.2, 0.3], [0.001, 0.33]], 9, (t) => 1 + 0.2 * Math.sin(t * 5), cx - 2.0, F, cz - 1.5)); col.circle(cx - 2.0, cz - 1.5, 0.5, F, F + 0.3);
  bag.add(DARK, rod([cx - 1.55, F + 0.22, cz - 0.55], [cx - 0.7, F + 0.22, cz - 0.55], 0.2, 7)); col.rect([cx - 1.6, cz - 0.78, cx - 0.65, cz - 0.32], F, F + 0.4);
  bag.add(WALL, box(x0 + 0.5, F, z0 + 0.4, cx - 0.2, F + 0.38, z0 + 0.85)); col.rect([x0 + 0.5, z0 + 0.4, cx - 0.2, z0 + 0.85], F, F + 0.38);
  for (let k = 0; k < 6; k++) bag.add('iron', box(x0 + 0.7 + k * 0.28, F + 0.38, z0 + 0.55 + (k % 2) * 0.1, x0 + 0.78 + k * 0.28, F + 0.4 + 0.3 * (k % 3), z0 + 0.62 + (k % 2) * 0.1));   // hoe blades, axe heads, bracelets awaiting the file
  for (let k = 0; k < 7; k++) { const u = x0 + 0.5 + k * 0.55; bag.add('iron', box(u, F + 1.2 + (k % 2) * 0.2, z0 + 0.43, u + 0.04, F + 1.7 + (k % 3) * 0.12, z0 + 0.46)); }   // tongs and files hung on the wall
  basket(bag, x0 + 0.9, F, cz - 0.6, 0.3, 'bark_dark'); col.circle(x0 + 0.9, cz - 0.6, 0.3, F, F + 0.3);
  if (lights) lights.push({ at: [fx, F + 0.9, fz + 0.5], color: '#ff9a4a', intensity: 2.4, distance: 6 }, { at: [cx, TOP - 0.3, cz - 1.2], color: '#fff1d6', intensity: 1.0, distance: 5 });
}

/** dye_yard: { at: [x, z], y, seed }: four lined pits of indigo, a cord on two posts with cloths of white, blue and indigo hung out, balls of indigo in a basket. */
export function dyeYard(el, { bag, col }) {
  const rand = rng(el.seed || 9), [cx, cz] = el.at, y = el.y ?? 0;
  for (let k = 0; k < 4; k++) {
    const px = cx - 2.1 + k * 1.4, pz = cz + (k % 2) * 0.25;
    bag.add('banco', lathe([[0.9, -0.2], [0.82, 0.12], [0.62, 0.26], [0.5, 0.2], [0.5, -0.05]], 12, (t) => 1 + 0.04 * Math.sin(t * 4 + k), px, y, pz));
    bag.add(k % 2 ? 'cloth_indigo' : 'cloth_blue', lathe([[0.5, 0.17], [0.001, 0.17]], 12, null, px, y, pz));
    col.circle(px, pz, 0.85, y - 0.2, y + 0.3);
  }
  const lz = cz - 2.3;
  for (const s of [-1, 1]) { bag.add(DARK, rod([cx + s * 3.0, y - 0.2, lz], [cx + s * 3.0, y + 2.3, lz], 0.07, 6)); col.circle(cx + s * 3.0, lz, 0.1, y, y + 2.3); }
  bag.add('rope_fibre', rod([cx - 3.0, y + 2.2, lz], [cx + 3.0, y + 2.12, lz], 0.01, 4));
  let u = cx - 2.8;
  while (u < 2.6 + cx) {
    const w = 0.6 + rand() * 0.5, drop = 1.0 + rand() * 0.5, m = rand() < 0.45 ? 'cloth_indigo' : rand() < 0.5 ? 'cloth_white' : 'cloth_blue';
    bag.add(m, box(u, y + 2.12 - drop, lz - 0.01, u + w, y + 2.14, lz + 0.01)); u += w + 0.08 + rand() * 0.15;
  }
  basket(bag, cx + 3.6, y, cz + 0.4, 0.3, 'cloth_indigo'); col.circle(cx + 3.6, cz + 0.4, 0.3, y, y + 0.3);
  for (let k = 0; k < 5; k++) bag.add('cloth_indigo', lathe([[0.001, 0], [0.07, 0.04], [0.08, 0.1], [0.001, 0.16]], 6, null, cx + 3.3 + rand() * 0.6, y, cz + 1.0 + rand() * 0.4));
  jar(bag, cx - 3.4, y, cz + 0.6, 1.5, 'terracotta'); col.circle(cx - 3.4, cz + 0.6, 0.3, y, y + 0.7);
}

/** threshing: { at: [x, z], y, r, seed }: a floor of beaten earth, a heap of millet heads, sheaves stood round, two mortars, a winnowing tray. */
export function threshing(el, { bag, col }) {
  const rand = rng(el.seed || 3), [cx, cz] = el.at, y = el.y ?? 0, r = el.r ?? 3.4;
  bag.add(MUD, lathe([[r, -0.1], [r - 0.05, 0.04], [0.001, 0.04]], 20, (t) => 1 + 0.03 * Math.sin(t * 3), cx, y, cz));
  bag.add(THATCH, lathe([[1.2, 0.03], [0.9, 0.22], [0.5, 0.4], [0.001, 0.52]], 12, (t, i) => 1 + 0.1 * Math.sin(t * 5 + i), cx - 0.4, y, cz + 0.2));
  col.circle(cx - 0.4, cz + 0.2, 1.1, y, y + 0.45);
  for (let k = 0; k < 4; k++) { const a = 0.5 + k * 1.1; milletStack(bag, col, cx + Math.cos(a) * (r - 0.5), y, cz + Math.sin(a) * (r - 0.5), 1.6 + rand() * 0.6, 0.45, k + 5); }
  mortar(bag, col, cx + 1.9, y, cz - 0.7, rand); mortar(bag, col, cx + 1.6, y, cz + 0.9, rand);
  bag.add('wicker', lathe([[0.001, 0], [0.5, 0.01], [0.55, 0.06], [0.5, 0.07], [0.001, 0.03]], 12, null, cx + 0.8, y + 0.05, cz + 1.6));
  bag.add(THATCH, lathe([[0.001, 0.04], [0.4, 0.05], [0.3, 0.1], [0.001, 0.14]], 10, null, cx + 0.8, y + 0.05, cz + 1.6));
  for (let k = 0; k < 4; k++) bag.add(LOG, rod([cx - 2.3, y + 0.03, cz - 1.2 + k * 0.07], [cx - 2.9, y + 0.03, cz - 1.5 + k * 0.1], 0.025, 4));
}

/** pen: { at: [x, z], y, r, seed, gap }: a ring of dry stone 1.2 m high with thorn on top and a gap for the goats, dung and straw inside, a trough. */
export function pen(el, { bag, col }) {
  const rand = rng(el.seed || 4), [cx, cz] = el.at, y = el.y ?? 0, r = el.r ?? 3.2, N = 14, gap = el.gap ?? 3;
  bag.add(MUD, lathe([[r, -0.1], [r - 0.05, 0.02], [0.001, 0.02]], 18, null, cx, y, cz));
  bag.add('bark_dark', lathe([[r * 0.7, 0.02], [r * 0.5, 0.05], [0.001, 0.06]], 14, (t) => 1 + 0.2 * Math.sin(t * 6), cx, y, cz));
  for (let i = 0; i < N; i++) {
    const a0 = i / N * 6.283, a1 = (i + 1) / N * 6.283, p = [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r], q = [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r];
    const gate = i === gap ? [{ at: Math.hypot(q[0] - p[0], q[1] - p[1]) / 2, w: 1.4, h: 2 }] : [];
    wallRun(bag, col, STONE, p, q, 0.5, y - 0.3, y + 1.15 + rand() * 0.15, gate);
    wallDress(bag, p, q, y + 1.3, rand, [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2)], 0.5);
  }
  bag.add(DARK, rod([cx + 0.8, y + 0.2, cz - 1.0], [cx + 1.9, y + 0.2, cz - 0.5], 0.17, 7)); col.rect([cx + 0.7, cz - 1.15, cx + 2.0, cz - 0.35], y, y + 0.35);
}

/** lane_stones: { rects: [[x0, z0, x1, z1, density]], yAt, seed }: the lanes' litter — flat stones, heaps of chaff, dung, stalks lying, sherds. Nothing blocks the way (all under 0.12 m). */
export function laneStones(el, { bag }) {
  const rand = rng(el.seed || 6), yAt = el.yAt;
  for (const [x0, z0, x1, z1, dens = 0.35] of el.rects) {
    const n = Math.round((x1 - x0) * (z1 - z0) * dens);
    for (let k = 0; k < n; k++) {
      const x = x0 + rand() * (x1 - x0), z = z0 + rand() * (z1 - z0), r = rand();
      if (el.skip && el.skip(x, z)) continue;
      const y = yAt(x, z);
      if (r < 0.55) { const rr = 0.12 + rand() * rand() * 0.42; bag.add(rand() < 0.5 ? STONE : STONE2, lathe([[rr, -0.03], [rr * 0.95, 0.03 + rand() * 0.04], [rr * 0.6, 0.08], [0.001, 0.09]], 6, (t, i) => 1 + 0.15 * Math.sin(t * 3 + i + k), x, y, z)); }
      else if (r < 0.7) bag.add(THATCH, lathe([[0.2 + rand() * 0.15, -0.02], [0.12, 0.05], [0.001, 0.09]], 6, (t) => 1 + 0.25 * Math.sin(t * 5 + k), x, y, z));
      else if (r < 0.8) bag.add('bark_dark', lathe([[0.12, -0.02], [0.08, 0.04], [0.001, 0.06]], 5, null, x, y, z));
      else if (r < 0.92) { const a = rand() * 6.28, L = 0.4 + rand() * 0.5; bag.add(STALK, rod([x, y + 0.02, z], [x + Math.cos(a) * L, y + 0.02, z + Math.sin(a) * L], 0.008, 3)); }
      else bag.add('terracotta', box(x, y + 0.005, z, x + 0.08 + rand() * 0.08, y + 0.02, z + 0.06 + rand() * 0.06));
    }
  }
}
void NOCOL; void HOLE;
