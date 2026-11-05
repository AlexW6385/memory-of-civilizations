// The stone-walled towns of the Zimbabwe plateau (14th c.; docs/settlements/great-zimbabwe.md §4):
// mortarless walls of dressed granite blocks, battered, curving, with a chevron band near the top;
// the solid conical tower; houses of daga (clay) with conical thatched roofs.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { lathe } from '../../core/geom.js';
import '../qing/index.js';

const G = 'granite_block';
/** dry_wall: a curving wall along `pts` { h, th, y (or yAt(x, z)), chevron } — mortarless granite, battered. */
function dryWall(el, { bag, col }) {
  const pts = el.pts, h = el.h ?? 6, th = el.th ?? 3, closed = el.closed;
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ya = el.yAt ? el.yAt(...a) : el.y ?? 0, yb = el.yAt ? el.yAt(...b) : el.y ?? 0, y = Math.min(ya, yb);
    bag.add(G, orientedBox(a, b, th, y - 1, y + h * 0.5, 0.15));
    bag.add(G, orientedBox(a, b, th * 0.8, y + h * 0.5, y + h, 0.15));
    if (el.chevron) {
      // the chevron band: blocks set on edge in a zigzag between two plain courses, on both faces
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = uz, nz = -ux, w = th * 0.4 + 0.04;
      for (const s of [-1, 1]) {
        bag.add('granite_grey', orientedBox([a[0] + nx * s * w, a[1] + nz * s * w], [b[0] + nx * s * w, b[1] + nz * s * w], 0.1, y + h - 1.55, y + h - 1.4));
        bag.add('granite_grey', orientedBox([a[0] + nx * s * w, a[1] + nz * s * w], [b[0] + nx * s * w, b[1] + nz * s * w], 0.1, y + h - 0.6, y + h - 0.45));
        for (let t = 0.2; t < L - 0.2; t += 0.4) {
          const up = Math.floor(t / 0.4) % 2 === 0, p0 = [a[0] + ux * t + nx * s * w, a[1] + uz * t + nz * s * w], p1 = [a[0] + ux * (t + 0.4) + nx * s * w, a[1] + uz * (t + 0.4) + nz * s * w];
          const g = orientedBox(p0, p1, 0.08, 0, 0.14); g.translate(0, 0, 0);
          const mid = y + h - 1.0;
          bag.add('granite_grey', orientedBox(p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], 0.09, up ? mid - 0.3 : mid + 0.16, up ? mid - 0.16 : mid + 0.3));
          bag.add('granite_grey', orientedBox([(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1, 0.09, mid - 0.07, mid + 0.07));
        }
      }
    }
    col.segment(a, b, th, y - 1, y + h);
  }
}
/** cone_tower: the solid conical tower { c, r, h, y }. */
function coneTower(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 2.7, h = el.h ?? 10, y = el.y ?? 0;
  bag.add(G, lathe([[r, 0], [r * 0.58, h], [0.001, h]], 20, null, x, y - 0.5, z)); col.circle(x, z, r, y, y + h);
}
/** daga_hut: { c, r, y, h } — a round house of clay, a conical thatched roof. */
function hut(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 3, y = el.y ?? 0, h = el.h ?? 2.2;
  bag.add('mud_plaster', lathe([[r, 0], [r, h], [0.001, h]], 14, null, x, y - 0.3, z));
  bag.add('thatch', lathe([[r + 0.7, 0], [r * 0.5, r * 0.75], [0.001, r * 1.25]], 14, null, x, y - 0.3 + h - 0.2, z));
  col.circle(x, z, r, y, y + h);
}
registerStyle('zimbabwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dry_wall: dryWall, cone_tower: coneTower, daga_hut: hut },
  objects: {},
});
