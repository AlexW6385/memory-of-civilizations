// The two markets (docs/settlements/han-changan.md §6): a walled enclosure with a gate in each side, the market office's tower
// (qiting) on its platform with the flag and the drum, rows of shops (liesi) each with its counter, goods and awning.
import { box, lathe, clothBox, addCloth, fromTriangles } from '../../core/geom.js';
import { rng, lotFrame, steps, eaveTilesGable, hipLite } from './kit.js';
import { strings } from './props.js';
import { wall, gate, pavilion } from './walls.js';

const GOODS = ['silk', 'pottery', 'lacquer', 'bronze', 'grain', 'baskets', 'iron', 'cloth'];
const AWN = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_green'];

/** han_shop_row: { rect, front, n, seed } — n shops side by side under one tiled roof; the front (v = 0) open with a counter that leaves a way in (the flap);
 * behind it the room: shelves of the trade's goods along the back, a stool and the ledger table, strings hung from the tie-beam; a blade sign over the lane. */
export function shopRow(el, ctx) {
  const rand = rng(el.seed), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, n = el.n ?? Math.max(1, Math.round(W / 5.2)), sw = W / n, H = 3.2;
  const q = F.V[1] > 0 ? 0 : 2;
  F.b('brick_paving', -0.2, 0, -0.9, W + 0.2, 0.2, D, false);
  F.floor(0.4, -0.9, W - 0.4, D - 0.4, 0.2);
  F.b('earth_wall', 0, 0.2, D - 0.4, W, H, D); F.b('earth_wall', 0, 0.2, 0, 0.4, H, D); F.b('earth_wall', W - 0.4, 0.2, 0, W, H, D);
  for (let i = 0; i <= n; i++) { const u = i * sw; F.b('timber_red', u - 0.14, 0.2, -0.3, u + 0.14, H, 0.0, false); if (i > 0 && i < n) F.b('earth_wall', u - 0.15, 0.2, 0, u + 0.15, H, D - 0.4); }
  F.b('timber_red', 0, H - 0.4, -0.32, W, H, 0.0, false);
  F.b('timber', 0.4, H - 0.15, D / 2 - 0.12, W - 0.4, H, D / 2 + 0.12, false);                          // the tie-beam
  const el2 = F.roof('gable_roof_c', W / 2, D / 2 - 0.1, W / 2 + 0.6, D / 2 + 1.1, H + 0.05, 1.5, { mat: 'tile_grey', soffit: 'timber_red', noHorns: true });
  if (!el2.alongZ) eaveTilesGable(F.bag, el2.c[0], el2.c[1], el2.A, el2.B, H + 0.05);
  // the soot over the doors and the rain streaks on the end walls
  F.b('plaster_streak', 0.4, 0.9, -0.0, 0.46, H - 0.4, 0.0, false);
  for (let i = 0; i < n; i++) {
    const u0 = i * sw, kind = GOODS[Math.floor(rand() * GOODS.length)], awn = AWN[Math.floor(rand() * AWN.length)], mid = u0 + sw / 2;
    // the counter, in two pieces about the opening; the goods behind it, the awning shading the front
    F.b('lacquer_black', u0 + 0.3, 0.2, 0.05, mid - 0.7, 1.05, 0.7, true); F.b('lacquer_black', mid + 0.7, 0.2, 0.05, u0 + sw - 0.3, 1.05, 0.7, true);
    F.b('lacquer_black', mid - 0.7, 0.9, -0.05, mid - 0.6, 1.05, 0.75, false);                          // the lifted flap's hinge
    addCloth(F.bag, awn, clothBox(...(() => { const a = F.pt(u0 + 0.2, -0.0), b = F.pt(u0 + sw - 0.2, -0.9); return [Math.min(a[0], b[0]), H - 0.9, Math.min(a[1], b[1]), Math.max(a[0], b[0]), H - 0.3, Math.max(a[1], b[1])]; })(), 0.3), H - 0.3);
    const put = (u, v, y, fn) => { const p = F.pt(u, v); fn(p[0], y, p[1]); };
    const L = [[u0 + 0.5, mid - 0.8], [mid + 0.8, u0 + sw - 0.5]];
    for (const [a0, a1] of L) {
      const m = Math.max(2, Math.floor((a1 - a0) / 0.55));
      for (let k = 0; k < m; k++) {
        const u = a0 + (k + 0.5) * (a1 - a0) / m;
        if (kind === 'silk' || kind === 'cloth') F.b(AWN[(k + i) % AWN.length], u - 0.24, 1.05, 0.1, u + 0.24, 1.2 + 0.15 * (k % 3), 0.62, false);
        else if (kind === 'pottery' || kind === 'baskets') put(u, 0.4, 1.05, (x, y, z) => F.bag.add(kind === 'pottery' ? 'pottery_dark' : 'wicker', lathe([[0.001, 0], [0.2, 0.05], [0.28, 0.3], [0.2, 0.5], [0.14, 0.55], [0.001, 0.55]], 7, null, x, y, z)));
        else if (kind === 'lacquer') F.b(k % 2 ? 'lacquer_red' : 'lacquer_black', u - 0.22, 1.05, 0.15, u + 0.22, 1.3, 0.6, false);
        else if (kind === 'bronze') put(u, 0.4, 1.05, (x, y, z) => F.bag.add('bronze', lathe([[0.15, 0], [0.12, 0.08], [0.22, 0.22], [0.2, 0.3], [0.001, 0.3]], 7, null, x, y, z)));
        else if (kind === 'iron') F.b('iron', u - 0.05, 1.05, 0.15, u + 0.05, 1.55, 0.2, false);
        else F.b('sacking', u - 0.3, 1.05, 0.15, u + 0.3, 1.45, 0.62, false);
      }
    }
    // the room behind: the shelves along the back wall (three boards, the trade's goods on them), a stool and the ledger table, a vat, strings from the beam
    F.b('wood_dark', u0 + 0.5, 0.2, D - 1.3, u0 + sw - 0.5, 0.25, D - 0.4, false);
    for (const y of [0.55, 1.25, 1.95]) F.b('timber', u0 + 0.5, y + 0.2, D - 1.15, u0 + sw - 0.5, y + 0.26, D - 0.42, false);
    for (const x of [0.5, sw - 0.5]) F.b('timber', u0 + x - 0.05, 0.2, D - 1.15, u0 + x + 0.05, 2.3, D - 0.42, false);
    const gm = { silk: 'cloth_red', cloth: 'cloth_indigo', pottery: 'pottery_dark', baskets: 'wicker', lacquer: 'lacquer_red', bronze: 'bronze', iron: 'iron', grain: 'sacking' }[kind];
    for (const [y, ph] of [[0.45, 0.5], [1.15, 0.5], [1.85, 0.4]]) for (let k = 0; k < 4; k++) if (rand() < 0.85) { const w = 0.35 + rand() * 0.25, u = u0 + 0.7 + k * (sw - 1.4) / 4; F.b(k % 2 && gm !== 'bronze' ? AWN[(i + k) % AWN.length] : gm, u, y + 0.26, D - 1.05, u + w, y + 0.26 + ph * (0.6 + rand() * 0.4), D - 0.55, false); }
    F.b('wood_dark', mid - 0.2, 0.2, D * 0.45, mid + 0.8, 0.2 + 0.12, D * 0.45 + 0.5, false);
    F.b('lacquer_black', mid + 0.9, 0.2, D * 0.45 - 0.3, mid + 1.8, 0.2 + 0.4, D * 0.45 + 0.3, false);
    F.b('bamboo_culm', mid + 1.05, 0.6, D * 0.45 - 0.1, mid + 1.6, 0.66, D * 0.45 + 0.15, false);
    put(u0 + 0.9, D * 0.55, 0.2, (x, y, z) => F.bag.add('pottery_dark', lathe([[0.001, 0], [0.26, 0.02], [0.4, 0.35], [0.42, 0.7], [0.3, 0.98], [0.001, 1.02]], 7, null, x, y, z)));
    { const p = F.pt(u0 + 1.6, D * 0.5); strings(F.bag, p[0], H - 0.15, p[1], q, 2, el.seed + i * 3); }
    // a blade sign over the lane in the trade's colour, a banner on a pole at the corner of some shops
    F.b('timber', u0 + 0.28, 2.95, -0.85, u0 + 0.32, 3.05, -0.0, false);
    F.b(kind === 'silk' || kind === 'lacquer' ? 'lacquer_red' : 'lacquer_black', u0 + 0.2, 1.95, -0.86, u0 + 0.4, 2.95, -0.4, false);
    F.b('gilt_bronze', u0 + 0.19, 2.2, -0.82, u0 + 0.41, 2.35, -0.5, false);
    if (rand() < 0.5) { F.b('timber', u0 + 0.1, 0.2, -0.55, u0 + 0.18, 4.4, -0.47, false); addCloth(F.bag, awn, clothBox(...(() => { const a = F.pt(u0 + 0.18, -0.52), b = F.pt(u0 + 0.7, -0.5); return [Math.min(a[0], b[0]), 3.0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 4.3, Math.max(a[1], b[1])]; })(), 0.3), 4.3); }
    // goods stacked before the counter: baskets, crates, a barrel
    if (rand() < 0.6) { const p = F.pt(u0 + 0.5 + rand() * (sw - 1.0), -1.2 - rand() * 0.2); F.bag.add(kind === 'pottery' ? 'pottery_dark' : 'wicker', lathe([[0.001, 0], [0.3, 0.02], [0.38, 0.35], [0.32, 0.4], [0.001, 0.35]], 7, null, p[0], 0, p[1])); }
  }
  F.col.rect(F.R(0, D - 0.4, W, D), 0.2, H); F.col.rect(F.R(0, 0, 0.4, D), 0.2, H); F.col.rect(F.R(W - 0.4, 0, W, D), 0.2, H);
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
  qiting(t.x, t.z, t.y, ctx);
  bag.add('timber', lathe([[0.12, 0], [0.09, 9]], 6, null, t.x + 4.6, t.y, t.z - 4.6));
  addCloth(bag, 'cloth_red', clothBox(t.x + 4.7, t.y + 6.4, t.z - 4.9, t.x + 4.72, t.y + 8.8, t.z - 4.9 + 2.6, 0.3), t.y + 8.8);
  void rng;
}

