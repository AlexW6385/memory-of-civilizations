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
    if (d > 2.5) { f.add('iron', box(x - 0.007, -d, -0.007, x + 0.007, 0, 0.007)); for (let j = 1; j < d / 0.7; j++) f.add('iron', box(x - 0.02, -j * 0.7, -0.02, x + 0.02, -j * 0.7 + 0.05, 0.02)); }
    else for (let j = 0; j < d / 0.09; j++) f.add('iron', box(x - 0.008, -(j + 1) * 0.09 + 0.01, -0.008 + (j % 2) * 0.004, x + 0.008, -j * 0.09, 0.008 + (j % 2) * 0.004));
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

/** candelabrum: { at, y, arms } — an iron stand with a ring of candles, the flames lit (a pilgrims' offering at a shrine). */
function candelabrum(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, n = el.arms ?? 7;
  bag.add('iron', lathe([[0.2, 0], [0.18, 0.05], [0.05, 0.12], [0.03, 0.2], [0.03, 1.3], [0.07, 1.34], [0.001, 1.34]], 10, null, x, y, z));
  bag.add('iron', lathe([[0.26, 0], [0.28, 0.03], [0.001, 0.03]], 12, null, x, y + 1.3, z));
  for (let k = 0; k < n; k++) { const a = k * Math.PI * 2 / n, cx = x + Math.cos(a) * 0.2, cz = z + Math.sin(a) * 0.2, h = 0.14 + ((k * 7) % 3) * 0.05;
    bag.add('paint_white', lathe([[0.018, 0], [0.018, h], [0.001, h]], 6, null, cx, y + 1.33, cz)); bag.add('flame', lathe([[0.001, 0], [0.011, 0.012], [0.001, 0.045]], 5, null, cx, y + 1.33 + h, cz)); }
  col.circle(x, z, 0.28, y, y + 1.4);
}

/** cantharus: { at, y, r } — the atrium's fountain: a round basin of marble, eight columns on its rim under a small tiled canopy, water in it. */
function cantharus(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 1.8;
  bag.add('marble', lathe([[r + 0.25, 0], [r + 0.25, 0.1], [r + 0.1, 0.12], [r + 0.1, 0.62], [r + 0.2, 0.66], [r + 0.2, 0.72], [r - 0.1, 0.72], [r - 0.1, 0.5], [0.001, 0.5]], 24, null, x, y, z));
  bag.add('water', lathe([[0.001, 0], [r - 0.1, 0], [r - 0.1, 0.004], [0.001, 0.004]], 20, null, x, y + 0.56, z));
  bag.add('marble', lathe([[0.3, 0], [0.2, 0.1], [0.15, 0.4], [0.2, 0.55], [0.001, 0.58]], 12, null, x, y + 0.5, z));
  const R = r + 0.05;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; bag.add('marble_smooth', lathe([[0.1, 0], [0.085, 0.1], [0.075, 2.5], [0.1, 2.58], [0.001, 2.58]], 10, null, x + Math.cos(a) * R, y + 0.72, z + Math.sin(a) * R)); }
  bag.add('limestone', lathe([[R + 0.25, 0], [R + 0.25, 0.14], [0.001, 0.14]], 8, null, x, y + 3.28, z));
  bag.add('roof_tile', lathe([[R + 0.35, 0], [0.001, 1.1]], 8, null, x, y + 3.4, z));
  bag.add('gilt_bronze', lathe([[0.04, 0], [0.001, 0.3]], 6, null, x, y + 4.5, z));
  col.circle(x, z, r + 0.3, y, y + 0.75);
}

