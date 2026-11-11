// Dogon building parts (docs/settlements/dogon.md §4): granaries with their thatch hats, round kitchens, courtyard walls, the
// niched facade, notched-log ladders, mortars, stacked millet stalks, altars, jars. Shared by the style's elements.

import { box, lathe, rod, place, fromTriangles } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';

export const WALL = 'banco_rough', PLASTER = 'banco', SMOOTH = 'banco_smooth', MUD = 'mud_plaster', BRICK = 'mudbrick', STONE = 'schist_rubble', STONE2 = 'granite_rough';
export const THATCH = 'thatch', STALK = 'reed_mat', LOG = 'log_pine', DARK = 'wood_dark', RED = 'kokowai', HOLE = 'opening', ROCK = 'sandstone_red';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** A straight wall on the centre line a→b (plan), thickness th, y0..y1, with openings [{ at, w, h }] (door gaps). Solid to the walker except the gaps. */
export function wallRun(bag, col, mat, a, b, th, y0, y1, ops = [], o = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const P = (s) => [a[0] + ux * s, a[1] + uz * s];
  const piece = (s0, s1, ya, yb) => {
    if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return;
    const p0 = P(s0), p1 = P(s1);
    bag.add(mat, orientedBox(p0, p1, th, ya, yb, o.ext ?? 0));
    if (!o.noCol) col.segment(p0, p1, th, ya, yb);
  };
  const S = ops.map((q) => ({ ...q, s0: q.at - q.w / 2, s1: q.at + q.w / 2 })).sort((p, q) => p.s0 - q.s0);
  let s = 0;
  for (const q of S) {
    piece(s, q.s0, y0, y1);
    piece(q.s0, q.s1, y0 + q.h, y1);
    s = q.s1;
  }
  piece(s, L, y0, y1);
}

/** A ladder cut from a trunk: one notched log, foot at (x, y, z), leaning toward (dx, dz) to height h. */
export function notchedLadder(bag, x, y, z, h, dx, dz, lean = 0.7) {
  const top = [x + dx * lean, y + h + 0.5, z + dz * lean], len = Math.hypot(top[0] - x, top[1] - y, top[2] - z);
  bag.add(DARK, rod([x, y, z], top, 0.11, 7));
  // the notches: small steps cut into one face, every 0.3 m
  const px = -dz, pz = dx;
  for (let k = 1; k * 0.3 < len - 0.5; k++) {
    const f = k * 0.3 / len, c = [x + (top[0] - x) * f, y + (top[1] - y) * f, z + (top[2] - z) * f];
    bag.add(LOG, box(c[0] - 0.13 - Math.abs(px) * 0.0, c[1] - 0.025, c[2] - 0.13, c[0] + 0.13, c[1] + 0.02, c[2] + 0.13));
    void pz;
  }
}

