// The two markets (docs/settlements/han-changan.md §6): a walled enclosure with a gate in each side, the market office's tower
// (qiting) on its platform with the flag and the drum, rows of shops (liesi) each with its counter, goods and awning.
import { box, lathe, clothBox, addCloth } from '../../core/geom.js';
import { rng, lotFrame, steps, eaveTilesGable } from './kit.js';
import { wall, gate, pavilion } from './walls.js';

const GOODS = ['silk', 'pottery', 'lacquer', 'bronze', 'grain', 'baskets', 'iron', 'cloth'];
const AWN = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_green'];

/** han_shop_row: { rect, front, n, seed } — n shops side by side under one tiled roof; the front (v = 0) open with a counter. */
export function shopRow(el, ctx) {
  const rand = rng(el.seed), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, n = el.n ?? Math.max(1, Math.round(W / 5.2)), sw = W / n, H = 3.2;
  F.b('brick_paving', -0.2, 0, -0.9, W + 0.2, 0.2, D, false);
  F.b('earth_wall', 0, 0.2, D - 0.4, W, H, D); F.b('earth_wall', 0, 0.2, 0, 0.4, H, D); F.b('earth_wall', W - 0.4, 0.2, 0, W, H, D);
  for (let i = 0; i <= n; i++) { const u = i * sw; F.b('timber_red', u - 0.14, 0.2, -0.3, u + 0.14, H, 0.0, false); if (i > 0 && i < n) F.b('earth_wall', u - 0.15, 0.2, 0, u + 0.15, H, D - 0.4); }
  F.b('timber_red', 0, H - 0.4, -0.32, W, H, 0.0, false);
  const el2 = F.roof('gable_roof_c', W / 2, D / 2 - 0.1, W / 2 + 0.6, D / 2 + 1.1, H + 0.05, 1.5, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
  if (!el2.alongZ) eaveTilesGable(F.bag, el2.c[0], el2.c[1], el2.A, el2.B, H + 0.05);
  F.col.rect(F.R(0, D - 0.4, W, D), 0.2, H); F.col.rect(F.R(0, 0, 0.4, D), 0.2, H); F.col.rect(F.R(W - 0.4, 0, W, D), 0.2, H);
  for (let i = 0; i < n; i++) {
    const u0 = i * sw, kind = GOODS[Math.floor(rand() * GOODS.length)], awn = AWN[Math.floor(rand() * AWN.length)];
    // the counter on the front, the goods behind it, the awning shading the front
    F.b('lacquer_black', u0 + 0.3, 0.2, 0.05, u0 + sw - 0.3, 1.05, 0.7, true);
    addCloth(F.bag, awn, clothBox(...(() => { const a = F.pt(u0 + 0.2, -0.0), b = F.pt(u0 + sw - 0.2, -0.9); return [Math.min(a[0], b[0]), H - 0.9, Math.min(a[1], b[1]), Math.max(a[0], b[0]), H - 0.3, Math.max(a[1], b[1])]; })(), 0.3), H - 0.3);
    const put = (u, v, y, fn) => { const p = F.pt(u, v); fn(p[0], y, p[1]); };
    if (kind === 'silk' || kind === 'cloth') for (let k = 0; k < 5; k++) F.b(AWN[(k + i) % AWN.length], u0 + 0.5 + k * 0.7, 1.05, 0.1, u0 + 1.0 + k * 0.7, 1.2 + 0.15 * (k % 3), 0.62, false);
    else if (kind === 'pottery' || kind === 'baskets') for (let k = 0; k < 4; k++) put(u0 + 0.8 + k * 0.9, 0.4, 1.05, (x, y, z) => F.bag.add(kind === 'pottery' ? 'pottery_dark' : 'wicker', lathe([[0.001, 0], [0.2, 0.05], [0.28, 0.3], [0.2, 0.5], [0.14, 0.55], [0.001, 0.55]], 8, null, x, y, z)));
    else if (kind === 'lacquer') for (let k = 0; k < 5; k++) F.b(k % 2 ? 'lacquer_red' : 'lacquer_black', u0 + 0.5 + k * 0.75, 1.05, 0.15, u0 + 1.0 + k * 0.75, 1.3, 0.6, false);
    else if (kind === 'bronze') for (let k = 0; k < 4; k++) put(u0 + 0.8 + k * 0.9, 0.4, 1.05, (x, y, z) => F.bag.add('bronze', lathe([[0.15, 0], [0.12, 0.08], [0.22, 0.22], [0.2, 0.3], [0.001, 0.3]], 8, null, x, y, z)));
    else if (kind === 'iron') for (let k = 0; k < 5; k++) F.b('iron', u0 + 0.5 + k * 0.7, 1.05, 0.15, u0 + 0.6 + k * 0.7, 1.55, 0.2, false);
    else for (let k = 0; k < 3; k++) F.b('sacking', u0 + 0.6 + k * 1.0, 0.2, 1.2 + (k % 2) * 0.8, u0 + 1.4 + k * 1.0, 0.9, 1.8 + (k % 2) * 0.8, false);
    // a banner on a pole at the corner of some shops
    if (rand() < 0.35) { F.b('timber', u0 + 0.1, 0.2, -0.55, u0 + 0.18, 4.4, -0.47, false); addCloth(F.bag, 'cloth_red', clothBox(...(() => { const a = F.pt(u0 + 0.18, -0.52), b = F.pt(u0 + 0.7, -0.5); return [Math.min(a[0], b[0]), 3.0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 4.3, Math.max(a[1], b[1])]; })(), 0.3), 4.3); }
  }
}

/** han_market: { rect, gates: { n, s, e, w: centre }, h, th, seed } — the walls, the four gates, the market tower (qiting) on its platform in the middle. */
export function market(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, th = el.th ?? 2.4, h = el.h ?? 5, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, gw = 11;
  const g = el.gates ?? { n: cx, s: cx, e: cz, w: cz };
  wall({ a: [x0 + th / 2, z0 + th / 2], b: [x1 - th / 2, z0 + th / 2], th, h, gaps: [{ at: g.n - x0 - th / 2, w: gw }] }, ctx);
  wall({ a: [x0 + th / 2, z1 - th / 2], b: [x1 - th / 2, z1 - th / 2], th, h, gaps: [{ at: g.s - x0 - th / 2, w: gw }] }, ctx);
  wall({ a: [x0 + th / 2, z0 + th], b: [x0 + th / 2, z1 - th], th, h, gaps: [{ at: g.w - z0 - th, w: gw }] }, ctx);
  wall({ a: [x1 - th / 2, z0 + th], b: [x1 - th / 2, z1 - th], th, h, gaps: [{ at: g.e - z0 - th, w: gw }] }, ctx);
  gate({ c: [g.n, z0 + th / 2], axis: 'x', th, h, n: 1, pw: 5, ph: 4, mat: 'earth_wall' }, ctx);
  gate({ c: [g.s, z1 - th / 2], axis: 'x', th, h, n: 1, pw: 5, ph: 4 }, ctx);
  gate({ c: [x0 + th / 2, g.w], axis: 'z', th, h, n: 1, pw: 5, ph: 4 }, ctx);
  gate({ c: [x1 - th / 2, g.e], axis: 'z', th, h, n: 1, pw: 5, ph: 4 }, ctx);
  // the tower (qiting): a platform of rammed earth with steps, the tower of two tiers, the flag, the drum
  const t = { x: cx, z: cz, a: 6.5, y: 2.6 };
  bag.add('earth_wall', box(t.x - t.a, -0.3, t.z - t.a, t.x + t.a, t.y, t.z + t.a)); col.rect([t.x - t.a, t.z - t.a, t.x + t.a, t.z + t.a], -0.3, t.y);
  bag.add('brick_paving', box(t.x - t.a, t.y - 0.02, t.z - t.a, t.x + t.a, t.y + 0.02, t.z + t.a)); col.floor([t.x - t.a, t.z - t.a, t.x + t.a, t.z + t.a], t.y);
  bag.add('bluestone', box(t.x - t.a - 0.2, t.y - 0.3, t.z - t.a - 0.2, t.x + t.a + 0.2, t.y, t.z + t.a + 0.2));
  steps(bag, col, [t.x - 2, t.z + t.a, t.x + 2, t.z + t.a + 5.4], 0, t.y, 'n', 'bluestone', 0.18, -0.3);
  pavilion({ c: [t.x, t.z], A: 3.6, B: 3.6, y: t.y, h: 3.8, tiers: 2, walls: true }, ctx);
  bag.add('timber', lathe([[0.12, 0], [0.09, 9]], 6, null, t.x + 4.6, t.y, t.z - 4.6));
  addCloth(bag, 'cloth_red', clothBox(t.x + 4.7, t.y + 6.4, t.z - 4.9, t.x + 4.72, t.y + 8.8, t.z - 4.9 + 2.6, 0.3), t.y + 8.8);
  bag.add('lacquer_red', lathe([[0.001, 0], [0.6, 0.1], [0.75, 0.6], [0.6, 1.1], [0.001, 1.15]], 10, null, t.x - 4.8, t.y + 0.05, t.z + 4.6));   // the drum
  void rng;
}