/** ciborium: { at, y, dir } — the altar under its canopy: a table of marble on a pedestal, four columns, a pyramidal silver roof, a cloth and a cross on the altar. */
function ciborium(el, { bag, col }) {
  const f = frame(bag, el), s = el.s ?? 1.5;
  f.add('marble', box(-0.9, 0, -0.55, 0.9, 0.12, 0.55)); f.add('marble', box(-0.7, 0.12, -0.4, 0.7, 0.9, 0.4)); f.add('marble', box(-0.95, 0.9, -0.6, 0.95, 0.98, 0.6));
  f.add('cloth_white', box(-0.8, 0.98, -0.5, 0.8, 1.0, 0.5)); f.add('cloth_red', box(-0.3, 1.0, -0.5, 0.3, 1.01, 0.5));
  f.add('silver', box(-0.02, 1.0, -0.02, 0.02, 1.3, 0.02)); f.add('silver', box(-0.1, 1.2, -0.02, 0.1, 1.24, 0.02));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { f.add('marble_smooth', lathe([[0.1, 0], [0.08, 0.1], [0.07, 2.9], [0.1, 3.0], [0.001, 3.0]], 10, null, sx * s * 1.2, 0, sz * s)); f.add('marble', box(sx * s * 1.2 - 0.14, 3.0, sz * s - 0.14, sx * s * 1.2 + 0.14, 3.14, sz * s + 0.14)); }
  for (const [a, b] of [[-1, 1], [1, 1]]) { void a; void b; }
  f.add('silver', box(-s * 1.2 - 0.14, 3.14, -s - 0.1, s * 1.2 + 0.14, 3.3, -s + 0.1)); f.add('silver', box(-s * 1.2 - 0.14, 3.14, s - 0.1, s * 1.2 + 0.14, 3.3, s + 0.1));
  f.add('silver', box(-s * 1.2 - 0.1, 3.14, -s, -s * 1.2 + 0.1, 3.3, s)); f.add('silver', box(s * 1.2 - 0.1, 3.14, -s, s * 1.2 + 0.1, 3.3, s));
  f.add('silver', lathe([[s * 1.75, 0], [0.001, 1.3]], 4, null, 0, 3.3, 0).rotateY(Math.PI / 4));
  f.add('gilt_bronze', lathe([[0.05, 0], [0.001, 0.4]], 6, null, 0, 4.6, 0));
  col.rect([f.ax - 1.0, f.az - 0.6, f.ax + 1.0, f.az + 0.6], f.y, f.y + 1.0);
}

/** templon: { a, b, y } — the chancel screen: low marble panels between small columns, a gate left open in the middle. */
function templon(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], gate = 2.2, n = Math.max(2, Math.round((L - gate) / 2 / 1.4));
  const P = (t) => [ax + u[0] * t, az + u[1] * t];
  for (const [t0, t1] of [[0, (L - gate) / 2], [(L + gate) / 2, L]]) {
    const nn = Math.max(1, Math.round((t1 - t0) / 1.4));
    for (let k = 0; k <= nn; k++) { const [x, z] = P(t0 + (t1 - t0) * k / nn); bag.add('marble_smooth', lathe([[0.07, 0], [0.06, 0.08], [0.055, 1.05], [0.075, 1.12], [0.001, 1.12]], 8, null, x, y, z)); }
    for (let k = 0; k < nn; k++) { const p = P(t0 + (t1 - t0) * (k + 0.1) / nn), q = P(t0 + (t1 - t0) * (k + 0.9) / nn), g = box(0, 0, -0.04, Math.hypot(q[0] - p[0], q[1] - p[1]), 0.95, 0.04); bag.add('marble', place(g, p[0], y, p[1], Math.atan2(-(q[1] - p[1]), q[0] - p[0]))); }
    col.segment(P(t0), P(t1), 0.2, y, y + 1.1);
  }
  void n;
}

/** ambo: { at, y, dir } — the pulpit of the nave: a platform of marble on four small columns, a stair, a parapet, a book-stand. */
function ambo(el, { bag, col }) {
  const f = frame(bag, el);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add('marble_smooth', lathe([[0.1, 0], [0.08, 0.1], [0.07, 1.4], [0.1, 1.5], [0.001, 1.5]], 8, null, sx * 0.9, 0, sz * 0.9));
  f.add('marble', box(-1.1, 1.5, -1.1, 1.1, 1.65, 1.1)); for (const [a, b, c, d] of [[-1.1, -1.1, 1.1, -1.0], [-1.1, 1.0, 1.1, 1.1], [-1.1, -1.0, -1.0, 1.0], [1.0, -1.0, 1.1, 1.0]]) f.add('marble', box(a, 1.65, b, c, 2.45, d));
  for (let k = 0; k < 8; k++) f.add('marble', box(-0.4, 0, 1.1 + k * 0.3, 0.4, 1.5 - k * 0.19, 1.4 + k * 0.3));
  f.add('cedar', box(-0.3, 2.0, -0.95, 0.3, 2.04, -0.6).rotateX(0.35).translate(0, 0.2, 0));
  col.rect([f.ax - 1.2, f.az - 1.2, f.ax + 1.2, f.az + 1.2], f.y, f.y + 2.5);
}

Object.assign(STYLES.islamic.elements, { candelabrum, cantharus, ciborium, templon, ambo, cistern_head: cisternHead, minbar, lamp_chain: lampChain, quran_stand: quranStand, censer, mastaba, bracket_lamp: streetBracket });
