// Small pieces of the palace court and the town's yards (docs/settlements/mongol-karakorum.md §4, §11): the flagged way from the gate to the hall's steps, hitching rails for
// the visitors' horses, the cellar's brick mouth from which the khan's drinks were carried [stated: Rubruck: the drinks were kept in a cellar outside the hall], felt-roofed
// store sheds, a stone lamp-post, a wooden mounting block. Each is an element of the style.
import { box, rod, lathe, obox, rng } from './util.js';

/** court_path: { rect, y? } a way of laid stones, with a kerb either side. */
export function courtPath(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(Math.round(x0 * 3 + z0));
  bag.add('flagstone', box(x0, y - 0.2, z0, x1, y + 0.03, z1)); col.floor(el.rect, y + 0.03);
  const alongZ = z1 - z0 > x1 - x0;
  // joints between the stones, a few lifted or sunk ones, the dark kerbs
  for (let t = 1.2; t < (alongZ ? z1 - z0 : x1 - x0); t += 1.2) bag.add('granite_black', alongZ ? box(x0, y + 0.03, z0 + t, x1, y + 0.034, z0 + t + 0.03) : box(x0 + t, y + 0.03, z0, x0 + t + 0.03, y + 0.034, z1));
  bag.add('granite_grey', alongZ ? box(x0 - 0.12, y - 0.1, z0, x0, y + 0.1, z1) : box(x0, y - 0.1, z0 - 0.12, x1, y + 0.1, z0));
  bag.add('granite_grey', alongZ ? box(x1, y - 0.1, z0, x1 + 0.12, y + 0.1, z1) : box(x0, y - 0.1, z1, x1, y + 0.1, z1 + 0.12));
  for (let k = 0; k < 6; k++) { const px = x0 + rand() * (x1 - x0 - 0.6), pz = z0 + rand() * (z1 - z0 - 0.6); bag.add('granite_rough', box(px, y + 0.03, pz, px + 0.5, y + 0.05, pz + 0.5)); }
}
/** hitch: { a, b, y? } a hitching rail: posts every 2 m and two rails, worn at the top by the ropes. */
export function hitch(el, { bag, col }) {
  const [a, b] = [el.a, el.b], y = el.y ?? 0, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let s = 0; s <= L + 0.01; s += 2) { const x = a[0] + ux * s, z = a[1] + uz * s; bag.add('wood_dark', rod([x, y, z], [x, y + 1.25, z], 0.07, 6)); col.circle(x, z, 0.09, y, y + 1.25); }
  for (const h of [0.75, 1.15]) bag.add('timber', rod([a[0], y + h, a[1]], [b[0], y + h, b[1]], 0.04, 5));
  for (let s = 0.5; s < L; s += 1.9) bag.add('hide_tan', rod([a[0] + ux * s, y + 1.15, a[1] + uz * s], [a[0] + ux * s + 0.04, y + 0.7, a[1] + uz * s], 0.012, 3));
}
/** cellar: { at: [x, z], yaw } the mouth of a cellar: a vaulted brick hood over steps going down, a timber door leaf open, jars at the side. */
export function cellar(el, { bag, col }) {
  const [cx, cz] = el.at, W = 3.4, D = 3.0, H = 2.3;
  bag.add('brick_grey', box(cx - W / 2, 0, cz - D / 2, cx - W / 2 + 0.5, H, cz + D / 2)); bag.add('brick_grey', box(cx + W / 2 - 0.5, 0, cz - D / 2, cx + W / 2, H, cz + D / 2));
  bag.add('brick_grey', box(cx - W / 2, 0, cz - D / 2, cx + W / 2, H + 0.6, cz - D / 2 + 0.5));
  col.rect([cx - W / 2, cz - D / 2, cx - W / 2 + 0.5, cz + D / 2], 0, H); col.rect([cx + W / 2 - 0.5, cz - D / 2, cx + W / 2, cz + D / 2], 0, H); col.rect([cx - W / 2, cz - D / 2, cx + W / 2, cz - D / 2 + 0.5], 0, H + 0.6);
  bag.add('brick_buff', lathe([[W / 2, 0], [W / 2 - 0.3, 0.5], [0.6, 0.9], [0.001, 1.0]], 12, null, cx, H, cz - 0.2).scale(1, 0.55, 0.9));
  bag.add('opening', box(cx - W / 2 + 0.5, 0, cz - D / 2 + 0.5, cx + W / 2 - 0.5, 0.03, cz + D / 2)); 
  bag.add('wood_dark', obox([cx + 1.0, cz + D / 2], [cx + 2.0, cz + D / 2 + 0.4], 0.06, 0, 1.8));
  for (let k = 0; k < 3; k++) bag.add('terracotta', lathe([[0.1, 0], [0.26, 0.1], [0.3, 0.3], [0.2, 0.55], [0.12, 0.62], [0.001, 0.62]], 8, null, cx - 1.9 + k * 0.1, 0, cz + D / 2 + 0.6 + k * 0.6));
}
/** shed: { rect, y? } a store shed of poles under a roof of felt on a ridge pole (open at the front, the front being +z): barrels and sacks under it. */
export function shed(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2, H = 2.5;
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { bag.add('wood_dark', rod([x, y, z], [x, y + H, z], 0.08, 6)); col.circle(x, z, 0.1, y, y + H); }
  bag.add('timber', rod([cx, y + H + 0.7, z0], [cx, y + H + 0.7, z1], 0.07, 6));
  const g = [[x0 - 0.3, y + H, z0, cx, y + H + 0.7, z0], [cx, y + H + 0.7, z0, x1 + 0.3, y + H, z0]];
  void g;
  bag.add('cloth_white', box(x0 - 0.3, y + H, z0, cx, y + H + 0.7, z1)); bag.add('cloth_white', box(cx, y + H, z0, x1 + 0.3, y + H + 0.7, z1));
  bag.add('hide_grey', box(x0 + 0.1, y, z0 + 0.0, x1 - 0.1, y + 1.6, z0 + 0.06));
}
