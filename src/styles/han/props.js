// Han Chang'an's small things (docs/settlements/han-changan.md §5b): the bronze ding and the drum on its post, the lamp tree, the banner,
// the lacquered screen, the bed couch, the stove, the loom, the foot-pounder, the vats, the strings of corn and gourds; built in world
// coordinates at (x, y, z) by the element builders (court.js, houses.js, market.js, dress.js). Small pieces are fine detail (src/core/geom.js).
import { box, lathe, clothBox, addCloth } from '../../core/geom.js';
import { limb, torus, T } from '../qing/carving.js';

export const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
/** A frame at (x, z) turned by yaw (0, 90, 180, 270 degrees as 0..3 quarter turns): local (u, v) to world. */
export const turnPt = (x, z, q) => (u, v) => { const c = [[1, 0], [0, 1], [-1, 0], [0, -1]][q & 3], s = [[0, 1], [-1, 0], [0, -1], [1, 0]][q & 3]; return [x + u * c[0] + v * s[0], z + u * c[1] + v * s[1]]; };
/** A box in a quarter-turned frame at (x, z): local u0..u1, v0..v1 → the world's axis-aligned box. */
export function qbox(bag, mat, x, z, q, u0, y0, v0, u1, y1, v1) {
  const P = turnPt(x, z, q), a = P(u0, v0), b = P(u1, v1);
  bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1])));
}
const blob = (bag, mat, r, h, x, y, z, seg = 5) => bag.add(mat, lathe([[0.001, 0], [r, 0.45 * h], [0.001, h]], Math.min(seg, 5), null, x, y, z));

