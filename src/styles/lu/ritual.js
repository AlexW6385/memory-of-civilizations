// The stone and tile of the Temple's courts (docs/settlements/lu-qufu.md §2, §5): the stone portals (Lingxing Gate, the archways), the
// stele pavilions with their tortoises, the Apricot Altar, a stele on its tortoise, the tomb mound of the Forest's edge.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, pyramidRoof, withPal, mingPavilion } from '../ming/index.js';
import { IMPERIAL } from '../qing/index.js';
import { Parts, tortoise, ball, T } from '../qing/carving.js';

const TILE = 'tile_yellow';

/** lu_pailou: a stone portal { c: [x, z], across ('x': the way runs along z, the portal spans x) | 'z', w (width over the outer columns), h (middle columns' height), n (columns, 4), roof (bool), mat }. */
export function pailou(el, { bag, col }) {
  const [cx, cz] = el.c, W = el.w, n = el.n ?? 4, h = el.h ?? 7, mat = el.mat ?? 'granite_grey', alongX = (el.across ?? 'x') === 'x';
  const P = (u, y, v) => (alongX ? [cx + u, y, cz + v] : [cx + v, y, cz + u]);
  const R = (u0, y0, v0, u1, y1, v1) => { const a = P(u0, y0, v0), b = P(u1, y1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])]; };
  const add = (m, u0, y0, v0, u1, y1, v1, solid = false) => { const r = R(u0, y0, v0, u1, y1, v1); bag.add(m, box(...r)); if (solid) col.rect([r[0], r[2], r[3], r[5]], r[1], r[4]); };
  const us = Array.from({ length: n }, (_, i) => -W / 2 + W * i / (n - 1));
  us.forEach((u, i) => {
    const mid = i > 0 && i < n - 1, hh = mid ? h : h - 1.3;
    add('granite_block', u - 0.55, 0, -0.55, u + 0.55, 0.9, 0.55, true);
    add(mat, u - 0.36, 0.9, -0.36, u + 0.36, hh, 0.36, true);
    // the cap: a lotus-bud or the heaven-barking beast on the outer columns of the Lingxing Gate
    { const p = P(u, 0, 0); bag.add(mat, lathe([[0.4, hh], [0.3, hh + 0.2], [0.36, hh + 0.5], [0.18, hh + 0.85], [0.001, hh + 1.15]], 8, null, p[0], 0, p[2])); }
  });
  for (let i = 0; i + 1 < n; i++) {
    const a = us[i], b = us[i + 1], mid = i === Math.floor((n - 1) / 2);
    const by = mid ? h - 1.0 : h - 2.4;
    add(mat, a, by, -0.3, b, by + 0.5, 0.3);
    add(mat, a, by - 0.9, -0.22, b, by - 0.7, 0.22);
    if (mid) { add('lacquer_black', a + 0.9, by + 0.5, -0.06, b - 0.9, by + 1.5, 0.06); add('gilt_bronze', a + 1.1, by + 0.65, -0.1, b - 1.1, by + 1.3, 0.1); }
  }
  if (el.roof) for (let i = 0; i + 1 < n; i++) {
    const a = us[i], b = us[i + 1], mid = i === Math.floor((n - 1) / 2);
    const c = P((a + b) / 2, 0, 0), Lh = (b - a) / 2 + 0.8;
    rectRoof({ c: [c[0], c[2]], A: alongX ? Lh : 1.4, B: alongX ? 1.4 : Lh, y: mid ? h + 0.6 : h - 1.3, rise: 1.1, kind: 'xieshan', sweep: 0.3, alongZ: !alongX, mat: TILE, soffit: 'paint_caihua' }, bag);
  }
}

