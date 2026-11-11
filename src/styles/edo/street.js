// The civic furniture of the Edo castle town (docs/settlements/edo-himeji.md §5.7): the neighbourhood gates (kido) shut at
// night across the street, the fire-watch tower (hinomi-yagura), the notice board (kōsatsu) under its little roof, a roadside
// Jizō shrine with its stone figures in red bibs, an Inari shrine with its red torii and stone foxes.
import { box, lathe, rod } from '../../core/geom.js';

const WD = 'wood_dark', TL = 'tile_grey', G = 'granite_grey', RED = 'lacquer_red';
const gableRoof = (bag, x0, z0, x1, z1, y, rise, mat = TL) => {
  // a simple gable over [x0,z0,x1,z1], ridge along x, as stepped slabs (cheap)
  const n = 5, hz = (z1 - z0) / 2, zc = (z0 + z1) / 2;
  for (let k = 0; k < n; k++) { const t = k / n, hw = hz * (1 - t); bag.add(mat, box(x0, y + rise * t, zc - hw, x1, y + rise * (t + 1 / n) + 0.06, zc + hw)); }
};

/** kido: a gate across the street { at, w (the street's width), along ('x': the street runs along x) } — two heavy posts, a lintel, a small tiled roof, a leaf pushed back at each side. */
export function kido(el, { bag, col }) {
  const [x, z] = el.at, w = el.w ?? 8, H = 3.3, y = el.y ?? 0, a = x, hw = w / 2;
  // the street runs along x; the gate stands across it at x, spanning z ± w/2
  for (const sz of [-1, 1]) { bag.add(WD, box(a - 0.2, y, z + sz * hw - 0.2 + (sz > 0 ? 0 : 0), a + 0.2, y + H, z + sz * hw + 0.2)); col.rect([a - 0.2, z + sz * hw - 0.2, a + 0.2, z + sz * hw + 0.2], y, y + H);
    bag.add(G, box(a - 0.3, y, z + sz * hw - 0.3, a + 0.3, y + 0.25, z + sz * hw + 0.3)); }
  bag.add(WD, box(a - 0.17, y + H - 0.1, z - hw - 0.3, a + 0.17, y + H + 0.2, z + hw + 0.3));
  bag.add(WD, box(a - 0.12, y + H - 0.8, z - hw, a + 0.12, y + H - 0.65, z + hw));
  // the roof over the lintel, a signboard hung from it
  bag.add(TL, box(a - 0.55, y + H + 0.2, z - hw - 0.4, a + 0.55, y + H + 0.3, z + hw + 0.4));
  bag.add('tile_dark', box(a - 0.15, y + H + 0.3, z - hw - 0.4, a + 0.15, y + H + 0.42, z + hw + 0.4));
  bag.add('wood_painted', box(a - 0.03, y + H - 1.35, z - 0.6, a + 0.03, y + H - 0.8, z + 0.6)); bag.add('lacquer_black', box(a + 0.03, y + H - 1.2, z - 0.4, a + 0.05, y + H - 0.95, z + 0.4));
  // the leaves stand open against the posts: planks barred in iron
  for (const sz of [-1, 1]) { const zz = z + sz * (hw - 0.3); bag.add(WD, box(a + 0.22, y + 0.05, Math.min(zz, zz - sz * 1.4), a + 0.3, y + H - 0.85, Math.max(zz, zz - sz * 1.4))); for (const v of [0.5, 1.4, 2.2]) bag.add('iron', box(a + 0.3, y + v, Math.min(zz, zz - sz * 1.4), a + 0.32, y + v + 0.08, Math.max(zz, zz - sz * 1.4))); }
}