/** The bronze tripod cauldron (ding): the round belly, two upright ears, three stout legs. s scales. */
export function ding(bag, x, y, z, s = 1) {
  bag.add('bronze', lathe([[0.001, 0.5 * s], [0.42 * s, 0.55 * s], [0.58 * s, 0.85 * s], [0.6 * s, 1.1 * s], [0.52 * s, 1.28 * s], [0.5 * s, 1.34 * s], [0.4 * s, 1.34 * s], [0.4 * s, 1.26 * s]], 14, null, x, y, z));
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5, lx = x + Math.cos(a) * 0.38 * s, lz = z + Math.sin(a) * 0.38 * s; bag.add('bronze', lathe([[0.1 * s, 0.62 * s], [0.12 * s, 0.4 * s], [0.07 * s, 0], [0.001, 0]], 7, null, lx, y, lz)); }
  for (const sg of [-1, 1]) bag.add('bronze', box(x + sg * 0.5 * s - 0.04, y + 1.3 * s, z - 0.12 * s, x + sg * 0.5 * s + 0.04, y + 1.65 * s, z + 0.12 * s));
}
/** The drum on its post (jiangu): a lacquered drum lying across a post on a square drum-base, a canopy of feathers (a cloth) over it. */
export function drumPost(bag, x, y, z, q = 0, s = 1) {
  qbox(bag, 'timber_red', x, z, q, -0.9 * s, y, -0.9 * s, 0.9 * s, y + 0.3 * s, 0.9 * s);
  bag.add('timber_red', lathe([[0.1 * s, 0.3 * s], [0.08 * s, 2.7 * s]], 7, null, x, y, z));
  const g = lathe([[0.001, -0.55 * s], [0.5 * s, -0.5 * s], [0.62 * s, -0.2 * s], [0.62 * s, 0.2 * s], [0.5 * s, 0.5 * s], [0.001, 0.55 * s]], 12);
  g.rotateZ(Math.PI / 2); if (q & 1) g.rotateY(Math.PI / 2); g.translate(x, y + 1.5 * s, z);
  bag.add('lacquer_red', g);
  for (const sg of [-1, 1]) { const gg = lathe([[0.001, 0.5 * s], [0.65 * s, 0.5 * s], [0.65 * s, 0.56 * s], [0.001, 0.56 * s]], 12); gg.rotateZ(Math.PI / 2); gg.translate(0, 0, 0); void gg; void sg; }
  bag.add('tile_dark', lathe([[0.001, 2.95 * s], [0.9 * s, 2.55 * s], [0.9 * s, 2.5 * s], [0.001, 2.7 * s]], 8, null, x, y, z));
}
/** A banner on a pole: the cloth hangs from a crossbar. */
export function banner(bag, x, y, z, h = 6, cloth = 'cloth_red', q = 0, w = 1.0) {
  bag.add('timber', lathe([[0.1, 0], [0.07, h]], 6, null, x, y, z));
  bag.add('bronze', lathe([[0.001, h], [0.1, h + 0.05], [0.001, h + 0.45]], 6, null, x, y, z));
  qbox(bag, 'timber', x, z, q, -w / 2 - 0.1, y + h - 0.2, -0.04, w / 2 + 0.1, y + h - 0.12, 0.04);
  const P = turnPt(x, z, q), a = P(-w / 2, 0), b = P(w / 2, 0);
  addCloth(bag, cloth, clothBox(Math.min(a[0], b[0]) - 0.02, y + h - 2.6, Math.min(a[1], b[1]) - 0.02, Math.max(a[0], b[0]) + 0.02, y + h - 0.22, Math.max(a[1], b[1]) + 0.02, 0.3), y + h - 0.22);
}
/** A bronze lamp tree (lianzhi deng): a pole on a base with curved branches each ending in a small lamp cup. */
export function lampTree(bag, x, y, z, h = 1.7) {
  bag.add('bronze', lathe([[0.22, 0], [0.18, 0.12], [0.05, 0.2], [0.04, h], [0.001, h + 0.1]], 8, null, x, y, z));
  for (let k = 0; k < 3; k++) {
    const a = k * 2.094, yy = y + h * (0.55 + k * 0.15), ex = x + Math.cos(a) * 0.45, ez = z + Math.sin(a) * 0.45;
    bag.add('bronze', limb([x, yy, z], [ex, yy + 0.12, ez], 0.022, 0.016, 5));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.07, 0.03], [0.08, 0.06], [0.001, 0.06]], 6, null, ex, yy + 0.12, ez));
  }
}
/** A stone stele on a tortoise-less plinth (a square slab, a rounded head). */
export function stele(bag, x, y, z, q = 0, h = 2.2) {
  qbox(bag, 'bluestone', x, z, q, -0.55, y, -0.3, 0.55, y + 0.25, 0.3);
  qbox(bag, 'granite_grey', x, z, q, -0.38, y + 0.25, -0.12, 0.38, y + h, 0.12);
  qbox(bag, 'granite_grey', x, z, q, -0.3, y + h, -0.12, 0.3, y + h + 0.16, 0.12);
}
/** A war chariot or a carriage (che): a low railed bed on two spoked wheels, a pole running forward, a canopy; faces +x turned by yaw (radians). */
export function chariot(bag, x, y, z, yaw = 0, canopy = true, lacquer = 'lacquer_black') {
  const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v, yy) => [x + u * c - v * s, y + yy, z + u * s + v * c];
  const place = (g) => { g.rotateY(-yaw); g.translate(x, y, z); return g; };
  void place;
  const bed = (u0, u1, v0, v1, y0, y1, m) => {
    // the bed is turned about the vertical: the box's four corners via a limb-free approach: a thin lathe is wrong, so a rotated box
    const g = box(u0, y0, v0, u1, y1, v1); g.rotateY(-yaw); g.translate(x, y, z); bag.add(m, g);
  };
  bed(-0.7, 0.7, -0.6, 0.6, 0.55, 0.62, lacquer);
  for (const [u0, u1, v0, v1] of [[-0.7, -0.64, -0.6, 0.6], [-0.7, 0.7, -0.6, -0.54], [-0.7, 0.7, 0.54, 0.6]]) bed(u0, u1, v0, v1, 0.62, 1.05, 'lacquer_red');
  bed(-0.95, 1.6, -0.06, 0.06, 0.5, 0.58, 'timber');                                       // the pole
  bed(1.55, 1.7, -0.7, 0.7, 0.62, 0.7, 'timber');                                           // the yoke
  for (const v of [-0.78, 0.78]) {
    const a = P(0, v, 0.6), w = torus(0.6, 0.055, 14, 4); w.rotateX(Math.PI / 2); w.rotateY(-yaw); w.translate(a[0], a[1], a[2]); bag.add('timber', w);
    const hub = lathe([[0.001, -0.12], [0.1, -0.1], [0.1, 0.1], [0.001, 0.12]], 6); hub.rotateX(Math.PI / 2); hub.rotateY(-yaw); hub.translate(a[0], a[1], a[2]); bag.add('bronze', hub);
    for (let k = 0; k < 6; k++) { const t = k * Math.PI / 6; const e1 = P(Math.cos(t) * 0.58, v, 0.6 + Math.sin(t) * 0.58), e2 = P(-Math.cos(t) * 0.58, v, 0.6 - Math.sin(t) * 0.58); bag.add('timber', limb(e2, e1, 0.025, 0.025, 4)); }
  }
  if (canopy) {
    const t = P(0, 0, 0.62), top = P(0, 0, 2.4);
    bag.add('timber', limb(t, top, 0.04, 0.03, 5));
    bag.add('cloth_indigo', lathe([[0.001, 2.62], [0.9, 2.3], [1.15, 2.22], [1.1, 2.18], [0.001, 2.4]], 10, null, x, y, z));
  }
}
/** The kitchen stove (zao): a clay block with two pot mouths, an iron pot and a steamer on it, a chimney at the back; faces v < 0. */
export function stove(bag, x, y, z, q = 0) {
  qbox(bag, 'mud_plaster', x, z, q, -0.8, y, -0.5, 0.8, y + 0.75, 0.5);
  qbox(bag, 'brick_paving', x, z, q, -0.8, y + 0.72, -0.5, 0.8, y + 0.78, 0.5);
  qbox(bag, 'iron', x, z, q, -0.5, y + 0.2, -0.52, -0.1, y + 0.55, -0.49);
  const P = turnPt(x, z, q), a = P(-0.4, 0), b = P(0.35, 0);
  bag.add('iron', lathe([[0.001, 0], [0.26, 0.04], [0.34, 0.2], [0.36, 0.26], [0.001, 0.26]], 9, null, a[0], y + 0.78, a[1]));
  bag.add('pottery_dark', lathe([[0.24, 0], [0.28, 0.2], [0.26, 0.4], [0.2, 0.45], [0.001, 0.45]], 9, null, b[0], y + 0.78, b[1]));
  qbox(bag, 'mud_plaster', x, z, q, 0.55, y + 0.78, 0.2, 0.85, y + 2.6, 0.5);
}
/** The upright loom (zhiji) of the Han weaver: a frame, the warp threads, the cloth beam, a stool. Faces v < 0. */
export function loom(bag, x, y, z, q = 0) {
  qbox(bag, 'wood_ochre', x, z, q, -0.75, y, -0.35, -0.65, y + 1.5, -0.25);
  qbox(bag, 'wood_ochre', x, z, q, 0.65, y, -0.35, 0.75, y + 1.5, -0.25);
  qbox(bag, 'wood_ochre', x, z, q, -0.75, y + 1.4, -0.35, 0.75, y + 1.5, -0.25);
  qbox(bag, 'wood_ochre', x, z, q, -0.75, y + 0.4, -0.35, 0.75, y + 0.48, -0.25);
  qbox(bag, 'wood_ochre', x, z, q, -0.75, y, 0.3, -0.65, y + 0.9, 0.4);
  qbox(bag, 'wood_ochre', x, z, q, 0.65, y, 0.3, 0.75, y + 0.9, 0.4);
  for (let k = 0; k < 9; k++) qbox(bag, 'cloth_white', x, z, q, -0.6 + k * 0.15, y + 0.5, -0.31, -0.585 + k * 0.15, y + 1.4, -0.29);
  qbox(bag, 'cloth_indigo', x, z, q, -0.6, y + 0.5, -0.31, 0.6, y + 0.62, -0.29);
  qbox(bag, 'timber', x, z, q, -0.3, y, 0.55, 0.3, y + 0.38, 0.95);
}
/** The foot-pounder (dui): a tilting beam on a post with a pestle at one end over a stone mortar, a treadle at the other. */
export function pounder(bag, x, y, z, q = 0) {
  qbox(bag, 'timber', x, z, q, -0.04, y + 0.3, -0.5, 0.04, y + 0.75, -0.4);
  qbox(bag, 'timber', x, z, q, -0.04, y + 0.3, 0.4, 0.04, y + 0.75, 0.5);
  qbox(bag, 'timber', x, z, q, -0.1, y + 0.62, -1.3, 0.1, y + 0.78, 1.1);
  const P = turnPt(x, z, q), m = P(0, -1.2);
  bag.add('granite_grey', lathe([[0.25, 0], [0.3, 0.1], [0.28, 0.32], [0.18, 0.32], [0.16, 0.12], [0.001, 0.1]], 9, null, m[0], y, m[1]));
  qbox(bag, 'timber', x, z, q, -0.05, y + 0.36, -1.25, 0.05, y + 0.66, -1.15);
}
/** A rice or grain vat: a big storage jar with a lid. */
export function vat(bag, x, y, z, s = 1, mat = 'pottery_dark') {
  bag.add(mat, lathe([[0.001, 0], [0.26 * s, 0.02], [0.4 * s, 0.35 * s], [0.42 * s, 0.7 * s], [0.34 * s, 0.98 * s], [0.28 * s, 1.04 * s], [0.001, 1.04 * s]], 10, null, x, y, z));
  bag.add('timber', lathe([[0.001, 1.03 * s], [0.3 * s, 1.03 * s], [0.3 * s, 1.08 * s], [0.001, 1.1 * s]], 8, null, x, y, z));
}
/** A bed-couch (ta) with a folding screen at its head and a quilt. */
export function couch(bag, x, y, z, q = 0, w = 2.0, d = 1.1) {
  qbox(bag, 'wood_dark', x, z, q, -w / 2, y + 0.15, -d / 2, w / 2, y + 0.4, d / 2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) qbox(bag, 'wood_dark', x, z, q, sx * (w / 2 - 0.08) - 0.05, y, sz * (d / 2 - 0.08) - 0.05, sx * (w / 2 - 0.08) + 0.05, y + 0.15, sz * (d / 2 - 0.08) + 0.05);
  qbox(bag, 'cloth_indigo', x, z, q, -w / 2 + 0.05, y + 0.4, -d / 2 + 0.05, w / 2 - 0.05, y + 0.48, d / 2 - 0.05);
  qbox(bag, 'cloth_red', x, z, q, -w / 2 + 0.05, y + 0.48, -d / 2 + 0.05, -w / 2 + 0.7, y + 0.56, d / 2 - 0.05);
  qbox(bag, 'lacquer_black', x, z, q, -w / 2, y + 0.4, d / 2, w / 2, y + 1.45, d / 2 + 0.06);
  qbox(bag, 'paint_caihua', x, z, q, -w / 2 + 0.1, y + 0.55, d / 2 - 0.01, w / 2 - 0.1, y + 1.35, d / 2 + 0.01);
}
/** A low lacquered table (an) with its things on it. */
export function lowTable(bag, x, y, z, q = 0, w = 1.1, d = 0.6, red = false) {
  qbox(bag, red ? 'lacquer_red' : 'lacquer_black', x, z, q, -w / 2, y + 0.3, -d / 2, w / 2, y + 0.36, d / 2);
  for (const sx of [-1, 1]) qbox(bag, 'lacquer_black', x, z, q, sx * (w / 2 - 0.04) - 0.025, y, -d / 2, sx * (w / 2 - 0.04) + 0.025, y + 0.3, d / 2);
}
/** A chest (xiang) and a cupboard. */
export function chest(bag, x, y, z, q = 0, w = 0.9, h = 0.6) {
  qbox(bag, 'lacquer_red', x, z, q, -w / 2, y, -0.3, w / 2, y + h, 0.3);
  qbox(bag, 'bronze', x, z, q, -0.05, y + h * 0.5, -0.31, 0.05, y + h * 0.75, -0.29);
}
/** A rack of bamboo-slip books on a shelf (a stack of bundles). */
export function slips(bag, x, y, z, q = 0, n = 8) {
  for (let k = 0; k < n; k++) qbox(bag, k % 3 ? 'bamboo_culm' : 'wood_ochre', x, z, q, -0.5 + k * 0.13, y, -0.14, -0.4 + k * 0.13, y + 0.32, 0.14);
  qbox(bag, 'cloth_indigo', x, z, q, -0.52, y + 0.12, -0.15, 0.56 + (n - 8) * 0.13, y + 0.14, 0.15);
}
/** A string of dried corn cobs, gourds or jujubes hung from an eave at (x, y, z) along q. */
export function strings(bag, x, y, z, q = 0, n = 4, seed = 1) {
  const r = rngOf(seed), P = turnPt(x, z, q);
  for (let k = 0; k < n; k++) {
    const u = (k - (n - 1) / 2) * 0.32 + (r() - 0.5) * 0.08, p = P(u, 0), len = 0.45 + r() * 0.5, kind = r();
    bag.add('rope_fibre', box(p[0] - 0.01, y - len, p[1] - 0.01, p[0] + 0.01, y, p[1] + 0.01));
    if (kind < 0.4) for (let j = 0; j < 4; j++) blob(bag, 'cloth_ochre', 0.07, 0.2, p[0], y - len + j * (len / 4), p[1], 5);
    else if (kind < 0.75) for (let j = 0; j < 3; j++) blob(bag, 'cloth_red', 0.05, 0.1, p[0], y - len + j * (len / 3) + 0.05, p[1], 5);
    else blob(bag, 'cloth_green', 0.11, 0.3, p[0], y - len - 0.1, p[1], 7);
  }
}
/** A stack of firewood against a wall: u0..u1 along the frame, depth 0.5 out. */
export function woodpile(bag, x, y, z, q = 0, w = 1.4, h = 0.9) {
  qbox(bag, 'bark_pine', x, z, q, -w / 2, y, 0, w / 2, y + h, 0.5);
  for (let k = 0; k < 6; k++) qbox(bag, 'wood_ochre', x, z, q, -w / 2 + k * (w / 6) + 0.02, y + 0.05 + (k % 3) * 0.28, 0.5, -w / 2 + (k + 1) * (w / 6) - 0.02, y + 0.2 + (k % 3) * 0.28, 0.53);
}
/** A rain gully and plaster stain on a wall face: thin darker strips down from the cap and flaked patches near the foot, in a quarter-turned frame whose v = 0 is the wall face (stains on the v < 0 side). */
export function weather(bag, x, z, q, u0, u1, h, seed, base = 0.0, side = -1) {
  const r = rngOf(seed), n = Math.max(1, Math.round((u1 - u0) / 3.2));
  for (let k = 0; k < n; k++) {
    const u = u0 + (u1 - u0) * (k + 0.2 + r() * 0.6) / n, hh = h * (0.35 + r() * 0.6), w = 0.08 + r() * 0.2;
    qbox(bag, 'plaster_streak', x, z, q, u, base + h - hh, side * 0.0, u + w, base + h - 0.02, side * 0.045);
  }
  for (let k = 0; k < 2; k++) {
    const u = u0 + (u1 - u0) * (0.1 + r() * 0.8), w = 0.5 + r() * 0.9, hh = 0.4 + r() * 0.7;
    qbox(bag, r() < 0.5 ? 'mud_plaster' : 'lime_plaster', x, z, q, u, base + 0.02, side * 0.012, Math.min(u1, u + w), base + 0.02 + hh, side * 0.06);
  }
}
void T;