/** lu_stele: a stele on its tortoise { at: [x, z], y, yaw, s (scale), h (the stele's height) } — the tortoise's head faces +z before turning. */
export function stele(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, h = el.h ?? 3.8, P = new Parts();
  tortoise(P, 'granite_grey', 'granite_block');
  P.emit(bag, x, y, z, el.yaw ?? 0, s);
  const c = Math.cos(el.yaw ?? 0), sn = Math.sin(el.yaw ?? 0), top = y + 1.25 * s;
  // the stele stands on the tortoise's back: a slab with a coiled-dragon head
  const S = new Parts();
  S.add('marble', box(-0.75 * s, top - 0.05, -0.2 * s, 0.75 * s, top + h * s, 0.2 * s));
  S.add('granite_grey', box(-0.85 * s, top + h * s, -0.28 * s, 0.85 * s, top + (h + 0.7) * s, 0.28 * s));
  S.add('granite_grey', box(-0.55 * s, top + (h + 0.7) * s, -0.2 * s, 0.55 * s, top + (h + 1.0) * s, 0.2 * s));
  for (const sx of [-1, 1]) S.add('granite_grey', T(ball(0.34 * s, 0.3 * s, 0.22 * s, 8, 5), sx * 0.52 * s, top + (h + 0.4) * s, 0));
  S.emit(bag, x, 0, z, el.yaw ?? 0);
  void c; void sn;
  col.rect(Math.abs(Math.sin(el.yaw ?? 0)) > 0.7 ? [x - 1.05 * s, z - 0.9 * s, x + 1.05 * s, z + 0.9 * s] : [x - 0.9 * s, z - 1.05 * s, x + 0.9 * s, z + 1.05 * s], y, top + h * s);   // (the tortoise's own footprint, turned with the stele)
}

/** lu_stele_pavilion: a square pavilion in yellow tile over a tortoise and stele { c, w, y, s (stele scale), yaw, big }. */
export function stelePavilion(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, w = el.w ?? 6.4, y = el.y ?? 0.5;
  withPal(mingPavilion)({ c: el.c, shape: 'square', w, y, H: 4.6, plat: y, bench: false, steps: false, open: [0, 1, 2, 3], pal: IMPERIAL }, ctx);
  stele({ at: [cx, cz], y, yaw: el.yaw ?? 0, s: el.big ? 1.05 : 0.62, h: el.big ? 3.9 : 2.6 }, ctx);
  // what stands in it: the offering stand of granite before the stele with its bronze censer, a candle-stick either side, a hanging lantern from the beam, a worn kneeling mat
  const big = !!el.big, sz = cz + (big ? 2.45 : 1.65);
  bag.add('granite_grey', box(cx - 0.55, y, sz - 0.28, cx + 0.55, y + 0.78, sz + 0.28)); bag.add('granite_block', box(cx - 0.62, y + 0.78, sz - 0.34, cx + 0.62, y + 0.84, sz + 0.34));
  col.rect([cx - 0.62, sz - 0.34, cx + 0.62, sz + 0.34], y, y + 0.84);
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.17, 0.12], [0.15, 0.2], [0.001, 0.2]], 10, null, cx, y + 0.84, sz));
  for (const sx of [-1, 1]) bag.add('gilt_bronze', lathe([[0.05, 0], [0.04, 0.2], [0.07, 0.24], [0.001, 0.24]], 6, null, cx + sx * 0.4, y + 0.84, sz));
  bag.add('reed_mat', box(cx - 0.5, y + 0.005, sz + 0.5, cx + 0.5, y + 0.02, sz + 1.0));
  bag.add('lamp_paper', lathe([[0.001, 0], [0.09, 0.02], [0.17, 0.12], [0.17, 0.22], [0.09, 0.32], [0.001, 0.34]], 10, null, cx, y + 3.2, cz + (big ? 2.4 : 1.6)));
  bag.add('cloth_red', lathe([[0.012, 0], [0.012, 0.7]], 4, null, cx, y + 3.54, cz + (big ? 2.4 : 1.6)));
}

