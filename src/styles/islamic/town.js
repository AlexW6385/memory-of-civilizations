// The Umayyad city (Jerusalem about 700; docs/settlements/jerusalem.md §4–§5): flat-roofed stone
// houses, some with a small dome, round courtyards; the hypostyle congregational mosque with its
// gabled timber roofs and a dome before the mihrab. Registered into the `islamic` style.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** levant_house: { rect, seed, y } — rooms of limestone round a court, flat roofs with parapets, sometimes a little dome. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 3.6 + (rand() < 0.4 ? 3.2 : 0), d = Math.min(4.5, (z1 - z0) * 0.4);
  const parts = [[x0, z0, x1, z0 + d], [x0, z0 + d, x0 + d, z1], [x1 - d, z0 + d, x1, z1], [x0 + d, z1 - 0.7, x1 - d, z1]];
  parts.forEach((r, i) => {
    const hh = i === 0 ? h : i === 3 ? 2.6 : 3.6;
    bag.add('limestone', box(r[0], y - 0.6, r[1], r[2], y + hh, r[3])); col.rect(r, y - 0.6, y + hh); col.floor(r, y + hh);
    if (i < 3 && !el.simple) bag.add('limestone', box(r[0] - 0.05, y + hh, r[1] - 0.05, r[2] + 0.05, y + hh + 0.5, r[3] + 0.05));
  });
  if (rand() < 0.45) { const cx = (x0 + x1) / 2, cz = z0 + d / 2, r = Math.min(d, x1 - x0) * 0.35; bag.add('plaster', lathe([[r, 0], [r * 0.9, r * 0.45], [r * 0.55, r * 0.85], [0.001, r]], 12, null, cx, y + h, cz)); }
}
/** hypostyle: a mosque { rect, h, y, aisles (along z), dome } — rows of columns under gabled timber roofs, a dome over the central aisle at the qibla end (south). */
function hypostyle(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 9, n = el.aisles ?? 7, w = (x1 - x0) / n;
  bag.add('limestone', box(x0, y - 0.5, z0, x0 + 1.2, y + h + 2, z1)); bag.add('limestone', box(x1 - 1.2, y - 0.5, z0, x1, y + h + 2, z1)); bag.add('limestone', box(x0, y - 0.5, z1 - 1.2, x1, y + h + 2, z1));
  col.rect([x0, z0, x0 + 1.2, z1], y, y + h + 2); col.rect([x1 - 1.2, z0, x1, z1], y, y + h + 2); col.rect([x0, z1 - 1.2, x1, z1], y, y + h + 2);
  // the north façade: piers and open arches
  for (let i = 0; i <= n; i++) { const x = x0 + i * w; bag.add('limestone', box(x - 1, y - 0.5, z0, x + 1, y + h + 2, z0 + 1.6)); col.rect([x - 1, z0, x + 1, z0 + 1.6], y, y + h + 2); }
  bag.add('limestone', box(x0, y + h - 1, z0, x1, y + h + 2, z0 + 1.6));
  for (let i = 1; i < n; i++) for (let z = z0 + 6; z < z1 - 3; z += 4.5) { bag.add('marble', lathe([[0.35, 0], [0.32, h - 1.5], [0.5, h - 1]], 10, null, x0 + i * w, y, z)); col.circle(x0 + i * w, z, 0.36, y, y + h); }
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w, b = a + w;
    bag.add('timber', frustum([a, z0, b, z1], y + h + 2, y + h + 2 + w * 0.3, w / 2 - 0.05, w / 2 - 0.05, 0, 0));
    bag.add('lead', frustum([a - 0.1, z0 - 0.1, b + 0.1, z1 + 0.1], y + h + 2.05, y + h + 2.05 + w * 0.3, w / 2 - 0.05, w / 2 - 0.05, 0, 0));
  }
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
  if (el.dome !== false) { const cx = (x0 + x1) / 2, cz = z1 - w * 1.2, r = w * 0.9; bag.add('limestone', box(cx - r, y + h + 2, cz - r, cx + r, y + h + 5, cz + r)); bag.add('lead', lathe([[r, 0], [r * 0.9, r * 0.45], [r * 0.55, r * 0.85], [0.001, r]], 20, null, cx, y + h + 5, cz)); }
}
Object.assign(STYLES.islamic.elements, { levant_house: house, hypostyle });