/** hinomi_yagura: a fire-watch tower { at } — four tall posts braced across, a watch platform with a rail, a hipped little roof, a ladder, the alarm bell hung under the roof. */
export function hinomiYagura(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 9, s = 1.5;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add(WD, rod([x + sx * s * 1.15, y, z + sz * s * 1.15], [x + sx * s * 0.75, y + h, z + sz * s * 0.75], 0.12, 6));
  for (const v of [0.3, 0.55, 0.8]) { const k = 1.15 - 0.4 * v, yy = y + h * v; for (const sg of [-1, 1]) { bag.add(WD, rod([x - s * k, yy, z + sg * s * k], [x + s * k, yy, z + sg * s * k], 0.05, 5)); bag.add(WD, rod([x + sg * s * k, yy, z - s * k], [x + sg * s * k, yy, z + s * k], 0.05, 5)); } }
  for (let k = 0; k < 3; k++) { const v0 = k / 3, v1 = (k + 1) / 3; for (const sg of [-1, 1]) { const a0 = 1.15 - 0.4 * v0, a1 = 1.15 - 0.4 * v1; bag.add(WD, rod([x - s * a0, y + h * v0, z + sg * s * a0], [x + s * a1, y + h * v1, z + sg * s * a1], 0.035, 4)); } }
  const ph = y + h, e = s * 0.75 + 0.35;
  bag.add('timber', box(x - e, ph, z - e, x + e, ph + 0.12, z + e));
  for (const sg of [-1, 1]) { bag.add(WD, box(x - e, ph + 0.12, z + sg * e - 0.03, x + e, ph + 0.95, z + sg * e + 0.03)); bag.add(WD, box(x + sg * e - 0.03, ph + 0.12, z - e, x + sg * e + 0.03, ph + 0.95, z + e)); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add(WD, box(x + sx * (e - 0.05) - 0.05, ph + 0.12, z + sz * (e - 0.05) - 0.05, x + sx * (e - 0.05) + 0.05, ph + 2.2, z + sz * (e - 0.05) + 0.05));
  for (let k = 0; k < 4; k++) { const t = k / 4, hh = e + 0.5 - (e + 0.5) * t; bag.add(TL, box(x - hh, ph + 2.2 + k * 0.22, z - hh, x + hh, ph + 2.2 + k * 0.22 + 0.16, z + hh)); }
  bag.add('bronze', lathe([[0.001, 0], [0.22, 0], [0.2, 0.3], [0.12, 0.42], [0.001, 0.44]], 10, null, x, ph + 1.45, z));
  // the ladder up one side
  for (const sg of [-1, 1]) bag.add(WD, rod([x + sg * 0.25 + 0, y, z + s * 1.2 + 0.7], [x + sg * 0.25, ph, z + s * 0.75], 0.04, 4));
  for (let v = 0.4; v < h - 0.3; v += 0.4) bag.add(WD, rod([x - 0.25, y + v, z + s * (1.2 - 0.45 * v / h) + 0.7 * (1 - v / h)], [x + 0.25, y + v, z + s * (1.2 - 0.45 * v / h) + 0.7 * (1 - v / h)], 0.02, 4));
  col.rect([x - s * 1.4, z - s * 1.4, x + s * 1.4, z + s * 1.4], y, y + 1.0);
  bag.add(G, box(x - s * 1.4, y, z - s * 1.4, x + s * 1.4, y + 0.2, z + s * 1.4));
}

/** kosatsu: the notice board { at, rot } — a tall board of planks under a tiled roof on two posts over a stone footing, notices pasted on it. */
export function kosatsu(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a), P = (u, v, q) => [x + u * c + q * s, y + v, z - u * s + q * c];
  const bx = (m, u0, u1, v0, v1, q0, q1) => { const p0 = P(u0, v0, q0), p1 = P(u1, v1, q1); bag.add(m, box(Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.min(p0[2], p1[2]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1]), Math.max(p0[2], p1[2]))); };
  bx(G, -1.4, 1.4, 0, 0.4, -0.5, 0.5);
  for (const u of [-1.2, 1.2]) bx(WD, u - 0.08, u + 0.08, 0.4, 3.0, -0.08, 0.08);
  bx(WD, -1.3, 1.3, 0.8, 2.6, -0.04, 0.04);
  for (let k = 0; k < 5; k++) bx(k % 2 ? 'linen' : 'paint_white', -1.1 + k * 0.45, -0.75 + k * 0.45, 1.2 + (k % 3) * 0.3, 1.8 + (k % 3) * 0.3, 0.04, 0.045);
  bx(TL, -1.55, 1.55, 3.0, 3.1, -0.5, 0.5); bx('tile_dark', -1.55, 1.55, 3.1, 3.25, -0.2, 0.2); bx(TL, -1.45, 1.45, 3.05, 3.2, -0.35, 0.35);
  const p0 = P(-1.5, 0, -0.6), p1 = P(1.5, 0, 0.6); col.rect([Math.min(p0[0], p1[0]), Math.min(p0[2], p1[2]), Math.max(p0[0], p1[0]), Math.max(p0[2], p1[2])], y, y + 3.2);
}

