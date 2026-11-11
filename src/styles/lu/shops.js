// The shops of Queli Street and the town's lanes (docs/settlements/lu-qufu.md §6): a row of timber-fronted shops under one grey-tile
// roof, each with its counter, goods, awning and signboard; the trades of a pilgrim town.
import { box, lathe, clothBox, addCloth } from '../../core/geom.js';
import { rectRoof } from '../ming/index.js';
import { rng, lotFrame } from './kit.js';

const TRADES = ['incense', 'paper', 'books', 'rubbings', 'cakes', 'tea', 'cloth', 'pottery', 'brush'];
const AWN = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_blue'];

/** lu_shop_row: { rect, front, n, seed, storeys } — n shops side by side; the front open with a counter and an awning. */
export function shopRow(el, ctx) {
  const rand = rng(el.seed ?? 1), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, n = el.n ?? Math.max(1, Math.round(W / 5.6)), sw = W / n;
  const two = el.storeys === 2, H = two ? 6.3 : 3.5, bag = ctx.bag;
  F.b('brick_paving', -0.2, 0, -1.1, W + 0.2, 0.18, D, false);
  F.b('brick_grey', 0, 0.18, D - 0.4, W, H, D); F.b('brick_grey', 0, 0.18, 0.3, 0.4, H, D); F.b('brick_grey', W - 0.4, 0.18, 0.3, W, H, D);
  for (let i = 0; i <= n; i++) {
    const u = i * sw;
    F.b('lacquer_chestnut', u - 0.13, 0.18, -0.25, u + 0.13, 3.3, 0.05, true);
    if (i > 0 && i < n) F.b('brick_grey', u - 0.15, 0.18, 0.3, u + 0.15, H, D - 0.4);
  }
  F.b('lacquer_chestnut', 0, 3.1, -0.28, W, 3.5, 0.06, false);
  if (two) {
    F.b('plaster_grey', 0, 3.5, 0.0, W, 6.0, 0.3, false);
    for (let i = 0; i < n; i++) F.b('lattice', i * sw + 0.5, 4.0, -0.04, (i + 1) * sw - 0.5, 5.4, 0.04, false);
    F.b('lacquer_chestnut', 0, 5.9, -0.45, W, 6.3, 0.1, false);
  }
  const A = (el.front === 'n' || el.front === 's') ? [W / 2 + 0.7, D / 2 + 0.9] : [D / 2 + 0.9, W / 2 + 0.7];
  const c = F.pt(W / 2, D / 2 - 0.1), alongZ = el.front === 'e' || el.front === 'w';
  rectRoof({ c, A: alongZ ? A[1] : A[0], B: alongZ ? A[0] : A[1], y: H + 0.05, rise: two ? 1.9 : 1.5, kind: 'gable', sweep: 0.3, alongZ, mat: 'tile_grey', soffit: 'lacquer_chestnut' }, bag);
  // the interior back wall is one solid; the visitor stands at the counter
  for (let i = 0; i < n; i++) {
    const u0 = i * sw, trade = TRADES[Math.floor(rand() * TRADES.length)], awn = AWN[Math.floor(rand() * AWN.length)];
    F.b('lacquer_black', u0 + 0.3, 0.18, 0.1, u0 + sw - 0.3, 1.0, 0.7, true);
    const a = F.pt(u0 + 0.2, 0), b = F.pt(u0 + sw - 0.2, -1.0);
    addCloth(bag, awn, clothBox(Math.min(a[0], b[0]), 2.5, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 3.05, Math.max(a[1], b[1]), 0.3), 3.05);
    const put = (u, v, fn) => { const p = F.pt(u, v); fn(p[0], p[1]); };
    if (trade === 'incense') for (let k = 0; k < 6; k++) F.b(k % 2 ? 'cloth_red' : 'wood_ochre', u0 + 0.5 + k * 0.5, 1.0, 0.15, u0 + 0.58 + k * 0.5, 1.9, 0.23, false);
    else if (trade === 'paper' || trade === 'rubbings') for (let k = 0; k < 5; k++) F.b(k % 2 ? 'cloth_white' : 'cloth_grey', u0 + 0.5 + k * 0.6, 1.0, 0.15, u0 + 1.0 + k * 0.6, 1.1 + 0.12 * (k % 3), 0.65, false);
    else if (trade === 'books') for (let k = 0; k < 8; k++) F.b(k % 3 ? 'cloth_indigo' : 'cloth_white', u0 + 0.5 + k * 0.3, 1.0, 0.2, u0 + 0.78 + k * 0.3, 1.0 + 0.12 * (1 + k % 2), 0.55, false);
    else if (trade === 'pottery') for (let k = 0; k < 4; k++) put(u0 + 0.8 + k * 0.8, 0.4, (x, z) => bag.add('pottery_dark', lathe([[0.001, 0], [0.18, 0.05], [0.26, 0.28], [0.18, 0.46], [0.1, 0.5], [0.001, 0.5]], 8, null, x, 1.0, z)));
    else if (trade === 'cakes') for (let k = 0; k < 3; k++) put(u0 + 0.9 + k * 0.9, 0.4, (x, z) => bag.add('wicker', lathe([[0.4, 0], [0.4, 0.12], [0.001, 0.12]], 10, null, x, 1.0, z)));
    else if (trade === 'tea') for (let k = 0; k < 4; k++) put(u0 + 0.7 + k * 0.7, 0.4, (x, z) => bag.add('glaze_white', lathe([[0.001, 0], [0.1, 0.02], [0.14, 0.18], [0.001, 0.18]], 8, null, x, 1.0, z)));
    else if (trade === 'cloth') for (let k = 0; k < 4; k++) F.b(AWN[(k + i) % AWN.length], u0 + 0.5 + k * 0.7, 1.0, 0.1, u0 + 1.0 + k * 0.7, 1.25 + 0.1 * (k % 2), 0.62, false);
    else for (let k = 0; k < 7; k++) F.b('bamboo_culm', u0 + 0.5 + k * 0.4, 1.0, 0.2, u0 + 0.55 + k * 0.4, 1.5, 0.25, false);
    // the signboard hung at the shop's corner: a tall board on its post, red with gilt
    if (rand() < 0.55) { F.b('lacquer_chestnut', u0 + 0.05, 0.18, -0.9, u0 + 0.15, 3.6, -0.8, false); F.b('lacquer_red', u0 - 0.05, 1.8, -0.93, u0 + 0.25, 3.3, -0.87, false); F.b('gilt_bronze', u0 + 0.02, 2.0, -0.935, u0 + 0.18, 3.1, -0.925, false); }
  }
}
