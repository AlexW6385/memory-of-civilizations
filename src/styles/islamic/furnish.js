// The furniture of the Umayyad mosques and houses (docs/settlements/jerusalem.md §1d): the minbar, the hanging
// lamp on its chain, the Qur'an stand (rahla), the censer on its stand, the cistern's head on the esplanade,
// a stone bench (mastaba) at a door, a hanging street lamp. Registered into the `islamic` style. Each is built
// in a local frame (z along `dir`, x across) and turned and set at `at`.

import { STYLES } from '../../core/build.js';
import { box, lathe, place } from '../../core/geom.js';
import './index.js';

/** The local frame of a piece: add(mat, geometry) turns the geometry to `dir` ([dx, dz], z along it) and sets it at `at` ([x, z]) and y. */
function frame(bag, el) {
  const [dx, dz] = el.dir ?? [0, 1], yaw = Math.atan2(dx, dz), [ax, az] = el.at, y = el.y ?? 0;
  return { y, add: (mat, g) => bag.add(mat, place(g, ax, y, az, yaw)), yaw, ax, az };
}

/**
 * minbar: { at, dir (the way the steps rise), y, steps, L (length), W (width) } — the pulpit of the Umayyad mosque:
 * a stepped flight of cedar between two panels that rise with it, a seat at the top with a back, a low rail.
 */
function minbar(el, { bag, col }) {
  const f = frame(bag, el), n = el.steps ?? 7, L = el.L ?? 3.4, W = el.W ?? 1.0, rh = 0.29, rd = (L - 0.9) / n;
  for (let k = 0; k < n; k++) f.add('cedar', box(-W / 2 + 0.06, 0, k * rd, W / 2 - 0.06, (k + 1) * rh, L));
  // the seat: a platform at the top with a back, the side panels' ends rising over it
  const top = n * rh;
  f.add('cedar', box(-W / 2, top, n * rd - 0.05, W / 2, top + 0.06, L));
  f.add('cedar', box(-W / 2, top + 0.06, L - 0.08, W / 2, top + 0.95, L));
  f.add('cloth_red', box(-W / 2 + 0.08, top + 0.07, n * rd + 0.2, W / 2 - 0.08, top + 0.14, L - 0.1));
  for (const s of [-1, 1]) {
    // the side panel: stepped under, a sloped rail over, a post at the head and at the foot
    for (let k = 0; k < n; k++) f.add('cedar', box(s * W / 2 - (s > 0 ? 0.08 : 0), 0, k * rd, s * W / 2 + (s < 0 ? 0.08 : 0), (k + 1) * rh + 0.5, (k + 1) * rd));
    f.add('cedar', box(s * W / 2 - (s > 0 ? 0.08 : 0), 0, n * rd, s * W / 2 + (s < 0 ? 0.08 : 0), top + 0.55, L));
    const rail = box(s * W / 2 - (s > 0 ? 0.09 : -0.01), -0.04, 0, s * W / 2 + (s < 0 ? 0.09 : -0.01), 0.04, Math.hypot(n * rd, n * rh));
    rail.rotateX(-Math.atan2(n * rh, n * rd)); rail.translate(0, 0.78, 0);
    f.add('timber', rail);
    f.add('timber', box(s * W / 2 - 0.05, 0, L - 0.1, s * W / 2 + 0.05, top + 1.25, L));
    f.add('timber', box(s * W / 2 - 0.05, 0, -0.02, s * W / 2 + 0.05, 1.0, 0.08));
  }
  // a small gabled canopy over the seat, on its two posts, its roof of gilded cedar
  f.add('cedar', box(-W / 2 - 0.02, top + 1.25, n * rd + 0.1, W / 2 + 0.02, top + 1.33, L + 0.04));
  f.add('gilt_bronze', box(-W / 2 + 0.1, top + 1.33, n * rd + 0.2, W / 2 - 0.1, top + 1.4, L - 0.04));
  f.add('cedar', box(-W / 2 - 0.02, 0, 0, W / 2 + 0.02, 0.07, L));
  const sx = [], c = Math.cos(f.yaw), s = Math.sin(f.yaw);
  for (const [u, v] of [[-W / 2, 0], [W / 2, 0], [-W / 2, L], [W / 2, L]]) sx.push([f.ax + u * c + v * s, f.az - u * s + v * c]);
  col.rect([Math.min(...sx.map((p) => p[0])), Math.min(...sx.map((p) => p[1])), Math.max(...sx.map((p) => p[0])), Math.max(...sx.map((p) => p[1]))], f.y, f.y + top + 1.4);
}

