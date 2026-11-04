// French classicism (Versailles about 1690; docs/settlements/versailles.md §4): the château's long
// ranges of pale stone in three storeys — the rusticated ground floor, the tall piano nobile with its
// arched windows, the attic with its balustrade and trophies — the court fronts of brick and stone
// under steep slate roofs; parterres of clipped box; basins and fountains; the town's houses.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const S = 'sandstone_dressed';
/** range: a wing of the château { rect, h, y, front ('nsew' faces with windows), roof ('flat' balustraded | 'slate') }. */
function range(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 20, brick = el.brick;
  bag.add(brick ? 'brick' : S, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  bag.add(S, box(x0 - 0.2, y + h * 0.3, z0 - 0.2, x1 + 0.2, y + h * 0.33, z1 + 0.2));
  for (const f of el.front ?? 'nsew') {
    const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 5);
    for (let i = 0; i < n; i++) for (const [yy, hh] of [[y + 1.2, h * 0.22], [y + h * 0.36, h * 0.36], [y + h * 0.8, h * 0.12]]) {
      const u = (along ? x0 : z0) + (i + 0.5) * L / n, q = f === 'n' ? [u - 1.1, z0 - 0.06, u + 1.1, z0 + 0.02] : f === 's' ? [u - 1.1, z1 - 0.02, u + 1.1, z1 + 0.06] : f === 'w' ? [x0 - 0.06, u - 1.1, x0 + 0.02, u + 1.1] : [x1 - 0.02, u - 1.1, x1 + 0.06, u + 1.1];
      bag.add('opening', box(q[0], yy, q[1], q[2], yy + hh, q[3]));
    }
  }
  if (el.roof === 'slate') bag.add('slate', frustum([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], y + h, y + h + Math.min(x1 - x0, z1 - z0) * 0.45, Math.min(x1 - x0, z1 - z0) * 0.32, Math.min(x1 - x0, z1 - z0) * 0.32, Math.min(x1 - x0, z1 - z0) * 0.32, Math.min(x1 - x0, z1 - z0) * 0.32));
  else {
    bag.add(S, box(x0 - 0.3, y + h, z0 - 0.3, x1 + 0.3, y + h + 0.4, z1 + 0.3));
    for (const [a, b, alongX] of [[x0, x1, true], [z0, z1, false]]) { const n = Math.floor((b - a) / 6); for (let i = 0; i <= n; i++) { const u = a + i * (b - a) / n; for (const s of [0, 1]) { const p = alongX ? [u, s ? z1 : z0] : [s ? x1 : x0, u]; bag.add(S, lathe([[0.35, 0], [0.3, 1.0], [0.5, 1.2], [0.001, 2.2]], 6, null, p[0], y + h + 0.4, p[1])); } } }
    bag.add('lead', box(x0 + 1, y + h + 0.4, z0 + 1, x1 - 1, y + h + 1.2, z1 - 1));
  }
}
/** parterre: { rect, y } — clipped box hedges in patterns, gravel between, round basin in the middle. */
function parterre(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('pebbles', box(x0, y - 0.3, z0, x1, y + 0.04, z1)); col.floor([x0, z0, x1, z1], y + 0.04);
  const nx = Math.max(2, Math.round((x1 - x0) / 18)), nz = Math.max(2, Math.round((z1 - z0) / 18));
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const a = x0 + i * (x1 - x0) / nx + 2, b = z0 + k * (z1 - z0) / nz + 2, c = x0 + (i + 1) * (x1 - x0) / nx - 2, d = z0 + (k + 1) * (z1 - z0) / nz - 2;
    if (Math.hypot((a + c) / 2 - cx, (b + d) / 2 - cz) < 8) continue;
    for (const r of [[a, b, c, b + 0.6], [a, d - 0.6, c, d], [a, b, a + 0.6, d], [c - 0.6, b, c, d], [(a + c) / 2 - 0.3, b, (a + c) / 2 + 0.3, d]]) bag.add('lotus_leaf', box(r[0], y, r[1], r[2], y + 0.7, r[3]));
  }
  if (el.basin !== false) fountain({ c: [cx, cz], r: Math.min(8, (x1 - x0) / 6), y }, ctx);
}
/** fountain: a round basin with a stone rim, its water and a jet { c, r, y }. */
function fountain(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, r = el.r ?? 8, y = el.y ?? 0;
  bag.add(S, lathe([[r + 0.8, -0.4], [r + 0.8, 0.5], [r, 0.5], [r, -0.5], [0.001, -0.5]], 28, null, x, y, z));
  STYLES.qing.elements.water_cells({ rect: [x - r, z - r, x + r, z + r], y: y + 0.2, cell: 0.8, inside: (a, b) => Math.hypot(a - x, b - z) < r - 0.2 }, ctx);
  bag.add('bronze', lathe([[1.2, 0], [0.6, 1.4], [0.3, 2.4], [0.001, 3]], 10, null, x, y, z));
  bag.add('water', lathe([[0.15, 0], [0.05, 6], [0.001, 6.5]], 6, null, x, y + 2.8, z));
  col.circle(x, z, r + 0.8, y - 0.5, y + 0.5);
}
registerStyle('classical_fr', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, range, parterre, fountain },
  objects: {},
});
