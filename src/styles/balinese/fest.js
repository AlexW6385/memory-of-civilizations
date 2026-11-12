// The festival and the carved detail of the temples (docs/settlements/bali-village.md §4.3–§4.4, §7): guardian figures with their poleng cloths, the long banners (umbul-umbul)
// of the odalan, the ceremonial umbrellas (tedung) beside the shrines, the towers of fruit and flowers (gebogan) on the bales, niches of carved stone let into a temple wall.
import { box, lathe } from '../../core/geom.js';
import { bx, canang, post, rng } from './kit.js';
import { guardian } from './stone.js';

/** bali_guard: { at [x, z], y, h } — a guardian figure (a squat figure on a plinth, a club in its hand, a poleng cloth at its waist). */
export function guard(el, ctx) { guardian(ctx, el.at[0], el.at[1], el.y ?? 0, el.h ?? 1.3); }

/** bali_umbul: { at [x, z], y, h, dir } — a tall bamboo pole with a long banner of red, white and black hung from a crosspiece near its top. */
export function umbul(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 8, [dx, dz] = el.dir ?? [1, 0], r = rng(Math.round(x * 13 + z * 7) >>> 0);
  ctx.bag.add('bamboo_culm', lathe([[0.001, 0], [0.07, 0], [0.05, h * 0.5], [0.032, h]], 6, null, x, y, z));
  bx(ctx, 'bamboo_culm', x - 0.4 * Math.abs(dz) - 0.02, y + h - 0.45, z - 0.4 * Math.abs(dx) - 0.02, x + 0.4 * Math.abs(dz) + 0.02, y + h - 0.41, z + 0.4 * Math.abs(dx) + 0.02);
  const L = Math.min(5.0, h - 2.3), bands = ['cloth_red', 'cloth_white', 'cloth_black', 'cloth_ochre'];
  const px = Math.abs(dz), pz = Math.abs(dx);
  for (let k = 0; k < 3; k++) {
    const t = (k - 1) * 0.26, c = bands[Math.floor(r() * 4)], cx = x + px * t, cz = z + pz * t, hx = px ? 0.1 : 0.006, hz = pz ? 0.1 : 0.006, len = L * (0.8 + 0.2 * r());
    bx(ctx, c, cx - hx, y + h - 0.45 - len, cz - hz, cx + hx, y + h - 0.45, cz + hz);
  }
  ctx.col.circle(x, z, 0.08, y, y + 3);
}

/** bali_tedung: { at, y, h, mat } — a ceremonial umbrella on a pole, a cone of cloth with a gilded fringe and finial. */
export function tedung(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 3.0, m = el.mat ?? 'cloth_ochre';
  ctx.bag.add('wood_dark', lathe([[0.001, 0], [0.05, 0], [0.04, h]], 6, null, x, y, z));
  ctx.bag.add(m, lathe([[0.001, 0.5], [0.3, 0.3], [0.62, 0.0], [0.7, -0.06]], 12, null, x, y + h, z));
  ctx.bag.add('gilt_bronze', lathe([[0.7, -0.08], [0.7, -0.01], [0.64, -0.01]], 12, null, x, y + h, z));
  ctx.bag.add('gilt_bronze', lathe([[0.001, 0.5], [0.05, 0.52], [0.001, 0.72]], 6, null, x, y + h, z));
  ctx.col.circle(x, z, 0.06, y, y + h);
}

/** bali_gebogan: { at, y } — the tall offering of fruit, cakes and flowers: a cone on a stand, rings of red, yellow and green fruit, a top of flowers. */
export function gebogan(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0, rings = [['cloth_red', 0.26, 0.0], ['cloth_ochre', 0.23, 0.2], ['cloth_green', 0.2, 0.4], ['cloth_red', 0.16, 0.58], ['cloth_white', 0.1, 0.74]];
  ctx.bag.add('wicker', lathe([[0.001, 0], [0.24, 0], [0.3, 0.1], [0.2, 0.12], [0.001, 0.12]], 10, null, x, y, z));
  for (const [m, r, dy] of rings) ctx.bag.add(m, lathe([[0.001, 0.12 + dy], [r, 0.14 + dy], [r * 0.9, 0.3 + dy], [0.001, 0.32 + dy]], 8, null, x, y, z));
  ctx.bag.add('paint_ochre', lathe([[0.001, 0.9], [0.04, 0.92], [0.001, 1.15]], 6, null, x, y, z));
}