/** The market tower (qiting): an open ground floor of posts and rails with the market officer's table, a stair inside (a ramp) up to the upper floor under its own hip roof, with the great drum, the railings and the flag; a skirt roof between. */
function qiting(cx, cz, y, ctx) {
  const { bag, col } = ctx, A = 3.5, H1 = 4.1, y2 = y + H1, post = (x, z, h0, h1, r = 0.22) => { bag.add('timber_red', lathe([[r, h0], [r * 0.92, h1]], 8, null, x, 0, z)); bag.add('bluestone', box(x - 0.34, h0 - 0.02, z - 0.34, x + 0.34, h0 + 0.2, z + 0.34)); };
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 0, 1]) if (sx || sz) { post(cx + sx * A, cz + sz * A, y, y2); col.circle(cx + sx * A, cz + sz * A, 0.26, y, y2); }
  for (const [x0, z0, x1, z1] of [[cx - A - 0.4, cz - A - 0.4, cx + A + 0.4, cz - A + 0.3], [cx - A - 0.4, cz + A - 0.3, cx + A + 0.4, cz + A + 0.4], [cx - A - 0.4, cz - A, cx - A + 0.3, cz + A], [cx + A - 0.3, cz - A, cx + A + 0.4, cz + A]]) bag.add('timber_red', box(x0, y2 - 0.4, z0, x1, y2, z1));
  // the rails of the ground floor (red lacquer, the front side (+z) open at the middle for the way in)
  const rail = (x0, z0, x1, z1) => { bag.add('lacquer_red', box(x0, y + 0.75, z0, x1, y + 0.9, z1)); bag.add('lacquer_red', box(x0, y + 0.35, z0, x1, y + 0.42, z1)); col.rect([x0, z0, x1, z1], y, y + 1.0); };
  rail(cx - A, cz - A - 0.05, cx + A, cz - A + 0.05); rail(cx - A - 0.05, cz - A, cx - A + 0.05, cz + A); rail(cx + A - 0.05, cz - A, cx + A + 0.05, cz + A);
  rail(cx - A, cz + A - 0.05, cx - 1.2, cz + A + 0.05);
  // the floor of the ground room, the officer's table and mat, the stair along the east side
  col.floor([cx - A, cz - A, cx + A, cz + A], y);
  bag.add('reed_mat', box(cx - 2.6, y + 0.01, cz + 0.2, cx - 0.4, y + 0.04, cz + 2.4)); bag.add('lacquer_black', box(cx - 2.2, y + 0.04, cz + 0.4, cx - 0.9, y + 0.42, cz + 1.2));
  for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'wood_ochre' : 'bamboo_culm', box(cx - 2.0 + k * 0.22, y + 0.42, cz + 0.55, cx - 1.85 + k * 0.22, y + 0.7, cz + 0.95));
  const B = A - 0.9, sx0 = cx + 1.4, sx1 = cx + 2.5, zA = cz + A - 0.4, zB = cz - B + 0.4, nst = 22;
  for (let k = 0; k < nst; k++) { const za = zA + (zB - zA) * k / nst, zb = zA + (zB - zA) * (k + 1) / nst; bag.add('wood_dark', box(sx0, y, Math.min(za, zb), sx1, y + H1 * (k + 1) / nst, Math.max(za, zb))); }
  col.ramp([sx0, zB, sx1, zA], y, y2, 'n');
  // the upper floor: a slab with the stair's opening
  const slab = (x0, z0, x1, z1) => { bag.add('wood_dark', box(x0, y2 - 0.22, z0, x1, y2, z1)); col.floor([x0, z0, x1, z1], y2); };
  slab(cx - A - 0.3, cz - A - 0.3, cx + A + 0.3, zB); slab(cx - A - 0.3, zB, sx0, cz + A + 0.3); slab(sx1, zB, cx + A + 0.3, cz + A + 0.3);
  // the skirt roof between the floors, round the upper storey
  const sk = (cond) => cond; void sk;
  const T = [], U = [], o = A + 2.0, i0 = A - 0.2, yo = y2 - 0.5, yi = y2 + 0.9;
  const quad = (arr, a, b, c, d) => arr.push(...a, ...b, ...c, ...a, ...c, ...d);
  const sides = [[[-o, -o], [o, -o], [i0, -i0], [-i0, -i0]], [[o, -o], [o, o], [i0, i0], [i0, -i0]], [[o, o], [-o, o], [-i0, i0], [i0, i0]], [[-o, o], [-o, -o], [-i0, -i0], [-i0, i0]]];
  for (const [p, q2, r, s2] of sides) { const P = (v, yy) => [cx + v[0], yy, cz + v[1]]; quad(T, P(p, yo), P(r, yi), P(s2, yi), P(q2, yo)); quad(U, P(p, yo - 0.2), P(q2, yo - 0.2), P(s2, yi - 0.2), P(r, yi - 0.2)); }
  bag.add('tile_grey', fromTriangles(T)); bag.add('timber_red', fromTriangles(U));
  // the upper storey: posts, railings of lattice, the roof; the great drum on its stand, the officer's chair
  const yU = y2 + 0.05;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { post(cx + sx * B, cz + sz * B, yU, yU + 3.4, 0.18); col.circle(cx + sx * B, cz + sz * B, 0.22, yU, yU + 3.4); }
  bag.add('timber_red', box(cx - B - 0.3, yU + 3.0, cz - B - 0.3, cx + B + 0.3, yU + 3.4, cz + B + 0.3));
  for (const [x0, z0, x1, z1] of [[cx - B, cz - B, cx + B, cz - B + 0.1], [cx - B, cz + B - 0.1, cx + B, cz + B], [cx - B, cz - B, cx - B + 0.1, cz + B], [cx + B - 0.1, cz - B, cx + B, cz + B]]) { bag.add('lattice', box(x0, yU + 0.9, z0, x1, yU + 2.2, z1)); bag.add('lacquer_red', box(x0, yU + 0.7, z0, x1, yU + 0.9, z1)); }
  col.rect([cx - B, cz - B, cx + B, cz - B + 0.1], yU, yU + 1.2); col.rect([cx - B, cz + B - 0.1, cx + B, cz + B], yU, yU + 1.2); col.rect([cx - B, cz - B, cx - B + 0.1, cz + B], yU, yU + 1.2); col.rect([cx + B - 0.1, cz - B, cx + B, cz + B], yU, yU + 1.2);
  hipLite({ c: [cx, cz], A: B + 1.9, B: B + 1.9, y: yU + 3.3, rise: 2.8, lift: 0.4, pow: 1.2, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, alongZ: false }, ctx);
  bag.add('tile_dark', box(cx - 0.3, yU + 6.0, cz - 0.3, cx + 0.3, yU + 6.9, cz + 0.3));
  const dr = lathe([[0.001, -0.7], [0.55, -0.65], [0.72, -0.25], [0.72, 0.25], [0.55, 0.65], [0.001, 0.7]], 12); dr.rotateZ(Math.PI / 2); dr.translate(cx - 0.8, yU + 1.15, cz - 0.8);
  bag.add('lacquer_red', dr);
  for (const s of [-1, 1]) bag.add('timber_red', box(cx - 0.8 + s * 0.75 - 0.06, yU, cz - 0.9, cx - 0.8 + s * 0.75 + 0.06, yU + 1.25, cz - 0.7));
  col.rect([cx - 1.7, cz - 1.0, cx - 0.1, cz - 0.6], yU, yU + 1.3);
  bag.add('lacquer_black', box(cx + 0.3, yU + 0.25, cz + 0.2, cx + 1.3, yU + 0.45, cz + 1.0));
}
