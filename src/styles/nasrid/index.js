// Nasrid architecture (14th c.; docs/settlements/granada.md §4): the red walls and square towers of
// the Alhambra on its hill; palaces of plain outer walls round courts — the Court of the Myrtles
// with its long pool between arcades and the great Comares Tower, the Court of the Lions with its
// slender paired columns, pavilions and the fountain; tiled roofs; whitewashed houses below.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../qing/index.js';

const W = 'tuff_red', P = 'plaster_white';
function crenels(bag, r, y, mat = W) {
  const [x0, z0, x1, z1] = r;
  for (const [a, b, alongX] of [[x0, x1, true], [z0, z1, false]]) {
    const n = Math.floor((b - a) / 1.5);
    for (let i = 0; i < n; i += 2) { const u0 = a + i * (b - a) / n, u1 = u0 + (b - a) / n; for (const s of [0, 1]) { const q = alongX ? [u0, s ? z1 - 0.6 : z0, u1, s ? z1 : z0 + 0.6] : [s ? x1 - 0.6 : x0, u0, s ? x1 : x0 + 0.6, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.3, q[3])); } }
  }
}
/** nasrid_tower: { rect, h, y } — a square tower of red rammed earth and brick, crenellated. */
function tower(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 14;
  bag.add(W, box(x0, y - 3, z0, x1, y + h, z1)); col.rect(el.rect, y - 3, y + h); col.floor(el.rect, y + h);
  crenels(bag, el.rect, y + h);
  for (const f of 'nsew') { const along = f === 'n' || f === 's', m = along ? (x0 + x1) / 2 : (z0 + z1) / 2; const q = f === 'n' ? [m - 0.6, z0 - 0.05, m + 0.6, z0 + 0.02] : f === 's' ? [m - 0.6, z1 - 0.02, m + 0.6, z1 + 0.05] : f === 'w' ? [x0 - 0.05, m - 0.6, x0 + 0.02, m + 0.6] : [x1 - 0.02, m - 0.6, x1 + 0.05, m + 0.6]; bag.add('opening', box(q[0], y + h * 0.65, q[1], q[2], y + h * 0.65 + 2.2, q[3])); }
}
/** nasrid_wall: a→b { h, th, y, yAt } — the red curtain wall, crenellated, a walk on top. */
function wall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 2.4, h = el.h ?? 9;
  const y = el.yAt ? Math.min(el.yAt(ax, az), el.yAt(bx, bz)) : el.y ?? 0;
  const r = [Math.min(ax, bx) - th / 2, Math.min(az, bz) - th / 2, Math.max(ax, bx) + th / 2, Math.max(az, bz) + th / 2];
  if (Math.abs(ax - bx) > 0.1 && Math.abs(az - bz) > 0.1) {
    // a slanting run: as oriented pieces
    const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 6);
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; const pa = [ax + (bx - ax) * t0, az + (bz - az) * t0], pb = [ax + (bx - ax) * t1, az + (bz - az) * t1]; const q = [Math.min(pa[0], pb[0]) - th / 2, Math.min(pa[1], pb[1]) - th / 2, Math.max(pa[0], pb[0]) + th / 2, Math.max(pa[1], pb[1]) + th / 2]; bag.add(W, box(q[0], y - 4, q[1], q[2], y + h, q[3])); col.rect(q, y - 4, y + h); }
    return;
  }
  bag.add(W, box(r[0], y - 4, r[1], r[2], y + h, r[3])); col.rect(r, y - 4, y + h); col.floor(r, y + h);
  crenels(bag, r, y + h);
}
function arcade(bag, col, a, b, y, h, step, paired = false) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i <= n; i++) {
    const x = a[0] + ux * L * i / n, z = a[1] + uz * L * i / n;
    for (const o of paired ? [-0.25, 0.25] : [0]) { bag.add('marble', lathe([[0.13, 0], [0.11, h - 0.6], [0.2, h - 0.3], [0.2, h]], 8, null, x + uz * o, y, z - ux * o)); col.circle(x + uz * o, z - ux * o, 0.14, y, y + h); }
  }
  const t = 0.5, r = [Math.min(a[0], b[0]) - t, Math.min(a[1], b[1]) - t, Math.max(a[0], b[0]) + t, Math.max(a[1], b[1]) + t];
  bag.add('stucco_cream', box(r[0], y + h, r[1], r[2], y + h + 1.6, r[3]));
}
/** court: a palace court { rect, y, kind ('myrtles' | 'lions'), h (the rooms' height) } — rooms round it under tiled roofs, arcades, the pool or the fountain. */
function court(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 8, d = 7;
  for (const r of [[x0 - d, z0 - d, x1 + d, z0], [x0 - d, z1, x1 + d, z1 + d], [x0 - d, z0, x0, z1], [x1, z0, x1 + d, z1]]) {
    bag.add(P, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
    bag.add('roof_tile', box(r[0] - 0.3, y + h, r[1] - 0.3, r[2] + 0.3, y + h + 0.2, r[3] + 0.3));
  }
  bag.add('marble', box(x0, y - 0.3, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
  if (el.kind === 'myrtles') {
    // arcades at both ends, the long pool down the middle with myrtle hedges
    arcade(bag, col, [x0 + 2, z0 + 3], [x1 - 2, z0 + 3], y, 4.5, 2.6); arcade(bag, col, [x0 + 2, z1 - 3], [x1 - 2, z1 - 3], y, 4.5, 2.6);
    const pw = (x1 - x0) * 0.2, cx = (x0 + x1) / 2;
    bag.add('marble', box(cx - pw / 2 - 0.4, y, z0 + 6, cx + pw / 2 + 0.4, y + 0.3, z1 - 6));
    STYLES.qing.elements.water_rect({ rect: [cx - pw / 2, z0 + 6.4, cx + pw / 2, z1 - 6.4], y: y + 0.2 }, ctx);
    col.rect([cx - pw / 2, z0 + 6, cx + pw / 2, z1 - 6], y, y + 0.4);
    for (const s of [-1, 1]) bag.add('lotus_leaf', box(cx + s * (pw / 2 + 0.6), y, z0 + 7, cx + s * (pw / 2 + 1.6), y + 1.0, z1 - 7));
  } else {
    // arcades of slender columns all round, the two pavilions, the fountain of the lions
    arcade(bag, col, [x0 + 2.5, z0 + 2.5], [x1 - 2.5, z0 + 2.5], y, 4, 2.2, true); arcade(bag, col, [x0 + 2.5, z1 - 2.5], [x1 - 2.5, z1 - 2.5], y, 4, 2.2, true);
    arcade(bag, col, [x0 + 2.5, z0 + 2.5], [x0 + 2.5, z1 - 2.5], y, 4, 2.2, true); arcade(bag, col, [x1 - 2.5, z0 + 2.5], [x1 - 2.5, z1 - 2.5], y, 4, 2.2, true);
    for (const px of [x0 + 6, x1 - 6]) { bag.add('roof_tile', lathe([[3.4, 0], [0.001, 2.6]], 4, null, px, y + 5.6, (z0 + z1) / 2)); arcade(bag, col, [px - 2.5, (z0 + z1) / 2 - 2.5], [px + 2.5, (z0 + z1) / 2 - 2.5], y, 4, 1.6, true); arcade(bag, col, [px - 2.5, (z0 + z1) / 2 + 2.5], [px + 2.5, (z0 + z1) / 2 + 2.5], y, 4, 1.6, true); }
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    bag.add('marble', lathe([[2.2, 0], [2.2, 0.9], [1.0, 1.0], [0.6, 2.0], [1.4, 2.2], [0.3, 2.6], [0.001, 3.0]], 12, null, cx, y, cz));
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; bag.add('marble', box(cx + Math.cos(a) * 1.6 - 0.25, y, cz + Math.sin(a) * 1.6 - 0.25, cx + Math.cos(a) * 1.6 + 0.25, y + 0.9, cz + Math.sin(a) * 1.6 + 0.25)); }
    col.circle(cx, cz, 2.2, y, y + 2);
  }
}
registerStyle('nasrid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, nasrid_tower: tower, nasrid_wall: wall, court },
  objects: {},
});