/** lamp_chain: { at, y (the hook), drop, n (lamps hung together) } — a glass lamp in a bronze ring on a chain from a beam. */
function lampChain(el, { bag }) {
  const f = frame(bag, el), d = el.drop ?? 1.6, n = el.n ?? 1;
  for (let k = 0; k < n; k++) {
    const x = (k - (n - 1) / 2) * 0.55;
    for (let j = 0; j < d / 0.09; j++) f.add('iron', box(x - 0.008, -(j + 1) * 0.09 + 0.01, -0.008 + (j % 2) * 0.004, x + 0.008, -j * 0.09, 0.008 + (j % 2) * 0.004));
    f.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.13, 0.03], [0.11, 0.05], [0.001, 0.02]], 14, null, x, -d - 0.05, 0));
    f.add('lamp_glass', lathe([[0.001, 0], [0.06, 0.02], [0.095, 0.1], [0.075, 0.2], [0.11, 0.24], [0.001, 0.24]], 12, null, x, -d - 0.22, 0));
    f.add('bronze', lathe([[0.001, 0], [0.04, 0], [0.001, 0.05]], 8, null, x, -d + 0.02, 0));
  }
}

/** quran_stand: { at, dir (the way the reader faces), y, book } — the folding stand of two crossed boards, the book on it. */
function quranStand(el, { bag, col }) {
  const f = frame(bag, el);
  for (const s of [-1, 1]) { const g = box(-0.017, -0.28, -0.17, 0.017, 0.28, 0.17); g.rotateZ(s * 0.5); g.translate(0, 0.3, 0); f.add('cedar', g); }
  f.add('cedar', box(-0.3, 0.52, -0.18, 0.3, 0.57, 0.18).rotateX(-0.25).translate(0, 0.08, 0));
  if (el.book !== false) { f.add('cloth_brown', box(-0.22, 0.6, -0.15, 0.22, 0.66, 0.15).rotateX(-0.25).translate(0, 0.07, 0)); f.add('paint_white', box(-0.2, 0.66, -0.13, 0.2, 0.675, 0.13).rotateX(-0.25).translate(0, 0.07, 0)); }
  col.circle(el.at[0], el.at[1], 0.3, f.y, f.y + 0.7);
}

/** censer: { at, y } — a bronze burner on a tripod, the coals glowing in it. */
function censer(el, { bag, col }) {
  const f = frame(bag, el);
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3 + 0.4; const g = box(-0.012, 0, -0.012, 0.012, 0.62, 0.012); g.rotateZ(Math.sin(a) * 0.12).rotateX(Math.cos(a) * 0.12); g.translate(Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14); f.add('bronze', g); }
  f.add('bronze', lathe([[0.001, 0], [0.12, 0.0], [0.19, 0.1], [0.2, 0.13], [0.17, 0.13], [0.001, 0.05]], 14, null, 0, 0.6, 0));
  f.add('flame', lathe([[0.001, 0], [0.03, 0.01], [0.001, 0.04]], 6, null, 0, 0.71, 0));
  col.circle(el.at[0], el.at[1], 0.25, f.y, f.y + 0.75);
}

