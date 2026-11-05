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
// a bronze figure reclining on a stone plinth (the rivers and nymphs round the basins)
function reclining(bag, x, z, y, yaw, s = 1) {
  const c = Math.cos(yaw), sn = Math.sin(yaw), P = (u, v) => [x + c * u - sn * v, z + sn * u + c * v];
  const [px, pz] = P(0, 0);
  bag.add(S, box(px - 1.3 * s, y, pz - 1.3 * s, px + 1.3 * s, y + 0.7 * s, pz + 1.3 * s));
  const lie = lathe([[0.001, -0.9], [0.3, -0.7], [0.36, 0], [0.28, 0.6], [0.001, 0.85]], 10, null, 0, 0, 0);
  lie.scale(s, s * 0.8, s); lie.rotateZ(Math.PI / 2 - 0.35); lie.rotateY(-yaw); lie.translate(px, y + 0.7 * s + 0.3 * s, pz);
  bag.add('bronze', lie);
  const [hx, hz] = P(-0.75 * s, 0);
  bag.add('bronze', lathe([[0.001, -0.17], [0.16, -0.08], [0.17, 0.06], [0.001, 0.18]], 8, null, hx, y + 0.7 * s + 0.75 * s, hz));
  const [ux, uz] = P(0.55 * s, 0.25 * s);
  bag.add('bronze', lathe([[0.18, 0], [0.22, 0.25], [0.12, 0.45], [0.001, 0.46]], 8, null, ux, y + 0.7 * s, uz));   // the urn pouring
}
/**
 * parterre: { rect, y, water } — with water: the water parterre, two great basins either side of the
 * axis with stone kerbs and bronze figures reclining on their rims; otherwise clipped box in
 * patterns (low, with scrolls and borders), gravel between, a round basin in the middle.
 */
function parterre(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('pebbles', box(x0, y - 0.3, z0, x1, y + 0.04, z1)); col.floor([x0, z0, x1, z1], y + 0.04);
  if (el.water) {
    for (const sz of [-1, 1]) {
      const r = [x0 + 12, sz < 0 ? z0 + 8 : cz + 7, x1 - 12, sz < 0 ? cz - 7 : z1 - 8];
      const k = 0.7;
      for (const q of [[r[0] - k, r[1] - k, r[2] + k, r[1]], [r[0] - k, r[3], r[2] + k, r[3] + k], [r[0] - k, r[1], r[0], r[3]], [r[2], r[1], r[2] + k, r[3]]]) bag.add(S, box(q[0], y - 0.2, q[1], q[2], y + 0.45, q[3]));
      bag.add('marble_dark', box(r[0], y - 0.6, r[1], r[2], y - 0.55, r[3]));
      STYLES.qing.elements.water_rect({ rect: r, y: y + 0.25 }, ctx);
      col.rect([r[0] - k, r[1] - k, r[2] + k, r[3] + k], y - 0.5, y + 0.45);
      // the bronzes round the rim: along the long sides and at the corners
      const W = r[2] - r[0], D = r[3] - r[1];
      for (let i = 1; i < 4; i++) {
        reclining(bag, r[0] + W * i / 4, r[1] - 2.4, y + 0.04, 0, 0.9);
        reclining(bag, r[0] + W * i / 4, r[3] + 2.4, y + 0.04, Math.PI, 0.9);
      }
      for (const fx of [r[0] - 2.4, r[2] + 2.4]) reclining(bag, fx, (r[1] + r[3]) / 2, y + 0.04, fx < cx ? Math.PI / 2 : -Math.PI / 2, 0.9);
      void D;
    }
    return;
  }
  const nx = Math.max(2, Math.round((x1 - x0) / 18)), nz = Math.max(2, Math.round((z1 - z0) / 18));
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const a = x0 + i * (x1 - x0) / nx + 2, b = z0 + k * (z1 - z0) / nz + 2, c = x0 + (i + 1) * (x1 - x0) / nx - 2, d = z0 + (k + 1) * (z1 - z0) / nz - 2;
    if (Math.hypot((a + c) / 2 - cx, (b + d) / 2 - cz) < 8) continue;
    // the border, the cross walks, and scrolls of box in each quarter
    for (const r of [[a, b, c, b + 0.4], [a, d - 0.4, c, d], [a, b, a + 0.4, d], [c - 0.4, b, c, d]]) bag.add('lotus_leaf', box(r[0], y, r[1], r[2], y + 0.35, r[3]));
    const mx = (a + c) / 2, mz = (b + d) / 2, R = Math.min(c - a, d - b) * 0.32;
    bag.add('lotus_leaf', lathe([[R, 0], [R, 0.3], [R - 0.35, 0.3], [R - 0.35, 0]], 20, null, mx, y, mz));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('lotus_leaf', lathe([[R * 0.42, 0], [R * 0.42, 0.28], [R * 0.42 - 0.3, 0.28], [R * 0.42 - 0.3, 0]], 14, null, mx + sx * (c - a) * 0.3, y, mz + sz * (d - b) * 0.3));
  }
  if (el.basin !== false) fountain({ c: [cx, cz], r: Math.min(8, (x1 - x0) / 6), y }, ctx);
}
/**
 * fountain: a round basin with a stone rim and its water { c, r, y, kind }: 'latona' — tiers of
 * marble rings stepping up in the basin to the figure group at the top; 'apollo' — the god's
 * chariot and four horses rising from the water; otherwise a low bronze group in the middle.
 */
