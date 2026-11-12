// Brasília style — small helpers for the furnished interiors and the street furniture: solid boxes with colliders, shelves
// with goods, pseudo-lettering for signs (the engine draws no text), foliage blobs.
import { box, lathe, rod } from '../../core/geom.js';

export const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** A solid box in a material, with its collider (a rect from y0 to y1). */
export function solidBox(bag, col, mat, x0, y0, z0, x1, y1, z1, collide = true) {
  bag.add(mat, box(x0, y0, z0, x1, y1, z1));
  if (collide) col.rect([x0, z0, x1, z1], y0, y1);
}
/**
 * Shelving: a frame of uprights and boards from (x0, z0) to (x1, z1) (one of the two spans is the thickness), `rows` boards from y,
 * goods on each board as small boxes of the palette's materials in runs; `mats` the goods' materials, `h` their height range.
 */
export function shelving(bag, col, rect, y, rows, mats, rand, { h = [0.18, 0.32], frame = 'wood_painted', gap = 0.36, solid = true } = {}) {
  const [x0, z0, x1, z1] = rect, alongX = x1 - x0 > z1 - z0, L = alongX ? x1 - x0 : z1 - z0;
  bag.add(frame, box(x0, y, z0, x1, y + 0.06, z1));
  for (const e of [0, L - 0.05]) bag.add(frame, alongX ? box(x0 + e, y, z0, x0 + e + 0.05, y + rows * gap + 0.1, z1) : box(x0, y, z0 + e, x1, y + rows * gap + 0.1, z0 + e + 0.05));
  for (let r = 0; r < rows; r++) {
    const yy = y + 0.06 + r * gap;
    if (r) bag.add(frame, box(x0, yy, z0, x1, yy + 0.03, z1));
    for (let u = 0.1; u < L - 0.25; ) {
      const w = 0.12 + rand() * 0.22, hh = h[0] + rand() * (h[1] - h[0]), m = mats[Math.floor(rand() * mats.length)];
      if (u + w > L - 0.08) break;
      if (rand() < 0.88) bag.add(m, alongX ? box(x0 + u, yy + 0.03, z0 + 0.04, x0 + u + w, yy + 0.03 + hh, z1 - 0.04) : box(x0 + 0.04, yy + 0.03, z0 + u, x1 - 0.04, yy + 0.03 + hh, z0 + u + w));
      u += w + 0.015 + rand() * 0.05;
    }
  }
  if (solid) col.rect(rect, y, y + rows * gap + 0.1);
}
/** A counter: a body and a top, optional glass case on it. */
export function counter(bag, col, rect, { body = 'wood_painted', top = 'marble', h = 1.0, glass = false } = {}) {
  const [x0, z0, x1, z1] = rect;
  bag.add(body, box(x0, 0.05, z0, x1, h - 0.05, z1)); bag.add(top, box(x0 - 0.04, h - 0.05, z0 - 0.04, x1 + 0.04, h, z1 + 0.04));
  if (glass) bag.add('glass_outer', box(x0 + 0.05, h, z0 + 0.05, x1 - 0.05, h + 0.4, z1 - 0.05));
  col.rect(rect, 0, h + (glass ? 0.4 : 0));
}
/** A stool or a round table: a lathe of the seat on a stem. */
export function stool(bag, x, z, y = 0, h = 0.62, mat = 'leather_bench') {
  bag.add('steel_chrome', lathe([[0.02, y], [0.02, y + h - 0.06], [0.001, y + h - 0.06]], 6, null, x, 0, z));
  bag.add(mat, lathe([[0.001, y + h - 0.06], [0.17, y + h - 0.06], [0.17, y + h], [0.001, y + h]], 10, null, x, 0, z));
  bag.add('steel_chrome', lathe([[0.14, y], [0.14, y + 0.02], [0.001, y + 0.02]], 8, null, x, 0, z));
}
/** Pseudo-lettering on a board facing +x or −x (dir) or ±z: `n` white bars of varied height standing for letters. */
export function letters(bag, mat, x, y, z, n, dir, rand, hh = 0.22, step = 0.2) {
  const alongZ = dir === 'x+' || dir === 'x-', sg = dir.endsWith('+') ? 1 : -1;
  for (let k = 0; k < n; k++) {
    const u = (k - (n - 1) / 2) * step, w = 0.07 + rand() * 0.07, h = hh * (0.55 + rand() * 0.45), t = 0.02;
    if (alongZ) bag.add(mat, box(x + (sg > 0 ? 0 : -t), y, z + u, x + (sg > 0 ? t : 0), y + h, z + u + w));
    else bag.add(mat, box(x + u, y, z + (sg > 0 ? 0 : -t), x + u + w, y + h, z + (sg > 0 ? t : 0)));
    if (rand() < 0.35) { if (alongZ) bag.add(mat, box(x + (sg > 0 ? 0 : -t), y + h * 0.45, z + u, x + (sg > 0 ? t : 0), y + h * 0.55, z + u + step * 0.9)); else bag.add(mat, box(x + u, y + h * 0.45, z + (sg > 0 ? 0 : -t), x + u + step * 0.9, y + h * 0.55, z + (sg > 0 ? t : 0))); }
  }
}
/** A shrub: a lumpy ball of foliage on a short stem. */
export function shrub(bag, x, z, y, r, mat = 'palm_leaf') {
  bag.add(mat, lathe([[0.001, 0], [r * 0.7, r * 0.15], [r, r * 0.6], [r * 0.85, r * 1.2], [r * 0.4, r * 1.6], [0.001, r * 1.7]], 9, null, x, y, z));
}
/** A tree trunk with a rounded crown (static, near the doors where the planting cannot go). */
export function smallTree(bag, x, z, y, h, mat = 'palm_leaf') {
  bag.add('bark_dark', rod([x, y, z], [x, y + h * 0.6, z], 0.07 * h / 4, 6));
  bag.add(mat, lathe([[0.001, 0], [h * 0.3, h * 0.12], [h * 0.38, h * 0.38], [h * 0.25, h * 0.65], [0.001, h * 0.75]], 10, null, x, y + h * 0.4, z));
}