/** A clay jar. */
export function jar(bag, x, y, z, k = 1, mat = 'terracotta') {
  bag.add(mat, lathe([[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.26], [0.19, 0.38], [0.14, 0.45], [0.15, 0.49], [0.13, 0.49], [0.12, 0.44], [0.001, 0.43]].map(([r, h]) => [r * k, h * k]), 12, null, x, y, z));
}
export function basket(bag, x, y, z, r = 0.22, goods = null) {
  bag.add('wicker', lathe([[0.001, 0], [r * 0.7, 0.01], [r, 0.12], [r * 1.05, 0.25], [r * 0.95, 0.25], [r * 0.9, 0.12], [0.001, 0.03]], 10, null, x, y, z));
  if (goods) bag.add(goods, lathe([[0.001, 0.2], [r * 0.9, 0.2], [r * 0.7, 0.26], [0.001, 0.31]], 8, null, x, y, z));
}
/** A big wooden mortar (a hollowed trunk) with its two pestles leaning in it, for pounding millet. */
export function mortar(bag, col, x, y, z, rand = Math.random) {
  bag.add(DARK, lathe([[0.001, 0], [0.2, 0], [0.28, 0.1], [0.24, 0.55], [0.3, 0.66], [0.2, 0.66], [0.17, 0.45], [0.001, 0.4]], 10, null, x, y, z));
  const a = rand() * 6.28;
  for (const s of [-1, 1]) bag.add(LOG, rod([x + Math.cos(a) * 0.08 * s, y + 0.4, z + Math.sin(a) * 0.08 * s], [x + Math.cos(a) * 0.38 * s, y + 1.65, z + Math.sin(a) * 0.38 * s + 0.1], 0.04, 6));
  col.circle(x, z, 0.32, y, y + 0.7);
}
/** A stack of millet stalks (sheaves) stood against each other: a tall narrow cone of bundles. */
export function milletStack(bag, col, x, y, z, h = 1.8, r = 0.55, seed = 1) {
  const rand = rng(seed);
  bag.add(STALK, lathe([[r, 0], [r * 0.9, h * 0.3], [r * 0.6, h * 0.7], [0.02, h]], 8, (t, i) => 1 + 0.12 * Math.sin(t * 5 + i * 2.1 + seed), x, y, z));
  for (let k = 0; k < 5; k++) { const a = k * 1.26 + rand(); bag.add(THATCH, rod([x + Math.cos(a) * r * 0.9, y, z + Math.sin(a) * r * 0.9], [x + Math.cos(a) * r * 0.1, y + h * 0.97, z + Math.sin(a) * r * 0.1], 0.025, 4)); }
  col.circle(x, z, r * 0.9, y, y + h * 0.6);
}
export function firewood(bag, col, x, y, z, yaw, len = 1.6, rows = 3, rand = Math.random) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  for (let r = 0; r < rows; r++) for (let k = 0; k < rows - r + 1; k++) {
    const u = (k - (rows - r) / 2) * 0.14, v = r * 0.12 + 0.05, ex = (len / 2) * (0.9 + rand() * 0.2);
    bag.add('bark_dark', rod([x - c * ex + -s * u, y + v, z - s * ex + c * u], [x + c * ex - s * u, y + v, z + s * ex + c * u], 0.045 + rand() * 0.015, 5));
  }
  col.rect([x - Math.abs(c) * len / 2 - Math.abs(s) * 0.3, z - Math.abs(s) * len / 2 - Math.abs(c) * 0.3, x + Math.abs(c) * len / 2 + Math.abs(s) * 0.3, z + Math.abs(s) * len / 2 + Math.abs(c) * 0.3], y, y + rows * 0.12 + 0.1);
}

/**
 * A granary at (x, y, z): the platform of stones, the cylinder of mud (r the radius, h the wall), the door on the side toward `yaw`
 * (a square carved wooden door; a high one for the male granary, with a notched ladder), the conical hat of millet straw standing
 * on the wall with an overhang. kind: 'male' | 'female' | 'low' (the door at the ground, the old men's shelter).
 */