function fountain(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, r = el.r ?? 8, y = el.y ?? 0;
  bag.add(S, lathe([[r + 0.8, -0.4], [r + 0.8, 0.5], [r, 0.5], [r, -0.5], [0.001, -0.5]], 28, null, x, y, z));
  STYLES.qing.elements.water_cells({ rect: [x - r, z - r, x + r, z + r], y: y + 0.2, cell: 0.8, inside: (a, b) => Math.hypot(a - x, b - z) < r - 0.2 }, ctx);
  if (el.kind === 'latona') {
    // four tiers of marble, each ring a step higher and smaller, frogs and turtles (bronze) on their rims
    for (let t = 0; t < 4; t++) {
      const rt = r * (0.62 - t * 0.13), yt = y + 0.2 + t * 0.75;
      bag.add('marble', lathe([[rt + 0.3, 0], [rt + 0.3, 0.75], [rt, 0.85], [0.001, 0.85]], 32, null, x, yt, z));
      const n = Math.round(rt * 2.2);
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; bag.add('bronze', lathe([[0.001, 0], [0.22, 0.05], [0.2, 0.22], [0.001, 0.3]], 6, null, x + Math.cos(a) * (rt + 0.1), yt + 0.85, z + Math.sin(a) * (rt + 0.1))); }
    }
    const yt = y + 0.2 + 4 * 0.75 + 0.1;
    bag.add('marble', lathe([[0.9, 0], [0.8, 0.9], [1.0, 1.05], [0.001, 1.05]], 12, null, x, yt, z));
    bag.add('marble', lathe([[0.001, 0], [0.42, 0.1], [0.36, 0.9], [0.22, 1.25], [0.001, 1.65]], 10, null, x, yt + 1.05, z));
    bag.add('marble', lathe([[0.001, 0], [0.13, 0.05], [0.13, 0.22], [0.001, 0.27]], 8, null, x, yt + 2.7, z));
    for (const s of [-1, 1]) bag.add('marble', lathe([[0.001, 0], [0.18, 0.1], [0.14, 0.6], [0.001, 0.8]], 8, null, x + s * 0.45, yt + 1.05, z + 0.3));
  } else if (el.kind === 'apollo') {
    const d = el.dir ?? [1, 0], u = [-d[1], d[0]], P = (a, b) => [x + d[0] * a + u[0] * b, z + d[1] * a + u[1] * b];
    // the chariot, the god standing in it, four horses plunging forward, tritons blowing at the sides
    const [cx0, cz0] = P(-1.2, 0);
    bag.add('gilt_bronze', lathe([[0.001, 0], [1.1, 0.2], [1.2, 0.9], [0.9, 1.3], [0.001, 1.2]], 12, null, cx0, y + 0.1, cz0));
    bag.add('gilt_bronze', lathe([[0.25, 0], [0.22, 1.2], [0.3, 1.5], [0.18, 1.9], [0.001, 2.25]], 10, null, cx0, y + 1.2, cz0));
    for (const b of [-1.5, -0.5, 0.5, 1.5]) {
      const [hx, hz] = P(1.4, b * 0.75);
      const body = lathe([[0.001, -0.75], [0.32, -0.55], [0.36, 0], [0.3, 0.55], [0.001, 0.7]], 10, null, 0, 0, 0);
      body.rotateZ(Math.PI / 2 - 0.5); body.rotateY(-Math.atan2(d[1], d[0])); body.translate(hx, y + 0.9, hz);
      bag.add('gilt_bronze', body);
      const [nx, nz] = P(2.15, b * 0.75);
      bag.add('gilt_bronze', lathe([[0.12, 0], [0.16, 0.5], [0.2, 0.75], [0.001, 0.95]], 8, null, nx, y + 1.15, nz));
    }
    for (const b of [-3.6, 3.6]) { const [tx, tz] = P(0.6, b); bag.add('gilt_bronze', lathe([[0.4, 0], [0.3, 0.6], [0.22, 1.1], [0.001, 1.35]], 8, null, tx, y + 0.1, tz)); }
  } else {
    bag.add('bronze', lathe([[1.2, 0], [1.1, 0.5], [0.7, 0.9], [0.5, 1.6], [0.3, 1.9], [0.001, 2.2]], 12, null, x, y, z));
  }
  col.circle(x, z, r + 0.8, y - 0.5, y + 0.5);
}
registerStyle('classical_fr', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, range, parterre, fountain },
  objects: {},
});