/** jizo: a roadside Jizō { at, rot } — a little roofed shrine on a stone plinth with three stone figures in red bibs and offerings before them. */
export function jizo(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a), P = (u, q) => [x + u * c + q * s, z - u * s + q * c];
  const bx = (m, u0, u1, v0, v1, q0, q1) => { const p0 = P(u0, q0), p1 = P(u1, q1); bag.add(m, box(Math.min(p0[0], p1[0]), y + v0, Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), y + v1, Math.max(p0[1], p1[1]))); };
  bx(G, -1.0, 1.0, 0, 0.3, -0.7, 0.7);
  for (const u of [-0.85, 0.85]) for (const q of [-0.55, 0.55]) bx(WD, u - 0.06, u + 0.06, 0.3, 1.9, q - 0.06, q + 0.06);
  bx('wood_dark', -0.9, 0.9, 0.3, 1.7, 0.5, 0.6);
  bx(TL, -1.15, 1.15, 1.9, 2.0, -0.8, 0.8); bx(TL, -0.9, 0.9, 2.0, 2.15, -0.55, 0.55); bx('tile_dark', -0.4, 0.4, 2.15, 2.3, -0.2, 0.2);
  for (const [u, k] of [[-0.55, 0.9], [0, 1.0], [0.55, 0.9]]) {
    const p = P(u, 0.0);
    bag.add(G, lathe([[0.001, 0], [0.17 * k, 0], [0.19 * k, 0.28 * k], [0.15 * k, 0.5 * k], [0.12 * k, 0.55 * k], [0.14 * k, 0.72 * k], [0.001, 0.78 * k]], 9, null, p[0], y + 0.3, p[1]));
    bag.add('cloth_red', lathe([[0.17 * k, 0.5 * k], [0.15 * k, 0.5 * k], [0.15 * k, 0.43 * k], [0.18 * k, 0.43 * k]], 9, null, p[0], y + 0.3, p[1]));
  }
  bx('glaze_white', -0.3, -0.12, 0.3, 0.38, -0.55, -0.37); bx('cloth_red', 0.2, 0.34, 0.3, 0.36, -0.5, -0.36);
  const p0 = P(-1.1, -0.8), p1 = P(1.1, 0.8); col.rect([Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])], y, y + 2.2);
}

/** inari: a small Inari shrine { at, rot } — two red torii in a row, a pair of stone foxes, the shrine behind on a stone step, a rope and bell. */
export function inari(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a), P = (u, q) => [x + u * c + q * s, z - u * s + q * c];
  const bx = (m, u0, u1, v0, v1, q0, q1) => { const p0 = P(u0, q0), p1 = P(u1, q1); bag.add(m, box(Math.min(p0[0], p1[0]), y + v0, Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), y + v1, Math.max(p0[1], p1[1]))); };
  for (const q of [-5.5, -3.2]) {
    for (const u of [-1.0, 1.0]) bx(RED, u - 0.11, u + 0.11, 0, 3.0, q - 0.11, q + 0.11);
    bx(RED, -1.4, 1.4, 2.75, 2.9, q - 0.12, q + 0.12); bx('lacquer_black', -1.6, 1.6, 3.0, 3.18, q - 0.16, q + 0.16); bx(RED, -1.1, 1.1, 2.4, 2.5, q - 0.08, q + 0.08);
  }
  for (const u of [-1.6, 1.6]) { const p = P(u, -1.2); bag.add(G, lathe([[0.001, 0], [0.3, 0], [0.3, 0.3], [0.22, 0.34], [0.2, 0.7], [0.001, 0.9]], 8, null, p[0], y, p[1])); bag.add('cloth_red', lathe([[0.2, 0.62], [0.17, 0.62], [0.17, 0.55], [0.21, 0.55]], 8, null, p[0], y, p[1])); }
  bx(G, -1.3, 1.3, 0, 0.35, -0.2, 1.6);
  bx('wood_dark', -0.9, 0.9, 0.35, 2.0, 0.2, 1.4); bx('lacquer_black', -0.45, 0.45, 0.6, 1.8, 0.18, 0.2);
  bx(TL, -1.2, 1.2, 2.0, 2.12, 0.0, 1.6); bx(TL, -0.9, 0.9, 2.12, 2.3, 0.3, 1.3); bx('tile_dark', -0.9, 0.9, 2.3, 2.4, 0.6, 1.0);
  bag.add('rope_fibre', rod([...P(-0.3, -0.05).slice(0, 1), y + 1.9, P(-0.3, -0.05)[1]], [P(-0.3, -0.05)[0], y + 1.2, P(-0.3, -0.05)[1]], 0.03, 5));
  const p0 = P(-1.4, -0.3), p1 = P(1.4, 1.7); col.rect([Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])], y, y + 2.4);
}