export function granary(bag, col, x, y, z, r, h, o = {}) {
  const rand = o.rand ?? rng(7), yaw = o.yaw ?? Math.PI / 2, kind = o.kind ?? 'male', hh = o.hat ?? (r * 1.35 + 0.25);
  const pl = 0.38;
  bag.add(STONE, lathe([[r + 0.28, -0.3], [r + 0.3, 0.05], [r + 0.22, pl], [0.001, pl]], 11, (t, i) => 1 + 0.07 * Math.sin(t * 6 + i * 1.7 + r * 9), x, y, z));
  bag.add(STONE2, lathe([[r + 0.22, pl - 0.04], [r + 0.2, pl], [0.001, pl]], 11, null, x, y + 0.001, z));
  const y0 = y + pl;
  bag.add(WALL, lathe([[r * 1.04, 0], [r * 1.0, h * 0.1], [r * 1.06, h * 0.5], [r * 1.0, h]], 14, (t, i) => 1 + 0.018 * Math.sin(t * 7 + i * 3.3 + h * 5), x, y0, z));
  bag.add(MUD, lathe([[r * 1.0, h], [0.001, h]], 14, null, x, y0, z));
  // the hat: a cone of straw, ragged at the eaves, a pot or a tuft on the apex
  const yh = y0 + h;
  bag.add(THATCH, lathe([[r + 0.3, 0], [r + 0.26, 0.05], [r * 0.95 + 0.1, hh * 0.25], [r * 0.55, hh * 0.62], [r * 0.22, hh * 0.86], [0.02, hh]], 14, (t, i) => i < 2 ? 1 + 0.05 * Math.sin(t * 17 + r * 7) : 1 + 0.03 * Math.sin(t * 9 + i), x, yh - 0.06, z));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0.02], [0.09, 0.08], [0.05, 0.13], [0.001, 0.14]], 8, null, x, yh + hh - 0.1, z));
  // the door
  const dx = Math.sin(yaw), dz = Math.cos(yaw);
  const dw = 0.42, dh = 0.48, dy = kind === 'male' ? y0 + h * 0.52 : kind === 'female' ? y0 + h * 0.32 : y0 + 0.02;
  const w = kind === 'low' ? 0.7 : dw, hgt = kind === 'low' ? 0.85 : dh;
  const px = x + dx * (r * 1.04 - 0.02), pz = z + dz * (r * 1.04 - 0.02);
  bag.add(HOLE, place(box(-w / 2 - 0.05, 0, 0, w / 2 + 0.05, hgt + 0.05, 0.03), px, dy, pz, yaw));
  bag.add(DARK, place(box(-w / 2, 0.01, 0.03, w / 2, hgt, 0.07), px, dy, pz, yaw));
  for (let k = 0; k < 3; k++) bag.add(LOG, place(box(-w / 2 + 0.02, 0.07 + k * hgt * 0.3, 0.07, w / 2 - 0.02, 0.11 + k * hgt * 0.3, 0.095), px, dy, pz, yaw));
  bag.add(DARK, place(box(-0.025, hgt * 0.45, 0.07, 0.025, hgt * 0.65, 0.12), px, dy, pz, yaw));          // the lock bar
  bag.add(WALL, place(box(-w / 2 - 0.1, hgt + 0.04, 0, w / 2 + 0.1, hgt + 0.12, 0.09), px, dy, pz, yaw));   // the lintel's lip
  if (kind === 'male') notchedLadder(bag, x + dx * (r + 0.5), y0, z + dz * (r + 0.5), dy - y0 - 0.05, -dx, -dz, 0.35);
  col.circle(x, z, r + 0.3, y - 0.3, yh + hh);
  // a few stones of the wall's lumps and the straw's binding
  for (let k = 0; k < 2; k++) { const a = rand() * 6.28; bag.add(STONE, lathe([[0.12, 0], [0.09, 0.07], [0.001, 0.08]], 6, null, x + Math.cos(a) * (r + 0.25), y + pl, z + Math.sin(a) * (r + 0.25))); }
}

/** A round kitchen: a cylinder of mud with a flat roof and a low parapet, a door gap toward `yaw`; solid (the landmark's is built by its own function). */
export function kitchen(bag, col, x, y, z, r, h, yaw, rand) {
  const N = 14;
  bag.add(WALL, lathe([[r * 1.05, -0.4], [r * 1.02, h * 0.2], [r, h]], N, (t, i) => 1 + 0.02 * Math.sin(t * 5 + i * 2 + x), x, y, z));
  bag.add(MUD, lathe([[r, h], [0.001, h + 0.02]], N, null, x, y, z));
  bag.add(WALL, lathe([[r, h], [r * 1.0, h + 0.26], [r * 0.9, h + 0.26], [r * 0.9, h]], N, null, x, y, z));
  const dx = Math.sin(yaw), dz = Math.cos(yaw);
  bag.add(HOLE, place(box(-0.35, 0.0, 0, 0.35, 1.2, 0.03), x + dx * (r - 0.02), y, z + dz * (r - 0.02), yaw));
  col.circle(x, z, r + 0.05, y - 0.4, y + h + 0.3);
  col.floor([x - r * 0.7, z - r * 0.7, x + r * 0.7, z + r * 0.7], y + h);
  void rand;
}