/** mastaba: { at, dir (the way it faces), y, len } — a bench of dressed stone against a wall, a cushion on it for the master. */
function mastaba(el, { bag, col }) {
  const f = frame(bag, el), L = el.len ?? 2.2, d = el.depth ?? 0.55, h = el.h ?? 0.46;
  f.add('limestone_carved', box(-L / 2, 0, 0, L / 2, h, d));
  f.add('limestone', box(-L / 2 - 0.03, h, -0.03, L / 2 + 0.03, h + 0.05, d + 0.03));
  if (el.cushion) f.add(el.cushion, box(-L * 0.3, h + 0.05, 0.08, L * 0.1, h + 0.12, d - 0.08));
  const [ax, az] = el.at, w = Math.abs(Math.cos(f.yaw)) > 0.5 ? [L / 2, d / 2] : [d / 2, L / 2], cx = ax + Math.sin(f.yaw) * d / 2, cz = az + Math.cos(f.yaw) * d / 2;
  col.rect([cx - w[0], cz - w[1], cx + w[0], cz + w[1]], f.y, f.y + h + 0.05);
}

/** street_lamp: { at, dir, y (the hook's height), len } — an iron bracket out of a wall with a glass lamp in a cage (lit at night). */
function streetBracket(el, { bag }) {
  const f = frame(bag, el), out = el.len ?? 0.8, h = el.h ?? 3.0;
  f.add('iron', box(-0.02, h - 0.02, 0, 0.02, h + 0.02, out));
  const g = box(-0.012, -0.3, -0.012, 0.012, 0.3, 0.012); g.rotateX(0.9).translate(0, h - 0.28, out * 0.3); f.add('iron', g);
  f.add('iron', lathe([[0.001, 0], [0.09, 0], [0.11, 0.04], [0.001, 0.04]], 8, null, 0, h - 0.34, out - 0.02));
  f.add('lamp_glass', lathe([[0.001, 0], [0.06, 0.01], [0.09, 0.1], [0.07, 0.2], [0.001, 0.2]], 8, null, 0, h - 0.3, out - 0.02));
  f.add('iron', lathe([[0.11, 0], [0.001, 0.1]], 8, null, 0, h - 0.1, out - 0.02));
}

/** cistern_head: { at, y } — the round dressed-stone head of a cistern on the paving, a lid of stone on it, the rope-worn lip, a stone trough beside. */
function cisternHead(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('limestone_carved', lathe([[0.62, -0.1], [0.66, 0.0], [0.66, 0.1], [0.55, 0.12], [0.5, 0.5], [0.5, 0.72], [0.56, 0.74], [0.56, 0.8], [0.4, 0.8], [0.4, 0.62], [0.001, 0.6]], 18, null, x, y, z));
  bag.add('limestone', lathe([[0.001, 0], [0.38, 0], [0.38, 0.06], [0.2, 0.09], [0.001, 0.1]], 14, null, x, y + 0.6, z));
  bag.add('limestone_carved', box(x + 0.8, y, z - 0.25, x + 2.0, y + 0.1, z + 0.25));
  for (const s of [-1, 1]) bag.add('limestone_carved', box(x + 0.8, y + 0.1, z + s * 0.2 - 0.04, x + 2.0, y + 0.42, z + s * 0.2 + 0.04));
  bag.add('limestone_carved', box(x + 0.8, y + 0.1, z - 0.24, x + 0.86, y + 0.42, z + 0.24)); bag.add('limestone_carved', box(x + 1.94, y + 0.1, z - 0.24, x + 2.0, y + 0.42, z + 0.24));
  bag.add('water', box(x + 0.86, y + 0.3, z - 0.16, x + 1.94, y + 0.31, z + 0.16));
  col.circle(x, z, 0.68, y, y + 0.85); col.rect([x + 0.8, z - 0.25, x + 2.0, z + 0.25], y, y + 0.45);
}

Object.assign(STYLES.islamic.elements, { cistern_head: cisternHead, minbar, lamp_chain: lampChain, quran_stand: quranStand, censer, mastaba, bracket_lamp: streetBracket });