/** bali_niches: { a [x, z], b [x, z], y, side (+1 | −1: the wall's face, along the perpendicular), n } — a row of carved niches in a temple wall, each with its small stone figure and a tray. */
export function niches(el, ctx) {
  const [ax, az] = el.a, [bx_, bz] = el.b, alongX = Math.abs(bx_ - ax) >= Math.abs(bz - az), y = el.y ?? 0, s = el.side ?? 1, n = el.n ?? 5, th = el.th ?? 0.6;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = ax + (bx_ - ax) * t, z = az + (bz - az) * t, d = th / 2 + 0.03;
    const R = (u0, u1, v0, v1) => (alongX ? [x + u0, z + s * (d + v0), x + u1, z + s * (d + v1)] : [x + s * (d + v0), z + u0, x + s * (d + v1), z + u1]);
    const put = (m, u0, u1, v0, v1, y0, y1) => { const r = R(u0, u1, v0, v1); bx(ctx, m, Math.min(r[0], r[2]), y0, Math.min(r[1], r[3]), Math.max(r[0], r[2]), y1, Math.max(r[1], r[3])); };
    put('tuff_hewn', -0.5, 0.5, 0, 0.1, y + 0.8, y + 2.0); put('wood_dark', -0.34, 0.34, 0.1, 0.12, y + 0.95, y + 1.85);
    put('tuff_hewn', -0.14, 0.14, 0.12, 0.2, y + 0.95, y + 1.5); put('tuff_hewn', -0.09, 0.09, 0.12, 0.18, y + 1.5, y + 1.72); put('tuff_hewn', -0.6, 0.6, 0, 0.18, y + 0.7, y + 0.8);
    put('tuff_hewn', -0.4, 0.4, 0, 0.12, y + 2.0, y + 2.12);
    const p = alongX ? [x, z + s * (d + 0.14)] : [x + s * (d + 0.14), z]; canang(ctx, p[0], y + 0.8, p[1], i);
  }
}

/** bali_cockpit: { c [x, z], r, y } — the ring of a cockfight (tajen): a low fence of woven bamboo on stakes round a patch of swept earth. */
export function cockpit(el, ctx) {
  const [cx, cz] = el.c, r = el.r ?? 2.2, y = el.y ?? 0, n = 16;
  ctx.bag.add('ground', lathe([[0.001, 0.012], [r - 0.2, 0.012]], 16, null, cx, y, cz));
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, b = (k + 0.85) / n * Math.PI * 2, x0 = cx + Math.cos(a) * r, z0 = cz + Math.sin(a) * r, x1 = cx + Math.cos(b) * r, z1 = cz + Math.sin(b) * r;
    bx(ctx, 'wicker', Math.min(x0, x1) - 0.04, y + 0.12, Math.min(z0, z1) - 0.04, Math.max(x0, x1) + 0.04, y + 0.55, Math.max(z0, z1) + 0.04);
    post(ctx, 'bamboo_culm', x0, z0, y, y + 0.7, 0.03, false);
  }
}

/** bali_pondok: { at [x, z], y, rot } — the field hut (pondok) on posts in the paddies: a raised floor of split bamboo, a thatch roof, a jar of water and a hoe. */
export function pondok(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0, a = 1.1;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) post(ctx, 'bamboo_culm', x + sx * a, z + sz * a, y, y + 2.2, 0.05, false);
  bx(ctx, 'bamboo_culm', x - a - 0.1, y + 0.78, z - a - 0.1, x + a + 0.1, y + 0.85, z + a + 0.1);
  for (const s of [-1, 1]) bx(ctx, 'timber', x - a - 0.1, y + 0.7, z + s * a - 0.04, x + a + 0.1, y + 0.78, z + s * a + 0.04);
  ctx.col.floor([x - a, z - a, x + a, z + a], y + 0.85);
  ctx.bag.add('thatch_palm', lathe([[2.0, 0], [1.6, 0.35], [1.1, 0.8], [0.001, 1.3]], 4).rotateY(Math.PI / 4).translate(x, y + 2.2, z));
  ctx.bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.16, 0.16], [0.1, 0.3]], 8, null, x + 0.6, y + 0.85, z + 0.5));
  bx(ctx, 'reed_mat', x - 0.8, y + 0.85, z - 0.7, x + 0.2, y + 0.875, z + 0.3);
}

/** bali_scarecrow: { at, y, h } — a scarecrow on a bamboo pole with a crosspiece, a straw hat and an old cloth, strips of cloth and a rattle hanging that clatters in the wind. */
export function scarecrow(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.7;
  ctx.bag.add('bamboo_culm', lathe([[0.001, 0], [0.035, 0], [0.03, h]], 5, null, x, y, z));
  bx(ctx, 'bamboo_culm', x - 0.6, y + h - 0.45, z - 0.02, x + 0.6, y + h - 0.41, z + 0.02);
  bx(ctx, 'cloth_brown', x - 0.45, y + h - 1.0, z - 0.02, x + 0.45, y + h - 0.42, z + 0.02);
  ctx.bag.add('thatch', lathe([[0.001, 0.2], [0.25, 0.04], [0.32, 0.0]], 8, null, x, y + h - 0.12, z));
  for (const s of [-1, 1]) bx(ctx, 'cloth_white', x + s * 0.55 - 0.03, y + h - 0.85, z - 0.01, x + s * 0.55 + 0.03, y + h - 0.45, z + 0.01);
}
void box;