/**
 * The facade of a ginna on the south side of its block: along x from x0 to x1, the wall's south face at zf, from y to y + H.
 * pilasters on a 1.05 m beat, three rows of niches between them, a cornice, a band of triangles in red wash at the top; the door
 * leaf (double) in a frame at doorAt (or none).
 */
export function nicheFacade(bag, x0, x1, zf, y, H, rand, o = {}) {
  const smooth = o.plain;
  const n = Math.max(2, Math.round((x1 - x0) / 1.05)), pitch = (x1 - x0) / n;
  const door = o.doors ?? [];
  const inDoor = (u, w) => door.some((d) => Math.abs(u - d) < w / 2 + d * 0 + 0.75);
  const top = y + H;
  for (let i = 0; i <= n; i++) {
    const u = x0 + i * pitch;
    if (door.some((d) => Math.abs(u - d) < 0.78)) continue;
    bag.add(PLASTER, box(u - 0.14, y, zf, u + 0.14, top + 0.2 + (i % 2) * 0.12, zf + 0.15));
  }
  if (!smooth) {
    for (let i = 0; i < n; i++) {
      const uc = x0 + (i + 0.5) * pitch;
      if (inDoor(uc, 0)) continue;
      for (let r = 0; r < 3; r++) {
        const yy = y + 1.15 + r * 0.8 + (H - 3) * 0.3 * r * 0.3;
        if (yy + 0.4 > top - 0.35) continue;
        if (r === 0 && rand() < 0.25) continue;
        bag.add(HOLE, box(uc - 0.17, yy, zf, uc + 0.17, yy + 0.34, zf + 0.012));
        bag.add(SMOOTH, box(uc - 0.2, yy + 0.34, zf, uc + 0.2, yy + 0.37, zf + 0.04));    // lintel plaster
        bag.add(SMOOTH, box(uc - 0.2, yy - 0.03, zf, uc + 0.2, yy, zf + 0.04));
      }
    }
  }
  bag.add(PLASTER, box(x0 - 0.2, top - 0.1, zf - 0.02, x1 + 0.2, top + 0.14, zf + 0.12));      // the cornice
  // the red band of triangles under the cornice
  const T = [];
  for (let i = 0; i < n * 3; i++) {
    const a = x0 + i * pitch / 3, b = a + pitch / 3, yb = top - 0.5, yt = top - 0.15;
    if (door.some((d) => Math.abs((a + b) / 2 - d) < 0.78)) continue;
    T.push(a, yb, zf + 0.165, (a + b) / 2, yt, zf + 0.165, b, yb, zf + 0.165);
  }
  if (T.length && !smooth) bag.add(RED, fromTriangles(T));
}

/** A carved door: a frame with a pair of leaves, bands of figures cut in rows. At (u, y), facing +z at zf. */
export function carvedDoor(bag, u, y, zf, w, h, rand, open = false) {
  bag.add(HOLE, box(u - w / 2, y, zf - 0.02, u + w / 2, y + h, zf + 0.012));
  if (!open) {
    bag.add(DARK, box(u - w / 2 + 0.02, y, zf + 0.02, u + w / 2 - 0.02, y + h - 0.03, zf + 0.08));
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) if (rand() < 0.8) bag.add(LOG, box(u - w / 2 + 0.07 + k * (w - 0.14) / 4, y + 0.15 + r * (h - 0.3) / 4, zf + 0.08, u - w / 2 + 0.07 + k * (w - 0.14) / 4 + 0.09, y + 0.15 + r * (h - 0.3) / 4 + 0.2, zf + 0.11));
    bag.add(LOG, box(u - 0.015, y, zf + 0.08, u + 0.015, y + h - 0.03, zf + 0.115));
  }
  bag.add(DARK, box(u - w / 2 - 0.1, y, zf - 0.02, u - w / 2, y + h + 0.1, zf + 0.12));
  bag.add(DARK, box(u + w / 2, y, zf - 0.02, u + w / 2 + 0.1, y + h + 0.1, zf + 0.12));
  bag.add(DARK, box(u - w / 2 - 0.1, y + h, zf - 0.02, u + w / 2 + 0.1, y + h + 0.12, zf + 0.13));
}

