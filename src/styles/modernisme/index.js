// Catalan modernisme (Barcelona about 1910; docs/settlements/barcelona.md §4): the Eixample's blocks —
// six storeys round an open court, the corners cut at 45°, balconies of iron, flat roofs with
// terraces; Gaudí's Sagrada Família rising — the apse and the Nativity façade with its four tapering
// towers, scaffolding and a crane; La Pedrera's undulating stone front; Casa Batlló's bone-like front
// and scaled roof.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../qing/index.js';

const S = 'limestone_yellow', P = 'stucco_cream';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** eixample_block: { c, s (side), d (depth of the building ring), ch (chamfer), h, y, seed } — a ring of buildings round a court, corners cut. */
function block(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 70, d = el.d ?? 18, ch = el.ch ?? 12, h = el.h ?? 20, y = el.y ?? 0, rand = rng(el.seed || 1);
  const o = s / 2, pts = [[-o + ch, -o], [o - ch, -o], [o, -o + ch], [o, o - ch], [o - ch, o], [-o + ch, o], [-o, o - ch], [-o, -o + ch]].map(([x, z]) => [cx + x, cz + z]);
  for (let i = 0; i < 8; i++) {
    const a = pts[i], b = pts[(i + 1) % 8], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, nx = cx - mx, nz = cz - mz, nl = Math.hypot(nx, nz);
    const ia = [a[0] + nx / nl * d * 0.7, a[1] + nz / nl * d * 0.7], ib = [b[0] + nx / nl * d * 0.7, b[1] + nz / nl * d * 0.7];
    const outer = [(a[0] + ia[0]) / 2, (a[1] + ia[1]) / 2], outerB = [(b[0] + ib[0]) / 2, (b[1] + ib[1]) / 2];
    const hh = h + (rand() < 0.3 ? 3.2 : 0), mat = rand() < 0.5 ? S : P;
    bag.add(mat, orientedBox(outer, outerB, d * 0.7, y - 0.5, y + hh, d * 0.35));
    col.segment(outer, outerB, d * 0.7, y - 0.5, y + hh);
    // balconies and windows along the street face
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 4), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (let k = 1; k < 6; k++) for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n, px = a[0] + (b[0] - a[0]) * t - nx / nl * 0.05, pz = a[1] + (b[1] - a[1]) * t - nz / nl * 0.05, yy = y + k * 3.2 + 0.5;
      bag.add('opening', orientedBox([px - ux * 0.7, pz - uz * 0.7], [px + ux * 0.7, pz + uz * 0.7], 0.08, yy, yy + 2.2));
      if (!el.simple) bag.add('iron', orientedBox([px - ux * 1 - nx / nl * 0.6, pz - uz * 1 - nz / nl * 0.6], [px + ux * 1 - nx / nl * 0.6, pz + uz * 1 - nz / nl * 0.6], 0.9, yy - 0.1, yy + 0.05));
    }
  }
}
/** sagrada: { c, y } — the crypt and apse with its pinnacles, the Nativity façade's four towers in progress, scaffolding and a crane. */
function sagrada(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0;
  bag.add(S, box(cx - 22, y - 0.5, cz - 45, cx + 22, y + 6, cz + 45)); col.rect([cx - 22, cz - 45, cx + 22, cz + 45], y, y + 6); col.floor([cx - 22, cz - 45, cx + 22, cz + 45], y + 6);
  // the apse: a ring of chapels with pointed pinnacles
  for (let k = 0; k < 7; k++) { const a = Math.PI * (0.15 + 0.7 * k / 6), x = cx + Math.cos(a) * 18, z = cz - 30 - Math.sin(a) * 14; bag.add(S, lathe([[4, 0], [4, 18], [2.4, 24], [0.001, 32]], 10, null, x, y + 6, z)); col.circle(x, z, 4, y, y + 24); }
  // the Nativity façade (east): three portals and four tapering towers, rising unevenly
  const fx = cx + 22;
  bag.add(S, box(fx, y - 0.5, cz - 26, fx + 8, y + 32, cz + 26)); col.rect([fx, cz - 26, fx + 8, cz + 26], y, y + 32);
  for (const [k, w] of [[-14, 7], [0, 9], [14, 7]]) bag.add('opening', box(fx + 7.95, y + 6, cz + k - w / 2, fx + 8.06, y + 22, cz + k + w / 2));
  [[-22, 70], [-8, 58], [8, 52], [22, 40]].forEach(([dz, h]) => {
    const z = cz + dz;
    bag.add(S, lathe([[4.2, 0], [3.8, h * 0.5], [3.0, h * 0.8], [1.6, h], [0.001, h + 4]], 12, null, fx + 4, y + 32, z));
    col.circle(fx + 4, z, 4.2, y + 32, y + 32 + h);
    // scaffolding round the unfinished ones
    if (h < 60) for (let lv = 0; lv < h; lv += 6) bag.add('timber', box(fx - 1, y + 32 + lv, z - 5.5, fx + 9, y + 32 + lv + 0.3, z + 5.5));
  });
  // the crane
  bag.add('iron', box(cx - 2, y + 6, cz + 10, cx, y + 70, cz + 12)); bag.add('iron', box(cx - 30, y + 68, cz + 10.5, cx + 20, y + 70, cz + 11.5));
}
/** pedrera: { rect, h, y } — an undulating stone front of waves and balconies of twisted iron, the roof's chimney warriors. */
function pedrera(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 22, y = el.y ?? 0;
  bag.add(S, box(x0 + 2, y - 0.5, z0 + 2, x1 - 2, y + h, z1 - 2)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  for (let k = 0; k < 6; k++) for (let i = 0; i < 12; i++) {
    const t = i / 12, x = x0 + (x1 - x0) * t, off = Math.sin(t * Math.PI * 4 + k) * 1.2 + 1.4, yy = y + k * h / 6;
    bag.add(S, box(x, yy, z1 - 2, x + (x1 - x0) / 12 + 0.1, yy + h / 6, z1 - 2 + off));
    bag.add('iron', box(x + 0.4, yy + 0.4, z1 - 2 + off, x + (x1 - x0) / 12 - 0.4, yy + 1.4, z1 - 1.8 + off));
  }
  for (let i = 0; i < 8; i++) { const x = x0 + 4 + i * (x1 - x0 - 8) / 7, z = (z0 + z1) / 2; bag.add(S, lathe([[0.8, 0], [0.5, 2], [0.9, 2.5], [0.001, 3.6]], 8, null, x, y + h, z)); }
}
/** batllo: { rect, h, y } — a narrow front of mosaic and bone-like columns, the scaled dragon roof. */
function batllo(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 21, y = el.y ?? 0;
  bag.add('tile_turquoise', box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h);
  for (let i = 0; i < 5; i++) { const x = x0 + 1 + i * (x1 - x0 - 2) / 4; bag.add(S, lathe([[0.35, 0], [0.25, 4], [0.4, 5]], 8, null, x, y, z1 + 0.4)); }
  bag.add('tile_lapis', lathe([[(x1 - x0) / 2, 0], [(x1 - x0) * 0.4, 2], [0.001, 3.5]], 4, null, (x0 + x1) / 2, y + h, (z0 + z1) / 2));
}
registerStyle('modernisme', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, eixample_block: block, sagrada, pedrera, batllo },
  objects: {},
});