/** lu_altar: the Apricot Altar { c, y } — a square pavilion of double eaves, the roofs cross-ridged, open on four sides, on a stone platform. */
export function altar(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0.6, a = 4.1, H = 5.2;
  bag.add('marble', box(cx - 6.2, y - 0.7, cz - 6.2, cx + 6.2, y - 0.1, cz + 6.2));
  bag.add('marble_smooth', box(cx - 6.3, y - 0.12, cz - 6.3, cx + 6.3, y, cz + 6.3));
  bag.add('brick_paving', box(cx - 5.9, y - 0.02, cz - 5.9, cx + 5.9, y + 0.02, cz + 5.9));
  col.rect([cx - 6.3, cz - 6.3, cx + 6.3, cz + 6.3], -0.7, y - 0.15); col.floor([cx - 6.3, cz - 6.3, cx + 6.3, cz + 6.3], y);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    bag.add('granite_block', lathe([[0.5, 0], [0.5, 0.12], [0.4, 0.3]], 8, null, cx + sx * a, y, cz + sz * a));
    bag.add('lacquer_red', lathe([[0.3, 0.3], [0.28, H * 0.5], [0.25, H]], 8, null, cx + sx * a, y, cz + sz * a));
    col.circle(cx + sx * a, cz + sz * a, 0.32, y, y + H);
  }
  // the beam round the posts, painted; the lower eave, the upper hall's frame, the upper eave
  bag.add('paint_caihua', box(cx - a - 0.3, y + H - 0.7, cz - a - 0.3, cx + a + 0.3, y + H, cz + a + 0.3));
  const sq = (r) => [[cx - r, cz - r], [cx + r, cz - r], [cx + r, cz + r], [cx - r, cz + r]];
  pyramidRoof(sq(a + 1.9), y + H - 0.1, 1.9, 0.6, bag, TILE, 'paint_caihua');
  bag.add('lacquer_red', box(cx - 2.2, y + H + 1.1, cz - 2.2, cx + 2.2, y + H + 2.6, cz + 2.2));
  bag.add('paint_caihua', box(cx - 2.4, y + H + 2.6, cz - 2.4, cx + 2.4, y + H + 3.0, cz + 2.4));
  pyramidRoof(sq(4.0), y + H + 2.9, 2.6, 0.7, bag, TILE, 'paint_caihua');
  bag.add('gilt_bronze', lathe([[0.2, 0], [0.12, 0.3], [0.2, 0.6], [0.001, 1.2]], 8, null, cx, y + H + 5.5, cz));
  // the stele inside, a plaque "Apricot Altar" over the lower eave's centre, an incense burner before it
  bag.add('marble', box(cx - 3.2, y, cz - 0.2, cx - 1.6, y + 2.6, cz + 0.2)); col.rect([cx - 3.25, cz - 0.25, cx - 1.55, cz + 0.25], y, y + 2.6);
  for (const [dx, dz, r] of [[0, 4.6, 0], [0, -4.6, 0], [4.6, 0, 1], [-4.6, 0, 1]]) bag.add('lacquer_black', box(cx + dx - (r ? 0.04 : 0.6), y + H - 1.8, cz + dz - (r ? 0.6 : 0.04), cx + dx + (r ? 0.04 : 0.6), y + H - 0.8, cz + dz + (r ? 0.6 : 0.04)));
  bag.add('bronze', lathe([[0.001, 0], [0.5, 0.05], [0.55, 0.45], [0.001, 0.5]], 10, null, cx + 2.4, y, cz + 2.6));
  col.circle(cx + 2.4, cz + 2.6, 0.55, y, y + 0.5);
}

/** lu_tomb: a conical mound with a stele before it and a stone table { c, r, h, face: [fx, fz] } — the Forest's edge. */
export function tomb(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 7, h = el.h ?? 3.5;
  bag.add('sod', lathe([[r, 0], [r * 0.7, h * 0.55], [r * 0.35, h * 0.9], [0.001, h]], 14, null, cx, 0, cz));
  col.circle(cx, cz, r * 0.8, 0, h * 0.5);
  const f = el.face ?? [0, 1];
  stele({ at: [cx + f[0] * (r + 3), cz + f[1] * (r + 3)], yaw: Math.atan2(f[0], f[1]) + Math.PI, s: 0.8, h: 3.0 }, { bag, col });
  bag.add('granite_grey', box(cx + f[0] * (r + 7) - 1.0, 0, cz + f[1] * (r + 7) - 0.6, cx + f[0] * (r + 7) + 1.0, 0.7, cz + f[1] * (r + 7) + 0.6));
  col.rect([cx + f[0] * (r + 7) - 1.0, cz + f[1] * (r + 7) - 0.6, cx + f[0] * (r + 7) + 1.0, cz + f[1] * (r + 7) + 0.6], 0, 0.7);
  void fromTriangles;
}