/** A flat roof's furniture: parapet round the edge (a lip 0.28 high), a drain spout or two, bundles of stalks, a pot. */
export function roofTop(bag, col, rect, top, rand, o = {}) {
  const [x0, z0, x1, z1] = rect, t = 0.3, ph = 0.3;
  bag.add(MUD, box(x0, top, z0, x1, top + 0.1, z1));
  for (const r of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]]) bag.add(WALL, box(r[0], top, r[1], r[2], top + ph, r[3]));
  // the spouts of the drain: hollowed half-logs through the parapet
  for (let k = 0; k < 2; k++) { const u = x0 + (x1 - x0) * (0.25 + 0.5 * k + (rand() - 0.5) * 0.1); bag.add(DARK, box(u - 0.07, top + 0.06, z1, u + 0.07, top + 0.13, z1 + 0.5)); }
  col.floor(rect, top + 0.1);
  if (o.stalks) for (let k = 0; k < o.stalks; k++) milletStack(bag, { circle() {} }, x0 + 0.8 + rand() * (x1 - x0 - 1.6), top + 0.1, z0 + 0.8 + rand() * (z1 - z0 - 1.6), 1.0 + rand() * 0.6, 0.35, Math.floor(rand() * 999));
  if (o.pots) for (let k = 0; k < o.pots; k++) jar(bag, x0 + 0.7 + rand() * (x1 - x0 - 1.4), top + 0.1, z0 + 0.7 + rand() * (z1 - z0 - 1.4), 1.0 + rand() * 0.3, rand() < 0.5 ? 'terracotta' : 'pottery_dark');
}

/** An altar: a cone of mud (Lébé: pointed, whitened with millet offerings) or the binu (a small house with a door). */
export function altar(bag, col, x, y, z, kind, rand) {
  if (kind === 'cone') {
    bag.add(STONE, lathe([[0.7, -0.2], [0.68, 0.1], [0.001, 0.1]], 10, (t) => 1 + 0.06 * Math.sin(t * 5), x, y, z));
    bag.add(WALL, lathe([[0.55, 0.08], [0.4, 0.5], [0.22, 0.95], [0.001, 1.25]], 10, (t, i) => 1 + 0.05 * Math.sin(t * 4 + i), x, y, z));
    bag.add('plaster_white', lathe([[0.3, 0.55], [0.25, 0.7], [0.14, 0.95], [0.12, 0.94], [0.2, 0.7], [0.27, 0.55]], 10, (t) => 1 + 0.2 * Math.sin(t * 3), x, y, z));      // the crust of the offerings
    col.circle(x, z, 0.65, y - 0.2, y + 1.3);
  } else {
    bag.add(WALL, box(x - 0.7, y - 0.2, z - 0.55, x + 0.7, y + 1.05, z + 0.55));
    bag.add(MUD, box(x - 0.78, y + 1.05, z - 0.63, x + 0.78, y + 1.18, z + 0.63));
    bag.add(HOLE, box(x - 0.2, y + 0.25, z + 0.55, x + 0.2, y + 0.75, z + 0.562));
    bag.add(DARK, box(x - 0.17, y + 0.28, z + 0.562, x + 0.17, y + 0.72, z + 0.58));
    bag.add('plaster_white', box(x - 0.7, y + 0.9, z + 0.55, x + 0.7, y + 0.98, z + 0.563));
    for (let k = 0; k < 4; k++) bag.add(RED, box(x - 0.6 + k * 0.33, y + 0.5, z + 0.55, x - 0.5 + k * 0.33, y + 0.62, z + 0.564));
    col.rect([x - 0.78, z - 0.63, x + 0.78, z + 0.63], y - 0.2, y + 1.2);
  }
  void rand;
}
